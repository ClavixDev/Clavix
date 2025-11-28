/**
 * Adapter Interface Contract Tests
 *
 * Verifies that all adapters properly implement the AgentAdapter interface.
 * This ensures consistency across all integration adapters.
 *
 * @since v5.5.0 - Updated to use AgentManager factory pattern
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import * as path from 'path';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import AgentManager to get all adapters dynamically
import { AgentManager } from '../../src/core/agent-manager.js';
import { AgentAdapter } from '../../src/types/agent.js';

describe('Adapter Interface Contract Tests', () => {
  let testDir: string;
  let originalCwd: string;
  let agentManager: AgentManager;
  let adapters: AgentAdapter[];

  beforeEach(async () => {
    originalCwd = process.cwd();
    testDir = path.join(__dirname, '../tmp/contract-adapter-' + Date.now());
    await fs.ensureDir(testDir);
    process.chdir(testDir);

    // Get all adapters from AgentManager
    agentManager = new AgentManager();
    adapters = agentManager.getAdapters();
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    await fs.remove(testDir);
  });

  describe('AgentManager registration', () => {
    it('should have at least one adapter registered', () => {
      expect(adapters.length).toBeGreaterThan(0);
    });

    it('should include special adapters (claude-code, gemini, qwen, llxprt)', () => {
      const names = adapters.map((a) => a.name);
      expect(names).toContain('claude-code');
      expect(names).toContain('gemini');
      expect(names).toContain('qwen');
      expect(names).toContain('llxprt');
    });

    it('should include universal adapters from config', () => {
      const names = adapters.map((a) => a.name);
      expect(names).toContain('cursor');
      expect(names).toContain('windsurf');
      expect(names).toContain('cline');
    });
  });

  describe('Required properties', () => {
    it.each(['name', 'displayName', 'directory', 'fileExtension'])(
      'all adapters should have %s property',
      (prop) => {
        for (const adapter of adapters) {
          const value = (adapter as Record<string, unknown>)[prop];
          expect(value).toBeDefined();
          expect(typeof value).toBe('string');
          if (prop !== 'fileExtension') {
            // fileExtension can be empty for some adapters
            expect((value as string).length).toBeGreaterThan(0);
          }
        }
      }
    );
  });

  describe('Required methods', () => {
    it.each([
      'detectProject',
      'generateCommands',
      'removeAllCommands',
      'injectDocumentation',
      'getCommandPath',
      'getTargetFilename',
    ])('all adapters should have %s method', (method) => {
      for (const adapter of adapters) {
        expect(typeof (adapter as Record<string, unknown>)[method]).toBe('function');
      }
    });
  });

  describe('Name uniqueness', () => {
    it('should have unique names across all adapters', () => {
      const names = adapters.map((a) => a.name);
      const uniqueNames = new Set(names);
      expect(uniqueNames.size).toBe(names.length);
    });
  });

  describe('Directory patterns', () => {
    it('all directories should not be empty', () => {
      for (const adapter of adapters) {
        expect(adapter.directory.length).toBeGreaterThan(0);
      }
    });

    it('all directories should not have trailing slash', () => {
      for (const adapter of adapters) {
        expect(adapter.directory.endsWith('/')).toBe(false);
      }
    });
  });

  describe('File extension patterns', () => {
    it('all file extensions should be valid', () => {
      for (const adapter of adapters) {
        if (adapter.fileExtension.length > 0) {
          expect(adapter.fileExtension.startsWith('.')).toBe(true);
        }
      }
    });
  });

  describe('getCommandPath method', () => {
    it('all getCommandPath results should return string', () => {
      for (const adapter of adapters) {
        const commandPath = adapter.getCommandPath();
        expect(typeof commandPath).toBe('string');
        expect(commandPath.length).toBeGreaterThan(0);
      }
    });

    it('all getCommandPath results should be valid paths', () => {
      for (const adapter of adapters) {
        const commandPath = adapter.getCommandPath();
        // For project-based adapters, path should contain directory
        if (!adapter.directory.startsWith('~')) {
          expect(commandPath).toContain(adapter.directory);
        } else {
          // For home-based adapters, path should not start with ~
          expect(commandPath.startsWith('~')).toBe(false);
        }
      }
    });
  });

  describe('getTargetFilename method', () => {
    it('all getTargetFilename results should return string', () => {
      for (const adapter of adapters) {
        const filename = adapter.getTargetFilename('test-command');
        expect(typeof filename).toBe('string');
        expect(filename.length).toBeGreaterThan(0);
      }
    });

    it('all getTargetFilename results should include extension', () => {
      for (const adapter of adapters) {
        const filename = adapter.getTargetFilename('test');
        if (adapter.fileExtension.length > 0) {
          expect(filename).toContain(adapter.fileExtension);
        }
      }
    });
  });

  describe('detectProject method', () => {
    it('all detectProject results should return boolean', async () => {
      for (const adapter of adapters) {
        const result = await adapter.detectProject();
        expect(typeof result).toBe('boolean');
      }
    });
  });

  describe('Validation method', () => {
    it('all validate methods should return proper structure', async () => {
      for (const adapter of adapters) {
        if (adapter.validate) {
          const result = await adapter.validate();
          expect(result).toHaveProperty('valid');
          expect(typeof result.valid).toBe('boolean');
        }
      }
    });
  });

  describe('Adapter-specific tests', () => {
    it('claude-code adapter should support doc injection', () => {
      const claudeAdapter = agentManager.getAdapter('claude-code');
      expect(claudeAdapter).toBeDefined();
      expect(claudeAdapter?.features?.supportsSubdirectories).toBe(true);
    });

    it('TOML adapters should have .toml extension', () => {
      const tomlAdapters = ['gemini', 'qwen', 'llxprt'];
      for (const name of tomlAdapters) {
        const adapter = agentManager.getAdapter(name);
        expect(adapter).toBeDefined();
        expect(adapter?.fileExtension).toBe('.toml');
      }
    });

    it('markdown adapters should have .md extension', () => {
      const mdAdapters = ['claude-code', 'cursor', 'windsurf', 'cline'];
      for (const name of mdAdapters) {
        const adapter = agentManager.getAdapter(name);
        expect(adapter).toBeDefined();
        expect(adapter?.fileExtension).toBe('.md');
      }
    });
  });
});
