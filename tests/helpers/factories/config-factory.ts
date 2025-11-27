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
 * v5.4: Updated to match current ClavixConfig shape (no sessions)
 */
export function createMinimalConfig(): ClavixConfig {
  return {
    version: '5.4.0',
    integrations: [],
    templates: {
      prdQuestions: 'default',
      fullPrd: 'default',
      quickPrd: 'default',
    },
    outputs: {
      path: '.clavix/outputs',
      format: 'markdown',
    },
    preferences: {
      autoOpenOutputs: false,
      verboseLogging: false,
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
 * Create a config with custom output path.
 * v5.4: Updated - sessions removed in v5.3.0
 */
export function createConfigWithCustomPaths(outputPath: string = 'custom/outputs'): ClavixConfig {
  return createConfig({
    outputs: {
      path: outputPath,
      format: 'markdown',
    },
  });
}

/**
 * Create a config with custom template settings.
 * v5.4: Updated to match current TemplateConfig shape
 */
export function createConfigWithTemplates(prdTemplate: string = 'custom'): ClavixConfig {
  return createConfig({
    templates: {
      prdQuestions: prdTemplate,
      fullPrd: prdTemplate,
      quickPrd: prdTemplate,
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
