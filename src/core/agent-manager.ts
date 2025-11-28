import { AgentAdapter, ValidationResult } from '../types/agent.js';
import { ClaudeCodeAdapter } from './adapters/claude-code-adapter.js';
import { GeminiAdapter } from './adapters/gemini-adapter.js';
import { QwenAdapter } from './adapters/qwen-adapter.js';
import { LlxprtAdapter } from './adapters/llxprt-adapter.js';
import { UniversalAdapter } from './adapters/universal-adapter.js';
import { getSimpleAdapters } from './adapter-registry.js';
import { IntegrationError } from '../types/errors.js';

/**
 * Agent Manager - handles agent detection and registration
 *
 * Uses factory pattern with ADAPTER_CONFIGS for simple adapters,
 * while keeping dedicated classes for special adapters (TOML, doc injection).
 *
 * @since v5.5.0 - Refactored to use config-driven factory pattern
 */
export class AgentManager {
  private adapters: Map<string, AgentAdapter> = new Map();

  constructor() {
    // Register special adapters (require custom logic)
    this.registerAdapter(new ClaudeCodeAdapter()); // Doc injection
    this.registerAdapter(new GeminiAdapter()); // TOML format
    this.registerAdapter(new QwenAdapter()); // TOML format
    this.registerAdapter(new LlxprtAdapter()); // TOML format

    // Register simple adapters from config (using UniversalAdapter factory)
    for (const config of getSimpleAdapters()) {
      // Skip adapters that have special handlers registered above
      if (this.adapters.has(config.name)) continue;
      this.registerAdapter(new UniversalAdapter(config));
    }
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
  async validateAdapters(adapterNames: string[]): Promise<Map<string, ValidationResult>> {
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
