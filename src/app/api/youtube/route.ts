import { NextResponse } from 'next/server';
import { YoutubeTranscript } from 'youtube-transcript';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/middleware/rate-limit';

export const maxDuration = 120;
export const dynamic = 'force-dynamic';

const TRANSCRIPT_SERVICE_URL = process.env.TRANSCRIPT_SERVICE_URL;

/** Extracts an 11-character YouTube video ID from any supported URL format or bare ID. */
function extractVideoId(input: string): string | null {
  const trimmed = input.trim();

  const patterns = [
    /(?:youtube\.com\/watch\?(?:.*&)?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/live\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
    /(?:m\.youtube\.com\/watch\?(?:.*&)?v=)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];

  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
}

/** Fetches video title, author, and thumbnail via oEmbed - no API key required. */
async function fetchVideoMetadata(videoId: string): Promise<{ title: string; author: string; thumbnail: string } | null> {
  try {
    const res = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`,
      { signal: AbortSignal.timeout(8000) }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return {
      title: data.title || '',
      author: data.author_name || '',
      thumbnail: data.thumbnail_url || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    };
  } catch {
    return null;
  }
}

function cleanTranscript(text: string): string {
  return text
    .replace(/\[.*?\]/g, '') // strip [Music], [Applause], etc.
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/**
 * Attempts to fetch transcript using Python service (with AssemblyAI fallback)
 * Falls back to youtube-transcript library if service is unavailable
 */
async function fetchTranscriptWithService(videoId: string, url: string): Promise<{ text: string; method: string }> {
  // Try Python service first (has AssemblyAI fallback for videos without captions)
  if (TRANSCRIPT_SERVICE_URL) {
    try {
      const serviceRes = await fetch(`${TRANSCRIPT_SERVICE_URL}/api/transcript`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
        signal: AbortSignal.timeout(90000), // 90s for audio transcription
      });

      if (serviceRes.ok) {
        const data = await serviceRes.json();
        if (data.transcript) {
          return { text: cleanTranscript(data.transcript), method: data.method || 'service' };
        }
      } else if (serviceRes.status === 422) {
        const error = await serviceRes.json();
        if (error.detail?.reason === 'private_video') {
          throw new Error('PRIVATE_VIDEO');
        }
        if (error.detail?.reason === 'no_transcript') {
          throw new Error('NO_TRANSCRIPT');
        }
      }
    } catch (err: any) {
      if (err.message === 'PRIVATE_VIDEO' || err.message === 'NO_TRANSCRIPT') {
        throw err;
      }
      console.error('[YouTube API] Service error:', err);
      // Fall through to library method
    }
  }

  // Fallback to youtube-transcript library (captions only)
  const langPriority = ['en', 'en-US', 'en-GB', 'a.en'];

  for (const lang of langPriority) {
    try {
      const transcript = await YoutubeTranscript.fetchTranscript(videoId, { lang });
      if (transcript?.length > 0) {
        const text = transcript.map(item => item.text).join(' ');
        return { text: cleanTranscript(text), method: 'captions' };
      }
    } catch {
      // try next language
    }
  }

  try {
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    if (transcript?.length > 0) {
      const text = transcript.map(item => item.text).join(' ');
      return { text: cleanTranscript(text), method: 'captions' };
    }
  } catch {
    // Final fallback failed
  }

  throw new Error('NO_TRANSCRIPT');
}

export async function POST(request: Request) {
  try {
    const rateLimitCheck = checkRateLimit(request as any, 'api');
    if (!rateLimitCheck.allowed) {
      return rateLimitCheck.response!;
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body: { url?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const { url } = body;
    if (!url || typeof url !== 'string' || !url.trim()) {
      return NextResponse.json({ error: 'YouTube URL is required' }, { status: 400 });
    }

    const videoId = extractVideoId(url.trim());
    if (!videoId) {
      return NextResponse.json({
        error: 'Invalid YouTube URL. Supported formats: youtube.com/watch?v=..., youtu.be/..., youtube.com/shorts/...',
      }, { status: 400 });
    }

    // Fetch metadata and transcript in parallel to minimize latency
    const [metadataResult, transcriptResult] = await Promise.allSettled([
      fetchVideoMetadata(videoId),
      fetchTranscriptWithService(videoId, url.trim()),
    ]);

    if (transcriptResult.status === 'rejected') {
      const err = transcriptResult.reason as Error;
      const msg = err?.message || '';

      if (msg.includes('NO_TRANSCRIPT') || msg.includes('Could not get transcripts') || msg.includes('disabled')) {
        return NextResponse.json({
          error: 'No transcript available for this video.',
          hint: 'This video may have captions disabled or be private. The system tried both captions and audio transcription.',
          videoId,
        }, { status: 404 });
      }

      if (msg.includes('Too Many Requests') || msg.includes('429')) {
        return NextResponse.json({
          error: 'YouTube is rate limiting requests. Please try again in a few seconds.',
        }, { status: 429 });
      }

      console.error('[YouTube API] Transcript error:', msg);
      return NextResponse.json({
        error: 'Failed to fetch transcript. The video may be private, age-restricted, or have captions disabled.',
        hint: 'Try a different video or paste the transcript manually.',
      }, { status: 500 });
    }

    const { text: transcript, method } = transcriptResult.value;
    const metadata = metadataResult.status === 'fulfilled' ? metadataResult.value : null;

    if (!transcript || transcript.length < 50) {
      return NextResponse.json({
        error: 'Transcript is too short or empty.',
        hint: 'This video may have auto-generated captions that are incomplete.',
      }, { status: 404 });
    }

    return NextResponse.json({
      transcript,
      videoId,
      videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
      title: metadata?.title || '',
      author: metadata?.author || '',
      thumbnail: metadata?.thumbnail || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      method,
      charCount: transcript.length,
    });

  } catch (error: any) {
    console.error('[YouTube API] Unexpected error:', error);
    return NextResponse.json({
      error: 'Failed to fetch transcript.',
      hint: 'Make sure the video is public and has captions enabled.',
    }, { status: 500 });
  }
}
