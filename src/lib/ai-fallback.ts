import Groq from 'groq-sdk'

// ─── Tunable reliability settings (exported for tests / tuning) ────────────

export const DEFAULT_MODEL = 'llama-3.3-70b-versatile'
export const FALLBACK_MODELS: readonly string[] = [
  'llama-3.3-70b-versatile',
  'llama-3.1-70b-versatile',
  'llama-3.1-8b-instant',
  'openai/gpt-oss-120b',
]
export const MODELS_CACHE_TTL_MS = 60 * 60 * 1000
export const RATE_LIMIT_MAX_RETRIES = 3
export const RATE_LIMIT_BASE_DELAY_MS = 1000
export const RATE_LIMIT_MAX_DELAY_MS = 15000
export const TRANSIENT_MAX_RETRIES = 2

const groqApiKey = process.env.GROQ_API_KEY

let groq: Groq | null = null
if (groqApiKey) {
  try {
    // maxRetries: 0 the reliability layer below owns retry behavior.
    groq = new Groq({ apiKey: groqApiKey, maxRetries: 0, timeout: 60000 })
  } catch (e) {
    console.error('[AI] Failed to initialize Groq:', e)
  }
}

export interface CompletionOptions {
  model?: string
  maxTokens?: number
  temperature?: number
}

// ─── Small pure helpers (exported for tests) ───────────────────────────────

function statusOf(err: unknown): unknown {
  return typeof err === 'object' && err !== null
    ? (err as { status?: unknown }).status
    : undefined
}

export function isRateLimitError(err: unknown): boolean {
  return statusOf(err) === 429
}

export function isServerError(err: unknown): boolean {
  const status = statusOf(err)
  return typeof status === 'number' && status >= 500 && status < 600
}

export function isConnectionError(err: unknown): boolean {
  if (typeof err !== 'object' || err === null) return false
  const name = (err as { name?: unknown }).name
  const message = (err as { message?: unknown }).message
  if (name === 'APIConnectionError' || name === 'APIConnectionTimeoutError') return true
  return (
    typeof message === 'string' &&
    /(fetch failed|network error|ECONN|ETIMEDOUT|ENOTFOUND|aborted|timed out)/i.test(message)
  )
}

export function isModelUnavailableError(err: unknown): boolean {
  if (typeof err !== 'object' || err === null) return false
  const status = statusOf(err)
  const message = (err as { message?: unknown }).message
  if (status === 404) return true
  if (typeof message !== 'string') return false
  const mentionsModel = /model/i.test(message)
  const modelProblem =
    /(not found|does not exist|unavailable|deprecated|removed|unsupported|invalid|unknown)/i.test(
      message
    )
  return mentionsModel && modelProblem
}

/**
 * Respects `Retry-After` / `retry-after-ms` from the provider when present,
 * otherwise returns null so callers fall back to exponential backoff.
 * The value is capped at `maxMs`.
 */
export function parseRetryAfterMs(
  err: unknown,
  maxMs: number = RATE_LIMIT_MAX_DELAY_MS
): number | null {
  if (typeof err !== 'object' || err === null) return null
  const headers = (err as { headers?: unknown }).headers
  if (!headers || typeof (headers as { get?: unknown }).get !== 'function') return null
  const get = (headers as { get: (name: string) => string | null }).get.bind(headers)

  const retryAfterMs = get('retry-after-ms')
  if (retryAfterMs) {
    const parsed = Number(retryAfterMs)
    if (Number.isFinite(parsed) && parsed >= 0) return Math.min(parsed, maxMs)
  }

  const retryAfter = get('retry-after')
  if (retryAfter) {
    const seconds = Number(retryAfter)
    if (Number.isFinite(seconds) && seconds >= 0) return Math.min(seconds * 1000, maxMs)
    const parsedDate = Date.parse(retryAfter)
    if (!Number.isNaN(parsedDate)) {
      return Math.max(0, Math.min(parsedDate - Date.now(), maxMs))
    }
  }

  return null
}

