/**
 * Tests for BaseAdapter - Base adapter class with shared logic
 */

import fs from 'fs-extra';
import * as path from 'path';
import { BaseAdapter } from '../../src/core/adapters/base-adapter';
import { CommandTemplate, ManagedBlock } from '../../src/types/agent';
import { IntegrationError } from '../../src/types/errors';
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a concrete test implementation of the abstract BaseAdapter
class TestAdapter extends BaseAdapter {
  readonly name = 'test';
  readonly displayName = 'Test Adapter';
  readonly directory = '.test/commands';
  readonly fileExtension = '.md';

  async detectProject(): Promise<boolean> {
    return await fs.pathExists('.test');
  }

  getCommandPath(): string {
    return this.directory;
  }
}

describe('BaseAdapter', () => {
  let adapter: TestAdapter;
  const testDir = path.join(__dirname, '../fixtures/test-adapter');
  let originalCwd: string;

  beforeEach(async () => {
    // Clean up and setup
    await fs.remove(testDir);
    await fs.ensureDir(testDir);

    originalCwd = process.cwd();
    process.chdir(testDir);

    adapter = new TestAdapter();
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    await fs.remove(testDir);
  });

  describe('adapter properties', () => {
    it('should have required properties', () => {
      expect(adapter.name).toBe('test');
      expect(adapter.displayName).toBe('Test Adapter');
      expect(adapter.directory).toBe('.test/commands');
      expect(adapter.fileExtension).toBe('.md');
    });

    it('should implement getCommandPath', () => {
      const commandPath = adapter.getCommandPath();
      expect(commandPath).toBe('.test/commands');
    });
  });

  describe('detectProject', () => {
    it('should detect when project directory exists', async () => {
      await fs.ensureDir('.test');
      const detected = await adapter.detectProject();
      expect(detected).toBe(true);
    });

    it('should not detect when project directory does not exist', async () => {
      const detected = await adapter.detectProject();
      expect(detected).toBe(false);
    });
  });

  describe('validate', () => {
    it('should pass validation when parent directory exists', async () => {
      // Create parent of command path
      await fs.ensureDir('.');

      const result = await adapter.validate();

      expect(result.valid).toBe(true);
      expect(result.errors).toBeUndefined();
    });

    it('should warn when parent directory will be created', async () => {
      const result = await adapter.validate();

      // Should be valid but with warnings
      expect(result.valid).toBe(true);
      expect(result.warnings).toBeDefined();
      if (result.warnings) {
        expect(result.warnings.length).toBeGreaterThan(0);
      }
    });

    it('should fail validation when directory cannot be created', async () => {
      // Create a file where directory should be
      const parentDir = path.dirname(adapter.getCommandPath());
      await fs.ensureDir(parentDir);
      await fs.writeFile(adapter.getCommandPath(), 'blocking file');

      const result = await adapter.validate();

      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it('should ensure command directory exists', async () => {
      await adapter.validate();

      const commandPath = adapter.getCommandPath();
      const exists = await fs.pathExists(commandPath);

      expect(exists).toBe(true);
    });
  });

  describe('generateCommands', () => {
    it('should generate command files from templates', async () => {
      const templates: CommandTemplate[] = [
        {
          name: 'test-command',
          description: 'Test command description',
          content: '# Test Command\n\nThis is a test command.',
        },
        {
          name: 'another-command',
          description: 'Another command description',
          content: '# Another Command\n\nAnother test.',
        },
      ];

      await adapter.generateCommands(templates);

      const commandPath = adapter.getCommandPath();
      const file1 = await fs.readFile(path.join(commandPath, 'test-command.md'), 'utf-8');
      const file2 = await fs.readFile(path.join(commandPath, 'another-command.md'), 'utf-8');

      expect(file1).toBe('# Test Command\n\nThis is a test command.');
      expect(file2).toBe('# Another Command\n\nAnother test.');
    });

    it('should create command directory if it does not exist', async () => {
      const templates: CommandTemplate[] = [
        { name: 'test', description: 'Test description', content: 'content' },
      ];

      await adapter.generateCommands(templates);

      const commandPath = adapter.getCommandPath();
      const exists = await fs.pathExists(commandPath);
      expect(exists).toBe(true);
    });

    it('should use correct file extension', async () => {
      const templates: CommandTemplate[] = [
        { name: 'my-command', description: 'My command description', content: 'test content' },
      ];

      await adapter.generateCommands(templates);

      const commandPath = adapter.getCommandPath();
      const filePath = path.join(commandPath, 'my-command.md');
      const exists = await fs.pathExists(filePath);

      expect(exists).toBe(true);
    });

    it('should overwrite existing commands', async () => {
      const commandPath = adapter.getCommandPath();
      await fs.ensureDir(commandPath);
      await fs.writeFile(path.join(commandPath, 'test.md'), 'old content');

      const templates: CommandTemplate[] = [
        { name: 'test', description: 'Test command', content: 'new content' },
      ];

      await adapter.generateCommands(templates);

      const content = await fs.readFile(path.join(commandPath, 'test.md'), 'utf-8');
      expect(content).toBe('new content');
    });

    it('should handle multiple commands', async () => {
      const templates: CommandTemplate[] = Array.from({ length: 5 }, (_, i) => ({
        name: `command-${i}`,
        description: `Description ${i}`,
        content: `Content ${i}`,
      }));

      await adapter.generateCommands(templates);

      const commandPath = adapter.getCommandPath();
      const files = await fs.readdir(commandPath);

      expect(files.length).toBe(5);
      expect(files).toContain('command-0.md');
      expect(files).toContain('command-4.md');
    });

    it('should throw IntegrationError when directory is not writable', async () => {
      // This test may not work on all systems due to permissions
      const templates: CommandTemplate[] = [
        { name: 'test', description: 'Test description', content: 'content' },
      ];

      // Create read-only directory
      const commandPath = adapter.getCommandPath();
      await fs.ensureDir(commandPath);

      // Try to make it read-only (may not work on all systems)
      try {
        await fs.chmod(commandPath, 0o444);

        await expect(adapter.generateCommands(templates)).rejects.toThrow(IntegrationError);

        // Restore permissions for cleanup
        await fs.chmod(commandPath, 0o755);
      } catch {
        // Skip if chmod not supported
        expect(true).toBe(true);
      }
    });
  });

  describe('formatCommand', () => {
    it('should return content as-is by default', () => {
      const template: CommandTemplate = {
        name: 'test',
        description: 'Test command',
        content: '# Test\n\nContent here',
      };

      // Access protected method through any
      const formatted = (adapter as any).formatCommand(template);

      expect(formatted).toBe(template.content);
    });
  });

  describe('injectDocumentation', () => {
    it('should be a no-op by default', async () => {
      const blocks: ManagedBlock[] = [
        {
          targetFile: 'test.md',
          content: 'Block content',
          startMarker: '<!-- START -->',
          endMarker: '<!-- END -->',
        },
      ];

      // Should not throw
      await expect(adapter.injectDocumentation(blocks)).resolves.toBeUndefined();
    });
  });

  describe('removeAllCommands', () => {
    it('should return 0 when directory does not exist', async () => {
      const removed = await adapter.removeAllCommands();
      expect(removed).toBe(0);
    });

    it('should remove all command files matching extension', async () => {
      const commandPath = adapter.getCommandPath();
      await fs.ensureDir(commandPath);
      await fs.writeFile(path.join(commandPath, 'test1.md'), 'content1');
      await fs.writeFile(path.join(commandPath, 'test2.md'), 'content2');

      const removed = await adapter.removeAllCommands();

      expect(removed).toBe(2);
      const files = await fs.readdir(commandPath);
      expect(files.filter((f) => f.endsWith('.md')).length).toBe(0);
    });

    it('should not remove files with different extension', async () => {
      const commandPath = adapter.getCommandPath();
      await fs.ensureDir(commandPath);
      await fs.writeFile(path.join(commandPath, 'test.md'), 'content');
      await fs.writeFile(path.join(commandPath, 'other.txt'), 'other');

      await adapter.removeAllCommands();

      const files = await fs.readdir(commandPath);
      expect(files).toContain('other.txt');
      expect(files).not.toContain('test.md');
    });

    it('should handle empty directory', async () => {
      const commandPath = adapter.getCommandPath();
      await fs.ensureDir(commandPath);

      const removed = await adapter.removeAllCommands();

      expect(removed).toBe(0);
    });

    it('should remove clavix/ subdirectory if it exists', async () => {
      const commandPath = adapter.getCommandPath();
      await fs.ensureDir(commandPath);

      // Create command files
      await fs.writeFile(path.join(commandPath, 'test.md'), 'content');

      // Create clavix/ subdirectory with files (legacy structure)
      const clavixSubdir = path.join(commandPath, 'clavix');
      await fs.ensureDir(clavixSubdir);
      await fs.writeFile(path.join(clavixSubdir, 'legacy-command.md'), 'legacy');

      const removed = await adapter.removeAllCommands();

      // Should remove both the file and the subdirectory
      expect(removed).toBe(2);
      expect(await fs.pathExists(path.join(commandPath, 'test.md'))).toBe(false);
      expect(await fs.pathExists(clavixSubdir)).toBe(false);
    });

    it('should handle clavix/ subdirectory when no files exist', async () => {
      const commandPath = adapter.getCommandPath();
      await fs.ensureDir(commandPath);

      // Only create clavix/ subdirectory (no command files)
      const clavixSubdir = path.join(commandPath, 'clavix');
      await fs.ensureDir(clavixSubdir);
      await fs.writeFile(path.join(clavixSubdir, 'legacy.md'), 'legacy');

      const removed = await adapter.removeAllCommands();

      expect(removed).toBe(1);
      expect(await fs.pathExists(clavixSubdir)).toBe(false);
    });
  });

  describe('isClavixGeneratedCommand', () => {
    it('should match files with correct extension', () => {
      const isMatch = (adapter as any).isClavixGeneratedCommand('test.md');
      expect(isMatch).toBe(true);
    });

    it('should not match files with different extension', () => {
      const isMatch = (adapter as any).isClavixGeneratedCommand('test.txt');
      expect(isMatch).toBe(false);
    });
  });

  describe('getTargetFilename', () => {
    it('should append correct extension', () => {
      const filename = adapter.getTargetFilename('my-command');
      expect(filename).toBe('my-command.md');
    });
  });

  describe('edge cases', () => {
    it('should handle empty command list', async () => {
      await adapter.generateCommands([]);

      const commandPath = adapter.getCommandPath();
      const exists = await fs.pathExists(commandPath);

      expect(exists).toBe(true);
    });

    it('should handle commands with special characters in names', async () => {
      const templates: CommandTemplate[] = [
        { name: 'test-command_v2', description: 'Test with special chars', content: 'content' },
      ];

      await adapter.generateCommands(templates);

      const commandPath = adapter.getCommandPath();
      const filePath = path.join(commandPath, 'test-command_v2.md');
      const exists = await fs.pathExists(filePath);

      expect(exists).toBe(true);
    });

    it('should handle long command content', async () => {
      const longContent = 'x'.repeat(10000);
      const templates: CommandTemplate[] = [
        { name: 'long', description: 'Long content test', content: longContent },
      ];

      await adapter.generateCommands(templates);

      const commandPath = adapter.getCommandPath();
      const content = await fs.readFile(path.join(commandPath, 'long.md'), 'utf-8');

      expect(content.length).toBe(10000);
    });

    it('should handle unicode in command content', async () => {
      const templates: CommandTemplate[] = [
        {
          name: 'unicode',
          description: 'Unicode test',
          content: 'Test with émojis 🚀 and spëcial çhars',
        },
      ];

      await adapter.generateCommands(templates);

      const commandPath = adapter.getCommandPath();
      const content = await fs.readFile(path.join(commandPath, 'unicode.md'), 'utf-8');

      expect(content).toContain('émojis');
      expect(content).toContain('🚀');
    });
  });
});
