import { PromptIntent, PatternContext, PatternResult } from '../types.js';

// ============================================================================
// v4.5 Pattern Types - Unified Type System
// ============================================================================

/**
 * Pattern mode determines when a pattern is active.
 * - 'fast': Only in fast optimization mode
 * - 'deep': Only in deep analysis mode
 * - 'both': Available in both modes
 */
export type PatternMode = 'fast' | 'deep' | 'both';

/**
 * Pattern phases for PRD and Conversational modes.
 * Patterns declare which phases they apply to.
 *
 * - 'question-validation': PRD mode - validating individual answers
 * - 'output-generation': PRD mode - generating final PRD documents
 * - 'conversation-tracking': Conversational mode - analyzing messages in real-time
 * - 'summarization': Conversational mode - extracting requirements from conversation
 * - 'all': Pattern applies to all phases (default for basic patterns)
 */
export type PatternPhase =
  | 'question-validation'
  | 'output-generation'
  | 'conversation-tracking'
  | 'summarization'
  | 'all';

/**
 * Pattern Priority Scale (1-10)
 *
 * Higher priority patterns run FIRST (sorted descending).
 *
 * 10: CRITICAL - Must run before everything else
 *     Use case: Mode detection, fundamental structure validation
 *
 * 9:  VERY HIGH - Structural integrity
 *     Use case: Ambiguity detection, completeness validation, PRD structure
 *
 * 8:  HIGH - Core enhancement
 *     Use case: Objective clarification, structure organization, summarization
 *
 * 7:  MEDIUM-HIGH - Important enrichment
 *     Use case: Output format, success criteria, requirement prioritization
 *
 * 6:  MEDIUM - Standard enhancement
 *     Use case: Context enrichment, topic coherence, user personas
 *
 * 5:  MEDIUM-LOW - Supplementary
 *     Use case: Step decomposition, technical context, implicit requirements
 *
 * 4:  LOW - Polish
 *     Use case: Conciseness filtering, actionability enhancement
 *
 * 3:  VERY LOW - Final touches
 *     Use case: Phrasing alternatives, edge cases, validation checklists
 *
 * 2:  MINIMAL - Only if nothing else applies
 *     Use case: Reserved for future
 *
 * 1:  LOWEST - Last resort
 *     Use case: Reserved for future
 *
 * Collision Resolution: When priorities are equal, patterns run
 * in registration order (first registered runs first).
 */
export type PatternPriority = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

/**
 * Pattern dependency configuration.
 * Allows patterns to express execution order constraints.
 */
export interface PatternDependency {
  /**
   * Patterns that must run before this one.
   * Uses pattern IDs.
   */
  runAfter?: string[];

  /**
   * Patterns that are mutually exclusive with this one.
   * If one runs, the other won't.
   */
  excludesWith?: string[];

  /**
   * Patterns that enhance this one when both run.
   * Informational only, no enforcement.
   */
  enhancedBy?: string[];
}

// ============================================================================
// v4.5 Pattern Configuration Schema
// ============================================================================

/**
 * Schema field types for pattern configuration
 */
export type PatternConfigFieldType = 'string' | 'number' | 'boolean' | 'array' | 'enum';

/**
 * Single field in a pattern's configuration schema
 */
export interface PatternConfigField {
  type: PatternConfigFieldType;
  default: unknown;
  description: string;
  validation?: {
    min?: number;
    max?: number;
    enum?: string[];
    minLength?: number;
    maxLength?: number;
  };
}

/**
 * Configuration schema for a pattern.
 * Each pattern declares its configurable options.
 * Empty object `{}` means no configuration available.
 */
export interface PatternConfigSchema {
  [fieldName: string]: PatternConfigField;
}

// ============================================================================
// Pattern Library Interface (for dependency injection)
// ============================================================================

/**
 * Interface for PatternLibrary to avoid circular dependency.
 * Used by patterns to access their configuration.
 */
export interface IPatternLibrary {
  getPatternSettings(patternId: string): Record<string, unknown> | undefined;
}

// ============================================================================
// Base Pattern Abstract Class
// ============================================================================

