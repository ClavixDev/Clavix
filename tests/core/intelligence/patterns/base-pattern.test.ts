import { describe, it, expect, beforeEach } from '@jest/globals';
import { BasePattern } from '../../../../src/core/intelligence/patterns/base-pattern.js';
import {
  PatternContext,
  PatternResult,
  PromptIntent,
  OptimizationMode,
} from '../../../../src/core/intelligence/types.js';

// Concrete implementation for testing abstract class
class TestPattern extends BasePattern {
  id = 'test-pattern';
  name = 'Test Pattern';
  description = 'A test pattern for testing';
  applicableIntents: PromptIntent[] = ['code-generation', 'planning'];
  mode: OptimizationMode | 'both' = 'both';
  priority = 5;

  apply(prompt: string, context: PatternContext): PatternResult {
    return {
      enhancedPrompt: prompt,
      improvement: {
        dimension: 'clarity',
        description: 'Test improvement',
        impact: 'low',
      },
      applied: false,
    };
  }

  // Expose protected methods for testing
  public testCleanWhitespace(text: string): string {
    return this.cleanWhitespace(text);
  }

  public testHasSection(prompt: string, keywords: string[]): boolean {
    return this.hasSection(prompt, keywords);
  }

  public testCountWords(text: string): number {
    return this.countWords(text);
  }

  public testExtractSentences(text: string): string[] {
    return this.extractSentences(text);
  }
}

describe('BasePattern', () => {
  let pattern: TestPattern;
  let mockContext: PatternContext;

  beforeEach(() => {
    pattern = new TestPattern();
    mockContext = {
      mode: 'fast',
      originalPrompt: 'Test prompt',
      intent: {
        primaryIntent: 'code-generation',
        confidence: 90,
        characteristics: {
          hasCodeContext: false,
          hasTechnicalTerms: true,
          isOpenEnded: false,
          needsStructure: false,
        },
      },
    };
  });

  describe('isApplicable', () => {
    it('should return true when mode is "both" and intent matches', () => {
      pattern.mode = 'both';
      expect(pattern.isApplicable(mockContext)).toBe(true);
    });

    it('should return true when mode matches context mode', () => {
      pattern.mode = 'fast';
      mockContext.mode = 'fast';
      expect(pattern.isApplicable(mockContext)).toBe(true);
    });

    it('should return false when mode does not match context mode', () => {
      pattern.mode = 'deep';
      mockContext.mode = 'fast';
      expect(pattern.isApplicable(mockContext)).toBe(false);
    });

    it('should return false when intent is not in applicableIntents', () => {
      mockContext.intent.primaryIntent = 'documentation';
      expect(pattern.isApplicable(mockContext)).toBe(false);
    });

    it('should return true for all applicable intents', () => {
      for (const intent of pattern.applicableIntents) {
        mockContext.intent.primaryIntent = intent;
        expect(pattern.isApplicable(mockContext)).toBe(true);
      }
    });

    it('should handle debugging intent correctly when not applicable', () => {
      mockContext.intent.primaryIntent = 'debugging';
      expect(pattern.isApplicable(mockContext)).toBe(false);
    });
  });

  describe('cleanWhitespace', () => {
    it('should replace multiple spaces with single space', () => {
      expect(pattern.testCleanWhitespace('hello    world')).toBe('hello world');
    });

    it('should trim leading and trailing whitespace', () => {
      expect(pattern.testCleanWhitespace('  hello world  ')).toBe('hello world');
    });

    it('should replace newlines with spaces', () => {
      expect(pattern.testCleanWhitespace('hello\n\nworld')).toBe('hello world');
    });

    it('should replace tabs with spaces', () => {
      expect(pattern.testCleanWhitespace('hello\t\tworld')).toBe('hello world');
    });

    it('should handle empty string', () => {
      expect(pattern.testCleanWhitespace('')).toBe('');
    });

    it('should handle string with only whitespace', () => {
      expect(pattern.testCleanWhitespace('   \n\t   ')).toBe('');
    });
  });

  describe('hasSection', () => {
    it('should return true when keyword is found', () => {
      expect(pattern.testHasSection('Objective: Build something', ['objective'])).toBe(true);
    });

    it('should return true when any keyword is found', () => {
      expect(pattern.testHasSection('Goal: Build something', ['objective', 'goal'])).toBe(true);
    });

    it('should return false when no keyword is found', () => {
      expect(pattern.testHasSection('Build something', ['objective', 'goal'])).toBe(false);
    });

    it('should be case-insensitive', () => {
      expect(pattern.testHasSection('OBJECTIVE: test', ['objective'])).toBe(true);
    });

    it('should handle empty keywords array', () => {
      expect(pattern.testHasSection('Some text', [])).toBe(false);
    });

    it('should handle empty prompt', () => {
      expect(pattern.testHasSection('', ['objective'])).toBe(false);
    });
  });

  describe('countWords', () => {
    it('should count words correctly', () => {
      expect(pattern.testCountWords('hello world')).toBe(2);
    });

    it('should handle multiple spaces between words', () => {
      expect(pattern.testCountWords('hello    world')).toBe(2);
    });

    it('should handle empty string', () => {
      expect(pattern.testCountWords('')).toBe(0);
    });

    it('should handle single word', () => {
      expect(pattern.testCountWords('hello')).toBe(1);
    });

    it('should handle newlines and tabs', () => {
      expect(pattern.testCountWords('one\ntwo\tthree')).toBe(3);
    });
  });

  describe('extractSentences', () => {
    it('should extract sentences ending with period', () => {
      const sentences = pattern.testExtractSentences('First sentence. Second sentence.');
      expect(sentences).toHaveLength(2);
      expect(sentences[0].trim()).toBe('First sentence');
    });

    it('should extract sentences ending with exclamation', () => {
      const sentences = pattern.testExtractSentences('Hello! World!');
      expect(sentences).toHaveLength(2);
    });

    it('should extract sentences ending with question mark', () => {
      const sentences = pattern.testExtractSentences('What is this? Something else?');
      expect(sentences).toHaveLength(2);
    });

    it('should handle mixed punctuation', () => {
      const sentences = pattern.testExtractSentences('Statement. Question? Exclamation!');
      expect(sentences).toHaveLength(3);
    });

    it('should filter out empty sentences', () => {
      const sentences = pattern.testExtractSentences('Hello...');
      expect(sentences.every((s) => s.trim().length > 0)).toBe(true);
    });

    it('should handle empty string', () => {
      expect(pattern.testExtractSentences('')).toHaveLength(0);
    });
  });

  describe('pattern properties', () => {
    it('should have required id', () => {
      expect(pattern.id).toBe('test-pattern');
    });

    it('should have required name', () => {
      expect(pattern.name).toBe('Test Pattern');
    });

    it('should have required description', () => {
      expect(pattern.description).toBe('A test pattern for testing');
    });

    it('should have priority in valid range', () => {
      expect(pattern.priority).toBeGreaterThanOrEqual(1);
      expect(pattern.priority).toBeLessThanOrEqual(10);
    });
  });
});
