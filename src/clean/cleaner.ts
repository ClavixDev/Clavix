/**
 * Cleaner module for executing deletions with safety guards
 */

import path from 'node:path';
import os from 'node:os';
import { DocInjector } from '../core/doc-injector.js';
import { FileSystem } from '../utils/file-system.js';
import { CLAVIX_BLOCK_START, CLAVIX_BLOCK_END } from '../constants.js';
import type { BatchInfo, CleanResult } from './types.js';
import { Discovery } from './discovery.js';

/**
 * Cleaner class for executing deletions safely
 */
export class Cleaner {
  /**
   * Clean a batch of targets
   * @param batch - The batch information with targets to delete
   * @param dryRun - If true, only simulate deletions
   * @returns CleanResult with statistics
   */
  static async cleanBatch(batch: BatchInfo, dryRun = false): Promise<CleanResult> {
    const result: CleanResult = { deleted: 0, skipped: 0, errors: [] };

    for (const target of batch.targets) {
      try {
        const fullPath = path.resolve(batch.location, target.path);

        if (dryRun) {
          result.skipped++;
          continue;
        }

        if (target.type === 'directory') {
          // Remove directory recursively
          await FileSystem.remove(fullPath);
          result.deleted++;
        } else if (target.type === 'file') {
          // Remove file
          await FileSystem.remove(fullPath);
          result.deleted++;
        } else if (target.type === 'block') {
          // Remove managed block from file
          await DocInjector.removeBlock(fullPath, CLAVIX_BLOCK_START, CLAVIX_BLOCK_END);
          result.deleted++;

          // Also try to remove any backup files
          const backupPath = `${fullPath}.backup`;
          if (await FileSystem.exists(backupPath)) {
            await FileSystem.remove(backupPath);
          }
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        result.errors.push(`${target.path}: ${errorMsg}`);
      }
    }

    return result;
  }

  /**
   * Clean all global Clavix artifacts
   * @param dryRun - If true, only simulate deletions
   * @returns CleanResult with statistics
   */
  static async cleanGlobal(dryRun = false): Promise<CleanResult> {
    const result: CleanResult = { deleted: 0, skipped: 0, errors: [] };

    // 1. Clean agent skills
    await this.cleanGlob('~/.config/agents/skills/clavix-*', result, dryRun);

    // 2. Clean global integrations from config
    await this.cleanGlobalIntegrations(result, dryRun);

    // 3. Remove orphaned backup files
    await this.cleanBackups(dryRun);

    return result;
  }

  /**
   * Clean global integrations from config
   */
  private static async cleanGlobalIntegrations(
    result: CleanResult,
    dryRun: boolean
  ): Promise<void> {
    // Load integration configs
    const fs = await import('node:fs/promises');
    const configPath = path.join(process.cwd(), 'src/config/integrations.json');

    let integrations: any[] = [];
    try {
      const config = JSON.parse(await fs.readFile(configPath, 'utf-8'));
      integrations = config.integrations || [];
    } catch {
      return;
    }

    for (const integration of integrations) {
      // Only process global integrations
      if (!integration.global) continue;

      const targetPath = integration.directory.startsWith('~')
        ? integration.directory.replace('~', os.homedir())
        : path.join(os.homedir(), integration.directory);

      // Find and clean files matching pattern
      await this.cleanPattern(targetPath, integration, result, dryRun);
    }
  }

  /**
   * Clean files matching a specific integration pattern
   */
  private static async cleanPattern(
    dirPath: string,
    integration: any,
    result: CleanResult,
    dryRun: boolean
  ): Promise<void> {
    const fs = await import('node:fs/promises');

    try {
      const dir = await fs.opendir(dirPath);

      for await (const entry of dir) {
        if (!entry.isFile()) continue;

        if (Discovery.fileMatchesIntegration(entry.name, integration)) {
          const fullPath = path.join(dirPath, entry.name);
          if (dryRun) {
            result.skipped++;
          } else {
            await FileSystem.remove(fullPath);
            result.deleted++;
          }
        }
      }
    } catch {
      // Directory doesn't exist
    }
  }

  /**
   * Clean files matching a glob pattern
   * @param pattern - Glob pattern with ~ support
   * @param result - Result object to update
   * @param dryRun - If true, only simulate deletions
   */
  private static async cleanGlob(
    pattern: string,
    result: CleanResult,
    dryRun: boolean
  ): Promise<void> {
    const fs = await import('node:fs/promises');

    const expandedPattern = pattern.startsWith('~') ? pattern.replace('~', os.homedir()) : pattern;

    // For simple patterns, just check single file/directory
    try {
      const stats = await fs.stat(expandedPattern);

      if (stats.isDirectory()) {
        const files = await fs.readdir(expandedPattern);
        for (const file of files) {
          const fullPath = path.join(expandedPattern, file);
          if (dryRun) {
            result.skipped++;
          } else {
            await FileSystem.remove(fullPath);
            result.deleted++;
          }
        }

        // Also remove the directory if it's empty
        const remainingFiles = await fs.readdir(expandedPattern);
        if (remainingFiles.length === 0 && !dryRun) {
          await fs.rm(expandedPattern, { recursive: true, force: true });
        }
      } else {
        if (dryRun) {
          result.skipped++;
        } else {
          await FileSystem.remove(expandedPattern);
          result.deleted++;
        }
      }
    } catch {
      // Pattern doesn't exist, skip
    }

    // Also handle glob patterns (simplified - check for clavix-* matches)
    if (pattern.includes('*')) {
      const dirPattern = path.dirname(expandedPattern);
      const filePattern = path.basename(expandedPattern.replace('*', ''));

      try {
        const files = await fs.readdir(dirPattern);
        for (const file of files) {
          if (file.startsWith(filePattern) && file !== filePattern) {
            const fullPath = path.join(dirPattern, file);
            if (dryRun) {
              result.skipped++;
            } else {
              await FileSystem.remove(fullPath);
              result.deleted++;
            }
          }
        }
      } catch {
        // Directory doesn't exist
      }
    }
  }

  /**
   * Clean a specific directory
   * @param dirPath - Directory path with ~ support
   * @param result - Result object to update
   * @param dryRun - If true, only simulate deletions
   */
  private static async cleanDirectory(
    dirPath: string,
    result: CleanResult,
    dryRun: boolean
  ): Promise<void> {
    const fs = await import('node:fs/promises');

    const expandedPath = dirPath.startsWith('~') ? dirPath.replace('~', os.homedir()) : dirPath;

    try {
      if (await FileSystem.exists(expandedPath)) {
        // Count items first
        const files = await fs.readdir(expandedPath);
        const itemCount = files.length;

        if (dryRun) {
          result.skipped += itemCount;
          return;
        }

        // Remove recursively
        await FileSystem.remove(expandedPath);
        result.deleted += itemCount;
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      result.errors.push(`${dirPath}: ${errorMsg}`);
    }
  }

  /**
   * Clean orphaned backup files created by DocInjector
   * @param dryRun - If true, only simulate deletions
   */
  private static async cleanBackups(dryRun = false): Promise<number> {
    const cleaned = 0;

    // Check common project locations for backup files
    const backupLocations = ['~/Documents', '~/Projects', '~/dev', '~/workspace'];

    for (const location of backupLocations) {
      const expandedDir = location.startsWith('~') ? location.replace('~', os.homedir()) : location;

      try {
        await this.findAndRemoveBackups(expandedDir, dryRun);
      } catch {
        // Skip locations we can't access
      }
    }

    return cleaned;
  }

  /**
   * Recursively find and remove backup files
   * @param dirPath - Directory to search
   * @param dryRun - If true, only simulate deletions
   */
  private static async findAndRemoveBackups(dirPath: string, dryRun = false): Promise<void> {
    const fs = await import('node:fs/promises');

    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);

        if (entry.isDirectory()) {
          // Recurse into subdirectories
          await this.findAndRemoveBackups(fullPath, dryRun);
        } else if (entry.name.endsWith('.backup')) {
          // Remove backup file
          if (!dryRun) {
            await FileSystem.remove(fullPath);
          }
        }
      }
    } catch {
      // Skip directories we can't read
    }
  }
}
