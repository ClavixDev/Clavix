import { CopilotInstructionsGenerator } from '../../src/core/adapters/copilot-instructions-generator';
import { FileSystem } from '../../src/utils/file-system';
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';

describe('CopilotInstructionsGenerator', () => {
  let mockReadFile: any;
  let mockWriteFileAtomic: any;
  let mockExists: any;
  let mockEnsureDir: any;
  let mockBackup: any;

  beforeEach(() => {
    mockReadFile = jest.spyOn(FileSystem, 'readFile');
    mockWriteFileAtomic = jest
      .spyOn(FileSystem, 'writeFileAtomic')
      .mockImplementation(async () => {});
    mockExists = jest.spyOn(FileSystem, 'exists');
    mockEnsureDir = jest.spyOn(FileSystem, 'ensureDir').mockImplementation(async () => {});
    mockBackup = jest.spyOn(FileSystem, 'backup').mockImplementation(async () => {});

    mockExists.mockResolvedValue(true);
    mockReadFile.mockResolvedValue('# Template Content');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('generate', () => {
    it('should generate file if it does not exist', async () => {
      mockExists
        .mockResolvedValueOnce(true) // Template exists
        .mockResolvedValueOnce(false); // Target file does not exist

      await CopilotInstructionsGenerator.generate();

      expect(mockEnsureDir).toHaveBeenCalledWith('.github');
      expect(mockWriteFileAtomic).toHaveBeenCalledWith(
        expect.stringContaining('copilot-instructions.md'),
        expect.stringContaining('# Template Content')
      );
      expect(mockWriteFileAtomic).toHaveBeenCalledWith(
        expect.stringContaining('copilot-instructions.md'),
        expect.stringContaining('<!-- CLAVIX:START -->')
      );
    });

    it('should update existing file with managed block', async () => {
      mockExists
        .mockResolvedValueOnce(true) // Template exists
        .mockResolvedValueOnce(true); // Target file exists
      mockReadFile
        .mockResolvedValueOnce('# Template Content') // Template read
        .mockResolvedValueOnce('Existing content'); // Target read

      await CopilotInstructionsGenerator.generate();

      expect(mockWriteFileAtomic).toHaveBeenCalledWith(
        expect.stringContaining('copilot-instructions.md'),
        expect.stringContaining('Existing content')
      );
      expect(mockWriteFileAtomic).toHaveBeenCalledWith(
        expect.stringContaining('copilot-instructions.md'),
        expect.stringContaining('# Template Content')
      );
    });

    it('should throw error if template is missing', async () => {
      mockExists.mockResolvedValueOnce(false); // Template missing

      await expect(CopilotInstructionsGenerator.generate()).rejects.toThrow(
        'Copilot instructions template not found'
      );
    });
  });

  describe('hasClavixBlock', () => {
    it('should return false if file does not exist', async () => {
      mockExists.mockResolvedValue(false);
      const result = await CopilotInstructionsGenerator.hasClavixBlock();
      expect(result).toBe(false);
    });

    it('should return true if file contains complete managed block', async () => {
      mockExists.mockResolvedValue(true);
      // DocInjector.hasBlock requires both START and END markers
      mockReadFile.mockResolvedValue(
        'some content\n<!-- CLAVIX:START -->\nblock content\n<!-- CLAVIX:END -->\nmore content'
      );
      const result = await CopilotInstructionsGenerator.hasClavixBlock();
      expect(result).toBe(true);
    });

    it('should return false if file does not contain markers', async () => {
      mockExists.mockResolvedValue(true);
      mockReadFile.mockResolvedValue('some content without marker');
      const result = await CopilotInstructionsGenerator.hasClavixBlock();
      expect(result).toBe(false);
    });

    it('should return false if file only contains start marker', async () => {
      mockExists.mockResolvedValue(true);
      mockReadFile.mockResolvedValue('some content <!-- CLAVIX:START --> incomplete');
      const result = await CopilotInstructionsGenerator.hasClavixBlock();
      expect(result).toBe(false);
    });
  });
});
