# Orbit Unit Economics & Cost Analysis

## Executive Summary

This document provides a complete cost analysis for operating Business Orbit on a per-tenant (claimed business) basis. All costs are categorized into Fixed (baseline), Variable (usage-based), and One-time (setup) costs.

---

## A) Cost Driver Inventory Table

### 1. LLM Calls (OpenAI via Replit AI Integrations)

| Driver | Trigger | Code Location | Model | Max Tokens | Can Cache? | Can Cap? |
|--------|---------|---------------|-------|------------|------------|----------|
| Orbit Chat Response | User sends message | `server/services/orbitChatService.ts:537` | gpt-4o-mini | 300 | Partial (FAQ) | Yes (rate limit) |
| Owner Message Analysis | Owner sends training message | `server/services/orbitChatService.ts:755` | gpt-4o-mini | 200 | No | Yes |
| Scoped Refinement | Owner refines knowledge node | `server/services/orbitChatService.ts:877` | gpt-4o-mini | 500 | No | Yes |
| Intent Detection | Every chat message | `server/services/orbitViewEngine/intentDetector.ts:46` | gpt-4o-mini | 500 | Yes (similar queries) | Yes |
| View Filler | Display Orbit tiles | `server/services/orbitViewEngine/viewFiller.ts:83` | gpt-4o-mini | 2000 | Yes (stable content) | Yes |
| Brand Voice Analysis | First setup / refresh | `server/services/brandVoiceAnalysis.ts:57` | gpt-4o-mini | 1500 | Yes (per tenant) | Yes |
| Knowledge Coach | Weekly prompts (paid tiers) | `server/services/knowledgeCoach.ts:192` | gpt-4o-mini | 1000 | No | Yes (tier limits) |
| Hero Post Enrichment | Social post import | `server/services/heroPostEnrichment.ts:118` | gpt-4o-mini | 1000 | Yes (per post) | Yes |
| Topic Tile Generation | Initial setup / refresh | `server/services/topicTileGenerator.ts:272` | gpt-4o-mini | 4000 | Yes (per crawl) | Yes |
| Proof Capture | Positive sentiment detected | `server/services/proofCapture.ts:163,348,472` | gpt-4o-mini | 150-500 | No | Yes |
| Menu/Service Extraction | Catalogue detection | `server/services/catalogueDetection.ts:1245,1342` | gpt-4o-mini | 3000-4000 | Yes (per page) | Yes |
| Business Data Extraction | Initial ingestion | `server/services/businessDataExtractor.ts:176-369` | gpt-4o-mini | varies | Yes (per crawl) | Yes |
| Bible Generation | Story creation (ICE) | `server/services/bibleGenerator.ts:117` | gpt-4o-mini | 4096 | Yes | Yes |
| Pipeline Runner | Content transformation (ICE) | `server/pipeline/runner.ts:108` | gpt-4o | 4096 | Yes | Yes |
| Smart Site Pipeline | Homepage analysis | `server/smartSitePipeline.ts:228` | gpt-4o-mini | 1500 | Yes | Yes |

### 2. Image Generation (OpenAI gpt-image-1)

| Driver | Trigger | Code Location | Cost/Image | Can Cache? | Can Cap? |
|--------|---------|---------------|------------|------------|----------|
| Image Generation | Tile/asset creation | `server/replit_integrations/image/client.ts:19` | ~$0.04-0.08 | Yes | Yes |
| Image Edit/Composite | Asset editing | `server/replit_integrations/image/client.ts:45` | ~$0.04-0.08 | Yes | Yes |

### 3. Web Scraping (Puppeteer/Headless Chrome)

| Driver | Trigger | Code Location | Pages/Op | Can Cache? | Can Cap? |
|--------|---------|---------------|----------|------------|----------|
| Initial Crawl | Orbit claim/setup | `server/services/deepScraper.ts:475` | 10-25 pages | Yes (24h TTL) | Yes |
| Catalogue Extraction | Menu/service detection | `server/services/catalogueDetection.ts:729` | 10 pages max | Yes | Yes |
| Topic Tile Refresh | Manual refresh | `server/services/topicTileGenerator.ts:150` | 5-15 pages | Yes | Yes |
| High-Signal Extraction | FAQ/about/contact | `server/services/catalogueDetection.ts:1480` | 15 pages max | Yes | Yes |
| Health Check | Orbit health runner | `server/services/orbitHealthRunner.ts:456` | 12-50 pages | Yes | Yes |

