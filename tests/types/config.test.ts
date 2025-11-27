import { describe, it, expect } from '@jest/globals';
import {
  migrateConfig,
  isLegacyConfig,
  DEFAULT_CONFIG,
  ClavixConfig,
  LegacyConfig,
} from '../../src/types/config';
import { CLAVIX_VERSION } from '../../src/utils/version';

describe('Config Types', () => {
  describe('DEFAULT_CONFIG', () => {
    it('should have current version', () => {
      expect(DEFAULT_CONFIG.version).toBe(CLAVIX_VERSION);
    });

    it('should have empty integrations array', () => {
      expect(DEFAULT_CONFIG.integrations).toEqual([]);
    });

    it('should have default template settings', () => {
      expect(DEFAULT_CONFIG.templates.prdQuestions).toBe('default');
      expect(DEFAULT_CONFIG.templates.fullPrd).toBe('default');
      expect(DEFAULT_CONFIG.templates.quickPrd).toBe('default');
    });

    it('should have default output settings', () => {
      expect(DEFAULT_CONFIG.outputs.path).toBe('.clavix/outputs');
      expect(DEFAULT_CONFIG.outputs.format).toBe('markdown');
    });

    it('should have default preferences', () => {
      expect(DEFAULT_CONFIG.preferences.autoOpenOutputs).toBe(false);
      expect(DEFAULT_CONFIG.preferences.verboseLogging).toBe(false);
      expect(DEFAULT_CONFIG.preferences.preserveSessions).toBe(true);
    });
  });

  describe('isLegacyConfig', () => {
    it('should return true for config with agent field', () => {
      const legacy = {
        version: '1.0.0',
        agent: 'claude',
        templates: DEFAULT_CONFIG.templates,
        outputs: DEFAULT_CONFIG.outputs,
        preferences: DEFAULT_CONFIG.preferences,
      };

      expect(isLegacyConfig(legacy)).toBe(true);
    });

    it('should return true for config with providers field', () => {
      const legacy = {
        version: '2.0.0',
        providers: ['claude', 'cursor'],
        templates: DEFAULT_CONFIG.templates,
        outputs: DEFAULT_CONFIG.outputs,
        preferences: DEFAULT_CONFIG.preferences,
      };

      expect(isLegacyConfig(legacy)).toBe(true);
    });

    it('should return false for current config with integrations', () => {
      const current: ClavixConfig = {
        version: '5.0.0',
        integrations: ['claude', 'cursor'],
        templates: DEFAULT_CONFIG.templates,
        outputs: DEFAULT_CONFIG.outputs,
        preferences: DEFAULT_CONFIG.preferences,
      };

      expect(isLegacyConfig(current)).toBe(false);
    });

    it('should return false for null', () => {
      expect(isLegacyConfig(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isLegacyConfig(undefined)).toBe(false);
    });

    it('should return false for non-object', () => {
      expect(isLegacyConfig('string')).toBe(false);
      expect(isLegacyConfig(123)).toBe(false);
    });

    it('should return false for config without agent or providers', () => {
      const config = {
        version: '1.0.0',
        templates: DEFAULT_CONFIG.templates,
        outputs: DEFAULT_CONFIG.outputs,
        preferences: DEFAULT_CONFIG.preferences,
      };

      expect(isLegacyConfig(config)).toBe(false);
    });
  });

  describe('migrateConfig', () => {
    it('should migrate from agent field to integrations', () => {
      const legacy: LegacyConfig = {
        version: '1.3.0',
        agent: 'claude',
        templates: DEFAULT_CONFIG.templates,
        outputs: DEFAULT_CONFIG.outputs,
        preferences: DEFAULT_CONFIG.preferences,
      };

      const migrated = migrateConfig(legacy);

      expect(migrated.version).toBe(CLAVIX_VERSION);
      expect(migrated.integrations).toEqual(['claude']);
      expect(migrated).not.toHaveProperty('agent');
    });

    it('should migrate from providers field to integrations', () => {
      const legacy: LegacyConfig = {
        version: '2.0.0',
        providers: ['claude', 'cursor'],
        templates: DEFAULT_CONFIG.templates,
        outputs: DEFAULT_CONFIG.outputs,
        preferences: DEFAULT_CONFIG.preferences,
      };

      const migrated = migrateConfig(legacy);

      expect(migrated.version).toBe(CLAVIX_VERSION);
      expect(migrated.integrations).toEqual(['claude', 'cursor']);
      expect(migrated).not.toHaveProperty('providers');
    });

    it('should use empty integrations when neither agent nor providers exist', () => {
      const legacy: LegacyConfig = {
        version: '1.0.0',
        templates: DEFAULT_CONFIG.templates,
        outputs: DEFAULT_CONFIG.outputs,
        preferences: DEFAULT_CONFIG.preferences,
      };

      const migrated = migrateConfig(legacy);

      expect(migrated.integrations).toEqual([]);
    });

    it('should preserve templates, outputs, and preferences', () => {
      const customPrefs = {
        autoOpenOutputs: true,
        verboseLogging: true,
        preserveSessions: false,
      };

      const legacy: LegacyConfig = {
        version: '1.0.0',
        agent: 'claude',
        templates: DEFAULT_CONFIG.templates,
        outputs: DEFAULT_CONFIG.outputs,
        preferences: customPrefs,
      };

      const migrated = migrateConfig(legacy);

      expect(migrated.templates).toEqual(DEFAULT_CONFIG.templates);
      expect(migrated.outputs).toEqual(DEFAULT_CONFIG.outputs);
      expect(migrated.preferences).toEqual(customPrefs);
    });

    it('should preserve experimental settings', () => {
      const legacy: LegacyConfig = {
        version: '1.0.0',
        agent: 'claude',
        templates: DEFAULT_CONFIG.templates,
        outputs: DEFAULT_CONFIG.outputs,
        preferences: DEFAULT_CONFIG.preferences,
        experimental: { newFeature: true },
      };

      const migrated = migrateConfig(legacy);

      expect(migrated.experimental).toEqual({ newFeature: true });
    });
  });
});
