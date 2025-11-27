import { BasePattern, IPatternLibrary, PatternPhase } from './patterns/base-pattern.js';
import { ConcisenessFilter } from './patterns/conciseness-filter.js';
import { ObjectiveClarifier } from './patterns/objective-clarifier.js';
import { TechnicalContextEnricher } from './patterns/technical-context-enricher.js';
import { StructureOrganizer } from './patterns/structure-organizer.js';
import { CompletenessValidator } from './patterns/completeness-validator.js';
import { ActionabilityEnhancer } from './patterns/actionability-enhancer.js';
// v4.0 Comprehensive scope patterns
// v4.12: Removed boilerplate patterns (AlternativePhrasingGenerator, EdgeCaseIdentifier,
//        ValidationChecklistCreator, AssumptionExplicitizer, ScopeDefiner, ErrorToleranceEnhancer,
//        PrerequisiteIdentifier) - these generated static output instead of improving prompts
import { PRDStructureEnforcer } from './patterns/prd-structure-enforcer.js';
// v4.0 Both scope patterns (standard & comprehensive)
import { StepDecomposer } from './patterns/step-decomposer.js';
import { ContextPrecisionBooster } from './patterns/context-precision.js';
// v4.1 New patterns - Agent transparency & quality improvements
import { AmbiguityDetector } from './patterns/ambiguity-detector.js';
import { OutputFormatEnforcer } from './patterns/output-format-enforcer.js';
import { SuccessCriteriaEnforcer } from './patterns/success-criteria-enforcer.js';
import { DomainContextEnricher } from './patterns/domain-context-enricher.js';
// v4.3.2 PRD patterns
import { RequirementPrioritizer } from './patterns/requirement-prioritizer.js';
import { UserPersonaEnricher } from './patterns/user-persona-enricher.js';
import { SuccessMetricsEnforcer } from './patterns/success-metrics-enforcer.js';
import { DependencyIdentifier } from './patterns/dependency-identifier.js';
// v4.3.2 Conversational patterns
import { ConversationSummarizer } from './patterns/conversation-summarizer.js';
import { TopicCoherenceAnalyzer } from './patterns/topic-coherence-analyzer.js';
import { ImplicitRequirementExtractor } from './patterns/implicit-requirement-extractor.js';
import {
  IntentAnalysis,
  OptimizationMode,
  OptimizationPhase,
  PromptIntent,
  DepthLevel,
} from './types.js';
import { IntelligenceConfig } from '../../types/config.js';

export class PatternLibrary implements IPatternLibrary {
  private patterns: Map<string, BasePattern> = new Map();
  private config: IntelligenceConfig | null = null;
  private priorityOverrides: Map<string, number> = new Map();

  constructor() {
    this.registerDefaultPatterns();
  }

  /**
   * v4.5: Apply configuration settings to pattern library
   * Allows enabling/disabling patterns and adjusting priorities via config.
   * Priority overrides are stored separately (pattern.priority is readonly).
   */
  applyConfig(config: IntelligenceConfig): void {
    this.config = config;

    // Store priority overrides (patterns have readonly priority)
    if (config.patterns?.priorityOverrides) {
      for (const [patternId, newPriority] of Object.entries(config.patterns.priorityOverrides)) {
        if (this.patterns.has(patternId) && newPriority >= 1 && newPriority <= 10) {
          this.priorityOverrides.set(patternId, newPriority);
        }
      }
    }
  }

  /**
   * v4.5: Get effective priority for a pattern (considers overrides)
   */
  private getEffectivePriority(pattern: BasePattern): number {
    return this.priorityOverrides.get(pattern.id) ?? pattern.priority;
  }

  /**
   * v4.4: Check if a pattern is disabled via config
   */
  private isPatternDisabled(patternId: string): boolean {
    return this.config?.patterns?.disabled?.includes(patternId) ?? false;
  }

  /**
   * v4.4: Get custom settings for a pattern
   */
  getPatternSettings(patternId: string): Record<string, unknown> | undefined {
    return this.config?.patterns?.customSettings?.[patternId];
  }

