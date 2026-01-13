import { storage } from "../storage";
import type {
  IndustryEntity,
  IndustryProduct,
  IndustryReview,
  CommunityLink,
  TopicTile,
  PulseSource,
  CoreConcept,
  ProductSpec,
  IndustryAsset,
  OrbitMeta,
} from "@shared/schema";

// CPAC v1.0 Export Format
// Universal format for all Industry Orbits
// Round-trip compatible with importer

export interface CpacV1Export {
  formatVersion: "1.0.0";
  cpacVersion: "1.0.0";
  packType: "export";
  generatedAt: string;
  sourceAgent: {
    name: string;
    version: string;
  };
  orbit: {
    slug: string;
    title: string;
    type: "industry";
    summary?: string;
    regionFocus?: string[];
    language?: string;
    visibility?: string;
    tags?: string[];
  };
  coreConcepts: CpacCoreConcept[];
  entities: CpacEntity[];
  products: CpacProduct[];
  reviews: CpacReview[];
  communities: CpacCommunity[];
  tiles: CpacTile[];
  pulseSources: CpacPulseSource[];
  assets: CpacAsset[];
}

export interface CpacCoreConcept {
  id: string;
  label: string;
  whyItMatters?: string | null;
  starterQuestions?: string[];
  intentTags?: string[];
}

export interface CpacEntity {
  id: string;
  name: string;
  entityType: string;
  description?: string | null;
  websiteUrl?: string | null;
  regionTags?: string[];
  trustLevel: string;
  logoUrl?: string | null;
  logoSourceUrl?: string | null;
  logoSourceType?: string | null;
  socialUrls?: {
    x?: string | null;
    linkedin?: string | null;
    youtube?: string | null;
    instagram?: string | null;
  };
  notes?: string | null;
}

export interface CpacProductSpec {
  specKey: string;
  specValue: string;
  specUnit?: string | null;
  sourceUrl?: string | null;
  lastVerifiedAt?: string | null;
}

export interface CpacProduct {
  id: string;
  name: string;
  manufacturerEntityId?: string | null;
  category: string;
  status: string;
  releaseDate?: string | null;
  primaryUrl?: string | null;
  summary?: string | null;
  heroImageUrl?: string | null;
  heroSourceUrl?: string | null;
  heroSourceType?: string | null;
  mediaRefs?: {
    imageAssetRefs?: string[];
    videoAssetRefs?: string[];
  };
  referenceUrls?: string[];
  intentTags?: string[];
  specs?: CpacProductSpec[];
}

export interface CpacReview {
  id: string;
  title: string;
  url: string;
  productId?: string | null;
  reviewerEntityId?: string | null;
  publishedAt?: string | null;
  ratingValue?: number | null;
  ratingScale?: number | null;
  summary?: string | null;
  sentiment: string;
}

export interface CpacCommunity {
  id: string;
  name: string;
  url: string;
  communityType: string;
  regionTags?: string[];
  notes?: string | null;
}

export interface CpacTile {
  id: string;
  label: string;
  sublabel?: string | null;
  intentTags?: string[];
  priority?: number | null;
  badgeState?: {
    new?: boolean;
    trending?: boolean;
    debated?: boolean;
    updatedRecently?: boolean;
  };
  evidenceRefs?: {
    productIds?: string[];
    entityIds?: string[];
    communityIds?: string[];
  };
}

export interface CpacPulseSource {
  id: string;
  name: string;
  sourceType: string;
  url: string;
  rssUrl?: string | null;
  monitoringMethod?: string | null;
  updateFrequency?: string | null;
  trustLevel?: string | null;
  eventTypes?: string[];
  isEnabled: boolean;
  keywordTriggers?: string[];
  notes?: string | null;
}

export interface CpacAsset {
  id: string;
  assetType: string;
  storageUrl: string;
  thumbUrl?: string | null;
  sourceUrl?: string | null;
  title?: string | null;
}

// ID mapping for cross-references (DB IDs to CPAC string IDs)
interface IdMaps {
  entities: Map<number, string>;
  products: Map<number, string>;
  communities: Map<number, string>;
  assets: Map<number, string>;
}

