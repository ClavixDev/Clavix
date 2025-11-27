import { FileSystem } from '../../utils/file-system.js';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Generator for universal AGENTS.md file
 * Provides workflow instructions for AI tools without slash command support
 */
export class AgentsMdGenerator {
  static readonly TARGET_FILE = 'AGENTS.md';
  static readonly START_MARKER = '<!-- CLAVIX:START -->';
  static readonly END_MARKER = '<!-- CLAVIX:END -->';

  /**
   * Generate or update AGENTS.md with Clavix workflows
   */
  static async generate(): Promise<void> {
    const templatePath = path.join(__dirname, '../../templates/agents/agents.md');

    // Check if template exists
    if (!(await FileSystem.exists(templatePath))) {
      throw new Error(`AGENTS.md template not found at ${templatePath}`);
    }

    const template = await FileSystem.readFile(templatePath);

    // Inject into AGENTS.md using managed blocks
    await this.injectManagedBlock(this.TARGET_FILE, template);
  }

  /**
   * Inject or update managed block in AGENTS.md
   */
  private static async injectManagedBlock(filePath: string, content: string): Promise<void> {
    let fileContent = '';

    // Read existing file or start with empty content
    if (await FileSystem.exists(filePath)) {
      fileContent = await FileSystem.readFile(filePath);
    }

    const blockRegex = new RegExp(
      `${this.escapeRegex(this.START_MARKER)}[\\s\\S]*?${this.escapeRegex(this.END_MARKER)}`,
      'g'
    );

    const wrappedContent = `${this.START_MARKER}\n${content}\n${this.END_MARKER}`;

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

    await FileSystem.writeFileAtomic(filePath, fileContent);
  }

  /**
   * Escape special regex characters
   */
  private static escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Check if AGENTS.md has Clavix block
   */
  static async hasClavixBlock(): Promise<boolean> {
    if (!(await FileSystem.exists(this.TARGET_FILE))) {
      return false;
    }

    const content = await FileSystem.readFile(this.TARGET_FILE);
    return content.includes(this.START_MARKER);
  }
}
