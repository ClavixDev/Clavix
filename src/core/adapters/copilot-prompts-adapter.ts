import * as path from 'path';
import { BaseAdapter } from './base-adapter.js';
import { CommandTemplate } from '../../types/agent.js';
import { FileSystem } from '../../utils/file-system.js';
import { IntegrationError } from '../../types/errors.js';
import { ClavixConfig } from '../../types/config.js';

/**
 * GitHub Copilot Prompts Adapter
 *
 * Generates custom slash commands as .prompt.md files in .github/prompts/
 * These appear as /clavix-improve, /clavix-prd, etc. in VS Code with GitHub Copilot
 *
 * Format reference: https://code.visualstudio.com/docs/copilot/copilot-customization
 *
 * @since v6.1.0
 */
export class CopilotPromptsAdapter extends BaseAdapter {
  readonly name = 'copilot';
  readonly displayName = 'GitHub Copilot';
  readonly directory = '.github/prompts';
  readonly fileExtension = '.prompt.md';
  readonly features = {
    supportsSubdirectories: false,
    commandFormat: { separator: '-' as const },
  };
  protected readonly userConfig?: ClavixConfig;

  constructor(userConfig?: ClavixConfig) {
    super();
    this.userConfig = userConfig;
  }

  /**
   * Detect if GitHub Copilot is likely in use
   * Check for .github directory (common for GitHub projects)
   */
  async detectProject(): Promise<boolean> {
    return await FileSystem.exists('.github');
  }

  /**
   * Get command path for Copilot prompts
   */
  getCommandPath(): string {
    return this.directory;
  }

  /**
   * Get target filename for a command
   * Format: clavix-{name}.prompt.md
   */
  getTargetFilename(name: string): string {
    return `clavix-${name}${this.fileExtension}`;
  }

  /**
   * Determine if a file is a Clavix-generated prompt
   */
  protected isClavixGeneratedCommand(filename: string): boolean {
    return filename.startsWith('clavix-') && filename.endsWith('.prompt.md');
  }

  /**
   * Format command content with Copilot prompt file frontmatter
   *
   * Copilot prompt files support YAML frontmatter with:
   * - name: The slash command name (shown after /)
   * - description: Short description shown in command picker
   * - agent: Which agent to use (ask, edit, agent)
   * - tools: List of available tools
   */
  protected formatCommand(template: CommandTemplate): string {
    const frontmatter = this.generateFrontmatter(template);
    return `${frontmatter}\n${template.content}`;
  }

  /**
   * Generate YAML frontmatter for Copilot prompt file
   */
  private generateFrontmatter(template: CommandTemplate): string {
    // Extract description from template frontmatter if present
    const descMatch = template.content.match(/^---\s*\n[\s\S]*?description:\s*(.+)\n[\s\S]*?---/);
    const description = descMatch ? descMatch[1].trim() : template.description;

    // Map Clavix commands to appropriate Copilot agents
    const agentMapping: Record<string, string> = {
      improve: 'ask',
      prd: 'ask',
      start: 'ask',
      summarize: 'ask',
      refine: 'ask',
      plan: 'ask',
      review: 'ask',
      verify: 'ask',
      implement: 'agent',
      archive: 'agent',
    };

    const agent = agentMapping[template.name] || 'ask';

    // For implementation commands, include tools
    const toolsLine =
      agent === 'agent' ? '\ntools:\n  - editFiles\n  - runCommands\n  - codebase' : '';

    return `---
name: clavix-${template.name}
description: "${description.replace(/"/g, '\\"')}"
agent: ${agent}${toolsLine}
---`;
  }

  /**
   * Generate commands with Copilot-specific formatting
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
}
