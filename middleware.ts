import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { RATE_LIMIT_CONFIG } from '@/lib/security-config'

const rateLimitMap = new Map<string, { count: number; resetTime: number; blocked: boolean }>()

function getRateLimitKey(request: NextRequest): string {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'anonymous'
  const path = request.nextUrl.pathname
  return `${ip}:${path}`
}

function checkRateLimit(key: string): { allowed: boolean; blocked: boolean } {
  const now = Date.now()
  const record = rateLimitMap.get(key)

  if (!record) {
    rateLimitMap.set(key, { count: 1, resetTime: now + 60000, blocked: false })
    return { allowed: true, blocked: false }
  }

  if (record.blocked && now < record.resetTime) {
    return { allowed: false, blocked: true }
  }

  if (now > record.resetTime) {
    record.count = 1
    record.resetTime = now + 60000
    record.blocked = false
    return { allowed: true, blocked: false }
  }

  record.count++

  if (record.count > RATE_LIMIT_CONFIG.api.default) {
    record.blocked = true
    record.resetTime = now + RATE_LIMIT_CONFIG.blockDuration
    return { allowed: false, blocked: true }
  }

  return { allowed: true, blocked: false }
}

export async function middleware(request: NextRequest) {
  const key = getRateLimitKey(request)
  const { allowed, blocked } = checkRateLimit(key)

  if (!allowed) {
    return new NextResponse(
      JSON.stringify({ error: blocked ? 'Too many requests. Please try again later.' : 'Rate limit exceeded' }),
      { status: blocked ? 429 : 429, headers: { 'Content-Type': 'application/json' } }
    )
  }

  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

