/**
 * Tests for init command functionality
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { setupInquirerMock, runCliCommand, createTestDir, cleanupTestDir } from '../helpers/cli-helpers';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mock inquirer
jest.mock('inquirer', () => setupInquirerMock({
  reinit: true,
  cleanupAction: 'skip',
  confirmCodex: true,
  useNamespace: true,
  continueAnyway: true,
  removeLegacy: true
}));

// Mock integration selector to avoid interactive prompt
jest.mock('../../src/utils/integration-selector.js', () => ({
  __esModule: true,
  selectIntegrations: jest.fn().mockResolvedValue(['claude-code'])
}));

// Import command after mocking
import Init from '../../src/cli/commands/init';
import { FileSystem } from '../../src/utils/file-system';
import { DEFAULT_CONFIG } from '../../src/types/config';

describe('Init Command', () => {
  let testDir: string;
  let originalCwd: string;
  
  beforeEach(async () => {
    testDir = await createTestDir('init-cmd-test');
    originalCwd = process.cwd();
    process.chdir(testDir);
    
    // Reset mocks
    jest.clearAllMocks();
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    await cleanupTestDir(testDir);
  });

  describe('Fresh Initialization', () => {
    it('should initialize clavix in empty directory', async () => {
      const result = await runCliCommand(Init, [], testDir);
      
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Clavix initialized successfully');
      
      // Verify directory structure
      expect(await fs.pathExists('.clavix')).toBe(true);
      expect(await fs.pathExists('.clavix/config.json')).toBe(true);
      expect(await fs.pathExists('.clavix/sessions')).toBe(true);
      expect(await fs.pathExists('.clavix/outputs')).toBe(true);
      expect(await fs.pathExists('.clavix/INSTRUCTIONS.md')).toBe(true);
      
      // Verify config content
      const config = await fs.readJson('.clavix/config.json');
      expect(config.integrations).toContain('claude-code');
    });

    it('should generate commands for selected integration', async () => {
      const { selectIntegrations } = await import('../../src/utils/integration-selector.js');
      (selectIntegrations as jest.Mock<any>).mockResolvedValue(['droid']);
      
      const result = await runCliCommand(Init, [], testDir);
      
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Generating droid commands');
      // Droid doesn't have a specific adapter in the basic list check in init.ts unless we check logic
      // But init loops over selected integrations.
    });

    it('should abort if no integrations selected', async () => {
      const { selectIntegrations } = await import('../../src/utils/integration-selector.js');
      (selectIntegrations as jest.Mock<any>).mockResolvedValue([]);
      
      const result = await runCliCommand(Init, [], testDir);
      
      expect(result.exitCode).toBe(0); // Returns 0 but stops
      expect(result.stdout).toContain('No integrations selected');
      expect(await fs.pathExists('.clavix')).toBe(false);
    });
  });

  describe('Re-initialization', () => {
    beforeEach(async () => {
      // Setup existing clavix
      await fs.ensureDir('.clavix');
      await fs.writeJson('.clavix/config.json', {
        ...DEFAULT_CONFIG,
        integrations: ['cursor']
      });
    });

    it('should prompt for re-initialization and proceed if confirmed', async () => {
      // Mock response is already true in global mock, but we can verify behavior
      const result = await runCliCommand(Init, [], testDir);
      
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Clavix is already initialized');
      expect(result.stdout).toContain('Clavix initialized successfully');
    });

    it('should preserve existing config integrations during selection if desired', async () => {
      // verification happens in how selectIntegrations is called
      // we can inspect the mock call
      await runCliCommand(Init, [], testDir);
      
      const { selectIntegrations } = await import('../../src/utils/integration-selector.js');
      expect(selectIntegrations).toHaveBeenCalledWith(expect.anything(), expect.arrayContaining(['cursor']));
    });

    it('should handle deselected integrations cleanup', async () => {
      // Existing is 'cursor', new selection is 'claude-code' (default mock)
      // Helper mock sets cleanupAction: 'skip' (default)
      // Let's override to 'cleanup' for this test if possible or check 'skip' behavior
      
      // Since setupInquirerMock uses closure, we might need to update the mock implementation dynamically
      // or rely on the default. The default in this file is 'skip'.
      
      const result = await runCliCommand(Init, [], testDir);
      
      expect(result.stdout).toContain('Previously configured but not selected');
      expect(result.stdout).toContain('cursor');
      // 'skip' action means no removal log
    });
  });

  describe('Edge Cases & Error Handling', () => {
    it('should handle write errors gracefully', async () => {
      // Make directory read-only to force EACCES
      // Note: fs.chmod might not work as expected on all systems/tests, but we can try
      // Or we can mock fs methods.
      // Mocking fs methods specifically for this test is safer.
      
      jest.spyOn(FileSystem, 'writeFileAtomic').mockRejectedValue(new Error('Permission denied'));
      
      const result = await runCliCommand(Init, [], testDir);
      
      // Should catch error and throw/log
      expect(result.exitCode).not.toBe(0);
      expect(result.stderr).toContain('Initialization failed');
    });
  });
});
