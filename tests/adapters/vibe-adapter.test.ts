/**
 * Tests for VibeAdapter - Vibe CLI integration
 */

import fs from 'fs-extra';
import * as path from 'path';
import { VibeAdapter } from '../../src/core/adapters/vibe-adapter';
import { CommandTemplate } from '../../src/types/agent';
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('VibeAdapter', () => {
  let adapter: VibeAdapter;
  const testDir = path.join(__dirname, '../fixtures/vibe-adapter');
  let originalCwd: string;

  beforeEach(async () => {
    await fs.remove(testDir);
    await fs.ensureDir(testDir);
    originalCwd = process.cwd();
    process.chdir(testDir);
    adapter = new VibeAdapter();
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    await fs.remove(testDir);
  });

  describe('adapter properties', () => {
    it('should have required properties', () => {
      expect(adapter.name).toBe('vibe');
      expect(adapter.displayName).toBe('Vibe CLI');
      expect(adapter.directory).toBe('.vibe/skills');
      expect(adapter.fileExtension).toBe('.md');
      expect(adapter.features).toEqual({
        supportsSubdirectories: false,
      });
    });
  });

  describe('detectProject', () => {
    it('should detect when .vibe directory exists', async () => {
      await fs.ensureDir('.vibe');
      const detected = await adapter.detectProject();
      expect(detected).toBe(true);
    });

    it('should not detect when .vibe directory does not exist', async () => {
      const detected = await adapter.detectProject();
      expect(detected).toBe(false);
    });
  });

  describe('getCommandPath', () => {
    it('should return correct command path', () => {
      const commandPath = adapter.getCommandPath();
      expect(commandPath).toBe('.vibe/skills');
    });
  });

  describe('getTargetFilename', () => {
    it('should generate skill filename with correct pattern', () => {
      expect(adapter.getTargetFilename('improve')).toBe('clavix-improve-skill.md');
      expect(adapter.getTargetFilename('prd')).toBe('clavix-prd-skill.md');
      expect(adapter.getTargetFilename('plan')).toBe('clavix-plan-skill.md');
      expect(adapter.getTargetFilename('implement')).toBe('clavix-implement-skill.md');
      expect(adapter.getTargetFilename('start')).toBe('clavix-start-skill.md');
      expect(adapter.getTargetFilename('summarize')).toBe('clavix-summarize-skill.md');
      expect(adapter.getTargetFilename('refine')).toBe('clavix-refine-skill.md');
      expect(adapter.getTargetFilename('verify')).toBe('clavix-verify-skill.md');
      expect(adapter.getTargetFilename('archive')).toBe('clavix-archive-skill.md');
    });
  });

  describe('isClavixGeneratedCommand', () => {
    it('should identify Clavix skill files', () => {
      expect(adapter['isClavixGeneratedCommand']('clavix-improve-skill.md')).toBe(true);
      expect(adapter['isClavixGeneratedCommand']('clavix-prd-skill.md')).toBe(true);
      expect(adapter['isClavixGeneratedCommand']('clavix-plan-skill.md')).toBe(true);
      expect(adapter['isClavixGeneratedCommand']('clavix-implement-skill.md')).toBe(true);
    });

    it('should not identify non-Clavix files', () => {
      expect(adapter['isClavixGeneratedCommand']('my-custom-skill.md')).toBe(false);
      expect(adapter['isClavixGeneratedCommand']('README.md')).toBe(false);
      expect(adapter['isClavixGeneratedCommand']('clavix-skill.md')).toBe(false); // missing command name
      expect(adapter['isClavixGeneratedCommand']('clavix-improve.md')).toBe(false); // missing -skill
    });
  });

  describe('generateCommands', () => {
    it('should generate skill files from templates', async () => {
      const templates: CommandTemplate[] = [
        {
          name: 'improve',
          content: '# Improve Command\n\nThis is the improve command.',
          description: 'Improve prompts',
        },
        {
          name: 'prd',
          content: '# PRD Command\n\nThis is the PRD command.',
          description: 'Generate PRD',
        },
      ];

      await adapter.generateCommands(templates);

      expect(await fs.pathExists('.vibe/skills/clavix-improve-skill.md')).toBe(true);
      expect(await fs.pathExists('.vibe/skills/clavix-prd-skill.md')).toBe(true);

      const improveContent = await fs.readFile('.vibe/skills/clavix-improve-skill.md', 'utf-8');
      expect(improveContent).toContain('# Improve Command');
    });

    it('should create .vibe/skills directory if it does not exist', async () => {
      const templates: CommandTemplate[] = [
        { name: 'test', description: 'Test description', content: 'content' },
      ];

      await adapter.generateCommands(templates);

      const exists = await fs.pathExists('.vibe/skills');
      expect(exists).toBe(true);
    });
  });

  describe('removeAllCommands', () => {
    it('should remove only Clavix-generated skill files', async () => {
      await fs.ensureDir('.vibe/skills');
      await fs.writeFile('.vibe/skills/clavix-improve-skill.md', 'content');
      await fs.writeFile('.vibe/skills/clavix-prd-skill.md', 'content');
      await fs.writeFile('.vibe/skills/custom-skill.md', 'content');

      const removed = await adapter.removeAllCommands();

      expect(removed).toBe(2);
      expect(await fs.pathExists('.vibe/skills/clavix-improve-skill.md')).toBe(false);
      expect(await fs.pathExists('.vibe/skills/clavix-prd-skill.md')).toBe(false);
      expect(await fs.pathExists('.vibe/skills/custom-skill.md')).toBe(true);
    });

    it('should return 0 when directory does not exist', async () => {
      const removed = await adapter.removeAllCommands();
      expect(removed).toBe(0);
    });
  });

  describe('validate', () => {
    it('should pass validation when directory can be created', async () => {
      const result = await adapter.validate();
      expect(result.valid).toBe(true);
    });
  });

  describe('formatCommand', () => {
    it('should return content as-is for SKILL.md format', () => {
      const template: CommandTemplate = {
        name: 'test',
        content: '# Test Command\n\nContent here',
        description: 'Test',
      };

      const formatted = adapter['formatCommand'](template);
      expect(formatted).toBe(template.content);
    });
  });

  describe('edge cases', () => {
    it('should handle empty command list', async () => {
      await adapter.generateCommands([]);

      const exists = await fs.pathExists('.vibe/skills');
      expect(exists).toBe(true);
    });

    it('should handle unicode in command content', async () => {
      const templates: CommandTemplate[] = [
        {
          name: 'test',
          description: 'Test',
          content: 'Test with émojis 🚀 and spëcial çhars',
        },
      ];

      await adapter.generateCommands(templates);

      const content = await fs.readFile('.vibe/skills/clavix-test-skill.md', 'utf-8');
      expect(content).toContain('émojis');
      expect(content).toContain('🚀');
    });
  });
});
