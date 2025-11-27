import { FileSystem } from '../../src/utils/file-system';
import fs from 'fs-extra';
import * as path from 'path';
import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { fileURLToPath } from 'url';
import { PermissionError, DataError } from '../../src/types/errors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('FileSystem', () => {
  const testDir = path.join(__dirname, '../__test-data__');
  const testFile = path.join(testDir, 'test.txt');

  beforeEach(async () => {
    await fs.ensureDir(testDir);
  });

  afterEach(async () => {
    await fs.remove(testDir);
  });

  describe('writeFileAtomic', () => {
    it('should write file successfully', async () => {
      const content = 'test content';
      await FileSystem.writeFileAtomic(testFile, content);

      const result = await fs.readFile(testFile, 'utf-8');
      expect(result).toBe(content);
    });

    it('should create backup before overwriting', async () => {
      await fs.writeFile(testFile, 'original');
      await FileSystem.writeFileAtomic(testFile, 'updated');

      const result = await fs.readFile(testFile, 'utf-8');
      expect(result).toBe('updated');
    });

    it('should clean up backup on success', async () => {
      await fs.writeFile(testFile, 'original');
      await FileSystem.writeFileAtomic(testFile, 'updated');

      const backupExists = await fs.pathExists(`${testFile}.backup`);
      expect(backupExists).toBe(false);
    });
  });

  describe('readFile', () => {
    it('should read file successfully', async () => {
      const content = 'test content';
      await fs.writeFile(testFile, content);

      const result = await FileSystem.readFile(testFile);
      expect(result).toBe(content);
    });

    it('should throw error for non-existent file', async () => {
      await expect(FileSystem.readFile(testFile)).rejects.toThrow();
    });

    it('should throw DataError for non-existent file', async () => {
      await expect(FileSystem.readFile(testFile)).rejects.toThrow(DataError);
    });
  });

  describe('exists', () => {
    it('should return true for existing file', async () => {
      await fs.writeFile(testFile, 'content');
      const exists = await FileSystem.exists(testFile);
      expect(exists).toBe(true);
    });

    it('should return false for non-existent file', async () => {
      const exists = await FileSystem.exists(testFile);
      expect(exists).toBe(false);
    });
  });

  describe('ensureDir', () => {
    it('should create directory', async () => {
      const dir = path.join(testDir, 'newdir');
      await FileSystem.ensureDir(dir);

      const exists = await fs.pathExists(dir);
      expect(exists).toBe(true);
    });

    it('should not throw for existing directory', async () => {
      await FileSystem.ensureDir(testDir);
      const exists = await fs.pathExists(testDir);
      expect(exists).toBe(true);
    });
  });

  describe('isDirectory', () => {
    it('should return true for directory', async () => {
      const result = await FileSystem.isDirectory(testDir);
      expect(result).toBe(true);
    });

    it('should return false for file', async () => {
      await fs.writeFile(testFile, 'content');
      const result = await FileSystem.isDirectory(testFile);
      expect(result).toBe(false);
    });

    it('should return false for non-existent path', async () => {
      const result = await FileSystem.isDirectory('/nonexistent/path');
      expect(result).toBe(false);
    });
  });

  describe('readdir', () => {
    it('should read directory contents', async () => {
      await fs.writeFile(testFile, 'content');
      const files = await FileSystem.readdir(testDir);

      expect(files).toContain('test.txt');
    });

    it('should read directory with file types', async () => {
      await fs.writeFile(testFile, 'content');
      const entries = await FileSystem.readdir(testDir, { withFileTypes: true });

      expect(entries.length).toBeGreaterThan(0);
      expect(entries[0].isFile()).toBe(true);
    });
  });

  describe('isWritable', () => {
    it('should return true for writable file', async () => {
      await fs.writeFile(testFile, 'content');
      const result = await FileSystem.isWritable(testFile);
      expect(result).toBe(true);
    });

    it('should return false for non-existent path', async () => {
      const result = await FileSystem.isWritable('/nonexistent/path');
      expect(result).toBe(false);
    });
  });

  describe('backup', () => {
    it('should create backup of existing file', async () => {
      await fs.writeFile(testFile, 'original content');
      const backupPath = await FileSystem.backup(testFile);

      expect(backupPath).toBe(`${path.resolve(testFile)}.backup`);
      const backupExists = await fs.pathExists(backupPath);
      expect(backupExists).toBe(true);
    });

    it('should return path even for non-existent file', async () => {
      const backupPath = await FileSystem.backup(testFile);
      expect(backupPath).toContain('.backup');
    });
  });

  describe('restoreBackup', () => {
    it('should restore from backup', async () => {
      await fs.writeFile(testFile, 'original');
      const backupPath = `${path.resolve(testFile)}.backup`;
      await fs.copy(testFile, backupPath);
      await fs.writeFile(testFile, 'modified');

      await FileSystem.restoreBackup(testFile);

      const content = await fs.readFile(testFile, 'utf-8');
      expect(content).toBe('original');
    });

    it('should do nothing if no backup exists', async () => {
      await fs.writeFile(testFile, 'content');
      await FileSystem.restoreBackup(testFile);

      const content = await fs.readFile(testFile, 'utf-8');
      expect(content).toBe('content');
    });
  });

  describe('listFiles', () => {
    it('should list files in directory', async () => {
      await fs.writeFile(testFile, 'content');
      await fs.writeFile(path.join(testDir, 'other.txt'), 'other');

      const files = await FileSystem.listFiles(testDir);
      expect(files).toContain('test.txt');
      expect(files).toContain('other.txt');
    });

    it('should filter files with pattern', async () => {
      await fs.writeFile(testFile, 'content');
      await fs.writeFile(path.join(testDir, 'file.md'), 'markdown');

      const files = await FileSystem.listFiles(testDir, /\.txt$/);
      expect(files).toContain('test.txt');
      expect(files).not.toContain('file.md');
    });

    it('should return empty array for non-existent directory', async () => {
      const files = await FileSystem.listFiles('/nonexistent/dir');
      expect(files).toEqual([]);
    });
  });

  describe('copy', () => {
    it('should copy file', async () => {
      await fs.writeFile(testFile, 'content');
      const destFile = path.join(testDir, 'copy.txt');

      await FileSystem.copy(testFile, destFile);

      const content = await fs.readFile(destFile, 'utf-8');
      expect(content).toBe('content');
    });

    it('should copy directory recursively', async () => {
      const srcDir = path.join(testDir, 'src');
      const destDir = path.join(testDir, 'dest');
      await fs.ensureDir(srcDir);
      await fs.writeFile(path.join(srcDir, 'file.txt'), 'content');

      await FileSystem.copy(srcDir, destDir);

      const exists = await fs.pathExists(path.join(destDir, 'file.txt'));
      expect(exists).toBe(true);
    });
  });

  describe('remove', () => {
    it('should remove file', async () => {
      await fs.writeFile(testFile, 'content');
      await FileSystem.remove(testFile);

      const exists = await fs.pathExists(testFile);
      expect(exists).toBe(false);
    });

    it('should remove directory recursively', async () => {
      const subDir = path.join(testDir, 'sub');
      await fs.ensureDir(subDir);
      await fs.writeFile(path.join(subDir, 'file.txt'), 'content');

      await FileSystem.remove(subDir);

      const exists = await fs.pathExists(subDir);
      expect(exists).toBe(false);
    });

    it('should not throw for non-existent path', async () => {
      await expect(FileSystem.remove('/nonexistent/path')).resolves.not.toThrow();
    });
  });
});
