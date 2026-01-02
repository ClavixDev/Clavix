import inquirer from 'inquirer';
import { AgentManager } from '../core/agent-manager.js';

/**
 * AGENTS.md is always enabled by default.
 * It provides universal agent guidance that all AI tools can read.
 */
export const MANDATORY_INTEGRATION = 'agents-md';

/**
 * Interactive integration selection utility
 * Displays multi-select checkbox for all available integrations
 * Used by both init and config commands
 *
 * Note: AGENTS.md is always enabled and not shown in selection
 */
export async function selectIntegrations(
  agentManager: AgentManager,
  preSelected: string[] = []
): Promise<string[]> {
  const { selectedIntegrations } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'selectedIntegrations',
      message: 'Which AI tools are you using?',
      choices: [
        new inquirer.Separator('=== CLI Tools ==='),
        { name: 'Amp (.agents/commands/)', value: 'amp' },
        { name: 'Augment CLI (.augment/commands/clavix/)', value: 'augment' },
        { name: 'Claude Code (.claude/commands/clavix/)', value: 'claude-code' },
        { name: 'CodeBuddy CLI (.codebuddy/prompts/)', value: 'codebuddy' },
        { name: 'Codex CLI (~/.codex/prompts)', value: 'codex' },
        { name: 'Crush CLI (crush://prompts)', value: 'crush' },
        { name: 'Droid CLI (.droid/clavix/)', value: 'droid' },
        { name: 'Gemini CLI (.gemini/commands/clavix/)', value: 'gemini' },
        { name: 'LLXPRT (~/.llxprt/clavix/)', value: 'llxprt' },
        { name: 'OpenCode (.opencode/clavix/)', value: 'opencode' },
        { name: 'Qwen Code (~/.qwen/commands/clavix/)', value: 'qwen' },
        { name: 'Mistral Vibe (.vibe/skills/)', value: 'vibe' },
        new inquirer.Separator(),

        new inquirer.Separator('=== IDE & IDE Extensions ==='),
        { name: 'Cline (.cline/workflows/)', value: 'cline' },
        { name: 'Cursor (.cursor/commands/)', value: 'cursor' },
        { name: 'Kilocode (.kilo/clavix/)', value: 'kilocode' },
        { name: 'Roocode (.roo/commands/)', value: 'roocode' },
        { name: 'Windsurf (.windsurf/rules/)', value: 'windsurf' },
        new inquirer.Separator(),

        new inquirer.Separator('=== Optional Universal Adapters ==='),
        // Note: AGENTS.md is always enabled (not shown here)
        { name: 'GitHub Copilot (.github/copilot-instructions.md)', value: 'copilot-instructions' },
        { name: 'OCTO.md (Universal)', value: 'octo-md' },
        { name: 'WARP.md (Universal)', value: 'warp-md' },
      ].map((choice) => {
        // Keep separators as-is
        if (choice instanceof inquirer.Separator) {
          return choice;
        }

        // Add 'checked' property based on preSelected
        return {
          ...choice,
          checked: preSelected.includes(choice.value as string),
        };
      }),
      validate: (answer: string[]) => {
        if (answer.length === 0) {
          return 'You must select at least one integration.';
        }
        return true;
      },
    },
  ]);

  return selectedIntegrations;
}

/**
 * Ensures AGENTS.md is always included in the final integration list.
 * Call this after selectIntegrations() to enforce mandatory integrations.
 */
export function ensureMandatoryIntegrations(integrations: string[]): string[] {
  if (!integrations.includes(MANDATORY_INTEGRATION)) {
    return [MANDATORY_INTEGRATION, ...integrations];
  }
  return integrations;
}
