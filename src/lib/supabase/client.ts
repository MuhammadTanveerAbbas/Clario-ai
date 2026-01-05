import { createBrowserClient } from '@supabase/ssr'
import { SESSION_CONFIG } from '../security-config'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    {
      auth: {
        flowType: SESSION_CONFIG.flowType,
        autoRefreshToken: SESSION_CONFIG.autoRefresh,
        detectSessionInUrl: true,
        persistSession: true,
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      },
      global: {
        headers: {
          'x-client-info': 'clario-web',
        },
      },
    }
  )
}

