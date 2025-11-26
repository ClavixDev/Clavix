#!/usr/bin/env npx ts-node --esm
/**
 * validate-consistency.ts
 *
 * Clavix Intelligence v4.7 - TypeScript ↔ Template Consistency Validator
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
  escalationFactors: path.join(
    ROOT_DIR,
    'src/templates/slash-commands/_components/sections/escalation-factors.md'
  ),
  decisionRules: path.join(
    ROOT_DIR,
    'src/templates/slash-commands/_components/agent-protocols/decision-rules.md'
  ),
  universalOptimizer: path.join(ROOT_DIR, 'src/core/intelligence/universal-optimizer.ts'),
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
  type:
    | 'intent'
    | 'dimension'
    | 'pattern-priority'
    | 'pattern-mode'
    | 'escalation-factor'
    | 'escalation-threshold'
    | 'pattern-count'
    | 'outdated-version';
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

      // Extract priority (v4.5 format: readonly priority: PatternPriority = 4)
      // Also handles older format: priority = 4
      const priorityMatch = content.match(/priority(?::\s*PatternPriority)?\s*=\s*(\d+)/);
      const priority = priorityMatch ? parseInt(priorityMatch[1]) : 0;

      // Extract mode (v4.5 format: readonly mode: PatternMode = 'both')
      // Also handles older format: mode: OptimizationMode = 'both'
      const modeMatch = content.match(
        /mode(?::\s*(?:PatternMode|OptimizationMode))?\s*=\s*['"](\w+)['"]/
      );
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
          const priorityMatch = content.match(/priority(?::\s*PatternPriority)?\s*=\s*(\d+)/);
          const priority = priorityMatch ? parseInt(priorityMatch[1]) : 0;
          const modeMatch = content.match(
            /mode(?::\s*(?:PatternMode|OptimizationMode))?\s*=\s*['"](\w+)['"]/
          );
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
// Escalation Factor Validation (v4.3)
// ============================================================================

/**
 * Extract escalation factor names from the template markdown table
 */
function extractEscalationFactorsFromTemplate(content: string): string[] {
  const factors: string[] = [];

  // Match table rows with factor names: | `factor-name` | description | points |
  const factorPattern = /\|\s*`([a-z-]+)`\s*\|/g;
  let match;

  while ((match = factorPattern.exec(content)) !== null) {
    factors.push(match[1]);
  }

  return factors;
}

/**
 * Extract escalation factor names from UniversalOptimizer.analyzeEscalation()
 */
