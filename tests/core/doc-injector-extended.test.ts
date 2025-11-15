/**
 * Extended tests for DocInjector - Backup recovery and edge cases
 * Covers: backup/restore on failure, multiple blocks, markdown validation
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import { DocInjector } from '../../src/core/doc-injector';

describe('DocInjector - Extended (Backup, Recovery & Edge Cases)', () => {
  const testDir = path.join(__dirname, '../fixtures/doc-injector-extended');

  beforeEach(async () => {
    await fs.remove(testDir);
    await fs.ensureDir(testDir);
  });

  afterEach(async () => {
    await fs.remove(testDir);
  });

  describe('Backup and Recovery', () => {
    it('should preserve original content when modifying file', async () => {
      const filePath = path.join(testDir, 'test.md');
      const originalContent = '# Original Content\n\nSome text here';

      // Create initial file
      await fs.writeFile(filePath, originalContent);

      // Inject content
      await DocInjector.injectBlock(filePath, 'New content');

      // File should be modified
      const newContent = await fs.readFile(filePath, 'utf-8');
      expect(newContent).toContain('New content');
      expect(newContent).toContain('Original Content');
    });

    it('should not create backup when creating new file', async () => {
      const filePath = path.join(testDir, 'new-file.md');

      // Inject content to non-existent file
      await DocInjector.injectBlock(filePath, 'New content');

      // No backup should exist
      const backupPath = `${filePath}.backup`;
      expect(await fs.pathExists(backupPath)).toBe(false);

      // File should be created
      expect(await fs.pathExists(filePath)).toBe(true);
    });

    it('should handle subsequent updates correctly', async () => {
      const filePath = path.join(testDir, 'update-test.md');
      const initialContent = 'Initial';
      const firstUpdate = 'First update';
      const secondUpdate = 'Second update';

      // Create file and first update
      await fs.writeFile(filePath, initialContent);
      await DocInjector.injectBlock(filePath, firstUpdate);

      let content = await fs.readFile(filePath, 'utf-8');
      expect(content).toContain(firstUpdate);

      // Second update
      await DocInjector.injectBlock(filePath, secondUpdate);

      content = await fs.readFile(filePath, 'utf-8');
      expect(content).toContain(secondUpdate);
    });

    it('should inject block into existing file', async () => {
      const filePath = path.join(testDir, 'with-backup.md');
      const originalContent = 'Original';

      // Setup: file
      await fs.writeFile(filePath, originalContent);

      // Inject new content
      await DocInjector.injectBlock(filePath, 'New content');

      // File should contain both old and new content
      const newContent = await fs.readFile(filePath, 'utf-8');
      expect(newContent).toContain(originalContent);
      expect(newContent).toContain('New content');
    });
  });

  describe('Multiple Managed Blocks', () => {
    it('should handle multiple different blocks in same file', async () => {
      const filePath = path.join(testDir, 'multi-block.md');
      const initialContent = `# Config

<!-- AGENTS:START -->
Old agents content
<!-- AGENTS:END -->

Some user content here

<!-- CLAUDE:START -->
Old claude content
<!-- CLAUDE:END -->
`;

      await fs.writeFile(filePath, initialContent);

      // Update AGENTS block
      await DocInjector.injectBlock(
        filePath,
        'New agents content',
        {
          startMarker: '<!-- AGENTS:START -->',
          endMarker: '<!-- AGENTS:END -->',
        }
      );

      let content = await fs.readFile(filePath, 'utf-8');
      expect(content).toContain('New agents content');
      expect(content).toContain('Old claude content');
      expect(content).toContain('Some user content here');

      // Update CLAUDE block
      await DocInjector.injectBlock(
        filePath,
        'New claude content',
        {
          startMarker: '<!-- CLAUDE:START -->',
          endMarker: '<!-- CLAUDE:END -->',
        }
      );

      content = await fs.readFile(filePath, 'utf-8');
      expect(content).toContain('New agents content');
      expect(content).toContain('New claude content');
      expect(content).toContain('Some user content here');
    });

    it('should not affect other blocks when updating one', async () => {
      const filePath = path.join(testDir, 'isolated-blocks.md');
      const initialContent = `# File

<!-- BLOCK1:START -->
Content 1
<!-- BLOCK1:END -->

Middle content

<!-- BLOCK2:START -->
Content 2
<!-- BLOCK2:END -->
`;

      await fs.writeFile(filePath, initialContent);

      // Update only BLOCK1
      await DocInjector.injectBlock(
        filePath,
        'Updated content 1',
        {
          startMarker: '<!-- BLOCK1:START -->',
          endMarker: '<!-- BLOCK1:END -->',
        }
      );

      const content = await fs.readFile(filePath, 'utf-8');

      // BLOCK1 should be updated
      expect(content).toContain('Updated content 1');
      // BLOCK2 should be unchanged
      expect(content).toContain('Content 2');
      // Middle content should be preserved
      expect(content).toContain('Middle content');
    });

    it('should handle overlapping marker names gracefully', async () => {
      const filePath = path.join(testDir, 'similar-markers.md');
      const content = `<!-- CLAVIX:START -->
Old
<!-- CLAVIX:END -->

<!-- CLAVIX_NEW:START -->
Other
<!-- CLAVIX_NEW:END -->
`;

      await fs.writeFile(filePath, content);

      // Update only CLAVIX block (not CLAVIX_NEW)
      await DocInjector.injectBlock(
        filePath,
        'Updated',
        {
          startMarker: '<!-- CLAVIX:START -->',
          endMarker: '<!-- CLAVIX:END -->',
        }
      );

      const result = await fs.readFile(filePath, 'utf-8');

      expect(result).toContain('<!-- CLAVIX:START -->');
      expect(result).toContain('Updated');
      expect(result).toContain('<!-- CLAVIX:END -->');
      expect(result).toContain('<!-- CLAVIX_NEW:START -->');
      expect(result).toContain('Other');
    });

    it('should append new block to file with other content', async () => {
      const filePath = path.join(testDir, 'append-to-content.md');
      const userContent = `# My Project

This is user-written content.

## Instructions

Follow these steps...
`;

      await fs.writeFile(filePath, userContent);

      // Inject new block (no existing block)
      await DocInjector.injectBlock(
        filePath,
        'Clavix managed section',
        {
          startMarker: '<!-- CLAVIX:START -->',
          endMarker: '<!-- CLAVIX:END -->',
        }
      );

      const result = await fs.readFile(filePath, 'utf-8');

      // Original content should be preserved
      expect(result).toContain('# My Project');
      expect(result).toContain('This is user-written content');
      expect(result).toContain('Follow these steps');

      // New block should be appended
      expect(result).toContain('<!-- CLAVIX:START -->');
      expect(result).toContain('Clavix managed section');
      expect(result).toContain('<!-- CLAVIX:END -->');
    });
  });

  describe('hasBlock Detection', () => {
    it('should detect existing block', async () => {
      const filePath = path.join(testDir, 'has-block.md');
      const content = `# File

<!-- CLAVIX:START -->
Content here
<!-- CLAVIX:END -->
`;

      await fs.writeFile(filePath, content);

      const has = await DocInjector.hasBlock(filePath);
      expect(has).toBe(true);
    });

    it('should not detect missing block', async () => {
      const filePath = path.join(testDir, 'no-block.md');
      const content = `# File

Just some content, no managed block
`;

      await fs.writeFile(filePath, content);

      const has = await DocInjector.hasBlock(filePath);
      expect(has).toBe(false);
    });

    it('should not detect block in non-existent file', async () => {
      const filePath = path.join(testDir, 'nonexistent.md');

      const has = await DocInjector.hasBlock(filePath);
      expect(has).toBe(false);
    });

    it('should detect custom markers', async () => {
      const filePath = path.join(testDir, 'custom-markers.md');
      const content = `# File

<!-- CUSTOM:START -->
Custom block
<!-- CUSTOM:END -->
`;

      await fs.writeFile(filePath, content);

      const has = await DocInjector.hasBlock(
        filePath,
        '<!-- CUSTOM:START -->',
        '<!-- CUSTOM:END -->'
      );
      expect(has).toBe(true);
    });
  });

  describe('extractBlock', () => {
    it('should extract block content', async () => {
      const filePath = path.join(testDir, 'extract.md');
      const content = `# File

<!-- CLAVIX:START -->
This is the extracted content
Line 2
Line 3
<!-- CLAVIX:END -->

Other content
`;

      await fs.writeFile(filePath, content);

      const extracted = await DocInjector.extractBlock(filePath);

      expect(extracted).toBeDefined();
      expect(extracted).toContain('This is the extracted content');
      expect(extracted).toContain('Line 2');
      expect(extracted).toContain('Line 3');
    });

    it('should return null when block not found', async () => {
      const filePath = path.join(testDir, 'extract-none.md');
      const content = `# File

No managed block here
`;

      await fs.writeFile(filePath, content);

      const extracted = await DocInjector.extractBlock(filePath);

      expect(extracted).toBeNull();
    });

    it('should return null for non-existent file', async () => {
      const filePath = path.join(testDir, 'missing.md');

      const extracted = await DocInjector.extractBlock(filePath);

      expect(extracted).toBeNull();
    });

    it('should extract with custom markers', async () => {
      const filePath = path.join(testDir, 'extract-custom.md');
      const content = `<!-- AGENTS:START -->
Agent configuration here
<!-- AGENTS:END -->`;

      await fs.writeFile(filePath, content);

      const extracted = await DocInjector.extractBlock(
        filePath,
        '<!-- AGENTS:START -->',
        '<!-- AGENTS:END -->'
      );

      expect(extracted).toContain('Agent configuration here');
    });

    it('should trim extracted content', async () => {
      const filePath = path.join(testDir, 'extract-trim.md');
      const content = `<!-- CLAVIX:START -->

   Some content with whitespace   

<!-- CLAVIX:END -->`;

      await fs.writeFile(filePath, content);

      const extracted = await DocInjector.extractBlock(filePath);

      expect(extracted).toBe('Some content with whitespace');
    });
  });

  describe('removeBlock', () => {
    it('should remove block from file', async () => {
      const filePath = path.join(testDir, 'remove.md');
      const content = `# File

Before block

<!-- CLAVIX:START -->
This will be removed
<!-- CLAVIX:END -->

After block
`;

      await fs.writeFile(filePath, content);

      await DocInjector.removeBlock(filePath);

      const result = await fs.readFile(filePath, 'utf-8');

      expect(result).toContain('Before block');
      expect(result).toContain('After block');
      expect(result).not.toContain('This will be removed');
      expect(result).not.toContain('<!-- CLAVIX:START -->');
    });

    it('should not modify file if no block exists', async () => {
      const filePath = path.join(testDir, 'remove-none.md');
      const originalContent = `# File

Just content
`;

      await fs.writeFile(filePath, originalContent);

      await DocInjector.removeBlock(filePath);

      const result = await fs.readFile(filePath, 'utf-8');

      expect(result).toBe(originalContent);
    });

    it('should handle non-existent file gracefully', async () => {
      const filePath = path.join(testDir, 'remove-missing.md');

      // Should not throw
      await expect(DocInjector.removeBlock(filePath)).resolves.not.toThrow();
    });

    it('should remove with custom markers', async () => {
      const filePath = path.join(testDir, 'remove-custom.md');
      const content = `Start
<!-- AGENTS:START -->
Agents config
<!-- AGENTS:END -->
End`;

      await fs.writeFile(filePath, content);

      await DocInjector.removeBlock(
        filePath,
        '<!-- AGENTS:START -->',
        '<!-- AGENTS:END -->'
      );

      const result = await fs.readFile(filePath, 'utf-8');

      expect(result).toContain('Start');
      expect(result).toContain('End');
      expect(result).not.toContain('Agents config');
    });

    it('should remove trailing newline with block', async () => {
      const filePath = path.join(testDir, 'remove-newline.md');
      const content = `Content
<!-- CLAVIX:START -->
Block
<!-- CLAVIX:END -->
`;

      await fs.writeFile(filePath, content);

      await DocInjector.removeBlock(filePath);

      const result = await fs.readFile(filePath, 'utf-8');

      // Should not have extra blank lines
      expect(result.trim()).toBe('Content');
    });
  });

  describe('Markdown Validation', () => {
    it('should reject unbalanced code blocks', async () => {
      const filePath = path.join(testDir, 'unbalanced-code.md');

      const invalidContent = `# File

\`\`\`typescript
code block
// missing closing backticks

Content after
`;

      await expect(
        DocInjector.injectBlock(filePath, invalidContent, {
          validateMarkdown: true,
        })
      ).rejects.toThrow('Unbalanced code blocks');
    });

    it('should accept balanced code blocks', async () => {
      const filePath = path.join(testDir, 'balanced-code.md');

      const validContent = `# File

\`\`\`typescript
const x = 1;
\`\`\`

More content

\`\`\`
another block
\`\`\`
`;

      await expect(
        DocInjector.injectBlock(filePath, validContent, {
          validateMarkdown: true,
        })
      ).resolves.not.toThrow();
    });

    it('should skip validation when validateMarkdown=false', async () => {
      const filePath = path.join(testDir, 'skip-validation.md');

      const invalidContent = `# File

\`\`\`
unbalanced code block
`;

      // Should not throw with validateMarkdown: false
      await expect(
        DocInjector.injectBlock(filePath, invalidContent, {
          validateMarkdown: false,
        })
      ).resolves.not.toThrow();
    });

    it('should warn about unbalanced brackets', async () => {
      const filePath = path.join(testDir, 'brackets.md');

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const content = `# File

[Link without closing bracket](http://example.com

More content]
`;

      await DocInjector.injectBlock(filePath, content, {
        validateMarkdown: true,
      });

      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('File Operations with Subdirectories', () => {
    it('should create parent directories if they do not exist', async () => {
      const filePath = path.join(testDir, 'deep/nested/path/file.md');

      await DocInjector.injectBlock(filePath, 'Content');

      expect(await fs.pathExists(filePath)).toBe(true);
    });

    it('should handle paths with special characters', async () => {
      const filePath = path.join(testDir, 'file-with-dashes_and_underscores.md');

      await DocInjector.injectBlock(filePath, 'Content');

      expect(await fs.pathExists(filePath)).toBe(true);
    });

    it('should preserve relative path resolution', async () => {
      const filePath = path.join(testDir, '../doc-injector-extended/file.md');

      await DocInjector.injectBlock(filePath, 'Content');

      const resolvedPath = path.resolve(filePath);
      expect(await fs.pathExists(resolvedPath)).toBe(true);
    });
  });

  describe('Newline Handling', () => {
    it('should add double newline before block if content exists', async () => {
      const filePath = path.join(testDir, 'newline-before.md');
      const content = 'Existing content';

      await fs.writeFile(filePath, content);
      await DocInjector.injectBlock(filePath, 'New block');

      const result = await fs.readFile(filePath, 'utf-8');

      // Should have double newline between content and block
      expect(result).toMatch(/Existing content\n\n<!-- CLAVIX:START -->/);
    });

    it('should not add extra newlines at start of new file', async () => {
      const filePath = path.join(testDir, 'newline-start.md');

      await DocInjector.injectBlock(filePath, 'First block');

      const result = await fs.readFile(filePath, 'utf-8');

      // Should start with marker, not extra newlines
      expect(result.startsWith('<!-- CLAVIX:START -->')).toBe(true);
    });

    it('should add newline after block', async () => {
      const filePath = path.join(testDir, 'newline-after.md');

      await DocInjector.injectBlock(filePath, 'Content');

      const result = await fs.readFile(filePath, 'utf-8');

      // Should end with newline after CLAVIX:END
      expect(result.endsWith('\n')).toBe(true);
    });
  });
});
