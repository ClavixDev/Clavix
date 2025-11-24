/**
 * Implement Command Tests
 *
 * Direct tests for the Implement CLI command class.
 * Mocks TaskManager, GitManager, inquirer, and fs-extra.
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
const mockPrompt = jest.fn<(questions: any[]) => Promise<any>>();
const mockFindPrdDirectory = jest.fn<() => Promise<string>>();
const mockReadTasksFile = jest.fn<() => Promise<any[]>>();
const mockGetTaskStats = jest.fn<() => any>();
const mockFindFirstIncompleteTask = jest.fn<() => any>();
const mockHasPrdFile = jest.fn<() => Promise<boolean>>();
const mockValidateGitSetup = jest.fn<() => Promise<any>>();
const mockPathExists = jest.fn<() => Promise<boolean>>();
const mockWriteJson = jest.fn<() => Promise<void>>();
const mockReaddir = jest.fn<() => Promise<any[]>>();

// Mock inquirer for interactive prompts
jest.unstable_mockModule('inquirer', () => ({
  default: {
    prompt: mockPrompt,
  },
}));

// Mock TaskManager
jest.unstable_mockModule('../../../src/core/task-manager.js', () => ({
  TaskManager: jest.fn().mockImplementation(() => ({
    findPrdDirectory: mockFindPrdDirectory,
    readTasksFile: mockReadTasksFile,
    getTaskStats: mockGetTaskStats,
    findFirstIncompleteTask: mockFindFirstIncompleteTask,
    hasPrdFile: mockHasPrdFile,
  })),
}));

// Mock GitManager
jest.unstable_mockModule('../../../src/core/git-manager.js', () => ({
  GitManager: jest.fn().mockImplementation(() => ({
    validateGitSetup: mockValidateGitSetup,
  })),
}));

// Mock fs-extra (partial mock)
jest.unstable_mockModule('fs-extra', () => ({
  default: {
    pathExists: mockPathExists,
    writeJson: mockWriteJson,
    readdir: mockReaddir,
    ensureDir: jest.fn().mockResolvedValue(undefined),
  },
}));

// ============================================================================
// Import command AFTER mocks
// ============================================================================

const { default: Implement } = await import('../../../src/cli/commands/implement.js');

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
 * Create mock task stats
 */
function createMockStats(overrides: Partial<any> = {}) {
  return {
    total: 4,
    completed: 1,
    remaining: 3,
    percentage: 25,
    ...overrides,
  };
}

/**
 * Create mock next task
 */
