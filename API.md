# Prereq API Documentation

## Overview

Prereq's backend API provides endpoints for managing LinkedIn profile briefs, AI-powered chat assistance, user profiles, and usage tracking. All endpoints require authentication via Clerk.

## AI Providers

The API uses a dual-provider AI architecture for reliability:

| Provider | Role | Model | Use Case |
|----------|------|-------|----------|
| **Claude (Anthropic)** | Primary | claude-sonnet-4-20250514 | Brief generation, chat |
| **Groq** | Fallback | llama-3.1-70b-versatile | Activated on Claude rate limits |

When Claude hits rate limits or token exhaustion, the system automatically falls back to Groq. Usage logs track which provider was used for each request.

## Base URL

```
Development: http://localhost:3000/api
Production: https://your-domain.com/api
```

## Authentication

All API endpoints (except webhooks and health check) require authentication. The API uses Clerk for authentication. Include the session token in requests automatically handled by Clerk's middleware.

---

## Endpoints

### Briefs

#### Generate Brief

Creates a new AI-powered brief for a LinkedIn profile.

```
POST /api/briefs/generate
```

**Request Body:**
```json
{
  "linkedin_url": "https://www.linkedin.com/in/username",
  "meeting_goal": "networking" // optional, defaults to "general"
}
```

**Meeting Goals:**
- `networking` - Professional networking
- `sales` - Sales meeting
- `hiring` - Recruiting/hiring
- `investor` - Investor meeting
- `partner` - Partnership discussion
- `general` - General meeting

**Response (201):**
```json
{
  "success": true,
  "data": {
    "brief": {
      "id": "uuid",
      "user_id": "uuid",
      "linkedin_url": "https://www.linkedin.com/in/username",
      "meeting_goal": "networking",
      "profile_name": "John Doe",
      "profile_headline": "VP of Product at Stripe",
      "profile_photo_url": "https://...",
      "profile_location": "San Francisco, CA",
      "profile_company": "Stripe",
      "summary": "AI-generated summary...",
      "talking_points": ["Point 1", "Point 2"],
      "common_ground": ["Shared interest 1"],
      "icebreaker": "Great conversation opener...",
      "questions": ["Question 1", "Question 2"],
      "is_saved": false,
      "created_at": "2024-12-11T...",
      "updated_at": "2024-12-11T..."
    }
  }
}
```

---

#### List Briefs

Retrieves paginated list of user's briefs.

```
GET /api/briefs
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 10 | Items per page (max 50) |
| search | string | - | Search by name, headline, company |
| goal | string | - | Filter by meeting goal |
| saved | boolean | false | Show only saved briefs |
| sort | string | created_at | Sort field (created_at, profile_name) |
| order | string | desc | Sort order (asc, desc) |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "briefs": [...],
    "total": 42,
    "page": 1,
    "limit": 10,
    "has_more": true
  }
}
```

---

#### Get Brief

Retrieves a single brief by ID.

```
GET /api/briefs/:id
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "brief": { ... }
  }
}
```

---

#### Update Brief

Updates brief metadata (save/unsave).

```
PATCH /api/briefs/:id
```

**Request Body:**
```json
{
  "is_saved": true
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "brief": { ... }
  }
}
```

---

#### Delete Brief

Deletes a brief.

```
DELETE /api/briefs/:id
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Brief deleted successfully"
  }
}
```

---

#### Refresh Brief

Re-generates a brief with fresh LinkedIn data.

```
POST /api/briefs/:id/refresh
```

**Request Body (optional):**
```json
{
  "meeting_goal": "sales"  // Optionally change the goal
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "brief": { ... }
  }
}
```

---

### Chat (Sage Assistant)

#### Send Message

Sends a message to the AI assistant.

```
POST /api/chat
```

**Request Body:**
```json
{
  "message": "Help me prepare for my meeting",
  "brief_id": "uuid",        // optional - provides context
  "session_id": "uuid"       // optional - continues conversation
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": {
      "id": "uuid",
      "session_id": "uuid",
      "role": "assistant",
      "content": "AI response...",
      "created_at": "2024-12-11T..."
    },
    "session_id": "uuid"
  }
}
```

---

#### Get Chat History

Retrieves chat history for a brief.

```
GET /api/chat/:briefId
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": "uuid",
        "session_id": "uuid",
        "role": "user",
        "content": "...",
        "created_at": "..."
      },
      {
        "id": "uuid",
        "session_id": "uuid",
        "role": "assistant",
        "content": "...",
        "created_at": "..."
      }
    ],
    "session_id": "uuid",
    "brief": { ... }
  }
}
```

