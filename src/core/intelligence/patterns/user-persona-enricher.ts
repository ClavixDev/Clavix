import {
  BasePattern,
  PatternMode,
  PatternPriority,
  PatternPhase,
  PatternConfigSchema,
} from './base-pattern.js';
import { PromptIntent, PatternContext, PatternResult } from '../types.js';

/**
 * v4.5 Pattern: User Persona Enricher
 *
 * Adds missing user context and personas to PRD content.
 * Ensures the "who" is clearly defined alongside the "what".
 */
export class UserPersonaEnricher extends BasePattern {
  // -------------------------------------------------------------------------
  // Pattern Metadata (v4.5 unified types)
  // -------------------------------------------------------------------------

  readonly id = 'user-persona-enricher';
  readonly name = 'User Persona Enricher';
  readonly description = 'Adds missing user context and personas';

  readonly applicableIntents: PromptIntent[] = ['prd-generation', 'planning'];

  readonly mode: PatternMode = 'deep';
  readonly priority: PatternPriority = 6; // MEDIUM - standard enhancement
  readonly phases: PatternPhase[] = ['question-validation', 'output-generation'];

  // -------------------------------------------------------------------------
  // Configuration Schema (v4.5)
  // -------------------------------------------------------------------------

  static override readonly configSchema: PatternConfigSchema = {
    inferUserType: {
      type: 'boolean',
      default: true,
      description: 'Attempt to infer user type from content',
    },
  };

  // -------------------------------------------------------------------------
  // Pattern Application
  // -------------------------------------------------------------------------

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
