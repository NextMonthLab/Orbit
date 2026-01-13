import OpenAI from 'openai';
import type { IStorage } from '../storage';

export interface OrbitChatContext {
  slug: string;
  brandName: string;
  sourceDomain: string;
  siteSummary?: string;
  keyServices?: string[];
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ProofCaptureConfig {
  enabled: boolean;
  triggeredAt: Date | null;
  history: ChatMessage[];
}

export interface ChatResult {
  response: string;
  proofCaptureFlow?: any;
  suggestionChip?: { text: string; action: string };
  praiseDetected?: string[];
}

const DOCUMENT_CATEGORY_LABELS: Record<string, string> = {
  products: 'Products & Services Info',
  pricing: 'Pricing Information',
  policies: 'Policies & Terms',
  guides: 'How-to Guides',
  faqs: 'FAQs',
  company: 'Company Information',
  other: 'Additional Information',
};

export async function buildOrbitContext(
  storage: IStorage,
  slug: string
): Promise<{
  productContext: string;
  documentContext: string;
  heroPostContext: string;
  videoContext: string;
  videos: { id: number; title: string; tags: string[]; topics: string[]; youtubeVideoId: string; thumbnailUrl: string | null; description: string | null }[];
  businessType: 'recruitment' | 'restaurant' | 'professional_services' | 'retail' | 'general';
  businessTypeLabel: string;
  offeringsLabel: string;
  items: any[];
}> {
  const boxes = await storage.getOrbitBoxes(slug);
  const documents = await storage.getOrbitDocuments(slug);
  const readyDocs = documents.filter(d => d.status === 'ready' && d.extractedText);
  
  // Get hero posts marked as knowledge sources
  const heroPostsAsKnowledge = await storage.getHeroPostsAsKnowledge(slug);
  
  // Get enabled videos for chat suggestions
  const enabledVideos = await storage.getOrbitVideos(slug, true);
  
  const items = boxes.slice(0, 60).map(b => ({
    name: b.title,
    description: b.description,
    price: b.price,
    category: b.category,
    boxType: b.boxType,
  }));

  let documentContext = '';
  if (readyDocs.length > 0) {
    const docsByCategory: Record<string, typeof readyDocs> = {};
    for (const doc of readyDocs) {
      const cat = doc.category || 'other';
      if (!docsByCategory[cat]) docsByCategory[cat] = [];
      docsByCategory[cat].push(doc);
    }
    
    const docSections: string[] = [];
    for (const [category, docs] of Object.entries(docsByCategory)) {
      const label = DOCUMENT_CATEGORY_LABELS[category] || 'Additional Information';
      const docsContent = docs.map(d => {
        const text = d.extractedText?.slice(0, 3000) || '';
        return `[${d.title || d.fileName}]\n${text}`;
      }).join('\n\n');
      
      docSections.push(`### ${label}:\n${docsContent}`);
    }
    
    documentContext = `\n\nUPLOADED DOCUMENTS:\n${docSections.join('\n\n')}\n`;
  }

  let productContext = '';
  const productBoxes = boxes.filter(b => b.boxType === 'product' || b.boxType === 'menu_item');
  
  if (productBoxes.length > 0) {
    const categoryMap = new Map<string, typeof productBoxes>();
    for (const box of productBoxes) {
      const cat = box.category || 'Other';
      if (!categoryMap.has(cat)) {
        categoryMap.set(cat, []);
      }
      categoryMap.get(cat)!.push(box);
    }
    
    const catalogueSummary: string[] = [];
    catalogueSummary.push(`\nCATALOGUE (${productBoxes.length} items):`);
    
    for (const [category, catItems] of Array.from(categoryMap.entries())) {
      const sortedItems = [...catItems].sort((a: any, b: any) => 
        (b.popularityScore || 0) - (a.popularityScore || 0)
      ).slice(0, 5);
      
      catalogueSummary.push(`\n${category} (${catItems.length} total):`);
      for (const item of sortedItems) {
        const priceNum = item.price != null ? Number(item.price) : null;
        const priceStr = priceNum != null && !isNaN(priceNum) ? ` - ${item.currency || '£'}${priceNum.toFixed(2)}` : '';
        catalogueSummary.push(`  • ${item.title}${priceStr}`);
        if (item.description) {
          catalogueSummary.push(`    ${item.description.slice(0, 100)}...`);
        }
      }
      if (catItems.length > 5) {
        catalogueSummary.push(`  • ...and ${catItems.length - 5} more items`);
      }
    }
    
    productContext = catalogueSummary.join('\n');
  }

  const boxTypeCounts: Record<string, number> = {};
  for (const box of boxes) {
    boxTypeCounts[box.boxType] = (boxTypeCounts[box.boxType] || 0) + 1;
  }
  
  const hasMenuItems = (boxTypeCounts['menu_item'] || 0) > 0;
  const hasProducts = (boxTypeCounts['product'] || 0) > 0;
  
  const slugLower = slug.toLowerCase();
  const allTitles = boxes.map(b => b.title?.toLowerCase() || '').join(' ');
  const allDescriptions = boxes.map(b => b.description?.toLowerCase() || '').join(' ');
  const allContent = `${slugLower} ${allTitles} ${allDescriptions}`;
  
  type BusinessType = 'recruitment' | 'restaurant' | 'professional_services' | 'retail' | 'general';
  let businessType: BusinessType = 'general';
  let businessTypeLabel = 'business';
  let offeringsLabel = 'services';
  
  const recruitmentKeywords = ['employment', 'recruitment', 'jobs', 'careers', 'staffing', 'hiring', 'vacancies', 'candidates', 'cv', 'resume'];
  const isRecruitment = recruitmentKeywords.some(k => allContent.includes(k));
  
  const foodKeywords = ['menu', 'restaurant', 'cafe', 'bistro', 'pub', 'bar', 'food', 'dining', 'kitchen', 'chef', 'dish'];
  const isFood = hasMenuItems || foodKeywords.some(k => allContent.includes(k));
  
  const servicesKeywords = ['agency', 'consulting', 'marketing', 'digital', 'design', 'web', 'software', 'solutions'];
  const isServices = servicesKeywords.some(k => allContent.includes(k));
  
  if (isRecruitment) {
    businessType = 'recruitment';
    businessTypeLabel = 'recruitment agency';
    offeringsLabel = 'job opportunities and services';
  } else if (isFood && hasMenuItems) {
    businessType = 'restaurant';
    businessTypeLabel = 'restaurant';
    offeringsLabel = 'menu';
  } else if (hasProducts) {
    businessType = 'retail';
    businessTypeLabel = 'business';
    offeringsLabel = 'products';
  } else if (isServices) {
    businessType = 'professional_services';
    businessTypeLabel = 'agency';
    offeringsLabel = 'services';
  }

  // Build hero post knowledge context
  let heroPostContext = '';
  if (heroPostsAsKnowledge.length > 0) {
    const postsSummary = heroPostsAsKnowledge.slice(0, 10).map((post: any) => {
      const topics = post.extracted?.topics?.join(', ') || '';
      return `[${post.sourcePlatform}] ${post.title || 'Post'}\n${post.text?.slice(0, 500) || ''}${topics ? `\nTopics: ${topics}` : ''}`;
    }).join('\n\n');
    
    heroPostContext = `\n\nBRAND INSIGHTS (From our published content):\n${postsSummary}\n`;
  }

  // Build video context for suggestions
  let videoContext = '';
  const videos = enabledVideos.map((v: any) => ({
    id: v.id,
    title: v.title,
    tags: (v.tags as string[]) || [],
    topics: (v.topics as string[]) || [],
    youtubeVideoId: v.youtubeVideoId,
    thumbnailUrl: v.thumbnailUrl,
    description: v.description,
  }));
  
  if (videos.length > 0) {
    const videoList = videos.slice(0, 10).map((v: any) => 
      `- [ID:${v.id}] "${v.title}" (${v.tags.join(', ') || 'no tags'})`
    ).join('\n');
    
    videoContext = `\n\nAVAILABLE VIDEOS:
${videoList}

IMPORTANT: When a video is highly relevant to the user's question, include [VIDEO:id] at the END of your response (e.g. [VIDEO:${videos[0]?.id || 1}]). Only suggest ONE video per response, and only if it directly answers their question.\n`;
  }

  return {
    productContext,
    documentContext,
    heroPostContext,
    videoContext,
    videos,
    businessType,
    businessTypeLabel,
    offeringsLabel,
    items,
  };
}

/**
 * Builds intent-specific guidance for AI responses
 */
function buildIntentGuidance(intentChain?: string, conversationStage?: string): string {
  if (!intentChain) return '';

  let guidance = '\n## Intent-Specific Guidance:\n';

  switch (intentChain) {
    case 'product_exploration':
      guidance += `The user is **exploring options**. ${conversationStage === 'initial_contact' ? 'This is their first message.' : 'They are learning about what you offer.'}\n`;
      guidance += '- Highlight 2-3 specific items that match their interest\n';
      guidance += '- Mention variety/range if relevant\n';
      guidance += '- Be enthusiastic but not pushy\n';
      if (conversationStage === 'deepening') {
        guidance += '- They\'re getting interested - offer comparisons or recommendations\n';
      }
      break;

    case 'purchase_consideration':
      guidance += `The user is **evaluating and comparing**. They are seriously considering options.\n`;
      guidance += '- Focus on differentiators and benefits\n';
      guidance += '- Be specific about features, pricing, value\n';
      guidance += '- Help them make an informed decision\n';
      guidance += '- If they seem ready, gently suggest next steps (booking/contact)\n';
      break;

    case 'transactional_action':
      guidance += `The user is **ready to take action**. They want to buy, book, or contact.\n`;
      guidance += '- Provide clear, direct instructions\n';
      guidance += '- Include contact details, booking links, or purchase steps\n';
      guidance += '- Remove any friction - make it easy\n';
      guidance += '- Confirm what they need to do next\n';
      break;

    case 'support_inquiry':
      guidance += `The user **needs help** with a problem or question.\n`;
      guidance += '- Be empathetic and solution-focused\n';
      guidance += '- Provide actionable steps to resolve their issue\n';
      guidance += '- Offer contact details for further support if needed\n';
      guidance += '- Acknowledge their concern before solving\n';
      break;

    case 'information_gathering':
      guidance += `The user is **researching and learning**. They want facts and details.\n`;
      guidance += '- Be informative and specific\n';
      guidance += '- Cite concrete examples from available data\n';
      guidance += '- Structure information clearly\n';
      guidance += '- Avoid marketing language - focus on facts\n';
      break;

    case 'casual_conversation':
      guidance += `The user is **casually chatting**. Keep it light and friendly.\n`;
      guidance += '- Match their conversational tone\n';
      guidance += '- Offer to help with something specific\n';
      guidance += '- Don\'t force a sale or specific direction\n';
      break;
  }

  // Stage-specific additional guidance
  if (conversationStage === 'stuck') {
    guidance += '\n**IMPORTANT**: The user seems stuck or confused. Offer to:\n';
    guidance += '- Rephrase their question to confirm understanding\n';
    guidance += '- Show popular options to give them a starting point\n';
    guidance += '- Ask a clarifying question to understand their need\n';
  }

  if (conversationStage === 'decision' && intentChain !== 'transactional_action') {
    guidance += '\n**OPPORTUNITY**: The user is in decision mode. Help them:\n';
    guidance += '- Make the final choice confidently\n';
    guidance += '- Understand the next steps clearly\n';
  }

  return guidance;
}

export function buildSystemPrompt(
  context: OrbitChatContext,
  productContext: string,
  documentContext: string,
  businessType: string,
  businessTypeLabel: string,
  offeringsLabel: string,
  items: any[],
  heroPostContext: string = '',
  videoContext: string = '',
  intentChain?: string,
  conversationStage?: string
): string {
  const { brandName, sourceDomain, siteSummary, keyServices } = context;

  let contextSummary = '';
  if (businessType === 'recruitment') {
    const jobItems = items.filter((i: any) => i.category || i.description);
    contextSummary = `## Our Roles & Services:\n${jobItems.slice(0, 30).map((item: any) => 
      `- ${item.name}${item.category ? ` [${item.category}]` : ''}${item.description ? `: ${item.description.slice(0, 80)}` : ''}`
    ).join('\n')}`;
  } else if (businessType === 'restaurant') {
    contextSummary = `## Our Menu:\n${items.slice(0, 40).map((item: any) => 
      `- ${item.name}${item.price ? ` (£${item.price})` : ''}${item.category ? ` [${item.category}]` : ''}${item.description ? `: ${item.description.slice(0, 80)}` : ''}`
    ).join('\n')}`;
  } else {
    contextSummary = `## Our ${offeringsLabel.charAt(0).toUpperCase() + offeringsLabel.slice(1)}:\n${items.slice(0, 40).map((item: any) => 
      `- ${item.name}${item.price ? ` (£${item.price})` : ''}${item.category ? ` [${item.category}]` : ''}${item.description ? `: ${item.description.slice(0, 80)}` : ''}`
    ).join('\n')}`;
  }

  let narrativeSection = '';
  if (businessType === 'recruitment') {
    narrativeSection = `### NARRATIVE QUERIES (Engage conversationally):
For questions about job roles, requirements, salary expectations, industries we cover, application process, CV advice, or employer services.
→ Be helpful and informative. Use the job/service data to give informed answers.`;
  } else if (businessType === 'restaurant') {
    narrativeSection = `### NARRATIVE QUERIES (Engage conversationally):
For questions about menu items, recommendations, ingredients, dietary options, taste profiles, or brand story.
→ Be friendly, helpful, and conversational. Use the menu data to give informed answers.`;
  } else {
    narrativeSection = `### NARRATIVE QUERIES (Engage conversationally):
For questions about our ${offeringsLabel}, how we can help, our approach, or brand story.
→ Be friendly, helpful, and conversational.`;
  }

  let servicesSection = '';
  if (keyServices && keyServices.length > 0) {
    servicesSection = `\nSERVICES:\n${keyServices.map((s: string) => `• ${s}`).join('\n')}\n`;
  }

  let siteContext = '';
  if (siteSummary) {
    siteContext = `\nCONTEXT:\n${siteSummary}\n`;
  }

  return `You are a helpful assistant for ${brandName}, a ${businessTypeLabel}. You help visitors learn about our ${offeringsLabel} and find what they need.
${siteContext}${servicesSection}
${contextSummary}
${documentContext}${heroPostContext}${videoContext}
## Response Guidelines:

### TRANSACTIONAL QUERIES (Answer directly):
1. **Contact/Get in Touch**: Provide contact options. Suggest visiting ${sourceDomain || 'our website'}.
2. **Locations/Branches**: Help them find locations or suggest checking the website.
3. **Opening Hours**: Provide hours if known, otherwise suggest checking the website.

${narrativeSection}

### LOW-SIGNAL (Brief, polite):
For greetings, thanks, or unclear messages: Brief, warm response. Offer to help with something specific.

## Response Rules:
- Be friendly and helpful - never leave questions unanswered
- Keep responses concise (2-4 sentences max)
- If you genuinely don't have information, say so and suggest where to find it
- Lead with value, not filler like "Great question!" or "I'd be happy to..."
- Never repeat the same information twice in one response
${productContext ? '- For product/menu queries: cite specific items with prices when relevant' : ''}
${videoContext ? '- If a video is highly relevant to the question, suggest watching it for more detail' : ''}

### EDIT/CONTROL REQUESTS (Calm Deferral):
If the user asks to edit tiles, change content, add information, customize the interface, or control how Orbit works, respond calmly:
"I can explain how this works for now. Owner controls come later once the intelligence is established."
Do not promise editing features or suggest they're available. This is the orientation phase.

${buildIntentGuidance(intentChain, conversationStage)}`;
}

export async function processProofCapture(
  message: string,
  config: ProofCaptureConfig
): Promise<{
  intercepted: boolean;
  response?: string;
  proofCaptureFlow?: any;
  suggestionChip?: { text: string; action: string };
  classificationResult?: { praiseKeywordsFound: string[] };
}> {
  if (!config.enabled) {
    return { intercepted: false };
  }

  const { 
    classifyTestimonialMoment, 
    shouldTriggerProofCapture, 
    getContextQuestion, 
    getConsentRequest,
    isDetailedPraiseResponse,
    parseConsentResponse,
    getConsentFollowup
  } = await import('./proofCapture');

  const recentUserMessages = config.history
    .filter(h => h.role === 'user')
    .slice(-5)
    .map(h => h.content);
  
  const recentAssistantMessages = config.history
    .filter(h => h.role === 'assistant')
    .slice(-3)
    .map(h => h.content);

  const lastAssistantMsg = recentAssistantMessages[recentAssistantMessages.length - 1] || '';
  
  const isInContextQuestionStage = 
    lastAssistantMsg.includes("I'd love to know more") ||
    lastAssistantMsg.includes("what was the highlight") ||
    lastAssistantMsg.includes("what stood out") ||
    lastAssistantMsg.includes("what was the main thing") ||
    lastAssistantMsg.includes("what would you say") ||
    lastAssistantMsg.includes("Tell me more about what") ||
    lastAssistantMsg.includes("what is it about") ||
    lastAssistantMsg.includes("what impressed you") ||
    lastAssistantMsg.includes("what makes it special");
  
  const isInConsentStage = lastAssistantMsg.includes('Would you be happy for us to use your comment');

  console.log('[ProofCapture:Unified] Flow state - Context stage:', isInContextQuestionStage, 'Consent stage:', isInConsentStage);

  if (isInConsentStage) {
    const consentResponse = parseConsentResponse(message);
    console.log('[ProofCapture:Unified] Consent response:', consentResponse);
    
    if (consentResponse) {
      const followup = getConsentFollowup(consentResponse);
      return {
        intercepted: true,
        response: followup,
        proofCaptureFlow: {
          stage: 'consent_received',
          consentType: consentResponse,
        },
      };
    }
  } else if (isInContextQuestionStage) {
    const detailCheck = await isDetailedPraiseResponse(message, recentUserMessages);
    console.log('[ProofCapture:Unified] Detail check:', JSON.stringify(detailCheck));
    
    if (detailCheck.hasDetail) {
      const consentInfo = getConsentRequest();
      return {
        intercepted: true,
        response: `That's wonderful feedback, thank you for sharing!\n\nWould you be happy for us to use your comment as a testimonial?\n\n• ${consentInfo.options.join('\n• ')}`,
        proofCaptureFlow: {
          stage: 'consent_request',
          expandedQuote: detailCheck.combinedQuote,
          consentOptions: consentInfo.options,
        },
      };
    }
  } else if (!config.triggeredAt) {
    const classification = await classifyTestimonialMoment(message, recentUserMessages);
    
    console.log('[ProofCapture:Unified] Classification for message:', message);
    console.log('[ProofCapture:Unified] Result:', JSON.stringify(classification));
    
    const proofCaptureTrigger = shouldTriggerProofCapture(
      config.enabled,
      config.triggeredAt,
      classification
    );
    
    console.log('[ProofCapture:Unified] Trigger decision:', JSON.stringify(proofCaptureTrigger));
    
    if (proofCaptureTrigger.shouldTrigger) {
      const topicQuestion = getContextQuestion(classification.topic);
      
      return {
        intercepted: true,
        response: topicQuestion,
        proofCaptureFlow: {
          stage: 'context_question',
          topic: classification.topic,
          originalMessage: message,
          confidence: classification.confidence,
          specificityScore: classification.specificityScore,
        },
      };
    }
    
    if (proofCaptureTrigger.showSuggestionChip) {
      return {
        intercepted: false,
        suggestionChip: {
          text: "Leave a testimonial",
          action: "testimonial",
        },
        classificationResult: classification,
      };
    }

    return { intercepted: false, classificationResult: classification };
  }

  return { intercepted: false };
}

export async function generateChatResponse(
  systemPrompt: string,
  history: ChatMessage[],
  userMessage: string,
  options: { maxTokens?: number; temperature?: number } = {}
): Promise<string> {
  const openai = new OpenAI({
    apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY || process.env.OPENAI_API_KEY,
    baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  });

  const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    { role: 'system', content: systemPrompt },
    ...history.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
    { role: 'user', content: userMessage },
  ];

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages,
    max_tokens: options.maxTokens || 300,
    temperature: options.temperature || 0.7,
  });

  return completion.choices[0]?.message?.content || "Sorry, I couldn't generate a response.";
}

