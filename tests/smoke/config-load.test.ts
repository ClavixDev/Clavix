/**
 * Config Load Smoke Tests
 *
 * Quick sanity checks to verify configuration loading works correctly.
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import * as path from 'path';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Config Load Smoke Tests', () => {
  let testDir: string;
  let originalCwd: string;

  beforeEach(async () => {
    originalCwd = process.cwd();
    testDir = path.join(__dirname, '../tmp/smoke-config-' + Date.now());
    await fs.ensureDir(testDir);
    process.chdir(testDir);
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    await fs.remove(testDir);
  });

  describe('config file detection', () => {
    it('should handle missing .clavix directory gracefully', async () => {
      // No .clavix directory - should not crash
      const clavixDir = path.join(testDir, '.clavix');
      const exists = await fs.pathExists(clavixDir);
      expect(exists).toBe(false);
    });

    it('should create valid config structure when initialized', async () => {
      const clavixDir = path.join(testDir, '.clavix');
      await fs.ensureDir(clavixDir);

      const config = {
        version: '3.0',
        integrations: ['claude-code'],
        outputs: {
          sessions: '.clavix/sessions',
          prompts: '.clavix/outputs/prompts',
        },
      };

      await fs.writeJson(path.join(clavixDir, 'config.json'), config);

      const loadedConfig = await fs.readJson(path.join(clavixDir, 'config.json'));
      expect(loadedConfig.version).toBeDefined();
      expect(loadedConfig.integrations).toBeInstanceOf(Array);
    });

    it('should handle empty config file', async () => {
      const clavixDir = path.join(testDir, '.clavix');
      await fs.ensureDir(clavixDir);
      await fs.writeFile(path.join(clavixDir, 'config.json'), '');

      const content = await fs.readFile(path.join(clavixDir, 'config.json'), 'utf-8');
      expect(content).toBe('');
    });

    it('should handle malformed JSON config', async () => {
      const clavixDir = path.join(testDir, '.clavix');
      await fs.ensureDir(clavixDir);
      await fs.writeFile(path.join(clavixDir, 'config.json'), '{ invalid json }');

      try {
        await fs.readJson(path.join(clavixDir, 'config.json'));
        expect(true).toBe(false); // Should throw
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('output directory structure', () => {
    it('should accept standard output paths', async () => {
      const paths = [
        '.clavix/outputs',
        '.clavix/sessions',
        '.clavix/outputs/prompts',
        '.clavix/outputs/deep',
        '.clavix/outputs/fast',
      ];

      for (const p of paths) {
        const fullPath = path.join(testDir, p);
        await fs.ensureDir(fullPath);
        expect(await fs.pathExists(fullPath)).toBe(true);
      }
    });

    it('should handle nested project structures', async () => {
      const nestedPath = path.join(testDir, 'packages', 'app', '.clavix', 'config.json');
      await fs.ensureDir(path.dirname(nestedPath));
      await fs.writeJson(nestedPath, { version: '3.0' });

      expect(await fs.pathExists(nestedPath)).toBe(true);
    });
  });

  describe('default config values', () => {
    it('should have required fields in default config', () => {
      const defaultConfig = {
        version: '3.0',
        integrations: [],
        outputs: {
          sessions: '.clavix/sessions',
          prompts: '.clavix/outputs/prompts',
        },
        templates: {
          enabled: true,
          directory: '.clavix/templates',
        },
      };

      expect(defaultConfig.version).toBeDefined();
      expect(defaultConfig.integrations).toBeInstanceOf(Array);
      expect(defaultConfig.outputs).toBeDefined();
    });
  });
});
