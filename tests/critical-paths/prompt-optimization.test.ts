/**
 * Critical Path Tests: Prompt Optimization Flow
 *
 * Tests the complete optimization pipeline:
 * Input -> Intent Detection -> Pattern Selection -> Pattern Application -> Quality Assessment -> Output
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// Mock dependencies
jest.unstable_mockModule('inquirer', () => ({
  default: {
    prompt: jest.fn().mockResolvedValue({ confirm: true }),
  },
}));

const { UniversalOptimizer } = await import('../../src/core/intelligence/universal-optimizer.js');
const { IntentDetector } = await import('../../src/core/intelligence/intent-detector.js');

describe('Critical Path: Prompt Optimization Flow', () => {
  let optimizer: InstanceType<typeof UniversalOptimizer>;

  beforeEach(() => {
    optimizer = new UniversalOptimizer();
    jest.clearAllMocks();
  });

  describe('end-to-end optimization flow', () => {
    it('should complete full optimization pipeline for simple prompt', async () => {
      const input = 'Create a login page';
      const result = await optimizer.optimize(input, 'fast');

      // Verify complete result structure
      expect(result).toHaveProperty('original', input);
      expect(result).toHaveProperty('enhanced');
      expect(result).toHaveProperty('intent');
      expect(result).toHaveProperty('quality');
      expect(result).toHaveProperty('improvements');
      expect(result).toHaveProperty('mode', 'fast');
      expect(result).toHaveProperty('processingTimeMs');

      // Enhanced should be different from original
      expect(result.enhanced.length).toBeGreaterThan(input.length);
    });

    it('should complete full optimization pipeline for complex prompt', async () => {
      const input = `
        Build a user authentication system with:
        - Email/password login
        - OAuth support for Google
        - Password reset functionality
        - Session management
      `;
      const result = await optimizer.optimize(input, 'deep');

      expect(result.original).toBe(input);
      expect(result.enhanced).toBeDefined();
      expect(result.mode).toBe('deep');
      expect(result.intent.primaryIntent).toBeDefined();
      expect(result.quality.overall).toBeDefined();
    });

    it('should preserve original prompt', async () => {
      const input = 'Fix the bug in the login form';
      const result = await optimizer.optimize(input, 'fast');

      expect(result.original).toBe(input);
      expect(result.original).not.toBe(result.enhanced);
    });
  });

  describe('intent detection stage', () => {
    let detector: InstanceType<typeof IntentDetector>;

    beforeEach(() => {
      detector = new IntentDetector();
    });

    it('should detect code-generation intent for creation prompts', () => {
      const prompts = [
        'Create a new dashboard',
        'Build a REST API',
        'Implement user authentication',
        'Add a search feature',
      ];

      for (const prompt of prompts) {
        const intent = detector.analyze(prompt);
        // These prompts should be detected as code-generation
        expect(intent.primaryIntent).toBe('code-generation');
      }
    });

    it('should detect debugging intent for fix prompts', () => {
      const prompts = [
        'Fix the login bug',
        'Debug the memory leak',
        'Fix this error: null pointer exception',
      ];

      for (const prompt of prompts) {
        const intent = detector.analyze(prompt);
        expect(intent.primaryIntent).toBe('debugging');
      }
    });

    it('should detect valid intents for different prompt types', () => {
      // Test that each prompt gets a valid intent type
      const prompts = [
        'Refactor the authentication module',
        'Make this code better',
        'Improve performance',
      ];

      const validIntents = [
        'code-generation',
        'refinement',
        'planning',
        'debugging',
        'documentation',
        'prd-generation',
      ];

      for (const prompt of prompts) {
        const intent = detector.analyze(prompt);
        expect(validIntents).toContain(intent.primaryIntent);
      }
    });

    it('should detect valid intents for explanation prompts', () => {
      const prompts = [
        'Explain how the routing works',
        'What does this function do',
        'Document this API',
      ];

      const validIntents = [
        'code-generation',
        'refinement',
        'planning',
        'debugging',
        'documentation',
        'prd-generation',
      ];

      for (const prompt of prompts) {
        const intent = detector.analyze(prompt);
        expect(validIntents).toContain(intent.primaryIntent);
      }
    });

    it('should provide confidence score', () => {
      const intent = detector.analyze('Create a user registration form');
      expect(intent.confidence).toBeDefined();
      expect(typeof intent.confidence).toBe('number');
      expect(intent.confidence).toBeGreaterThanOrEqual(0);
      expect(intent.confidence).toBeLessThanOrEqual(100);
    });

    it('should analyze characteristics', () => {
      const intent = detector.analyze('Build a TypeScript API with Express');
      expect(intent.characteristics).toBeDefined();
      expect(intent.characteristics).toHaveProperty('hasTechnicalTerms');
      expect(intent.characteristics).toHaveProperty('hasCodeContext');
      expect(intent.characteristics).toHaveProperty('isOpenEnded');
      expect(intent.characteristics).toHaveProperty('needsStructure');
    });
  });

  describe('quality assessment stage', () => {
    it('should assess quality of prompts with different characteristics', async () => {
      const simpleResult = await optimizer.optimize('make it better', 'fast');
      const detailedResult = await optimizer.optimize(
        'Add input validation to the email field in the registration form using React with TypeScript to ensure valid email format with proper error messages',
        'fast'
      );

      // Both should have quality assessments
      expect(simpleResult.quality.overall).toBeDefined();
      expect(detailedResult.quality.overall).toBeDefined();

      // Quality scores should be numbers between 0-100
      expect(typeof simpleResult.quality.overall).toBe('number');
      expect(typeof detailedResult.quality.overall).toBe('number');
    });

    it('should provide quality dimensions', async () => {
      const result = await optimizer.optimize('Create a todo app', 'fast');

      expect(result.quality).toHaveProperty('clarity');
      expect(result.quality).toHaveProperty('completeness');
      expect(result.quality).toHaveProperty('actionability');
    });

    it('should provide improvement suggestions', async () => {
      const result = await optimizer.optimize('fix it', 'fast');

      expect(result.improvements).toBeDefined();
      expect(Array.isArray(result.improvements)).toBe(true);
      expect(result.improvements.length).toBeGreaterThan(0);

      for (const improvement of result.improvements) {
        expect(improvement).toHaveProperty('dimension');
        expect(improvement).toHaveProperty('description');
      }
    });
  });

  describe('mode behavior', () => {
    it('fast mode should be quicker than deep mode', async () => {
      const prompt = 'Add authentication to the API';

      const fastStart = Date.now();
      await optimizer.optimize(prompt, 'fast');
      const fastTime = Date.now() - fastStart;

      const deepStart = Date.now();
      await optimizer.optimize(prompt, 'deep');
      const deepTime = Date.now() - deepStart;

      // Fast mode should be at least as fast or faster (allow some variance)
      expect(fastTime).toBeLessThanOrEqual(deepTime + 50);
    });

    it('deep mode should provide more detailed analysis', async () => {
      const prompt = 'Implement a caching layer';

      const fastResult = await optimizer.optimize(prompt, 'fast');
      const deepResult = await optimizer.optimize(prompt, 'deep');

      // Deep mode typically provides longer enhanced output
      expect(deepResult.enhanced.length).toBeGreaterThanOrEqual(fastResult.enhanced.length);
    });
  });

  describe('edge cases', () => {
    it('should handle very short prompts', async () => {
      const result = await optimizer.optimize('help', 'fast');
      expect(result.original).toBe('help');
      expect(result.enhanced).toBeDefined();
    });

    it('should handle prompts with special characters', async () => {
      const prompt = 'Parse JSON with "quotes" and {braces} and <tags>';
      const result = await optimizer.optimize(prompt, 'fast');
      expect(result.original).toBe(prompt);
      expect(result.enhanced).toBeDefined();
    });

    it('should handle prompts with code snippets', async () => {
      const prompt = 'Fix this: `function foo() { return bar; }`';
      const result = await optimizer.optimize(prompt, 'fast');
      expect(result.original).toBe(prompt);
      expect(result.enhanced).toBeDefined();
    });

    it('should handle multiline prompts', async () => {
      const prompt = `
        Line 1
        Line 2
        Line 3
      `;
      const result = await optimizer.optimize(prompt, 'fast');
      expect(result.original).toBe(prompt);
      expect(result.enhanced).toBeDefined();
    });

    it('should handle prompts with emojis', async () => {
      const prompt = 'Add a 👍 button to the post 📝';
      const result = await optimizer.optimize(prompt, 'fast');
      expect(result.original).toBe(prompt);
      expect(result.enhanced).toBeDefined();
    });
  });

  describe('processing time tracking', () => {
    it('should track processing time', async () => {
      const result = await optimizer.optimize('Create a form', 'fast');

      expect(result.processingTimeMs).toBeDefined();
      expect(typeof result.processingTimeMs).toBe('number');
      expect(result.processingTimeMs).toBeGreaterThanOrEqual(0);
    });

    it('should have reasonable processing time', async () => {
      const result = await optimizer.optimize('Build an API', 'fast');

      // Should complete in reasonable time (under 1 second for fast mode)
      expect(result.processingTimeMs).toBeLessThan(1000);
    });
  });
});
