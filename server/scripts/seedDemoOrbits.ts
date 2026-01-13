import { storage } from "../storage";
import type * as schema from "@shared/schema";

interface DemoOrbitData {
  slug: string;
  name: string;
  sourceUrl: string;
  description: string;
  location: string;
  sector: string;
  boxes: Omit<schema.InsertOrbitBox, "businessSlug">[];
  documents: Array<{
    title: string;
    category: schema.OrbitDocumentCategory;
    content: string;
  }>;
}

const SLICE_AND_STONE_PIZZA: DemoOrbitData = {
  slug: "slice-and-stone-pizza",
  name: "Slice & Stone Pizza",
  sourceUrl: "https://sliceandstone.demo",
  description: "Artisan pizza delivery with obsessive operational transparency. Bristol's favourite wood-fired pizzas, delivered fresh to your door.",
  location: "Bristol",
  sector: "Food",
  boxes: [
    { boxType: "business_profile", title: "About Slice & Stone", description: "Family-run artisan pizzeria in Bristol since 2019", content: "Slice & Stone was founded by the Romano family who brought authentic Neapolitan pizza-making traditions to Bristol. Our dough is fermented for 48 hours minimum, and we use a wood-fired oven reaching 450°C for that perfect leopard-spotted crust. We're committed to quality - from San Marzano DOP tomatoes to locally-sourced toppings from Bristol farms. Winner of Bristol Food Awards 2023 'Best Pizza'.", sortOrder: 0, isVisible: true },
    { boxType: "opening_hours", title: "Opening Hours", description: "Tuesday-Sunday, Closed Mondays", content: "Tuesday-Thursday: 5pm-10pm\nFriday-Saturday: 12pm-11pm\nSunday: 12pm-9pm\nMonday: Closed\n\nKitchen closes 30 mins before closing for dine-in, 15 mins before for delivery.", sortOrder: 1, isVisible: true },
    { boxType: "contact", title: "Contact & Location", description: "Order online or call us", content: "Phone: 0117 123 4567\nAddress: 42 Whiteladies Road, Bristol BS8 2NH\nEmail: hello@sliceandstone.demo\nOrder online: sliceandstone.demo/order\nInstagram: @sliceandstone", sortOrder: 2, isVisible: true },
    
    { boxType: "menu_item", title: "Margherita", description: "San Marzano DOP tomatoes, fior di latte, fresh basil, EVOO", price: "12.50", currency: "GBP", category: "Classic Pizzas", tags: [{ key: "dietary", value: "vegetarian", label: "V" }], sortOrder: 10, isVisible: true },
    { boxType: "menu_item", title: "Pepperoni Picante", description: "Spicy pepperoni, tomato, mozzarella, Calabrian chilli flakes", price: "14.50", currency: "GBP", category: "Classic Pizzas", tags: [{ key: "spice", value: "hot", label: "Hot" }], sortOrder: 11, isVisible: true },
    { boxType: "menu_item", title: "Quattro Formaggi", description: "Mozzarella, gorgonzola, parmesan, ricotta, honey drizzle", price: "15.00", currency: "GBP", category: "Classic Pizzas", tags: [{ key: "dietary", value: "vegetarian", label: "V" }], sortOrder: 12, isVisible: true },
    { boxType: "menu_item", title: "Diavola", description: "Spicy salami, tomato, mozzarella, fresh chilli, oregano", price: "14.50", currency: "GBP", category: "Classic Pizzas", tags: [{ key: "spice", value: "hot", label: "Hot" }], sortOrder: 13, isVisible: true },
    { boxType: "menu_item", title: "Marinara", description: "San Marzano tomatoes, garlic, oregano, EVOO - no cheese", price: "10.00", currency: "GBP", category: "Classic Pizzas", tags: [{ key: "dietary", value: "vegan", label: "VG" }], sortOrder: 14, isVisible: true },
    { boxType: "menu_item", title: "Prosciutto e Funghi", description: "Parma ham, wild mushrooms, mozzarella, truffle oil", price: "16.00", currency: "GBP", category: "Classic Pizzas", sortOrder: 15, isVisible: true },
    { boxType: "menu_item", title: "Capricciosa", description: "Ham, artichokes, mushrooms, olives, mozzarella", price: "15.50", currency: "GBP", category: "Classic Pizzas", sortOrder: 16, isVisible: true },
    { boxType: "menu_item", title: "Napoli", description: "Anchovies, capers, olives, tomato, mozzarella", price: "14.50", currency: "GBP", category: "Classic Pizzas", sortOrder: 17, isVisible: true },
    { boxType: "menu_item", title: "Salsiccia", description: "Italian fennel sausage, roasted peppers, onions, mozzarella", price: "15.50", currency: "GBP", category: "Classic Pizzas", sortOrder: 18, isVisible: true },
    { boxType: "menu_item", title: "Bianca", description: "No tomato - mozzarella, ricotta, garlic oil, fresh rosemary", price: "13.50", currency: "GBP", category: "Classic Pizzas", tags: [{ key: "dietary", value: "vegetarian", label: "V" }], sortOrder: 19, isVisible: true },
    
    { boxType: "menu_item", title: "Nduja & Honey", description: "Spicy nduja, mozzarella, local Bristol honey, rocket", price: "16.00", currency: "GBP", category: "Signature Pizzas", tags: [{ key: "spice", value: "medium", label: "Med" }], sortOrder: 20, isVisible: true },
    { boxType: "menu_item", title: "Truffle Mushroom", description: "Wild mushrooms, truffle oil, parmesan, thyme, burrata", price: "17.50", currency: "GBP", category: "Signature Pizzas", tags: [{ key: "dietary", value: "vegetarian", label: "V" }], sortOrder: 21, isVisible: true },
    { boxType: "menu_item", title: "The Bristol", description: "Local chorizo, roasted peppers, red onion, rocket, balsamic glaze", price: "16.50", currency: "GBP", category: "Signature Pizzas", sortOrder: 22, isVisible: true },
    { boxType: "menu_item", title: "Burrata & Parma", description: "Whole burrata, Parma ham, rocket, cherry tomatoes, balsamic", price: "18.00", currency: "GBP", category: "Signature Pizzas", sortOrder: 23, isVisible: true },
    { boxType: "menu_item", title: "Mortadella Pistachio", description: "Mortadella, pistachio pesto, stracciatella, lemon zest", price: "17.50", currency: "GBP", category: "Signature Pizzas", sortOrder: 24, isVisible: true },
    { boxType: "menu_item", title: "Lamb Kofta", description: "Spiced lamb kofta, tzatziki, pickled onions, mint, chilli", price: "17.00", currency: "GBP", category: "Signature Pizzas", tags: [{ key: "spice", value: "medium", label: "Med" }], sortOrder: 25, isVisible: true },
    { boxType: "menu_item", title: "Fig & Gorgonzola", description: "Fresh figs, gorgonzola, walnuts, honey, rocket", price: "17.00", currency: "GBP", category: "Signature Pizzas", tags: [{ key: "dietary", value: "vegetarian", label: "V" }], sortOrder: 26, isVisible: true },
    { boxType: "menu_item", title: "Seafood Bianca", description: "King prawns, squid, garlic oil, chilli, parsley - no tomato", price: "19.00", currency: "GBP", category: "Signature Pizzas", sortOrder: 27, isVisible: true },
    { boxType: "menu_item", title: "BBQ Pulled Pork", description: "12-hour smoked pork, BBQ sauce, jalapeños, pickles, slaw", price: "17.00", currency: "GBP", category: "Signature Pizzas", tags: [{ key: "spice", value: "medium", label: "Med" }], sortOrder: 28, isVisible: true },
    { boxType: "menu_item", title: "Goat Cheese & Beetroot", description: "Roasted beetroot, goat cheese, walnuts, honey, rocket", price: "16.50", currency: "GBP", category: "Signature Pizzas", tags: [{ key: "dietary", value: "vegetarian", label: "V" }], sortOrder: 29, isVisible: true },
    
    { boxType: "menu_item", title: "Vegan Garden", description: "Vegan mozzarella, roasted vegetables, olives, capers", price: "15.00", currency: "GBP", category: "Vegan Pizzas", tags: [{ key: "dietary", value: "vegan", label: "VG" }], sortOrder: 30, isVisible: true },
    { boxType: "menu_item", title: "Vegan BBQ Jackfruit", description: "Pulled BBQ jackfruit, vegan cheese, red onion, coriander", price: "16.00", currency: "GBP", category: "Vegan Pizzas", tags: [{ key: "dietary", value: "vegan", label: "VG" }], sortOrder: 31, isVisible: true },
    { boxType: "menu_item", title: "Vegan Pepperoni", description: "Plant-based pepperoni, tomato, vegan mozzarella, chilli", price: "15.50", currency: "GBP", category: "Vegan Pizzas", tags: [{ key: "dietary", value: "vegan", label: "VG" }], sortOrder: 32, isVisible: true },
    { boxType: "menu_item", title: "Vegan Mushroom Truffle", description: "Wild mushrooms, truffle oil, vegan cheese, thyme", price: "16.50", currency: "GBP", category: "Vegan Pizzas", tags: [{ key: "dietary", value: "vegan", label: "VG" }], sortOrder: 33, isVisible: true },
    
    { boxType: "menu_item", title: "Garlic Dough Balls (8)", description: "Freshly baked dough balls with garlic butter", price: "5.50", currency: "GBP", category: "Sides", tags: [{ key: "dietary", value: "vegetarian", label: "V" }], sortOrder: 40, isVisible: true },
    { boxType: "menu_item", title: "Garlic Bread", description: "Toasted pizza dough with garlic butter and oregano", price: "4.50", currency: "GBP", category: "Sides", tags: [{ key: "dietary", value: "vegetarian", label: "V" }], sortOrder: 41, isVisible: true },
    { boxType: "menu_item", title: "Garlic Bread with Cheese", description: "Garlic bread topped with mozzarella", price: "5.50", currency: "GBP", category: "Sides", tags: [{ key: "dietary", value: "vegetarian", label: "V" }], sortOrder: 42, isVisible: true },
    { boxType: "menu_item", title: "House Salad", description: "Mixed leaves, cherry tomatoes, cucumber, balsamic dressing", price: "4.50", currency: "GBP", category: "Sides", tags: [{ key: "dietary", value: "vegan", label: "VG" }], sortOrder: 43, isVisible: true },
    { boxType: "menu_item", title: "Rocket & Parmesan Salad", description: "Wild rocket, shaved parmesan, lemon dressing", price: "5.50", currency: "GBP", category: "Sides", tags: [{ key: "dietary", value: "vegetarian", label: "V" }], sortOrder: 44, isVisible: true },
    { boxType: "menu_item", title: "Marinated Olives", description: "Mixed Italian olives with herbs and chilli", price: "3.50", currency: "GBP", category: "Sides", tags: [{ key: "dietary", value: "vegan", label: "VG" }], sortOrder: 45, isVisible: true },
    { boxType: "menu_item", title: "Tiramisu", description: "Classic Italian dessert, made fresh daily", price: "6.50", currency: "GBP", category: "Desserts", tags: [{ key: "dietary", value: "vegetarian", label: "V" }], sortOrder: 46, isVisible: true },
    { boxType: "menu_item", title: "Nutella Calzone", description: "Sweet pizza dough filled with Nutella, dusted with sugar", price: "7.00", currency: "GBP", category: "Desserts", tags: [{ key: "dietary", value: "vegetarian", label: "V" }], sortOrder: 47, isVisible: true },
    { boxType: "menu_item", title: "Gelato (2 scoops)", description: "Italian gelato - ask for today's flavours", price: "5.00", currency: "GBP", category: "Desserts", tags: [{ key: "dietary", value: "vegetarian", label: "V" }], sortOrder: 48, isVisible: true },
    
    { boxType: "menu_item", title: "Coca-Cola / Diet Coke / Fanta", description: "330ml can", price: "2.00", currency: "GBP", category: "Drinks", sortOrder: 50, isVisible: true },
    { boxType: "menu_item", title: "San Pellegrino", description: "Sparkling water 500ml", price: "2.50", currency: "GBP", category: "Drinks", sortOrder: 51, isVisible: true },
    { boxType: "menu_item", title: "Peroni (330ml)", description: "Italian lager", price: "4.50", currency: "GBP", category: "Drinks", sortOrder: 52, isVisible: true },
    { boxType: "menu_item", title: "House Wine (175ml)", description: "Red, White or Rosé", price: "5.50", currency: "GBP", category: "Drinks", sortOrder: 53, isVisible: true },
    
    { boxType: "product", title: "Tuesday 2-for-1", description: "Any two pizzas for the price of the most expensive", price: "0", category: "Deals", content: "Available every Tuesday from 5pm. Order any two pizzas and only pay for the higher priced one. Collection from store only - not available for delivery. Cannot be combined with other offers. Valid on Classic and Signature pizzas only.", sortOrder: 60, isVisible: true },
    { boxType: "product", title: "Family Feast", description: "2 large pizzas, garlic bread, salad & 1.5L drink", price: "39.99", currency: "GBP", category: "Deals", content: "Perfect for family nights. Includes any 2 large pizzas from the Classic menu, large garlic bread, house salad, and 1.5L bottle of Coca-Cola, Fanta, or Sprite. Available for delivery or collection.", sortOrder: 61, isVisible: true },
    { boxType: "product", title: "Lunch Special", description: "Any 10\" pizza + drink for £9.99 (12-4pm)", price: "9.99", currency: "GBP", category: "Deals", content: "Available Tuesday-Saturday 12pm-4pm. Any pizza from Classic menu in 10\" size plus any soft drink. Dine-in or collection only. Not available for delivery.", sortOrder: 62, isVisible: true },
    { boxType: "product", title: "Student Deal", description: "20% off with valid student ID", price: "0", category: "Deals", content: "Show valid student ID for 20% off your order. Valid on collection and dine-in only, Sunday-Thursday. Cannot be combined with other offers. One use per student per visit.", sortOrder: 63, isVisible: true },
    
    { boxType: "faq", title: "What areas do you deliver to?", description: "Delivery zones and fees", content: "We deliver to most of Bristol. FREE delivery on orders £20+ to BS1, BS2, BS6, BS7, BS8. £2.50 fee for orders under £20. Extended zones (BS3, BS4, BS5, BS9, BS10, BS11) have a £3.50 delivery fee. We don't currently deliver to BS13, BS14, BS15, BS16, BS20+ postcodes. Check our website for real-time estimates.", sortOrder: 70, isVisible: true },
    { boxType: "faq", title: "What vegan options do you have?", description: "Vegan menu information", content: "We have a dedicated vegan menu with 4 vegan pizzas: Vegan Garden, Vegan BBQ Jackfruit, Vegan Pepperoni, and Vegan Mushroom Truffle. Our Marinara is also naturally vegan. We use premium vegan mozzarella alternative. Our dough is naturally vegan (flour, water, salt, yeast). Many sides are vegan too. We take cross-contamination seriously but use shared equipment.", sortOrder: 71, isVisible: true },
    { boxType: "faq", title: "What allergens are in your food?", description: "Allergen information and policies", content: "Our pizzas contain GLUTEN (wheat flour) and MILK (cheese). Specific allergens vary by pizza. We CANNOT make gluten-free pizzas as our dough is made fresh in-store and shared with all products. For dairy-free, try our vegan options. Our kitchen handles NUTS, SESAME, FISH, and CRUSTACEANS. For severe allergies, please call ahead.", sortOrder: 72, isVisible: true },
    { boxType: "faq", title: "How long does delivery take?", description: "Delivery times and tracking", content: "Typical delivery: 30-45 minutes. During peak times (Friday/Saturday 7-9pm) can be up to 60-75 minutes. You'll receive a text with tracking when your order leaves. If we're running very busy, the website will show extended times before you order.", sortOrder: 73, isVisible: true },
    { boxType: "faq", title: "Can I customize my pizza?", description: "Customization options and charges", content: "Yes! Extra toppings are £1.50-2.50 each. You can also request 'light cheese', 'well done', 'no basil' etc at no charge. Premium toppings (truffle oil, burrata, nduja) are +£2.50. Remove any topping free. Heavy customization may affect cooking time.", sortOrder: 74, isVisible: true },
    { boxType: "faq", title: "What's the best deal for a group of 6?", description: "Group ordering recommendations", content: "For 6 people we recommend 2x Family Feast deals (£79.98) - that's 4 large pizzas, 2 garlic breads, 2 salads, 2 drinks. On Tuesdays, use our 2-for-1 for collection and get 6 pizzas for the price of 3. For 10+ people or events, call us about catering.", sortOrder: 75, isVisible: true },
    
    { boxType: "faq", title: "My delivery is late - what do I do?", description: "Late delivery policy", content: "If your order is running more than 15 minutes past the quoted time, call us on 0117 123 4567. We'll check status and give you an update. If over 30 mins late: 20% discount code for next order. If over 60 mins late or food arrives cold: full refund or remake. We track all deliveries and always try to make it right.", sortOrder: 80, isVisible: true },
    { boxType: "faq", title: "My order arrived wrong or damaged", description: "Wrong order resolution", content: "Call us within 30 minutes on 0117 123 4567. Keep the incorrect item. We'll either: 1) Send out the correct item immediately (free), 2) Refund the incorrect item in full, or 3) Credit your account for next order. Please take a photo if packaging is damaged - this helps us improve.", sortOrder: 81, isVisible: true },
    { boxType: "faq", title: "My pizza arrived cold", description: "Cold food complaints", content: "We're really sorry - this shouldn't happen. Call us immediately on 0117 123 4567. Options: 1) We remake and send a fresh pizza (priority delivery), 2) Full refund for the cold pizza. We use insulated bags and track delivery times, but sometimes issues happen. We'll always make it right.", sortOrder: 82, isVisible: true },
    { boxType: "faq", title: "I had an allergic reaction", description: "Allergen incident response", content: "We take allergies extremely seriously. If you've had a reaction: 1) Seek medical attention if needed, 2) Contact us immediately at hello@sliceandstone.demo or 0117 123 4567, 3) Keep any packaging/food if safe. We'll investigate, provide full refund, and review our processes. Our allergen matrix is available on request.", sortOrder: 83, isVisible: true },
    { boxType: "faq", title: "Can I get a refund if I change my mind?", description: "Cancellation and refund policy", content: "BEFORE COOKING STARTS: Full refund if you cancel within 5 minutes of ordering. AFTER COOKING: We can't offer refunds for change of mind once cooking starts. QUALITY ISSUES: Always refunded - see our complaints policy. Contact us ASAP if you need to cancel.", sortOrder: 84, isVisible: true },
    { boxType: "faq", title: "I found something in my food", description: "Foreign object complaints", content: "We're very sorry. Please: 1) Don't eat more of the item, 2) Take a photo of the object, 3) Call us immediately on 0117 123 4567, 4) Keep the evidence if safe. We'll refund the meal, investigate thoroughly, and follow up with what we found. This is extremely rare but we treat it very seriously.", sortOrder: 85, isVisible: true },
    { boxType: "faq", title: "The driver was rude", description: "Delivery staff complaints", content: "We're sorry to hear this. Please email hello@sliceandstone.demo with: 1) Your order number, 2) Date and time, 3) What happened. We take driver conduct seriously and will investigate. We'll offer a discount code and follow up with the driver. Our drivers are trained to be professional and courteous.", sortOrder: 86, isVisible: true },
    { boxType: "faq", title: "I was overcharged", description: "Billing disputes", content: "Please email hello@sliceandstone.demo with your order number and bank statement showing the charge. Common issues: 1) Pending charges that don't settle, 2) Delivery fees in extended zones, 3) Premium topping charges. We'll review within 24 hours and refund any overcharges immediately.", sortOrder: 87, isVisible: true },
    { boxType: "faq", title: "Do you cater for events?", description: "Private events and catering", content: "Yes! We offer catering for 15+ people. Options: 1) Pizza Party (minimum 5 pizzas delivered hot), 2) On-site catering (we bring oven and chef - from £500), 3) Corporate lunches (pizza boxes + salads). Email hello@sliceandstone.demo at least 72 hours in advance. Deposit required for bookings.", sortOrder: 88, isVisible: true },
    { boxType: "faq", title: "Are you open on bank holidays?", description: "Bank holiday and Christmas hours", content: "BANK HOLIDAYS: Usually open normal Sunday hours (12pm-9pm). Check our website/Instagram for specific dates. CHRISTMAS: Closed 24-26 December. Open 27-30 December reduced hours. Closed 31 Dec - 1 Jan. NEW YEAR: Reopen 2nd January. EASTER: Closed Good Friday, open Easter Saturday/Sunday.", sortOrder: 89, isVisible: true },
    { boxType: "faq", title: "What happens during very bad weather?", description: "Weather disruption policy", content: "For driver safety, we may: 1) Suspend deliveries temporarily during storms/heavy snow, 2) Extend delivery times significantly, 3) Reduce delivery radius. Collection remains available unless roads are dangerous. Check our website for live updates - we'll always post status changes. Your order can be cancelled/refunded if we can't deliver.", sortOrder: 90, isVisible: true },
  ],
  documents: [
    {
      title: "Complete Delivery Zones & Fees",
      category: "guide",
      content: `SLICE & STONE DELIVERY ZONES - COMPLETE GUIDE

FREE DELIVERY (orders £20+):
- BS1 (City Centre): 25-35 mins typical
- BS2 (St Pauls, Montpelier): 25-35 mins
- BS6 (Redland, Cotham): 20-30 mins
- BS7 (Bishopston, Horfield): 25-40 mins
- BS8 (Clifton, Hotwells): 15-25 mins - our local area!

£2.50 DELIVERY FEE (orders under £20 to above zones)

EXTENDED ZONES - £3.50 DELIVERY (all orders):
- BS3 (Southville, Bedminster, Ashton): 30-45 mins
- BS4 (Brislington, Knowle, Totterdown): 35-50 mins
- BS5 (Easton, St George, Whitehall): 30-45 mins
- BS9 (Westbury-on-Trym, Henleaze, Stoke Bishop): 35-50 mins
- BS10 (Brentry, Southmead, Henbury): 40-55 mins
- BS11 (Avonmouth, Shirehampton): 45-60 mins

NOT CURRENTLY SERVING:
- BS13 (Hartcliffe, Withywood)
- BS14 (Whitchurch, Stockwood)
- BS15 (Kingswood, Hanham)
- BS16 (Fishponds, Downend, Staple Hill)
- BS20+ (North Somerset areas)

PEAK TIME SURCHARGES & DELAYS:
Friday 6-9pm: Add 15-20 mins to estimates
Saturday 6-9pm: Add 20-30 mins to estimates
Bank holidays: Add 15 mins, may pause if very busy

MINIMUM ORDERS:
- BS1-BS9: £12 minimum
- BS10-BS11: £20 minimum

ORDER TRACKING:
SMS with live tracking link sent when driver departs.
Call 0117 123 4567 if issues - we can see exactly where your order is.`
    },
    {
      title: "Full Allergen Information",
      category: "guide",
      content: `SLICE & STONE ALLERGEN GUIDE

IMPORTANT: WE CANNOT PRODUCE GLUTEN-FREE PRODUCTS
Our dough contains wheat. All pizzas are made in shared equipment.
If you have coeliac disease, we cannot safely serve you.

ALL STANDARD PIZZAS CONTAIN:
- GLUTEN (wheat flour in dough)
- MILK (mozzarella cheese)

SPECIFIC ALLERGENS BY PIZZA:

CLASSIC PIZZAS:
- Margherita: Gluten, Milk
- Pepperoni Picante: Gluten, Milk
- Quattro Formaggi: Gluten, Milk (multiple dairy types)
- Diavola: Gluten, Milk, may contain SULPHITES
- Marinara: Gluten only (no cheese)
- Prosciutto e Funghi: Gluten, Milk
- Capricciosa: Gluten, Milk
- Napoli: Gluten, Milk, FISH
- Salsiccia: Gluten, Milk, may contain SULPHITES
- Bianca: Gluten, Milk

SIGNATURE PIZZAS:
- Nduja & Honey: Gluten, Milk, may contain SULPHITES
- Truffle Mushroom: Gluten, Milk
- The Bristol: Gluten, Milk, may contain SULPHITES
- Burrata & Parma: Gluten, Milk
- Mortadella Pistachio: Gluten, Milk, TREE NUTS (pistachio)
- Lamb Kofta: Gluten, Milk, may contain SESAME
- Fig & Gorgonzola: Gluten, Milk, TREE NUTS (walnuts)
- Seafood Bianca: Gluten, FISH, CRUSTACEANS, MOLLUSCS
- BBQ Pulled Pork: Gluten, Milk, may contain MUSTARD, CELERY
- Goat Cheese & Beetroot: Gluten, Milk, TREE NUTS (walnuts)

VEGAN PIZZAS (No dairy):
- Vegan Garden: Gluten, SOYA (vegan cheese)
- Vegan BBQ Jackfruit: Gluten, SOYA
- Vegan Pepperoni: Gluten, SOYA
- Vegan Mushroom Truffle: Gluten, SOYA

SIDES:
- Garlic Dough Balls: Gluten, Milk
- Garlic Bread: Gluten, Milk
- House Salad: May contain MUSTARD (dressing)
- Rocket Salad: Milk
- Marinated Olives: May contain SULPHITES

DESSERTS:
- Tiramisu: Gluten, Milk, EGGS
- Nutella Calzone: Gluten, Milk, TREE NUTS (hazelnuts), SOYA
- Gelato: Milk, EGGS, may contain NUTS (varies by flavour)

CROSS-CONTAMINATION NOTICE:
Our kitchen handles all 14 major allergens. We cannot guarantee any product is free from traces.
For severe allergies: PLEASE CALL US to discuss your requirements before ordering.`
    },
    {
      title: "Complaints & Refund Policy",
      category: "policies",
      content: `SLICE & STONE COMPLAINTS POLICY

OUR PROMISE: If you're not happy, we'll make it right. No arguments.

WRONG ORDER / MISSING ITEMS:
- Call within 30 mins: 0117 123 4567
- We'll send correct items ASAP (priority delivery)
- OR provide full refund for missing items
- Keep incorrect items - they're yours

QUALITY ISSUES (undercooked, burnt, etc):
- Take a photo if possible
- Contact within 24 hours
- Full replacement OR full refund - your choice

LATE DELIVERY COMPENSATION:
- 30+ mins late: 20% discount code for next order
- 60+ mins late: Full refund offered
- Food cold on arrival: Full refund + replacement

FOOD SAFETY CONCERNS:
- If you find a foreign object: Call immediately, keep evidence
- Suspected food poisoning: Contact us + seek medical advice
- Full investigation + refund guaranteed

HOW TO CONTACT US:
1. Phone: 0117 123 4567 (best for urgent issues)
2. Email: hello@sliceandstone.demo
3. Instagram DM: @sliceandstone
4. In person: 42 Whiteladies Road, Bristol

RESPONSE TIMES:
- Phone: Immediate during opening hours
- Email: Within 24 hours
- Social: Within 12 hours

WHAT WE NEED FROM YOU:
- Order number (in confirmation email/text)
- Date and time of order
- Description of issue
- Photos if relevant

ESCALATION:
If you're not satisfied with our response, email the owner directly: romano@sliceandstone.demo

OUR PHILOSOPHY:
We've been running this pizzeria for 5 years. We'd rather lose money on one order than lose a customer forever. If you're unhappy, we want to know - and we'll fix it.`
    },
    {
      title: "Holiday Hours & Special Closures",
      category: "policies",
      content: `SLICE & STONE HOLIDAY SCHEDULE 2024-25

REGULAR HOURS:
Tuesday-Thursday: 5pm-10pm
Friday-Saturday: 12pm-11pm
Sunday: 12pm-9pm
Monday: CLOSED

BANK HOLIDAYS:
All bank holidays: Open 12pm-9pm (Sunday hours)
- New Year's Day: CLOSED
- Good Friday: CLOSED
- Easter Saturday: Open 12pm-9pm
- Easter Sunday: Open 12pm-9pm
- Early May Bank Holiday: Open 12pm-9pm
- Spring Bank Holiday: Open 12pm-9pm
- Summer Bank Holiday: Open 12pm-9pm
- Christmas: See below
- Boxing Day: CLOSED

CHRISTMAS PERIOD:
- 23 December: Normal Friday/Saturday hours
- 24 December (Christmas Eve): 12pm-6pm (collection only from 4pm)
- 25 December: CLOSED
- 26 December: CLOSED
- 27-30 December: Open 12pm-9pm daily
- 31 December (NYE): 12pm-8pm
- 1 January: CLOSED
- 2 January: Normal hours resume

STAFF HOLIDAYS:
We close for annual staff holiday:
- Last week of January (approx 24-31 Jan)
Check website/Instagram for exact dates each year.

BRISTOL BALLOON FIESTA WEEKEND:
Extended hours Friday-Sunday during fiesta (usually August)
Delivery may be limited in BS8 due to road closures.

WEATHER CLOSURES:
We may close or reduce service during:
- Heavy snow (driver safety)
- Severe storms
- Flooding affecting roads
Updates posted on Instagram and website.`
    }
  ]
};

