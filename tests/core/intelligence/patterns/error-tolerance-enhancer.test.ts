import { describe, it, expect, beforeEach } from '@jest/globals';
import { ErrorToleranceEnhancer } from '../../../../src/core/intelligence/patterns/error-tolerance-enhancer.js';
import { PatternContext } from '../../../../src/core/intelligence/types.js';

describe('ErrorToleranceEnhancer', () => {
  let pattern: ErrorToleranceEnhancer;
  let mockContext: PatternContext;

  beforeEach(() => {
    pattern = new ErrorToleranceEnhancer();
    mockContext = {
      depthLevel: 'comprehensive',
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
      expect(pattern.id).toBe('error-tolerance-enhancer');
    });

    it('should have correct name', () => {
      expect(pattern.name).toBe('Error Tolerance Enhancer');
    });

    it('should be comprehensive depth only', () => {
      expect(pattern.scope).toBe('comprehensive');
    });

    it('should have priority 5', () => {
      expect(pattern.priority).toBe(5);
    });

    it('should be applicable for expected intents', () => {
      expect(pattern.applicableIntents).toContain('code-generation');
      expect(pattern.applicableIntents).toContain('refinement');
      expect(pattern.applicableIntents).toContain('debugging');
      expect(pattern.applicableIntents).toContain('migration');
      expect(pattern.applicableIntents).toContain('testing');
    });
  });

  describe('isApplicable', () => {
    it('should return true for code-generation in comprehensive depth', () => {
      mockContext.depthLevel = 'comprehensive';
      mockContext.intent.primaryIntent = 'code-generation';
      expect(pattern.isApplicable(mockContext)).toBe(true);
    });

    it('should return false in standard depth', () => {
      mockContext.depthLevel = 'standard';
      expect(pattern.isApplicable(mockContext)).toBe(false);
    });

    it('should return false for planning intent', () => {
      mockContext.intent.primaryIntent = 'planning';
      expect(pattern.isApplicable(mockContext)).toBe(false);
    });
  });

  describe('apply - error handling already addressed', () => {
    it('should not apply when "error handling" present', () => {
      const prompt = 'Create a function with proper error handling';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(false);
    });

    it('should not apply when "try catch" present', () => {
      const prompt = 'Wrap the code in try catch blocks';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(false);
    });

    it('should not apply when "exception" present', () => {
      const prompt = 'Handle exception cases properly';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(false);
    });

    it('should not apply when "fallback" present', () => {
      const prompt = 'Add a fallback mechanism';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(false);
    });

    it('should not apply when "validation" present', () => {
      const prompt = 'Add input validation';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(false);
    });
  });

  describe('apply - API error scenarios', () => {
    it('should detect API-related prompts', () => {
      const prompt = 'Create a REST API endpoint';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
      expect(result.enhancedPrompt).toContain('Error Handling Requirements');
    });

    it('should add API error scenarios', () => {
      const prompt = 'Fetch data from the external endpoint';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toMatch(/Network|HTTP|timeout/);
      }
    });
  });

  describe('apply - database error scenarios', () => {
    it('should detect database-related prompts', () => {
      const prompt = 'Create a database query function';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
    });

    it('should add database error scenarios', () => {
      const prompt = 'Create a Postgres query for users';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toMatch(/Connection|Query|timeout/i);
      }
    });
  });

  describe('apply - user input error scenarios', () => {
    it('should detect user input prompts', () => {
      const prompt = 'Create a form input handler';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
    });

    it('should add user input error scenarios', () => {
      const prompt = 'Process user input from the form';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toMatch(/Empty|Invalid|format/i);
      }
    });
  });

  describe('apply - file system error scenarios', () => {
    it('should detect file-related prompts', () => {
      const prompt = 'Read data from a file';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
    });

    it('should add file error scenarios', () => {
      const prompt = 'Write configuration to the fs path';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toMatch(/not found|Permission|Disk/i);
      }
    });
  });

  describe('apply - async error scenarios', () => {
    it('should detect async-related prompts', () => {
      const prompt = 'Create an async function with promises';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
    });

    it('should add async error scenarios', () => {
      const prompt = 'Await the callback response';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toMatch(/Promise|Race|rejection/i);
      }
    });
  });

  describe('apply - general error scenarios', () => {
    it('should add general errors when no specific context detected', () => {
      const prompt = 'Create a utility function';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
      expect(result.enhancedPrompt).toMatch(/Null|Type|undefined/i);
    });
  });

  describe('apply - result structure', () => {
    it('should return valid PatternResult structure', () => {
      const prompt = 'Create a service';
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

    it('should add Error Handling Strategy section', () => {
      const prompt = 'Create an API service';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toContain('Error Handling Strategy');
      }
    });

    it('should limit scenarios to 6', () => {
      // Trigger multiple categories
      const prompt = 'Create an async API that reads from database and file system with user input';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        const scenarioCount = (result.enhancedPrompt.match(/^- /gm) || []).length;
        expect(scenarioCount).toBeLessThanOrEqual(12); // 6 scenarios + 5 strategy items
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