/**
 * Builds the system prompt for owner conversation mode (Phase 2 Internal Training)
 * Owner mode has different behaviors:
 * - Transparent about uncertainty and gaps
 * - Receptive to corrections without being defensive
 * - Curious when information is missing
 * - Never overly confident
 */
export function buildOwnerSystemPrompt(
  context: OrbitChatContext,
  productContext: string,
  documentContext: string,
  businessType: string,
  businessTypeLabel: string,
  offeringsLabel: string,
  items: any[],
  heroPostContext: string = '',
  appliedCorrections: { correctionType: string; originalContent: string; correctedContent: string }[] = [],
  visualBindings: { tileLabel: string; bindingType: string; title: string; sourceUrl?: string; isPrimary: boolean }[] = []
): string {
  const { brandName, sourceDomain, siteSummary, keyServices } = context;

  // Format applied corrections as context
  let correctionsContext = '';
  if (appliedCorrections.length > 0) {
    const correctionsList = appliedCorrections.slice(0, 10).map((c, i) => 
      `${i + 1}. [${c.correctionType}] Changed: "${c.originalContent?.slice(0, 100)}" → "${c.correctedContent?.slice(0, 100)}"`
    ).join('\n');
    correctionsContext = `\n\n## Previous Training Corrections Applied:\n${correctionsList}\n`;
  }

  let contextSummary = '';
  if (items.length > 0) {
    if (businessType === 'recruitment') {
      const jobItems = items.filter((i: any) => i.category || i.description);
      contextSummary = `## Current Knowledge - Roles & Services:\n${jobItems.slice(0, 30).map((item: any) => 
        `- ${item.name}${item.category ? ` [${item.category}]` : ''}${item.description ? `: ${item.description.slice(0, 80)}` : ''}`
      ).join('\n')}`;
    } else if (businessType === 'restaurant') {
      contextSummary = `## Current Knowledge - Menu:\n${items.slice(0, 40).map((item: any) => 
        `- ${item.name}${item.price ? ` (£${item.price})` : ''}${item.category ? ` [${item.category}]` : ''}${item.description ? `: ${item.description.slice(0, 80)}` : ''}`
      ).join('\n')}`;
    } else {
      contextSummary = `## Current Knowledge - ${offeringsLabel.charAt(0).toUpperCase() + offeringsLabel.slice(1)}:\n${items.slice(0, 40).map((item: any) => 
        `- ${item.name}${item.price ? ` (£${item.price})` : ''}${item.category ? ` [${item.category}]` : ''}${item.description ? `: ${item.description.slice(0, 80)}` : ''}`
      ).join('\n')}`;
    }
  }

  let servicesSection = '';
  if (keyServices && keyServices.length > 0) {
    servicesSection = `\nKnown Services:\n${keyServices.map((s: string) => `• ${s}`).join('\n')}\n`;
  }

  let siteContext = '';
  if (siteSummary) {
    siteContext = `\nSite Summary:\n${siteSummary}\n`;
  }

  // Format visual bindings context (Phase 3)
  let visualContext = '';
  if (visualBindings.length > 0) {
    const bindingsList = visualBindings.slice(0, 15).map(b => 
      `- "${b.tileLabel}" → ${b.bindingType}: ${b.title}${b.sourceUrl ? ` (${b.sourceUrl.slice(0, 50)})` : ''}${b.isPrimary ? ' [PRIMARY]' : ''}`
    ).join('\n');
    visualContext = `\n\n## Visual Bindings (What Customers See):\n${bindingsList}\n`;
  }

  return `You are Orbit, the conversational intelligence for ${brandName}. You are speaking directly with the business owner.

## Your Role
You are in OWNER MODE - this is an internal conversation where the owner is training you, checking your understanding, and correcting any gaps or mistakes.

## Your Knowledge State
${siteContext}${servicesSection}
${contextSummary}
${documentContext}${heroPostContext}${correctionsContext}${visualContext}

## Core Behavioral Principles (CRITICAL)

### 1. TRANSPARENCY ABOUT UNCERTAINTY
- If you're not confident about something, say so: "I'm not fully confident about that yet"
- If information seems incomplete: "That information seems incomplete - can you tell me more?"
- If you're basing an answer on limited data: "Here's what I'm basing this on..."
- Never pretend to know something you don't

### 2. RECEPTIVE TO CORRECTION
- When the owner corrects you, respond calmly: "Got it. I'll remember that going forward."
- Never be defensive about mistakes
- Thank them for the clarification without being overly apologetic
- Confirm you understand the correction by briefly restating it

### 3. CURIOUS WHEN GAPS EXIST
- If the owner asks about something you don't have information on, be curious: "I don't have that information yet. Would you like to tell me about it?"
- Actively help identify what information would be useful

### 4. TRUST OVER CLEVERNESS
- Be straightforward and honest, not impressive
- If the owner asks "do you understand X" - give an honest assessment
- Don't manufacture confidence to seem capable

## Response Format
- Keep responses conversational and natural
- 2-4 sentences typically, unless explaining your understanding in detail
- Use first person ("I understand...", "I'm not sure about...")
- Never use marketing language - this is an internal conversation

## Handling Specific Owner Queries

### When asked "What do you know about X?"
→ Give an honest summary of what you know, note any gaps, invite correction

### When asked "You got that wrong" or similar corrections
→ Acknowledge calmly, confirm the correction, express that you'll remember it

### When given new information
→ Confirm you've received it, briefly summarize your understanding, ask if you got it right

### When asked "How confident are you about X?"
→ Give an honest confidence assessment and explain what it's based on

### When asked about visuals or what customers see
→ If you have visual bindings, explain what page/image is linked to each knowledge area
→ If asked "what image do you show for X?", answer based on the Visual Bindings section
→ If the owner says "that's the wrong image for X" or similar visual corrections, acknowledge it and note what they want shown instead

### When owner provides a URL or mentions a page to link
→ Acknowledge you understand they want to link that visual to a knowledge area
→ Confirm what knowledge tile they want it associated with

## What NOT to Do
- Never suggest features, power-ups, or automation
- Never offer to "help with anything else" in a sales-like way
- Never be defensive or explain away mistakes
- Never pretend certainty you don't have
- Never ask the owner to visit the website for information - they ARE the source`;
}

