import {
  BasePattern,
  PatternMode,
  PatternPriority,
  PatternPhase,
  PatternConfigSchema,
} from './base-pattern.js';
import { PromptIntent, PatternContext, PatternResult } from '../types.js';
import { calculateAdditiveConfidence } from '../confidence-calculator.js';

/**
 * v4.5 Pattern: Conversation Summarizer
 *
 * Extracts structured requirements from conversational messages.
 * Organizes free-form discussion into actionable requirements.
 * Enhanced with expanded marker detection and confidence scoring.
 */
export class ConversationSummarizer extends BasePattern {
  // -------------------------------------------------------------------------
  // Pattern Metadata (v4.5 unified types)
  // -------------------------------------------------------------------------

  readonly id = 'conversation-summarizer';
  readonly name = 'Conversation Summarizer';
  readonly description = 'Extracts structured requirements from messages';

  readonly applicableIntents: PromptIntent[] = ['summarization', 'planning', 'prd-generation'];

  readonly mode: PatternMode = 'deep';
  readonly priority: PatternPriority = 8; // HIGH - core enhancement
  readonly phases: PatternPhase[] = ['summarization'];

  // -------------------------------------------------------------------------
  // Configuration Schema (v4.5)
  // -------------------------------------------------------------------------

  static override readonly configSchema: PatternConfigSchema = {
    maxRequirements: {
      type: 'number',
      default: 10,
      description: 'Maximum number of requirements to extract',
      validation: { min: 1, max: 20 },
    },
    maxGoals: {
      type: 'number',
      default: 3,
      description: 'Maximum number of goals to extract',
      validation: { min: 1, max: 5 },
    },
    showConfidence: {
      type: 'boolean',
      default: true,
      description: 'Show extraction confidence percentage',
    },
  };

  // -------------------------------------------------------------------------
  // Pattern Data
  // -------------------------------------------------------------------------

  // Expanded conversational markers (~30 markers)
  private readonly conversationalMarkers = [
    // Intent expressions
    'i want',
    'i need',
    'we need',
    'we want',
    'i would like',
    'we would like',
    'would like to',
    'should be able to',
    'needs to',
    // Thinking/exploring
    'thinking about',
    'maybe we could',
    'what if',
    'how about',
    'perhaps we',
    'considering',
    'wondering if',
    // Conversational connectors
    "let's",
    'let me',
    'also',
    'and then',
    'plus',
    'another thing',
    'oh and',
    'by the way',
    // Informal markers
    'basically',
    'so basically',
    'essentially',
    'kind of like',
    'sort of',
    'something like',
    // Collaborative
    'can we',
    'could we',
    'shall we',
  ];

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
    const lowerPrompt = prompt.toLowerCase();
    const matches = this.conversationalMarkers.filter((marker) => lowerPrompt.includes(marker));

    // Also check for lack of structure (sentences without bullet points)
    const sentences = this.extractSentences(prompt);
    const hasBulletPoints = prompt.includes('- ') || prompt.includes('* ');

    // More lenient threshold with expanded markers
    return matches.length >= 2 || (sentences.length > 3 && !hasBulletPoints);
  }

  private calculateConfidence(
    requirements: string[],
    goals: string[],
    constraints: string[]
  ): number {
    // v4.5: Use shared confidence calculator
    return calculateAdditiveConfidence(50, [
      [requirements.length > 0, 20],
      [goals.length > 0, 15],
      [constraints.length > 0, 15],
    ]);
  }

  private extractAndStructure(prompt: string): string {
    const requirements = this.extractRequirements(prompt);
    const constraints = this.extractConstraints(prompt);
    const goals = this.extractGoals(prompt);
    const confidence = this.calculateConfidence(requirements, goals, constraints);

    let structured = '### Extracted Requirements\n\n';
    structured += `*Extraction confidence: ${confidence}%*\n\n`;

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

    // Add verification prompt if confidence is below 80%
    if (confidence < 80) {
      structured +=
        '> **Note:** Please verify these extracted requirements are complete and accurate.\n\n';
    }

    structured += '---\n\n**Original Context:**\n' + prompt;

    return structured;
  }

  private extractRequirements(prompt: string): string[] {
    const requirements: string[] = [];
    const sentences = this.extractSentences(prompt);

    // Expanded requirement patterns
    const requirementPatterns = [
      /(?:i |we )?(?:need|want|should|must|require)\s+(?:to\s+)?(.+)/i,
      /(?:should be able to|needs to|has to|have to)\s+(.+)/i,
      /(?:feature|functionality|capability):\s*(.+)/i,
      /(?:it should|it must|it needs to)\s+(.+)/i,
      /(?:users? (?:can|should|will|must))\s+(.+)/i,
      /(?:the system (?:should|must|will))\s+(.+)/i,
      /(?:support(?:s|ing)?)\s+(.+)/i,
      /(?:provide(?:s)?|enable(?:s)?|allow(?:s)?)\s+(.+)/i,
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

    // Expanded goal patterns
    const goalPatterns = [
      /(?:goal is to|aim(?:ing)? to|objective is to)\s+(.+)/gi,
      /(?:trying to|looking to|hoping to|want(?:ing)? to)\s+(.+)/gi,
      /(?:so that|in order to|to achieve)\s+(.+)/gi,
      /(?:the purpose is|main purpose|key purpose)\s+(.+)/gi,
      /(?:ultimately|end goal|final goal|main goal)\s+(.+)/gi,
      /(?:we're building this to|this will help)\s+(.+)/gi,
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
