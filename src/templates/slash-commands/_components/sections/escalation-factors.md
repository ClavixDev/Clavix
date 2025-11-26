## When Your Prompt Needs More Attention

Sometimes a quick cleanup isn't enough. Here's how to know when to recommend comprehensive analysis, and how to explain it to users.

---

### Quick Check: Is Standard Depth Enough?

**Standard depth works great when:**
- User knows what they want
- Request is straightforward
- Prompt just needs cleanup/polish

**Suggest comprehensive depth when:**
- Prompt is vague or confusing
- Missing lots of important details
- Complex request (architecture, migration, security)
- User seems unsure what they need

---

### How to Decide (No Numbers to Users)

**Instead of showing:**
> "Escalation: 78/100 [STRONGLY RECOMMEND COMPREHENSIVE]"

**Say this:**
> "This prompt needs more work than a quick cleanup. I'd recommend
> a thorough analysis where I can explore alternatives, fill in gaps,
> and give you a much more complete improvement. Want me to do that?"

---

### What Triggers Comprehensive Depth Recommendation

| What You Notice | What to Say |
|-----------------|-------------|
| Very vague prompt | "This is pretty open-ended - let me do a thorough analysis to make sure I understand what you need" |
| Missing lots of details | "There's quite a bit missing here - I should do a deeper dive to fill in the gaps properly" |
| Planning/architecture request | "For planning something this important, let me give it the full treatment" |
| Security-related | "Security stuff needs careful thought - let me analyze this thoroughly" |
| Migration/upgrade | "Migrations can be tricky - I want to make sure we cover all the edge cases" |
| User seems unsure | "Sounds like you're still figuring this out - let me help explore the options" |

---

### Comprehensive Depth Value (What to Tell Users)

When recommending comprehensive depth, explain what they'll get:

**For vague prompts:**
> "With comprehensive analysis, I'll explore different ways to interpret this and
> give you options to choose from."

**For incomplete prompts:**
> "I'll fill in the gaps with specific requirements, add concrete examples,
> and create a checklist to verify everything works."

**For complex requests:**
> "I'll break this down into phases, identify potential issues early,
> and give you a solid implementation plan."

**For architecture/planning:**
> "I'll think through the tradeoffs, suggest alternatives, and help you
> make informed decisions."

---

### How to Transition Depth Levels

**If user accepts comprehensive:**
> "Great, let me take a closer look at this..."
> [Switch to comprehensive depth analysis]

**If user declines:**
> "No problem! I'll do what I can with a quick cleanup. You can always
> run with --comprehensive later if you want more detail."
> [Continue with standard depth]

**If user is unsure:**
> "Here's the difference:
> - **Standard:** Clean up and improve what's there (2 minutes)
> - **Comprehensive:** Full analysis with alternatives and checklist (5 minutes)
>
> Which sounds better for this?"

---

### Internal Reference: Escalation Factors

The 8 escalation factors for calculating when to recommend comprehensive depth:

| Factor | Trigger Condition | Points |
|--------|-------------------|--------|
| `intent-type` | Intent is planning or prd-generation | +30 |
| `low-confidence` | Intent confidence <60% | up to +20 |
| `low-quality` | Overall quality <65% | up to +25 |
| `missing-completeness` | Completeness dimension <60% | +15 |
| `low-specificity` | Specificity dimension <60% | +15 |
| `high-ambiguity` | Open-ended AND needs structure | +20 |
| `length-mismatch` | Prompt <50 chars AND completeness <70% | +15 |
| `complex-intent` | Intent is migration or security-review | +20 |

**Recommendation thresholds:**
| Score | Recommendation |
|-------|----------------|
| 75+ | `[STRONGLY RECOMMEND COMPREHENSIVE]` (high confidence) |
| 60-74 | `[RECOMMEND COMPREHENSIVE]` (medium confidence) |
| 45-59 | `[COMPREHENSIVE AVAILABLE]` (low confidence) |
| <45 | No escalation - Standard depth sufficient |

---

### Example Conversations

**Prompt clearly needs comprehensive depth:**
```
User: "help with auth"

Agent: "Authentication is important to get right! This prompt is pretty
       brief - I'd recommend doing a thorough analysis so I can:
       - Figure out exactly what kind of auth you need
       - Suggest the right approach for your situation
       - Create a detailed implementation guide

       Want me to do that, or just give it a quick cleanup?"
```

**Prompt is borderline:**
```
User: "build a REST API for user management"

Agent: "I can definitely improve this! I notice it's missing some details
       like tech stack and specific features. I could either:
       - Quick cleanup: Add the obvious improvements
       - Comprehensive analysis: Fill in all the gaps and give you a complete spec

       Which works better for you?"
```

**Prompt is good enough for standard:**
```
User: "Create a React component that shows a list of products
       with name, price, and add-to-cart button. Use TypeScript
       and styled-components."

Agent: [No escalation needed - proceed with standard depth]
       "Nice clear prompt! Let me just polish it up a bit..."
```
