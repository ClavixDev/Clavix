/**
 * Critical Path Tests: Session Lifecycle
 *
 * Tests the complete session management flow:
 * Create Session -> Add Messages -> List/Filter -> Retrieve -> Complete/Archive
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mock dependencies
jest.unstable_mockModule('inquirer', () => ({
  default: {
    prompt: jest.fn(),
  },
}));

const { SessionManager } = await import('../../src/core/session-manager.js');

describe('Critical Path: Session Lifecycle', () => {
  const testDir = path.join(__dirname, '../tmp/session-lifecycle-test');
  const sessionsDir = path.join(testDir, '.clavix', 'sessions');
  let sessionManager: InstanceType<typeof SessionManager>;

  beforeEach(async () => {
    await fs.ensureDir(sessionsDir);
    process.chdir(testDir);
    sessionManager = new SessionManager(sessionsDir);
    jest.clearAllMocks();
  });

  afterEach(async () => {
    process.chdir(__dirname);
    await fs.remove(testDir);
  });

  describe('session creation', () => {
    it('should create a new session', async () => {
      const session = await sessionManager.createSession({
        projectName: 'Test Session',
      });

      expect(session).toBeDefined();
      expect(session.projectName).toBe('Test Session');
      expect(session.id).toBeDefined();
      expect(session.created).toBeDefined();
      expect(session.messages).toEqual([]);
    });

    it('should create session file on disk', async () => {
      const session = await sessionManager.createSession({
        projectName: 'Disk Test',
      });

      const sessionPath = path.join(sessionsDir, `${session.id}.json`);
      const exists = await fs.pathExists(sessionPath);

      expect(exists).toBe(true);
    });

    it('should generate unique session IDs', async () => {
      const session1 = await sessionManager.createSession({
        projectName: 'Session 1',
      });
      const session2 = await sessionManager.createSession({
        projectName: 'Session 2',
      });

      expect(session1.id).not.toBe(session2.id);
    });

    it('should create session with default project name', async () => {
      const session = await sessionManager.createSession();

      expect(session.projectName).toBeDefined();
      expect(typeof session.projectName).toBe('string');
    });
  });

  describe('session retrieval', () => {
    it('should retrieve session by ID', async () => {
      const created = await sessionManager.createSession({
        projectName: 'Retrieve Test',
      });

      const retrieved = await sessionManager.getSession(created.id);

      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(created.id);
      expect(retrieved?.projectName).toBe('Retrieve Test');
    });

    it('should return null for non-existent session', async () => {
      const retrieved = await sessionManager.getSession('non-existent-id');
      expect(retrieved).toBeNull();
    });
  });

  describe('session listing', () => {
    it('should list all sessions', async () => {
      await sessionManager.createSession({ projectName: 'Session A' });
      await sessionManager.createSession({ projectName: 'Session B' });
      await sessionManager.createSession({ projectName: 'Session C' });

      const sessions = await sessionManager.listSessions();

      expect(sessions).toHaveLength(3);
    });

    it('should return empty array when no sessions exist', async () => {
      const sessions = await sessionManager.listSessions();
      expect(sessions).toEqual([]);
    });
  });

  describe('session updating', () => {
    it('should update session properties', async () => {
      const session = await sessionManager.createSession({
        projectName: 'Original',
      });

      const updated = await sessionManager.updateSession(session.id, {
        description: 'Updated description',
      });

      expect(updated?.description).toBe('Updated description');
    });

    it('should return null when updating non-existent session', async () => {
      const updated = await sessionManager.updateSession('fake-id', {
        description: 'Test',
      });

      expect(updated).toBeNull();
    });
  });

  describe('session status management', () => {
    it('should create session with active status', async () => {
      const session = await sessionManager.createSession({
        projectName: 'Active Test',
      });

      expect(session.status).toBe('active');
    });

    it('should update session status', async () => {
      const session = await sessionManager.createSession({
        projectName: 'Status Test',
      });

      const updated = await sessionManager.updateSession(session.id, {
        status: 'completed',
      });

      expect(updated?.status).toBe('completed');
    });
  });

  describe('session deletion', () => {
    it('should delete session', async () => {
      const session = await sessionManager.createSession({
        projectName: 'Delete Test',
      });
      await sessionManager.deleteSession(session.id);

      const retrieved = await sessionManager.getSession(session.id);
      expect(retrieved).toBeNull();

      const sessionPath = path.join(sessionsDir, `${session.id}.json`);
      const exists = await fs.pathExists(sessionPath);
      expect(exists).toBe(false);
    });

    it('should return false when deleting non-existent session', async () => {
      const result = await sessionManager.deleteSession('fake-id');
      expect(result).toBe(false);
    });
  });

  describe('full lifecycle integration', () => {
    it('should complete full session lifecycle', async () => {
      // 1. Create session
      const session = await sessionManager.createSession({
        projectName: 'Full Lifecycle Test',
      });
      expect(session.status).toBe('active');

      // 2. Verify listing
      const allSessions = await sessionManager.listSessions();
      expect(allSessions.some((s) => s.id === session.id)).toBe(true);

      // 3. Retrieve and verify
      const retrieved = await sessionManager.getSession(session.id);
      expect(retrieved?.projectName).toBe('Full Lifecycle Test');

      // 4. Update session
      const updated = await sessionManager.updateSession(session.id, {
        status: 'completed',
        description: 'Session completed',
      });
      expect(updated?.status).toBe('completed');

      // 5. Delete session
      await sessionManager.deleteSession(session.id);
      const deleted = await sessionManager.getSession(session.id);
      expect(deleted).toBeNull();
    });

    it('should handle multiple concurrent sessions', async () => {
      // Create multiple sessions
      const session1 = await sessionManager.createSession({
        projectName: 'Session 1',
      });
      const session2 = await sessionManager.createSession({
        projectName: 'Session 2',
      });
      const session3 = await sessionManager.createSession({
        projectName: 'Session 3',
      });

      // Verify isolation
      const s1 = await sessionManager.getSession(session1.id);
      const s2 = await sessionManager.getSession(session2.id);
      const s3 = await sessionManager.getSession(session3.id);

      expect(s1?.projectName).toBe('Session 1');
      expect(s2?.projectName).toBe('Session 2');
      expect(s3?.projectName).toBe('Session 3');
    });
  });

  describe('error handling', () => {
    it('should handle corrupted session file gracefully', async () => {
      // Create a corrupted session file
      const corruptedPath = path.join(sessionsDir, 'corrupted.json');
      await fs.writeFile(corruptedPath, 'not valid json {{{');

      // Should return null for corrupted session
      const session = await sessionManager.getSession('corrupted');
      expect(session).toBeNull();
    });

    it('should handle empty session ID', async () => {
      const session = await sessionManager.getSession('');
      expect(session).toBeNull();
    });
  });

  describe('session metadata', () => {
    it('should store agent information', async () => {
      const session = await sessionManager.createSession({
        projectName: 'Agent Test',
        agent: 'Claude Code',
      });

      expect(session.agent).toBe('Claude Code');
    });

    it('should store tags', async () => {
      const session = await sessionManager.createSession({
        projectName: 'Tags Test',
        tags: ['test', 'important'],
      });

      expect(session.tags).toEqual(['test', 'important']);
    });

    it('should store description', async () => {
      const session = await sessionManager.createSession({
        projectName: 'Description Test',
        description: 'This is a test session',
      });

      expect(session.description).toBe('This is a test session');
    });
  });
});
