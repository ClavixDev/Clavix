import { exec } from 'child_process';
import * as path from 'path';
import * as fs from 'fs-extra';
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { promisify } from 'util';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const execAsync = promisify(exec);
const CLAVIX_BIN = path.resolve(__dirname, '../../bin/clavix.js');

describe('CLI E2E Tests', () => {
  const testDir = path.join(__dirname, 'tmp-e2e');

  beforeAll(async () => {
    // Ensure project is built
    if (!(await fs.pathExists(path.join(__dirname, '../../dist')))) {
      console.log('Building project for E2E tests...');
      await execAsync('npm run build');
    }
    await fs.ensureDir(testDir);
  }, 60000); // Allow time for build

  afterAll(async () => {
    await fs.remove(testDir);
  });

  it('should display version', async () => {
    // Use compiled JS directly for faster execution
    const { stdout } = await execAsync(`node ${CLAVIX_BIN} --version`);
    expect(stdout).toMatch(/clavix\/\d+\.\d+\.\d+/);
  }, 60000);

  it('should display help', async () => {
    // Use compiled JS directly for faster execution
    const { stdout } = await execAsync(`node ${CLAVIX_BIN} --help`);
    expect(stdout).toContain('Clavix');
    expect(stdout).toContain('USAGE');
    expect(stdout).toContain('COMMANDS');
  }, 60000);
});
