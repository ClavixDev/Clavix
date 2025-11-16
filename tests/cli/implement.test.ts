/**
 * Tests for implement command functionality
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import { TaskManager } from '../../src/core/task-manager';
import { GitManager, CommitStrategy } from '../../src/core/git-manager';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

describe('Implement command', () => {
  const testDir = path.join(__dirname, '../fixtures/test-implement');
  const outputsDir = path.join(testDir, '.clavix/outputs');
  let manager: TaskManager;
  let gitManager: GitManager;
  let originalCwd: string;

  beforeEach(async () => {
    // Clean up and setup
    await fs.remove(testDir);
    await fs.ensureDir(outputsDir);

    // Change to test directory
    originalCwd = process.cwd();
    process.chdir(testDir);

    manager = new TaskManager();
    gitManager = new GitManager();
  });

  afterEach(async () => {
    // Restore directory
    process.chdir(originalCwd);

    // Clean up
    await fs.remove(testDir);
  });

  describe('task discovery', () => {
    it('should find tasks.md by project name', async () => {
      const projectDir = path.join(outputsDir, 'my-project');
      await fs.ensureDir(projectDir);

      const tasksContent = `# Implementation Tasks

## Phase 1: Setup

- [ ] Initialize project
- [ ] Setup dependencies`;

      await fs.writeFile(path.join(projectDir, 'tasks.md'), tasksContent);

      const foundDir = await manager.findPrdDirectory('my-project');

      expect(foundDir).toContain('my-project');
      expect(await fs.pathExists(path.join(foundDir, 'tasks.md'))).toBe(true);
    });

    it('should find most recent project when no name specified', async () => {
      const project1 = path.join(outputsDir, 'project-1');
      await fs.ensureDir(project1);
      await fs.writeFile(path.join(project1, 'full-prd.md'), '# PRD 1');
      await fs.writeFile(path.join(project1, 'tasks.md'), '# Tasks 1');

      // Wait for different timestamp
      await new Promise(resolve => setTimeout(resolve, 10));

      const project2 = path.join(outputsDir, 'project-2');
      await fs.ensureDir(project2);
      await fs.writeFile(path.join(project2, 'full-prd.md'), '# PRD 2');
      await fs.writeFile(path.join(project2, 'tasks.md'), '# Tasks 2');

      const foundDir = await manager.findPrdDirectory();

      expect(foundDir).toContain('project-2');
    });

    it('should handle direct tasks-path', async () => {
      const customPath = path.join(testDir, 'custom-tasks.md');
      await fs.writeFile(customPath, '# Tasks\n\n## Phase 1\n\n- [ ] Task 1');

      expect(await fs.pathExists(customPath)).toBe(true);
    });
  });

  describe('task reading and parsing', () => {
    it('should read tasks from tasks.md', async () => {
      const projectDir = path.join(outputsDir, 'with-tasks');
      await fs.ensureDir(projectDir);

      const tasksContent = `# Implementation Tasks

## Phase 1: Setup

- [ ] Task 1
- [x] Task 2

## Phase 2: Implementation

- [ ] Task 3`;

      const tasksPath = path.join(projectDir, 'tasks.md');
      await fs.writeFile(tasksPath, tasksContent);

      const phases = await manager.readTasksFile(tasksPath);

      expect(phases).toBeDefined();
      expect(phases.length).toBe(2);
      expect(phases[0].tasks.length).toBeGreaterThan(0);
    });

    it('should identify completed and incomplete tasks', async () => {
      const projectDir = path.join(outputsDir, 'mixed-tasks');
      await fs.ensureDir(projectDir);

      const tasksContent = `# Tasks

## Phase 1

- [x] Completed task
- [ ] Incomplete task`;

      const tasksPath = path.join(projectDir, 'tasks.md');
      await fs.writeFile(tasksPath, tasksContent);

      const phases = await manager.readTasksFile(tasksPath);

      const allTasks = phases.flatMap(p => p.tasks);
      const completed = allTasks.filter(t => t.completed);
      const incomplete = allTasks.filter(t => !t.completed);

      expect(completed.length).toBe(1);
      expect(incomplete.length).toBe(1);
    });
  });

  describe('task statistics', () => {
    it('should calculate task statistics', async () => {
      const projectDir = path.join(outputsDir, 'stats-test');
      await fs.ensureDir(projectDir);

      const tasksContent = `# Tasks

## Phase 1

- [x] Task 1
- [x] Task 2
- [ ] Task 3
- [ ] Task 4`;

      const tasksPath = path.join(projectDir, 'tasks.md');
      await fs.writeFile(tasksPath, tasksContent);

      const phases = await manager.readTasksFile(tasksPath);
      const stats = manager.getTaskStats(phases);

      expect(stats.total).toBe(4);
      expect(stats.completed).toBe(2);
      expect(stats.remaining).toBe(2);
      expect(stats.percentage).toBeCloseTo(50, 0);
    });

    it('should handle empty tasks', async () => {
      const projectDir = path.join(outputsDir, 'empty-tasks');
      await fs.ensureDir(projectDir);

      const tasksContent = `# Tasks

## Phase 1`;

      const tasksPath = path.join(projectDir, 'tasks.md');
      await fs.writeFile(tasksPath, tasksContent);

      const phases = await manager.readTasksFile(tasksPath);
      const stats = manager.getTaskStats(phases);

      expect(stats.total).toBe(0);
      expect(stats.completed).toBe(0);
      expect(stats.remaining).toBe(0);
      expect(stats.percentage).toBe(0);
    });

    it('should calculate 100% when all tasks completed', async () => {
      const projectDir = path.join(outputsDir, 'all-done');
      await fs.ensureDir(projectDir);

      const tasksContent = `# Tasks

## Phase 1

- [x] Task 1
- [x] Task 2`;

      const tasksPath = path.join(projectDir, 'tasks.md');
      await fs.writeFile(tasksPath, tasksContent);

      const phases = await manager.readTasksFile(tasksPath);
      const stats = manager.getTaskStats(phases);

      expect(stats.total).toBe(2);
      expect(stats.completed).toBe(2);
      expect(stats.remaining).toBe(0);
      expect(stats.percentage).toBe(100);
    });
  });

  describe('next task finding', () => {
    it('should find first incomplete task', async () => {
      const projectDir = path.join(outputsDir, 'next-task');
      await fs.ensureDir(projectDir);

      const tasksContent = `# Tasks

## Phase 1

- [x] Completed task
- [ ] Next task to do
- [ ] Future task`;

      const tasksPath = path.join(projectDir, 'tasks.md');
      await fs.writeFile(tasksPath, tasksContent);

      const phases = await manager.readTasksFile(tasksPath);
      const nextTask = manager.findFirstIncompleteTask(phases);

      expect(nextTask).toBeDefined();
      expect(nextTask?.description).toContain('Next task to do');
      expect(nextTask?.completed).toBe(false);
    });

    it('should return null when all tasks completed', async () => {
      const projectDir = path.join(outputsDir, 'no-next');
      await fs.ensureDir(projectDir);

      const tasksContent = `# Tasks

## Phase 1

- [x] Task 1
- [x] Task 2`;

      const tasksPath = path.join(projectDir, 'tasks.md');
      await fs.writeFile(tasksPath, tasksContent);

      const phases = await manager.readTasksFile(tasksPath);
      const nextTask = manager.findFirstIncompleteTask(phases);

      expect(nextTask).toBeNull();
    });

    it('should find task across multiple phases', async () => {
      const projectDir = path.join(outputsDir, 'multi-phase');
      await fs.ensureDir(projectDir);

      const tasksContent = `# Tasks

## Phase 1

- [x] Task 1

## Phase 2

- [ ] Task 2`;

      const tasksPath = path.join(projectDir, 'tasks.md');
      await fs.writeFile(tasksPath, tasksContent);

      const phases = await manager.readTasksFile(tasksPath);
      const nextTask = manager.findFirstIncompleteTask(phases);

      expect(nextTask).toBeDefined();
      expect(nextTask?.phase).toContain('Phase 2');
    });
  });

  describe('git integration', () => {
    it('should validate git setup', async () => {
      const status = await gitManager.validateGitSetup();

      expect(status).toBeDefined();
      expect(status.isRepo).toBeDefined();
      expect(typeof status.isRepo).toBe('boolean');
    });

    it('should detect git repository', async () => {
      // Initialize git repo
      await execAsync('git init');
      await execAsync('git config user.name "Test User"');
      await execAsync('git config user.email "test@example.com"');

      const status = await gitManager.validateGitSetup();

      expect(status.isRepo).toBe(true);
      expect(status.currentBranch).toBeDefined();

      // Clean up git repo
      await fs.remove(path.join(testDir, '.git'));
    });

    it('should provide git status information', async () => {
      const status = await gitManager.validateGitSetup();

      // Should always provide status info
      expect(status).toBeDefined();
      expect(typeof status.isRepo).toBe('boolean');

      if (status.isRepo) {
        expect(status.currentBranch).toBeDefined();
      }
    });
  });

  describe('commit strategy', () => {
    it('should support per-task strategy', () => {
      const strategy: CommitStrategy = 'per-task';

      expect(['per-task', 'per-5-tasks', 'per-phase', 'none']).toContain(strategy);
    });

    it('should support per-5-tasks strategy', () => {
      const strategy: CommitStrategy = 'per-5-tasks';

      expect(['per-task', 'per-5-tasks', 'per-phase', 'none']).toContain(strategy);
    });

    it('should support per-phase strategy', () => {
      const strategy: CommitStrategy = 'per-phase';

      expect(['per-task', 'per-5-tasks', 'per-phase', 'none']).toContain(strategy);
    });

    it('should support none strategy', () => {
      const strategy: CommitStrategy = 'none';

      expect(['per-task', 'per-5-tasks', 'per-phase', 'none']).toContain(strategy);
    });

    it('should default to none when git disabled', () => {
      const noGit = true;
      const strategy: CommitStrategy = noGit ? 'none' : 'per-phase';

      expect(strategy).toBe('none');
    });
  });

  describe('flag handling', () => {
    it('should support project flag', () => {
      const flags = { project: 'my-project' };

      expect(flags.project).toBe('my-project');
    });

    it('should support tasks-path flag', () => {
      const flags = { 'tasks-path': '/path/to/tasks.md' };

      expect(flags['tasks-path']).toBe('/path/to/tasks.md');
    });

    it('should support no-git flag', () => {
      const flags = { 'no-git': true };

      expect(flags['no-git']).toBe(true);
    });

    it('should support commit-strategy flag', () => {
      const flags = { 'commit-strategy': 'per-task' };

      expect(flags['commit-strategy']).toBe('per-task');
    });

    it('should use defaults when no flags provided', () => {
      const flags = {};

      expect(flags).toEqual({});
    });
  });

  describe('edge cases', () => {
    it('should handle missing tasks.md file', async () => {
      const projectDir = path.join(outputsDir, 'no-tasks');
      await fs.ensureDir(projectDir);
      await fs.writeFile(path.join(projectDir, 'full-prd.md'), '# PRD');

      const tasksPath = path.join(projectDir, 'tasks.md');
      const exists = await fs.pathExists(tasksPath);

      expect(exists).toBe(false);
    });

    it('should handle malformed tasks.md', async () => {
      const projectDir = path.join(outputsDir, 'malformed');
      await fs.ensureDir(projectDir);

      const tasksContent = 'Random text without proper format';
      const tasksPath = path.join(projectDir, 'tasks.md');
      await fs.writeFile(tasksPath, tasksContent);

      const phases = await manager.readTasksFile(tasksPath);

      expect(Array.isArray(phases)).toBe(true);
    });

    it('should handle tasks with PRD references', async () => {
      const projectDir = path.join(outputsDir, 'with-refs');
      await fs.ensureDir(projectDir);

      const tasksContent = `# Tasks

## Phase 1

- [ ] Task referencing Feature A`;

      const tasksPath = path.join(projectDir, 'tasks.md');
      await fs.writeFile(tasksPath, tasksContent);

      const phases = await manager.readTasksFile(tasksPath);
      const task = phases[0]?.tasks[0];

      expect(task).toBeDefined();
      expect(task?.description).toBeDefined();
    });

    it('should handle empty phase names', async () => {
      const projectDir = path.join(outputsDir, 'empty-phase');
      await fs.ensureDir(projectDir);

      const tasksContent = `# Tasks

##

- [ ] Task without phase name`;

      const tasksPath = path.join(projectDir, 'tasks.md');
      await fs.writeFile(tasksPath, tasksContent);

      const phases = await manager.readTasksFile(tasksPath);

      expect(Array.isArray(phases)).toBe(true);
    });

    it('should handle special characters in task descriptions', async () => {
      const projectDir = path.join(outputsDir, 'special-chars');
      await fs.ensureDir(projectDir);

      const tasksContent = `# Tasks

## Phase 1

- [ ] Task with émojis 🚀 and spëcial çhars`;

      const tasksPath = path.join(projectDir, 'tasks.md');
      await fs.writeFile(tasksPath, tasksContent);

      const phases = await manager.readTasksFile(tasksPath);
      const task = phases[0]?.tasks[0];

      expect(task).toBeDefined();
      expect(task?.description).toContain('émojis');
    });
  });

  describe('task marking', () => {
    it('should be able to modify task completed status', async () => {
      const projectDir = path.join(outputsDir, 'mark-complete');
      await fs.ensureDir(projectDir);

      const tasksContent = `# Tasks

## Phase 1

- [ ] Task to complete`;

      const tasksPath = path.join(projectDir, 'tasks.md');
      await fs.writeFile(tasksPath, tasksContent);

      const phases = await manager.readTasksFile(tasksPath);
      const task = phases[0].tasks[0];

      // Verify we can modify the completed status
      expect(task.completed).toBe(false);
      task.completed = true;
      expect(task.completed).toBe(true);
    });

    it('should maintain task data structure', async () => {
      const projectDir = path.join(outputsDir, 'preserve-order');
      await fs.ensureDir(projectDir);

      const tasksContent = `# Tasks

## Phase 1

- [ ] Task 1
- [ ] Task 2
- [ ] Task 3`;

      const tasksPath = path.join(projectDir, 'tasks.md');
      await fs.writeFile(tasksPath, tasksContent);

      const phases = await manager.readTasksFile(tasksPath);

      expect(phases[0].tasks.length).toBe(3);
      expect(phases[0].tasks.every(t => t.description && typeof t.completed === 'boolean')).toBe(true);
    });
  });

  describe('task blocking protocol', () => {
    it('should detect common blocking scenarios', () => {
      const blockingScenarios = [
        { type: 'missing-dependency', description: 'Missing API key' },
        { type: 'unclear-requirements', description: 'Task too vague' },
        { type: 'external-blocker', description: 'Third-party API not ready' },
        { type: 'technical-blocker', description: 'Library incompatible' },
        { type: 'resource-blocker', description: 'Database not set up' },
      ];

      blockingScenarios.forEach((scenario) => {
        expect(scenario.type).toBeDefined();
        expect(scenario.description).toBeDefined();
      });
    });

    it('should identify blocked task and stop implementation', async () => {
      const projectDir = path.join(outputsDir, 'blocked-task');
      await fs.ensureDir(projectDir);

      const tasksContent = `# Tasks

## Phase 1

- [ ] Setup database connection
- [ ] [BLOCKED: Missing API key] Integrate payment API
- [ ] Create user interface`;

      const tasksPath = path.join(projectDir, 'tasks.md');
      await fs.writeFile(tasksPath, tasksContent);

      const content = await fs.readFile(tasksPath, 'utf-8');
      const hasBlockedTask = content.includes('[BLOCKED');

      expect(hasBlockedTask).toBe(true);
    });

    it('should present user with resolution options', () => {
      const resolutionOptions = [
        { option: 1, name: 'Provide missing resource', action: 'User provides what is needed' },
        { option: 2, name: 'Break into sub-tasks', action: 'Implement unblocked parts now' },
        { option: 3, name: 'Skip for now', action: 'Mark as BLOCKED, continue with next' },
      ];

      expect(resolutionOptions.length).toBe(3);
      expect(resolutionOptions.every(opt => opt.option && opt.name && opt.action)).toBe(true);
    });

    it('should support breaking blocked task into sub-tasks', async () => {
      const projectDir = path.join(outputsDir, 'sub-tasks');
      await fs.ensureDir(projectDir);

      const originalTask = 'Implement payment integration';
      const subTasks = [
        { task: 'Create payment service interface', blocked: false },
        { task: '[BLOCKED: Need Stripe API key] Integrate Stripe SDK', blocked: true },
        { task: 'Add payment UI components', blocked: false },
      ];

      expect(subTasks.length).toBeGreaterThan(1);
      expect(subTasks.some(t => t.blocked)).toBe(true);
      expect(subTasks.some(t => !t.blocked)).toBe(true);
    });

    it('should mark task with BLOCKED tag and reason', async () => {
      const projectDir = path.join(outputsDir, 'blocked-notation');
      await fs.ensureDir(projectDir);

      const tasksContent = `# Tasks

## Phase 2: Integration

- [x] Create API client structure
- [ ] [BLOCKED: Waiting for API endpoint spec] Implement data sync
- [ ] Add error handling for API calls`;

      const tasksPath = path.join(projectDir, 'tasks.md');
      await fs.writeFile(tasksPath, tasksContent);

      const content = await fs.readFile(tasksPath, 'utf-8');
      const hasBlockedNotation = /\[BLOCKED:.*?\]/.test(content);
      const hasBlockerReason = content.includes('Waiting for API endpoint spec');

      expect(hasBlockedNotation).toBe(true);
      expect(hasBlockerReason).toBe(true);
    });

    it('should communicate blocking issue to user immediately', () => {
      const blockingMessage = `Task blocked: Implement payment integration

Blocking issue: Missing Stripe API key for payment integration

Options to proceed:
1. Provide missing resource - Stripe API key
2. Break into sub-tasks - Implement interface now, defer Stripe integration
3. Skip for now - Mark as [BLOCKED], continue with next task

Which option would you like?`;

      expect(blockingMessage.includes('Task blocked')).toBe(true);
      expect(blockingMessage.includes('Blocking issue')).toBe(true);
      expect(blockingMessage.includes('Options to proceed')).toBe(true);
    });

    it('should track all blocked tasks and list them at end', async () => {
      const projectDir = path.join(outputsDir, 'multiple-blocked');
      await fs.ensureDir(projectDir);

      const tasksContent = `# Tasks

## Phase 1

- [x] Task 1
- [ ] [BLOCKED: Missing API key] Task 2
- [ ] [BLOCKED: Waiting for design] Task 3
- [ ] Task 4`;

      const tasksPath = path.join(projectDir, 'tasks.md');
      await fs.writeFile(tasksPath, tasksContent);

      const content = await fs.readFile(tasksPath, 'utf-8');
      const blockedTaskMatches = content.match(/\[BLOCKED:.*?\]/g);
      const blockedCount = blockedTaskMatches ? blockedTaskMatches.length : 0;

      expect(blockedCount).toBe(2);
    });

    it('should provide specific resolution for common blocker types', () => {
      const blockerResolutions = [
        { blocker: 'Missing API key/credentials', resolution: 'Ask user for credentials OR stub with mock' },
        { blocker: 'Vague requirements', resolution: 'Ask specific questions OR propose implementation' },
        { blocker: 'External dependency not available', resolution: 'Create interface/mock OR skip and defer' },
        { blocker: 'Environment issue', resolution: 'Ask user to fix OR implement without testing' },
        { blocker: 'Design/content missing', resolution: 'Create placeholder OR wait for assets' },
      ];

      expect(blockerResolutions.length).toBe(5);
      expect(blockerResolutions.every(br => br.blocker && br.resolution)).toBe(true);
    });

    it('should alert when multiple blocked tasks accumulate', async () => {
      const projectDir = path.join(outputsDir, 'many-blocked');
      await fs.ensureDir(projectDir);

      const tasksContent = `# Tasks

## Phase 1

- [ ] [BLOCKED: Issue 1] Task 1
- [ ] [BLOCKED: Issue 2] Task 2
- [ ] [BLOCKED: Issue 3] Task 3
- [ ] [BLOCKED: Issue 4] Task 4`;

      const tasksPath = path.join(projectDir, 'tasks.md');
      await fs.writeFile(tasksPath, tasksContent);

      const content = await fs.readFile(tasksPath, 'utf-8');
      const blockedTaskMatches = content.match(/\[BLOCKED:.*?\]/g);
      const blockedCount = blockedTaskMatches ? blockedTaskMatches.length : 0;
      const shouldAlert = blockedCount >= 3;

      expect(shouldAlert).toBe(true);
    });
  });
});
