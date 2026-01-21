---
name: clavix-refine
description: Update existing PRDs or prompts without starting from scratch
license: MIT
---

# Clavix Refine Skill

Update your PRD or improve a saved prompt. We're refining what exists, not starting over.

## What This Skill Does

1. **Find what you've got** - Look for your PRDs and saved prompts
2. **Ask what to update** - Which one do you want to refine?
3. **Load it up** - Read what's there now
4. **Talk through changes** - What do you want to add, change, or remove?
5. **Save the update** - Keep track of what changed

---

## State Assertion (REQUIRED)

**Before starting refinement, output:**

```
**CLAVIX MODE: Refinement**
Mode: planning
Purpose: Updating existing PRD or prompt
Implementation: BLOCKED - I'll update requirements, not build them
```

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
"I apologize - I was [describe mistake]. Let me get back to refining your existing work."

**RESUME**: Return to refinement mode - load content and discuss changes.

---

## Step 1: Source Discovery

Check what's available to refine:

**Looking for PRDs:**
- `.clavix/outputs/*/mini-prd.md`
- `.clavix/outputs/*/quick-prd.md`
- `.clavix/outputs/*/full-prd.md`

**Looking for saved prompts:**
- `.clavix/outputs/prompts/*.md`

**What you'll see:**

```
Found 2 PRD projects and 3 saved prompts.
Which would you like to refine?
```

List what's found with project names and file types.

---

## Step 2: Interactive Selection

**If you have both PRDs and prompts:**

> "I found some things you can refine:
>
> **PRD Projects:**
> - user-auth (has PRD and tasks)
> - dashboard (has PRD)
>
> **Saved Prompts:**
> - api-integration.md
> - payment-flow.md
>
> Which one do you want to update?"

**If you only have PRDs:**

> "Found your user-auth PRD. Want to update it?
>
> I can help you:
> - Add new features
> - Change existing requirements
> - Adjust scope or constraints
> - Update tech requirements"

**If you only have prompts:**

> "Found 2 saved prompts:
> - api-integration.md (Dec 1)
> - payment-flow.md (Nov 28)
>
> Which one should we improve?"

**If nothing exists:**

> "I don't see any PRDs or saved prompts to refine yet.
>
> To create something first:
> - `/clavix:prd` - Create a new PRD
> - `/clavix:improve [prompt]` - Save an optimized prompt
> - `/clavix:start` then `/clavix:summarize` - Extract from chat
>
> Once you've got something, come back and we can refine it!"

---

## PRD Refinement Flow

### Step 3: Show Current Content

Read and summarize the current PRD:

> "Here's your user-auth PRD:
>
> **Goal:** Build secure user authentication system
>
> **Features:**
> - User registration
> - Login/logout
> - Session management
>
> **Tech:** Node.js, JWT tokens, PostgreSQL
>
> **Out of Scope:** Social login, 2FA
>
> ---
>
> What do you want to change?"

### Step 4: Ask What to Change

Options to present:
- Add new features?
- Change existing requirements?
- Update tech requirements?
- Adjust scope?

### Step 5: Track All Changes

Use change markers for everything:
- `[ADDED]` - New stuff
- `[MODIFIED]` - Changed stuff
- `[REMOVED]` - Removed stuff
- `[UNCHANGED]` - Kept as-is

### Step 6: Save with Refinement History

Add a history section to the document:

```markdown
## Refinement History

### {Date}
**Changes:**
- [ADDED] Password reset via email
- [MODIFIED] Now using bcrypt instead of plain JWT
- [REMOVED] Session management (moved to separate feature)

**Why:** User feedback needed password reset, security upgrade
```

---

## Tasks Impact Warning (CRITICAL)

**If `tasks.md` exists AND PRD changed significantly:**

> "⚠️ **Your tasks.md was made from the old PRD.**
>
> After these changes, you might want to:
> - Run `/clavix:plan` to regenerate tasks
> - Or manually update tasks.md
>
> **Biggest changes that affect tasks:**
> - New password reset feature
> - Different auth approach
> - Removed session management"

**Always list the changes that would affect existing tasks.**

---

## Prompt Refinement Flow

### Step 3: Pick Which Prompt

If multiple saved prompts exist:

> "Which prompt do you want to refine?
> 1. api-integration.md (Dec 1)
> 2. payment-flow.md (Nov 28)
>
> Pick a number or say 'latest' for the most recent."

### Step 4: Show Current Quality

Display prompt with quality scores:

> "Here's your current prompt:
>
> 'Build an API integration for our system.'
>
> **Quality scores:**
> - Clarity: 40/100 (too vague)
> - Specificity: 30/100 (no details)
> - Completeness: 20/100 (missing info)
>
> What do you want to improve?
> - Make it more specific?
> - Add context or constraints?
> - Clarify the goal?
> - Something else?"

### Step 5: Apply Quality Patterns & Show Comparison

Enhance using quality patterns, then show before/after:

| Dimension | Before | After | Change |
|-----------|--------|-------|--------|
| Clarity | 40% | 85% | +45% |
| Specificity | 30% | 90% | +60% |
| Completeness | 20% | 80% | +60% |

---

## Save + Verify Protocol

1. Write file to save location
2. Read file to verify exists
3. Show user actual saved path

**Save Locations:**
- PRDs: `.clavix/outputs/{project}/full-prd.md`
- Prompts: `.clavix/outputs/prompts/<id>.md`

---

## Mode Boundaries

**Do:** Find existing docs, ask which to update, show current state, track changes, add history, warn about task impact

**Don't:** Write code, create new PRDs/prompts, remove requirements without approval

---

## Workflow Navigation

**Common flows:**
- Update PRD → `/clavix:refine` → `/clavix:plan`
- Improve prompt → `/clavix:refine` → `/clavix:implement --latest`

**Related:** `/clavix:prd`, `/clavix:improve`, `/clavix:plan`, `/clavix:implement`
