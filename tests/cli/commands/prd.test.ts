/**
 * PRD Command Tests
 *
 * Direct tests for the PRD CLI command class.
 * Mocks QuestionEngine, PrdGenerator, and inquirer for isolated testing.
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import fs from 'fs-extra';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { createTestDir, cleanupTestDir } from '../../helpers/cli-helpers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// Mock Setup - Must be BEFORE imports
// ============================================================================

// Create mock functions
const mockPrompt = jest.fn<(questions: any[]) => Promise<any>>();
const mockLoadFlow = jest.fn<() => Promise<any>>();
const mockGetNextQuestion = jest.fn<() => any>();
const mockSubmitAnswer = jest.fn<() => void>();
const mockGetProgress = jest.fn<() => { current: number; total: number }>();
const mockGenerateFullPrd = jest.fn<() => Promise<void>>();
const mockGenerateQuickPrd = jest.fn<() => Promise<void>>();
const mockOptimize = jest.fn<() => Promise<any>>();

// Mock inquirer
jest.unstable_mockModule('inquirer', () => ({
  default: {
    prompt: mockPrompt,
    Separator: class Separator {
      type = 'separator';
      line?: string;
      constructor(line?: string) {
        this.line = line;
      }
    },
  },
}));

// Mock QuestionEngine
jest.unstable_mockModule('../../../src/core/question-engine.js', () => ({
  QuestionEngine: jest.fn().mockImplementation(() => ({
    loadFlow: mockLoadFlow,
    getNextQuestion: mockGetNextQuestion,
    submitAnswer: mockSubmitAnswer,
    getProgress: mockGetProgress,
  })),
}));

// Mock PrdGenerator
jest.unstable_mockModule('../../../src/core/prd-generator.js', () => ({
  PrdGenerator: jest.fn().mockImplementation(() => ({
    generateFullPrd: mockGenerateFullPrd,
    generateQuickPrd: mockGenerateQuickPrd,
  })),
}));

// Mock UniversalOptimizer
jest.unstable_mockModule('../../../src/core/intelligence/index.js', () => ({
  UniversalOptimizer: jest.fn().mockImplementation(() => ({
    optimize: mockOptimize,
  })),
}));

// ============================================================================
// Import command AFTER mocks
// ============================================================================

const { default: Prd } = await import('../../../src/cli/commands/prd.js');

// ============================================================================
// Test Helpers
// ============================================================================

/**
 * Run PRD command with proper mocking
 */
async function runPrdCommand(
  args: string[] = []
): Promise<{ stdout: string; stderr: string; exitCode: number; error?: Error }> {
  let stdout = '';
  let stderr = '';
  let exitCode = 0;
  let caughtError: Error | undefined;

  const mockOclifConfig = {
    runHook: jest.fn().mockResolvedValue({ successes: [], failures: [] }),
    bin: 'clavix',
    dirname: 'clavix',
    pjson: { version: '1.0.0' },
    plugins: [],
    topicSeparator: ' ',
  };

  const cmd = new Prd(args, mockOclifConfig as any);

  const logSpy = jest.spyOn(console, 'log').mockImplementation((...logArgs) => {
    stdout += logArgs.map((a) => String(a)).join(' ') + '\n';
  });
  const errorSpy = jest.spyOn(console, 'error').mockImplementation((...errArgs) => {
    stderr += errArgs.map((a) => String(a)).join(' ') + '\n';
  });

  // Mock process.exit to prevent actual exit
  const exitSpy = jest.spyOn(cmd, 'exit').mockImplementation((code?: number) => {
    if (code) exitCode = code;
    throw new Error(`Exit called with code ${code}`);
  });

  try {
    await cmd.run();
  } catch (err: any) {
    if (!err.message?.startsWith('Exit called')) {
      exitCode = 1;
      caughtError = err;
      if (err.message) {
        stderr += err.message + '\n';
      }
    }
  } finally {
    logSpy.mockRestore();
    errorSpy.mockRestore();
    exitSpy.mockRestore();
  }

  return { stdout, stderr, exitCode, error: caughtError };
}

/**
 * Create a mock question flow
 */
function createMockFlow() {
  return {
    name: 'PRD Questions',
    description: 'Answer these questions to generate your PRD',
    questions: [
      { id: 'whatBuilding', text: 'What are you building?', type: 'text', required: true },
      { id: 'coreFeatures', text: 'What are the core features?', type: 'text', required: true },
      { id: 'techStack', text: 'What tech stack?', type: 'text', required: false },
    ],
  };
}

/**
 * Create a mock optimization result
 */
function createMockOptimizationResult(overrides: Record<string, any> = {}) {
  return {
    original: 'PRD content',
    enhanced: 'Enhanced PRD content',
    depthLevel: 'standard',
    quality: {
      clarity: 85,
      structure: 80,
      completeness: 75,
      overall: 80,
      improvements: [],
      ...overrides.quality,
    },
    ...overrides,
  };
}

