import {
  BasePattern,
  PatternMode,
  PatternPriority,
  PatternPhase,
  PatternConfigSchema,
} from './base-pattern.js';
import { PatternContext, PatternResult, PromptIntent } from '../types.js';

/**
 * v4.5 Pattern: Domain Context Enricher
 *
 * Adds domain-specific context and best practices based on detected
 * technical domain. Helps agents apply domain expertise.
 */
export class DomainContextEnricher extends BasePattern {
  // -------------------------------------------------------------------------
  // Pattern Metadata (v4.5 unified types)
  // -------------------------------------------------------------------------

  readonly id = 'domain-context-enricher';
  readonly name = 'Domain Context Enricher';
  readonly description = 'Adds domain-specific best practices and context';

  readonly applicableIntents: PromptIntent[] = [
    'code-generation',
    'planning',
    'refinement',
    'debugging',
    'testing',
    'security-review',
    'migration',
  ];

  readonly mode: PatternMode = 'both';
  readonly priority: PatternPriority = 5; // MEDIUM-LOW - supplementary
  readonly phases: PatternPhase[] = ['all'];

  // -------------------------------------------------------------------------
  // Configuration Schema (v4.5)
  // -------------------------------------------------------------------------

  static override readonly configSchema: PatternConfigSchema = {
    maxDomains: {
      type: 'number',
      default: 2,
      description: 'Maximum number of domains to detect',
      validation: { min: 1, max: 4 },
    },
    practicesPerDomain: {
      type: 'number',
      default: 3,
      description: 'Number of best practices per domain',
      validation: { min: 1, max: 6 },
    },
  };

  // -------------------------------------------------------------------------
  // Pattern Data
  // -------------------------------------------------------------------------

  // Domain detection patterns
  private domainPatterns: Record<string, { regex: RegExp; bestPractices: string[] }> = {
    authentication: {
      regex:
        /\b(auth|login|logout|session|token|jwt|oauth|password|credential|sign.?in|sign.?up|register)\b/i,
      bestPractices: [
        'Never store plain-text passwords - use bcrypt/argon2',
        'Implement rate limiting on auth endpoints',
        'Use secure, httpOnly cookies for session tokens',
        'Implement proper CORS configuration',
        'Add CSRF protection for state-changing operations',
        'Log authentication events for security auditing',
      ],
    },
    api: {
      regex: /\b(api|rest|graphql|endpoint|route|controller|middleware)\b/i,
      bestPractices: [
        'Use consistent response formats (JSON:API, HAL, etc.)',
        'Implement proper HTTP status codes',
        'Version your API (URL path or header)',
        'Add request validation/sanitization',
        'Document API with OpenAPI/Swagger',
        'Implement proper error responses with codes',
      ],
    },
    database: {
      regex: /\b(database|db|query|schema|model|orm|prisma|sequelize|migration|table|index)\b/i,
      bestPractices: [
        'Use parameterized queries to prevent SQL injection',
        'Create indexes for frequently queried columns',
        'Implement proper connection pooling',
        'Use transactions for multi-step operations',
        'Design for data integrity with constraints',
        'Plan for database migrations and versioning',
      ],
    },
    frontend: {
      regex:
        /\b(component|ui|ux|form|button|input|modal|layout|style|css|react|vue|angular|svelte)\b/i,
      bestPractices: [
        'Follow WCAG accessibility guidelines',
        'Implement responsive design',
        'Use semantic HTML elements',
        'Handle loading and error states',
        'Optimize for performance (lazy loading, code splitting)',
        'Support keyboard navigation',
      ],
    },
    testing: {
      regex: /\b(test|spec|mock|stub|fixture|assertion|coverage|e2e|unit|integration)\b/i,
      bestPractices: [
        'Follow AAA pattern (Arrange, Act, Assert)',
        'Keep tests isolated and independent',
        'Use meaningful test descriptions',
        'Mock external dependencies appropriately',
        'Aim for high coverage of critical paths',
        'Write both unit and integration tests',
      ],
    },
    performance: {
      regex: /\b(performance|optimize|fast|slow|latency|cache|memory|cpu|benchmark|profile)\b/i,
      bestPractices: [
        'Measure before optimizing (profile first)',
        'Implement caching at appropriate levels',
        'Use pagination for large datasets',
        'Optimize database queries (EXPLAIN, indexes)',
        'Consider lazy loading for heavy resources',
        'Set appropriate timeouts and circuit breakers',
      ],
    },
    security: {
      regex:
        /\b(security|secure|vulnerability|xss|csrf|injection|sanitize|encrypt|decrypt|audit)\b/i,
      bestPractices: [
        'Validate and sanitize all user input',
        'Use prepared statements for database queries',
        'Implement Content Security Policy (CSP)',
        'Keep dependencies updated (npm audit)',
        'Use HTTPS for all communications',
        'Follow principle of least privilege',
      ],
    },
    async: {
      regex: /\b(async|await|promise|callback|event|queue|worker|background|concurrent)\b/i,
      bestPractices: [
        'Handle Promise rejections properly',
        'Use async/await over raw Promises when possible',
        'Implement proper error propagation',
        'Avoid callback hell with Promise chaining',
        'Consider race conditions in concurrent code',
        'Implement proper cleanup for long-running operations',
      ],
    },
    deployment: {
      regex: /\b(deploy|ci|cd|pipeline|docker|kubernetes|container|cloud|aws|azure|gcp)\b/i,
      bestPractices: [
        'Use environment variables for configuration',
        'Implement health checks and readiness probes',
        'Set up proper logging and monitoring',
        'Use immutable deployments',
        'Plan for rollback scenarios',
        'Implement proper secrets management',
      ],
    },
  };

  apply(prompt: string, _context: PatternContext): PatternResult {
    // Detect domains
    const detectedDomains: { name: string; practices: string[] }[] = [];

    for (const [domain, config] of Object.entries(this.domainPatterns)) {
      if (config.regex.test(prompt)) {
        detectedDomains.push({
          name: domain,
          practices: config.bestPractices,
        });
      }
    }

    if (detectedDomains.length === 0) {
      return {
        enhancedPrompt: prompt,
        improvement: {
          dimension: 'completeness',
          description: 'No specific domain detected',
          impact: 'low',
        },
        applied: false,
      };
    }

    // Limit to top 2 domains, 3 practices each
    const selectedDomains = detectedDomains.slice(0, 2);
    const practices: string[] = [];
    for (const domain of selectedDomains) {
      practices.push(...domain.practices.slice(0, 3));
    }

    // Build domain context section
    const domainNames = selectedDomains.map((d) => d.name).join(', ');
    const contextSection = `

## Domain Best Practices (${domainNames})

Consider these best practices:
${practices.map((p) => `- ${p}`).join('\n')}

**Note**: These are general best practices - adapt to your specific context.`;

    return {
      enhancedPrompt: prompt + contextSection,
      improvement: {
        dimension: 'completeness',
        description: `Added ${practices.length} best practices for ${domainNames}`,
        impact: 'medium',
      },
      applied: true,
    };
  }
}
