/**
 * Discovery module for finding Clavix artifacts
 */

import path from 'node:path';
import { DocInjector } from '../core/doc-injector.js';
import { FileSystem } from '../utils/file-system.js';
import { CLAVIX_BLOCK_START, CLAVIX_BLOCK_END } from '../constants.js';
import { getKnownBlockFiles } from './guards.js';
import type { CleanTarget } from './types.js';

/**
 * Known integration directories that may contain Clavix command files
 */
const INTEGRATION_DIRS = [
  '.claude/commands',
  '.claude/commands/clavix',
  '.gemini/commands',
  '.gemini/commands/clavix',
  '.qwen/commands',
  '.qwen/commands/clavix',
  '.llxprt/commands',
  '.llxprt/commands/clavix',
] as const;

/**
 * Discovery class for finding Clavix artifacts in a project
 */
export class Discovery {
  /**
   * Find all Clavix artifacts in a specific location
   * @param rootPath - The root path to search
   * @returns Array of CleanTarget objects
   */
  static async findArtifacts(rootPath: string): Promise<CleanTarget[]> {
    const targets: CleanTarget[] = [];

    // 1. Check for .clavix/ directory
    const clavixDir = path.join(rootPath, '.clavix');
    if (await FileSystem.exists(clavixDir)) {
      const size = await this.getDirectorySize(clavixDir);
      targets.push({
        type: 'directory',
        path: path.relative(rootPath, clavixDir) + path.sep,
        description: 'Clavix configuration directory',
        size,
      });
    }

    // 2. Scan known integration directories for clavix-* files
    for (const relativeDir of INTEGRATION_DIRS) {
      const integrationDir = path.join(rootPath, relativeDir);
      const files = await this.findFilesStartingWith(integrationDir, 'clavix-');
      for (const file of files) {
        const size = await this.getFileSize(file);
        targets.push({
          type: 'file',
          path: path.relative(rootPath, file),
          description: this.getFileDescription(file),
          size,
        });
      }

      // Also check for clavix subdirectory itself
      const clavixSubdir = path.join(rootPath, relativeDir);
      if (integrationDir.endsWith('/clavix')) {
        if (
          (await FileSystem.exists(clavixSubdir)) &&
          path.relative(rootPath, clavixSubdir) !== '.clavix'
        ) {
          const size = await this.getDirectorySize(clavixSubdir);
          targets.push({
            type: 'directory',
            path: path.relative(rootPath, clavixSubdir) + path.sep,
            description: 'Clavix commands directory',
            size,
          });
        }
      }
    }

    // 3. Check for <!-- CLAVIX:START --> blocks in known files
    for (const blockFile of getKnownBlockFiles()) {
      const blockFilePath = path.join(rootPath, blockFile);
      if (await FileSystem.exists(blockFilePath)) {
        if (await DocInjector.hasBlock(blockFilePath, CLAVIX_BLOCK_START, CLAVIX_BLOCK_END)) {
          const size = await this.getFileSize(blockFilePath);
          targets.push({
            type: 'block',
            path: path.relative(rootPath, blockFilePath),
            description: `Clavix documentation block in ${blockFile}`,
            size,
          });
        }
      }
    }

    // 4. Scan for using-clavix files in root
    const usingClavixFiles = await this.findFilesStartingWith(rootPath, 'using-clavix');
    for (const file of usingClavixFiles) {
      if (path.dirname(file) === rootPath) {
        const size = await this.getFileSize(file);
        targets.push({
          type: 'file',
          path: path.relative(rootPath, file),
          description: 'Clavix using meta-skill',
          size,
        });
      }
    }

    // 5. Find integration files from config
    const integrations = await this.loadIntegrations();
    const integrationTargets = await this.findIntegrationArtifacts(rootPath, integrations);
    targets.push(...integrationTargets);

    // 6. Check .skills/ directory for project-local skill directories
    const skillsDir = path.join(rootPath, '.skills');
    if (await FileSystem.exists(skillsDir)) {
      const skillDirs = await this.findClavixSkillDirectories(skillsDir);
      for (const skillDir of skillDirs) {
        const size = await this.getDirectorySize(skillDir);
        targets.push({
          type: 'directory',
          path: path.relative(rootPath, skillDir) + path.sep,
          description: `Clavix skill: ${path.basename(skillDir)}`,
          size,
        });
      }
    }

    // Sort targets by type (directories first, then files, then blocks)
    const typePriority = { directory: 0, block: 1, file: 2 };
    targets.sort((a, b) => typePriority[a.type] - typePriority[b.type]);

    return targets;
  }