export interface OwnerChatAnalysis {
  isCorrection: boolean;
  correctionType?: 'factual' | 'emphasis' | 'gap_fill' | 'new_info' | 'removal' | 'visual';
  originalContent?: string;
  correctedContent?: string;
  confidence: number;
  visualCorrection?: {
    targetTileLabel?: string;
    newSourceUrl?: string;
    newAssetDescription?: string;
    action?: 'replace' | 'add' | 'remove';
  };
}

/**
 * Analyzes an owner message to detect if it contains a correction
 */
export async function analyzeOwnerMessage(
  message: string,
  recentHistory: ChatMessage[]
): Promise<OwnerChatAnalysis> {
  const openai = new OpenAI({
    apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY || process.env.OPENAI_API_KEY,
    baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  });

  const historyContext = recentHistory.slice(-4).map(m => 
    `${m.role}: ${m.content}`
  ).join('\n');

  const analysisPrompt = `Analyze if this message from a business owner contains a correction to the AI's understanding.

Recent conversation:
${historyContext}

Latest message: "${message}"

Respond in JSON format:
{
  "isCorrection": boolean,
  "correctionType": "factual" | "emphasis" | "gap_fill" | "new_info" | "removal" | "visual" | null,
  "originalContent": "what was wrong/missing (if correction)",
  "correctedContent": "what should be known instead (if correction)",
  "confidence": 0.0-1.0,
  "visualCorrection": {
    "targetTileLabel": "name of knowledge area if visual correction",
    "newSourceUrl": "URL if owner provided one",
    "newAssetDescription": "description of desired image/visual",
    "action": "replace" | "add" | "remove"
  }
}

Correction types:
- factual: Owner is correcting a specific fact (wrong price, wrong hours, etc.)
- emphasis: Owner is saying something should be emphasized more or less
- gap_fill: Owner is providing information that was missing
- new_info: Owner is adding brand new information unprompted
- removal: Owner is saying to stop mentioning something
- visual: Owner is correcting what image/page/visual should be shown for a knowledge area

Visual correction examples:
- "Use this image for our services: https://..."
- "That's the wrong picture for our team page"
- "Show our homepage for the company overview"
- "Don't show that old logo anymore"

Only mark as correction if the owner is clearly providing training/correction, not just chatting.
Include visualCorrection object only if correctionType is "visual".`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You analyze messages to detect training corrections. Respond only with valid JSON.' },
        { role: 'user', content: analysisPrompt }
      ],
      max_tokens: 200,
      temperature: 0.1,
    });

    const response = completion.choices[0]?.message?.content || '{}';
    // Try to extract JSON from the response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return { isCorrection: false, confidence: 0 };
  } catch (error) {
    console.error('Error analyzing owner message:', error);
    return { isCorrection: false, confidence: 0 };
  }
}

