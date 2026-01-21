---
name: clavix-summarize
description: Extract structured requirements from conversations into mini-PRD format
license: Apache-2.0
---

# Clavix Summarize Skill

Extract structured requirements from conversational exploration into a mini-PRD and optimized prompt files.

## What This Skill Does

1. **Pre-validate conversation** - Check for minimum viable requirements
2. **Extract key points** - Identify features, constraints, scope with confidence
3. **Generate output files** - Create mini-PRD, quick-prd, and original-prompt
4. **Quality check** - Assess on 5 dimensions
5. **Save for planning** - Store in `.clavix/outputs/{project}/`

---

## State Assertion (REQUIRED)

**Before starting extraction, output:**

```
**CLAVIX MODE: Requirements Extraction**
Mode: planning
Purpose: Extracting and optimizing requirements from conversation
Implementation: BLOCKED - I will extract requirements, not implement them
```

---

## Self-Correction Protocol

**DETECT**: If you find yourself doing any of these 6 mistake types:

| Type | What It Looks Like |
|------|--------------------|
| 1. Implementation Code | Writing function/class definitions, creating components, generating API endpoints, test files, database schemas, or configuration files for the user's feature |
| 2. Skipping Pre-Validation | Not checking conversation completeness before extracting requirements |
| 3. Missing Confidence Indicators | Not annotating requirements with [HIGH], [MEDIUM], [LOW] confidence |
| 4. Not Creating Output Files | Not creating mini-prd.md, quick-prd.md, and original-prompt.md files |
| 5. No Optimization Applied | Not applying quality patterns to extracted requirements |
| 6. Capability Hallucination | Claiming features Clavix doesn't have, inventing workflows |

**STOP**: Immediately halt the incorrect action

**CORRECT**: Output:
"I apologize - I was [describe mistake]. Let me return to requirements extraction."

**RESUME**: Return to the requirements extraction workflow with validation and file creation.

---

## Pre-Extraction Validation (CRITICAL)

**CHECKPOINT:** Pre-extraction validation started

Before extracting, verify minimum viable requirements are present:

| Check | Question |
|-------|----------|
| **Objective/Goal** | Is there a clear problem or goal stated? |
| **Requirements** | Are there at least 2-3 concrete features or capabilities described? |
| **Context** | Is there enough context about who/what/why? |

**If missing critical elements:**

1. Identify what's missing specifically
2. Ask targeted questions to fill gaps:
   - Missing objective: "What problem are you trying to solve?"
   - Vague requirements: "Can you describe 2-3 specific things this should do?"
   - No context: "Who will use this and in what situation?"
3. **DO NOT proceed** to extraction until minimum viable requirements are met

**If requirements are present:**

```
**CHECKPOINT:** Pre-extraction validation passed - minimum requirements present

I'll now analyze our conversation and extract structured requirements.
```

---

## Confidence Indicators

Annotate every extracted element with confidence level:

| Level | Criteria |
|-------|----------|
| **[HIGH]** | Explicitly stated multiple times with details |
| **[MEDIUM]** | Mentioned once or inferred from context |
| **[LOW]** | Assumed based on limited information |

**Calculate Extraction Confidence:**
- Start with 50% base (conversational content detected)
- Add 20% if concrete requirements extracted
- Add 15% if clear goals identified
- Add 15% if constraints defined
- Display: "*Extraction confidence: X%*"
- If confidence < 80%, include verification prompt in output

**CHECKPOINT:** Extracted [N] requirements, [M] constraints from conversation (confidence: X%)

---

## Project Naming Protocol

Before creating files, derive a project name:

**Step 1: Analyze conversation** to extract a meaningful name:
- Look for explicit project names mentioned
- Identify the main topic/feature being discussed
- Use key nouns (e.g., "auth", "dashboard", "todo")

**Step 2: Generate suggested name:**
- Format: lowercase, hyphen-separated (e.g., "user-auth", "sales-dashboard")
- Keep it short (2-4 words max)
- Make it descriptive but concise

**Step 3: Ask user to confirm:**

```
I'll save these requirements as project "[suggested-name]".

Is this name okay? (y/n/custom name)
```

**Step 4: Handle response:**
- "y" or "yes" → use suggested name
- "n" or "no" → ask for custom name
- Any other text → use that as the project name (sanitize to lowercase-hyphenated)

---

## Output Files (REQUIRED)

You MUST create three files. This is not optional.

### File 1: mini-prd.md

Location: `.clavix/outputs/{project}/mini-prd.md`

**Template:**

