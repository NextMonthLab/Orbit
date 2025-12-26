import { ObjectStorageService } from "./replit_integrations/object_storage";

interface ExtractedImage {
  url: string;
  altText: string | null;
  caption: string | null;
  width: number | null;
  height: number | null;
  context: string | null;
  isOpenGraph: boolean;
  isTwitterCard: boolean;
  isJsonLd: boolean;
  score: number;
}

interface ImageExtractionResult {
  images: ExtractedImage[];
  pageTitle: string | null;
  pageDescription: string | null;
  sourceUrl: string;
}

const AD_DOMAINS = [
  'doubleclick.net',
  'googlesyndication.com',
  'googleadservices.com',
  'facebook.com/tr',
  'amazon-adsystem.com',
  'adsrvr.org',
  'criteo.com',
  'taboola.com',
  'outbrain.com',
  'quantserve.com',
  'scorecardresearch.com',
  'serving-sys.com',
  'adsafeprotected.com',
  'moatads.com',
  'chartbeat.com',
  'omtrdc.net',
  'analytics.',
  'tracking.',
  '/pixel.',
  '/1x1.',
  'cdn.embedly.com/widgets',
  'platform.twitter.com/widgets',
  'connect.facebook.net',
];

const ICON_PATTERNS = [
  /favicon/i,
  /logo/i,
  /icon/i,
  /sprite/i,
  /avatar/i,
  /badge/i,
  /button/i,
  /social/i,
  /emoji/i,
  /arrow/i,
  /check/i,
  /close/i,
  /menu/i,
  /search/i,
  /share/i,
  /twitter/i,
  /facebook/i,
  /linkedin/i,
  /instagram/i,
  /pinterest/i,
  /youtube/i,
  /reddit/i,
  /whatsapp/i,
  /telegram/i,
];

const MIN_WIDTH = 200;
const MIN_HEIGHT = 150;
const MIN_ASPECT_RATIO = 0.3;
const MAX_ASPECT_RATIO = 3.0;

function isAdUrl(url: string): boolean {
  return AD_DOMAINS.some(domain => url.toLowerCase().includes(domain));
}

function isIconUrl(url: string): boolean {
  return ICON_PATTERNS.some(pattern => pattern.test(url));
}

function resolveUrl(src: string, baseUrl: string): string | null {
  try {
    if (src.startsWith('data:')) return null;
    if (src.startsWith('//')) return `https:${src}`;
    if (src.startsWith('http://') || src.startsWith('https://')) return src;
    const base = new URL(baseUrl);
    if (src.startsWith('/')) {
      return `${base.protocol}//${base.host}${src}`;
    }
    return new URL(src, baseUrl).href;
  } catch {
    return null;
  }
}

