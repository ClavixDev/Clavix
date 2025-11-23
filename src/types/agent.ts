/**
 * Agent integration types
 */

export interface AgentAdapter {
  name: string;
  displayName: string;
  directory: string;
  fileExtension: string;
  features?: IntegrationFeatures;

  detectProject(): Promise<boolean>;
  generateCommands(templates: CommandTemplate[]): Promise<void>;
  removeAllCommands(): Promise<number>;
  injectDocumentation(blocks: ManagedBlock[]): Promise<void>;
  getCommandPath(): string;
  getTargetFilename(name: string): string;
  validate?(): Promise<ValidationResult>;
}

export interface IntegrationFeatures {
  supportsFrontmatter?: boolean;
  supportsExecutableCommands?: boolean;
  supportsSubdirectories?: boolean;
  argumentPlaceholder?: string;
  frontmatterFields?: string[];
}

/**
 * @deprecated Use IntegrationFeatures instead. Will be removed in v4.0.0
 */
export type ProviderFeatures = IntegrationFeatures;

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
  | 'agents-md'
  | 'amp'
  | 'augment'
  | 'claude-code'
  | 'cline'
  | 'codex'
  | 'codebuddy'
  | 'copilot-instructions'
  | 'crush'
  | 'cursor'
  | 'custom'
  | 'droid'
  | 'gemini'
  | 'kilocode'
  | 'llxprt'
  | 'octo-md'
  | 'opencode'
  | 'qwen'
  | 'roocode'
  | 'windsurf';