```markdown
# Requirements: [Project Name]

*Generated from conversation on [date]*
*Extraction confidence: X%*

## Objective
[Clear, specific goal extracted from conversation]

## Core Requirements

### Must Have (High Priority)
- [HIGH] Requirement 1 with specific details
- [HIGH] Requirement 2 with specific details

### Should Have (Medium Priority)
- [MEDIUM] Requirement 3
- [MEDIUM] Requirement 4

### Could Have (Low Priority / Inferred)
- [LOW] Requirement 5

## Technical Constraints
- **Framework/Stack:** [If specified]
- **Performance:** [Any performance requirements]
- **Scale:** [Expected load/users]
- **Integrations:** [External systems]
- **Other:** [Any other technical constraints]

## Architecture & Design
- **Pattern:** [e.g. Monolith, Microservices, Serverless]
- **Structure:** [e.g. Feature-based, Layered, Clean Architecture]
- **Key Decisions:** [Specific design choices made]

## User Context
**Target Users:** [Who will use this?]
**Primary Use Case:** [Main problem being solved]
**User Flow:** [High-level description]

## Edge Cases & Considerations
- [Edge case 1 and how it should be handled]
- [Open question 1 - needs clarification]

## Implicit Requirements
*Inferred from conversation context - please verify:*
- [Category] [Requirement inferred from discussion]
- [Category] [Another requirement]
> **Note:** These requirements were surfaced by analyzing conversation patterns.

## Success Criteria
How we know this is complete and working:
- ✓ [Specific success criterion 1]
- ✓ [Specific success criterion 2]

## Next Steps
1. Review this PRD for accuracy and completeness
2. If anything is missing or unclear, continue the conversation
3. When ready, use the optimized prompt for implementation

---
*This PRD was generated by Clavix from conversational requirements gathering.*
```

**CHECKPOINT:** Created mini-prd.md successfully

### File 2: quick-prd.md

Location: `.clavix/outputs/{project}/quick-prd.md`

AI-optimized 2-3 paragraph summary for efficient consumption.

**Format:**

```markdown
# Quick PRD: [Project Name]

[Paragraph 1: Problem statement and core objective. Who has this problem and why it matters.]

[Paragraph 2: Core features and capabilities. What must be built. Technical constraints that shape the solution.]

[Paragraph 3: Success criteria and scope boundaries. How we'll know it's done. What's explicitly excluded.]

---
*Optimized summary for AI consumption. See mini-prd.md for full details.*
```

**CHECKPOINT:** Created quick-prd.md successfully

### File 3: original-prompt.md

Location: `.clavix/outputs/{project}/original-prompt.md`

Raw extraction in paragraph form - UNOPTIMIZED version.

**Format:**

```markdown
# Original Prompt (Extracted from Conversation)

[Paragraph 1: Project objective and core functionality as discussed]

[Paragraph 2: Key features and requirements mentioned]

[Paragraph 3: Technical constraints and context provided]

[Paragraph 4: Success criteria and additional considerations]

---
*Raw extraction from conversation. See quick-prd.md for optimized version.*
```

**CHECKPOINT:** Created original-prompt.md successfully

---

## File Verification

After writing each file, use Read to confirm it exists and contains expected content.

**Verification checklist:**
- [ ] mini-prd.md exists and has all sections
- [ ] quick-prd.md exists with 2-3 paragraphs
- [ ] original-prompt.md exists with raw extraction

---

## Quality Assessment

Evaluate the extracted requirements on 5 dimensions (Specificity excluded for summaries):

| Dimension | Score | Criteria |
|-----------|-------|----------|
| **Clarity** | 0-100% | Are requirements unambiguous and understandable? |
| **Efficiency** | 0-100% | Is information dense without unnecessary words? |
| **Structure** | 0-100% | Are requirements logically organized? |
| **Completeness** | 0-100% | Are all discussed topics captured? |
| **Actionability** | 0-100% | Can someone build from these requirements? |

Display overall score and note areas needing improvement.

---

## Mode Boundaries

**Do:**
- Extract requirements from conversation
- Generate all three output files
- Assess quality and completeness
- Identify open questions
- Apply confidence indicators

**Don't:**
- Write implementation code
- Make up requirements not discussed
- Skip file creation
- Proceed without pre-validation

---

## Workflow Navigation

**You are here:** Summarize (Conversation Extraction)

**Common workflows:**
- **Standard flow**: `/clavix-start` → [conversation] → `/clavix-summarize` → Use optimized prompt
- **To implementation**: `/clavix-summarize` → `/clavix-plan` → `/clavix-implement`
- **Standalone use**: [Any conversation] → `/clavix-summarize` → Extract and optimize

**After completion, guide user to:**
- `/clavix-plan` - Generate tasks from the mini-PRD (if strategic)
- `/clavix-implement --latest` - Build directly (if simple)
- `/clavix-improve` - Polish the extracted prompt further

---

## Troubleshooting

### Issue: Pre-extraction validation fails
**Cause**: Conversation didn't cover enough detail
**Solution**: List what's missing. Ask targeted questions. Only proceed after minimum requirements met.

### Issue: Low confidence across all elements
**Cause**: Conversation was too vague or high-level
**Solution**: Don't extract with [LOW] everywhere. Ask follow-up questions or suggest `/clavix-start` for deeper exploration.

### Issue: Files not created or verification fails
**Cause**: Skipped file creation steps
**Solution**: Review file creation instructions. Ensure each file uses Write tool. Verify all files exist.

### Issue: Multiple unrelated topics in conversation
**Cause**: Exploratory discussion without focus
**Solution**: Ask which topic to extract. Or extract all separately with [MULTI-TOPIC] indicator.

### Issue: Extracted requirements contradict earlier discussion
**Cause**: Requirements evolved during conversation
**Solution**: Use latest/final version. Note evolution. Ask user to confirm if major contradictions.
