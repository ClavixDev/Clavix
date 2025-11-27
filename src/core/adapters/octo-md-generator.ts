import { FileSystem } from '../../utils/file-system.js';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Generator for Octofriend OCTO.md file
 * Provides workflow instructions optimized for Octofriend capabilities
 */
export class OctoMdGenerator {
  static readonly TARGET_FILE = 'OCTO.md';
  static readonly START_MARKER = '<!-- CLAVIX:START -->';
  static readonly END_MARKER = '<!-- CLAVIX:END -->';

  /**
   * Generate or update OCTO.md with Clavix workflows
   */
  static async generate(): Promise<void> {
    const templatePath = path.join(__dirname, '../../templates/agents/octo.md');

    // Check if template exists
    if (!(await FileSystem.exists(templatePath))) {
      throw new Error(`OCTO.md template not found at ${templatePath}`);
    }

    const template = await FileSystem.readFile(templatePath);

    // Inject into OCTO.md using managed blocks
    await this.injectManagedBlock(this.TARGET_FILE, template);
  }

  /**
   * Inject or update managed block in OCTO.md
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
   * Check if OCTO.md has Clavix block
   */
  static async hasClavixBlock(): Promise<boolean> {
    if (!(await FileSystem.exists(this.TARGET_FILE))) {
      return false;
    }

    const content = await FileSystem.readFile(this.TARGET_FILE);
    return content.includes(this.START_MARKER);
  }
}
