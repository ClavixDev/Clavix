/**
 * Tests for init command functionality
 *
 * Uses jest.unstable_mockModule for ESM module mocking.
 */

import fs from 'fs-extra';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { createTestDir, cleanupTestDir } from '../helpers/cli-helpers';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create mock functions
const mockSelectIntegrations = jest.fn<() => Promise<string[]>>();
const mockInquirerPrompt = jest.fn<(questions: any[]) => Promise<any>>();

// Mock integration selector
jest.unstable_mockModule('../../src/utils/integration-selector.js', () => ({
  selectIntegrations: mockSelectIntegrations,
}));

// Mock inquirer
jest.unstable_mockModule('inquirer', () => ({
  default: {
    prompt: mockInquirerPrompt,
  },
}));

// Dynamic imports after mocking
const { default: Init } = await import('../../src/cli/commands/init.js');
const { FileSystem } = await import('../../src/utils/file-system.js');
const { DEFAULT_CONFIG } = await import('../../src/types/config.js');

// Helper to run command
async function runInitCommand(
  testDir: string
): Promise<{ stdout: string; stderr: string; exitCode: number; error?: Error }> {
  let stdout = '';
  let stderr = '';
  let exitCode = 0;
  let caughtError: Error | undefined;

  const mockOclifConfig = {
    runHook: jest.fn(),
    bin: 'clavix',
    dirname: 'clavix',
    pjson: { version: '1.0.0' },
    plugins: [],
    topicSeparator: ' ',
  };

  const cmd = new Init([], mockOclifConfig as any);

  const logSpy = jest.spyOn(console, 'log').mockImplementation((...args) => {
    stdout += args.join(' ') + '\n';
  });
  const errorSpy = jest.spyOn(console, 'error').mockImplementation((...args) => {
    stderr += args.join(' ') + '\n';
  });

  // Override command methods
  cmd.log = ((...args: any[]) => {
    stdout += args.join(' ') + '\n';
  }) as any;
  cmd.error = ((msg: any) => {
    stderr += (msg instanceof Error ? msg.message : msg) + '\n';
    throw msg instanceof Error ? msg : new Error(msg);
  }) as any;

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

describe('Init Command', () => {
  let testDir: string;
  let originalCwd: string;

  beforeEach(async () => {
    testDir = await createTestDir('init-cmd-test');
    originalCwd = process.cwd();
    process.chdir(testDir);

    // Reset mocks with default implementations
    jest.clearAllMocks();
    mockSelectIntegrations.mockResolvedValue(['claude-code']);
    mockInquirerPrompt.mockImplementation(async (questions: any[]) => {
      const answers: any = {};
      for (const q of questions) {
        if (q.name === 'reinit') answers.reinit = true;
        else if (q.name === 'cleanupAction') answers.cleanupAction = 'skip';
        else if (q.name === 'confirmCodex') answers.confirmCodex = true;
        else if (q.name === 'useNamespace') answers.useNamespace = true;
        else if (q.name === 'continueAnyway') answers.continueAnyway = true;
        else if (q.name === 'removeLegacy') answers.removeLegacy = true;
        else if (q.type === 'confirm') answers[q.name] = true;
        else answers[q.name] = 'test';
      }
      return answers;
    });
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    await cleanupTestDir(testDir);
  });

  describe('Fresh Initialization', () => {
    it('should initialize clavix in empty directory', async () => {
      const result = await runInitCommand(testDir);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Clavix initialized successfully');

      // Verify directory structure
      expect(await fs.pathExists('.clavix')).toBe(true);
      expect(await fs.pathExists('.clavix/config.json')).toBe(true);
      expect(await fs.pathExists('.clavix/sessions')).toBe(true);
      expect(await fs.pathExists('.clavix/outputs')).toBe(true);
      expect(await fs.pathExists('.clavix/INSTRUCTIONS.md')).toBe(true);

      // Verify config content
      const config = await fs.readJSON('.clavix/config.json');
      expect(config.integrations).toContain('claude-code');
    });

    it('should generate commands for selected integration', async () => {
      mockSelectIntegrations.mockResolvedValueOnce(['droid']);

      const result = await runInitCommand(testDir);

      expect(result.exitCode).toBe(0);
      // The message is "Generating Droid CLI commands" for the droid integration
      expect(result.stdout).toContain('Droid CLI commands');
    });

    it('should abort if no integrations selected', async () => {
      mockSelectIntegrations.mockResolvedValueOnce([]);

      const result = await runInitCommand(testDir);

      expect(result.exitCode).toBe(0); // Returns 0 but stops
      expect(result.stdout).toContain('No integrations selected');
      expect(await fs.pathExists('.clavix')).toBe(false);
    });
  });

  describe('Re-initialization', () => {
    beforeEach(async () => {
      // Setup existing clavix
      await fs.ensureDir('.clavix');
      await fs.writeJSON('.clavix/config.json', {
        ...DEFAULT_CONFIG,
        integrations: ['cursor'],
      });
    });

    it('should prompt for re-initialization and proceed if confirmed', async () => {
      const result = await runInitCommand(testDir);

      expect(result.exitCode).toBe(0);
      // The reinit prompt message is handled by inquirer internally and doesn't appear in stdout
      // We verify re-init happened by checking the final success message and that the mock was called
      expect(result.stdout).toContain('Clavix initialized successfully');
      // Also verify inquirer was called with reinit question
      expect(mockInquirerPrompt).toHaveBeenCalled();
    });

    it('should preserve existing config integrations during selection if desired', async () => {
      await runInitCommand(testDir);

      expect(mockSelectIntegrations).toHaveBeenCalledWith(
        expect.anything(),
        expect.arrayContaining(['cursor'])
      );
    });

    it('should handle deselected integrations cleanup', async () => {
      // Existing is 'cursor', new selection is 'claude-code' (default mock)
      // Helper mock sets cleanupAction: 'skip' (default)

      const result = await runInitCommand(testDir);

      expect(result.stdout).toContain('Previously configured but not selected');
      expect(result.stdout).toContain('cursor');
      // 'skip' action means no removal log
    });
  });

  describe('Edge Cases & Error Handling', () => {
    it('should handle write errors gracefully', async () => {
      jest.spyOn(FileSystem, 'writeFileAtomic').mockRejectedValue(new Error('Permission denied'));

      const result = await runInitCommand(testDir);

      // Should catch error and throw/log
      expect(result.exitCode).not.toBe(0);
      // The error message appears in stderr (console.error) and contains "Initialization failed"
      expect(result.stderr).toContain('Initialization failed');
    });
  });
});
