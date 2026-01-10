import OpenAI from "openai";
import { 
  ViewType, 
  CompareViewData, 
  ShortlistViewData, 
  ChecklistViewData,
  EvidenceViewData,
  PulseViewData,
  WebPreviewViewData,
  validateViewData
} from "@shared/orbitViewEngine";

const openai = new OpenAI();

export interface ViewFillResult {
  success: boolean;
  data?: CompareViewData | ShortlistViewData | ChecklistViewData | EvidenceViewData | PulseViewData | WebPreviewViewData;
  error?: string;
}

const VIEW_FILL_PROMPTS: Record<ViewType, string> = {
  compare: `Generate a product comparison table. Respond with ONLY valid JSON:
{
  "columns": [{"key": "attribute_key", "label": "Display Label", "priority": "high|medium|low"}],
  "rows": [{"id": "unique_id", "name": "Product Name", "brand": "Brand", "price": "$X", "attributes": {"key": "value"}, "verdict": "Brief verdict", "score": 0-100}],
  "verdict": "Overall comparison verdict",
  "winner_id": "id of recommended option"
}`,
  
  shortlist: `Generate a curated shortlist of recommendations. Respond with ONLY valid JSON:
{
  "title": "Your Top Picks",
  "items": [{"id": "unique_id", "name": "Product Name", "brand": "Brand", "price": "$X", "why": "Why this is recommended", "tradeoffs": ["Potential downsides"], "score": 0-100, "best_for": "Ideal use case"}],
  "criteria": "Selection criteria used"
}`,
  
  checklist: `Generate a buyer's checklist. Respond with ONLY valid JSON:
{
  "title": "Checklist Title",
  "items": [{"id": "unique_id", "label": "What to check", "description": "Why it matters", "priority": "must_have|nice_to_have|dealbreaker", "checked": false}],
  "summary": "Key takeaway"
}`,
  
  evidence: `Generate an evidence-based analysis. Respond with ONLY valid JSON:
{
  "title": "Analysis Title",
  "claims": [{"id": "unique_id", "claim": "The claim being evaluated", "confidence": "high|medium|low", "sources": [{"title": "Source title", "url": "optional_url", "snippet": "relevant quote"}]}],
  "summary": "Overall verdict"
}`,
  
  pulse: `Generate a trends/pulse overview. Respond with ONLY valid JSON:
{
  "title": "What's Happening",
  "items": [{"id": "unique_id", "title": "Trend title", "type": "trending|new|changed|dropped", "sentiment": "positive|neutral|negative", "description": "Brief description", "date": "YYYY-MM-DD"}],
  "summary": "Key insights"
}`,
  
  web_preview: `Generate a web preview card. Respond with ONLY valid JSON:
{
  "url": "https://example.com",
  "title": "Page title",
  "description": "Page description"
}`
};

export async function fillView(
  viewType: ViewType,
  userMessage: string,
  context?: { products?: string[]; brands?: string[]; attributes?: string[]; category?: string }
): Promise<ViewFillResult> {
  const systemPrompt = VIEW_FILL_PROMPTS[viewType];
  
  const contextParts: string[] = [];
  if (context?.products?.length) contextParts.push(`Products: ${context.products.join(', ')}`);
  if (context?.brands?.length) contextParts.push(`Brands: ${context.brands.join(', ')}`);
  if (context?.attributes?.length) contextParts.push(`Attributes of interest: ${context.attributes.join(', ')}`);
  if (context?.category) contextParts.push(`Category: ${context.category}`);
  
  const contextString = contextParts.length > 0 ? `\n\nContext:\n${contextParts.join('\n')}` : '';

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `${userMessage}${contextString}` }
      ],
      response_format: { type: "json_object" },
      temperature: 0.5,
      max_tokens: 2000
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return { success: false, error: "No content in response" };
    }

    const data = JSON.parse(content);
    
    const validation = validateViewData(viewType, data);
    if (!validation.valid) {
      console.error(`[ViewEngine] Schema validation failed for ${viewType}:`, validation.error);
      return { success: false, error: validation.error };
    }

    return { success: true, data };

  } catch (error) {
    console.error(`[ViewEngine] View fill error for ${viewType}:`, error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to generate view data" 
    };
  }
}

export function generateMockViewData(viewType: ViewType): ViewFillResult {
  switch (viewType) {
    case "compare":
      return {
        success: true,
        data: {
          columns: [
            { key: "camera", label: "Camera", priority: "high" as const },
            { key: "battery", label: "Battery", priority: "high" as const },
            { key: "display", label: "Display", priority: "medium" as const },
            { key: "weight", label: "Weight", priority: "low" as const }
          ],
          rows: [
            { id: "1", name: "Ray-Ban Meta", brand: "Meta", price: "$299", attributes: { camera: "12MP", battery: "4hrs", display: "None", weight: "51g" }, verdict: "Best for social sharing", score: 85 },
            { id: "2", name: "Xreal Air 2", brand: "Xreal", price: "$399", attributes: { camera: "None", battery: "3hrs", display: "OLED", weight: "72g" }, verdict: "Best AR display", score: 82 },
            { id: "3", name: "Vuzix Blade 2", brand: "Vuzix", price: "$699", attributes: { camera: "8MP", battery: "2.5hrs", display: "Waveguide", weight: "68g" }, verdict: "Enterprise focused", score: 75 }
          ],
          verdict: "Ray-Ban Meta offers the best balance of features and price for everyday use.",
          winner_id: "1"
        } as CompareViewData
      };
      
    case "shortlist":
      return {
        success: true,
        data: {
          title: "Top Picks for You",
          items: [
            { id: "1", name: "Ray-Ban Meta", brand: "Meta", price: "$299", why: "Best camera quality and social integration", tradeoffs: ["No AR display"], score: 90, best_for: "Content creators" },
            { id: "2", name: "Xreal Air 2 Ultra", brand: "Xreal", price: "$699", why: "Immersive AR experience with spatial computing", tradeoffs: ["Higher price", "Needs phone"], score: 85, best_for: "AR enthusiasts" },
            { id: "3", name: "Even H3", brand: "Even", price: "$249", why: "Excellent audio quality, prescription-ready", tradeoffs: ["No camera or display"], score: 80, best_for: "Audio-first users" }
          ],
          criteria: "Based on overall value, user reviews, and feature set"
        } as ShortlistViewData
      };
      
    default:
      return { success: false, error: `Mock data not available for ${viewType}` };
  }
}
