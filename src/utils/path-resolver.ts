/**
 * Path resolution utility for integration directories
 *
 * Supports environment variable overrides with proper priority:
 * 1. Environment variable (e.g., $CODEX_HOME)
 * 2. User config override (experimental.integrationPaths)
 * 3. Built-in default from integrations.json
 */

import * as os from 'os';
import type { ClavixConfig } from '../types/config.js';
import type { AdapterConfig } from '../types/adapter-config.js';

/**
 * Mapping of integration names to their environment variable names
 *
 * Future extensibility: Add more integrations here as needed
 */
export const ENV_VAR_MAP: Record<string, string> = {
  codex: 'CODEX_HOME',
  // Future: cursor: 'CURSOR_HOME',
  // Future: gemini: 'GEMINI_HOME',
} as const;

/**
 * Resolves the directory path for an integration based on priority:
 * 1. Environment variable (highest priority)
 * 2. User config override
 * 3. Built-in default (fallback)
 *
 * @param config - The adapter configuration from integrations.json
 * @param userConfig - The user's Clavix config (optional)
 * @returns The resolved directory path with tilde expansion
 */
export function resolveIntegrationPath(config: AdapterConfig, userConfig?: ClavixConfig): string {
  const integrationName = config.name;

  // Priority 1: Environment variable
  const envVar = ENV_VAR_MAP[integrationName];
  if (envVar && process.env[envVar]) {
    return process.env[envVar]!;
  }

  // Priority 2: User config override
  const customPath = userConfig?.experimental?.integrationPaths?.[integrationName];
  if (customPath && typeof customPath === 'string') {
    return expandTilde(customPath);
  }

  // Priority 3: Built-in default from config
  return expandTilde(config.directory);
}

/**
 * Expands tilde (~) to the user's home directory
 *
 * @param dir - Directory path that may start with ~/
 * @returns Directory path with ~ expanded to home directory
 */
function expandTilde(dir: string): string {
  if (dir.startsWith('~/')) {
    return dir.replace('~', os.homedir());
  }
  return dir;
}
