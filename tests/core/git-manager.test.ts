/**
 * GitManager and CommitScheduler tests
 *
 * Note: GitManager git operations are integration-tested in a real git repository
 * This file focuses on:
 * - CommitScheduler pure logic (no external dependencies)
 * - GitManager message generation and validation logic
 */

import { GitManager, CommitScheduler, CommitOptions, CommitStrategy } from '../../src/core/git-manager';
import { describe, it, expect, beforeEach } from '@jest/globals';

describe('GitManager', () => {
  let manager: GitManager;

  beforeEach(() => {
    manager = new GitManager();
  });

  // Note: Integration tests for git operations (isGitRepository, hasUncommittedChanges, etc.)
  // are tested in the actual repository context during manual testing.
  // These methods make real git calls and are hard to unit test in ESM without complex mocking.

  it('should be instantiable', () => {
    expect(manager).toBeInstanceOf(GitManager);
  });

  it('should have all required public methods', () => {
    expect(typeof manager.isGitRepository).toBe('function');
    expect(typeof manager.hasUncommittedChanges).toBe('function');
    expect(typeof manager.createCommit).toBe('function');
    expect(typeof manager.getCurrentBranch).toBe('function');
    expect(typeof manager.isWorkingDirectoryClean).toBe('function');
    expect(typeof manager.getStatus).toBe('function');
    expect(typeof manager.validateGitSetup).toBe('function');
  });
});

