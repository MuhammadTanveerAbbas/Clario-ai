import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    {
      cookies: {
        get(name: string) {
          if (typeof document === 'undefined') return null
          const cookie = document.cookie
            .split('; ')
            .find((row) => row.startsWith(`${name}=`))
          return cookie ? decodeURIComponent(cookie.split('=')[1]) : null
        },
        set(name: string, value: string, options: any) {
          if (typeof document === 'undefined') return
          const maxAge = options?.maxAge || 60 * 60 * 24 * 365 // 1 year default
          const cookieOptions = [
            `${name}=${encodeURIComponent(value)}`,
            'path=/',
            'SameSite=Lax',
            `max-age=${maxAge}`,
          ]
          if (window.location.protocol === 'https:') cookieOptions.push('Secure')
          document.cookie = cookieOptions.join('; ')
        },
        remove(name: string) {
          if (typeof document === 'undefined') return
          document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`
        },
      },
      auth: {
        flowType: 'pkce',
        autoRefreshToken: true,
        detectSessionInUrl: true,
        persistSession: true,
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      },
    }
  )
}

