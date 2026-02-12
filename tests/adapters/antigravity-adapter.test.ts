/**
 * Agent Skills Adapter Tests for Google Antigravity
 *
 * Tests for the Antigravity integration via specialized adapters.
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import { fileURLToPath } from 'url';
import {
  AntigravityGlobalAdapter,
  AntigravityWorkspaceAdapter,
} from '../../src/core/adapters/antigravity-adapter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Antigravity Adapters', () => {
  const testDir = path.join(__dirname, '../fixtures/antigravity-adapter');
  let originalCwd: string;

  beforeEach(async () => {
    await fs.remove(testDir);
    await fs.ensureDir(testDir);
    originalCwd = process.cwd();
    process.chdir(testDir);
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    await fs.remove(testDir);
  });

  describe('AntigravityGlobalAdapter', () => {
    it('should have correct name and display name', () => {
      const adapter = new AntigravityGlobalAdapter();
      expect(adapter.name).toBe('agent-skills-antigravity-global');
      expect(adapter.displayName).toBe('Agent Skills (Antigravity Global)');
    });

    it('should have correct directory', () => {
      const adapter = new AntigravityGlobalAdapter();
      expect(adapter.directory).toBe('~/.gemini/antigravity/skills');
    });

    it('should have "custom" install scope', () => {
      const adapter = new AntigravityGlobalAdapter();
      expect(adapter.installScope).toBe('custom');
    });

    it('should expand tilde in command path', () => {
      const adapter = new AntigravityGlobalAdapter();
      const commandPath = adapter.getCommandPath();
      expect(commandPath).toContain(os.homedir());
      expect(commandPath).toContain('.gemini');
      expect(commandPath).toContain('antigravity');
      expect(commandPath).toContain('skills');
      expect(commandPath).not.toContain('~');
    });
  });

  describe('AntigravityWorkspaceAdapter', () => {
    it('should have correct name and display name', () => {
      const adapter = new AntigravityWorkspaceAdapter();
      expect(adapter.name).toBe('agent-skills-antigravity-workspace');
      expect(adapter.displayName).toBe('Agent Skills (Antigravity Workspace)');
    });

    it('should have correct directory', () => {
      const adapter = new AntigravityWorkspaceAdapter();
      expect(adapter.directory).toBe('.agent/skills');
    });

    it('should have "custom" install scope', () => {
      const adapter = new AntigravityWorkspaceAdapter();
      expect(adapter.installScope).toBe('custom');
    });

    it('should use relative path in command path', () => {
      const adapter = new AntigravityWorkspaceAdapter();
      const commandPath = adapter.getCommandPath();
      expect(commandPath).toContain('.agent');
      expect(commandPath).toContain('skills');
      // Should be relative to current working directory (testDir)
      expect(commandPath).toContain(testDir);
    });
  });
});
