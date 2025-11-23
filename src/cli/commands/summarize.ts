import { Command, Args, Flags } from '@oclif/core';
import chalk from 'chalk';
import * as path from 'path';
import { SessionManager } from '../../core/session-manager.js';
import { ConversationAnalyzer, ConversationAnalysis } from '../../core/conversation-analyzer.js';
import { FileSystem } from '../../utils/file-system.js';
import { UniversalOptimizer } from '../../core/intelligence/index.js';

export default class Summarize extends Command {
  static description = 'Analyze a conversation session and extract structured requirements with automatic optimization';

  static examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> <session-id>',
    '<%= config.bin %> <%= command.id %> --active',
  ];

  static args = {
    sessionId: Args.string({
      description: 'Session ID to summarize',
      required: false,
    }),
  };

  static flags = {
    active: Flags.boolean({
      char: 'a',
      description: 'Summarize the most recent active session',
      default: false,
    }),
    output: Flags.string({
      char: 'o',
      description: 'Output directory (defaults to .clavix/outputs/[session-name])',
    }),
  };

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Summarize);

    console.log(chalk.bold.cyan('\n📊 Conversation Summarizer\n'));

    try {
      const manager = new SessionManager();
      const analyzer = new ConversationAnalyzer();

      // Load session
      let session;
      if (args.sessionId) {
        console.log(chalk.dim(`Loading session ${args.sessionId}...\n`));
        session = await manager.getSession(args.sessionId);

        if (!session) {
          this.error(`Session not found: ${args.sessionId}`);
        }
      } else if (flags.active) {
        console.log(chalk.dim('Loading most recent active session...\n'));
        session = await manager.getActiveSession();

        if (!session) {
          this.error('No active session found\n\nHint: Use "clavix list" to see all sessions');
        }
      } else {
        // Try to get active session by default
        session = await manager.getActiveSession();

        if (!session) {
          this.error(
            'No active session found\n\n' +
            'Usage:\n' +
            '  • clavix summarize <session-id> - Summarize specific session\n' +
            '  • clavix summarize --active - Summarize most recent active session\n' +
            '  • clavix list - View all sessions'
          );
        }
      }

      // Display session info
      console.log(chalk.bold('Session Information:'));
      console.log(chalk.gray('  ID:'), chalk.cyan(session.id));
      console.log(chalk.gray('  Project:'), chalk.cyan(session.projectName));
      console.log(chalk.gray('  Messages:'), chalk.cyan(session.messages.length.toString()));
      console.log(chalk.gray('  Created:'), chalk.dim(session.created.toLocaleString()));
      console.log();

      // Check if session has messages
      if (session.messages.length === 0) {
        this.error('Session has no messages to analyze');
      }

      // Analyze conversation
      console.log(chalk.dim('Analyzing conversation...\n'));
      const analysis = analyzer.analyze(session);

      // Display analysis summary
      this.displayAnalysisSummary(analysis);

      // Generate outputs
      console.log(chalk.dim('\nGenerating output files...\n'));

      const outputDir = flags.output ||
        path.join('.clavix/outputs', this.sanitizeProjectName(session.projectName));

      await FileSystem.ensureDir(outputDir);

      // Generate mini-PRD
      const miniPrdContent = analyzer.generateMiniPrd(session, analysis);
      const miniPrdPath = path.join(outputDir, 'mini-prd.md');
      await FileSystem.writeFileAtomic(miniPrdPath, miniPrdContent);

      // Generate optimized prompt (initial extraction)
      const rawPromptContent = analyzer.generateOptimizedPrompt(session, analysis);

      // Save original extracted version
      const originalPromptPath = path.join(outputDir, 'original-prompt.md');
      await FileSystem.writeFileAtomic(originalPromptPath, rawPromptContent);

      // Always apply optimization with Universal Optimizer
      await this.applyOptimization(rawPromptContent, outputDir);

      // Display success
      console.log(chalk.bold.green('\n✓ Analysis complete!\n'));
      console.log(chalk.bold('Generated files:'));
      console.log(chalk.gray('  • ') + chalk.cyan('mini-prd.md') + chalk.dim(' - Structured requirements document'));
      console.log(chalk.gray('  • ') + chalk.cyan('original-prompt.md') + chalk.dim(' - Raw extracted prompt'));
      console.log(chalk.gray('  • ') + chalk.cyan('optimized-prompt.md') + chalk.dim(' - Enhanced AI-ready prompt'));
      console.log();
      console.log(chalk.bold('Output location:'));
      console.log(chalk.dim(`  ${outputDir}`));
      console.log();
      console.log(chalk.bold('💡 Next steps:'));
      console.log(chalk.gray('  • Use ') + chalk.cyan('optimized-prompt.md') + chalk.gray(' for best AI results'));
      console.log(chalk.gray('  • Share ') + chalk.cyan('mini-prd.md') + chalk.gray(' with your team for alignment'));
      console.log(chalk.gray('  • Run ') + chalk.cyan('clavix implement') + chalk.gray(' to start development'));
      console.log();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      this.error(errorMessage);
    }
  }

  private displayAnalysisSummary(analysis: ConversationAnalysis): void {
    console.log(chalk.bold.cyan('Analysis Summary:\n'));

    if (analysis.keyRequirements.length > 0) {
      console.log(chalk.bold('Key Requirements:'));
      analysis.keyRequirements.slice(0, 5).forEach((req, i) => {
        console.log(chalk.gray(`  ${i + 1}. ${req}`));
      });
      if (analysis.keyRequirements.length > 5) {
        console.log(chalk.dim(`  ... and ${analysis.keyRequirements.length - 5} more`));
      }
      console.log();
    }

    if (analysis.technicalConstraints.length > 0) {
      console.log(chalk.bold('Technical Constraints:'));
      analysis.technicalConstraints.slice(0, 3).forEach(constraint => {
        console.log(chalk.gray(`  • ${constraint}`));
      });
      if (analysis.technicalConstraints.length > 3) {
        console.log(chalk.dim(`  ... and ${analysis.technicalConstraints.length - 3} more`));
      }
      console.log();
    }

    if (analysis.successCriteria.length > 0) {
      console.log(chalk.bold('Success Criteria:'));
      analysis.successCriteria.slice(0, 3).forEach(criterion => {
        console.log(chalk.gray(`  ✓ ${criterion}`));
      });
      if (analysis.successCriteria.length > 3) {
        console.log(chalk.dim(`  ... and ${analysis.successCriteria.length - 3} more`));
      }
      console.log();
    }
  }

  private async applyOptimization(rawPrompt: string, outputDir: string): Promise<void> {
    try {
      console.log(chalk.dim('Optimizing extracted prompt...\n'));

      const optimizer = new UniversalOptimizer();
      const result = await optimizer.optimize(rawPrompt, 'fast');

      // Display optimization results
      console.log(chalk.bold('✨ Optimization Results:\n'));
      console.log(chalk.cyan(`  Intent: ${result.intent.primaryIntent}`));
      console.log(chalk.cyan(`  Quality: ${result.quality.overall.toFixed(0)}%`));

      if (result.improvements.length > 0) {
        console.log(chalk.cyan(`  Improvements: ${result.improvements.length} applied\n`));
      } else {
        console.log();
      }

      // Save optimized version
      const optimizedPath = path.join(outputDir, 'optimized-prompt.md');
      await FileSystem.writeFileAtomic(optimizedPath, result.enhanced);

    } catch (error) {
      console.log(chalk.yellow('⚠️  Could not optimize prompt'));
      console.log(chalk.gray('Using original extracted version...\n'));

      // Fallback: copy original to optimized
      const originalPath = path.join(outputDir, 'original-prompt.md');
      const optimizedPath = path.join(outputDir, 'optimized-prompt.md');
      await FileSystem.writeFileAtomic(optimizedPath, rawPrompt);
    }
  }

  private sanitizeProjectName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || 'unnamed-project';
  }
}
