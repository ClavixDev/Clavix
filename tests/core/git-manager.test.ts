/**
 * GitManager and CommitScheduler tests
 */

import { GitManager, CommitScheduler } from '../../src/core/git-manager';
import { describe, it, expect, beforeEach, jest, afterEach } from '@jest/globals';

// Mock child_process
const mockExecFn = jest.fn();
jest.mock('child_process', () => ({
  exec: (cmd: string, cb: any) => mockExecFn(cmd, cb)
}));

describe('GitManager', () => {
  let manager: GitManager;

  beforeEach(() => {
    manager = new GitManager();
    mockExecFn.mockReset();
    mockExecFn.mockImplementation((cmd: string, callback: any) => {
      callback(null, { stdout: '', stderr: '' });
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('isGitRepository', () => {
    it('should return true if git command succeeds', async () => {
      mockExecFn.mockImplementation((cmd: string, callback: any) => {
        callback(null, { stdout: '.git\n', stderr: '' });
      });
      const result = await manager.isGitRepository();
      expect(result).toBe(true);
    });

    it('should return false if git command fails', async () => {
      mockExecFn.mockImplementation((cmd: string, callback: any) => {
        callback(new Error('Not a git repository'), { stdout: '', stderr: '' });
      });
      const result = await manager.isGitRepository();
      expect(result).toBe(false);
    });
  });

  describe('hasUncommittedChanges', () => {
    it('should return true if status has output', async () => {
      mockExecFn.mockImplementation((cmd: string, callback: any) => {
        callback(null, { stdout: ' M modified-file.ts\n', stderr: '' });
      });
      const result = await manager.hasUncommittedChanges();
      expect(result).toBe(true);
    });

    it('should return false if status is empty', async () => {
      mockExecFn.mockImplementation((cmd: string, callback: any) => {
        callback(null, { stdout: '', stderr: '' });
      });
      const result = await manager.hasUncommittedChanges();
      expect(result).toBe(false);
    });
  });

  describe('getCurrentBranch', () => {
    it('should return branch name', async () => {
      mockExecFn.mockImplementation((cmd: string, callback: any) => {
        callback(null, { stdout: 'main\n', stderr: '' });
      });
      const result = await manager.getCurrentBranch();
      expect(result).toBe('main');
    });

    it('should return "unknown" on error', async () => {
      mockExecFn.mockImplementation((cmd: string, callback: any) => {
        callback(new Error('Failed'), null);
      });
      const result = await manager.getCurrentBranch();
      expect(result).toBe('unknown');
    });
  });

  describe('createCommit', () => {
    it('should not commit if no changes', async () => {
      // mock hasUncommittedChanges -> false
      mockExecFn.mockImplementation((cmd: string, callback: any) => {
        if (cmd.includes('status')) callback(null, { stdout: '', stderr: '' });
        else callback(null, { stdout: '', stderr: '' });
      });

      const result = await manager.createCommit({ message: 'test' });
      expect(result).toBe(false);
      
      const commitCalls = mockExecFn.mock.calls.filter((call: any) => call[0].includes('commit'));
      expect(commitCalls.length).toBe(0);
    });

    it('should commit if changes exist', async () => {
      // mock hasUncommittedChanges -> true
      mockExecFn.mockImplementation((cmd: string, callback: any) => {
        if (cmd.includes('status')) callback(null, { stdout: 'M file.ts', stderr: '' });
        else callback(null, { stdout: '', stderr: '' });
      });

      const result = await manager.createCommit({ message: 'test commit' });
      expect(result).toBe(true);
      
      const commitCalls = mockExecFn.mock.calls.filter((call: any) => call[0].includes('commit'));
      expect(commitCalls.length).toBe(1);
      expect(commitCalls[0][0]).toContain('test commit');
    });

    it('should generate message from tasks if not provided', async () => {
      mockExecFn.mockImplementation((cmd: string, callback: any) => {
        if (cmd.includes('status')) callback(null, { stdout: 'M file.ts', stderr: '' });
        else callback(null, { stdout: '', stderr: '' });
      });

      await manager.createCommit({ tasks: ['Task 1', 'Task 2'] });
      
      const commitCalls = mockExecFn.mock.calls.filter((call: any) => call[0].includes('commit'));
      expect(commitCalls[0][0]).toContain('implement 2 tasks');
      expect(commitCalls[0][0]).toContain('Task 1');
    });
  });

  describe('validateGitSetup', () => {
    it('should return comprehensive status', async () => {
      mockExecFn.mockImplementation((cmd: string, callback: any) => {
        if (cmd.includes('rev-parse --git-dir')) callback(null, { stdout: '.git', stderr: '' });
        else if (cmd.includes('status')) callback(null, { stdout: '', stderr: '' }); // Clean
        else if (cmd.includes('abbrev-ref')) callback(null, { stdout: 'feature\n', stderr: '' });
        else callback(null, { stdout: '', stderr: '' });
      });

      const status = await manager.validateGitSetup();
      
      expect(status.isRepo).toBe(true);
      expect(status.hasChanges).toBe(false);
      expect(status.currentBranch).toBe('feature');
    });
  });
});

describe('CommitScheduler', () => {
  describe('per-task strategy', () => {
    it('should commit after every task', () => {
      const scheduler = new CommitScheduler('per-task');
      expect(scheduler.taskCompleted('Phase 1')).toBe(true);
      scheduler.resetCommitCounter();
      expect(scheduler.taskCompleted('Phase 2')).toBe(true);
    });
  });

  describe('per-5-tasks strategy', () => {
    it('should commit after every 5 tasks', () => {
      const scheduler = new CommitScheduler('per-5-tasks');
      for (let i=0; i<4; i++) expect(scheduler.taskCompleted('Phase 1')).toBe(false);
      expect(scheduler.taskCompleted('Phase 1')).toBe(true);
    });
  });

  describe('per-phase strategy', () => {
    it('should commit when phase is completed', () => {
      const scheduler = new CommitScheduler('per-phase');
      scheduler.taskCompleted('Phase 1');
      expect(scheduler.phaseCompleted()).toBe(true);
    });
  });
});
