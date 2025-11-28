import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { FileSystem } from '../../utils/file-system.js';
import { DocInjector } from '../doc-injector.js';
import { DataError } from '../../types/errors.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Generator for Warp WARP.md file
 * Provides workflow instructions optimized for Warp users
 */
export class WarpMdGenerator {
  static readonly TARGET_FILE = 'WARP.md';

  /**
   * Generate or update WARP.md with Clavix workflows
   */
  static async generate(): Promise<void> {
    const templatePath = path.join(__dirname, '../../templates/agents/warp.md');

    if (!(await FileSystem.exists(templatePath))) {
      throw new DataError(
        `WARP.md template not found at ${templatePath}`,
        "Check Clavix installation or run 'clavix update'"
      );
    }

    const template = await FileSystem.readFile(templatePath);

    await DocInjector.injectBlock(this.TARGET_FILE, template, {
      createIfMissing: true,
      validateMarkdown: false,
    });
  }

  /**
   * Check if WARP.md has Clavix block
   */
  static async hasClavixBlock(): Promise<boolean> {
    return DocInjector.hasBlock(this.TARGET_FILE);
  }
}