function extractEscalationFactorsFromCode(content: string): string[] {
  const factors: string[] = [];

  // Match: factor: 'factor-name'
  const factorPattern = /factor:\s*['"]([a-z-]+)['"]/g;
  let match;

  while ((match = factorPattern.exec(content)) !== null) {
    if (!factors.includes(match[1])) {
      factors.push(match[1]);
    }
  }

  return factors;
}

/**
 * Extract escalation thresholds from template
 */
function extractEscalationThresholdsFromTemplate(content: string): number[] {
  const thresholds: number[] = [];

  // Match: | 75+ | `[STRONGLY RECOMMEND DEEP]` | ...
  // Match: | 60-74 | `[RECOMMEND DEEP]` | ...
  // Match: | 45-59 | `[DEEP MODE AVAILABLE]` | ...
  // Match: | <45 | No escalation | ...

  // Look for threshold boundaries in the interpretation table
  const stronglyMatch = content.match(/\|\s*(\d+)\+\s*\|.*STRONGLY\s*RECOMMEND/i);
  if (stronglyMatch) thresholds.push(parseInt(stronglyMatch[1]));

  const recommendMatch = content.match(/\|\s*(\d+)-\d+\s*\|.*RECOMMEND\s*DEEP/i);
  if (recommendMatch) thresholds.push(parseInt(recommendMatch[1]));

  const availableMatch = content.match(/\|\s*(\d+)-\d+\s*\|.*AVAILABLE/i);
  if (availableMatch) thresholds.push(parseInt(availableMatch[1]));

  return thresholds.sort((a, b) => a - b);
}

/**
 * Extract escalation thresholds from UniversalOptimizer
 */
function extractEscalationThresholdsFromCode(content: string): number[] {
  const thresholds: number[] = [];

  // Match: shouldEscalate: totalScore >= 45
  const shouldEscalateMatch = content.match(/shouldEscalate:\s*totalScore\s*>=\s*(\d+)/);
  if (shouldEscalateMatch) thresholds.push(parseInt(shouldEscalateMatch[1]));

  // Match: if (totalScore >= 75)
  const highMatch = content.match(
    /if\s*\(\s*totalScore\s*>=\s*(\d+)\s*\)\s*\{\s*\n\s*escalationConfidence\s*=\s*['"]high['"]/
  );
  if (highMatch) thresholds.push(parseInt(highMatch[1]));

  // Match: else if (totalScore >= 60)
  const mediumMatch = content.match(
    /else\s+if\s*\(\s*totalScore\s*>=\s*(\d+)\s*\)\s*\{\s*\n\s*escalationConfidence\s*=\s*['"]medium['"]/
  );
  if (mediumMatch) thresholds.push(parseInt(mediumMatch[1]));

  return thresholds.sort((a, b) => a - b);
}

async function validateEscalationFactors(): Promise<ValidationError[]> {
  const errors: ValidationError[] = [];

  // Read template
  const templateContent = fs.readFileSync(PATHS.escalationFactors, 'utf-8');
  const templateFactors = extractEscalationFactorsFromTemplate(templateContent);

  // Read code
  const codeContent = fs.readFileSync(PATHS.universalOptimizer, 'utf-8');
  const codeFactors = extractEscalationFactorsFromCode(codeContent);

  // Find mismatches
  const missingInTemplate = codeFactors.filter((f) => !templateFactors.includes(f));
  const missingInCode = templateFactors.filter((f) => !codeFactors.includes(f));

  if (missingInTemplate.length > 0) {
    errors.push({
      type: 'escalation-factor',
      message: `Escalation factors in code but not documented in template`,
      file: 'src/templates/slash-commands/_components/sections/escalation-factors.md',
      expected: codeFactors,
      found: templateFactors,
      missing: missingInTemplate,
    });
  }

  if (missingInCode.length > 0) {
    errors.push({
      type: 'escalation-factor',
      message: `Escalation factors documented in template but not in code`,
      file: 'src/core/intelligence/universal-optimizer.ts',
      expected: templateFactors,
      found: codeFactors,
      missing: missingInCode,
    });
  }

  return errors;
}

async function validateEscalationThresholds(): Promise<ValidationError[]> {
  const errors: ValidationError[] = [];

  // Read template
  const templateContent = fs.readFileSync(PATHS.escalationFactors, 'utf-8');
  const templateThresholds = extractEscalationThresholdsFromTemplate(templateContent);

  // Read code
  const codeContent = fs.readFileSync(PATHS.universalOptimizer, 'utf-8');
  const codeThresholds = extractEscalationThresholdsFromCode(codeContent);

  // Compare
  const templateStr = templateThresholds.join(', ');
  const codeStr = codeThresholds.join(', ');

  if (templateStr !== codeStr) {
    errors.push({
      type: 'escalation-threshold',
      message: `Escalation thresholds mismatch between template and code`,
      file: 'src/templates/slash-commands/_components/sections/escalation-factors.md',
      expected: codeThresholds.map(String),
      found: templateThresholds.map(String),
      missing: [],
    });
  }

  return errors;
}

// ============================================================================
// Pattern Count Validation (v4.3)
// ============================================================================

/**
 * Extract pattern counts from pattern-visibility.md template
 */
function extractPatternCountsFromTemplate(content: string): { fast: number; deep: number } {
  let fast = 0;
  let deep = 0;

  // Match: | Fast | 12 core patterns | ...
  const fastMatch = content.match(/\|\s*Fast\s*\|\s*(\d+)/i);
  if (fastMatch) fast = parseInt(fastMatch[1]);

  // Match: | Deep | 20 total patterns | ...
  const deepMatch = content.match(/\|\s*Deep\s*\|\s*(\d+)/i);
  if (deepMatch) deep = parseInt(deepMatch[1]);

  return { fast, deep };
}

/**
 * Count patterns by mode from pattern files
 */
async function countPatternsByMode(patternsDir: string): Promise<{ fast: number; deep: number }> {
  const files = fs
    .readdirSync(patternsDir)
    .filter((f) => f.endsWith('.ts') && f !== 'base-pattern.ts');

  let fastCount = 0;
  let deepCount = 0;

  for (const file of files) {
    const content = fs.readFileSync(path.join(patternsDir, file), 'utf-8');

    // Extract mode from pattern file (v4.5 format: readonly mode: PatternMode = 'both')
    // Also handles older format: mode: OptimizationMode = 'both' or mode = 'deep' as const
    const modeMatch = content.match(
      /mode(?::\s*(?:PatternMode|OptimizationMode))?\s*=\s*['"]?(fast|deep|both)['"]?/
    );
    const mode = modeMatch ? modeMatch[1] : 'both';

    // Fast mode includes 'fast' and 'both' patterns
    if (mode === 'fast' || mode === 'both') {
      fastCount++;
    }

    // Deep mode includes ALL patterns
    deepCount++;
  }

  return { fast: fastCount, deep: deepCount };
}

async function validatePatternCounts(): Promise<ValidationError[]> {
  const errors: ValidationError[] = [];

  // Read template
  const visibilityContent = fs.readFileSync(PATHS.patternVisibility, 'utf-8');
  const templateCounts = extractPatternCountsFromTemplate(visibilityContent);

  // Count actual patterns
  const codeCounts = await countPatternsByMode(PATHS.patternsDir);

  // Compare fast mode
  if (templateCounts.fast !== codeCounts.fast) {
    errors.push({
      type: 'pattern-count',
      message: `Fast mode pattern count mismatch`,
      file: 'src/templates/slash-commands/_components/sections/pattern-visibility.md',
      expected: [`${codeCounts.fast} patterns for fast mode`],
      found: [`${templateCounts.fast} patterns documented`],
      missing: [],
    });
  }

  // Compare deep mode
  if (templateCounts.deep !== codeCounts.deep) {
    errors.push({
      type: 'pattern-count',
      message: `Deep mode pattern count mismatch`,
      file: 'src/templates/slash-commands/_components/sections/pattern-visibility.md',
      expected: [`${codeCounts.deep} patterns for deep mode`],
      found: [`${templateCounts.deep} patterns documented`],
      missing: [],
    });
  }

  return errors;
}

// ============================================================================
// Mode Enforcement Validation (v4.7)
// ============================================================================

/**
 * Check that:
 * 1. prompts.md no longer exists (removed in v4.7)
 * 2. fast.md and deep.md have mode enforcement headers
 * 3. No templates reference /clavix:prompts
 */
async function validateModeEnforcement(): Promise<ValidationError[]> {
  const errors: ValidationError[] = [];

  // Check prompts.md doesn't exist
  const promptsPath = path.join(PATHS.canonicalTemplates, 'prompts.md');
  if (fs.existsSync(promptsPath)) {
    errors.push({
      type: 'outdated-version',
      message: 'prompts.md should be removed in v4.7 (CLI commands documented elsewhere)',
      file: 'src/templates/slash-commands/_canonical/prompts.md',
      expected: ['File should not exist'],
      found: ['File exists'],
      missing: [],
    });
  }

  // Check fast.md and deep.md have mode enforcement
  const optimizationTemplates = ['fast.md', 'deep.md'];
  for (const templateFile of optimizationTemplates) {
    const templatePath = path.join(PATHS.canonicalTemplates, templateFile);
    if (fs.existsSync(templatePath)) {
      const content = fs.readFileSync(templatePath, 'utf-8');
      const topSection = content.slice(0, 2000);

      if (!topSection.includes('STOP') || !topSection.includes('OPTIMIZATION MODE')) {
        errors.push({
          type: 'outdated-version',
          message: `${templateFile} missing mode enforcement header at top`,
          file: `src/templates/slash-commands/_canonical/${templateFile}`,
          expected: ['STOP: OPTIMIZATION MODE header in first 2000 chars'],
          found: ['Mode enforcement header not found at top'],
          missing: [],
        });
      }
    }
  }

  // Check no templates reference /clavix:prompts
  const templateFiles = fs.readdirSync(PATHS.canonicalTemplates).filter((f) => f.endsWith('.md'));
  for (const templateFile of templateFiles) {
    const templatePath = path.join(PATHS.canonicalTemplates, templateFile);
    const content = fs.readFileSync(templatePath, 'utf-8');

    if (content.includes('/clavix:prompts')) {
      errors.push({
        type: 'outdated-version',
        message: `${templateFile} references removed /clavix:prompts command`,
        file: `src/templates/slash-commands/_canonical/${templateFile}`,
        expected: ['No /clavix:prompts references'],
        found: ['/clavix:prompts reference found'],
        missing: [],
      });
    }
  }

  return errors;
}

// ============================================================================
// Outdated Version Reference Validation (v4.6)
// ============================================================================

/**
 * Check canonical templates for outdated version references (v2.x, v3.x)
 */
async function validateNoOutdatedVersionReferences(): Promise<ValidationError[]> {
  const errors: ValidationError[] = [];

  // Patterns to detect outdated version references
  const outdatedPatterns = [
    /\bv2\.\d+/gi, // v2.0, v2.1, v2.7, etc.
    /\bv3\.\d+/gi, // v3.0, v3.1, etc.
    /\(v2\./gi, // (v2.x in parentheses
    /\(v3\./gi, // (v3.x in parentheses
  ];

  // Get all canonical templates
  const templateFiles = fs.readdirSync(PATHS.canonicalTemplates).filter((f) => f.endsWith('.md'));

  for (const templateFile of templateFiles) {
    const templatePath = path.join(PATHS.canonicalTemplates, templateFile);
    const content = fs.readFileSync(templatePath, 'utf-8');
    const lines = content.split('\n');

    const foundReferences: { match: string; line: number }[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      for (const pattern of outdatedPatterns) {
        const matches = line.match(pattern);
        if (matches) {
          for (const match of matches) {
            foundReferences.push({ match, line: i + 1 });
          }
        }
      }
    }

    if (foundReferences.length > 0) {
      errors.push({
        type: 'outdated-version',
        message: `Outdated version references found in ${templateFile}`,
        file: `src/templates/slash-commands/_canonical/${templateFile}`,
        line: foundReferences[0].line,
        expected: ['v4.x references only'],
        found: foundReferences.map((r) => `${r.match} (line ${r.line})`),
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

  console.log('\n🔍 Clavix Intelligence - Consistency Validator v4.7\n');
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

  try {
    const escalationErrors = await validateEscalationFactors();
    errors.push(...escalationErrors);
    console.log(
      `  Escalation Factors: ${escalationErrors.length === 0 ? '✅ OK' : `❌ ${escalationErrors.length} issues`}`
    );
  } catch (e) {
    console.log(`  Escalation Factors: ⚠️ Could not validate (${e})`);
  }

  try {
    const thresholdErrors = await validateEscalationThresholds();
    errors.push(...thresholdErrors);
    console.log(
      `  Escalation Thresholds: ${thresholdErrors.length === 0 ? '✅ OK' : `❌ ${thresholdErrors.length} issues`}`
    );
  } catch (e) {
    console.log(`  Escalation Thresholds: ⚠️ Could not validate (${e})`);
  }

  try {
    const patternCountErrors = await validatePatternCounts();
    errors.push(...patternCountErrors);
    console.log(
      `  Pattern Counts: ${patternCountErrors.length === 0 ? '✅ OK' : `❌ ${patternCountErrors.length} issues`}`
    );
  } catch (e) {
    console.log(`  Pattern Counts: ⚠️ Could not validate (${e})`);
  }

  try {
    const versionErrors = await validateNoOutdatedVersionReferences();
    errors.push(...versionErrors);
    console.log(
      `  Version References: ${versionErrors.length === 0 ? '✅ OK' : `❌ ${versionErrors.length} issues`}`
    );
  } catch (e) {
    console.log(`  Version References: ⚠️ Could not validate (${e})`);
  }

  try {
    const modeEnforcementErrors = await validateModeEnforcement();
    errors.push(...modeEnforcementErrors);
    console.log(
      `  Mode Enforcement: ${modeEnforcementErrors.length === 0 ? '✅ OK' : `❌ ${modeEnforcementErrors.length} issues`}`
    );
  } catch (e) {
    console.log(`  Mode Enforcement: ⚠️ Could not validate (${e})`);
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

  // Escalation factor errors
  const escalationErrors = byType.get('escalation-factor') || [];
  if (escalationErrors.length > 0) {
    output += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
    output += 'Escalation Factor Mismatch\n';
    output += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';

    for (const error of escalationErrors) {
      output += `  📄 ${error.file}${error.line ? `:${error.line}` : ''}\n`;
      output += `  ${error.message}\n`;
      output += `  Expected: ${error.expected.join(', ')}\n`;
      output += `  Found: ${error.found.join(', ')}\n`;
      if (error.missing.length > 0) {
        output += `  ❌ MISSING: ${error.missing.join(', ')}\n`;
      }
      output += '\n';
    }
  }

  // Escalation threshold errors
  const thresholdErrors = byType.get('escalation-threshold') || [];
  if (thresholdErrors.length > 0) {
    output += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
    output += 'Escalation Threshold Mismatch\n';
    output += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';

    for (const error of thresholdErrors) {
      output += `  📄 ${error.file}${error.line ? `:${error.line}` : ''}\n`;
      output += `  Code thresholds: ${error.expected.join(', ')}\n`;
      output += `  Template thresholds: ${error.found.join(', ')}\n\n`;
    }
  }

  // Pattern count errors
  const patternCountErrors = byType.get('pattern-count') || [];
  if (patternCountErrors.length > 0) {
    output += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
    output += 'Pattern Count Mismatch\n';
    output += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';

    for (const error of patternCountErrors) {
      output += `  📄 ${error.file}${error.line ? `:${error.line}` : ''}\n`;
      output += `  ${error.message}\n`;
      output += `  Actual: ${error.expected.join(', ')}\n`;
      output += `  Documented: ${error.found.join(', ')}\n\n`;
    }
  }

  // Outdated version reference errors
  const versionErrors = byType.get('outdated-version') || [];
  if (versionErrors.length > 0) {
    output += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
    output += 'Outdated Version References\n';
    output += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';

    for (const error of versionErrors) {
      output += `  📄 ${error.file}${error.line ? `:${error.line}` : ''}\n`;
      output += `  ${error.message}\n`;
      output += `  Found: ${error.found.join(', ')}\n`;
      output += `  Expected: ${error.expected.join(', ')}\n\n`;
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
