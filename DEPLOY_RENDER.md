# Orbit → Render Deployment Guide

## Section 0: Architecture Summary

### Overview

**Orbit Architecture Type:** **Option A - Single Node Service**

Orbit is a monolithic full-stack application where:
- A single Express server serves both the API and the pre-built frontend
- Background jobs run in the same process via `setInterval`
- Frontend is built with Vite and served as static files from `dist/public`

### Technology Stack

| Component | Technology | Notes |
|-----------|------------|-------|
| **Frontend Framework** | React 19 + Vite | Build output: `dist/public` |
| **Backend Framework** | Express.js | Single entry: `server/index.ts` |
| **Database** | PostgreSQL (via Drizzle ORM) | Neon-backed in Replit |
| **ORM** | Drizzle ORM | Schema: `shared/schema.ts` |
| **File Storage** | S3-compatible (Replit Object Storage / AWS S3) | Uses `@aws-sdk/client-s3` |
| **Session Store** | PostgreSQL (connect-pg-simple) / MemoryStore | Memory fallback in dev |
| **AI Provider** | OpenAI API | gpt-4o-mini |
| **Payments** | Stripe | Webhooks + subscriptions |
| **Email** | Resend | Transactional emails |
| **Node Version** | Node.js 20+ (ES Modules) | `"type": "module"` in package.json |

### Build System

```bash
# Development
npm run dev        # NODE_ENV=development tsx server/index.ts

# Production Build
npm run build      # Runs script/build.ts:
                   #   1. Vite builds frontend → dist/public
                   #   2. esbuild bundles server → dist/index.cjs

# Production Start
npm run start      # NODE_ENV=production node dist/index.cjs
```

### Background Jobs (In-Process)

Orbit uses `setInterval` for scheduled background work (runs in same process):

| Job | File | Interval | Purpose |
|-----|------|----------|---------|
| Archive Expired Previews | `server/jobs/archiveExpiredPreviews.ts` | 1 hour | Archives expired orbit previews |
| Weekly Knowledge Coach | `server/jobs/weeklyKnowledgeCoach.ts` | 7 days | Generates AI prompts for orbit owners |

### Ingestion Logic

Located in `server/services/`:
- `ingestionV2.ts` - Main website ingestion pipeline
- `deepScraper.ts` - Deep scraping with Puppeteer
- `topicTileGenerator.ts` - AI-powered topic extraction
- `documentProcessor.ts` - PDF/document processing
- `catalogueDetection.ts` - Product catalogue extraction

### Embeddings / Vector DB

**Status: NOT IMPLEMENTED**

Orbit does NOT currently use embeddings or vector databases. All AI chat uses direct OpenAI API calls with context from structured data.

---

## Section 1: Replit-Specific Couplings

### Files with Replit Dependencies

| File | Dependency | Impact |
|------|------------|--------|
| `server/index.ts` | `REPLIT_CONNECTORS_HOSTNAME`, `REPL_IDENTITY` | Stripe connector detection |
| `server/startup.ts` | `REPLIT_CONNECTORS_HOSTNAME`, `REPL_IDENTITY` | Platform detection |
| `server/stripeClient.ts` | `stripe-replit-sync` | Managed Stripe integration |
| `server/services/email/emailClient.ts` | Resend connector | Email integration |
| `vite.config.ts` | `REPL_ID`, Replit plugins | Dev-only plugins |

### What Changes for Render?

**Good News:** No code changes required! The existing code already supports both Replit and standard deployments.

| Integration | On Replit | On Render |
|-------------|-----------|-----------|
| **Stripe** | Auto-managed via Replit connector | Set `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` env vars, configure webhook URL in Stripe Dashboard |
| **Email** | Auto-managed via Resend connector | Set `RESEND_API_KEY` env var |
| **Object Storage** | Replit Object Storage | Set `AWS_*` env vars for S3-compatible storage |
| **Session Store** | Works with both | Already supports PostgreSQL-backed sessions |

**Vite plugins** (`cartographer`, `dev-banner`) are conditionally loaded only when `REPL_ID` is set, so they're automatically disabled on Render.

---

## Section 2: Render Deployment Architecture

### Selected: Option A - Single Web Service

**Justification:**
- Background jobs are lightweight (hourly/weekly intervals)
- Jobs run via `setInterval` and don't block the event loop
- No heavy compute (embeddings not used)
- Simpler operations, lower cost
- Single service means coordinated deploys

### Render Configuration

