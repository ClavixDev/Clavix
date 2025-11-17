#!/usr/bin/env node

import { settings, handle } from '@oclif/core';
import clavixApp from '../dist/index.js';

// Disable debug mode (stack traces) unless explicitly requested via DEBUG env var
if (!process.env.DEBUG) {
  settings.debug = false;
}

// Custom error handler to suppress stack traces
async function handleError(error) {
  // For CLIError, show only the formatted message
  if (error.oclif && error.oclif.exit !== undefined) {
    // Format error message (hints are now included in error.message)
    console.error(' ›   Error: ' + error.message);
    process.exit(error.oclif.exit);
  }

  // For other errors, use default handler
  return handle(error);
}

clavixApp
  .run()
  .catch(handleError);
