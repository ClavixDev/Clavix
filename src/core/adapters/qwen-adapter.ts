import { TomlFormattingAdapter } from './toml-formatting-adapter.js';

/**
 * Qwen Code CLI adapter
 * Commands stored as TOML files under .qwen/commands/clavix by default
 */
export class QwenAdapter extends TomlFormattingAdapter {
  constructor(options: { useNamespace?: boolean } = {}) {
    super(
      {
        name: 'qwen',
        displayName: 'Qwen Code',
        rootDir: '.qwen',
      },
      options
    );
  }
}
