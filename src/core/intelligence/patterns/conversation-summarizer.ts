import { BasePattern } from './base-pattern.js';
import { PromptIntent, OptimizationMode, PatternContext, PatternResult } from '../types.js';

/**
 * v4.3.2 Conversational Pattern: ConversationSummarizer
 *
 * Extracts structured requirements from conversational messages.
 * Organizes free-form discussion into actionable requirements.
 */
export class ConversationSummarizer extends BasePattern {
  id = 'conversation-summarizer';
  name = 'ConversationSummarizer';
  description = 'Extracts structured requirements from messages';
  applicableIntents: PromptIntent[] = ['summarization', 'planning', 'prd-generation'];
  mode: OptimizationMode | 'both' = 'deep';
  priority = 8;

  apply(prompt: string, _context: PatternContext): PatternResult {
    // Check if content is already well-structured
    if (this.isAlreadyStructured(prompt)) {
      return {
        enhancedPrompt: prompt,
        improvement: {
          dimension: 'structure',
          description: 'Content already well-structured',
          impact: 'low',
        },
        applied: false,
      };
    }

    // Check if this looks like conversational content
    if (!this.isConversationalContent(prompt)) {
      return {
        enhancedPrompt: prompt,
        improvement: {
          dimension: 'structure',
          description: 'Not conversational content',
          impact: 'low',
        },
        applied: false,
      };
    }

    // Extract and structure requirements
    const enhanced = this.extractAndStructure(prompt);

    return {
      enhancedPrompt: enhanced,
      improvement: {
        dimension: 'structure',
        description: 'Extracted structured requirements from conversation',
        impact: 'high',
      },
      applied: true,
    };
  }

  private isAlreadyStructured(prompt: string): boolean {
    // Check for markdown structure
    const structureIndicators = [
      '##',
      '###',
      '**Requirements:**',
      '**Features:**',
      '- [ ]',
      '1.',
      '2.',
      '3.',
    ];
    const matches = structureIndicators.filter((indicator) => prompt.includes(indicator));
    return matches.length >= 3;
  }

  private isConversationalContent(prompt: string): boolean {
    // Conversational markers
    const conversationalMarkers = [
      'i want',
      'i need',
      'we need',
      'should be able to',
      'would like',
      'thinking about',
      'maybe we could',
      'what if',
      'how about',
      'let me',
      "let's",
      'also',
      'and then',
      'basically',
      'so basically',
    ];

    const lowerPrompt = prompt.toLowerCase();
    const matches = conversationalMarkers.filter((marker) => lowerPrompt.includes(marker));

    // Also check for lack of structure (sentences without bullet points)
    const sentences = this.extractSentences(prompt);
    const hasBulletPoints = prompt.includes('- ') || prompt.includes('* ');

    return matches.length >= 2 || (sentences.length > 3 && !hasBulletPoints);
  }

  private extractAndStructure(prompt: string): string {
    const requirements = this.extractRequirements(prompt);
    const constraints = this.extractConstraints(prompt);
    const goals = this.extractGoals(prompt);

    let structured = '### Extracted Requirements\n\n';

    if (goals.length > 0) {
      structured += '**Goals:**\n';
      structured += goals.map((g) => `- ${g}`).join('\n');
      structured += '\n\n';
    }

    if (requirements.length > 0) {
      structured += '**Requirements:**\n';
      structured += requirements.map((r) => `- ${r}`).join('\n');
      structured += '\n\n';
    }

    if (constraints.length > 0) {
      structured += '**Constraints:**\n';
      structured += constraints.map((c) => `- ${c}`).join('\n');
      structured += '\n\n';
    }

    structured += '---\n\n**Original Context:**\n' + prompt;

    return structured;
  }

  private extractRequirements(prompt: string): string[] {
    const requirements: string[] = [];
    const sentences = this.extractSentences(prompt);

    const requirementPatterns = [
      /(?:need|want|should|must|require)\s+(?:to\s+)?(.+)/i,
      /(?:should be able to|needs to)\s+(.+)/i,
      /(?:feature|functionality):\s*(.+)/i,
    ];

    for (const sentence of sentences) {
      for (const pattern of requirementPatterns) {
        const match = sentence.match(pattern);
        if (match && match[1]) {
          const req = this.cleanRequirement(match[1]);
          if (req && !requirements.includes(req)) {
            requirements.push(req);
          }
        }
      }
    }

    return requirements.slice(0, 10); // Max 10 requirements
  }

  private extractConstraints(prompt: string): string[] {
    const constraints: string[] = [];
    const lowerPrompt = prompt.toLowerCase();

    const constraintPatterns = [
      /(?:can't|cannot|shouldn't|must not)\s+(.+)/gi,
      /(?:limited to|restricted to|only)\s+(.+)/gi,
      /(?:within|budget|deadline|timeline):\s*(.+)/gi,
      /(?:no more than|at most|maximum)\s+(.+)/gi,
    ];

    for (const pattern of constraintPatterns) {
      const matches = prompt.matchAll(pattern);
      for (const match of matches) {
        if (match[1]) {
          const constraint = this.cleanRequirement(match[1]);
          if (constraint && !constraints.includes(constraint)) {
            constraints.push(constraint);
          }
        }
      }
    }

    // Common constraint keywords
    if (lowerPrompt.includes('performance')) {
      constraints.push('Performance requirements to be defined');
    }
    if (lowerPrompt.includes('security')) {
      constraints.push('Security requirements to be defined');
    }
    if (lowerPrompt.includes('mobile') && lowerPrompt.includes('desktop')) {
      constraints.push('Must work on both mobile and desktop');
    }

    return constraints.slice(0, 5); // Max 5 constraints
  }

  private extractGoals(prompt: string): string[] {
    const goals: string[] = [];

    const goalPatterns = [
      /(?:goal is to|aim to|objective is to)\s+(.+)/gi,
      /(?:trying to|looking to|hoping to)\s+(.+)/gi,
      /(?:so that|in order to)\s+(.+)/gi,
    ];

    for (const pattern of goalPatterns) {
      const matches = prompt.matchAll(pattern);
      for (const match of matches) {
        if (match[1]) {
          const goal = this.cleanRequirement(match[1]);
          if (goal && !goals.includes(goal)) {
            goals.push(goal);
          }
        }
      }
    }

    return goals.slice(0, 3); // Max 3 goals
  }

  private cleanRequirement(text: string): string {
    return text
      .trim()
      .replace(/[.!?,;:]+$/, '')
      .replace(/\s+/g, ' ')
      .substring(0, 200);
  }
}
