# Clavix: Implement

Time to build! This command auto-detects what to implement:
- **Tasks from PRD workflow** - Your task list from `/clavix:plan`
- **Prompts from improve workflow** - Your optimized prompts from `/clavix:improve`

---

## What This Does

When you run `/clavix:implement`, I:
1. **Auto-detect what to build** - Check tasks.md first, then prompts/
2. **Find your work** - Load from PRD output or saved prompts
3. **Build systematically** - Tasks in order, or implement your prompt
4. **Mark progress** - Update checkboxes or prompt metadata
5. **Verify automatically** - Run tests and checks when done

**You just say "implement" and I handle the rest.**

### Command Variations

**Parse the slash command content to determine implementation scope:**

| Command Pattern | Interpretation | Action |
|----------------|----------------|--------|
| `/clavix:implement` or `/clavix:implement all` | All tasks | Implement all pending tasks |
| `/clavix:implement task 3` | Single task | Implement only task #3 |
| `/clavix:implement` (no qualifier) | Unspecified | Ask user to choose |

**How to parse:**
1. Check if command contains "task <number>" pattern
2. Check if command contains "all" keyword
3. If neither → ask user for selection

### Detection Priority

```
/clavix:implement
    │
    ├─► Check .clavix/outputs/<project>/tasks.md (all project folders)
    │       └─► If found → Task Implementation Mode
    │
    ├─► Check .clavix/outputs/summarize/tasks.md (legacy fallback)
    │       └─► If found → Task Implementation Mode (legacy)
    │
    └─► Check .clavix/outputs/prompts/*.md
            └─► If found → Prompt Execution Mode
            └─► If neither → Ask what to build
```

### Required Confirmation Message

**Before starting any implementation, you MUST output a confirmation message:**

**For tasks.md detection:**
```
Found tasks.md with [N] pending tasks in [project-name]. Starting task implementation...
```

**For prompt detection:**
```
Found [N] saved prompt(s) in prompts/. Implementing [prompt-name]...
```

**For legacy summarize/ fallback:**
```
Found tasks.md with [N] pending tasks in summarize/ (legacy location). Starting task implementation...
```

This confirmation ensures the user knows exactly what will be implemented before any code is written.

### Task Selection (REQUIRED)

**When Task Implementation Mode is detected, you MUST determine task scope BEFORE starting:**

**Step 1: Parse the slash command**
- Check command content for: `task <N>` pattern (e.g., "task 3", "task 5")
- Check command content for: `all` keyword
- If neither found → proceed to Step 2

**Step 2: If no qualifier in command, ASK the user:**
> "I found [N] pending tasks in [project-name]. How would you like to proceed?
>
> Options:
> - **all** - Implement all pending tasks
> - **task <N>** - Implement only task number N (e.g., "task 3")
> - **list** - Show all tasks with numbers
>
> Which would you prefer?"

**Step 3: Handle selection**
- If "all" in command or user response → Implement all pending tasks
- If "task N" detected → Validate N exists, implement only that task
- If "list" requested → Show numbered list of incomplete tasks, ask again

