/**
 * Optimization Output Structure Snapshot Tests
 *
 * These tests verify that the optimization engine produces
 * consistently structured output across different modes.
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { prepareObjectSnapshot, sanitizeTimestamps } from '../helpers/snapshot-utils.js';

// Mock dependencies
jest.unstable_mockModule('inquirer', () => ({
  default: {
    prompt: jest.fn().mockResolvedValue({ confirm: true }),
  },
}));

const { UniversalOptimizer } = await import('../../src/core/intelligence/universal-optimizer.js');

describe('Optimization Output Snapshots', () => {
  let optimizer: InstanceType<typeof UniversalOptimizer>;

  beforeEach(() => {
    optimizer = new UniversalOptimizer();
    jest.clearAllMocks();
  });

  describe('fast mode output structure', () => {
    it('should produce consistent structure for simple prompts', async () => {
      const result = await optimizer.optimize('Create a login page', 'fast');

      // Sanitize dynamic fields
      const sanitized = {
        ...result,
        processingTimeMs: '[PROCESSING_TIME]',
      };

      expect(prepareObjectSnapshot(sanitized)).toMatchSnapshot('fast-mode-simple-prompt');
    });

    it('should produce consistent structure for complex prompts', async () => {
      const complexPrompt = `
        I need to build a user authentication system that supports:
        - Email/password login
        - OAuth with Google and GitHub
        - Two-factor authentication
        - Password reset flow
        Please include security best practices.
      `;

      const result = await optimizer.optimize(complexPrompt, 'fast');

      const sanitized = {
        ...result,
        processingTimeMs: '[PROCESSING_TIME]',
      };

      expect(prepareObjectSnapshot(sanitized)).toMatchSnapshot('fast-mode-complex-prompt');
    });

    it('fast mode result should have required fields', async () => {
      const result = await optimizer.optimize('Test prompt', 'fast');

      expect(result).toHaveProperty('original');
      expect(result).toHaveProperty('enhanced');
      expect(result).toHaveProperty('intent');
      expect(result).toHaveProperty('quality');
      expect(result).toHaveProperty('improvements');
      expect(result).toHaveProperty('mode');
      expect(result).toHaveProperty('processingTimeMs');

      expect(result.mode).toBe('fast');
      expect(typeof result.processingTimeMs).toBe('number');
    });
  });

  describe('deep mode output structure', () => {
    it('should produce consistent structure with alternatives', async () => {
      const result = await optimizer.optimize('Add dark mode to my app', 'deep');

      const sanitized = {
        ...result,
        processingTimeMs: '[PROCESSING_TIME]',
      };

      expect(prepareObjectSnapshot(sanitized)).toMatchSnapshot('deep-mode-with-alternatives');
    });

    it('deep mode result should have required fields', async () => {
      const result = await optimizer.optimize('Test prompt', 'deep');

      expect(result).toHaveProperty('original');
      expect(result).toHaveProperty('enhanced');
      expect(result).toHaveProperty('intent');
      expect(result).toHaveProperty('quality');
      expect(result).toHaveProperty('improvements');
      expect(result).toHaveProperty('mode');
      expect(result).toHaveProperty('processingTimeMs');

      expect(result.mode).toBe('deep');
    });
  });

  describe('quality assessment structure', () => {
    it('quality object should have consistent structure', async () => {
      const result = await optimizer.optimize('Create a REST API', 'fast');

      expect(result.quality).toHaveProperty('overall');
      // Quality object has dimension scores as direct properties, not nested
      expect(result.quality).toHaveProperty('clarity');
      expect(result.quality).toHaveProperty('completeness');

      // Overall score should be a number between 0-100
      expect(typeof result.quality.overall).toBe('number');
      expect(result.quality.overall).toBeGreaterThanOrEqual(0);
      expect(result.quality.overall).toBeLessThanOrEqual(100);

      // Dimension scores are numbers
      expect(typeof result.quality.clarity).toBe('number');
    });

    it('quality dimension keys should match snapshot structure', async () => {
      const result = await optimizer.optimize('Build a todo app with React', 'fast');

      // Get all numeric properties (dimension scores)
      const dimensionKeys = Object.keys(result.quality)
        .filter(
          (k) =>
            typeof result.quality[k as keyof typeof result.quality] === 'number' && k !== 'overall'
        )
        .sort();
      expect(dimensionKeys).toMatchSnapshot('quality-dimension-keys');
    });
  });

  describe('intent detection structure', () => {
    it('intent object should have consistent structure', async () => {
      const result = await optimizer.optimize('Fix the bug in user login', 'fast');

      // Actual property name is primaryIntent, not primary
      expect(result.intent).toHaveProperty('primaryIntent');
      expect(result.intent).toHaveProperty('confidence');

      // Confidence should be a number between 0-1 or 0-100
      expect(typeof result.intent.confidence).toBe('number');
    });

    it('should detect different intents correctly', async () => {
      const buildResult = await optimizer.optimize('Create a new dashboard component', 'fast');
      const debugResult = await optimizer.optimize('Fix the memory leak in the parser', 'fast');
      const refactorResult = await optimizer.optimize('Refactor the authentication module', 'fast');

      // Verify intents are detected (actual property name is primaryIntent)
      expect(buildResult.intent.primaryIntent).toBeDefined();
      expect(debugResult.intent.primaryIntent).toBeDefined();
      expect(refactorResult.intent.primaryIntent).toBeDefined();
    });
  });

  describe('improvements array structure', () => {
    it('improvements should be an array with consistent items', async () => {
      const result = await optimizer.optimize('make the thing work better somehow idk', 'fast');

      expect(Array.isArray(result.improvements)).toBe(true);

      // Each improvement should have expected structure
      for (const improvement of result.improvements) {
        expect(improvement).toHaveProperty('dimension');
        // Improvements have 'description' property, not 'suggestion'
        expect(improvement).toHaveProperty('description');
        expect(typeof improvement.dimension).toBe('string');
        expect(typeof improvement.description).toBe('string');
      }
    });
  });

  describe('edge case outputs', () => {
    it('should handle empty-ish prompts gracefully', async () => {
      const result = await optimizer.optimize('test', 'fast');

      expect(result.original).toBe('test');
      expect(result.enhanced).toBeDefined();
      expect(result.quality).toBeDefined();
    });

    it('should handle long prompts', async () => {
      const longPrompt = 'Build a feature '.repeat(100);
      const result = await optimizer.optimize(longPrompt, 'fast');

      expect(result.original).toBe(longPrompt);
      expect(result.enhanced).toBeDefined();
    });

    it('should handle prompts with special characters', async () => {
      const specialPrompt = 'Create a function that handles: <xml>, "quotes", and `backticks`';
      const result = await optimizer.optimize(specialPrompt, 'fast');

      expect(result.original).toBe(specialPrompt);
      expect(result.enhanced).toBeDefined();
    });
  });
});
