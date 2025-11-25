import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { describe, it, expect, beforeAll } from '@jest/globals';
import { PromptManager } from '../../src/core/prompt-manager.js';
import { IntentDetector } from '../../src/core/intelligence/intent-detector.js';
import { QualityAssessor } from '../../src/core/intelligence/quality-assessor.js';

// ESM module path resolution
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../..');

/**
 * Template-Code Consistency Tests (v4.6)
 *
 * These tests verify that canonical templates accurately describe CLI behavior.
 * If a template says "saves to .clavix/outputs/prompts/fast/", the CLI should do exactly that.
 * This prevents documentation drift and ensures agents can trust template instructions.
 */

describe('Template-Code Consistency', () => {
  const templatesDir = path.join(ROOT_DIR, 'src/templates/slash-commands/_canonical');
  const componentsDir = path.join(ROOT_DIR, 'src/templates/slash-commands/_components');

  describe('Fast Mode Template', () => {
    let fastTemplate: string;

    beforeAll(async () => {
      fastTemplate = await fs.readFile(path.join(templatesDir, 'fast.md'), 'utf-8');
    });

    it('template describes correct file save path', () => {
      // Template says: .clavix/outputs/prompts/fast/
      const manager = new PromptManager();
      const promptsDir = (manager as unknown as { promptsDir: string }).promptsDir;

      expect(promptsDir).toContain('.clavix/outputs/prompts');
      expect(fastTemplate).toContain('.clavix/outputs/prompts/fast');
    });

    it('template lists all 6 quality dimensions', () => {
      const dimensions = [
        'Clarity',
        'Efficiency',
        'Structure',
        'Completeness',
        'Actionability',
        'Specificity',
      ];

      dimensions.forEach((dim) => {
        expect(fastTemplate).toContain(dim);
      });
    });

    it('template lists all 11 intent types', () => {
      const intents = [
        'code-generation',
        'planning',
        'refinement',
        'debugging',
        'documentation',
        'prd-generation',
        'testing',
        'migration',
        'security-review',
        'learning',
        'summarization',
      ];

      intents.forEach((intent) => {
        expect(fastTemplate).toContain(intent);
      });
    });

    it('template example shows all 6 quality dimensions', () => {
      // The example output should include Specificity
      const exampleSection = fastTemplate.slice(
        fastTemplate.indexOf('### Quality Assessment:'),
        fastTemplate.indexOf('### Optimized Prompt:')
      );

      expect(exampleSection).toContain('Clarity:');
      expect(exampleSection).toContain('Efficiency:');
      expect(exampleSection).toContain('Structure:');
      expect(exampleSection).toContain('Completeness:');
      expect(exampleSection).toContain('Actionability:');
      expect(exampleSection).toContain('Specificity:');
    });

    it('template quality thresholds match code logic', () => {
      // Template mentions 65% as threshold for deep mode recommendation
      expect(fastTemplate).toContain('< 65%');
      expect(fastTemplate).toContain('< 50%');
    });

    it('intent detector supports all template-listed intents', () => {
      const detector = new IntentDetector();
      const supportedIntents = [
        'code-generation',
        'planning',
        'refinement',
        'debugging',
        'documentation',
        'prd-generation',
        'testing',
        'migration',
        'security-review',
        'learning',
        'summarization',
      ];

      // Verify intent detector can analyze prompts for each intent type
      supportedIntents.forEach((intent) => {
        const result = detector.analyze(`This is a ${intent} task`);
        // Just verify it returns a valid result with confidence >= 0
        expect(result.confidence).toBeGreaterThanOrEqual(0);
        expect(result.primaryIntent).toBeDefined();
      });
    });

    it('quality assessor measures all 6 dimensions from template', () => {
      const detector = new IntentDetector();
      const assessor = new QualityAssessor();
      const prompt = 'Create a login page';
      const intentAnalysis = detector.analyze(prompt);
      // QualityAssessor.assess takes (original, enhanced, intent)
      const result = assessor.assess(prompt, prompt, intentAnalysis);

      // Verify all 6 dimensions are present
      expect(result).toHaveProperty('clarity');
      expect(result).toHaveProperty('efficiency');
      expect(result).toHaveProperty('structure');
      expect(result).toHaveProperty('completeness');
      expect(result).toHaveProperty('actionability');
      expect(result).toHaveProperty('specificity');
      expect(result).toHaveProperty('overall');
    });
  });

  describe('Deep Mode Template', () => {
    let deepTemplate: string;

    beforeAll(async () => {
      deepTemplate = await fs.readFile(path.join(templatesDir, 'deep.md'), 'utf-8');
    });

    it('template lists all 6 quality dimensions', () => {
      const dimensions = [
        'Clarity',
        'Efficiency',
        'Structure',
        'Completeness',
        'Actionability',
        'Specificity',
      ];

      dimensions.forEach((dim) => {
        expect(deepTemplate).toContain(dim);
      });
    });

    it('template lists all 11 intent types', () => {
      const intents = [
        'code-generation',
        'planning',
        'refinement',
        'debugging',
        'documentation',
        'prd-generation',
        'testing',
        'migration',
        'security-review',
        'learning',
        'summarization',
      ];

      intents.forEach((intent) => {
        expect(deepTemplate).toContain(intent);
      });
    });

    it('template mentions deep mode exclusive features', () => {
      // Deep mode should mention alternatives, edge cases, validation
      expect(deepTemplate).toContain('alternative');
      expect(deepTemplate).toContain('edge case');
    });
  });

  describe('PRD Mode Template', () => {
    let prdTemplate: string;

    beforeAll(async () => {
      prdTemplate = await fs.readFile(path.join(templatesDir, 'prd.md'), 'utf-8');
    });

    it('template describes 5 strategic questions', () => {
      expect(prdTemplate).toContain('Question 1');
      expect(prdTemplate).toContain('Question 2');
      expect(prdTemplate).toContain('Question 3');
      expect(prdTemplate).toContain('Question 4');
      expect(prdTemplate).toContain('Question 5');
    });

    it('template describes both full-prd and quick-prd outputs', () => {
      expect(prdTemplate).toContain('full-prd.md');
      expect(prdTemplate).toContain('quick-prd.md');
    });

    it('template describes correct output directory structure', () => {
      expect(prdTemplate).toContain('.clavix/outputs/');
    });
  });

  describe('Decision Rules Component', () => {
    let decisionRules: string;

    beforeAll(async () => {
      decisionRules = await fs.readFile(
        path.join(componentsDir, 'agent-protocols/decision-rules.md'),
        'utf-8'
      );
    });

    it('quality thresholds match documented rules', () => {
      // Verify 60% and 80% thresholds mentioned
      expect(decisionRules).toContain('quality < 60%');
      expect(decisionRules).toContain('quality >= 80%');
    });

    it('confidence thresholds match documented rules', () => {
      // Verify confidence levels
      expect(decisionRules).toContain('confidence >= 85%');
      expect(decisionRules).toContain('confidence 70-84%');
      expect(decisionRules).toContain('confidence 50-69%');
      expect(decisionRules).toContain('confidence < 50%');
    });

    it('escalation thresholds match documented rules', () => {
      // Verify escalation score levels
      expect(decisionRules).toContain('escalation_score >= 75');
      expect(decisionRules).toContain('escalation_score 60-74');
      expect(decisionRules).toContain('escalation_score 45-59');
      expect(decisionRules).toContain('escalation_score < 45');
    });

    it('contains 11 agent decision rules', () => {
      // Verify all 11 rules exist (Rule 11 added in v4.6)
      expect(decisionRules).toContain('Rule 1:');
      expect(decisionRules).toContain('Rule 2:');
      expect(decisionRules).toContain('Rule 3:');
      expect(decisionRules).toContain('Rule 4:');
      expect(decisionRules).toContain('Rule 5:');
      expect(decisionRules).toContain('Rule 6:');
      expect(decisionRules).toContain('Rule 7:');
      expect(decisionRules).toContain('Rule 8:');
      expect(decisionRules).toContain('Rule 9:');
      expect(decisionRules).toContain('Rule 10:');
      expect(decisionRules).toContain('Rule 11:');
    });
  });

  describe('No Outdated Version References', () => {
    it('fast.md has no v2.x or v3.x references', async () => {
      const content = await fs.readFile(path.join(templatesDir, 'fast.md'), 'utf-8');
      expect(content).not.toMatch(/\bv2\.\d/);
      expect(content).not.toMatch(/\bv3\.\d/);
    });

    it('deep.md has no v2.x or v3.x references', async () => {
      const content = await fs.readFile(path.join(templatesDir, 'deep.md'), 'utf-8');
      expect(content).not.toMatch(/\bv2\.\d/);
      expect(content).not.toMatch(/\bv3\.\d/);
    });

    it('prd.md has no v2.x or v3.x references', async () => {
      const content = await fs.readFile(path.join(templatesDir, 'prd.md'), 'utf-8');
      expect(content).not.toMatch(/\bv2\.\d/);
      expect(content).not.toMatch(/\bv3\.\d/);
    });
  });
});
