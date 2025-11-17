#!/usr/bin/env node

import { run as oclifRun, handle, settings } from '@oclif/core';

export async function run(argv?: string[]) {
  // Disable debug mode (stack traces) unless explicitly requested via DEBUG env var
  if (!process.env.DEBUG) {
    settings.debug = false;
  }
  return oclifRun(argv);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  run().catch(handle);
}
