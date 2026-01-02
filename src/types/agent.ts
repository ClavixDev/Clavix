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
  supportsExecutableCommands?: boolean;
  supportsSubdirectories?: boolean;
  argumentPlaceholder?: string;
  /** Command format for slash command references in templates. Default: colon (:) */
  commandFormat?: { separator: ':' | '-' };
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
  | 'vibe'
  | 'warp-md'
  | 'windsurf';
