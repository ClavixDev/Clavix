/**
 * ConversationAnalyzer - Analyzes conversation sessions and extracts structured requirements
 *
 * This class handles:
 * - Conversation analysis and pattern extraction
 * - Key requirement identification
 * - Technical constraint extraction
 * - Success criteria identification
 * - Mini-PRD and optimized prompt generation
 */

import { Session } from '../types/session.js';

/**
 * Analyzed conversation data
 */
export interface ConversationAnalysis {
  summary: string;
  keyRequirements: string[];
  technicalConstraints: string[];
  successCriteria: string[];
  outOfScope: string[];
  additionalContext: string[];
}

/**
 * ConversationAnalyzer class
 *
 * Analyzes conversational sessions to extract structured requirements
 * suitable for PRD generation or AI prompting
 */
export class ConversationAnalyzer {
  /**
   * Analyze a conversation session
   *
   * @param session - The session to analyze
   * @returns Structured analysis of the conversation
   */
  analyze(session: Session): ConversationAnalysis {
    const userMessages = session.messages
      .filter((m) => m.role === 'user')
      .map((m) => m.content);

    return {
      summary: this.extractSummary(userMessages, session.projectName),
      keyRequirements: this.extractKeyRequirements(userMessages),
      technicalConstraints: this.extractTechnicalConstraints(userMessages),
      successCriteria: this.extractSuccessCriteria(userMessages),
      outOfScope: this.extractOutOfScope(userMessages),
      additionalContext: this.extractAdditionalContext(userMessages),
    };
  }

  /**
   * Generate a mini-PRD from analyzed conversation
   *
   * @param session - The session
   * @param analysis - The conversation analysis
   * @returns Mini-PRD content
   */
  generateMiniPrd(session: Session, analysis: ConversationAnalysis): string {
    const lines: string[] = [];

    lines.push(`# Mini-PRD: ${session.projectName}`);
    lines.push('');
    lines.push(`*Generated from conversation session ${session.id}*`);
    lines.push('');
    lines.push('---');
    lines.push('');

    // Summary
    lines.push('## Summary');
    lines.push('');
    lines.push(analysis.summary);
    lines.push('');

    // Key Requirements
    if (analysis.keyRequirements.length > 0) {
      lines.push('## Key Requirements');
      lines.push('');
      analysis.keyRequirements.forEach((req) => {
        lines.push(`- ${req}`);
      });
      lines.push('');
    }

    // Technical Constraints
    if (analysis.technicalConstraints.length > 0) {
      lines.push('## Technical Constraints');
      lines.push('');
      analysis.technicalConstraints.forEach((constraint) => {
        lines.push(`- ${constraint}`);
      });
      lines.push('');
    }

    // Success Criteria
    if (analysis.successCriteria.length > 0) {
      lines.push('## Success Criteria');
      lines.push('');
      analysis.successCriteria.forEach((criteria) => {
        lines.push(`- ${criteria}`);
      });
      lines.push('');
    }

    // Out of Scope
    if (analysis.outOfScope.length > 0) {
      lines.push('## Out of Scope');
      lines.push('');
      analysis.outOfScope.forEach((item) => {
        lines.push(`- ${item}`);
      });
      lines.push('');
    }

    // Additional Context
    if (analysis.additionalContext.length > 0) {
      lines.push('## Additional Context');
      lines.push('');
      analysis.additionalContext.forEach((context) => {
        lines.push(`- ${context}`);
      });
      lines.push('');
    }

    // Metadata
    lines.push('---');
    lines.push('');
    lines.push('**Conversation Details:**');
    lines.push(`- Session ID: ${session.id}`);
    lines.push(`- Messages: ${session.messages.length}`);
    lines.push(`- Created: ${session.created.toLocaleString()}`);
    lines.push(`- Updated: ${session.updated.toLocaleString()}`);
    lines.push('');

    return lines.join('\n');
  }

