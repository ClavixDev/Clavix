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

    // Reset mocks with default implementations (resetAllMocks clears implementations too)
    jest.resetAllMocks();
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

      // Verify directory structure (sessions removed in v5.3)
      expect(await fs.pathExists('.clavix')).toBe(true);
      expect(await fs.pathExists('.clavix/config.json')).toBe(true);
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

  describe('Reconfiguration Menu (v5.3)', () => {
    beforeEach(async () => {
      // Setup existing clavix installation
      await fs.ensureDir('.clavix');
      await fs.writeJSON('.clavix/config.json', {
        ...DEFAULT_CONFIG,
        integrations: ['claude-code'],
      });
    });

    it('should show reconfiguration menu when project already initialized', async () => {
      // Mock to show reconfigure menu is presented
      mockInquirerPrompt.mockImplementationOnce(async (questions: any[]) => {
        // Verify the reconfiguration menu question exists
        const reconfigQuestion = questions.find((q: any) => q.name === 'action');
        expect(reconfigQuestion).toBeDefined();
        if (reconfigQuestion) {
          expect(reconfigQuestion.type).toBe('list');
          expect(reconfigQuestion.choices).toBeDefined();
        }
        return { action: 'cancel' };
      });

      const result = await runInitCommand(testDir);

      expect(result.stdout).toContain('Clavix Initialization');
      expect(result.stdout).toContain('cancelled');
    });

    it('should handle "Cancel" option from reconfiguration menu', async () => {
      mockInquirerPrompt.mockImplementationOnce(async () => ({ action: 'cancel' }));

      const result = await runInitCommand(testDir);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('cancelled');
      // Config should remain unchanged
      const config = await fs.readJSON('.clavix/config.json');
      expect(config.integrations).toContain('claude-code');
    });

    it('should handle "Reconfigure integrations" option', async () => {
      // This test verifies the reconfigure action path exists
      // The actual reconfigure calls selectIntegrations which we already test in Re-initialization
      mockInquirerPrompt.mockImplementationOnce(async () => ({ action: 'reconfigure' }));
      // selectIntegrations returns new selections (already set in global beforeEach to ['claude-code'])

      const result = await runInitCommand(testDir);

      expect(result.exitCode).toBe(0);
      // Verify integrations were updated (mock returns claude-code by default)
      const config = await fs.readJSON('.clavix/config.json');
      expect(config.integrations).toContain('claude-code');
      // The main verification is that the command completed without error
    });

    it('should handle "Update existing" option to regenerate commands', async () => {
      // First prompt returns 'update' to regenerate existing commands
      mockInquirerPrompt.mockImplementationOnce(async () => ({ action: 'update' }));

      const result = await runInitCommand(testDir);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Regenerat');
      // Config integrations should remain the same
      const config = await fs.readJSON('.clavix/config.json');
      expect(config.integrations).toContain('claude-code');
    });

    it('should preserve user content in CLAUDE.md during update', async () => {
      // Create CLAUDE.md with user content
      await fs.writeFile(
        'CLAUDE.md',
        `# My Project

This is my custom content that should be preserved.

<!-- CLAVIX:START -->
Old clavix content
<!-- CLAVIX:END -->

More custom content below.`
      );

      mockInquirerPrompt.mockImplementationOnce(async () => ({ action: 'update' }));

      const result = await runInitCommand(testDir);

      expect(result.exitCode).toBe(0);

      // Verify user content is preserved
      const claudeContent = await fs.readFile('CLAUDE.md', 'utf-8');
      expect(claudeContent).toContain('My Project');
      expect(claudeContent).toContain('custom content that should be preserved');
      expect(claudeContent).toContain('More custom content below');
      // Managed block should be updated
      expect(claudeContent).toContain('<!-- CLAVIX:START -->');
      expect(claudeContent).toContain('<!-- CLAVIX:END -->');
    });
  });

  describe('Removed Features (v5.3)', () => {
    it('should NOT create sessions directory', async () => {
      // Fresh init - reset mocks to defaults
      mockSelectIntegrations.mockResolvedValueOnce(['claude-code']);

      const result = await runInitCommand(testDir);

      expect(result.exitCode).toBe(0);
      // Sessions directory was removed in v5.3
      expect(await fs.pathExists('.clavix/sessions')).toBe(false);
    });

    it('should NOT mention session-related commands', async () => {
      // Fresh init - reset mocks to defaults
      mockSelectIntegrations.mockResolvedValueOnce(['claude-code']);

      const result = await runInitCommand(testDir);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).not.toContain('session');
    });
  });
});
