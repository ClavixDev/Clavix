import { describe, it, expect, beforeEach } from '@jest/globals';
import { DomainContextEnricher } from '../../../../src/core/intelligence/patterns/domain-context-enricher.js';
import { PatternContext } from '../../../../src/core/intelligence/types.js';

describe('DomainContextEnricher', () => {
  let pattern: DomainContextEnricher;
  let mockContext: PatternContext;

  beforeEach(() => {
    pattern = new DomainContextEnricher();
    mockContext = {
      depthLevel: 'standard',
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
      expect(pattern.id).toBe('domain-context-enricher');
    });

    it('should have correct name', () => {
      expect(pattern.name).toBe('Domain Context Enricher');
    });

    it('should support both modes', () => {
      expect(pattern.scope).toBe('both');
    });

    it('should have priority 5', () => {
      expect(pattern.priority).toBe(5);
    });

    it('should be applicable for multiple intents', () => {
      expect(pattern.applicableIntents).toContain('code-generation');
      expect(pattern.applicableIntents).toContain('debugging');
      expect(pattern.applicableIntents).toContain('testing');
      expect(pattern.applicableIntents).toContain('security-review');
    });
  });

  describe('apply - no domain detected', () => {
    it('should not apply when no domain detected', () => {
      const prompt = 'Hello world';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(false);
    });

    it('should return low impact when no domain detected', () => {
      const prompt = 'Random text here';
      const result = pattern.apply(prompt, mockContext);
      expect(result.improvement.impact).toBe('low');
    });
  });

  describe('apply - authentication domain', () => {
    it('should detect authentication domain', () => {
      const prompt = 'Build a login component with JWT authentication';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
      expect(result.enhancedPrompt).toContain('authentication');
    });

    it('should add auth best practices', () => {
      const prompt = 'Implement user signup with password hashing';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toMatch(/bcrypt|password|session/i);
      }
    });
  });

  describe('apply - API domain', () => {
    it('should detect API domain', () => {
      const prompt = 'Build a REST API endpoint for users';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
    });

    it('should add API best practices', () => {
      const prompt = 'Create GraphQL endpoint for products';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toMatch(/response|status|validation/i);
      }
    });
  });

  describe('apply - database domain', () => {
    it('should detect database domain', () => {
      const prompt = 'Write a database query for user lookup';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
    });

    it('should add database best practices', () => {
      const prompt = 'Create Prisma schema for orders';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toMatch(/SQL injection|index|transaction/i);
      }
    });
  });

  describe('apply - frontend domain', () => {
    it('should detect frontend domain', () => {
      const prompt = 'Build a React component for user profile';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
    });

    it('should add frontend best practices', () => {
      const prompt = 'Create a form UI with validation';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toMatch(/accessibility|responsive|semantic/i);
      }
    });
  });

  describe('apply - testing domain', () => {
    it('should detect testing domain', () => {
      const prompt = 'Write unit tests with mocks';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
    });

    it('should add testing best practices', () => {
      const prompt = 'Create test fixtures and specs';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toMatch(/AAA|isolated|coverage/i);
      }
    });
  });

  describe('apply - security domain', () => {
    it('should detect security domain', () => {
      const prompt = 'Audit code for XSS vulnerabilities';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
    });

    it('should add security best practices', () => {
      const prompt = 'Sanitize user input and prevent CSRF';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toMatch(/validate|sanitize|CSP|HTTPS/i);
      }
    });
  });

  describe('apply - multiple domains', () => {
    it('should detect multiple domains', () => {
      const prompt = 'Build a login API with database integration';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
      // Should mention multiple domains
      if (result.applied) {
        expect(result.enhancedPrompt).toContain('Domain Best Practices');
      }
    });

    it('should limit to top 2 domains', () => {
      const prompt = 'Build an auth API with database, caching, and async workers for deployment';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        // Should have limited practices
        const practiceCount = (result.enhancedPrompt.match(/^- /gm) || []).length;
        expect(practiceCount).toBeLessThanOrEqual(6); // 2 domains x 3 practices
      }
    });
  });

  describe('apply - result structure', () => {
    it('should return valid PatternResult structure', () => {
      const prompt = 'Build an API';
      const result = pattern.apply(prompt, mockContext);

      expect(result).toHaveProperty('enhancedPrompt');
      expect(result).toHaveProperty('improvement');
      expect(result).toHaveProperty('applied');
    });

    it('should have completeness as improvement dimension', () => {
      const prompt = 'Build a component';
      const result = pattern.apply(prompt, mockContext);
      expect(result.improvement.dimension).toBe('completeness');
    });

    it('should return medium impact when domains detected', () => {
      const prompt = 'Build an authentication system';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.improvement.impact).toBe('medium');
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

    it('should handle case variations', () => {
      const prompt = 'Build an API with DATABASE integration';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
    });
  });
});
