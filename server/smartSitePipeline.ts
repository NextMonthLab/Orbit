import OpenAI from "openai";

let _openai: OpenAI | null = null;
function getOpenAI(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({
      apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY || process.env.OPENAI_API_KEY,
      baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
    });
  }
  return _openai;
}

export interface RawSiteContent {
  url: string;
  domain: string;
  pages: {
    url: string;
    title: string;
    headings: string[];
    paragraphs: string[];
    navLabels: string[];
    ctaLabels: string[];
    rawText: string;
  }[];
  extractedAt: string;
}

export interface ServiceConcept {
  internalId: string;
  humanDescription: string;
  visitorProblem: string;
  confidenceScore: number;
  needsReview: boolean;
}

export interface ConceptMap {
  brand: {
    name: string;
    taglineCandidates: string[];
    toneHints: string[];
  };
  services: ServiceConcept[];
  faqs: {
    question: string;
    intentTag: string;
  }[];
  ctas: {
    label: string;
    intentTag: string;
  }[];
}

export interface ValidatedContent {
  overview: string;
  whatWeDo: string[];
  commonQuestions: {
    question: string;
    contextPrompt: string;
  }[];
  brandName: string;
  passed: boolean;
  issues: string[];
}

export interface PipelineResult {
  rawContent: RawSiteContent;
  conceptMap: ConceptMap;
  validatedContent: ValidatedContent;
  pipelineLog: string[];
}

function isLabelLike(text: string): boolean {
  if (!text || text.length < 3) return true;
  
  const labelPatterns = [
    /^looking for/i,
    /^need help with/i,
    /^learn more about/i,
    /^find out/i,
    /^discover/i,
    /^explore our/i,
  ];
  
  if (text === text.toUpperCase() && text.length > 4) return true;
  
  if (labelPatterns.some(p => p.test(text))) return true;
  
  const words = text.split(/\s+/);
  if (words.length < 2) return true;
  
  return false;
}

function sanitizeHeading(heading: string): string {
  let clean = heading.trim();
  
  clean = clean.replace(/^(looking for|need help with|learn more about|find out about|discover|explore our)\s*/i, '');
  
  if (clean === clean.toUpperCase() && clean.length > 3) {
    clean = clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();
  }
  
  clean = clean.replace(/\?+$/, '');
  
  return clean.trim();
}

function generateHumanQuestion(serviceConcept: ServiceConcept, brandName: string): string {
  const problem = serviceConcept.visitorProblem;
  
  if (problem.includes('?')) {
    return problem;
  }
  
  const questionStarters = [
    `How can ${brandName} help with`,
    `What does ${brandName} offer for`,
    `Can you explain your`,
    `What's involved in`,
    `How do I get started with`,
  ];
  
  const starter = questionStarters[Math.floor(Math.random() * questionStarters.length)];
  const topic = serviceConcept.humanDescription.toLowerCase().replace(/\.$/, '');
  
  return `${starter} ${topic}?`;
}

export async function step1DeepRead(url: string, html: string): Promise<RawSiteContent> {
  const parsedUrl = new URL(url);
  const domain = parsedUrl.hostname.replace(/^www\./, '');
  
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : domain;
  
  const headings: string[] = [];
  const h1Matches = Array.from(html.matchAll(/<h1[^>]*>([^<]+)<\/h1>/gi));
  const h2Matches = Array.from(html.matchAll(/<h2[^>]*>([^<]+)<\/h2>/gi));
  const h3Matches = Array.from(html.matchAll(/<h3[^>]*>([^<]+)<\/h3>/gi));
  
  h1Matches.forEach(match => headings.push(match[1].trim()));
  h2Matches.forEach(match => headings.push(match[1].trim()));
  h3Matches.forEach(match => headings.push(match[1].trim()));
  
  const paragraphs: string[] = [];
  const pMatches = Array.from(html.matchAll(/<p[^>]*>([^<]{20,})<\/p>/gi));
  pMatches.forEach(match => {
    const text = match[1].replace(/&[a-z]+;/gi, ' ').trim();
    if (text.length > 20 && text.length < 500) {
      paragraphs.push(text);
    }
  });
  
  const navLabels: string[] = [];
  const navMatch = html.match(/<nav[^>]*>([\s\S]*?)<\/nav>/i);
  if (navMatch) {
    const linkMatches = Array.from(navMatch[1].matchAll(/<a[^>]*>([^<]+)<\/a>/gi));
    linkMatches.forEach(match => {
      const label = match[1].trim();
      if (label.length > 1 && label.length < 50) {
        navLabels.push(label);
      }
    });
  }
  
  const ctaLabels: string[] = [];
  const buttonMatches = Array.from(html.matchAll(/<(?:button|a)[^>]*class="[^"]*(?:btn|button|cta)[^"]*"[^>]*>([^<]+)<\/(?:button|a)>/gi));
  buttonMatches.forEach(match => {
    ctaLabels.push(match[1].trim());
  });
  
  const rawText = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 15000);
  
  return {
    url,
    domain,
    pages: [{
      url,
      title,
      headings: headings.slice(0, 20),
      paragraphs: paragraphs.slice(0, 15),
      navLabels: navLabels.slice(0, 15),
      ctaLabels: ctaLabels.slice(0, 10),
      rawText,
    }],
    extractedAt: new Date().toISOString(),
  };
}