function generateCpacId(type: string, name: string, dbId: number): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 40);
  return `${type}-${slug}-${dbId}`;
}

function formatDate(date: Date | null | undefined): string | null {
  if (!date) return null;
  return date.toISOString().split('T')[0];
}

function formatTimestamp(date: Date | null | undefined): string | undefined {
  if (!date) return undefined;
  return date.toISOString();
}

function stripNulls<T extends Record<string, unknown>>(obj: T): T {
  const result = {} as T;
  for (const [key, value] of Object.entries(obj)) {
    if (value !== null && value !== undefined) {
      result[key as keyof T] = value as T[keyof T];
    }
  }
  return result;
}

export async function exportCpac(orbitMeta: OrbitMeta): Promise<CpacV1Export> {
  const orbitId = orbitMeta.id;
  
  // Fetch all data from database in parallel
  const [
    entities,
    products,
    reviews,
    communities,
    tiles,
    pulseSources,
    coreConcepts,
    assets,
  ] = await Promise.all([
    storage.getIndustryEntitiesByOrbit(orbitId),
    storage.getIndustryProductsByOrbit(orbitId),
    storage.getIndustryReviewsByOrbit(orbitId),
    storage.getCommunityLinksByOrbit(orbitId),
    storage.getTopicTilesByOrbit(orbitId),
    storage.getPulseSourcesByOrbit(orbitId),
    storage.getCoreConceptsByOrbit(orbitId),
    storage.getIndustryAssetsByOrbit(orbitId),
  ]);
  
  // Fetch specs for all products
  const productSpecs = new Map<number, ProductSpec[]>();
  for (const product of products) {
    const specs = await storage.getProductSpecs(product.id);
    productSpecs.set(product.id, specs);
  }
  
  // Build ID maps for cross-references
  const idMaps: IdMaps = {
    entities: new Map(entities.map(e => [e.id, generateCpacId('entity', e.name, e.id)])),
    products: new Map(products.map(p => [p.id, generateCpacId('product', p.name, p.id)])),
    communities: new Map(communities.map(c => [c.id, generateCpacId('community', c.name, c.id)])),
    assets: new Map(assets.map(a => [a.id, generateCpacId('asset', a.title || 'asset', a.id)])),
  };
  
  // Build asset URL lookup
  const assetUrls = new Map(assets.map(a => [a.id, a.storageUrl]));
  const assetSources = new Map(assets.map(a => [a.id, a.sourceUrl]));
  
  // Sort everything deterministically by ID for stable exports
  const sortById = <T extends { id: number }>(arr: T[]) => [...arr].sort((a, b) => a.id - b.id);
  
  const cpacEntities: CpacEntity[] = sortById(entities).map(e => stripNulls({
    id: idMaps.entities.get(e.id)!,
    name: e.name,
    entityType: e.entityType,
    description: e.description || undefined,
    websiteUrl: e.websiteUrl || undefined,
    regionTags: (e.regionTags as string[]) || [],
    trustLevel: e.trustLevel,
    logoUrl: e.logoAssetId ? assetUrls.get(e.logoAssetId) : undefined,
    logoSourceUrl: e.logoAssetId ? assetSources.get(e.logoAssetId) || undefined : undefined,
    logoSourceType: e.logoAssetId ? "UPLOADED" : undefined,
    socialUrls: e.socialUrls as CpacEntity['socialUrls'],
    notes: e.notes || undefined,
  }) as CpacEntity);
  
  const cpacProducts: CpacProduct[] = sortById(products).map(p => stripNulls({
    id: idMaps.products.get(p.id)!,
    name: p.name,
    manufacturerEntityId: p.manufacturerEntityId ? idMaps.entities.get(p.manufacturerEntityId) : undefined,
    category: p.category,
    status: p.status,
    releaseDate: formatDate(p.releaseDate) || undefined,
    primaryUrl: p.primaryUrl || undefined,
    summary: p.summary || undefined,
    heroImageUrl: p.heroAssetId ? assetUrls.get(p.heroAssetId) : undefined,
    heroSourceUrl: p.heroAssetId ? assetSources.get(p.heroAssetId) || undefined : undefined,
    heroSourceType: p.heroAssetId ? "UPLOADED" : undefined,
    mediaRefs: p.mediaRefs as CpacProduct['mediaRefs'],
    referenceUrls: (p.referenceUrls as string[]) || [],
    intentTags: (p.intentTags as string[]) || [],
    specs: (productSpecs.get(p.id) || []).map(s => stripNulls({
      specKey: s.specKey,
      specValue: s.specValue,
      specUnit: s.specUnit || undefined,
      sourceUrl: s.sourceUrl || undefined,
      lastVerifiedAt: formatTimestamp(s.lastVerifiedAt),
    }) as CpacProductSpec),
  }) as CpacProduct);
  
  const cpacReviews: CpacReview[] = sortById(reviews).map(r => stripNulls({
    id: generateCpacId('review', r.title, r.id),
    title: r.title,
    url: r.url,
    productId: r.productId ? idMaps.products.get(r.productId) : undefined,
    reviewerEntityId: r.reviewerEntityId ? idMaps.entities.get(r.reviewerEntityId) : undefined,
    publishedAt: formatDate(r.publishedAt) || undefined,
    ratingValue: r.ratingValue ?? undefined,
    ratingScale: r.ratingScale ?? undefined,
    summary: r.summary || undefined,
    sentiment: r.sentiment,
  }) as CpacReview);
  
  const cpacCommunities: CpacCommunity[] = sortById(communities).map(c => stripNulls({
    id: idMaps.communities.get(c.id)!,
    name: c.name,
    url: c.url,
    communityType: c.communityType,
    regionTags: (c.regionTags as string[]) || [],
    notes: c.notes || undefined,
  }) as CpacCommunity);
  
  const cpacTiles: CpacTile[] = sortById(tiles).map(t => stripNulls({
    id: generateCpacId('tile', t.label, t.id),
    label: t.label,
    sublabel: t.sublabel || undefined,
    intentTags: (t.intentTags as string[]) || [],
    priority: t.priority ?? undefined,
    badgeState: t.badgeState as CpacTile['badgeState'],
    evidenceRefs: t.evidenceRefs as CpacTile['evidenceRefs'],
  }) as CpacTile);
  
  const cpacPulseSources: CpacPulseSource[] = sortById(pulseSources).map(ps => stripNulls({
    id: generateCpacId('pulse', ps.name, ps.id),
    name: ps.name,
    sourceType: ps.sourceType,
    url: ps.url,
    rssUrl: ps.rssUrl || undefined,
    monitoringMethod: ps.monitoringMethod || undefined,
    updateFrequency: ps.updateFrequency || undefined,
    trustLevel: ps.trustLevel || undefined,
    eventTypes: (ps.eventTypes as string[]) || [],
    isEnabled: ps.isEnabled ?? true,
    keywordTriggers: (ps.keywordTriggers as string[]) || [],
    notes: ps.notes || undefined,
  }) as CpacPulseSource);
  
  const cpacCoreConcepts: CpacCoreConcept[] = sortById(coreConcepts).map(cc => stripNulls({
    id: generateCpacId('concept', cc.label, cc.id),
    label: cc.label,
    whyItMatters: cc.whyItMatters || undefined,
    starterQuestions: (cc.starterQuestions as string[]) || [],
    intentTags: (cc.intentTags as string[]) || [],
  }) as CpacCoreConcept);
  
  const cpacAssets: CpacAsset[] = sortById(assets).map(a => stripNulls({
    id: idMaps.assets.get(a.id)!,
    assetType: a.assetType,
    storageUrl: a.storageUrl,
    thumbUrl: a.thumbUrl || undefined,
    sourceUrl: a.sourceUrl || undefined,
    title: a.title || undefined,
  }) as CpacAsset);
  
  return {
    formatVersion: "1.0.0",
    cpacVersion: "1.0.0",
    packType: "export",
    generatedAt: new Date().toISOString(),
    sourceAgent: {
      name: "Orbit CPAC Exporter",
      version: "1.0.0",
    },
    orbit: {
      slug: orbitMeta.businessSlug,
      title: orbitMeta.customTitle || orbitMeta.businessSlug,
      type: "industry",
      summary: orbitMeta.customDescription || undefined,
      visibility: orbitMeta.visibility || "public",
    },
    coreConcepts: cpacCoreConcepts,
    entities: cpacEntities,
    products: cpacProducts,
    reviews: cpacReviews,
    communities: cpacCommunities,
    tiles: cpacTiles,
    pulseSources: cpacPulseSources,
    assets: cpacAssets,
  };
}

