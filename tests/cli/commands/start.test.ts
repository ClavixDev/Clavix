/**
 * Start Command Tests
 *
 * Direct tests for the Start CLI command class.
 * Mocks SessionManager for file system operations and inquirer for user input.
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
const mockCreateSession = jest.fn<() => Promise<any>>();
const mockAddMessage = jest.fn<() => Promise<any>>();
const mockGetSession = jest.fn<() => Promise<any>>();

// Mock inquirer for interactive prompts
jest.unstable_mockModule('inquirer', () => ({
  default: {
    prompt: mockPrompt,
  },
}));

// Mock SessionManager
jest.unstable_mockModule('../../../src/core/session-manager.js', () => ({
  SessionManager: jest.fn().mockImplementation(() => ({
    createSession: mockCreateSession,
    addMessage: mockAddMessage,
    getSession: mockGetSession,
    saveSession: jest.fn().mockResolvedValue(undefined),
    updateSession: jest.fn().mockResolvedValue(undefined),
  })),
}));

// ============================================================================
// Import command AFTER mocks
// ============================================================================

const { default: Start } = await import('../../../src/cli/commands/start.js');

// ============================================================================
// Test Helpers
// ============================================================================

/**
 * Create a mock session object
 */
function createMockSessionData(overrides: Partial<any> = {}) {
  return {
    id: 'test-session-123',
    projectName: 'test-project',
    agent: 'Claude Code',
    created: new Date(),
    updated: new Date(),
    status: 'active',
    messages: [],
    tags: undefined,
    description: undefined,
    ...overrides,
  };
}

/**
 * Run Start command with proper mocking
 */
async function runStartCommand(
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

  const cmd = new Start(args, mockOclifConfig as any);

  const logSpy = jest.spyOn(console, 'log').mockImplementation((...logArgs) => {
    stdout += logArgs.map((a) => String(a)).join(' ') + '\n';
  });
  const errorSpy = jest.spyOn(console, 'error').mockImplementation((...errArgs) => {
    stderr += errArgs.map((a) => String(a)).join(' ') + '\n';
  });

  // Mock process.on to capture exit handlers
  const originalProcessOn = process.on;
  const exitHandlers: Function[] = [];
  process.on = ((event: string, handler: Function) => {
    if (event === 'SIGINT' || event === 'SIGTERM') {
      exitHandlers.push(handler);
      return process;
    }
    return originalProcessOn.call(process, event, handler as any);
  }) as typeof process.on;

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
    process.on = originalProcessOn;
  }

  return { stdout, stderr, exitCode, error: caughtError };
}

// ============================================================================
// Tests
// ============================================================================

