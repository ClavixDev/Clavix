import { BaseAdapter } from './base-adapter.js';
import { CommandTemplate } from '../../types/agent.js';
import { FileSystem } from '../../utils/file-system.js';
import { ClavixConfig } from '../../types/config.js';

/**
 * Vibe CLI agent adapter
 *
 * Generates SKILL.md files for Vibe CLI integration.
 * Each Clavix slash command becomes a separate Vibe skill.
 *
 * Skills are generated in ./.vibe/skills/ directory which has
 * priority over global ~/.vibe/skills/ in Vibe's skill resolution.
 */
export class VibeAdapter extends BaseAdapter {
  readonly name = 'vibe';
  readonly displayName = 'Vibe CLI';
  readonly directory = '.vibe/skills';
  readonly fileExtension = '.md';
  readonly features = {
    supportsSubdirectories: false,
  };
  protected readonly userConfig?: ClavixConfig;

  constructor(userConfig?: ClavixConfig) {
    super();
    this.userConfig = userConfig;
  }

  /**
   * Detect if Vibe CLI is available in the project
   * Checks for .vibe directory
   */
  async detectProject(): Promise<boolean> {
    return await FileSystem.exists('.vibe');
  }

  /**
   * Get command path for Vibe CLI
   */
  getCommandPath(): string {
    return this.directory;
  }

  /**
   * Generate target filename for Vibe skill
   * Format: clavix-{command}-skill.md
   * Example: clavix-improve-skill.md
   */
  getTargetFilename(name: string): string {
    return `clavix-${name}-skill${this.fileExtension}`;
  }

  /**
   * Determine if a file is a Clavix-generated Vibe skill
   * Matches pattern: clavix-{command}-skill.md where {command} is at least one char
   */
  protected isClavixGeneratedCommand(filename: string): boolean {
    return /^clavix-.+-skill\.md$/.test(filename);
  }

  /**
   * Format command content for Vibe CLI
   * SKILL.md files are plain markdown with AI instructions
   * No special formatting needed - template content is already markdown
   */
  protected formatCommand(template: CommandTemplate): string {
    // Return content as-is - SKILL.md is just markdown instructions
    return template.content;
  }
}
