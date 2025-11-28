/**
 * Tests for UniversalAdapter - Config-driven adapter implementation
 *
 * This adapter handles all simple integrations (Cursor, Windsurf, Cline, etc.)
 * via configuration rather than dedicated classes.
 *
 * @since v5.3.0
 */

import fs from 'fs-extra';
import * as path from 'path';
import { UniversalAdapter } from '../../src/core/adapters/universal-adapter';
import { AdapterConfig, DEFAULT_MD_FEATURES } from '../../src/types/adapter-config';
import { CommandTemplate } from '../../src/types/agent';
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('UniversalAdapter', () => {
  const testDir = path.join(__dirname, '../fixtures/universal-adapter');
  let originalCwd: string;

  // Sample config for testing (Cursor-like)
  const cursorConfig: AdapterConfig = {
    name: 'cursor',
    displayName: 'Cursor',
    directory: '.cursor/rules',
    fileExtension: '.md',
    filenamePattern: 'clavix-{name}',
    features: { ...DEFAULT_MD_FEATURES },
    detection: { type: 'directory', path: '.cursor' },
  };

  // Custom config for edge case testing
  const customConfig: AdapterConfig = {
    name: 'custom-adapter',
    displayName: 'Custom Tool',
    directory: '.custom/commands',
    fileExtension: '.txt',
    filenamePattern: 'tool-{name}',
    features: {
      supportsSubdirectories: false,
      supportsFrontmatter: true,
      commandSeparator: '-',
    },
    detection: { type: 'file', path: '.custom/config.json' },
  };

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

  describe('adapter properties', () => {
    it('should expose config properties via getters', () => {
      const adapter = new UniversalAdapter(cursorConfig);

      expect(adapter.name).toBe('cursor');
      expect(adapter.displayName).toBe('Cursor');
      expect(adapter.directory).toBe('.cursor/rules');
      expect(adapter.fileExtension).toBe('.md');
    });

    it('should handle custom config values', () => {
      const adapter = new UniversalAdapter(customConfig);

      expect(adapter.name).toBe('custom-adapter');
      expect(adapter.displayName).toBe('Custom Tool');
      expect(adapter.directory).toBe('.custom/commands');
      expect(adapter.fileExtension).toBe('.txt');
    });
  });

  describe('getTargetFilename', () => {
    it('should generate filename from pattern with {name} placeholder', () => {
      const adapter = new UniversalAdapter(cursorConfig);

      expect(adapter.getTargetFilename('improve')).toBe('clavix-improve.md');
      expect(adapter.getTargetFilename('prd')).toBe('clavix-prd.md');
    });

    it('should handle custom filename patterns', () => {
      const adapter = new UniversalAdapter(customConfig);

      expect(adapter.getTargetFilename('improve')).toBe('tool-improve.txt');
      expect(adapter.getTargetFilename('start')).toBe('tool-start.txt');
    });

    it('should handle pattern without prefix', () => {
      const simpleConfig: AdapterConfig = {
        ...cursorConfig,
        filenamePattern: '{name}',
      };
      const adapter = new UniversalAdapter(simpleConfig);

      expect(adapter.getTargetFilename('improve')).toBe('improve.md');
    });
  });

  describe('getCommandPath', () => {
    it('should return full path with cwd', () => {
      const adapter = new UniversalAdapter(cursorConfig);
      const commandPath = adapter.getCommandPath();

      expect(commandPath).toBe(path.join(process.cwd(), '.cursor/rules'));
    });
  });

  describe('getIntegrationFeatures', () => {
    it('should return features with command separator', () => {
      const adapter = new UniversalAdapter(cursorConfig);
      const features = adapter.getIntegrationFeatures();

      expect(features.commandFormat?.separator).toBe('-');
    });

    it('should handle custom command separator', () => {
      const colonConfig: AdapterConfig = {
        ...cursorConfig,
        features: { ...DEFAULT_MD_FEATURES, commandSeparator: ':' },
      };
      const adapter = new UniversalAdapter(colonConfig);
      const features = adapter.getIntegrationFeatures();

      expect(features.commandFormat?.separator).toBe(':');
    });
  });

  describe('supportsSubdirectories', () => {
    it('should return feature flag value', () => {
      const adapter = new UniversalAdapter(cursorConfig);
      expect(adapter.supportsSubdirectories()).toBe(false);
    });

    it('should return true when enabled', () => {
      const subConfig: AdapterConfig = {
        ...cursorConfig,
        features: { ...DEFAULT_MD_FEATURES, supportsSubdirectories: true },
      };
      const adapter = new UniversalAdapter(subConfig);
      expect(adapter.supportsSubdirectories()).toBe(true);
    });
  });

  describe('supportsFrontmatter', () => {
    it('should return feature flag value', () => {
      const adapter = new UniversalAdapter(cursorConfig);
      expect(adapter.supportsFrontmatter()).toBe(false);
    });

    it('should return true when enabled', () => {
      const fmConfig: AdapterConfig = {
        ...cursorConfig,
        features: { ...DEFAULT_MD_FEATURES, supportsFrontmatter: true },
      };
      const adapter = new UniversalAdapter(fmConfig);
      expect(adapter.supportsFrontmatter()).toBe(true);
    });
  });

  describe('detectProject', () => {
    describe('directory detection', () => {
      it('should detect when directory exists', async () => {
        await fs.ensureDir('.cursor');
        const adapter = new UniversalAdapter(cursorConfig);

        const detected = await adapter.detectProject();
        expect(detected).toBe(true);
      });

      it('should not detect when directory does not exist', async () => {
        const adapter = new UniversalAdapter(cursorConfig);

        const detected = await adapter.detectProject();
        expect(detected).toBe(false);
      });
    });

    describe('file detection', () => {
      it('should detect when config file exists', async () => {
        await fs.ensureDir('.custom');
        await fs.writeFile('.custom/config.json', '{}');
        const adapter = new UniversalAdapter(customConfig);

        const detected = await adapter.detectProject();
        expect(detected).toBe(true);
      });

      it('should not detect when config file does not exist', async () => {
        await fs.ensureDir('.custom');
        const adapter = new UniversalAdapter(customConfig);

        const detected = await adapter.detectProject();
        expect(detected).toBe(false);
      });
    });

    describe('config detection', () => {
      it('should detect when config path exists', async () => {
        const configDetectionConfig: AdapterConfig = {
          ...cursorConfig,
          detection: { type: 'config', path: '.cursorrc' },
        };
        await fs.writeFile('.cursorrc', 'config=true');
        const adapter = new UniversalAdapter(configDetectionConfig);

        const detected = await adapter.detectProject();
        expect(detected).toBe(true);
      });
    });

    describe('unknown detection type', () => {
      it('should return false for unknown detection type', async () => {
        const unknownConfig: AdapterConfig = {
          ...cursorConfig,
          detection: { type: 'unknown' as 'directory', path: '.something' },
        };
        const adapter = new UniversalAdapter(unknownConfig);

        const detected = await adapter.detectProject();
        expect(detected).toBe(false);
      });
    });
  });

  describe('generateCommands (inherited from BaseAdapter)', () => {
    it('should generate command files with correct naming', async () => {
      const adapter = new UniversalAdapter(cursorConfig);
      const templates: CommandTemplate[] = [
        { name: 'improve', description: 'Optimize prompts', content: '# Improve\n\nContent' },
        { name: 'prd', description: 'Generate PRD', content: '# PRD\n\nContent' },
      ];

      await adapter.generateCommands(templates);

      const commandPath = adapter.getCommandPath();
      const improveFile = await fs.readFile(path.join(commandPath, 'clavix-improve.md'), 'utf-8');
      const prdFile = await fs.readFile(path.join(commandPath, 'clavix-prd.md'), 'utf-8');

      expect(improveFile).toBe('# Improve\n\nContent');
      expect(prdFile).toBe('# PRD\n\nContent');
    });

    it('should create directory structure if not exists', async () => {
      const adapter = new UniversalAdapter(cursorConfig);
      const templates: CommandTemplate[] = [
        { name: 'improve', description: 'Optimize', content: 'Content' },
      ];

      await adapter.generateCommands(templates);

      expect(await fs.pathExists('.cursor/rules')).toBe(true);
    });

    it('should work with custom file extensions', async () => {
      const adapter = new UniversalAdapter(customConfig);
      const templates: CommandTemplate[] = [
        { name: 'improve', description: 'Optimize', content: 'Content' },
      ];

      await adapter.generateCommands(templates);

      const commandPath = adapter.getCommandPath();
      expect(await fs.pathExists(path.join(commandPath, 'tool-improve.txt'))).toBe(true);
    });
  });

  describe('removeAllCommands (inherited from BaseAdapter)', () => {
    it('should remove all generated command files', async () => {
      const adapter = new UniversalAdapter(cursorConfig);
      const commandPath = adapter.getCommandPath();

      // Create some command files
      await fs.ensureDir(commandPath);
      await fs.writeFile(path.join(commandPath, 'clavix-improve.md'), 'content');
      await fs.writeFile(path.join(commandPath, 'clavix-prd.md'), 'content');

      const removed = await adapter.removeAllCommands();

      expect(removed).toBe(2);
      expect(await fs.pathExists(path.join(commandPath, 'clavix-improve.md'))).toBe(false);
      expect(await fs.pathExists(path.join(commandPath, 'clavix-prd.md'))).toBe(false);
    });

    it('should return 0 when directory does not exist', async () => {
      const adapter = new UniversalAdapter(cursorConfig);

      const removed = await adapter.removeAllCommands();

      expect(removed).toBe(0);
    });

    it('should only remove files matching extension', async () => {
      const adapter = new UniversalAdapter(cursorConfig);
      const commandPath = adapter.getCommandPath();

      await fs.ensureDir(commandPath);
      await fs.writeFile(path.join(commandPath, 'clavix-improve.md'), 'content');
      await fs.writeFile(path.join(commandPath, 'other-file.txt'), 'keep this');

      await adapter.removeAllCommands();

      expect(await fs.pathExists(path.join(commandPath, 'clavix-improve.md'))).toBe(false);
      expect(await fs.pathExists(path.join(commandPath, 'other-file.txt'))).toBe(true);
    });
  });

  describe('validate (inherited from BaseAdapter)', () => {
    it('should return valid for writable directory', async () => {
      const adapter = new UniversalAdapter(cursorConfig);

      const result = await adapter.validate();

      expect(result.valid).toBe(true);
    });

    it('should warn when parent directory will be created', async () => {
      const adapter = new UniversalAdapter(cursorConfig);

      const result = await adapter.validate();

      expect(result.warnings).toBeDefined();
      expect(result.warnings?.[0]).toContain('will be created');
    });
  });

  describe('integration with different adapter configs', () => {
    const adapterConfigs: { name: string; directory: string }[] = [
      { name: 'cursor', directory: '.cursor/rules' },
      { name: 'windsurf', directory: '.windsurf/rules' },
      { name: 'cline', directory: '.cline/rules' },
      { name: 'kilocode', directory: '.kilocode/rules' },
    ];

    it.each(adapterConfigs)(
      'should correctly configure $name adapter',
      async ({ name, directory }) => {
        const config: AdapterConfig = {
          name,
          displayName: name.charAt(0).toUpperCase() + name.slice(1),
          directory,
          fileExtension: '.md',
          filenamePattern: 'clavix-{name}',
          features: { ...DEFAULT_MD_FEATURES },
          detection: { type: 'directory', path: directory.split('/')[0] },
        };

        const adapter = new UniversalAdapter(config);

        expect(adapter.name).toBe(name);
        expect(adapter.directory).toBe(directory);
        expect(adapter.getTargetFilename('improve')).toBe('clavix-improve.md');
      }
    );
  });
});
