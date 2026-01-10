import { z } from "zod";

export const ViewTypeEnum = z.enum([
  "compare",
  "shortlist", 
  "checklist",
  "evidence",
  "pulse",
  "web_preview"
]);
export type ViewType = z.infer<typeof ViewTypeEnum>;

export const IntentTypeEnum = z.enum([
  "compare",
  "recommend",
  "explain",
  "summarise",
  "verify",
  "browse",
  "show_page",
  "unknown"
]);
export type IntentType = z.infer<typeof IntentTypeEnum>;

export const IntentDetectionSchema = z.object({
  primary_intent: IntentTypeEnum,
  entities: z.object({
    products: z.array(z.string()).default([]),
    brands: z.array(z.string()).default([]),
    attributes: z.array(z.string()).default([]),
    topics: z.array(z.string()).default([])
  }),
  constraints: z.object({
    budget: z.string().nullable().default(null),
    use_case: z.string().nullable().default(null),
    region: z.string().nullable().default(null)
  }),
  missing_slots: z.array(z.string()).default([]),
  confidence: z.number().min(0).max(1)
});
export type IntentDetection = z.infer<typeof IntentDetectionSchema>;

export const CompareRowSchema = z.object({
  id: z.string(),
  name: z.string(),
  brand: z.string().optional(),
  image: z.string().optional(),
  price: z.string().optional(),
  attributes: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])),
  verdict: z.string().optional(),
  score: z.number().optional()
});
export type CompareRow = z.infer<typeof CompareRowSchema>;

export const CompareViewDataSchema = z.object({
  columns: z.array(z.object({
    key: z.string(),
    label: z.string(),
    priority: z.enum(["high", "medium", "low"]).default("medium")
  })),
  rows: z.array(CompareRowSchema),
  verdict: z.string().optional(),
  winner_id: z.string().optional()
});
export type CompareViewData = z.infer<typeof CompareViewDataSchema>;

export const ShortlistItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  brand: z.string().optional(),
  image: z.string().optional(),
  price: z.string().optional(),
  why: z.string(),
  tradeoffs: z.array(z.string()).default([]),
  score: z.number().optional(),
  best_for: z.string().optional()
});
export type ShortlistItem = z.infer<typeof ShortlistItemSchema>;

export const ShortlistViewDataSchema = z.object({
  title: z.string().optional(),
  items: z.array(ShortlistItemSchema),
  criteria: z.string().optional()
});
export type ShortlistViewData = z.infer<typeof ShortlistViewDataSchema>;

export const ChecklistItemSchema = z.object({
  id: z.string(),
  label: z.string(),
  description: z.string().optional(),
  priority: z.enum(["must_have", "nice_to_have", "dealbreaker"]),
  checked: z.boolean().default(false)
});
export type ChecklistItem = z.infer<typeof ChecklistItemSchema>;

export const ChecklistViewDataSchema = z.object({
  title: z.string().optional(),
  items: z.array(ChecklistItemSchema),
  summary: z.string().optional()
});
export type ChecklistViewData = z.infer<typeof ChecklistViewDataSchema>;

export const EvidenceClaimSchema = z.object({
  id: z.string(),
  claim: z.string(),
  confidence: z.enum(["high", "medium", "low"]),
  sources: z.array(z.object({
    title: z.string(),
    url: z.string().optional(),
    snippet: z.string().optional()
  })).default([])
});
export type EvidenceClaim = z.infer<typeof EvidenceClaimSchema>;

export const EvidenceViewDataSchema = z.object({
  title: z.string().optional(),
  claims: z.array(EvidenceClaimSchema),
  summary: z.string().optional()
});
export type EvidenceViewData = z.infer<typeof EvidenceViewDataSchema>;

export const PulseItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  type: z.enum(["trending", "new", "changed", "dropped"]),
  sentiment: z.enum(["positive", "neutral", "negative"]).optional(),
  description: z.string().optional(),
  date: z.string().optional()
});
export type PulseItem = z.infer<typeof PulseItemSchema>;

export const PulseViewDataSchema = z.object({
  title: z.string().optional(),
  items: z.array(PulseItemSchema),
  summary: z.string().optional()
});
export type PulseViewData = z.infer<typeof PulseViewDataSchema>;

