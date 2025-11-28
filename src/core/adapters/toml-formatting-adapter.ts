import * as os from 'os';
import * as path from 'path';
import { BaseAdapter } from './base-adapter.js';
import { CommandTemplate } from '../../types/agent.js';
import { FileSystem } from '../../utils/file-system.js';

/**
 * Configuration for TOML-based adapters
 */
export interface TomlAdapterConfig {
  /** Internal adapter name (e.g., 'gemini') */
  name: string;
  /** Display name for UI (e.g., 'Gemini CLI') */
  displayName: string;
  /** Root directory name (e.g., '.gemini') */
  rootDir: string;
  /** Whether to use namespace subdirectory by default */
  useNamespace?: boolean;
}

/**
 * Base adapter for TOML-formatted command files
 * Used by Gemini CLI, Qwen Code, LLXPRT, and similar tools
 *
 * Handles:
 * - TOML file format with description and prompt fields
 * - {{args}} placeholder conversion
 * - Namespace subdirectories (e.g., .gemini/commands/clavix/)
 * - Home directory detection for global installations
 */
export abstract class TomlFormattingAdapter extends BaseAdapter {
  readonly fileExtension = '.toml';
  readonly features = {
    supportsSubdirectories: true,
    argumentPlaceholder: '{{args}}',
  };

  protected readonly config: TomlAdapterConfig;

  constructor(config: TomlAdapterConfig, options: { useNamespace?: boolean } = {}) {
    super();
    this.config = {
      ...config,
      useNamespace: options.useNamespace ?? config.useNamespace ?? true,
    };
  }

  get name(): string {
    return this.config.name;
  }

  get displayName(): string {
    return this.config.displayName;
  }

  get directory(): string {
    return this.config.useNamespace
      ? path.join(this.config.rootDir, 'commands', 'clavix')
      : path.join(this.config.rootDir, 'commands');
  }

  async detectProject(): Promise<boolean> {
    // Check local project directory
    if (await FileSystem.exists(this.config.rootDir)) {
      return true;
    }

    // Check home directory for global installation
    const homePath = path.join(this.getHomeDir(), this.config.rootDir);
    return await FileSystem.exists(homePath);
  }

  getCommandPath(): string {
    return this.directory;
  }

  getTargetFilename(name: string): string {
    const commandPath = this.getCommandPath();
    const namespaced = commandPath.endsWith(path.join('commands', 'clavix'));
    const baseName = namespaced ? name : `clavix-${name}`;
    return `${baseName}${this.fileExtension}`;
  }

  /**
   * Format command as TOML with description and prompt fields
   * Converts {{ARGS}} placeholder to {{args}} for TOML tools
   */
  protected formatCommand(template: CommandTemplate): string {
    const description =
      template.description.trim().length > 0
        ? `description = ${JSON.stringify(template.description)}\n\n`
        : '';

    const content = template.content.replace(/\{\{ARGS\}\}/g, '{{args}}');

    return `${description}prompt = """\n${content}\n"""\n`;
  }

  protected getHomeDir(): string {
    return process.env.CLAVIX_HOME_OVERRIDE || os.homedir();
  }
}
