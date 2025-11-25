import {
  BasePattern,
  PatternMode,
  PatternPriority,
  PatternPhase,
  PatternConfigSchema,
} from './base-pattern.js';
import { PatternContext, PatternResult, PromptIntent } from '../types.js';

/**
 * v4.5 Pattern: Ambiguity Detector
 *
 * Identifies and clarifies ambiguous terms, vague references, and unclear
 * specifications in prompts. Helps agents understand exactly what's needed.
 */
export class AmbiguityDetector extends BasePattern {
  // -------------------------------------------------------------------------
  // Pattern Metadata (v4.5 unified types)
  // -------------------------------------------------------------------------

  readonly id = 'ambiguity-detector';
  readonly name = 'Ambiguity Detector';
  readonly description = 'Identifies and clarifies ambiguous terms and vague references';

  readonly applicableIntents: PromptIntent[] = [
    'code-generation',
    'planning',
    'refinement',
    'debugging',
    'documentation',
    'prd-generation',
    'testing',
    'migration',
  ];

  readonly mode: PatternMode = 'both';
  readonly priority: PatternPriority = 9; // VERY HIGH - structural integrity
  readonly phases: PatternPhase[] = ['all'];

  // -------------------------------------------------------------------------
  // Configuration Schema (v4.5)
  // -------------------------------------------------------------------------

  static override readonly configSchema: PatternConfigSchema = {
    checkVaguePatterns: {
      type: 'boolean',
      default: true,
      description: 'Check for vague phrases like "should work", "properly", etc.',
    },
    checkUndefinedPronouns: {
      type: 'boolean',
      default: true,
      description: 'Check for unclear pronoun references',
    },
    maxClarifications: {
      type: 'number',
      default: 10,
      description: 'Maximum number of clarifications to add',
      validation: { min: 1, max: 20 },
    },
  };

  // -------------------------------------------------------------------------
  // Pattern Data
  // -------------------------------------------------------------------------

  // Common ambiguous terms that need clarification
  private ambiguousTerms: Record<string, string[]> = {
    // Generic terms needing specificity
    app: ['web app', 'mobile app', 'desktop app', 'CLI tool'],
    system: ['backend system', 'frontend system', 'full-stack system', 'microservice'],
    feature: ['user-facing feature', 'backend feature', 'API endpoint', 'UI component'],
    component: ['React component', 'Vue component', 'service component', 'module'],
    service: ['REST API', 'GraphQL API', 'background worker', 'microservice'],
    database: ['PostgreSQL', 'MongoDB', 'MySQL', 'SQLite', 'Redis'],
    authentication: ['OAuth', 'JWT', 'session-based', 'API keys', 'social login'],
    cache: ['in-memory cache', 'Redis cache', 'CDN cache', 'browser cache'],
    storage: ['local storage', 'cloud storage', 'file system', 'object storage'],
    user: ['end user', 'admin user', 'API consumer', 'authenticated user'],
    // Action verbs needing clarification
    create: ['generate', 'implement', 'design', 'scaffold'],
    update: ['modify', 'patch', 'replace', 'extend'],
    fix: ['debug', 'patch', 'refactor', 'rewrite'],
    improve: ['optimize', 'refactor', 'enhance', 'extend'],
    handle: ['process', 'validate', 'transform', 'route'],
    // Scope terms
    some: ['specific subset', 'all matching', 'first N', 'random sample'],
    many: ['more than 10', 'more than 100', 'more than 1000', 'unlimited'],
    few: ['2-3', '5-10', 'less than 10'],
    large: ['>1MB', '>100MB', '>1GB', 'unbounded'],
    small: ['<1KB', '<100KB', '<1MB'],
    fast: ['<100ms', '<1s', '<5s', 'real-time'],
    slow: ['>1s', '>5s', '>30s'],
    // Quality terms
    good: ['>80% coverage', '>90% accuracy', 'production-ready', 'MVP-quality'],
    better: ['improved by X%', 'faster than current', 'more readable'],
    best: ['optimal', 'industry standard', 'team consensus'],
    simple: ['single function', 'minimal dependencies', 'no external calls'],
    complex: ['multi-step', 'with dependencies', 'requiring state'],
  };

