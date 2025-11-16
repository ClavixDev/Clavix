#!/usr/bin/env node

// Disable debug mode (stack traces) unless explicitly requested via DEBUG env var
if (!process.env.DEBUG) {
  require('@oclif/core').settings.debug = false;
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
  const { handle } = require('@oclif/core');
  return handle(error);
}

require('../dist/index.js')
  .run()
  .catch(handleError);
