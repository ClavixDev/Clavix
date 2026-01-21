---
name: clavix-implement
description: Execute implementation tasks or saved prompts with progress tracking
license: Apache-2.0
---

# Clavix Implement Skill

Execute tasks from tasks.md or saved prompts with systematic progress tracking.

---

## State Assertion (REQUIRED)

**Before ANY action, output this confirmation:**

```
**CLAVIX MODE: Implementation**
Mode: implementation
Purpose: Executing tasks or prompts with code generation
Source: [tasks.md | prompts/ | user request]
Implementation: AUTHORIZED
```

---

## Self-Correction Protocol

**DETECT**: If you find yourself doing any of these mistake types:

| Type | What It Looks Like |
|------|--------------------|
| 1. Skipping Auto-Detection | Not checking for tasks.md and prompts/ before asking |
| 2. Implementing Without Reading | Starting code before reading the full task/prompt |
| 3. Skipping Verification | Not running tests after implementation |
| 4. Batch Task Completion | Marking multiple tasks done without implementing each |
| 5. Ignoring Blocked Tasks | Not reporting when a task cannot be completed |
| 6. Capability Hallucination | Claiming Clavix can do things it cannot |
| 7. Not Parsing Command | Not checking command for "task N" or "all" before asking |
| 8. Wrong Task Number | Not validating task number exists before implementing |

**STOP**: Immediately halt the incorrect action.

**CORRECT**: Output:
> "I apologize - I was [describe mistake]. Let me follow the correct protocol."

**RESUME**: Return to the proper workflow step.

---

## Detection Priority (CRITICAL)

```
/clavix-implement
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

---

## Required Confirmation Message

**Before starting ANY implementation, output a confirmation:**

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

---

## Task Selection Protocol (REQUIRED)

**When Task Implementation Mode is detected, MUST determine scope BEFORE starting:**

### Step 1: Parse the Command

Check command content for:
- `task <N>` pattern (e.g., "task 3", "task 5")
- `all` keyword
- If neither found → proceed to Step 2

### Step 2: If No Qualifier, ASK the User

> "I found [N] pending tasks in [project-name]. How would you like to proceed?
>
> Options:
> - **all** - Implement all pending tasks
> - **task <N>** - Implement only task number N (e.g., "task 3")
> - **list** - Show all tasks with numbers
>
> Which would you prefer?"

### Step 3: Handle Selection

- If `all` → Implement all pending tasks sequentially
- If `task N` → Validate N exists, implement only that task
- If `list` → Show numbered list of incomplete tasks, ask again

### Step 4: Confirm Before Starting

> "Found tasks.md with [N] pending tasks in [project-name].
>
> Mode: [ALL tasks | Single task #N: {task description}]
> Starting task implementation..."

---

## Task Execution Cycle

For each task, follow this cycle:

### 1. Read Task
- Parse task title and description
- Read the `> **Implementation**` block
- Read the `> **Details**` block

### 2. Check PRD (if needed)
- Reference original PRD for requirements context
- Ensure implementation matches requirements

### 3. Implement
- Write production-quality code
- Follow existing codebase patterns
- Create/modify files as specified in task

### 4. Mark Complete
- Edit tasks.md directly
- Change `- [ ]` to `- [x]`

### 5. Verify
- Run tests if available
- Check acceptance criteria
- If fails: present fix options

### 6. Next Task
- Find next incomplete task (`- [ ]`)
- Report progress
- Continue cycle

---

## Blocked Task Handling

**If a task cannot be completed, identify the blocker type:**

| Blocker Type | Example | Action |
|--------------|---------|--------|
| Dependency not ready | "Need API key" | Report and ask for guidance |
| Task unclear | "Implement data layer" (vague) | Ask for clarification |
| Technical blocker | "Library not installed" | Report and suggest fix |
| External dependency | "Waiting for design" | Skip, note in progress |

**When blocked, output:**
> "⚠️ Task {task-id} is blocked.
>
> **Reason**: {description}
> **Type**: {blocker type}
>
> Options:
> 1. Provide {what's needed}
> 2. Skip this task and continue
> 3. Clarify requirements
>
> What would you like to do?"

---

## Verification Protocol

After implementing each task:

1. **Run tests** (if available):
   ```bash
   npm test  # or appropriate test command
   ```

2. **Check acceptance criteria**:
   - Compare implementation to task requirements
   - Verify file paths match specification

3. **If verification fails**:
   > "Tests are failing for this task. Let me see what's wrong...
   >
   > [Analyze and fix issues]
   >
   > Options:
   > 1. I'll try to fix this
   > 2. Skip verification for now
   > 3. Show you what needs attention
   >
   > What would you prefer?"

---

## Progress Reporting Format

After each task completion:

```
✅ Task Complete: "{task title}"
   Task ID: {task-id}

