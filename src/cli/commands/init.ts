import { Command } from '@oclif/core';
import inquirer from 'inquirer';
import chalk from 'chalk';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { AgentManager } from '../../core/agent-manager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { DocInjector } from '../../core/doc-injector.js';
import { AgentsMdGenerator } from '../../core/adapters/agents-md-generator.js';
import { OctoMdGenerator } from '../../core/adapters/octo-md-generator.js';
import { WarpMdGenerator } from '../../core/adapters/warp-md-generator.js';
import { CopilotInstructionsGenerator } from '../../core/adapters/copilot-instructions-generator.js';
import { InstructionsGenerator } from '../../core/adapters/instructions-generator.js';
import { FileSystem } from '../../utils/file-system.js';
import { ClavixConfig, DEFAULT_CONFIG } from '../../types/config.js';
import { CommandTemplate, AgentAdapter } from '../../types/agent.js';
import { GeminiAdapter } from '../../core/adapters/gemini-adapter.js';
import { QwenAdapter } from '../../core/adapters/qwen-adapter.js';
import { loadCommandTemplates } from '../../utils/template-loader.js';
import { collectLegacyCommandFiles } from '../../utils/legacy-command-cleanup.js';
import { CLAVIX_BLOCK_START, CLAVIX_BLOCK_END } from '../../constants.js';
import { validateUserConfig } from '../../utils/schemas.js';

export default class Init extends Command {
  static description = 'Initialize Clavix in the current project';

  static examples = ['<%= config.bin %> <%= command.id %>'];

