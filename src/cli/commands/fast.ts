import { Command, Args, Flags } from '@oclif/core';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { UniversalOptimizer } from '../../core/intelligence/index.js';
import { PromptManager } from '../../core/prompt-manager.js';
import { OptimizationResult } from '../../core/intelligence/types.js';

export default class Fast extends Command {
  static description = 'Quickly improve a prompt with smart quality assessment and triage';

  static examples = [
    '<%= config.bin %> <%= command.id %> "Create a login page"',
    '<%= config.bin %> <%= command.id %> "Build an API for user management"',
  ];

  static flags = {
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
    const { args, flags } = await this.parse(Fast);

    if (!args.prompt || args.prompt.trim().length === 0) {
      console.log(chalk.red('\n✗ Please provide a prompt to improve\n'));
      console.log(chalk.gray('Example:'), chalk.cyan('clavix fast "Create a login page"'));
      return;
    }

    console.log(chalk.bold.cyan('\n🔍 Analyzing and optimizing prompt...\n'));

    const optimizer = new UniversalOptimizer();
    const result = await optimizer.optimize(args.prompt, 'fast');

    // Check if deep mode is recommended
    const shouldRecommendDeep = optimizer.shouldRecommendDeepMode(result);

    if (shouldRecommendDeep) {
      console.log(chalk.bold.yellow('⚠️  Smart Triage Alert\n'));
      console.log(chalk.yellow('Deep analysis is recommended for this prompt because:'));

      if (result.intent.primaryIntent === 'planning') {
        console.log(chalk.yellow(`  • Planning intent detected - benefits from comprehensive exploration`));
      }
      if (result.quality.overall < 65) {
        console.log(chalk.yellow(`  • Quality score ${result.quality.overall.toFixed(0)}% - can be significantly improved`));
      }
      if (result.intent.characteristics.isOpenEnded && result.intent.characteristics.needsStructure) {
        console.log(chalk.yellow(`  • Open-ended prompt without clear structure`));
      }
      console.log();

      const { proceed } = await inquirer.prompt([
        {
          type: 'list',
          name: 'proceed',
          message: 'How would you like to proceed?',
          choices: [
            { name: 'Switch to deep mode (recommended)', value: 'deep' },
            { name: 'Continue with fast mode', value: 'fast' },
          ],
        },
      ]);

      if (proceed === 'deep') {
        console.log(chalk.cyan('\n🔍 Switching to deep mode...\n'));
        const deepResult = await optimizer.optimize(args.prompt, 'deep');
        this.displayDeepModeOutput(deepResult);
        await this.savePrompt(deepResult);
        return;
      }

      console.log(chalk.yellow('\n⚠️  Proceeding with fast mode as requested\n'));
    }

    // Handle --analysis-only flag
    if (flags['analysis-only']) {
      this.displayAnalysisOnly(result);
      return;
    }

    // Display full analysis
    this.displayFastModeOutput(result);

    // Save prompt to file system
    await this.savePrompt(result);
  }

  private displayFastModeOutput(result: OptimizationResult): void {
    // Display intent detection
    console.log(chalk.bold.cyan('🎯 Intent Analysis:\n'));
    console.log(chalk.cyan(`  Type: ${result.intent.primaryIntent}`));
    console.log(chalk.cyan(`  Confidence: ${result.intent.confidence}%\n`));

    // Display quality assessment
    console.log(chalk.bold('📊 Quality Assessment:\n'));

    const getScoreColor = (score: number) => {
      if (score >= 80) return chalk.green;
      if (score >= 60) return chalk.yellow;
      return chalk.red;
    };

    console.log(getScoreColor(result.quality.clarity)(`  Clarity: ${result.quality.clarity.toFixed(0)}%`));
    console.log(getScoreColor(result.quality.efficiency)(`  Efficiency: ${result.quality.efficiency.toFixed(0)}%`));
    console.log(getScoreColor(result.quality.structure)(`  Structure: ${result.quality.structure.toFixed(0)}%`));
    console.log(getScoreColor(result.quality.completeness)(`  Completeness: ${result.quality.completeness.toFixed(0)}%`));
    console.log(getScoreColor(result.quality.actionability)(`  Actionability: ${result.quality.actionability.toFixed(0)}%`));
    console.log(getScoreColor(result.quality.overall).bold(`\n  Overall: ${result.quality.overall.toFixed(0)}%\n`));

    // Display strengths if any
    if (result.quality.strengths.length > 0) {
      console.log(chalk.bold.green('✅ Strengths:\n'));
      result.quality.strengths.forEach((strength) => {
        console.log(chalk.green(`  • ${strength}`));
      });
      console.log();
    }

    // Display improvements applied
    if (result.improvements.length > 0) {
      console.log(chalk.bold.magenta('✨ Improvements Applied:\n'));
      result.improvements.forEach((improvement) => {
        const emoji = improvement.impact === 'high' ? '🔥' : improvement.impact === 'medium' ? '⚡' : '💡';
        console.log(chalk.magenta(`  ${emoji} ${improvement.description}`));
      });
      console.log();
    }

    // Display enhanced prompt
    console.log(chalk.bold.cyan('✨ Enhanced Prompt:\n'));
    console.log(chalk.dim('─'.repeat(80)));
    console.log(result.enhanced);
    console.log(chalk.dim('─'.repeat(80)));
    console.log();

    // Recommendation
    const recommendation = new UniversalOptimizer().getRecommendation(result);
    if (recommendation) {
      console.log(chalk.blue.bold('💡 Recommendation:'));
      console.log(chalk.blue(`  ${recommendation}\n`));
    }

    console.log(chalk.gray(`⚡ Processed in ${result.processingTimeMs}ms\n`));
    console.log(chalk.gray('💡 Tip: Copy the enhanced prompt above and use it with your AI agent\n'));
  }

