import Groq from 'groq-sdk'
import { GoogleGenerativeAI } from '@google/generative-ai'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! })
const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

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
  } catch (groqError) {
    console.error('[AI] Groq failed, falling back to Gemini:', groqError)
  }

  try {
    const geminiModel = gemini.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })
    const result = await geminiModel.generateContent(`${systemPrompt}\n\n${prompt}`)
    console.log('[AI] Gemini fallback success')
    return result.response.text()
  } catch (geminiError) {
    console.error('[AI] Both Groq and Gemini failed:', geminiError)
    throw new Error('AI service temporarily unavailable. Please try again in a moment.')
  }
}

