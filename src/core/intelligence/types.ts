// Core types for the universal prompt intelligence system

export type PromptIntent =
  | 'code-generation'    // "Build a React component"
  | 'planning'           // "Help me plan a feature"
  | 'refinement'         // "Make this faster"
  | 'debugging'          // "Fix this error"
  | 'documentation'      // "Explain this code"
  | 'prd-generation';    // PRD flow

export type QualityDimension =
  | 'clarity'         // Was: Explicitness (E) - Is the objective unambiguous?
  | 'efficiency'      // Was: Conciseness (C) - Concise signal without noise?
  | 'structure'       // Was: Logic (L) - Logical context → requirements → output flow?
  | 'completeness'    // New: All necessary constraints specified?
  | 'actionability';  // New: Can AI execute immediately?

export type ImpactLevel = 'low' | 'medium' | 'high';

export type OptimizationMode = 'fast' | 'deep';

export interface IntentAnalysis {
  primaryIntent: PromptIntent;
  confidence: number; // 0-100
  characteristics: {
    hasCodeContext: boolean;
    hasTechnicalTerms: boolean;
    isOpenEnded: boolean;
    needsStructure: boolean;
  };
  suggestedMode?: OptimizationMode;
}

export interface QualityMetrics {
  clarity: number;        // 0-100
  efficiency: number;     // 0-100
  structure: number;      // 0-100
  completeness: number;   // 0-100
  actionability: number;  // 0-100

  overall: number;        // Weighted average

  strengths: string[];           // What's already good
  improvements: string[];        // What was enhanced
  remainingIssues?: string[];    // What still needs work
}

export interface Improvement {
  dimension: QualityDimension;
  description: string;
  impact: ImpactLevel;
}

export interface PatternContext {
  intent: IntentAnalysis;
  mode: OptimizationMode;
  originalPrompt: string;
}

export interface PatternResult {
  enhancedPrompt: string;
  improvement: Improvement;
  applied: boolean;
}

export interface PatternSummary {
  name: string;
  description: string;
  impact: ImpactLevel;
}

export interface OptimizationResult {
  original: string;
  enhanced: string;
  intent: IntentAnalysis;
  quality: QualityMetrics;
  improvements: Improvement[];
  appliedPatterns: PatternSummary[];
  mode: OptimizationMode;
  processingTimeMs: number;
}

export interface AlternativeApproach {
  title: string;
  description: string;
  prompt: string;
}

export interface AlternativeStructure {
  type: 'step-by-step' | 'template-based' | 'example-driven';
  title: string;
  content: string;
}

export interface ValidationItem {
  description: string;
  checked: boolean;
}

export interface EdgeCase {
  scenario: string;
  consideration: string;
}

export interface DeepModeExtras {
  alternatives: AlternativeApproach[];
  structures: AlternativeStructure[];
  validation: ValidationItem[];
  edgeCases: EdgeCase[];
}
