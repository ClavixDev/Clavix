import { Command } from '@oclif/core';
import chalk from 'chalk';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs-extra';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default class Version extends Command {
  static description = 'Display Clavix version';

  static examples = ['<%= config.bin %> <%= command.id %>'];

  async run(): Promise<void> {
    try {
      const packageJsonPath = path.join(__dirname, '../../../package.json');
      const packageJson = await fs.readJson(packageJsonPath);

      this.log(chalk.cyan(`\nClavix v${packageJson.version}\n`));
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error reading package.json';
      this.error(
        chalk.red('Could not determine version') +
          '\n' +
          chalk.gray(`  Error: ${errorMessage}`) +
          '\n' +
          chalk.yellow('  Hint: Try reinstalling Clavix with ') +
          chalk.cyan('npm install -g clavix')
      );
    }
  }
}
