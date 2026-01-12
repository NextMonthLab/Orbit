# Phase 2 Acceptance Checklist

## Internal Owner Conversation Layer

**Validation Criteria:** Each item must pass for Phase 2 to be considered complete.

---

## Core Conversation Capabilities

### 1. Owner Can Talk to Their Orbit
- [ ] Authenticated business owner can open a conversation with their Orbit
- [ ] Conversation persists across sessions
- [ ] Owner identity is recognized (not treated as public visitor)

### 2. Orbit Explains Its Understanding
- [ ] When asked, Orbit can describe what it knows about the business
- [ ] Orbit can explain which knowledge tiles exist and their confidence levels
- [ ] Orbit references specific sources when explaining its knowledge

### 3. Owner Can Question Orbit's Understanding
- [ ] Owner can ask "Why do you think X?"
- [ ] Owner can ask "What do you know about [topic]?"
- [ ] Owner can ask "What are you unsure about?"
- [ ] Orbit provides transparent, evidence-based answers

### 4. Owner Can Correct Orbit
- [ ] Owner can say "That's not right, it's actually X"
- [ ] Orbit acknowledges the correction without defensiveness
- [ ] Correction persists and influences future responses
- [ ] Orbit confirms it has updated its understanding

### 5. Owner Can Provide New Information
- [ ] Owner can share new information in plain language
- [ ] Owner can provide URLs for Orbit to learn from
- [ ] Owner can upload documents (if supported)
- [ ] Orbit acknowledges what it learned and asks clarifying questions if needed

---

## Orbit Behaviour (Colleague Test)

### 6. Transparency About Uncertainty
- [ ] Orbit says "I'm not confident about that yet" when appropriate
- [ ] Orbit says "That information seems incomplete" when data is sparse
- [ ] Orbit never claims certainty it doesn't have

### 7. Shows Its Working
- [ ] Orbit can say "Here's what I'm basing this on"
- [ ] Orbit cites sources (URLs, tiles, previous conversations)
- [ ] Evidence is traceable and verifiable

### 8. Calm Reception of Feedback
- [ ] Orbit never becomes defensive when corrected
- [ ] Orbit thanks owner for clarification
- [ ] Corrections are treated as valuable input, not criticism

### 9. Curiosity When Information is Missing
- [ ] Orbit asks relevant follow-up questions
- [ ] Questions are specific, not generic
- [ ] Orbit identifies gaps proactively when discussing topics

---

## Anti-Patterns (Must NOT Happen)

### 10. No Dashboard Creep
- [ ] No settings panels appear for editing knowledge
- [ ] No tile management UI
- [ ] No "edit" buttons on any knowledge display
- [ ] Configuration only happens through conversation

### 11. No Visible Data Structures
- [ ] Owner never sees JSON, IDs, or internal schemas
- [ ] Technical terms are translated to plain language
- [ ] All interaction feels conversational, not administrative

### 12. No Proactive Feature Suggestions
- [ ] Orbit does not suggest "power-ups" or automations
- [ ] Orbit does not upsell features during conversation
- [ ] Focus remains on understanding, not functionality

---

## Experience Quality

### 13. The Colleague Test
- [ ] Interaction feels like talking to a thoughtful new employee
- [ ] Owner would describe the experience as "natural"
- [ ] System feels like it's learning, not being programmed

### 14. Trust Building
- [ ] Owner feels heard when providing corrections
- [ ] Owner feels confident Orbit will remember what was shared
- [ ] Owner understands what Orbit knows and doesn't know

---

## Technical Requirements

### 15. Owner Authentication
- [ ] Only authenticated owners can access owner conversation mode
- [ ] Public visitors cannot trigger owner-mode behaviors
- [ ] Owner mode clearly distinguished from public chat

### 16. Knowledge Persistence
- [ ] Corrections persist to database
- [ ] New information is stored appropriately
- [ ] Changes reflect in future Orbit responses

### 17. Conversation History
- [ ] Owner can review past conversations
- [ ] Context from previous sessions informs current responses
- [ ] No loss of training across sessions

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
| Core Conversation (1-5) | | |
| Orbit Behaviour (6-9) | | |
| Anti-Patterns (10-12) | | |
| Experience Quality (13-14) | | |
| Technical Requirements (15-17) | | |

**Phase 2 Complete:** [ ] Yes / [ ] No

**Date:** ___________
