import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { COOKIE_CONFIG, SESSION_CONFIG } from '../security-config'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, {
                ...options,
                ...COOKIE_CONFIG,
              })
            })
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
      auth: {
        flowType: SESSION_CONFIG.flowType,
        autoRefreshToken: SESSION_CONFIG.autoRefresh,
        detectSessionInUrl: false,
        persistSession: true,
      },
    }
  )
}

