---
name: clavix-verify
description: Spec-driven technical audit against requirements and implementation plan
license: MIT
---

# Clavix Verify Skill

Perform a **Spec-Driven Technical Audit** of your implementation. I don't just "run tests"—I verify that your code matches the **Plan** (`tasks.md`) and the **Requirements** (`full-prd.md`).

## What This Skill Does

1. **Load the Spec** - Read `full-prd.md` and `tasks.md` to understand requirements and design
2. **Read the Code** - Inspect actual source files for completed tasks
3. **Compare & Analyze** - Check implementation accuracy, requirements coverage, code quality
4. **Generate Review Comments** - Output structured issues (Critical, Major, Minor)

---

## State Assertion (REQUIRED)

**Before starting verification, output:**

```
**CLAVIX MODE: Verification**
Mode: verification
Purpose: Spec-driven technical audit against requirements and implementation plan
Implementation: BLOCKED - I'll analyze and report, not modify or fix
```

---

## Self-Correction Protocol

**DETECT**: If you find yourself doing any of these 4 mistake types:

| Type | What It Looks Like |
|------|--------------------|
| 1. Skipping Source Analysis | "Looks good!" without reading `src/...` files |
| 2. Ignoring the Plan | Verifying without checking Implementation notes in `tasks.md` |
| 3. Vague Reporting | "Some things need fixing" instead of specific issues |
| 4. Hallucinating Checks | Claiming to run tests that don't exist |

**STOP**: Halt immediately.

**CORRECT**: "I need to perform a proper audit. Let me read the relevant source files and compare them against the plan."

**RESUME**: Return to verification mode - read files, compare against spec.

---

## Source of Truth Definition

| Document | Purpose |
|----------|---------|
| `tasks.md` | Architecture source of truth (HOW to build) |
| `full-prd.md` | Behavior source of truth (WHAT to build) |

---

## Phase 1: Scope & Context

### Step 1: Identify Completed Work

Read `.clavix/outputs/{project}/tasks.md`:
- Look for checked `[x]` items in the current phase
- Note which tasks claim to be complete

### Step 2: Load Requirements

Read `.clavix/outputs/{project}/full-prd.md`:
- Extract P0/P1/P2 requirements
- Note expected behaviors and constraints

### Step 3: Load Code

Read files referenced in "Implementation" notes of completed tasks:
- Find actual source files
- Check what was built

---

## Phase 2: The Audit (Gap Analysis)

Perform a gap analysis across three dimensions:

### Plan vs Code

Did they use the library/pattern specified?

**Check for:**
- Specified library vs actual import
- Planned architecture vs implementation
- Design patterns followed

> Example issue: "Used `fetch` but Plan said `apiClient` singleton"

### PRD vs Code

Is the business logic present?

**Check for:**
- Required features implemented
- Edge cases handled
- Validation rules applied

> Example issue: "Forgot Password" link missing (PRD 3.1)

### Code vs Standards

Are there quality issues?

**Check for:**
- Hardcoded secrets
- `any` types in TypeScript
- Console logs in production code
- Missing error handling

---

## Phase 3: Review Board Output

**Output this exact format:**

