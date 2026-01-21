/**
 * Agent Skills Adapter
 *
 * Generates Agent Skills (per agentskills.io specification) from Clavix templates.
 * Skills are directory-based with SKILL.md + optional references/scripts/assets.
 *
 * Supports both global (~/.config/agents/skills) and project-level (.skills) installation.
 *
 * @since v6.2.0
 */

import * as path from 'path';
import * as os from 'os';
import { BaseAdapter } from './base-adapter.js';
import { CommandTemplate, IntegrationFeatures } from '../../types/agent.js';
import { SkillScope, SKILL_PATHS } from '../../types/skill.js';
import { FileSystem } from '../../utils/file-system.js';
import { IntegrationError } from '../../types/errors.js';
import { ClavixConfig } from '../../types/config.js';
import { logger } from '../../utils/logger.js';

export class AgentSkillsAdapter extends BaseAdapter {
  readonly name: string;
  readonly displayName: string;
  readonly fileExtension = '.md';
  readonly features: IntegrationFeatures = {
    supportsSubdirectories: true,
    commandFormat: { separator: '-' },
  };

  private scope: SkillScope;
  private customPath?: string;
  protected readonly userConfig?: ClavixConfig;

  constructor(scope: SkillScope = 'global', userConfig?: ClavixConfig) {
    super();
    this.scope = scope;
    this.userConfig = userConfig;

    // Set name and displayName based on scope
    this.name = scope === 'global' ? 'agent-skills-global' : 'agent-skills-project';
    this.displayName = scope === 'global' ? 'Agent Skills (Global)' : 'Agent Skills (Project)';

    // Check for custom path in user config
    const configKey = scope === 'global' ? 'agent-skills-global' : 'agent-skills-project';
    if (userConfig?.experimental?.integrationPaths?.[configKey]) {
      this.customPath = userConfig.experimental.integrationPaths[configKey];
    }
  }

  /**
   * Get the skill installation scope
   */
  get installScope(): SkillScope {
    return this.scope;
  }

  /**
   * Get the directory path based on scope
   */
  get directory(): string {
    if (this.customPath) {
      return this.customPath;
    }
    return this.scope === 'global' ? SKILL_PATHS.global : SKILL_PATHS.project;
  }

  /**
   * Expand tilde in path to home directory
   */
  private expandPath(p: string): string {
    if (p.startsWith('~/')) {
      return path.join(os.homedir(), p.slice(2));
    }
    return p;
  }

  /**
   * Get full path to skills directory
   */
  getCommandPath(): string {
    const dir = this.directory;
    if (dir.startsWith('~/') || this.scope === 'global') {
      return this.expandPath(dir);
    }
    return path.join(process.cwd(), dir);
  }

  /**
   * Skills use directory names, not filenames
   * Returns the skill directory name (e.g., 'clavix-improve')
   */
  getTargetFilename(name: string): string {
    return `clavix-${name}`;
  }

  /**
   * Detect if skills environment is available
   * For global: check if ~/.config/agents/skills directory exists
   * For project: check if .skills directory exists
   */
  async detectProject(): Promise<boolean> {
    const skillsPath = this.getCommandPath();
    // Check if the skills directory itself exists (not parent)
    return FileSystem.exists(skillsPath);
  }

  /**
   * Generate skills from command templates
   * Creates directory structure per agentskills.io spec:
   *   <skill-name>/
   *   ├── SKILL.md
   *   └── references/
   *       └── <reference-files>.md
   */
  async generateCommands(templates: CommandTemplate[]): Promise<void> {
    const skillsPath = this.getCommandPath();

    try {
      // Ensure base directory exists
      await FileSystem.ensureDir(skillsPath);

      // Convert command templates to skill format and generate
      for (const template of templates) {
        await this.generateSkill(template, skillsPath);
      }
    } catch (error) {
      throw new IntegrationError(
        `Failed to generate Agent Skills: ${error}`,
        `Ensure ${skillsPath} is writable`
      );
    }
  }

  /**
   * Generate a single skill directory from a command template
   */
  private async generateSkill(template: CommandTemplate, basePath: string): Promise<void> {
    const skillName = `clavix-${template.name}`;
    const skillDir = path.join(basePath, skillName);

    // Ensure skill directory exists
    await FileSystem.ensureDir(skillDir);

    // Generate SKILL.md with proper frontmatter
    const skillContent = this.formatSkillContent(template, skillName);
    await FileSystem.writeFileAtomic(path.join(skillDir, 'SKILL.md'), skillContent);

    // Note: References are embedded in the skill template itself
    // The skill templates are pre-assembled with all content
  }

