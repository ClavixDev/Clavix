/**
 * Slash command generation for Clavix initialization
 */

import type { AgentAdapter, CommandTemplate } from '../../../types/agent.js';
import { loadCommandTemplates } from '../../../utils/template-loader.js';

/**
 * Generate slash commands for an adapter
 * Returns the generated templates
 */
export async function generateSlashCommands(adapter: AgentAdapter): Promise<CommandTemplate[]> {
  const templates = await loadCommandTemplates(adapter);
  await adapter.generateCommands(templates);
  return templates;
}
