import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { checkRateLimit } from '@/lib/upstash-rate-limit'

export async function middleware(request: NextRequest) {
  const rateLimitResult = await checkRateLimit(request, 'api')
  if (!rateLimitResult.allowed) {
    return rateLimitResult.response!
  }

  if (request.method !== 'GET' && request.method !== 'HEAD' && request.method !== 'OPTIONS') {
    const origin = request.headers.get('origin')
    const referer = request.headers.get('referer')
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    if (process.env.E2E_TEST_MODE !== '1') {
      try {
        const appOrigin = new URL(appUrl).origin
        const originValid = !origin || new URL(origin).origin === appOrigin
        const refererValid = !referer || new URL(referer).origin === appOrigin

        if (!origin && !referer) {
          // Allow requests without origin/referer headers (some clients don't send them)
        } else if (!originValid || !refererValid) {
          return new NextResponse(
            JSON.stringify({ error: 'Invalid request origin' }),
            { status: 403, headers: { 'Content-Type': 'application/json' } }
          )
        }
      } catch {
        return new NextResponse(
          JSON.stringify({ error: 'Invalid request origin' }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        )
      }
    }
  }

  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sw.js|manifest.json|robots.txt|opengraph-image|twitter-image|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|js|json|txt)$|api/cron).*)',
  ],
}
