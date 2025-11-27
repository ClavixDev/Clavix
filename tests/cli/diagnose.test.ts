/**
 * Tests for clavix diagnose command
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('Diagnose Command', () => {
  const testDir = path.join(__dirname, '../fixtures/diagnose-test');
  let originalCwd: string;

  beforeEach(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
    await fs.mkdir(testDir, { recursive: true });
    originalCwd = process.cwd();
    process.chdir(testDir);
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    await fs.rm(testDir, { recursive: true, force: true });
  });

  describe('without .clavix directory', () => {
    it('reports missing .clavix directory', async () => {
      const Diagnose = (await import('../../src/cli/commands/diagnose.js')).default;
      const diagnose = new Diagnose([], {} as any);

      // Capture log output
      const logs: string[] = [];
      jest.spyOn(diagnose, 'log').mockImplementation((msg: string) => {
        logs.push(msg);
      });

      await diagnose.run();

      const output = logs.join('\n');
      expect(output).toContain('.clavix directory not found');
    });
  });

  describe('with .clavix directory', () => {
    beforeEach(async () => {
      // Only 'outputs' is required; 'commands' and 'instructions' are not expected
      await fs.mkdir('.clavix/outputs', { recursive: true });
    });

    it('reports missing config.json', async () => {
      const Diagnose = (await import('../../src/cli/commands/diagnose.js')).default;
      const diagnose = new Diagnose([], {} as any);

      const logs: string[] = [];
      jest.spyOn(diagnose, 'log').mockImplementation((msg: string) => {
        logs.push(msg);
      });

      await diagnose.run();

      const output = logs.join('\n');
      expect(output).toContain('config.json not found');
    });

    it('reports valid config', async () => {
      await fs.writeFile(
        '.clavix/config.json',
        JSON.stringify({
          version: '5.1.1',
          integrations: ['claude-code'],
        })
      );

      const Diagnose = (await import('../../src/cli/commands/diagnose.js')).default;
      const diagnose = new Diagnose([], {} as any);

      const logs: string[] = [];
      jest.spyOn(diagnose, 'log').mockImplementation((msg: string) => {
        logs.push(msg);
      });

      await diagnose.run();

      const output = logs.join('\n');
      expect(output).toContain('config.json OK');
      expect(output).toContain('1 integration(s)');
    });

    it('reports empty integrations', async () => {
      await fs.writeFile(
        '.clavix/config.json',
        JSON.stringify({
          version: '5.1.1',
          integrations: [],
        })
      );

      const Diagnose = (await import('../../src/cli/commands/diagnose.js')).default;
      const diagnose = new Diagnose([], {} as any);

      const logs: string[] = [];
      jest.spyOn(diagnose, 'log').mockImplementation((msg: string) => {
        logs.push(msg);
      });

      await diagnose.run();

      const output = logs.join('\n');
      expect(output).toContain('No integrations configured');
    });
  });

  describe('summary', () => {
    it('shows pass/warn/fail counts', async () => {
      const Diagnose = (await import('../../src/cli/commands/diagnose.js')).default;
      const diagnose = new Diagnose([], {} as any);

      const logs: string[] = [];
      jest.spyOn(diagnose, 'log').mockImplementation((msg: string) => {
        logs.push(msg);
      });

      await diagnose.run();

      const output = logs.join('\n');
      expect(output).toContain('Summary:');
      expect(output).toMatch(/\d+ passed/);
    });
  });

  describe('doc generator integrations', () => {
    beforeEach(async () => {
      await fs.mkdir('.clavix/outputs', { recursive: true });
    });

    it('recognizes agents-md as a valid integration', async () => {
      await fs.writeFile(
        '.clavix/config.json',
        JSON.stringify({
          version: '5.2.0',
          integrations: ['agents-md'],
        })
      );

      const Diagnose = (await import('../../src/cli/commands/diagnose.js')).default;
      const diagnose = new Diagnose([], {} as any);

      const logs: string[] = [];
      jest.spyOn(diagnose, 'log').mockImplementation((msg: string) => {
        logs.push(msg);
      });

      await diagnose.run();

      const output = logs.join('\n');
      // Should NOT say "Unknown integration"
      expect(output).not.toContain('Unknown integration: agents-md');
      // Should say "AGENTS.md: Not generated" (since file doesn't exist)
      expect(output).toContain('AGENTS.md');
    });

    it('reports AGENTS.md as generated when file exists', async () => {
      await fs.writeFile(
        '.clavix/config.json',
        JSON.stringify({
          version: '5.2.0',
          integrations: ['agents-md'],
        })
      );
      await fs.writeFile('AGENTS.md', '# AGENTS.md\n');

      const Diagnose = (await import('../../src/cli/commands/diagnose.js')).default;
      const diagnose = new Diagnose([], {} as any);

      const logs: string[] = [];
      jest.spyOn(diagnose, 'log').mockImplementation((msg: string) => {
        logs.push(msg);
      });

      await diagnose.run();

      const output = logs.join('\n');
      expect(output).toContain('AGENTS.md: Generated');
    });

    it('recognizes octo-md as a valid integration', async () => {
      await fs.writeFile(
        '.clavix/config.json',
        JSON.stringify({
          version: '5.2.0',
          integrations: ['octo-md'],
        })
      );

      const Diagnose = (await import('../../src/cli/commands/diagnose.js')).default;
      const diagnose = new Diagnose([], {} as any);

      const logs: string[] = [];
      jest.spyOn(diagnose, 'log').mockImplementation((msg: string) => {
        logs.push(msg);
      });

      await diagnose.run();

      const output = logs.join('\n');
      expect(output).not.toContain('Unknown integration: octo-md');
      expect(output).toContain('OCTO.md');
    });

    it('recognizes copilot-instructions as a valid integration', async () => {
      await fs.writeFile(
        '.clavix/config.json',
        JSON.stringify({
          version: '5.2.0',
          integrations: ['copilot-instructions'],
        })
      );

      const Diagnose = (await import('../../src/cli/commands/diagnose.js')).default;
      const diagnose = new Diagnose([], {} as any);

      const logs: string[] = [];
      jest.spyOn(diagnose, 'log').mockImplementation((msg: string) => {
        logs.push(msg);
      });

      await diagnose.run();

      const output = logs.join('\n');
      expect(output).not.toContain('Unknown integration: copilot-instructions');
      expect(output).toContain('GitHub Copilot');
    });
  });
});
