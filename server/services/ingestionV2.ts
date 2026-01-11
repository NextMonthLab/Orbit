import { storage } from '../storage';
import * as schema from '@shared/schema';
import { validateUrlSafety } from '../previewHelpers';
import { deepScrapeUrl } from './deepScraper';
import crypto from 'crypto';

export interface IngestionV2Options {
  mode: schema.IngestionMode;
  userUrls?: string[];
  maxPages?: number;
  onStatus?: (status: string) => void;
  forceRefresh?: boolean;
}

export interface DiscoverySources {
  robotsTxt?: {
    found: boolean;
    sitemaps: string[];
    disallowed: string[];
    crawlDelay?: number;
  };
  sitemap?: {
    found: boolean;
    urls: string[];
  };
  jsonLd?: {
    found: boolean;
    type?: string;
    data?: Record<string, unknown>;
  };
  homepage?: {
    found: boolean;
    links: string[];
  };
}

export interface IngestionEvidence {
  traceId: string;
  nm_policyVersion: string;
  nm_ingest: {
    mode: schema.IngestionMode;
    discoverySources: string[];
    pagesPlanned: number;
    pagesFetched: number;
    pagesUsed: number;
    cacheHits: number;
    cacheMisses: number;
    outcome: schema.IngestionOutcome;
    frictionSignals: string[];
    domainRiskScore: number;
    durationMs: number;
  };
}

export interface IngestionV2Result {
  success: boolean;
  outcome: schema.IngestionOutcome;
  evidence: IngestionEvidence;
  pages: {
    url: string;
    html: string;
    fromCache: boolean;
  }[];
  discoveredUrls: string[];
  blockedReason?: string;
  runId?: number;
}

const FRICTION_CODES = [403, 429, 503, 451];
const MAX_PAGES_LIGHT = 12;
const MAX_PAGES_STANDARD = 25;
const URL_CACHE_TTL_HOURS = 24;

const USER_AGENT = 'NextMonthBot/1.0 (+https://nextmonth.io/bot-info; respectful crawler)';