// ============================================================================
// Tests
// ============================================================================

describe('PRD Command', () => {
  let testDir: string;
  let originalCwd: string;
  let questionIndex: number;
  let questions: any[];

  beforeEach(async () => {
    // Reset all mocks
    jest.clearAllMocks();

    // Setup test directory
    testDir = await createTestDir('prd-cmd-test');
    originalCwd = process.cwd();
    process.chdir(testDir);

    // Initialize .clavix directory
    await fs.ensureDir(path.join(testDir, '.clavix', 'outputs'));

    // Setup mock question flow
    questions = [
      { id: 'whatBuilding', text: 'What are you building?', type: 'text', required: true },
      { id: 'coreFeatures', text: 'What are the core features?', type: 'text', required: true },
    ];
    questionIndex = 0;

    // Setup default mock behaviors
    mockLoadFlow.mockResolvedValue(createMockFlow());
    mockGetNextQuestion.mockImplementation(() => {
      if (questionIndex < questions.length) {
        return questions[questionIndex++];
      }
      return null;
    });
    mockGetProgress.mockImplementation(() => ({
      current: Math.min(questionIndex, questions.length - 1),
      total: questions.length,
    }));
    mockGenerateFullPrd.mockResolvedValue(undefined);
    mockGenerateQuickPrd.mockResolvedValue(undefined);
    mockOptimize.mockResolvedValue(createMockOptimizationResult());

    // Mock inquirer responses
    mockPrompt.mockImplementation(async (promptQuestions: any[]) => {
      const q = promptQuestions[0];
      if (q.type === 'input') {
        return { answer: 'Test answer' };
      } else if (q.type === 'confirm') {
        return { answer: true, use: true };
      } else if (q.type === 'list') {
        return { answer: q.choices[0] };
      }
      return { answer: 'default' };
    });

    // Create quick-prd.md for validation
    await fs.ensureDir(path.join(testDir, '.clavix', 'outputs', 'test-answer'));
    await fs.writeFile(
      path.join(testDir, '.clavix', 'outputs', 'test-answer', 'quick-prd.md'),
      '# Test PRD\n\nThis is a test PRD document.'
    );
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    await cleanupTestDir(testDir);
  });

  // ==========================================================================
  // Basic Flow Tests
  // ==========================================================================

  describe('basic flow', () => {
    it('should display planning mode header', async () => {
      const result = await runPrdCommand([]);

      expect(result.stdout).toContain('Planning Mode');
    });

    it('should display introduction message', async () => {
      const result = await runPrdCommand([]);

      expect(result.stdout).toContain('strategic questions');
    });

    it('should display document types', async () => {
      const result = await runPrdCommand([]);

      expect(result.stdout).toContain('Full PRD');
      expect(result.stdout).toContain('Quick PRD');
    });

    it('should load question flow', async () => {
      await runPrdCommand([]);

      expect(mockLoadFlow).toHaveBeenCalled();
    });

    it('should display flow name', async () => {
      const result = await runPrdCommand([]);

      expect(result.stdout).toContain('PRD Questions');
    });

    it('should ask questions from flow', async () => {
      await runPrdCommand([]);

      expect(mockPrompt).toHaveBeenCalled();
    });

    it('should display progress indicators', async () => {
      const result = await runPrdCommand([]);

      expect(result.stdout).toMatch(/\[\d+\/\d+\]/);
    });

    it('should show all questions answered message', async () => {
      const result = await runPrdCommand([]);

      expect(result.stdout).toContain('All questions answered');
    });
  });

  // ==========================================================================
  // PRD Generation Tests
  // ==========================================================================

  describe('PRD generation', () => {
    it('should generate full PRD', async () => {
      await runPrdCommand([]);

      expect(mockGenerateFullPrd).toHaveBeenCalled();
    });

    it('should generate quick PRD', async () => {
      await runPrdCommand([]);

      expect(mockGenerateQuickPrd).toHaveBeenCalled();
    });

    it('should display generation message', async () => {
      const result = await runPrdCommand([]);

      expect(result.stdout).toContain('Generating PRD');
    });

    it('should display success message', async () => {
      const result = await runPrdCommand([]);

      expect(result.stdout).toContain('PRD documents generated');
    });

    it('should display document list', async () => {
      const result = await runPrdCommand([]);

      expect(result.stdout).toContain('full-prd.md');
      expect(result.stdout).toContain('quick-prd.md');
    });

    it('should display output location', async () => {
      const result = await runPrdCommand([]);

      expect(result.stdout).toContain('Location:');
    });
  });

  // ==========================================================================
  // Project Name Tests
  // ==========================================================================

  describe('project name handling', () => {
    it('should use --project flag when provided', async () => {
      await runPrdCommand(['--project', 'my-custom-project']);

      expect(mockGenerateFullPrd).toHaveBeenCalledWith(
        expect.anything(),
        expect.stringContaining('my-custom-project')
      );
    });

    it('should derive project name from answers', async () => {
      mockPrompt.mockResolvedValueOnce({ answer: 'E-commerce platform for books' });
      mockPrompt.mockResolvedValue({ answer: 'Test answer' });

      await runPrdCommand([]);

      // The derived name should be from first answer
      expect(mockGenerateFullPrd).toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // Question Types Tests
  // ==========================================================================

  describe('question types', () => {
    it('should handle text input questions', async () => {
      questions = [{ id: 'q1', text: 'Text question?', type: 'text', required: true }];
      questionIndex = 0;

      await runPrdCommand([]);

      expect(mockPrompt).toHaveBeenCalledWith(
        expect.arrayContaining([expect.objectContaining({ type: 'input' })])
      );
    });

    it('should handle confirm questions', async () => {
      questions = [{ id: 'q1', text: 'Confirm?', type: 'confirm', default: true }];
      questionIndex = 0;

      await runPrdCommand([]);

      expect(mockPrompt).toHaveBeenCalledWith(
        expect.arrayContaining([expect.objectContaining({ type: 'confirm' })])
      );
    });

    it('should handle list questions', async () => {
      questions = [{ id: 'q1', text: 'Choose one', type: 'list', choices: ['A', 'B', 'C'] }];
      questionIndex = 0;

      await runPrdCommand([]);

      expect(mockPrompt).toHaveBeenCalledWith(
        expect.arrayContaining([expect.objectContaining({ type: 'list' })])
      );
    });
  });

  // ==========================================================================
  // Tech Stack Detection Tests
  // ==========================================================================

  describe('tech stack detection', () => {
    it('should detect Node.js from package.json', async () => {
      await fs.writeJson(path.join(testDir, 'package.json'), {
        name: 'test-project',
        dependencies: { express: '^4.0.0' },
      });

      questions = [{ id: 'techStack', text: 'Tech stack?', type: 'text', required: false }];
      questionIndex = 0;

      mockPrompt.mockImplementation(async (promptQuestions: any[]) => {
        const q = promptQuestions[0];
        if (q.name === 'use') {
          return { use: true };
        }
        return { answer: 'Test' };
      });

      const result = await runPrdCommand([]);

      expect(result.stdout).toContain('Detected');
    });

    it('should detect React from package.json', async () => {
      await fs.writeJson(path.join(testDir, 'package.json'), {
        name: 'test-project',
        dependencies: { react: '^18.0.0' },
      });

      questions = [{ id: 'techStack', text: 'Tech stack?', type: 'text', required: false }];
      questionIndex = 0;

      mockPrompt.mockImplementation(async (promptQuestions: any[]) => {
        const q = promptQuestions[0];
        if (q.name === 'use') {
          return { use: true };
        }
        return { answer: 'Test' };
      });

      const result = await runPrdCommand([]);

      expect(result.stdout).toContain('Detected');
      expect(result.stdout).toContain('React');
    });

    it('should detect Python from requirements.txt', async () => {
      await fs.writeFile(path.join(testDir, 'requirements.txt'), 'django>=4.0\n');

      questions = [{ id: 'techStack', text: 'Tech stack?', type: 'text', required: false }];
      questionIndex = 0;

      mockPrompt.mockImplementation(async (promptQuestions: any[]) => {
        const q = promptQuestions[0];
        if (q.name === 'use') {
          return { use: true };
        }
        return { answer: 'Test' };
      });

      const result = await runPrdCommand([]);

      expect(result.stdout).toContain('Django');
    });

    it('should allow user to decline detected tech stack', async () => {
      await fs.writeJson(path.join(testDir, 'package.json'), {
        name: 'test-project',
        dependencies: { react: '^18.0.0' },
      });

      questions = [{ id: 'techStack', text: 'Tech stack?', type: 'text', required: false }];
      questionIndex = 0;

      let promptCount = 0;
      mockPrompt.mockImplementation(async (promptQuestions: any[]) => {
        promptCount++;
        const q = promptQuestions[0];
        if (q.name === 'use') {
          return { use: false }; // Decline detected stack
        }
        return { answer: 'Vue.js' }; // Custom answer
      });

      await runPrdCommand([]);

      // Should have prompted for custom input after declining
      expect(promptCount).toBeGreaterThan(1);
    });
  });

  // ==========================================================================
  // Quality Validation Tests
  // ==========================================================================

  describe('PRD quality validation', () => {
    it('should validate quick PRD quality', async () => {
      await runPrdCommand([]);

      expect(mockOptimize).toHaveBeenCalled();
    });

    it('should display quality assessment', async () => {
      const result = await runPrdCommand([]);

      expect(result.stdout).toContain('Quality Assessment');
    });

    it('should display quality scores', async () => {
      const result = await runPrdCommand([]);

      expect(result.stdout).toContain('Clarity');
      expect(result.stdout).toContain('Structure');
      expect(result.stdout).toContain('Completeness');
      expect(result.stdout).toContain('Overall');
    });

    it('should show excellent message for high quality', async () => {
      mockOptimize.mockResolvedValue(
        createMockOptimizationResult({
          quality: { clarity: 90, structure: 85, completeness: 88, overall: 88, improvements: [] },
        })
      );

      const result = await runPrdCommand([]);

      expect(result.stdout).toContain('AI-ready');
    });

    it('should show suggestions for medium quality', async () => {
      mockOptimize.mockResolvedValue(
        createMockOptimizationResult({
          quality: {
            clarity: 75,
            structure: 70,
            completeness: 72,
            overall: 72,
            improvements: ['Add more detail'],
          },
        })
      );

      const result = await runPrdCommand([]);

      expect(result.stdout).toContain('Good quality');
    });

    it('should handle validation errors gracefully', async () => {
      mockOptimize.mockRejectedValue(new Error('Validation failed'));

      const result = await runPrdCommand([]);

      expect(result.stdout).toContain('Could not validate');
      expect(result.exitCode).toBe(0); // Should not fail the command
    });
  });

  // ==========================================================================
  // Next Steps Tests
  // ==========================================================================

  describe('next steps display', () => {
    it('should display next steps section', async () => {
      const result = await runPrdCommand([]);

      expect(result.stdout).toContain('Next Steps');
    });

    it('should mention plan command', async () => {
      const result = await runPrdCommand([]);

      expect(result.stdout).toContain('clavix plan');
    });

    it('should mention implement command', async () => {
      const result = await runPrdCommand([]);

      expect(result.stdout).toContain('clavix implement');
    });
  });

  // ==========================================================================
  // Error Handling Tests
  // ==========================================================================

  describe('error handling', () => {
    it('should handle flow loading errors', async () => {
      mockLoadFlow.mockRejectedValue(new Error('Failed to load flow'));

      const result = await runPrdCommand([]);

      expect(result.stdout).toContain('Error');
      expect(result.exitCode).toBe(1);
    });

    it('should handle PRD generation errors', async () => {
      mockGenerateFullPrd.mockRejectedValue(new Error('Generation failed'));

      const result = await runPrdCommand([]);

      expect(result.stdout).toContain('Error');
      expect(result.exitCode).toBe(1);
    });

    it('should display error message', async () => {
      mockLoadFlow.mockRejectedValue(new Error('Custom error message'));

      const result = await runPrdCommand([]);

      expect(result.stdout).toContain('Custom error message');
    });
  });

  // ==========================================================================
  // Flags Tests
  // ==========================================================================

  describe('command flags', () => {
    it('should accept --quick flag', async () => {
      const result = await runPrdCommand(['--quick']);

      expect(result.exitCode).toBe(0);
    });

    it('should accept -q short flag', async () => {
      const result = await runPrdCommand(['-q']);

      expect(result.exitCode).toBe(0);
    });

    it('should accept --project flag', async () => {
      const result = await runPrdCommand(['--project', 'my-project']);

      expect(result.exitCode).toBe(0);
    });

    it('should accept -p short flag', async () => {
      const result = await runPrdCommand(['-p', 'my-project']);

      expect(result.exitCode).toBe(0);
    });

    it('should accept --template flag', async () => {
      const templatePath = path.join(testDir, 'custom-template.md');
      await fs.writeFile(templatePath, '# Custom Template\n');

      const result = await runPrdCommand(['--template', templatePath]);

      // Should try to load from custom template
      expect(mockLoadFlow).toHaveBeenCalledWith(templatePath);
    });
  });

  // ==========================================================================
  // Static Properties Tests
  // ==========================================================================

  describe('command static properties', () => {
    it('should have description', () => {
      expect(Prd.description).toBeDefined();
      expect(typeof Prd.description).toBe('string');
      expect(Prd.description.length).toBeGreaterThan(0);
    });

    it('should have examples', () => {
      expect(Prd.examples).toBeDefined();
      expect(Array.isArray(Prd.examples)).toBe(true);
      expect(Prd.examples.length).toBeGreaterThan(0);
    });

    it('should have quick flag defined', () => {
      expect(Prd.flags).toBeDefined();
      expect(Prd.flags.quick).toBeDefined();
    });

    it('should have project flag defined', () => {
      expect(Prd.flags.project).toBeDefined();
    });

    it('should have template flag defined', () => {
      expect(Prd.flags.template).toBeDefined();
    });
  });
});
