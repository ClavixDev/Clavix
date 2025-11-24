/**
 * Show Command Tests
 *
 * Direct tests for the Show CLI command class.
 * Tests showing session details and output directories.
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

const mockGetSession = jest.fn<() => Promise<any>>();
const mockListSessions = jest.fn<() => Promise<any[]>>();

// Mock SessionManager
jest.unstable_mockModule('../../../src/core/session-manager.js', () => ({
  SessionManager: jest.fn().mockImplementation(() => ({
    getSession: mockGetSession,
    listSessions: mockListSessions,
  })),
}));

// ============================================================================
// Import command AFTER mocks
// ============================================================================

const { default: Show } = await import('../../../src/cli/commands/show.js');

// ============================================================================
// Test Helpers
// ============================================================================

function createMockSession(overrides: Partial<any> = {}) {
  return {
    id: 'test-session-123',
    projectName: 'test-project',
    agent: 'Claude Code',
    created: new Date('2024-01-15T10:00:00Z'),
    updated: new Date('2024-01-15T12:00:00Z'),
    status: 'active',
    messages: [
      { role: 'user', content: 'Build a login page', timestamp: new Date('2024-01-15T10:00:00Z') },
      {
        role: 'assistant',
        content: 'I can help with that',
        timestamp: new Date('2024-01-15T10:01:00Z'),
      },
    ],
    tags: [],
    description: 'Test session',
    ...overrides,
  };
}

function createMockSessionMetadata(overrides: Partial<any> = {}) {
  return {
    id: 'test-session-123',
    projectName: 'test-project',
    agent: 'Claude Code',
    created: '2024-01-15T10:00:00Z',
    updated: '2024-01-15T12:00:00Z',
    status: 'active',
    messageCount: 2,
    ...overrides,
  };
}

async function runShowCommand(
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

  const cmd = new Show(args, mockOclifConfig as any);

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

describe('Show Command', () => {
  let testDir: string;
  let originalCwd: string;

  beforeEach(async () => {
    jest.clearAllMocks();

    testDir = await createTestDir('show-cmd-test');
    originalCwd = process.cwd();
    process.chdir(testDir);

    // Create .clavix directory structure
    await fsActual.ensureDir(path.join(testDir, '.clavix', 'sessions'));
    await fsActual.ensureDir(path.join(testDir, '.clavix', 'outputs', 'test-project'));

    // Create a sample output file
    await fsActual.writeFile(
      path.join(testDir, '.clavix', 'outputs', 'test-project', 'prd.md'),
      '# PRD Content'
    );

    // Default mocks
    mockGetSession.mockResolvedValue(createMockSession());
    mockListSessions.mockResolvedValue([createMockSessionMetadata()]);
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
      // Remove .clavix directory
      await fsActual.remove(path.join(testDir, '.clavix'));

      const result = await runShowCommand([]);

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('No .clavix directory');
    });

    it('should suggest clavix init', async () => {
      await fsActual.remove(path.join(testDir, '.clavix'));

      const result = await runShowCommand([]);

      expect(result.stderr).toContain('clavix init');
    });
  });

  // ==========================================================================
  // Session Display Tests
  // ==========================================================================

  describe('session display', () => {
    it('should display session header', async () => {
      const result = await runShowCommand(['test-session-123']);

      expect(result.stdout).toContain('Session Details');
    });

    it('should display session ID', async () => {
      const result = await runShowCommand(['test-session-123']);

      expect(result.stdout).toContain('test-session-123');
    });

    it('should display project name', async () => {
      const result = await runShowCommand(['test-session-123']);

      expect(result.stdout).toContain('test-project');
    });

    it('should display agent', async () => {
      const result = await runShowCommand(['test-session-123']);

      expect(result.stdout).toContain('Claude Code');
    });

    it('should display status', async () => {
      const result = await runShowCommand(['test-session-123']);

      expect(result.stdout).toContain('active');
    });

    it('should display message count', async () => {
      mockGetSession.mockResolvedValue(
        createMockSession({
          messages: [{ role: 'user', content: 'Test', timestamp: new Date() }],
        })
      );

      const result = await runShowCommand(['test-session-123']);

      expect(result.stdout).toContain('Messages:');
    });

    it('should display conversation history header', async () => {
      const result = await runShowCommand(['test-session-123']);

      expect(result.stdout).toContain('Conversation History');
    });

    it('should display user messages', async () => {
      const result = await runShowCommand(['test-session-123']);

      expect(result.stdout).toContain('User');
      expect(result.stdout).toContain('Build a login page');
    });

    it('should display assistant messages', async () => {
      const result = await runShowCommand(['test-session-123']);

      expect(result.stdout).toContain('I can help with that');
    });

    it('should error when session not found', async () => {
      mockGetSession.mockResolvedValue(null);

      const result = await runShowCommand(['non-existent']);

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('not found');
    });

    it('should show empty messages notice', async () => {
      mockGetSession.mockResolvedValue(createMockSession({ messages: [] }));

      const result = await runShowCommand(['test-session-123']);

      expect(result.stdout).toContain('No messages');
    });
  });

  // ==========================================================================
  // Most Recent Session Tests
  // ==========================================================================

  describe('most recent session', () => {
    it('should show most recent session when no ID provided', async () => {
      const result = await runShowCommand([]);

      expect(result.stdout).toContain('most recent session');
    });

    it('should load most recent by updated time', async () => {
      mockListSessions.mockResolvedValue([
        createMockSessionMetadata({ id: 'session-1', updated: '2024-01-10T00:00:00Z' }),
        createMockSessionMetadata({ id: 'session-2', updated: '2024-01-15T00:00:00Z' }),
      ]);

      await runShowCommand([]);

      expect(mockGetSession).toHaveBeenCalledWith('session-2');
    });

    it('should error when no sessions exist', async () => {
      mockListSessions.mockResolvedValue([]);

      const result = await runShowCommand([]);

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('No sessions found');
    });

    it('should suggest clavix start when no sessions', async () => {
      mockListSessions.mockResolvedValue([]);

      const result = await runShowCommand([]);

      expect(result.stderr).toContain('clavix start');
    });
  });

  // ==========================================================================
  // Full Flag Tests
  // ==========================================================================

  describe('--full flag', () => {
    it('should show all messages with --full', async () => {
      const manyMessages = Array.from({ length: 20 }, (_, i) => ({
        role: i % 2 === 0 ? 'user' : 'assistant',
        content: `Message ${i + 1}`,
        timestamp: new Date(),
      }));
      mockGetSession.mockResolvedValue(createMockSession({ messages: manyMessages }));

      const result = await runShowCommand(['test-session-123', '--full']);

      expect(result.stdout).toContain('Message 20');
      expect(result.stdout).not.toContain('more messages');
    });

    it('should limit messages without --full', async () => {
      const manyMessages = Array.from({ length: 20 }, (_, i) => ({
        role: i % 2 === 0 ? 'user' : 'assistant',
        content: `Message ${i + 1}`,
        timestamp: new Date(),
      }));
      mockGetSession.mockResolvedValue(createMockSession({ messages: manyMessages }));

      const result = await runShowCommand(['test-session-123']);

      expect(result.stdout).toContain('more messages');
    });

    it('should use custom limit with --limit', async () => {
      const manyMessages = Array.from({ length: 20 }, (_, i) => ({
        role: i % 2 === 0 ? 'user' : 'assistant',
        content: `Message ${i + 1}`,
        timestamp: new Date(),
      }));
      mockGetSession.mockResolvedValue(createMockSession({ messages: manyMessages }));

      const result = await runShowCommand(['test-session-123', '--limit', '5']);

      expect(result.stdout).toContain('15 more messages');
    });
  });

  // ==========================================================================
  // Output Display Tests
  // ==========================================================================

  describe('--output flag', () => {
    it('should display output directory header', async () => {
      const result = await runShowCommand(['--output', 'test-project']);

      expect(result.stdout).toContain('Output: test-project');
    });

    it('should display output path', async () => {
      const result = await runShowCommand(['--output', 'test-project']);

      expect(result.stdout).toContain('.clavix/outputs/test-project');
    });

    it('should display files in output directory', async () => {
      const result = await runShowCommand(['--output', 'test-project']);

      expect(result.stdout).toContain('prd.md');
    });

    it('should error when output not found', async () => {
      const result = await runShowCommand(['--output', 'non-existent']);

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('not found');
    });

    it('should show no files message when empty', async () => {
      await fsActual.emptyDir(path.join(testDir, '.clavix', 'outputs', 'test-project'));

      const result = await runShowCommand(['--output', 'test-project']);

      expect(result.stdout).toContain('No output files');
    });

    it('should show cat hint for viewing files', async () => {
      const result = await runShowCommand(['--output', 'test-project']);

      expect(result.stdout).toContain('cat');
    });
  });

  // ==========================================================================
  // Associated Outputs Tests
  // ==========================================================================

  describe('associated outputs', () => {
    it('should show associated outputs for session', async () => {
      const result = await runShowCommand(['test-session-123']);

      expect(result.stdout).toContain('Associated Outputs');
    });

    it('should list files in associated output', async () => {
      const result = await runShowCommand(['test-session-123']);

      expect(result.stdout).toContain('prd.md');
    });

    it('should not show associated outputs if none exist', async () => {
      mockGetSession.mockResolvedValue(createMockSession({ projectName: 'no-outputs' }));

      const result = await runShowCommand(['test-session-123']);

      expect(result.stdout).not.toContain('Associated Outputs');
    });
  });

  // ==========================================================================
  // Static Properties Tests
  // ==========================================================================

  describe('command static properties', () => {
    it('should have description', () => {
      expect(Show.description).toBeDefined();
      expect(typeof Show.description).toBe('string');
    });

    it('should have examples', () => {
      expect(Show.examples).toBeDefined();
      expect(Array.isArray(Show.examples)).toBe(true);
    });

    it('should have sessionId arg as optional', () => {
      expect(Show.args.sessionId).toBeDefined();
      expect(Show.args.sessionId.required).toBe(false);
    });

    it('should have output flag with char shortcut', () => {
      expect(Show.flags.output).toBeDefined();
      expect(Show.flags.output.char).toBe('o');
    });

    it('should have full flag with char shortcut', () => {
      expect(Show.flags.full).toBeDefined();
      expect(Show.flags.full.char).toBe('f');
    });

    it('should have limit flag with char shortcut', () => {
      expect(Show.flags.limit).toBeDefined();
      expect(Show.flags.limit.char).toBe('l');
    });
  });
});