  /**
   * Load integration configs from integrations.json
   */
  private static async loadIntegrations(): Promise<any[]> {
    const fs = await import('node:fs/promises');
    const configPath = path.join(process.cwd(), 'src/config/integrations.json');

    try {
      const config = JSON.parse(await fs.readFile(configPath, 'utf-8'));
      return config.integrations || [];
    } catch {
      return [];
    }
  }

  /**
   * Find integration generated files dynamically
   */
  private static async findIntegrationArtifacts(
    rootPath: string,
    integrations: any[]
  ): Promise<CleanTarget[]> {
    const targets: CleanTarget[] = [];

    for (const integration of integrations) {
      // Skip global integrations (handled in cleaner.ts)
      if (integration.global) continue;

      // Skip universal integrations (they inject into files, handled separately)
      if (integration.type === 'universal') continue;

      const targetDir = path.join(rootPath, integration.directory);

      if (!(await FileSystem.exists(targetDir))) continue;

      // Find files matching the integration's pattern
      const files = await this.findMatchingFiles(targetDir, integration);
      for (const file of files) {
        const size = await this.getFileSize(file);
        targets.push({
          type: 'file',
          path: path.relative(rootPath, file),
          description: `Clavix (${integration.displayName}): ${path.basename(file)}`,
          size,
        });
      }
    }

    return targets;
  }

  /**
   * Find files matching integration pattern
   */
  private static async findMatchingFiles(dirPath: string, integration: any): Promise<string[]> {
    const files: string[] = [];
    const fs = await import('node:fs/promises');

    try {
      const dir = await fs.opendir(dirPath);

      for await (const entry of dir) {
        if (!entry.isFile()) continue;

        if (Discovery.fileMatchesIntegration(entry.name, integration)) {
          files.push(path.join(dirPath, entry.name));
        }
      }
    } catch {
      // Directory doesn't exist or can't be read
    }
    return files;
  }

  /**
   * Check if filename matches integration's pattern
   */
  public static fileMatchesIntegration(filename: string, integration: any): boolean {
    const { filenamePattern, extension } = integration;

    // Escape special regex characters in the pattern
    const escapedPattern = filenamePattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Replace {name} with pattern matching any name
    const namePattern = escapedPattern.replace('{name}', '.+');
    // Handle patterns without {name} (static filenames like AGENTS)
    const pattern = filenamePattern.includes('{name}')
      ? `^${namePattern}\\${extension.replace('.', '\\.')}$`
      : `^${escapedPattern}\\${extension.replace('.', '\\.')}$`;

    return new RegExp(pattern).test(filename);
  }

  /**
   * Find Clavix skill directories (.skills/clavix-*)
   */
  private static async findClavixSkillDirectories(skillsDir: string): Promise<string[]> {
    const dirs: string[] = [];
    const fs = await import('node:fs/promises');

    try {
      const dir = await fs.opendir(skillsDir);
      for await (const entry of dir) {
        if (entry.isDirectory() && entry.name.startsWith('clavix-')) {
          dirs.push(path.join(skillsDir, entry.name));
        }
        // Also include using-clavix meta-skill directory
        if (entry.isDirectory() && entry.name === 'using-clavix') {
          dirs.push(path.join(skillsDir, entry.name));
        }
      }
    } catch {
      // Directory doesn't exist
    }
    return dirs;
  }

