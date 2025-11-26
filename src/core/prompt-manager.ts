import fs from 'fs-extra';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { DepthLevel } from './intelligence/types.js';

/**
 * v4.11: Unified prompt metadata
 * Replaces separate fast/deep storage with single directory and depthUsed field
 */
export interface PromptMetadata {
  id: string;
  filename: string;
  depthUsed: DepthLevel; // v4.11: Replaces 'source' field
  timestamp: string;
  createdAt: Date;
  path: string;
  originalPrompt: string;
  executed: boolean;
  executedAt: string | null;
  ageInDays?: number;
  linkedProject?: string;
  // Verification tracking (v4.8)
  verificationRequired: boolean;
  verified: boolean;
  verifiedAt: string | null;
}

export interface PromptsIndex {
  version: string;
  prompts: PromptMetadata[];
}

export interface PromptData {
  metadata: PromptMetadata;
  content: string;
}

export interface PromptFilters {
  depthUsed?: DepthLevel; // v4.11: Filter by depth level
  executed?: boolean;
  stale?: boolean; // >30 days old
  old?: boolean; // >7 days old
}

export interface StorageStats {
  totalPrompts: number;
  standardPrompts: number; // v4.11: Renamed from fastPrompts
  comprehensivePrompts: number; // v4.11: Renamed from deepPrompts
  executedPrompts: number;
  pendingPrompts: number;
  stalePrompts: number;
  oldPrompts: number;
  oldestPromptAge: number;
}

export class PromptManager {
  private readonly promptsDir: string;

  constructor(baseDir?: string) {
    // v4.11: Single prompts directory (no fast/deep subdirs)
    if (baseDir) {
      this.promptsDir = baseDir.endsWith('prompts') ? baseDir : path.join(baseDir, 'prompts');
    } else {
      this.promptsDir = path.join(process.cwd(), '.clavix', 'outputs', 'prompts');
    }
  }

  /**
   * v4.11: Get unified index file path
   */
  private getIndexPath(): string {
    return path.join(this.promptsDir, '.index.json');
  }

  /**
   * v4.11: Ensure prompts directory exists (single directory)
   */
  async ensurePromptsDir(): Promise<void> {
    await fs.ensureDir(this.promptsDir);
  }

  /**
   * v4.11: Generate unique prompt ID with depth and timestamp
   */
  generatePromptId(depthLevel: DepthLevel, _originalPrompt: string): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T');
    const date = timestamp[0].replace(/-/g, '');
    const time = timestamp[1].split('-').slice(0, 3).join('');

    // Use UUID for uniqueness (mockable for tests - first 13 chars for readability)
    const hash = uuidv4().substring(0, 13);

    // v4.11: Use depth level abbreviation in ID
    const depthAbbrev = depthLevel === 'comprehensive' ? 'comp' : 'std';

