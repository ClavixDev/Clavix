/**
 * Interactive prompts for the clean command
 */

import inquirer from 'inquirer';
import type { BatchInfo } from './types.js';
import { CleanScope, ScanMethod } from './types.js';

/**
 * Result of a batch confirmation action
 */
export type BatchAction = 'delete' | 'details' | 'skip' | 'cancel';

/**
 * Prompts class for interactive user input
 */
export class Prompts {
  /**
   * Ask user what scope to clean
   * @returns The selected clean scope
   */
  static async selectScope(): Promise<CleanScope> {
    const { scope } = await inquirer.prompt<{
      scope: CleanScope;
    }>([
      {
        type: 'list',
        name: 'scope',
        message: 'What would you like to clean?',
        choices: [
          {
            name: 'Clean current project (./)',
            value: 'current' as const,
          },
          {
            name: 'Clean everything created by Clavix',
            value: 'everything' as const,
          },
        ],
      },
    ]);
    return scope;
  }

  /**
   * Ask user how to discover projects with Clavix artifacts
   * @returns The selected scan method
   */
  static async selectScanMethod(): Promise<ScanMethod> {
    const { method } = await inquirer.prompt<{
      method: ScanMethod;
    }>([
      {
        type: 'list',
        name: 'method',
        message: 'How should we discover projects with Clavix artifacts?',
        choices: [
          {
            name: 'Scan common directories (Documents, Projects, etc.)',
            value: 'all' as const,
          },
          {
            name: 'Provide specific folder paths to scan',
            value: 'paths' as const,
          },
          {
            name: 'Clean only global locations (skip projects)',
            value: 'global' as const,
          },
        ],
      },
    ]);
    return method;
  }

  /**
   * Ask user to confirm deletion of a batch
   * @param batch - The batch information to confirm
   * @param dryRun - Whether this is a dry run
   * @returns true if the user wants to delete, false to skip
   */
  static async confirmBatch(batch: BatchInfo, dryRun = false): Promise<boolean> {
    const { action } = await inquirer.prompt<{ action: BatchAction }>([
      {
        type: 'list',
        name: 'action',
        message: this.getBatchMessage(batch, dryRun),
        choices: this.getBatchChoices(batch, dryRun),
      },
    ]);

    if (action === 'details') {
      // Show detailed view and re-prompt
      this.showBatchDetails(batch);
      return await this.confirmBatch(batch, dryRun);
    }

    if (action === 'cancel') {
      throw new Error('Cleanup cancelled by user');
    }

    return action === 'delete';
  }

  /**
   * Generate the confirmation message for a batch
   */
  private static getBatchMessage(batch: BatchInfo, dryRun: boolean): string {
    const prefix = dryRun ? '[DRY RUN] ' : '';
    const totalSize = this.formatSize(this.calculateBatchSize(batch));
    const locationLabel =
      batch.location === process.cwd() ? './ (current project)' : batch.location;

    return `\n${prefix}Found ${batch.targets.length} item(s) to delete from ${locationLabel}${totalSize ? ` (${totalSize})` : ''}`;
  }

  /**
   * Get choices for batch confirmation
   */
  private static getBatchChoices(
    _batch: BatchInfo,
    dryRun: boolean
  ): Array<{ name: string; value: BatchAction }> {
    const choices: Array<{ name: string; value: BatchAction }> = [];

    if (dryRun) {
      choices.push({
        name: 'Proceed (would delete these items)',
        value: 'delete',
      });
    } else {
      choices.push({
        name: 'Yes, delete',
        value: 'delete',
      });
    }

    choices.push(
      {
        name: 'Show details',
        value: 'details',
      },
      {
        name: 'Skip this batch',
        value: 'skip',
      },
      {
        name: 'Cancel',
        value: 'cancel',
      }
    );

    return choices;
  }

  /**
   * Show detailed information about a batch
   */
  private static showBatchDetails(batch: BatchInfo): void {
    console.log('\n  Items to delete:');

    for (const target of batch.targets) {
      const typeIcon = target.type === 'directory' ? '📁' : target.type === 'block' ? '📝' : '📄';
      const sizeInfo = target.size ? ` (${this.formatSize(target.size)})` : '';
      console.log(`    ${typeIcon} ${target.path}${sizeInfo}`);
      console.log(`        ${target.description}`);
    }
  }

  /**
   * Ask user to confirm scanning all directories (warning)
   * @returns true if user wants to proceed
   */
  static async confirmScanWarning(): Promise<boolean> {
    const { proceed } = await inquirer.prompt<{ proceed: boolean }>([
      {
        type: 'confirm',
        name: 'proceed',
        message:
          'Scanning all directories may take time and require file system permissions. Continue?',
        default: false,
      },
    ]);
    return proceed;
  }

  /**
   * Get custom paths from user
   * @returns Array of paths to scan
   */
  static async getCustomPaths(): Promise<string[]> {
    const { paths } = await inquirer.prompt<{ paths: string }>([
      {
        type: 'input',
        name: 'paths',
        message: 'Enter folder paths to scan (comma-separated):',
        validate: (input: string) => {
          if (!input.trim()) {
            return 'Please enter at least one path';
          }
          return true;
        },
      },
    ]);

    return paths
      .split(',')
      .map((p) => p.trim())
      .filter((p) => p.length > 0);
  }

  /**
   * Notify user that no artifacts were found
   * @param scope - The scope that was checked
   */
  static notifyNoArtifacts(_scope: CleanScope): void {
    console.log(`  No artifacts to clean.`);
  }

  /**
   * Format size in human-readable format
   */
  private static formatSize(bytes: number): string {
    if (bytes === 0) return '';

    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }

  /**
   * Calculate total size of a batch
   */
  private static calculateBatchSize(batch: BatchInfo): number {
    return batch.targets.reduce((total, target) => total + (target.size || 0), 0);
  }
}
