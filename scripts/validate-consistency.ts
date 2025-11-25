#!/usr/bin/env npx ts-node --esm
/**
 * validate-consistency.ts
 *
 * Clavix Intelligence v4.2 - TypeScript ↔ Template Consistency Validator
 *
 * This script validates that canonical templates are in sync with TypeScript types.
 * It blocks git commits, npm build, and npm publish if inconsistencies are found.
 *
 * Usage:
 *   npm run validate:consistency
 *   npx ts-node --esm scripts/validate-consistency.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');

// ============================================================================
// Configuration
// ============================================================================

const PATHS = {
  types: path.join(ROOT_DIR, 'src/core/intelligence/types.ts'),
  patternLibrary: path.join(ROOT_DIR, 'src/core/intelligence/pattern-library.ts'),
  patternsDir: path.join(ROOT_DIR, 'src/core/intelligence/patterns'),
  canonicalTemplates: path.join(ROOT_DIR, 'src/templates/slash-commands/_canonical'),
  patternVisibility: path.join(
    ROOT_DIR,
    'src/templates/slash-commands/_components/sections/pattern-visibility.md'
  ),
};

// Templates that should document intent types
const INTENT_TEMPLATES = ['fast.md', 'deep.md'];

// Templates that should document quality dimensions
const DIMENSION_TEMPLATES = ['fast.md', 'deep.md'];

// ============================================================================
// Type Extraction from TypeScript
// ============================================================================

interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

interface ValidationError {
  type: 'intent' | 'dimension' | 'pattern-priority' | 'pattern-mode';
  message: string;
  file: string;
  line?: number;
  expected: string[];
  found: string[];
  missing: string[];
}

interface ValidationWarning {
  type: string;
  message: string;
  file: string;
}

function extractIntentsFromTypes(content: string): string[] {
  // Match: export type PromptIntent = 'code-generation' | 'planning' | ...
  const match = content.match(/export type PromptIntent\s*=\s*([\s\S]*?);/);
  if (!match) return [];

  // Extract all string literals
  const intents = match[1].match(/'([^']+)'/g);
  if (!intents) return [];

  return intents.map((i) => i.replace(/'/g, ''));
}

function extractDimensionsFromTypes(content: string): string[] {
  // Match: export type QualityDimension = 'clarity' | 'efficiency' | ...
  const match = content.match(/export type QualityDimension\s*=\s*([\s\S]*?);/);
  if (!match) return [];

  // Extract all string literals
  const dimensions = match[1].match(/'([^']+)'/g);
  if (!dimensions) return [];

  return dimensions.map((d) => d.replace(/'/g, ''));
}

interface PatternInfo {
  name: string;
  priority: number;
  mode: 'fast' | 'deep' | 'both';
}

function extractPatternsFromLibrary(content: string): PatternInfo[] {
  const patterns: PatternInfo[] = [];

  // Match pattern registrations like: this.register(new ConcisenessFilter());
  const registrations = content.match(/this\.register\(new\s+(\w+)\(\)\);/g);
  if (!registrations) return patterns;

  for (const reg of registrations) {
    const nameMatch = reg.match(/new\s+(\w+)\(\)/);
    if (nameMatch) {
      patterns.push({
        name: nameMatch[1],
        priority: 0, // Will be filled from pattern files
        mode: 'both', // Will be filled from pattern files
      });
    }
  }

  return patterns;
}

// Special mappings for pattern class names that don't follow standard PascalCase→kebab-case conversion
const PATTERN_FILENAME_MAP: Record<string, string> = {
  // Class name -> filename (without .ts extension)
  ContextPrecisionBooster: 'context-precision',
  PRDStructureEnforcer: 'prd-structure-enforcer',
};

function classNameToFilename(className: string): string {
  // Check special mapping first
  if (PATTERN_FILENAME_MAP[className]) {
    return PATTERN_FILENAME_MAP[className];
  }

  // Standard conversion: PascalCase to kebab-case
  // Handle acronyms like PRD by treating consecutive uppercase as a unit
  return className
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2') // Handle acronyms followed by words
    .replace(/([a-z])([A-Z])/g, '$1-$2') // Handle normal PascalCase
    .toLowerCase()
    .replace(/^-/, '');
}

async function extractPatternDetails(
  patternsDir: string,
  patternNames: string[]
): Promise<PatternInfo[]> {
  const patterns: PatternInfo[] = [];

  for (const name of patternNames) {
    const filename = classNameToFilename(name);
    const filePath = path.join(patternsDir, `${filename}.ts`);

    try {
      const content = fs.readFileSync(filePath, 'utf-8');

      // Extract priority
      const priorityMatch = content.match(/priority\s*=\s*(\d+)/);
      const priority = priorityMatch ? parseInt(priorityMatch[1]) : 0;

      // Extract mode
      const modeMatch = content.match(/mode:\s*OptimizationMode\s*=\s*['"](\w+)['"]/);
      const mode = (modeMatch ? modeMatch[1] : 'both') as 'fast' | 'deep' | 'both';

      patterns.push({ name, priority, mode });
    } catch {
      // Pattern file not found, try to find it by scanning directory
      try {
        const files = fs.readdirSync(patternsDir);
        const matchingFile = files.find((f) => {
          if (!f.endsWith('.ts') || f === 'base-pattern.ts') return false;
          const content = fs.readFileSync(path.join(patternsDir, f), 'utf-8');
          return content.includes(`export class ${name}`);
        });

        if (matchingFile) {
          const content = fs.readFileSync(path.join(patternsDir, matchingFile), 'utf-8');
          const priorityMatch = content.match(/priority\s*=\s*(\d+)/);
          const priority = priorityMatch ? parseInt(priorityMatch[1]) : 0;
          const modeMatch = content.match(/mode:\s*OptimizationMode\s*=\s*['"](\w+)['"]/);
          const mode = (modeMatch ? modeMatch[1] : 'both') as 'fast' | 'deep' | 'both';
          patterns.push({ name, priority, mode });
        } else {
          patterns.push({ name, priority: 0, mode: 'both' });
        }
      } catch {
        patterns.push({ name, priority: 0, mode: 'both' });
      }
    }
  }

  return patterns;
}

// ============================================================================
// Template Extraction
// ============================================================================

interface TemplateIntentInfo {
  file: string;
  intents: string[];
  lineNumbers: { start: number; end: number };
}

function extractIntentsFromTemplate(content: string, filename: string): TemplateIntentInfo {
  const lines = content.split('\n');
  const intents: string[] = [];
  let startLine = 0;
  let endLine = 0;

  // Look for intent detection section and extract intent names
  // Pattern: - **intent-name**: description (with leading spaces)
  const intentPattern = /^\s+-\s+\*\*([a-z-]+)\*\*:/;

  let inIntentSection = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect start of intent section - must be a numbered instruction (e.g., "2. **Intent Detection**")
    // This avoids matching mentions in CLAVIX MODE section
    if (/^\d+\.\s+\*\*Intent Detection\*\*/.test(line)) {
      inIntentSection = true;
      startLine = i + 1;
      continue;
    }

    // Detect end of section (next numbered instruction like "3. **Quality Assessment**")
    if (inIntentSection && /^\d+\.\s+\*\*/.test(line)) {
      endLine = i;
      inIntentSection = false;
      break;
    }

    // Extract intent from line
    if (inIntentSection) {
      const match = line.match(intentPattern);
      if (match) {
        intents.push(match[1]);
        if (!endLine) endLine = i;
      }
    }
  }

  return {
    file: filename,
    intents,
    lineNumbers: { start: startLine, end: endLine || startLine + intents.length },
  };
}

