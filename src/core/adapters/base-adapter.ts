import * as path from 'path';
import {
  AgentAdapter,
  CommandTemplate,
  ManagedBlock,
  IntegrationFeatures,
  ValidationResult,
} from '../../types/agent.js';
import { FileSystem } from '../../utils/file-system.js';
import { IntegrationError } from '../../types/errors.js';
import { logger } from '../../utils/logger.js';

/**
 * Base adapter class with shared logic for all integrations
 * Ensures consistency and reduces code duplication
 */
export abstract class BaseAdapter implements AgentAdapter {
  abstract readonly name: string;
  abstract readonly displayName: string;
  abstract readonly directory: string;
  abstract readonly fileExtension: string;
  readonly features?: IntegrationFeatures;

  abstract detectProject(): Promise<boolean>;
  abstract getCommandPath(): string;

  /**
   * Determine the target filename for a generated command
   * Integrations can override to customize filename conventions
   */
  getTargetFilename(name: string): string {
    return `${name}${this.fileExtension}`;
  }

  /**
   * Default validation logic - can be overridden
   * Checks if directory can be created and is writable
   */
  async validate(): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    const commandPath = this.getCommandPath();

    // Check if parent directory exists
    const parentDir = path.dirname(commandPath);
    if (!(await FileSystem.exists(parentDir))) {
      // Check if we can create parent by finding first existing ancestor
      let ancestorDir = parentDir;
      let canCreate = false;

      // Walk up the directory tree until we find an existing directory
      while (ancestorDir !== '.' && ancestorDir !== '/' && ancestorDir.length > 0) {
        ancestorDir = path.dirname(ancestorDir);
        if (await FileSystem.exists(ancestorDir)) {
          canCreate = true;
          break;
        }
      }

      // If we reached '.' or '/', it means we can create the directory
      if (ancestorDir === '.' || ancestorDir === '/' || canCreate) {
        warnings.push(`Parent directory ${parentDir} will be created`);
      } else {
        errors.push(`Parent directory ${parentDir} does not exist and cannot be created`);
      }
    }

    // Try to ensure directory exists
    if (errors.length === 0) {
      try {
        await FileSystem.ensureDir(commandPath);
      } catch (error) {
        errors.push(`Cannot create command directory: ${error}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  /**
   * Remove all existing Clavix-generated commands for this adapter
   * Called before regenerating to ensure clean state
   * @returns Number of files removed
   */
  async removeAllCommands(): Promise<number> {
    const commandPath = this.getCommandPath();

    // If directory doesn't exist, nothing to remove
    if (!(await FileSystem.exists(commandPath))) {
      return 0;
    }

    const files = await FileSystem.listFiles(commandPath);
    const clavixCommands = files.filter((f: string) => this.isClavixGeneratedCommand(f));

    let removed = 0;
    for (const file of clavixCommands) {
      const filePath = path.join(commandPath, file);
      try {
        await FileSystem.remove(filePath);
        removed++;
      } catch (error) {
        // Log warning but continue with other files
        logger.warn(`Failed to remove ${filePath}: ${error}`);
      }
    }

    // Also remove clavix/ subdirectory if it exists (legacy cleanup)
    const clavixSubdir = path.join(commandPath, 'clavix');
    if (await FileSystem.exists(clavixSubdir)) {
      try {
        await FileSystem.remove(clavixSubdir);
        removed++;
      } catch (error) {
        logger.warn(`Failed to remove ${clavixSubdir}: ${error}`);
      }
    }

    return removed;
  }

  /**
   * Determine if a file is a Clavix-generated command
   * Override in adapters for integration-specific patterns
   * @param filename The filename to check
   * @returns true if this is a Clavix-generated command file
   */
  protected isClavixGeneratedCommand(filename: string): boolean {
    // Default: match files with our extension
    return filename.endsWith(this.fileExtension);
  }

  /**
   * Generate commands - default implementation
   * Creates command files in the integration's directory
   */
  async generateCommands(templates: CommandTemplate[]): Promise<void> {
    const commandPath = this.getCommandPath();

    try {
      // Ensure directory exists
      await FileSystem.ensureDir(commandPath);

      // Generate each command file
      for (const template of templates) {
        const content = this.formatCommand(template);
        const filename = this.getTargetFilename(template.name);
        const filePath = path.join(commandPath, filename);
        await FileSystem.writeFileAtomic(filePath, content);
      }
    } catch (error) {
      throw new IntegrationError(
        `Failed to generate ${this.displayName} commands: ${error}`,
        `Ensure ${commandPath} is writable`
      );
    }
  }

  /**
   * Format command content for this integration
   * Default: return content as-is
   * Override for integration-specific formatting (frontmatter, placeholders, etc.)
   */
  protected formatCommand(template: CommandTemplate): string {
    return template.content;
  }

  /**
   * Default documentation injection - no-op
   * Override if integration needs doc injection (like Claude Code)
   */
  async injectDocumentation(_blocks: ManagedBlock[]): Promise<void> {
    // Default: no documentation injection
    // Override in subclasses if needed
  }
}
