import { Command, Flags } from '@oclif/core';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { PromptManager, PromptFilters } from '../../../core/prompt-manager.js';

export default class PromptsClear extends Command {
  static description = 'Clear saved prompts with safety checks';

  static examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> --fast',
    '<%= config.bin %> <%= command.id %> --deep',
    '<%= config.bin %> <%= command.id %> --executed',
    '<%= config.bin %> <%= command.id %> --stale',
    '<%= config.bin %> <%= command.id %> --all',
  ];

  static flags = {
    fast: Flags.boolean({
      description: 'Clear all fast prompts',
      default: false,
    }),
    deep: Flags.boolean({
      description: 'Clear all deep prompts',
      default: false,
    }),
    executed: Flags.boolean({
      description: 'Clear executed prompts only (safe)',
      default: false,
    }),
    stale: Flags.boolean({
      description: 'Clear stale prompts (>30 days old)',
      default: false,
    }),
    all: Flags.boolean({
      description: 'Clear all prompts (with confirmation)',
      default: false,
    }),
    force: Flags.boolean({
      description: 'Skip confirmation prompts',
      default: false,
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(PromptsClear);
    const promptManager = new PromptManager();

    try {
      // Build filters
      const filters: PromptFilters = {};

      if (flags.fast && !flags.deep) {
        filters.source = 'fast';
      } else if (flags.deep && !flags.fast) {
        filters.source = 'deep';
      }

      if (flags.executed) {
        filters.executed = true;
      }

      if (flags.stale) {
        filters.stale = true;
      }

      // Interactive mode
      if (!flags.fast && !flags.deep && !flags.executed && !flags.stale && !flags.all) {
        await this.interactiveClear(promptManager);
        return;
      }

      // Get prompts that will be deleted
      const toDelete = await promptManager.listPrompts(filters);

      if (toDelete.length === 0) {
        console.log(chalk.yellow('\n⚠️  No prompts match the specified criteria\n'));
        return;
      }

      // Display what will be deleted
      console.log(chalk.bold.cyan(`\n📋 Prompts to Delete (${toDelete.length}):\n`));
      toDelete.forEach(p => {
        const status = p.executed ? chalk.green('✓') : chalk.gray('○');
        const age = p.ageInDays === 0 ? 'today' : `${p.ageInDays}d ago`;
        console.log(`  ${status} [${p.source}] ${p.id} (${age})`);
        console.log(`     ${chalk.gray(p.originalPrompt.substring(0, 60))}...`);
      });
      console.log();

      // Safety check for unexecuted prompts
      const unexecuted = toDelete.filter(p => !p.executed);
      if (unexecuted.length > 0 && !flags.force) {
        console.log(chalk.yellow(`⚠️  Warning: ${unexecuted.length} unexecuted prompts will be deleted\n`));

        const { proceed } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'proceed',
            message: 'Delete unexecuted prompts?',
            default: false,
          },
        ]);

        if (!proceed) {
          console.log(chalk.gray('\nCancelled. No prompts were deleted.\n'));
          return;
        }
      }

      // Final confirmation for --all
      if (flags.all && !flags.force) {
        const { confirm } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'confirm',
            message: chalk.red('Delete ALL prompts? This cannot be undone.'),
            default: false,
          },
        ]);

        if (!confirm) {
          console.log(chalk.gray('\nCancelled. No prompts were deleted.\n'));
          return;
        }
      }

      // Delete prompts
      const deleted = await promptManager.deletePrompts(filters);

      console.log(chalk.green(`\n✓ Deleted ${deleted} prompt(s)\n`));

      // Show remaining stats
      const stats = await promptManager.getStorageStats();
      if (stats.totalPrompts > 0) {
        console.log(chalk.gray(`Remaining prompts: ${stats.totalPrompts}`));
        console.log(chalk.gray(`  Fast: ${stats.fastPrompts} | Deep: ${stats.deepPrompts}`));
        console.log(chalk.gray(`  Executed: ${stats.executedPrompts} | Pending: ${stats.pendingPrompts}\n`));
      }

    } catch (error) {
      console.log(chalk.red(`\n✗ Error: ${error}\n`));
    }
  }

  private async interactiveClear(manager: PromptManager): Promise<void> {
    const allPrompts = await manager.listPrompts();

    if (allPrompts.length === 0) {
      console.log(chalk.yellow('\n⚠️  No prompts to clear\n'));
      return;
    }

    console.log(chalk.bold.cyan(`\n📋 Clear Saved Prompts\n`));

    const choices = [
      { name: 'Executed prompts only (safe)', value: 'executed' },
      { name: 'Stale prompts (>30 days old)', value: 'stale' },
      { name: 'Old prompts (>7 days old)', value: 'old' },
      { name: 'Fast prompts only', value: 'fast' },
      { name: 'Deep prompts only', value: 'deep' },
      { name: chalk.red('All prompts (dangerous)'), value: 'all' },
      { name: 'Cancel', value: 'cancel' },
    ];

    const { selection } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selection',
        message: 'What would you like to clear?',
        choices,
      },
    ]);

    if (selection === 'cancel') {
      console.log(chalk.gray('\nCancelled.\n'));
      return;
    }

    // Build filters based on selection
    const filters: PromptFilters = {};

    if (selection === 'executed') {
      filters.executed = true;
    } else if (selection === 'stale') {
      filters.stale = true;
    } else if (selection === 'old') {
      filters.old = true;
    } else if (selection === 'fast') {
      filters.source = 'fast';
    } else if (selection === 'deep') {
      filters.source = 'deep';
    }
    // 'all' means no filters

    // Get matching prompts
    const toDelete = selection === 'all'
      ? allPrompts
      : await manager.listPrompts(filters);

    if (toDelete.length === 0) {
      console.log(chalk.yellow('\n⚠️  No prompts match the selected criteria\n'));
      return;
    }

    // Show preview
    console.log(chalk.cyan(`\nWill delete ${toDelete.length} prompt(s):\n`));
    toDelete.slice(0, 5).forEach(p => {
      const status = p.executed ? chalk.green('✓') : chalk.gray('○');
      console.log(`  ${status} [${p.source}] ${p.id}`);
    });

    if (toDelete.length > 5) {
      console.log(chalk.gray(`  ... and ${toDelete.length - 5} more`));
    }
    console.log();

    // Confirm deletion
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: `Delete ${toDelete.length} prompt(s)?`,
        default: false,
      },
    ]);

    if (!confirm) {
      console.log(chalk.gray('\nCancelled. No prompts were deleted.\n'));
      return;
    }

    // Delete
    const deleted = await manager.deletePrompts(filters);
    console.log(chalk.green(`\n✓ Deleted ${deleted} prompt(s)\n`));

    // Show remaining
    const stats = await manager.getStorageStats();
    if (stats.totalPrompts > 0) {
      console.log(chalk.gray(`Remaining: ${stats.totalPrompts} prompt(s)\n`));
    } else {
      console.log(chalk.gray('All prompts cleared.\n'));
    }
  }
}
