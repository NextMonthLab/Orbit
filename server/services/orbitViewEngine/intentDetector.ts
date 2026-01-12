import OpenAI from "openai";
import { IntentDetection, IntentDetectionSchema, IntentType } from "@shared/orbitViewEngine";

const openai = new OpenAI();

const INTENT_DETECTION_PROMPT = `You are an intent classifier for a smart product discovery system. Given the user's message and context, classify their intent and extract relevant entities.

Respond with ONLY valid JSON matching this schema:
{
  "primary_intent": "compare" | "recommend" | "explain" | "summarise" | "verify" | "browse" | "show_page" | "unknown",
  "entities": {
    "products": ["list of specific product names mentioned"],
    "brands": ["list of brand names mentioned"],
    "attributes": ["list of features/attributes discussed, e.g., 'battery life', 'camera quality'"],
    "topics": ["list of general topics, e.g., 'smart glasses', 'AR']
  },
  "constraints": {
    "budget": "price constraint if mentioned, else null",
    "use_case": "use case if mentioned (e.g., 'photography', 'gaming'), else null",
    "region": "region/country if mentioned, else null"
  },
  "missing_slots": ["list of information that would help provide a better response"],
  "confidence": 0.0 to 1.0
}

Intent definitions:
- compare: User wants to see differences between 2+ specific products/options
- recommend: User wants suggestions based on criteria/use case
- explain: User wants to understand a concept, feature, or how something works
- summarise: User wants a condensed overview of a topic
- verify: User wants to fact-check a claim or confirm information
- browse: User is exploring without specific goal
- show_page: User explicitly asks to view a specific webpage/source
- unknown: Cannot determine intent`;

export async function detectIntent(
  userMessage: string,
  context?: { category?: string; recentTopics?: string[] }
): Promise<IntentDetection> {
  const contextString = context 
    ? `Category: ${context.category || 'general'}. Recent topics: ${context.recentTopics?.join(', ') || 'none'}.`
    : '';

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: INTENT_DETECTION_PROMPT },
        { role: "user", content: `${contextString}\n\nUser message: "${userMessage}"` }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 500
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return getDefaultIntent(userMessage);
    }

    const parsed = JSON.parse(content);
    const validated = IntentDetectionSchema.parse(parsed);
    return validated;

  } catch (error) {
    console.error("[ViewEngine] Intent detection error:", error);
    return getDefaultIntent(userMessage);
  }
}

function getDefaultIntent(message: string): IntentDetection {
  const lowerMessage = message.toLowerCase();
  
  let intent: IntentType = "unknown";
  if (lowerMessage.includes("compare") || lowerMessage.includes("vs") || lowerMessage.includes("versus")) {
    intent = "compare";
  } else if (lowerMessage.includes("best") || lowerMessage.includes("recommend") || lowerMessage.includes("suggest")) {
    intent = "recommend";
  } else if (lowerMessage.includes("what is") || lowerMessage.includes("how does") || lowerMessage.includes("explain")) {
    intent = "explain";
  } else if (lowerMessage.includes("summary") || lowerMessage.includes("overview")) {
    intent = "summarise";
  }

  return {
    primary_intent: intent,
    entities: { products: [], brands: [], attributes: [], topics: [] },
    constraints: { budget: null, use_case: null, region: null },
    missing_slots: [],
    confidence: 0.5
  };
}

export function extractKeyEntities(message: string): string[] {
  const words = message.split(/\s+/);
  const entities: string[] = [];
  
  const stopWords = new Set(['the', 'a', 'an', 'is', 'are', 'was', 'what', 'which', 'how', 'why', 'when', 'where', 'can', 'do', 'does', 'i', 'me', 'my', 'you', 'your', 'we', 'they', 'it', 'this', 'that', 'these', 'those', 'for', 'with', 'about', 'between', 'and', 'or', 'but', 'if', 'to', 'of', 'in', 'on', 'at', 'by', 'from']);
  
  words.forEach(word => {
    const clean = word.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (clean.length > 2 && !stopWords.has(clean)) {
      entities.push(clean);
    }
  });
  
  return entities.slice(0, 10);
}
