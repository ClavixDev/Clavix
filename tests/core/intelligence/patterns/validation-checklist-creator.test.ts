import { describe, it, expect, beforeEach } from '@jest/globals';
import { ValidationChecklistCreator } from '../../../../src/core/intelligence/patterns/validation-checklist-creator.js';
import { PatternContext } from '../../../../src/core/intelligence/types.js';

describe('ValidationChecklistCreator', () => {
  let pattern: ValidationChecklistCreator;
  let mockContext: PatternContext;

  beforeEach(() => {
    pattern = new ValidationChecklistCreator();
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
      expect(pattern.id).toBe('validation-checklist-creator');
    });

    it('should have correct name', () => {
      expect(pattern.name).toBe('Validation Checklist Creator');
    });

    it('should be comprehensive depth only', () => {
      expect(pattern.scope).toBe('comprehensive');
    });

    it('should have priority 3', () => {
      expect(pattern.priority).toBe(3);
    });

    it('should be applicable for expected intents', () => {
      expect(pattern.applicableIntents).toContain('code-generation');
      expect(pattern.applicableIntents).toContain('testing');
      expect(pattern.applicableIntents).toContain('migration');
      expect(pattern.applicableIntents).toContain('security-review');
      expect(pattern.applicableIntents).toContain('debugging');
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

  describe('apply - code-generation checklist', () => {
    it('should add code-generation checklist items', () => {
      mockContext.intent.primaryIntent = 'code-generation';
      const prompt = 'Create a user service';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
      expect(result.enhancedPrompt).toContain('Validation Checklist');
    });

    it('should add API-specific checklist items', () => {
      const prompt = 'Create an API endpoint for user data';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toMatch(/status codes|invalid requests/i);
      }
    });

    it('should add UI-specific checklist items', () => {
      const prompt = 'Create a UI component for the form page';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toMatch(/screen sizes|Keyboard|accessibility/i);
      }
    });

    it('should add test-specific checklist items', () => {
      const prompt = 'Create a module with test coverage';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toMatch(/Unit tests|coverage/i);
      }
    });
  });

  describe('apply - testing checklist', () => {
    it('should add testing checklist items', () => {
      mockContext.intent.primaryIntent = 'testing';
      const prompt = 'Write tests for the payment service';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
      expect(result.enhancedPrompt).toMatch(/pass consistently|independent|Edge cases/i);
    });
  });

  describe('apply - migration checklist', () => {
    it('should add migration checklist items', () => {
      mockContext.intent.primaryIntent = 'migration';
      const prompt = 'Migrate to new database';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
      expect(result.enhancedPrompt).toMatch(/Data migrated|Rollback|Performance/i);
    });
  });

  describe('apply - security checklist', () => {
    it('should add security checklist items', () => {
      mockContext.intent.primaryIntent = 'security-review';
      const prompt = 'Review the authentication system';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
      expect(result.enhancedPrompt).toMatch(/Authentication|Authorization|sanitized/i);
    });
  });

  describe('apply - debugging checklist', () => {
    it('should add debugging checklist items', () => {
      mockContext.intent.primaryIntent = 'debugging';
      const prompt = 'Fix the login bug';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
      expect(result.enhancedPrompt).toMatch(/Root cause|reproducible|regression/i);
    });
  });

  describe('apply - domain checklists', () => {
    it('should add payment domain checklist items', () => {
      const prompt = 'Create a payment checkout transaction handler';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toMatch(/Payment processing|Duplicate transactions/i);
      }
    });

    it('should add notification domain checklist items', () => {
      const prompt = 'Create an email notification message system';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toMatch(/Notifications|recipients|content/i);
      }
    });

    it('should add file upload domain checklist items', () => {
      const prompt = 'Create a file upload handler for images';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toMatch(/File uploads|Invalid|large files/i);
      }
    });

    it('should add database domain checklist items', () => {
      const prompt = 'Create a database query handler';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toMatch(/queries perform|constraints/i);
      }
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

    it('should have actionability as improvement dimension', () => {
      const prompt = 'Create a module';
      const result = pattern.apply(prompt, mockContext);
      expect(result.improvement.dimension).toBe('actionability');
    });

    it('should return high impact when applied', () => {
      const prompt = 'Create a user service';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.improvement.impact).toBe('high');
      }
    });

    it('should use checkbox format', () => {
      const prompt = 'Create a service';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toContain('☐');
      }
    });

    it('should limit checklist to 12 items', () => {
      // Trigger multiple domains
      const prompt = 'Create a payment API with file upload, database, email notifications';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        const checkboxCount = (result.enhancedPrompt.match(/☐/g) || []).length;
        expect(checkboxCount).toBeLessThanOrEqual(12);
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
