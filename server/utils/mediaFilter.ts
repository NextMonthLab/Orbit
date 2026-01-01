/**
 * Shared Media Filter Utility
 * 
 * Canonical implementation for filtering out unsuitable images.
 * Consolidated from:
 *   - server/previewHelpers.ts:extractImagePool()
 *   - server/routes.ts:isExtractionBadImage()
 *   - server/services/catalogueDetection.ts:isPaymentOrBadImage()
 * 
 * PHASE 1: No behaviour change - union of all existing blocklists
 */

// Unified blocklist - union of all patterns from the 3 original sources
const BAD_IMAGE_PATTERNS = [
  // Generic non-content images (from all 3 sources)
  'icon',
  'logo', 
  'avatar',
  'sprite',
  '1x1',
  'pixel',
  'blank',
  
  // Payment card images (from all 3 sources)
  'visa',
  'mastercard',
  'paypal',
  'payment',
  'pp-card',    // from routes.ts
  'card',       // from catalogueDetection.ts (note: may be too aggressive, but preserving original)
  'stripe',
  'amex',       // from routes.ts
  'discover',   // from routes.ts
  
  // Footer/social images (from all 3 sources)
  'footer',
  'social',
  'facebook',
  'twitter',
  'instagram',
  'linkedin',
  
  // Loading/placeholder images (from routes.ts and catalogueDetection.ts)
  'loading',
  'spinner',
  'placeholder',
];

/**
 * Check if a URL points to a "bad" image that should be filtered out.
 * This is the canonical implementation - all call sites should use this.
 * 
 * @param url - The image URL to check
 * @returns true if the image should be filtered out
 */
export function isBadImageUrl(url: string): boolean {
  if (!url) return true;
  const lowerUrl = url.toLowerCase();
  return BAD_IMAGE_PATTERNS.some(pattern => lowerUrl.includes(pattern));
}

/**
 * Filter an array of image URLs, removing bad ones.
 * Thin wrapper around isBadImageUrl for convenience.
 * 
 * @param urls - Array of image URLs to filter
 * @returns Filtered array with bad images removed
 */
export function filterImagePool(urls: string[]): string[] {
  return urls.filter(url => !isBadImageUrl(url));
}

/**
 * Check if a URL is a data URI (should be filtered separately from pattern matching)
 */
export function isDataUri(url: string): boolean {
  return url.startsWith('data:');
}

/**
 * Check if a URL is too short to be a real image path
 * Original threshold from previewHelpers.ts
 */
export function isTooShort(url: string, minLength: number = 20): boolean {
  return url.length < minLength;
}
