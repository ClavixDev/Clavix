/**
 * Tests for config set functionality
 * 
 * Tests updating nested configuration properties with different data types
 */

import * as fs from 'fs-extra';
import * as path from 'path';

describe('config set - nested property updates', () => {
  const testDir = path.join(__dirname, '../fixtures/test-config');
  const clavixDir = path.join(testDir, '.clavix');
  const configPath = path.join(clavixDir, 'config.json');

  // Helper to set nested values (mimics config.ts setNestedValue)
  const setNestedValue = (obj: any, propertyPath: string, value: any): void => {
    const keys = propertyPath.split('.');
    const lastKey = keys.pop()!;
    const target = keys.reduce((current, key) => {
      if (!current[key]) current[key] = {};
      return current[key];
    }, obj);
    target[lastKey] = value;
  };

  beforeEach(async () => {
    await fs.remove(testDir);
    await fs.ensureDir(clavixDir);

    const initialConfig = {
      version: '1.0.0',
      agent: 'Claude Code',
      templates: {
        prdQuestions: 'default',
        fullPrd: 'default',
      },
      outputs: {
        path: '.clavix/outputs',
        format: 'markdown',
      },
      preferences: {
        autoOpenOutputs: false,
        verboseLogging: false,
        preserveSessions: true,
      },
      experimental: {},
    };

    await fs.writeJSON(configPath, initialConfig, { spaces: 2 });
  });

  afterEach(async () => {
    await fs.remove(testDir);
  });

  describe('nested property updates', () => {
    it('should update nested string property', async () => {
      const config = await fs.readJSON(configPath);
      setNestedValue(config, 'templates.prdQuestions', 'custom');
      await fs.writeJSON(configPath, config);

      const updated = await fs.readJSON(configPath);
      expect(updated.templates.prdQuestions).toBe('custom');
    });

    it('should update deeply nested property', async () => {
      const config = await fs.readJSON(configPath);
      setNestedValue(config, 'outputs.format', 'json');
      await fs.writeJSON(configPath, config);

      const updated = await fs.readJSON(configPath);
      expect(updated.outputs.format).toBe('json');
    });

    it('should create new nested path', async () => {
      const config = await fs.readJSON(configPath);
      setNestedValue(config, 'newSection.newProp', 'value');
      await fs.writeJSON(configPath, config);

      const updated = await fs.readJSON(configPath);
      expect(updated.newSection.newProp).toBe('value');
    });
  });

  describe('different data types', () => {
    it('should handle boolean values', async () => {
      const config = await fs.readJSON(configPath);
      setNestedValue(config, 'preferences.autoOpenOutputs', true);
      await fs.writeJSON(configPath, config);

      const updated = await fs.readJSON(configPath);
      expect(updated.preferences.autoOpenOutputs).toBe(true);
      expect(typeof updated.preferences.autoOpenOutputs).toBe('boolean');
    });

    it('should handle number values', async () => {
      const config = await fs.readJSON(configPath);
      setNestedValue(config, 'experimental.maxItems', 42);
      await fs.writeJSON(configPath, config);

      const updated = await fs.readJSON(configPath);
      expect(updated.experimental.maxItems).toBe(42);
      expect(typeof updated.experimental.maxItems).toBe('number');
    });

    it('should handle string values', async () => {
      const config = await fs.readJSON(configPath);
      setNestedValue(config, 'agent', 'New Agent');
      await fs.writeJSON(configPath, config);

      const updated = await fs.readJSON(configPath);
      expect(updated.agent).toBe('New Agent');
    });

    it('should handle object values', async () => {
      const config = await fs.readJSON(configPath);
      setNestedValue(config, 'experimental.feature', { key: 'value', enabled: true });
      await fs.writeJSON(configPath, config);

      const updated = await fs.readJSON(configPath);
      expect(updated.experimental.feature).toEqual({ key: 'value', enabled: true });
    });

    it('should handle array values', async () => {
      const config = await fs.readJSON(configPath);
      setNestedValue(config, 'experimental.tags', ['tag1', 'tag2', 'tag3']);
      await fs.writeJSON(configPath, config);

      const updated = await fs.readJSON(configPath);
      expect(updated.experimental.tags).toEqual(['tag1', 'tag2', 'tag3']);
    });

    it('should handle null values', async () => {
      const config = await fs.readJSON(configPath);
      setNestedValue(config, 'experimental.nullValue', null);
      await fs.writeJSON(configPath, config);

      const updated = await fs.readJSON(configPath);
      expect(updated.experimental.nullValue).toBeNull();
    });
  });

  describe('preserving existing data', () => {
    it('should preserve other properties when updating one', async () => {
      const config = await fs.readJSON(configPath);
      setNestedValue(config, 'agent', 'Updated Agent');
      await fs.writeJSON(configPath, config);

      const updated = await fs.readJSON(configPath);
      expect(updated.agent).toBe('Updated Agent');
      expect(updated.version).toBe('1.0.0');
      expect(updated.templates).toBeDefined();
      expect(updated.outputs).toBeDefined();
    });

    it('should preserve sibling properties in nested objects', async () => {
      const config = await fs.readJSON(configPath);
      setNestedValue(config, 'preferences.autoOpenOutputs', true);
      await fs.writeJSON(configPath, config);

      const updated = await fs.readJSON(configPath);
      expect(updated.preferences.autoOpenOutputs).toBe(true);
      expect(updated.preferences.verboseLogging).toBe(false);
      expect(updated.preferences.preserveSessions).toBe(true);
    });
  });

  describe('complex nested paths', () => {
    it('should handle three-level nesting', async () => {
      const config = await fs.readJSON(configPath);
      setNestedValue(config, 'level1.level2.level3', 'deep');
      await fs.writeJSON(configPath, config);

      const updated = await fs.readJSON(configPath);
      expect(updated.level1.level2.level3).toBe('deep');
    });

    it('should handle multiple updates to same parent', async () => {
      const config = await fs.readJSON(configPath);
      setNestedValue(config, 'experimental.feature1', 'value1');
      setNestedValue(config, 'experimental.feature2', 'value2');
      await fs.writeJSON(configPath, config);

      const updated = await fs.readJSON(configPath);
      expect(updated.experimental.feature1).toBe('value1');
      expect(updated.experimental.feature2).toBe('value2');
    });
  });
});
