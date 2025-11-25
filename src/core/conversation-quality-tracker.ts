/**
 * v4.3.2: Conversation Quality Tracker
 *
 * Implements the "Supportive Companion" UX pattern for conversational mode.
 * Silently tracks quality, provides positive reinforcement, and gentle guidance.
 */

export interface TrackedTopic {
  name: string;
  confidence: number;
  firstMentioned: number; // message index
}

export interface ConversationQuality {
  topics: TrackedTopic[];
  overallCompleteness: number; // 0-100
  ambiguityLevel: number; // 0-100 (lower is better)
  messageCount: number;
}

export interface NudgeResult {
  shouldNudge: boolean;
  message?: string;
  gap?: string;
}

/**
 * ConversationQualityTracker - "Supportive Companion" UX
 *
 * Design principles:
 * - Silent tracking during normal flow
 * - Celebrate progress, don't criticize gaps
 * - Gentle nudge only for critical issues (max 1 per session)
 * - Always reassure that Clavix will help
 */
export class ConversationQualityTracker {
  private topics: Map<string, TrackedTopic> = new Map();
  private messageCount: number = 0;
  private hasNudged: boolean = false;
  private lastCheckpointAt: number = 0;

  // Topic detection keywords
  private readonly TOPIC_KEYWORDS: Record<string, string[]> = {
    features: ['feature', 'functionality', 'should', 'must', 'need', 'want', 'capability'],
    'tech stack': [
      'react',
      'node',
      'typescript',
      'python',
      'database',
      'api',
      'backend',
      'frontend',
    ],
    constraints: [
      'constraint',
      'limitation',
      'budget',
      'timeline',
      'deadline',
      'must not',
      'cannot',
    ],
    users: ['user', 'customer', 'audience', 'persona', 'who will'],
    goals: ['goal', 'objective', 'purpose', 'why', 'problem', 'solve'],
    scope: ['scope', 'out of scope', 'not include', 'exclude', 'later', 'mvp'],
    success: ['success', 'metric', 'kpi', 'measure', 'criteria'],
    design: ['design', 'ui', 'ux', 'layout', 'interface', 'look'],
  };

  // Critical gaps that warrant a nudge (only if quality < 40%)
  private readonly CRITICAL_TOPICS = ['features', 'goals'];

  /**
   * Track a new message (silent analysis)
   */
  trackMessage(content: string): void {
    this.messageCount++;
    this.analyzeTopics(content);
  }

  /**
   * Get positive checkpoint message (call after ~5 messages or on "status")
   * Returns null if not time for a checkpoint
   */
  getPositiveCheckpoint(): string | null {
    // Only show checkpoint every 5 messages
    if (this.messageCount < 5 || this.messageCount - this.lastCheckpointAt < 5) {
      return null;
    }

    this.lastCheckpointAt = this.messageCount;

    const coveredTopics = this.getCoveredTopics();
    if (coveredTopics.length === 0) {
      return null;
    }

    // Format covered topics nicely
    const topicList = coveredTopics.slice(0, 3).join(', ');

    return `📝 Shaping up nicely! Covered: ${topicList}. Continue or /summarize anytime.`;
  }

  /**
   * Check if a gentle nudge is needed (max 1 per session, only for critical gaps)
   */
  shouldNudge(): NudgeResult {
    // Only nudge once per session
    if (this.hasNudged) {
      return { shouldNudge: false };
    }

    // Only nudge after a few messages
    if (this.messageCount < 3) {
      return { shouldNudge: false };
    }

    // Only nudge if quality is low
    const quality = this.calculateQuality();
    if (quality.overallCompleteness >= 40) {
      return { shouldNudge: false };
    }

    // Find critical gap
    const criticalGap = this.findCriticalGap();
    if (!criticalGap) {
      return { shouldNudge: false };
    }

    // Mark that we've nudged
    this.hasNudged = true;

    return {
      shouldNudge: true,
      gap: criticalGap,
      message: `💡 One thought: a note about ${criticalGap} would help. No worries—Clavix will fill gaps when you summarize.`,
    };
  }

  /**
   * Get reassuring end-of-session message
   */
  getEndMessage(): string {
    const coveredTopics = this.getCoveredTopics();

    if (coveredTopics.length === 0) {
      return '✨ Session recorded! Clavix Intelligence will help structure your requirements.';
    }

    if (coveredTopics.length >= 3) {
      return '✨ Great session! You covered several key areas. Clavix Intelligence will enhance your summary.';
    }

    return '✨ Great session! Clavix Intelligence will enhance your summary with any missing pieces.';
  }

  /**
   * Get current quality metrics (for internal use)
   */
  calculateQuality(): ConversationQuality {
    const topics = Array.from(this.topics.values());

    // Calculate completeness based on covered topics
    const totalPossibleTopics = Object.keys(this.TOPIC_KEYWORDS).length;
    const coveredCount = topics.filter((t) => t.confidence >= 30).length;
    const overallCompleteness = Math.min(
      100,
      Math.round((coveredCount / totalPossibleTopics) * 100)
    );

    // Estimate ambiguity (higher if fewer topics covered with low confidence)
    const avgConfidence =
      topics.length > 0 ? topics.reduce((sum, t) => sum + t.confidence, 0) / topics.length : 0;
    const ambiguityLevel = Math.max(0, 100 - avgConfidence);

    return {
      topics,
      overallCompleteness,
      ambiguityLevel,
      messageCount: this.messageCount,
    };
  }

  /**
   * Get list of covered topics (user-friendly names)
   */
  private getCoveredTopics(): string[] {
    return Array.from(this.topics.values())
      .filter((t) => t.confidence >= 30)
      .sort((a, b) => b.confidence - a.confidence)
      .map((t) => t.name);
  }

  /**
   * Find a critical gap to nudge about
   */
  private findCriticalGap(): string | null {
    for (const topic of this.CRITICAL_TOPICS) {
      const tracked = this.topics.get(topic);
      if (!tracked || tracked.confidence < 20) {
        return topic;
      }
    }
    return null;
  }

  /**
   * Analyze message content for topic coverage
   */
  private analyzeTopics(content: string): void {
    const lowerContent = content.toLowerCase();

    for (const [topic, keywords] of Object.entries(this.TOPIC_KEYWORDS)) {
      const matchedKeywords = keywords.filter((kw) => lowerContent.includes(kw));

      if (matchedKeywords.length > 0) {
        const existing = this.topics.get(topic);
        const confidence = Math.min(100, matchedKeywords.length * 25 + (existing?.confidence || 0));

        this.topics.set(topic, {
          name: topic,
          confidence,
          firstMentioned: existing?.firstMentioned || this.messageCount,
        });
      }
    }
  }

  /**
   * Reset tracker for new session
   */
  reset(): void {
    this.topics.clear();
    this.messageCount = 0;
    this.hasNudged = false;
    this.lastCheckpointAt = 0;
  }

  /**
   * Get summary for debugging/logging
   */
  getSummary(): string {
    const quality = this.calculateQuality();
    const topics = this.getCoveredTopics();

    return `Messages: ${this.messageCount}, Topics: [${topics.join(', ')}], Completeness: ${quality.overallCompleteness}%`;
  }
}