export async function step2ConceptMapping(rawContent: RawSiteContent): Promise<ConceptMap> {
  const page = rawContent.pages[0];
  
  const prompt = `Analyze this website content and create a concept map.

Website: ${rawContent.domain}
Title: ${page.title}

Headings found:
${page.headings.join('\n')}

Key paragraphs:
${page.paragraphs.slice(0, 5).join('\n\n')}

Navigation labels:
${page.navLabels.join(', ')}

Instructions:
1. Identify the brand name (not "Home" or domain, the actual business name)
2. For each service/offering, provide:
   - internal_id: a slug from the site
   - human_description: one plain English sentence explaining what this is
   - visitor_problem: what problem does a visitor have that this solves? Write as if the visitor is speaking.
   - confidence_score: 0-1, how confident are you this is accurate?
3. Identify 3-4 questions a visitor might genuinely ask
4. Identify the brand's tone (professional, friendly, technical, etc.)

Respond in JSON format:
{
  "brand": { "name": "...", "taglineCandidates": [...], "toneHints": [...] },
  "services": [{ "internalId": "...", "humanDescription": "...", "visitorProblem": "...", "confidenceScore": 0.9 }],
  "faqs": [{ "question": "...", "intentTag": "..." }],
  "ctas": [{ "label": "...", "intentTag": "..." }]
}`;

  try {
    const response = await getOpenAI().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_tokens: 1500,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("No response from AI");

    const parsed = JSON.parse(content);
    
    const services: ServiceConcept[] = (parsed.services || []).map((s: any) => ({
      internalId: s.internalId || s.internal_id || '',
      humanDescription: s.humanDescription || s.human_description || '',
      visitorProblem: s.visitorProblem || s.visitor_problem || '',
      confidenceScore: typeof s.confidenceScore === 'number' ? s.confidenceScore : 
                       typeof s.confidence_score === 'number' ? s.confidence_score : 0.5,
      needsReview: (s.confidenceScore || s.confidence_score || 0.5) < 0.75,
    }));

    return {
      brand: {
        name: parsed.brand?.name || rawContent.domain,
        taglineCandidates: parsed.brand?.taglineCandidates || [],
        toneHints: parsed.brand?.toneHints || ['professional'],
      },
      services,
      faqs: parsed.faqs || [],
      ctas: parsed.ctas || [],
    };
  } catch (error) {
    console.error('Concept mapping error:', error);
    return {
      brand: { name: rawContent.domain, taglineCandidates: [], toneHints: ['professional'] },
      services: page.headings.slice(0, 5).map(h => ({
        internalId: h.toLowerCase().replace(/\s+/g, '-'),
        humanDescription: h,
        visitorProblem: `I need help with ${h.toLowerCase()}`,
        confidenceScore: 0.5,
        needsReview: true,
      })),
      faqs: [],
      ctas: [],
    };
  }
}

export function step3LanguageSanityCheck(conceptMap: ConceptMap): { passed: boolean; issues: string[]; refined: ConceptMap } {
  const issues: string[] = [];
  const refined = JSON.parse(JSON.stringify(conceptMap)) as ConceptMap;
  
  if (isLabelLike(refined.brand.name)) {
    issues.push(`Brand name "${refined.brand.name}" looks like a label`);
  }
  
  refined.services = refined.services.map(service => {
    if (isLabelLike(service.humanDescription)) {
      issues.push(`Service description "${service.humanDescription}" is label-like`);
      service.humanDescription = sanitizeHeading(service.humanDescription);
    }
    
    if (service.humanDescription === service.humanDescription.toUpperCase() && service.humanDescription.length > 4) {
      issues.push(`Service "${service.humanDescription}" is ALL CAPS`);
      service.humanDescription = service.humanDescription.charAt(0).toUpperCase() + 
                                  service.humanDescription.slice(1).toLowerCase();
    }
    
    if (/^looking for/i.test(service.humanDescription)) {
      issues.push(`Service contains "LOOKING FOR..." pattern`);
      service.humanDescription = service.humanDescription.replace(/^looking for\s*/i, '');
    }
    
    return service;
  });
  
  refined.faqs = refined.faqs.filter(faq => {
    if (!faq.question.includes('?')) {
      issues.push(`FAQ "${faq.question}" is not phrased as a question`);
      return false;
    }
    if (isLabelLike(faq.question.replace('?', ''))) {
      issues.push(`FAQ "${faq.question}" sounds robotic`);
      return false;
    }
    return true;
  });
  
  const passed = issues.length === 0;
  
  return { passed, issues, refined };
}

