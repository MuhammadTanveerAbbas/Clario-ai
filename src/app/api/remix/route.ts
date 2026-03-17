import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Groq from 'groq-sdk';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

const groqApiKey = process.env.GROQ_API_KEY;

if (!groqApiKey) {
  console.error('[Remix API] GROQ_API_KEY not set');
}

const groq = groqApiKey ? new Groq({ apiKey: groqApiKey }) : null;

const REMIX_PROMPTS = {
  twitter: "Convert this content into a 10-tweet Twitter thread. Start with a hook tweet, then break down key points. Use short sentences, emojis, and make it engaging. Number each tweet 1/10, 2/10, etc. Use minimal formatting.",
  linkedin: "Convert this into a professional LinkedIn post. Start with a hook, add insights, use line breaks for readability, and end with a question or CTA. Keep it under 1300 characters. Use minimal bold formatting only for key terms.",
  email: "Convert this into a 3-section email newsletter. Section 1: Hook/intro, Section 2: Main insights, Section 3: CTA. Use clear headings and keep it scannable. Use minimal formatting.",
  instagram: "Create 5 Instagram caption variations. Each should be 150-200 characters, start with a hook, include 3-5 relevant hashtags, and have a CTA. Use minimal formatting.",
  youtube: "Create a YouTube video description with: 1) Compelling intro paragraph, 2) Timestamps for key sections, 3) Links section, 4) Hashtags. Make it SEO-friendly. Use minimal formatting.",
  blog: "Create a blog post outline with: 1) Catchy title, 2) Introduction paragraph, 3) 5-7 H2 headings with bullet points under each, 4) Conclusion with CTA. Use minimal formatting.",
  podcast: "Create podcast show notes with: 1) Episode description, 2) Key takeaways (5 bullets), 3) Timestamps for main topics, 4) Guest info (if applicable), 5) Resources mentioned. Use minimal formatting.",
  quotes: "Extract 5 powerful pull quotes from this content. Each quote should be 10-20 words, impactful, and work as a standalone graphic. Format: Quote 1: [text]. No extra formatting.",
  shorts: "Create 3 short-form video scripts (60 seconds each). Each script: Hook (first 3 seconds), Main point, CTA. Include visual suggestions in brackets. Use minimal formatting.",
  carousel: "Create a 10-slide LinkedIn carousel. Slide 1: Title + hook, Slides 2-9: One key point per slide (max 15 words), Slide 10: CTA. Format: Slide 1: [text]. Use minimal formatting.",
};

export async function POST(request: NextRequest) {
  console.log('[Remix API] Request received');
  
  try {
    if (!groq) {
      console.error('[Remix API] Groq not initialized');
      return NextResponse.json({ error: 'AI service not configured' }, { status: 500 });
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('[Remix API] Auth error:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[Remix API] User authenticated:', user.id);

    let body;
    try {
      body = await request.json();
    } catch (e) {
      console.error('[Remix API] JSON parse error:', e);
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const { content } = body;

    if (!content || content.trim().length < 50) {
      console.log('[Remix API] Content too short');
      return NextResponse.json({ error: 'Content must be at least 50 characters' }, { status: 400 });
    }

    console.log('[Remix API] Content length:', content.length);

    const results: Record<string, string> = {};
    const promises = Object.entries(REMIX_PROMPTS).map(async ([format, prompt]) => {
      try {
        const completion = await groq!.chat.completions.create({
          model: 'llama-3.1-8b-instant',
          messages: [
            {
              role: 'system',
              content: 'You are a content repurposing expert. Convert content into different formats while maintaining the core message. Be concise and actionable.',
            },
            {
              role: 'user',
              content: `${prompt}\n\nContent:\n${content}`,
            },
          ],
          temperature: 0.6,
          max_tokens: 800,
          top_p: 0.9,
        });

        results[format] = completion.choices[0]?.message?.content?.trim() || 'Failed to generate';
        console.log(`[Remix API] Generated ${format}`);
      } catch (error: any) {
        console.error(`[Remix API] Failed to generate ${format}:`, error?.message);
        results[format] = 'Generation failed';
      }
    });

    await Promise.all(promises);

    const { error: trackError } = await supabase.rpc('track_usage', {
      p_user_id: user.id,
      p_type: 'remix',
      p_count: 1,
    });

    if (trackError) {
      console.error('[Remix API] Track usage error:', trackError);
    }

    console.log('[Remix API] Success');
    return NextResponse.json({ results });
  } catch (error: any) {
    console.error('[Remix API] Unexpected error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
