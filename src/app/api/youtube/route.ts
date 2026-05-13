/**
 * POST /api/youtube
 * Fetches raw transcript for the YouTube Summarizer page.
 * Uses the native youtubei.js engine — no external service required.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/middleware/rate-limit';
import { extractVideoId, fetchTranscript, fetchVideoMetadata } from '@/lib/youtube-engine';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const rateLimitCheck = checkRateLimit(req, 'api');
    if (!rateLimitCheck.allowed) return rateLimitCheck.response!;

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

    const videoId = extractVideoId(url.trim());
    if (!videoId) {
      return NextResponse.json(
        {
          error:
            'Invalid YouTube URL. Supported formats: youtube.com/watch?v=..., youtu.be/..., youtube.com/shorts/...',
        },
        { status: 400 }
      );
    }

    const [transcriptResult, metadataResult] = await Promise.allSettled([
      fetchTranscript(videoId),
      fetchVideoMetadata(videoId),
    ]);

    if (transcriptResult.status === 'rejected') {
      const err = transcriptResult.reason as { code?: string; message?: string };
      const code: string = err?.code ?? '';

      if (code === 'NO_TRANSCRIPT' || code === 'TRANSCRIPT_EMPTY') {
        return NextResponse.json(
          {
            error: 'No transcript available for this video.',
            hint: 'The video may have captions disabled, be private, or age-restricted.',
            videoId,
          },
          { status: 404 }
        );
      }

      const msg = String(err?.message ?? err ?? '');
      if (msg.toLowerCase().includes('private') || msg.toLowerCase().includes('unavailable')) {
        return NextResponse.json(
          { error: 'This video is private or unavailable.', videoId },
          { status: 422 }
        );
      }

      console.error('[youtube] Transcript error:', err);
      return NextResponse.json(
        {
          error: 'Failed to fetch transcript.',
          hint: 'Try a different video or paste the transcript manually.',
        },
        { status: 500 }
      );
    }

    const { text: transcript, method, language } = transcriptResult.value;
    const metadata =
      metadataResult.status === 'fulfilled'
        ? metadataResult.value
        : {
            title: '',
            author: '',
            thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
            duration: null,
            viewCount: null,
          };

    return NextResponse.json({
      transcript,
      videoId,
      videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
      title: metadata.title,
      author: metadata.author,
      thumbnail: metadata.thumbnail,
      method,
      language,
      charCount: transcript.length,
    });
  } catch (error: unknown) {
    console.error('[youtube] Unexpected error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch transcript.',
        hint: 'Make sure the video is public and has captions enabled.',
      },
      { status: 500 }
    );
  }
}
