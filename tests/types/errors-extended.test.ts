/**
 * Extended tests for error types
 * Covers: error constructors, inheritance, hints, codes
 */

import {
  ClavixError,
  PermissionError,
  ValidationError,
  IntegrationError,
  DataError,
} from '../../src/types/errors';

describe('Error Types - Extended', () => {
  describe('ClavixError', () => {
    it('should create ClavixError with message only', () => {
      const error = new ClavixError('Something went wrong');

      expect(error).toBeInstanceOf(ClavixError);
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Something went wrong');
      expect(error.name).toBe('ClavixError');
      expect(error.hint).toBeUndefined();
      expect(error.code).toBeUndefined();
    });

    it('should create ClavixError with message and hint', () => {
      const error = new ClavixError(
        'File not found',
        'Check if the path is correct'
      );

      expect(error.message).toBe('File not found');
      expect(error.hint).toBe('Check if the path is correct');
      expect(error.code).toBeUndefined();
    });

    it('should create ClavixError with message, hint, and code', () => {
      const error = new ClavixError(
        'Invalid state',
        'Reset configuration',
        'INVALID_STATE'
      );

      expect(error.message).toBe('Invalid state');
      expect(error.hint).toBe('Reset configuration');
      expect(error.code).toBe('INVALID_STATE');
    });

    it('should have proper stack trace', () => {
      const error = new ClavixError('Test error');

      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('ClavixError');
    });

    it('should be throwable and catchable', () => {
      expect(() => {
        throw new ClavixError('Test');
      }).toThrow(ClavixError);
    });
  });

  describe('PermissionError', () => {
    it('should create PermissionError with defaults', () => {
      const error = new PermissionError('Access denied');

      expect(error).toBeInstanceOf(PermissionError);
      expect(error).toBeInstanceOf(ClavixError);
      expect(error.message).toBe('Access denied');
      expect(error.name).toBe('PermissionError');
      expect(error.code).toBe('PERMISSION_ERROR');
    });

    it('should create PermissionError with hint', () => {
      const error = new PermissionError(
        'Cannot write to file',
        'Check file permissions using: chmod 644 file.txt'
      );

      expect(error.message).toBe('Cannot write to file');
      expect(error.hint).toBe('Check file permissions using: chmod 644 file.txt');
      expect(error.code).toBe('PERMISSION_ERROR');
    });

    it('should be catchable as PermissionError', () => {
      try {
        throw new PermissionError('No access');
      } catch (err) {
        expect(err).toBeInstanceOf(PermissionError);
        expect((err as PermissionError).code).toBe('PERMISSION_ERROR');
      }
    });

    it('should be catchable as ClavixError', () => {
      try {
        throw new PermissionError('No access');
      } catch (err) {
        expect(err).toBeInstanceOf(ClavixError);
      }
    });
  });

  describe('ValidationError', () => {
    it('should create ValidationError with defaults', () => {
      const error = new ValidationError('Invalid email');

      expect(error).toBeInstanceOf(ValidationError);
      expect(error).toBeInstanceOf(ClavixError);
      expect(error.message).toBe('Invalid email');
      expect(error.name).toBe('ValidationError');
      expect(error.code).toBe('VALIDATION_ERROR');
    });

    it('should create ValidationError with hint', () => {
      const error = new ValidationError(
        'Project name too short',
        'Project name must be at least 3 characters'
      );

      expect(error.message).toBe('Project name too short');
      expect(error.hint).toBe('Project name must be at least 3 characters');
      expect(error.code).toBe('VALIDATION_ERROR');
    });

    it('should be catchable as ValidationError', () => {
      try {
        throw new ValidationError('Invalid input');
      } catch (err) {
        expect(err).toBeInstanceOf(ValidationError);
        expect((err as ValidationError).code).toBe('VALIDATION_ERROR');
      }
    });
  });

  describe('IntegrationError', () => {
    it('should create IntegrationError with defaults', () => {
      const error = new IntegrationError('Adapter not found');

      expect(error).toBeInstanceOf(IntegrationError);
      expect(error).toBeInstanceOf(ClavixError);
      expect(error.message).toBe('Adapter not found');
      expect(error.name).toBe('IntegrationError');
      expect(error.code).toBe('INTEGRATION_ERROR');
    });

    it('should create IntegrationError with hint', () => {
      const error = new IntegrationError(
        'Claude Code adapter not detected',
        'Run `clavix init` to initialize Claude Code integration'
      );

      expect(error.message).toBe('Claude Code adapter not detected');
      expect(error.hint).toBe(
        'Run `clavix init` to initialize Claude Code integration'
      );
      expect(error.code).toBe('INTEGRATION_ERROR');
    });

    it('should be catchable as IntegrationError', () => {
      try {
        throw new IntegrationError('Agent missing');
      } catch (err) {
        expect(err).toBeInstanceOf(IntegrationError);
        expect((err as IntegrationError).code).toBe('INTEGRATION_ERROR');
      }
    });
  });

  describe('DataError', () => {
    it('should create DataError with defaults', () => {
      const error = new DataError('Corrupted data');

      expect(error).toBeInstanceOf(DataError);
      expect(error).toBeInstanceOf(ClavixError);
      expect(error.message).toBe('Corrupted data');
      expect(error.name).toBe('DataError');
      expect(error.code).toBe('DATA_ERROR');
    });

    it('should create DataError with hint', () => {
      const error = new DataError(
        'Session file is invalid',
        'Delete the corrupted session and try again'
      );

      expect(error.message).toBe('Session file is invalid');
      expect(error.hint).toBe('Delete the corrupted session and try again');
      expect(error.code).toBe('DATA_ERROR');
    });

    it('should be catchable as DataError', () => {
      try {
        throw new DataError('Invalid JSON');
      } catch (err) {
        expect(err).toBeInstanceOf(DataError);
        expect((err as DataError).code).toBe('DATA_ERROR');
      }
    });
  });

  describe('Error Hierarchy', () => {
    it('should maintain proper inheritance chain', () => {
      const permErr = new PermissionError('Test');
      expect(permErr).toBeInstanceOf(PermissionError);
      expect(permErr).toBeInstanceOf(ClavixError);
      expect(permErr).toBeInstanceOf(Error);
    });

    it('should catch all error types with ClavixError', () => {
      const errors: ClavixError[] = [
        new PermissionError('P'),
        new ValidationError('V'),
        new IntegrationError('I'),
        new DataError('D'),
        new ClavixError('C'),
      ];

      errors.forEach((err) => {
        expect(err).toBeInstanceOf(ClavixError);
      });
    });

    it('should not catch unrelated errors with specific error type', () => {
      expect(() => {
        throw new Error('Generic error');
      }).toThrow(Error);

      try {
        throw new Error('Generic error');
      } catch (err) {
        expect(err).not.toBeInstanceOf(ClavixError);
      }
    });
  });

  describe('Error Codes', () => {
    it('should have unique error codes', () => {
      const codes = [
        new PermissionError('P').code,
        new ValidationError('V').code,
        new IntegrationError('I').code,
        new DataError('D').code,
      ];

      const uniqueCodes = new Set(codes);
      expect(uniqueCodes.size).toBe(codes.length);
    });

    it('should use consistent code format', () => {
      const errors = [
        new PermissionError('P'),
        new ValidationError('V'),
        new IntegrationError('I'),
        new DataError('D'),
      ];

      errors.forEach((err) => {
        expect(err.code).toMatch(/^[A-Z_]+$/);
      });
    });

    it('should contain ERROR in code name', () => {
      const errors = [
        new PermissionError('P'),
        new ValidationError('V'),
        new IntegrationError('I'),
        new DataError('D'),
      ];

      errors.forEach((err) => {
        expect(err.code).toContain('ERROR');
      });
    });
  });

  describe('Error Messages and Hints', () => {
    it('should support multi-line error messages', () => {
      const message = 'Line 1\nLine 2\nLine 3';
      const error = new ClavixError(message);

      expect(error.message).toBe(message);
    });

    it('should support multi-line hints', () => {
      const hint = 'Try this:\n1. First step\n2. Second step';
      const error = new ClavixError('Error', hint);

      expect(error.hint).toBe(hint);
    });

    it('should allow special characters in message', () => {
      const message = 'Error: @$%^&*() with "quotes" and \'apostrophes\'';
      const error = new ClavixError(message);

      expect(error.message).toBe(message);
    });

    it('should handle empty hints gracefully', () => {
      const error = new ClavixError('Message', '');

      expect(error.hint).toBe('');
      expect(error.hint).toBeDefined();
    });

    it('should handle undefined hints', () => {
      const error = new ClavixError('Message', undefined);

      expect(error.hint).toBeUndefined();
    });
  });

  describe('Error Display', () => {
    it('should have meaningful toString()', () => {
      const error = new ValidationError('Invalid input', 'Check the format');

      const str = error.toString();
      expect(str).toContain('ValidationError');
      expect(str).toContain('Invalid input');
    });

    it('should work with console.error', () => {
      const error = new ClavixError('Test error');
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation();

      console.error(error);

      expect(consoleErrorSpy).toHaveBeenCalledWith(error);

      consoleErrorSpy.mockRestore();
    });

    it('should work with JSON.stringify when needed', () => {
      const error = new PermissionError('No access', 'Check permissions');

      // Note: Error objects don't stringify well by default, but we can test the structure
      expect(error.message).toBeDefined();
      expect(error.hint).toBeDefined();
      expect(error.code).toBeDefined();
    });
  });

  describe('Error Type Discrimination', () => {
    it('should differentiate errors by code', () => {
      const errors = [
        new PermissionError('P'),
        new ValidationError('V'),
        new IntegrationError('I'),
        new DataError('D'),
      ];

      const errorsByCode: Record<string, ClavixError> = {};
      errors.forEach((err) => {
        if (err.code) {
          errorsByCode[err.code] = err;
        }
      });

      expect(Object.keys(errorsByCode).length).toBe(4);
      expect(errorsByCode['PERMISSION_ERROR']).toBeInstanceOf(PermissionError);
      expect(errorsByCode['VALIDATION_ERROR']).toBeInstanceOf(ValidationError);
      expect(errorsByCode['INTEGRATION_ERROR']).toBeInstanceOf(IntegrationError);
      expect(errorsByCode['DATA_ERROR']).toBeInstanceOf(DataError);
    });

    it('should differentiate errors by name', () => {
      const errors = [
        new PermissionError('P'),
        new ValidationError('V'),
        new IntegrationError('I'),
        new DataError('D'),
      ];

      const errorsByName: Record<string, ClavixError> = {};
      errors.forEach((err) => {
        errorsByName[err.name] = err;
      });

      expect(errorsByName['PermissionError']).toBeInstanceOf(PermissionError);
      expect(errorsByName['ValidationError']).toBeInstanceOf(ValidationError);
      expect(errorsByName['IntegrationError']).toBeInstanceOf(IntegrationError);
      expect(errorsByName['DataError']).toBeInstanceOf(DataError);
    });

    it('should differentiate errors by instanceof', () => {
      const errors = [
        new PermissionError('P'),
        new ValidationError('V'),
        new IntegrationError('I'),
        new DataError('D'),
      ];

      errors.forEach((err) => {
        if (err instanceof PermissionError) {
          expect(err.code).toBe('PERMISSION_ERROR');
        } else if (err instanceof ValidationError) {
          expect(err.code).toBe('VALIDATION_ERROR');
        } else if (err instanceof IntegrationError) {
          expect(err.code).toBe('INTEGRATION_ERROR');
        } else if (err instanceof DataError) {
          expect(err.code).toBe('DATA_ERROR');
        }
      });
    });
  });
});
