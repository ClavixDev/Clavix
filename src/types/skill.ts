/**
 * Agent Skills type definitions
 *
 * Agent Skills are a standardized format for giving AI agents new capabilities.
 * See: https://agentskills.io/specification
 *
 * @since v6.2.0
 */

/**
 * Skill installation scope
 */
export type SkillScope = 'global' | 'project';

/**
 * Skill template with optional references
 * Used during skill generation
 */
export interface SkillTemplate {
  /** Skill name (lowercase, hyphens only, e.g., 'clavix-improve') */
  name: string;
  /** Skill description (max 1024 chars) */
  description: string;
  /** Main SKILL.md content */
  content: string;
  /** Optional reference files to include in references/ subdirectory */
  references?: SkillReference[];
}

/**
 * Reference file for a skill
 * Placed in <skill>/references/ directory
 */
export interface SkillReference {
  /** Filename (e.g., 'quality-dimensions.md') */
  name: string;
  /** File content */
  content: string;
}

/**
 * SKILL.md frontmatter structure per agentskills.io spec
 */
export interface SkillFrontmatter {
  /** Required: Skill name (lowercase, hyphens, 1-64 chars) */
  name: string;
  /** Required: Description of skill and when to use it (1-1024 chars) */
  description: string;
  /** Optional: License name or reference to bundled license file */
  license?: string;
  /** Optional: Environment requirements (max 500 chars) */
  compatibility?: string;
  /** Optional: Arbitrary key-value metadata */
  metadata?: Record<string, string>;
  /** Optional: Space-delimited list of pre-approved tools (experimental) */
  allowedTools?: string;
}

/**
 * Skill directory structure
 * Each skill is a directory containing SKILL.md and optional subdirectories
 */
export interface SkillDirectory {
  /** Directory name (must match skill name) */
  name: string;
  /** Main SKILL.md file content */
  skillMd: string;
  /** Optional reference files */
  references?: Map<string, string>;
  /** Optional script files */
  scripts?: Map<string, string>;
  /** Optional asset files */
  assets?: Map<string, string>;
}

/**
 * Skills configuration options
 */
export interface SkillsConfig {
  /** Installation scope: 'global' or 'project' */
  scope: SkillScope;
  /** Custom directory path (overrides default based on scope) */
  customPath?: string;
}

/**
 * Default skill installation paths
 */
export const SKILL_PATHS = {
  /** Global skills directory */
  global: '~/.config/agents/skills',
  /** Project-level skills directory */
  project: '.skills',
} as const;
