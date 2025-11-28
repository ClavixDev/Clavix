/**
 * Tests for Zod schema validation
 */

import { describe, it, expect } from '@jest/globals';
import {
  validateIntegrationsConfig,
  validateUserConfig,
  formatZodErrors,
  IntegrationEntrySchema,
  IntegrationsConfigSchema,
  UserConfigSchema,
} from '../../src/utils/schemas.js';

describe('IntegrationEntrySchema', () => {
  it('should validate a complete integration entry', () => {
    const entry = {
      name: 'cursor',
      displayName: 'Cursor',
      directory: '.cursor/rules',
      filenamePattern: 'clavix-{name}',
      extension: '.md',
      separator: '-',
      detection: '.cursor',
      type: 'standard',
    };

    const result = IntegrationEntrySchema.safeParse(entry);
    expect(result.success).toBe(true);
  });

  it('should validate with optional fields', () => {
    const entry = {
      name: 'gemini',
      displayName: 'Gemini CLI',
      directory: '.gemini/commands/clavix',
      filenamePattern: '{name}',
      extension: '.toml',
      separator: ':',
      detection: '.gemini',
      specialAdapter: 'toml',
      rootDir: '.gemini',
      global: false,
      placeholder: '{{args}}',
    };

    const result = IntegrationEntrySchema.safeParse(entry);
    expect(result.success).toBe(true);
  });

  it('should fail on missing required fields', () => {
    const entry = {
      name: 'cursor',
      // missing displayName, directory, etc.
    };

    const result = IntegrationEntrySchema.safeParse(entry);
    expect(result.success).toBe(false);
  });

  it('should fail on invalid extension', () => {
    const entry = {
      name: 'test',
      displayName: 'Test',
      directory: '.test',
      filenamePattern: '{name}',
      extension: '.txt', // invalid
      separator: '-',
      detection: '.test',
    };

    const result = IntegrationEntrySchema.safeParse(entry);
    expect(result.success).toBe(false);
  });

  it('should fail on invalid separator', () => {
    const entry = {
      name: 'test',
      displayName: 'Test',
      directory: '.test',
      filenamePattern: '{name}',
      extension: '.md',
      separator: '_', // invalid
      detection: '.test',
    };

    const result = IntegrationEntrySchema.safeParse(entry);
    expect(result.success).toBe(false);
  });

  it('should default type to standard', () => {
    const entry = {
      name: 'test',
      displayName: 'Test',
      directory: '.test',
      filenamePattern: '{name}',
      extension: '.md',
      separator: '-',
      detection: '.test',
    };

    const result = IntegrationEntrySchema.safeParse(entry);
    expect(result.success).toBe(true);
    expect(result.data?.type).toBe('standard');
  });

  it('should validate universal type', () => {
    const entry = {
      name: 'agents-md',
      displayName: 'AGENTS.md',
      directory: '.',
      filenamePattern: 'AGENTS',
      extension: '.md',
      separator: '-',
      detection: 'AGENTS.md',
      type: 'universal',
    };

    const result = IntegrationEntrySchema.safeParse(entry);
    expect(result.success).toBe(true);
    expect(result.data?.type).toBe('universal');
  });
});

describe('IntegrationsConfigSchema', () => {
  it('should validate a complete config', () => {
    const config = {
      $schema: './integrations.schema.json',
      version: '1.0.0',
      integrations: [
        {
          name: 'cursor',
          displayName: 'Cursor',
          directory: '.cursor/rules',
          filenamePattern: 'clavix-{name}',
          extension: '.md',
          separator: '-',
          detection: '.cursor',
        },
      ],
    };

    const result = IntegrationsConfigSchema.safeParse(config);
    expect(result.success).toBe(true);
  });

  it('should fail on invalid version format', () => {
    const config = {
      version: 'v1.0', // invalid - should be semver
      integrations: [
        {
          name: 'cursor',
          displayName: 'Cursor',
          directory: '.cursor/rules',
          filenamePattern: 'clavix-{name}',
          extension: '.md',
          separator: '-',
          detection: '.cursor',
        },
      ],
    };

    const result = IntegrationsConfigSchema.safeParse(config);
    expect(result.success).toBe(false);
  });

  it('should fail on empty integrations array', () => {
    const config = {
      version: '1.0.0',
      integrations: [],
    };

    const result = IntegrationsConfigSchema.safeParse(config);
    expect(result.success).toBe(false);
  });

  it('should fail on duplicate integration names', () => {
    const config = {
      version: '1.0.0',
      integrations: [
        {
          name: 'cursor',
          displayName: 'Cursor',
          directory: '.cursor/rules',
          filenamePattern: 'clavix-{name}',
          extension: '.md',
          separator: '-',
          detection: '.cursor',
        },
        {
          name: 'cursor', // duplicate
          displayName: 'Cursor 2',
          directory: '.cursor2/rules',
          filenamePattern: 'clavix-{name}',
          extension: '.md',
          separator: '-',
          detection: '.cursor2',
        },
      ],
    };

    const result = IntegrationsConfigSchema.safeParse(config);
    expect(result.success).toBe(false);
  });
});

