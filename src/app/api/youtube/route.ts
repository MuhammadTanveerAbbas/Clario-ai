import { NextResponse } from 'next/server';
import { YoutubeTranscript } from 'youtube-transcript';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/middleware/rate-limit';

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
  try {
    const rateLimitCheck = checkRateLimit(request as any, 'api');
    if (!rateLimitCheck.allowed) {
      return rateLimitCheck.response!;
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { url } = await request.json();
    
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'YouTube URL required' }, { status: 400 });
    }

    const videoId = extractVideoId(url);
    if (!videoId) {
      return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 });
    }

    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    
    if (!transcript || transcript.length === 0) {
      return NextResponse.json({ 
        error: 'No transcript available for this video. The video may not have captions enabled.' 
      }, { status: 404 });
    }

    const fullText = transcript.map(item => item.text).join(' ');
    
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

    return NextResponse.json({ 
      transcript: fullText,
      videoId,
      videoUrl,
      duration: transcript[transcript.length - 1]?.offset || 0
    });

  } catch (error: any) {
    console.error('YouTube transcript error:', error);
    
    if (error.message?.includes('Transcript is disabled')) {
      return NextResponse.json({ 
        error: 'This video has transcripts disabled by the creator.' 
      }, { status: 404 });
    }
    
    return NextResponse.json({ 
      error: 'Failed to fetch transcript. Make sure the video has captions enabled.' 
    }, { status: 500 });
  }
}
