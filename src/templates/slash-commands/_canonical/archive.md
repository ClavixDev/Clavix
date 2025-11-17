---
name: "Clavix: Archive"
description: Archive completed PRD projects
---

# Clavix Archive - PRD Project Archival

> **⚠️ Agent Execution Note**: This command requires CLI execution. AI agents should run `clavix archive` via Bash tool to perform archival operations. Direct file manipulation is not recommended due to state tracking complexity.

You are helping the user archive completed PRD projects to keep their workspace organized.

## Instructions

### Part A: Agent Execution Protocol

**As an AI agent, you should:**

1. **Run the CLI command** to handle archival operations:
   ```bash
   clavix archive
   ```

   The CLI will:
   - Prompt user for project selection
   - Validate task completion status
   - Handle file operations safely
   - Update state tracking

2. **Choose the appropriate mode** based on user intent:

   - **Interactive mode** (no arguments): User selects from list
   - **Specific project**: `clavix archive [project-name]`
   - **Force archive incomplete**: `clavix archive [project-name] --force`
   - **Permanent delete**: `clavix archive [project-name] --delete`
   - **List archived**: `clavix archive --list`
   - **Restore**: `clavix archive --restore [project-name]`

3. **Before running the command**, validate:
   - Check if `.clavix/outputs/` directory exists
   - Verify user intent (archive vs delete vs restore)
   - Confirm project name if specified

4. **After CLI completes**, communicate results:
   - Confirm where project was moved
   - Mention restoration is possible (unless deleted)
   - Update user on next steps

### Part B: Understanding Archive Operations

**Archive Modes**:

1. **Interactive Archive Mode**:
   ```bash
   clavix archive
   ```

   CLI behavior:
   - Lists all PRD projects with 100% tasks completed
   - Allows user to select which project to archive
   - Confirms before archiving
   - Moves the project to archive directory

2. **Archive Specific Project**:
   ```bash
   clavix archive [project-name]
   ```

   CLI behavior:
   - Checks task completion status
   - Warns if tasks are incomplete
   - Asks for confirmation
   - Archives the specific project

3. **Force Archive (Incomplete Tasks)**:
   ```bash
   clavix archive [project-name] --force
   ```

   Use when:
   - Project scope changed and some tasks are no longer relevant
   - User wants to archive work-in-progress
   - Tasks are incomplete but project is done

4. **Delete Project (Permanent Removal)**: **DESTRUCTIVE ACTION**
   ```bash
   clavix archive [project-name] --delete
   ```

   **WARNING**: This PERMANENTLY deletes the project. Cannot be restored.

   **When to delete vs archive:**
   - **DELETE**: Failed experiments, duplicate projects, test/demo data, abandoned prototypes with no value
   - **ARCHIVE**: Completed work, incomplete but potentially useful work, anything you might reference later

   **Delete decision tree:**
   ```
   Is this a failed experiment with no learning value? → DELETE
   Is this a duplicate/test project with no unique info? → DELETE
   Might you need to reference this code later? → ARCHIVE
   Could this be useful for learning/reference? → ARCHIVE
   Are you unsure? → ARCHIVE (safe default)
   ```

   **Safety confirmation required:**
   - Shows project details and task status
   - Requires typing project name to confirm
   - Warns about permanent deletion
   - Lists what will be permanently deleted

5. **List Archived Projects**:
   ```bash
   clavix archive --list
   ```

   Shows all projects currently in archive with their task completion status

6. **Restore from Archive**:
   ```bash
   clavix archive --restore [project-name]
   ```

   Moves a project back from archive to active outputs

## When to Archive

**Good times to archive:**
- All implementation tasks are completed (`tasks.md` shows 100%)
- Project has been deployed/shipped to production
- Feature is complete and no more work planned
- User explicitly requests archival
- Old/abandoned projects that won't be continued

**Don't archive when:**
- Tasks are still in progress (unless using --force)
- Project is actively being worked on
- Future enhancements are planned in current tasks

## Archive Behavior

**What gets archived:**
- The entire PRD project folder
- All files: PRD.md, PRD-quick.md, tasks.md, .clavix-implement-config.json
- Complete directory structure preserved

**Where it goes:**
- From: `.clavix/outputs/[project-name]/`
- To: `.clavix/outputs/archive/[project-name]/`