// Asset Review CSV Row
export interface AssetReviewRow {
  itemType: "entity" | "product";
  itemName: string;
  cpacId: string;
  imageType: "logo" | "hero";
  candidateImageUrl: string;
  sourcePageUrl: string;
  sourceType: string;
  confidence: string;
  approved: string;
  reviewerNotes: string;
}

export async function exportAssetsReviewCsv(orbitMeta: OrbitMeta): Promise<string> {
  const orbitId = orbitMeta.id;
  
  const [entities, products, assets] = await Promise.all([
    storage.getIndustryEntitiesByOrbit(orbitId),
    storage.getIndustryProductsByOrbit(orbitId),
    storage.getIndustryAssetsByOrbit(orbitId),
  ]);
  
  const assetUrls = new Map(assets.map(a => [a.id, a.storageUrl]));
  const assetSources = new Map(assets.map(a => [a.id, a.sourceUrl || '']));
  
  const rows: AssetReviewRow[] = [];
  
  // Sort entities and products for deterministic output
  const sortedEntities = [...entities].sort((a, b) => a.id - b.id);
  const sortedProducts = [...products].sort((a, b) => a.id - b.id);
  
  // Add entity rows
  for (const entity of sortedEntities) {
    const cpacId = generateCpacId('entity', entity.name, entity.id);
    rows.push({
      itemType: "entity",
      itemName: entity.name,
      cpacId,
      imageType: "logo",
      candidateImageUrl: entity.logoAssetId ? assetUrls.get(entity.logoAssetId) || '' : '',
      sourcePageUrl: entity.logoAssetId ? assetSources.get(entity.logoAssetId) || '' : '',
      sourceType: entity.logoAssetId ? "UPLOADED" : "",
      confidence: "",
      approved: "",
      reviewerNotes: "",
    });
  }
  
  // Add product rows
  for (const product of sortedProducts) {
    const cpacId = generateCpacId('product', product.name, product.id);
    rows.push({
      itemType: "product",
      itemName: product.name,
      cpacId,
      imageType: "hero",
      candidateImageUrl: product.heroAssetId ? assetUrls.get(product.heroAssetId) || '' : '',
      sourcePageUrl: product.heroAssetId ? assetSources.get(product.heroAssetId) || '' : '',
      sourceType: product.heroAssetId ? "UPLOADED" : "",
      confidence: "",
      approved: "",
      reviewerNotes: "",
    });
  }
  
  // Generate CSV with proper escaping
  const headers = [
    "Item Type",
    "Item Name",
    "CPAC ID",
    "Image Type",
    "Candidate Image URL",
    "Source Page URL",
    "Source Type",
    "Confidence",
    "Approved",
    "Reviewer Notes",
  ];
  
  const escapeCsvField = (field: string): string => {
    if (field.includes(',') || field.includes('"') || field.includes('\n')) {
      return `"${field.replace(/"/g, '""')}"`;
    }
    return field;
  };
  
  const csvLines = [
    headers.join(','),
    ...rows.map(row => [
      escapeCsvField(row.itemType),
      escapeCsvField(row.itemName),
      escapeCsvField(row.cpacId),
      escapeCsvField(row.imageType),
      escapeCsvField(row.candidateImageUrl),
      escapeCsvField(row.sourcePageUrl),
      escapeCsvField(row.sourceType),
      escapeCsvField(row.confidence),
      escapeCsvField(row.approved),
      escapeCsvField(row.reviewerNotes),
    ].join(',')),
  ];
  
  return csvLines.join('\n');
}