| Setting | Value |
|---------|-------|
| **Service Type** | Web Service |
| **Environment** | Node |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm run start` |
| **Health Check Path** | `/api/health` |
| **Auto-Deploy** | From `main` branch |

### render.yaml (Updated)

```yaml
services:
  - type: web
    name: orbit
    runtime: node
    plan: starter
    buildCommand: npm install && npm run build
    startCommand: npm run start
    healthCheckPath: /api/health
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        sync: false  # Set manually from Render Postgres
      - key: SESSION_SECRET
        generateValue: true
      - key: PUBLIC_TOKEN_SECRET
        generateValue: true
      - key: STRIPE_SECRET_KEY
        sync: false
      - key: STRIPE_WEBHOOK_SECRET
        sync: false
      - key: OPENAI_API_KEY
        sync: false
      - key: RESEND_API_KEY
        sync: false
      - key: APP_URL
        sync: false  # e.g., https://orbit.onrender.com
      - key: AWS_ACCESS_KEY_ID
        sync: false
      - key: AWS_SECRET_ACCESS_KEY
        sync: false
      - key: AWS_REGION
        value: eu-west-2
      - key: AWS_S3_BUCKET
        sync: false

databases:
  - name: orbit-db
    plan: starter
    databaseName: orbit
    user: orbit
```

---

## Section 3: Runtime + Scripts

### package.json Scripts (Current)

```json
{
  "scripts": {
    "dev": "NODE_ENV=development tsx server/index.ts",
    "build": "tsx script/build.ts",
    "start": "NODE_ENV=production node dist/index.cjs",
    "db:push": "drizzle-kit push"
  }
}
```

**Status:** ✅ Scripts are Render-compatible

### Port Binding

Server binds to `process.env.PORT` (Render provides this):
- Located in `server/index.ts` line ~200
- Falls back to 5000 for local dev

### Node Version

**Recommendation:** Lock Node version in package.json:

```json
{
  "engines": {
    "node": ">=20.0.0"
  }
}
```

---

## Section 4: Background Job Strategy

### Current Implementation

Jobs run in-process using `setInterval`:

| Job | Current Behavior | Render Behavior |
|-----|------------------|-----------------|
| Archive Previews | Runs every 1 hour | ✅ Works (same process) |
| Knowledge Coach | Runs every 7 days | ✅ Works (same process) |

### On-Demand Ingestion

Website ingestion is triggered by HTTP request:
- `POST /api/orbit/generate` - Starts ingestion
- Uses Puppeteer for page scraping
- Runs synchronously (can take 30-60 seconds)

**Risk:** Long-running HTTP requests may timeout (Render default: 30s)

### Recommendations

1. **Increase Render timeout** - Set to 120 seconds for ingestion routes
2. **Add job queue** (future) - For heavy workloads, consider BullMQ + Redis
3. **Monitor job execution** - Add structured logging for job runs

---

## Section 5: Database + Storage

### Primary Database: PostgreSQL

**Schema Location:** `shared/schema.ts`

**Key Tables:**
- `users` - User accounts
- `creator_profiles` - Subscription/payment info
- `orbit_meta` - Orbit configuration
- `orbit_boxes` - Knowledge tiles/nodes
- `orbit_documents` - Uploaded documents
- `preview_instances` - Website previews
- `leads` - Captured leads
- `orbit_conversations` - Chat history

### Migration Strategy

**Current:** Drizzle Kit with `db:push` command

```bash
npm run db:push  # Pushes schema to database
```

**Recommendation:** Add proper migration files for production:

```bash
npx drizzle-kit generate:pg  # Generate SQL migrations
```

### Vector Storage

**Status:** NOT USED

Orbit does not currently use embeddings or vector databases.

---

## Section 6: File + Media Storage

### Current Implementation

Orbit uses S3-compatible object storage:
- **Package:** `@aws-sdk/client-s3`
- **In Replit:** Replit Object Storage
- **Files Stored:**
  - Scraped page screenshots
  - Uploaded documents
  - Generated thumbnails

### Required for Render

Configure S3-compatible storage (AWS S3, Cloudflare R2, etc.):

```bash
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=eu-west-2
AWS_S3_BUCKET=orbit-storage
```

### Storage Paths

| Type | Path Pattern |
|------|--------------|
| Public assets | `public/{orbitSlug}/...` |
| Private files | `.private/{orbitSlug}/...` |

---

## Section 7: Environment Variables

### Required Variables

| Variable | Required | Example | Notes |
|----------|----------|---------|-------|
| `NODE_ENV` | Yes | `production` | Must be "production" in prod |
| `DATABASE_URL` | Yes | `postgres://user:pass@host:5432/db` | PostgreSQL connection string |
| `SESSION_SECRET` | Yes | `random-64-char-string` | Session encryption |
| `PUBLIC_TOKEN_SECRET` | Yes | `random-64-char-string` | Public access tokens |
| `APP_URL` | Yes | `https://orbit.onrender.com` | Public app URL |

