/**
 * ConversationAnalyzer - extractKeyRequirements tests
 * 
 * Tests extractKeyRequirements with diverse phrasings and edge cases
 */

import { ConversationAnalyzer } from '../../src/core/conversation-analyzer';
import { Session, SessionMessage } from '../../src/types/session';
import { describe, it, expect, beforeEach } from '@jest/globals';

describe('ConversationAnalyzer - extractKeyRequirements', () => {
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

  describe('diverse requirement phrasings', () => {
    it('should extract "need to" statements', () => {
      const session = createTestSession([
        'I need to implement user authentication',
        'We need to add database migrations',
        'The system needs to support file uploads',
      ]);

      const analysis = analyzer.analyze(session);

      expect(analysis.keyRequirements.length).toBeGreaterThan(0);
      expect(
        analysis.keyRequirements.some((req) =>
          req.toLowerCase().includes('authentication') ||
          req.toLowerCase().includes('user')
        )
      ).toBe(true);
    });

    it('should extract "want to" statements', () => {
      const session = createTestSession([
        'I want to add real-time notifications',
        'We want to improve performance',
        'Users want to customize their dashboard',
      ]);

      const analysis = analyzer.analyze(session);

      expect(analysis.keyRequirements.length).toBeGreaterThan(0);
      expect(
        analysis.keyRequirements.some((req) =>
          req.toLowerCase().includes('notification') ||
          req.toLowerCase().includes('real-time')
        )
      ).toBe(true);
    });

    it('should extract "should" statements', () => {
      const session = createTestSession([
        'The app should validate email addresses',
        'Users should be able to export data',
        'The system should send confirmation emails',
      ]);

      const analysis = analyzer.analyze(session);

      expect(analysis.keyRequirements.length).toBeGreaterThan(0);
      expect(
        analysis.keyRequirements.some((req) =>
          req.toLowerCase().includes('email') ||
          req.toLowerCase().includes('validate') ||
          req.toLowerCase().includes('export')
        )
      ).toBe(true);
    });

    it('should extract "must" statements', () => {
      const session = createTestSession([
        'The API must handle rate limiting',
        'Data must be encrypted at rest',
        'Passwords must meet complexity requirements',
      ]);

      const analysis = analyzer.analyze(session);

      expect(analysis.keyRequirements.length).toBeGreaterThan(0);
      expect(
        analysis.keyRequirements.some((req) =>
          req.toLowerCase().includes('rate') ||
          req.toLowerCase().includes('encrypt') ||
          req.toLowerCase().includes('password')
        )
      ).toBe(true);
    });

    it('should extract "require/requires" statements', () => {
      const session = createTestSession([
        'This requires OAuth integration',
        'The feature requires admin approval',
        'Users require access to analytics',
      ]);

      const analysis = analyzer.analyze(session);

      expect(analysis.keyRequirements.length).toBeGreaterThan(0);
      expect(
        analysis.keyRequirements.some((req) =>
          req.toLowerCase().includes('oauth') ||
          req.toLowerCase().includes('admin') ||
          req.toLowerCase().includes('analytics')
        )
      ).toBe(true);
    });

    it('should extract "implement" action statements', () => {
      const session = createTestSession([
        'Implement search functionality',
        'Implement caching layer',
        'Implement WebSocket connections',
      ]);

      const analysis = analyzer.analyze(session);

      expect(analysis.keyRequirements.length).toBeGreaterThan(0);
      expect(
        analysis.keyRequirements.some((req) =>
          req.toLowerCase().includes('search') ||
          req.toLowerCase().includes('caching') ||
          req.toLowerCase().includes('websocket')
        )
      ).toBe(true);
    });

    it('should extract "add" action statements', () => {
      const session = createTestSession([
        'Add pagination to the list view',
        'Add two-factor authentication',
        'Add export to CSV feature',
      ]);

      const analysis = analyzer.analyze(session);

      expect(analysis.keyRequirements.length).toBeGreaterThan(0);
      expect(
        analysis.keyRequirements.some((req) =>
          req.toLowerCase().includes('pagination') ||
          req.toLowerCase().includes('two-factor') ||
          req.toLowerCase().includes('csv')
        )
      ).toBe(true);
    });

    it('should extract "create" action statements', () => {
      const session = createTestSession([
        'Create a REST API endpoint',
        'Create user profile page',
        'Create automated backup system',
      ]);

      const analysis = analyzer.analyze(session);

      expect(analysis.keyRequirements.length).toBeGreaterThan(0);
      expect(
        analysis.keyRequirements.some((req) =>
          req.toLowerCase().includes('api') ||
          req.toLowerCase().includes('profile') ||
          req.toLowerCase().includes('backup')
        )
      ).toBe(true);
    });

    it('should extract "build" action statements', () => {
      const session = createTestSession([
        'Build a reporting dashboard',
        'Build notification system',
        'Build payment integration',
      ]);

      const analysis = analyzer.analyze(session);

      expect(analysis.keyRequirements.length).toBeGreaterThan(0);
      expect(
        analysis.keyRequirements.some((req) =>
          req.toLowerCase().includes('dashboard') ||
          req.toLowerCase().includes('notification') ||
          req.toLowerCase().includes('payment')
        )
      ).toBe(true);
    });

    it('should extract "develop" action statements', () => {
      const session = createTestSession([
        'Develop API documentation',
        'Develop mobile-responsive layout',
        'Develop error handling',
      ]);

      const analysis = analyzer.analyze(session);

      expect(analysis.keyRequirements.length).toBeGreaterThan(0);
      expect(
        analysis.keyRequirements.some((req) =>
          req.toLowerCase().includes('documentation') ||
          req.toLowerCase().includes('mobile') ||
          req.toLowerCase().includes('error')
        )
      ).toBe(true);
    });

    it('should extract "feature:" format statements', () => {
      const session = createTestSession([
        'Feature: User can reset password',
        'Feature: Admin dashboard with analytics',
        'Functionality: Real-time collaboration',
      ]);

      const analysis = analyzer.analyze(session);

      expect(analysis.keyRequirements.length).toBeGreaterThan(0);
      expect(
        analysis.keyRequirements.some((req) =>
          req.toLowerCase().includes('password') ||
          req.toLowerCase().includes('dashboard') ||
          req.toLowerCase().includes('collaboration')
        )
      ).toBe(true);
    });
  });

  describe('complex and mixed phrasings', () => {
    it('should handle multiple requirements in one message', () => {
      const session = createTestSession([
        'I need to implement user authentication. The system should also support OAuth. Users want to reset passwords.',
      ]);

      const analysis = analyzer.analyze(session);

      expect(analysis.keyRequirements.length).toBeGreaterThan(1);
    });

    it('should handle imperative statements without modal verbs', () => {
      const session = createTestSession([
        'Add pagination to the user list',
        'Enable dark mode',
        'Support multiple languages',
      ]);

      const analysis = analyzer.analyze(session);

      expect(analysis.keyRequirements.length).toBeGreaterThan(0);
    });

    it('should handle conversational natural language', () => {
      const session = createTestSession([
        "I'm thinking we should build a chat feature",
        "It would be great to have notifications",
        "Maybe we could add search functionality",
      ]);

      const analysis = analyzer.analyze(session);

      expect(analysis.keyRequirements.length).toBeGreaterThan(0);
    });

    it('should handle technical jargon and abbreviations', () => {
      const session = createTestSession([
        'Need to add JWT authentication',
        'Implement CRUD operations for users',
        'Add REST API with GraphQL support',
      ]);

      const analysis = analyzer.analyze(session);

      expect(analysis.keyRequirements.length).toBeGreaterThan(0);
      expect(
        analysis.keyRequirements.some((req) =>
          req.toLowerCase().includes('jwt') ||
          req.toLowerCase().includes('crud') ||
          req.toLowerCase().includes('api')
        )
      ).toBe(true);
    });

    it('should handle questions that imply requirements', () => {
      const session = createTestSession([
        'How do we implement user authentication?',
        'What about adding pagination?',
        'Can we support file uploads?',
      ]);

      const analysis = analyzer.analyze(session);

      // Questions should still be captured as requirements
      expect(analysis.keyRequirements.length).toBeGreaterThan(0);
    });
  });

  describe('edge cases and accuracy', () => {
    it('should filter out very short requirements', () => {
      const session = createTestSession([
        'I need to add authentication and authorization',
        'Add CSS',
        'The system should have comprehensive error handling',
      ]);

      const analysis = analyzer.analyze(session);

      // Very short requirements (< 10 chars) should be filtered out
      expect(
        analysis.keyRequirements.every((req) => req.length >= 10)
      ).toBe(true);
    });

    it('should filter out very long requirements', () => {
      const session = createTestSession([
        'I need to ' + 'a'.repeat(300), // Very long text
        'Add user authentication',
      ]);

      const analysis = analyzer.analyze(session);

      // Very long requirements (> 200 chars) should be filtered out
      expect(
        analysis.keyRequirements.every((req) => req.length <= 200)
      ).toBe(true);
    });

    it('should remove duplicate requirements', () => {
      const session = createTestSession([
        'I need to implement user authentication',
        'Need to implement user authentication',
        'implement user authentication',
      ]);

      const analysis = analyzer.analyze(session);

      // Should deduplicate similar requirements
      const authReqs = analysis.keyRequirements.filter((req) =>
        req.toLowerCase().includes('authentication')
      );

      expect(authReqs.length).toBeLessThanOrEqual(2);
    });

    it('should limit the number of requirements extracted', () => {
      const manyMessages = Array.from({ length: 20 }, (_, i) => 
        `Requirement ${i + 1}: Implement feature number ${i + 1}`
      );

      const session = createTestSession(manyMessages);
      const analysis = analyzer.analyze(session);

      // Should limit to reasonable number (10 in implementation)
      expect(analysis.keyRequirements.length).toBeLessThanOrEqual(10);
    });

    it('should clean up extracted text', () => {
      const session = createTestSession([
        '  I need to    implement   user   authentication  ',
        'Add    pagination   with   proper   spacing',
      ]);

      const analysis = analyzer.analyze(session);

      // Should normalize whitespace
      expect(
        analysis.keyRequirements.every((req) => !req.includes('  '))
      ).toBe(true);
    });

    it('should handle empty or whitespace-only messages', () => {
      const session = createTestSession([
        '',
        '   ',
        'I need to implement authentication',
        '\t\n',
      ]);

      const analysis = analyzer.analyze(session);

      expect(analysis.keyRequirements.length).toBeGreaterThan(0);
    });

    it('should handle special characters and punctuation', () => {
      const session = createTestSession([
        'Need to add OAuth 2.0 authentication!',
        'Implement RESTful API (v2).',
        'Add user@domain.com validation?',
      ]);

      const analysis = analyzer.analyze(session);

      expect(analysis.keyRequirements.length).toBeGreaterThan(0);
      expect(
        analysis.keyRequirements.some((req) =>
          req.includes('OAuth') || req.includes('API')
        )
      ).toBe(true);
    });
  });

  describe('accuracy of extraction', () => {
    it('should accurately extract requirements from a realistic conversation', () => {
      const session = createTestSession([
        'I want to build a todo application',
        'Users need to create, edit, and delete tasks',
        'The app should support task prioritization',
        'We need user authentication with email/password',
        'Add due dates and reminders for tasks',
      ]);

      const analysis = analyzer.analyze(session);

      expect(analysis.keyRequirements.length).toBeGreaterThan(3);
      
      // Check that key concepts are captured
      const allReqs = analysis.keyRequirements.join(' ').toLowerCase();
      expect(allReqs).toContain('task');
      expect(allReqs).toMatch(/authentication|email|password/);
    });

    it('should extract requirements from technical specifications', () => {
      const session = createTestSession([
        'Implement JWT-based authentication',
        'Add Redis caching layer for session data',
        'Create PostgreSQL database schema',
        'Build REST API with rate limiting',
        'Add WebSocket support for real-time updates',
      ]);

      const analysis = analyzer.analyze(session);

      expect(analysis.keyRequirements.length).toBeGreaterThan(3);
      
      const allReqs = analysis.keyRequirements.join(' ').toLowerCase();
      expect(allReqs).toMatch(/jwt|authentication/);
      expect(allReqs).toMatch(/redis|caching/);
      expect(allReqs).toMatch(/api|rest/);
    });

    it('should handle mixed formal and informal language', () => {
      const session = createTestSession([
        "So basically, I'm thinking we need a login page",
        'Users should be able to sign up with email',
        "Also, maybe we could add social login? That'd be cool",
        'The system must validate all inputs',
      ]);

      const analysis = analyzer.analyze(session);

      expect(analysis.keyRequirements.length).toBeGreaterThan(2);
      
      const allReqs = analysis.keyRequirements.join(' ').toLowerCase();
      expect(allReqs).toMatch(/login|sign|email/);
    });
  });

  describe('non-matching patterns', () => {
    it('should capture direct statements that do not match patterns', () => {
      const session = createTestSession([
        'User dashboard with analytics',
        'Real-time chat messaging',
        'File upload and download',
      ]);

      const analysis = analyzer.analyze(session);

      // Direct statements should be captured even without modal verbs
      expect(analysis.keyRequirements.length).toBeGreaterThan(0);
    });

    it('should handle sentences ending with various punctuation', () => {
      const session = createTestSession([
        'Need authentication.',
        'Add pagination!',
        'Support dark mode?',
        'Implement search...',
      ]);

      const analysis = analyzer.analyze(session);

      expect(analysis.keyRequirements.length).toBeGreaterThan(0);
    });
  });
});
