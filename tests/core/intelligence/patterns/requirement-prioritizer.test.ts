import { describe, it, expect, beforeEach } from '@jest/globals';
import { RequirementPrioritizer } from '../../../../src/core/intelligence/patterns/requirement-prioritizer.js';
import { PatternContext } from '../../../../src/core/intelligence/types.js';

describe('RequirementPrioritizer', () => {
  let pattern: RequirementPrioritizer;
  let mockContext: PatternContext;

  beforeEach(() => {
    pattern = new RequirementPrioritizer();
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
      expect(pattern.id).toBe('requirement-prioritizer');
    });

    it('should have correct name', () => {
      expect(pattern.name).toBe('Requirement Prioritizer');
    });

    it('should have correct description', () => {
      expect(pattern.description).toBe('Separates must-have from nice-to-have requirements');
    });

    it('should be deep mode only', () => {
      expect(pattern.mode).toBe('deep');
    });

    it('should have priority 7', () => {
      expect(pattern.priority).toBe(7);
    });

    it('should be applicable for prd-generation intent', () => {
      expect(pattern.applicableIntents).toContain('prd-generation');
    });

    it('should be applicable for planning intent', () => {
      expect(pattern.applicableIntents).toContain('planning');
    });

    it('should not be applicable for code-generation intent', () => {
      expect(pattern.applicableIntents).not.toContain('code-generation');
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

  describe('apply - no feature content', () => {
    it('should not apply to prompts without feature keywords', () => {
      const prompt = 'Hello world';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(false);
    });

    it('should return low impact when no feature content', () => {
      const prompt = 'Just some random text';
      const result = pattern.apply(prompt, mockContext);
      expect(result.improvement.impact).toBe('low');
    });
  });

  describe('apply - prioritization already exists', () => {
    it('should not modify prompt with "must-have"', () => {
      const prompt = 'Feature: User login\nMust-have: Authentication';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(false);
    });

    it('should not modify prompt with "nice-to-have"', () => {
      const prompt = 'Feature: Dashboard\nNice-to-have: Dark mode';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(false);
    });

    it('should not modify prompt with "P0"', () => {
      const prompt = 'Feature requirements:\nP0: Core authentication';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(false);
    });

    it('should not modify prompt with "MVP"', () => {
      const prompt = 'MVP requirements: login, signup';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(false);
    });

    it('should not modify prompt with "phase 1"', () => {
      const prompt = 'Phase 1 features: authentication';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(false);
    });

    it('should not modify prompt with "critical"', () => {
      const prompt = 'Critical feature: user authentication';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(false);
    });

    it('should not modify prompt with "optional"', () => {
      const prompt = 'Optional features: dark mode, animations';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(false);
    });
  });

  describe('apply - adds prioritization', () => {
    it('should add prioritization section for feature content', () => {
      const prompt =
        'We need to implement the following features:\n- User login\n- Dashboard\n- Settings';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
    });

    it('should add priority framework', () => {
      const prompt = 'Requirements: Implement authentication, create dashboard, add notifications';
      const result = pattern.apply(prompt, mockContext);
      expect(result.enhancedPrompt).toContain('Priorities');
    });

    it('should reference must-have and should-have', () => {
      const prompt = 'Build a feature with functionality for users';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toMatch(/Must-Have|Should-Have|Nice-to-Have/i);
      }
    });

    it('should add P0, P1, P2 framework when features exist', () => {
      const prompt = 'Feature requirements:\n- Login system\n- User dashboard';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toMatch(/P0|P1|P2|MVP|Must-Have/i);
      }
    });
  });

  describe('apply - result structure', () => {
    it('should return valid PatternResult structure', () => {
      const prompt = 'Build a feature for users';
      const result = pattern.apply(prompt, mockContext);

      expect(result).toHaveProperty('enhancedPrompt');
      expect(result).toHaveProperty('improvement');
      expect(result).toHaveProperty('applied');
      expect(result.improvement).toHaveProperty('dimension');
      expect(result.improvement).toHaveProperty('description');
      expect(result.improvement).toHaveProperty('impact');
    });

    it('should have structure as improvement dimension', () => {
      const prompt = 'Build a feature';
      const result = pattern.apply(prompt, mockContext);
      expect(result.improvement.dimension).toBe('structure');
    });

    it('should return high impact when prioritization is added', () => {
      const prompt = 'We need these features: login, dashboard, settings';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.improvement.impact).toBe('high');
      }
    });
  });

  describe('apply - content preservation', () => {
    it('should preserve original prompt content', () => {
      const prompt = 'Build user authentication feature with signup and login';
      const result = pattern.apply(prompt, mockContext);
      expect(result.enhancedPrompt).toContain(prompt);
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
      const longPrompt = 'We need this feature '.repeat(200);
      const result = pattern.apply(longPrompt, mockContext);
      expect(result).toBeDefined();
    });

    it('should handle prompts with special characters', () => {
      const prompt = 'Feature: Build a <component> with "quotes" & symbols';
      const result = pattern.apply(prompt, mockContext);
      expect(result).toBeDefined();
    });

    it('should handle newlines in prompt', () => {
      const prompt = 'Feature 1: Login\nFeature 2: Dashboard\nFeature 3: Settings';
      const result = pattern.apply(prompt, mockContext);
      expect(result).toBeDefined();
    });

    it('should handle case variations', () => {
      const prompt = 'MUST-HAVE features: login';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(false); // Already has prioritization
    });
  });

  describe('apply - feature keywords detection', () => {
    it('should detect "feature" keyword', () => {
      const prompt = 'Add a new feature for user management';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
    });

    it('should detect "requirement" keyword', () => {
      const prompt = 'Requirement: Build authentication system';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
    });

    it('should detect "should" keyword', () => {
      const prompt = 'The app should have a login page';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
    });

    it('should detect "implement" keyword', () => {
      const prompt = 'Implement user dashboard with analytics';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
    });
  });
});
