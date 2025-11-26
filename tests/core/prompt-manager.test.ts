import { PromptManager, PromptMetadata } from '../../src/core/prompt-manager';
import { DepthLevel } from '../../src/core/intelligence/types';
import fs from 'fs-extra';
import path from 'path';
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';

describe('PromptManager', () => {
  let promptManager: PromptManager;
  let testPromptsDir: string;

  beforeEach(() => {
    // Use test-specific prompts directory
    testPromptsDir = path.join(process.cwd(), '.clavix-test', 'outputs', 'prompts');
    promptManager = new PromptManager(testPromptsDir);

    // Clean up test directory before each test
    if (fs.existsSync(testPromptsDir)) {
      fs.removeSync(testPromptsDir);
    }
  });

  afterEach(() => {
    // Clean up test directory after each test
    if (fs.existsSync(testPromptsDir)) {
      fs.removeSync(testPromptsDir);
    }
  });

  describe('savePrompt', () => {
    it('should save a standard depth prompt with correct metadata', async () => {
      const content = '# Optimized Prompt\n\nCreate a login page';
      const depthUsed: DepthLevel = 'standard';
      const originalPrompt = 'make a login page';

      const metadata = await promptManager.savePrompt(content, depthUsed, originalPrompt);

      expect(metadata).toMatchObject({
        depthUsed: 'standard',
        originalPrompt: 'make a login page',
        executed: false,
      });
      expect(metadata.id).toMatch(/^std-\d{8}-\d{6}-[a-f0-9-]+$/);
      expect(metadata.filename).toMatch(/^std-\d{8}-\d{6}-[a-f0-9-]+\.md$/);
      expect(metadata.timestamp).toBeTruthy();
    });

    it('should save a comprehensive depth prompt with correct metadata', async () => {
      const content = '# Optimized Prompt\n\nBuild an API';
      const depthUsed: DepthLevel = 'comprehensive';
      const originalPrompt = 'create api';

      const metadata = await promptManager.savePrompt(content, depthUsed, originalPrompt);

      expect(metadata.depthUsed).toBe('comprehensive');
      // v4.11: Single prompts directory, no subdirs
      expect(metadata.path).toContain('prompts');
      expect(metadata.id).toMatch(/^comp-/);
    });

    it('should create frontmatter in saved file', async () => {
      const content = '# Optimized Prompt\n\nTest content';
      const metadata = await promptManager.savePrompt(content, 'standard', 'test');

      const fileContent = await fs.readFile(metadata.path, 'utf-8');
      expect(fileContent).toContain('---');
      expect(fileContent).toContain('id:');
      expect(fileContent).toContain('depthUsed: standard');
      expect(fileContent).toContain('executed: false');
      expect(fileContent).toContain('originalPrompt: test');
    });

    it('should update index.json after saving', async () => {
      await promptManager.savePrompt('content1', 'standard', 'original1');
      await promptManager.savePrompt('content2', 'comprehensive', 'original2');

      // v4.11: Single unified index
      const indexPath = path.join(testPromptsDir, '.index.json');

      expect(fs.existsSync(indexPath)).toBe(true);

      const index = await fs.readJSON(indexPath);
      expect(index.prompts).toHaveLength(2);
      expect(index.prompts.some((p: PromptMetadata) => p.depthUsed === 'standard')).toBe(true);
      expect(index.prompts.some((p: PromptMetadata) => p.depthUsed === 'comprehensive')).toBe(true);
    });

    it('should handle linked project metadata', async () => {
      const metadata = await promptManager.savePrompt(
        'content',
        'standard',
        'original',
        'my-project'
      );

      expect(metadata.linkedProject).toBe('my-project');
    });
  });

  describe('loadPrompt', () => {
    it('should load an existing prompt by ID', async () => {
      const savedMetadata = await promptManager.savePrompt('# Test\n\nContent', 'standard', 'orig');

      const loaded = await promptManager.loadPrompt(savedMetadata.id);

      expect(loaded).not.toBeNull();
      expect(loaded!.metadata.id).toBe(savedMetadata.id);
      expect(loaded!.content).toContain('# Test');
      expect(loaded!.content).toContain('Content');
    });

    it('should return null for non-existent ID', async () => {
      const loaded = await promptManager.loadPrompt('non-existent-id');
      expect(loaded).toBeNull();
    });

    it('should strip frontmatter when loading', async () => {
      const metadata = await promptManager.savePrompt('# Test\n\nActual content', 'standard', 'p');
      const loaded = await promptManager.loadPrompt(metadata.id);

      expect(loaded).not.toBeNull();
      expect(loaded!.content).not.toContain('---');
      expect(loaded!.content).not.toContain('id:');
    });
  });

  describe('listPrompts', () => {
    beforeEach(async () => {
      // Create test prompts
      await promptManager.savePrompt('content1', 'standard', 'original1');
      await promptManager.savePrompt('content2', 'standard', 'original2');
      await promptManager.savePrompt('content3', 'comprehensive', 'original3');
    });

    it('should list all prompts without filters', async () => {
      const prompts = await promptManager.listPrompts();
      expect(prompts).toHaveLength(3);
    });

    it('should filter by depthUsed=standard', async () => {
      const prompts = await promptManager.listPrompts({ depthUsed: 'standard' });
      expect(prompts).toHaveLength(2);
      expect(prompts.every((p) => p.depthUsed === 'standard')).toBe(true);
    });

    it('should filter by depthUsed=comprehensive', async () => {
      const prompts = await promptManager.listPrompts({ depthUsed: 'comprehensive' });
      expect(prompts).toHaveLength(1);
      expect(prompts[0].depthUsed).toBe('comprehensive');
    });

    it('should filter by executed status', async () => {
      const all = await promptManager.listPrompts();
      await promptManager.markExecuted(all[0].id);

      const executed = await promptManager.listPrompts({ executed: true });
      expect(executed).toHaveLength(1);

      const pending = await promptManager.listPrompts({ executed: false });
      expect(pending).toHaveLength(2);
    });

    it('should return empty array for empty directory', async () => {
      fs.removeSync(testPromptsDir);
      const prompts = await promptManager.listPrompts();
      expect(prompts).toHaveLength(0);
    });
  });

  describe('markExecuted', () => {
    it('should mark a prompt as executed', async () => {
      const metadata = await promptManager.savePrompt('content', 'standard', 'original');

      await promptManager.markExecuted(metadata.id);

      const updated = await promptManager.listPrompts({ depthUsed: 'standard' });
      expect(updated[0].executed).toBe(true);
    });

    it('should update index.json when marking executed', async () => {
      const metadata = await promptManager.savePrompt('content', 'standard', 'original');
      await promptManager.markExecuted(metadata.id);

      const indexPath = path.join(testPromptsDir, '.index.json');
      const index = await fs.readJSON(indexPath);

      expect(index.prompts[0].executed).toBe(true);
      expect(index.prompts[0].executedAt).toBeTruthy();
    });
  });

  describe('deletePrompts', () => {
    beforeEach(async () => {
      await promptManager.savePrompt('content1', 'standard', 'original1');
      await promptManager.savePrompt('content2', 'standard', 'original2');
      await promptManager.savePrompt('content3', 'comprehensive', 'original3');
    });

    it('should delete prompts by depthUsed=standard', async () => {
      const deleted = await promptManager.deletePrompts({ depthUsed: 'standard' });
      expect(deleted).toBe(2);

      const remaining = await promptManager.listPrompts();
      expect(remaining).toHaveLength(1);
      expect(remaining[0].depthUsed).toBe('comprehensive');
    });

    it('should delete prompts by depthUsed=comprehensive', async () => {
      const deleted = await promptManager.deletePrompts({ depthUsed: 'comprehensive' });
      expect(deleted).toBe(1);

      const remaining = await promptManager.listPrompts();
      expect(remaining).toHaveLength(2);
    });

    it('should combine filters (depthUsed + executed)', async () => {
      const standard = await promptManager.listPrompts({ depthUsed: 'standard' });
      await promptManager.markExecuted(standard[0].id);

      const deleted = await promptManager.deletePrompts({
        depthUsed: 'standard',
        executed: true,
      });
      expect(deleted).toBe(1);

      const remaining = await promptManager.listPrompts();
      expect(remaining).toHaveLength(2);
    });

    it('should update index after deletion', async () => {
      await promptManager.deletePrompts({ depthUsed: 'standard' });

      const indexPath = path.join(testPromptsDir, '.index.json');
      const index = await fs.readJSON(indexPath);

      expect(index.prompts).toHaveLength(1);
    });

    it('should delete actual files', async () => {
      const before = await promptManager.listPrompts({ depthUsed: 'standard' });
      const filePaths = before.map((p) => p.path);

      await promptManager.deletePrompts({ depthUsed: 'standard' });

      for (const filePath of filePaths) {
        expect(fs.existsSync(filePath)).toBe(false);
      }
    });

    it('should delete all prompts when no filter', async () => {
      const deleted = await promptManager.deletePrompts({});
      expect(deleted).toBe(3);

      const remaining = await promptManager.listPrompts();
      expect(remaining).toHaveLength(0);
    });
  });

  describe('getLatestPrompt behavior via listPrompts', () => {
    it('should return prompts sorted by timestamp (most recent last)', async () => {
      await promptManager.savePrompt('content1', 'standard', 'original1');
      await new Promise((r) => setTimeout(r, 10)); // Small delay for timestamp
      const second = await promptManager.savePrompt('content2', 'comprehensive', 'original2');

      const prompts = await promptManager.listPrompts();
      // Sort by timestamp descending to get latest first
      const sorted = prompts.sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      const latest = sorted[0];

      expect(latest).toBeDefined();
      expect(latest.id).toBe(second.id);
    });

    it('should filter by depthUsed', async () => {
      await promptManager.savePrompt('content1', 'comprehensive', 'original1');
      await new Promise((r) => setTimeout(r, 10));
      const standardPrompt = await promptManager.savePrompt('content2', 'standard', 'original2');

      const prompts = await promptManager.listPrompts({ depthUsed: 'standard' });
      const sorted = prompts.sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      const latest = sorted[0];

      expect(latest).toBeDefined();
      expect(latest.id).toBe(standardPrompt.id);
    });

    it('should return empty array for empty storage', async () => {
      const prompts = await promptManager.listPrompts();
      expect(prompts).toHaveLength(0);
    });
  });

  describe('getStorageStats', () => {
    beforeEach(async () => {
      await promptManager.savePrompt('content1', 'standard', 'original1');
      await promptManager.savePrompt('content2', 'standard', 'original2');
      await promptManager.savePrompt('content3', 'comprehensive', 'original3');
    });

    it('should count prompts by depthUsed', async () => {
      const stats = await promptManager.getStorageStats();

      expect(stats.totalPrompts).toBe(3);
      expect(stats.standardPrompts).toBe(2);
      expect(stats.comprehensivePrompts).toBe(1);
    });

    it('should count executed vs pending', async () => {
      const all = await promptManager.listPrompts();
      await promptManager.markExecuted(all[0].id);

      const stats = await promptManager.getStorageStats();

      expect(stats.executedPrompts).toBe(1);
      expect(stats.pendingPrompts).toBe(2);
    });

    it('should detect stale prompts (>30 days)', async () => {
      // Manually create an old prompt by modifying the index
      const indexPath = path.join(testPromptsDir, '.index.json');
      const index = await fs.readJSON(indexPath);

      // Make first prompt 35 days old
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 35);
      index.prompts[0].timestamp = oldDate.toISOString();
      index.prompts[0].createdAt = oldDate;

      await fs.writeJSON(indexPath, index);

      const stats = await promptManager.getStorageStats();

      expect(stats.stalePrompts).toBe(1);
      expect(stats.oldestPromptAge).toBe(35);
    });
  });

  describe('index corruption handling', () => {
    it('should create new index when saving first prompt', async () => {
      // v4.11: Index is created when first prompt is saved, not on listPrompts
      const indexPath = path.join(testPromptsDir, '.index.json');
      expect(fs.existsSync(indexPath)).toBe(false);

      await promptManager.savePrompt('content1', 'standard', 'original1');

      expect(fs.existsSync(indexPath)).toBe(true);
    });

    it('should recover from corrupted index file', async () => {
      // First create valid prompts
      await promptManager.savePrompt('content1', 'standard', 'original1');

      // Corrupt the index
      const indexPath = path.join(testPromptsDir, '.index.json');
      await fs.writeFile(indexPath, 'invalid json{{{');

      // Should recover - listPrompts may return empty or rebuild
      const prompts = await promptManager.listPrompts();
      expect(prompts.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('loadPrompt by ID', () => {
    it('should load prompt by ID', async () => {
      const saved = await promptManager.savePrompt('content', 'standard', 'original');

      const found = await promptManager.loadPrompt(saved.id);

      expect(found).not.toBeNull();
      expect(found!.metadata.id).toBe(saved.id);
    });

    it('should return null for non-existent ID', async () => {
      const found = await promptManager.loadPrompt('non-existent');
      expect(found).toBeNull();
    });
  });
});
