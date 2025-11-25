import { BasePattern } from './patterns/base-pattern.js';
import { ConcisenessFilter } from './patterns/conciseness-filter.js';
import { ObjectiveClarifier } from './patterns/objective-clarifier.js';
import { TechnicalContextEnricher } from './patterns/technical-context-enricher.js';
import { StructureOrganizer } from './patterns/structure-organizer.js';
import { CompletenessValidator } from './patterns/completeness-validator.js';
import { ActionabilityEnhancer } from './patterns/actionability-enhancer.js';
// v4.0 Deep mode patterns
import { AlternativePhrasingGenerator } from './patterns/alternative-phrasing-generator.js';
import { EdgeCaseIdentifier } from './patterns/edge-case-identifier.js';
import { ValidationChecklistCreator } from './patterns/validation-checklist-creator.js';
import { AssumptionExplicitizer } from './patterns/assumption-explicitizer.js';
import { ScopeDefiner } from './patterns/scope-definer.js';
import { PRDStructureEnforcer } from './patterns/prd-structure-enforcer.js';
// v4.0 Both mode patterns
import { StepDecomposer } from './patterns/step-decomposer.js';
import { ContextPrecisionBooster } from './patterns/context-precision.js';
// v4.1 New patterns - Agent transparency & quality improvements
import { AmbiguityDetector } from './patterns/ambiguity-detector.js';
import { OutputFormatEnforcer } from './patterns/output-format-enforcer.js';
import { SuccessCriteriaEnforcer } from './patterns/success-criteria-enforcer.js';
import { ErrorToleranceEnhancer } from './patterns/error-tolerance-enhancer.js';
import { PrerequisiteIdentifier } from './patterns/prerequisite-identifier.js';
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
import { IntentAnalysis, OptimizationMode, OptimizationPhase, PromptIntent } from './types.js';

export class PatternLibrary {
  private patterns: Map<string, BasePattern> = new Map();

  constructor() {
    this.registerDefaultPatterns();
  }

