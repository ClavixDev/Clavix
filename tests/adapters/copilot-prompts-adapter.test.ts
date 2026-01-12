import { CopilotPromptsAdapter } from '../../src/core/adapters/copilot-prompts-adapter';
import { FileSystem } from '../../src/utils/file-system';
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';

describe('CopilotPromptsAdapter', () => {
  let adapter: CopilotPromptsAdapter;
  let mockWriteFileAtomic: any;
  let mockExists: any;
  let mockEnsureDir: any;
  let mockListFiles: any;
  let mockRemove: any;

  beforeEach(() => {
    adapter = new CopilotPromptsAdapter();
    mockWriteFileAtomic = jest
      .spyOn(FileSystem, 'writeFileAtomic')
      .mockImplementation(async () => {});
    mockExists = jest.spyOn(FileSystem, 'exists');
    mockEnsureDir = jest.spyOn(FileSystem, 'ensureDir').mockImplementation(async () => {});
    mockListFiles = jest.spyOn(FileSystem, 'listFiles');
    mockRemove = jest.spyOn(FileSystem, 'remove').mockImplementation(async () => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('adapter properties', () => {
    it('should have correct name', () => {
      expect(adapter.name).toBe('copilot');
    });

    it('should have correct displayName', () => {
      expect(adapter.displayName).toBe('GitHub Copilot');
    });

    it('should have correct directory', () => {
      expect(adapter.directory).toBe('.github/prompts');
    });

    it('should have correct file extension', () => {
      expect(adapter.fileExtension).toBe('.prompt.md');
    });
  });

  describe('detectProject', () => {
    it('should return true if .github exists', async () => {
      mockExists.mockResolvedValue(true);
      const result = await adapter.detectProject();
      expect(result).toBe(true);
      expect(mockExists).toHaveBeenCalledWith('.github');
    });

    it('should return false if .github does not exist', async () => {
      mockExists.mockResolvedValue(false);
      const result = await adapter.detectProject();
      expect(result).toBe(false);
    });
  });

  describe('getCommandPath', () => {
    it('should return the prompts directory path', () => {
      expect(adapter.getCommandPath()).toBe('.github/prompts');
    });
  });

  describe('getTargetFilename', () => {
    it('should generate correct filename with clavix prefix', () => {
      expect(adapter.getTargetFilename('improve')).toBe('clavix-improve.prompt.md');
      expect(adapter.getTargetFilename('prd')).toBe('clavix-prd.prompt.md');
    });
  });

  describe('generateCommands', () => {
    it('should generate prompt files with frontmatter', async () => {
      mockExists.mockResolvedValue(true);

      await adapter.generateCommands([
        {
          name: 'improve',
          content: '---\nname: "Clavix: Improve"\ndescription: Optimize prompts\n---\n\n# Content',
          description: 'Optimize prompts',
        },
      ]);

      expect(mockEnsureDir).toHaveBeenCalledWith('.github/prompts');
      expect(mockWriteFileAtomic).toHaveBeenCalledWith(
        expect.stringContaining('clavix-improve.prompt.md'),
        expect.stringContaining('name: clavix-improve')
      );
      expect(mockWriteFileAtomic).toHaveBeenCalledWith(
        expect.stringContaining('clavix-improve.prompt.md'),
        expect.stringContaining('agent: ask')
      );
    });

    it('should use agent mode for implementation commands', async () => {
      mockExists.mockResolvedValue(true);

      await adapter.generateCommands([
        {
          name: 'implement',
          content: '---\nname: "Implement"\ndescription: Execute tasks\n---\n\n# Content',
          description: 'Execute tasks',
        },
      ]);

      expect(mockWriteFileAtomic).toHaveBeenCalledWith(
        expect.stringContaining('clavix-implement.prompt.md'),
        expect.stringContaining('agent: agent')
      );
      expect(mockWriteFileAtomic).toHaveBeenCalledWith(
        expect.stringContaining('clavix-implement.prompt.md'),
        expect.stringContaining('tools:')
      );
    });
  });

  describe('removeAllCommands', () => {
    it('should remove only clavix-prefixed prompt files', async () => {
      // First call: directory exists, second call: clavix/ subdir doesn't exist
      mockExists.mockResolvedValueOnce(true).mockResolvedValueOnce(false);
      mockListFiles.mockResolvedValue([
        'clavix-improve.prompt.md',
        'clavix-prd.prompt.md',
        'other-file.prompt.md',
        'readme.md',
      ]);

      const removed = await adapter.removeAllCommands();

      // Should only remove clavix-prefixed .prompt.md files
      expect(removed).toBe(2);
      expect(mockRemove).toHaveBeenCalledWith(expect.stringContaining('clavix-improve.prompt.md'));
      expect(mockRemove).toHaveBeenCalledWith(expect.stringContaining('clavix-prd.prompt.md'));
      expect(mockRemove).not.toHaveBeenCalledWith(expect.stringContaining('other-file.prompt.md'));
    });

    it('should return 0 if directory does not exist', async () => {
      mockExists.mockResolvedValue(false);
      const removed = await adapter.removeAllCommands();
      expect(removed).toBe(0);
    });
  });
});