// Asset approval input
export interface AssetApprovalInput {
  cpacId: string;
  imageType: "logo" | "hero";
  candidateImageUrl: string;
  sourcePageUrl: string;
  sourceType: "OFFICIAL_BRAND" | "OFFICIAL_PRODUCT" | "PRESS_KIT" | "UPLOADED";
  approved: "YES" | "NO" | "";
  reviewerNotes?: string;
}

export interface AssetApprovalResult {
  updated: number;
  rejected: number;
  skipped: number;
  errors: string[];
  warnings: string[];
}

export async function applyAssetApprovals(
  orbitMeta: OrbitMeta,
  approvals: AssetApprovalInput[]
): Promise<AssetApprovalResult> {
  const orbitId = orbitMeta.id;
  const result: AssetApprovalResult = {
    updated: 0,
    rejected: 0,
    skipped: 0,
    errors: [],
    warnings: [],
  };
  
  const [entities, products] = await Promise.all([
    storage.getIndustryEntitiesByOrbit(orbitId),
    storage.getIndustryProductsByOrbit(orbitId),
  ]);
  
  // Build lookup maps from CPAC ID to DB record
  const entityByCpacId = new Map<string, IndustryEntity>();
  for (const entity of entities) {
    const cpacId = generateCpacId('entity', entity.name, entity.id);
    entityByCpacId.set(cpacId, entity);
  }
  
  const productByCpacId = new Map<string, IndustryProduct>();
  for (const product of products) {
    const cpacId = generateCpacId('product', product.name, product.id);
    productByCpacId.set(cpacId, product);
  }
  
  for (const approval of approvals) {
    // Normalize approved field to uppercase for case-insensitive comparison
    const approvedNormalized = (approval.approved || '').toUpperCase();
    
    // Only process YES approvals
    if (approvedNormalized !== "YES") {
      if (approvedNormalized === "NO") {
        result.rejected++;
      } else {
        result.skipped++;
      }
      continue;
    }
    
    // Validate required fields
    if (!approval.candidateImageUrl) {
      result.errors.push(`Missing candidateImageUrl for ${approval.cpacId}`);
      continue;
    }
    
    // Validate URL format - only allow https:// URLs
    try {
      const url = new URL(approval.candidateImageUrl);
      if (!['https:', 'http:'].includes(url.protocol)) {
        result.errors.push(`Invalid URL scheme for ${approval.cpacId}: only http/https allowed`);
        continue;
      }
    } catch {
      result.errors.push(`Invalid URL format for ${approval.cpacId}: ${approval.candidateImageUrl}`);
      continue;
    }
    
    if (!approval.sourceType) {
      result.warnings.push(`Missing sourceType for ${approval.cpacId}, defaulting to UPLOADED`);
      approval.sourceType = "UPLOADED";
    }
    
    if (approval.imageType === "logo") {
      const entity = entityByCpacId.get(approval.cpacId);
      if (!entity) {
        result.errors.push(`Entity not found: ${approval.cpacId}`);
        continue;
      }
      
      // Create or update asset
      const asset = await storage.createIndustryAsset({
        orbitId,
        assetType: 'image',
        storageUrl: approval.candidateImageUrl,
        sourceUrl: approval.sourcePageUrl || null,
        title: `${entity.name} logo`,
      });
      
      // Update entity with new asset ID
      await storage.updateIndustryEntity(entity.id, {
        logoAssetId: asset.id,
      });
      
      result.updated++;
    } else if (approval.imageType === "hero") {
      const product = productByCpacId.get(approval.cpacId);
      if (!product) {
        result.errors.push(`Product not found: ${approval.cpacId}`);
        continue;
      }
      
      // Create or update asset
      const asset = await storage.createIndustryAsset({
        orbitId,
        assetType: 'image',
        storageUrl: approval.candidateImageUrl,
        sourceUrl: approval.sourcePageUrl || null,
        title: `${product.name} hero`,
      });
      
      // Update product with new asset ID
      await storage.updateIndustryProduct(product.id, {
        heroAssetId: asset.id,
      });
      
      result.updated++;
    } else {
      result.errors.push(`Unknown imageType "${approval.imageType}" for ${approval.cpacId}`);
    }
  }
  
  return result;
}