  async run(): Promise<void> {
    this.log(chalk.bold.cyan('\n🚀 Clavix Initialization\n'));

    try {
      const agentManager = new AgentManager();
      let existingIntegrations: string[] = [];

      // Load existing config if present
      if (await FileSystem.exists('.clavix/config.json')) {
        try {
          const configContent = await FileSystem.readFile('.clavix/config.json');
          const rawConfig = JSON.parse(configContent);

          // Validate config structure with Zod
          const validationResult = validateUserConfig(rawConfig);

          if (validationResult.success && validationResult.data) {
            existingIntegrations =
              validationResult.data.integrations || validationResult.data.providers || [];

            // Log warnings (non-blocking)
            if (validationResult.warnings) {
              for (const warning of validationResult.warnings) {
                this.log(chalk.yellow(`  ⚠ ${warning}`));
              }
            }
          } else {
            this.log(
              chalk.yellow('⚠ Warning: Config file has invalid structure') +
                '\n' +
                chalk.gray('  Continuing with fresh configuration...\n')
            );
          }
        } catch (error: unknown) {
          const { getErrorMessage } = await import('../../utils/error-utils.js');
          this.log(
            chalk.yellow('⚠ Warning: Could not parse existing config.json') +
              '\n' +
              chalk.gray(`  Error: ${getErrorMessage(error)}`) +
              '\n' +
              chalk.gray('  Continuing with fresh configuration...\n')
          );
          // Continue with empty array - will prompt for new configuration
        }
      }

      // Check if already initialized
      if (await FileSystem.exists('.clavix')) {
        // Show current state
        this.log(chalk.cyan('You have existing Clavix configuration:'));
        if (existingIntegrations.length > 0) {
          const displayNames = existingIntegrations.map((name) => {
            const adapter = agentManager.getAdapter(name);
            return adapter?.displayName || name;
          });
          this.log(chalk.gray(`  Integrations: ${displayNames.join(', ')}\n`));
        } else {
          this.log(chalk.gray('  Integrations: (none configured)\n'));
        }

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

        if (action === 'cancel') {
          this.log(chalk.yellow('\n✓ Initialization cancelled\n'));
          return;
        }

        if (action === 'update') {
          // Just regenerate commands for existing integrations
          this.log(chalk.cyan('\n📝 Regenerating commands...\n'));
          await this.regenerateCommands(agentManager, existingIntegrations);
          this.log(chalk.green('\n✅ Commands updated successfully!\n'));
          return;
        }

        // Continue with reconfiguration flow below
      }

      // Select integrations using shared utility
      this.log(chalk.gray('Select AI development tools to support:\n'));
      this.log(chalk.gray('(Space to select, Enter to confirm)\n'));
      this.log(
        chalk.cyan('ℹ'),
        chalk.gray('AGENTS.md is always enabled to provide universal agent guidance.\n')
      );

      const { selectIntegrations, ensureMandatoryIntegrations } = await import(
        '../../utils/integration-selector.js'
      );
      const userSelectedIntegrations = await selectIntegrations(agentManager, existingIntegrations);

      // Always include AGENTS.md
      const selectedIntegrations = ensureMandatoryIntegrations(userSelectedIntegrations);

      if (!selectedIntegrations || selectedIntegrations.length === 0) {
        this.log(chalk.red('\n✗ No integrations selected\n'));
        return;
      }

      // Handle deselected integrations (cleanup prompt)
      const deselectedIntegrations = existingIntegrations.filter(
        (p) => !selectedIntegrations.includes(p)
      );

      if (deselectedIntegrations.length > 0) {
        this.log(chalk.yellow('\n⚠ Previously configured but not selected:'));
        for (const integrationName of deselectedIntegrations) {
          const adapter = agentManager.getAdapter(integrationName);
          const displayName = adapter?.displayName || integrationName;
          const directory = adapter?.directory || 'unknown';
          this.log(chalk.gray(`  • ${displayName} (${directory})`));
        }

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

        if (cleanupAction === 'cleanup') {
          this.log(chalk.gray('\n🗑️  Cleaning up deselected integrations...'));
          for (const integrationName of deselectedIntegrations) {
            // Handle doc generators (AGENTS.md, OCTO.md, WARP.md, copilot-instructions)
            if (integrationName === 'agents-md') {
              await DocInjector.removeBlock('AGENTS.md');
              this.log(chalk.gray('  ✓ Cleaned AGENTS.md Clavix block'));
              continue;
            }
            if (integrationName === 'octo-md') {
              await DocInjector.removeBlock('OCTO.md');
              this.log(chalk.gray('  ✓ Cleaned OCTO.md Clavix block'));
              continue;
            }
            if (integrationName === 'warp-md') {
              await DocInjector.removeBlock('WARP.md');
              this.log(chalk.gray('  ✓ Cleaned WARP.md Clavix block'));
              continue;
            }
            if (integrationName === 'copilot-instructions') {
              await DocInjector.removeBlock('.github/copilot-instructions.md');
              this.log(chalk.gray('  ✓ Cleaned copilot-instructions.md Clavix block'));
              continue;
            }

            // Handle Claude Code (has CLAUDE.md doc injection)
            if (integrationName === 'claude-code') {
              await DocInjector.removeBlock('CLAUDE.md');
              this.log(chalk.gray('  ✓ Cleaned CLAUDE.md Clavix block'));
            }

            const adapter = agentManager.getAdapter(integrationName);
            if (adapter) {
              const removed = await adapter.removeAllCommands();
              this.log(chalk.gray(`  ✓ Removed ${removed} command(s) from ${adapter.displayName}`));
            }
          }
        } else if (cleanupAction === 'update') {
          // Add them back to selection
          selectedIntegrations.push(...deselectedIntegrations);
          this.log(chalk.gray('\n✓ Keeping all integrations\n'));
        }
        // If 'skip': do nothing
      }

      // Create .clavix directory structure
      this.log(chalk.cyan('\n📁 Creating directory structure...'));
      await this.createDirectoryStructure();

      // Generate config
      this.log(chalk.cyan('⚙️  Generating configuration...'));
      await this.generateConfig(selectedIntegrations);

      // Generate INSTRUCTIONS.md and QUICKSTART.md
      await this.generateInstructions();
      await this.generateQuickstart();

      // Generate commands for each selected integration
      this.log(
        chalk.cyan(
          `\n📝 Generating commands for ${selectedIntegrations.length} integration(s)...\n`
        )
      );

      for (const integrationName of selectedIntegrations) {
        // Handle agents-md separately (it's not an adapter)
        if (integrationName === 'agents-md') {
          this.log(chalk.gray('  ✓ Generating AGENTS.md...'));
          await AgentsMdGenerator.generate();
          continue;
        }

        // Handle copilot-instructions separately (it's not an adapter)
        if (integrationName === 'copilot-instructions') {
          this.log(chalk.gray('  ✓ Generating .github/copilot-instructions.md...'));
          await CopilotInstructionsGenerator.generate();
          continue;
        }

        // Handle octo-md separately (it's not an adapter)
        if (integrationName === 'octo-md') {
          this.log(chalk.gray('  ✓ Generating OCTO.md...'));
          await OctoMdGenerator.generate();
          continue;
        }

        if (integrationName === 'warp-md') {
          this.log(chalk.gray('  ✓ Generating WARP.md...'));
          await WarpMdGenerator.generate();
          continue;
        }

        let adapter: AgentAdapter = agentManager.requireAdapter(integrationName);

        this.log(chalk.gray(`  ✓ Generating ${adapter.displayName} commands...`));

        if (adapter.name === 'codex') {
          const codexPath = adapter.getCommandPath();
          const { confirmCodex } = await inquirer.prompt([
            {
              type: 'confirm',
              name: 'confirmCodex',
              message: `Codex commands will be generated at ${codexPath}. Continue?`,
              default: true,
            },
          ]);

          if (!confirmCodex) {
            this.log(chalk.yellow('    ⊗ Skipped Codex CLI'));
            continue;
          }
        }

        if (adapter.name === 'gemini' || adapter.name === 'qwen') {
          const defaultNamespacePath = path.join(`.${adapter.name}`, 'commands', 'clavix');
          const { useNamespace } = await inquirer.prompt([
            {
              type: 'confirm',
              name: 'useNamespace',
              message: `Store ${adapter.displayName} commands under ${defaultNamespacePath}? (Produces /clavix:<command> shortcuts)`,
              default: true,
            },
          ]);

          if (!useNamespace) {
            adapter =
              adapter.name === 'gemini'
                ? new GeminiAdapter({ useNamespace: false })
                : new QwenAdapter({ useNamespace: false });
            this.log(chalk.gray(`    → Using ${adapter.getCommandPath()} (no namespacing)`));
          }
        }

        // Validate before generating
        if (adapter.validate) {
          const validation = await adapter.validate();
          if (!validation.valid) {
            this.log(chalk.yellow(`    ⚠ Validation warnings for ${adapter.displayName}:`));
            validation.errors?.forEach((err) => this.log(chalk.yellow(`      - ${err}`)));

            const { continueAnyway } = await inquirer.prompt([
              {
                type: 'confirm',
                name: 'continueAnyway',
                message: 'Continue anyway?',
                default: false,
              },
            ]);

            if (!continueAnyway) {
              this.log(chalk.yellow(`    ⊗ Skipped ${adapter.displayName}`));
              continue;
            }
          }
        }

        // Remove all existing commands before regenerating (ensures clean state)
        const removed = await adapter.removeAllCommands();
        if (removed > 0) {
          this.log(chalk.gray(`    Removed ${removed} existing command(s)`));
        }

        // Generate slash commands
        const generatedTemplates = await this.generateSlashCommands(adapter);

        await this.handleLegacyCommands(adapter, generatedTemplates);

        if (adapter.name === 'gemini' || adapter.name === 'qwen') {
          const commandPath = adapter.getCommandPath();
          const isNamespaced = commandPath.endsWith(path.join('commands', 'clavix'));
          const namespace = isNamespaced ? path.basename(commandPath) : undefined;
          const commandNames = generatedTemplates.map((template) => {
            if (isNamespaced) {
              return `/${namespace}:${template.name}`;
            }

            const filename = adapter.getTargetFilename(template.name);
            const slashName = filename.slice(0, -adapter.fileExtension.length);
            return `/${slashName}`;
          });

          this.log(chalk.green(`    → Registered ${commandNames.join(', ')}`));
          this.log(chalk.gray(`    Commands saved to ${commandPath}`));
          this.log(chalk.gray('    Tip: reopen the CLI or run /help to refresh the command list.'));
        }

        // Inject documentation blocks (Claude Code only)
        if (integrationName === 'claude-code') {
          this.log(chalk.gray('  ✓ Injecting CLAUDE.md documentation...'));
          await this.injectDocumentation(adapter);
        }
      }

      // Generate .clavix/instructions/ folder for generic integrations
      if (InstructionsGenerator.needsGeneration(selectedIntegrations)) {
        this.log(chalk.gray('\n📁 Generating .clavix/instructions/ reference folder...'));
        await InstructionsGenerator.generate();
        this.log(chalk.gray('  ✓ Created detailed workflow guides for generic integrations'));
      }

      // Success message with prominent command format display
      this.log(chalk.bold.green('\n✅ Clavix initialized successfully!\n'));

      // Determine the primary command format based on selected integrations
      const colonTools = ['claude-code', 'gemini', 'qwen', 'crush', 'llxprt', 'augment'];
      const usesColon = selectedIntegrations.some((i) => colonTools.includes(i));
      const usesHyphen = selectedIntegrations.some((i) => !colonTools.includes(i));
      const separator = usesColon && !usesHyphen ? ':' : usesHyphen && !usesColon ? '-' : ':';
      const altSeparator = separator === ':' ? '-' : ':';

      // Show command format prominently at the TOP
      this.log(
        chalk.bold('📋 Your command format:'),
        chalk.bold.cyan(`/clavix${separator}improve`)
      );
      if (usesColon && usesHyphen) {
        this.log(
          chalk.gray('   (Some integrations use'),
          chalk.cyan(`/clavix${altSeparator}improve`),
          chalk.gray('instead)')
        );
      }
      this.log();

      // Available commands
      this.log(chalk.gray('Available slash commands:'));
      this.log(
        chalk.gray('  •'),
        chalk.cyan(`/clavix${separator}improve`),
        chalk.gray('- Smart prompt optimization')
      );
      this.log(
        chalk.gray('  •'),
        chalk.cyan(`/clavix${separator}prd`),
        chalk.gray('- Generate PRD through guided questions')
      );
      this.log(
        chalk.gray('  •'),
        chalk.cyan(`/clavix${separator}plan`),
        chalk.gray('- Create task breakdown from PRD')
      );
      this.log(
        chalk.gray('  •'),
        chalk.cyan(`/clavix${separator}implement`),
        chalk.gray('- Execute tasks or prompts')
      );

      this.log(chalk.gray('\nNext steps:'));
      this.log(chalk.gray('  • Slash commands are now available in your AI agent'));
      this.log(
        chalk.gray('  • Run'),
        chalk.cyan('clavix diagnose'),
        chalk.gray('to verify installation')
      );
      this.log();
    } catch (error: unknown) {
      const { getErrorMessage, toError } = await import('../../utils/error-utils.js');
      this.log(chalk.red('\n✗ Initialization failed:'), getErrorMessage(error));
      if (
        error &&
        typeof error === 'object' &&
        'hint' in error &&
        typeof (error as { hint: unknown }).hint === 'string'
      ) {
        this.log(chalk.yellow('  Hint:'), (error as { hint: string }).hint);
      }
      throw toError(error);
    }
  }

