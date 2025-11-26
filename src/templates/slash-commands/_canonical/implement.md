---
name: "Clavix: Implement"
description: Execute tasks from the implementation plan
---

# Clavix: Implement Your Tasks

Time to build your project task by task! I'll work through your task list, building each feature and tracking progress.

---

## What This Does

When you run `/clavix:implement`, I:
1. **Find your task list** - Load tasks.md from your PRD output
2. **Pick up where you left off** - Find the next incomplete task
3. **Build each task** - Implement one at a time, in order
4. **Mark progress automatically** - Update checkboxes when done
5. **Create commits (optional)** - Git history as you go

**You just say "let's build" and I handle the rest.**

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

**First time I run:**

1. **I check for your task list** - Load tasks.md from your PRD folder
2. **I ask about git commits** (only if you have lots of tasks):
   > "You've got 12 tasks. Want me to create git commits as I go?
   >
   > Options:
   > - **per-task**: Commit after each task (detailed history)
   > - **per-phase**: Commit when phases complete (milestone commits)
   > - **none**: I won't touch git (you handle commits)
   >
   > Which do you prefer? (I'll default to 'none' if you don't care)"

3. **I initialize tracking** - Run `clavix implement` to set up progress tracking
4. **I start building** - First incomplete task

**Each task I work on:**

1. **Read the task** - Understand what needs to be built
2. **Check the PRD** - Make sure I understand the requirements
3. **Implement it** - Write code, create files, build features
4. **Mark it complete** - Run `clavix task-complete {task-id}` automatically
5. **Move to next** - The command shows me what's next

**If we get interrupted:**

No problem! Just run `/clavix:implement` again and I pick up where we left off.
The checkboxes in tasks.md track exactly what's done.

## ⚠️ Critical Command: task-complete

**After finishing EACH task, I MUST run:**
```bash
clavix task-complete <task-id>
```

**Why this matters:**
- Updates tasks.md automatically (checkboxes)
- Tracks progress correctly in config
- Triggers git commits (if enabled)
- Shows me the next task

**NEVER manually edit tasks.md checkboxes** - always use this command.

---

## How I Mark Tasks Complete

**I handle this automatically - you don't need to do anything.**

### What Happens Behind the Scenes

After I finish implementing a task, I run:
```bash
clavix task-complete {task-id}
```

This does several things:
- Updates the checkbox in tasks.md ([ ] → [x])
- Tracks progress in the config file
- Creates a git commit (if you enabled that)
- Shows me the next task

### Why I Don't Edit Checkboxes Manually

The command keeps everything in sync. If I edited the file directly, the progress tracking could get confused. Trust the system!

### What You'll See

```
✓ Task complete: "Set up project structure" (phase-1-setup-1)

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

Need to see what projects exist or check progress? I use these commands:

| What I Need | Command I Run |
|-------------|---------------|
| See all projects | `clavix list` |
| Check a specific project | `clavix show --output <project>` |
| See active sessions | `clavix list --sessions` |
| Find archived work | `clavix list --archived` |

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

```
You:    /clavix:implement

Me:     "Found your task list! Let me see where we are..."

        "📋 Progress: 0/8 tasks complete

        Starting with: Set up project structure (phase-1-setup-1)

        Let me build this..."

        [I create folders, initial files, configure package.json]

        "✓ Done! Setting up next task..."

        "Working on: Create database models (phase-1-database-1)

        I see this needs PostgreSQL with Prisma. Let me check your .env..."

        [I create Prisma schema, run migrations]

        "✓ Done! 2/8 tasks complete (25%)

        Next: Set up authentication..."

        [... continues through all tasks ...]

Me:     "🎉 All 8 tasks complete!

        Your project is built. Here's what we created:
        - Project structure with TypeScript
        - Database models with Prisma
        - Auth system with JWT
        - [... etc]

        Ready to test it out?"
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

## Workflow Navigation

**Where you are:** Implement (building your tasks)

**How you got here:**
1. `/clavix:prd` → Created your requirements document
2. `/clavix:plan` → Generated your task breakdown
3. **`/clavix:implement`** → Now building everything (you are here)

**What happens after:**
- All tasks done → `/clavix:archive` to wrap up
- Need to pause → Just stop. Run `/clavix:implement` again to continue

**Related commands:**
- `/clavix:plan` - Regenerate tasks if needed
- `/clavix:prd` - Review requirements
- `/clavix:archive` - Archive when done

---

## Tips for Success

- **Pause anytime** - We can always pick up where we left off
- **Ask questions** - If a task is unclear, I'll stop and ask
- **Trust the PRD** - It's our source of truth for what to build
- **One at a time** - I build tasks in order so nothing breaks

---

## Agent Transparency (v4.9)

### Workflow State Detection
{{INCLUDE:agent-protocols/state-awareness.md}}

### Error Handling
{{INCLUDE:agent-protocols/error-handling.md}}

### Task Blocking Protocol
{{INCLUDE:agent-protocols/task-blocking.md}}

### CLI Reference (Commands I Execute)
{{INCLUDE:agent-protocols/cli-reference.md}}

### Agent Decision Rules
{{INCLUDE:agent-protocols/decision-rules.md}}

### Recovery Patterns
{{INCLUDE:troubleshooting/vibecoder-recovery.md}}

---

## When Things Go Wrong

### "Can't find your task list"

**What happened:** I can't find tasks.md in your PRD folder.

**What I'll do:**
> "I don't see a task list. Let me check...
>
> - Did you run `/clavix:plan` first?
> - Is there a PRD folder in .clavix/outputs/?"

### "Task command not working"

**What happened:** The `clavix task-complete` command isn't recognized.

**What I'll do:**
> "Having trouble with the task command. Let me check your Clavix version..."
>
> If it's outdated, I'll suggest: "Try `npm install -g clavix@latest` to update"

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