// Parse CSV to approval inputs
export function parseAssetApprovalsCsv(csvContent: string): AssetApprovalInput[] {
  const lines = csvContent.split('\n').filter(line => line.trim());
  if (lines.length < 2) return [];
  
  // Skip header row
  const dataLines = lines.slice(1);
  const approvals: AssetApprovalInput[] = [];
  
  for (const line of dataLines) {
    // Parse CSV with proper handling of quoted fields
    const fields = parseCsvLine(line);
    if (fields.length < 10) continue;
    
    approvals.push({
      cpacId: fields[2] || '',
      imageType: fields[3] as "logo" | "hero",
      candidateImageUrl: fields[4] || '',
      sourcePageUrl: fields[5] || '',
      sourceType: (fields[6] || 'UPLOADED') as AssetApprovalInput['sourceType'],
      approved: (fields[8] || '').toUpperCase() as "YES" | "NO" | "",
      reviewerNotes: fields[9] || '',
    });
  }
  
  return approvals;
}

function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (inQuotes) {
      if (char === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        fields.push(current);
        current = '';
      } else {
        current += char;
      }
    }
  }
  
  fields.push(current);
  return fields;
}

// ============ CLAUDE EXTENSION PROMPT GENERATOR ============

export interface CpacStats {
  entities: number;
  products: number;
  reviews: number;
  communities: number;
  tiles: number;
  pulseSources: number;
  coreConcepts: number;
  assets: number;
  entityTypes: Record<string, number>;
  productCategories: Record<string, number>;
  productStatuses: Record<string, number>;
}

