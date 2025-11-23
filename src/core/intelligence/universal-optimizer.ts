import { IntentDetector } from './intent-detector.js';
import { PatternLibrary } from './pattern-library.js';
import { QualityAssessor } from './quality-assessor.js';
import {
  OptimizationResult,
  OptimizationMode,
  Improvement,
  PatternSummary,
  PatternContext
} from './types.js';

export class UniversalOptimizer {
  private intentDetector: IntentDetector;
  private patternLibrary: PatternLibrary;
  private qualityAssessor: QualityAssessor;

  constructor(
    intentDetector?: IntentDetector,
    patternLibrary?: PatternLibrary,
    qualityAssessor?: QualityAssessor
  ) {
    this.intentDetector = intentDetector || new IntentDetector();
    this.patternLibrary = patternLibrary || new PatternLibrary();
    this.qualityAssessor = qualityAssessor || new QualityAssessor();
  }

  /**
   * Optimize a prompt using the universal intelligence system
   */
  async optimize(prompt: string, mode: OptimizationMode): Promise<OptimizationResult> {
    const startTime = Date.now();

    // Step 1: Detect intent
    const intent = this.intentDetector.analyze(prompt);

    // Step 2: Select applicable patterns
    const patterns = this.patternLibrary.selectPatterns(intent, mode);

    // Step 3: Apply patterns sequentially
    let enhanced = prompt;
    const improvements: Improvement[] = [];
    const appliedPatterns: PatternSummary[] = [];

    const context: PatternContext = {
      intent,
      mode,
      originalPrompt: prompt
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
            impact: result.improvement.impact
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
      processingTimeMs
    };
  }

  /**
   * Determine if deep mode should be recommended (for fast mode results)
   */
  shouldRecommendDeepMode(result: OptimizationResult): boolean {
    // Planning tasks benefit from deep mode
    if (result.intent.primaryIntent === 'planning') {
      return true;
    }

    // Low quality score suggests need for deep analysis
    if (result.quality.overall < 65) {
      return true;
    }

    // Open-ended tasks without clear structure
    if (result.intent.characteristics.isOpenEnded && result.intent.characteristics.needsStructure) {
      return true;
    }

    // Very short prompts with low completeness
    if (result.original.length < 50 && result.quality.completeness < 70) {
      return true;
    }

    return false;
  }

  /**
   * Get recommendation message for user
   */
  getRecommendation(result: OptimizationResult): string | null {
    if (result.mode === 'fast' && this.shouldRecommendDeepMode(result)) {
      return 'This prompt would benefit from comprehensive analysis. Run: /clavix:deep for alternative approaches and validation checklist';
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
   * Get statistics about the optimizer
   */
  getStatistics(): {
    totalPatterns: number;
    fastModePatterns: number;
    deepModePatterns: number;
  } {
    const totalPatterns = this.patternLibrary.getPatternCount();
    const fastModePatterns = this.patternLibrary.getPatternsByMode('fast').length;
    const deepModePatterns = this.patternLibrary.getPatternsByMode('deep').length;

    return {
      totalPatterns,
      fastModePatterns,
      deepModePatterns
    };
  }
}
