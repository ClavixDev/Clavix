import { Command } from '@oclif/core';
import chalk from 'chalk';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs-extra';
import { AgentManager } from '../../core/agent-manager.js';
import { FileSystem } from '../../utils/file-system.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface DiagnoseResult {
  status: 'pass' | 'warn' | 'fail';
  message: string;
  details?: string;
}

export default class Diagnose extends Command {
  static description = 'Diagnose Clavix installation and configuration';

  static examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> # Check setup and report issues',
  ];

  async run(): Promise<void> {
    this.log(chalk.bold.cyan('\n🔍 Clavix Diagnostic Report\n'));

    const results: DiagnoseResult[] = [];

    // 1. Check version
    results.push(await this.checkVersion());

    // 2. Check .clavix directory
    results.push(await this.checkClavixDir());

    // 3. Check config.json
    results.push(await this.checkConfig());

    // 4. Check integrations
    results.push(...(await this.checkIntegrations()));

    // 5. Check templates
    results.push(await this.checkTemplates());

    // Note: Slash commands are checked per-integration in checkIntegrations()
    // No separate checkSlashCommands() - commands are in adapter-specific directories

    // Print results
    this.log(chalk.gray('─'.repeat(50)));
    this.log(chalk.bold('\nResults:\n'));

    let passCount = 0;
    let warnCount = 0;
    let failCount = 0;

    for (const result of results) {
      const icon =
        result.status === 'pass'
          ? chalk.green('✓')
          : result.status === 'warn'
            ? chalk.yellow('⚠')
            : chalk.red('✗');

      const color =
        result.status === 'pass'
          ? chalk.green
          : result.status === 'warn'
            ? chalk.yellow
            : chalk.red;

      this.log(`  ${icon} ${color(result.message)}`);
      if (result.details) {
        this.log(chalk.gray(`    ${result.details}`));
      }

      if (result.status === 'pass') passCount++;
      else if (result.status === 'warn') warnCount++;
      else failCount++;
    }

    // Summary
    this.log('\n' + chalk.gray('─'.repeat(50)));
    this.log(
      chalk.bold(
        `\nSummary: ${chalk.green(passCount + ' passed')}, ${chalk.yellow(warnCount + ' warnings')}, ${chalk.red(failCount + ' failed')}\n`
      )
    );

    // Recommendations
    if (failCount > 0) {
      this.log(chalk.yellow('Recommendations:'));
      this.log(chalk.gray('  • Run `clavix init` to initialize or repair installation'));
      this.log(chalk.gray('  • Run `clavix update` to sync templates\n'));
    } else if (warnCount > 0) {
      this.log(chalk.cyan('Tip: Run `clavix update` to resolve warnings\n'));
    } else {
      this.log(chalk.green('✨ All checks passed! Clavix is ready to use.\n'));
    }
  }

  private async checkVersion(): Promise<DiagnoseResult> {
    try {
      const packageJsonPath = path.join(__dirname, '../../../package.json');
      const packageJson = await fs.readJson(packageJsonPath);
      return {
        status: 'pass',
        message: `Version: v${packageJson.version}`,
      };
    } catch {
      return {
        status: 'fail',
        message: 'Could not determine version',
        details: 'package.json not found',
      };
    }
  }

  private async checkClavixDir(): Promise<DiagnoseResult> {
    const clavixDir = path.join(process.cwd(), '.clavix');

    if (!(await FileSystem.exists(clavixDir))) {
      return {
        status: 'fail',
        message: '.clavix directory not found',
        details: 'Run `clavix init` to initialize',
      };
    }

    // Check for essential subdirectory (outputs is always created)
    // Note: 'instructions' is only created when generic integrations are used
    // Note: 'commands' doesn't exist - commands go to adapter-specific directories
    const outputsDir = path.join(clavixDir, 'outputs');
    if (!(await FileSystem.exists(outputsDir))) {
      return {
        status: 'warn',
        message: '.clavix directory incomplete',
        details: 'Missing: outputs',
      };
    }

    return {
      status: 'pass',
      message: '.clavix directory OK',
    };
  }

  private async checkConfig(): Promise<DiagnoseResult> {
    const configPath = path.join(process.cwd(), '.clavix', 'config.json');

    if (!(await FileSystem.exists(configPath))) {
      return {
        status: 'fail',
        message: 'config.json not found',
        details: 'Run `clavix init` to create configuration',
      };
    }

    try {
      const config = await fs.readJson(configPath);

      if (!config.version) {
        return {
          status: 'warn',
          message: 'config.json missing version field',
        };
      }

      if (!config.integrations || config.integrations.length === 0) {
        return {
          status: 'warn',
          message: 'No integrations configured',
          details: 'Run `clavix init` to add integrations',
        };
      }

      return {
        status: 'pass',
        message: `config.json OK (${config.integrations.length} integration(s))`,
      };
    } catch (error) {
      return {
        status: 'fail',
        message: 'config.json is invalid',
        details: `${error}`,
      };
    }
  }

  // Doc generators are integrations that generate documentation files, not adapters
  private static readonly DOC_GENERATORS = [
    'agents-md',
    'octo-md',
    'warp-md',
    'copilot-instructions',
  ];

  private getDocGeneratorFile(integration: string): string {
    switch (integration) {
      case 'agents-md':
        return 'AGENTS.md';
      case 'octo-md':
        return 'OCTO.md';
      case 'warp-md':
        return 'WARP.md';
      case 'copilot-instructions':
        return path.join('.github', 'copilot-instructions.md');
      default:
        return '';
    }
  }

  private getDocGeneratorName(integration: string): string {
    switch (integration) {
      case 'agents-md':
        return 'AGENTS.md';
      case 'octo-md':
        return 'OCTO.md';
      case 'warp-md':
        return 'WARP.md';
      case 'copilot-instructions':
        return 'GitHub Copilot';
      default:
        return integration;
    }
  }

  private async checkIntegrations(): Promise<DiagnoseResult[]> {
    const results: DiagnoseResult[] = [];
    const configPath = path.join(process.cwd(), '.clavix', 'config.json');

    if (!(await FileSystem.exists(configPath))) {
      return results;
    }

    try {
      const config = await fs.readJson(configPath);
      const agentManager = new AgentManager();

      for (const integrationName of config.integrations || []) {
        // Handle doc generators specially (they don't have adapters)
        if (Diagnose.DOC_GENERATORS.includes(integrationName)) {
          const docFile = this.getDocGeneratorFile(integrationName);
          const docPath = path.join(process.cwd(), docFile);

          if (await FileSystem.exists(docPath)) {
            results.push({
              status: 'pass',
              message: `${this.getDocGeneratorName(integrationName)}: Generated`,
              details: docFile,
            });
          } else {
            results.push({
              status: 'warn',
              message: `${this.getDocGeneratorName(integrationName)}: Not generated`,
              details: `Run \`clavix update\` to generate`,
            });
          }
          continue;
        }

        // Handle adapters (integrations with command generation)
        const adapter = agentManager.getAdapter(integrationName);

        if (!adapter) {
          results.push({
            status: 'warn',
            message: `Unknown integration: ${integrationName}`,
            details: 'May be removed in a future version',
          });
          continue;
        }

        // Check if adapter's command directory exists
        const commandPath = adapter.getCommandPath();
        const commandDirExists = await FileSystem.exists(commandPath);

        if (commandDirExists) {
          const files = await FileSystem.listFiles(commandPath);
          const commandCount = files.filter(
            (f: string) => f.endsWith('.md') || f.endsWith('.toml') || f.endsWith('.mdc')
          ).length;

          results.push({
            status: 'pass',
            message: `${adapter.displayName}: ${commandCount} command(s)`,
            details: commandPath,
          });
        } else {
          results.push({
            status: 'warn',
            message: `${adapter.displayName}: commands not generated`,
            details: `Run \`clavix update\` to generate`,
          });
        }
      }
    } catch {
      // Config read error handled elsewhere
    }

    return results;
  }

  private async checkTemplates(): Promise<DiagnoseResult> {
    const templateDir = path.join(__dirname, '../../templates');

    if (!(await FileSystem.exists(templateDir))) {
      return {
        status: 'fail',
        message: 'Template directory not found',
        details: 'Package may be corrupted',
      };
    }

    // Check for canonical templates
    const canonicalDir = path.join(templateDir, 'slash-commands', '_canonical');
    if (!(await FileSystem.exists(canonicalDir))) {
      return {
        status: 'warn',
        message: 'Canonical templates missing',
        details: 'Try reinstalling clavix',
      };
    }

    const requiredTemplates = ['improve.md', 'prd.md', 'plan.md', 'implement.md'];
    const missing: string[] = [];

    for (const template of requiredTemplates) {
      const templatePath = path.join(canonicalDir, template);
      if (!(await FileSystem.exists(templatePath))) {
        missing.push(template);
      }
    }

    if (missing.length > 0) {
      return {
        status: 'warn',
        message: 'Some canonical templates missing',
        details: missing.join(', '),
      };
    }

    return {
      status: 'pass',
      message: 'Package templates OK',
    };
  }
}
