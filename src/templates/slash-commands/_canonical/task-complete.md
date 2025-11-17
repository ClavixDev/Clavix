---
name: "Clavix: Task Complete"
description: Mark a task as completed with validation and optional git commit
---

# Clavix Task Complete - Mark Implementation Task Done

You are helping the user mark a task as completed during implementation workflow.

## Instructions

1. **Prerequisites**:
   - User must have run `clavix implement` to start implementation
   - `.clavix-implement-config.json` must exist in PRD folder
   - `tasks.md` must be generated from `clavix plan`

2. **Verify the task ID**:

   a. **Read tasks.md** to find the task ID:
      - Task IDs are in format: `**phase-1-feature-1**`
      - Located before each task description
      - Example: `- [ ] **phase-1-auth-1** - Implement user authentication`

   b. **Confirm with user** if task ID is unclear:
      ```
      I see these incomplete tasks:
      - phase-1-auth-1: Implement user authentication
      - phase-1-auth-2: Add password reset flow

      Which task did you complete? (or provide task ID)
      ```

3. **Mark task as completed**:

   **Run the CLI command**:
   ```bash
   clavix task-complete <task-id>
   ```

   **Examples**:
   ```bash
   clavix task-complete phase-1-auth-1
   clavix task-complete phase-2-api-3
   clavix task-complete setup-1
   ```

4. **The command will automatically**:
   - Validate task exists in tasks.md
   - Mark checkbox as `[x]` in tasks.md
   - Update config file with completion tracking
   - Show progress statistics (X/Y tasks completed)
   - Create git commit (if strategy enabled and conditions met)
   - Display next incomplete task

5. **Git auto-commit behavior**:

   The command respects the git strategy configured in `clavix implement`:

   - **`none`** (default): No automatic commits
   - **`per-task`**: Creates commit after this completion
   - **`per-5-tasks`**: Creates commit if 5 tasks completed (modulo 5 == 0)
   - **`per-phase`**: Creates commit if all tasks in current phase are done

   **Override for specific task**:
   ```bash
   clavix task-complete phase-1-auth-1 --no-git
   ```
   Skips git commit even if strategy is enabled (useful for experimental changes).

6. **Handle command output**:

   a. **Success case**:
   ```
   ✓ Task marked as completed
   ✓ Configuration updated

   Progress:
     Completed: 5/20 tasks (25%)
     Remaining: 15 tasks

   Next Task:
     ID: phase-1-auth-2
     Add password reset flow
     Reference: Full PRD section "Authentication > Password Reset"
   ```

   b. **Already completed case**:
   ```
   ⚠ Task "phase-1-auth-1" is already marked as completed

   Use --force to re-mark this task as completed.

   Next Task:
     ID: phase-1-auth-2
     ...
   ```

   c. **All tasks complete**:
   ```
   ✓ Task marked as completed
   🎉 All tasks completed!

   Great work! All implementation tasks are done.

   Hint: Run "clavix archive" to archive this project
   ```

7. **After task completion**:

   a. **If more tasks remaining**:
      - Acknowledge the completion
      - Ask user: "Ready to start the next task? [display next task description]"
      - Or: "Would you like to implement the next task now?"

   b. **If all tasks complete**:
      - Congratulate the user
      - Suggest running `clavix archive` to archive the project
      - Ask if they want to create a final git commit or tag

8. **Error recovery**:

   **If task ID not found**:
   ```
   ✗ Task ID "phase-1-invalid" not found

   Available task IDs:
     Phase 1: Authentication
       [ ] phase-1-auth-1 - Implement user authentication
       [ ] phase-1-auth-2 - Add password reset flow
   ```

   - The command lists all available tasks
   - Ask user to verify task ID
   - Or ask which task they meant to complete

   **If config file not found**:
   ```
   No config files found.

   Hint: Run "clavix implement" first to initialize
   ```

   - Tell user to run `clavix implement` first
   - This starts the implementation workflow

   **If file write error**:
   ```
   ✗ Failed to mark task as completed

   Recovery Options:
     1. Check if tasks.md file is readable and writable
     2. Verify task ID matches exactly
     3. Try running with --force flag
     4. Check tasks.md.backup file if created
   ```

   - Follow recovery suggestions
   - Check file permissions
   - Ask user if they manually edited tasks.md

## Command Flags

- `--no-git`: Skip git commit even if strategy is enabled
- `-f, --force`: Force completion even if already marked complete
- `-c, --config <path>`: Specify custom config file path (defaults to auto-discover)

## Best Practices

1. **Never manually edit tasks.md checkboxes** - Always use `clavix task-complete`
2. **Verify task completion** - Ensure implementation is done before marking
3. **Use --no-git for experiments** - Skip commits for work-in-progress changes
4. **Check next task** - Command automatically shows what to work on next
5. **Track progress** - Use progress stats to estimate remaining work

## Related Commands

- `clavix implement` - Start implementation workflow (shows current task)
- `clavix plan` - Generate tasks.md from PRD
- `clavix archive` - Archive completed project (run after all tasks done)

## Next Steps

After completing all tasks:
1. Run `clavix archive` to archive the implementation
2. Create final git commit or tag
3. Update CHANGELOG if needed
4. Merge feature branch
5. Deploy or release
