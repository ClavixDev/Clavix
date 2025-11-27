import { IntentDetector } from './intent-detector.js';
import { PatternLibrary } from './pattern-library.js';
import { QualityAssessor } from './quality-assessor.js';
import {
  OptimizationResult,
  OptimizationMode,
  OptimizationPhase,
  DocumentType,
  Improvement,
  PatternSummary,
  PatternContext,
  EscalationAnalysis,
  EscalationReason,
  DepthLevel,
} from './types.js';
import { EscalationThresholdsConfig } from '../../types/config.js';

/**
 * v4.11: Extended context options for optimization modes
 */
export interface OptimizationContextOverride {
  phase?: OptimizationPhase;
  documentType?: DocumentType;
  questionId?: string;
  intent?: string; // Override intent detection
  depthLevel?: DepthLevel; // v4.11: Explicit depth level for improve mode
}

/**
 * v4.12: Default escalation thresholds
 * These can be overridden via ClavixConfig.intelligence.escalation
 */
const DEFAULT_THRESHOLDS: Required<EscalationThresholdsConfig> = {
  comprehensiveAbove: 75,
  standardFloor: 60,
  intentConfidenceMin: 50,
  strongRecommendAbove: 75,
  suggestAbove: 45,
};

export class UniversalOptimizer {
  private intentDetector: IntentDetector;
  private patternLibrary: PatternLibrary;
  private qualityAssessor: QualityAssessor;
  private thresholds: Required<EscalationThresholdsConfig>;

  constructor(
    intentDetector?: IntentDetector,
    patternLibrary?: PatternLibrary,
    qualityAssessor?: QualityAssessor,
    escalationConfig?: EscalationThresholdsConfig
  ) {
    this.intentDetector = intentDetector || new IntentDetector();
    this.patternLibrary = patternLibrary || new PatternLibrary();
    this.qualityAssessor = qualityAssessor || new QualityAssessor();
    // v4.12: Merge user config with defaults
    this.thresholds = { ...DEFAULT_THRESHOLDS, ...escalationConfig };
  }

  /**
   * v4.12: Get current threshold configuration
   */
  getThresholds(): Required<EscalationThresholdsConfig> {
    return { ...this.thresholds };
  }

  /**
   * v4.11: Optimize a prompt using Clavix Intelligence
   * @param prompt The prompt to optimize
   * @param mode The optimization mode ('improve' | 'prd' | 'conversational')
   * @param contextOverride Optional context override including depthLevel
   */
  async optimize(
    prompt: string,
    mode: OptimizationMode,
    contextOverride?: OptimizationContextOverride
  ): Promise<OptimizationResult> {
    const startTime = Date.now();

    // Step 1: Detect intent (or use override)
    let intent = this.intentDetector.analyze(prompt);
    if (contextOverride?.intent) {
      intent = {
        ...intent,
        primaryIntent: contextOverride.intent as import('./types.js').PromptIntent,
      };
    }

    // v4.11: Get depth level (explicit or auto-detected)
    const depthLevel = contextOverride?.depthLevel;

    // Step 2: Select applicable patterns using mode-aware selection
    const patterns =
      mode === 'prd' || mode === 'conversational'
        ? this.patternLibrary.selectPatternsForMode(
            mode,
            intent,
            contextOverride?.phase,
            depthLevel
          )
        : this.patternLibrary.selectPatterns(intent, mode, depthLevel);

    // Step 3: Apply patterns sequentially
    let enhanced = prompt;
    const improvements: Improvement[] = [];
    const appliedPatterns: PatternSummary[] = [];

    const context: PatternContext = {
      intent,
      mode,
      originalPrompt: prompt,
      // v4.3.2: Extended context
      phase: contextOverride?.phase,
      documentType: contextOverride?.documentType,
      questionId: contextOverride?.questionId,
      // v4.11: Depth level for pattern selection
      depthLevel,
    };

    for (const pattern of patterns) {
      try {
        const result = pattern.apply(enhanced, context);

        if (result.applied) {
          enhanced = result.enhancedPrompt;
          improvements.push(result.improvement);
          appliedPatterns.push({
            name: pattern.name,
            description: pattern.description,
            impact: result.improvement.impact,
          });
        }
      } catch (error) {
        // Log error but continue with other patterns
        console.error(`Error applying pattern ${pattern.id}:`, error);
      }
    }

    // Step 4: Assess quality
    const quality = this.qualityAssessor.assess(prompt, enhanced, intent);

    // Step 5: Calculate processing time
    const processingTimeMs = Date.now() - startTime;

    return {
      original: prompt,
      enhanced,
      intent,
      quality,
      improvements,
      appliedPatterns,
      mode,
      depthUsed: depthLevel, // v4.11: Track which depth was used
      processingTimeMs,
    };
  }

