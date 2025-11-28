/**
 * Zod schemas for configuration file validation
 * Provides runtime validation for integrations.json and user config.json
 */

import { z } from 'zod';

/**
 * Integration type discriminator
 * - "standard": Normal adapter with slash command generation
 * - "universal": Documentation-only adapter (Copilot, OCTO, WARP)
 */
const IntegrationTypeSchema = z.enum(['standard', 'universal']).optional().default('standard');

/**
 * Schema for a single integration entry in integrations.json
 */
export const IntegrationEntrySchema = z.object({
  name: z.string().min(1, 'Integration name is required'),
  displayName: z.string().min(1, 'Display name is required'),
  directory: z.string().min(1, 'Directory path is required'),
  filenamePattern: z.string().min(1, 'Filename pattern is required'),
  extension: z.enum(['.md', '.toml']),
  separator: z.enum([':', '-']),
  detection: z.string().min(1, 'Detection path is required'),
  type: IntegrationTypeSchema,
  // Optional fields
  specialAdapter: z.enum(['toml', 'doc-injection']).optional(),
  rootDir: z.string().optional(),
  global: z.boolean().optional(),
  placeholder: z.string().optional(),
});

/**
 * Schema for the full integrations.json file
 */
export const IntegrationsConfigSchema = z.object({
  $schema: z.string().optional(),
  version: z.string().regex(/^\d+\.\d+\.\d+$/, 'Version must be semver format (e.g., "1.0.0")'),
  integrations: z
    .array(IntegrationEntrySchema)
    .min(1, 'At least one integration is required')
    .refine(
      (integrations) => {
        const names = integrations.map((i) => i.name);
        return new Set(names).size === names.length;
      },
      { message: 'Integration names must be unique' }
    ),
});

/**
 * Schema for user's .clavix/config.json
 */
export const UserConfigSchema = z.object({
  integrations: z.array(z.string().min(1)).optional().describe('List of enabled integration names'),
  // Legacy field name (backwards compatibility)
  providers: z
    .array(z.string().min(1))
    .optional()
    .describe('Legacy field: use "integrations" instead'),
});

/**
 * Inferred TypeScript types from schemas
 */
export type IntegrationEntry = z.infer<typeof IntegrationEntrySchema>;
export type IntegrationsConfig = z.infer<typeof IntegrationsConfigSchema>;
export type UserConfig = z.infer<typeof UserConfigSchema>;

/**
 * Validation result type
 */
export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: z.ZodError;
  warnings?: string[];
}

/**
 * Validate integrations.json content (build-time, strict)
 * @param content - Parsed JSON content from integrations.json
 * @returns Validation result with parsed data or errors
 */
export function validateIntegrationsConfig(content: unknown): ValidationResult<IntegrationsConfig> {
  const result = IntegrationsConfigSchema.safeParse(content);

  if (!result.success) {
    return {
      success: false,
      errors: result.error,
    };
  }

  const warnings: string[] = [];

  // Check for unknown fields (warn only)
  if (typeof content === 'object' && content !== null) {
    const knownFields = new Set(['$schema', 'version', 'integrations']);
    const contentKeys = Object.keys(content);
    const unknownKeys = contentKeys.filter((key) => !knownFields.has(key));

    if (unknownKeys.length > 0) {
      warnings.push(`Unknown fields in integrations.json: ${unknownKeys.join(', ')}`);
    }
  }

  return {
    success: true,
    data: result.data,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

/**
 * Validate user config.json content (runtime, lenient)
 * @param content - Parsed JSON content from .clavix/config.json
 * @returns Validation result with parsed data or errors
 */
export function validateUserConfig(content: unknown): ValidationResult<UserConfig> {
  const result = UserConfigSchema.safeParse(content);

  if (!result.success) {
    return {
      success: false,
      errors: result.error,
    };
  }

  const warnings: string[] = [];

  // Warn about legacy field usage
  if (result.data.providers && !result.data.integrations) {
    warnings.push(
      'Using deprecated "providers" field. Please rename to "integrations" in .clavix/config.json'
    );
  }

  // Check for unknown fields (warn only)
  if (typeof content === 'object' && content !== null) {
    const knownFields = new Set(['integrations', 'providers']);
    const contentKeys = Object.keys(content);
    const unknownKeys = contentKeys.filter((key) => !knownFields.has(key));

    if (unknownKeys.length > 0) {
      warnings.push(`Unknown fields in config.json: ${unknownKeys.join(', ')}`);
    }
  }

  return {
    success: true,
    data: result.data,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

/**
 * Format Zod errors into human-readable messages
 * @param errors - Zod validation errors
 * @returns Array of formatted error messages
 */
export function formatZodErrors(errors: z.ZodError): string[] {
  return errors.errors.map((err) => {
    const path = err.path.join('.');
    return path ? `${path}: ${err.message}` : err.message;
  });
}
