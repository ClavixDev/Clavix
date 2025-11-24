/**
 * Task-Complete Command Tests
 *
 * Direct tests for the TaskComplete CLI command class.
 * Mocks TaskManager, ConfigManager, GitManager, and fs-extra.
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import fs from 'fs-extra';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { createTestDir, cleanupTestDir } from '../../helpers/cli-helpers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// Mock Setup - Must be BEFORE imports
// ============================================================================

// Create mock functions
const mockReadTasksFile = jest.fn<() => Promise<any[]>>();
const mockValidateTaskExists = jest.fn<() => any>();
const mockMarkTaskCompletedWithValidation = jest.fn<() => Promise<any>>();
const mockGetTaskStats = jest.fn<() => any>();
const mockFindFirstIncompleteTask = jest.fn<() => any>();
const mockConfigRead = jest.fn<() => Promise<any>>();
const mockConfigUpdate = jest.fn<() => Promise<void>>();
const mockTrackCompletion = jest.fn<() => Promise<void>>();
const mockIsTaskCompleted = jest.fn<() => Promise<boolean>>();
const mockValidateGitSetup = jest.fn<() => Promise<any>>();
const mockCreateCommit = jest.fn<() => Promise<boolean>>();
const mockPathExists = jest.fn<() => Promise<boolean>>();
const mockReaddir = jest.fn<() => Promise<any[]>>();
const mockStat = jest.fn<() => Promise<any>>();

// Mock TaskManager
jest.unstable_mockModule('../../../src/core/task-manager.js', () => ({
  TaskManager: jest.fn().mockImplementation(() => ({
    readTasksFile: mockReadTasksFile,
    validateTaskExists: mockValidateTaskExists,
    markTaskCompletedWithValidation: mockMarkTaskCompletedWithValidation,
    getTaskStats: mockGetTaskStats,
    findFirstIncompleteTask: mockFindFirstIncompleteTask,
  })),
}));

// Mock ConfigManager
jest.unstable_mockModule('../../../src/core/config-manager.js', () => ({
  ConfigManager: jest.fn().mockImplementation(() => ({
    read: mockConfigRead,
    update: mockConfigUpdate,
    trackCompletion: mockTrackCompletion,
    isTaskCompleted: mockIsTaskCompleted,
  })),
}));

// Mock GitManager
jest.unstable_mockModule('../../../src/core/git-manager.js', () => ({
  GitManager: jest.fn().mockImplementation(() => ({
    validateGitSetup: mockValidateGitSetup,
    createCommit: mockCreateCommit,
  })),
}));

// Mock fs-extra (partial mock)
jest.unstable_mockModule('fs-extra', () => ({
  default: {
    pathExists: mockPathExists,
    readdir: mockReaddir,
    stat: mockStat,
    ensureDir: jest.fn().mockResolvedValue(undefined),
  },
}));

// ============================================================================
// Import command AFTER mocks
// ============================================================================

const { default: TaskComplete } = await import('../../../src/cli/commands/task-complete.js');

// ============================================================================
// Test Helpers
// ============================================================================

/**
 * Create mock task phases
 */
function createMockPhases() {
  return [
    {
      name: 'Phase 1: Setup',
      tasks: [
        {
          id: 'task-1',
          description: 'Initialize project',
          phase: 'Phase 1: Setup',
          completed: true,
        },
        {
          id: 'task-2',
          description: 'Configure environment',
          phase: 'Phase 1: Setup',
          completed: false,
        },
      ],
    },
    {
      name: 'Phase 2: Implementation',
      tasks: [
        {
          id: 'task-3',
          description: 'Build login page',
          phase: 'Phase 2: Implementation',
          completed: false,
        },
        {
          id: 'task-4',
          description: 'Add authentication',
          phase: 'Phase 2: Implementation',
          completed: false,
        },
      ],
    },
  ];
}

/**
 * Create mock task
 */
function createMockTask(overrides: Partial<any> = {}) {
  return {
    id: 'task-2',
    description: 'Configure environment',
    phase: 'Phase 1: Setup',
    completed: false,
    prdReference: 'Section 2.1',
    ...overrides,
  };
}

/**
 * Create mock config
 */
function createMockConfig(overrides: Partial<any> = {}) {
  return {
    tasksPath: '.clavix/outputs/test-project/tasks.md',
    commitStrategy: 'none',
    completedTaskIds: ['task-1'],
    stats: { total: 4, completed: 1, remaining: 3, percentage: 25 },
    ...overrides,
  };
}

/**
 * Run TaskComplete command with proper mocking
 */
