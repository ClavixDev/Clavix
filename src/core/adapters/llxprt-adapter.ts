import { TomlFormattingAdapter } from './toml-formatting-adapter.js';

/**
 * LLXPRT adapter
 * Commands stored as TOML files under .llxprt/commands/clavix by default
 */
export class LlxprtAdapter extends TomlFormattingAdapter {
  constructor(options: { useNamespace?: boolean } = {}) {
    super(
      {
        name: 'llxprt',
        displayName: 'LLXPRT',
        rootDir: '.llxprt',
      },
      options
    );
  }
}
