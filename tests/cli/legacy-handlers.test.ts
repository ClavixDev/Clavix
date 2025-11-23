import fs from 'fs-extra';
import * as path from 'path';
import inquirer from 'inquirer';
import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import Init from '../../src/cli/commands/init';
import Update from '../../src/cli/commands/update';
import { AgentAdapter, CommandTemplate, ManagedBlock, ValidationResult } from '../../src/types/agent';

const originalCwd = process.cwd();
const originalPrompt = inquirer.prompt;

const noop = async (): Promise<void> => {};
const noopDetect = async (): Promise<boolean> => true;
const noopValidate = async (): Promise<ValidationResult> => ({ valid: true });

const buildAdapter = (name: string, commandPath: string): AgentAdapter => ({
  name,
  displayName: name,
  directory: '',
  fileExtension: '.md',
  detectProject: noopDetect,
  generateCommands: async (_templates: CommandTemplate[]) => {},
  removeAllCommands: async () => 0,
  injectDocumentation: async (_blocks: ManagedBlock[]) => {},
  getCommandPath: () => commandPath,
  getTargetFilename: (commandName: string) => `clavix-${commandName}.md`,
  validate: noopValidate,
});

const callInitHandler = async (adapter: AgentAdapter, commandNames: string[]): Promise<void> => {
  const templates: CommandTemplate[] = commandNames.map(name => ({ name, content: '', description: '' }));
  const handler = (Init.prototype as unknown as { handleLegacyCommands: Function }).handleLegacyCommands;
  await handler.call({ log: () => {} }, adapter, templates);
};

const callUpdateHandler = async (adapter: AgentAdapter, commandNames: string[], force: boolean): Promise<number> => {
  const handler = (Update.prototype as unknown as { handleLegacyCommands: Function }).handleLegacyCommands;
  return handler.call({ log: () => {} }, adapter, commandNames, force);
};

const mockInquirer = (response: Record<string, unknown>): jest.Mock => {
  const mock = jest.fn().mockResolvedValue(response as never);
  inquirer.prompt = mock as unknown as typeof inquirer.prompt;
  return mock;
};

describe('legacy command cleanup handlers', () => {
  let testDir: string;

  beforeEach(async () => {
    testDir = path.join(originalCwd, 'tests', 'tmp', `legacy-handlers-${Date.now()}`);
    await fs.ensureDir(testDir);
    process.chdir(testDir);
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(async () => {
    inquirer.prompt = originalPrompt;
    process.chdir(originalCwd);
    await fs.remove(testDir);
    jest.restoreAllMocks();
  });

  it('Init handler removes legacy files when user confirms', async () => {
    const commandDir = path.join(testDir, '.cursor', 'commands');
    await fs.ensureDir(commandDir);
    const legacyPath = path.join(commandDir, 'fast.md');
    await fs.writeFile(legacyPath, '# legacy');
    await fs.writeFile(path.join(commandDir, 'clavix-fast.md'), '# new');

    mockInquirer({ removeLegacy: true });

    const adapter = buildAdapter('cursor', commandDir);
    await callInitHandler(adapter, ['fast']);

    expect(await fs.pathExists(legacyPath)).toBe(false);
  });

  it('Init handler keeps files when user declines removal', async () => {
    const commandDir = path.join(testDir, '.cursor', 'commands');
    await fs.ensureDir(commandDir);
    const legacyPath = path.join(commandDir, 'fast.md');
    await fs.writeFile(legacyPath, '# legacy');

    mockInquirer({ removeLegacy: false });

    const adapter = buildAdapter('cursor', commandDir);
    await callInitHandler(adapter, ['fast']);

    expect(await fs.pathExists(legacyPath)).toBe(true);
  });

  it('Update handler removes files automatically when force flag is true', async () => {
    const commandDir = path.join(testDir, '.cursor', 'commands');
    await fs.ensureDir(commandDir);
    const legacyPath = path.join(commandDir, 'fast.md');
    await fs.writeFile(legacyPath, '# legacy');

    const adapter = buildAdapter('cursor', commandDir);
    const removed = await callUpdateHandler(adapter, ['fast'], true);

    expect(removed).toBeGreaterThan(0);
    expect(await fs.pathExists(legacyPath)).toBe(false);
  });

  it('Update handler prompts user when force flag is false', async () => {
    const commandDir = path.join(testDir, '.cursor', 'commands');
    await fs.ensureDir(commandDir);
    const legacyPath = path.join(commandDir, 'fast.md');
    await fs.writeFile(legacyPath, '# legacy');

    const promptMock = mockInquirer({ removeLegacy: false });

    const adapter = buildAdapter('cursor', commandDir);
    const removed = await callUpdateHandler(adapter, ['fast'], false);

    expect(removed).toBe(0);
    expect(promptMock).toHaveBeenCalled();
    expect(await fs.pathExists(legacyPath)).toBe(true);
  });
});
