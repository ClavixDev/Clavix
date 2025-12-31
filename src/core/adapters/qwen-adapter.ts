import { TomlFormattingAdapter } from './toml-formatting-adapter.js';
import { ClavixConfig } from '../../types/config.js';

/**
 * Qwen Code CLI adapter
 * Commands stored as TOML files under .qwen/commands/clavix by default
 */
export class QwenAdapter extends TomlFormattingAdapter {
  constructor(
    userConfigOrOptions?: ClavixConfig | { useNamespace?: boolean; userConfig?: ClavixConfig }
  ) {
    // Support both old API (options object) and new API (userConfig directly)
    if (!userConfigOrOptions) {
      super({
        name: 'qwen',
        displayName: 'Qwen Code',
        rootDir: '.qwen',
      });
    } else if ('useNamespace' in userConfigOrOptions) {
      // It's the options object
      super(
        {
          name: 'qwen',
          displayName: 'Qwen Code',
          rootDir: '.qwen',
        },
        userConfigOrOptions
      );
    } else {
      // It's the userConfig directly - pass as options
      super(
        {
          name: 'qwen',
          displayName: 'Qwen Code',
          rootDir: '.qwen',
        },
        { userConfig: userConfigOrOptions as ClavixConfig }
      );
    }
  }
}