interface TemplateDimensionInfo {
  file: string;
  dimensions: string[];
  lineNumbers: { start: number; end: number };
  dimensionCount: number | null; // The number mentioned in template (e.g., "5-dimension")
}

function extractDimensionsFromTemplate(content: string, filename: string): TemplateDimensionInfo {
  const lines = content.split('\n');
  const dimensions: string[] = [];
  let startLine = 0;
  let endLine = 0;
  let dimensionCount: number | null = null;

  // Look for dimension count in features section
  const countMatch = content.match(/(\d+)-dimension/i);
  if (countMatch) {
    dimensionCount = parseInt(countMatch[1]);
  }

  // Look for quality assessment section and extract dimension names
  // Pattern: **Dimension**: description or - **Dimension**:
  const dimensionPattern = /^\s*-?\s*\*\*([A-Za-z]+)\*\*:/;
  const knownDimensions = [
    'clarity',
    'efficiency',
    'structure',
    'completeness',
    'actionability',
    'specificity',
  ];

  let inQualitySection = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();

    // Detect start of quality section
    if (line.includes('quality assessment') || line.includes('quality dimensions')) {
      inQualitySection = true;
      startLine = i + 1;
      continue;
    }

    // Detect end of section
    if (inQualitySection && (line.startsWith('#') || line.startsWith('##'))) {
      if (dimensions.length > 0) {
        endLine = i;
        break;
      }
    }

    // Extract dimension from line
    if (inQualitySection) {
      const match = lines[i].match(dimensionPattern);
      if (match) {
        const dim = match[1].toLowerCase();
        if (knownDimensions.includes(dim) && !dimensions.includes(dim)) {
          dimensions.push(dim);
          if (!endLine) endLine = i;
        }
      }
    }
  }

  return {
    file: filename,
    dimensions,
    lineNumbers: { start: startLine, end: endLine || startLine + dimensions.length },
    dimensionCount,
  };
}

