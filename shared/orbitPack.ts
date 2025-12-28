import { z } from "zod";

export const orbitBoxSourceSchema = z.object({
  type: z.enum(["url", "pdf", "text", "testimonial"]),
  ref: z.string(),
  extractedAt: z.string().optional(),
});

export type OrbitBoxSource = z.infer<typeof orbitBoxSourceSchema>;

export const orbitBoxSchema = z.object({
  id: z.string(),
  type: z.enum(["page", "service", "faq", "testimonial", "blog", "document", "custom"]),
  title: z.string(),
  summary: z.string(),
  themes: z.array(z.string()).default([]),
  sources: z.array(orbitBoxSourceSchema).default([]),
  priority: z.number().default(0),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type OrbitBox = z.infer<typeof orbitBoxSchema>;

export const orbitBrandSchema = z.object({
  name: z.string(),
  logo: z.string().optional(),
  accent: z.string().optional(),
  tone: z.string().optional(),
  positioning: z.string().optional(),
  taglineCandidates: z.array(z.string()).default([]),
});

export type OrbitBrand = z.infer<typeof orbitBrandSchema>;

export const orbitEntitiesSchema = z.object({
  services: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    visitorProblem: z.string().optional(),
  })).default([]),
  products: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
  })).default([]),
  people: z.array(z.object({
    id: z.string(),
    name: z.string(),
    role: z.string().optional(),
  })).default([]),
});

export type OrbitEntities = z.infer<typeof orbitEntitiesSchema>;

export const orbitFaqSchema = z.object({
  question: z.string(),
  answer: z.string(),
  sourceBoxId: z.string().optional(),
  intentTag: z.string().optional(),
});

export type OrbitFaq = z.infer<typeof orbitFaqSchema>;

export const orbitVisualBibleSchema = z.object({
  style: z.string().optional(),
  constraints: z.array(z.string()).default([]),
  toneHints: z.array(z.string()).default([]),
  avoidList: z.array(z.string()).default([]),
});

export type OrbitVisualBible = z.infer<typeof orbitVisualBibleSchema>;

export const orbitIndexSchema = z.object({
  topics: z.array(z.string()).default([]),
  keywords: z.array(z.string()).default([]),
});

export type OrbitIndex = z.infer<typeof orbitIndexSchema>;

export const orbitPackMetaSchema = z.object({
  businessSlug: z.string(),
  version: z.string(),
  generatedAt: z.string(),
  sourceUrl: z.string(),
  schemaVersion: z.literal("v1").default("v1"),
});

export type OrbitPackMeta = z.infer<typeof orbitPackMetaSchema>;

export const orbitPackV1Schema = z.object({
  meta: orbitPackMetaSchema,
  brand: orbitBrandSchema,
  boxes: z.array(orbitBoxSchema),
  entities: orbitEntitiesSchema,
  faqs: z.array(orbitFaqSchema),
  visualBible: orbitVisualBibleSchema,
  index: orbitIndexSchema,
});

export type OrbitPackV1 = z.infer<typeof orbitPackV1Schema>;

export function createEmptyOrbitPack(businessSlug: string, sourceUrl: string): OrbitPackV1 {
  return {
    meta: {
      businessSlug,
      version: new Date().toISOString(),
      generatedAt: new Date().toISOString(),
      sourceUrl,
      schemaVersion: "v1",
    },
    brand: {
      name: "",
      taglineCandidates: [],
    },
    boxes: [],
    entities: {
      services: [],
      products: [],
      people: [],
    },
    faqs: [],
    visualBible: {
      constraints: [],
      toneHints: [],
      avoidList: [],
    },
    index: {
      topics: [],
      keywords: [],
    },
  };
}

export function generatePackVersion(): string {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

export function getPackStorageKey(businessSlug: string, version: string): string {
  return `orbits/${businessSlug}/pack-v1-${version}.json`;
}