```markdown
# Verification Report: [Phase Name / Feature]

**Spec**: `tasks.md` (Phase X) | **Status**: [Pass/Fail/Warnings]

## 🔍 Review Comments

| ID | Severity | Location | Issue |
|:--:|:--------:|:---------|:------|
| #1 | 🔴 CRIT | `src/auth.ts` | **Architecture Violation**: Direct `axios` call used. Plan specified `apiClient` singleton. |
| #2 | 🟠 MAJOR | `src/Login.tsx` | **Missing Req**: "Forgot Password" link missing (PRD 3.1). |
| #3 | 🟡 MINOR | `src/utils.ts` | **Hardcoded**: String "Welcome" should be in i18n/constants. |

## 🛠️ Recommended Actions

- **Option A**: `Fix all critical` (Recommended)
- **Option B**: `Fix #1 and #2`
- **Option C**: `Mark #1 as outdated` (If you changed your mind about the architecture)
```

---

## Severity Categories

| Severity | Symbol | When to Use |
|----------|--------|-------------|
| 🔴 CRITICAL | CRIT | Architectural violation, security risk, feature broken/missing |
| 🟠 MAJOR | MAJOR | Logic error, missing edge case, PRD deviation |
| 🟡 MINOR | MINOR | Code style, naming, minor optimization |
| ⚪ OUTDATED | OUTDATED | Code is correct but Plan/PRD was wrong |

### Severity Examples

**🔴 CRITICAL:**
- Security: API key hardcoded in source
- Architecture: Direct DB calls instead of service layer
- Feature: Core functionality completely missing

**🟠 MAJOR:**
- Logic: Validation rule not enforced
- Edge case: Error state not handled
- PRD: Required field missing from form

**🟡 MINOR:**
- Style: Inconsistent naming convention
- Optimization: Could use more efficient approach
- Docs: Missing JSDoc on public function

**⚪ OUTDATED:**
- Plan said "use Redux" but team decided on Zustand
- PRD required feature that was descoped

---

## Fixing Workflow (Optional Loop)

When user says "Fix #1" or "Fix all critical":

### Step 1: Acknowledge

> "Fixing Review Comment #1..."

### Step 2: Implement

Modify the code to resolve the specific issue.

### Step 3: Re-Verify

Run a focused verification on just that file/issue:

> "Re-verified `src/auth.ts`:
> - ✅ #1 now uses `apiClient` singleton
> - Issue resolved"

---

## Save Location

Verification report saves to:
```
.clavix/outputs/{project}/verification-report.md
```

---

## Mode Boundaries

**Do:**
- ✓ Treat `tasks.md` as architecture source of truth
- ✓ Treat `full-prd.md` as behavior source of truth
- ✓ Read source code line-by-line
- ✓ Generate specific, actionable Review Comments

**Don't:**
- ✗ Assume "it works" because a test passed
- ✗ Ignore the architectural plan
- ✗ Fix issues automatically (until user says "Fix #X")
- ✗ Generate vague findings

---

## Verification Checklist

For each completed task, check:

- [ ] **Implementation exists** - Code files present
- [ ] **Matches plan** - Uses specified patterns/libraries
- [ ] **Meets requirements** - PRD behaviors implemented
- [ ] **Quality standards** - No hardcoded values, proper typing

---

## Code Search Strategy

To verify implementation:

1. **Search for file names** - Find implementation files
2. **Grep for key terms** - Locate requirement-related code
3. **Check test files** - Verify test coverage exists
4. **Review API endpoints** - Match against PRD specs

---

## Tips for the Agent

- **Be Strict**: You are the gatekeeper of quality. Better to flag an issue now than let technical debt slide.
- **Be Specific**: Never say "fix the code". Say "Import `apiClient` from `@/utils/api` and replace line 42."
- **Trust the Code**: If the code says `console.log`, and the plan says "No logs", that is a defect.
- **Reference Lines**: Always include file paths and line numbers when possible.

---

## Example Full Report

```markdown
# Verification Report: User Authentication (Phase 1)

**Spec**: `tasks.md` (Phase 1) | **Status**: Fail (2 critical)

## 🔍 Review Comments

| ID | Severity | Location | Issue |
|:--:|:--------:|:---------|:------|
| #1 | 🔴 CRIT | `src/auth/login.ts:42` | **Security Risk**: JWT secret hardcoded as `"mysecret"`. Should use `process.env.JWT_SECRET`. |
| #2 | 🔴 CRIT | `src/auth/register.ts` | **Missing Req**: Email verification not implemented (PRD 2.3). |
| #3 | 🟠 MAJOR | `src/auth/login.ts:67` | **Logic Error**: Password comparison uses `==` instead of `bcrypt.compare()`. |
| #4 | 🟡 MINOR | `src/auth/types.ts` | **Type Safety**: Using `any` for user payload. Define proper interface. |

## 🛠️ Recommended Actions

- **Option A**: `Fix all critical` - Address #1 and #2 immediately
- **Option B**: `Fix #1, #2, #3` - Security and logic issues
- **Option C**: `Fix all` - Complete code review pass
```

---

## Workflow Navigation

**You are here:** Verify (auditing implementation)

**Common flows:**
- After implement → `/clavix:verify` → fix issues → verify again
- Before merge → `/clavix:verify` → ensure quality

**Related commands:**
- `/clavix:implement` - Build features (what you're verifying)
- `/clavix:plan` - See the tasks being checked
- `/clavix:refine` - Update PRD if requirements were wrong

---

## After Verification

**If all passed:**
- ✅ Ready for next phase or merge
- Consider `/clavix:archive` for completed projects

**If failures exist:**
- Address critical issues first
- Re-run verification after fixes
- Repeat until passing

**If OUTDATED issues:**
- Update `tasks.md` or `full-prd.md` to reflect reality
- Re-verify to clear the outdated flags