  private registerDefaultPatterns(): void {
    // Register core patterns (available in standard & comprehensive scopes)
    // v4.12: 20 patterns total after removing 7 boilerplate patterns
    this.register(new ConcisenessFilter()); // P10 - Remove verbosity
    this.register(new ObjectiveClarifier()); // P9 - Add clarity
    this.register(new TechnicalContextEnricher()); // P8 - Add technical details
    this.register(new StructureOrganizer()); // P8 - Reorder logically
    this.register(new CompletenessValidator()); // P6 - Check missing elements
    this.register(new ActionabilityEnhancer()); // P7 - Vague to specific

    // v4.0 Comprehensive scope patterns
    // v4.12: Removed boilerplate patterns that generated static output
    this.register(new PRDStructureEnforcer()); // P9 - Ensure PRD completeness

    // v4.0 Both scope patterns (standard & comprehensive)
    this.register(new StepDecomposer()); // P7 - Break complex prompts into steps
    this.register(new ContextPrecisionBooster()); // P8 - Add precise context when missing

    // v4.1 New patterns - Agent transparency & quality improvements
    this.register(new AmbiguityDetector()); // P9 - Identify ambiguous terms (both scopes)
    this.register(new OutputFormatEnforcer()); // P7 - Add output format specs (comprehensive only)
    this.register(new SuccessCriteriaEnforcer()); // P6 - Add success criteria (both scopes)
    this.register(new DomainContextEnricher()); // P5 - Add domain best practices (comprehensive only)

    // v4.3.2 PRD patterns
    this.register(new RequirementPrioritizer()); // P7 - Separate must-have from nice-to-have
    this.register(new UserPersonaEnricher()); // P6 - Add user context and personas
    this.register(new SuccessMetricsEnforcer()); // P7 - Ensure measurable success criteria
    this.register(new DependencyIdentifier()); // P5 - Identify technical/external dependencies

    // v4.3.2 Conversational patterns
    this.register(new ConversationSummarizer()); // P8 - Extract structured requirements
    this.register(new TopicCoherenceAnalyzer()); // P6 - Detect topic shifts
    this.register(new ImplicitRequirementExtractor()); // P7 - Surface implicit requirements
  }

  /**
   * Register a new pattern.
   * v4.5: Injects library reference for config access.
   */
  register(pattern: BasePattern): void {
    // Inject library reference for config access
    pattern.setPatternLibrary(this);
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
    mode: OptimizationMode,
    depthLevel?: DepthLevel
  ): BasePattern[] {
    // Create IntentAnalysis from parameters
    const intentAnalysis: IntentAnalysis = {
      primaryIntent: intent as PromptIntent,
      confidence: 100,
      characteristics: {
        hasCodeContext: false,
        hasTechnicalTerms: false,
        isOpenEnded: false,
        needsStructure: false,
      },
    };

    // Use existing selectPatterns method
    return this.selectPatterns(intentAnalysis, mode, depthLevel);
  }

  /**
   * v4.11: Select applicable patterns for the given context
   * Now uses DepthLevel ('standard' | 'comprehensive') for pattern filtering
   */
  selectPatterns(
    intent: IntentAnalysis,
    mode: OptimizationMode,
    depthLevel?: DepthLevel
  ): BasePattern[] {
    const applicablePatterns: BasePattern[] = [];
    // v4.11: Default to 'standard' depth for 'improve' mode if not specified
    const effectiveDepth = depthLevel || (mode === 'improve' ? 'standard' : 'comprehensive');

    for (const pattern of this.patterns.values()) {
      // v4.4: Check if pattern is disabled via config
      if (this.isPatternDisabled(pattern.id)) {
        continue;
      }

      // v4.11: Check scope compatibility using DepthLevel
      if (pattern.scope !== 'both' && pattern.scope !== effectiveDepth) {
        continue;
      }

      // Check intent compatibility
      if (!pattern.applicableIntents.includes(intent.primaryIntent)) {
        continue;
      }

      applicablePatterns.push(pattern);
    }

    // v4.5: Sort by priority and respect dependencies
    return this.sortPatternsWithDependencies(applicablePatterns);
  }

  /**
   * v4.5: Sort patterns by priority while respecting dependency constraints.
   * Handles runAfter (must run after specified patterns) and excludesWith (mutually exclusive).
   */
  private sortPatternsWithDependencies(patterns: BasePattern[]): BasePattern[] {
    // First, handle exclusions - remove patterns that conflict with higher priority ones
    const filteredPatterns = this.filterExcludedPatterns(patterns);

    // Sort by priority first
    const sortedByPriority = [...filteredPatterns].sort(
      (a, b) => this.getEffectivePriority(b) - this.getEffectivePriority(a)
    );

    // Then adjust for runAfter dependencies
    return this.adjustForDependencies(sortedByPriority);
  }

  /**
   * v4.5: Filter out patterns that are mutually exclusive with higher priority patterns.
   */
  private filterExcludedPatterns(patterns: BasePattern[]): BasePattern[] {
    // Sort by priority (highest first) to determine which exclusion wins
    const sortedByPriority = [...patterns].sort(
      (a, b) => this.getEffectivePriority(b) - this.getEffectivePriority(a)
    );

    const excludedIds = new Set<string>();

    for (const pattern of sortedByPriority) {
      // Skip if this pattern was already excluded
      if (excludedIds.has(pattern.id)) {
        continue;
      }

      // Check if this pattern excludes others
      const excludes = pattern.dependencies?.excludesWith || [];
      for (const excludedId of excludes) {
        excludedIds.add(excludedId);
      }
    }

    // Return patterns that weren't excluded
    return sortedByPriority.filter((p) => !excludedIds.has(p.id));
  }

