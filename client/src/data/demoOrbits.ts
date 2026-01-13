export type DemoOrbitStatus = 'coming_soon' | 'live';

export interface DemoOrbit {
  id: string;
  name: string;
  industry: string;
  tagline: string;
  status: DemoOrbitStatus;
}

export const demoOrbits: DemoOrbit[] = [
  {
    id: "pizza-01",
    name: "Banbury Pizza Co.",
    industry: "Takeaway",
    tagline: "A menu you can talk to: delivery, allergens, offers, the lot.",
    status: "coming_soon"
  },
  {
    id: "accountancy-01",
    name: "Summit Accountants",
    industry: "Professional Services",
    tagline: "Services, onboarding, pricing, timelines – instantly clear.",
    status: "coming_soon"
  },
  {
    id: "techshop-01",
    name: "Northside Tech",
    industry: "Ecommerce",
    tagline: "Compare devices, warranties, returns, delivery, finance – properly.",
    status: "coming_soon"
  }
];

export function getDemoOrbitById(id: string): DemoOrbit | undefined {
  return demoOrbits.find(demo => demo.id === id);
}
