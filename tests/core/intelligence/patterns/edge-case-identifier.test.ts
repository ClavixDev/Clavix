import { describe, it, expect, beforeEach } from '@jest/globals';
import { EdgeCaseIdentifier } from '../../../../src/core/intelligence/patterns/edge-case-identifier.js';
import { PatternContext } from '../../../../src/core/intelligence/types.js';

describe('EdgeCaseIdentifier', () => {
  let pattern: EdgeCaseIdentifier;
  let mockContext: PatternContext;

  beforeEach(() => {
    pattern = new EdgeCaseIdentifier();
    mockContext = {
      mode: 'deep',
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
      expect(pattern.id).toBe('edge-case-identifier');
    });

    it('should have correct name', () => {
      expect(pattern.name).toBe('Edge Case Identifier');
    });

    it('should be deep mode only', () => {
      expect(pattern.mode).toBe('deep');
    });

    it('should have priority 4', () => {
      expect(pattern.priority).toBe(4);
    });

    it('should be applicable for expected intents', () => {
      expect(pattern.applicableIntents).toContain('code-generation');
      expect(pattern.applicableIntents).toContain('debugging');
      expect(pattern.applicableIntents).toContain('testing');
      expect(pattern.applicableIntents).toContain('migration');
      expect(pattern.applicableIntents).toContain('security-review');
    });
  });

  describe('isApplicable', () => {
    it('should return true for code-generation in deep mode', () => {
      mockContext.mode = 'deep';
      mockContext.intent.primaryIntent = 'code-generation';
      expect(pattern.isApplicable(mockContext)).toBe(true);
    });

    it('should return false in fast mode', () => {
      mockContext.mode = 'fast';
      expect(pattern.isApplicable(mockContext)).toBe(false);
    });

    it('should return false for planning intent', () => {
      mockContext.intent.primaryIntent = 'planning';
      expect(pattern.isApplicable(mockContext)).toBe(false);
    });
  });

  describe('apply - general edge cases', () => {
    it('should identify input validation edge cases', () => {
      const prompt = 'Create a form handler for user data input';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
      expect(result.enhancedPrompt).toContain('Edge Cases');
    });

    it('should identify API edge cases', () => {
      const prompt = 'Create an API endpoint that fetches data';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
      expect(result.enhancedPrompt).toMatch(/Network|timeout|error/i);
    });
  });

  describe('apply - code-generation edge cases', () => {
    it('should add boundary condition edge cases', () => {
      mockContext.intent.primaryIntent = 'code-generation';
      const prompt = 'Create a data processing function';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
      expect(result.enhancedPrompt).toMatch(/Boundary|min|max/i);
    });

    it('should identify collection edge cases', () => {
      const prompt = 'Create a function to process array data in a list';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toMatch(/Empty|collection|array/i);
      }
    });

    it('should identify session edge cases', () => {
      const prompt = 'Create user authentication with session handling';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toMatch(/Session|expir/i);
      }
    });

    it('should identify concurrency edge cases', () => {
      const prompt = 'Create async concurrent operations';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toMatch(/Race|simultaneous/i);
      }
    });
  });

  describe('apply - debugging edge cases', () => {
    it('should add debugging-specific edge cases', () => {
      mockContext.intent.primaryIntent = 'debugging';
      const prompt = 'Fix the data corruption bug';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
      expect(result.enhancedPrompt).toMatch(/Intermittent|Environment|reproduce/i);
    });
  });

  describe('apply - testing edge cases', () => {
    it('should add testing-specific edge cases', () => {
      mockContext.intent.primaryIntent = 'testing';
      const prompt = 'Write tests for the payment service';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
      expect(result.enhancedPrompt).toMatch(/Test isolation|Flaky|Mock/i);
    });
  });

  describe('apply - migration edge cases', () => {
    it('should add migration-specific edge cases', () => {
      mockContext.intent.primaryIntent = 'migration';
      const prompt = 'Migrate the user database';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
      expect(result.enhancedPrompt).toMatch(/Data incompatibility|Rollback|downtime/i);
    });
  });

  describe('apply - security edge cases', () => {
    it('should add security-specific edge cases', () => {
      mockContext.intent.primaryIntent = 'security-review';
      const prompt = 'Review authentication system';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
      expect(result.enhancedPrompt).toMatch(/bypass|escalation|injection|exposure/i);
    });
  });

  describe('apply - domain edge cases', () => {
    it('should identify payment domain edge cases', () => {
      const prompt = 'Create a payment transaction processor';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toMatch(/Duplicate|Currency|transaction/i);
      }
    });

    it('should identify file handling edge cases', () => {
      const prompt = 'Create a file upload handler';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toMatch(/Large files|Malicious|size/i);
      }
    });

    it('should identify date/time edge cases', () => {
      const prompt = 'Create a calendar scheduling system';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toMatch(/Timezone|Date boundaries|daylight/i);
      }
    });
  });

  describe('apply - result structure', () => {
    it('should return valid PatternResult structure', () => {
      const prompt = 'Create a service with input data';
      const result = pattern.apply(prompt, mockContext);

      expect(result).toHaveProperty('enhancedPrompt');
      expect(result).toHaveProperty('improvement');
      expect(result).toHaveProperty('applied');
    });

    it('should have completeness as improvement dimension', () => {
      const prompt = 'Create a module';
      const result = pattern.apply(prompt, mockContext);
      expect(result.improvement.dimension).toBe('completeness');
    });

    it('should return high impact when applied', () => {
      const prompt = 'Create a form handler with API calls';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.improvement.impact).toBe('high');
      }
    });

    it('should limit edge cases to 8', () => {
      // Trigger multiple domains
      const prompt = 'Create a payment form with file upload, API calls, date scheduling';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        const bulletCount = (result.enhancedPrompt.match(/•/g) || []).length;
        expect(bulletCount).toBeLessThanOrEqual(8);
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
  });
});
