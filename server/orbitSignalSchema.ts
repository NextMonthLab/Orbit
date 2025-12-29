import type { OrbitMeta, PreviewInstance, OrbitBox, SiteIdentity } from "@shared/schema";
import crypto from "crypto";

export interface OrbitSignalBusiness {
  name: string;
  category: string | null;
  location: string | null;
  brand_tone: string[];
  canonical_description: string;
}

export interface OrbitSignalPositioning {
  what_we_do: string[];
  who_we_help: string[];
  what_we_do_not_do: string[];
  preferred_phrasing: string[];
}

export interface OrbitSignalService {
  name: string;
  summary: string;
  keywords: string[];
}

export interface OrbitSignalProof {
  type: string;
  title: string;
  summary: string;
}

export interface OrbitSignalFaq {
  q: string;
  a: string;
}

export interface OrbitSignalAiGuidance {
  priority_topics: string[];
  sensitive_topics: string[];
  answer_style: string;
}

export interface OrbitSignalFreshness {
  generated_at: string;
  valid_for_days: number;
}

export interface OrbitSignalContact {
  website: string;
  email: string | null;
}

export interface OrbitSignalSchemaV01 {
  schema_version: "0.1";
  orbit_id: string;
  domain: string;
  business: OrbitSignalBusiness;
  positioning: OrbitSignalPositioning;
  services: OrbitSignalService[];
  proof: OrbitSignalProof[];
  faq: OrbitSignalFaq[];
  ai_guidance: OrbitSignalAiGuidance;
  freshness: OrbitSignalFreshness;
  contact: OrbitSignalContact;
  signature?: string;
}

function generateContextualSummary(title: string, type: string, businessName: string): string {
  const cleanTitle = title.replace(/^(LOOKING FOR\s+)/i, '').replace(/\?+$/, '').trim();
  const templates: Record<string, string> = {
    url: `Learn more about ${cleanTitle.toLowerCase()} and how ${businessName} can help.`,
    text: `${cleanTitle} - supporting information from ${businessName}.`,
    testimonial: `Client feedback about ${cleanTitle.toLowerCase()}.`,
    pdf: `Detailed documentation covering ${cleanTitle.toLowerCase()}.`,
    ice: `Interactive content exploring ${cleanTitle.toLowerCase()}.`,
    service: `${businessName} offers ${cleanTitle.toLowerCase()} to support client needs.`,
    proof: `Evidence of ${businessName}'s capability in ${cleanTitle.toLowerCase()}.`,
  };
  return templates[type] || `${cleanTitle} - relevant information from ${businessName}.`;
}

