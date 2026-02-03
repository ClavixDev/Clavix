/**
 * Scanner module for finding projects with Clavix artifacts
 */

import path from 'node:path';
import os from 'node:os';
import { FileSystem } from '../utils/file-system.js';
import { ScanMethod } from './types.js';

/**
 * Maximum depth to recurse into directories
 */
const MAX_SCAN_DEPTH = 5;

/**
 * Scanner class for finding projects with Clavix artifacts
 */
export class Scanner {
  /**
   * Find all projects with .clavix directories
   * @param method - The scan method to use
   * @param customPaths - Optional custom paths when method is SPECIFIC_PATHS
   * @returns Array of project paths
   */
  static async findProjects(method: ScanMethod, customPaths?: string[]): Promise<string[]> {
    switch (method) {
      case ScanMethod.GLOBAL_ONLY:
        return []; // Skip project scan

      case ScanMethod.SPECIFIC_PATHS:
        return customPaths ? await this.scanPaths(customPaths) : [];

      case ScanMethod.ALL_DIRECTORIES:
        return await this.scanCommonLocations();

      default:
        return [];
    }
  }

  /**
   * Scan specific paths for Clavix projects
   * @param paths - Array of paths to scan
   * @returns Array of project paths found
   */
  private static async scanPaths(paths: string[]): Promise<string[]> {
    const projects: string[] = [];

    for (const scanPath of paths) {
      const resolvedPath = this.expandPath(scanPath);
      if (await FileSystem.exists(resolvedPath)) {
        const found = await this.findClavixDirs(resolvedPath);
        projects.push(...found);
      }
    }

    return projects;
  }

  /**
   * Scan common directory locations for projects
   * @returns Array of project paths found
   */
  private static async scanCommonLocations(): Promise<string[]> {
    const home = os.homedir();
    const commonDirs = [
      home,
      path.join(home, 'Documents'),
      path.join(home, 'Projects'),
      path.join(home, 'dev'),
      path.join(home, 'workspace'),
      path.join(home, 'Desktop'),
      path.join(home, 'code'),
      path.join(home, 'src'),
    ];

    const projects: string[] = [];

    for (const dir of commonDirs) {
      if (await FileSystem.exists(dir)) {
        try {
          const found = await this.findClavixDirs(dir);
          projects.push(...found);
        } catch {
          // Skip directories we can't access silently
        }
      }
    }

    return projects;
  }

  /**
   * Find all directories containing a .clavix subdirectory
   * @param rootPath - The root path to search from
   * @returns Array of project paths
   */
  private static async findClavixDirs(rootPath: string): Promise<string[]> {
    const projects: string[] = [];

    await this.walkDirectory(rootPath, async (dirPath) => {
      const clavixDir = path.join(dirPath, '.clavix');
      if (await FileSystem.exists(clavixDir)) {
        // Don't include the home directory itself
        if (dirPath !== os.homedir()) {
          projects.push(dirPath);
        }
      }
      return true; // Continue walking
    });

    return [...new Set(projects)]; // Remove duplicates
  }

  /**
   * Walk through a directory tree and apply a callback
   * @param dirPath - Directory to walk
   * @param callback - Function to call for each directory (returns false to stop)
   * @param maxDepth - Maximum recursion depth
   * @param currentDepth - Current recursion depth
   */
  private static async walkDirectory(
    dirPath: string,
    callback: (dirPath: string) => Promise<boolean | void>,
    maxDepth = MAX_SCAN_DEPTH,
    currentDepth = 0
  ): Promise<void> {
    if (currentDepth >= maxDepth) {
      return;
    }

    try {
      const fs = await import('node:fs/promises');
      const entries = await fs.readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const entryPath = path.join(dirPath, entry.name);

        if (entry.isDirectory()) {
          // Skip common non-project directories
          if (this.shouldSkipDirectory(entry.name)) {
            continue;
          }

          // Apply callback
          const shouldContinue = await callback(entryPath);
          if (shouldContinue === false) {
            return;
          }

          // Recurse
          await this.walkDirectory(entryPath, callback, maxDepth, currentDepth + 1);
        }
      }
    } catch {
      // Skip directories we can't read
    }
  }

  /**
   * Check if a directory should be skipped during scanning
   * @param dirName - Directory name to check
   * @returns true if directory should be skipped
   */
  private static shouldSkipDirectory(dirName: string): boolean {
    const skipPatterns = [
      '.git',
      '.github',
      'node_modules',
      '.node_modules',
      '.npm',
      '.yarn',
      'dist',
      'build',
      '.cache',
      '.vscode',
      '.idea',
      '__pycache__',
      '.venv',
      'venv',
      '.venv',
      'target',
      'bin',
      'obj',
      '.next',
      '.nuxt',
      'coverage',
    ];

    return skipPatterns.includes(dirName);
  }

  /**
   * Expand a path with ~ to the actual home directory
   * @param pathToExpand - Path to expand
   * @returns Expanded path
   */
  private static expandPath(pathToExpand: string): string {
    return pathToExpand.replace(/^~(?=$|\/|\\)/, os.homedir());
  }
}
