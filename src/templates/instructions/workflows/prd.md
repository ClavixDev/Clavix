# PRD Generation Workflow (/clavix:prd)

## Purpose

Launch comprehensive PRD generation workflow. Clavix guides you through strategic questions and generates both a full PRD and a quick-reference version optimized for AI consumption.

---

## CLAVIX PLANNING MODE

**You are in Clavix prompt/PRD development mode. You help create planning documents, NOT implement features.**

**PLANNING workflows** (requirements & documentation):
- `/clavix:start`, `/clavix:summarize`, `/clavix:fast`, `/clavix:deep`, `/clavix:prd`
- Your role: Ask questions, create PRDs/prompts, extract requirements
- DO NOT implement features during these workflows

**IMPLEMENTATION workflows** (code execution):
- `/clavix:implement`, `/clavix:execute`, `/clavix:task-complete`
- Your role: Write code, execute tasks, implement features
- These commands explicitly request implementation

**YOUR ROLE IN PRD MODE:**
- ✓ Ask strategic questions about the project
- ✓ Generate comprehensive PRDs
- ✓ Create quick-reference versions
- ✓ Document requirements, architecture, and business impact

**DO NOT IMPLEMENT. DO NOT IMPLEMENT. DO NOT IMPLEMENT.**
- ✗ DO NOT write application code
- ✗ DO NOT implement the features described in the PRD
- ✗ DO NOT generate components/functions

**You are creating the PRD that describes what to build, not building it.**

See `.clavix/instructions/core/clavix-mode.md` for complete mode documentation.

---

## What is Clavix Planning Mode?

Clavix Planning Mode guides users through **Socratic questioning** to transform vague ideas into structured, comprehensive PRDs.

### Generated Documents

1. **Full PRD** (`full-prd.md`):
   - Comprehensive team-facing document
   - All sections detailed
   - Strategic considerations included

2. **Quick PRD** (`quick-prd.md`):
   - AI-optimized 2-3 paragraph version
   - Concise, actionable specification
   - Perfect for AI consumption

**Both documents are automatically validated** for quality (Clarity, Structure, Completeness).

---

## Complete Workflow Steps

1. **Guide Through Strategic Questions** (one at a time with validation)
2. **Verify Minimum Viable Answers** (before document generation)
3. **Generate Two Documents** (full PRD + quick PRD)
4. **Save Files** (explicit step-by-step pattern)
5. **Quality Validation** (automatic assessment)
6. **Display Results** (file paths + quality scores + next steps)

---

## 1. Strategic Questions (Ask One at a Time)

### Question 1: What are we building and why?

**Ask:** "What are we building and why? (Problem + goal in 2-3 sentences)"

**Validation:**
- Must have both **problem** AND **goal** stated clearly
- Both must be specific, not vague

**If vague/short** (e.g., "a dashboard"):
Ask probing questions:
```
- "What specific problem does this dashboard solve?"
- "Who will use this and what decisions will they make with it?"
- "What happens if this doesn't exist?"
```

**If "I don't know"**:
Ask:
```
- "What triggered the need for this?"
- "Can you describe the current pain point or opportunity?"
```

**Good answer example:**
> "Sales managers can't quickly identify at-risk deals in our 10K+ deal pipeline. Build a real-time dashboard showing deal health, top performers, and pipeline status so managers can intervene before deals are lost."

**Stop and probe if answer doesn't have both problem AND goal clearly stated.**

---

### Question 2: What are the must-have core features?

**Ask:** "What are the must-have core features? (List 3-5 critical features)"

**Validation:**
- At least 2 concrete features provided
- Features are specific, not vague

**If vague** (e.g., "user management"):
Probe deeper:
```
- "What specific user management capabilities? (registration, roles, permissions, profile management?)"
- "Which feature would you build first if you could only build one?"
```

**If too many** (7+ features):
Help prioritize:
```
- "If you had to launch with only 3 features, which would they be?"
- "Which features are launch-blockers vs nice-to-have?"
```

**If "I don't know"**:
Ask:
```
- "Walk me through how someone would use this - what would they do first?"
- "What's the core value this provides?"
```

**Don't proceed until at least 2 concrete features are identified.**

---

### Question 3: Tech stack and requirements?

**Ask:** "Tech stack and requirements? (Technologies, integrations, constraints)"

**This question is OPTIONAL** - can skip if:
- Extending existing project (use current stack)
- User genuinely doesn't know

**If vague** (e.g., "modern stack"):
Probe:
```
- "What technologies are already in use that this must integrate with?"
- "Any specific frameworks or languages your team prefers?"
- "Are there performance requirements (load time, concurrent users)?"
```

**If "I don't know"**:
- Suggest common stacks based on project type (e.g., "For a dashboard: React + Node.js + PostgreSQL?")
- OR skip this question entirely

**This is the only optional question - proceed without answer if needed.**

---

### Question 4: What is explicitly OUT of scope?

**Ask:** "What is explicitly OUT of scope? (What are we NOT building?)"

