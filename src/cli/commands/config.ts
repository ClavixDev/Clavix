import { Command, Args, Flags } from '@oclif/core';
import chalk from 'chalk';
import fs from 'fs-extra';
import * as path from 'path';
import inquirer from 'inquirer';
import { AgentManager } from '../../core/agent-manager.js';
import { ClavixConfig, DEFAULT_CONFIG, isLegacyConfig, migrateConfig } from '../../types/config.js';
import { loadCommandTemplates } from '../../utils/template-loader.js';

export default class Config extends Command {
  static description = 'Manage Clavix configuration';

  static examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> get providers',
    '<%= config.bin %> <%= command.id %> set preferences.verboseLogging true',
  ];

  static args = {
    action: Args.string({
      description: 'Action to perform (get, set, edit, reset)',
      options: ['get', 'set', 'edit', 'reset'],
      required: false,
    }),
    key: Args.string({
      description: 'Configuration key',
      required: false,
    }),
    value: Args.string({
      description: 'Configuration value (for set action)',
      required: false,
    }),
  };

  static flags = {
    global: Flags.boolean({
      char: 'g',
      description: 'Use global configuration (not implemented yet)',
      default: false,
    }),
  };

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Config);

    if (flags.global) {
      this.warn('Global configuration is not yet supported. Using project configuration.');
    }

    const clavixDir = path.join(process.cwd(), '.clavix');
    const configPath = path.join(clavixDir, 'config.json');

    if (!fs.existsSync(clavixDir) || !fs.existsSync(configPath)) {
      this.error(
        chalk.red('No .clavix directory found.') +
        '\n' +
        chalk.yellow('Run ') +
        chalk.cyan('clavix init') +
        chalk.yellow(' to initialize Clavix in this project.')
      );
    }

    // If no action specified, show interactive menu
    if (!args.action) {
      await this.showInteractiveMenu(configPath);
      return;
    }

    switch (args.action) {
      case 'get':
        await this.getConfig(configPath, args.key);
        break;
      case 'set':
        await this.setConfig(configPath, args.key, args.value);
        break;
      case 'edit':
        await this.editConfig(configPath);
        break;
      case 'reset':
        await this.resetConfig(configPath);
        break;
      default:
        this.error(chalk.red(`Unknown action: ${args.action}`));
    }
  }

  private async showInteractiveMenu(configPath: string): Promise<void> {
    let continueMenu = true;

    while (continueMenu) {
      const config = this.loadConfig(configPath);

      this.log(chalk.bold.cyan('\n⚙️  Clavix Configuration\n'));
      this.displayConfig(config);

      const { action } = await inquirer.prompt([
        {
          type: 'list',
          name: 'action',
          message: 'What would you like to do?',
          choices: [
            { name: 'View current configuration', value: 'view' },
            { name: 'Manage providers (add/remove)', value: 'providers' },
            { name: 'Edit preferences', value: 'edit-preferences' },
            { name: 'Reset to defaults', value: 'reset' },
            { name: 'Exit', value: 'exit' },
          ],
        },
      ]);

      switch (action) {
        case 'view':
          // Already displayed above
          break;
        case 'providers':
          await this.manageProviders(config, configPath);
          break;
        case 'edit-preferences':
          await this.editPreferences(configPath, config);
          break;
        case 'reset':
          await this.resetConfig(configPath);
          break;
        case 'exit':
          continueMenu = false;
          break;
      }
    }
  }

  private async manageProviders(config: ClavixConfig, configPath: string): Promise<void> {
    const agentManager = new AgentManager();

    while (true) {
      // Show current providers
      this.log(chalk.cyan('\n📦 Current Providers:'));
      if (config.providers.length === 0) {
        this.log(chalk.gray('  (none configured)'));
      } else {
        for (const providerName of config.providers) {
          const adapter = agentManager.getAdapter(providerName);
          const displayName = adapter?.displayName || providerName;
          this.log(chalk.gray(`  • ${displayName}`));
        }
      }

      // Submenu
      const { action } = await inquirer.prompt([
        {
          type: 'list',
          name: 'action',
          message: 'What would you like to do?',
          choices: [
            { name: 'Add provider', value: 'add' },
            { name: 'Remove provider', value: 'remove' },
            { name: 'Replace all providers', value: 'replace' },
            { name: 'Back to main menu', value: 'back' },
          ],
        },
      ]);

      if (action === 'back') break;

      switch (action) {
        case 'add':
          await this.addProviders(config, configPath);
          break;
        case 'remove':
          await this.removeProviders(config, configPath);
          break;
        case 'replace':
          await this.replaceProviders(config, configPath);
          break;
      }

      // Reload config after modifications
      config = this.loadConfig(configPath);
    }
  }

  private async addProviders(config: ClavixConfig, configPath: string): Promise<void> {
    const agentManager = new AgentManager();
    const allProviders = agentManager.getAdapters();

    // Show only non-selected providers
    const availableToAdd = allProviders.filter(
      (a) => !config.providers.includes(a.name)
    );

    if (availableToAdd.length === 0) {
      this.log(chalk.yellow('\n✓ All providers already added!'));
      return;
    }

    // Multi-select checkbox
    const { newProviders } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'newProviders',
        message: 'Select providers to add:',
        choices: availableToAdd.map((adapter) => ({
          name: `${adapter.displayName} (${adapter.directory})`,
          value: adapter.name,
        })),
      },
    ]);

    if (newProviders.length === 0) {
      this.log(chalk.gray('No providers selected'));
      return;
    }

    // Add to config
    config.providers.push(...newProviders);
    this.saveConfig(configPath, config);

    this.log(chalk.gray('\n🔧 Generating commands for new providers...'));

    // Generate commands for new providers
    for (const providerName of newProviders) {
      const adapter = agentManager.getAdapter(providerName);
      if (!adapter) continue;

      const templates = await loadCommandTemplates(adapter);
      await adapter.generateCommands(templates);
      this.log(chalk.green(`  ✓ Generated ${templates.length} command(s) for ${adapter.displayName}`));
    }

    this.log(chalk.green('\n✅ Providers added successfully!'));
  }

  private async removeProviders(config: ClavixConfig, configPath: string): Promise<void> {
    if (config.providers.length === 0) {
      this.log(chalk.yellow('\n⚠ No providers configured!'));
      return;
    }

    const agentManager = new AgentManager();

    // Multi-select from current providers
    const { providersToRemove } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'providersToRemove',
        message: 'Select providers to remove:',
        choices: config.providers.map((name) => {
          const adapter = agentManager.getAdapter(name);
          return {
            name: `${adapter?.displayName || name} (${adapter?.directory || 'unknown'})`,
            value: name,
          };
        }),
        validate: (answer: string[]) => {
          if (answer.length === config.providers.length) {
            return 'You must keep at least one provider. Use "Reset to defaults" to reconfigure completely.';
          }
          return true;
        },
      },
    ]);

    if (providersToRemove.length === 0) {
      this.log(chalk.gray('No providers selected'));
      return;
    }

    // Confirm cleanup
    const { cleanup } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'cleanup',
        message: 'Remove command files for these providers?',
        default: true,
      },
    ]);

    // Remove from config
    config.providers = config.providers.filter(
      (p) => !providersToRemove.includes(p)
    );
    this.saveConfig(configPath, config);

    // Clean up command files
    if (cleanup) {
      this.log(chalk.gray('\n🗑️  Cleaning up command files...'));
      for (const providerName of providersToRemove) {
        const adapter = agentManager.getAdapter(providerName);
        if (adapter) {
          const removed = await adapter.removeAllCommands();
          this.log(chalk.gray(`  ✓ Removed ${removed} command(s) from ${adapter.displayName}`));
        }
      }
    }

    this.log(chalk.green('\n✅ Providers removed successfully!'));
  }

  private async replaceProviders(config: ClavixConfig, configPath: string): Promise<void> {
    const agentManager = new AgentManager();

    // Use shared provider selector
    const { selectProviders } = await import('../../utils/provider-selector.js');
    const newProviders = await selectProviders(agentManager, config.providers);

    if (newProviders.length === 0) {
      this.log(chalk.gray('No providers selected'));
      return;
    }

    // Find deselected providers
    const deselected = config.providers.filter((p) => !newProviders.includes(p));

    // Handle cleanup if providers were deselected
    if (deselected.length > 0) {
      this.log(chalk.yellow('\n⚠ Previously configured but not selected:'));
      for (const providerName of deselected) {
        const adapter = agentManager.getAdapter(providerName);
        const displayName = adapter?.displayName || providerName;
        const directory = adapter?.directory || 'unknown';
        this.log(chalk.gray(`  • ${displayName} (${directory})`));
      }

      const { cleanupAction } = await inquirer.prompt([
        {
          type: 'list',
          name: 'cleanupAction',
          message: 'What would you like to do with these providers?',
          choices: [
            { name: 'Clean up (remove all command files)', value: 'cleanup' },
            { name: 'Skip (leave as-is)', value: 'skip' },
          ],
        },
      ]);

      if (cleanupAction === 'cleanup') {
        this.log(chalk.gray('\n🗑️  Cleaning up deselected providers...'));
        for (const providerName of deselected) {
          const adapter = agentManager.getAdapter(providerName);
          if (adapter) {
            const removed = await adapter.removeAllCommands();
            this.log(chalk.gray(`  ✓ Removed ${removed} command(s) from ${adapter.displayName}`));
          }
        }
      }
    }

    // Update config
    config.providers = newProviders;
    this.saveConfig(configPath, config);

    // Prompt to run update
    const { runUpdate } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'runUpdate',
        message: 'Run update to regenerate all commands?',
        default: true,
      },
    ]);

    if (runUpdate) {
      this.log(chalk.gray('\n🔧 Regenerating commands for all providers...\n'));
      const Update = (await import('./update.js')).default;
      await Update.run([]);
    }

    this.log(chalk.green('\n✅ Providers replaced successfully!'));
  }

  private async getConfig(configPath: string, key?: string): Promise<void> {
    const config = this.loadConfig(configPath);

    if (!key) {
      this.log(chalk.bold.cyan('⚙️  Current Configuration\n'));
      this.displayConfig(config);
      return;
    }

    const value = this.getNestedValue(config as unknown as Record<string, unknown>, key);

    if (value === undefined) {
      this.error(chalk.red(`Configuration key "${key}" not found`));
    }

    this.log(chalk.cyan(key) + chalk.gray(': ') + JSON.stringify(value, null, 2));
  }

  private async setConfig(configPath: string, key?: string, value?: string): Promise<void> {
    if (!key || value === undefined) {
      this.error('Usage: clavix config set <key> <value>');
    }

    const config = this.loadConfig(configPath);

    // Parse value as JSON if possible
    let parsedValue: unknown;
    try {
      parsedValue = JSON.parse(value);
    } catch {
      parsedValue = value;
    }

    this.setNestedValue(config as unknown as Record<string, unknown>, key, parsedValue);
    this.saveConfig(configPath, config);

    this.log(chalk.green(`✅ Set ${chalk.cyan(key)} to ${JSON.stringify(parsedValue)}`));
  }

  private async editConfig(configPath: string): Promise<void> {
    const config = this.loadConfig(configPath);
    await this.editPreferences(configPath, config);
  }

  private async resetConfig(configPath: string): Promise<void> {
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: 'Are you sure you want to reset configuration to defaults?',
        default: false,
      },
    ]);

    if (!confirm) {
      this.log(chalk.gray('Cancelled'));
      return;
    }

    const config = this.loadConfig(configPath);
    const defaultConfig = {
      ...DEFAULT_CONFIG,
      providers: config.providers, // Keep existing providers
    };

    this.saveConfig(configPath, defaultConfig);
    this.log(chalk.green('✅ Configuration reset to defaults (providers preserved)'));
  }

  private async editPreferences(configPath: string, config: ClavixConfig): Promise<void> {
    const preferences = config.preferences || DEFAULT_CONFIG.preferences;

    const answers = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'autoOpenOutputs',
        message: 'Auto-open generated outputs?',
        default: preferences.autoOpenOutputs,
      },
      {
        type: 'confirm',
        name: 'verboseLogging',
        message: 'Enable verbose logging?',
        default: preferences.verboseLogging,
      },
      {
        type: 'confirm',
        name: 'preserveSessions',
        message: 'Preserve completed sessions?',
        default: preferences.preserveSessions,
      },
    ]);

    config.preferences = answers;
    this.saveConfig(configPath, config);

    this.log(chalk.green('\n✅ Preferences updated'));
  }

  private loadConfig(configPath: string): ClavixConfig {
    try {
      const rawConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

      // Check if legacy config and migrate
      if (isLegacyConfig(rawConfig)) {
        this.warn(chalk.yellow('Detected legacy config format. Migrating to new format...'));
        const migratedConfig = migrateConfig(rawConfig);
        this.saveConfig(configPath, migratedConfig);
        return migratedConfig;
      }

      return rawConfig as ClavixConfig;
    } catch (error) {
      this.error(chalk.red(`Failed to load configuration: ${(error as Error).message}`));
    }
  }

  private saveConfig(configPath: string, config: ClavixConfig): void {
    try {
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    } catch (error) {
      this.error(chalk.red(`Failed to save configuration: ${(error as Error).message}`));
    }
  }

  private displayConfig(config: ClavixConfig): void {
    this.log(`  ${chalk.gray('Version:')} ${config.version}`);
    this.log(`  ${chalk.gray('Providers:')} ${config.providers.map(p => chalk.cyan(p)).join(', ') || chalk.gray('(none)')}`);

    if (config.preferences) {
      this.log(`\n  ${chalk.bold('Preferences:')}`);
      this.log(`    ${chalk.gray('Auto-open outputs:')} ${config.preferences.autoOpenOutputs ? chalk.green('yes') : chalk.gray('no')}`);
      this.log(`    ${chalk.gray('Verbose logging:')} ${config.preferences.verboseLogging ? chalk.green('yes') : chalk.gray('no')}`);
      this.log(`    ${chalk.gray('Preserve sessions:')} ${config.preferences.preserveSessions ? chalk.green('yes') : chalk.gray('no')}`);
    }

    if (config.outputs) {
      this.log(`\n  ${chalk.bold('Outputs:')}`);
      this.log(`    ${chalk.gray('Path:')} ${config.outputs.path}`);
      this.log(`    ${chalk.gray('Format:')} ${config.outputs.format}`);
    }

    this.log('');
  }

  private getNestedValue(obj: Record<string, unknown>, path: string): unknown {
    return path.split('.').reduce((current: unknown, key: string) => {
      if (current && typeof current === 'object' && key in current) {
        return (current as Record<string, unknown>)[key];
      }
      return undefined;
    }, obj as unknown);
  }

  private setNestedValue(obj: Record<string, unknown>, path: string, value: unknown): void {
    const keys = path.split('.');
    const lastKey = keys.pop()!;
    const target = keys.reduce((current: Record<string, unknown>, key: string) => {
      if (!current[key]) current[key] = {};
      return current[key] as Record<string, unknown>;
    }, obj);
    target[lastKey] = value;
  }
}
