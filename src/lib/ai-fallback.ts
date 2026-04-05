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

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}

function chunkText(text: string, maxChunkTokens: number): string[] {
  const words = text.split(/\s+/)
  const chunks: string[] = []
  let currentChunk: string[] = []
  let currentTokens = 0

  for (const word of words) {
    const wordTokens = estimateTokens(word + ' ')
    if (currentTokens + wordTokens > maxChunkTokens && currentChunk.length > 0) {
      chunks.push(currentChunk.join(' '))
      currentChunk = [word]
      currentTokens = wordTokens
    } else {
      currentChunk.push(word)
      currentTokens += wordTokens
    }
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join(' '))
  }

  return chunks
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

  const totalTokens = estimateTokens(systemPrompt + prompt)
  const modelLimits: Record<string, number> = {
    'openai/gpt-oss-120b': 6000,
    'llama-3.3-70b-versatile': 30000,
    'llama-3.1-70b-versatile': 30000,
    'mixtral-8x7b-32768': 30000,
  }

  const modelLimit = modelLimits[model] || 30000

  if (totalTokens > modelLimit) {
    const maxChunkTokens = modelLimit - estimateTokens(systemPrompt) - 500
    const textMatch = prompt.match(/---\n\n([\s\S]+)$/)
    const textContent = textMatch ? textMatch[1] : prompt
    const chunks = chunkText(textContent, maxChunkTokens)

    if (chunks.length > 1) {
      const summaries: string[] = []
      for (let i = 0; i < chunks.length; i++) {
        const chunkPrompt = `Part ${i + 1} of ${chunks.length}:\n\n${chunks[i]}`
        const chunkSummary = await generateSingleCompletion(
          chunkPrompt,
          systemPrompt + '\n\nNote: This is part of a larger text. Summarize this section.',
          model,
          maxTokens,
          temperature
        )
        summaries.push(chunkSummary)
      }

      const finalPrompt = `Combine these ${summaries.length} summaries into one cohesive summary:\n\n${summaries.map((s, i) => `Part ${i + 1}:\n${s}`).join('\n\n---\n\n')}`
      return await generateSingleCompletion(finalPrompt, systemPrompt, model, maxTokens, temperature)
    }
  }

  return await generateSingleCompletion(prompt, systemPrompt, model, maxTokens, temperature)
}

async function generateSingleCompletion(
  prompt: string,
  systemPrompt: string,
  model: string,
  maxTokens: number,
  temperature: number
): Promise<string> {
  try {
    const response = await groq!.chat.completions.create({
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
    if (err?.status === 429 || err?.error?.code === 'rate_limit_exceeded') {
      throw new Error('AI rate limit reached. Try using a shorter text or wait a moment.')
    }
    if (err?.status === 503 || err?.status === 500) throw new Error('AI service temporarily unavailable. Please try again.')
    if (err?.message?.includes('model')) throw new Error(`Model error: ${err.message}`)
    throw new Error(err?.message || 'AI generation failed')
  }
}
