# Email and Notifications System

This document covers the transactional email and in-app notification system for NextMonth.

## Overview

NextMonth uses two parallel notification channels:

1. **Email** - Transactional emails for account actions (magic links, confirmations)
2. **In-app notifications** - Real-time alerts within the application

## Email Provider

We use **Resend** for transactional email delivery.

### Configuration Options

| Method | Environment | Details |
|--------|-------------|---------|
| Replit Connector | Replit | Auto-managed via Resend integration |
| Environment Variable | Render/Standard | Set `RESEND_API_KEY` |

### Required Environment Variables (for Render/Standard deployment)

```
RESEND_API_KEY=re_xxxxxxxxxxxx
EMAIL_FROM_ADDRESS=hello@nextmonth.io  # Optional, defaults to hello@nextmonth.io
```

### Startup Verification

On startup, the server logs email configuration status:

```
[Email Configuration]
  - Mode: Standard environment variable
  - RESEND_API_KEY: SET
  - EMAIL_FROM_ADDRESS: hello@nextmonth.io
```

## Email Templates

All templates are in `server/services/email/templates.ts`:

| Template | Purpose | Trigger |
|----------|---------|---------|
| `orbitClaimMagicLink` | Magic link to claim an Orbit | POST /api/orbit/:slug/claim/request |
| `orbitClaimConfirmed` | Confirmation after successful claim | POST /api/orbit/:slug/claim/verify |
| `subscriptionChanged` | Plan upgrade/downgrade/cancel notices | Stripe webhook events |
| `leadCapturedDigest` | Lead notification digest | Scheduled job (future) |

### Template Design

- Dark theme matching NextMonth brand
- Gradient accents (pink-purple-blue)
- Plain text fallback for all emails
- Mobile responsive

## Orbit Claim Flow (Magic Link)

### Flow Diagram

```
1. User enters email on claim page
   ↓
2. POST /api/orbit/:slug/claim/request
   - Validates email format
   - Checks if Orbit is unclaimed
   - Generates secure token (32 bytes, hex)
   - Stores token with 30-minute expiry
   - Sends magic link email
   ↓
3. User clicks link in email
   ↓
4. Frontend loads /orbit/:slug/claim?token=xxx
   ↓
5. POST /api/orbit/:slug/claim/verify
   - Validates token exists and matches slug
   - Checks token not used and not expired
   - Marks token as used (single-use)
   - Claims Orbit for user
   - Sends confirmation email
   ↓
6. User redirected to Orbit dashboard
```

### Security Features

- **Single-use tokens**: Each token can only be used once
- **30-minute expiry**: Short window reduces attack surface
- **Domain matching**: Shows warning if email domain ≠ business domain
- **Free email detection**: Warns users on Gmail, Yahoo, etc.
- **No token in logs**: Only email domain is logged, never full token

### API Endpoints

#### Request Claim

```
POST /api/orbit/:slug/claim/request
Content-Type: application/json

{
  "email": "owner@company.com"
}

Response:
{
  "success": true,
  "domainMatch": true,
  "isFreeEmailDomain": false,
  "message": "Verification email sent! Check your inbox."
}
```

#### Verify Claim

```
POST /api/orbit/:slug/claim/verify
Content-Type: application/json

{
  "token": "abc123..."
}

Response:
{
  "success": true,
  "message": "Orbit claimed successfully!",
  "domainMatch": true
}
```

## In-App Notifications

### Database Schema

```sql
notifications (
  id serial PRIMARY KEY,
  userId integer REFERENCES users(id),
  orbitId integer REFERENCES orbit_meta(id),
  type text NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  actionUrl text NOT NULL,
  meta jsonb,
  severity text DEFAULT 'info',
  isRead boolean DEFAULT false,
  createdAt timestamp,
  sentEmailAt timestamp,
  dedupeKey text
)
```

### Notification Types

| Type | Trigger | Tier Required |
|------|---------|---------------|
| `lead_captured` | New lead submitted | Insight+ |
| `conversation_spike` | 2x daily average conversations | Insight+ |
| `pattern_shift` | Theme or path change detected | Intelligence |
| `friction_detected` | High drop-off at a card | Intelligence |
| `high_performing_ice` | Top ICE engagement weekly | Intelligence |

### API Endpoints

```
GET /api/notifications?limit=20
GET /api/notifications/count
POST /api/notifications/:id/read
POST /api/notifications/read-all
GET /api/notifications/preferences
PATCH /api/notifications/preferences
```

### UI Components

- `NotificationBell` - Header icon with unread badge
- `HubNotificationsPanel` - Preferences in Orbit Hub

## Testing Email Locally

### Option 1: Use Resend Test Mode

Resend provides a test API key that simulates sends without delivering:

```
RESEND_API_KEY=re_test_xxxxx
```

### Option 2: Check Console Logs

When email is not configured, the system logs what would be sent:

```
[email] Email not configured, skipping send to domain: example.com
```

### Option 3: Use Resend Sandbox

Configure a sandbox domain in Resend dashboard and test with real sends.

## Production Checklist

Before deploying to production:

- [ ] Set `RESEND_API_KEY` environment variable
- [ ] Verify SPF record for sending domain
- [ ] Verify DKIM record for sending domain
- [ ] Confirm `EMAIL_FROM_ADDRESS` matches verified domain
- [ ] Test claim flow end-to-end
- [ ] Verify emails reach inbox (not spam)

## Files Reference

| File | Purpose |
|------|---------|
| `server/services/email/emailClient.ts` | Resend client with Replit connector fallback |
| `server/services/email/templates.ts` | Email template functions |
| `server/services/email/index.ts` | Main email service exports |
| `server/services/notifications.ts` | In-app notification triggers |
| `server/startup.ts` | Email config validation on startup |
| `client/src/components/NotificationBell.tsx` | Header notification icon |
| `client/src/components/orbit/HubNotificationsPanel.tsx` | Notification preferences UI |

## Troubleshooting

### Emails not sending

1. Check startup logs for `[Email Configuration]`
2. Verify `RESEND_API_KEY` is set
3. Check Resend dashboard for failed sends
4. Confirm sending domain is verified

### Magic links not working

1. Check `PUBLIC_APP_URL` is set correctly for Render
2. Verify token hasn't expired (30 min window)
3. Check token hasn't already been used
4. Confirm Orbit hasn't already been claimed

### Notifications not appearing

1. Verify user tier has access to notification type
2. Check deduplication isn't preventing duplicates
3. Confirm preferences allow the notification type