### 4. Object Storage (Replit Object Storage / GCS)

| Driver | Trigger | Code Location | Size Est. | Can Cap? |
|--------|---------|---------------|-----------|----------|
| Orbit Pack Storage | Pack save/update | `server/orbitStorage.ts:18` | 10-100KB/pack | Yes |
| Document Upload | Owner uploads PDF/doc | `server/replit_integrations/object_storage/objectStorage.ts:51` | 1-10MB/doc | Yes |
| Generated Images | Tile images | `server/replit_integrations/image/client.ts` | 100KB-1MB/image | Yes |
| Video Exports | Video generation | `server/video/exportService.ts` | 10-100MB/video | Yes |

### 5. Database Operations (PostgreSQL/Neon)

| Driver | Trigger | Code Location | Frequency | Growth |
|--------|---------|---------------|-----------|--------|
| Orbit Boxes (tiles) | Every refresh | `server/storage.ts` | Per crawl | 20-100 rows/tenant |
| Orbit Documents | Owner uploads | `server/storage.ts` | Per upload | 1-20 rows/tenant |
| Chat Conversations | Every chat session | `server/storage.ts` | High | 50-500 rows/tenant/month |
| Knowledge Prompts | Weekly (paid tiers) | `server/storage.ts` | Weekly | 3-5 rows/week |
| Hero Posts | Social import | `server/storage.ts` | Per import | 10-100 rows/tenant |
| Insights/Suggestions | Background analysis | `server/services/insightDetectionService.ts` | Background | 5-20 rows/tenant |

### 6. Scheduled Jobs

| Job | Frequency | Code Location | Cost Driver |
|-----|-----------|---------------|-------------|
| Weekly Knowledge Coach | 7 days | `server/jobs/weeklyKnowledgeCoach.ts` | LLM tokens (1000/tenant) |
| Archive Expired Previews | 1 hour | `server/jobs/archiveExpiredPreviews.ts` | DB queries only |
| Scrape Cache Cleanup | Background | `server/services/scrapeCache.ts` | Storage I/O |

---

## B) Instrumentation Plan

### Metrics to Log

```typescript
// Token tracking (add to every OpenAI call)
interface TokenMetrics {
  endpoint: string;           // 'chat', 'owner', 'refinement', etc.
  tenantSlug: string;
  model: string;
  tokensIn: number;
  tokensOut: number;
  timestamp: Date;
  cached: boolean;
}

// Crawl tracking
interface CrawlMetrics {
  tenantSlug: string;
  pagesRequested: number;
  pagesSucceeded: number;
  totalBytes: number;
  duration: number;
  trigger: 'setup' | 'refresh' | 'catalogue';
  timestamp: Date;
}

// Storage tracking
interface StorageMetrics {
  tenantSlug: string;
  operation: 'upload' | 'download' | 'delete';
  objectType: 'pack' | 'document' | 'image' | 'video';
  bytes: number;
  timestamp: Date;
}
```

### Implementation Locations

| Metric | File | Function | Event |
|--------|------|----------|-------|
| tokens_in/out | `server/services/orbitChatService.ts` | `generateChatResponse` | After every completion |
| tokens_in/out | `server/services/topicTileGenerator.ts` | `generateTopicTilesFromCrawl` | After tile generation |
| pages_fetched | `server/services/deepScraper.ts` | `multiPageCrawl` | After crawl complete |
| embeddings_count | N/A (not currently used) | - | - |
| vector_queries | N/A (not currently pgvector) | - | - |
| storage_bytes | `server/orbitStorage.ts` | `storeOrbitPack` | After save |
| uploads | `server/replit_integrations/object_storage/objectStorage.ts` | `uploadBuffer` | After upload |
| cache_hits | `server/services/scrapeCache.ts` | `getCachedCrawl` | On cache check |

