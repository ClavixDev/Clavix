/**
 * Snapshot Test Utilities
 *
 * Helper functions for sanitizing dynamic data in snapshot tests
 * to ensure consistent, deterministic snapshots.
 */

/**
 * Sanitize timestamps from output
 * Replaces ISO date strings and unix timestamps with stable placeholders
 */
export function sanitizeTimestamps(input: string | object): string | object {
  if (typeof input === 'object' && input !== null) {
    return JSON.parse(sanitizeTimestamps(JSON.stringify(input)) as string);
  }

  let result = input as string;

  // ISO date strings: 2024-01-15T10:30:00.000Z
  result = result.replace(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?/g, '[TIMESTAMP]');

  // Date only: 2024-01-15
  result = result.replace(/\d{4}-\d{2}-\d{2}/g, '[DATE]');

  // Unix timestamps (13 digits for milliseconds)
  result = result.replace(/\b\d{13}\b/g, '[UNIX_MS]');

  // Unix timestamps (10 digits for seconds)
  result = result.replace(/\b\d{10}\b/g, '[UNIX_S]');

  // Relative time phrases
  result = result.replace(/\d+ (second|minute|hour|day|week|month|year)s? ago/gi, '[TIME_AGO]');

  return result;
}

/**
 * Normalize file paths to be platform-independent
 * Converts Windows paths to Unix style and removes user-specific paths
 */
export function normalizePaths(input: string | object): string | object {
  if (typeof input === 'object' && input !== null) {
    return JSON.parse(normalizePaths(JSON.stringify(input)) as string);
  }

  let result = input as string;

  // Convert Windows backslashes to forward slashes
  result = result.replace(/\\\\/g, '/').replace(/\\/g, '/');

  // Replace user home directories
  result = result.replace(/\/Users\/[^/]+\//g, '/home/user/');
  result = result.replace(/C:\/Users\/[^/]+\//gi, '/home/user/');

  // Replace temp directories
  result = result.replace(/\/var\/folders\/[^/]+\/[^/]+\/T\//g, '/tmp/');
  result = result.replace(/\/tmp\/[^/]+\//g, '/tmp/test/');

  // Replace project-specific paths with placeholder
  result = result.replace(/\/[^/]*Clavix[^/]*\//gi, '/project/');

  return result;
}

/**
 * Replace UUIDs with stable placeholders
 */
export function sanitizeIds(input: string | object): string | object {
  if (typeof input === 'object' && input !== null) {
    return JSON.parse(sanitizeIds(JSON.stringify(input)) as string);
  }

  let result = input as string;

  // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
  result = result.replace(
    /[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/gi,
    '[UUID]'
  );

  // Generic hex IDs (8+ characters)
  result = result.replace(/\b[0-9a-f]{8,}\b/gi, (match) => {
    // Only replace if it looks like a random ID (mostly hex)
    if (match.length >= 16 && /^[0-9a-f]+$/i.test(match)) {
      return '[HEX_ID]';
    }
    return match;
  });

  // Session IDs (common patterns)
  result = result.replace(/session-[a-z0-9-]+/gi, 'session-[ID]');

  return result;
}

/**
 * Sanitize version numbers that might change
 */
export function sanitizeVersions(input: string | object): string | object {
  if (typeof input === 'object' && input !== null) {
    return JSON.parse(sanitizeVersions(JSON.stringify(input)) as string);
  }

  let result = input as string;

  // Semantic versions: 1.2.3, v1.2.3
  result = result.replace(/v?\d+\.\d+\.\d+(-[a-z0-9.]+)?/gi, '[VERSION]');

  return result;
}

/**
 * Combine all sanitizers for comprehensive snapshot preparation
 */
export function sanitizeForSnapshot(input: string | object): string {
  let result = input;

  if (typeof result === 'object') {
    result = JSON.stringify(result, null, 2);
  }

  result = sanitizeTimestamps(result) as string;
  result = normalizePaths(result) as string;
  result = sanitizeIds(result) as string;
  result = sanitizeVersions(result) as string;

  return result;
}

/**
 * Extract and sanitize CLI output for snapshot testing
 * Removes ANSI escape codes and normalizes whitespace
 */
export function sanitizeCliOutput(output: string): string {
  let result = output;

  // Remove ANSI escape codes
  result = result.replace(
    // eslint-disable-next-line no-control-regex
    /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
    ''
  );

  // Normalize line endings
  result = result.replace(/\r\n/g, '\n');

  // Trim trailing whitespace from each line
  result = result
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n');

  // Remove multiple consecutive blank lines
  result = result.replace(/\n{3,}/g, '\n\n');

  // Trim leading/trailing whitespace
  result = result.trim();

  return sanitizeForSnapshot(result);
}

/**
 * Create a deterministic object snapshot by sorting keys
 */
export function sortObjectKeys<T extends object>(obj: T): T {
  if (Array.isArray(obj)) {
    return obj.map((item) =>
      typeof item === 'object' && item !== null ? sortObjectKeys(item) : item
    ) as unknown as T;
  }

  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  const sorted: Record<string, unknown> = {};
  const keys = Object.keys(obj).sort();

  for (const key of keys) {
    const value = (obj as Record<string, unknown>)[key];
    sorted[key] =
      typeof value === 'object' && value !== null ? sortObjectKeys(value as object) : value;
  }

  return sorted as T;
}

/**
 * Prepare an object for snapshot by sanitizing and sorting
 */
export function prepareObjectSnapshot<T extends object>(obj: T): string {
  const sorted = sortObjectKeys(obj);
  return sanitizeForSnapshot(sorted);
}
