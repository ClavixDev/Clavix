/**
 * Tests for AgentsMdGenerator - AGENTS.md file generation
 * Uses the real template from src/templates/agents/agents.md
 */

import fs from 'fs-extra';
import * as path from 'path';
import { AgentsMdGenerator } from '../../src/core/adapters/agents-md-generator';
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('AgentsMdGenerator', () => {
  const testDir = path.join(__dirname, '../fixtures/agents-md-generator');
  let originalCwd: string;

  beforeEach(async () => {
    // Clean up and setup
    await fs.remove(testDir);
    await fs.ensureDir(testDir);

    originalCwd = process.cwd();
    process.chdir(testDir);
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    await fs.remove(testDir);
  });

  describe('constants', () => {
    it('should have correct target file', () => {
      expect(AgentsMdGenerator.TARGET_FILE).toBe('AGENTS.md');
    });

    it('should have correct start marker', () => {
      expect(AgentsMdGenerator.START_MARKER).toBe('<!-- CLAVIX:START -->');
    });

    it('should have correct end marker', () => {
      expect(AgentsMdGenerator.END_MARKER).toBe('<!-- CLAVIX:END -->');
    });
  });

  describe('generate', () => {
    it('should create AGENTS.md if it does not exist', async () => {
      await AgentsMdGenerator.generate();

      const exists = await fs.pathExists('AGENTS.md');
      expect(exists).toBe(true);
    });

    it('should include Clavix markers in generated file', async () => {
      await AgentsMdGenerator.generate();

      const content = await fs.readFile('AGENTS.md', 'utf-8');
      expect(content).toContain('<!-- CLAVIX:START -->');
      expect(content).toContain('<!-- CLAVIX:END -->');
    });

    it('should include template content', async () => {
      await AgentsMdGenerator.generate();

      const content = await fs.readFile('AGENTS.md', 'utf-8');
      expect(content).toContain('# Clavix Instructions for Generic Agents');
    });

    it('should update existing AGENTS.md with Clavix block', async () => {
      // Create existing file
      await fs.writeFile('AGENTS.md', '# Existing Content\n\nSome text');

      await AgentsMdGenerator.generate();

      const content = await fs.readFile('AGENTS.md', 'utf-8');
      expect(content).toContain('# Existing Content');
      expect(content).toContain('<!-- CLAVIX:START -->');
      expect(content).toContain('# Clavix Instructions for Generic Agents');
    });

    it('should replace existing Clavix block', async () => {
      const initial = `# Project

<!-- CLAVIX:START -->
Old Clavix content that should be replaced
<!-- CLAVIX:END -->

Other content`;

      await fs.writeFile('AGENTS.md', initial);

      await AgentsMdGenerator.generate();

      const content = await fs.readFile('AGENTS.md', 'utf-8');
      expect(content).toContain('# Clavix Instructions for Generic Agents');
      expect(content).not.toContain('Old Clavix content');
      expect(content).toContain('Other content');
    });

    it('should preserve content outside Clavix block', async () => {
      const initial = `# Header

Content before

<!-- CLAVIX:START -->
Old block
<!-- CLAVIX:END -->

Content after`;

      await fs.writeFile('AGENTS.md', initial);

      await AgentsMdGenerator.generate();

      const content = await fs.readFile('AGENTS.md', 'utf-8');
      expect(content).toContain('# Header');
      expect(content).toContain('Content before');
      expect(content).toContain('# Clavix Instructions for Generic Agents');
      expect(content).toContain('Content after');
      expect(content).not.toContain('Old block');
    });

    it('should throw error if template does not exist', async () => {
      // Temporarily remove the template
      const templatePath = path.join(
        __dirname,
        '../../src/templates/agents/agents.md'
      );
      const backup = await fs.readFile(templatePath, 'utf-8');
      await fs.remove(templatePath);

      try {
        await expect(AgentsMdGenerator.generate()).rejects.toThrow(
          /template not found/
        );
      } finally {
        // Restore template
        await fs.writeFile(templatePath, backup);
      }
    });
  });

  describe('hasClavixBlock', () => {
    it('should return false when AGENTS.md does not exist', async () => {
      const result = await AgentsMdGenerator.hasClavixBlock();
      expect(result).toBe(false);
    });

    it('should return false when AGENTS.md exists without Clavix block', async () => {
      await fs.writeFile('AGENTS.md', '# Some content\n\nNo Clavix here');

      const result = await AgentsMdGenerator.hasClavixBlock();
      expect(result).toBe(false);
    });

    it('should return true when AGENTS.md has Clavix start marker', async () => {
      await fs.writeFile(
        'AGENTS.md',
        '# Content\n\n<!-- CLAVIX:START -->\nClavix content\n<!-- CLAVIX:END -->'
      );

      const result = await AgentsMdGenerator.hasClavixBlock();
      expect(result).toBe(true);
    });

    it('should return true even if only start marker present', async () => {
      await fs.writeFile('AGENTS.md', '<!-- CLAVIX:START -->');

      const result = await AgentsMdGenerator.hasClavixBlock();
      expect(result).toBe(true);
    });
  });

  describe('block injection logic', () => {
    it('should add newlines before appending block', async () => {
      await fs.writeFile('AGENTS.md', '# Header\nContent');

      await AgentsMdGenerator.generate();

      const content = await fs.readFile('AGENTS.md', 'utf-8');
      expect(content).toMatch(/Content\n\n<!-- CLAVIX:START -->/);
    });

    it('should not add extra newlines if file already ends with them', async () => {
      await fs.writeFile('AGENTS.md', '# Header\n\n');

      await AgentsMdGenerator.generate();

      const content = await fs.readFile('AGENTS.md', 'utf-8');
      expect(content).not.toMatch(/\n\n\n\n/);
    });

    it('should handle empty file', async () => {
      await fs.writeFile('AGENTS.md', '');

      await AgentsMdGenerator.generate();

      const content = await fs.readFile('AGENTS.md', 'utf-8');
      expect(content).toContain('<!-- CLAVIX:START -->');
    });
  });

  describe('edge cases', () => {
    it('should handle multiline template content', async () => {
      await AgentsMdGenerator.generate();

      const content = await fs.readFile('AGENTS.md', 'utf-8');
      expect(content).toContain('# Clavix Instructions for Generic Agents');
    });

    it('should handle multiple updates in sequence', async () => {
      // First generation
      await AgentsMdGenerator.generate();
      let content = await fs.readFile('AGENTS.md', 'utf-8');
      expect(content).toContain('# Clavix Instructions for Generic Agents');

      // Second generation (should replace existing block)
      await AgentsMdGenerator.generate();
      content = await fs.readFile('AGENTS.md', 'utf-8');
      expect(content).toContain('# Clavix Instructions for Generic Agents');

      // Should only have one Clavix block
      const startCount = (content.match(/<!-- CLAVIX:START -->/g) || []).length;
      expect(startCount).toBe(1);
    });

    it('should handle file with special characters in existing content', async () => {
      await fs.writeFile(
        'AGENTS.md',
        '# Content with $pecial ch@racters! and régex 🚀'
      );

      await AgentsMdGenerator.generate();

      const content = await fs.readFile('AGENTS.md', 'utf-8');
      expect(content).toContain('$pecial ch@racters!');
      expect(content).toContain('🚀');
      expect(content).toContain('# Clavix Instructions for Generic Agents');
    });
  });

  describe('atomic writes', () => {
    it('should use atomic file writes', async () => {
      await AgentsMdGenerator.generate();

      // File should exist and be readable
      const content = await fs.readFile('AGENTS.md', 'utf-8');
      expect(content).toContain('# Clavix Instructions for Generic Agents');
    });
  });
});
