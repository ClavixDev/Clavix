/**
 * Tests for CrushAdapter - Crush CLI specific adapter
 */

import fs from 'fs-extra';
import * as path from 'path';
import { CrushAdapter } from '../../src/core/adapters/crush-adapter';
import { CommandTemplate } from '../../src/types/agent';
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('CrushAdapter', () => {
  let adapter: CrushAdapter;
  const testDir = path.join(__dirname, '../fixtures/crush-adapter');
  let originalCwd: string;

  beforeEach(async () => {
    // Clean up and setup
    await fs.remove(testDir);
    await fs.ensureDir(testDir);

    originalCwd = process.cwd();
    process.chdir(testDir);

    adapter = new CrushAdapter();
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    await fs.remove(testDir);
  });

  describe('adapter properties', () => {
    it('should have Crush specific properties', () => {
      expect(adapter.name).toBe('crush');
      expect(adapter.displayName).toBe('Crush CLI');
      expect(adapter.directory).toBe('.crush/commands/clavix');
      expect(adapter.fileExtension).toBe('.md');
    });

    it('should have correct feature flags', () => {
      expect(adapter.features).toEqual({
        supportsSubdirectories: true,
        supportsFrontmatter: false,
        argumentPlaceholder: '$PROMPT',
      });
    });

    it('should support subdirectories', () => {
      expect(adapter.features.supportsSubdirectories).toBe(true);
    });

    it('should not support frontmatter', () => {
      expect(adapter.features.supportsFrontmatter).toBe(false);
    });

    it('should use $PROMPT placeholder', () => {
      expect(adapter.features.argumentPlaceholder).toBe('$PROMPT');
    });

    it('should implement getCommandPath', () => {
      const commandPath = adapter.getCommandPath();
      expect(commandPath).toBe('.crush/commands/clavix');
    });
  });

  describe('detectProject', () => {
    it('should detect when .crush directory exists', async () => {
      await fs.ensureDir('.crush');
      const detected = await adapter.detectProject();
      expect(detected).toBe(true);
    });

    it('should not detect when .crush directory does not exist', async () => {
      const detected = await adapter.detectProject();
      expect(detected).toBe(false);
    });

    it('should detect .crush with existing files', async () => {
      await fs.ensureDir('.crush');
      await fs.writeFile('.crush/config.json', '{}');

      const detected = await adapter.detectProject();
      expect(detected).toBe(true);
    });

    it('should detect .crush with commands directory', async () => {
      await fs.ensureDir('.crush/commands');

      const detected = await adapter.detectProject();
      expect(detected).toBe(true);
    });
  });

  describe('generateCommands', () => {
    it('should generate Crush command files', async () => {
      const templates: CommandTemplate[] = [
        {
          name: 'fast',
          description: 'Fast improvements',
          content: '# Fast Mode\n\nQuick analysis',
        },
        {
          name: 'deep',
          description: 'Deep analysis',
          content: '# Deep Mode\n\nComprehensive',
        },
      ];

      await adapter.generateCommands(templates);

      const commandPath = adapter.getCommandPath();
      const file1 = await fs.readFile(
        path.join(commandPath, 'fast.md'),
        'utf-8'
      );
      const file2 = await fs.readFile(
        path.join(commandPath, 'deep.md'),
        'utf-8'
      );

      expect(file1).toBe('# Fast Mode\n\nQuick analysis');
      expect(file2).toBe('# Deep Mode\n\nComprehensive');
    });

    it('should create subdirectory structure', async () => {
      const templates: CommandTemplate[] = [
        { name: 'test', description: 'Test command', content: 'Test content' },
      ];

      await adapter.generateCommands(templates);

      const commandPath = adapter.getCommandPath();
      expect(await fs.pathExists(commandPath)).toBe(true);

      // Verify subdirectory structure
      expect(await fs.pathExists('.crush/commands/clavix')).toBe(true);
      const files = await fs.readdir(commandPath);
      expect(files).toContain('test.md');
    });

    it('should create parent directories', async () => {
      const templates: CommandTemplate[] = [
        { name: 'cmd', description: 'Command', content: 'Content' },
      ];

      await adapter.generateCommands(templates);

      expect(await fs.pathExists('.crush')).toBe(true);
      expect(await fs.pathExists('.crush/commands')).toBe(true);
      expect(await fs.pathExists('.crush/commands/clavix')).toBe(true);
    });

    it('should use .md file extension', async () => {
      const templates: CommandTemplate[] = [
        { name: 'example', description: 'Example', content: 'Example content' },
      ];

      await adapter.generateCommands(templates);

      const filePath = path.join('.crush/commands/clavix', 'example.md');
      expect(await fs.pathExists(filePath)).toBe(true);
    });

    it('should overwrite existing commands', async () => {
      await fs.ensureDir('.crush/commands/clavix');
      await fs.writeFile(
        '.crush/commands/clavix/test.md',
        'Old content'
      );

      const templates: CommandTemplate[] = [
        { name: 'test', description: 'Test', content: 'New content' },
      ];

      await adapter.generateCommands(templates);

      const content = await fs.readFile(
        '.crush/commands/clavix/test.md',
        'utf-8'
      );
      expect(content).toBe('New content');
      expect(content).not.toContain('Old content');
    });

    it('should handle multiple commands', async () => {
      const templates: CommandTemplate[] = Array.from({ length: 5 }, (_, i) => ({
        name: `cmd-${i}`,
        description: `Description ${i}`,
        content: `Content ${i}`,
      }));

      await adapter.generateCommands(templates);

      const files = await fs.readdir('.crush/commands/clavix');
      expect(files.length).toBe(5);
      expect(files).toContain('cmd-0.md');
      expect(files).toContain('cmd-4.md');
    });

    it('should preserve content format without frontmatter', async () => {
      const content = '# Title\n\nContent without frontmatter';
      const templates: CommandTemplate[] = [
        { name: 'test', description: 'Test', content },
      ];

      await adapter.generateCommands(templates);

      const fileContent = await fs.readFile(
        '.crush/commands/clavix/test.md',
        'utf-8'
      );
      expect(fileContent).toBe(content);
      expect(fileContent).not.toContain('---');
    });
  });

  describe('$PROMPT placeholder replacement', () => {
    it('should replace {{ARGS}} with $PROMPT', async () => {
      const templates: CommandTemplate[] = [
        {
          name: 'test',
          description: 'Test',
          content: 'Take user input: {{ARGS}}',
        },
      ];

      await adapter.generateCommands(templates);

      const content = await fs.readFile(
        '.crush/commands/clavix/test.md',
        'utf-8'
      );
      expect(content).toContain('$PROMPT');
      expect(content).not.toContain('{{ARGS}}');
      expect(content).toBe('Take user input: $PROMPT');
    });

    it('should replace multiple {{ARGS}} occurrences', async () => {
      const templates: CommandTemplate[] = [
        {
          name: 'multi',
          description: 'Multi',
          content: 'First: {{ARGS}}, Second: {{ARGS}}, Third: {{ARGS}}',
        },
      ];

      await adapter.generateCommands(templates);

      const content = await fs.readFile(
        '.crush/commands/clavix/multi.md',
        'utf-8'
      );
      expect(content).toBe('First: $PROMPT, Second: $PROMPT, Third: $PROMPT');
      expect(content).not.toContain('{{ARGS}}');
    });

    it('should handle {{ARGS}} in code blocks', async () => {
      const templates: CommandTemplate[] = [
        {
          name: 'code',
          description: 'Code',
          content: '```\nUsage: command {{ARGS}}\n```',
        },
      ];

      await adapter.generateCommands(templates);

      const content = await fs.readFile(
        '.crush/commands/clavix/code.md',
        'utf-8'
      );
      expect(content).toBe('```\nUsage: command $PROMPT\n```');
    });

    it('should not affect content without {{ARGS}}', async () => {
      const originalContent = '# Command\n\nNo placeholders here';
      const templates: CommandTemplate[] = [
        {
          name: 'no-args',
          description: 'No args',
          content: originalContent,
        },
      ];

      await adapter.generateCommands(templates);

      const content = await fs.readFile(
        '.crush/commands/clavix/no-args.md',
        'utf-8'
      );
      expect(content).toBe(originalContent);
    });
  });

  describe('formatCommand', () => {
    it('should convert {{ARGS}} to $PROMPT', () => {
      const template: CommandTemplate = {
        name: 'test',
        description: 'Test',
        content: 'User says: {{ARGS}}',
      };

      const formatted = (adapter as any).formatCommand(template);

      expect(formatted).toBe('User says: $PROMPT');
    });

    it('should handle complex template content', () => {
      const template: CommandTemplate = {
        name: 'complex',
        description: 'Complex',
        content: `# Fast Mode

Analyze: {{ARGS}}

Then provide:
- Analysis for {{ARGS}}
- Recommendations`,
      };

      const formatted = (adapter as any).formatCommand(template);

      expect(formatted).toContain('$PROMPT');
      expect(formatted).not.toContain('{{ARGS}}');
      expect(formatted).toMatch(/Analyze: \$PROMPT/);
      expect(formatted).toMatch(/Analysis for \$PROMPT/);
    });
  });

  describe('subdirectory support', () => {
    it('should use clavix subdirectory', async () => {
      const templates: CommandTemplate[] = [
        { name: 'cmd', description: 'Cmd', content: 'Content' },
      ];

      await adapter.generateCommands(templates);

      expect(await fs.pathExists('.crush/commands/clavix/cmd.md')).toBe(true);
      expect(await fs.pathExists('.crush/commands/cmd.md')).toBe(false);
    });

    it('should separate Crush commands from other tools', async () => {
      // Create another tool's commands
      await fs.ensureDir('.crush/commands/other-tool');
      await fs.writeFile('.crush/commands/other-tool/cmd.md', 'Other');

      const templates: CommandTemplate[] = [
        { name: 'clavix-cmd', description: 'Clavix', content: 'Clavix' },
      ];

      await adapter.generateCommands(templates);

      // Both should coexist
      expect(await fs.pathExists('.crush/commands/other-tool/cmd.md')).toBe(true);
      expect(await fs.pathExists('.crush/commands/clavix/clavix-cmd.md')).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle empty command list', async () => {
      await adapter.generateCommands([]);

      const commandPath = adapter.getCommandPath();
      expect(await fs.pathExists(commandPath)).toBe(true);
    });

    it('should handle commands with hyphens and underscores', async () => {
      const templates: CommandTemplate[] = [
        { name: 'my-command_v2', description: 'Test', content: 'content' },
      ];

      await adapter.generateCommands(templates);

      const filePath = path.join('.crush/commands/clavix', 'my-command_v2.md');
      expect(await fs.pathExists(filePath)).toBe(true);
    });

    it('should handle long command content', async () => {
      const longContent = 'x'.repeat(10000);
      const templates: CommandTemplate[] = [
        { name: 'long', description: 'Long', content: longContent },
      ];

      await adapter.generateCommands(templates);

      const content = await fs.readFile(
        '.crush/commands/clavix/long.md',
        'utf-8'
      );
      expect(content.length).toBe(10000);
    });

    it('should handle unicode in content', async () => {
      const templates: CommandTemplate[] = [
        {
          name: 'unicode',
          description: 'Unicode test',
          content: 'Test with émojis 🚀 and spëcial çhars'
        },
      ];

      await adapter.generateCommands(templates);

      const content = await fs.readFile(
        '.crush/commands/clavix/unicode.md',
        'utf-8'
      );
      expect(content).toContain('émojis');
      expect(content).toContain('🚀');
    });

    it('should handle empty content', async () => {
      const templates: CommandTemplate[] = [
        { name: 'empty', description: 'Empty', content: '' },
      ];

      await adapter.generateCommands(templates);

      const content = await fs.readFile(
        '.crush/commands/clavix/empty.md',
        'utf-8'
      );
      expect(content).toBe('');
    });

    it('should handle markdown code blocks', async () => {
      const content = '```bash\necho "hello"\n```';
      const templates: CommandTemplate[] = [
        { name: 'code', description: 'Code', content },
      ];

      await adapter.generateCommands(templates);

      const fileContent = await fs.readFile(
        '.crush/commands/clavix/code.md',
        'utf-8'
      );
      expect(fileContent).toBe(content);
    });

    it('should handle {{ARGS}} with unicode', async () => {
      const templates: CommandTemplate[] = [
        {
          name: 'unicode-args',
          description: 'Unicode',
          content: 'Prompt: {{ARGS}} with émojis 🚀',
        },
      ];

      await adapter.generateCommands(templates);

      const content = await fs.readFile(
        '.crush/commands/clavix/unicode-args.md',
        'utf-8'
      );
      expect(content).toBe('Prompt: $PROMPT with émojis 🚀');
    });
  });

  describe('validation', () => {
    it('should pass validation when .crush directory exists', async () => {
      await fs.ensureDir('.crush');

      const result = await adapter.validate();

      expect(result.valid).toBe(true);
      expect(result.errors).toBeUndefined();
    });

    it('should warn when .crush directory will be created', async () => {
      const result = await adapter.validate();

      expect(result.valid).toBe(true);
      expect(result.warnings).toBeDefined();
    });

    it('should create commands directory during validation', async () => {
      await adapter.validate();

      const commandPath = adapter.getCommandPath();
      expect(await fs.pathExists(commandPath)).toBe(true);
    });
  });

  describe('integration with BaseAdapter', () => {
    it('should extend BaseAdapter', () => {
      expect(adapter).toBeInstanceOf(CrushAdapter);
      // BaseAdapter methods should be available
      expect(typeof adapter.generateCommands).toBe('function');
      expect(typeof adapter.validate).toBe('function');
    });

    it('should override formatCommand', () => {
      const template: CommandTemplate = {
        name: 'test',
        description: 'Test',
        content: '{{ARGS}}',
      };

      const formatted = (adapter as any).formatCommand(template);

      // Should apply Crush-specific transformation
      expect(formatted).toBe('$PROMPT');
    });

    it('should use default injectDocumentation (no-op)', async () => {
      // Should not throw
      await expect(adapter.injectDocumentation([])).resolves.toBeUndefined();
    });
  });
});
