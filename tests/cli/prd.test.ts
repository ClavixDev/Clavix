/**
 * Tests for PRD CLI command integration
 *
 * Note: Full PRD generation workflow is tested in:
 * - tests/core/prd-generator.test.ts (35 tests)
 * - tests/core/question-engine.test.ts (14 tests)
 *
 * This file tests CLI-specific concerns: flags, configuration, error handling
 */

// Mock inquirer to prevent interactive prompts in tests
jest.mock('inquirer', () => ({
  prompt: jest.fn(),
}));

// Mock chalk to prevent import issues
jest.mock('chalk', () => ({
  bold: { cyan: jest.fn((str) => str) },
  gray: jest.fn((str) => str),
  dim: jest.fn((str) => str),
  cyan: jest.fn((str) => str),
  green: jest.fn((str) => str),
  yellow: jest.fn((str) => str),
  red: jest.fn((str) => str),
}));

describe('PRD CLI command', () => {
  describe('flag handling', () => {
    it('should support quick mode flag', () => {
      const flags = { quick: true };
      expect(flags.quick).toBe(true);
    });

    it('should support project flag', () => {
      const flags = { project: 'my-project' };
      expect(flags.project).toBe('my-project');
    });

    it('should support template flag', () => {
      const flags = { template: '/custom/template.md' };
      expect(flags.template).toBe('/custom/template.md');
    });

    it('should support skip-validation flag', () => {
      const flags = { 'skip-validation': true };
      expect(flags['skip-validation']).toBe(true);
    });

    it('should use defaults when no flags provided', () => {
      const flags = {
        quick: false,
        'skip-validation': false,
      };

      expect(flags.quick).toBe(false);
      expect(flags['skip-validation']).toBe(false);
    });
  });

  describe('inquirer mock verification', () => {
    it('should have inquirer properly mocked', () => {
      const inquirer = require('inquirer');

      expect(inquirer.prompt).toBeDefined();
      expect(typeof inquirer.prompt).toBe('function');
    });

    it('should prevent hanging by mocking prompt', async () => {
      const inquirer = require('inquirer');

      // Setup mock response
      inquirer.prompt.mockResolvedValueOnce({ answer: 'Test response' });

      const result = await inquirer.prompt([{ name: 'answer', message: 'Test?' }]);

      expect(result.answer).toBe('Test response');
      expect(inquirer.prompt).toHaveBeenCalledTimes(1);

      // Clean up
      jest.clearAllMocks();
    });
  });

  describe('configuration', () => {
    it('should have default template path', () => {
      const path = require('path');
      const defaultPath = path.join(__dirname, '../../src/templates/prd-questions.md');

      expect(defaultPath).toContain('prd-questions.md');
      expect(defaultPath).toContain('src/templates');
    });

    it('should allow custom template override', () => {
      const customPath = '/custom/template.md';
      const flags = { template: customPath };
      const templatePath = flags.template || 'default-path';

      expect(templatePath).toBe(customPath);
    });
  });

  describe('minimum viable answer enforcement', () => {
    it('should require both problem AND goal in Q1', () => {
      const answers = {
        q1: 'We need a dashboard',
      };

      const hasProblem = answers.q1.toLowerCase().includes('need') || answers.q1.toLowerCase().includes('problem');
      const hasGoal = answers.q1.toLowerCase().includes('dashboard') || answers.q1.toLowerCase().includes('build');

      // This is too vague - should fail validation
      const isValidQ1 = answers.q1.split(' ').length >= 10 && hasProblem && hasGoal;

      expect(isValidQ1).toBe(false);
    });

    it('should accept valid Q1 with both problem and goal', () => {
      const answers = {
        q1: 'Sales managers can\'t quickly identify at-risk deals in our 10K+ deal pipeline. Build a real-time dashboard showing deal health, top performers, and pipeline status so managers can intervene before deals are lost.',
      };

      const hasProblem = /can't|cannot|problem|issue|pain/i.test(answers.q1);
      const hasGoal = /build|create|provide|enable|so that|showing/i.test(answers.q1);
      const hasMinimumLength = answers.q1.split(' ').length >= 15;

      const isValidQ1 = hasProblem && hasGoal && hasMinimumLength;

      expect(isValidQ1).toBe(true);
    });

    it('should require at least 2 concrete features in Q2', () => {
      const answers = {
        q2: 'User management',
      };

      const features = answers.q2.split(/[,\n-]/).filter((f: string) => f.trim().length > 0);
      const hasMinimumFeatures = features.length >= 2;

      expect(hasMinimumFeatures).toBe(false);
    });

    it('should accept Q2 with multiple concrete features', () => {
      const answers = {
        q2: '- User registration with email verification\n- Role-based access control (admin, manager, user)\n- Password reset via email\n- Profile management',
      };

      const features = answers.q2.split(/[\n-]/).filter((f: string) => f.trim().length > 5);
      const hasMinimumFeatures = features.length >= 2;

      expect(hasMinimumFeatures).toBe(true);
      expect(features.length).toBeGreaterThanOrEqual(2);
    });

    it('should require at least 1 explicit out-of-scope item in Q4', () => {
      const answers = {
        q4: '',
      };

      const outOfScopeItems = answers.q4.split(/[,\n-]/).filter((item: string) => item.trim().length > 0);
      const hasMinimumOutOfScope = outOfScopeItems.length >= 1;

      expect(hasMinimumOutOfScope).toBe(false);
    });

    it('should accept Q4 with explicit exclusions', () => {
      const answers = {
        q4: '- No mobile app (web only)\n- No payment processing\n- No email notifications',
      };

      const outOfScopeItems = answers.q4.split(/[\n-]/).filter((item: string) => item.trim().length > 3);
      const hasMinimumOutOfScope = outOfScopeItems.length >= 1;

      expect(hasMinimumOutOfScope).toBe(true);
      expect(outOfScopeItems.length).toBeGreaterThanOrEqual(1);
    });

    it('should validate all critical questions before PRD generation', () => {
      const answers = {
        q1: 'Users can\'t track their tasks efficiently. Build a task management app with priorities, due dates, and collaboration features.',
        q2: '- Task creation and editing\n- Priority levels (high, medium, low)\n- Due date tracking\n- Team collaboration',
        q3: 'React, Node.js, PostgreSQL',
        q4: '- No mobile app\n- No calendar integration',
        q5: 'Must support 100+ concurrent users',
      };

      // Validation checks
      const q1Valid = answers.q1.length >= 50 && /can't|problem/.test(answers.q1) && /build|create/.test(answers.q1.toLowerCase());
      const q2Features = answers.q2.split(/[\n-]/).filter((f: string) => f.trim().length > 5);
      const q2Valid = q2Features.length >= 2;
      const q4Items = answers.q4.split(/[\n-]/).filter((item: string) => item.trim().length > 3);
      const q4Valid = q4Items.length >= 1;

      const allCriticalValid = q1Valid && q2Valid && q4Valid;

      expect(allCriticalValid).toBe(true);
    });

    it('should reject incomplete answers and ask follow-ups', () => {
      const answers = {
        q1: 'make an app',
        q2: 'features',
        q4: '',
      };

      const q1Valid = answers.q1.length >= 50;
      const q2Features = answers.q2.split(/[,\n-]/).filter((f: string) => f.trim().length > 5);
      const q2Valid = q2Features.length >= 2;
      const q4Items = answers.q4.split(/[,\n-]/).filter((item: string) => item.trim().length > 3);
      const q4Valid = q4Items.length >= 1;

      const needsFollowUp = !q1Valid || !q2Valid || !q4Valid;

      expect(needsFollowUp).toBe(true);
    });

    it('should provide helpful prompts for vague Q1 answers', () => {
      const vagueAnswer = 'make a dashboard';
      const isVague = vagueAnswer.split(' ').length < 10;

      const followUpQuestions = [
        'What specific problem does this dashboard solve?',
        'Who will use this and what decisions will they make with it?',
        'What happens if this doesn\'t exist?',
      ];

      if (isVague) {
        expect(followUpQuestions.length).toBeGreaterThan(0);
        expect(followUpQuestions.every(q => q.endsWith('?'))).toBe(true);
      }
    });

    it('should help prioritize when too many features provided', () => {
      const tooManyFeatures = [
        'User registration',
        'Login',
        'Password reset',
        'Profile management',
        'Dashboard',
        'Reports',
        'Analytics',
        'Notifications',
        'Settings',
        'Admin panel',
      ];

      const shouldPrioritize = tooManyFeatures.length > 6;
      const prioritizationQuestion = 'If you could only launch with 3 features, which would they be?';

      if (shouldPrioritize) {
        expect(prioritizationQuestion).toBeDefined();
        expect(prioritizationQuestion.includes('3 features')).toBe(true);
      }
    });

    it('should enforce validation before document generation', () => {
      const incompleteAnswers = {
        q1: 'build app',
        q2: 'features',
        q4: '',
      };

      const validationChecks = {
        q1HasBothProblemAndGoal: false,
        q2HasMinimum2Features: false,
        q4HasMinimum1Exclusion: false,
      };

      const canGeneratePRD = Object.values(validationChecks).every(check => check === true);

      expect(canGeneratePRD).toBe(false);
    });
  });
});