Progress: [completed]/[total] tasks ([percentage]%)

📋 Completed:
- [x] {completed task 1}
- [x] {completed task 2}

⏳ Next: "{next task title}"
   Task ID: {next-task-id}

Continue? (y/n)
```

---

## Git Commit Options

**For projects with many tasks, offer commit strategy:**

> "You've got [N] tasks. Want me to create git commits as I go?
>
> Options:
> - **per-task**: Commit after each task (detailed history)
> - **per-phase**: Commit when phases complete (milestone commits)
> - **none**: I won't touch git (you handle commits)
>
> Which do you prefer? (I'll default to 'none' if you don't care)"

**Commit message format:**
```
feat({scope}): {task title}

Implements task {task-id}
- {change 1}
- {change 2}
```

---

## Prompt Execution Mode

**When using `--latest` flag or no tasks.md found:**

### Step 1: Locate Prompt
- Find latest prompt in `.clavix/outputs/prompts/`
- Sort by timestamp if multiple

### Step 2: Load and Confirm
> "Found prompt: {prompt-title}
>
> Created: {timestamp}
> Depth: {fast|deep}
>
> Implementing this prompt..."

### Step 3: Execute
- Parse improved prompt content
- Extract requirements
- Implement systematically

### Step 4: Mark Executed
Update prompt file frontmatter:
```yaml
executed: false  →  executed: true
```

---

## Mode Boundaries

**Do:**
- ✓ Read and understand task requirements
- ✓ Implement tasks from your task list
- ✓ Write production-quality code
- ✓ Follow PRD specifications
- ✓ Mark tasks complete automatically
- ✓ Create git commits (if requested)

**Don't:**
- ✗ Skip dependency checks
- ✗ Mark tasks complete without implementation
- ✗ Ignore acceptance criteria
- ✗ Skip verification step
- ✗ Implement tasks out of order without reason

---

## Workflow Navigation

**You are here:** Implementation (Code Execution)

**Pre-requisites**:
- A tasks.md (from `/clavix-plan`) OR
- A saved prompt (from `/clavix-improve`)

**Next Steps**:
- `/clavix-verify` - Verify implementation against PRD
- `/clavix-archive` - Archive completed project

---

## Troubleshooting

### "Can't find task list"
Check for:
- `.clavix/outputs/{project}/tasks.md`
- `.clavix/outputs/summarize/tasks.md` (legacy)

**If missing:** Run `/clavix-plan` first.

### "Can't find that task ID"
Read tasks.md again. Task IDs look like `phase-1-setup-01`, not "Phase 1 Setup 1".

### "Task already done"
Skip it and move to the next incomplete task.

### "All done!"
> "🎉 All tasks complete! Your project is built.
>
> Ready to verify? Run `/clavix-verify`
> Ready to archive? Run `/clavix-archive`"

### "I don't understand this task"
Stop and ask:
> "This task says '{vague description}' but I'm not sure what that means.
> Can you tell me more about what you want here?"

### "Tests are failing"
Keep working until tests pass before marking done. Don't mark incomplete work as complete.

### "Both tasks and prompts exist"
> "I found both tasks and prompts. Which should I implement?
>
> - Tasks from your PRD ({N} tasks remaining)
> - Prompt: '{prompt-title}'
>
> Or specify: `--tasks` or `--prompt <id>`"

---

## Example Workflow

```
User: /clavix-implement

Agent:
**CLAVIX MODE: Implementation**
Mode: implementation
Purpose: Executing tasks or prompts with code generation
Source: tasks.md
Implementation: AUTHORIZED

Found tasks.md with 8 pending tasks in my-project.

How would you like to proceed?
- all - Implement all pending tasks
- task <N> - Implement specific task
- list - Show all tasks

User: all

Agent:
Starting task implementation...

📋 Task 1/8: "Set up project structure"
Task ID: phase-1-setup-01

[Implements task...]

✅ Task Complete: "Set up project structure"
Progress: 1/8 tasks (12.5%)

⏳ Next: "Create database schema"
Task ID: phase-1-setup-02

Continue? (y/n)
```
