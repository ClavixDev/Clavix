/**
 * Version utility for Clavix
 * Centralizes version reading from package.json
 */

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Get version synchronously (for use in type definitions)
 * Falls back to hardcoded version if file cannot be read
 */
export function getVersionSync(): string {
  try {
    const packageJsonPath = path.join(__dirname, '../../package.json');
    const packageJson = fs.readJsonSync(packageJsonPath);
    return packageJson.version || '0.0.0';
  } catch {
    return '0.0.0';
  }
}

/**
 * Current version constant (set at module load time)
 * Use this when you need a static version value
 */
export const CLAVIX_VERSION = getVersionSync();
