export const COOKIE_CONFIG = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 60 * 60 * 24 * 365,
  path: '/',
  domain: process.env.NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_DOMAIN : undefined,
}

export const SESSION_CONFIG = {
  maxAge: 60 * 60 * 24 * 365,
  refreshThreshold: 60 * 60 * 24,
  autoRefresh: true,
  flowType: 'pkce' as const,
}

export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '0',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  // CSP allows Paddle (payments), Sentry (monitoring), PostHog (analytics), and Groq/Gemini (AI)
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.paddle.com https://js.sentry-cdn.com https://us-assets.i.posthog.com",
    "worker-src 'self' blob:",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https: blob:",
    "font-src 'self' data:",
    "connect-src 'self' https://*.supabase.co https://api.groq.com https://generativelanguage.googleapis.com https://cdn.paddle.com https://*.sentry.io https://*.posthog.com",
    "frame-src 'self' https://cdn.paddle.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join('; '),
}

export const RATE_LIMIT_CONFIG = {
  api: {
    default: 60,
    auth: 5,
    ai: 20,
  },
  sessionCacheTTL: 60 * 1000,
  maxFailedAttempts: 5,
  blockDuration: 15 * 60 * 1000,
}

export const CSRF_CONFIG = {
  enabled: true,
  tokenLength: 32,
  cookieName: '__Host-csrf-token',
  headerName: 'X-CSRF-Token',
}
