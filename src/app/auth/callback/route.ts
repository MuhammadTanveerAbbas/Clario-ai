import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const redirect =
    requestUrl.searchParams.get('next') ||
    requestUrl.searchParams.get('redirect') ||
    '/dashboard'

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(
            cookiesToSet: Array<{
              name: string
              value: string
              options?: Record<string, unknown>
            }>
          ) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // Cookie writes fail in middleware during static rendering  safe to ignore
            }
          },
        },
      }
    )
    
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('Auth callback error:', error)
      const errorUrl = new URL(requestUrl)
      errorUrl.pathname = '/sign-in'
      errorUrl.search = '?error=auth_failed'
      return NextResponse.redirect(errorUrl)
    }
  }

  const redirectUrl = new URL(requestUrl)
  redirectUrl.pathname = redirect.startsWith('/') ? redirect : `/${redirect}`
  redirectUrl.search = ''
  return NextResponse.redirect(redirectUrl)
}

