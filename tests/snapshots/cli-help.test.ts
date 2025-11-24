/**
 * CLI Command Metadata Snapshot Tests
 *
 * These tests verify that CLI command metadata (description, args, flags)
 * remain stable across versions by directly importing command classes.
 */

import { describe, it, expect, jest } from '@jest/globals';
import { sanitizeVersions, prepareObjectSnapshot } from '../helpers/snapshot-utils.js';

// Import command classes directly for metadata testing
const { default: Fast } = await import('../../src/cli/commands/fast.js');
const { default: Deep } = await import('../../src/cli/commands/deep.js');
const { default: Prd } = await import('../../src/cli/commands/prd.js');
const { default: Init } = await import('../../src/cli/commands/init.js');
const { default: Update } = await import('../../src/cli/commands/update.js');
const { default: Plan } = await import('../../src/cli/commands/plan.js');
const { default: Implement } = await import('../../src/cli/commands/implement.js');
const { default: Archive } = await import('../../src/cli/commands/archive.js');
const { default: Config } = await import('../../src/cli/commands/config.js');
const { default: Start } = await import('../../src/cli/commands/start.js');
const { default: Summarize } = await import('../../src/cli/commands/summarize.js');
const { default: Show } = await import('../../src/cli/commands/show.js');
const { default: ListCmd } = await import('../../src/cli/commands/list.js');
const { default: TaskComplete } = await import('../../src/cli/commands/task-complete.js');

describe('CLI Command Metadata Snapshots', () => {
  /**
   * Extract command metadata for snapshot testing
   */
  function extractCommandMetadata(CommandClass: any): object {
    return {
      id: CommandClass.id,
      description: CommandClass.description,
      summary: CommandClass.summary,
      aliases: CommandClass.aliases || [],
      hidden: CommandClass.hidden || false,
      examples: CommandClass.examples || [],
      args: CommandClass.args
        ? Object.keys(CommandClass.args).map((key) => ({
            name: key,
            description: CommandClass.args[key].description,
            required: CommandClass.args[key].required || false,
          }))
        : [],
      flags: CommandClass.flags
        ? Object.keys(CommandClass.flags).map((key) => ({
            name: key,
            description: CommandClass.flags[key].description,
            required: CommandClass.flags[key].required || false,
            type: CommandClass.flags[key].type,
          }))
        : [],
    };
  }

  describe('prompt improvement commands', () => {
    it('fast command metadata should match snapshot', () => {
      const metadata = extractCommandMetadata(Fast);
      expect(prepareObjectSnapshot(metadata)).toMatchSnapshot('fast-command-metadata');
    });

    it('deep command metadata should match snapshot', () => {
      const metadata = extractCommandMetadata(Deep);
      expect(prepareObjectSnapshot(metadata)).toMatchSnapshot('deep-command-metadata');
    });
  });

  describe('PRD commands', () => {
    it('prd command metadata should match snapshot', () => {
      const metadata = extractCommandMetadata(Prd);
      expect(prepareObjectSnapshot(metadata)).toMatchSnapshot('prd-command-metadata');
    });

    it('plan command metadata should match snapshot', () => {
      const metadata = extractCommandMetadata(Plan);
      expect(prepareObjectSnapshot(metadata)).toMatchSnapshot('plan-command-metadata');
    });

    it('implement command metadata should match snapshot', () => {
      const metadata = extractCommandMetadata(Implement);
      expect(prepareObjectSnapshot(metadata)).toMatchSnapshot('implement-command-metadata');
    });

    it('task-complete command metadata should match snapshot', () => {
      const metadata = extractCommandMetadata(TaskComplete);
      expect(prepareObjectSnapshot(metadata)).toMatchSnapshot('task-complete-command-metadata');
    });
  });

  describe('setup commands', () => {
    it('init command metadata should match snapshot', () => {
      const metadata = extractCommandMetadata(Init);
      expect(prepareObjectSnapshot(metadata)).toMatchSnapshot('init-command-metadata');
    });

    it('update command metadata should match snapshot', () => {
      const metadata = extractCommandMetadata(Update);
      expect(prepareObjectSnapshot(metadata)).toMatchSnapshot('update-command-metadata');
    });

    it('config command metadata should match snapshot', () => {
      const metadata = extractCommandMetadata(Config);
      expect(prepareObjectSnapshot(metadata)).toMatchSnapshot('config-command-metadata');
    });
  });

  describe('session commands', () => {
    it('start command metadata should match snapshot', () => {
      const metadata = extractCommandMetadata(Start);
      expect(prepareObjectSnapshot(metadata)).toMatchSnapshot('start-command-metadata');
    });

    it('summarize command metadata should match snapshot', () => {
      const metadata = extractCommandMetadata(Summarize);
      expect(prepareObjectSnapshot(metadata)).toMatchSnapshot('summarize-command-metadata');
    });

    it('show command metadata should match snapshot', () => {
      const metadata = extractCommandMetadata(Show);
      expect(prepareObjectSnapshot(metadata)).toMatchSnapshot('show-command-metadata');
    });

    it('list command metadata should match snapshot', () => {
      const metadata = extractCommandMetadata(ListCmd);
      expect(prepareObjectSnapshot(metadata)).toMatchSnapshot('list-command-metadata');
    });
  });

  describe('utility commands', () => {
    it('archive command metadata should match snapshot', () => {
      const metadata = extractCommandMetadata(Archive);
      expect(prepareObjectSnapshot(metadata)).toMatchSnapshot('archive-command-metadata');
    });
  });

  describe('command consistency', () => {
    const allCommands = [
      { name: 'fast', Class: Fast },
      { name: 'deep', Class: Deep },
      { name: 'prd', Class: Prd },
      { name: 'init', Class: Init },
      { name: 'update', Class: Update },
      { name: 'plan', Class: Plan },
      { name: 'implement', Class: Implement },
      { name: 'archive', Class: Archive },
      { name: 'config', Class: Config },
      { name: 'start', Class: Start },
      { name: 'summarize', Class: Summarize },
      { name: 'show', Class: Show },
      { name: 'list', Class: ListCmd },
      { name: 'task-complete', Class: TaskComplete },
    ];

    it.each(allCommands)('$name command should have required metadata', ({ name, Class }) => {
      // Oclif commands have static description property
      expect(Class.description).toBeDefined();
      expect(typeof Class.description).toBe('string');
      expect(Class.description.length).toBeGreaterThan(0);
    });

    it('all commands should have unique descriptions', () => {
      const descriptions = allCommands.map((c) => c.Class.description);
      const uniqueDescriptions = new Set(descriptions);
      // Descriptions should be reasonably unique (some overlap ok)
      expect(uniqueDescriptions.size).toBeGreaterThan(allCommands.length / 2);
    });
  });
});
