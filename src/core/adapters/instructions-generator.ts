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
    const staticInstructionsPath = path.join(
      __dirname,
      '../../templates/instructions'
    );

    // Check if static template exists
    if (!(await FileSystem.exists(staticInstructionsPath))) {
      throw new Error(
        `.clavix/instructions static files not found at ${staticInstructionsPath}`
      );
    }

    // Create target directory
    await FileSystem.ensureDir(this.TARGET_DIR);

    // Step 1: Copy static instruction files (core/, troubleshooting/, README.md)
    // Note: This skips workflows/ directory if it exists
    await this.copyStaticInstructions(staticInstructionsPath, this.TARGET_DIR);

    // Step 2: Copy ALL canonical workflows → .clavix/instructions/workflows/
    await this.copyCanonicalWorkflows();
  }

  /**
   * Copy static instruction files (core/, troubleshooting/, README.md)
   * Excludes workflows/ directory - that comes from canonical templates
   */
  private static async copyStaticInstructions(src: string, dest: string): Promise<void> {
    const entries = await FileSystem.readdir(src, { withFileTypes: true });

    for (const entry of entries) {
      // Skip workflows/ directory - it will be populated from canonical
      if (entry.isDirectory() && entry.name === 'workflows') {
        continue;
      }

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
   * Copy ALL canonical templates to .clavix/instructions/workflows/
   * This ensures generic integrations have access to complete workflow set
   */
  private static async copyCanonicalWorkflows(): Promise<void> {
    const canonicalPath = path.join(
      __dirname,
      '../../templates/slash-commands/_canonical'
    );

    const workflowsTarget = path.join(this.TARGET_DIR, 'workflows');

    if (!(await FileSystem.exists(canonicalPath))) {
      throw new Error(
        `Canonical templates not found at ${canonicalPath}`
      );
    }

    // Create workflows directory
    await FileSystem.ensureDir(workflowsTarget);

    // Copy all .md files from canonical
    const entries = await FileSystem.readdir(canonicalPath, { withFileTypes: true });
    const mdFiles = entries.filter(f => f.isFile() && f.name.endsWith('.md'));

    for (const file of mdFiles) {
      const srcPath = path.join(canonicalPath, file.name);
      const destPath = path.join(workflowsTarget, file.name);
      const content = await FileSystem.readFile(srcPath);
      await FileSystem.writeFileAtomic(destPath, content);
    }
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
