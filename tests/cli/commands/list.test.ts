/**
 * List Command Tests
 *
 * Direct tests for the List CLI command class.
 * Tests listing sessions and outputs.
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import fsActual from 'fs-extra';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { createTestDir, cleanupTestDir } from '../../helpers/cli-helpers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// Mock Setup - Must be BEFORE imports
// ============================================================================

const mockListSessions = jest.fn<() => Promise<any[]>>();

// Mock SessionManager
jest.unstable_mockModule('../../../src/core/session-manager.js', () => ({
  SessionManager: jest.fn().mockImplementation(() => ({
    listSessions: mockListSessions,
  })),
}));

// ============================================================================
// Import command AFTER mocks
// ============================================================================

const { default: List } = await import('../../../src/cli/commands/list.js');

// ============================================================================
// Test Helpers
// ============================================================================

function createMockSessionMetadata(overrides: Partial<any> = {}) {
  return {
    id: 'test-session-123',
    projectName: 'test-project',
    agent: 'Claude Code',
    created: '2024-01-15T10:00:00Z',
    updated: '2024-01-15T12:00:00Z',
    status: 'active',
    messageCount: 5,
    ...overrides,
  };
}

async function runListCommand(
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

  const cmd = new List(args, mockOclifConfig as any);

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

describe('List Command', () => {
  let testDir: string;
  let originalCwd: string;

  beforeEach(async () => {
    jest.clearAllMocks();

    testDir = await createTestDir('list-cmd-test');
    originalCwd = process.cwd();
    process.chdir(testDir);

    // Create .clavix directory structure
    await fsActual.ensureDir(path.join(testDir, '.clavix', 'sessions'));
    await fsActual.ensureDir(path.join(testDir, '.clavix', 'outputs', 'project-one'));
    await fsActual.ensureDir(path.join(testDir, '.clavix', 'outputs', 'project-two'));
    await fsActual.ensureDir(
      path.join(testDir, '.clavix', 'outputs', 'archive', 'archived-project')
    );

    // Create sample output files
    await fsActual.writeFile(
      path.join(testDir, '.clavix', 'outputs', 'project-one', 'prd.md'),
      '# PRD'
    );
    await fsActual.writeFile(
      path.join(testDir, '.clavix', 'outputs', 'project-two', 'tasks.md'),
      '# Tasks'
    );
    await fsActual.writeFile(
      path.join(testDir, '.clavix', 'outputs', 'archive', 'archived-project', 'prd.md'),
      '# Archived PRD'
    );

    // Default mocks
    mockListSessions.mockResolvedValue([
      createMockSessionMetadata({ id: 'session-1', projectName: 'project-one' }),
      createMockSessionMetadata({ id: 'session-2', projectName: 'project-two' }),
    ]);
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    await cleanupTestDir(testDir);
  });

  // ==========================================================================
  // No Clavix Directory Tests
  // ==========================================================================

  describe('no clavix directory', () => {
    it('should error when .clavix not found', async () => {
      await fsActual.remove(path.join(testDir, '.clavix'));

      const result = await runListCommand([]);

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('No .clavix directory');
    });

    it('should suggest clavix init', async () => {
      await fsActual.remove(path.join(testDir, '.clavix'));

      const result = await runListCommand([]);

      expect(result.stderr).toContain('clavix init');
    });
  });

  // ==========================================================================
  // Default Behavior Tests (Show Both)
  // ==========================================================================

  describe('default behavior', () => {
    it('should show both sessions and outputs by default', async () => {
      const result = await runListCommand([]);

      expect(result.stdout).toContain('Sessions');
      expect(result.stdout).toContain('Outputs');
    });

    it('should display sessions header', async () => {
      const result = await runListCommand([]);

      expect(result.stdout).toContain('Sessions');
    });

    it('should display outputs header', async () => {
      const result = await runListCommand([]);

      expect(result.stdout).toContain('Outputs');
    });
  });

  // ==========================================================================
  // Sessions List Tests
  // ==========================================================================

  describe('sessions list', () => {
    it('should display sessions with --sessions flag', async () => {
      const result = await runListCommand(['--sessions']);

      expect(result.stdout).toContain('Sessions');
      expect(result.stdout).not.toContain('Outputs');
    });

    it('should show session project names', async () => {
      const result = await runListCommand(['--sessions']);

      expect(result.stdout).toContain('project-one');
      expect(result.stdout).toContain('project-two');
    });

    it('should show session IDs', async () => {
      const result = await runListCommand(['--sessions']);

      expect(result.stdout).toContain('session-1');
      expect(result.stdout).toContain('session-2');
    });

    it('should show session status', async () => {
      mockListSessions.mockResolvedValue([createMockSessionMetadata({ status: 'active' })]);

      const result = await runListCommand(['--sessions']);

      expect(result.stdout).toContain('active');
    });

    it('should show completed status', async () => {
      mockListSessions.mockResolvedValue([createMockSessionMetadata({ status: 'completed' })]);

      const result = await runListCommand(['--sessions']);

      expect(result.stdout).toContain('completed');
    });

    it('should show message count', async () => {
      mockListSessions.mockResolvedValue([createMockSessionMetadata({ messageCount: 10 })]);

      const result = await runListCommand(['--sessions']);

      expect(result.stdout).toContain('Messages:');
      expect(result.stdout).toContain('10');
    });

    it('should show no sessions message when empty', async () => {
      mockListSessions.mockResolvedValue([]);

      const result = await runListCommand(['--sessions']);

      expect(result.stdout).toContain('No sessions found');
    });

    it('should suggest clavix start when no sessions', async () => {
      mockListSessions.mockResolvedValue([]);

      const result = await runListCommand(['--sessions']);

      expect(result.stdout).toContain('clavix start');
    });

    it('should show session count', async () => {
      const result = await runListCommand(['--sessions']);

      expect(result.stdout).toContain('Showing 2 of 2');
    });
  });

  // ==========================================================================
  // Outputs List Tests
  // ==========================================================================

  describe('outputs list', () => {
    it('should display outputs with --outputs flag', async () => {
      const result = await runListCommand(['--outputs']);

      expect(result.stdout).toContain('Outputs');
      expect(result.stdout).not.toContain('Sessions');
    });

    it('should show output project names', async () => {
      const result = await runListCommand(['--outputs']);

      expect(result.stdout).toContain('project-one');
      expect(result.stdout).toContain('project-two');
    });

    it('should show file names in outputs', async () => {
      const result = await runListCommand(['--outputs']);

      expect(result.stdout).toContain('prd.md');
      expect(result.stdout).toContain('tasks.md');
    });

    it('should show output paths', async () => {
      const result = await runListCommand(['--outputs']);

      expect(result.stdout).toContain('.clavix/outputs');
    });

    it('should not show archived by default', async () => {
      const result = await runListCommand(['--outputs']);

      expect(result.stdout).not.toContain('archived-project');
    });

    it('should show no outputs message when empty', async () => {
      await fsActual.remove(path.join(testDir, '.clavix', 'outputs'));

      const result = await runListCommand(['--outputs']);

      expect(result.stdout).toContain('No outputs found');
    });

    it('should suggest clavix prd when no outputs', async () => {
      await fsActual.remove(path.join(testDir, '.clavix', 'outputs'));

      const result = await runListCommand(['--outputs']);

      expect(result.stdout).toContain('clavix prd');
    });

    it('should show output count', async () => {
      const result = await runListCommand(['--outputs']);

      expect(result.stdout).toContain('Showing');
      expect(result.stdout).toContain('output directories');
    });
  });

  // ==========================================================================
  // Archived Outputs Tests
  // ==========================================================================

  describe('archived outputs', () => {
    it('should show archived outputs with --archived flag', async () => {
      const result = await runListCommand(['--outputs', '--archived']);

      expect(result.stdout).toContain('Archived Outputs');
    });

    it('should show archived project names', async () => {
      const result = await runListCommand(['--outputs', '--archived']);

      expect(result.stdout).toContain('archived-project');
    });

    it('should show restore hint for archived', async () => {
      const result = await runListCommand(['--outputs', '--archived']);

      expect(result.stdout).toContain('--restore');
    });
  });

  // ==========================================================================
  // Project Filter Tests
  // ==========================================================================

  describe('project filter', () => {
    it('should filter sessions by project', async () => {
      const result = await runListCommand(['--project', 'one']);

      expect(result.stdout).toContain('project-one');
      expect(result.stdout).not.toContain('project-two');
    });

    it('should filter outputs by project', async () => {
      const result = await runListCommand(['--outputs', '--project', 'two']);

      expect(result.stdout).toContain('project-two');
      expect(result.stdout).not.toContain('project-one');
    });

    it('should be case insensitive', async () => {
      const result = await runListCommand(['--project', 'ONE']);

      expect(result.stdout).toContain('project-one');
    });

    it('should show no match message for sessions', async () => {
      const result = await runListCommand(['--sessions', '--project', 'nonexistent']);

      expect(result.stdout).toContain('No sessions found matching');
    });

    it('should show no match message for outputs', async () => {
      const result = await runListCommand(['--outputs', '--project', 'nonexistent']);

      expect(result.stdout).toContain('No outputs found matching');
    });
  });

  // ==========================================================================
  // Limit Tests
  // ==========================================================================

  describe('limit', () => {
    it('should limit sessions', async () => {
      mockListSessions.mockResolvedValue([
        createMockSessionMetadata({ id: 's1', projectName: 'p1' }),
        createMockSessionMetadata({ id: 's2', projectName: 'p2' }),
        createMockSessionMetadata({ id: 's3', projectName: 'p3' }),
      ]);

      const result = await runListCommand(['--sessions', '--limit', '2']);

      expect(result.stdout).toContain('Showing 2 of 3');
    });

    it('should limit outputs', async () => {
      await fsActual.ensureDir(path.join(testDir, '.clavix', 'outputs', 'project-three'));

      const result = await runListCommand(['--outputs', '--limit', '2']);

      expect(result.stdout).toContain('Showing 2 of 3');
    });

    it('should default to 20 limit', async () => {
      // The default limit is 20, so we don't need to pass it
      const result = await runListCommand([]);

      expect(result.exitCode).toBe(0);
    });
  });

  // ==========================================================================
  // Sorting Tests
  // ==========================================================================

  describe('sorting', () => {
    it('should sort sessions by updated time (most recent first)', async () => {
      mockListSessions.mockResolvedValue([
        createMockSessionMetadata({ id: 'old', updated: '2024-01-01T00:00:00Z' }),
        createMockSessionMetadata({ id: 'new', updated: '2024-01-15T00:00:00Z' }),
      ]);

      const result = await runListCommand(['--sessions']);

      // 'new' should appear before 'old' in the output
      const newIndex = result.stdout.indexOf('new');
      const oldIndex = result.stdout.indexOf('old');
      expect(newIndex).toBeLessThan(oldIndex);
    });
  });

  // ==========================================================================
  // Static Properties Tests
  // ==========================================================================

  describe('command static properties', () => {
    it('should have description', () => {
      expect(List.description).toBeDefined();
      expect(typeof List.description).toBe('string');
    });

    it('should have examples', () => {
      expect(List.examples).toBeDefined();
      expect(Array.isArray(List.examples)).toBe(true);
    });

    it('should have sessions flag with char shortcut', () => {
      expect(List.flags.sessions).toBeDefined();
      expect(List.flags.sessions.char).toBe('s');
    });

    it('should have outputs flag with char shortcut', () => {
      expect(List.flags.outputs).toBeDefined();
      expect(List.flags.outputs.char).toBe('o');
    });

    it('should have archived flag with char shortcut', () => {
      expect(List.flags.archived).toBeDefined();
      expect(List.flags.archived.char).toBe('a');
    });

    it('should have project flag with char shortcut', () => {
      expect(List.flags.project).toBeDefined();
      expect(List.flags.project.char).toBe('p');
    });

    it('should have limit flag with char shortcut', () => {
      expect(List.flags.limit).toBeDefined();
      expect(List.flags.limit.char).toBe('l');
    });
  });
});
