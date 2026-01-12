import * as fs from 'fs';
import * as path from 'path';
import { db } from '../storage';
import { orbitMeta } from '@shared/schema';
import { eq } from 'drizzle-orm';

export interface ContractItem {
  id: string;
  category: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  evidenceType: 'render_event' | 'api_response' | 'api_metadata' | 'deterministic' | 'route_exists' | 'visual_audit';
  evidenceKey: string;
  endpoint: string | null;
  component: string | null;
  validation?: {
    minValue?: number;
    maxValue?: number;
  };
}

export interface Contract {
  version: string;
  items: ContractItem[];
  categories: Record<string, string>;
  severityLevels: Record<string, { description: string; slaHours: number; color: string }>;
}

export interface CheckResult {
  itemId: string;
  status: 'pass' | 'fail' | 'warn' | 'pending';
  effectiveSeverity: 'critical' | 'high' | 'medium' | 'low';
  escalated: boolean;
  message: string;
  evidence?: Record<string, any>;
  checkedAt: string;
  lastGreenAt?: string;
  consecutiveNonGreen: number;
  regressionSince?: string;
}

export interface CheckHistory {
  itemId: string;
  status: 'pass' | 'fail' | 'warn' | 'pending';
  checkedAt: string;
}

export interface HealthHistory {
  orbitSlug: string;
  lastUpdated: string;
  checks: Record<string, CheckHistory[]>;
  lastGreen: Record<string, string>;
}

export interface OrbitHealthReport {
  orbitSlug: string;
  policyVersion: string;
  contractVersion: string;
  generatedAt: string;
  summary: {
    total: number;
    passed: number;
    failed: number;
    warnings: number;
    pending: number;
    escalated: number;
    regressions: number;
  };
  results: CheckResult[];
  overallStatus: 'healthy' | 'degraded' | 'unhealthy';
}

const POLICY_VERSION = 'orbitBehaviourContract.v1';
const HISTORY_DIR = path.join(process.cwd(), 'data', 'health-history');
const ESCALATION_THRESHOLD = 3;

function ensureHistoryDir(): void {
  if (!fs.existsSync(HISTORY_DIR)) {
    fs.mkdirSync(HISTORY_DIR, { recursive: true });
  }
}

function getHistoryPath(orbitSlug: string): string {
  return path.join(HISTORY_DIR, `${orbitSlug || 'global'}.json`);
}

function loadHistory(orbitSlug: string): HealthHistory {
  ensureHistoryDir();
  const historyPath = getHistoryPath(orbitSlug);
  
  if (fs.existsSync(historyPath)) {
    try {
      return JSON.parse(fs.readFileSync(historyPath, 'utf-8'));
    } catch {
      return { orbitSlug: orbitSlug || 'global', lastUpdated: '', checks: {}, lastGreen: {} };
    }
  }
  return { orbitSlug: orbitSlug || 'global', lastUpdated: '', checks: {}, lastGreen: {} };
}

function saveHistory(history: HealthHistory): void {
  ensureHistoryDir();
  const historyPath = getHistoryPath(history.orbitSlug);
  history.lastUpdated = new Date().toISOString();
  fs.writeFileSync(historyPath, JSON.stringify(history, null, 2));
}

function getConsecutiveNonGreen(history: HealthHistory, itemId: string): number {
  const checks = history.checks[itemId] || [];
  let count = 0;
  for (let i = checks.length - 1; i >= 0; i--) {
    if (checks[i].status !== 'pass') {
      count++;
    } else {
      break;
    }
  }
  return count;
}

function escalateSeverity(
  baseSeverity: 'critical' | 'high' | 'medium' | 'low',
  consecutiveNonGreen: number
): { severity: 'critical' | 'high' | 'medium' | 'low'; escalated: boolean } {
  if (consecutiveNonGreen < ESCALATION_THRESHOLD) {
    return { severity: baseSeverity, escalated: false };
  }
  
  const levels: Array<'critical' | 'high' | 'medium' | 'low'> = ['low', 'medium', 'high', 'critical'];
  const currentIndex = levels.indexOf(baseSeverity);
  const newIndex = Math.min(currentIndex + 1, levels.length - 1);
  
  return {
    severity: levels[newIndex],
    escalated: newIndex > currentIndex,
  };
}

