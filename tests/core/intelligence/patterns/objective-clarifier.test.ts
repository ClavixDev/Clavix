import { describe, it, expect, beforeEach } from '@jest/globals';
import { ObjectiveClarifier } from '../../../../src/core/intelligence/patterns/objective-clarifier.js';
import { PatternContext, PromptIntent } from '../../../../src/core/intelligence/types.js';

describe('ObjectiveClarifier', () => {
  let clarifier: ObjectiveClarifier;
  let mockContext: PatternContext;

  beforeEach(() => {
    clarifier = new ObjectiveClarifier();
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
      expect(clarifier.id).toBe('objective-clarifier');
    });

    it('should have correct name', () => {
      expect(clarifier.name).toBe('Objective Clarifier');
    });

    it('should have correct description', () => {
      expect(clarifier.description).toBe('Extracts or infers clear goal statement');
    });

    it('should support both fast and deep modes', () => {
      expect(clarifier.mode).toBe('both');
    });

    it('should have priority 9', () => {
      expect(clarifier.priority).toBe(9);
    });

    it('should be applicable for all main intents', () => {
      expect(clarifier.applicableIntents).toContain('code-generation');
      expect(clarifier.applicableIntents).toContain('planning');
      expect(clarifier.applicableIntents).toContain('refinement');
      expect(clarifier.applicableIntents).toContain('debugging');
      expect(clarifier.applicableIntents).toContain('documentation');
    });
  });

  describe('isApplicable', () => {
    it('should return true for code-generation intent', () => {
      mockContext.intent.primaryIntent = 'code-generation';
      expect(clarifier.isApplicable(mockContext)).toBe(true);
    });

    it('should return true for planning intent', () => {
      mockContext.intent.primaryIntent = 'planning';
      expect(clarifier.isApplicable(mockContext)).toBe(true);
    });

    it('should return true for documentation intent', () => {
      mockContext.intent.primaryIntent = 'documentation';
      expect(clarifier.isApplicable(mockContext)).toBe(true);
    });

    it('should return false for prd-generation intent', () => {
      mockContext.intent.primaryIntent = 'prd-generation';
      expect(clarifier.isApplicable(mockContext)).toBe(false);
    });
  });

  describe('apply - explicit objective detection', () => {
    it('should not modify prompt with "# Objective" header', () => {
      const prompt = '# Objective\nBuild a login component';
      const result = clarifier.apply(prompt, mockContext);
      expect(result.applied).toBe(false);
      expect(result.enhancedPrompt).toBe(prompt);
    });

    it('should not modify prompt with "## Objective" header', () => {
      const prompt = '## Objective\nBuild a login component';
      const result = clarifier.apply(prompt, mockContext);
      expect(result.applied).toBe(false);
    });

    it('should not modify prompt with "Objective:" prefix', () => {
      const prompt = 'Objective: Build a login component';
      const result = clarifier.apply(prompt, mockContext);
      expect(result.applied).toBe(false);
    });

    it('should not modify prompt with "Goal:" prefix', () => {
      const prompt = 'Goal: Build a login component';
      const result = clarifier.apply(prompt, mockContext);
      expect(result.applied).toBe(false);
    });

    it('should not modify prompt with "Purpose:" prefix', () => {
      const prompt = 'Purpose: Build a login component';
      const result = clarifier.apply(prompt, mockContext);
      expect(result.applied).toBe(false);
    });
  });

  describe('apply - objective extraction', () => {
    it('should extract objective from "I need to" statement', () => {
      const prompt = 'I need to build a user profile component';
      const result = clarifier.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
      expect(result.enhancedPrompt).toContain('# Objective');
      expect(result.enhancedPrompt).toContain('build a user profile component');
    });

    it('should extract objective from "I want to" statement', () => {
      const prompt = 'I want to create a dashboard';
      const result = clarifier.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
      expect(result.enhancedPrompt).toContain('# Objective');
    });

    it('should extract objective from "I\'m trying to" statement', () => {
      const prompt = "I'm trying to implement authentication";
      const result = clarifier.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
    });

    it('should extract objective from "Goal is to" statement', () => {
      const prompt = 'Goal is to build a REST API';
      const result = clarifier.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
    });

    it('should extract objective from "create" statement', () => {
      const prompt = 'Create a user registration form';
      const result = clarifier.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
      expect(result.enhancedPrompt).toContain('user registration form');
    });

    it('should extract objective from "build" statement', () => {
      const prompt = 'Build a shopping cart component';
      const result = clarifier.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
    });

    it('should extract objective from "implement" statement', () => {
      const prompt = 'Implement a search feature';
      const result = clarifier.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
    });
  });

  describe('apply - intent-specific inference', () => {
    it('should infer objective for code-generation with "function"', () => {
      mockContext.intent.primaryIntent = 'code-generation';
      const prompt = 'A function that validates email addresses';
      const result = clarifier.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
      expect(result.enhancedPrompt).toContain('Create a function');
    });

    it('should infer objective for code-generation with "component"', () => {
      mockContext.intent.primaryIntent = 'code-generation';
      const prompt = 'A React component for displaying users';
      const result = clarifier.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
      expect(result.enhancedPrompt).toContain('Build a component');
    });

    it('should infer objective for code-generation with "api"', () => {
      mockContext.intent.primaryIntent = 'code-generation';
      const prompt = 'An API for user management';
      const result = clarifier.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
      expect(result.enhancedPrompt).toContain('API endpoint');
    });

    it('should infer objective for debugging intent', () => {
      mockContext.intent.primaryIntent = 'debugging';
      const prompt = 'This function throws an error';
      const result = clarifier.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
      expect(result.enhancedPrompt).toContain('Fix');
    });

    it('should infer objective for refinement intent', () => {
      mockContext.intent.primaryIntent = 'refinement';
      const prompt = 'This code is slow';
      const result = clarifier.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
      expect(result.enhancedPrompt).toContain('Improve');
    });

    it('should infer objective for documentation intent', () => {
      mockContext.intent.primaryIntent = 'documentation';
      const prompt = 'How does this work?';
      const result = clarifier.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
      expect(result.enhancedPrompt).toContain('documentation');
    });

    it('should infer objective for planning intent', () => {
      mockContext.intent.primaryIntent = 'planning';
      const prompt = 'A new feature for the app';
      const result = clarifier.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
      expect(result.enhancedPrompt).toContain('Plan');
    });
  });

  describe('apply - no objective found', () => {
    it('should return applied: false when objective cannot be inferred', () => {
      mockContext.intent.primaryIntent = 'prd-generation';
      const prompt = 'xyz abc def';
      const result = clarifier.apply(prompt, mockContext);
      expect(result.applied).toBe(false);
    });

    it('should have low impact when objective not found', () => {
      mockContext.intent.primaryIntent = 'prd-generation';
      const prompt = 'random text here';
      const result = clarifier.apply(prompt, mockContext);
      expect(result.improvement.impact).toBe('low');
    });

    it('should include message about not inferring objective', () => {
      mockContext.intent.primaryIntent = 'prd-generation';
      const prompt = 'some random content';
      const result = clarifier.apply(prompt, mockContext);
      expect(result.improvement.description).toContain('Could not infer');
    });
  });

  describe('apply - result structure', () => {
    it('should return valid PatternResult structure', () => {
      const result = clarifier.apply('Build a feature', mockContext);

      expect(result).toHaveProperty('enhancedPrompt');
      expect(result).toHaveProperty('improvement');
      expect(result).toHaveProperty('applied');
      expect(result.improvement).toHaveProperty('dimension');
      expect(result.improvement).toHaveProperty('description');
      expect(result.improvement).toHaveProperty('impact');
    });

    it('should have clarity as improvement dimension', () => {
      const result = clarifier.apply('Build a feature', mockContext);
      expect(result.improvement.dimension).toBe('clarity');
    });

    it('should return high impact when objective is added', () => {
      const result = clarifier.apply('Build a feature', mockContext);
      if (result.applied) {
        expect(result.improvement.impact).toBe('high');
      }
    });
  });

  describe('apply - content preservation', () => {
    it('should preserve original prompt after objective', () => {
      const prompt = 'Build a user registration form with email validation';
      const result = clarifier.apply(prompt, mockContext);
      expect(result.enhancedPrompt).toContain(prompt);
    });

    it('should add objective header before original content', () => {
      const prompt = 'Create a dashboard component';
      const result = clarifier.apply(prompt, mockContext);
      const objectiveIndex = result.enhancedPrompt.indexOf('# Objective');
      const originalIndex = result.enhancedPrompt.indexOf(prompt);
      expect(objectiveIndex).toBeLessThan(originalIndex);
    });
  });

  describe('apply - edge cases', () => {
    it('should handle empty string', () => {
      const result = clarifier.apply('', mockContext);
      expect(result.applied).toBe(false);
    });

    it('should handle very short prompts', () => {
      const result = clarifier.apply('Hi', mockContext);
      expect(result).toBeDefined();
    });

    it('should handle very long prompts', () => {
      const longPrompt = 'Build a feature that '.repeat(200);
      const result = clarifier.apply(longPrompt, mockContext);
      expect(result).toBeDefined();
    });

    it('should handle prompts with special characters', () => {
      const prompt = 'Build a <component> with "quotes" and & symbols';
      const result = clarifier.apply(prompt, mockContext);
      expect(result).toBeDefined();
    });

    it('should handle newlines in prompt', () => {
      const prompt = 'Build a feature\nwith multiple lines\nof requirements';
      const result = clarifier.apply(prompt, mockContext);
      expect(result).toBeDefined();
    });

    it('should handle case variations', () => {
      const prompt = 'OBJECTIVE: Build something';
      const result = clarifier.apply(prompt, mockContext);
      expect(result.applied).toBe(false); // Already has objective
    });
  });

  describe('apply - format consistency', () => {
    it('should use # for objective header', () => {
      const prompt = 'Build a user component';
      const result = clarifier.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toMatch(/^# Objective\n/);
      }
    });

    it('should have newlines between objective and original', () => {
      const prompt = 'Build a user component';
      const result = clarifier.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toContain('\n\n');
      }
    });
  });

  describe('apply - multiple goal patterns', () => {
    it('should prioritize explicit goal statements', () => {
      const prompt = 'I need to build a function that creates users';
      const result = clarifier.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
      expect(result.enhancedPrompt).toContain('build a function that creates users');
    });

    it('should handle compound goal statements', () => {
      const prompt = 'I want to create a component and implement validation';
      const result = clarifier.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
    });
  });
});
