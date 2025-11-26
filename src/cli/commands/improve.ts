import { Command, Args, Flags } from '@oclif/core';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { UniversalOptimizer } from '../../core/intelligence/index.js';
import { PromptManager } from '../../core/prompt-manager.js';
import { OptimizationResult, DepthLevel } from '../../core/intelligence/types.js';

/**
 * v4.11: Unified improve command with smart depth auto-detection
 *
 * Replaces the old fast/deep commands with intelligent depth selection:
 * - Quality score >= 75: auto-comprehensive
 * - Quality score 60-74: ask user (borderline)
 * - Quality score < 60: auto-standard
 *
 * Users can override with --comprehensive or --standard flags.
 */
export default class Improve extends Command {
  static description =
    'Improve a prompt with smart quality-based depth selection (replaces fast/deep)';

  static examples = [
    '<%= config.bin %> <%= command.id %> "Create a login page"',
    '<%= config.bin %> <%= command.id %> "Build an API for user management" --comprehensive',
    '<%= config.bin %> <%= command.id %> "Fix the button styling" --standard',
    '<%= config.bin %> <%= command.id %> "Design a notification system" --analysis-only',
  ];

  static flags = {
    comprehensive: Flags.boolean({
      char: 'c',
      description: 'Force comprehensive depth (alternative approaches, edge cases, validation)',
      default: false,
    }),
    standard: Flags.boolean({
      char: 's',
      description: 'Force standard depth (quick improvements)',
      default: false,
    }),
    'analysis-only': Flags.boolean({
      description: 'Show only quality analysis without improved prompt',
      default: false,
    }),
  };

