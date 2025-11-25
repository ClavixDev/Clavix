import { BasePattern } from './base-pattern.js';
import { PromptIntent, OptimizationMode, PatternContext, PatternResult } from '../types.js';

/**
 * v4.3.2 PRD Pattern: SuccessMetricsEnforcer
 *
 * Ensures measurable success criteria exist in PRD content.
 * Adds KPIs and metrics when missing.
 */
export class SuccessMetricsEnforcer extends BasePattern {
  id = 'success-metrics-enforcer';
  name = 'SuccessMetricsEnforcer';
  description = 'Ensures measurable success criteria exist';
  applicableIntents: PromptIntent[] = ['prd-generation', 'planning'];
  mode: OptimizationMode | 'both' = 'deep';
  priority = 7;

  apply(prompt: string, _context: PatternContext): PatternResult {
    // Check if success metrics already exist
    if (this.hasSuccessMetrics(prompt)) {
      return {
        enhancedPrompt: prompt,
        improvement: {
          dimension: 'completeness',
          description: 'Success metrics already present',
          impact: 'low',
        },
        applied: false,
      };
    }

    // Check if this is content that needs metrics
    if (!this.needsMetrics(prompt)) {
      return {
        enhancedPrompt: prompt,
        improvement: {
          dimension: 'completeness',
          description: 'Content does not require success metrics',
          impact: 'low',
        },
        applied: false,
      };
    }

    // Add success metrics section
    const enhanced = this.addSuccessMetrics(prompt);

    return {
      enhancedPrompt: enhanced,
      improvement: {
        dimension: 'completeness',
        description: 'Added measurable success criteria and KPIs',
        impact: 'high',
      },
      applied: true,
    };
  }

  private hasSuccessMetrics(prompt: string): boolean {
    const metricsKeywords = [
      'success metric',
      'success criteria',
      'kpi',
      'measure success',
      'acceptance criteria',
      '% increase',
      '% decrease',
      'conversion rate',
      'completion rate',
      'response time',
      'latency',
      'uptime',
      'sla',
      'benchmark',
    ];
    return this.hasSection(prompt, metricsKeywords);
  }

  private needsMetrics(prompt: string): boolean {
    // PRD-like content that describes features
    const prdKeywords = [
      'feature',
      'build',
      'implement',
      'goal',
      'objective',
      'product',
      'launch',
      'release',
    ];
    return this.hasSection(prompt, prdKeywords);
  }

  private addSuccessMetrics(prompt: string): string {
    // Detect the type of project to suggest relevant metrics
    const metrics = this.inferRelevantMetrics(prompt);

    const metricsSection =
      `\n\n### Success Metrics\n` +
      `**Primary KPIs:**\n` +
      metrics.map((m) => `- ${m}`).join('\n') +
      `\n\n**Measurement Approach:**\n` +
      `- Baseline: [Current state before implementation]\n` +
      `- Target: [Specific, measurable goals]\n` +
      `- Timeline: [When to measure success]`;

    return prompt + metricsSection;
  }

  private inferRelevantMetrics(prompt: string): string[] {
    const lowerPrompt = prompt.toLowerCase();
    const metrics: string[] = [];

    // Performance-related
    if (
      lowerPrompt.includes('performance') ||
      lowerPrompt.includes('fast') ||
      lowerPrompt.includes('speed')
    ) {
      metrics.push('Response time < [X]ms (p95)');
      metrics.push('Page load time improvement by [X]%');
    }

    // User engagement
    if (
      lowerPrompt.includes('user') ||
      lowerPrompt.includes('engagement') ||
      lowerPrompt.includes('retention')
    ) {
      metrics.push('User engagement increase by [X]%');
      metrics.push('Task completion rate > [X]%');
    }

    // Conversion/business
    if (
      lowerPrompt.includes('conversion') ||
      lowerPrompt.includes('sales') ||
      lowerPrompt.includes('revenue')
    ) {
      metrics.push('Conversion rate improvement by [X]%');
      metrics.push('Revenue impact of $[X]');
    }

    // Technical quality
    if (
      lowerPrompt.includes('quality') ||
      lowerPrompt.includes('bug') ||
      lowerPrompt.includes('error')
    ) {
      metrics.push('Error rate < [X]%');
      metrics.push('Test coverage > [X]%');
    }

    // API/integration
    if (lowerPrompt.includes('api') || lowerPrompt.includes('integration')) {
      metrics.push('API availability > [X]%');
      metrics.push('Integration success rate > [X]%');
    }

    // Default metrics if none matched
    if (metrics.length === 0) {
      metrics.push('[Define primary success metric]');
      metrics.push('[Define secondary success metric]');
      metrics.push('[Define timeline for measurement]');
    }

    return metrics.slice(0, 4); // Max 4 metrics
  }
}
