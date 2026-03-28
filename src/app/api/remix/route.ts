import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/middleware/rate-limit';
import { checkUsageLimit } from '@/lib/usage-limits';
import { generateWithFallback } from '@/lib/ai-fallback';
import { z } from 'zod';

export const maxDuration = 90;
export const dynamic = 'force-dynamic';

const RemixSchema = z.object({
  content: z.string().min(50, 'Content must be at least 50 characters').max(20000, 'Content too long'),
  formats: z.array(z.string()).optional(), // optional: remix only selected formats
  brandVoice: z.string().optional(),
})

const REMIX_PROMPTS: Record<string, string> = {
  twitter: `Create a compelling 10-tweet Twitter/X thread from this content.

Format:
🧵 1/10 [Hook tweet — make it impossible to scroll past. Bold claim or surprising fact.]

2/10 [Context or setup]

3/10 [Key point with specific detail]

4/10 [Key point with specific detail]

5/10 [Key point with specific detail]

6/10 [Key point with specific detail]

7/10 [Key point with specific detail]

8/10 [Key point with specific detail]

9/10 [Key point with specific detail]

10/10 [Strong CTA — follow, share, or link]

Rules: Short punchy sentences. One idea per tweet. Use line breaks within tweets. Add 1-2 relevant emojis per tweet.`,

  linkedin: `Write a high-performing LinkedIn post from this content.

Format:
[Hook line — bold statement or question that stops the scroll]

[1-2 lines of context]

Here's what I learned:

→ [Key insight with brief explanation]
→ [Key insight with brief explanation]
→ [Key insight with brief explanation]
→ [Key insight with brief explanation]
→ [Key insight with brief explanation]

[2-3 lines of personal reflection or broader implication]

[Closing question to drive comments]

#[Hashtag] #[Hashtag] #[Hashtag]

Rules: Use line breaks generously. Keep under 1300 characters. No walls of text.`,

  email: `Write an engaging email newsletter from this content.

Format:
Subject: [Compelling subject line — specific, creates curiosity]
Preview: [Preview text that complements the subject]

---

Hey [First Name],

[Opening hook — 1-2 sentences that make them want to keep reading]

[Main section header]

[Core content in 2-3 short paragraphs. Use bold for key terms. Keep paragraphs to 3 lines max.]

**Key takeaways:**
- [Takeaway]
- [Takeaway]
- [Takeaway]

[Transition sentence]

[CTA section]
[Button text]: [URL placeholder]

Until next time,
[Name]

P.S. [One bonus insight or teaser for next issue]`,

  instagram: `Create 3 Instagram caption variations from this content.

**Caption 1 — Story-driven:**
[Hook sentence]
[2-3 sentences telling a story or sharing an insight]
[CTA]
.
.
.
#[hashtag] #[hashtag] #[hashtag] #[hashtag] #[hashtag]

---

**Caption 2 — List format:**
[Hook]
[Numbered list of 3-5 points]
[CTA]
.
.
.
#[hashtag] #[hashtag] #[hashtag] #[hashtag] #[hashtag]

---

**Caption 3 — Question-based:**
[Thought-provoking question]
[Brief answer/insight]
[Engagement question]
.
.
.
#[hashtag] #[hashtag] #[hashtag] #[hashtag] #[hashtag]`,

  youtube: `Write a complete YouTube video description optimized for search and clicks.

Format:
[Compelling first 2-3 lines — these show in search results. Include main keyword naturally.]

🎯 In this video:
• [What viewers will learn/get]
• [What viewers will learn/get]
• [What viewers will learn/get]

⏱️ TIMESTAMPS:
0:00 - Introduction
[Add relevant timestamps based on content]

📌 RESOURCES MENTIONED:
• [Resource if applicable]

🔔 Subscribe for more: [Channel link placeholder]

---

ABOUT THIS VIDEO:
[2-3 sentences expanding on the topic for SEO]

---

#[Hashtag] #[Hashtag] #[Hashtag]`,

  blog: `Create a complete blog post outline and introduction from this content.

Format:
# [SEO-optimized title — include main keyword]

**Meta description:** [150-160 chars, includes keyword, compelling]

---

## Introduction
[3-4 sentences: hook, context, what the reader will learn, why it matters now]

---

## Table of Contents
1. [H2 heading]
2. [H2 heading]
3. [H2 heading]
4. [H2 heading]
5. [H2 heading]

---

## [H2 Heading 1]
**Key points to cover:**
- [Point]
- [Point]
- [Point]

## [H2 Heading 2]
**Key points to cover:**
- [Point]
- [Point]

## [H2 Heading 3]
**Key points to cover:**
- [Point]
- [Point]

## [H2 Heading 4]
**Key points to cover:**
- [Point]
- [Point]

## Conclusion
**Key points to cover:**
- Summary of main takeaways
- CTA for readers`,

  podcast: `Create professional podcast show notes from this content.

Format:
## Episode Title: [Compelling title]

**Episode Summary:**
[2-3 sentences describing what this episode covers and who it's for]

---

## What You'll Learn
- [Key takeaway]
- [Key takeaway]
- [Key takeaway]

---

## Episode Highlights

**[Timestamp] — [Topic]**
[Brief description of what's covered]

**[Timestamp] — [Topic]**
[Brief description of what's covered]

**[Timestamp] — [Topic]**
[Brief description of what's covered]

---

## Key Quotes
> "[Memorable quote from content]"

> "[Memorable quote from content]"

---

## Resources & Links
- [Resource mentioned]
- [Resource mentioned]

---

*Subscribe, rate, and review if you found this valuable.*`,

  quotes: `Extract 6 powerful, shareable quotes from this content.

Format each quote like this:

**Quote 1:**
> "[Exact or paraphrased impactful statement — 10-25 words, punchy and standalone]"

**Why it works:** [1 sentence on why this quote resonates]
**Best for:** [Twitter / LinkedIn / Slide deck / Newsletter]

---

**Quote 2:**
> "[Quote]"
**Why it works:** [Reason]
**Best for:** [Platform]

---

[Repeat for quotes 3-6]

---

**Most shareable:** Quote [#] — [Brief reason why]`,

  shorts: `Create 3 short-form video scripts (45-60 seconds each) from this content.

**Script 1:**
🎬 HOOK (0-3s): [Attention-grabbing opening line — say this to camera]
📱 VISUAL: [What to show on screen]

MAIN CONTENT (3-45s):
[Script line by line, conversational]
[Keep each line short — one breath]
[Build to a payoff]

CTA (45-60s): [Clear call to action]
📱 VISUAL: [End screen suggestion]

---

**Script 2:**
🎬 HOOK (0-3s): [Different angle on same content]
[Full script structure as above]

---

**Script 3:**
🎬 HOOK (0-3s): [Third angle]
[Full script structure as above]`,

  carousel: `Create a 10-slide LinkedIn/Instagram carousel from this content.

**Slide 1 — Cover:**
Title: [Bold, curiosity-driving title]
Subtitle: [What they'll learn]
Visual note: [Suggested background/image]

**Slide 2:**
Headline: [Key point — max 8 words]
Body: [2-3 sentences expanding on it]

**Slide 3:**
Headline: [Key point — max 8 words]
Body: [2-3 sentences expanding on it]

**Slide 4:**
Headline: [Key point — max 8 words]
Body: [2-3 sentences expanding on it]

**Slide 5:**
Headline: [Key point — max 8 words]
Body: [2-3 sentences expanding on it]

**Slide 6:**
Headline: [Key point — max 8 words]
Body: [2-3 sentences expanding on it]

**Slide 7:**
Headline: [Key point — max 8 words]
Body: [2-3 sentences expanding on it]

**Slide 8:**
Headline: [Key point — max 8 words]
Body: [2-3 sentences expanding on it]

**Slide 9 — Summary:**
"The [X] things to remember:"
[Bullet list of key points]

**Slide 10 — CTA:**
[Strong call to action]
[Follow/save/share prompt]`,
}

