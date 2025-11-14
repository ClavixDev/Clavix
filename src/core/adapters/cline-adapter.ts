import { BaseAdapter } from './base-adapter';
import { FileSystem } from '../../utils/file-system';

/**
 * Cline adapter
 * Workflows stored in .cline/workflows/ (flat structure, no subdirectories)
 * Slash command format: /<name.md> (includes .md extension with leading slash)
 *
 * Features:
 * - Lives alongside Cline Rules
 * - Clear step-by-step instructions in markdown
 * - Supports built-in tools, CLI utilities, and MCP integrations
 *
 * Reference: https://docs.cline.bot/features/slash-commands/workflows
 */
export class ClineAdapter extends BaseAdapter {
  readonly name = 'cline';
  readonly displayName = 'Cline';
  readonly directory = '.cline/workflows';
  readonly fileExtension = '.md';
  readonly features = {
    supportsSubdirectories: false,
    supportsFrontmatter: false,
  };

  /**
   * Detect if Cline is available in the project
   * Checks for .cline directory
   */
  async detectProject(): Promise<boolean> {
    return await FileSystem.exists('.cline');
  }

  /**
   * Get command path for Cline
   */
  getCommandPath(): string {
    return this.directory;
  }

  // Uses default formatCommand and generateCommands from BaseAdapter
}
