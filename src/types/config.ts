/**
 * Configuration types for Clavix
 */

export interface ClavixConfig {
  version: string;
  integrations: string[];
  templates: TemplateConfig;
  outputs: OutputConfig;
  preferences: PreferencesConfig;
  intelligence?: IntelligenceConfig;
  experimental?: Record<string, unknown>;
}

/**
 * v4.4 Intelligence Configuration
 * Configure pattern behavior, enable/disable patterns, adjust priorities
 * v4.11: Removed defaultMode (fast/deep replaced by improve with auto-detection)
 * v4.12: Added escalation thresholds configuration
 */
export interface IntelligenceConfig {
  /** Pattern-specific settings */
  patterns?: PatternSettingsConfig;
  /** Enable verbose pattern logging */
  verbosePatternLogs?: boolean;
  /** v4.12: Escalation threshold configuration */
  escalation?: EscalationThresholdsConfig;
  /** v4.12: Quality assessment weight overrides */
  qualityWeights?: QualityWeightsConfig;
}

/**
 * v4.12: Configurable escalation thresholds
 * These control when comprehensive analysis is recommended vs standard
 */
export interface EscalationThresholdsConfig {
  /**
   * Quality score threshold for comprehensive mode (default: 75)
   * Prompts >= this score get comprehensive analysis
   */
  comprehensiveAbove?: number;

  /**
   * Quality score threshold for standard mode floor (default: 60)
   * Prompts between standardFloor and comprehensiveAbove get standard optimization
   */
  standardFloor?: number;

  /**
   * Intent confidence threshold for auto-proceed (default: 50)
   * Below this, ask user to confirm intent
   */
  intentConfidenceMin?: number;

  /**
   * Escalation score threshold for strong recommendation (default: 75)
   * Above this, strongly recommend comprehensive mode
   */
  strongRecommendAbove?: number;

  /**
   * Escalation score threshold for suggestion (default: 45)
   * Above this, suggest comprehensive mode as option
   */
  suggestAbove?: number;
}

/**
 * v4.12: Quality dimension weight overrides by intent
 * Allows customizing how quality scores are weighted per intent type
 */
export interface QualityWeightsConfig {
  /** Override weights for specific intents */
  byIntent?: Record<string, QualityDimensionWeights>;
  /** Default weights for all intents (overrides built-in defaults) */
  defaults?: QualityDimensionWeights;
}

/**
 * Weight distribution across quality dimensions (must sum to 100)
 */
export interface QualityDimensionWeights {
  clarity?: number;
  efficiency?: number;
  structure?: number;
  completeness?: number;
  actionability?: number;
  specificity?: number;
}

/**
 * Pattern-specific settings
 */
export interface PatternSettingsConfig {
  /** Disabled pattern IDs (won't run even if applicable) */
  disabled?: string[];
  /** Priority overrides (pattern-id → new priority 1-10) */
  priorityOverrides?: Record<string, number>;
  /** Custom pattern parameters (pattern-id → settings) */
  customSettings?: Record<string, Record<string, unknown>>;
}

/**
 * Legacy config format (pre-v3.5.0)
 * Supports migration from:
 * - v1.3.0 and earlier (single 'agent')
 * - v1.4.0 to v3.4.x ('providers')
 */
export interface LegacyConfig {
  version: string;
  agent?: string;
  providers?: string[];
  templates: TemplateConfig;
  outputs: OutputConfig;
  preferences: PreferencesConfig;
  experimental?: Record<string, unknown>;
}

export interface TemplateConfig {
  prdQuestions: string;
  fullPrd: string;
  quickPrd: string;
}

export interface OutputConfig {
  path: string;
  format: 'markdown' | 'pdf';
}

export interface PreferencesConfig {
  autoOpenOutputs: boolean;
  verboseLogging: boolean;
  preserveSessions: boolean;
}

export const DEFAULT_CONFIG: ClavixConfig = {
  version: '5.1.0',
  integrations: [],
  templates: {
    prdQuestions: 'default',
    fullPrd: 'default',
    quickPrd: 'default',
  },
  outputs: {
    path: '.clavix/outputs',
    format: 'markdown',
  },
  preferences: {
    autoOpenOutputs: false,
    verboseLogging: false,
    preserveSessions: true,
  },
};

/**
 * Migrate legacy config to current format (v3.5.0+)
 * Handles migration from:
 * - v1.3.0 and earlier (single 'agent' field)
 * - v1.4.0 to v3.4.x ('providers' field)
 */
export function migrateConfig(legacy: LegacyConfig): ClavixConfig {
  // Determine which legacy format we're migrating from
  let integrations: string[];

  if (legacy.providers) {
    // Migration from v1.4.0-v3.4.x (providers → integrations)
    integrations = legacy.providers;
  } else if (legacy.agent) {
    // Migration from v1.3.0 and earlier (agent → integrations)
    integrations = [legacy.agent];
  } else {
    // Fallback: empty integrations
    integrations = [];
  }

  return {
    version: '3.5.0',
    integrations,
    templates: legacy.templates,
    outputs: legacy.outputs,
    preferences: legacy.preferences,
    experimental: legacy.experimental,
  };
}

/**
 * Check if config is legacy format (pre-v3.5.0)
 */
export function isLegacyConfig(config: unknown): config is LegacyConfig {
  return (
    config !== null &&
    config !== undefined &&
    typeof config === 'object' &&
    (('agent' in config && typeof (config as { agent: unknown }).agent === 'string') ||
      ('providers' in config && Array.isArray((config as { providers: unknown }).providers))) &&
    !('integrations' in config)
  );
}
