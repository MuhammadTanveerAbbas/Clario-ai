# Clario - AI Powered Content Processing Tool

An AI powered tool built with Next.js for content creators. Summarize anything and ask intelligent questions - built for YouTubers, podcasters, bloggers, and newsletter writers.

## Features

### Core AI Features

- **Text Summarizer**: 10 different summary modes (Action Items, Decisions Made, Brutal Roast, Executive Brief, Full Breakdown, Key Quotes, Sentiment Analysis, ELI5, SWOT Analysis, Meeting Minutes) powered by Groq Llama 3.3 70B with export to Markdown
- **AI Chat**: Conversational AI powered by Groq's Llama 3.1 8B with persistent chat history and creator-focused prompts
- **Content Remix Studio**: Turn 1 piece of content into 10 formats instantly (Twitter threads, LinkedIn posts, Email newsletters, Instagram captions, YouTube descriptions, Blog outlines, Podcast notes, Quote graphics, Short-form scripts, LinkedIn carousels)
- **Brand Voice Library**: Train AI to write in your unique style - upload writing examples and all AI outputs match your voice

### Platform Features

- **Authentication**: Email/password and social login (Google) via Supabase
- **Subscription Plans**: Free (100 requests/month) and Pro ($19/month with 1000 requests)
- **Usage Tracking**: Real-time usage monitoring with monthly request limits
- **Dashboard**: Interactive charts showing usage trends and activity
- **Settings**: Profile management and password changes
- **Security**: Row Level Security (RLS), PKCE authentication, secure session management

## Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **UI Library**: React 18 + Tailwind CSS
- **Components**: ShadCN UI
- **Animations**: Framer Motion
- **Charts**: Recharts

### Backend & Services
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **AI Services**: Groq SDK (Llama 3.1 8B for chat, Llama 3.3 70B for summarization)
- **Monitoring**: Sentry
- **Analytics**: PostHog

## Installation

### Prerequisites
- Node.js 18+
- npm or yarn
- Accounts for: Supabase, Groq, Sentry (optional), PostHog (optional), Stripe (for payments)

### Quick Start

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd Clario
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env.local
   ```

4. **Set up database**:
   - Go to your Supabase project SQL Editor
   - Run the schema from `supabase/schema.sql`

5. **Start development server**:
   ```bash
   npm run dev
   ```

6. **Open** [http://localhost:3000](http://localhost:3000)

## Project Structure

```
Clario/
├── src/
│   ├── app/                    # Next.js app router pages
│   │   ├── api/                # API routes
│   │   │   ├── chat/           # AI Chat API
│   │   │   ├── summarize/      # Summarizer API
│   │   │   ├── remix/          # Content Remix API
│   │   │   ├── brand-voice/    # Brand Voice API
│   │   │   ├── usage/          # Usage tracking
│   │   │   └── stripe/         # Payment processing
│   │   ├── auth/               # Authentication callbacks
│   │   ├── dashboard/          # Dashboard page
│   │   ├── chat/               # AI Chat feature
│   │   ├── summarizer/         # Text Summarizer feature
│   │   ├── remix/              # Content Remix Studio
│   │   ├── brand-voice/        # Brand Voice Library
│   │   ├── settings/           # Settings page
│   │   ├── pricing/            # Pricing page
│   │   ├── sign-in/            # Sign in page
│   │   └── sign-up/            # Sign up page
│   ├── components/
│   │   ├── layout/             # Layout components (Sidebar, Navbar)
│   │   └── ui/                 # ShadCN UI components
│   ├── contexts/               # React contexts (Auth, Sidebar)
│   └── lib/                    # Utilities and configurations
└── supabase/                   # Database schema
```

## Pricing

### Free Plan - $0/month
- 100 AI requests per month
- Chat + Summarizer
- 10 summary modes
- 1 Brand Voice
- 3 Remix formats
- Email support

### Pro Plan - $19/month
- 1000 AI requests per month
- Chat + Summarizer
- 10 summary modes
- 3 Brand Voices
- All 10 Remix formats
- Content Remix Studio
- Priority support
- Early access to new features

**What counts as a request?** Each AI operation: summarization or chat message.

## Environment Variables

See `.env.example` for all required environment variables. Key variables include:

- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `GROQ_API_KEY` - Groq API key for AI features
- `SENTRY_DSN` - Sentry DSN for error tracking
- `NEXT_PUBLIC_POSTHOG_KEY` - PostHog API key
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- `STRIPE_SECRET_KEY` - Stripe secret key

## Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Import project in Vercel
3. Add all environment variables
4. Deploy!

## Security Features

- Row Level Security (RLS) on all database tables
- PKCE authentication flow
- Secure session management
- Input sanitization
- CSRF protection
- Rate limiting on API endpoints

## License

MIT License

---

Built for content creators who need to process information fast.
