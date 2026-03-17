import { NextResponse } from 'next/server';
import { YoutubeTranscript } from 'youtube-transcript';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/middleware/rate-limit';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export async function POST(request: Request) {
  console.log('[YouTube API] Request received');
  
  try {
    const rateLimitCheck = checkRateLimit(request as any, 'api');
    if (!rateLimitCheck.allowed) {
      console.log('[YouTube API] Rate limit exceeded');
      return rateLimitCheck.response!;
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('[YouTube API] Auth error:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[YouTube API] User authenticated:', user.id);

    let body;
    try {
      body = await request.json();
    } catch (e) {
      console.error('[YouTube API] JSON parse error:', e);
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const { url } = body;
    
    if (!url || typeof url !== 'string') {
      console.log('[YouTube API] URL missing or invalid');
      return NextResponse.json({ error: 'YouTube URL required' }, { status: 400 });
    }

    console.log('[YouTube API] Extracting video ID from:', url);
    const videoId = extractVideoId(url);
    
    if (!videoId) {
      console.log('[YouTube API] Invalid video ID');
      return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 });
    }

    console.log('[YouTube API] Fetching transcript for video:', videoId);
    
    let transcript;
    try {
      transcript = await YoutubeTranscript.fetchTranscript(videoId);
    } catch (fetchError: any) {
      console.error('[YouTube API] Transcript fetch error:', fetchError?.message);
      
      if (fetchError.message?.includes('Transcript is disabled')) {
        return NextResponse.json({ 
          error: 'This video has transcripts disabled by the creator.' 
        }, { status: 404 });
      }
      
      throw fetchError;
    }
    
    if (!transcript || transcript.length === 0) {
      console.log('[YouTube API] No transcript available');
      return NextResponse.json({ 
        error: 'No transcript available for this video. The video may not have captions enabled.' 
      }, { status: 404 });
    }

    const fullText = transcript.map(item => item.text).join(' ');
    console.log('[YouTube API] Transcript fetched, length:', fullText.length);
    
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

    console.log('[YouTube API] Success');
    return NextResponse.json({ 
      transcript: fullText,
      videoId,
      videoUrl,
      duration: transcript[transcript.length - 1]?.offset || 0
    });

  } catch (error: any) {
    console.error('[YouTube API] Unexpected error:', error);
    
    return NextResponse.json({ 
      error: 'Failed to fetch transcript. Make sure the video has captions enabled.',
      details: error?.message
    }, { status: 500 });
  }
}