export async function runIngestionV2(
  businessSlug: string,
  rootUrl: string,
  options: IngestionV2Options
): Promise<IngestionV2Result> {
  const traceId = crypto.randomUUID();
  const startTime = Date.now();
  const notify = options.onStatus || (() => {});
  
  const mode = options.mode;
  const maxPages = options.maxPages || (mode === 'light' ? MAX_PAGES_LIGHT : MAX_PAGES_STANDARD);
  
  const evidence: IngestionEvidence = {
    traceId,
    nm_policyVersion: '1.1.0',
    nm_ingest: {
      mode,
      discoverySources: [],
      pagesPlanned: 0,
      pagesFetched: 0,
      pagesUsed: 0,
      cacheHits: 0,
      cacheMisses: 0,
      outcome: 'success',
      frictionSignals: [],
      domainRiskScore: 0,
      durationMs: 0,
    },
  };
  
  const pages: IngestionV2Result['pages'] = [];
  const discoveredUrls: string[] = [];
  let blockedReason: string | undefined;
  
  try {
    const parsedUrl = new URL(rootUrl);
    const hostname = parsedUrl.hostname;
    const baseUrl = `${parsedUrl.protocol}//${parsedUrl.host}`;
    
    const domainRisk = await storage.getDomainRisk(hostname);
    if (domainRisk) {
      evidence.nm_ingest.domainRiskScore = domainRisk.frictionCount;
      
      if (domainRisk.recommendedDelayMs > 30000) {
        notify(`Domain has high friction score (${domainRisk.frictionCount}), proceeding carefully...`);
      }
    }
    
    const run = await storage.createIngestionRun({
      businessSlug,
      traceId,
      mode,
      outcome: 'success',
      discoverySources: [],
    });
    
    notify('Starting discovery phase...');
    
    const discovery: DiscoverySources = {};
    
    if (mode !== 'user_assisted') {
      const robotsResult = await fetchRobotsTxt(baseUrl, hostname);
      discovery.robotsTxt = robotsResult;
      if (robotsResult.found) {
        evidence.nm_ingest.discoverySources.push('robots.txt');
        notify(`Found robots.txt with ${robotsResult.sitemaps.length} sitemap(s)`);
        
        if (robotsResult.crawlDelay && robotsResult.crawlDelay > 0) {
          await storage.updateDomainRisk(hostname, {
            recommendedDelayMs: Math.max(robotsResult.crawlDelay * 1000, 2000),
          });
        }
      }
      
      const sitemapUrls = robotsResult.sitemaps.length > 0 
        ? robotsResult.sitemaps 
        : [`${baseUrl}/sitemap.xml`];
      
      for (const sitemapUrl of sitemapUrls.slice(0, 2)) {
        const sitemapResult = await fetchSitemap(sitemapUrl, hostname);
        if (sitemapResult.found && sitemapResult.urls.length > 0) {
          discovery.sitemap = sitemapResult;
          evidence.nm_ingest.discoverySources.push('sitemap');
          notify(`Found sitemap with ${sitemapResult.urls.length} URLs`);
          discoveredUrls.push(...sitemapResult.urls);
          break;
        }
      }
    }
    
    let urlsToFetch: string[] = [];
    
    if (mode === 'user_assisted' && options.userUrls) {
      urlsToFetch = options.userUrls.slice(0, maxPages);
      evidence.nm_ingest.discoverySources.push('user_list');
    } else if (discovery.sitemap?.urls.length) {
      urlsToFetch = sampleFromSitemap(discovery.sitemap.urls, maxPages);
      urlsToFetch = [rootUrl, ...urlsToFetch.filter(u => u !== rootUrl)];
    } else {
      urlsToFetch = [rootUrl];
      evidence.nm_ingest.discoverySources.push('homepage');
    }
    
    const disallowedPaths = discovery.robotsTxt?.disallowed || [];
    urlsToFetch = urlsToFetch.filter(url => {
      try {
        const parsed = new URL(url);
        return !disallowedPaths.some(path => parsed.pathname.startsWith(path));
      } catch {
        return false;
      }
    });
    
    evidence.nm_ingest.pagesPlanned = urlsToFetch.length;
    
    const delay = domainRisk?.recommendedDelayMs || 2000;
    let frictionDetected = false;
    let consecutiveFriction = 0;
    
    for (let i = 0; i < urlsToFetch.length && !frictionDetected; i++) {
      const url = urlsToFetch[i];
      
      const cached = options.forceRefresh ? null : await storage.getValidUrlFetchCache(url);
      if (cached) {
        evidence.nm_ingest.cacheHits++;
        notify(`Cache hit: ${url.substring(0, 50)}...`);
        continue;
      }
      
      evidence.nm_ingest.cacheMisses++;
      
      if (i > 0) {
        await sleep(delay);
      }
      
      notify(`Fetching (${i + 1}/${urlsToFetch.length}): ${url.substring(0, 50)}...`);
      
      const fetchResult = await fetchWithFrictionDetection(url, hostname);
      evidence.nm_ingest.pagesFetched++;
      
      if (fetchResult.friction) {
        consecutiveFriction++;
        evidence.nm_ingest.frictionSignals.push(`${fetchResult.status}:${url}`);
        
        await storage.recordDomainFriction(hostname, fetchResult.status);
        
        if (fetchResult.isBotProtection) {
          blockedReason = `Bot protection detected (HTTP ${fetchResult.status})`;
          evidence.nm_ingest.outcome = 'blocked';
          frictionDetected = true;
          notify(`Blocked by bot protection at ${url}`);
        } else if (consecutiveFriction >= 2) {
          blockedReason = `Multiple friction signals (${consecutiveFriction}x)`;
          evidence.nm_ingest.outcome = 'partial';
          frictionDetected = true;
          notify(`Stopping due to repeated friction signals`);
        }
      } else {
        consecutiveFriction = 0;
        
        if (fetchResult.html && fetchResult.html.length > 100) {
          pages.push({
            url,
            html: fetchResult.html,
            fromCache: false,
          });
          evidence.nm_ingest.pagesUsed++;
          
          const contentHash = crypto.createHash('sha256').update(fetchResult.html).digest('hex').substring(0, 16);
          await storage.upsertUrlFetchCache({
            url,
            hostname,
            contentHash,
            contentLength: fetchResult.html.length,
            lastHttpStatus: fetchResult.status,
            expiresAt: new Date(Date.now() + URL_CACHE_TTL_HOURS * 60 * 60 * 1000),
          });
          
          await storage.recordDomainSuccess(hostname);
        }
        
        if (i === 0 && fetchResult.html) {
          const homepageLinks = extractInternalLinks(fetchResult.html, baseUrl);
          discovery.homepage = { found: true, links: homepageLinks };
          
          if (!discovery.sitemap?.found && homepageLinks.length > 0) {
            const prioritized = prioritizeUrls(homepageLinks, maxPages - 1);
            urlsToFetch.push(...prioritized.filter(u => !urlsToFetch.includes(u)));
            evidence.nm_ingest.pagesPlanned = urlsToFetch.length;
          }
          
          const jsonLd = extractJsonLd(fetchResult.html);
          if (jsonLd) {
            discovery.jsonLd = { found: true, type: typeof jsonLd['@type'] === 'string' ? jsonLd['@type'] : undefined, data: jsonLd };
            evidence.nm_ingest.discoverySources.push('json-ld');
          }
        }
      }
    }
    
    if (pages.length === 0 && evidence.nm_ingest.outcome !== 'blocked') {
      evidence.nm_ingest.outcome = 'error';
      blockedReason = 'No usable pages fetched';
    } else if (pages.length < urlsToFetch.length * 0.5 && evidence.nm_ingest.outcome === 'success') {
      evidence.nm_ingest.outcome = 'partial';
    }
    
    evidence.nm_ingest.durationMs = Date.now() - startTime;
    
    await storage.completeIngestionRun(run.id, {
      discoverySources: evidence.nm_ingest.discoverySources,
      pagesPlanned: evidence.nm_ingest.pagesPlanned,
      pagesFetched: evidence.nm_ingest.pagesFetched,
      pagesUsed: evidence.nm_ingest.pagesUsed,
      cacheHits: evidence.nm_ingest.cacheHits,
      cacheMisses: evidence.nm_ingest.cacheMisses,
      outcome: evidence.nm_ingest.outcome,
      frictionSignals: evidence.nm_ingest.frictionSignals,
      domainRiskScore: evidence.nm_ingest.domainRiskScore,
      durationMs: evidence.nm_ingest.durationMs,
      lastError: blockedReason,
    });
    
    return {
      success: evidence.nm_ingest.outcome !== 'error' && evidence.nm_ingest.outcome !== 'blocked',
      outcome: evidence.nm_ingest.outcome,
      evidence,
      pages,
      discoveredUrls,
      blockedReason,
      runId: run.id,
    };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    evidence.nm_ingest.outcome = 'error';
    evidence.nm_ingest.durationMs = Date.now() - startTime;
    
    return {
      success: false,
      outcome: 'error',
      evidence,
      pages,
      discoveredUrls,
      blockedReason: errorMessage,
    };
  }
}

