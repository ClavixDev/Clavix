/**
 * Agent Skills Adapter Tests
 *
 * Tests for the AgentSkillsAdapter which generates skills per agentskills.io spec.
 *
 * @since v6.2.0
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import { fileURLToPath } from 'url';
import { AgentSkillsAdapter } from '../../src/core/adapters/agent-skills-adapter.js';
import { CommandTemplate } from '../../src/types/agent.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('AgentSkillsAdapter', () => {
  const testDir = path.join(__dirname, '../fixtures/agent-skills-adapter');
  let originalCwd: string;

  beforeEach(async () => {
    await fs.remove(testDir);
    await fs.ensureDir(testDir);
    originalCwd = process.cwd();
    process.chdir(testDir);
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    await fs.remove(testDir);
  });

  describe('constructor', () => {
    it('should create global adapter with correct name', () => {
      const adapter = new AgentSkillsAdapter('global');
      expect(adapter.name).toBe('agent-skills-global');
      expect(adapter.displayName).toBe('Agent Skills (Global)');
    });

    it('should create project adapter with correct name', () => {
      const adapter = new AgentSkillsAdapter('project');
      expect(adapter.name).toBe('agent-skills-project');
      expect(adapter.displayName).toBe('Agent Skills (Project)');
    });

    it('should have correct file extension', () => {
      const adapter = new AgentSkillsAdapter('global');
      expect(adapter.fileExtension).toBe('.md');
    });

    it('should have correct features', () => {
      const adapter = new AgentSkillsAdapter('global');
      expect(adapter.features.supportsSubdirectories).toBe(true);
      expect(adapter.features.commandFormat?.separator).toBe('-');
    });
  });

  describe('directory', () => {
    it('should return global path for global scope', () => {
      const adapter = new AgentSkillsAdapter('global');
      expect(adapter.directory).toBe('~/.config/agents/skills');
    });

    it('should return project path for project scope', () => {
      const adapter = new AgentSkillsAdapter('project');
      expect(adapter.directory).toBe('.skills');
    });
  });

  describe('getTargetFilename', () => {
    it('should return skill directory name with clavix prefix', () => {
      const adapter = new AgentSkillsAdapter('global');
      expect(adapter.getTargetFilename('improve')).toBe('clavix-improve');
      expect(adapter.getTargetFilename('prd')).toBe('clavix-prd');
    });
  });

  describe('getCommandPath', () => {
    it('should expand tilde for global scope', () => {
      const adapter = new AgentSkillsAdapter('global');
      const commandPath = adapter.getCommandPath();
      expect(commandPath).toContain(os.homedir());
      expect(commandPath).not.toContain('~');
    });

    it('should use relative path for project scope', () => {
      const adapter = new AgentSkillsAdapter('project');
      const commandPath = adapter.getCommandPath();
      expect(commandPath).toContain('.skills');
    });
  });

  describe('detectProject', () => {
    it('should return false when skills directory does not exist (project)', async () => {
      const adapter = new AgentSkillsAdapter('project');
      const detected = await adapter.detectProject();
      expect(detected).toBe(false);
    });

    it('should return true when skills directory exists (project)', async () => {
      await fs.ensureDir('.skills');
      const adapter = new AgentSkillsAdapter('project');
      const detected = await adapter.detectProject();
      expect(detected).toBe(true);
    });
  });

  describe('generateCommands', () => {
    it('should create skill directories with SKILL.md files', async () => {
      const adapter = new AgentSkillsAdapter('project');
      const templates: CommandTemplate[] = [
        { name: 'improve', description: 'Test skill', content: '# Test Content' },
        { name: 'prd', description: 'Another skill', content: '# PRD Content' },
      ];

      await adapter.generateCommands(templates);

      // Check skill directories were created
      expect(await fs.pathExists('.skills/clavix-improve/SKILL.md')).toBe(true);
      expect(await fs.pathExists('.skills/clavix-prd/SKILL.md')).toBe(true);

      // Check SKILL.md content has proper frontmatter
      const improveContent = await fs.readFile('.skills/clavix-improve/SKILL.md', 'utf-8');
      expect(improveContent).toContain('---');
      expect(improveContent).toContain('name: clavix-improve');
      expect(improveContent).toContain('description:');
      expect(improveContent).toContain('license: Apache-2.0');
      expect(improveContent).toContain('# Test Content');
    });
  });

  describe('removeAllCommands', () => {
    it('should remove all clavix skill directories', async () => {
      const adapter = new AgentSkillsAdapter('project');

      // Create some skill directories
      await fs.ensureDir('.skills/clavix-improve');
      await fs.writeFile('.skills/clavix-improve/SKILL.md', '# Improve');
      await fs.ensureDir('.skills/clavix-prd');
      await fs.writeFile('.skills/clavix-prd/SKILL.md', '# PRD');
      await fs.ensureDir('.skills/other-skill'); // Not a clavix skill
      await fs.writeFile('.skills/other-skill/SKILL.md', '# Other');

      const removed = await adapter.removeAllCommands();

      expect(removed).toBe(2);
      expect(await fs.pathExists('.skills/clavix-improve')).toBe(false);
      expect(await fs.pathExists('.skills/clavix-prd')).toBe(false);
      expect(await fs.pathExists('.skills/other-skill')).toBe(true); // Preserved
    });

    it('should return 0 when skills directory does not exist', async () => {
      const adapter = new AgentSkillsAdapter('project');
      const removed = await adapter.removeAllCommands();
      expect(removed).toBe(0);
    });
  });

  describe('validate', () => {
    it('should return valid when directory can be created', async () => {
      const adapter = new AgentSkillsAdapter('project');
      const result = await adapter.validate();
      expect(result.valid).toBe(true);
    });
  });

  describe('installScope', () => {
    it('should return global for global adapter', () => {
      const adapter = new AgentSkillsAdapter('global');
      expect(adapter.installScope).toBe('global');
    });

    it('should return project for project adapter', () => {
      const adapter = new AgentSkillsAdapter('project');
      expect(adapter.installScope).toBe('project');
    });
  });
});
