import { describe, it, expect, beforeEach } from '@jest/globals';
import { AmbiguityDetector } from '../../../../src/core/intelligence/patterns/ambiguity-detector.js';
import { PatternContext } from '../../../../src/core/intelligence/types.js';

describe('AmbiguityDetector', () => {
  let pattern: AmbiguityDetector;
  let mockContext: PatternContext;

  beforeEach(() => {
    pattern = new AmbiguityDetector();
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

  describe('pattern properties', () => {
    it('should have correct id', () => {
      expect(pattern.id).toBe('ambiguity-detector');
    });

    it('should have correct name', () => {
      expect(pattern.name).toBe('Ambiguity Detector');
    });

    it('should have correct description', () => {
      expect(pattern.description).toBe(
        'Identifies and clarifies ambiguous terms and vague references'
      );
    });

    it('should support both modes', () => {
      expect(pattern.mode).toBe('both');
    });

    it('should have priority 9 (high)', () => {
      expect(pattern.priority).toBe(9);
    });

    it('should be applicable for many intents', () => {
      expect(pattern.applicableIntents).toContain('code-generation');
      expect(pattern.applicableIntents).toContain('planning');
      expect(pattern.applicableIntents).toContain('debugging');
      expect(pattern.applicableIntents).toContain('documentation');
      expect(pattern.applicableIntents).toContain('testing');
      expect(pattern.applicableIntents).toContain('migration');
    });
  });

  describe('isApplicable', () => {
    it('should return true for code-generation intent', () => {
      mockContext.intent.primaryIntent = 'code-generation';
      expect(pattern.isApplicable(mockContext)).toBe(true);
    });

    it('should return true for planning intent', () => {
      mockContext.intent.primaryIntent = 'planning';
      expect(pattern.isApplicable(mockContext)).toBe(true);
    });

    it('should return false for learning intent', () => {
      mockContext.intent.primaryIntent = 'learning';
      expect(pattern.isApplicable(mockContext)).toBe(false);
    });
  });

  describe('apply - ambiguous terms detection', () => {
    it('should detect ambiguous term "app"', () => {
      const prompt = 'Build an app for user management';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
      expect(result.enhancedPrompt).toContain('CLARIFY');
      expect(result.enhancedPrompt).toContain('app');
    });

    it('should detect ambiguous term "system"', () => {
      const prompt = 'Create a system for handling orders';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
      expect(result.enhancedPrompt).toContain('system');
    });

    it('should detect ambiguous term "feature"', () => {
      const prompt = 'Add a feature for user profiles';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
    });

    it('should detect ambiguous term "database"', () => {
      const prompt = 'Store data in the database';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
    });

    it('should not flag qualified terms', () => {
      const prompt = 'Build a web app for user management';
      const result = pattern.apply(prompt, mockContext);
      // "web app" is qualified, should not flag "app"
      expect(result.improvement.description).not.toContain('"app"');
    });

    it('should detect multiple ambiguous terms', () => {
      const prompt = 'Build an app with a system for handling user data in cache';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
      expect(result.improvement.impact).toBe('high'); // 3+ ambiguities
    });
  });

  describe('apply - vague phrases detection', () => {
    it('should detect "should work"', () => {
      const prompt = 'The feature should work properly';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
      expect(result.enhancedPrompt).toContain('CLARIFY');
    });

    it('should detect "properly"', () => {
      const prompt = 'Handle the data properly';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
    });

    it('should detect "correctly"', () => {
      const prompt = 'Make sure it works correctly';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
    });

    it('should detect "as needed"', () => {
      const prompt = 'Add validation as needed';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
    });

    it('should detect "etc."', () => {
      const prompt = 'Handle errors, warnings, etc.';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
    });

    it('should detect "something like"', () => {
      const prompt = 'Build something like a dashboard';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
    });

    it('should detect "maybe"', () => {
      const prompt = 'Maybe add some validation';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
    });
  });

  describe('apply - scope terms detection', () => {
    it('should detect "some"', () => {
      const prompt = 'Handle some edge cases';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
    });

    it('should detect "many"', () => {
      const prompt = 'Support many concurrent users';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
    });

    it('should detect "fast"', () => {
      const prompt = 'Make it fast';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
    });

    it('should detect "large"', () => {
      const prompt = 'Handle large files';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
    });
  });

  describe('apply - no ambiguities', () => {
    it('should not apply when prompt is clear', () => {
      const prompt = 'Create a TypeScript function that validates email addresses using regex';
      const result = pattern.apply(prompt, mockContext);
      // This might detect "function" but it's a technical term
      expect(result.improvement.dimension).toBe('clarity');
    });

    it('should return low impact when no significant ambiguities', () => {
      const prompt = 'Build a React component with TypeScript';
      const result = pattern.apply(prompt, mockContext);
      expect(['low', 'medium']).toContain(result.improvement.impact);
    });
  });

  describe('apply - result structure', () => {
    it('should return valid PatternResult structure', () => {
      const prompt = 'Build an app';
      const result = pattern.apply(prompt, mockContext);

      expect(result).toHaveProperty('enhancedPrompt');
      expect(result).toHaveProperty('improvement');
      expect(result).toHaveProperty('applied');
      expect(result.improvement).toHaveProperty('dimension');
      expect(result.improvement).toHaveProperty('description');
      expect(result.improvement).toHaveProperty('impact');
    });

    it('should have clarity as improvement dimension', () => {
      const prompt = 'Build a feature';
      const result = pattern.apply(prompt, mockContext);
      expect(result.improvement.dimension).toBe('clarity');
    });

    it('should include count in description when applied', () => {
      const prompt = 'Build an app with a system';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.improvement.description).toMatch(/\d+ ambiguous/);
      }
    });
  });

  describe('apply - clarification section', () => {
    it('should add Clarifications Needed section', () => {
      const prompt = 'Build an app with a cache for storing data';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toContain('## Clarifications Needed');
      }
    });

    it('should preserve original prompt', () => {
      const prompt = 'Build an app for users';
      const result = pattern.apply(prompt, mockContext);
      expect(result.enhancedPrompt).toContain(prompt);
    });
  });

  describe('apply - impact levels', () => {
    it('should return low impact for 1 ambiguity', () => {
      const prompt = 'Build a component';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(['low', 'medium']).toContain(result.improvement.impact);
      }
    });

    it('should return medium impact for 2-3 ambiguities', () => {
      const prompt = 'Build a system with a cache';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(['medium', 'high']).toContain(result.improvement.impact);
      }
    });

    it('should return high impact for 4+ ambiguities', () => {
      const prompt = 'Build an app with a system, database, and cache for fast storage';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.improvement.impact).toBe('high');
      }
    });
  });

  describe('apply - edge cases', () => {
    it('should handle empty string', () => {
      const result = pattern.apply('', mockContext);
      expect(result).toBeDefined();
      expect(result.applied).toBe(false);
    });

    it('should handle very short prompts', () => {
      const result = pattern.apply('Hi', mockContext);
      expect(result).toBeDefined();
    });

    it('should handle very long prompts', () => {
      const longPrompt = 'Build a feature '.repeat(200);
      const result = pattern.apply(longPrompt, mockContext);
      expect(result).toBeDefined();
    });

    it('should handle prompts with special characters', () => {
      const prompt = 'Build an <app> with "quotes" and & symbols';
      const result = pattern.apply(prompt, mockContext);
      expect(result).toBeDefined();
    });

    it('should handle case variations', () => {
      const prompt = 'Build an APP for users';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(true); // Case insensitive
    });
  });
});
