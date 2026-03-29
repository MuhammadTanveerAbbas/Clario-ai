# Clario — AI Content Platform for Creators

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?logo=supabase)](https://supabase.com)
[![Groq](https://img.shields.io/badge/AI-Groq%20Llama-orange)](https://groq.com)
[![Stripe](https://img.shields.io/badge/Payments-Stripe-purple?logo=stripe)](https://stripe.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

An AI-powered SaaS platform for content creators — summarize, remix, and chat with AI across YouTube, podcasts, blogs, and newsletters.

---

## Features

- **Text Summarizer** — 11 AI-powered summary modes: Executive Brief, Action Items, Bullet Summary, Full Breakdown, SWOT, Meeting Minutes, Key Quotes, Sentiment, ELI5, Brutal Roast, Decisions. Export to `.md` or `.txt`.
- **YouTube Summarizer** — Paste any YouTube URL and get an instant summary. Supports `watch`, `shorts`, `live`, and `youtu.be` formats with multi-language transcript fallback.
- **AI Chat** — Conversational AI with persistent session history, brand voice injection, and creator-focused system prompt.
- **Content Remix Studio** — Turn one piece of content into 10 formats in parallel: Twitter/X thread, LinkedIn post, email newsletter, Instagram captions, YouTube description, blog outline, podcast notes, pull quotes, short-form scripts, LinkedIn carousel.
- **Brand Voice Library** — Create and manage custom brand voices. Activate one at a time — applied across Chat and Remix.
- **Content Calendar** — Schedule and track content across platforms with a full month view.
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
| Payments | Stripe (Checkout + Billing Portal) |
| Error Monitoring | Sentry |
| Analytics | PostHog |
| Forms | React Hook Form + Zod |

---

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (`npm install -g pnpm`)
- Supabase project
- Groq API key
- Stripe account

### Setup

```bash
# Clone the repo
git clone https://github.com/MuhammadTanveerAbbas/Clario-ai.git
cd Clario-ai

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env.local

# Fill in .env.local with your credentials (see below), then start the dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

Copy `.env.example` to `.env.local` and fill in the values.

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
| `NEXT_PUBLIC_STRIPE_PRICE_ID` | Yes | Stripe price ID for the Pro monthly plan |
| `STRIPE_PRICE_PRO_MONTHLY` | Yes | Stripe price ID for Pro monthly (same as above) |
| `STRIPE_PRICE_PRO_ANNUAL` | No | Stripe price ID for Pro annual plan |
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

## Database Schema

Run these migrations in your Supabase SQL editor.

### Core Tables

```sql
-- User profiles (auto-created on sign-up via trigger)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  avatar_url text,
  subscription_tier text default 'free' check (subscription_tier in ('free', 'pro')),
  subscription_status text default 'inactive',
  stripe_customer_id text,
  stripe_subscription_id text,
  requests_used_this_month integer default 0,
  current_period_start timestamptz default now(),
  current_period_end timestamptz default (now() + interval '1 month'),
  created_at timestamptz default now()
);

-- AI summaries
create table ai_summaries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  summary_text text,
  original_text text,
  mode text,
  youtube_url text,
  created_at timestamptz default now()
);

-- Chat sessions
create table chat_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  title text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Chat messages
create table chat_messages (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references chat_sessions(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  role text check (role in ('user', 'assistant')),
  content text,
  created_at timestamptz default now()
);

-- Brand voices
create table brand_voices (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  name text not null,
  examples text,
  is_active boolean default false,
  created_at timestamptz default now()
);

-- Usage tracking (per-request log)
create table usage_tracking (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  type text check (type in ('summary', 'chat', 'remix', 'creator_mode')),
  created_at timestamptz default now()
);

-- Usage stats (aggregated daily)
create table usage_stats (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  date date not null,
  total_requests integer default 0,
  summaries_count integer default 0,
  chats_count integer default 0,
  writing_count integer default 0,
  meeting_notes_count integer default 0,
  unique(user_id, date)
);

-- Stripe webhook idempotency
create table processed_webhook_events (
  id text primary key,
  processed_at timestamptz default now()
);

-- Feedback
create table feedback (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete set null,
  email text,
  feedback text,
  created_at timestamptz default now()
);

-- Content calendar
create table calendar_events (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  title text not null,
  scheduled_at timestamptz not null,
  platform text,
  content_text text,
  color text,
  status text default 'draft',
  created_at timestamptz default now()
);
```

### RLS Policies

```sql
-- Enable RLS on all tables
alter table profiles enable row level security;
alter table ai_summaries enable row level security;
alter table chat_sessions enable row level security;
alter table chat_messages enable row level security;
alter table brand_voices enable row level security;
alter table usage_tracking enable row level security;
alter table usage_stats enable row level security;
alter table feedback enable row level security;
alter table calendar_events enable row level security;

-- Profiles: users can only read/update their own
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- All other tables: users can only access their own rows
create policy "Users own their summaries" on ai_summaries for all using (auth.uid() = user_id);
create policy "Users own their sessions" on chat_sessions for all using (auth.uid() = user_id);
create policy "Users own their messages" on chat_messages for all using (auth.uid() = user_id);
create policy "Users own their brand voices" on brand_voices for all using (auth.uid() = user_id);
create policy "Users own their usage" on usage_tracking for all using (auth.uid() = user_id);
create policy "Users own their stats" on usage_stats for all using (auth.uid() = user_id);
create policy "Users own their feedback" on feedback for all using (auth.uid() = user_id);
create policy "Users own their calendar events" on calendar_events for all using (auth.uid() = user_id);
```

### Required RPC Functions

```sql
-- Track usage and increment monthly counter
create or replace function track_usage(p_user_id uuid, p_type text, p_count integer default 1)
returns void language plpgsql security definer as $$
begin
  -- Insert into usage_tracking log
  insert into usage_tracking (user_id, type) values (p_user_id, p_type);

  -- Increment monthly counter on profile
  update profiles
  set requests_used_this_month = requests_used_this_month + p_count
  where id = p_user_id;
end;
$$;

-- Auto-create profile on sign-up
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
```

---

## Architecture Overview

```
src/
├── app/
│   ├── (app)/              # Authenticated routes (dashboard, chat, summarizer, remix, brand-voice, calendar, settings)
│   ├── (auth)/             # Auth routes (sign-in, sign-up, forgot-password)
│   ├── (marketing)/        # Public routes (landing, pricing, privacy, terms)
│   ├── api/                # API routes
│   │   ├── analytics/      # Usage analytics
│   │   ├── brand-voice/    # Brand voice CRUD + activate
│   │   ├── chat/           # AI chat + history
│   │   ├── creator-modes/  # Creator-specific content modes
│   │   ├── feedback/       # User feedback
│   │   ├── insights/       # Cross-content insights
│   │   ├── remix/          # Content remix (10 formats)
│   │   ├── stripe/         # Checkout, portal, webhook
│   │   ├── summarize/      # Text summarizer + export
│   │   ├── usage/          # Usage stats
│   │   └── youtube/        # YouTube transcript fetcher
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
│   └── stripe.ts           # Stripe checkout + portal helpers
└── middleware/
    └── rate-limit.ts       # IP-based rate limiting middleware
```

### Data Flow

1. User authenticates via Supabase Auth (PKCE flow)
2. Middleware validates session on every request
3. API routes check auth, rate limits, and usage limits before calling Groq
4. AI responses are returned to the client; usage is tracked fire-and-forget
5. Stripe webhooks update subscription status in Supabase profiles table

---

## Security

- Row Level Security (RLS) on all Supabase tables
- PKCE authentication flow
- Input sanitization on all AI endpoints
- IP-based rate limiting (100 req/min API, 5 req/15min auth)
- Strict Content Security Policy headers
- Webhook signature verification (Stripe)
- `httpOnly` session cookies with `SameSite=Lax`
- Debug endpoint disabled in production

---

## Deployment

### Vercel (Recommended)

1. Push to GitHub and import the repo in Vercel
2. Add all environment variables in the Vercel dashboard
3. Set `NEXT_PUBLIC_APP_URL` to your production domain (e.g. `https://yourdomain.com`)
4. Deploy

> AI routes use `maxDuration` of 60–120 seconds. Vercel Pro plan required for functions exceeding 10s.

### Stripe Webhook Setup

1. In the Stripe dashboard, create a webhook endpoint pointing to `https://yourdomain.com/api/stripe/webhook`
2. Subscribe to these events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
3. Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`

### Supabase Auth Setup

1. In Supabase dashboard → Authentication → URL Configuration:
   - Set **Site URL** to your production domain
   - Add `https://yourdomain.com/auth/callback` to **Redirect URLs**
2. To enable Google OAuth: Authentication → Providers → Google → add your OAuth credentials

---

## Author

Built by [Muhammad Tanveer Abbas](https://themvpguy.vercel.app/)

---

## License

MIT
