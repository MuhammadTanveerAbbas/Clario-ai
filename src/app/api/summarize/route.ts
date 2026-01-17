import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit } from '@/middleware/rate-limit'
import { sanitizeInput } from '@/lib/security'
import { checkUsageLimit } from '@/lib/usage-limits'
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' })

export async function POST(request: Request) {
  try {
    const rateLimitCheck = checkRateLimit(request as any, 'api')
    if (!rateLimitCheck.allowed) {
      return rateLimitCheck.response!
    }

    let body
    try {
      body = await request.json()
    } catch (e) {
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 })
    }

    const { text, mode } = body

    if (!text || !mode) {
      return NextResponse.json({ error: 'Text and mode are required' }, { status: 400 })
    }

    const sanitizedText = sanitizeInput(text)

    if (sanitizedText.length < 10) {
      return NextResponse.json({ error: 'Text must be at least 10 characters' }, { status: 400 })
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier, requests_used_this_month, email')
      .eq('id', user.id)
      .single()

    const tier = (profile?.subscription_tier || 'free') as 'free' | 'pro'
    const currentUsage = profile?.requests_used_this_month || 0
    
    // Unlimited access for admin
    if (profile?.email !== 'muhammadtanveerabbas.dev@gmail.com') {
      const usageCheck = checkUsageLimit(tier, currentUsage)

      if (!usageCheck.allowed) {
        return NextResponse.json(
          {
            error: 'Usage limit reached',
            message: `You've reached your ${tier} plan limit of ${usageCheck.limit} requests per month. Please upgrade to continue.`,
          },
          { status: 403 }
        )
      }
    }

    const modePrompts: Record<string, string> = {
      'Action Items Only': `Extract all action items in a clean format.

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

      'Decisions Made': `Extract all key decisions with context.

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

      'Brutal Roast': `Provide witty, honest critique with real solutions.

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

      'Executive Brief': `Create concise executive summary.

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

      'Full Breakdown': `Provide comprehensive analysis.

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

      'Key Quotes': `Extract most impactful quotes.

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

      'Sentiment Analysis': `Analyze emotional tone and sentiment.

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

      'ELI5': `Explain in simplest terms possible.

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

      'SWOT Analysis': `Conduct strategic SWOT analysis.

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

      'Meeting Minutes': `Create professional meeting minutes.

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

    const prompt = `${modePrompts[mode] || 'Summarize professionally with clear structure.'}

FORMATTING RULES:
- Write words normally without spacing between letters
- Use ## for main headers, ### for subheaders
- Use **bold** for emphasis
- Use bullet points (-) and numbered lists (1. 2. 3.)
- Use > for blockquotes
- Use --- for section dividers

Text to summarize:
${sanitizedText}`

    const model = 'llama-3.3-70b-versatile'
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model,
      temperature: 0.3,
      max_tokens: 2000,
    })
    const summary = completion.choices[0]?.message?.content || 'Failed to generate summary'

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

    await supabase.from('ai_summaries').insert({
      user_id: user.id,
      summary_text: cleanedSummary,
      original_text: sanitizedText.substring(0, 10000),
      mode,
    })

    const { error: trackError } = await supabase.rpc('track_usage', {
      p_user_id: user.id,
      p_type: 'summary',
      p_count: 1,
    })

    if (trackError) {
      console.error("Failed to track usage:", trackError)
    }

    return NextResponse.json({ summary: cleanedSummary })
  } catch (error: any) {
    console.error('Summarize API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate summary' },
      { status: 500 }
    )
  }
}
