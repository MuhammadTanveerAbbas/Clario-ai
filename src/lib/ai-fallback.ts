import Groq from 'groq-sdk'

const groqApiKey = process.env.GROQ_API_KEY

let groq: Groq | null = null

if (groqApiKey) {
  try {
    groq = new Groq({ apiKey: groqApiKey })
  } catch (e) {
    console.error('[AI] Failed to initialize Groq:', e)
  }
}

export async function generateWithFallback(
  prompt: string,
  systemPrompt: string,
  options: {
    model?: string
    maxTokens?: number
    temperature?: number
  } = {}
): Promise<string> {
  const {
    model = 'llama-3.3-70b-versatile',
    maxTokens = 3000,
    temperature = 0.7,
  } = options

  if (!groqApiKey) {
    throw new Error('GROQ_API_KEY is not configured. Please add it to your environment variables.')
  }

  if (!groq) {
    throw new Error('Groq client failed to initialize. Check your GROQ_API_KEY.')
  }

  try {
    const response = await groq.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      max_tokens: maxTokens,
      temperature,
      top_p: 0.95,
    })

    const content = response.choices[0]?.message?.content?.trim() || ''
    if (!content) throw new Error('Empty response from AI model')

    return content
  } catch (err: any) {
    if (err?.status === 401) throw new Error('Invalid Groq API key. Check your GROQ_API_KEY.')
    if (err?.status === 429) throw new Error('AI rate limit reached. Please wait a moment and try again.')
    if (err?.status === 503 || err?.status === 500) throw new Error('AI service temporarily unavailable. Please try again.')
    if (err?.message?.includes('model')) throw new Error(`Model error: ${err.message}`)
    throw new Error(err?.message || 'AI generation failed')
  }
}
