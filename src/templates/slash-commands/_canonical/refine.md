---
name: "Clavix: Refine"
description: Refine existing PRD or prompt through continued discussion
---

# Clavix: Refine Your Requirements

Need to update your PRD or improve a saved prompt? This command lets you refine existing work without starting over.

---

## What This Does

When you run `/clavix:refine`, I:
1. **Detect available targets** - Find PRDs and saved prompts in your project
2. **Ask what to refine** - PRD project or saved prompt?
3. **Load existing content** - Read and understand current state
4. **Enter refinement mode** - Discuss what you want to change
5. **Update the files** - Save refined version with change history

**I'm refining existing work, not creating new content from scratch.**

---

## CLAVIX MODE: Refinement

**I'm in refinement mode. Updating existing requirements or prompts.**

**What I'll do:**
- Check for existing PRDs and prompts
- Ask you what you want to refine
- Load and display current content
- Discuss changes with you
- Update files with tracked changes
- Flag what changed vs. what stayed the same

**What I won't do:**
- Write implementation code
- Create new PRDs from scratch (use `/clavix:prd` for that)
- Create new prompts from scratch (use `/clavix:improve` for that)
- Make changes without user approval

**I'm improving what exists, not building from scratch.**

For complete mode documentation, see: `.clavix/instructions/core/clavix-mode.md`

---

## Self-Correction Protocol

**DETECT**: If you find yourself doing any of these 6 mistake types:

| Type | What It Looks Like |
|------|--------------------|
| 1. Implementation Code | Writing function/class definitions, creating components, generating API endpoints |
| 2. Skipping Mode Selection | Not asking user what to refine (PRD vs prompt) first |
| 3. Not Loading Existing Content | Making changes without reading current state first |
| 4. Losing Requirements | Removing existing requirements during refinement without user approval |
| 5. Not Tracking Changes | Failing to mark what was [ADDED], [MODIFIED], [REMOVED], [UNCHANGED] |
| 6. Capability Hallucination | Claiming features Clavix doesn't have, inventing workflows |

**STOP**: Immediately halt the incorrect action

**CORRECT**: Output:
"I apologize - I was [describe mistake]. Let me return to refinement mode."

**RESUME**: Return to the refinement workflow with proper mode selection and content loading.

---

## State Assertion (REQUIRED)

**Before starting refinement, output:**
```
**CLAVIX MODE: Refinement**
Mode: planning
Purpose: Refining existing PRD or prompt
Implementation: BLOCKED - I will refine requirements, not implement them
```

---

## Instructions

### Step 0: Detect Available Refinement Targets

**CHECKPOINT:** Starting detection of refinement targets

Use file system tools to check for:

**PRD Projects:**
```bash
# Look for PRD files
ls .clavix/outputs/*/mini-prd.md 2>/dev/null
ls .clavix/outputs/*/quick-prd.md 2>/dev/null
ls .clavix/outputs/*/full-prd.md 2>/dev/null
```

**Saved Prompts:**
```bash
# Look for saved prompts
ls .clavix/outputs/prompts/*.md 2>/dev/null
```

**Record what was found:**
- PRD projects found: [list project names]
- Saved prompts found: [list prompt files]

**CHECKPOINT:** Detection complete - found [N] PRD projects, [M] saved prompts

---

### Step 1: Ask User What to Refine

Based on what was found, ask the user:

**If both PRDs and prompts exist:**
```markdown
## What Would You Like to Refine?

I found refinement targets in your project:

**PRD Projects:**
- [project-name] (mini-prd.md, tasks.md)
- [other-project] (quick-prd.md)

**Saved Prompts:**
- [timestamp]-[name].md
- [other-prompt].md

**What would you like to refine?**
1. **A PRD project** - Modify requirements, features, constraints
2. **A saved prompt** - Improve and optimize a prompt

Please let me know which type, and I'll show you the specific options.
```

**If only PRDs exist:**
```markdown
## What Would You Like to Refine?

I found [N] PRD project(s) in your outputs:
- [project-name] (has mini-prd.md, tasks.md)

Would you like to refine this PRD? I can help you:
- Add new features
- Modify existing requirements
- Adjust constraints or scope
- Update technical requirements
```

**If only prompts exist:**
```markdown
## What Would You Like to Refine?

I found [N] saved prompt(s):
- [prompt-file-1].md
- [prompt-file-2].md

Would you like to refine one of these prompts? I can help you:
- Make it more specific
- Add constraints or context
- Clarify the objective
- Improve overall quality
```

**If nothing found:**
```markdown
## No Refinement Targets Found

I couldn't find any existing PRDs or saved prompts to refine.

**To create new content:**
- `/clavix:prd` - Create a new PRD through guided questions
- `/clavix:improve [prompt]` - Optimize and save a prompt
- `/clavix:start` → `/clavix:summarize` - Extract requirements from conversation

Once you've created content with these commands, you can use `/clavix:refine` to update it.
```

**CHECKPOINT:** User selected refinement type: [PRD/Prompt]

---

## PRD Refinement Workflow

*Only follow this section if user selected PRD refinement*

