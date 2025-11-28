/**
 * Logger utility tests
 */

import { logger } from '../../src/utils/logger.js';
import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';

describe('logger', () => {
  const originalEnv = process.env.DEBUG;
  let consoleLogSpy: jest.SpiedFunction<typeof console.log>;
  let consoleWarnSpy: jest.SpiedFunction<typeof console.warn>;
  let consoleErrorSpy: jest.SpiedFunction<typeof console.error>;

  beforeEach(() => {
    // Reset DEBUG env var
    delete process.env.DEBUG;

    // Spy on console methods
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore DEBUG env var
    if (originalEnv !== undefined) {
      process.env.DEBUG = originalEnv;
    } else {
      delete process.env.DEBUG;
    }

    // Restore console methods
    jest.restoreAllMocks();
  });

  describe('debug()', () => {
    it('should log message when DEBUG=true', () => {
      process.env.DEBUG = 'true';

      logger.debug('test message');

      expect(consoleLogSpy).toHaveBeenCalledWith('[DEBUG] test message');
    });

    it('should log message when DEBUG=1', () => {
      process.env.DEBUG = '1';

      logger.debug('test message');

      expect(consoleLogSpy).toHaveBeenCalledWith('[DEBUG] test message');
    });

    it('should NOT log message when DEBUG is undefined', () => {
      delete process.env.DEBUG;

      logger.debug('test message');

      expect(consoleLogSpy).not.toHaveBeenCalled();
    });

    it('should NOT log message when DEBUG=false', () => {
      process.env.DEBUG = 'false';

      logger.debug('test message');

      expect(consoleLogSpy).not.toHaveBeenCalled();
    });

    it('should NOT log message when DEBUG=0', () => {
      process.env.DEBUG = '0';

      logger.debug('test message');

      expect(consoleLogSpy).not.toHaveBeenCalled();
    });

    it('should pass additional arguments', () => {
      process.env.DEBUG = 'true';

      logger.debug('test message', 'arg1', { key: 'value' });

      expect(consoleLogSpy).toHaveBeenCalledWith('[DEBUG] test message', 'arg1', { key: 'value' });
    });

    it('should handle empty string message', () => {
      process.env.DEBUG = 'true';

      logger.debug('');

      expect(consoleLogSpy).toHaveBeenCalledWith('[DEBUG] ');
    });

    it('should handle message with special characters', () => {
      process.env.DEBUG = 'true';

      logger.debug('test "quotes" and \\backslashes\\');

      expect(consoleLogSpy).toHaveBeenCalledWith('[DEBUG] test "quotes" and \\backslashes\\');
    });
  });

  describe('info()', () => {
    it('should log message unconditionally', () => {
      logger.info('info message');

      expect(consoleLogSpy).toHaveBeenCalledWith('info message');
    });

    it('should pass additional arguments', () => {
      logger.info('info message', 'arg1', 123);

      expect(consoleLogSpy).toHaveBeenCalledWith('info message', 'arg1', 123);
    });

    it('should handle empty string message', () => {
      logger.info('');

      expect(consoleLogSpy).toHaveBeenCalledWith('');
    });

    it('should handle special characters', () => {
      logger.info('info with 🚀 emoji and 中文');

      expect(consoleLogSpy).toHaveBeenCalledWith('info with 🚀 emoji and 中文');
    });
  });

  describe('warn()', () => {
    it('should log message with [WARN] prefix', () => {
      logger.warn('warning message');

      expect(consoleWarnSpy).toHaveBeenCalledWith('[WARN] warning message');
    });

    it('should use console.warn (not console.log)', () => {
      logger.warn('warning message');

      expect(consoleWarnSpy).toHaveBeenCalled();
      expect(consoleLogSpy).not.toHaveBeenCalled();
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('should pass additional arguments', () => {
      logger.warn('warning message', { detail: 'extra' });

      expect(consoleWarnSpy).toHaveBeenCalledWith('[WARN] warning message', { detail: 'extra' });
    });

    it('should handle empty string message', () => {
      logger.warn('');

      expect(consoleWarnSpy).toHaveBeenCalledWith('[WARN] ');
    });
  });

  describe('error()', () => {
    it('should log message with [ERROR] prefix', () => {
      logger.error('error message');

      expect(consoleErrorSpy).toHaveBeenCalledWith('[ERROR] error message');
    });

    it('should use console.error (not console.warn or console.log)', () => {
      logger.error('error message');

      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(consoleLogSpy).not.toHaveBeenCalled();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should pass additional arguments', () => {
      logger.error('error message', new Error('nested'));

      expect(consoleErrorSpy).toHaveBeenCalledWith('[ERROR] error message', expect.any(Error));
    });

    it('should handle empty string message', () => {
      logger.error('');

      expect(consoleErrorSpy).toHaveBeenCalledWith('[ERROR] ');
    });
  });

  describe('log()', () => {
    it('should route debug level correctly', () => {
      process.env.DEBUG = 'true';

      logger.log('debug', 'debug message');

      expect(consoleLogSpy).toHaveBeenCalledWith('[DEBUG] debug message');
    });

    it('should route info level correctly', () => {
      logger.log('info', 'info message');

      expect(consoleLogSpy).toHaveBeenCalledWith('info message');
    });

    it('should route warn level correctly', () => {
      logger.log('warn', 'warn message');

      expect(consoleWarnSpy).toHaveBeenCalledWith('[WARN] warn message');
    });

    it('should route error level correctly', () => {
      logger.log('error', 'error message');

      expect(consoleErrorSpy).toHaveBeenCalledWith('[ERROR] error message');
    });

    it('should pass additional arguments through routing', () => {
      logger.log('info', 'message', 'arg1', 'arg2');

      expect(consoleLogSpy).toHaveBeenCalledWith('message', 'arg1', 'arg2');
    });

    it('should handle debug level with DEBUG disabled', () => {
      delete process.env.DEBUG;

      logger.log('debug', 'should not appear');

      expect(consoleLogSpy).not.toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('should handle null in additional args', () => {
      logger.info('message', null);

      expect(consoleLogSpy).toHaveBeenCalledWith('message', null);
    });

    it('should handle undefined in additional args', () => {
      logger.info('message', undefined);

      expect(consoleLogSpy).toHaveBeenCalledWith('message', undefined);
    });

    it('should handle multiple calls', () => {
      logger.info('first');
      logger.info('second');
      logger.info('third');

      expect(consoleLogSpy).toHaveBeenCalledTimes(3);
    });

    it('should handle very long messages', () => {
      const longMessage = 'a'.repeat(10000);

      logger.info(longMessage);

      expect(consoleLogSpy).toHaveBeenCalledWith(longMessage);
    });
  });
});
