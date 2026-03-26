# Clario — AI Content Platform for Creators

An AI-powered SaaS platform for YouTubers, podcasters, bloggers, and newsletter writers. Summarize, remix, and chat with AI — all in one place.

## Features

### AI Tools

- **Text Summarizer** — 11 summary modes powered by Groq Llama 3.3 70B:
  - Executive Brief, Action Items, Bullet Summary, Full Breakdown
  - SWOT Analysis, Meeting Minutes, Key Quotes, Sentiment Analysis
  - ELI5, Brutal Roast, Decisions
  - Export to `.md` or `.txt`

- **YouTube Summarizer** — Paste any YouTube URL and get an instant summary
  - Supports `youtube.com/watch`, `youtu.be`, `youtube.com/shorts`, `youtube.com/live`
  - Multi-language transcript fallback (en, en-US, en-GB, auto)
  - Fetches video title, author, and thumbnail via oEmbed
  - Handles age-restricted, private, and caption-disabled videos gracefully

- **AI Chat** — Conversational AI with persistent history
  - Powered by Groq Llama 3.1 8B (fast, real-time)
  - Creator-focused system prompt (content strategy, hooks, platform advice)
  - Brand voice injection support
  - Session management with rename and clear

- **Content Remix Studio** — Turn 1 piece of content into 10 formats in parallel:
  - Twitter/X thread, LinkedIn post, Email newsletter
  - Instagram captions (3 variations), YouTube description
  - Blog post outline, Podcast show notes
  - Pull quotes, Short-form video scripts, LinkedIn carousel

- **Brand Voice Library** — Train AI to write in your style
  - Create, edit, and delete brand voices
  - Activate one voice at a time — applied across Chat and Remix

### Platform

- **Dashboard** — Real usage stats (summaries, chats, remixes, brand voices), activity charts, onboarding checklist
- **Authentication** — Email/password and Google OAuth via Supabase (PKCE flow)
- **Subscription Plans** — Free (100 req/month) and Pro ($19/month, 1000 req/month) via Stripe
- **Usage Tracking** — Per-request tracking with monthly reset
- **Settings** — Profile, security, billing, preferences, privacy sections

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| UI | React 18, Tailwind CSS, ShadCN UI |
| Charts | Recharts |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| AI | Groq SDK — Llama 3.3 70B (summarize), Llama 3.1 8B (chat, remix) |
| Payments | Stripe |
| Monitoring | Sentry |
| Analytics | PostHog |

## Project Structure

```
src/
├── app/
│   ├── (app)/                  # Authenticated app routes
│   │   ├── dashboard/          # Dashboard with stats & charts
│   │   ├── summarizer/         # Text + YouTube summarizer
│   │   ├── chat/               # AI chat with history
│   │   ├── remix/              # Content remix studio
│   │   ├── brand-voice/        # Brand voice management
│   │   ├── calendar/           # Content calendar
│   │   └── settings/           # User settings
│   ├── (auth)/                 # Sign in, sign up, forgot password
│   ├── (marketing)/            # Landing page, pricing, legal
│   └── api/
│       ├── youtube/            # YouTube transcript fetcher
│       ├── summarize/          # AI summarization
│       ├── chat/               # AI chat
│       ├── remix/              # Content remix
│       ├── brand-voice/        # Brand voice CRUD
│       ├── usage/              # Usage stats
│       ├── analytics/          # Analytics data
│       └── stripe/             # Payment webhooks & checkout
├── components/
│   ├── ui/                     # ShadCN UI components
│   ├── layout/                 # Sidebar, navbar
│   ├── marketing/              # Marketing nav & footer
│   └── providers/              # Client providers, PostHog
├── contexts/                   # AuthContext, SidebarContext
└── lib/
    ├── ai-fallback.ts          # Groq AI wrapper with error handling
    ├── usage-limits.ts         # Tier limits (free: 100, pro: 1000)
    ├── input-validation.ts     # Input sanitization
    ├── supabase/               # Supabase client & server helpers
    └── stripe.ts               # Stripe checkout helpers
```

## Quick Start

### Prerequisites
- Node.js 18+
- pnpm (recommended) or npm
- Supabase project
- Groq API key

### Setup

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env.local

# Fill in your .env.local, then start dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI
GROQ_API_KEY=your-groq-api-key

# Payments
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
ADMIN_EMAIL=your-admin@email.com

# Optional
SENTRY_DSN=your-sentry-dsn
NEXT_PUBLIC_POSTHOG_KEY=your-posthog-key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

## API Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/youtube` | POST | Fetch YouTube transcript + metadata |
| `/api/summarize` | POST | Generate AI summary (11 modes) |
| `/api/chat` | POST | AI chat with history |
| `/api/remix` | POST | Remix content into 10 formats |
| `/api/brand-voice` | GET/POST/DELETE | Manage brand voices |
| `/api/brand-voice/activate` | POST | Activate a brand voice |
| `/api/chat/history` | GET/DELETE | Chat session history |
| `/api/usage` | GET | Current usage stats |
| `/api/analytics` | GET | Usage analytics |
| `/api/stripe/webhook` | POST | Stripe webhook handler |

### YouTube API

```json
POST /api/youtube
{ "url": "https://youtube.com/watch?v=VIDEO_ID" }

// Response
{
  "transcript": "Full transcript text...",
  "videoId": "VIDEO_ID",
  "videoUrl": "https://youtube.com/watch?v=VIDEO_ID",
  "title": "Video Title",
  "author": "Channel Name",
  "thumbnail": "https://img.youtube.com/vi/VIDEO_ID/hqdefault.jpg",
  "lang": "en",
  "charCount": 12345
}
```

### Summarize API

```json
POST /api/summarize
{
  "text": "Content to summarize...",
  "mode": "executive-brief",
  "youtubeUrl": "https://youtube.com/watch?v=..." // optional
}

// Modes: executive-brief | action-items | bullet-summary | full-breakdown |
//        swot | meeting-minutes | key-quotes | sentiment | eli5 | brutal-roast | decisions
```

## Database Schema

Key tables in Supabase:

- `profiles` — User data, `subscription_tier`, `requests_used_this_month`
- `ai_summaries` — Saved summaries with mode and original text
- `chat_sessions` — Conversation metadata
- `chat_messages` — Individual messages (role, content)
- `brand_voices` — User brand voices with `is_active` flag
- `usage_tracking` — Per-request logs (type: `summary` | `chat` | `remix`)
- `usage_stats` — Aggregated daily stats

Required RPC functions:
- `track_usage(p_user_id, p_type, p_count)` — Increment usage counter

## Security

- Row Level Security (RLS) on all tables
- PKCE authentication flow
- Input sanitization on all AI endpoints
- IP-based rate limiting (100 req/min for API, 5 req/15min for auth)
- CSRF protection
- Secure httpOnly session cookies

## Deployment

### Vercel

```bash
# Push to GitHub, then import in Vercel
# Add all environment variables in Vercel dashboard
# Set NEXT_PUBLIC_APP_URL to your production URL
```

The `maxDuration` on AI routes is set to 60-90 seconds — make sure your Vercel plan supports this (Pro plan required for >10s functions).

## License

MIT
