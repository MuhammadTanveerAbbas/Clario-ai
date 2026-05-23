import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET() {
  const headersList = await headers()
  const authHeader = headersList.get('Authorization')

  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    return NextResponse.json({ error: 'Cron configuration error' }, { status: 500 })
  }

  const requestAuth = authHeader?.replace('Bearer ', '')
  if (!requestAuth || requestAuth !== cronSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()

  const { error } = await supabase
    .from('profiles')
    .select('id')
    .limit(1)
    .single()

  if (error) {
    console.error('Keep-alive query failed:', error)
    return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })
  }

  return NextResponse.json({ status: 'ok', timestamp: new Date().toISOString() })
}