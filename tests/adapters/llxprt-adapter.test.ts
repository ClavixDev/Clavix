import fs from 'fs-extra';
import * as path from 'path';
import { LlxprtAdapter } from '../../src/core/adapters/llxprt-adapter';
import { CommandTemplate } from '../../src/types/agent';
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('LlxprtAdapter', () => {
  let adapter: LlxprtAdapter;
  const testDir = path.join(__dirname, '../fixtures/llxprt-adapter');
  let originalCwd: string;
  let originalHomeOverride: string | undefined;

  beforeEach(async () => {
    await fs.remove(testDir);
    await fs.ensureDir(testDir);

    originalCwd = process.cwd();
    process.chdir(testDir);

    originalHomeOverride = process.env.CLAVIX_HOME_OVERRIDE;
    process.env.CLAVIX_HOME_OVERRIDE = testDir;

    adapter = new LlxprtAdapter();
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

  it('should expose LLXPRT metadata', () => {
    expect(adapter.name).toBe('llxprt');
    expect(adapter.displayName).toBe('LLXPRT');
    expect(adapter.directory).toBe(path.join('.llxprt', 'commands', 'clavix'));
    expect(adapter.fileExtension).toBe('.toml');
  });

  describe('detectProject', () => {
    it('detects local .llxprt directory', async () => {
      await fs.ensureDir('.llxprt');
      await expect(adapter.detectProject()).resolves.toBe(true);
    });

    it('detects global ~/.llxprt directory', async () => {
      await fs.ensureDir(path.join(testDir, '.llxprt'));
      await expect(adapter.detectProject()).resolves.toBe(true);
    });

    it('returns false when directories are absent', async () => {
      await expect(adapter.detectProject()).resolves.toBe(false);
    });
  });

  describe('formatCommand', () => {
    it('wraps content in TOML and rewrites arguments placeholder', () => {
      const template: CommandTemplate = {
        name: 'test',
        description: 'Example description',
        content: 'Prompt using {{ARGS}}',
      };

      const formatted = (adapter as unknown as { formatCommand(t: CommandTemplate): string }).formatCommand(template);

      expect(formatted).toContain('description = "Example description"');
      expect(formatted).toContain('prompt = """');
      expect(formatted).toContain('Prompt using {{args}}');
      expect(formatted).not.toContain('{{ARGS}}');
    });
  });

  describe('generateCommands', () => {
    it('creates TOML command files', async () => {
      const templates: CommandTemplate[] = [
        {
          name: 'fast',
          description: 'Fast improvements',
          content: 'Handle {{ARGS}} swiftly.',
        },
      ];

      await adapter.generateCommands(templates);

      const fileContent = await fs.readFile(path.join('.llxprt', 'commands', 'clavix', 'fast.toml'), 'utf8');

      expect(fileContent).toContain('description = "Fast improvements"');
      expect(fileContent).toContain('Handle {{args}} swiftly.');
      expect(fileContent.trim().endsWith('"""')).toBe(true);
      const occurrences = (fileContent.match(/prompt\s*=\s*"""/g) ?? []).length;
      expect(occurrences).toBe(1);
    });
  });
});