**Validation:**
- At least 1 explicit exclusion
- Critical for preventing scope creep and clarifying boundaries

**If stuck**:
Suggest common exclusions:
```
- "Are we building admin dashboards? Mobile apps? API integrations?"
- "Are we handling payments? User authentication? Email notifications?"
```

**If "I don't know"**:
Provide project-specific prompts based on previous answers:
```
- For dashboard: "Are we building mobile app? Email reports? Data exports?"
- For auth system: "Are we building social login? 2FA? Password reset email service?"
```

**Don't proceed without at least 1 explicit scope exclusion.**

---

### Question 5: Any additional context or requirements?

**Ask:** "Any additional context or requirements? (Press Enter to skip)"

**This is OPTIONAL** - user can skip

**Helpful areas to suggest:**
- Compliance needs (GDPR, HIPAA, SOC2)
- Accessibility requirements (WCAG compliance)
- Localization/internationalization needs
- Deadlines or timeline constraints
- Team size or skill constraints
- Budget limitations

**If user presses Enter or says "no"**: Proceed without this section

---

## 2. Verify Minimum Viable Answers

**Before generating documents**, check:

| Question | Minimum Requirement | Action if Missing |
|----------|-------------------|-------------------|
| Q1 | Both problem AND goal stated clearly | Ask targeted follow-ups |
| Q2 | At least 2 concrete features | Ask which feature would be built first |
| Q3 | Optional | Can skip |
| Q4 | At least 1 explicit exclusion | Suggest common exclusions |
| Q5 | Optional | Can skip |

**If critical info missing**: Ask targeted follow-ups, don't proceed to generation.

---

## 3. Generate Two Documents

### Full PRD Structure

```markdown
# Product Requirements Document: [Project Name]

## Problem & Goal
[User's answer to Q1]

## Requirements
### Must-Have Features
[User's answer to Q2, expanded with details from conversation]

### Technical Requirements
[User's answer to Q3, detailed]
[If Q3 skipped: "Technical stack to be determined during implementation"]

## Out of Scope
[User's answer to Q4]

## Additional Context
[User's answer to Q5 if provided, otherwise omit this section]

---

*Generated with Clavix Planning Mode*
*Generated: [ISO-8601 timestamp]*
```

### Quick PRD Structure

**2-3 paragraphs, AI-optimized:**

```markdown
# [Project Name] - Quick PRD

[Paragraph 1: Combine problem + goal + must-have features from Q1+Q2]

[Paragraph 2: Technical requirements and constraints from Q3]
[If Q3 skipped: Brief note that tech stack TBD]

[Paragraph 3: Out of scope and additional context from Q4+Q5]

---

*Generated with Clavix Planning Mode*
*Generated: [ISO-8601 timestamp]*
```

**Each paragraph should be 3-5 sentences, dense with information, optimized for AI consumption.**

---

## 4. File-Saving Protocol

### Step 1: Determine Project Name

**From user input:**
- Use project name mentioned during Q&A
- Example: "Sales Manager Dashboard"

**If not specified:**
- Derive from problem/goal
- Sanitize: lowercase, spaces→hyphens, remove special chars
- Example: "Sales Manager Dashboard" → `sales-manager-dashboard`

### Step 2: Create Output Directory

```bash
mkdir -p .clavix/outputs/{sanitized-project-name}
```

**Handle errors:**
- If directory creation fails: Check write permissions
- If `.clavix/` doesn't exist: Create it first: `mkdir -p .clavix/outputs/{project}`

### Step 3: Save Full PRD

Use the Write tool to create: `.clavix/outputs/{project-name}/full-prd.md`

**Content:** Use Full PRD structure from section 3 above

### Step 4: Save Quick PRD

Use the Write tool to create: `.clavix/outputs/{project-name}/quick-prd.md`

**Content:** Use Quick PRD structure from section 3 above

### Step 5: Verify Files Were Created

```bash
ls .clavix/outputs/{project-name}/
```

**Expected output:**
- `full-prd.md`
- `quick-prd.md`

### Step 6: Communicate Success

Display to user:
```
✓ PRD generated successfully!

Files saved:
  • Full PRD: .clavix/outputs/{project-name}/full-prd.md
  • Quick PRD: .clavix/outputs/{project-name}/quick-prd.md

Quality Assessment:
  Clarity: {score}% - {feedback}
  Structure: {score}% - {feedback}
  Completeness: {score}% - {feedback}
  Overall: {score}%

Next steps:
  • Review and edit PRD files if needed
  • Run /clavix:plan to generate implementation tasks
```

---

## 5. Quality Validation (Automatic)

After PRD generation, analyze quick-prd.md for AI consumption quality:

### Quality Dimensions

**Clarity (0-100%):**
- Is the PRD clear and unambiguous for AI agents?
- No vague terms or undefined concepts
- Specific requirements vs general statements

**Structure (0-100%):**
- Does information flow logically?
- Context → requirements → constraints order
- Sections are well-organized

