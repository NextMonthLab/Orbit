export interface CardSource {
  domain: string;
  url: string;
}

export interface CardSignals {
  intentTags: string[];
  confidence: number;
}

export interface BaseCard {
  id: string;
  type: 'page_card' | 'image_card' | 'person_card' | 'cta_card';
  title: string;
  summary: string;
  source: CardSource;
  signals: CardSignals;
}

export interface PageCard extends BaseCard {
  type: 'page_card';
  heroImage?: string;
  tags?: string[];
}

export interface ImageCard extends BaseCard {
  type: 'image_card';
  imageUrl: string;
  caption?: string;
}

export interface PersonCard extends BaseCard {
  type: 'person_card';
  name: string;
  role: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
}

export interface CtaCard extends BaseCard {
  type: 'cta_card';
  action: 'call' | 'email' | 'video_reply' | 'video_call' | 'book';
  actionLabel: string;
}

export type SiteCard = PageCard | ImageCard | PersonCard | CtaCard;

export interface Lane {
  id: string;
  title: string;
  cards: SiteCard[];
}

export interface PersonIndex {
  id: string;
  name: string;
  role: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
  source: CardSource;
}

export interface BrandInfo {
  name: string;
  domain: string;
  logoUrl?: string;
  theme: {
    mode: 'monochrome' | 'branded';
    verified: boolean;
    accentColor?: string;
  };
}

export interface Availability {
  videoCall: boolean;
  videoReply: boolean;
  chat: boolean;
}

export interface SiteCatalogue {
  brand: BrandInfo;
  lanes: Lane[];
  peopleIndex: PersonIndex[];
  availability: Availability;
}

export interface IntentOption {
  id: string;
  label: string;
  icon?: string;
}

export const INTENT_OPTIONS: IntentOption[] = [
  { id: 'browsing', label: 'Just browsing' },
  { id: 'comparing', label: 'Comparing providers' },
  { id: 'existing', label: 'Existing customer' },
  { id: 'urgent', label: 'Need help urgently' },
  { id: 'research', label: 'Research / academic' },
  { id: 'unsure', label: 'Not sure yet' },
];

export interface SessionEvent {
  type: 'intent_selected' | 'card_opened' | 'question_asked' | 'link_clicked' | 'handoff_requested' | 'action_clicked';
  timestamp: number;
  data: Record<string, unknown>;
}

export interface ShareableState {
  intent?: string;
  activeLaneId?: string;
  activeCardId?: string;
  summary?: string;
  question?: string;
}

export function createMockCatalogue(siteIdentity: {
  title?: string | null;
  sourceDomain: string;
  logoUrl?: string | null;
  faviconUrl?: string | null;
  heroDescription?: string | null;
  serviceHeadings?: string[];
  serviceBullets?: string[];
  faqCandidates?: string[];
  primaryColour?: string;
}, validatedContent?: {
  overview?: string;
  whatWeDo?: string[];
  commonQuestions?: { question: string; contextPrompt: string }[];
  brandName?: string;
}): SiteCatalogue {
  const brandName = validatedContent?.brandName || siteIdentity.title?.split(' - ')[0] || siteIdentity.sourceDomain;
  const domain = siteIdentity.sourceDomain;
  
  const cards: SiteCard[] = [];
  
  const homeCard: PageCard = {
    id: 'home',
    type: 'page_card',
    title: brandName,
    summary: validatedContent?.overview || siteIdentity.heroDescription || `Welcome to ${brandName}`,
    source: { domain, url: `https://${domain}/` },
    signals: { intentTags: ['overview'], confidence: 0.9 },
  };
  cards.push(homeCard);
  
  const serviceCards: PageCard[] = (validatedContent?.whatWeDo || siteIdentity.serviceBullets || []).slice(0, 4).map((service, i) => ({
    id: `service_${i}`,
    type: 'page_card' as const,
    title: service.split('.')[0].slice(0, 50),
    summary: service,
    source: { domain, url: `https://${domain}/services` },
    signals: { intentTags: ['services'], confidence: 0.7 },
  }));
  
  const faqCards: PageCard[] = (validatedContent?.commonQuestions || []).slice(0, 3).map((q, i) => ({
    id: `faq_${i}`,
    type: 'page_card' as const,
    title: q.question,
    summary: 'Tap to ask the concierge about this',
    source: { domain, url: `https://${domain}/faq` },
    signals: { intentTags: ['faq', 'support'], confidence: 0.8 },
  }));
  
  const contactCard: CtaCard = {
    id: 'contact',
    type: 'cta_card',
    title: 'Get in touch',
    summary: `Contact ${brandName} directly`,
    source: { domain, url: `https://${domain}/contact` },
    signals: { intentTags: ['contact', 'action'], confidence: 0.9 },
    action: 'email',
    actionLabel: 'Send a message',
  };
  
  const videoReplyCard: CtaCard = {
    id: 'video_reply',
    type: 'cta_card',
    title: 'Request a video reply',
    summary: 'Get a personal video response to your question',
    source: { domain, url: `https://${domain}/contact` },
    signals: { intentTags: ['contact', 'video'], confidence: 0.8 },
    action: 'video_reply',
    actionLabel: 'Request video',
  };

  return {
    brand: {
      name: brandName,
      domain,
      logoUrl: siteIdentity.logoUrl || siteIdentity.faviconUrl || undefined,
      theme: {
        mode: siteIdentity.primaryColour ? 'branded' : 'monochrome',
        verified: false,
        accentColor: siteIdentity.primaryColour,
      },
    },
    lanes: [
      {
        id: 'start',
        title: 'Start here',
        cards: [homeCard],
      },
      {
        id: 'services',
        title: 'Services',
        cards: serviceCards.length > 0 ? serviceCards : [],
      },
      {
        id: 'questions',
        title: 'Common questions',
        cards: faqCards.length > 0 ? faqCards : [],
      },
      {
        id: 'contact',
        title: 'Contact & next steps',
        cards: [contactCard, videoReplyCard],
      },
    ].filter(lane => lane.cards.length > 0),
    peopleIndex: [],
    availability: {
      videoCall: false,
      videoReply: true,
      chat: true,
    },
  };
}