  static args = {
    prompt: Args.string({
      description: 'The prompt to improve',
      required: true,
    }),
  };

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Improve);

    if (!args.prompt || args.prompt.trim().length === 0) {
      console.log(chalk.red('\n✗ Please provide a prompt to improve\n'));
      console.log(chalk.gray('Example:'), chalk.cyan('clavix improve "Create a login page"'));
      return;
    }

    // Determine depth level
    let depthLevel: DepthLevel;

    if (flags.comprehensive && flags.standard) {
      console.log(chalk.yellow('\n⚠️  Cannot use both --comprehensive and --standard\n'));
      console.log(chalk.gray('Using smart auto-detection instead...\n'));
      depthLevel = await this.autoDetectDepth(args.prompt);
    } else if (flags.comprehensive) {
      depthLevel = 'comprehensive';
      console.log(chalk.bold.cyan('\n🔍 Performing comprehensive analysis...\n'));
      console.log(chalk.gray('This may take up to 15 seconds for thorough exploration\n'));
    } else if (flags.standard) {
      depthLevel = 'standard';
      console.log(chalk.bold.cyan('\n🔍 Performing standard analysis...\n'));
    } else {
      depthLevel = await this.autoDetectDepth(args.prompt);
    }

    // Run optimization
    const optimizer = new UniversalOptimizer();
    const result = await optimizer.optimize(args.prompt, 'improve', { depthLevel });

    // Handle --analysis-only flag
    if (flags['analysis-only']) {
      this.displayAnalysisOnly(result, depthLevel);
      return;
    }

    // Display full output
    this.displayOutput(result, depthLevel);

    // Save prompt to file system
    await this.savePrompt(result, depthLevel);
  }

  /**
   * v4.11: Smart depth auto-detection based on quality score
   */
  private async autoDetectDepth(prompt: string): Promise<DepthLevel> {
    console.log(chalk.bold.cyan('\n🔍 Analyzing prompt quality...\n'));

    // Quick analysis to determine depth
    const optimizer = new UniversalOptimizer();
    const quickResult = await optimizer.optimize(prompt, 'improve', { depthLevel: 'standard' });

    const qualityScore = quickResult.quality.overall;

    // v4.11 thresholds
    if (qualityScore >= 75) {
      // High quality - recommend comprehensive for extra polish
      console.log(
        chalk.cyan(
          `Quality score: ${qualityScore.toFixed(0)}% - Recommending comprehensive depth\n`
        )
      );
      return 'comprehensive';
    } else if (qualityScore >= 60) {
      // Borderline - ask user
      console.log(
        chalk.yellow(`Quality score: ${qualityScore.toFixed(0)}% - Borderline quality\n`)
      );

      const { choice } = await inquirer.prompt([
        {
          type: 'list',
          name: 'choice',
          message: 'Choose analysis depth:',
          choices: [
            {
              name: 'Comprehensive (alternative approaches, edge cases, validation)',
              value: 'comprehensive',
            },
            { name: 'Standard (quick improvements)', value: 'standard' },
          ],
        },
      ]);

      console.log();
      return choice;
    } else {
      // Low quality - standard is fine, comprehensive would add noise
      console.log(
        chalk.cyan(`Quality score: ${qualityScore.toFixed(0)}% - Using standard depth\n`)
      );
      return 'standard';
    }
  }

  private displayOutput(result: OptimizationResult, depthLevel: DepthLevel): void {
    const modeLabel = depthLevel === 'comprehensive' ? 'Comprehensive' : 'Standard';
    console.log(chalk.bold.cyan(`🔍 ${modeLabel} Analysis Complete\n`));

    // Intent Analysis
    console.log(chalk.bold.cyan('🎯 Intent Analysis:\n'));
    console.log(chalk.cyan(`  Type: ${result.intent.primaryIntent}`));
    console.log(chalk.cyan(`  Confidence: ${result.intent.confidence}%`));

    if (depthLevel === 'comprehensive') {
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
    }
    console.log();

    // Quality Metrics
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

    // Strengths
    if (result.quality.strengths.length > 0) {
      console.log(chalk.bold.green('✅ Strengths:\n'));
      result.quality.strengths.forEach((strength) => {
        console.log(chalk.green(`  • ${strength}`));
      });
      console.log();
    }

    // Improvements Applied
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

    // Enhanced Prompt
    console.log(chalk.bold.cyan('✨ Enhanced Prompt:\n'));
    console.log(chalk.dim('─'.repeat(80)));
    console.log(result.enhanced);
    console.log(chalk.dim('─'.repeat(80)));
    console.log();

    // Patterns Applied (comprehensive mode)
    if (depthLevel === 'comprehensive' && result.appliedPatterns.length > 0) {
      console.log(chalk.bold.blue('🧩 Patterns Applied:\n'));
      result.appliedPatterns.forEach((pattern) => {
        console.log(chalk.blue(`  • ${pattern.name}: ${pattern.description}`));
      });
      console.log();
    }

    // Remaining Issues
    if (result.quality.remainingIssues && result.quality.remainingIssues.length > 0) {
      console.log(chalk.bold.yellow('⚠️  Remaining Areas for Improvement:\n'));
      result.quality.remainingIssues.forEach((issue) => {
        console.log(chalk.yellow(`  • ${issue}`));
      });
      console.log();
    }

    // Recommendation
    const recommendation = new UniversalOptimizer().getRecommendation(result);
    if (recommendation) {
      console.log(chalk.blue.bold('💡 Recommendation:'));
      console.log(chalk.blue(`  ${recommendation}\n`));
    }

    console.log(chalk.gray(`⚡ Processed in ${result.processingTimeMs}ms\n`));

    if (depthLevel === 'comprehensive') {
      console.log(
        chalk.gray(
          '💡 Tip: The enhanced prompt includes alternative approaches, edge cases, and validation checklist\n'
        )
      );
    } else {
      console.log(
        chalk.gray('💡 Tip: Copy the enhanced prompt above and use it with your AI agent\n')
      );
    }
  }

  private displayAnalysisOnly(result: OptimizationResult, depthLevel: DepthLevel): void {
    console.log(chalk.bold.cyan('🎯 Intent Analysis:\n'));
    console.log(chalk.cyan(`  Type: ${result.intent.primaryIntent}`));
    console.log(chalk.cyan(`  Confidence: ${result.intent.confidence}%`));
    console.log(chalk.cyan(`  Depth: ${depthLevel}`));

    if (depthLevel === 'comprehensive') {
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
    }
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

  private async savePrompt(result: OptimizationResult, depthLevel: DepthLevel): Promise<void> {
    try {
      const manager = new PromptManager();
      const content = result.enhanced;

      await manager.savePrompt(content, depthLevel, result.original);

      console.log(chalk.gray(`💾 Saved prompt to .clavix/outputs/prompts/\n`));
    } catch (error) {
      console.log(chalk.yellow('⚠️  Could not save prompt to file system'));
      console.log(
        chalk.gray('Error: ' + (error instanceof Error ? error.message : 'Unknown error'))
      );
    }
  }
}
