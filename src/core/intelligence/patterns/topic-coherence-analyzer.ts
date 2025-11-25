import {
  BasePattern,
  PatternMode,
  PatternPriority,
  PatternPhase,
  PatternConfigSchema,
} from './base-pattern.js';
import { PromptIntent, PatternContext, PatternResult } from '../types.js';

/**
 * v4.5 Pattern: Topic Coherence Analyzer
 *
 * Detects topic shifts and multi-topic conversations.
 * Helps organize scattered discussions into coherent themes.
 * Enhanced with expanded topic dictionary and better detection.
 */
export class TopicCoherenceAnalyzer extends BasePattern {
  // -------------------------------------------------------------------------
  // Pattern Metadata (v4.5 unified types)
  // -------------------------------------------------------------------------

  readonly id = 'topic-coherence-analyzer';
  readonly name = 'Topic Coherence Analyzer';
  readonly description = 'Detects topic shifts and multi-topic conversations';

  readonly applicableIntents: PromptIntent[] = ['summarization', 'planning'];

  readonly mode: PatternMode = 'deep';
  readonly priority: PatternPriority = 6; // MEDIUM - standard enhancement
  readonly phases: PatternPhase[] = ['conversation-tracking', 'summarization'];

  // -------------------------------------------------------------------------
  // Configuration Schema (v4.5)
  // -------------------------------------------------------------------------

  static override readonly configSchema: PatternConfigSchema = {
    minTopicsForOrganization: {
      type: 'number',
      default: 2,
      description: 'Minimum number of topics before organizing',
      validation: { min: 2, max: 5 },
    },
  };

  // -------------------------------------------------------------------------
  // Pattern Data
  // -------------------------------------------------------------------------

  // Expanded topic indicators (~15 topics with more keywords)
  private readonly topicIndicators: Record<string, string[]> = {
    'User Interface': [
      'ui',
      'interface',
      'design',
      'layout',
      'button',
      'form',
      'page',
      'screen',
      'component',
      'modal',
      'dialog',
      'navigation',
      'menu',
      'sidebar',
      'header',
      'footer',
    ],
    'Backend/API': [
      'api',
      'backend',
      'server',
      'endpoint',
      'route',
      'controller',
      'service',
      'middleware',
      'rest',
      'graphql',
      'websocket',
    ],
    Database: [
      'database',
      'db',
      'schema',
      'table',
      'query',
      'migration',
      'model',
      'orm',
      'sql',
      'nosql',
      'index',
      'relationship',
    ],
    Authentication: [
      'auth',
      'login',
      'password',
      'session',
      'token',
      'permission',
      'role',
      'oauth',
      'jwt',
      'sso',
      'mfa',
      '2fa',
    ],
    Performance: [
      'performance',
      'speed',
      'cache',
      'optimize',
      'latency',
      'load time',
      'bundle',
      'lazy',
      'memory',
      'cpu',
    ],
    Testing: [
      'test',
      'spec',
      'coverage',
      'qa',
      'validation',
      'unit test',
      'integration',
      'e2e',
      'mock',
      'fixture',
    ],
    Deployment: [
      'deploy',
      'ci/cd',
      'pipeline',
      'release',
      'environment',
      'production',
      'staging',
      'docker',
      'kubernetes',
    ],
    'User Experience': [
      'ux',
      'usability',
      'accessibility',
      'user flow',
      'journey',
      'experience',
      'onboarding',
      'feedback',
    ],
    'Business Logic': [
      'business',
      'workflow',
      'process',
      'rule',
      'logic',
      'requirement',
      'feature',
      'use case',
    ],
    Integration: [
      'integration',
      'third-party',
      'external',
      'webhook',
      'sync',
      'connect',
      'import',
      'export',
    ],
    Security: [
      'security',
      'encryption',
      'vulnerability',
      'xss',
      'csrf',
      'injection',
      'sanitize',
      'audit',
    ],
    Analytics: [
      'analytics',
      'tracking',
      'metrics',
      'dashboard',
      'report',
      'insight',
      'data',
      'statistics',
    ],
    'Error Handling': [
      'error',
      'exception',
      'fallback',
      'retry',
      'timeout',
      'failure',
      'recovery',
      'logging',
    ],
    Documentation: [
      'documentation',
      'docs',
      'readme',
      'guide',
      'tutorial',
      'api docs',
      'comment',
      'jsdoc',
    ],
    'State Management': [
      'state',
      'store',
      'redux',
      'context',
      'global state',
      'local state',
      'persist',
      'hydrate',
    ],
  };

  apply(prompt: string, _context: PatternContext): PatternResult {
    // Detect topics in the content
    const topics = this.detectTopics(prompt);

    // If single topic or already organized, skip
    if (topics.length <= 1) {
      return {
        enhancedPrompt: prompt,
        improvement: {
          dimension: 'structure',
          description: 'Single coherent topic detected',
          impact: 'low',
        },
        applied: false,
      };
    }

    // Check if already has topic organization
    if (this.hasTopicOrganization(prompt)) {
      return {
        enhancedPrompt: prompt,
        improvement: {
          dimension: 'structure',
          description: 'Topics already organized',
          impact: 'low',
        },
        applied: false,
      };
    }

    // Add topic organization
    const enhanced = this.organizeByTopic(prompt, topics);

    return {
      enhancedPrompt: enhanced,
      improvement: {
        dimension: 'structure',
        description: `Organized ${topics.length} distinct topics for clarity`,
        impact: 'medium',
      },
      applied: true,
    };
  }

  private detectTopics(prompt: string): string[] {
    const topics: string[] = [];
    const lowerPrompt = prompt.toLowerCase();

    for (const [topic, keywords] of Object.entries(this.topicIndicators)) {
      const hasKeyword = keywords.some((kw) => lowerPrompt.includes(kw));
      if (hasKeyword) {
        topics.push(topic);
      }
    }

    return topics;
  }

  private hasTopicOrganization(prompt: string): boolean {
    // Check for existing topic headers
    const topicHeaders = /##\s*(user interface|backend|database|auth|performance|testing|deploy)/i;
    return topicHeaders.test(prompt);
  }

  private organizeByTopic(prompt: string, topics: string[]): string {
    // Add topic summary at the beginning
    let organized = '### Topics Covered\n';
    organized += 'This conversation touches on multiple areas:\n';
    organized += topics.map((t, i) => `${i + 1}. **${t}**`).join('\n');
    organized += '\n\n---\n\n';

    // Extract content relevant to each topic
    organized += '### Discussion by Topic\n\n';

    for (const topic of topics) {
      const relevantContent = this.extractTopicContent(prompt, topic);
      if (relevantContent) {
        organized += `#### ${topic}\n`;
        organized += relevantContent + '\n\n';
      }
    }

    organized += '---\n\n**Full Context:**\n' + prompt;

    return organized;
  }

  private extractTopicContent(prompt: string, topic: string): string {
    const keywords = this.topicIndicators[topic] || [];
    const sentences = this.extractSentences(prompt);
    const relevantSentences = sentences.filter((sentence) => {
      const lower = sentence.toLowerCase();
      return keywords.some((kw) => lower.includes(kw));
    });

    if (relevantSentences.length === 0) {
      return `- Discussion related to ${topic}`;
    }

    return relevantSentences
      .slice(0, 3)
      .map((s) => `- ${s.trim()}`)
      .join('\n');
  }
}