---

### Usage

#### Get Usage Stats

Returns current usage for the billing period.

```
GET /api/usage
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "used": 24,
    "limit": 30,
    "remaining": 6,
    "reset_date": "2025-01-01T00:00:00.000Z",
    "plan": "starter"
  }
}
```

---

### Stats

#### Get Dashboard Stats

Returns dashboard statistics.

```
GET /api/stats
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "briefs_generated": 42,
    "briefs_this_month": 12,
    "time_saved_minutes": 630,
    "meetings_prepped": 42
  }
}
```

---

### User

#### Get Profile

Returns current user's profile.

```
GET /api/user/profile
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "clerk_id": "user_xxx",
      "email": "user@example.com",
      "name": "John Doe",
      "company": "Acme Inc",
      "role": "Product Manager",
      "linkedin_url": "https://linkedin.com/in/johndoe",
      "linkedin_data": { ... },
      "plan": "starter",
      "created_at": "...",
      "updated_at": "..."
    }
  }
}
```

---

#### Update Profile

Updates user profile information.

```
PATCH /api/user/profile
```

**Request Body:**
```json
{
  "name": "John Doe",
  "company": "Acme Inc",
  "role": "Product Manager"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": { ... }
  }
}
```

---

#### Connect LinkedIn

Connects and syncs user's LinkedIn profile.

```
POST /api/user/linkedin
```

**Request Body:**
```json
{
  "linkedin_url": "https://www.linkedin.com/in/johndoe"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "message": "LinkedIn profile connected successfully"
  }
}
```

---

#### Disconnect LinkedIn

Removes LinkedIn connection.

```
DELETE /api/user/linkedin
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "LinkedIn profile disconnected"
  }
}
```

---

#### Sync LinkedIn

Re-syncs LinkedIn data for existing connection.

```
POST /api/user/linkedin/sync
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "message": "LinkedIn profile synced successfully"
  }
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": "Error message here"
}
```

### Common Error Codes

| Status | Code | Description |
|--------|------|-------------|
| 400 | INVALID_INPUT | Invalid request body or parameters |
| 400 | INVALID_LINKEDIN_URL | Invalid LinkedIn profile URL |
| 401 | UNAUTHORIZED | Missing or invalid authentication |
| 403 | FORBIDDEN | Not authorized to access resource |
| 404 | NOT_FOUND | Resource not found |
| 429 | USAGE_LIMIT_EXCEEDED | Monthly brief limit reached |
| 429 | RATE_LIMIT_EXCEEDED | Too many requests |
| 500 | INTERNAL_ERROR | Server error |
| 500 | PROXYCURL_ERROR | LinkedIn data fetch failed |
| 500 | CLAUDE_ERROR | AI generation failed |

---

## Rate Limits

- **Brief Generation:** Tied to plan limits (5/30/100 per month)
- **API Requests:** 60 requests per minute per user
- **Chat Messages:** No hard limit, but subject to API rate limiting

---

## Webhooks

### Clerk User Events

```
POST /api/webhooks/clerk
```

Handles Clerk user lifecycle events:
- `user.created` - Creates user in database
- `user.updated` - Syncs user data
- `user.deleted` - Removes user and all data

**Headers Required:**
- `svix-id`
- `svix-timestamp`
- `svix-signature`

---

## Health Check

### Check System Health

```
GET /api/health
```

Returns system health status and service configuration.

**Response (200):**
```json
{
  "status": "ok",
  "timestamp": "2024-12-11T...",
  "services": {
    "ai": {
      "claude": { "configured": true, "role": "primary" },
      "groq": { "configured": true, "role": "fallback" }
    },
    "database": {
      "supabase": { "configured": true }
    },
    "auth": {
      "clerk": { "configured": true }
    },
    "linkedin": {
      "proxycurl": { "configured": true }
    }
  }
}
```

**Response (503 - Degraded):**
Returned when critical services are not configured.

---

## Plan Limits

| Plan | Price | Briefs/Month |
|------|-------|--------------|
| Free | $0 | 5 |
| Starter | $7 | 30 |
| Pro | $15 | 100 |

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | Yes* | Claude API key (primary AI) |
| `GROQ_API_KEY` | Yes* | Groq API key (fallback AI) |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service key |
| `CLERK_SECRET_KEY` | Yes | Clerk authentication key |
| `PROXYCURL_API_KEY` | Yes | LinkedIn data API key |

*At least one AI provider must be configured.
