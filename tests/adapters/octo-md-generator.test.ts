/**
 * Tests for OctoMdGenerator - OCTO.md file generation
 * Uses the real template from src/templates/agents/octo.md
 */

import fs from 'fs-extra';
import * as path from 'path';
import { OctoMdGenerator } from '../../src/core/adapters/octo-md-generator';
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('OctoMdGenerator', () => {
  const testDir = path.join(__dirname, '../fixtures/octo-md-generator');
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
      expect(OctoMdGenerator.TARGET_FILE).toBe('OCTO.md');
    });

    it('should have correct start marker', () => {
      expect(OctoMdGenerator.START_MARKER).toBe('<!-- CLAVIX:START -->');
    });

    it('should have correct end marker', () => {
      expect(OctoMdGenerator.END_MARKER).toBe('<!-- CLAVIX:END -->');
    });
  });

  describe('generate', () => {
    it('should create OCTO.md if it does not exist', async () => {
      await OctoMdGenerator.generate();

      const exists = await fs.pathExists('OCTO.md');
      expect(exists).toBe(true);
    });

    it('should include Clavix markers in generated file', async () => {
      await OctoMdGenerator.generate();

      const content = await fs.readFile('OCTO.md', 'utf-8');
      expect(content).toContain('<!-- CLAVIX:START -->');
      expect(content).toContain('<!-- CLAVIX:END -->');
    });

    it('should include template content', async () => {
      await OctoMdGenerator.generate();

      const content = await fs.readFile('OCTO.md', 'utf-8');
      // OCTO template has Octofriend-specific content
      expect(content.length).toBeGreaterThan(0);
    });

    it('should update existing OCTO.md with Clavix block', async () => {
      // Create existing file
      await fs.writeFile('OCTO.md', '# Existing Content\n\nSome text');

      await OctoMdGenerator.generate();

      const content = await fs.readFile('OCTO.md', 'utf-8');
      expect(content).toContain('# Existing Content');
      expect(content).toContain('<!-- CLAVIX:START -->');
    });

    it('should replace existing Clavix block', async () => {
      const initial = `# Project

<!-- CLAVIX:START -->
Old Clavix content that should be replaced
<!-- CLAVIX:END -->

Other content`;

      await fs.writeFile('OCTO.md', initial);

      await OctoMdGenerator.generate();

      const content = await fs.readFile('OCTO.md', 'utf-8');
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

      await fs.writeFile('OCTO.md', initial);

      await OctoMdGenerator.generate();

      const content = await fs.readFile('OCTO.md', 'utf-8');
      expect(content).toContain('# Header');
      expect(content).toContain('Content before');
      expect(content).toContain('Content after');
      expect(content).not.toContain('Old block');
    });

    it('should throw error if template does not exist', async () => {
      // Temporarily remove the template
      const templatePath = path.join(
        __dirname,
        '../../src/templates/agents/octo.md'
      );
      const backup = await fs.readFile(templatePath, 'utf-8');
      await fs.remove(templatePath);

      try {
        await expect(OctoMdGenerator.generate()).rejects.toThrow(
          /template not found/
        );
      } finally {
        // Restore template
        await fs.writeFile(templatePath, backup);
      }
    });
  });

  describe('hasClavixBlock', () => {
    it('should return false when OCTO.md does not exist', async () => {
      const result = await OctoMdGenerator.hasClavixBlock();
      expect(result).toBe(false);
    });

    it('should return false when OCTO.md exists without Clavix block', async () => {
      await fs.writeFile('OCTO.md', '# Some content\n\nNo Clavix here');

      const result = await OctoMdGenerator.hasClavixBlock();
      expect(result).toBe(false);
    });

    it('should return true when OCTO.md has Clavix start marker', async () => {
      await fs.writeFile(
        'OCTO.md',
        '# Content\n\n<!-- CLAVIX:START -->\nClavix content\n<!-- CLAVIX:END -->'
      );

      const result = await OctoMdGenerator.hasClavixBlock();
      expect(result).toBe(true);
    });

    it('should return true even if only start marker present', async () => {
      await fs.writeFile('OCTO.md', '<!-- CLAVIX:START -->');

      const result = await OctoMdGenerator.hasClavixBlock();
      expect(result).toBe(true);
    });
  });

  describe('block injection logic', () => {
    it('should add newlines before appending block', async () => {
      await fs.writeFile('OCTO.md', '# Header\nContent');

      await OctoMdGenerator.generate();

      const content = await fs.readFile('OCTO.md', 'utf-8');
      expect(content).toMatch(/Content\n\n<!-- CLAVIX:START -->/);
    });

    it('should not add extra newlines if file already ends with them', async () => {
      await fs.writeFile('OCTO.md', '# Header\n\n');

      await OctoMdGenerator.generate();

      const content = await fs.readFile('OCTO.md', 'utf-8');
      expect(content).not.toMatch(/\n\n\n\n/);
    });

    it('should handle empty file', async () => {
      await fs.writeFile('OCTO.md', '');

      await OctoMdGenerator.generate();

      const content = await fs.readFile('OCTO.md', 'utf-8');
      expect(content).toContain('<!-- CLAVIX:START -->');
    });
  });

  describe('edge cases', () => {
    it('should handle multiline template content', async () => {
      await OctoMdGenerator.generate();

      const content = await fs.readFile('OCTO.md', 'utf-8');
      expect(content.length).toBeGreaterThan(100);
    });

    it('should handle multiple updates in sequence', async () => {
      // First generation
      await OctoMdGenerator.generate();
      let content = await fs.readFile('OCTO.md', 'utf-8');
      const firstLength = content.length;

      // Second generation (should replace existing block)
      await OctoMdGenerator.generate();
      content = await fs.readFile('OCTO.md', 'utf-8');

      // Should only have one Clavix block
      const startCount = (content.match(/<!-- CLAVIX:START -->/g) || []).length;
      expect(startCount).toBe(1);
    });

    it('should handle file with special characters in existing content', async () => {
      await fs.writeFile(
        'OCTO.md',
        '# Content with $pecial ch@racters! and régex 🚀'
      );

      await OctoMdGenerator.generate();

      const content = await fs.readFile('OCTO.md', 'utf-8');
      expect(content).toContain('$pecial ch@racters!');
      expect(content).toContain('🚀');
    });
  });

  describe('atomic writes', () => {
    it('should use atomic file writes', async () => {
      await OctoMdGenerator.generate();

      // File should exist and be readable
      const content = await fs.readFile('OCTO.md', 'utf-8');
      expect(content.length).toBeGreaterThan(0);
    });
  });
});