export function step4VisitorMentalModelValidation(
  conceptMap: ConceptMap, 
  rawContent: RawSiteContent
): { passed: boolean; reasons: string[] } {
  const reasons: string[] = [];
  
  if (!conceptMap.brand.name || conceptMap.brand.name === rawContent.domain) {
    reasons.push('Brand name is unclear - using domain as fallback');
  }
  
  const validServices = conceptMap.services.filter(s => s.confidenceScore >= 0.75);
  if (validServices.length === 0) {
    reasons.push('No services with high confidence');
  }
  
  if (conceptMap.services.length === 0) {
    reasons.push('Cannot determine what this business does');
  }
  
  const anyLabelLike = conceptMap.services.some(s => isLabelLike(s.humanDescription));
  if (anyLabelLike) {
    reasons.push('Some services still read like internal labels');
  }
  
  const passed = reasons.length === 0;
  
  return { passed, reasons };
}

export function step5GenerateValidatedContent(
  conceptMap: ConceptMap,
  rawContent: RawSiteContent
): ValidatedContent {
  const issues: string[] = [];
  const brandName = conceptMap.brand.name;
  
  let overview = '';
  const page = rawContent.pages[0];
  if (page.paragraphs.length > 0) {
    overview = page.paragraphs[0];
    if (overview.length > 200) {
      overview = overview.substring(0, 197) + '...';
    }
  } else {
    overview = `${brandName} provides professional services.`;
    issues.push('No overview content found, using fallback');
  }
  
  const whatWeDo = conceptMap.services
    .filter(s => s.confidenceScore >= 0.6)
    .slice(0, 6)
    .map(s => s.humanDescription);
  
  if (whatWeDo.length === 0) {
    issues.push('No valid services to display');
  }
  
  const commonQuestions = conceptMap.services
    .filter(s => s.confidenceScore >= 0.7)
    .slice(0, 4)
    .map(s => ({
      question: generateHumanQuestion(s, brandName),
      contextPrompt: `Answer this question about ${brandName}: ${s.visitorProblem}. Be helpful and concise. Offer a next step.`,
    }));
  
  if (conceptMap.faqs.length > 0) {
    conceptMap.faqs.slice(0, 2).forEach(faq => {
      commonQuestions.push({
        question: faq.question,
        contextPrompt: `Answer this question about ${brandName}: ${faq.question}. Be helpful and concise.`,
      });
    });
  }
  
  if (commonQuestions.length === 0) {
    commonQuestions.push({
      question: `What does ${brandName} do?`,
      contextPrompt: `Explain what ${brandName} does based on their website. Be helpful and concise.`,
    });
    commonQuestions.push({
      question: `How do I get started with ${brandName}?`,
      contextPrompt: `Explain how to get started with ${brandName}. Be helpful and offer next steps.`,
    });
    issues.push('No questions generated from content, using defaults');
  }
  
  const passed = issues.filter(i => i.includes('No valid') || i.includes('No overview')).length === 0;
  
  return {
    overview,
    whatWeDo,
    commonQuestions: commonQuestions.slice(0, 4),
    brandName,
    passed,
    issues,
  };
}

export async function runSmartSitePipeline(url: string, html: string): Promise<PipelineResult> {
  const log: string[] = [];
  
  log.push('Step 1: Deep Read - Extracting raw content...');
  const rawContent = await step1DeepRead(url, html);
  log.push(`  Found ${rawContent.pages[0].headings.length} headings, ${rawContent.pages[0].paragraphs.length} paragraphs`);
  
  log.push('Step 2: Concept Mapping - Understanding services and intent...');
  let conceptMap = await step2ConceptMapping(rawContent);
  log.push(`  Identified ${conceptMap.services.length} services, brand: "${conceptMap.brand.name}"`);
  
  log.push('Step 3: Language Sanity Check - Validating human readability...');
  let languageCheck = step3LanguageSanityCheck(conceptMap);
  let iterations = 0;
  const maxIterations = 3;
  
  while (!languageCheck.passed && iterations < maxIterations) {
    log.push(`  Issues found: ${languageCheck.issues.join(', ')}`);
    log.push(`  Refining (iteration ${iterations + 1})...`);
    conceptMap = languageCheck.refined;
    languageCheck = step3LanguageSanityCheck(conceptMap);
    iterations++;
  }
  
  if (languageCheck.passed) {
    log.push('  Language check PASSED');
  } else {
    log.push(`  Language check completed with remaining issues after ${maxIterations} iterations`);
  }
  
  log.push('Step 4: Visitor Mental Model Validation...');
  const mentalModelCheck = step4VisitorMentalModelValidation(conceptMap, rawContent);
  if (mentalModelCheck.passed) {
    log.push('  Mental model validation PASSED');
  } else {
    log.push(`  Issues: ${mentalModelCheck.reasons.join(', ')}`);
  }
  
  log.push('Step 5: Generating validated content...');
  const validatedContent = step5GenerateValidatedContent(conceptMap, rawContent);
  log.push(`  Generated ${validatedContent.whatWeDo.length} services, ${validatedContent.commonQuestions.length} questions`);
  
  return {
    rawContent,
    conceptMap,
    validatedContent,
    pipelineLog: log,
  };
}
