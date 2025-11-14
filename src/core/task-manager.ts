/**
 * TaskManager - Manages PRD-based task generation and execution
 *
 * This class handles:
 * - Analyzing PRD documents
 * - Generating CLEAR-optimized task breakdowns
 * - Reading/writing tasks.md with checkbox format
 * - Tracking task completion state
 * - Managing session resume capability
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import { PromptOptimizer } from './prompt-optimizer';
import { FileSystem } from '../utils/file-system';

/**
 * Represents a single task in the implementation plan
 */
export interface Task {
  id: string;
  description: string;
  phase: string;
  completed: boolean;
  prdReference?: string;
}

/**
 * Represents a phase/section of tasks
 */
export interface TaskPhase {
  name: string;
  tasks: Task[];
}

/**
 * Options for task generation
 */
export interface TaskGenerationOptions {
  maxTasksPerPhase?: number;
  includeReferences?: boolean;
  clearMode?: 'fast' | 'deep';
}

/**
 * Result of task generation
 */
export interface TaskGenerationResult {
  phases: TaskPhase[];
  totalTasks: number;
  outputPath: string;
}

/**
 * TaskManager class
 *
 * Generates and manages implementation tasks from PRD documents
 */
export class TaskManager {
  private readonly optimizer: PromptOptimizer;

  constructor() {
    this.optimizer = new PromptOptimizer();
  }

  /**
   * Generate tasks.md from PRD
   *
   * @param prdPath - Path to the PRD directory
   * @param options - Generation options
   * @returns Task generation result
   */
  async generateTasksFromPrd(
    prdPath: string,
    options: TaskGenerationOptions = {}
  ): Promise<TaskGenerationResult> {
    // Read the full PRD
    const fullPrdPath = await this.findPrdFile(prdPath);
    const prdContent = await fs.readFile(fullPrdPath, 'utf-8');

    // Analyze PRD and generate tasks
    const phases = await this.analyzePrdAndGenerateTasks(prdContent, options);

    // Write tasks.md
    const outputPath = path.join(prdPath, 'tasks.md');
    await this.writeTasksFile(outputPath, phases, prdContent);

    return {
      phases,
      totalTasks: phases.reduce((sum, phase) => sum + phase.tasks.length, 0),
      outputPath,
    };
  }

  /**
   * Find the PRD file in a directory
   */
  private async findPrdFile(prdPath: string): Promise<string> {
    // Try common PRD filenames
    const possibleFiles = [
      'PRD.md',
      'full-prd.md',
      'prd.md',
      'Full-PRD.md',
    ];

    for (const filename of possibleFiles) {
      const filepath = path.join(prdPath, filename);
      if (await fs.pathExists(filepath)) {
        return filepath;
      }
    }

    throw new Error(`No PRD file found in ${prdPath}`);
  }

  /**
   * Analyze PRD content and generate task breakdown
   */
  private async analyzePrdAndGenerateTasks(
    prdContent: string,
    _options: TaskGenerationOptions
  ): Promise<TaskPhase[]> {
    const phases: TaskPhase[] = [];

    // Parse PRD sections
    const sections = this.parsePrdSections(prdContent);

    // Generate tasks based on requirements sections
    if (sections.requirements) {
      phases.push(...this.generateTasksFromRequirements(sections.requirements, sections));
    }

    // Ensure all tasks follow CLEAR principles
    phases.forEach((phase) => {
      phase.tasks = phase.tasks.map((task) => ({
        ...task,
        description: this.optimizeTaskDescription(task.description),
      }));
    });

    return phases;
  }

