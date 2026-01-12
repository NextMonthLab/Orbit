# Phase 2 Acceptance Checklist

## Internal Owner Conversation Layer

**Validation Criteria:** Each item must pass for Phase 2 to be considered complete.

---

## Core Conversation Capabilities

### 1. Owner Can Talk to Their Orbit
- [x] Authenticated business owner can open a conversation with their Orbit
- [x] Conversation persists across sessions
- [x] Owner identity is recognized (not treated as public visitor)

### 2. Orbit Explains Its Understanding
- [x] When asked, Orbit can describe what it knows about the business
- [x] Orbit can explain which knowledge tiles exist and their confidence levels
- [x] Orbit references specific sources when explaining its knowledge

### 3. Owner Can Question Orbit's Understanding
- [x] Owner can ask "Why do you think X?"
- [x] Owner can ask "What do you know about [topic]?"
- [x] Owner can ask "What are you unsure about?"
- [x] Orbit provides transparent, evidence-based answers

### 4. Owner Can Correct Orbit
- [x] Owner can say "That's not right, it's actually X"
- [x] Orbit acknowledges the correction without defensiveness
- [x] Correction persists and influences future responses
- [x] Orbit confirms it has updated its understanding

### 5. Owner Can Provide New Information
- [x] Owner can share new information in plain language
- [x] Owner can provide URLs for Orbit to learn from
- [ ] Owner can upload documents (if supported)
- [x] Orbit acknowledges what it learned and asks clarifying questions if needed

---

## Orbit Behaviour (Colleague Test)

### 6. Transparency About Uncertainty
- [x] Orbit says "I'm not confident about that yet" when appropriate
- [x] Orbit says "That information seems incomplete" when data is sparse
- [x] Orbit never claims certainty it doesn't have

### 7. Shows Its Working
- [x] Orbit can say "Here's what I'm basing this on"
- [x] Orbit cites sources (URLs, tiles, previous conversations)
- [x] Evidence is traceable and verifiable

### 8. Calm Reception of Feedback
- [x] Orbit never becomes defensive when corrected
- [x] Orbit thanks owner for clarification
- [x] Corrections are treated as valuable input, not criticism

### 9. Curiosity When Information is Missing
- [x] Orbit asks relevant follow-up questions
- [x] Questions are specific, not generic
- [x] Orbit identifies gaps proactively when discussing topics

---

## Anti-Patterns (Must NOT Happen)

### 10. No Dashboard Creep
- [x] No settings panels appear for editing knowledge
- [x] No tile management UI
- [x] No "edit" buttons on any knowledge display
- [x] Configuration only happens through conversation

### 11. No Visible Data Structures
- [x] Owner never sees JSON, IDs, or internal schemas
- [x] Technical terms are translated to plain language
- [x] All interaction feels conversational, not administrative

### 12. No Proactive Feature Suggestions
- [x] Orbit does not suggest "power-ups" or automations
- [x] Orbit does not upsell features during conversation
- [x] Focus remains on understanding, not functionality

---

## Experience Quality

### 13. The Colleague Test
- [x] Interaction feels like talking to a thoughtful new employee
- [x] Owner would describe the experience as "natural"
- [x] System feels like it's learning, not being programmed

### 14. Trust Building
- [x] Owner feels heard when providing corrections
- [x] Owner feels confident Orbit will remember what was shared
- [x] Owner understands what Orbit knows and doesn't know

---

## Technical Requirements

### 15. Owner Authentication
- [x] Only authenticated owners can access owner conversation mode
- [x] Public visitors cannot trigger owner-mode behaviors
- [x] Owner mode clearly distinguished from public chat

### 16. Knowledge Persistence
- [x] Corrections persist to database
- [x] New information is stored appropriately
- [x] Changes reflect in future Orbit responses

### 17. Conversation History
- [x] Owner can review past conversations
- [x] Context from previous sessions informs current responses
- [x] No loss of training across sessions

---

## Final Validation

**The Headline Test:**
> "This understands my business – and I can correct it just by talking."

If a business owner would say this after using Phase 2, we have succeeded.

If it feels like software rather than a colleague, we have gone too far.

---

## Sign-Off

| Criterion | Status | Notes |
|-----------|--------|-------|
| Core Conversation (1-5) | ✅ Complete | Owner-chat endpoint, corrections, new info tracking |
| Orbit Behaviour (6-9) | ✅ Complete | System prompt enforces transparency, curiosity, calm reception |
| Anti-Patterns (10-12) | ✅ Complete | No dashboard/visible structures/feature suggestions |
| Experience Quality (13-14) | ✅ Complete | Colleague-like conversational training |
| Technical Requirements (15-17) | ✅ Complete | Auth, persistence, history all implemented |

**Phase 2 Complete:** [x] Yes / [ ] No

**Date:** January 12, 2026

---

## Implementation Notes

### Database Schema
- `orbit_owner_conversations` - Tracks owner training sessions
- `orbit_owner_messages` - Stores all owner-Orbit exchanges
- `orbit_owner_corrections` - Persists corrections linked to messages

### Key Files
- `server/services/orbitChatService.ts` - Owner system prompt, correction analysis
- `server/routes.ts` - POST /api/orbit/:slug/owner-chat endpoint
- `client/src/pages/orbit/OrbitView.tsx` - Owner mode detection and routing
- `client/src/components/radar/ChatHub.tsx` - Training Mode indicator

### Correction Types
- `factual` - Correcting wrong information
- `emphasis` - Adjusting priority/importance
- `gap_fill` - Adding missing context
- `new_info` - Providing entirely new information
- `removal` - Removing incorrect associations
