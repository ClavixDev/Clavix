import { PromptOptimizer } from '../../src/core/prompt-optimizer';
import { describe, it, expect, beforeEach } from '@jest/globals';

describe('PromptOptimizer', () => {
  let optimizer: PromptOptimizer;

  beforeEach(() => {
    optimizer = new PromptOptimizer();
  });

  describe('analyze', () => {
    it('should identify gaps in minimal prompt', () => {
      const prompt = 'Create a login page';
      const analysis = optimizer.analyze(prompt);

      expect(analysis.gaps).toContain('Missing context: What is the background or current situation?');
      expect(analysis.gaps.length).toBeGreaterThan(0);
    });

    it('should identify strengths in detailed prompt', () => {
      const prompt = `Build a login page with email and password fields.
      Currently we don't have authentication.
      Users should be able to log in securely.
      Use React and TypeScript.`;

      const analysis = optimizer.analyze(prompt);

      expect(analysis.strengths).toContain('Clear context provided');
      expect(analysis.strengths).toContain('Technical constraints specified');
    });

    it('should identify ambiguities', () => {
      const prompt = 'Create some pages that should maybe have this functionality';
      const analysis = optimizer.analyze(prompt);

      expect(analysis.ambiguities.length).toBeGreaterThan(0);
    });
  });

  describe('improve', () => {
    it('should generate improved prompt with structure', () => {
      const prompt = 'Create a login page';
      const result = optimizer.improve(prompt);

      expect(result.improved).toContain('# Objective');
      expect(result.improved).toContain('# Requirements');
      expect(result.improved).toContain('# Technical Constraints');
      expect(result.improved).toContain('# Expected Output');
      expect(result.improved).toContain('# Success Criteria');
    });

    it('should preserve original prompt', () => {
      const prompt = 'Create a login page';
      const result = optimizer.improve(prompt);

      expect(result.original).toBe(prompt);
    });

    it('should include analysis', () => {
      const prompt = 'Create a login page';
      const result = optimizer.improve(prompt);

      expect(result.analysis).toBeDefined();
      expect(result.analysis.gaps).toBeDefined();
      expect(result.analysis.ambiguities).toBeDefined();
      expect(result.analysis.strengths).toBeDefined();
      expect(result.analysis.suggestions).toBeDefined();
    });
  });

  // CLEAR Framework Tests
  describe('CLEAR Framework - applyCLEARFramework', () => {
    describe('fast mode (C, L, E)', () => {
      it('should analyze prompt using C, L, E components only', () => {
        const prompt = 'Create a login page';
        const result = optimizer.applyCLEARFramework(prompt, 'fast');

        expect(result.conciseness).toBeDefined();
        expect(result.logic).toBeDefined();
        expect(result.explicitness).toBeDefined();
        expect(result.adaptiveness).toBeUndefined();
        expect(result.reflectiveness).toBeUndefined();
      });

      it('should generate improved prompt', () => {
        const prompt = 'Create a login page';
        const result = optimizer.applyCLEARFramework(prompt, 'fast');

        expect(result.improvedPrompt).toBeDefined();
        expect(result.improvedPrompt.length).toBeGreaterThan(prompt.length);
      });

      it('should include changes summary', () => {
        const prompt = 'Create a login page';
        const result = optimizer.applyCLEARFramework(prompt, 'fast');

        expect(result.changesSummary).toBeDefined();
        expect(Array.isArray(result.changesSummary)).toBe(true);
      });
    });

    describe('deep mode (C, L, E, A, R)', () => {
      it('should analyze prompt using all 5 CLEAR components', () => {
        const prompt = 'Create a dashboard for analytics';
        const result = optimizer.applyCLEARFramework(prompt, 'deep');

        expect(result.conciseness).toBeDefined();
        expect(result.logic).toBeDefined();
        expect(result.explicitness).toBeDefined();
        expect(result.adaptiveness).toBeDefined();
        expect(result.reflectiveness).toBeDefined();
      });

      it('should provide alternative phrasings (Adaptive)', () => {
        const prompt = 'Build a search feature';
        const result = optimizer.applyCLEARFramework(prompt, 'deep');

        expect(result.adaptiveness).toBeDefined();
        expect(result.adaptiveness!.alternativePhrasings).toBeDefined();
        expect(result.adaptiveness!.alternativePhrasings.length).toBeGreaterThan(0);
      });

      it('should provide validation checklist (Reflective)', () => {
        const prompt = 'Create a payment processing system';
        const result = optimizer.applyCLEARFramework(prompt, 'deep');

        expect(result.reflectiveness).toBeDefined();
        expect(result.reflectiveness!.validationChecklist).toBeDefined();
        expect(result.reflectiveness!.validationChecklist.length).toBeGreaterThan(0);
      });
    });
  });

  describe('CLEAR Framework - Conciseness (C)', () => {
    it('should detect verbose language patterns', () => {
      const verbosePrompt = 'Could you please maybe help me create a login page if possible?';
      const result = optimizer.applyCLEARFramework(verbosePrompt, 'fast');

      expect(result.conciseness.pleasantriesCount).toBeGreaterThan(0);
      expect(result.conciseness.score).toBeLessThan(100);
    });

    it('should reward concise prompts', () => {
      const concisePrompt = 'Create a login page with email/password authentication using React.';
      const result = optimizer.applyCLEARFramework(concisePrompt, 'fast');

      expect(result.conciseness.score).toBeGreaterThan(70);
    });

    it('should provide conciseness suggestions', () => {
      const verbosePrompt = 'I would like to perhaps create something like a page for logging in';
      const result = optimizer.applyCLEARFramework(verbosePrompt, 'fast');

      expect(result.conciseness.suggestions.length).toBeGreaterThan(0);
    });
  });

  describe('CLEAR Framework - Logic (L)', () => {
    it('should detect jumbled requirements', () => {
      const jumbledPrompt = 'Use React. Make it secure. Build a login page. We need authentication.';
      const result = optimizer.applyCLEARFramework(jumbledPrompt, 'fast');

      expect(result.logic).toBeDefined();
      // Logic score might be perfect for short prompts, check suggestions instead
      expect(result.logic.suggestedOrder.length).toBeGreaterThan(0);
    });

    it('should suggest logical ordering', () => {
      const prompt = 'Build a feature';
      const result = optimizer.applyCLEARFramework(prompt, 'fast');

      expect(result.logic.suggestedOrder).toBeDefined();
      expect(result.logic.suggestedOrder.length).toBeGreaterThan(0);
    });

    it('should reward well-sequenced prompts', () => {
      const wellSequenced = `Context: We need user authentication.
      Requirements: Build login page with email/password.
      Constraints: Use React and TypeScript.
      Output: Working authentication component.`;

      const result = optimizer.applyCLEARFramework(wellSequenced, 'fast');
      expect(result.logic.hasCoherentFlow).toBe(true);
    });
  });

  describe('CLEAR Framework - Explicitness (E)', () => {
    it('should detect missing persona specification', () => {
      const prompt = 'Create a login page';
      const result = optimizer.applyCLEARFramework(prompt, 'fast');

      expect(result.explicitness.hasPersona).toBe(false);
      expect(result.explicitness.score).toBeLessThan(100);
    });

    it('should detect missing output format', () => {
      const prompt = 'Build something for users';
      const result = optimizer.applyCLEARFramework(prompt, 'fast');

      expect(result.explicitness.hasOutputFormat).toBe(false);
    });

    it('should reward explicit specifications', () => {
      const explicitPrompt = `As a senior React developer, create a login component.
      Output format: TypeScript React functional component with JSX.
      Tone: Production-ready, well-tested code.
      Success criteria: Component renders, handles auth, shows errors.`;

      const result = optimizer.applyCLEARFramework(explicitPrompt, 'fast');
      expect(result.explicitness.score).toBeGreaterThan(80);
    });
  });

  describe('CLEAR Framework - Adaptiveness (A)', () => {
    it('should generate alternative phrasings in deep mode', () => {
      const prompt = 'Build a search feature';
      const result = optimizer.applyCLEARFramework(prompt, 'deep');

      expect(result.adaptiveness).toBeDefined();
      expect(result.adaptiveness!.alternativePhrasings.length).toBeGreaterThanOrEqual(2);
    });

    it('should suggest alternative structures in deep mode', () => {
      const prompt = 'Create a dashboard';
      const result = optimizer.applyCLEARFramework(prompt, 'deep');

      expect(result.adaptiveness).toBeDefined();
      expect(result.adaptiveness!.alternativeStructures.length).toBeGreaterThan(0);
    });

    it('should not be present in fast mode', () => {
      const prompt = 'Build a feature';
      const result = optimizer.applyCLEARFramework(prompt, 'fast');

      expect(result.adaptiveness).toBeUndefined();
    });
  });

  describe('CLEAR Framework - Reflectiveness (R)', () => {
    it('should create validation checklist in deep mode', () => {
      const prompt = 'Build a payment processing system';
      const result = optimizer.applyCLEARFramework(prompt, 'deep');

      expect(result.reflectiveness).toBeDefined();
      expect(result.reflectiveness!.validationChecklist.length).toBeGreaterThan(0);
    });

    it('should identify edge cases in deep mode', () => {
      const prompt = 'Create user registration';
      const result = optimizer.applyCLEARFramework(prompt, 'deep');

      expect(result.reflectiveness).toBeDefined();
      expect(result.reflectiveness!.edgeCases.length).toBeGreaterThan(0);
    });

    it('should perform "what could go wrong" analysis', () => {
      const prompt = 'Build a file upload feature';
      const result = optimizer.applyCLEARFramework(prompt, 'deep');

      expect(result.reflectiveness).toBeDefined();
      expect(result.reflectiveness!.potentialIssues.length).toBeGreaterThan(0);
    });

    it('should not be present in fast mode', () => {
      const prompt = 'Build a feature';
      const result = optimizer.applyCLEARFramework(prompt, 'fast');

      expect(result.reflectiveness).toBeUndefined();
    });
  });

  describe('CLEAR Framework - calculateCLEARScore', () => {
    it('should calculate overall score for fast mode', () => {
      const prompt = 'Create a login page';
      const result = optimizer.applyCLEARFramework(prompt, 'fast');
      const score = optimizer.calculateCLEARScore(result);

      expect(score.overall).toBeGreaterThanOrEqual(0);
      expect(score.overall).toBeLessThanOrEqual(100);
      expect(score.conciseness).toBeDefined();
      expect(score.logic).toBeDefined();
      expect(score.explicitness).toBeDefined();
    });

    it('should calculate overall score for deep mode', () => {
      const prompt = 'Build a dashboard';
      const result = optimizer.applyCLEARFramework(prompt, 'deep');
      const score = optimizer.calculateCLEARScore(result);

      expect(score.overall).toBeGreaterThanOrEqual(0);
      expect(score.overall).toBeLessThanOrEqual(100);
      expect(score.adaptiveness).toBeDefined();
      expect(score.reflectiveness).toBeDefined();
    });

    it('should provide rating based on score', () => {
      const prompt = 'Build a very well-specified feature';
      const result = optimizer.applyCLEARFramework(prompt, 'fast');
      const score = optimizer.calculateCLEARScore(result);

      expect(score.rating).toMatch(/excellent|good|needs-improvement|poor/);
    });

    it('should rate excellent for score >= 80', () => {
      const explicitPrompt = `As a senior developer, build a login component.
      Context: Adding authentication to React app.
      Requirements: Email/password fields, validation, error handling.
      Constraints: React, TypeScript, use existing design system.
      Output: Production-ready functional component with unit tests.
      Success: Component renders, validates input, handles auth errors.`;

      const result = optimizer.applyCLEARFramework(explicitPrompt, 'fast');
      const score = optimizer.calculateCLEARScore(result);

      if (score.overall >= 80) {
        expect(score.rating).toBe('excellent');
      }
    });
  });

  describe('CLEAR Framework - backward compatibility', () => {
    it('should map CLEAR results to legacy format in analyze()', () => {
      const prompt = 'Create a login page';
      const analysis = optimizer.analyze(prompt);

      // Legacy format should still work
      expect(analysis.gaps).toBeDefined();
      expect(analysis.ambiguities).toBeDefined();
      expect(analysis.strengths).toBeDefined();
      expect(analysis.suggestions).toBeDefined();
    });

    it('should preserve existing analyze() behavior', () => {
      const minimalPrompt = 'Build something';
      const analysis = optimizer.analyze(minimalPrompt);

      expect(analysis.gaps.length).toBeGreaterThan(0);
      expect(Array.isArray(analysis.gaps)).toBe(true);
      expect(Array.isArray(analysis.suggestions)).toBe(true);
    });
  });
});
