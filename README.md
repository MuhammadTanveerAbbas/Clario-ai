# Clario - AI Powered Productivity Platform

An AI-powered SaaS platform built with Next.js, featuring text summarization, AI chat, writing assistance, and meeting notes.

## 🚀 Features

### Core AI Features

- **Text Summarizer**: 10 different summary modes (Action Items, Decisions Made, Brutal Roast, Executive Brief, Full Breakdown, Key Quotes, Sentiment Analysis, ELI5, SWOT Analysis, Meeting Minutes) powered by Groq Llama 3.3 70B with export to Markdown
- **AI Chat**: Conversational AI powered by Groq's Llama 3.1 8B with persistent chat history and clear explanations of AI capabilities
- **Writing Assistant**: AI-powered writing improvement with 5 action types (improve, rewrite, expand, summarize, grammar) and 5 tone options using Groq Llama 3.3 70B
- **Meeting Notes**: Convert meeting transcripts into structured notes with summary, action items, and key points using Groq Llama 3.3 70B
- **Quick Notes**: Organize and categorize quick notes with AI-powered summaries and tagging

### Platform Features

- **Authentication**: Email/password and social login (Google, GitHub) via Supabase
- **Subscription Plans**: Free (100 requests/month) and Pro ($20/month with 1000 requests)
- **Usage Tracking**: Real-time usage monitoring with monthly request limits
- **Dashboard**: Interactive charts showing usage trends and activity
- **Settings**: Profile management and password changes
- **Security**: Row Level Security (RLS), PKCE authentication, secure session management

## 📦 Tech Stack

### Frontend

- **Framework**: Next.js 15 (App Router)
- **UI Library**: React 18 + Tailwind CSS
- **Components**: ShadCN UI
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod

### Backend & Services

- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **AI Services**:
  - Groq SDK (Llama 3.1 8B for chat, Llama 3.3 70B for writing, meeting notes, and text summarization)
- **Monitoring**: Sentry
- **Analytics**: PostHog

### Development

- **Language**: TypeScript
- **Package Manager**: npm
- **Testing**: Jest + React Testing Library

## 🛠️ Installation

### Prerequisites

- Node.js 18+
- npm or yarn
- Accounts for: Supabase, Groq, Sentry, PostHog

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

   Fill in all required values (see [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed instructions)

4. **Set up database**:

   - Go to your Supabase project SQL Editor
   - Run the migration script from `database/migrations/001_initial_schema.sql`

5. **Start development server**:

   ```bash
   npm run dev
   ```

6. **Open** [http://localhost:3000](http://localhost:3000)

## 📚 Documentation

- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)**: Comprehensive setup instructions for all services
- **API Documentation**: See `/src/app/api` for API route implementations
- **Database Schema**: See `database/migrations/001_initial_schema.sql`

## 🏗️ Project Structure

```
Clario/
├── src/
│   ├── app/                    # Next.js app router pages
│   │   ├── api/                # API routes
│   │   ├── auth/               # Authentication callbacks
│   │   ├── dashboard/          # Dashboard page
│   │   ├── chat/               # AI Chat feature
│   │   ├── summarizer/         # Text Summarizer feature
│   │   ├── writing/            # Writing Assistant feature
│   │   ├── meeting-notes/      # Meeting Notes feature
│   │   ├── quick-notes/        # Quick Notes feature
│   │   ├── settings/           # Settings page
│   │   ├── pricing/            # Pricing page
│   │   ├── privacy/            # Privacy policy
│   │   ├── terms/              # Terms of service
│   │   ├── refund/             # Refund policy
│   │   ├── sign-in/            # Sign in page
│   │   └── sign-up/            # Sign up page
│   ├── components/
│   │   ├── layout/             # Layout components (Sidebar, Navbar)
│   │   └── ui/                 # ShadCN UI components
│   ├── contexts/               # React contexts (Auth, Sidebar)
│   ├── lib/
│   │   ├── supabase/           # Supabase client utilities
│   │   ├── usage-limits.ts     # Usage limit utilities
│   │   └── utils.ts            # General utilities
│   └── hooks/                  # Custom React hooks
├── database/
│   └── migrations/             # Database migration scripts
├── public/                     # Static assets
├── .env.example                # Environment variables template
├── SETUP_GUIDE.md              # Detailed setup instructions
└── README.md                   # This file
```

## 💰 Pricing

### Free Plan - $0/month
- 100 AI requests per month
- All 5 AI features included
- Email support

### Pro Plan - $20/month
- 1000 AI requests per month
- All 5 AI features included
- Priority email support
- Early access to new features

**What counts as a request?** Each AI operation: summarization, chat message, writing assistance, meeting notes generation, or quick note creation.

## 🔐 Environment Variables

See `.env.example` for all required environment variables. Key variables include:

- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `GROQ_API_KEY` - Groq API key for all AI features (chat, writing, meeting notes, and summarization)
- `SENTRY_DSN` - Sentry DSN for error tracking
- `NEXT_PUBLIC_SENTRY_DSN` - Public Sentry DSN
- `NEXT_PUBLIC_POSTHOG_KEY` - PostHog API key
- `NEXT_PUBLIC_POSTHOG_HOST` - PostHog host URL

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add all environment variables
4. Deploy!

### Other Platforms

The app can be deployed to any platform that supports Next.js:

- Netlify
- Railway
- AWS Amplify
- DigitalOcean App Platform

Make sure to:

- Set all environment variables
- Configure database connection
- Run database migrations

## 🔒 Security Features

- Row Level Security (RLS) on all database tables
- PKCE authentication flow
- Secure session management with httpOnly cookies
- Input sanitization
- CSRF protection
- Environment variable encryption
- Sentry error monitoring
- Rate limiting on API endpoints

## 📊 Monitoring & Analytics

- **Sentry**: Error tracking and performance monitoring
- **PostHog**: Privacy-focused user behavior analytics
- **Supabase**: Real-time database monitoring

## 💳 Payments

- Paddle payment processor for Pro plan subscriptions
- 30-day money-back guarantee
- Cancel anytime with no penalties

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Open a Pull Request

## 📝 License

MIT License - see LICENSE file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [ShadCN UI](https://ui.shadcn.com/)
- AI powered by [Groq](https://groq.com/)
- Database by [Supabase](https://supabase.com/)
- Payments by [Paddle](https://paddle.com/)

---

Built by [Muhammad Tanveer Abbas](https://muhammadtanveerabbas.vercel.app/)
