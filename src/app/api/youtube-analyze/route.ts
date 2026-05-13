/**
 * POST /api/youtube-analyze
 * Full structured analysis: TLDR, key points, topics, timeline, insights, sentiment.
 * Uses the native youtubei.js engine + Groq for analysis — no external service required.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/middleware/rate-limit';
import { extractVideoId, analyzeVideo } from '@/lib/youtube-engine';
import { sanitizeHtml, sanitizePlainText, sanitizeYoutubeUrl } from '@/lib/sanitize';
import Groq from 'groq-sdk';

export const maxDuration = 90;
export const dynamic = 'force-dynamic';

const SUMMARIZE_SYSTEM = `You are an expert content analyst for Clario, a platform for YouTubers and content creators.

Analyze the transcript and return ONLY a valid JSON object — no markdown, no backticks, no preamble.

Required schema:
{
  "tldr": "2-3 sentence plain English summary",
  "key_points": ["string"],
  "topics": [{ "name": "string", "percentage": number, "description": "string" }],
  "timeline": [{ "time_range": "string", "topic": "string", "summary": "string" }],
  "insights": ["string"],
  "action_items": ["string"],
  "key_quotes": ["string"],
  "sentiment": "positive" | "negative" | "neutral" | "mixed",
  "content_type": "tutorial" | "lecture" | "podcast" | "review" | "news" | "entertainment" | "other",
  "word_count": number
}

Rules:
- key_points: 5-8 items, each 1-2 sentences
- topics: 3-5 items, percentages must sum to 100
- timeline: 4-6 segments with realistic time ranges
- insights: 3-5 unique or non-obvious observations
- action_items: practical takeaways, empty array if not applicable
- key_quotes: 2-3 short exact quotes from the transcript`;

async function summarizeWithGroq(
  transcript: string,
  title: string
): Promise<Record<string, unknown>> {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  const MAX_CHARS = 24_000;
  const truncated =
    transcript.length > MAX_CHARS
      ? transcript.slice(0, MAX_CHARS) + '\n[Truncated for length]'
      : transcript;

  const resp = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    max_tokens: 3000,
    temperature: 0.3,
    messages: [
      { role: 'system', content: SUMMARIZE_SYSTEM },
      {
        role: 'user',
        content: `Video title: ${title}\n\nTranscript:\n${truncated}`,
      },
    ],
  });

  const raw = resp.choices[0]?.message?.content?.trim() ?? '';
  const cleaned = raw.replace(/^```json\s*|^```\s*|```$/gm, '').trim();
  return JSON.parse(cleaned) as Record<string, unknown>;
}

export async function POST(req: NextRequest) {
  try {
    const rateLimitCheck = checkRateLimit(req, 'api');
    if (!rateLimitCheck.allowed) return rateLimitCheck.response!;

    let body: { url?: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { url } = body;
    if (!url || typeof url !== 'string' || !url.trim()) {
      return NextResponse.json({ error: 'YouTube URL is required' }, { status: 400 });
    }

    const trimmedUrl = url.trim();
    const videoId = extractVideoId(trimmedUrl);
    if (!videoId) {
      return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier, requests_used_this_month, email')
      .eq('id', user.id)
      .single();

    const tier = (profile?.subscription_tier ?? 'free') as 'free' | 'pro';
    const currentUsage = profile?.requests_used_this_month ?? 0;

    if (profile?.email !== process.env.ADMIN_EMAIL) {
      const { checkUsageLimit } = await import('@/lib/usage-limits');
      const usageCheck = checkUsageLimit(tier, currentUsage);
      if (!usageCheck.allowed) {
        return NextResponse.json(
          { error: 'Monthly limit reached. Upgrade to Pro for more.' },
          { status: 429 }
        );
      }
    }

    let engineResult;
    try {
      engineResult = await analyzeVideo(videoId);
    } catch (err: unknown) {
      const code = typeof err === 'object' && err !== null && 'code' in err ? String((err as { code?: string }).code) : '';
      if (code === 'NO_TRANSCRIPT' || code === 'TRANSCRIPT_EMPTY') {
        return NextResponse.json(
          {
            error: 'No transcript available for this video.',
            hint: 'The video may have captions disabled, be private, or age-restricted.',
          },
          { status: 404 }
        );
      }
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.toLowerCase().includes('private') || msg.toLowerCase().includes('unavailable')) {
        return NextResponse.json(
          { error: 'This video is private or unavailable.' },
          { status: 422 }
        );
      }
      throw err;
    }

    const { transcript, metadata } = engineResult;
    const title = metadata.title || 'Unknown';

    let summary: Record<string, unknown>;
    try {
      summary = await summarizeWithGroq(transcript.text, title);
    } catch (err: unknown) {
      console.error('[youtube-analyze] Groq error:', err);
      return NextResponse.json(
        { error: 'AI analysis failed. Please try again.' },
        { status: 500 }
      );
    }

    const result = {
      video_id: videoId,
      transcript_method: transcript.method,
      transcript_preview:
        transcript.text.length > 400
          ? transcript.text.slice(0, 400) + '...'
          : transcript.text,
      ...summary,
    };

    const tldrRaw = typeof summary.tldr === 'string' ? summary.tldr : '';
    const summaryForDb = sanitizeHtml(sanitizePlainText(tldrRaw, 50_000));
    const previewForDb = sanitizeHtml(sanitizePlainText(result.transcript_preview, 20_000));
    const urlForDb = sanitizeYoutubeUrl(trimmedUrl);

    supabase
      .from('ai_summaries')
      .insert({
        user_id: user.id,
        summary_text: summaryForDb,
        original_text: previewForDb,
        mode: 'youtube_analysis',
        youtube_url: urlForDb,
      })
      .then(({ error }) => {
        if (error) console.error('[youtube-analyze] DB insert error:', error.message);
      });

    supabase
      .rpc('track_usage', { p_user_id: user.id, p_type: 'summary', p_count: 1 })
      .then(({ error }) => {
        if (error) console.error('[youtube-analyze] Track usage error:', error.message);
      });

    return NextResponse.json(result);
  } catch (err: unknown) {
    console.error('[youtube-analyze]', err);
    return NextResponse.json(
      { error: 'Analysis failed. Please try again.' },
      { status: 500 }
    );
  }
}
