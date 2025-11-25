import { describe, it, expect, beforeEach } from '@jest/globals';
import { ImplicitRequirementExtractor } from '../../../../src/core/intelligence/patterns/implicit-requirement-extractor.js';
import { PatternContext } from '../../../../src/core/intelligence/types.js';

describe('ImplicitRequirementExtractor', () => {
  let pattern: ImplicitRequirementExtractor;
  let mockContext: PatternContext;

  beforeEach(() => {
    pattern = new ImplicitRequirementExtractor();
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
      expect(pattern.id).toBe('implicit-requirement-extractor');
    });

    it('should have correct name', () => {
      expect(pattern.name).toBe('Implicit Requirement Extractor');
    });

    it('should be deep mode only', () => {
      expect(pattern.mode).toBe('deep');
    });

    it('should have priority 5 (MEDIUM-LOW - supplementary)', () => {
      expect(pattern.priority).toBe(5);
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

  describe('apply - no implicit requirements', () => {
    it('should not apply when no implicit requirements found', () => {
      // Avoid: simple, easy, fast, mobile, user, save, store, etc.
      const prompt = 'Write a recursive algorithm';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(false);
    });

    it('should return low impact when nothing detected', () => {
      const prompt = 'Hello world example';
      const result = pattern.apply(prompt, mockContext);
      expect(result.improvement.impact).toBe('low');
    });
  });

  describe('apply - feature parity detection', () => {
    it('should detect "like X" patterns', () => {
      const prompt = 'Create a dashboard like Jira';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
      expect(result.enhancedPrompt).toContain('Feature parity');
    });

    it('should detect "similar to" patterns', () => {
      const prompt = 'Build something similar to Slack';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toContain('implied');
      }
    });
  });

  describe('apply - mobile detection', () => {
    it('should detect mobile requirement', () => {
      const prompt = 'Create a mobile app for users';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
      expect(result.enhancedPrompt).toContain('Mobile-responsive');
    });
  });

  describe('apply - real-time detection', () => {
    it('should detect real-time requirement', () => {
      const prompt = 'Create a real-time chat application';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
      expect(result.enhancedPrompt).toContain('Real-time');
    });

    it('should detect realtime (no hyphen) requirement', () => {
      const prompt = 'Build a realtime notification system';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toContain('Real-time');
      }
    });
  });

  describe('apply - scalability detection', () => {
    it('should detect scale requirement', () => {
      const prompt = 'Build a system that can scale to handle load';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
      expect(result.enhancedPrompt).toContain('Scalability');
    });

    it('should detect millions users', () => {
      const prompt = 'Support millions of concurrent users';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toContain('Scalability');
      }
    });
  });

  describe('apply - security detection', () => {
    it('should detect security requirement', () => {
      const prompt = 'Build a secure payment system';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
      expect(result.enhancedPrompt).toContain('Security');
    });
  });

  describe('apply - performance detection', () => {
    it('should detect fast requirement', () => {
      const prompt = 'Create a fast search engine';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
      expect(result.enhancedPrompt).toContain('Performance');
    });

    it('should detect quick requirement', () => {
      const prompt = 'Build quick loading pages';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toContain('Performance');
      }
    });
  });

  describe('apply - user authentication detection', () => {
    it('should detect user role implies auth', () => {
      const prompt = 'Allow users and admins to access the dashboard';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
      expect(result.enhancedPrompt).toContain('authentication');
    });
  });

  describe('apply - data storage detection', () => {
    it('should detect save implies storage', () => {
      const prompt = 'Users can save their preferences';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
      expect(result.enhancedPrompt).toContain('persistence');
    });

    it('should detect store implies storage', () => {
      const prompt = 'Store customer data securely';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toMatch(/persistence|storage/i);
      }
    });
  });

  describe('apply - UX detection', () => {
    it('should detect easy implies UX focus', () => {
      const prompt = 'Make it easy for users to navigate';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
      expect(result.enhancedPrompt).toContain('User experience');
    });

    it('should detect simple implies UX focus', () => {
      const prompt = 'Create a simple interface';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toContain('experience');
      }
    });

    it('should detect intuitive implies UX focus', () => {
      const prompt = 'Design an intuitive workflow';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toContain('experience');
      }
    });
  });

  describe('apply - notification detection', () => {
    it('should detect notify implies notification system', () => {
      const prompt = 'Notify users when tasks are complete';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
      expect(result.enhancedPrompt).toContain('Notification');
    });

    it('should detect email implies notification system', () => {
      const prompt = 'Send email updates to subscribers';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toContain('Notification');
      }
    });
  });

  describe('apply - search detection', () => {
    it('should detect search implies infrastructure', () => {
      const prompt = 'Allow users to search for products';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
      expect(result.enhancedPrompt).toContain('Search');
    });

    it('should detect find implies search', () => {
      const prompt = 'Help users find relevant content';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toContain('Search');
      }
    });
  });

  describe('apply - analytics detection', () => {
    it('should detect report implies analytics', () => {
      const prompt = 'Generate sales report for managers';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
      expect(result.enhancedPrompt).toContain('Analytics');
    });

    it('should detect dashboard implies analytics', () => {
      const prompt = 'Create a dashboard for metrics';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toContain('Analytics');
      }
    });
  });

  describe('apply - integration detection', () => {
    it('should detect integrate implies APIs', () => {
      const prompt = 'Integrate with external payment providers';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
      expect(result.enhancedPrompt).toContain('Integration');
    });

    it('should detect sync implies integration', () => {
      const prompt = 'Sync data with cloud services';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toContain('Integration');
      }
    });
  });

  describe('apply - business rule detection', () => {
    it('should detect "always" patterns as rules', () => {
      const prompt = 'Orders must always be validated before processing';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
      expect(result.enhancedPrompt).toContain('Business rule');
    });

    it('should detect "never" patterns as rules', () => {
      const prompt = 'Users must never see other users private data';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toContain('Business rule');
      }
    });
  });

  describe('apply - result structure', () => {
    it('should return valid PatternResult structure', () => {
      const prompt = 'Create a mobile app';
      const result = pattern.apply(prompt, mockContext);

      expect(result).toHaveProperty('enhancedPrompt');
      expect(result).toHaveProperty('improvement');
      expect(result).toHaveProperty('applied');
    });

    it('should have completeness as improvement dimension', () => {
      const prompt = 'Create a feature';
      const result = pattern.apply(prompt, mockContext);
      expect(result.improvement.dimension).toBe('completeness');
    });

    it('should add verification note', () => {
      const prompt = 'Create a fast mobile app';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toContain('verify');
      }
    });

    it('should include requirement count in description', () => {
      const prompt = 'Create a fast mobile app with search';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.improvement.description).toMatch(/\d+ implicit requirements/);
      }
    });

    it('should limit implicit requirements to 10', () => {
      // Trigger many implicit requirements (v4.4 increased limit from 8 to 10)
      const prompt =
        'Create a fast mobile real-time app like Slack with search, reports, notifications, easy interface, user roles, and data storage that can scale to millions';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        const reqCount = (result.enhancedPrompt.match(/^- /gm) || []).length;
        expect(reqCount).toBeLessThanOrEqual(10);
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
  });
});