async function runTaskCompleteCommand(
  args: string[] = []
): Promise<{ stdout: string; stderr: string; exitCode: number; error?: Error }> {
  let stdout = '';
  let stderr = '';
  let exitCode = 0;
  let caughtError: Error | undefined;

  const mockOclifConfig = {
    runHook: jest.fn().mockResolvedValue({ successes: [], failures: [] }),
    bin: 'clavix',
    dirname: 'clavix',
    pjson: { version: '1.0.0' },
    plugins: [],
    topicSeparator: ' ',
  };

  const cmd = new TaskComplete(args, mockOclifConfig as any);

  const logSpy = jest.spyOn(console, 'log').mockImplementation((...logArgs) => {
    stdout += logArgs.map((a) => String(a)).join(' ') + '\n';
  });
  const errorSpy = jest.spyOn(console, 'error').mockImplementation((...errArgs) => {
    stderr += errArgs.map((a) => String(a)).join(' ') + '\n';
  });

  try {
    await cmd.run();
  } catch (err: any) {
    exitCode = 1;
    caughtError = err;
    if (err.message) {
      stderr += err.message + '\n';
    }
  } finally {
    logSpy.mockRestore();
    errorSpy.mockRestore();
  }

  return { stdout, stderr, exitCode, error: caughtError };
}

// ============================================================================
// Tests
// ============================================================================