### Payment & Email

| Variable | Required | Notes |
|----------|----------|-------|
| `STRIPE_SECRET_KEY` | For payments | Stripe API key |
| `STRIPE_WEBHOOK_SECRET` | For payments | Webhook signature verification |
| `RESEND_API_KEY` | For email | Resend API key |
| `EMAIL_FROM_ADDRESS` | Optional | Default: `hello@nextmonth.io` |

### AI Integration

| Variable | Required | Notes |
|----------|----------|-------|
| `OPENAI_API_KEY` | Yes | OpenAI API key for chat/ingestion |

### Object Storage (S3-compatible)

| Variable | Required | Notes |
|----------|----------|-------|
| `AWS_ACCESS_KEY_ID` | For storage | S3 access key |
| `AWS_SECRET_ACCESS_KEY` | For storage | S3 secret key |
| `AWS_REGION` | For storage | e.g., `eu-west-2` |
| `AWS_S3_BUCKET` | For storage | Bucket name |

---

## Section 8: Frontend Routing + API Boundaries

### API Routes

All API routes prefixed with `/api/`:
- `/api/health` - Health check
- `/api/auth/*` - Authentication
- `/api/orbit/*` - Orbit CRUD
- `/api/stripe/webhook` - Stripe webhooks

### Frontend Routes (SPA)

Handled by client-side router (wouter):
- `/` - Home
- `/orbit/:slug` - Public orbit view
- `/orbit/:slug/hub` - Owner dashboard
- `/login`, `/register` - Auth pages

### Static Serving

Express serves static files from `dist/public` with SPA fallback:
- All non-API routes return `index.html`
- Deep links work correctly

### CORS

Not needed - single origin architecture.

---

## Section 9: Production Safety

### Health Check

**Endpoint:** `GET /api/health`

Returns:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Startup Validation

Located in `server/startup.ts`:
- Validates required environment variables
- Warns about missing optional variables
- Exits with error in production if critical vars missing

### Rate Limiting

Located in `server/rateLimit.ts`:
- Analytics: 100 req/min per IP
- Chat: 30 req/min per user
- Ingestion: 10 req/min per IP

### Logging

- Structured logging with timestamps
- Secrets are never logged
- Job execution is logged

---

## Section 10: Deployment Steps

### Prerequisites

1. Create Render account
2. Create PostgreSQL database in Render
3. Set up S3-compatible object storage
4. Configure Stripe webhook URL

### Deployment

1. Connect GitHub repository to Render
2. Create new Web Service
3. Configure environment variables (see Section 7)
4. Set build command: `npm install && npm run build`
5. Set start command: `npm run start`
6. Set health check: `/api/health`
7. Deploy

### Post-Deployment

1. Run database migrations: `npm run db:push`
2. Configure Stripe webhook URL in Stripe Dashboard
3. Test ingestion flow
4. Verify background jobs are running

---

## Section 11: Open Risks & Decisions

### Known Risks

1. **Long-running ingestion** - May timeout on Render's 30s default
   - Mitigation: Increase timeout to 120s

2. **Puppeteer in production** - May need larger instance
   - Mitigation: Use Starter or Standard plan

3. **Background jobs on restart** - Jobs restart with server
   - Mitigation: Jobs are idempotent and self-recovering

### Decisions Needed

1. **S3 provider** - AWS S3 vs Cloudflare R2 vs other?
2. **Instance size** - Starter vs Standard for Puppeteer?
3. **Domain** - Custom domain configuration?

---

## Section 12: Validation Checklist

Use this checklist before and after deploying to Render:

### Pre-Deployment (Local Testing)

- [ ] Production build runs locally: `npm run build && npm run start`
- [ ] Server starts with env vars only (no Replit connectors)
- [ ] Health check returns 200: `curl http://localhost:5000/api/health`
- [ ] All required env vars documented in `.env.example`

### Post-Deployment (Render)

- [ ] Service deploys without build errors
- [ ] Health check returns 200 on Render URL
- [ ] Database migrations complete: `npm run db:push`
- [ ] Stripe webhook configured in Stripe Dashboard
- [ ] Orbit ingestion works end-to-end (create new orbit from URL)
- [ ] Chat functionality works (ask questions in orbit)
- [ ] Background jobs execute (check logs for archive/coach jobs)
- [ ] Object storage works (file uploads succeed)
- [ ] Email delivery works (magic links send)
- [ ] No data loss on service restart
