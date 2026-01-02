/**
 * Tests for path resolution utility
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { resolveIntegrationPath, ENV_VAR_MAP } from '../../src/utils/path-resolver.js';
import type { AdapterConfig } from '../../src/types/adapter-config.js';
import type { ClavixConfig } from '../../src/types/config.js';

describe('path-resolver', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment before each test
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // Restore environment after each test
    process.env = originalEnv;
  });

  describe('ENV_VAR_MAP', () => {
    it('should have CODEX_HOME mapping', () => {
      expect(ENV_VAR_MAP.codex).toBe('CODEX_HOME');
    });

    it('should be extensible for future integrations', () => {
      expect(Object.keys(ENV_VAR_MAP)).toContain('codex');
    });
  });

  describe('resolveIntegrationPath', () => {
    const mockAdapterConfig: AdapterConfig = {
      name: 'codex',
      displayName: 'Codex CLI',
      directory: '~/.codex/prompts',
      fileExtension: '.md',
      filenamePattern: 'clavix-{name}',
      features: {
        supportsSubdirectories: false,
        supportsDocInjection: false,
        commandSeparator: '-',
      },
      detection: {
        type: 'directory',
        path: '.codex',
      },
      global: true,
    };

    describe('Environment variable priority', () => {
      it('should use $CODEX_HOME when set and append /prompts subdirectory', () => {
        process.env.CODEX_HOME = '/custom/codex/path';

        const result = resolveIntegrationPath(mockAdapterConfig);
        expect(result).toBe('/custom/codex/path/prompts');
      });

      it('should not duplicate /prompts if $CODEX_HOME already includes it', () => {
        process.env.CODEX_HOME = '/custom/codex/prompts';

        const result = resolveIntegrationPath(mockAdapterConfig);
        expect(result).toBe('/custom/codex/prompts');
      });

      it('should prioritize env var over user config', () => {
        process.env.CODEX_HOME = '/env/path';

        const userConfig: ClavixConfig = {
          version: '5.9.0',
          integrations: ['codex'],
          templates: { prdQuestions: 'default', fullPrd: 'default', quickPrd: 'default' },
          outputs: { path: '.clavix/outputs', format: 'markdown' },
          preferences: { autoOpenOutputs: false, verboseLogging: false },
          experimental: {
            integrationPaths: {
              codex: '/config/path',
            },
          },
        };

        const result = resolveIntegrationPath(mockAdapterConfig, userConfig);
        expect(result).toBe('/env/path/prompts');
      });
    });

    describe('User config override', () => {
      it('should use user config path when env var is not set and append /prompts', () => {
        delete process.env.CODEX_HOME;

        const userConfig: ClavixConfig = {
          version: '5.9.0',
          integrations: ['codex'],
          templates: { prdQuestions: 'default', fullPrd: 'default', quickPrd: 'default' },
          outputs: { path: '.clavix/outputs', format: 'markdown' },
          preferences: { autoOpenOutputs: false, verboseLogging: false },
          experimental: {
            integrationPaths: {
              codex: '/custom/codex/from/config',
            },
          },
        };

        const result = resolveIntegrationPath(mockAdapterConfig, userConfig);
        expect(result).toBe('/custom/codex/from/config/prompts');
      });

      it('should not duplicate /prompts if user config already includes it', () => {
        delete process.env.CODEX_HOME;

        const userConfig: ClavixConfig = {
          version: '5.9.0',
          integrations: ['codex'],
          templates: { prdQuestions: 'default', fullPrd: 'default', quickPrd: 'default' },
          outputs: { path: '.clavix/outputs', format: 'markdown' },
          preferences: { autoOpenOutputs: false, verboseLogging: false },
          experimental: {
            integrationPaths: {
              codex: '/custom/codex/from/config/prompts',
            },
          },
        };

        const result = resolveIntegrationPath(mockAdapterConfig, userConfig);
        expect(result).toBe('/custom/codex/from/config/prompts');
      });
    });

    describe('Default fallback', () => {
      it('should use default path from config when no overrides exist', () => {
        delete process.env.CODEX_HOME;

        const result = resolveIntegrationPath(mockAdapterConfig);
        // Should expand ~ to home directory
        expect(result).toContain('/.codex/prompts');
        expect(result).not.toContain('~');
      });

      it('should use default path when user config exists but has no custom path', () => {
        delete process.env.CODEX_HOME;

        const userConfig: ClavixConfig = {
          version: '5.9.0',
          integrations: ['codex'],
          templates: { prdQuestions: 'default', fullPrd: 'default', quickPrd: 'default' },
          outputs: { path: '.clavix/outputs', format: 'markdown' },
          preferences: { autoOpenOutputs: false, verboseLogging: false },
          experimental: {},
        };

        const result = resolveIntegrationPath(mockAdapterConfig, userConfig);
        expect(result).toContain('/.codex/prompts');
        expect(result).not.toContain('~');
      });
    });

    describe('Tilde expansion', () => {
      it('should expand tilde for non-env var paths', () => {
        delete process.env.CODEX_HOME;

        const result = resolveIntegrationPath(mockAdapterConfig);
        expect(result).not.toMatch(/^~/); // Should not start with ~
        expect(result).toMatch(/\/.codex\/prompts$/);
      });

      it('should expand tilde in user config paths', () => {
        delete process.env.CODEX_HOME;

        const userConfig: ClavixConfig = {
          version: '5.9.0',
          integrations: ['codex'],
          templates: { prdQuestions: 'default', fullPrd: 'default', quickPrd: 'default' },
          outputs: { path: '.clavix/outputs', format: 'markdown' },
          preferences: { autoOpenOutputs: false, verboseLogging: false },
          experimental: {
            integrationPaths: {
              codex: '~/custom/prompts',
            },
          },
        };

        const result = resolveIntegrationPath(mockAdapterConfig, userConfig);
        expect(result).not.toMatch(/^~/); // Should not start with ~
        expect(result).toMatch(/\/custom\/prompts$/);
      });
    });

    describe('Non-Codex integrations', () => {
      it('should use default path for integrations without env var mapping', () => {
        const otherAdapterConfig: AdapterConfig = {
          name: 'cursor',
          displayName: 'Cursor',
          directory: '.cursor/rules',
          fileExtension: '.md',
          filenamePattern: 'clavix-{name}',
          features: {
            supportsSubdirectories: false,
            supportsDocInjection: false,
            commandSeparator: '-',
          },
          detection: {
            type: 'directory',
            path: '.cursor',
          },
        };

        const result = resolveIntegrationPath(otherAdapterConfig);
        expect(result).toBe('.cursor/rules');
      });

      it('should use user config for non-env integrations', () => {
        const otherAdapterConfig: AdapterConfig = {
          name: 'cursor',
          displayName: 'Cursor',
          directory: '.cursor/rules',
          fileExtension: '.md',
          filenamePattern: 'clavix-{name}',
          features: {
            supportsSubdirectories: false,
            supportsDocInjection: false,
            commandSeparator: '-',
          },
          detection: {
            type: 'directory',
            path: '.cursor',
          },
        };

        const userConfig: ClavixConfig = {
          version: '5.9.0',
          integrations: ['cursor'],
          templates: { prdQuestions: 'default', fullPrd: 'default', quickPrd: 'default' },
          outputs: { path: '.clavix/outputs', format: 'markdown' },
          preferences: { autoOpenOutputs: false, verboseLogging: false },
          experimental: {
            integrationPaths: {
              cursor: '.custom/cursor',
            },
          },
        };

        const result = resolveIntegrationPath(otherAdapterConfig, userConfig);
        expect(result).toBe('.custom/cursor');
      });
    });

    describe('Edge cases', () => {
      it('should handle user config with undefined experimental', () => {
        delete process.env.CODEX_HOME;

        const userConfig: ClavixConfig = {
          version: '5.9.0',
          integrations: ['codex'],
          templates: { prdQuestions: 'default', fullPrd: 'default', quickPrd: 'default' },
          outputs: { path: '.clavix/outputs', format: 'markdown' },
          preferences: { autoOpenOutputs: false, verboseLogging: false },
        };

        const result = resolveIntegrationPath(mockAdapterConfig, userConfig);
        expect(result).toContain('/.codex/prompts');
      });

      it('should handle empty integrationPaths in experimental', () => {
        delete process.env.CODEX_HOME;

        const userConfig: ClavixConfig = {
          version: '5.9.0',
          integrations: ['codex'],
          templates: { prdQuestions: 'default', fullPrd: 'default', quickPrd: 'default' },
          outputs: { path: '.clavix/outputs', format: 'markdown' },
          preferences: { autoOpenOutputs: false, verboseLogging: false },
          experimental: {
            integrationPaths: {},
          },
        };

        const result = resolveIntegrationPath(mockAdapterConfig, userConfig);
        expect(result).toContain('/.codex/prompts');
      });
    });
  });
});
