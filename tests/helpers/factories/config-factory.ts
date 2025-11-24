/**
 * Config Factory
 *
 * Creates test configuration objects with sensible defaults.
 */

import { ClavixConfig, DEFAULT_CONFIG } from '../../../src/types/config.js';

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Create a test ClavixConfig with optional overrides.
 *
 * @param overrides - Partial config to merge with defaults
 * @returns Complete ClavixConfig object
 *
 * @example
 * const config = createConfig({ integrations: ['cursor'] });
 */
export function createConfig(overrides: DeepPartial<ClavixConfig> = {}): ClavixConfig {
  return deepMerge(structuredClone(DEFAULT_CONFIG), overrides) as ClavixConfig;
}

/**
 * Create a minimal valid config.
 */
export function createMinimalConfig(): ClavixConfig {
  return {
    version: '3.0',
    integrations: [],
    outputs: {
      sessions: '.clavix/sessions',
      prompts: '.clavix/outputs/prompts',
    },
    templates: {
      enabled: false,
      directory: '.clavix/templates',
    },
  };
}

/**
 * Create a config with multiple integrations enabled.
 */
export function createMultiIntegrationConfig(): ClavixConfig {
  return createConfig({
    integrations: ['claude-code', 'cursor', 'windsurf', 'cline'],
  });
}

/**
 * Create a legacy v2 config format for migration testing.
 */
export function createLegacyV2Config() {
  return {
    version: '2.0',
    agents: ['claude-code'],
    paths: {
      sessions: '.clavix/sessions',
      output: '.clavix/output',
    },
  };
}

/**
 * Create a config with custom output paths.
 */
export function createConfigWithCustomPaths(
  sessions: string = 'custom/sessions',
  prompts: string = 'custom/prompts'
): ClavixConfig {
  return createConfig({
    outputs: {
      sessions,
      prompts,
    },
  });
}

/**
 * Create a config with templates enabled.
 */
export function createConfigWithTemplates(directory: string = '.clavix/templates'): ClavixConfig {
  return createConfig({
    templates: {
      enabled: true,
      directory,
    },
  });
}

/**
 * Deep merge two objects.
 */
function deepMerge<T extends object>(target: T, source: DeepPartial<T>): T {
  const result = { ...target };

  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const sourceValue = source[key];
      const targetValue = result[key as keyof T];

      if (
        sourceValue !== null &&
        typeof sourceValue === 'object' &&
        !Array.isArray(sourceValue) &&
        targetValue !== null &&
        typeof targetValue === 'object' &&
        !Array.isArray(targetValue)
      ) {
        (result as any)[key] = deepMerge(targetValue as object, sourceValue as object);
      } else {
        (result as any)[key] = sourceValue;
      }
    }
  }

  return result;
}
