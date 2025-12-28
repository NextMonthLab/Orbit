import { ingestSitePreview, validateUrlSafety } from "./previewHelpers";
import { runSmartSitePipeline, type PipelineResult } from "./smartSitePipeline";
import {
  OrbitPackV1,
  OrbitBox,
  OrbitFaq,
  orbitPackV1Schema,
  generatePackVersion,
  createEmptyOrbitPack,
} from "../shared/orbitPack";

export interface OrbitGenerationResult {
  success: boolean;
  pack?: OrbitPackV1;
  version?: string;
  error?: string;
  pipelineLog?: string[];
}

function generateSlug(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname
      .replace(/^www\./, "")
      .replace(/\./g, "-")
      .toLowerCase();
  } catch {
    return `orbit-${Date.now()}`;
  }
}

function generateBoxId(prefix: string, index: number): string {
  return `${prefix}-${index + 1}`;
}

export async function generateOrbitPack(
  url: string
): Promise<OrbitGenerationResult> {
  const pipelineLog: string[] = [];

  try {
    pipelineLog.push(`[Orbit] Starting pack generation for: ${url}`);

    const validation = await validateUrlSafety(url);
    if (!validation.safe) {
      return {
        success: false,
        error: validation.error || "URL validation failed",
        pipelineLog,
      };
    }

    pipelineLog.push(`[Orbit] URL validated, domain: ${validation.domain}`);

    const siteData = await ingestSitePreview(url);
    pipelineLog.push(
      `[Orbit] Site ingested: ${siteData.pagesIngested} pages, ${siteData.totalChars} chars`
    );

    const version = generatePackVersion();
    const businessSlug = generateSlug(url);

    const pack = createEmptyOrbitPack(businessSlug, url);
    pack.meta.version = version;

    pack.brand = {
      name:
        siteData.siteIdentity.validatedContent?.brandName ||
        siteData.siteIdentity.title?.split(" - ")[0]?.split(" | ")[0] ||
        validation.domain ||
        "Unknown Business",
      logo: siteData.siteIdentity.logoUrl || undefined,
      accent: siteData.siteIdentity.primaryColour || undefined,
      tone: siteData.siteIdentity.validatedContent?.passed
        ? "professional"
        : undefined,
      positioning: siteData.siteIdentity.heroDescription || undefined,
      taglineCandidates: siteData.siteIdentity.heroHeadline
        ? [siteData.siteIdentity.heroHeadline]
        : [],
    };

    pipelineLog.push(`[Orbit] Brand extracted: ${pack.brand.name}`);

    const boxes: OrbitBox[] = [];

    if (siteData.siteIdentity.validatedContent?.overview) {
      boxes.push({
        id: generateBoxId("overview", 0),
        type: "page",
        title: "About",
        summary: siteData.siteIdentity.validatedContent.overview,
        themes: ["about", "overview"],
        sources: [{ type: "url", ref: url, extractedAt: pack.meta.generatedAt }],
        priority: 100,
      });
    }

    const whatWeDo = siteData.siteIdentity.validatedContent?.whatWeDo || [];
    whatWeDo.forEach((service, index) => {
      boxes.push({
        id: generateBoxId("service", index),
        type: "service",
        title: service.split(".")[0] || service.substring(0, 50),
        summary: service,
        themes: ["services"],
        sources: [{ type: "url", ref: url, extractedAt: pack.meta.generatedAt }],
        priority: 90 - index,
      });
    });

    siteData.siteIdentity.serviceHeadings
      .filter((h) => !whatWeDo.some((w) => w.toLowerCase().includes(h.toLowerCase())))
      .slice(0, 5)
      .forEach((heading, index) => {
        boxes.push({
          id: generateBoxId("heading", index),
          type: "service",
          title: heading,
          summary: heading,
          themes: ["services"],
          sources: [{ type: "url", ref: url, extractedAt: pack.meta.generatedAt }],
          priority: 80 - index,
        });
      });

    pack.boxes = boxes;
    pipelineLog.push(`[Orbit] Generated ${boxes.length} boxes`);

    pack.entities = {
      services: whatWeDo.map((service, index) => ({
        id: generateBoxId("svc", index),
        name: service.split(".")[0] || service.substring(0, 50),
        description: service,
        visitorProblem: undefined,
      })),
      products: [],
      people: [],
    };

    const faqs: OrbitFaq[] = [];
    const commonQuestions =
      siteData.siteIdentity.validatedContent?.commonQuestions || [];
    commonQuestions.forEach((q, index) => {
      faqs.push({
        question: q.question,
        answer: q.contextPrompt,
        sourceBoxId: boxes[0]?.id,
        intentTag: "general",
      });
    });

    siteData.siteIdentity.faqCandidates
      .filter((faq) => !commonQuestions.some((q) => q.question === faq))
      .slice(0, 5)
      .forEach((faq, index) => {
        faqs.push({
          question: faq,
          answer: "",
          intentTag: "faq",
        });
      });

    pack.faqs = faqs;
    pipelineLog.push(`[Orbit] Generated ${faqs.length} FAQs`);

    pack.visualBible = {
      style: undefined,
      constraints: [],
      toneHints: [],
      avoidList: [],
    };

    const topics = new Set<string>();
    const keywords = new Set<string>();

    if (pack.brand.name) {
      keywords.add(pack.brand.name.toLowerCase());
    }

    boxes.forEach((box) => {
      box.themes.forEach((t) => topics.add(t));
      const words = box.title.toLowerCase().split(/\s+/);
      words.filter((w) => w.length > 3).forEach((w) => keywords.add(w));
    });

    pack.index = {
      topics: Array.from(topics),
      keywords: Array.from(keywords).slice(0, 50),
    };

    pipelineLog.push(`[Orbit] Index built: ${topics.size} topics, ${keywords.size} keywords`);

    const validated = orbitPackV1Schema.safeParse(pack);
    if (!validated.success) {
      pipelineLog.push(`[Orbit] Schema validation failed: ${validated.error.message}`);
      return {
        success: false,
        error: `Schema validation failed: ${validated.error.message}`,
        pipelineLog,
      };
    }

    pipelineLog.push(`[Orbit] Pack generation complete, version: ${version}`);

    return {
      success: true,
      pack: validated.data,
      version,
      pipelineLog,
    };
  } catch (error: any) {
    pipelineLog.push(`[Orbit] Generation failed: ${error.message}`);
    return {
      success: false,
      error: error.message,
      pipelineLog,
    };
  }
}

export { generateSlug };
