import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { FileSystem } from '../../utils/file-system.js';
import { DocInjector } from '../doc-injector.js';
import { DataError } from '../../types/errors.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Generator for GitHub Copilot instructions file
 * Provides workflow instructions via .github/copilot-instructions.md
 */
export class CopilotInstructionsGenerator {
  static readonly TARGET_FILE = '.github/copilot-instructions.md';

  /**
   * Generate or update .github/copilot-instructions.md with Clavix workflows
   */
  static async generate(): Promise<void> {
    const templatePath = path.join(__dirname, '../../templates/agents/copilot-instructions.md');

    if (!(await FileSystem.exists(templatePath))) {
      throw new DataError(
        `Copilot instructions template not found at ${templatePath}`,
        "Check Clavix installation or run 'clavix update'"
      );
    }

    const template = await FileSystem.readFile(templatePath);

    // Ensure .github directory exists
    await FileSystem.ensureDir('.github');

    await DocInjector.injectBlock(this.TARGET_FILE, template, {
      createIfMissing: true,
      validateMarkdown: false,
    });
  }

  /**
   * Check if .github/copilot-instructions.md has Clavix block
   */
  static async hasClavixBlock(): Promise<boolean> {
    return DocInjector.hasBlock(this.TARGET_FILE);
  }
}
