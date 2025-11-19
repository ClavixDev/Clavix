import { WarpMdGenerator } from '../../src/core/adapters/warp-md-generator';
import { FileSystem } from '../../src/utils/file-system';
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';

describe('WarpMdGenerator', () => {
  let mockReadFile: any;
  let mockWriteFileAtomic: any;
  let mockExists: any;

  beforeEach(() => {
    mockReadFile = jest.spyOn(FileSystem, 'readFile');
    mockWriteFileAtomic = jest.spyOn(FileSystem, 'writeFileAtomic').mockImplementation(async () => {});
    mockExists = jest.spyOn(FileSystem, 'exists');
    
    mockExists.mockResolvedValue(true); // Default template exists
    mockReadFile.mockResolvedValue('# Template Content'); // Default template content
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('generate', () => {
    it('should generate file if it does not exist', async () => {
      mockExists.mockResolvedValueOnce(true); // Template exists
      mockExists.mockResolvedValueOnce(false); // Target file does not exist

      await WarpMdGenerator.generate();

      expect(mockWriteFileAtomic).toHaveBeenCalledWith(
        'WARP.md',
        expect.stringContaining('# Template Content')
      );
      expect(mockWriteFileAtomic).toHaveBeenCalledWith(
        'WARP.md',
        expect.stringContaining('<!-- CLAVIX:START -->')
      );
    });

    it('should update existing file with managed block', async () => {
      mockExists.mockResolvedValueOnce(true); // Template exists
      mockExists.mockResolvedValueOnce(true); // Target file exists
      mockReadFile.mockResolvedValueOnce('# Template Content'); // Template read
      mockReadFile.mockResolvedValueOnce('Existing content'); // Target read

      await WarpMdGenerator.generate();

      expect(mockWriteFileAtomic).toHaveBeenCalledWith(
        'WARP.md',
        expect.stringContaining('Existing content')
      );
      expect(mockWriteFileAtomic).toHaveBeenCalledWith(
        'WARP.md',
        expect.stringContaining('# Template Content')
      );
    });

    it('should throw error if template is missing', async () => {
      mockExists.mockResolvedValueOnce(false); // Template missing

      await expect(WarpMdGenerator.generate()).rejects.toThrow(
        'WARP.md template not found'
      );
    });
  });

  describe('hasClavixBlock', () => {
    it('should return false if file does not exist', async () => {
      mockExists.mockResolvedValue(false);
      const result = await WarpMdGenerator.hasClavixBlock();
      expect(result).toBe(false);
    });

    it('should return true if file contains start marker', async () => {
      mockExists.mockResolvedValue(true);
      mockReadFile.mockResolvedValue('some content <!-- CLAVIX:START --> content');
      const result = await WarpMdGenerator.hasClavixBlock();
      expect(result).toBe(true);
    });

    it('should return false if file does not contain start marker', async () => {
      mockExists.mockResolvedValue(true);
      mockReadFile.mockResolvedValue('some content without marker');
      const result = await WarpMdGenerator.hasClavixBlock();
      expect(result).toBe(false);
    });
  });
});
