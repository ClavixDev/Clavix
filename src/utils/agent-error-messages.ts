/**
 * Error messages optimized for AI agent consumption
 *
 * All messages follow these principles:
 * - Programmatically actionable (no "ask user to..." language)
 * - List recovery options explicitly
 * - Provide context for decision-making
 * - Avoid conversational tone in favor of structured guidance
 */

export class AgentErrorMessages {
  /**
   * Error: No PRD artifacts found in .clavix/outputs/
   * Used by: plan.ts, implement.ts
   */
  static noPrdFound(): string {
    return (
      'No PRD artifacts found in .clavix/outputs/\n\n' +
      'Agent recovery options:\n' +
      '  1. Execute /clavix:prd to generate comprehensive PRD\n' +
      '  2. Execute /clavix:summarize if conversation exists\n' +
      '  3. Check .clavix/sessions/ if saved session available\n\n' +
      'Select option and execute, then retry this command.'
    );
  }

  /**
   * Error: No tasks.md found for specified project
   * Used by: implement.ts
   */
  static noTasksFound(projectName: string): string {
    return (
      `No tasks.md found for project: ${projectName}\n\n` +
      'Agent recovery options:\n' +
      `  1. Execute /clavix:plan to generate task breakdown\n` +
      '  2. Or read PRD and generate tasks.md manually\n\n' +
      'After task generation completes, retry implementation.'
    );
  }

  /**
   * Error: .clavix-implement-config.json not found
   * Used by: task-complete.ts, implement workflow
   */
  static configNotFound(): string {
    return (
      'Configuration file not found: .clavix-implement-config.json\n\n' +
      'Agent recovery:\n' +
      '  1. Execute /clavix:implement to initialize implementation\n' +
      '  2. Config will be created automatically\n' +
      '  3. Then retry task completion\n\n' +
      'This is expected on first run.'
    );
  }

  /**
   * Error: Specified task ID not found in tasks.md
   * Used by: task-complete.ts
   */
  static taskNotFound(
    taskId: string,
    availableTasks: Array<{ id: string; description: string; completed: boolean }>
  ): string {
    const taskList = availableTasks
      .map((t) => {
        const status = t.completed ? '[x]' : '[ ]';
        return `  ${status} ${t.id} - ${t.description}`;
      })
      .join('\n');

    return (
      `Task ID not found: ${taskId}\n\n` +
      'Available task IDs:\n' +
      taskList +
      '\n\n' +
      'Select a valid task ID from the list above and retry.'
    );
  }

  /**
   * Error: Archive validation failed (prerequisites not met)
   * Used by: archive.ts
   */
  static archiveValidationFailed(reason: string): string {
    return (
      `Archive validation failed: ${reason}\n\n` +
      'Agent recovery options:\n' +
      '  1. Check task completion status\n' +
      '  2. Use --force flag if project is truly complete\n' +
      '  3. Or complete remaining tasks first\n\n' +
      'Ensure prerequisites are met before archiving.'
    );
  }

  /**
   * Error: File operation failed (write, read, move, delete)
   * Used by: Multiple commands performing file operations
   */
  static fileOperationFailed(
    operation: 'read' | 'write' | 'move' | 'delete',
    path: string,
    error?: string
  ): string {
    const errorDetail = error ? `\nError: ${error}` : '';

    return (
      `File operation failed: ${operation} at ${path}${errorDetail}\n\n` +
      'Agent recovery options:\n' +
      '  1. Verify path exists and is correct\n' +
      '  2. Check file/directory permissions\n' +
      '  3. Ensure no other process is accessing the file\n' +
      '  4. Check available disk space\n\n' +
      'Fix the underlying issue and retry.'
    );
  }

  /**
   * Error: Multiple PRD projects found, need user selection
   * Used by: plan.ts, implement.ts when --project not specified
   */
  static multiplePrdsFound(projects: string[]): string {
    const projectList = projects.map((p, i) => `  ${i + 1}. ${p}`).join('\n');

    return (
      'Multiple PRD projects found:\n\n' +
      projectList +
      '\n\n' +
      'Agent recovery options:\n' +
      '  1. Specify project explicitly: --project <name>\n' +
      '  2. Or run CLI in interactive mode to let user select\n\n' +
      'Cannot proceed without project selection.'
    );
  }

