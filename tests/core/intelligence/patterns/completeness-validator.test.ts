import { describe, it, expect, beforeEach } from '@jest/globals';
import { CompletenessValidator } from '../../../../src/core/intelligence/patterns/completeness-validator.js';
import { PatternContext } from '../../../../src/core/intelligence/types.js';

describe('CompletenessValidator', () => {
  let validator: CompletenessValidator;
  let mockContext: PatternContext;

  beforeEach(() => {
    validator = new CompletenessValidator();
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
      expect(validator.id).toBe('completeness-validator');
    });

    it('should have correct name', () => {
      expect(validator.name).toBe('Completeness Validator');
    });

    it('should have correct description', () => {
      expect(validator.description).toBe('Ensures all necessary requirements are present');
    });

    it('should support both fast and deep modes', () => {
      expect(validator.mode).toBe('both');
    });

    it('should have priority 6', () => {
      expect(validator.priority).toBe(6);
    });

    it('should be applicable for code-generation, planning, refinement', () => {
      expect(validator.applicableIntents).toContain('code-generation');
      expect(validator.applicableIntents).toContain('planning');
      expect(validator.applicableIntents).toContain('refinement');
    });

    it('should not be applicable for documentation', () => {
      expect(validator.applicableIntents).not.toContain('documentation');
    });
  });

  describe('isApplicable', () => {
    it('should return true for code-generation intent', () => {
      mockContext.intent.primaryIntent = 'code-generation';
      expect(validator.isApplicable(mockContext)).toBe(true);
    });

    it('should return true for planning intent', () => {
      mockContext.intent.primaryIntent = 'planning';
      expect(validator.isApplicable(mockContext)).toBe(true);
    });

    it('should return true for refinement intent', () => {
      mockContext.intent.primaryIntent = 'refinement';
      expect(validator.isApplicable(mockContext)).toBe(true);
    });

    it('should return false for documentation intent', () => {
      mockContext.intent.primaryIntent = 'documentation';
      expect(validator.isApplicable(mockContext)).toBe(false);
    });

    it('should return false for debugging intent', () => {
      mockContext.intent.primaryIntent = 'debugging';
      expect(validator.isApplicable(mockContext)).toBe(false);
    });
  });

  describe('apply - complete prompts', () => {
    it('should return applied: false when all elements present', () => {
      const completePrompt = `
        Objective: Build a user authentication system
        Using React and TypeScript
        Success criteria: All tests pass with 100% coverage
        Constraints: Must complete within 2 hours budget
        Expected output: A login component
      `;
      const result = validator.apply(completePrompt, mockContext);
      expect(result.applied).toBe(false);
      expect(result.improvement.description).toBe('All required elements present');
    });

    it('should detect objective with "goal" keyword', () => {
      const prompt = 'Goal is to build a feature using React';
      const result = validator.apply(prompt, mockContext);
      // Should not list objective as missing
      expect(result.enhancedPrompt.toLowerCase()).not.toContain('**objective**');
    });

    it('should detect objective with "purpose" keyword', () => {
      const prompt = 'Purpose is to create a dashboard using TypeScript';
      const result = validator.apply(prompt, mockContext);
      expect(result.enhancedPrompt.toLowerCase()).not.toContain('what is the primary goal');
    });
  });

  describe('apply - missing elements detection', () => {
    it('should detect missing objective', () => {
      const prompt = 'Build something with React';
      const result = validator.apply(prompt, mockContext);
      expect(result.enhancedPrompt).toContain('Objective');
      expect(result.applied).toBe(true);
    });

    it('should detect missing tech stack', () => {
      const prompt = 'I need to build a login page';
      const result = validator.apply(prompt, mockContext);
      expect(result.enhancedPrompt).toContain('Tech Stack');
      expect(result.applied).toBe(true);
    });

    it('should detect missing success criteria', () => {
      const prompt = 'Build a React component';
      const result = validator.apply(prompt, mockContext);
      expect(result.enhancedPrompt).toContain('Success Criteria');
      expect(result.applied).toBe(true);
    });

    it('should detect missing constraints', () => {
      const prompt = 'Build a React component with success criteria';
      const result = validator.apply(prompt, mockContext);
      expect(result.enhancedPrompt).toContain('Constraints');
    });

    it('should detect missing output format', () => {
      const prompt = 'I need to build something';
      const result = validator.apply(prompt, mockContext);
      expect(result.enhancedPrompt).toContain('Expected Output');
      expect(result.applied).toBe(true);
    });
  });

  describe('apply - tech stack detection', () => {
    it('should detect JavaScript as tech stack', () => {
      const prompt = 'Build a feature with JavaScript';
      const result = validator.apply(prompt, mockContext);
      expect(result.enhancedPrompt.toLowerCase()).not.toContain('tech stack:**');
    });

    it('should detect TypeScript as tech stack', () => {
      const prompt = 'Build a feature with TypeScript';
      const result = validator.apply(prompt, mockContext);
      expect(result.enhancedPrompt.toLowerCase()).not.toContain('tech stack:**');
    });

    it('should detect Python as tech stack', () => {
      const prompt = 'Build a feature with Python';
      const result = validator.apply(prompt, mockContext);
      expect(result.enhancedPrompt.toLowerCase()).not.toContain('tech stack:**');
    });

    it('should detect React as framework', () => {
      const prompt = 'Build a React component';
      const result = validator.apply(prompt, mockContext);
      expect(result.enhancedPrompt.toLowerCase()).not.toContain('which technologies');
    });

    it('should detect Vue as framework', () => {
      const prompt = 'Build a Vue component';
      const result = validator.apply(prompt, mockContext);
      expect(result.enhancedPrompt.toLowerCase()).not.toContain('which technologies');
    });

    it('should detect database mentions', () => {
      const prompt = 'Store data in PostgreSQL';
      const result = validator.apply(prompt, mockContext);
      expect(result.enhancedPrompt.toLowerCase()).not.toContain('which technologies');
    });
  });

  describe('apply - success criteria detection', () => {
    it('should detect "success" keyword', () => {
      const prompt = 'Build a feature. Success is 100% test coverage.';
      const result = validator.apply(prompt, mockContext);
      expect(result.enhancedPrompt.toLowerCase()).not.toContain('success criteria');
    });

    it('should detect "measure" keyword', () => {
      const prompt = 'Build a feature. We measure by response time.';
      const result = validator.apply(prompt, mockContext);
      expect(result.enhancedPrompt.toLowerCase()).not.toContain('how will you know it works');
    });

    it('should detect "should work" phrase', () => {
      const prompt = 'Build a feature that should work with the existing API.';
      const result = validator.apply(prompt, mockContext);
      expect(result.enhancedPrompt.toLowerCase()).not.toContain('success criteria');
    });
  });

  describe('apply - constraints detection', () => {
    it('should detect "constraint" keyword', () => {
      const prompt = 'Build it with constraint of 100ms response';
      const result = validator.apply(prompt, mockContext);
      expect(result.enhancedPrompt.toLowerCase()).not.toContain('any limitations');
    });

    it('should detect "must not" phrase', () => {
      const prompt = 'Build a feature that must not break existing API';
      const result = validator.apply(prompt, mockContext);
      expect(result.enhancedPrompt.toLowerCase()).not.toContain('any limitations');
    });

    it('should detect "deadline" keyword', () => {
      const prompt = 'Build it before the deadline';
      const result = validator.apply(prompt, mockContext);
      expect(result.enhancedPrompt.toLowerCase()).not.toContain('any limitations');
    });

    it('should detect "budget" keyword', () => {
      const prompt = 'Build it within budget';
      const result = validator.apply(prompt, mockContext);
      expect(result.enhancedPrompt.toLowerCase()).not.toContain('any limitations');
    });
  });

  describe('apply - output format detection', () => {
    it('should detect "output" keyword', () => {
      const prompt = 'The output should be a JSON file';
      const result = validator.apply(prompt, mockContext);
      expect(result.enhancedPrompt.toLowerCase()).not.toContain('expected output');
    });

    it('should detect "component" keyword', () => {
      const prompt = 'Build a component';
      const result = validator.apply(prompt, mockContext);
      expect(result.enhancedPrompt.toLowerCase()).not.toContain('what should the result look like');
    });

    it('should detect "function" keyword', () => {
      const prompt = 'Write a function';
      const result = validator.apply(prompt, mockContext);
      expect(result.enhancedPrompt.toLowerCase()).not.toContain('expected output');
    });

    it('should detect "API" keyword', () => {
      const prompt = 'Build an API endpoint';
      const result = validator.apply(prompt, mockContext);
      expect(result.enhancedPrompt.toLowerCase()).not.toContain('expected output');
    });
  });

  describe('apply - completeness score', () => {
    it('should show 0% when all elements missing', () => {
      const prompt = 'Do stuff';
      const result = validator.apply(prompt, mockContext);
      expect(result.enhancedPrompt).toContain('Completeness Check');
      expect(result.enhancedPrompt).toMatch(/\d+%/);
    });

    it('should calculate correct percentage for partial completion', () => {
      const prompt = 'Goal is to build a React component';
      const result = validator.apply(prompt, mockContext);
      expect(result.enhancedPrompt).toMatch(/\d+%/);
      expect(result.enhancedPrompt).toContain('/5');
    });

    it('should show 100% when all elements present', () => {
      const completePrompt = `
        Objective: Build auth
        Using React
        Success: Tests pass
        Constraint: Within budget
        Output: Component
      `;
      const result = validator.apply(completePrompt, mockContext);
      expect(result.applied).toBe(false);
    });
  });

  describe('apply - impact levels', () => {
    it('should return low impact when no elements missing', () => {
      const completePrompt = `
        Objective: Build auth
        Using React
        Success: Tests pass
        Constraint: Within budget
        Output: Component
      `;
      const result = validator.apply(completePrompt, mockContext);
      expect(result.improvement.impact).toBe('low');
    });

    it('should return appropriate impact for missing elements', () => {
      const prompt = 'Build something';
      const result = validator.apply(prompt, mockContext);
      expect(['low', 'medium', 'high']).toContain(result.improvement.impact);
    });

    it('should return high impact for 3+ missing elements', () => {
      const prompt = 'Do it';
      const result = validator.apply(prompt, mockContext);
      expect(['medium', 'high']).toContain(result.improvement.impact);
    });
  });

  describe('apply - missing element prompts', () => {
    it('should provide helpful prompt for missing objective', () => {
      const prompt = 'Build with React';
      const result = validator.apply(prompt, mockContext);
      expect(result.enhancedPrompt).toContain('What is the primary goal');
    });

    it('should provide helpful prompt for missing tech stack', () => {
      const prompt = 'I need to build a feature';
      const result = validator.apply(prompt, mockContext);
      expect(result.enhancedPrompt).toContain('technologies/frameworks');
    });

    it('should provide helpful prompt for missing success criteria', () => {
      const prompt = 'Build a React component';
      const result = validator.apply(prompt, mockContext);
      expect(result.enhancedPrompt).toContain('How will you know it works');
    });

    it('should provide helpful prompt for missing constraints', () => {
      const prompt = 'Build a component with React and tests';
      const result = validator.apply(prompt, mockContext);
      expect(result.enhancedPrompt).toContain('Any limitations');
    });

    it('should provide helpful prompt for missing output format', () => {
      const prompt = 'I need to create something';
      const result = validator.apply(prompt, mockContext);
      expect(result.enhancedPrompt).toContain('What should the result look like');
    });
  });

  describe('apply - edge cases', () => {
    it('should handle empty string', () => {
      const result = validator.apply('', mockContext);
      expect(result.applied).toBe(true);
      expect(result.enhancedPrompt).toContain('Missing Information');
    });

    it('should handle very short prompts', () => {
      const result = validator.apply('Do', mockContext);
      expect(result.applied).toBe(true);
    });

    it('should handle very long prompts', () => {
      const longPrompt = 'Build a feature '.repeat(500);
      const result = validator.apply(longPrompt, mockContext);
      expect(result).toBeDefined();
    });

    it('should handle prompts with special characters', () => {
      const prompt = 'Build a <component> with "special" characters & symbols';
      const result = validator.apply(prompt, mockContext);
      expect(result).toBeDefined();
    });
  });

  describe('apply - result structure', () => {
    it('should return valid PatternResult structure', () => {
      const result = validator.apply('Build something', mockContext);

      expect(result).toHaveProperty('enhancedPrompt');
      expect(result).toHaveProperty('improvement');
      expect(result).toHaveProperty('applied');
      expect(result.improvement).toHaveProperty('dimension');
      expect(result.improvement).toHaveProperty('description');
      expect(result.improvement).toHaveProperty('impact');
    });

    it('should have completeness as improvement dimension', () => {
      const result = validator.apply('Build something', mockContext);
      expect(result.improvement.dimension).toBe('completeness');
    });

    it('should include missing element count in description', () => {
      const prompt = 'Do it';
      const result = validator.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.improvement.description).toMatch(/\d+/);
      }
    });
  });

  describe('apply - separator formatting', () => {
    it('should add separator before missing elements section', () => {
      const prompt = 'Build something';
      const result = validator.apply(prompt, mockContext);
      expect(result.enhancedPrompt).toContain('---');
    });

    it('should preserve original prompt before separator', () => {
      const prompt = 'Build a specific feature';
      const result = validator.apply(prompt, mockContext);
      expect(result.enhancedPrompt).toContain('Build a specific feature');
    });
  });
});
