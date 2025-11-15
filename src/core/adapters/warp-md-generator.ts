import { FileSystem } from '../../utils/file-system';
import * as path from 'path';

/**
 * Generator for Warp WARP.md file
 * Provides workflow instructions optimized for Warp users
 */
export class WarpMdGenerator {
  static readonly TARGET_FILE = 'WARP.md';
  static readonly START_MARKER = '<!-- CLAVIX:START -->';
  static readonly END_MARKER = '<!-- CLAVIX:END -->';

  /**
   * Generate or update WARP.md with Clavix workflows
   */
  static async generate(): Promise<void> {
    const templatePath = path.join(
      __dirname,
      '../../templates/agents/warp.md'
    );

    if (!(await FileSystem.exists(templatePath))) {
      throw new Error(`WARP.md template not found at ${templatePath}`);
    }

    const template = await FileSystem.readFile(templatePath);

    await this.injectManagedBlock(this.TARGET_FILE, template);
  }

  private static async injectManagedBlock(
    filePath: string,
    content: string
  ): Promise<void> {
    let fileContent = '';

    if (await FileSystem.exists(filePath)) {
      fileContent = await FileSystem.readFile(filePath);
    }

    const blockRegex = new RegExp(
      `${this.escapeRegex(this.START_MARKER)}[\\s\\S]*?${this.escapeRegex(
        this.END_MARKER
      )}`,
      'g'
    );

    const wrappedContent = `${this.START_MARKER}\n${content}\n${this.END_MARKER}`;

    if (blockRegex.test(fileContent)) {
      fileContent = fileContent.replace(blockRegex, wrappedContent);
    } else {
      if (fileContent && !fileContent.endsWith('\n\n')) {
        fileContent += '\n\n';
      }
      fileContent += wrappedContent + '\n';
    }

    await FileSystem.writeFileAtomic(filePath, fileContent);
  }

  private static escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  static async hasClavixBlock(): Promise<boolean> {
    if (!(await FileSystem.exists(this.TARGET_FILE))) {
      return false;
    }

    const content = await FileSystem.readFile(this.TARGET_FILE);
    return content.includes(this.START_MARKER);
  }
}
