/**
 * Session Manager
 * Optimizes session handling with caching and performance improvements
 */

import { createClient } from '@/lib/supabase/server'

// In-memory cache for session validation (short-lived)
const sessionCache = new Map<string, { user: any; timestamp: number }>()
const CACHE_TTL = 60 * 1000 // 1 minute cache

export async function getSessionUser() {
  const supabase = await createClient()
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      console.error('Session error:', error)
      return null
    }
    
    return user
  } catch (error) {
    console.error('Failed to get session user:', error)
    return null
  }
}

export async function validateSession(token?: string) {
  if (!token) return null
  
  // Check cache first
  const cached = sessionCache.get(token)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.user
  }
  
  // Fetch fresh session
  const user = await getSessionUser()
  
  if (user && token) {
    sessionCache.set(token, { user, timestamp: Date.now() })
  }
  
  return user
}

export function clearSessionCache(token?: string) {
  if (token) {
    sessionCache.delete(token)
  } else {
    sessionCache.clear()
  }
}

// Cleanup old cache entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of sessionCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      sessionCache.delete(key)
    }
  }
}, CACHE_TTL)
