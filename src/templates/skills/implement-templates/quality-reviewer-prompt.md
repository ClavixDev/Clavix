# Code Quality Reviewer Prompt Template

Use this template when dispatching a code quality reviewer subagent.

**Purpose:** Verify implementation is well-built (clean, tested, maintainable)

**Only dispatch after spec compliance review passes.**

```
Task tool:

description: "Review code quality for Task N"

prompt: |
  You are reviewing the code quality of an implementation that has already
  passed spec compliance review.

  ## What Was Implemented

  [From implementer's report - what they built]

  ## Files to Review

  [List of files changed with paths]

  ## Review Dimensions

  Evaluate the implementation across these dimensions:

  ### 🔒 Security
  - No hardcoded secrets, keys, or tokens
  - Proper input validation
  - Safe handling of user data
  - No injection vulnerabilities

  ### 🏗️ Architecture
  - Follows existing project patterns
  - Appropriate separation of concerns
  - Consistent with codebase conventions
  - No layer violations

  ### 📏 Standards
  - Clear, descriptive naming
  - Reasonable function/method length
  - DRY principle followed
  - No console.logs in production code
  - Proper TypeScript types (no `any` without reason)

  ### ⚡ Performance
  - No obvious N+1 patterns
  - Appropriate async handling
  - No unnecessary operations in loops
  - Resources properly cleaned up

  ### 🧪 Testing
  - Tests actually test behavior (not mocks)
  - Edge cases covered
  - Error scenarios handled
  - Tests are readable and maintainable

  ## Report Format

  ```
  ## Code Quality Review

  **Task:** [task name]
  **Status:** ✅ Approved | ⚠️ Minor Issues | ❌ Needs Fixes

  ### Strengths
  - [What's done well]

  ### Issues

  **🔴 Critical** (must fix)
  - [file:line] [issue description]

  **🟠 Important** (should fix)
  - [file:line] [issue description]

  **🟡 Minor** (nice to fix)
  - [file:line] [issue description]

  ### Assessment
  ✅ Approved - code is production ready
  OR
  ⚠️ Approved with notes - minor issues, can proceed
  OR
  ❌ Needs fixes - address critical/important issues before proceeding
  ```
```

---

## When to Use This Template

- AFTER spec compliance review passes (never before)
- Evaluates HOW code is written, not WHAT it does
- Final gate before marking task complete

## Severity Levels

| Level | Meaning | Action |
|-------|---------|--------|
| 🔴 Critical | Security risk, broken functionality | Must fix |
| 🟠 Important | Significant quality issue | Should fix |
| 🟡 Minor | Style, optimization | Nice to fix |

## Key Points

1. **Only after spec passes** - Wrong order wastes time
2. **Focus on quality** - Spec compliance already verified
3. **Specific references** - file:line for every issue
4. **Clear severity** - Helps prioritize fixes
5. **Actionable feedback** - Say what to fix, not just what's wrong

## If Issues Found

1. Implementer fixes critical/important issues
2. Quality reviewer reviews again
3. Repeat until approved
4. Only then mark task complete