    return `${depthAbbrev}-${date}-${time}-${hash}`;
  }

  /**
   * v4.11: Save optimized prompt to file system
   */
  async savePrompt(
    content: string,
    depthUsed: DepthLevel,
    originalPrompt: string,
    linkedProject?: string
  ): Promise<PromptMetadata> {
    await this.ensurePromptsDir();

    const id = this.generatePromptId(depthUsed, originalPrompt);
    const filename = `${id}.md`;
    // v4.11: Single directory, no subdirs
    const filePath = path.join(this.promptsDir, filename);
    const now = new Date();

    const metadata: PromptMetadata = {
      id,
      filename,
      depthUsed, // v4.11: Replaces 'source'
      timestamp: now.toISOString(),
      createdAt: now,
      path: filePath,
      originalPrompt,
      executed: false,
      executedAt: null,
      linkedProject,
      // Verification tracking (v4.8)
      verificationRequired: true,
      verified: false,
      verifiedAt: null,
    };

    // Create file with frontmatter
    const frontmatter = [
      '---',
      `id: ${id}`,
      `depthUsed: ${depthUsed}`,
      `timestamp: ${metadata.timestamp}`,
      `executed: ${metadata.executed}`,
      `originalPrompt: ${originalPrompt}`,
      linkedProject ? `linkedProject: ${linkedProject}` : '',
      `verificationRequired: ${metadata.verificationRequired}`,
      `verified: ${metadata.verified}`,
      '---',
      '',
    ]
      .filter(Boolean)
      .join('\n');

    const fileContent = frontmatter + content;
    await fs.writeFile(filePath, fileContent, 'utf-8');

    // Update index
    await this.addToIndex(metadata);

    return metadata;
  }

  /**
   * v4.11: Load prompt by ID
   */
  async loadPrompt(id: string): Promise<PromptData | null> {
    const index = await this.loadIndex();
    const metadata = index.prompts.find((p) => p.id === id);

    if (!metadata) {
      return null;
    }

    // v4.11: Single directory - no subdirs
    const filePath = path.join(this.promptsDir, metadata.filename);

    if (!(await fs.pathExists(filePath))) {
      return null;
    }

    const content = await fs.readFile(filePath, 'utf-8');

    // Strip frontmatter for clean content
    const contentWithoutFrontmatter = content.replace(/^---\n[\s\S]*?\n---\n*/, '');

    return {
      metadata,
      content: contentWithoutFrontmatter,
    };
  }

  /**
   * v4.11: List prompts with optional filtering
   */
  async listPrompts(filters?: PromptFilters): Promise<PromptMetadata[]> {
    const index = await this.loadIndex();
    let prompts = index.prompts;

    // Apply filters
    if (filters) {
      // v4.11: Filter by depth level
      if (filters.depthUsed) {
        prompts = prompts.filter((p) => p.depthUsed === filters.depthUsed);
      }
      if (filters.executed !== undefined) {
        prompts = prompts.filter((p) => p.executed === filters.executed);
      }
      if (filters.stale) {
        prompts = prompts.filter((p) => this.getPromptAge(p) > 30);
      }
      if (filters.old) {
        prompts = prompts.filter((p) => this.getPromptAge(p) > 7);
      }
    }

    // Add age calculation
    prompts = prompts.map((p) => ({
      ...p,
      createdAt: new Date(p.timestamp),
      ageInDays: this.getPromptAge(p),
    }));

    // Sort by timestamp (newest first)
    prompts.sort((a, b) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    return prompts;
  }

  /**
   * v4.11: Mark prompt as executed
   */
  async markExecuted(id: string): Promise<void> {
    const index = await this.loadIndex();
    const indexPrompt = index.prompts.find((p) => p.id === id);

    if (!indexPrompt) {
      throw new Error(`Prompt not found: ${id}`);
    }

    indexPrompt.executed = true;
    indexPrompt.executedAt = new Date().toISOString();
    await this.saveIndex(index);
  }

  /**
   * v4.11: Mark prompt as verified (v4.8)
   */
  async markVerified(id: string): Promise<void> {
    const index = await this.loadIndex();
    const indexPrompt = index.prompts.find((p) => p.id === id);

    if (!indexPrompt) {
      throw new Error(`Prompt not found: ${id}`);
    }

    indexPrompt.verified = true;
    indexPrompt.verifiedAt = new Date().toISOString();
    await this.saveIndex(index);
  }

  /**
   * v4.11: Delete prompts by filter
   */
  async deletePrompts(filters: PromptFilters): Promise<number> {
    const toDelete = await this.listPrompts(filters);
    let deleteCount = 0;

    const deletedIds = new Set<string>();

    for (const prompt of toDelete) {
      // v4.11: Single directory - no subdirs
      const filePath = path.join(this.promptsDir, prompt.filename);

      if (await fs.pathExists(filePath)) {
        await fs.remove(filePath);
        deleteCount++;
        deletedIds.add(prompt.id);
      }
    }

    // Update unified index
    if (deletedIds.size > 0) {
      const index = await this.loadIndex();
      index.prompts = index.prompts.filter((p) => !deletedIds.has(p.id));
      await this.saveIndex(index);
    }

    return deleteCount;
  }

  /**
   * Get age of prompt in days
   */
  getPromptAge(prompt: PromptMetadata): number {
    const created = new Date(prompt.timestamp);
    const now = new Date();
    const diffMs = now.getTime() - created.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  }

  /**
   * Get stale prompts (>30 days old)
   */
  async getStalePrompts(_daysOld: number = 30): Promise<PromptMetadata[]> {
    return this.listPrompts({ stale: true });
  }

  /**
   * v4.11: Get storage statistics
   */
  async getStorageStats(): Promise<StorageStats> {
    const allPrompts = await this.listPrompts();

    const stats: StorageStats = {
      totalPrompts: allPrompts.length,
      standardPrompts: allPrompts.filter((p) => p.depthUsed === 'standard').length,
      comprehensivePrompts: allPrompts.filter((p) => p.depthUsed === 'comprehensive').length,
      executedPrompts: allPrompts.filter((p) => p.executed).length,
      pendingPrompts: allPrompts.filter((p) => !p.executed).length,
      stalePrompts: allPrompts.filter((p) => (p.ageInDays || 0) > 30).length,
      oldPrompts: allPrompts.filter((p) => (p.ageInDays || 0) > 7).length,
      oldestPromptAge:
        allPrompts.length > 0 ? Math.max(...allPrompts.map((p) => p.ageInDays || 0)) : 0,
    };

    return stats;
  }

  /**
   * v4.11: Load unified index from file
   */
  private async loadIndex(): Promise<PromptsIndex> {
    const indexPath = this.getIndexPath();
    if (!(await fs.pathExists(indexPath))) {
      return {
        version: '2.0', // v4.11: New version for unified index
        prompts: [],
      };
    }

    try {
      const content = await fs.readFile(indexPath, 'utf-8');
      const parsed = JSON.parse(content);
      // Ensure prompts array exists
      return {
        version: parsed.version || '2.0',
        prompts: Array.isArray(parsed.prompts) ? parsed.prompts : [],
      };
    } catch {
      // Corrupt index, return empty
      return {
        version: '2.0',
        prompts: [],
      };
    }
  }

  /**
   * v4.11: Save unified index to file
   */
  private async saveIndex(index: PromptsIndex): Promise<void> {
    const indexPath = this.getIndexPath();
    await fs.ensureDir(path.dirname(indexPath));
    await fs.writeFile(indexPath, JSON.stringify(index, null, 2), 'utf-8');
  }

  /**
   * v4.11: Add prompt to unified index
   */
  private async addToIndex(metadata: PromptMetadata): Promise<void> {
    const index = await this.loadIndex();

    // Remove any existing entry with same ID (shouldn't happen, but be safe)
    index.prompts = index.prompts.filter((p) => p.id !== metadata.id);

    // Add new entry
    index.prompts.push(metadata);

    await this.saveIndex(index);
  }
}
