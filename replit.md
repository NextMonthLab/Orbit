# NextMonth – Claude Code Operating Context

## Overview
NextMonth is a Meaning-to-Experience Engine that transforms source content (like scripts, PDFs, websites) into interactive, cinematic story cards. It's designed for brand storytelling, creative narratives, and knowledge transfer, offering features such as AI-generated visuals, guardrailed AI character interaction, a Visual Bible system for consistency, TTS narration, and a Daily Drop Engine for content release. The platform supports role-based access and a tiered subscription model, aiming to provide a stable and monetisable MVP. The long-term vision is to evolve from basic analytics to providing strategic advice based on pattern intelligence, focusing on understanding behavioral sequences and their commercial implications.

## User Preferences
I prefer simple language and clear, concise explanations. I value iterative development and prefer to be asked before major changes are made to the codebase. Please provide detailed explanations when new features or significant modifications are implemented. Do not make changes to the `shared/schema.ts` file without explicit approval, as it is the single source of truth for data models. Ensure that any AI-generated content adheres to the established visual bible system and character profiles for consistency.

## System Architecture
NextMonth's architecture is a multi-stage pipeline: Input Normalisation, Theme Extraction, Character/Location Extraction, Card Planning, Card Content Drafting, and final QA/Validation. The frontend uses React 18 with Vite, TailwindCSS (shadcn/ui), Wouter for routing, and TanStack Query. The backend is Node.js and Express, with Drizzle ORM for type-safe PostgreSQL interactions (Neon-backed) and Passport.js for authentication.

Key architectural patterns and design decisions include:
- **Schema-First Development**: `shared/schema.ts` defines all data models, generating types for both client and server.
- **Storage Abstraction**: All database operations are managed via an `IStorage` interface (`server/storage.ts`).
- **Three-Layer Chat Prompt Composition**: AI chat prompts are built from a Universe Policy, Character Profile, and Card Overrides.
- **Visual Bible System**: Ensures visual consistency using a Design Guide, Reference Assets, and a Prompt Builder.
- **Lens-Based User Experience**: Users select a "lens" (Brand, Creative, Knowledge) during onboarding to customize their experience.
- **Tiered Capability Model**: The "Orbit" tier model (Free, Grow, Understand, Intelligence) gates features rather than access, with a focus on making the free tier a profitable acquisition channel.
- **Pattern Intelligence Focus**: All analytics and tracking are designed to support future pattern recognition and strategic advice, emphasizing session-based journeys, event ordering, object-level interaction, and outcome linkage.
- **UI/UX**: Emphasizes a cinematic feel with a dark theme, using Cinzel for headlines and Inter for body text, and a pink-purple-blue gradient accent.

## External Dependencies
- **OpenAI API**: Used for chat completions (gpt-4o-mini) and Text-to-Speech (TTS).
- **Kling AI API**: Integrated for video generation.
- **Replicate API**: Used for alternative video generation models.
- **Stripe**: For subscription billing and payment processing.
- **Replit Object Storage (R2/S3-compatible)**: For file storage.

---

## 📌 Locked Strategic Decisions

### Orbit Claiming & Tier Model (LOCKED)

**Status: LOCKED — Do not reinterpret without explicit decision update**

1. **One Orbit per business** — Public, lives at `/orbit/:slug`, always exists, always shareable
2. **Claiming is universal and free** — Establishes ownership, unlocks free Data Hub
3. **Free tier = activity visibility** (counts only)
4. **Paid tier = understanding** (insights, transcripts, ICE Maker, curation)
5. **Data philosophy**: Activity is free. Understanding is paid.

---

### Pattern Intelligence → Strategic Advice (LOCKED)

**Status: LOCKED — Applies to all future tracking, analytics, and intelligence work**

Core evolution path:
1. Analytics → what happened
2. Insights → what people asked and did
3. Pattern Intelligence → what tends to happen in sequence
4. Strategic Advice → what this implies the business should do next

**Architectural guardrails:** Events must be linkable into sequences, timestamps preserved, object-level interaction tracked, outcomes linkable to journeys.

---

### Orbit Value Ladder (LOCKED)

**Status: LOCKED — Do not rename tiers or collapse the progression**

| Tier | Price | Core Value |
|------|-------|------------|
| **Orbit Free** | £0 | Ownership + visibility of activity |
| **Orbit Grow** | £19/mo | Control + curation + ICE Maker (pay-as-you-go) |
| **Orbit Understand** | £49/mo | Insights + clarity + ICE Maker bundled (6 credits) |
| **Orbit Intelligence** | £99/mo | Pattern Intelligence + Strategic Advice (12-15 credits) |

