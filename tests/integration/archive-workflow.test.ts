/**
 * Integration test for archive workflow
 * Tests the interaction between ArchiveManager, TaskManager, and FileSystem
 */

import * as path from 'path';
import fs from 'fs-extra';
import { ArchiveManager } from '../../src/core/archive-manager';
import { TaskManager } from '../../src/core/task-manager';
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Archive Workflow Integration', () => {
  const testDir = path.join(__dirname, '../tmp/archive-workflow-test');
  let archiveManager: ArchiveManager;
  let taskManager: TaskManager;

  beforeEach(async () => {
    await fs.ensureDir(testDir);
    process.chdir(testDir);

    archiveManager = new ArchiveManager();
    taskManager = new TaskManager();
  });

  afterEach(async () => {
    process.chdir(path.join(__dirname, '../..'));
    await fs.remove(testDir);
  });

  describe('Project Creation and Detection', () => {
    it('should detect PRD projects in outputs directory', async () => {
      // Create a PRD project
      await fs.ensureDir('.clavix/outputs/test-project');
      await fs.writeFile('.clavix/outputs/test-project/PRD.md', '# Test PRD');

      const projects = await archiveManager.listPrdProjects();

      expect(projects).toHaveLength(1);
      expect(projects[0].name).toBe('test-project');
      expect(projects[0].isArchived).toBe(false);
    });

    it('should detect multiple PRD naming conventions', async () => {
      await fs.ensureDir('.clavix/outputs/project1');
      await fs.writeFile('.clavix/outputs/project1/PRD.md', '# PRD 1');

      await fs.ensureDir('.clavix/outputs/project2');
      await fs.writeFile('.clavix/outputs/project2/full-prd.md', '# PRD 2');

      await fs.ensureDir('.clavix/outputs/project3');
      await fs.writeFile('.clavix/outputs/project3/FULL-PRD.md', '# PRD 3');

      const projects = await archiveManager.listPrdProjects();

      expect(projects).toHaveLength(3);
    });

    it('should not detect directories without PRD files', async () => {
      await fs.ensureDir('.clavix/outputs/not-a-project');
      await fs.writeFile('.clavix/outputs/not-a-project/random.txt', 'Random file');

      const projects = await archiveManager.listPrdProjects();

      expect(projects).toHaveLength(0);
    });
  });

  describe('Task Status Detection', () => {
    it('should detect incomplete tasks', async () => {
      await fs.ensureDir('.clavix/outputs/test-project');
      await fs.writeFile('.clavix/outputs/test-project/PRD.md', '# Test PRD');

      const tasksContent = `# Implementation Tasks

## Phase 1
- [ ] Task 1
- [x] Task 2
- [ ] Task 3`;

      await fs.writeFile('.clavix/outputs/test-project/tasks.md', tasksContent);

      const projects = await archiveManager.listPrdProjects();
      const project = projects[0];

      expect(project.taskStatus.hasTasksFile).toBe(true);
      expect(project.taskStatus.total).toBe(3);
      expect(project.taskStatus.completed).toBe(1);
      expect(project.taskStatus.remaining).toBe(2);
      expect(project.taskStatus.allCompleted).toBe(false);
    });

    it('should detect all tasks completed', async () => {
      await fs.ensureDir('.clavix/outputs/completed-project');
      await fs.writeFile('.clavix/outputs/completed-project/PRD.md', '# PRD');

      const tasksContent = `# Implementation Tasks

## Phase 1
- [x] Task 1
- [x] Task 2
- [x] Task 3`;

      await fs.writeFile('.clavix/outputs/completed-project/tasks.md', tasksContent);

      const projects = await archiveManager.listPrdProjects();
      const project = projects[0];

      expect(project.taskStatus.allCompleted).toBe(true);
      expect(project.taskStatus.percentage).toBe(100);
    });

    it('should handle projects without tasks file', async () => {
      await fs.ensureDir('.clavix/outputs/no-tasks');
      await fs.writeFile('.clavix/outputs/no-tasks/PRD.md', '# PRD');

      const projects = await archiveManager.listPrdProjects();
      const project = projects[0];

      expect(project.taskStatus.hasTasksFile).toBe(false);
      expect(project.taskStatus.total).toBe(0);
      expect(project.taskStatus.allCompleted).toBe(false);
    });
  });

  describe('Archive Operation', () => {
    it('should archive a completed project', async () => {
      // Create completed project
      await fs.ensureDir('.clavix/outputs/completed-proj');
      await fs.writeFile('.clavix/outputs/completed-proj/PRD.md', '# PRD');

      const tasksContent = `# Tasks\n\n## Phase 1\n- [x] Task 1`;
      await fs.writeFile('.clavix/outputs/completed-proj/tasks.md', tasksContent);

      const result = await archiveManager.archiveProject('completed-proj');

      expect(result.success).toBe(true);
      expect(result.message).toContain('Successfully archived');

      // Verify project moved
      expect(await fs.pathExists('.clavix/outputs/completed-proj')).toBe(false);
      expect(await fs.pathExists('.clavix/outputs/archive/completed-proj')).toBe(true);
    });

    it('should not archive project with incomplete tasks', async () => {
      await fs.ensureDir('.clavix/outputs/incomplete');
      await fs.writeFile('.clavix/outputs/incomplete/PRD.md', '# PRD');

      const tasksContent = `# Tasks\n\n## Phase 1\n- [ ] Task 1\n- [x] Task 2`;
      await fs.writeFile('.clavix/outputs/incomplete/tasks.md', tasksContent);

      const result = await archiveManager.archiveProject('incomplete');

      expect(result.success).toBe(false);
      expect(result.message).toContain('incomplete task');
      expect(await fs.pathExists('.clavix/outputs/incomplete')).toBe(true);
    });

    it('should force archive incomplete project with --force', async () => {
      await fs.ensureDir('.clavix/outputs/force-archive');
      await fs.writeFile('.clavix/outputs/force-archive/PRD.md', '# PRD');

      const tasksContent = `# Tasks\n\n## Phase 1\n- [ ] Task 1`;
      await fs.writeFile('.clavix/outputs/force-archive/tasks.md', tasksContent);

      const result = await archiveManager.archiveProject('force-archive', true);

      expect(result.success).toBe(true);
      expect(await fs.pathExists('.clavix/outputs/archive/force-archive')).toBe(true);
    });

    it('should not archive non-existent project', async () => {
      const result = await archiveManager.archiveProject('does-not-exist');

      expect(result.success).toBe(false);
      expect(result.message).toContain('not found');
    });

    it('should not archive already archived project', async () => {
      await fs.ensureDir('.clavix/outputs/archive/already-archived');
      await fs.writeFile('.clavix/outputs/archive/already-archived/PRD.md', '# PRD');

      const result = await archiveManager.archiveProject('archive/already-archived');

      expect(result.success).toBe(false);
      expect(result.message).toContain('already archived');
    });

    it('should prevent duplicate archive', async () => {
      // Create and archive first project
      await fs.ensureDir('.clavix/outputs/project');
      await fs.writeFile('.clavix/outputs/project/PRD.md', '# PRD');
      const tasks = `# Tasks\n\n## Phase 1\n- [x] Done`;
      await fs.writeFile('.clavix/outputs/project/tasks.md', tasks);

      await archiveManager.archiveProject('project');

      // Try to archive another project with same name
      await fs.ensureDir('.clavix/outputs/project');
      await fs.writeFile('.clavix/outputs/project/PRD.md', '# PRD 2');
      await fs.writeFile('.clavix/outputs/project/tasks.md', tasks);

      const result = await archiveManager.archiveProject('project');

      expect(result.success).toBe(false);
      expect(result.message).toContain('already contains');
    });
  });

  describe('Restore Operation', () => {
    it('should restore archived project', async () => {
      // Create archived project
      await fs.ensureDir('.clavix/outputs/archive/old-project');
      await fs.writeFile('.clavix/outputs/archive/old-project/PRD.md', '# Old PRD');

      const result = await archiveManager.restoreProject('old-project');

      expect(result.success).toBe(true);
      expect(result.message).toContain('Successfully restored');

      // Verify project moved back
      expect(await fs.pathExists('.clavix/outputs/old-project')).toBe(true);
      expect(await fs.pathExists('.clavix/outputs/archive/old-project')).toBe(false);
    });

    it('should not restore non-existent archived project', async () => {
      const result = await archiveManager.restoreProject('does-not-exist');

      expect(result.success).toBe(false);
      expect(result.message).toContain('not found');
    });

    it('should not restore if destination exists', async () => {
      await fs.ensureDir('.clavix/outputs/archive/project');
      await fs.writeFile('.clavix/outputs/archive/project/PRD.md', '# Archived');

      await fs.ensureDir('.clavix/outputs/project');
      await fs.writeFile('.clavix/outputs/project/PRD.md', '# Active');

      const result = await archiveManager.restoreProject('project');

      expect(result.success).toBe(false);
      expect(result.message).toContain('already contains');
    });
  });

  describe('Listing Operations', () => {
    it('should list only active projects by default', async () => {
      await fs.ensureDir('.clavix/outputs/active1');
      await fs.writeFile('.clavix/outputs/active1/PRD.md', '# Active 1');

      await fs.ensureDir('.clavix/outputs/archive/archived1');
      await fs.writeFile('.clavix/outputs/archive/archived1/PRD.md', '# Archived 1');

      const projects = await archiveManager.listPrdProjects(false);

      expect(projects).toHaveLength(1);
      expect(projects[0].name).toBe('active1');
      expect(projects[0].isArchived).toBe(false);
    });

    it('should list both active and archived when requested', async () => {
      await fs.ensureDir('.clavix/outputs/active1');
      await fs.writeFile('.clavix/outputs/active1/PRD.md', '# Active 1');

      await fs.ensureDir('.clavix/outputs/archive/archived1');
      await fs.writeFile('.clavix/outputs/archive/archived1/PRD.md', '# Archived 1');

      const projects = await archiveManager.listPrdProjects(true);

      expect(projects).toHaveLength(2);
      const activeProj = projects.find((p) => p.name === 'active1');
      const archivedProj = projects.find((p) => p.name === 'archived1');

      expect(activeProj?.isArchived).toBe(false);
      expect(archivedProj?.isArchived).toBe(true);
    });

    it('should list only archived projects', async () => {
      await fs.ensureDir('.clavix/outputs/active1');
      await fs.writeFile('.clavix/outputs/active1/PRD.md', '# Active');

      await fs.ensureDir('.clavix/outputs/archive/archived1');
      await fs.writeFile('.clavix/outputs/archive/archived1/PRD.md', '# Archived 1');

      await fs.ensureDir('.clavix/outputs/archive/archived2');
      await fs.writeFile('.clavix/outputs/archive/archived2/PRD.md', '# Archived 2');

      const archived = await archiveManager.listArchivedProjects();

      expect(archived).toHaveLength(2);
      expect(archived.every((p) => p.isArchived)).toBe(true);
    });

    it('should get archivable projects (completed only)', async () => {
      // Incomplete project
      await fs.ensureDir('.clavix/outputs/incomplete');
      await fs.writeFile('.clavix/outputs/incomplete/PRD.md', '# PRD');
      await fs.writeFile(
        '.clavix/outputs/incomplete/tasks.md',
        '# Tasks\n\n## Phase 1\n- [ ] Task 1'
      );

      // Completed project
      await fs.ensureDir('.clavix/outputs/completed');
      await fs.writeFile('.clavix/outputs/completed/PRD.md', '# PRD');
      await fs.writeFile(
        '.clavix/outputs/completed/tasks.md',
        '# Tasks\n\n## Phase 1\n- [x] Task 1'
      );

      const archivable = await archiveManager.getArchivablePrds();

      expect(archivable).toHaveLength(1);
      expect(archivable[0].name).toBe('completed');
    });
  });

  describe('End-to-End Archive Workflow', () => {
    it('should complete full archive and restore cycle', async () => {
      // 1. Create project with tasks
      await fs.ensureDir('.clavix/outputs/full-cycle');
      await fs.writeFile('.clavix/outputs/full-cycle/PRD.md', '# Full Cycle PRD');

      const tasks = `# Tasks

## Phase 1
- [x] Setup
- [x] Implementation

## Phase 2
- [x] Testing
- [x] Documentation`;

      await fs.writeFile('.clavix/outputs/full-cycle/tasks.md', tasks);

      // 2. Verify it appears in active list
      let projects = await archiveManager.listPrdProjects();
      expect(projects).toHaveLength(1);
      expect(projects[0].taskStatus.allCompleted).toBe(true);

      // 3. Archive the project
      const archiveResult = await archiveManager.archiveProject('full-cycle');
      expect(archiveResult.success).toBe(true);

      // 4. Verify it's in archived list
      const archived = await archiveManager.listArchivedProjects();
      expect(archived).toHaveLength(1);
      expect(archived[0].name).toBe('full-cycle');

      // 5. Verify it's not in active list
      projects = await archiveManager.listPrdProjects();
      expect(projects).toHaveLength(0);

      // 6. Restore the project
      const restoreResult = await archiveManager.restoreProject('full-cycle');
      expect(restoreResult.success).toBe(true);

      // 7. Verify it's back in active list
      projects = await archiveManager.listPrdProjects();
      expect(projects).toHaveLength(1);
      expect(projects[0].name).toBe('full-cycle');

      // 8. Verify content is preserved
      const prdContent = await fs.readFile('.clavix/outputs/full-cycle/PRD.md', 'utf-8');
      expect(prdContent).toContain('Full Cycle PRD');
    });
  });

  describe('Incomplete Tasks Helper', () => {
    it('should get list of incomplete tasks', async () => {
      await fs.ensureDir('.clavix/outputs/test');
      await fs.writeFile('.clavix/outputs/test/PRD.md', '# PRD');

      const tasks = `# Tasks

## Setup
- [x] Initialize
- [ ] Configure

## Implementation
- [ ] Build feature
- [x] Add tests`;

      await fs.writeFile('.clavix/outputs/test/tasks.md', tasks);

      const incomplete = await archiveManager.getIncompleteTasks('.clavix/outputs/test');

      expect(incomplete).toHaveLength(2);
      expect(incomplete).toContain('[Setup] Configure');
      expect(incomplete).toContain('[Implementation] Build feature');
    });

    it('should return empty array for completed project', async () => {
      await fs.ensureDir('.clavix/outputs/done');
      await fs.writeFile('.clavix/outputs/done/PRD.md', '# PRD');
      await fs.writeFile(
        '.clavix/outputs/done/tasks.md',
        '# Tasks\n\n## Phase 1\n- [x] All done'
      );

      const incomplete = await archiveManager.getIncompleteTasks('.clavix/outputs/done');

      expect(incomplete).toHaveLength(0);
    });
  });
});