  /**
   * Format template content as SKILL.md with proper frontmatter
   */
  private formatSkillContent(template: CommandTemplate, skillName: string): string {
    // Create description optimized for skill discovery
    const description = this.generateSkillDescription(template.name, template.description);

    // Build frontmatter per agentskills.io spec
    const frontmatter = [
      '---',
      `name: ${skillName}`,
      `description: ${description}`,
      'license: Apache-2.0',
      '---',
      '',
    ].join('\n');

    return frontmatter + template.content;
  }

  /**
   * Generate skill description optimized for agent discovery
   * Descriptions should explain what the skill does AND when to use it
   */
  private generateSkillDescription(name: string, baseDescription: string): string {
    const descriptionMap: Record<string, string> = {
      improve:
        'Analyze and optimize prompts using 6-dimension quality assessment (Clarity, Efficiency, Structure, Completeness, Actionability, Specificity). Use when you need to improve a prompt before implementation.',
      prd: 'Create comprehensive Product Requirements Documents through strategic questioning. Use when planning a new feature or project that needs clear requirements.',
      plan: 'Transform PRD documents into actionable task breakdowns with dependencies. Use after creating a PRD to generate implementation tasks.',
      implement:
        'Execute implementation tasks or saved prompts with progress tracking. Use when ready to build what was planned in PRD or improved prompts.',
      start:
        'Begin conversational exploration to discover requirements through natural discussion. Use when ideas are vague and need refinement through dialogue.',
      summarize:
        'Extract structured requirements from conversations into mini-PRD format. Use after conversational exploration to capture what was discussed.',
      refine:
        'Iterate on existing PRDs or improved prompts to enhance quality. Use when you have a draft that needs further refinement.',
      verify:
        'Verify implementation against PRD requirements with systematic checking. Use after implementation to validate completeness.',
      review:
        'Review code changes with criteria-driven analysis (Security, Architecture, Standards, Performance). Use when reviewing PRs or code changes.',
      archive:
        'Archive completed projects by moving outputs to archive directory. Use when a project is complete and ready for archival.',
    };

    return descriptionMap[name] || baseDescription;
  }

  /**
   * Remove all Clavix-generated skills
   * Skills are directories matching 'clavix-*' pattern
   */
  async removeAllCommands(): Promise<number> {
    const skillsPath = this.getCommandPath();

    // If directory doesn't exist, nothing to remove
    if (!(await FileSystem.exists(skillsPath))) {
      return 0;
    }

    const entries = await FileSystem.listFiles(skillsPath);
    const clavixSkills = entries.filter((entry) => this.isClavixGeneratedCommand(entry));

    let removed = 0;
    for (const skillName of clavixSkills) {
      const skillDir = path.join(skillsPath, skillName);
      try {
        // Remove entire skill directory
        await FileSystem.remove(skillDir);
        removed++;
      } catch (error) {
        logger.warn(`Failed to remove skill ${skillDir}: ${error}`);
      }
    }

    return removed;
  }

  /**
   * Determine if an entry is a Clavix-generated skill
   * Skills are directories starting with 'clavix-'
   */
  protected isClavixGeneratedCommand(name: string): boolean {
    return name.startsWith('clavix-');
  }

  /**
   * Validate skills directory
   */
  async validate(): Promise<{ valid: boolean; errors?: string[]; warnings?: string[] }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    const skillsPath = this.getCommandPath();
    const parentDir = path.dirname(skillsPath);

    // Check if parent directory exists
    if (!(await FileSystem.exists(parentDir))) {
      if (this.scope === 'global') {
        warnings.push(`Global skills directory ${parentDir} will be created`);
      } else {
        warnings.push(`Project skills directory will be created`);
      }
    }

    // Try to ensure directory exists
    try {
      await FileSystem.ensureDir(skillsPath);
    } catch (error) {
      errors.push(`Cannot create skills directory: ${error}`);
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }
}

/**
 * Factory function to create adapter with scope
 */
export function createAgentSkillsAdapter(
  scope: SkillScope,
  userConfig?: ClavixConfig
): AgentSkillsAdapter {
  return new AgentSkillsAdapter(scope, userConfig);
}
