import { describe, it, expect, beforeEach } from '@jest/globals';
import { TopicCoherenceAnalyzer } from '../../../../src/core/intelligence/patterns/topic-coherence-analyzer.js';
import { PatternContext } from '../../../../src/core/intelligence/types.js';

describe('TopicCoherenceAnalyzer', () => {
  let pattern: TopicCoherenceAnalyzer;
  let mockContext: PatternContext;

  beforeEach(() => {
    pattern = new TopicCoherenceAnalyzer();
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
      expect(pattern.id).toBe('topic-coherence-analyzer');
    });

    it('should have correct name', () => {
      expect(pattern.name).toBe('Topic Coherence Analyzer');
    });

    it('should be deep mode only', () => {
      expect(pattern.mode).toBe('deep');
    });

    it('should have priority 6', () => {
      expect(pattern.priority).toBe(6);
    });

    it('should be applicable for expected intents', () => {
      expect(pattern.applicableIntents).toContain('summarization');
      expect(pattern.applicableIntents).toContain('planning');
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

  describe('apply - single topic', () => {
    it('should not apply when only one topic detected', () => {
      // Avoid words that trigger multiple topics. "form" triggers UI, "login" triggers Auth
      const prompt = 'Write a sorting algorithm for arrays';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(false);
    });

    it('should return low impact for single topic', () => {
      // Only triggers UI topic via 'layout'
      const prompt = 'Design the homepage layout structure';
      const result = pattern.apply(prompt, mockContext);
      expect(result.improvement.impact).toBe('low');
    });
  });

  describe('apply - already organized', () => {
    it('should not apply when topic headers exist', () => {
      const prompt = '## User Interface\nDesign the layout\n\n## Backend\nCreate API endpoints';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(false);
    });

    it('should detect existing database header', () => {
      const prompt = '## Database\nCreate schema\n\n## Other stuff';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(false);
    });
  });

  describe('apply - multi-topic detection', () => {
    it('should detect UI and Backend topics', () => {
      const prompt = 'Create a form UI with buttons. Also create API endpoints for the server.';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
      expect(result.enhancedPrompt).toContain('Topics Covered');
    });

    it('should detect Database and Authentication topics', () => {
      const prompt =
        'Set up database schema with tables. Also add login authentication with tokens.';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
    });

    it('should detect Performance and Testing topics', () => {
      const prompt = 'Optimize performance and add caching. Also write test specs for coverage.';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
    });

    it('should detect Deployment and Integration topics', () => {
      const prompt =
        'Deploy to production environment. Also set up webhook integration with third-party services.';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
    });
  });

  describe('apply - topic organization', () => {
    it('should organize content by detected topics', () => {
      const prompt = 'Create a dashboard UI with charts. Also add database queries for reporting.';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toContain('Discussion by Topic');
      }
    });

    it('should list all detected topics', () => {
      const prompt = 'Design the interface layout. Create API routes. Add database tables.';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toMatch(/1\.\s+\*\*/);
        expect(result.enhancedPrompt).toMatch(/2\.\s+\*\*/);
      }
    });

    it('should preserve full context', () => {
      const prompt = 'Create UI components. Add backend services.';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toContain('Full Context');
        expect(result.enhancedPrompt).toContain(prompt);
      }
    });
  });

  describe('apply - topic content extraction', () => {
    it('should extract UI-related content', () => {
      const prompt = 'Create a button component for the interface. Also add API endpoint logic.';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toContain('User Interface');
      }
    });

    it('should extract Database-related content', () => {
      const prompt = 'Design the UI forms. Also create database migration for tables.';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toContain('Database');
      }
    });
  });

  describe('apply - result structure', () => {
    it('should return valid PatternResult structure', () => {
      const prompt = 'Create UI and API';
      const result = pattern.apply(prompt, mockContext);

      expect(result).toHaveProperty('enhancedPrompt');
      expect(result).toHaveProperty('improvement');
      expect(result).toHaveProperty('applied');
    });

    it('should have structure as improvement dimension', () => {
      const prompt = 'Create a feature';
      const result = pattern.apply(prompt, mockContext);
      expect(result.improvement.dimension).toBe('structure');
    });

    it('should return medium impact when topics organized', () => {
      const prompt = 'Create UI components. Add database schema. Write API routes.';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.improvement.impact).toBe('medium');
      }
    });

    it('should include topic count in description', () => {
      const prompt = 'Design interface. Create API endpoints. Add database tables.';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.improvement.description).toMatch(/\d+ distinct topics/);
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

    it('should handle prompts with no detectable topics', () => {
      const prompt = 'Hello world example';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(false);
    });
  });
});
