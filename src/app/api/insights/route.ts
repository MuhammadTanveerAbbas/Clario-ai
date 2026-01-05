import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all documents and entities
    const { data: documents } = await supabase
      .from('analyzed_documents')
      .select('id, filename, analysis_result')
      .eq('user_id', user.id)
      .limit(10)

    const { data: entities } = await supabase
      .from('entities')
      .select('entity_text, entity_type')
      .eq('user_id', user.id)
      .limit(50)

    if (!documents || documents.length === 0) {
      return NextResponse.json({ insights: [] })
    }

    // Use OpenRouter to generate cross-document insights
    const documentSummary = documents
      .map((doc) => `${doc.filename}: ${doc.analysis_result?.substring(0, 500)}`)
      .join('\n\n')

    const entitySummary = entities
      ?.map((e) => `${e.entity_text} (${e.entity_type})`)
      .join(', ')

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an AI analyst. Generate 3-5 key insights from the provided documents and entities. Focus on patterns, connections, and actionable findings.',
        },
        {
          role: 'user',
          content: `Documents:\n${documentSummary}\n\nKey Entities:\n${entitySummary}`,
        },
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.7,
      max_tokens: 1024,
    })

    const insightText = completion.choices[0]?.message?.content || ''
    const insights = insightText.split('\n').filter((line) => line.trim().length > 0)

    // Save insights to database
    await supabase.from('insights').insert({
      user_id: user.id,
      insight_text: insightText,
      insight_type: 'cross_document',
      related_documents: documents.map((d) => d.id),
    })

    return NextResponse.json({ insights })
  } catch (error: any) {
    console.error('Insights generation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate insights' },
      { status: 500 }
    )
  }
}