  /**
   * Parse PRD into sections
   */
  private parsePrdSections(prdContent: string): Record<string, string> {
    const sections: Record<string, string> = {};
    const lines = prdContent.split('\n');

    let currentSection = '';
    let currentContent: string[] = [];

    for (const line of lines) {
      // Check for section headers (## or ###)
      if (line.match(/^##\s+(.+)/)) {
        // Save previous section
        if (currentSection) {
          sections[this.normalizeSectionName(currentSection)] = currentContent.join('\n').trim();
        }

        // Start new section
        currentSection = line.replace(/^##\s+/, '').trim();
        currentContent = [];
      } else {
        currentContent.push(line);
      }
    }

    // Save last section
    if (currentSection) {
      sections[this.normalizeSectionName(currentSection)] = currentContent.join('\n').trim();
    }

    return sections;
  }

  /**
   * Normalize section name for consistent lookup
   */
  private normalizeSectionName(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  /**
   * Generate tasks from requirements section
   */
  private generateTasksFromRequirements(
    requirementsContent: string,
    _allSections: Record<string, string>
  ): TaskPhase[] {
    const phases: TaskPhase[] = [];

    // Extract must-have features section (stop at next ### or ##)
    const mustHaveMatch = requirementsContent.match(/### Must-Have Features([\s\S]*?)(?=###|##|$)/);
    if (mustHaveMatch) {
      const featuresContent = mustHaveMatch[1];

      // Split by feature headers (#### Number. Feature Name)
      const featureHeaders = [...featuresContent.matchAll(/####\s+(\d+)\.\s+(.+)/g)];

      for (let i = 0; i < featureHeaders.length; i++) {
        const featureNumber = featureHeaders[i][1];
        const featureName = featureHeaders[i][2].trim();

        // Extract content between this header and the next one
        const startIndex = featureHeaders[i].index!;
        const endIndex = i < featureHeaders.length - 1
          ? featureHeaders[i + 1].index!
          : featuresContent.length;

        const featureContent = featuresContent.substring(startIndex, endIndex);

        // Generate phase for this feature
        const phase = this.generatePhaseFromFeature(
          featureName,
          featureContent,
          `Phase ${featureNumber}`
        );

        if (phase && phase.tasks.length > 0) {
          phases.push(phase);
        }
      }
    }

    // If no structured features found, create a general implementation phase
    if (phases.length === 0) {
      phases.push(this.generateDefaultPhases(requirementsContent));
    }

    return phases;
  }

  /**
   * Generate a phase from a feature description
   */
  private generatePhaseFromFeature(
    featureName: string,
    featureContent: string,
    phasePrefix: string
  ): TaskPhase | null {
    const tasks: Task[] = [];

    // Extract behavior points
    const behaviorMatch = featureContent.match(/\*\*Behavior\*\*:([\s\S]*?)(?=\*\*|####|$)/);
    if (behaviorMatch) {
      const behaviors = behaviorMatch[1];
      const bulletPoints = behaviors.match(/^[-*]\s+(.+)$/gm);

      if (bulletPoints) {
        bulletPoints.forEach((bullet, index) => {
          const description = bullet.replace(/^[-*]\s+/, '').trim();
          // Skip overly long bullets (likely multi-line descriptions)
          if (description.length < 200) {
            tasks.push({
              id: `${this.sanitizeId(featureName)}-${index + 1}`,
              description: this.convertBehaviorToTask(description),
              phase: phasePrefix,
              completed: false,
              prdReference: featureName,
            });
          }
        });
      }
    }

    // If no behavior points, try to extract from feature description
    if (tasks.length === 0) {
      tasks.push({
        id: this.sanitizeId(featureName),
        description: `Implement ${featureName.toLowerCase()}`,
        phase: phasePrefix,
        completed: false,
        prdReference: featureName,
      });
    }

    return {
      name: `${phasePrefix}: ${featureName}`,
      tasks,
    };
  }

  /**
   * Convert behavior description to task description
   */
  private convertBehaviorToTask(behavior: string): string {
    // Remove ** bold markers
    let task = behavior.replace(/\*\*/g, '');

    // If starts with action verb, keep as is
    // Otherwise, prepend "Implement"
    const actionVerbs = /^(Create|Add|Implement|Build|Generate|Read|Write|Parse|Analyze|Display|Update|Handle|Process|Execute|Mark|Track|Ensure|Validate|Configure)/i;

    if (!actionVerbs.test(task)) {
      task = `Implement ${task.charAt(0).toLowerCase() + task.slice(1)}`;
    }

    return task;
  }

  /**
   * Generate default phases when no structure found
   */
  private generateDefaultPhases(_requirementsContent: string): TaskPhase {
    return {
      name: 'Phase 1: Implementation',
      tasks: [
        {
          id: 'setup-1',
          description: 'Set up project structure and dependencies',
          phase: 'Phase 1',
          completed: false,
        },
        {
          id: 'implement-1',
          description: 'Implement core functionality as described in requirements',
          phase: 'Phase 1',
          completed: false,
          prdReference: 'Requirements',
        },
        {
          id: 'test-1',
          description: 'Add tests and validation',
          phase: 'Phase 1',
          completed: false,
        },
      ],
    };
  }

  /**
   * Sanitize ID for use in task IDs
   */
  private sanitizeId(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 30);
  }

  /**
   * Optimize task description using CLEAR principles
   */
  private optimizeTaskDescription(description: string): string {
    // Ensure conciseness: limit to reasonable length
    if (description.length > 150) {
      description = description.substring(0, 147) + '...';
    }

    // Ensure starts with action verb
    const actionVerbs = /^(Create|Add|Implement|Build|Generate|Read|Write|Parse|Analyze|Display|Update|Handle|Process|Execute|Mark|Track|Ensure|Validate|Configure|Set up|Fix|Refactor|Test)/i;

    if (!actionVerbs.test(description)) {
      description = `Implement ${description}`;
    }

    return description;
  }

  /**
   * Write tasks to tasks.md file
   */
  private async writeTasksFile(
    outputPath: string,
    phases: TaskPhase[],
    prdContent: string
  ): Promise<void> {
    let content = '# Implementation Tasks\n\n';

    // Extract project name from PRD
    const projectMatch = prdContent.match(/^#\s+(.+?)$/m);
    if (projectMatch) {
      content += `**Project**: ${projectMatch[1]}\n\n`;
    }

    content += `**Generated**: ${new Date().toLocaleString()}\n\n`;
    content += '---\n\n';

    // Add phases and tasks
    for (const phase of phases) {
      content += `## ${phase.name}\n\n`;

      for (const task of phase.tasks) {
        const checkbox = task.completed ? '[x]' : '[ ]';
        const reference = task.prdReference ? ` (ref: ${task.prdReference})` : '';
        content += `- ${checkbox} ${task.description}${reference}\n`;
      }

      content += '\n';
    }

    // Add footer
    content += '---\n\n';
    content += '*Generated by Clavix /clavix:plan*\n';

    await FileSystem.writeFileAtomic(outputPath, content);
  }

  /**
   * Read tasks from tasks.md file
   */
  async readTasksFile(tasksPath: string): Promise<TaskPhase[]> {
    if (!(await fs.pathExists(tasksPath))) {
      throw new Error(`Tasks file not found: ${tasksPath}`);
    }

    const content = await fs.readFile(tasksPath, 'utf-8');
    return this.parseTasksFile(content);
  }

  /**
   * Parse tasks.md content into TaskPhase objects
   */
  private parseTasksFile(content: string): TaskPhase[] {
    const phases: TaskPhase[] = [];
    const lines = content.split('\n');

    let currentPhase: TaskPhase | null = null;
    let taskCounter = 0;

    for (const line of lines) {
      // Check for phase header (## Phase Name)
      const phaseMatch = line.match(/^##\s+(.+)$/);
      if (phaseMatch) {
        if (currentPhase) {
          phases.push(currentPhase);
        }

        currentPhase = {
          name: phaseMatch[1].trim(),
          tasks: [],
        };
        taskCounter = 0;
        continue;
      }

      // Check for task (- [ ] or - [x] Task description)
      const taskMatch = line.match(/^-\s+\[([ x])\]\s+(.+?)(?:\s+\(ref:\s+(.+?)\))?$/);
      if (taskMatch && currentPhase) {
        const completed = taskMatch[1] === 'x';
        const description = taskMatch[2].trim();
        const reference = taskMatch[3]?.trim();

        taskCounter++;
        currentPhase.tasks.push({
          id: `${this.sanitizeId(currentPhase.name)}-${taskCounter}`,
          description,
          phase: currentPhase.name,
          completed,
          prdReference: reference,
        });
      }
    }

    // Add last phase
    if (currentPhase) {
      phases.push(currentPhase);
    }

    return phases;
  }

  /**
   * Find the first incomplete task
   */
  findFirstIncompleteTask(phases: TaskPhase[]): Task | null {
    for (const phase of phases) {
      for (const task of phase.tasks) {
        if (!task.completed) {
          return task;
        }
      }
    }
    return null;
  }

  /**
   * Mark a task as completed in the tasks.md file
   */
  async markTaskCompleted(tasksPath: string, taskId: string): Promise<void> {
    const phases = await this.readTasksFile(tasksPath);

    // Find and mark the task
    let found = false;
    for (const phase of phases) {
      for (const task of phase.tasks) {
        if (task.id === taskId) {
          task.completed = true;
          found = true;
          break;
        }
      }
      if (found) break;
    }

    if (!found) {
      throw new Error(`Task not found: ${taskId}`);
    }

    // Read original content to preserve formatting
    const content = await fs.readFile(tasksPath, 'utf-8');

    // Find the task line and replace [ ] with [x]
    // We need to find the exact task by description
    const targetTask = phases
      .flatMap((p) => p.tasks)
      .find((t) => t.id === taskId);

    if (!targetTask) {
      throw new Error(`Task not found: ${taskId}`);
    }

    // Replace - [ ] with - [x] for this specific task description
    const taskDescPattern = this.escapeRegex(targetTask.description);
    const refPattern = targetTask.prdReference
      ? `\\s+\\(ref:\\s+${this.escapeRegex(targetTask.prdReference)}\\)`
      : '';

    const regex = new RegExp(
      `^(-\\s+\\[)( )(\\]\\s+${taskDescPattern}${refPattern})$`,
      'm'
    );

    const updatedContent = content.replace(regex, '$1x$3');

    await FileSystem.writeFileAtomic(tasksPath, updatedContent);
  }

  /**
   * Escape special regex characters
   */
  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Get task completion statistics
   */
  getTaskStats(phases: TaskPhase[]): {
    total: number;
    completed: number;
    remaining: number;
    percentage: number;
  } {
    const allTasks = phases.flatMap((p) => p.tasks);
    const total = allTasks.length;
    const completed = allTasks.filter((t) => t.completed).length;
    const remaining = total - completed;
    const percentage = total > 0 ? (completed / total) * 100 : 0;

    return { total, completed, remaining, percentage };
  }

  /**
   * Find PRD directory from current working directory
   */
  async findPrdDirectory(projectName?: string): Promise<string> {
    const baseDir = '.clavix/outputs';

    if (!await fs.pathExists(baseDir)) {
      throw new Error('No .clavix/outputs directory found. Have you generated a PRD yet?');
    }

    // If project name specified, look for it
    if (projectName) {
      const projectPath = path.join(baseDir, projectName);
      if (await fs.pathExists(projectPath)) {
        return projectPath;
      }
      throw new Error(`PRD project not found: ${projectName}`);
    }

    // Otherwise, find most recent PRD directory
    const dirs = await fs.readdir(baseDir);
    const prdDirs = [];

    for (const dir of dirs) {
      const fullPath = path.join(baseDir, dir);
      const stat = await fs.stat(fullPath);

      if (stat.isDirectory()) {
        // Check if it has a PRD file
        const hasPrd = await this.hasPrdFile(fullPath);
        if (hasPrd) {
          prdDirs.push({
            path: fullPath,
            mtime: stat.mtime,
          });
        }
      }
    }

    if (prdDirs.length === 0) {
      throw new Error('No PRD directories found in .clavix/outputs');
    }

    // Return most recent
    prdDirs.sort((a, b) => b.mtime.getTime() - a.mtime.getTime());
    return prdDirs[0].path;
  }

  /**
   * Check if directory has a PRD file
   */
  public async hasPrdFile(dirPath: string): Promise<boolean> {
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
}
