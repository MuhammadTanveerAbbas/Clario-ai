import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const start = Date.now()

  const results = {
    status: 'ok' as 'ok' | 'degraded',
    timestamp: new Date().toISOString(),
    version: process.env.NEXT_PUBLIC_APP_VERSION || '3.0.0',
    checks: {} as Record<string, { status: string; latency?: number; error?: string }>,
  }

  // Check Supabase connectivity
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (supabaseUrl && supabaseAnonKey) {
    const dbStart = Date.now()
    try {
      const supabase = createClient(supabaseUrl, supabaseAnonKey)
      const { error } = await supabase.from('profiles').select('id').limit(1).maybeSingle()
      results.checks.database = {
        status: error ? 'error' : 'ok',
        latency: Date.now() - dbStart,
        error: error?.message,
      }
    } catch (err: unknown) {
      results.checks.database = {
        status: 'error',
        error: err instanceof Error ? err.message : 'Unknown error',
      }
    }
  } else {
    results.checks.database = { status: 'not_configured' }
  }

  // Check env vars exist (don't expose values)
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'GROQ_API_KEY',
  ] as const

  for (const key of requiredVars) {
    results.checks[key] = {
      status: process.env[key] ? 'configured' : 'missing',
    }
  }

  const totalLatency = Date.now() - start
  results.checks.total = { status: 'ok', latency: totalLatency }

  const hasError = Object.values(results.checks).some(c => c.status === 'error')
  if (hasError) {
    results.status = 'degraded'
  }

  return NextResponse.json(results, {
    status: hasError ? 503 : 200,
  })
}