**Naming guardrail:** Do NOT use Basic/Pro/Enterprise. Use: Orbit → Grow → Understand → Intelligence.

---

### ICE + Video Pricing Model (LOCKED)

**Status: LOCKED — Cost-aware creative economy supporting both casual users and filmmakers**

#### Core Principle
- An ICE is a **narrative structure**, not "all possible media"
- Video is **premium, scene-based, and optional**
- Short films are supported — but never subsidised

#### Standard ICE (1 Credit = £8)

| Contents | Details |
|----------|---------|
| Cards/scenes | 12 |
| AI images | 12 (auto-generated) |
| Video scenes | ≤4 (Haiper, budget model) |
| Script & styling | Included |

**Cost to you:** ~£1.40 | **Margin:** ~82%

#### Full Cinematic ICE (Short Film Mode)

For users who want 12 consecutive video scenes:

| Mode | Videos | Model | Credits | Cost | Price | Margin |
|------|--------|-------|---------|------|-------|--------|
| Budget Cinematic | 12 | Haiper | 4 | £3.60 | £32 | 89% |
| Standard Cinematic | 12 | Minimax | 6 | £9.60 | £48 | 80% |
| Premium Cinematic | 12 | Kling | 8 | £13.20 | £64 | 79% |

**Scaling rule:** ~1 credit per 3 video scenes (budget)

#### UX Flow

1. User creates ICE → gets 12 images + 4 auto-selected video scenes
2. "Upgrade to Full Cinematic" button for more videos
3. User chooses quality tier → credits deducted → all scenes rendered as video

#### Subscription Tier Interaction

| Tier | Bundled Credits | Can Create |
|------|-----------------|------------|
| Grow (£19) | Pay-as-you-go | Any combination |
| Understand (£49) | 6 credits/mo | 6 standard ICEs or 1 full cinematic + remainder |
| Intelligence (£99) | 12-15 credits/mo | Full cinematic stories comfortably |

---

### Free Orbit Guardrails (LOCKED)

**Status: LOCKED — Required for profitability at scale**

- **Conversation limit:** 50 messages per Orbit per month
- Soft messaging at ~35-40, hard stop at 50
- UX framing: success not restriction ("Your Orbit is getting attention")

---

### Profitability Guardrails (LOCKED)

1. Free tier must remain predictable and capped
2. ICE Maker must remain high-margin (79%+)
3. Video is never unlimited — always a conscious choice
4. Pattern Intelligence must remain deterministic/batch-processed

---

## Recent Changes

### Data Sources v1 (December 2025)

**Universal API Snapshot Ingestion** - Allows businesses to connect external read-only GET APIs to their Orbit for conversational intelligence.

**Database Schema:**
- `api_secrets` - Encrypted credentials (bearer tokens, API keys)
- `api_connections` - Connection definitions with SSRF-validated base URLs
- `api_endpoints` - GET paths with response mapping configuration
- `api_snapshots` - Versioned fetch results with request hash idempotency
- `api_curated_items` - Normalized, Orbit-ready data for conversation context

**Security Features:**
- SSRF protection with private IP blocking and HTTPS-only enforcement
- 5MB streaming body limit with chunk-by-chunk enforcement
- Request hash deduplication (hourly)
- Object storage integration for raw payloads (when configured)
- Owner-only route protection via requireOrbitOwner middleware

**Key Files:**
- `shared/schema.ts` - Database tables and types
- `server/services/ssrfProtection.ts` - URL validation utility
- `server/storage.ts` - CRUD operations for all data sources tables
- `server/routes.ts` - API endpoints under `/api/orbit/:slug/data-sources/*`
- `client/src/components/orbit/HubDataSourcesPanel.tsx` - UI component

**Scope (v1):**
- Manual snapshots only (no scheduled polling)
- GET requests only
- 1 endpoint per connection
- HTTPS enforced
- Available for paid tiers (Grow+)

---

### AgoraCube Device System (December 2025)

**Raspberry Pi 5 Kiosk Mode** - Enables Orbit display on dedicated thin clients with optional voice interaction.

**Database Schema:**
- `device_sessions` - Device registration with bcrypt-hashed tokens, scopes, expiry
- `device_events` - Audit log for device activity (pair, revoke, ask)
- `device_rate_limits` - Token bucket rate limiting per device+orbit

