function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

const PIZZA_QUERIES: Record<string, string> = {
  'Margherita': 'margherita pizza basil',
  'Pepperoni Picante': 'pepperoni pizza spicy',
  'Quattro Formaggi': 'cheese pizza italian',
  'Diavola': 'spicy salami pizza',
  'Marinara': 'marinara pizza tomato garlic',
  'Prosciutto e Funghi': 'prosciutto mushroom pizza',
  'Capricciosa': 'capricciosa pizza ham artichoke',
  'Napoli': 'anchovy olive pizza',
  'Salsiccia': 'sausage pepper pizza',
  'Bianca': 'white pizza ricotta',
  'Nduja & Honey': 'nduja pizza honey',
  'Truffle Mushroom': 'truffle mushroom pizza',
  'The Bristol': 'chorizo pizza peppers',
  'Burrata & Parma': 'burrata parma ham pizza',
  'Mortadella Pistachio': 'mortadella pistachio pizza',
  'Lamb Kofta': 'lamb flatbread mediterranean',
  'Fig & Gorgonzola': 'fig gorgonzola pizza',
  'Seafood Bianca': 'seafood pizza prawns',
  'BBQ Pulled Pork': 'bbq pulled pork pizza',
  'Goat Cheese & Beetroot': 'goat cheese beetroot pizza',
  'Vegan Garden': 'vegan vegetable pizza',
  'Vegan BBQ Jackfruit': 'vegan jackfruit pizza',
  'Vegan Pepperoni': 'vegan pepperoni pizza',
  'Vegan Mushroom Truffle': 'vegan mushroom truffle pizza',
  'Garlic Dough Balls (8)': 'garlic bread dough balls',
  'Garlic Bread': 'garlic bread italian',
  'Garlic Bread with Cheese': 'cheesy garlic bread',
  'House Salad': 'fresh garden salad',
  'Rocket & Parmesan Salad': 'arugula parmesan salad',
  'Marinated Olives': 'italian marinated olives',
  'Tiramisu': 'tiramisu italian dessert',
  'Nutella Calzone': 'nutella calzone dessert',
  'Gelato (2 scoops)': 'italian gelato ice cream',
  'Coca-Cola / Diet Coke / Fanta': 'soda drinks cans',
  'San Pellegrino': 'sparkling water bottle',
  'Peroni (330ml)': 'peroni italian beer',
  'House Wine (175ml)': 'red wine glass',
  'Tuesday 2-for-1': 'pizza deal promotion',
  'Family Feast': 'family pizza dinner',
  'Lunch Special': 'pizza lunch meal',
  'Student Deal': 'student discount pizza',
};

const CATEGORY_FALLBACKS: Record<string, string> = {
  'Classic Pizzas': 'italian pizza wood fired',
  'Signature Pizzas': 'gourmet pizza artisan',
  'Vegan Pizzas': 'vegan pizza vegetables',
  'Sides': 'italian appetizers side dish',
  'Desserts': 'italian dessert sweet',
  'Drinks': 'beverage drinks restaurant',
  'Deals': 'pizza deal special offer',
};

const ORBIT_FALLBACKS: Record<string, string> = {
  'slice-and-stone-pizza': 'italian pizza restaurant',
  'clarity-chartered-accountants': 'professional accounting office',
  'techvault-uk': 'tech gadgets electronics',
};

const TYPE_FALLBACKS: Record<string, string> = {
  'menu_item': 'food dish meal',
  'product': 'product item retail',
  'faq': 'help support question',
  'business_profile': 'business storefront',
  'opening_hours': 'store hours clock',
  'contact': 'contact information',
  'topic': 'abstract concept',
  'page': 'document information',
  'person': 'professional portrait',
  'proof': 'testimonial review',
  'action': 'call to action',
  'blog': 'blog article writing',
  'social': 'social media',
};

export function getDemoImageUrl(
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
  
  let query = PIZZA_QUERIES[title];
  
  if (!query && options?.category) {
    query = CATEGORY_FALLBACKS[options.category];
  }
  
  if (!query && options?.orbitSlug) {
    query = ORBIT_FALLBACKS[options.orbitSlug];
  }
  
  if (!query && options?.type) {
    query = TYPE_FALLBACKS[options.type];
  }
  
  if (!query) {
    const cleanTitle = title.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
    query = cleanTitle.split(' ').slice(0, 3).join(' ');
  }
  
  const seed = hashString(id + title);
  const encodedQuery = encodeURIComponent(query);
  
  return `https://source.unsplash.com/${width}x${height}/?${encodedQuery}&sig=${seed}`;
}

export function getDemoHeroImageUrl(
  id: string,
  title: string,
  options?: {
    category?: string | null;
    orbitSlug?: string;
    type?: string;
  }
): string {
  return getDemoImageUrl(id, title, { ...options, width: 800, height: 450 });
}

export function getDemoThumbnailUrl(
  id: string,
  title: string,
  options?: {
    category?: string | null;
    orbitSlug?: string;
    type?: string;
  }
): string {
  return getDemoImageUrl(id, title, { ...options, width: 120, height: 80 });
}

export function isVisualItemType(type: string): boolean {
  return ['menu_item', 'product', 'person', 'blog', 'proof'].includes(type);
}
