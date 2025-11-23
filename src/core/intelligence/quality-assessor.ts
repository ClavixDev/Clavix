import { IntentAnalysis, QualityMetrics, Improvement, PromptIntent } from './types.js';

export class QualityAssessor {
  /**
   * Assess quality of a prompt (backward compatibility wrapper)
   * @deprecated Use assess() method instead for full quality metrics
   */
  assessQuality(prompt: string, intent: string): {
    clarity: number;
    efficiency: number;
    structure: number;
    completeness: number;
    actionability: number;
    overall: number;
  } {
    // Create minimal IntentAnalysis from string intent
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

    // Call existing assess method with same prompt for both original and enhanced
    const result = this.assess(prompt, prompt, intentAnalysis);

    // Return only the numeric scores (exclude strengths and improvements arrays)
    return {
      clarity: result.clarity,
      efficiency: result.efficiency,
      structure: result.structure,
      completeness: result.completeness,
      actionability: result.actionability,
      overall: result.overall
    };
  }

  /**
   * Assess quality of a prompt
   */
  assess(original: string, enhanced: string, intent: IntentAnalysis): QualityMetrics {
    const clarity = this.assessClarity(enhanced, intent);
    const efficiency = this.assessEfficiency(enhanced);
    const structure = this.assessStructure(enhanced, intent);
    const completeness = this.assessCompleteness(enhanced, intent);
    const actionability = this.assessActionability(enhanced, intent);

    const overall = this.calculateOverall(
      { clarity, efficiency, structure, completeness, actionability },
      intent
    );

    const strengths = this.identifyStrengths(enhanced, { clarity, efficiency, structure, completeness, actionability });
    const improvements = this.identifyImprovements(original, enhanced);

    return {
      clarity,
      efficiency,
      structure,
      completeness,
      actionability,
      overall,
      strengths,
      improvements
    };
  }

  private assessClarity(prompt: string, intent: IntentAnalysis): number {
    let score = 100;
    const lowerPrompt = prompt.toLowerCase();

    // Check for objective statement
    if (!this.hasObjective(prompt)) {
      score -= 20;
    }

    // Check for technical specifications (for code generation)
    if (intent.primaryIntent === 'code-generation') {
      if (!this.hasTechStack(prompt)) {
        score -= 15;
      }
      if (!this.hasOutputFormat(prompt)) {
        score -= 15;
      }
    }

    // Check for success criteria
    if (!this.hasSuccessCriteria(prompt)) {
      score -= 10;
    }

    // Check for vague language
    const vagueTerms = ['something', 'somehow', 'maybe', 'kind of', 'sort of', 'stuff', 'things'];
    const vagueCount = vagueTerms.filter(term => lowerPrompt.includes(term)).length;
    score -= vagueCount * 5;

    return Math.max(0, Math.min(100, score));
  }

  private assessEfficiency(prompt: string): number {
    let score = 100;

    // Check for pleasantries
    const pleasantries = ['please', 'thank you', 'thanks', 'could you', 'would you'];
    const lowerPrompt = prompt.toLowerCase();
    const pleasantryCount = pleasantries.filter(p => lowerPrompt.includes(p)).length;
    score -= pleasantryCount * 5;

    // Check for fluff words
    const fluffWords = ['very', 'really', 'just', 'basically', 'simply', 'actually', 'literally'];
    const fluffCount = fluffWords.filter(w => lowerPrompt.includes(w)).length;
    score -= fluffCount * 3;

    // Calculate signal-to-noise ratio
    const words = prompt.split(/\s+/);
    const signalWords = this.countSignalWords(prompt);
    const ratio = words.length > 0 ? signalWords / words.length : 0;

    if (ratio < 0.6) {
      score -= 30;
    } else if (ratio < 0.75) {
      score -= 15;
    }

    return Math.max(0, Math.min(100, score));
  }

  private assessStructure(prompt: string, intent: IntentAnalysis): number {
    let score = 100;

    // Check for logical flow: context → requirements → constraints → output
    const hasContext = this.hasSection(prompt, ['context', 'background', 'currently']);
    const hasRequirements = this.hasSection(prompt, ['requirement', 'need', 'should', 'must']);
    const hasConstraints = this.hasSection(prompt, ['constraint', 'limit', 'within']);
    const hasOutput = this.hasSection(prompt, ['output', 'result', 'deliverable', 'expected']);

    // Penalize missing sections based on intent
    if (intent.primaryIntent !== 'refinement' && !hasContext) {
      score -= 20;
    }
    if (!hasRequirements) {
      score -= 25;
    }
    if (!hasOutput) {
      score -= 15;
    }

    // Check for markdown structure
    const hasHeaders = /^#+\s+/m.test(prompt);
    if (hasHeaders) {
      score += 10; // Bonus for using headers
    }

    return Math.max(0, Math.min(100, score));
  }

  private assessCompleteness(prompt: string, intent: IntentAnalysis): number {
    let score = 100;
    const lowerPrompt = prompt.toLowerCase();

    // Intent-specific completeness checks
    if (intent.primaryIntent === 'code-generation') {
      if (!this.hasTechStack(prompt)) score -= 20;
      if (!this.hasInputOutput(prompt)) score -= 20;
      if (!this.hasEdgeCases(prompt)) score -= 10;
    } else if (intent.primaryIntent === 'planning') {
      if (!this.hasProblemStatement(prompt)) score -= 25;
      if (!this.hasGoal(prompt)) score -= 25;
      if (!this.hasConstraints(prompt)) score -= 15;
    } else if (intent.primaryIntent === 'debugging') {
      if (!lowerPrompt.includes('error')) score -= 20;
      if (!this.hasExpectedBehavior(prompt)) score -= 15;
      if (!this.hasActualBehavior(prompt)) score -= 15;
    }

    return Math.max(0, Math.min(100, score));
  }

