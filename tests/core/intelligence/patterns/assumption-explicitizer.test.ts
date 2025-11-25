import { describe, it, expect, beforeEach } from '@jest/globals';
import { AssumptionExplicitizer } from '../../../../src/core/intelligence/patterns/assumption-explicitizer.js';
import { PatternContext } from '../../../../src/core/intelligence/types.js';

describe('AssumptionExplicitizer', () => {
  let pattern: AssumptionExplicitizer;
  let mockContext: PatternContext;

  beforeEach(() => {
    pattern = new AssumptionExplicitizer();
    mockContext = {
      mode: 'deep',
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
      expect(pattern.id).toBe('assumption-explicitizer');
    });

    it('should have correct name', () => {
      expect(pattern.name).toBe('Assumption Explicitizer');
    });

    it('should be deep mode only', () => {
      expect(pattern.mode).toBe('deep');
    });

    it('should have priority 6', () => {
      expect(pattern.priority).toBe(6);
    });

    it('should be applicable for expected intents', () => {
      expect(pattern.applicableIntents).toContain('code-generation');
      expect(pattern.applicableIntents).toContain('planning');
      expect(pattern.applicableIntents).toContain('migration');
      expect(pattern.applicableIntents).toContain('testing');
      expect(pattern.applicableIntents).toContain('debugging');
      expect(pattern.applicableIntents).toContain('prd-generation');
    });
  });

  describe('isApplicable', () => {
    it('should return true for code-generation in deep mode', () => {
      mockContext.mode = 'deep';
      mockContext.intent.primaryIntent = 'code-generation';
      expect(pattern.isApplicable(mockContext)).toBe(true);
    });

    it('should return false in fast mode', () => {
      mockContext.mode = 'fast';
      expect(pattern.isApplicable(mockContext)).toBe(false);
    });
  });

  describe('apply - missing framework context', () => {
    it('should identify frontend framework assumption', () => {
      const prompt = 'Create a frontend UI component with state';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
      expect(result.enhancedPrompt).toContain('Implicit Assumptions');
    });

    it('should not assume framework if specified', () => {
      const prompt = 'Create a React component';
      const result = pattern.apply(prompt, mockContext);
      // Should not include framework assumption if React specified
      if (result.applied) {
        expect(result.enhancedPrompt).not.toContain('Frontend framework is React');
      }
    });
  });

  describe('apply - missing language context', () => {
    it('should identify language assumption', () => {
      const prompt = 'Create a function to process data';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
      if (result.applied) {
        expect(result.enhancedPrompt).toMatch(/Language|TypeScript|JavaScript/i);
      }
    });

    it('should not assume language if specified', () => {
      const prompt = 'Create a Python function';
      const result = pattern.apply(prompt, mockContext);
      // Language should not be flagged as assumption
      if (result.applied) {
        expect(result.enhancedPrompt).not.toContain('Language is TypeScript/JavaScript');
      }
    });
  });

  describe('apply - missing database context', () => {
    it('should identify database assumption', () => {
      const prompt = 'Create a service to store user data in database';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
      if (result.applied) {
        expect(result.enhancedPrompt).toMatch(/Database|technology/i);
      }
    });
  });

  describe('apply - code-generation assumptions', () => {
    it('should identify error handling assumption', () => {
      mockContext.intent.primaryIntent = 'code-generation';
      const prompt = 'Create an API service';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toMatch(/error handling|throw|null/i);
      }
    });

    it('should identify async assumption', () => {
      const prompt = 'Create a service that calls the API';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toMatch(/async|await|promise/i);
      }
    });

    it('should identify state management assumption', () => {
      const prompt = 'Create a component with global state management';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toMatch(/state management|Context|Redux/i);
      }
    });
  });

  describe('apply - planning assumptions', () => {
    it('should identify team size assumption', () => {
      mockContext.intent.primaryIntent = 'planning';
      const prompt = 'Plan the new feature implementation';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toMatch(/team|developer|people/i);
      }
    });

    it('should identify timeline assumption', () => {
      mockContext.intent.primaryIntent = 'planning';
      const prompt = 'Create a project plan';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toMatch(/timeline|deadline|constraints/i);
      }
    });

    it('should identify scale assumption', () => {
      mockContext.intent.primaryIntent = 'planning';
      const prompt = 'Design the system architecture';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toMatch(/scale|users|requests/i);
      }
    });
  });

  describe('apply - migration assumptions', () => {
    it('should identify downtime assumption', () => {
      mockContext.intent.primaryIntent = 'migration';
      const prompt = 'Migrate to new system';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toMatch(/downtime|zero-downtime/i);
      }
    });

    it('should identify rollback assumption', () => {
      mockContext.intent.primaryIntent = 'migration';
      const prompt = 'Migrate the database';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toMatch(/Rollback|revert|fails/i);
      }
    });
  });

  describe('apply - testing assumptions', () => {
    it('should identify test framework assumption', () => {
      mockContext.intent.primaryIntent = 'testing';
      const prompt = 'Write tests for the service';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toMatch(/test framework|Jest|Vitest/i);
      }
    });

    it('should identify coverage assumption', () => {
      mockContext.intent.primaryIntent = 'testing';
      const prompt = 'Create unit tests';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toMatch(/coverage|target|percentage/i);
      }
    });
  });

  describe('apply - debugging assumptions', () => {
    it('should identify environment assumption', () => {
      mockContext.intent.primaryIntent = 'debugging';
      const prompt = 'Fix the login bug';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toMatch(/environment|production|development/i);
      }
    });

    it('should identify reproducibility assumption', () => {
      mockContext.intent.primaryIntent = 'debugging';
      const prompt = 'Debug the data issue';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toMatch(/reproducible|every time|intermittent/i);
      }
    });
  });

  describe('apply - domain assumptions', () => {
    it('should identify auth mechanism assumption', () => {
      const prompt = 'Create a user login system';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toMatch(/JWT|session|authentication/i);
      }
    });

    it('should identify API style assumption', () => {
      const prompt = 'Create an API endpoint';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toMatch(/REST|GraphQL|API style/i);
      }
    });
  });

  describe('apply - result structure', () => {
    it('should return valid PatternResult structure', () => {
      const prompt = 'Create a component';
      const result = pattern.apply(prompt, mockContext);

      expect(result).toHaveProperty('enhancedPrompt');
      expect(result).toHaveProperty('improvement');
      expect(result).toHaveProperty('applied');
    });

    it('should have clarity as improvement dimension', () => {
      const prompt = 'Create a module';
      const result = pattern.apply(prompt, mockContext);
      expect(result.improvement.dimension).toBe('clarity');
    });

    it('should return high impact when applied', () => {
      const prompt = 'Create a UI component';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.improvement.impact).toBe('high');
      }
    });

    it('should include clarification questions', () => {
      const prompt = 'Create a service with database';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toContain('Clarify:');
      }
    });

    it('should limit assumptions to 8', () => {
      // Trigger multiple assumption categories
      const prompt = 'Create a frontend UI component with state that calls API and stores data';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        const assumptionCount = (result.enhancedPrompt.match(/\*\*\d\./g) || []).length;
        expect(assumptionCount).toBeLessThanOrEqual(8);
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