async function fetchRobotsTxt(baseUrl: string, hostname: string): Promise<DiscoverySources['robotsTxt'] & { found: boolean }> {
  const result = { found: false, sitemaps: [] as string[], disallowed: [] as string[], crawlDelay: undefined as number | undefined };
  
  try {
    const robotsUrl = `${baseUrl}/robots.txt`;
    const response = await fetch(robotsUrl, {
      headers: { 'User-Agent': USER_AGENT },
      signal: AbortSignal.timeout(5000),
    });
    
    if (!response.ok) return result;
    
    const text = await response.text();
    result.found = true;
    
    const lines = text.split('\n');
    let inUserAgentSection = false;
    
    for (const line of lines) {
      const trimmed = line.trim().toLowerCase();
      
      if (trimmed.startsWith('user-agent:')) {
        const agent = trimmed.substring(11).trim();
        inUserAgentSection = agent === '*' || agent.includes('nextmonth');
      }
      
      if (trimmed.startsWith('sitemap:')) {
        const sitemapUrl = line.substring(line.indexOf(':') + 1).trim();
        if (sitemapUrl.startsWith('http')) {
          result.sitemaps.push(sitemapUrl);
        }
      }
      
      if (inUserAgentSection && trimmed.startsWith('disallow:')) {
        const path = trimmed.substring(9).trim();
        if (path && path !== '/') {
          result.disallowed.push(path);
        }
      }
      
      if (inUserAgentSection && trimmed.startsWith('crawl-delay:')) {
        const delay = parseInt(trimmed.substring(12).trim(), 10);
        if (!isNaN(delay) && delay > 0) {
          result.crawlDelay = delay;
        }
      }
    }
  } catch {
  }
  
  return result;
}

async function fetchSitemap(sitemapUrl: string, hostname: string): Promise<DiscoverySources['sitemap'] & { found: boolean }> {
  const result = { found: false, urls: [] as string[] };
  
  try {
    const response = await fetch(sitemapUrl, {
      headers: { 'User-Agent': USER_AGENT },
      signal: AbortSignal.timeout(10000),
    });
    
    if (!response.ok) return result;
    
    const text = await response.text();
    
    if (text.includes('<sitemapindex')) {
      const nestedMatches = Array.from(text.matchAll(/<loc>([^<]+)<\/loc>/gi));
      for (const match of nestedMatches) {
        if (match[1].includes('sitemap') && result.urls.length < 3) {
          const nestedResult = await fetchSitemap(match[1], hostname);
          if (nestedResult.found) {
            result.urls.push(...nestedResult.urls);
          }
        }
        if (result.urls.length >= 100) break;
      }
    } else {
      const locMatches = Array.from(text.matchAll(/<loc>([^<]+)<\/loc>/gi));
      for (const match of locMatches) {
        const url = match[1].trim();
        if (url.includes(hostname) && !url.includes('#')) {
          result.urls.push(url);
        }
        if (result.urls.length >= 200) break;
      }
    }
    
    if (result.urls.length > 0) {
      result.found = true;
    }
  } catch {
  }
  
  return result;
}

