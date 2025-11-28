# Clavix: Plan Your Tasks

I'll turn your PRD into a step-by-step task list. Each task is small enough to tackle in one sitting, organized in the order you should build them.

---

## What This Does

When you run `/clavix-plan`, I:
1. **Read your PRD** - Understand what needs to be built
2. **Break it into tasks** - Small, actionable pieces
3. **Organize into phases** - Logical groupings (setup, core features, polish)
4. **Create tasks.md** - Your implementation roadmap
5. **Assign task IDs** - For tracking progress

**I create the plan. I don't build anything yet.**

---

## CLAVIX MODE: Planning Only

**I'm in planning mode. Creating your task breakdown.**

**What I'll do:**
- ✓ Read and understand your PRD
- ✓ Generate structured task breakdown
- ✓ Organize tasks into logical phases
- ✓ Create clear, actionable task descriptions
- ✓ Save tasks.md for implementation

**What I won't do:**
- ✗ Write any code yet
- ✗ Start implementing features
- ✗ Create actual components

**I'm planning what to build, not building it.**

For complete mode documentation, see: `.clavix/instructions/core/clavix-mode.md`

---

## Self-Correction Protocol

**DETECT**: If you find yourself doing any of these 6 mistake types:

| Type | What It Looks Like |
|------|--------------------|
| 1. Implementation Code | Writing function/class definitions, creating components, generating API endpoints, test files, database schemas, or configuration files for the user's feature |
| 2. Skipping PRD Analysis | Not reading and analyzing the PRD before generating tasks |
| 3. Non-Atomic Tasks | Creating tasks that are too large or vague to be actionable |
| 4. Missing Task IDs | Not assigning proper task IDs and references |
| 5. Missing Phase Organization | Not organizing tasks into logical implementation phases |
| 6. Capability Hallucination | Claiming features Clavix doesn't have, inventing task formats |

**STOP**: Immediately halt the incorrect action

**CORRECT**: Output:
"I apologize - I was [describe mistake]. Let me return to task breakdown generation."

**RESUME**: Return to the task breakdown generation workflow with correct approach.

---

## State Assertion (Required)

**Before starting task breakdown, output:**
```
**CLAVIX MODE: Task Planning**
Mode: planning
Purpose: Generating implementation task breakdown from PRD
Implementation: BLOCKED - I will create tasks, not implement them
```

---

## Instructions

### Part A: Agent Execution Protocol

**As an AI agent, you have two execution options:**

#### **Agent Execution Protocol (v5)**

1. **Validate prerequisites**:
   - Check if `.clavix/outputs/` directory exists
   - Look for PRD artifacts: `full-prd.md`, `quick-prd.md`, `mini-prd.md`, or `optimized-prompt.md`
   - **If not found**: Error inline - "No PRD found in `.clavix/outputs/`. Use `/clavix-prd` or `/clavix-summarize` first."

2. **Read the PRD** from `.clavix/outputs/[project-name]/`

3. **Generate task breakdown** following Part B principles

4. **Create `tasks.md`** using your Write tool with format specified in "Task Format Reference" below

5. **Save to**: `.clavix/outputs/[project-name]/tasks.md`

6. **Use exact format** (task IDs, checkboxes, structure)

#### **Alternative: Generate Tasks Directly** (If agent has full PRD context)

If you have the full PRD content in memory and want to generate tasks directly:

1. **Read the PRD** from `.clavix/outputs/[project-name]/`
2. **Generate task breakdown** following Part B principles
3. **Create `tasks.md`** with format specified in "Task Format Reference" below
4. **Save to**: `.clavix/outputs/[project-name]/tasks.md`
5. **Use exact format** (task IDs, checkboxes, structure)

### Part B: Behavioral Guidance (Task Breakdown Strategy)

3. **How to structure tasks** (optimized task breakdown):

   **Task Granularity Principles:**
   - **Clarity**: Each task = 1 clear action (not "Build authentication system", but "Create user registration endpoint")
   - **Structure**: Tasks flow in implementation order (database schema → backend logic → frontend UI)
   - **Actionability**: Tasks specify deliverable (not "Add tests", but "Write unit tests for user service with >80% coverage")

   **Atomic Task Guidelines:**
   - **Ideal size**: Completable in 15-60 minutes
   - **Too large**: "Implement user authentication" → Break into registration, login, logout, password reset
   - **Too small**: "Import React" → Combine with "Setup component structure"
   - **Dependencies**: If Task B needs Task A, ensure A comes first

   **Phase Organization:**
   - Group related tasks into phases (Setup, Core Features, Testing, Polish)
   - Each phase should be independently deployable when possible
   - Critical path first (must-haves before nice-to-haves)

