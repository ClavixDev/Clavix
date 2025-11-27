import fs from 'fs-extra';
import path from 'path';
import { describe, it, expect } from '@jest/globals';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Template Coverage Tests (v5 Agentic-First)
 *
 * These tests verify that templates exist and contain correct v5 patterns.
 * In v5, workflows are executed by AI agents reading templates, not CLI commands.
 */
describe('Template Coverage - Integration', () => {
  const templatesDir = path.join(__dirname, '../../src/templates');

  describe('Canonical Templates', () => {
    const canonicalDir = path.join(templatesDir, 'slash-commands/_canonical');

    it('should have execute.md template', () => {
      const executePath = path.join(canonicalDir, 'execute.md');
      expect(fs.existsSync(executePath)).toBe(true);
    });

    it('should NOT have prompts.md template (removed in v4.7)', () => {
      const promptsPath = path.join(canonicalDir, 'prompts.md');
      expect(fs.existsSync(promptsPath)).toBe(false);
    });

    it('execute.md should reference agentic-first patterns (v5)', () => {
      const executePath = path.join(canonicalDir, 'execute.md');
      const content = fs.readFileSync(executePath, 'utf-8');

      // v5: Uses Read/Glob tools, not CLI commands
      expect(content).toContain('.clavix/outputs/prompts');
      expect(content).toContain('latest prompt');
      // v5: References file operations, not clavix CLI
      expect(content).toMatch(/Read tool|Glob|list.*\.md/i);
    });

    it('execute.md should reference v5 prompt management (agentic-first)', () => {
      const executePath = path.join(canonicalDir, 'execute.md');
      const content = fs.readFileSync(executePath, 'utf-8');

      // v5: Prompt files with frontmatter, not .index.json
      expect(content).toContain('executed');
      expect(content).not.toContain('.index.json');
    });

    it('improve.md should reference prompt lifecycle features', () => {
      const fastPath = path.join(canonicalDir, 'improve.md');
      const content = fs.readFileSync(fastPath, 'utf-8');

      expect(content).toContain('/clavix:execute');
      expect(content).toContain('.clavix/outputs/prompts');
    });

    it('improve.md should have explicit prompt saving instructions for agents (v5)', () => {
      const fastPath = path.join(canonicalDir, 'improve.md');
      const content = fs.readFileSync(fastPath, 'utf-8');

      // v5: Check for required saving checkpoint section
      expect(content).toContain('SAVING CHECKPOINT (REQUIRED');

      // Check for step-by-step instructions
      expect(content).toContain('Step 1: Create Directory Structure');
      expect(content).toContain('Step 2: Generate Unique Prompt ID');
      expect(content).toMatch(/std-YYYYMMDD|comp-YYYYMMDD|YYYYMMDD-HHMMSS/);
      expect(content).toContain('Step 3: Save Prompt File');
      expect(content).toContain('Write tool');

      // v5: No Step 4 for .index.json - frontmatter is used instead
      // Verification section exists
      expect(content).toContain('VERIFICATION (REQUIRED');

      // Check for file format specification (frontmatter)
      expect(content).toContain('id:');
      expect(content).toMatch(/depthUsed:|source:/);
      expect(content).toContain('timestamp:');
      expect(content).toContain('executed: false');
      expect(content).toContain('originalPrompt:');
    });

    it('archive.md should mention prompt separation', () => {
      const archivePath = path.join(canonicalDir, 'archive.md');
      const content = fs.readFileSync(archivePath, 'utf-8');

      // v5: Prompts are separate from project archives
      expect(content).toContain('Prompts Are Separate');
    });
  });

  describe('Provider Templates - agents.md', () => {
    const agentsPath = path.join(templatesDir, 'agents/agents.md');

    it('should exist', () => {
      expect(fs.existsSync(agentsPath)).toBe(true);
    });

    it('should include slash command references (v5)', () => {
      const content = fs.readFileSync(agentsPath, 'utf-8');

      // v5: References slash commands and agent tools, not CLI
      expect(content).toContain('/clavix:');
    });

    it('should include mode enforcement section (v5)', () => {
      const content = fs.readFileSync(agentsPath, 'utf-8');

      expect(content).toContain('MODE ENFORCEMENT');
    });
  });

  describe('Provider Templates - octo.md', () => {
    const octoPath = path.join(templatesDir, 'agents/octo.md');

    it('should exist', () => {
      expect(fs.existsSync(octoPath)).toBe(true);
    });

    it('should have Prompt Execution Workflow section', () => {
      const content = fs.readFileSync(octoPath, 'utf-8');

      expect(content).toContain('Prompt Execution Workflow');
      expect(content).toMatch(/execute.*prompt|implement.*prompt/i);
    });

    it('Workflow should mention model selection for prompts', () => {
      const content = fs.readFileSync(octoPath, 'utf-8');

      expect(content).toContain('Thinking models');
      expect(content).toContain('Standard depth');
    });
  });

  describe('Provider Templates - warp.md', () => {
    const warpPath = path.join(templatesDir, 'agents/warp.md');

    it('should exist', () => {
      expect(fs.existsSync(warpPath)).toBe(true);
    });

    it('should include slash command references (v5)', () => {
      const content = fs.readFileSync(warpPath, 'utf-8');

      expect(content).toContain('/clavix:');
    });
  });

  describe('Provider Templates - copilot-instructions.md', () => {
    const copilotPath = path.join(templatesDir, 'agents/copilot-instructions.md');

    it('should exist', () => {
      expect(fs.existsSync(copilotPath)).toBe(true);
    });

    it('should have Prompt Lifecycle Management section', () => {
      const content = fs.readFileSync(copilotPath, 'utf-8');

      expect(content).toContain('Prompt Lifecycle Management');
    });

    it('should document complete lifecycle workflow', () => {
      const content = fs.readFileSync(copilotPath, 'utf-8');

      expect(content).toContain('Prompt Lifecycle Workflow');
      expect(content).toContain('Optimize');
      expect(content).toContain('Execute');
    });
  });

  describe('Cross-Template Consistency', () => {
    it('canonical templates should use consistent storage paths', () => {
      const canonicalTemplates = [
        'slash-commands/_canonical/improve.md',
        'slash-commands/_canonical/execute.md',
      ];

      canonicalTemplates.forEach((template) => {
        const content = fs.readFileSync(path.join(templatesDir, template), 'utf-8');

        // Canonical templates must specify exact storage paths
        expect(content).toMatch(/\.clavix\/outputs\/prompts/);
      });
    });

    it('no templates should reference .index.json (v5)', () => {
      const canonicalTemplates = [
        'slash-commands/_canonical/improve.md',
        'slash-commands/_canonical/execute.md',
      ];

      canonicalTemplates.forEach((template) => {
        const content = fs.readFileSync(path.join(templatesDir, template), 'utf-8');

        // v5: No .index.json references
        expect(content).not.toContain('.index.json');
      });
    });
  });

  describe('Build Artifacts', () => {
    const distDir = path.join(__dirname, '../../dist/templates');

    it('dist/templates should exist after build', () => {
      expect(fs.existsSync(distDir)).toBe(true);
    });

    it('dist should contain canonical templates', () => {
      const canonicalDist = path.join(distDir, 'slash-commands/_canonical');

      expect(fs.existsSync(path.join(canonicalDist, 'execute.md'))).toBe(true);
      expect(fs.existsSync(path.join(canonicalDist, 'prompts.md'))).toBe(false);
      expect(fs.existsSync(path.join(canonicalDist, 'improve.md'))).toBe(true);
    });

    it('dist should contain provider templates', () => {
      const agentsDist = path.join(distDir, 'agents');

      expect(fs.existsSync(path.join(agentsDist, 'agents.md'))).toBe(true);
      expect(fs.existsSync(path.join(agentsDist, 'octo.md'))).toBe(true);
      expect(fs.existsSync(path.join(agentsDist, 'warp.md'))).toBe(true);
      expect(fs.existsSync(path.join(agentsDist, 'copilot-instructions.md'))).toBe(true);
    });
  });
});
