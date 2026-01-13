export type DemoOrbitStatus = 'coming_soon' | 'live';

export type DemoSector = 'Food' | 'Professional Services' | 'Ecommerce' | 'Healthcare' | 'Property';

export interface DemoOrbit {
  id: string;
  slug: string;
  name: string;
  sector: DemoSector;
  tagline: string;
  location: string;
  status: DemoOrbitStatus;
}

export const demoOrbits: DemoOrbit[] = [
  {
    id: "slice-and-stone",
    slug: "slice-and-stone-pizza",
    name: "Slice & Stone Pizza",
    sector: "Food",
    tagline: "Artisan pizza delivery with obsessive operational transparency.",
    location: "Bristol",
    status: "live"
  },
  {
    id: "clarity-accountants",
    slug: "clarity-chartered-accountants",
    name: "Clarity Chartered Accountants",
    sector: "Professional Services",
    tagline: "Fixed-fee accountancy with radical transparency on pricing and process.",
    location: "Leeds (UK-wide remote)",
    status: "live"
  },
  {
    id: "techvault-uk",
    slug: "techvault-uk",
    name: "TechVault UK",
    sector: "Ecommerce",
    tagline: "Refurbished tech with grade transparency and buying confidence tools.",
    location: "Manchester (UK-wide delivery)",
    status: "live"
  },
  {
    id: "fernwood-dental",
    slug: "fernwood-dental",
    name: "Fernwood Dental Practice",
    sector: "Healthcare",
    tagline: "NHS + private dental care with treatment transparency and booking simplicity.",
    location: "Nottingham",
    status: "coming_soon"
  },
  {
    id: "greenway-lettings",
    slug: "greenway-lettings",
    name: "Greenway Property Lettings",
    sector: "Property",
    tagline: "Lettings agency with landlord and tenant transparency.",
    location: "Oxford",
    status: "coming_soon"
  }
];

export const sectors: DemoSector[] = ['Food', 'Professional Services', 'Ecommerce', 'Healthcare', 'Property'];

export function getDemoOrbitById(id: string): DemoOrbit | undefined {
  return demoOrbits.find(demo => demo.id === id);
}

export function getDemoOrbitBySlug(slug: string): DemoOrbit | undefined {
  return demoOrbits.find(demo => demo.slug === slug);
}

export function getDemoOrbitsBySector(sector: DemoSector): DemoOrbit[] {
  return demoOrbits.filter(demo => demo.sector === sector);
}

export function getLiveDemoOrbits(): DemoOrbit[] {
  return demoOrbits.filter(demo => demo.status === 'live');
}
