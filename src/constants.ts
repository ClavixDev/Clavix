/**
 * Clavix constants and magic values
 * Centralizes hardcoded values for maintainability
 */

// File system
export const BACKUP_EXTENSION = '.backup';

// CLI formatting
export const SEPARATOR_WIDTH = 50;
export const SEPARATOR_CHAR = '─';

// Clavix managed block markers
export const CLAVIX_BLOCK_START = '<!-- CLAVIX:START -->';
export const CLAVIX_BLOCK_END = '<!-- CLAVIX:END -->';

// Adapter-specific limits
export const WINDSURF_CHAR_LIMIT = 12000;

// Depth terminology (canonical)
export const DEPTH_STANDARD = 'standard';
export const DEPTH_COMPREHENSIVE = 'comprehensive';

// File patterns
export const CLAVIX_CONFIG_DIR = '.clavix';
export const CLAVIX_CONFIG_FILE = 'config.json';
export const CLAVIX_OUTPUTS_DIR = 'outputs';
export const CLAVIX_PROMPTS_DIR = 'prompts';
export const CLAVIX_TEMPLATES_DIR = 'templates';