  // Vague phrases that need clarification
  private vaguePatterns: { pattern: RegExp; suggestion: string }[] = [
    {
      pattern: /\bshould work\b/gi,
      suggestion: 'Define specific success criteria and test cases',
    },
    {
      pattern: /\bproperly\b/gi,
      suggestion: 'Specify exact behavior or standards to follow',
    },
    {
      pattern: /\bcorrectly\b/gi,
      suggestion: 'Define what "correct" means with specific criteria',
    },
    {
      pattern: /\bappropriate(ly)?\b/gi,
      suggestion: 'Specify the exact behavior or standards expected',
    },
    {
      pattern: /\bas needed\b/gi,
      suggestion: 'Define when and what is needed specifically',
    },
    {
      pattern: /\bif necessary\b/gi,
      suggestion: 'Define the conditions that trigger this action',
    },
    {
      pattern: /\betc\.?\b/gi,
      suggestion: 'List all items explicitly or define a complete category',
    },
    {
      pattern: /\band so on\b/gi,
      suggestion: 'Enumerate all items or define the pattern explicitly',
    },
    {
      pattern: /\bwhatever\b/gi,
      suggestion: 'Specify the exact options or constraints',
    },
    {
      pattern: /\bsomething like\b/gi,
      suggestion: 'Provide the exact specification or reference',
    },
    {
      pattern: /\bmaybe\b/gi,
      suggestion: 'Decide if this is a requirement or not',
    },
    {
      pattern: /\bprobably\b/gi,
      suggestion: 'Confirm if this is a requirement or not',
    },
  ];

  apply(prompt: string, _context: PatternContext): PatternResult {
    let enhanced = prompt;
    const ambiguitiesFound: string[] = [];
    const clarifications: string[] = [];

    // Check for ambiguous terms
    for (const [term, options] of Object.entries(this.ambiguousTerms)) {
      const regex = new RegExp(`\\b${term}\\b`, 'gi');
      if (regex.test(prompt)) {
        // Check if the term is already qualified
        const qualifiedPattern = new RegExp(
          `\\b(${options.join('|')})\\s+${term}\\b|\\b${term}\\s+(${options.join('|')})\\b`,
          'gi'
        );
        if (!qualifiedPattern.test(prompt)) {
          ambiguitiesFound.push(`"${term}" is ambiguous`);
          clarifications.push(`[CLARIFY: "${term}" - specify: ${options.slice(0, 3).join(', ')}?]`);
        }
      }
    }

    // Check for vague phrases
    for (const { pattern, suggestion } of this.vaguePatterns) {
      if (pattern.test(prompt)) {
        ambiguitiesFound.push(`Found vague phrase matching: ${pattern.source}`);
        clarifications.push(`[CLARIFY: ${suggestion}]`);
      }
    }

    // Check for undefined pronouns
    const pronounPatterns = [
      { pattern: /\bit\b(?!eration|em|erable)/gi, issue: '"it" - unclear reference' },
      { pattern: /\bthis\b(?!\s+\w+)/gi, issue: '"this" - unclear reference' },
      { pattern: /\bthat\b(?!\s+\w+)/gi, issue: '"that" - unclear reference' },
      { pattern: /\bthey\b/gi, issue: '"they" - unclear reference' },
      { pattern: /\bthose\b(?!\s+\w+)/gi, issue: '"those" - unclear reference' },
    ];

    for (const { pattern, issue } of pronounPatterns) {
      const matches = prompt.match(pattern);
      if (matches && matches.length > 0) {
        // Only flag if it appears at the start of a sentence or after punctuation
        const contextPattern = new RegExp(`[.!?]\\s*${pattern.source}|^${pattern.source}`, 'gi');
        if (contextPattern.test(prompt)) {
          ambiguitiesFound.push(issue);
        }
      }
    }

    // If ambiguities found, append clarification section
    if (clarifications.length > 0) {
      enhanced = prompt + '\n\n## Clarifications Needed\n' + clarifications.join('\n');
    }

    const applied = ambiguitiesFound.length > 0;

    return {
      enhancedPrompt: enhanced,
      improvement: {
        dimension: 'clarity',
        description: applied
          ? `Identified ${ambiguitiesFound.length} ambiguous terms/phrases requiring clarification`
          : 'No significant ambiguities detected',
        impact:
          ambiguitiesFound.length > 3 ? 'high' : ambiguitiesFound.length > 1 ? 'medium' : 'low',
      },
      applied,
    };
  }
}