/** Bounded exponential backoff with jitter (50-100% of the nominal delay). */
export function calculateRetryDelayMs(
  attempt: number,
  baseMs: number = RATE_LIMIT_BASE_DELAY_MS,
  maxMs: number = RATE_LIMIT_MAX_DELAY_MS
): number {
  const exponential = Math.min(baseMs * 2 ** attempt, maxMs)
  const jitter = 0.5 + Math.random() * 0.5
  return Math.round(exponential * jitter)
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// ─── Reliable Groq client factory (injectable client for tests) ────────────

export interface ReliableClientOptions {
  apiKey?: string
  modelsCacheTtlMs?: number
  rateLimitMaxRetries?: number
  rateLimitBaseDelayMs?: number
  rateLimitMaxDelayMs?: number
  transientMaxRetries?: number
}

export interface ReliableClient {
  completion(prompt: string, systemPrompt: string, options?: CompletionOptions): Promise<string>
}

export function createReliableClient(
  client: Groq,
  options: ReliableClientOptions = {}
): ReliableClient {
  const modelsCacheTtlMs = options.modelsCacheTtlMs ?? MODELS_CACHE_TTL_MS
  const rateLimitMaxRetries = options.rateLimitMaxRetries ?? RATE_LIMIT_MAX_RETRIES
  const rateLimitBaseDelayMs = options.rateLimitBaseDelayMs ?? RATE_LIMIT_BASE_DELAY_MS
  const rateLimitMaxDelayMs = options.rateLimitMaxDelayMs ?? RATE_LIMIT_MAX_DELAY_MS
  const transientMaxRetries = options.transientMaxRetries ?? TRANSIENT_MAX_RETRIES
  const apiKey = options.apiKey

  let modelsCache: { available: Set<string>; fetchedAt: number } | null = null

  function redact(message: string): string {
    if (!apiKey) return message
    return message.split(apiKey).join('[REDACTED]')
  }

  async function refreshModels(): Promise<Set<string> | null> {
    try {
      const res = await client.models.list()
      const available = new Set((res.data || []).map((m) => m.id))
      modelsCache = { available, fetchedAt: Date.now() }
      return available
    } catch (e) {
      console.error(
        '[AI] Failed to fetch Groq model list:',
        redact(e instanceof Error ? e.message : String(e))
      )
      // Negative cache: avoid hammering the model endpoint during an outage.
      modelsCache = { available: new Set(), fetchedAt: Date.now() }
      return null
    }
  }

  function selectModel(preferred: string): string {
    const available = modelsCache?.available
    if (available && available.size > 0) {
      if (available.has(preferred)) return preferred
      const fallback = FALLBACK_MODELS.find((m) => m !== preferred && available.has(m))
      if (fallback) return fallback
    }
    return preferred
  }

  async function runCompletion(
    prompt: string,
    systemPrompt: string,
    model: string,
    options: CompletionOptions,
    allowModelFallback: boolean
  ): Promise<string> {
    const maxTokens = options.maxTokens ?? 3000
    const temperature = options.temperature ?? 0.7

    for (let attempt = 0; ; attempt++) {
      try {
        const response = await client.chat.completions.create({
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
        if (!content) throw new Error('Empty response from AI model')
        return content
      } catch (err: unknown) {
        if (statusOf(err) === 401) {
          throw new Error('Invalid Groq API key. Check your GROQ_API_KEY.')
        }

        // Unavailable/deprecated model → refresh the list and retry once on a fallback.
        if (isModelUnavailableError(err) && allowModelFallback) {
          console.warn(
            `[AI] Model "${model}" unavailable; refreshing model list and selecting a fallback.`
          )
          await refreshModels()
          const fallback = selectModel(model)
          if (fallback !== model) {
            return await runCompletion(prompt, systemPrompt, fallback, options, false)
          }
          throw new Error(
            `AI model "${model}" is unavailable and no compatible fallback model is available.`
          )
        }

        // Rate limits: respect Retry-After, otherwise bounded exponential backoff + jitter.
        if (isRateLimitError(err)) {
          if (attempt < rateLimitMaxRetries) {
            const retryAfter = parseRetryAfterMs(err, rateLimitMaxDelayMs)
            const delayMs =
              retryAfter ?? calculateRetryDelayMs(attempt, rateLimitBaseDelayMs, rateLimitMaxDelayMs)
            await sleep(delayMs)
            continue
          }
          throw new Error('AI rate limit reached. Please wait a moment and try again.')
        }

        // Transient provider failures: bounded retries, never indefinite.
        if (isServerError(err) || isConnectionError(err)) {
          if (attempt < transientMaxRetries) {
            await sleep(
              calculateRetryDelayMs(attempt, rateLimitBaseDelayMs, rateLimitMaxDelayMs)
            )
            continue
          }
          throw new Error('AI service temporarily unavailable. Please try again.')
        }

        throw new Error(redact(err instanceof Error ? err.message : 'AI generation failed'))
      }
    }
  }

  async function completion(
    prompt: string,
    systemPrompt: string,
    options: CompletionOptions = {}
  ): Promise<string> {
    const preferred = options.model ?? DEFAULT_MODEL
    if (!modelsCache || Date.now() - modelsCache.fetchedAt >= modelsCacheTtlMs) {
      await refreshModels()
    }
    return await runCompletion(prompt, systemPrompt, selectModel(preferred), options, true)
  }

  return { completion }
}

const reliableClient = groq ? createReliableClient(groq, { apiKey: groqApiKey }) : null

// ─── Token estimation / chunking (preserved behavior) ──────────────────────

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

const modelLimits: Record<string, number> = {
  'openai/gpt-oss-120b': 6000,
  'llama-3.3-70b-versatile': 32000,
  'llama-3.1-70b-versatile': 32000,
  'llama-3.1-8b-instant': 8000,
  'mixtral-8x7b-32768': 32000,
}

// ─── Public API (used by route handlers) ───────────────────────────────────

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
    model = DEFAULT_MODEL,
    maxTokens = 3000,
    temperature = 0.7,
  } = options

  if (!groqApiKey) {
    throw new Error('GROQ_API_KEY is not configured. Please add it to your environment variables.')
  }
  if (!reliableClient) {
    throw new Error('Groq client failed to initialize. Check your GROQ_API_KEY.')
  }

  const totalTokens = estimateTokens(systemPrompt + prompt)
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
        const chunkSummary = await reliableClient.completion(
          chunkPrompt,
          systemPrompt + '\n\nNote: This is part of a larger text. Summarize this section.',
          { model, maxTokens, temperature }
        )
        summaries.push(chunkSummary)
      }

      const finalPrompt = `Combine these ${summaries.length} summaries into one cohesive summary:\n\n${summaries.map((s, i) => `Part ${i + 1}:\n${s}`).join('\n\n---\n\n')}`
      return await reliableClient.completion(finalPrompt, systemPrompt, {
        model,
        maxTokens,
        temperature,
      })
    }
  }

  return await reliableClient.completion(prompt, systemPrompt, { model, maxTokens, temperature })
}

/**
 * Low-level completion that does not chunk. Intended for structured-output
 * calls (e.g. YouTube analysis) that need the raw text. Includes the same
 * model discovery/fallback, rate-limit, and transient-error handling.
 */
export async function generateCompletion(
  prompt: string,
  systemPrompt: string,
  options: {
    model?: string
    maxTokens?: number
    temperature?: number
  } = {}
): Promise<string> {
  if (!groqApiKey) {
    throw new Error('GROQ_API_KEY is not configured. Please add it to your environment variables.')
  }
  if (!reliableClient) {
    throw new Error('Groq client failed to initialize. Check your GROQ_API_KEY.')
  }
  return await reliableClient.completion(prompt, systemPrompt, options)
}
