import { FileSystem } from '../../utils/file-system.js';
import { TemplateAssembler } from '../template-assembler.js';
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
    'copilot-instructions',
  ];

  /**
   * Generate .clavix/instructions/ folder with all reference files
   */
  static async generate(): Promise<void> {
    const staticInstructionsPath = path.join(__dirname, '../../templates/instructions');

    // Check if static template exists
    if (!(await FileSystem.exists(staticInstructionsPath))) {
      throw new Error(`.clavix/instructions static files not found at ${staticInstructionsPath}`);
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
   * This ensures generic integrations have access to complete workflow set.
   * v4.5: Uses TemplateAssembler to resolve {{INCLUDE:}} markers.
   */
  private static async copyCanonicalWorkflows(): Promise<void> {
    const canonicalPath = path.join(__dirname, '../../templates/slash-commands/_canonical');

    const workflowsTarget = path.join(this.TARGET_DIR, 'workflows');

    if (!(await FileSystem.exists(canonicalPath))) {
      throw new Error(`Canonical templates not found at ${canonicalPath}`);
    }

    // Create workflows directory
    await FileSystem.ensureDir(workflowsTarget);

    // Create TemplateAssembler for include resolution
    const templatesBasePath = path.join(__dirname, '../../templates');
    const assembler = new TemplateAssembler(templatesBasePath);

    // Copy all .md files from canonical, resolving includes
    const entries = await FileSystem.readdir(canonicalPath, { withFileTypes: true });
    const mdFiles = entries.filter((f) => f.isFile() && f.name.endsWith('.md'));

    for (const file of mdFiles) {
      const destPath = path.join(workflowsTarget, file.name);

      try {
        // v4.5: Use TemplateAssembler to resolve {{INCLUDE:}} markers
        const result = await assembler.assembleTemplate(file.name);
        await FileSystem.writeFileAtomic(destPath, result.content);
      } catch {
        // Fallback: copy without include resolution if assembly fails
        const srcPath = path.join(canonicalPath, file.name);
        const content = await FileSystem.readFile(srcPath);
        await FileSystem.writeFileAtomic(destPath, content);
      }
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
    return selectedIntegrations.some((integration) =>
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
