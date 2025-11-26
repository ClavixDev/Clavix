/**
 * Summarize Command Tests
 *
 * Direct tests for the Summarize CLI command class.
 * Mocks SessionManager, ConversationAnalyzer, UniversalOptimizer, and FileSystem.
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
const mockGetSession = jest.fn<() => Promise<any>>();
const mockGetActiveSession = jest.fn<() => Promise<any>>();
const mockAnalyze = jest.fn<() => any>();
const mockGenerateMiniPrd = jest.fn<() => string>();
const mockGenerateOptimizedPrompt = jest.fn<() => string>();
const mockOptimize = jest.fn<() => Promise<any>>();
const mockEnsureDir = jest.fn<() => Promise<void>>();
const mockWriteFileAtomic = jest.fn<() => Promise<void>>();

// Mock SessionManager
jest.unstable_mockModule('../../../src/core/session-manager.js', () => ({
  SessionManager: jest.fn().mockImplementation(() => ({
    getSession: mockGetSession,
    getActiveSession: mockGetActiveSession,
  })),
}));

// Mock ConversationAnalyzer
jest.unstable_mockModule('../../../src/core/conversation-analyzer.js', () => ({
  ConversationAnalyzer: jest.fn().mockImplementation(() => ({
    analyze: mockAnalyze,
    generateMiniPrd: mockGenerateMiniPrd,
    generateOptimizedPrompt: mockGenerateOptimizedPrompt,
  })),
}));

// Mock UniversalOptimizer
jest.unstable_mockModule('../../../src/core/intelligence/index.js', () => ({
  UniversalOptimizer: jest.fn().mockImplementation(() => ({
    optimize: mockOptimize,
  })),
}));

// Mock FileSystem
jest.unstable_mockModule('../../../src/utils/file-system.js', () => ({
  FileSystem: {
    ensureDir: mockEnsureDir,
    writeFileAtomic: mockWriteFileAtomic,
  },
}));

// ============================================================================
// Import command AFTER mocks
// ============================================================================

const { default: Summarize } = await import('../../../src/cli/commands/summarize.js');

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
    messages: [
      {
        role: 'user',
        content: 'Build a login page with email and password',
        timestamp: new Date(),
      },
      { role: 'assistant', content: 'I can help with that', timestamp: new Date() },
      { role: 'user', content: 'It should use React and TypeScript', timestamp: new Date() },
    ],
    tags: undefined,
    description: undefined,
    ...overrides,
  };
}

/**
 * Create a mock analysis result
 */
function createMockAnalysis(overrides: Partial<any> = {}) {
  return {
    summary: 'Build a login page with email and password using React and TypeScript',
    keyRequirements: ['Email field', 'Password field', 'Form validation'],
    technicalConstraints: ['Use React', 'Use TypeScript'],
    successCriteria: ['User can log in', 'Form validates input'],
    outOfScope: [],
    additionalContext: [],
    ...overrides,
  };
}

/**
 * Create a mock optimization result
 */
function createMockOptimizationResult(overrides: Partial<any> = {}) {
  return {
    enhanced:
      'Create a secure login page with email validation, password field, and proper error handling using React and TypeScript.',
    original: 'Build a login page',
    depthLevel: 'standard',
    intent: { primaryIntent: 'code-generation', confidence: 85 },
    quality: { overall: 78 },
    improvements: [{ description: 'Added specificity', dimension: 'clarity', impact: 'medium' }],
    ...overrides,
  };
}

/**
 * Run Summarize command with proper mocking
 */
