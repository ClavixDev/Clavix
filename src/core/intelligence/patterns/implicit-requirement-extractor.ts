import {
  BasePattern,
  PatternMode,
  PatternPriority,
  PatternPhase,
  PatternConfigSchema,
} from './base-pattern.js';
import { PromptIntent, PatternContext, PatternResult } from '../types.js';

/**
 * v4.5 Pattern: Implicit Requirement Extractor
 *
 * Surfaces requirements mentioned indirectly in conversations.
 * Identifies hidden assumptions and unstated needs.
 * Enhanced with more detection patterns and categorization.
 */
export class ImplicitRequirementExtractor extends BasePattern {
  // -------------------------------------------------------------------------
  // Pattern Metadata (v4.5 unified types)
  // -------------------------------------------------------------------------

  readonly id = 'implicit-requirement-extractor';
  readonly name = 'Implicit Requirement Extractor';
  readonly description = 'Surfaces requirements mentioned indirectly';

  readonly applicableIntents: PromptIntent[] = ['summarization', 'planning', 'prd-generation'];

  readonly mode: PatternMode = 'deep';
  readonly priority: PatternPriority = 5; // MEDIUM-LOW - supplementary
  readonly phases: PatternPhase[] = ['conversation-tracking', 'summarization'];

  // -------------------------------------------------------------------------
  // Configuration Schema (v4.5)
  // -------------------------------------------------------------------------

  static override readonly configSchema: PatternConfigSchema = {
    maxImplicitRequirements: {
      type: 'number',
      default: 10,
      description: 'Maximum number of implicit requirements to surface',
      validation: { min: 1, max: 15 },
    },
    groupByCategory: {
      type: 'boolean',
      default: true,
      description: 'Group requirements by category',
    },
  };

  // -------------------------------------------------------------------------
  // Pattern Data
  // -------------------------------------------------------------------------

  // Categories for implicit requirements
  private readonly implicitPatterns: Array<{
    check: (prompt: string) => boolean;
    requirement: string;
    category: 'infrastructure' | 'ux' | 'security' | 'performance' | 'integration';
  }> = [
    // Infrastructure requirements
    {
      check: (p) => p.includes('mobile'),
      requirement: 'Mobile-responsive design required',
      category: 'infrastructure',
    },
    {
      check: (p) => p.includes('real-time') || p.includes('realtime'),
      requirement: 'Real-time updates infrastructure needed',
      category: 'infrastructure',
    },
    {
      check: (p) => p.includes('scale') || p.includes('thousands') || p.includes('millions'),
      requirement: 'Scalability architecture required',
      category: 'infrastructure',
    },
    {
      check: (p) => p.includes('offline') || p.includes('without internet'),
      requirement: 'Offline-capable architecture needed',
      category: 'infrastructure',
    },
    {
      check: (p) => p.includes('multi-tenant') || p.includes('multiple organizations'),
      requirement: 'Multi-tenancy support required',
      category: 'infrastructure',
    },
    // Security requirements
    {
      check: (p) => p.includes('secure') || p.includes('security'),
      requirement: 'Security audit and compliance requirements',
      category: 'security',
    },
    {
      check: (p) => p.includes('gdpr') || p.includes('privacy') || p.includes('compliant'),
      requirement: 'Data privacy and compliance infrastructure',
      category: 'security',
    },
    {
      check: (p) => p.includes('encrypt') || p.includes('sensitive'),
      requirement: 'Data encryption requirements',
      category: 'security',
    },
    // Performance requirements
    {
      check: (p) => p.includes('fast') || p.includes('quick'),
      requirement: 'Performance optimization requirements',
      category: 'performance',
    },
    {
      check: (p) => p.includes('responsive') || p.includes('instant'),
      requirement: 'Low-latency response requirements',
      category: 'performance',
    },
    // UX requirements
    {
      check: (p) => p.includes('easy') || p.includes('simple') || p.includes('intuitive'),
      requirement: 'User experience priority (simplicity mentioned)',
      category: 'ux',
    },
    {
      check: (p) => p.includes('accessible') || p.includes('a11y'),
      requirement: 'Accessibility (WCAG) compliance required',
      category: 'ux',
    },
    // Integration requirements
    {
      check: (p) =>
        p.includes('notify') ||
        p.includes('alert') ||
        p.includes('email') ||
        p.includes('notification'),
      requirement: 'Notification system infrastructure',
      category: 'integration',
    },
    {
      check: (p) => p.includes('search') || p.includes('find'),
      requirement: 'Search functionality and indexing',
      category: 'integration',
    },
    {
      check: (p) => p.includes('report') || p.includes('analytics') || p.includes('dashboard'),
      requirement: 'Analytics and reporting infrastructure',
      category: 'integration',
    },
    {
      check: (p) => p.includes('integrate') || p.includes('connect') || p.includes('sync'),
      requirement: 'Integration APIs and webhooks',
      category: 'integration',
    },
    {
      check: (p) => p.includes('import') || p.includes('export') || p.includes('csv'),
      requirement: 'Data import/export functionality',
      category: 'integration',
    },
  ];

