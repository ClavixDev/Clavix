import fs from 'fs-extra';
import path from 'path';
import { describe, it, expect } from '@jest/globals';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Template Coverage - v2.7.0 Integration', () => {
  const templatesDir = path.join(__dirname, '../../src/templates');

  describe('Canonical Templates', () => {
    const canonicalDir = path.join(templatesDir, 'slash-commands/_canonical');

    it('should have execute.md template', () => {
      const executePath = path.join(canonicalDir, 'execute.md');
      expect(fs.existsSync(executePath)).toBe(true);
    });

    it('should have prompts.md template', () => {
      const promptsPath = path.join(canonicalDir, 'prompts.md');
      expect(fs.existsSync(promptsPath)).toBe(true);
    });

    it('execute.md should reference PromptManager and execute command', () => {
      const executePath = path.join(canonicalDir, 'execute.md');
      const content = fs.readFileSync(executePath, 'utf-8');

      expect(content).toContain('clavix execute');
      expect(content).toContain('--latest');
      expect(content).toContain('.clavix/outputs/prompts');
    });

    it('prompts.md should reference prompt lifecycle commands', () => {
      const promptsPath = path.join(canonicalDir, 'prompts.md');
      const content = fs.readFileSync(promptsPath, 'utf-8');

      expect(content).toContain('clavix prompts list');
      expect(content).toContain('clavix prompts clear');
      expect(content).toContain('executed');
      expect(content).toContain('stale');
    });

    it('fast.md should reference v2.7 features', () => {
      const fastPath = path.join(canonicalDir, 'fast.md');
      const content = fs.readFileSync(fastPath, 'utf-8');

      expect(content).toContain('v2.7');
      expect(content).toContain('/clavix:execute');
      expect(content).toContain('/clavix:prompts');
      expect(content).toContain('.clavix/outputs/prompts/fast');
    });

    it('fast.md should have explicit prompt saving instructions for agents (v2.8.1)', () => {
      const fastPath = path.join(canonicalDir, 'fast.md');
      const content = fs.readFileSync(fastPath, 'utf-8');

      // Check for required saving section
      expect(content).toContain('Saving the Prompt (REQUIRED)');

      // Check for conditional logic
      expect(content).toContain('If user ran CLI command');
      expect(content).toContain('If you are executing this slash command');

      // Check for step-by-step instructions
      expect(content).toContain('Step 1: Create Directory Structure');
      expect(content).toContain('mkdir -p .clavix/outputs/prompts/fast');

      expect(content).toContain('Step 2: Generate Unique Prompt ID');
      expect(content).toContain('fast-YYYYMMDD-HHMMSS-<random>');

      expect(content).toContain('Step 3: Save Prompt File');
      expect(content).toContain('Use the Write tool');

      expect(content).toContain('Step 4: Update Index File');
      expect(content).toContain('.index.json');

      expect(content).toContain('Step 5: Verify Saving Succeeded');

      // Check for file format specification
      expect(content).toContain('id:');
      expect(content).toContain('source: fast');
      expect(content).toContain('timestamp:');
      expect(content).toContain('executed: false');
      expect(content).toContain('originalPrompt:');

      // Check for troubleshooting
      expect(content).toContain('Issue: Prompt Not Saved');
      expect(content).toContain('Error: Cannot create directory');
      expect(content).toContain('Error: Index file corrupted');
      expect(content).toContain('Error: Duplicate prompt ID');
    });

    it('deep.md should reference v2.7 features', () => {
      const deepPath = path.join(canonicalDir, 'deep.md');
      const content = fs.readFileSync(deepPath, 'utf-8');

      expect(content).toContain('v2.7');
      expect(content).toContain('/clavix:execute');
      expect(content).toContain('/clavix:prompts');
      expect(content).toContain('.clavix/outputs/prompts/deep');
    });

    it('deep.md should have explicit prompt saving instructions for agents (v2.8.1)', () => {
      const deepPath = path.join(canonicalDir, 'deep.md');
      const content = fs.readFileSync(deepPath, 'utf-8');

      // Check for required saving section
      expect(content).toContain('Saving the Prompt (REQUIRED)');

      // Check for conditional logic
      expect(content).toContain('If user ran CLI command');
      expect(content).toContain('If you are executing this slash command');

      // Check for step-by-step instructions
      expect(content).toContain('Step 1: Create Directory Structure');
      expect(content).toContain('mkdir -p .clavix/outputs/prompts/deep');

      expect(content).toContain('Step 2: Generate Unique Prompt ID');
      expect(content).toContain('deep-YYYYMMDD-HHMMSS-<random>');

      expect(content).toContain('Step 3: Save Prompt File');
      expect(content).toContain('Use the Write tool');

      expect(content).toContain('Step 4: Update Index File');
      expect(content).toContain('.index.json');

      expect(content).toContain('Step 5: Verify Saving Succeeded');

      // Check for file format specification (deep includes A & R scores)
      expect(content).toContain('id:');
      expect(content).toContain('source: deep');
      expect(content).toContain('timestamp:');
      expect(content).toContain('executed: false');
      expect(content).toContain('originalPrompt:');
      expect(content).toContain('A** (Adaptiveness)');
      expect(content).toContain('R** (Reflectiveness)');
      expect(content).toContain('Alternative Variations');
      expect(content).toContain('Reflection Checklist');

      // Check for troubleshooting
      expect(content).toContain('Issue: Prompt Not Saved');
      expect(content).toContain('Error: Cannot create directory');
      expect(content).toContain('Error: Index file corrupted');
      expect(content).toContain('Error: Duplicate prompt ID');
    });

    it('archive.md should mention prompt separation', () => {
      const archivePath = path.join(canonicalDir, 'archive.md');
      const content = fs.readFileSync(archivePath, 'utf-8');

      expect(content).toContain('v2.7');
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

      expect(content).toContain('thinking models');
      expect(content).toContain('fast models');
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
        'agents/copilot-instructions.md'
      ];

      providers.forEach(provider => {
        const content = fs.readFileSync(path.join(templatesDir, provider), 'utf-8');
        expect(content).toContain('clavix execute');
      });
    });

    it('all provider templates should reference same prompts list command', () => {
      const providers = [
        'agents/agents.md',
        'agents/octo.md',
        'agents/warp.md',
        'agents/copilot-instructions.md'
      ];

      providers.forEach(provider => {
        const content = fs.readFileSync(path.join(templatesDir, provider), 'utf-8');
        expect(content).toContain('clavix prompts list');
      });
    });

    it('all provider templates should reference same prompts clear command', () => {
      const providers = [
        'agents/agents.md',
        'agents/octo.md',
        'agents/warp.md',
        'agents/copilot-instructions.md'
      ];

      providers.forEach(provider => {
        const content = fs.readFileSync(path.join(templatesDir, provider), 'utf-8');
        expect(content).toContain('clavix prompts clear');
      });
    });

    it('canonical templates should use consistent storage paths', () => {
      const canonicalTemplates = [
        'slash-commands/_canonical/fast.md',
        'slash-commands/_canonical/deep.md',
        'slash-commands/_canonical/execute.md',
        'slash-commands/_canonical/prompts.md'
      ];

      canonicalTemplates.forEach(template => {
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
      expect(fs.existsSync(path.join(canonicalDist, 'prompts.md'))).toBe(true);
      expect(fs.existsSync(path.join(canonicalDist, 'fast.md'))).toBe(true);
      expect(fs.existsSync(path.join(canonicalDist, 'deep.md'))).toBe(true);
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
