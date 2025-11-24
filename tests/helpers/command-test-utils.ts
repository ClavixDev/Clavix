/**
 * Command Test Utilities
 *
 * Comprehensive utilities for testing CLI commands directly.
 * These utilities enable testing the actual command run() methods
 * with proper mocking of dependencies like inquirer, chalk, and file system.
 */

import { jest } from '@jest/globals';
import { Command } from '@oclif/core';
import * as fs from 'fs-extra';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Result of running a CLI command
 */
export interface CommandResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  error?: Error;
}

/**
 * Console capture utilities
 */
export interface ConsoleCaptureResult {
  stdout: string[];
  stderr: string[];
  restore: () => void;
}

/**
 * Capture console output during test execution
 */
export function captureConsoleOutput(): ConsoleCaptureResult {
  const stdout: string[] = [];
  const stderr: string[] = [];

  const originalLog = console.log;
  const originalError = console.error;
  const originalWarn = console.warn;

  console.log = (...args: any[]) => {
    stdout.push(args.map((a) => (typeof a === 'string' ? a : JSON.stringify(a))).join(' '));
  };
  console.error = (...args: any[]) => {
    stderr.push(args.map((a) => (typeof a === 'string' ? a : JSON.stringify(a))).join(' '));
  };
  console.warn = (...args: any[]) => {
    stderr.push(args.map((a) => (typeof a === 'string' ? a : JSON.stringify(a))).join(' '));
  };

  return {
    stdout,
    stderr,
    restore: () => {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
    },
  };
}

/**
 * Strip ANSI escape codes from string (chalk colors)
 */
