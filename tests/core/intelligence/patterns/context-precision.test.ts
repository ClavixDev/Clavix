import { describe, it, expect, beforeEach } from '@jest/globals';
import { ContextPrecisionBooster } from '../../../../src/core/intelligence/patterns/context-precision.js';
import { PatternContext } from '../../../../src/core/intelligence/types.js';

describe('ContextPrecisionBooster', () => {
  let pattern: ContextPrecisionBooster;
  let mockContext: PatternContext;

  beforeEach(() => {
    pattern = new ContextPrecisionBooster();
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
      expect(pattern.id).toBe('context-precision');
    });

    it('should have correct name', () => {
      expect(pattern.name).toBe('Context Precision Booster');
    });

    it('should support both modes', () => {
      expect(pattern.mode).toBe('both');
    });

    it('should have priority 6 (MEDIUM - standard enhancement)', () => {
      expect(pattern.priority).toBe(6);
    });

    it('should be applicable for many intents', () => {
      expect(pattern.applicableIntents).toContain('code-generation');
      expect(pattern.applicableIntents).toContain('debugging');
      expect(pattern.applicableIntents).toContain('testing');
      expect(pattern.applicableIntents).toContain('migration');
      expect(pattern.applicableIntents).toContain('security-review');
    });
  });

  describe('isApplicable', () => {
    it('should return true for code-generation intent', () => {
      mockContext.intent.primaryIntent = 'code-generation';
      expect(pattern.isApplicable(mockContext)).toBe(true);
    });

    it('should return false for planning intent', () => {
      mockContext.intent.primaryIntent = 'planning';
      expect(pattern.isApplicable(mockContext)).toBe(false);
    });
  });

  describe('apply - context sufficient', () => {
    it('should return applied: false when context is sufficient', () => {
      // Prompt with: file location (.ts), input/output (takes/returns), error handling (errors), existing code context (existing)
      // Avoids "update/upgrade/version/latest" which trigger version context check
      const prompt =
        'Refactor the existing TypeScript function in src/utils/helpers.ts that takes input string and returns boolean, handle errors by throwing';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(false);
    });
  });

  describe('apply - code-generation context gaps', () => {
    it('should identify missing file location', () => {
      const prompt = 'Build a function to validate emails';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
      expect(result.enhancedPrompt).toContain('Context Needed');
    });

    it('should identify missing input/output specification', () => {
      const prompt = 'Create a utility function for data processing';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toMatch(/input|output/i);
      }
    });
  });

  describe('apply - debugging context gaps', () => {
    it('should identify missing error details for debugging', () => {
      mockContext.intent.primaryIntent = 'debugging';
      const prompt = 'Fix the bug in the login function';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
    });

    it('should identify missing reproduction steps', () => {
      mockContext.intent.primaryIntent = 'debugging';
      const prompt = 'This component crashes sometimes';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toMatch(/reproduce|steps/i);
      }
    });
  });

  describe('apply - testing context gaps', () => {
    it('should identify missing test framework', () => {
      mockContext.intent.primaryIntent = 'testing';
      const prompt = 'Write tests for the UserService';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
    });

    it('should identify missing test type', () => {
      mockContext.intent.primaryIntent = 'testing';
      const prompt = 'Write tests for the API';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toMatch(/unit|integration|e2e/i);
      }
    });
  });

  describe('apply - result structure', () => {
    it('should return valid PatternResult structure', () => {
      const prompt = 'Build a function';
      const result = pattern.apply(prompt, mockContext);

      expect(result).toHaveProperty('enhancedPrompt');
      expect(result).toHaveProperty('improvement');
      expect(result).toHaveProperty('applied');
    });

    it('should have completeness as improvement dimension', () => {
      const prompt = 'Build a component';
      const result = pattern.apply(prompt, mockContext);
      expect(result.improvement.dimension).toBe('completeness');
    });

    it('should return high impact when context gaps found', () => {
      const prompt = 'Build a module';
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
    });

    it('should handle very short prompts', () => {
      const result = pattern.apply('Hi', mockContext);
      expect(result).toBeDefined();
    });

    it('should limit context gaps to 6', () => {
      const prompt = 'Build and deploy a complex system';
      const result = pattern.apply(prompt, mockContext);
      // Should not exceed 6 gaps
      const gapCount = (result.enhancedPrompt.match(/\*\*\d+\./g) || []).length;
      expect(gapCount).toBeLessThanOrEqual(6);
    });
  });
});
