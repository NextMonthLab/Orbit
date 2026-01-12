import { IntentDetection, ViewType, CONFIDENCE_THRESHOLDS, ViewDecisionReasonCode } from "@shared/orbitViewEngine";

export interface ViewDecision {
  viewType: ViewType | null;
  shouldAskDisambiguation: boolean;
  disambiguationQuestion?: string;
  disambiguationOptions?: { id: string; label: string }[];
  reasonCodes: string[];
  confidence: number;
}

export function decideView(intent: IntentDetection): ViewDecision {
  const reasonCodes: string[] = [];
  const { primary_intent, entities, constraints, missing_slots, confidence } = intent;
  
  reasonCodes.push(confidence >= 0.8 ? ViewDecisionReasonCode.CONF_HIGH : 
                   confidence >= 0.65 ? ViewDecisionReasonCode.CONF_MED : 
                   ViewDecisionReasonCode.CONF_LOW);

  if (confidence < CONFIDENCE_THRESHOLDS.NO_VIEW) {
    reasonCodes.push(ViewDecisionReasonCode.FALLBACK_CHAT);
    
    if (missing_slots.length > 0) {
      reasonCodes.push(ViewDecisionReasonCode.MISSING_SLOTS);
      return {
        viewType: null,
        shouldAskDisambiguation: true,
        disambiguationQuestion: generateDisambiguationQuestion(missing_slots[0], primary_intent),
        disambiguationOptions: generateDisambiguationOptions(missing_slots[0]),
        reasonCodes,
        confidence
      };
    }
    
    return {
      viewType: null,
      shouldAskDisambiguation: false,
      reasonCodes,
      confidence
    };
  }

  const totalEntities = entities.products.length + entities.brands.length;

  if (primary_intent === "compare") {
    reasonCodes.push(ViewDecisionReasonCode.INTENT_COMPARE);
    
    if (totalEntities >= 2) {
      reasonCodes.push(ViewDecisionReasonCode.HAS_2_ENTITIES);
      return {
        viewType: "compare",
        shouldAskDisambiguation: false,
        reasonCodes,
        confidence
      };
    }
    
    return {
      viewType: null,
      shouldAskDisambiguation: true,
      disambiguationQuestion: "Which products would you like to compare?",
      disambiguationOptions: [
        { id: "top_rated", label: "Top rated options" },
        { id: "budget", label: "Budget-friendly picks" },
        { id: "premium", label: "Premium choices" }
      ],
      reasonCodes,
      confidence
    };
  }

  if (primary_intent === "recommend") {
    reasonCodes.push(ViewDecisionReasonCode.INTENT_RECOMMEND);
    
    const hasContext = constraints.use_case || entities.attributes.length > 0;
    
    if (hasContext) {
      reasonCodes.push(ViewDecisionReasonCode.HAS_USE_CASE);
      return {
        viewType: confidence >= CONFIDENCE_THRESHOLDS.LIGHT_VIEW ? "shortlist" : "shortlist",
        shouldAskDisambiguation: false,
        reasonCodes,
        confidence
      };
    }
    
    return {
      viewType: null,
      shouldAskDisambiguation: true,
      disambiguationQuestion: "What will you primarily use it for?",
      disambiguationOptions: [
        { id: "photography", label: "Photography & video" },
        { id: "productivity", label: "Work & productivity" },
        { id: "entertainment", label: "Entertainment" },
        { id: "fitness", label: "Fitness & outdoors" }
      ],
      reasonCodes,
      confidence
    };
  }

  if (primary_intent === "explain" && entities.attributes.length > 0) {
    reasonCodes.push(ViewDecisionReasonCode.INTENT_EXPLAIN);
    return {
      viewType: "checklist",
      shouldAskDisambiguation: false,
      reasonCodes,
      confidence
    };
  }

  if (primary_intent === "verify") {
    reasonCodes.push(ViewDecisionReasonCode.INTENT_VERIFY);
    return {
      viewType: "evidence",
      shouldAskDisambiguation: false,
      reasonCodes,
      confidence
    };
  }

  if (primary_intent === "summarise" || primary_intent === "browse") {
    reasonCodes.push(ViewDecisionReasonCode.INTENT_BROWSE);
    if (entities.topics.includes("trending") || entities.topics.includes("news") || entities.topics.includes("latest")) {
      return {
        viewType: "pulse",
        shouldAskDisambiguation: false,
        reasonCodes,
        confidence
      };
    }
  }

  if (primary_intent === "show_page") {
    return {
      viewType: "web_preview",
      shouldAskDisambiguation: false,
      reasonCodes,
      confidence
    };
  }

  reasonCodes.push(ViewDecisionReasonCode.FALLBACK_CHAT);
  return {
    viewType: null,
    shouldAskDisambiguation: false,
    reasonCodes,
    confidence
  };
}

function generateDisambiguationQuestion(missingSlot: string, intent: string): string {
  const questions: Record<string, string> = {
    "category": "Which category are you interested in?",
    "use_case": "What will you primarily use it for?",
    "budget": "What's your budget range?",
    "brand_preference": "Any brand preferences?",
    "products": "Which specific products are you looking at?"
  };
  
  return questions[missingSlot] || `Could you tell me more about your ${missingSlot}?`;
}

function generateDisambiguationOptions(missingSlot: string): { id: string; label: string }[] {
  const optionSets: Record<string, { id: string; label: string }[]> = {
    "category": [
      { id: "smart_glasses", label: "Smart glasses" },
      { id: "ar_headsets", label: "AR headsets" },
      { id: "vr_devices", label: "VR devices" }
    ],
    "use_case": [
      { id: "photography", label: "Photography & video" },
      { id: "productivity", label: "Work & productivity" },
      { id: "entertainment", label: "Entertainment" },
      { id: "fitness", label: "Fitness & outdoors" }
    ],
    "budget": [
      { id: "under_200", label: "Under $200" },
      { id: "200_500", label: "$200-$500" },
      { id: "over_500", label: "$500+" }
    ]
  };
  
  return optionSets[missingSlot] || [
    { id: "option_1", label: "Tell me more" },
    { id: "option_2", label: "Show popular choices" }
  ];
}