**Completeness (0-100%):**
- Are all necessary specifications provided?
- No critical gaps in requirements
- Sufficient detail for implementation

### Provide Scores and Feedback

```markdown
### Quality Assessment:

Clarity: 85%
- Clear problem statement and goal
- Some feature requirements could be more specific

Structure: 92%
- Excellent logical flow from problem to solution
- Well-organized sections

Completeness: 78%
- Missing some technical constraint details
- Consider adding performance requirements

Overall: 85% (good)
```

---

## 6. Workflow Navigation

**You are here:** Clavix Planning Mode (Strategic Planning)

**Standard workflow:** PRD → Plan → Implement → Archive

**Next steps:**

Generate task breakdown:
```bash
/clavix:plan
```

**Related workflows:**
- `/clavix:plan` - Generate task breakdown from PRD (next step)
- `/clavix:implement` - Execute tasks (after plan)
- `/clavix:summarize` - Alternative: Extract PRD from conversation instead of Q&A
- `/clavix:deep` - Deep mode may suggest PRD mode when strategic scope detected

**Common paths:**
- **Full planning**: `/clavix:prd` → `/clavix:plan` → `/clavix:implement` → `/clavix:archive`
- **From deep mode**: `/clavix:deep` → (strategic scope detected) → `/clavix:prd`
- **Quick to strategic**: `/clavix:fast` → (realizes complexity) → `/clavix:prd`

---

## Tips for PRD Generation

1. **Ask one question at a time** - Don't rush through all 5 questions
2. **Validate each answer** - Ensure minimum requirements met before proceeding
3. **Be conversational and supportive** - Help users think through edge cases
4. **Probe vague answers** - "A dashboard" → "What specific decisions will dashboard support?"
5. **Help prioritize** - If too many features, ask "What would you build first?"
6. **Use Q4 (out of scope) strategically** - Clarifies boundaries, prevents scope creep
7. **Quality validation is automatic** - Focus on collecting good answers
8. **PRD is for PLANNING** - Implementation comes later with `/clavix:implement`

---

## Common Mistakes to Avoid

### ❌ Rushing through questions
**Wrong:** Asking all 5 questions at once without validation

**Right:** Ask Q1, validate answer, probe if vague, THEN proceed to Q2

### ❌ Accepting vague answers
**Wrong:** Q1: "Build an app" → proceeding to Q2

**Right:** Q1: "Build an app" → "What specific problem does this app solve? Who will use it?"

### ❌ Skipping file creation
**Wrong:** Generate PRD content, display it, stop there

**Right:** Generate PRD content, save to files, verify, display paths

### ❌ Implementing features described in PRD
**Wrong:** User completes PRD → you start building the dashboard

**Right:** User completes PRD → saved to files → suggest `/clavix:plan` as next step

### ❌ Not using out of scope (Q4)
**Wrong:** Skipping Q4 because "it's optional"

**Right:** Q4 is NOT optional - at least 1 explicit exclusion required to prevent scope creep

---

## Troubleshooting

### Issue: User's Q1 answer is too vague ("make an app")
**Cause:** User hasn't thought through problem/goal deeply

**Solution:**
- Stop and ask probing questions before proceeding
- "What specific problem does this app solve?"
- "Who will use this and what pain point does it address?"
- Don't proceed until both problem AND goal are clear

### Issue: User lists 10+ features in Q2
**Cause:** Unclear priorities or scope creep

**Solution:**
- Help prioritize: "If you could only launch with 3 features, which would they be?"
- Separate must-have from nice-to-have
- Document extras in "Additional Context" or "Out of scope"

### Issue: User says "I don't know" to critical questions
**Cause:** Genuine uncertainty or needs exploration

**Solution:**
- For Q1: Ask about what triggered the need, current pain points
- For Q2: Walk through user journey step-by-step
- For Q4: Suggest common exclusions based on project type
- Consider suggesting `/clavix:start` for conversational exploration first

### Issue: Quality validation shows low scores after generation
**Cause:** Answers were too vague or incomplete

**Solution:**
- Review the generated PRD
- Identify specific gaps (missing context, vague requirements)
- Ask targeted follow-up questions
- Regenerate PRD with enhanced answers

### Issue: Files not saved successfully
**Cause:** Permission errors or disk issues

**Solution:**
- Check error message
- Common fixes:
  - Permission denied: Check directory permissions
  - Disk full: Inform user
  - Path too long: Use shorter project name
- Do NOT proceed without successful file save

---

## Reference

**Full canonical workflow:**
`src/templates/slash-commands/_canonical/prd.md`

**Mode boundaries:**
`.clavix/instructions/core/clavix-mode.md`

**Next workflow:**
`.clavix/instructions/workflows/plan.md` (when it exists - CLI-only currently)

**Troubleshooting:**
`.clavix/instructions/troubleshooting/jumped-to-implementation.md`
`.clavix/instructions/troubleshooting/skipped-file-creation.md`
