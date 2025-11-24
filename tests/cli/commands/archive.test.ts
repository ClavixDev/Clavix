/**
 * Archive Command Tests
 *
 * Direct tests for the Archive CLI command class.
 * Mocks ArchiveManager and inquirer.
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

const mockPrompt = jest.fn<(questions: any[]) => Promise<any>>();
const mockGetArchivablePrds = jest.fn<() => Promise<any[]>>();
const mockCheckTasksStatus = jest.fn<() => Promise<any>>();
const mockArchiveProject = jest.fn<() => Promise<any>>();
const mockListArchivedProjects = jest.fn<() => Promise<any[]>>();
const mockRestoreProject = jest.fn<() => Promise<any>>();
const mockGetIncompleteTasks = jest.fn<() => Promise<string[]>>();

// Mock inquirer
jest.unstable_mockModule('inquirer', () => ({
  default: {
    prompt: mockPrompt,
    Separator: class Separator {
      type = 'separator';
      line?: string;
      constructor(line?: string) {
        this.line = line;
      }
    },
  },
}));

// Mock ArchiveManager
jest.unstable_mockModule('../../../src/core/archive-manager.js', () => ({
  ArchiveManager: jest.fn().mockImplementation(() => ({
    getArchivablePrds: mockGetArchivablePrds,
    checkTasksStatus: mockCheckTasksStatus,
    archiveProject: mockArchiveProject,
    listArchivedProjects: mockListArchivedProjects,
    restoreProject: mockRestoreProject,
    getIncompleteTasks: mockGetIncompleteTasks,
  })),
}));

// ============================================================================
// Import command AFTER mocks
// ============================================================================

const { default: Archive } = await import('../../../src/cli/commands/archive.js');

// ============================================================================
// Test Helpers
// ============================================================================

function createMockProject(overrides: Partial<any> = {}) {
  return {
    name: 'test-project',
    path: '.clavix/outputs/test-project',
    taskStatus: {
      allCompleted: true,
      hasTasksFile: true,
      completed: 5,
      total: 5,
      remaining: 0,
      percentage: 100,
    },
    modifiedTime: new Date(),
    ...overrides,
  };
}

async function runArchiveCommand(
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

  const cmd = new Archive(args, mockOclifConfig as any);

  const logSpy = jest.spyOn(cmd, 'log').mockImplementation((...logArgs: any[]) => {
    stdout += logArgs.map((a) => String(a)).join(' ') + '\n';
  });
  const errorSpy = jest.spyOn(cmd, 'error').mockImplementation(((msg: string) => {
    stderr += msg + '\n';
    throw new Error(msg);
  }) as any);

  try {
    await cmd.run();
  } catch (err: any) {
    exitCode = 1;
    caughtError = err;
    if (err.message && !stderr.includes(err.message)) {
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

describe('Archive Command', () => {
  let testDir: string;
  let originalCwd: string;

  beforeEach(async () => {
    jest.clearAllMocks();

    testDir = await createTestDir('archive-cmd-test');
    originalCwd = process.cwd();
    process.chdir(testDir);

    await fs.ensureDir(path.join(testDir, '.clavix', 'outputs', 'archive'));

    // Default mocks
    mockGetArchivablePrds.mockResolvedValue([createMockProject()]);
    mockCheckTasksStatus.mockResolvedValue({
      allCompleted: true,
      hasTasksFile: true,
      completed: 5,
      total: 5,
      remaining: 0,
    });
    mockArchiveProject.mockResolvedValue({ success: true, message: 'Project archived' });
    mockListArchivedProjects.mockResolvedValue([]);
    mockRestoreProject.mockResolvedValue({ success: true, message: 'Project restored' });
    mockGetIncompleteTasks.mockResolvedValue([]);
    mockPrompt.mockResolvedValue({ selectedProject: 'test-project', confirm: true });
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    await cleanupTestDir(testDir);
  });

  // ==========================================================================
  // List Mode Tests
  // ==========================================================================

  describe('list mode', () => {
    it('should display archived projects header', async () => {
      mockListArchivedProjects.mockResolvedValue([createMockProject()]);

      const result = await runArchiveCommand(['--list']);

      expect(result.stdout).toContain('Archived Projects');
    });

    it('should show no archived projects message', async () => {
      mockListArchivedProjects.mockResolvedValue([]);

      const result = await runArchiveCommand(['--list']);

      expect(result.stdout).toContain('No archived projects found');
    });

    it('should display archived project info', async () => {
      mockListArchivedProjects.mockResolvedValue([createMockProject({ name: 'my-app' })]);

      const result = await runArchiveCommand(['--list']);

      expect(result.stdout).toContain('my-app');
      expect(result.stdout).toContain('5/5 tasks');
    });

    it('should show restore hint', async () => {
      mockListArchivedProjects.mockResolvedValue([createMockProject()]);

      const result = await runArchiveCommand(['--list']);

      expect(result.stdout).toContain('--restore');
    });

    it('should show total count', async () => {
      mockListArchivedProjects.mockResolvedValue([
        createMockProject({ name: 'project-1' }),
        createMockProject({ name: 'project-2' }),
      ]);

      const result = await runArchiveCommand(['--list']);

      expect(result.stdout).toContain('2 archived');
    });
  });

  // ==========================================================================
  // Restore Mode Tests
  // ==========================================================================

  describe('restore mode', () => {
    it('should restore project with confirmation', async () => {
      mockPrompt.mockResolvedValue({ confirm: true });

      await runArchiveCommand(['--restore', 'my-app']);

      expect(mockRestoreProject).toHaveBeenCalledWith('my-app');
    });

    it('should cancel restore without confirmation', async () => {
      mockPrompt.mockResolvedValue({ confirm: false });

      const result = await runArchiveCommand(['--restore', 'my-app']);

      expect(result.stdout).toContain('cancelled');
      expect(mockRestoreProject).not.toHaveBeenCalled();
    });

    it('should skip confirmation with --yes flag', async () => {
      await runArchiveCommand(['--restore', 'my-app', '--yes']);

      expect(mockRestoreProject).toHaveBeenCalled();
      expect(mockPrompt).not.toHaveBeenCalled();
    });

    it('should display success message on restore', async () => {
      mockPrompt.mockResolvedValue({ confirm: true });

      const result = await runArchiveCommand(['--restore', 'my-app']);

      expect(result.stdout).toContain('restored');
    });

    it('should handle restore failure', async () => {
      mockPrompt.mockResolvedValue({ confirm: true });
      mockRestoreProject.mockResolvedValue({ success: false, message: 'Not found' });

      const result = await runArchiveCommand(['--restore', 'my-app']);

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('Not found');
    });
  });

  // ==========================================================================
  // Direct Archive Tests
  // ==========================================================================

  describe('direct archive', () => {
    it('should archive specific project', async () => {
      await runArchiveCommand(['my-project', '--yes']);

      expect(mockArchiveProject).toHaveBeenCalledWith('my-project', true);
    });

    it('should show archiving message', async () => {
      const result = await runArchiveCommand(['my-project', '--yes']);

      expect(result.stdout).toContain('Archiving project');
      expect(result.stdout).toContain('my-project');
    });

    it('should display success message', async () => {
      const result = await runArchiveCommand(['my-project', '--yes']);

      expect(result.stdout).toContain('archived');
    });

    it('should handle archive failure', async () => {
      mockArchiveProject.mockResolvedValue({ success: false, message: 'Archive failed' });

      const result = await runArchiveCommand(['my-project', '--yes']);

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('Archive failed');
    });

    it('should warn about incomplete tasks', async () => {
      mockCheckTasksStatus.mockResolvedValue({
        allCompleted: false,
        hasTasksFile: true,
        remaining: 2,
      });
      mockGetIncompleteTasks.mockResolvedValue(['Task 1', 'Task 2']);
      mockPrompt.mockResolvedValue({ proceed: true });

      const result = await runArchiveCommand(['my-project']);

      expect(result.stdout).toContain('incomplete');
    });

    it('should cancel when user declines incomplete archive', async () => {
      mockCheckTasksStatus.mockResolvedValue({
        allCompleted: false,
        hasTasksFile: true,
        remaining: 2,
      });
      mockGetIncompleteTasks.mockResolvedValue(['Task 1']);
      mockPrompt.mockResolvedValue({ proceed: false });

      const result = await runArchiveCommand(['my-project']);

      expect(result.stdout).toContain('cancelled');
      expect(mockArchiveProject).not.toHaveBeenCalled();
    });

    it('should force archive with --force flag', async () => {
      mockCheckTasksStatus.mockResolvedValue({
        allCompleted: false,
        hasTasksFile: true,
        remaining: 2,
      });

      await runArchiveCommand(['my-project', '--force', '--yes']);

      expect(mockArchiveProject).toHaveBeenCalled();
    });

    it('should warn about missing tasks file', async () => {
      mockCheckTasksStatus.mockResolvedValue({
        allCompleted: false,
        hasTasksFile: false,
      });
      mockPrompt.mockResolvedValue({ proceed: true });

      const result = await runArchiveCommand(['my-project']);

      expect(result.stdout).toContain('no tasks.md');
    });
  });

  // ==========================================================================
  // Interactive Mode Tests
  // ==========================================================================

  describe('interactive mode', () => {
    it('should display header', async () => {
      mockPrompt.mockResolvedValue({ selectedProject: 'test-project', confirm: true });

      const result = await runArchiveCommand([]);

      expect(result.stdout).toContain('Archive PRD Projects');
    });

    it('should show no archivable projects message', async () => {
      mockGetArchivablePrds.mockResolvedValue([]);

      const result = await runArchiveCommand([]);

      expect(result.stdout).toContain('No projects ready to archive');
    });

    it('should show archivable projects count', async () => {
      mockGetArchivablePrds.mockResolvedValue([
        createMockProject({ name: 'project-1' }),
        createMockProject({ name: 'project-2' }),
      ]);
      mockPrompt.mockResolvedValue({ selectedProject: 'project-1', confirm: true });

      const result = await runArchiveCommand([]);

      expect(result.stdout).toContain('2 project(s)');
    });

    it('should call inquirer for project selection', async () => {
      mockPrompt.mockResolvedValue({ selectedProject: 'test-project', confirm: true });

      await runArchiveCommand([]);

      expect(mockPrompt).toHaveBeenCalled();
    });

    it('should cancel when selecting cancel option', async () => {
      mockPrompt.mockResolvedValue({ selectedProject: '__cancel__' });

      const result = await runArchiveCommand([]);

      expect(result.stdout).toContain('cancelled');
      expect(mockArchiveProject).not.toHaveBeenCalled();
    });

    it('should confirm before archiving', async () => {
      mockPrompt
        .mockResolvedValueOnce({ selectedProject: 'test-project' })
        .mockResolvedValueOnce({ confirm: true });

      await runArchiveCommand([]);

      expect(mockPrompt).toHaveBeenCalledTimes(2);
    });

    it('should cancel on declined confirmation', async () => {
      mockPrompt
        .mockResolvedValueOnce({ selectedProject: 'test-project' })
        .mockResolvedValueOnce({ confirm: false });

      const result = await runArchiveCommand([]);

      expect(result.stdout).toContain('cancelled');
    });

    it('should skip confirmation with --yes flag', async () => {
      mockPrompt.mockResolvedValue({ selectedProject: 'test-project' });

      await runArchiveCommand(['--yes']);

      expect(mockPrompt).toHaveBeenCalledTimes(1); // Only project selection
    });
  });

  // ==========================================================================
  // Static Properties Tests
  // ==========================================================================

  describe('command static properties', () => {
    it('should have description', () => {
      expect(Archive.description).toBeDefined();
      expect(typeof Archive.description).toBe('string');
    });

    it('should have examples', () => {
      expect(Archive.examples).toBeDefined();
      expect(Array.isArray(Archive.examples)).toBe(true);
    });

    it('should have project arg as optional', () => {
      expect(Archive.args.project).toBeDefined();
      expect(Archive.args.project.required).toBe(false);
    });

    it('should have list flag with char shortcut', () => {
      expect(Archive.flags.list).toBeDefined();
      expect(Archive.flags.list.char).toBe('l');
    });

    it('should have force flag with char shortcut', () => {
      expect(Archive.flags.force).toBeDefined();
      expect(Archive.flags.force.char).toBe('f');
    });

    it('should have yes flag with char shortcut', () => {
      expect(Archive.flags.yes).toBeDefined();
      expect(Archive.flags.yes.char).toBe('y');
    });

    it('should have restore flag with char shortcut', () => {
      expect(Archive.flags.restore).toBeDefined();
      expect(Archive.flags.restore.char).toBe('r');
    });
  });

  // ==========================================================================
  // Edge Cases Tests
  // ==========================================================================

  describe('edge cases', () => {
    it('should handle project with no tasks showing no tasks info', async () => {
      mockListArchivedProjects.mockResolvedValue([
        createMockProject({
          taskStatus: { hasTasksFile: false, allCompleted: false },
        }),
      ]);

      const result = await runArchiveCommand(['--list']);

      expect(result.stdout).toContain('no tasks');
    });

    it('should truncate long incomplete tasks list', async () => {
      mockCheckTasksStatus.mockResolvedValue({
        allCompleted: false,
        hasTasksFile: true,
        remaining: 10,
      });
      mockGetIncompleteTasks.mockResolvedValue([
        'Task 1',
        'Task 2',
        'Task 3',
        'Task 4',
        'Task 5',
        'Task 6',
        'Task 7',
        'Task 8',
        'Task 9',
        'Task 10',
      ]);
      mockPrompt.mockResolvedValue({ proceed: true });

      const result = await runArchiveCommand(['my-project']);

      expect(result.stdout).toContain('and 5 more');
    });
  });
});