  private displayDeepModeOutput(result: OptimizationResult): void {
    console.log(chalk.bold.cyan('🔍 Deep Analysis Complete\n'));

    // Intent Analysis
    console.log(chalk.bold.cyan('🎯 Intent Analysis:\n'));
    console.log(chalk.cyan(`  Type: ${result.intent.primaryIntent}`));
    console.log(chalk.cyan(`  Confidence: ${result.intent.confidence}%`));
    console.log(chalk.cyan(`  Characteristics:`));
    console.log(chalk.cyan(`    • Has code context: ${result.intent.characteristics.hasCodeContext ? 'Yes' : 'No'}`));
    console.log(chalk.cyan(`    • Technical terms: ${result.intent.characteristics.hasTechnicalTerms ? 'Yes' : 'No'}`));
    console.log(chalk.cyan(`    • Open-ended: ${result.intent.characteristics.isOpenEnded ? 'Yes' : 'No'}`));
    console.log(chalk.cyan(`    • Needs structure: ${result.intent.characteristics.needsStructure ? 'Yes' : 'No'}`));
    console.log();

    // Quality Metrics
    console.log(chalk.bold('📊 Quality Metrics:\n'));
    const getScoreColor = (score: number) => {
      if (score >= 80) return chalk.green;
      if (score >= 60) return chalk.yellow;
      return chalk.red;
    };

    console.log(getScoreColor(result.quality.clarity)(`  Clarity: ${result.quality.clarity.toFixed(0)}%`));
    console.log(getScoreColor(result.quality.efficiency)(`  Efficiency: ${result.quality.efficiency.toFixed(0)}%`));
    console.log(getScoreColor(result.quality.structure)(`  Structure: ${result.quality.structure.toFixed(0)}%`));
    console.log(getScoreColor(result.quality.completeness)(`  Completeness: ${result.quality.completeness.toFixed(0)}%`));
    console.log(getScoreColor(result.quality.actionability)(`  Actionability: ${result.quality.actionability.toFixed(0)}%`));
    console.log(getScoreColor(result.quality.overall).bold(`\n  Overall: ${result.quality.overall.toFixed(0)}%\n`));

    // Improvements Applied
    if (result.improvements.length > 0) {
      console.log(chalk.bold.magenta('✨ Improvements Applied:\n'));
      result.improvements.forEach((improvement) => {
        const emoji = improvement.impact === 'high' ? '🔥' : improvement.impact === 'medium' ? '⚡' : '💡';
        console.log(chalk.magenta(`  ${emoji} ${improvement.description} [${improvement.dimension}]`));
      });
      console.log();
    }

    // Enhanced Prompt
    console.log(chalk.bold.cyan('✨ Enhanced Prompt:\n'));
    console.log(chalk.dim('─'.repeat(80)));
    console.log(result.enhanced);
    console.log(chalk.dim('─'.repeat(80)));
    console.log();

    // Deep mode features would go here (alternatives, edge cases, validation)
    // TODO: Implement deep mode patterns to generate these

    // Patterns Applied
    if (result.appliedPatterns.length > 0) {
      console.log(chalk.bold.blue('🧩 Patterns Applied:\n'));
      result.appliedPatterns.forEach((pattern) => {
        console.log(chalk.blue(`  • ${pattern.name}: ${pattern.description}`));
      });
      console.log();
    }

    console.log(chalk.gray(`⚡ Processed in ${result.processingTimeMs}ms\n`));
    console.log(chalk.gray('💡 Tip: Consider the alternatives and validation items above\n'));
  }

  private displayAnalysisOnly(result: OptimizationResult): void {
    console.log(chalk.bold.cyan('🎯 Intent: '), chalk.cyan(result.intent.primaryIntent));
    console.log(chalk.bold.cyan('🎯 Confidence: '), chalk.cyan(`${result.intent.confidence}%\n`));

    console.log(chalk.bold('📊 Quality Scores:\n'));
    console.log(chalk.white(`  Clarity: ${result.quality.clarity.toFixed(0)}%`));
    console.log(chalk.white(`  Efficiency: ${result.quality.efficiency.toFixed(0)}%`));
    console.log(chalk.white(`  Structure: ${result.quality.structure.toFixed(0)}%`));
    console.log(chalk.white(`  Completeness: ${result.quality.completeness.toFixed(0)}%`));
    console.log(chalk.white(`  Actionability: ${result.quality.actionability.toFixed(0)}%`));
    console.log(chalk.bold(`\n  Overall: ${result.quality.overall.toFixed(0)}%\n`));
  }

  private async savePrompt(result: OptimizationResult): Promise<void> {
    try {
      const manager = new PromptManager();

      // Format enhanced prompt as content
      const content = result.enhanced;

      await manager.savePrompt(content, 'fast', result.original);

      console.log(chalk.gray(`💾 Saved prompt to .clavix/outputs/prompts/fast/\n`));
    } catch (error) {
      console.log(chalk.yellow('⚠️  Could not save prompt to file system'));
    }
  }

  private generateShortHash(text: string): string {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).slice(0, 4);
  }
}
