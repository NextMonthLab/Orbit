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

### Phase 2: Internal Owner Conversation Layer — CURRENT FOCUS

The sole objective is implementing owner-only conversational mode:
- Business owners can talk directly to their Orbit
- Ask how Orbit understands their business
- Question emphasis, gaps, or inaccuracies
- Correct Orbit conversationally
- Provide new information via chat (URLs, uploads, explanations)

**Core Principle (Non-Negotiable):**
Owners do not "edit Orbit". They **train it through conversation**, the same way they would onboard a new employee.

**Phase 2 must NOT include:**
- Configuration dashboards
- Complex settings
- Visible data structures
- Manual tile manipulation
- Direct tile editing
- Visual or image replacement
- Page or URL reassignment
- Scoped per-tile chat panes
- Analytics dashboards
- Power-ups or automation suggestions

Orbit handles structure internally. The owner speaks in plain language.

### Behavioural Expectations for Orbit (Phase 2)

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
