import { PromptManager, PromptSource, PromptMetadata } from '../../src/core/prompt-manager';
import fs from 'fs-extra';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Mock uuid to return predictable IDs for testing
jest.mock('uuid');
const mockUuidv4 = uuidv4 as jest.MockedFunction<typeof uuidv4>;

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

    // Reset uuid mock - return different values for each call
    mockUuidv4.mockReset();
    let callCount = 0;
    mockUuidv4.mockImplementation(() => {
      callCount++;
      return `test-hash-${String(callCount).padStart(3, '0')}`;
    });
  });

  afterEach(() => {
    // Clean up test directory after each test
    if (fs.existsSync(testPromptsDir)) {
      fs.removeSync(testPromptsDir);
    }
  });

  describe('savePrompt', () => {
    it('should save a fast prompt with correct metadata', async () => {
      const content = '# Optimized Prompt\n\nCreate a login page';
      const source: PromptSource = 'fast';
      const originalPrompt = 'make a login page';

      const metadata = await promptManager.savePrompt(content, source, originalPrompt);

      expect(metadata).toMatchObject({
        source: 'fast',
        originalPrompt: 'make a login page',
        executed: false,
      });
      expect(metadata.id).toMatch(/^fast-\d{8}-\d{6}-test-hash-\d{3}$/);
      expect(metadata.filename).toMatch(/^fast-\d{8}-\d{6}-test-hash-\d{3}\.md$/);
      expect(metadata.timestamp).toBeTruthy();
    });

    it('should save a deep prompt with correct metadata', async () => {
      const content = '# Optimized Prompt\n\nBuild an API';
      const source: PromptSource = 'deep';
      const originalPrompt = 'create api';

      const metadata = await promptManager.savePrompt(content, source, originalPrompt);

      expect(metadata.source).toBe('deep');
      expect(metadata.path).toContain('prompts/deep');
    });

    it('should create frontmatter in saved file', async () => {
      const content = '# Optimized Prompt\n\nTest content';
      const metadata = await promptManager.savePrompt(content, 'fast', 'test');

      const fileContent = await fs.readFile(metadata.path, 'utf-8');
      expect(fileContent).toContain('---');
      expect(fileContent).toContain('id:');
      expect(fileContent).toContain('source: fast');
      expect(fileContent).toContain('executed: false');
      expect(fileContent).toContain('originalPrompt: test');
    });

    it('should update index.json after saving', async () => {
      await promptManager.savePrompt('content1', 'fast', 'original1');
      await promptManager.savePrompt('content2', 'deep', 'original2');

      const fastIndexPath = path.join(testPromptsDir, 'fast', '.index.json');
      const deepIndexPath = path.join(testPromptsDir, 'deep', '.index.json');

      expect(fs.existsSync(fastIndexPath)).toBe(true);
      expect(fs.existsSync(deepIndexPath)).toBe(true);

      const fastIndex = await fs.readJSON(fastIndexPath);
      expect(fastIndex.prompts).toHaveLength(1);
      expect(fastIndex.prompts[0].source).toBe('fast');
    });

    it('should handle linked project metadata', async () => {
      const metadata = await promptManager.savePrompt(
        'content',
        'fast',
        'original',
        'my-project'
      );

      expect(metadata.linkedProject).toBe('my-project');
    });
  });

  describe('loadPrompt', () => {
    it('should load an existing prompt by ID', async () => {
      const savedMetadata = await promptManager.savePrompt('# Test\n\nContent', 'fast', 'orig');

      const loaded = await promptManager.loadPrompt(savedMetadata.id);

      expect(loaded).not.toBeNull();
      expect(loaded!.metadata.id).toBe(savedMetadata.id);
      expect(loaded!.content).toContain('# Test');
      expect(loaded!.content).toContain('Content');
    });

    it('should return null for non-existent prompt', async () => {
      const loaded = await promptManager.loadPrompt('non-existent-id');
      expect(loaded).toBeNull();
    });

    it('should load prompt with frontmatter stripped', async () => {
      const savedMetadata = await promptManager.savePrompt('# Prompt\n\nBody', 'fast', 'orig');
      const loaded = await promptManager.loadPrompt(savedMetadata.id);

      expect(loaded!.content).not.toContain('---');
      expect(loaded!.content).not.toContain('id:');
      expect(loaded!.content).toContain('# Prompt');
    });
  });

  describe('listPrompts', () => {
    beforeEach(async () => {
      // Create test prompts
      await promptManager.savePrompt('fast1', 'fast', 'orig1');
      await promptManager.savePrompt('fast2', 'fast', 'orig2');
      await promptManager.savePrompt('deep1', 'deep', 'orig3');
    });

    it('should list all prompts without filters', async () => {
      const prompts = await promptManager.listPrompts();
      expect(prompts).toHaveLength(3);
    });

    it('should filter by source=fast', async () => {
      const prompts = await promptManager.listPrompts({ source: 'fast' });
      expect(prompts).toHaveLength(2);
      expect(prompts.every(p => p.source === 'fast')).toBe(true);
    });

    it('should filter by source=deep', async () => {
      const prompts = await promptManager.listPrompts({ source: 'deep' });
      expect(prompts).toHaveLength(1);
      expect(prompts[0].source).toBe('deep');
    });

    it('should filter by executed=false', async () => {
      const prompts = await promptManager.listPrompts({ executed: false });
      expect(prompts).toHaveLength(3);
      expect(prompts.every(p => !p.executed)).toBe(true);
    });

    it('should filter by executed=true', async () => {
      // Mark one as executed
      const all = await promptManager.listPrompts();
      await promptManager.markExecuted(all[0].id);

      const executed = await promptManager.listPrompts({ executed: true });
      expect(executed).toHaveLength(1);
      expect(executed[0].executed).toBe(true);
    });

    it('should return prompts sorted by creation time (newest first)', async () => {
      const prompts = await promptManager.listPrompts();

      for (let i = 0; i < prompts.length - 1; i++) {
        const current = new Date(prompts[i].createdAt).getTime();
        const next = new Date(prompts[i + 1].createdAt).getTime();
        expect(current).toBeGreaterThanOrEqual(next);
      }
    });
  });

  describe('markExecuted', () => {
    it('should mark a prompt as executed', async () => {
      const metadata = await promptManager.savePrompt('content', 'fast', 'orig');
      expect(metadata.executed).toBe(false);

      await promptManager.markExecuted(metadata.id);

      const updated = await promptManager.listPrompts({ source: 'fast' });
      expect(updated[0].executed).toBe(true);
    });

    it('should update index.json when marking executed', async () => {
      const metadata = await promptManager.savePrompt('content', 'fast', 'orig');
      await promptManager.markExecuted(metadata.id);

      const indexPath = path.join(testPromptsDir, 'fast', '.index.json');
      const index = await fs.readJSON(indexPath);
      expect(index.prompts[0].executed).toBe(true);
    });

    it('should throw error for non-existent prompt', async () => {
      await expect(promptManager.markExecuted('non-existent')).rejects.toThrow();
    });
  });

  describe('deletePrompts', () => {
    beforeEach(async () => {
      await promptManager.savePrompt('fast1', 'fast', 'orig1');
      await promptManager.savePrompt('fast2', 'fast', 'orig2');
      await promptManager.savePrompt('deep1', 'deep', 'orig3');
    });

    it('should delete prompts by source=fast', async () => {
      const deleted = await promptManager.deletePrompts({ source: 'fast' });
      expect(deleted).toBe(2);

      const remaining = await promptManager.listPrompts();
      expect(remaining).toHaveLength(1);
      expect(remaining[0].source).toBe('deep');
    });

    it('should delete all executed prompts', async () => {
      const all = await promptManager.listPrompts();
      await promptManager.markExecuted(all[0].id);
      await promptManager.markExecuted(all[1].id);

      const deleted = await promptManager.deletePrompts({ executed: true });
      expect(deleted).toBe(2);

      const remaining = await promptManager.listPrompts();
      expect(remaining).toHaveLength(1);
    });

    it('should combine filters (source + executed)', async () => {
      const fast = await promptManager.listPrompts({ source: 'fast' });
      await promptManager.markExecuted(fast[0].id);

      const deleted = await promptManager.deletePrompts({
        source: 'fast',
        executed: true
      });
      expect(deleted).toBe(1);

      const remaining = await promptManager.listPrompts();
      expect(remaining).toHaveLength(2);
    });

    it('should update index after deletion', async () => {
      await promptManager.deletePrompts({ source: 'fast' });

      const fastIndexPath = path.join(testPromptsDir, 'fast', '.index.json');
      const fastIndex = await fs.readJSON(fastIndexPath);
      expect(fastIndex.prompts).toHaveLength(0);
    });
  });

  describe('getPromptAge', () => {
    it('should return 0 for today\'s prompt', () => {
      const metadata: PromptMetadata = {
        id: 'test-id',
        filename: 'test.md',
        source: 'fast',
        timestamp: new Date().toISOString(),
        createdAt: new Date(),
        path: '/test/path.md',
        originalPrompt: 'test',
        executed: false,
        executedAt: null,
      };

      const age = promptManager.getPromptAge(metadata);
      expect(age).toBe(0);
    });

    it('should return 7 for week-old prompt', () => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const metadata: PromptMetadata = {
        id: 'test-id',
        filename: 'test.md',
        source: 'fast',
        timestamp: weekAgo.toISOString(),
        createdAt: weekAgo,
        path: '/test/path.md',
        originalPrompt: 'test',
        executed: false,
        executedAt: null,
      };

      const age = promptManager.getPromptAge(metadata);
      expect(age).toBe(7);
    });

    it('should return 30 for month-old prompt', () => {
      const monthAgo = new Date();
      monthAgo.setDate(monthAgo.getDate() - 30);

      const metadata: PromptMetadata = {
        id: 'test-id',
        filename: 'test.md',
        source: 'fast',
        timestamp: monthAgo.toISOString(),
        createdAt: monthAgo,
        path: '/test/path.md',
        originalPrompt: 'test',
        executed: false,
        executedAt: null,
      };

      const age = promptManager.getPromptAge(metadata);
      expect(age).toBe(30);
    });
  });

  describe('getStorageStats', () => {
    it('should return correct stats for empty storage', async () => {
      const stats = await promptManager.getStorageStats();

      expect(stats).toMatchObject({
        totalPrompts: 0,
        fastPrompts: 0,
        deepPrompts: 0,
        executedPrompts: 0,
        pendingPrompts: 0,
        stalePrompts: 0,
        oldestPromptAge: 0,
      });
    });

    it('should count prompts by source', async () => {
      await promptManager.savePrompt('f1', 'fast', 'o1');
      await promptManager.savePrompt('f2', 'fast', 'o2');
      await promptManager.savePrompt('d1', 'deep', 'o3');

      const stats = await promptManager.getStorageStats();

      expect(stats.totalPrompts).toBe(3);
      expect(stats.fastPrompts).toBe(2);
      expect(stats.deepPrompts).toBe(1);
    });

    it('should count executed vs pending', async () => {
      const m1 = await promptManager.savePrompt('c1', 'fast', 'o1');
      await promptManager.savePrompt('c2', 'fast', 'o2');
      await promptManager.markExecuted(m1.id);

      const stats = await promptManager.getStorageStats();

      expect(stats.executedPrompts).toBe(1);
      expect(stats.pendingPrompts).toBe(1);
    });

    it('should detect stale prompts (>30 days)', async () => {
      // Mock old prompt by directly writing to index
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 35);

      const oldMetadata: PromptMetadata = {
        id: 'old-prompt',
        filename: 'old.md',
        source: 'fast',
        timestamp: oldDate.toISOString(),
        createdAt: oldDate,
        path: path.join(testPromptsDir, 'fast', 'old.md'),
        originalPrompt: 'old',
        executed: false,
        executedAt: null,
      };

      const fastDir = path.join(testPromptsDir, 'fast');
      await fs.ensureDir(fastDir);
      await fs.writeJSON(path.join(fastDir, '.index.json'), {
        version: '1.0',
        prompts: [oldMetadata]
      });

      const stats = await promptManager.getStorageStats();

      expect(stats.stalePrompts).toBe(1);
      expect(stats.oldestPromptAge).toBe(35);
    });
  });

  describe('index corruption handling', () => {
    it('should create new index if missing', async () => {
      const fastDir = path.join(testPromptsDir, 'fast');
      await fs.ensureDir(fastDir);

      const prompts = await promptManager.listPrompts({ source: 'fast' });
      expect(prompts).toHaveLength(0);

      const indexPath = path.join(fastDir, '.index.json');
      expect(fs.existsSync(indexPath)).toBe(true);
    });

    it('should recover from corrupted index file', async () => {
      const fastDir = path.join(testPromptsDir, 'fast');
      await fs.ensureDir(fastDir);
      await fs.writeFile(path.join(fastDir, '.index.json'), 'invalid json{');

      // Should not throw, should create new index
      const prompts = await promptManager.listPrompts({ source: 'fast' });
      expect(prompts).toHaveLength(0);
    });
  });
});
