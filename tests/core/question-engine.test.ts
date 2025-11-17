import { QuestionEngine } from '../../src/core/question-engine';
import fs from 'fs-extra';
import * as path from 'path';
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('QuestionEngine', () => {
  let engine: QuestionEngine;
  const testDir = path.join(__dirname, '../tmp/question-engine-test');

  beforeEach(async () => {
    engine = new QuestionEngine();
    await fs.ensureDir(testDir);
    process.chdir(testDir);
  });

  afterEach(async () => {
    process.chdir(path.join(__dirname, '../..'));
    await fs.remove(testDir);
  });

  describe('template parsing', () => {
    it('should parse a simple template with one question', async () => {
      const template = `# Test Flow

This is a test flow

## Question 1

**text:** What is your name?
**type:** text
**required:** true
`;

      await fs.writeFile('test-template.md', template);
      const flow = await engine.loadFlow('test-template.md');

      expect(flow.name).toBe('Test Flow');
      expect(flow.description).toBe('This is a test flow');
      expect(flow.questions.length).toBe(1);
      expect(flow.questions[0].id).toBe('q1');
      expect(flow.questions[0].text).toBe('What is your name?');
      expect(flow.questions[0].type).toBe('text');
      expect(flow.questions[0].required).toBe(true);
    });

    it('should parse multiple questions with different types', async () => {
      const template = `# Multi-Question Flow

Test multiple question types

## Question 1

**text:** Enter your email
**type:** text
**required:** true
**validation:** email

## Question 2

**text:** Select your framework
**type:** list
**required:** true
**choices:** React, Vue, Angular, Other

## Question 3

**text:** Do you need authentication?
**type:** confirm
**required:** true
**default:** true
`;

      await fs.writeFile('multi-template.md', template);
      const flow = await engine.loadFlow('multi-template.md');

      expect(flow.questions.length).toBe(3);

      // First question - text with email validation
      expect(flow.questions[0].type).toBe('text');
      expect(flow.questions[0].validate).toBeDefined();

      // Second question - list with choices
      expect(flow.questions[1].type).toBe('list');
      expect(flow.questions[1].choices).toEqual(['React', 'Vue', 'Angular', 'Other']);

      // Third question - confirm with default
      expect(flow.questions[2].type).toBe('confirm');
      expect(flow.questions[2].default).toBe(true);
    });

    it('should parse optional questions', async () => {
      const template = `# Optional Flow

Test optional questions

## Question 1

**text:** Required question
**type:** text
**required:** true

## Question 2

**text:** Optional question
**type:** text
**required:** false
`;

      await fs.writeFile('optional-template.md', template);
      const flow = await engine.loadFlow('optional-template.md');

      expect(flow.questions[0].required).toBe(true);
      expect(flow.questions[1].required).toBe(false);
    });
  });

  describe('validation', () => {
    it('should validate minLength', async () => {
      const template = `# Validation Flow

Test validation

## Question 1

**text:** Enter description
**type:** text
**validation:** minLength:10
`;

      await fs.writeFile('validation-template.md', template);
      await engine.loadFlow('validation-template.md');

      const question = engine.getNextQuestion();
      expect(question).toBeDefined();

      if (question && question.validate) {
        expect(question.validate('short')).toBe('Minimum length is 10 characters');
        expect(question.validate('this is long enough')).toBe(true);
      }
    });

    it('should validate email format', async () => {
      const template = `# Email Flow

Test email validation

## Question 1

**text:** Enter email
**type:** text
**validation:** email
`;

      await fs.writeFile('email-template.md', template);
      await engine.loadFlow('email-template.md');

      const question = engine.getNextQuestion();
      if (question && question.validate) {
        expect(question.validate('not-an-email')).toBe('Please enter a valid email address');
        expect(question.validate('test@example.com')).toBe(true);
      }
    });
  });

  describe('question flow', () => {
    it('should get next question in sequence', async () => {
      const template = `# Sequential Flow

Test sequential questions

## Question 1

**text:** First question
**type:** text

## Question 2

**text:** Second question
**type:** text
`;

      await fs.writeFile('sequential-template.md', template);
      await engine.loadFlow('sequential-template.md');

      const q1 = engine.getNextQuestion();
      expect(q1?.text).toBe('First question');

      engine.submitAnswer('q1', 'Answer 1');

      const q2 = engine.getNextQuestion();
      expect(q2?.text).toBe('Second question');
    });

    it('should return null when flow is complete', async () => {
      const template = `# Single Question Flow

One question only

## Question 1

**text:** Only question
**type:** text
`;

      await fs.writeFile('single-template.md', template);
      await engine.loadFlow('single-template.md');

      engine.submitAnswer('q1', 'My answer');

      const nextQuestion = engine.getNextQuestion();
      expect(nextQuestion).toBeNull();
    });
  });

  describe('conditional questions', () => {
    it('should show conditional question when condition is met', async () => {
      const template = `# Conditional Flow

Test conditional questions

## Question 1

**text:** Do you need auth?
**type:** confirm

## Question 2

**text:** Which auth method?
**type:** list
**condition:** q1=true
**choices:** JWT, OAuth, Session
`;

      await fs.writeFile('conditional-template.md', template);
      await engine.loadFlow('conditional-template.md');

      // Answer yes to first question
      engine.submitAnswer('q1', true);

      // Should show second question
      const q2 = engine.getNextQuestion();
      expect(q2).toBeDefined();
      expect(q2?.text).toBe('Which auth method?');
    });

    it('should skip conditional question when condition is not met', async () => {
      const template = `# Conditional Skip Flow

Test skipping conditional questions

## Question 1

**text:** Do you need auth?
**type:** confirm

## Question 2

**text:** Which auth method?
**type:** text
**condition:** q1=true
`;

      await fs.writeFile('conditional-skip-template.md', template);
      await engine.loadFlow('conditional-skip-template.md');

      // Answer no to first question
      engine.submitAnswer('q1', false);

      // Should not show second question
      const q2 = engine.getNextQuestion();
      expect(q2).toBeNull();
    });
  });

  describe('answer collection', () => {
    it('should collect and return answers', async () => {
      const template = `# Answer Collection

Test answer collection

## Question 1

**text:** First question
**type:** text

## Question 2

**text:** Second question
**type:** text
`;

      await fs.writeFile('answers-template.md', template);
      await engine.loadFlow('answers-template.md');

      engine.submitAnswer('q1', 'Answer 1');
      engine.submitAnswer('q2', 'Answer 2');

      const answers = engine.getAnswers();
      expect(answers.q1).toBe('Answer 1');
      expect(answers.q2).toBe('Answer 2');
    });

    it('should validate required fields', async () => {
      const template = `# Required Fields

Test required validation

## Question 1

**text:** Required question
**type:** text
**required:** true
`;

      await fs.writeFile('required-template.md', template);
      await engine.loadFlow('required-template.md');

      const result = engine.submitAnswer('q1', '');
      expect(result).toBe('This question is required');
    });
  });

  describe('progress tracking', () => {
    it('should track progress correctly', async () => {
      const template = `# Progress Flow

Test progress tracking

## Question 1

**text:** Question 1
**type:** text

## Question 2

**text:** Question 2
**type:** text

## Question 3

**text:** Question 3
**type:** text
`;

      await fs.writeFile('progress-template.md', template);
      await engine.loadFlow('progress-template.md');

      let progress = engine.getProgress();
      expect(progress.current).toBe(0);
      expect(progress.total).toBe(3);
      expect(progress.percentage).toBe(0);

      engine.submitAnswer('q1', 'Answer 1');
      progress = engine.getProgress();
      expect(progress.current).toBe(1);
      expect(progress.percentage).toBe(33);

      engine.submitAnswer('q2', 'Answer 2');
      progress = engine.getProgress();
      expect(progress.current).toBe(2);
      expect(progress.percentage).toBe(67);

      engine.submitAnswer('q3', 'Answer 3');
      progress = engine.getProgress();
      expect(progress.current).toBe(3);
      expect(progress.percentage).toBe(100);
    });
  });

  describe('isComplete', () => {
    it('should return true when all required questions are answered', async () => {
      const template = `# Completion Check

Test completion

## Question 1

**text:** Required question
**type:** text
**required:** true
`;

      await fs.writeFile('complete-template.md', template);
      await engine.loadFlow('complete-template.md');

      expect(engine.isComplete()).toBe(false);

      engine.submitAnswer('q1', 'My answer');

      expect(engine.isComplete()).toBe(true);
    });
  });

  describe('default PRD template', () => {
    it('should load and parse the default PRD questions template', async () => {
      const templatePath = path.join(__dirname, '../../src/templates/prd-questions.md');
      const flow = await engine.loadFlow(templatePath);

      expect(flow.name).toBe('PRD Question Flow');
      expect(flow.description).toContain('Product Requirements Document');
      expect(flow.questions.length).toBe(5);

      // Verify first question
      expect(flow.questions[0].text).toContain('What are we building and why');
      expect(flow.questions[0].type).toBe('text');
      expect(flow.questions[0].required).toBe(true);

      // Verify some questions are optional
      const optionalQuestions = flow.questions.filter((q) => !q.required);
      expect(optionalQuestions.length).toBeGreaterThan(0);

      // Verify validations exist on required questions
      const questionsWithValidation = flow.questions.filter((q) => q.validate);
      expect(questionsWithValidation.length).toBeGreaterThan(0);
    });
  });
});
