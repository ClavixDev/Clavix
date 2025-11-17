import fs from 'fs-extra';
import path from 'path';

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

    it('deep.md should reference v2.7 features', () => {
      const deepPath = path.join(canonicalDir, 'deep.md');
      const content = fs.readFileSync(deepPath, 'utf-8');

      expect(content).toContain('v2.7');
      expect(content).toContain('/clavix:execute');
      expect(content).toContain('/clavix:prompts');
      expect(content).toContain('.clavix/outputs/prompts/deep');
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

    it('should mention auto-save for fast/deep', () => {
      const content = fs.readFileSync(warpPath, 'utf-8');

      expect(content).toContain('.clavix/outputs/prompts/fast');
      expect(content).toContain('.clavix/outputs/prompts/deep');
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

    it('all templates should use consistent terminology for prompt lifecycle', () => {
      const allTemplates = [
        'slash-commands/_canonical/fast.md',
        'slash-commands/_canonical/deep.md',
        'slash-commands/_canonical/execute.md',
        'slash-commands/_canonical/prompts.md',
        'agents/agents.md',
        'agents/octo.md',
        'agents/warp.md',
        'agents/copilot-instructions.md'
      ];

      allTemplates.forEach(template => {
        const content = fs.readFileSync(path.join(templatesDir, template), 'utf-8');

        // Consistent storage path
        if (content.includes('prompts')) {
          expect(content).toMatch(/\.clavix\/outputs\/prompts/);
        }
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
