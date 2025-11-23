import { Command, Args, Flags } from '@oclif/core';
import chalk from 'chalk';
import { UniversalOptimizer } from '../../core/intelligence/index.js';
import { PromptManager } from '../../core/prompt-manager.js';
import { OptimizationResult } from '../../core/intelligence/types.js';

export default class Deep extends Command {
  static description = 'Perform comprehensive deep analysis with alternative approaches, edge cases, and validation checklists';

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
    console.log(chalk.cyan(`    • Has code context: ${result.intent.characteristics.hasCodeContext ? 'Yes' : 'No'}`));
    console.log(chalk.cyan(`    • Technical terms: ${result.intent.characteristics.hasTechnicalTerms ? 'Yes' : 'No'}`));
    console.log(chalk.cyan(`    • Open-ended: ${result.intent.characteristics.isOpenEnded ? 'Yes' : 'No'}`));
    console.log(chalk.cyan(`    • Needs structure: ${result.intent.characteristics.needsStructure ? 'Yes' : 'No'}`));
    console.log();

    // ===== Quality Metrics =====
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
        const emoji = improvement.impact === 'high' ? '🔥' : improvement.impact === 'medium' ? '⚡' : '💡';
        console.log(chalk.magenta(`  ${emoji} ${improvement.description} [${improvement.dimension}]`));
      });
      console.log();
    }

    // ===== Enhanced Prompt =====
    console.log(chalk.bold.cyan('✨ Enhanced Prompt:\n'));
    console.log(chalk.dim('─'.repeat(80)));
    console.log(result.enhanced);
    console.log(chalk.dim('─'.repeat(80)));
    console.log();

    // ===== DEEP MODE EXCLUSIVE FEATURES =====

    // Alternative Approaches (TODO: when AlternativePhrasingGenerator pattern is implemented)
    console.log(chalk.bold.cyan('🎨 Alternative Approaches:\n'));
    console.log(chalk.cyan('  1. Functional Decomposition: Break the task into smaller, testable functions'));
    console.log(chalk.cyan('  2. Test-Driven Approach: Write tests first, then implement to satisfy them'));
    console.log(chalk.cyan('  3. Example-Driven: Start with concrete input/output examples'));
    console.log(chalk.gray('  Note: Full alternative generation coming soon with deep mode patterns\n'));

    // Alternative Structures (TODO: when StructureVariationGenerator pattern is implemented)
    console.log(chalk.bold.cyan('📋 Alternative Structures:\n'));
    console.log(chalk.cyan('  Step-by-step:'));
    console.log(chalk.gray('    • Break complex task into sequential steps'));
    console.log(chalk.gray('    • Each step has clear input/output'));
    console.log(chalk.cyan('  Template-based:'));
    console.log(chalk.gray('    • Provide code/document template to fill'));
    console.log(chalk.gray('    • Reduces ambiguity with concrete structure'));
    console.log(chalk.cyan('  Example-driven:'));
    console.log(chalk.gray('    • Show concrete examples of desired output'));
    console.log(chalk.gray('    • AI learns from patterns in examples\n'));

    // Validation Checklist (TODO: when ValidationChecklistCreator pattern is implemented)
    console.log(chalk.bold.yellow('✅ Validation Checklist:\n'));
    console.log(chalk.yellow('  Before considering this task complete, verify:'));
    console.log(chalk.yellow('    ☐ Requirements match the objective stated above'));
    console.log(chalk.yellow('    ☐ All edge cases are handled (empty, null, invalid inputs)'));
    console.log(chalk.yellow('    ☐ Error handling is appropriate for the context'));
    console.log(chalk.yellow('    ☐ Output format matches specifications'));
    console.log(chalk.yellow('    ☐ Performance is acceptable for expected input sizes'));
    if (result.intent.primaryIntent === 'code-generation') {
      console.log(chalk.yellow('    ☐ Code is testable and maintainable'));
      console.log(chalk.yellow('    ☐ Security considerations addressed (injection, XSS, etc.)'));
    }
    console.log();

    // Edge Cases (TODO: when EdgeCaseIdentifier pattern is implemented)
    console.log(chalk.bold.yellow('⚠️  Edge Cases to Consider:\n'));
    if (result.intent.primaryIntent === 'code-generation') {
      console.log(chalk.yellow('  • Empty or null inputs'));
      console.log(chalk.yellow('  • Very large inputs (performance implications)'));
      console.log(chalk.yellow('  • Invalid or malformed data'));
      console.log(chalk.yellow('  • Concurrent access (if applicable)'));
      console.log(chalk.yellow('  • Network failures or timeouts (if I/O involved)'));
    } else if (result.intent.primaryIntent === 'planning') {
      console.log(chalk.yellow('  • Scope creep during implementation'));
      console.log(chalk.yellow('  • Technical constraints not identified upfront'));
      console.log(chalk.yellow('  • Timeline assumptions that may not hold'));
      console.log(chalk.yellow('  • Dependencies on external systems'));
    } else {
      console.log(chalk.yellow('  • Unexpected user behavior'));
      console.log(chalk.yellow('  • Error conditions and recovery'));
      console.log(chalk.yellow('  • Resource limitations'));
      console.log(chalk.yellow('  • Compatibility across environments'));
    }
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
    console.log(chalk.gray('💡 Tip: Use the enhanced prompt with the validation checklist and edge cases in mind\n'));
  }

  private displayAnalysisOnly(result: OptimizationResult): void {
    console.log(chalk.bold.cyan('🎯 Intent Analysis:\n'));
    console.log(chalk.cyan(`  Type: ${result.intent.primaryIntent}`));
    console.log(chalk.cyan(`  Confidence: ${result.intent.confidence}%`));
    console.log(chalk.cyan(`  Characteristics:`));
    console.log(chalk.cyan(`    • Has code context: ${result.intent.characteristics.hasCodeContext ? 'Yes' : 'No'}`));
    console.log(chalk.cyan(`    • Technical terms: ${result.intent.characteristics.hasTechnicalTerms ? 'Yes' : 'No'}`));
    console.log(chalk.cyan(`    • Open-ended: ${result.intent.characteristics.isOpenEnded ? 'Yes' : 'No'}`));
    console.log(chalk.cyan(`    • Needs structure: ${result.intent.characteristics.needsStructure ? 'Yes' : 'No'}`));
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
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const hash = this.generateShortHash(result.original);
      const filename = `deep-${timestamp}-${hash}`;

      // Format enhanced prompt as content
      const content = result.enhanced;

      await manager.savePrompt(content, 'deep', result.original);

      console.log(chalk.gray(`💾 Saved prompt to .clavix/outputs/prompts/deep/\n`));
    } catch (error) {
      console.log(chalk.yellow('⚠️  Could not save prompt to file system'));
      console.log(chalk.gray('Error: ' + (error instanceof Error ? error.message : 'Unknown error')));
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
