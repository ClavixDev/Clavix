import { PromptOptimizer } from '../../src/core/prompt-optimizer';
import { describe, it, expect, beforeEach } from '@jest/globals';

/**
 * Integration test for improve workflow
 * Tests the complete prompt analysis and improvement pipeline
 */
describe('Improve Workflow Integration', () => {
  let optimizer: PromptOptimizer;

  beforeEach(() => {
    optimizer = new PromptOptimizer();
  });

  describe('complete improvement workflow', () => {
    it('should analyze and improve a minimal prompt', () => {
      const prompt = 'Create a login page';
      const result = optimizer.improve(prompt);

      // Should analyze the prompt
      expect(result.analysis).toBeDefined();
      expect(result.analysis.gaps.length).toBeGreaterThan(0);
      expect(result.analysis.suggestions.length).toBeGreaterThan(0);

      // Should preserve original
      expect(result.original).toBe(prompt);

      // Should generate improved version
      expect(result.improved).toBeDefined();
      expect(result.improved.length).toBeGreaterThan(prompt.length);

      // Should have structured sections
      expect(result.improved).toContain('# Objective');
      expect(result.improved).toContain('# Requirements');
      expect(result.improved).toContain('# Technical Constraints');
      expect(result.improved).toContain('# Expected Output');
      expect(result.improved).toContain('# Success Criteria');
    });

    it('should identify gaps and provide comprehensive analysis', () => {
      const vaguePrompt = 'Build something';
      const result = optimizer.improve(vaguePrompt);

      // Should identify many gaps
      expect(result.analysis.gaps.length).toBeGreaterThan(3);

      // Should provide suggestions
      expect(result.analysis.suggestions.length).toBeGreaterThan(0);
    });

    it('should recognize strengths in detailed prompts', () => {
      const detailedPrompt = `
Build a user authentication system.

Context:
We currently have no authentication in our React app.

Requirements:
- Email/password login
- JWT token management
- Secure password hashing

Technical Constraints:
- Use React with TypeScript
- Integrate with our Express backend
- Follow OWASP security guidelines

Success Criteria:
- Users can securely log in
- Tokens expire after 24 hours
- All tests pass
      `.trim();

      const result = optimizer.improve(detailedPrompt);

      // Should identify strengths
      expect(result.analysis.strengths.length).toBeGreaterThan(0);

      // Improved version should be structured
      expect(result.improved).toContain('# Objective');
    });

    it('should be deterministic - same input produces same output', () => {
      const prompt = 'Create a dashboard with analytics';

      const result1 = optimizer.improve(prompt);
      const result2 = optimizer.improve(prompt);

      // Exact same analysis
      expect(result1.analysis.gaps).toEqual(result2.analysis.gaps);
      expect(result1.analysis.ambiguities).toEqual(result2.analysis.ambiguities);
      expect(result1.analysis.strengths).toEqual(result2.analysis.strengths);
      expect(result1.analysis.suggestions).toEqual(result2.analysis.suggestions);

      // Exact same improved prompt
      expect(result1.improved).toBe(result2.improved);
    });

    it('should handle edge cases gracefully', () => {
      // Empty prompt
      const emptyResult = optimizer.improve('');
      expect(emptyResult.analysis).toBeDefined();

      // Very short prompt
      const shortResult = optimizer.improve('test');
      expect(shortResult.analysis).toBeDefined();
      expect(shortResult.improved).toContain('# Objective');

      // Very long prompt
      const longPrompt = 'Create a system '.repeat(100);
      const longResult = optimizer.improve(longPrompt);
      expect(longResult.analysis).toBeDefined();

      // Special characters
      const specialPrompt = 'Create <Component> with {props} and [state]';
      const specialResult = optimizer.improve(specialPrompt);
      expect(specialResult.improved).toBeDefined();

      // Code in prompt
      const codePrompt = 'Create function like: const fn = () => {}';
      const codeResult = optimizer.improve(codePrompt);
      expect(codeResult.improved).toBeDefined();
    });

    it('should provide actionable suggestions', () => {
      const prompt = 'Make a website';
      const result = optimizer.improve(prompt);

      // Suggestions should be specific and actionable
      result.analysis.suggestions.forEach((suggestion) => {
        expect(suggestion.length).toBeGreaterThan(10);
        expect(typeof suggestion).toBe('string');
      });

      // Should identify what's missing
      expect(result.analysis.gaps.length).toBeGreaterThan(0);
    });

    it('should handle multi-line prompts correctly', () => {
      const multiLinePrompt = `
Create a todo application.
It should have the following features:
- Add tasks
- Mark as complete
- Delete tasks
- Filter by status
      `.trim();

      const result = optimizer.improve(multiLinePrompt);

      expect(result.original).toContain('todo application');
      expect(result.improved).toContain('# Objective');
      expect(result.analysis).toBeDefined();
    });

    it('should improve prompts with technical jargon', () => {
      const technicalPrompt = 'Build a GraphQL API with Apollo Server';
      const result = optimizer.improve(technicalPrompt);

      // Should recognize technical constraints
      expect(result.analysis.strengths.some((s) => s.includes('Technical constraints'))).toBe(true);

      // Should still identify gaps
      expect(result.analysis.gaps.length).toBeGreaterThan(0);

      // Improved version should preserve technical details
      expect(result.improved.toLowerCase()).toContain('graphql');
      expect(result.improved.toLowerCase()).toContain('apollo');
    });

    it('should handle prompts with numbers and metrics', () => {
      const metricsPrompt = 'Build an API that handles 1000 requests per second';
      const result = optimizer.improve(metricsPrompt);

      // Should preserve metrics
      expect(result.improved).toContain('1000');

      // Should have proper structure
      expect(result.improved).toContain('# Objective');
    });

    it('should provide comprehensive improvements for business requirements', () => {
      const businessPrompt = 'Create a payment processing system for our e-commerce store';
      const result = optimizer.improve(businessPrompt);

      // Should identify need for security details
      expect(result.analysis.gaps.some((g) => g.toLowerCase().includes('security') ||
                                             g.toLowerCase().includes('constraint'))).toBe(true);

      // Should suggest considering edge cases
      expect(result.analysis.suggestions.length).toBeGreaterThan(0);

      // Improved version should have proper structure
      expect(result.improved).toContain('# Objective');
      expect(result.improved).toContain('# Requirements');
      expect(result.improved).toContain('# Success Criteria');
    });
  });

  describe('analysis quality', () => {
    it('should provide balanced analysis', () => {
      const mixedPrompt = 'Build a React dashboard. Use TypeScript. Should be fast.';
      const result = optimizer.improve(mixedPrompt);

      // Should have both strengths and gaps
      expect(result.analysis.strengths.length).toBeGreaterThan(0);
      expect(result.analysis.gaps.length).toBeGreaterThan(0);
    });

    it('should categorize issues correctly', () => {
      const ambiguousPrompt = 'Create some pages that might have features';
      const result = optimizer.improve(ambiguousPrompt);

      // Should detect ambiguity
      expect(result.analysis.ambiguities.length).toBeGreaterThan(0);

      // Ambiguities should contain vague terms
      const allAmbiguities = result.analysis.ambiguities.join(' ').toLowerCase();
      expect(allAmbiguities.includes('some') || allAmbiguities.includes('might')).toBe(true);
    });
  });
});
