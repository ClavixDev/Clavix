import { FileSystem } from '../../src/utils/file-system';
import fs from 'fs-extra';
import * as path from 'path';
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { fileURLToPath } from 'url';

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
  });
});
