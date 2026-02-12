/**
 * Agent Skills Adapter Tests for Google Antigravity
 *
 * Tests for the Antigravity integration in AgentSkillsAdapter.
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import { fileURLToPath } from 'url';
import { AgentSkillsAdapter } from '../../src/core/adapters/agent-skills-adapter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('AgentSkillsAdapter (Antigravity)', () => {
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

  describe('constructor', () => {
    it('should create antigravity global adapter with correct name', () => {
      const adapter = new AgentSkillsAdapter('antigravity-global');
      expect(adapter.name).toBe('agent-skills-antigravity-global');
      expect(adapter.displayName).toBe('Agent Skills (Antigravity Global)');
    });

    it('should create antigravity workspace adapter with correct name', () => {
      const adapter = new AgentSkillsAdapter('antigravity-workspace');
      expect(adapter.name).toBe('agent-skills-antigravity-workspace');
      expect(adapter.displayName).toBe('Agent Skills (Antigravity Workspace)');
    });
  });

  describe('directory', () => {
    it('should return correct path for antigravity global scope', () => {
      const adapter = new AgentSkillsAdapter('antigravity-global');
      expect(adapter.directory).toBe('~/.gemini/antigravity/skills');
    });

    it('should return correct path for antigravity workspace scope', () => {
      const adapter = new AgentSkillsAdapter('antigravity-workspace');
      expect(adapter.directory).toBe('.agent/skills');
    });
  });

  describe('getCommandPath', () => {
    it('should expand tilde for antigravity global scope', () => {
      const adapter = new AgentSkillsAdapter('antigravity-global');
      const commandPath = adapter.getCommandPath();
      expect(commandPath).toContain(os.homedir());
      expect(commandPath).toContain('.gemini');
      expect(commandPath).toContain('antigravity');
      expect(commandPath).toContain('skills');
      expect(commandPath).not.toContain('~');
    });

    it('should use relative path for antigravity workspace scope', () => {
      const adapter = new AgentSkillsAdapter('antigravity-workspace');
      const commandPath = adapter.getCommandPath();
      expect(commandPath).toContain('.agent');
      expect(commandPath).toContain('skills');
      // Should be relative to current working directory (testDir)
      expect(commandPath).toContain(testDir);
    });
  });
});
