import * as path from 'path';
import fs from 'fs-extra';
import { AgentManager } from '../../src/core/agent-manager';
import { DocInjector } from '../../src/core/doc-injector';
import { FileSystem } from '../../src/utils/file-system';
import { DEFAULT_CONFIG } from '../../src/types/config';
import JSON5 from 'json5';
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Integration test for init workflow components
 * Tests the interaction between AgentManager, DocInjector, and FileSystem
 */
describe('Init Workflow Integration', () => {
  const testDir = path.join(__dirname, '../tmp/init-workflow-test');

  beforeEach(async () => {
    await fs.ensureDir(testDir);
    process.chdir(testDir);
  });

  afterEach(async () => {
    process.chdir(path.join(__dirname, '../..'));
    await fs.remove(testDir);
  });

  it('should complete full initialization workflow', async () => {
    // 1. Detect available agents
    const agentManager = new AgentManager();
    const adapter = agentManager.requireAdapter('claude-code');

    expect(adapter.name).toBe('claude-code');
    expect(adapter.displayName).toBe('Claude Code');

    // 2. Create directory structure (sessions removed in v5.3)
    const dirs = ['.clavix', '.clavix/outputs', '.clavix/templates'];
    for (const dir of dirs) {
      await FileSystem.ensureDir(dir);
    }

    for (const dir of dirs) {
      expect(await FileSystem.exists(dir)).toBe(true);
    }

    // 3. Generate configuration
    const config = { ...DEFAULT_CONFIG, agent: adapter.name };
    const configPath = '.clavix/config.json';
    const configContent = JSON5.stringify(config, null, 2);
    await FileSystem.writeFileAtomic(configPath, configContent);

    expect(await FileSystem.exists(configPath)).toBe(true);
    const savedConfig = JSON5.parse(await FileSystem.readFile(configPath));
    expect(savedConfig.agent).toBe('claude-code');

    // 4. Inject documentation blocks
    const agentsContent = DocInjector.getDefaultAgentsContent();
    const agentsBlock =
      agentsContent.match(/<!-- CLAVIX:START -->([\s\S]*?)<!-- CLAVIX:END -->/)?.[1]?.trim() || '';
    await DocInjector.injectBlock('AGENTS.md', agentsBlock);

    const claudeContent = DocInjector.getDefaultClaudeContent();
    const claudeBlock =
      claudeContent.match(/<!-- CLAVIX:START -->([\s\S]*?)<!-- CLAVIX:END -->/)?.[1]?.trim() || '';
    await DocInjector.injectBlock('CLAUDE.md', claudeBlock);

    expect(await FileSystem.exists('AGENTS.md')).toBe(true);
    expect(await FileSystem.exists('CLAUDE.md')).toBe(true);

    const agentsFile = await FileSystem.readFile('AGENTS.md');
    const claudeFile = await FileSystem.readFile('CLAUDE.md');

    expect(agentsFile).toContain('<!-- CLAVIX:START -->');
    expect(agentsFile).toContain('/clavix:prd');
    expect(claudeFile).toContain('<!-- CLAVIX:START -->');
    // v4.11: /clavix:fast and /clavix:deep merged into /clavix:improve
    expect(claudeFile).toContain('/clavix:improve');
  });

  it('should handle re-initialization correctly', async () => {
    // First init
    await FileSystem.ensureDir('.clavix');
    const config = { ...DEFAULT_CONFIG, agent: 'claude-code' };
    await FileSystem.writeFileAtomic('.clavix/config.json', JSON5.stringify(config, null, 2));

    // Add custom content to AGENTS.md
    const userContent = '# My Custom Agents\n\nUser content here.\n\n';
    await FileSystem.writeFileAtomic('AGENTS.md', userContent);

    // Re-inject managed block
    const agentsContent = DocInjector.getDefaultAgentsContent();
    const agentsBlock =
      agentsContent.match(/<!-- CLAVIX:START -->([\s\S]*?)<!-- CLAVIX:END -->/)?.[1]?.trim() || '';
    await DocInjector.injectBlock('AGENTS.md', agentsBlock);

    const finalContent = await FileSystem.readFile('AGENTS.md');

    // User content should be preserved
    expect(finalContent).toContain('My Custom Agents');
    expect(finalContent).toContain('User content here');

    // Managed block should be added
    expect(finalContent).toContain('<!-- CLAVIX:START -->');
    expect(finalContent).toContain('Clavix');
  });

  it('should verify agent detection and configuration', async () => {
    const agentManager = new AgentManager();

    // Get all available agents
    const availableAgents = agentManager.getAvailableAgents();
    expect(availableAgents).toContain('claude-code');
    expect(availableAgents.length).toBeGreaterThan(0);

    // Get specific adapter
    const adapter = agentManager.getAdapter('claude-code');
    expect(adapter).toBeDefined();
    expect(adapter?.name).toBe('claude-code');
  });

  it('should create proper file structure with atomic writes', async () => {
    // Test atomic file writing with backup
    const testFile = 'test-atomic.md';
    const initialContent = 'Initial content';

    await FileSystem.writeFileAtomic(testFile, initialContent);
    expect(await FileSystem.readFile(testFile)).toBe(initialContent);

    // Update with new content
    const newContent = 'Updated content';
    await FileSystem.writeFileAtomic(testFile, newContent);
    expect(await FileSystem.readFile(testFile)).toBe(newContent);

    // Backup should not exist after successful write
    expect(await FileSystem.exists(`${testFile}.backup`)).toBe(false);
  });
});
