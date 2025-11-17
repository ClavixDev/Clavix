import { DocInjector } from '../../src/core/doc-injector';
import fs from 'fs-extra';
import * as path from 'path';
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('DocInjector', () => {
  const testDir = path.join(__dirname, '../tmp/doc-injector-test');
  const testFile = 'test.md';

  beforeEach(async () => {
    await fs.ensureDir(testDir);
    process.chdir(testDir);
  });

  afterEach(async () => {
    process.chdir(path.join(__dirname, '../..'));
    await fs.remove(testDir);
  });

  describe('injectBlock', () => {
    it('should inject new block in empty file', async () => {
      const content = '# Test Content';
      await DocInjector.injectBlock(testFile, content);

      const result = await fs.readFile(testFile, 'utf-8');
      expect(result).toContain('<!-- CLAVIX:START -->');
      expect(result).toContain('# Test Content');
      expect(result).toContain('<!-- CLAVIX:END -->');
    });

    it('should replace existing block', async () => {
      const initial = `Some content
<!-- CLAVIX:START -->
Old content
<!-- CLAVIX:END -->
More content`;

      await fs.writeFile(testFile, initial);

      const newContent = 'New content';
      await DocInjector.injectBlock(testFile, newContent);

      const result = await fs.readFile(testFile, 'utf-8');
      expect(result).toContain('New content');
      expect(result).not.toContain('Old content');
      expect(result).toContain('Some content');
      expect(result).toContain('More content');
    });

    it('should preserve content outside managed block', async () => {
      const initial = `# Header

Some content

<!-- CLAVIX:START -->
Old content
<!-- CLAVIX:END -->

Footer content`;

      await fs.writeFile(testFile, initial);

      await DocInjector.injectBlock(testFile, 'New content');

      const result = await fs.readFile(testFile, 'utf-8');
      expect(result).toContain('# Header');
      expect(result).toContain('Some content');
      expect(result).toContain('Footer content');
    });
  });

  describe('hasBlock', () => {
    it('should detect existing block', async () => {
      const content = `<!-- CLAVIX:START -->
Content
<!-- CLAVIX:END -->`;

      await fs.writeFile(testFile, content);

      const hasBlock = await DocInjector.hasBlock(testFile);
      expect(hasBlock).toBe(true);
    });

    it('should return false for file without block', async () => {
      await fs.writeFile(testFile, 'No block here');

      const hasBlock = await DocInjector.hasBlock(testFile);
      expect(hasBlock).toBe(false);
    });
  });

  describe('extractBlock', () => {
    it('should extract content from block', async () => {
      const content = `<!-- CLAVIX:START -->
Test content
<!-- CLAVIX:END -->`;

      await fs.writeFile(testFile, content);

      const extracted = await DocInjector.extractBlock(testFile);
      expect(extracted).toBe('Test content');
    });

    it('should return null if no block exists', async () => {
      await fs.writeFile(testFile, 'No block');

      const extracted = await DocInjector.extractBlock(testFile);
      expect(extracted).toBeNull();
    });
  });
});
