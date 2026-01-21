/**
 * Skill Template Loader
 *
 * Loads curated skill templates from src/templates/skills/ directory.
 * Skills are optimized versions of canonical slash commands,
 * condensed for the Agent Skills format (< 500 lines recommended).
 *
 * @since v6.2.0
 */

import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { CommandTemplate } from '../types/agent.js';
import { FileSystem } from './file-system.js';
import { TemplateAssembler } from '../core/template-assembler.js';
import { CommandTransformer } from '../core/command-transformer.js';
import { DataError } from '../types/errors.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Singleton assembler instance for caching
let skillAssemblerInstance: TemplateAssembler | null = null;

function getSkillAssembler(): TemplateAssembler {
  if (!skillAssemblerInstance) {
    const templatesDir = path.join(__dirname, '..', 'templates');
    skillAssemblerInstance = new TemplateAssembler(templatesDir);
  }
  return skillAssemblerInstance;
}

/**
 * Load skill templates from the skills directory
 * Skills are curated, condensed versions optimized for the Agent Skills format
 *
 * @returns Array of CommandTemplate objects ready for skill generation
 */
export async function loadSkillTemplates(): Promise<CommandTemplate[]> {
  const skillsDir = getSkillTemplatesDirectory();

  // Check if skills directory exists
  if (!(await FileSystem.exists(skillsDir))) {
    return [];
  }

  const files = await FileSystem.listFiles(skillsDir);
  if (files.length === 0) {
    return [];
  }

  // Skill templates are .md files
  const skillFiles = files.filter((file) => file.endsWith('.md'));
  const templates: CommandTemplate[] = [];
  const assembler = getSkillAssembler();

  for (const file of skillFiles) {
    const templatePath = path.join(skillsDir, file);
    let content = await FileSystem.readFile(templatePath);
    const name = file.slice(0, -3); // Remove .md extension

    // Extract description from frontmatter
    const description = extractDescription(content);

    // Process {{INCLUDE:}} markers if present
    if (assembler.hasIncludes(content)) {
      try {
        const result = await assembler.assembleFromContent(content);
        content = result.content;
      } catch (error) {
        throw new DataError(
          `Skill template assembly failed for ${file}: ${error}`,
          `Check that all {{INCLUDE:}} references exist in templates directory`
        );
      }
    }

    // Transform command references (skills use hyphen separator)
    content = CommandTransformer.transform(content, {
      commandFormat: { separator: '-' },
    });

    // Strip frontmatter for clean content
    const cleanContent = stripFrontmatter(content);

    templates.push({
      name,
      content: cleanContent,
      description,
    });
  }

  return templates;
}

/**
 * Get the skill templates directory path
 */
function getSkillTemplatesDirectory(): string {
  return path.join(__dirname, '..', 'templates', 'skills');
}

/**
 * Strip YAML frontmatter from markdown content
 */
function stripFrontmatter(content: string): string {
  const frontmatterRegex = /^---\r?\n[\s\S]*?\r?\n---\r?\n/;
  return content.replace(frontmatterRegex, '').trim();
}

/**
 * Extract description from frontmatter
 */
function extractDescription(content: string): string {
  const yamlMatch = content.match(/description:\s*(.+)/);
  if (yamlMatch) {
    return yamlMatch[1].trim().replace(/^['"]|['"]$/g, '');
  }
  return '';
}