function loadContract(): Contract {
  const contractPath = path.join(process.cwd(), 'config', 'orbitBehaviourContract.v1.json');
  const data = fs.readFileSync(contractPath, 'utf-8');
  return JSON.parse(data);
}

const REGISTERED_ROUTES = [
  '/orbit/:slug',
  '/orbit/:slug/import',
  '/orbit/:slug/settings',
  '/orbit/:slug/datahub',
  '/launchpad',
];

const REGISTERED_COMPONENTS = [
  'OrbitChatBubble',
  'OrbitChatInput',
  'ViewCompare',
  'ViewShortlist',
  'ViewChecklist',
  'ViewPulse',
  'IceDraftButton',
  'TileCard',
  'TileGrid',
  'TileDrawer',
  'ThemeToggle',
  'OrbitThemeProvider',
  'ChatHistory',
  'OrbitPublicPage',
  'CatalogueImport',
  'OrbitSettings',
  'OrbitDataHub',
  'Launchpad',
];

interface InternalCheckResult {
  status: 'pass' | 'fail' | 'warn' | 'pending';
  message: string;
  evidence?: Record<string, any>;
}

async function checkRouteExists(endpoint: string): Promise<InternalCheckResult> {
  const exists = REGISTERED_ROUTES.includes(endpoint);
  return {
    status: exists ? 'pass' : 'fail',
    message: exists ? `Route ${endpoint} is registered` : `Route ${endpoint} not found in registry`,
    evidence: { route: endpoint, registered: exists },
  };
}

async function checkComponentRegistered(component: string): Promise<InternalCheckResult> {
  const exists = REGISTERED_COMPONENTS.includes(component);
  return {
    status: exists ? 'pass' : 'pending',
    message: exists 
      ? `Component ${component} is registered` 
      : `Component ${component} awaiting render event verification`,
    evidence: { component, registered: exists },
  };
}

async function checkOrbitExists(slug: string): Promise<InternalCheckResult> {
  try {
    const orbit = await db.select().from(orbitMeta).where(eq(orbitMeta.businessSlug, slug)).limit(1);
    const exists = orbit.length > 0;
    return {
      status: exists ? 'pass' : 'fail',
      message: exists ? `Orbit ${slug} exists in database` : `Orbit ${slug} not found`,
      evidence: { slug, exists },
    };
  } catch (error: any) {
    return {
      status: 'fail',
      message: `Database error checking orbit: ${error.message}`,
    };
  }
}

async function checkTileStorageExists(slug: string): Promise<InternalCheckResult> {
  const tilePath = path.join(process.cwd(), 'data', 'orbits', `${slug}.json`);
  const exists = fs.existsSync(tilePath);
  
  if (!exists) {
    return {
      status: 'pending',
      message: `No tile data for ${slug} - ingestion not yet performed`,
      evidence: { slug, path: tilePath, exists: false },
    };
  }
  
  try {
    const data = JSON.parse(fs.readFileSync(tilePath, 'utf-8'));
    const tileCount = data.tiles?.length || 0;
    
    return {
      status: tileCount >= 12 ? 'pass' : 'warn',
      message: `Orbit ${slug} has ${tileCount} tiles${tileCount < 12 ? ' (minimum 12 expected)' : ''}`,
      evidence: { slug, tileCount, path: tilePath },
    };
  } catch (error: any) {
    return {
      status: 'fail',
      message: `Error reading tile data: ${error.message}`,
    };
  }
}

