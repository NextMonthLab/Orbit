import { z } from "zod";
import { storage } from "../storage";
import type { 
  InsertIndustryEntity,
  InsertIndustryProduct,
  InsertProductSpec,
  InsertIndustryReview,
  InsertCommunityLink,
  InsertTopicTile,
  InsertPulseSource
} from "@shared/schema";

const productSpecSchema = z.object({
  specKey: z.string(),
  specValue: z.string(),
  specUnit: z.string().optional(),
  sourceUrl: z.string().optional(),
});

const productSchema = z.object({
  name: z.string(),
  category: z.enum(["consumer", "enterprise", "developer", "medical", "industrial"]).optional(),
  status: z.enum(["announced", "available", "discontinued", "rumored"]).optional(),
  releaseDate: z.string().optional(),
  primaryUrl: z.string().optional(),
  summary: z.string().optional(),
  specs: z.array(productSpecSchema).optional(),
});

const entitySchema = z.object({
  name: z.string(),
  entityType: z.enum(["manufacturer", "retailer", "publisher", "community", "developer"]),
  description: z.string().optional(),
  websiteUrl: z.string().optional(),
  regionTags: z.array(z.string()).optional(),
  trustLevel: z.enum(["manufacturer", "partner", "independent", "community"]).optional(),
});

const reviewSchema = z.object({
  title: z.string(),
  url: z.string(),
  publishedAt: z.string().optional(),
  ratingValue: z.number().optional(),
  ratingScale: z.number().optional(),
  summary: z.string().optional(),
  sentiment: z.enum(["positive", "negative", "mixed", "unknown"]).optional(),
});

const communitySchema = z.object({
  name: z.string(),
  url: z.string(),
  communityType: z.enum(["reddit", "discord", "forum", "telegram", "other"]),
  notes: z.string().optional(),
});

const tileSchema = z.object({
  label: z.string(),
  sublabel: z.string().optional(),
  intentTags: z.array(z.string()).optional(),
  priority: z.number().optional(),
  badgeState: z.object({
    new: z.boolean().optional(),
    trending: z.boolean().optional(),
    debated: z.boolean().optional(),
    updatedRecently: z.boolean().optional(),
  }).optional(),
});

const pulseSourceSchema = z.object({
  name: z.string(),
  sourceType: z.enum(["manufacturer", "publication", "influencer", "standards", "community", "retailer"]),
  url: z.string(),
  rssUrl: z.string().optional(),
  monitoringMethod: z.enum(["rss", "page_monitor"]).optional(),
  updateFrequency: z.enum(["daily", "twice_weekly", "weekly"]).optional(),
  trustLevel: z.enum(["manufacturer", "partner", "independent", "community"]).optional(),
  eventTypes: z.array(z.enum(["product_launch", "firmware_update", "pricing_change", "compatibility_change", "regulatory_change", "review", "rumour", "partnership", "availability_change"])).optional(),
  isEnabled: z.boolean().optional(),
});

export const seedPackSchema = z.object({
  version: z.string(),
  orbitSlug: z.string(),
  entities: z.array(entitySchema).optional(),
  products: z.array(productSchema).optional(),
  reviews: z.array(reviewSchema).optional(),
  communities: z.array(communitySchema).optional(),
  tiles: z.array(tileSchema).optional(),
  pulseSources: z.array(pulseSourceSchema).optional(),
});

export type SeedPack = z.infer<typeof seedPackSchema>;

export interface SeedResult {
  success: boolean;
  imported: {
    entities: number;
    products: number;
    productSpecs: number;
    reviews: number;
    communities: number;
    tiles: number;
    pulseSources: number;
  };
  errors: string[];
}

