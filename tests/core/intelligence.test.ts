
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { UniversalOptimizer } from '../../src/core/intelligence/universal-optimizer.js';
import { PromptFixtures } from '../helpers/intelligence-helpers.js';
import { PatternLibrary } from '../../src/core/intelligence/pattern-library.js';
import { IntentDetector } from '../../src/core/intelligence/intent-detector.js';
import { QualityAssessor } from '../../src/core/intelligence/quality-assessor.js';

// Mocks
jest.mock('../../src/core/intelligence/intent-detector.js');
jest.mock('../../src/core/intelligence/pattern-library.js');
jest.mock('../../src/core/intelligence/quality-assessor.js');

describe('UniversalOptimizer', () => {
  let optimizer: UniversalOptimizer;
  let mockIntentDetector: any;
  let mockPatternLibrary: any;
  let mockQualityAssessor: any;

  beforeEach(() => {
    // Setup mocks
    mockIntentDetector = {
      analyze: jest.fn().mockReturnValue({
        primaryIntent: 'feature',
        confidence: 0.8,
        characteristics: { isOpenEnded: false, needsStructure: true }
      })
    };

    mockPatternLibrary = {
      selectPatterns: jest.fn().mockReturnValue([
        {
          id: 'test-pattern',
          name: 'Test Pattern',
          description: 'Adds test content',
          apply: jest.fn().mockReturnValue({
            applied: true,
            enhancedPrompt: 'Enhanced Prompt',
            improvement: {
              type: 'structure',
              description: 'Added structure',
              impact: 'high'
            }
          }),
          getPatternCount: jest.fn().mockReturnValue(1),
          getPatternsByMode: jest.fn().mockReturnValue([])
        }
      ]),
      getPatternCount: jest.fn().mockReturnValue(1),
      getPatternsByMode: jest.fn().mockReturnValue([])
    };

    mockQualityAssessor = {
      assess: jest.fn().mockReturnValue({
        overall: 85,
        clarity: 80,
        specificity: 85,
        context: 80,
        completeness: 80
      })
    };

    optimizer = new UniversalOptimizer(
      mockIntentDetector,
      mockPatternLibrary,
      mockQualityAssessor
    );
  });

  describe('optimize', () => {
    it('should optimize a short prompt', async () => {
      const result = await optimizer.optimize(PromptFixtures.short.content, 'fast');

      expect(result.original).toBe(PromptFixtures.short.content);
      expect(result.enhanced).toBe('Enhanced Prompt');
      expect(result.improvements.length).toBe(1);
      expect(mockIntentDetector.analyze).toHaveBeenCalledWith(PromptFixtures.short.content);
      expect(mockPatternLibrary.selectPatterns).toHaveBeenCalled();
    });

    it('should handle pattern failures gracefully', async () => {
      // Suppress expected console.error for this test
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const failingPattern = {
        id: 'fail',
        name: 'Fail',
        apply: jest.fn().mockImplementation(() => { throw new Error('Pattern failed'); })
      };

      mockPatternLibrary.selectPatterns.mockReturnValue([failingPattern]);

      const result = await optimizer.optimize('test', 'fast');

      expect(result.enhanced).toBe('test'); // Unchanged
      expect(result.improvements.length).toBe(0);
      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Error applying pattern'), expect.any(Error));
      // Should not throw

      consoleErrorSpy.mockRestore();
    });

    it('should optimize unstructured prompts', async () => {
      const result = await optimizer.optimize(PromptFixtures.longUnstructured.content, 'deep');
      
      expect(result.mode).toBe('deep');
      expect(mockQualityAssessor.assess).toHaveBeenCalled();
    });

    it('should calculate processing time', async () => {
      const result = await optimizer.optimize('test', 'fast');
      expect(result.processingTimeMs).toBeGreaterThanOrEqual(0);
    });
  });

  describe('shouldRecommendDeepMode', () => {
    it('should recommend deep mode for planning tasks', () => {
      const result: any = {
        intent: { primaryIntent: 'planning' },
        quality: { overall: 80 },
        original: 'test'
      };
      expect(optimizer.shouldRecommendDeepMode(result)).toBe(true);
    });

    it('should recommend deep mode for low quality results', () => {
      const result: any = {
        intent: { primaryIntent: 'feature' },
        quality: { overall: 60 },
        original: 'test'
      };
      expect(optimizer.shouldRecommendDeepMode(result)).toBe(true);
    });

    it('should recommend deep mode for open ended unstructured tasks', () => {
      const result: any = {
        intent: { 
          primaryIntent: 'feature',
          characteristics: { isOpenEnded: true, needsStructure: true }
        },
        quality: { overall: 80 },
        original: 'test'
      };
      expect(optimizer.shouldRecommendDeepMode(result)).toBe(true);
    });

    it('should NOT recommend deep mode for high quality simple tasks', () => {
      const result: any = {
        intent: { 
          primaryIntent: 'feature',
          characteristics: { isOpenEnded: false, needsStructure: false }
        },
        quality: { overall: 90 },
        original: 'simple test'
      };
      expect(optimizer.shouldRecommendDeepMode(result)).toBe(false);
    });
  });

  describe('getRecommendation', () => {
    it('should suggest deep mode if criteria met', () => {
      // Mock internal method to return true
      jest.spyOn(optimizer, 'shouldRecommendDeepMode').mockReturnValue(true);
      
      const result: any = { mode: 'fast', quality: { overall: 60 } };
      const rec = optimizer.getRecommendation(result);
      
      expect(rec).toContain('/clavix:deep');
    });

    it('should praise excellent quality', () => {
      const result: any = { mode: 'fast', quality: { overall: 95 } };
      // Mock shouldRecommendDeepMode to false
      jest.spyOn(optimizer, 'shouldRecommendDeepMode').mockReturnValue(false);
      
      const rec = optimizer.getRecommendation(result);
      expect(rec).toContain('Excellent');
    });
  });

  describe('getStatistics', () => {
    it('should return stats from library', () => {
      const stats = optimizer.getStatistics();
      expect(stats.totalPatterns).toBe(1);
      expect(mockPatternLibrary.getPatternsByMode).toHaveBeenCalledTimes(2); // fast and deep
    });
  });
});
