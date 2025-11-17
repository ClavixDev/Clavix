/**
 * File Operations Edge Cases
 * Tests file system operation failures and error handling
 */

import fs from 'fs-extra';
import * as path from 'path';
import { FileSystem } from '../../src/utils/file-system';
import { PermissionError, DataError } from '../../src/types/errors';
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('File Operations Edge Cases', () => {
  const testDir = path.join(__dirname, '../tmp/file-operations-test');

  beforeEach(async () => {
    await fs.ensureDir(testDir);
  });

  afterEach(async () => {
    // Ensure all files are writable before cleanup
    try {
      const files = await fs.readdir(testDir, { withFileTypes: true });
      for (const file of files) {
        const filePath = path.join(testDir, file.name);
        try {
          await fs.chmod(filePath, 0o777);
        } catch {
          // Ignore chmod errors during cleanup
        }
      }
    } catch {
      // Ignore readdir errors
    }
    await fs.remove(testDir);
  });

  describe('Atomic Write Operations', () => {
    it('should write file successfully', async () => {
      const filePath = path.join(testDir, 'test.txt');
      await FileSystem.writeFileAtomic(filePath, 'Test content');

      const content = await fs.readFile(filePath, 'utf-8');
      expect(content).toBe('Test content');
    });

    it('should create backup before writing', async () => {
      const filePath = path.join(testDir, 'existing.txt');
      await fs.writeFile(filePath, 'Original content');

      // Write new content - backup should be created then removed
      await FileSystem.writeFileAtomic(filePath, 'New content');

      const content = await fs.readFile(filePath, 'utf-8');
      expect(content).toBe('New content');

      // Backup should be removed after successful write
      expect(await fs.pathExists(`${filePath}.backup`)).toBe(false);
    });

    it('should restore from backup on write failure', async () => {
      const filePath = path.join(testDir, 'restore-test.txt');
      await fs.writeFile(filePath, 'Original content');

      // Make file read-only to simulate write failure
      await fs.chmod(filePath, 0o444);

      let error: Error | undefined;
      try {
        await FileSystem.writeFileAtomic(filePath, 'New content that will fail');
      } catch (e) {
        error = e as Error;
      }

      // Restore permissions for verification
      await fs.chmod(filePath, 0o644);

      expect(error).toBeDefined();
      expect(error?.message).toContain('permission denied');

      // Original content should be preserved
      const content = await fs.readFile(filePath, 'utf-8');
      expect(content).toBe('Original content');
    });

    it('should handle permission denied errors', async () => {
      const filePath = path.join(testDir, 'readonly.txt');
      await fs.writeFile(filePath, 'Content');
      await fs.chmod(filePath, 0o444);

      await expect(
        FileSystem.writeFileAtomic(filePath, 'New content')
      ).rejects.toThrow(/permission denied/);

      // Cleanup
      await fs.chmod(filePath, 0o644);
    });

    it('should handle very long content', async () => {
      const filePath = path.join(testDir, 'large.txt');
      const largeContent = 'x'.repeat(1000000); // 1MB of content

      await FileSystem.writeFileAtomic(filePath, largeContent);

      const content = await fs.readFile(filePath, 'utf-8');
      expect(content.length).toBe(1000000);
    });

    it('should handle special characters in content', async () => {
      const filePath = path.join(testDir, 'special.txt');
      const specialContent = '🚀 Unicode: 你好 Emoji: 😀\nNewlines\tTabs';

      await FileSystem.writeFileAtomic(filePath, specialContent);

      const content = await fs.readFile(filePath, 'utf-8');
      expect(content).toBe(specialContent);
    });

    it('should handle multiple rapid writes', async () => {
      const filePath = path.join(testDir, 'rapid.txt');

      // Write multiple times in succession
      await FileSystem.writeFileAtomic(filePath, 'Write 1');
      await FileSystem.writeFileAtomic(filePath, 'Write 2');
      await FileSystem.writeFileAtomic(filePath, 'Write 3');

      const content = await fs.readFile(filePath, 'utf-8');
      expect(content).toBe('Write 3');
    });
  });

  describe('Read Operations', () => {
    it('should read existing file', async () => {
      const filePath = path.join(testDir, 'read.txt');
      await fs.writeFile(filePath, 'Read this');

      const content = await FileSystem.readFile(filePath);
      expect(content).toBe('Read this');
    });

    it('should throw DataError for non-existent file', async () => {
      const filePath = path.join(testDir, 'nonexistent.txt');

      await expect(FileSystem.readFile(filePath)).rejects.toThrow(DataError);
    });

    it('should throw PermissionError for unreadable file', async () => {
      const filePath = path.join(testDir, 'unreadable.txt');
      await fs.writeFile(filePath, 'Content');
      await fs.chmod(filePath, 0o000);

      await expect(FileSystem.readFile(filePath)).rejects.toThrow(/permission denied/);

      // Cleanup
      await fs.chmod(filePath, 0o644);
    });

    it('should read empty file', async () => {
      const filePath = path.join(testDir, 'empty.txt');
      await fs.writeFile(filePath, '');

      const content = await FileSystem.readFile(filePath);
      expect(content).toBe('');
    });

    it('should read file with unicode content', async () => {
      const filePath = path.join(testDir, 'unicode.txt');
      const unicodeContent = '日本語 한국어 中文 🌍';
      await fs.writeFile(filePath, unicodeContent);

      const content = await FileSystem.readFile(filePath);
      expect(content).toBe(unicodeContent);
    });
  });

  describe('Directory Operations', () => {
    it('should create directory', async () => {
      const dirPath = path.join(testDir, 'new-dir');

      await FileSystem.ensureDir(dirPath);

      expect(await fs.pathExists(dirPath)).toBe(true);
      const stats = await fs.stat(dirPath);
      expect(stats.isDirectory()).toBe(true);
    });

    it('should create nested directories', async () => {
      const dirPath = path.join(testDir, 'level1/level2/level3');

      await FileSystem.ensureDir(dirPath);

      expect(await fs.pathExists(dirPath)).toBe(true);
    });

    it('should handle existing directory', async () => {
      const dirPath = path.join(testDir, 'existing');
      await fs.ensureDir(dirPath);

      // Should not throw when directory exists
      await FileSystem.ensureDir(dirPath);

      expect(await fs.pathExists(dirPath)).toBe(true);
    });

    it('should throw PermissionError when cannot create directory', async () => {
      const parentDir = path.join(testDir, 'readonly-parent');
      await fs.ensureDir(parentDir);
      await fs.chmod(parentDir, 0o444);

      const childDir = path.join(parentDir, 'child');

      await expect(FileSystem.ensureDir(childDir)).rejects.toThrow(/permission denied/);

      // Cleanup
      await fs.chmod(parentDir, 0o755);
    });
  });

  describe('Backup and Restore', () => {
    it('should create backup of existing file', async () => {
      const filePath = path.join(testDir, 'backup-test.txt');
      await fs.writeFile(filePath, 'Original');

      const backupPath = await FileSystem.backup(filePath);

      expect(await fs.pathExists(backupPath)).toBe(true);
      const backupContent = await fs.readFile(backupPath, 'utf-8');
      expect(backupContent).toBe('Original');
    });

    it('should handle backup of non-existent file', async () => {
      const filePath = path.join(testDir, 'nonexistent.txt');

      const backupPath = await FileSystem.backup(filePath);

      // Should return backup path even if file doesn't exist
      expect(backupPath).toBe(`${path.resolve(filePath)}.backup`);
    });

    it('should restore file from backup', async () => {
      const filePath = path.join(testDir, 'restore.txt');
      await fs.writeFile(filePath, 'Original');

      // Create backup
      const backupPath = await FileSystem.backup(filePath);

      // Modify original
      await fs.writeFile(filePath, 'Modified');

      // Restore
      await FileSystem.restoreBackup(filePath);

      const content = await fs.readFile(filePath, 'utf-8');
      expect(content).toBe('Original');

      // Backup should be removed after restore
      expect(await fs.pathExists(backupPath)).toBe(false);
    });

    it('should handle restore when no backup exists', async () => {
      const filePath = path.join(testDir, 'no-backup.txt');

      // Should not throw when backup doesn't exist
      await expect(FileSystem.restoreBackup(filePath)).resolves.not.toThrow();
    });

    it('should handle restore when backup exists but target is read-only', async () => {
      const filePath = path.join(testDir, 'restore-fail.txt');
      await fs.writeFile(filePath, 'Original');

      // Create backup
      const backupPath = await FileSystem.backup(filePath);

      // Restore should work even if original is read-only (it gets overwritten)
      await fs.chmod(filePath, 0o444);

      // Should complete without error (fs.copy overwrites read-only files)
      await FileSystem.restoreBackup(filePath);

      // Cleanup
      await fs.chmod(filePath, 0o644);

      const content = await fs.readFile(filePath, 'utf-8');
      expect(content).toBe('Original');
    });
  });

  describe('Path Helper Operations', () => {
    it('should check if file exists', async () => {
      const filePath = path.join(testDir, 'exists.txt');
      await fs.writeFile(filePath, 'Content');

      expect(await FileSystem.exists(filePath)).toBe(true);
      expect(await FileSystem.exists(path.join(testDir, 'nonexistent.txt'))).toBe(false);
    });

    it('should check if path is directory', async () => {
      const dirPath = path.join(testDir, 'is-dir');
      const filePath = path.join(testDir, 'is-file.txt');

      await fs.ensureDir(dirPath);
      await fs.writeFile(filePath, 'File');

      expect(await FileSystem.isDirectory(dirPath)).toBe(true);
      expect(await FileSystem.isDirectory(filePath)).toBe(false);
      expect(await FileSystem.isDirectory(path.join(testDir, 'nonexistent'))).toBe(false);
    });

    it('should check if path is writable', async () => {
      const writablePath = path.join(testDir, 'writable.txt');
      const readonlyPath = path.join(testDir, 'readonly.txt');

      await fs.writeFile(writablePath, 'Content');
      await fs.writeFile(readonlyPath, 'Content');
      await fs.chmod(readonlyPath, 0o444);

      expect(await FileSystem.isWritable(writablePath)).toBe(true);
      expect(await FileSystem.isWritable(readonlyPath)).toBe(false);

      // Cleanup
      await fs.chmod(readonlyPath, 0o644);
    });
  });

  describe('List Files Operations', () => {
    it('should list files in directory', async () => {
      const dirPath = path.join(testDir, 'list-test');
      await fs.ensureDir(dirPath);
      await fs.writeFile(path.join(dirPath, 'file1.txt'), 'Content');
      await fs.writeFile(path.join(dirPath, 'file2.txt'), 'Content');
      await fs.writeFile(path.join(dirPath, 'file3.md'), 'Content');

      const files = await FileSystem.listFiles(dirPath);

      expect(files).toHaveLength(3);
      expect(files).toContain('file1.txt');
      expect(files).toContain('file2.txt');
      expect(files).toContain('file3.md');
    });

    it('should list files matching pattern', async () => {
      const dirPath = path.join(testDir, 'pattern-test');
      await fs.ensureDir(dirPath);
      await fs.writeFile(path.join(dirPath, 'file1.txt'), 'Content');
      await fs.writeFile(path.join(dirPath, 'file2.txt'), 'Content');
      await fs.writeFile(path.join(dirPath, 'file3.md'), 'Content');

      const txtFiles = await FileSystem.listFiles(dirPath, /\.txt$/);

      expect(txtFiles).toHaveLength(2);
      expect(txtFiles).toContain('file1.txt');
      expect(txtFiles).toContain('file2.txt');
      expect(txtFiles).not.toContain('file3.md');
    });

    it('should return empty array for non-existent directory', async () => {
      const files = await FileSystem.listFiles(path.join(testDir, 'nonexistent'));

      expect(files).toEqual([]);
    });

    it('should throw PermissionError for unreadable directory', async () => {
      const dirPath = path.join(testDir, 'unreadable-dir');
      await fs.ensureDir(dirPath);
      await fs.chmod(dirPath, 0o000);

      await expect(FileSystem.listFiles(dirPath)).rejects.toThrow(/permission denied/);

      // Cleanup
      await fs.chmod(dirPath, 0o755);
    });
  });

  describe('Copy Operations', () => {
    it('should copy file', async () => {
      const src = path.join(testDir, 'source.txt');
      const dest = path.join(testDir, 'destination.txt');

      await fs.writeFile(src, 'Source content');

      await FileSystem.copy(src, dest);

      expect(await fs.pathExists(dest)).toBe(true);
      const content = await fs.readFile(dest, 'utf-8');
      expect(content).toBe('Source content');
    });

    it('should copy directory recursively', async () => {
      const srcDir = path.join(testDir, 'src-dir');
      const destDir = path.join(testDir, 'dest-dir');

      await fs.ensureDir(srcDir);
      await fs.writeFile(path.join(srcDir, 'file1.txt'), 'Content 1');
      await fs.writeFile(path.join(srcDir, 'file2.txt'), 'Content 2');

      await FileSystem.copy(srcDir, destDir);

      expect(await fs.pathExists(path.join(destDir, 'file1.txt'))).toBe(true);
      expect(await fs.pathExists(path.join(destDir, 'file2.txt'))).toBe(true);
    });

    it('should throw PermissionError when cannot copy', async () => {
      const src = path.join(testDir, 'unreadable-src.txt');
      const dest = path.join(testDir, 'dest.txt');

      await fs.writeFile(src, 'Content');
      await fs.chmod(src, 0o000);

      await expect(FileSystem.copy(src, dest)).rejects.toThrow(/permission denied/);

      // Cleanup
      await fs.chmod(src, 0o644);
    });
  });

  describe('Remove Operations', () => {
    it('should remove file', async () => {
      const filePath = path.join(testDir, 'remove.txt');
      await fs.writeFile(filePath, 'Content');

      await FileSystem.remove(filePath);

      expect(await fs.pathExists(filePath)).toBe(false);
    });

    it('should remove directory', async () => {
      const dirPath = path.join(testDir, 'remove-dir');
      await fs.ensureDir(dirPath);
      await fs.writeFile(path.join(dirPath, 'file.txt'), 'Content');

      await FileSystem.remove(dirPath);

      expect(await fs.pathExists(dirPath)).toBe(false);
    });

    it('should handle removing non-existent path', async () => {
      const filePath = path.join(testDir, 'nonexistent.txt');

      // Should not throw when file doesn't exist
      await expect(FileSystem.remove(filePath)).resolves.not.toThrow();
    });

    it('should throw PermissionError when cannot remove', async () => {
      const dirPath = path.join(testDir, 'protected-dir');
      const filePath = path.join(dirPath, 'protected.txt');

      await fs.ensureDir(dirPath);
      await fs.writeFile(filePath, 'Content');
      await fs.chmod(dirPath, 0o555); // Read + execute only

      await expect(FileSystem.remove(filePath)).rejects.toThrow(/permission denied/);

      // Cleanup
      await fs.chmod(dirPath, 0o755);
    });
  });

  describe('Path Edge Cases', () => {
    it('should handle relative paths', async () => {
      const originalCwd = process.cwd();
      process.chdir(testDir);

      try {
        await FileSystem.writeFileAtomic('relative.txt', 'Content');

        expect(await fs.pathExists(path.join(testDir, 'relative.txt'))).toBe(true);
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should handle absolute paths', async () => {
      const filePath = path.join(testDir, 'absolute.txt');

      await FileSystem.writeFileAtomic(filePath, 'Content');

      expect(await fs.pathExists(filePath)).toBe(true);
    });

    it('should handle paths with special characters', async () => {
      const dirPath = path.join(testDir, 'dir with spaces');
      const filePath = path.join(dirPath, 'file [brackets].txt');

      await FileSystem.ensureDir(dirPath);
      await FileSystem.writeFileAtomic(filePath, 'Content');

      expect(await fs.pathExists(filePath)).toBe(true);
    });

    it('should handle very long filename', async () => {
      // Most file systems limit to 255 bytes
      const longName = 'a'.repeat(200) + '.txt';
      const filePath = path.join(testDir, longName);

      await FileSystem.writeFileAtomic(filePath, 'Content');

      expect(await fs.pathExists(filePath)).toBe(true);
    });

    it('should handle deeply nested paths', async () => {
      const deepPath = path.join(
        testDir,
        'level1/level2/level3/level4/level5/file.txt'
      );

      await FileSystem.ensureDir(path.dirname(deepPath));
      await FileSystem.writeFileAtomic(deepPath, 'Content');

      expect(await fs.pathExists(deepPath)).toBe(true);
    });
  });
});