---

## C) Per-tenant Cost Model (Monthly)

### Pricing Assumptions

| Resource | Cost | Source |
|----------|------|--------|
| gpt-4o-mini input | $0.15 / 1M tokens | OpenAI pricing |
| gpt-4o-mini output | $0.60 / 1M tokens | OpenAI pricing |
| gpt-4o input | $2.50 / 1M tokens | OpenAI pricing |
| gpt-4o output | $10.00 / 1M tokens | OpenAI pricing |
| gpt-image-1 | $0.04 / image | OpenAI pricing |
| Object Storage | $0.023 / GB / month | Replit/GCS pricing |
| Neon DB | $0.09 / compute-hour | Neon pricing (free tier covers most) |
| Puppeteer compute | ~$0.001 / page | Estimate (Replit compute) |

### Usage Tier Definitions

| Tier | Description | Chat Sessions | Refreshes | Uploads | Images |
|------|-------------|---------------|-----------|---------|--------|
| **Low** | Claimed but light use | 10/month | 1/month | 0 | 0 |
| **Medium** | Weekly active | 50/month | 2/month | 2 | 5 |
| **High** | Daily active + team | 200/month | 8/month | 10 | 20 |

### Cost Breakdown (Monthly per Tenant)

#### LOW TIER ($0.15 - $0.50/month)

| Component | Units | Cost/Unit | Monthly | Notes |
|-----------|-------|-----------|---------|-------|
| Chat responses | 10 msgs x 500 tokens out | $0.60/1M | $0.003 | gpt-4o-mini |
| Chat context | 10 msgs x 2000 tokens in | $0.15/1M | $0.003 | Context building |
| Initial crawl (amortized) | 15 pages / 12 months | $0.001/page | $0.001 | Puppeteer |
| Storage | 500KB pack + 0 docs | $0.023/GB | $0.00001 | Object storage |
| Database | 50 rows growth | Free tier | $0.00 | Neon free |
| **TOTAL LOW** | | | **$0.01 - $0.10** | |

#### MEDIUM TIER ($1.50 - $3.00/month)

| Component | Units | Cost/Unit | Monthly | Notes |
|-----------|-------|-----------|---------|-------|
| Chat responses | 50 msgs x 500 tokens out | $0.60/1M | $0.015 | |
| Chat context | 50 msgs x 2000 tokens in | $0.15/1M | $0.015 | |
| Intent detection | 50 x 200 tokens | $0.15/1M | $0.002 | |
| Knowledge Coach | 3 questions x 1000 tokens | $0.60/1M | $0.002 | Grow tier |
| Refresh crawl | 2 x 15 pages | $0.001/page | $0.03 | |
| Tile generation | 2 x 4000 tokens | $0.60/1M | $0.005 | |
| Document upload/extract | 2 docs x 2000 tokens | $0.60/1M | $0.002 | |
| Image generation | 5 images | $0.04/image | $0.20 | |
| Storage | 2MB average | $0.023/GB | $0.00005 | |
| **TOTAL MEDIUM** | | | **$0.30 - $0.50** | |

#### HIGH TIER ($5.00 - $15.00/month)

| Component | Units | Cost/Unit | Monthly | Notes |
|-----------|-------|-----------|---------|-------|
| Chat responses | 200 msgs x 500 tokens out | $0.60/1M | $0.06 | |
| Chat context | 200 msgs x 3000 tokens in | $0.15/1M | $0.09 | Richer context |
| Intent detection | 200 x 200 tokens | $0.15/1M | $0.006 | |
| View filler | 50 x 2000 tokens | $0.60/1M | $0.06 | |
| Knowledge Coach | 5 questions x 1000 tokens | $0.60/1M | $0.003 | Intelligence tier |
| Proof capture | 20 x 500 tokens | $0.60/1M | $0.006 | |
| Refresh crawl | 8 x 15 pages | $0.001/page | $0.12 | |
| Tile generation | 8 x 4000 tokens | $0.60/1M | $0.02 | |
| Catalogue extraction | 4 x 4000 tokens | $0.60/1M | $0.01 | |
| Document upload/extract | 10 docs x 3000 tokens | $0.60/1M | $0.02 | |
| Image generation | 20 images | $0.04/image | $0.80 | |
| Owner refinements | 30 x 500 tokens | $0.60/1M | $0.009 | |
| Insight detection | 4 x 2000 tokens | $0.60/1M | $0.005 | |
| Storage | 10MB average | $0.023/GB | $0.0002 | |
| Database | 500 rows growth | ~$0.05 | $0.05 | May exceed free tier |
| **TOTAL HIGH** | | | **$1.30 - $2.00** | |