const CLARITY_ACCOUNTANTS: DemoOrbitData = {
  slug: "clarity-chartered-accountants",
  name: "Clarity Chartered Accountants",
  sourceUrl: "https://clarityaccountants.demo",
  description: "Fixed-fee accountancy with radical transparency on pricing and process. We make accounting simple for small businesses and startups.",
  location: "Leeds (UK-wide remote)",
  sector: "Professional Services",
  boxes: [
    { boxType: "business_profile", title: "About Clarity", description: "Chartered accountants specialising in small business and startup accounting", content: "Clarity Chartered Accountants was founded in 2015 with a simple mission: make accounting transparent and stress-free for small business owners. We're ICAEW-regulated and specialise in limited companies, sole traders, and startups. All our services are fixed-fee - no hourly billing surprises. We've helped over 500 businesses across the UK.", sortOrder: 0, isVisible: true },
    { boxType: "contact", title: "Contact Us", description: "Based in Leeds, serving clients UK-wide", content: "Phone: 0113 456 7890\nEmail: hello@clarityaccountants.demo\nAddress: 12 Park Row, Leeds LS1 5HD\nMeetings: Video calls available nationwide\nOffice hours: Monday-Friday 9am-5:30pm", sortOrder: 1, isVisible: true },
    { boxType: "team_member", title: "Sarah Mitchell, FCA", description: "Founder & Managing Director", content: "Sarah founded Clarity after 15 years at Big Four firms. She saw how small businesses were underserved by traditional accounting and set out to change that. She's a Fellow of the ICAEW and specializes in tech startups and e-commerce businesses.", sortOrder: 2, isVisible: true },
    { boxType: "team_member", title: "James Wong, ACA", description: "Tax Director", content: "James leads our tax advisory practice. With 10 years of experience in personal and corporate tax, he helps clients legitimately minimise their tax burden. He's particularly passionate about R&D tax credits for innovative businesses.", sortOrder: 3, isVisible: true },
    { boxType: "team_member", title: "Emma Patel, ACCA", description: "Client Services Manager", content: "Emma manages our client relationships and ensures smooth onboarding. She's usually your first point of contact and coordinates all work across our team. She's known for her responsiveness and clear communication.", sortOrder: 4, isVisible: true },
    { boxType: "team_member", title: "David Clark, ACMA", description: "Management Accounts Specialist", content: "David provides management accounts and financial forecasting for growing businesses. With a background in finance director roles, he brings commercial insight beyond basic compliance.", sortOrder: 5, isVisible: true },
    
    { boxType: "product", title: "Sole Trader Starter", description: "For sole traders with turnover under £30k", price: "55", currency: "GBP", category: "Sole Trader Packages", content: "Self Assessment tax return, Annual accounts summary, Basic bookkeeping review, Email support during office hours, One tax planning call per year. Best for: side hustles, freelancers just starting out. Price: £55/month or £594/year (10% discount).", sortOrder: 10, isVisible: true },
    { boxType: "product", title: "Sole Trader Standard", description: "For sole traders with turnover £30k-£85k", price: "85", currency: "GBP", category: "Sole Trader Packages", content: "Self Assessment tax return, Full annual accounts, MTD-compliant bookkeeping review, Email & phone support, Quarterly catch-up calls, Year-end tax planning meeting, VAT returns if applicable. Price: £85/month or £918/year.", sortOrder: 11, isVisible: true },
    { boxType: "product", title: "Sole Trader Growth", description: "For sole traders approaching VAT threshold or considering incorporation", price: "125", currency: "GBP", category: "Sole Trader Packages", content: "Everything in Standard plus: Monthly bookkeeping (up to 30 transactions), Quarterly management reports, Incorporation analysis, Pension planning guidance, Priority support. Price: £125/month.", sortOrder: 12, isVisible: true },
    
    { boxType: "product", title: "Limited Company Micro", description: "For small limited companies with turnover under £50k", price: "125", currency: "GBP", category: "Limited Company Packages", content: "Annual statutory accounts, Corporation Tax return, Confirmation Statement, Payroll for 1 director, Director's personal tax return, VAT returns (if registered), Quarterly management summary, Unlimited email support. Price: £125/month.", sortOrder: 15, isVisible: true },
    { boxType: "product", title: "Limited Company Standard", description: "Full compliance package for companies with turnover £50k-£200k", price: "175", currency: "GBP", category: "Limited Company Packages", content: "Annual statutory accounts, Corporation Tax return, Confirmation Statement, Payroll for up to 2 directors, Personal tax returns for directors, VAT returns, Quarterly management accounts, Unlimited email & phone support, Monthly call with your accountant. Price: £175/month.", sortOrder: 16, isVisible: true },
    { boxType: "product", title: "Limited Company Growth", description: "For companies with employees, turnover £200k-£500k", price: "325", currency: "GBP", category: "Limited Company Packages", content: "Everything in Standard plus: Payroll for up to 10 employees, Monthly management accounts with KPIs, Cash flow forecasting, Annual strategic tax planning, R&D tax credit review, Bookkeeping (up to 75 transactions/month), Dedicated senior accountant. Price: £325/month.", sortOrder: 17, isVisible: true },
    { boxType: "product", title: "Limited Company Scale", description: "For established businesses with turnover £500k+", price: "550", currency: "GBP", category: "Limited Company Packages", content: "Everything in Growth plus: Unlimited payroll, FD-level financial oversight, Board reporting pack, Budgeting & variance analysis, Audit preparation (if needed), Investor/bank reporting support, Priority access to tax director. Price: £550/month. Bespoke pricing for £1m+ turnover.", sortOrder: 18, isVisible: true },
    
    { boxType: "product", title: "Startup Launch Package", description: "Company formation + first year accounting for new businesses", price: "699", currency: "GBP", category: "One-off Services", content: "Company formation with Companies House, Registered office service (1 year), Corporation Tax registration, VAT registration (if needed), PAYE registration, Bank account setup support, 6 months of basic bookkeeping, Formation to first accounts filing, 3x strategy calls, SEIS/EIS guidance if applicable. One-off fee: £699.", sortOrder: 20, isVisible: true },
    { boxType: "product", title: "R&D Tax Credits", description: "Specialist claims for innovative businesses", price: "0", category: "Specialist Services", content: "We work on a success-only basis - 15% of the claim value, capped at £5,000. No win, no fee. Most claims processed within 8 weeks. Average claim value for our clients: £25,000-£50,000. We handle the full submission and liaise with HMRC directly.", sortOrder: 21, isVisible: true },
    { boxType: "product", title: "IR35 Assessment", description: "For contractors working through limited companies", price: "350", currency: "GBP", category: "Specialist Services", content: "Comprehensive IR35 status assessment for your contracts. Includes: Review of contract terms, Assessment of working practices, Written opinion with reasoning, Action plan if borderline, Support if challenged by HMRC. One-off fee: £350 per contract reviewed.", sortOrder: 22, isVisible: true },
    { boxType: "product", title: "Ad-hoc Bookkeeping", description: "Catch-up bookkeeping for messy accounts", price: "50", currency: "GBP", category: "Add-on Services", content: "£50/hour for bookkeeping work. Typical catch-up project: £200-£800 depending on backlog. We use Xero, QuickBooks, and FreeAgent. Bank reconciliation, invoice processing, expense categorisation.", sortOrder: 23, isVisible: true },
    { boxType: "product", title: "Payroll Add-on", description: "Additional employee payroll processing", price: "8", currency: "GBP", category: "Add-on Services", content: "£8 per employee per month (beyond those included in your package). Includes: RTI submissions, payslips, P45/P60 preparation, auto-enrolment compliance. Minimum 3 employees for standalone payroll: £50/month.", sortOrder: 24, isVisible: true },
    { boxType: "product", title: "Tax Investigation Insurance", description: "Protection against HMRC enquiry costs", price: "15", currency: "GBP", category: "Add-on Services", content: "£15/month covers professional fees for HMRC enquiries up to £100,000. Includes: Full defence representation, All correspondence handled, Specialist tax investigation team. Worth it if you want peace of mind. Highly recommended for higher-rate taxpayers.", sortOrder: 25, isVisible: true },
    
    { boxType: "faq", title: "How much for a limited company?", description: "Pricing for limited company accounting", content: "Depends on your turnover and complexity. Micro (under £50k): £125/month. Standard (£50k-£200k): £175/month. Growth (£200k-£500k): £325/month. Scale (£500k+): £550/month. All include accounts, tax returns, VAT, basic payroll, and support. Book a free call to discuss your needs.", sortOrder: 30, isVisible: true },
    { boxType: "faq", title: "How do I switch accountants?", description: "The process for moving to Clarity", content: "Easier than you think: 1) Free 30-min discovery call with us, 2) We send 'disengagement letter' to your current accountant, 3) They're legally required to hand over records within 28 days, 4) We handle all admin - you just sign our letter. Takes 2-4 weeks. We never charge for takeover time. Your old accountant cannot refuse to release records.", sortOrder: 31, isVisible: true },
    { boxType: "faq", title: "When is Corporation Tax due?", description: "Key filing deadlines explained", content: "Corporation Tax PAYMENT: Due 9 months + 1 day after your year end. Example: Year end 31 March 2024 = tax due 1 January 2025. Corporation Tax RETURN (CT600): Due 12 months after year end. ACCOUNTS filing at Companies House: Due 9 months after year end. We'll remind you 3 months, 1 month, and 2 weeks before each deadline.", sortOrder: 32, isVisible: true },
    { boxType: "faq", title: "What software do you use?", description: "Our tech stack and integrations", content: "Primary: Xero (we're Xero Gold Partners). Also support: QuickBooks Online, FreeAgent, Sage. For payroll: Xero Payroll or BrightPay. Receipt capture: Dext (free for all clients). We can migrate you from any existing software.", sortOrder: 33, isVisible: true },
    { boxType: "faq", title: "Do you offer payment plans?", description: "Flexible payment options", content: "Yes! Monthly packages: Pay by Direct Debit monthly (no extra charge) or annually (save 10%). One-off services: 50% upfront, 50% on completion. Struggling? Talk to us - we can arrange payment plans for one-off work. We'd rather work with you than lose you.", sortOrder: 34, isVisible: true },
    { boxType: "faq", title: "What's included in unlimited support?", description: "Understanding our support promise", content: "Unlimited support means: Emails answered within 4 working hours, Phone calls during office hours (no appointment needed), Quick WhatsApp for urgent matters. NOT included: Work taking more than 15 minutes (quoted separately), Advice for third parties, Services outside your package. We're transparent - if a question becomes a project, we'll tell you.", sortOrder: 35, isVisible: true },
    { boxType: "faq", title: "Can you help with HMRC investigations?", description: "Support during tax enquiries", content: "Yes. We recommend Tax Investigation Insurance (£15/month) which covers professional fees. Without insurance, we charge £150/hour for investigation support. We've successfully defended dozens of clients - most enquiries are routine. If you receive any HMRC letter, forward it to us immediately - don't respond yourself.", sortOrder: 36, isVisible: true },
    { boxType: "faq", title: "What's your onboarding process?", description: "Getting started with Clarity", content: "1) Free 30-min discovery call, 2) Proposal within 24 hours, 3) Sign engagement letter + set up Direct Debit, 4) We request records from old accountant, 5) 60-min onboarding call to set up systems, 6) Welcome pack with key dates. Fully onboarded within 2-3 weeks typically.", sortOrder: 37, isVisible: true },
    
    { boxType: "faq", title: "What happens if I miss a tax deadline?", description: "HMRC penalties explained", content: "SELF ASSESSMENT: 1 day late = £100. 3 months late = £10/day (up to £900). 6 months = additional £300 or 5% of tax. 12 months = additional £300 or 5%. CORPORATION TAX: 1 day late = £100. 3 months = another £100. Plus interest on unpaid tax. VAT: Depends on history - builds up to 15% surcharge. WE PREVENT THIS: We send reminders and chase you for information.", sortOrder: 40, isVisible: true },
    { boxType: "faq", title: "Am I inside or outside IR35?", description: "Understanding IR35 for contractors", content: "IR35 catches contractors who would be employees if engaged directly. Key factors: Control (do they tell you how/when to work?), Substitution (can you send someone else?), Mutuality of Obligation (must they offer work, must you accept?). Since April 2021, medium/large clients make the determination. We offer IR35 assessments (£350) with written opinion and defence support.", sortOrder: 41, isVisible: true },
    { boxType: "faq", title: "Should I incorporate or stay sole trader?", description: "Limited company vs sole trader decision", content: "ROUGH GUIDE: Under £30k profit - usually stay sole trader. £30k-£50k - consider incorporation. Over £50k - usually worth incorporating. But it depends on: Do you extract all profits? Other income? Future plans? Book a free call for personalised analysis. We can model your specific numbers.", sortOrder: 42, isVisible: true },
    { boxType: "faq", title: "What if my old accountant won't release my records?", description: "Professional clearance process", content: "They are legally and professionally required to hand over your records within 28 days. If they refuse: 1) We send formal clearance letter citing professional standards, 2) We can complain to their professional body (ICAEW/ACCA), 3) We work with available information and reconstruct if needed. They CANNOT hold records hostage. We handle this regularly.", sortOrder: 43, isVisible: true },
    { boxType: "faq", title: "I haven't filed taxes for years - can you help?", description: "Catching up on overdue filings", content: "Yes, we help clients catch up regularly. Process: 1) Discovery call to understand situation, 2) We request information from HMRC, 3) Reconstruct records as needed, 4) File outstanding returns, 5) Negotiate penalties where possible. HMRC are more lenient if you come to them. Don't ignore it - the longer you wait, the worse penalties get. Contact us confidentially.", sortOrder: 44, isVisible: true },
    { boxType: "faq", title: "Can you help reduce my tax bill?", description: "Tax planning and minimisation", content: "We help clients pay the RIGHT amount of tax - not more than necessary. Legitimate strategies: Pension contributions, Salary vs dividends optimization, R&D tax credits, Capital allowances, Timing of income/expenses. We do NOT help with aggressive avoidance schemes. All our advice is fully compliant with HMRC rules.", sortOrder: 45, isVisible: true },
    { boxType: "faq", title: "Do you provide tax advice on specific transactions?", description: "Scope of tax advice", content: "Our packages include general tax guidance and planning. For specific complex transactions (property purchases, business sales, restructuring, inheritance), we either: Include it if simple, Quote separately for complex work, Refer to specialist firms for very complex matters. We're always upfront about scope and costs.", sortOrder: 46, isVisible: true },
    { boxType: "faq", title: "I'm being made redundant - what are my options?", description: "Redundancy and tax implications", content: "Up to £30,000 redundancy is tax-free. Above that is taxed as income. Key decisions: Start a company? Become sole trader? Take employment? Each has different tax treatment. We can model options in a one-off consultation (£150) or include in ongoing package. Also consider: pension access, NI credits, timing of income.", sortOrder: 47, isVisible: true },
    { boxType: "faq", title: "How do dividends work?", description: "Understanding dividend tax", content: "Dividends are paid from company profits after Corporation Tax. 2024/25 tax rates: £500 tax-free allowance, then: Basic rate (income up to £50,270): 8.75%. Higher rate (£50,271-£125,140): 33.75%. Additional rate (over £125,140): 39.35%. Strategy: Pay salary up to NI threshold (£12,570), then dividends. Maximises take-home, minimises tax.", sortOrder: 48, isVisible: true },
    { boxType: "faq", title: "Can you help with Making Tax Digital?", description: "MTD compliance and requirements", content: "MTD for VAT is already in force - we handle this. MTD for Income Tax starts April 2026 for income over £50k. You'll need: Compatible software (we recommend Xero), Quarterly digital updates. We'll ensure you're compliant. Our packages include MTD submissions. If you're not on cloud software yet, we'll help you migrate.", sortOrder: 49, isVisible: true },
  ],
  documents: [
    {
      title: "Key Tax Deadlines 2024-25",
      category: "guide",
      content: `CLARITY ACCOUNTANTS - KEY DATES 2024-25

SELF ASSESSMENT (2023-24 tax year):
- 5 October 2024: Register for Self Assessment if first time
- 31 October 2024: Paper return deadline (rare now)
- 31 January 2025: Online return + first payment deadline
- 31 July 2025: Second payment on account due

CORPORATION TAX (example: 31 March year end):
- 1 January 2025: Payment due for y/e 31 March 2024
- 31 December 2024: File accounts at Companies House (y/e 31 March 2024)
- 31 March 2025: CT600 filing deadline (y/e 31 March 2024)

VAT QUARTERLY DEADLINES:
- Quarter Apr-Jun: Return + payment due 7 August
- Quarter Jul-Sep: Return + payment due 7 November
- Quarter Oct-Dec: Return + payment due 7 February
- Quarter Jan-Mar: Return + payment due 7 May

PAYE/NI:
- 22nd of each month: PAYE payment due (or 19th if by post)
- 6 July: P11D (benefits in kind) deadline
- 5 April: Tax year ends

MAKING TAX DIGITAL (upcoming):
- April 2026: MTD for Income Tax starts (income £50k+)
- April 2027: MTD for Income Tax (income £30k+)
- Quarterly digital updates will be required`
    },
    {
      title: "Limited Company vs Sole Trader Guide",
      category: "guide",
      content: `SHOULD YOU INCORPORATE? A CLARITY GUIDE

STAY SOLE TRADER IF:
- Profit under £30,000/year
- Low liability risk in your industry
- Simple business structure with no plans to grow rapidly
- You want minimal admin
- You regularly withdraw all profits
- You might make losses in early years (easier to offset)

CONSIDER INCORPORATION IF:
- Profit £30,000-£50,000 (worth modelling)
- Profit over £50,000/year (usually significant savings)
- You want liability protection
- You're seeking investment or contracts requiring Ltd
- You want to retain profits in the company
- You need multiple shareholders
- You want to bring in business partners

TAX COMPARISON (2024-25, £60,000 profit):

SOLE TRADER:
- Income Tax: ~£14,400
- National Insurance (Class 2 + 4): ~£4,400
- Total tax: ~£18,800
- Take home: ~£41,200

LIMITED COMPANY (optimal extraction):
- Corporation Tax (25%): ~£7,800
- Director salary (£12,570): £0 personal tax, £0 NI
- Dividends (~£39,630): ~£3,200 tax
- Total tax: ~£11,000
- Take home: ~£49,000
- SAVING: ~£7,800/year

HIDDEN COSTS OF LTD:
- Higher accountancy fees: ~£1,000-2,000/year more
- Filing requirements and admin
- Public accounts at Companies House
- Director responsibilities and duties

BREAK-EVEN POINT:
Usually around £35,000-£40,000 profit is where Ltd becomes worthwhile after accounting costs.

IMPORTANT: These are illustrations. Your specific situation matters.
Book a free consultation to model YOUR numbers.`
    },
    {
      title: "Onboarding Checklist",
      category: "guide",
      content: `CLARITY NEW CLIENT ONBOARDING CHECKLIST

BEFORE WE START:
□ Signed engagement letter (we'll email this)
□ Direct Debit mandate for monthly fees
□ Proof of ID (passport or driving licence)
□ Proof of address (dated within 3 months)
□ Anti-money laundering verification

WE'LL REQUEST FROM YOUR OLD ACCOUNTANT:
□ Last 2-3 years of accounts and tax returns
□ Outstanding VAT returns and records
□ Corporation Tax computations
□ Payroll records if applicable
□ Any open correspondence with HMRC
□ Accounting software backup/access

YOU'LL NEED TO PROVIDE:
□ Access to accounting software (Xero/QuickBooks)
□ Bank statements for current year (if not linked)
□ Details of any ongoing HMRC matters
□ Shareholder & director details (for Ltd)
□ UTR numbers for individuals
□ Company authentication code (for Ltd)
□ VAT registration number if applicable

WE'LL SET UP:
□ Dext account for receipt capture (free)
□ Xero/software integration and bank feeds
□ Shared Google Drive folder for documents
□ Your personalised deadline calendar
□ Communication preferences (email/phone/WhatsApp)

FIRST MONTH ACTIVITIES:
□ Review last filed accounts and returns
□ Identify any outstanding issues
□ Set up regular catch-up schedule
□ Create year plan with key dates
□ Initial tax planning review

TYPICAL TIMELINE:
Day 1-3: Paperwork signed
Day 4-14: Records received from old accountant
Day 15-21: Systems set up, onboarding video call
Day 22+: Business as usual with Clarity

Questions? Email emma@clarityaccountants.demo`
    },
    {
      title: "HMRC Penalty Guide",
      category: "guide",
      content: `HMRC PENALTIES - WHAT YOU NEED TO KNOW

SELF ASSESSMENT LATE FILING:
- 1 day late: £100 penalty (even if no tax owed)
- 3 months late: £10 per day, up to 90 days (max £900)
- 6 months late: £300 or 5% of tax due (whichever is higher)
- 12 months late: Additional £300 or 5%
- Maximum total: £1,600 + 10% of tax + interest

SELF ASSESSMENT LATE PAYMENT:
- 30 days late: 5% of tax owed
- 6 months late: Additional 5%
- 12 months late: Additional 5%
- Plus interest (currently around 7.75% annually)

CORPORATION TAX LATE FILING:
- 1 day late: £100
- 3 months late: Additional £100
- 6 months late: 10% of estimated tax
- 12 months late: Additional 10%

CORPORATION TAX LATE PAYMENT:
- Interest charged from due date
- Large companies: Quarterly instalments required
- Penalties for persistent late payment

VAT LATE FILING/PAYMENT:
- Points-based system (1 point per late return)
- 2 points threshold for annual filers
- 4 points threshold for quarterly filers
- Once threshold exceeded: £200 penalty per late return
- Points expire after 24 months of compliance

VAT ERRORS:
- Deliberate errors: 30-70% of additional tax
- Careless errors: 0-30% of additional tax
- Innocent errors: No penalty if unprompted disclosure

AVOIDING PENALTIES:
1. Set up calendar reminders (we send these)
2. Provide information to us on time
3. If you can't pay, contact HMRC to arrange payment plan
4. Never ignore HMRC letters
5. Forward everything to us immediately

WE CAN HELP:
- Appeal unreasonable penalties
- Negotiate time to pay arrangements
- Represent you in penalty disputes
- Apply for penalty mitigation`
    },
    {
      title: "IR35 Contractor Guide",
      category: "guide",
      content: `IR35 - A GUIDE FOR CONTRACTORS

WHAT IS IR35?
IR35 is tax legislation that catches contractors who would be employees if they were engaged directly rather than through their own limited company.

If you're "inside IR35": You pay tax similar to an employee
If you're "outside IR35": You can take dividends and benefit from lower tax rates

KEY FACTORS DETERMINING STATUS:

1. CONTROL
- Do they tell you how to do the work? (employee-like)
- Or just what result they want? (contractor-like)
- Can you choose your hours/location?
- Are you supervised day-to-day?

2. SUBSTITUTION
- Can you send someone else to do the work?
- Have you ever actually substituted?
- Would the client accept a substitute?
- A personal service requirement = employee-like

3. MUTUALITY OF OBLIGATION
- Must they offer you work continuously?
- Must you accept work offered?
- Are there gaps between projects?
- "Feast or famine" = contractor-like

OTHER FACTORS:
- Financial risk (using own equipment, insurance)
- Part and parcel of organisation?
- Business on own account?
- Right to work for other clients?

WHO MAKES THE DETERMINATION?

Since April 2021:
- Medium/large private sector clients make the determination
- Public sector clients make the determination
- Small private sector: You still self-assess

MEDIUM/LARGE = 2 of: £10.2m+ turnover, £5.1m+ assets, 50+ employees

IF CLIENT GETS IT WRONG:
- They're liable for unpaid tax (not you)
- But you may still face challenge from HMRC
- Get a written Status Determination Statement (SDS)
- You can dispute within 45 days

OUR IR35 SERVICE:
- £350 per contract review
- Written opinion with full reasoning
- Defence pack if challenged
- Ongoing support included

CONTACT US:
james@clarityaccountants.demo for IR35 queries`
    }
  ]
};

