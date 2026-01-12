# AgoraCube Demo Guide

## Overview

AgoraCube enables Raspberry Pi 5 thin clients to display Orbit content in kiosk mode with optional voice interaction. This document covers setup, pairing, and usage.

---

## Quick Start

### 1. Access Kiosk Mode (Browser Testing)

Visit any Orbit with query parameters:

```
/orbit/{slug}?kiosk=1      # Touch-only kiosk mode
/orbit/{slug}?kiosk=1&voice=1  # Kiosk + voice mode
```

### 2. Device Pairing Flow

#### Step A: Owner Provisions Device

```bash
curl -X POST https://your-domain/api/orbit/{slug}/devices/provision \
  -H "Content-Type: application/json" \
  -H "Cookie: connect.sid=<owner-session>" \
  -d '{"deviceLabel": "Reception Kiosk"}'
```

**Response:**
```json
{
  "deviceId": "550e8400-e29b-41d4-a716-446655440000",
  "pairingCode": "847291",
  "expiresAt": "2025-01-05T10:30:00Z"
}
```

#### Step B: Device Pairs with Code

```bash
curl -X POST https://your-domain/api/orbit/{slug}/devices/pair \
  -H "Content-Type: application/json" \
  -d '{"pairingCode": "847291"}'
```

**Response:**
```json
{
  "deviceId": "550e8400-e29b-41d4-a716-446655440000",
  "token": "dv_abc123xyz789...",
  "expiresAt": "2026-01-05T10:30:00Z"
}
```

> **Important:** Store the token securely. It's hashed server-side and cannot be recovered.

---

## API Reference

### POST /api/orbit/:slug/ask

AI-powered Q&A endpoint for kiosk interactions.

**Headers:**
```
X-Device-Token: dv_abc123xyz789...  (optional - for device auth)
```

**Request:**
```json
{
  "question": "What services do you offer?"
}
```

**Response:**
```json
{
  "replyText": "We offer three main services: consulting, implementation, and training...",
  "scenePatch": {
    "focusCardId": 42,
    "highlightCardIds": [42, 43, 44]
  },
  "cards": [
    {
      "id": 42,
      "title": "Consulting Services",
      "description": "Strategic advice for your business"
    }
  ]
}
```

### Rate Limiting

- **2 tokens per minute** (120/hour)
- **10 token burst capacity**
- Returns `429 Too Many Requests` with `retryAfter` seconds when exhausted

**Rate Limited Response:**
```json
{
  "error": "Rate limit exceeded",
  "retryAfter": 25
}
```

---

## Kiosk Mode Features

| Feature | Specification |
|---------|---------------|
| Touch targets | Minimum 64px |
| Card limit | 50 cards per session |
| Navigation | Tap-based pagination |
| Animation | Reduced motion (no parallax) |
| Layout | Chromeless fullscreen |

### Voice Mode Additions

| Feature | Specification |
|---------|---------------|
| Input | Browser SpeechRecognition API |
| Output | SpeechSynthesis TTS |
| Trigger | Mic button tap |
| Language | en-US (default) |

---

## Device Management

### List Devices (Owner Only)

```bash
curl https://your-domain/api/orbit/{slug}/devices \
  -H "Cookie: connect.sid=<owner-session>"
```

### Revoke Device

```bash
curl -X DELETE https://your-domain/api/orbit/{slug}/devices/{deviceId} \
  -H "Cookie: connect.sid=<owner-session>"
```

---

## Raspberry Pi Setup

### Requirements

- Raspberry Pi 5 (4GB+ RAM)
- Chromium browser (kiosk mode)
- Touch display (7"+ recommended)

### Auto-start Script

```bash
#!/bin/bash
# /home/pi/start-kiosk.sh

export DISPLAY=:0
chromium-browser \
  --kiosk \
  --noerrdialogs \
  --disable-infobars \
  --disable-session-crashed-bubble \
  "https://your-domain/orbit/{slug}?kiosk=1&voice=1"
```

### Systemd Service

```ini
# /etc/systemd/system/agoracube.service
[Unit]
Description=AgoraCube Kiosk
After=graphical.target

[Service]
User=pi
Environment=DISPLAY=:0
ExecStart=/home/pi/start-kiosk.sh
Restart=on-failure

[Install]
WantedBy=graphical.target
```

---

## Troubleshooting

### Voice Not Working

1. Check browser supports Web Speech API (Chrome/Edge recommended)
2. Ensure HTTPS (required for microphone access)
3. Grant microphone permission when prompted

### Token Rejected

1. Verify token hasn't expired (1-year default)
2. Check device wasn't revoked by owner
3. Ensure token is sent in `X-Device-Token` header

### Rate Limited

1. Wait for `retryAfter` seconds
2. Reduce question frequency
3. Contact Orbit owner for tier upgrade

---

## Security Notes

- Pairing codes expire in 7 days
- Tokens are bcrypt-hashed (server never stores plaintext)
- All device events are audit-logged
- Owner can revoke any device instantly
- SSRF protection on all external API calls
