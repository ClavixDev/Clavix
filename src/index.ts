#!/usr/bin/env node

import { run, handle, settings } from '@oclif/core';

// Disable debug mode (stack traces) unless explicitly requested via DEBUG env var
if (!process.env.DEBUG) {
  settings.debug = false;
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  run().catch(handle);
}

// Export for testing
export { run };
