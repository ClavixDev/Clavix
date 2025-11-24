/**
 * Safe chdir utility for tests
 *
 * Provides guaranteed cwd restoration even on test failures.
 * This helps prevent test pollution and flaky behavior.
 */

import fs from 'fs-extra';
import * as path from 'path';

/**
 * Execute a function in a specific test directory with guaranteed cleanup.
 *
 * @param testDir - The directory to change to
 * @param fn - The async function to execute
 * @returns The result of the function
 *
 * @example
 * await withTestDirectory(testDir, async () => {
 *   // Your test code here
 *   // cwd is testDir
 * });
 * // cwd is restored to original
 */
export async function withTestDirectory<T>(testDir: string, fn: () => Promise<T>): Promise<T> {
  const originalCwd = process.cwd();

  try {
    await fs.ensureDir(testDir);
    process.chdir(testDir);
    return await fn();
  } finally {
    // Always restore, even on error
    try {
      process.chdir(originalCwd);
    } catch {
      // Ignore chdir errors (e.g., if originalCwd was deleted)
    }

    // Cleanup test directory
    try {
      await fs.remove(testDir);
    } catch {
      // Ignore cleanup errors
    }
  }
}

/**
 * Create a unique test directory path.
 *
 * @param prefix - Prefix for the directory name
 * @returns Full path to a unique test directory
 */
export function createTestDirPath(prefix: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  return path.join(__dirname, '..', 'tmp', `${prefix}-${timestamp}-${random}`);
}

/**
 * Safe cleanup of test directory.
 * Will not throw if directory doesn't exist.
 *
 * @param testDir - Directory to clean up
 */
export async function safeCleanup(testDir: string): Promise<void> {
  try {
    await fs.remove(testDir);
  } catch {
    // Ignore errors - directory may already be gone
  }
}

/**
 * Restore cwd safely.
 * Will not throw if restoration fails.
 *
 * @param originalCwd - The original working directory
 */
export function safeRestoreCwd(originalCwd: string): void {
  try {
    if (process.cwd() !== originalCwd) {
      process.chdir(originalCwd);
    }
  } catch {
    // Ignore errors
  }
}

/**
 * Setup and teardown helpers for beforeEach/afterEach.
 *
 * @param prefix - Prefix for test directory names
 * @returns Object with setup and teardown functions
 *
 * @example
 * const { setup, teardown, getTestDir, getOriginalCwd } = createTestHarness('my-test');
 *
 * beforeEach(async () => {
 *   await setup();
 * });
 *
 * afterEach(async () => {
 *   await teardown();
 * });
 */
export function createTestHarness(prefix: string) {
  let testDir: string;
  let originalCwd: string;

  return {
    setup: async () => {
      originalCwd = process.cwd();
      testDir = createTestDirPath(prefix);
      await fs.ensureDir(testDir);
      process.chdir(testDir);
    },

    teardown: async () => {
      safeRestoreCwd(originalCwd);
      await safeCleanup(testDir);
    },

    getTestDir: () => testDir,
    getOriginalCwd: () => originalCwd,
  };
}