**What changes:**
- Archived projects won't show in `/clavix:plan` searches
- Archived projects won't show in `/clavix:implement` searches
- They're still accessible in archive directory
- Can be restored at any time

## Example Workflows

### Workflow 1: Complete Project
```
User: "I've finished implementing the user authentication feature"
You: "Great! Let me help you archive it."

     Run: clavix archive

User selects: user-authentication-system
System shows: All 15 tasks completed (100%)
User confirms: Yes, archive it

Result: Project moved to .clavix/outputs/archive/user-authentication-system/
```

### Workflow 2: Force Archive WIP
```
User: "We're pivoting, I want to archive the old API design even though tasks aren't done"
You: "I'll archive it with --force"

     Run: clavix archive old-api-design --force

System shows: 8 incomplete tasks
User confirms: Yes, archive anyway

Result: Project archived despite incomplete tasks
```

### Workflow 3: Restore Archived Project
```
User: "Actually, we need to revisit that authentication feature"
You: "I'll restore it from the archive"

     Run: clavix archive --restore user-authentication-system

Result: Project moved back to .clavix/outputs/user-authentication-system/
```

### Workflow 4: Delete Failed Experiment
```
User: "I have a test project 'api-experiment-1' that I don't need anymore"
You: "Is this something you might reference later, or can it be permanently deleted?"

User: "It was just a quick test, no value. Delete it."
You: "This will permanently delete the project. I'll run the delete command."

     Run: clavix archive api-experiment-1 --delete

System shows:
  Project: api-experiment-1
  Tasks: 3/5 completed
  Files: full-prd.md, quick-prd.md, tasks.md

  WARNING: This action is PERMANENT and CANNOT be undone.
  Type the project name to confirm deletion: _

User types: api-experiment-1

Result: Project permanently deleted from .clavix/outputs/api-experiment-1/
```

## AI Agent Guidelines

When user mentions archiving or cleaning up projects:

1. **Validate prerequisites before running CLI**:
   - Check if `.clavix/outputs/` directory exists
   - If not, inform user no projects exist to archive
   - Verify user intent (list, archive, restore, delete)

2. **Check completion status first**:
   - Run `clavix archive` (interactive mode) to see archivable projects
   - CLI will display projects with completion percentages
   - Review output and communicate options to user

3. **Execute the appropriate command**:
   - **Interactive selection**: `clavix archive` (let user pick from list)
   - **Specific project**: `clavix archive [project-name]`
   - **Force incomplete**: `clavix archive [project-name] --force`
   - **List archived**: `clavix archive --list`
   - **Restore**: `clavix archive --restore [project-name]`
   - **Delete**: `clavix archive [project-name] --delete` (with extra caution)

4. **Confirm before archiving**:
   - If using specific project mode, confirm project name with user
   - Mention the archive location (`.clavix/outputs/archive/`)
   - Explain that restoration is possible

5. **Use --force cautiously**:
   - Only when user explicitly wants to archive incomplete work
   - Run command and let CLI show incomplete task count
   - CLI will ask for user confirmation
   - Explain they won't lose data (just moving location)

6. **Suggest restoration when appropriate**:
   - If user mentions old/past work, check archive first
   - Run `clavix archive --list` to show what's archived
   - Offer to restore if needed via `clavix archive --restore [project]`

7. **Handle delete requests with extreme caution**:
   - Always ask: "Do you want to DELETE (permanent) or ARCHIVE (safe)?"
   - Explain that delete is permanent and irreversible
   - Suggest archive as the safer default
   - Use decision tree to help user decide
   - Only run `--delete` after clear confirmation from user
   - Double-check it's truly no-value content (failed experiments, duplicates, test data)
   - CLI will require typing project name to confirm - this is expected

8. **After CLI execution**:
   - Communicate success/failure clearly
   - Mention next steps (e.g., "Project archived, you can restore with `/clavix:archive --restore`")
   - If error occurs, explain and suggest recovery options

## Workflow Navigation

**You are here:** Archive (Project Cleanup)

**Common workflows:**
- **Complete workflow**: `/clavix:implement` → [all tasks done] → `/clavix:archive` → Clean workspace
- **Review and archive**: `/clavix:archive` → [select completed project] → Archive
- **Restore old work**: `/clavix:archive --list` → `/clavix:archive --restore [project]` → Resume

