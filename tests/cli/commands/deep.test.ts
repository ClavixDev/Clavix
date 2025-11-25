/**
 * Deep Command Tests
 *
 * Direct tests for the Deep CLI command class.
 * Uses real UniversalOptimizer for integration-style testing.
 * Mocks PromptManager for file system operations.
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
const mockSavePrompt = jest.fn<() => Promise<any>>();

// Mock PromptManager to avoid file system operations
jest.unstable_mockModule('../../../src/core/prompt-manager.js', () => ({
  PromptManager: jest.fn().mockImplementation(() => ({
    savePrompt: mockSavePrompt,
  })),
}));

// ============================================================================
// Import command AFTER mocks
// ============================================================================

const { default: Deep } = await import('../../../src/cli/commands/deep.js');

// ============================================================================
// Test Helpers
// ============================================================================

/**
 * Run Deep command with proper mocking
 */
async function runDeepCommand(
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

  const cmd = new Deep(args, mockOclifConfig as any);

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

describe('Deep Command', () => {
  let testDir: string;
  let originalCwd: string;

  beforeEach(async () => {
    // Reset all mocks
    jest.clearAllMocks();

    // Setup test directory
    testDir = await createTestDir('deep-cmd-test');
    originalCwd = process.cwd();
    process.chdir(testDir);

    // Initialize .clavix directory
    await fs.ensureDir(path.join(testDir, '.clavix', 'outputs', 'prompts', 'deep'));

    // Setup default mock behaviors
    mockSavePrompt.mockResolvedValue({ id: 'test-id', path: '/test/path' });
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    await cleanupTestDir(testDir);
  });

  // ==========================================================================
  // Input Validation Tests
  // ==========================================================================

  describe('input validation', () => {
    it('should reject empty prompt', async () => {
      const result = await runDeepCommand(['']);

      expect(result.stdout).toContain('Please provide a prompt');
    });

    it('should reject whitespace-only prompt', async () => {
      const result = await runDeepCommand(['   ']);

      expect(result.stdout).toContain('Please provide a prompt');
    });

    it('should show error example for empty prompt', async () => {
      const result = await runDeepCommand(['']);

      expect(result.stdout).toContain('Example');
      expect(result.stdout).toContain('clavix deep');
    });

    it('should accept valid prompt', async () => {
      const result = await runDeepCommand(['Create a login page']);

      expect(result.stdout).toContain('comprehensive deep analysis');
    });

    it('should handle prompt with special characters', async () => {
      const result = await runDeepCommand(['Create émojis 🚀 and spëcial chars']);

      expect(result.stdout).toContain('comprehensive deep analysis');
      expect(result.exitCode).toBe(0);
    });
  });

  // ==========================================================================
  // Normal Flow Tests
  // ==========================================================================

  describe('normal optimization flow', () => {
    it('should show analyzing message', async () => {
      const result = await runDeepCommand(['Create a login page']);

      expect(result.stdout).toContain('comprehensive deep analysis');
    });

    it('should show time estimate message', async () => {
      const result = await runDeepCommand(['Create a login page']);

      expect(result.stdout).toContain('15 seconds');
    });

    it('should display deep analysis complete header', async () => {
      const result = await runDeepCommand(['Create a login page']);

      expect(result.stdout).toContain('Deep Analysis Complete');
    });

    it('should display intent analysis', async () => {
      const result = await runDeepCommand(['Create a login page']);

      expect(result.stdout).toContain('Intent Analysis');
    });

    it('should display intent type', async () => {
      const result = await runDeepCommand(['Create a login page']);

      expect(result.stdout).toContain('Type:');
    });

    it('should display intent confidence', async () => {
      const result = await runDeepCommand(['Create a login page']);

      expect(result.stdout).toContain('Confidence:');
      expect(result.stdout).toMatch(/\d+%/);
    });

    it('should display characteristics section', async () => {
      const result = await runDeepCommand(['Create a login page']);

      expect(result.stdout).toContain('Characteristics');
    });

    it('should display code context flag', async () => {
      const result = await runDeepCommand(['Create a login page']);

      expect(result.stdout).toContain('Has code context');
    });

    it('should display technical terms flag', async () => {
      const result = await runDeepCommand(['Create a login page']);

      expect(result.stdout).toContain('Technical terms');
    });

    it('should display open-ended flag', async () => {
      const result = await runDeepCommand(['Create a login page']);

      expect(result.stdout).toContain('Open-ended');
    });

    it('should display needs structure flag', async () => {
      const result = await runDeepCommand(['Create a login page']);

      expect(result.stdout).toContain('Needs structure');
    });
  });

  // ==========================================================================
  // Quality Display Tests
  // ==========================================================================

  describe('quality display', () => {
    it('should display quality metrics section', async () => {
      const result = await runDeepCommand(['Create a login page']);

      expect(result.stdout).toContain('Quality Metrics');
    });

    it('should display all quality dimensions', async () => {
      const result = await runDeepCommand(['Create a login page']);

      expect(result.stdout).toContain('Clarity');
      expect(result.stdout).toContain('Efficiency');
      expect(result.stdout).toContain('Structure');
      expect(result.stdout).toContain('Completeness');
      expect(result.stdout).toContain('Actionability');
      expect(result.stdout).toContain('Overall');
    });

    it('should display strengths when present', async () => {
      const result = await runDeepCommand([
        'As a senior developer, create a TypeScript authentication module with JWT support, password hashing, and comprehensive error handling',
      ]);

      expect(result.stdout).toContain('Strengths');
    });

    it('should display improvements when applied', async () => {
      const result = await runDeepCommand(['Create a login page']);

      expect(result.stdout).toContain('Improvements Applied');
    });
  });

  // ==========================================================================
  // Deep Mode Exclusive Features Tests
  // ==========================================================================

  describe('deep mode exclusive features', () => {
    it('should display enhanced prompt', async () => {
      const result = await runDeepCommand(['Create a login page']);

      expect(result.stdout).toContain('Enhanced Prompt');
    });

    it('should display alternative approaches section', async () => {
      const result = await runDeepCommand(['Create a login page']);

      // AlternativePhrasingGenerator pattern creates this section
      expect(result.stdout).toContain('Alternative Approaches');
    });

    it('should display validation checklist section', async () => {
      const result = await runDeepCommand(['Create a login page']);

      // ValidationChecklistCreator pattern creates this section
      expect(result.stdout).toContain('Validation Checklist');
    });

    it('should display edge cases section', async () => {
      const result = await runDeepCommand(['Create a login page']);

      // EdgeCaseIdentifier pattern creates this section
      expect(result.stdout).toContain('Edge Cases to Consider');
    });

    it('should display patterns applied', async () => {
      const result = await runDeepCommand(['Create a login page']);

      expect(result.stdout).toContain('Patterns Applied');
    });

    it('should display processing time', async () => {
      const result = await runDeepCommand(['Create a login page']);

      expect(result.stdout).toContain('Processed in');
      expect(result.stdout).toMatch(/\d+ms/);
    });

    it('should display tip message', async () => {
      const result = await runDeepCommand(['Create a login page']);

      expect(result.stdout).toContain('Tip:');
    });
  });

  // ==========================================================================
  // Edge Cases Display Tests
  // ==========================================================================

  describe('edge cases display', () => {
    it('should show code-specific edge cases for code generation prompts', async () => {
      const result = await runDeepCommand(['Create a REST API endpoint']);

      expect(result.stdout).toContain('Edge Cases to Consider');
      // Code generation edge cases from EdgeCaseIdentifier pattern
      expect(result.stdout).toContain('Boundary conditions');
    });

    it('should apply patterns to planning prompts', async () => {
      const result = await runDeepCommand(['Plan the architecture for a microservices system']);

      // Planning prompts get alternative approaches from AlternativePhrasingGenerator
      expect(result.stdout).toContain('Alternative Approaches');
      // Planning alternatives from the pattern
      expect(result.stdout).toContain('Top-Down Design');
    });

    it('should show code-specific validation items for code generation', async () => {
      const result = await runDeepCommand(['Create a REST API endpoint']);

      expect(result.stdout).toContain('Validation Checklist');
      // ValidationChecklistCreator generates these for code-generation intent
      expect(result.stdout).toContain('Edge cases are handled gracefully');
    });
  });

  // ==========================================================================
  // Analysis Only Flag Tests
  // ==========================================================================

  describe('--analysis-only flag', () => {
    it('should display intent analysis with --analysis-only', async () => {
      const result = await runDeepCommand(['Create a login page', '--analysis-only']);

      expect(result.stdout).toContain('Intent Analysis');
    });

    it('should display characteristics with --analysis-only', async () => {
      const result = await runDeepCommand(['Create a login page', '--analysis-only']);

      expect(result.stdout).toContain('Has code context');
      expect(result.stdout).toContain('Technical terms');
      expect(result.stdout).toContain('Open-ended');
      expect(result.stdout).toContain('Needs structure');
    });

    it('should display quality scores with --analysis-only', async () => {
      const result = await runDeepCommand(['Create a login page', '--analysis-only']);

      expect(result.stdout).toContain('Quality Scores');
    });

    it('should not display enhanced prompt with --analysis-only', async () => {
      const result = await runDeepCommand(['Create a login page', '--analysis-only']);

      expect(result.stdout).not.toContain('Enhanced Prompt');
    });

    it('should not display alternative approaches with --analysis-only', async () => {
      const result = await runDeepCommand(['Create a login page', '--analysis-only']);

      expect(result.stdout).not.toContain('Alternative Approaches');
    });

    it('should not display validation checklist with --analysis-only', async () => {
      const result = await runDeepCommand(['Create a login page', '--analysis-only']);

      expect(result.stdout).not.toContain('Validation Checklist');
    });

    it('should not save prompt with --analysis-only', async () => {
      await runDeepCommand(['Create a login page', '--analysis-only']);

      expect(mockSavePrompt).not.toHaveBeenCalled();
    });

    it('should display strengths with --analysis-only when present', async () => {
      const result = await runDeepCommand([
        'As a senior developer, create a TypeScript component',
        '--analysis-only',
      ]);

      expect(result.stdout).toContain('Strengths');
    });
  });

  // ==========================================================================
  // Prompt Saving Tests
  // ==========================================================================

  describe('prompt saving', () => {
    it('should save prompt after analysis', async () => {
      await runDeepCommand(['Create a login page']);

      expect(mockSavePrompt).toHaveBeenCalled();
    });

    it('should save to deep mode directory', async () => {
      const result = await runDeepCommand(['Create a login page']);

      expect(result.stdout).toContain('Saved prompt');
      expect(result.stdout).toContain('deep');
    });

    it('should handle savePrompt failure gracefully', async () => {
      mockSavePrompt.mockRejectedValue(new Error('Write failed'));

      const result = await runDeepCommand(['Create a login page']);

      expect(result.stdout).toContain('Could not save prompt');
      expect(result.exitCode).toBe(0); // Should not fail the command
    });

    it('should display error message on save failure', async () => {
      mockSavePrompt.mockRejectedValue(new Error('Disk full'));

      const result = await runDeepCommand(['Create a login page']);

      expect(result.stdout).toContain('Disk full');
    });
  });

  // ==========================================================================
  // Edge Cases
  // ==========================================================================

  describe('edge cases', () => {
    it('should handle markdown in prompt', async () => {
      const result = await runDeepCommand([
        '# Create a login page\n\n- Email field\n- Password field',
      ]);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('comprehensive deep analysis');
    });

    it('should handle code snippets in prompt', async () => {
      const result = await runDeepCommand(['Create a function like this: `function login() {}`']);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('comprehensive deep analysis');
    });

    it('should handle newlines in prompt', async () => {
      const result = await runDeepCommand(['Create a login page\nwith email\nand password']);

      expect(result.exitCode).toBe(0);
    });

    it('should handle quotes in prompt', async () => {
      const result = await runDeepCommand(['Create a login page with "remember me" option']);

      expect(result.exitCode).toBe(0);
    });

    it('should handle very long prompts', async () => {
      const longPrompt = 'a'.repeat(200) + ' Create a login page';
      const result = await runDeepCommand([longPrompt]);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('comprehensive deep analysis');
    });
  });

  // ==========================================================================
  // Static Properties Tests
  // ==========================================================================

  describe('command static properties', () => {
    it('should have description', () => {
      expect(Deep.description).toBeDefined();
      expect(typeof Deep.description).toBe('string');
      expect(Deep.description.length).toBeGreaterThan(0);
    });

    it('should have description mentioning deep analysis', () => {
      expect(Deep.description.toLowerCase()).toContain('deep');
    });

    it('should have examples', () => {
      expect(Deep.examples).toBeDefined();
      expect(Array.isArray(Deep.examples)).toBe(true);
      expect(Deep.examples.length).toBeGreaterThan(0);
    });

    it('should have prompt argument defined', () => {
      expect(Deep.args).toBeDefined();
      expect(Deep.args.prompt).toBeDefined();
      expect(Deep.args.prompt.required).toBe(true);
    });

    it('should have prompt argument description', () => {
      expect(Deep.args.prompt.description).toBeDefined();
      expect(typeof Deep.args.prompt.description).toBe('string');
    });

    it('should have analysis-only flag defined', () => {
      expect(Deep.flags).toBeDefined();
      expect(Deep.flags['analysis-only']).toBeDefined();
    });

    it('should have analysis-only flag with description', () => {
      expect(Deep.flags['analysis-only'].description).toBeDefined();
    });
  });
});
