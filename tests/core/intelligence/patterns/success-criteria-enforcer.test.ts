import { describe, it, expect, beforeEach } from '@jest/globals';
import { SuccessCriteriaEnforcer } from '../../../../src/core/intelligence/patterns/success-criteria-enforcer.js';
import { PatternContext } from '../../../../src/core/intelligence/types.js';

describe('SuccessCriteriaEnforcer', () => {
  let pattern: SuccessCriteriaEnforcer;
  let mockContext: PatternContext;

  beforeEach(() => {
    pattern = new SuccessCriteriaEnforcer();
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
      expect(pattern.id).toBe('success-criteria-enforcer');
    });

    it('should have correct name', () => {
      expect(pattern.name).toBe('Success Criteria Enforcer');
    });

    it('should have correct description', () => {
      expect(pattern.description).toBe(
        'Adds measurable success criteria for task completion validation'
      );
    });

    it('should support both fast and deep modes', () => {
      expect(pattern.mode).toBe('both');
    });

    it('should have priority 7 (MEDIUM-HIGH - important enrichment)', () => {
      expect(pattern.priority).toBe(7);
    });

    it('should be applicable for multiple intents', () => {
      expect(pattern.applicableIntents).toContain('code-generation');
      expect(pattern.applicableIntents).toContain('planning');
      expect(pattern.applicableIntents).toContain('refinement');
      expect(pattern.applicableIntents).toContain('debugging');
      expect(pattern.applicableIntents).toContain('testing');
      expect(pattern.applicableIntents).toContain('migration');
      expect(pattern.applicableIntents).toContain('prd-generation');
    });

    it('should not be applicable for learning intent', () => {
      expect(pattern.applicableIntents).not.toContain('learning');
    });
  });

  describe('isApplicable', () => {
    it('should return true for code-generation intent', () => {
      mockContext.intent.primaryIntent = 'code-generation';
      expect(pattern.isApplicable(mockContext)).toBe(true);
    });

    it('should return true for testing intent', () => {
      mockContext.intent.primaryIntent = 'testing';
      expect(pattern.isApplicable(mockContext)).toBe(true);
    });

    it('should return true for debugging intent', () => {
      mockContext.intent.primaryIntent = 'debugging';
      expect(pattern.isApplicable(mockContext)).toBe(true);
    });

    it('should return true for migration intent', () => {
      mockContext.intent.primaryIntent = 'migration';
      expect(pattern.isApplicable(mockContext)).toBe(true);
    });

    it('should return false for learning intent', () => {
      mockContext.intent.primaryIntent = 'learning';
      expect(pattern.isApplicable(mockContext)).toBe(false);
    });

    it('should return false for security-review intent', () => {
      mockContext.intent.primaryIntent = 'security-review';
      expect(pattern.isApplicable(mockContext)).toBe(false);
    });
  });

  describe('apply - criteria already specified', () => {
    it('should not modify prompt with "success criteria"', () => {
      const prompt = 'Build a component with success criteria: tests pass';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(false);
      expect(result.enhancedPrompt).toBe(prompt);
    });

    it('should not modify prompt with "acceptance criteria"', () => {
      const prompt = 'Create feature with acceptance criteria';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(false);
    });

    it('should not modify prompt with "done when"', () => {
      const prompt = 'Task is done when all tests pass';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(false);
    });

    it('should not modify prompt with "must pass"', () => {
      const prompt = 'All unit tests must pass';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(false);
    });

    it('should not modify prompt with "test coverage"', () => {
      const prompt = 'Ensure test coverage is above 80%';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(false);
    });

    it('should not modify prompt with "verify that"', () => {
      const prompt = 'Verify that all functions work correctly';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(false);
    });

    it('should not modify prompt with "ensure that"', () => {
      const prompt = 'Ensure that no errors occur';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(false);
    });
  });

  describe('apply - adds criteria section', () => {
    it('should add success criteria section when missing', () => {
      const prompt = 'Build a user registration form';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
      expect(result.enhancedPrompt).toContain('## Success Criteria');
    });

    it('should add criteria with checkboxes', () => {
      const prompt = 'Create a login component';
      const result = pattern.apply(prompt, mockContext);
      expect(result.enhancedPrompt).toContain('- [ ]');
    });

    it('should add code-generation specific criteria', () => {
      mockContext.intent.primaryIntent = 'code-generation';
      const prompt = 'Build a user service';
      const result = pattern.apply(prompt, mockContext);
      expect(result.enhancedPrompt).toContain('compiles');
      expect(result.enhancedPrompt).toContain('tests pass');
    });

    it('should add debugging specific criteria', () => {
      mockContext.intent.primaryIntent = 'debugging';
      const prompt = 'Fix the login error';
      const result = pattern.apply(prompt, mockContext);
      expect(result.enhancedPrompt).toContain('root cause');
    });

    it('should add testing specific criteria', () => {
      mockContext.intent.primaryIntent = 'testing';
      const prompt = 'Write tests for UserService';
      const result = pattern.apply(prompt, mockContext);
      expect(result.enhancedPrompt).toContain('coverage');
    });

    it('should add migration specific criteria', () => {
      mockContext.intent.primaryIntent = 'migration';
      const prompt = 'Migrate from React 17 to 18';
      const result = pattern.apply(prompt, mockContext);
      expect(result.enhancedPrompt).toContain('data loss');
    });

    it('should add planning specific criteria', () => {
      mockContext.intent.primaryIntent = 'planning';
      const prompt = 'Plan the authentication feature';
      const result = pattern.apply(prompt, mockContext);
      expect(result.enhancedPrompt).toContain('requirements');
    });

    it('should add prd-generation specific criteria', () => {
      mockContext.intent.primaryIntent = 'prd-generation';
      const prompt = 'Create a PRD for the new feature';
      const result = pattern.apply(prompt, mockContext);
      expect(result.enhancedPrompt).toContain('sections');
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

    it('should have completeness as improvement dimension', () => {
      const result = pattern.apply('Build a feature', mockContext);
      expect(result.improvement.dimension).toBe('completeness');
    });

    it('should return medium impact when criteria are added', () => {
      const result = pattern.apply('Build a feature', mockContext);
      if (result.applied) {
        expect(result.improvement.impact).toBe('medium');
      }
    });

    it('should return low impact when criteria already exist', () => {
      const result = pattern.apply('Build with success criteria defined', mockContext);
      expect(result.improvement.impact).toBe('low');
    });

    it('should include criteria count in description', () => {
      const result = pattern.apply('Build a feature', mockContext);
      if (result.applied) {
        expect(result.improvement.description).toMatch(/\d+ measurable success criteria/);
      }
    });
  });

  describe('apply - content preservation', () => {
    it('should preserve original prompt before criteria section', () => {
      const prompt = 'Build a user registration form with email validation';
      const result = pattern.apply(prompt, mockContext);
      expect(result.enhancedPrompt).toContain(prompt);
    });

    it('should add criteria section after original content', () => {
      const prompt = 'Create a dashboard component';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        const promptIndex = result.enhancedPrompt.indexOf(prompt);
        const criteriaIndex = result.enhancedPrompt.indexOf('## Success Criteria');
        expect(promptIndex).toBeLessThan(criteriaIndex);
      }
    });

    it('should include tip about tracking progress', () => {
      const prompt = 'Build a feature';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toContain('track progress');
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
      const prompt = 'SUCCESS CRITERIA: all tests pass';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(false); // Already has criteria
    });
  });
});
