import {
  BasePattern,
  PatternMode,
  PatternPriority,
  PatternPhase,
  PatternConfigSchema,
} from './base-pattern.js';
import { PatternContext, PatternResult, PromptIntent } from '../types.js';

/**
 * v4.5 Pattern: Output Format Enforcer
 *
 * Ensures prompts specify the expected output format, which is critical
 * for agent-first design - agents need to know exactly what to produce.
 */
export class OutputFormatEnforcer extends BasePattern {
  // -------------------------------------------------------------------------
  // Pattern Metadata (v4.5 unified types)
  // -------------------------------------------------------------------------

  readonly id = 'output-format-enforcer';
  readonly name = 'Output Format Enforcer';
  readonly description = 'Adds explicit output format specifications for agent clarity';

  readonly applicableIntents: PromptIntent[] = [
    'code-generation',
    'planning',
    'documentation',
    'prd-generation',
    'testing',
  ];

  readonly mode: PatternMode = 'both';
  readonly priority: PatternPriority = 7; // MEDIUM-HIGH - important enrichment
  readonly phases: PatternPhase[] = ['all'];

  // -------------------------------------------------------------------------
  // Configuration Schema (v4.5)
  // -------------------------------------------------------------------------

  static override readonly configSchema: PatternConfigSchema = {
    showFormatSuggestions: {
      type: 'boolean',
      default: true,
      description: 'Show format suggestions based on intent',
    },
  };

  // -------------------------------------------------------------------------
  // Pattern Data
  // -------------------------------------------------------------------------

  // Format indicators that suggest format is already specified
  private formatIndicators = [
    'output format',
    'expected output',
    'return format',
    'response format',
    'should return',
    'must return',
    'will output',
    'produces',
    'generates',
    'in the format',
    'formatted as',
    'as json',
    'as markdown',
    'as yaml',
    'as xml',
    'as csv',
    'as html',
    'code block',
    'typescript',
    'javascript',
    'python',
    'react component',
    'vue component',
  ];

  // Intent-specific format suggestions
  private intentFormats: Record<string, string[]> = {
    'code-generation': [
      'TypeScript/JavaScript function with type annotations',
      'React component with props interface',
      'Module with exports',
      'Class with methods',
      'API endpoint implementation',
    ],
    planning: [
      'Markdown task list with checkboxes',
      'Phased implementation plan',
      'Architecture decision record (ADR)',
      'Technical specification document',
    ],
    documentation: [
      'JSDoc/TSDoc comments',
      'README.md section',
      'API documentation (OpenAPI/Swagger)',
      'Code comments',
      'Tutorial/guide format',
    ],
    'prd-generation': [
      'Full PRD document with sections',
      'Quick PRD (2-3 paragraphs)',
      'User story format',
      'Requirements matrix',
    ],
    testing: [
      'Jest/Vitest test suite',
      'Test file with describe/it blocks',
      'Test cases with assertions',
      'Mock implementations',
    ],
    debugging: [
      'Root cause analysis',
      'Fix with explanation',
      'Code diff/patch',
      'Step-by-step debugging guide',
    ],
    refinement: ['Refactored code', 'Optimized implementation', 'Before/after comparison'],
    migration: ['Migration script', 'Step-by-step migration guide', 'Compatibility layer'],
    'security-review': [
      'Security audit report',
      'Vulnerability list with severity',
      'Remediation recommendations',
    ],
    learning: ['Educational explanation', 'Code examples with comments', 'Concept breakdown'],
  };

  apply(prompt: string, context: PatternContext): PatternResult {
    const lowerPrompt = prompt.toLowerCase();

    // Check if format is already specified
    const hasFormat = this.formatIndicators.some((indicator) =>
      lowerPrompt.includes(indicator.toLowerCase())
    );

    if (hasFormat) {
      return {
        enhancedPrompt: prompt,
        improvement: {
          dimension: 'actionability',
          description: 'Output format already specified',
          impact: 'low',
        },
        applied: false,
      };
    }

    // Get intent-specific format suggestions
    const intent = context.intent.primaryIntent;
    const suggestions = this.intentFormats[intent] || this.intentFormats['code-generation'];

    // Build output format section
    const formatSection = `

## Expected Output Format

Specify the desired output format:
${suggestions.map((s) => `- ${s}`).join('\n')}

**Note**: Explicit output format helps ensure consistent, usable results.`;

    return {
      enhancedPrompt: prompt + formatSection,
      improvement: {
        dimension: 'actionability',
        description: `Added output format guidance for ${intent} intent`,
        impact: 'medium',
      },
      applied: true,
    };
  }
}