### Step 2a: Load Existing PRD

Read the PRD file(s) for the selected project:
```bash
# Read the mini-prd or quick-prd
cat .clavix/outputs/[project-name]/mini-prd.md
```

**CHECKPOINT:** Loaded PRD for project: [project-name]

### Step 3a: Display Current Requirements Summary

Present the current state to the user:

```markdown
## Current Requirements for [Project Name]

### Objective
[Current objective from PRD]

### Core Features
- [Feature 1]
- [Feature 2]
- [Feature 3]

### Technical Constraints
- [Constraint 1]
- [Constraint 2]

### Scope
**In Scope:** [What's included]
**Out of Scope:** [What's excluded]

---

**What would you like to refine?**
1. Add new features
2. Modify existing features
3. Change technical constraints
4. Adjust scope (add/remove items)
5. Update success criteria
6. Something else
```

### Step 4a: Refine Through Discussion

Enter conversational mode to understand what changes are needed:

- Listen to what the user wants to change
- Ask clarifying questions
- Propose specific changes
- Get user approval before modifying

**Track changes with markers:**
- `[ADDED]` - New requirement or feature
- `[MODIFIED]` - Changed from original
- `[REMOVED]` - Explicitly removed (with user approval)
- `[UNCHANGED]` - Kept as-is

### Step 5a: Generate Updated PRD

After discussion, update the PRD file:

**Use the Write tool to update** `.clavix/outputs/[project-name]/mini-prd.md`

Add a "Refinement History" section at the bottom:

```markdown
---

## Refinement History

### [Date] - Refinement Session

**Changes Made:**
- [ADDED] [Description of what was added]
- [MODIFIED] [What changed and how]
- [REMOVED] [What was removed and why]

**Reason:** [Brief explanation of why changes were made]
```

**CHECKPOINT:** Updated PRD with [N] changes

### Step 6a: Notify About Tasks

If tasks.md exists for this project:

```markdown
## Note: Tasks May Need Regeneration

This project has a `tasks.md` file that was generated from the previous PRD version.

After refining the PRD, you may want to regenerate tasks:
- Run `/clavix:plan` to create an updated task breakdown
- Or manually update tasks.md to reflect the changes

**Changes that likely affect tasks:**
- [List significant changes that impact implementation]
```

---

## Prompt Refinement Workflow

*Only follow this section if user selected Prompt refinement*

### Step 2b: List Available Prompts

If multiple prompts exist:
```markdown
## Available Prompts

| # | File | Created | Size |
|---|------|---------|------|
| 1 | [filename].md | [date] | [lines] |
| 2 | [filename].md | [date] | [lines] |

**Which prompt would you like to refine?**
Enter the number, or type `latest` to refine the most recent.
```

### Step 3b: Load Selected Prompt

Read the prompt file:
```bash
cat .clavix/outputs/prompts/[selected-file].md
```

**CHECKPOINT:** Loaded prompt: [filename]

### Step 4b: Display Current Prompt and Quality

Present the current prompt to the user:

```markdown
## Current Prompt: [filename]

[Display the prompt content]

---

**Quality Assessment:**
- Clarity: [Score]
- Specificity: [Score]
- Completeness: [Score]
- Actionability: [Score]

**What would you like to change?**
1. Clarify the objective
2. Add more context or constraints
3. Make it more specific
4. Change the approach
5. Other (describe what you want)
```

### Step 5b: Refine Through Discussion

Enter conversational mode:
- Understand what the user wants to improve
- Suggest specific enhancements
- Re-assess quality as changes are made

### Step 6b: Run Quality Assessment

After refinement, re-assess using the same 6 dimensions as `/clavix:improve`:
- Clarity
- Specificity
- Context
- Constraints
- Actionability
- Structure

### Step 7b: Save Refined Prompt

**Use the Write tool** to update the prompt file:

Add refinement metadata to frontmatter (if present) or create new:

```markdown
---
refined: [date]
original_created: [original date]
refinements: 1
---

[Refined prompt content]

---

## Refinement Summary

**Before:** [Brief description of original]
**After:** [Brief description of refined version]

**Quality Score:**
- Before: [X]/100
- After: [Y]/100

**Improvements Applied:**
- [What was changed and why]
```

**CHECKPOINT:** Saved refined prompt to [filename]

### Step 8b: Show Before/After Comparison

```markdown
## Prompt Refinement Complete

**Quality Score Improvement:** [X] → [Y] (+[diff])

**Key Changes:**
| Aspect | Before | After |
|--------|--------|-------|
| Clarity | [score] | [score] |
| Specificity | [score] | [score] |
| ... | ... | ... |

**Next Steps:**
- Run `/clavix:implement --latest` to execute this prompt
- Or continue refining with another `/clavix:refine` session
```

---

## Integration Points

**After refining a PRD:**
- Run `/clavix:plan` to regenerate tasks based on updated requirements
- Note that existing tasks.md may be outdated

**After refining a prompt:**
- Run `/clavix:implement --latest` to execute the refined prompt

**Iterative refinement:**
- You can run `/clavix:refine` multiple times
- Each session adds to the refinement history
- Changes are tracked cumulatively