export function calculateCpacStats(cpac: CpacV1Export): CpacStats {
  const entityTypes: Record<string, number> = {};
  for (const entity of cpac.entities) {
    entityTypes[entity.entityType] = (entityTypes[entity.entityType] || 0) + 1;
  }
  
  const productCategories: Record<string, number> = {};
  const productStatuses: Record<string, number> = {};
  for (const product of cpac.products) {
    productCategories[product.category] = (productCategories[product.category] || 0) + 1;
    productStatuses[product.status] = (productStatuses[product.status] || 0) + 1;
  }
  
  return {
    entities: cpac.entities.length,
    products: cpac.products.length,
    reviews: cpac.reviews.length,
    communities: cpac.communities.length,
    tiles: cpac.tiles.length,
    pulseSources: cpac.pulseSources.length,
    coreConcepts: cpac.coreConcepts.length,
    assets: cpac.assets.length,
    entityTypes,
    productCategories,
    productStatuses,
  };
}

export function generateClaudeExtensionPrompt(cpac: CpacV1Export, stats: CpacStats): string {
  const orbitTitle = cpac.orbit.title;
  const orbitSlug = cpac.orbit.slug;
  
  // Build entity type summary
  const entityTypeSummary = Object.entries(stats.entityTypes)
    .map(([type, count]) => `${type}: ${count}`)
    .join(', ');
  
  // Build product category summary
  const categorySummary = Object.entries(stats.productCategories)
    .map(([cat, count]) => `${cat}: ${count}`)
    .join(', ');
  
  // Build product status summary
  const statusSummary = Object.entries(stats.productStatuses)
    .map(([status, count]) => `${status}: ${count}`)
    .join(', ');
  
  // Extract existing entity names for deduplication reference
  const existingEntities = cpac.entities.map(e => e.name).slice(0, 30);
  const existingProducts = cpac.products.map(p => p.name).slice(0, 30);
  
  return `# Orbit CPAC Extension Task

You are extending the knowledge base for the "${orbitTitle}" Industry Orbit (slug: ${orbitSlug}).

## Current CPAC Contents

The attached Orbit CPAC JSON contains:
- **${stats.entities} entities** (${entityTypeSummary || 'none'})
- **${stats.products} products** (${categorySummary || 'none'})
- **${stats.reviews} reviews**
- **${stats.communities} communities**
- **${stats.tiles} tiles**
- **${stats.pulseSources} pulse sources**
- **${stats.coreConcepts} core concepts**
- **${stats.assets} assets**

Product statuses: ${statusSummary || 'none'}

## Your Task

Extend this CPAC with **meaningful new entries** that add genuine value. Do NOT duplicate or repeat existing content.

### Strict Rules

1. **NO DUPLICATES**: The following entities already exist (sample): ${existingEntities.join(', ')}${existingEntities.length >= 30 ? '...' : ''}
   - The following products already exist (sample): ${existingProducts.join(', ')}${existingProducts.length >= 30 ? '...' : ''}
   - Check the full CPAC JSON before adding anything

2. **QUALITY OVER QUANTITY**: Only add entries with real value. Each addition must:
   - Have verifiable sources for key claims
   - Include meaningful descriptions (not placeholder text)
   - Use correct status tags (announced, available, discontinued, rumored)
   - Include confidence indicators where uncertain

3. **REQUIRED FIELDS**: Every new entry must include:
   - For entities: name, entityType, description, trustLevel, at least one source URL
   - For products: name, category, status, releaseDate (if known), summary with target audience
   - For communities: name, url, communityType, notes explaining what the community is

4. **STATUS TAGGING**: Use these product statuses correctly:
   - \`announced\` - Officially announced but not shipping
   - \`available\` - Currently purchasable
   - \`discontinued\` - No longer made but historically significant
   - \`rumored\` - Unconfirmed reports only
   - \`in_development\` - Known to be in development

### Expansion Buckets

Add entries across these categories (prioritize gaps in current coverage):

1. **Enterprise/Industrial** - B2B solutions, warehouse/logistics, field service
2. **Optics & Display Suppliers** - Component manufacturers, display technology companies
3. **Audio-First Devices** - Smart glasses focused on audio rather than AR/display
4. **Regional Players** - Non-US manufacturers (China, Japan, Korea, Europe)
5. **Accessories & Ecosystem** - Cases, mounts, prescription inserts, charging solutions
6. **Developer Tools** - SDKs, development kits, simulation tools
7. **Key Communities** - Subreddits, Discord servers, forums, YouTube channels
8. **Discontinued But Influential** - Products that shaped the industry (mark status: discontinued)

### Output Format

Return a valid JSON object that can be merged with the existing CPAC. Structure:

\`\`\`json
{
  "additions": {
    "entities": [...],
    "products": [...],
    "communities": [...],
    "tiles": [...],
    "pulseSources": [...]
  },
  "notes": "Brief summary of what was added and why"
}
\`\`\`

Use the same schema as the input CPAC. Generate unique IDs using the pattern: \`{type}-{slug}-new-{n}\` (e.g., \`entity-vuzix-new-1\`).

## Important

- Merge aliases and alternate names rather than creating duplicates
- If uncertain about a detail, omit it rather than guessing
- Focus on entries that would help someone researching this industry
- Include reasoning for why each addition is valuable in a \`_additionReason\` field

Attach the current Orbit CPAC JSON to this prompt, then provide your extensions.`;
}

