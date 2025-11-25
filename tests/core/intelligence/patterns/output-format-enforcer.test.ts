import { describe, it, expect, beforeEach } from '@jest/globals';
import { OutputFormatEnforcer } from '../../../../src/core/intelligence/patterns/output-format-enforcer.js';
import { PatternContext } from '../../../../src/core/intelligence/types.js';

describe('OutputFormatEnforcer', () => {
  let pattern: OutputFormatEnforcer;
  let mockContext: PatternContext;

  beforeEach(() => {
    pattern = new OutputFormatEnforcer();
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
      expect(pattern.id).toBe('output-format-enforcer');
    });

    it('should have correct name', () => {
      expect(pattern.name).toBe('Output Format Enforcer');
    });

    it('should have correct description', () => {
      expect(pattern.description).toBe(
        'Adds explicit output format specifications for agent clarity'
      );
    });

    it('should support both fast and deep modes', () => {
      expect(pattern.mode).toBe('both');
    });

    it('should have priority 7', () => {
      expect(pattern.priority).toBe(7);
    });

    it('should be applicable for expected intents', () => {
      expect(pattern.applicableIntents).toContain('code-generation');
      expect(pattern.applicableIntents).toContain('planning');
      expect(pattern.applicableIntents).toContain('documentation');
      expect(pattern.applicableIntents).toContain('prd-generation');
      expect(pattern.applicableIntents).toContain('testing');
    });

    it('should not be applicable for debugging intent', () => {
      expect(pattern.applicableIntents).not.toContain('debugging');
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

    it('should return true for testing intent', () => {
      mockContext.intent.primaryIntent = 'testing';
      expect(pattern.isApplicable(mockContext)).toBe(true);
    });

    it('should return false for debugging intent', () => {
      mockContext.intent.primaryIntent = 'debugging';
      expect(pattern.isApplicable(mockContext)).toBe(false);
    });

    it('should return false for refinement intent', () => {
      mockContext.intent.primaryIntent = 'refinement';
      expect(pattern.isApplicable(mockContext)).toBe(false);
    });
  });

  describe('apply - format already specified', () => {
    it('should not modify prompt with "output format" mentioned', () => {
      const prompt = 'Build a component with JSON output format';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(false);
      expect(result.enhancedPrompt).toBe(prompt);
    });

    it('should not modify prompt with "as json"', () => {
      const prompt = 'Return the data as json';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(false);
    });

    it('should not modify prompt with "as markdown"', () => {
      const prompt = 'Generate documentation as markdown';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(false);
    });

    it('should not modify prompt with "typescript"', () => {
      const prompt = 'Create a typescript function';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(false);
    });

    it('should not modify prompt with "react component"', () => {
      const prompt = 'Build a react component for user profile';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(false);
    });

    it('should not modify prompt with "should return"', () => {
      const prompt = 'This function should return an array';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(false);
    });

    it('should not modify prompt with "code block"', () => {
      const prompt = 'Show the solution in a code block';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(false);
    });
  });

  describe('apply - adds format section', () => {
    it('should add output format section when missing', () => {
      const prompt = 'Build a user registration form';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
      expect(result.enhancedPrompt).toContain('## Expected Output Format');
    });

    it('should add format suggestions for code-generation', () => {
      mockContext.intent.primaryIntent = 'code-generation';
      const prompt = 'Create a function to validate emails';
      const result = pattern.apply(prompt, mockContext);
      expect(result.enhancedPrompt).toContain('TypeScript/JavaScript');
    });

    it('should add format suggestions for planning', () => {
      mockContext.intent.primaryIntent = 'planning';
      const prompt = 'Plan the implementation of user authentication';
      const result = pattern.apply(prompt, mockContext);
      expect(result.enhancedPrompt).toContain('Markdown task list');
    });

    it('should add format suggestions for documentation', () => {
      mockContext.intent.primaryIntent = 'documentation';
      const prompt = 'Document the API endpoints';
      const result = pattern.apply(prompt, mockContext);
      expect(result.enhancedPrompt).toContain('JSDoc');
    });

    it('should add format suggestions for testing', () => {
      mockContext.intent.primaryIntent = 'testing';
      const prompt = 'Write tests for the user service';
      const result = pattern.apply(prompt, mockContext);
      expect(result.enhancedPrompt).toContain('Jest');
    });

    it('should add format suggestions for prd-generation', () => {
      mockContext.intent.primaryIntent = 'prd-generation';
      const prompt = 'Create a PRD for the new feature';
      const result = pattern.apply(prompt, mockContext);
      expect(result.enhancedPrompt).toContain('PRD document');
    });
  });

  describe('apply - result structure', () => {
    it('should return valid PatternResult structure', () => {
      const result = pattern.apply('Build a feature', mockContext);

      expect(result).toHaveProperty('enhancedPrompt');
      expect(result).toHaveProperty('improvement');
      expect(result).toHaveProperty('applied');
      expect(result.improvement).toHaveProperty('dimension');
      expect(result.improvement).toHaveProperty('description');
      expect(result.improvement).toHaveProperty('impact');
    });

    it('should have actionability as improvement dimension', () => {
      const result = pattern.apply('Build a feature', mockContext);
      expect(result.improvement.dimension).toBe('actionability');
    });

    it('should return medium impact when format is added', () => {
      const result = pattern.apply('Build a feature', mockContext);
      if (result.applied) {
        expect(result.improvement.impact).toBe('medium');
      }
    });

    it('should return low impact when format already exists', () => {
      const result = pattern.apply('Build a typescript function', mockContext);
      expect(result.improvement.impact).toBe('low');
    });
  });

  describe('apply - content preservation', () => {
    it('should preserve original prompt before format section', () => {
      const prompt = 'Build a user registration form with email validation';
      const result = pattern.apply(prompt, mockContext);
      expect(result.enhancedPrompt).toContain(prompt);
    });

    it('should add format section after original content', () => {
      const prompt = 'Create a dashboard component';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        const promptIndex = result.enhancedPrompt.indexOf(prompt);
        const formatIndex = result.enhancedPrompt.indexOf('## Expected Output Format');
        expect(promptIndex).toBeLessThan(formatIndex);
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

    it('should handle very long prompts', () => {
      const longPrompt = 'Build a feature that '.repeat(200);
      const result = pattern.apply(longPrompt, mockContext);
      expect(result).toBeDefined();
    });

    it('should handle prompts with special characters', () => {
      const prompt = 'Build a <component> with "quotes" and & symbols';
      const result = pattern.apply(prompt, mockContext);
      expect(result).toBeDefined();
    });

    it('should handle newlines in prompt', () => {
      const prompt = 'Build a feature\nwith multiple lines\nof requirements';
      const result = pattern.apply(prompt, mockContext);
      expect(result).toBeDefined();
    });

    it('should handle case variations', () => {
      const prompt = 'OUTPUT FORMAT: json';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(false); // Already has format
    });
  });

  describe('apply - intent fallback', () => {
    it('should fallback to code-generation suggestions for unknown intent', () => {
      mockContext.intent.primaryIntent = 'learning';
      const prompt = 'Build something';
      const result = pattern.apply(prompt, mockContext);
      // Should still have suggestions (either learning-specific or fallback)
      expect(result.enhancedPrompt).toContain('## Expected Output Format');
    });
  });
});
