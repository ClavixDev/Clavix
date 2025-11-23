import { Command, Flags } from '@oclif/core';
import chalk from 'chalk';
import inquirer from 'inquirer';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs-extra';
import { QuestionEngine } from '../../core/question-engine.js';
import { PrdGenerator } from '../../core/prd-generator.js';
import { UniversalOptimizer } from '../../core/intelligence/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default class Prd extends Command {
  static description = 'Launch Clavix Planning Mode - transform ideas into structured PRDs through strategic questions';

  static examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> --quick',
    '<%= config.bin %> <%= command.id %> --project my-app',
  ];

  static flags = {
    quick: Flags.boolean({
      char: 'q',
      description: 'Use quick mode with fewer questions',
      default: false,
    }),
    project: Flags.string({
      char: 'p',
      description: 'Project name for organizing outputs',
    }),
    template: Flags.string({
      char: 't',
      description: 'Path to custom question template',
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(Prd);

    console.log(chalk.bold.cyan('\n🔑 Clavix Planning Mode\n'));
    console.log(chalk.gray('Transform your idea into structured requirements through strategic questions.\n'));
    console.log(chalk.gray('This will generate two documents:'));
    console.log(chalk.gray('  📄 Full PRD - Comprehensive team-facing document'));
    console.log(chalk.gray('  ⚡ Quick PRD - AI-optimized 2-3 paragraph version\n'));

    try {
      // Initialize QuestionEngine
      const engine = new QuestionEngine();

      // Determine template path
      const templatePath = flags.template ||
        path.join(__dirname, '../../templates/prd-questions.md');

      // Load question flow
      console.log(chalk.dim('Loading questions...\n'));
      const flow = await engine.loadFlow(templatePath);

      console.log(chalk.bold(`${flow.name}`));
      console.log(chalk.gray(flow.description));
      console.log();

      // Collect answers through Socratic questioning
      const answers: Record<string, unknown> = {};
      let question = engine.getNextQuestion();
      let detectedStack: string | null = null;
      let stackDetectionDone = false;

      while (question) {
        const progress = engine.getProgress();
        console.log(chalk.dim(`[${progress.current + 1}/${progress.total}]`));

        let answer;
        if (question.type === 'confirm') {
          const response = await inquirer.prompt([
            {
              type: 'confirm',
              name: 'answer',
              message: question.text,
              default: question.default as boolean,
            },
          ]);
          answer = response.answer;
        } else if (question.type === 'list' && question.choices) {
          const response = await inquirer.prompt([
            {
              type: 'list',
              name: 'answer',
              message: question.text,
              choices: question.choices,
            },
          ]);
          answer = response.answer;
        } else {
          // Text input
          const currentQuestion = question;

          // Special handling for tech stack question - auto-detect
          if (question.id === 'techStack' && !stackDetectionDone) {
            detectedStack = await this.detectProjectTechStack();
            stackDetectionDone = true;

            if (detectedStack) {
              console.log(chalk.cyan(`\n💡 Detected: ${detectedStack}\n`));
              const useDetected = await inquirer.prompt([
                {
                  type: 'confirm',
                  name: 'use',
                  message: 'Use detected tech stack?',
                  default: true,
                },
              ]);

              if (useDetected.use) {
                answer = detectedStack;
                engine.submitAnswer(question.id, answer);
                question = engine.getNextQuestion();
                continue;
              }
            }
          }

          const response = await inquirer.prompt([
            {
              type: 'input',
              name: 'answer',
              message: question.text,
              default: question.default,
              validate: question.validate || ((input: string) => {
                if (currentQuestion.required && !input.trim()) {
                  return 'This field is required';
                }
                return true;
              }),
            },
          ]);
          answer = response.answer;
        }

        // Submit answer and get next question
        engine.submitAnswer(question.id, answer);
        answers[question.id] = answer;
        question = engine.getNextQuestion();

        console.log();
      }

      console.log(chalk.green('\n✓ All questions answered\n'));

      // Determine project name
      const projectName = flags.project || this.deriveProjectName(answers);

      // Generate PRD documents
      console.log(chalk.cyan('📝 Generating PRD documents...\n'));

      const generator = new PrdGenerator();
      const outputPath = path.join(process.cwd(), '.clavix', 'outputs', projectName);

      await fs.ensureDir(outputPath);

      // Generate both full and quick PRDs
      await generator.generateFullPrd(answers, outputPath);
      await generator.generateQuickPrd(answers, outputPath);

      console.log(chalk.green('✓ PRD documents generated\n'));

      // Validate the quick PRD for AI consumption quality
      await this.validatePrdQuality(outputPath);

      // Display output locations
      console.log(chalk.bold.cyan('📄 Documents Generated:\n'));
      console.log(chalk.cyan(`  • full-prd.md - Comprehensive team-facing document`));
      console.log(chalk.cyan(`  • quick-prd.md - AI-optimized 2-3 paragraph version\n`));
      console.log(chalk.gray(`Location: ${outputPath}\n`));

      // Next steps
      console.log(chalk.bold.blue('💡 Next Steps:\n'));
      console.log(chalk.blue('  1. Review the generated documents'));
      console.log(chalk.blue('  2. Run: clavix plan (generate task breakdown)'));
      console.log(chalk.blue('  3. Run: clavix implement (start implementation)\n'));

    } catch (error) {
      if (error instanceof Error) {
        console.log(chalk.red(`\n✗ Error: ${error.message}\n`));
      } else {
        console.log(chalk.red('\n✗ An unexpected error occurred\n'));
      }
      this.exit(1);
    }
  }

  /**
   * Derive a project name from the answers
   */
  private deriveProjectName(answers: Record<string, unknown>): string {
    // Try to extract from first answer (usually "what are we building")
    const firstAnswer = Object.values(answers)[0];

    if (typeof firstAnswer === 'string') {
      // Extract first few words, convert to kebab-case
      const words = firstAnswer.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .split(/\s+/)
        .filter(w => w.length > 0)
        .slice(0, 3);

      if (words.length > 0) {
        return words.join('-');
      }
    }

    // Fallback to timestamp
    return `project-${Date.now()}`;
  }

  /**
   * Auto-detect project tech stack from common config files
   */
  private async detectProjectTechStack(): Promise<string | null> {
    const detectedTech: string[] = [];

    try {
      // Check package.json (Node.js/JavaScript)
      if (await fs.pathExists('package.json')) {
        const pkg = await fs.readJson('package.json');
        const deps = { ...pkg.dependencies, ...pkg.devDependencies };

        // Detect popular frameworks
        if (deps.react) detectedTech.push('React');
        if (deps.vue) detectedTech.push('Vue');
        if (deps.angular) detectedTech.push('Angular');
        if (deps.next) detectedTech.push('Next.js');
        if (deps.astro) detectedTech.push('Astro');
        if (deps.tailwindcss) detectedTech.push('Tailwind CSS');
        if (deps.typescript) detectedTech.push('TypeScript');
        if (deps.express) detectedTech.push('Express');
        if (deps.fastify) detectedTech.push('Fastify');

        if (detectedTech.length === 0) detectedTech.push('Node.js');
      }

      // Check requirements.txt (Python)
      if (await fs.pathExists('requirements.txt')) {
        const content = await fs.readFile('requirements.txt', 'utf-8');
        if (content.includes('django')) detectedTech.push('Django');
        if (content.includes('flask')) detectedTech.push('Flask');
        if (content.includes('fastapi')) detectedTech.push('FastAPI');
        if (detectedTech.length === 0) detectedTech.push('Python');
      }

      // Check Gemfile (Ruby)
      if (await fs.pathExists('Gemfile')) {
        const content = await fs.readFile('Gemfile', 'utf-8');
        if (content.includes('rails')) detectedTech.push('Rails');
        if (detectedTech.length === 0) detectedTech.push('Ruby');
      }

      // Check go.mod (Go)
      if (await fs.pathExists('go.mod')) {
        detectedTech.push('Go');
      }

      // Check Cargo.toml (Rust)
      if (await fs.pathExists('Cargo.toml')) {
        detectedTech.push('Rust');
      }

      // Check composer.json (PHP)
      if (await fs.pathExists('composer.json')) {
        const composer = await fs.readJson('composer.json');
        if (composer.require?.['laravel/framework']) detectedTech.push('Laravel');
        if (composer.require?.['symfony/symfony']) detectedTech.push('Symfony');
        if (detectedTech.length === 0) detectedTech.push('PHP');
      }

      if (detectedTech.length > 0) {
        return detectedTech.join(', ');
      }

      return null;
    } catch {
      return null;
    }
  }

  /**
   * Validate the generated quick-prd.md for AI consumption quality
   */
  private async validatePrdQuality(outputPath: string): Promise<void> {
    try {
      const quickPrdPath = path.join(outputPath, 'quick-prd.md');

      // Read the generated quick-prd.md
      const prdContent = await fs.readFile(quickPrdPath, 'utf-8');

      console.log(chalk.bold.cyan('✅ Validating Quick PRD Quality\n'));
      console.log(chalk.gray('Analyzing for AI consumption quality...\n'));

      // Run quality assessment
      const optimizer = new UniversalOptimizer();
      const result = await optimizer.optimize(prdContent, 'fast');

      const getScoreColor = (score: number) => {
        if (score >= 80) return chalk.green;
        if (score >= 60) return chalk.yellow;
        return chalk.red;
      };

      // Display quality assessment
      console.log(chalk.bold('📊 Quality Assessment:\n'));

      console.log(getScoreColor(result.quality.clarity)(`  Clarity: ${result.quality.clarity.toFixed(0)}%`));
      console.log(getScoreColor(result.quality.structure)(`  Structure: ${result.quality.structure.toFixed(0)}%`));
      console.log(getScoreColor(result.quality.completeness)(`  Completeness: ${result.quality.completeness.toFixed(0)}%`));
      console.log(getScoreColor(result.quality.overall).bold(`\n  Overall: ${result.quality.overall.toFixed(0)}%\n`));

      if (result.quality.overall >= 80) {
        console.log(chalk.green('✨ Excellent! Your Quick PRD is AI-ready.\n'));
      } else if (result.quality.overall >= 70) {
        console.log(chalk.yellow('✓ Good quality. Consider the suggestions below:\n'));
        if (result.quality.improvements && result.quality.improvements.length > 0) {
          result.quality.improvements.forEach((imp: string) => {
            console.log(chalk.yellow(`  • ${imp}`));
          });
          console.log();
        }
      } else {
        console.log(chalk.yellow('💡 Suggestions for improvement:\n'));
        if (result.quality.improvements && result.quality.improvements.length > 0) {
          result.quality.improvements.forEach((imp: string) => {
            console.log(chalk.yellow(`  • ${imp}`));
          });
          console.log();
        }
      }

    } catch (error) {
      console.log(chalk.yellow('⚠️  Could not validate PRD quality'));
      console.log(chalk.gray('Continuing without validation...\n'));
    }
  }
}
