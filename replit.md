# NextMonth – Claude Code Operating Context

## Overview
NextMonth is a Meaning-to-Experience Engine for brand storytelling, creative narratives, and knowledge transfer. It transforms various content into interactive, cinematic story cards featuring AI-generated visuals, guardrailed AI character interaction, a Visual Bible system, TTS narration, and a Daily Drop Engine. The platform supports role-based access and a tiered subscription model, with the goal of evolving from basic analytics to strategic advice based on pattern intelligence and behavioral sequences.

## User Preferences
I prefer simple language and clear, concise explanations. I value iterative development and prefer to be asked before major changes are made to the codebase. Please provide detailed explanations when new features or significant modifications are implemented. Do not make changes to the `shared/schema.ts` file without explicit approval, as it is the single source of truth for data models. Ensure that any AI-generated content adheres to the established visual bible system and character profiles for consistency.

## System Architecture
NextMonth utilizes a multi-stage pipeline: Input Normalisation, Theme Extraction, Character/Location Extraction, Card Planning, Card Content Drafting, and QA/Validation. The frontend uses React 18 with Vite, TailwindCSS (shadcn/ui), Wouter, and TanStack Query. The backend is Node.js and Express, with Drizzle ORM, Neon-backed PostgreSQL, and Passport.js for authentication.

Key architectural decisions include:
-   **Schema-First Development**: `shared/schema.ts` defines all data models.
-   **Storage Abstraction**: Database operations managed via an `IStorage` interface.
-   **Three-Layer Chat Prompt Composition**: AI prompts built from Universe Policy, Character Profile, and Card Overrides.
-   **Visual Bible System**: Ensures visual consistency through a Design Guide, Reference Assets, and Prompt Builder.
-   **Lens-Based User Experience**: Onboarding customized by user-selected "lens" (Brand, Creative, Knowledge).
-   **Tiered Capability Model**: Features gated by "Orbit" tier model (Free, Grow, Understand, Intelligence).
-   **Pattern Intelligence Focus**: Analytics designed for future pattern recognition on session journeys, event ordering, object interaction, and outcome linkage.
-   **UI/UX**: Cinematic dark theme with Cinzel and Inter fonts, pink-purple-blue gradient accent.
-   **Three-Tier Navigation System**: Global navigation and product-specific submenus.
-   **Data Sources Integration**: Supports ingestion of external read-only GET APIs with SSRF protection.
-   **AgoraCube Device System**: Enables Orbit display on thin clients with kiosk mode and voice interaction.
-   **Orbit Signal Schema v0.1**: Machine-readable JSON endpoint at `/.well-known/orbit.json` for AI systems.
-   **Guest ICE Builder**: Allows anonymous users to create time-limited ICE previews at `/try` with server-persisted data and rate limiting.
-   **Preview Share Bar**: Facilitates sharing of unclaimed Orbits.
-   **Experience Analytics System**: Client-side tracking for experience and card views.
-   **Multi-Tenant Security**: Implemented with HMAC-SHA256 signed access tokens and per-IP rate limiting.
-   **Stripe Subscription System**: Full subscription billing with webhook-based synchronization for product plans.
-   **Platform-Agnostic Deployment**: Configurable via environment variables.
-   **Email & Notifications System**: Transactional emails via Resend and in-app notifications.
-   **Interactivity Nodes Between Cards**: Supports conversational AI character interaction between cards in live previews.
-   **Story-Specific Character AI**: Characters extracted from story content during preview creation with unique personas and in-character responses.
-   **Card Pace Controls**: Preview modal includes Slow/Normal/Fast pace controls for card auto-advance timing.
-   **Story Fidelity Modes (Structural Ingest)**: Content uploads detect type; scripts trigger Script-Exact Mode (parses scenes, dialogue) for card generation, preserving narrative order. Interpretive Mode (default for non-scripts) summarizes content.
-   **Fidelity Mode Discipline**: Script-Exact is screenplay-only; business content uses Interpretive Mode, distinguishing structural grammar from malleable content.
-   **Selective Expansion**: For scripts, checkout offers scene progress and expansion options (Preview Only, Full Story, Act 1).
-   **Guided First-Run Experience**: A light, skippable walkthrough on first preview.
-   **Login Does Not Unlock Features**: Login saves progress; payment unlocks media generation, AI interactivity, and publishing.
-   **Guest-First Conversion Model**: Users experience value before identity or payment is requested.
-   **Shopping List / Production Manifest**: Calculates and displays media counts with real-time price updates before checkout.
-   **Download vs Publish**: Download produces a non-interactive video artifact; Publish creates a public, interactive experience requiring a subscription.
-   **Editor Transition**: Users transition from Preview Editor to Professional/Production Editor post-upgrade.
-   **Canonical Routing Rules**: Specific routes for CTAs like "Launch Interactive Builder" (`/try`), "Sign In" (`/login`), and "Dashboard" (`/dashboard`), emphasizing guest-first creation.
-   **Website Extraction System**: Automatically detects and extracts product/menu data from business websites using Site Detection, Multi-Page Crawling, Quality Validation, and Image Filtering. Includes Site Fingerprinting for various platforms and DOM Extraction Strategies (Microdata/Schema.org, Repeating Sibling Patterns, Image + Price Cards).

