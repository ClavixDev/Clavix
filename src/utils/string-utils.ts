/**
 * String utility functions for Clavix
 */

/**
 * Escape special characters in a string for use in a regular expression
 * @param str - The string to escape
 * @returns The escaped string safe for use in RegExp
 */
export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
