// Curated image manifest for demo orbits
// Uses direct Unsplash URLs that don't require API keys
// Each image is hand-picked to be relevant to the category/item

// Hash function for deterministic selection
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

// Pizza restaurant images - food photography
const PIZZA_IMAGES = [
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop', // pizza closeup
  'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop', // margherita
  'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop', // pepperoni pizza
  'https://images.unsplash.com/photo-1588315029754-2dd089d39a1a?w=400&h=300&fit=crop', // pizza slice
  'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400&h=300&fit=crop', // cheese pizza
  'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=400&h=300&fit=crop', // pizza oven
  'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=400&h=300&fit=crop', // pizza making
  'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&h=300&fit=crop', // pizza ingredients
  'https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=400&h=300&fit=crop', // pizza party
  'https://images.unsplash.com/photo-1506354666786-959d6d497f1a?w=400&h=300&fit=crop', // italian food
];

const PIZZA_SIDES_IMAGES = [
  'https://images.unsplash.com/photo-1619535860434-ba1d8fa12536?w=400&h=300&fit=crop', // garlic bread
  'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop', // salad
  'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=400&h=300&fit=crop', // olives
  'https://images.unsplash.com/photo-1623428187969-5da2dcea5ebf?w=400&h=300&fit=crop', // breadsticks
];

const PIZZA_DESSERTS_IMAGES = [
  'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=300&fit=crop', // tiramisu
  'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=300&fit=crop', // gelato
  'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=300&fit=crop', // italian dessert
];

const PIZZA_DRINKS_IMAGES = [
  'https://images.unsplash.com/photo-1527960471264-932f39eb5846?w=400&h=300&fit=crop', // wine
  'https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=400&h=300&fit=crop', // beer
  'https://images.unsplash.com/photo-1581006852262-e4307cf6283a?w=400&h=300&fit=crop', // soft drinks
];

// Accountancy/professional services images
const ACCOUNTANT_IMAGES = [
  'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&h=300&fit=crop', // calculator finances
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop', // financial charts
  'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=300&fit=crop', // business meeting
  'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&h=300&fit=crop', // professional suit
  'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&h=300&fit=crop', // accounting documents
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop', // data analytics
  'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=400&h=300&fit=crop', // business planning
  'https://images.unsplash.com/photo-1664575602554-2087b04935a5?w=400&h=300&fit=crop', // professional woman
  'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop', // office desk
  'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&h=300&fit=crop', // team meeting
];

const ACCOUNTANT_TEAM_IMAGES = [
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=300&fit=crop', // professional man
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=300&fit=crop', // professional woman
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=300&fit=crop', // business executive
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=300&fit=crop', // headshot woman
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=300&fit=crop', // headshot man
];

// Tech/electronics images
const TECH_IMAGES = [
  'https://images.unsplash.com/photo-1526406915894-7bcd65f60845?w=400&h=300&fit=crop', // smart glasses
  'https://images.unsplash.com/photo-1617802690992-15d93263d3a9?w=400&h=300&fit=crop', // VR headset
  'https://images.unsplash.com/photo-1592478411213-6153e4ebc07d?w=400&h=300&fit=crop', // electronics
  'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=400&h=300&fit=crop', // tech devices
  'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=300&fit=crop', // tech workspace
  'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=400&h=300&fit=crop', // headphones
  'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400&h=300&fit=crop', // smart watch
  'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400&h=300&fit=crop', // gaming tech
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop', // headphones product
  'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=400&h=300&fit=crop', // tech gadgets
];

const TECH_PHONE_IMAGES = [
  'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=300&fit=crop', // smartphone
  'https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=400&h=300&fit=crop', // iphone
  'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400&h=300&fit=crop', // phone screen
];

