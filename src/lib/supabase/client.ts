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
          let cookieString = `${name}=${encodeURIComponent(value)}; path=/`
          if (options?.maxAge) cookieString += `; max-age=${options.maxAge}`
          cookieString += '; SameSite=Lax'
          if (window.location.protocol === 'https:') cookieString += '; Secure'
          document.cookie = cookieString
        },
        remove(name: string) {
          if (typeof document === 'undefined') return
          document.cookie = `${name}=; path=/; max-age=0`
        },
      },
    }
  )
}

