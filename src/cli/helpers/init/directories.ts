/**
 * Directory structure creation for Clavix initialization
 */

import { FileSystem } from '../../../utils/file-system.js';

/**
 * Standard Clavix directory structure
 */
export const CLAVIX_DIRECTORIES = ['.clavix', '.clavix/outputs', '.clavix/templates'] as const;

/**
 * Create the standard Clavix directory structure
 */
export async function createDirectoryStructure(): Promise<void> {
  for (const dir of CLAVIX_DIRECTORIES) {
    await FileSystem.ensureDir(dir);
  }
}
