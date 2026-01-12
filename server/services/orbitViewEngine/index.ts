import { detectIntent, extractKeyEntities } from "./intentDetector";
import { decideView, ViewDecision } from "./viewDecider";
import { fillView, generateMockViewData } from "./viewFiller";
import { logViewEngineEvent, getRecentLogs, getLogStats } from "./logger";
import { 
  AssistantResponse, 
  ViewPayload, 
  IntentDetection,
  ViewType
} from "@shared/orbitViewEngine";

export interface ViewEnginePipelineInput {
  userMessage: string;
  chatResponse: string;
  category?: string;
  recentTopics?: string[];
  sessionId?: string;
  useMockData?: boolean;
}

export interface ViewEnginePipelineResult {
  response: AssistantResponse;
  logs: {
    intent: IntentDetection;
    decision: ViewDecision;
    schemaValid: boolean;
  };
}

export async function runViewEnginePipeline(
  input: ViewEnginePipelineInput
): Promise<ViewEnginePipelineResult> {
  const { userMessage, chatResponse, category, recentTopics, sessionId, useMockData } = input;
  
  const intent = await detectIntent(userMessage, { category, recentTopics });
  
  const decision = decideView(intent);
  
  let view: ViewPayload | undefined;
  let schemaValid = true;

  if (decision.viewType) {
    const fillContext = {
      products: intent.entities.products,
      brands: intent.entities.brands,
      attributes: intent.entities.attributes,
      category
    };

    const fillResult = useMockData 
      ? generateMockViewData(decision.viewType)
      : await fillView(decision.viewType, userMessage, fillContext);
    
    if (fillResult.success && fillResult.data) {
      view = {
        type: decision.viewType,
        title: getViewTitle(decision.viewType, intent),
        data: fillResult.data as any
      };
    } else {
      schemaValid = false;
    }
  }

  const followups = generateFollowups(intent, decision);

  const response: AssistantResponse = {
    message: chatResponse,
    view,
    followups,
    disambiguation: decision.shouldAskDisambiguation ? {
      question: decision.disambiguationQuestion!,
      options: decision.disambiguationOptions!
    } : undefined,
    meta: {
      intent: intent.primary_intent,
      confidence: intent.confidence,
      reason_codes: decision.reasonCodes,
      missing_slots: intent.missing_slots
    }
  };

  logViewEngineEvent({
    session_id: sessionId,
    user_message: userMessage,
    intent: intent.primary_intent,
    view_selected: decision.viewType,
    reason_codes: decision.reasonCodes,
    missing_slots: intent.missing_slots,
    schema_valid: schemaValid,
    render_success: !!view
  });

  return {
    response,
    logs: { intent, decision, schemaValid }
  };
}

function getViewTitle(viewType: ViewType, intent: IntentDetection): string {
  const entities = [...intent.entities.products, ...intent.entities.brands];
  
  switch (viewType) {
    case "compare":
      return entities.length > 0 
        ? `Comparing ${entities.slice(0, 3).join(" vs ")}` 
        : "Product Comparison";
    case "shortlist":
      return "Top Picks";
    case "checklist":
      return "Buyer's Checklist";
    case "evidence":
      return "Evidence & Sources";
    case "pulse":
      return "What's Trending";
    case "web_preview":
      return "Source Preview";
    default:
      return "View";
  }
}

function generateFollowups(intent: IntentDetection, decision: ViewDecision): string[] {
  const followups: string[] = [];
  
  if (decision.viewType === "compare") {
    followups.push("Which one has the best value?");
    followups.push("Show me detailed specs");
    followups.push("What are users saying?");
  } else if (decision.viewType === "shortlist") {
    followups.push("Compare these options");
    followups.push("Show me alternatives");
    followups.push("What should I avoid?");
  } else if (decision.viewType === "checklist") {
    followups.push("Show me top recommendations");
    followups.push("What's most important?");
    followups.push("Any red flags to watch for?");
  } else if (decision.viewType === "evidence") {
    followups.push("Show me more sources");
    followups.push("What do experts say?");
    followups.push("Any counter-arguments?");
  } else {
    followups.push("Compare top options");
    followups.push("What's best for my needs?");
    followups.push("Tell me more");
  }
  
  return followups.slice(0, 4);
}

export { getRecentLogs, getLogStats };
export { detectIntent } from "./intentDetector";
export { decideView } from "./viewDecider";
export { fillView } from "./viewFiller";
