/**
 * Safety guards for Clavix artifact detection
 * Ensures only Clavix-related items are targeted for deletion
 */

import path from 'node:path';
import os from 'node:os';

/**
 * Clavix-specific patterns - ONLY items matching these are considered safe to delete
 */
const CLAVIX_PATTERNS = {
  // Directories that contain only Clavix artifacts
  directories: [
    '.clavix',
    '.claude/commands/clavix',
    '.gemini/commands/clavix',
    '.qwen/commands/clavix',
    '.llxprt/commands/clavix',
    '~/.config/agents/skills/clavix',
    '~/.codex/prompts/clavix',
    '~/.gemini/commands/clavix',
    '~/.qwen/commands/clavix',
    '~/.llxprt/commands/clavix',
  ],

  // File prefixes that indicate Clavix-generated files
  filePrefixes: ['clavix-', 'using-clavix'],

  // Content markers for documentation blocks
  markers: ['<!-- CLAVIX:START -->', '<!-- CLAVIX:END -->'],

  // Files that may contain Clavix documentation blocks
  blockFiles: ['AGENTS.md', 'CLAUDE.md', 'OCTO.md', 'WARP.md', '.github/copilot-instructions.md'],

  // Forbidden patterns - never delete files matching these
  forbidden: [
    'package.json',
    'package-lock.json',
    'yarn.lock',
    'pnpm-lock.yaml',
    '.git/',
    'node_modules/',
    '.npm/',
    '.yarn/',
    'README.md',
    'LICENSE',
    'tsconfig.json',
  ],
} as const;

/**
 * Check if a filename follows Clavix naming conventions
 * @param filename - The filename to check
 * @returns true if the file appears to be Clavix-generated
 */
export function isClavixFile(filename: string): boolean {
  if (!filename) {
    return false;
  }

  const baseName = path.basename(filename);

  // Check file prefixes
  for (const prefix of CLAVIX_PATTERNS.filePrefixes) {
    if (baseName.startsWith(prefix)) {
      return true;
    }
  }

  // Check if in a clavix-specific directory
  const dirPath = path.dirname(filename);
  for (const pattern of CLAVIX_PATTERNS.directories) {
    if (dirPath.includes(pattern.replace('~', os.homedir()))) {
      return true;
    }
  }

  return false;
}

/**
 * Check if a directory path is a known Clavix directory
 * @param dirpath - The directory path to check
 * @returns true if the directory is a Clavix-specific directory
 */
export function isClavixDirectory(dirpath: string): boolean {
  if (!dirpath) {
    return false;
  }

  const normalizedPath = path.normalize(dirpath);

  for (const pattern of CLAVIX_PATTERNS.directories) {
    const expandedPattern = pattern.replace('~', os.homedir());
    const normalizedPattern = path.normalize(expandedPattern);

    // Check if path is or ends with the pattern
    if (
      normalizedPath === normalizedPattern ||
      normalizedPath.endsWith(path.sep + normalizedPattern) ||
      normalizedPath.endsWith(path.normalize(path.sep + pattern))
    ) {
      return true;
    }

    // Check for wildcard matches (clavix-*)
    if (pattern.includes('clavix-*')) {
      const baseDir = path.dirname(expandedPattern);
      const dirName = path.basename(normalizedPath);
      if (normalizedPath.startsWith(baseDir) && dirName.startsWith('clavix-')) {
        return true;
      }
    }
  }

  // Check .clavix directory directly
  const pathParts = normalizedPath.split(path.sep);
  return pathParts.includes('.clavix');
}

/**
 * Check if a file is known to potentially contain Clavix documentation blocks
 * @param filepath - The file path to check
 * @returns true if the file may contain Clavix blocks
 */
export function isBlockFile(filepath: string): boolean {
  const baseName = path.basename(filepath);
  return (CLAVIX_PATTERNS.blockFiles as readonly string[]).includes(baseName);
}

/**
 * Check if a path should NEVER be deleted (forbidden patterns)
 * @param filepath - The file or directory path to check
 * @returns true if the path should be preserved
 */
export function isForbiddenPath(filepath: string): boolean {
  const normalizedPath = path.normalize(filepath);
  const baseName = path.basename(normalizedPath);

  // Check exact filename matches
  if ((CLAVIX_PATTERNS.forbidden as readonly string[]).includes(baseName)) {
    return true;
  }

  // Check if path contains forbidden directories
  for (const forbidden of CLAVIX_PATTERNS.forbidden) {
    if (
      forbidden.endsWith('/') &&
      (normalizedPath.includes(forbidden) || normalizedPath.includes(path.normalize(forbidden)))
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Comprehensive safety check - determines if a file can be deleted
 * @param filepath - The file path to check
 * @returns true if the file is safe to delete
 */
export function shouldDeleteFile(filepath: string): boolean {
  const normalizedPath = path.normalize(filepath);

  // Check against forbidden paths first
  if (isForbiddenPath(normalizedPath)) {
    return false;
  }

  // If it's a Clavix file, it's safe
  if (isClavixFile(normalizedPath)) {
    return true;
  }

  // If it's within the target root and is a Clavix directory, it's safe
  if (isClavixDirectory(normalizedPath)) {
    return true;
  }

  return false;
}

/**
 * Expand a path pattern containing ~ to the actual home directory
 * @param pattern - The path pattern to expand
 * @returns The expanded path
 */
export function expandHomePath(pattern: string): string {
  return pattern.replace(/^~(?=$|\/|\\)/, os.homedir());
}

/**
 * Get the list of known Clavix directory patterns
 * @returns Array of Clavix directory patterns
 */
export function getClavixDirectoryPatterns(): readonly string[] {
  return CLAVIX_PATTERNS.directories;
}

/**
 * Get the list of files that may contain Clavix documentation blocks
 * @returns Array of known block file names
 */
export function getKnownBlockFiles(): readonly string[] {
  return CLAVIX_PATTERNS.blockFiles;
}

/**
 * Get the list of file prefixes that indicate Clavix-generated files
 * @returns Array of Clavix file prefixes
 */
export function getClavixFilePrefixes(): readonly string[] {
  return CLAVIX_PATTERNS.filePrefixes;
}