function extractKeywordsFromText(text: string): string[] {
  const stopWords = new Set([
    'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
    'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those', 'it',
    'its', 'we', 'our', 'you', 'your', 'they', 'their', 'he', 'she', 'his', 'her'
  ]);
  
  const words = text.toLowerCase()
    .replace(/[^a-z\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 3 && !stopWords.has(w));
  
  const wordCount: Record<string, number> = {};
  for (const word of words) {
    wordCount[word] = (wordCount[word] || 0) + 1;
  }
  
  return Object.entries(wordCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word);
}

export function generateOrbitSignalSchema(
  orbitMeta: OrbitMeta,
  preview: PreviewInstance | null,
  boxes: OrbitBox[]
): OrbitSignalSchemaV01 {
  const siteIdentity = preview?.siteIdentity as SiteIdentity | null;
  const validatedContent = siteIdentity?.validatedContent;
  const structuredData = siteIdentity?.structuredData;
  
  const domain = siteIdentity?.sourceDomain || new URL(orbitMeta.sourceUrl).hostname.replace(/^www\./, '');
  
  function extractBrandName(title: string | null | undefined): string {
    if (!title) return domain;
    const separators = [' | ', ' - ', ' – ', ' — '];
    for (const sep of separators) {
      if (title.includes(sep)) {
        const parts = title.split(sep);
        return parts[parts.length - 1].trim();
      }
    }
    return title.trim();
  }
  
  const cleanBusinessName = orbitMeta.customTitle || 
    validatedContent?.brandName || 
    extractBrandName(siteIdentity?.title) || 
    domain;
  
  const business: OrbitSignalBusiness = {
    name: cleanBusinessName,
    category: null,
    location: null,
    brand_tone: orbitMeta.customTone ? [orbitMeta.customTone] : ["professional", "helpful"],
    canonical_description: orbitMeta.customDescription || 
      validatedContent?.overview || 
      siteIdentity?.heroDescription || 
      `${cleanBusinessName} provides professional services.`,
  };

  const whatWeDo = validatedContent?.whatWeDo || [];
  const serviceHeadings = siteIdentity?.serviceHeadings || [];
  const serviceBullets = siteIdentity?.serviceBullets || [];
  
  const uniquePhrasing = Array.from(new Set([...serviceHeadings, ...serviceBullets]));
  const positioning: OrbitSignalPositioning = {
    what_we_do: whatWeDo.length > 0 ? whatWeDo : serviceHeadings.slice(0, 5),
    who_we_help: [],
    what_we_do_not_do: [],
    preferred_phrasing: uniquePhrasing.slice(0, 10),
  };

  const services: OrbitSignalService[] = [];
  
  if (preview?.keyServices && preview.keyServices.length > 0) {
    for (const serviceName of preview.keyServices) {
      services.push({
        name: serviceName,
        summary: generateContextualSummary(serviceName, 'service', cleanBusinessName),
        keywords: extractKeywordsFromText(serviceName),
      });
    }
  }
  
  for (const heading of serviceHeadings) {
    if (!services.find(s => s.name.toLowerCase() === heading.toLowerCase())) {
      const matchingBullet = serviceBullets.find(b => 
        b.toLowerCase().includes(heading.toLowerCase().split(' ')[0])
      );
      services.push({
        name: heading,
        summary: matchingBullet || generateContextualSummary(heading, 'service', cleanBusinessName),
        keywords: extractKeywordsFromText(heading + ' ' + (matchingBullet || '')),
      });
    }
  }
  
  for (const box of boxes.filter(b => b.boxType === 'url' && b.isVisible)) {
    if (!services.find(s => s.name.toLowerCase() === box.title.toLowerCase())) {
      services.push({
        name: box.title,
        summary: box.description || generateContextualSummary(box.title, 'service', cleanBusinessName),
        keywords: extractKeywordsFromText(box.title + ' ' + (box.description || '')),
      });
    }
  }

  const proof: OrbitSignalProof[] = [];
  
  const testimonials = siteIdentity?.testimonials || [];
  for (const testimonial of testimonials.slice(0, 5)) {
    proof.push({
      type: 'testimonial',
      title: testimonial.author || 'Customer Testimonial',
      summary: testimonial.quote.substring(0, 200) + (testimonial.quote.length > 200 ? '...' : ''),
    });
  }
  
  for (const box of boxes.filter(b => b.boxType === 'testimonial' && b.isVisible)) {
    if (!proof.find(p => p.title === box.title)) {
      proof.push({
        type: 'testimonial',
        title: box.title,
        summary: box.content || box.description || generateContextualSummary(box.title, 'testimonial', cleanBusinessName),
      });
    }
  }
  
  for (const box of boxes.filter(b => b.boxType === 'text' && b.isVisible)) {
    proof.push({
      type: 'content',
      title: box.title,
      summary: box.content || box.description || generateContextualSummary(box.title, 'text', cleanBusinessName),
    });
  }

  const faq: OrbitSignalFaq[] = [];
  
  const enhancedFaqs = siteIdentity?.enhancedFaqs || [];
  for (const item of enhancedFaqs) {
    faq.push({
      q: item.question,
      a: item.answer,
    });
  }
  
  const commonQuestions = validatedContent?.commonQuestions || [];
  for (const item of commonQuestions) {
    if (!faq.find(f => f.q.toLowerCase() === item.question.toLowerCase())) {
      faq.push({
        q: item.question,
        a: `Contact ${cleanBusinessName} directly for specific information about this topic.`,
      });
    }
  }

  const aiGuidance: OrbitSignalAiGuidance = {
    priority_topics: ['services', 'proof', 'contact', 'faq'],
    sensitive_topics: ['pricing specifics', 'internal processes', 'competitor comparisons'],
    answer_style: 'Concise, factual, helpful. Avoid guarantees or absolute claims. Encourage direct contact for specific queries.',
  };

  let email: string | null = null;
  const contactInfo = preview?.contactInfo as Record<string, unknown> | null;
  if (contactInfo && typeof contactInfo.email === 'string') {
    email = contactInfo.email;
  }

  const contact: OrbitSignalContact = {
    website: orbitMeta.sourceUrl,
    email,
  };

  const freshness: OrbitSignalFreshness = {
    generated_at: new Date().toISOString(),
    valid_for_days: 7,
  };

  return {
    schema_version: "0.1",
    orbit_id: `orb_${orbitMeta.id}`,
    domain,
    business,
    positioning,
    services: services.slice(0, 10),
    proof: proof.slice(0, 10),
    faq: faq.slice(0, 15),
    ai_guidance: aiGuidance,
    freshness,
    contact,
  };
}

export function signOrbitSchema(schema: OrbitSignalSchemaV01, secret: string): OrbitSignalSchemaV01 {
  const { signature: _, ...schemaWithoutSignature } = schema;
  const payload = JSON.stringify(schemaWithoutSignature, Object.keys(schemaWithoutSignature).sort());
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payload);
  const sig = hmac.digest('base64');
  
  return {
    ...schema,
    signature: sig,
  };
}
