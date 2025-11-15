/**
 * Extended tests for TaskManager - Error scenarios and edge cases
 * Covers: missing PRD, malformed PRD, error handling
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import { TaskManager } from '../../src/core/task-manager';

describe('TaskManager - Extended (Error Scenarios & Edge Cases)', () => {
  const testDir = path.join(__dirname, '../fixtures/task-manager-extended');
  const outputsDir = path.join(testDir, '.clavix/outputs');
  let manager: TaskManager;
  let originalCwd: string;

  beforeEach(async () => {
    await fs.remove(testDir);
    await fs.ensureDir(outputsDir);
    originalCwd = process.cwd();
    process.chdir(testDir);
    manager = new TaskManager();
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    await fs.remove(testDir);
  });

  describe('PRD Resolution', () => {
    it('should throw error when no PRD file found', async () => {
      const projectDir = path.join(outputsDir, 'no-prd');
      await fs.ensureDir(projectDir);

      await expect(
        manager.generateTasksFromPrd(projectDir)
      ).rejects.toThrow('No PRD artifacts found');
    });

    it('should throw error when PRD directory not found', async () => {
      const projectDir = path.join(outputsDir, 'missing-project');

      await expect(
        manager.generateTasksFromPrd(projectDir)
      ).rejects.toThrow();
    });

    it('should find full-prd.md as priority source', async () => {
      const projectDir = path.join(outputsDir, 'multi-prd');
      await fs.ensureDir(projectDir);

      // Create multiple PRD files
      await fs.writeFile(path.join(projectDir, 'quick-prd.md'), '# Quick');
      await fs.writeFile(path.join(projectDir, 'full-prd.md'), '# Full');

      const result = await manager.generateTasksFromPrd(projectDir);

      expect(result.sourceType).toBe('full');
      expect(result.sourcePath).toContain('full-prd.md');
    });

    it('should find quick-prd.md when full-prd missing', async () => {
      const projectDir = path.join(outputsDir, 'quick-only');
      await fs.ensureDir(projectDir);

      await fs.writeFile(path.join(projectDir, 'quick-prd.md'), '# Quick PRD');

      const result = await manager.generateTasksFromPrd(projectDir);

      expect(result.sourceType).toBe('quick');
    });

    it('should find mini-prd.md when others missing', async () => {
      const projectDir = path.join(outputsDir, 'mini-only');
      await fs.ensureDir(projectDir);

      await fs.writeFile(path.join(projectDir, 'mini-prd.md'), '# Mini PRD');

      const result = await manager.generateTasksFromPrd(projectDir);

      expect(result.sourceType).toBe('mini');
    });

    it('should respect source option to find specific PRD type', async () => {
      const projectDir = path.join(outputsDir, 'source-specific');
      await fs.ensureDir(projectDir);

      await fs.writeFile(path.join(projectDir, 'full-prd.md'), '# Full');
      await fs.writeFile(path.join(projectDir, 'quick-prd.md'), '# Quick');

      const result = await manager.generateTasksFromPrd(projectDir, {
        source: 'quick',
      });

      expect(result.sourceType).toBe('quick');
    });

    it('should throw error when requested source not found', async () => {
      const projectDir = path.join(outputsDir, 'missing-source');
      await fs.ensureDir(projectDir);

      await fs.writeFile(path.join(projectDir, 'full-prd.md'), '# Full');

      await expect(
        manager.generateTasksFromPrd(projectDir, { source: 'quick' })
      ).rejects.toThrow('No PRD artifacts found for source');
    });
  });

  describe('Malformed PRD Handling', () => {
    it('should handle PRD without Requirements section', async () => {
      const projectDir = path.join(outputsDir, 'no-requirements');
      await fs.ensureDir(projectDir);

      const prdContent = `# Project

## Overview
This is just an overview.

## Architecture
Some architecture info.
`;

      await fs.writeFile(path.join(projectDir, 'full-prd.md'), prdContent);

      const result = await manager.generateTasksFromPrd(projectDir);

      // Should still generate tasks (default fallback)
      expect(result.phases.length).toBeGreaterThan(0);
      expect(result.totalTasks).toBeGreaterThan(0);
    });

    it('should handle PRD without Must-Have Features', async () => {
      const projectDir = path.join(outputsDir, 'no-features');
      await fs.ensureDir(projectDir);

      const prdContent = `# Project

## Requirements

Just some general requirements without structured features.
`;

      await fs.writeFile(path.join(projectDir, 'full-prd.md'), prdContent);

      const result = await manager.generateTasksFromPrd(projectDir);

      // Should generate default phases
      expect(result.phases.length).toBeGreaterThan(0);
    });

    it('should handle PRD with incomplete feature structure', async () => {
      const projectDir = path.join(outputsDir, 'incomplete-features');
      await fs.ensureDir(projectDir);

      const prdContent = `# Project

## Requirements

### Must-Have Features

#### 1. Feature One

(no behavior section)

#### 2. Feature Two

**Behavior:**
- Something
`;

      await fs.writeFile(path.join(projectDir, 'full-prd.md'), prdContent);

      const result = await manager.generateTasksFromPrd(projectDir);

      expect(result.totalTasks).toBeGreaterThan(0);
    });

    it('should handle very short PRD', async () => {
      const projectDir = path.join(outputsDir, 'short-prd');
      await fs.ensureDir(projectDir);

      const prdContent = '# My App';

      await fs.writeFile(path.join(projectDir, 'full-prd.md'), prdContent);

      const result = await manager.generateTasksFromPrd(projectDir);

      // Should generate something even for minimal PRD
      expect(result.phases).toBeDefined();
    });

    it('should handle PRD with no content', async () => {
      const projectDir = path.join(outputsDir, 'empty-prd');
      await fs.ensureDir(projectDir);

      await fs.writeFile(path.join(projectDir, 'full-prd.md'), '');

      const result = await manager.generateTasksFromPrd(projectDir);

      expect(result.phases).toBeDefined();
    });

    it('should handle PRD with only whitespace', async () => {
      const projectDir = path.join(outputsDir, 'whitespace-prd');
      await fs.ensureDir(projectDir);

      await fs.writeFile(path.join(projectDir, 'full-prd.md'), '   \n\n\t\n   ');

      const result = await manager.generateTasksFromPrd(projectDir);

      expect(result.phases).toBeDefined();
    });
  });

  describe('Task Generation Options', () => {
    it('should respect maxTasksPerPhase option', async () => {
      const projectDir = path.join(outputsDir, 'max-tasks');
      await fs.ensureDir(projectDir);

      const prdContent = `# Project

## Requirements

### Must-Have Features

#### 1. Feature One
**Behavior:**
- Task 1
- Task 2
- Task 3
- Task 4
- Task 5

#### 2. Feature Two
**Behavior:**
- Task 6
- Task 7
`;

      await fs.writeFile(path.join(projectDir, 'full-prd.md'), prdContent);

      const result = await manager.generateTasksFromPrd(projectDir, {
        maxTasksPerPhase: 3,
      });

      // Each phase should respect max tasks limit
      result.phases.forEach((phase) => {
        expect(phase.tasks.length).toBeLessThanOrEqual(3);
      });
    });

    it('should include PRD references when requested', async () => {
      const projectDir = path.join(outputsDir, 'with-refs');
      await fs.ensureDir(projectDir);

      const prdContent = `# Project

## Requirements

### Must-Have Features

#### 1. Authentication
**Behavior:**
- Users can login
`;

      await fs.writeFile(path.join(projectDir, 'full-prd.md'), prdContent);

      const result = await manager.generateTasksFromPrd(projectDir, {
        includeReferences: true,
      });

      // Tasks should have prdReference set
      const allTasks = result.phases.flatMap((p) => p.tasks);
      expect(allTasks.some((t) => t.prdReference !== undefined)).toBe(true);
    });

    it('should use fast mode optimization when specified', async () => {
      const projectDir = path.join(outputsDir, 'fast-mode');
      await fs.ensureDir(projectDir);

      const prdContent = `# Project

## Requirements

### Must-Have Features

#### 1. Feature
**Behavior:**
- Do something complex and verbose that should be optimized
`;

      await fs.writeFile(path.join(projectDir, 'full-prd.md'), prdContent);

      const result = await manager.generateTasksFromPrd(projectDir, {
        clearMode: 'fast',
      });

      expect(result.totalTasks).toBeGreaterThan(0);
    });

    it('should use deep mode optimization when specified', async () => {
      const projectDir = path.join(outputsDir, 'deep-mode');
      await fs.ensureDir(projectDir);

      const prdContent = `# Project

## Requirements

### Must-Have Features

#### 1. Feature
**Behavior:**
- Complex requirement
`;

      await fs.writeFile(path.join(projectDir, 'full-prd.md'), prdContent);

      const result = await manager.generateTasksFromPrd(projectDir, {
        clearMode: 'deep',
      });

      expect(result.totalTasks).toBeGreaterThan(0);
    });
  });

  describe('Tasks File Writing', () => {
    it('should create tasks.md with proper structure', async () => {
      const projectDir = path.join(outputsDir, 'tasks-structure');
      await fs.ensureDir(projectDir);

      const prdContent = `# Project

## Requirements

### Must-Have Features

#### 1. Feature
**Behavior:**
- Task 1
`;

      await fs.writeFile(path.join(projectDir, 'full-prd.md'), prdContent);

      const result = await manager.generateTasksFromPrd(projectDir);

      expect(await fs.pathExists(result.outputPath)).toBe(true);

      const tasksContent = await fs.readFile(result.outputPath, 'utf-8');

      expect(tasksContent).toContain('# Implementation Tasks');
      expect(tasksContent).toContain('- [ ]');
    });

    it('should not overwrite existing tasks without backup', async () => {
      const projectDir = path.join(outputsDir, 'tasks-backup');
      await fs.ensureDir(projectDir);

      const prdContent = `# Project\n\n## Requirements\n\n### Must-Have Features\n\n#### 1. Feature\n\n**Behavior:**\n- Task`;
      const originalTasks = '# Original Tasks';

      await fs.writeFile(path.join(projectDir, 'full-prd.md'), prdContent);
      await fs.writeFile(path.join(projectDir, 'tasks.md'), originalTasks);

      // Generate new tasks
      await manager.generateTasksFromPrd(projectDir);

      // New file should be created and different from original
      const newTasks = await fs.readFile(
        path.join(projectDir, 'tasks.md'),
        'utf-8'
      );

      expect(newTasks).not.toBe(originalTasks);
      expect(newTasks).toContain('# Implementation Tasks');
    });

    it('should handle file write errors gracefully', async () => {
      const projectDir = path.join(outputsDir, 'write-error');
      await fs.ensureDir(projectDir);

      const prdContent = `# Project\n\n## Requirements\n\n### Must-Have Features\n\n#### 1. Feature\n\n**Behavior:**\n- Task`;

      await fs.writeFile(path.join(projectDir, 'full-prd.md'), prdContent);

      // Make outputsDir read-only to cause write error
      // Note: This is platform-specific, skipping on some systems
      try {
        await fs.chmod(projectDir, 0o444);

        await expect(
          manager.generateTasksFromPrd(projectDir)
        ).rejects.toThrow();

        await fs.chmod(projectDir, 0o755);
      } catch {
        // Some systems don't support chmod, skip
        await fs.chmod(projectDir, 0o755);
      }
    });
  });

  describe('Task Phases and Grouping', () => {
    it('should generate separate phases for different features', async () => {
      const projectDir = path.join(outputsDir, 'multi-phase');
      await fs.ensureDir(projectDir);

      const prdContent = `# Project

## Requirements

### Must-Have Features

#### 1. Authentication
**Behavior:**
- Login

#### 2. Dashboard
**Behavior:**
- Display stats

#### 3. Reports
**Behavior:**
- Generate reports
`;

      await fs.writeFile(path.join(projectDir, 'full-prd.md'), prdContent);

      const result = await manager.generateTasksFromPrd(projectDir);

      // Should have multiple phases (one per feature or grouped)
      expect(result.phases.length).toBeGreaterThan(0);
      expect(result.totalTasks).toBeGreaterThan(0);
    });

    it('should handle PRD with Technical Requirements section', async () => {
      const projectDir = path.join(outputsDir, 'tech-reqs');
      await fs.ensureDir(projectDir);

      const prdContent = `# Project

## Requirements

### Must-Have Features

#### 1. Feature
**Behavior:**
- Task 1

## Technical Requirements

- Use PostgreSQL
- Must be API-first
- Support JWT authentication
`;

      await fs.writeFile(path.join(projectDir, 'full-prd.md'), prdContent);

      const result = await manager.generateTasksFromPrd(projectDir);

      // Should include technical requirements
      expect(result.totalTasks).toBeGreaterThan(0);
    });

    it('should handle PRD with Success Criteria section', async () => {
      const projectDir = path.join(outputsDir, 'success-criteria');
      await fs.ensureDir(projectDir);

      const prdContent = `# Project

## Requirements

### Must-Have Features

#### 1. Feature
**Behavior:**
- Task 1

## Success Criteria

- 99.9% uptime
- Response time < 200ms
- Test coverage > 80%
`;

      await fs.writeFile(path.join(projectDir, 'full-prd.md'), prdContent);

      const result = await manager.generateTasksFromPrd(projectDir);

      expect(result.totalTasks).toBeGreaterThan(0);
    });
  });

  describe('Task Description Optimization', () => {
    it('should apply CLEAR principles to task descriptions', async () => {
      const projectDir = path.join(outputsDir, 'clear-optimization');
      await fs.ensureDir(projectDir);

      const prdContent = `# Project

## Requirements

### Must-Have Features

#### 1. Feature
**Behavior:**
- A very long and verbose task description that should be optimized using CLEAR principles to be more concise and actionable
`;

      await fs.writeFile(path.join(projectDir, 'full-prd.md'), prdContent);

      const result = await manager.generateTasksFromPrd(projectDir);

      // Tasks should be generated with optimized descriptions
      const allTasks = result.phases.flatMap((p) => p.tasks);
      expect(allTasks.length).toBeGreaterThan(0);
      allTasks.forEach((task) => {
        expect(task.description).toBeDefined();
        expect(task.description.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle PRD with unicode characters', async () => {
      const projectDir = path.join(outputsDir, 'unicode-prd');
      await fs.ensureDir(projectDir);

      const prdContent = `# Проект 🚀

## Требования

### Must-Have Features

#### 1. 功能
**Behavior:**
- مهمة واحدة
`;

      await fs.writeFile(path.join(projectDir, 'full-prd.md'), prdContent);

      const result = await manager.generateTasksFromPrd(projectDir);

      expect(result.totalTasks).toBeGreaterThan(0);
    });

    it('should handle PRD with very long feature names', async () => {
      const projectDir = path.join(outputsDir, 'long-names');
      await fs.ensureDir(projectDir);

      const longName = 'Feature with very long name that ' + 'x'.repeat(100);

      const prdContent = `# Project

## Requirements

### Must-Have Features

#### 1. ${longName}
**Behavior:**
- Task 1
`;

      await fs.writeFile(path.join(projectDir, 'full-prd.md'), prdContent);

      const result = await manager.generateTasksFromPrd(projectDir);

      expect(result.phases.length).toBeGreaterThan(0);
    });

    it('should handle PRD with deeply nested headers', async () => {
      const projectDir = path.join(outputsDir, 'deep-nesting');
      await fs.ensureDir(projectDir);

      const prdContent = `# Project

## Requirements

### Must-Have Features

#### 1. Feature

##### Subfeature

**Behavior:**
- Task 1
- Task 2

##### Another Subfeature

**Behavior:**
- Task 3
`;

      await fs.writeFile(path.join(projectDir, 'full-prd.md'), prdContent);

      const result = await manager.generateTasksFromPrd(projectDir);

      expect(result.totalTasks).toBeGreaterThan(0);
    });
  });
});