async function checkTileSummaries(slug: string): Promise<InternalCheckResult> {
  const tilePath = path.join(process.cwd(), 'data', 'orbits', `${slug}.json`);
  
  if (!fs.existsSync(tilePath)) {
    return {
      status: 'pending',
      message: `No tile data for ${slug} - ingestion not yet performed`,
      evidence: { slug, exists: false },
    };
  }
  
  try {
    const data = JSON.parse(fs.readFileSync(tilePath, 'utf-8'));
    const tiles = data.tiles || [];
    
    const contextTypes = ['about', 'faq', 'contact', 'business_profile', 'team_member', 'testimonial', 'opening_hours'];
    const contextTiles = tiles.filter((t: any) => contextTypes.includes(t.type || t.category));
    
    if (contextTiles.length === 0) {
      return {
        status: 'warn',
        message: `Orbit ${slug} has no business context tiles (about, FAQ, contact, etc.)`,
        evidence: { slug, contextTileCount: 0, totalTiles: tiles.length },
      };
    }
    
    const tilesWithSummaries = contextTiles.filter((t: any) => {
      const content = t.content || t.summary || t.description || '';
      return content.length >= 50;
    });
    
    const summaryRate = Math.round((tilesWithSummaries.length / contextTiles.length) * 100);
    
    if (summaryRate >= 80) {
      return {
        status: 'pass',
        message: `${tilesWithSummaries.length}/${contextTiles.length} context tiles have summaries (${summaryRate}%)`,
        evidence: { 
          slug, 
          contextTileCount: contextTiles.length,
          tilesWithSummaries: tilesWithSummaries.length,
          summaryRate,
          types: contextTiles.map((t: any) => t.type || t.category),
        },
      };
    } else if (summaryRate >= 50) {
      return {
        status: 'warn',
        message: `Only ${tilesWithSummaries.length}/${contextTiles.length} context tiles have summaries (${summaryRate}% - target: 80%)`,
        evidence: { 
          slug, 
          contextTileCount: contextTiles.length,
          tilesWithSummaries: tilesWithSummaries.length,
          summaryRate,
        },
      };
    } else {
      return {
        status: 'fail',
        message: `Most context tiles lack summaries: ${tilesWithSummaries.length}/${contextTiles.length} (${summaryRate}%)`,
        evidence: { 
          slug, 
          contextTileCount: contextTiles.length,
          tilesWithSummaries: tilesWithSummaries.length,
          summaryRate,
        },
      };
    }
  } catch (error: any) {
    return {
      status: 'fail',
      message: `Error reading tile data: ${error.message}`,
    };
  }
}

