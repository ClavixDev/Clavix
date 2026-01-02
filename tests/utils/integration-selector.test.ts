/**
 * Integration Selector utility tests
 *
 * Tests for the interactive integration selection utility
 * used by init and config commands
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// Mock inquirer before importing the module
const mockPrompt = jest.fn();

jest.unstable_mockModule('inquirer', () => ({
  default: {
    prompt: mockPrompt,
    Separator: class Separator {
      type = 'separator';
      line: string;
      constructor(line: string = '') {
        this.line = line;
      }
    },
  },
}));

// Mock AgentManager
const mockGetAvailableIntegrations = jest.fn();

jest.unstable_mockModule('../../src/core/agent-manager.js', () => ({
  AgentManager: class MockAgentManager {
    getAvailableIntegrations = mockGetAvailableIntegrations;
  },
}));

// Import after mocking
const { selectIntegrations, ensureMandatoryIntegrations, MANDATORY_INTEGRATION } = await import(
  '../../src/utils/integration-selector.js'
);
const { AgentManager } = await import('../../src/core/agent-manager.js');

describe('Integration Selector', () => {
  let agentManager: InstanceType<typeof AgentManager>;

  beforeEach(() => {
    jest.clearAllMocks();
    agentManager = new AgentManager();
    mockGetAvailableIntegrations.mockReturnValue(['amp', 'claude-code', 'cursor', 'windsurf']);
  });

  describe('selectIntegrations', () => {
    describe('basic functionality', () => {
      it('should call inquirer.prompt with checkbox type', async () => {
        mockPrompt.mockResolvedValue({ selectedIntegrations: ['claude-code'] });

        await selectIntegrations(agentManager);

        expect(mockPrompt).toHaveBeenCalledTimes(1);
        const promptConfig = mockPrompt.mock.calls[0][0][0];
        expect(promptConfig.type).toBe('checkbox');
        expect(promptConfig.name).toBe('selectedIntegrations');
      });

      it('should display correct message', async () => {
        mockPrompt.mockResolvedValue({ selectedIntegrations: ['claude-code'] });

        await selectIntegrations(agentManager);

        const promptConfig = mockPrompt.mock.calls[0][0][0];
        expect(promptConfig.message).toBe('Which AI tools are you using?');
      });

      it('should return selected integrations', async () => {
        mockPrompt.mockResolvedValue({
          selectedIntegrations: ['claude-code', 'cursor'],
        });

        const result = await selectIntegrations(agentManager);

        expect(result).toEqual(['claude-code', 'cursor']);
      });

      it('should return single integration when only one selected', async () => {
        mockPrompt.mockResolvedValue({ selectedIntegrations: ['windsurf'] });

        const result = await selectIntegrations(agentManager);

        expect(result).toEqual(['windsurf']);
      });

      it('should return all selectable integrations when all selected', async () => {
        // Note: agents-md is no longer in the selection list (it's always enabled)
        const allSelectableIntegrations = [
          'amp',
          'augment',
          'claude-code',
          'codebuddy',
          'codex',
          'crush',
          'droid',
          'gemini',
          'llxprt',
          'opencode',
          'qwen',
          'cline',
          'cursor',
          'kilocode',
          'roocode',
          'windsurf',
          'copilot-instructions',
          'octo-md',
          'warp-md',
        ];
        mockPrompt.mockResolvedValue({ selectedIntegrations: allSelectableIntegrations });

        const result = await selectIntegrations(agentManager);

        expect(result).toEqual(allSelectableIntegrations);
        expect(result.length).toBe(19); // agents-md is mandatory, not in selection
      });
    });

    describe('preSelected behavior', () => {
      it('should not pre-check any items when preSelected is empty', async () => {
        mockPrompt.mockResolvedValue({ selectedIntegrations: ['claude-code'] });

        await selectIntegrations(agentManager, []);

        const promptConfig = mockPrompt.mock.calls[0][0][0];
        const choices = promptConfig.choices;

        // Filter out separators and check that none are pre-checked
        const nonSeparatorChoices = choices.filter(
          (c: any) => (c.type !== 'separator' && typeof c !== 'object') || !c.line
        );
        const checkedChoices = nonSeparatorChoices.filter((c: any) => c.checked === true);
        expect(checkedChoices.length).toBe(0);
      });

      it('should pre-check items that are in preSelected array', async () => {
        mockPrompt.mockResolvedValue({ selectedIntegrations: ['claude-code', 'cursor'] });

        await selectIntegrations(agentManager, ['claude-code', 'cursor']);

        const promptConfig = mockPrompt.mock.calls[0][0][0];
        const choices = promptConfig.choices;

        // Find the claude-code and cursor choices
        const claudeCodeChoice = choices.find((c: any) => c.value === 'claude-code');
        const cursorChoice = choices.find((c: any) => c.value === 'cursor');
        const ampChoice = choices.find((c: any) => c.value === 'amp');

        expect(claudeCodeChoice?.checked).toBe(true);
        expect(cursorChoice?.checked).toBe(true);
        expect(ampChoice?.checked).toBe(false);
      });

      it('should pre-check single integration', async () => {
        mockPrompt.mockResolvedValue({ selectedIntegrations: ['windsurf'] });

        await selectIntegrations(agentManager, ['windsurf']);

        const promptConfig = mockPrompt.mock.calls[0][0][0];
        const choices = promptConfig.choices;

        const windsurfChoice = choices.find((c: any) => c.value === 'windsurf');
        expect(windsurfChoice?.checked).toBe(true);
      });

      it('should handle preSelected values that do not exist in choices', async () => {
        mockPrompt.mockResolvedValue({ selectedIntegrations: ['claude-code'] });

        // 'nonexistent' is not a valid integration value
        await selectIntegrations(agentManager, ['nonexistent', 'claude-code']);

        const promptConfig = mockPrompt.mock.calls[0][0][0];
        const choices = promptConfig.choices;

        // claude-code should be checked
        const claudeCodeChoice = choices.find((c: any) => c.value === 'claude-code');
        expect(claudeCodeChoice?.checked).toBe(true);

        // nonexistent should not appear in choices
        const nonexistentChoice = choices.find((c: any) => c.value === 'nonexistent');
        expect(nonexistentChoice).toBeUndefined();
      });
    });

    describe('validation', () => {
      it('should have validation function that rejects empty selection', async () => {
        mockPrompt.mockResolvedValue({ selectedIntegrations: ['claude-code'] });

        await selectIntegrations(agentManager);

        const promptConfig = mockPrompt.mock.calls[0][0][0];
        const validate = promptConfig.validate;

        expect(validate).toBeDefined();
        expect(typeof validate).toBe('function');

        // Empty array should return error message
        const emptyResult = validate([]);
        expect(emptyResult).toBe('You must select at least one integration.');
      });

      it('should have validation function that accepts non-empty selection', async () => {
        mockPrompt.mockResolvedValue({ selectedIntegrations: ['claude-code'] });

        await selectIntegrations(agentManager);

        const promptConfig = mockPrompt.mock.calls[0][0][0];
        const validate = promptConfig.validate;

        // Single item should pass
        expect(validate(['claude-code'])).toBe(true);

        // Multiple items should pass
        expect(validate(['claude-code', 'cursor', 'windsurf'])).toBe(true);
      });

      it('should have validation function that accepts all integrations', async () => {
        mockPrompt.mockResolvedValue({ selectedIntegrations: ['claude-code'] });

        await selectIntegrations(agentManager);

        const promptConfig = mockPrompt.mock.calls[0][0][0];
        const validate = promptConfig.validate;

        // Many items should pass
        const manyItems = ['a', 'b', 'c', 'd', 'e'];
        expect(validate(manyItems)).toBe(true);
      });
    });

    describe('choices structure', () => {
      it('should include all 19 selectable integration options (agents-md is mandatory)', async () => {
        mockPrompt.mockResolvedValue({ selectedIntegrations: ['claude-code'] });

        await selectIntegrations(agentManager);

        const promptConfig = mockPrompt.mock.calls[0][0][0];
        const choices = promptConfig.choices;

        // Filter out separators to get actual choices
        const integrationChoices = choices.filter((c: any) => c.value !== undefined);

        // agents-md is no longer in selection (always enabled)
        // vibe integration was added in v5.10.0
        expect(integrationChoices.length).toBe(20);
      });

      it('should have CLI Tools category with correct integrations', async () => {
        mockPrompt.mockResolvedValue({ selectedIntegrations: ['claude-code'] });

        await selectIntegrations(agentManager);

        const promptConfig = mockPrompt.mock.calls[0][0][0];
        const choices = promptConfig.choices;

        const cliTools = [
          'amp',
          'augment',
          'claude-code',
          'codebuddy',
          'codex',
          'crush',
          'droid',
          'gemini',
          'llxprt',
          'opencode',
          'qwen',
          'vibe',
        ];

        cliTools.forEach((tool) => {
          const choice = choices.find((c: any) => c.value === tool);
          expect(choice).toBeDefined();
          expect(choice.name).toBeDefined();
        });
      });

      it('should have IDE Extensions category with correct integrations', async () => {
        mockPrompt.mockResolvedValue({ selectedIntegrations: ['claude-code'] });

        await selectIntegrations(agentManager);

        const promptConfig = mockPrompt.mock.calls[0][0][0];
        const choices = promptConfig.choices;

        const ideTools = ['cline', 'cursor', 'kilocode', 'roocode', 'windsurf'];

        ideTools.forEach((tool) => {
          const choice = choices.find((c: any) => c.value === tool);
          expect(choice).toBeDefined();
          expect(choice.name).toBeDefined();
        });
      });

      it('should have Optional Universal Adapters category with correct integrations', async () => {
        mockPrompt.mockResolvedValue({ selectedIntegrations: ['claude-code'] });

        await selectIntegrations(agentManager);

        const promptConfig = mockPrompt.mock.calls[0][0][0];
        const choices = promptConfig.choices;

        // agents-md is no longer in selection (always enabled)
        const optionalUniversalAdapters = ['copilot-instructions', 'octo-md', 'warp-md'];

        optionalUniversalAdapters.forEach((adapter) => {
          const choice = choices.find((c: any) => c.value === adapter);
          expect(choice).toBeDefined();
          expect(choice.name).toBeDefined();
        });

        // agents-md should NOT be in choices
        const agentsMdChoice = choices.find((c: any) => c.value === 'agents-md');
        expect(agentsMdChoice).toBeUndefined();
      });

      it('should include separators for category headers', async () => {
        mockPrompt.mockResolvedValue({ selectedIntegrations: ['claude-code'] });

        await selectIntegrations(agentManager);

        const promptConfig = mockPrompt.mock.calls[0][0][0];
        const choices = promptConfig.choices;

        // Count separators (they have line property from our mock Separator class)
        const separators = choices.filter(
          (c: any) => c.type === 'separator' || c.line !== undefined
        );

        // Should have at least 3 category separators + potentially empty separators
        expect(separators.length).toBeGreaterThanOrEqual(3);
      });

      it('should have correct display names for integrations', async () => {
        mockPrompt.mockResolvedValue({ selectedIntegrations: ['claude-code'] });

        await selectIntegrations(agentManager);

        const promptConfig = mockPrompt.mock.calls[0][0][0];
        const choices = promptConfig.choices;

        // Check specific display names
        const claudeCode = choices.find((c: any) => c.value === 'claude-code');
        expect(claudeCode?.name).toContain('Claude Code');
        expect(claudeCode?.name).toContain('.claude/commands/clavix/');

        const cursor = choices.find((c: any) => c.value === 'cursor');
        expect(cursor?.name).toContain('Cursor');
        expect(cursor?.name).toContain('.cursor/commands/');

        // agents-md is no longer in choices (always enabled)
        const copilot = choices.find((c: any) => c.value === 'copilot-instructions');
        expect(copilot?.name).toContain('GitHub Copilot');
        expect(copilot?.name).toContain('copilot-instructions.md');
      });
    });

    describe('edge cases', () => {
      it('should handle undefined preSelected (defaults to empty array)', async () => {
        mockPrompt.mockResolvedValue({ selectedIntegrations: ['claude-code'] });

        // Call without preSelected parameter
        await selectIntegrations(agentManager);

        const promptConfig = mockPrompt.mock.calls[0][0][0];
        const choices = promptConfig.choices;

        // All non-separator choices should not be checked
        const nonSeparatorChoices = choices.filter((c: any) => c.value !== undefined);
        const checkedChoices = nonSeparatorChoices.filter((c: any) => c.checked === true);
        expect(checkedChoices.length).toBe(0);
      });

      it('should work when user selects from multiple categories', async () => {
        const mixedSelection = ['amp', 'cursor', 'copilot-instructions'];
        mockPrompt.mockResolvedValue({ selectedIntegrations: mixedSelection });

        const result = await selectIntegrations(agentManager);

        expect(result).toEqual(mixedSelection);
      });

      it('should preserve order of user selection', async () => {
        const orderedSelection = ['windsurf', 'amp', 'claude-code'];
        mockPrompt.mockResolvedValue({ selectedIntegrations: orderedSelection });

        const result = await selectIntegrations(agentManager);

        expect(result).toEqual(orderedSelection);
      });
    });
  });

  describe('integration values', () => {
    it('should use lowercase, hyphenated values for all integrations', async () => {
      mockPrompt.mockResolvedValue({ selectedIntegrations: ['claude-code'] });

      await selectIntegrations(agentManager);

      const promptConfig = mockPrompt.mock.calls[0][0][0];
      const choices = promptConfig.choices;

      const integrationValues = choices
        .filter((c: any) => c.value !== undefined)
        .map((c: any) => c.value);

      integrationValues.forEach((value: string) => {
        // Should be lowercase
        expect(value).toBe(value.toLowerCase());
        // Should not contain spaces
        expect(value).not.toContain(' ');
        // Should only contain alphanumeric and hyphens
        expect(value).toMatch(/^[a-z0-9-]+$/);
      });
    });

    it('should have unique values for all integrations', async () => {
      mockPrompt.mockResolvedValue({ selectedIntegrations: ['claude-code'] });

      await selectIntegrations(agentManager);

      const promptConfig = mockPrompt.mock.calls[0][0][0];
      const choices = promptConfig.choices;

      const integrationValues = choices
        .filter((c: any) => c.value !== undefined)
        .map((c: any) => c.value);

      const uniqueValues = new Set(integrationValues);
      expect(uniqueValues.size).toBe(integrationValues.length);
    });
  });

  describe('MANDATORY_INTEGRATION constant', () => {
    it('should be defined as agents-md', () => {
      expect(MANDATORY_INTEGRATION).toBe('agents-md');
    });
  });

  describe('ensureMandatoryIntegrations', () => {
    it('should add agents-md when not present', () => {
      const integrations = ['claude-code', 'cursor'];
      const result = ensureMandatoryIntegrations(integrations);

      expect(result).toContain('agents-md');
      expect(result).toEqual(['agents-md', 'claude-code', 'cursor']);
    });

    it('should not duplicate agents-md when already present', () => {
      const integrations = ['agents-md', 'claude-code', 'cursor'];
      const result = ensureMandatoryIntegrations(integrations);

      expect(result).toEqual(['agents-md', 'claude-code', 'cursor']);
      // Should only appear once
      expect(result.filter((i) => i === 'agents-md').length).toBe(1);
    });

    it('should return array with agents-md first when adding', () => {
      const integrations = ['windsurf', 'cursor'];
      const result = ensureMandatoryIntegrations(integrations);

      expect(result[0]).toBe('agents-md');
      expect(result.length).toBe(3);
    });

    it('should handle empty array', () => {
      const result = ensureMandatoryIntegrations([]);

      expect(result).toEqual(['agents-md']);
      expect(result.length).toBe(1);
    });

    it('should handle array with only agents-md', () => {
      const result = ensureMandatoryIntegrations(['agents-md']);

      expect(result).toEqual(['agents-md']);
      expect(result.length).toBe(1);
    });

    it('should preserve original array order when adding agents-md', () => {
      const integrations = ['cursor', 'windsurf', 'claude-code'];
      const result = ensureMandatoryIntegrations(integrations);

      expect(result).toEqual(['agents-md', 'cursor', 'windsurf', 'claude-code']);
    });
  });
});
