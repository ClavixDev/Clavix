/**
 * Legacy Command Cleanup Utility
 *
 * This module handles cleanup of old command naming patterns from previous
 * Clavix versions. It identifies files using deprecated naming conventions
 * and assists in migration to the current standard.
 *
 * @deprecated This module is scheduled for removal in v6.0.0.
 * By that version, all legacy naming patterns should be fully migrated.
 * After v6.0.0, the cleanup functionality will no longer be needed as
 * the transition period will be complete.
 *
 * @since v4.12.0
 */

import * as path from 'path';
import { AgentAdapter } from '../types/agent.js';
import { FileSystem } from './file-system.js';

/**
 * v4.12: Deprecated commands that have been replaced
 * - fast → improve (unified with auto-depth)
 * - deep → improve --comprehensive
 */
const DEPRECATED_COMMANDS = ['fast', 'deep'];

export async function collectLegacyCommandFiles(
  adapter: AgentAdapter,
  commandNames: string[]
): Promise<string[]> {
  const legacyPaths = new Set<string>();
  const extension = adapter.fileExtension;
  const commandDir = path.resolve(adapter.getCommandPath());

  // v4.12: Clean up deprecated fast/deep commands
  for (const deprecatedName of DEPRECATED_COMMANDS) {
    // Check for various naming patterns across adapters
    const candidates = [
      path.resolve(commandDir, `${deprecatedName}${extension}`),
      path.resolve(commandDir, `clavix-${deprecatedName}${extension}`),
      path.resolve(commandDir, `clavix:${deprecatedName}${extension}`),
    ];

    // For Claude Code with subdirectory structure
    if (adapter.name === 'claude-code') {
      const clavixDir = path.resolve(commandDir, 'clavix');
      candidates.push(
        path.resolve(clavixDir, `${deprecatedName}${extension}`),
        path.resolve(clavixDir, `clavix-${deprecatedName}${extension}`)
      );
    }

    for (const candidate of candidates) {
      if (await FileSystem.exists(candidate)) {
        legacyPaths.add(candidate);
      }
    }
  }

  for (const name of commandNames) {
    const newFilePath = path.resolve(commandDir, adapter.getTargetFilename(name));
    const defaultFilePath = path.resolve(commandDir, `${name}${extension}`);

    if (adapter.name === 'cline') {
      const oldDir = path.resolve('.cline', 'workflows');
      const oldCandidates = [
        path.join(oldDir, `${name}${extension}`),
        path.join(oldDir, `clavix-${name}${extension}`),
      ];

      for (const candidate of oldCandidates) {
        const resolvedCandidate = path.resolve(candidate);
        if (resolvedCandidate !== newFilePath && (await FileSystem.exists(resolvedCandidate))) {
          legacyPaths.add(resolvedCandidate);
        }
      }

      if (defaultFilePath !== newFilePath && (await FileSystem.exists(defaultFilePath))) {
        legacyPaths.add(defaultFilePath);
      }
      continue;
    }

    if (adapter.name === 'gemini' || adapter.name === 'qwen') {
      const namespaced = commandDir.endsWith(path.join('commands', 'clavix'));
      if (
        !namespaced &&
        defaultFilePath !== newFilePath &&
        (await FileSystem.exists(defaultFilePath))
      ) {
        legacyPaths.add(defaultFilePath);
      }
    } else if (defaultFilePath !== newFilePath && (await FileSystem.exists(defaultFilePath))) {
      legacyPaths.add(defaultFilePath);
    }
  }

  if (adapter.name === 'claude-code') {
    const commandsDir = path.resolve('.claude', 'commands');
    const colonFiles = await FileSystem.listFiles(commandsDir, /^clavix:.*\.md$/);
    for (const file of colonFiles) {
      legacyPaths.add(path.resolve(path.join(commandsDir, file)));
    }

    const clavixDir = path.resolve(commandsDir, 'clavix');
    const hyphenFiles = await FileSystem.listFiles(clavixDir, /^clavix-.*\.md$/);
    for (const file of hyphenFiles) {
      legacyPaths.add(path.resolve(path.join(clavixDir, file)));
    }

    // Remove task-complete.md (CLI-only command, not a user-facing slash command)
    const taskCompleteFile = path.resolve(clavixDir, 'task-complete.md');
    if (await FileSystem.exists(taskCompleteFile)) {
      legacyPaths.add(taskCompleteFile);
    }
  }

  return Array.from(legacyPaths);
}
