import fs from 'fs-extra';
import * as path from 'path';
import { AugmentAdapter } from '../../src/core/adapters/augment-adapter';
import { CommandTemplate } from '../../src/types/agent';
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('AugmentAdapter', () => {
  let adapter: AugmentAdapter;
  const testDir = path.join(__dirname, '../fixtures/augment-adapter');
  let originalCwd: string;
  let originalHomeOverride: string | undefined;

  beforeEach(async () => {
    await fs.remove(testDir);
    await fs.ensureDir(testDir);

    originalCwd = process.cwd();
    process.chdir(testDir);

    originalHomeOverride = process.env.CLAVIX_HOME_OVERRIDE;
    process.env.CLAVIX_HOME_OVERRIDE = testDir;

    adapter = new AugmentAdapter();
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

  it('exposes adapter metadata', () => {
    expect(adapter.name).toBe('augment');
    expect(adapter.displayName).toBe('Augment CLI');
    expect(adapter.directory).toBe('.augment/commands/clavix');
    expect(adapter.fileExtension).toBe('.md');
  });

  it('defines Augment-specific features', () => {
    expect(adapter.features).toEqual({
      supportsSubdirectories: true,
      supportsFrontmatter: true,
      frontmatterFields: ['description', 'argument-hint', 'model'],
    });
  });

  describe('detectProject', () => {
    it('detects local .augment directory', async () => {
      await fs.ensureDir('.augment');
      await expect(adapter.detectProject()).resolves.toBe(true);
    });

    it('detects global ~/.augment directory', async () => {
      await fs.ensureDir(path.join(testDir, '.augment'));
      await expect(adapter.detectProject()).resolves.toBe(true);
    });

    it('returns false when Augment directories are absent', async () => {
      await expect(adapter.detectProject()).resolves.toBe(false);
    });
  });

  describe('formatCommand', () => {
    it('adds Augment frontmatter without altering placeholders', () => {
      const template: CommandTemplate = {
        name: 'fast',
        description: 'Clear improvements',
        content: 'Input: {{ARGS}}',
      };

      const formatted = (adapter as unknown as { formatCommand(t: CommandTemplate): string }).formatCommand(
        template
      );

      expect(formatted.startsWith('---\ndescription: Clear improvements')).toBe(true);
      expect(formatted).toContain('argument-hint: [prompt]');
      expect(formatted).toContain('Input: {{ARGS}}');
    });
  });

  describe('generateCommands', () => {
    it('writes markdown command files with Augment frontmatter', async () => {
      const templates: CommandTemplate[] = [
        {
          name: 'fast',
          description: 'Fast mode',
          content: 'Handle {{ARGS}} quickly.',
        },
      ];

      await adapter.generateCommands(templates);

      const filePath = path.join('.augment/commands/clavix', 'fast.md');
      const content = await fs.readFile(filePath, 'utf8');

      expect(content).toContain('description: Fast mode');
      expect(content).toContain('argument-hint: [prompt]');
      expect(content).toContain('Handle {{ARGS}} quickly.');
    });
  });

  describe('validate', () => {
    it('ensures command directory exists', async () => {
      const result = await adapter.validate();

      expect(result.valid).toBe(true);
      expect(await fs.pathExists('.augment/commands/clavix')).toBe(true);
    });
  });
});