**Device Authentication Flow:**
1. Owner provisions device → generates 6-digit crypto.randomInt code (collision retry)
2. Device exchanges code for bearer token → server hashes with bcrypt
3. Device uses token in X-Device-Token header for /ask requests
4. Owner can revoke any device instantly

**Rate Limiting:**
- 2 tokens/minute refill (120/hour)
- 10 token burst capacity
- Returns accurate retryAfter in 429 responses

**Kiosk Mode (?kiosk=1):**
- Chromeless fullscreen layout
- 64px minimum touch targets
- 50 card cap per session
- Reduced motion (no parallax, no custom scroll physics)
- Tap-based pagination navigation

**Voice Mode (?voice=1):**
- Browser SpeechRecognition API (STT)
- SpeechSynthesis API (TTS)
- Mic button for quick questions
- en-US language default

**API Endpoints:**
- `POST /api/orbit/:slug/devices/provision` - Generate pairing code (owner only)
- `POST /api/orbit/:slug/devices/pair` - Exchange code for token
- `GET /api/orbit/:slug/devices` - List devices (owner only)
- `DELETE /api/orbit/:slug/devices/:deviceId` - Revoke device (owner only)
- `POST /api/orbit/:slug/ask` - AI-powered Q&A with scenePatch

**Key Files:**
- `shared/schema.ts` - Device tables and types
- `server/storage.ts` - Device CRUD and rate limiting
- `server/routes.ts` - Device and /ask endpoints
- `client/src/pages/orbit/KioskOrbitView.tsx` - Kiosk/voice UI
- `client/src/App.tsx` - OrbitRouter with mode detection
- `docs/AGORACUBE_DEMO.md` - Full demo guide and Pi setup

---

### Phase 5: Final Integration Pass (December 2025)

**Security Fixes:**
- Removed preview mode bypass from all Business Hub endpoints (`/api/orbit/:slug/hub`, `/api/orbit/:slug/leads`)
- Implemented triple-gating in DataHub: owner check → paid tier check → content display
- `isPaid` now calculated from `orbitMeta.planTier` using `PAID_TIERS = ['grow', 'insight', 'intelligence']`
- OrbitView.tsx only redirects paid tier owners to Business Hub

**Feature Flags Added:**
- Location: `server/config/featureFlags.ts`
- Kill-switches: notifications, video generation, AI features, soft launch mode

**Copy Standardization:**
- All tier displays use "Orbit Understand" not "Orbit Insight"
- Internal code values remain: free, grow, insight, intelligence

**Files Modified:**
- `server/routes.ts` - tier gating, preview mode removal
- `client/src/pages/orbit/DataHub.tsx` - triple-gating, preview removal
- `client/src/pages/orbit/OrbitView.tsx` - paid owner redirect
- `server/config/featureFlags.ts` - new file with kill-switches

**Super Admin Dashboard Added:**
- Route: `/super-admin` - comprehensive admin management
- Admin user: hello@nextmonth.io (with full admin privileges)
- Features: user management, orbit management, preview tracking, lead capture, feature flags display

---

## 📌 Orbit Intelligence View Design Guardrails (LOCKED)

**Status: LOCKED — See `ORBIT_GUARDRAILS.md` for full specification**

All Orbit UI development must comply with the design guardrails in `ORBIT_GUARDRAILS.md`. Key principles:

1. **North Star**: Orbit should feel like a senior analyst who organised your intelligence before you asked
2. **Restraint Over Spectacle**: Never try to look impressive, feel inevitable instead
3. **Motion Has One Job**: Explain state change only, no idle/looping animations
4. **AI Presence Is Contextual**: Capable analyst, not a personality
5. **Orientation Is Sacred**: Users must re-orient in under 2 seconds
6. **Enterprise Credibility**: Age like Stripe or Linear, not like a Dribbble trend

**Validation Checklist (Before Any Change Ships):**
- 8-Hour Test: Would this feel right after a full workday?
- Boardroom Test: Would a CMO show this to a CEO?
- Interruption Test: Can users re-orient in under 2 seconds?
- Minimum Spec Test: Smooth on a 5-year-old laptop with 40 tabs?
- Reduced Motion Test: Fully usable without animation?

**Explicitly NOT in Phase-1 (Hold in Mind):**
- Three-state AI presence system
- Contextual AI tile highlighting
- Progressive disclosure hover-depth layers
- AI confidence metrics or source explainability
- Minimap / zoom indicators