describe('UserConfigSchema', () => {
  it('should validate config with integrations array', () => {
    const config = {
      integrations: ['cursor', 'claude-code'],
    };

    const result = UserConfigSchema.safeParse(config);
    expect(result.success).toBe(true);
  });

  it('should validate config with providers array (legacy)', () => {
    const config = {
      providers: ['cursor', 'claude-code'],
    };

    const result = UserConfigSchema.safeParse(config);
    expect(result.success).toBe(true);
  });

  it('should validate empty config', () => {
    const config = {};

    const result = UserConfigSchema.safeParse(config);
    expect(result.success).toBe(true);
  });

  it('should fail on empty string in integrations', () => {
    const config = {
      integrations: ['cursor', ''], // empty string invalid
    };

    const result = UserConfigSchema.safeParse(config);
    expect(result.success).toBe(false);
  });
});

describe('validateIntegrationsConfig', () => {
  it('should return success for valid config', () => {
    const config = {
      version: '1.0.0',
      integrations: [
        {
          name: 'cursor',
          displayName: 'Cursor',
          directory: '.cursor/rules',
          filenamePattern: 'clavix-{name}',
          extension: '.md',
          separator: '-',
          detection: '.cursor',
        },
      ],
    };

    const result = validateIntegrationsConfig(config);
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
  });

  it('should return errors for invalid config', () => {
    const config = {
      version: 'invalid',
      integrations: [],
    };

    const result = validateIntegrationsConfig(config);
    expect(result.success).toBe(false);
    expect(result.errors).toBeDefined();
  });

  it('should return warnings for unknown fields', () => {
    const config = {
      version: '1.0.0',
      integrations: [
        {
          name: 'cursor',
          displayName: 'Cursor',
          directory: '.cursor/rules',
          filenamePattern: 'clavix-{name}',
          extension: '.md',
          separator: '-',
          detection: '.cursor',
        },
      ],
      unknownField: 'value', // unknown field
    };

    const result = validateIntegrationsConfig(config);
    expect(result.success).toBe(true);
    expect(result.warnings).toBeDefined();
    expect(result.warnings).toContain('Unknown fields in integrations.json: unknownField');
  });
});

describe('validateUserConfig', () => {
  it('should return success for valid config', () => {
    const config = {
      integrations: ['cursor', 'claude-code'],
    };

    const result = validateUserConfig(config);
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
  });

  it('should warn about legacy providers field', () => {
    const config = {
      providers: ['cursor'],
    };

    const result = validateUserConfig(config);
    expect(result.success).toBe(true);
    expect(result.warnings).toBeDefined();
    expect(result.warnings?.some((w) => w.includes('deprecated'))).toBe(true);
  });

  it('should warn about unknown fields', () => {
    const config = {
      integrations: ['cursor'],
      customField: 'value',
    };

    const result = validateUserConfig(config);
    expect(result.success).toBe(true);
    expect(result.warnings).toBeDefined();
    expect(result.warnings?.some((w) => w.includes('Unknown fields'))).toBe(true);
  });
});

describe('formatZodErrors', () => {
  it('should format errors with path', () => {
    const result = IntegrationsConfigSchema.safeParse({
      version: 'bad',
      integrations: [],
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const formatted = formatZodErrors(result.error);
      expect(formatted.length).toBeGreaterThan(0);
      expect(formatted.some((e) => e.includes('version'))).toBe(true);
    }
  });

  it('should format errors without path', () => {
    const result = IntegrationEntrySchema.safeParse('not an object');

    expect(result.success).toBe(false);
    if (!result.success) {
      const formatted = formatZodErrors(result.error);
      expect(formatted.length).toBeGreaterThan(0);
    }
  });
});
