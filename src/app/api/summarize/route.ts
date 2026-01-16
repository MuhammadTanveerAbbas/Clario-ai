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

    const { data: userData } = await supabase
      .from('users')
      .select('subscription_tier')
      .eq('id', user.id)
      .single()

    const tier = (userData?.subscription_tier || 'free') as 'free' | 'pro' | 'premium'

    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { data: usageData } = await supabase
      .from('usage_stats')
      .select('summaries_count')
      .eq('user_id', user.id)
      .gte('date', startOfMonth.toISOString().split('T')[0])

    const currentUsage = usageData?.reduce((sum, row) => sum + (row.summaries_count || 0), 0) || 0
    const usageCheck = checkUsageLimit(tier, 'summaries', currentUsage)

    if (!usageCheck.allowed) {
      return NextResponse.json(
        {
          error: 'Usage limit reached',
          message: `You've reached your ${tier} tier limit of ${usageCheck.limit} summaries per month. Please upgrade to continue.`,
        },
        { status: 403 }
      )
    }

    const modePrompts: Record<string, string> = {
      'Action Items Only': `Extract and organize all action items from the text.

## ACTION ITEMS

### High Priority
- **[Action Item Title]**
  - Description: [Clear description]
  - Owner: [Person responsible]
  - Due Date: [Deadline]
  - Status: [Not Started/In Progress/Blocked]

### Medium Priority
- **[Action Item Title]**
  - Description: [What needs to be done]
  - Owner: [Person responsible]
  - Due Date: [Deadline]

### Low Priority
- **[Action Item Title]**
  - Description: [What needs to be done]
  - Owner: [Person responsible]

---

### Summary
- **Total Action Items:** [Number]
- **High Priority:** [Number]
- **Medium Priority:** [Number]
- **Low Priority:** [Number]`,

      'Decisions Made': `Extract all decisions made in the text with full context.

## KEY DECISIONS

### Decision 1: [Clear Decision Title]

**Context**
[Background information and situation]

**Decision**
[Exactly what was decided]

**Rationale**
[Why this decision was made]

**Impact**
[Expected outcomes and consequences]

**Stakeholders**
[Who is affected or involved]

---

### Decision 2: [Title]
[Repeat structure for each decision]

---

### Decision Summary
- **Total Decisions:** [Number]
- **Strategic Decisions:** [Number]
- **Operational Decisions:** [Number]`,

      'Brutal Roast': `Provide a brutally honest, sarcastic critique with actionable fixes.

## THE BRUTAL ROAST

### What Went Wrong
[Deliver a sarcastic, witty critique of the main issues]

**The Biggest Offenders:**
1. **[Issue 1]** - [Sarcastic commentary]
2. **[Issue 2]** - [Sarcastic commentary]
3. **[Issue 3]** - [Sarcastic commentary]

---

### Reality Check
[Honest, professional assessment]

**Core Problems:**
- **Problem 1:** [Honest assessment]
- **Problem 2:** [Honest assessment]
- **Problem 3:** [Honest assessment]

---

### How to Actually Fix This

1. **[Fix Title]**
   - **Problem:** [What's wrong]
   - **Solution:** [Specific fix]
   - **Impact:** [Expected improvement]

2. **[Fix Title]**
   - **Problem:** [What's wrong]
   - **Solution:** [Specific fix]
   - **Impact:** [Expected improvement]

---

### Silver Lining
[What's actually good or salvageable]`,

      'Executive Brief': `Create a concise executive summary for leadership.

## EXECUTIVE BRIEF

### Executive Summary
[2-3 sentences capturing the essence]

---

### Key Highlights

**Strategic Points:**
- **[Point 1]:** [Concise description with business impact]
- **[Point 2]:** [Concise description with business impact]
- **[Point 3]:** [Concise description with business impact]

**Financial Implications:**
- [Any cost, revenue, or budget impacts]

**Timeline:**
- [Key dates and milestones]

---

### Strategic Implications

**Opportunities:**
[How this creates value or competitive advantage]

**Risks:**
[Potential challenges or concerns]

**Resource Requirements:**
[What's needed to execute]

---

### Recommended Next Steps

1. **[Action]** - [Owner] - [Timeline]
2. **[Action]** - [Owner] - [Timeline]
3. **[Action]** - [Owner] - [Timeline]

---

### Decision Required
[What needs executive approval or input]`,

      'Full Breakdown': `Provide a comprehensive, detailed analysis of the entire text.

## COMPLETE ANALYSIS

### Executive Summary
[Comprehensive 3-4 sentence overview]

---

### Main Points

#### 1. [First Major Point Title]

**Overview:**
[Detailed explanation]

**Key Details:**
- [Detail 1]
- [Detail 2]
- [Detail 3]

**Significance:**
[Why this matters]

---

#### 2. [Second Major Point Title]
[Repeat structure for each major point]

---

### Key Takeaways

1. **[Takeaway 1]**
   [Explanation and context]

2. **[Takeaway 2]**
   [Explanation and context]

3. **[Takeaway 3]**
   [Explanation and context]

---

### Action Items
- [ ] **[Action 1]** - [Details]
- [ ] **[Action 2]** - [Details]
- [ ] **[Action 3]** - [Details]

---

### Recommendations

**Immediate Actions:**
1. [Action with rationale]
2. [Action with rationale]

**Long-term Considerations:**
1. [Consideration with rationale]
2. [Consideration with rationale]

---

### Summary Statistics
- **Total Topics Covered:** [Number]
- **Action Items Identified:** [Number]
- **Key Decisions:** [Number]
- **Stakeholders Mentioned:** [Number]`,

      'Key Quotes': `Extract the most impactful and meaningful quotes.

## KEY QUOTES

### Most Impactful Quote

> "[The single most powerful or important quote]"

**Context:**
[When/where this was said]

**Why This Matters:**
[Significance and implications]

**Speaker:**
[Who said it, if mentioned]

**Key Insight:**
[What this reveals or teaches]

---

### Notable Quotes

#### Quote 2
> "[Second important quote]"

- **Context:** [Background]
- **Significance:** [Why it matters]
- **Theme:** [What topic it relates to]

---

#### Quote 3
> "[Third important quote]"

- **Context:** [Background]
- **Significance:** [Why it matters]
- **Theme:** [What topic it relates to]

---

### Quotes by Theme

**Leadership:**
> "[Quote about leadership]"

**Strategy:**
> "[Quote about strategy]"

**Innovation:**
> "[Quote about innovation]"

---

### Quote Analysis
- **Total Quotes Extracted:** [Number]
- **Dominant Theme:** [Theme]
- **Overall Tone:** [Tone description]`,

      'Sentiment Analysis': `Analyze the emotional tone, sentiment, and underlying feelings.

## SENTIMENT ANALYSIS

### Overall Sentiment

**Sentiment Rating:** [Positive/Negative/Neutral/Mixed]
**Confidence Score:** [X/10]
**Emotional Intensity:** [Low/Medium/High]

[2-3 sentence summary of the overall emotional tone]

---

### Emotional Breakdown

**Positive Emotions (X%):**
- **[Emotion]:** [Examples and context]
- **[Emotion]:** [Examples and context]
- **[Emotion]:** [Examples and context]

**Negative Emotions (X%):**
- **[Emotion]:** [Examples and context]
- **[Emotion]:** [Examples and context]
- **[Emotion]:** [Examples and context]

**Neutral Elements (X%):**
- **[Element]:** [Examples and context]

---

### Tone Analysis

**Primary Tone:** [Professional/Casual/Urgent/Optimistic/etc.]

**Tone Characteristics:**
- **Formality Level:** [Formal/Informal/Mixed]
- **Urgency:** [High/Medium/Low]
- **Confidence:** [High/Medium/Low]
- **Objectivity:** [Objective/Subjective/Balanced]

**Language Patterns:**
[Notable patterns in word choice or phrasing]

---

### Key Insights

**Emotional Drivers:**
[What's driving the emotions]

**Sentiment Shifts:**
[Any changes in tone throughout]

**Underlying Concerns:**
[Implicit worries or anxieties]

**Motivations:**
[What seems to be motivating the communication]

---

### Sentiment Timeline
- **Beginning:** [Initial sentiment]
- **Middle:** [How it evolved]
- **End:** [Final sentiment]

---

### Recommendations
[How to respond or act based on this analysis]`,

      'ELI5': `Explain the content in the simplest possible terms.

## SIMPLE EXPLANATION

### The Big Idea

[Explain the main concept using simple words and short sentences]

---

### Why Should You Care?

[Explain why this matters in simple terms]

---

### Real-Life Example

**Imagine this:**
[Create a relatable analogy using everyday situations]

**Here's how it works:**
1. [Step 1 in simple terms]
2. [Step 2 in simple terms]
3. [Step 3 in simple terms]

---

### The Important Parts

**Thing 1: [Simple name]**
[One sentence explanation]

**Thing 2: [Simple name]**
[One sentence explanation]

**Thing 3: [Simple name]**
[One sentence explanation]

---

### In One Sentence

[Summarize in one super simple sentence]

---

### Fun Fact

[Add an interesting, simple fact]`,

      'SWOT Analysis': `Conduct a strategic SWOT analysis.

## SWOT ANALYSIS

### Strengths

**Internal Advantages:**

1. **[Strength 1 Title]**
   - **Description:** [What makes this a strength]
   - **Evidence:** [Proof or examples]
   - **Impact:** [How this creates value]

2. **[Strength 2 Title]**
   [Repeat structure]

**Key Capabilities:**
- [Capability 1]
- [Capability 2]
- [Capability 3]

---

### Weaknesses

**Internal Limitations:**

1. **[Weakness 1 Title]**
   - **Description:** [What the weakness is]
   - **Evidence:** [Examples]
   - **Impact:** [How this creates risk]
   - **Mitigation:** [How to address it]

2. **[Weakness 2 Title]**
   [Repeat structure]

**Areas for Improvement:**
- [Area 1]
- [Area 2]
- [Area 3]

---

### Opportunities

**External Possibilities:**

1. **[Opportunity 1 Title]**
   - **Description:** [What the opportunity is]
   - **Potential:** [What could be gained]
   - **Requirements:** [What's needed]
   - **Timeline:** [When to act]

2. **[Opportunity 2 Title]**
   [Repeat structure]

**Market Trends:**
- [Trend 1 and how to leverage it]
- [Trend 2 and how to leverage it]

---

### Threats

**External Risks:**

1. **[Threat 1 Title]**
   - **Description:** [What the threat is]
   - **Likelihood:** [High/Medium/Low]
   - **Impact:** [Potential damage]
   - **Response:** [How to defend]

2. **[Threat 2 Title]**
   [Repeat structure]

**Risk Factors:**
- [Risk 1]
- [Risk 2]
- [Risk 3]

---

### Strategic Recommendations

**Leverage Strengths:**
1. [How to use strength 1]
2. [How to use strength 2]

**Address Weaknesses:**
1. [How to fix weakness 1]
2. [How to fix weakness 2]

**Capture Opportunities:**
1. [How to seize opportunity 1]
2. [How to seize opportunity 2]

**Mitigate Threats:**
1. [How to defend against threat 1]
2. [How to defend against threat 2]

---

### SWOT Summary Matrix

| Category | Count | Priority Level |
|----------|-------|----------------|
| Strengths | [#] | [High/Med/Low] |
| Weaknesses | [#] | [High/Med/Low] |
| Opportunities | [#] | [High/Med/Low] |
| Threats | [#] | [High/Med/Low] |

**Overall Assessment:** [Brief strategic conclusion]`,

      'Meeting Minutes': `Create formal, professional meeting minutes.

## MEETING MINUTES

### Meeting Information

**Date:** [Extract or indicate "Not specified"]
**Time:** [Extract or indicate "Not specified"]
**Location:** [Extract or indicate "Not specified"]
**Meeting Type:** [Regular/Special/Emergency/etc.]

**Attendees:**
- [Name 1] - [Role, if mentioned]
- [Name 2] - [Role, if mentioned]
- [Name 3] - [Role, if mentioned]

**Absent:**
- [Name, if mentioned]

**Meeting Chair:** [Name, if mentioned]
**Note Taker:** [Name, if mentioned]

---

### Meeting Objectives

1. [Objective 1]
2. [Objective 2]
3. [Objective 3]

---

### Agenda Items

#### 1. [First Agenda Item Title]

**Discussion:**
[Detailed summary]

**Key Points Raised:**
- [Point 1]
- [Point 2]
- [Point 3]

**Decision:**
[What was decided, if applicable]

**Action Items:**
- [ ] **[Task]** - Owner: [Name] - Due: [Date]
- [ ] **[Task]** - Owner: [Name] - Due: [Date]

---

#### 2. [Second Agenda Item Title]
[Repeat structure for each agenda item]

---

### Key Decisions

1. **[Decision 1]**
   - **Context:** [Why this decision was needed]
   - **Decision:** [What was decided]
   - **Rationale:** [Why]
   - **Approved By:** [Name/Role]

2. **[Decision 2]**
   [Repeat structure]

---

### Action Items Summary

**High Priority:**
- [ ] **[Task]** - Owner: [Name] - Due: [Date] - Status: [Not Started]
- [ ] **[Task]** - Owner: [Name] - Due: [Date] - Status: [Not Started]

**Medium Priority:**
- [ ] **[Task]** - Owner: [Name] - Due: [Date]
- [ ] **[Task]** - Owner: [Name] - Due: [Date]

**Low Priority:**
- [ ] **[Task]** - Owner: [Name] - Due: [Date]

---

### Issues & Concerns

**Open Issues:**
1. **[Issue]** - [Description] - Owner: [Name]
2. **[Issue]** - [Description] - Owner: [Name]

**Risks Identified:**
- [Risk 1 and mitigation plan]
- [Risk 2 and mitigation plan]

---

### Next Steps

1. [Next step 1]
2. [Next step 2]
3. [Next step 3]

**Next Meeting:**
- **Date:** [Date, if mentioned]
- **Time:** [Time, if mentioned]
- **Agenda:** [Topics for next meeting]

---

### Attachments & References

- [Document 1, if mentioned]
- [Document 2, if mentioned]

---

**Minutes Prepared By:** [Auto-generated by Clario]
**Date Prepared:** [Current date]
**Distribution:** [All attendees]`,
    }

    const prompt = `${modePrompts[mode] || 'Summarize the following text professionally with clear structure.'}

CRITICAL TEXT FORMATTING REQUIREMENTS:
- Write all words normally without any spacing between letters
- Example of CORRECT formatting: "Complete Analysis"
- Example of WRONG formatting: "C omplete A nalysis" or "C o m p l e t e"
- Never insert spaces within individual words
- Only use spaces to separate complete words from each other
- All headings must use standard capitalization (e.g., "Key Findings" not "K ey F indings")
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

    // Fix letter spacing: remove spaces between the first capital letter and the rest of the word
    // This fixes patterns like "C ap", "T he", "W hy", "R eal" -> "Cap", "The", "Why", "Real"
    const cleanedSummary = summary
      .split('\n')
      .map(line => {
        // Skip markdown code blocks and preserve them
        if (line.trim().startsWith('```')) {
          return line
        }

        let cleaned = line

        // MAIN FIX: Single capital letter + space + lowercase letters = broken word
        // Pattern: "C ap", "T he", "W hy", "R eal" -> "Cap", "The", "Why", "Real"
        // This is the core issue - first letter separated from the rest
        cleaned = cleaned.replace(/([A-Z])\s+([a-z]+)/g, (match, first, rest) => {
          // Very short exception words that might legitimately follow a single letter
          const exceptions = ['a', 'an', 'am', 'is', 'it', 'or', 'of', 'to', 'in', 'on', 'at', 'by', 'as', 'if', 'we', 'us', 'be', 'do', 'go', 'no', 'so', 'up']
          // Only skip if it's a very short exception word (1-2 chars)
          if (exceptions.includes(rest.toLowerCase()) && rest.length <= 2) {
            return match
          }
          // Combine them - this fixes "C ap" -> "Cap", "T he" -> "The", etc.
          return first + rest
        })

        // Also fix multiple spaces between letters (like "C o m p l e t e")
        cleaned = cleaned.replace(/([a-zA-Z])( [a-zA-Z]){2,}/g, (match) => {
          return match.replace(/\s+/g, '')
        })

        // Fix ALL CAPS with spaces (like "S I M P L E")
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

    await supabase.rpc('track_usage', {
      p_user_id: user.id,
      p_type: 'summary',
      p_count: 1,
    })

    return NextResponse.json({ summary: cleanedSummary })
  } catch (error: any) {
    console.error('Summarize API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate summary' },
      { status: 500 }
    )
  }
}