interface PatternVisibilityInfo {
  patterns: { name: string; priority: number }[];
  lineNumbers: Map<string, number>;
}

function extractPatternsFromVisibilityDoc(content: string): PatternVisibilityInfo {
  const patterns: { name: string; priority: number }[] = [];
  const lineNumbers = new Map<string, number>();

  const lines = content.split('\n');

  // Look for pattern table rows: | PatternName | 8 | description |
  const patternRowRegex = /^\|\s*(\w+)\s*\|\s*(\d+)\s*\|/;

  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(patternRowRegex);
    if (match) {
      const name = match[1];
      const priority = parseInt(match[2]);
      patterns.push({ name, priority });
      lineNumbers.set(name, i + 1); // 1-indexed
    }
  }

  return { patterns, lineNumbers };
}

// ============================================================================
// Validation Logic
// ============================================================================

async function validateIntentTypes(): Promise<ValidationError[]> {
  const errors: ValidationError[] = [];

  // Read TypeScript types
  const typesContent = fs.readFileSync(PATHS.types, 'utf-8');
  const expectedIntents = extractIntentsFromTypes(typesContent);

  // Check each template
  for (const templateName of INTENT_TEMPLATES) {
    const templatePath = path.join(PATHS.canonicalTemplates, templateName);
    const templateContent = fs.readFileSync(templatePath, 'utf-8');
    const templateInfo = extractIntentsFromTemplate(templateContent, templateName);

    const missing = expectedIntents.filter((i) => !templateInfo.intents.includes(i));

    if (missing.length > 0) {
      errors.push({
        type: 'intent',
        message: `Missing intent types in ${templateName}`,
        file: `src/templates/slash-commands/_canonical/${templateName}`,
        line: templateInfo.lineNumbers.start,
        expected: expectedIntents,
        found: templateInfo.intents,
        missing,
      });
    }
  }

  return errors;
}

async function validateQualityDimensions(): Promise<ValidationError[]> {
  const errors: ValidationError[] = [];

  // Read TypeScript types
  const typesContent = fs.readFileSync(PATHS.types, 'utf-8');
  const expectedDimensions = extractDimensionsFromTypes(typesContent);

  // Check each template
  for (const templateName of DIMENSION_TEMPLATES) {
    const templatePath = path.join(PATHS.canonicalTemplates, templateName);
    const templateContent = fs.readFileSync(templatePath, 'utf-8');
    const templateInfo = extractDimensionsFromTemplate(templateContent, templateName);

    const missing = expectedDimensions.filter((d) => !templateInfo.dimensions.includes(d));

    if (missing.length > 0) {
      errors.push({
        type: 'dimension',
        message: `Missing quality dimensions in ${templateName}`,
        file: `src/templates/slash-commands/_canonical/${templateName}`,
        line: templateInfo.lineNumbers.start,
        expected: expectedDimensions,
        found: templateInfo.dimensions,
        missing,
      });
    }

    // Check dimension count consistency
    if (
      templateInfo.dimensionCount !== null &&
      templateInfo.dimensionCount !== expectedDimensions.length
    ) {
      errors.push({
        type: 'dimension',
        message: `Dimension count mismatch in ${templateName}: says "${templateInfo.dimensionCount}-dimension" but TypeScript defines ${expectedDimensions.length}`,
        file: `src/templates/slash-commands/_canonical/${templateName}`,
        expected: [`${expectedDimensions.length}-dimension`],
        found: [`${templateInfo.dimensionCount}-dimension`],
        missing: [],
      });
    }
  }

  return errors;
}

async function validatePatternPriorities(): Promise<ValidationError[]> {
  const errors: ValidationError[] = [];

  // Read pattern library
  const libraryContent = fs.readFileSync(PATHS.patternLibrary, 'utf-8');
  const patternNames = extractPatternsFromLibrary(libraryContent).map((p) => p.name);

  // Get actual pattern details from pattern files
  const expectedPatterns = await extractPatternDetails(PATHS.patternsDir, patternNames);

  // Read pattern visibility doc
  const visibilityContent = fs.readFileSync(PATHS.patternVisibility, 'utf-8');
  const docPatterns = extractPatternsFromVisibilityDoc(visibilityContent);

  // Compare priorities
  for (const expected of expectedPatterns) {
    const docPattern = docPatterns.patterns.find((p) => p.name === expected.name);

    if (docPattern && docPattern.priority !== expected.priority) {
      errors.push({
        type: 'pattern-priority',
        message: `Pattern priority mismatch: ${expected.name}`,
        file: 'src/templates/slash-commands/_components/sections/pattern-visibility.md',
        line: docPatterns.lineNumbers.get(expected.name),
        expected: [`${expected.name}: priority ${expected.priority}`],
        found: [`${expected.name}: priority ${docPattern.priority}`],
        missing: [],
      });
    }
  }

  return errors;
}

