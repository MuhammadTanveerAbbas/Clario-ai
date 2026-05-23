import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/middleware/rate-limit';
import { sanitizeAndValidate } from '@/lib/input-validation';
import { checkUsageLimit } from '@/lib/usage-limits';
import { generateWithFallback } from '@/lib/ai-fallback';
import { z } from 'zod';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

const CreatorModeSchema = z.object({
  text: z.string().min(1, 'Text is required').max(50000, 'Text too long'),
  mode: z.enum(['youtube-description', 'twitter-thread', 'linkedin-post']),
});

const CREATOR_MODES = {
  'youtube-description': {
    name: 'YouTube Description',
    prompt: `Create a YouTube video description:

# [Catchy Title]

[2-3 sentence hook]

## What You'll Learn:
• [Key point 1]
• [Key point 2]
• [Key point 3]

## Timestamps:
0:00 - Intro
[X:XX] - [Topic]

## Resources:
• [Resource]

#hashtag1 #hashtag2`,
  },
  'twitter-thread': {
    name: 'Twitter Thread',
    prompt: `Create a 10-tweet thread. Each tweet max 280 chars. Use emojis. Make each valuable alone.`,
  },
  'linkedin-post': {
    name: 'LinkedIn Post',
    prompt: `Create LinkedIn post with hook, insights, and CTA. 150-200 words. Professional but conversational.`,
  },
};

export async function POST(request: Request) {
  try {
    const rateLimitCheck = checkRateLimit(request as any, 'api');
    if (!rateLimitCheck.allowed) {
      return rateLimitCheck.response!;
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const parsed = CreatorModeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.issues }, { status: 400 });
    }

    const { text, mode } = parsed.data;

    const validation = sanitizeAndValidate(text, 50000);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('plan, requests_used, email')
      .eq('id', user.id)
      .single();

    const tier = (profile?.plan || 'free') as 'free' | 'pro';
    const currentUsage = profile?.requests_used || 0;

    if (profile?.email !== process.env.ADMIN_EMAIL) {
      const usageCheck = checkUsageLimit(tier, currentUsage);
      if (!usageCheck.allowed) {
        return NextResponse.json(
          { error: 'Usage limit reached' },
          { status: 403 }
        );
      }
    }

    const modeConfig = CREATOR_MODES[mode as keyof typeof CREATOR_MODES];
    if (!modeConfig) {
      return NextResponse.json({ error: 'Invalid mode' }, { status: 400 });
    }

    const result = await generateWithFallback(
      `Content:\n${validation.sanitized}`,
      modeConfig.prompt,
      { model: 'llama-3.3-70b-versatile', maxTokens: 2048, temperature: 0.7 }
    );

    await supabase.from('usage_tracking').insert({
      user_id: user.id,
      type: 'brand_voice',
    });

    await supabase.rpc('increment_usage', {
      p_user_id: user.id,
      p_type: 'brand_voice',
    });

    return NextResponse.json({ result, modeName: modeConfig.name });

  } catch (error: any) {
    console.error('Creator mode error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed' },
      { status: 500 }
    );
  }
}
