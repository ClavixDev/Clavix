import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import * as fs from 'fs/promises';
import * as path from 'path';
import {
  TomlFormattingAdapter,
  TomlAdapterConfig,
} from '../../src/core/adapters/toml-formatting-adapter';
import { CommandTemplate } from '../../src/types/agent';

/**
 * Concrete implementation for testing the abstract TomlFormattingAdapter
 */
class TestTomlAdapter extends TomlFormattingAdapter {
  constructor(config: TomlAdapterConfig, options: { useNamespace?: boolean } = {}) {
    super(config, options);
  }

  // Expose protected method for testing
  public testFormatCommand(template: CommandTemplate): string {
    return this.formatCommand(template);
  }
}

describe('TomlFormattingAdapter', () => {
  const testConfig: TomlAdapterConfig = {
    name: 'test-toml',
    displayName: 'Test TOML Adapter',
    rootDir: '.test-toml',
  };

  let adapter: TestTomlAdapter;

  beforeEach(async () => {
    adapter = new TestTomlAdapter(testConfig);
    // Clean up test directories
    await fs.rm('.test-toml', { recursive: true, force: true });
  });

  afterEach(async () => {
    await fs.rm('.test-toml', { recursive: true, force: true });
  });

  describe('constructor and properties', () => {
    it('sets correct properties from config', () => {
      expect(adapter.name).toBe('test-toml');
      expect(adapter.displayName).toBe('Test TOML Adapter');
      expect(adapter.fileExtension).toBe('.toml');
    });

    it('sets correct directory with namespace by default', () => {
      expect(adapter.directory).toBe(path.join('.test-toml', 'commands', 'clavix'));
    });

    it('sets correct directory without namespace when disabled', () => {
      const noNamespace = new TestTomlAdapter(testConfig, { useNamespace: false });
      expect(noNamespace.directory).toBe(path.join('.test-toml', 'commands'));
    });

    it('sets correct features', () => {
      expect(adapter.features).toEqual({
        supportsSubdirectories: true,
        argumentPlaceholder: '{{args}}',
      });
    });
  });

  describe('getCommandPath', () => {
    it('returns directory path', () => {
      expect(adapter.getCommandPath()).toBe(adapter.directory);
    });
  });

  describe('getTargetFilename', () => {
    it('returns plain filename when namespaced', () => {
      expect(adapter.getTargetFilename('improve')).toBe('improve.toml');
    });

    it('returns prefixed filename when not namespaced', () => {
      const noNamespace = new TestTomlAdapter(testConfig, { useNamespace: false });
      expect(noNamespace.getTargetFilename('improve')).toBe('clavix-improve.toml');
    });
  });

  describe('formatCommand', () => {
    it('wraps content in TOML format with description', () => {
      const template: CommandTemplate = {
        name: 'test',
        description: 'Test description',
        content: 'Test content',
      };

      const result = adapter.testFormatCommand(template);

      expect(result).toContain('description = "Test description"');
      expect(result).toContain('prompt = """');
      expect(result).toContain('Test content');
      expect(result).toContain('"""');
    });

    it('omits description when empty', () => {
      const template: CommandTemplate = {
        name: 'test',
        description: '',
        content: 'Content only',
      };

      const result = adapter.testFormatCommand(template);

      expect(result).not.toContain('description');
      expect(result).toContain('prompt = """');
      expect(result).toContain('Content only');
    });

    it('converts {{ARGS}} to {{args}}', () => {
      const template: CommandTemplate = {
        name: 'test',
        description: 'With args',
        content: 'Process {{ARGS}} here',
      };

      const result = adapter.testFormatCommand(template);

      expect(result).toContain('Process {{args}} here');
      expect(result).not.toContain('{{ARGS}}');
    });
  });

  describe('detectProject', () => {
    it('returns true when local directory exists', async () => {
      await fs.mkdir('.test-toml', { recursive: true });
      expect(await adapter.detectProject()).toBe(true);
    });

    it('returns false when directory does not exist', async () => {
      expect(await adapter.detectProject()).toBe(false);
    });
  });

  describe('generateCommands', () => {
    it('creates TOML command files', async () => {
      const templates: CommandTemplate[] = [
        {
          name: 'improve',
          description: 'Improve prompt',
          content: 'Improve {{ARGS}}',
        },
      ];

      await adapter.generateCommands(templates);

      const fileContent = await fs.readFile(
        path.join('.test-toml', 'commands', 'clavix', 'improve.toml'),
        'utf8'
      );

      expect(fileContent).toContain('description = "Improve prompt"');
      expect(fileContent).toContain('prompt = """');
      expect(fileContent).toContain('Improve {{args}}');
    });
  });
});
