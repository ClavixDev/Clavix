import {
  BasePattern,
  PatternMode,
  PatternPriority,
  PatternPhase,
  PatternConfigSchema,
} from './base-pattern.js';
import { PatternContext, PatternResult, PromptIntent } from '../types.js';

/**
 * v4.5 Pattern: Success Criteria Enforcer
 *
 * Ensures prompts include measurable success criteria. Agents need to know
 * when they've successfully completed a task - this pattern adds that clarity.
 */
export class SuccessCriteriaEnforcer extends BasePattern {
  // -------------------------------------------------------------------------
  // Pattern Metadata (v4.5 unified types)
  // -------------------------------------------------------------------------

  readonly id = 'success-criteria-enforcer';
  readonly name = 'Success Criteria Enforcer';
  readonly description = 'Adds measurable success criteria for task completion validation';

  readonly applicableIntents: PromptIntent[] = [
    'code-generation',
    'planning',
    'refinement',
    'debugging',
    'testing',
    'migration',
    'prd-generation',
  ];

  readonly mode: PatternMode = 'both';
  readonly priority: PatternPriority = 7; // MEDIUM-HIGH - important enrichment
  readonly phases: PatternPhase[] = ['all'];

  // -------------------------------------------------------------------------
  // Configuration Schema (v4.5)
  // -------------------------------------------------------------------------

  static override readonly configSchema: PatternConfigSchema = {
    showCheckboxes: {
      type: 'boolean',
      default: true,
      description: 'Show criteria as checkboxes for progress tracking',
    },
  };

  // -------------------------------------------------------------------------
  // Pattern Data
  // -------------------------------------------------------------------------

  // Indicators that success criteria already exist
  private successIndicators = [
    'success criteria',
    'acceptance criteria',
    'done when',
    'complete when',
    'must pass',
    'should pass',
    'test coverage',
    'meets requirements',
    'criteria:',
    'requirements:',
    'must have',
    'must include',
    'validation:',
    'verify that',
    'ensure that',
    'should be able to',
  ];

  // Intent-specific success criteria templates
  private intentCriteria: Record<string, string[]> = {
    'code-generation': [
      'Code compiles/transpiles without errors',
      'All tests pass (if tests are written)',
      'Follows project coding standards',
      'No TypeScript/linting errors',
      'Functionality matches requirements',
      'Edge cases are handled',
    ],
    planning: [
      'All requirements are addressed',
      'Tasks are atomic and actionable',
      'Dependencies are identified',
      'Timeline/phases are realistic',
      'Risks are documented',
    ],
    refinement: [
      'Improved metrics (specify: performance, readability, etc.)',
      'No regression in functionality',
      'Tests still pass',
      'Code review approved',
    ],
    debugging: [
      'Bug is reproducible and root cause identified',
      'Fix addresses root cause, not symptom',
      'No new bugs introduced',
      'Regression test added',
    ],
    testing: [
      'Test coverage meets threshold (e.g., >80%)',
      'All critical paths tested',
      'Edge cases covered',
      'Tests are deterministic (no flaky tests)',
      'Test execution time is reasonable',
    ],
    migration: [
      'All features work as before',
      'No data loss',
      'Performance is not degraded',
      'Rollback plan exists',
      'Documentation is updated',
    ],
    'prd-generation': [
      'All sections are complete',
      'Requirements are unambiguous',
      'Technical constraints are specified',
      'Success metrics are measurable',
      'Scope is clearly defined',
    ],
    documentation: [
      'All public APIs are documented',
      'Examples are provided',
      'Instructions are testable',
      'No broken links',
    ],
    'security-review': [
      'All OWASP Top 10 checked',
      'Vulnerabilities are prioritized',
      'Remediation steps are provided',
      'No false positives',
    ],
    learning: [
      'Concept is explained clearly',
      'Examples demonstrate the concept',
      'Reader can apply knowledge',
    ],
  };

  apply(prompt: string, context: PatternContext): PatternResult {
    const lowerPrompt = prompt.toLowerCase();

    // Check if success criteria already exist
    const hasCriteria = this.successIndicators.some((indicator) =>
      lowerPrompt.includes(indicator.toLowerCase())
    );

    if (hasCriteria) {
      return {
        enhancedPrompt: prompt,
        improvement: {
          dimension: 'completeness',
          description: 'Success criteria already specified',
          impact: 'low',
        },
        applied: false,
      };
    }

    // Get intent-specific criteria
    const intent = context.intent.primaryIntent;
    const criteria = this.intentCriteria[intent] || this.intentCriteria['code-generation'];

    // Build success criteria section
    const criteriaSection = `

## Success Criteria

This task is complete when:
${criteria.map((c) => `- [ ] ${c}`).join('\n')}

**Tip**: Check off criteria as you complete them to track progress.`;

    return {
      enhancedPrompt: prompt + criteriaSection,
      improvement: {
        dimension: 'completeness',
        description: `Added ${criteria.length} measurable success criteria for ${intent}`,
        impact: 'medium',
      },
      applied: true,
    };
  }
}
