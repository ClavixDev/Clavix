import {
  BasePattern,
  PatternMode,
  PatternPriority,
  PatternPhase,
  PatternConfigSchema,
  PatternDependency,
} from './base-pattern.js';
import { PatternContext, PatternResult, PromptIntent } from '../types.js';

/**
 * v4.5 Pattern: Technical Context Enricher
 *
 * Adds missing technical context (language, framework, versions).
 * Detects technologies and suggests version specifications.
 */
export class TechnicalContextEnricher extends BasePattern {
  // -------------------------------------------------------------------------
  // Pattern Metadata (v4.5 unified types)
  // -------------------------------------------------------------------------

  readonly id = 'technical-context-enricher';
  readonly name = 'Technical Context Enricher';
  readonly description = 'Adds missing technical context (language, framework, versions)';

  readonly applicableIntents: PromptIntent[] = ['code-generation', 'refinement', 'debugging'];

  readonly mode: PatternMode = 'both';
  readonly priority: PatternPriority = 5; // MEDIUM-LOW - supplementary context
  readonly phases: PatternPhase[] = ['all'];

  // v4.5: Dependencies
  readonly dependencies: PatternDependency = {
    runAfter: ['objective-clarifier'], // Clarify objective first, then add technical context
    enhancedBy: ['domain-context-enricher'],
  };

  // -------------------------------------------------------------------------
  // Configuration Schema (v4.5)
  // -------------------------------------------------------------------------

  static override readonly configSchema: PatternConfigSchema = {
    detectFrameworks: {
      type: 'boolean',
      default: true,
      description: 'Detect and add framework information',
    },
    suggestVersions: {
      type: 'boolean',
      default: true,
      description: 'Suggest adding version information when missing',
    },
  };

  // -------------------------------------------------------------------------
  // Pattern Application
  // -------------------------------------------------------------------------

  apply(prompt: string, context: PatternContext): PatternResult {
    const lowerPrompt = prompt.toLowerCase();
    const enhancements: string[] = [];

    // Check if technical context is already present
    if (this.hasTechnicalContext(prompt)) {
      return {
        enhancedPrompt: prompt,
        improvement: {
          dimension: 'completeness',
          description: 'Technical context already specified',
          impact: 'low',
        },
        applied: false,
      };
    }

    // Detect language mentions without versions
    const detectedLanguage = this.detectLanguage(lowerPrompt);
    if (detectedLanguage && !this.hasVersionInfo(prompt)) {
      enhancements.push(`Language: ${detectedLanguage} (please specify version if critical)`);
    }

    // Suggest adding framework if code generation
    if (context.intent.primaryIntent === 'code-generation') {
      const framework = this.detectFramework(lowerPrompt);
      if (framework) {
        enhancements.push(`Framework: ${framework}`);
      }
    }

    // No enhancements needed
    if (enhancements.length === 0) {
      return {
        enhancedPrompt: prompt,
        improvement: {
          dimension: 'completeness',
          description: 'No additional technical context needed',
          impact: 'low',
        },
        applied: false,
      };
    }

    // Add technical context section
    const contextSection = `\n\n# Technical Constraints\n${enhancements.map((e) => `- ${e}`).join('\n')}`;
    const enhanced = prompt + contextSection;

    return {
      enhancedPrompt: enhanced,
      improvement: {
        dimension: 'completeness',
        description: `Added ${enhancements.length} technical context specifications`,
        impact: 'medium',
      },
      applied: true,
    };
  }

  private hasTechnicalContext(prompt: string): boolean {
    const contextMarkers = [
      /version|v\d+\.\d+/i,
      /technical (context|constraints|requirements)/i,
      /language:.*framework:/i,
      /using (python|javascript|typescript|java|rust|go) \d/i,
    ];

    return contextMarkers.some((marker) => marker.test(prompt));
  }

  private detectLanguage(prompt: string): string | null {
    const languages: { [key: string]: string } = {
      python: 'Python',
      javascript: 'JavaScript',
      typescript: 'TypeScript',
      java: 'Java',
      rust: 'Rust',
      go: 'Go',
      php: 'PHP',
      ruby: 'Ruby',
      swift: 'Swift',
      kotlin: 'Kotlin',
      'c++': 'C++',
      csharp: 'C#',
      'c#': 'C#',
    };

    for (const [key, name] of Object.entries(languages)) {
      if (prompt.includes(key)) {
        return name;
      }
    }

    // Check for common patterns
    if (prompt.includes('react') || prompt.includes('vue') || prompt.includes('angular')) {
      return 'JavaScript/TypeScript';
    }
    if (prompt.includes('django') || prompt.includes('flask')) {
      return 'Python';
    }
    if (prompt.includes('spring') || prompt.includes('hibernate')) {
      return 'Java';
    }

    return null;
  }

  private detectFramework(prompt: string): string | null {
    const frameworks: { [key: string]: string } = {
      react: 'React',
      vue: 'Vue.js',
      angular: 'Angular',
      svelte: 'Svelte',
      next: 'Next.js',
      nextjs: 'Next.js',
      nuxt: 'Nuxt.js',
      django: 'Django',
      flask: 'Flask',
      fastapi: 'FastAPI',
      express: 'Express.js',
      nestjs: 'NestJS',
      spring: 'Spring Boot',
      rails: 'Ruby on Rails',
      laravel: 'Laravel',
    };

    for (const [key, name] of Object.entries(frameworks)) {
      if (prompt.includes(key)) {
        return name;
      }
    }

    return null;
  }

  private hasVersionInfo(prompt: string): boolean {
    return /\d+\.\d+/.test(prompt) || /v\d+/.test(prompt);
  }
}
