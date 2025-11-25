import { describe, it, expect, beforeEach } from '@jest/globals';
import { ConcisenessFilter } from '../../../../src/core/intelligence/patterns/conciseness-filter.js';
import { PatternContext } from '../../../../src/core/intelligence/types.js';

describe('ConcisenessFilter', () => {
  let filter: ConcisenessFilter;
  let mockContext: PatternContext;

  beforeEach(() => {
    filter = new ConcisenessFilter();
    mockContext = {
      mode: 'fast',
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
      expect(filter.id).toBe('conciseness-filter');
    });

    it('should have correct name', () => {
      expect(filter.name).toBe('Conciseness Filter');
    });

    it('should have correct description', () => {
      expect(filter.description).toBe(
        'Removes unnecessary pleasantries, fluff words, and redundancy'
      );
    });

    it('should support both fast and deep modes', () => {
      expect(filter.mode).toBe('both');
    });

    it('should have priority 4 (LOW - polish phase)', () => {
      expect(filter.priority).toBe(4);
    });

    it('should be applicable for all main intents', () => {
      expect(filter.applicableIntents).toContain('code-generation');
      expect(filter.applicableIntents).toContain('planning');
      expect(filter.applicableIntents).toContain('refinement');
      expect(filter.applicableIntents).toContain('debugging');
      expect(filter.applicableIntents).toContain('documentation');
    });
  });

  describe('isApplicable', () => {
    it('should return true for code-generation intent', () => {
      mockContext.intent.primaryIntent = 'code-generation';
      expect(filter.isApplicable(mockContext)).toBe(true);
    });

    it('should return true for planning intent', () => {
      mockContext.intent.primaryIntent = 'planning';
      expect(filter.isApplicable(mockContext)).toBe(true);
    });

    it('should return true for debugging intent', () => {
      mockContext.intent.primaryIntent = 'debugging';
      expect(filter.isApplicable(mockContext)).toBe(true);
    });

    it('should return false for prd-generation intent', () => {
      mockContext.intent.primaryIntent = 'prd-generation';
      expect(filter.isApplicable(mockContext)).toBe(false);
    });
  });

  describe('apply - pleasantries removal', () => {
    it('should remove "please" at start', () => {
      const result = filter.apply('Please build a function', mockContext);
      expect(result.enhancedPrompt).not.toMatch(/^please\s/i);
      expect(result.applied).toBe(true);
    });

    it('should remove "could you"', () => {
      const result = filter.apply('Could you build a function', mockContext);
      expect(result.enhancedPrompt.toLowerCase()).not.toContain('could you');
      expect(result.applied).toBe(true);
    });

    it('should remove "would you mind"', () => {
      const result = filter.apply('Would you mind building a function', mockContext);
      expect(result.enhancedPrompt.toLowerCase()).not.toContain('would you mind');
      expect(result.applied).toBe(true);
    });

    it('should remove "I would appreciate if you could"', () => {
      const result = filter.apply('I would appreciate if you could build a function', mockContext);
      expect(result.enhancedPrompt.toLowerCase()).not.toContain('i would appreciate if you could');
      expect(result.applied).toBe(true);
    });

    it('should remove "kindly"', () => {
      const result = filter.apply('Kindly build a function', mockContext);
      expect(result.enhancedPrompt.toLowerCase()).not.toContain('kindly');
      expect(result.applied).toBe(true);
    });

    it('should remove "thank you"', () => {
      const result = filter.apply('Build a function. Thank you', mockContext);
      expect(result.enhancedPrompt.toLowerCase()).not.toContain('thank you');
      expect(result.applied).toBe(true);
    });

    it('should remove "thanks in advance"', () => {
      const result = filter.apply('Build a function. Thanks in advance', mockContext);
      expect(result.enhancedPrompt.toLowerCase()).not.toContain('thanks in advance');
      expect(result.applied).toBe(true);
    });

    it('should remove "I appreciate your help"', () => {
      const result = filter.apply('Build a function. I appreciate your help', mockContext);
      expect(result.enhancedPrompt.toLowerCase()).not.toContain('i appreciate your help');
      expect(result.applied).toBe(true);
    });
  });

  describe('apply - fluff word removal', () => {
    it('should remove "very"', () => {
      const result = filter.apply('Build a very fast function', mockContext);
      expect(result.enhancedPrompt).not.toMatch(/\bvery\b/i);
      expect(result.applied).toBe(true);
    });

    it('should remove "really"', () => {
      const result = filter.apply('Build a really good function', mockContext);
      expect(result.enhancedPrompt).not.toMatch(/\breally\b/i);
      expect(result.applied).toBe(true);
    });

    it('should remove "just"', () => {
      const result = filter.apply('I just need a function', mockContext);
      expect(result.enhancedPrompt).not.toMatch(/\bjust\b/i);
      expect(result.applied).toBe(true);
    });

    it('should remove "basically"', () => {
      const result = filter.apply('Basically, build a function', mockContext);
      expect(result.enhancedPrompt).not.toMatch(/\bbasically\b/i);
      expect(result.applied).toBe(true);
    });

    it('should remove "simply"', () => {
      const result = filter.apply('Simply build a function', mockContext);
      expect(result.enhancedPrompt).not.toMatch(/\bsimply\b/i);
      expect(result.applied).toBe(true);
    });

    it('should remove "actually"', () => {
      const result = filter.apply('Actually, I need a function', mockContext);
      expect(result.enhancedPrompt).not.toMatch(/\bactually\b/i);
      expect(result.applied).toBe(true);
    });

    it('should remove "literally"', () => {
      const result = filter.apply('I literally need a function', mockContext);
      expect(result.enhancedPrompt).not.toMatch(/\bliterally\b/i);
      expect(result.applied).toBe(true);
    });

    it('should remove multiple fluff words', () => {
      const result = filter.apply('I just really need a very good function', mockContext);
      expect(result.enhancedPrompt).not.toMatch(/\bjust\b/i);
      expect(result.enhancedPrompt).not.toMatch(/\breally\b/i);
      expect(result.enhancedPrompt).not.toMatch(/\bvery\b/i);
      expect(result.applied).toBe(true);
    });
  });

  describe('apply - redundant phrase replacement', () => {
    it('should replace "in order to" with "to"', () => {
      const result = filter.apply('Build a function in order to process data', mockContext);
      expect(result.enhancedPrompt).toContain('to process data');
      expect(result.enhancedPrompt).not.toContain('in order to');
    });

    it('should replace "at this point in time" with "now"', () => {
      const result = filter.apply('At this point in time, I need a function', mockContext);
      expect(result.enhancedPrompt.toLowerCase()).toContain('now');
      expect(result.enhancedPrompt.toLowerCase()).not.toContain('at this point in time');
    });

    it('should replace "due to the fact that" with "because"', () => {
      const result = filter.apply('Build a function due to the fact that we need it', mockContext);
      expect(result.enhancedPrompt.toLowerCase()).toContain('because');
      expect(result.enhancedPrompt.toLowerCase()).not.toContain('due to the fact that');
    });

    it('should replace "for the purpose of" with "for"', () => {
      const result = filter.apply('Build a function for the purpose of processing', mockContext);
      expect(result.enhancedPrompt).toContain('for processing');
      expect(result.enhancedPrompt).not.toContain('for the purpose of');
    });

    it('should replace "in the event that" with "if"', () => {
      const result = filter.apply('Handle errors in the event that they occur', mockContext);
      expect(result.enhancedPrompt.toLowerCase()).toContain('if');
      expect(result.enhancedPrompt.toLowerCase()).not.toContain('in the event that');
    });
  });

  describe('apply - whitespace cleanup', () => {
    it('should clean up extra whitespace after removals', () => {
      const result = filter.apply('I  just  really  need  a  function', mockContext);
      expect(result.enhancedPrompt).not.toContain('  ');
    });

    it('should trim leading whitespace', () => {
      const result = filter.apply('   Build a function', mockContext);
      expect(result.enhancedPrompt).not.toMatch(/^\s/);
    });

    it('should trim trailing whitespace', () => {
      const result = filter.apply('Build a function   ', mockContext);
      expect(result.enhancedPrompt).not.toMatch(/\s$/);
    });
  });

  describe('apply - no changes needed', () => {
    it('should return applied: false when prompt is already concise', () => {
      const result = filter.apply('Build a user authentication function', mockContext);
      expect(result.applied).toBe(false);
      expect(result.enhancedPrompt).toBe('Build a user authentication function');
    });

    it('should preserve technical content', () => {
      const result = filter.apply('Create a REST API endpoint', mockContext);
      expect(result.enhancedPrompt).toBe('Create a REST API endpoint');
    });
  });

  describe('apply - impact levels', () => {
    it('should return low impact for 0-1 changes', () => {
      const result = filter.apply('Just build a function', mockContext);
      expect(result.improvement.impact).toBe('low');
    });

    it('should return medium impact for 2-3 changes', () => {
      const result = filter.apply('Please just really build a function', mockContext);
      expect(['medium', 'high']).toContain(result.improvement.impact);
    });

    it('should return high impact for 4+ changes', () => {
      const result = filter.apply(
        'Please could you just really basically build a very nice function. Thank you.',
        mockContext
      );
      expect(result.improvement.impact).toBe('high');
    });
  });

  describe('apply - edge cases', () => {
    it('should handle empty string', () => {
      const result = filter.apply('', mockContext);
      expect(result.enhancedPrompt).toBe('');
      expect(result.applied).toBe(false);
    });

    it('should handle string with only fluff words', () => {
      const result = filter.apply('just really very', mockContext);
      expect(result.enhancedPrompt.trim()).toBe('');
      expect(result.applied).toBe(true);
    });

    it('should handle very long prompts', () => {
      const longPrompt = 'Please just build a function that '.repeat(100);
      const result = filter.apply(longPrompt, mockContext);
      expect(result.applied).toBe(true);
    });

    it('should preserve "justice" (contains "just")', () => {
      const result = filter.apply('Build a justice system', mockContext);
      expect(result.enhancedPrompt).toContain('justice');
    });

    it('should handle case variations', () => {
      const result = filter.apply('PLEASE Build a VERY good function', mockContext);
      expect(result.applied).toBe(true);
    });

    it('should handle multiple occurrences of same word', () => {
      const result = filter.apply('very very very fast', mockContext);
      expect(result.enhancedPrompt).not.toMatch(/\bvery\b/i);
      expect(result.applied).toBe(true);
    });
  });

  describe('apply - result structure', () => {
    it('should return valid PatternResult structure', () => {
      const result = filter.apply('Please build something', mockContext);

      expect(result).toHaveProperty('enhancedPrompt');
      expect(result).toHaveProperty('improvement');
      expect(result).toHaveProperty('applied');
      expect(result.improvement).toHaveProperty('dimension');
      expect(result.improvement).toHaveProperty('description');
      expect(result.improvement).toHaveProperty('impact');
    });

    it('should have efficiency as improvement dimension', () => {
      const result = filter.apply('Please build something', mockContext);
      expect(result.improvement.dimension).toBe('efficiency');
    });

    it('should include count in description', () => {
      const result = filter.apply('Please just build', mockContext);
      expect(result.improvement.description).toMatch(/\d+/);
    });
  });

  describe('apply - complex scenarios', () => {
    it('should handle combination of pleasantries and fluff', () => {
      const result = filter.apply(
        'Please just really quickly build a very simple function. Thanks!',
        mockContext
      );
      expect(result.enhancedPrompt.toLowerCase()).not.toContain('please');
      expect(result.enhancedPrompt).not.toMatch(/\bjust\b/i);
      expect(result.enhancedPrompt).not.toMatch(/\breally\b/i);
      expect(result.enhancedPrompt).not.toMatch(/\bvery\b/i);
      expect(result.applied).toBe(true);
    });

    it('should preserve essential content while removing noise', () => {
      const result = filter.apply(
        'Could you please just quickly build a user authentication system that handles OAuth2?',
        mockContext
      );
      expect(result.enhancedPrompt).toContain('user authentication');
      expect(result.enhancedPrompt).toContain('OAuth2');
    });

    it('should handle nested redundant phrases', () => {
      const result = filter.apply(
        'In order to achieve this, due to the fact that we need it',
        mockContext
      );
      expect(result.enhancedPrompt).toContain('to');
      expect(result.enhancedPrompt).toContain('because');
    });
  });
});
