import { Command } from '@oclif/core';
import chalk from 'chalk';
import { PromptManager, PromptMetadata } from '../../../core/prompt-manager';

export default class PromptsList extends Command {
  static description = 'List all saved prompts with age warnings and storage statistics';

  static examples = [
    '<%= config.bin %> <%= command.id %>',
  ];

  async run(): Promise<void> {
    const promptManager = new PromptManager();

    try {
      const prompts = await promptManager.listPrompts();
      const stats = await promptManager.getStorageStats();

      console.log(chalk.bold.cyan(`\n📋 Saved Prompts (${prompts.length} total)\n`));

      if (prompts.length === 0) {
        console.log(chalk.gray('No prompts saved yet.\n'));
        console.log(chalk.cyan('Generate an optimized prompt:'));
        console.log(chalk.cyan('  /clavix:fast "your requirement"'));
        console.log(chalk.cyan('  /clavix:deep "your requirement"'));
        console.log();
        return;
      }

      // Display prompts grouped by source
      const fastPrompts = prompts.filter(p => p.source === 'fast');
      const deepPrompts = prompts.filter(p => p.source === 'deep');

      if (fastPrompts.length > 0) {
        console.log(chalk.bold('Fast Prompts:'));
        this.displayPrompts(fastPrompts);
        console.log();
      }

      if (deepPrompts.length > 0) {
        console.log(chalk.bold('Deep Prompts:'));
        this.displayPrompts(deepPrompts);
        console.log();
      }

      // Display storage statistics
      console.log(chalk.bold('📊 Storage Statistics:\n'));
      console.log(chalk.gray(`  Total Prompts: ${stats.totalPrompts}`));
      console.log(chalk.gray(`  Fast: ${stats.fastPrompts} | Deep: ${stats.deepPrompts}`));
      console.log(chalk.gray(`  Executed: ${stats.executedPrompts} | Pending: ${stats.pendingPrompts}`));

      if (stats.oldestPromptAge > 0) {
        console.log(chalk.gray(`  Oldest: ${stats.oldestPromptAge} days`));
      }
      console.log();

      // Storage hygiene recommendations
      if (stats.stalePrompts > 0) {
        console.log(chalk.yellow(`⚠️  ${stats.stalePrompts} stale prompts (>30 days old)`));
        console.log(chalk.yellow(`   Recommend: clavix prompts clear --stale\n`));
      }

      if (stats.executedPrompts >= 10) {
        console.log(chalk.cyan(`💡 ${stats.executedPrompts} executed prompts`));
        console.log(chalk.cyan(`   Recommend: clavix prompts clear --executed\n`));
      }

      if (stats.totalPrompts >= 20) {
        console.log(chalk.yellow(`⚠️  Storage approaching limit (${stats.totalPrompts}/recommended 20)`));
        console.log(chalk.yellow(`   Consider cleanup: clavix prompts clear\n`));
      }

    } catch (error) {
      console.log(chalk.red(`\n✗ Error: ${error}\n`));
    }
  }

  private displayPrompts(prompts: PromptMetadata[]): void {
    prompts.forEach(p => {
      const status = p.executed ? chalk.green('✓') : chalk.gray('○');
      const ageInDays = p.ageInDays || 0;

      // Age warning coloring
      let ageWarning = '';
      let ageStr = '';
      if (ageInDays === 0) {
        ageStr = chalk.gray('today');
      } else if (ageInDays > 30) {
        ageStr = chalk.red(`${ageInDays}d`);
        ageWarning = chalk.red(' [STALE]');
      } else if (ageInDays > 7) {
        ageStr = chalk.yellow(`${ageInDays}d`);
        ageWarning = chalk.yellow(' [OLD]');
      } else {
        ageStr = chalk.gray(`${ageInDays}d`);
      }

      // Truncate original prompt for display
      const promptPreview = p.originalPrompt.length > 50
        ? p.originalPrompt.substring(0, 50) + '...'
        : p.originalPrompt;

      console.log(`  ${status} ${chalk.dim(p.id)} (${ageStr})${ageWarning}`);
      console.log(`     ${chalk.gray(promptPreview)}`);
    });
  }
}
