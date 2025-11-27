/**
 * Centralized logging utility for Clavix
 * Respects DEBUG environment variable for verbose output
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const isDebug = (): boolean => process.env.DEBUG === 'true' || process.env.DEBUG === '1';

/**
 * Logger utility with consistent formatting
 */
export const logger = {
  /**
   * Debug messages - only shown when DEBUG=true
   */
  debug: (message: string, ...args: unknown[]): void => {
    if (isDebug()) {
      console.log(`[DEBUG] ${message}`, ...args);
    }
  },

  /**
   * Informational messages
   */
  info: (message: string, ...args: unknown[]): void => {
    console.log(message, ...args);
  },

  /**
   * Warning messages
   */
  warn: (message: string, ...args: unknown[]): void => {
    console.warn(`[WARN] ${message}`, ...args);
  },

  /**
   * Error messages
   */
  error: (message: string, ...args: unknown[]): void => {
    console.error(`[ERROR] ${message}`, ...args);
  },

  /**
   * Log with specific level
   */
  log: (level: LogLevel, message: string, ...args: unknown[]): void => {
    switch (level) {
      case 'debug':
        logger.debug(message, ...args);
        break;
      case 'info':
        logger.info(message, ...args);
        break;
      case 'warn':
        logger.warn(message, ...args);
        break;
      case 'error':
        logger.error(message, ...args);
        break;
    }
  },
};
