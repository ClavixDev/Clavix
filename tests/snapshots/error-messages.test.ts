/**
 * Error Messages Snapshot Tests
 *
 * These tests verify that error messages remain consistent and helpful
 * across different error scenarios.
 */

import { describe, it, expect } from '@jest/globals';
import { sanitizeCliOutput, normalizePaths } from '../helpers/snapshot-utils.js';
import {
  ClavixError,
  IntegrationError,
  ValidationError,
  DataError,
  PermissionError,
} from '../../src/types/errors.js';

describe('Error Messages Snapshots', () => {
  describe('ClavixError base class', () => {
    it('should format basic error correctly', () => {
      const error = new ClavixError('Something went wrong');
      expect(error.message).toMatchSnapshot('clavix-error-basic');
    });

    it('should include hint', () => {
      const error = new ClavixError('Operation failed', 'Try running the command again');
      expect(error.message).toMatchSnapshot('clavix-error-with-hint');
      expect(error.hint).toBe('Try running the command again');
    });
  });

  describe('DataError for config issues', () => {
    it('should format missing config file error', () => {
      const error = new DataError(
        'Configuration file not found',
        'Run "clavix init" to create a configuration file'
      );
      expect(error.message).toMatchSnapshot('config-error-missing-file');
    });

    it('should format invalid config error', () => {
      const error = new DataError(
        'Invalid configuration: "integrations" must be an array',
        'Check your .clavix/config.json file'
      );
      expect(error.message).toMatchSnapshot('config-error-invalid');
    });

    it('should format legacy config error', () => {
      const error = new DataError(
        'Legacy configuration format detected',
        'Run "clavix update" to migrate your configuration'
      );
      expect(error.message).toMatchSnapshot('config-error-legacy');
    });
  });

  describe('IntegrationError', () => {
    it('should format adapter not found error', () => {
      const error = new IntegrationError(
        'Adapter "invalid-adapter" not found',
        'Available adapters: claude-code, cursor, windsurf'
      );
      expect(error.message).toMatchSnapshot('integration-error-adapter-not-found');
    });

    it('should format initialization error', () => {
      const error = new IntegrationError(
        'Failed to initialize Claude Code integration',
        'Ensure the .claude directory is writable'
      );
      expect(error.message).toMatchSnapshot('integration-error-init-failed');
    });

    it('should format command generation error', () => {
      const error = new IntegrationError(
        'Failed to generate slash commands for Cursor',
        'Check template files in .clavix/templates'
      );
      expect(error.message).toMatchSnapshot('integration-error-command-gen');
    });
  });

  describe('ValidationError', () => {
    it('should format prompt validation error', () => {
      const error = new ValidationError('Prompt cannot be empty', 'Provide a prompt to improve');
      expect(error.message).toMatchSnapshot('validation-error-empty-prompt');
    });

    it('should format task validation error', () => {
      const error = new ValidationError(
        'Task ID "task-123" not found in tasks.md',
        'Use "clavix list" to see available tasks'
      );
      expect(error.message).toMatchSnapshot('validation-error-task-not-found');
    });

    it('should format session validation error', () => {
      const error = new ValidationError(
        'Invalid session: No messages found',
        'Start a new session with "clavix start"'
      );
      expect(error.message).toMatchSnapshot('validation-error-invalid-session');
    });
  });

  describe('DataError', () => {
    it('should format file not found error', () => {
      const error = new DataError(
        'File not found: prd.md',
        'Generate a PRD first with "clavix prd"'
      );
      expect(normalizePaths(error.message)).toMatchSnapshot('data-error-file-not-found');
    });

    it('should format corrupted data error', () => {
      const error = new DataError(
        'Failed to parse session file: Invalid JSON',
        'Try removing the corrupted file from .clavix/sessions/'
      );
      expect(error.message).toMatchSnapshot('data-error-corrupted');
    });

    it('should format markdown validation error', () => {
      const error = new DataError(
        'Invalid markdown: Unbalanced code blocks',
        'Check that all ``` blocks are properly closed'
      );
      expect(error.message).toMatchSnapshot('data-error-markdown');
    });
  });

  describe('PermissionError', () => {
    it('should format write permission error', () => {
      const error = new PermissionError(
        'Permission denied: Cannot write to .clavix/config.json',
        'Check file permissions or run with elevated privileges'
      );
      expect(normalizePaths(error.message)).toMatchSnapshot('permission-error-write');
    });

    it('should format read permission error', () => {
      const error = new PermissionError(
        'Permission denied: Cannot read .git/config',
        'Check file permissions'
      );
      expect(normalizePaths(error.message)).toMatchSnapshot('permission-error-read');
    });

    it('should format directory permission error', () => {
      const error = new PermissionError(
        'Permission denied: Cannot create directory .clavix',
        'Check parent directory permissions'
      );
      expect(error.message).toMatchSnapshot('permission-error-directory');
    });
  });

  describe('error properties', () => {
    it('errors should have correct name property', () => {
      expect(new ClavixError('test').name).toBe('ClavixError');
      expect(new IntegrationError('test').name).toBe('IntegrationError');
      expect(new ValidationError('test').name).toBe('ValidationError');
      expect(new DataError('test').name).toBe('DataError');
      expect(new PermissionError('test').name).toBe('PermissionError');
    });

    it('errors should be instances of Error', () => {
      expect(new ClavixError('test')).toBeInstanceOf(Error);
      expect(new IntegrationError('test')).toBeInstanceOf(ClavixError);
      expect(new DataError('test')).toBeInstanceOf(ClavixError);
    });

    it('errors should have stack traces', () => {
      const error = new ClavixError('test');
      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('ClavixError');
    });
  });

  describe('error message consistency', () => {
    it('all error types should format consistently', () => {
      const errors = [
        new ClavixError('Base error', 'Hint'),
        new IntegrationError('Integration error', 'Hint'),
        new ValidationError('Validation error', 'Hint'),
        new DataError('Data error', 'Hint'),
        new PermissionError('Permission error', 'Hint'),
      ];

      const messages = errors.map((e) => ({
        name: e.name,
        hasHint: e.hint !== undefined,
      }));

      expect(messages).toMatchSnapshot('error-consistency');
    });
  });
});
