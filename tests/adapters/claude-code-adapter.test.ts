/**
 * Tests for ClaudeCodeAdapter - Claude Code specific adapter
 */

import fs from 'fs-extra';
import * as path from 'path';
import { ClaudeCodeAdapter } from '../../src/core/adapters/claude-code-adapter';
import { CommandTemplate, ManagedBlock } from '../../src/types/agent';
import { IntegrationError } from '../../src/types/errors';
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('ClaudeCodeAdapter', () => {
  let adapter: ClaudeCodeAdapter;
  const testDir = path.join(__dirname, '../fixtures/claude-code-adapter');
  let originalCwd: string;

  beforeEach(async () => {
    // Clean up and setup
    await fs.remove(testDir);
    await fs.ensureDir(testDir);

    originalCwd = process.cwd();
    process.chdir(testDir);

    adapter = new ClaudeCodeAdapter();
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    await fs.remove(testDir);
  });

  describe('adapter properties', () => {
    it('should have Claude Code specific properties', () => {
      expect(adapter.name).toBe('claude-code');
      expect(adapter.displayName).toBe('Claude Code');
      expect(adapter.directory).toBe('.claude/commands/clavix');
      expect(adapter.fileExtension).toBe('.md');
    });

    it('should have correct feature flags', () => {
      expect(adapter.features).toEqual({
        supportsSubdirectories: true,
        supportsFrontmatter: false,
      });
    });

    it('should implement getCommandPath', () => {
      const commandPath = adapter.getCommandPath();
      expect(commandPath).toBe('.claude/commands/clavix');
    });
  });

  describe('detectProject', () => {
    it('should detect when .claude directory exists', async () => {
      await fs.ensureDir('.claude');
      const detected = await adapter.detectProject();
      expect(detected).toBe(true);
    });

    it('should not detect when .claude directory does not exist', async () => {
      const detected = await adapter.detectProject();
      expect(detected).toBe(false);
    });

    it('should detect .claude file as directory', async () => {
      // Create .claude directory with files
      await fs.ensureDir('.claude/commands');
      await fs.writeFile('.claude/CLAUDE.md', '# Claude Config');

      const detected = await adapter.detectProject();
      expect(detected).toBe(true);
    });
  });

  describe('generateCommands', () => {
    it('should generate Claude Code command files', async () => {
      const templates: CommandTemplate[] = [
        {
          name: 'fast',
          description: 'Fast CLEAR improvements',
          content: '# Fast Mode\n\nQuick CLEAR analysis',
        },
        {
          name: 'deep',
          description: 'Deep CLEAR analysis',
          content: '# Deep Mode\n\nComprehensive analysis',
        },
      ];

      await adapter.generateCommands(templates);

      const commandPath = adapter.getCommandPath();
      const file1 = await fs.readFile(
        path.join(commandPath, 'fast.md'),
        'utf-8'
      );
      const file2 = await fs.readFile(
        path.join(commandPath, 'deep.md'),
        'utf-8'
      );

      expect(file1).toBe('# Fast Mode\n\nQuick CLEAR analysis');
      expect(file2).toBe('# Deep Mode\n\nComprehensive analysis');
    });

    it('should create subdirectory structure', async () => {
      const templates: CommandTemplate[] = [
        { name: 'prd', description: 'PRD generation', content: 'PRD content' },
      ];

      await adapter.generateCommands(templates);

      const commandPath = adapter.getCommandPath();
      const exists = await fs.pathExists(commandPath);
      expect(exists).toBe(true);

      // Check parent directories
      expect(await fs.pathExists('.claude')).toBe(true);
      expect(await fs.pathExists('.claude/commands')).toBe(true);
    });
  });

  describe('injectDocumentation', () => {
    describe('new file creation', () => {
      it('should create new file with managed block', async () => {
        const blocks: ManagedBlock[] = [
          {
            targetFile: 'CLAUDE.md',
            content: '## Clavix Integration\n\nClavix commands available',
            startMarker: '<!-- CLAVIX:START -->',
            endMarker: '<!-- CLAVIX:END -->',
          },
        ];

        await adapter.injectDocumentation(blocks);

        const content = await fs.readFile('CLAUDE.md', 'utf-8');
        expect(content).toContain('<!-- CLAVIX:START -->');
        expect(content).toContain('## Clavix Integration');
        expect(content).toContain('<!-- CLAVIX:END -->');
      });

      it('should create parent directory for new file', async () => {
        const blocks: ManagedBlock[] = [
          {
            targetFile: 'docs/integration/CLAUDE.md',
            content: 'Integration docs',
            startMarker: '<!-- START -->',
            endMarker: '<!-- END -->',
          },
        ];

        await adapter.injectDocumentation(blocks);

        expect(await fs.pathExists('docs/integration')).toBe(true);
        expect(await fs.pathExists('docs/integration/CLAUDE.md')).toBe(true);
      });
    });

    describe('existing file modification', () => {
      it('should append block to existing file without marker', async () => {
        await fs.writeFile('CLAUDE.md', '# Existing Content\n\nSome text');

        const blocks: ManagedBlock[] = [
          {
            targetFile: 'CLAUDE.md',
            content: 'New section',
            startMarker: '<!-- NEW:START -->',
            endMarker: '<!-- NEW:END -->',
          },
        ];

        await adapter.injectDocumentation(blocks);

        const content = await fs.readFile('CLAUDE.md', 'utf-8');
        expect(content).toContain('# Existing Content');
        expect(content).toContain('<!-- NEW:START -->');
        expect(content).toContain('New section');
        expect(content).toContain('<!-- NEW:END -->');
      });

      it('should replace existing block in file', async () => {
        const initialContent = `# Config

<!-- CLAVIX:START -->
Old Clavix content
<!-- CLAVIX:END -->

Other content`;

        await fs.writeFile('CLAUDE.md', initialContent);

        const blocks: ManagedBlock[] = [
          {
            targetFile: 'CLAUDE.md',
            content: 'Updated Clavix content',
            startMarker: '<!-- CLAVIX:START -->',
            endMarker: '<!-- CLAVIX:END -->',
          },
        ];

        await adapter.injectDocumentation(blocks);

        const content = await fs.readFile('CLAUDE.md', 'utf-8');
        expect(content).toContain('Updated Clavix content');
        expect(content).not.toContain('Old Clavix content');
        expect(content).toContain('Other content');
      });

      it('should preserve content outside managed blocks', async () => {
        const initialContent = `# Header

Content before

<!-- BLOCK:START -->
Old block
<!-- BLOCK:END -->

Content after`;

        await fs.writeFile('CLAUDE.md', initialContent);

        const blocks: ManagedBlock[] = [
          {
            targetFile: 'CLAUDE.md',
            content: 'New block',
            startMarker: '<!-- BLOCK:START -->',
            endMarker: '<!-- BLOCK:END -->',
          },
        ];

        await adapter.injectDocumentation(blocks);

        const content = await fs.readFile('CLAUDE.md', 'utf-8');
        expect(content).toContain('# Header');
        expect(content).toContain('Content before');
        expect(content).toContain('New block');
        expect(content).toContain('Content after');
        expect(content).not.toContain('Old block');
      });
    });

    describe('multiple blocks', () => {
      it('should inject multiple blocks into same file', async () => {
        const blocks: ManagedBlock[] = [
          {
            targetFile: 'CLAUDE.md',
            content: 'Block 1 content',
            startMarker: '<!-- BLOCK1:START -->',
            endMarker: '<!-- BLOCK1:END -->',
          },
          {
            targetFile: 'CLAUDE.md',
            content: 'Block 2 content',
            startMarker: '<!-- BLOCK2:START -->',
            endMarker: '<!-- BLOCK2:END -->',
          },
        ];

        await adapter.injectDocumentation(blocks);

        const content = await fs.readFile('CLAUDE.md', 'utf-8');
        expect(content).toContain('Block 1 content');
        expect(content).toContain('Block 2 content');
        expect(content).toContain('<!-- BLOCK1:START -->');
        expect(content).toContain('<!-- BLOCK2:START -->');
      });

      it('should inject blocks into different files', async () => {
        const blocks: ManagedBlock[] = [
          {
            targetFile: 'CLAUDE.md',
            content: 'Claude content',
            startMarker: '<!-- CLAUDE:START -->',
            endMarker: '<!-- CLAUDE:END -->',
          },
          {
            targetFile: 'README.md',
            content: 'Readme content',
            startMarker: '<!-- README:START -->',
            endMarker: '<!-- README:END -->',
          },
        ];

        await adapter.injectDocumentation(blocks);

        const claudeContent = await fs.readFile('CLAUDE.md', 'utf-8');
        const readmeContent = await fs.readFile('README.md', 'utf-8');

        expect(claudeContent).toContain('Claude content');
        expect(readmeContent).toContain('Readme content');
      });

      it('should update multiple existing blocks', async () => {
        const initialContent = `<!-- A:START -->
Old A
<!-- A:END -->

<!-- B:START -->
Old B
<!-- B:END -->`;

        await fs.writeFile('CLAUDE.md', initialContent);

        const blocks: ManagedBlock[] = [
          {
            targetFile: 'CLAUDE.md',
            content: 'New A',
            startMarker: '<!-- A:START -->',
            endMarker: '<!-- A:END -->',
          },
          {
            targetFile: 'CLAUDE.md',
            content: 'New B',
            startMarker: '<!-- B:START -->',
            endMarker: '<!-- B:END -->',
          },
        ];

        await adapter.injectDocumentation(blocks);

        const content = await fs.readFile('CLAUDE.md', 'utf-8');
        expect(content).toContain('New A');
        expect(content).toContain('New B');
        expect(content).not.toContain('Old A');
        expect(content).not.toContain('Old B');
      });
    });

    describe('edge cases', () => {
      it('should handle empty block content', async () => {
        const blocks: ManagedBlock[] = [
          {
            targetFile: 'CLAUDE.md',
            content: '',
            startMarker: '<!-- EMPTY:START -->',
            endMarker: '<!-- EMPTY:END -->',
          },
        ];

        await adapter.injectDocumentation(blocks);

        const content = await fs.readFile('CLAUDE.md', 'utf-8');
        expect(content).toContain('<!-- EMPTY:START -->');
        expect(content).toContain('<!-- EMPTY:END -->');
      });

      it('should handle markers with special regex characters', async () => {
        const blocks: ManagedBlock[] = [
          {
            targetFile: 'CLAUDE.md',
            content: 'Content',
            startMarker: '<!-- [SPECIAL] {START} -->',
            endMarker: '<!-- [SPECIAL] {END} -->',
          },
        ];

        await adapter.injectDocumentation(blocks);

        const content = await fs.readFile('CLAUDE.md', 'utf-8');
        expect(content).toContain('<!-- [SPECIAL] {START} -->');
        expect(content).toContain('<!-- [SPECIAL] {END} -->');
      });

      it('should handle multiline block content', async () => {
        const blocks: ManagedBlock[] = [
          {
            targetFile: 'CLAUDE.md',
            content: 'Line 1\nLine 2\nLine 3\n\nLine 5',
            startMarker: '<!-- START -->',
            endMarker: '<!-- END -->',
          },
        ];

        await adapter.injectDocumentation(blocks);

        const content = await fs.readFile('CLAUDE.md', 'utf-8');
        expect(content).toContain('Line 1\nLine 2\nLine 3\n\nLine 5');
      });

      it('should handle file with no trailing newline', async () => {
        await fs.writeFile('CLAUDE.md', 'No trailing newline');

        const blocks: ManagedBlock[] = [
          {
            targetFile: 'CLAUDE.md',
            content: 'New block',
            startMarker: '<!-- START -->',
            endMarker: '<!-- END -->',
          },
        ];

        await adapter.injectDocumentation(blocks);

        const content = await fs.readFile('CLAUDE.md', 'utf-8');
        expect(content).toContain('No trailing newline');
        expect(content).toContain('<!-- START -->');
      });

      it('should handle empty file', async () => {
        await fs.writeFile('CLAUDE.md', '');

        const blocks: ManagedBlock[] = [
          {
            targetFile: 'CLAUDE.md',
            content: 'First block',
            startMarker: '<!-- START -->',
            endMarker: '<!-- END -->',
          },
        ];

        await adapter.injectDocumentation(blocks);

        const content = await fs.readFile('CLAUDE.md', 'utf-8');
        expect(content).toContain('First block');
      });
    });

    describe('error handling', () => {
      it('should throw IntegrationError on write failure', async () => {
        // Create read-only file
        await fs.writeFile('CLAUDE.md', 'content');
        await fs.chmod('CLAUDE.md', 0o444);

        const blocks: ManagedBlock[] = [
          {
            targetFile: 'CLAUDE.md',
            content: 'New content',
            startMarker: '<!-- START -->',
            endMarker: '<!-- END -->',
          },
        ];

        try {
          await expect(adapter.injectDocumentation(blocks)).rejects.toThrow(
            IntegrationError
          );
        } finally {
          // Cleanup
          await fs.chmod('CLAUDE.md', 0o644);
        }
      });

      it('should provide helpful error message', async () => {
        await fs.writeFile('CLAUDE.md', 'content');
        await fs.chmod('CLAUDE.md', 0o444);

        const blocks: ManagedBlock[] = [
          {
            targetFile: 'CLAUDE.md',
            content: 'New',
            startMarker: '<!-- START -->',
            endMarker: '<!-- END -->',
          },
        ];

        try {
          await expect(adapter.injectDocumentation(blocks)).rejects.toThrow(
            /Failed to inject documentation/
          );
        } finally {
          await fs.chmod('CLAUDE.md', 0o644);
        }
      });
    });
  });

  describe('atomic file operations', () => {
    it('should use atomic writes for documentation injection', async () => {
      const blocks: ManagedBlock[] = [
        {
          targetFile: 'CLAUDE.md',
          content: 'Content',
          startMarker: '<!-- START -->',
          endMarker: '<!-- END -->',
        },
      ];

      await adapter.injectDocumentation(blocks);

      // Verify file exists and content is correct
      const content = await fs.readFile('CLAUDE.md', 'utf-8');
      expect(content).toContain('Content');
    });
  });
});
