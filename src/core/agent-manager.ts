import { AgentAdapter, ValidationResult } from '../types/agent.js';
import { ClaudeCodeAdapter } from './adapters/claude-code-adapter.js';
import { CursorAdapter } from './adapters/cursor-adapter.js';
import { DroidAdapter } from './adapters/droid-adapter.js';
import { OpenCodeAdapter } from './adapters/opencode-adapter.js';
import { AmpAdapter } from './adapters/amp-adapter.js';
import { CrushAdapter } from './adapters/crush-adapter.js';
import { WindsurfAdapter } from './adapters/windsurf-adapter.js';
import { KilocodeAdapter } from './adapters/kilocode-adapter.js';
import { ClineAdapter } from './adapters/cline-adapter.js';
import { RoocodeAdapter } from './adapters/roocode-adapter.js';
import { IntegrationError } from '../types/errors.js';
import { CodeBuddyAdapter } from './adapters/codebuddy-adapter.js';
import { GeminiAdapter } from './adapters/gemini-adapter.js';
import { QwenAdapter } from './adapters/qwen-adapter.js';
import { CodexAdapter } from './adapters/codex-adapter.js';
import { AugmentAdapter } from './adapters/augment-adapter.js';
import { LlxprtAdapter } from './adapters/llxprt-adapter.js';

/**
 * Agent Manager - handles agent detection and registration
 */
export class AgentManager {
  private adapters: Map<string, AgentAdapter> = new Map();

  constructor() {
    // Register all built-in adapters
    this.registerAdapter(new ClaudeCodeAdapter());
    this.registerAdapter(new CursorAdapter());
    this.registerAdapter(new DroidAdapter());
    this.registerAdapter(new OpenCodeAdapter());
    this.registerAdapter(new AmpAdapter());
    this.registerAdapter(new CrushAdapter());
    this.registerAdapter(new WindsurfAdapter());
    this.registerAdapter(new KilocodeAdapter());
    this.registerAdapter(new LlxprtAdapter());
    this.registerAdapter(new ClineAdapter());
    this.registerAdapter(new RoocodeAdapter());
    this.registerAdapter(new AugmentAdapter());
    this.registerAdapter(new CodeBuddyAdapter());
    this.registerAdapter(new GeminiAdapter());
    this.registerAdapter(new QwenAdapter());
    this.registerAdapter(new CodexAdapter());
  }

  /**
   * Register a new agent adapter
   */
  registerAdapter(adapter: AgentAdapter): void {
    this.adapters.set(adapter.name, adapter);
  }

  /**
   * Get all registered adapters
   */
  getAdapters(): AgentAdapter[] {
    return Array.from(this.adapters.values());
  }

  /**
   * Get adapter by name
   */
  getAdapter(name: string): AgentAdapter | undefined {
    return this.adapters.get(name);
  }

  /**
   * Detect which agents are available in the current project
   */
  async detectAgents(): Promise<AgentAdapter[]> {
    const detected: AgentAdapter[] = [];

    for (const adapter of this.adapters.values()) {
      if (await adapter.detectProject()) {
        detected.push(adapter);
      }
    }

    return detected;
  }

  /**
   * Get agent adapter by name or throw error
   */
  requireAdapter(name: string): AgentAdapter {
    const adapter = this.getAdapter(name);
    if (!adapter) {
      throw new IntegrationError(
        `Agent "${name}" is not registered`,
        `Available agents: ${Array.from(this.adapters.keys()).join(', ')}`
      );
    }
    return adapter;
  }

  /**
   * Check if an agent is available
   */
  hasAgent(name: string): boolean {
    return this.adapters.has(name);
  }

  /**
   * Get list of available agent names
   */
  getAvailableAgents(): string[] {
    return Array.from(this.adapters.keys());
  }

  /**
   * Validate multiple adapters
   * Returns map of adapter name to validation result
   */
  async validateAdapters(
    adapterNames: string[]
  ): Promise<Map<string, ValidationResult>> {
    const results = new Map<string, ValidationResult>();

    for (const name of adapterNames) {
      const adapter = this.requireAdapter(name);
      if (adapter.validate) {
        results.set(name, await adapter.validate());
      } else {
        // No validation method - assume valid
        results.set(name, { valid: true });
      }
    }

    return results;
  }

  /**
   * Get adapter choices for inquirer checkbox prompt
   * Returns array of choices with pre-selected defaults
   */
  getAdapterChoices(): Array<{
    name: string;
    value: string;
    checked?: boolean;
  }> {
    return Array.from(this.adapters.values()).map((adapter) => ({
      name: `${adapter.displayName} (${adapter.directory})`,
      value: adapter.name,
      checked: adapter.name === 'claude-code', // Pre-select Claude Code by default
    }));
  }
}