**Related commands:**
- `/clavix:implement` - Complete remaining tasks before archiving
- `/clavix:plan` - Review task completion status
- `/clavix:prd` - Start new project after archiving old one

## Tips

- Archive keeps your active projects list clean and focused
- Archived projects maintain all their data (nothing is deleted)
- Archive is searchable - you can still `grep` or find files in archive/
- Regular archiving improves `/clavix:plan` and `/clavix:implement` performance
- Use `--list` regularly to know what's been archived

## Troubleshooting

### Issue: No projects available to archive
**Cause**: No projects in `.clavix/outputs/` OR all already archived

**Agent recovery**:
1. Check if `.clavix/outputs/` exists: `ls .clavix/outputs/`
2. If directory doesn't exist: "No PRD projects found. Create one with `/clavix:prd`"
3. If empty: Run `clavix archive --list` to show archived projects
4. Communicate: "All projects are already archived" or "No projects exist yet"

### Issue: Trying to archive project with incomplete tasks
**Cause**: User wants to archive but tasks aren't 100% done

**Agent recovery**:
1. CLI will warn about incomplete tasks
2. Ask user: "Project has X incomplete tasks. Do you want to:
   - Complete tasks first with `/clavix:implement`
   - Archive anyway with `--force` (tasks remain incomplete but archived)
   - Cancel archival"
3. If user confirms force: Run `clavix archive [project] --force`
4. If scope changed: Explain `--force` is appropriate

### Issue: Cannot restore archived project (name conflict)
**Cause**: Project with same name already exists in active outputs

**Agent recovery**:
1. CLI will show error: "Project '[name]' already exists in active outputs"
2. Ask user which option:
   - Archive the active project first, then restore old one
   - Keep both (manual rename required)
   - Cancel restoration
3. Execute user's choice

### Issue: Unsure whether to delete or archive
**Cause**: User wants to clean up but uncertain about permanence

**Agent recovery**:
1. Use decision tree to guide user:
   ```
   Ask user questions:
   - "Is this a failed experiment with no learning value?"
   - "Might you need to reference this code later?"
   - "Are you unsure if it's valuable?"
   ```
2. Default recommendation: **ARCHIVE** (safer, reversible)
3. Only suggest DELETE for: duplicates, failed experiments, test data with zero value
4. Remind: "Archive is free, disk space is cheap, regret is expensive"

### Issue: CLI command fails or hangs
**Cause**: File system permissions, missing directory, or process error

**Agent recovery**:
1. Check error output from CLI
2. Common fixes:
   - Check `.clavix/outputs/` exists and is writable
   - Verify project name is correct (no typos)
   - Check if another process is accessing the files
3. Suggest: Run with full project path or retry
4. If persistent: Inform user to check file permissions

### Issue: Accidentally deleted project (used --delete instead of archive)
**Cause**: User error or misunderstanding of --delete flag

**Agent recovery**:
1. Acknowledge: "Project was permanently deleted via `--delete` flag"
2. Check recovery options:
   - "If code was committed to git, we can recover from git history"
   - "Check if you have local backups"
   - "Check if IDE has local history (VS Code, JetBrains)"
3. Prevention: "Going forward, use ARCHIVE by default. Only DELETE when absolutely certain."
4. No recovery possible from Clavix itself

### Issue: Archive directory getting too large
**Cause**: Many archived projects accumulating

**Agent response**:
1. Explain: "Archive is designed to grow - this is normal behavior"
2. Archived projects don't affect active command performance
3. If user truly concerned:
   - Review archive: `clavix archive --list`
   - Identify ancient/irrelevant projects
   - Delete only truly obsolete ones: `clavix archive [old-project] --delete`
   - Or suggest external backup for very old projects

### Issue: Archived project but forgot what it was about
**Cause**: No naming convention or time passed

**Agent recovery**:
1. Read the PRD to remind user:
   ```bash
   cat .clavix/outputs/archive/[project-name]/full-prd.md
   ```
2. Summarize: Problem, Goal, Features from PRD
3. Suggest: Better naming conventions going forward
   - Example: `2024-01-user-auth` (date-feature format)
   - Example: `ecommerce-checkout-v2` (project-component format)
