import { IntegrationFeatures } from '../types/agent.js';

/**
 * CommandTransformer - Transforms slash command references in template content
 *
 * Handles conversion between command formats:
 * - Colon format: /clavix:improve (Claude Code style - uses subdirectories)
 * - Hyphen format: /clavix-improve (Cursor, Droid style - flat files)
 *
 * Only transforms slash commands that start with /clavix:
 *
 * @since v4.8.1
 */
export class CommandTransformer {
  /**
   * Matches /clavix:commandname pattern
   * Supports hyphenated commands like task-complete
   * Does NOT match CLI usage (no leading slash)
   */
  private static readonly SLASH_COMMAND_PATTERN = /\/clavix:(\w+(?:-\w+)*)/g;

  /** Default command format (canonical/Claude Code style) */
  private static readonly DEFAULT_SEPARATOR: ':' | '-' = ':';

  /**
   * Transform slash command references in content based on adapter's command format
   *
   * @param content - Template content with canonical /clavix:command references
   * @param features - Adapter's integration features (may include commandFormat)
   * @returns Transformed content with correct command format
   *
   * @example
   * // For Cursor/Droid (hyphen format):
   * transform('/clavix:improve', { commandFormat: { separator: '-' } })
   * // Returns: '/clavix-improve'
   *
   * @example
   * // For Claude Code (colon format, default):
   * transform('/clavix:improve', { commandFormat: { separator: ':' } })
   * // Returns: '/clavix:improve' (unchanged)
   */
  static transform(content: string, features?: IntegrationFeatures): string {
    const separator = features?.commandFormat?.separator ?? this.DEFAULT_SEPARATOR;

    // If using canonical format (colon), no transformation needed
    if (separator === ':') {
      return content;
    }

    // Transform /clavix:command to /clavix-command (or other separator)
    return content.replace(this.SLASH_COMMAND_PATTERN, `/clavix${separator}$1`);
  }

  /**
   * Get the formatted command name for a specific adapter
   * Useful for generating documentation or references
   *
   * @param commandName - Base command name (e.g., 'improve', 'prd', 'implement')
   * @param features - Adapter's integration features
   * @returns Formatted slash command (e.g., '/clavix:improve' or '/clavix-improve')
   *
   * @example
   * formatCommand('improve', { commandFormat: { separator: '-' } })
   * // Returns: '/clavix-improve'
   */
  static formatCommand(commandName: string, features?: IntegrationFeatures): string {
    const separator = features?.commandFormat?.separator ?? this.DEFAULT_SEPARATOR;
    return `/clavix${separator}${commandName}`;
  }
}