// Generate a summary of what to check when reviewing import diffs
export interface CpacDiffSummary {
  newEntities: { id: string; name: string; entityType: string }[];
  newProducts: { id: string; name: string; category: string; status: string }[];
  newCommunities: { id: string; name: string; communityType: string }[];
  newTiles: { id: string; label: string }[];
  newPulseSources: { id: string; name: string; sourceType: string }[];
  potentialDuplicates: { type: string; newName: string; existingName: string; similarity: number }[];
  warnings: string[];
}

function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[b.length][a.length];
}

function nameSimilarity(name1: string, name2: string): number {
  const a = name1.toLowerCase().trim();
  const b = name2.toLowerCase().trim();
  if (a === b) return 1;
  
  const distance = levenshteinDistance(a, b);
  const maxLen = Math.max(a.length, b.length);
  return 1 - (distance / maxLen);
}

export function analyzeCpacDiff(
  existingCpac: CpacV1Export,
  incomingCpac: CpacV1Export
): CpacDiffSummary {
  const existingEntityNames = new Set(existingCpac.entities.map(e => e.name.toLowerCase()));
  const existingProductNames = new Set(existingCpac.products.map(p => p.name.toLowerCase()));
  const existingCommunityNames = new Set(existingCpac.communities.map(c => c.name.toLowerCase()));
  const existingTileLabels = new Set(existingCpac.tiles.map(t => t.label.toLowerCase()));
  const existingSourceNames = new Set(existingCpac.pulseSources.map(s => s.name.toLowerCase()));
  
  const existingEntityIds = new Set(existingCpac.entities.map(e => e.id));
  const existingProductIds = new Set(existingCpac.products.map(p => p.id));
  
  const newEntities = incomingCpac.entities.filter(e => 
    !existingEntityIds.has(e.id) && !existingEntityNames.has(e.name.toLowerCase())
  );
  const newProducts = incomingCpac.products.filter(p => 
    !existingProductIds.has(p.id) && !existingProductNames.has(p.name.toLowerCase())
  );
  const newCommunities = incomingCpac.communities.filter(c => 
    !existingCommunityNames.has(c.name.toLowerCase())
  );
  const newTiles = incomingCpac.tiles.filter(t => 
    !existingTileLabels.has(t.label.toLowerCase())
  );
  const newPulseSources = incomingCpac.pulseSources.filter(s => 
    !existingSourceNames.has(s.name.toLowerCase())
  );
  
  // Check for potential duplicates (similar names)
  const potentialDuplicates: CpacDiffSummary['potentialDuplicates'] = [];
  const SIMILARITY_THRESHOLD = 0.8;
  
  for (const newEntity of newEntities) {
    for (const existing of existingCpac.entities) {
      const sim = nameSimilarity(newEntity.name, existing.name);
      if (sim >= SIMILARITY_THRESHOLD && sim < 1) {
        potentialDuplicates.push({
          type: 'entity',
          newName: newEntity.name,
          existingName: existing.name,
          similarity: Math.round(sim * 100),
        });
      }
    }
  }
  
  for (const newProduct of newProducts) {
    for (const existing of existingCpac.products) {
      const sim = nameSimilarity(newProduct.name, existing.name);
      if (sim >= SIMILARITY_THRESHOLD && sim < 1) {
        potentialDuplicates.push({
          type: 'product',
          newName: newProduct.name,
          existingName: existing.name,
          similarity: Math.round(sim * 100),
        });
      }
    }
  }
  
  const warnings: string[] = [];
  
  // Check for products without manufacturers
  const orphanProducts = newProducts.filter(p => !p.manufacturerEntityId);
  if (orphanProducts.length > 0) {
    warnings.push(`${orphanProducts.length} new products have no manufacturer linked`);
  }
  
  // Check for products without release dates
  const undatedProducts = newProducts.filter(p => !p.releaseDate);
  if (undatedProducts.length > 0) {
    warnings.push(`${undatedProducts.length} new products have no release date`);
  }
  
  return {
    newEntities: newEntities.map(e => ({ id: e.id, name: e.name, entityType: e.entityType })),
    newProducts: newProducts.map(p => ({ id: p.id, name: p.name, category: p.category, status: p.status })),
    newCommunities: newCommunities.map(c => ({ id: c.id, name: c.name, communityType: c.communityType })),
    newTiles: newTiles.map(t => ({ id: t.id, label: t.label })),
    newPulseSources: newPulseSources.map(s => ({ id: s.id, name: s.name, sourceType: s.sourceType })),
    potentialDuplicates,
    warnings,
  };
}
