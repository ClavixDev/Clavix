/**
 * Inquirer prompts for Clavix initialization
 */

import inquirer from 'inquirer';
import type { AgentAdapter } from '../../../types/agent.js';

export type InitAction = 'reconfigure' | 'update' | 'cancel';
export type CleanupAction = 'cleanup' | 'update' | 'skip';

/**
 * Prompt for action when Clavix is already initialized
 */
export async function promptExistingConfigAction(): Promise<InitAction> {
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        { name: 'Reconfigure integrations', value: 'reconfigure' },
        { name: 'Update existing (regenerate commands)', value: 'update' },
        { name: 'Cancel', value: 'cancel' },
      ],
    },
  ]);
  return action;
}

/**
 * Prompt for what to do with deselected integrations
 */
export async function promptDeselectedAction(): Promise<CleanupAction> {
  const { cleanupAction } = await inquirer.prompt([
    {
      type: 'list',
      name: 'cleanupAction',
      message: 'What would you like to do with these integrations?',
      choices: [
        { name: 'Clean up (remove all command files)', value: 'cleanup' },
        { name: 'Keep (also update their commands)', value: 'update' },
        { name: 'Skip (leave as-is)', value: 'skip' },
      ],
    },
  ]);
  return cleanupAction;
}

/**
 * Prompt for Codex CLI confirmation
 */
export async function promptCodexConfirmation(codexPath: string): Promise<boolean> {
  const { confirmCodex } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirmCodex',
      message: `Codex commands will be generated at ${codexPath}. Continue?`,
      default: true,
    },
  ]);
  return confirmCodex;
}

/**
 * Prompt for namespace usage (Gemini/Qwen)
 */
export async function promptNamespaceUsage(
  adapterDisplayName: string,
  defaultPath: string
): Promise<boolean> {
  const { useNamespace } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'useNamespace',
      message: `Store ${adapterDisplayName} commands under ${defaultPath}? (Produces /clavix:<command> shortcuts)`,
      default: true,
    },
  ]);
  return useNamespace;
}

/**
 * Prompt for continuing despite validation errors
 */
export async function promptContinueAnyway(): Promise<boolean> {
  const { continueAnyway } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'continueAnyway',
      message: 'Continue anyway?',
      default: false,
    },
  ]);
  return continueAnyway;
}

/**
 * Prompt for removing legacy command files
 */
export async function promptRemoveLegacy(adapter: AgentAdapter): Promise<boolean> {
  const { removeLegacy } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'removeLegacy',
      message: `Remove deprecated files for ${adapter.displayName}? Functionality is unchanged; filenames are being standardized.`,
      default: true,
    },
  ]);
  return removeLegacy;
}
