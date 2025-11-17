import fs from 'fs-extra';
import * as path from 'path';
import { QwenAdapter } from '../../src/core/adapters/qwen-adapter';
import { CommandTemplate } from '../../src/types/agent';
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('QwenAdapter', () => {
  let adapter: QwenAdapter;
  const testDir = path.join(__dirname, '../fixtures/qwen-adapter');
  let originalCwd: string;
  let originalHomeOverride: string | undefined;

  beforeEach(async () => {
    await fs.remove(testDir);
    await fs.ensureDir(testDir);

    originalCwd = process.cwd();
    process.chdir(testDir);

    originalHomeOverride = process.env.CLAVIX_HOME_OVERRIDE;
    process.env.CLAVIX_HOME_OVERRIDE = testDir;

    adapter = new QwenAdapter();
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    if (originalHomeOverride === undefined) {
      delete process.env.CLAVIX_HOME_OVERRIDE;
    } else {
      process.env.CLAVIX_HOME_OVERRIDE = originalHomeOverride;
    }
    await fs.remove(testDir);
  });

  it('should expose Qwen metadata', () => {
    expect(adapter.name).toBe('qwen');
    expect(adapter.displayName).toBe('Qwen Code');
    expect(adapter.directory).toBe(path.join('.qwen', 'commands', 'clavix'));
    expect(adapter.fileExtension).toBe('.toml');
  });

  describe('detectProject', () => {
    it('detects local .qwen directory', async () => {
      await fs.ensureDir('.qwen');
      await expect(adapter.detectProject()).resolves.toBe(true);
    });

    it('detects global ~/.qwen directory', async () => {
      await fs.ensureDir(path.join(testDir, '.qwen'));
      await expect(adapter.detectProject()).resolves.toBe(true);
    });

    it('returns false when directories are absent', async () => {
      await expect(adapter.detectProject()).resolves.toBe(false);
    });
  });

  describe('formatCommand', () => {
    it('wraps content in TOML and adjusts argument placeholders', () => {
      const template: CommandTemplate = {
        name: 'test',
        description: 'Example description',
        content: 'Prompt with {{ARGS}}',
      };

      const formatted = (adapter as unknown as { formatCommand(t: CommandTemplate): string }).formatCommand(template);

      expect(formatted).toContain('description = "Example description"');
      expect(formatted).toContain('Prompt with {{args}}');
      expect(formatted).not.toContain('{{ARGS}}');
    });
  });

  describe('generateCommands', () => {
    it('creates TOML command files for Qwen', async () => {
      const templates: CommandTemplate[] = [
        {
          name: 'deep',
          description: 'Deep analysis',
          content: 'Process {{ARGS}} thoroughly.',
        },
      ];

      await adapter.generateCommands(templates);

      const fileContent = await fs.readFile(path.join('.qwen', 'commands', 'clavix', 'deep.toml'), 'utf8');

      expect(fileContent).toContain('description = "Deep analysis"');
      expect(fileContent).toContain('Process {{args}} thoroughly.');
      const occurrences = (fileContent.match(/prompt\s*=\s*"""/g) ?? []).length;
      expect(occurrences).toBe(1);
    });
  });
});
