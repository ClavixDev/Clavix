import fs from 'fs-extra';
import * as path from 'path';
import { PermissionError, DataError } from '../types/errors.js';

/**
 * FileSystem utility class for safe file operations
 */
export class FileSystem {
  /**
   * Atomically write file with backup
   */
  static async writeFileAtomic(filePath: string, content: string): Promise<void> {
    const fullPath = path.resolve(filePath);
    const backupPath = `${fullPath}.backup`;

    try {
      // Create backup if file exists
      if (await fs.pathExists(fullPath)) {
        await fs.copy(fullPath, backupPath);
      }

      // Write new content
      await fs.writeFile(fullPath, content, 'utf-8');

      // Remove backup on success
      if (await fs.pathExists(backupPath)) {
        await fs.remove(backupPath);
      }
    } catch (error: unknown) {
      // Restore backup if write failed
      if (await fs.pathExists(backupPath)) {
        try {
          await fs.copy(backupPath, fullPath);
          await fs.remove(backupPath);
        } catch {
          throw new DataError(
            'Failed to write file and restore backup',
            `Check file permissions for ${fullPath}`
          );
        }
      }

      const { isNodeError, toError } = await import('./error-utils.js');
      if (isNodeError(error) && (error.code === 'EACCES' || error.code === 'EPERM')) {
        throw new PermissionError(
          `Permission denied: Cannot write to ${filePath}`,
          'Try running with appropriate permissions or check file ownership'
        );
      }

      throw toError(error);
    }
  }

  /**
   * Safely read file
   */
  static async readFile(filePath: string): Promise<string> {
    const fullPath = path.resolve(filePath);

    try {
      if (!(await fs.pathExists(fullPath))) {
        throw new DataError(`File not found: ${filePath}`);
      }

      return await fs.readFile(fullPath, 'utf-8');
    } catch (error: unknown) {
      const { isNodeError, toError } = await import('./error-utils.js');
      if (isNodeError(error) && (error.code === 'EACCES' || error.code === 'EPERM')) {
        throw new PermissionError(
          `Permission denied: Cannot read ${filePath}`,
          'Check file permissions'
        );
      }

      throw toError(error);
    }
  }

  /**
   * Ensure directory exists with proper permissions
   */
  static async ensureDir(dirPath: string): Promise<void> {
    const fullPath = path.resolve(dirPath);

    try {
      await fs.ensureDir(fullPath);
    } catch (error: unknown) {
      const { isNodeError, toError } = await import('./error-utils.js');
      if (isNodeError(error) && (error.code === 'EACCES' || error.code === 'EPERM')) {
        throw new PermissionError(
          `Permission denied: Cannot create directory ${dirPath}`,
          'Check parent directory permissions'
        );
      }

      throw toError(error);
    }
  }

  /**
   * Check if path exists
   */
  static async exists(filePath: string): Promise<boolean> {
    return fs.pathExists(path.resolve(filePath));
  }

  /**
   * Check if path is a directory
   */
  static async isDirectory(filePath: string): Promise<boolean> {
    try {
      const stats = await fs.stat(path.resolve(filePath));
      return stats.isDirectory();
    } catch {
      return false;
    }
  }

  /**
   * Read directory contents
   */
  static async readdir(
    dirPath: string,
    options?: { withFileTypes: true }
  ): Promise<fs.Dirent[]>;
  static async readdir(dirPath: string): Promise<string[]>;
  static async readdir(
    dirPath: string,
    options?: { withFileTypes?: boolean }
  ): Promise<string[] | fs.Dirent[]> {
    const fullPath = path.resolve(dirPath);
    if (options?.withFileTypes) {
      return fs.readdir(fullPath, { withFileTypes: true });
    }
    return fs.readdir(fullPath);
  }

  /**
   * Check if path is writable
   */
  static async isWritable(filePath: string): Promise<boolean> {
    const fullPath = path.resolve(filePath);

    try {
      await fs.access(fullPath, fs.constants.W_OK);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Create backup of file
   */
  static async backup(filePath: string): Promise<string> {
    const fullPath = path.resolve(filePath);
    const backupPath = `${fullPath}.backup`;

    try {
      if (await fs.pathExists(fullPath)) {
        await fs.copy(fullPath, backupPath);
      }
      return backupPath;
    } catch {
      throw new PermissionError(
        `Failed to create backup of ${filePath}`,
        'Check file permissions'
      );
    }
  }

  /**
   * Restore from backup
   */
  static async restoreBackup(filePath: string): Promise<void> {
    const fullPath = path.resolve(filePath);
    const backupPath = `${fullPath}.backup`;

    try {
      if (await fs.pathExists(backupPath)) {
        await fs.copy(backupPath, fullPath);
        await fs.remove(backupPath);
      }
    } catch {
      throw new DataError(
        `Failed to restore backup for ${filePath}`,
        'Manual recovery may be required'
      );
    }
  }

  /**
   * List files in directory
   */
  static async listFiles(dirPath: string, pattern?: RegExp): Promise<string[]> {
    const fullPath = path.resolve(dirPath);

    try {
      if (!(await this.exists(fullPath))) {
        return [];
      }

      const files = await fs.readdir(fullPath);

      if (pattern) {
        return files.filter((file) => pattern.test(file));
      }

      return files;
    } catch (error: unknown) {
      const { isNodeError, toError } = await import('./error-utils.js');
      if (isNodeError(error) && (error.code === 'EACCES' || error.code === 'EPERM')) {
        throw new PermissionError(
          `Permission denied: Cannot read directory ${dirPath}`,
          'Check directory permissions'
        );
      }

      throw toError(error);
    }
  }

  /**
   * Copy file or directory
   */
  static async copy(src: string, dest: string): Promise<void> {
    const srcPath = path.resolve(src);
    const destPath = path.resolve(dest);

    try {
      await fs.copy(srcPath, destPath);
    } catch (error: unknown) {
      const { isNodeError, toError } = await import('./error-utils.js');
      if (isNodeError(error) && (error.code === 'EACCES' || error.code === 'EPERM')) {
        throw new PermissionError(
          `Permission denied: Cannot copy from ${src} to ${dest}`,
          'Check file permissions'
        );
      }

      throw toError(error);
    }
  }

  /**
   * Remove file or directory
   */
  static async remove(filePath: string): Promise<void> {
    const fullPath = path.resolve(filePath);

    try {
      if (await fs.pathExists(fullPath)) {
        await fs.remove(fullPath);
      }
    } catch (error: unknown) {
      const { isNodeError, toError } = await import('./error-utils.js');
      if (isNodeError(error) && (error.code === 'EACCES' || error.code === 'EPERM')) {
        throw new PermissionError(
          `Permission denied: Cannot remove ${filePath}`,
          'Check file permissions'
        );
      }

      throw toError(error);
    }
  }
}