## Orbit System (January 2026 - Fully Functional)

### Menu Extraction Pipeline
The Orbit system successfully extracts product/menu catalogues (50-200+ items) from diverse business websites:

1. **Site Fingerprinting**: Detects website platform (Squarespace, WordPress, Shopify, etc.) and applies platform-specific extraction strategies
2. **Multi-Page Crawling**: Discovers and crawls menu/product pages with deduplication to prevent double-processing
3. **AI-Based Extraction**: Uses GPT-4o-mini to parse complex menu structures, including embedded JSON menus in Squarespace sites
4. **Quality Validation**: Validates extracted items for completeness (title, price, category)
5. **Image Filtering**: Filters and assigns relevant images from the site's image pool

### Key Files
- `server/services/catalogueDetection.ts` - Main extraction orchestration
- `server/services/deepScraper.ts` - Multi-page crawling and content extraction
- `client/src/pages/orbit/OrbitView.tsx` - Orbit view with merged site knowledge
- `client/src/components/radar/RadarGrid.tsx` - Interactive knowledge grid with ChatHub
- `client/src/components/radar/ChatHub.tsx` - AI chat interface with conversation persistence

### Hybrid Knowledge System
The `buildMergedSiteKnowledge()` function combines:
- **Boxes data** (extracted menu items): titles, prices, categories, descriptions
- **Preview branding**: logos, image pools, colors, site identity
- Boxes take priority for content; preview provides visual assets

### AI Chat with Conversation History
- Endpoint: `POST /api/orbit/:slug/chat`
- Accepts conversation history array for contextual multi-turn responses
- Uses `getOpenAI()` helper for proper credential handling via `AI_INTEGRATIONS_OPENAI_API_KEY`
- System prompt includes full menu context for intelligent dish recommendations

### Critical Implementation Details
- **OpenAI Integration**: Always use `getOpenAI()` helper function, never create new OpenAI instances directly
- **ChatHub Stable Key**: Use `key="chat-hub-stable"` in RadarGrid to prevent message loss on item selection
- **Boxes vs Preview Priority**: OrbitView prioritizes extracted boxes over preview siteIdentity for menu display

### Test Case (Red Lion Bloxham)
- Successfully extracts 107 menu items across 11 categories
- Items include prices, descriptions, and dietary tags (Vg, Gf, etc.)
- AI chat responds intelligently about specific dishes, vegan options, prices
- URL: `/orbit/the-red-lion-at-bloxham-co-uk`

## External Dependencies
-   **OpenAI API**: For chat completions (gpt-4o-mini) and Text-to-Speech (TTS).
-   **Kling AI API**: For video generation.
-   **Replicate API**: For alternative video generation models.
-   **Stripe**: For subscription billing and payment processing.
-   **Resend**: For transactional email delivery.
-   **Replit Object Storage (R2/S3-compatible)**: For file storage.
-   **Neon (PostgreSQL)**: Managed PostgreSQL database service.