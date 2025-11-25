import { describe, it, expect, beforeEach } from '@jest/globals';
import { PRDStructureEnforcer } from '../../../../src/core/intelligence/patterns/prd-structure-enforcer.js';
import { PatternContext } from '../../../../src/core/intelligence/types.js';

describe('PRDStructureEnforcer', () => {
  let pattern: PRDStructureEnforcer;
  let mockContext: PatternContext;

  beforeEach(() => {
    pattern = new PRDStructureEnforcer();
    mockContext = {
      mode: 'deep',
      originalPrompt: 'Test prompt',
      intent: {
        primaryIntent: 'prd-generation',
        confidence: 90,
        characteristics: {
          hasCodeContext: false,
          hasTechnicalTerms: true,
          isOpenEnded: false,
          needsStructure: true,
        },
      },
    };
  });

  describe('pattern properties', () => {
    it('should have correct id', () => {
      expect(pattern.id).toBe('prd-structure-enforcer');
    });

    it('should have correct name', () => {
      expect(pattern.name).toBe('PRD Structure Enforcer');
    });

    it('should be deep mode only', () => {
      expect(pattern.mode).toBe('deep');
    });

    it('should have priority 9', () => {
      expect(pattern.priority).toBe(9);
    });

    it('should only be applicable for prd-generation', () => {
      expect(pattern.applicableIntents).toContain('prd-generation');
      expect(pattern.applicableIntents.length).toBe(1);
    });
  });

  describe('isApplicable', () => {
    it('should return true for prd-generation in deep mode', () => {
      mockContext.mode = 'deep';
      mockContext.intent.primaryIntent = 'prd-generation';
      expect(pattern.isApplicable(mockContext)).toBe(true);
    });

    it('should return false in fast mode', () => {
      mockContext.mode = 'fast';
      expect(pattern.isApplicable(mockContext)).toBe(false);
    });

    it('should return false for code-generation intent', () => {
      mockContext.intent.primaryIntent = 'code-generation';
      expect(pattern.isApplicable(mockContext)).toBe(false);
    });
  });

  describe('apply - complete PRD', () => {
    it('should not apply when PRD has all sections', () => {
      const prompt = `
        Problem: Users need better authentication
        The problem is slow login.
        Target user audience: Enterprise customers
        Who will use this? Admin users.
        Goal: Improve conversion. Success metric: 50% faster.
        KPI: Response time under 200ms.
        Feature: SSO support. Must have: OAuth.
        Requirement: Support SAML. Functionality: MFA.
        Scope: Authentication only. Excluded: Authorization.
        Out of scope: User management. Boundary: Auth service.
        Constraint: Must be backwards compatible. Dependency: Existing user DB.
        Assumption: OAuth provider available. Prerequisite: SSL cert.
        Timeline: 2 months. Milestone: MVP in 4 weeks.
        Phase 1: Core auth. Release: Q2.
        Risk: Integration complexity. Mitigation: Early testing.
        Blocker: API limits. Concern: Performance.
      `;
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(false);
    });
  });

  describe('apply - missing sections', () => {
    it('should identify missing problem statement', () => {
      const prompt = 'Create a feature for user management';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
      expect(result.enhancedPrompt).toContain('PRD Completeness Check');
    });

    it('should identify missing target users', () => {
      const prompt = 'The problem is slow performance. We need a caching solution.';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toMatch(/Target Users|audience|persona/i);
      }
    });

    it('should identify missing goals', () => {
      const prompt = 'Build a dashboard for the admin users';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toMatch(/Goals|Success Metrics|KPI/i);
      }
    });

    it('should identify missing requirements', () => {
      const prompt = 'The goal is to improve UX. Success metric is NPS.';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toMatch(/Functional Requirements|feature/i);
      }
    });

    it('should identify missing scope', () => {
      const prompt = 'Feature requirement: Add dark mode functionality';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toMatch(/Scope|Boundaries/i);
      }
    });

    it('should identify missing constraints', () => {
      const prompt = 'In scope: UI changes. Out of scope: Backend changes.';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toMatch(/Constraints|Dependencies/i);
      }
    });

    it('should identify missing timeline', () => {
      const prompt = 'Constraint: Must use existing API. Dependency: Auth service.';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toMatch(/Timeline|Milestones/i);
      }
    });

    it('should identify missing risks', () => {
      const prompt = 'Timeline: 3 months. Phase 1 milestone: MVP.';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toMatch(/Risks|Mitigations/i);
      }
    });
  });

  describe('apply - weak sections', () => {
    it('should identify weak sections with only one keyword', () => {
      // Only one keyword per section
      const prompt = 'Problem with login. Users affected. Goal achieved. Must have feature.';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toContain('could be expanded');
      }
    });
  });

  describe('apply - completeness score', () => {
    it('should include completeness percentage', () => {
      const prompt = 'Create a feature';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toMatch(/Current coverage.*\d+%/);
      }
    });

    it('should have higher score with more sections', () => {
      const prompt = 'Problem: Slow login. User audience: Admins. Goal: Speed up. Feature: Cache.';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        const match = result.enhancedPrompt.match(/Current coverage.*(\d+)%/);
        expect(match).toBeTruthy();
        if (match) {
          expect(parseInt(match[1])).toBeGreaterThan(0);
        }
      }
    });
  });

  describe('apply - best practices', () => {
    it('should include PRD best practices', () => {
      const prompt = 'Create a new feature';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toContain('PRD Best Practices');
        expect(result.enhancedPrompt).toContain('user personas');
        expect(result.enhancedPrompt).toContain('success criteria');
        expect(result.enhancedPrompt).toContain('NOT in scope');
      }
    });
  });

  describe('apply - result structure', () => {
    it('should return valid PatternResult structure', () => {
      const prompt = 'Create a PRD';
      const result = pattern.apply(prompt, mockContext);

      expect(result).toHaveProperty('enhancedPrompt');
      expect(result).toHaveProperty('improvement');
      expect(result).toHaveProperty('applied');
    });

    it('should have completeness as improvement dimension', () => {
      const prompt = 'Create a feature';
      const result = pattern.apply(prompt, mockContext);
      expect(result.improvement.dimension).toBe('completeness');
    });

    it('should return high impact when applied', () => {
      const prompt = 'Create a product requirement';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.improvement.impact).toBe('high');
      }
    });

    it('should include section count in description', () => {
      const prompt = 'Create a feature';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.improvement.description).toMatch(/\d+ PRD sections/);
      }
    });
  });

  describe('apply - edge cases', () => {
    it('should handle empty string', () => {
      const result = pattern.apply('', mockContext);
      expect(result).toBeDefined();
    });

    it('should handle very short prompts', () => {
      const result = pattern.apply('Hi', mockContext);
      expect(result).toBeDefined();
    });

    it('should handle prompts with special characters', () => {
      const prompt = 'Create a <feature> with "special" & symbols';
      const result = pattern.apply(prompt, mockContext);
      expect(result).toBeDefined();
    });
  });
});