// Orbit-specific category mappings
const ORBIT_CATEGORY_IMAGES: Record<string, Record<string, string[]>> = {
  'slice-and-stone-pizza': {
    'Classic Pizzas': PIZZA_IMAGES,
    'Signature Pizzas': PIZZA_IMAGES,
    'Vegan Pizzas': PIZZA_IMAGES,
    'Sides': PIZZA_SIDES_IMAGES,
    'Desserts': PIZZA_DESSERTS_IMAGES,
    'Drinks': PIZZA_DRINKS_IMAGES,
    'Deals': PIZZA_IMAGES,
    '_default': PIZZA_IMAGES,
  },
  'clarity-chartered-accountants': {
    'Sole Trader Packages': ACCOUNTANT_IMAGES,
    'Limited Company Packages': ACCOUNTANT_IMAGES,
    'One-off Services': ACCOUNTANT_IMAGES,
    'Specialist Services': ACCOUNTANT_IMAGES,
    'Add-on Services': ACCOUNTANT_IMAGES,
    'team_member': ACCOUNTANT_TEAM_IMAGES,
    '_default': ACCOUNTANT_IMAGES,
  },
  'techvault-uk': {
    'Smart Glasses': TECH_IMAGES,
    'AR Glasses': TECH_IMAGES,
    'Audio': TECH_IMAGES,
    'Wearables': TECH_IMAGES,
    'Accessories': TECH_IMAGES,
    'Phones': TECH_PHONE_IMAGES,
    '_default': TECH_IMAGES,
  },
};

// Default fallback images by general type
const DEFAULT_TYPE_IMAGES: Record<string, string[]> = {
  'food': PIZZA_IMAGES,
  'professional': ACCOUNTANT_IMAGES,
  'tech': TECH_IMAGES,
  'default': [
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop', // modern office
    'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=400&h=300&fit=crop', // workspace
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=300&fit=crop', // team collaboration
  ],
};

export function getRelevantDemoImage(
  id: string,
  title: string,
  options?: {
    category?: string | null;
    orbitSlug?: string;
    type?: string;
    width?: number;
    height?: number;
  }
): string {
  const width = options?.width || 400;
  const height = options?.height || 300;
  const orbitSlug = options?.orbitSlug || '';
  const category = options?.category || '';
  const type = options?.type || '';
  
  // Get the hash for deterministic selection
  const hash = hashString(id + title);
  
  // Try orbit-specific category first
  const orbitCategories = ORBIT_CATEGORY_IMAGES[orbitSlug];
  if (orbitCategories) {
    // Check for exact category match
    if (category && orbitCategories[category]) {
      const images = orbitCategories[category];
      const selectedUrl = images[hash % images.length];
      return adjustImageSize(selectedUrl, width, height);
    }
    
    // Check for type match (e.g., team_member)
    if (type && orbitCategories[type]) {
      const images = orbitCategories[type];
      const selectedUrl = images[hash % images.length];
      return adjustImageSize(selectedUrl, width, height);
    }
    
    // Use orbit default
    if (orbitCategories['_default']) {
      const images = orbitCategories['_default'];
      const selectedUrl = images[hash % images.length];
      return adjustImageSize(selectedUrl, width, height);
    }
  }
  
  // Fallback to general defaults
  const defaultImages = DEFAULT_TYPE_IMAGES['default'];
  const selectedUrl = defaultImages[hash % defaultImages.length];
  return adjustImageSize(selectedUrl, width, height);
}

function adjustImageSize(url: string, width: number, height: number): string {
  // Unsplash URLs support width/height params, adjust them
  return url.replace(/w=\d+/, `w=${width}`).replace(/h=\d+/, `h=${height}`);
}

export function getRelevantDemoThumbnail(
  id: string,
  title: string,
  options?: {
    category?: string | null;
    orbitSlug?: string;
    type?: string;
  }
): string {
  return getRelevantDemoImage(id, title, { ...options, width: 120, height: 80 });
}

export function getRelevantDemoHero(
  id: string,
  title: string,
  options?: {
    category?: string | null;
    orbitSlug?: string;
    type?: string;
  }
): string {
  return getRelevantDemoImage(id, title, { ...options, width: 800, height: 450 });
}