const TECHVAULT_UK: DemoOrbitData = {
  slug: "techvault-uk",
  name: "TechVault UK",
  sourceUrl: "https://techvault.demo",
  description: "Refurbished tech with grade transparency and buying confidence tools. Premium refurbished phones, tablets and laptops with warranty and trade-in.",
  location: "Manchester (UK-wide delivery)",
  sector: "Ecommerce",
  boxes: [
    { boxType: "business_profile", title: "About TechVault", description: "UK's trusted destination for premium refurbished tech", content: "TechVault UK has been selling refurbished technology since 2018. We've sold over 50,000 devices with a 4.8 star Trustpilot rating. Every device is tested across 72 checkpoints, professionally cleaned, and backed by our 12-month warranty. Our mission: make quality tech accessible and sustainable.", sortOrder: 0, isVisible: true },
    { boxType: "contact", title: "Contact & Support", description: "Customer service 7 days a week", content: "Phone: 0161 234 5678 (Mon-Sat 9am-6pm, Sun 10am-4pm)\nEmail: support@techvault.demo\nLive Chat: 9am-9pm daily on website\nWarehouse: Unit 4, Trafford Park, Manchester M17 1RG (no walk-ins)\nReturns: returns@techvault.demo", sortOrder: 1, isVisible: true },
    
    { boxType: "product", title: "iPhone 16 Pro Max 256GB", description: "Latest Apple flagship - Excellent condition", price: "1049", currency: "GBP", category: "iPhones", content: "Condition: Excellent (Grade A). Apple Intelligence ready. A18 Pro chip. Camera Control button. Battery health 95%+. 12-month warranty.", tags: [{ key: "grade", value: "excellent", label: "Grade A" }, { key: "storage", value: "256gb", label: "256GB" }], sortOrder: 10, isVisible: true },
    { boxType: "product", title: "iPhone 16 Pro Max 256GB", description: "Great value with minor cosmetic wear", price: "949", currency: "GBP", category: "iPhones", content: "Condition: Good (Grade B). Light scratches on titanium frame. Screen perfect. Battery health 90%+. 12-month warranty.", tags: [{ key: "grade", value: "good", label: "Grade B" }, { key: "storage", value: "256gb", label: "256GB" }], sortOrder: 11, isVisible: true },
    { boxType: "product", title: "iPhone 15 Pro Max 256GB", description: "Previous gen flagship - excellent value", price: "799", currency: "GBP", category: "iPhones", content: "Condition: Excellent (Grade A). A17 Pro chip. USB-C. Battery health 90%+. 12-month warranty. All colours available.", tags: [{ key: "grade", value: "excellent", label: "Grade A" }, { key: "storage", value: "256gb", label: "256GB" }], sortOrder: 12, isVisible: true },
    { boxType: "product", title: "iPhone 15 Pro Max 256GB", description: "Great value with minor wear", price: "699", currency: "GBP", category: "iPhones", content: "Condition: Good (Grade B). Light scratches on frame. Screen perfect. Battery health 85%+. 12-month warranty.", tags: [{ key: "grade", value: "good", label: "Grade B" }, { key: "storage", value: "256gb", label: "256GB" }], sortOrder: 13, isVisible: true },
    { boxType: "product", title: "iPhone 15 Pro 128GB", description: "Compact Pro with great specs", price: "649", currency: "GBP", category: "iPhones", content: "Condition: Excellent (Grade A). 6.1\" display. Battery health 88%+. All colours available. 12-month warranty.", tags: [{ key: "grade", value: "excellent", label: "Grade A" }, { key: "storage", value: "128gb", label: "128GB" }], sortOrder: 14, isVisible: true },
    { boxType: "product", title: "iPhone 14 Pro 128GB", description: "Dynamic Island iPhone at great price", price: "549", currency: "GBP", category: "iPhones", content: "Condition: Excellent (Grade A). A16 Bionic. 48MP camera. Battery health 88%+. 12-month warranty.", tags: [{ key: "grade", value: "excellent", label: "Grade A" }, { key: "storage", value: "128gb", label: "128GB" }], sortOrder: 15, isVisible: true },
    { boxType: "product", title: "iPhone 14 128GB", description: "Reliable modern iPhone", price: "429", currency: "GBP", category: "iPhones", content: "Condition: Good (Grade B). A15 chip. All-day battery. Minor wear. 12-month warranty.", tags: [{ key: "grade", value: "good", label: "Grade B" }, { key: "storage", value: "128gb", label: "128GB" }], sortOrder: 16, isVisible: true },
    { boxType: "product", title: "iPhone 13 128GB", description: "Best-selling value iPhone", price: "349", currency: "GBP", category: "iPhones", content: "Condition: Good (Grade B). A15 Bionic. Great camera. Battery health 82%+. Our best seller. 12-month warranty.", tags: [{ key: "grade", value: "good", label: "Grade B" }, { key: "storage", value: "128gb", label: "128GB" }], sortOrder: 17, isVisible: true },
    { boxType: "product", title: "iPhone 13 128GB", description: "Budget option with visible wear", price: "279", currency: "GBP", category: "iPhones", content: "Condition: Fair (Grade C). Visible scratches on frame. Screen may have light marks. Battery 78%+. Fully functional. 12-month warranty.", tags: [{ key: "grade", value: "fair", label: "Grade C" }, { key: "storage", value: "128gb", label: "128GB" }], sortOrder: 18, isVisible: true },
    { boxType: "product", title: "iPhone 12 64GB", description: "Entry-level iPhone with 5G", price: "229", currency: "GBP", category: "iPhones", content: "Condition: Good (Grade B). First iPhone with 5G. A14 chip. Battery 80%+. Great for light users. 12-month warranty.", tags: [{ key: "grade", value: "good", label: "Grade B" }, { key: "storage", value: "64gb", label: "64GB" }], sortOrder: 19, isVisible: true },
    { boxType: "product", title: "iPhone SE (2022) 64GB", description: "Compact and affordable", price: "199", currency: "GBP", category: "iPhones", content: "Condition: Good (Grade B). A15 chip in classic design. Touch ID. 4.7\" display. 12-month warranty.", tags: [{ key: "grade", value: "good", label: "Grade B" }, { key: "storage", value: "64gb", label: "64GB" }], sortOrder: 20, isVisible: true },
    
    { boxType: "product", title: "Samsung Galaxy S24 Ultra 256GB", description: "Samsung's best with S Pen", price: "849", currency: "GBP", category: "Android Phones", content: "Condition: Excellent (Grade A). Galaxy AI features. Titanium frame. Includes S Pen. 12-month warranty.", tags: [{ key: "grade", value: "excellent", label: "Grade A" }], sortOrder: 25, isVisible: true },
    { boxType: "product", title: "Samsung Galaxy S24 256GB", description: "Compact flagship Android", price: "549", currency: "GBP", category: "Android Phones", content: "Condition: Excellent (Grade A). AI features. 6.2\" display. 7 years updates. 12-month warranty.", tags: [{ key: "grade", value: "excellent", label: "Grade A" }], sortOrder: 26, isVisible: true },
    { boxType: "product", title: "Samsung Galaxy S23 Ultra 256GB", description: "Previous gen flagship", price: "649", currency: "GBP", category: "Android Phones", content: "Condition: Good (Grade B). 200MP camera. S Pen included. Light wear. 12-month warranty.", tags: [{ key: "grade", value: "good", label: "Grade B" }], sortOrder: 27, isVisible: true },
    { boxType: "product", title: "Samsung Galaxy S23 256GB", description: "Great value Samsung flagship", price: "399", currency: "GBP", category: "Android Phones", content: "Condition: Good (Grade B). Compact design. Fast charging. Light wear on frame. 12-month warranty.", tags: [{ key: "grade", value: "good", label: "Grade B" }], sortOrder: 28, isVisible: true },
    { boxType: "product", title: "Samsung Galaxy Z Flip 5 256GB", description: "Foldable phone with style", price: "599", currency: "GBP", category: "Android Phones", content: "Condition: Excellent (Grade A). Large cover screen. No crease visible. Flex mode. 12-month warranty.", tags: [{ key: "grade", value: "excellent", label: "Grade A" }], sortOrder: 29, isVisible: true },
    { boxType: "product", title: "Google Pixel 8 Pro 128GB", description: "Best Android camera", price: "549", currency: "GBP", category: "Android Phones", content: "Condition: Excellent (Grade A). Google Tensor G3. 7 years updates. AI photo features. 12-month warranty.", tags: [{ key: "grade", value: "excellent", label: "Grade A" }], sortOrder: 30, isVisible: true },
    { boxType: "product", title: "Google Pixel 8 128GB", description: "Compact Pixel experience", price: "399", currency: "GBP", category: "Android Phones", content: "Condition: Excellent (Grade A). 6.2\" display. Great camera. Long support. 12-month warranty.", tags: [{ key: "grade", value: "excellent", label: "Grade A" }], sortOrder: 31, isVisible: true },
    { boxType: "product", title: "Google Pixel 7a 128GB", description: "Best budget Android", price: "249", currency: "GBP", category: "Android Phones", content: "Condition: Good (Grade B). Flagship camera on budget phone. 5 years updates. 12-month warranty.", tags: [{ key: "grade", value: "good", label: "Grade B" }], sortOrder: 32, isVisible: true },
    
    { boxType: "product", title: "iPad Pro 13\" M4 256GB WiFi", description: "Thinnest iPad ever with M4 chip", price: "999", currency: "GBP", category: "Tablets", content: "Condition: Excellent (Grade A). OLED display. Apple Pencil Pro compatible. 12-month warranty.", tags: [{ key: "grade", value: "excellent", label: "Grade A" }], sortOrder: 35, isVisible: true },
    { boxType: "product", title: "iPad Pro 12.9\" M2 256GB WiFi", description: "Professional tablet with M2 chip", price: "749", currency: "GBP", category: "Tablets", content: "Condition: Excellent (Grade A). Mini LED display. ProMotion. 12-month warranty.", tags: [{ key: "grade", value: "excellent", label: "Grade A" }], sortOrder: 36, isVisible: true },
    { boxType: "product", title: "iPad Air 11\" M2 128GB WiFi", description: "Powerful and portable", price: "499", currency: "GBP", category: "Tablets", content: "Condition: Excellent (Grade A). M2 chip. Apple Pencil Pro compatible. Landscape camera. 12-month warranty.", tags: [{ key: "grade", value: "excellent", label: "Grade A" }], sortOrder: 37, isVisible: true },
    { boxType: "product", title: "iPad 10th Gen 64GB WiFi", description: "Great all-rounder iPad", price: "299", currency: "GBP", category: "Tablets", content: "Condition: Good (Grade B). USB-C charging. 10.9\" display. Minor marks on casing. 12-month warranty.", tags: [{ key: "grade", value: "good", label: "Grade B" }], sortOrder: 38, isVisible: true },
    { boxType: "product", title: "iPad 9th Gen 64GB WiFi", description: "Budget iPad with Home button", price: "199", currency: "GBP", category: "Tablets", content: "Condition: Good (Grade B). Touch ID. Lightning connector. Still gets updates. 12-month warranty.", tags: [{ key: "grade", value: "good", label: "Grade B" }], sortOrder: 39, isVisible: true },
    { boxType: "product", title: "Samsung Galaxy Tab S9+ 256GB", description: "Android tablet alternative", price: "549", currency: "GBP", category: "Tablets", content: "Condition: Excellent (Grade A). 12.4\" AMOLED. S Pen included. DeX mode. 12-month warranty.", tags: [{ key: "grade", value: "excellent", label: "Grade A" }], sortOrder: 40, isVisible: true },
    
    { boxType: "product", title: "MacBook Air 15\" M3 256GB", description: "Largest MacBook Air with M3", price: "1049", currency: "GBP", category: "Laptops", content: "Condition: Excellent (Grade A). 15.3\" display. M3 chip. 18-hour battery. Cycle count under 30. 12-month warranty.", tags: [{ key: "grade", value: "excellent", label: "Grade A" }], sortOrder: 45, isVisible: true },
    { boxType: "product", title: "MacBook Air 13\" M3 256GB", description: "Latest MacBook Air", price: "899", currency: "GBP", category: "Laptops", content: "Condition: Excellent (Grade A). M3 chip. All-day battery. Multiple colours. Cycle count under 40. 12-month warranty.", tags: [{ key: "grade", value: "excellent", label: "Grade A" }], sortOrder: 46, isVisible: true },
    { boxType: "product", title: "MacBook Air 13\" M2 256GB", description: "Ultra-thin, all-day battery", price: "749", currency: "GBP", category: "Laptops", content: "Condition: Excellent (Grade A). M2 chip. Fanless design. Cycle count under 50. 12-month warranty.", tags: [{ key: "grade", value: "excellent", label: "Grade A" }], sortOrder: 47, isVisible: true },
    { boxType: "product", title: "MacBook Air 13\" M2 256GB", description: "M2 Air with light wear", price: "649", currency: "GBP", category: "Laptops", content: "Condition: Good (Grade B). Minor marks on casing. Screen perfect. Cycle count under 100. 12-month warranty.", tags: [{ key: "grade", value: "good", label: "Grade B" }], sortOrder: 48, isVisible: true },
    { boxType: "product", title: "MacBook Air 13\" M1 256GB", description: "Great value Apple Silicon", price: "549", currency: "GBP", category: "Laptops", content: "Condition: Good (Grade B). Original M1 chip. Still fast. Cycle count under 150. 12-month warranty.", tags: [{ key: "grade", value: "good", label: "Grade B" }], sortOrder: 49, isVisible: true },
    { boxType: "product", title: "MacBook Pro 14\" M3 Pro 512GB", description: "Pro performance for creatives", price: "1599", currency: "GBP", category: "Laptops", content: "Condition: Excellent (Grade A). M3 Pro chip. ProMotion display. Low cycle count. 12-month warranty.", tags: [{ key: "grade", value: "excellent", label: "Grade A" }], sortOrder: 50, isVisible: true },
    { boxType: "product", title: "MacBook Pro 14\" M3 512GB", description: "Pro features, base M3 chip", price: "1299", currency: "GBP", category: "Laptops", content: "Condition: Excellent (Grade A). Base M3 chip. Still very powerful. ProMotion. 12-month warranty.", tags: [{ key: "grade", value: "excellent", label: "Grade A" }], sortOrder: 51, isVisible: true },
    { boxType: "product", title: "MacBook Pro 14\" M2 Pro 512GB", description: "Previous gen pro laptop", price: "1199", currency: "GBP", category: "Laptops", content: "Condition: Good (Grade B). M2 Pro chip. Light wear. Cycle count under 80. 12-month warranty.", tags: [{ key: "grade", value: "good", label: "Grade B" }], sortOrder: 52, isVisible: true },
    
    { boxType: "product", title: "Apple Watch Ultra 2 49mm", description: "Adventure-ready smartwatch", price: "599", currency: "GBP", category: "Wearables", content: "Condition: Excellent (Grade A). Titanium case. GPS + Cellular. 36-hour battery. 12-month warranty.", tags: [{ key: "grade", value: "excellent", label: "Grade A" }], sortOrder: 55, isVisible: true },
    { boxType: "product", title: "Apple Watch Series 9 45mm GPS", description: "Latest Apple Watch", price: "329", currency: "GBP", category: "Wearables", content: "Condition: Excellent (Grade A). Double tap gesture. S9 chip. Multiple colours. 12-month warranty.", tags: [{ key: "grade", value: "excellent", label: "Grade A" }], sortOrder: 56, isVisible: true },
    { boxType: "product", title: "Apple Watch SE (2nd Gen) 44mm", description: "Apple Watch essentials", price: "179", currency: "GBP", category: "Wearables", content: "Condition: Good (Grade B). Core health features. Crash detection. Great value. 12-month warranty.", tags: [{ key: "grade", value: "good", label: "Grade B" }], sortOrder: 57, isVisible: true },
    { boxType: "product", title: "AirPods Pro 2nd Gen USB-C", description: "Premium noise cancelling", price: "169", currency: "GBP", category: "Audio", content: "Condition: Excellent (Grade A). USB-C case. Active noise cancellation. 6-hour battery. 12-month warranty.", tags: [{ key: "grade", value: "excellent", label: "Grade A" }], sortOrder: 58, isVisible: true },
    { boxType: "product", title: "AirPods 3rd Gen", description: "Spatial audio without ANC", price: "119", currency: "GBP", category: "Audio", content: "Condition: Good (Grade B). Spatial audio. MagSafe case. 6-hour battery. 12-month warranty.", tags: [{ key: "grade", value: "good", label: "Grade B" }], sortOrder: 59, isVisible: true },
    
    { boxType: "faq", title: "What do your grades mean?", description: "Our grading system explained", content: "EXCELLENT (Grade A): Near-perfect cosmetically. Screen flawless. Very light wear only visible under bright light. Battery 88%+. Looks almost new.\n\nGOOD (Grade B): Light scratches on frame/back. Screen perfect or very light marks. Normal signs of use. Battery 80%+. Fully functional.\n\nFAIR (Grade C): Visible scratches and wear. May have deeper marks. Screen may have light scratches (not cracks). Battery 75%+. All functions work perfectly.\n\nAll grades include 12-month warranty and 30-day returns.", sortOrder: 70, isVisible: true },
    
    { boxType: "faq", title: "iPhone 16 vs iPhone 15 - which should I buy?", description: "Flagship comparison", content: "iPHONE 15 PRO MAX (from £699 Good): A17 Pro chip, 48MP camera, USB-C, Action Button. Excellent everyday performance.\n\niPHONE 16 PRO MAX (from £949 Good): A18 Pro chip (20% faster), Camera Control button, bigger battery, Apple Intelligence AI features.\n\nOUR VERDICT: Most users won't notice the A18 speed boost. If you want AI features, go 16. For best value, iPhone 15 Pro Max at £100-150 less is the smarter buy.", sortOrder: 71, isVisible: true },
    { boxType: "faq", title: "iPhone 15 vs iPhone 14 comparison", description: "Mid-range iPhone decision", content: "iPHONE 14 PRO (from £549): A16 chip, Dynamic Island, 48MP camera. Still excellent.\n\niPHONE 15 (from £479): A16 chip (same as 14 Pro!), USB-C, 48MP camera. Great value.\n\niPHONE 15 PRO (from £649): A17 Pro, lighter titanium, Action Button.\n\nOUR VERDICT: iPhone 15 non-Pro offers 14 Pro specs at lower price. The 15 Pro is worth it only if you want the lightest build and Action Button.", sortOrder: 72, isVisible: true },
    { boxType: "faq", title: "iPhone vs Samsung - which ecosystem?", description: "Platform comparison", content: "CHOOSE iPHONE IF: You have other Apple devices (Mac, iPad, AirPods), want longest software support (5-6 years), prefer simplicity, want best resale value.\n\nCHOOSE SAMSUNG IF: You want more customisation, prefer USB-C (though iPhone now has it), like larger screens, want S Pen (Ultra models), use Google services heavily.\n\nVALUE TIP: iPhones hold value better. A 2-year-old iPhone retains more value than a 2-year-old Samsung.", sortOrder: 73, isVisible: true },
    { boxType: "faq", title: "Google Pixel vs iPhone camera comparison", description: "Camera phone showdown", content: "PIXEL 8 PRO (from £549): Best computational photography, Magic Eraser, Best Take, excellent night mode, 7 years updates.\n\niPHONE 15 PRO (from £649): 48MP main, excellent video (ProRes), great Portrait mode, better telephoto zoom.\n\nOUR VERDICT: Pixel for photography purists and Google AI features. iPhone for video, FaceTime, and Apple ecosystem.", sortOrder: 74, isVisible: true },
    { boxType: "faq", title: "MacBook Air M1 vs M2 vs M3 comparison", description: "Which MacBook Air?", content: "M1 (from £549 Good): Original Apple Silicon. Still fast for most tasks. 8GB RAM standard.\n\nM2 (from £649 Good): 20% faster, new thinner design, better display, MagSafe charging.\n\nM3 (from £899 Excellent): Latest chip, Wi-Fi 6E, better gaming support, can drive 2 external monitors with lid closed.\n\nOUR VERDICT: M1 is excellent value for basic use. M2 for best design/price balance. M3 only if you need latest features.", sortOrder: 75, isVisible: true },
    { boxType: "faq", title: "iPad vs iPad Air vs iPad Pro", description: "Which iPad for you?", content: "iPAD 10TH GEN (from £299): Great for media, browsing, basic productivity. USB-C. Apple Pencil 1 support.\n\niPAD AIR M2 (from £499): M2 power, Pencil Pro support, good for creative work. Best value for power users.\n\niPAD PRO M4 (from £999): OLED display, thinnest ever, most powerful. For professionals.\n\nOUR VERDICT: Most people should get iPad Air. Only get Pro if you need the absolute best display/performance.", sortOrder: 76, isVisible: true },
    { boxType: "faq", title: "Samsung Galaxy S24 vs S23 comparison", description: "Samsung flagship decision", content: "GALAXY S23 (from £399 Good): Snapdragon 8 Gen 2, excellent camera, 4 years updates remaining.\n\nGALAXY S24 (from £549 Excellent): Snapdragon 8 Gen 3, Galaxy AI features, 7 years updates, brighter display.\n\nOUR VERDICT: S24's AI features (Live Translate, Circle to Search) are genuinely useful. Worth the extra £150 for the longer support and AI.", sortOrder: 77, isVisible: true },
    { boxType: "faq", title: "Folding phones - worth it?", description: "Galaxy Z Flip and Fold assessment", content: "GALAXY Z FLIP 5 (from £599): Compact when folded, large cover screen, stylish. Light daily use only.\n\nGALAXY Z FOLD 5 (from £999): Tablet when open, phone when closed. Best for multitaskers.\n\nCONCERNS: Crease is visible, slightly heavier, higher repair costs if damaged.\n\nOUR VERDICT: Z Flip for style-conscious users who want something different. Z Fold only if you genuinely need tablet functionality on the go.", sortOrder: 78, isVisible: true },
    
    { boxType: "faq", title: "What does battery health mean?", description: "Understanding battery degradation", content: "Battery health (or maximum capacity) shows how much charge your battery holds compared to when new.\n\n100%: Brand new\n90%+: Excellent - like new performance\n85-89%: Very good - minimal impact\n80-84%: Good - noticeable on heavy days\n75-79%: Fair - may need charging by evening\nBelow 75%: Consider battery replacement\n\nApple considers 80% after 500 cycles to be normal. We grade batteries relative to device age. All our phones have minimum 75%+ health. Most Grade A phones have 88%+.", sortOrder: 80, isVisible: true },
    { boxType: "faq", title: "Can I check battery health before buying?", description: "Battery transparency", content: "Yes! Every listing shows the actual battery health percentage, not just a range. We test and record this for every device.\n\nOn product pages you'll see: \"Battery health: 92%\"\n\niPhone: We use Apple's built-in diagnostics\nSamsung: We use Samsung Members app diagnostics\nMacBook: We check cycle count and health in System Information\n\nIf you receive a device with lower health than listed, contact us for free replacement.", sortOrder: 81, isVisible: true },
    { boxType: "faq", title: "How long will a refurbished phone last?", description: "Lifespan expectations", content: "Our devices should last as long as new ones. Here's what determines lifespan:\n\nSOFTWARE SUPPORT:\niPhone: 5-6 years from release (iOS updates)\nSamsung: 4-7 years (newer models get longer)\nPixel: 7 years (best Android support)\n\nPHYSICAL LIFESPAN:\nWith our warranty and your care, 4-5+ years easily.\n\nEXAMPLE: iPhone 13 (2021) will likely receive iOS updates until 2027, making it useful until 2028+.\n\nTIP: Buying 1-2 year old flagships gives best value-to-lifespan ratio.", sortOrder: 82, isVisible: true },
    { boxType: "faq", title: "What's your returns policy?", description: "30-day returns explained", content: "30-DAY MONEY BACK GUARANTEE:\n- Return any device within 30 days for full refund\n- Device must be in same condition as received\n- Include all accessories we sent\n- We pay return postage if device is faulty\n- You pay return postage if change of mind (~£5)\n\nHOW TO RETURN:\n1. Email returns@techvault.demo with order number\n2. We send returns label within 24 hours\n3. Pack securely, drop at post office\n4. Refund within 3 working days of receipt\n\nNOTE: For hygiene reasons, AirPods/earbuds can only be returned if unopened or faulty.", sortOrder: 83, isVisible: true },
    { boxType: "faq", title: "What does your warranty cover?", description: "12-month warranty details", content: "12-MONTH WARRANTY COVERS:\n- Battery failure below 70% (we'll replace)\n- Screen defects (dead pixels, backlight issues)\n- Button/port failures\n- Speaker/microphone problems\n- Connectivity issues (WiFi, Bluetooth, cellular)\n- Any manufacturing defects\n\nNOT COVERED:\n- Accidental damage (drops, water, cracks)\n- Cosmetic wear after purchase\n- Theft or loss\n- Jailbreaking/rooting issues\n\nClaims are easy: Email us, we'll arrange collection and repair/replacement within 7 days.", sortOrder: 84, isVisible: true },
    { boxType: "faq", title: "Can I trade in my old device?", description: "Trade-in process and values", content: "TRADE-IN PROCESS:\n1. Get instant quote at techvault.demo/trade-in\n2. Accept quote (valid 14 days)\n3. We send FREE prepaid postage label\n4. Ship device to us\n5. We inspect and pay within 24 hours\n\nSAMPLE VALUES (working, Good condition):\niPhone 15 Pro Max: £450-550\niPhone 14 Pro: £300-400\niPhone 13: £180-250\nSamsung S24 Ultra: £400-500\nMacBook Air M2: £500-600\n\nBOOST VALUE: +5% for original box, +5% for accessories, +10% if factory reset done.", sortOrder: 85, isVisible: true },
    { boxType: "faq", title: "My trade-in device has a cracked screen", description: "Damaged device trade-in", content: "We still buy devices with damage! Values are reduced but we'll always give you something.\n\nCRACKED SCREEN: Typically 30-50% of working value\nWATER DAMAGE: 20-40% of working value (if still powers on)\nBROKEN BUTTONS: 60-80% of working value\nDEAD/WON'T TURN ON: We may still offer £20-50 for parts\n\nWE CANNOT ACCEPT:\niCloud locked devices (Find My must be off)\nBlacklisted/blocked phones (check with your network)\n\nBe honest in your condition assessment - if device is worse than described, we'll offer revised quote.", sortOrder: 86, isVisible: true },
    { boxType: "faq", title: "Do you offer finance/buy now pay later?", description: "Payment options", content: "YES! Klarna available for orders over £99:\n\nPAY IN 3: Split into 3 interest-free payments over 60 days\nPAY IN 30: Try before you buy, pay within 30 days\nFINANCE: 6-36 months for larger purchases (interest applies)\n\nEXAMPLE: MacBook Air M2 (£749)\n- 3 payments of £249.67\n- No interest, no fees if paid on time\n\nApproval in seconds at checkout. Must be 18+ and UK resident. Subject to status.", sortOrder: 87, isVisible: true },
    { boxType: "faq", title: "Is this device unlocked?", description: "Network compatibility", content: "ALL our phones are UNLOCKED and work with ANY UK network including:\n- EE, Three, Vodafone, O2\n- Giffgaff, Tesco Mobile, Virgin\n- Sky, iD, Voxi, Smarty\n- Any other UK network or MVNO\n\nJust insert your SIM (or eSIM) and go. No unlocking needed.\n\nINTERNATIONAL: Our phones work worldwide on compatible networks. Check band compatibility for your destination.\n\n5G: All 5G phones support UK 5G bands. 5G availability depends on your network.", sortOrder: 88, isVisible: true },
    { boxType: "faq", title: "Delivery times and options", description: "Shipping information", content: "STANDARD DELIVERY: Free over £50, otherwise £3.99\n- 2-3 working days\n- Royal Mail Tracked 48\n\nEXPRESS DELIVERY: £6.99\n- Next working day (order by 2pm Mon-Fri)\n- DPD 1-hour delivery window with notifications\n\nSATURDAY DELIVERY: £9.99\n- Order by 2pm Friday\n\nAll orders ship from Manchester. Tracking for every order. Signature required for items over £200.\n\nINTERNATIONAL: We ship to EU (£12.99, 5-7 days). Other countries please email for quote.", sortOrder: 89, isVisible: true },
    { boxType: "faq", title: "What are my rights under Consumer Rights Act?", description: "Legal consumer protection", content: "Under the Consumer Rights Act 2015, you have legal rights in addition to our warranty:\n\n30 DAYS: Full refund if faulty (you don't have to accept repair)\n6 MONTHS: Retailer must prove it wasn't faulty at purchase\n6 MONTHS - 6 YEARS: You may need to prove fault was inherent\n\nREFURBISHED GOODS: Same rights as new - goods must be of satisfactory quality, fit for purpose, and as described.\n\nOUR APPROACH: We exceed legal minimums. We'll always try to make things right without you needing to quote legislation.", sortOrder: 90, isVisible: true },
  ],
  documents: [
    {
      title: "Complete Grading Guide",
      category: "guide",
      content: `TECHVAULT UK GRADING SYSTEM

EXCELLENT (Grade A) - Premium Condition
Visual: Near-perfect. Very light wear only visible under direct light.
Screen: Flawless, no scratches or marks whatsoever.
Battery: 88%+ health for phones, under 100 cycles for MacBooks.
Functional: All features tested and working perfectly.
Packaging: Device, cable, and quick start guide included.
Price: Typically 20-30% below new RRP.
Best for: Those wanting near-new experience at a discount.

GOOD (Grade B) - Light Wear
Visual: Light scratches on frame/back. Minor signs of previous use.
Screen: Perfect or very faint marks that don't affect display quality.
Battery: 80%+ health for phones.
Functional: All features tested and working perfectly.
Packaging: Device and cable included.
Price: Typically 35-45% below new RRP.
Best for: Best value for most users. Our most popular grade.

FAIR (Grade C) - Visible Wear
Visual: Visible scratches, scuffs, may have deeper marks or small dents.
Screen: May have light scratches (never cracks or dead pixels).
Battery: 75%+ health for phones.
Functional: All features tested and working perfectly.
Packaging: Device and cable included.
Price: Typically 50-60% below new RRP.
Best for: Budget-conscious buyers, kids' first phone, backup devices.

ALL GRADES INCLUDE:
✓ 72-point functionality test covering all hardware
✓ Professional cleaning and sanitisation
✓ 12-month TechVault warranty (same as new)
✓ 30-day money-back guarantee
✓ UK plug and charging cable
✓ Free standard delivery on orders over £50

BATTERY HEALTH GUIDE (iPhones):
100%: Brand new battery
95%+: Like new
90-94%: Excellent - typical Grade A
85-89%: Very good
80-84%: Good - typical Grade B  
75-79%: Fair - typical Grade C

We test every battery individually - the exact percentage is shown on product listings.`
    },
    {
      title: "Warranty & Returns Policies",
      category: "policies",
      content: `TECHVAULT UK WARRANTY & RETURNS

12-MONTH WARRANTY COVERAGE:

WHAT'S COVERED:
- Battery health drops below 70% capacity
- Screen defects (dead pixels, backlight issues, touch responsiveness)
- Button failures (power, volume, home, action button)
- Port issues (charging, headphone jack)
- Speaker or microphone problems
- Connectivity faults (WiFi, Bluetooth, cellular, GPS)
- Camera malfunctions
- Any manufacturing defect
- Software issues caused by hardware failure

WHAT'S NOT COVERED:
- Accidental damage (drops, water, cracks, chips)
- Cosmetic wear occurring after purchase
- Theft or loss
- Damage from unauthorised repair
- Software issues from jailbreaking/rooting
- Accessories (cases, chargers, earbuds)
- Consumable items

HOW TO CLAIM:
1. Email support@techvault.demo describing the issue
2. Include photos/video if possible
3. We'll try remote diagnosis first
4. If warranty repair needed, we send prepaid collection label
5. Device repaired or replaced within 7 working days
6. Device returned to you free of charge

REPLACEMENT DEVICES:
If we can't repair your device, we'll replace with same model/grade or better. If exact model unavailable, we'll offer equivalent or refund options.

---

30-DAY RETURNS POLICY:

CHANGE OF MIND RETURNS:
- Return within 30 days for full refund
- Device must be in same condition as delivered
- Include all accessories we provided
- You pay return postage (~£5 for phones)
- Refund processed within 3 working days of receipt

FAULTY DEVICE RETURNS:
- We pay all return postage costs
- Full refund including original delivery cost
- Fast-track processing (aim for same day)

HOW TO RETURN:
1. Email returns@techvault.demo with order number
2. State whether faulty or change of mind
3. We email prepaid returns label within 24 hours
4. Pack device securely (use original packaging if possible)
5. Drop at any Post Office
6. Keep proof of postage
7. Refund within 3 working days of receipt

EXCLUSIONS:
- AirPods/earbuds: Hygiene sealed - cannot return if opened (unless faulty)
- Custom orders: Contact us to discuss

---

TECHVAULT CARE+ (Optional Damage Protection):

Cost: £4.99/month
Coverage: Accidental damage (drops, water, cracked screens)
Excess: £29 per claim
Claims: Up to 2 per year
Cancel: Anytime
Sign up: Add at checkout or email support

Worth it for: Clumsy users, outdoor workers, families with kids.`
    },
    {
      title: "Complete Trade-In Guide",
      category: "guide",
      content: `HOW TRADE-IN WORKS AT TECHVAULT UK

STEP 1: GET YOUR QUOTE
- Visit techvault.demo/trade-in
- Select your device make and model
- Answer condition questions honestly:
  * Does it power on?
  * Is the screen cracked or damaged?
  * Are all buttons working?
  * Is Find My/iCloud disabled?
- Get instant quote (valid for 14 days)

STEP 2: ACCEPT & SHIP
- Accept quote online
- We email FREE prepaid Royal Mail label (2nd Class Signed For)
- Remove SIM card and any cases/accessories
- Factory reset device and sign out of all accounts
- Pack securely (bubble wrap recommended)
- Drop at any Post Office - keep proof of postage

STEP 3: INSPECTION & PAYMENT
- We receive and inspect within 24 hours
- If matches your description: Payment same day via bank transfer or PayPal
- If condition differs: We'll offer revised quote
- You have 14 days to accept revised quote or request device return (we pay postage)

---

CONDITION REQUIREMENTS:

WORKING:
- Device powers on and functions normally
- Screen not cracked (minor scratches OK)
- All buttons work
- Holds charge
- No water damage indicators triggered

DAMAGED (reduced value):
- Cracked screen (still buy at 30-50% reduction)
- Button issues (60-80% of working value)
- Battery issues (50-70% of working value)
- Water damage but powers on (20-40%)

CANNOT ACCEPT:
- iCloud locked / Find My iPhone enabled
- Blacklisted/blocked by network (check imei.info)
- Stolen devices (we check databases)
- Devices reported lost to insurance

---

CURRENT TRADE-IN VALUES (Good/Working condition):

iPHONES:
iPhone 16 Pro Max: £650-750
iPhone 16 Pro: £550-650
iPhone 15 Pro Max: £450-550
iPhone 15 Pro: £380-480
iPhone 15: £300-380
iPhone 14 Pro: £300-400
iPhone 14: £200-280
iPhone 13 Pro: £220-300
iPhone 13: £150-220
iPhone 12: £100-150
iPhone SE (2022): £80-120

SAMSUNG:
Galaxy S24 Ultra: £480-580
Galaxy S24: £300-380
Galaxy S23 Ultra: £350-450
Galaxy S23: £200-280
Galaxy Z Fold 5: £600-750
Galaxy Z Flip 5: £300-400

iPADS:
iPad Pro 12.9 M2: £450-550
iPad Pro 11 M2: £350-450
iPad Air 5: £280-350
iPad 10th Gen: £180-240
iPad 9th Gen: £120-180

MACBOOKS:
MacBook Pro 14 M3 Pro: £1200-1400
MacBook Pro 14 M3: £1000-1200
MacBook Pro 14 M2 Pro: £900-1100
MacBook Air M3: £650-750
MacBook Air M2: £500-600
MacBook Air M1: £400-500

BOOST YOUR VALUE:
+5%: Include original box
+5%: Include original charger and cable
+10%: Factory reset completed before shipping

---

USING TRADE-IN VALUE:

Option 1: Bank Transfer / PayPal
- Receive full cash value
- Payment within 24 hours of inspection

Option 2: TechVault Credit (+10% bonus)
- Trade-in value boosted by 10%
- Use towards any purchase
- Never expires

Option 3: Upgrade
- Apply trade-in directly to new purchase
- Pay the difference only`
    },
    {
      title: "Device Comparison Guide",
      category: "guide",
      content: `TECHVAULT DEVICE COMPARISON GUIDE

=== iPHONE COMPARISONS ===

iPHONE 16 PRO vs 15 PRO:
16 Pro (from £899): A18 Pro, Camera Control, 48MP ultra-wide, bigger battery, Apple Intelligence
15 Pro (from £649): A17 Pro, Action Button, excellent camera
VERDICT: 15 Pro is better value unless you specifically want AI features

iPHONE 15 vs 14:
15 (from £429): USB-C, 48MP camera, Dynamic Island, A16 chip
14 (from £379): Lightning, 12MP camera, notch, A15 chip
VERDICT: iPhone 15's USB-C and 48MP camera worth the extra £50

iPHONE 13 vs 12:
13 (from £279): Longer battery, better camera, A15 chip, Cinematic mode
12 (from £199): First 5G iPhone, A14 chip, still gets updates
VERDICT: iPhone 13 has noticeably better battery - worth it

=== ANDROID COMPARISONS ===

SAMSUNG S24 ULTRA vs PIXEL 8 PRO:
S24 Ultra (from £849): S Pen, 200MP, Galaxy AI, 7 years updates
Pixel 8 Pro (from £549): Best point-and-shoot camera, pure Android, 7 years updates
VERDICT: Pixel for photography purists, Samsung for power users

SAMSUNG S24 vs iPHONE 15:
S24 (from £549): Bigger screen, more customisation, USB-C, AI features
iPhone 15 (from £429): Better video, longer support, better resale
VERDICT: Depends on ecosystem preference - both excellent

=== MacBOOK COMPARISONS ===

MacBOOK AIR M3 vs M2 vs M1:
M3 (from £899): Latest chip, Wi-Fi 6E, dual external monitors possible
M2 (from £649): New thin design, MagSafe, still very fast
M1 (from £549): Original Apple Silicon, proven reliability
VERDICT: M2 is sweet spot - M1 if budget-focused, M3 only if need latest

MacBOOK AIR vs PRO:
Air: Fanless, lighter, cheaper, all-day battery
Pro: More power for video editing, better speakers, ProMotion display
VERDICT: Air for 90% of users. Pro only for heavy video/3D work

=== iPAD COMPARISONS ===

iPAD PRO M4 vs iPAD AIR M2:
Pro (from £999): OLED display, thinnest ever, Face ID, 120Hz
Air (from £499): LCD display, M2 chip, Touch ID, excellent value
VERDICT: Air for most users. Pro only if you need absolute best display

iPAD 10TH vs 9TH GEN:
10th (from £299): USB-C, new design, landscape camera
9th (from £199): Lightning, Home button, still gets updates
VERDICT: 10th Gen if you have USB-C accessories, otherwise 9th is fine

=== BATTERY LIFE RANKINGS ===

PHONES (best to good):
1. iPhone 15 Pro Max (exceptional)
2. iPhone 16 Pro Max (exceptional)
3. Samsung S24 Ultra (excellent)
4. iPhone 15 Pro (very good)
5. Google Pixel 8 Pro (very good)

LAPTOPS (hours of use):
1. MacBook Air M2/M3: 15-18 hours
2. MacBook Air M1: 14-16 hours
3. MacBook Pro 14: 14-17 hours`
    },
    {
      title: "Sustainability & Environmental Impact",
      category: "guide",
      content: `TECHVAULT'S ENVIRONMENTAL COMMITMENT

WHY REFURBISHED MATTERS:

ELECTRONIC WASTE CRISIS:
- 50 million tonnes of e-waste generated globally per year
- Only 17% is properly recycled
- Phones contain valuable materials: gold, silver, platinum, rare earths
- Average phone used only 2.5 years before replacement

ENVIRONMENTAL IMPACT OF NEW VS REFURBISHED:

NEW iPHONE:
- 70kg CO2 equivalent to manufacture
- Mining of rare materials
- International shipping from China
- Packaging materials

REFURBISHED iPHONE:
- ~5kg CO2 (local refurbishment only)
- No new mining required
- Minimal packaging
- 93% carbon reduction vs new

BY BUYING REFURBISHED:
✓ You extend device life by 2-4 years
✓ Reduce e-waste entering landfill
✓ Avoid mining for new materials
✓ Support local UK refurbishment jobs
✓ Save money while helping planet

---

OUR SUSTAINABILITY PRACTICES:

REFURBISHMENT:
- UK-based facility in Manchester
- Components reused where possible
- Responsible disposal of unrepairable parts
- Partnership with certified e-waste recyclers

PACKAGING:
- 100% recyclable cardboard boxes
- No single-use plastics
- Minimal packaging approach
- Return packaging reuse encouraged

TRADE-IN PROGRAM:
- We give every device a second life
- Non-functional devices recycled responsibly
- We pay YOU to recycle properly
- Certified destruction of data

---

THE NUMBERS (2024 Impact):

Devices sold (2nd life): 12,000+
Devices recycled responsibly: 8,000+
Estimated CO2 saved: 800 tonnes
E-waste diverted from landfill: 24 tonnes

---

YOUR IMPACT:

Buying ONE refurbished iPhone instead of new:
- Saves 65kg CO2 (equivalent to driving 160 miles)
- Prevents 1 phone from landfill
- Reduces mining demand
- Saves you £200-400

Over a 10-year period, buying refurbished for you and family:
- 10+ devices = 650kg CO2 saved
- Equivalent to a return flight London-Madrid

---

B CORP COMMITMENT:

We're working toward B Corp certification. Current initiatives:
- Carbon-neutral shipping by 2025
- Living wage employer
- Local community tech recycling events
- 1% revenue to environmental charities

Join us in extending the life of technology.`
    }
  ]
};