  /**
   * v4.5: Adjust pattern order to respect runAfter dependencies.
   * If pattern A declares runAfter: ['B'], ensure B runs before A.
   */
  private adjustForDependencies(patterns: BasePattern[]): BasePattern[] {
    const patternMap = new Map(patterns.map((p) => [p.id, p]));
    const result: BasePattern[] = [];
    const processed = new Set<string>();
    const processing = new Set<string>();

    // Depth-first processing to handle dependencies
    const processPattern = (pattern: BasePattern): void => {
      if (processed.has(pattern.id)) {
        return; // Already processed
      }

      if (processing.has(pattern.id)) {
        // Circular dependency detected - skip to avoid infinite loop
        return;
      }

      processing.add(pattern.id);

      // Process dependencies first (patterns that must run before this one)
      const runAfter = pattern.dependencies?.runAfter || [];
      for (const depId of runAfter) {
        const depPattern = patternMap.get(depId);
        if (depPattern && !processed.has(depId)) {
          processPattern(depPattern);
        }
      }

      processing.delete(pattern.id);
      processed.add(pattern.id);
      result.push(pattern);
    };

    // Process all patterns in priority order
    for (const pattern of patterns) {
      processPattern(pattern);
    }

    return result;
  }

  /**
   * v4.11: Select patterns for specific mode with phase-awareness
   * Maps PRD and conversational modes to appropriate depth levels for pattern selection
   */
  selectPatternsForMode(
    mode: OptimizationMode,
    intent: IntentAnalysis,
    phase?: OptimizationPhase,
    depthLevel?: DepthLevel
  ): BasePattern[] {
    // v4.11: Map mode/phase to depth level for pattern selection
    const effectiveDepth = depthLevel || this.mapToDepthLevel(mode, phase);
    const applicablePatterns: BasePattern[] = [];

    for (const pattern of this.patterns.values()) {
      // v4.4: Check if pattern is disabled via config
      if (this.isPatternDisabled(pattern.id)) {
        continue;
      }

      // v4.11: Check scope compatibility using depth level
      if (pattern.scope !== 'both' && pattern.scope !== effectiveDepth) {
        continue;
      }

      // Check intent compatibility
      if (!pattern.applicableIntents.includes(intent.primaryIntent)) {
        continue;
      }

      // v4.5: Phase-specific filtering using pattern's phases property
      if (phase && !this.isPatternApplicableForPhase(pattern, phase)) {
        continue;
      }

      applicablePatterns.push(pattern);
    }

    // v4.5: Sort by priority and respect dependencies
    return this.sortPatternsWithDependencies(applicablePatterns);
  }

  /**
   * v4.5: Check if pattern is applicable for a given phase.
   * Uses pattern's declared phases property instead of hardcoded mappings.
   */
  private isPatternApplicableForPhase(pattern: BasePattern, phase: OptimizationPhase): boolean {
    // Map OptimizationPhase to PatternPhase
    const patternPhase = this.mapOptimizationPhaseToPatternPhase(phase);
    if (!patternPhase) {
      return true; // Unknown phase, allow pattern
    }

    // Check if pattern applies to this phase or to 'all' phases
    return pattern.phases.includes('all') || pattern.phases.includes(patternPhase);
  }

  /**
   * v4.5: Map OptimizationPhase string to PatternPhase type
   */
  private mapOptimizationPhaseToPatternPhase(phase: OptimizationPhase): PatternPhase | null {
    const mapping: Record<string, PatternPhase> = {
      'question-validation': 'question-validation',
      'output-generation': 'output-generation',
      'conversation-tracking': 'conversation-tracking',
      summarization: 'summarization',
    };
    return mapping[phase] || null;
  }

  /**
   * v4.11: Map mode and phase to depth level for pattern selection
   */
  private mapToDepthLevel(mode: OptimizationMode, phase?: OptimizationPhase): DepthLevel {
    switch (mode) {
      case 'prd':
        // PRD uses comprehensive for output generation, standard for validation
        return phase === 'question-validation' ? 'standard' : 'comprehensive';
      case 'conversational':
        // Conversational uses standard for tracking, comprehensive for summarization
        return phase === 'summarization' ? 'comprehensive' : 'standard';
      case 'improve':
      default:
        // 'improve' mode defaults to standard; caller can override with depthLevel param
        return 'standard';
    }
  }

  /**
   * Get all registered patterns
   */
  getAllPatterns(): BasePattern[] {
    return Array.from(this.patterns.values());
  }

  /**
   * v4.11: Get patterns by scope (standard or comprehensive)
   */
  getPatternsByScope(scope: DepthLevel): BasePattern[] {
    return Array.from(this.patterns.values()).filter(
      (p) => p.scope === scope || p.scope === 'both'
    );
  }

  /**
   * Get patterns by mode (backward compatibility)
   * @deprecated Use getPatternsByScope() instead
   */
  getPatternsByMode(mode: OptimizationMode): BasePattern[] {
    // v4.11: Map old mode names to scope for backward compatibility
    const scope: DepthLevel = mode === 'improve' ? 'standard' : 'comprehensive';
    return this.getPatternsByScope(scope);
  }

  /**
   * Get pattern count
   */
  getPatternCount(): number {
    return this.patterns.size;
  }
}