  apply(prompt: string, _context: PatternContext): PatternResult {
    // Extract implicit requirements
    const implicitReqs = this.extractImplicitRequirements(prompt);

    // If no implicit requirements found, skip
    if (implicitReqs.length === 0) {
      return {
        enhancedPrompt: prompt,
        improvement: {
          dimension: 'completeness',
          description: 'No implicit requirements detected',
          impact: 'low',
        },
        applied: false,
      };
    }

    // Add implicit requirements section
    const enhanced = this.addImplicitRequirementsSection(prompt, implicitReqs);

    return {
      enhancedPrompt: enhanced,
      improvement: {
        dimension: 'completeness',
        description: `Surfaced ${implicitReqs.length} implicit requirements`,
        impact: 'medium',
      },
      applied: true,
    };
  }

  private extractImplicitRequirements(
    prompt: string
  ): Array<{ requirement: string; category: string }> {
    const implicitReqs: Array<{ requirement: string; category: string }> = [];
    const lowerPrompt = prompt.toLowerCase();

    // Pattern 1: "like X" implies feature parity
    const likePatterns = prompt.matchAll(/(?:like|similar to|same as)\s+([A-Za-z0-9\s]+)/gi);
    for (const match of likePatterns) {
      if (match[1]) {
        implicitReqs.push({
          requirement: `Feature parity with "${match[1].trim()}" (implied)`,
          category: 'feature',
        });
      }
    }

    // Use pattern-based detection
    for (const pattern of this.implicitPatterns) {
      if (pattern.check(lowerPrompt)) {
        implicitReqs.push({
          requirement: pattern.requirement,
          category: pattern.category,
        });
      }
    }

    // Pattern: User mentions imply auth/permissions
    if (
      (lowerPrompt.includes('user') || lowerPrompt.includes('admin')) &&
      !lowerPrompt.includes('authentication')
    ) {
      implicitReqs.push({
        requirement: 'User authentication system (implied by user roles)',
        category: 'security',
      });
    }

    // Pattern: Data mentions imply storage
    if (
      (lowerPrompt.includes('save') ||
        lowerPrompt.includes('store') ||
        lowerPrompt.includes('data')) &&
      !lowerPrompt.includes('database')
    ) {
      implicitReqs.push({
        requirement: 'Data persistence/storage (implied by data operations)',
        category: 'infrastructure',
      });
    }

    // Pattern: "Always" or "never" implies validation rules
    const alwaysNeverPatterns = prompt.matchAll(
      /(?:always|never|must always|must never)\s+([^.!?]+)/gi
    );
    for (const match of alwaysNeverPatterns) {
      if (match[1]) {
        implicitReqs.push({
          requirement: `Business rule: "${match[1].trim()}" (implied constraint)`,
          category: 'business',
        });
      }
    }

    // Deduplicate by requirement text
    const seen = new Set<string>();
    return implicitReqs
      .filter((r) => {
        if (seen.has(r.requirement)) return false;
        seen.add(r.requirement);
        return true;
      })
      .slice(0, 10); // Increased to 10
  }

  private addImplicitRequirementsSection(
    prompt: string,
    implicitReqs: Array<{ requirement: string; category: string }>
  ): string {
    let section = '\n\n### Implicit Requirements (Inferred)\n';
    section += '*The following requirements are implied by the discussion:*\n\n';

    // Group by category for better organization
    const byCategory = new Map<string, string[]>();
    for (const req of implicitReqs) {
      const existing = byCategory.get(req.category) || [];
      existing.push(req.requirement);
      byCategory.set(req.category, existing);
    }

    // Format with category headers if multiple categories
    if (byCategory.size > 2) {
      const categoryLabels: Record<string, string> = {
        infrastructure: '🏗️ Infrastructure',
        security: '🔒 Security',
        performance: '⚡ Performance',
        ux: '✨ User Experience',
        integration: '🔗 Integration',
        feature: '📋 Feature',
        business: '📊 Business Rules',
      };

      for (const [category, reqs] of byCategory) {
        section += `**${categoryLabels[category] || category}:**\n`;
        section += reqs.map((r) => `- ${r}`).join('\n');
        section += '\n\n';
      }
    } else {
      // Simple list for fewer categories
      section += implicitReqs.map((r) => `- ${r.requirement}`).join('\n');
      section += '\n\n';
    }

    section += '> **Note:** Please verify these inferred requirements are accurate.';

    return prompt + section;
  }
}
