import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { describe, it, expect, beforeAll } from '@jest/globals';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../..');

/**
 * Review Command Tests (v5.10+)
 *
 * These tests verify that the /clavix:review command:
 * 1. Exists and follows the 10-section template architecture
 * 2. Has proper mode enforcement (analysis mode, not implementation)
 * 3. Includes all required components
 * 4. Has correct file-saving protocol for reviews
 * 5. Is properly documented in MANIFEST and commands.md
 */

describe('Review Command Consistency', () => {
  const templatesDir = path.join(ROOT_DIR, 'src/templates/slash-commands/_canonical');
  const componentsDir = path.join(ROOT_DIR, 'src/templates/slash-commands/_components');
  const docsDir = path.join(ROOT_DIR, 'docs');

  describe('Review Template (review.md)', () => {
    let reviewTemplate: string;

    beforeAll(async () => {
      reviewTemplate = await fs.readFile(path.join(templatesDir, 'review.md'), 'utf-8');
    });

    it('review.md exists', async () => {
      const exists = await fs.pathExists(path.join(templatesDir, 'review.md'));
      expect(exists).toBe(true);
    });

    it('review.md has correct frontmatter', () => {
      expect(reviewTemplate).toContain('name: "Clavix: Review PR"');
      expect(reviewTemplate).toContain('description:');
    });

    it('review.md has CLAVIX MODE section with analysis mode', () => {
      expect(reviewTemplate).toContain('CLAVIX MODE: PR Reviewer');
      expect(reviewTemplate).toContain('Mode: analysis');
    });

    it('review.md has mode boundaries that block implementation', () => {
      expect(reviewTemplate).toContain("I won't do");
      expect(reviewTemplate).toContain('Fix issues');
      expect(reviewTemplate).toMatch(/not modify|won't.*modify|BLOCKED/i);
    });

    it('review.md has Self-Correction Protocol with 6 mistake types', () => {
      expect(reviewTemplate).toContain('Self-Correction Protocol');
      expect(reviewTemplate).toContain('Skipping Diff Analysis');
      expect(reviewTemplate).toContain('Ignoring User Criteria');
      expect(reviewTemplate).toContain('Vague Feedback');
      expect(reviewTemplate).toContain('False Positives');
      expect(reviewTemplate).toContain('Missing Context');
      expect(reviewTemplate).toContain('Implementation Mode');
    });

    it('review.md has State Assertion block', () => {
      expect(reviewTemplate).toContain('State Assertion (REQUIRED)');
      expect(reviewTemplate).toContain('**CLAVIX MODE: PR Review**');
    });

    it('review.md has review criteria presets', () => {
      expect(reviewTemplate).toContain('Security');
      expect(reviewTemplate).toContain('Architecture');
      expect(reviewTemplate).toContain('Standards');
      expect(reviewTemplate).toContain('Performance');
      expect(reviewTemplate).toContain('All-Around');
    });

    it('review.md has severity level definitions', () => {
      expect(reviewTemplate).toContain('🔴');
      expect(reviewTemplate).toContain('Critical');
      expect(reviewTemplate).toContain('🟠');
      expect(reviewTemplate).toContain('Major');
      expect(reviewTemplate).toContain('🟡');
      expect(reviewTemplate).toContain('Minor');
    });

    it('review.md has file-saving protocol for reviews', () => {
      expect(reviewTemplate).toContain('.clavix/outputs/reviews');
      expect(reviewTemplate).toContain('review-YYYYMMDD-HHMMSS');
    });

    it('review.md has Agent Transparency section with component includes', () => {
      expect(reviewTemplate).toContain('Agent Transparency');
      expect(reviewTemplate).toContain('{{INCLUDE:agent-protocols/AGENT_MANUAL.md}}');
      expect(reviewTemplate).toContain('{{INCLUDE:references/review-criteria.md}}');
      expect(reviewTemplate).toContain('{{INCLUDE:sections/review-presets.md}}');
    });

    it('review.md has Workflow Navigation section', () => {
      expect(reviewTemplate).toContain('Workflow Navigation');
      expect(reviewTemplate).toContain('/clavix:verify');
    });

    it('review.md has Troubleshooting section', () => {
      expect(reviewTemplate).toContain('Troubleshooting');
      expect(reviewTemplate).toContain('Branch not found');
    });

    it('review.md differentiates from verify command', () => {
      expect(reviewTemplate).toMatch(/verify.*instead if|different.*verify/i);
    });
  });

  describe('Review Components', () => {
    it('review-criteria.md exists in references/', async () => {
      const exists = await fs.pathExists(path.join(componentsDir, 'references/review-criteria.md'));
      expect(exists).toBe(true);
    });

    it('review-presets.md exists in sections/', async () => {
      const exists = await fs.pathExists(path.join(componentsDir, 'sections/review-presets.md'));
      expect(exists).toBe(true);
    });

    it('review-examples.md exists in sections/', async () => {
      const exists = await fs.pathExists(path.join(componentsDir, 'sections/review-examples.md'));
      expect(exists).toBe(true);
    });

    it('review-criteria.md has security checks', async () => {
      const content = await fs.readFile(
        path.join(componentsDir, 'references/review-criteria.md'),
        'utf-8'
      );
      expect(content).toContain('Security');
      expect(content).toContain('Authentication');
      expect(content).toContain('SQL Injection');
      expect(content).toContain('XSS');
    });

    it('review-criteria.md has architecture checks', async () => {
      const content = await fs.readFile(
        path.join(componentsDir, 'references/review-criteria.md'),
        'utf-8'
      );
      expect(content).toContain('Architecture');
      expect(content).toContain('Separation of Concerns');
      expect(content).toContain('Single Responsibility');
    });

    it('review-presets.md has all preset definitions', async () => {
      const content = await fs.readFile(
        path.join(componentsDir, 'sections/review-presets.md'),
        'utf-8'
      );
      expect(content).toContain('Security Focus');
      expect(content).toContain('Architecture Focus');
      expect(content).toContain('Standards Focus');
      expect(content).toContain('Performance Focus');
      expect(content).toContain('All-Around Review');
    });

    it('review-examples.md has example outputs', async () => {
      const content = await fs.readFile(
        path.join(componentsDir, 'sections/review-examples.md'),
        'utf-8'
      );
      expect(content).toContain('PR Review Report');
      expect(content).toContain('Executive Summary');
      expect(content).toContain('Detailed Findings');
    });
  });

  describe('MANIFEST Registration', () => {
    it('MANIFEST.md includes review command', async () => {
      const manifest = await fs.readFile(path.join(componentsDir, 'MANIFEST.md'), 'utf-8');
      expect(manifest).toContain('/clavix:review');
      expect(manifest).toContain('review-criteria');
      expect(manifest).toContain('review-presets');
    });

    it('MANIFEST.md lists review components in references section', async () => {
      const manifest = await fs.readFile(path.join(componentsDir, 'MANIFEST.md'), 'utf-8');
      expect(manifest).toContain('review-criteria.md');
    });

    it('MANIFEST.md lists review components in sections', async () => {
      const manifest = await fs.readFile(path.join(componentsDir, 'MANIFEST.md'), 'utf-8');
      expect(manifest).toContain('review-presets.md');
      expect(manifest).toContain('review-examples.md');
    });
  });

  describe('CLI Reference Updates', () => {
    it('cli-reference.md includes reviews directory in file structure', async () => {
      const cliRef = await fs.readFile(
        path.join(componentsDir, 'agent-protocols/cli-reference.md'),
        'utf-8'
      );
      expect(cliRef).toContain('reviews/');
    });

    it('cli-reference.md includes save review workflow', async () => {
      const cliRef = await fs.readFile(
        path.join(componentsDir, 'agent-protocols/cli-reference.md'),
        'utf-8'
      );
      expect(cliRef).toContain('Save review');
      expect(cliRef).toContain('.clavix/outputs/reviews');
    });
  });

  describe('Documentation', () => {
    it('commands.md includes review command', async () => {
      const commandsDoc = await fs.readFile(path.join(docsDir, 'commands.md'), 'utf-8');
      expect(commandsDoc).toContain('/clavix:review');
    });

    it('commands.md has review in slash commands table', async () => {
      const commandsDoc = await fs.readFile(path.join(docsDir, 'commands.md'), 'utf-8');
      expect(commandsDoc).toContain('| `/clavix:review`');
      expect(commandsDoc).toContain('Criteria-driven PR review');
    });

    it('commands.md has full review command documentation section', async () => {
      const commandsDoc = await fs.readFile(path.join(docsDir, 'commands.md'), 'utf-8');
      expect(commandsDoc).toContain('## /clavix:review');
      expect(commandsDoc).toContain('Review Criteria Presets');
      expect(commandsDoc).toContain('Output Categories');
    });

    it('commands.md has review workflow in recommended workflows', async () => {
      const commandsDoc = await fs.readFile(path.join(docsDir, 'commands.md'), 'utf-8');
      expect(commandsDoc).toContain('For PR reviews');
    });

    it('commands.md shows 10 slash commands total', async () => {
      const commandsDoc = await fs.readFile(path.join(docsDir, 'commands.md'), 'utf-8');
      expect(commandsDoc).toContain('Slash Commands (10 total)');
    });
  });

  describe('Build Artifacts', () => {
    const distDir = path.join(ROOT_DIR, 'dist/templates');

    it('review.md exists in dist after build', async () => {
      const exists = await fs.pathExists(path.join(distDir, 'slash-commands/_canonical/review.md'));
      expect(exists).toBe(true);
    });

    it('review components exist in dist after build', async () => {
      const componentsDistDir = path.join(distDir, 'slash-commands/_components');

      expect(
        await fs.pathExists(path.join(componentsDistDir, 'references/review-criteria.md'))
      ).toBe(true);
      expect(await fs.pathExists(path.join(componentsDistDir, 'sections/review-presets.md'))).toBe(
        true
      );
      expect(await fs.pathExists(path.join(componentsDistDir, 'sections/review-examples.md'))).toBe(
        true
      );
    });
  });
});
