/**
 * Integration tests for the `clavix start` workflow
 */

import fs from 'fs-extra';
import * as path from 'path';
import { SessionManager } from '../../src/core/session-manager';
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Start Command Workflow', () => {
  const testSessionsDir = path.join(__dirname, '../fixtures/test-start-sessions');
  let manager: SessionManager;

  beforeEach(async () => {
    await fs.remove(testSessionsDir);
    await fs.ensureDir(testSessionsDir);
    manager = new SessionManager(testSessionsDir);
  });

  afterEach(async () => {
    await fs.remove(testSessionsDir);
  });

  it('should create a session and track conversation', async () => {
    // Simulate the start command workflow
    const session = await manager.createSession({
      projectName: 'test-conversation',
      description: 'Testing conversational mode',
    });

    expect(session.id).toBeDefined();
    expect(session.projectName).toBe('test-conversation');
    expect(session.status).toBe('active');
    expect(session.messages.length).toBe(0);

    // Simulate user entering messages
    await manager.addMessage(
      session.id,
      'user',
      'I want to build a todo app'
    );

    await manager.addMessage(
      session.id,
      'user',
      'It should have user authentication'
    );

    await manager.addMessage(
      session.id,
      'user',
      'And real-time sync across devices'
    );

    // Retrieve the session
    const retrieved = await manager.getSession(session.id);

    expect(retrieved).toBeDefined();
    expect(retrieved!.messages.length).toBe(3);
    expect(retrieved!.messages[0].role).toBe('user');
    expect(retrieved!.messages[0].content).toBe('I want to build a todo app');
    expect(retrieved!.messages[1].content).toBe('It should have user authentication');
    expect(retrieved!.messages[2].content).toBe('And real-time sync across devices');
  });

  it('should save session with custom options', async () => {
    const session = await manager.createSession({
      projectName: 'ecommerce-platform',
      description: 'Planning an ecommerce system',
      tags: ['urgent', 'complex'],
    });

    await manager.addMessage(
      session.id,
      'user',
      'We need a shopping cart system'
    );

    const retrieved = await manager.getSession(session.id);

    expect(retrieved!.projectName).toBe('ecommerce-platform');
    expect(retrieved!.description).toBe('Planning an ecommerce system');
    expect(retrieved!.tags).toEqual(['urgent', 'complex']);
    expect(retrieved!.messages.length).toBe(1);
  });

  it('should persist session to disk', async () => {
    const session = await manager.createSession({
      projectName: 'test-persistence',
    });

    await manager.addMessage(session.id, 'user', 'Test message 1');
    await manager.addMessage(session.id, 'user', 'Test message 2');

    // Verify file exists
    const sessionPath = path.join(testSessionsDir, `${session.id}.json`);
    const exists = await fs.pathExists(sessionPath);
    expect(exists).toBe(true);

    // Read and verify file content
    const fileContent = await fs.readJSON(sessionPath);
    expect(fileContent.id).toBe(session.id);
    expect(fileContent.projectName).toBe('test-persistence');
    expect(fileContent.messages.length).toBe(2);
  });

  it('should track conversation timestamps', async () => {
    const session = await manager.createSession();

    const beforeMessage = new Date();
    await manager.addMessage(session.id, 'user', 'First message');
    const afterMessage = new Date();

    const retrieved = await manager.getSession(session.id);
    const messageTime = retrieved!.messages[0].timestamp;

    expect(messageTime.getTime()).toBeGreaterThanOrEqual(beforeMessage.getTime());
    expect(messageTime.getTime()).toBeLessThanOrEqual(afterMessage.getTime());
  });

  it('should update session timestamp on each message', async () => {
    const session = await manager.createSession();
    const originalUpdated = session.updated;

    // Wait a bit to ensure timestamp difference
    await new Promise((resolve) => setTimeout(resolve, 10));

    await manager.addMessage(session.id, 'user', 'New message');

    const updated = await manager.getSession(session.id);
    expect(updated!.updated.getTime()).toBeGreaterThan(originalUpdated.getTime());
  });

  it('should handle multi-turn conversation', async () => {
    const session = await manager.createSession({
      projectName: 'chat-app',
    });

    // Simulate a conversation
    await manager.addMessage(session.id, 'user', 'How do I implement WebSockets?');
    await manager.addMessage(session.id, 'user', 'What about authentication?');
    await manager.addMessage(session.id, 'user', 'Should I use Redis for session storage?');
    await manager.addMessage(session.id, 'user', 'What about horizontal scaling?');

    const retrieved = await manager.getSession(session.id);

    expect(retrieved!.messages.length).toBe(4);
    expect(retrieved!.messages.map((m) => m.role)).toEqual([
      'user',
      'user',
      'user',
      'user',
    ]);
  });

  it('should allow completing a session after conversation', async () => {
    const session = await manager.createSession({
      projectName: 'completed-chat',
    });

    await manager.addMessage(session.id, 'user', 'Message 1');
    await manager.addMessage(session.id, 'user', 'Message 2');

    // Complete the session (simulating exit)
    const completed = await manager.completeSession(session.id);

    expect(completed).toBeDefined();
    expect(completed!.status).toBe('completed');
    expect(completed!.messages.length).toBe(2);
  });

  it('should be findable in session listings', async () => {
    const session1 = await manager.createSession({
      projectName: 'project-a',
    });
    await manager.addMessage(session1.id, 'user', 'Message in project A');

    const session2 = await manager.createSession({
      projectName: 'project-b',
    });
    await manager.addMessage(session2.id, 'user', 'Message in project B');

    const allSessions = await manager.listSessions();
    expect(allSessions.length).toBe(2);

    const filtered = await manager.listSessions({ projectName: 'project-a' });
    expect(filtered.length).toBe(1);
    expect(filtered[0].projectName).toBe('project-a');
    expect(filtered[0].messageCount).toBe(1);
  });

  it('should be searchable by message content', async () => {
    const session = await manager.createSession({
      projectName: 'searchable-session',
    });

    await manager.addMessage(
      session.id,
      'user',
      'I need to implement OAuth authentication'
    );

    await manager.addMessage(
      session.id,
      'user',
      'Also need rate limiting'
    );

    const results = await manager.searchSessions('OAuth');
    expect(results.length).toBe(1);
    expect(results[0].id).toBe(session.id);
  });
});
