/**
 * ArchiveManager - Manages archival of completed PRD projects
 *
 * This class handles:
 * - Listing active and archived PRD projects
 * - Checking task completion status
 * - Moving completed projects to archive
 * - Managing archive directory structure
 */

import fs from 'fs-extra';
import * as path from 'path';
import { TaskManager, TaskPhase } from './task-manager.js';

/**
 * Status of a PRD project's tasks
 */
export interface TaskStatus {
  hasTasksFile: boolean;
  total: number;
  completed: number;
  remaining: number;
  percentage: number;
  allCompleted: boolean;
}

/**
 * Information about a PRD project
 */
export interface PrdProject {
  name: string;
  path: string;
  taskStatus: TaskStatus;
  modifiedTime: Date;
  isArchived: boolean;
}

/**
 * ArchiveManager class
 *
 * Manages archival of completed PRD projects
 */
export class ArchiveManager {
  private readonly taskManager: TaskManager;
  private readonly outputsDir = '.clavix/outputs';
  private readonly archiveDir = '.clavix/outputs/archive';

  constructor() {
    this.taskManager = new TaskManager();
  }

  /**
   * List all PRD projects in outputs directory
   *
   * @param includeArchived - Include archived projects in results
   * @returns Array of PRD projects
   */
  async listPrdProjects(includeArchived = false): Promise<PrdProject[]> {
    const projects: PrdProject[] = [];

    // Check if outputs directory exists
    if (!(await fs.pathExists(this.outputsDir))) {
      return projects;
    }

    const dirs = await fs.readdir(this.outputsDir);

    for (const dir of dirs) {
      // Skip archive directory when listing active projects
      if (dir === 'archive' && !includeArchived) {
        continue;
      }

      const fullPath = path.join(this.outputsDir, dir);
      const stat = await fs.stat(fullPath);

      if (stat.isDirectory()) {
        // Check if it has a PRD file
        if (await this.hasPrdFile(fullPath)) {
          const taskStatus = await this.checkTasksStatus(fullPath);

          projects.push({
            name: dir,
            path: fullPath,
            taskStatus,
            modifiedTime: stat.mtime,
            isArchived: false,
          });
        }
      }
    }

    // Add archived projects if requested
    if (includeArchived) {
      const archivedProjects = await this.listArchivedProjects();
      projects.push(...archivedProjects);
    }

    // Sort by modification time (most recent first)
    projects.sort((a, b) => b.modifiedTime.getTime() - a.modifiedTime.getTime());

    return projects;
  }

  /**
   * List archived PRD projects
   *
   * @returns Array of archived PRD projects
   */
  async listArchivedProjects(): Promise<PrdProject[]> {
    const projects: PrdProject[] = [];

    if (!(await fs.pathExists(this.archiveDir))) {
      return projects;
    }

    const dirs = await fs.readdir(this.archiveDir);

    for (const dir of dirs) {
      const fullPath = path.join(this.archiveDir, dir);
      const stat = await fs.stat(fullPath);

      if (stat.isDirectory()) {
        if (await this.hasPrdFile(fullPath)) {
          const taskStatus = await this.checkTasksStatus(fullPath);

          projects.push({
            name: dir,
            path: fullPath,
            taskStatus,
            modifiedTime: stat.mtime,
            isArchived: true,
          });
        }
      }
    }

    return projects;
  }

  /**
   * Get PRD projects that are ready to archive (all tasks completed)
   *
   * @returns Array of archivable PRD projects
   */
  async getArchivablePrds(): Promise<PrdProject[]> {
    const allProjects = await this.listPrdProjects(false);

    // Filter to only projects with all tasks completed
    return allProjects.filter(
      (project) =>
        project.taskStatus.hasTasksFile && project.taskStatus.allCompleted
    );
  }

  /**
   * Check task completion status for a PRD project
   *
   * @param projectPath - Path to the PRD project directory
   * @returns Task status information
   */
  async checkTasksStatus(projectPath: string): Promise<TaskStatus> {
    const tasksPath = path.join(projectPath, 'tasks.md');

    // Check if tasks.md exists
    if (!(await fs.pathExists(tasksPath))) {
      return {
        hasTasksFile: false,
        total: 0,
        completed: 0,
        remaining: 0,
        percentage: 0,
        allCompleted: false,
      };
    }

    try {
      // Read and parse tasks
      const phases: TaskPhase[] = await this.taskManager.readTasksFile(tasksPath);
      const stats = this.taskManager.getTaskStats(phases);

      return {
        hasTasksFile: true,
        total: stats.total,
        completed: stats.completed,
        remaining: stats.remaining,
        percentage: stats.percentage,
        allCompleted: stats.remaining === 0 && stats.total > 0,
      };
    } catch {
      // If parsing fails, return error status
      return {
        hasTasksFile: true,
        total: 0,
        completed: 0,
        remaining: 0,
        percentage: 0,
        allCompleted: false,
      };
    }
  }

