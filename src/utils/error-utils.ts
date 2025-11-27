/**
 * Error handling utilities with proper type guards
 */

/**
 * Type guard to check if value is an Error instance
 */
export function isError(error: unknown): error is Error {
  return error instanceof Error;
}

/**
 * Safely extract error message from unknown error
 * @param error - Unknown error value
 * @returns Error message string
 */
export function getErrorMessage(error: unknown): string {
  if (isError(error)) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message: unknown }).message;
    if (typeof message === 'string') {
      return message;
    }
  }

  return 'An unknown error occurred';
}

/**
 * Safely extract error stack trace from unknown error
 * @param error - Unknown error value
 * @returns Stack trace string or undefined
 */
export function getErrorStack(error: unknown): string | undefined {
  if (isError(error)) {
    return error.stack;
  }
  return undefined;
}

/**
 * Convert unknown error to Error instance
 * Useful when you need to throw or rethrow with proper type
 */
export function toError(error: unknown): Error {
  if (isError(error)) {
    return error;
  }

  if (typeof error === 'string') {
    return new Error(error);
  }

  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message: unknown }).message;
    if (typeof message === 'string') {
      return new Error(message);
    }
  }

  return new Error('An unknown error occurred');
}

/**
 * Interface for NodeJS errors with code property
 */
interface NodeJSError extends Error {
  code: string;
}

/**
 * Type guard to check if error is a NodeJS error with code property
 */
export function isNodeError(error: unknown): error is NodeJSError {
  return isError(error) && 'code' in error && typeof (error as { code: unknown }).code === 'string';
}

/**
 * Check if error is a permission error (EACCES or EPERM)
 */
export function isPermissionError(error: unknown): boolean {
  return isNodeError(error) && (error.code === 'EACCES' || error.code === 'EPERM');
}

/**
 * Handles CLI errors, formatting OCLIF errors nicely and falling back to default handler.
 * @param error The error to handle
 * @param defaultHandler The default handler function (usually handle from @oclif/core)
 * @param exitFn Optional exit function (defaults to process.exit)
 */
/**
 * OCLIF error structure for CLI errors
 */
interface OclifError extends Error {
  oclif?: {
    exit?: number;
  };
}

export async function handleCliError(
  error: unknown,
  defaultHandler: (err: unknown) => Promise<void>,
  exitFn: (code: number) => void = process.exit
): Promise<void> {
  // Type guard for OCLIF errors
  const isOclifError = (err: unknown): err is OclifError => {
    return (
      err !== null &&
      typeof err === 'object' &&
      'oclif' in err &&
      err.oclif !== null &&
      typeof err.oclif === 'object' &&
      'exit' in err.oclif
    );
  };

  // For CLIError, show only the formatted message
  if (isOclifError(error)) {
    // Format error message (hints are now included in error.message)
    console.error(' ›   Error: ' + error.message);
    exitFn(error.oclif?.exit ?? 1);
    return;
  }

  // For other errors, use default handler
  return defaultHandler(error);
}
