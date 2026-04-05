import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { COOKIE_CONFIG, SESSION_CONFIG } from '../security-config'

type CookieToSet = {
  name: string
  value: string
  options?: Record<string, unknown>
}

export async function createClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
  }

  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: CookieToSet[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch {
            // Ignore - called from Server Component
          }
        },
      },
      auth: {
        flowType: 'pkce',
        autoRefreshToken: true,
        detectSessionInUrl: false,
        persistSession: true,
      },
    }
  )
}

