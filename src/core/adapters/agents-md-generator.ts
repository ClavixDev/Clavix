import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { FileSystem } from '../../utils/file-system.js';
import { DocInjector } from '../doc-injector.js';
import { DataError } from '../../types/errors.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Generator for universal AGENTS.md file
 * Provides workflow instructions for AI tools without slash command support
 */
export class AgentsMdGenerator {
  static readonly TARGET_FILE = 'AGENTS.md';

  /**
   * Generate or update AGENTS.md with Clavix workflows
   */
  static async generate(): Promise<void> {
    const templatePath = path.join(__dirname, '../../templates/agents/agents.md');

    if (!(await FileSystem.exists(templatePath))) {
      throw new DataError(
        `AGENTS.md template not found at ${templatePath}`,
        "Check Clavix installation or run 'clavix update'"
      );
    }

    const template = await FileSystem.readFile(templatePath);

    await DocInjector.injectBlock(this.TARGET_FILE, template, {
      createIfMissing: true,
      validateMarkdown: false, // Template is pre-validated
    });
  }

  /**
   * Check if AGENTS.md has Clavix block
   */
  static async hasClavixBlock(): Promise<boolean> {
    return DocInjector.hasBlock(this.TARGET_FILE);
  }
}
