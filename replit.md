# StoryFlix - Interactive Narrative Platform

## Overview
StoryFlix is an interactive narrative platform offering daily "story cards" and monetizing through AI character chat. Its purpose is to deliver engaging, serialized narratives. The core loop involves daily story drops, interactive character chat, clue tracking, sharing short video clips, and returning for the next installment. The platform supports AI-driven image and video generation, ensuring narrative consistency through source-guardrails, and offers flexible content distribution.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions
- **Mobile-first Design**: Optimized for phone viewing with vertical story cards.
- **Styling**: TailwindCSS with shadcn/ui component library (New York style) for a consistent and modern look.
- **Animations**: Framer Motion for dynamic card reveal effects and transitions, enhancing user engagement.

### Technical Implementations
- **Frontend**: React with TypeScript, Vite, Wouter for routing, TanStack React Query for server state, and React Context for global state.
- **Backend**: Node.js with Express, RESTful API, Passport.js for authentication with local strategy and express-session.
- **AI Integration**:
    - **Kling AI Video Generation**: Supports `text-to-video` and `image-to-video` modes with various quality models (kling-v1 to kling-v2-master).
    - **Engine-Generated Images**: AI image generation based on universe-defined visual styles and card-specific scene descriptions, ensuring consistent visual themes.
    - **TTS Narration**: AI-generated voice narration using OpenAI's TTS API, with configurable voices, speeds, and auto-fill modes (manual, derive from text/captions, AI summarization).

### Feature Specifications
- **Daily Drop Engine**: Scheduled release of story cards.
- **Interactive Chat System (v2)**: Credible, guardrailed AI character chat using a three-layer prompt composition (Universe Policy, Character Profile, Card Overrides) to control personality, knowledge, and conversation flow, preventing hallucination.
- **Source Guardrails System**: Extracts and enforces `coreThemes`, `toneConstraints`, `factualBoundaries`, `exclusions`, `quotableElements`, `sensitiveTopics`, and `creativeLatitude` from source material to ensure AI accuracy and consistency.
- **Export & Distribution**: Supports canonical interactive experience, embeddable interactive experience, and standalone video export with CTAs driving users back to the canonical platform.
- **Soundtrack Management**: Audio library for background music with batch import, metadata editing, and per-universe audio settings (off, continuous).

### System Design Choices
- **Monorepo Structure**: Client, server, and shared code managed within a single repository for streamlined development.
- **Schema Sharing**: Database schema defined once (`shared/schema.ts`) and used by both Drizzle ORM on the server and for client-side type inference.
- **Storage Abstraction**: An interface layer (`server/storage.ts`) for database operations to allow for flexible implementation changes.
- **PWA Ready**: Designed with a mobile-first approach, suitable for progressive web application deployment.

## External Dependencies

### Database
- **PostgreSQL**: Primary data store.
- **connect-pg-simple**: PostgreSQL session store.

### Core Libraries
- **drizzle-orm**: Type-safe ORM for PostgreSQL.
- **drizzle-zod**: Schema validation integration.
- **passport / passport-local**: Authentication middleware.
- **bcrypt**: Password hashing.
- **Kling AI API**: For AI video generation.
- **OpenAI TTS API**: For AI voice narration.
- **R2/S3-compatible object storage**: For storing generated audio files.

### Frontend Libraries
- **@tanstack/react-query**: Server state management.
- **@radix-ui/**: Headless UI primitives.
- **framer-motion**: Animation library.
- **wouter**: Lightweight routing.