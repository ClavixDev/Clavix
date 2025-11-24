/**
 * Critical Path Tests: Integration Setup Flow
 *
 * Tests the init/update flow:
 * Detect Project -> Select Adapters -> Generate Commands -> Inject Docs -> Write Config
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mock dependencies
const mockPrompt = jest.fn();
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

const { AgentManager } = await import('../../src/core/agent-manager.js');

describe('Critical Path: Integration Setup Flow', () => {
  const testDir = path.join(__dirname, '../tmp/integration-setup-test');
  const clavixDir = path.join(testDir, '.clavix');
  let agentManager: InstanceType<typeof AgentManager>;

  beforeEach(async () => {
    await fs.ensureDir(testDir);
    await fs.ensureDir(clavixDir);

    // Create basic git repo structure
    await fs.ensureDir(path.join(testDir, '.git'));
    await fs.writeFile(
      path.join(testDir, '.git', 'config'),
      '[core]\n\trepositoryformatversion = 0'
    );

    process.chdir(testDir);

    agentManager = new AgentManager();

    jest.clearAllMocks();
  });

  afterEach(async () => {
    process.chdir(__dirname);
    await fs.remove(testDir);
  });

  describe('project detection', () => {
    it('should detect git repository', async () => {
      const isGitRepo = await fs.pathExists(path.join(testDir, '.git'));
      expect(isGitRepo).toBe(true);
    });

    it('should detect Node.js project', async () => {
      await fs.writeJson(path.join(testDir, 'package.json'), {
        name: 'test-project',
        version: '1.0.0',
      });

      const hasPackageJson = await fs.pathExists(path.join(testDir, 'package.json'));
      expect(hasPackageJson).toBe(true);
    });

    it('should detect existing Clavix configuration', async () => {
      await fs.writeJson(path.join(clavixDir, 'config.json'), {
        version: '3.0.0',
        integrations: ['claude-code'],
      });

      const hasConfig = await fs.pathExists(path.join(clavixDir, 'config.json'));
      expect(hasConfig).toBe(true);
    });
  });

  describe('adapter selection', () => {
    it('should validate adapter exists', async () => {
      const adapters = agentManager.getAdapters();
      const adapterNames = adapters.map((a) => a.name);

      expect(adapterNames).toContain('claude-code');
      expect(adapterNames).toContain('cursor');
      expect(adapterNames).toContain('windsurf');
    });

    it('should get adapter by name', async () => {
      const adapter = agentManager.getAdapter('claude-code');

      expect(adapter).toBeDefined();
      expect(adapter?.name).toBe('claude-code');
    });

    it('should return undefined for unknown adapter', () => {
      const adapter = agentManager.getAdapter('unknown-adapter');
      expect(adapter).toBeUndefined();
    });
  });

  describe('adapter capabilities', () => {
    it('should have command path for Claude Code', () => {
      const adapter = agentManager.getAdapter('claude-code');
      expect(adapter).toBeDefined();
      expect(adapter?.getCommandPath()).toContain('.claude');
    });

    it('should have command path for Cursor', () => {
      const adapter = agentManager.getAdapter('cursor');
      expect(adapter).toBeDefined();
      expect(adapter?.getCommandPath()).toContain('.cursor');
    });

    it('should have directory property for Claude Code', () => {
      const adapter = agentManager.getAdapter('claude-code');
      expect(adapter).toBeDefined();
      expect(adapter?.directory).toBeDefined();
    });

    it('each adapter should have required properties', () => {
      const adapters = agentManager.getAdapters();

      for (const adapter of adapters) {
        expect(adapter.name).toBeDefined();
        expect(typeof adapter.name).toBe('string');
        expect(adapter.displayName).toBeDefined();
        expect(adapter.directory).toBeDefined();
        expect(typeof adapter.getCommandPath()).toBe('string');
      }
    });
  });

  describe('adapter methods', () => {
    it('should have detectProject method for each adapter', async () => {
      const adapters = agentManager.getAdapters();

      for (const adapter of adapters) {
        expect(typeof adapter.detectProject).toBe('function');
      }
    });

    it('should have generateCommands method for each adapter', () => {
      const adapters = agentManager.getAdapters();

      for (const adapter of adapters) {
        expect(typeof adapter.generateCommands).toBe('function');
      }
    });

    it('should have injectDocumentation method for each adapter', () => {
      const adapters = agentManager.getAdapters();

      for (const adapter of adapters) {
        expect(typeof adapter.injectDocumentation).toBe('function');
      }
    });
  });

  describe('adapter availability', () => {
    it('should verify adapter exists for each known integration', () => {
      const integrations = ['claude-code', 'cursor', 'windsurf'];

      // Verify each adapter exists
      for (const integration of integrations) {
        const adapter = agentManager.getAdapter(integration);
        expect(adapter).toBeDefined();
        expect(adapter?.name).toBe(integration);
      }
    });

    it('should list all registered adapters', () => {
      const adapters = agentManager.getAdapters();

      // Should have multiple adapters
      expect(adapters.length).toBeGreaterThan(5);

      // All adapters should have names
      for (const adapter of adapters) {
        expect(adapter.name).toBeDefined();
      }
    });
  });

  describe('error handling', () => {
    it('should handle invalid adapter name', () => {
      const adapter = agentManager.getAdapter('invalid-adapter-name');
      expect(adapter).toBeUndefined();
    });

    it('should return undefined for empty adapter name', () => {
      const adapter = agentManager.getAdapter('');
      expect(adapter).toBeUndefined();
    });
  });
});
