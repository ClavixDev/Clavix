/**
 * Google Antigravity Skills Adapter
 *
 * Specialized adapter for managing Agent Skills within the Google Antigravity IDE environment.
 * Extends the standard AgentSkillsAdapter but overrides paths for Antigravity-specific locations.
 *
 * @since v7.3.0
 */

import { AgentSkillsAdapter } from './agent-skills-adapter.js';
import { ClavixConfig } from '../../types/config.js';

/**
 * Base class for Antigravity skill adapters
 */
export abstract class AntigravitySkillsAdapter extends AgentSkillsAdapter {
  constructor(userConfig?: ClavixConfig) {
    // We treat Antigravity as a "custom" scope internally to bypass standard global/project logic
    super('custom', userConfig);
  }
}

/**
 * Adapter for Antigravity Global Skills (~/.gemini/antigravity/skills)
 */
export class AntigravityGlobalAdapter extends AntigravitySkillsAdapter {
  constructor(userConfig?: ClavixConfig) {
    super(userConfig);
    // Override properties set by base class
    Object.defineProperty(this, 'name', { value: 'agent-skills-antigravity-global' });
    Object.defineProperty(this, 'displayName', { value: 'Agent Skills (Antigravity Global)' });
  }

  get directory(): string {
    return '~/.gemini/antigravity/skills';
  }
}

/**
 * Adapter for Antigravity Workspace Skills (.agent/skills)
 */
export class AntigravityWorkspaceAdapter extends AntigravitySkillsAdapter {
  constructor(userConfig?: ClavixConfig) {
    super(userConfig);
    // Override properties set by base class
    Object.defineProperty(this, 'name', { value: 'agent-skills-antigravity-workspace' });
    Object.defineProperty(this, 'displayName', {
      value: 'Agent Skills (Antigravity Workspace)',
    });
  }

  get directory(): string {
    return '.agent/skills';
  }
}
