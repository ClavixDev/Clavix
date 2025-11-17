/**
 * SessionManager tests
 */

import fs from 'fs-extra';
import * as path from 'path';
import { SessionManager } from '../../src/core/session-manager';
import { Session, SessionStatus } from '../../src/types/session';
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('SessionManager', () => {
  const testSessionsDir = path.join(__dirname, '../fixtures/test-sessions');
  let manager: SessionManager;

  beforeEach(async () => {
    // Clean up test directory
    await fs.remove(testSessionsDir);
    await fs.ensureDir(testSessionsDir);
    manager = new SessionManager(testSessionsDir);
  });

  afterEach(async () => {
    // Clean up after tests
    await fs.remove(testSessionsDir);
  });

  describe('createSession', () => {
    it('should create a new session with default values', async () => {
      const session = await manager.createSession();

      expect(session.id).toBeDefined();
      expect(session.id.length).toBeGreaterThan(0);
      expect(session.projectName).toContain('session-');
      expect(session.agent).toBe('Claude Code');
      expect(session.status).toBe('active');
      expect(session.messages).toEqual([]);
      expect(session.created).toBeInstanceOf(Date);
      expect(session.updated).toBeInstanceOf(Date);
    });

    it('should create a session with custom options', async () => {
      const session = await manager.createSession({
        projectName: 'my-project',
        agent: 'Custom Agent',
        description: 'Test session',
        tags: ['test', 'demo'],
      });

      expect(session.projectName).toBe('my-project');
      expect(session.agent).toBe('Custom Agent');
      expect(session.description).toBe('Test session');
      expect(session.tags).toEqual(['test', 'demo']);
    });

    it('should save the session to disk', async () => {
      const session = await manager.createSession();
      const sessionPath = path.join(testSessionsDir, `${session.id}.json`);

      const exists = await fs.pathExists(sessionPath);
      expect(exists).toBe(true);
    });
  });

  describe('getSession', () => {
    it('should retrieve an existing session', async () => {
      const created = await manager.createSession({
        projectName: 'test-project',
      });

      const retrieved = await manager.getSession(created.id);

      expect(retrieved).toBeDefined();
      expect(retrieved!.id).toBe(created.id);
      expect(retrieved!.projectName).toBe('test-project');
    });

    it('should return null for non-existent session', async () => {
      const session = await manager.getSession('non-existent-id');
      expect(session).toBeNull();
    });

    it('should deserialize dates correctly', async () => {
      const created = await manager.createSession();
      const retrieved = await manager.getSession(created.id);

      expect(retrieved!.created).toBeInstanceOf(Date);
      expect(retrieved!.updated).toBeInstanceOf(Date);
    });
  });

  describe('updateSession', () => {
    it('should update session fields', async () => {
      const session = await manager.createSession({
        projectName: 'original',
      });

      const updated = await manager.updateSession(session.id, {
        projectName: 'updated',
        description: 'New description',
      });

      expect(updated).toBeDefined();
      expect(updated!.projectName).toBe('updated');
      expect(updated!.description).toBe('New description');
      expect(updated!.id).toBe(session.id);
    });

    it('should update the updated timestamp', async () => {
      const session = await manager.createSession();
      const originalUpdated = session.updated;

      // Wait a bit to ensure timestamp difference
      await new Promise((resolve) => setTimeout(resolve, 10));

      const updated = await manager.updateSession(session.id, {
        description: 'Updated',
      });

      expect(updated!.updated.getTime()).toBeGreaterThan(
        originalUpdated.getTime()
      );
    });

    it('should return null for non-existent session', async () => {
      const updated = await manager.updateSession('non-existent', {
        description: 'Test',
      });
      expect(updated).toBeNull();
    });

    it('should not allow updating id or created timestamp', async () => {
      const session = await manager.createSession();
      const originalId = session.id;
      const originalCreated = session.created;

      const updated = await manager.updateSession(session.id, {
        projectName: 'updated',
      });

      expect(updated!.id).toBe(originalId);
      expect(updated!.created).toEqual(originalCreated);
    });
  });

  describe('deleteSession', () => {
    it('should delete an existing session', async () => {
      const session = await manager.createSession();
      const deleted = await manager.deleteSession(session.id);

      expect(deleted).toBe(true);

      const retrieved = await manager.getSession(session.id);
      expect(retrieved).toBeNull();
    });

    it('should return false for non-existent session', async () => {
      const deleted = await manager.deleteSession('non-existent');
      expect(deleted).toBe(false);
    });
  });

  describe('addMessage', () => {
    it('should add a user message', async () => {
      const session = await manager.createSession();

      const updated = await manager.addMessage(
        session.id,
        'user',
        'Hello, Claude!'
      );

      expect(updated).toBeDefined();
      expect(updated!.messages.length).toBe(1);
      expect(updated!.messages[0].role).toBe('user');
      expect(updated!.messages[0].content).toBe('Hello, Claude!');
      expect(updated!.messages[0].timestamp).toBeInstanceOf(Date);
    });

    it('should add an assistant message', async () => {
      const session = await manager.createSession();

      await manager.addMessage(session.id, 'user', 'Hello');
      const updated = await manager.addMessage(
        session.id,
        'assistant',
        'Hi there!'
      );

      expect(updated!.messages.length).toBe(2);
      expect(updated!.messages[1].role).toBe('assistant');
      expect(updated!.messages[1].content).toBe('Hi there!');
    });

    it('should update the session timestamp', async () => {
      const session = await manager.createSession();
      const originalUpdated = session.updated;

      await new Promise((resolve) => setTimeout(resolve, 10));

      const updated = await manager.addMessage(session.id, 'user', 'Test');

      expect(updated!.updated.getTime()).toBeGreaterThan(
        originalUpdated.getTime()
      );
    });

    it('should return null for non-existent session', async () => {
      const result = await manager.addMessage(
        'non-existent',
        'user',
        'Test'
      );
      expect(result).toBeNull();
    });

    it('should persist messages across reads', async () => {
      const session = await manager.createSession();

      await manager.addMessage(session.id, 'user', 'Message 1');
      await manager.addMessage(session.id, 'assistant', 'Message 2');
      await manager.addMessage(session.id, 'user', 'Message 3');

      const retrieved = await manager.getSession(session.id);

      expect(retrieved!.messages.length).toBe(3);
      expect(retrieved!.messages[0].content).toBe('Message 1');
      expect(retrieved!.messages[1].content).toBe('Message 2');
      expect(retrieved!.messages[2].content).toBe('Message 3');
    });
  });

  describe('listSessions', () => {
    it('should list all sessions', async () => {
      await manager.createSession({ projectName: 'project-1' });
      await manager.createSession({ projectName: 'project-2' });
      await manager.createSession({ projectName: 'project-3' });

      const sessions = await manager.listSessions();

      expect(sessions.length).toBe(3);
    });

    it('should return empty array when no sessions exist', async () => {
      const sessions = await manager.listSessions();
      expect(sessions).toEqual([]);
    });

    it('should include metadata in listings', async () => {
      const session = await manager.createSession({
        projectName: 'test-project',
        tags: ['test'],
        description: 'Test description',
      });

      await manager.addMessage(session.id, 'user', 'Test message');

      const sessions = await manager.listSessions();

      expect(sessions[0].id).toBe(session.id);
      expect(sessions[0].projectName).toBe('test-project');
      expect(sessions[0].messageCount).toBe(1);
      expect(sessions[0].tags).toEqual(['test']);
      expect(sessions[0].description).toBe('Test description');
    });

    it('should sort by updated date (most recent first)', async () => {
      const session1 = await manager.createSession({ projectName: 'old' });
      await new Promise((resolve) => setTimeout(resolve, 10));

      const session2 = await manager.createSession({ projectName: 'new' });
      await new Promise((resolve) => setTimeout(resolve, 10));

      const session3 = await manager.createSession({ projectName: 'newest' });

      const sessions = await manager.listSessions();

      expect(sessions[0].projectName).toBe('newest');
      expect(sessions[1].projectName).toBe('new');
      expect(sessions[2].projectName).toBe('old');
    });

    it('should filter by status', async () => {
      const active = await manager.createSession({ projectName: 'active' });
      const completed = await manager.createSession({
        projectName: 'completed',
      });
      await manager.completeSession(completed.id);

      const activeSessions = await manager.listSessions({ status: 'active' });
      const completedSessions = await manager.listSessions({
        status: 'completed',
      });

      expect(activeSessions.length).toBe(1);
      expect(activeSessions[0].projectName).toBe('active');

      expect(completedSessions.length).toBe(1);
      expect(completedSessions[0].projectName).toBe('completed');
    });

    it('should filter by project name', async () => {
      await manager.createSession({ projectName: 'project-a' });
      await manager.createSession({ projectName: 'project-b' });
      await manager.createSession({ projectName: 'project-a' });

      const filtered = await manager.listSessions({
        projectName: 'project-a',
      });

      expect(filtered.length).toBe(2);
      expect(filtered.every((s) => s.projectName === 'project-a')).toBe(true);
    });

    it('should filter by agent', async () => {
      await manager.createSession({ agent: 'Claude Code' });
      await manager.createSession({ agent: 'Custom Agent' });

      const filtered = await manager.listSessions({ agent: 'Custom Agent' });

      expect(filtered.length).toBe(1);
      expect(filtered[0].agent).toBe('Custom Agent');
    });

    it('should filter by tags', async () => {
      await manager.createSession({ tags: ['urgent', 'bug'] });
      await manager.createSession({ tags: ['feature'] });
      await manager.createSession({ tags: ['urgent', 'feature'] });

      const filtered = await manager.listSessions({ tags: ['urgent'] });

      expect(filtered.length).toBe(2);
    });

    it('should filter by date range', async () => {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      await manager.createSession({ projectName: 'today' });

      const filtered = await manager.listSessions({
        startDate: yesterday,
        endDate: tomorrow,
      });

      expect(filtered.length).toBe(1);
    });
  });

  describe('searchSessions', () => {
    beforeEach(async () => {
      await manager.createSession({
        projectName: 'ecommerce-app',
        description: 'Building an online store',
        tags: ['typescript', 'react'],
      });

      const chatSession = await manager.createSession({
        projectName: 'chat-application',
        description: 'Real-time messaging app',
      });

      await manager.addMessage(
        chatSession.id,
        'user',
        'How do I implement WebSockets?'
      );

      await manager.createSession({
        projectName: 'data-pipeline',
        tags: ['python', 'data-science'],
      });
    });

    it('should search by project name', async () => {
      const results = await manager.searchSessions('ecommerce');

      expect(results.length).toBe(1);
      expect(results[0].projectName).toBe('ecommerce-app');
    });

    it('should search by description', async () => {
      const results = await manager.searchSessions('online store');

      expect(results.length).toBe(1);
      expect(results[0].projectName).toBe('ecommerce-app');
    });

    it('should search by tags', async () => {
      const results = await manager.searchSessions('typescript');

      expect(results.length).toBe(1);
      expect(results[0].projectName).toBe('ecommerce-app');
    });

    it('should search in message content', async () => {
      const results = await manager.searchSessions('WebSockets');

      expect(results.length).toBe(1);
      expect(results[0].projectName).toBe('chat-application');
    });

    it('should be case-insensitive', async () => {
      const results = await manager.searchSessions('ECOMMERCE');

      expect(results.length).toBe(1);
      expect(results[0].projectName).toBe('ecommerce-app');
    });

    it('should return empty array for no matches', async () => {
      const results = await manager.searchSessions('nonexistent');
      expect(results).toEqual([]);
    });

    it('should sort results by updated date', async () => {
      const results = await manager.searchSessions('app');

      expect(results.length).toBeGreaterThan(0);
      // Verify sorting
      for (let i = 0; i < results.length - 1; i++) {
        const current = new Date(results[i].updated);
        const next = new Date(results[i + 1].updated);
        expect(current.getTime()).toBeGreaterThanOrEqual(next.getTime());
      }
    });
  });

  describe('getActiveSession', () => {
    it('should return the most recent active session', async () => {
      const old = await manager.createSession({ projectName: 'old-active' });
      await new Promise((resolve) => setTimeout(resolve, 10));

      const recent = await manager.createSession({
        projectName: 'recent-active',
      });

      const active = await manager.getActiveSession();

      expect(active).toBeDefined();
      expect(active!.projectName).toBe('recent-active');
    });

    it('should return null if no active sessions exist', async () => {
      const session = await manager.createSession();
      await manager.completeSession(session.id);

      const active = await manager.getActiveSession();
      expect(active).toBeNull();
    });

    it('should ignore completed and archived sessions', async () => {
      const active = await manager.createSession({ projectName: 'active' });

      const completed = await manager.createSession({
        projectName: 'completed',
      });
      await manager.completeSession(completed.id);

      const archived = await manager.createSession({
        projectName: 'archived',
      });
      await manager.archiveSession(archived.id);

      const result = await manager.getActiveSession();

      expect(result).toBeDefined();
      expect(result!.projectName).toBe('active');
    });
  });

  describe('completeSession', () => {
    it('should mark a session as completed', async () => {
      const session = await manager.createSession();

      const completed = await manager.completeSession(session.id);

      expect(completed).toBeDefined();
      expect(completed!.status).toBe('completed');
    });

    it('should return null for non-existent session', async () => {
      const result = await manager.completeSession('non-existent');
      expect(result).toBeNull();
    });
  });

  describe('archiveSession', () => {
    it('should mark a session as archived', async () => {
      const session = await manager.createSession();

      const archived = await manager.archiveSession(session.id);

      expect(archived).toBeDefined();
      expect(archived!.status).toBe('archived');
    });

    it('should return null for non-existent session', async () => {
      const result = await manager.archiveSession('non-existent');
      expect(result).toBeNull();
    });
  });
});