async function seedDemoOrbit(data: DemoOrbitData): Promise<void> {
  console.log(`\n📦 Seeding ${data.name}...`);

  let orbit = await storage.getOrbitMeta(data.slug);

  if (orbit) {
    console.log(`  ✓ Orbit exists, updating metadata...`);
    await storage.updateOrbitMeta(data.slug, {
      sourceUrl: data.sourceUrl,
      customTitle: data.name,
      customDescription: data.description,
      visibility: "public",
      generationStatus: "ready",
    });
  } else {
    console.log(`  + Creating new Orbit...`);
    orbit = await storage.createOrbitMeta({
      businessSlug: data.slug,
      sourceUrl: data.sourceUrl,
      orbitType: "standard",
      visibility: "public",
      customTitle: data.name,
      customDescription: data.description,
      generationStatus: "ready",
      planTier: "intelligence",
    });
  }

  const existingBoxes = await storage.getOrbitBoxes(data.slug, true);
  if (existingBoxes.length > 0) {
    console.log(`  - Clearing ${existingBoxes.length} existing boxes...`);
    for (const box of existingBoxes) {
      await storage.deleteOrbitBox(box.id);
    }
  }

  console.log(`  + Creating ${data.boxes.length} boxes...`);
  for (const boxData of data.boxes) {
    await storage.createOrbitBox({
      ...boxData,
      businessSlug: data.slug,
    });
  }

  const existingDocs = await storage.getOrbitDocuments(data.slug);
  if (existingDocs.length > 0) {
    console.log(`  - Clearing ${existingDocs.length} existing documents...`);
    for (const doc of existingDocs) {
      await storage.deleteOrbitDocument(doc.id);
    }
  }

  console.log(`  + Creating ${data.documents.length} knowledge documents...`);
  for (const docData of data.documents) {
    await storage.createOrbitDocument({
      businessSlug: data.slug,
      fileName: `${docData.title.toLowerCase().replace(/\s+/g, '-')}.md`,
      fileType: "md",
      fileSizeBytes: docData.content.length,
      storagePath: `/demos/${data.slug}/${docData.title.toLowerCase().replace(/\s+/g, '-')}.md`,
      title: docData.title,
      category: docData.category,
      extractedText: docData.content,
      status: "ready",
    });
  }

  console.log(`  ✅ ${data.name} seeded successfully!`);
}

export async function seedAllDemoOrbits(): Promise<void> {
  console.log("🚀 Starting Demo Orbit seeding...");
  console.log("================================\n");

  try {
    await seedDemoOrbit(SLICE_AND_STONE_PIZZA);
    await seedDemoOrbit(CLARITY_ACCOUNTANTS);
    await seedDemoOrbit(TECHVAULT_UK);

    console.log("\n================================");
    console.log("✅ All demo Orbits seeded successfully!");
    console.log("\nAccess your demos at:");
    console.log("  → /orbit/slice-and-stone-pizza");
    console.log("  → /orbit/clarity-chartered-accountants");
    console.log("  → /orbit/techvault-uk");
  } catch (error) {
    console.error("\n❌ Error seeding demo Orbits:", error);
    throw error;
  }
}

const isMainModule = import.meta.url === `file://${process.argv[1]}` || 
  process.argv[1]?.endsWith('seedDemoOrbits.ts');

if (isMainModule) {
  seedAllDemoOrbits()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