  private assessActionability(prompt: string, intent: IntentAnalysis): number {
    let score = 100;
    const lowerPrompt = prompt.toLowerCase();

    // Check for ambiguous terms
    const ambiguousTerms = ['etc', 'and so on', 'or something', 'whatever', 'anything'];
    const ambiguousCount = ambiguousTerms.filter(term => lowerPrompt.includes(term)).length;
    score -= ambiguousCount * 10;

    // Check for concrete examples
    const hasExamples = this.hasExamples(prompt);
    if (!hasExamples && intent.primaryIntent === 'code-generation') {
      score -= 15;
    }

    // Check for clear success criteria
    if (!this.hasSuccessCriteria(prompt)) {
      score -= 20;
    }

    // Check for too many questions (makes it un-actionable)
    const questionCount = (prompt.match(/\?/g) || []).length;
    if (questionCount > 3) {
      score -= questionCount * 5;
    }

    return Math.max(0, Math.min(100, score));
  }

  private calculateOverall(
    scores: { clarity: number; efficiency: number; structure: number; completeness: number; actionability: number },
    intent: IntentAnalysis
  ): number {
    // Intent-specific weights
    if (intent.primaryIntent === 'code-generation') {
      return (
        scores.clarity * 0.25 +
        scores.completeness * 0.30 +
        scores.actionability * 0.25 +
        scores.efficiency * 0.10 +
        scores.structure * 0.10
      );
    } else if (intent.primaryIntent === 'planning') {
      return (
        scores.structure * 0.30 +
        scores.completeness * 0.30 +
        scores.clarity * 0.25 +
        scores.efficiency * 0.10 +
        scores.actionability * 0.05
      );
    } else if (intent.primaryIntent === 'debugging') {
      return (
        scores.actionability * 0.35 +
        scores.completeness * 0.30 +
        scores.clarity * 0.20 +
        scores.structure * 0.10 +
        scores.efficiency * 0.05
      );
    }

    // Default weights
    return (
      scores.clarity * 0.20 +
      scores.efficiency * 0.15 +
      scores.structure * 0.20 +
      scores.completeness * 0.25 +
      scores.actionability * 0.20
    );
  }

  private identifyStrengths(prompt: string, scores: { clarity: number; efficiency: number; structure: number; completeness: number; actionability: number }): string[] {
    const strengths: string[] = [];

    if (scores.clarity >= 85) strengths.push('Clear objective and goals');
    if (scores.efficiency >= 85) strengths.push('Concise and focused');
    if (scores.structure >= 85) strengths.push('Well-structured with logical flow');
    if (scores.completeness >= 85) strengths.push('Comprehensive with all necessary details');
    if (scores.actionability >= 85) strengths.push('Immediately actionable');

    return strengths;
  }

  private identifyImprovements(original: string, enhanced: string): string[] {
    const improvements: string[] = [];

    // This is a simplified version - in real implementation,
    // we'd track what changed between original and enhanced
    if (enhanced.length > original.length * 1.2) {
      improvements.push('Added missing context and specifications');
    }

    if (enhanced.includes('# Objective') && !original.includes('# Objective')) {
      improvements.push('Added clear objective statement');
    }

    if (enhanced.includes('# Technical Constraints') && !original.includes('# Technical Constraints')) {
      improvements.push('Added technical context');
    }

    return improvements;
  }

  // Helper methods
  private hasObjective(prompt: string): boolean {
    return /objective|goal|purpose|need to|want to|^#+\s*objective/im.test(prompt);
  }

  private hasTechStack(prompt: string): boolean {
    const techTerms = [
      'python', 'javascript', 'typescript', 'java', 'rust', 'go', 'php',
      'react', 'vue', 'angular', 'django', 'flask', 'express', 'spring'
    ];
    const lowerPrompt = prompt.toLowerCase();
    return techTerms.some(term => lowerPrompt.includes(term));
  }

  private hasOutputFormat(prompt: string): boolean {
    return /output|return|result|format|structure|response/i.test(prompt);
  }

  private hasSuccessCriteria(prompt: string): boolean {
    return /success|criteria|metric|measure|test|verify|validate/i.test(prompt);
  }

  private hasSection(prompt: string, keywords: string[]): boolean {
    const lowerPrompt = prompt.toLowerCase();
    return keywords.some(keyword => lowerPrompt.includes(keyword));
  }

  private countSignalWords(prompt: string): number {
    // Count words that carry meaning (not stop words)
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
      'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
      'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those'
    ]);

    const words = prompt.toLowerCase().split(/\s+/);
    return words.filter(word => !stopWords.has(word) && word.length > 2).length;
  }

  private hasInputOutput(prompt: string): boolean {
    return /input|output|parameter|argument|return/i.test(prompt);
  }

  private hasEdgeCases(prompt: string): boolean {
    return /edge case|empty|null|zero|negative|invalid|error/i.test(prompt);
  }

  private hasProblemStatement(prompt: string): boolean {
    return /problem|issue|challenge|currently|pain point/i.test(prompt);
  }

  private hasGoal(prompt: string): boolean {
    return /goal|objective|aim|purpose|achieve|accomplish/i.test(prompt);
  }

  private hasConstraints(prompt: string): boolean {
    return /constraint|limit|must not|cannot|within|maximum|minimum/i.test(prompt);
  }

  private hasExpectedBehavior(prompt: string): boolean {
    return /expected|should|supposed to|intended/i.test(prompt);
  }

  private hasActualBehavior(prompt: string): boolean {
    return /actual|currently|instead|but|however|getting/i.test(prompt);
  }

  private hasExamples(prompt: string): boolean {
    return /example|for instance|such as|like|e\.g\.|```/i.test(prompt);
  }
}
