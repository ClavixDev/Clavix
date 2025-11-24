/**
 * Tests for plan command functionality
 *
 * Uses jest.unstable_mockModule for ESM module mocking.
 */

import fs from 'fs-extra';
import * as path from 'path';
import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mock TaskManager - define mocks before jest.unstable_mockModule
const mockGenerateTasks = jest.fn<() => Promise<any>>();
const mockDetectSources = jest.fn<() => Promise<string[]>>();
const mockFindPrd = jest.fn<() => Promise<string>>();

jest.unstable_mockModule('../../src/core/task-manager.js', () => ({
  TaskManager: jest.fn().mockImplementation(() => ({
    generateTasksFromPrd: mockGenerateTasks,
    detectAvailableSources: mockDetectSources,
    findPrdDirectory: mockFindPrd,
    readTasksFile: jest.fn(),
    getTaskStats: jest.fn(),
  })),
  PrdSourceType: {},
}));

// Import after mock
const { default: Plan } = await import('../../src/cli/commands/plan.js');

describe('Plan Command', () => {
  const testDir = path.join(__dirname, '../fixtures/test-plan-cmd');
  const outputsDir = path.join(testDir, '.clavix/outputs');
  const projectDir = path.join(outputsDir, 'test-project');

  // Helper to run command
  const runCommand = async (args: string[] = []) => {
    const mockOclifConfig = {
      runHook: jest.fn(),
      bin: 'clavix',
      dirname: 'clavix',
      pjson: { version: '1.0.0' },
      plugins: [],
      topicSeparator: ' ',
    };

    const cmd = new Plan(args, mockOclifConfig as any);

    // Spy on console.log
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    // Mock parse
    (cmd as any).parse = jest.fn().mockImplementation(async () => {
      // Simple flag parsing for test
      const flags: any = {
        project: args.includes('--project') ? args[args.indexOf('--project') + 1] : undefined,
        'prd-path': args.includes('--prd-path') ? args[args.indexOf('--prd-path') + 1] : undefined,
        overwrite: args.includes('--overwrite') || args.includes('-o'),
        source: 'auto',
        'max-tasks': 20,
      };
      return { flags, args: {} };
    });

    cmd.log = jest.fn() as any;
    cmd.error = jest.fn((msg: any) => {
      throw new Error(msg instanceof Error ? msg.message : msg);
    }) as any;
    cmd.warn = jest.fn() as any;

    await cmd.run();

    // Return spy for assertions
    return { cmd, logSpy };
  };

  beforeEach(async () => {
    await fs.remove(testDir);
    await fs.ensureDir(projectDir);
    jest.spyOn(process, 'cwd').mockReturnValue(testDir);

    // Reset mocks
    mockDetectSources.mockReset();
    mockGenerateTasks.mockReset();
    mockFindPrd.mockReset();

    // Default implementations
    mockDetectSources.mockResolvedValue(['full']);
    mockGenerateTasks.mockResolvedValue({
      phases: [{ name: 'Phase 1', tasks: [{ description: 'Task 1' }] }],
      totalTasks: 1,
      outputPath: path.join(projectDir, 'tasks.md'),
      sourcePath: path.join(projectDir, 'full-prd.md'),
    });
    mockFindPrd.mockResolvedValue(projectDir);
  });

  afterEach(async () => {
    await fs.remove(testDir);
    jest.restoreAllMocks();
  });

  it('should generate tasks for a project', async () => {
    // Create dummy PRD
    await fs.writeFile(path.join(projectDir, 'full-prd.md'), '# PRD');

    const { logSpy } = await runCommand(['--project', 'test-project']);

    expect(logSpy).toHaveBeenCalled();
    const output = logSpy.mock.calls.flat().join('\n');
    expect(output).toContain('Task plan generated successfully');
  });

  it('should accept direct PRD path', async () => {
    await fs.writeFile(path.join(projectDir, 'full-prd.md'), '# PRD');

    const { logSpy } = await runCommand(['--prd-path', projectDir]);

    expect(logSpy).toHaveBeenCalled();
    const output = logSpy.mock.calls.flat().join('\n');
    expect(output).toContain('Task plan generated successfully');
  });

  it('should fail if PRD not found', async () => {
    // Mock TaskManager to fail detecting sources
    mockDetectSources.mockResolvedValue([]);
    mockFindPrd.mockImplementation(() => {
      throw new Error('Not found');
    });

    await expect(runCommand(['--project', 'non-existent'])).rejects.toThrow();
  });

  it('should warn if tasks.md exists and not overwriting', async () => {
    await fs.writeFile(path.join(projectDir, 'full-prd.md'), '# PRD');
    await fs.writeFile(path.join(projectDir, 'tasks.md'), '# Tasks');

    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    await runCommand(['--project', 'test-project']);

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('already exists'));

    consoleSpy.mockRestore();
  });

  it('should overwrite if flag provided', async () => {
    await fs.writeFile(path.join(projectDir, 'full-prd.md'), '# PRD');
    await fs.writeFile(path.join(projectDir, 'tasks.md'), '# Tasks');

    await runCommand(['--project', 'test-project', '--overwrite']);

    // Mock should have been called
    expect(mockGenerateTasks).toHaveBeenCalled();
  });
});
