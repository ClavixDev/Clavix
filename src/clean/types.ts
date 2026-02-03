/**
 * Clean command types
 */

export enum CleanScope {
  CURRENT_PROJECT = 'current',
  EVERYTHING = 'everything',
}

export enum ScanMethod {
  ALL_DIRECTORIES = 'all',
  SPECIFIC_PATHS = 'paths',
  GLOBAL_ONLY = 'global',
}

export interface CleanTarget {
  type: 'file' | 'directory' | 'block';
  path: string;
  description: string;
  size?: number; // In bytes
}

export interface BatchInfo {
  location: string;
  targets: CleanTarget[];
}

export interface CleanResult {
  deleted: number;
  skipped: number;
  errors: string[];
}
