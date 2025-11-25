import { BasePattern } from './base-pattern.js';
import { PromptIntent, OptimizationMode, PatternContext, PatternResult } from '../types.js';

/**
 * v4.3.2 PRD Pattern: RequirementPrioritizer
 *
 * Separates must-have from nice-to-have requirements in PRD content.
 * Helps clarify priorities and MVP scope.
 */
export class RequirementPrioritizer extends BasePattern {
  id = 'requirement-prioritizer';
  name = 'RequirementPrioritizer';
  description = 'Separates must-have from nice-to-have requirements';
  applicableIntents: PromptIntent[] = ['prd-generation', 'planning'];
  mode: OptimizationMode | 'both' = 'deep';
  priority = 7;

  apply(prompt: string, _context: PatternContext): PatternResult {
    // Only apply to PRD-related content with features
    if (!this.hasFeatureContent(prompt)) {
      return {
        enhancedPrompt: prompt,
        improvement: {
          dimension: 'structure',
          description: 'No feature content to prioritize',
          impact: 'low',
        },
        applied: false,
      };
    }

    // Check if prioritization already exists
    if (this.hasPrioritization(prompt)) {
      return {
        enhancedPrompt: prompt,
        improvement: {
          dimension: 'structure',
          description: 'Requirements already prioritized',
          impact: 'low',
        },
        applied: false,
      };
    }

    // Add prioritization framework
    const enhanced = this.addPrioritization(prompt);

    return {
      enhancedPrompt: enhanced,
      improvement: {
        dimension: 'structure',
        description: 'Added requirement prioritization (must-have vs nice-to-have)',
        impact: 'high',
      },
      applied: true,
    };
  }

  private hasFeatureContent(prompt: string): boolean {
    const featureKeywords = [
      'feature',
      'requirement',
      'functionality',
      'capability',
      'should',
      'must',
      'need',
      'want',
      'implement',
    ];
    return this.hasSection(prompt, featureKeywords);
  }

  private hasPrioritization(prompt: string): boolean {
    const priorityKeywords = [
      'must-have',
      'must have',
      'nice-to-have',
      'nice to have',
      'p0',
      'p1',
      'p2',
      'priority:',
      'mvp',
      'phase 1',
      'phase 2',
      'critical',
      'optional',
    ];
    return this.hasSection(prompt, priorityKeywords);
  }

  private addPrioritization(prompt: string): string {
    // Look for feature sections and add prioritization guidance
    const featureSection = this.extractFeatureSection(prompt);

    if (!featureSection) {
      // No clear feature section, add prioritization note
      return (
        prompt +
        '\n\n### Requirement Priorities\n' +
        '**Must-Have (MVP):**\n- [Core features required for launch]\n\n' +
        '**Nice-to-Have (Post-MVP):**\n- [Features to add after initial release]'
      );
    }

    // Features exist but aren't prioritized - add framework
    const priorityNote =
      '\n\n> **Priority Framework:** Consider categorizing features as:\n' +
      '> - **Must-Have (P0):** Required for MVP, blocking issues\n' +
      '> - **Should-Have (P1):** Important but not blocking\n' +
      '> - **Nice-to-Have (P2):** Enhancements for future iterations';

    return prompt + priorityNote;
  }

  private extractFeatureSection(prompt: string): string | null {
    // Try to find feature-related sections
    const featurePatterns = [
      /features?:?\s*\n([\s\S]*?)(?=\n##|\n\*\*[A-Z]|$)/i,
      /requirements?:?\s*\n([\s\S]*?)(?=\n##|\n\*\*[A-Z]|$)/i,
      /what we(?:'re| are) building:?\s*\n([\s\S]*?)(?=\n##|\n\*\*[A-Z]|$)/i,
    ];

    for (const pattern of featurePatterns) {
      const match = prompt.match(pattern);
      if (match) {
        return match[1];
      }
    }

    return null;
  }
}