export const WebPreviewViewDataSchema = z.object({
  url: z.string(),
  title: z.string().optional(),
  description: z.string().optional()
});
export type WebPreviewViewData = z.infer<typeof WebPreviewViewDataSchema>;

export const ViewPayloadSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("compare"), title: z.string().optional(), data: CompareViewDataSchema }),
  z.object({ type: z.literal("shortlist"), title: z.string().optional(), data: ShortlistViewDataSchema }),
  z.object({ type: z.literal("checklist"), title: z.string().optional(), data: ChecklistViewDataSchema }),
  z.object({ type: z.literal("evidence"), title: z.string().optional(), data: EvidenceViewDataSchema }),
  z.object({ type: z.literal("pulse"), title: z.string().optional(), data: PulseViewDataSchema }),
  z.object({ type: z.literal("web_preview"), title: z.string().optional(), data: WebPreviewViewDataSchema })
]);
export type ViewPayload = z.infer<typeof ViewPayloadSchema>;

export const DisambiguationOptionSchema = z.object({
  id: z.string(),
  label: z.string()
});
export type DisambiguationOption = z.infer<typeof DisambiguationOptionSchema>;

export const DisambiguationSchema = z.object({
  question: z.string(),
  options: z.array(DisambiguationOptionSchema)
});
export type Disambiguation = z.infer<typeof DisambiguationSchema>;

export const ResponseMetaSchema = z.object({
  intent: z.string(),
  confidence: z.number(),
  reason_codes: z.array(z.string()),
  missing_slots: z.array(z.string())
});
export type ResponseMeta = z.infer<typeof ResponseMetaSchema>;

export const AssistantResponseSchema = z.object({
  message: z.string(),
  view: ViewPayloadSchema.optional(),
  followups: z.array(z.string()).optional(),
  disambiguation: DisambiguationSchema.optional(),
  meta: ResponseMetaSchema.optional()
});
export type AssistantResponse = z.infer<typeof AssistantResponseSchema>;

export const ViewDecisionReasonCode = {
  INTENT_COMPARE: "INTENT_COMPARE",
  INTENT_RECOMMEND: "INTENT_RECOMMEND", 
  INTENT_EXPLAIN: "INTENT_EXPLAIN",
  INTENT_VERIFY: "INTENT_VERIFY",
  INTENT_BROWSE: "INTENT_BROWSE",
  HAS_2_ENTITIES: "HAS_2_ENTITIES",
  HAS_USE_CASE: "HAS_USE_CASE",
  CONF_HIGH: "CONF_HIGH",
  CONF_MED: "CONF_MED",
  CONF_LOW: "CONF_LOW",
  MISSING_SLOTS: "MISSING_SLOTS",
  FALLBACK_CHAT: "FALLBACK_CHAT"
} as const;

export const ViewEngineLogSchema = z.object({
  timestamp: z.string(),
  session_id: z.string().optional(),
  user_message: z.string(),
  intent: z.string(),
  view_selected: z.string().nullable(),
  reason_codes: z.array(z.string()),
  missing_slots: z.array(z.string()),
  schema_valid: z.boolean(),
  render_success: z.boolean().optional(),
  error: z.string().optional()
});
export type ViewEngineLog = z.infer<typeof ViewEngineLogSchema>;

export const CONFIDENCE_THRESHOLDS = {
  NO_VIEW: 0.65,
  LIGHT_VIEW: 0.8,
  FULL_VIEW: 1.0
} as const;

export function validateViewData(type: ViewType, data: unknown): { valid: boolean; error?: string } {
  try {
    switch (type) {
      case "compare":
        CompareViewDataSchema.parse(data);
        break;
      case "shortlist":
        ShortlistViewDataSchema.parse(data);
        break;
      case "checklist":
        ChecklistViewDataSchema.parse(data);
        break;
      case "evidence":
        EvidenceViewDataSchema.parse(data);
        break;
      case "pulse":
        PulseViewDataSchema.parse(data);
        break;
      case "web_preview":
        WebPreviewViewDataSchema.parse(data);
        break;
    }
    return { valid: true };
  } catch (e) {
    return { valid: false, error: e instanceof Error ? e.message : "Validation failed" };
  }
}
