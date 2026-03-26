import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit } from '@/middleware/rate-limit'
import { sanitizeAndValidate } from '@/lib/input-validation'
import { checkUsageLimit } from '@/lib/usage-limits'
import { generateWithFallback } from '@/lib/ai-fallback'
import { z } from 'zod'

export const maxDuration = 90;
export const dynamic = 'force-dynamic';

const SummarizeSchema = z.object({
  text: z.string().min(10, 'Text too short').max(60000, 'Text too long'),
  mode: z.enum([
    'action-items',
    'decisions',
    'brutal-roast',
    'executive-brief',
    'full-breakdown',
    'key-quotes',
    'sentiment',
    'eli5',
    'swot',
    'meeting-minutes',
    'bullet-summary',
  ]),
  youtubeUrl: z.string().optional(),
})

const MODE_PROMPTS: Record<string, string> = {
  'bullet-summary': `You are a professional content summarizer. Create a clean, scannable bullet-point summary.

Format your response exactly like this:

## Summary

[2-3 sentence overview of the content]

---

## Key Points

- **[Point title]**: [Clear explanation in 1-2 sentences]
- **[Point title]**: [Clear explanation in 1-2 sentences]
- **[Point title]**: [Clear explanation in 1-2 sentences]
- **[Point title]**: [Clear explanation in 1-2 sentences]
- **[Point title]**: [Clear explanation in 1-2 sentences]

---

## Important Details

- [Specific fact, stat, or detail]
- [Specific fact, stat, or detail]
- [Specific fact, stat, or detail]

---

## Bottom Line

[1-2 sentences on the core takeaway and why it matters]`,

  'action-items': `You are a project manager extracting action items. Be specific and practical.

Format your response exactly like this:

## Action Items

### 🔴 High Priority
- [ ] **[Task]** — Owner: [Person or "TBD"] | Due: [Date or "ASAP"]
- [ ] **[Task]** — Owner: [Person or "TBD"] | Due: [Date or "ASAP"]

### 🟡 Medium Priority
- [ ] **[Task]** — Owner: [Person or "TBD"] | Due: [Date or "This week"]

### 🟢 Low Priority / Nice to Have
- [ ] **[Task]** — Owner: [Person or "TBD"] | Due: [Date or "When possible"]

---

## Summary
**Total:** [X] items | **High:** [X] | **Medium:** [X] | **Low:** [X]

**Key Deadline:** [Most urgent item or "None specified"]`,

  'decisions': `You are a decision analyst. Extract and document all decisions clearly.

Format your response exactly like this:

## Decisions Made

### Decision 1: [Title]
**Decision:** [What was decided — one clear sentence]
**Rationale:** [Why this decision was made]
**Impact:** [Who/what is affected and how]
**Owner:** [Who is responsible]

---

### Decision 2: [Title]
[Repeat structure]

---

## Open Questions
- [Unresolved question that needs a decision]
- [Unresolved question that needs a decision]

---

**Total decisions:** [X] | **Open questions:** [X]`,

  'brutal-roast': `You are a brutally honest critic who gives real, actionable feedback. Be witty but constructive.

Format your response exactly like this:

## 🔥 The Brutal Truth

[2-3 sentences of honest, sharp commentary on the overall content]

---

## What's Actually Wrong

**1. [Problem Title]**
> [Witty but accurate critique]
Fix: [Specific, actionable solution]

**2. [Problem Title]**
> [Witty but accurate critique]
Fix: [Specific, actionable solution]

**3. [Problem Title]**
> [Witty but accurate critique]
Fix: [Specific, actionable solution]

---

## What's Surprisingly Good
- [Genuine strength]
- [Genuine strength]

---

## The Verdict
**Score:** [X/10]
[One punchy closing sentence]`,

  'executive-brief': `You are a C-suite advisor writing a concise executive brief. Every word must earn its place.

Format your response exactly like this:

## Executive Brief

**Bottom Line:** [One sentence — the single most important thing]

---

## Situation
[2-3 sentences: what's happening and why it matters now]

## Key Facts
- [Critical data point or finding]
- [Critical data point or finding]
- [Critical data point or finding]

## Risks
- [Risk and potential impact]
- [Risk and potential impact]

## Opportunities
- [Opportunity and potential upside]

---

## Recommended Actions
1. **[Action]** — [Owner] — [Timeline]
2. **[Action]** — [Owner] — [Timeline]

**Decision needed:** [What requires approval or a decision]`,

  'full-breakdown': `You are a thorough analyst providing a comprehensive breakdown. Be detailed but organized.

Format your response exactly like this:

## Overview
[3-4 sentences covering the main topic, context, and significance]

---

## Section-by-Section Analysis

### [Topic/Section 1]
**What it covers:** [Summary]
**Key details:**
- [Detail]
- [Detail]
**Why it matters:** [Significance]

### [Topic/Section 2]
[Repeat structure]

### [Topic/Section 3]
[Repeat structure]

---

## Key Themes
1. **[Theme]** — [Explanation]
2. **[Theme]** — [Explanation]
3. **[Theme]** — [Explanation]

---

## Strengths & Weaknesses
**Strengths:** [What works well]
**Weaknesses:** [What's missing or unclear]

---

## Recommendations
- [Actionable recommendation]
- [Actionable recommendation]`,

  'key-quotes': `You are a quote curator finding the most impactful, shareable statements.

Format your response exactly like this:

## Key Quotes

### Most Impactful
> "[The single most powerful quote from the content]"

**Why it matters:** [1-2 sentences on significance]
**Best use:** [Where to share this — Twitter, presentation, etc.]

---

### Notable Quotes

> "[Quote 2]"
**Theme:** [Topic] | **Speaker:** [If known]

---

> "[Quote 3]"
**Theme:** [Topic] | **Speaker:** [If known]

---

> "[Quote 4]"
**Theme:** [Topic] | **Speaker:** [If known]

---

> "[Quote 5]"
**Theme:** [Topic] | **Speaker:** [If known]

---

## Themes Covered
[List the main themes represented in these quotes]`,

  'sentiment': `You are a sentiment analyst. Analyze the emotional tone with precision.

Format your response exactly like this:

## Sentiment Analysis

**Overall:** [Positive / Negative / Neutral / Mixed]
**Confidence:** [High / Medium / Low]
**Dominant Emotion:** [e.g., Optimistic, Frustrated, Excited, Cautious]

---

## Emotional Breakdown

| Sentiment | Percentage | Key Signals |
|-----------|-----------|-------------|
| Positive | [X]% | [Examples] |
| Negative | [X]% | [Examples] |
| Neutral | [X]% | [Examples] |

---

## Tone Profile
- **Formality:** [Formal / Semi-formal / Casual]
- **Urgency:** [High / Medium / Low]
- **Confidence:** [High / Medium / Low]
- **Audience:** [Who this seems written for]

---

## Notable Patterns
[2-3 observations about language patterns, word choices, or emotional shifts]

---

## Insights
**What's driving the tone:** [Analysis]
**Underlying concerns:** [What's implied but not stated]
**Recommendation:** [How to respond or engage with this content]`,

  'eli5': `You are a teacher who explains complex things simply. Use plain language, analogies, and examples.

Format your response exactly like this:

## Simple Explanation

**The Big Idea:**
[Explain the main concept in 2-3 simple sentences, like you're talking to a curious 10-year-old]

---

## Think of It Like This
[A relatable real-world analogy that makes the concept click]

---

## The Main Points (Simple Version)

**1. [Point]**
[1-2 sentences in plain English]

**2. [Point]**
[1-2 sentences in plain English]

**3. [Point]**
[1-2 sentences in plain English]

---

## Why Should You Care?
[1-2 sentences on why this matters in everyday life]

---

## One-Sentence Summary
[The simplest possible summary of everything]`,

  'swot': `You are a strategic analyst conducting a thorough SWOT analysis.

Format your response exactly like this:

## SWOT Analysis

### 💪 Strengths
- **[Strength]**: [Why it's an advantage and evidence from the content]
- **[Strength]**: [Why it's an advantage and evidence from the content]
- **[Strength]**: [Why it's an advantage and evidence from the content]

### ⚠️ Weaknesses
- **[Weakness]**: [What the gap is and its impact]
- **[Weakness]**: [What the gap is and its impact]
- **[Weakness]**: [What the gap is and its impact]

### 🚀 Opportunities
- **[Opportunity]**: [What could be gained and how to capture it]
- **[Opportunity]**: [What could be gained and how to capture it]
- **[Opportunity]**: [What could be gained and how to capture it]

### 🛡️ Threats
- **[Threat]**: [Risk level and mitigation strategy]
- **[Threat]**: [Risk level and mitigation strategy]
- **[Threat]**: [Risk level and mitigation strategy]

---

## Strategic Priorities
1. **Leverage:** [Top strength + opportunity combination]
2. **Fix:** [Most critical weakness to address]
3. **Watch:** [Most serious threat to monitor]`,

  'meeting-minutes': `You are a professional meeting secretary. Create formal, actionable meeting minutes.

Format your response exactly like this:

## Meeting Minutes

**Date:** [Date or "Not specified"]
**Duration:** [Duration or "Not specified"]
**Type:** [Meeting type]

**Attendees:** [Names/roles if mentioned, otherwise "Not specified"]
**Facilitator:** [Name or "Not specified"]

---

## Agenda & Discussion

### Item 1: [Topic]
**Discussion summary:** [What was discussed]
**Key points raised:**
- [Point]
- [Point]
**Outcome:** [What was concluded]

### Item 2: [Topic]
[Repeat structure]

---

## Decisions Made
1. **[Decision]** — Approved by: [Name or "Group"]
2. **[Decision]** — Approved by: [Name or "Group"]

---

## Action Items
| Task | Owner | Due Date | Priority |
|------|-------|----------|----------|
| [Task] | [Name] | [Date] | High |
| [Task] | [Name] | [Date] | Medium |

---

## Next Steps
- [Next step]
- [Next step]

**Next meeting:** [Date/time or "TBD"]`,
}

