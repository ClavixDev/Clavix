import { Command, Args, Flags } from '@oclif/core';
import chalk from 'chalk';
import { PromptOptimizer, CLEARResult, ImprovedPrompt, CLEARScore } from '../../core/prompt-optimizer.js';
import { PromptManager } from '../../core/prompt-manager.js';

export default class Deep extends Command {
  static description = 'Perform comprehensive deep analysis using full CLEAR framework (Concise, Logical, Explicit, Adaptive, Reflective)';

  static examples = [
    '<%= config.bin %> <%= command.id %> "Create a login page"',
    '<%= config.bin %> <%= command.id %> "Build an API for user management"',
  ];

  static flags = {
    'clear-only': Flags.boolean({
      description: 'Show only CLEAR analysis without improved prompt',
      default: false,
    }),
    'framework-info': Flags.boolean({
      description: 'Display CLEAR framework information',
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

    // Handle --framework-info flag
    if (flags['framework-info']) {
      this.displayFrameworkInfo();
      return;
    }

    if (!args.prompt || args.prompt.trim().length === 0) {
      console.log(chalk.red('\n✗ Please provide a prompt to analyze\n'));
      console.log(chalk.gray('Example:'), chalk.cyan('clavix deep "Create a login page"'));
      return;
    }

    console.log(chalk.bold.cyan('\n🔍 Performing deep analysis using full CLEAR framework...\n'));

    const optimizer = new PromptOptimizer();

    // Get CLEAR analysis (deep mode - all 5 components)
    const clearResult = optimizer.applyCLEARFramework(args.prompt, 'deep');
    const clearScore = optimizer.calculateCLEARScore(clearResult);

    // Also get the full improvement result for backward compatibility
    const result = optimizer.improve(args.prompt, 'deep');

    // Handle --clear-only flag
    if (flags['clear-only']) {
      this.displayCLEAROnlyAnalysis(clearResult, clearScore);
      return;
    }

    this.displayOutput(result, clearResult, clearScore);

    // Save prompt to file system
    await this.savePrompt(clearResult.improvedPrompt, args.prompt, clearScore);
  }

  private displayOutput(result: ImprovedPrompt, clearResult: CLEARResult, clearScore: CLEARScore): void {
    console.log(chalk.bold.cyan('🎯 CLEAR Framework Deep Analysis\n'));

    // Display CLEAR Assessment (all 5 components for deep mode)
    console.log(chalk.bold('📊 Framework Assessment:\n'));

    const getScoreColor = (score: number) => {
      if (score >= 80) return chalk.green;
      if (score >= 60) return chalk.yellow;
      return chalk.red;
    };

    // C, L, E (same as fast mode)
    const cColor = getScoreColor(clearScore.conciseness);
    console.log(cColor.bold(`  [C] Concise: ${clearScore.conciseness.toFixed(0)}%`));
    if (clearResult.conciseness.suggestions.length > 0) {
      clearResult.conciseness.suggestions.slice(0, 2).forEach((s: string) => console.log(cColor(`      ${s}`)));
    }
    console.log();

    const lColor = getScoreColor(clearScore.logic);
    console.log(lColor.bold(`  [L] Logical: ${clearScore.logic.toFixed(0)}%`));
    if (clearResult.logic.suggestions.length > 0) {
      clearResult.logic.suggestions.slice(0, 2).forEach((s: string) => console.log(lColor(`      ${s}`)));
    }
    console.log();

    const eColor = getScoreColor(clearScore.explicitness);
    console.log(eColor.bold(`  [E] Explicit: ${clearScore.explicitness.toFixed(0)}%`));
    if (clearResult.explicitness.suggestions.length > 0) {
      clearResult.explicitness.suggestions.slice(0, 2).forEach((s: string) => console.log(eColor(`      ${s}`)));
    }
    console.log();

    // A, R (deep mode only)
    if (clearResult.adaptiveness) {
      const aColor = getScoreColor(clearScore.adaptiveness || 0);
      console.log(aColor.bold(`  [A] Adaptive: ${(clearScore.adaptiveness || 0).toFixed(0)}%`));
      console.log(aColor(`      See "Adaptive Variations" section below`));
      console.log();
    }

    if (clearResult.reflectiveness) {
      const rColor = getScoreColor(clearScore.reflectiveness || 0);
      console.log(rColor.bold(`  [R] Reflective: ${(clearScore.reflectiveness || 0).toFixed(0)}%`));
      console.log(rColor(`      See "Reflection Checklist" section below`));
      console.log();
    }

    // Overall
    const overallColor = getScoreColor(clearScore.overall);
    console.log(overallColor.bold(`  Overall CLEAR Score: ${clearScore.overall.toFixed(0)}% (${clearScore.rating})\n`));

    // Display improved prompt
    console.log(chalk.bold.cyan('✨ CLEAR-Optimized Prompt:\n'));
    console.log(chalk.dim('─'.repeat(80)));
    console.log(clearResult.improvedPrompt);
    console.log(chalk.dim('─'.repeat(80)));
    console.log();

    // Changes made
    if (clearResult.changesSummary.length > 0) {
      console.log(chalk.bold.magenta('📝 CLEAR Changes Made:\n'));
      clearResult.changesSummary.forEach((change: { component: string; change: string }) => {
        console.log(chalk.magenta(`  [${change.component}] ${change.change}`));
      });
      console.log();
    }

    // Adaptive Variations (A)
    if (clearResult.adaptiveness) {
      console.log(chalk.bold.cyan('🔄 Adaptive Variations:\n'));

      if (clearResult.adaptiveness.alternativePhrasings.length > 0) {
        console.log(chalk.cyan('  Alternative Phrasings:'));
        clearResult.adaptiveness.alternativePhrasings.forEach((p: string, i: number) => {
          console.log(chalk.cyan(`    ${i + 1}. ${p}`));
        });
        console.log();
      }

      if (clearResult.adaptiveness.alternativeStructures.length > 0) {
        console.log(chalk.cyan('  Alternative Structures:'));
        clearResult.adaptiveness.alternativeStructures.forEach((alt: { name: string; structure: string; benefits: string }, i: number) => {
          console.log(chalk.cyan(`    ${i + 1}. ${alt.name}`));
          console.log(chalk.gray(`       ${alt.benefits}`));
        });
        console.log();
      }

      if (clearResult.adaptiveness.temperatureRecommendation !== undefined) {
        console.log(chalk.cyan(`  Recommended Temperature: ${clearResult.adaptiveness.temperatureRecommendation}`));
        console.log();
      }
    }

    // Reflection Checklist (R)
    if (clearResult.reflectiveness) {
      console.log(chalk.bold.yellow('🤔 Reflection Checklist:\n'));

      if (clearResult.reflectiveness.validationChecklist.length > 0) {
        console.log(chalk.yellow('  Validation Steps:'));
        clearResult.reflectiveness.validationChecklist.forEach((item: string) => {
          console.log(chalk.yellow(`    ☐ ${item}`));
        });
        console.log();
      }

      if (clearResult.reflectiveness.edgeCases.length > 0) {
        console.log(chalk.yellow('  Edge Cases to Consider:'));
        clearResult.reflectiveness.edgeCases.forEach((ec: string) => {
          console.log(chalk.yellow(`    • ${ec}`));
        });
        console.log();
      }

      if (clearResult.reflectiveness.potentialIssues.length > 0) {
        console.log(chalk.yellow('  What Could Go Wrong:'));
        clearResult.reflectiveness.potentialIssues.forEach((issue: string) => {
          console.log(chalk.yellow(`    • ${issue}`));
        });
        console.log();
      }

      if (clearResult.reflectiveness.factCheckingSteps.length > 0) {
        console.log(chalk.yellow('  Fact-Checking Steps:'));
        clearResult.reflectiveness.factCheckingSteps.forEach((step: string) => {
          console.log(chalk.yellow(`    • ${step}`));
        });
        console.log();
      }
    }

    console.log(chalk.gray('💡 Full CLEAR framework analysis complete!\n'));
  }

  private displayCLEAROnlyAnalysis(clearResult: CLEARResult, clearScore: CLEARScore): void {
    console.log(chalk.bold.cyan('🎯 CLEAR Framework Analysis Only (Deep Mode)\n'));

    const getScoreColor = (score: number) => {
      if (score >= 80) return chalk.green;
      if (score >= 60) return chalk.yellow;
      return chalk.red;
    };

    console.log(chalk.bold('📊 Complete CLEAR Assessment:\n'));

    // Conciseness
    const cColor = getScoreColor(clearScore.conciseness);
    console.log(cColor.bold(`  [C] Conciseness: ${clearScore.conciseness.toFixed(0)}%`));
    console.log(cColor(`      Verbosity: ${clearResult.conciseness.verbosityCount} instances`));
    console.log(cColor(`      Pleasantries: ${clearResult.conciseness.pleasantriesCount} instances`));
    console.log(cColor(`      Signal-to-noise: ${clearResult.conciseness.signalToNoiseRatio.toFixed(2)}`));
    clearResult.conciseness.issues.forEach((issue: string) => {
      console.log(cColor(`      • ${issue}`));
    });
    console.log();

    // Logic
    const lColor = getScoreColor(clearScore.logic);
    console.log(lColor.bold(`  [L] Logic: ${clearScore.logic.toFixed(0)}%`));
    console.log(lColor(`      Coherent Flow: ${clearResult.logic.hasCoherentFlow ? 'Yes' : 'No'}`));
    clearResult.logic.issues.forEach((issue: string) => {
      console.log(lColor(`      • ${issue}`));
    });
    console.log();

    // Explicitness
    const eColor = getScoreColor(clearScore.explicitness);
    console.log(eColor.bold(`  [E] Explicitness: ${clearScore.explicitness.toFixed(0)}%`));
    console.log(eColor(`      Persona: ${clearResult.explicitness.hasPersona ? '✓' : '✗'}`));
    console.log(eColor(`      Output Format: ${clearResult.explicitness.hasOutputFormat ? '✓' : '✗'}`));
    console.log(eColor(`      Tone/Style: ${clearResult.explicitness.hasToneStyle ? '✓' : '✗'}`));
    console.log(eColor(`      Success Criteria: ${clearResult.explicitness.hasSuccessCriteria ? '✓' : '✗'}`));
    console.log(eColor(`      Examples: ${clearResult.explicitness.hasExamples ? '✓' : '✗'}`));
    clearResult.explicitness.issues.forEach((issue: string) => {
      console.log(eColor(`      • ${issue}`));
    });
    console.log();

    // Adaptiveness
    if (clearResult.adaptiveness) {
      const aColor = getScoreColor(clearScore.adaptiveness || 0);
      console.log(aColor.bold(`  [A] Adaptiveness: ${(clearScore.adaptiveness || 0).toFixed(0)}%`));
      console.log(aColor(`      Alternative Phrasings: ${clearResult.adaptiveness.alternativePhrasings.length}`));
      console.log(aColor(`      Alternative Structures: ${clearResult.adaptiveness.alternativeStructures.length}`));
      console.log(aColor(`      Temperature: ${clearResult.adaptiveness.temperatureRecommendation}`));
      clearResult.adaptiveness.issues.forEach((issue: string) => {
        console.log(aColor(`      • ${issue}`));
      });
      console.log();
    }

    // Reflectiveness
    if (clearResult.reflectiveness) {
      const rColor = getScoreColor(clearScore.reflectiveness || 0);
      console.log(rColor.bold(`  [R] Reflectiveness: ${(clearScore.reflectiveness || 0).toFixed(0)}%`));
      console.log(rColor(`      Validation Checks: ${clearResult.reflectiveness.validationChecklist.length}`));
      console.log(rColor(`      Edge Cases: ${clearResult.reflectiveness.edgeCases.length}`));
      console.log(rColor(`      Potential Issues: ${clearResult.reflectiveness.potentialIssues.length}`));
      console.log(rColor(`      Fact-Checking Steps: ${clearResult.reflectiveness.factCheckingSteps.length}`));
      clearResult.reflectiveness.issues.forEach((issue: string) => {
        console.log(rColor(`      • ${issue}`));
      });
      console.log();
    }

    // Overall
    const overallColor = getScoreColor(clearScore.overall);
    console.log(overallColor.bold(`  Overall Score: ${clearScore.overall.toFixed(0)}% (${clearScore.rating})\n`));

    console.log(chalk.gray('Use without --clear-only flag to see improved prompt and detailed sections.\n'));
  }

  private async savePrompt(improvedPrompt: string, originalPrompt: string, clearScore: CLEARScore): Promise<void> {
    try {
      const promptManager = new PromptManager();

      // Build content with full CLEAR scores (including A and R)
      const content = `# Improved Prompt

${improvedPrompt}

## CLEAR Scores (Deep Analysis)
- **C** (Conciseness): ${clearScore.conciseness.toFixed(0)}%
- **L** (Logic): ${clearScore.logic.toFixed(0)}%
- **E** (Explicitness): ${clearScore.explicitness.toFixed(0)}%
- **A** (Adaptiveness): ${(clearScore.adaptiveness || 0).toFixed(0)}%
- **R** (Reflectiveness): ${(clearScore.reflectiveness || 0).toFixed(0)}%
- **Overall**: ${clearScore.overall.toFixed(0)}% (${clearScore.rating})

## Original Prompt
\`\`\`
${originalPrompt}
\`\`\`
`;

      const metadata = await promptManager.savePrompt(content, 'deep', originalPrompt);

      console.log(chalk.green(`\n✅ Prompt saved to: ${metadata.filename}`));
      console.log(chalk.cyan(`\n💡 Next steps:`));
      console.log(chalk.cyan(`   /clavix:execute    - Implement this prompt`));
      console.log(chalk.cyan(`   /clavix:prompts    - Review all saved prompts`));
      console.log();
    } catch (error) {
      // Don't fail the command if saving fails
      console.log(chalk.yellow(`\n⚠️  Could not save prompt: ${error}`));
    }
  }

  private displayFrameworkInfo(): void {
    console.log(chalk.bold.cyan('\n🎯 CLEAR Framework for Prompt Engineering\n'));

    console.log(chalk.bold('What is CLEAR?\n'));
    console.log('CLEAR is an academically-validated framework for creating effective prompts:');
    console.log();

    console.log(chalk.green.bold('  [C] Concise'));
    console.log(chalk.green('      Eliminate verbosity and pleasantries'));
    console.log(chalk.green('      Focus on essential information'));
    console.log(chalk.green('      Example: "Please could you maybe help" → "Create"'));
    console.log();

    console.log(chalk.blue.bold('  [L] Logical'));
    console.log(chalk.blue('      Ensure coherent sequencing'));
    console.log(chalk.blue('      Structure: Context → Requirements → Constraints → Output'));
    console.log(chalk.blue('      Example: Put background before asking for results'));
    console.log();

    console.log(chalk.yellow.bold('  [E] Explicit'));
    console.log(chalk.yellow('      Specify persona, format, tone, and success criteria'));
    console.log(chalk.yellow('      Define exactly what you want'));
    console.log(chalk.yellow('      Example: "Build a dashboard" → "Build a React analytics dashboard with charts"'));
    console.log();

    console.log(chalk.magenta.bold('  [A] Adaptive'));
    console.log(chalk.magenta('      Provide alternative approaches'));
    console.log(chalk.magenta('      Flexibility and customization'));
    console.log(chalk.magenta('      Example: User story, job story, or structured formats'));
    console.log();

    console.log(chalk.cyan.bold('  [R] Reflective'));
    console.log(chalk.cyan('      Enable validation and quality checks'));
    console.log(chalk.cyan('      Edge cases and "what could go wrong"'));
    console.log(chalk.cyan('      Example: Fact-checking steps, success criteria validation'));
    console.log();

    console.log(chalk.bold('Academic Foundation:\n'));
    console.log('  Developed by: Dr. Leo Lo');
    console.log('  Institution: Dean of Libraries, University of New Mexico');
    console.log('  Published: Journal of Academic Librarianship, July 2023');
    console.log('  Paper: "The CLEAR Path: A Framework for Enhancing Information');
    console.log('         Literacy through Prompt Engineering"');
    console.log();

    console.log(chalk.bold('Resources:\n'));
    console.log('  • Framework Guide: https://guides.library.tamucc.edu/prompt-engineering/clear');
    console.log('  • Research Paper: https://digitalrepository.unm.edu/cgi/viewcontent.cgi?article=1214&context=ulls_fsp');
    console.log();

    console.log(chalk.bold('Usage in Clavix:\n'));
    console.log(chalk.cyan('  clavix fast "prompt"') + chalk.gray('     # Uses C, L, E components'));
    console.log(chalk.cyan('  clavix deep "prompt"') + chalk.gray('     # Uses full CLEAR (C, L, E, A, R)'));
    console.log(chalk.cyan('  clavix deep --clear-only') + chalk.gray(' # Show scores only, no improvement'));
    console.log();
  }
}
