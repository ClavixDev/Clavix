import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { FileSystem } from '../../utils/file-system.js';
import { DocInjector } from '../doc-injector.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Generator for Octofriend OCTO.md file
 * Provides workflow instructions optimized for Octofriend capabilities
 */
export class OctoMdGenerator {
  static readonly TARGET_FILE = 'OCTO.md';

  /**
   * Generate or update OCTO.md with Clavix workflows
   */
  static async generate(): Promise<void> {
    const templatePath = path.join(__dirname, '../../templates/agents/octo.md');

    if (!(await FileSystem.exists(templatePath))) {
      throw new Error(`OCTO.md template not found at ${templatePath}`);
    }

    const template = await FileSystem.readFile(templatePath);

    await DocInjector.injectBlock(this.TARGET_FILE, template, {
      createIfMissing: true,
      validateMarkdown: false,
    });
  }

  /**
   * Check if OCTO.md has Clavix block
   */
  static async hasClavixBlock(): Promise<boolean> {
    return DocInjector.hasBlock(this.TARGET_FILE);
  }
}