describe('Start Command', () => {
  let testDir: string;
  let originalCwd: string;

  beforeEach(async () => {
    // Reset all mocks
    jest.clearAllMocks();

    // Setup test directory
    testDir = await createTestDir('start-cmd-test');
    originalCwd = process.cwd();
    process.chdir(testDir);

    // Initialize .clavix directory
    await fs.ensureDir(path.join(testDir, '.clavix', 'sessions'));

    // Setup default mock behaviors
    const mockSession = createMockSessionData();
    mockCreateSession.mockResolvedValue(mockSession);
    mockGetSession.mockResolvedValue(mockSession);
    mockAddMessage.mockResolvedValue(mockSession);

    // Default: exit immediately
    mockPrompt.mockResolvedValueOnce({ message: 'exit' });
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    await cleanupTestDir(testDir);
  });

  // ==========================================================================
  // Session Creation Tests
  // ==========================================================================

  describe('session creation', () => {
    it('should create a new session on start', async () => {
      await runStartCommand([]);

      expect(mockCreateSession).toHaveBeenCalled();
    });

    it('should create session with default project name', async () => {
      await runStartCommand([]);

      expect(mockCreateSession).toHaveBeenCalledWith(
        expect.objectContaining({
          projectName: undefined,
        })
      );
    });

    it('should create session with custom project name', async () => {
      await runStartCommand(['--project', 'my-app']);

      expect(mockCreateSession).toHaveBeenCalledWith(
        expect.objectContaining({
          projectName: 'my-app',
        })
      );
    });

    it('should create session with description', async () => {
      await runStartCommand(['--description', 'Planning new feature']);

      expect(mockCreateSession).toHaveBeenCalledWith(
        expect.objectContaining({
          description: 'Planning new feature',
        })
      );
    });

    it('should create session with tags', async () => {
      await runStartCommand(['--tags', 'feature,planning,v2']);

      expect(mockCreateSession).toHaveBeenCalledWith(
        expect.objectContaining({
          tags: ['feature', 'planning', 'v2'],
        })
      );
    });

    it('should create session with all options', async () => {
      await runStartCommand([
        '--project',
        'my-app',
        '--description',
        'Building login',
        '--tags',
        'auth,security',
      ]);

      expect(mockCreateSession).toHaveBeenCalledWith({
        projectName: 'my-app',
        description: 'Building login',
        tags: ['auth', 'security'],
      });
    });

    it('should trim whitespace from tags', async () => {
      await runStartCommand(['--tags', ' feature , planning , v2 ']);

      expect(mockCreateSession).toHaveBeenCalledWith(
        expect.objectContaining({
          tags: ['feature', 'planning', 'v2'],
        })
      );
    });
  });

  // ==========================================================================
  // Introduction Display Tests
  // ==========================================================================

  describe('introduction display', () => {
    it('should display session started header', async () => {
      const result = await runStartCommand([]);

      expect(result.stdout).toContain('Conversational Session Started');
    });

    it('should display project name', async () => {
      const result = await runStartCommand([]);

      expect(result.stdout).toContain('Project:');
      expect(result.stdout).toContain('test-project');
    });

    it('should display session ID', async () => {
      const result = await runStartCommand([]);

      expect(result.stdout).toContain('Session ID:');
      expect(result.stdout).toContain('test-session-123');
    });

    it('should display instructions', async () => {
      const result = await runStartCommand([]);

      expect(result.stdout).toContain('How it works:');
      expect(result.stdout).toContain('Share your ideas');
    });

    it('should display summarize command reference', async () => {
      const result = await runStartCommand([]);

      expect(result.stdout).toContain('/clavix:summarize');
    });

    it('should display exit commands', async () => {
      const result = await runStartCommand([]);

      expect(result.stdout).toContain('exit');
      expect(result.stdout).toContain('quit');
    });

    it('should display Ctrl+C instruction', async () => {
      const result = await runStartCommand([]);

      expect(result.stdout).toContain('Ctrl+C');
    });
  });

  // ==========================================================================
  // Conversation Loop Tests
  // ==========================================================================

  describe('conversation loop', () => {
    it('should prompt for user input', async () => {
      await runStartCommand([]);

      expect(mockPrompt).toHaveBeenCalled();
    });

    it('should exit on "exit" command', async () => {
      mockPrompt.mockReset();
      mockPrompt.mockResolvedValueOnce({ message: 'exit' });

      const result = await runStartCommand([]);

      expect(result.exitCode).toBe(0);
    });

    it('should exit on "quit" command', async () => {
      mockPrompt.mockReset();
      mockPrompt.mockResolvedValueOnce({ message: 'quit' });

      const result = await runStartCommand([]);

      expect(result.exitCode).toBe(0);
    });

    it('should exit on "bye" command', async () => {
      mockPrompt.mockReset();
      mockPrompt.mockResolvedValueOnce({ message: 'bye' });

      const result = await runStartCommand([]);

      expect(result.exitCode).toBe(0);
    });

    it('should exit on "done" command', async () => {
      mockPrompt.mockReset();
      mockPrompt.mockResolvedValueOnce({ message: 'done' });

      const result = await runStartCommand([]);

      expect(result.exitCode).toBe(0);
    });

    it('should be case insensitive for exit commands', async () => {
      mockPrompt.mockReset();
      mockPrompt.mockResolvedValueOnce({ message: 'EXIT' });

      const result = await runStartCommand([]);

      expect(result.exitCode).toBe(0);
    });

    it('should add user message to session', async () => {
      mockPrompt.mockReset();
      mockPrompt
        .mockResolvedValueOnce({ message: 'I want to build a login page' })
        .mockResolvedValueOnce({ message: 'exit' });

      await runStartCommand([]);

      expect(mockAddMessage).toHaveBeenCalledWith(
        'test-session-123',
        'user',
        'I want to build a login page'
      );
    });

    it('should skip empty messages', async () => {
      mockPrompt.mockReset();
      mockPrompt
        .mockResolvedValueOnce({ message: '' })
        .mockResolvedValueOnce({ message: '   ' })
        .mockResolvedValueOnce({ message: 'exit' });

      await runStartCommand([]);

      expect(mockAddMessage).not.toHaveBeenCalled();
    });

    it('should display acknowledgment after message', async () => {
      mockPrompt.mockReset();
      mockPrompt
        .mockResolvedValueOnce({ message: 'Build a REST API' })
        .mockResolvedValueOnce({ message: 'exit' });

      const result = await runStartCommand([]);

      expect(result.stdout).toContain('Assistant:');
    });

    it('should handle multiple messages in sequence', async () => {
      mockPrompt.mockReset();
      mockPrompt
        .mockResolvedValueOnce({ message: 'First message' })
        .mockResolvedValueOnce({ message: 'Second message' })
        .mockResolvedValueOnce({ message: 'exit' });

      await runStartCommand([]);

      expect(mockAddMessage).toHaveBeenCalledTimes(2);
      expect(mockAddMessage).toHaveBeenNthCalledWith(
        1,
        'test-session-123',
        'user',
        'First message'
      );
      expect(mockAddMessage).toHaveBeenNthCalledWith(
        2,
        'test-session-123',
        'user',
        'Second message'
      );
    });

    it('should cycle through acknowledgment messages', async () => {
      mockPrompt.mockReset();
      mockPrompt
        .mockResolvedValueOnce({ message: 'Message 1' })
        .mockResolvedValueOnce({ message: 'Message 2' })
        .mockResolvedValueOnce({ message: 'Message 3' })
        .mockResolvedValueOnce({ message: 'exit' });

      const result = await runStartCommand([]);

      // Should contain acknowledgments
      expect(result.stdout).toContain('Got it!');
    });
  });

  // ==========================================================================
  // Exit Information Tests
  // ==========================================================================

  describe('exit information', () => {
    it('should display session saved message on exit', async () => {
      const result = await runStartCommand([]);

      expect(result.stdout).toContain('Session saved successfully');
    });

    it('should display session details on exit', async () => {
      const result = await runStartCommand([]);

      expect(result.stdout).toContain('Session Details:');
    });

    it('should display session ID in exit info', async () => {
      const result = await runStartCommand([]);

      expect(result.stdout).toContain('test-session-123');
    });

    it('should display project name in exit info', async () => {
      const result = await runStartCommand([]);

      expect(result.stdout).toContain('test-project');
    });

    it('should display message count in exit info', async () => {
      mockGetSession.mockResolvedValue(
        createMockSessionData({
          messages: [{ role: 'user', content: 'Test', timestamp: new Date() }],
        })
      );

      const result = await runStartCommand([]);

      expect(result.stdout).toContain('Messages:');
    });

    it('should display tags in exit info when present', async () => {
      mockGetSession.mockResolvedValue(
        createMockSessionData({
          tags: ['feature', 'auth'],
        })
      );

      const result = await runStartCommand([]);

      expect(result.stdout).toContain('Tags:');
      expect(result.stdout).toContain('feature, auth');
    });

    it('should display description in exit info when present', async () => {
      mockGetSession.mockResolvedValue(
        createMockSessionData({
          description: 'Planning login feature',
        })
      );

      const result = await runStartCommand([]);

      expect(result.stdout).toContain('Description:');
      expect(result.stdout).toContain('Planning login feature');
    });

    it('should display session file path', async () => {
      const result = await runStartCommand([]);

      expect(result.stdout).toContain('.clavix/sessions');
      expect(result.stdout).toContain('.json');
    });

    it('should display next steps', async () => {
      const result = await runStartCommand([]);

      expect(result.stdout).toContain('Next steps:');
    });

    it('should display resume command', async () => {
      const result = await runStartCommand([]);

      expect(result.stdout).toContain('Resume:');
      expect(result.stdout).toContain('clavix start --resume');
    });

    it('should display summarize command', async () => {
      const result = await runStartCommand([]);

      expect(result.stdout).toContain('Summarize:');
      expect(result.stdout).toContain('clavix summarize');
    });

    it('should display view command', async () => {
      const result = await runStartCommand([]);

      expect(result.stdout).toContain('View:');
      expect(result.stdout).toContain('clavix show');
    });

    it('should handle missing session on exit', async () => {
      mockGetSession.mockResolvedValue(null);

      const result = await runStartCommand([]);

      expect(result.stdout).toContain('Warning');
      expect(result.stdout).toContain('Could not retrieve session');
    });
  });

  // ==========================================================================
  // Error Handling Tests
  // ==========================================================================

  describe('error handling', () => {
    it('should handle session creation failure', async () => {
      mockCreateSession.mockRejectedValue(new Error('Failed to create session'));

      const result = await runStartCommand([]);

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('Failed to create session');
    });

    it('should handle prompt error gracefully', async () => {
      mockPrompt.mockReset();
      mockPrompt.mockRejectedValue({ isTtyError: true });

      const result = await runStartCommand([]);

      // Should exit gracefully on TTY error
      expect(result.exitCode).toBe(0);
    });

    it('should handle user force close error', async () => {
      mockPrompt.mockReset();
      mockPrompt.mockRejectedValue({ message: 'User force closed the prompt' });

      const result = await runStartCommand([]);

      // Should exit gracefully on force close
      expect(result.exitCode).toBe(0);
    });

    it('should propagate unexpected errors', async () => {
      mockPrompt.mockReset();
      mockPrompt.mockRejectedValue(new Error('Unexpected database error'));

      const result = await runStartCommand([]);

      expect(result.exitCode).toBe(1);
    });

    it('should handle addMessage failure', async () => {
      mockPrompt.mockReset();
      mockPrompt
        .mockResolvedValueOnce({ message: 'Test message' })
        .mockResolvedValueOnce({ message: 'exit' });
      mockAddMessage.mockRejectedValue(new Error('Write failed'));

      const result = await runStartCommand([]);

      expect(result.exitCode).toBe(1);
    });
  });

  // ==========================================================================
  // Static Properties Tests
  // ==========================================================================

  describe('command static properties', () => {
    it('should have description', () => {
      expect(Start.description).toBeDefined();
      expect(typeof Start.description).toBe('string');
      expect(Start.description.length).toBeGreaterThan(0);
    });

    it('should have description mentioning conversation', () => {
      expect(Start.description.toLowerCase()).toContain('conversation');
    });

    it('should have examples', () => {
      expect(Start.examples).toBeDefined();
      expect(Array.isArray(Start.examples)).toBe(true);
      expect(Start.examples.length).toBeGreaterThan(0);
    });

    it('should have project flag defined', () => {
      expect(Start.flags).toBeDefined();
      expect(Start.flags.project).toBeDefined();
    });

    it('should have project flag with char shortcut', () => {
      expect(Start.flags.project.char).toBe('p');
    });

    it('should have description flag defined', () => {
      expect(Start.flags.description).toBeDefined();
    });

    it('should have description flag with char shortcut', () => {
      expect(Start.flags.description.char).toBe('d');
    });

    it('should have tags flag defined', () => {
      expect(Start.flags.tags).toBeDefined();
    });

    it('should have tags flag with char shortcut', () => {
      expect(Start.flags.tags.char).toBe('t');
    });
  });

  // ==========================================================================
  // Edge Cases Tests
  // ==========================================================================

  describe('edge cases', () => {
    it('should handle special characters in messages', async () => {
      mockPrompt.mockReset();
      mockPrompt
        .mockResolvedValueOnce({ message: 'Create émojis 🚀 and spëcial chars' })
        .mockResolvedValueOnce({ message: 'exit' });

      const result = await runStartCommand([]);

      expect(result.exitCode).toBe(0);
      expect(mockAddMessage).toHaveBeenCalledWith(
        'test-session-123',
        'user',
        'Create émojis 🚀 and spëcial chars'
      );
    });

    it('should handle very long messages', async () => {
      const longMessage = 'a'.repeat(1000);
      mockPrompt.mockReset();
      mockPrompt
        .mockResolvedValueOnce({ message: longMessage })
        .mockResolvedValueOnce({ message: 'exit' });

      const result = await runStartCommand([]);

      expect(result.exitCode).toBe(0);
      expect(mockAddMessage).toHaveBeenCalledWith('test-session-123', 'user', longMessage);
    });

    it('should handle markdown in messages', async () => {
      mockPrompt.mockReset();
      mockPrompt
        .mockResolvedValueOnce({ message: '# Title\n\n- Item 1\n- Item 2' })
        .mockResolvedValueOnce({ message: 'exit' });

      const result = await runStartCommand([]);

      expect(result.exitCode).toBe(0);
    });

    it('should handle code snippets in messages', async () => {
      mockPrompt.mockReset();
      mockPrompt
        .mockResolvedValueOnce({ message: 'Create a function like this: `function login() {}`' })
        .mockResolvedValueOnce({ message: 'exit' });

      const result = await runStartCommand([]);

      expect(result.exitCode).toBe(0);
    });

    it('should handle quotes in project name', async () => {
      const result = await runStartCommand(['--project', 'my "special" project']);

      expect(mockCreateSession).toHaveBeenCalledWith(
        expect.objectContaining({
          projectName: 'my "special" project',
        })
      );
    });

    it('should trim message whitespace', async () => {
      mockPrompt.mockReset();
      mockPrompt
        .mockResolvedValueOnce({ message: '  Build a login page  ' })
        .mockResolvedValueOnce({ message: 'exit' });

      await runStartCommand([]);

      expect(mockAddMessage).toHaveBeenCalledWith('test-session-123', 'user', 'Build a login page');
    });
  });
});
