/**
 * Critical Path Tests: Task Planning Flow
 *
 * Tests the planning workflow:
 * PRD -> Generate Tasks -> Read tasks.md -> Mark Complete -> Verify Changes
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mock dependencies
const mockPrompt = jest.fn();
jest.unstable_mockModule('inquirer', () => ({
  default: {
    prompt: mockPrompt,
  },
}));

const { TaskManager } = await import('../../src/core/task-manager.js');

describe('Critical Path: Task Planning Flow', () => {
  const testDir = path.join(__dirname, '../tmp/task-planning-test');
  const clavixDir = path.join(testDir, '.clavix');
  const tasksPath = path.join(clavixDir, 'tasks.md');
  let taskManager: InstanceType<typeof TaskManager>;

  beforeEach(async () => {
    await fs.ensureDir(clavixDir);
    process.chdir(testDir);
    taskManager = new TaskManager();
    jest.clearAllMocks();
  });

  afterEach(async () => {
    process.chdir(__dirname);
    await fs.remove(testDir);
  });

  /**
   * Helper to write a tasks.md file with proper format
   */
  async function writeTasksFile(content: string): Promise<void> {
    await fs.writeFile(tasksPath, content);
  }

  describe('tasks.md parsing', () => {
    it('should read and parse tasks from file', async () => {
      const tasksContent = `# Implementation Tasks

## Phase 1: Setup
- [ ] Initialize project
  Task ID: setup-1
- [ ] Configure dependencies
  Task ID: setup-2

## Phase 2: Development
- [ ] Implement feature A
  Task ID: dev-1
`;
      await writeTasksFile(tasksContent);

      const phases = await taskManager.readTasksFile(tasksPath);

      expect(phases).toHaveLength(2);
      expect(phases[0].name).toBe('Phase 1: Setup');
      expect(phases[0].tasks).toHaveLength(2);
      expect(phases[1].name).toBe('Phase 2: Development');
      expect(phases[1].tasks).toHaveLength(1);
    });

    it('should parse task IDs correctly', async () => {
      const tasksContent = `# Tasks

## Phase 1
- [ ] Task description here
  Task ID: phase-1-task-1
- [ ] Another task
  Task ID: phase-1-task-2
`;
      await writeTasksFile(tasksContent);

      const phases = await taskManager.readTasksFile(tasksPath);

      expect(phases[0].tasks[0].id).toBe('phase-1-task-1');
      expect(phases[0].tasks[1].id).toBe('phase-1-task-2');
    });

    it('should identify incomplete vs completed tasks', async () => {
      const tasksContent = `# Tasks

## Phase 1
- [ ] Incomplete task
  Task ID: task-1
- [x] Completed task
  Task ID: task-2
- [ ] Another incomplete
  Task ID: task-3
`;
      await writeTasksFile(tasksContent);

      const phases = await taskManager.readTasksFile(tasksPath);
      const tasks = phases[0].tasks;

      expect(tasks[0].completed).toBe(false);
      expect(tasks[1].completed).toBe(true);
      expect(tasks[2].completed).toBe(false);
    });

    it('should handle tasks with PRD references', async () => {
      const tasksContent = `# Tasks

## Phase 1
- [ ] Task with ref (ref: prd-section-1.2)
  Task ID: task-1
`;
      await writeTasksFile(tasksContent);

      const phases = await taskManager.readTasksFile(tasksPath);

      expect(phases[0].tasks[0].prdReference).toBe('prd-section-1.2');
    });
  });

  describe('find first incomplete task', () => {
    it('should find the first incomplete task', async () => {
      const tasksContent = `# Tasks

## Phase 1
- [x] Completed task
  Task ID: task-1
- [ ] First incomplete
  Task ID: task-2
- [ ] Second incomplete
  Task ID: task-3
`;
      await writeTasksFile(tasksContent);

      const phases = await taskManager.readTasksFile(tasksPath);
      const nextTask = taskManager.findFirstIncompleteTask(phases);

      expect(nextTask).toBeDefined();
      expect(nextTask?.id).toBe('task-2');
    });

    it('should return null when all tasks are complete', async () => {
      const tasksContent = `# Tasks

## Phase 1
- [x] Done 1
  Task ID: task-1
- [x] Done 2
  Task ID: task-2
`;
      await writeTasksFile(tasksContent);

      const phases = await taskManager.readTasksFile(tasksPath);
      const nextTask = taskManager.findFirstIncompleteTask(phases);

      expect(nextTask).toBeNull();
    });

    it('should find incomplete task across phases', async () => {
      const tasksContent = `# Tasks

## Phase 1
- [x] Done 1
  Task ID: p1-1
- [x] Done 2
  Task ID: p1-2

## Phase 2
- [ ] First incomplete in phase 2
  Task ID: p2-1
`;
      await writeTasksFile(tasksContent);

      const phases = await taskManager.readTasksFile(tasksPath);
      const nextTask = taskManager.findFirstIncompleteTask(phases);

      expect(nextTask?.id).toBe('p2-1');
    });
  });

  describe('task completion', () => {
    it('should mark task as complete', async () => {
      const tasksContent = `# Tasks

## Phase 1
- [ ] Task to complete
  Task ID: task-1
`;
      await writeTasksFile(tasksContent);

      await taskManager.markTaskCompleted(tasksPath, 'task-1');

      const content = await fs.readFile(tasksPath, 'utf-8');
      expect(content).toContain('[x] Task to complete');
    });

    it('should preserve other tasks when completing one', async () => {
      const tasksContent = `# Tasks

## Phase 1
- [ ] Task 1
  Task ID: task-1
- [ ] Task 2
  Task ID: task-2
- [ ] Task 3
  Task ID: task-3
`;
      await writeTasksFile(tasksContent);

      await taskManager.markTaskCompleted(tasksPath, 'task-2');

      const phases = await taskManager.readTasksFile(tasksPath);
      const tasks = phases[0].tasks;

      expect(tasks[0].completed).toBe(false);
      expect(tasks[1].completed).toBe(true);
      expect(tasks[2].completed).toBe(false);
    });

    it('should throw error for non-existent task', async () => {
      const tasksContent = `# Tasks

## Phase 1
- [ ] Only task
  Task ID: task-1
`;
      await writeTasksFile(tasksContent);

      await expect(taskManager.markTaskCompleted(tasksPath, 'non-existent')).rejects.toThrow(
        'Task not found'
      );
    });
  });

  describe('task statistics', () => {
    it('should calculate task statistics', async () => {
      const tasksContent = `# Tasks

## Phase 1
- [x] Done 1
  Task ID: t1
- [x] Done 2
  Task ID: t2
- [ ] Pending 1
  Task ID: t3
- [ ] Pending 2
  Task ID: t4
`;
      await writeTasksFile(tasksContent);

      const phases = await taskManager.readTasksFile(tasksPath);
      const stats = taskManager.getTaskStats(phases);

      expect(stats.total).toBe(4);
      expect(stats.completed).toBe(2);
      expect(stats.remaining).toBe(2);
    });

    it('should handle empty phases', async () => {
      const tasksContent = `# Tasks

## Empty Phase

## Another Empty Phase
`;
      await writeTasksFile(tasksContent);

      const phases = await taskManager.readTasksFile(tasksPath);
      const stats = taskManager.getTaskStats(phases);

      expect(stats.total).toBe(0);
      expect(stats.completed).toBe(0);
    });
  });

  describe('full planning lifecycle', () => {
    it('should complete full task planning cycle', async () => {
      // 1. Create initial tasks file
      const initialTasks = `# Implementation Tasks

## Phase 1: Setup
- [ ] Initialize repository
  Task ID: setup-1
- [ ] Configure build tools
  Task ID: setup-2

## Phase 2: Core Features
- [ ] Implement feature A
  Task ID: core-1
- [ ] Implement feature B
  Task ID: core-2
`;
      await writeTasksFile(initialTasks);

      // 2. Verify initial state
      let phases = await taskManager.readTasksFile(tasksPath);
      let stats = taskManager.getTaskStats(phases);
      expect(stats.total).toBe(4);
      expect(stats.completed).toBe(0);

      // 3. Get first incomplete task
      let nextTask = taskManager.findFirstIncompleteTask(phases);
      expect(nextTask?.id).toBe('setup-1');

      // 4. Complete tasks in order
      await taskManager.markTaskCompleted(tasksPath, 'setup-1');
      phases = await taskManager.readTasksFile(tasksPath);
      stats = taskManager.getTaskStats(phases);
      expect(stats.completed).toBe(1);

      await taskManager.markTaskCompleted(tasksPath, 'setup-2');
      phases = await taskManager.readTasksFile(tasksPath);
      stats = taskManager.getTaskStats(phases);
      expect(stats.completed).toBe(2);

      // 5. Get next task (should be from phase 2)
      nextTask = taskManager.findFirstIncompleteTask(phases);
      expect(nextTask?.id).toBe('core-1');

      // 6. Complete remaining tasks
      await taskManager.markTaskCompleted(tasksPath, 'core-1');
      await taskManager.markTaskCompleted(tasksPath, 'core-2');

      // 7. Verify completion
      phases = await taskManager.readTasksFile(tasksPath);
      stats = taskManager.getTaskStats(phases);
      expect(stats.total).toBe(4);
      expect(stats.completed).toBe(4);

      // 8. No more incomplete tasks
      const finalNext = taskManager.findFirstIncompleteTask(phases);
      expect(finalNext).toBeNull();
    });
  });

  describe('error handling', () => {
    it('should throw error for missing tasks file', async () => {
      // Don't create tasks.md
      await expect(taskManager.readTasksFile(tasksPath)).rejects.toThrow('Tasks file not found');
    });

    it('should handle empty file', async () => {
      await writeTasksFile('');

      const phases = await taskManager.readTasksFile(tasksPath);
      expect(phases).toEqual([]);
    });

    it('should handle file with only headers', async () => {
      await writeTasksFile(`# Tasks

## Phase 1

## Phase 2
`);

      const phases = await taskManager.readTasksFile(tasksPath);
      expect(phases.length).toBe(2);
      expect(phases[0].tasks).toEqual([]);
      expect(phases[1].tasks).toEqual([]);
    });
  });

  describe('backward compatibility', () => {
    it('should handle tasks without explicit Task ID line', async () => {
      // Old format without Task ID lines
      const oldFormatTasks = `# Tasks

## Phase-1
- [ ] First task
- [ ] Second task
`;
      await writeTasksFile(oldFormatTasks);

      const phases = await taskManager.readTasksFile(tasksPath);

      // Should generate IDs from phase name
      expect(phases[0].tasks[0].id).toBeDefined();
      expect(phases[0].tasks[1].id).toBeDefined();
    });
  });

  describe('verify task marked', () => {
    it('should verify task is marked as complete', async () => {
      const tasksContent = `# Tasks

## Phase 1
- [x] Completed task
  Task ID: task-1
`;
      await writeTasksFile(tasksContent);

      const isMarked = await taskManager.verifyTaskMarked(tasksPath, 'task-1');
      expect(isMarked).toBe(true);
    });

    it('should verify task is not marked', async () => {
      const tasksContent = `# Tasks

## Phase 1
- [ ] Incomplete task
  Task ID: task-1
`;
      await writeTasksFile(tasksContent);

      const isMarked = await taskManager.verifyTaskMarked(tasksPath, 'task-1');
      expect(isMarked).toBe(false);
    });
  });
});