  /**
   * Regenerate commands for existing integrations (update mode)
   */
  private async regenerateCommands(
    agentManager: AgentManager,
    integrations: string[]
  ): Promise<void> {
    for (const integrationName of integrations) {
      // Handle doc generators (not adapters)
      if (integrationName === 'agents-md') {
        this.log(chalk.gray('  ✓ Regenerating AGENTS.md...'));
        await AgentsMdGenerator.generate();
        continue;
      }

      if (integrationName === 'copilot-instructions') {
        this.log(chalk.gray('  ✓ Regenerating .github/copilot-instructions.md...'));
        await CopilotInstructionsGenerator.generate();
        continue;
      }

      if (integrationName === 'octo-md') {
        this.log(chalk.gray('  ✓ Regenerating OCTO.md...'));
        await OctoMdGenerator.generate();
        continue;
      }

      if (integrationName === 'warp-md') {
        this.log(chalk.gray('  ✓ Regenerating WARP.md...'));
        await WarpMdGenerator.generate();
        continue;
      }

      // Handle regular adapters
      const adapter = agentManager.getAdapter(integrationName);
      if (!adapter) {
        this.log(chalk.yellow(`  ⚠ Unknown integration: ${integrationName}`));
        continue;
      }

      this.log(chalk.gray(`  ✓ Regenerating ${adapter.displayName} commands...`));

      // Remove existing commands before regenerating
      const removed = await adapter.removeAllCommands();
      if (removed > 0) {
        this.log(chalk.gray(`    Removed ${removed} existing command(s)`));
      }

      // Generate slash commands
      const templates = await this.generateSlashCommands(adapter);

      // Handle legacy command cleanup (silent in update mode)
      const commandNames = templates.map((template) => template.name);
      const legacyFiles = await collectLegacyCommandFiles(adapter, commandNames);
      if (legacyFiles.length > 0) {
        for (const file of legacyFiles) {
          await FileSystem.remove(file);
        }
        this.log(chalk.gray(`    Cleaned ${legacyFiles.length} legacy file(s)`));
      }

      // Re-inject documentation blocks (Claude Code only)
      if (integrationName === 'claude-code') {
        this.log(chalk.gray('  ✓ Updating CLAUDE.md documentation...'));
        await this.injectDocumentation(adapter);
      }
    }

    // Regenerate instructions folder if needed
    if (InstructionsGenerator.needsGeneration(integrations)) {
      this.log(chalk.gray('\n📁 Updating .clavix/instructions/ reference folder...'));
      await InstructionsGenerator.generate();
    }
  }

