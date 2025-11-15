import * as fs from 'fs-extra';
import * as path from 'path';
import { GeminiAdapter } from '../../src/core/adapters/gemini-adapter';
import { CommandTemplate } from '../../src/types/agent';

describe('GeminiAdapter', () => {
  let adapter: GeminiAdapter;
  const testDir = path.join(__dirname, '../fixtures/gemini-adapter');
  let originalCwd: string;
  let originalHomeOverride: string | undefined;

  beforeEach(async () => {
    await fs.remove(testDir);
    await fs.ensureDir(testDir);

    originalCwd = process.cwd();
    process.chdir(testDir);

    originalHomeOverride = process.env.CLAVIX_HOME_OVERRIDE;
    process.env.CLAVIX_HOME_OVERRIDE = testDir;

    adapter = new GeminiAdapter();
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

  it('should expose Gemini metadata', () => {
    expect(adapter.name).toBe('gemini');
    expect(adapter.displayName).toBe('Gemini CLI');
    expect(adapter.directory).toBe('.gemini/commands');
    expect(adapter.fileExtension).toBe('.toml');
  });

  describe('detectProject', () => {
    it('detects local .gemini directory', async () => {
      await fs.ensureDir('.gemini');
      await expect(adapter.detectProject()).resolves.toBe(true);
    });

    it('detects global ~/.gemini directory', async () => {
      await fs.ensureDir(path.join(testDir, '.gemini'));
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

      const fileContent = await fs.readFile(path.join('.gemini/commands', 'fast.toml'), 'utf8');

      expect(fileContent).toContain('description = "Fast improvements"');
      expect(fileContent).toContain('Handle {{args}} swiftly.');
      expect(fileContent.trim().endsWith('"""')).toBe(true);
    });
  });
});
