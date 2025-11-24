/**
 * Error Types Contract Tests
 *
 * Verifies that all error types follow the expected hierarchy and structure.
 */

import { describe, it, expect } from '@jest/globals';
import {
  ClavixError,
  PermissionError,
  ValidationError,
  IntegrationError,
  DataError,
} from '../../src/types/errors.js';

describe('Error Types Contract Tests', () => {
  describe('ClavixError (base class)', () => {
    it('should be an instance of Error', () => {
      const error = new ClavixError('test message');
      expect(error).toBeInstanceOf(Error);
    });

    it('should have message property', () => {
      const error = new ClavixError('test message');
      expect(error.message).toBe('test message');
    });

    it('should have name property set to ClavixError', () => {
      const error = new ClavixError('test');
      expect(error.name).toBe('ClavixError');
    });

    it('should support hint parameter', () => {
      const error = new ClavixError('main message', 'helpful hint');
      expect(error.hint).toBe('helpful hint');
    });

    it('should support code parameter', () => {
      const error = new ClavixError('message', 'hint', 'ERROR_CODE');
      expect(error.code).toBe('ERROR_CODE');
    });

    it('should have stack trace', () => {
      const error = new ClavixError('test');
      expect(error.stack).toBeDefined();
    });
  });

  describe('PermissionError', () => {
    it('should extend ClavixError', () => {
      const error = new PermissionError('permission denied');
      expect(error).toBeInstanceOf(ClavixError);
    });

    it('should be an instance of Error', () => {
      const error = new PermissionError('permission denied');
      expect(error).toBeInstanceOf(Error);
    });

    it('should have name property set to PermissionError', () => {
      const error = new PermissionError('test');
      expect(error.name).toBe('PermissionError');
    });

    it('should preserve message', () => {
      const error = new PermissionError('cannot write to file');
      expect(error.message).toBe('cannot write to file');
    });

    it('should have PERMISSION_ERROR code', () => {
      const error = new PermissionError('test');
      expect(error.code).toBe('PERMISSION_ERROR');
    });
  });

  describe('ValidationError', () => {
    it('should extend ClavixError', () => {
      const error = new ValidationError('invalid input');
      expect(error).toBeInstanceOf(ClavixError);
    });

    it('should be an instance of Error', () => {
      const error = new ValidationError('invalid input');
      expect(error).toBeInstanceOf(Error);
    });

    it('should have name property set to ValidationError', () => {
      const error = new ValidationError('test');
      expect(error.name).toBe('ValidationError');
    });

    it('should preserve message', () => {
      const error = new ValidationError('config is invalid');
      expect(error.message).toBe('config is invalid');
    });

    it('should have VALIDATION_ERROR code', () => {
      const error = new ValidationError('test');
      expect(error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('IntegrationError', () => {
    it('should extend ClavixError', () => {
      const error = new IntegrationError('adapter failed');
      expect(error).toBeInstanceOf(ClavixError);
    });

    it('should be an instance of Error', () => {
      const error = new IntegrationError('adapter failed');
      expect(error).toBeInstanceOf(Error);
    });

    it('should have name property set to IntegrationError', () => {
      const error = new IntegrationError('test');
      expect(error.name).toBe('IntegrationError');
    });

    it('should preserve message', () => {
      const error = new IntegrationError('claude-code integration failed');
      expect(error.message).toBe('claude-code integration failed');
    });

    it('should have INTEGRATION_ERROR code', () => {
      const error = new IntegrationError('test');
      expect(error.code).toBe('INTEGRATION_ERROR');
    });
  });

  describe('DataError', () => {
    it('should extend ClavixError', () => {
      const error = new DataError('data corruption');
      expect(error).toBeInstanceOf(ClavixError);
    });

    it('should be an instance of Error', () => {
      const error = new DataError('data corruption');
      expect(error).toBeInstanceOf(Error);
    });

    it('should have name property set to DataError', () => {
      const error = new DataError('test');
      expect(error.name).toBe('DataError');
    });

    it('should preserve message', () => {
      const error = new DataError('session file corrupted');
      expect(error.message).toBe('session file corrupted');
    });

    it('should have DATA_ERROR code', () => {
      const error = new DataError('test');
      expect(error.code).toBe('DATA_ERROR');
    });
  });

  describe('Error hierarchy', () => {
    it('should allow catching all errors with ClavixError', () => {
      const errors = [
        new ClavixError('base'),
        new PermissionError('permission'),
        new ValidationError('validation'),
        new IntegrationError('integration'),
        new DataError('data'),
      ];

      for (const error of errors) {
        expect(error).toBeInstanceOf(ClavixError);
      }
    });

    it('should allow specific error type catching', () => {
      const permError = new PermissionError('test');
      const validError = new ValidationError('test');

      expect(permError).toBeInstanceOf(PermissionError);
      expect(permError).not.toBeInstanceOf(ValidationError);

      expect(validError).toBeInstanceOf(ValidationError);
      expect(validError).not.toBeInstanceOf(PermissionError);
    });
  });

  describe('Error serialization', () => {
    it('should serialize to string correctly', () => {
      const error = new ClavixError('test message');
      const str = error.toString();
      expect(str).toContain('ClavixError');
      expect(str).toContain('test message');
    });

    it('should be JSON stringifiable', () => {
      const error = new ValidationError('test');
      const json = JSON.stringify({
        name: error.name,
        message: error.message,
        code: error.code,
      });
      expect(json).toContain('ValidationError');
      expect(json).toContain('VALIDATION_ERROR');
    });
  });

  describe('Error with hints', () => {
    it('should support hints for user guidance', () => {
      const error = new PermissionError(
        'Cannot write to config file',
        'Try running with sudo or check file permissions'
      );

      expect(error.hint).toBe('Try running with sudo or check file permissions');
    });

    it('should allow hints to be undefined', () => {
      const error = new ValidationError('Invalid config');
      expect(error.hint).toBeUndefined();
    });
  });
});
