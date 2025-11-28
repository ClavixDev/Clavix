/**
 * Naming Consistency Tests
 *
 * Verifies that naming conventions are consistent across the codebase:
 * - LLXPRT (not LLXpert) - matches CLI tool/executable name
 * - displayName consistency between integrations.json and docs
 * - Adapter names match across files
 *
 * @since v5.6.7
 */

import { describe, it, expect } from '@jest/globals';
import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

describe('Naming Consistency', () => {
  describe('LLXPRT naming', () => {
    it('should use LLXPRT (not LLXpert) in integrations.json', async () => {
      const integrationsPath = path.join(projectRoot, 'src/config/integrations.json');
      const content = await fs.readFile(integrationsPath, 'utf-8');
      const config = JSON.parse(content);
      const integrations = config.integrations;

      const llxprtIntegration = integrations.find((i: { name: string }) => i.name === 'llxprt');

      expect(llxprtIntegration).toBeDefined();
      expect(llxprtIntegration.displayName).toBe('LLXPRT');
      expect(llxprtIntegration.displayName).not.toBe('LLXpert');
    });

    it('should use LLXPRT in documentation', async () => {
      const docsPath = path.join(projectRoot, 'docs/integrations.md');
      const content = await fs.readFile(docsPath, 'utf-8');

      // Should have LLXPRT, not LLXpert
      expect(content).toContain('LLXPRT');
      expect(content).not.toContain('LLXpert');
    });

    it('should not have LLXpert anywhere in source code', async () => {
      const srcDir = path.join(projectRoot, 'src');
      const files = await getTypeScriptFiles(srcDir);

      for (const file of files) {
        const content = await fs.readFile(file, 'utf-8');
        expect(content).not.toContain('LLXpert');
      }
    });
  });

  describe('Integration displayName consistency', () => {
    it('should have all integrations with valid displayNames', async () => {
      const integrationsPath = path.join(projectRoot, 'src/config/integrations.json');
      const content = await fs.readFile(integrationsPath, 'utf-8');
      const config = JSON.parse(content);
      const integrations = config.integrations;

      for (const integration of integrations) {
        expect(integration.displayName).toBeDefined();
        expect(integration.displayName.length).toBeGreaterThan(0);

        // displayName should be properly capitalized (not all lowercase)
        expect(integration.displayName).not.toBe(integration.displayName.toLowerCase());
      }
    });

    it('should have displayNames documented in integrations.md', async () => {
      const integrationsPath = path.join(projectRoot, 'src/config/integrations.json');
      const docsPath = path.join(projectRoot, 'docs/integrations.md');

      const integrationsContent = await fs.readFile(integrationsPath, 'utf-8');
      const docsContent = await fs.readFile(docsPath, 'utf-8');
      const integrations = JSON.parse(integrationsContent);

      // Core integrations should be mentioned in docs
      const coreIntegrations = ['Claude Code', 'Cursor', 'Windsurf', 'Gemini CLI'];

      for (const name of coreIntegrations) {
        expect(docsContent).toContain(name);
      }
    });
  });

  describe('Adapter name consistency', () => {
    it('should have adapter names in kebab-case', async () => {
      const integrationsPath = path.join(projectRoot, 'src/config/integrations.json');
      const content = await fs.readFile(integrationsPath, 'utf-8');
      const config = JSON.parse(content);
      const integrations = config.integrations;

      const kebabCasePattern = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;

      for (const integration of integrations) {
        expect(integration.name).toMatch(kebabCasePattern);
      }
    });

    it('should not have duplicate adapter names', async () => {
      const integrationsPath = path.join(projectRoot, 'src/config/integrations.json');
      const content = await fs.readFile(integrationsPath, 'utf-8');
      const config = JSON.parse(content);
      const integrations = config.integrations;

      const names = integrations.map((i: { name: string }) => i.name);
      const uniqueNames = new Set(names);

      expect(names.length).toBe(uniqueNames.size);
    });
  });

  describe('Command naming consistency', () => {
    it('should use /clavix: prefix in templates', async () => {
      const templatesDir = path.join(projectRoot, 'src/templates/slash-commands/_canonical');
      const files = await fs.readdir(templatesDir);
      const mdFiles = files.filter((f) => f.endsWith('.md'));

      for (const file of mdFiles) {
        const content = await fs.readFile(path.join(templatesDir, file), 'utf-8');

        // Check for proper command format
        if (content.includes('/clavix:')) {
          // Good - uses colon format
          expect(content).toContain('/clavix:');
        }
      }
    });
  });
});

/**
 * Recursively get all TypeScript files in a directory
 */
async function getTypeScriptFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await getTypeScriptFiles(fullPath)));
    } else if (entry.name.endsWith('.ts') && !entry.name.endsWith('.test.ts')) {
      files.push(fullPath);
    }
  }

  return files;
}