  /**
   * Find files starting with a specific prefix in a directory
   * @param dirPath - The directory to search
   * @param prefix - The file prefix to match
   * @returns Array of matching file paths
   */
  private static async findFilesStartingWith(dirPath: string, prefix: string): Promise<string[]> {
    const files: string[] = [];

    try {
      if (!(await FileSystem.exists(dirPath))) {
        return files;
      }

      const fs = await import('node:fs/promises');
      const dir = await fs.opendir(dirPath);

      for await (const entry of dir) {
        if (entry.isFile() && entry.name.startsWith(prefix)) {
          files.push(path.join(dirPath, entry.name));
        } else if (entry.isDirectory() && entry.name === 'clavix') {
          // Found a nested clavix directory, include it
          files.push(path.join(dirPath, entry.name, path.sep));
        }
      }
    } catch {
      // If we can't read the directory, just return empty
      // This is expected for non-existent or permission-denied directories
    }

    return files;
  }

  /**
   * Get the size of a file in bytes
   * @param filePath - The file path
   * @returns File size in bytes
   */
  private static async getFileSize(filePath: string): Promise<number> {
    try {
      const fs = await import('node:fs/promises');
      const stats = await fs.stat(filePath);
      return stats.size;
    } catch {
      return 0;
    }
  }

  /**
   * Get the total size of a directory in bytes
   * @param dirPath - The directory path
   * @returns Total size in bytes
   */
  private static async getDirectorySize(dirPath: string): Promise<number> {
    let totalSize = 0;

    try {
      const fs = await import('node:fs/promises');
      const dir = await fs.opendir(dirPath);

      for await (const entry of dir) {
        const entryPath = path.join(dirPath, entry.name);

        if (entry.isFile()) {
          try {
            const stats = await fs.stat(entryPath);
            totalSize += stats.size;
          } catch {
            // Skip files we can't stat
          }
        } else if (entry.isDirectory()) {
          totalSize += await this.getDirectorySize(entryPath);
        }
      }
    } catch {
      // If we can't read, just return 0
    }

    return totalSize;
  }

  /**
   * Get a description for a file based on its name and location
   * @param filePath - The file path
   * @returns A human-readable description
   */
  private static getFileDescription(filePath: string): string {
    const fileName = path.basename(filePath);

    // Command files
    if (fileName.startsWith('clavix-') && fileName.endsWith('.js')) {
      const commandName = fileName.replace('clavix-', '').replace('.js', '');
      return `Clavix command: ${commandName}`;
    }

    if (fileName.startsWith('clavix-') && fileName.endsWith('.ts')) {
      const commandName = fileName.replace('clavix-', '').replace('.ts', '');
      return `Clavix command: ${commandName}`;
    }

    // Generic clavix file
    if (fileName.startsWith('clavix-')) {
      return `Clavix file: ${fileName}`;
    }

    // using-clavix is a meta-skill
    if (fileName.startsWith('using-clavix')) {
      return 'Clavix meta-skill';
    }

    return `Clavix artifact: ${fileName}`;
  }

  /**
   * Check if a directory is effectively empty (only contains .clavix)
   * Used to determine if we should also remove empty parent directories
   * @param dirPath - The directory to check
   * @returns true if the directory is considered empty for cleanup purposes
   */
  static async isEmptyClavixParent(dirPath: string): Promise<boolean> {
    try {
      const fs = await import('node:fs/promises');
      const dir = await fs.opendir(dirPath);

      let hasOnlyClavix = true;
      for await (const entry of dir) {
        if (entry.name !== '.clavix') {
          hasOnlyClavix = false;
          break;
        }
      }

      return hasOnlyClavix;
    } catch {
      return false;
    }
  }
}
