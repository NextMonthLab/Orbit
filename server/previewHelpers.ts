import dns from "dns/promises";
import { randomUUID } from "crypto";

// SSRF protection: validate URL safety
export async function validateUrlSafety(url: string): Promise<{ safe: boolean; error?: string; domain?: string }> {
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    return { safe: false, error: "Invalid URL format" };
  }

  // Only allow http/https
  if (parsedUrl.protocol !== "https:" && parsedUrl.protocol !== "http:") {
    return { safe: false, error: "Only HTTP and HTTPS URLs are allowed" };
  }

  // Block internal/private hostnames and IPs
  const hostname = parsedUrl.hostname.toLowerCase();
  const blockedPatterns = [
    /^localhost$/i,
    /^127\./,
    /^10\./,
    /^192\.168\./,
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
    /^169\.254\./,
    /^0\./,
    /\.local$/i,
    /\.internal$/i,
    /\.localhost$/i,
    /^metadata\./i,
    /^169\.254\.169\.254$/,
  ];

  if (blockedPatterns.some(pattern => pattern.test(hostname))) {
    return { safe: false, error: "URLs to internal or private networks are not allowed" };
  }

  // Block IPv4 address literals
  if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
    return { safe: false, error: "Direct IP addresses are not allowed" };
  }

  // Block IPv6 address literals
  if (hostname.startsWith('[') || /^[0-9a-f:]+$/i.test(hostname)) {
    return { safe: false, error: "IPv6 addresses are not allowed" };
  }

  // DNS resolution check
  try {
    const addresses = await dns.lookup(hostname, { all: true });
    for (const addr of addresses) {
      const ip = addr.address;
      if (addr.family === 4) {
        if (
          ip.startsWith('127.') ||
          ip.startsWith('10.') ||
          ip.startsWith('192.168.') ||
          /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(ip) ||
          ip.startsWith('169.254.') ||
          ip.startsWith('0.')
        ) {
          return { safe: false, error: "URL resolves to a private network address" };
        }
      }
    }
  } catch (dnsError) {
    console.error("DNS lookup error:", dnsError);
    return { safe: false, error: "Could not resolve URL hostname" };
  }

  // Extract domain (remove www. if present)
  const domain = hostname.replace(/^www\./, '');

  return { safe: true, domain };
}

// Lightweight site ingestion (max 4 pages, 80k chars total)
export async function ingestSitePreview(url: string): Promise<{
  title: string;
  summary: string;
  keyServices: string[];
  totalChars: number;
  pagesIngested: number;
}> {
  const maxPages = 4;
  const maxChars = 80000;
  const maxCharsPerPage = 20000;

  let totalChars = 0;
  let pagesIngested = 0;
  let allText = '';
  let title = '';

  try {
    // Fetch main page
    const response = await fetch(url, {
      headers: { "User-Agent": "NextScene-Preview/1.0" },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();

    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch) {
      title = titleMatch[1].trim();
    }

    // Basic HTML to text
    const pageText = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "")
      .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "")
      .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/\s+/g, " ")
      .trim()
      .substring(0, maxCharsPerPage);

    allText += pageText + "\n\n";
    totalChars += pageText.length;
    pagesIngested = 1;

    // Extract key services (very basic - look for common patterns)
    const servicePatterns = [
      /we (offer|provide|deliver|specialize in|help with|support) ([^.!?]{10,80})/gi,
      /our (services|solutions|products|offerings) (include|are|:) ([^.!?]{10,80})/gi,
    ];

    const keyServices: Set<string> = new Set();
    for (const pattern of servicePatterns) {
      const matches = pageText.matchAll(pattern);
      for (const match of matches) {
        if (keyServices.size < 5) {
          const service = match[2] || match[3];
          if (service) {
            keyServices.add(service.trim().substring(0, 80));
          }
        }
      }
    }

    // Generate summary (first 3 paragraphs or 500 chars)
    const summary = allText.substring(0, 500).split('\n').slice(0, 3).join('\n').trim();

    return {
      title: title || new URL(url).hostname,
      summary: summary || "Business website",
      keyServices: Array.from(keyServices).slice(0, 5),
      totalChars,
      pagesIngested,
    };
  } catch (error: any) {
    console.error("Site ingestion error:", error);
    throw new Error(`Failed to ingest site: ${error.message}`);
  }
}

export function generatePreviewId(): string {
  return randomUUID();
}

export function calculateExpiresAt(): Date {
  const now = new Date();
  return new Date(now.getTime() + 48 * 60 * 60 * 1000); // 48 hours
}
