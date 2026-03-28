import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

const store: RateLimitStore = {}

export function rateLimit(
  request: NextRequest,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetTime: number } {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'anonymous'
  const identifier = ip
  const now = Date.now()
  const key = `${identifier}-${Math.floor(now / windowMs)}`

  if (!store[key]) {
    store[key] = {
      count: 0,
      resetTime: now + windowMs,
    }
  }

  store[key].count++

  // Evict expired windows to prevent unbounded memory growth
  Object.keys(store).forEach((k) => {
    if (store[k].resetTime < now) {
      delete store[k]
    }
  })

  const allowed = store[key].count <= maxRequests
  const remaining = Math.max(0, maxRequests - store[key].count)

  return {
    allowed,
    remaining,
    resetTime: store[key].resetTime,
  }
}

export function checkRateLimit(
  request: NextRequest,
  type: 'auth' | 'api'
): { allowed: boolean; response?: NextResponse } {
  const maxRequests =
    type === 'auth'
      ? parseInt(process.env.RATE_LIMIT_AUTH_MAX || '5')
      : parseInt(process.env.RATE_LIMIT_API_MAX || '100')
  const windowMs =
    type === 'auth'
      ? parseInt(process.env.RATE_LIMIT_AUTH_WINDOW || '900') * 1000
      : parseInt(process.env.RATE_LIMIT_API_WINDOW || '60') * 1000

  const result = rateLimit(request, maxRequests, windowMs)

  if (!result.allowed) {
    return {
      allowed: false,
      response: NextResponse.json(
        {
          error: 'Too many requests',
          message: `Rate limit exceeded. Please try again after ${new Date(result.resetTime).toISOString()}`,
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': maxRequests.toString(),
            'X-RateLimit-Remaining': result.remaining.toString(),
            'X-RateLimit-Reset': result.resetTime.toString(),
            'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString(),
          },
        }
      ),
    }
  }

  return {
    allowed: true,
  }
}

