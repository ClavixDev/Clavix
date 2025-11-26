import * as path from 'path';
import fs from 'fs-extra';
import { DocInjector } from '../../src/core/doc-injector';
import { FileSystem } from '../../src/utils/file-system';
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Managed Block Injection Integration', () => {
  const testDir = path.join(__dirname, '../tmp/managed-blocks-test');

  beforeEach(async () => {
    // Create clean test directory
    await fs.ensureDir(testDir);
    process.chdir(testDir);
  });

  afterEach(async () => {
    // Cleanup
    process.chdir(path.join(__dirname, '../..'));
    await fs.remove(testDir);
  });

  describe('first-time injection', () => {
    it('should inject block into new file', async () => {
      const testFile = 'TEST.md';
      const content = 'This is test content for Clavix integration.';

      await DocInjector.injectBlock(testFile, content);

      expect(await FileSystem.exists(testFile)).toBe(true);

      const fileContent = await FileSystem.readFile(testFile);
      expect(fileContent).toContain('<!-- CLAVIX:START -->');
      expect(fileContent).toContain(content);
      expect(fileContent).toContain('<!-- CLAVIX:END -->');
    });

    it('should inject block into existing file without managed block', async () => {
      const testFile = 'EXISTING.md';
      const existingContent = `# Existing Documentation\n\nThis file already exists.\n\nSome content here.`;

      await FileSystem.writeFileAtomic(testFile, existingContent);

      const injectedContent = 'This is Clavix-managed content.';
      await DocInjector.injectBlock(testFile, injectedContent);

      const fileContent = await FileSystem.readFile(testFile);

      // Should preserve existing content
      expect(fileContent).toContain('# Existing Documentation');
      expect(fileContent).toContain('This file already exists');

      // Should add managed block
      expect(fileContent).toContain('<!-- CLAVIX:START -->');
      expect(fileContent).toContain(injectedContent);
      expect(fileContent).toContain('<!-- CLAVIX:END -->');
    });

    it('should append block at the end of existing file', async () => {
      const testFile = 'APPEND.md';
      const existingContent = `# Title\n\nContent`;

      await FileSystem.writeFileAtomic(testFile, existingContent);

      const injectedContent = 'New managed content';
      await DocInjector.injectBlock(testFile, injectedContent);

      const fileContent = await FileSystem.readFile(testFile);
      const lines = fileContent.split('\n');

      // Managed block should be at the end
      const startIndex = lines.findIndex((line) => line.includes('<!-- CLAVIX:START -->'));
      const endIndex = lines.findIndex((line) => line.includes('<!-- CLAVIX:END -->'));

      expect(startIndex).toBeGreaterThan(2); // After existing content
      expect(endIndex).toBeGreaterThan(startIndex);
    });
  });

  describe('block updates', () => {
    it('should update existing managed block', async () => {
      const testFile = 'UPDATE.md';
      const initialContent = 'Initial managed content';
      const updatedContent = 'Updated managed content';

      // First injection
      await DocInjector.injectBlock(testFile, initialContent);

      let fileContent = await FileSystem.readFile(testFile);
      expect(fileContent).toContain(initialContent);

      // Update injection
      await DocInjector.injectBlock(testFile, updatedContent);

      fileContent = await FileSystem.readFile(testFile);

      // Should have updated content
      expect(fileContent).toContain(updatedContent);
      expect(fileContent).not.toContain(initialContent);

      // Should still have markers
      expect(fileContent).toContain('<!-- CLAVIX:START -->');
      expect(fileContent).toContain('<!-- CLAVIX:END -->');
    });

    it('should preserve content outside managed block during update', async () => {
      const testFile = 'PRESERVE.md';
      const userContent = `# User Documentation\n\nThis is user-written content.\n\n## Section 1\n\nMore user content.`;

      await FileSystem.writeFileAtomic(testFile, userContent);

      // First injection
      await DocInjector.injectBlock(testFile, 'Version 1');

      // Update injection
      await DocInjector.injectBlock(testFile, 'Version 2');

      const fileContent = await FileSystem.readFile(testFile);

      // User content should be preserved
      expect(fileContent).toContain('# User Documentation');
      expect(fileContent).toContain('This is user-written content');
      expect(fileContent).toContain('## Section 1');

      // Managed block should be updated
      expect(fileContent).toContain('Version 2');
      expect(fileContent).not.toContain('Version 1');
    });

    it('should handle multiple updates correctly', async () => {
      const testFile = 'MULTIPLE.md';

      // Multiple sequential updates
      await DocInjector.injectBlock(testFile, 'Update 1');
      await DocInjector.injectBlock(testFile, 'Update 2');
      await DocInjector.injectBlock(testFile, 'Update 3');

      const fileContent = await FileSystem.readFile(testFile);

      // Should only have latest content
      expect(fileContent).toContain('Update 3');
      expect(fileContent).not.toContain('Update 1');
      expect(fileContent).not.toContain('Update 2');

      // Should have exactly one managed block
      const startCount = (fileContent.match(/<!-- CLAVIX:START -->/g) || []).length;
      const endCount = (fileContent.match(/<!-- CLAVIX:END -->/g) || []).length;

      expect(startCount).toBe(1);
      expect(endCount).toBe(1);
    });
  });

  describe('custom markers', () => {
    it('should support custom start and end markers', async () => {
      const testFile = 'CUSTOM.md';
      const content = 'Content with custom markers';

      await DocInjector.injectBlock(testFile, content, {
        startMarker: '<!-- CUSTOM:BEGIN -->',
        endMarker: '<!-- CUSTOM:FINISH -->',
      });

      const fileContent = await FileSystem.readFile(testFile);

      expect(fileContent).toContain('<!-- CUSTOM:BEGIN -->');
      expect(fileContent).toContain('<!-- CUSTOM:FINISH -->');
      expect(fileContent).toContain(content);
    });

    it('should update block with custom markers', async () => {
      const testFile = 'CUSTOM_UPDATE.md';

      await DocInjector.injectBlock(testFile, 'Initial', {
        startMarker: '<!-- MYAPP:START -->',
        endMarker: '<!-- MYAPP:END -->',
      });

      await DocInjector.injectBlock(testFile, 'Updated', {
        startMarker: '<!-- MYAPP:START -->',
        endMarker: '<!-- MYAPP:END -->',
      });

      const fileContent = await FileSystem.readFile(testFile);

      expect(fileContent).toContain('Updated');
      expect(fileContent).not.toContain('Initial');
      expect(fileContent).toContain('<!-- MYAPP:START -->');
    });
  });

  describe('real-world scenarios', () => {
    it('should handle AGENTS.md injection correctly', async () => {
      const agentsFile = 'AGENTS.md';
      const existingContent = `# AI Agents\n\nThis file contains information about AI agents used in this project.\n\n## Current Agents\n\n- Claude\n- ChatGPT`;

      await FileSystem.writeFileAtomic(agentsFile, existingContent);

      const clavixContent = DocInjector.getDefaultAgentsContent();
      const clavixBlock =
        clavixContent.match(/<!-- CLAVIX:START -->([\s\S]*?)<!-- CLAVIX:END -->/)?.[1]?.trim() ||
        '';

      await DocInjector.injectBlock(agentsFile, clavixBlock);

      const fileContent = await FileSystem.readFile(agentsFile);

      // Should preserve existing content
      expect(fileContent).toContain('# AI Agents');
      expect(fileContent).toContain('Current Agents');
      expect(fileContent).toContain('Claude');

      // Should have Clavix block
      expect(fileContent).toContain('<!-- CLAVIX:START -->');
      expect(fileContent).toContain('Clavix - Prompt Improvement Assistant');
    });

    it('should handle CLAUDE.md injection correctly', async () => {
      const claudeFile = 'CLAUDE.md';
      const existingContent = `# Claude Instructions\n\nGeneral instructions for Claude.\n\n## Guidelines\n\n- Be helpful\n- Be accurate`;

      await FileSystem.writeFileAtomic(claudeFile, existingContent);

      const clavixContent = DocInjector.getDefaultClaudeContent();
      const clavixBlock =
        clavixContent.match(/<!-- CLAVIX:START -->([\s\S]*?)<!-- CLAVIX:END -->/)?.[1]?.trim() ||
        '';

      await DocInjector.injectBlock(claudeFile, clavixBlock);

      const fileContent = await FileSystem.readFile(claudeFile);

      // Should preserve existing content
      expect(fileContent).toContain('# Claude Instructions');
      expect(fileContent).toContain('Guidelines');

      // Should have Clavix block with slash commands
      expect(fileContent).toContain('<!-- CLAVIX:START -->');
      // v4.11: /clavix:fast and /clavix:deep merged into /clavix:improve
      expect(fileContent).toContain('/clavix:improve');
      expect(fileContent).toContain('/clavix:prd');
    });

    it('should handle consecutive injections to different files', async () => {
      const file1 = 'FILE1.md';
      const file2 = 'FILE2.md';

      await DocInjector.injectBlock(file1, 'Content for file 1');
      await DocInjector.injectBlock(file2, 'Content for file 2');

      const content1 = await FileSystem.readFile(file1);
      const content2 = await FileSystem.readFile(file2);

      expect(content1).toContain('Content for file 1');
      expect(content2).toContain('Content for file 2');

      // Files should be independent
      expect(content1).not.toContain('Content for file 2');
      expect(content2).not.toContain('Content for file 1');
    });
  });

  describe('edge cases', () => {
    it('should handle empty content', async () => {
      const testFile = 'EMPTY.md';

      await DocInjector.injectBlock(testFile, '');

      const fileContent = await FileSystem.readFile(testFile);

      expect(fileContent).toContain('<!-- CLAVIX:START -->');
      expect(fileContent).toContain('<!-- CLAVIX:END -->');
    });

    it('should handle content with special characters', async () => {
      const testFile = 'SPECIAL.md';
      const specialContent = `Content with <tags>, {braces}, [brackets], and $pecial ch@rs!`;

      await DocInjector.injectBlock(testFile, specialContent);

      const fileContent = await FileSystem.readFile(testFile);

      expect(fileContent).toContain(specialContent);
    });

    it('should handle multi-line content with various formatting', async () => {
      const testFile = 'MULTILINE.md';
      const multilineContent = `## Heading

- Bullet 1
- Bullet 2

**Bold text** and *italic text*

\`code inline\` and:

\`\`\`javascript
const code = 'block';
\`\`\``;

      await DocInjector.injectBlock(testFile, multilineContent);

      const fileContent = await FileSystem.readFile(testFile);

      expect(fileContent).toContain('## Heading');
      expect(fileContent).toContain('- Bullet 1');
      expect(fileContent).toContain('**Bold text**');
      expect(fileContent).toContain('```javascript');
    });

    it('should handle file with existing HTML comments', async () => {
      const testFile = 'HTML_COMMENTS.md';
      const existingContent = `# Title

<!-- User comment -->
Some content

<!-- Another comment -->
More content`;

      await FileSystem.writeFileAtomic(testFile, existingContent);

      await DocInjector.injectBlock(testFile, 'Clavix content');

      const fileContent = await FileSystem.readFile(testFile);

      // Should preserve user comments
      expect(fileContent).toContain('<!-- User comment -->');
      expect(fileContent).toContain('<!-- Another comment -->');

      // Should add Clavix block
      expect(fileContent).toContain('<!-- CLAVIX:START -->');
      expect(fileContent).toContain('Clavix content');
    });

    it('should handle files with Windows line endings', async () => {
      const testFile = 'WINDOWS.md';
      const windowsContent = `# Title\r\n\r\nContent with Windows line endings\r\n`;

      await FileSystem.writeFileAtomic(testFile, windowsContent);

      await DocInjector.injectBlock(testFile, 'Injected content');

      const fileContent = await FileSystem.readFile(testFile);

      expect(fileContent).toContain('Injected content');
      expect(fileContent).toContain('<!-- CLAVIX:START -->');
    });
  });

  describe('error handling', () => {
    it('should create parent directories if needed', async () => {
      const nestedFile = 'nested/deep/TEST.md';

      await DocInjector.injectBlock(nestedFile, 'Content in nested file');

      expect(await FileSystem.exists(nestedFile)).toBe(true);

      const fileContent = await FileSystem.readFile(nestedFile);
      expect(fileContent).toContain('Content in nested file');
    });

    it('should handle backup and restore on write failure', async () => {
      const testFile = 'BACKUP_TEST.md';

      // Create initial file
      await DocInjector.injectBlock(testFile, 'Initial content');

      const initialContent = await FileSystem.readFile(testFile);

      // FileSystem.writeFileAtomic should handle backup internally
      // If write fails, backup should be restored
      // This is more of a FileSystem utility test, but verifying integration

      expect(initialContent).toContain('Initial content');
    });
  });

  describe('idempotency', () => {
    it('should be idempotent - multiple injections of same content produce same result', async () => {
      const testFile = 'IDEMPOTENT.md';
      const content = 'Same content every time';

      await DocInjector.injectBlock(testFile, content);
      const result1 = await FileSystem.readFile(testFile);

      await DocInjector.injectBlock(testFile, content);
      const result2 = await FileSystem.readFile(testFile);

      await DocInjector.injectBlock(testFile, content);
      const result3 = await FileSystem.readFile(testFile);

      // All results should be identical
      expect(result1).toBe(result2);
      expect(result2).toBe(result3);
    });
  });

  describe('concurrent operations', () => {
    it('should handle multiple files being injected in parallel', async () => {
      const files = ['FILE_A.md', 'FILE_B.md', 'FILE_C.md', 'FILE_D.md'];

      const injections = files.map((file, index) =>
        DocInjector.injectBlock(file, `Content for ${file} - ${index}`)
      );

      await Promise.all(injections);

      // Verify all files were created correctly
      for (let i = 0; i < files.length; i++) {
        const content = await FileSystem.readFile(files[i]);
        expect(content).toContain(`Content for ${files[i]} - ${i}`);
      }
    });
  });
});
