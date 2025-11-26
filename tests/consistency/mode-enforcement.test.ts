import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { describe, it, expect, beforeAll } from '@jest/globals';

// ESM module path resolution
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../..');

/**
 * Mode Enforcement Consistency Tests (v4.7)
 *
 * These tests verify that:
 * 1. Optimization templates (fast, deep) have strong "STOP" instructions
 * 2. No references to the removed /clavix:prompts slash command exist
 * 3. Agent connectors have consistent mode enforcement sections
 */

describe('Mode Enforcement Consistency', () => {
  const templatesDir = path.join(ROOT_DIR, 'src/templates/slash-commands/_canonical');
  const agentsDir = path.join(ROOT_DIR, 'src/templates/agents');

  describe('Optimization Mode Templates (fast.md, deep.md)', () => {
    let fastTemplate: string;
    let deepTemplate: string;

    beforeAll(async () => {
      fastTemplate = await fs.readFile(path.join(templatesDir, 'fast.md'), 'utf-8');
      deepTemplate = await fs.readFile(path.join(templatesDir, 'deep.md'), 'utf-8');
    });

    it('fast.md has STOP instruction at top', () => {
      // Should have the stop header near the beginning (within first 2000 chars)
      const topSection = fastTemplate.slice(0, 2000);
      expect(topSection).toContain('⛔ STOP');
      expect(topSection).toContain('OPTIMIZATION MODE');
      expect(topSection).toContain('NOT IMPLEMENTATION');
    });

    it('deep.md has STOP instruction at top', () => {
      const topSection = deepTemplate.slice(0, 2000);
      expect(topSection).toContain('⛔ STOP');
      expect(topSection).toContain('OPTIMIZATION MODE');
      expect(topSection).toContain('NOT IMPLEMENTATION');
    });

    it('fast.md has explicit "YOU MUST NOT" section', () => {
      expect(fastTemplate).toContain('YOU MUST NOT');
      expect(fastTemplate).toContain('Write any application code');
      expect(fastTemplate).toContain('Start implementing');
    });

    it('deep.md has explicit "YOU MUST NOT" section', () => {
      expect(deepTemplate).toContain('YOU MUST NOT');
      expect(deepTemplate).toContain('Write any application code');
      expect(deepTemplate).toContain('Start implementing');
    });

    it('fast.md tells agent to run /clavix:execute for implementation', () => {
      expect(fastTemplate).toContain('/clavix:execute');
      expect(fastTemplate).toContain('--latest');
    });

    it('deep.md tells agent to run /clavix:execute for implementation', () => {
      expect(deepTemplate).toContain('/clavix:execute');
      expect(deepTemplate).toContain('--latest');
    });

    it('fast.md has CLI verification block', () => {
      expect(fastTemplate).toContain('Agent Verification');
      expect(fastTemplate).toContain('clavix prompts list');
    });

    it('deep.md has CLI verification block', () => {
      expect(deepTemplate).toContain('Agent Verification');
      expect(deepTemplate).toContain('clavix prompts list');
    });

    it('fast.md has required response ending instruction', () => {
      expect(fastTemplate).toContain('Your response MUST end with');
      expect(fastTemplate).toContain('Prompt optimized and saved');
    });

    it('deep.md has required response ending instruction', () => {
      expect(deepTemplate).toContain('Your response MUST end with');
      expect(deepTemplate).toContain('analysis complete');
    });
  });

  describe('Removed /clavix:prompts References', () => {
    it('prompts.md no longer exists in _canonical/', async () => {
      const promptsPath = path.join(templatesDir, 'prompts.md');
      const exists = await fs.pathExists(promptsPath);
      expect(exists).toBe(false);
    });

    it('no templates reference /clavix:prompts as slash command', async () => {
      const templateFiles = await fs.readdir(templatesDir);
      const mdFiles = templateFiles.filter((f) => f.endsWith('.md'));

      for (const file of mdFiles) {
        const content = await fs.readFile(path.join(templatesDir, file), 'utf-8');
        // Should not reference /clavix:prompts (the removed slash command)
        expect(content).not.toContain('/clavix:prompts');
      }
    });

    it('CLI commands clavix prompts list/clear are still documented', async () => {
      const executeTemplate = await fs.readFile(path.join(templatesDir, 'execute.md'), 'utf-8');

      // CLI commands should still be documented
      expect(executeTemplate).toContain('clavix prompts list');
      expect(executeTemplate).toContain('clavix prompts clear');
    });
  });

  describe('Agent Connector Mode Enforcement', () => {
    const connectorFiles = ['octo.md', 'agents.md', 'copilot-instructions.md', 'warp.md'];

    it.each(connectorFiles)('%s has mode enforcement section', async (file) => {
      const filePath = path.join(agentsDir, file);
      if (await fs.pathExists(filePath)) {
        const content = await fs.readFile(filePath, 'utf-8');

        // Should have v4.7 mode enforcement
        expect(content).toContain('MODE ENFORCEMENT');
        expect(content).toContain('OPTIMIZATION workflows');
        expect(content).toContain('PLANNING workflows');
        expect(content).toContain('IMPLEMENTATION workflows');
      }
    });

    it.each(connectorFiles)('%s has STOP instruction for optimization mode', async (file) => {
      const filePath = path.join(agentsDir, file);
      if (await fs.pathExists(filePath)) {
        const content = await fs.readFile(filePath, 'utf-8');

        // Optimization workflows should mention STOP
        expect(content).toContain('STOP');
        expect(content).toContain('/clavix:execute');
      }
    });
  });

  describe('Navigation Consistency', () => {
    const workflowTemplates = [
      'fast.md',
      'deep.md',
      'execute.md',
      'prd.md',
      'plan.md',
      'implement.md',
      'start.md',
      'summarize.md',
      'archive.md',
    ];

    it.each(workflowTemplates)('%s does not list /clavix:prompts in navigation', async (file) => {
      const content = await fs.readFile(path.join(templatesDir, file), 'utf-8');

      // Navigation sections should not reference the removed command
      if (content.includes('Related commands') || content.includes('Workflow Navigation')) {
        expect(content).not.toContain('/clavix:prompts');
      }
    });
  });
});