  private async createDirectoryStructure(): Promise<void> {
    const dirs = ['.clavix', '.clavix/outputs', '.clavix/templates'];

    for (const dir of dirs) {
      await FileSystem.ensureDir(dir);
    }
  }

  private async generateConfig(integrations: string[]): Promise<void> {
    const config: ClavixConfig = {
      ...DEFAULT_CONFIG,
      integrations,
    };

    const configPath = '.clavix/config.json';
    const configContent = JSON.stringify(config, null, 2);
    await FileSystem.writeFileAtomic(configPath, configContent);
  }

  private async generateInstructions(): Promise<void> {
    const instructions = `# Clavix Instructions

Welcome to Clavix! This directory contains your local Clavix configuration and data.

## Command Format

**Your command format depends on your AI tool:**

| Tool Type | Format | Example |
|-----------|--------|---------|
| **CLI tools** (Claude Code, Gemini, Qwen) | Colon (\`:\`) | \`/clavix:improve\` |
| **IDE extensions** (Cursor, Windsurf, Cline) | Hyphen (\`-\`) | \`/clavix-improve\` |

**Rule of thumb:** CLI tools use colon, IDE extensions use hyphen.

## Directory Structure

\`\`\`
.clavix/
├── config.json           # Your Clavix configuration
├── INSTRUCTIONS.md       # This file
├── instructions/         # Workflow instruction files for AI agents
├── outputs/
│   ├── <project-name>/  # Per-project outputs
│   │   ├── full-prd.md
│   │   ├── quick-prd.md
│   │   └── tasks.md
│   ├── prompts/         # Saved prompts for re-execution
│   └── archive/         # Archived completed projects
└── templates/           # Custom template overrides (optional)
\`\`\`

## Clavix Commands (v5)

### Setup Commands (CLI)

| Command | Purpose |
|---------|---------|
| \`clavix init\` | Initialize Clavix in a project |
| \`clavix update\` | Update templates after package update |
| \`clavix diagnose\` | Check installation health |
| \`clavix version\` | Show version |

### Workflow Commands (Slash Commands)

All workflows are executed via slash commands that AI agents read and follow:

| Slash Command | Purpose |
|---------------|---------|
| \`/clavix:improve\` | Optimize prompts (auto-selects depth) |
| \`/clavix:prd\` | Generate PRD through guided questions |
| \`/clavix:plan\` | Create task breakdown from PRD |
| \`/clavix:implement\` | Execute tasks or prompts (auto-detects source) |
| \`/clavix:start\` | Begin conversational session |
| \`/clavix:summarize\` | Extract requirements from conversation |
| \`/clavix:verify\` | Verify implementation |
| \`/clavix:archive\` | Archive completed projects |

**Note:** Running \`clavix init\` or \`clavix update\` will regenerate all slash commands from templates. Any manual edits to generated commands will be lost. If you need custom commands, create new command files instead of modifying generated ones.

**Command format varies by integration:**
- Claude Code, Gemini, Qwen: \`/clavix:improve\` (colon format)
- Cursor, Droid, Windsurf, etc.: \`/clavix-improve\` (hyphen format)

## Standard Workflow

**Clavix follows this progression:**

\`\`\`
PRD Creation → Task Planning → Implementation → Archive
\`\`\`

**Detailed steps:**

1. **Planning Phase**
   - Run: \`/clavix:prd\` or \`/clavix:start\` → \`/clavix:summarize\`
   - Output: \`.clavix/outputs/{project}/full-prd.md\` + \`quick-prd.md\`

2. **Task Preparation**
   - Run: \`/clavix:plan\` transforms PRD into curated task list
   - Output: \`.clavix/outputs/{project}/tasks.md\`

3. **Implementation Phase**
   - Run: \`/clavix:implement\`
   - Agent executes tasks systematically
   - Agent edits tasks.md directly to mark progress (\`- [ ]\` → \`- [x]\`)

4. **Completion**
   - Run: \`/clavix:archive\`
   - Archives completed work

**Key principle:** Planning workflows create documents. Implementation workflows write code.

## Prompt Lifecycle

1. **Optimize prompt**: \`/clavix:improve\` - Analyzes and improves your prompt
2. **Review**: Agent lists saved prompts from \`.clavix/outputs/prompts/\`
3. **Execute**: \`/clavix:implement --latest\` - Implement when ready
4. **Cleanup**: Agent deletes old prompt files from \`.clavix/outputs/prompts/\`

## When to Use Which Mode

- **Improve mode** (\`/clavix:improve\`): Smart prompt optimization with auto-depth selection
- **PRD mode** (\`/clavix:prd\`): Strategic planning with architecture and business impact
- **Conversational mode** (\`/clavix:start\` → \`/clavix:summarize\`): Natural discussion → extract structured requirements

## Customization

Create custom templates in \`.clavix/templates/\` to override defaults.

To reconfigure integrations, run \`clavix init\` again.

## Need Help?

- **Documentation**: https://github.com/ClavixDev/Clavix
- **Issues**: https://github.com/ClavixDev/Clavix/issues
- **Version**: Run \`clavix version\` to check your installed version
- **Update managed blocks**: Run \`clavix update\` to refresh documentation
`;

    await FileSystem.writeFileAtomic('.clavix/INSTRUCTIONS.md', instructions);
  }

