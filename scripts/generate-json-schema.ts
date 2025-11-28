/**
 * Generate JSON Schema from Zod schemas
 *
 * This script generates JSON Schema files that can be used for:
 * - IDE autocompletion when editing config files
 * - Validation in external tools
 * - Documentation generation
 *
 * Usage: npx ts-node --esm scripts/generate-json-schema.ts
 */

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Manual JSON Schema generation (no external deps needed)
// Based on the Zod schemas in src/utils/schemas.ts

/**
 * JSON Schema for user's .clavix/config.json
 */
const userConfigSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://clavix.dev/schemas/config.json',
  title: 'Clavix Configuration',
  description: 'Configuration file for Clavix (.clavix/config.json)',
  type: 'object',
  properties: {
    version: {
      type: 'string',
      description: 'Clavix configuration version',
    },
    integrations: {
      type: 'array',
      items: {
        type: 'string',
        minLength: 1,
      },
      description: 'List of enabled integration names',
    },
    providers: {
      type: 'array',
      items: {
        type: 'string',
        minLength: 1,
      },
      description: 'Legacy field: use "integrations" instead',
      deprecated: true,
    },
    templates: {
      type: 'object',
      properties: {
        prdQuestions: { type: 'string' },
        fullPrd: { type: 'string' },
        quickPrd: { type: 'string' },
      },
      description: 'Custom template paths',
    },
    outputs: {
      type: 'object',
      properties: {
        path: { type: 'string' },
        format: {
          type: 'string',
          enum: ['markdown', 'pdf'],
        },
      },
      description: 'Output configuration',
    },
    preferences: {
      type: 'object',
      properties: {
        autoOpenOutputs: { type: 'boolean' },
        verboseLogging: { type: 'boolean' },
      },
      description: 'User preferences',
    },
    experimental: {
      type: 'object',
      additionalProperties: true,
      description: 'Experimental features',
    },
  },
  additionalProperties: false,
};

/**
 * JSON Schema for integrations.json
 */
const integrationsSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://clavix.dev/schemas/integrations.json',
  title: 'Clavix Integrations',
  description: 'Registry of supported AI tool integrations',
  type: 'object',
  required: ['version', 'integrations'],
  properties: {
    $schema: {
      type: 'string',
      description: 'JSON Schema reference',
    },
    version: {
      type: 'string',
      pattern: '^\\d+\\.\\d+\\.\\d+$',
      description: 'Schema version (semver format)',
    },
    integrations: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'object',
        required: [
          'name',
          'displayName',
          'directory',
          'filenamePattern',
          'extension',
          'separator',
          'detection',
        ],
        properties: {
          name: {
            type: 'string',
            minLength: 1,
            description: 'Unique identifier for the integration',
          },
          displayName: {
            type: 'string',
            minLength: 1,
            description: 'Human-readable name',
          },
          directory: {
            type: 'string',
            minLength: 1,
            description: 'Directory path for command files',
          },
          filenamePattern: {
            type: 'string',
            minLength: 1,
            description: 'Pattern for command filenames',
          },
          extension: {
            type: 'string',
            enum: ['.md', '.toml'],
            description: 'File extension for commands',
          },
          separator: {
            type: 'string',
            enum: [':', '-'],
            description: 'Separator character in command names',
          },
          detection: {
            type: 'string',
            minLength: 1,
            description: 'Path to detect if integration is available',
          },
          type: {
            type: 'string',
            enum: ['standard', 'universal'],
            default: 'standard',
            description: 'Integration type (standard or universal)',
          },
          specialAdapter: {
            type: 'string',
            enum: ['toml', 'doc-injection'],
            description: 'Special adapter type if needed',
          },
          rootDir: {
            type: 'string',
            description: 'Root directory for global installations',
          },
          global: {
            type: 'boolean',
            description: 'Whether this is a global integration',
          },
          placeholder: {
            type: 'string',
            description: 'Placeholder content for templates',
          },
        },
        additionalProperties: false,
      },
      description: 'List of integration configurations',
    },
  },
  additionalProperties: false,
};

async function main() {
  const schemasDir = path.join(__dirname, '..', 'schemas');

  // Ensure schemas directory exists
  await fs.ensureDir(schemasDir);

  // Write user config schema
  const configSchemaPath = path.join(schemasDir, 'config.schema.json');
  await fs.writeJson(configSchemaPath, userConfigSchema, { spaces: 2 });
  console.log(`✓ Generated ${configSchemaPath}`);

  // Write integrations schema
  const integrationsSchemaPath = path.join(schemasDir, 'integrations.schema.json');
  await fs.writeJson(integrationsSchemaPath, integrationsSchema, { spaces: 2 });
  console.log(`✓ Generated ${integrationsSchemaPath}`);

  console.log('\nJSON schemas generated successfully!');
  console.log('\nUsage:');
  console.log('  Add "$schema": "./schemas/config.schema.json" to your .clavix/config.json');
  console.log('  This enables IDE autocompletion and validation.');
}

main().catch(console.error);