export abstract class BasePattern {
  // -------------------------------------------------------------------------
  // Required Pattern Metadata (must be implemented by all patterns)
  // -------------------------------------------------------------------------

  /** Unique identifier for this pattern (e.g., 'conciseness-filter') */
  abstract readonly id: string;

  /** Human-readable name (e.g., 'Conciseness Filter') */
  abstract readonly name: string;

  /** Brief description of what this pattern does */
  abstract readonly description: string;

  /** Which intents this pattern is applicable to */
  abstract readonly applicableIntents: PromptIntent[];

  /** Which mode(s) this pattern runs in */
  abstract readonly mode: PatternMode;

  /** Execution priority (1-10, higher runs first) */
  abstract readonly priority: PatternPriority;

  /** Which phases this pattern applies to (PRD/conversational modes) */
  abstract readonly phases: PatternPhase[];

  // -------------------------------------------------------------------------
  // Optional Pattern Metadata
  // -------------------------------------------------------------------------

  /** Optional dependency configuration */
  readonly dependencies?: PatternDependency;

  // -------------------------------------------------------------------------
  // Configuration Support (v4.5)
  // -------------------------------------------------------------------------

  /**
   * Configuration schema for this pattern.
   * Override in subclass to define configurable options.
   * Empty object means no configuration available.
   */
  static readonly configSchema: PatternConfigSchema = {};

  /**
   * Reference to pattern library for accessing configuration.
   * Injected by PatternLibrary on registration.
   */
  private patternLibraryRef?: IPatternLibrary;

  /**
   * Inject PatternLibrary reference for config access.
   * Called by PatternLibrary during registration.
   */
  setPatternLibrary(library: IPatternLibrary): void {
    this.patternLibraryRef = library;
  }

  /**
   * Get settings for this pattern with defaults applied.
   * Use in apply() method to access user configuration.
   *
   * @example
   * ```typescript
   * apply(prompt: string, context: PatternContext): PatternResult {
   *   const settings = this.getSettings();
   *   if (fluffCount > settings.fluffThreshold) {
   *     // ...
   *   }
   * }
   * ```
   */
  protected getSettings(): Record<string, unknown> {
    // Get the static configSchema from the concrete class
    const ConcreteClass = this.constructor as typeof BasePattern;
    const schema = ConcreteClass.configSchema;

    // Build defaults from schema
    const defaults: Record<string, unknown> = {};
    for (const [key, field] of Object.entries(schema)) {
      defaults[key] = field.default;
    }

    // Merge with user config (user config overrides defaults)
    const userConfig = this.patternLibraryRef?.getPatternSettings(this.id) || {};
    return { ...defaults, ...userConfig };
  }

  // -------------------------------------------------------------------------
  // Core Pattern Methods
  // -------------------------------------------------------------------------

  /**
   * Apply this pattern to the given prompt.
   * Must be implemented by all concrete patterns.
   */
  abstract apply(prompt: string, context: PatternContext): PatternResult;

  /**
   * Check if this pattern is applicable for the given context.
   * Can be overridden for custom applicability logic.
   */
  isApplicable(context: PatternContext): boolean {
    // Check mode compatibility
    if (this.mode !== 'both' && this.mode !== context.mode) {
      return false;
    }

    // Check intent compatibility
    return this.applicableIntents.includes(context.intent.primaryIntent);
  }

  // -------------------------------------------------------------------------
  // Utility Methods
  // -------------------------------------------------------------------------

  /**
   * Utility: Remove extra whitespace
   */
  protected cleanWhitespace(text: string): string {
    return text.replace(/\s+/g, ' ').trim();
  }

  /**
   * Utility: Check if prompt has a section
   */
  protected hasSection(prompt: string, keywords: string[]): boolean {
    const lowerPrompt = prompt.toLowerCase();
    return keywords.some((keyword) => lowerPrompt.includes(keyword.toLowerCase()));
  }

  /**
   * Utility: Count words
   */
  protected countWords(text: string): number {
    return text.split(/\s+/).filter((word) => word.length > 0).length;
  }

  /**
   * Utility: Extract sentences
   */
  protected extractSentences(text: string): string[] {
    return text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  }
}
