/**
 * QuestionEngine - Manages Socratic questioning flows for PRD generation
 *
 * This class handles:
 * - Loading question templates
 * - Sequential and conditional question flows
 * - Answer collection and validation
 * - Progress tracking
 */

import fs from 'fs-extra';
import * as path from 'path';

/**
 * Type of question input
 */
export type QuestionType = 'text' | 'list' | 'confirm';

/**
 * A single question in the flow
 */
export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  required: boolean;
  choices?: string[];
  default?: string | boolean;
  validate?: (answer: string) => boolean | string;
  condition?: (answers: Record<string, Answer>) => boolean;
}

/**
 * Answer to a question
 */
export type Answer = string | boolean | string[];

/**
 * Collection of answers keyed by question ID
 */
export interface Answers {
  [questionId: string]: Answer;
}

/**
 * Question flow configuration
 */
export interface QuestionFlow {
  name: string;
  description: string;
  questions: Question[];
}

/**
 * Progress information for multi-question flows
 */
export interface QuestionProgress {
  current: number;
  total: number;
  percentage: number;
}

/**
 * QuestionEngine class
 *
 * Manages the flow of questions, answer collection, and validation
 */
export class QuestionEngine {
  private currentFlow: QuestionFlow | null = null;
  private answers: Answers = {};
  private currentQuestionIndex = 0;

  /**
   * Load a question flow from a template file
   *
   * @param templatePath - Path to the question template
   * @returns The loaded question flow
   */
  async loadFlow(templatePath: string): Promise<QuestionFlow> {
    const fullPath = path.resolve(templatePath);

    if (!await fs.pathExists(fullPath)) {
      throw new Error(`Question template not found: ${templatePath}`);
    }

    const content = await fs.readFile(fullPath, 'utf-8');
    const flow = this.parseTemplate(content);

    this.currentFlow = flow;
    this.answers = {};
    this.currentQuestionIndex = 0;

    return flow;
  }

  /**
   * Parse a question template into a QuestionFlow
   *
   * Template format:
   * ```markdown
   * # Flow Name
   *
   * Flow description
   *
   * ## Question 1
   *
   * **text:** What problem are you solving?
   * **type:** text
   * **required:** true
   * **validation:** minLength:10
   *
   * ## Question 2
   *
   * **text:** Select your technology stack
   * **type:** list
   * **choices:** React, Vue, Angular, Other
   * ```
   *
   * @param template - Template content
   * @returns Parsed QuestionFlow
   */
  private parseTemplate(template: string): QuestionFlow {
    const lines = template.split('\n');
    const questions: Question[] = [];

    let name = 'Default Flow';
    let description = '';
    let currentQuestion: Partial<Question> | null = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Skip empty lines
      if (!line) {
        continue;
      }

      // Extract flow name from first h1
      if (line.startsWith('# ') && name === 'Default Flow') {
        name = line.substring(2).trim();
        continue;
      }

      // Extract description (first non-heading paragraph)
      if (line && !line.startsWith('#') && !line.startsWith('**') && !description) {
        description = line;
        continue;
      }

      // Start new question on h2
      if (line.startsWith('## ')) {
        // Save previous question if exists
        if (currentQuestion && currentQuestion.text) {
          questions.push(this.finalizeQuestion(currentQuestion, questions.length));
        }

        // Start new question
        currentQuestion = {};
        continue;
      }

      // Parse question metadata: **key:** value
      const metadataMatch = line.match(/^\*\*(\w+):\*\*\s*(.+)$/);
      if (metadataMatch && currentQuestion) {
        const [, key, value] = metadataMatch;
        this.parseQuestionMetadata(currentQuestion, key, value);
      }
    }

    // Save last question
    if (currentQuestion && currentQuestion.text) {
      questions.push(this.finalizeQuestion(currentQuestion, questions.length));
    }