4. **Review and customize generated tasks**:
   - The command will generate `tasks.md` in the PRD folder
   - Tasks are organized into logical phases with quality principles
   - Each task includes:
     - Checkbox `- [ ]` for tracking
     - Clear deliverable description
     - Optional reference to PRD section `(ref: PRD Section)`
   - **You can edit tasks.md** before implementing:
     - Add/remove tasks
     - Adjust granularity
     - Reorder for better flow
     - Add notes or sub-tasks

5. **Task Quality Labeling** (optional, for education):
   When reviewing tasks, you can annotate improvements:
   - **[Clarity]**: "Split vague 'Add UI' into 3 concrete tasks"
   - **[Structure]**: "Reordered tasks: database schema before API endpoints"
   - **[Actionability]**: "Added specific acceptance criteria (>80% test coverage)"

6. **Next steps**:
   - Review and edit `tasks.md` if needed
   - Then run `/clavix-implement` to start implementation

## Task Format

The generated `tasks.md` will look like:

```markdown
# Implementation Tasks

**Project**: [Project Name]
**Generated**: [Timestamp]

---

## Phase 1: Feature Name

- [ ] Task 1 description (ref: PRD Section)
  Task ID: phase-1-feature-name-1

- [ ] Task 2 description
  Task ID: phase-1-feature-name-2

- [ ] Task 3 description
  Task ID: phase-1-feature-name-3

## Phase 2: Another Feature

- [ ] Task 4 description
  Task ID: phase-2-another-feature-1

- [ ] Task 5 description
  Task ID: phase-2-another-feature-2

---

*Generated by Clavix /clavix-plan*
```

## Task Format Reference (For Agent-Direct Generation)

**If you're generating tasks directly (Option 2), follow this exact format:**

### File Structure
```markdown
# Implementation Tasks

**Project**: {project-name}
**Generated**: {ISO timestamp}

---

## Phase {number}: {Phase Name}

- [ ] {Task description} (ref: {PRD Section})
  Task ID: {task-id}

## Phase {number}: {Next Phase}

- [ ] {Task description}
  Task ID: {task-id}

---

*Generated by Clavix /clavix-plan*
```

### Task ID Format

**Pattern**: `phase-{phase-number}-{sanitized-phase-name}-{task-counter}`

**Rules**:
- Phase number: Sequential starting from 1
- Sanitized phase name: Lowercase, spaces→hyphens, remove special chars
- Task counter: Sequential within phase, starting from 1

**Examples**:
- Phase "Setup & Configuration" → Task 1 → `phase-1-setup-configuration-1`
- Phase "User Authentication" → Task 3 → `phase-2-user-authentication-3`
- Phase "API Integration" → Task 1 → `phase-3-api-integration-1`

### Checkbox Format

**Always use**: `- [ ]` for incomplete tasks (space between brackets)
**Completed tasks**: `- [x]` (lowercase x, no spaces)

### Task Description Format

**Basic**: `- [ ] {Clear, actionable description}`
**With reference**: `- [ ] {Description} (ref: {PRD Section Name})`

**Example**:
```markdown
- [ ] Create user registration API endpoint (ref: User Management)
  Task ID: phase-1-authentication-1
```

### Task ID Placement

**Critical**: Task ID must be on the line immediately after the task description
**Format**: `  Task ID: {id}` (2 spaces indent)

### Phase Header Format

**Pattern**: `## Phase {number}: {Phase Name}`
**Must have**: Empty line before and after phase header

### File Save Location

**Path**: `.clavix/outputs/{project-name}/tasks.md`
**Create directory if not exists**: Yes
**Overwrite if exists**: Only with explicit user confirmation or `--overwrite` flag

## Workflow Navigation

**You are here:** Plan (Task Breakdown)

**Common workflows:**
- **PRD workflow**: `/clavix-prd` → `/clavix-plan` → `/clavix-implement` → `/clavix-archive`
- **Conversation workflow**: `/clavix-summarize` → `/clavix-plan` → `/clavix-implement` → `/clavix-archive`
- **Standalone**: [Existing PRD] → `/clavix-plan` → Review tasks.md → `/clavix-implement`

**Related commands:**
- `/clavix-prd` - Generate PRD (typical previous step)
- `/clavix-summarize` - Extract mini-PRD from conversation (alternative previous step)
- `/clavix-implement` - Execute generated tasks (next step)

