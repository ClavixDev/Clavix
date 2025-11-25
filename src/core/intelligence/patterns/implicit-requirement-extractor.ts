import { BasePattern } from './base-pattern.js';
import { PromptIntent, OptimizationMode, PatternContext, PatternResult } from '../types.js';

/**
 * v4.3.2 Conversational Pattern: ImplicitRequirementExtractor
 *
 * Surfaces requirements mentioned indirectly in conversations.
 * Identifies hidden assumptions and unstated needs.
 */
export class ImplicitRequirementExtractor extends BasePattern {
  id = 'implicit-requirement-extractor';
  name = 'ImplicitRequirementExtractor';
  description = 'Surfaces requirements mentioned indirectly';
  applicableIntents: PromptIntent[] = ['summarization', 'planning', 'prd-generation'];
  mode: OptimizationMode | 'both' = 'deep';
  priority = 7;

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
    const enhanced = this.addImplicitRequirements(prompt, implicitReqs);

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

  private extractImplicitRequirements(prompt: string): string[] {
    const implicitReqs: string[] = [];
    const lowerPrompt = prompt.toLowerCase();

    // Pattern 1: "like X" implies feature parity
    const likePatterns = prompt.matchAll(/(?:like|similar to|same as)\s+([A-Za-z0-9\s]+)/gi);
    for (const match of likePatterns) {
      if (match[1]) {
        implicitReqs.push(`Feature parity with "${match[1].trim()}" (implied)`);
      }
    }

    // Pattern 2: Technical mentions imply requirements
    if (lowerPrompt.includes('mobile')) {
      implicitReqs.push('Mobile-responsive design required');
    }
    if (lowerPrompt.includes('real-time') || lowerPrompt.includes('realtime')) {
      implicitReqs.push('Real-time updates infrastructure needed');
    }
    if (
      lowerPrompt.includes('scale') ||
      lowerPrompt.includes('thousands') ||
      lowerPrompt.includes('millions')
    ) {
      implicitReqs.push('Scalability architecture required');
    }
    if (lowerPrompt.includes('secure') || lowerPrompt.includes('security')) {
      implicitReqs.push('Security audit and compliance requirements');
    }
    if (lowerPrompt.includes('fast') || lowerPrompt.includes('quick')) {
      implicitReqs.push('Performance optimization requirements');
    }

    // Pattern 3: User mentions imply auth/permissions
    if (
      (lowerPrompt.includes('user') || lowerPrompt.includes('admin')) &&
      !lowerPrompt.includes('authentication')
    ) {
      implicitReqs.push('User authentication system (implied by user roles)');
    }

    // Pattern 4: Data mentions imply storage
    if (
      (lowerPrompt.includes('save') ||
        lowerPrompt.includes('store') ||
        lowerPrompt.includes('data')) &&
      !lowerPrompt.includes('database')
    ) {
      implicitReqs.push('Data persistence/storage (implied by data operations)');
    }

    // Pattern 5: "Easy" or "simple" implies UX focus
    if (
      lowerPrompt.includes('easy') ||
      lowerPrompt.includes('simple') ||
      lowerPrompt.includes('intuitive')
    ) {
      implicitReqs.push('User experience priority (simplicity mentioned)');
    }

    // Pattern 6: Notifications/alerts imply communication system
    if (
      lowerPrompt.includes('notify') ||
      lowerPrompt.includes('alert') ||
      lowerPrompt.includes('email') ||
      lowerPrompt.includes('notification')
    ) {
      implicitReqs.push('Notification system infrastructure');
    }

    // Pattern 7: Search implies search infrastructure
    if (lowerPrompt.includes('search') || lowerPrompt.includes('find')) {
      implicitReqs.push('Search functionality and indexing');
    }

    // Pattern 8: Reports/analytics implies data aggregation
    if (
      lowerPrompt.includes('report') ||
      lowerPrompt.includes('analytics') ||
      lowerPrompt.includes('dashboard')
    ) {
      implicitReqs.push('Analytics and reporting infrastructure');
    }

    // Pattern 9: Integration mentions
    if (
      lowerPrompt.includes('integrate') ||
      lowerPrompt.includes('connect') ||
      lowerPrompt.includes('sync')
    ) {
      implicitReqs.push('Integration APIs and webhooks');
    }

    // Pattern 10: "Always" or "never" implies validation rules
    const alwaysNeverPatterns = prompt.matchAll(
      /(?:always|never|must always|must never)\s+([^.!?]+)/gi
    );
    for (const match of alwaysNeverPatterns) {
      if (match[1]) {
        implicitReqs.push(`Business rule: "${match[1].trim()}" (implied constraint)`);
      }
    }

    // Deduplicate
    return [...new Set(implicitReqs)].slice(0, 8);
  }

  private addImplicitRequirements(prompt: string, implicitReqs: string[]): string {
    let section = '\n\n### Implicit Requirements (Inferred)\n';
    section += '*The following requirements are implied by the discussion:*\n\n';
    section += implicitReqs.map((r) => `- ${r}`).join('\n');
    section += '\n\n> **Note:** Please verify these inferred requirements are accurate.';

    return prompt + section;
  }
}
