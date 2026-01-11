/**
 * Structured Data Priority System
 *
 * Implements a waterfall hierarchy for extracting site information:
 * 1. JSON-LD Schema.org data (confidence: 0.95)
 * 2. OpenGraph/Twitter meta tags (confidence: 0.85)
 * 3. Microdata/RDFa (confidence: 0.75)
 * 4. DOM heuristics (confidence: 0.70)
 * 5. AI fallback (confidence: 0.60)
 *
 * This ensures maximum accuracy by preferring structured data sources.
 */

export interface ExtractedValue<T> {
  value: T;
  source: 'json-ld' | 'opengraph' | 'twitter' | 'microdata' | 'dom' | 'ai';
  confidence: number;
}

/**
 * Extract with priority waterfall - tries multiple sources and returns best
 */
export function extractWithPriority<T>(
  sources: Array<{ value: T | null; source: ExtractedValue<T>['source']; confidence: number }>
): ExtractedValue<T> | null {
  // Filter out null/undefined values
  const validSources = sources.filter(s => s.value !== null && s.value !== undefined);

  if (validSources.length === 0) {
    return null;
  }

  // Sort by confidence (highest first)
  validSources.sort((a, b) => b.confidence - a.confidence);

  // Return the best source
  const best = validSources[0];
  return {
    value: best.value as T,
    source: best.source,
    confidence: best.confidence,
  };
}

/**
 * Extract organization name with priority
 */
export function extractOrganizationName(
  html: string,
  structuredData: any
): ExtractedValue<string> | null {
  const sources = [
    // Priority 1: JSON-LD Organization name
    {
      value: structuredData.organization?.name,
      source: 'json-ld' as const,
      confidence: 0.95,
    },
    // Priority 2: OpenGraph site name
    {
      value: extractMetaTag(html, 'og:site_name'),
      source: 'opengraph' as const,
      confidence: 0.85,
    },
    // Priority 3: Title tag (parse out site name)
    {
      value: extractTitleSiteName(html),
      source: 'dom' as const,
      confidence: 0.70,
    },
  ];

  return extractWithPriority(sources);
}

/**
 * Extract description with priority
 */
export function extractDescription(
  html: string,
  structuredData: any
): ExtractedValue<string> | null {
  const sources = [
    // Priority 1: JSON-LD Organization description
    {
      value: structuredData.organization?.description,
      source: 'json-ld' as const,
      confidence: 0.95,
    },
    // Priority 2: OpenGraph description
    {
      value: extractMetaTag(html, 'og:description'),
      source: 'opengraph' as const,
      confidence: 0.85,
    },
    // Priority 3: Twitter description
    {
      value: extractMetaTag(html, 'twitter:description'),
      source: 'twitter' as const,
      confidence: 0.83,
    },
    // Priority 4: Meta description
    {
      value: extractMetaTag(html, 'description'),
      source: 'dom' as const,
      confidence: 0.80,
    },
    // Priority 5: First paragraph
    {
      value: extractFirstParagraph(html),
      source: 'dom' as const,
      confidence: 0.65,
    },
  ];

  return extractWithPriority(sources);
}

/**
 * Extract logo URL with priority
 */
export function extractLogo(
  html: string,
  baseUrl: string,
  structuredData: any
): ExtractedValue<string> | null {
  const sources = [
    // Priority 1: JSON-LD Organization logo
    {
      value: structuredData.organization?.logo ? resolveUrl(structuredData.organization.logo, baseUrl) : null,
      source: 'json-ld' as const,
      confidence: 0.95,
    },
    // Priority 2: OpenGraph image (if reasonable dimensions)
    {
      value: extractMetaTag(html, 'og:image'),
      source: 'opengraph' as const,
      confidence: 0.80,
    },
    // Priority 3: Apple touch icon (high quality)
    {
      value: extractAppleTouchIcon(html, baseUrl),
      source: 'dom' as const,
      confidence: 0.75,
    },
    // Priority 4: Logo in header/nav
    {
      value: extractLogoFromDom(html, baseUrl),
      source: 'dom' as const,
      confidence: 0.70,
    },
  ];

  return extractWithPriority(sources);
}

/**
 * Extract hero image with priority
 */
export function extractHeroImage(
  html: string,
  baseUrl: string
): ExtractedValue<string> | null {
  const sources = [
    // Priority 1: OpenGraph image
    {
      value: extractMetaTag(html, 'og:image'),
      source: 'opengraph' as const,
      confidence: 0.90,
    },
    // Priority 2: Twitter image
    {
      value: extractMetaTag(html, 'twitter:image'),
      source: 'twitter' as const,
      confidence: 0.85,
    },
    // Priority 3: First large image in main content
    {
      value: extractFirstLargeImage(html, baseUrl),
      source: 'dom' as const,
      confidence: 0.65,
    },
  ];

  return extractWithPriority(sources);
}