describe('TaskComplete Command', () => {
  let testDir: string;
  let originalCwd: string;

  beforeEach(async () => {
    // Reset all mocks
    jest.clearAllMocks();

    // Setup test directory
    testDir = await createTestDir('task-complete-cmd-test');
    originalCwd = process.cwd();
    process.chdir(testDir);

    // Initialize .clavix directory
    await fs.ensureDir(path.join(testDir, '.clavix', 'outputs', 'test-project'));

    // Setup default mock behaviors
    mockReadTasksFile.mockResolvedValue(createMockPhases());
    mockValidateTaskExists.mockReturnValue(createMockTask());
    mockMarkTaskCompletedWithValidation.mockResolvedValue({
      success: true,
      alreadyCompleted: false,
    });
    mockGetTaskStats.mockReturnValue({ total: 4, completed: 2, remaining: 2, percentage: 50 });
    mockFindFirstIncompleteTask.mockReturnValue(
      createMockTask({ id: 'task-3', description: 'Build login page' })
    );
    mockConfigRead.mockResolvedValue(createMockConfig());
    mockConfigUpdate.mockResolvedValue(undefined);
    mockTrackCompletion.mockResolvedValue(undefined);
    mockIsTaskCompleted.mockResolvedValue(false);
    mockValidateGitSetup.mockResolvedValue({
      isRepo: true,
      hasChanges: true,
      currentBranch: 'main',
    });
    mockCreateCommit.mockResolvedValue(true);
    mockPathExists.mockResolvedValue(true);
    mockReaddir.mockResolvedValue([{ name: 'test-project', isDirectory: () => true }]);
    mockStat.mockResolvedValue({ mtime: new Date() });
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    await cleanupTestDir(testDir);
  });

  // ==========================================================================
  // Basic Flow Tests
  // ==========================================================================

  describe('basic flow', () => {
    it('should display header with task ID', async () => {
      const result = await runTaskCompleteCommand(['task-2']);

      expect(result.stdout).toContain('Task Completion');
      expect(result.stdout).toContain('task-2');
    });

    it('should mark task as completed', async () => {
      await runTaskCompleteCommand(['task-2']);

      expect(mockMarkTaskCompletedWithValidation).toHaveBeenCalled();
    });

    it('should display success message', async () => {
      const result = await runTaskCompleteCommand(['task-2']);

      expect(result.stdout).toContain('Task marked as completed');
    });

    it('should update configuration', async () => {
      await runTaskCompleteCommand(['task-2']);

      expect(mockTrackCompletion).toHaveBeenCalled();
      expect(mockConfigUpdate).toHaveBeenCalled();
    });

    it('should display progress after completion', async () => {
      const result = await runTaskCompleteCommand(['task-2']);

      expect(result.stdout).toContain('Progress');
      expect(result.stdout).toContain('Completed');
    });

    it('should show next task after completion', async () => {
      const result = await runTaskCompleteCommand(['task-2']);

      expect(result.stdout).toContain('Next Task');
      expect(result.stdout).toContain('task-3');
    });
  });

  // ==========================================================================
  // Task Not Found Tests
  // ==========================================================================

  describe('task not found', () => {
    it('should error when task not found', async () => {
      mockValidateTaskExists.mockReturnValue(null);

      const result = await runTaskCompleteCommand(['non-existent']);

      expect(result.exitCode).toBe(1);
      expect(result.stdout).toContain('not found');
    });

    it('should show available task IDs when not found', async () => {
      mockValidateTaskExists.mockReturnValue(null);

      const result = await runTaskCompleteCommand(['non-existent']);

      expect(result.stdout).toContain('Available task IDs');
    });

    it('should list tasks from all phases when not found', async () => {
      mockValidateTaskExists.mockReturnValue(null);

      const result = await runTaskCompleteCommand(['non-existent']);

      expect(result.stdout).toContain('Phase 1: Setup');
      expect(result.stdout).toContain('task-1');
      expect(result.stdout).toContain('task-2');
    });
  });

  // ==========================================================================
  // Already Completed Tests
  // ==========================================================================

  describe('already completed tasks', () => {
    it('should warn when task already completed', async () => {
      mockValidateTaskExists.mockReturnValue(createMockTask({ completed: true }));

      const result = await runTaskCompleteCommand(['task-2']);

      expect(result.stdout).toContain('already marked as completed');
    });

    it('should suggest --force flag', async () => {
      mockValidateTaskExists.mockReturnValue(createMockTask({ completed: true }));

      const result = await runTaskCompleteCommand(['task-2']);

      expect(result.stdout).toContain('--force');
    });

    it('should allow re-marking with --force', async () => {
      mockValidateTaskExists.mockReturnValue(createMockTask({ completed: true }));

      await runTaskCompleteCommand(['task-2', '--force']);

      expect(mockMarkTaskCompletedWithValidation).toHaveBeenCalled();
    });

    it('should display already completed note from config', async () => {
      mockValidateTaskExists.mockReturnValue(createMockTask({ completed: true }));
      mockIsTaskCompleted.mockResolvedValue(true);

      const result = await runTaskCompleteCommand(['task-2']);

      expect(result.stdout).toContain('tracked in config');
    });
  });

  // ==========================================================================
  // Completion Failure Tests
  // ==========================================================================

  describe('completion failure', () => {
    it('should handle completion failure', async () => {
      mockMarkTaskCompletedWithValidation.mockResolvedValue({
        success: false,
        error: 'File write error',
      });

      const result = await runTaskCompleteCommand(['task-2']);

      expect(result.exitCode).toBe(1);
      expect(result.stdout).toContain('Failed to mark task');
    });

    it('should display error message on failure', async () => {
      mockMarkTaskCompletedWithValidation.mockResolvedValue({
        success: false,
        error: 'Permission denied',
      });

      const result = await runTaskCompleteCommand(['task-2']);

      expect(result.stdout).toContain('Permission denied');
    });

    it('should display warnings when present', async () => {
      mockMarkTaskCompletedWithValidation.mockResolvedValue({
        success: false,
        error: 'Partial failure',
        warnings: ['Backup created', 'Some data lost'],
      });

      const result = await runTaskCompleteCommand(['task-2']);

      expect(result.stdout).toContain('Warnings');
      expect(result.stdout).toContain('Backup created');
    });

    it('should show recovery options on failure', async () => {
      mockMarkTaskCompletedWithValidation.mockResolvedValue({
        success: false,
        error: 'Error',
      });

      const result = await runTaskCompleteCommand(['task-2']);

      expect(result.stdout).toContain('Recovery Options');
    });
  });

  // ==========================================================================
  // Git Integration Tests
  // ==========================================================================

  describe('git integration', () => {
    it('should skip git with --no-git flag', async () => {
      mockConfigRead.mockResolvedValue(createMockConfig({ commitStrategy: 'per-task' }));

      await runTaskCompleteCommand(['task-2', '--no-git']);

      expect(mockCreateCommit).not.toHaveBeenCalled();
    });

    it('should skip git when strategy is none', async () => {
      mockConfigRead.mockResolvedValue(createMockConfig({ commitStrategy: 'none' }));

      await runTaskCompleteCommand(['task-2']);

      expect(mockCreateCommit).not.toHaveBeenCalled();
    });

    it('should create commit with per-task strategy', async () => {
      mockConfigRead.mockResolvedValue(createMockConfig({ commitStrategy: 'per-task' }));

      await runTaskCompleteCommand(['task-2']);

      expect(mockCreateCommit).toHaveBeenCalled();
    });

    it('should show commit success message', async () => {
      mockConfigRead.mockResolvedValue(createMockConfig({ commitStrategy: 'per-task' }));

      const result = await runTaskCompleteCommand(['task-2']);

      expect(result.stdout).toContain('Git commit created');
    });

    it('should handle commit failure gracefully', async () => {
      mockConfigRead.mockResolvedValue(createMockConfig({ commitStrategy: 'per-task' }));
      mockCreateCommit.mockResolvedValue(false);

      const result = await runTaskCompleteCommand(['task-2']);

      expect(result.stdout).toContain('Git commit failed');
      expect(result.exitCode).toBe(0); // Non-critical failure
    });

    it('should warn when not a git repo', async () => {
      mockConfigRead.mockResolvedValue(createMockConfig({ commitStrategy: 'per-task' }));
      mockValidateGitSetup.mockResolvedValue({ isRepo: false });

      const result = await runTaskCompleteCommand(['task-2']);

      expect(result.stdout).toContain('Not a git repository');
    });

    it('should skip commit when no changes', async () => {
      mockConfigRead.mockResolvedValue(createMockConfig({ commitStrategy: 'per-task' }));
      mockValidateGitSetup.mockResolvedValue({ isRepo: true, hasChanges: false });

      const result = await runTaskCompleteCommand(['task-2']);

      expect(result.stdout).toContain('No git changes');
    });
  });

  // ==========================================================================
  // Config File Discovery Tests
  // ==========================================================================

  describe('config file discovery', () => {
    it('should use provided config path', async () => {
      const customConfig = path.join(testDir, 'custom-config.json');

      await runTaskCompleteCommand(['task-2', '--config', customConfig]);

      expect(mockConfigRead).toHaveBeenCalledWith(customConfig);
    });

    it('should error when provided config not found', async () => {
      mockPathExists.mockResolvedValue(false);

      const result = await runTaskCompleteCommand(['task-2', '--config', '/missing/config.json']);

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('Config file not found');
    });

    it('should auto-discover config file', async () => {
      await runTaskCompleteCommand(['task-2']);

      expect(mockConfigRead).toHaveBeenCalled();
    });

    it('should error when no outputs directory', async () => {
      mockPathExists.mockResolvedValueOnce(true).mockResolvedValue(false);

      const result = await runTaskCompleteCommand(['task-2']);

      expect(result.exitCode).toBe(1);
    });
  });

  // ==========================================================================
  // All Tasks Complete Tests
  // ==========================================================================

  describe('all tasks complete', () => {
    it('should show completion celebration', async () => {
      mockFindFirstIncompleteTask.mockReturnValue(null);

      const result = await runTaskCompleteCommand(['task-2']);

      expect(result.stdout).toContain('All tasks completed');
    });

    it('should suggest archive command', async () => {
      mockFindFirstIncompleteTask.mockReturnValue(null);

      const result = await runTaskCompleteCommand(['task-2']);

      expect(result.stdout).toContain('clavix archive');
    });
  });

  // ==========================================================================
  // Static Properties Tests
  // ==========================================================================

  describe('command static properties', () => {
    it('should have description', () => {
      expect(TaskComplete.description).toBeDefined();
      expect(typeof TaskComplete.description).toBe('string');
    });

    it('should have examples', () => {
      expect(TaskComplete.examples).toBeDefined();
      expect(Array.isArray(TaskComplete.examples)).toBe(true);
    });

    it('should have taskId arg as required', () => {
      expect(TaskComplete.args).toBeDefined();
      expect(TaskComplete.args.taskId).toBeDefined();
      expect(TaskComplete.args.taskId.required).toBe(true);
    });

    it('should have no-git flag', () => {
      expect(TaskComplete.flags['no-git']).toBeDefined();
    });

    it('should have force flag with char shortcut', () => {
      expect(TaskComplete.flags.force).toBeDefined();
      expect(TaskComplete.flags.force.char).toBe('f');
    });

    it('should have config flag with char shortcut', () => {
      expect(TaskComplete.flags.config).toBeDefined();
      expect(TaskComplete.flags.config.char).toBe('c');
    });
  });

  // ==========================================================================
  // Edge Cases Tests
  // ==========================================================================

  describe('edge cases', () => {
    it('should handle task without PRD reference in next task', async () => {
      mockFindFirstIncompleteTask.mockReturnValue(createMockTask({ prdReference: undefined }));

      const result = await runTaskCompleteCommand(['task-2']);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).not.toContain('Reference:');
    });

    it('should display warnings on successful completion', async () => {
      mockMarkTaskCompletedWithValidation.mockResolvedValue({
        success: true,
        alreadyCompleted: false,
        warnings: ['Task was modified'],
      });

      const result = await runTaskCompleteCommand(['task-2']);

      expect(result.stdout).toContain('Warnings');
      expect(result.stdout).toContain('Task was modified');
    });

    it('should handle alreadyCompleted flag in result', async () => {
      mockMarkTaskCompletedWithValidation.mockResolvedValue({
        success: true,
        alreadyCompleted: true,
      });

      const result = await runTaskCompleteCommand(['task-2']);

      expect(result.stdout).toContain('already completed');
    });
  });
});
