import { BasePattern } from './base-pattern.js';
import { PromptIntent, OptimizationMode, PatternContext, PatternResult } from '../types.js';

/**
 * v4.3.2 PRD Pattern: DependencyIdentifier
 *
 * Identifies technical and external dependencies in PRD content.
 * Helps surface hidden requirements and blockers.
 */
export class DependencyIdentifier extends BasePattern {
  id = 'dependency-identifier';
  name = 'DependencyIdentifier';
  description = 'Identifies technical and external dependencies';
  applicableIntents: PromptIntent[] = ['prd-generation', 'planning', 'migration'];
  mode: OptimizationMode | 'both' = 'deep';
  priority = 5;

  apply(prompt: string, _context: PatternContext): PatternResult {
    // Check if dependencies are already documented
    if (this.hasDependencySection(prompt)) {
      return {
        enhancedPrompt: prompt,
        improvement: {
          dimension: 'completeness',
          description: 'Dependencies already documented',
          impact: 'low',
        },
        applied: false,
      };
    }

    // Check if this content has identifiable dependencies
    const dependencies = this.identifyDependencies(prompt);
    if (dependencies.length === 0) {
      return {
        enhancedPrompt: prompt,
        improvement: {
          dimension: 'completeness',
          description: 'No clear dependencies identified',
          impact: 'low',
        },
        applied: false,
      };
    }

    // Add dependency section
    const enhanced = this.addDependencySection(prompt, dependencies);

    return {
      enhancedPrompt: enhanced,
      improvement: {
        dimension: 'completeness',
        description: `Identified ${dependencies.length} dependencies (technical/external)`,
        impact: 'medium',
      },
      applied: true,
    };
  }

  private hasDependencySection(prompt: string): boolean {
    const dependencyKeywords = [
      'dependencies',
      'depends on',
      'prerequisite',
      'requires',
      'blocked by',
      'blocker',
      'external service',
      'third-party',
      'integration with',
    ];
    return this.hasSection(prompt, dependencyKeywords);
  }

  private identifyDependencies(prompt: string): string[] {
    const dependencies: string[] = [];
    const lowerPrompt = prompt.toLowerCase();

    // Technical dependencies
    if (lowerPrompt.includes('api')) {
      dependencies.push('API availability and documentation');
    }
    if (lowerPrompt.includes('database') || lowerPrompt.includes('db')) {
      dependencies.push('Database schema and migrations');
    }
    if (lowerPrompt.includes('authentication') || lowerPrompt.includes('auth')) {
      dependencies.push('Authentication system integration');
    }
    if (
      lowerPrompt.includes('payment') ||
      lowerPrompt.includes('stripe') ||
      lowerPrompt.includes('billing')
    ) {
      dependencies.push('Payment provider integration');
    }
    if (lowerPrompt.includes('email') || lowerPrompt.includes('notification')) {
      dependencies.push('Email/notification service');
    }
    if (
      lowerPrompt.includes('storage') ||
      lowerPrompt.includes('s3') ||
      lowerPrompt.includes('file')
    ) {
      dependencies.push('File storage service');
    }
    if (lowerPrompt.includes('search') || lowerPrompt.includes('elasticsearch')) {
      dependencies.push('Search infrastructure');
    }
    if (lowerPrompt.includes('analytics') || lowerPrompt.includes('tracking')) {
      dependencies.push('Analytics platform');
    }
    if (lowerPrompt.includes('ci/cd') || lowerPrompt.includes('deploy')) {
      dependencies.push('CI/CD pipeline');
    }
    if (lowerPrompt.includes('cache') || lowerPrompt.includes('redis')) {
      dependencies.push('Caching infrastructure');
    }

    // External dependencies
    if (lowerPrompt.includes('third-party') || lowerPrompt.includes('external')) {
      dependencies.push('Third-party service availability');
    }
    if (lowerPrompt.includes('team') || lowerPrompt.includes('collaboration')) {
      dependencies.push('Cross-team coordination');
    }
    if (lowerPrompt.includes('approval') || lowerPrompt.includes('sign-off')) {
      dependencies.push('Stakeholder approvals');
    }
    if (lowerPrompt.includes('legal') || lowerPrompt.includes('compliance')) {
      dependencies.push('Legal/compliance review');
    }
    if (
      lowerPrompt.includes('design') ||
      lowerPrompt.includes('ui') ||
      lowerPrompt.includes('ux')
    ) {
      dependencies.push('Design specifications');
    }

    return dependencies;
  }

  private addDependencySection(prompt: string, dependencies: string[]): string {
    // Categorize dependencies
    const technical = dependencies.filter(
      (d) =>
        d.includes('API') ||
        d.includes('Database') ||
        d.includes('Authentication') ||
        d.includes('service') ||
        d.includes('infrastructure') ||
        d.includes('pipeline')
    );

    const external = dependencies.filter((d) => !technical.includes(d));

    let section = '\n\n### Dependencies\n';

    if (technical.length > 0) {
      section += '**Technical Dependencies:**\n';
      section += technical.map((d) => `- ${d}`).join('\n');
      section += '\n\n';
    }

    if (external.length > 0) {
      section += '**External Dependencies:**\n';
      section += external.map((d) => `- ${d}`).join('\n');
      section += '\n';
    }

    section += '\n**Dependency Status:** [Track status of each dependency]';

    return prompt + section;
  }
}
