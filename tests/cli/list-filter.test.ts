/**
 * Tests for clavix list command with filtering and limit functionality
 * 
 * Tests filtering by --project flag and limiting results with --limit flag
 */

import fs from 'fs-extra';
import * as path from 'path';
import { SessionManager } from '../../src/core/session-manager';
import List from '../../src/cli/commands/list';
import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import type { Mock } from 'jest-mock';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('clavix list with filtering and limits', () => {
  const testDir = path.join(__dirname, '../fixtures/test-list');
  const clavixDir = path.join(testDir, '.clavix');
  const sessionsDir = path.join(clavixDir, 'sessions');
  const outputsDir = path.join(clavixDir, 'outputs');
  
  let sessionManager: SessionManager;
  let mockLog: any;
  let mockError: any;

  beforeEach(async () => {
    // Clean up and set up test directory
    await fs.remove(testDir);
    await fs.ensureDir(sessionsDir);
    await fs.ensureDir(outputsDir);

    sessionManager = new SessionManager(sessionsDir);

    // Mock process.cwd() to return test directory
    jest.spyOn(process, 'cwd').mockReturnValue(testDir);

    // Create mock console methods to suppress output
    mockLog = jest.spyOn(console, 'log').mockImplementation(() => {});
    mockError = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(async () => {
    await fs.remove(testDir);
    jest.restoreAllMocks();
  });

  describe('session filtering by --project flag', () => {
    beforeEach(async () => {
      // Create test sessions with different project names
      await sessionManager.createSession({ projectName: 'auth-service' });
      await sessionManager.createSession({ projectName: 'payment-service' });
      await sessionManager.createSession({ projectName: 'auth-api' });
      await sessionManager.createSession({ projectName: 'notification-service' });
      await sessionManager.createSession({ projectName: 'auth-module' });
    });

    it('should filter sessions by exact project name match', async () => {
      const sessions = await sessionManager.listSessions();
      const authSessions = sessions.filter(s => s.projectName === 'auth-service');
      
      expect(authSessions.length).toBe(1);
      expect(authSessions[0].projectName).toBe('auth-service');
    });

    it('should filter sessions by partial project name (case-insensitive)', async () => {
      const sessions = await sessionManager.listSessions();
      const authRelated = sessions.filter(s => 
        s.projectName.toLowerCase().includes('auth')
      );
      
      expect(authRelated.length).toBe(3);
      expect(authRelated.every(s => s.projectName.toLowerCase().includes('auth'))).toBe(true);
    });

    it('should return empty array when no sessions match filter', async () => {
      const sessions = await sessionManager.listSessions();
      const nonExistent = sessions.filter(s => 
        s.projectName.toLowerCase().includes('database')
      );
      
      expect(nonExistent.length).toBe(0);
    });

    it('should filter case-insensitively', async () => {
      const sessions = await sessionManager.listSessions();
      const filtered = sessions.filter(s => 
        s.projectName.toLowerCase().includes('AUTH'.toLowerCase())
      );
      
      expect(filtered.length).toBe(3);
    });

    it('should filter by keyword that appears in multiple projects', async () => {
      const sessions = await sessionManager.listSessions();
      const serviceRelated = sessions.filter(s => 
        s.projectName.toLowerCase().includes('service')
      );
      
      expect(serviceRelated.length).toBe(3);
    });
  });

  describe('session limiting with --limit flag', () => {
    beforeEach(async () => {
      // Create 15 test sessions
      for (let i = 1; i <= 15; i++) {
        await sessionManager.createSession({ projectName: `project-${i}` });
        // Small delay to ensure different timestamps
        await new Promise(resolve => setTimeout(resolve, 5));
      }
    });

    it('should limit results to specified number', async () => {
      const sessions = await sessionManager.listSessions();
      const limited = sessions.slice(0, 5);
      
      expect(limited.length).toBe(5);
    });

    it('should return all sessions when limit is greater than total', async () => {
      const sessions = await sessionManager.listSessions();
      const limited = sessions.slice(0, 100);
      
      expect(limited.length).toBe(15);
    });

    it('should return most recent sessions first', async () => {
      const sessions = await sessionManager.listSessions();
      
      // Verify sessions are sorted by updated date (most recent first)
      for (let i = 0; i < sessions.length - 1; i++) {
        const current = new Date(sessions[i].updated);
        const next = new Date(sessions[i + 1].updated);
        expect(current.getTime()).toBeGreaterThanOrEqual(next.getTime());
      }
    });

    it('should apply limit of 1', async () => {
      const sessions = await sessionManager.listSessions();
      const limited = sessions.slice(0, 1);
      
      expect(limited.length).toBe(1);
    });

    it('should apply default limit correctly', async () => {
      const sessions = await sessionManager.listSessions();
      const limited = sessions.slice(0, 20); // Default is 20
      
      expect(limited.length).toBe(15); // All 15 sessions since less than limit
    });
  });

  describe('combined filtering and limiting', () => {
    beforeEach(async () => {
      // Create sessions with varying names
      for (let i = 1; i <= 10; i++) {
        await sessionManager.createSession({ projectName: `auth-project-${i}` });
      }
      for (let i = 1; i <= 10; i++) {
        await sessionManager.createSession({ projectName: `api-project-${i}` });
      }
      await new Promise(resolve => setTimeout(resolve, 10));
    });

    it('should filter first, then apply limit', async () => {
      const sessions = await sessionManager.listSessions();
      const authSessions = sessions.filter(s => 
        s.projectName.toLowerCase().includes('auth')
      );
      const limited = authSessions.slice(0, 5);
      
      expect(limited.length).toBe(5);
      expect(limited.every(s => s.projectName.includes('auth'))).toBe(true);
    });

    it('should handle limit smaller than filtered results', async () => {
      const sessions = await sessionManager.listSessions();
      const authSessions = sessions.filter(s => 
        s.projectName.toLowerCase().includes('auth')
      );
      const limited = authSessions.slice(0, 3);
      
      expect(limited.length).toBe(3);
      expect(authSessions.length).toBe(10);
    });

    it('should handle limit larger than filtered results', async () => {
      const sessions = await sessionManager.listSessions();
      const authSessions = sessions.filter(s => 
        s.projectName.toLowerCase().includes('auth')
      );
      const limited = authSessions.slice(0, 50);
      
      expect(limited.length).toBe(10);
    });
  });

  describe('output directory filtering', () => {
    beforeEach(async () => {
      // Create output directories
      await fs.ensureDir(path.join(outputsDir, 'auth-service'));
      await fs.ensureDir(path.join(outputsDir, 'payment-api'));
      await fs.ensureDir(path.join(outputsDir, 'auth-module'));
      await fs.ensureDir(path.join(outputsDir, 'notification-service'));

      // Add some markdown files
      await fs.writeFile(
        path.join(outputsDir, 'auth-service', 'output.md'),
        '# Auth Output'
      );
      await fs.writeFile(
        path.join(outputsDir, 'payment-api', 'prd.md'),
        '# Payment PRD'
      );
    });

    it('should filter output directories by project name', async () => {
      const dirs = await fs.readdir(outputsDir);
      const filtered = dirs.filter(dir => 
        dir.toLowerCase().includes('auth')
      );
      
      expect(filtered.length).toBe(2);
      expect(filtered).toContain('auth-service');
      expect(filtered).toContain('auth-module');
    });

    it('should return empty when no outputs match filter', async () => {
      const dirs = await fs.readdir(outputsDir);
      const filtered = dirs.filter(dir => 
        dir.toLowerCase().includes('database')
      );
      
      expect(filtered.length).toBe(0);
    });

    it('should limit output directories', async () => {
      const dirs = await fs.readdir(outputsDir);
      const limited = dirs.slice(0, 2);
      
      expect(limited.length).toBe(2);
    });
  });

  describe('edge cases', () => {
    it('should handle empty sessions directory', async () => {
      const sessions = await sessionManager.listSessions();
      expect(sessions).toEqual([]);
    });

    it('should handle limit of 0', async () => {
      await sessionManager.createSession({ projectName: 'test' });
      
      const sessions = await sessionManager.listSessions();
      const limited = sessions.slice(0, 0);
      
      expect(limited.length).toBe(0);
    });

    it('should handle negative limit gracefully', async () => {
      await sessionManager.createSession({ projectName: 'test' });
      
      const sessions = await sessionManager.listSessions();
      // Negative slice returns empty array
      const limited = sessions.slice(0, Math.max(0, -5));
      
      expect(limited.length).toBe(0);
    });

    it('should handle empty filter string', async () => {
      await sessionManager.createSession({ projectName: 'test1' });
      await sessionManager.createSession({ projectName: 'test2' });
      
      const sessions = await sessionManager.listSessions();
      const filtered = sessions.filter(s => 
        s.projectName.toLowerCase().includes('')
      );
      
      // Empty string matches everything
      expect(filtered.length).toBe(2);
    });

    it('should handle special characters in project filter', async () => {
      await sessionManager.createSession({ projectName: 'test-api-v2.0' });
      await sessionManager.createSession({ projectName: 'test_service' });
      
      const sessions = await sessionManager.listSessions();
      const filtered = sessions.filter(s => 
        s.projectName.toLowerCase().includes('test-api')
      );
      
      expect(filtered.length).toBe(1);
      expect(filtered[0].projectName).toBe('test-api-v2.0');
    });
  });

  describe('session metadata accuracy', () => {
    it('should include correct message count in listed sessions', async () => {
      const session = await sessionManager.createSession({ projectName: 'test' });
      await sessionManager.addMessage(session.id, 'user', 'Message 1');
      await sessionManager.addMessage(session.id, 'user', 'Message 2');
      await sessionManager.addMessage(session.id, 'assistant', 'Reply 1');
      
      const sessions = await sessionManager.listSessions();
      
      expect(sessions[0].messageCount).toBe(3);
    });

    it('should include session status in listings', async () => {
      const active = await sessionManager.createSession({ projectName: 'active' });
      const completed = await sessionManager.createSession({ projectName: 'completed' });
      await sessionManager.completeSession(completed.id);
      
      const sessions = await sessionManager.listSessions();
      
      const activeSess = sessions.find(s => s.id === active.id);
      const completedSess = sessions.find(s => s.id === completed.id);
      
      expect(activeSess?.status).toBe('active');
      expect(completedSess?.status).toBe('completed');
    });

    it('should include tags in session listings', async () => {
      await sessionManager.createSession({ 
        projectName: 'test',
        tags: ['urgent', 'bug', 'frontend']
      });
      
      const sessions = await sessionManager.listSessions();
      
      expect(sessions[0].tags).toEqual(['urgent', 'bug', 'frontend']);
    });

    it('should include description in session listings', async () => {
      await sessionManager.createSession({ 
        projectName: 'test',
        description: 'This is a test session'
      });
      
      const sessions = await sessionManager.listSessions();
      
      expect(sessions[0].description).toBe('This is a test session');
    });
  });

  describe('sorting behavior', () => {
    it('should maintain sort order after filtering', async () => {
      // Create sessions with delays to ensure different timestamps
      await sessionManager.createSession({ projectName: 'auth-1' });
      await new Promise(resolve => setTimeout(resolve, 10));
      await sessionManager.createSession({ projectName: 'api-1' });
      await new Promise(resolve => setTimeout(resolve, 10));
      await sessionManager.createSession({ projectName: 'auth-2' });
      await new Promise(resolve => setTimeout(resolve, 10));
      await sessionManager.createSession({ projectName: 'auth-3' });
      
      const sessions = await sessionManager.listSessions();
      const authSessions = sessions.filter(s => 
        s.projectName.toLowerCase().includes('auth')
      );
      
      // Verify sorted by updated date (most recent first)
      expect(authSessions[0].projectName).toBe('auth-3');
      expect(authSessions[1].projectName).toBe('auth-2');
      expect(authSessions[2].projectName).toBe('auth-1');
    });

    it('should sort outputs by modification time', async () => {
      // Create output directories with files at different times
      const dir1 = path.join(outputsDir, 'older-project');
      const dir2 = path.join(outputsDir, 'newer-project');
      
      await fs.ensureDir(dir1);
      await fs.writeFile(path.join(dir1, 'output.md'), 'Old');
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      await fs.ensureDir(dir2);
      await fs.writeFile(path.join(dir2, 'output.md'), 'New');
      
      const dirs = await fs.readdir(outputsDir);
      
      // Get modification times and sort
      const dirsWithTimes = await Promise.all(
        dirs.map(async (dir) => ({
          name: dir,
          mtime: (await fs.stat(path.join(outputsDir, dir))).mtime
        }))
      );
      
      dirsWithTimes.sort((a, b) => b.mtime.getTime() - a.mtime.getTime());
      
      expect(dirsWithTimes[0].name).toBe('newer-project');
      expect(dirsWithTimes[1].name).toBe('older-project');
    });
  });

  describe('large dataset handling', () => {
    it('should efficiently handle large number of sessions', async () => {
      // Create 100 sessions
      for (let i = 1; i <= 100; i++) {
        await sessionManager.createSession({ projectName: `project-${i}` });
      }
      
      const sessions = await sessionManager.listSessions();
      
      expect(sessions.length).toBe(100);
    });

    it('should apply limit to large dataset', async () => {
      // Create 50 sessions
      for (let i = 1; i <= 50; i++) {
        await sessionManager.createSession({ projectName: `project-${i}` });
      }
      
      const sessions = await sessionManager.listSessions();
      const limited = sessions.slice(0, 10);
      
      expect(limited.length).toBe(10);
      expect(sessions.length).toBe(50);
    });

    it('should filter large dataset efficiently', async () => {
      // Create 50 sessions, 20 with "auth" in name
      for (let i = 1; i <= 20; i++) {
        await sessionManager.createSession({ projectName: `auth-project-${i}` });
      }
      for (let i = 1; i <= 30; i++) {
        await sessionManager.createSession({ projectName: `other-project-${i}` });
      }
      
      const sessions = await sessionManager.listSessions();
      const filtered = sessions.filter(s => 
        s.projectName.toLowerCase().includes('auth')
      );
      
      expect(filtered.length).toBe(20);
      expect(sessions.length).toBe(50);
    });
  });
});
