import { BasePattern } from './base-pattern.js';
import { PatternContext, PatternResult, PromptIntent } from '../types.js';

/**
 * ErrorToleranceEnhancer Pattern (v4.1)
 *
 * Adds error handling requirements and considerations to prompts.
 * Ensures implementations are robust and handle failure gracefully.
 */
export class ErrorToleranceEnhancer extends BasePattern {
  id = 'error-tolerance-enhancer';
  name = 'Error Tolerance Enhancer';
  description = 'Adds error handling requirements and failure mode considerations';
  applicableIntents: PromptIntent[] = [
    'code-generation',
    'refinement',
    'debugging',
    'migration',
    'testing',
  ];
  mode: 'fast' | 'deep' | 'both' = 'deep'; // Only in deep mode for comprehensive analysis
  priority = 5; // Medium priority

  // Indicators that error handling is already addressed
  private errorIndicators = [
    'error handling',
    'error cases',
    'exception',
    'try catch',
    'try/catch',
    'failure mode',
    'edge case',
    'fallback',
    'graceful',
    'robust',
    'resilient',
    'retry',
    'timeout',
    'validation',
    'sanitize',
    'invalid input',
    'null check',
    'undefined check',
  ];

  // Common error scenarios by context
  private errorScenarios: Record<string, string[]> = {
    api: [
      'Network timeout or connection failure',
      'HTTP 4xx client errors (400, 401, 403, 404)',
      'HTTP 5xx server errors',
      'Rate limiting (429)',
      'Invalid/malformed response',
      'Authentication token expiry',
    ],
    database: [
      'Connection pool exhaustion',
      'Query timeout',
      'Constraint violation',
      'Deadlock detection',
      'Data integrity errors',
      'Migration failures',
    ],
    userInput: [
      'Empty/null input',
      'Invalid format',
      'Input too long/short',
      'XSS/injection attempts',
      'Encoding issues',
      'Type coercion errors',
    ],
    fileSystem: [
      'File not found',
      'Permission denied',
      'Disk full',
      'Path too long',
      'Concurrent access',
      'Corrupted files',
    ],
    async: [
      'Promise rejection',
      'Race conditions',
      'Deadlocks',
      'Memory leaks',
      'Unhandled callbacks',
      'Event loop blocking',
    ],
    general: [
      'Null/undefined values',
      'Type mismatches',
      'Out of bounds access',
      'Division by zero',
      'Stack overflow',
      'Memory exhaustion',
    ],
  };

  apply(prompt: string, _context: PatternContext): PatternResult {
    const lowerPrompt = prompt.toLowerCase();

    // Check if error handling is already addressed
    const hasErrorHandling = this.errorIndicators.some((indicator) =>
      lowerPrompt.includes(indicator.toLowerCase())
    );

    if (hasErrorHandling) {
      return {
        enhancedPrompt: prompt,
        improvement: {
          dimension: 'completeness',
          description: 'Error handling already addressed',
          impact: 'low',
        },
        applied: false,
      };
    }

    // Detect relevant error scenario categories
    const relevantCategories: string[] = [];

    if (/\b(api|fetch|http|request|endpoint|rest|graphql)\b/i.test(prompt)) {
      relevantCategories.push('api');
    }
    if (/\b(database|db|sql|query|postgres|mysql|mongo|redis)\b/i.test(prompt)) {
      relevantCategories.push('database');
    }
    if (/\b(input|form|user|validation|field|param)\b/i.test(prompt)) {
      relevantCategories.push('userInput');
    }
    if (/\b(file|read|write|fs|path|directory|upload|download)\b/i.test(prompt)) {
      relevantCategories.push('fileSystem');
    }
    if (/\b(async|await|promise|callback|event|queue)\b/i.test(prompt)) {
      relevantCategories.push('async');
    }

    // Always include general if nothing specific detected
    if (relevantCategories.length === 0) {
      relevantCategories.push('general');
    }

    // Collect relevant scenarios (max 6)
    const scenarios: string[] = [];
    for (const category of relevantCategories) {
      const categoryScenarios = this.errorScenarios[category] || [];
      scenarios.push(...categoryScenarios.slice(0, 3));
    }
    const uniqueScenarios = [...new Set(scenarios)].slice(0, 6);

    // Build error handling section
    const errorSection = `

## Error Handling Requirements

Consider handling these failure scenarios:
${uniqueScenarios.map((s) => `- ${s}`).join('\n')}

**Error Handling Strategy**:
- Provide meaningful error messages
- Log errors with context for debugging
- Fail gracefully when possible
- Consider retry logic for transient failures
- Don't expose sensitive information in error responses`;

    return {
      enhancedPrompt: prompt + errorSection,
      improvement: {
        dimension: 'completeness',
        description: `Added ${uniqueScenarios.length} error handling considerations`,
        impact: 'medium',
      },
      applied: true,
    };
  }
}
