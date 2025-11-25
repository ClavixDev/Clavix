import { describe, it, expect, beforeEach } from '@jest/globals';
import { UserPersonaEnricher } from '../../../../src/core/intelligence/patterns/user-persona-enricher.js';
import { PatternContext } from '../../../../src/core/intelligence/types.js';

describe('UserPersonaEnricher', () => {
  let pattern: UserPersonaEnricher;
  let mockContext: PatternContext;

  beforeEach(() => {
    pattern = new UserPersonaEnricher();
    mockContext = {
      mode: 'deep',
      originalPrompt: 'Test prompt',
      intent: {
        primaryIntent: 'prd-generation',
        confidence: 90,
        characteristics: {
          hasCodeContext: false,
          hasTechnicalTerms: true,
          isOpenEnded: false,
          needsStructure: true,
        },
      },
    };
  });

  describe('pattern properties', () => {
    it('should have correct id', () => {
      expect(pattern.id).toBe('user-persona-enricher');
    });

    it('should have correct name', () => {
      expect(pattern.name).toBe('User Persona Enricher');
    });

    it('should have correct description', () => {
      expect(pattern.description).toBe('Adds missing user context and personas');
    });

    it('should be deep mode only', () => {
      expect(pattern.mode).toBe('deep');
    });

    it('should have priority 6', () => {
      expect(pattern.priority).toBe(6);
    });

    it('should be applicable for prd-generation intent', () => {
      expect(pattern.applicableIntents).toContain('prd-generation');
    });

    it('should be applicable for planning intent', () => {
      expect(pattern.applicableIntents).toContain('planning');
    });
  });

  describe('isApplicable', () => {
    it('should return true for prd-generation intent in deep mode', () => {
      mockContext.intent.primaryIntent = 'prd-generation';
      mockContext.mode = 'deep';
      expect(pattern.isApplicable(mockContext)).toBe(true);
    });

    it('should return true for planning intent in deep mode', () => {
      mockContext.intent.primaryIntent = 'planning';
      mockContext.mode = 'deep';
      expect(pattern.isApplicable(mockContext)).toBe(true);
    });

    it('should return false for code-generation intent', () => {
      mockContext.intent.primaryIntent = 'code-generation';
      expect(pattern.isApplicable(mockContext)).toBe(false);
    });

    it('should return false in fast mode', () => {
      mockContext.mode = 'fast';
      mockContext.intent.primaryIntent = 'prd-generation';
      expect(pattern.isApplicable(mockContext)).toBe(false);
    });
  });

  describe('apply - user context already exists', () => {
    it('should not modify prompt with "user persona"', () => {
      const prompt = 'Feature: Dashboard\nUser persona: Admin users';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(false);
    });

    it('should not modify prompt with "target user"', () => {
      const prompt = 'Target user: Developers';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(false);
    });

    it('should not modify prompt with "end user"', () => {
      const prompt = 'End user experience should be seamless';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(false);
    });

    it('should not modify prompt with "audience"', () => {
      const prompt = 'Audience: Small business owners';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(false);
    });

    it('should not modify prompt with "stakeholder"', () => {
      const prompt = 'Stakeholder requirements: Marketing team';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(false);
    });

    it('should not modify prompt with "customer"', () => {
      const prompt = 'Customer journey: From signup to purchase';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(false);
    });

    it('should not modify prompt with "as a user"', () => {
      const prompt = 'As a user, I want to login quickly';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(false);
    });
  });

  describe('apply - content does not need user context', () => {
    it('should not apply to non-feature content', () => {
      const prompt = 'Hello world';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(false);
    });

    it('should return low impact when content does not need persona', () => {
      const prompt = 'Just some random text';
      const result = pattern.apply(prompt, mockContext);
      expect(result.improvement.impact).toBe('low');
    });
  });

  describe('apply - adds user persona', () => {
    it('should add user persona section for feature content', () => {
      const prompt = 'Build a dashboard feature';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
      expect(result.enhancedPrompt).toContain('Target Users');
    });

    it('should add primary user field', () => {
      const prompt = 'Create an authentication feature';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toContain('Primary User');
      }
    });

    it('should add goals placeholder', () => {
      const prompt = 'Implement shopping cart functionality';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toContain('Goals');
      }
    });

    it('should add pain points placeholder', () => {
      const prompt = 'Build notification system feature';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toContain('Pain Points');
      }
    });

    it('should add context placeholder', () => {
      const prompt = 'Create search functionality';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toContain('Context');
      }
    });
  });

  describe('apply - user type inference', () => {
    it('should infer developers for API content', () => {
      const prompt = 'Build an API for user management';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toContain('Developer');
      }
    });

    it('should infer developers for SDK content', () => {
      const prompt = 'Create an SDK for the payment feature';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toContain('Developer');
      }
    });

    it('should infer administrators for admin content', () => {
      const prompt = 'Build an admin dashboard feature';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toContain('Admin');
      }
    });

    it('should infer administrators for manage content', () => {
      const prompt = 'Feature to manage user permissions';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toContain('Admin');
      }
    });

    it('should infer customers for e-commerce content', () => {
      const prompt = 'Build an e-commerce checkout feature';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toContain('Customer');
      }
    });

    it('should infer content creators for CMS content', () => {
      const prompt = 'Build a CMS for blog content';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toContain('Content');
      }
    });

    it('should infer mobile users for mobile app content', () => {
      const prompt = 'Build a mobile app feature';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toContain('Mobile');
      }
    });

    it('should add placeholder for unknown user type', () => {
      const prompt = 'Build a generic feature';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toContain('Primary User');
      }
    });
  });

  describe('apply - result structure', () => {
    it('should return valid PatternResult structure', () => {
      const prompt = 'Build a feature';
      const result = pattern.apply(prompt, mockContext);

      expect(result).toHaveProperty('enhancedPrompt');
      expect(result).toHaveProperty('improvement');
      expect(result).toHaveProperty('applied');
      expect(result.improvement).toHaveProperty('dimension');
      expect(result.improvement).toHaveProperty('description');
      expect(result.improvement).toHaveProperty('impact');
    });

    it('should have completeness as improvement dimension', () => {
      const prompt = 'Build a feature';
      const result = pattern.apply(prompt, mockContext);
      expect(result.improvement.dimension).toBe('completeness');
    });

    it('should return medium impact when user persona is added', () => {
      const prompt = 'Build a new feature';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.improvement.impact).toBe('medium');
      }
    });
  });

  describe('apply - content preservation', () => {
    it('should preserve original prompt content', () => {
      const prompt = 'Build user authentication feature with signup';
      const result = pattern.apply(prompt, mockContext);
      expect(result.enhancedPrompt).toContain(prompt);
    });

    it('should add persona section after original content', () => {
      const prompt = 'Create a dashboard feature';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        const promptIndex = result.enhancedPrompt.indexOf(prompt);
        const personaIndex = result.enhancedPrompt.indexOf('### Target Users');
        expect(promptIndex).toBeLessThan(personaIndex);
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
      const prompt = 'Feature: Build a <component> with "quotes" & symbols';
      const result = pattern.apply(prompt, mockContext);
      expect(result).toBeDefined();
    });

    it('should handle newlines in prompt', () => {
      const prompt = 'Feature 1: Login\nFeature 2: Dashboard';
      const result = pattern.apply(prompt, mockContext);
      expect(result).toBeDefined();
    });

    it('should handle case variations', () => {
      const prompt = 'TARGET USER: developers';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(false); // Already has user context
    });
  });
});
