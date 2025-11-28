import * as path from 'path';
import { BaseAdapter } from './base-adapter.js';
import { ManagedBlock } from '../../types/agent.js';
import { FileSystem } from '../../utils/file-system.js';
import { IntegrationError } from '../../types/errors.js';
import { escapeRegex } from '../../utils/string-utils.js';

/**
 * Claude Code agent adapter
 */
export class ClaudeCodeAdapter extends BaseAdapter {
  readonly name = 'claude-code';
  readonly displayName = 'Claude Code';
  readonly directory = '.claude/commands/clavix';
  readonly fileExtension = '.md';
  readonly features = {
    supportsSubdirectories: true,
    supportsFrontmatter: false,
  };

  /**
   * Detect if Claude Code is available in the project
   */
  async detectProject(): Promise<boolean> {
    // Check if .claude directory exists
    return await FileSystem.exists('.claude');
  }

  /**
   * Get command path for Claude Code
   */
  getCommandPath(): string {
    return this.directory;
  }

  /**
   * Determine if a file is a Clavix-generated command
   * For Claude Code: Any .md file in .claude/commands/clavix/ is ours
   */
  protected isClavixGeneratedCommand(filename: string): boolean {
    // Only remove .md files (our slash commands)
    // This is safe because we control the entire .claude/commands/clavix/ directory
    return filename.endsWith('.md');
  }

  // generateCommands is inherited from BaseAdapter

  /**
   * Inject documentation blocks into CLAUDE.md
   */
  async injectDocumentation(blocks: ManagedBlock[]): Promise<void> {
    try {
      for (const block of blocks) {
        await this.injectManagedBlock(
          block.targetFile,
          block.content,
          block.startMarker,
          block.endMarker
        );
      }
    } catch (error) {
      throw new IntegrationError(
        `Failed to inject documentation: ${error}`,
        'Ensure target files are writable'
      );
    }
  }

  /**
   * Inject or update a managed block in a file
   */
  private async injectManagedBlock(
    filePath: string,
    content: string,
    startMarker: string,
    endMarker: string
  ): Promise<void> {
    const fullPath = path.resolve(filePath);
    let fileContent = '';

    // Read existing file or create new
    if (await FileSystem.exists(fullPath)) {
      fileContent = await FileSystem.readFile(fullPath);
    } else {
      // Create parent directory if needed
      const dir = path.dirname(fullPath);
      await FileSystem.ensureDir(dir);
    }

    const blockRegex = new RegExp(
      `${escapeRegex(startMarker)}[\\s\\S]*?${escapeRegex(endMarker)}`,
      'g'
    );

    const wrappedContent = `${startMarker}\n${content}\n${endMarker}`;

    if (blockRegex.test(fileContent)) {
      // Replace existing block
      fileContent = fileContent.replace(blockRegex, wrappedContent);
    } else {
      // Append new block
      if (fileContent && !fileContent.endsWith('\n\n')) {
        fileContent += '\n\n';
      }
      fileContent += wrappedContent + '\n';
    }

    await FileSystem.writeFileAtomic(fullPath, fileContent);
  }
}
