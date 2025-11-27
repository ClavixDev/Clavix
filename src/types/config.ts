/**
 * Configuration types for Clavix
 */

import { CLAVIX_VERSION } from '../utils/version.js';

export interface ClavixConfig {
  version: string;
  integrations: string[];
  templates: TemplateConfig;
  outputs: OutputConfig;
  preferences: PreferencesConfig;
  experimental?: Record<string, unknown>;
}

/**
 * Legacy config format (pre-v3.5.0)
 * Supports migration from:
 * - v1.3.0 and earlier (single 'agent')
 * - v1.4.0 to v3.4.x ('providers')
 */
export interface LegacyConfig {
  version: string;
  agent?: string;
  providers?: string[];
  templates: TemplateConfig;
  outputs: OutputConfig;
  preferences: PreferencesConfig;
  experimental?: Record<string, unknown>;
}

export interface TemplateConfig {
  prdQuestions: string;
  fullPrd: string;
  quickPrd: string;
}

export interface OutputConfig {
  path: string;
  format: 'markdown' | 'pdf';
}

export interface PreferencesConfig {
  autoOpenOutputs: boolean;
  verboseLogging: boolean;
  preserveSessions: boolean;
}

export const DEFAULT_CONFIG: ClavixConfig = {
  version: CLAVIX_VERSION,
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
    preserveSessions: true,
  },
};

/**
 * Migrate legacy config to current format (v3.5.0+)
 * Handles migration from:
 * - v1.3.0 and earlier (single 'agent' field)
 * - v1.4.0 to v3.4.x ('providers' field)
 */
export function migrateConfig(legacy: LegacyConfig): ClavixConfig {
  // Determine which legacy format we're migrating from
  let integrations: string[];

  if (legacy.providers) {
    // Migration from v1.4.0-v3.4.x (providers → integrations)
    integrations = legacy.providers;
  } else if (legacy.agent) {
    // Migration from v1.3.0 and earlier (agent → integrations)
    integrations = [legacy.agent];
  } else {
    // Fallback: empty integrations
    integrations = [];
  }

  return {
    version: CLAVIX_VERSION,
    integrations,
    templates: legacy.templates,
    outputs: legacy.outputs,
    preferences: legacy.preferences,
    experimental: legacy.experimental,
  };
}

/**
 * Check if config is legacy format (pre-v3.5.0)
 */
export function isLegacyConfig(config: unknown): config is LegacyConfig {
  return (
    config !== null &&
    config !== undefined &&
    typeof config === 'object' &&
    (('agent' in config && typeof (config as { agent: unknown }).agent === 'string') ||
      ('providers' in config && Array.isArray((config as { providers: unknown }).providers))) &&
    !('integrations' in config)
  );
}
