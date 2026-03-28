# Clario — AI Content Platform for Creators

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?logo=supabase)](https://supabase.com)
[![Groq](https://img.shields.io/badge/AI-Groq%20Llama-orange)](https://groq.com)
[![Stripe](https://img.shields.io/badge/Payments-Stripe-purple?logo=stripe)](https://stripe.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

An AI-powered SaaS platform for content creators — summarize, remix, and chat with AI across YouTube, podcasts, blogs, and newsletters.

**Live Demo:** [https://clario-hub.vercel.app](https://clario-hub.vercel.app)

---

## Features

- **Text Summarizer** — 11 AI-powered summary modes: Executive Brief, Action Items, Bullet Summary, Full Breakdown, SWOT, Meeting Minutes, Key Quotes, Sentiment, ELI5, Brutal Roast, Decisions. Export to `.md` or `.txt`.
- **YouTube Summarizer** — Paste any YouTube URL and get an instant summary. Supports `watch`, `shorts`, `live`, and `youtu.be` formats with multi-language transcript fallback.
- **AI Chat** — Conversational AI with persistent session history, brand voice injection, and creator-focused system prompt.
- **Content Remix Studio** — Turn one piece of content into 10 formats in parallel: Twitter/X thread, LinkedIn post, email newsletter, Instagram captions, YouTube description, blog outline, podcast notes, pull quotes, short-form scripts, LinkedIn carousel.
- **Brand Voice Library** — Create and manage custom brand voices. Activate one at a time — applied across Chat and Remix.
- **Dashboard** — Real-time usage stats, activity charts, and onboarding checklist.
- **Subscription Tiers** — Free (100 req/month) and Pro ($19/month, 1000 req/month) via Stripe.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5 |
| UI | React 18, Tailwind CSS, ShadCN UI, Radix UI |
| Charts | Recharts |
| Animations | Framer Motion |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (PKCE flow) |
| AI | Groq SDK — Llama 3.3 70B (summarize/remix), Llama 3.1 8B (chat) |
| Payments | Stripe |
| Error Monitoring | Sentry |
| Analytics | PostHog |
| Forms | React Hook Form + Zod |
| PDF Export | jsPDF |

---

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- Supabase project
- Groq API key
- Stripe account (for payments)

### Setup

```bash
# Clone the repo
git clone https://github.com/MuhammadTanveerAbbas/Clario-ai.git
cd Clario-ai

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env.local

# Fill in .env.local with your credentials, then start the dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

Copy `.env.example` to `.env.local` and fill in the values below.

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_APP_URL` | Yes | Public URL of the app (e.g. `http://localhost:3000`) |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key (server-side only) |
| `GROQ_API_KEY` | Yes | Groq API key for AI generation |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes | Stripe publishable key |
| `STRIPE_SECRET_KEY` | Yes | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Yes | Stripe webhook signing secret |
| `NEXT_PUBLIC_STRIPE_PRICE_ID` | Yes | Stripe price ID for the Pro plan |
| `ADMIN_EMAIL` | Yes | Admin email — bypasses usage limits |
| `SENTRY_DSN` | No | Sentry DSN for server-side error tracking |
| `NEXT_PUBLIC_SENTRY_DSN` | No | Sentry DSN for client-side error tracking |
| `SENTRY_AUTH_TOKEN` | No | Sentry auth token for source map uploads |
| `NEXT_PUBLIC_POSTHOG_KEY` | No | PostHog project API key |
| `NEXT_PUBLIC_POSTHOG_HOST` | No | PostHog host (default: `https://app.posthog.com`) |
| `RATE_LIMIT_AUTH_MAX` | No | Max auth attempts per window (default: `5`) |
| `RATE_LIMIT_AUTH_WINDOW` | No | Auth rate limit window in seconds (default: `900`) |
| `RATE_LIMIT_API_MAX` | No | Max API requests per window (default: `100`) |
| `RATE_LIMIT_API_WINDOW` | No | API rate limit window in seconds (default: `60`) |

---

## Folder Structure

```
src/
├── app/
│   ├── (app)/              # Authenticated routes (dashboard, chat, summarizer, remix, brand-voice, settings)
│   ├── (auth)/             # Auth routes (sign-in, sign-up, forgot-password)
│   ├── (marketing)/        # Public routes (landing, pricing, privacy, terms)
│   ├── api/                # API routes (summarize, chat, remix, brand-voice, usage, youtube, stripe)
│   └── auth/callback/      # OAuth callback handler
├── components/
│   ├── ui/                 # ShadCN UI primitives
│   ├── layout/             # App navbar, sidebar
│   ├── marketing/          # Marketing nav and footer
│   └── providers/          # PostHog and client providers
├── contexts/               # AuthContext, SidebarContext
├── hooks/                  # useSettings, useToast, useAnalyticsInsights, useMobile
├── lib/
│   ├── supabase/           # Supabase client, server, and middleware helpers
│   ├── ai-fallback.ts      # Groq wrapper with error normalization
│   ├── usage-limits.ts     # Tier-based request limits
│   ├── security-config.ts  # CSP, cookie, session, and rate limit config
│   ├── input-validation.ts # Input sanitization
│   └── stripe.ts           # Stripe checkout helpers
└── middleware/
    └── rate-limit.ts       # IP-based rate limiting middleware
```

---

## Database Schema

Key Supabase tables:

| Table | Description |
|---|---|
| `profiles` | User data, `subscription_tier`, `requests_used_this_month` |
| `ai_summaries` | Saved summaries with mode and source text |
| `chat_sessions` | Conversation metadata |
| `chat_messages` | Individual messages (role, content) |
| `brand_voices` | User brand voices with `is_active` flag |
| `usage_tracking` | Per-request logs (`summary`, `chat`, `remix`) |
| `usage_stats` | Aggregated daily stats |
| `processed_webhook_events` | Stripe webhook idempotency log |

Required RPC: `track_usage(p_user_id, p_type, p_count)`

---

## Security

- Row Level Security (RLS) on all Supabase tables
- PKCE authentication flow
- Input sanitization on all AI endpoints
- IP-based rate limiting (100 req/min API, 5 req/15min auth)
- CSRF token validation
- Secure `httpOnly` session cookies with `__Host-` prefix
- Strict Content Security Policy

---

## Deployment

### Vercel

1. Push to GitHub and import the repo in Vercel
2. Add all environment variables in the Vercel dashboard
3. Set `NEXT_PUBLIC_APP_URL` to your production domain

> AI routes use `maxDuration` of 60–120 seconds. Vercel Pro plan required for functions exceeding 10s.

---

## Author

Built by [Muhammad Tanveer Abbas](https://themvpguy.vercel.app/)

---

## License

MIT