  private registerDefaultPatterns(): void {
    // Register core patterns (available in fast & deep modes)
    this.register(new ConcisenessFilter()); // HIGH - Remove verbosity
    this.register(new ObjectiveClarifier()); // HIGH - Add clarity
    this.register(new TechnicalContextEnricher()); // MEDIUM - Add technical details
    this.register(new StructureOrganizer()); // HIGH - Reorder logically
    this.register(new CompletenessValidator()); // MEDIUM - Check missing elements
    this.register(new ActionabilityEnhancer()); // HIGH - Vague to specific

    // v4.0 Deep mode patterns
    this.register(new AlternativePhrasingGenerator()); // P5 - Generate alternative structures
    this.register(new EdgeCaseIdentifier()); // P4 - Identify edge cases by domain
    this.register(new ValidationChecklistCreator()); // P3 - Create validation checklists
    this.register(new AssumptionExplicitizer()); // P6 - Make implicit assumptions explicit
    this.register(new ScopeDefiner()); // P5 - Add scope boundaries
    this.register(new PRDStructureEnforcer()); // P9 - Ensure PRD completeness

    // v4.0 Both mode patterns (fast & deep)
    this.register(new StepDecomposer()); // P7 - Break complex prompts into steps
    this.register(new ContextPrecisionBooster()); // P8 - Add precise context when missing

    // v4.1 New patterns - Agent transparency & quality improvements
    this.register(new AmbiguityDetector()); // P9 - Identify ambiguous terms (both modes)
    this.register(new OutputFormatEnforcer()); // P7 - Add output format specs (both modes)
    this.register(new SuccessCriteriaEnforcer()); // P6 - Add success criteria (both modes)
    this.register(new ErrorToleranceEnhancer()); // P5 - Add error handling (deep only)
    this.register(new PrerequisiteIdentifier()); // P6 - Identify prerequisites (deep only)
    this.register(new DomainContextEnricher()); // P5 - Add domain best practices (both modes)

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
        needsStructure: false,
      },
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
   * v4.3.2: Select patterns for specific mode with phase-awareness
   * Maps PRD and conversational modes to appropriate base modes and patterns
   */
  selectPatternsForMode(
    mode: OptimizationMode,
    intent: IntentAnalysis,
    phase?: OptimizationPhase
  ): BasePattern[] {
    // Map PRD/conversational modes to base modes for pattern selection
    const baseMode = this.mapToBaseMode(mode, phase);
    const applicablePatterns: BasePattern[] = [];

    for (const pattern of this.patterns.values()) {
      // Check mode compatibility (use mapped base mode)
      if (pattern.mode !== 'both' && pattern.mode !== baseMode) {
        continue;
      }

      // Check intent compatibility
      if (!pattern.applicableIntents.includes(intent.primaryIntent)) {
        continue;
      }

      // Phase-specific filtering for PRD mode
      if (mode === 'prd' && phase) {
        if (!this.isPatternApplicableForPRDPhase(pattern, phase)) {
          continue;
        }
      }

      // Phase-specific filtering for conversational mode
      if (mode === 'conversational' && phase) {
        if (!this.isPatternApplicableForConversationalPhase(pattern, phase)) {
          continue;
        }
      }

      applicablePatterns.push(pattern);
    }

    // Sort by priority (highest first)
    return applicablePatterns.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Map extended modes to base modes for pattern compatibility
   */
  private mapToBaseMode(mode: OptimizationMode, phase?: OptimizationPhase): 'fast' | 'deep' {
    switch (mode) {
      case 'prd':
        // PRD uses deep mode for output generation, fast for validation
        return phase === 'question-validation' ? 'fast' : 'deep';
      case 'conversational':
        // Conversational uses fast mode for tracking, deep for summarization
        return phase === 'summarization' ? 'deep' : 'fast';
      case 'fast':
      case 'deep':
      default:
        return mode as 'fast' | 'deep';
    }
  }

  /**
   * Check if pattern is applicable for PRD phase
   */
  private isPatternApplicableForPRDPhase(pattern: BasePattern, phase: OptimizationPhase): boolean {
    // Patterns for question validation (lightweight, clarity-focused)
    const questionValidationPatterns = [
      'ambiguity-detector',
      'completeness-validator',
      'objective-clarifier',
    ];

    // Patterns for output generation (comprehensive)
    const outputGenerationPatterns = [
      'prd-structure-enforcer',
      'structure-organizer',
      'success-criteria-enforcer',
      'scope-definer',
      'edge-case-identifier',
      'assumption-explicitizer',
      'technical-context-enricher',
      'domain-context-enricher',
      // v4.3.2 PRD patterns will be added here
      'requirement-prioritizer',
      'user-persona-enricher',
      'success-metrics-enforcer',
      'dependency-identifier',
    ];

    if (phase === 'question-validation') {
      return questionValidationPatterns.includes(pattern.id);
    }

    if (phase === 'output-generation') {
      return outputGenerationPatterns.includes(pattern.id);
    }

    return true; // Default: allow pattern
  }

  /**
   * Check if pattern is applicable for conversational phase
   */
  private isPatternApplicableForConversationalPhase(
    pattern: BasePattern,
    phase: OptimizationPhase
  ): boolean {
    // Patterns for conversation tracking (minimal, non-intrusive)
    const conversationTrackingPatterns = ['ambiguity-detector', 'completeness-validator'];

    // Patterns for summarization (comprehensive extraction)
    const summarizationPatterns = [
      'structure-organizer',
      'completeness-validator',
      'success-criteria-enforcer',
      'edge-case-identifier',
      'actionability-enhancer',
      'technical-context-enricher',
      'domain-context-enricher',
      // v4.3.2 Conversational patterns will be added here
      'conversation-summarizer',
      'topic-coherence-analyzer',
      'implicit-requirement-extractor',
    ];

    if (phase === 'conversation-tracking') {
      return conversationTrackingPatterns.includes(pattern.id);
    }

    if (phase === 'summarization') {
      return summarizationPatterns.includes(pattern.id);
    }

    return true; // Default: allow pattern
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
    return Array.from(this.patterns.values()).filter((p) => p.mode === mode || p.mode === 'both');
  }

  /**
   * Get pattern count
   */
  getPatternCount(): number {
    return this.patterns.size;
  }
}
