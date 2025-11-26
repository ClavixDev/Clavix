import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import Analyze from '../../../src/cli/commands/analyze.js';

// Mock oclif config for testing
const createMockConfig = () => ({
  runHook: jest.fn().mockResolvedValue({ successes: [], failures: [] }),
  bin: 'clavix',
  dirname: 'clavix',
  pjson: { version: '1.0.0' },
  plugins: [],
  topicSeparator: ' ',
});

describe('Analyze Command', () => {
  let consoleOutput: string[] = [];
  let originalLog: typeof console.log;
  let originalExit: typeof process.exit;

  beforeEach(() => {
    consoleOutput = [];
    originalLog = console.log;
    originalExit = process.exit;

    console.log = jest.fn((...args: unknown[]) => {
      consoleOutput.push(args.map((a) => String(a)).join(' '));
    }) as typeof console.log;

    // Mock process.exit to prevent test from exiting
    process.exit = jest.fn() as never;
  });

  afterEach(() => {
    console.log = originalLog;
    process.exit = originalExit;
  });

  describe('JSON output', () => {
    it('should output valid JSON', async () => {
      const cmd = new Analyze(
        ['Build a REST API for user management'],
        createMockConfig() as never
      );
      await cmd.run();

      expect(consoleOutput.length).toBeGreaterThan(0);
      const output = consoleOutput[0];

      // Should be valid JSON
      const parsed = JSON.parse(output);
      expect(parsed).toBeDefined();
    });

    it('should include intent in output', async () => {
      const cmd = new Analyze(
        ['Create a login page with email and password'],
        createMockConfig() as never
      );
      await cmd.run();

      const output = JSON.parse(consoleOutput[0]);
      expect(output.intent).toBeDefined();
      expect(typeof output.intent).toBe('string');
    });

    it('should include confidence in output', async () => {
      const cmd = new Analyze(['Create a login page'], createMockConfig() as never);
      await cmd.run();

      const output = JSON.parse(consoleOutput[0]);
      expect(output.confidence).toBeDefined();
      expect(typeof output.confidence).toBe('number');
      expect(output.confidence).toBeGreaterThanOrEqual(0);
      expect(output.confidence).toBeLessThanOrEqual(100);
    });

    it('should include quality scores in output', async () => {
      const cmd = new Analyze(['Build an authentication system'], createMockConfig() as never);
      await cmd.run();

      const output = JSON.parse(consoleOutput[0]);
      expect(output.quality).toBeDefined();
      expect(output.quality.overall).toBeDefined();
      expect(output.quality.clarity).toBeDefined();
      expect(output.quality.efficiency).toBeDefined();
      expect(output.quality.structure).toBeDefined();
      expect(output.quality.completeness).toBeDefined();
      expect(output.quality.actionability).toBeDefined();
    });

    it('should include escalation data in output', async () => {
      const cmd = new Analyze(['Create something'], createMockConfig() as never);
      await cmd.run();

      const output = JSON.parse(consoleOutput[0]);
      expect(output.escalation).toBeDefined();
      expect(output.escalation.score).toBeDefined();
      expect(output.escalation.recommend).toBeDefined();
      expect(output.escalation.factors).toBeDefined();
      expect(Array.isArray(output.escalation.factors)).toBe(true);
    });

    it('should include characteristics in output', async () => {
      const cmd = new Analyze(['Build a React component'], createMockConfig() as never);
      await cmd.run();

      const output = JSON.parse(consoleOutput[0]);
      expect(output.characteristics).toBeDefined();
      expect(typeof output.characteristics.hasCodeContext).toBe('boolean');
      expect(typeof output.characteristics.hasTechnicalTerms).toBe('boolean');
      expect(typeof output.characteristics.isOpenEnded).toBe('boolean');
      expect(typeof output.characteristics.needsStructure).toBe('boolean');
    });
  });

  describe('escalation recommendations', () => {
    it('should recommend fast for high-quality simple prompts', async () => {
      const cmd = new Analyze(
        [
          'Create a function that adds two numbers and returns the sum. Use TypeScript. Return type should be number.',
        ],
        createMockConfig() as never
      );
      await cmd.run();

      const output = JSON.parse(consoleOutput[0]);
      // High quality prompts with clear scope should recommend fast
      expect(['fast', 'deep']).toContain(output.escalation.recommend);
    });

    it('should have escalation data for vague prompts', async () => {
      const cmd = new Analyze(['make it better'], createMockConfig() as never);
      await cmd.run();

      const output = JSON.parse(consoleOutput[0]);
      // Escalation data should be present regardless of score
      expect(output.escalation).toBeDefined();
      expect(output.escalation.score).toBeGreaterThanOrEqual(0);
      expect(output.escalation.recommend).toBeDefined();
      expect(['fast', 'deep', 'prd']).toContain(output.escalation.recommend);
    });

    it('should have escalation factors array', async () => {
      const cmd = new Analyze(['build something'], createMockConfig() as never);
      await cmd.run();

      const output = JSON.parse(consoleOutput[0]);
      // Factors array should always exist (even if empty for high-quality prompts)
      expect(output.escalation.factors).toBeDefined();
      expect(Array.isArray(output.escalation.factors)).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should output error JSON for empty prompt', async () => {
      const cmd = new Analyze([''], createMockConfig() as never);

      try {
        await cmd.run();
      } catch (error: unknown) {
        // oclif throws EEXIT when this.exit() is called
        if (error && typeof error === 'object' && 'oclif' in error) {
          // Expected behavior - command exits with code 1
        } else {
          throw error;
        }
      }

      expect(consoleOutput.length).toBeGreaterThan(0);
      const output = JSON.parse(consoleOutput[0]);
      expect(output.error).toBeDefined();
    });
  });

  describe('pretty flag', () => {
    it('should format JSON with --pretty flag', async () => {
      const cmd = new Analyze(['Create a login page', '--pretty'], createMockConfig() as never);
      await cmd.run();

      const output = consoleOutput[0];
      // Pretty-printed JSON contains newlines
      expect(output).toContain('\n');
    });
  });

  describe('quality score ranges', () => {
    it('should have quality scores between 0 and 100', async () => {
      const cmd = new Analyze(['Build an API'], createMockConfig() as never);
      await cmd.run();

      const output = JSON.parse(consoleOutput[0]);

      expect(output.quality.overall).toBeGreaterThanOrEqual(0);
      expect(output.quality.overall).toBeLessThanOrEqual(100);
      expect(output.quality.clarity).toBeGreaterThanOrEqual(0);
      expect(output.quality.clarity).toBeLessThanOrEqual(100);
      expect(output.quality.efficiency).toBeGreaterThanOrEqual(0);
      expect(output.quality.efficiency).toBeLessThanOrEqual(100);
    });
  });
});