### Summary Table

| Tier | Estimated Cost | Recommended Price | Gross Margin |
|------|----------------|-------------------|--------------|
| Low (Free) | $0.05/mo | $0 | N/A (loss leader) |
| Medium (Grow) | $0.40/mo | $19-29/mo | 97-98% |
| High (Intelligence) | $1.50/mo | $49-99/mo | 96-98% |

---

## D) Worst-case Exposure & Guardrails

### Maximum Exposure Scenarios

| Abuse Vector | Potential Cost | Current Protection |
|--------------|----------------|-------------------|
| Chat hammering (1000 msgs/day) | $3-5/day | 30 msgs/min rate limit |
| Repeated refresh spam | $0.50/refresh | No limit currently |
| Large file uploads (100MB each) | Storage growth | No limit currently |
| Image generation abuse | $0.04-0.08/image | No limit currently |

### Recommended Guardrails

#### 1. Rate Limits (Already Implemented)

```typescript
// server/rateLimit.ts
chatRateLimiter: 30 requests/minute per IP
analyticsRateLimiter: 100 requests/minute per IP
activationRateLimiter: 10 requests/minute per IP
```

#### 2. Refresh Limits (NEEDS IMPLEMENTATION)

| Tier | Refreshes/Month | Auto-refresh |
|------|-----------------|--------------|
| Free | 1 | None |
| Grow | 4 | None |
| Intelligence | 12 | Weekly |

#### 3. Upload Limits (NEEDS IMPLEMENTATION)

| Tier | Documents | Total Storage | Max File Size |
|------|-----------|---------------|---------------|
| Free | 3 | 10MB | 2MB |
| Grow | 10 | 50MB | 10MB |
| Intelligence | 50 | 200MB | 25MB |

#### 4. Image Generation Limits (NEEDS IMPLEMENTATION)

| Tier | Images/Month |
|------|--------------|
| Free | 0 |
| Grow | 10 |
| Intelligence | 50 |

#### 5. Chat Token Budget (NEEDS IMPLEMENTATION)

| Tier | Tokens/Month |
|------|--------------|
| Free | 50,000 |
| Grow | 250,000 |
| Intelligence | 1,000,000 |

### Pricing Trigger Thresholds

Upgrade prompts should trigger when:
- Free tier: >10 chat sessions OR refresh attempt >1
- Grow tier: >100 chat sessions OR >5 document uploads OR image generation attempt
- Intelligence tier: Team member invite OR API access request

### Caching Strategy

| Resource | Cache Duration | Implementation |
|----------|----------------|----------------|
| Web crawls | 24 hours | `server/services/scrapeCache.ts` |
| FAQ responses | 1 hour | Add to chat service |
| Tile generation | Until refresh | Current behavior |
| Brand voice | Until social refresh | Current behavior |
| Intent detection | 5 minutes (same query) | Add to intent detector |

---

## Implementation Priority

1. **HIGH**: Add token counting/logging to all LLM calls
2. **HIGH**: Implement refresh rate limits per tier
3. **HIGH**: Implement storage/upload limits per tier
4. **MEDIUM**: Add chat token budget tracking
5. **MEDIUM**: Implement image generation limits
6. **LOW**: Add response caching for common queries

---

## Appendix: Current Rate Limit Configuration

From `server/rateLimit.ts`:
- Analytics: 100/minute per IP
- Activation: 10/minute per IP
- Chat: 30/minute per IP

From `server/index.ts` security checks:
- Token expiry: 3600 seconds (1 hour)
- Rate limiting enabled for all endpoints