export function stripAnsi(str: string): string {
  // eslint-disable-next-line no-control-regex
  return str.replace(/\u001b\[[0-9;]*m/g, '');
}

/**
 * Create a test directory with a unique name
 */
export async function createTestDirectory(prefix: string): Promise<string> {
  const testDir = path.join(
    __dirname,
    '..',
    'tmp',
    `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
  );
  await fs.ensureDir(testDir);
  return testDir;
}

/**
 * Clean up a test directory
 */
export async function cleanupTestDirectory(dir: string): Promise<void> {
  try {
    await fs.remove(dir);
  } catch {
    // Ignore cleanup errors
  }
}

/**
 * Setup a complete test environment for CLI commands
 */
export interface TestEnvironment {
  testDir: string;
  originalCwd: string;
  capture: ConsoleCaptureResult;
  cleanup: () => Promise<void>;
}

export async function setupTestEnvironment(prefix: string): Promise<TestEnvironment> {
  const testDir = await createTestDirectory(prefix);
  const originalCwd = process.cwd();
  const capture = captureConsoleOutput();

  process.chdir(testDir);

  return {
    testDir,
    originalCwd,
    capture,
    cleanup: async () => {
      capture.restore();
      process.chdir(originalCwd);
      await cleanupTestDirectory(testDir);
    },
  };
}

/**
 * Create mock inquirer module for ESM
 * Use with jest.unstable_mockModule BEFORE importing the command
 */
export function createInquirerMock(responses: Record<string, any> = {}) {
  const mockPrompt = jest.fn().mockImplementation(async (questions: any[]) => {
    const answers: Record<string, any> = {};

    for (const q of questions) {
      const questionName = q.name;

      if (responses[questionName] !== undefined) {
        answers[questionName] = responses[questionName];
      } else {
        // Default responses based on question type
        switch (q.type) {
          case 'confirm':
            answers[questionName] = true;
            break;
          case 'checkbox':
            answers[questionName] = q.choices ? [q.choices[0]?.value ?? q.choices[0]] : [];
            break;
          case 'list':
            answers[questionName] = q.choices ? (q.choices[0]?.value ?? q.choices[0]) : '';
            break;
          case 'input':
            answers[questionName] = 'test-input';
            break;
          default:
            answers[questionName] = 'test-response';
        }
      }
    }

    return answers;
  });

  return {
    __esModule: true,
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
    mockPrompt,
  };
}

/**
 * Create a mock for PromptManager
 */
export function createPromptManagerMock(
  overrides: Partial<{
    savePrompt: jest.Mock;
    loadPrompt: jest.Mock;
    listPrompts: jest.Mock;
    deletePrompt: jest.Mock;
    markAsExecuted: jest.Mock;
  }> = {}
) {
  return {
    __esModule: true,
    PromptManager: jest.fn().mockImplementation(() => ({
      savePrompt:
        overrides.savePrompt ??
        jest.fn().mockResolvedValue({ id: 'test-prompt-id', path: '/test/path' }),
      loadPrompt:
        overrides.loadPrompt ??
        jest.fn().mockResolvedValue({ content: 'test content', mode: 'fast' }),
      listPrompts: overrides.listPrompts ?? jest.fn().mockResolvedValue([]),
      deletePrompt: overrides.deletePrompt ?? jest.fn().mockResolvedValue(undefined),
      markAsExecuted: overrides.markAsExecuted ?? jest.fn().mockResolvedValue(undefined),
    })),
  };
}

/**
 * Create a mock for SessionManager
 */
export function createSessionManagerMock(
  overrides: Partial<{
    createSession: jest.Mock;
    getSession: jest.Mock;
    getActiveSession: jest.Mock;
    listSessions: jest.Mock;
    addMessage: jest.Mock;
    endSession: jest.Mock;
  }> = {}
) {
  const mockSession = {
    id: 'test-session-id',
    projectName: 'test-project',
    description: 'Test session',
    tags: [],
    created: new Date().toISOString(),
    messages: [],
    status: 'active',
  };

  return {
    __esModule: true,
    SessionManager: jest.fn().mockImplementation(() => ({
      createSession: overrides.createSession ?? jest.fn().mockResolvedValue(mockSession),
      getSession: overrides.getSession ?? jest.fn().mockResolvedValue(mockSession),
      getActiveSession: overrides.getActiveSession ?? jest.fn().mockResolvedValue(mockSession),
      listSessions: overrides.listSessions ?? jest.fn().mockResolvedValue([mockSession]),
      addMessage: overrides.addMessage ?? jest.fn().mockResolvedValue(undefined),
      endSession: overrides.endSession ?? jest.fn().mockResolvedValue(undefined),
    })),
  };
}

/**
 * Create a mock optimization result for UniversalOptimizer
 */
export function createMockOptimizationResult(
  overrides: Partial<{
    original: string;
    enhanced: string;
    mode: string;
    intent: any;
    quality: any;
    improvements: any[];
    appliedPatterns: any[];
    processingTimeMs: number;
  }> = {}
) {
  return {
    original: overrides.original ?? 'test prompt',
    enhanced: overrides.enhanced ?? 'Enhanced test prompt with improvements',
    mode: overrides.mode ?? 'fast',
    intent: overrides.intent ?? {
      primaryIntent: 'code-generation',
      confidence: 85,
      characteristics: {
        hasCodeContext: false,
        hasTechnicalTerms: true,
        isOpenEnded: false,
        needsStructure: false,
      },
    },
    quality: overrides.quality ?? {
      clarity: 75,
      efficiency: 80,
      structure: 70,
      completeness: 65,
      actionability: 78,
      overall: 74,
      strengths: ['Clear objective'],
      weaknesses: ['Could be more specific'],
    },
    improvements: overrides.improvements ?? [
      { description: 'Added clarity', dimension: 'clarity', impact: 'medium' },
    ],
    appliedPatterns: overrides.appliedPatterns ?? [
      { name: 'ObjectiveClarifier', description: 'Clarified objective' },
    ],
    processingTimeMs: overrides.processingTimeMs ?? 45,
  };
}

/**
 * Create a mock for UniversalOptimizer
 */
export function createUniversalOptimizerMock(
  resultOverrides: Parameters<typeof createMockOptimizationResult>[0] = {}
) {
  const mockResult = createMockOptimizationResult(resultOverrides);

  return {
    __esModule: true,
    UniversalOptimizer: jest.fn().mockImplementation(() => ({
      optimize: jest.fn().mockResolvedValue(mockResult),
      shouldRecommendDeepMode: jest.fn().mockReturnValue(false),
      getRecommendation: jest.fn().mockReturnValue(null),
    })),
  };
}

/**
 * Create a mock for ConfigManager
 */
export function createConfigManagerMock(configOverrides: Record<string, any> = {}) {
  const defaultConfig = {
    version: '3.6.1',
    integrations: ['claude-code'],
    templates: {
      prdQuestions: '',
      fullPrd: '',
      quickPrd: '',
    },
    outputs: {
      path: '.clavix/outputs',
      format: 'markdown',
    },
    preferences: {
      autoOpenOutputs: false,
      verboseLogging: false,
      preserveSessions: true,
    },
    ...configOverrides,
  };

  return {
    __esModule: true,
    ConfigManager: jest.fn().mockImplementation(() => ({
      loadConfig: jest.fn().mockResolvedValue(defaultConfig),
      saveConfig: jest.fn().mockResolvedValue(undefined),
      getConfig: jest.fn().mockReturnValue(defaultConfig),
      isInitialized: jest.fn().mockReturnValue(true),
    })),
  };
}

/**
 * Initialize a .clavix directory structure for testing
 */
export async function initializeClavixDirectory(
  testDir: string,
  config: Record<string, any> = {}
): Promise<void> {
  const clavixDir = path.join(testDir, '.clavix');
  await fs.ensureDir(clavixDir);
  await fs.ensureDir(path.join(clavixDir, 'sessions'));
  await fs.ensureDir(path.join(clavixDir, 'outputs'));
  await fs.ensureDir(path.join(clavixDir, 'outputs', 'prompts', 'fast'));
  await fs.ensureDir(path.join(clavixDir, 'outputs', 'prompts', 'deep'));

  const defaultConfig = {
    version: '3.6.1',
    integrations: ['claude-code'],
    templates: {
      prdQuestions: '',
      fullPrd: '',
      quickPrd: '',
    },
    outputs: {
      path: '.clavix/outputs',
      format: 'markdown',
    },
    preferences: {
      autoOpenOutputs: false,
      verboseLogging: false,
      preserveSessions: true,
    },
    ...config,
  };

  await fs.writeJson(path.join(clavixDir, 'config.json'), defaultConfig, { spaces: 2 });
}

/**
 * Create a mock session file
 */
export async function createMockSessionFile(
  testDir: string,
  sessionId: string,
  data: Record<string, any> = {}
): Promise<string> {
  const sessionsDir = path.join(testDir, '.clavix', 'sessions');
  await fs.ensureDir(sessionsDir);

  const sessionData = {
    id: sessionId,
    projectName: 'test-project',
    description: 'Test session',
    tags: [],
    created: new Date().toISOString(),
    messages: [{ role: 'user', content: 'Test message', timestamp: new Date().toISOString() }],
    status: 'active',
    ...data,
  };

  const filePath = path.join(sessionsDir, `${sessionId}.json`);
  await fs.writeJson(filePath, sessionData, { spaces: 2 });
  return filePath;
}

/**
 * Create a mock PRD output directory
 */
export async function createMockPrdOutput(
  testDir: string,
  projectName: string,
  options: {
    includePrd?: boolean;
    includeTasks?: boolean;
    includeQuickRef?: boolean;
    includeConfig?: boolean;
  } = {}
): Promise<string> {
  const {
    includePrd = true,
    includeTasks = false,
    includeQuickRef = false,
    includeConfig = false,
  } = options;

  const outputDir = path.join(testDir, '.clavix', 'outputs', projectName);
  await fs.ensureDir(outputDir);

  if (includePrd) {
    await fs.writeFile(
      path.join(outputDir, 'full-prd.md'),
      `# ${projectName}\n\n## Overview\nTest PRD content\n\n## Features\n- Feature 1\n- Feature 2`
    );
  }

  if (includeQuickRef) {
    await fs.writeFile(
      path.join(outputDir, 'quick-prd.md'),
      `# ${projectName} Quick Reference\n\nKey points for AI consumption.`
    );
  }

  if (includeTasks) {
    await fs.writeFile(
      path.join(outputDir, 'tasks.md'),
      `# Implementation Tasks: ${projectName}

## Phase 1: Setup

### Task 1.1: Initialize Project
- [ ] Setup description
- **ID**: phase-1-setup-1

### Task 1.2: Configure Dependencies
- [ ] Config description
- **ID**: phase-1-setup-2

## Phase 2: Implementation

### Task 2.1: Core Logic
- [ ] Implementation description
- **ID**: phase-2-impl-1
`
    );
  }

  if (includeConfig) {
    await fs.writeJson(
      path.join(outputDir, '.clavix-implement-config.json'),
      {
        commitStrategy: 'per-task',
        tasksPath: path.join(outputDir, 'tasks.md'),
        currentTask: {
          id: 'phase-1-setup-1',
          description: 'Initialize Project',
          phase: 'Phase 1: Setup',
          completed: false,
        },
        stats: { total: 3, completed: 0, remaining: 3, percentage: 0 },
        timestamp: new Date().toISOString(),
        completedTaskIds: [],
        completionTimestamps: {},
        blockedTasks: [],
      },
      { spaces: 2 }
    );
  }

  return outputDir;
}

/**
 * Assert that output contains expected strings (case-insensitive, ANSI-stripped)
 */
export function assertOutputContains(output: string[], ...expected: string[]): void {
  const fullOutput = stripAnsi(output.join('\n')).toLowerCase();
  for (const exp of expected) {
    if (!fullOutput.includes(exp.toLowerCase())) {
      throw new Error(`Expected output to contain "${exp}"\nActual output:\n${output.join('\n')}`);
    }
  }
}

/**
 * Assert that output does NOT contain certain strings
 */
export function assertOutputNotContains(output: string[], ...unexpected: string[]): void {
  const fullOutput = stripAnsi(output.join('\n')).toLowerCase();
  for (const unexp of unexpected) {
    if (fullOutput.includes(unexp.toLowerCase())) {
      throw new Error(
        `Expected output NOT to contain "${unexp}"\nActual output:\n${output.join('\n')}`
      );
    }
  }
}
