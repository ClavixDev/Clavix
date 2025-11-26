import { CommandTransformer } from '../../src/core/command-transformer.js';
import { describe, it, expect } from '@jest/globals';
import { IntegrationFeatures } from '../../src/types/agent.js';

describe('CommandTransformer', () => {
  describe('transform', () => {
    describe('colon format (default)', () => {
      it('should preserve content when using colon separator', () => {
        const content = 'Run `/clavix:improve` to optimize your prompt.';
        const features: IntegrationFeatures = { commandFormat: { separator: ':' } };

        const result = CommandTransformer.transform(content, features);

        expect(result).toBe(content);
      });

      it('should preserve content when features is undefined', () => {
        const content = 'Run `/clavix:improve` to optimize your prompt.';

        const result = CommandTransformer.transform(content);

        expect(result).toBe(content);
      });

      it('should preserve content when commandFormat is undefined', () => {
        const content = 'Run `/clavix:improve` to optimize your prompt.';
        const features: IntegrationFeatures = { supportsSubdirectories: true };

        const result = CommandTransformer.transform(content, features);

        expect(result).toBe(content);
      });
    });

    describe('hyphen format', () => {
      const hyphenFeatures: IntegrationFeatures = { commandFormat: { separator: '-' } };

      it('should transform colon to hyphen when configured', () => {
        const content = 'Run `/clavix:improve` to optimize your prompt.';

        const result = CommandTransformer.transform(content, hyphenFeatures);

        expect(result).toBe('Run `/clavix-improve` to optimize your prompt.');
      });

      it('should transform multiple commands', () => {
        const content = 'First run `/clavix:improve`, then `/clavix:execute --latest`.';

        const result = CommandTransformer.transform(content, hyphenFeatures);

        expect(result).toBe('First run `/clavix-improve`, then `/clavix-execute --latest`.');
      });

      it('should handle hyphenated command names', () => {
        const content = 'Complete task with `/clavix:task-complete`.';

        const result = CommandTransformer.transform(content, hyphenFeatures);

        expect(result).toBe('Complete task with `/clavix-task-complete`.');
      });

      it('should transform commands in markdown code blocks', () => {
        const content = '```\n/clavix:execute --latest\n```';

        const result = CommandTransformer.transform(content, hyphenFeatures);

        expect(result).toBe('```\n/clavix-execute --latest\n```');
      });

      it('should transform commands in inline code', () => {
        const content = 'Run `clavix fast` or use `/clavix:improve` slash command.';

        const result = CommandTransformer.transform(content, hyphenFeatures);

        expect(result).toBe('Run `clavix fast` or use `/clavix-improve` slash command.');
      });
    });

    describe('CLI commands preservation', () => {
      const hyphenFeatures: IntegrationFeatures = { commandFormat: { separator: '-' } };

      it('should NOT transform CLI commands (no leading slash)', () => {
        const content = 'Run `clavix prompts list` to see saved prompts.';

        const result = CommandTransformer.transform(content, hyphenFeatures);

        expect(result).toBe(content);
      });

      it('should NOT transform clavix CLI in bash blocks', () => {
        const content = '```bash\nclavix execute --latest\n```';

        const result = CommandTransformer.transform(content, hyphenFeatures);

        expect(result).toBe(content);
      });

      it('should distinguish CLI from slash commands', () => {
        const content = 'CLI: `clavix fast "prompt"` vs Slash: `/clavix:improve`';

        const result = CommandTransformer.transform(content, hyphenFeatures);

        expect(result).toBe('CLI: `clavix fast "prompt"` vs Slash: `/clavix-improve`');
      });
    });

    describe('edge cases', () => {
      const hyphenFeatures: IntegrationFeatures = { commandFormat: { separator: '-' } };

      it('should handle empty content', () => {
        const result = CommandTransformer.transform('', hyphenFeatures);
        expect(result).toBe('');
      });

      it('should handle content with no commands', () => {
        const content = 'This is plain text without any commands.';

        const result = CommandTransformer.transform(content, hyphenFeatures);

        expect(result).toBe(content);
      });

      it('should handle command at start of content', () => {
        const content = '/clavix:improve is the quick optimization mode.';

        const result = CommandTransformer.transform(content, hyphenFeatures);

        expect(result).toBe('/clavix-improve is the quick optimization mode.');
      });

      it('should handle command at end of content', () => {
        const content = 'To optimize, run /clavix:improve';

        const result = CommandTransformer.transform(content, hyphenFeatures);

        expect(result).toBe('To optimize, run /clavix-improve');
      });

      it('should not transform partial matches', () => {
        const content = 'The path /clavix:resources/file.txt is not a command.';

        const result = CommandTransformer.transform(content, hyphenFeatures);

        // Pattern matches word chars and hyphenated words, not paths with slashes
        expect(result).toBe('The path /clavix-resources/file.txt is not a command.');
      });
    });

    describe('all command types', () => {
      const hyphenFeatures: IntegrationFeatures = { commandFormat: { separator: '-' } };

      it('should transform /clavix:improve (was fast)', () => {
        expect(CommandTransformer.transform('/clavix:improve', hyphenFeatures)).toBe(
          '/clavix-improve'
        );
      });

      it('should transform /clavix:improve (was fast)', () => {
        expect(CommandTransformer.transform('/clavix:improve', hyphenFeatures)).toBe(
          '/clavix-improve'
        );
      });

      it('should transform /clavix:execute', () => {
        expect(CommandTransformer.transform('/clavix:execute', hyphenFeatures)).toBe(
          '/clavix-execute'
        );
      });

      it('should transform /clavix:prd', () => {
        expect(CommandTransformer.transform('/clavix:prd', hyphenFeatures)).toBe('/clavix-prd');
      });

      it('should transform /clavix:plan', () => {
        expect(CommandTransformer.transform('/clavix:plan', hyphenFeatures)).toBe('/clavix-plan');
      });

      it('should transform /clavix:implement', () => {
        expect(CommandTransformer.transform('/clavix:implement', hyphenFeatures)).toBe(
          '/clavix-implement'
        );
      });

      it('should transform /clavix:start', () => {
        expect(CommandTransformer.transform('/clavix:start', hyphenFeatures)).toBe('/clavix-start');
      });

      it('should transform /clavix:summarize', () => {
        expect(CommandTransformer.transform('/clavix:summarize', hyphenFeatures)).toBe(
          '/clavix-summarize'
        );
      });

      it('should transform /clavix:archive', () => {
        expect(CommandTransformer.transform('/clavix:archive', hyphenFeatures)).toBe(
          '/clavix-archive'
        );
      });

      it('should transform /clavix:task-complete', () => {
        expect(CommandTransformer.transform('/clavix:task-complete', hyphenFeatures)).toBe(
          '/clavix-task-complete'
        );
      });
    });
  });

  describe('formatCommand', () => {
    it('should format command with colon separator (default)', () => {
      const result = CommandTransformer.formatCommand('improve');
      expect(result).toBe('/clavix:improve');
    });

    it('should format command with explicit colon separator', () => {
      const features: IntegrationFeatures = { commandFormat: { separator: ':' } };
      const result = CommandTransformer.formatCommand('improve', features);
      expect(result).toBe('/clavix:improve');
    });

    it('should format command with hyphen separator', () => {
      const features: IntegrationFeatures = { commandFormat: { separator: '-' } };
      const result = CommandTransformer.formatCommand('improve', features);
      expect(result).toBe('/clavix-improve');
    });

    it('should format hyphenated command names', () => {
      const features: IntegrationFeatures = { commandFormat: { separator: '-' } };
      const result = CommandTransformer.formatCommand('task-complete', features);
      expect(result).toBe('/clavix-task-complete');
    });

    it('should handle undefined features', () => {
      const result = CommandTransformer.formatCommand('execute');
      expect(result).toBe('/clavix:execute');
    });

    it('should handle undefined commandFormat', () => {
      const features: IntegrationFeatures = { supportsSubdirectories: true };
      const result = CommandTransformer.formatCommand('execute', features);
      expect(result).toBe('/clavix:execute');
    });
  });

  describe('integration with adapters', () => {
    it('should work with Cursor adapter features', () => {
      const cursorFeatures: IntegrationFeatures = {
        supportsSubdirectories: false,
        supportsFrontmatter: false,
        commandFormat: { separator: '-' },
      };

      const content = 'Run `/clavix:execute --latest` to implement.';
      const result = CommandTransformer.transform(content, cursorFeatures);

      expect(result).toBe('Run `/clavix-execute --latest` to implement.');
    });

    it('should work with Claude Code adapter features (no commandFormat)', () => {
      const claudeFeatures: IntegrationFeatures = {
        supportsSubdirectories: true,
        supportsFrontmatter: false,
      };

      const content = 'Run `/clavix:execute --latest` to implement.';
      const result = CommandTransformer.transform(content, claudeFeatures);

      expect(result).toBe(content); // Unchanged - uses default colon
    });

    it('should work with Droid adapter features', () => {
      const droidFeatures: IntegrationFeatures = {
        supportsSubdirectories: false,
        supportsFrontmatter: true,
        frontmatterFields: ['description', 'argument-hint'],
        argumentPlaceholder: '$ARGUMENTS',
        commandFormat: { separator: '-' },
      };

      const content = 'First `/clavix:improve`, then `/clavix:execute --latest`.';
      const result = CommandTransformer.transform(content, droidFeatures);

      expect(result).toBe('First `/clavix-improve`, then `/clavix-execute --latest`.');
    });
  });
});
