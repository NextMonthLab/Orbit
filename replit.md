# Orbit – Project Operating Context

## Project Overview

Orbit is a **conversational intelligence layer** for businesses.

**Orbit is NOT:**
- A website builder
- A traditional dashboard
- A navigation system

**Orbit IS:**
- A conversational intelligence that understands a business holistically
- A system where information is organised into knowledge nodes (tiles)
- A layer that allows users to explore, interrogate, and shape intelligence through conversation

**Primary interaction model: Chat-first, not click-first.**

## Execution State

### Phase 1: Mental Model & Orientation Layer — COMPLETE ✓

Phase 1 established:
- Orbit is a living intelligence, not a menu
- Tiles represent knowledge nodes, not navigation
- Tile movement reflects conversational relevance
- Chat is the primary mode of interaction
- Users are oriented before any control is introduced

**Phase 1 is LOCKED. Do not redesign, reinterpret, or add new onboarding metaphors.**

### Phase 2: Internal Owner Conversation Layer — COMPLETE ✓

Phase 2 established:
- Business owners can talk directly to their Orbit
- Ask how Orbit understands their business
- Question emphasis, gaps, or inaccuracies
- Correct Orbit conversationally
- Provide new information via chat (URLs, uploads, explanations)

**Core Principle (Non-Negotiable):**
Owners do not "edit Orbit". They **train it through conversation**, the same way they would onboard a new employee.

**Phase 2 is LOCKED. Do not add configuration dashboards, complex settings, or manual tile manipulation.**

### Phase 3: Knowledge ↔ Visual Binding — COMPLETE ✓

Phase 3 established:
- Knowledge nodes bind to visual representations
- Tiles reflect understanding through visual consistency
- Changes in knowledge cascade to visual updates

**Phase 3 is LOCKED.**

### Phase 4: Scoped Node Refinement Layer — COMPLETE ✓

Phase 4 established:
- Owners can focus on individual knowledge nodes (tiles)
- Scoped conversations only affect that node by default
- Cross-node impact detection with explicit confirmation
- Refinement types: emphasis, framing, audience, relationship, meaning, timing
- Refinement scopes: local (default), similar_nodes, global
- Refinement statuses: tentative, confirmed, applied, reverted
- Tabbed OwnerPane with Refine/Visual toggle

**Core Principle:** Safe experimentation with explicit confirmation before widening scope.

**Phase 4 is LOCKED.**

### Phase 5: Intelligent Leverage & Suggestion Layer — COMPLETE ✓

Phase 5 established:
- Orbit can detect meaningful patterns across the whole business
- Orbit identifies gaps, imbalances, and opportunities
- Orbit suggests improvements calmly and selectively
- Orbit offers leverage, not instructions
- Orbit always defers final judgment to the owner

**Insight Types:**
- Pattern (repeated questions, disproportionate attention)
- Opportunity (underrepresented offers, unlinked nodes)
- Clarity (conflicting information, mixed signals)
- Engagement (high/low performing content)
- Gap (missing information, unanswered questions)
- Alignment (visual/strategic misalignment)

**Surfacing Rules:**
- Insights only appear when owner explicitly asks or views dedicated pane
- Orbit never interrupts active refinement or conversation
- "No" is always a valid, respected answer
- Dismissed suggestions are not aggressively repeated
- Silence is better than noise

**Core Principle:** Orbit is a sharp strategist who waits until the room is quiet before speaking.

**Phase 5 is LOCKED. This completes the core Orbit system.**

### Behavioural Expectations for Orbit

Orbit must behave like a thoughtful internal colleague:
- Transparent about uncertainty
- Calm and receptive to correction
- Curious when information is missing
- Never defensive
- Never overly confident

Orbit should say things like:
- "I'm not confident about that yet"
- "That information seems incomplete"
- "Here's what I'm basing this on"

**Trust > Cleverness**

## User Preferences

