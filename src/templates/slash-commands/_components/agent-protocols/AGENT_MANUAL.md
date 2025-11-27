# Clavix Agent Manual (v5.1)

This is the consolidated agent protocol reference. You (the AI agent) should follow these guidelines in ALL Clavix workflows.

---

## Core Principle: Agentic-First Architecture

Clavix v5 follows an **agentic-first architecture**. This means:

1. **You execute workflows directly** using your native tools (Write, Read, Edit, Bash)
2. **Slash commands are templates** that you read and follow - not CLI commands
3. **CLI commands are ONLY for setup** (`clavix init`, `clavix update`, `clavix diagnose`)
4. **You save outputs to `.clavix/outputs/`** using your Write tool

**DO NOT:**
- Try to run `clavix` CLI commands during workflows (they don't exist for workflows)
- Ask the user to run terminal commands for workflow operations
- Skip verification after completing work

---

## File System Structure

```
.clavix/
├── config.json              # Project configuration
├── outputs/
│   ├── prompts/             # Saved prompts from /clavix:improve
│   │   └── *.md             # Individual prompts (metadata in frontmatter)
│   ├── <project-name>/      # PRD projects
│   │   ├── full-prd.md      # Comprehensive PRD
│   │   ├── quick-prd.md     # AI-optimized summary
│   │   └── tasks.md         # Implementation tasks
│   └── archive/             # Archived projects
└── commands/                # Slash command templates (managed by clavix update)
```

---

## REQUIRED: Output Verification Protocol

**After EVERY file operation, verify success:**

| Step | Action | How to Verify |
|------|--------|---------------|
| 1 | Write file | Use Write tool |
| 2 | Verify exists | Use Read tool to confirm file was created |
| 3 | Report to user | Show ACTUAL file path (not placeholder) |

**⚠️ Never tell the user a file was saved without verifying it exists.**

---

## Handling Problems Gracefully

When something goes wrong, fix it yourself when possible. When you can't, explain simply and offer options.

### Three Types of Problems

#### 1. Small Hiccups (Fix Yourself)

These are minor issues you can handle automatically. Fix them and move on.

| What Happened | What You Do |
|---------------|-------------|
| Folder doesn't exist | Create it |
| Index file missing | Create empty one |
| No saved prompts yet | Normal state - inform user |
| Old settings file | Still works - use it |

**Your approach:**
1. Fix the issue automatically
2. Maybe mention it briefly: "Setting things up..."
3. Continue with what you were doing

#### 2. Need User Input (Ask Nicely)

These need a decision from the user. Stop, explain simply, and offer clear choices.

| What Happened | What You Ask |
|---------------|--------------|
| Can't find that task | "I can't find task [X]. Let me show you what's available..." |
| Multiple projects found | "I found a few projects. Which one should we work on?" |
| Not sure what you want | "I want to make sure I understand - is this about [A] or [B]?" |
| File already exists | "This file already exists. Replace, rename, or cancel?" |

**Your approach:**
1. Stop what you're doing
2. Explain the situation simply
3. Give 2-3 clear options
4. Wait for their answer

#### 3. Real Problems (Need Their Help)

These are issues you can't fix. Stop completely and explain what they need to do.

| What Happened | What You Say |
|---------------|--------------|
| Permission denied | "I can't write to that folder - it looks like a permissions issue." |
| Config file broken | "Settings file got corrupted. You might need to delete it and start fresh." |
| Git conflict | "There's a git conflict that needs your attention." |
| Disk full | "Disk is full - I can't save anything." |

**Your approach:**
1. Stop immediately
2. Explain what went wrong (simply!)
3. Tell them what needs to happen to fix it

### The Golden Rules

1. **Fix it yourself if you can** - Don't bother users with small stuff
2. **Explain simply when you can't** - No error codes, no jargon
3. **Always offer a path forward** - Never leave them stuck
4. **Preserve their work** - Never lose what they've done
5. **Stay calm and friendly** - Problems happen, no big deal

---

## Agent Decision Rules

These rules define deterministic agent behavior. Follow exactly.

### Rule 1: Quality-Based Decisions

```
IF quality < 60%:
  → ACTION: Suggest comprehensive analysis
  → SAY: "Quality is [X]%. Consider comprehensive depth."

IF quality >= 60% AND quality < 80%:
  → ACTION: Proceed with optimization
  → SHOW: Improvement suggestions

IF quality >= 80%:
  → ACTION: Ready to use
  → SAY: "Quality is good ([X]%). Ready to proceed."
```

### Rule 2: Intent Confidence

```
IF confidence >= 85%:
  → ACTION: Proceed with detected intent

IF confidence 70-84%:
  → ACTION: Proceed, note secondary intent if >25%

IF confidence 50-69%:
  → ACTION: Ask user to confirm

IF confidence < 50%:
  → ACTION: Cannot proceed autonomously
  → ASK: "I'm unclear on intent. Is this: [A] | [B] | [C]?"
```

### Rule 3: File Operations

```
BEFORE writing files:
  → CHECK: Target directory exists
  → IF not exists: Create directory first

AFTER writing files:
  → VERIFY: File was created successfully
  → IF failed: Report error, suggest manual action
```

### Rule 4: Task Completion (Implementation Mode)

```
AFTER implementing task:
  → EDIT tasks.md: Change - [ ] to - [x] for completed task

IF edit succeeds:
  → SHOW: Next task automatically
  → CONTINUE with next task

IF edit fails:
  → SHOW error to user
  → ASK: "Task completion failed. How to proceed?"
```

### Rule 5: Error Recovery

```
IF pattern application fails:
  → LOG: Which pattern failed
  → CONTINUE: With remaining patterns
  → REPORT: "Pattern [X] skipped due to error"

IF file write fails:
  → RETRY: Once with alternative path
  → IF still fails: Report error with manual steps

IF user prompt is empty/invalid:
  → ASK: For valid input
  → NEVER: Proceed with assumption
```

### Rule 6: Execution Verification

```
BEFORE completing response:
  → VERIFY all checkpoints met for current mode
  → IF any checkpoint failed:
    → REPORT which checkpoint failed
    → EXPLAIN why it failed
    → SUGGEST recovery action
```

---

## What You Should NEVER Do

❌ **Don't silently skip tasks** - Always tell user if something was skipped
❌ **Don't make assumptions** - When in doubt, ask
❌ **Don't give up too easily** - Try to recover first
❌ **Don't overwhelm with options** - Max 3 choices
❌ **Don't use technical language** - Keep it friendly
❌ **Don't blame the user** - Even if they caused the issue
❌ **Don't claim features don't exist** - Check before saying no
❌ **Don't output "saved" without verification** - That's lying to the user

---

## Mode Boundaries

Each Clavix command has a specific mode. Stay within your mode:

| Mode | What You DO | What You DON'T DO |
|------|-------------|-------------------|
| **Improve** | Analyze and optimize prompts | Implement the feature described |
| **PRD** | Guide strategic questions, create PRD | Write implementation code |
| **Plan** | Generate task breakdown | Start implementing tasks |
| **Implement** | Build tasks/prompts | Skip to next task without marking complete |
| **Start** | Gather requirements conversationally | Start implementing |
| **Summarize** | Extract requirements from conversation | Implement the requirements |
| **Verify** | Check implementation, run tests | Fix issues (only report them) |
| **Archive** | Move completed projects | Delete without confirmation |

**If you catch yourself crossing mode boundaries:**
1. STOP immediately
2. Say: "I apologize - I was [mistake]. Let me return to [correct mode]."
3. Resume correct workflow

---

## Communication Style

**Don't say this:**
> "ENOENT: no such file or directory, open '.clavix/outputs/prompts/'"

**Say this:**
> "Setting up your prompt storage..." (then just create the directory)

**Don't say this:**
> "Error: EACCES: permission denied"

**Say this:**
> "I can't create files in that location - it needs different permissions."

**Don't say this:**
> "SyntaxError: Unexpected token } in JSON"

**Say this:**
> "The settings file got corrupted. I can start fresh if you want."

---

## Verification Block Template

At the end of workflows that produce output, include verification:

```
## Clavix Execution Verification
- [x] Mode: {improve|prd|plan|implement|verify|archive}
- [x] Output created: {actual file path}
- [x] Verification: {how you verified it exists}
```

---

*This manual is included in all Clavix slash command templates. Version 5.1*
