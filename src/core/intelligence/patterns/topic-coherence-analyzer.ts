import { BasePattern } from './base-pattern.js';
import { PromptIntent, OptimizationMode, PatternContext, PatternResult } from '../types.js';

/**
 * v4.3.2 Conversational Pattern: TopicCoherenceAnalyzer
 *
 * Detects topic shifts and multi-topic conversations.
 * Helps organize scattered discussions into coherent themes.
 */
export class TopicCoherenceAnalyzer extends BasePattern {
  id = 'topic-coherence-analyzer';
  name = 'TopicCoherenceAnalyzer';
  description = 'Detects topic shifts and multi-topic conversations';
  applicableIntents: PromptIntent[] = ['summarization', 'planning'];
  mode: OptimizationMode | 'both' = 'deep';
  priority = 6;

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

    // Topic detection patterns
    const topicIndicators: Record<string, string[]> = {
      'User Interface': ['ui', 'interface', 'design', 'layout', 'button', 'form', 'page', 'screen'],
      'Backend/API': ['api', 'backend', 'server', 'endpoint', 'route', 'controller'],
      Database: ['database', 'db', 'schema', 'table', 'query', 'migration'],
      Authentication: ['auth', 'login', 'password', 'session', 'token', 'permission'],
      Performance: ['performance', 'speed', 'cache', 'optimize', 'latency'],
      Testing: ['test', 'spec', 'coverage', 'qa', 'validation'],
      Deployment: ['deploy', 'ci/cd', 'pipeline', 'release', 'environment'],
      'User Experience': ['ux', 'usability', 'accessibility', 'user flow', 'journey'],
      'Business Logic': ['business', 'workflow', 'process', 'rule', 'logic'],
      Integration: ['integration', 'third-party', 'external', 'webhook', 'sync'],
    };

    for (const [topic, keywords] of Object.entries(topicIndicators)) {
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
    // Simple extraction based on topic keywords
    const topicKeywords: Record<string, string[]> = {
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
      ],
      'Backend/API': ['api', 'backend', 'server', 'endpoint', 'route', 'controller', 'service'],
      Database: ['database', 'db', 'schema', 'table', 'query', 'migration', 'model'],
      Authentication: ['auth', 'login', 'password', 'session', 'token', 'permission', 'user'],
      Performance: ['performance', 'speed', 'cache', 'optimize', 'latency', 'fast', 'slow'],
      Testing: ['test', 'spec', 'coverage', 'qa', 'validation', 'verify'],
      Deployment: ['deploy', 'ci/cd', 'pipeline', 'release', 'environment', 'production'],
      'User Experience': ['ux', 'usability', 'accessibility', 'user flow', 'journey', 'experience'],
      'Business Logic': ['business', 'workflow', 'process', 'rule', 'logic', 'requirement'],
      Integration: ['integration', 'third-party', 'external', 'webhook', 'sync', 'connect'],
    };

    const keywords = topicKeywords[topic] || [];
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