  private async generateSlashCommands(adapter: AgentAdapter): Promise<CommandTemplate[]> {
    const templates = await loadCommandTemplates(adapter);

    await adapter.generateCommands(templates);
    return templates;
  }

  private async handleLegacyCommands(
    adapter: AgentAdapter,
    templates: CommandTemplate[]
  ): Promise<void> {
    const commandNames = templates.map((template) => template.name);
    const legacyFiles = await collectLegacyCommandFiles(adapter, commandNames);

    if (legacyFiles.length === 0) {
      return;
    }

    const relativePaths = legacyFiles
      .map((file) => path.relative(process.cwd(), file))
      .sort((a, b) => a.localeCompare(b));

    this.log(chalk.gray(`    ⚠ Found ${relativePaths.length} deprecated command file(s):`));
    for (const file of relativePaths) {
      this.log(chalk.gray(`      • ${file}`));
    }

    const { removeLegacy } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'removeLegacy',
        message: `Remove deprecated files for ${adapter.displayName}? Functionality is unchanged; filenames are being standardized.`,
        default: true,
      },
    ]);

    if (!removeLegacy) {
      this.log(chalk.gray('    ⊗ Kept legacy files (deprecated naming retained)'));
      return;
    }

    for (const file of legacyFiles) {
      await FileSystem.remove(file);
      this.log(chalk.gray(`    ✓ Removed ${path.relative(process.cwd(), file)}`));
    }
  }

  private async injectDocumentation(adapter: AgentAdapter): Promise<void> {
    // Inject AGENTS.md
    const agentsContent = DocInjector.getDefaultAgentsContent();
    await DocInjector.injectBlock('AGENTS.md', this.extractClavixBlock(agentsContent));

    // Inject CLAUDE.md if Claude Code selected
    if (adapter.name === 'claude-code') {
      const claudeContent = DocInjector.getDefaultClaudeContent();
      await DocInjector.injectBlock('CLAUDE.md', this.extractClavixBlock(claudeContent));
    }
  }

  private extractClavixBlock(content: string): string {
    const regex = new RegExp(`${CLAVIX_BLOCK_START}([\\s\\S]*?)${CLAVIX_BLOCK_END}`);
    const match = content.match(regex);
    return match ? match[1].trim() : content;
  }

  private async generateQuickstart(): Promise<void> {
    const quickstartPath = path.join(
      __dirname,
      '..',
      '..',
      'templates',
      'instructions',
      'QUICKSTART.md'
    );
    try {
      const quickstartContent = await FileSystem.readFile(quickstartPath);
      await FileSystem.writeFileAtomic('.clavix/QUICKSTART.md', quickstartContent);
    } catch {
      // QUICKSTART.md template not found or write failed, skip silently
      // This can happen in test environments or custom installations
    }
  }
}
