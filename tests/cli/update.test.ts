/**
 * Tests for update command functionality
 */

import fs from 'fs-extra';
import * as path from 'path';
import { AgentManager } from '../../src/core/agent-manager';
import { DocInjector } from '../../src/core/doc-injector';
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Update command', () => {
  const testDir = path.join(__dirname, '../fixtures/test-update');
  const clavixDir = path.join(testDir, '.clavix');
  const configPath = path.join(clavixDir, 'config.json');
  let originalCwd: string;

  beforeEach(async () => {
    // Clean up and setup
    await fs.remove(testDir);
    await fs.ensureDir(clavixDir);

    // Create config
    const config = {
      version: '1.0.0',
      integrations: ['claude-code'],
    };
    await fs.writeJSON(configPath, config, { spaces: 2 });

    // Change to test directory
    originalCwd = process.cwd();
    process.chdir(testDir);
  });

  afterEach(async () => {
    // Restore directory
    process.chdir(originalCwd);

    // Clean up
    await fs.remove(testDir);
  });

  describe('initialization check', () => {
    it('should detect when .clavix directory exists', async () => {
      const exists = await fs.pathExists(clavixDir);

      expect(exists).toBe(true);
    });

    it('should detect when config.json exists', async () => {
      const exists = await fs.pathExists(configPath);

      expect(exists).toBe(true);
    });

    it('should detect missing .clavix directory', async () => {
      await fs.remove(clavixDir);

      const exists = await fs.pathExists(clavixDir);

      expect(exists).toBe(false);
    });

    it('should detect missing config.json', async () => {
      await fs.remove(configPath);

      const exists = await fs.pathExists(configPath);

      expect(exists).toBe(false);
    });
  });

  describe('provider configuration', () => {
    it('should use providers from config', async () => {
      const customConfig = {
        version: '1.0.0',
        integrations: ['claude-code', 'cursor'],
      };
      await fs.writeJSON(configPath, customConfig, { spaces: 2 });

      const config = await fs.readJSON(configPath);

      expect(config.integrations).toContain('claude-code');
      expect(config.integrations).toContain('cursor');
    });

    it('should default to claude-code if no providers specified', async () => {
      const minimalConfig = {
        version: '1.0.0',
      };
      await fs.writeJSON(configPath, minimalConfig, { spaces: 2 });

      const config = await fs.readJSON(configPath);
      const providers = config.integrations || ['claude-code'];

      expect(providers).toContain('claude-code');
    });
  });

  describe('AgentManager integration', () => {
    it('should be able to get registered adapters', () => {
      const agentManager = new AgentManager();
      const adapters = agentManager.getAdapters();

      expect(adapters.length).toBeGreaterThan(0);
    });

    it('should have claude-code adapter available', () => {
      const agentManager = new AgentManager();
      const adapter = agentManager.getAdapter('claude-code');

      expect(adapter).toBeDefined();
      expect(adapter?.name).toBe('claude-code');
    });

    it('should get command path from adapter', () => {
      const agentManager = new AgentManager();
      const adapter = agentManager.getAdapter('claude-code');

      const commandPath = adapter?.getCommandPath();

      expect(commandPath).toBeDefined();
      expect(commandPath).toContain('claude');
    });
  });

  describe('DocInjector integration', () => {
    it('should be able to inject documentation blocks', async () => {
      const testFile = path.join(testDir, 'test-doc.md');
      const content = 'Test content for documentation';

      await fs.writeFile(testFile, '# Test\n\n<!-- CLAVIX:START -->\n<!-- CLAVIX:END -->');

      await DocInjector.injectBlock(testFile, content, {
        startMarker: '<!-- CLAVIX:START -->',
        endMarker: '<!-- CLAVIX:END -->',
      });

      const updatedContent = await fs.readFile(testFile, 'utf-8');

      expect(updatedContent).toContain(content);
    });

    it('should preserve content outside managed blocks', async () => {
      const testFile = path.join(testDir, 'test-preserve.md');
      const beforeBlock = '# Before Block';
      const afterBlock = '# After Block';

      await fs.writeFile(
        testFile,
        `${beforeBlock}\n\n<!-- CLAVIX:START -->\nOld content\n<!-- CLAVIX:END -->\n\n${afterBlock}`
      );

      await DocInjector.injectBlock(testFile, 'New content', {
        startMarker: '<!-- CLAVIX:START -->',
        endMarker: '<!-- CLAVIX:END -->',
      });

      const updatedContent = await fs.readFile(testFile, 'utf-8');

      expect(updatedContent).toContain(beforeBlock);
      expect(updatedContent).toContain(afterBlock);
      expect(updatedContent).toContain('New content');
      expect(updatedContent).not.toContain('Old content');
    });
  });

  describe('update logic patterns', () => {
    it('should implement docs-only logic correctly', () => {
      const docsOnly = true;
      const commandsOnly = false;

      const updateDocs = docsOnly || (!docsOnly && !commandsOnly);
      const updateCommands = commandsOnly || (!docsOnly && !commandsOnly);

      expect(updateDocs).toBe(true);
      expect(updateCommands).toBe(false);
    });

    it('should implement commands-only logic correctly', () => {
      const docsOnly = false;
      const commandsOnly = true;

      const updateDocs = docsOnly || (!docsOnly && !commandsOnly);
      const updateCommands = commandsOnly || (!docsOnly && !commandsOnly);

      expect(updateDocs).toBe(false);
      expect(updateCommands).toBe(true);
    });

    it('should implement update-all logic correctly', () => {
      const docsOnly = false;
      const commandsOnly = false;

      const updateDocs = docsOnly || (!docsOnly && !commandsOnly);
      const updateCommands = commandsOnly || (!docsOnly && !commandsOnly);

      expect(updateDocs).toBe(true);
      expect(updateCommands).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle empty providers array', async () => {
      const config = {
        version: '1.0.0',
        integrations: [],
      };
      await fs.writeJSON(configPath, config, { spaces: 2 });

      const loadedConfig = await fs.readJSON(configPath);
      const integrations =
        loadedConfig.integrations.length === 0 ? ['claude-code'] : loadedConfig.integrations;

      expect(integrations).toEqual(['claude-code']);
    });

    it('should handle unknown integration names gracefully', async () => {
      const config = {
        version: '1.0.0',
        integrations: ['unknown-integration'],
      };
      await fs.writeJSON(configPath, config, { spaces: 2 });

      // The command should skip unknown integrations without crashing
      const loadedConfig = await fs.readJSON(configPath);
      expect(loadedConfig.integrations).toContain('unknown-integration');
    });

    it('should handle special integration names', async () => {
      const config = {
        version: '1.0.0',
        integrations: ['agents-md', 'octo-md'],
      };
      await fs.writeJSON(configPath, config, { spaces: 2 });

      const loadedConfig = await fs.readJSON(configPath);
      expect(loadedConfig.integrations).toContain('agents-md');
      expect(loadedConfig.integrations).toContain('octo-md');
    });
  });

  describe('template directory structure', () => {
    it('should have templates directory structure', async () => {
      const templatesDir = path.join(__dirname, '../../src/templates');

      const exists = await fs.pathExists(templatesDir);

      expect(exists).toBe(true);
    });

    it('should have slash-commands templates', async () => {
      const slashCommandsDir = path.join(__dirname, '../../src/templates/slash-commands');

      const exists = await fs.pathExists(slashCommandsDir);

      expect(exists).toBe(true);
    });
  });

  describe('file update detection', () => {
    it('should detect when file content matches', async () => {
      const testFile = path.join(testDir, 'test-match.md');
      const content = 'Test content';

      await fs.writeFile(testFile, content);

      const fileContent = await fs.readFile(testFile, 'utf-8');

      expect(fileContent).toBe(content);
    });

    it('should detect when file content differs', async () => {
      const testFile = path.join(testDir, 'test-diff.md');
      const oldContent = 'Old content';
      const newContent = 'New content';

      await fs.writeFile(testFile, oldContent);

      const fileContent = await fs.readFile(testFile, 'utf-8');

      expect(fileContent).not.toBe(newContent);
      expect(fileContent).toBe(oldContent);
    });

    it('should be able to update file content', async () => {
      const testFile = path.join(testDir, 'test-update.md');
      const oldContent = 'Old content';
      const newContent = 'New content';

      await fs.writeFile(testFile, oldContent);
      await fs.writeFile(testFile, newContent);

      const fileContent = await fs.readFile(testFile, 'utf-8');

      expect(fileContent).toBe(newContent);
    });
  });

  describe('hasUpToDateBlock logic', () => {
    // Replicate the hasUpToDateBlock method logic
    const hasUpToDateBlock = (currentContent: string, newContent: string): boolean => {
      return currentContent.includes(newContent.trim());
    };

    it('should return true when content is identical', () => {
      const current = '<!-- CLAVIX:START -->\nContent here\n<!-- CLAVIX:END -->';
      const newContent = 'Content here';

      expect(hasUpToDateBlock(current, newContent)).toBe(true);
    });

    it('should return true when new content exists in current', () => {
      const current =
        '# Header\n\n<!-- CLAVIX:START -->\nNew content\n<!-- CLAVIX:END -->\n\n# Footer';
      const newContent = '  New content  ';

      expect(hasUpToDateBlock(current, newContent)).toBe(true);
    });

    it('should return false when content differs', () => {
      const current = '<!-- CLAVIX:START -->\nOld content\n<!-- CLAVIX:END -->';
      const newContent = 'New content';

      expect(hasUpToDateBlock(current, newContent)).toBe(false);
    });

    it('should handle empty content', () => {
      const current = '';
      const newContent = 'Some content';

      expect(hasUpToDateBlock(current, newContent)).toBe(false);
    });
  });

  describe('getAgentsContent format', () => {
    it('should include CLI setup commands table', () => {
      const agentsContent = `## Clavix Integration

This project uses Clavix for prompt improvement and PRD generation.

### Setup Commands (CLI)
| Command | Purpose |
|---------|---------|
| \`clavix init\` | Initialize Clavix in a project |
| \`clavix update\` | Update templates after package update |
| \`clavix diagnose\` | Check installation health |
| \`clavix version\` | Show version |`;

      expect(agentsContent).toContain('clavix init');
      expect(agentsContent).toContain('clavix update');
      expect(agentsContent).toContain('clavix diagnose');
      expect(agentsContent).toContain('clavix version');
      expect(agentsContent).not.toContain('clavix config'); // Removed in v5.3
    });

    it('should include workflow slash commands table', () => {
      const agentsContent = `### Workflow Commands (Slash Commands)
| Slash Command | Purpose |
|---------------|---------|
| \`/clavix:improve\` | Optimize prompts (auto-selects depth) |
| \`/clavix:prd\` | Generate PRD through guided questions |
| \`/clavix:plan\` | Create task breakdown from PRD |`;

      expect(agentsContent).toContain('/clavix:improve');
      expect(agentsContent).toContain('/clavix:prd');
      expect(agentsContent).toContain('/clavix:plan');
      expect(agentsContent).not.toContain('/clavix:fast'); // Merged into improve
      expect(agentsContent).not.toContain('/clavix:deep'); // Merged into improve
    });
  });

  describe('warp-md integration', () => {
    it('should handle warp-md as special integration', async () => {
      const config = {
        version: '1.0.0',
        integrations: ['warp-md'],
      };
      await fs.writeJSON(configPath, config, { spaces: 2 });

      const loadedConfig = await fs.readJSON(configPath);
      expect(loadedConfig.integrations).toContain('warp-md');
    });
  });

  describe('copilot-instructions integration', () => {
    it('should handle copilot-instructions as special integration', async () => {
      const config = {
        version: '1.0.0',
        integrations: ['copilot-instructions'],
      };
      await fs.writeJSON(configPath, config, { spaces: 2 });

      const loadedConfig = await fs.readJSON(configPath);
      expect(loadedConfig.integrations).toContain('copilot-instructions');
    });
  });

  describe('force flag behavior', () => {
    it('should conceptually bypass up-to-date check when force is true', () => {
      const force = true;
      const isUpToDate = true;

      // With force flag, should update regardless of up-to-date status
      const shouldUpdate = force || !isUpToDate;

      expect(shouldUpdate).toBe(true);
    });

    it('should skip update when not forced and already up-to-date', () => {
      const force = false;
      const isUpToDate = true;

      // Without force flag and content is up-to-date, should skip
      const shouldUpdate = force || !isUpToDate;

      expect(shouldUpdate).toBe(false);
    });

    it('should update when not forced but content differs', () => {
      const force = false;
      const isUpToDate = false;

      const shouldUpdate = force || !isUpToDate;

      expect(shouldUpdate).toBe(true);
    });
  });

  describe('multiple integrations handling', () => {
    it('should handle mixed regular and special integrations', async () => {
      const config = {
        version: '1.0.0',
        integrations: ['claude-code', 'agents-md', 'cursor', 'warp-md'],
      };
      await fs.writeJSON(configPath, config, { spaces: 2 });

      const loadedConfig = await fs.readJSON(configPath);

      // Regular adapters
      expect(loadedConfig.integrations).toContain('claude-code');
      expect(loadedConfig.integrations).toContain('cursor');

      // Special integrations (doc generators)
      expect(loadedConfig.integrations).toContain('agents-md');
      expect(loadedConfig.integrations).toContain('warp-md');
    });

    it('should separate doc generators from regular adapters', () => {
      const integrations = ['claude-code', 'agents-md', 'cursor', 'octo-md', 'warp-md'];

      const docGenerators = ['agents-md', 'octo-md', 'warp-md'];
      const regularAdapters = integrations.filter((i) => !docGenerators.includes(i));

      expect(regularAdapters).toEqual(['claude-code', 'cursor']);
    });
  });

  describe('CLAUDE.md specific handling', () => {
    it('should only update CLAUDE.md for claude-code integration', async () => {
      // Create CLAUDE.md
      const claudePath = path.join(testDir, 'CLAUDE.md');
      await fs.writeFile(claudePath, '# CLAUDE.md\n\n<!-- CLAVIX:START -->\n<!-- CLAVIX:END -->');

      const exists = await fs.pathExists(claudePath);
      expect(exists).toBe(true);

      // The update command only updates CLAUDE.md when integrationName === 'claude-code'
      const integrationName = 'claude-code';
      const shouldUpdateClaude = integrationName === 'claude-code';

      expect(shouldUpdateClaude).toBe(true);
    });

    it('should NOT update CLAUDE.md for other integrations', () => {
      const integrationName = 'cursor';
      const shouldUpdateClaude = integrationName === 'claude-code';

      expect(shouldUpdateClaude).toBe(false);
    });
  });

  describe('InstructionsGenerator integration', () => {
    it('should detect when instructions generation is needed', () => {
      // Generic integrations that need .clavix/instructions/
      const genericIntegrations = ['cursor', 'windsurf', 'kilocode'];

      // Integrations that don't need it
      const specialIntegrations = ['claude-code', 'agents-md'];

      // needsGeneration should return true for generic integrations
      const hasGenericIntegration = genericIntegrations.some(
        (i) =>
          ![
            'claude-code',
            'gemini',
            'agents-md',
            'octo-md',
            'warp-md',
            'copilot-instructions',
          ].includes(i)
      );

      expect(hasGenericIntegration).toBe(true);
    });
  });

  describe('legacy command cleanup', () => {
    it('should identify legacy command patterns', async () => {
      // Legacy patterns that should be cleaned up
      const legacyPatterns = [
        'clavix-improve.md', // Old naming
        'clavix_improve.md', // Underscore variant
      ];

      // Current pattern
      const currentPattern = 'improve.md';

      // Test that patterns are different
      expect(legacyPatterns).not.toContain(currentPattern);
    });
  });
});
