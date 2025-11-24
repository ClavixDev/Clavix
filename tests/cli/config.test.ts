
import fs from 'fs-extra';
import * as path from 'path';
import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { fileURLToPath } from 'url';
import Config from '../../src/cli/commands/config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Config Command', () => {
  const testDir = path.join(__dirname, '../fixtures/test-config-cmd');
  const clavixDir = path.join(testDir, '.clavix');
  const configPath = path.join(clavixDir, 'config.json');

  // Mock console.log and console.error
  let logSpy: any;
  let errorSpy: any;

  // Helper to run command
  const runCommand = async (args: string[] = []) => {
    // Mock minimal Oclif config
    const mockOclifConfig = {
      runHook: jest.fn(),
      bin: 'clavix',
      dirname: 'clavix',
      pjson: {
        version: '1.0.0',
        oclif: {
            topicSeparator: ' ',
        }
      },
      plugins: [],
      topicSeparator: ' ',
    };

    const cmd = new Config(args, mockOclifConfig as any);
    
    // Mock parse method to return args/flags based on input
    // Basic parsing simulation
    (cmd as any).parse = jest.fn().mockImplementation(async () => ({
        args: {
            action: args[0],
            key: args[1],
            value: args[2]
        },
        flags: {
            global: false
        }
    }));

    // Mock log/error methods on the instance if needed, but spying on console is usually enough for Oclif if it uses console
    // However, Oclif Command has its own log/error methods.
    // We can spy on the prototype or the instance.
    // Since we create a new instance, let's spy on the prototype methods if possible or just console if Oclif defaults to it.
    // Looking at config.ts, it uses this.log and this.error.
    // We can replace the methods on the instance.
    cmd.log = jest.fn() as any;
    cmd.error = jest.fn() as any; // this.error throws by default in oclif, we might want to catch it
    cmd.warn = jest.fn() as any; // Suppress warnings during tests

    // We need to override error to NOT exit but just throw/log for testing
    cmd.error = jest.fn((msg: any) => { throw new Error(msg); }) as any;

    await cmd.run();
    return cmd;
  };

  beforeEach(async () => {
    await fs.remove(testDir);
    await fs.ensureDir(clavixDir);

    const initialConfig = {
      version: '1.0.0',
      agent: 'Claude Code',
      templates: {
        prdQuestions: 'default',
      },
      outputs: {
        path: '.clavix/outputs',
        format: 'markdown',
      },
      preferences: {
        autoOpenOutputs: false,
      },
    };

    await fs.writeJSON(configPath, initialConfig, { spaces: 2 });
    
    // Mock process.cwd to point to testDir
    jest.spyOn(process, 'cwd').mockReturnValue(testDir);
  });

  afterEach(async () => {
    await fs.remove(testDir);
    jest.restoreAllMocks();
  });

  describe('get action', () => {
    it('should display full config when no key provided', async () => {
      const cmd = await runCommand(['get']);
      
      expect(cmd.log).toHaveBeenCalled();
      const output = (cmd.log as any).mock.calls.flat().join('\n');
      expect(output).toContain('Claude Code');
      expect(output).toContain('markdown');
    });

    it('should display specific key value', async () => {
      const cmd = await runCommand(['get', 'integrations']);

      expect(cmd.log).toHaveBeenCalled();
      const output = (cmd.log as any).mock.calls.flat().join('\n');
      expect(output).toContain('Claude Code');
    });

    it('should display nested key value', async () => {
      const cmd = await runCommand(['get', 'outputs.format']);
      
      expect(cmd.log).toHaveBeenCalled();
      const output = (cmd.log as any).mock.calls.flat().join('\n');
      expect(output).toContain('markdown');
    });

    it('should show error for non-existent key', async () => {
      await expect(runCommand(['get', 'non.existent.key']))
        .rejects.toThrow('Configuration key "non.existent.key" not found');
    });
  });

  describe('list (default) action', () => {
      // When no action is provided, it shows interactive menu.
      // We should probably not test interactive menu here if it uses inquirer directly.
      // Config.ts uses `inquirer.prompt`. We'd need to mock inquirer.
      // However, the plan says "High Priority: CLI Interactive Tests" separately.
      // But we can test that it *calls* the menu.
      
      // Let's skip testing the interactive menu here and focus on arguments logic.
  });
});
