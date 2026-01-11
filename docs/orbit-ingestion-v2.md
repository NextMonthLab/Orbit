# Orbit Ingestion v2 Specification

## Overview

Orbit Ingestion v2 is an intelligent, respectful website crawler designed for extracting business data from websites. It prioritizes discovery-first strategies, adaptive throttling, and first-class handling of bot protection.

## Design Principles

1. **Respectful Crawling**: Always check robots.txt and respect disallow rules
2. **Discovery-First**: Use sitemap.xml and robots.txt before blind crawling
3. **Adaptive Throttling**: Slow down when friction is detected
4. **Early Stopping**: Halt on repeated friction signals
5. **Evidence-Based**: All operations include audit trail with `nm_ingest` markers

## Ingestion Modes

### Light Mode (≤12 pages)
- Quick scan for simple websites
- Prioritizes key pages: homepage, about, services, contact
- Default delay: 800ms between requests
- Best for: Small business sites, landing pages

### Standard Mode (≤25 pages)
- Thorough scan following discovery sources
- Includes sitemap and robots.txt analysis
- Default delay: 1000ms between requests
- Best for: E-commerce, restaurant menus, service catalogs

### User-Assisted Mode (≤50 pages)
- User provides specific URLs to fetch
- Bypasses discovery phase
- Useful when automated crawling is blocked
- Best for: Sites with bot protection

## Discovery Strategy

### Priority Order
1. **Sitemap.xml**: Parse and extract URLs with intelligent sampling
2. **Robots.txt**: Check for sitemap references and disallow rules
3. **Homepage Links**: Extract internal links with category prioritization

### URL Sampling Categories
- `about` - About pages, team, company info
- `services` - Service offerings, features
- `pricing` - Pricing pages, plans
- `contact` - Contact information
- `menu` - Restaurant menus, food items
- `products` - Product catalogs, items
- `faq` - FAQ pages, help content

## Adaptive Throttling

### Domain Risk Tracking
Each domain maintains a risk score (0-100) that influences crawl behavior:

| Risk Level | Score Range | Base Delay | Behavior |
|------------|-------------|------------|----------|
| Low | 0-20 | 800ms | Normal crawling |
| Medium | 21-50 | 1200ms | Increased caution |
| High | 51-80 | 2000ms | Minimal requests |
| Critical | 81-100 | Block | Skip domain |

### Friction Detection
Signals that increase domain risk:
- HTTP 403 (Forbidden): +20 risk
- HTTP 429 (Rate Limited): +30 risk
- HTTP 503 (Service Unavailable): +15 risk
- Cloudflare Challenge: +25 risk
- Empty/Unusual Responses: +10 risk

### Friction Decay
Risk scores decay by 10% per 24-hour period to allow re-attempts.

## Caching Strategy

### URL-Level Cache
- **TTL**: 24 hours
- **Key**: URL hash
- **Stored**: Content, status code, headers, content hash
- **Change Detection**: Content hash comparison for updates

### Domain-Level Cache
- **Risk Scores**: Persistent across sessions
- **Last Fetch Time**: Rate limiting enforcement
- **Robots.txt Cache**: 24-hour validity

## Evidence Markers

All ingestion responses include `nm_ingest` evidence for audit trails:

```typescript
{
  traceId: string;           // Unique trace identifier
  nm_policyVersion: string;  // Contract version
  nm_ingest: {
    mode: 'light' | 'standard' | 'user_assisted';
    discoverySources: string[];   // ['sitemap', 'robots', 'homepage']
    pagesPlanned: number;
    pagesFetched: number;
    pagesUsed: number;
    cacheHits: number;
    cacheMisses: number;
    outcome: 'success' | 'partial' | 'blocked' | 'error';
    frictionSignals: string[];    // ['403:example.com/admin']
    domainRiskScore: number;
    durationMs: number;
  }
}
```

## Blocked Outcomes

When bot protection prevents crawling, the system:

1. Returns `outcome: 'blocked'` in evidence
2. Displays `BlockedTile` component with guidance
3. Suggests User-Assisted mode
4. Offers manual import option
5. Logs friction for domain risk tracking

## Database Schema

### domain_risk Table
```sql
hostname VARCHAR PRIMARY KEY
risk_score INTEGER DEFAULT 0
friction_events JSONB DEFAULT '[]'
last_fetch_at TIMESTAMP
created_at TIMESTAMP
updated_at TIMESTAMP
```

### url_fetch_cache Table
```sql
url_hash VARCHAR PRIMARY KEY
url TEXT NOT NULL
hostname VARCHAR NOT NULL
content TEXT
status_code INTEGER
headers JSONB
content_hash VARCHAR
fetched_at TIMESTAMP
expires_at TIMESTAMP
```

### ingestion_runs Table
```sql
id SERIAL PRIMARY KEY
trace_id VARCHAR NOT NULL UNIQUE
orbit_slug VARCHAR NOT NULL
mode VARCHAR NOT NULL
started_at TIMESTAMP
completed_at TIMESTAMP
outcome VARCHAR
evidence JSONB
```

## Contract Compliance

All ingestion behavior is verified against `orbitBehaviourContract.v1.1.0`:

| Check ID | Category | Description |
|----------|----------|-------------|
| INGEST_001 | ingestion | nm_ingest evidence markers present |
| INGEST_002 | ingestion | Discovery-first URL acquisition |
| INGEST_003 | ingestion | Robots.txt respect and parsing |
| INGEST_004 | ingestion | Adaptive throttling active |
| INGEST_005 | ingestion | Friction detection with early stop |
| INGEST_006 | ingestion | URL caching with TTL |
| INGEST_007 | ingestion | Mode selector UI available |
| COMPLY_001 | compliance | Bot protection handling |
| COMPLY_002 | compliance | Domain risk tracking |

## API Endpoints

### POST /api/orbit/:slug/ingest
Start ingestion for an Orbit.

**Request:**
```json
{
  "url": "https://example.com",
  "mode": "standard",
  "userUrls": []  // Only for user_assisted mode
}
```

**Response:**
```json
{
  "success": true,
  "tiles": [...],
  "evidence": {
    "traceId": "abc123...",
    "nm_policyVersion": "orbitBehaviourContract.v1.1.0",
    "nm_ingest": {...}
  }
}
```

## Integration Points

### Website Intelligence Tab
The ingestion v2 UI is integrated into `/orbit/:slug/import` as the "Website Intelligence" tab, featuring:
- Mode selector (Light/Standard/Assisted)
- Progress indicators
- Ingestion summary with cache stats
- Blocked tile handling

### Health Dashboard
Ingestion checks are visible in `/admin/orbits/health` with real-time verification of all INGEST_* and COMPLY_* contract items.

## Version History

- **v2.0.0** (January 2026): Initial release with discovery-first strategy
- **v1.0.0** (December 2025): Legacy basic crawler (deprecated)
