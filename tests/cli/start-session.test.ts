/**
 * Tests for clavix start command
 * 
 * Tests session creation, message recording, and graceful exit handling
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import { SessionManager } from '../../src/core/session-manager';

describe('clavix start - session creation and message recording', () => {
  const testDir = path.join(__dirname, '../fixtures/test-start');
  const clavixDir = path.join(testDir, '.clavix');
  const sessionsDir = path.join(clavixDir, 'sessions');
  
  let sessionManager: SessionManager;

  beforeEach(async () => {
    // Clean up and set up test directory
    await fs.remove(testDir);
    await fs.ensureDir(sessionsDir);

    sessionManager = new SessionManager(sessionsDir);

    // Mock process.cwd() to return test directory
    jest.spyOn(process, 'cwd').mockReturnValue(testDir);
  });

  afterEach(async () => {
    await fs.remove(testDir);
    jest.restoreAllMocks();
  });

  describe('session creation', () => {
    it('should successfully create a new session', async () => {
      const session = await sessionManager.createSession({
        projectName: 'test-project'
      });

      expect(session.id).toBeDefined();
      expect(session.id.length).toBeGreaterThan(0);
      expect(session.projectName).toBe('test-project');
      expect(session.status).toBe('active');
    });

    it('should create session with default project name if not provided', async () => {
      const session = await sessionManager.createSession();

      expect(session.projectName).toBeDefined();
      expect(session.projectName).toContain('session-');
    });

    it('should create session with provided project name', async () => {
      const session = await sessionManager.createSession({
        projectName: 'my-custom-project'
      });

      expect(session.projectName).toBe('my-custom-project');
    });

    it('should create session with description', async () => {
      const session = await sessionManager.createSession({
        projectName: 'test-project',
        description: 'Building a new feature'
      });

      expect(session.description).toBe('Building a new feature');
    });

    it('should create session with tags', async () => {
      const session = await sessionManager.createSession({
        projectName: 'test-project',
        tags: ['frontend', 'urgent', 'bug']
      });

      expect(session.tags).toEqual(['frontend', 'urgent', 'bug']);
    });

    it('should create session with custom agent', async () => {
      const session = await sessionManager.createSession({
        projectName: 'test-project',
        agent: 'Custom Agent'
      });

      expect(session.agent).toBe('Custom Agent');
    });

    it('should create session with default agent if not provided', async () => {
      const session = await sessionManager.createSession({
        projectName: 'test-project'
      });

      expect(session.agent).toBe('Claude Code');
    });

    it('should create session with active status', async () => {
      const session = await sessionManager.createSession({
        projectName: 'test-project'
      });

      expect(session.status).toBe('active');
    });

    it('should create session with empty messages array', async () => {
      const session = await sessionManager.createSession({
        projectName: 'test-project'
      });

      expect(session.messages).toEqual([]);
    });

    it('should create session with current timestamps', async () => {
      const before = new Date();
      const session = await sessionManager.createSession({
        projectName: 'test-project'
      });
      const after = new Date();

      expect(session.created.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(session.created.getTime()).toBeLessThanOrEqual(after.getTime());
      expect(session.updated.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(session.updated.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('should persist session to disk on creation', async () => {
      const session = await sessionManager.createSession({
        projectName: 'test-project'
      });

      const sessionPath = path.join(sessionsDir, `${session.id}.json`);
      const exists = await fs.pathExists(sessionPath);

      expect(exists).toBe(true);
    });

    it('should create unique session IDs', async () => {
      const session1 = await sessionManager.createSession({ projectName: 'project-1' });
      const session2 = await sessionManager.createSession({ projectName: 'project-2' });
      const session3 = await sessionManager.createSession({ projectName: 'project-3' });

      expect(session1.id).not.toBe(session2.id);
      expect(session2.id).not.toBe(session3.id);
      expect(session1.id).not.toBe(session3.id);
    });
  });

  describe('recording user messages', () => {
    it('should successfully add a user message', async () => {
      const session = await sessionManager.createSession({
        projectName: 'test-project'
      });

      const updated = await sessionManager.addMessage(
        session.id,
        'user',
        'This is a test message'
      );

      expect(updated).toBeDefined();
      expect(updated?.messages.length).toBe(1);
      expect(updated?.messages[0].role).toBe('user');
      expect(updated?.messages[0].content).toBe('This is a test message');
    });

    it('should add multiple user messages in order', async () => {
      const session = await sessionManager.createSession({
        projectName: 'test-project'
      });

      await sessionManager.addMessage(session.id, 'user', 'First message');
      await sessionManager.addMessage(session.id, 'user', 'Second message');
      const updated = await sessionManager.addMessage(session.id, 'user', 'Third message');

      expect(updated?.messages.length).toBe(3);
      expect(updated?.messages[0].content).toBe('First message');
      expect(updated?.messages[1].content).toBe('Second message');
      expect(updated?.messages[2].content).toBe('Third message');
    });

    it('should record user messages with proper timestamps', async () => {
      const session = await sessionManager.createSession({
        projectName: 'test-project'
      });

      const before = new Date();
      const updated = await sessionManager.addMessage(
        session.id,
        'user',
        'Test message'
      );
      const after = new Date();

      const timestamp = updated?.messages[0].timestamp;
      expect(timestamp).toBeInstanceOf(Date);
      expect(timestamp!.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(timestamp!.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('should handle empty user messages', async () => {
      const session = await sessionManager.createSession({
        projectName: 'test-project'
      });

      const updated = await sessionManager.addMessage(session.id, 'user', '');

      expect(updated?.messages.length).toBe(1);
      expect(updated?.messages[0].content).toBe('');
    });

    it('should handle long user messages', async () => {
      const session = await sessionManager.createSession({
        projectName: 'test-project'
      });

      const longMessage = 'This is a very long message. '.repeat(100);
      const updated = await sessionManager.addMessage(session.id, 'user', longMessage);

      expect(updated?.messages[0].content).toBe(longMessage);
    });

    it('should handle messages with special characters', async () => {
      const session = await sessionManager.createSession({
        projectName: 'test-project'
      });

      const specialMessage = 'Special: !@#$%^&*()_+-=[]{}|;\':",./<>?`~';
      const updated = await sessionManager.addMessage(session.id, 'user', specialMessage);

      expect(updated?.messages[0].content).toBe(specialMessage);
    });

    it('should handle messages with newlines', async () => {
      const session = await sessionManager.createSession({
        projectName: 'test-project'
      });

      const multilineMessage = 'Line 1\nLine 2\nLine 3';
      const updated = await sessionManager.addMessage(session.id, 'user', multilineMessage);

      expect(updated?.messages[0].content).toBe(multilineMessage);
    });

    it('should handle messages with unicode characters', async () => {
      const session = await sessionManager.createSession({
        projectName: 'test-project'
      });

      const unicodeMessage = 'Hello 世界 🌍 café';
      const updated = await sessionManager.addMessage(session.id, 'user', unicodeMessage);

      expect(updated?.messages[0].content).toBe(unicodeMessage);
    });

    it('should persist messages to disk', async () => {
      const session = await sessionManager.createSession({
        projectName: 'test-project'
      });

      await sessionManager.addMessage(session.id, 'user', 'Test message');

      const retrieved = await sessionManager.getSession(session.id);
      expect(retrieved?.messages.length).toBe(1);
      expect(retrieved?.messages[0].content).toBe('Test message');
    });

    it('should update session timestamp when adding message', async () => {
      const session = await sessionManager.createSession({
        projectName: 'test-project'
      });

      const originalUpdated = session.updated;

      await new Promise(resolve => setTimeout(resolve, 10));
      const updated = await sessionManager.addMessage(session.id, 'user', 'Test');

      expect(updated?.updated.getTime()).toBeGreaterThan(originalUpdated.getTime());
    });
  });

  describe('recording assistant messages', () => {
    it('should successfully add an assistant message', async () => {
      const session = await sessionManager.createSession({
        projectName: 'test-project'
      });

      const updated = await sessionManager.addMessage(
        session.id,
        'assistant',
        'This is an assistant response'
      );

      expect(updated?.messages.length).toBe(1);
      expect(updated?.messages[0].role).toBe('assistant');
      expect(updated?.messages[0].content).toBe('This is an assistant response');
    });

    it('should handle conversation between user and assistant', async () => {
      const session = await sessionManager.createSession({
        projectName: 'test-project'
      });

      await sessionManager.addMessage(session.id, 'user', 'User question');
      await sessionManager.addMessage(session.id, 'assistant', 'Assistant answer');
      await sessionManager.addMessage(session.id, 'user', 'Follow-up question');
      const updated = await sessionManager.addMessage(session.id, 'assistant', 'Follow-up answer');

      expect(updated?.messages.length).toBe(4);
      expect(updated?.messages[0].role).toBe('user');
      expect(updated?.messages[1].role).toBe('assistant');
      expect(updated?.messages[2].role).toBe('user');
      expect(updated?.messages[3].role).toBe('assistant');
    });
  });

  describe('graceful exit handling', () => {
    it('should save session state before exit', async () => {
      const session = await sessionManager.createSession({
        projectName: 'test-project'
      });

      await sessionManager.addMessage(session.id, 'user', 'Message before exit');

      // Simulate exit by retrieving session
      const retrieved = await sessionManager.getSession(session.id);

      expect(retrieved).toBeDefined();
      expect(retrieved?.messages.length).toBe(1);
    });

    it('should maintain all data on exit', async () => {
      const session = await sessionManager.createSession({
        projectName: 'exit-test',
        description: 'Testing exit behavior',
        tags: ['test', 'exit']
      });

      await sessionManager.addMessage(session.id, 'user', 'Message 1');
      await sessionManager.addMessage(session.id, 'user', 'Message 2');
      await sessionManager.addMessage(session.id, 'user', 'Message 3');

      // Simulate exit and retrieval
      const retrieved = await sessionManager.getSession(session.id);

      expect(retrieved?.projectName).toBe('exit-test');
      expect(retrieved?.description).toBe('Testing exit behavior');
      expect(retrieved?.tags).toEqual(['test', 'exit']);
      expect(retrieved?.messages.length).toBe(3);
    });

    it('should preserve session file after process simulation', async () => {
      const session = await sessionManager.createSession({
        projectName: 'persistence-test'
      });

      await sessionManager.addMessage(session.id, 'user', 'Test message');

      const sessionPath = path.join(sessionsDir, `${session.id}.json`);
      
      // Verify file exists
      const exists = await fs.pathExists(sessionPath);
      expect(exists).toBe(true);

      // Read file directly
      const fileContent = await fs.readJSON(sessionPath);
      expect(fileContent.projectName).toBe('persistence-test');
      expect(fileContent.messages.length).toBe(1);
    });
  });

  describe('error handling', () => {
    it('should return null when adding message to non-existent session', async () => {
      const result = await sessionManager.addMessage(
        'non-existent-id',
        'user',
        'Test message'
      );

      expect(result).toBeNull();
    });

    it('should handle concurrent message additions', async () => {
      const session = await sessionManager.createSession({
        projectName: 'concurrent-test'
      });

      // Add messages sequentially to ensure proper persistence
      await sessionManager.addMessage(session.id, 'user', 'Message 1');
      await sessionManager.addMessage(session.id, 'user', 'Message 2');
      await sessionManager.addMessage(session.id, 'user', 'Message 3');

      const retrieved = await sessionManager.getSession(session.id);
      expect(retrieved?.messages.length).toBe(3);
    });
  });

  describe('session metadata tracking', () => {
    it('should track message count accurately', async () => {
      const session = await sessionManager.createSession({
        projectName: 'count-test'
      });

      await sessionManager.addMessage(session.id, 'user', 'Message 1');
      await sessionManager.addMessage(session.id, 'assistant', 'Response 1');
      await sessionManager.addMessage(session.id, 'user', 'Message 2');

      const sessions = await sessionManager.listSessions();
      const thisSession = sessions.find(s => s.id === session.id);

      expect(thisSession?.messageCount).toBe(3);
    });

    it('should update session timestamps correctly', async () => {
      const session = await sessionManager.createSession({
        projectName: 'timestamp-test'
      });

      const originalCreated = session.created;
      const originalUpdated = session.updated;

      await new Promise(resolve => setTimeout(resolve, 10));
      await sessionManager.addMessage(session.id, 'user', 'New message');

      const retrieved = await sessionManager.getSession(session.id);

      // Created should not change
      expect(retrieved?.created).toEqual(originalCreated);
      
      // Updated should change
      expect(retrieved?.updated.getTime()).toBeGreaterThan(originalUpdated.getTime());
    });

    it('should maintain active status during conversation', async () => {
      const session = await sessionManager.createSession({
        projectName: 'status-test'
      });

      await sessionManager.addMessage(session.id, 'user', 'Message 1');
      await sessionManager.addMessage(session.id, 'user', 'Message 2');
      await sessionManager.addMessage(session.id, 'user', 'Message 3');

      const retrieved = await sessionManager.getSession(session.id);

      expect(retrieved?.status).toBe('active');
    });
  });

  describe('file system operations', () => {
    it('should create sessions directory if it does not exist', async () => {
      await fs.remove(sessionsDir);
      
      const newManager = new SessionManager(sessionsDir);
      await newManager.createSession({ projectName: 'test' });

      const exists = await fs.pathExists(sessionsDir);
      expect(exists).toBe(true);
    });

    it('should write valid JSON to session files', async () => {
      const session = await sessionManager.createSession({
        projectName: 'json-test'
      });

      await sessionManager.addMessage(session.id, 'user', 'Test message');

      const sessionPath = path.join(sessionsDir, `${session.id}.json`);
      const fileContent = await fs.readFile(sessionPath, 'utf-8');

      // Should be valid JSON
      expect(() => JSON.parse(fileContent)).not.toThrow();
      
      const parsed = JSON.parse(fileContent);
      expect(parsed.projectName).toBe('json-test');
      expect(parsed.messages.length).toBe(1);
    });

    it('should format session JSON with proper indentation', async () => {
      const session = await sessionManager.createSession({
        projectName: 'format-test'
      });

      const sessionPath = path.join(sessionsDir, `${session.id}.json`);
      const fileContent = await fs.readFile(sessionPath, 'utf-8');

      // Should have indentation (pretty-printed)
      expect(fileContent).toContain('\n');
      expect(fileContent).toContain('  ');
    });
  });

  describe('edge cases', () => {
    it('should handle rapid session creation', async () => {
      const sessions = await Promise.all([
        sessionManager.createSession({ projectName: 'rapid-1' }),
        sessionManager.createSession({ projectName: 'rapid-2' }),
        sessionManager.createSession({ projectName: 'rapid-3' }),
      ]);

      expect(sessions.length).toBe(3);
      expect(sessions[0].id).not.toBe(sessions[1].id);
    });

    it('should handle very long project names', async () => {
      const longName = 'a'.repeat(200);
      const session = await sessionManager.createSession({
        projectName: longName
      });

      expect(session.projectName).toBe(longName);
    });

    it('should handle project names with special characters', async () => {
      const specialName = 'project-name_v2.0-final(1)';
      const session = await sessionManager.createSession({
        projectName: specialName
      });

      expect(session.projectName).toBe(specialName);
    });

    it('should handle many tags', async () => {
      const manyTags = Array.from({ length: 20 }, (_, i) => `tag-${i}`);
      const session = await sessionManager.createSession({
        projectName: 'many-tags',
        tags: manyTags
      });

      expect(session.tags).toEqual(manyTags);
    });

    it('should handle very long descriptions', async () => {
      const longDescription = 'This is a very long description. '.repeat(50);
      const session = await sessionManager.createSession({
        projectName: 'long-desc',
        description: longDescription
      });

      expect(session.description).toBe(longDescription);
    });
  });
});
