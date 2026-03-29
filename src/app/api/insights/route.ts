import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateWithFallback } from '@/lib/ai-fallback'

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch recent summaries to generate insights from
    const { data: summaries, error: summariesError } = await supabase
      .from('ai_summaries')
      .select('id, summary_text, mode, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)

    if (summariesError) {
      return NextResponse.json({ error: 'Failed to fetch summaries' }, { status: 500 })
    }

    if (!summaries || summaries.length < 2) {
      return NextResponse.json({
        insights: [],
        message: 'Create at least 2 summaries to generate cross-content insights.',
      })
    }

    const contentSummary = summaries
      .map((s, i) => `[${i + 1}] (${s.mode}): ${s.summary_text?.substring(0, 400)}`)
      .join('\n\n')

    const insightText = await generateWithFallback(
      `Here are recent content summaries from a creator:\n\n${contentSummary}`,
      'You are an AI content strategist. Analyze these summaries and generate 3-5 actionable insights about patterns, recurring themes, content gaps, and opportunities. Be specific and practical. Format as a numbered list.',
      { model: 'llama-3.1-8b-instant', maxTokens: 800, temperature: 0.6 }
    )

    const insights = insightText
      .split('\n')
      .filter((line) => line.trim().length > 0)
      .slice(0, 10)

    return NextResponse.json({ insights })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to generate insights' },
      { status: 500 }
    )
  }
}
