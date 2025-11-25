import { describe, it, expect, beforeEach } from '@jest/globals';
import { AlternativePhrasingGenerator } from '../../../../src/core/intelligence/patterns/alternative-phrasing-generator.js';
import { PatternContext } from '../../../../src/core/intelligence/types.js';

describe('AlternativePhrasingGenerator', () => {
  let pattern: AlternativePhrasingGenerator;
  let mockContext: PatternContext;

  beforeEach(() => {
    pattern = new AlternativePhrasingGenerator();
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
      expect(pattern.id).toBe('alternative-phrasing-generator');
    });

    it('should have correct name', () => {
      expect(pattern.name).toBe('Alternative Phrasing Generator');
    });

    it('should be deep mode only', () => {
      expect(pattern.mode).toBe('deep');
    });

    it('should have priority 3 (VERY LOW - final touches)', () => {
      expect(pattern.priority).toBe(3);
    });

    it('should be applicable for many intents', () => {
      expect(pattern.applicableIntents).toContain('code-generation');
      expect(pattern.applicableIntents).toContain('planning');
      expect(pattern.applicableIntents).toContain('debugging');
      expect(pattern.applicableIntents).toContain('testing');
      expect(pattern.applicableIntents).toContain('migration');
      expect(pattern.applicableIntents).toContain('security-review');
      expect(pattern.applicableIntents).toContain('documentation');
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

    it('should return false for learning intent', () => {
      mockContext.intent.primaryIntent = 'learning';
      expect(pattern.isApplicable(mockContext)).toBe(false);
    });
  });

  describe('apply - code-generation alternatives', () => {
    it('should generate code alternatives', () => {
      mockContext.intent.primaryIntent = 'code-generation';
      const prompt = 'Create a user service';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
      expect(result.enhancedPrompt).toContain('Alternative Approaches');
    });

    it('should include functional decomposition approach', () => {
      mockContext.intent.primaryIntent = 'code-generation';
      const prompt = 'Create a data processor';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toContain('Functional Decomposition');
      }
    });

    it('should include test-driven approach', () => {
      mockContext.intent.primaryIntent = 'code-generation';
      const prompt = 'Create a service';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toContain('Test-Driven');
      }
    });

    it('should include example-driven approach', () => {
      mockContext.intent.primaryIntent = 'code-generation';
      const prompt = 'Create a function';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toContain('Example-Driven');
      }
    });
  });

  describe('apply - planning alternatives', () => {
    it('should generate planning alternatives', () => {
      mockContext.intent.primaryIntent = 'planning';
      const prompt = 'Plan the new feature';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
      expect(result.enhancedPrompt).toMatch(/Top-Down|User Story|Domain-Driven/i);
    });
  });

  describe('apply - debugging alternatives', () => {
    it('should generate debugging alternatives', () => {
      mockContext.intent.primaryIntent = 'debugging';
      const prompt = 'Fix the authentication bug';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
      expect(result.enhancedPrompt).toMatch(/Binary Search|Trace Analysis|Hypothesis/i);
    });
  });

  describe('apply - testing alternatives', () => {
    it('should generate testing alternatives', () => {
      mockContext.intent.primaryIntent = 'testing';
      const prompt = 'Write tests for payment service';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
      expect(result.enhancedPrompt).toMatch(/Behavior-Driven|Property-Based|Snapshot/i);
    });
  });

  describe('apply - migration alternatives', () => {
    it('should generate migration alternatives', () => {
      mockContext.intent.primaryIntent = 'migration';
      const prompt = 'Migrate to new database';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
      expect(result.enhancedPrompt).toMatch(/Big Bang|Strangler Fig|Parallel Running/i);
    });
  });

  describe('apply - security alternatives', () => {
    it('should generate security alternatives', () => {
      mockContext.intent.primaryIntent = 'security-review';
      const prompt = 'Review the API security';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
      expect(result.enhancedPrompt).toMatch(/Threat Modeling|OWASP|Attack Simulation/i);
    });
  });

  describe('apply - documentation alternatives', () => {
    it('should generate documentation alternatives', () => {
      mockContext.intent.primaryIntent = 'documentation';
      const prompt = 'Document the API endpoints';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
      expect(result.enhancedPrompt).toMatch(/Tutorial Style|Reference Format|Conceptual Overview/i);
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

    it('should have structure as improvement dimension', () => {
      const prompt = 'Create a module';
      const result = pattern.apply(prompt, mockContext);
      expect(result.improvement.dimension).toBe('structure');
    });

    it('should return medium impact when applied', () => {
      const prompt = 'Create a user service';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.improvement.impact).toBe('medium');
      }
    });

    it('should include "Best for" descriptions', () => {
      const prompt = 'Create a feature';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toContain('Best for:');
      }
    });

    it('should limit alternatives to 3', () => {
      const prompt = 'Create a service';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        const alternativeCount = (result.enhancedPrompt.match(/\*\*\d\./g) || []).length;
        expect(alternativeCount).toBeLessThanOrEqual(3);
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
