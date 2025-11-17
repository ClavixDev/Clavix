import { Command, Flags } from '@oclif/core';
import chalk from 'chalk';
import fs from 'fs-extra';
import * as path from 'path';
import { SessionManager } from '../../core/session-manager.js';

export default class List extends Command {
  static description = 'List sessions and outputs';

  static examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> --sessions',
    '<%= config.bin %> <%= command.id %> --outputs',
    '<%= config.bin %> <%= command.id %> --project my-feature',
  ];

  static flags = {
    sessions: Flags.boolean({
      char: 's',
      description: 'List only sessions',
      default: false,
    }),
    outputs: Flags.boolean({
      char: 'o',
      description: 'List only outputs',
      default: false,
    }),
    archived: Flags.boolean({
      char: 'a',
      description: 'Include archived projects in outputs',
      default: false,
    }),
    project: Flags.string({
      char: 'p',
      description: 'Filter by project name',
    }),
    limit: Flags.integer({
      char: 'l',
      description: 'Limit number of results',
      default: 20,
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(List);

    const clavixDir = path.join(process.cwd(), '.clavix');

    if (!fs.existsSync(clavixDir)) {
      this.error(
        chalk.red('No .clavix directory found.') +
        '\n' +
        chalk.yellow('Run ') +
        chalk.cyan('clavix init') +
        chalk.yellow(' to initialize Clavix in this project.')
      );
    }

    // If no specific flag is set, show both
    const showSessions = flags.sessions || (!flags.outputs && !flags.sessions);
    const showOutputs = flags.outputs || (!flags.outputs && !flags.sessions);

    if (showSessions) {
      await this.listSessions(flags.project, flags.limit);
    }

    if (showOutputs) {
      if (showSessions) {
        this.log(''); // Add spacing
      }
      await this.listOutputs(flags.project, flags.limit, flags.archived);
    }
  }

  private async listSessions(projectFilter?: string, limit?: number): Promise<void> {
    this.log(chalk.bold.cyan('📋 Sessions\n'));

    const sessionManager = new SessionManager();
    const sessions = await sessionManager.listSessions();

    if (sessions.length === 0) {
      this.log(chalk.gray('  No sessions found.'));
      this.log(chalk.gray('  Run ') + chalk.cyan('clavix start') + chalk.gray(' to create a new session.'));
      return;
    }

    // Filter by project if specified
    let filteredSessions = sessions;
    if (projectFilter) {
      filteredSessions = sessions.filter(s =>
        s.projectName?.toLowerCase().includes(projectFilter.toLowerCase())
      );
    }

    // Sort by updated date (most recent first)
    filteredSessions.sort((a, b) =>
      new Date(b.updated).getTime() - new Date(a.updated).getTime()
    );

    // Apply limit
    if (limit) {
      filteredSessions = filteredSessions.slice(0, limit);
    }

    if (filteredSessions.length === 0) {
      this.log(chalk.gray(`  No sessions found matching "${projectFilter}".`));
      return;
    }

    // Display sessions in a table-like format
    filteredSessions.forEach((session, index) => {
      const isActive = session.status === 'active';
      const statusIcon = isActive ? '🟢' : '⚪';
      const projectName = session.projectName || 'untitled';
      const created = new Date(session.created).toLocaleDateString();
      const updated = new Date(session.updated).toLocaleString();
      const messageCount = session.messageCount || 0;

      this.log(
        `  ${statusIcon} ${chalk.bold(projectName)} ${chalk.gray(`(${session.id})`)}` +
        `\n     ${chalk.gray('Created:')} ${created} ${chalk.gray('│')} ` +
        `${chalk.gray('Updated:')} ${updated}` +
        `\n     ${chalk.gray('Messages:')} ${messageCount} ${chalk.gray('│')} ` +
        `${chalk.gray('Status:')} ${isActive ? chalk.green('active') : chalk.gray('completed')}` +
        (index < filteredSessions.length - 1 ? '\n' : '')
      );
    });

    this.log('');
    this.log(chalk.gray(`  Showing ${filteredSessions.length} of ${sessions.length} sessions`));

    if (sessions.length > filteredSessions.length && !limit) {
      this.log(chalk.gray(`  Use ${chalk.cyan('--limit N')} to show more results`));
    }
  }

  private async listOutputs(projectFilter?: string, limit?: number, includeArchived = false): Promise<void> {
    this.log(chalk.bold.cyan('📁 Outputs\n'));

    const outputsDir = path.join(process.cwd(), '.clavix', 'outputs');

    if (!fs.existsSync(outputsDir)) {
      this.log(chalk.gray('  No outputs found.'));
      this.log(chalk.gray('  Run ') + chalk.cyan('clavix prd') + chalk.gray(' or ') + chalk.cyan('clavix summarize') + chalk.gray(' to generate outputs.'));
      return;
    }

    const projectDirs = fs.readdirSync(outputsDir).filter(name => {
      const fullPath = path.join(outputsDir, name);
      // Skip archive directory in main listing
      if (name === 'archive' && !includeArchived) {
        return false;
      }
      return fs.statSync(fullPath).isDirectory();
    });

    if (projectDirs.length === 0) {
      this.log(chalk.gray('  No outputs found.'));
      return;
    }

    // Filter by project if specified
    let filteredDirs = projectDirs;
    if (projectFilter) {
      filteredDirs = projectDirs.filter(dir =>
        dir.toLowerCase().includes(projectFilter.toLowerCase())
      );
    }

    // Sort by modification time (most recent first)
    filteredDirs.sort((a, b) => {
      const aPath = path.join(outputsDir, a);
      const bPath = path.join(outputsDir, b);
      return fs.statSync(bPath).mtime.getTime() - fs.statSync(aPath).mtime.getTime();
    });

    // Apply limit
    if (limit) {
      filteredDirs = filteredDirs.slice(0, limit);
    }

    if (filteredDirs.length === 0) {
      this.log(chalk.gray(`  No outputs found matching "${projectFilter}".`));
      return;
    }

    // Display outputs
    filteredDirs.forEach((projectDir, index) => {
      const projectPath = path.join(outputsDir, projectDir);
      const files = fs.readdirSync(projectPath).filter(f => f.endsWith('.md'));
      const modified = fs.statSync(projectPath).mtime.toLocaleDateString();

      this.log(
        `  📄 ${chalk.bold(projectDir)}` +
        `\n     ${chalk.gray('Path:')} ${chalk.dim(path.relative(process.cwd(), projectPath))}` +
        `\n     ${chalk.gray('Files:')} ${files.join(', ')}` +
        `\n     ${chalk.gray('Modified:')} ${modified}` +
        (index < filteredDirs.length - 1 ? '\n' : '')
      );
    });

    this.log('');
    this.log(chalk.gray(`  Showing ${filteredDirs.length} of ${projectDirs.length} output directories`));

    if (projectDirs.length > filteredDirs.length && !limit) {
      this.log(chalk.gray(`  Use ${chalk.cyan('--limit N')} to show more results`));
    }

    // Show archived projects if flag is set
    if (includeArchived) {
      await this.listArchivedOutputs(projectFilter, limit);
    }
  }

  private async listArchivedOutputs(projectFilter?: string, limit?: number): Promise<void> {
    const archiveDir = path.join(process.cwd(), '.clavix', 'outputs', 'archive');

    if (!fs.existsSync(archiveDir)) {
      return; // No archived projects
    }

    const archivedDirs = fs.readdirSync(archiveDir).filter(name => {
      const fullPath = path.join(archiveDir, name);
      return fs.statSync(fullPath).isDirectory();
    });

    if (archivedDirs.length === 0) {
      return; // No archived projects
    }

    // Filter by project if specified
    let filteredDirs = archivedDirs;
    if (projectFilter) {
      filteredDirs = archivedDirs.filter(dir =>
        dir.toLowerCase().includes(projectFilter.toLowerCase())
      );
    }

    // Sort by modification time (most recent first)
    filteredDirs.sort((a, b) => {
      const aPath = path.join(archiveDir, a);
      const bPath = path.join(archiveDir, b);
      return fs.statSync(bPath).mtime.getTime() - fs.statSync(aPath).mtime.getTime();
    });

    // Apply limit
    if (limit) {
      filteredDirs = filteredDirs.slice(0, limit);
    }

    if (filteredDirs.length === 0) {
      return; // No matching archived projects
    }

    // Display archived section header
    this.log('');
    this.log(chalk.bold.cyan('📦 Archived Outputs\n'));

    // Display archived outputs
    filteredDirs.forEach((projectDir, index) => {
      const projectPath = path.join(archiveDir, projectDir);
      const files = fs.readdirSync(projectPath).filter(f => f.endsWith('.md'));
      const modified = fs.statSync(projectPath).mtime.toLocaleDateString();

      this.log(
        `  📦 ${chalk.bold(projectDir)} ${chalk.gray('(archived)')}` +
        `\n     ${chalk.gray('Path:')} ${chalk.dim(path.relative(process.cwd(), projectPath))}` +
        `\n     ${chalk.gray('Files:')} ${files.join(', ')}` +
        `\n     ${chalk.gray('Modified:')} ${modified}` +
        (index < filteredDirs.length - 1 ? '\n' : '')
      );
    });

    this.log('');
    this.log(chalk.gray(`  Showing ${filteredDirs.length} of ${archivedDirs.length} archived directories`));
    this.log(chalk.gray(`  Use ${chalk.cyan('clavix archive --restore <project>')} to restore a project`));
  }
}
