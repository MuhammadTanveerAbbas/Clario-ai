import Groq from 'groq-sdk'

const groqApiKey = process.env.GROQ_API_KEY

if (!groqApiKey) {
  throw new Error('GROQ_API_KEY environment variable is not set')
}

let groq: Groq | null = null

try {
  groq = new Groq({ apiKey: groqApiKey })
} catch (e) {
  console.error('[AI] Failed to initialize Groq:', e)
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
  const { model = 'llama-3.3-70b-versatile', maxTokens = 2048, temperature = 0.7 } = options

  if (!groq) {
    throw new Error('Groq API not initialized. Check GROQ_API_KEY.')
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
    })
    console.log(`[AI] Groq success — model: ${model}`)
    return response.choices[0]?.message?.content || ''
  } catch (groqError: any) {
    console.error('[AI] Groq failed:', groqError?.message || groqError)
    throw new Error(`Groq API error: ${groqError?.message || 'Unknown error'}`)
  }
}
