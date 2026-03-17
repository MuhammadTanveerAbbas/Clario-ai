import Groq from 'groq-sdk'

if (!process.env.GROQ_API_KEY) {
  throw new Error('Missing GROQ_API_KEY environment variable')
}

const groqApiKey = process.env.GROQ_API_KEY

if (!groqApiKey) {
  console.error('[AI] GROQ_API_KEY environment variable is not set')
}

let groq: Groq | null = null

if (groqApiKey) {
  try {
    groq = new Groq({ apiKey: groqApiKey })
    console.log('[AI] Groq initialized successfully')
  } catch (e) {
    console.error('[AI] Failed to initialize Groq:', e)
  }
} else {
  console.error('[AI] Cannot initialize Groq - API key missing')
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

  console.log('[AI] Generating with model:', model);

  if (!groq) {
    const error = 'Groq API not initialized. Check GROQ_API_KEY environment variable.';
    console.error('[AI]', error);
    throw new Error(error)
  }

  if (!groqApiKey) {
    const error = 'GROQ_API_KEY is not set';
    console.error('[AI]', error);
    throw new Error(error)
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
    
    const content = response.choices[0]?.message?.content?.trim() || ''
    
    if (!content) {
      console.error('[AI] Empty response from Groq');
      throw new Error('Empty response from AI')
    }
    
    console.log('[AI] Generated successfully, length:', content.length);
    return content
  } catch (groqError: any) {
    console.error('[AI] Groq error:', {
      message: groqError?.message,
      status: groqError?.status,
      error: groqError?.error,
    });
    
    // Provide more specific error messages
    if (groqError?.status === 401) {
      throw new Error('Invalid Groq API key')
    } else if (groqError?.status === 429) {
      throw new Error('Groq API rate limit exceeded')
    } else if (groqError?.status === 500) {
      throw new Error('Groq API server error')
    }
    
    throw new Error(`AI generation failed: ${groqError?.message || 'Unknown error'}`)
  }
}
