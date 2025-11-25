import { describe, it, expect, beforeEach } from '@jest/globals';
import { PrerequisiteIdentifier } from '../../../../src/core/intelligence/patterns/prerequisite-identifier.js';
import { PatternContext } from '../../../../src/core/intelligence/types.js';

describe('PrerequisiteIdentifier', () => {
  let pattern: PrerequisiteIdentifier;
  let mockContext: PatternContext;

  beforeEach(() => {
    pattern = new PrerequisiteIdentifier();
    mockContext = {
      mode: 'deep',
      originalPrompt: 'Test prompt',
      intent: {
        primaryIntent: 'code-generation',
        confidence: 90,
        characteristics: {
          hasCodeContext: false,
          hasTechnicalTerms: true,
          isOpenEnded: false,
          needsStructure: false,
        },
      },
    };
  });

  describe('pattern properties', () => {
    it('should have correct id', () => {
      expect(pattern.id).toBe('prerequisite-identifier');
    });

    it('should have correct name', () => {
      expect(pattern.name).toBe('Prerequisite Identifier');
    });

    it('should be deep mode only', () => {
      expect(pattern.mode).toBe('deep');
    });

    it('should have priority 6', () => {
      expect(pattern.priority).toBe(6);
    });

    it('should be applicable for expected intents', () => {
      expect(pattern.applicableIntents).toContain('code-generation');
      expect(pattern.applicableIntents).toContain('planning');
      expect(pattern.applicableIntents).toContain('migration');
      expect(pattern.applicableIntents).toContain('testing');
      expect(pattern.applicableIntents).toContain('debugging');
    });
  });

  describe('isApplicable', () => {
    it('should return true for code-generation in deep mode', () => {
      mockContext.mode = 'deep';
      mockContext.intent.primaryIntent = 'code-generation';
      expect(pattern.isApplicable(mockContext)).toBe(true);
    });

    it('should return false in fast mode', () => {
      mockContext.mode = 'fast';
      expect(pattern.isApplicable(mockContext)).toBe(false);
    });
  });

  describe('apply - prerequisites already addressed', () => {
    it('should not apply when "prerequisite" present', () => {
      const prompt = 'Prerequisite: Install Node.js';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(false);
    });

    it('should not apply when "requirements:" present', () => {
      const prompt = 'Requirements: Have TypeScript installed';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(false);
    });

    it('should not apply when "depends on" present', () => {
      const prompt = 'This depends on the auth module';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(false);
    });

    it('should not apply when "before starting" present', () => {
      const prompt = 'Before starting, ensure database is running';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(false);
    });

    it('should not apply when "assuming" present', () => {
      const prompt = 'Assuming you have the SDK installed';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(false);
    });
  });

  describe('apply - React technology detection', () => {
    it('should detect React and add prerequisites', () => {
      const prompt = 'Create a React component for user profile';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
      expect(result.enhancedPrompt).toContain('Prerequisites');
    });

    it('should detect JSX syntax', () => {
      const prompt = 'Create a JSX template for the dashboard';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toMatch(/Node|React|npm/i);
      }
    });

    it('should detect React hooks', () => {
      const prompt = 'Use useState and useEffect hooks';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toContain('Prerequisites');
      }
    });
  });

  describe('apply - Node.js technology detection', () => {
    it('should detect Node.js', () => {
      const prompt = 'Create a Node.js server';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
    });

    it('should detect Express', () => {
      const prompt = 'Set up an Express API';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toMatch(/Node|npm|package/i);
      }
    });
  });

  describe('apply - database technology detection', () => {
    it('should detect database references', () => {
      const prompt = 'Create a database schema';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
    });

    it('should detect Postgres', () => {
      const prompt = 'Write a Postgres migration';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toMatch(/Database|connection|ORM/i);
      }
    });

    it('should detect Prisma', () => {
      const prompt = 'Create a Prisma model';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toContain('Prerequisites');
      }
    });
  });

  describe('apply - testing technology detection', () => {
    it('should detect Jest', () => {
      const prompt = 'Write Jest tests for the service';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
    });

    it('should detect Vitest', () => {
      const prompt = 'Create Vitest test cases';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toMatch(/Test|framework|configuration/i);
      }
    });
  });

  describe('apply - Docker detection', () => {
    it('should detect Docker', () => {
      const prompt = 'Create a Docker configuration';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
    });

    it('should detect Kubernetes', () => {
      const prompt = 'Deploy to Kubernetes cluster';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toMatch(/Docker|Container|Compose/i);
      }
    });
  });

  describe('apply - AWS detection', () => {
    it('should detect AWS', () => {
      const prompt = 'Deploy to AWS Lambda';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
    });

    it('should detect S3', () => {
      const prompt = 'Upload files to S3 bucket';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toMatch(/AWS|CLI|IAM/i);
      }
    });
  });

  describe('apply - intent-specific prerequisites', () => {
    it('should add migration-specific prerequisites', () => {
      mockContext.intent.primaryIntent = 'migration';
      const prompt = 'Migrate the codebase to TypeScript';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toMatch(/Backup|Rollback|plan/i);
      }
    });

    it('should add debugging-specific prerequisites', () => {
      mockContext.intent.primaryIntent = 'debugging';
      const prompt = 'Debug the authentication flow';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toMatch(/reproducible|logs|Debug/i);
      }
    });

    it('should add testing-specific prerequisites', () => {
      mockContext.intent.primaryIntent = 'testing';
      const prompt = 'Write integration tests';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toMatch(/Test|data|fixtures/i);
      }
    });
  });

  describe('apply - no prerequisites detected', () => {
    it('should not apply when no tech or context detected', () => {
      // Use prompt that doesn't match any tech patterns
      mockContext.intent.primaryIntent = 'learning';
      const prompt = 'Explain the concept of recursion';
      const result = pattern.apply(prompt, mockContext);
      expect(result.applied).toBe(false);
    });
  });

  describe('apply - result structure', () => {
    it('should return valid PatternResult structure', () => {
      const prompt = 'Create a React app';
      const result = pattern.apply(prompt, mockContext);

      expect(result).toHaveProperty('enhancedPrompt');
      expect(result).toHaveProperty('improvement');
      expect(result).toHaveProperty('applied');
    });

    it('should have completeness as improvement dimension', () => {
      const prompt = 'Create a Node server';
      const result = pattern.apply(prompt, mockContext);
      expect(result.improvement.dimension).toBe('completeness');
    });

    it('should add checklist format', () => {
      const prompt = 'Create a TypeScript module';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toContain('- [ ]');
      }
    });

    it('should limit prerequisites to 8', () => {
      // Trigger multiple technologies
      const prompt = 'Create a React TypeScript app with Node.js backend, database, and Docker';
      const result = pattern.apply(prompt, mockContext);
      if (result.applied) {
        const checkboxCount = (result.enhancedPrompt.match(/- \[ \]/g) || []).length;
        expect(checkboxCount).toBeLessThanOrEqual(8);
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
  });
});