export function processEchoResponse(rawResponse: string): string {
  let response = rawResponse;
  
  response = response.replace(/^(Great question!|I'd be happy to|Let me explain|Certainly!|Absolutely!|Of course!)\s*/gi, '');
  response = response.replace(/^(I think|I believe|I would say)\s+/gi, '');
  
  if (response.endsWith('?')) {
    const questionCount = (response.match(/\?/g) || []).length;
    if (questionCount > 1) {
      const lastQuestionIndex = response.lastIndexOf('?');
      const secondLastQuestionIndex = response.lastIndexOf('?', lastQuestionIndex - 1);
      response = response.slice(0, secondLastQuestionIndex + 1);
    }
  }
  
  return response.trim();
}

export interface SuggestedVideo {
  id: number;
  title: string;
  youtubeVideoId: string;
  thumbnailUrl: string | null;
  description: string | null;
}

export function parseVideoSuggestion(
  response: string, 
  videos: { id: number; title: string; youtubeVideoId?: string; thumbnailUrl?: string | null; description?: string | null }[]
): { cleanResponse: string; suggestedVideo: SuggestedVideo | null } {
  const videoMatch = response.match(/\[VIDEO:(\d+)\]/);
  
  if (!videoMatch) {
    return { cleanResponse: response, suggestedVideo: null };
  }
  
  const videoId = parseInt(videoMatch[1]);
  const video = videos.find(v => v.id === videoId);
  
  const cleanResponse = response.replace(/\s*\[VIDEO:\d+\]\s*/g, '').trim();
  
  if (!video || !video.youtubeVideoId) {
    return { cleanResponse, suggestedVideo: null };
  }
  
  return {
    cleanResponse,
    suggestedVideo: {
      id: video.id,
      title: video.title,
      youtubeVideoId: video.youtubeVideoId,
      thumbnailUrl: video.thumbnailUrl || null,
      description: video.description || null,
    },
  };
}

// ============ PHASE 4: SCOPED NODE REFINEMENT ============

export interface ScopedRefinement {
  type: 'emphasis' | 'framing' | 'audience' | 'relationship' | 'meaning' | 'timing';
  scope: 'local' | 'similar_nodes' | 'global';
  previousState?: string;
  refinedState: string;
  requiresConfirmation?: boolean;
}

export interface ScopedChatResponse {
  content: string;
  messageType?: 'chat' | 'interrogation' | 'refinement' | 'confirmation' | 'experiment';
  refinement?: ScopedRefinement;
  scopeWarning?: string;
}

/**
 * Generates a scoped chat response for node-specific refinement conversations.
 * This is used when an owner is focused on refining a specific knowledge node.
 */
export async function generateScopedChatResponse(
  businessSlug: string,
  conversation: { nodeLabel: string; tileId: number | null; nodeIdentifier: string | null },
  ownerMessage: string,
  orbitMeta: { businessName: string | null; businessType: string | null }
): Promise<ScopedChatResponse> {
  const openai = new OpenAI({
    apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY || process.env.OPENAI_API_KEY,
    baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  });

  const systemPrompt = buildScopedSystemPrompt(
    orbitMeta.businessName || businessSlug,
    conversation.nodeLabel,
    orbitMeta.businessType || 'business'
  );

  try {
    // First, analyze if the message contains a refinement request
    const analysis = await analyzeScopedMessage(ownerMessage, conversation.nodeLabel);
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: ownerMessage }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const content = completion.choices[0]?.message?.content || "I understand. Let me process that.";

    const response: ScopedChatResponse = {
      content,
      messageType: analysis.messageType,
    };

    // If a refinement was detected, include it
    if (analysis.isRefinement && analysis.refinement) {
      response.refinement = analysis.refinement;
      
      // Check if this could affect other nodes
      if (analysis.potentialCrossNodeImpact) {
        response.scopeWarning = `This change might also affect similar areas. Should I apply it only to "${conversation.nodeLabel}", or across similar services?`;
        if (response.refinement) {
          response.refinement.requiresConfirmation = true;
        }
      }
    }

    return response;
  } catch (error) {
    console.error('Error generating scoped chat response:', error);
    return {
      content: "I'm having trouble processing that. Could you rephrase what you'd like to refine about this area?",
      messageType: 'chat',
    };
  }
}

function buildScopedSystemPrompt(businessName: string, nodeLabel: string, businessType: string): string {
  return `You are Orbit, the internal intelligence for ${businessName}. You are currently in SCOPED REFINEMENT MODE, focused specifically on: "${nodeLabel}".

## Current Focus
We're focusing on one part of your business right now: "${nodeLabel}"
I'll keep the rest in mind, but this conversation only affects this node unless you tell me otherwise.

## Your Behavior
You are a context-aware collaborator helping the owner precisely refine how "${nodeLabel}" is understood and presented.

1. **Node-specific interrogation**: When the owner asks questions about "${nodeLabel}", answer only within that context. Examples you can handle:
   - "How do you currently describe this?"
   - "Why do you think this is important?"
   - "What questions do people ask about this?"

2. **Precision refinement**: Accept refinement requests about meaning, not mechanics:
   - "This should feel more premium"
   - "This is secondary, not core"
   - "This is seasonal"
   - "Frame this as an outcome, not a feature"
   - "This should appeal to X, not Y"

3. **Safe experimentation**: Allow tentative exploration:
   - "What if this was positioned differently?"
   - "How would this look if it were less prominent?"
   You may simulate or explain outcomes without committing changes.

## Scope Awareness
- Default: Changes apply only to "${nodeLabel}" (local scope)
- If a change could affect similar nodes, ask before widening the scope
- Never silently propagate changes to other areas

## Response Style
- Be a senior strategist: careful, explicit, calm, precise
- Acknowledge the owner's intent before reflecting your understanding
- Never surprise the owner
- Never be defensive
- Express uncertainty honestly: "I'm not confident about that yet"

## What NOT to Do
- Never suggest automation or analytics-driven nudges
- Never offer batch edits across nodes without confirmation
- Never suggest structural hierarchy changes
- Never allow visual layout controls
- If asked for proactive advice, say: "I can do that once refinement is complete and you're happy with how everything is positioned."

Remember: The owner is shaping meaning, not managing software.`;
}

interface ScopedMessageAnalysis {
  messageType: 'chat' | 'interrogation' | 'refinement' | 'confirmation' | 'experiment';
  isRefinement: boolean;
  refinement?: ScopedRefinement;
  potentialCrossNodeImpact: boolean;
}

async function analyzeScopedMessage(
  message: string,
  nodeLabel: string
): Promise<ScopedMessageAnalysis> {
  const openai = new OpenAI({
    apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY || process.env.OPENAI_API_KEY,
    baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  });

  const analysisPrompt = `Analyze this message from a business owner who is refining their understanding of "${nodeLabel}":

Message: "${message}"

Classify the message and detect any refinement intent. Respond in JSON:
{
  "messageType": "chat" | "interrogation" | "refinement" | "confirmation" | "experiment",
  "isRefinement": boolean,
  "refinementType": "emphasis" | "framing" | "audience" | "relationship" | "meaning" | "timing" | null,
  "previousState": "what the owner thinks is currently understood (if refinement)",
  "refinedState": "what the owner wants it to be (if refinement)",
  "potentialCrossNodeImpact": boolean
}

Message types:
- interrogation: Owner is asking how Orbit understands this node
- refinement: Owner is adjusting meaning/emphasis/framing
- experiment: Owner is exploring "what if" scenarios
- confirmation: Owner is confirming a previous change
- chat: General conversation

Refinement types:
- emphasis: How prominent/important this is
- framing: How it should be described/positioned
- audience: Who this is for
- relationship: How it relates to other nodes
- meaning: Core definition/understanding
- timing: Seasonal, temporary, permanent

Set potentialCrossNodeImpact=true if the refinement could logically apply to similar nodes (e.g., "all services should feel premium").`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Analyze refinement intent. Respond only with valid JSON.' },
        { role: 'user', content: analysisPrompt }
      ],
      max_tokens: 300,
      temperature: 0.1,
    });

    const response = completion.choices[0]?.message?.content || '{}';
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        messageType: parsed.messageType || 'chat',
        isRefinement: parsed.isRefinement || false,
        refinement: parsed.isRefinement ? {
          type: parsed.refinementType,
          scope: 'local',
          previousState: parsed.previousState,
          refinedState: parsed.refinedState,
        } : undefined,
        potentialCrossNodeImpact: parsed.potentialCrossNodeImpact || false,
      };
    }
    return { messageType: 'chat', isRefinement: false, potentialCrossNodeImpact: false };
  } catch (error) {
    console.error('Error analyzing scoped message:', error);
    return { messageType: 'chat', isRefinement: false, potentialCrossNodeImpact: false };
  }
}
