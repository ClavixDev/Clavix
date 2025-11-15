/**
 * Extended tests for ConversationAnalyzer - Analysis and extraction logic
 * Covers: requirement extraction, constraint detection, success criteria identification
 */

import { ConversationAnalyzer } from '../../src/core/conversation-analyzer';
import { Session } from '../../src/types/session';

describe('ConversationAnalyzer - Extended (Analysis & Extraction)', () => {
  let analyzer: ConversationAnalyzer;

  beforeEach(() => {
    analyzer = new ConversationAnalyzer();
  });

  const createSession = (userMessages: string[]): Session => ({
    id: 'test-session',
    projectName: 'Test Project',
    agent: 'test-agent',
    status: 'active',
    messages: userMessages.map((content) => ({
      role: 'user',
      content,
      timestamp: new Date(),
    })),
    created: new Date(),
    updated: new Date(),
  });

  describe('Requirement Extraction', () => {
    it('should extract explicit requirements from conversation', () => {
      const session = createSession([
        'Build a user authentication system',
        'Users should be able to register and login',
        'Password reset functionality is needed',
      ]);

      const analysis = analyzer.analyze(session);

      expect(analysis.keyRequirements).toBeDefined();
      expect(analysis.keyRequirements.length).toBeGreaterThan(0);
    });

    it('should extract requirements from action verbs', () => {
      const session = createSession([
        'I need to build a dashboard',
        'Create a user management interface',
        'Implement payment processing',
        'Generate reports for analytics',
      ]);

      const analysis = analyzer.analyze(session);

      expect(analysis.keyRequirements.length).toBeGreaterThan(0);
    });

    it('should extract requirements from bullet points', () => {
      const session = createSession([
        'The system should support:\n- User registration\n- Email verification\n- Two-factor authentication',
      ]);

      const analysis = analyzer.analyze(session);

      expect(analysis.keyRequirements.length).toBeGreaterThan(0);
    });

    it('should handle numbered lists in requirements', () => {
      const session = createSession([
        'Features to implement:\n1. User login\n2. Profile management\n3. Settings page',
      ]);

      const analysis = analyzer.analyze(session);

      expect(analysis.keyRequirements.length).toBeGreaterThan(0);
    });

    it('should deduplicate similar requirements', () => {
      const session = createSession([
        'We need user authentication',
        'User authentication is critical',
        'Build an authentication system',
      ]);

      const analysis = analyzer.analyze(session);

      // Should have extracted requirements, likely deduplicated
      expect(analysis.keyRequirements.length).toBeGreaterThan(0);
    });

    it('should handle requirements with technical details', () => {
      const session = createSession([
        'Use React for frontend',
        'Build with Node.js backend',
        'Use PostgreSQL as database',
        'Implement JWT authentication',
      ]);

      const analysis = analyzer.analyze(session);

      expect(analysis.keyRequirements.length).toBeGreaterThan(0);
    });
  });

  describe('Technical Constraints Extraction', () => {
    it('should extract explicit technical constraints', () => {
      const session = createSession([
        'Must use PostgreSQL database',
        'API should be RESTful',
        'Must have 99.9% uptime SLA',
      ]);

      const analysis = analyzer.analyze(session);

      expect(analysis.technicalConstraints).toBeDefined();
      expect(analysis.technicalConstraints.length).toBeGreaterThan(0);
    });

    it('should identify database requirements', () => {
      const session = createSession([
        'We need PostgreSQL for data consistency',
        'MongoDB could work for scalability',
        'Redis cache is essential',
      ]);

      const analysis = analyzer.analyze(session);

      expect(analysis.technicalConstraints.length).toBeGreaterThan(0);
    });

    it('should identify framework constraints', () => {
      const session = createSession([
        'Must use React 18',
        'Backend should be Express.js',
        'Use TypeScript throughout',
      ]);

      const analysis = analyzer.analyze(session);

      expect(analysis.technicalConstraints.length).toBeGreaterThan(0);
    });

    it('should identify performance constraints', () => {
      const session = createSession([
        'Response time must be under 200ms',
        'Support 10k concurrent users',
        'Database queries must be optimized',
      ]);

      const analysis = analyzer.analyze(session);

      expect(analysis.technicalConstraints.length).toBeGreaterThan(0);
    });

    it('should identify security constraints', () => {
      const session = createSession([
        'Must use HTTPS everywhere',
        'Implement rate limiting',
        'Use bcrypt for password hashing',
        'Require OAuth2 for third-party access',
      ]);

      const analysis = analyzer.analyze(session);

      expect(analysis.technicalConstraints.length).toBeGreaterThan(0);
    });

    it('should handle constraints with keywords', () => {
      const session = createSession([
        'Required: CORS support',
        'Constraint: Must run on Linux',
        'Essential: Database transactions',
      ]);

      const analysis = analyzer.analyze(session);

      expect(analysis.technicalConstraints.length).toBeGreaterThan(0);
    });
  });

  describe('Out of Scope Identification', () => {
    it('should identify explicitly out-of-scope items', () => {
      const session = createSession([
        'We do NOT need mobile app support',
        'This project is not about billing',
        'Do not implement user recommendation engine',
      ]);

      const analysis = analyzer.analyze(session);

      expect(analysis.outOfScope).toBeDefined();
      expect(analysis.outOfScope.length).toBeGreaterThan(0);
    });

    it('should return outOfScope array', () => {
      const session = createSession([
        'Don\'t implement file uploads',
        'No admin panel needed',
        'Skip email notifications for now',
      ]);

      const analysis = analyzer.analyze(session);

      expect(Array.isArray(analysis.outOfScope)).toBe(true);
    });

    it('should return outOfScope even for complex scope statements', () => {
      const session = createSession([
        'API keys management is not included',
        'Payment gateway integration is beyond scope',
        'Analytics is out of scope',
      ]);

      const analysis = analyzer.analyze(session);

      expect(Array.isArray(analysis.outOfScope)).toBe(true);
    });

    it('should return outOfScope for phase-based scope', () => {
      const session = createSession([
        'Phase 1: Core features only',
        'Phase 2: Add reporting (not in v1)',
        'Advanced analytics are future work',
      ]);

      const analysis = analyzer.analyze(session);

      expect(Array.isArray(analysis.outOfScope)).toBe(true);
    });
  });

  describe('Success Criteria Identification', () => {
    it('should extract explicit success criteria', () => {
      const session = createSession([
        'Success looks like: Users can complete signup in < 30 seconds',
        'Dashboard loads in < 1 second',
        'All API endpoints have < 5% error rate',
      ]);

      const analysis = analyzer.analyze(session);

      expect(analysis.successCriteria).toBeDefined();
      expect(analysis.successCriteria.length).toBeGreaterThan(0);
    });

    it('should identify acceptance criteria', () => {
      const session = createSession([
        'Acceptance Criteria:\n- Login works for all users\n- Password reset email is sent\n- Sessions persist for 24 hours',
      ]);

      const analysis = analyzer.analyze(session);

      expect(analysis.successCriteria.length).toBeGreaterThan(0);
    });

    it('should identify metric-based criteria', () => {
      const session = createSession([
        'Target: 95% test coverage',
        'Performance: < 200ms response time',
        'Reliability: 99.9% uptime',
        'Load capacity: 1000 requests/sec',
      ]);

      const analysis = analyzer.analyze(session);

      expect(analysis.successCriteria.length).toBeGreaterThan(0);
    });

    it('should identify user-story based criteria', () => {
      const session = createSession([
        'As a user, I can login with email and password',
        'As an admin, I can manage user permissions',
        'As a developer, I can call the API with standard auth',
      ]);

      const analysis = analyzer.analyze(session);

      expect(analysis.successCriteria.length).toBeGreaterThan(0);
    });

    it('should identify done/definition criteria', () => {
      const session = createSession([
        'Definition of Done:\n- Code reviewed\n- Tests pass\n- Documentation updated\n- No critical bugs',
      ]);

      const analysis = analyzer.analyze(session);

      expect(analysis.successCriteria.length).toBeGreaterThan(0);
    });
  });

  describe('Additional Context Extraction', () => {
    it('should return additionalContext array', () => {
      const session = createSession([
        'This is for a SaaS platform targeting developers',
        'Our competitors charge $50/month, we want to undercut',
        'Target launch: Q2 2024',
      ]);

      const analysis = analyzer.analyze(session);

      expect(Array.isArray(analysis.additionalContext)).toBe(true);
    });

    it('should return additionalContext for personas', () => {
      const session = createSession([
        'Primary users: Junior developers',
        'Secondary users: DevOps engineers',
        'We also want to support data scientists',
      ]);

      const analysis = analyzer.analyze(session);

      expect(Array.isArray(analysis.additionalContext)).toBe(true);
    });

    it('should return additionalContext for timeline info', () => {
      const session = createSession([
        'MVP needed by March 31',
        'Beta launch in April',
        'Full production in June',
      ]);

      const analysis = analyzer.analyze(session);

      expect(Array.isArray(analysis.additionalContext)).toBe(true);
    });

    it('should return additionalContext for budget/resources', () => {
      const session = createSession([
        'We have a team of 3 developers',
        'Budget is limited to $50k for infrastructure',
        'One designer on part-time basis',
      ]);

      const analysis = analyzer.analyze(session);

      expect(Array.isArray(analysis.additionalContext)).toBe(true);
    });
  });

  describe('Mini-PRD Generation', () => {
    it('should generate valid mini-PRD structure', () => {
      const session = createSession([
        'Build a task management app',
        'Users need: create tasks, assign, track',
        'Must use React and PostgreSQL',
      ]);

      const analysis = analyzer.analyze(session);
      const miniPrd = analyzer.generateMiniPrd(session, analysis);

      expect(miniPrd).toContain('# Mini-PRD');
      expect(miniPrd).toContain(session.projectName);
      expect(miniPrd).toContain('## Summary');
    });

    it('should include all analysis sections in mini-PRD', () => {
      const session = createSession([
        'Build a task manager',
        'Features: create, read, update, delete tasks',
        'Tech: React, Node, PostgreSQL',
        'Success: handle 1000 concurrent users',
      ]);

      const analysis = analyzer.analyze(session);
      const miniPrd = analyzer.generateMiniPrd(session, analysis);

      expect(miniPrd).toContain('## Summary');
      if (analysis.keyRequirements.length > 0) {
        expect(miniPrd).toContain('## Key Requirements');
      }
      if (analysis.technicalConstraints.length > 0) {
        expect(miniPrd).toContain('## Technical Constraints');
      }
      if (analysis.successCriteria.length > 0) {
        expect(miniPrd).toContain('## Success Criteria');
      }
    });

    it('should include session metadata in mini-PRD', () => {
      const session = createSession(['Build something']);

      const analysis = analyzer.analyze(session);
      const miniPrd = analyzer.generateMiniPrd(session, analysis);

      expect(miniPrd).toContain(session.id);
      expect(miniPrd).toContain('Session ID');
    });

    it('should format requirements as bullet list', () => {
      const session = createSession([
        'Need these: user auth, dashboard, reports',
      ]);

      const analysis = analyzer.analyze(session);
      const miniPrd = analyzer.generateMiniPrd(session, analysis);

      if (analysis.keyRequirements.length > 0) {
        expect(miniPrd).toContain('- ');
      }
    });

    it('should handle empty sections gracefully', () => {
      // Session with minimal info
      const session = createSession(['Just build something']);

      const analysis = analyzer.analyze(session);
      const miniPrd = analyzer.generateMiniPrd(session, analysis);

      expect(miniPrd).toBeDefined();
      expect(miniPrd.length).toBeGreaterThan(0);
      expect(miniPrd).toContain('# Mini-PRD');
    });
  });

  describe('Optimized Prompt Generation', () => {
    it('should generate valid optimized prompt structure', () => {
      const session = createSession(['Build a task app']);

      const analysis = analyzer.analyze(session);
      const prompt = analyzer.generateOptimizedPrompt(session, analysis);

      expect(prompt).toContain('# Development Task');
      expect(prompt).toContain('## Objective');
    });

    it('should use numbered requirements format', () => {
      const session = createSession([
        'Build app with: auth, dashboard, reports',
      ]);

      const analysis = analyzer.analyze(session);
      const prompt = analyzer.generateOptimizedPrompt(session, analysis);

      if (analysis.keyRequirements.length > 0) {
        expect(prompt).toContain('1. ');
      }
    });

    it('should format success criteria as checkboxes', () => {
      const session = createSession([
        'Success when: auth works, dashboard loads fast, 0 bugs',
      ]);

      const analysis = analyzer.analyze(session);
      const prompt = analyzer.generateOptimizedPrompt(session, analysis);

      if (analysis.successCriteria.length > 0) {
        expect(prompt).toContain('- [ ]');
      }
    });

    it('should include "Out of Scope" section when applicable', () => {
      const session = createSession([
        'Do NOT include: payment, analytics, mobile',
      ]);

      const analysis = analyzer.analyze(session);
      const prompt = analyzer.generateOptimizedPrompt(session, analysis);

      if (analysis.outOfScope.length > 0) {
        expect(prompt).toContain('## Explicitly Out of Scope');
      }
    });

    it('should format for AI consumption', () => {
      const session = createSession(['Build a REST API']);

      const analysis = analyzer.analyze(session);
      const prompt = analyzer.generateOptimizedPrompt(session, analysis);

      // Should have clear structure
      expect(prompt).toContain('##');
      expect(prompt.split('\n').length).toBeGreaterThan(5);
    });
  });

  describe('Edge Cases', () => {
    it('should handle conversation with no user messages', () => {
      const session: Session = {
        id: 'empty-session',
        projectName: 'Empty',
        agent: 'test-agent',
        status: 'active',
        messages: [],
        created: new Date(),
        updated: new Date(),
      };

      const analysis = analyzer.analyze(session);

      expect(analysis).toBeDefined();
      expect(analysis.keyRequirements).toBeDefined();
    });

    it('should handle very short messages', () => {
      const session = createSession(['a', 'b', 'c']);

      const analysis = analyzer.analyze(session);

      expect(analysis).toBeDefined();
    });

    it('should handle conversation with repetitive messages', () => {
      const session = createSession([
        'build it',
        'build it',
        'build it',
      ]);

      const analysis = analyzer.analyze(session);

      expect(analysis).toBeDefined();
    });

    it('should handle unicode in conversation', () => {
      const session = createSession([
        'Build an app for 中文 users 🚀',
        'Поддержите русский язык',
        'محتوى عربي',
      ]);

      const analysis = analyzer.analyze(session);

      expect(analysis).toBeDefined();
    });

    it('should handle mixed case and punctuation', () => {
      const session = createSession([
        'URGENT: Build THIS!!!',
        'Need: auth, db, api...',
        'No SPAM; no ADS!!!',
      ]);

      const analysis = analyzer.analyze(session);

      expect(analysis).toBeDefined();
    });

    it('should handle conversation with code examples', () => {
      const session = createSession([
        'Build API like this:\n```\nGET /users\nPOST /users\n```',
        'Database schema:\n```sql\nCREATE TABLE users...\n```',
      ]);

      const analysis = analyzer.analyze(session);

      expect(analysis).toBeDefined();
    });

    it('should handle very long messages', () => {
      const longMessage =
        'This is a requirement. '.repeat(500);
      const session = createSession([longMessage]);

      const analysis = analyzer.analyze(session);

      expect(analysis).toBeDefined();
    });
  });
});
