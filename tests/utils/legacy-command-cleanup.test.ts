import fs from 'fs-extra';
import * as path from 'path';
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { collectLegacyCommandFiles } from '../../src/utils/legacy-command-cleanup';
import { AgentAdapter, CommandTemplate, ManagedBlock, ValidationResult } from '../../src/types/agent';

const noop = async (): Promise<void> => {};
const noopDetect = async (): Promise<boolean> => true;
const noopValidate = async (): Promise<ValidationResult> => ({ valid: true });

interface AdapterOverrides {
  name: string;
  commandPath: string;
  fileExtension?: string;
}

const buildAdapter = ({ name, commandPath, fileExtension = '.md' }: AdapterOverrides): AgentAdapter => ({
  name,
  displayName: name,
  directory: '',
  fileExtension,
  detectProject: noopDetect,
  generateCommands: async (_templates: CommandTemplate[]) => {},
  removeAllCommands: async () => 0,
  injectDocumentation: async (_blocks: ManagedBlock[]) => {},
  getCommandPath: () => commandPath,
  getTargetFilename: (commandName: string) => `clavix-${commandName}${fileExtension}`,
  validate: noopValidate,
});

describe('collectLegacyCommandFiles', () => {
  const originalCwd = process.cwd();
  let testDir: string;

  beforeEach(async () => {
    testDir = path.join(originalCwd, 'tests', 'tmp', `legacy-${Date.now()}`);
    await fs.ensureDir(testDir);
    process.chdir(testDir);
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    await fs.remove(testDir);
  });

  it('captures default legacy files for non-special adapters', async () => {
    const commandDir = path.join(testDir, '.cursor', 'commands');
    await fs.ensureDir(commandDir);

    await fs.writeFile(path.join(commandDir, 'fast.md'), '# legacy fast');
    await fs.writeFile(path.join(commandDir, 'clavix-fast.md'), '# new fast');

    const adapter = buildAdapter({ name: 'cursor', commandPath: commandDir });
    const legacyFiles = await collectLegacyCommandFiles(adapter, ['fast']);

    expect(legacyFiles).toContain(path.join(commandDir, 'fast.md'));
    expect(legacyFiles).not.toContain(path.join(commandDir, 'clavix-fast.md'));
  });

  it('detects .cline legacy workflow files', async () => {
    const commandDir = path.join(testDir, '.clinerules', 'workflows');
    await fs.ensureDir(commandDir);
    await fs.ensureDir(path.join(testDir, '.cline', 'workflows'));

    await fs.writeFile(path.join(commandDir, 'clavix-fast.md'), '# new fast');
    await fs.writeFile(path.join(commandDir, 'fast.md'), '# legacy at new dir');
    await fs.writeFile(path.join(testDir, '.cline', 'workflows', 'fast.md'), '# colon legacy');
    await fs.writeFile(path.join(testDir, '.cline', 'workflows', 'clavix-fast.md'), '# prefixed legacy');

    const adapter = buildAdapter({ name: 'cline', commandPath: commandDir });
    const legacyFiles = await collectLegacyCommandFiles(adapter, ['fast']);

    expect(legacyFiles).toContain(path.join(commandDir, 'fast.md'));
    expect(legacyFiles).toContain(path.join(testDir, '.cline', 'workflows', 'fast.md'));
    expect(legacyFiles).toContain(path.join(testDir, '.cline', 'workflows', 'clavix-fast.md'));
  });

  it('treats non-namespaced gemini commands as legacy defaults', async () => {
    const commandDir = path.join(testDir, '.gemini', 'commands');
    await fs.ensureDir(commandDir);

    await fs.writeFile(path.join(commandDir, 'fast.md'), '# legacy gemini');

    const adapter = buildAdapter({ name: 'gemini', commandPath: commandDir });
    const legacyFiles = await collectLegacyCommandFiles(adapter, ['fast']);

    expect(legacyFiles).toContain(path.join(commandDir, 'fast.md'));
  });

  it('ignores namespaced gemini commands (already standardized)', async () => {
    const commandDir = path.join(testDir, '.gemini', 'commands', 'clavix');
    await fs.ensureDir(commandDir);
    await fs.writeFile(path.join(commandDir, 'fast.md'), '# already namespaced');

    const adapter = buildAdapter({ name: 'gemini', commandPath: commandDir });
    const legacyFiles = await collectLegacyCommandFiles(adapter, ['fast']);

    expect(legacyFiles).toHaveLength(0);
  });

  it('includes colon and hyphen claude code commands', async () => {
    const commandsDir = path.join(testDir, '.claude', 'commands');
    const clavixDir = path.join(commandsDir, 'clavix');
    await fs.ensureDir(commandsDir);
    await fs.ensureDir(clavixDir);

    await fs.writeFile(path.join(commandsDir, 'clavix:fast.md'), '# colon');
    await fs.writeFile(path.join(clavixDir, 'clavix-fast.md'), '# hyphen');

    const adapter = buildAdapter({ name: 'claude-code', commandPath: clavixDir });
    const legacyFiles = await collectLegacyCommandFiles(adapter, ['fast']);

    expect(legacyFiles).toContain(path.join(commandsDir, 'clavix:fast.md'));
    expect(legacyFiles).toContain(path.join(clavixDir, 'clavix-fast.md'));
  });
});