  /**
   * Error: tasks.md already exists with progress
   * Used by: plan.ts when generating tasks
   */
  static tasksExistWithProgress(completedCount: number, totalCount: number): string {
    return (
      `tasks.md already exists with progress: ${completedCount}/${totalCount} tasks completed\n\n` +
      'Agent recovery options:\n' +
      '  1. Keep existing tasks.md and edit manually\n' +
      '  2. Use --overwrite flag to regenerate (progress will be lost)\n' +
      '  3. Cancel plan generation\n\n' +
      'Ask user which option to proceed with.'
    );
  }

  /**
   * Error: Git repository not initialized
   * Used by: implement.ts, task-complete.ts when git features expected
   */
  static gitNotInitialized(): string {
    return (
      'Git repository not detected\n\n' +
      'Auto-commit features are disabled.\n\n' +
      'To enable git integration:\n' +
      '  1. Run: git init\n' +
      '  2. Or use --no-git flag to skip git features\n\n' +
      'Proceeding without git auto-commit.'
    );
  }

  /**
   * Error: No archivable projects found
   * Used by: archive.ts
   */
  static noArchivableProjects(): string {
    return (
      'No archivable projects found\n\n' +
      'Possible reasons:\n' +
      '  • No PRD projects in .clavix/outputs/\n' +
      '  • All projects already archived\n' +
      '  • No projects with completed tasks\n\n' +
      'Agent recovery options:\n' +
      '  1. List .clavix/outputs/archive/ to see archived projects\n' +
      '  2. Check .clavix/outputs/ for active projects\n' +
      '  3. Or create new PRD with /clavix:prd'
    );
  }

  /**
   * Error: Restoration failed due to name conflict
   * Used by: archive.ts --restore
   */
  static restoreConflict(projectName: string): string {
    return (
      `Restoration conflict: Project "${projectName}" already exists in active outputs\n\n` +
      'Agent recovery options:\n' +
      '  1. Archive the active project first\n' +
      '  2. Manually rename one of the projects\n' +
      '  3. Cancel restoration\n\n' +
      'Ask user which option to proceed with.'
    );
  }

  /**
   * Error: CLI command execution failed
   * Used by: When running CLI commands via Bash tool
   */
  static cliExecutionFailed(command: string, exitCode: number, stderr?: string): string {
    const errorDetail = stderr ? `\n\nError output:\n${stderr}` : '';

    return (
      `CLI command failed: ${command}\n` +
      `Exit code: ${exitCode}${errorDetail}\n\n` +
      'Agent recovery options:\n' +
      '  1. Check command syntax is correct\n' +
      '  2. Verify Clavix is installed: clavix --version\n' +
      '  3. Check for error details above\n' +
      '  4. Retry with corrected parameters\n\n' +
      'Fix the issue and retry.'
    );
  }

  /**
   * Error: Invalid task ID format
   * Used by: task-complete.ts
   */
  static invalidTaskIdFormat(taskId: string): string {
    return (
      `Invalid task ID format: ${taskId}\n\n` +
      'Expected format: phase-{number}-{sanitized-phase-name}-{counter}\n\n' +
      'Examples:\n' +
      '  • phase-1-setup-1\n' +
      '  • phase-2-user-authentication-3\n' +
      '  • phase-3-api-integration-1\n\n' +
      'Check tasks.md for correct task IDs and retry.'
    );
  }

  /**
   * Error: Session not found
   * Used by: Commands using --session flag
   */
  static sessionNotFound(sessionId: string): string {
    return (
      `Session not found: ${sessionId}\n\n` +
      'Agent recovery options:\n' +
      '  1. Verify session ID is correct\n' +
      '  2. List available sessions (if supported)\n' +
      '  3. Use --active-session flag for current session\n' +
      '  4. Or generate PRD without session\n\n' +
      'Session may have expired or never existed.'
    );
  }

  /**
   * Warning: Task already completed
   * Used by: task-complete.ts when marking already-done task
   */
  static taskAlreadyCompleted(taskId: string): string {
    return (
      `Task already completed: ${taskId}\n\n` +
      'This task is marked as [x] in tasks.md.\n\n' +
      'Agent options:\n' +
      '  1. Proceed to next incomplete task\n' +
      '  2. Use --force to mark again (updates tracking)\n' +
      '  3. Check if this was intended\n\n' +
      'No action needed unless forced.'
    );
  }
}