export async function POST(request: Request) {
  console.log('[Summarize API] Request received');

  try {
    const rateLimitCheck = checkRateLimit(request as any, 'api')
    if (!rateLimitCheck.allowed) {
      return rateLimitCheck.response!
    }

    let body: unknown;
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 })
    }

    const result = SummarizeSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: 'Invalid input', details: result.error.issues }, { status: 400 })
    }

    const { text, mode, youtubeUrl } = result.data

    const validation = sanitizeAndValidate(text, 60000)
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }
    const sanitizedText = validation.sanitized

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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
      return NextResponse.json({ error: 'AI service not configured' }, { status: 500 })
    }

    const modePrompt = MODE_PROMPTS[mode] || MODE_PROMPTS['bullet-summary']

    const systemPrompt = `${modePrompt}

CRITICAL RULES:
- Write all words normally — never add spaces between letters of a word
- Use proper markdown: ## for headers, **bold**, - for bullets, > for quotes, --- for dividers
- Be specific and use actual content from the text, not generic placeholders
- Keep formatting clean and consistent throughout`

    const contextNote = youtubeUrl ? `\n\n[Source: ${youtubeUrl}]` : ''
    const userPrompt = `Analyze and summarize the following content:${contextNote}\n\n---\n\n${sanitizedText}`

    let summary: string;
    try {
      summary = await generateWithFallback(userPrompt, systemPrompt, {
        model: 'llama-3.3-70b-versatile',
        maxTokens: 3000,
        temperature: 0.15,
      })
    } catch (aiError: any) {
      console.error('[Summarize API] AI error:', aiError.message);
      return NextResponse.json({ error: aiError.message || 'Failed to generate summary' }, { status: 500 })
    }

    // Save to database (non-blocking)
    supabase.from('ai_summaries').insert({
      user_id: user.id,
      summary_text: summary,
      original_text: sanitizedText.substring(0, 10000),
      mode,
    }).then(({ error }) => {
      if (error) console.error('[Summarize API] DB insert error:', error.message)
    })

    // Track usage (non-blocking)
    supabase.rpc('track_usage', {
      p_user_id: user.id,
      p_type: 'summary',
      p_count: 1,
    }).then(({ error }) => {
      if (error) console.error('[Summarize API] Track usage error:', error.message)
    })

    return NextResponse.json({ summary })

  } catch (error: any) {
    console.error('[Summarize API] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
