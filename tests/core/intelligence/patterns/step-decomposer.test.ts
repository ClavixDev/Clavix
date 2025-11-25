import { describe, it, expect, beforeEach } from '@jest/globals';
import { StepDecomposer } from '../../../../src/core/intelligence/patterns/step-decomposer.js';
import { PatternContext } from '../../../../src/core/intelligence/types.js';

describe('StepDecomposer', () => {
  let pattern: StepDecomposer;
  let mockContext: PatternContext;

  beforeEach(() => {
    pattern = new StepDecomposer();
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
      expect(pattern.id).toBe('step-decomposer');
    });

    it('should have correct name', () => {
      expect(pattern.name).toBe('Step-by-Step Decomposer');
    });

    it('should have correct description', () => {
      expect(pattern.description).toBe('Break complex prompts into clear sequential steps');
    });

    it('should support both modes', () => {
      expect(pattern.mode).toBe('both');
    });

    it('should have priority 5 (MEDIUM-LOW - supplementary)', () => {
      expect(pattern.priority).toBe(5);
    });

    it('should be applicable for multiple intents', () => {
      expect(pattern.applicableIntents).toContain('code-generation');
      expect(pattern.applicableIntents).toContain('planning');
      expect(pattern.applicableIntents).toContain('migration');
      expect(pattern.applicableIntents).toContain('testing');
      expect(pattern.applicableIntents).toContain('debugging');
      expect(pattern.applicableIntents).toContain('documentation');
    });
  });

  describe('isApplicable', () => {
    it('should return true for code-generation intent', () => {
      mockContext.intent.primaryIntent = 'code-generation';
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

    it('should return false for prd-generation intent', () => {
      mockContext.intent.primaryIntent = 'prd-generation';
      expect(pattern.isApplicable(mockContext)).toBe(false);
    });
  });

  describe('apply - simple prompts (no decomposition)', () => {
    it('should not decompose very short prompts', () => {
      const prompt = 'Build a button';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(false);
    });

    it('should return low impact for simple prompts', () => {
      const prompt = 'Create a function';
      const result = pattern.apply(prompt, mockContext);
      expect(result.improvement.impact).toBe('low');
    });
  });

  describe('apply - already has steps', () => {
    it('should not apply when prompt has "Step 1"', () => {
      const prompt = 'Step 1: Build component\nStep 2: Add tests';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(false);
    });

    it('should not apply when prompt has numbered steps', () => {
      const prompt = '1. Build component\n2. Add tests\n3. Deploy';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(false);
    });

    it('should not apply when prompt has "first...second"', () => {
      const prompt = 'First, build the component, second add the tests';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(false);
    });

    it('should not apply when prompt has "Phase 1"', () => {
      const prompt = 'Phase 1: Setup\nPhase 2: Development';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(false);
    });
  });

  describe('apply - complex prompts (decomposition needed)', () => {
    it('should decompose prompts with "and" connector', () => {
      const prompt = 'Build a component and add validation and write tests';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
      expect(result.enhancedPrompt).toContain('### Implementation Steps');
    });

    it('should decompose prompts with "then" connector', () => {
      const prompt = 'Create the API endpoint then add authentication then test it';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
    });

    it('should decompose prompts with "also" connector', () => {
      const prompt = 'Build the form also add validation also handle errors';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
    });

    it('should decompose long prompts (>100 words)', () => {
      // 100+ words needed to trigger decomposition
      const longPrompt =
        'Build a component ' + 'with features '.repeat(50) + 'and many more requirements';
      const result = pattern.apply(longPrompt, mockContext);
      expect(result.applied).toBe(true);
    });

    it('should decompose prompts with bullet points', () => {
      const prompt = 'Requirements:\n- Add login\n- Add signup\n- Add password reset';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
    });
  });

  describe('apply - intent-specific decomposition', () => {
    it('should add component-specific steps for UI content', () => {
      mockContext.intent.primaryIntent = 'code-generation';
      const prompt = 'Build a component with login functionality and error handling and validation';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toContain('component');
      }
    });

    it('should add API-specific steps for API content', () => {
      mockContext.intent.primaryIntent = 'code-generation';
      const prompt = 'Build an API endpoint with authentication and validation and error handling';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toContain('API');
      }
    });

    it('should add planning-specific steps', () => {
      mockContext.intent.primaryIntent = 'planning';
      const prompt = 'Plan the implementation of a user authentication system with many features';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toMatch(/goal|architecture|task/i);
      }
    });

    it('should add migration-specific steps', () => {
      mockContext.intent.primaryIntent = 'migration';
      const prompt =
        'Migrate the database from PostgreSQL to MongoDB and update all queries and test';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toMatch(/assess|migrate|validate/i);
      }
    });

    it('should add testing-specific steps', () => {
      mockContext.intent.primaryIntent = 'testing';
      const prompt =
        'Write tests for the user service and add edge cases and mock external services';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toMatch(/test|coverage|edge case/i);
      }
    });

    it('should add debugging-specific steps', () => {
      mockContext.intent.primaryIntent = 'debugging';
      const prompt = 'Debug the login issue and find root cause and fix it';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toMatch(/reproduce|isolate|hypothesis|fix/i);
      }
    });
  });

  describe('apply - result structure', () => {
    it('should return valid PatternResult structure', () => {
      const prompt = 'Build a feature and add tests';
      const result = pattern.apply(prompt, mockContext);

      expect(result).toHaveProperty('enhancedPrompt');
      expect(result).toHaveProperty('improvement');
      expect(result).toHaveProperty('applied');
      expect(result.improvement).toHaveProperty('dimension');
      expect(result.improvement).toHaveProperty('description');
      expect(result.improvement).toHaveProperty('impact');
    });

    it('should have structure as improvement dimension', () => {
      const prompt = 'Build a component';
      const result = pattern.apply(prompt, mockContext);
      expect(result.improvement.dimension).toBe('structure');
    });

    it('should return high impact when decomposed', () => {
      const prompt = 'Build a component and add validation and write tests and deploy';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.improvement.impact).toBe('high');
      }
    });

    it('should include step count in description', () => {
      const prompt = 'Build a component and add tests and deploy';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.improvement.description).toMatch(/\d+ sequential steps/);
      }
    });
  });

  describe('apply - content preservation', () => {
    it('should preserve original prompt', () => {
      const prompt = 'Build an authentication system and add validation';
      const result = pattern.apply(prompt, mockContext);
      expect(result.enhancedPrompt).toContain(prompt);
    });

    it('should add steps section after original content', () => {
      const prompt = 'Build a dashboard and add charts and filters';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        const promptIndex = result.enhancedPrompt.indexOf(prompt);
        const stepsIndex = result.enhancedPrompt.indexOf('### Implementation Steps');
        expect(promptIndex).toBeLessThan(stepsIndex);
      }
    });
  });

  describe('apply - step formatting', () => {
    it('should format steps with numbers', () => {
      const prompt = 'Build a component and add validation and write tests';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toMatch(/1\.\s+/);
        expect(result.enhancedPrompt).toMatch(/2\.\s+/);
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

    it('should handle prompts with special characters', () => {
      const prompt = 'Build a <component> and add "validation" & tests';
      const result = pattern.apply(prompt, mockContext);
      expect(result).toBeDefined();
    });

    it('should handle newlines in prompt', () => {
      const prompt = 'Build a feature\nand add tests\nand deploy';
      const result = pattern.apply(prompt, mockContext);
      expect(result).toBeDefined();
    });
  });
});
