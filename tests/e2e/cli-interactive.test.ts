import { spawn } from 'child_process';
import * as path from 'path';
import fs from 'fs-extra';
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CLAVIX_BIN = path.resolve(__dirname, '../../bin/clavix.js');

describe('CLI Interactive Tests', () => {
  const testDir = path.join(__dirname, 'tmp-interactive');

  // Helper to run interactive command
  const runInteractive = (args: string[], inputs: string[]): Promise<string> => {
    return new Promise((resolve, reject) => {
      // Use standard node execution (uses dist/ per package.json)
      const child = spawn('node', [CLAVIX_BIN, ...args], {
        cwd: testDir,
        env: {
          ...process.env,
          NODE_ENV: 'production',
          // Ensure no colors to make matching easier, though inquirer might force them
          // NO_COLOR: 'true'
        },
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      let output = '';
      let errorOutput = '';
      let inputIndex = 0;

      child.stdout.on('data', (data) => {
        const str = data.toString();
        output += str;
        // console.log('STDOUT:', str);

        // Simple mechanism to send inputs when ready
        // In real world, we might need to wait for specific prompts.
        // Here we just send inputs with a delay or when stream pauses?
        // Actually, inquirer writes to stdout/stderr.

        // We'll send all inputs with delays if we can't detect prompt easily.
        // But let's try to detect if we are waiting for input?
        // Inquirer usually doesn't signal "waiting" in a standard way other than printing the prompt.
      });

      child.stderr.on('data', (data) => {
        errorOutput += data.toString();
        // console.log('STDERR:', data.toString());
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve(output);
        } else {
          reject(
            new Error(
              `Child process exited with code ${code}\nStderr: ${errorOutput}\nStdout: ${output}`
            )
          );
        }
      });

      // Send inputs with delay
      const sendNextInput = () => {
        if (inputIndex < inputs.length) {
          const input = inputs[inputIndex++];
          // console.log('Sending input:', JSON.stringify(input));
          child.stdin.write(input);
          setTimeout(sendNextInput, 500);
        } else {
          child.stdin.end();
        }
      };

      // Wait a bit for startup then send inputs
      setTimeout(sendNextInput, 2000);
    });
  };

  beforeAll(async () => {
    // Ensure project is built
    if (!(await fs.pathExists(path.join(__dirname, '../../dist')))) {
      console.log('Building project for Interactive tests...');
      await new Promise<void>((resolve, reject) => {
        const build = spawn('npm', ['run', 'build'], { stdio: 'inherit' });
        build.on('close', (code) => (code === 0 ? resolve() : reject(new Error('Build failed'))));
      });
    }
    await fs.ensureDir(testDir);

    // Create a dummy config in testDir/.clavix/config.json so we don't fail on missing config
    const clavixDir = path.join(testDir, '.clavix');
    await fs.ensureDir(clavixDir);
    await fs.writeJSON(path.join(clavixDir, 'config.json'), {
      version: '1.0.0',
      agent: 'Claude Code',
      templates: {},
      outputs: {},
      preferences: {},
    });
  }, 120000);

  afterAll(async () => {
    await fs.remove(testDir);
  });

  it('should handle init reconfiguration menu and cancel', async () => {
    // Run 'clavix init' in existing project
    // It should show reconfiguration menu.
    // We want to select "Cancel".
    // Menu items: Reconfigure integrations, Update existing, Cancel.
    // "Cancel" is the 3rd item (index 2).
    // Down arrow is \x1B[B
    // So 2 down arrows then Enter (\r)

    const down = '\x1B[B';
    const enter = '\r';

    const inputs = [down + down + enter];

    const output = await runInteractive(['init'], inputs);

    expect(output).toContain('Clavix Initialization');
    expect(output).toContain('What would you like to do?');
    expect(output).toContain('cancelled');
    // Expect to NOT see errors
  }, 30000);

  // Add more interactive tests if needed
});
