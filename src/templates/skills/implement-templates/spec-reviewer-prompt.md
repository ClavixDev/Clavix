# Spec Compliance Reviewer Prompt Template

Use this template when dispatching a spec compliance reviewer subagent.

**Purpose:** Verify implementer built what was requested (nothing more, nothing less)

```
Task tool:

description: "Review spec compliance for Task N"

prompt: |
  You are reviewing whether an implementation matches its specification.

  ## What Was Requested

  [FULL TEXT of task requirements from the plan]

  ## What Implementer Claims They Built

  [From implementer's report - paste their summary]

  ## CRITICAL: Do Not Trust the Report

  The implementer may have finished quickly or missed details. Their report may be
  incomplete, inaccurate, or optimistic. You MUST verify everything independently.

  **DO NOT:**
  - Take their word for what they implemented
  - Trust their claims about completeness
  - Accept their interpretation of requirements

  **DO:**
  - Read the actual code they wrote
  - Compare actual implementation to requirements line by line
  - Check for missing pieces they claimed to implement
  - Look for extra features they didn't mention

  ## Your Job

  Read the implementation code and verify:

  ### Missing Requirements
  - Did they implement everything that was requested?
  - Are there requirements they skipped or missed?
  - Did they claim something works but didn't actually implement it?

  ### Extra/Unneeded Work
  - Did they build things that weren't requested?
  - Did they over-engineer or add unnecessary features?
  - Did they add "nice to haves" that weren't in spec?

  ### Misunderstandings
  - Did they interpret requirements differently than intended?
  - Did they solve the wrong problem?
  - Did they implement the right feature but wrong way?

  **Verify by reading code, not by trusting report.**

  ## Report Format

  ```
  ## Spec Compliance Review

  **Task:** [task name]
  **Status:** ✅ Spec Compliant | ❌ Issues Found

  ### Missing Requirements
  - [List what's missing with file:line references]
  - [Or "None - all requirements implemented"]

  ### Extra/Unneeded Work
  - [List extras that weren't requested]
  - [Or "None - nothing extra added"]

  ### Misunderstandings
  - [List any misinterpretations]
  - [Or "None - requirements correctly understood"]

  ### Verdict
  ✅ Spec compliant - proceed to code quality review
  OR
  ❌ Issues found - implementer must fix before proceeding
  ```
```

---

## When to Use This Template

- After implementer reports task complete
- BEFORE code quality review (order matters)
- Verify what was built matches what was requested

## Key Points

1. **Don't trust the implementer's report** - Verify independently
2. **Read actual code** - Not just claims about code
3. **Check both directions** - Missing AND extra work
4. **Spec compliance first** - Quality review only after spec passes
5. **Clear verdict** - Either passes or needs fixes

## If Issues Found

1. Implementer fixes the specific issues
2. Spec reviewer reviews again
3. Repeat until spec compliant
4. Only then proceed to code quality review