function extractOpenGraphImages(html: string): ExtractedImage[] {
  const images: ExtractedImage[] = [];
  const ogImagePattern = /<meta\s+(?:[^>]*?\s)?property=["']og:image["'][^>]*?content=["']([^"']+)["'][^>]*>/gi;
  const ogImageAltPattern = /<meta\s+(?:[^>]*?\s)?property=["']og:image:alt["'][^>]*?content=["']([^"']+)["'][^>]*>/gi;
  
  let match;
  while ((match = ogImagePattern.exec(html)) !== null) {
    const url = match[1];
    let altMatch = ogImageAltPattern.exec(html);
    images.push({
      url,
      altText: altMatch ? altMatch[1] : null,
      caption: null,
      width: null,
      height: null,
      context: 'OpenGraph meta tag',
      isOpenGraph: true,
      isTwitterCard: false,
      isJsonLd: false,
      score: 80,
    });
  }
  
  return images;
}

function extractTwitterCardImages(html: string): ExtractedImage[] {
  const images: ExtractedImage[] = [];
  const twitterImagePattern = /<meta\s+(?:[^>]*?\s)?(?:name|property)=["']twitter:image(?::src)?["'][^>]*?content=["']([^"']+)["'][^>]*>/gi;
  
  let match;
  while ((match = twitterImagePattern.exec(html)) !== null) {
    images.push({
      url: match[1],
      altText: null,
      caption: null,
      width: null,
      height: null,
      context: 'Twitter Card meta tag',
      isOpenGraph: false,
      isTwitterCard: true,
      isJsonLd: false,
      score: 75,
    });
  }
  
  return images;
}

function extractJsonLdImages(html: string): ExtractedImage[] {
  const images: ExtractedImage[] = [];
  const jsonLdPattern = /<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  
  let match;
  while ((match = jsonLdPattern.exec(html)) !== null) {
    try {
      const json = JSON.parse(match[1]);
      const extractFromObject = (obj: any) => {
        if (!obj || typeof obj !== 'object') return;
        
        if (obj.image) {
          const imgUrls = Array.isArray(obj.image) ? obj.image : [obj.image];
          for (const img of imgUrls) {
            const url = typeof img === 'string' ? img : img.url || img.contentUrl;
            if (url) {
              images.push({
                url,
                altText: typeof img === 'object' ? img.caption || img.name : null,
                caption: obj.headline || obj.name || null,
                width: typeof img === 'object' ? img.width : null,
                height: typeof img === 'object' ? img.height : null,
                context: 'JSON-LD structured data',
                isOpenGraph: false,
                isTwitterCard: false,
                isJsonLd: true,
                score: 85,
              });
            }
          }
        }
        
        if (obj.thumbnailUrl) {
          images.push({
            url: obj.thumbnailUrl,
            altText: obj.name || null,
            caption: obj.headline || null,
            width: null,
            height: null,
            context: 'JSON-LD thumbnail',
            isOpenGraph: false,
            isTwitterCard: false,
            isJsonLd: true,
            score: 70,
          });
        }
        
        if (Array.isArray(obj)) {
          obj.forEach(extractFromObject);
        } else if (obj['@graph']) {
          extractFromObject(obj['@graph']);
        }
      };
      
      extractFromObject(json);
    } catch {
    }
  }
  
  return images;
}

function extractInlineImages(html: string, baseUrl: string): ExtractedImage[] {
  const images: ExtractedImage[] = [];
  const imgPattern = /<img\s+([^>]+)>/gi;
  const srcPattern = /src=["']([^"']+)["']/i;
  const altPattern = /alt=["']([^"']*)["']/i;
  const widthPattern = /width=["']?(\d+)/i;
  const heightPattern = /height=["']?(\d+)/i;
  const dataPattern = /data-src=["']([^"']+)["']/i;
  const srcsetPattern = /srcset=["']([^"']+)["']/i;
  
  const figcaptionPattern = /<figure[^>]*>[\s\S]*?<img[^>]+src=["']([^"']+)["'][^>]*>[\s\S]*?<figcaption[^>]*>([\s\S]*?)<\/figcaption>[\s\S]*?<\/figure>/gi;
  const figCaptions = new Map<string, string>();
  let figMatch;
  while ((figMatch = figcaptionPattern.exec(html)) !== null) {
    figCaptions.set(figMatch[1], figMatch[2].replace(/<[^>]+>/g, '').trim());
  }
  
  let match;
  while ((match = imgPattern.exec(html)) !== null) {
    const attrs = match[1];
    let srcMatch = srcPattern.exec(attrs);
    if (!srcMatch) {
      srcMatch = dataPattern.exec(attrs);
    }
    
    let rawUrl: string | null = srcMatch ? srcMatch[1] : null;
    
    if (!rawUrl) {
      const srcsetMatch = srcsetPattern.exec(attrs);
      if (srcsetMatch) {
        rawUrl = srcsetMatch[1].split(',')[0].trim().split(' ')[0];
      }
    }
    
    if (!rawUrl) continue;
    const resolvedUrl = resolveUrl(rawUrl, baseUrl);
    if (!resolvedUrl) continue;
    
    const altMatch = altPattern.exec(attrs);
    const widthMatch = widthPattern.exec(attrs);
    const heightMatch = heightPattern.exec(attrs);
    
    const width = widthMatch ? parseInt(widthMatch[1], 10) : null;
    const height = heightMatch ? parseInt(heightMatch[1], 10) : null;
    
    let baseScore = 50;
    if (width && height) {
      if (width >= 600 && height >= 400) baseScore = 65;
      else if (width >= 400 && height >= 300) baseScore = 55;
    }
    
    images.push({
      url: resolvedUrl,
      altText: altMatch ? altMatch[1] : null,
      caption: figCaptions.get(rawUrl) || null,
      width,
      height,
      context: 'Inline image',
      isOpenGraph: false,
      isTwitterCard: false,
      isJsonLd: false,
      score: baseScore,
    });
  }
  
  return images;
}

function extractPageMetadata(html: string): { title: string | null; description: string | null } {
  const titleMatch = /<title[^>]*>([^<]+)<\/title>/i.exec(html);
  const descMatch = /<meta\s+(?:[^>]*?\s)?(?:name|property)=["'](?:og:)?description["'][^>]*?content=["']([^"']+)["'][^>]*>/i.exec(html);
  
  return {
    title: titleMatch ? titleMatch[1].trim() : null,
    description: descMatch ? descMatch[1].trim() : null,
  };
}

function filterAndScoreImages(images: ExtractedImage[], baseUrl: string): ExtractedImage[] {
  const seen = new Set<string>();
  const filtered: ExtractedImage[] = [];
  
  for (const img of images) {
    const resolvedUrl = resolveUrl(img.url, baseUrl) || img.url;
    
    if (seen.has(resolvedUrl)) continue;
    seen.add(resolvedUrl);
    
    if (isAdUrl(resolvedUrl)) continue;
    if (isIconUrl(resolvedUrl)) continue;
    
    if (img.width && img.height) {
      if (img.width < MIN_WIDTH || img.height < MIN_HEIGHT) continue;
      const aspectRatio = img.width / img.height;
      if (aspectRatio < MIN_ASPECT_RATIO || aspectRatio > MAX_ASPECT_RATIO) continue;
    }
    
    let score = img.score;
    if (img.altText && img.altText.length > 10) score += 10;
    if (img.caption) score += 15;
    if (img.isJsonLd) score += 5;
    if (img.isOpenGraph) score += 5;
    if (img.width && img.width >= 800) score += 10;
    if (img.height && img.height >= 600) score += 5;
    
    filtered.push({
      ...img,
      url: resolvedUrl,
      score,
    });
  }
  
  return filtered.sort((a, b) => b.score - a.score);
}

export async function extractImagesFromUrl(url: string): Promise<ImageExtractionResult> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; StoryFlix/1.0; +https://storyflix.app)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      redirect: 'follow',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
    }
    
    const html = await response.text();
    const metadata = extractPageMetadata(html);
    
    const allImages: ExtractedImage[] = [
      ...extractOpenGraphImages(html),
      ...extractTwitterCardImages(html),
      ...extractJsonLdImages(html),
      ...extractInlineImages(html, url),
    ];
    
    const filteredImages = filterAndScoreImages(allImages, url);
    
    return {
      images: filteredImages,
      pageTitle: metadata.title,
      pageDescription: metadata.description,
      sourceUrl: url,
    };
  } catch (error) {
    console.error('Error extracting images from URL:', error);
    return {
      images: [],
      pageTitle: null,
      pageDescription: null,
      sourceUrl: url,
    };
  }
}

export interface DownloadedImage {
  originalUrl: string;
  storageKey: string;
  mimeType: string;
  sizeBytes: number;
  width: number | null;
  height: number | null;
  altText: string | null;
  caption: string | null;
  relevanceScore: number;
}

const objectStorage = new ObjectStorageService();

export async function downloadAndStoreImage(
  image: ExtractedImage,
  universeId: number
): Promise<DownloadedImage | null> {
  try {
    const response = await fetch(image.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; StoryFlix/1.0; +https://storyflix.app)',
        'Accept': 'image/*',
      },
      redirect: 'follow',
    });
    
    if (!response.ok) {
      console.warn(`Failed to download image: ${image.url}`);
      return null;
    }
    
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    if (!contentType.startsWith('image/')) {
      console.warn(`Not an image: ${image.url} (${contentType})`);
      return null;
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    if (buffer.length > 10 * 1024 * 1024) {
      console.warn(`Image too large: ${image.url} (${buffer.length} bytes)`);
      return null;
    }
    
    if (buffer.length < 1000) {
      console.warn(`Image too small (likely icon): ${image.url} (${buffer.length} bytes)`);
      return null;
    }
    
    const extension = contentType.split('/')[1] || 'jpg';
    const filename = `scraped-${universeId}-${Date.now()}.${extension}`;
    
    const uploadUrl = await objectStorage.getObjectEntityUploadURL();
    const storageKey = objectStorage.normalizeObjectEntityPath(uploadUrl);
    
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      body: buffer,
      headers: { 'Content-Type': contentType },
    });
    
    if (!uploadResponse.ok) {
      console.error(`Failed to upload image to storage: ${uploadResponse.statusText}`);
      return null;
    }
    
    return {
      originalUrl: image.url,
      storageKey,
      mimeType: contentType,
      sizeBytes: buffer.length,
      width: image.width,
      height: image.height,
      altText: image.altText,
      caption: image.caption,
      relevanceScore: image.score,
    };
  } catch (error) {
    console.error(`Error downloading image ${image.url}:`, error);
    return null;
  }
}

export async function harvestImagesFromUrl(
  url: string,
  universeId: number,
  maxImages: number = 10
): Promise<DownloadedImage[]> {
  const result = await extractImagesFromUrl(url);
  
  if (result.images.length === 0) {
    console.log(`No images found at ${url}`);
    return [];
  }
  
  const topImages = result.images.slice(0, maxImages);
  console.log(`Found ${result.images.length} images, downloading top ${topImages.length}`);
  
  const downloads = await Promise.all(
    topImages.map(img => downloadAndStoreImage(img, universeId))
  );
  
  return downloads.filter((d): d is DownloadedImage => d !== null);
}