    return { name, description, questions };
  }

  /**
   * Parse a single metadata field for a question
   */
  private parseQuestionMetadata(
    question: Partial<Question>,
    key: string,
    value: string
  ): void {
    switch (key.toLowerCase()) {
      case 'text':
        question.text = value;
        break;

      case 'type':
        if (value === 'text' || value === 'list' || value === 'confirm') {
          question.type = value;
        }
        break;

      case 'required':
        question.required = value.toLowerCase() === 'true';
        break;

      case 'choices':
        question.choices = value.split(',').map((c) => c.trim());
        break;

      case 'default':
        if (question.type === 'confirm') {
          question.default = value.toLowerCase() === 'true';
        } else {
          question.default = value;
        }
        break;

      case 'validation':
        question.validate = this.createValidator(value);
        break;

      case 'condition':
        question.condition = this.createCondition(value);
        break;
    }
  }

  /**
   * Finalize a question by setting defaults and generating ID
   */
  private finalizeQuestion(
    partial: Partial<Question>,
    index: number
  ): Question {
    return {
      id: `q${index + 1}`,
      text: partial.text || '',
      type: partial.type || 'text',
      required: partial.required !== undefined ? partial.required : true,
      choices: partial.choices,
      default: partial.default,
      validate: partial.validate,
      condition: partial.condition,
    };
  }

  /**
   * Create a validation function from a validation string
   *
   * Supported formats:
   * - minLength:10 - Minimum length
   * - maxLength:100 - Maximum length
   * - pattern:^[a-z]+$ - Regex pattern
   * - email - Email validation
   * - url - URL validation
   */
  private createValidator(
    validationStr: string
  ): (answer: string) => boolean | string {
    const parts = validationStr.split(':');
    const type = parts[0].toLowerCase();
    const param = parts[1];

    return (answer: string): boolean | string => {
      switch (type) {
        case 'minlength':
          if (answer.length < parseInt(param, 10)) {
            return `Minimum length is ${param} characters`;
          }
          break;

        case 'maxlength':
          if (answer.length > parseInt(param, 10)) {
            return `Maximum length is ${param} characters`;
          }
          break;

        case 'pattern':
          if (!new RegExp(param).test(answer)) {
            return 'Answer does not match required format';
          }
          break;

        case 'email':
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(answer)) {
            return 'Please enter a valid email address';
          }
          break;

        case 'url':
          try {
            new URL(answer);
          } catch {
            return 'Please enter a valid URL';
          }
          break;
      }

      return true;
    };
  }

  /**
   * Create a condition function from a condition string
   *
   * Supported formats:
   * - q1=true - Question 1 answer equals true
   * - q2=JWT - Question 2 answer equals "JWT"
   * - q3!=None - Question 3 answer not equals "None"
   */
  private createCondition(
    conditionStr: string
  ): (answers: Record<string, Answer>) => boolean {
    const match = conditionStr.match(/^(\w+)\s*(=|!=)\s*(.+)$/);
    if (!match) {
      return () => true;
    }

    const [, questionId, operator, expectedValue] = match;

    return (answers: Record<string, Answer>): boolean => {
      const actualValue = answers[questionId];

      // Convert expected value to proper type
      let expected: Answer = expectedValue;
      if (expectedValue.toLowerCase() === 'true') {
        expected = true;
      } else if (expectedValue.toLowerCase() === 'false') {
        expected = false;
      }

      if (operator === '=') {
        return actualValue === expected;
      } else {
        return actualValue !== expected;
      }
    };
  }

  /**
   * Get the next question in the flow
   *
   * @returns The next question, or null if flow is complete
   */
  getNextQuestion(): Question | null {
    if (!this.currentFlow) {
      throw new Error('No question flow loaded');
    }

    // Find the next unanswered question that meets its condition
    while (this.currentQuestionIndex < this.currentFlow.questions.length) {
      const question = this.currentFlow.questions[this.currentQuestionIndex];

      // Skip if already answered
      if (question.id in this.answers) {
        this.currentQuestionIndex++;
        continue;
      }

      // Check if question condition is met (if it has one)
      if (question.condition && !question.condition(this.answers)) {
        this.currentQuestionIndex++;
        continue;
      }

      return question;
    }

    return null;
  }

  /**
   * Submit an answer to the current question
   *
   * @param questionId - ID of the question being answered
   * @param answer - The answer
   * @returns Validation result (true if valid, error message if invalid)
   */
  submitAnswer(questionId: string, answer: Answer): boolean | string {
    if (!this.currentFlow) {
      throw new Error('No question flow loaded');
    }

    const question = this.currentFlow.questions.find((q) => q.id === questionId);
    if (!question) {
      throw new Error(`Question not found: ${questionId}`);
    }

    // Validate required fields (but allow false for boolean answers)
    if (question.required && (answer === '' || answer === null || answer === undefined)) {
      return 'This question is required';
    }

    // Run custom validation if provided
    if (question.validate) {
      const validationResult = question.validate(String(answer));
      if (validationResult !== true) {
        return validationResult;
      }
    }

    // Store the answer
    this.answers[questionId] = answer;
    this.currentQuestionIndex++;

    return true;
  }

  /**
   * Get all collected answers
   *
   * @returns All answers collected so far
   */
  getAnswers(): Answers {
    return { ...this.answers };
  }

  /**
   * Get current progress through the question flow
   *
   * @returns Progress information
   */
  getProgress(): QuestionProgress {
    if (!this.currentFlow) {
      return { current: 0, total: 0, percentage: 0 };
    }

    const total = this.currentFlow.questions.length;
    const current = Object.keys(this.answers).length;
    const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

    return { current, total, percentage };
  }

  /**
   * Check if the question flow is complete
   *
   * @returns True if all required questions are answered
   */
  isComplete(): boolean {
    if (!this.currentFlow) {
      return false;
    }

    // Check if all required questions have answers
    for (const question of this.currentFlow.questions) {
      // Skip if condition not met
      if (question.condition && !question.condition(this.answers)) {
        continue;
      }

      if (question.required && !(question.id in this.answers)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Reset the question flow
   */
  reset(): void {
    this.answers = {};
    this.currentQuestionIndex = 0;
  }

  /**
   * Get the current question flow
   *
   * @returns The loaded question flow, or null if none loaded
   */
  getCurrentFlow(): QuestionFlow | null {
    return this.currentFlow;
  }
}