  /**
   * Generate an optimized prompt for AI consumption
   *
   * @param session - The session
   * @param analysis - The conversation analysis
   * @returns Optimized prompt content
   */
  generateOptimizedPrompt(session: Session, analysis: ConversationAnalysis): string {
    const lines: string[] = [];

    lines.push(`# Development Task: ${session.projectName}`);
    lines.push('');
    lines.push('## Objective');
    lines.push('');
    lines.push(analysis.summary);
    lines.push('');

    // Core Requirements
    if (analysis.keyRequirements.length > 0) {
      lines.push('## Core Requirements');
      lines.push('');
      lines.push('Please implement the following:');
      lines.push('');
      analysis.keyRequirements.forEach((req, index) => {
        lines.push(`${index + 1}. ${req}`);
      });
      lines.push('');
    }

    // Technical Constraints
    if (analysis.technicalConstraints.length > 0) {
      lines.push('## Technical Constraints');
      lines.push('');
      lines.push('Ensure the implementation adheres to these constraints:');
      lines.push('');
      analysis.technicalConstraints.forEach((constraint) => {
        lines.push(`- ${constraint}`);
      });
      lines.push('');
    }

    // Success Criteria
    if (analysis.successCriteria.length > 0) {
      lines.push('## Success Criteria');
      lines.push('');
      lines.push('The implementation is complete when:');
      lines.push('');
      analysis.successCriteria.forEach((criteria) => {
        lines.push(`- [ ] ${criteria}`);
      });
      lines.push('');
    }

    // Out of Scope
    if (analysis.outOfScope.length > 0) {
      lines.push('## Explicitly Out of Scope');
      lines.push('');
      lines.push('Do NOT implement:');
      lines.push('');
      analysis.outOfScope.forEach((item) => {
        lines.push(`- ${item}`);
      });
      lines.push('');
    }

    // Additional Context
    if (analysis.additionalContext.length > 0) {
      lines.push('## Additional Context');
      lines.push('');
      analysis.additionalContext.forEach((context) => {
        lines.push(context);
        lines.push('');
      });
    }

    // Instructions
    lines.push('---');
    lines.push('');
    lines.push('**Development Instructions:**');
    lines.push('');
    lines.push('Please implement a solution that:');
    lines.push('- Addresses all core requirements');
    lines.push('- Respects technical constraints');
    lines.push('- Meets all success criteria');
    lines.push('- Is well-structured, maintainable, and tested');
    lines.push('');
    lines.push('Focus on creating production-quality code with proper error handling, documentation, and tests.');
    lines.push('');

    return lines.join('\n');
  }

  /**
   * Extract a summary from the conversation
   */
  private extractSummary(messages: string[], projectName: string): string {
    if (messages.length === 0) {
      return `This project (${projectName}) requires development based on the following requirements.`;
    }

    // Use the first message as the primary summary, or combine first few messages
    const firstMessage = messages[0];

    if (messages.length === 1) {
      return firstMessage;
    }

    // Try to create a concise summary from the conversation
    const combinedText = messages.slice(0, 3).join(' ');

    if (combinedText.length <= 300) {
      return combinedText;
    }

    return firstMessage;
  }

  /**
   * Extract key requirements from messages
   */
  private extractKeyRequirements(messages: string[]): string[] {
    const requirements: string[] = [];

    // Keywords that indicate requirements
    const requirementPatterns = [
      /(?:need|want|should|must|require)(?:s)?\s+(?:to\s+)?(.+?)(?:\.|$)/gi,
      /(?:implement|add|create|build|develop)\s+(.+?)(?:\.|$)/gi,
      /(?:feature|functionality):\s*(.+?)(?:\.|$)/gi,
    ];

    for (const message of messages) {
      for (const pattern of requirementPatterns) {
        const matches = [...message.matchAll(pattern)];
        for (const match of matches) {
          if (match[1]) {
            const requirement = match[1].trim();
            if (requirement.length > 10 && requirement.length < 200) {
              requirements.push(this.cleanupText(requirement));
            }
          }
        }
      }

      // Also capture direct statements (messages that don't match patterns)
      if (!this.matchesAnyPattern(message, requirementPatterns)) {
        const cleaned = this.cleanupText(message);
        if (cleaned.length > 10 && cleaned.length < 200) {
          requirements.push(cleaned);
        }
      }
    }

    // Remove duplicates and limit
    return [...new Set(requirements)].slice(0, 10);
  }

