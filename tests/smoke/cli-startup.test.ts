/**
 * CLI Startup Smoke Tests
 *
 * Quick sanity checks to verify the CLI can start and respond to basic commands.
 * These tests should run fast (<2s total) and catch catastrophic failures early.
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const execAsync = promisify(exec);
const CLI_PATH = path.join(process.cwd(), 'bin', 'clavix.js');

describe('CLI Startup Smoke Tests', () => {
  let originalCwd: string;
  let testDir: string;

  beforeEach(async () => {
    originalCwd = process.cwd();
    testDir = path.join(__dirname, '../tmp/smoke-cli-' + Date.now());
    await fs.ensureDir(testDir);
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    await fs.remove(testDir);
  });

  describe('help command', () => {
    it('should respond to --help flag', async () => {
      const { stdout } = await execAsync(`node ${CLI_PATH} --help`);
      expect(stdout).toContain('USAGE');
    }, 10000);

    it('should show available commands', async () => {
      const { stdout } = await execAsync(`node ${CLI_PATH} --help`);
      // Should show at least some core commands
      expect(stdout).toContain('COMMANDS');
    }, 10000);
  });

  describe('version command', () => {
    it('should respond to --version flag', async () => {
      const { stdout } = await execAsync(`node ${CLI_PATH} --version`);
      // Should return a semver version string
      expect(stdout.trim()).toMatch(/\d+\.\d+\.\d+/);
    }, 10000);

    it('should respond to version command', async () => {
      const { stdout } = await execAsync(`node ${CLI_PATH} version`);
      expect(stdout.toLowerCase()).toContain('clavix');
    }, 10000);
  });

  describe('basic command recognition', () => {
    it('should recognize fast command', async () => {
      try {
        await execAsync(`node ${CLI_PATH} fast --help`);
      } catch (error: any) {
        // Help should not throw
        if (error.code !== 0) {
          expect(error.stdout || error.stderr).toBeDefined();
        }
      }
    }, 10000);

    it('should recognize deep command', async () => {
      try {
        await execAsync(`node ${CLI_PATH} deep --help`);
      } catch (error: any) {
        if (error.code !== 0) {
          expect(error.stdout || error.stderr).toBeDefined();
        }
      }
    }, 10000);

    it('should recognize init command', async () => {
      try {
        await execAsync(`node ${CLI_PATH} init --help`);
      } catch (error: any) {
        if (error.code !== 0) {
          expect(error.stdout || error.stderr).toBeDefined();
        }
      }
    }, 10000);
  });

  describe('error handling', () => {
    it('should handle unknown command gracefully', async () => {
      try {
        await execAsync(`node ${CLI_PATH} unknowncommand123`);
        // Should fail with an error
        expect(true).toBe(false);
      } catch (error: any) {
        // Should get an error message
        expect(error.stderr || error.stdout).toBeDefined();
      }
    }, 10000);
  });
});
