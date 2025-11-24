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

    it('should return null for non-existent file', async () => {
      const extracted = await DocInjector.extractBlock('nonexistent.md');
      expect(extracted).toBeNull();
    });

    it('should extract content with custom markers', async () => {
      const content = `<!-- CUSTOM:BEGIN -->
Custom content
<!-- CUSTOM:FINISH -->`;

      await fs.writeFile(testFile, content);

      const extracted = await DocInjector.extractBlock(
        testFile,
        '<!-- CUSTOM:BEGIN -->',
        '<!-- CUSTOM:FINISH -->'
      );
      expect(extracted).toBe('Custom content');
    });

    it('should extract multiline content', async () => {
      const content = `<!-- CLAVIX:START -->
Line 1
Line 2
Line 3
<!-- CLAVIX:END -->`;

      await fs.writeFile(testFile, content);

      const extracted = await DocInjector.extractBlock(testFile);
      expect(extracted).toBe('Line 1\nLine 2\nLine 3');
    });
  });

  describe('removeBlock', () => {
    it('should remove existing block', async () => {
      const content = `Header
<!-- CLAVIX:START -->
Content to remove
<!-- CLAVIX:END -->
Footer`;

      await fs.writeFile(testFile, content);

      await DocInjector.removeBlock(testFile);

      const result = await fs.readFile(testFile, 'utf-8');
      expect(result).toContain('Header');
      expect(result).toContain('Footer');
      expect(result).not.toContain('<!-- CLAVIX:START -->');
      expect(result).not.toContain('Content to remove');
      expect(result).not.toContain('<!-- CLAVIX:END -->');
    });

    it('should do nothing if file does not exist', async () => {
      // Should not throw
      await expect(DocInjector.removeBlock('nonexistent.md')).resolves.not.toThrow();
    });

    it('should do nothing if no block exists', async () => {
      await fs.writeFile(testFile, 'No block here');

      await DocInjector.removeBlock(testFile);

      const result = await fs.readFile(testFile, 'utf-8');
      expect(result).toBe('No block here');
    });

    it('should remove block with custom markers', async () => {
      const content = `Header
<!-- CUSTOM:BEGIN -->
Custom content
<!-- CUSTOM:FINISH -->
Footer`;

      await fs.writeFile(testFile, content);

      await DocInjector.removeBlock(testFile, '<!-- CUSTOM:BEGIN -->', '<!-- CUSTOM:FINISH -->');

      const result = await fs.readFile(testFile, 'utf-8');
      expect(result).toContain('Header');
      expect(result).toContain('Footer');
      expect(result).not.toContain('<!-- CUSTOM:BEGIN -->');
      expect(result).not.toContain('Custom content');
    });

    it('should successfully remove block (backup cleaned up on success)', async () => {
      const content = `<!-- CLAVIX:START -->
Content
<!-- CLAVIX:END -->`;

      await fs.writeFile(testFile, content);

      await DocInjector.removeBlock(testFile);

      // Backup is cleaned up after successful write by FileSystem.writeFileAtomic
      const backupExists = await fs.pathExists(`${testFile}.backup`);
      expect(backupExists).toBe(false);

      // Verify block was actually removed
      const hasBlock = await DocInjector.hasBlock(testFile);
      expect(hasBlock).toBe(false);
    });
  });

  describe('injectBlock with options', () => {
    it('should throw DataError when createIfMissing is false and file does not exist', async () => {
      await expect(
        DocInjector.injectBlock('nonexistent.md', 'content', { createIfMissing: false })
      ).rejects.toThrow('File not found');
    });

    it('should create file when createIfMissing is true (default)', async () => {
      await DocInjector.injectBlock('new-file.md', 'content');

      const exists = await fs.pathExists('new-file.md');
      expect(exists).toBe(true);

      const result = await fs.readFile('new-file.md', 'utf-8');
      expect(result).toContain('content');
    });

    it('should use custom markers', async () => {
      await DocInjector.injectBlock(testFile, 'Custom content', {
        startMarker: '<!-- MY:START -->',
        endMarker: '<!-- MY:END -->',
      });

      const result = await fs.readFile(testFile, 'utf-8');
      expect(result).toContain('<!-- MY:START -->');
      expect(result).toContain('Custom content');
      expect(result).toContain('<!-- MY:END -->');
      expect(result).not.toContain('<!-- CLAVIX:START -->');
    });

    it('should validate markdown when validateMarkdown is true (default)', async () => {
      // Unbalanced code blocks should throw
      const invalidContent = '```\nCode without closing';

      await expect(DocInjector.injectBlock(testFile, invalidContent)).rejects.toThrow(
        'Unbalanced code blocks'
      );
    });

    it('should skip validation when validateMarkdown is false', async () => {
      const invalidContent = '```\nCode without closing';

      await expect(
        DocInjector.injectBlock(testFile, invalidContent, { validateMarkdown: false })
      ).resolves.not.toThrow();

      const result = await fs.readFile(testFile, 'utf-8');
      expect(result).toContain('Code without closing');
    });

    it('should append block to existing content', async () => {
      await fs.writeFile(testFile, '# Existing Header\n\nExisting content');

      await DocInjector.injectBlock(testFile, 'New block content');

      const result = await fs.readFile(testFile, 'utf-8');
      expect(result).toContain('# Existing Header');
      expect(result).toContain('Existing content');
      expect(result).toContain('New block content');
    });
  });

  describe('hasBlock', () => {
    it('should return false for non-existent file', async () => {
      const hasBlock = await DocInjector.hasBlock('nonexistent.md');
      expect(hasBlock).toBe(false);
    });

    it('should detect block with custom markers', async () => {
      const content = `<!-- CUSTOM:START -->
Content
<!-- CUSTOM:END -->`;

      await fs.writeFile(testFile, content);

      const hasDefault = await DocInjector.hasBlock(testFile);
      expect(hasDefault).toBe(false);

      const hasCustom = await DocInjector.hasBlock(
        testFile,
        '<!-- CUSTOM:START -->',
        '<!-- CUSTOM:END -->'
      );
      expect(hasCustom).toBe(true);
    });

    it('should handle partial markers (start only)', async () => {
      const content = '<!-- CLAVIX:START --> but no end marker';

      await fs.writeFile(testFile, content);

      const hasBlock = await DocInjector.hasBlock(testFile);
      expect(hasBlock).toBe(false);
    });
  });

  describe('getDefaultAgentsContent', () => {
    it('should return non-empty string', () => {
      const content = DocInjector.getDefaultAgentsContent();
      expect(content).toBeTruthy();
      expect(typeof content).toBe('string');
    });

    it('should contain CLAVIX markers', () => {
      const content = DocInjector.getDefaultAgentsContent();
      expect(content).toContain('<!-- CLAVIX:START -->');
      expect(content).toContain('<!-- CLAVIX:END -->');
    });

    it('should contain slash command documentation', () => {
      const content = DocInjector.getDefaultAgentsContent();
      expect(content).toContain('/clavix:fast');
      expect(content).toContain('/clavix:deep');
      expect(content).toContain('/clavix:prd');
      expect(content).toContain('/clavix:start');
      expect(content).toContain('/clavix:summarize');
    });

    it('should contain usage guidance', () => {
      const content = DocInjector.getDefaultAgentsContent();
      expect(content).toContain('When to use');
      expect(content).toContain('Fast mode');
      expect(content).toContain('Deep mode');
    });
  });

  describe('getDefaultClaudeContent', () => {
    it('should return non-empty string', () => {
      const content = DocInjector.getDefaultClaudeContent();
      expect(content).toBeTruthy();
      expect(typeof content).toBe('string');
    });

    it('should contain CLAVIX markers', () => {
      const content = DocInjector.getDefaultClaudeContent();
      expect(content).toContain('<!-- CLAVIX:START -->');
      expect(content).toContain('<!-- CLAVIX:END -->');
    });

    it('should contain slash command documentation', () => {
      const content = DocInjector.getDefaultClaudeContent();
      expect(content).toContain('/clavix:fast');
      expect(content).toContain('/clavix:deep');
      expect(content).toContain('/clavix:prd');
      expect(content).toContain('/clavix:start');
      expect(content).toContain('/clavix:summarize');
    });

    it('should contain Clavix Integration header', () => {
      const content = DocInjector.getDefaultClaudeContent();
      expect(content).toContain('## Clavix Integration');
    });

    it('should contain mode descriptions', () => {
      const content = DocInjector.getDefaultClaudeContent();
      expect(content).toContain('Quick prompt improvements');
      expect(content).toContain('Comprehensive prompt analysis');
      expect(content).toContain('PRD generation workflow');
    });

    it('should contain Pro tip', () => {
      const content = DocInjector.getDefaultClaudeContent();
      expect(content).toContain('Pro tip');
    });
  });

  describe('markdown validation', () => {
    it('should reject unbalanced code blocks', async () => {
      const contentWithOddBlocks = '```\ncode\n```\n```\nunfinished';

      await expect(DocInjector.injectBlock(testFile, contentWithOddBlocks)).rejects.toThrow(
        'Unbalanced code blocks'
      );
    });

    it('should accept balanced code blocks', async () => {
      const contentWithBalancedBlocks = '```js\ncode\n```\n\n```ts\nmore code\n```';

      await expect(
        DocInjector.injectBlock(testFile, contentWithBalancedBlocks)
      ).resolves.not.toThrow();
    });

    it('should accept content without code blocks', async () => {
      const simpleContent = '# Header\n\nSome text here';

      await expect(DocInjector.injectBlock(testFile, simpleContent)).resolves.not.toThrow();
    });
  });

  describe('edge cases', () => {
    it('should handle empty content injection', async () => {
      await DocInjector.injectBlock(testFile, '');

      const result = await fs.readFile(testFile, 'utf-8');
      expect(result).toContain('<!-- CLAVIX:START -->');
      expect(result).toContain('<!-- CLAVIX:END -->');
    });

    it('should handle content with special regex characters', async () => {
      const specialContent = 'Content with $special (regex) [chars] {here}';

      await DocInjector.injectBlock(testFile, specialContent);

      const result = await fs.readFile(testFile, 'utf-8');
      expect(result).toContain(specialContent);
    });

    it('should handle multiple operations on same file', async () => {
      // First injection
      await DocInjector.injectBlock(testFile, 'First content');

      // Update
      await DocInjector.injectBlock(testFile, 'Second content');

      // Extract
      const extracted = await DocInjector.extractBlock(testFile);
      expect(extracted).toBe('Second content');

      // Remove
      await DocInjector.removeBlock(testFile);

      // Verify removal
      const hasBlock = await DocInjector.hasBlock(testFile);
      expect(hasBlock).toBe(false);
    });

    it('should handle newlines properly when appending', async () => {
      await fs.writeFile(testFile, 'Existing content');

      await DocInjector.injectBlock(testFile, 'New content');

      const result = await fs.readFile(testFile, 'utf-8');
      // Should have proper spacing between existing and new content
      expect(result).toMatch(/Existing content\n\n<!-- CLAVIX:START -->/);
    });

    it('should handle file already ending with newlines', async () => {
      await fs.writeFile(testFile, 'Existing content\n\n');

      await DocInjector.injectBlock(testFile, 'New content');

      const result = await fs.readFile(testFile, 'utf-8');
      // Should not add extra newlines
      expect(result).toContain('Existing content\n\n<!-- CLAVIX:START -->');
    });
  });
});