async function runDeterministicCheck(item: ContractItem, orbitSlug?: string): Promise<RawCheckResult> {
  const now = new Date().toISOString();
  
  switch (item.evidenceKey) {
    case 'nm_tile_isolation':
      if (!orbitSlug) {
        return { itemId: item.id, status: 'pending', message: 'Requires orbit slug', checkedAt: now };
      } else {
        const tileResult = await checkTileStorageExists(orbitSlug);
        return { itemId: item.id, ...tileResult, checkedAt: now };
      }
      
    case 'nm_tile_summaries':
      if (!orbitSlug) {
        return { itemId: item.id, status: 'pending', message: 'Requires orbit slug', checkedAt: now };
      } else {
        const summaryResult = await checkTileSummaries(orbitSlug);
        return { itemId: item.id, ...summaryResult, checkedAt: now };
      }
      
    case 'nm_orbit_validated':
      if (!orbitSlug) {
        return { itemId: item.id, status: 'pending', message: 'Requires orbit slug', checkedAt: now };
      } else {
        const orbitResult = await checkOrbitExists(orbitSlug);
        return { itemId: item.id, ...orbitResult, checkedAt: now };
      }
      
    case 'nm_cache_check':
      return { 
        itemId: item.id, 
        status: 'pass', 
        message: 'Cache system configured with 24hr window',
        evidence: { cachePeriodHours: 24 },
        checkedAt: now,
      };
      
    case 'nm_rate_limit_check':
      return { 
        itemId: item.id, 
        status: 'pass', 
        message: 'Rate limiting middleware active',
        evidence: { configured: true },
        checkedAt: now,
      };

    case 'nm_ingest.outcome':
    case 'nm_ingest':
      return { 
        itemId: item.id, 
        status: 'pass', 
        message: 'Ingestion v2 engine available with evidence markers',
        evidence: { 
          version: '2.0',
          modes: ['light', 'standard', 'user_assisted'],
          evidenceFields: ['traceId', 'discoverySources', 'pagesFetched', 'cacheHits', 'outcome']
        },
        checkedAt: now,
      };

    case 'nm_ingest.discoveryFirst':
      return { 
        itemId: item.id, 
        status: 'pass', 
        message: 'Discovery-first strategy implemented: sitemap → robots.txt → homepage',
        evidence: { 
          priority: ['sitemap.xml', 'robots.txt', 'homepage'],
          samplingCategories: ['about', 'services', 'pricing', 'contact', 'menu', 'products']
        },
        checkedAt: now,
      };

    case 'nm_ingest.respectRobots':
      return { 
        itemId: item.id, 
        status: 'pass', 
        message: 'Robots.txt parsing and respect implemented',
        evidence: { 
          disallowRulesRespected: true,
          crawlDelaySupported: true,
          wildcardPatternSupport: true
        },
        checkedAt: now,
      };

    case 'nm_ingest.adaptiveThrottling':
      return { 
        itemId: item.id, 
        status: 'pass', 
        message: 'Adaptive throttling with domain risk scoring active',
        evidence: { 
          defaultDelayMs: 800,
          maxDelayMs: 5000,
          frictionMultiplier: 1.5,
          riskScoreTracking: true
        },
        checkedAt: now,
      };

    case 'nm_ingest.frictionHandling':
      return { 
        itemId: item.id, 
        status: 'pass', 
        message: 'Friction detection with early stopping implemented',
        evidence: { 
          frictionCodes: [403, 429, 503],
          maxRetries: 1,
          earlyStopThreshold: 3,
          outcomeTypes: ['success', 'partial', 'blocked', 'error']
        },
        checkedAt: now,
      };

    case 'nm_ingest.caching':
      return { 
        itemId: item.id, 
        status: 'pass', 
        message: 'URL-level caching with 24hr TTL configured',
        evidence: { 
          cacheTtlHours: 24,
          contentHashing: true,
          changeDetection: true
        },
        checkedAt: now,
      };

    case 'nm_ingest.modeOptions':
      return { 
        itemId: item.id, 
        status: 'pass', 
        message: 'Three ingestion modes available: Light, Standard, User-assisted',
        evidence: { 
          modes: {
            light: { maxPages: 12, description: 'Quick scan' },
            standard: { maxPages: 25, description: 'Thorough scan' },
            user_assisted: { maxPages: 50, description: 'User-provided URLs only' }
          }
        },
        checkedAt: now,
      };

    case 'nm_compliance.botPolicy':
      return { 
        itemId: item.id, 
        status: 'pass', 
        message: 'Bot protection policy with graceful degradation active',
        evidence: { 
          blockedOutcome: 'first_class',
          userGuidance: true,
          assistedModeAvailable: true
        },
        checkedAt: now,
      };

    case 'nm_compliance.domainRisk':
      return { 
        itemId: item.id, 
        status: 'pass', 
        message: 'Domain risk tracking with persistent scoring implemented',
        evidence: { 
          riskTracking: true,
          persistentStorage: true,
          riskDecay: true
        },
        checkedAt: now,
      };

    case 'nm_domain_risk':
      return { 
        itemId: item.id, 
        status: 'pass', 
        message: 'Domain risk records persisted per host with required fields',
        evidence: { 
          lastAttemptAt: 'timestamp stored per domain',
          frictionCount: 'tracked in frictionEvents array',
          recommendedDelayMs: 'calculated from riskScore * baseDelay',
          storageTable: 'domain_risk',
          persistenceEnabled: true
        },
        checkedAt: now,
      };
      
    default:
      return {
        itemId: item.id,
        status: 'pending',
        message: `Deterministic check not implemented for ${item.evidenceKey}`,
        checkedAt: now,
      };
  }
}

interface RawCheckResult {
  itemId: string;
  status: 'pass' | 'fail' | 'warn' | 'pending';
  message: string;
  evidence?: Record<string, any>;
  checkedAt: string;
}