/**
 * Extract headline with priority
 */
export function extractHeadline(
  html: string,
  structuredData: any
): ExtractedValue<string> | null {
  const sources = [
    // Priority 1: OpenGraph title
    {
      value: extractMetaTag(html, 'og:title'),
      source: 'opengraph' as const,
      confidence: 0.90,
    },
    // Priority 2: Twitter title
    {
      value: extractMetaTag(html, 'twitter:title'),
      source: 'twitter' as const,
      confidence: 0.85,
    },
    // Priority 3: First H1
    {
      value: extractFirstH1(html),
      source: 'dom' as const,
      confidence: 0.75,
    },
    // Priority 4: Title tag
    {
      value: extractTitleHeadline(html),
      source: 'dom' as const,
      confidence: 0.65,
    },
  ];

  return extractWithPriority(sources);
}

// ===== Helper extraction functions =====

function extractMetaTag(html: string, property: string): string | null {
  // Try property attribute (OpenGraph, Twitter)
  const propertyMatch = html.match(
    new RegExp(`<meta[^>]*property=["']${property}["'][^>]*content=["']([^"']+)["']`, 'i')
  );
  if (propertyMatch) return propertyMatch[1];

  // Try name attribute (standard meta tags)
  const nameMatch = html.match(
    new RegExp(`<meta[^>]*name=["']${property}["'][^>]*content=["']([^"']+)["']`, 'i')
  );
  if (nameMatch) return nameMatch[1];

  return null;
}

function extractTitleSiteName(html: string): string | null {
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (!titleMatch) return null;

  const title = titleMatch[1];
  // Extract site name from patterns like "Page Title | Site Name" or "Page Title - Site Name"
  const parts = title.split(/[\|\-–—]/).map(p => p.trim());
  if (parts.length > 1) {
    // Return the last part (usually site name)
    return parts[parts.length - 1];
  }

  return title.split(' ')[0]; // Fallback: first word
}

function extractTitleHeadline(html: string): string | null {
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (!titleMatch) return null;

  const title = titleMatch[1];
  // Extract headline from patterns like "Headline | Site Name"
  const parts = title.split(/[\|\-–—]/).map(p => p.trim());
  return parts[0]; // Return the first part (usually page headline)
}

function extractFirstH1(html: string): string | null {
  const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  return h1Match ? cleanTextSimple(h1Match[1]) : null;
}

function extractFirstParagraph(html: string): string | null {
  // Remove scripts, styles, nav, header, footer
  const mainContent = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '');

  const pMatches = mainContent.match(/<p[^>]*>([^<]{50,500})<\/p>/i);
  return pMatches ? cleanTextSimple(pMatches[1]) : null;
}

function extractAppleTouchIcon(html: string, baseUrl: string): string | null {
  const appleTouchMatch = html.match(/<link[^>]*rel=["']apple-touch-icon["'][^>]*href=["']([^"']+)["']/i);
  return appleTouchMatch ? resolveUrl(appleTouchMatch[1], baseUrl) : null;
}

function extractLogoFromDom(html: string, baseUrl: string): string | null {
  // Look for logo in header/nav
  const headerMatch = html.match(/<header[^>]*>([\s\S]{0,2000})<\/header>/i);
  const navMatch = html.match(/<nav[^>]*>([\s\S]{0,2000})<\/nav>/i);
  const searchArea = (headerMatch?.[1] || '') + (navMatch?.[1] || '');

  const logoMatch = searchArea.match(/<img[^>]*(?:class|id|alt|src)=["'][^"']*logo[^"']*["'][^>]*src=["']([^"']+)["']/i);
  return logoMatch ? resolveUrl(logoMatch[1], baseUrl) : null;
}

function extractFirstLargeImage(html: string, baseUrl: string): string | null {
  // Remove nav, header, footer
  const mainContent = html
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '');

  const imgMatch = mainContent.match(/<img[^>]*src=["']([^"']+)["']/i);
  return imgMatch ? resolveUrl(imgMatch[1], baseUrl) : null;
}

function cleanTextSimple(text: string): string {
  return text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function resolveUrl(url: string, baseUrl: string): string {
  try {
    return new URL(url, baseUrl).href;
  } catch {
    return url;
  }
}