  /**
   * v4.3.2: Validate a PRD answer and provide friendly suggestions
   * Uses adaptive threshold (< 50% quality triggers suggestions)
   */
  async validatePRDAnswer(
    answer: string,
    questionId: string
  ): Promise<{
    needsClarification: boolean;
    suggestion?: string;
    quality: number;
  }> {
    const result = await this.optimize(answer, 'prd', {
      phase: 'question-validation',
      questionId,
      intent: 'prd-generation',
    });

    // Adaptive threshold: only suggest improvements for very vague answers
    if (result.quality.overall < 50) {
      return {
        needsClarification: true,
        suggestion: this.generateFriendlySuggestion(result, questionId),
        quality: result.quality.overall,
      };
    }

    return {
      needsClarification: false,
      quality: result.quality.overall,
    };
  }

  /**
   * v4.3.2: Generate a friendly, non-intrusive suggestion for low-quality answers
   */
  private generateFriendlySuggestion(result: OptimizationResult, questionId: string): string {
    const suggestions: Record<string, string[]> = {
      q1: ["the problem you're solving", 'why this matters', 'who benefits'],
      q2: ['specific features', 'user actions', 'key functionality'],
      q3: ['technologies', 'frameworks', 'constraints'],
      q4: ["what's explicitly out of scope", 'features to avoid', 'limitations'],
      q5: ['additional context', 'constraints', 'timeline considerations'],
    };

    const questionSuggestions = suggestions[questionId] || suggestions.q5;

    // Pick the most relevant suggestion based on what's missing
    let detail = questionSuggestions[0];
    if (result.quality.completeness < 40) {
      detail = questionSuggestions[Math.min(1, questionSuggestions.length - 1)];
    }
    if (result.quality.specificity < 40) {
      detail = questionSuggestions[Math.min(2, questionSuggestions.length - 1)];
    }

    return `adding ${detail} would help`;
  }

  /**
   * v4.11: Determine if comprehensive depth should be recommended
   * @deprecated Use analyzeEscalation() for more detailed analysis
   */
  shouldRecommendComprehensive(result: OptimizationResult): boolean {
    const escalation = this.analyzeEscalation(result);
    return escalation.shouldEscalate;
  }

  /**
   * @deprecated Use shouldRecommendComprehensive() instead
   */
  shouldRecommendDeepMode(result: OptimizationResult): boolean {
    return this.shouldRecommendComprehensive(result);
  }

