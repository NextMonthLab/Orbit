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
    { boxType: "business_profile", title: "About Slice & Stone", description: "Family-run artisan pizzeria in Bristol since 2019. We use authentic Neapolitan techniques with locally-sourced ingredients.", content: "Slice & Stone was founded by the Romano family who brought authentic Neapolitan pizza-making traditions to Bristol. Our dough is fermented for 48 hours, and we use a wood-fired oven reaching 450°C for that perfect leopard-spotted crust. We're committed to quality - from San Marzano tomatoes to locally-sourced toppings.", sortOrder: 0, isVisible: true },
    { boxType: "opening_hours", title: "Opening Hours", description: "Tuesday-Sunday, Closed Mondays", content: "Tuesday-Thursday: 5pm-10pm, Friday-Saturday: 12pm-11pm, Sunday: 12pm-9pm, Monday: Closed", sortOrder: 1, isVisible: true },
    { boxType: "contact", title: "Contact & Location", description: "Order online or call us", content: "Phone: 0117 123 4567\nAddress: 42 Whiteladies Road, Bristol BS8 2NH\nEmail: hello@sliceandstone.demo\nOrder online: sliceandstone.demo/order", sortOrder: 2, isVisible: true },
    { boxType: "menu_item", title: "Margherita", description: "San Marzano tomatoes, fior di latte, fresh basil, EVOO", price: "12.50", currency: "GBP", category: "Classic Pizzas", tags: [{ key: "dietary", value: "vegetarian", label: "V" }], sortOrder: 10, isVisible: true },
    { boxType: "menu_item", title: "Pepperoni Picante", description: "Spicy pepperoni, tomato, mozzarella, chilli flakes", price: "14.50", currency: "GBP", category: "Classic Pizzas", tags: [{ key: "spice", value: "hot", label: "Hot" }], sortOrder: 11, isVisible: true },
    { boxType: "menu_item", title: "Quattro Formaggi", description: "Mozzarella, gorgonzola, parmesan, ricotta", price: "15.00", currency: "GBP", category: "Classic Pizzas", tags: [{ key: "dietary", value: "vegetarian", label: "V" }], sortOrder: 12, isVisible: true },
    { boxType: "menu_item", title: "Nduja & Honey", description: "Spicy nduja, mozzarella, drizzled with local honey, rocket", price: "16.00", currency: "GBP", category: "Signature Pizzas", tags: [{ key: "spice", value: "medium", label: "Med" }], sortOrder: 13, isVisible: true },
    { boxType: "menu_item", title: "Truffle Mushroom", description: "Wild mushrooms, truffle oil, parmesan, thyme", price: "17.50", currency: "GBP", category: "Signature Pizzas", tags: [{ key: "dietary", value: "vegetarian", label: "V" }], sortOrder: 14, isVisible: true },
    { boxType: "menu_item", title: "The Bristol", description: "Local chorizo, roasted peppers, red onion, rocket, balsamic glaze", price: "16.50", currency: "GBP", category: "Signature Pizzas", sortOrder: 15, isVisible: true },
    { boxType: "menu_item", title: "Vegan Garden", description: "Vegan cheese, roasted vegetables, olives, capers (VG)", price: "15.00", currency: "GBP", category: "Vegan Pizzas", tags: [{ key: "dietary", value: "vegan", label: "VG" }], sortOrder: 16, isVisible: true },
    { boxType: "menu_item", title: "Vegan BBQ Jackfruit", description: "Pulled BBQ jackfruit, vegan cheese, red onion, coriander (VG)", price: "16.00", currency: "GBP", category: "Vegan Pizzas", tags: [{ key: "dietary", value: "vegan", label: "VG" }], sortOrder: 17, isVisible: true },
    { boxType: "menu_item", title: "Garlic Dough Balls", description: "8 freshly baked dough balls with garlic butter", price: "5.50", currency: "GBP", category: "Sides", tags: [{ key: "dietary", value: "vegetarian", label: "V" }], sortOrder: 20, isVisible: true },
    { boxType: "menu_item", title: "House Salad", description: "Mixed leaves, cherry tomatoes, cucumber, balsamic dressing", price: "4.50", currency: "GBP", category: "Sides", tags: [{ key: "dietary", value: "vegan", label: "VG" }], sortOrder: 21, isVisible: true },
    { boxType: "product", title: "Tuesday 2-for-1", description: "Any two pizzas for the price of the most expensive. Collection only.", price: "0", category: "Deals", content: "Available every Tuesday. Order any two pizzas and only pay for the higher priced one. Collection from store only - not available for delivery. Cannot be combined with other offers.", sortOrder: 30, isVisible: true },
    { boxType: "product", title: "Family Feast", description: "2 large pizzas, garlic bread, salad & 1.5L drink", price: "39.99", currency: "GBP", category: "Deals", content: "Perfect for family nights. Includes any 2 large pizzas from the Classic menu, large garlic bread, house salad, and 1.5L bottle of Coca-Cola, Fanta, or Sprite.", sortOrder: 31, isVisible: true },
    { boxType: "product", title: "Lunch Special", description: "Any 10\" pizza + drink for £9.99 (12-4pm)", price: "9.99", currency: "GBP", category: "Deals", content: "Available Tuesday-Saturday 12pm-4pm. Any pizza from Classic menu in 10\" size plus any soft drink. Dine-in or collection only.", sortOrder: 32, isVisible: true },
    { boxType: "faq", title: "Do you deliver to BS8?", description: "Delivery zones and fees", content: "Yes! We deliver to BS8 and surrounding areas. Free delivery on orders over £20 to BS1, BS2, BS6, BS7, BS8. £2.50 delivery fee for orders under £20. We also deliver to BS3, BS4, BS5, BS9 for a £3.50 fee. Check our website for real-time delivery estimates.", sortOrder: 40, isVisible: true },
    { boxType: "faq", title: "What vegan options do you have?", description: "Vegan menu information", content: "We have a dedicated vegan menu including Vegan Garden and Vegan BBQ Jackfruit pizzas. We use premium vegan mozzarella alternative. Our dough is naturally vegan (flour, water, salt, yeast). Many of our sides are also vegan - just ask! We take cross-contamination seriously but cannot guarantee a 100% vegan environment.", sortOrder: 41, isVisible: true },
    { boxType: "faq", title: "What allergens are in your food?", description: "Allergen information and policies", content: "Our pizzas contain GLUTEN (wheat flour) and MILK (cheese). Specific allergens vary by pizza - please check our full allergen menu on the website or ask staff. We CAN accommodate dairy-free (vegan cheese) but we CANNOT make gluten-free pizzas as our dough is made fresh in-store. Nut allergies: some toppings may contain traces.", sortOrder: 42, isVisible: true },
    { boxType: "faq", title: "Best deal for a group of 6?", description: "Group ordering recommendations", content: "For 6 people we recommend 2x Family Feast deals (£79.98) - that gives you 4 large pizzas, 2 garlic breads, 2 salads, and 2 drinks. Alternatively, on Tuesdays use our 2-for-1 deal for collection and order 3 pairs of pizzas. For larger groups or events, call us about our catering menu.", sortOrder: 43, isVisible: true },
    { boxType: "faq", title: "How long does delivery take?", description: "Delivery times and tracking", content: "Typical delivery time is 30-45 minutes depending on your location and how busy we are. During peak times (Friday/Saturday 7-9pm) it can be up to 60 minutes. You'll receive a text with a tracking link when your order is out for delivery. Running late? Call us on 0117 123 4567.", sortOrder: 44, isVisible: true },
    { boxType: "faq", title: "Can I customize my pizza?", description: "Customization options and extra charges", content: "Absolutely! Extra toppings are £1.50-2.50 each depending on the topping. You can also request 'light cheese' or 'well done' at no extra charge. Some premium toppings like truffle oil are +£2.50. Note: heavy customization may affect cooking time.", sortOrder: 45, isVisible: true },
  ],
  documents: [
    {
      title: "Delivery Zones & Fees",
      category: "guide",
      content: `SLICE & STONE DELIVERY ZONES

FREE DELIVERY (orders £20+):
- BS1 (City Centre): 25-35 mins
- BS2 (St Pauls, Montpelier): 25-35 mins  
- BS6 (Redland, Cotham): 20-30 mins
- BS7 (Bishopston, Horfield): 25-40 mins
- BS8 (Clifton, Hotwells): 15-25 mins

£2.50 DELIVERY FEE (orders under £20 in above zones)

£3.50 DELIVERY (all orders):
- BS3 (Southville, Bedminster): 30-45 mins
- BS4 (Brislington, Knowle): 35-50 mins
- BS5 (Easton, St George): 30-45 mins
- BS9 (Westbury-on-Trym): 35-50 mins

NOT CURRENTLY SERVING:
- BS10, BS11, BS13, BS14, BS15, BS16

Peak times (Fri/Sat 7-9pm): Add 15-20 mins to estimates.
Order tracking link sent via SMS when driver departs.`
    },
    {
      title: "Full Allergen Information",
      category: "guide",
      content: `SLICE & STONE ALLERGEN GUIDE

ALL PIZZAS CONTAIN:
- GLUTEN (wheat flour in dough)
- MILK (mozzarella cheese, unless vegan option selected)

SPECIFIC ALLERGENS BY PIZZA:
- Margherita: Gluten, Milk
- Pepperoni Picante: Gluten, Milk  
- Quattro Formaggi: Gluten, Milk (multiple dairy types)
- Nduja & Honey: Gluten, Milk, may contain traces of SULPHITES
- Truffle Mushroom: Gluten, Milk
- The Bristol: Gluten, Milk, may contain SULPHITES
- Vegan Garden: Gluten (dairy-free cheese used)
- Vegan BBQ Jackfruit: Gluten, may contain SOYA

SIDES:
- Garlic Dough Balls: Gluten, Milk
- House Salad: None (dressing may contain MUSTARD)

IMPORTANT NOTES:
- We CANNOT produce gluten-free products
- Vegan pizzas use dairy-free cheese (contains SOYA)
- Our kitchen handles nuts - trace contamination possible
- For severe allergies, please call ahead to discuss`
    },
    {
      title: "Complaints & Refund Policy",
      category: "policies",
      content: `SLICE & STONE COMPLAINTS POLICY

WE WANT YOU HAPPY
If something isn't right, we want to fix it.

WRONG ORDER / MISSING ITEMS:
- Call us within 30 mins of delivery: 0117 123 4567
- We'll send out the correct items ASAP
- Or provide a refund/credit for missing items

QUALITY ISSUES:
- Please keep the item and take a photo
- Contact us within 24 hours
- We'll offer replacement or refund

LATE DELIVERY:
- If over 30 mins past quoted time, call us
- We'll provide a 20% discount code for next order
- Exceptionally late (60+ mins)? Full refund offered

HOW TO COMPLAIN:
1. Phone: 0117 123 4567 (during opening hours)
2. Email: hello@sliceandstone.demo
3. Website contact form

We respond to all complaints within 24 hours.
We never argue - if you're unhappy, we make it right.`
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
    { boxType: "business_profile", title: "About Clarity", description: "Chartered accountants specialising in small business and startup accounting", content: "Clarity Chartered Accountants was founded in 2015 with a simple mission: make accounting transparent and stress-free for small business owners. We're ICAEW-regulated and specialise in limited companies, sole traders, and startups. All our services are fixed-fee - no hourly billing surprises.", sortOrder: 0, isVisible: true },
    { boxType: "contact", title: "Contact Us", description: "Based in Leeds, serving clients UK-wide", content: "Phone: 0113 456 7890\nEmail: hello@clarityaccountants.demo\nAddress: 12 Park Row, Leeds LS1 5HD\nMeetings: Video calls available nationwide\nOffice hours: Monday-Friday 9am-5:30pm", sortOrder: 1, isVisible: true },
    { boxType: "team_member", title: "Sarah Mitchell, FCA", description: "Founder & Managing Director", content: "Sarah founded Clarity after 15 years at Big Four firms. She saw how small businesses were underserved by traditional accounting and set out to change that. She's a Fellow of the ICAEW and specializes in tech startups and e-commerce businesses.", sortOrder: 2, isVisible: true },
    { boxType: "team_member", title: "James Wong, ACA", description: "Tax Director", content: "James leads our tax advisory practice. With 10 years of experience in personal and corporate tax, he helps clients legitimately minimise their tax burden. He's particularly passionate about R&D tax credits for innovative businesses.", sortOrder: 3, isVisible: true },
    { boxType: "team_member", title: "Emma Patel, ACCA", description: "Client Services Manager", content: "Emma manages our client relationships and ensures smooth onboarding. She's usually your first point of contact and coordinates all work across our team. She's known for her responsiveness and clear communication.", sortOrder: 4, isVisible: true },
    { boxType: "team_member", title: "David Clark, ACMA", description: "Management Accounts Specialist", content: "David provides management accounts and financial forecasting for growing businesses. With a background in finance director roles, he brings commercial insight beyond basic compliance.", sortOrder: 5, isVisible: true },
    { boxType: "product", title: "Sole Trader Package", description: "Everything a sole trader needs - annual accounts, tax return, ongoing support", price: "75", currency: "GBP", category: "Core Packages", content: "Self Assessment tax return, Annual accounts preparation, MTD-compliant bookkeeping review, Year-end tax planning, Email & phone support, Quarterly catch-up calls. Price: £75/month (paid monthly) or £810/year (save 10%).", sortOrder: 10, isVisible: true },
    { boxType: "product", title: "Limited Company Standard", description: "Full compliance package for small limited companies", price: "150", currency: "GBP", category: "Core Packages", content: "Annual statutory accounts, Corporation Tax return, Confirmation Statement, Payroll for up to 2 directors, Personal tax returns for directors, VAT returns (if registered), Quarterly management accounts, Unlimited email support, Monthly call with your accountant. Price: £150/month.", sortOrder: 11, isVisible: true },
    { boxType: "product", title: "Limited Company Growth", description: "For companies with employees and complex needs", price: "300", currency: "GBP", category: "Core Packages", content: "Everything in Standard plus: Payroll for up to 10 employees, Monthly management accounts, Cash flow forecasting, Annual tax planning meeting, R&D tax credit review, Bookkeeping (up to 50 transactions/month), Dedicated accountant. Price: £300/month.", sortOrder: 12, isVisible: true },
    { boxType: "product", title: "Startup Launch Package", description: "Company formation + first year accounting for new businesses", price: "599", currency: "GBP", category: "One-off Services", content: "Company formation with Companies House, Registered office service (1 year), Corporation Tax registration, VAT registration (if needed), Bank account setup support, 6 months of bookkeeping, Formation to first accounts filing, 2x strategy calls. One-off fee: £599.", sortOrder: 13, isVisible: true },
    { boxType: "product", title: "R&D Tax Credits", description: "Specialist claims for innovative businesses", price: "0", category: "Add-on Services", content: "We work on a success-only basis - 15% of the claim value. No win, no fee. Most claims processed within 8 weeks. Average claim value for our clients: £25,000-£50,000.", sortOrder: 14, isVisible: true },
    { boxType: "product", title: "Ad-hoc Bookkeeping", description: "Catch-up bookkeeping for messy accounts", price: "45", currency: "GBP", category: "Add-on Services", content: "£45/hour for bookkeeping work. Typical catch-up project: £200-800 depending on backlog. We use Xero, QuickBooks, and FreeAgent.", sortOrder: 15, isVisible: true },
    { boxType: "faq", title: "How much for a limited company?", description: "Pricing for limited company accounting", content: "Our Limited Company Standard package is £150/month and includes: annual accounts, Corporation Tax return, director payroll & personal tax returns, VAT returns, quarterly management accounts, and unlimited support. For companies with employees or complex needs, our Growth package at £300/month adds full payroll, monthly accounts, and dedicated support.", sortOrder: 20, isVisible: true },
    { boxType: "faq", title: "How do I switch accountants?", description: "The process for moving to Clarity", content: "Switching is easier than you think: 1) Contact us for a free consultation call, 2) We'll send a 'disengagement letter' to your current accountant on your behalf, 3) They're legally required to hand over your records within 28 days, 4) We'll handle all the admin - you just sign our engagement letter. The whole process typically takes 2-4 weeks. We never charge for time spent taking over from another firm.", sortOrder: 21, isVisible: true },
    { boxType: "faq", title: "When is Corporation Tax due?", description: "Key filing deadlines explained", content: "Corporation Tax is due 9 months and 1 day after your accounting year end. For example, if your year end is 31 March 2024, tax is due by 1 January 2025. Your Corporation Tax RETURN must be filed within 12 months of year end. Accounts must be filed with Companies House within 9 months of year end. We'll send you reminders 3 months, 1 month, and 2 weeks before each deadline.", sortOrder: 22, isVisible: true },
    { boxType: "faq", title: "What software do you use?", description: "Our tech stack and integrations", content: "We primarily use Xero but also support QuickBooks Online and FreeAgent. For payroll we use Xero Payroll or BrightPay. We can also work with Sage if you're committed to it. All our clients get free access to Dext (formerly Receipt Bank) for receipt capture and expense management.", sortOrder: 23, isVisible: true },
    { boxType: "faq", title: "Do you offer payment plans?", description: "Flexible payment options", content: "Yes! All our monthly packages can be paid monthly by Direct Debit (no extra charge) or annually (10% discount). For one-off services like startup packages, we offer 50% upfront and 50% on completion. Need a different arrangement? Just ask - we're flexible for clients who communicate openly.", sortOrder: 24, isVisible: true },
    { boxType: "faq", title: "What's included in 'unlimited support'?", description: "Understanding our support promise", content: "Unlimited support means: email queries answered within 4 working hours, phone calls during office hours (no booking needed), quick WhatsApp responses for urgent matters. It does NOT include: work that takes more than 15 minutes (quoted separately), new services not in your package, advice for third parties. We track everything transparently - if a question becomes a project, we'll tell you before proceeding.", sortOrder: 25, isVisible: true },
    { boxType: "faq", title: "Can you help with HMRC investigations?", description: "Support during tax enquiries", content: "Yes. We have specialist tax investigation insurance available for £15/month that covers professional fees for HMRC enquiries. If you don't have insurance and face an enquiry, we charge £150/hour for investigation support. We've successfully defended dozens of clients - most enquiries are routine and resolve without penalty.", sortOrder: 26, isVisible: true },
    { boxType: "faq", title: "What's your onboarding process?", description: "Getting started with Clarity", content: "1) Free 30-min discovery call (we check we're a good fit), 2) Proposal email within 24 hours, 3) Sign engagement letter & set up Direct Debit, 4) We request records from your previous accountant, 5) 60-min onboarding call to set up systems, 6) Welcome pack with key dates & contact details. Most clients are fully onboarded within 2 weeks.", sortOrder: 27, isVisible: true },
  ],
  documents: [
    {
      title: "Key Tax Deadlines 2024-25",
      category: "guide",
      content: `CLARITY ACCOUNTANTS - KEY DATES 2024-25

SELF ASSESSMENT (2023-24 tax year):
- 5 October 2024: Register for Self Assessment if first time
- 31 October 2024: Paper return deadline
- 31 January 2025: Online return + payment deadline
- 31 July 2025: Second payment on account due

CORPORATION TAX (for 31 March year ends):
- 1 January 2025: Payment due for y/e 31 March 2024
- 31 March 2025: File accounts with Companies House (y/e 30 June 2024)
- 31 March 2025: CT600 filing deadline (y/e 31 March 2024)

VAT:
- Returns due 1 month + 7 days after quarter end
- E.g., April-June quarter: due 7 August

PAYE/NI:
- Monthly payments: 22nd of following month (or 19th if paying by post)
- Annual P11D deadline: 6 July

MAKING TAX DIGITAL:
- MTD for Income Tax: Begins April 2026 for income over £50k
- Quarterly digital updates will be required`
    },
    {
      title: "Limited Company vs Sole Trader Guide",
      category: "guide",
      content: `SHOULD YOU INCORPORATE? A CLARITY GUIDE

STAY SOLE TRADER IF:
- Profit under £30,000/year
- Low liability risk in your industry
- Simple business structure
- You want minimal admin
- You regularly withdraw all profits

INCORPORATE IF:
- Profit over £50,000/year (tax savings significant)
- You want liability protection
- You're seeking investment or contracts requiring Ltd
- You want to retain profits in the company
- You need multiple shareholders

TAX COMPARISON (2024-25, £60k profit):

SOLE TRADER:
- Income Tax: ~£14,400
- National Insurance: ~£4,400
- Total tax: ~£18,800
- Take home: ~£41,200

LIMITED COMPANY (optimal extraction):
- Corporation Tax: ~£7,800
- Director salary (£12,570): £0 personal tax
- Dividends (~£40k): ~£3,500
- Total tax: ~£11,300
- Take home: ~£48,700
- SAVING: ~£7,500/year

This is illustrative - actual savings depend on your circumstances.
Book a free consultation to model your specific situation.`
    },
    {
      title: "Onboarding Checklist",
      category: "guide",
      content: `CLARITY NEW CLIENT ONBOARDING CHECKLIST

BEFORE WE START:
□ Signed engagement letter (we'll send this)
□ Direct Debit mandate for monthly fees
□ Proof of ID (passport or driving licence)
□ Proof of address (utility bill, bank statement)

WE'LL REQUEST FROM YOUR OLD ACCOUNTANT:
□ Last 2 years of accounts
□ Outstanding VAT returns
□ Corporation Tax computations
□ Payroll records if applicable
□ Any correspondence with HMRC

YOU'LL NEED TO PROVIDE:
□ Access to accounting software (Xero/QuickBooks)
□ Bank statements for current year
□ Details of any ongoing HMRC matters
□ Shareholder & director details
□ UTR numbers for individuals
□ Company authentication code

WE'LL SET UP:
□ Dext account for receipt capture
□ Xero/software integration
□ Shared folder for documents
□ Calendar with key deadlines
□ Communication preferences

TYPICAL TIMELINE:
Day 1-3: Paperwork signed
Day 4-14: Records received from old accountant
Day 15-21: Systems set up, onboarding call
Day 22+: Business as usual with Clarity`
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
    { boxType: "business_profile", title: "About TechVault", description: "UK's trusted destination for premium refurbished tech", content: "TechVault UK has been selling refurbished technology since 2018. We've sold over 50,000 devices with a 4.8★ Trustpilot rating. Every device is tested across 72 checkpoints, professionally cleaned, and backed by our 12-month warranty. Our mission: make quality tech accessible and sustainable.", sortOrder: 0, isVisible: true },
    { boxType: "contact", title: "Contact & Support", description: "Customer service 7 days a week", content: "Phone: 0161 234 5678 (Mon-Sat 9am-6pm, Sun 10am-4pm)\nEmail: support@techvault.demo\nLive Chat: Available on website 9am-9pm\nWarehouse: Unit 4, Trafford Park, Manchester M17 1RG (no walk-ins)\nReturns: returns@techvault.demo", sortOrder: 1, isVisible: true },
    { boxType: "product", title: "iPhone 15 Pro Max 256GB", description: "Apple's flagship - all colours available", price: "849", currency: "GBP", category: "iPhones", content: "Condition: Excellent (Grade A). Original battery health 90%+. 12-month warranty. Includes cable, no original box.", tags: [{ key: "grade", value: "excellent", label: "Grade A" }, { key: "storage", value: "256gb", label: "256GB" }], sortOrder: 10, isVisible: true },
    { boxType: "product", title: "iPhone 15 Pro Max 256GB", description: "Great value with minor cosmetic marks", price: "749", currency: "GBP", category: "iPhones", content: "Condition: Good (Grade B). Light scratches on frame, screen perfect. Battery health 85%+. 12-month warranty.", tags: [{ key: "grade", value: "good", label: "Grade B" }, { key: "storage", value: "256gb", label: "256GB" }], sortOrder: 11, isVisible: true },
    { boxType: "product", title: "iPhone 14 Pro 128GB", description: "Previous gen flagship, excellent value", price: "599", currency: "GBP", category: "iPhones", content: "Condition: Excellent (Grade A). Battery health 88%+. All colours available. 12-month warranty included.", tags: [{ key: "grade", value: "excellent", label: "Grade A" }, { key: "storage", value: "128gb", label: "128GB" }], sortOrder: 12, isVisible: true },
    { boxType: "product", title: "iPhone 13 128GB", description: "Reliable workhorse at great price", price: "399", currency: "GBP", category: "iPhones", content: "Condition: Good (Grade B). Minor wear visible. Battery health 82%+. 12-month warranty. Our best seller for value.", tags: [{ key: "grade", value: "good", label: "Grade B" }, { key: "storage", value: "128gb", label: "128GB" }], sortOrder: 13, isVisible: true },
    { boxType: "product", title: "Samsung Galaxy S24 Ultra 256GB", description: "Samsung's best with S Pen", price: "799", currency: "GBP", category: "Android Phones", content: "Condition: Excellent (Grade A). Includes S Pen. 12-month warranty. All colours available.", tags: [{ key: "grade", value: "excellent", label: "Grade A" }], sortOrder: 14, isVisible: true },
    { boxType: "product", title: "Samsung Galaxy S23 256GB", description: "Compact flagship Android", price: "449", currency: "GBP", category: "Android Phones", content: "Condition: Good (Grade B). Light wear on frame. 12-month warranty included.", tags: [{ key: "grade", value: "good", label: "Grade B" }], sortOrder: 15, isVisible: true },
    { boxType: "product", title: "Google Pixel 8 Pro 128GB", description: "Best Android camera", price: "549", currency: "GBP", category: "Android Phones", content: "Condition: Excellent (Grade A). Unlocked. 7 years of software updates. 12-month warranty.", tags: [{ key: "grade", value: "excellent", label: "Grade A" }], sortOrder: 16, isVisible: true },
    { boxType: "product", title: "iPad Pro 12.9\" M2 256GB WiFi", description: "Professional tablet with M2 chip", price: "799", currency: "GBP", category: "Tablets", content: "Condition: Excellent (Grade A). Screen perfect. 12-month warranty. Apple Pencil compatible.", tags: [{ key: "grade", value: "excellent", label: "Grade A" }], sortOrder: 17, isVisible: true },
    { boxType: "product", title: "iPad 10th Gen 64GB WiFi", description: "Great all-rounder iPad", price: "329", currency: "GBP", category: "Tablets", content: "Condition: Good (Grade B). Minor marks on casing. 12-month warranty. USB-C charging.", tags: [{ key: "grade", value: "good", label: "Grade B" }], sortOrder: 18, isVisible: true },
    { boxType: "product", title: "MacBook Air M2 13\" 256GB", description: "Ultra-thin, all-day battery", price: "849", currency: "GBP", category: "Laptops", content: "Condition: Excellent (Grade A). Battery cycle count under 50. 12-month warranty. Space Grey or Midnight.", tags: [{ key: "grade", value: "excellent", label: "Grade A" }], sortOrder: 19, isVisible: true },
    { boxType: "product", title: "MacBook Pro 14\" M3 512GB", description: "Pro performance for creatives", price: "1449", currency: "GBP", category: "Laptops", content: "Condition: Excellent (Grade A). ProMotion display. 12-month warranty. Low cycle count.", tags: [{ key: "grade", value: "excellent", label: "Grade A" }], sortOrder: 20, isVisible: true },
    { boxType: "product", title: "Apple Watch Series 9 45mm GPS", description: "Latest Apple Watch", price: "329", currency: "GBP", category: "Wearables", content: "Condition: Excellent (Grade A). Battery health 95%+. 12-month warranty. Multiple colours.", tags: [{ key: "grade", value: "excellent", label: "Grade A" }], sortOrder: 21, isVisible: true },
    { boxType: "product", title: "AirPods Pro 2nd Gen", description: "Premium noise cancelling", price: "169", currency: "GBP", category: "Audio", content: "Condition: Excellent (Grade A). USB-C case. Full functionality tested. 12-month warranty.", tags: [{ key: "grade", value: "excellent", label: "Grade A" }], sortOrder: 22, isVisible: true },
    { boxType: "faq", title: "What's the difference between Good and Excellent?", description: "Our grading system explained", content: "EXCELLENT (Grade A): Near-perfect cosmetically. Screen flawless. Very light wear only visible under bright light. Battery health 88%+. Looks almost new.\n\nGOOD (Grade B): Light scratches on frame/back. Screen perfect or very light marks. Normal signs of previous use. Battery health 80%+. Fully functional.\n\nFAIR (Grade C): Visible scratches and wear. May have deeper marks. Screen may have light scratches (not cracks). Battery health 75%+. All functions work perfectly.\n\nAll grades come with 12-month warranty and 30-day returns.", sortOrder: 30, isVisible: true },
    { boxType: "faq", title: "iPhone 15 vs iPhone 16 comparison", description: "Which iPhone should you buy?", content: "iPHONE 15 PRO (from £599 refurb):\n- A17 Pro chip\n- 48MP main camera\n- Action Button\n- USB-C\n- Great value\n\niPHONE 16 PRO (from £899 refurb):\n- A18 Pro chip (~20% faster)\n- 48MP + improved ultra-wide\n- Camera Control button\n- Larger batteries\n- Apple Intelligence features\n\nOUR TAKE: If you want the best camera and latest features, go 16. For most users, iPhone 15 Pro at £300 less is the smarter buy. Both get years of updates.", sortOrder: 31, isVisible: true },
    { boxType: "faq", title: "What's your returns policy?", description: "30-day returns and refund information", content: "30-DAY MONEY BACK GUARANTEE:\n- Return any device within 30 days for full refund\n- Device must be in same condition as received\n- Include all accessories we sent\n- We pay return postage if device is faulty\n- You pay return postage if you change your mind (approx £5)\n\nHOW TO RETURN:\n1. Email returns@techvault.demo with order number\n2. We'll send a returns label within 24 hours\n3. Pack device securely and drop at any post office\n4. Refund processed within 3 working days of receipt\n\n12-MONTH WARRANTY:\n- Covers all manufacturing defects\n- Free repairs or replacement\n- Accidental damage NOT covered (see our insurance)", sortOrder: 32, isVisible: true },
    { boxType: "faq", title: "Trade-in values", description: "Get money for your old device", content: "SAMPLE TRADE-IN VALUES (Grade B, working):\n\niPhone 15 Pro Max: £420-520\niPhone 15 Pro: £350-450\niPhone 14 Pro: £280-380\niPhone 13 Pro: £200-280\niPhone 13: £150-220\niPhone 12: £80-150\n\nSamsung S24 Ultra: £380-480\nSamsung S23 Ultra: £280-380\n\niPad Pro 12.9 M2: £350-450\niPad Air 5: £250-350\n\nMacBook Air M2: £450-550\nMacBook Pro 14 M3: £900-1100\n\nValues depend on condition, storage, battery health. Get instant quote at techvault.demo/trade-in. We pay within 24 hours of receiving your device.", sortOrder: 33, isVisible: true },
    { boxType: "faq", title: "Do you offer finance?", description: "Buy now pay later options", content: "YES! We offer Klarna for all orders over £99:\n\nPAY IN 3: Split into 3 interest-free payments\nPAY IN 30: Try before you buy, pay later\nFINANCE: 6-36 month plans for larger purchases\n\nExample: iPhone 15 Pro Max (£849)\n- 3 payments of £283\n- No interest, no fees if paid on time\n\nChoose Klarna at checkout. Approval in seconds. Must be 18+ and UK resident.", sortOrder: 34, isVisible: true },
    { boxType: "faq", title: "How long is delivery?", description: "Shipping times and options", content: "STANDARD DELIVERY: Free over £50, otherwise £3.99\n- 2-3 working days\n- Royal Mail Tracked 48\n\nEXPRESS DELIVERY: £6.99\n- Next working day (order by 2pm)\n- DPD with 1-hour delivery window\n\nSATURDAY DELIVERY: £9.99\n- Order by 2pm Friday\n\nAll orders are shipped from Manchester. Tracking provided for every order. Signature required for items over £200.", sortOrder: 35, isVisible: true },
  ],
  documents: [
    {
      title: "Complete Grading Guide",
      category: "guide",
      content: `TECHVAULT UK GRADING SYSTEM

EXCELLENT (Grade A) - Premium Condition
Visual: Near-perfect. Very light wear only visible under direct light.
Screen: Flawless, no scratches or marks.
Battery: 88%+ health for phones, under 100 cycles for MacBooks.
Functional: All features work perfectly.
Price: Typically 20-30% below new.
Best for: Those wanting near-new experience.

GOOD (Grade B) - Light Wear
Visual: Light scratches on frame/back. Minor signs of use.
Screen: Perfect or very faint marks that don't affect display.
Battery: 80%+ health for phones.
Functional: All features work perfectly.
Price: Typically 35-45% below new.
Best for: Best value for most users.

FAIR (Grade C) - Visible Wear
Visual: Visible scratches, scuffs, may have deeper marks.
Screen: May have light scratches (never cracks).
Battery: 75%+ health for phones.
Functional: All features work perfectly.
Price: Typically 50-60% below new.
Best for: Budget-conscious buyers, kids' first phone.

ALL GRADES INCLUDE:
✓ 72-point functionality test
✓ Professional cleaning & sanitisation
✓ 12-month TechVault warranty
✓ 30-day money-back guarantee
✓ UK plug and cable included`
    },
    {
      title: "Warranty & Support Policies",
      category: "policies",
      content: `TECHVAULT UK WARRANTY POLICY

12-MONTH WARRANTY COVERAGE:
Covered:
- Battery failure (capacity drops below 70%)
- Screen defects (dead pixels, backlight issues)
- Button/port failures
- Speaker/microphone issues
- Connectivity problems (WiFi, Bluetooth, cellular)
- Software issues caused by hardware

NOT Covered:
- Accidental damage (drops, water, cracks)
- Cosmetic wear after purchase
- Theft or loss
- Software issues from user modification
- Accessories (cases, chargers, earbuds)

HOW TO CLAIM:
1. Contact support@techvault.demo
2. Describe the issue with photos/video if possible
3. We'll diagnose remotely where possible
4. If warranty repair needed, we send prepaid label
5. Repair or replacement within 7 working days
6. Your device returned free of charge

TECHVAULT CARE+ (Optional):
For £4.99/month, add accidental damage protection:
- 2 accidental damage claims per year
- £29 excess per claim
- Cracked screens, water damage, drops covered
- Cancel anytime`
    },
    {
      title: "Trade-In Process",
      category: "guide",
      content: `HOW TRADE-IN WORKS AT TECHVAULT UK

STEP 1: GET YOUR QUOTE
- Visit techvault.demo/trade-in
- Select your device and answer condition questions
- Get instant quote (valid for 14 days)

STEP 2: SEND YOUR DEVICE
- Accept quote online
- We email you a FREE prepaid Royal Mail label
- Pack device securely (we'll send tips)
- Drop at any post office

STEP 3: GET PAID
- We inspect within 24 hours of receipt
- If matches your description: payment same day
- If different condition: we'll offer revised quote
- Payment via bank transfer or PayPal

CONDITION REQUIREMENTS:
Working: Device turns on, no major faults
Non-working: We still buy! (reduced value)
iCloud locked: We cannot accept
Blacklisted/blocked: We cannot accept

BOOST YOUR VALUE:
+5%: Include original box
+5%: Include original accessories
+10%: Factory reset before sending

POPULAR TRADE-IN VALUES (Good condition):
iPhone 14 Pro: £280-350
iPhone 13: £150-200
Samsung S23: £180-250
MacBook Air M1: £350-450
iPad Air 5: £250-320`
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

  console.log(`  + Creating ${data.documents.length} knowledge documents...`);
  for (const docData of data.documents) {
    const existingDocs = await storage.getOrbitDocuments(data.slug);
    const existing = existingDocs.find(d => d.title === docData.title);
    
    if (existing) {
      await storage.updateOrbitDocument(existing.id, {
        extractedText: docData.content,
        category: docData.category,
        status: "ready",
      });
    } else {
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

if (require.main === module) {
  seedAllDemoOrbits()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
