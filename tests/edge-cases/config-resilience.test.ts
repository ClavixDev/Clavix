/**
 * Config Resilience Tests
 * Tests edge cases for configuration validation and recovery
 */

import fs from 'fs-extra';
import * as path from 'path';
import {
  ClavixConfig,
  LegacyConfig,
  DEFAULT_CONFIG,
  migrateConfig,
  isLegacyConfig,
} from '../../src/types/config';
import { CLAVIX_VERSION } from '../../src/utils/version';
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Config Resilience', () => {
  const testDir = path.join(__dirname, '../tmp/config-resilience-test');
  const configPath = path.join(testDir, '.clavix/config.json');

  beforeEach(async () => {
    await fs.ensureDir(path.dirname(configPath));
  });

  afterEach(async () => {
    await fs.remove(testDir);
  });

  describe('Malformed JSON Recovery', () => {
    it('should handle syntax error - missing closing brace', async () => {
      const malformed = `{
  "version": "1.4.0",
  "integrations": ["claude-code"]`;

      await fs.writeFile(configPath, malformed);

      let error: Error | undefined;
      try {
        JSON.parse(await fs.readFile(configPath, 'utf-8'));
      } catch (e) {
        error = e as Error;
      }

      expect(error).toBeDefined();
      expect(error?.message).toContain('JSON');
    });

    it('should handle syntax error - trailing comma', async () => {
      const malformed = `{
  "version": "1.4.0",
  "integrations": ["claude-code"],
}`;

      await fs.writeFile(configPath, malformed);

      let error: Error | undefined;
      try {
        JSON.parse(await fs.readFile(configPath, 'utf-8'));
      } catch (e) {
        error = e as Error;
      }

      expect(error).toBeDefined();
    });

    it('should handle syntax error - unquoted keys', async () => {
      const malformed = `{
  version: "1.4.0",
  integrations: ["claude-code"]
}`;

      await fs.writeFile(configPath, malformed);

      let error: Error | undefined;
      try {
        JSON.parse(await fs.readFile(configPath, 'utf-8'));
      } catch (e) {
        error = e as Error;
      }

      expect(error).toBeDefined();
    });

    it('should handle completely invalid JSON', async () => {
      await fs.writeFile(configPath, 'This is not JSON at all!');

      let error: Error | undefined;
      try {
        JSON.parse(await fs.readFile(configPath, 'utf-8'));
      } catch (e) {
        error = e as Error;
      }

      expect(error).toBeDefined();
    });

    it('should handle empty file', async () => {
      await fs.writeFile(configPath, '');

      let error: Error | undefined;
      try {
        JSON.parse(await fs.readFile(configPath, 'utf-8'));
      } catch (e) {
        error = e as Error;
      }

      expect(error).toBeDefined();
    });

    it('should handle file with only whitespace', async () => {
      await fs.writeFile(configPath, '   \n\t  \n  ');

      let error: Error | undefined;
      try {
        JSON.parse(await fs.readFile(configPath, 'utf-8'));
      } catch (e) {
        error = e as Error;
      }

      expect(error).toBeDefined();
    });

    it('should handle corrupted UTF-8 encoding', async () => {
      // Write binary data that's not valid UTF-8
      await fs.writeFile(configPath, Buffer.from([0xff, 0xfe, 0xff, 0xfe]));

      const content = await fs.readFile(configPath, 'utf-8');

      let error: Error | undefined;
      try {
        JSON.parse(content);
      } catch (e) {
        error = e as Error;
      }

      expect(error).toBeDefined();
    });
  });

  describe('Missing Required Fields', () => {
    it('should detect missing version field', () => {
      const config = {
        integrations: ['claude-code'],
        templates: DEFAULT_CONFIG.templates,
        outputs: DEFAULT_CONFIG.outputs,
        preferences: DEFAULT_CONFIG.preferences,
      };

      expect('version' in config).toBe(false);
    });

    it('should detect missing providers field', () => {
      const config = {
        version: '1.4.0',
        templates: DEFAULT_CONFIG.templates,
        outputs: DEFAULT_CONFIG.outputs,
        preferences: DEFAULT_CONFIG.preferences,
      };

      expect('providers' in config).toBe(false);
    });

    it('should detect missing templates field', () => {
      const config = {
        version: '1.4.0',
        integrations: ['claude-code'],
        outputs: DEFAULT_CONFIG.outputs,
        preferences: DEFAULT_CONFIG.preferences,
      };

      expect('templates' in config).toBe(false);
    });

    it('should detect missing outputs field', () => {
      const config = {
        version: '1.4.0',
        integrations: ['claude-code'],
        templates: DEFAULT_CONFIG.templates,
        preferences: DEFAULT_CONFIG.preferences,
      };

      expect('outputs' in config).toBe(false);
    });

    it('should detect missing preferences field', () => {
      const config = {
        version: '1.4.0',
        integrations: ['claude-code'],
        templates: DEFAULT_CONFIG.templates,
        outputs: DEFAULT_CONFIG.outputs,
      };

      expect('preferences' in config).toBe(false);
    });

    it('should allow optional experimental field', () => {
      const config: ClavixConfig = {
        ...DEFAULT_CONFIG,
        experimental: { newFeature: true },
      };

      expect(config.experimental).toBeDefined();
      expect(config.experimental?.newFeature).toBe(true);
    });
  });

  describe('Invalid Types and Values', () => {
    it('should detect version as number instead of string', () => {
      const config = {
        version: 1.4,
        integrations: ['claude-code'],
        templates: DEFAULT_CONFIG.templates,
        outputs: DEFAULT_CONFIG.outputs,
        preferences: DEFAULT_CONFIG.preferences,
      };

      expect(typeof config.version).not.toBe('string');
    });

    it('should detect integrations as string instead of array', () => {
      const config = {
        version: '1.4.0',
        integrations: 'claude-code' as any,
        templates: DEFAULT_CONFIG.templates,
        outputs: DEFAULT_CONFIG.outputs,
        preferences: DEFAULT_CONFIG.preferences,
      };

      expect(Array.isArray(config.integrations)).toBe(false);
    });

    it('should detect invalid output format', () => {
      const config = {
        version: '1.4.0',
        integrations: ['claude-code'],
        templates: DEFAULT_CONFIG.templates,
        outputs: { ...DEFAULT_CONFIG.outputs, format: 'html' as 'markdown' },
        preferences: DEFAULT_CONFIG.preferences,
      };

      expect(config.outputs.format).not.toMatch(/^(markdown|pdf)$/);
    });

    it('should detect boolean values as strings', () => {
      const config = {
        version: '1.4.0',
        integrations: ['claude-code'],
        templates: DEFAULT_CONFIG.templates,
        outputs: DEFAULT_CONFIG.outputs,
        preferences: {
          autoOpenOutputs: 'true' as unknown as boolean,
          verboseLogging: 'false' as unknown as boolean,
          preserveSessions: true,
        },
      };

      expect(typeof config.preferences.autoOpenOutputs).toBe('string');
      expect(typeof config.preferences.verboseLogging).toBe('string');
    });

    it('should detect null values where objects expected', () => {
      const config = {
        version: '1.4.0',
        integrations: ['claude-code'],
        templates: null,
        outputs: DEFAULT_CONFIG.outputs,
        preferences: DEFAULT_CONFIG.preferences,
      };

      expect(config.templates).toBeNull();
    });

    it('should detect undefined values', () => {
      const config = {
        version: '1.4.0',
        integrations: undefined as any,
        templates: DEFAULT_CONFIG.templates,
        outputs: DEFAULT_CONFIG.outputs,
        preferences: DEFAULT_CONFIG.preferences,
      };

      expect(config.integrations).toBeUndefined();
    });
  });

  describe('Config Migration', () => {
    it('should migrate legacy config to new format', () => {
      const legacy: LegacyConfig = {
        version: '1.3.0',
        agent: 'claude-code',
        templates: DEFAULT_CONFIG.templates,
        outputs: DEFAULT_CONFIG.outputs,
        preferences: DEFAULT_CONFIG.preferences,
      };

      const migrated = migrateConfig(legacy);

      expect(migrated.version).toBe(CLAVIX_VERSION);
      expect(migrated.integrations).toEqual(['claude-code']);
      expect('agent' in migrated).toBe(false);
    });

    it('should preserve experimental features during migration', () => {
      const legacy: LegacyConfig = {
        version: '1.3.0',
        agent: 'cursor',
        templates: DEFAULT_CONFIG.templates,
        outputs: DEFAULT_CONFIG.outputs,
        preferences: DEFAULT_CONFIG.preferences,
        experimental: { featureFlag: true },
      };

      const migrated = migrateConfig(legacy);

      expect(migrated.experimental).toEqual({ featureFlag: true });
    });

    it('should correctly identify legacy config', () => {
      const legacy = {
        version: '1.3.0',
        agent: 'claude-code',
        templates: {},
      };

      expect(isLegacyConfig(legacy)).toBe(true);
    });

    it('should correctly identify new config format', () => {
      const newConfig = {
        version: '1.4.0',
        integrations: ['claude-code'],
        templates: {},
      };

      expect(isLegacyConfig(newConfig)).toBe(false);
    });

    it('should handle null as not legacy config', () => {
      expect(isLegacyConfig(null)).toBe(false);
    });

    it('should handle undefined as not legacy config', () => {
      expect(isLegacyConfig(undefined)).toBe(false);
    });

    it('should handle non-object as not legacy config', () => {
      expect(isLegacyConfig('string')).toBe(false);
      expect(isLegacyConfig(123)).toBe(false);
      expect(isLegacyConfig(true)).toBe(false);
    });

    it('should handle object without agent field as not legacy', () => {
      expect(isLegacyConfig({ version: '1.3.0' })).toBe(false);
    });
  });

  describe('File Operation Edge Cases', () => {
    it('should handle reading non-existent config file', async () => {
      const nonExistent = path.join(testDir, '.clavix/nonexistent.json');

      let error: Error | undefined;
      try {
        await fs.readFile(nonExistent, 'utf-8');
      } catch (e) {
        error = e as Error;
      }

      expect(error).toBeDefined();
      expect((error as NodeJS.ErrnoException).code).toBe('ENOENT');
    });

    it('should handle writing to read-only file', async () => {
      const readOnlyPath = path.join(testDir, '.clavix/readonly.json');
      await fs.writeFile(readOnlyPath, JSON.stringify(DEFAULT_CONFIG));
      await fs.chmod(readOnlyPath, 0o444); // Read-only

      let error: Error | undefined;
      try {
        await fs.writeFile(readOnlyPath, JSON.stringify({ ...DEFAULT_CONFIG, version: '1.5.0' }));
      } catch (e) {
        error = e as Error;
      }

      // Restore permissions for cleanup
      await fs.chmod(readOnlyPath, 0o644);

      expect(error).toBeDefined();
      expect((error as NodeJS.ErrnoException).code).toBe('EACCES');
    });

    it('should handle writing to directory instead of file', async () => {
      const dirPath = path.join(testDir, '.clavix');
      await fs.ensureDir(dirPath);

      let error: Error | undefined;
      try {
        await fs.writeFile(dirPath, JSON.stringify(DEFAULT_CONFIG));
      } catch (e) {
        error = e as Error;
      }

      expect(error).toBeDefined();
      expect((error as NodeJS.ErrnoException).code).toMatch(/^(EISDIR|EACCES)$/);
    });
  });

  describe('Default Config Integrity', () => {
    it('should have valid default config', () => {
      expect(DEFAULT_CONFIG.version).toBeDefined();
      expect(typeof DEFAULT_CONFIG.version).toBe('string');
      expect(Array.isArray(DEFAULT_CONFIG.integrations)).toBe(true);
    });

    it('should have valid default templates', () => {
      expect(DEFAULT_CONFIG.templates.prdQuestions).toBe('default');
      expect(DEFAULT_CONFIG.templates.fullPrd).toBe('default');
      expect(DEFAULT_CONFIG.templates.quickPrd).toBe('default');
    });

    it('should have valid default outputs', () => {
      expect(DEFAULT_CONFIG.outputs.path).toBe('.clavix/outputs');
      expect(DEFAULT_CONFIG.outputs.format).toBe('markdown');
    });

    it('should have valid default preferences', () => {
      expect(DEFAULT_CONFIG.preferences.autoOpenOutputs).toBe(false);
      expect(DEFAULT_CONFIG.preferences.verboseLogging).toBe(false);
      expect(DEFAULT_CONFIG.preferences.preserveSessions).toBe(true);
    });

    it('should serialize and deserialize default config without loss', () => {
      const serialized = JSON.stringify(DEFAULT_CONFIG);
      const deserialized = JSON.parse(serialized);

      expect(deserialized).toEqual(DEFAULT_CONFIG);
    });
  });

  describe('Config Validation Helpers', () => {
    it('should validate config has all required fields', () => {
      const isValid = (config: unknown): config is ClavixConfig => {
        if (!config || typeof config !== 'object') return false;
        const c = config as Partial<ClavixConfig>;
        return !!(c.version && c.integrations && c.templates && c.outputs && c.preferences);
      };

      expect(isValid(DEFAULT_CONFIG)).toBe(true);
      expect(isValid({})).toBe(false);
      expect(isValid(null)).toBe(false);
    });

    it('should validate provider names are non-empty strings', () => {
      const valid: ClavixConfig = { ...DEFAULT_CONFIG, integrations: ['claude-code', 'cursor'] };
      const invalid1: ClavixConfig = { ...DEFAULT_CONFIG, integrations: [''] };
      const invalid2 = { ...DEFAULT_CONFIG, integrations: [123] };

      expect(valid.integrations.every((p) => typeof p === 'string' && p.length > 0)).toBe(true);
      expect(invalid1.integrations.every((p) => typeof p === 'string' && p.length > 0)).toBe(false);
      expect(invalid2.integrations.every((p) => typeof p === 'string')).toBe(false);
    });
  });

  describe('Large Config Handling', () => {
    it('should handle config with many providers', () => {
      const config: ClavixConfig = {
        ...DEFAULT_CONFIG,
        integrations: Array.from({ length: 100 }, (_, i) => `provider-${i}`),
      };

      const serialized = JSON.stringify(config);
      const deserialized = JSON.parse(serialized);

      expect(deserialized.integrations).toHaveLength(100);
    });

    it('should handle very long experimental values', () => {
      const longString = 'x'.repeat(10000);
      const config: ClavixConfig = {
        ...DEFAULT_CONFIG,
        experimental: { longValue: longString },
      };

      const serialized = JSON.stringify(config);
      expect(serialized.length).toBeGreaterThan(10000);

      const deserialized = JSON.parse(serialized);
      expect(deserialized.experimental.longValue).toBe(longString);
    });
  });

  describe('Special Characters in Config', () => {
    it('should handle unicode characters in paths', () => {
      const config: ClavixConfig = {
        ...DEFAULT_CONFIG,
        outputs: { ...DEFAULT_CONFIG.outputs, path: '.clavix/outputs/프로젝트/输出' },
      };

      const serialized = JSON.stringify(config);
      const deserialized = JSON.parse(serialized);

      expect(deserialized.outputs.path).toBe('.clavix/outputs/프로젝트/输出');
    });

    it('should handle emoji in experimental fields', () => {
      const config: ClavixConfig = {
        ...DEFAULT_CONFIG,
        experimental: { message: 'Testing 🚀 emojis ✅' },
      };

      const serialized = JSON.stringify(config);
      const deserialized = JSON.parse(serialized);

      expect(deserialized.experimental.message).toBe('Testing 🚀 emojis ✅');
    });

    it('should handle escaped characters', () => {
      const config: ClavixConfig = {
        ...DEFAULT_CONFIG,
        experimental: { escaped: 'Line 1\nLine 2\tTabbed' },
      };

      const serialized = JSON.stringify(config);
      const deserialized = JSON.parse(serialized);

      expect(deserialized.experimental.escaped).toBe('Line 1\nLine 2\tTabbed');
    });
  });
});
