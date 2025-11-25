import {
  BasePattern,
  PatternMode,
  PatternPriority,
  PatternPhase,
  PatternConfigSchema,
} from './base-pattern.js';
import { PatternContext, PatternResult, PromptIntent } from '../types.js';

/**
 * v4.5 Pattern: Conciseness Filter
 *
 * Removes unnecessary pleasantries, fluff words, and redundancy
 * to make prompts more direct and efficient.
 */
export class ConcisenessFilter extends BasePattern {
  // -------------------------------------------------------------------------
  // Pattern Metadata (v4.5 unified types)
  // -------------------------------------------------------------------------

  readonly id = 'conciseness-filter';
  readonly name = 'Conciseness Filter';
  readonly description = 'Removes unnecessary pleasantries, fluff words, and redundancy';

  readonly applicableIntents: PromptIntent[] = [
    'code-generation',
    'planning',
    'refinement',
    'debugging',
    'documentation',
  ];

  readonly mode: PatternMode = 'both';
  readonly priority: PatternPriority = 4; // LOW - Polish phase
  readonly phases: PatternPhase[] = ['all'];

  // -------------------------------------------------------------------------
  // Configuration Schema (v4.5)
  // -------------------------------------------------------------------------

  static override readonly configSchema: PatternConfigSchema = {
    fluffThreshold: {
      type: 'number',
      default: 3,
      description: 'Number of fluff words to tolerate before applying filter',
      validation: { min: 1, max: 10 },
    },
    preserveTechnicalTerms: {
      type: 'boolean',
      default: true,
      description: 'Keep technical terms even if they appear verbose',
    },
  };

  // -------------------------------------------------------------------------
  // Pattern Application
  // -------------------------------------------------------------------------

  apply(prompt: string, _context: PatternContext): PatternResult {
    const settings = this.getSettings();
    const fluffThreshold = (settings.fluffThreshold as number) ?? 3;

    let cleaned = prompt;
    let changesCount = 0;

    // Remove pleasantries at start
    const pleasantries = [
      /^(please|could you|would you mind|I would appreciate if you could|kindly)\s+/gi,
      /thank you/gi,
      /thanks in advance/gi,
      /I appreciate your help/gi,
    ];

    for (const pattern of pleasantries) {
      const before = cleaned;
      cleaned = cleaned.replace(pattern, '');
      if (before !== cleaned) changesCount++;
    }

    // Remove fluff words
    const fluffWords = ['very', 'really', 'just', 'basically', 'simply', 'actually', 'literally'];
    for (const word of fluffWords) {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const before = cleaned;
      cleaned = cleaned.replace(regex, '');
      if (before !== cleaned) changesCount++;
    }

    // Remove redundant phrases
    cleaned = cleaned.replace(/in order to/gi, 'to');
    cleaned = cleaned.replace(/at this point in time/gi, 'now');
    cleaned = cleaned.replace(/due to the fact that/gi, 'because');
    cleaned = cleaned.replace(/for the purpose of/gi, 'for');
    cleaned = cleaned.replace(/in the event that/gi, 'if');

    // Clean up extra whitespace
    cleaned = this.cleanWhitespace(cleaned);

    // Only apply if changes exceed threshold
    const applied = changesCount >= fluffThreshold || cleaned !== prompt;

    return {
      enhancedPrompt: applied ? cleaned : prompt,
      improvement: {
        dimension: 'efficiency',
        description: `Removed ${changesCount} unnecessary phrases for conciseness`,
        impact: changesCount > 3 ? 'high' : changesCount > 1 ? 'medium' : 'low',
      },
      applied,
    };
  }
}
