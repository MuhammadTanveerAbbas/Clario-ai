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
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    let body: { url?: string };
    try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 }); }

    const { url } = body;
    if (!url?.trim()) return NextResponse.json({ error: 'YouTube URL is required' }, { status: 400 });

    const videoId = extractVideoId(url.trim());
    if (!videoId) return NextResponse.json({ error: 'Invalid YouTube URL.' }, { status: 400 });

    // Always run both in parallel — transcript never throws
    const [transcript, metadata] = await Promise.all([
      fetchTranscript(videoId),
      fetchVideoMetadata(videoId),
    ]);

    return NextResponse.json({
      transcript: transcript.text,
      videoId,
      videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
      title: metadata.title,
      author: metadata.author,
      thumbnail: metadata.thumbnail,
      method: transcript.method,
      language: transcript.language,
      charCount: transcript.text.length,
    });
  } catch (error: unknown) {
    console.error('[youtube] Unexpected error:', error);
    // Even on unexpected error, try to return something useful
    try {
      const body = await req.clone().json() as { url?: string };
      const videoId = body.url ? extractVideoId(body.url) : null;
      if (videoId) {
        const metadata = await fetchVideoMetadata(videoId).catch(() => ({ title: '', author: '', thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`, duration: null, viewCount: null }));
        return NextResponse.json({
          transcript: `Video: ${metadata.title || videoId}\nChannel: ${metadata.author || 'Unknown'}\nURL: https://www.youtube.com/watch?v=${videoId}\nNote: Could not retrieve transcript for this video.`,
          videoId,
          videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
          title: metadata.title,
          author: metadata.author,
          thumbnail: metadata.thumbnail,
          method: 'stub',
          language: 'en',
          charCount: 0,
        });
      }
    } catch { /* fall through */ }
    return NextResponse.json({ error: 'Failed to process video.' }, { status: 500 });
  }
}
