import { TomlFormattingAdapter } from './toml-formatting-adapter.js';
import { ClavixConfig } from '../../types/config.js';

/**
 * LLXPRT adapter
 * Commands stored as TOML files under .llxprt/commands/clavix by default
 */
export class LlxprtAdapter extends TomlFormattingAdapter {
  constructor(
    userConfigOrOptions?: ClavixConfig | { useNamespace?: boolean; userConfig?: ClavixConfig }
  ) {
    // Support both old API (options object) and new API (userConfig directly)
    if (!userConfigOrOptions) {
      super({
        name: 'llxprt',
        displayName: 'LLXPRT',
        rootDir: '.llxprt',
      });
    } else if ('useNamespace' in userConfigOrOptions) {
      // It's the options object
      super(
        {
          name: 'llxprt',
          displayName: 'LLXPRT',
          rootDir: '.llxprt',
        },
        userConfigOrOptions
      );
    } else {
      // It's the userConfig directly - pass as options
      super(
        {
          name: 'llxprt',
          displayName: 'LLXPRT',
          rootDir: '.llxprt',
        },
        { userConfig: userConfigOrOptions as ClavixConfig }
      );
    }
  }
}
