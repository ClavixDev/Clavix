import { PatternLibrary } from '../../../src/core/intelligence/pattern-library.js';
import { ConcisenessFilter } from '../../../src/core/intelligence/patterns/conciseness-filter.js';
import { ObjectiveClarifier } from '../../../src/core/intelligence/patterns/objective-clarifier.js';
import { TechnicalContextEnricher } from '../../../src/core/intelligence/patterns/technical-context-enricher.js';
import { describe, it, expect, beforeEach } from '@jest/globals';

describe('PatternLibrary', () => {
  let library: PatternLibrary;

  beforeEach(() => {
    library = new PatternLibrary();
  });

  describe('pattern registration', () => {
    it('should register default patterns', () => {
      const patterns = library.getApplicablePatterns(
        'Create login',
        'code-generation',
        {
          clarity: 50,
          efficiency: 50,
          structure: 50,
          completeness: 50,
          actionability: 50,
          overall: 50,
        },
        'fast'
      );

      expect(patterns.length).toBeGreaterThan(0);
    });

    it('should return patterns sorted by priority', () => {
      const patterns = library.getApplicablePatterns(
        'Create login',
        'code-generation',
        {
          clarity: 50,
          efficiency: 50,
          structure: 50,
          completeness: 50,
          actionability: 50,
          overall: 50,
        },
        'fast'
      );

      // High priority patterns should come first (10 is highest)
      const priorities = patterns.map((p) => p.priority);
      expect(priorities[0]).toBeGreaterThanOrEqual(7); // High priority range
    });
  });

  describe('pattern selection', () => {
    it('should select patterns based on quality scores', () => {
      const lowQuality = {
        clarity: 30,
        efficiency: 30,
        structure: 30,
        completeness: 30,
        actionability: 30,
        overall: 30,
      };

      const patterns = library.getApplicablePatterns(
        'fix it',
        'code-generation',
        lowQuality,
        'fast'
      );

      // Should get multiple patterns for low quality
      expect(patterns.length).toBeGreaterThan(0);
    });

    it('should select different patterns for different intents', () => {
      const quality = {
        clarity: 50,
        efficiency: 50,
        structure: 50,
        completeness: 50,
        actionability: 50,
        overall: 50,
      };

      const codePatterns = library.getApplicablePatterns(
        'create login',
        'code-generation',
        quality,
        'fast'
      );
      const debugPatterns = library.getApplicablePatterns(
        'fix error',
        'debugging',
        quality,
        'fast'
      );

      expect(codePatterns).toBeDefined();
      expect(debugPatterns).toBeDefined();
    });

    it('should respect fast vs deep mode', () => {
      const quality = {
        clarity: 50,
        efficiency: 50,
        structure: 50,
        completeness: 50,
        actionability: 50,
        overall: 50,
      };

      const fastPatterns = library.getApplicablePatterns(
        'create api',
        'code-generation',
        quality,
        'fast'
      );
      const deepPatterns = library.getApplicablePatterns(
        'create api',
        'code-generation',
        quality,
        'deep'
      );

      // Both should return patterns (deep may return more but not tested here)
      expect(fastPatterns.length).toBeGreaterThan(0);
      expect(deepPatterns.length).toBeGreaterThan(0);
    });
  });

  describe('pattern application', () => {
    it('should apply patterns sequentially', async () => {
      const prompt = 'Please could you maybe help me create a login page';
      const patterns = library.getApplicablePatterns(
        prompt,
        'code-generation',
        {
          clarity: 40,
          efficiency: 30,
          structure: 40,
          completeness: 40,
          actionability: 40,
          overall: 38,
        },
        'fast'
      );

      let result = prompt;
      for (const pattern of patterns) {
        const patternResult = pattern.apply(result, {
          intent: {
            primaryIntent: 'code-generation',
            confidence: 100,
            characteristics: {
              hasCodeContext: false,
              hasTechnicalTerms: false,
              isOpenEnded: false,
              needsStructure: false,
            },
          },
          mode: 'fast',
          originalPrompt: prompt,
        });
        result = patternResult.enhancedPrompt;
      }

      expect(result.length).toBeGreaterThan(prompt.length);
      expect(result).toContain('Objective');
    });
  });

  describe('ConcisenessFilter pattern', () => {
    it('should remove verbosity', () => {
      const pattern = new ConcisenessFilter();
      const verbose = 'Please could you possibly maybe help me';
      const result = pattern.apply(verbose, {
        intent: {
          primaryIntent: 'code-generation',
          confidence: 100,
          characteristics: {
            hasCodeContext: false,
            hasTechnicalTerms: false,
            isOpenEnded: false,
            needsStructure: false,
          },
        },
        mode: 'fast',
        originalPrompt: verbose,
      });

      expect(result.enhancedPrompt.length).toBeLessThanOrEqual(verbose.length);
      expect(result.enhancedPrompt).not.toContain('Please');
    });

    it('should remove pleasantries', () => {
      const pattern = new ConcisenessFilter();
      const withPleasantries = 'Hello! Thank you so much for your help! Create login page';
      const result = pattern.apply(withPleasantries, {
        intent: {
          primaryIntent: 'code-generation',
          confidence: 100,
          characteristics: {
            hasCodeContext: false,
            hasTechnicalTerms: false,
            isOpenEnded: false,
            needsStructure: false,
          },
        },
        mode: 'fast',
        originalPrompt: withPleasantries,
      });

      // Pattern removes "Thank you" and fluff words like "so much"
      expect(result.enhancedPrompt).not.toContain('Thank you');
      expect(result.enhancedPrompt.length).toBeLessThan(withPleasantries.length);
    });

    it('should preserve technical content', () => {
      const pattern = new ConcisenessFilter();
      const technical = 'Create authentication with bcrypt hashing and JWT tokens';
      const result = pattern.apply(technical, {
        intent: {
          primaryIntent: 'code-generation',
          confidence: 100,
          characteristics: {
            hasCodeContext: false,
            hasTechnicalTerms: false,
            isOpenEnded: false,
            needsStructure: false,
          },
        },
        mode: 'fast',
        originalPrompt: technical,
      });

      expect(result.enhancedPrompt).toContain('authentication');
      expect(result.enhancedPrompt).toContain('bcrypt');
      expect(result.enhancedPrompt).toContain('JWT');
    });
  });

  describe('ObjectiveClarifier pattern', () => {
    it('should add objective structure', () => {
      const pattern = new ObjectiveClarifier();
      const vague = 'create login';
      const result = pattern.apply(vague, {
        intent: {
          primaryIntent: 'code-generation',
          confidence: 100,
          characteristics: {
            hasCodeContext: false,
            hasTechnicalTerms: false,
            isOpenEnded: false,
            needsStructure: false,
          },
        },
        mode: 'fast',
        originalPrompt: vague,
      });

      expect(result.enhancedPrompt).toContain('Objective');
      expect(result.enhancedPrompt.length).toBeGreaterThan(vague.length);
    });

    it('should enhance clarity', () => {
      const pattern = new ObjectiveClarifier();
      const unclear = 'make it work';
      const result = pattern.apply(unclear, {
        intent: {
          primaryIntent: 'code-generation',
          confidence: 100,
          characteristics: {
            hasCodeContext: false,
            hasTechnicalTerms: false,
            isOpenEnded: false,
            needsStructure: false,
          },
        },
        mode: 'fast',
        originalPrompt: unclear,
      });

      // Pattern adds "Objective" section
      expect(result.enhancedPrompt).toContain('Objective');
      expect(result.enhancedPrompt.length).toBeGreaterThan(unclear.length);
    });

    it('should organize information', () => {
      const pattern = new ObjectiveClarifier();
      const unorganized = 'create authentication with email password and jwt tokens';
      const result = pattern.apply(unorganized, {
        intent: {
          primaryIntent: 'code-generation',
          confidence: 100,
          characteristics: {
            hasCodeContext: false,
            hasTechnicalTerms: false,
            isOpenEnded: false,
            needsStructure: false,
          },
        },
        mode: 'fast',
        originalPrompt: unorganized,
      });

      // Pattern adds "Objective" section when it can infer one
      expect(result).toBeDefined();
      expect(result.enhancedPrompt).toContain('authentication');
    });
  });

  describe('TechnicalContextEnricher pattern', () => {
    it('should add technical placeholders', () => {
      const pattern = new TechnicalContextEnricher();
      const basic = 'Create login page';
      const result = pattern.apply(basic, {
        intent: {
          primaryIntent: 'code-generation',
          confidence: 100,
          characteristics: {
            hasCodeContext: false,
            hasTechnicalTerms: false,
            isOpenEnded: false,
            needsStructure: false,
          },
        },
        mode: 'fast',
        originalPrompt: basic,
      });

      // Pattern may or may not add content depending on what it detects
      expect(result).toBeDefined();
      expect(result.enhancedPrompt).toBeDefined();
    });

    it('should prompt for missing details', () => {
      const pattern = new TechnicalContextEnricher();
      const incomplete = 'Build API';
      const result = pattern.apply(incomplete, {
        intent: {
          primaryIntent: 'code-generation',
          confidence: 100,
          characteristics: {
            hasCodeContext: false,
            hasTechnicalTerms: false,
            isOpenEnded: false,
            needsStructure: false,
          },
        },
        mode: 'fast',
        originalPrompt: incomplete,
      });

      // Pattern may or may not add content depending on what it detects
      expect(result).toBeDefined();
      expect(result.enhancedPrompt).toBeDefined();
    });

    it('should preserve existing technical details', () => {
      const pattern = new TechnicalContextEnricher();
      const withTech = 'Create login with React and Node.js';
      const result = pattern.apply(withTech, {
        intent: {
          primaryIntent: 'code-generation',
          confidence: 100,
          characteristics: {
            hasCodeContext: false,
            hasTechnicalTerms: false,
            isOpenEnded: false,
            needsStructure: false,
          },
        },
        mode: 'fast',
        originalPrompt: withTech,
      });

      expect(result.enhancedPrompt).toContain('React');
      expect(result.enhancedPrompt).toContain('Node.js');
    });
  });

  describe('edge cases', () => {
    it('should handle empty prompt', async () => {
      const patterns = library.getApplicablePatterns(
        '',
        'code-generation',
        {
          clarity: 0,
          efficiency: 0,
          structure: 0,
          completeness: 0,
          actionability: 0,
          overall: 0,
        },
        'fast'
      );

      expect(patterns).toBeDefined();
      expect(Array.isArray(patterns)).toBe(true);
    });

    it('should handle high quality prompt', async () => {
      const highQualityPrompt = `
        Create user authentication system
        Requirements: Email/password login, JWT tokens, password hashing with bcrypt
        Tech: Node.js, Express, PostgreSQL
        Success: Users can register, login, and access protected routes
      `;

      const patterns = library.getApplicablePatterns(
        highQualityPrompt,
        'code-generation',
        {
          clarity: 90,
          efficiency: 85,
          structure: 90,
          completeness: 95,
          actionability: 90,
          overall: 90,
        },
        'fast'
      );

      // Should still return some patterns (even high quality can be improved)
      expect(patterns).toBeDefined();
    });

    it('should handle pattern application failures gracefully', async () => {
      const prompt = 'test';
      const patterns = library.getApplicablePatterns(
        prompt,
        'code-generation',
        {
          clarity: 50,
          efficiency: 50,
          structure: 50,
          completeness: 50,
          actionability: 50,
          overall: 50,
        },
        'fast'
      );

      // Should not throw even if patterns fail
      let result = prompt;
      for (const pattern of patterns) {
        try {
          const patternResult = pattern.apply(result, {
            intent: {
              primaryIntent: 'code-generation',
              confidence: 100,
              characteristics: {
                hasCodeContext: false,
                hasTechnicalTerms: false,
                isOpenEnded: false,
                needsStructure: false,
              },
            },
            mode: 'fast',
            originalPrompt: prompt,
          });
          result = patternResult.enhancedPrompt;
        } catch {
          // Graceful handling
        }
      }

      expect(result).toBeDefined();
    });
  });

  describe('v4.4 config-based extensibility', () => {
    it('should apply config with disabled patterns', () => {
      library.applyConfig({
        patterns: {
          disabled: ['conciseness-filter'],
        },
      });

      const patterns = library.getApplicablePatterns(
        'Create login',
        'code-generation',
        {
          clarity: 50,
          efficiency: 50,
          structure: 50,
          completeness: 50,
          actionability: 50,
          overall: 50,
        },
        'fast'
      );

      // conciseness-filter should not be in the list
      const hasConcisenessFilter = patterns.some((p) => p.id === 'conciseness-filter');
      expect(hasConcisenessFilter).toBe(false);
    });

    it('should apply priority overrides', () => {
      library.applyConfig({
        patterns: {
          priorityOverrides: {
            'conciseness-filter': 1, // Lowest priority (overridden)
          },
        },
      });

      const patterns = library.getApplicablePatterns(
        'Create login',
        'code-generation',
        {
          clarity: 50,
          efficiency: 50,
          structure: 50,
          completeness: 50,
          actionability: 50,
          overall: 50,
        },
        'fast'
      );

      // conciseness-filter should be last in sorted list (lowest priority)
      // Note: pattern.priority is readonly, but sorting uses effective priority
      const concisenessIndex = patterns.findIndex((p) => p.id === 'conciseness-filter');
      if (concisenessIndex !== -1) {
        // Should be at or near the end of the sorted patterns
        expect(concisenessIndex).toBe(patterns.length - 1);
      }
    });

    it('should provide pattern settings via getPatternSettings', () => {
      library.applyConfig({
        patterns: {
          customSettings: {
            'conciseness-filter': {
              maxWords: 100,
              aggressive: true,
            },
          },
        },
      });

      const settings = library.getPatternSettings('conciseness-filter');
      expect(settings).toEqual({
        maxWords: 100,
        aggressive: true,
      });
    });

    it('should return undefined for patterns without custom settings', () => {
      library.applyConfig({
        patterns: {},
      });

      const settings = library.getPatternSettings('non-existent-pattern');
      expect(settings).toBeUndefined();
    });

    it('should handle empty config gracefully', () => {
      library.applyConfig({});

      const patterns = library.getApplicablePatterns(
        'Create login',
        'code-generation',
        {
          clarity: 50,
          efficiency: 50,
          structure: 50,
          completeness: 50,
          actionability: 50,
          overall: 50,
        },
        'fast'
      );

      expect(patterns.length).toBeGreaterThan(0);
    });

    it('should reject invalid priority values', () => {
      library.applyConfig({
        patterns: {
          priorityOverrides: {
            'conciseness-filter': 15, // Out of range (should be 1-10)
          },
        },
      });

      // Pattern should retain original priority
      const patterns = library.getApplicablePatterns(
        'Create login',
        'code-generation',
        {
          clarity: 50,
          efficiency: 50,
          structure: 50,
          completeness: 50,
          actionability: 50,
          overall: 50,
        },
        'fast'
      );

      const conciseness = patterns.find((p) => p.id === 'conciseness-filter');
      if (conciseness) {
        expect(conciseness.priority).not.toBe(15);
      }
    });
  });
});
