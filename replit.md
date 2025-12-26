# NextScene - Meaning-to-Experience Engine

## Overview
NextScene is a meaning-to-experience engine designed to transform structured content (scripts, PDFs, websites) into cinematic, interactive story cards. It targets brand storytelling, creative storytelling, and knowledge/learning by offering features such as AI-generated visuals, guardrailed AI character chat, a Visual Bible system for consistency, TTS narration, and a Daily Drop Engine for content release. The platform supports role-based access and subscription tiers.

## User Preferences
I prefer simple language and clear, concise explanations. I value iterative development and prefer to be asked before major changes are made to the codebase. Please provide detailed explanations when new features or significant modifications are implemented. Do not make changes to the `shared/schema.ts` file without explicit approval, as it is the single source of truth for data models. Ensure that any AI-generated content adheres to the established visual bible system and character profiles for consistency.

## System Architecture
NextScene utilizes a React 18 frontend with Vite, TailwindCSS (New York style shadcn/ui components), Wouter for routing, and TanStack Query for state management. The backend is built with Node.js and Express, using Drizzle ORM for type-safe PostgreSQL interactions (Neon-backed on Replit) and Passport.js for authentication.

Key architectural patterns include:
- **Schema-First Development**: `shared/schema.ts` defines all data models using Drizzle, generating insert schemas and types for both client and server.
- **Storage Abstraction**: All database operations are routed through an `IStorage` interface (`server/storage.ts`) to maintain thin route handlers and allow flexible implementation changes.
- **Three-Layer Chat Prompt Composition**: AI chat prompts are composed from a Universe Policy (global guardrails), Character Profile (personality, knowledge), and Card Overrides (scene-specific context).
- **Visual Bible System**: Ensures visual consistency across AI generations using a Design Guide (art style, color palette), Reference Assets (images), and a Prompt Builder that merges all relevant context.
- **Lens-Based User Experience**: Users select a "lens" (Brand, Creative, Knowledge) during onboarding, which customizes their experience, content transformation defaults, and marketing messages.

The UI/UX design emphasizes a cinematic feel with a dark theme. Typography uses Cinzel for headlines and Inter for body text. The color palette features a black background with a pink-purple-blue gradient accent.

## External Dependencies
- **OpenAI API**: Used for chat completions (gpt-4o-mini) and Text-to-Speech (TTS) narration.
- **Kling AI API**: Directly integrated for video generation.
- **Replicate API**: Provides an alternative platform for video generation using various models.
- **Stripe**: Handles subscription billing and payment processing.
- **Replit Object Storage (R2/S3-compatible)**: Utilized for file storage, replacing local filesystem uploads.