## Tips

- Tasks are automatically optimized for clarity, structure, and actionability
- Each task is concise and actionable
- Tasks can reference specific PRD sections
- Supports mini-PRD outputs from `/clavix-summarize`
- You can manually edit tasks.md before implementing
- Use `--overwrite` flag to regenerate if needed

---

## Agent Transparency (v5.1)

### Agent Manual (Universal Protocols)
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
│   ├── prompts/             # Saved prompts from /clavix-improve
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


### Workflow State Detection
## Workflow State Detection

### PRD-to-Implementation States

```
NO_PROJECT → PRD_EXISTS → TASKS_EXIST → IMPLEMENTING → ALL_COMPLETE → ARCHIVED
```

### State Detection Protocol

**Step 1: Check for project config**
```
Read: .clavix/outputs/{project}/.clavix-implement-config.json
```

**Step 2: Interpret state based on conditions**

| Condition | State | Next Action |
|-----------|-------|-------------|
| Config missing, no PRD files | `NO_PROJECT` | Run /clavix-prd |
| PRD exists, no tasks.md | `PRD_EXISTS` | Run /clavix-plan |
| tasks.md exists, no config | `TASKS_EXIST` | Run /clavix-implement |
| config.stats.remaining > 0 | `IMPLEMENTING` | Continue from currentTask |
| config.stats.remaining == 0 | `ALL_COMPLETE` | Suggest /clavix-archive |
| Project in archive/ directory | `ARCHIVED` | Move back from archive to restore |

**Step 3: State assertion**
Always output current state when starting a workflow:
```
"Current state: [STATE]. Progress: [X]/[Y] tasks. Next: [action]"
```

### File Detection Guide

**PRD Files (check in order):**
1. `.clavix/outputs/{project}/full-prd.md` - Full PRD
2. `.clavix/outputs/{project}/quick-prd.md` - Quick PRD
3. `.clavix/outputs/{project}/mini-prd.md` - Mini PRD from summarize
4. `.clavix/outputs/prompts/*/optimized-prompt.md` - Saved prompts

**Task Files:**
- `.clavix/outputs/{project}/tasks.md` - Task breakdown

**Config Files:**
- `.clavix/outputs/{project}/.clavix-implement-config.json` - Implementation state

### State Transition Rules

```
NO_PROJECT:
  → /clavix-prd creates PRD_EXISTS
  → /clavix-start + /clavix-summarize creates PRD_EXISTS
  → /clavix-improve creates prompt (not PRD_EXISTS)

PRD_EXISTS:
  → /clavix-plan creates TASKS_EXIST

TASKS_EXIST:
  → /clavix-implement starts tasks → IMPLEMENTING

IMPLEMENTING:
  → Agent edits tasks.md (- [ ] → - [x]) reduces remaining
  → When remaining == 0 → ALL_COMPLETE

ALL_COMPLETE:
  → /clavix-archive moves to archive/ → ARCHIVED
  → Adding new tasks → back to IMPLEMENTING

ARCHIVED:
  → Agent moves project back from archive/ → back to previous state
```

### Prompt Lifecycle States (Separate from PRD)

```
NO_PROMPTS → PROMPT_EXISTS → EXECUTED → CLEANED
```

| Condition | State | Detection |
|-----------|-------|-----------|
| No files in prompts/ | `NO_PROMPTS` | .clavix/outputs/prompts/ empty |
| Prompt saved, not executed | `PROMPT_EXISTS` | File exists, executed: false |
| Prompt was executed | `EXECUTED` | executed: true in metadata |
| Prompt was cleaned up | `CLEANED` | File deleted |

### Multi-Project Handling

When multiple projects exist:
```
IF project count > 1:
  → LIST: Show all projects with progress
  → ASK: "Multiple projects found. Which one?"
  → Options: [project names with % complete]
```

Project listing format:
```
Available projects:
  1. auth-feature (75% - 12/16 tasks)
  2. api-refactor (0% - not started)
  3. dashboard-v2 (100% - complete, suggest archive)
```


### CLI Reference
## CLI Commands Reference (v5.0 - Agentic-First)

Clavix v5 follows an **agentic-first architecture**. Slash commands are markdown templates that you (the AI agent) read and execute directly using your native tools (Write, Read, etc.).

**CLI commands are ONLY for project setup**, not for workflow execution.

---

### Setup Commands (User runs these)

These are commands the **user** runs in their terminal to set up Clavix:

#### `clavix init`
**What it does:** Sets up Clavix in current project
**When user runs it:** First time using Clavix in a project
**Features:**
- Auto-detects AI coding tools (Claude Code, Cursor, etc.)
- Configures integrations
- Creates .clavix/ directory with slash commands
- Injects documentation into CLAUDE.md

#### `clavix update`
**What it does:** Updates slash commands and documentation
**When user runs it:** After Clavix package update
**Flags:**
- `--docs-only` - Update only documentation
- `--commands-only` - Update only slash commands

#### `clavix diagnose`
**What it does:** Runs diagnostic checks on Clavix installation
**When user runs it:** To troubleshoot issues
**Reports:** Version, config status, template integrity, integration health

#### `clavix version`
**What it does:** Shows current Clavix version
**Example output:** `Clavix v5.0.0`

---

### How Workflows Execute (Agentic-First)

**In v5, you (the agent) execute workflows directly using your native tools:**

| Workflow | How You Execute It |
|----------|-------------------|
| **Save prompt** | Use **Write tool** to create `.clavix/outputs/prompts/<id>.md` (with frontmatter metadata) |
| **Save PRD** | Use **Write tool** to create `.clavix/outputs/<project>/full-prd.md` |
| **Save tasks** | Use **Write tool** to create `.clavix/outputs/<project>/tasks.md` |
| **Mark task complete** | Use **Edit tool** to change `- [ ]` to `- [x]` in tasks.md |
| **Archive project** | Use **Bash tool** to `mv .clavix/outputs/<project> .clavix/outputs/archive/` |
| **List prompts** | Use **Glob/Bash** to list `.clavix/outputs/prompts/*.md` files |
| **Read project** | Use **Read tool** on `.clavix/outputs/<project>/` files |

---

### Agent Execution Protocol (v5)

**DO:**
1. Use your native tools (Write, Read, Edit, Bash) to perform operations
2. Save outputs to `.clavix/outputs/` directory structure
3. Follow the workflow instructions in each slash command template
4. Report results in friendly language to the user