  /**
   * Archive a PRD project (move to archive directory)
   *
   * @param projectName - Name of the project to archive
   * @param force - Force archive even if tasks are incomplete
   * @returns Success status and message
   */
  async archiveProject(
    projectName: string,
    force = false
  ): Promise<{ success: boolean; message: string }> {
    const sourcePath = path.join(this.outputsDir, projectName);

    // Check if project exists
    if (!(await fs.pathExists(sourcePath))) {
      return {
        success: false,
        message: `Project not found: ${projectName}`,
      };
    }

    // Check if it's already in archive
    if (sourcePath.includes('/archive/')) {
      return {
        success: false,
        message: `Project is already archived: ${projectName}`,
      };
    }

    // Check task status unless forced
    if (!force) {
      const taskStatus = await this.checkTasksStatus(sourcePath);

      if (!taskStatus.hasTasksFile) {
        return {
          success: false,
          message: `Project has no tasks.md file. Use --force to archive anyway.`,
        };
      }

      if (!taskStatus.allCompleted) {
        return {
          success: false,
          message: `Project has ${taskStatus.remaining} incomplete task(s). Use --force to archive anyway.`,
        };
      }
    }

    // Ensure archive directory exists
    await fs.ensureDir(this.archiveDir);

    // Move project to archive
    const destPath = path.join(this.archiveDir, projectName);

    // Check if destination already exists
    if (await fs.pathExists(destPath)) {
      return {
        success: false,
        message: `Archive already contains a project named: ${projectName}`,
      };
    }

    try {
      await fs.move(sourcePath, destPath);

      return {
        success: true,
        message: `Successfully archived ${projectName} to ${destPath}`,
      };
    } catch (error: unknown) {
      const { getErrorMessage } = await import('../utils/error-utils.js');
      return {
        success: false,
        message: `Failed to archive project: ${getErrorMessage(error)}`,
      };
    }
  }

  /**
   * Restore an archived project back to active outputs
   *
   * @param projectName - Name of the archived project to restore
   * @returns Success status and message
   */
  async restoreProject(
    projectName: string
  ): Promise<{ success: boolean; message: string }> {
    const sourcePath = path.join(this.archiveDir, projectName);

    // Check if archived project exists
    if (!(await fs.pathExists(sourcePath))) {
      return {
        success: false,
        message: `Archived project not found: ${projectName}`,
      };
    }

    const destPath = path.join(this.outputsDir, projectName);

    // Check if destination already exists
    if (await fs.pathExists(destPath)) {
      return {
        success: false,
        message: `Active outputs already contains a project named: ${projectName}`,
      };
    }

    try {
      await fs.move(sourcePath, destPath);

      return {
        success: true,
        message: `Successfully restored ${projectName} to ${destPath}`,
      };
    } catch (error: unknown) {
      const { getErrorMessage } = await import('../utils/error-utils.js');
      return {
        success: false,
        message: `Failed to restore project: ${getErrorMessage(error)}`,
      };
    }
  }

  /**
   * Check if a directory contains a PRD file
   */
  private async hasPrdFile(dirPath: string): Promise<boolean> {
    const possibleFiles = [
      'PRD.md',
      'full-prd.md',
      'prd.md',
      'Full-PRD.md',
      'FULL_PRD.md',
      'FULL-PRD.md',
      'QUICK_PRD.md',
    ];

    for (const filename of possibleFiles) {
      if (await fs.pathExists(path.join(dirPath, filename))) {
        return true;
      }
    }

    return false;
  }

  /**
   * Get incomplete tasks for a project (for display purposes)
   *
   * @param projectPath - Path to the PRD project
   * @returns Array of incomplete task descriptions
   */
  async getIncompleteTasks(projectPath: string): Promise<string[]> {
    const tasksPath = path.join(projectPath, 'tasks.md');

    if (!(await fs.pathExists(tasksPath))) {
      return [];
    }

    try {
      const phases: TaskPhase[] = await this.taskManager.readTasksFile(tasksPath);
      const incompleteTasks: string[] = [];

      for (const phase of phases) {
        for (const task of phase.tasks) {
          if (!task.completed) {
            incompleteTasks.push(`[${phase.name}] ${task.description}`);
          }
        }
      }

      return incompleteTasks;
    } catch {
      return [];
    }
  }
}
