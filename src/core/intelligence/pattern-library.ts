import { BasePattern } from './patterns/base-pattern.js';
import { ConcisenessFilter } from './patterns/conciseness-filter.js';
import { ObjectiveClarifier } from './patterns/objective-clarifier.js';
import { TechnicalContextEnricher } from './patterns/technical-context-enricher.js';
import { StructureOrganizer } from './patterns/structure-organizer.js';
import { CompletenessValidator } from './patterns/completeness-validator.js';
import { ActionabilityEnhancer } from './patterns/actionability-enhancer.js';
import { IntentAnalysis, OptimizationMode, PromptIntent } from './types.js';

export class PatternLibrary {
  private patterns: Map<string, BasePattern> = new Map();

  constructor() {
    this.registerDefaultPatterns();
  }

  private registerDefaultPatterns(): void {
    // Register core patterns (available in fast & deep modes)
    this.register(new ConcisenessFilter());           // HIGH - Remove verbosity
    this.register(new ObjectiveClarifier());          // HIGH - Add clarity
    this.register(new TechnicalContextEnricher());    // MEDIUM - Add technical details
    this.register(new StructureOrganizer());          // HIGH - Reorder logically
    this.register(new CompletenessValidator());       // MEDIUM - Check missing elements
    this.register(new ActionabilityEnhancer());       // HIGH - Vague to specific

    // TODO: Register additional patterns for deep mode (future enhancement)
    // Deep mode exclusive:
    // - AlternativePhrasingGenerator
    // - StructureVariationGenerator
    // - EdgeCaseIdentifier
    // - ValidationChecklistCreator
    // - AssumptionExplicitizer
    // - ScopeDefiner
    // - StepByStepDecomposer
    // - TemplatePatternApplier
    // - ReflectionPrompter
    // - ContextPrecisionBooster
  }

  /**
   * Register a new pattern
   */
  register(pattern: BasePattern): void {
    this.patterns.set(pattern.id, pattern);
  }

  /**
   * Get a specific pattern by ID
   */
  get(id: string): BasePattern | undefined {
    return this.patterns.get(id);
  }

  /**
   * Get applicable patterns for given context (backward compatibility wrapper)
   * @deprecated Use selectPatterns() method instead
   */
  getApplicablePatterns(
    prompt: string,
    intent: string,
    quality: {
      clarity: number;
      efficiency: number;
      structure: number;
      completeness: number;
      actionability: number;
      overall: number;
    },
    mode: OptimizationMode
  ): BasePattern[] {
    // Create IntentAnalysis from parameters
    const intentAnalysis: IntentAnalysis = {
      primaryIntent: intent as PromptIntent,
      confidence: 100,
      characteristics: {
        hasCodeContext: false,
        hasTechnicalTerms: false,
        isOpenEnded: false,
        needsStructure: false
      }
    };

    // Use existing selectPatterns method
    return this.selectPatterns(intentAnalysis, mode);
  }

  /**
   * Select applicable patterns for the given context
   */
  selectPatterns(intent: IntentAnalysis, mode: OptimizationMode): BasePattern[] {
    const applicablePatterns: BasePattern[] = [];

    for (const pattern of this.patterns.values()) {
      // Check mode compatibility
      if (pattern.mode !== 'both' && pattern.mode !== mode) {
        continue;
      }

      // Check intent compatibility
      if (!pattern.applicableIntents.includes(intent.primaryIntent)) {
        continue;
      }

      applicablePatterns.push(pattern);
    }

    // Sort by priority (highest first)
    return applicablePatterns.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Get all registered patterns
   */
  getAllPatterns(): BasePattern[] {
    return Array.from(this.patterns.values());
  }

  /**
   * Get patterns by mode
   */
  getPatternsByMode(mode: OptimizationMode): BasePattern[] {
    return Array.from(this.patterns.values())
      .filter(p => p.mode === mode || p.mode === 'both');
  }

  /**
   * Get pattern count
   */
  getPatternCount(): number {
    return this.patterns.size;
  }
}
