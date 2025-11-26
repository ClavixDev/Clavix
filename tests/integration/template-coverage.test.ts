import fs from 'fs-extra';
import path from 'path';
import { describe, it, expect } from '@jest/globals';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Template Coverage - Integration', () => {
  const templatesDir = path.join(__dirname, '../../src/templates');

  describe('Canonical Templates', () => {
    const canonicalDir = path.join(templatesDir, 'slash-commands/_canonical');

    it('should have execute.md template', () => {
      const executePath = path.join(canonicalDir, 'execute.md');
      expect(fs.existsSync(executePath)).toBe(true);
    });

    // v4.7: prompts.md removed - CLI-only commands (clavix prompts list/clear)
    it('should NOT have prompts.md template (removed in v4.7)', () => {
      const promptsPath = path.join(canonicalDir, 'prompts.md');
      expect(fs.existsSync(promptsPath)).toBe(false);
    });

    it('execute.md should reference PromptManager and execute command', () => {
      const executePath = path.join(canonicalDir, 'execute.md');
      const content = fs.readFileSync(executePath, 'utf-8');

      expect(content).toContain('clavix execute');
      expect(content).toContain('--latest');
      expect(content).toContain('.clavix/outputs/prompts');
    });

    // v4.7: prompts.md removed - CLI commands now documented in execute.md
    it('execute.md should reference prompt CLI commands (v4.7)', () => {
      const executePath = path.join(canonicalDir, 'execute.md');
      const content = fs.readFileSync(executePath, 'utf-8');

      expect(content).toContain('clavix prompts list');
      expect(content).toContain('clavix prompts clear');
      expect(content).toContain('executed');
      expect(content).toContain('stale');
    });

    it('improve.md should reference prompt lifecycle features', () => {
      const fastPath = path.join(canonicalDir, 'improve.md');
      const content = fs.readFileSync(fastPath, 'utf-8');

      // v4.7: /clavix:prompts removed, now CLI-only (clavix prompts list/clear)
      expect(content).toContain('/clavix:execute');
      expect(content).toContain('clavix prompts list'); // CLI command, not slash command
      expect(content).toContain('.clavix/outputs/prompts');
    });

    it('improve.md should have explicit prompt saving instructions for agents (v2.8.1)', () => {
      const fastPath = path.join(canonicalDir, 'improve.md');
      const content = fs.readFileSync(fastPath, 'utf-8');

      // v4.11.1: Check for required saving checkpoint section (renamed for stronger enforcement)
      expect(content).toContain('SAVING CHECKPOINT (REQUIRED');

      // Check for step-by-step instructions
      expect(content).toContain('Step 1: Create Directory Structure');

      expect(content).toContain('Step 2: Generate Unique Prompt ID');
      // v4.11: Uses std-/comp- prefixes instead of fast-/deep-
      expect(content).toMatch(/std-YYYYMMDD|comp-YYYYMMDD|YYYYMMDD-HHMMSS/);

      expect(content).toContain('Step 3: Save Prompt File');
      expect(content).toContain('Write tool');

      expect(content).toContain('Step 4: Update Index File');
      expect(content).toContain('.index.json');

      // v4.11.1: Step 5 renamed to standalone VERIFICATION section for stronger enforcement
      expect(content).toContain('VERIFICATION (REQUIRED');

      // Check for file format specification
      expect(content).toContain('id:');
      // v4.11: Uses depthUsed instead of source
      expect(content).toMatch(/depthUsed:|source:/);
      expect(content).toContain('timestamp:');
      expect(content).toContain('executed: false');
      expect(content).toContain('originalPrompt:');

      // Check for troubleshooting
      expect(content).toMatch(/Issue:|Error:/);
      expect(content).toContain('Index file corrupted');
    });

    it('improve.md should reference prompt lifecycle features', () => {
      const deepPath = path.join(canonicalDir, 'improve.md');
      const content = fs.readFileSync(deepPath, 'utf-8');

      // v4.7: /clavix:prompts removed, now CLI-only (clavix prompts list/clear)
      expect(content).toContain('/clavix:execute');
      expect(content).toContain('clavix prompts list'); // CLI command, not slash command
      expect(content).toContain('.clavix/outputs/prompts');
    });

    // v4.11: Second duplicate test removed - improve.md test above covers both standard/comprehensive depth

    it('archive.md should mention prompt separation', () => {
      const archivePath = path.join(canonicalDir, 'archive.md');
      const content = fs.readFileSync(archivePath, 'utf-8');

      // v4.6: Removed outdated v2.7 version references
      expect(content).toContain('Prompts Are Separate');
      expect(content).toContain('clavix prompts');
    });
  });

  describe('Provider Templates - agents.md', () => {
    const agentsPath = path.join(templatesDir, 'agents/agents.md');

    it('should exist', () => {
      expect(fs.existsSync(agentsPath)).toBe(true);
    });

    it('should include execute command in table', () => {
      const content = fs.readFileSync(agentsPath, 'utf-8');

      expect(content).toContain('clavix execute');
      expect(content).toContain('--latest');
    });

    it('should include prompts list command in table', () => {
      const content = fs.readFileSync(agentsPath, 'utf-8');

      expect(content).toContain('clavix prompts list');
      expect(content).toContain('NEW');
      expect(content).toContain('EXECUTED');
      expect(content).toContain('STALE');
    });

    it('should include prompts clear command in table', () => {
      const content = fs.readFileSync(agentsPath, 'utf-8');

      expect(content).toContain('clavix prompts clear');
      expect(content).toContain('--executed');
      expect(content).toContain('--stale');
    });

    it('should clarify CLI auto-save vs slash command manual save (v2.8.1)', () => {
      const content = fs.readFileSync(agentsPath, 'utf-8');

      expect(content).toContain('CLI auto-saves');
      expect(content).toContain('agent must save manually per template instructions');
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
      expect(content).toContain('execute prompt');
      expect(content).toContain('implement saved prompt');
    });

    it('should include execute command in CLI reference', () => {
      const content = fs.readFileSync(octoPath, 'utf-8');

      expect(content).toContain('clavix execute');
      expect(content).toContain('clavix prompts list');
      expect(content).toContain('clavix prompts clear');
    });

    it('Workflow should mention model selection for prompts', () => {
      const content = fs.readFileSync(octoPath, 'utf-8');

      expect(content).toContain('Thinking models');
      // v4.11: Uses depth terminology
      expect(content).toContain('Standard depth');
    });

    it('should clarify CLI auto-save vs slash command manual save (v2.8.1)', () => {
      const content = fs.readFileSync(octoPath, 'utf-8');

      expect(content).toContain('CLI auto-saves prompts');
      expect(content).toContain('Slash commands require manual saving');
    });
  });

  describe('Provider Templates - warp.md', () => {
    const warpPath = path.join(templatesDir, 'agents/warp.md');

    it('should exist', () => {
      expect(fs.existsSync(warpPath)).toBe(true);
    });

    it('should include execute command', () => {
      const content = fs.readFileSync(warpPath, 'utf-8');

      expect(content).toContain('clavix execute');
      expect(content).toContain('--latest');
    });

    it('should include prompts commands', () => {
      const content = fs.readFileSync(warpPath, 'utf-8');

      expect(content).toContain('clavix prompts list');
      expect(content).toContain('clavix prompts clear');
    });

    it('should clarify CLI auto-save vs slash command manual save (v2.8.1)', () => {
      const content = fs.readFileSync(warpPath, 'utf-8');

      expect(content).toContain('CLI auto-saves');
      expect(content).toContain('slash commands need manual saving');
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
      expect(content).toContain('v2.7');
    });

    it('should document execute command with all flags', () => {
      const content = fs.readFileSync(copilotPath, 'utf-8');

      expect(content).toContain('clavix execute');
      expect(content).toContain('--latest');
      expect(content).toContain('--fast');
      expect(content).toContain('--deep');
      expect(content).toContain('--id');
    });

    it('should document prompts commands with flags', () => {
      const content = fs.readFileSync(copilotPath, 'utf-8');

      expect(content).toContain('clavix prompts list');
      expect(content).toContain('clavix prompts clear');
      expect(content).toContain('--executed');
      expect(content).toContain('--stale');
    });

    it('should document complete lifecycle workflow', () => {
      const content = fs.readFileSync(copilotPath, 'utf-8');

      expect(content).toContain('Prompt Lifecycle Workflow');
      expect(content).toContain('Optimize');
      expect(content).toContain('Review');
      expect(content).toContain('Execute');
      expect(content).toContain('Cleanup');
    });

    it('should clarify CLI auto-save vs slash command manual save (v2.8.1)', () => {
      const content = fs.readFileSync(copilotPath, 'utf-8');

      expect(content).toContain('CLI auto-saves');
      expect(content).toContain('slash commands require manual saving');
    });
  });

  describe('Cross-Template Consistency', () => {
    it('all provider templates should reference same execute command', () => {
      const providers = [
        'agents/agents.md',
        'agents/octo.md',
        'agents/warp.md',
        'agents/copilot-instructions.md',
      ];

      providers.forEach((provider) => {
        const content = fs.readFileSync(path.join(templatesDir, provider), 'utf-8');
        expect(content).toContain('clavix execute');
      });
    });

    it('all provider templates should reference same prompts list command', () => {
      const providers = [
        'agents/agents.md',
        'agents/octo.md',
        'agents/warp.md',
        'agents/copilot-instructions.md',
      ];

      providers.forEach((provider) => {
        const content = fs.readFileSync(path.join(templatesDir, provider), 'utf-8');
        expect(content).toContain('clavix prompts list');
      });
    });

    it('all provider templates should reference same prompts clear command', () => {
      const providers = [
        'agents/agents.md',
        'agents/octo.md',
        'agents/warp.md',
        'agents/copilot-instructions.md',
      ];

      providers.forEach((provider) => {
        const content = fs.readFileSync(path.join(templatesDir, provider), 'utf-8');
        expect(content).toContain('clavix prompts clear');
      });
    });

    it('canonical templates should use consistent storage paths', () => {
      // v4.7: prompts.md removed - 9 canonical templates now
      const canonicalTemplates = [
        'slash-commands/_canonical/improve.md',
        'slash-commands/_canonical/improve.md',
        'slash-commands/_canonical/execute.md',
      ];

      canonicalTemplates.forEach((template) => {
        const content = fs.readFileSync(path.join(templatesDir, template), 'utf-8');

        // Canonical templates must specify exact storage paths
        expect(content).toMatch(/\.clavix\/outputs\/prompts/);
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
      // v4.7: prompts.md removed - CLI-only commands now
      expect(fs.existsSync(path.join(canonicalDist, 'prompts.md'))).toBe(false);
      expect(fs.existsSync(path.join(canonicalDist, 'improve.md'))).toBe(true);
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