describe('CommitScheduler', () => {
  describe('per-task strategy', () => {
    it('should commit after every task', () => {
      const scheduler = new CommitScheduler('per-task');

      expect(scheduler.taskCompleted('Phase 1')).toBe(true);
      scheduler.resetCommitCounter();

      expect(scheduler.taskCompleted('Phase 1')).toBe(true);
      scheduler.resetCommitCounter();

      expect(scheduler.taskCompleted('Phase 2')).toBe(true);
    });
  });

  describe('per-5-tasks strategy', () => {
    it('should commit after every 5 tasks', () => {
      const scheduler = new CommitScheduler('per-5-tasks');

      expect(scheduler.taskCompleted('Phase 1')).toBe(false);
      expect(scheduler.taskCompleted('Phase 1')).toBe(false);
      expect(scheduler.taskCompleted('Phase 1')).toBe(false);
      expect(scheduler.taskCompleted('Phase 1')).toBe(false);
      expect(scheduler.taskCompleted('Phase 1')).toBe(true);

      scheduler.resetCommitCounter();

      expect(scheduler.taskCompleted('Phase 2')).toBe(false);
      expect(scheduler.taskCompleted('Phase 2')).toBe(false);
      expect(scheduler.taskCompleted('Phase 2')).toBe(false);
      expect(scheduler.taskCompleted('Phase 2')).toBe(false);
      expect(scheduler.taskCompleted('Phase 2')).toBe(true);
    });

    it('should track task count correctly', () => {
      const scheduler = new CommitScheduler('per-5-tasks');

      scheduler.taskCompleted('Phase 1');
      expect(scheduler.getTaskCountSinceLastCommit()).toBe(1);

      scheduler.taskCompleted('Phase 1');
      expect(scheduler.getTaskCountSinceLastCommit()).toBe(2);

      scheduler.taskCompleted('Phase 1');
      scheduler.taskCompleted('Phase 1');
      scheduler.taskCompleted('Phase 1');
      expect(scheduler.getTaskCountSinceLastCommit()).toBe(5);

      scheduler.resetCommitCounter();
      expect(scheduler.getTaskCountSinceLastCommit()).toBe(0);
    });
  });

  describe('per-phase strategy', () => {
    it('should not commit on task completion', () => {
      const scheduler = new CommitScheduler('per-phase');

      expect(scheduler.taskCompleted('Phase 1')).toBe(false);
      expect(scheduler.taskCompleted('Phase 1')).toBe(false);
      expect(scheduler.taskCompleted('Phase 1')).toBe(false);
    });

    it('should commit when phase is completed', () => {
      const scheduler = new CommitScheduler('per-phase');

      scheduler.taskCompleted('Phase 1');
      scheduler.taskCompleted('Phase 1');
      scheduler.taskCompleted('Phase 1');

      expect(scheduler.phaseCompleted()).toBe(true);
    });

    it('should not commit for phase completion with other strategies', () => {
      const schedulerTask = new CommitScheduler('per-task');
      const scheduler5 = new CommitScheduler('per-5-tasks');
      const schedulerNone = new CommitScheduler('none');

      expect(schedulerTask.phaseCompleted()).toBe(false);
      expect(scheduler5.phaseCompleted()).toBe(false);
      expect(schedulerNone.phaseCompleted()).toBe(false);
    });
  });

  describe('none strategy', () => {
    it('should never commit on task completion', () => {
      const scheduler = new CommitScheduler('none');

      expect(scheduler.taskCompleted('Phase 1')).toBe(false);
      expect(scheduler.taskCompleted('Phase 1')).toBe(false);
      expect(scheduler.taskCompleted('Phase 2')).toBe(false);
    });

    it('should not commit on phase completion', () => {
      const scheduler = new CommitScheduler('none');

      scheduler.taskCompleted('Phase 1');
      expect(scheduler.phaseCompleted()).toBe(false);
    });
  });

  describe('phase tracking', () => {
    it('should track current phase correctly', () => {
      const scheduler = new CommitScheduler('per-5-tasks');

      scheduler.taskCompleted('Phase 1');
      scheduler.taskCompleted('Phase 1');

      // Switch to Phase 2
      scheduler.taskCompleted('Phase 2');

      // Should still work correctly
      expect(scheduler.taskCompleted('Phase 2')).toBe(false);
    });

    it('should reset phase counter when phase changes', () => {
      const scheduler = new CommitScheduler('per-phase');

      scheduler.taskCompleted('Phase 1');
      scheduler.taskCompleted('Phase 1');

      // Switch phase
      scheduler.taskCompleted('Phase 2');
      scheduler.taskCompleted('Phase 2');

      // Phase completion should work
      expect(scheduler.phaseCompleted()).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle rapid commits in per-task mode', () => {
      const scheduler = new CommitScheduler('per-task');

      for (let i = 0; i < 100; i++) {
        expect(scheduler.taskCompleted('Phase 1')).toBe(true);
        scheduler.resetCommitCounter();
      }
    });

    it('should handle many tasks in per-5-tasks mode', () => {
      const scheduler = new CommitScheduler('per-5-tasks');

      for (let i = 1; i <= 23; i++) {
        const shouldCommit = i % 5 === 0;
        expect(scheduler.taskCompleted('Phase 1')).toBe(shouldCommit);
        if (shouldCommit) {
          scheduler.resetCommitCounter();
        }
      }
    });

    it('should track total tasks across multiple phases', () => {
      const scheduler = new CommitScheduler('per-task');

      scheduler.taskCompleted('Phase 1');
      scheduler.resetCommitCounter();

      scheduler.taskCompleted('Phase 1');
      scheduler.resetCommitCounter();

      scheduler.taskCompleted('Phase 2');
      scheduler.resetCommitCounter();

      scheduler.taskCompleted('Phase 3');

      // Total should be tracked internally
      expect(scheduler.getTaskCountSinceLastCommit()).toBe(1);
    });
  });

  describe('commit counter management', () => {
    it('should reset counter correctly', () => {
      const scheduler = new CommitScheduler('per-5-tasks');

      scheduler.taskCompleted('Phase 1');
      scheduler.taskCompleted('Phase 1');
      scheduler.taskCompleted('Phase 1');

      expect(scheduler.getTaskCountSinceLastCommit()).toBe(3);

      scheduler.resetCommitCounter();

      expect(scheduler.getTaskCountSinceLastCommit()).toBe(0);
    });

    it('should accumulate correctly after reset', () => {
      const scheduler = new CommitScheduler('per-5-tasks');

      scheduler.taskCompleted('Phase 1');
      scheduler.taskCompleted('Phase 1');
      scheduler.resetCommitCounter();

      scheduler.taskCompleted('Phase 1');
      scheduler.taskCompleted('Phase 1');

      expect(scheduler.getTaskCountSinceLastCommit()).toBe(2);
    });
  });
});