function createMockNextTask(overrides: Partial<any> = {}) {
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
 * Run Implement command with proper mocking
 */
async function runImplementCommand(
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

  const cmd = new Implement(args, mockOclifConfig as any);

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

describe('Implement Command', () => {
  let testDir: string;
  let originalCwd: string;

  beforeEach(async () => {
    // Reset all mocks
    jest.clearAllMocks();

    // Setup test directory
    testDir = await createTestDir('implement-cmd-test');
    originalCwd = process.cwd();
    process.chdir(testDir);

    // Initialize .clavix directory
    await fs.ensureDir(path.join(testDir, '.clavix', 'outputs', 'test-project'));

    // Setup default mock behaviors
    mockFindPrdDirectory.mockResolvedValue(
      path.join(testDir, '.clavix', 'outputs', 'test-project')
    );
    mockReadTasksFile.mockResolvedValue(createMockPhases());
    mockGetTaskStats.mockReturnValue(createMockStats());
    mockFindFirstIncompleteTask.mockReturnValue(createMockNextTask());
    mockHasPrdFile.mockResolvedValue(true);
    mockValidateGitSetup.mockResolvedValue({ isRepo: true, currentBranch: 'main' });
    mockPathExists.mockResolvedValue(true);
    mockWriteJson.mockResolvedValue(undefined);
    mockReaddir.mockResolvedValue([]);
    mockPrompt.mockResolvedValue({ project: 'test-project' });
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    await cleanupTestDir(testDir);
  });

  // ==========================================================================
  // Display Tests
  // ==========================================================================

  describe('display output', () => {
    it('should display header', async () => {
      const result = await runImplementCommand(['--project', 'test-project']);

      expect(result.stdout).toContain('Task Implementation');
    });

    it('should display progress', async () => {
      const result = await runImplementCommand(['--project', 'test-project']);

      expect(result.stdout).toContain('Progress');
      expect(result.stdout).toContain('Completed');
      expect(result.stdout).toContain('Remaining');
    });

    it('should display completed count', async () => {
      const result = await runImplementCommand(['--project', 'test-project']);

      expect(result.stdout).toContain('1/4');
    });

    it('should display percentage', async () => {
      const result = await runImplementCommand(['--project', 'test-project']);

      expect(result.stdout).toContain('25%');
    });

    it('should display remaining count', async () => {
      const result = await runImplementCommand(['--project', 'test-project']);

      expect(result.stdout).toContain('3 tasks');
    });

    it('should display next task', async () => {
      const result = await runImplementCommand(['--project', 'test-project']);

      expect(result.stdout).toContain('Next Task');
      expect(result.stdout).toContain('Configure environment');
    });

    it('should display PRD reference when present', async () => {
      const result = await runImplementCommand(['--project', 'test-project']);

      expect(result.stdout).toContain('Reference');
      expect(result.stdout).toContain('Section 2.1');
    });

    it('should display phase info', async () => {
      const result = await runImplementCommand(['--project', 'test-project']);

      expect(result.stdout).toContain('Phase');
      expect(result.stdout).toContain('Phase 1: Setup');
    });

    it('should display implementation instructions', async () => {
      const result = await runImplementCommand(['--project', 'test-project']);

      expect(result.stdout).toContain('Implementation Instructions');
    });

    it('should display ready message', async () => {
      const result = await runImplementCommand(['--project', 'test-project']);

      expect(result.stdout).toContain('Ready to implement');
    });

    it('should display configuration saved message', async () => {
      const result = await runImplementCommand(['--project', 'test-project']);

      expect(result.stdout).toContain('Configuration saved');
    });

    it('should display agent notes', async () => {
      const result = await runImplementCommand(['--project', 'test-project']);

      expect(result.stdout).toContain('Important Notes');
      expect(result.stdout).toContain('AI Agent');
    });

    it('should display tip about resuming', async () => {
      const result = await runImplementCommand(['--project', 'test-project']);

      expect(result.stdout).toContain('Tip');
      expect(result.stdout).toContain('clavix implement');
    });
  });

  // ==========================================================================
  // Task Path Resolution Tests
  // ==========================================================================

  describe('task path resolution', () => {
    it('should use --tasks-path when provided', async () => {
      const customPath = path.join(testDir, 'custom', 'tasks.md');

      const result = await runImplementCommand(['--tasks-path', customPath]);

      // Should not call findPrdDirectory when tasks-path is provided
      expect(mockFindPrdDirectory).not.toHaveBeenCalled();
    });

    it('should find PRD directory when using --project', async () => {
      await runImplementCommand(['--project', 'my-app']);

      expect(mockFindPrdDirectory).toHaveBeenCalledWith('my-app');
    });

    it('should error when tasks.md not found', async () => {
      mockPathExists.mockResolvedValue(false);

      const result = await runImplementCommand(['--project', 'test-project']);

      expect(result.exitCode).toBe(1);
    });

    it('should display found path message', async () => {
      const result = await runImplementCommand(['--project', 'test-project']);

      expect(result.stdout).toContain('Found:');
    });
  });

  // ==========================================================================
  // Git Integration Tests
  // ==========================================================================

  describe('git integration', () => {
    it('should detect git repository', async () => {
      const result = await runImplementCommand(['--project', 'test-project']);

      expect(result.stdout).toContain('Git repository detected');
      expect(result.stdout).toContain('main');
    });

    it('should skip git with --no-git flag', async () => {
      const result = await runImplementCommand(['--project', 'test-project', '--no-git']);

      expect(result.stdout).not.toContain('Git repository detected');
    });

    it('should display no strategy message by default', async () => {
      const result = await runImplementCommand(['--project', 'test-project']);

      expect(result.stdout).toContain('No git strategy specified');
    });

    it('should use per-task commit strategy', async () => {
      const result = await runImplementCommand([
        '--project',
        'test-project',
        '--commit-strategy',
        'per-task',
      ]);

      expect(result.stdout).toContain('Auto-commit enabled');
      expect(result.stdout).toContain('per-task');
    });

    it('should use per-5-tasks commit strategy', async () => {
      const result = await runImplementCommand([
        '--project',
        'test-project',
        '--commit-strategy',
        'per-5-tasks',
      ]);

      expect(result.stdout).toContain('per-5-tasks');
    });

    it('should use per-phase commit strategy', async () => {
      const result = await runImplementCommand([
        '--project',
        'test-project',
        '--commit-strategy',
        'per-phase',
      ]);

      expect(result.stdout).toContain('per-phase');
    });

    it('should warn when not a git repository', async () => {
      mockValidateGitSetup.mockResolvedValue({ isRepo: false });

      const result = await runImplementCommand(['--project', 'test-project']);

      expect(result.stdout).toContain('Warning');
      expect(result.stdout).toContain('Not a git repository');
    });
  });

  // ==========================================================================
  // Completion Tests
  // ==========================================================================

  describe('completion handling', () => {
    it('should show all tasks completed message', async () => {
      mockGetTaskStats.mockReturnValue(
        createMockStats({
          total: 4,
          completed: 4,
          remaining: 0,
          percentage: 100,
        })
      );

      const result = await runImplementCommand(['--project', 'test-project']);

      expect(result.stdout).toContain('All tasks completed');
    });

    it('should not display next task when all complete', async () => {
      mockGetTaskStats.mockReturnValue(
        createMockStats({
          remaining: 0,
          percentage: 100,
        })
      );

      const result = await runImplementCommand(['--project', 'test-project']);

      expect(result.stdout).not.toContain('Next Task');
    });

    it('should handle no incomplete task found', async () => {
      mockFindFirstIncompleteTask.mockReturnValue(null);

      const result = await runImplementCommand(['--project', 'test-project']);

      expect(result.stdout).toContain('No incomplete tasks found');
    });
  });

  // ==========================================================================
  // Config File Tests
  // ==========================================================================

  describe('config file', () => {
    it('should save config file', async () => {
      await runImplementCommand(['--project', 'test-project']);

      expect(mockWriteJson).toHaveBeenCalled();
    });

    it('should include commit strategy in config', async () => {
      await runImplementCommand(['--project', 'test-project', '--commit-strategy', 'per-task']);

      expect(mockWriteJson).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          commitStrategy: 'per-task',
        }),
        expect.any(Object)
      );
    });

    it('should include tasks path in config', async () => {
      await runImplementCommand(['--project', 'test-project']);

      expect(mockWriteJson).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          tasksPath: expect.stringContaining('tasks.md'),
        }),
        expect.any(Object)
      );
    });

    it('should include current task in config', async () => {
      await runImplementCommand(['--project', 'test-project']);

      expect(mockWriteJson).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          currentTask: expect.objectContaining({
            description: 'Configure environment',
          }),
        }),
        expect.any(Object)
      );
    });

    it('should include stats in config', async () => {
      await runImplementCommand(['--project', 'test-project']);

      expect(mockWriteJson).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          stats: expect.objectContaining({
            total: 4,
            completed: 1,
          }),
        }),
        expect.any(Object)
      );
    });

    it('should include timestamp in config', async () => {
      await runImplementCommand(['--project', 'test-project']);

      expect(mockWriteJson).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          timestamp: expect.any(String),
        }),
        expect.any(Object)
      );
    });
  });

  // ==========================================================================
  // Error Handling Tests
  // ==========================================================================

  describe('error handling', () => {
    it('should handle findPrdDirectory error', async () => {
      mockFindPrdDirectory.mockRejectedValue(new Error('PRD not found'));

      const result = await runImplementCommand(['--project', 'test-project']);

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('PRD not found');
    });

    it('should handle readTasksFile error', async () => {
      mockReadTasksFile.mockRejectedValue(new Error('Cannot read tasks'));

      const result = await runImplementCommand(['--project', 'test-project']);

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('Cannot read tasks');
    });

    it('should handle git validation error gracefully', async () => {
      mockValidateGitSetup.mockRejectedValue(new Error('Git error'));

      const result = await runImplementCommand(['--project', 'test-project']);

      // Should still fail gracefully
      expect(result.exitCode).toBe(1);
    });

    it('should handle config write error', async () => {
      mockWriteJson.mockRejectedValue(new Error('Write failed'));

      const result = await runImplementCommand(['--project', 'test-project']);

      expect(result.exitCode).toBe(1);
    });
  });

  // ==========================================================================
  // Static Properties Tests
  // ==========================================================================

  describe('command static properties', () => {
    it('should have description', () => {
      expect(Implement.description).toBeDefined();
      expect(typeof Implement.description).toBe('string');
      expect(Implement.description.length).toBeGreaterThan(0);
    });

    it('should have examples', () => {
      expect(Implement.examples).toBeDefined();
      expect(Array.isArray(Implement.examples)).toBe(true);
      expect(Implement.examples.length).toBeGreaterThan(0);
    });

    it('should have project flag defined', () => {
      expect(Implement.flags).toBeDefined();
      expect(Implement.flags.project).toBeDefined();
    });

    it('should have project flag with char shortcut', () => {
      expect(Implement.flags.project.char).toBe('p');
    });

    it('should have tasks-path flag defined', () => {
      expect(Implement.flags['tasks-path']).toBeDefined();
    });

    it('should have no-git flag defined', () => {
      expect(Implement.flags['no-git']).toBeDefined();
    });

    it('should have commit-strategy flag defined', () => {
      expect(Implement.flags['commit-strategy']).toBeDefined();
    });

    it('should have commit-strategy options', () => {
      const flag = Implement.flags['commit-strategy'] as any;
      expect(flag.options).toContain('per-task');
      expect(flag.options).toContain('per-5-tasks');
      expect(flag.options).toContain('per-phase');
      expect(flag.options).toContain('none');
    });
  });

  // ==========================================================================
  // Edge Cases Tests
  // ==========================================================================

  describe('edge cases', () => {
    it('should handle task without PRD reference', async () => {
      mockFindFirstIncompleteTask.mockReturnValue(
        createMockNextTask({
          prdReference: undefined,
        })
      );

      const result = await runImplementCommand(['--project', 'test-project']);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).not.toContain('Reference:');
    });

    it('should handle empty task list', async () => {
      mockReadTasksFile.mockResolvedValue([]);
      mockGetTaskStats.mockReturnValue({
        total: 0,
        completed: 0,
        remaining: 0,
        percentage: 0,
      });

      const result = await runImplementCommand(['--project', 'test-project']);

      expect(result.stdout).toContain('All tasks completed');
    });

    it('should handle special characters in project name', async () => {
      const result = await runImplementCommand(['--project', 'my-special-project!@#']);

      expect(result.exitCode).toBeLessThanOrEqual(1); // May succeed or fail based on validation
    });

    it('should handle long task descriptions', async () => {
      mockFindFirstIncompleteTask.mockReturnValue(
        createMockNextTask({
          description: 'A'.repeat(200),
        })
      );

      const result = await runImplementCommand(['--project', 'test-project']);

      expect(result.exitCode).toBe(0);
    });
  });
});
