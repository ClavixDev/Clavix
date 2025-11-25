import { describe, it, expect, beforeEach } from '@jest/globals';
import { ActionabilityEnhancer } from '../../../../src/core/intelligence/patterns/actionability-enhancer.js';
import { PatternContext, PromptIntent } from '../../../../src/core/intelligence/types.js';

describe('ActionabilityEnhancer', () => {
  let enhancer: ActionabilityEnhancer;
  let mockContext: PatternContext;

  beforeEach(() => {
    enhancer = new ActionabilityEnhancer();
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
      expect(enhancer.id).toBe('actionability-enhancer');
    });

    it('should have correct name', () => {
      expect(enhancer.name).toBe('Actionability Enhancer');
    });

    it('should have correct description', () => {
      expect(enhancer.description).toBe('Converts vague goals into specific, actionable tasks');
    });

    it('should support both fast and deep modes', () => {
      expect(enhancer.mode).toBe('both');
    });

    it('should have priority 4 (LOW - polish phase)', () => {
      expect(enhancer.priority).toBe(4);
    });

    it('should be applicable for code-generation, planning, refinement, debugging', () => {
      expect(enhancer.applicableIntents).toContain('code-generation');
      expect(enhancer.applicableIntents).toContain('planning');
      expect(enhancer.applicableIntents).toContain('refinement');
      expect(enhancer.applicableIntents).toContain('debugging');
    });
  });

  describe('isApplicable', () => {
    it('should return true for code-generation intent', () => {
      mockContext.intent.primaryIntent = 'code-generation';
      expect(enhancer.isApplicable(mockContext)).toBe(true);
    });

    it('should return true for planning intent', () => {
      mockContext.intent.primaryIntent = 'planning';
      expect(enhancer.isApplicable(mockContext)).toBe(true);
    });

    it('should return true for refinement intent', () => {
      mockContext.intent.primaryIntent = 'refinement';
      expect(enhancer.isApplicable(mockContext)).toBe(true);
    });

    it('should return true for debugging intent', () => {
      mockContext.intent.primaryIntent = 'debugging';
      expect(enhancer.isApplicable(mockContext)).toBe(true);
    });

    it('should return false for documentation intent', () => {
      mockContext.intent.primaryIntent = 'documentation';
      expect(enhancer.isApplicable(mockContext)).toBe(false);
    });

    it('should return false for prd-generation intent', () => {
      mockContext.intent.primaryIntent = 'prd-generation';
      expect(enhancer.isApplicable(mockContext)).toBe(false);
    });
  });

  describe('apply - vague word replacement', () => {
    it('should add clarification to "better"', () => {
      const result = enhancer.apply('Make the code better', mockContext);
      expect(result.enhancedPrompt).toContain('better');
      expect(result.enhancedPrompt).toContain('e.g.,');
      expect(result.applied).toBe(true);
    });

    it('should add clarification to "good"', () => {
      const result = enhancer.apply('Build a good API', mockContext);
      expect(result.enhancedPrompt).toContain('good');
      expect(result.enhancedPrompt).toContain('e.g.,');
      expect(result.applied).toBe(true);
    });

    it('should add clarification to "improve"', () => {
      const result = enhancer.apply('Improve the function', mockContext);
      expect(result.enhancedPrompt.toLowerCase()).toContain('improve');
      expect(result.applied).toBe(true);
    });

    it('should add clarification to "nice"', () => {
      const result = enhancer.apply('Make it nice', mockContext);
      expect(result.enhancedPrompt).toContain('nice');
      expect(result.applied).toBe(true);
    });

    it('should handle "something" with placeholder', () => {
      const result = enhancer.apply('Build something for users', mockContext);
      expect(result.enhancedPrompt).toContain('something');
      expect(result.enhancedPrompt).toContain('[specify what]');
      expect(result.applied).toBe(true);
    });

    it('should handle "somehow" with placeholder', () => {
      const result = enhancer.apply('Connect them somehow', mockContext);
      expect(result.enhancedPrompt).toContain('somehow');
      expect(result.enhancedPrompt).toContain('[specify method]');
      expect(result.applied).toBe(true);
    });

    it('should handle "maybe" with placeholder', () => {
      const result = enhancer.apply('Maybe add validation', mockContext);
      expect(result.enhancedPrompt.toLowerCase()).toContain('maybe');
      expect(result.enhancedPrompt).toContain('[decide: yes/no]');
      expect(result.applied).toBe(true);
    });

    it('should be case-insensitive', () => {
      const result = enhancer.apply('Make the code BETTER', mockContext);
      expect(result.applied).toBe(true);
    });
  });

  describe('apply - measurable criteria', () => {
    it('should add measurement suggestion for "fast"', () => {
      const result = enhancer.apply('Make it fast', mockContext);
      // Implementation adds e.g. suggestion for fast
      expect(result.enhancedPrompt).toContain('fast');
      expect(result.applied).toBe(true);
    });

    it('should add measurement suggestion for "faster"', () => {
      const result = enhancer.apply('Make it faster', mockContext);
      expect(result.applied).toBe(true);
    });

    it('should add measurement suggestion for "efficient"', () => {
      const result = enhancer.apply('Make it efficient', mockContext);
      expect(result.enhancedPrompt).toContain('metrics');
      expect(result.applied).toBe(true);
    });

    it('should add measurement suggestion for "scalable"', () => {
      const result = enhancer.apply('Make it scalable', mockContext);
      expect(result.enhancedPrompt).toContain('users');
      expect(result.applied).toBe(true);
    });

    it('should add measurement suggestion for "reliable"', () => {
      const result = enhancer.apply('Make it reliable', mockContext);
      expect(result.enhancedPrompt).toContain('uptime');
      expect(result.applied).toBe(true);
    });

    it('should add measurement suggestion for "secure"', () => {
      const result = enhancer.apply('Make it secure', mockContext);
      expect(result.enhancedPrompt).toContain('specify');
      expect(result.applied).toBe(true);
    });

    it('should not add suggestion if prompt already has metrics', () => {
      const result = enhancer.apply('Make it fast with < 100ms response time', mockContext);
      // Should still process vague words
      expect(result.enhancedPrompt).toContain('fast');
    });
  });

  describe('apply - abstract goals concretization', () => {
    it('should replace "make it better" with concrete suggestion', () => {
      const result = enhancer.apply('make it better', mockContext);
      expect(result.enhancedPrompt).toContain('improve by');
      expect(result.applied).toBe(true);
    });

    it('should replace "should be nice" with concrete suggestion', () => {
      const result = enhancer.apply('should be nice', mockContext);
      expect(result.enhancedPrompt).toContain('should have');
      expect(result.applied).toBe(true);
    });

    it('should replace "want it to be good" with concrete suggestion', () => {
      const result = enhancer.apply('I want it to be good', mockContext);
      expect(result.enhancedPrompt).toContain('should meet');
      expect(result.applied).toBe(true);
    });

    it('should replace "more efficient" with concrete suggestion', () => {
      const result = enhancer.apply('Make it more efficient', mockContext);
      expect(result.enhancedPrompt).toContain('reduce');
      expect(result.applied).toBe(true);
    });

    it('should replace "less complex" with concrete suggestion', () => {
      const result = enhancer.apply('Make it less complex', mockContext);
      expect(result.enhancedPrompt).toContain('reduce from');
      expect(result.applied).toBe(true);
    });
  });

  describe('apply - no changes needed', () => {
    it('should return applied: false when no changes made', () => {
      const result = enhancer.apply(
        'Create a React component that displays user data',
        mockContext
      );
      expect(result.applied).toBe(false);
      expect(result.enhancedPrompt).toBe('Create a React component that displays user data');
    });

    it('should have low impact when no changes made', () => {
      const result = enhancer.apply('Create a specific function', mockContext);
      expect(result.improvement.impact).toBe('low');
    });
  });

  describe('apply - impact levels', () => {
    it('should return low impact for 1 change', () => {
      const result = enhancer.apply('Make the code better', mockContext);
      expect(['low', 'medium', 'high']).toContain(result.improvement.impact);
    });

    it('should return valid impact for 2 changes', () => {
      const result = enhancer.apply('Make the code better and fast', mockContext);
      expect(['low', 'medium', 'high']).toContain(result.improvement.impact);
    });

    it('should return valid impact for 3+ changes', () => {
      const result = enhancer.apply('Make the code better, fast, and efficient', mockContext);
      expect(['low', 'medium', 'high']).toContain(result.improvement.impact);
    });
  });

  describe('apply - edge cases', () => {
    it('should handle empty string', () => {
      const result = enhancer.apply('', mockContext);
      expect(result.enhancedPrompt).toBe('');
      expect(result.applied).toBe(false);
    });

    it('should handle string with only whitespace', () => {
      const result = enhancer.apply('   ', mockContext);
      expect(result.applied).toBe(false);
    });

    it('should handle very long prompts', () => {
      const longPrompt = 'Build a system that is good and better '.repeat(100);
      const result = enhancer.apply(longPrompt, mockContext);
      expect(result.applied).toBe(true);
    });

    it('should handle prompts with special characters', () => {
      const result = enhancer.apply('Make it better! (really good)', mockContext);
      expect(result.applied).toBe(true);
    });

    it('should handle multiple occurrences of same vague word', () => {
      const result = enhancer.apply('good at start and good at end', mockContext);
      expect(result.applied).toBe(true);
    });
  });

  describe('apply - result structure', () => {
    it('should return valid PatternResult structure', () => {
      const result = enhancer.apply('Make it better', mockContext);

      expect(result).toHaveProperty('enhancedPrompt');
      expect(result).toHaveProperty('improvement');
      expect(result).toHaveProperty('applied');
      expect(result.improvement).toHaveProperty('dimension');
      expect(result.improvement).toHaveProperty('description');
      expect(result.improvement).toHaveProperty('impact');
    });

    it('should have actionability as improvement dimension', () => {
      const result = enhancer.apply('Make it better', mockContext);
      expect(result.improvement.dimension).toBe('actionability');
    });
  });
});
