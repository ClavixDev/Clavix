/**
 * Removed Commands Consistency Test
 *
 * Verifies that removed CLI commands are properly handled.
 *
 * @since v5.3.0
 */

import { describe, it, expect, beforeAll } from '@jest/globals';
import * as path from 'path';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Navigate from tests/consistency to project root
const PROJECT_ROOT = path.resolve(__dirname, '../..');

describe('Removed Commands Consistency', () => {
  let projectRoot: string;

  beforeAll(() => {
    projectRoot = PROJECT_ROOT;
  });

  describe('CLI Reference Documentation', () => {
    it('should document removed commands in cli-reference.md', async () => {
      const cliRefPath = path.join(
        projectRoot,
        'src/templates/slash-commands/_components/agent-protocols/cli-reference.md'
      );

      const exists = await fs.pathExists(cliRefPath);
      expect(exists).toBe(true);

      if (exists) {
        const content = await fs.readFile(cliRefPath, 'utf-8');

        // Should have a section about removed commands
        expect(content).toContain('Removed Command');

        // Key removed commands should be documented
        expect(content).toContain('clavix execute');
        expect(content).toContain('clavix config');
      }
    });
  });

  describe('oclif Manifest', () => {
    it('should not include removed commands in manifest', async () => {
      const manifestPath = path.join(projectRoot, 'oclif.manifest.json');

      if (await fs.pathExists(manifestPath)) {
        const manifest = await fs.readJSON(manifestPath);
        const commands = Object.keys(manifest.commands || {});

        expect(commands).not.toContain('config');
        expect(commands).not.toContain('execute');
        expect(commands).not.toContain('fast');
        expect(commands).not.toContain('deep');
        expect(commands).not.toContain('session');
      }
    });
  });

  describe('Source Code', () => {
    it('should not have CLI command files for removed commands', async () => {
      const commandsDir = path.join(projectRoot, 'src/cli/commands');

      // These files should NOT exist
      const removedFiles = [
        'config.ts',
        'execute.ts',
        'fast.ts',
        'deep.ts',
        'session.ts',
        'prompts.ts',
      ];

      for (const file of removedFiles) {
        const filePath = path.join(commandsDir, file);
        const exists = await fs.pathExists(filePath);
        expect(exists).toBe(false);
      }
    });

    it('should only have expected CLI commands', async () => {
      const commandsDir = path.join(projectRoot, 'src/cli/commands');

      const exists = await fs.pathExists(commandsDir);
      expect(exists).toBe(true);

      if (exists) {
        const files = await fs.readdir(commandsDir);
        const tsFiles = files.filter((f: string) => f.endsWith('.ts'));

        // Expected commands in v5.3
        const expectedCommands = ['diagnose.ts', 'init.ts', 'update.ts', 'version.ts'];

        expect(tsFiles.sort()).toEqual(expectedCommands.sort());
      }
    });
  });
});