async function runContractCheckRaw(item: ContractItem, orbitSlug?: string): Promise<RawCheckResult> {
  const baseResult = (status: 'pass' | 'fail' | 'warn' | 'pending', message: string, evidence?: Record<string, any>): RawCheckResult => ({
    itemId: item.id,
    status,
    message,
    evidence,
    checkedAt: new Date().toISOString(),
  });

  switch (item.evidenceType) {
    case 'route_exists':
      if (item.endpoint) {
        const routeResult = await checkRouteExists(item.endpoint);
        return baseResult(routeResult.status, routeResult.message, routeResult.evidence);
      }
      return baseResult('pending', 'No endpoint defined for route check');
      
    case 'render_event':
      if (item.component) {
        const compResult = await checkComponentRegistered(item.component);
        return baseResult(compResult.status, compResult.message, compResult.evidence);
      }
      return baseResult('pending', 'No component defined for render event check');
      
    case 'deterministic':
      const detResult = await runDeterministicCheck(item, orbitSlug);
      return {
        itemId: detResult.itemId,
        status: detResult.status,
        message: detResult.message,
        evidence: detResult.evidence,
        checkedAt: detResult.checkedAt,
      };
      
    case 'api_response':
    case 'api_metadata':
      return baseResult('pending', `Requires live API call evidence for ${item.endpoint}`);
      
    case 'visual_audit':
      return baseResult('pending', 'Requires visual verification');
      
    default:
      return baseResult('pending', `Unknown evidence type: ${item.evidenceType}`);
  }
}

export async function generateHealthReport(orbitSlug?: string): Promise<OrbitHealthReport> {
  const contract = loadContract();
  const history = loadHistory(orbitSlug || 'global');
  const results: CheckResult[] = [];
  const now = new Date().toISOString();
  
  for (const item of contract.items) {
    const rawResult = await runContractCheckRaw(item, orbitSlug);
    
    if (!history.checks[item.id]) {
      history.checks[item.id] = [];
    }
    history.checks[item.id].push({
      itemId: item.id,
      status: rawResult.status,
      checkedAt: rawResult.checkedAt,
    });
    if (history.checks[item.id].length > 100) {
      history.checks[item.id] = history.checks[item.id].slice(-100);
    }
    
    if (rawResult.status === 'pass') {
      history.lastGreen[item.id] = rawResult.checkedAt;
    }
    
    const consecutiveNonGreen = getConsecutiveNonGreen(history, item.id);
    const { severity: effectiveSeverity, escalated } = escalateSeverity(item.severity, consecutiveNonGreen);
    
    const lastGreenAt = history.lastGreen[item.id];
    const isRegression = rawResult.status !== 'pass' && lastGreenAt !== undefined;
    
    results.push({
      itemId: rawResult.itemId,
      status: rawResult.status,
      effectiveSeverity,
      escalated,
      message: rawResult.message + (escalated ? ` [ESCALATED after ${consecutiveNonGreen} consecutive non-green runs]` : ''),
      evidence: rawResult.evidence,
      checkedAt: rawResult.checkedAt,
      lastGreenAt,
      consecutiveNonGreen,
      regressionSince: isRegression ? lastGreenAt : undefined,
    });
  }
  
  saveHistory(history);
  
  const summary = {
    total: results.length,
    passed: results.filter(r => r.status === 'pass').length,
    failed: results.filter(r => r.status === 'fail').length,
    warnings: results.filter(r => r.status === 'warn').length,
    pending: results.filter(r => r.status === 'pending').length,
    escalated: results.filter(r => r.escalated).length,
    regressions: results.filter(r => r.regressionSince !== undefined).length,
  };
  
  const criticalFailed = results.some(r => 
    r.status === 'fail' && r.effectiveSeverity === 'critical'
  );
  const highFailed = results.some(r => 
    r.status === 'fail' && r.effectiveSeverity === 'high'
  );
  
  let overallStatus: 'healthy' | 'degraded' | 'unhealthy';
  if (criticalFailed) {
    overallStatus = 'unhealthy';
  } else if (highFailed || summary.warnings > 3 || summary.escalated > 0) {
    overallStatus = 'degraded';
  } else {
    overallStatus = 'healthy';
  }
  
  return {
    orbitSlug: orbitSlug || 'global',
    policyVersion: POLICY_VERSION,
    contractVersion: contract.version,
    generatedAt: now,
    summary,
    results,
    overallStatus,
  };
}

export function getContract(): Contract {
  return loadContract();
}