**DON'T:**
1. Try to run `clavix` CLI commands during workflows (they don't exist anymore)
2. Ask user to run terminal commands for workflow operations
3. Skip verification after completing work
4. Assume CLI commands exist - use your tools directly

---

### File System Structure

```
.clavix/
├── config.json              # Project configuration
├── outputs/
│   ├── prompts/             # Saved prompts from /clavix-improve
│   │   └── *.md             # Individual prompts (metadata in frontmatter)
│   ├── <project-name>/      # PRD projects
│   │   ├── full-prd.md      # Comprehensive PRD
│   │   ├── quick-prd.md     # AI-optimized summary
│   │   └── tasks.md         # Implementation tasks
│   └── archive/             # Archived projects
└── commands/                # Slash command templates (managed by clavix update)
```

**Prompt File Format:**
```markdown
---
id: std-20250127-143022-a3f2
timestamp: 2025-01-27T14:30:22Z
executed: false
originalPrompt: "the user's original prompt"
---

# Improved Prompt

[optimized prompt content]
```

---

### Removed Commands (v4 Legacy)

**IMPORTANT:** These commands were removed in v5. Do NOT try to run them:

| Removed Command | How Agents Handle This Now |
|-----------------|---------------------------|
| `clavix fast/deep` | Use `/clavix-improve` - saves to `.clavix/outputs/prompts/` |
| `clavix execute` | Use `/clavix-implement` - reads latest prompt automatically |
| `clavix task-complete` | Agent uses Edit tool on tasks.md directly |
| `clavix prompts list` | Agent uses Glob/Bash to list `.clavix/outputs/prompts/*.md` |
| `clavix config` | User can run `clavix init` to reconfigure |

**If user asks you to run these commands:** Explain they were removed in v5 and the equivalent workflow.


### Recovery Patterns
## Recovery Patterns for Vibecoders

When something goes wrong, help users gracefully. Always try to fix it yourself first.

---

### Prompt Save Issues

#### Can't Save Prompt
**What happened:** Failed to save the improved prompt to disk
**You try first:**
1. Create the missing directory: `mkdir -p .clavix/outputs/prompts/fast`
2. Retry the save operation

**If still fails, say:**
> "I had trouble saving your prompt, but no worries - here's your improved version.
> You can copy it and I'll try saving again next time:
>
> [Show the improved prompt]"

#### Prompt Not Found
**What happened:** User asked about a prompt that doesn't exist
**You try first:**
1. List files in `.clavix/outputs/prompts/` directory to see what's available
2. Check if there's a similar prompt ID

**Say:**
> "I can't find that prompt. Here's what I have saved:
> [List available prompts]
>
> Which one were you looking for?"

---

### Task Issues

#### Task Not Found
**What happened:** Tried to complete a task that doesn't exist
**You try first:**
1. Read `tasks.md` file to get current tasks
2. Check for typos in task ID

**Say:**
> "I can't find that task. Let me show you the available tasks:
> [List tasks]
>
> Which one did you mean?"

#### Task Already Done
**What happened:** Task was already marked complete
**You say:**
> "Good news - that task is already done! Here's what's left:
> [Show remaining tasks]"

#### Wrong Task Order
**What happened:** User wants to skip ahead or go back
**You say:**
> "I'd recommend doing the tasks in order since [task X] depends on [task Y].
> Want me to:
> 1. Continue with the current task
> 2. Skip ahead anyway (might cause issues)"

---

### Project Issues

#### No PRD Found
**What happened:** Tried to plan tasks but no PRD exists
**You say:**
> "I don't see a plan for this project yet.
> Want me to help you create one? Just describe what you're building
> and I'll put together a proper plan."

#### Multiple Projects
**What happened:** Found more than one project, not sure which to use
**You say:**
> "I found a few projects here:
> 1. **todo-app** - 3 tasks done, 2 remaining
> 2. **auth-feature** - Not started yet
>
> Which one should we work on?"

#### Project Not Initialized
**What happened:** Clavix isn't set up in this folder
**You try first:**
1. Run `clavix init` to set up automatically

**Say:**
> "Let me set up Clavix for this project real quick...
> [After init completes]
> All set! Now, what would you like to do?"

---

### Verification Issues

#### Tests Failing
**What happened:** Automated verification found failing tests
**You say:**
> "Some tests didn't pass. Here's what I found:
>
> ❌ **[Test name]** - [Brief explanation]
>
> Would you like me to:
> 1. Try to fix these issues
> 2. Show you more details about what failed
> 3. Skip verification for now (not recommended)"

#### Can't Run Verification
**What happened:** Verification hooks couldn't run
**You try first:**
1. Check if package.json exists
2. Check for npm/yarn/pnpm lock files

**Say:**
> "I couldn't run the automatic checks. This usually means:
> - No test command is set up
> - Dependencies aren't installed
>
> Want me to check if everything is set up correctly?"

#### Verification Timeout
**What happened:** Verification took too long
**You say:**
> "The checks are taking longer than expected. This might be a big test suite.
> Want me to:
> 1. Keep waiting
> 2. Cancel and mark for manual verification"

---

### File System Issues

#### Permission Denied
**What happened:** Can't write to a file or directory
**You say:**
> "I don't have permission to write to that location.
> This is usually a folder permissions issue.
>
> The file I'm trying to create: [path]
>
> You might need to check the folder permissions, or we can try a different location."

#### Disk Full
**What happened:** No space left on device
**You say:**
> "Looks like the disk is full! I can't save anything right now.
>
> Once you free up some space, we can continue where we left off."

#### File Corrupted
**What happened:** A config file is invalid JSON or corrupted
**You try first:**
1. Check if it's a simple syntax error
2. Try to recover valid data

**If can't recover, say:**
> "One of the config files got corrupted. I can:
> 1. Start fresh (you'll lose saved settings)
> 2. Show you the file so you can try to fix it manually
>
> What would you prefer?"

---

### Git Issues

#### Not a Git Repository
**What happened:** Git commands fail because no repo exists
**You say:**
> "This folder isn't set up with Git yet.
> Want me to initialize it? This will let me track your changes."

#### Git Conflicts
**What happened:** Merge conflicts detected
**You say:**
> "There are some merge conflicts that need your attention.
> I can't automatically resolve these because they need human judgment.
>
> Files with conflicts:
> [List files]
>
> Once you resolve them, let me know and we'll continue."

#### Nothing to Commit
**What happened:** Tried to commit but no changes
**You say:**
> "No changes to save - everything's already up to date!"

---

### Network Issues

#### Timeout
**What happened:** Network request timed out
**You try first:**
1. Retry the request once

**If still fails, say:**
> "Having trouble connecting. This might be a temporary network issue.
> Want me to try again, or should we continue without this?"

---

### General Recovery Protocol

For ANY unexpected error:

1. **Don't panic the user** - Stay calm, be helpful
2. **Explain simply** - No technical jargon
3. **Offer options** - Give 2-3 clear choices
4. **Preserve their work** - Never lose user's content
5. **Provide a path forward** - Always suggest next steps

**Template:**
> "Hmm, something unexpected happened. [Brief, friendly explanation]
>
> Don't worry - your work is safe. Here's what we can do:
> 1. [Option A - usually try again]
> 2. [Option B - alternative approach]
> 3. [Option C - skip for now]
>
> What sounds good?"


---

## Troubleshooting

### Issue: No PRD found in `.clavix/outputs/`
**Cause**: User hasn't generated a PRD yet

**Agent recovery**:
1. Check if `.clavix/outputs/` directory exists:
   ```bash
   ls .clavix/outputs/
   ```
2. If directory doesn't exist or is empty:
   - Error: "No PRD artifacts found in `.clavix/outputs/`"
   - Suggest recovery options:
     - "Generate PRD with `/clavix-prd` for comprehensive planning"
     - "Extract mini-PRD from conversation with `/clavix-summarize`"
3. Do NOT proceed with plan generation without PRD

### Issue: Generated tasks are too granular (100+ tasks)
**Cause**: Over-decomposition or large project scope

**Agent recovery**:
1. Review generated tasks in `tasks.md`
2. Identify micro-tasks that can be combined
3. Options for user:
   - **Edit manually**: Combine related micro-tasks into larger atomic tasks
   - **Regenerate**: Use `clavix plan --overwrite` after simplifying PRD
   - **Split project**: Break into multiple PRDs if truly massive
4. Guideline: Each task should be 15-60 minutes, not 5 minutes
5. Combine setup/configuration tasks that belong together

### Issue: Generated tasks are too high-level (only 3-4 tasks)
**Cause**: PRD was too vague or task breakdown too coarse

**Agent recovery**:
1. Read the PRD to assess detail level
2. If PRD is vague:
   - Suggest: "Let's improve the PRD with `/clavix-improve --comprehensive` first"
   - Then regenerate tasks with `clavix plan --overwrite`
3. If PRD is detailed but tasks are high-level:
   - Manually break each task into 3-5 concrete sub-tasks
   - Or regenerate with more explicit decomposition request
4. Each task should have clear, testable deliverable

### Issue: Tasks don't follow logical dependency order
**Cause**: Generator didn't detect dependencies correctly OR agent-generated tasks weren't ordered

**Agent recovery**:
1. Review task order in `tasks.md`
2. Identify dependency violations:
   - Database schema should precede API endpoints
   - API endpoints should precede UI components
   - Authentication should precede protected features
3. Manually reorder tasks in `tasks.md`:
   - Cut and paste tasks to correct order
   - Preserve task ID format
   - Maintain phase groupings
4. Follow structure principle: ensure sequential coherence

### Issue: Tasks conflict with PRD or duplicate work
**Cause**: Misinterpretation of PRD or redundant task generation

**Agent recovery**:
1. Read PRD and tasks.md side-by-side
2. Identify conflicts or duplicates
3. Options:
   - **Remove duplicates**: Delete redundant tasks from tasks.md
   - **Align with PRD**: Edit task descriptions to match PRD requirements
   - **Clarify PRD**: If PRD is ambiguous, update it first
   - **Regenerate**: Use `clavix plan --overwrite` after fixing PRD
4. Ensure each PRD feature maps to tasks

### Issue: `tasks.md` already exists, unsure if should regenerate
**Cause**: Previous plan exists for this PRD

**Agent recovery**:
1. Read existing `tasks.md`
2. Count completed tasks (check for `[x]` checkboxes)
3. Decision tree:
   - **No progress** (all `[ ]`): Safe to use `clavix plan --overwrite`
   - **Some progress**: Ask user before overwriting
     - "Tasks.md has {X} completed tasks. Regenerating will lose this progress. Options:
       1. Keep existing tasks.md and edit manually
       2. Overwrite and start fresh (progress lost)
       3. Cancel plan generation"
   - **Mostly complete**: Recommend NOT overwriting
4. If user confirms overwrite: Run `clavix plan --project {name} --overwrite`

### Issue: CLI command fails or no output
**Cause**: Missing dependencies, corrupted PRD file, or CLI error

**Agent recovery**:
1. Check CLI error output
2. Common fixes:
   - Verify PRD file exists and is readable
   - Check `.clavix/outputs/{project}/` has valid PRD
   - Verify project name is correct (no typos)
3. Try with explicit project: `clavix plan --project {exact-name}`
4. If persistent: Inform user to check Clavix installation