import {
  BasePattern,
  PatternMode,
  PatternPriority,
  PatternPhase,
  PatternConfigSchema,
} from './base-pattern.js';
import { PatternContext, PatternResult, PromptIntent } from '../types.js';

/**
 * v4.5 Pattern: Objective Clarifier
 *
 * Extracts or infers clear goal statement from prompts.
 * Ensures every prompt has an explicit objective section.
 */
export class ObjectiveClarifier extends BasePattern {
  // -------------------------------------------------------------------------
  // Pattern Metadata (v4.5 unified types)
  // -------------------------------------------------------------------------

  readonly id = 'objective-clarifier';
  readonly name = 'Objective Clarifier';
  readonly description = 'Extracts or infers clear goal statement';

  readonly applicableIntents: PromptIntent[] = [
    'code-generation',
    'planning',
    'refinement',
    'debugging',
    'documentation',
  ];

  readonly mode: PatternMode = 'both';
  readonly priority: PatternPriority = 9; // VERY HIGH - structural integrity
  readonly phases: PatternPhase[] = ['all'];

  // -------------------------------------------------------------------------
  // Configuration Schema (v4.5)
  // -------------------------------------------------------------------------

  static override readonly configSchema: PatternConfigSchema = {
    inferFromContext: {
      type: 'boolean',
      default: true,
      description: 'Attempt to infer objective when not explicitly stated',
    },
    addHeaderPrefix: {
      type: 'boolean',
      default: true,
      description: 'Add "# Objective" header prefix when adding objective',
    },
  };

  // -------------------------------------------------------------------------
  // Pattern Application
  // -------------------------------------------------------------------------

  apply(prompt: string, context: PatternContext): PatternResult {
    // Check if prompt already has clear objective section
    if (this.hasExplicitObjective(prompt)) {
      return {
        enhancedPrompt: prompt,
        improvement: {
          dimension: 'clarity',
          description: 'Objective already clearly stated',
          impact: 'low',
        },
        applied: false,
      };
    }

    // Extract or infer objective
    const objective = this.extractObjective(prompt, context.intent.primaryIntent);

    // If we couldn't infer a clear objective, just ensure it's at the top
    if (!objective) {
      return {
        enhancedPrompt: prompt,
        improvement: {
          dimension: 'clarity',
          description: 'Could not infer clear objective',
          impact: 'low',
        },
        applied: false,
      };
    }

    // Add objective section
    const enhanced = `# Objective\n${objective}\n\n${prompt}`;

    return {
      enhancedPrompt: enhanced,
      improvement: {
        dimension: 'clarity',
        description: 'Added clear objective statement',
        impact: 'high',
      },
      applied: true,
    };
  }

  private hasExplicitObjective(prompt: string): boolean {
    const objectiveMarkers = [/^#+ objective/im, /^objective:/im, /^goal:/im, /^purpose:/im];

    return objectiveMarkers.some((marker) => marker.test(prompt));
  }

  private extractObjective(prompt: string, intent: PromptIntent): string | null {
    const lowerPrompt = prompt.toLowerCase();

    // Look for explicit goal statements
    const goalPatterns = [
      /(?:i need to|i want to|i'm trying to|goal is to|objective is to|purpose is to)\s+(.+?)(?:\.|$)/i,
      /(?:create|build|make|implement|develop|write)\s+(.+?)(?:\.|$)/i,
    ];

    for (const pattern of goalPatterns) {
      const match = prompt.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    // Intent-specific inference
    if (intent === 'code-generation') {
      if (lowerPrompt.includes('function')) {
        return 'Create a function that meets the specified requirements';
      } else if (lowerPrompt.includes('component')) {
        return 'Build a component with the described functionality';
      } else if (lowerPrompt.includes('api')) {
        return 'Implement an API endpoint as specified';
      }
    } else if (intent === 'debugging') {
      return 'Fix the identified error or bug';
    } else if (intent === 'refinement') {
      return 'Improve and optimize the existing code';
    } else if (intent === 'documentation') {
      return 'Provide clear documentation and explanation';
    } else if (intent === 'planning') {
      return 'Plan and design the described system or feature';
    }

    return null;
  }
}
