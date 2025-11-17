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

      console.log(chalk.cyan(`\nClavix v${packageJson.version}\n`));
    } catch {
      console.log(chalk.red('\n✗ Could not determine version\n'));
    }
  }
}
