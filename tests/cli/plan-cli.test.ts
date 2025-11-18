import fs from 'fs-extra';
import * as path from 'path';
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import Plan from '../../src/cli/commands/plan';
import { TaskManager } from '../../src/core/task-manager';
import { SessionManager } from '../../src/core/session-manager';

const originalCwd = process.cwd();

const getPlanPrototype = () => Plan.prototype as unknown as Record<string, any>;

describe('Plan command helper behavior', () => {
  let testDir: string;

  beforeEach(async () => {
    testDir = path.join(originalCwd, 'tests', 'tmp', `plan-${Date.now()}`);
    await fs.ensureDir(testDir);
    process.chdir(testDir);
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    await fs.remove(testDir);
  });

  it('validateSessionFlags throws when both flags provided', () => {
    const proto = getPlanPrototype();
    expect(() => proto.validateSessionFlags.call({}, 'id', true)).toThrow('Use either --session or --active-session');
  });

  it('sanitizeProjectName normalizes names consistently', () => {
    const proto = getPlanPrototype();
    const sanitize = proto.sanitizeProjectName.bind(proto);

    expect(sanitize('My Project 123')).toBe('my-project-123');
    expect(sanitize('***Complex Name***')).toBe('complex-name');
    expect(sanitize('')).toBe('session-project');
  });

  it('prepareArtifactsFromSession creates mini-PRD and prompt files', async () => {
    const sessionsDir = path.join('.clavix', 'sessions');
    await fs.ensureDir(sessionsDir);
    const sessionManager = new SessionManager(sessionsDir);
    const session = await sessionManager.createSession({ projectName: 'Demo Feature' });
    await sessionManager.addMessage(session.id, 'user', 'Please build something');
    await sessionManager.addMessage(session.id, 'assistant', 'Sure!');

    const proto = getPlanPrototype();
    const result = await proto.prepareArtifactsFromSession.call(proto, session.id, false);

    expect(await fs.pathExists(path.join(result.prdPath, 'mini-prd.md'))).toBe(true);
    expect(await fs.pathExists(path.join(result.prdPath, 'optimized-prompt.md'))).toBe(true);
    expect(result.projectName).toBe('demo-feature');
  });

  it('prepareArtifactsFromSession throws when session has no messages', async () => {
    const sessionManager = new SessionManager(path.join('.clavix', 'sessions'));
    const session = await sessionManager.createSession({ projectName: 'Empty' });
    const proto = getPlanPrototype();

    await expect(proto.prepareArtifactsFromSession.call(proto, session.id, false)).rejects.toThrow('Session has no messages to analyze.');
  });

  it('resolveProjectDirectory returns most recent project when non-interactive', async () => {
    const outputsDir = path.join('.clavix', 'outputs');
    const projectA = path.join(outputsDir, 'alpha');
    const projectB = path.join(outputsDir, 'beta');
    await fs.ensureDir(projectA);
    await fs.ensureDir(projectB);
    await fs.writeFile(path.join(projectA, 'full-prd.md'), '# Alpha');
    await new Promise(resolve => setTimeout(resolve, 10));
    await fs.writeFile(path.join(projectB, 'full-prd.md'), '# Beta');

    const manager = new TaskManager();
    const proto = getPlanPrototype();
    const fakeThis = {
      isInteractive: () => false,
    };

    const result = await proto.resolveProjectDirectory.call(fakeThis, manager);
    expect(result?.name).toBe('beta');
  });

  it('resolveProjectDirectory throws when named project missing', async () => {
    const outputsDir = path.join('.clavix', 'outputs');
    const projectA = path.join(outputsDir, 'alpha');
    await fs.ensureDir(projectA);
    await fs.writeFile(path.join(projectA, 'full-prd.md'), '# alpha');

    const manager = new TaskManager();
    const proto = getPlanPrototype();
    const fakeThis = { isInteractive: () => false };

    await expect(proto.resolveProjectDirectory.call(fakeThis, manager, 'missing')).rejects.toThrow('PRD project not found: missing');
  });
});
