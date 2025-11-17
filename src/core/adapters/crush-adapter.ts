import { BaseAdapter } from './base-adapter.js';
import { CommandTemplate } from '../../types/agent.js';
import { FileSystem } from '../../utils/file-system.js';

/**
 * Crush CLI adapter
 * Commands stored in .crush/commands/clavix/ (supports subdirectories)
 * Uses $PROMPT placeholder for user input (Crush-specific syntax)
 *
 * Reference: https://github.com/charmbracelet/crush/blob/main/COMMANDS.md
 */
export class CrushAdapter extends BaseAdapter {
  readonly name = 'crush';
  readonly displayName = 'Crush CLI';
  readonly directory = '.crush/commands/clavix';
  readonly fileExtension = '.md';
  readonly features = {
    supportsSubdirectories: true,
    supportsFrontmatter: false,
    argumentPlaceholder: '$PROMPT',
  };

  /**
   * Detect if Crush is available in the project
   * Checks for .crush directory (project-level commands)
   */
  async detectProject(): Promise<boolean> {
    return await FileSystem.exists('.crush');
  }

  /**
   * Get command path for Crush
   */
  getCommandPath(): string {
    return this.directory;
  }

  /**
   * Format command content for Crush
   * Replaces generic {{ARGS}} placeholder with Crush-specific $PROMPT
   */
  protected formatCommand(template: CommandTemplate): string {
    // Replace Clavix generic placeholder with Crush placeholder
    return template.content.replace(/\{\{ARGS\}\}/g, '$PROMPT');
  }
}