  /**
   * v4.11: Analyze whether to escalate from standard to comprehensive depth
   * Uses multi-factor scoring for intelligent triage decisions
   * v4.12: Uses configurable thresholds from EscalationThresholdsConfig
   *
   * IMPORTANT: Quality checks use the ORIGINAL prompt, not the enhanced one,
   * because triage decisions should be based on what the user wrote.
   */
  analyzeEscalation(result: OptimizationResult): EscalationAnalysis {
    const reasons: EscalationReason[] = [];
    let totalScore = 0;

    // v4.12: Use configurable thresholds
    const { standardFloor, suggestAbove, strongRecommendAbove, intentConfidenceMin } =
      this.thresholds;

    // Assess the ORIGINAL prompt's quality for triage decisions
    // (result.quality is for the enhanced prompt)
    const originalQuality = this.qualityAssessor.assessQuality(
      result.original,
      result.intent.primaryIntent
    );

    // Factor 1: Intent type (planning, prd-generation → +30 pts)
    const escalationIntents = ['planning', 'prd-generation'];
    if (escalationIntents.includes(result.intent.primaryIntent)) {
      const contribution = 30;
      totalScore += contribution;
      reasons.push({
        factor: 'intent-type',
        contribution,
        description: `${result.intent.primaryIntent} tasks benefit from comprehensive analysis`,
      });
    }

    // Factor 2: Low confidence (< intentConfidenceMin+10 → up to +20 pts)
    const confidenceThreshold = intentConfidenceMin + 10; // Default: 60
    if (result.intent.confidence < confidenceThreshold) {
      const contribution = Math.round((confidenceThreshold - result.intent.confidence) / 3); // Max 20 pts
      totalScore += contribution;
      reasons.push({
        factor: 'low-confidence',
        contribution,
        description: `Intent detection confidence is low (${result.intent.confidence}%)`,
      });
    }

    // Factor 3: Overall quality score (< standardFloor+5 → up to +25 pts) - uses ORIGINAL quality
    const qualityThreshold = standardFloor + 5; // Default: 65
    if (originalQuality.overall < qualityThreshold) {
      const contribution = Math.round((qualityThreshold - originalQuality.overall) / 2.6); // Max ~25 pts
      totalScore += contribution;
      reasons.push({
        factor: 'low-quality',
        contribution,
        description: `Original prompt quality is below threshold (${Math.round(originalQuality.overall)}/100)`,
      });
    }

    // Factor 4: Low completeness (< standardFloor → +15 pts) - uses ORIGINAL quality
    if (originalQuality.completeness < standardFloor) {
      const contribution = 15;
      totalScore += contribution;
      reasons.push({
        factor: 'missing-completeness',
        contribution,
        description: `Missing required details (completeness: ${Math.round(originalQuality.completeness)}%)`,
      });
    }

    // Factor 5: Low specificity (< standardFloor → +15 pts) - uses ORIGINAL quality
    if (originalQuality.specificity < standardFloor) {
      const contribution = 15;
      totalScore += contribution;
      reasons.push({
        factor: 'low-specificity',
        contribution,
        description: `Prompt lacks concrete details (specificity: ${Math.round(originalQuality.specificity)}%)`,
      });
    }

    // Factor 6: High ambiguity (open-ended + needs structure → +20 pts)
    if (result.intent.characteristics.isOpenEnded && result.intent.characteristics.needsStructure) {
      const contribution = 20;
      totalScore += contribution;
      reasons.push({
        factor: 'high-ambiguity',
        contribution,
        description: 'Open-ended request without clear structure',
      });
    }

    // Factor 7: Length mismatch (short prompt + incomplete → +15 pts) - uses ORIGINAL quality
    const completenessLenientThreshold = standardFloor + 10; // Default: 70
    if (
      result.original.length < 50 &&
      originalQuality.completeness < completenessLenientThreshold
    ) {
      const contribution = 15;
      totalScore += contribution;
      reasons.push({
        factor: 'length-mismatch',
        contribution,
        description: 'Very short prompt with incomplete requirements',
      });
    }

    // Factor 8: Complex intents that benefit from deep analysis
    const complexIntents = ['migration', 'security-review'];
    if (complexIntents.includes(result.intent.primaryIntent)) {
      const contribution = 20;
      totalScore += contribution;
      reasons.push({
        factor: 'complex-intent',
        contribution,
        description: `${result.intent.primaryIntent} requires thorough analysis`,
      });
    }

    // v4.12: Determine escalation confidence using configurable thresholds
    // suggestAbove for escalation, (suggestAbove+strongRecommendAbove)/2 for medium, strongRecommendAbove for high
    const mediumThreshold = Math.round((suggestAbove + strongRecommendAbove) / 2); // Default: 60
    let escalationConfidence: 'high' | 'medium' | 'low';
    if (totalScore >= strongRecommendAbove) {
      escalationConfidence = 'high';
    } else if (totalScore >= mediumThreshold) {
      escalationConfidence = 'medium';
    } else {
      escalationConfidence = 'low';
    }

    // v4.11: Generate comprehensive mode value proposition
    const comprehensiveValue = this.generateComprehensiveValue(result, reasons);

    return {
      // v4.12: Use configurable suggestAbove threshold (default: 45)
      shouldEscalate: totalScore >= suggestAbove,
      escalationScore: Math.min(totalScore, 100),
      escalationConfidence,
      reasons,
      comprehensiveValue,
    };
  }