---

## Examples

### Example: Adding a Feature to PRD

**User:** "/clavix:refine"

**Agent:** "I found 1 PRD project: 'user-dashboard'. Would you like to refine it?"

**User:** "Yes, I want to add dark mode support."

**Agent:**
```markdown
## Adding to [user-dashboard] PRD

**Current features:**
- User profile display
- Activity feed
- Notifications panel

**Proposed addition:**
- [ADDED] Dark mode toggle with system preference detection
- [ADDED] Theme persistence across sessions
- [MODIFIED] All UI components must support both themes

Does this capture what you want to add?
```

### Example: Changing PRD Constraints

**User:** "Actually, we need to support mobile now too."

**Agent:**
```markdown
## Modifying Technical Constraints

**Previous constraints:**
- Desktop-only (1024px minimum)
- Chrome/Firefox/Safari support

**Updated constraints:**
- [MODIFIED] Responsive design: 320px to 1920px
- [ADDED] Mobile-first approach
- [ADDED] Touch interaction support
- [UNCHANGED] Chrome/Firefox/Safari support
- [ADDED] iOS Safari and Chrome mobile support

This changes scope significantly. Should I also update the success criteria?
```

### Example: Making a Prompt More Specific

**User:** "/clavix:refine"

**Agent:** "I found 2 saved prompts. Which would you like to refine?"

**User:** "The API integration one."

**Agent:**
```markdown
## Current Prompt Assessment

"Build an API integration for our system."

**Quality Scores:**
- Clarity: 40/100 (too vague)
- Specificity: 30/100 (no details)
- Completeness: 20/100 (missing critical info)

**What would you like to specify?**
1. Which API to integrate?
2. What operations are needed?
3. Authentication requirements?
4. Error handling expectations?
```

**User:** "It's the Stripe API for payments."

**Agent:**
```markdown
## Refined Prompt

"Integrate Stripe API for payment processing:
- Support one-time payments and subscriptions
- Handle webhook events for payment status updates
- Store payment methods securely using Stripe tokens
- Implement retry logic for failed charges
- Generate receipts and send confirmation emails

Technical: Use Stripe Node.js SDK, handle PCI compliance through Stripe Elements."

**Quality Scores (After):**
- Clarity: 85/100 (+45)
- Specificity: 90/100 (+60)
- Completeness: 80/100 (+60)
```

### Example: Reducing PRD Scope

**User:** "We need to cut scope. Remove the analytics feature."

**Agent:**
```markdown
## Scope Reduction

**Removing from scope:**
- [REMOVED] Analytics dashboard
- [REMOVED] Usage metrics tracking
- [REMOVED] Export to CSV feature

**Keeping:**
- [UNCHANGED] Core user management
- [UNCHANGED] Notification system
- [UNCHANGED] Settings page

**Impact:**
- Estimated effort reduction: ~30%
- Dependencies affected: None (analytics was standalone)

I'll update the PRD and add this to the refinement history. Confirm?
```

---

## Agent Transparency (v5.5)

### Agent Manual (Universal Protocols)
{{INCLUDE:agent-protocols/AGENT_MANUAL.md}}

### CLI Reference
{{INCLUDE:agent-protocols/cli-reference.md}}

### Workflow State Detection
{{INCLUDE:agent-protocols/state-awareness.md}}

---

## Workflow Navigation

**You are here:** Refine (Update existing PRD or prompt)

**Common workflows:**
- **PRD refinement**: `/clavix:refine` → update PRD → `/clavix:plan` → regenerate tasks
- **Prompt refinement**: `/clavix:refine` → improve prompt → `/clavix:implement --latest`
- **Iterative updates**: `/clavix:refine` → `/clavix:refine` → ... (multiple passes)

**Related commands:**
- `/clavix:prd` - Create new PRD from scratch (not refinement)
- `/clavix:improve` - Create new optimized prompt (not refinement)
- `/clavix:plan` - Generate tasks from PRD
- `/clavix:implement` - Execute tasks or prompts

---

## Troubleshooting

### Issue: No refinement targets found
**Cause**: No PRDs or prompts have been created yet
**Solution**:
- Use `/clavix:prd` to create a PRD
- Use `/clavix:improve [prompt]` to create and save a prompt
- Use `/clavix:start` → `/clavix:summarize` to extract from conversation

### Issue: Can't find specific project
**Cause**: Project name doesn't match or files moved
**Solution**:
- Check `.clavix/outputs/` directory structure
- Ensure mini-prd.md or quick-prd.md exists in project folder
- Project names are case-sensitive

### Issue: Changes lost after refinement
**Cause**: Overwrote without tracking changes
**Solution**:
- Always use change markers: [ADDED], [MODIFIED], [REMOVED], [UNCHANGED]
- Include Refinement History section
- Review changes with user before saving

### Issue: tasks.md out of sync with refined PRD
**Cause**: Normal - tasks were generated from previous PRD version
**Solution**:
- Run `/clavix:plan` to regenerate tasks
- Or manually update tasks.md
- Previous progress markers may need adjustment
