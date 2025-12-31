import { TomlFormattingAdapter } from './toml-formatting-adapter.js';
import { ClavixConfig } from '../../types/config.js';

/**
 * Gemini CLI adapter
 * Commands stored as TOML files under .gemini/commands/clavix by default
 */
export class GeminiAdapter extends TomlFormattingAdapter {
  constructor(
    userConfigOrOptions?: ClavixConfig | { useNamespace?: boolean; userConfig?: ClavixConfig }
  ) {
    // Support both old API (options object) and new API (userConfig directly)
    if (!userConfigOrOptions) {
      super({
        name: 'gemini',
        displayName: 'Gemini CLI',
        rootDir: '.gemini',
      });
    } else if ('useNamespace' in userConfigOrOptions) {
      // It's the options object
      super(
        {
          name: 'gemini',
          displayName: 'Gemini CLI',
          rootDir: '.gemini',
        },
        userConfigOrOptions
      );
    } else {
      // It's the userConfig directly - pass as options
      super(
        {
          name: 'gemini',
          displayName: 'Gemini CLI',
          rootDir: '.gemini',
        },
        { userConfig: userConfigOrOptions as ClavixConfig }
      );
    }
  }
}
