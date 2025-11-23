import {
  PromptIntent,
  OptimizationMode,
  PatternContext,
  PatternResult
} from '../types.js';

export abstract class BasePattern {
  abstract id: string;
  abstract name: string;
  abstract description: string;
  abstract applicableIntents: PromptIntent[];
  abstract mode: OptimizationMode | 'both';
  abstract priority: number; // 1-10 (10 = highest priority, runs first)

  abstract apply(prompt: string, context: PatternContext): PatternResult;

  /**
   * Check if this pattern is applicable for the given context
   */
  isApplicable(context: PatternContext): boolean {
    // Check mode compatibility
    if (this.mode !== 'both' && this.mode !== context.mode) {
      return false;
    }

    // Check intent compatibility
    return this.applicableIntents.includes(context.intent.primaryIntent);
  }

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
    return keywords.some(keyword => lowerPrompt.includes(keyword.toLowerCase()));
  }

  /**
   * Utility: Count words
   */
  protected countWords(text: string): number {
    return text.split(/\s+/).filter(word => word.length > 0).length;
  }

  /**
   * Utility: Extract sentences
   */
  protected extractSentences(text: string): string[] {
    return text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  }
}
