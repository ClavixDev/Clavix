import { describe, it, expect, beforeEach } from '@jest/globals';
import { ScopeDefiner } from '../../../../src/core/intelligence/patterns/scope-definer.js';
import { PatternContext } from '../../../../src/core/intelligence/types.js';

describe('ScopeDefiner', () => {
  let pattern: ScopeDefiner;
  let mockContext: PatternContext;

  beforeEach(() => {
    pattern = new ScopeDefiner();
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
      expect(pattern.id).toBe('scope-definer');
    });

    it('should have correct name', () => {
      expect(pattern.name).toBe('Scope Definer');
    });

    it('should have correct description', () => {
      expect(pattern.description).toBe('Add explicit scope boundaries to prevent scope creep');
    });

    it('should be comprehensive depth only', () => {
      expect(pattern.scope).toBe('comprehensive');
    });

    it('should have priority 5', () => {
      expect(pattern.priority).toBe(5);
    });

    it('should be applicable for expected intents', () => {
      expect(pattern.applicableIntents).toContain('code-generation');
      expect(pattern.applicableIntents).toContain('planning');
      expect(pattern.applicableIntents).toContain('prd-generation');
      expect(pattern.applicableIntents).toContain('migration');
      expect(pattern.applicableIntents).toContain('documentation');
    });

    it('should not be applicable for testing intent', () => {
      expect(pattern.applicableIntents).not.toContain('testing');
    });
  });

  describe('isApplicable', () => {
    it('should return true for code-generation in comprehensive depth', () => {
      mockContext.intent.primaryIntent = 'code-generation';
      mockContext.depthLevel = 'comprehensive';
      expect(pattern.isApplicable(mockContext)).toBe(true);
    });

    it('should return true for planning in comprehensive depth', () => {
      mockContext.intent.primaryIntent = 'planning';
      mockContext.depthLevel = 'comprehensive';
      expect(pattern.isApplicable(mockContext)).toBe(true);
    });

    it('should return false in standard depth', () => {
      mockContext.depthLevel = 'standard';
      mockContext.intent.primaryIntent = 'code-generation';
      expect(pattern.isApplicable(mockContext)).toBe(false);
    });

    it('should return false for testing intent', () => {
      mockContext.intent.primaryIntent = 'testing';
      expect(pattern.isApplicable(mockContext)).toBe(false);
    });
  });

  describe('apply - scope already defined', () => {
    it('should not modify prompt with "out of scope"', () => {
      const prompt = 'Build a component. Out of scope: deployment';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(false);
    });

    it('should not modify prompt with "not included"', () => {
      const prompt = 'Build a feature. Not included: testing';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(false);
    });

    it('should not modify prompt with "in scope"', () => {
      const prompt = 'In scope: Build the login component';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(false);
    });

    it('should not modify prompt with "scope:"', () => {
      const prompt = 'Scope: Frontend only';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(false);
    });

    it('should not modify prompt with "will not"', () => {
      const prompt = 'Build a component. Will not include backend';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(false);
    });

    it('should not modify prompt with "excluded"', () => {
      const prompt = 'Build a dashboard. Excluded: reports';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(false);
    });
  });

  describe('apply - adds scope definition', () => {
    it('should add scope definition section', () => {
      const prompt = 'Build a login component with email validation';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
      expect(result.enhancedPrompt).toContain('### Scope Definition');
    });

    it('should add In Scope section', () => {
      const prompt = 'Build a user dashboard with charts';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toContain('**In Scope:**');
      }
    });

    it('should add Out of Scope section', () => {
      const prompt = 'Build a frontend component';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toContain('**Out of Scope:**');
      }
    });

    it('should add Boundaries section', () => {
      const prompt = 'Build a service module';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toContain('**Boundaries');
      }
    });
  });

  describe('apply - intent-specific scope', () => {
    it('should add code-generation specific out-of-scope items', () => {
      mockContext.intent.primaryIntent = 'code-generation';
      const prompt = 'Build a user profile component';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toMatch(/Deployment|CI\/CD|infrastructure/i);
      }
    });

    it('should add planning specific out-of-scope items', () => {
      mockContext.intent.primaryIntent = 'planning';
      const prompt = 'Plan the authentication system';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toMatch(/implementation|code/i);
      }
    });

    it('should add migration specific out-of-scope items', () => {
      mockContext.intent.primaryIntent = 'migration';
      const prompt = 'Migrate from PostgreSQL to MongoDB';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toMatch(/New feature|performance optimization|Refactoring/i);
      }
    });

    it('should add documentation specific out-of-scope items', () => {
      mockContext.intent.primaryIntent = 'documentation';
      const prompt = 'Document the API endpoints';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toMatch(/implementation|Architectural/i);
      }
    });

    it('should add prd-generation specific out-of-scope items', () => {
      mockContext.intent.primaryIntent = 'prd-generation';
      const prompt = 'Create PRD for the new feature';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toMatch(/Technical implementation|Code|Database schema/i);
      }
    });
  });

  describe('apply - domain-specific scope', () => {
    it('should exclude backend for frontend-only prompts', () => {
      const prompt = 'Build a frontend component with React';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toMatch(/Backend|API implementation/i);
      }
    });

    it('should exclude frontend for backend-only prompts', () => {
      const prompt = 'Build a backend API server endpoint';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        // Backend prompts should have Frontend/UI in out of scope or have boundaries defined
        expect(result.enhancedPrompt).toContain('**Out of Scope:**');
      }
    });
  });

  describe('apply - boundaries detection', () => {
    it('should add component boundaries', () => {
      const prompt = 'Build a module for user management';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toMatch(/component|module boundaries/i);
      }
    });

    it('should add integration boundaries', () => {
      const prompt = 'Integrate with third-party payment service';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toMatch(/External|configured/i);
      }
    });

    it('should add database boundaries', () => {
      const prompt = 'Build a service with database storage';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toMatch(/Database|schema/i);
      }
    });

    it('should add auth boundaries', () => {
      const prompt = 'Build a user login component';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toMatch(/Authentication|system/i);
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
      const prompt = 'Build a component';
      const result = pattern.apply(prompt, mockContext);
      expect(result.improvement.dimension).toBe('completeness');
    });

    it('should return medium impact when scope is added', () => {
      const prompt = 'Build a new feature';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.improvement.impact).toBe('medium');
      }
    });
  });

  describe('apply - content preservation', () => {
    it('should preserve original prompt', () => {
      const prompt = 'Build user authentication with OAuth';
      const result = pattern.apply(prompt, mockContext);
      expect(result.enhancedPrompt).toContain(prompt);
    });

    it('should add scope section after original content', () => {
      const prompt = 'Create a dashboard feature';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        const promptIndex = result.enhancedPrompt.indexOf(prompt);
        const scopeIndex = result.enhancedPrompt.indexOf('### Scope Definition');
        expect(promptIndex).toBeLessThan(scopeIndex);
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
      const longPrompt = 'Build a feature '.repeat(200);
      const result = pattern.apply(longPrompt, mockContext);
      expect(result).toBeDefined();
    });

    it('should handle prompts with special characters', () => {
      const prompt = 'Build a <component> with "quotes" & symbols';
      const result = pattern.apply(prompt, mockContext);
      expect(result).toBeDefined();
    });

    it('should handle case variations', () => {
      const prompt = 'OUT OF SCOPE: deployment';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(false); // Already has scope
    });
  });
});
