/**
 * In-process rate limiter.
 *
 * Works correctly in development and on single-instance deploys. On Vercel
 * serverless (multiple instances), each instance has its own store — rate
 * limiting is best-effort, not strict. For strict production rate limiting,
 * migrate to Upstash Redis later.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

interface WindowEntry {
  count: number;
  resetTime: number;
}

const store = new Map<string, WindowEntry>();

let lastEviction = Date.now();
const EVICTION_INTERVAL_MS = 5 * 60 * 1000;

function maybeEvict(now: number): void {
  if (now - lastEviction < EVICTION_INTERVAL_MS) return;
  lastEviction = now;
  for (const [key, entry] of store.entries()) {
    if (entry.resetTime < now) store.delete(key);
  }
}

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'anonymous'
  );
}

export function rateLimit(
  request: NextRequest,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  maybeEvict(now);

  const ip = getClientIp(request);
  const windowKey = Math.floor(now / windowMs);
  const key = `${ip}:${windowKey}`;

  const existing = store.get(key);

  if (!existing) {
    store.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetTime: now + windowMs };
  }

  existing.count++;
  const allowed = existing.count <= maxRequests;
  const remaining = Math.max(0, maxRequests - existing.count);

  return { allowed, remaining, resetTime: existing.resetTime };
}

export function checkRateLimit(
  request: NextRequest,
  type: 'auth' | 'api'
): { allowed: boolean; response?: NextResponse } {
  const maxRequests =
    type === 'auth'
      ? parseInt(process.env.RATE_LIMIT_AUTH_MAX ?? '5', 10)
      : parseInt(process.env.RATE_LIMIT_API_MAX ?? '100', 10);

  const windowMs =
    type === 'auth'
      ? parseInt(process.env.RATE_LIMIT_AUTH_WINDOW ?? '900', 10) * 1000
      : parseInt(process.env.RATE_LIMIT_API_WINDOW ?? '60', 10) * 1000;

  const result = rateLimit(request, maxRequests, windowMs);

  if (!result.allowed) {
    return {
      allowed: false,
      response: NextResponse.json(
        {
          error: 'Too many requests',
          message: `Rate limit exceeded. Please try again after ${new Date(result.resetTime).toISOString()}`,
          retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((result.resetTime - Date.now()) / 1000)),
            'X-RateLimit-Limit': String(maxRequests),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Math.ceil(result.resetTime / 1000)),
          },
        }
      ),
    };
  }

  return { allowed: true };
}
