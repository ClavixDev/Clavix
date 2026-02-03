import { Command, Flags } from '@oclif/core';
import chalk from 'chalk';
import { Prompts } from '../../clean/prompts.js';
import { Cleaner } from '../../clean/cleaner.js';
import { Discovery } from '../../clean/discovery.js';
import { Scanner } from '../../clean/scanner.js';
import { CleanScope, ScanMethod } from '../../clean/types.js';

export default class Clean extends Command {
  static description = 'Remove all Clavix-created artifacts';

  static examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> --dry-run',
  ];

  static flags = {
    'dry-run': Flags.boolean({
      description: 'Show what would be deleted without making changes',
    }),
  };

  async run(): Promise<void> {
    this.log(chalk.bold.cyan('\n🧹 Clavix Cleanup\n'));

    const { flags } = await this.parse(Clean);

    try {
      const scope = await Prompts.selectScope();

      if (scope === CleanScope.CURRENT_PROJECT) {
        await this.cleanCurrentProject(flags['dry-run']);
      } else {
        await this.cleanEverything(flags['dry-run']);
      }

      this.log(chalk.green('\n✅ Cleanup complete\n'));
    } catch (error: unknown) {
      const { getErrorMessage } = await import('../../utils/error-utils.js');
      const errorMsg = getErrorMessage(error);

      // Don't show error if user cancelled
      if (errorMsg !== 'Cleanup cancelled by user') {
        this.log(chalk.red('\n✗ Cleanup failed:'), errorMsg);
      }
      throw error;
    } finally {
      // Ensure process exits - critical for CLI commands
      setImmediate(() => {
        process.exit(0);
      });
    }
  }

  private async cleanCurrentProject(dryRun: boolean): Promise<void> {
    const targets = await Discovery.findArtifacts(process.cwd());

    if (targets.length === 0) {
      this.log(chalk.gray('  No Clavix artifacts found in current project.\n'));
      return;
    }

    const batch = { location: process.cwd(), targets };
    const proceed = await Prompts.confirmBatch(batch, dryRun);

    if (!proceed) {
      this.log(chalk.gray('  Skipped.\n'));
      return;
    }

    const result = await Cleaner.cleanBatch(batch, dryRun);
    this.reportResult(result);
  }

  private async cleanEverything(dryRun: boolean): Promise<void> {
    const method = await Prompts.selectScanMethod();

    if (method === ScanMethod.ALL_DIRECTORIES) {
      const warned = await Prompts.confirmScanWarning();
      if (!warned) {
        this.log(chalk.gray('  Cancelled.\n'));
        return;
      }
    }

    let projectPaths: string[] = [];

    if (method === ScanMethod.SPECIFIC_PATHS) {
      projectPaths = await Prompts.getCustomPaths();
    } else if (method === ScanMethod.ALL_DIRECTORIES) {
      this.log(chalk.cyan('  Scanning for projects with Clavix artifacts...\n'));
      projectPaths = await Scanner.findProjects(ScanMethod.ALL_DIRECTORIES);

      if (projectPaths.length === 0) {
        this.log(chalk.gray('  No Clavix projects found.\n'));
      } else {
        this.log(chalk.gray(`  Found ${projectPaths.length} project(s) with Clavix artifacts.\n`));
      }
    }

    // Clean each project
    for (const projectPath of projectPaths) {
      const targets = await Discovery.findArtifacts(projectPath);
      if (targets.length > 0) {
        const batch = { location: projectPath, targets };
        const proceed = await Prompts.confirmBatch(batch, dryRun);
        if (proceed) {
          await Cleaner.cleanBatch(batch, dryRun);
        }
      }
    }

    // Clean global locations
    this.log(chalk.cyan('\n🌍 Cleaning global Clavix artifacts...\n'));
    const globalResult = await Cleaner.cleanGlobal(dryRun);
    this.reportResult(globalResult);
  }

  private reportResult(result: { deleted: number; skipped: number; errors: string[] }): void {
    if (result.deleted > 0) {
      this.log(chalk.green(`  ✓ Deleted ${result.deleted} item(s)`));
    }
    if (result.skipped > 0) {
      this.log(chalk.gray(`    Skipped ${result.skipped} item(s) (dry run)`));
    }
    if (result.errors.length > 0) {
      this.log(chalk.red(`  ⚠ ${result.errors.length} error(s) occurred:`));
      for (const err of result.errors) {
        this.log(chalk.red(`    ${err}`));
      }
    }
    this.log();
  }
}
