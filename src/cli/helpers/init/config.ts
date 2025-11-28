/**
 * Configuration generation and management for Clavix initialization
 */

import { FileSystem } from '../../../utils/file-system.js';
import { ClavixConfig, DEFAULT_CONFIG } from '../../../types/config.js';
import { validateUserConfig } from '../../../utils/schemas.js';

/**
 * Load existing config if present
 * Returns null if no config exists or parsing fails
 */
export async function loadExistingConfig(): Promise<{
  integrations: string[];
  warnings?: string[];
} | null> {
  if (!(await FileSystem.exists('.clavix/config.json'))) {
    return null;
  }

  try {
    const configContent = await FileSystem.readFile('.clavix/config.json');
    const rawConfig = JSON.parse(configContent);

    const validationResult = validateUserConfig(rawConfig);

    if (validationResult.success && validationResult.data) {
      return {
        integrations: validationResult.data.integrations || validationResult.data.providers || [],
        warnings: validationResult.warnings,
      };
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Generate and save the Clavix config file
 */
export async function generateConfig(integrations: string[]): Promise<void> {
  const config: ClavixConfig = {
    ...DEFAULT_CONFIG,
    integrations,
  };

  const configPath = '.clavix/config.json';
  const configContent = JSON.stringify(config, null, 2);
  await FileSystem.writeFileAtomic(configPath, configContent);
}

/**
 * Check if Clavix is already initialized in the current directory
 */
export async function isInitialized(): Promise<boolean> {
  return FileSystem.exists('.clavix');
}
