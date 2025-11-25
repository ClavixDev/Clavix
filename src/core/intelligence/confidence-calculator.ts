/**
 * v4.5 Confidence Calculator Utilities
 *
 * Shared utilities for calculating confidence scores across the intelligence system.
 * Provides type-safe confidence values and common calculation patterns.
 */

// ============================================================================
// Types
// ============================================================================

/**
 * Confidence level as a percentage (0-100).
 * - 0-49: Low confidence
 * - 50-69: Medium confidence
 * - 70-84: High confidence
 * - 85-100: Very high confidence
 */
export type ConfidenceLevel = number;

/**
 * Confidence category for display purposes
 */
export type ConfidenceCategory = 'low' | 'medium' | 'high' | 'very-high';

/**
 * Confidence result with category and percentage
 */
export interface ConfidenceResult {
  percentage: ConfidenceLevel;
  category: ConfidenceCategory;
}

// ============================================================================
// Thresholds
// ============================================================================

export const CONFIDENCE_THRESHOLDS = {
  LOW_MAX: 49,
  MEDIUM_MAX: 69,
  HIGH_MAX: 84,
  VERY_HIGH_MIN: 85,
} as const;

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Clamp a confidence value to valid range (0-100)
 */
export function clampConfidence(value: number): ConfidenceLevel {
  return Math.min(100, Math.max(0, Math.round(value)));
}

/**
 * Get confidence category from percentage
 */
export function getConfidenceCategory(percentage: ConfidenceLevel): ConfidenceCategory {
  if (percentage <= CONFIDENCE_THRESHOLDS.LOW_MAX) return 'low';
  if (percentage <= CONFIDENCE_THRESHOLDS.MEDIUM_MAX) return 'medium';
  if (percentage <= CONFIDENCE_THRESHOLDS.HIGH_MAX) return 'high';
  return 'very-high';
}

/**
 * Create a confidence result from a percentage
 */
export function createConfidenceResult(percentage: number): ConfidenceResult {
  const clamped = clampConfidence(percentage);
  return {
    percentage: clamped,
    category: getConfidenceCategory(clamped),
  };
}

// ============================================================================
// Calculation Patterns
// ============================================================================

/**
 * Calculate additive confidence based on presence of elements.
 * Common pattern: base + bonus for each element present.
 *
 * @example
 * calculateAdditiveConfidence(50, [
 *   [hasRequirements, 20],
 *   [hasGoals, 15],
 *   [hasConstraints, 15],
 * ]);
 */
export function calculateAdditiveConfidence(
  baseConfidence: number,
  bonuses: Array<[boolean, number]>
): ConfidenceLevel {
  let total = baseConfidence;
  for (const [condition, bonus] of bonuses) {
    if (condition) {
      total += bonus;
    }
  }
  return clampConfidence(total);
}

/**
 * Calculate ratio-based confidence.
 * Common pattern: primary score as percentage of total score.
 *
 * @example
 * calculateRatioConfidence(primaryScore, totalScore);
 */
export function calculateRatioConfidence(
  primaryScore: number,
  totalScore: number,
  options: { minConfidence?: number; fallbackConfidence?: number } = {}
): ConfidenceLevel {
  const { minConfidence = 0, fallbackConfidence = 50 } = options;

  if (totalScore === 0) {
    return fallbackConfidence;
  }

  const ratio = primaryScore / totalScore;
  const percentage = Math.round(ratio * 100);

  return clampConfidence(Math.max(minConfidence, percentage));
}

/**
 * Apply confidence penalty when competing scores are close.
 * Common pattern: reduce confidence when there's ambiguity.
 *
 * @example
 * applyCompetitionPenalty(confidence, primaryScore, secondaryScore, {
 *   threshold: 0.15,
 *   penalty: 15,
 *   minConfidence: 60,
 * });
 */
export function applyCompetitionPenalty(
  confidence: number,
  primaryScore: number,
  secondaryScore: number,
  options: { threshold?: number; penalty?: number; minConfidence?: number } = {}
): ConfidenceLevel {
  const { threshold = 0.15, penalty = 15, minConfidence = 60 } = options;

  const difference = primaryScore - secondaryScore;

  // If scores are within threshold, apply penalty
  if (primaryScore > 0 && difference < primaryScore * threshold) {
    return clampConfidence(Math.max(minConfidence, confidence - penalty));
  }

  return clampConfidence(confidence);
}

/**
 * Calculate weighted average confidence from multiple sources.
 *
 * @example
 * calculateWeightedConfidence([
 *   [intentConfidence, 0.6],
 *   [qualityConfidence, 0.4],
 * ]);
 */
export function calculateWeightedConfidence(
  scores: Array<[number, number]> // [confidence, weight]
): ConfidenceLevel {
  const totalWeight = scores.reduce((sum, [, weight]) => sum + weight, 0);

  if (totalWeight === 0) {
    return 50;
  }

  const weightedSum = scores.reduce((sum, [confidence, weight]) => sum + confidence * weight, 0);

  return clampConfidence(weightedSum / totalWeight);
}