**Step 4: Confirm before starting**
> "Found tasks.md with [N] pending tasks in [project-name].
>
> Mode: [ALL tasks | Single task #N: [task description]]
> Starting task implementation..."

### Prompt Execution Flags

For prompt execution mode (when tasks.md not found):
- `--prompt <id>` - Execute specific prompt by ID
- `--latest` - Execute most recent prompt
- `--tasks` - Force task mode (skip prompt check, use tasks.md)

---

## CLAVIX MODE: Implementation

**I'm in implementation mode. Building your tasks!**

**What I'll do:**
- ✓ Read and understand task requirements
- ✓ Implement tasks from your task list
- ✓ Write production-quality code
- ✓ Follow your PRD specifications
- ✓ Mark tasks complete automatically
- ✓ Create git commits (if you want)

**What I'm authorized to create:**
- ✓ Functions, classes, and components
- ✓ New files and modifications
- ✓ Tests for implemented code
- ✓ Configuration files

**Before I start, I'll confirm:**
> "Starting task implementation. Working on: [task description]..."

For complete mode documentation, see: `.clavix/instructions/core/clavix-mode.md`

---

## Self-Correction Protocol

If you catch yourself doing any of these, STOP and correct:

1. **Skipping Auto-Detection** - Not checking for tasks.md and prompts/ before asking
2. **Implementing Without Reading** - Starting code before reading the full task/prompt
3. **Skipping Verification** - Not running tests after implementation
4. **Batch Task Completion** - Marking multiple tasks done without implementing each
5. **Ignoring Blocked Tasks** - Not reporting when a task cannot be completed
6. **Capability Hallucination** - Claiming Clavix can do things it cannot
7. **Not Parsing Command** - Not checking command content for "task N" or "all" before asking
8. **Wrong Task Number** - Not validating task number is within range before implementing

**DETECT → STOP → CORRECT → RESUME**

---

## State Assertion (REQUIRED)

Before ANY action, output this confirmation:

```
**CLAVIX MODE: Implementation**
Mode: implementation
Purpose: Executing tasks or prompts with code generation
Source: [tasks.md | prompts/ | user request]
Implementation: AUTHORIZED
```

---

## How It Works

### The Quick Version

```
You:    /clavix:implement
Me:     "Found your task list! 8 tasks in 3 phases."
        "Starting with: Set up project structure"
        [I build it]
        [I mark it done]
        "Done! Moving to next task: Create database models"
        [I build it]
        ...
Me:     "All tasks complete! Your project is built."
```

### The Detailed Version

**First time I run (v5 Agentic-First):**

1. **I find your task list** - Read `tasks.md` from your PRD folder (`.clavix/outputs/<project>/tasks.md`)
2. **I ask about git commits** (only if you have lots of tasks):
   > "You've got 12 tasks. Want me to create git commits as I go?
   >
   > Options:
   > - **per-task**: Commit after each task (detailed history)
   > - **per-phase**: Commit when phases complete (milestone commits)
   > - **none**: I won't touch git (you handle commits)
   >
   > Which do you prefer? (I'll default to 'none' if you don't care)"

3. **I start building** - First incomplete task

**Each task I work on:**

1. **Read the task** - Understand what needs to be built
2. **Check the PRD** - Make sure I understand the requirements
3. **Implement it** - Write code, create files, build features using my native tools
4. **Mark it complete** - Use Edit tool to change `- [ ]` to `- [x]` in tasks.md
5. **Move to next** - Find the next incomplete task

**If we get interrupted:**

No problem! Just run `/clavix:implement` again and I pick up where we left off.
The checkboxes in tasks.md track exactly what's done.

## ⚠️ How I Mark Tasks Complete (v5 Agentic-First)

**After finishing EACH task, I use my Edit tool to update tasks.md:**

Change: `- [ ] Task description` → `- [x] Task description`

**Why this matters:**
- Updates tasks.md directly (checkboxes)
- Progress is tracked by counting checkboxes
- Git commits (if enabled) are created with my Bash tool
- I read tasks.md to find the next incomplete task

---

## How I Mark Tasks Complete

**I handle this automatically - you don't need to do anything.**

### What Happens (v5 Agentic-First)

After I finish implementing a task:

1. **I use Edit tool** to change `- [ ]` to `- [x]` in tasks.md
2. **I count progress** by reading tasks.md and counting checkboxes
3. **I commit** (if you enabled that) using git commands
4. **I find next task** by scanning for the next `- [ ]` in tasks.md

### What You'll See

```
✓ Task complete: "Set up project structure"

Progress: 2/8 tasks (25%)

Next up: "Create database models"
Starting now...
```

## My Rules for Implementation

**I will:**
- Build one task at a time, in order
- Check the PRD when I need more context
- Ask you if something's unclear
- Mark tasks done only after they're really done
- Create git commits (if you asked for them)

**I won't:**
- Skip tasks or jump around
- Mark something done that isn't working
- Guess what you want - I'll ask instead
- Edit checkboxes manually (I use the command)

## Finding Your Way Around

Need to see what projects exist or check progress? I read the file system:

| What I Need | How I Find It |
|-------------|---------------|
| See all projects | List directories in `.clavix/outputs/` |
| Check a specific project | Read `.clavix/outputs/<project>/` files |
| See task progress | Read `.clavix/outputs/<project>/tasks.md` |
| Find archived work | List `.clavix/outputs/archive/` |

## When I Can't Continue (Blocked Tasks)

Sometimes I hit a wall. Here's what happens:

### Common Blockers

- **Missing something**: API key, credentials, design files
- **Unclear what to do**: Task is vague or conflicts with the PRD
- **Waiting on something**: External service, content, or assets not ready
- **Technical issue**: Can't install a library, environment problem

### What I'll Do

**I'll stop and tell you:**
> "I'm stuck on: [task description]
>
> The problem: [e.g., 'I need a Stripe API key to set up payments']
>
> We can:
> 1. **You give me what I need** - [specific thing needed]
> 2. **I do what I can** - Build the parts that don't need [blocker]
> 3. **Skip for now** - Move on, come back to this later
>
> What would you like?"

### My Preferred Approach

If possible, I'll break the task into pieces and do what I can:

```
Original: "Set up payment integration"

What I can do now:
✓ Create the payment service structure
✓ Build the payment UI components
✓ Set up the checkout flow

What's blocked:
○ [BLOCKED: Need Stripe key] Connect to Stripe API
```

This way we make progress even when something's missing.

### Tracking Blocked Tasks

I mark blocked tasks in tasks.md:
```markdown
- [x] Create payment service structure
- [ ] [BLOCKED: Need Stripe API key] Connect to Stripe
- [x] Build checkout UI
```

At the end of our session, I'll remind you:
> "Just a heads up - we have 2 blocked tasks waiting for:
> - Stripe API key (payment integration)
> - Design mockups (dashboard layout)
>
> Let me know when you have these!"

## Example: What a Session Looks Like

### Single Task Mode

```
You:    /clavix:implement task 3

Me:     "Found your task list! Let me see where we are..."

        "📋 8 total tasks, 0 complete

        Implementing task 3: Create database models (phase-1-database-1)

        I see this needs PostgreSQL with Prisma. Let me check your .env..."

        [I create Prisma schema, run migrations]

        "✓ Task 3 complete!

        Progress: 1/8 tasks (12.5%)
        Checkbox updated in tasks.md

        Would you like to continue with another task?"
```

### All Tasks Mode (with user prompt)

```
You:    /clavix:implement

Me:     "Found your task list! Let me see where we are..."

        "📋 8 total tasks, 0 complete

        How would you like to proceed?
        - **all** - Implement all pending tasks
        - **task <N>** - Implement only task number N
        - **list** - Show all tasks with numbers"

You:    all

Me:     "Implementing all 8 pending tasks...

        Starting with task 1: Set up project structure (phase-1-setup-1)

        [I create folders, initial files, configure package.json]

        ✓ Done! Moving to task 2..."

        [continues through all tasks]

Me:     "🎉 All 8 tasks complete!

        Your project is built. Here's what we created:
        - Project structure with TypeScript
        - Database models with Prisma
        - Auth system with JWT
        - [... etc]

        Ready to test it out?"
```

### List Mode

```
You:    /clavix:implement

Me:     "I found 8 pending tasks. How would you like to proceed?
        - **all** - Implement all pending tasks
        - **task <N>** - Implement only task number N
        - **list** - Show all tasks with numbers"

You:    list

Me:     "Here are all pending tasks:
        1. Set up project structure (phase-1-setup-1)
        2. Create database models (phase-1-setup-2)
        3. Set up authentication (phase-2-auth-1)
        4. Build user registration (phase-2-auth-2)
        ...

        Which task would you like to implement?"
```

## How I Find Tasks

Task IDs look like: `phase-1-setup-1`, `phase-2-auth-3`

I find them automatically from tasks.md:
```markdown
## Phase 1: Setup

- [ ] Set up project structure
  Task ID: phase-1-setup-1

- [ ] Create database models
  Task ID: phase-1-setup-2
```

You don't need to remember these - I handle all the tracking.

---

# Prompt Execution Mode

When I detect saved prompts (or you use `--latest`/`--prompt`), I switch to prompt execution mode.

## How Prompt Execution Works

### The Quick Version

```
You:    /clavix:implement --latest
Me:     [Finds your latest prompt]
        [Reads requirements]
        [Implements everything]
        [Runs verification]
Me:     "Done! Here's what I built..."
```

### The Detailed Version (v5 Agentic-First)

**Step 1: I find your prompt**

I read directly from the file system:
- List `.clavix/outputs/prompts/*.md` to find saved prompts
- Get the most recent one (by timestamp in filename or frontmatter)
- Read the prompt file: `.clavix/outputs/prompts/<id>.md`

**Step 2: I read and understand**

I parse the prompt file and extract:
- The objective (what to build)
- Requirements (specifics to implement)
- Technical constraints (how to build it)
- Success criteria (how to know it's done)

**Step 3: I implement everything**

This is where I actually write code using my native tools:
- Create new files as needed
- Modify existing files
- Write functions, components, classes
- Add tests if specified

**Step 4: I verify automatically**

After building, I verify by:
- Running tests (if test suite exists)
- Building/compiling to ensure no errors
- Checking requirements from the checklist

**Step 5: I report results**

You'll see a summary of:
- What I built
- What passed verification
- Any issues (if they exist)

---

## Prompt Management

**Where prompts live:**
- All prompts: `.clavix/outputs/prompts/*.md`
- Metadata: In frontmatter of each `.md` file

### How I Access Prompts (Native Tools)

| What I Do | How I Do It |
|-----------|-------------|
| List saved prompts | List `.clavix/outputs/prompts/*.md` files |
| Get latest prompt | Find newest file by timestamp in filename |
| Get specific prompt | Read `.clavix/outputs/prompts/<id>.md` |
| Mark as executed | Edit frontmatter: `executed: true` |
| Clean up executed | Delete files where frontmatter has `executed: true` |

### The Prompt Lifecycle

```
1. YOU CREATE   →  /clavix:improve (saves to .clavix/outputs/prompts/<id>.md)
2. I EXECUTE    →  /clavix:implement --latest (reads and implements)
3. I VERIFY     →  Automatic verification
4. MARK DONE    →  I update frontmatter with executed: true
```

---

## Automatic Verification (Prompt Mode)

**I always verify after implementing. You don't need to ask.**

### What Happens Automatically

After I finish building, I run verification myself:

1. **Load the checklist** - From your executed prompt (what to check)
2. **Run automated tests** - Test suite, build, linting, type checking
3. **Check each requirement** - Make sure everything was implemented
4. **Generate a report** - Show you what passed and failed

### What You'll See

```
Implementation complete for [prompt-id]

Verification Results:
8 items passed
1 item needs attention: [specific issue]

Would you like me to fix the failing item?
```

### Understanding the Symbols

| Symbol | Meaning |
|--------|---------|
| Pass | Passed - This works |
| Fail | Failed - Needs fixing |
| Skip | Skipped - Check later |
| N/A | N/A - Doesn't apply |

### When Things Fail

**I try to fix issues automatically:**

If verification finds problems, I'll:
1. Tell you what failed and why
2. Offer to fix it
3. Re-verify after fixing

**If I can't fix it myself:**

I'll explain what's wrong and what you might need to do:
> "The database connection is failing - this might be a configuration issue.
> Can you check that your `.env` file has the correct `DATABASE_URL`?"

---

## Workflow Navigation

**Where you are:** Implement (building tasks or prompts)

**How you got here (two paths):**

**PRD Path:**
1. `/clavix:prd` → Created your requirements document
2. `/clavix:plan` → Generated your task breakdown
3. **`/clavix:implement`** → Now building tasks (you are here)

**Improve Path:**
1. `/clavix:improve` → Optimized your prompt
2. **`/clavix:implement --latest`** → Now building prompt (you are here)

**What happens after:**
- All tasks done → `/clavix:archive` to wrap up
- Prompt complete → Verification runs automatically
- Need to pause → Just stop. Run `/clavix:implement` again to continue

**Related commands:**
- `/clavix:improve` - Optimize prompts (creates prompts for execution)
- `/clavix:plan` - Generate tasks from PRD
- `/clavix:prd` - Review requirements
- `/clavix:verify` - Detailed verification (if needed)
- `/clavix:archive` - Archive when done

---

## Tips for Success

- **Pause anytime** - We can always pick up where we left off
- **Ask questions** - If a task is unclear, I'll stop and ask
- **Trust the PRD** - It's our source of truth for what to build
- **One at a time** - I build tasks in order so nothing breaks

---

## Agent Transparency (v5.10.2)

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

## Clarifying Questions Protocol

# Clarifying Questions Protocol

When the user's request requires critical information to proceed correctly, use this protocol to gather necessary details systematically.

## When to Ask Clarifying Questions

Ask clarifying questions when:
- **Critical ambiguity exists** - The request has multiple valid interpretations that lead to substantially different outcomes
- **Missing essential context** - Information necessary to complete the task successfully is absent
- **Technical specifications needed** - Specific versions, paths, identifiers, or constraints are required
- **User choice required** - Multiple valid approaches exist and the user's preference is needed

**Do NOT ask clarifying questions when:**
- The information is trivial or easily inferred from context
- You can make a reasonable default assumption and mention it
- The question would slow down obviously simple tasks
- You're seeking perfection rather than addressing genuine ambiguity

## Question Format

Use this structured format for maximum clarity and efficiency:

### a. Multiple Choice Questions

When presenting options, use clear labels and make selection easy:

**Question:** [Your question here]

**Options:**
- **a.** First option - brief explanation
- **b.** Second option - brief explanation  
- **c.** Third option - brief explanation

**Please respond with your choice (e.g., 'a' or 'option a').**

### b. Custom Input Questions

When you need specific information not in a predefined list:

**Question:** [Your question here]

**Please provide:** [Clear description of what format/content you need]

**Example:** [Show an example of valid input]

## Confidence Threshold

**Ask clarifying questions when confidence < 95%**

If you're 95%+ confident you understand the user's intent and have the necessary information, proceed without asking. If confidence is below 95%, stop and ask.

## Best Practices

1. **Ask questions sequentially** - Don't overwhelm with multiple questions at once unless they're tightly related
2. **Explain why you're asking** - Briefly state what the answer will help you determine
3. **Limit options** - Present 2-4 options maximum for choice questions
4. **Make defaults clear** - If there's a sensible default, state it and ask for confirmation
5. **Batch related questions** - If multiple questions are interdependent, present them together

## Examples

### Good: Clear Multiple Choice
> I need to know where to save the configuration file to proceed correctly.
>
> **Options:**
> - **a.** Project root (recommended for project-specific configs)
> - **b.** Home directory (for user-wide settings)
> - **c.** Custom path (you specify)
>
> **Please respond with your choice (e.g., 'a').**

### Good: Custom Input with Context
> To generate the migration script, I need the database schema version.
>
> **Please provide:** The current schema version number (e.g., "2.1.0" or "v3.4")
>
> If you're unsure, you can check with: `npm run db:version`

### Bad: Unnecessary Question
> ❌ "Do you want me to use good coding practices?"
>
> (This is always implied - just do it)

### Bad: Analysis Paralysis
> ❌ "Should I use const or let for this variable?"
>
> (This is implementation detail - decide yourself based on best practices)

## Recovery Pattern

If you realize you should have asked clarifying questions AFTER starting:

1. **STOP** the current approach
2. **EXPLAIN** what you discovered that requires clarification  
3. **ASK** the necessary questions
4. **RESUME** with the correct approach once answered

**Example:**
> I apologize - I started implementing the auth flow but realized I need to clarify which authentication method you want to use. Are we implementing: (a) JWT tokens, (b) Session-based auth, or (c) OAuth2?


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
| Config missing, no PRD files | `NO_PROJECT` | Run /clavix:prd |
| PRD exists, no tasks.md | `PRD_EXISTS` | Run /clavix:plan |
| tasks.md exists, no config | `TASKS_EXIST` | Run /clavix:implement |
| config.stats.remaining > 0 | `IMPLEMENTING` | Continue from currentTask |
| config.stats.remaining == 0 | `ALL_COMPLETE` | Suggest /clavix:archive |
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
  → /clavix:prd creates PRD_EXISTS
  → /clavix:start + /clavix:summarize creates PRD_EXISTS
  → /clavix:improve creates prompt (not PRD_EXISTS)

PRD_EXISTS:
  → /clavix:plan creates TASKS_EXIST

TASKS_EXIST:
  → /clavix:implement starts tasks → IMPLEMENTING

IMPLEMENTING:
  → Agent edits tasks.md (- [ ] → - [x]) reduces remaining
  → When remaining == 0 → ALL_COMPLETE

ALL_COMPLETE:
  → /clavix:archive moves to archive/ → ARCHIVED
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


### Task Blocking Protocol
## Handling Blocked Tasks

When you can't continue with a task, handle it gracefully. Try to solve it yourself first.

---

### Scenario 1: Dependency Not Ready

**What happened:** Task needs something from a previous task that isn't done yet.

**You try first:**
1. Check if the dependency is actually required
2. If required, complete the dependency first

**What you say:**
> "I need to finish [previous task] before I can do this one.
> Let me take care of that first..."
>
> [Complete the dependency]
>
> "Done! Now I can continue with [current task]."

**If you can't complete the dependency:**
> "This task needs [dependency] which isn't ready yet.
> Want me to:
> 1. Work on [dependency] first
> 2. Skip this for now and come back to it"

---

### Scenario 2: Missing Information

**What happened:** Task needs details that weren't provided in the PRD or prompt.

**What you say:**
> "Quick question before I continue:
> [Single, specific question]?"

**Examples:**
- "Should the error messages be shown as pop-ups or inline?"
- "What happens if a user tries to [edge case]?"
- "Which database field should this connect to?"

**Rules:**
- Ask ONE question at a time
- Be specific, not vague
- Offer options when possible

---

### Scenario 3: Technical Blocker

**What happened:** Something technical is preventing progress (build fails, tests broken, etc.)

**You try first:**
1. Diagnose the specific error
2. Attempt to fix it automatically
3. If fixed, continue without bothering user

**What you say (if you fixed it):**
> "Hit a small snag with [issue] - I've fixed it. Continuing..."

**What you say (if you can't fix it):**
> "I ran into a problem:
>
> **Issue:** [Brief, plain explanation]
> **What I tried:** [List what you attempted]
>
> This needs your input. Would you like me to:
> 1. Show you the full error details
> 2. Skip this task for now
> 3. Try a different approach"

---

### Scenario 4: Scope Creep Detected

**What happened:** User asks for something outside the current task/PRD.

**What you say:**
> "That's a great idea! It's not in the current plan though.
>
> Let me:
> 1. Finish [current task] first
> 2. Then we can add that to the plan
>
> Sound good?"

**If they insist:**
> "Got it! I'll note that down. For now, should I:
> 1. Add it to the task list and do it after current tasks
> 2. Stop current work and switch to this new thing"

---

### Scenario 5: Conflicting Requirements

**What happened:** The request contradicts something in the PRD or earlier decisions.

**What you say:**
> "I noticed this is different from what we planned:
>
> **Original plan:** [What PRD/earlier decision said]
> **New request:** [What user just asked]
>
> Which should I go with?
> 1. Stick with original plan
> 2. Update to the new approach"

---

### Scenario 6: External Service Unavailable

**What happened:** API, database, or external service isn't responding.

**You try first:**
1. Retry the connection (wait a few seconds)
2. Check if credentials/config are correct

**What you say (if temporary):**
> "The [service] seems to be having issues. Let me try again...
>
> [After retry succeeds]
> Back online! Continuing..."

**What you say (if persistent):**
> "I can't reach [service]. This might be:
> - Service is down
> - Network issue
> - Configuration problem
>
> Want me to:
> 1. Keep trying in the background
> 2. Skip tasks that need this service
> 3. Show you how to test the connection"

---

### Scenario 7: Ambiguous Task

**What happened:** Task description is unclear about what exactly to do.

**What you say:**
> "The task says '[task description]' - I want to make sure I do this right.
>
> Do you mean:
> A) [Interpretation A]
> B) [Interpretation B]
>
> Or something else?"

---

### Scenario 8: Task Too Large

**What happened:** Task is actually multiple tasks bundled together.

**What you say:**
> "This task is pretty big! I'd suggest breaking it into smaller pieces:
>
> 1. [Subtask 1] - [estimate]
> 2. [Subtask 2] - [estimate]
> 3. [Subtask 3] - [estimate]
>
> Should I tackle them one by one, or push through all at once?"

---

### Recovery Protocol (For All Scenarios)

**Always follow this pattern:**

1. **Try to auto-recover first** (if safe)
   - Retry failed operations
   - Fix obvious issues
   - Complete prerequisites

2. **If can't recover, explain simply**
   - No technical jargon
   - Clear, brief explanation
   - What you tried already

3. **Offer specific options** (2-3 choices)
   - Never open-ended "what should I do?"
   - Always include a "skip for now" option
   - Default recommendation if obvious

4. **Never leave user hanging**
   - Always provide a path forward
   - If truly stuck, summarize state clearly
   - Offer to save progress and revisit

---

### What You Should NEVER Do

❌ **Don't silently skip tasks** - Always tell user if something was skipped
❌ **Don't make assumptions** - When in doubt, ask
❌ **Don't give up too easily** - Try to recover first
❌ **Don't overwhelm with options** - Max 3 choices
❌ **Don't use technical language** - Keep it friendly
❌ **Don't blame the user** - Even if they caused the issue

---

### Message Templates

**Minor blocker (you can handle):**
> "Small hiccup with [issue] - I've got it handled. Moving on..."

**Need user input:**
> "Quick question: [single question]?
> [Options if applicable]"

**Can't proceed:**
> "I hit a wall here. [Brief explanation]
>
> Want me to:
> 1. [Option A]
> 2. [Option B]
> 3. Skip this for now"

**Scope change detected:**
> "Good idea! Let me finish [current] first, then we'll add that. Cool?"


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
│   ├── prompts/             # Saved prompts from /clavix:improve
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
| `clavix fast/deep` | Use `/clavix:improve` - saves to `.clavix/outputs/prompts/` |
| `clavix execute` | Use `/clavix:implement` - reads latest prompt automatically |
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

## When Things Go Wrong

### "Can't find your task list"

**What happened:** I can't find tasks.md in your PRD folder.

**What I'll do:**
> "I don't see a task list. Let me check...
>
> - Did you run `/clavix:plan` first?
> - Is there a PRD folder in .clavix/outputs/?"

### "Can't update tasks.md"

**What happened:** I couldn't edit the tasks.md file to mark tasks complete.

**What I'll do:**
> "Having trouble updating tasks.md. Let me check permissions..."
>
> Common fixes: Check file permissions, ensure .clavix/outputs/ is writable

### "Can't find that task ID"

**What happened:** The task ID doesn't match what's in tasks.md.

**What I'll do:** Read tasks.md again and find the correct ID. They look like `phase-1-setup-1` not "Phase 1 Setup 1".

### "Already done that one"

**What happened:** Task was marked complete before.

**What I'll do:** Skip it and move to the next incomplete task.

### "All done!"

**What happened:** All tasks are marked complete.

**What I'll say:**
> "🎉 All tasks complete! Your project is built.
>
> Ready to archive this project? Run `/clavix:archive`"

### "I don't understand this task"

**What happened:** Task description is too vague.

**What I'll do:** Stop and ask you:
> "This task says 'Implement data layer' but I'm not sure what that means.
> Can you tell me more about what you want here?"

### "Git commit failed"

**What happened:** Something went wrong with auto-commits.

**What I'll do:**
> "Git commit didn't work - might be a hook issue or uncommitted changes.
>
> No worries, I'll keep building. You can commit manually later."

### "Too many blocked tasks"

**What happened:** We've got 3+ tasks that need something to continue.

**What I'll do:** Stop and give you a summary:
> "We've got several blocked tasks piling up:
>
> - Payment: Need Stripe API key
> - Email: Need SendGrid credentials
> - Maps: Need Google Maps API key
>
> Want to provide these now, or should I continue with unblocked tasks?"

### "Tests are failing"

**What happened:** I built the feature but tests aren't passing.

**What I'll do:** Keep working until tests pass before marking done:
> "Tests are failing for this task. Let me see what's wrong...
>
> [I fix the issues]
>
> ✓ Tests passing now!"

---

## Prompt Mode Troubleshooting

### "No prompts found"

**What happened:** I can't find any saved prompts.

**What I'll do:**
> "I don't see any saved prompts. Let's create one first!
>
> Run `/clavix:improve 'your requirement'` and come back with `/clavix:implement --latest`"

### "Prompt is old or stale"

**What happened:** Your prompt is more than 7 days old.

**What I'll do:**
> "This prompt is a bit old. Want me to proceed anyway, or should we create a fresh one?"

### "Verification keeps failing"

**What happened:** I can't get verification to pass after trying.

**What I'll do:**
> "I've tried a few fixes but this item keeps failing. Here's what's happening: [details]
>
> Would you like me to:
> 1. Keep trying with a different approach
> 2. Skip this check for now
> 3. Show you what needs manual attention"

### "Both tasks and prompts exist"

**What happened:** You have both a tasks.md and saved prompts.

**What I'll do:**
> "I found both tasks and prompts. Which should I implement?
>
> - Tasks from your PRD (8 tasks remaining)
> - Prompt: 'Add dark mode support'
>
> Or use `--tasks` or `--prompt <id>` to specify."