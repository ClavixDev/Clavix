/**
 * Integration tests for the `clavix summarize` workflow
 */

import fs from 'fs-extra';
import * as path from 'path';
import { SessionManager } from '../../src/core/session-manager';
import { ConversationAnalyzer } from '../../src/core/conversation-analyzer';
import { FileSystem } from '../../src/utils/file-system';
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Summarize Workflow', () => {
  const testSessionsDir = path.join(__dirname, '../fixtures/test-summarize-sessions');
  const testOutputDir = path.join(__dirname, '../fixtures/test-summarize-outputs');
  let manager: SessionManager;
  let analyzer: ConversationAnalyzer;

  beforeEach(async () => {
    await fs.remove(testSessionsDir);
    await fs.remove(testOutputDir);
    await fs.ensureDir(testSessionsDir);
    await fs.ensureDir(testOutputDir);
    manager = new SessionManager(testSessionsDir);
    analyzer = new ConversationAnalyzer();
  });

  afterEach(async () => {
    await fs.remove(testSessionsDir);
    await fs.remove(testOutputDir);
  });

  it('should analyze a conversation and generate outputs', async () => {
    // Create a session with conversation
    const session = await manager.createSession({
      projectName: 'todo-app',
      description: 'Planning a todo application',
    });

    await manager.addMessage(session.id, 'user', 'I want to build a todo app');
    await manager.addMessage(session.id, 'user', 'It should have user authentication');
    await manager.addMessage(session.id, 'user', 'Users can create, edit, and delete tasks');
    await manager.addMessage(session.id, 'user', 'Use React and Node.js');

    // Retrieve and analyze
    const retrieved = await manager.getSession(session.id);
    const analysis = analyzer.analyze(retrieved!);

    expect(analysis.keyRequirements.length).toBeGreaterThan(0);
    expect(analysis.technicalConstraints.length).toBeGreaterThan(0);
  });

  it('should generate mini-prd.md file', async () => {
    const session = await manager.createSession({
      projectName: 'api-service',
    });

    await manager.addMessage(session.id, 'user', 'Build a RESTful API for user management');
    await manager.addMessage(session.id, 'user', 'Include CRUD operations for users');

    const retrieved = await manager.getSession(session.id);
    const analysis = analyzer.analyze(retrieved!);
    const miniPrd = analyzer.generateMiniPrd(retrieved!, analysis);

    const outputPath = path.join(testOutputDir, 'mini-prd.md');
    await FileSystem.writeFileAtomic(outputPath, miniPrd);

    const exists = await fs.pathExists(outputPath);
    expect(exists).toBe(true);

    const content = await fs.readFile(outputPath, 'utf-8');
    expect(content).toContain('# Mini-PRD');
    expect(content).toContain('api-service');
  });

  it('should generate optimized-prompt.md file', async () => {
    const session = await manager.createSession({
      projectName: 'chat-app',
    });

    await manager.addMessage(session.id, 'user', 'Create a real-time chat application');
    await manager.addMessage(session.id, 'user', 'Use WebSockets for real-time communication');

    const retrieved = await manager.getSession(session.id);
    const analysis = analyzer.analyze(retrieved!);
    const optimizedPrompt = analyzer.generateOptimizedPrompt(retrieved!, analysis);

    const outputPath = path.join(testOutputDir, 'optimized-prompt.md');
    await FileSystem.writeFileAtomic(outputPath, optimizedPrompt);

    const exists = await fs.pathExists(outputPath);
    expect(exists).toBe(true);

    const content = await fs.readFile(outputPath, 'utf-8');
    expect(content).toContain('# Development Task');
    expect(content).toContain('chat-app');
  });

  it('should extract requirements from complex conversation', async () => {
    const session = await manager.createSession({
      projectName: 'ecommerce-platform',
    });

    await manager.addMessage(session.id, 'user', 'I need to build an e-commerce platform');
    await manager.addMessage(session.id, 'user', 'Users should be able to browse products');
    await manager.addMessage(session.id, 'user', 'Implement shopping cart functionality');
    await manager.addMessage(session.id, 'user', 'Add payment processing with Stripe');
    await manager.addMessage(session.id, 'user', 'Include order history for users');
    await manager.addMessage(session.id, 'user', 'Use React for frontend and Node.js for backend');
    await manager.addMessage(session.id, 'user', 'Database should be PostgreSQL');

    const retrieved = await manager.getSession(session.id);
    const analysis = analyzer.analyze(retrieved!);

    expect(analysis.keyRequirements.length).toBeGreaterThan(0);
    expect(analysis.technicalConstraints.length).toBeGreaterThan(0);
    expect(analysis.successCriteria.length).toBeGreaterThan(0);
  });

  it('should handle session with technical constraints', async () => {
    const session = await manager.createSession({
      projectName: 'microservice',
    });

    await manager.addMessage(session.id, 'user', 'Create a microservice using TypeScript');
    await manager.addMessage(session.id, 'user', 'Deploy with Docker and Kubernetes');
    await manager.addMessage(session.id, 'user', 'Use MongoDB for data storage');
    await manager.addMessage(session.id, 'user', 'Implement JWT authentication');

    const retrieved = await manager.getSession(session.id);
    const analysis = analyzer.analyze(retrieved!);

    expect(analysis.technicalConstraints.length).toBeGreaterThan(0);

    const constraints = analysis.technicalConstraints.join(' ').toLowerCase();
    expect(constraints).toMatch(/typescript|docker|kubernetes|mongodb|jwt/);
  });

  it('should identify out-of-scope items', async () => {
    const session = await manager.createSession({
      projectName: 'mvp-app',
    });

    await manager.addMessage(session.id, 'user', 'Build a basic user registration system');
    await manager.addMessage(session.id, 'user', "Don't include social media login");
    await manager.addMessage(session.id, 'user', 'Skip email verification for now');

    const retrieved = await manager.getSession(session.id);
    const analysis = analyzer.analyze(retrieved!);

    expect(analysis.outOfScope.length).toBeGreaterThan(0);
  });

  it('should summarize active session', async () => {
    // Create multiple sessions
    const oldSession = await manager.createSession({
      projectName: 'old-project',
    });
    await manager.completeSession(oldSession.id);

    const activeSession = await manager.createSession({
      projectName: 'active-project',
    });
    await manager.addMessage(activeSession.id, 'user', 'Build something awesome');

    // Get active session
    const active = await manager.getActiveSession();
    expect(active).toBeDefined();
    expect(active!.projectName).toBe('active-project');

    // Analyze it
    const analysis = analyzer.analyze(active!);
    expect(analysis.summary).toBeTruthy();
  });

  it('should generate complete workflow output', async () => {
    const session = await manager.createSession({
      projectName: 'complete-workflow',
    });

    await manager.addMessage(session.id, 'user', 'Create a blog platform');
    await manager.addMessage(session.id, 'user', 'Users can write and publish posts');
    await manager.addMessage(session.id, 'user', 'Include comments on posts');
    await manager.addMessage(session.id, 'user', 'Must support Markdown formatting');

    const retrieved = await manager.getSession(session.id);
    const analysis = analyzer.analyze(retrieved!);

    // Generate both outputs
    const miniPrd = analyzer.generateMiniPrd(retrieved!, analysis);
    const optimizedPrompt = analyzer.generateOptimizedPrompt(retrieved!, analysis);

    const projectDir = path.join(testOutputDir, 'complete-workflow');
    await FileSystem.ensureDir(projectDir);

    await FileSystem.writeFileAtomic(path.join(projectDir, 'mini-prd.md'), miniPrd);
    await FileSystem.writeFileAtomic(path.join(projectDir, 'optimized-prompt.md'), optimizedPrompt);

    // Verify both files exist
    const miniPrdExists = await fs.pathExists(path.join(projectDir, 'mini-prd.md'));
    const promptExists = await fs.pathExists(path.join(projectDir, 'optimized-prompt.md'));

    expect(miniPrdExists).toBe(true);
    expect(promptExists).toBe(true);
  });
});
