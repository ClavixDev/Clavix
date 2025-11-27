/**
 * Adapter Registry - Config-driven adapter definitions
 *
 * This registry provides configuration for all simple adapters that can
 * be represented as pure configuration without custom logic.
 *
 * For adapters requiring custom behavior (TOML format, doc injection),
 * dedicated adapter classes still exist.
 *
 * @since v5.3.0
 */

import {
  AdapterConfig,
  DEFAULT_MD_FEATURES,
  DEFAULT_TOML_FEATURES,
} from '../types/adapter-config.js';

/**
 * Registry of all adapter configurations
 *
 * These configurations describe how each adapter behaves:
 * - Where commands are stored
 * - File extension and naming pattern
 * - Feature support (subdirectories, frontmatter, etc.)
 * - Detection method for project environment
 */
export const ADAPTER_CONFIGS: AdapterConfig[] = [
  // IDE Extensions (Markdown-based)
  {
    name: 'cursor',
    displayName: 'Cursor',
    directory: '.cursor/rules',
    fileExtension: '.md',
    filenamePattern: 'clavix-{name}',
    features: { ...DEFAULT_MD_FEATURES },
    detection: { type: 'directory', path: '.cursor' },
  },
  {
    name: 'windsurf',
    displayName: 'Windsurf',
    directory: '.windsurf/rules',
    fileExtension: '.md',
    filenamePattern: 'clavix-{name}',
    features: { ...DEFAULT_MD_FEATURES },
    detection: { type: 'directory', path: '.windsurf' },
  },
  {
    name: 'kilocode',
    displayName: 'Kilocode',
    directory: '.kilocode/rules',
    fileExtension: '.md',
    filenamePattern: 'clavix-{name}',
    features: { ...DEFAULT_MD_FEATURES },
    detection: { type: 'directory', path: '.kilocode' },
  },
  {
    name: 'roocode',
    displayName: 'Roo-Code',
    directory: '.roo/rules',
    fileExtension: '.md',
    filenamePattern: 'clavix-{name}',
    features: { ...DEFAULT_MD_FEATURES },
    detection: { type: 'directory', path: '.roo' },
  },
  {
    name: 'cline',
    displayName: 'Cline',
    directory: '.cline/rules',
    fileExtension: '.md',
    filenamePattern: 'clavix-{name}',
    features: { ...DEFAULT_MD_FEATURES },
    detection: { type: 'directory', path: '.cline' },
  },
  {
    name: 'droid',
    displayName: 'Droid',
    directory: '.droid/rules',
    fileExtension: '.md',
    filenamePattern: 'clavix-{name}',
    features: { ...DEFAULT_MD_FEATURES },
    detection: { type: 'directory', path: '.droid' },
  },
  {
    name: 'opencode',
    displayName: 'OpenCode',
    directory: '.opencode/rules',
    fileExtension: '.md',
    filenamePattern: 'clavix-{name}',
    features: { ...DEFAULT_MD_FEATURES },
    detection: { type: 'directory', path: '.opencode' },
  },
  {
    name: 'crush',
    displayName: 'Crush',
    directory: '.crush/rules',
    fileExtension: '.md',
    filenamePattern: 'clavix-{name}',
    features: { ...DEFAULT_MD_FEATURES },
    detection: { type: 'directory', path: '.crush' },
  },
  {
    name: 'codex',
    displayName: 'Codex CLI',
    directory: '.codex/instructions',
    fileExtension: '.md',
    filenamePattern: 'clavix-{name}',
    features: { ...DEFAULT_MD_FEATURES },
    detection: { type: 'directory', path: '.codex' },
  },
  {
    name: 'codebuddy',
    displayName: 'CodeBuddy',
    directory: '.codebuddy/rules',
    fileExtension: '.md',
    filenamePattern: 'clavix-{name}',
    features: { ...DEFAULT_MD_FEATURES },
    detection: { type: 'directory', path: '.codebuddy' },
  },
  {
    name: 'amp',
    displayName: 'Amp',
    directory: '.amp/rules',
    fileExtension: '.md',
    filenamePattern: 'clavix-{name}',
    features: { ...DEFAULT_MD_FEATURES },
    detection: { type: 'directory', path: '.amp' },
  },
  {
    name: 'augment',
    displayName: 'Augment Code',
    directory: '.augment/rules',
    fileExtension: '.md',
    filenamePattern: 'clavix-{name}',
    features: { ...DEFAULT_MD_FEATURES },
    detection: { type: 'directory', path: '.augment' },
  },

  // Claude Code (requires doc injection - special adapter kept)
  {
    name: 'claude-code',
    displayName: 'Claude Code',
    directory: '.claude/commands/clavix',
    fileExtension: '.md',
    filenamePattern: '{name}',
    features: {
      ...DEFAULT_MD_FEATURES,
      supportsSubdirectories: true,
      supportsFrontmatter: true,
      supportsDocInjection: true,
      commandSeparator: ':',
    },
    detection: { type: 'directory', path: '.claude' },
    specialAdapter: 'doc-injection',
  },

  // TOML-based adapters (require special formatting - special adapter kept)
  {
    name: 'gemini',
    displayName: 'Gemini CLI',
    directory: '.gemini/commands/clavix',
    fileExtension: '.toml',
    filenamePattern: '{name}',
    features: { ...DEFAULT_TOML_FEATURES },
    detection: { type: 'directory', path: '.gemini' },
    specialAdapter: 'toml',
    rootDir: '.gemini',
  },
  {
    name: 'qwen',
    displayName: 'Qwen CLI',
    directory: '.qwen/commands/clavix',
    fileExtension: '.toml',
    filenamePattern: '{name}',
    features: { ...DEFAULT_TOML_FEATURES },
    detection: { type: 'directory', path: '.qwen' },
    specialAdapter: 'toml',
    rootDir: '.qwen',
  },
  {
    name: 'llxprt',
    displayName: 'LLXpert',
    directory: '.llxprt/commands/clavix',
    fileExtension: '.toml',
    filenamePattern: '{name}',
    features: { ...DEFAULT_TOML_FEATURES },
    detection: { type: 'directory', path: '.llxprt' },
    specialAdapter: 'toml',
    rootDir: '.llxprt',
  },
];

/**
 * Get adapter configuration by name
 */
export function getAdapterConfig(name: string): AdapterConfig | undefined {
  return ADAPTER_CONFIGS.find((config) => config.name === name);
}

/**
 * Get all adapter configurations
 */
export function getAllAdapterConfigs(): AdapterConfig[] {
  return [...ADAPTER_CONFIGS];
}

/**
 * Get adapters that require special handling
 */
export function getSpecialAdapters(): AdapterConfig[] {
  return ADAPTER_CONFIGS.filter((config) => config.specialAdapter !== undefined);
}

/**
 * Get simple adapters (can use UniversalAdapter)
 */
export function getSimpleAdapters(): AdapterConfig[] {
  return ADAPTER_CONFIGS.filter((config) => config.specialAdapter === undefined);
}
