export interface FrontPageHero {
  title: string;
  subtitle: string;
  entityCount: number;
  productCount: number;
}

export interface FrontPageBrand {
  id: number;
  name: string;
  initials: string;
  logoUrl: string | null;
  websiteUrl: string | null;
  productCount: number;
  trustLevel: 'official' | 'independent';
}

export interface FrontPageProduct {
  id: number;
  name: string;
  summary: string | null;
  status: string;
  category: string;
  manufacturerName: string;
  manufacturerInitials: string;
  referenceUrls: string[];
  intentTags: string[];
  specCount: number;
  primarySpec: { key: string; value: string } | null;
}

export interface FrontPageTile {
  id: number;
  label: string;
  sublabel: string | null;
  intentTags: string[];
  priority: number;
}

export interface FrontPageStartHere {
  id: number;
  label: string;
  whyItMatters: string | null;
  starterQuestions: string[];
}

export interface FrontPageCommunity {
  id: number;
  name: string;
  url: string;
  communityType: string;
  regionTags: string[];
}

export interface FrontPageSource {
  id: number;
  name: string;
  url: string;
  sourceType: string;
  trustLevel: string;
}

export interface FrontPageSection<T> {
  visible: boolean;
  count: number;
  items: T[];
}

export interface IndustryOrbitFrontPage {
  orbitId: number;
  slug: string;
  type: 'industry';
  hero: FrontPageHero;
  brands: FrontPageSection<FrontPageBrand>;
  featuredProducts: FrontPageSection<FrontPageProduct>;
  latestTiles: FrontPageSection<FrontPageTile>;
  startHere: FrontPageSection<FrontPageStartHere>;
  communities: FrontPageSection<FrontPageCommunity>;
  sources: FrontPageSection<FrontPageSource>;
}