  /**
   * Extract technical constraints from messages
   */
  private extractTechnicalConstraints(messages: string[]): string[] {
    const constraints: string[] = [];

    const technicalKeywords = [
      'typescript', 'javascript', 'python', 'java', 'node', 'react', 'vue', 'angular',
      'database', 'sql', 'nosql', 'mongodb', 'postgres', 'mysql',
      'api', 'rest', 'graphql', 'websocket',
      'authentication', 'oauth', 'jwt', 'security',
      'performance', 'scale', 'cache', 'redis',
      'docker', 'kubernetes', 'aws', 'azure', 'gcp',
      'framework', 'library', 'package', 'version',
    ];

    for (const message of messages) {
      const lowerMessage = message.toLowerCase();

      // Check for technical keywords
      for (const keyword of technicalKeywords) {
        if (lowerMessage.includes(keyword)) {
          // Extract the sentence containing the keyword
          const sentences = message.split(/[.!?]+/);
          for (const sentence of sentences) {
            if (sentence.toLowerCase().includes(keyword)) {
              const cleaned = this.cleanupText(sentence);
              if (cleaned.length > 10) {
                constraints.push(cleaned);
              }
              break;
            }
          }
        }
      }
    }

    // Remove duplicates and limit
    return [...new Set(constraints)].slice(0, 8);
  }

  /**
   * Extract success criteria from messages
   */
  private extractSuccessCriteria(messages: string[]): string[] {
    const criteria: string[] = [];

    const criteriaPatterns = [
      /(?:success|successful|complete|done)\s+(?:when|if|criteria):\s*(.+?)(?:\.|$)/gi,
      /(?:should be able to)\s+(.+?)(?:\.|$)/gi,
      /(?:must|has to)\s+(.+?)(?:\.|$)/gi,
    ];

    for (const message of messages) {
      for (const pattern of criteriaPatterns) {
        const matches = [...message.matchAll(pattern)];
        for (const match of matches) {
          if (match[1]) {
            const criterion = this.cleanupText(match[1]);
            if (criterion.length > 10) {
              criteria.push(criterion);
            }
          }
        }
      }
    }

    // If no explicit criteria found, infer from requirements
    if (criteria.length === 0 && messages.length > 0) {
      criteria.push('All core requirements are implemented and functional');
      criteria.push('Code is tested and well-documented');
    }

    return [...new Set(criteria)].slice(0, 6);
  }

  /**
   * Extract out-of-scope items from messages
   */
  private extractOutOfScope(messages: string[]): string[] {
    const outOfScope: string[] = [];

    const outOfScopePatterns = [
      /(?:don't|do not|don't)\s+(?:need|want|include)\s+(.+?)(?:\.|$)/gi,
      /(?:not|no)\s+(?:in scope|necessary|needed|required):\s*(.+?)(?:\.|$)/gi,
      /(?:skip|ignore|exclude)\s+(.+?)(?:\.|$)/gi,
    ];

    for (const message of messages) {
      for (const pattern of outOfScopePatterns) {
        const matches = [...message.matchAll(pattern)];
        for (const match of matches) {
          if (match[1]) {
            const item = this.cleanupText(match[1]);
            if (item.length > 10) {
              outOfScope.push(item);
            }
          }
        }
      }
    }

    return [...new Set(outOfScope)].slice(0, 5);
  }

  /**
   * Extract additional context from messages
   */
  private extractAdditionalContext(messages: string[]): string[] {
    const context: string[] = [];

    // Look for context indicators
    const contextPatterns = [
      /(?:context|background|note):\s*(.+?)(?:\.|$)/gi,
      /(?:important|note that|keep in mind)\s+(.+?)(?:\.|$)/gi,
    ];

    for (const message of messages) {
      for (const pattern of contextPatterns) {
        const matches = [...message.matchAll(pattern)];
        for (const match of matches) {
          if (match[1]) {
            const item = this.cleanupText(match[1]);
            if (item.length > 10) {
              context.push(item);
            }
          }
        }
      }
    }

    return [...new Set(context)].slice(0, 5);
  }

  /**
   * Clean up extracted text
   */
  private cleanupText(text: string): string {
    return text
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/^[,\s]+/, '')
      .replace(/[,\s]+$/, '');
  }

  /**
   * Check if message matches any pattern
   */
  private matchesAnyPattern(message: string, patterns: RegExp[]): boolean {
    for (const pattern of patterns) {
      if (pattern.test(message)) {
        return true;
      }
    }
    return false;
  }
}