export async function POST(request: NextRequest) {
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

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const parsed = RemixSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.issues }, { status: 400 });
    }

    const { content, formats, brandVoice } = parsed.data;

    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier, requests_used_this_month, email')
      .eq('id', user.id)
      .single()

    const tier = (profile?.subscription_tier || 'free') as 'free' | 'pro'
    const currentUsage = profile?.requests_used_this_month || 0

    if (profile?.email !== process.env.ADMIN_EMAIL) {
      const usageCheck = checkUsageLimit(tier, currentUsage)
      if (!usageCheck.allowed) {
        return NextResponse.json({
          error: 'Usage limit reached',
          message: `You've used all ${usageCheck.limit} requests on your ${tier} plan. Upgrade to continue.`,
        }, { status: 403 })
      }
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: 'AI service not configured' }, { status: 500 });
    }

    const formatsToGenerate = formats?.length
      ? formats.filter(f => REMIX_PROMPTS[f])
      : Object.keys(REMIX_PROMPTS);

    const brandVoiceNote = brandVoice
      ? `\n\nBRAND VOICE TO APPLY:\n${brandVoice}\nAdapt the tone and style to match this brand voice.`
      : ''

    const systemPrompt = `You are an expert content repurposing specialist. Transform content into platform-native formats that feel natural and engaging — not like they were copy-pasted from somewhere else.${brandVoiceNote}

Rules:
- Follow the exact format specified in each prompt
- Use actual content from the source material — no generic filler
- Write words normally without spacing between letters
- Make each format feel native to its platform`

    const results: Record<string, string> = {};
    await Promise.all(
      formatsToGenerate.map(async (format) => {
        const prompt = REMIX_PROMPTS[format];
        if (!prompt) return;
        try {
          const result = await generateWithFallback(
            `${prompt}\n\n---\n\nSOURCE CONTENT:\n${content}`,
            systemPrompt,
            {
              model: 'llama-3.1-8b-instant',
              maxTokens: 1200,
              temperature: 0.65,
            }
          );
          results[format] = result;
        } catch (err: any) {
          console.error(`[Remix API] Failed to generate ${format}:`, err.message);
          results[format] = `Failed to generate ${format}. Please try again.`;
        }
      })
    );

    // Track usage (non-blocking)
    supabase.rpc('track_usage', {
      p_user_id: user.id,
      p_type: 'remix',
      p_count: 1,
    }).then(({ error }) => {
      if (error) console.error('[Remix API] Track usage error:', error.message)
    })

    return NextResponse.json({ results });

  } catch (error: any) {
    console.error('[Remix API] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
