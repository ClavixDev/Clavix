/**
 * Tests for clavix show command
 * 
 * Tests retrieving and displaying session details including full conversation history
 * and associated outputs
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import { SessionManager } from '../../src/core/session-manager';

describe('clavix show - session retrieval and display', () => {
  const testDir = path.join(__dirname, '../fixtures/test-show');
  const clavixDir = path.join(testDir, '.clavix');
  const sessionsDir = path.join(clavixDir, 'sessions');
  const outputsDir = path.join(clavixDir, 'outputs');
  
  let sessionManager: SessionManager;

  beforeEach(async () => {
    // Clean up and set up test directory
    await fs.remove(testDir);
    await fs.ensureDir(sessionsDir);
    await fs.ensureDir(outputsDir);

    sessionManager = new SessionManager(sessionsDir);

    // Mock process.cwd() to return test directory
    jest.spyOn(process, 'cwd').mockReturnValue(testDir);
  });

  afterEach(async () => {
    await fs.remove(testDir);
    jest.restoreAllMocks();
  });

  describe('session retrieval by ID', () => {
    it('should retrieve session by ID', async () => {
      const session = await sessionManager.createSession({
        projectName: 'test-project',
        description: 'Test session'
      });

      const retrieved = await sessionManager.getSession(session.id);

      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(session.id);
      expect(retrieved?.projectName).toBe('test-project');
    });

    it('should return null for non-existent session ID', async () => {
      const retrieved = await sessionManager.getSession('non-existent-id');

      expect(retrieved).toBeNull();
    });

    it('should retrieve session with correct metadata', async () => {
      const session = await sessionManager.createSession({
        projectName: 'my-project',
        agent: 'Claude Code',
        description: 'Building a feature',
        tags: ['feature', 'backend']
      });

      const retrieved = await sessionManager.getSession(session.id);

      expect(retrieved).toBeDefined();
      expect(retrieved?.projectName).toBe('my-project');
      expect(retrieved?.agent).toBe('Claude Code');
      expect(retrieved?.description).toBe('Building a feature');
      expect(retrieved?.tags).toEqual(['feature', 'backend']);
      expect(retrieved?.status).toBe('active');
    });

    it('should retrieve session with proper date objects', async () => {
      const session = await sessionManager.createSession({
        projectName: 'test'
      });

      const retrieved = await sessionManager.getSession(session.id);

      expect(retrieved?.created).toBeInstanceOf(Date);
      expect(retrieved?.updated).toBeInstanceOf(Date);
    });
  });

  describe('full conversation history retrieval', () => {
    it('should retrieve session with no messages', async () => {
      const session = await sessionManager.createSession({
        projectName: 'empty-session'
      });

      const retrieved = await sessionManager.getSession(session.id);

      expect(retrieved?.messages).toBeDefined();
      expect(retrieved?.messages.length).toBe(0);
    });

    it('should retrieve session with single message', async () => {
      const session = await sessionManager.createSession({
        projectName: 'test'
      });
      
      await sessionManager.addMessage(session.id, 'user', 'Hello, world!');

      const retrieved = await sessionManager.getSession(session.id);

      expect(retrieved?.messages.length).toBe(1);
      expect(retrieved?.messages[0].role).toBe('user');
      expect(retrieved?.messages[0].content).toBe('Hello, world!');
      expect(retrieved?.messages[0].timestamp).toBeInstanceOf(Date);
    });

    it('should retrieve session with multiple messages', async () => {
      const session = await sessionManager.createSession({
        projectName: 'test'
      });
      
      await sessionManager.addMessage(session.id, 'user', 'First message');
      await sessionManager.addMessage(session.id, 'assistant', 'Second message');
      await sessionManager.addMessage(session.id, 'user', 'Third message');

      const retrieved = await sessionManager.getSession(session.id);

      expect(retrieved?.messages.length).toBe(3);
      expect(retrieved?.messages[0].content).toBe('First message');
      expect(retrieved?.messages[1].content).toBe('Second message');
      expect(retrieved?.messages[2].content).toBe('Third message');
    });

    it('should preserve message order', async () => {
      const session = await sessionManager.createSession({
        projectName: 'test'
      });
      
      const messages = [
        'Message 1',
        'Message 2',
        'Message 3',
        'Message 4',
        'Message 5'
      ];

      for (const msg of messages) {
        await sessionManager.addMessage(session.id, 'user', msg);
      }

      const retrieved = await sessionManager.getSession(session.id);

      expect(retrieved?.messages.length).toBe(5);
      messages.forEach((msg, index) => {
        expect(retrieved?.messages[index].content).toBe(msg);
      });
    });

    it('should retrieve messages with user and assistant roles', async () => {
      const session = await sessionManager.createSession({
        projectName: 'test'
      });
      
      await sessionManager.addMessage(session.id, 'user', 'User message 1');
      await sessionManager.addMessage(session.id, 'assistant', 'Assistant response 1');
      await sessionManager.addMessage(session.id, 'user', 'User message 2');
      await sessionManager.addMessage(session.id, 'assistant', 'Assistant response 2');

      const retrieved = await sessionManager.getSession(session.id);

      expect(retrieved?.messages[0].role).toBe('user');
      expect(retrieved?.messages[1].role).toBe('assistant');
      expect(retrieved?.messages[2].role).toBe('user');
      expect(retrieved?.messages[3].role).toBe('assistant');
    });

    it('should retrieve messages with correct timestamps', async () => {
      const session = await sessionManager.createSession({
        projectName: 'test'
      });
      
      const before = new Date();
      await sessionManager.addMessage(session.id, 'user', 'Test message');
      const after = new Date();

      const retrieved = await sessionManager.getSession(session.id);

      const messageTime = retrieved?.messages[0].timestamp;
      expect(messageTime).toBeInstanceOf(Date);
      expect(messageTime!.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(messageTime!.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('should retrieve conversation with long messages', async () => {
      const session = await sessionManager.createSession({
        projectName: 'test'
      });
      
      const longMessage = 'This is a very long message. '.repeat(100);
      await sessionManager.addMessage(session.id, 'user', longMessage);

      const retrieved = await sessionManager.getSession(session.id);

      expect(retrieved?.messages[0].content).toBe(longMessage);
      expect(retrieved?.messages[0].content.length).toBeGreaterThan(1000);
    });

    it('should retrieve messages with special characters', async () => {
      const session = await sessionManager.createSession({
        projectName: 'test'
      });
      
      const specialMessage = 'Special chars: !@#$%^&*()_+-=[]{}|;\':",./<>?`~';
      await sessionManager.addMessage(session.id, 'user', specialMessage);

      const retrieved = await sessionManager.getSession(session.id);

      expect(retrieved?.messages[0].content).toBe(specialMessage);
    });

    it('should retrieve messages with newlines and formatting', async () => {
      const session = await sessionManager.createSession({
        projectName: 'test'
      });
      
      const formattedMessage = 'Line 1\nLine 2\n\nLine 4 with\ttabs';
      await sessionManager.addMessage(session.id, 'user', formattedMessage);

      const retrieved = await sessionManager.getSession(session.id);

      expect(retrieved?.messages[0].content).toBe(formattedMessage);
    });
  });

  describe('associated outputs detection', () => {
    it('should detect associated output directory', async () => {
      const session = await sessionManager.createSession({
        projectName: 'test-project'
      });

      // Create output directory for this project
      const projectOutputDir = path.join(outputsDir, 'test-project');
      await fs.ensureDir(projectOutputDir);
      await fs.writeFile(
        path.join(projectOutputDir, 'output.md'),
        '# Test Output'
      );

      const exists = await fs.pathExists(projectOutputDir);
      expect(exists).toBe(true);

      const files = await fs.readdir(projectOutputDir);
      expect(files).toContain('output.md');
    });

    it('should list multiple output files', async () => {
      const session = await sessionManager.createSession({
        projectName: 'test-project'
      });

      const projectOutputDir = path.join(outputsDir, 'test-project');
      await fs.ensureDir(projectOutputDir);
      
      await fs.writeFile(path.join(projectOutputDir, 'mini-prd.md'), '# Mini PRD');
      await fs.writeFile(path.join(projectOutputDir, 'prompt.md'), '# Optimized Prompt');
      await fs.writeFile(path.join(projectOutputDir, 'notes.md'), '# Notes');

      const files = await fs.readdir(projectOutputDir);
      const mdFiles = files.filter(f => f.endsWith('.md'));

      expect(mdFiles.length).toBe(3);
      expect(mdFiles).toContain('mini-prd.md');
      expect(mdFiles).toContain('prompt.md');
      expect(mdFiles).toContain('notes.md');
    });

    it('should handle session with no associated outputs', async () => {
      const session = await sessionManager.createSession({
        projectName: 'no-outputs'
      });

      const projectOutputDir = path.join(outputsDir, 'no-outputs');
      const exists = await fs.pathExists(projectOutputDir);

      expect(exists).toBe(false);
    });

    it('should get file metadata for outputs', async () => {
      const session = await sessionManager.createSession({
        projectName: 'test-project'
      });

      const projectOutputDir = path.join(outputsDir, 'test-project');
      await fs.ensureDir(projectOutputDir);
      
      const content = '# Test Output\n\nThis is test content.';
      const filePath = path.join(projectOutputDir, 'output.md');
      await fs.writeFile(filePath, content);

      const stats = await fs.stat(filePath);
      
      expect(stats.size).toBeGreaterThan(0);
      expect(stats.isFile()).toBe(true);
      expect(stats.mtime).toBeTruthy();
      expect(typeof stats.mtime.getTime).toBe('function');
    });
  });

  describe('session details completeness', () => {
    it('should retrieve all session fields', async () => {
      const session = await sessionManager.createSession({
        projectName: 'complete-session',
        agent: 'Test Agent',
        description: 'A complete test session',
        tags: ['test', 'complete']
      });

      await sessionManager.addMessage(session.id, 'user', 'Test message');

      const retrieved = await sessionManager.getSession(session.id);

      expect(retrieved).toHaveProperty('id');
      expect(retrieved).toHaveProperty('projectName');
      expect(retrieved).toHaveProperty('agent');
      expect(retrieved).toHaveProperty('created');
      expect(retrieved).toHaveProperty('updated');
      expect(retrieved).toHaveProperty('status');
      expect(retrieved).toHaveProperty('messages');
      expect(retrieved).toHaveProperty('tags');
      expect(retrieved).toHaveProperty('description');
    });

    it('should show correct status for active session', async () => {
      const session = await sessionManager.createSession({
        projectName: 'active-session'
      });

      const retrieved = await sessionManager.getSession(session.id);

      expect(retrieved?.status).toBe('active');
    });

    it('should show correct status for completed session', async () => {
      const session = await sessionManager.createSession({
        projectName: 'completed-session'
      });

      await sessionManager.completeSession(session.id);

      const retrieved = await sessionManager.getSession(session.id);

      expect(retrieved?.status).toBe('completed');
    });

    it('should show correct status for archived session', async () => {
      const session = await sessionManager.createSession({
        projectName: 'archived-session'
      });

      await sessionManager.archiveSession(session.id);

      const retrieved = await sessionManager.getSession(session.id);

      expect(retrieved?.status).toBe('archived');
    });

    it('should display tags correctly', async () => {
      const session = await sessionManager.createSession({
        projectName: 'tagged-session',
        tags: ['urgent', 'bug', 'frontend', 'auth']
      });

      const retrieved = await sessionManager.getSession(session.id);

      expect(retrieved?.tags).toEqual(['urgent', 'bug', 'frontend', 'auth']);
    });

    it('should handle session without tags', async () => {
      const session = await sessionManager.createSession({
        projectName: 'no-tags'
      });

      const retrieved = await sessionManager.getSession(session.id);

      expect(retrieved?.tags).toBeUndefined();
    });

    it('should handle session without description', async () => {
      const session = await sessionManager.createSession({
        projectName: 'no-description'
      });

      const retrieved = await sessionManager.getSession(session.id);

      expect(retrieved?.description).toBeUndefined();
    });
  });

  describe('large conversation handling', () => {
    it('should retrieve session with many messages', async () => {
      const session = await sessionManager.createSession({
        projectName: 'large-conversation'
      });

      // Add 100 messages
      for (let i = 1; i <= 100; i++) {
        await sessionManager.addMessage(
          session.id,
          i % 2 === 0 ? 'user' : 'assistant',
          `Message ${i}`
        );
      }

      const retrieved = await sessionManager.getSession(session.id);

      expect(retrieved?.messages.length).toBe(100);
      expect(retrieved?.messages[0].content).toBe('Message 1');
      expect(retrieved?.messages[99].content).toBe('Message 100');
    });

    it('should handle very long individual messages', async () => {
      const session = await sessionManager.createSession({
        projectName: 'long-message'
      });

      const veryLongMessage = 'A'.repeat(10000);
      await sessionManager.addMessage(session.id, 'user', veryLongMessage);

      const retrieved = await sessionManager.getSession(session.id);

      expect(retrieved?.messages[0].content.length).toBe(10000);
      expect(retrieved?.messages[0].content).toBe(veryLongMessage);
    });
  });

  describe('persistence and consistency', () => {
    it('should persist message additions across retrieval', async () => {
      const session = await sessionManager.createSession({
        projectName: 'persistence-test'
      });

      await sessionManager.addMessage(session.id, 'user', 'Message 1');
      
      let retrieved = await sessionManager.getSession(session.id);
      expect(retrieved?.messages.length).toBe(1);

      await sessionManager.addMessage(session.id, 'user', 'Message 2');
      
      retrieved = await sessionManager.getSession(session.id);
      expect(retrieved?.messages.length).toBe(2);
    });

    it('should maintain data integrity after multiple retrievals', async () => {
      const session = await sessionManager.createSession({
        projectName: 'integrity-test',
        description: 'Testing data integrity'
      });

      await sessionManager.addMessage(session.id, 'user', 'Test message');

      // Retrieve multiple times
      const retrieved1 = await sessionManager.getSession(session.id);
      const retrieved2 = await sessionManager.getSession(session.id);
      const retrieved3 = await sessionManager.getSession(session.id);

      expect(retrieved1).toEqual(retrieved2);
      expect(retrieved2).toEqual(retrieved3);
    });

    it('should show updated timestamp after message addition', async () => {
      const session = await sessionManager.createSession({
        projectName: 'timestamp-test'
      });

      const originalUpdated = session.updated;

      await new Promise(resolve => setTimeout(resolve, 10));
      await sessionManager.addMessage(session.id, 'user', 'New message');

      const retrieved = await sessionManager.getSession(session.id);

      expect(retrieved?.updated.getTime()).toBeGreaterThan(originalUpdated.getTime());
    });
  });

  describe('error handling', () => {
    it('should handle corrupted session file gracefully', async () => {
      const session = await sessionManager.createSession({
        projectName: 'test'
      });

      // Corrupt the session file
      const sessionPath = path.join(sessionsDir, `${session.id}.json`);
      await fs.writeFile(sessionPath, '{invalid json}');

      const retrieved = await sessionManager.getSession(session.id);

      expect(retrieved).toBeNull();
    });

    it('should handle missing session file', async () => {
      const retrieved = await sessionManager.getSession('deleted-session-id');

      expect(retrieved).toBeNull();
    });
  });

  describe('relative path calculations', () => {
    it('should compute relative paths for output directories', async () => {
      const session = await sessionManager.createSession({
        projectName: 'path-test'
      });

      const projectOutputDir = path.join(outputsDir, 'path-test');
      await fs.ensureDir(projectOutputDir);

      const relativePath = path.relative(testDir, projectOutputDir);

      expect(relativePath).toBe('.clavix/outputs/path-test');
    });

    it('should compute relative paths for output files', async () => {
      const session = await sessionManager.createSession({
        projectName: 'path-test'
      });

      const projectOutputDir = path.join(outputsDir, 'path-test');
      await fs.ensureDir(projectOutputDir);
      await fs.writeFile(path.join(projectOutputDir, 'output.md'), '# Test');

      const filePath = path.join(projectOutputDir, 'output.md');
      const relativePath = path.relative(testDir, filePath);

      expect(relativePath).toBe('.clavix/outputs/path-test/output.md');
    });
  });
});