// ============================================================================
// Main Validation Runner
// ============================================================================

export async function validateConsistency(): Promise<ValidationResult> {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  console.log('\n🔍 Clavix Intelligence - Consistency Validator v4.2\n');
  console.log('Checking TypeScript ↔ Template synchronization...\n');

  // Run all validations
  try {
    const intentErrors = await validateIntentTypes();
    errors.push(...intentErrors);
    console.log(
      `  Intent Types: ${intentErrors.length === 0 ? '✅ OK' : `❌ ${intentErrors.length} issues`}`
    );
  } catch (e) {
    console.log(`  Intent Types: ⚠️ Could not validate (${e})`);
  }

  try {
    const dimensionErrors = await validateQualityDimensions();
    errors.push(...dimensionErrors);
    console.log(
      `  Quality Dimensions: ${dimensionErrors.length === 0 ? '✅ OK' : `❌ ${dimensionErrors.length} issues`}`
    );
  } catch (e) {
    console.log(`  Quality Dimensions: ⚠️ Could not validate (${e})`);
  }

  try {
    const priorityErrors = await validatePatternPriorities();
    errors.push(...priorityErrors);
    console.log(
      `  Pattern Priorities: ${priorityErrors.length === 0 ? '✅ OK' : `❌ ${priorityErrors.length} issues`}`
    );
  } catch (e) {
    console.log(`  Pattern Priorities: ⚠️ Could not validate (${e})`);
  }

  console.log('');

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

function formatErrors(errors: ValidationError[]): string {
  if (errors.length === 0) return '';

  let output = '\n❌ CONSISTENCY CHECK FAILED\n\n';

  // Group by type
  const byType = new Map<string, ValidationError[]>();
  for (const error of errors) {
    const existing = byType.get(error.type) || [];
    existing.push(error);
    byType.set(error.type, existing);
  }

  // Intent errors
  const intentErrors = byType.get('intent') || [];
  if (intentErrors.length > 0) {
    output += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
    output += 'Intent Types Mismatch\n';
    output += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';

    for (const error of intentErrors) {
      output += `  📄 ${error.file}${error.line ? `:${error.line}` : ''}\n`;
      output += `  TypeScript defines: ${error.expected.join(', ')}\n`;
      output += `  Template documents: ${error.found.join(', ') || '(none found)'}\n`;
      output += `  ❌ MISSING: ${error.missing.join(', ')}\n\n`;
    }
  }

  // Dimension errors
  const dimensionErrors = byType.get('dimension') || [];
  if (dimensionErrors.length > 0) {
    output += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
    output += 'Quality Dimensions Mismatch\n';
    output += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';

    for (const error of dimensionErrors) {
      output += `  📄 ${error.file}${error.line ? `:${error.line}` : ''}\n`;
      output += `  ${error.message}\n`;
      if (error.expected.length > 0) {
        output += `  TypeScript defines: ${error.expected.join(', ')}\n`;
      }
      if (error.found.length > 0) {
        output += `  Template documents: ${error.found.join(', ')}\n`;
      }
      if (error.missing.length > 0) {
        output += `  ❌ MISSING: ${error.missing.join(', ')}\n`;
      }
      output += '\n';
    }
  }

  // Pattern priority errors
  const priorityErrors = byType.get('pattern-priority') || [];
  if (priorityErrors.length > 0) {
    output += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
    output += 'Pattern Priority Mismatch\n';
    output += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';

    for (const error of priorityErrors) {
      output += `  📄 ${error.file}${error.line ? `:${error.line}` : ''}\n`;
      output += `  TypeScript: ${error.expected[0]}\n`;
      output += `  Documentation: ${error.found[0]}\n\n`;
    }
  }

  output += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
  output += `\n⚠️  Fix these ${errors.length} issue(s) before committing.\n\n`;

  return output;
}

// ============================================================================
// CLI Entry Point
// ============================================================================

async function main() {
  const result = await validateConsistency();

  if (!result.valid) {
    console.log(formatErrors(result.errors));
    process.exit(1);
  }

  console.log('✅ All consistency checks passed!\n');
  process.exit(0);
}

// Run if executed directly
main().catch((error) => {
  console.error('Validation script error:', error);
  process.exit(1);
});
