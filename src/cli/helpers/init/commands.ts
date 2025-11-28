/**
 * Slash command generation for Clavix initialization
 */

import * as path from 'path';
import { FileSystem } from '../../../utils/file-system.js';
import { loadCommandTemplates } from '../../../utils/template-loader.js';
import { collectLegacyCommandFiles } from '../../../utils/legacy-command-cleanup.js';
import type { AgentAdapter, CommandTemplate } from '../../../types/agent.js';

/**
 * Generate slash commands for an adapter
 * Returns the generated templates
 */
export async function generateSlashCommands(adapter: AgentAdapter): Promise<CommandTemplate[]> {
  const templates = await loadCommandTemplates(adapter);
  await adapter.generateCommands(templates);
  return templates;
}

/**
 * Collect and optionally remove legacy command files
 * Returns paths of legacy files found
 */
export async function collectLegacyFiles(
  adapter: AgentAdapter,
  templates: CommandTemplate[]
): Promise<string[]> {
  const commandNames = templates.map((template) => template.name);
  return collectLegacyCommandFiles(adapter, commandNames);
}

/**
 * Remove legacy command files
 */
export async function removeLegacyFiles(files: string[]): Promise<void> {
  for (const file of files) {
    await FileSystem.remove(file);
  }
}

/**
 * Get relative paths for legacy files (for display)
 */
export function getLegacyRelativePaths(files: string[]): string[] {
  return files.map((file) => path.relative(process.cwd(), file)).sort((a, b) => a.localeCompare(b));
}
