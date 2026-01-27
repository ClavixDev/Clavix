---
name: using-clavix
description: Use when starting any conversation involving Clavix workflows - establishes skill invocation rules, verification requirements, and workflow orchestration
license: Apache-2.0
---
# Using Clavix

If you think there is even a 1% chance a Clavix skill might apply to what you are doing, you ABSOLUTELY MUST invoke the skill.

IF A CLAVIX SKILL APPLIES TO YOUR TASK, YOU DO NOT HAVE A CHOICE. YOU MUST USE IT.

This is not negotiable. This is not optional. You cannot rationalize your way out of this.

---

## How to Access Skills

**In Claude Code / Amp:** Use the `Skill` tool. When you invoke a skill, its content is loaded and presented to you—follow it directly.

**In other environments:** Check your platform's documentation for how skills are loaded.

---

## The Rule

**Invoke relevant Clavix skills BEFORE any response or action.** Even a 1% chance a skill might apply means you should invoke the skill to check. If an invoked skill turns out to be wrong for the situation, you don't need to use it.

```
User message received
        │
        ▼
"Might any Clavix skill apply?" ──── definitely not ──► Respond normally
        │
        │ yes, even 1%
        ▼
Invoke Skill tool
        │
        ▼
Announce: "Using [skill] to [purpose]"
        │
        ▼
Follow skill exactly
        │
        ▼
Respond (including clarifications)
```

---

## Red Flags - STOP and Check

These thoughts mean STOP—you're rationalizing:

| Thought | Reality |
|---------|---------|
| "This is just a simple question" | Questions are tasks. Check for skills. |
| "I need more context first" | Skill check comes BEFORE clarifying questions. |
| "Let me explore the codebase first" | Skills tell you HOW to explore. Check first. |
| "I can check files quickly" | Files lack conversation context. Check for skills. |
| "Let me gather information first" | Skills tell you HOW to gather information. |
| "This doesn't need a formal skill" | If a skill exists, use it. |
| "I remember this skill" | Skills evolve. Read current version. |
| "This doesn't count as a task" | Action = task. Check for skills. |
| "The skill is overkill" | Simple things become complex. Use it. |
| "I'll just do this one thing first" | Check BEFORE doing anything. |
| "I know what that means" | Knowing the concept ≠ using the skill. Invoke it. |

---

## Clavix Skill Priority

When multiple skills could apply, use this order:

1. **Exploration skills first** (clavix-start) - for vague ideas needing discovery
2. **Planning skills second** (clavix-prd, clavix-plan) - for structuring requirements
3. **Implementation skills third** (clavix-implement) - for executing tasks
4. **Verification skills always** (clavix-verify) - NEVER skip after implementation

"Let's build X" → clavix-start or clavix-prd first, then clavix-plan, then clavix-implement.
"Fix this bug" → Use systematic-debugging, then clavix-implement if needed.

---

## Clavix Workflow Map

```
[Vague Idea]
      │
      ▼
clavix-start ──► [Conversation] ──► clavix-summarize
      │                                    │
      │                                    ▼
      │                             [Mini-PRD/Prompt]
      │                                    │
      ▼                                    ▼
clavix-prd ◄───────────────────────────────┘
      │
      ▼
[Full PRD + Quick PRD]
      │
      ▼
clavix-plan
      │
      ▼
[tasks.md with Implementation Plan]
      │
      ▼
clavix-implement ◄──────────────────┐
      │                              │
      ▼                              │
[Code Changes]                       │
      │                              │
      ▼                              │
clavix-verify                        │
      │                              │
      ├── Issues found? ────────────►│
      │                     Fix Loop │
      ▼                              │
[All Verified] ◄─────────────────────┘
      │
      ▼
clavix-archive (optional)
```

---

## Required Skill Chains

These chains are MANDATORY. Do not skip steps.

### Planning → Implementation Chain

```
clavix-prd
    │
    ▼ REQUIRED
clavix-plan
    │
    ▼ REQUIRED
clavix-implement
    │
    ▼ REQUIRED
clavix-verify
```

### Implementation → Verification Chain

```
clavix-implement (each task)
    │
    ▼ REQUIRED (after ALL tasks complete)
clavix-verify
    │
    ├── Issues found?
    │       │
    │       ▼
    │   Fix the issues
    │       │
    │       ▼
    │   Re-run clavix-verify (REQUIRED)
    │       │
    │       └── Repeat until all issues resolved
    │
    ▼ (only when all pass)
Done / clavix-archive
```

---

## The Iron Laws

### Iron Law 1: No Completion Without Verification

```
NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE
```

If you haven't run the verification command in this message, you cannot claim it passes.

### Iron Law 2: No Implementation Without Planning

```
NO CODE CHANGES WITHOUT A PLAN OR TASK SPECIFICATION
```

If you're implementing features, there should be a PRD or task list guiding the work.

### Iron Law 3: No Skipping Fix Loops

```
ISSUES FOUND = ISSUES FIXED + RE-VERIFIED
```

If verification found issues, you must fix them AND re-verify. Proceeding without re-verification is forbidden.

---

## Verification Gate Pattern

**BEFORE claiming any status or expressing satisfaction:**

1. **IDENTIFY**: What command proves this claim?
2. **RUN**: Execute the FULL command (fresh, complete)
3. **READ**: Full output, check exit code, count failures
4. **VERIFY**: Does output confirm the claim?
   - If NO: State actual status with evidence
   - If YES: State claim WITH evidence

**Skip any step = lying, not verifying**

---

## Common Verification Requirements

| Claim | Requires | Not Sufficient |
|-------|----------|----------------|
| Tests pass | Test command output: 0 failures | Previous run, "should pass" |
| Linter clean | Linter output: 0 errors | Partial check, extrapolation |
| Build succeeds | Build command: exit 0 | Linter passing, logs look good |
| Bug fixed | Test original symptom: passes | Code changed, assumed fixed |
| Task complete | Verification evidence shown | "I implemented it" |
| Requirements met | Line-by-line checklist verified | Tests passing alone |

---

## Clavix Skill Reference

| Skill | When to Use |
|-------|-------------|
| `clavix-start` | Ideas are vague, need conversational exploration |
| `clavix-summarize` | Extract requirements from conversation into mini-PRD |
| `clavix-prd` | Create comprehensive PRD through strategic questions |
| `clavix-plan` | Transform PRD into actionable task breakdown |
| `clavix-implement` | Execute tasks from plan with progress tracking |
| `clavix-verify` | Audit implementation against PRD requirements |
| `clavix-review` | Review PR/code changes with criteria analysis |
| `clavix-refine` | Iterate on existing PRD or prompt |
| `clavix-improve` | Optimize a prompt with quality assessment |
| `clavix-archive` | Archive completed project outputs |

---

## Skill Types

**Rigid Skills** (clavix-implement, clavix-verify): Follow exactly. Don't adapt away from the discipline.

**Flexible Skills** (clavix-start, clavix-prd): Adapt principles to context, but maintain the core flow.

The skill itself tells you which type it is through its structure.

---

## User Instructions

Instructions say WHAT, not HOW. "Add X" or "Fix Y" doesn't mean skip workflows.

"Implement this feature" → Check for clavix-prd or clavix-plan first
"Just make it work" → Still requires verification after implementation
"Quick fix" → Still requires evidence before claiming success

---

## Remember

- Check for skills BEFORE any action
- Follow skill chains completely
- Never skip verification steps
- Issues found = must fix AND re-verify
- Evidence before claims, always
