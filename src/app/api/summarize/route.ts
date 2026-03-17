import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit } from '@/middleware/rate-limit'
import { sanitizeAndValidate } from '@/lib/input-validation'
import { checkUsageLimit } from '@/lib/usage-limits'
import { generateWithFallback } from '@/lib/ai-fallback'
import { z } from 'zod'

const SummarizeSchema = z.object({
  text: z.string().min(10, 'Text too short').max(50000, 'Text too long'),
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
  ]),
})

export async function POST(request: Request) {
  console.log('[Summarize API] Request received');
  
  try {
    // Check rate limit
    const rateLimitCheck = checkRateLimit(request as any, 'api')
    if (!rateLimitCheck.allowed) {
      console.log('[Summarize API] Rate limit exceeded');
      return rateLimitCheck.response!
    }

    // Parse and validate body
    let body;
    try {
      body = await request.json()
    } catch (e) {
      console.error('[Summarize API] JSON parse error:', e);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }

    const result = SummarizeSchema.safeParse(body)
    if (!result.success) {
      console.error('[Summarize API] Validation error:', result.error.issues);
      return NextResponse.json(
        { error: 'Invalid input', details: result.error.issues },
        { status: 400 }
      )
    }
    const { text, mode } = result.data
    console.log('[Summarize API] Text length:', text.length, 'Mode:', mode);

    // Sanitize input
    const validation = sanitizeAndValidate(text, 50000)
    if (!validation.valid) {
      console.error('[Summarize API] Sanitization failed:', validation.error);
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }
    const sanitizedText = validation.sanitized

    // Check authentication
    const supabase = await createClient()
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error('[Summarize API] Auth error:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('[Summarize API] User authenticated:', user.id);

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('subscription_tier, requests_used_this_month, email')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('[Summarize API] Profile fetch error:', profileError);
    }

    const tier = (profile?.subscription_tier || 'free') as 'free' | 'pro'
    const currentUsage = profile?.requests_used_this_month || 0
    
    console.log('[Summarize API] Usage:', currentUsage, 'Tier:', tier);
    
    // Check usage limits (skip for admin)
    if (profile?.email !== process.env.ADMIN_EMAIL) {
      const usageCheck = checkUsageLimit(tier, currentUsage)

      if (!usageCheck.allowed) {
        console.log('[Summarize API] Usage limit reached');
        return NextResponse.json(
          {
            error: 'Usage limit reached',
            message: `You've reached your ${tier} plan limit of ${usageCheck.limit} requests per month. Please upgrade to continue.`,
          },
          { status: 403 }
        )
      }
    }

    // Check Groq API key
    if (!process.env.GROQ_API_KEY) {
      console.error('[Summarize API] GROQ_API_KEY not set');
      return NextResponse.json(
        { error: 'AI service not configured' },
        { status: 500 }
      )
    }

    console.log('[Summarize API] Generating summary...');

    const modePrompts: Record<string, string> = {
      'action-items': `Extract all action items in a clean format.

# Action Items

## 🔴 High Priority
**[Action Title]**
- Owner: [Person]
- Due: [Date]
- Status: Not Started

## 🟡 Medium Priority  
**[Action Title]**
- Owner: [Person]
- Due: [Date]

## 🟢 Low Priority
**[Action Title]**
- Owner: [Person]
- Due: [Date]

---

**Summary:** [X] total • [X] high • [X] medium • [X] low`,

      'decisions': `Extract all key decisions with context.

# Key Decisions

## Decision 1: [Title]

**What was decided:**
[Clear statement]

**Why:**
[Rationale]

**Impact:**
[Expected outcomes]

**Stakeholders:**
[Who's affected]

---

## Decision 2: [Title]
[Repeat structure]

---

**Total:** [X] • **Strategic:** [X] • **Operational:** [X]`,

      'brutal-roast': `Provide witty, honest critique with real solutions.

# The Brutal Truth

## 🔥 What Went Wrong
[Sarcastic but insightful commentary]

**Top Offenders:**
1. **[Issue]** - [Witty critique]
2. **[Issue]** - [Witty critique]  
3. **[Issue]** - [Witty critique]

---

## 💡 Reality Check
**Core Problems:**
- [Honest assessment]
- [Honest assessment]

---

## ✅ How to Fix This

**Fix 1: [Title]**
- Problem: [What's wrong]
- Solution: [Specific fix]
- Impact: [Expected improvement]

**Fix 2: [Title]**
[Repeat structure]

---

## 🌟 Silver Lining
[What's actually good]`,

      'executive-brief': `Create concise executive summary.

# Executive Brief

## Summary
[2-3 sentences capturing essence]

---

## Key Highlights

**Strategic:**
- [Point with business impact]
- [Point with business impact]

**Financial:**
- [Cost/revenue implications]

**Timeline:**
- [Key dates]

---

## Implications

**Opportunities:**
[Value creation potential]

**Risks:**
[Key concerns]

**Resources Needed:**
[Requirements]

---

## Next Steps
1. [Action] - [Owner] - [Timeline]
2. [Action] - [Owner] - [Timeline]

**Decision Required:** [What needs approval]`,

      'full-breakdown': `Provide comprehensive analysis.

# Complete Analysis

## Overview
[3-4 sentence summary]

---

## Main Points

### 1. [Topic]
**Key Details:**
- [Detail]
- [Detail]

**Why It Matters:**
[Significance]

---

### 2. [Topic]
[Repeat structure]

---

## Key Takeaways
1. **[Takeaway]** - [Context]
2. **[Takeaway]** - [Context]

---

## Action Items
- [ ] [Action with details]
- [ ] [Action with details]

---

## Recommendations

**Immediate:**
1. [Action with rationale]

**Long-term:**
1. [Consideration with rationale]`,

      'key-quotes': `Extract most impactful quotes.

# Key Quotes

## Most Impactful

> "[The most powerful quote]"

**Context:** [When/where]
**Why It Matters:** [Significance]
**Speaker:** [Who]

---

## Notable Quotes

### Quote 2
> "[Important quote]"
- Context: [Background]
- Theme: [Topic]

---

### Quote 3
> "[Important quote]"
- Context: [Background]
- Theme: [Topic]

---

## By Theme

**Leadership:**
> "[Quote]"

**Strategy:**
> "[Quote]"

---

**Total:** [X] • **Dominant Theme:** [Theme]`,

      'sentiment': `Analyze emotional tone and sentiment.

# Sentiment Analysis

## Overall Sentiment

**Rating:** [Positive/Negative/Neutral/Mixed]
**Confidence:** [X/10]
**Intensity:** [Low/Medium/High]

[2-3 sentence summary]

---

## Emotional Breakdown

**Positive (X%):**
- [Emotion]: [Examples]
- [Emotion]: [Examples]

**Negative (X%):**
- [Emotion]: [Examples]
- [Emotion]: [Examples]

**Neutral (X%):**
- [Element]: [Examples]

---

## Tone Analysis

**Primary Tone:** [Type]

**Characteristics:**
- Formality: [Level]
- Urgency: [Level]
- Confidence: [Level]

**Language Patterns:**
[Notable patterns]

---

## Key Insights

**Emotional Drivers:**
[What's driving emotions]

**Underlying Concerns:**
[Implicit worries]

---

## Recommendations
[How to respond based on analysis]`,

      'eli5': `Explain in simplest terms possible.

# Simple Explanation

## The Big Idea
[Explain using simple words and short sentences]

---

## Why Should You Care?
[Why this matters simply]

---

## Real-Life Example

**Imagine this:**
[Relatable analogy]

**Here's how it works:**
1. [Simple step]
2. [Simple step]
3. [Simple step]

---

## The Important Parts

**Thing 1:** [One sentence]
**Thing 2:** [One sentence]
**Thing 3:** [One sentence]

---

## In One Sentence
[Super simple summary]

---

## Fun Fact
[Interesting tidbit]`,

      'swot': `Conduct strategic SWOT analysis.

# SWOT Analysis

## Strengths

**1. [Strength Title]**
- What: [Description]
- Evidence: [Proof]
- Impact: [Value created]

**2. [Strength Title]**
[Repeat]

**Key Capabilities:**
- [Capability]
- [Capability]

---

## Weaknesses

**1. [Weakness Title]**
- What: [Description]
- Impact: [Risk]
- Fix: [How to address]

**2. [Weakness Title]**
[Repeat]

---

## Opportunities

**1. [Opportunity Title]**
- What: [Description]
- Potential: [What could be gained]
- Requirements: [What's needed]
- Timeline: [When to act]

**2. [Opportunity Title]**
[Repeat]

---

## Threats

**1. [Threat Title]**
- What: [Description]
- Likelihood: [High/Medium/Low]
- Impact: [Potential damage]
- Response: [How to defend]

**2. [Threat Title]**
[Repeat]

---

## Strategic Recommendations

**Leverage Strengths:**
1. [How to use strength]

**Address Weaknesses:**
1. [How to fix weakness]

**Capture Opportunities:**
1. [How to seize opportunity]

**Mitigate Threats:**
1. [How to defend]

---

| Category | Count | Priority |
|----------|-------|----------|
| Strengths | [#] | [Level] |
| Weaknesses | [#] | [Level] |
| Opportunities | [#] | [Level] |
| Threats | [#] | [Level] |`,

      'meeting-minutes': `Create professional meeting minutes.

# Meeting Minutes

## Meeting Info

**Date:** [Date or "Not specified"]
**Time:** [Time or "Not specified"]
**Type:** [Regular/Special/Emergency]

**Attendees:**
- [Name] - [Role]
- [Name] - [Role]

**Chair:** [Name]

---

## Objectives
1. [Objective]
2. [Objective]

---

## Agenda Items

### 1. [Item Title]

**Discussion:**
[Summary]

**Key Points:**
- [Point]
- [Point]

**Decision:**
[What was decided]

**Actions:**
- [ ] [Task] - Owner: [Name] - Due: [Date]
- [ ] [Task] - Owner: [Name] - Due: [Date]

---

### 2. [Item Title]
[Repeat structure]

---

## Key Decisions

**1. [Decision]**
- Context: [Why needed]
- Decision: [What was decided]
- Rationale: [Why]
- Approved By: [Name]

---

## Action Items Summary

**High Priority:**
- [ ] [Task] - [Owner] - [Due Date]

**Medium Priority:**
- [ ] [Task] - [Owner] - [Due Date]

---

## Issues & Concerns

**Open Issues:**
1. [Issue] - Owner: [Name]

**Risks:**
- [Risk and mitigation]

---

## Next Steps
1. [Next step]
2. [Next step]

**Next Meeting:** [Date] at [Time]`,
    }

    const systemPrompt = `${modePrompts[mode] || 'Summarize professionally with clear structure.'}

FORMATTING RULES:
- Write words normally without spacing between letters
- Use ## for main headers, ### for subheaders
- Use **bold** for emphasis
- Use bullet points (-) and numbered lists (1. 2. 3.)
- Use > for blockquotes
- Use --- for section dividers`

    let summary: string;
    try {
      summary = await generateWithFallback(
        `Text to summarize:\n${sanitizedText}`,
        systemPrompt,
        { model: 'llama-3.3-70b-versatile', maxTokens: 2048, temperature: 0.2 }
      )
      console.log('[Summarize API] Summary generated, length:', summary.length);
    } catch (aiError: any) {
      console.error('[Summarize API] AI generation error:', aiError);
      return NextResponse.json(
        { error: 'Failed to generate summary', details: aiError.message },
        { status: 500 }
      )
    }

    const cleanedSummary = summary
      .split('\n')
      .map(line => {
        if (line.trim().startsWith('```')) {
          return line
        }

        let cleaned = line

        cleaned = cleaned.replace(/([A-Z])\s+([a-z]+)/g, (match, first, rest) => {
          const exceptions = ['a', 'an', 'am', 'is', 'it', 'or', 'of', 'to', 'in', 'on', 'at', 'by', 'as', 'if', 'we', 'us', 'be', 'do', 'go', 'no', 'so', 'up']
          if (exceptions.includes(rest.toLowerCase()) && rest.length <= 2) {
            return match
          }
          return first + rest
        })

        cleaned = cleaned.replace(/([a-zA-Z])( [a-zA-Z]){2,}/g, (match) => {
          return match.replace(/\s+/g, '')
        })

        cleaned = cleaned.replace(/\b([A-Z])( [A-Z])+\b/g, (match) => {
          return match.replace(/\s+/g, '')
        })

        return cleaned
      })
      .join('\n')

    // Save to database
    const { error: insertError } = await supabase.from('ai_summaries').insert({
      user_id: user.id,
      summary_text: cleanedSummary,
      original_text: sanitizedText.substring(0, 10000),
      mode,
    })

    if (insertError) {
      console.error('[Summarize API] Insert error:', insertError);
    }

    // Track usage
    const { error: trackError } = await supabase.rpc('track_usage', {
      p_user_id: user.id,
      p_type: 'summary',
      p_count: 1,
    })

    if (trackError) {
      console.error('[Summarize API] Track usage error:', trackError);
    }

    console.log('[Summarize API] Success');
    return NextResponse.json({ summary: cleanedSummary })
  } catch (error: any) {
    console.error('[Summarize API] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error?.message || 'Unknown error' },
      { status: 500 }
    )
  }
}
