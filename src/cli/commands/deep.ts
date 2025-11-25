import { Command, Args, Flags } from '@oclif/core';
import chalk from 'chalk';
import { UniversalOptimizer } from '../../core/intelligence/index.js';
import { PromptManager } from '../../core/prompt-manager.js';
import { OptimizationResult } from '../../core/intelligence/types.js';

export default class Deep extends Command {
  static description =
    'Perform comprehensive deep analysis with alternative approaches, edge cases, and validation checklists';

  static examples = [
    '<%= config.bin %> <%= command.id %> "Create a login page"',
    '<%= config.bin %> <%= command.id %> "Build an API for user management"',
    '<%= config.bin %> <%= command.id %> "Design a notification system"',
  ];

  static flags = {
    'analysis-only': Flags.boolean({
      description: 'Show only quality analysis without improved prompt',
      default: false,
    }),
  };

  static args = {
    prompt: Args.string({
      description: 'The prompt to analyze deeply',
      required: true,
    }),
  };

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Deep);

    if (!args.prompt || args.prompt.trim().length === 0) {
      console.log(chalk.red('\n✗ Please provide a prompt to analyze\n'));
      console.log(chalk.gray('Example:'), chalk.cyan('clavix deep "Create a login page"'));
      return;
    }

    console.log(chalk.bold.cyan('\n🔍 Performing comprehensive deep analysis...\n'));
    console.log(chalk.gray('This may take up to 15 seconds for thorough exploration\n'));

    const optimizer = new UniversalOptimizer();
    const result = await optimizer.optimize(args.prompt, 'deep');

    // Handle --analysis-only flag
    if (flags['analysis-only']) {
      this.displayAnalysisOnly(result);
      return;
    }

    // Display full deep mode output
    this.displayOutput(result);

    // Save prompt to file system
    await this.savePrompt(result);
  }

  private displayOutput(result: OptimizationResult): void {
    console.log(chalk.bold.cyan('🔍 Deep Analysis Complete\n'));

    // ===== Intent Analysis =====
    console.log(chalk.bold.cyan('🎯 Intent Analysis:\n'));
    console.log(chalk.cyan(`  Type: ${result.intent.primaryIntent}`));
    console.log(chalk.cyan(`  Confidence: ${result.intent.confidence}%`));
    console.log(chalk.cyan(`  Characteristics:`));
    console.log(
      chalk.cyan(
        `    • Has code context: ${result.intent.characteristics.hasCodeContext ? 'Yes' : 'No'}`
      )
    );
    console.log(
      chalk.cyan(
        `    • Technical terms: ${result.intent.characteristics.hasTechnicalTerms ? 'Yes' : 'No'}`
      )
    );
    console.log(
      chalk.cyan(`    • Open-ended: ${result.intent.characteristics.isOpenEnded ? 'Yes' : 'No'}`)
    );
    console.log(
      chalk.cyan(
        `    • Needs structure: ${result.intent.characteristics.needsStructure ? 'Yes' : 'No'}`
      )
    );
    console.log();

    // ===== Quality Metrics =====
    console.log(chalk.bold('📊 Quality Metrics:\n'));
    const getScoreColor = (score: number) => {
      if (score >= 80) return chalk.green;
      if (score >= 60) return chalk.yellow;
      return chalk.red;
    };

    console.log(
      getScoreColor(result.quality.clarity)(`  Clarity: ${result.quality.clarity.toFixed(0)}%`)
    );
    console.log(
      getScoreColor(result.quality.efficiency)(
        `  Efficiency: ${result.quality.efficiency.toFixed(0)}%`
      )
    );
    console.log(
      getScoreColor(result.quality.structure)(
        `  Structure: ${result.quality.structure.toFixed(0)}%`
      )
    );
    console.log(
      getScoreColor(result.quality.completeness)(
        `  Completeness: ${result.quality.completeness.toFixed(0)}%`
      )
    );
    console.log(
      getScoreColor(result.quality.actionability)(
        `  Actionability: ${result.quality.actionability.toFixed(0)}%`
      )
    );
    console.log(
      getScoreColor(result.quality.overall).bold(
        `\n  Overall: ${result.quality.overall.toFixed(0)}%\n`
      )
    );

    // ===== Strengths =====
    if (result.quality.strengths.length > 0) {
      console.log(chalk.bold.green('✅ Strengths:\n'));
      result.quality.strengths.forEach((strength) => {
        console.log(chalk.green(`  • ${strength}`));
      });
      console.log();
    }

    // ===== Improvements Applied =====
    if (result.improvements.length > 0) {
      console.log(chalk.bold.magenta('✨ Improvements Applied:\n'));
      result.improvements.forEach((improvement) => {
        const emoji =
          improvement.impact === 'high' ? '🔥' : improvement.impact === 'medium' ? '⚡' : '💡';
        console.log(
          chalk.magenta(`  ${emoji} ${improvement.description} [${improvement.dimension}]`)
        );
      });
      console.log();
    }

    // ===== Enhanced Prompt =====
    // Note: Pattern-generated content (Alternative Approaches, Edge Cases, Validation Checklist)
    // is already embedded in result.enhanced by deep mode patterns
    console.log(chalk.bold.cyan('✨ Enhanced Prompt:\n'));
    console.log(chalk.dim('─'.repeat(80)));
    console.log(result.enhanced);
    console.log(chalk.dim('─'.repeat(80)));
    console.log();

    // Patterns Applied
    if (result.appliedPatterns.length > 0) {
      console.log(chalk.bold.blue('🧩 Patterns Applied:\n'));
      result.appliedPatterns.forEach((pattern) => {
        console.log(chalk.blue(`  • ${pattern.name}: ${pattern.description}`));
      });
      console.log();
    }

    // Remaining Issues (if any)
    if (result.quality.remainingIssues && result.quality.remainingIssues.length > 0) {
      console.log(chalk.bold.yellow('⚠️  Remaining Areas for Improvement:\n'));
      result.quality.remainingIssues.forEach((issue) => {
        console.log(chalk.yellow(`  • ${issue}`));
      });
      console.log();
    }

    // Final recommendation
    const recommendation = new UniversalOptimizer().getRecommendation(result);
    if (recommendation) {
      console.log(chalk.blue.bold('💡 Recommendation:'));
      console.log(chalk.blue(`  ${recommendation}\n`));
    }

    console.log(chalk.gray(`⚡ Processed in ${result.processingTimeMs}ms\n`));
    console.log(
      chalk.gray(
        '💡 Tip: The enhanced prompt above includes alternative approaches, edge cases, and validation checklist\n'
      )
    );
  }

  private displayAnalysisOnly(result: OptimizationResult): void {
    console.log(chalk.bold.cyan('🎯 Intent Analysis:\n'));
    console.log(chalk.cyan(`  Type: ${result.intent.primaryIntent}`));
    console.log(chalk.cyan(`  Confidence: ${result.intent.confidence}%`));
    console.log(chalk.cyan(`  Characteristics:`));
    console.log(
      chalk.cyan(
        `    • Has code context: ${result.intent.characteristics.hasCodeContext ? 'Yes' : 'No'}`
      )
    );
    console.log(
      chalk.cyan(
        `    • Technical terms: ${result.intent.characteristics.hasTechnicalTerms ? 'Yes' : 'No'}`
      )
    );
    console.log(
      chalk.cyan(`    • Open-ended: ${result.intent.characteristics.isOpenEnded ? 'Yes' : 'No'}`)
    );
    console.log(
      chalk.cyan(
        `    • Needs structure: ${result.intent.characteristics.needsStructure ? 'Yes' : 'No'}`
      )
    );
    console.log();

    console.log(chalk.bold('📊 Quality Scores:\n'));
    console.log(chalk.white(`  Clarity: ${result.quality.clarity.toFixed(0)}%`));
    console.log(chalk.white(`  Efficiency: ${result.quality.efficiency.toFixed(0)}%`));
    console.log(chalk.white(`  Structure: ${result.quality.structure.toFixed(0)}%`));
    console.log(chalk.white(`  Completeness: ${result.quality.completeness.toFixed(0)}%`));
    console.log(chalk.white(`  Actionability: ${result.quality.actionability.toFixed(0)}%`));
    console.log(chalk.bold(`\n  Overall: ${result.quality.overall.toFixed(0)}%\n`));

    if (result.quality.strengths.length > 0) {
      console.log(chalk.bold.green('✅ Strengths:\n'));
      result.quality.strengths.forEach((strength) => {
        console.log(chalk.green(`  • ${strength}`));
      });
      console.log();
    }
  }

  private async savePrompt(result: OptimizationResult): Promise<void> {
    try {
      const manager = new PromptManager();

      // Format enhanced prompt as content
      const content = result.enhanced;

      await manager.savePrompt(content, 'deep', result.original);

      console.log(chalk.gray(`💾 Saved prompt to .clavix/outputs/prompts/deep/\n`));
    } catch (error) {
      console.log(chalk.yellow('⚠️  Could not save prompt to file system'));
      console.log(
        chalk.gray('Error: ' + (error instanceof Error ? error.message : 'Unknown error'))
      );
    }
  }

  private generateShortHash(text: string): string {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).slice(0, 4);
  }
}
