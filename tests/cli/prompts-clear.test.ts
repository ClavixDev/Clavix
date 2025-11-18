import fs from 'fs-extra';
import * as path from 'path';
import inquirer from 'inquirer';
import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import PromptsClear from '../../src/cli/commands/prompts/clear';
import { PromptManager } from '../../src/core/prompt-manager';

const originalCwd = process.cwd();
const originalLog = console.log;
const originalPrompt = inquirer.prompt;
const logs: string[] = [];
let warningSpy: jest.SpiedFunction<typeof process.emitWarning>;

const captureConsole = (): void => {
  // eslint-disable-next-line no-console
  console.log = (...args: unknown[]): void => {
    logs.push(args.map(String).join(' '));
  };
};

const restoreConsole = (): void => {
  // eslint-disable-next-line no-console
  console.log = originalLog;
};

const mockInquirer = (responses: Array<Record<string, unknown>>): jest.Mock => {
  const mock = jest.fn();
  responses.forEach((response) => mock.mockResolvedValueOnce(response as never));
  inquirer.prompt = mock as unknown as typeof inquirer.prompt;
  return mock;
};

describe('Prompts clear CLI command', () => {
  let testDir: string;
  let manager: PromptManager;

  beforeEach(async () => {
    testDir = path.join(originalCwd, 'tests', 'tmp', `prompts-clear-${Date.now()}`);
    await fs.ensureDir(testDir);
    process.chdir(testDir);
    logs.length = 0;
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

  it('removes only executed prompts when using --executed flag', async () => {
    const executed = await manager.savePrompt('# done', 'fast', 'Done');
    await manager.markExecuted(executed.id);
    const pending = await manager.savePrompt('# pending', 'fast', 'Pending');

    await PromptsClear.run(['--executed']);

    const remaining = await manager.listPrompts({ source: 'fast' });
    expect(remaining.find(p => p.id === executed.id)).toBeUndefined();
    expect(remaining.find(p => p.id === pending.id)).toBeDefined();
  });

  it('uses interactive flow when no flags provided', async () => {
    const fast = await manager.savePrompt('# fast', 'fast', 'Fast prompt');
    await manager.markExecuted(fast.id);

    const promptMock = mockInquirer([{ selection: 'executed' }, { confirm: true }]);

    await PromptsClear.run([]);

    const remaining = await manager.listPrompts();
    expect(remaining.find(p => p.id === fast.id)).toBeUndefined();
    expect(promptMock).toHaveBeenCalledTimes(2);
  });

  it('warns about unexecuted prompts and cancels when user declines', async () => {
    await manager.savePrompt('# pending', 'fast', 'Pending prompt');

    mockInquirer([{ selection: 'all' }, { confirm: false }]);

    await PromptsClear.run([]);

    const remaining = await manager.listPrompts();
    expect(remaining.length).toBe(1);
    expect(logs.some(line => line.includes('No prompts were deleted'))).toBe(true);
  });

  it('skips confirmations when --force is provided', async () => {
    await manager.savePrompt('# first', 'fast', 'A');
    await manager.savePrompt('# second', 'deep', 'B');

    await PromptsClear.run(['--all', '--force']);

    const remaining = await manager.listPrompts();
    expect(remaining.length).toBe(0);
  });
});
