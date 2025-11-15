/**
 * Agent integration types
 */

export interface AgentAdapter {
  name: string;
  displayName: string;
  directory: string;
  fileExtension: string;
  features?: ProviderFeatures;

  detectProject(): Promise<boolean>;
  generateCommands(templates: CommandTemplate[]): Promise<void>;
  injectDocumentation(blocks: ManagedBlock[]): Promise<void>;
  getCommandPath(): string;
  validate?(): Promise<ValidationResult>;
}

export interface ProviderFeatures {
  supportsFrontmatter?: boolean;
  supportsExecutableCommands?: boolean;
  supportsSubdirectories?: boolean;
  argumentPlaceholder?: string;
  frontmatterFields?: string[];
}

export interface ValidationResult {
  valid: boolean;
  errors?: string[];
  warnings?: string[];
}

export interface CommandTemplate {
  name: string;
  content: string;
  description: string;
}

export interface ManagedBlock {
  startMarker: string;
  endMarker: string;
  content: string;
  targetFile: string;
}

export type AgentType =
  | 'claude-code'
  | 'cursor'
  | 'droid'
  | 'opencode'
  | 'amp'
  | 'agents-md'
  | 'octo-md'
  | 'windsurf'
  | 'custom'
  | 'codebuddy'
  | 'gemini'
  | 'qwen'
  | 'codex';