  /**
   * v4.11: Generate a user-friendly explanation of what comprehensive depth would provide
   */
  private generateComprehensiveValue(
    result: OptimizationResult,
    reasons: EscalationReason[]
  ): string {
    const benefits: string[] = [];

    // Based on primary issues, suggest specific comprehensive depth benefits
    const hasLowQuality = reasons.some((r) => r.factor === 'low-quality');
    const hasLowCompleteness = reasons.some((r) => r.factor === 'missing-completeness');
    const hasHighAmbiguity = reasons.some((r) => r.factor === 'high-ambiguity');
    const hasLowSpecificity = reasons.some((r) => r.factor === 'low-specificity');
    const isPlanningIntent =
      result.intent.primaryIntent === 'planning' ||
      result.intent.primaryIntent === 'prd-generation';

    if (isPlanningIntent) {
      benefits.push('structured implementation plan');
    }

    if (hasLowQuality || hasLowCompleteness) {
      benefits.push('comprehensive requirements extraction');
    }

    if (hasHighAmbiguity) {
      benefits.push('alternative approaches and trade-offs');
    }

    if (hasLowSpecificity) {
      benefits.push('concrete examples and specifications');
    }

    if (result.intent.primaryIntent === 'migration') {
      benefits.push('migration checklist and risk assessment');
    }

    if (result.intent.primaryIntent === 'security-review') {
      benefits.push('security checklist and threat analysis');
    }

    // Always include validation checklist for comprehensive depth
    benefits.push('validation checklist');

    if (benefits.length === 0) {
      return 'Comprehensive analysis provides thorough examination with alternative approaches.';
    }

    return `Comprehensive analysis would provide: ${benefits.join(', ')}.`;
  }

  /**
   * v4.11: Get recommendation message for user
   * Enhanced with escalation analysis for improve mode
   */
  getRecommendation(result: OptimizationResult): string | null {
    // v4.11: Check for escalation only in improve mode with standard depth
    if (result.mode === 'improve' && result.depthUsed !== 'comprehensive') {
      const escalation = this.analyzeEscalation(result);
      if (escalation.shouldEscalate) {
        return `${escalation.comprehensiveValue} Run: /clavix:improve --comprehensive`;
      }
    }

    if (result.quality.overall >= 90) {
      return 'Excellent! Your prompt is AI-ready.';
    }

    if (result.quality.overall >= 80) {
      return 'Good quality. Ready to use!';
    }

    if (result.quality.overall >= 70) {
      return 'Decent quality. Consider the improvements listed above.';
    }

    return null;
  }

  /**
   * v4.11: Get detailed escalation recommendation with all reasons
   * Useful for verbose output or debugging
   */
  getDetailedRecommendation(result: OptimizationResult): {
    message: string;
    escalation?: EscalationAnalysis;
    qualityLevel: 'excellent' | 'good' | 'decent' | 'needs-work';
  } {
    // v4.11: Check escalation for improve mode with non-comprehensive depth
    const escalation =
      result.mode === 'improve' && result.depthUsed !== 'comprehensive'
        ? this.analyzeEscalation(result)
        : undefined;

    let qualityLevel: 'excellent' | 'good' | 'decent' | 'needs-work';
    let message: string;

    if (result.quality.overall >= 90) {
      qualityLevel = 'excellent';
      message = 'Excellent! Your prompt is AI-ready.';
    } else if (result.quality.overall >= 80) {
      qualityLevel = 'good';
      message = 'Good quality. Ready to use!';
    } else if (result.quality.overall >= 70) {
      qualityLevel = 'decent';
      message = 'Decent quality. Consider the improvements listed above.';
    } else {
      qualityLevel = 'needs-work';
      message = 'This prompt needs improvement for best results.';
    }

    if (escalation?.shouldEscalate) {
      message = `${escalation.comprehensiveValue} Run: /clavix:improve --comprehensive`;
    }

    return {
      message,
      escalation,
      qualityLevel,
    };
  }

  /**
   * v4.11: Get statistics about the optimizer
   */
  getStatistics(): {
    totalPatterns: number;
    standardPatterns: number;
    comprehensivePatterns: number;
  } {
    const totalPatterns = this.patternLibrary.getPatternCount();
    const standardPatterns = this.patternLibrary.getPatternsByScope('standard').length;
    const comprehensivePatterns = this.patternLibrary.getPatternsByScope('comprehensive').length;

    return {
      totalPatterns,
      standardPatterns,
      comprehensivePatterns,
    };
  }
}
