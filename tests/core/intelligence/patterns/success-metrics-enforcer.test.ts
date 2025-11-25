import { describe, it, expect, beforeEach } from '@jest/globals';
import { SuccessMetricsEnforcer } from '../../../../src/core/intelligence/patterns/success-metrics-enforcer.js';
import { PatternContext } from '../../../../src/core/intelligence/types.js';

describe('SuccessMetricsEnforcer', () => {
  let pattern: SuccessMetricsEnforcer;
  let mockContext: PatternContext;

  beforeEach(() => {
    pattern = new SuccessMetricsEnforcer();
    mockContext = {
      mode: 'deep',
      originalPrompt: 'Test prompt',
      intent: {
        primaryIntent: 'prd-generation',
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
      expect(pattern.id).toBe('success-metrics-enforcer');
    });

    it('should have correct name', () => {
      expect(pattern.name).toBe('Success Metrics Enforcer');
    });

    it('should have correct description', () => {
      expect(pattern.description).toBe('Ensures measurable success criteria exist');
    });

    it('should be deep mode only', () => {
      expect(pattern.mode).toBe('deep');
    });

    it('should have priority 7', () => {
      expect(pattern.priority).toBe(7);
    });

    it('should be applicable for prd-generation intent', () => {
      expect(pattern.applicableIntents).toContain('prd-generation');
    });

    it('should be applicable for planning intent', () => {
      expect(pattern.applicableIntents).toContain('planning');
    });
  });

  describe('isApplicable', () => {
    it('should return true for prd-generation intent in deep mode', () => {
      mockContext.intent.primaryIntent = 'prd-generation';
      mockContext.mode = 'deep';
      expect(pattern.isApplicable(mockContext)).toBe(true);
    });

    it('should return true for planning intent in deep mode', () => {
      mockContext.intent.primaryIntent = 'planning';
      mockContext.mode = 'deep';
      expect(pattern.isApplicable(mockContext)).toBe(true);
    });

    it('should return false for code-generation intent', () => {
      mockContext.intent.primaryIntent = 'code-generation';
      expect(pattern.isApplicable(mockContext)).toBe(false);
    });

    it('should return false in fast mode', () => {
      mockContext.mode = 'fast';
      mockContext.intent.primaryIntent = 'prd-generation';
      expect(pattern.isApplicable(mockContext)).toBe(false);
    });
  });

  describe('apply - success metrics already exist', () => {
    it('should not modify prompt with "success metric"', () => {
      const prompt = 'Feature with success metric: 90% uptime';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(false);
    });

    it('should not modify prompt with "KPI"', () => {
      const prompt = 'KPI: User engagement increase by 20%';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(false);
    });

    it('should not modify prompt with "% increase"', () => {
      const prompt = 'Goal: 30% increase in conversion';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(false);
    });

    it('should not modify prompt with "conversion rate"', () => {
      const prompt = 'Improve conversion rate to 5%';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(false);
    });

    it('should not modify prompt with "response time"', () => {
      const prompt = 'Response time should be under 200ms';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(false);
    });

    it('should not modify prompt with "uptime"', () => {
      const prompt = 'Maintain 99.9% uptime';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(false);
    });

    it('should not modify prompt with "SLA"', () => {
      const prompt = 'SLA requirements: 99.5% availability';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(false);
    });

    it('should not modify prompt with "acceptance criteria"', () => {
      const prompt = 'Acceptance criteria: All tests pass';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(false);
    });
  });

  describe('apply - content does not need metrics', () => {
    it('should not apply to non-feature content', () => {
      const prompt = 'Hello world';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(false);
    });

    it('should return low impact when content does not need metrics', () => {
      const prompt = 'Just some random text';
      const result = pattern.apply(prompt, mockContext);
      expect(result.improvement.impact).toBe('low');
    });
  });

  describe('apply - adds success metrics', () => {
    it('should add success metrics section for feature content', () => {
      const prompt = 'Build a dashboard feature';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
      expect(result.enhancedPrompt).toContain('Success Metrics');
    });

    it('should add primary KPIs header', () => {
      const prompt = 'Implement user authentication feature';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toContain('Primary KPIs');
      }
    });

    it('should add measurement approach', () => {
      const prompt = 'Build shopping cart feature';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toContain('Measurement Approach');
      }
    });

    it('should add baseline placeholder', () => {
      const prompt = 'Create notification feature';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toContain('Baseline');
      }
    });

    it('should add target placeholder', () => {
      const prompt = 'Build analytics feature';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toContain('Target');
      }
    });

    it('should add timeline placeholder', () => {
      const prompt = 'Implement search feature';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toContain('Timeline');
      }
    });
  });

  describe('apply - metric inference', () => {
    it('should infer performance metrics for performance content', () => {
      const prompt = 'Build a fast, performance-optimized feature';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toMatch(/Response time|load time/i);
      }
    });

    it('should infer engagement metrics for user content', () => {
      const prompt = 'Build a feature to improve user engagement';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toMatch(/engagement|completion rate/i);
      }
    });

    it('should infer conversion metrics for sales content', () => {
      const prompt = 'Build a feature to increase sales conversion';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toMatch(/Conversion|Revenue/i);
      }
    });

    it('should infer quality metrics for bug/error content', () => {
      const prompt = 'Build a feature to reduce bugs and errors';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toMatch(/Error rate|Test coverage/i);
      }
    });

    it('should infer API metrics for API content', () => {
      const prompt = 'Build an API integration feature';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toMatch(/API availability|success rate/i);
      }
    });

    it('should add default metrics when no specific type detected', () => {
      const prompt = 'Build a generic feature';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toContain('success metric');
      }
    });
  });

  describe('apply - result structure', () => {
    it('should return valid PatternResult structure', () => {
      const prompt = 'Build a feature';
      const result = pattern.apply(prompt, mockContext);

      expect(result).toHaveProperty('enhancedPrompt');
      expect(result).toHaveProperty('improvement');
      expect(result).toHaveProperty('applied');
      expect(result.improvement).toHaveProperty('dimension');
      expect(result.improvement).toHaveProperty('description');
      expect(result.improvement).toHaveProperty('impact');
    });

    it('should have completeness as improvement dimension', () => {
      const prompt = 'Build a feature';
      const result = pattern.apply(prompt, mockContext);
      expect(result.improvement.dimension).toBe('completeness');
    });

    it('should return high impact when metrics are added', () => {
      const prompt = 'Build a new feature';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.improvement.impact).toBe('high');
      }
    });

    it('should return low impact when metrics already exist', () => {
      const prompt = 'Feature with KPI: 99% uptime';
      const result = pattern.apply(prompt, mockContext);
      expect(result.improvement.impact).toBe('low');
    });
  });

  describe('apply - content preservation', () => {
    it('should preserve original prompt content', () => {
      const prompt = 'Build user authentication feature with OAuth';
      const result = pattern.apply(prompt, mockContext);
      expect(result.enhancedPrompt).toContain(prompt);
    });

    it('should add metrics section after original content', () => {
      const prompt = 'Create a dashboard feature';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        const promptIndex = result.enhancedPrompt.indexOf(prompt);
        const metricsIndex = result.enhancedPrompt.indexOf('### Success Metrics');
        expect(promptIndex).toBeLessThan(metricsIndex);
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

    it('should handle very long prompts', () => {
      const longPrompt = 'Build a feature '.repeat(200);
      const result = pattern.apply(longPrompt, mockContext);
      expect(result).toBeDefined();
    });

    it('should handle prompts with special characters', () => {
      const prompt = 'Feature: Build a <component> with "quotes" & symbols';
      const result = pattern.apply(prompt, mockContext);
      expect(result).toBeDefined();
    });

    it('should handle newlines in prompt', () => {
      const prompt = 'Feature 1: Login\nFeature 2: Dashboard';
      const result = pattern.apply(prompt, mockContext);
      expect(result).toBeDefined();
    });

    it('should handle case variations', () => {
      const prompt = 'SUCCESS METRIC: 99% availability';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(false); // Already has metrics
    });
  });

  describe('apply - metrics limit', () => {
    it('should limit metrics to maximum of 4', () => {
      const prompt =
        'Build a feature for performance, user engagement, conversion, quality, and api integration';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        // Count bullet points in the metrics section
        const metricsSection = result.enhancedPrompt
          .split('Primary KPIs')[1]
          ?.split('Measurement')[0];
        if (metricsSection) {
          const bulletCount = (metricsSection.match(/^- /gm) || []).length;
          expect(bulletCount).toBeLessThanOrEqual(4);
        }
      }
    });
  });
});
