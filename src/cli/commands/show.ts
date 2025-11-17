import { Command, Args, Flags } from '@oclif/core';
import chalk from 'chalk';
import fs from 'fs-extra';
import * as path from 'path';
import { SessionManager } from '../../core/session-manager.js';
import { Session } from '../../types/session.js';

export default class Show extends Command {
  static description = 'Show detailed information about a session or output';

  static examples = [
    '<%= config.bin %> <%= command.id %> session-id',
    '<%= config.bin %> <%= command.id %> session-id --full',
    '<%= config.bin %> <%= command.id %> --output project-name',
  ];

  static args = {
    sessionId: Args.string({
      description: 'Session ID to show',
      required: false,
    }),
  };

  static flags = {
    output: Flags.string({
      char: 'o',
      description: 'Show output directory contents',
    }),
    full: Flags.boolean({
      char: 'f',
      description: 'Show full conversation history',
      default: false,
    }),
    limit: Flags.integer({
      char: 'l',
      description: 'Limit number of messages to show',
      default: 10,
    }),
  };

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Show);

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

    // Show output directory if --output flag is used
    if (flags.output) {
      await this.showOutput(flags.output);
      return;
    }

    // Show session if session ID is provided
    if (args.sessionId) {
      await this.showSession(args.sessionId, flags.full, flags.limit);
      return;
    }

    // If no arguments, show most recent session
    const sessionManager = new SessionManager();
    const sessions = await sessionManager.listSessions();

    if (sessions.length === 0) {
      this.error(
        chalk.yellow('No sessions found.') +
        '\n' +
        chalk.gray('Run ') +
        chalk.cyan('clavix start') +
        chalk.gray(' to create a new session.')
      );
    }

    // Get most recent session
    const mostRecent = sessions.sort((a, b) =>
      new Date(b.updated).getTime() - new Date(a.updated).getTime()
    )[0];

    this.log(chalk.gray('Showing most recent session:\n'));
    await this.showSession(mostRecent.id, flags.full, flags.limit);
  }

  private async showSession(sessionId: string, showFull: boolean, limit: number): Promise<void> {
    const sessionManager = new SessionManager();

    try {
      const session = await sessionManager.getSession(sessionId);

      if (!session) {
        this.error(chalk.red(`Session "${sessionId}" not found.`));
      }

      this.displaySessionHeader(session);

      // Show conversation history
      const messages = session.messages || [];

      if (messages.length === 0) {
        this.log(chalk.gray('  No messages in this session yet.'));
        return;
      }

      this.log(chalk.bold.cyan('\n💬 Conversation History\n'));

      const messagesToShow = showFull ? messages : messages.slice(0, limit);

      messagesToShow.forEach((msg, index) => {
        const timestamp = new Date(msg.timestamp).toLocaleTimeString();
        const roleColor = msg.role === 'user' ? chalk.blue : chalk.green;
        const roleLabel = msg.role === 'user' ? 'User' : 'Assistant';

        this.log(
          `  ${roleColor.bold(roleLabel)} ${chalk.gray(`[${timestamp}]`)}` +
          `\n  ${this.wrapText(msg.content, 80)}` +
          (index < messagesToShow.length - 1 ? '\n' : '')
        );
      });

      if (!showFull && messages.length > limit) {
        this.log('');
        this.log(
          chalk.gray(`  ... ${messages.length - limit} more messages`) +
          '\n' +
          chalk.gray(`  Use ${chalk.cyan('--full')} to see the complete conversation`)
        );
      }

      // Show associated outputs if any
      this.showAssociatedOutputs(session);
    } catch (error) {
      this.error(chalk.red(`Error loading session: ${(error as Error).message}`));
    }
  }

  private displaySessionHeader(session: Session): void {
    const statusIcon = session.status === 'active' ? '🟢' : '⚪';
    const projectName = session.projectName || 'untitled';

    this.log(chalk.bold.cyan('📋 Session Details\n'));
    this.log(`  ${statusIcon} ${chalk.bold(projectName)}`);
    this.log(`  ${chalk.gray('ID:')} ${session.id}`);
    this.log(`  ${chalk.gray('Agent:')} ${session.agent || 'unknown'}`);
    this.log(`  ${chalk.gray('Created:')} ${new Date(session.created).toLocaleString()}`);
    this.log(`  ${chalk.gray('Updated:')} ${new Date(session.updated).toLocaleString()}`);
    this.log(`  ${chalk.gray('Status:')} ${session.status === 'active' ? chalk.green('active') : chalk.gray('completed')}`);
    this.log(`  ${chalk.gray('Messages:')} ${session.messages?.length || 0}`);
  }

  private showAssociatedOutputs(session: Session): void {
    const outputsDir = path.join(process.cwd(), '.clavix', 'outputs');
    const projectName = session.projectName || 'untitled';
    const projectOutputDir = path.join(outputsDir, projectName);

    if (!fs.existsSync(projectOutputDir)) {
      return;
    }

    const files = fs.readdirSync(projectOutputDir).filter(f => f.endsWith('.md'));

    if (files.length === 0) {
      return;
    }

    this.log(chalk.bold.cyan('\n📁 Associated Outputs\n'));
    this.log(`  ${chalk.gray('Path:')} ${chalk.dim(path.relative(process.cwd(), projectOutputDir))}`);
    this.log(`  ${chalk.gray('Files:')}`);

    files.forEach(file => {
      const filePath = path.join(projectOutputDir, file);
      const stats = fs.statSync(filePath);
      const size = this.formatFileSize(stats.size);

      this.log(`    • ${chalk.cyan(file)} ${chalk.gray(`(${size})`)}`);
    });
  }

  private async showOutput(projectName: string): Promise<void> {
    const outputsDir = path.join(process.cwd(), '.clavix', 'outputs', projectName);

    if (!fs.existsSync(outputsDir)) {
      this.error(chalk.red(`Output directory "${projectName}" not found.`));
    }

    this.log(chalk.bold.cyan(`📁 Output: ${projectName}\n`));
    this.log(`  ${chalk.gray('Path:')} ${chalk.dim(path.relative(process.cwd(), outputsDir))}`);

    const files = fs.readdirSync(outputsDir).filter(f => f.endsWith('.md'));

    if (files.length === 0) {
      this.log(chalk.gray('  No output files found.'));
      return;
    }

    this.log(`\n  ${chalk.gray('Files:')}`);

    files.forEach(file => {
      const filePath = path.join(outputsDir, file);
      const stats = fs.statSync(filePath);
      const size = this.formatFileSize(stats.size);
      const modified = stats.mtime.toLocaleString();

      this.log(
        `    • ${chalk.cyan(file)}` +
        `\n      ${chalk.gray('Size:')} ${size} ${chalk.gray('│')} ` +
        `${chalk.gray('Modified:')} ${modified}`
      );
    });

    this.log('');
    this.log(chalk.gray(`  Use ${chalk.cyan(`cat ${path.relative(process.cwd(), outputsDir)}/<file>`)} to view file contents`));
  }

  private wrapText(text: string, maxWidth: number): string {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '  ';

    words.forEach(word => {
      if ((currentLine + word).length > maxWidth) {
        lines.push(currentLine);
        currentLine = '  ' + word + ' ';
      } else {
        currentLine += word + ' ';
      }
    });

    if (currentLine.trim()) {
      lines.push(currentLine);
    }

    return lines.join('\n');
  }

  private formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
}
