import { describe, it, expect } from '@jest/globals';
import { AgentErrorMessages } from '../../src/utils/agent-error-messages';

describe('AgentErrorMessages', () => {
  const expectHasRecoveryBlock = (message: string): void => {
    expect(message).toContain('Agent recovery');
  };

  it('noPrdFound provides actionable recovery steps', () => {
    const message = AgentErrorMessages.noPrdFound();
    expect(message).toMatch(/No PRD artifacts found/);
    expectHasRecoveryBlock(message);
    expect(message).toContain('/clavix:prd');
  });

  it('noTasksFound scopes message to project name', () => {
    const message = AgentErrorMessages.noTasksFound('demo-project');
    expect(message).toContain('demo-project');
    expect(message).toContain('/clavix:plan');
    expectHasRecoveryBlock(message);
  });

  it('configNotFound instructs agent to run implement', () => {
    const message = AgentErrorMessages.configNotFound();
    expect(message).toContain('Configuration file not found');
    expect(message).toContain('/clavix:implement');
    expectHasRecoveryBlock(message);
  });

  it('taskNotFound lists available tasks with statuses', () => {
    const message = AgentErrorMessages.taskNotFound('phase-1-setup-1', [
      { id: 'phase-1-setup-1', description: 'Initialize', completed: false },
      { id: 'phase-1-setup-2', description: 'Configure', completed: true },
    ]);

    expect(message).toContain('phase-1-setup-1');
    expect(message).toMatch(/\[ \] phase-1-setup-1/);
    expect(message).toMatch(/\[x] phase-1-setup-2/);
  });

  it('archiveValidationFailed surfaces reason', () => {
    const message = AgentErrorMessages.archiveValidationFailed('tasks incomplete');
    expect(message).toContain('tasks incomplete');
    expectHasRecoveryBlock(message);
  });

  it('fileOperationFailed includes path and optional error', () => {
    const message = AgentErrorMessages.fileOperationFailed(
      'write',
      '/tmp/file',
      'permission denied'
    );
    expect(message).toContain('write');
    expect(message).toContain('/tmp/file');
    expect(message).toContain('permission denied');
  });

  it('fileOperationFailed works without optional error parameter', () => {
    const message = AgentErrorMessages.fileOperationFailed('read', '/tmp/file');
    expect(message).toContain('read');
    expect(message).toContain('/tmp/file');
    expect(message).not.toContain('Error:');
  });

  it('fileOperationFailed handles all operation types', () => {
    const operations: Array<'read' | 'write' | 'move' | 'delete'> = [
      'read',
      'write',
      'move',
      'delete',
    ];
    for (const op of operations) {
      const message = AgentErrorMessages.fileOperationFailed(op, '/path');
      expect(message).toContain(op);
    }
  });

  it('multiplePrdsFound enumerates projects with indices', () => {
    const message = AgentErrorMessages.multiplePrdsFound(['alpha', 'beta']);
    expect(message).toContain('1. alpha');
    expect(message).toContain('2. beta');
    expectHasRecoveryBlock(message);
  });

  it('tasksExistWithProgress highlights current progress', () => {
    const message = AgentErrorMessages.tasksExistWithProgress(3, 5);
    expect(message).toContain('3/5 tasks completed');
    expect(message).toContain('--overwrite');
  });

  it('gitNotInitialized instructs agent to init or skip git', () => {
    const message = AgentErrorMessages.gitNotInitialized();
    expect(message).toContain('Git repository not detected');
    expect(message).toContain('git init');
    expect(message).toContain('--no-git');
  });

  it('noArchivableProjects lists reasons and next actions', () => {
    const message = AgentErrorMessages.noArchivableProjects();
    expect(message).toContain('No archivable projects found');
    expect(message).toContain('.clavix/outputs');
    expect(message).toContain('.clavix/outputs/archive/');
  });

  it('restoreConflict references conflicting project', () => {
    const message = AgentErrorMessages.restoreConflict('demo');
    expect(message).toContain('demo');
    expect(message).toContain('Restoration');
  });

  it('cliExecutionFailed embeds command, exit code, and stderr', () => {
    const message = AgentErrorMessages.cliExecutionFailed('clavix plan', 1, 'stacktrace');
    expect(message).toContain('clavix plan');
    expect(message).toContain('Exit code: 1');
    expect(message).toContain('stacktrace');
  });

  it('cliExecutionFailed works without stderr parameter', () => {
    const message = AgentErrorMessages.cliExecutionFailed('clavix init', 127);
    expect(message).toContain('clavix init');
    expect(message).toContain('Exit code: 127');
    expect(message).not.toContain('Error output:');
  });

  it('invalidTaskIdFormat shows examples', () => {
    const message = AgentErrorMessages.invalidTaskIdFormat('invalid');
    expect(message).toContain('invalid');
    expect(message).toContain('phase-1-setup-1');
  });

  // Note: sessionNotFound removed in v5.4.0 (sessions feature removed in v5.3.0)

  it('taskAlreadyCompleted clarifies no action needed', () => {
    const message = AgentErrorMessages.taskAlreadyCompleted('phase-1-setup-1');
    expect(message).toContain('phase-1-setup-1');
    expect(message).toContain('No action needed');
  });
});
