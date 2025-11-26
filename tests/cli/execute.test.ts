import fs from 'fs-extra';
import * as path from 'path';
import inquirer from 'inquirer';
import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import Execute from '../../src/cli/commands/execute';
import { PromptManager } from '../../src/core/prompt-manager';
import { DepthLevel } from '../../src/core/intelligence/types';

const originalCwd = process.cwd();
const originalLog = console.log;
const originalError = console.error;
const originalPrompt = inquirer.prompt;

const logs: string[] = [];
const errors: string[] = [];
let warningSpy: jest.SpiedFunction<typeof process.emitWarning>;

const captureConsole = (): void => {
  // eslint-disable-next-line no-console
  console.log = (...args: unknown[]): void => {
    logs.push(args.map(String).join(' '));
  };
  // eslint-disable-next-line no-console
  console.error = (...args: unknown[]): void => {
    errors.push(args.map(String).join(' '));
  };
};

const restoreConsole = (): void => {
  // eslint-disable-next-line no-console
  console.log = originalLog;
  // eslint-disable-next-line no-console
  console.error = originalError;
};

const mockInquirer = (
  responses: Array<Record<string, unknown>> | Record<string, unknown>
): jest.Mock => {
  const sequence = Array.isArray(responses) ? responses : [responses];
  const mock = jest.fn();
  sequence.forEach((response) => mock.mockResolvedValueOnce(response as never));
  inquirer.prompt = mock as unknown as typeof inquirer.prompt;
  return mock;
};

// v4.11: Updated to work with unified prompts directory
const createPrompt = async (
  manager: PromptManager,
  options: {
    depthUsed: DepthLevel;
    original: string;
    content?: string;
    timestamp?: Date;
    executed?: boolean;
  }
) => {
  const { depthUsed, original, content = '# Prompt Body', timestamp, executed } = options;
  const metadata = await manager.savePrompt(content, depthUsed, original);

  if (timestamp) {
    // v4.11: Single unified index file
    const promptsDir = path.join(process.cwd(), '.clavix', 'outputs', 'prompts');
    const indexPath = path.join(promptsDir, '.index.json');
    const index = await fs.readJSON(indexPath);
    const entry = index.prompts.find((p: { id: string }) => p.id === metadata.id);
    entry.timestamp = timestamp.toISOString();
    await fs.writeJSON(indexPath, index, { spaces: 2 });
  }

  if (executed) {
    await manager.markExecuted(metadata.id);
  }

  return metadata;
};

describe('Execute CLI command', () => {
  let testDir: string;
  let manager: PromptManager;

  beforeEach(async () => {
    testDir = path.join(originalCwd, 'tests', 'tmp', `execute-${Date.now()}`);
    await fs.ensureDir(testDir);
    process.chdir(testDir);
    logs.length = 0;
    errors.length = 0;
    captureConsole();
    manager = new PromptManager();
    warningSpy = jest.spyOn(process, 'emitWarning').mockImplementation(() => undefined);
  });

  afterEach(async () => {
    warningSpy?.mockRestore();
    restoreConsole();
    inquirer.prompt = originalPrompt;
    process.chdir(originalCwd);
    await fs.remove(testDir);
  });

  it('informs user when no prompts exist', async () => {
    await Execute.run([]);
    expect(logs.some((line) => line.includes('No prompts found'))).toBe(true);
  });

  it('executes prompt by id and marks it as executed', async () => {
    const metadata = await createPrompt(manager, { depthUsed: 'standard', original: 'Login form' });
    await Execute.run(['--id', metadata.id]);

    const updated = await manager.listPrompts({ depthUsed: 'standard' });
    const prompt = updated.find((p) => p.id === metadata.id);
    expect(prompt?.executed).toBe(true);
    expect(logs.some((line) => line.includes(`Depth: ${prompt?.depthUsed}`))).toBe(true);
  });

  it('warns when requested prompt id is missing', async () => {
    await createPrompt(manager, { depthUsed: 'standard', original: 'Placeholder' });
    await Execute.run(['--id', 'missing-id']);
    const combinedOutput = [...logs, ...errors].join('\n');
    expect(combinedOutput).toContain('Prompt not found');
  });

  it('selects newest prompt overall with --latest', async () => {
    await createPrompt(manager, {
      depthUsed: 'standard',
      original: 'Old prompt',
      timestamp: new Date(Date.now() - 2 * 86400000),
    });
    const newest = await createPrompt(manager, {
      depthUsed: 'comprehensive',
      original: 'New prompt',
    });

    await Execute.run(['--latest']);

    const prompts = await manager.listPrompts();
    const executedPrompt = prompts.find((p) => p.executed);
    expect(executedPrompt?.id).toBe(newest.id);
  });

  // v4.11: Use --standard or --comprehensive flags to filter depth
  it('respects depth filter when using --latest --standard', async () => {
    await createPrompt(manager, { depthUsed: 'standard', original: 'Standard latest' });
    await createPrompt(manager, { depthUsed: 'comprehensive', original: 'Comprehensive newest' });

    await Execute.run(['--latest', '--standard']);

    const prompts = await manager.listPrompts({ depthUsed: 'standard' });
    expect(prompts.filter((p) => p.executed).length).toBe(1);
    expect(logs.some((line) => line.includes('Depth: standard'))).toBe(true);
  });

  it('falls back to interactive selection when no flags provided', async () => {
    const prompt = await createPrompt(manager, {
      depthUsed: 'standard',
      original: 'Chosen prompt',
    });
    const promptMock = mockInquirer({ promptId: prompt.id });

    await Execute.run([]);

    expect(promptMock).toHaveBeenCalled();
    const updated = await manager.listPrompts();
    expect(updated.find((p) => p.id === prompt.id)?.executed).toBe(true);
  });

  it('handles missing prompt content gracefully', async () => {
    const prompt = await createPrompt(manager, { depthUsed: 'standard', original: 'For deletion' });
    const promptFile = prompt.path;
    await fs.remove(promptFile);

    await Execute.run(['--id', prompt.id]);

    expect(logs.some((line) => line.includes('Could not load prompt'))).toBe(true);
  });

  it('suggests cleanup when executed prompts count is high', async () => {
    // Pre-create 5 executed prompts to trigger suggestion
    for (let i = 0; i < 5; i += 1) {
      const meta = await createPrompt(manager, { depthUsed: 'standard', original: `Prompt ${i}` });
      await manager.markExecuted(meta.id);
    }

    const fresh = await createPrompt(manager, {
      depthUsed: 'standard',
      original: 'Fresh prompt',
    });
    await Execute.run(['--id', fresh.id]);

    expect(logs.some((line) => line.includes('clavix prompts clear'))).toBe(true);
  });

  it('shows verification reminder when prompt has pending verification', async () => {
    const prompt = await createPrompt(manager, {
      depthUsed: 'comprehensive',
      original: 'Complex feature',
    });

    await Execute.run(['--id', prompt.id]);

    // v4.8: Comprehensive prompts should show verification reminder
    expect(logs.some((line) => line.includes('verify') || line.includes('Verification'))).toBe(
      true
    );
  });
});
