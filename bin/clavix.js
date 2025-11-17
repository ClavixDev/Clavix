#!/usr/bin/env node

import { run, handle, settings } from '@oclif/core';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the project root (one level up from bin/)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Disable debug mode unless explicitly requested
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

run(undefined, projectRoot)
  .catch(handleError);
