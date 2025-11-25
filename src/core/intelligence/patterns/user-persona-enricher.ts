import { BasePattern } from './base-pattern.js';
import { PromptIntent, OptimizationMode, PatternContext, PatternResult } from '../types.js';

/**
 * v4.3.2 PRD Pattern: UserPersonaEnricher
 *
 * Adds missing user context and personas to PRD content.
 * Ensures the "who" is clearly defined alongside the "what".
 */
export class UserPersonaEnricher extends BasePattern {
  id = 'user-persona-enricher';
  name = 'UserPersonaEnricher';
  description = 'Adds missing user context and personas';
  applicableIntents: PromptIntent[] = ['prd-generation', 'planning'];
  mode: OptimizationMode | 'both' = 'deep';
  priority = 6;

  apply(prompt: string, _context: PatternContext): PatternResult {
    // Check if user/persona context already exists
    if (this.hasUserContext(prompt)) {
      return {
        enhancedPrompt: prompt,
        improvement: {
          dimension: 'completeness',
          description: 'User context already present',
          impact: 'low',
        },
        applied: false,
      };
    }

    // Check if this is PRD-like content that needs users
    if (!this.needsUserContext(prompt)) {
      return {
        enhancedPrompt: prompt,
        improvement: {
          dimension: 'completeness',
          description: 'Content does not require user persona',
          impact: 'low',
        },
        applied: false,
      };
    }

    // Add user persona section
    const enhanced = this.addUserPersona(prompt);

    return {
      enhancedPrompt: enhanced,
      improvement: {
        dimension: 'completeness',
        description: 'Added user persona context (who will use this)',
        impact: 'medium',
      },
      applied: true,
    };
  }

  private hasUserContext(prompt: string): boolean {
    const userKeywords = [
      'user persona',
      'target user',
      'end user',
      'user profile',
      'audience',
      'stakeholder',
      'as a user',
      'users can',
      'users will',
      'for users',
      'customer',
      'developer',
      'admin',
      'target audience',
    ];
    return this.hasSection(prompt, userKeywords);
  }

  private needsUserContext(prompt: string): boolean {
    // PRD-like content that talks about features but not users
    const featureKeywords = [
      'feature',
      'build',
      'create',
      'implement',
      'functionality',
      'should',
      'must',
      'requirement',
    ];
    return this.hasSection(prompt, featureKeywords);
  }

  private addUserPersona(prompt: string): string {
    // Detect the likely user type from content
    const userType = this.inferUserType(prompt);

    const personaSection =
      `\n\n### Target Users\n` +
      `**Primary User:** ${userType}\n` +
      `- Goals: [What they want to achieve]\n` +
      `- Pain Points: [Current frustrations]\n` +
      `- Context: [When and how they'll use this]`;

    return prompt + personaSection;
  }

  private inferUserType(prompt: string): string {
    const lowerPrompt = prompt.toLowerCase();

    // Try to infer user type from content
    if (
      lowerPrompt.includes('api') ||
      lowerPrompt.includes('sdk') ||
      lowerPrompt.includes('library')
    ) {
      return 'Developers integrating with the system';
    }
    if (
      lowerPrompt.includes('admin') ||
      lowerPrompt.includes('manage') ||
      lowerPrompt.includes('dashboard')
    ) {
      return 'Administrators managing the system';
    }
    if (
      lowerPrompt.includes('e-commerce') ||
      lowerPrompt.includes('shop') ||
      lowerPrompt.includes('buy')
    ) {
      return 'Customers making purchases';
    }
    if (
      lowerPrompt.includes('content') ||
      lowerPrompt.includes('blog') ||
      lowerPrompt.includes('cms')
    ) {
      return 'Content creators and editors';
    }
    if (lowerPrompt.includes('mobile') || lowerPrompt.includes('app')) {
      return 'Mobile app users';
    }

    return '[Define primary user type]';
  }
}
