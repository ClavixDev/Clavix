import {
  BasePattern,
  PatternMode,
  PatternPriority,
  PatternPhase,
  PatternConfigSchema,
} from './base-pattern.js';
import { PatternContext, PatternResult, PromptIntent } from '../types.js';

/**
 * v4.5 Pattern: Prerequisite Identifier
 *
 * Identifies and explicitly states prerequisites and dependencies
 * that must be in place before the task can be executed.
 */
export class PrerequisiteIdentifier extends BasePattern {
  // -------------------------------------------------------------------------
  // Pattern Metadata (v4.5 unified types)
  // -------------------------------------------------------------------------

  readonly id = 'prerequisite-identifier';
  readonly name = 'Prerequisite Identifier';
  readonly description =
    'Identifies and documents prerequisites and dependencies for task execution';

  readonly applicableIntents: PromptIntent[] = [
    'code-generation',
    'planning',
    'migration',
    'testing',
    'debugging',
  ];

  readonly mode: PatternMode = 'deep';
  readonly priority: PatternPriority = 6; // MEDIUM - standard enhancement
  readonly phases: PatternPhase[] = ['all'];

  // -------------------------------------------------------------------------
  // Configuration Schema (v4.5)
  // -------------------------------------------------------------------------

  static override readonly configSchema: PatternConfigSchema = {
    maxPrerequisites: {
      type: 'number',
      default: 8,
      description: 'Maximum number of prerequisites to list',
      validation: { min: 1, max: 15 },
    },
    maxTechnologies: {
      type: 'number',
      default: 3,
      description: 'Maximum number of technologies to detect',
      validation: { min: 1, max: 5 },
    },
  };

  // -------------------------------------------------------------------------
  // Pattern Data
  // -------------------------------------------------------------------------

  // Keywords that suggest prerequisites are already addressed
  private prerequisiteIndicators = [
    'prerequisite',
    'requirements:',
    'depends on',
    'dependency',
    'requires',
    'before starting',
    'first ensure',
    'make sure',
    'assuming',
    'given that',
    'setup:',
    'installation:',
    'configuration:',
  ];

  // Technology-specific prerequisites
  private techPrerequisites: Record<string, string[]> = {
    react: [
      'Node.js >= 16.x installed',
      'npm or yarn package manager',
      'React project initialized (create-react-app, Vite, or Next.js)',
      'TypeScript configured (if using TS)',
    ],
    node: [
      'Node.js >= 16.x installed',
      'npm/yarn/pnpm package manager',
      'package.json initialized',
    ],
    typescript: [
      'TypeScript installed',
      'tsconfig.json configured',
      'Build tooling setup (tsc, esbuild, swc)',
    ],
    database: [
      'Database server running',
      'Database connection credentials',
      'Database client/ORM installed',
      'Schema/migrations up to date',
    ],
    api: [
      'API endpoint accessible',
      'Authentication tokens/keys available',
      'API documentation available',
      'Rate limits understood',
    ],
    testing: [
      'Test framework installed (Jest, Vitest, etc.)',
      'Test configuration files present',
      'Test database/mocks available',
    ],
    docker: [
      'Docker installed and running',
      'Docker Compose (if using)',
      'Container registry access (if pulling images)',
    ],
    aws: [
      'AWS CLI installed and configured',
      'IAM credentials with appropriate permissions',
      'AWS SDK installed',
    ],
    git: [
      'Git installed',
      'Repository cloned',
      'Correct branch checked out',
      'No uncommitted changes (or staged appropriately)',
    ],
  };

  // Intent-specific prerequisites
  private intentPrerequisites: Record<string, string[]> = {
    'code-generation': [
      'Development environment set up',
      'Required dependencies installed',
      'Coding standards/style guide available',
    ],
    migration: [
      'Backup of existing data/code',
      'Migration plan documented',
      'Rollback strategy defined',
      'Downtime window scheduled (if applicable)',
    ],
    testing: [
      'Code to be tested is implemented',
      'Test data/fixtures available',
      'CI/CD pipeline configured (for automated tests)',
    ],
    debugging: [
      'Bug is reproducible',
      'Relevant logs available',
      'Debug tools configured',
      'Access to failing environment',
    ],
    planning: [
      'Requirements documented',
      'Stakeholder input collected',
      'Timeline/constraints known',
    ],
  };

  apply(prompt: string, context: PatternContext): PatternResult {
    const lowerPrompt = prompt.toLowerCase();

    // Check if prerequisites are already addressed
    const hasPrerequisites = this.prerequisiteIndicators.some((indicator) =>
      lowerPrompt.includes(indicator.toLowerCase())
    );

    if (hasPrerequisites) {
      return {
        enhancedPrompt: prompt,
        improvement: {
          dimension: 'completeness',
          description: 'Prerequisites already specified',
          impact: 'low',
        },
        applied: false,
      };
    }

    // Detect technologies mentioned
    const detectedTech: string[] = [];
    const techKeywords: Record<string, RegExp> = {
      react: /\b(react|jsx|tsx|component|hook|useState|useEffect)\b/i,
      node: /\b(node|express|koa|fastify|npm|yarn|pnpm)\b/i,
      typescript: /\b(typescript|ts|tsx|type|interface)\b/i,
      database: /\b(database|db|sql|postgres|mysql|mongo|redis|prisma|sequelize)\b/i,
      api: /\b(api|rest|graphql|endpoint|fetch|axios|http)\b/i,
      testing: /\b(test|jest|vitest|mocha|cypress|playwright)\b/i,
      docker: /\b(docker|container|kubernetes|k8s|compose)\b/i,
      aws: /\b(aws|s3|lambda|ec2|dynamodb|cloudformation)\b/i,
      git: /\b(git|commit|branch|merge|pull request|pr)\b/i,
    };

    for (const [tech, regex] of Object.entries(techKeywords)) {
      if (regex.test(prompt)) {
        detectedTech.push(tech);
      }
    }

    // Collect prerequisites
    const prerequisites: string[] = [];

    // Add intent-specific prerequisites
    const intent = context.intent.primaryIntent;
    const intentPrereqs = this.intentPrerequisites[intent] || [];
    prerequisites.push(...intentPrereqs);

    // Add tech-specific prerequisites
    for (const tech of detectedTech.slice(0, 3)) {
      // Limit to 3 technologies
      const techPrereqs = this.techPrerequisites[tech] || [];
      prerequisites.push(...techPrereqs.slice(0, 2)); // 2 per technology
    }

    // Deduplicate and limit
    const uniquePrereqs = [...new Set(prerequisites)].slice(0, 8);

    if (uniquePrereqs.length === 0) {
      return {
        enhancedPrompt: prompt,
        improvement: {
          dimension: 'completeness',
          description: 'No specific prerequisites detected',
          impact: 'low',
        },
        applied: false,
      };
    }

    // Build prerequisites section
    const prereqSection = `

## Prerequisites

Before starting this task, ensure:
${uniquePrereqs.map((p) => `- [ ] ${p}`).join('\n')}

**Note**: Check prerequisites to avoid blockers during implementation.`;

    return {
      enhancedPrompt: prompt + prereqSection,
      improvement: {
        dimension: 'completeness',
        description: `Added ${uniquePrereqs.length} prerequisites for ${detectedTech.join(', ') || intent}`,
        impact: 'medium',
      },
      applied: true,
    };
  }
}
