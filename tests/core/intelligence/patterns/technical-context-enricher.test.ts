import { describe, it, expect, beforeEach } from '@jest/globals';
import { TechnicalContextEnricher } from '../../../../src/core/intelligence/patterns/technical-context-enricher.js';
import { PatternContext } from '../../../../src/core/intelligence/types.js';

describe('TechnicalContextEnricher', () => {
  let enricher: TechnicalContextEnricher;
  let mockContext: PatternContext;

  beforeEach(() => {
    enricher = new TechnicalContextEnricher();
    mockContext = {
      mode: 'fast',
      originalPrompt: 'Test prompt',
      intent: {
        primaryIntent: 'code-generation',
        confidence: 90,
        characteristics: {
          hasCodeContext: false,
          hasTechnicalTerms: true,
          isOpenEnded: false,
          needsStructure: false,
        },
      },
    };
  });

  describe('pattern properties', () => {
    it('should have correct id', () => {
      expect(enricher.id).toBe('technical-context-enricher');
    });

    it('should have correct name', () => {
      expect(enricher.name).toBe('Technical Context Enricher');
    });

    it('should have correct description', () => {
      expect(enricher.description).toBe(
        'Adds missing technical context (language, framework, versions)'
      );
    });

    it('should support both fast and deep modes', () => {
      expect(enricher.mode).toBe('both');
    });

    it('should have priority 8', () => {
      expect(enricher.priority).toBe(8);
    });

    it('should be applicable for code-generation, refinement, debugging', () => {
      expect(enricher.applicableIntents).toContain('code-generation');
      expect(enricher.applicableIntents).toContain('refinement');
      expect(enricher.applicableIntents).toContain('debugging');
    });

    it('should not be applicable for documentation', () => {
      expect(enricher.applicableIntents).not.toContain('documentation');
    });

    it('should not be applicable for planning', () => {
      expect(enricher.applicableIntents).not.toContain('planning');
    });
  });

  describe('isApplicable', () => {
    it('should return true for code-generation intent', () => {
      mockContext.intent.primaryIntent = 'code-generation';
      expect(enricher.isApplicable(mockContext)).toBe(true);
    });

    it('should return true for refinement intent', () => {
      mockContext.intent.primaryIntent = 'refinement';
      expect(enricher.isApplicable(mockContext)).toBe(true);
    });

    it('should return true for debugging intent', () => {
      mockContext.intent.primaryIntent = 'debugging';
      expect(enricher.isApplicable(mockContext)).toBe(true);
    });

    it('should return false for documentation intent', () => {
      mockContext.intent.primaryIntent = 'documentation';
      expect(enricher.isApplicable(mockContext)).toBe(false);
    });

    it('should return false for planning intent', () => {
      mockContext.intent.primaryIntent = 'planning';
      expect(enricher.isApplicable(mockContext)).toBe(false);
    });
  });

  describe('apply - existing technical context detection', () => {
    it('should not modify prompt with explicit technical context', () => {
      const prompt = 'Technical context: Using React and TypeScript v5.0';
      const result = enricher.apply(prompt, mockContext);
      expect(result.applied).toBe(false);
    });

    it('should not modify prompt with technical constraints section', () => {
      const prompt = 'Technical constraints: React 18.2, Node v20';
      const result = enricher.apply(prompt, mockContext);
      expect(result.applied).toBe(false);
    });

    it('should not modify prompt with "technical context"', () => {
      const prompt = 'Technical context: React with TypeScript';
      const result = enricher.apply(prompt, mockContext);
      expect(result.applied).toBe(false);
    });

    it('should not modify prompt with "technical constraints"', () => {
      const prompt = 'Technical constraints: Must use PostgreSQL';
      const result = enricher.apply(prompt, mockContext);
      expect(result.applied).toBe(false);
    });

    it('should not modify prompt with "technical requirements"', () => {
      const prompt = 'Technical requirements: Python 3.11';
      const result = enricher.apply(prompt, mockContext);
      expect(result.applied).toBe(false);
    });
  });

  describe('apply - language detection', () => {
    it('should detect Python', () => {
      const prompt = 'Build a function in python';
      const result = enricher.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
      expect(result.enhancedPrompt).toContain('Python');
    });

    it('should detect JavaScript', () => {
      const prompt = 'Write javascript code';
      const result = enricher.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
      expect(result.enhancedPrompt).toContain('JavaScript');
    });

    it('should detect TypeScript', () => {
      const prompt = 'Build with typescript';
      const result = enricher.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
      expect(result.enhancedPrompt).toContain('TypeScript');
    });

    it('should detect Java', () => {
      const prompt = 'Create a java class';
      const result = enricher.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
      expect(result.enhancedPrompt).toContain('Java');
    });

    it('should detect Rust', () => {
      const prompt = 'Write rust code';
      const result = enricher.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
      expect(result.enhancedPrompt).toContain('Rust');
    });

    it('should detect Go', () => {
      const prompt = 'Build a go application';
      const result = enricher.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
      expect(result.enhancedPrompt).toContain('Go');
    });

    it('should detect PHP', () => {
      const prompt = 'Write php code';
      const result = enricher.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
      expect(result.enhancedPrompt).toContain('PHP');
    });

    it('should detect Ruby', () => {
      const prompt = 'Create a ruby script';
      const result = enricher.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
      expect(result.enhancedPrompt).toContain('Ruby');
    });

    it('should detect Swift', () => {
      const prompt = 'Build a swift app';
      const result = enricher.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
      expect(result.enhancedPrompt).toContain('Swift');
    });

    it('should detect Kotlin', () => {
      const prompt = 'Write kotlin code';
      const result = enricher.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
      expect(result.enhancedPrompt).toContain('Kotlin');
    });

    it('should detect C++', () => {
      const prompt = 'Build a c++ application';
      const result = enricher.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
      expect(result.enhancedPrompt).toContain('C++');
    });

    it('should detect C#', () => {
      const prompt = 'Write c# code';
      const result = enricher.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
      expect(result.enhancedPrompt).toContain('C#');
    });
  });

  describe('apply - framework detection', () => {
    it('should detect React', () => {
      const prompt = 'Build a react component';
      mockContext.intent.primaryIntent = 'code-generation';
      const result = enricher.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
      expect(result.enhancedPrompt).toContain('React');
    });

    it('should detect Vue.js', () => {
      const prompt = 'Create a vue component';
      mockContext.intent.primaryIntent = 'code-generation';
      const result = enricher.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
      expect(result.enhancedPrompt).toContain('Vue.js');
    });

    it('should detect Angular', () => {
      const prompt = 'Build an angular component';
      mockContext.intent.primaryIntent = 'code-generation';
      const result = enricher.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
      expect(result.enhancedPrompt).toContain('Angular');
    });

    it('should detect Svelte', () => {
      const prompt = 'Create a svelte component';
      mockContext.intent.primaryIntent = 'code-generation';
      const result = enricher.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
      expect(result.enhancedPrompt).toContain('Svelte');
    });

    it('should detect Next.js', () => {
      const prompt = 'Build a next page';
      mockContext.intent.primaryIntent = 'code-generation';
      const result = enricher.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
      expect(result.enhancedPrompt).toContain('Next.js');
    });

    it('should detect Nuxt.js', () => {
      const prompt = 'Create a nuxt page';
      mockContext.intent.primaryIntent = 'code-generation';
      const result = enricher.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
      expect(result.enhancedPrompt).toContain('Nuxt.js');
    });

    it('should detect Django', () => {
      const prompt = 'Build a django view';
      mockContext.intent.primaryIntent = 'code-generation';
      const result = enricher.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
      expect(result.enhancedPrompt).toContain('Django');
    });

    it('should detect Flask', () => {
      const prompt = 'Create a flask route';
      mockContext.intent.primaryIntent = 'code-generation';
      const result = enricher.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
      expect(result.enhancedPrompt).toContain('Flask');
    });

    it('should detect FastAPI', () => {
      const prompt = 'Build a fastapi endpoint';
      mockContext.intent.primaryIntent = 'code-generation';
      const result = enricher.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
      expect(result.enhancedPrompt).toContain('FastAPI');
    });

    it('should detect Express.js', () => {
      const prompt = 'Create an express route';
      mockContext.intent.primaryIntent = 'code-generation';
      const result = enricher.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
      expect(result.enhancedPrompt).toContain('Express.js');
    });

    it('should detect NestJS', () => {
      const prompt = 'Build a nestjs controller';
      mockContext.intent.primaryIntent = 'code-generation';
      const result = enricher.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
      expect(result.enhancedPrompt).toContain('NestJS');
    });

    it('should detect Spring Boot', () => {
      const prompt = 'Create a spring service';
      mockContext.intent.primaryIntent = 'code-generation';
      const result = enricher.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
      expect(result.enhancedPrompt).toContain('Spring Boot');
    });

    it('should detect Ruby on Rails', () => {
      const prompt = 'Build a rails controller';
      mockContext.intent.primaryIntent = 'code-generation';
      const result = enricher.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
      expect(result.enhancedPrompt).toContain('Ruby on Rails');
    });

    it('should detect Laravel', () => {
      const prompt = 'Create a laravel controller';
      mockContext.intent.primaryIntent = 'code-generation';
      const result = enricher.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
      expect(result.enhancedPrompt).toContain('Laravel');
    });
  });

  describe('apply - language inference from framework', () => {
    it('should detect language when React mentioned', () => {
      const prompt = 'Build a react component';
      const result = enricher.apply(prompt, mockContext);
      // React can infer JavaScript/TypeScript
      expect(result.enhancedPrompt).toContain('Language');
    });

    it('should detect language when Vue mentioned', () => {
      const prompt = 'Create a vue component';
      const result = enricher.apply(prompt, mockContext);
      expect(result.enhancedPrompt).toContain('Language');
    });

    it('should detect language when Angular mentioned', () => {
      const prompt = 'Build an angular component';
      const result = enricher.apply(prompt, mockContext);
      expect(result.enhancedPrompt).toContain('Language');
    });

    it('should detect framework when Django mentioned', () => {
      const prompt = 'Build a django view';
      const result = enricher.apply(prompt, mockContext);
      expect(result.enhancedPrompt).toContain('Django');
    });

    it('should detect framework when Flask mentioned', () => {
      const prompt = 'Create a flask route';
      const result = enricher.apply(prompt, mockContext);
      expect(result.enhancedPrompt).toContain('Flask');
    });

    it('should detect framework when Spring mentioned', () => {
      const prompt = 'Build a spring service';
      const result = enricher.apply(prompt, mockContext);
      expect(result.enhancedPrompt).toContain('Spring');
    });

    it('should detect language when Python explicitly mentioned', () => {
      const prompt = 'Build a python django view';
      const result = enricher.apply(prompt, mockContext);
      expect(result.enhancedPrompt).toContain('Python');
    });
  });

  describe('apply - version suggestion', () => {
    it('should suggest specifying version when language detected', () => {
      const prompt = 'Build with python';
      const result = enricher.apply(prompt, mockContext);
      expect(result.enhancedPrompt).toContain('specify version');
    });

    it('should not suggest version if already present', () => {
      const prompt = 'Build with python 3.11';
      const result = enricher.apply(prompt, mockContext);
      expect(result.applied).toBe(false);
    });
  });

  describe('apply - no enhancements needed', () => {
    it('should return applied: false when no language detected', () => {
      const prompt = 'Build a generic application';
      const result = enricher.apply(prompt, mockContext);
      expect(result.applied).toBe(false);
    });

    it('should return applied: false when technical context present', () => {
      const prompt = 'Technical context: Using React 18';
      const result = enricher.apply(prompt, mockContext);
      expect(result.applied).toBe(false);
    });

    it('should have low impact when no enhancements', () => {
      const prompt = 'Build something';
      const result = enricher.apply(prompt, mockContext);
      expect(result.improvement.impact).toBe('low');
    });
  });

  describe('apply - result structure', () => {
    it('should return valid PatternResult structure', () => {
      const result = enricher.apply('Build a react component', mockContext);

      expect(result).toHaveProperty('enhancedPrompt');
      expect(result).toHaveProperty('improvement');
      expect(result).toHaveProperty('applied');
      expect(result.improvement).toHaveProperty('dimension');
      expect(result.improvement).toHaveProperty('description');
      expect(result.improvement).toHaveProperty('impact');
    });

    it('should have completeness as improvement dimension', () => {
      const result = enricher.apply('Build a react component', mockContext);
      expect(result.improvement.dimension).toBe('completeness');
    });

    it('should have medium impact when enhancements added', () => {
      const prompt = 'Build a react component';
      const result = enricher.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.improvement.impact).toBe('medium');
      }
    });
  });

  describe('apply - technical constraints section format', () => {
    it('should add Technical Constraints header', () => {
      const prompt = 'Build a react component';
      const result = enricher.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toContain('# Technical Constraints');
      }
    });

    it('should format enhancements as bullet points', () => {
      const prompt = 'Build a react component';
      const result = enricher.apply(prompt, mockContext);
      if (result.applied) {
        expect(result.enhancedPrompt).toContain('- ');
      }
    });

    it('should preserve original prompt before constraints', () => {
      const prompt = 'Build a react component';
      const result = enricher.apply(prompt, mockContext);
      expect(result.enhancedPrompt.startsWith(prompt)).toBe(true);
    });
  });

  describe('apply - edge cases', () => {
    it('should handle empty string', () => {
      const result = enricher.apply('', mockContext);
      expect(result.applied).toBe(false);
    });

    it('should handle very short prompts', () => {
      const result = enricher.apply('Hi', mockContext);
      expect(result.applied).toBe(false);
    });

    it('should handle very long prompts', () => {
      const longPrompt = 'Build a react component '.repeat(200);
      const result = enricher.apply(longPrompt, mockContext);
      expect(result).toBeDefined();
    });

    it('should handle case insensitivity', () => {
      const prompt = 'Build a REACT component';
      const result = enricher.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
    });

    it('should handle multiple language/framework mentions', () => {
      const prompt = 'Build a react component with typescript';
      const result = enricher.apply(prompt, mockContext);
      expect(result).toBeDefined();
    });
  });

  describe('apply - framework only for code-generation', () => {
    it('should detect framework for code-generation intent', () => {
      mockContext.intent.primaryIntent = 'code-generation';
      const prompt = 'Build a react component';
      const result = enricher.apply(prompt, mockContext);
      expect(result.enhancedPrompt).toContain('Framework');
    });

    it('should still detect language for debugging intent', () => {
      mockContext.intent.primaryIntent = 'debugging';
      const prompt = 'Fix this python error';
      const result = enricher.apply(prompt, mockContext);
      expect(result.enhancedPrompt).toContain('Language');
    });

    it('should still detect language for refinement intent', () => {
      mockContext.intent.primaryIntent = 'refinement';
      const prompt = 'Optimize this javascript code';
      const result = enricher.apply(prompt, mockContext);
      expect(result.enhancedPrompt).toContain('Language');
    });
  });
});
