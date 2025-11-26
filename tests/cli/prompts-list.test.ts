import fs from 'fs-extra';
import * as path from 'path';
import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import PromptsList from '../../src/cli/commands/prompts/list';
import { PromptManager } from '../../src/core/prompt-manager';
import { DepthLevel } from '../../src/core/intelligence/types';

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

// v4.11: Unified prompts directory with single .index.json
const setPromptTimestamp = async (
  id: string,
  _depthUsed: DepthLevel,
  timestamp: Date
): Promise<void> => {
  const promptsDir = path.join(process.cwd(), '.clavix', 'outputs', 'prompts');
  const indexPath = path.join(promptsDir, '.index.json');
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
    expect(logs.some((line) => line.includes('No prompts saved yet'))).toBe(true);
    // v4.11: Uses /clavix:improve instead of /clavix:fast
    expect(logs.some((line) => line.includes('/clavix:improve'))).toBe(true);
  });

  it('groups prompts by depthUsed and reports storage stats', async () => {
    // v4.11: Use 'standard'/'comprehensive' instead of 'fast'/'deep'
    const standard = await manager.savePrompt('# standard', 'standard', 'Standard Prompt');
    await manager.savePrompt('# comprehensive', 'comprehensive', 'Comprehensive Prompt');
    await manager.markExecuted(standard.id);

    await PromptsList.run([]);

    // v4.11: Uses 'Standard Depth Prompts' and 'Comprehensive Depth Prompts'
    expect(logs.some((line) => line.includes('Standard Depth Prompts'))).toBe(true);
    expect(logs.some((line) => line.includes('Comprehensive Depth Prompts'))).toBe(true);
    expect(logs.some((line) => line.includes('Total Prompts: 2'))).toBe(true);
    expect(logs.some((line) => line.includes('Executed: 1'))).toBe(true);
    expect(logs.some((line) => line.includes('Pending: 1'))).toBe(true);
  });

  it('flags prompts older than 7 or 30 days with warnings', async () => {
    // v4.11: Use 'standard'/'comprehensive' instead of 'fast'/'deep'
    const old = await manager.savePrompt('# old', 'standard', 'Old prompt');
    const stale = await manager.savePrompt('# stale', 'comprehensive', 'Stale prompt');
    await setPromptTimestamp(old.id, 'standard', new Date(Date.now() - 10 * 86400000));
    await setPromptTimestamp(stale.id, 'comprehensive', new Date(Date.now() - 40 * 86400000));

    await PromptsList.run([]);

    expect(logs.some((line) => line.includes('[OLD]'))).toBe(true);
    expect(logs.some((line) => line.includes('[STALE]'))).toBe(true);
    expect(logs.some((line) => line.includes('Recommend: clavix prompts clear --stale'))).toBe(
      true
    );
  });

  it('suggests cleaning executed prompts when threshold exceeded', async () => {
    const ids = [];
    for (let idx = 0; idx < 10; idx += 1) {
      // v4.11: Use 'standard' instead of 'fast'
      const meta = await manager.savePrompt(`# ${idx}`, 'standard', `Prompt ${idx}`);
      ids.push(meta);
      await manager.markExecuted(meta.id);
    }

    await PromptsList.run([]);

    expect(logs.some((line) => line.includes('clavix prompts clear --executed'))).toBe(true);
  });
});