async function runSummarizeCommand(
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

  const cmd = new Summarize(args, mockOclifConfig as any);

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

describe('Summarize Command', () => {
  let testDir: string;
  let originalCwd: string;

  beforeEach(async () => {
    // Reset all mocks
    jest.clearAllMocks();

    // Setup test directory
    testDir = await createTestDir('summarize-cmd-test');
    originalCwd = process.cwd();
    process.chdir(testDir);

    // Initialize .clavix directory
    await fs.ensureDir(path.join(testDir, '.clavix', 'outputs'));
    await fs.ensureDir(path.join(testDir, '.clavix', 'sessions'));

    // Setup default mock behaviors
    const mockSession = createMockSessionData();
    const mockAnalysis = createMockAnalysis();
    const mockOptResult = createMockOptimizationResult();

    mockGetSession.mockResolvedValue(mockSession);
    mockGetActiveSession.mockResolvedValue(mockSession);
    mockAnalyze.mockReturnValue(mockAnalysis);
    mockGenerateMiniPrd.mockReturnValue('# Mini-PRD\n\nProject summary...');
    mockGenerateOptimizedPrompt.mockReturnValue('Create a login page with...');
    mockOptimize.mockResolvedValue(mockOptResult);
    mockEnsureDir.mockResolvedValue(undefined);
    mockWriteFileAtomic.mockResolvedValue(undefined);
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    await cleanupTestDir(testDir);
  });

  // ==========================================================================
  // Session Loading Tests
  // ==========================================================================

  describe('session loading', () => {
    it('should load session by ID', async () => {
      await runSummarizeCommand(['test-session-123']);

      expect(mockGetSession).toHaveBeenCalledWith('test-session-123');
    });

    it('should load active session with --active flag', async () => {
      await runSummarizeCommand(['--active']);

      expect(mockGetActiveSession).toHaveBeenCalled();
    });

    it('should load active session by default', async () => {
      await runSummarizeCommand([]);

      expect(mockGetActiveSession).toHaveBeenCalled();
    });

    it('should error when session not found', async () => {
      mockGetSession.mockResolvedValue(null);

      const result = await runSummarizeCommand(['non-existent-id']);

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('Session not found');
    });

    it('should error when no active session exists', async () => {
      mockGetActiveSession.mockResolvedValue(null);

      const result = await runSummarizeCommand(['--active']);

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('No active session found');
    });

    it('should show help when no active session by default', async () => {
      mockGetActiveSession.mockResolvedValue(null);

      const result = await runSummarizeCommand([]);

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('clavix summarize <session-id>');
      expect(result.stderr).toContain('clavix list');
    });
  });

  // ==========================================================================
  // Display Tests
  // ==========================================================================

  describe('display output', () => {
    it('should display header', async () => {
      const result = await runSummarizeCommand(['test-session-123']);

      expect(result.stdout).toContain('Conversation Summarizer');
    });

    it('should display session information', async () => {
      const result = await runSummarizeCommand(['test-session-123']);

      expect(result.stdout).toContain('Session Information');
      expect(result.stdout).toContain('test-session-123');
      expect(result.stdout).toContain('test-project');
    });

    it('should display message count', async () => {
      const result = await runSummarizeCommand(['test-session-123']);

      expect(result.stdout).toContain('Messages:');
    });

    it('should display analyzing message', async () => {
      const result = await runSummarizeCommand(['test-session-123']);

      expect(result.stdout).toContain('Analyzing conversation');
    });

    it('should display analysis summary', async () => {
      const result = await runSummarizeCommand(['test-session-123']);

      expect(result.stdout).toContain('Analysis Summary');
    });

    it('should display key requirements', async () => {
      mockAnalyze.mockReturnValue(
        createMockAnalysis({
          keyRequirements: ['Email field', 'Password field'],
        })
      );

      const result = await runSummarizeCommand(['test-session-123']);

      expect(result.stdout).toContain('Key Requirements');
    });

    it('should display technical constraints', async () => {
      mockAnalyze.mockReturnValue(
        createMockAnalysis({
          technicalConstraints: ['Use React'],
        })
      );

      const result = await runSummarizeCommand(['test-session-123']);

      expect(result.stdout).toContain('Technical Constraints');
    });

    it('should display success criteria', async () => {
      mockAnalyze.mockReturnValue(
        createMockAnalysis({
          successCriteria: ['User can log in'],
        })
      );

      const result = await runSummarizeCommand(['test-session-123']);

      expect(result.stdout).toContain('Success Criteria');
    });

    it('should truncate long requirements list', async () => {
      mockAnalyze.mockReturnValue(
        createMockAnalysis({
          keyRequirements: ['Req 1', 'Req 2', 'Req 3', 'Req 4', 'Req 5', 'Req 6', 'Req 7'],
        })
      );

      const result = await runSummarizeCommand(['test-session-123']);

      expect(result.stdout).toContain('and 2 more');
    });

    it('should display generating output message', async () => {
      const result = await runSummarizeCommand(['test-session-123']);

      expect(result.stdout).toContain('Generating output files');
    });

    it('should display completion message', async () => {
      const result = await runSummarizeCommand(['test-session-123']);

      expect(result.stdout).toContain('Analysis complete');
    });

    it('should display generated files list', async () => {
      const result = await runSummarizeCommand(['test-session-123']);

      expect(result.stdout).toContain('Generated files');
      expect(result.stdout).toContain('mini-prd.md');
      expect(result.stdout).toContain('original-prompt.md');
      expect(result.stdout).toContain('optimized-prompt.md');
    });

    it('should display output location', async () => {
      const result = await runSummarizeCommand(['test-session-123']);

      expect(result.stdout).toContain('Output location');
    });

    it('should display next steps', async () => {
      const result = await runSummarizeCommand(['test-session-123']);

      expect(result.stdout).toContain('Next steps');
      expect(result.stdout).toContain('clavix implement');
    });
  });

  // ==========================================================================
  // File Generation Tests
  // ==========================================================================

  describe('file generation', () => {
    it('should create output directory', async () => {
      await runSummarizeCommand(['test-session-123']);

      expect(mockEnsureDir).toHaveBeenCalled();
    });

    it('should generate mini-PRD file', async () => {
      await runSummarizeCommand(['test-session-123']);

      expect(mockGenerateMiniPrd).toHaveBeenCalled();
      expect(mockWriteFileAtomic).toHaveBeenCalledWith(
        expect.stringContaining('mini-prd.md'),
        expect.any(String)
      );
    });

    it('should generate original prompt file', async () => {
      await runSummarizeCommand(['test-session-123']);

      expect(mockGenerateOptimizedPrompt).toHaveBeenCalled();
      expect(mockWriteFileAtomic).toHaveBeenCalledWith(
        expect.stringContaining('original-prompt.md'),
        expect.any(String)
      );
    });

    it('should optimize the prompt', async () => {
      await runSummarizeCommand(['test-session-123']);

      expect(mockOptimize).toHaveBeenCalled();
    });

    it('should save optimized prompt', async () => {
      await runSummarizeCommand(['test-session-123']);

      expect(mockWriteFileAtomic).toHaveBeenCalledWith(
        expect.stringContaining('optimized-prompt.md'),
        expect.any(String)
      );
    });

    it('should use custom output directory', async () => {
      await runSummarizeCommand(['test-session-123', '--output', 'custom/output']);

      expect(mockEnsureDir).toHaveBeenCalledWith('custom/output');
    });

    it('should sanitize project name for output path', async () => {
      mockGetSession.mockResolvedValue(
        createMockSessionData({
          projectName: 'My "Special" Project!',
        })
      );

      await runSummarizeCommand(['test-session-123']);

      expect(mockEnsureDir).toHaveBeenCalledWith(expect.stringMatching(/my-special-project/));
    });
  });

  // ==========================================================================
  // Optimization Tests
  // ==========================================================================

  describe('optimization', () => {
    it('should display optimization results', async () => {
      const result = await runSummarizeCommand(['test-session-123']);

      expect(result.stdout).toContain('Optimization Results');
    });

    it('should display intent type', async () => {
      const result = await runSummarizeCommand(['test-session-123']);

      expect(result.stdout).toContain('Intent:');
      expect(result.stdout).toContain('code-generation');
    });

    it('should display quality score', async () => {
      const result = await runSummarizeCommand(['test-session-123']);

      expect(result.stdout).toContain('Quality:');
    });

    it('should display improvements count', async () => {
      const result = await runSummarizeCommand(['test-session-123']);

      expect(result.stdout).toContain('Improvements:');
    });

    it('should handle optimization failure gracefully', async () => {
      mockOptimize.mockRejectedValue(new Error('Optimization failed'));

      const result = await runSummarizeCommand(['test-session-123']);

      expect(result.stdout).toContain('Could not optimize prompt');
      expect(result.exitCode).toBe(0);
    });

    it('should fallback to original when optimization fails', async () => {
      mockOptimize.mockRejectedValue(new Error('Optimization failed'));

      await runSummarizeCommand(['test-session-123']);

      // Should still save optimized-prompt.md (with original content)
      expect(mockWriteFileAtomic).toHaveBeenCalledWith(
        expect.stringContaining('optimized-prompt.md'),
        expect.any(String)
      );
    });
  });

  // ==========================================================================
  // Error Handling Tests
  // ==========================================================================

  describe('error handling', () => {
    it('should error when session has no messages', async () => {
      mockGetSession.mockResolvedValue(
        createMockSessionData({
          messages: [],
        })
      );

      const result = await runSummarizeCommand(['test-session-123']);

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('no messages to analyze');
    });

    it('should handle file write errors', async () => {
      mockWriteFileAtomic.mockRejectedValue(new Error('Write failed'));

      const result = await runSummarizeCommand(['test-session-123']);

      expect(result.exitCode).toBe(1);
    });

    it('should handle analysis errors', async () => {
      mockAnalyze.mockImplementation(() => {
        throw new Error('Analysis failed');
      });

      const result = await runSummarizeCommand(['test-session-123']);

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('Analysis failed');
    });
  });

  // ==========================================================================
  // Static Properties Tests
  // ==========================================================================

  describe('command static properties', () => {
    it('should have description', () => {
      expect(Summarize.description).toBeDefined();
      expect(typeof Summarize.description).toBe('string');
      expect(Summarize.description.length).toBeGreaterThan(0);
    });

    it('should have description mentioning analysis', () => {
      expect(Summarize.description.toLowerCase()).toContain('analy');
    });

    it('should have examples', () => {
      expect(Summarize.examples).toBeDefined();
      expect(Array.isArray(Summarize.examples)).toBe(true);
      expect(Summarize.examples.length).toBeGreaterThan(0);
    });

    it('should have sessionId arg defined', () => {
      expect(Summarize.args).toBeDefined();
      expect(Summarize.args.sessionId).toBeDefined();
    });

    it('should have sessionId arg as optional', () => {
      expect(Summarize.args.sessionId.required).toBe(false);
    });

    it('should have active flag defined', () => {
      expect(Summarize.flags).toBeDefined();
      expect(Summarize.flags.active).toBeDefined();
    });

    it('should have active flag with char shortcut', () => {
      expect(Summarize.flags.active.char).toBe('a');
    });

    it('should have output flag defined', () => {
      expect(Summarize.flags.output).toBeDefined();
    });

    it('should have output flag with char shortcut', () => {
      expect(Summarize.flags.output.char).toBe('o');
    });
  });

  // ==========================================================================
  // Edge Cases Tests
  // ==========================================================================

  describe('edge cases', () => {
    it('should handle session with single message', async () => {
      mockGetSession.mockResolvedValue(
        createMockSessionData({
          messages: [{ role: 'user', content: 'Build something', timestamp: new Date() }],
        })
      );

      const result = await runSummarizeCommand(['test-session-123']);

      expect(result.exitCode).toBe(0);
    });

    it('should handle session with many messages', async () => {
      const manyMessages = Array.from({ length: 50 }, (_, i) => ({
        role: i % 2 === 0 ? 'user' : 'assistant',
        content: `Message ${i + 1}`,
        timestamp: new Date(),
      }));

      mockGetSession.mockResolvedValue(
        createMockSessionData({
          messages: manyMessages,
        })
      );

      const result = await runSummarizeCommand(['test-session-123']);

      expect(result.exitCode).toBe(0);
    });

    it('should handle project name with special characters', async () => {
      mockGetSession.mockResolvedValue(
        createMockSessionData({
          projectName: 'project@#$%^&*()',
        })
      );

      const result = await runSummarizeCommand(['test-session-123']);

      expect(result.exitCode).toBe(0);
    });

    it('should handle empty project name', async () => {
      mockGetSession.mockResolvedValue(
        createMockSessionData({
          projectName: '',
        })
      );

      await runSummarizeCommand(['test-session-123']);

      // Should sanitize to 'unnamed-project'
      expect(mockEnsureDir).toHaveBeenCalledWith(expect.stringContaining('unnamed-project'));
    });

    it('should handle analysis with no requirements', async () => {
      mockAnalyze.mockReturnValue(
        createMockAnalysis({
          keyRequirements: [],
          technicalConstraints: [],
          successCriteria: [],
        })
      );

      const result = await runSummarizeCommand(['test-session-123']);

      expect(result.exitCode).toBe(0);
    });

    it('should handle optimization with no improvements', async () => {
      mockOptimize.mockResolvedValue(
        createMockOptimizationResult({
          improvements: [],
        })
      );

      const result = await runSummarizeCommand(['test-session-123']);

      expect(result.exitCode).toBe(0);
    });
  });
});