export async function importSeedPack(orbitId: number, pack: SeedPack): Promise<SeedResult> {
  const result: SeedResult = {
    success: true,
    imported: {
      entities: 0,
      products: 0,
      productSpecs: 0,
      reviews: 0,
      communities: 0,
      tiles: 0,
      pulseSources: 0,
    },
    errors: [],
  };

  try {
    if (pack.entities) {
      for (const entity of pack.entities) {
        const existing = await storage.getIndustryEntityByName(orbitId, entity.name);
        if (existing) {
          await storage.updateIndustryEntity(existing.id, {
            entityType: entity.entityType,
            description: entity.description,
            websiteUrl: entity.websiteUrl,
            regionTags: entity.regionTags,
            trustLevel: entity.trustLevel,
          });
        } else {
          await storage.createIndustryEntity({
            orbitId,
            name: entity.name,
            entityType: entity.entityType,
            description: entity.description,
            websiteUrl: entity.websiteUrl,
            regionTags: entity.regionTags,
            trustLevel: entity.trustLevel,
          });
        }
        result.imported.entities++;
      }
    }

    const productIdMap = new Map<string, number>();

    if (pack.products) {
      for (const product of pack.products) {
        const existing = await storage.getIndustryProductByName(orbitId, product.name);
        
        let productId: number;
        if (existing) {
          await storage.updateIndustryProduct(existing.id, {
            category: product.category,
            status: product.status,
            releaseDate: product.releaseDate ? new Date(product.releaseDate) : undefined,
            primaryUrl: product.primaryUrl,
            summary: product.summary,
          });
          productId = existing.id;
        } else {
          const created = await storage.createIndustryProduct({
            orbitId,
            name: product.name,
            category: product.category,
            status: product.status,
            releaseDate: product.releaseDate ? new Date(product.releaseDate) : undefined,
            primaryUrl: product.primaryUrl,
            summary: product.summary,
          });
          productId = created.id;
        }
        
        productIdMap.set(product.name, productId);
        result.imported.products++;

        if (product.specs) {
          await storage.deleteProductSpecsByProduct(productId);
          
          for (const spec of product.specs) {
            await storage.createProductSpec({
              productId,
              specKey: spec.specKey,
              specValue: spec.specValue,
              specUnit: spec.specUnit,
              sourceUrl: spec.sourceUrl,
            });
            result.imported.productSpecs++;
          }
        }
      }
    }

    if (pack.reviews) {
      for (const review of pack.reviews) {
        await storage.createIndustryReview({
          orbitId,
          title: review.title,
          url: review.url,
          publishedAt: review.publishedAt ? new Date(review.publishedAt) : undefined,
          ratingValue: review.ratingValue,
          ratingScale: review.ratingScale,
          summary: review.summary,
          sentiment: review.sentiment,
        });
        result.imported.reviews++;
      }
    }

    if (pack.communities) {
      for (const community of pack.communities) {
        await storage.createCommunityLink({
          orbitId,
          name: community.name,
          url: community.url,
          communityType: community.communityType,
          notes: community.notes,
        });
        result.imported.communities++;
      }
    }

    if (pack.tiles) {
      for (const tile of pack.tiles) {
        await storage.createTopicTile({
          orbitId,
          label: tile.label,
          sublabel: tile.sublabel,
          intentTags: tile.intentTags,
          priority: tile.priority ?? 0,
          badgeState: tile.badgeState,
        });
        result.imported.tiles++;
      }
    }

    if (pack.pulseSources) {
      for (const source of pack.pulseSources) {
        await storage.createPulseSource({
          orbitId,
          name: source.name,
          sourceType: source.sourceType,
          url: source.url,
          rssUrl: source.rssUrl,
          monitoringMethod: source.monitoringMethod,
          updateFrequency: source.updateFrequency,
          trustLevel: source.trustLevel,
          eventTypes: source.eventTypes,
          isEnabled: source.isEnabled ?? true,
        });
        result.imported.pulseSources++;
      }
    }

  } catch (error) {
    result.success = false;
    result.errors.push(error instanceof Error ? error.message : String(error));
  }

  return result;
}

export async function getOrbitDefinition(orbitId: number) {
  const [entities, products, reviews, communities, tiles, pulseSources] = await Promise.all([
    storage.getIndustryEntitiesByOrbit(orbitId),
    storage.getIndustryProductsByOrbit(orbitId),
    storage.getIndustryReviewsByOrbit(orbitId),
    storage.getCommunityLinksByOrbit(orbitId),
    storage.getTopicTilesByOrbit(orbitId),
    storage.getPulseSourcesByOrbit(orbitId),
  ]);

  const productsWithSpecs = await Promise.all(
    products.map(async (product) => {
      const specs = await storage.getProductSpecs(product.id);
      return { ...product, specs };
    })
  );

  return {
    entities,
    products: productsWithSpecs,
    reviews,
    communities,
    tiles,
    pulseSources,
    stats: {
      totalEntities: entities.length,
      totalProducts: products.length,
      totalReviews: reviews.length,
      totalCommunities: communities.length,
      totalTiles: tiles.length,
      totalPulseSources: pulseSources.length,
    },
  };
}
