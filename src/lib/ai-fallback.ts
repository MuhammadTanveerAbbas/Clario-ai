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
    stream?: boolean
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
      top_p: 0.9,
      frequency_penalty: 0.1,
      presence_penalty: 0.1,
    })
    return response.choices[0]?.message?.content?.trim() || ''
  } catch (groqError: any) {
    console.error('[AI] Groq failed:', groqError?.message || groqError)
    throw new Error(`AI generation failed: ${groqError?.message || 'Unknown error'}`)
  }
}
