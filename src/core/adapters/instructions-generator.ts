import { FileSystem } from '../../utils/file-system.js';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Generator for .clavix/instructions/ reference folder
 * Provides detailed workflow guides for generic integrations
 */
export class InstructionsGenerator {
  static readonly TARGET_DIR = '.clavix/instructions';

  /**
   * Generic integrations that need the instructions folder
   */
  static readonly GENERIC_INTEGRATIONS = [
    'octo-md',
    'warp-md',
    'agents-md',
    'copilot-instructions'
  ];

  /**
   * Generate .clavix/instructions/ folder with all reference files
   */
  static async generate(): Promise<void> {
    const templatePath = path.join(
      __dirname,
      '../../templates/instructions'
    );

    // Check if template exists
    if (!(await FileSystem.exists(templatePath))) {
      throw new Error(
        `.clavix/instructions template not found at ${templatePath}`
      );
    }

    // Create target directory
    await FileSystem.ensureDir(this.TARGET_DIR);

    // Copy all instruction files recursively
    await this.copyDirectory(templatePath, this.TARGET_DIR);
  }

  /**
   * Recursively copy directory contents
   */
  private static async copyDirectory(src: string, dest: string): Promise<void> {
    const entries = await FileSystem.readdir(src, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        await FileSystem.ensureDir(destPath);
        await this.copyDirectory(srcPath, destPath);
      } else {
        const content = await FileSystem.readFile(srcPath);
        await FileSystem.writeFileAtomic(destPath, content);
      }
    }
  }

  /**
   * Check if instructions folder exists
   */
  static async exists(): Promise<boolean> {
    return await FileSystem.exists(this.TARGET_DIR);
  }

  /**
   * Check if any generic integration is selected
   */
  static needsGeneration(selectedIntegrations: string[]): boolean {
    return selectedIntegrations.some(integration =>
      this.GENERIC_INTEGRATIONS.includes(integration)
    );
  }

  /**
   * Remove instructions folder
   */
  static async remove(): Promise<void> {
    if (await this.exists()) {
      await FileSystem.remove(this.TARGET_DIR);
    }
  }
}
