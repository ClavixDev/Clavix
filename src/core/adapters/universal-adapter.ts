/**
 * UniversalAdapter - Config-driven adapter implementation
 *
 * This adapter can handle any simple adapter by accepting configuration
 * at construction time. It provides the same interface as dedicated
 * adapter classes but derives all behavior from AdapterConfig.
 *
 * For adapters requiring custom logic (TOML formatting, doc injection),
 * dedicated adapter classes should be used instead.
 *
 * @since v5.3.0
 */

import { BaseAdapter } from './base-adapter.js';
import { AdapterConfig } from '../../types/adapter-config.js';
import { IntegrationFeatures } from '../../types/agent.js';
import { ClavixConfig } from '../../types/config.js';
import { resolveIntegrationPath } from '../../utils/path-resolver.js';
import * as path from 'path';

export class UniversalAdapter extends BaseAdapter {
  private config: AdapterConfig;
  readonly features: IntegrationFeatures;
  private userConfig?: ClavixConfig;

  constructor(config: AdapterConfig, userConfig?: ClavixConfig) {
    super();
    this.config = config;
    this.userConfig = userConfig;
    // Set features from config for interface compatibility
    this.features = {
      supportsSubdirectories: config.features.supportsSubdirectories,
      commandFormat: {
        separator: config.features.commandSeparator,
      },
    };
  }

  get name(): string {
    return this.config.name;
  }

  get displayName(): string {
    return this.config.displayName;
  }

  get directory(): string {
    // Use path resolver for proper environment variable and config override support
    return resolveIntegrationPath(this.config, this.userConfig);
  }

  /**
   * Check if this adapter uses global (home directory) installation
   */
  get isGlobal(): boolean {
    return this.config.global ?? false;
  }

  get fileExtension(): string {
    return this.config.fileExtension;
  }

  /**
   * Get integration features for command transformation
   */
  getIntegrationFeatures(): IntegrationFeatures {
    return {
      commandFormat: {
        separator: this.config.features.commandSeparator,
      },
    };
  }

  /**
   * Generate the target filename based on config pattern
   */
  getTargetFilename(commandName: string): string {
    const pattern = this.config.filenamePattern;
    const filename = pattern.replace('{name}', commandName);
    return `${filename}${this.config.fileExtension}`;
  }

  /**
   * Get full command path
   */
  getCommandPath(): string {
    // For global adapters, use expanded directory path directly
    if (this.isGlobal || this.config.directory.startsWith('~/')) {
      return this.directory; // directory getter already expands ~
    }
    return path.join(process.cwd(), this.config.directory);
  }

  /**
   * Check if this adapter's project environment is detected
   * Required by BaseAdapter abstract class
   */
  async detectProject(): Promise<boolean> {
    const { detection } = this.config;
    const fs = await import('fs-extra');

    switch (detection.type) {
      case 'directory':
        return fs.pathExists(detection.path);
      case 'file':
        return fs.pathExists(detection.path);
      case 'config':
        return fs.pathExists(detection.path);
      default:
        return false;
    }
  }

  /**
   * Check if this adapter supports subdirectories
   */
  supportsSubdirectories(): boolean {
    return this.config.features.supportsSubdirectories;
  }
}
