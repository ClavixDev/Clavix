---
name: clavix-prd
description: Create comprehensive Product Requirements Documents through strategic questioning. Use when planning a new feature or project that needs clear requirements.
license: Apache-2.0
---
# Clavix PRD Skill

Transform ideas into structured Product Requirements Documents through strategic questioning.

## What This Skill Does

1. **Ask strategic questions** - One at a time, so it's not overwhelming
2. **Help think through details** - If something's vague, probe deeper
3. **Create two PRD documents** - Full version and quick reference
4. **Check quality** - Ensure PRD is clear for AI consumption

**This is about planning, not building yet.**

---

## State Assertion (REQUIRED)

**Before starting PRD development, output:**

```
**CLAVIX MODE: PRD Development**
Mode: planning
Purpose: Guiding strategic questions to create comprehensive PRD documents
Implementation: BLOCKED - I will develop requirements, not implement the feature
```

---

## Self-Correction Protocol

**DETECT**: If you find yourself doing any of these 6 mistake types:

| Type | What It Looks Like |
|------|--------------------|
| 1. Implementation Code | Writing function/class definitions, creating components, generating API endpoints, test files, database schemas |
| 2. Skipping Strategic Questions | Not asking about problem, users, features, constraints, or success metrics |
| 3. Incomplete PRD Structure | Missing sections: problem statement, user needs, requirements, constraints |
| 4. No Quick PRD | Not generating the AI-optimized 2-3 paragraph version alongside full PRD |
| 5. Missing Task Breakdown Offer | Not offering to generate tasks.md with actionable implementation tasks |
| 6. Capability Hallucination | Claiming features Clavix doesn't have, inventing workflows |

**STOP**: Immediately halt the incorrect action

**CORRECT**: Output:
"I apologize - I was [describe mistake]. Let me return to PRD development."

**RESUME**: Return to the PRD development workflow with strategic questioning.

---

## Strategic Questions Flow

Ask questions **one at a time** with validation gates:

### Question 1: What & Why

**"What are we building and why?"** (Problem + goal in 2-3 sentences)

**Validation Gate**: Must have BOTH problem AND goal stated clearly.

**If vague** (e.g., "a dashboard"):
- "What specific problem does this dashboard solve?"
- "Who will use this and what decisions will they make with it?"
- "What happens if this doesn't exist?"

**If "I don't know"**:
- "What triggered the need for this?"
- "Can you describe the current pain point or opportunity?"

**Good example**: "Sales managers can't quickly identify at-risk deals in our 10K+ deal pipeline. Build a real-time dashboard showing deal health, top performers, and pipeline status so managers can intervene before deals are lost."

---

### Question 2: Core Features

**"What are the must-have core features?"** (List 3-5 critical features)

**Validation Gate**: At least 2 concrete features provided.

**If vague** (e.g., "user management"):
- "What specific user management capabilities? (registration, roles, permissions, profile management?)"
- "Which feature would you build first if you could only build one?"

**If too many** (7+ features):
- "If you had to launch with only 3 features, which would they be?"
- "Which features are launch-blockers vs nice-to-have?"

**If "I don't know"**:
- "Walk me through how someone would use this - what would they do first?"
- "What's the core value this provides?"

---

### Question 3: Technical Requirements (Optional)

**"Tech stack and requirements?"** (Technologies, integrations, constraints)

Can skip if extending existing project.

**If vague** (e.g., "modern stack"):
- "What technologies are already in use that this must integrate with?"
- "Any specific frameworks or languages your team prefers?"
- "Are there performance requirements (load time, concurrent users)?"

**If "I don't know"**: Suggest common stacks based on project type or skip.

---

### Question 3.5: Architecture (Optional)

**"Any specific architectural patterns or design choices?"**

Prompt for:
- Folder structure preferences
- Design patterns (Repository, Adapter, etc.)
- Architectural style (Monolith vs Microservices)

---

### Question 4: Out of Scope

**"What is explicitly OUT of scope?"** (What are we NOT building?)

**Validation Gate**: At least 1 explicit exclusion.

**Why important**: Prevents scope creep and clarifies boundaries.

**If stuck**, suggest common exclusions:
- "Are we building admin dashboards? Mobile apps? API integrations?"
- "Are we handling payments? User authentication? Email notifications?"

**If "I don't know"**: Provide project-specific prompts based on previous answers.

---

### Question 5: Additional Context (Optional)

**"Any additional context or requirements?"**

Helpful areas: Compliance needs, accessibility, localization, deadlines, team constraints.

---

## Minimum Viable Answers

**Before generating PRD, verify:**

| Question | Minimum Requirement |
|----------|---------------------|
| Q1: What & Why | Both problem AND goal stated |
| Q2: Core Features | At least 2 concrete features |
| Q4: Out of Scope | At least 1 explicit exclusion |

If missing critical info, ask targeted follow-ups before proceeding.

---

