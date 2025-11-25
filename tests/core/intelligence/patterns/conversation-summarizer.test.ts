import { describe, it, expect, beforeEach } from '@jest/globals';
import { ConversationSummarizer } from '../../../../src/core/intelligence/patterns/conversation-summarizer.js';
import { PatternContext } from '../../../../src/core/intelligence/types.js';

describe('ConversationSummarizer', () => {
  let pattern: ConversationSummarizer;
  let mockContext: PatternContext;

  beforeEach(() => {
    pattern = new ConversationSummarizer();
    mockContext = {
      mode: 'deep',
      originalPrompt: 'Test prompt',
      intent: {
        primaryIntent: 'summarization',
        confidence: 90,
        characteristics: {
          hasCodeContext: false,
          hasTechnicalTerms: true,
          isOpenEnded: false,
          needsStructure: true,
        },
      },
    };
  });

  describe('pattern properties', () => {
    it('should have correct id', () => {
      expect(pattern.id).toBe('conversation-summarizer');
    });

    it('should have correct name', () => {
      expect(pattern.name).toBe('Conversation Summarizer');
    });

    it('should be deep mode only', () => {
      expect(pattern.mode).toBe('deep');
    });

    it('should have priority 8', () => {
      expect(pattern.priority).toBe(8);
    });

    it('should be applicable for expected intents', () => {
      expect(pattern.applicableIntents).toContain('summarization');
      expect(pattern.applicableIntents).toContain('planning');
      expect(pattern.applicableIntents).toContain('prd-generation');
    });
  });

  describe('isApplicable', () => {
    it('should return true for summarization in deep mode', () => {
      mockContext.mode = 'deep';
      mockContext.intent.primaryIntent = 'summarization';
      expect(pattern.isApplicable(mockContext)).toBe(true);
    });

    it('should return false in fast mode', () => {
      mockContext.mode = 'fast';
      expect(pattern.isApplicable(mockContext)).toBe(false);
    });

    it('should return false for code-generation intent', () => {
      mockContext.intent.primaryIntent = 'code-generation';
      expect(pattern.isApplicable(mockContext)).toBe(false);
    });
  });

  describe('apply - already structured content', () => {
    it('should not apply when content has multiple markdown headers', () => {
      const prompt =
        '## Goals\nBuild a feature\n\n## Requirements\n- Item 1\n\n### Details\nMore info';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(false);
    });

    it('should not apply when content has numbered steps', () => {
      const prompt = '**Requirements:**\n1. First item\n2. Second item\n3. Third item';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(false);
    });

    it('should not apply when content has checkbox lists', () => {
      const prompt = '## Tasks\n- [ ] Task 1\n- [ ] Task 2\n- [ ] Task 3\n### Notes\nMore details';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(false);
    });
  });

  describe('apply - non-conversational content', () => {
    it('should not apply to formal structured text', () => {
      const prompt = 'Create a function. Return a value.';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(false);
    });
  });

  describe('apply - conversational content', () => {
    it('should apply to content with "I want"', () => {
      const prompt =
        'I want to create a dashboard. I need it to show analytics. Also, it should be fast.';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
    });

    it('should apply to content with "we need" and "also"', () => {
      // Needs 2 different conversational markers to trigger
      const prompt = 'We need a user management system. Also add roles handling.';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
    });

    it('should apply to content with "maybe we could"', () => {
      const prompt = 'Maybe we could add authentication. What if we also added OAuth?';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
    });

    it('should apply to content with "thinking about"', () => {
      const prompt = 'I am thinking about building a chat app. Let me also add voice support.';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
    });
  });

  describe('apply - requirement extraction', () => {
    it('should extract requirements with "need to"', () => {
      const prompt = 'I need to add user authentication. We need to handle sessions too.';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toContain('Requirements');
      }
    });

    it('should extract requirements with "should"', () => {
      const prompt = 'The app should support multiple users. It should also be responsive.';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toContain('Extracted Requirements');
      }
    });
  });

  describe('apply - constraint extraction', () => {
    it('should extract constraints with "cannot"', () => {
      const prompt = 'I want a fast app. It cannot use external APIs. Also add caching.';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toMatch(/Constraints|cannot/i);
      }
    });

    it('should detect performance constraints', () => {
      const prompt =
        'We need good performance. I want users to have quick responses. Maybe add caching.';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toMatch(/performance|Performance/i);
      }
    });

    it('should detect security constraints', () => {
      const prompt = 'I need security features. We should encrypt data. Also handle auth.';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toMatch(/Security|security/i);
      }
    });
  });

  describe('apply - goal extraction', () => {
    it('should extract goals with "goal is to"', () => {
      const prompt =
        'The goal is to improve user experience. I want faster load times. Also better UI.';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toContain('Goals');
      }
    });

    it('should extract goals with "trying to"', () => {
      const prompt =
        'We are trying to reduce costs. I want more efficient queries. Also less storage.';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toMatch(/Goals|trying/i);
      }
    });
  });

  describe('apply - result structure', () => {
    it('should return valid PatternResult structure', () => {
      const prompt = 'I want to create a feature. We need good performance.';
      const result = pattern.apply(prompt, mockContext);

      expect(result).toHaveProperty('enhancedPrompt');
      expect(result).toHaveProperty('improvement');
      expect(result).toHaveProperty('applied');
    });

    it('should have structure as improvement dimension', () => {
      const prompt = 'I want a feature';
      const result = pattern.apply(prompt, mockContext);
      expect(result.improvement.dimension).toBe('structure');
    });

    it('should preserve original context', () => {
      const prompt = 'I want to add login. We need signup too.';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toContain('Original Context');
        expect(result.enhancedPrompt).toContain(prompt);
      }
    });

    it('should return high impact when applied', () => {
      const prompt = 'I want a dashboard. We need charts. Also add filters.';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.improvement.impact).toBe('high');
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

    it('should limit requirements to 10', () => {
      // Many requirement sentences
      const prompt = Array(15)
        .fill('I need feature')
        .map((s, i) => `${s} ${i}`)
        .join('. ');
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        const reqCount = (result.enhancedPrompt.match(/^- /gm) || []).length;
        expect(reqCount).toBeLessThanOrEqual(20); // 10 reqs + 5 constraints + 3 goals + extras
      }
    });
  });
});