function sampleFromSitemap(urls: string[], maxCount: number): string[] {
  const priorityPatterns = [
    /\/(about|team|company)/i,
    /\/(services?|what-we-do)/i,
    /\/(products?|catalogue|catalog|menu)/i,
    /\/(pricing|prices|fees)/i,
    /\/(contact|locations?|find-us)/i,
    /\/(faq|help|support)/i,
    /\/(testimonials?|reviews?)/i,
    /\/(blog|news|articles?)\/[^/]+$/i,
  ];
  
  const priority: string[] = [];
  const others: string[] = [];
  
  for (const url of urls) {
    const matches = priorityPatterns.some(p => p.test(url));
    if (matches && priority.length < maxCount * 0.7) {
      priority.push(url);
    } else {
      others.push(url);
    }
  }
  
  const remaining = maxCount - priority.length;
  const shuffled = others.sort(() => Math.random() - 0.5).slice(0, remaining);
  
  return [...priority, ...shuffled];
}

function extractInternalLinks(html: string, baseUrl: string): string[] {
  const links: string[] = [];
  const matches = Array.from(html.matchAll(/href=["']([^"']+)["']/gi));
  
  const baseHostname = new URL(baseUrl).hostname;
  
  for (const match of matches) {
    const href = match[1];
    
    if (href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('#') || href.startsWith('javascript:')) {
      continue;
    }
    
    try {
      const fullUrl = new URL(href, baseUrl);
      if (fullUrl.hostname === baseHostname && !links.includes(fullUrl.href)) {
        links.push(fullUrl.href);
      }
    } catch {
    }
    
    if (links.length >= 100) break;
  }
  
  return links;
}

function prioritizeUrls(urls: string[], maxCount: number): string[] {
  const priorities: { url: string; score: number }[] = [];
  
  const patterns: [RegExp, number][] = [
    [/\/(about|team|company|who-we-are)/i, 10],
    [/\/(services?|what-we-do|solutions?)/i, 9],
    [/\/(products?|catalogue|catalog|menu|shop)/i, 9],
    [/\/(pricing|prices|fees|plans?)/i, 8],
    [/\/(contact|locations?|find-us)/i, 7],
    [/\/(faq|help|questions)/i, 6],
    [/\/(testimonials?|reviews?|success-stories)/i, 5],
    [/\/(blog|news)$/i, 3],
  ];
  
  for (const url of urls) {
    let score = 0;
    for (const [pattern, points] of patterns) {
      if (pattern.test(url)) {
        score = Math.max(score, points);
      }
    }
    if (url.split('/').length <= 4) score += 2;
    priorities.push({ url, score });
  }
  
  return priorities
    .sort((a, b) => b.score - a.score)
    .slice(0, maxCount)
    .map(p => p.url);
}

function extractJsonLd(html: string): Record<string, unknown> | null {
  try {
    const match = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([^<]+)<\/script>/i);
    if (match && match[1]) {
      return JSON.parse(match[1].trim());
    }
  } catch {
  }
  return null;
}

interface FetchResult {
  html: string;
  status: number;
  friction: boolean;
  isBotProtection: boolean;
}

async function fetchWithFrictionDetection(url: string, hostname: string): Promise<FetchResult> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      signal: AbortSignal.timeout(15000),
      redirect: 'follow',
    });
    
    const status = response.status;
    const friction = FRICTION_CODES.includes(status);
    const html = await response.text();
    
    const botProtectionPatterns = [
      /cloudflare/i,
      /captcha/i,
      /cf-ray/i,
      /challenge-running/i,
      /just a moment/i,
      /ddos-guard/i,
      /checking your browser/i,
      /access denied/i,
      /blocked/i,
    ];
    
    const isBotProtection = friction || botProtectionPatterns.some(p => p.test(html.substring(0, 5000)));
    
    return { html, status, friction: friction || isBotProtection, isBotProtection };
  } catch (error) {
    return { html: '', status: 0, friction: true, isBotProtection: false };
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function generateIngestionSummary(evidence: IngestionEvidence): string {
  const { nm_ingest } = evidence;
  const lines: string[] = [];
  
  lines.push(`Mode: ${nm_ingest.mode}`);
  lines.push(`Discovery: ${nm_ingest.discoverySources.join(', ') || 'none'}`);
  lines.push(`Pages: ${nm_ingest.pagesUsed}/${nm_ingest.pagesFetched} used (${nm_ingest.pagesPlanned} planned)`);
  lines.push(`Cache: ${nm_ingest.cacheHits} hits, ${nm_ingest.cacheMisses} misses`);
  lines.push(`Outcome: ${nm_ingest.outcome}`);
  lines.push(`Duration: ${(nm_ingest.durationMs / 1000).toFixed(1)}s`);
  
  if (nm_ingest.frictionSignals.length > 0) {
    lines.push(`Friction: ${nm_ingest.frictionSignals.length} signal(s)`);
  }
  
  return lines.join('\n');
}
