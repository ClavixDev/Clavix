import fs from 'fs-extra';
import * as path from 'path';
import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import PromptsList from '../../src/cli/commands/prompts/list';
import { PromptManager, PromptSource } from '../../src/core/prompt-manager';

const originalCwd = process.cwd();
const originalLog = console.log;
const logs: string[] = [];

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

const setPromptTimestamp = async (id: string, source: PromptSource, timestamp: Date): Promise<void> => {
  const promptsDir = path.join(process.cwd(), '.clavix', 'outputs', 'prompts');
  const indexPath = path.join(promptsDir, source, '.index.json');
  const index = await fs.readJSON(indexPath);
  const entry = index.prompts.find((p: { id: string }) => p.id === id);
  entry.timestamp = timestamp.toISOString();
  await fs.writeJSON(indexPath, index, { spaces: 2 });
};

describe('Prompts list CLI command', () => {
  let testDir: string;
  let manager: PromptManager;
  let warningSpy: jest.SpiedFunction<typeof process.emitWarning>;

  beforeEach(async () => {
    testDir = path.join(originalCwd, 'tests', 'tmp', `prompts-list-${Date.now()}`);
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
    process.chdir(originalCwd);
    await fs.remove(testDir);
  });

  it('shows helpful guidance when no prompts are saved', async () => {
    await PromptsList.run([]);
    expect(logs.some(line => line.includes('No prompts saved yet'))).toBe(true);
    expect(logs.some(line => line.includes('/clavix:fast'))).toBe(true);
  });

  it('groups prompts by source and reports storage stats', async () => {
    const fast = await manager.savePrompt('# fast', 'fast', 'Fast Prompt');
    await manager.savePrompt('# deep', 'deep', 'Deep Prompt');
    await manager.markExecuted(fast.id);

    await PromptsList.run([]);

    expect(logs.some(line => line.includes('Fast Prompts'))).toBe(true);
    expect(logs.some(line => line.includes('Deep Prompts'))).toBe(true);
    expect(logs.some(line => line.includes('Total Prompts: 2'))).toBe(true);
    expect(logs.some(line => line.includes('Executed: 1'))).toBe(true);
    expect(logs.some(line => line.includes('Pending: 1'))).toBe(true);
  });

  it('flags prompts older than 7 or 30 days with warnings', async () => {
    const old = await manager.savePrompt('# old', 'fast', 'Old prompt');
    const stale = await manager.savePrompt('# stale', 'deep', 'Stale prompt');
    await setPromptTimestamp(old.id, 'fast', new Date(Date.now() - 10 * 86400000));
    await setPromptTimestamp(stale.id, 'deep', new Date(Date.now() - 40 * 86400000));

    await PromptsList.run([]);

    expect(logs.some(line => line.includes('[OLD]'))).toBe(true);
    expect(logs.some(line => line.includes('[STALE]'))).toBe(true);
    expect(logs.some(line => line.includes('Recommend: clavix prompts clear --stale'))).toBe(true);
  });

  it('suggests cleaning executed prompts when threshold exceeded', async () => {
    const ids = [];
    for (let idx = 0; idx < 10; idx += 1) {
      const meta = await manager.savePrompt(`# ${idx}`, 'fast', `Prompt ${idx}`);
      ids.push(meta);
      await manager.markExecuted(meta.id);
    }

    await PromptsList.run([]);

    expect(logs.some(line => line.includes('clavix prompts clear --executed'))).toBe(true);
  });
});
