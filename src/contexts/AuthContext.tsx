'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User, Session } from '@supabase/supabase-js'
import posthog from 'posthog-js'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
      
      // Identify user in PostHog
      if (session?.user) {
        posthog.identify(session.user.id, {
          email: session.user.email,
        })
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)

      // Track auth events in PostHog
      if (event === 'SIGNED_IN' && session?.user) {
        posthog.identify(session.user.id, {
          email: session.user.email,
        })
        posthog.capture('user_signed_in')
      } else if (event === 'SIGNED_OUT') {
        posthog.capture('user_signed_out')
        posthog.reset()
      }

      // Auto-refresh session
      if (session) {
        // Refresh session every 30 minutes
        const refreshInterval = setInterval(async () => {
          const { data: { session: newSession } } = await supabase.auth.refreshSession()
          if (newSession) {
            setSession(newSession)
            setUser(newSession.user)
          }
        }, 30 * 60 * 1000)

        return () => clearInterval(refreshInterval)
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const signOut = async () => {
    posthog.capture('user_signed_out')
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
    posthog.reset()
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