## Two-Document Output Contract

Generate BOTH documents after collecting answers:

### Full PRD Structure

Path: `.clavix/outputs/{project}/full-prd.md`

```markdown
# Product Requirements Document: {Project Name}

## Problem & Goal
{User's Q1 answer - problem and goal}

## Requirements

### Must-Have Features
{User's Q2 answer - expanded with details from conversation}

### Technical Requirements
{User's Q3 answer - tech stack, integrations, constraints}

### Architecture & Design
{User's Q3.5 answer if provided}

## Out of Scope
{User's Q4 answer - explicit exclusions}

## Additional Context
{User's Q5 answer if provided, or omit section}

---

*Generated with Clavix Planning Mode*
*Generated: {ISO timestamp}*
```

### Quick PRD (AI-Optimized)

Path: `.clavix/outputs/{project}/quick-prd.md`

2-3 paragraphs optimized for AI consumption:

```markdown
# {Project Name} - Quick PRD

{Paragraph 1: Combine problem + goal + must-have features from Q1+Q2}

{Paragraph 2: Technical requirements and constraints from Q3}

{Paragraph 3: Out of scope and additional context from Q4+Q5}
```

---

## File-Saving Protocol

### Step 1: Determine Project Name

- **From user input**: Use project name mentioned during Q&A
- **If not specified**: Derive from problem/goal
- **Confirm with user**: "I'll save this as '{project-name}' - does that work?"

### Step 2: Sanitize Project Name

- Lowercase
- Spaces → hyphens
- Remove special characters
- Example: "Sales Manager Dashboard" → `sales-manager-dashboard`

### Step 3: Create Output Directory

```bash
mkdir -p .clavix/outputs/{sanitized-project-name}
```

**Handle errors**:
- If directory creation fails: Check write permissions
- If `.clavix/` doesn't exist: Create it first

### Step 4: Save Both Files

1. Write `.clavix/outputs/{project}/full-prd.md`
2. Write `.clavix/outputs/{project}/quick-prd.md`

### Step 5: Verify After Write

**CRITICAL**: Use Read to confirm both files exist and have valid content.

If verification fails:
- Retry save once
- If still fails, display content for manual copy

---

## Quality Validation

After generating PRD, validate the Quick PRD for AI consumption:

| Dimension | Check |
|-----------|-------|
| **Clarity** | Can an AI understand exactly what to build? |
| **Structure** | Is information organized logically? |
| **Completeness** | Are requirements specific enough to implement? |

Display quality scores and improvement suggestions if needed.

---

## Mode Boundaries

**This mode DOES:**
- Guide through strategic questions
- Help clarify vague areas
- Generate comprehensive PRD documents
- Check PRD quality for AI consumption
- Create both full and quick versions
- Offer task breakdown generation

**This mode does NOT:**
- Write code for the feature
- Start implementing anything
- Skip the planning questions
- Modify files outside `.clavix/`

---

## Next Steps

After PRD creation, guide user to:

**REQUIRED SUB-SKILL**: Use `clavix-plan` to generate implementation tasks

Do not skip directly to implementation. Follow the skill chain:

```
clavix-prd (you are here)
      │
      ▼ REQUIRED
clavix-plan
      │
      ▼ REQUIRED
clavix-implement
      │
      ▼ REQUIRED (after all tasks)
clavix-verify
```

| If... | Recommend |
|-------|-----------|
| Ready for task breakdown | `/clavix-plan` - Generate tasks.md from PRD (RECOMMENDED) |
| Simple enough to implement directly | `/clavix-implement` (but still verify after) |
| Want to improve a prompt first | `/clavix-improve` |

---

## Troubleshooting

### User Answers Too Vague

**Cause**: User hasn't thought through problem/goal deeply
**Solution**:
- Stop and ask probing questions before proceeding
- "What specific problem does this solve?"
- Don't proceed until both problem AND goal are clear

### User Lists 10+ Features

**Cause**: Unclear priorities or scope creep
**Solution**:
- Help prioritize: "If you could only launch with 3, which would they be?"
- Separate must-have from nice-to-have
- Document extras in "Additional Context"

### User Says "I Don't Know"

**Cause**: Genuine uncertainty or needs exploration
**Solution**:
- For Q1: Ask about what triggered the need
- For Q2: Walk through user journey step-by-step
- For Q4: Suggest common exclusions based on project type
- Consider suggesting `/clavix-start` for conversational exploration first

### Quality Validation Shows Low Scores

**Cause**: Answers were too vague or incomplete
**Solution**:
- Review the generated PRD
- Identify specific gaps
- Ask targeted follow-up questions
- Regenerate PRD with enhanced answers

### Generated PRD Doesn't Match Vision

**Cause**: Miscommunication during Q&A or assumptions made
**Solution**:
- Review each section with user
- Ask "What's missing or inaccurate?"
- Update PRD manually or regenerate with corrected answers