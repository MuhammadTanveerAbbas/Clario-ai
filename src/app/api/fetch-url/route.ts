import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit } from '@/middleware/rate-limit'

export const maxDuration = 30
export const dynamic = 'force-dynamic'

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCharCode(parseInt(h, 16)))
}

function extractTextFromHtml(html: string): { title: string; text: string } {
  // Extract title — prefer og:title, then <title>
  const ogTitleMatch =
    html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i) ||
    html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i)
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
  const rawTitle = ogTitleMatch?.[1] || titleMatch?.[1] || ''
  const title = decodeHtmlEntities(rawTitle.trim().replace(/\s+/g, ' '))

  // Remove non-content blocks before any other processing
  let cleaned = html
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<nav\b[\s\S]*?<\/nav>/gi, ' ')
    .replace(/<footer\b[\s\S]*?<\/footer>/gi, ' ')
    .replace(/<header\b[\s\S]*?<\/header>/gi, ' ')
    .replace(/<aside\b[\s\S]*?<\/aside>/gi, ' ')
    .replace(/<form\b[\s\S]*?<\/form>/gi, ' ')
    .replace(/<noscript\b[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')

  // Prefer semantic content containers in priority order
  const selectors = [
    /<article\b[\s\S]*?<\/article>/i,
    /<main\b[\s\S]*?<\/main>/i,
    /<div[^>]+(?:class|id)=["'][^"']*(?:content|post|article|entry|story|body)[^"']*["'][\s\S]*?<\/div>/i,
  ]
  for (const re of selectors) {
    const m = cleaned.match(re)
    if (m) { cleaned = m[0]; break }
  }

  // Strip remaining tags, decode entities, normalise whitespace
  const text = decodeHtmlEntities(
    cleaned
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<\/li>/gi, '\n')
      .replace(/<\/h[1-6]>/gi, '\n')
      .replace(/<[^>]+>/g, ' ')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
  )

  return { title, text }
}

function isYouTubeUrl(url: string): boolean {
  return /(?:youtube\.com|youtu\.be)/i.test(url)
}

export async function POST(req: NextRequest) {
  try {
    const rateLimitCheck = checkRateLimit(req, 'api')
    if (!rateLimitCheck.allowed) return rateLimitCheck.response!

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let body: { url?: string }
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const url = body.url?.trim()
    if (!url) return NextResponse.json({ error: 'URL is required' }, { status: 400 })

    if (isYouTubeUrl(url)) {
      return NextResponse.json({ error: 'Use the YouTube tab for YouTube URLs' }, { status: 400 })
    }

    let parsed: URL
    try {
      parsed = new URL(url.startsWith('http') ? url : `https://${url}`)
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
    }

    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return NextResponse.json({ error: 'Only HTTP/HTTPS URLs are supported' }, { status: 400 })
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 20000)

    let html: string
    let finalUrl = parsed.toString()
    try {
      const res = await fetch(parsed.toString(), {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'Cache-Control': 'no-cache',
        },
        redirect: 'follow',
      })
      clearTimeout(timeout)

      if (!res.ok) {
        if (res.status === 403 || res.status === 401) {
          return NextResponse.json({ error: `This page requires authentication or blocks scrapers (${res.status})` }, { status: 422 })
        }
        return NextResponse.json({ error: `Failed to fetch URL (HTTP ${res.status})` }, { status: 422 })
      }

      const contentType = res.headers.get('content-type') || ''
      if (!contentType.includes('text/html') && !contentType.includes('text/plain') && !contentType.includes('application/xhtml')) {
        return NextResponse.json({ error: 'URL must point to a web page with readable text' }, { status: 422 })
      }

      finalUrl = res.url || finalUrl
      html = await res.text()
    } catch (err: unknown) {
      clearTimeout(timeout)
      const name = err instanceof Error ? err.name : ''
      const msg = err instanceof Error ? err.message : ''
      if (name === 'AbortError' || msg.includes('abort')) {
        return NextResponse.json({ error: 'Request timed out (20s). The server may be slow or blocking bots.' }, { status: 422 })
      }
      return NextResponse.json({ error: 'Could not reach the URL. Check that it is publicly accessible.' }, { status: 422 })
    }

    const { title, text } = extractTextFromHtml(html)

    if (text.length < 100) {
      return NextResponse.json({
        error: 'Could not extract enough text from this page. Try pasting the content directly.',
      }, { status: 422 })
    }

    const truncated = text.slice(0, 60000)

    return NextResponse.json({
      title: title || parsed.hostname,
      text: truncated,
      url: finalUrl,
      charCount: truncated.length,
      source: 'web',
    })
  } catch (error) {
    console.error('[fetch-url] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch URL content' }, { status: 500 })
  }
}