- Prefer simple language and clear, concise explanations
- Value iterative development; ask before major changes
- Do not modify `shared/schema.ts` without explicit approval (single source of truth)
- Default to conversation-first simplicity when ambiguous

## ICE Maker Context

ICE Maker (Interactive Content Experiences) exists as a separate but related product.

**For this project:**
- ICE Maker functionality has been intentionally stripped down
- ICE Maker is NOT the current focus
- Orbit must still be architected with ICE awareness (ICEs are part of Orbit's knowledge universe)
- Do NOT reintroduce or rebuild ICE Maker features unless explicitly instructed

## System Architecture

**Frontend:** React 18, Vite, TailwindCSS (shadcn/ui), Wouter, TanStack Query  
**Backend:** Node.js, Express, Drizzle ORM, Neon-backed PostgreSQL, Passport.js  
**AI:** OpenAI API (gpt-4o-mini) via Replit AI Integrations  
**Payments:** Stripe via Replit connector  
**Email:** Resend via Replit connector  
**Storage:** Replit Object Storage (R2/S3-compatible)

### Key Architectural Patterns

- **Schema-First Development**: `shared/schema.ts` defines all data models
- **Storage Abstraction**: Database operations via `IStorage` interface
- **Three-Layer Chat Prompt Composition**: Universe Policy + Character Profile + Card Overrides
- **Multi-Tenant Security**: HMAC-SHA256 signed access tokens, per-IP rate limiting
- **Business-Type-Aware Chat**: Orbit chat adjusts prompts based on business type
- **Shared Orbit Chat Service**: Consolidated in `server/services/orbitChatService.ts`

### Orbit Core Features (Preserved)

- **Website Intelligence Integration**: URL ingestion, crawls up to 5 pages, generates topic tiles
- **Knowledge Coach System**: Weekly AI-powered questions to fill knowledge gaps
- **Tone of Voice System**: Analyzes content to generate brand voice profiles
- **Auto-Testimonial Capture**: AI-powered sentiment analysis on chat conversations
- **Orbit Settings**: `/orbit/:slug/settings` with business configuration
- **Orbit Type Doctrine**: 'industry' vs 'standard' orbits with different ownership models

### Demo Orbits (Flagship Examples)

Three fully-seeded demo Orbits showcase Orbit's capabilities:

**Slice & Stone Pizza** (`/orbit/slice-and-stone-pizza`)
- 61 boxes: 40+ menu items, delivery zones, deals, 10+ problem FAQs
- 4 documents: allergen guide, delivery zones, complaints policy, holiday hours
- Covers: late delivery, refunds, allergies, weather closures

**Clarity Chartered Accountants** (`/orbit/clarity-chartered-accountants`)
- 37 boxes: tiered packages (all turnover bands), team, FAQs
- 5 documents: tax deadlines, Ltd vs sole trader, onboarding, penalties, IR35
- Covers: missed deadlines, switching accountants, tax advice boundaries

**TechVault UK** (`/orbit/techvault-uk`)
- 60 boxes: 40+ products, 10+ device comparisons, grading, FAQs
- 5 documents: grading guide, warranty/returns, trade-in, comparisons, sustainability
- Covers: battery health, Consumer Rights Act, damaged trade-ins

Seed script: `server/scripts/seedDemoOrbits.ts` (idempotent)
Admin endpoint: `POST /api/admin/seed-demo-orbits`

### Subscription & Payments

- **Stripe Subscription System**: Full billing with webhook sync
- **Tiered Capability Model**: Free, Grow, Understand, Intelligence tiers
- **Guest-First Conversion**: Users experience value before identity/payment

## Decision Priority Order

When making decisions, prioritise:
1. Conversational clarity over UI cleverness
2. Trust over automation
3. Owner confidence over feature density
4. Future extensibility without premature complexity

## End Goal (Phase 2)

At the end of Phase 2, an internal user should feel:

> "This understands my business – and I can correct it just by talking."

If the system feels like software rather than a colleague, it has gone too far.
