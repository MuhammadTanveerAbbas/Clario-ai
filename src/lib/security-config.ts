/**
 * Security Configuration
 * Centralized security settings for cookies, sessions, and headers
 */

export const COOKIE_CONFIG = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 60 * 60 * 24 * 7, // 7 days
  path: '/',
  domain: process.env.NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_DOMAIN : undefined,
  priority: 'high' as const,
}

export const SESSION_CONFIG = {
  // Session timeout (7 days)
  maxAge: 60 * 60 * 24 * 7,
  // Refresh token before expiry (1 hour before)
  refreshThreshold: 60 * 60,
  // Auto refresh enabled
  autoRefresh: true,
  // PKCE flow for enhanced security
  flowType: 'pkce' as const,
}

export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '0',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.paddle.com https://js.sentry-cdn.com https://us-assets.i.posthog.com",
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
  // API rate limits per minute
  api: {
    default: 60,
    auth: 5,
    ai: 20,
  },
  // Session validation cache TTL
  sessionCacheTTL: 60 * 1000, // 1 minute
  // IP-based blocking
  maxFailedAttempts: 5,
  blockDuration: 15 * 60 * 1000, // 15 minutes
}

export const CSRF_CONFIG = {
  enabled: true,
  tokenLength: 32,
  cookieName: '__Host-csrf-token',
  headerName: 'X-CSRF-Token',
}
