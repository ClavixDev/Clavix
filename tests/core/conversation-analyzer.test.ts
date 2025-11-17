/**
 * ConversationAnalyzer tests
 */

import { ConversationAnalyzer } from '../../src/core/conversation-analyzer';
import { Session, SessionMessage } from '../../src/types/session';
import { describe, it, expect, beforeEach } from '@jest/globals';

describe('ConversationAnalyzer', () => {
  let analyzer: ConversationAnalyzer;

  beforeEach(() => {
    analyzer = new ConversationAnalyzer();
  });

  const createTestSession = (messages: string[]): Session => {
    const sessionMessages: SessionMessage[] = messages.map((content, index) => ({
      role: 'user',
      content,
      timestamp: new Date(Date.now() + index * 1000),
    }));

    return {
      id: 'test-session-id',
      projectName: 'test-project',
      agent: 'Claude Code',
      created: new Date(),
      updated: new Date(),
      status: 'active',
      messages: sessionMessages,
    };
  };

  describe('analyze', () => {
    it('should analyze a simple conversation', () => {
      const session = createTestSession([
        'I want to build a todo app',
        'It should have user authentication',
        'Users should be able to create, edit, and delete tasks',
      ]);

      const analysis = analyzer.analyze(session);

      expect(analysis.summary).toBeTruthy();
      expect(analysis.keyRequirements.length).toBeGreaterThan(0);
    });

    it('should extract summary from conversation', () => {
      const session = createTestSession([
        'Build a real-time chat application with WebSocket support',
      ]);

      const analysis = analyzer.analyze(session);

      expect(analysis.summary).toContain('chat');
    });

    it('should extract multiple key requirements', () => {
      const session = createTestSession([
        'I need to implement OAuth authentication',
        'Add rate limiting to the API',
        'Create a dashboard for analytics',
      ]);

      const analysis = analyzer.analyze(session);

      expect(analysis.keyRequirements.length).toBeGreaterThan(0);
    });

    it('should identify technical constraints', () => {
      const session = createTestSession([
        'Use TypeScript for type safety',
        'The database must be PostgreSQL',
        'Deploy using Docker containers',
      ]);

      const analysis = analyzer.analyze(session);

      expect(analysis.technicalConstraints.length).toBeGreaterThan(0);
    });

    it('should extract success criteria', () => {
      const session = createTestSession([
        'Success when users can log in and manage tasks',
        'The app must handle 1000 concurrent users',
      ]);

      const analysis = analyzer.analyze(session);

      expect(analysis.successCriteria.length).toBeGreaterThan(0);
    });

    it('should identify out-of-scope items', () => {
      const session = createTestSession([
        'We need basic authentication',
        "Don't include social media login",
        'Skip the mobile app for now',
      ]);

      const analysis = analyzer.analyze(session);

      expect(analysis.outOfScope.length).toBeGreaterThan(0);
    });

    it('should handle empty conversation', () => {
      const session = createTestSession([]);

      const analysis = analyzer.analyze(session);

      expect(analysis.summary).toBeTruthy();
      expect(analysis.keyRequirements).toEqual([]);
    });

    it('should handle single message conversation', () => {
      const session = createTestSession([
        'Build a simple blog with posts and comments',
      ]);

      const analysis = analyzer.analyze(session);

      expect(analysis.summary).toContain('blog');
    });
  });

  describe('generateMiniPrd', () => {
    it('should generate a mini-PRD document', () => {
      const session = createTestSession([
        'Create a task management system',
        'Users should authenticate with email/password',
        'Tasks have title, description, and due date',
      ]);

      const analysis = analyzer.analyze(session);
      const miniPrd = analyzer.generateMiniPrd(session, analysis);

      expect(miniPrd).toContain('# Mini-PRD');
      expect(miniPrd).toContain(session.projectName);
      expect(miniPrd).toContain('## Summary');
    });

    it('should include key requirements section', () => {
      const session = createTestSession([
        'Need to implement user authentication',
        'Add task CRUD operations',
      ]);

      const analysis = analyzer.analyze(session);
      const miniPrd = analyzer.generateMiniPrd(session, analysis);

      expect(miniPrd).toContain('## Key Requirements');
    });

    it('should include technical constraints if present', () => {
      const session = createTestSession([
        'Use React for the frontend',
        'Backend must be Node.js with Express',
      ]);

      const analysis = analyzer.analyze(session);
      const miniPrd = analyzer.generateMiniPrd(session, analysis);

      expect(miniPrd).toContain('## Technical Constraints');
    });

    it('should include success criteria', () => {
      const session = createTestSession([
        'Users must be able to sign up and log in',
      ]);

      const analysis = analyzer.analyze(session);
      const miniPrd = analyzer.generateMiniPrd(session, analysis);

      expect(miniPrd).toContain('## Success Criteria');
    });

    it('should include metadata section', () => {
      const session = createTestSession(['Test message']);

      const analysis = analyzer.analyze(session);
      const miniPrd = analyzer.generateMiniPrd(session, analysis);

      expect(miniPrd).toContain('**Conversation Details:**');
      expect(miniPrd).toContain('Session ID:');
      expect(miniPrd).toContain('Messages:');
    });
  });

  describe('generateOptimizedPrompt', () => {
    it('should generate an optimized prompt', () => {
      const session = createTestSession([
        'Build an e-commerce shopping cart',
        'Users can add items, update quantities, and checkout',
      ]);

      const analysis = analyzer.analyze(session);
      const prompt = analyzer.generateOptimizedPrompt(session, analysis);

      expect(prompt).toContain('# Development Task');
      expect(prompt).toContain(session.projectName);
      expect(prompt).toContain('## Objective');
    });

    it('should include numbered core requirements', () => {
      const session = createTestSession([
        'Implement user registration',
        'Add email verification',
        'Create user profile page',
      ]);

      const analysis = analyzer.analyze(session);
      const prompt = analyzer.generateOptimizedPrompt(session, analysis);

      expect(prompt).toContain('## Core Requirements');
      expect(prompt).toMatch(/\d+\./); // Should have numbered items
    });

    it('should format success criteria as checkboxes', () => {
      const session = createTestSession([
        'Success when all tests pass',
      ]);

      const analysis = analyzer.analyze(session);
      const prompt = analyzer.generateOptimizedPrompt(session, analysis);

      expect(prompt).toContain('- [ ]'); // Checkbox format
    });

    it('should include development instructions', () => {
      const session = createTestSession(['Build a simple API']);

      const analysis = analyzer.analyze(session);
      const prompt = analyzer.generateOptimizedPrompt(session, analysis);

      expect(prompt).toContain('**Development Instructions:**');
      expect(prompt).toContain('production-quality');
    });

    it('should handle out-of-scope items', () => {
      const session = createTestSession([
        'Build a web app',
        "Don't include mobile version",
      ]);

      const analysis = analyzer.analyze(session);
      const prompt = analyzer.generateOptimizedPrompt(session, analysis);

      if (analysis.outOfScope.length > 0) {
        expect(prompt).toContain('## Explicitly Out of Scope');
        expect(prompt).toContain('Do NOT implement');
      }
    });
  });

  describe('requirement extraction patterns', () => {
    it('should extract "need to" statements', () => {
      const session = createTestSession([
        'I need to implement password reset functionality',
      ]);

      const analysis = analyzer.analyze(session);

      expect(analysis.keyRequirements.some((req) =>
        req.toLowerCase().includes('password')
      )).toBe(true);
    });

    it('should extract "want to" statements', () => {
      const session = createTestSession([
        'I want to add real-time notifications',
      ]);

      const analysis = analyzer.analyze(session);

      expect(analysis.keyRequirements.some((req) =>
        req.toLowerCase().includes('notification')
      )).toBe(true);
    });

    it('should extract "should" statements', () => {
      const session = createTestSession([
        'The app should support dark mode',
      ]);

      const analysis = analyzer.analyze(session);

      expect(analysis.keyRequirements.some((req) =>
        req.toLowerCase().includes('dark mode')
      )).toBe(true);
    });

    it('should extract "implement/add/create" statements', () => {
      const session = createTestSession([
        'Implement search functionality',
        'Add pagination to the list',
        'Create user settings page',
      ]);

      const analysis = analyzer.analyze(session);

      expect(analysis.keyRequirements.length).toBeGreaterThan(0);
    });
  });

  describe('technical constraint detection', () => {
    it('should detect programming languages', () => {
      const session = createTestSession([
        'Use TypeScript for the entire codebase',
      ]);

      const analysis = analyzer.analyze(session);

      expect(analysis.technicalConstraints.some((c) =>
        c.toLowerCase().includes('typescript')
      )).toBe(true);
    });

    it('should detect database mentions', () => {
      const session = createTestSession([
        'Store data in MongoDB',
      ]);

      const analysis = analyzer.analyze(session);

      expect(analysis.technicalConstraints.some((c) =>
        c.toLowerCase().includes('mongodb')
      )).toBe(true);
    });

    it('should detect framework mentions', () => {
      const session = createTestSession([
        'Use React for the frontend',
      ]);

      const analysis = analyzer.analyze(session);

      expect(analysis.technicalConstraints.some((c) =>
        c.toLowerCase().includes('react')
      )).toBe(true);
    });

    it('should detect authentication methods', () => {
      const session = createTestSession([
        'Implement OAuth 2.0 authentication',
      ]);

      const analysis = analyzer.analyze(session);

      expect(analysis.technicalConstraints.some((c) =>
        c.toLowerCase().includes('oauth')
      )).toBe(true);
    });
  });
});
