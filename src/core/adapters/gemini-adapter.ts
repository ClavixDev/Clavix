import { TomlFormattingAdapter } from './toml-formatting-adapter.js';

/**
 * Gemini CLI adapter
 * Commands stored as TOML files under .gemini/commands/clavix by default
 */
export class GeminiAdapter extends TomlFormattingAdapter {
  constructor(options: { useNamespace?: boolean } = {}) {
    super(
      {
        name: 'gemini',
        displayName: 'Gemini CLI',
        rootDir: '.gemini',
      },
      options
    );
  }
}
