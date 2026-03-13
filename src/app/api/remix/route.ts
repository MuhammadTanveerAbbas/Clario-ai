import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const REMIX_PROMPTS = {
  twitter: "Convert this content into a 10-tweet Twitter thread. Start with a hook tweet, then break down key points. Use short sentences, emojis, and make it engaging. Number each tweet 1/10, 2/10, etc.",
  linkedin: "Convert this into a professional LinkedIn post. Start with a hook, add insights, use line breaks for readability, and end with a question or CTA. Keep it under 1300 characters.",
  email: "Convert this into a 3-section email newsletter. Section 1: Hook/intro, Section 2: Main insights, Section 3: CTA. Use clear headings and keep it scannable.",
  instagram: "Create 5 Instagram caption variations. Each should be 150-200 characters, start with a hook, include 3-5 relevant hashtags, and have a CTA.",
  youtube: "Create a YouTube video description with: 1) Compelling intro paragraph, 2) Timestamps for key sections, 3) Links section, 4) Hashtags. Make it SEO-friendly.",
  blog: "Create a blog post outline with: 1) Catchy title, 2) Introduction paragraph, 3) 5-7 H2 headings with bullet points under each, 4) Conclusion with CTA.",
  podcast: "Create podcast show notes with: 1) Episode description, 2) Key takeaways (5 bullets), 3) Timestamps for main topics, 4) Guest info (if applicable), 5) Resources mentioned.",
  quotes: "Extract 5 powerful pull quotes from this content. Each quote should be 10-20 words, impactful, and work as a standalone graphic. Format: Quote 1: [text]",
  shorts: "Create 3 short-form video scripts (60 seconds each). Each script: Hook (first 3 seconds), Main point, CTA. Include visual suggestions in brackets.",
  carousel: "Create a 10-slide LinkedIn carousel. Slide 1: Title + hook, Slides 2-9: One key point per slide (max 15 words), Slide 10: CTA. Format: Slide 1: [text]",
};

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { content } = await request.json();

    if (!content || content.trim().length < 50) {
      return NextResponse.json({ error: 'Content must be at least 50 characters' }, { status: 400 });
    }

    const results: Record<string, string> = {};

    for (const [format, prompt] of Object.entries(REMIX_PROMPTS)) {
      try {
        const completion = await groq.chat.completions.create({
          model: 'llama-3.1-8b-instant',
          messages: [
            {
              role: 'system',
              content: 'You are a content repurposing expert. Convert content into different formats while maintaining the core message.',
            },
            {
              role: 'user',
              content: `${prompt}\n\nContent:\n${content}`,
            },
          ],
          temperature: 0.7,
          max_tokens: 1000,
        });

        results[format] = completion.choices[0]?.message?.content || 'Failed to generate';
      } catch (error) {
        console.error(`Failed to generate ${format}:`, error);
        results[format] = 'Generation failed';
      }
    }

    await supabase.rpc('track_usage', {
      p_user_id: user.id,
      p_type: 'remix',
      p_count: 1,
    });

    return NextResponse.json({ results });
  } catch (error: any) {
    console.error('Remix error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
