/**
 * Adapter Interface Contract Tests
 *
 * Verifies that all adapters properly implement the AgentAdapter interface.
 * This ensures consistency across all integration adapters.
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import * as path from 'path';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import all adapters dynamically
import { BaseAdapter } from '../../src/core/adapters/base-adapter.js';
import { ClaudeCodeAdapter } from '../../src/core/adapters/claude-code-adapter.js';
import { CursorAdapter } from '../../src/core/adapters/cursor-adapter.js';
import { WindsurfAdapter } from '../../src/core/adapters/windsurf-adapter.js';
import { ClineAdapter } from '../../src/core/adapters/cline-adapter.js';
import { KilocodeAdapter } from '../../src/core/adapters/kilocode-adapter.js';
import { RoocodeAdapter } from '../../src/core/adapters/roocode-adapter.js';
import { CodeBuddyAdapter } from '../../src/core/adapters/codebuddy-adapter.js';
import { CrushAdapter } from '../../src/core/adapters/crush-adapter.js';
import { DroidAdapter } from '../../src/core/adapters/droid-adapter.js';
import { AmpAdapter } from '../../src/core/adapters/amp-adapter.js';
import { AugmentAdapter } from '../../src/core/adapters/augment-adapter.js';
import { GeminiAdapter } from '../../src/core/adapters/gemini-adapter.js';
import { QwenAdapter } from '../../src/core/adapters/qwen-adapter.js';
import { CodexAdapter } from '../../src/core/adapters/codex-adapter.js';
import { LlxprtAdapter } from '../../src/core/adapters/llxprt-adapter.js';
import { OpenCodeAdapter } from '../../src/core/adapters/opencode-adapter.js';
import { AgentAdapter } from '../../src/types/agent.js';

const adapterClasses: Array<{ name: string; Class: new () => AgentAdapter }> = [
  { name: 'ClaudeCodeAdapter', Class: ClaudeCodeAdapter },
  { name: 'CursorAdapter', Class: CursorAdapter },
  { name: 'WindsurfAdapter', Class: WindsurfAdapter },
  { name: 'ClineAdapter', Class: ClineAdapter },
  { name: 'KilocodeAdapter', Class: KilocodeAdapter },
  { name: 'RoocodeAdapter', Class: RoocodeAdapter },
  { name: 'CodeBuddyAdapter', Class: CodeBuddyAdapter },
  { name: 'CrushAdapter', Class: CrushAdapter },
  { name: 'DroidAdapter', Class: DroidAdapter },
  { name: 'AmpAdapter', Class: AmpAdapter },
  { name: 'AugmentAdapter', Class: AugmentAdapter },
  { name: 'GeminiAdapter', Class: GeminiAdapter },
  { name: 'QwenAdapter', Class: QwenAdapter },
  { name: 'CodexAdapter', Class: CodexAdapter },
  { name: 'LlxprtAdapter', Class: LlxprtAdapter },
  { name: 'OpenCodeAdapter', Class: OpenCodeAdapter },
];

describe('Adapter Interface Contract Tests', () => {
  let testDir: string;
  let originalCwd: string;

  beforeEach(async () => {
    originalCwd = process.cwd();
    testDir = path.join(__dirname, '../tmp/contract-adapter-' + Date.now());
    await fs.ensureDir(testDir);
    process.chdir(testDir);
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    await fs.remove(testDir);
  });

  describe('Required properties', () => {
    it.each(adapterClasses)('$name should have name property', ({ Class }) => {
      const adapter = new Class();
      expect(adapter.name).toBeDefined();
      expect(typeof adapter.name).toBe('string');
      expect(adapter.name.length).toBeGreaterThan(0);
    });

    it.each(adapterClasses)('$name should have displayName property', ({ Class }) => {
      const adapter = new Class();
      expect(adapter.displayName).toBeDefined();
      expect(typeof adapter.displayName).toBe('string');
      expect(adapter.displayName.length).toBeGreaterThan(0);
    });

    it.each(adapterClasses)('$name should have directory property', ({ Class }) => {
      const adapter = new Class();
      expect(adapter.directory).toBeDefined();
      expect(typeof adapter.directory).toBe('string');
    });

    it.each(adapterClasses)('$name should have fileExtension property', ({ Class }) => {
      const adapter = new Class();
      expect(adapter.fileExtension).toBeDefined();
      expect(typeof adapter.fileExtension).toBe('string');
    });
  });

  describe('Required methods', () => {
    it.each(adapterClasses)('$name should have detectProject method', ({ Class }) => {
      const adapter = new Class();
      expect(typeof adapter.detectProject).toBe('function');
    });

    it.each(adapterClasses)('$name should have generateCommands method', ({ Class }) => {
      const adapter = new Class();
      expect(typeof adapter.generateCommands).toBe('function');
    });

    it.each(adapterClasses)('$name should have removeAllCommands method', ({ Class }) => {
      const adapter = new Class();
      expect(typeof adapter.removeAllCommands).toBe('function');
    });

    it.each(adapterClasses)('$name should have injectDocumentation method', ({ Class }) => {
      const adapter = new Class();
      expect(typeof adapter.injectDocumentation).toBe('function');
    });

    it.each(adapterClasses)('$name should have getCommandPath method', ({ Class }) => {
      const adapter = new Class();
      expect(typeof adapter.getCommandPath).toBe('function');
    });

    it.each(adapterClasses)('$name should have getTargetFilename method', ({ Class }) => {
      const adapter = new Class();
      expect(typeof adapter.getTargetFilename).toBe('function');
    });
  });

  describe('Name uniqueness', () => {
    it('should have unique names across all adapters', () => {
      const names = adapterClasses.map(({ Class }) => new Class().name);
      const uniqueNames = new Set(names);
      expect(uniqueNames.size).toBe(names.length);
    });
  });

  describe('Directory patterns', () => {
    it.each(adapterClasses)('$name directory should not be empty', ({ Class }) => {
      const adapter = new Class();
      expect(adapter.directory.length).toBeGreaterThan(0);
    });

    it.each(adapterClasses)('$name directory should not have trailing slash', ({ Class }) => {
      const adapter = new Class();
      expect(adapter.directory.endsWith('/')).toBe(false);
    });
  });

  describe('File extension patterns', () => {
    it.each(adapterClasses)('$name fileExtension should be valid', ({ Class }) => {
      const adapter = new Class();
      // Extensions can be empty or start with dot
      if (adapter.fileExtension.length > 0) {
        expect(adapter.fileExtension.startsWith('.')).toBe(true);
      }
    });
  });

  describe('getCommandPath method', () => {
    it.each(adapterClasses)('$name getCommandPath should return string', ({ Class }) => {
      const adapter = new Class();
      const commandPath = adapter.getCommandPath();
      expect(typeof commandPath).toBe('string');
    });

    it.each(adapterClasses)('$name getCommandPath should return valid path', ({ Class }) => {
      const adapter = new Class();
      const commandPath = adapter.getCommandPath();
      // Command path should be a non-empty string
      expect(commandPath.length).toBeGreaterThan(0);
      // Path should not contain unexpanded ~ unless it's a home-based path
      // (adapters should expand ~ in getCommandPath)
      if (adapter.directory.startsWith('~')) {
        // For home-based adapters, the expanded path should not start with ~
        expect(commandPath.startsWith('~')).toBe(false);
      } else {
        // For project-based adapters, path should contain directory
        expect(commandPath).toContain(adapter.directory);
      }
    });
  });

  describe('getTargetFilename method', () => {
    it.each(adapterClasses)('$name getTargetFilename should return string', ({ Class }) => {
      const adapter = new Class();
      const filename = adapter.getTargetFilename('test-command');
      expect(typeof filename).toBe('string');
      expect(filename.length).toBeGreaterThan(0);
    });

    it.each(adapterClasses)('$name getTargetFilename should include extension', ({ Class }) => {
      const adapter = new Class();
      const filename = adapter.getTargetFilename('test');
      // If there's an extension, filename should include it
      if (adapter.fileExtension.length > 0) {
        expect(filename).toContain(adapter.fileExtension);
      }
    });
  });

  describe('detectProject method', () => {
    it.each(adapterClasses)('$name detectProject should return boolean', async ({ Class }) => {
      const adapter = new Class();
      const result = await adapter.detectProject();
      expect(typeof result).toBe('boolean');
    });
  });

  describe('Validation method', () => {
    it.each(adapterClasses)(
      '$name validate (if exists) should return proper structure',
      async ({ Class }) => {
        const adapter = new Class();
        if (adapter.validate) {
          const result = await adapter.validate();
          expect(result).toHaveProperty('valid');
          expect(typeof result.valid).toBe('boolean');
        } else {
          // Validate is optional per interface
          expect(true).toBe(true);
        }
      }
    );
  });
});
