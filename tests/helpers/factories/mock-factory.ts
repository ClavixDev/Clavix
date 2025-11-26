/**
 * Mock Factory
 *
 * Factory functions for creating mock objects used in tests.
 * Provides consistent, type-safe mock data generation.
 */

import { jest } from '@jest/globals';

/**
 * Mock Optimization Result
 */
export interface MockOptimizationResult {
  original: string;
  enhanced: string;
  depthLevel: 'standard' | 'deep';
  intent: {
    primaryIntent: string;
    confidence: number;
    characteristics: {
      hasCodeContext: boolean;
      hasTechnicalTerms: boolean;
      isOpenEnded: boolean;
      needsStructure: boolean;
    };
  };
  quality: {
    clarity: number;
    efficiency: number;
    structure: number;
    completeness: number;
    actionability: number;
    overall: number;
    strengths: string[];
    weaknesses: string[];
  };
  improvements: Array<{
    description: string;
    dimension: string;
    impact: 'high' | 'medium' | 'low';
  }>;
  appliedPatterns: Array<{
    name: string;
    description: string;
  }>;
  processingTimeMs: number;
}

export function createMockOptimizationResult(
  overrides: Partial<MockOptimizationResult> = {}
): MockOptimizationResult {
  return {
    original: 'Create a login page',
    enhanced:
      'Create a secure login page with email and password fields, form validation, error handling, and responsive design using React and TypeScript.',
    depthLevel: 'standard',
    intent: {
      primaryIntent: 'code-generation',
      confidence: 85,
      characteristics: {
        hasCodeContext: false,
        hasTechnicalTerms: true,
        isOpenEnded: false,
        needsStructure: false,
      },
      ...overrides.intent,
    },
    quality: {
      clarity: 75,
      efficiency: 80,
      structure: 70,
      completeness: 65,
      actionability: 78,
      overall: 74,
      strengths: ['Clear objective', 'Actionable request'],
      weaknesses: ['Could specify technology stack', 'Missing validation requirements'],
      ...overrides.quality,
    },
    improvements: overrides.improvements ?? [
      { description: 'Added technical specificity', dimension: 'clarity', impact: 'medium' },
      {
        description: 'Included validation requirements',
        dimension: 'completeness',
        impact: 'high',
      },
    ],
    appliedPatterns: overrides.appliedPatterns ?? [
      { name: 'ObjectiveClarifier', description: 'Clarified the main objective' },
      { name: 'CompletenessValidator', description: 'Added missing requirements' },
    ],
    processingTimeMs: overrides.processingTimeMs ?? 42,
    ...overrides,
  };
}

/**
 * Create a low-quality optimization result that triggers comprehensive depth recommendation
 */
export function createLowQualityOptimizationResult(
  overrides: Partial<MockOptimizationResult> = {}
): MockOptimizationResult {
  return createMockOptimizationResult({
    original: 'make thing',
    enhanced: 'Create a software application that performs a specific function.',
    quality: {
      clarity: 35,
      efficiency: 40,
      structure: 30,
      completeness: 25,
      actionability: 38,
      overall: 34,
      strengths: [],
      weaknesses: ['Very vague', 'No context', 'Missing requirements'],
    },
    intent: {
      primaryIntent: 'planning',
      confidence: 45,
      characteristics: {
        hasCodeContext: false,
        hasTechnicalTerms: false,
        isOpenEnded: true,
        needsStructure: true,
      },
    },
    improvements: [
      { description: 'Attempted to add structure', dimension: 'structure', impact: 'low' },
    ],
    ...overrides,
  });
}

/**
 * Create a high-quality optimization result
 */
export function createHighQualityOptimizationResult(
  overrides: Partial<MockOptimizationResult> = {}
): MockOptimizationResult {
  return createMockOptimizationResult({
    original:
      'As a senior React developer, create a TypeScript login component with email/password fields, validation, error display, and submit button.',
    enhanced:
      'As a senior React developer, create a TypeScript login component with email/password fields, Yup validation schema, accessible error display with ARIA attributes, submit button with loading state, and unit tests using React Testing Library.',
    quality: {
      clarity: 92,
      efficiency: 88,
      structure: 90,
      completeness: 85,
      actionability: 95,
      overall: 90,
      strengths: [
        'Clear role specification',
        'Technical requirements defined',
        'Actionable output',
      ],
      weaknesses: [],
    },
    intent: {
      primaryIntent: 'code-generation',
      confidence: 98,
      characteristics: {
        hasCodeContext: false,
        hasTechnicalTerms: true,
        isOpenEnded: false,
        needsStructure: false,
      },
    },
    ...overrides,
  });
}

/**
 * Mock Session
 */
export interface MockSession {
  id: string;
  projectName: string;
  description: string;
  tags: string[];
  created: string;
  updated?: string;
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: string;
  }>;
  status: 'active' | 'completed' | 'archived';
}

export function createMockSession(overrides: Partial<MockSession> = {}): MockSession {
  const now = new Date().toISOString();
  return {
    id: `session-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    projectName: 'test-project',
    description: 'A test session for unit testing',
    tags: ['test', 'unit'],
    created: now,
    updated: now,
    messages: [
      { role: 'user', content: 'Create a login page', timestamp: now },
      {
        role: 'assistant',
        content: 'I understand you want to create a login page. Let me help you with that.',
        timestamp: now,
      },
    ],
    status: 'active',
    ...overrides,
  };
}

/**
 * Create an empty session (no messages)
 */
export function createEmptySession(overrides: Partial<MockSession> = {}): MockSession {
  return createMockSession({
    messages: [],
    ...overrides,
  });
}

/**
 * Create a session with many messages
 */
export function createLongSession(
  messageCount: number = 10,
  overrides: Partial<MockSession> = {}
): MockSession {
  const messages: MockSession['messages'] = [];
  const baseTime = new Date();

  for (let i = 0; i < messageCount; i++) {
    const time = new Date(baseTime.getTime() + i * 60000).toISOString();
    messages.push({
      role: i % 2 === 0 ? 'user' : 'assistant',
      content: `Message ${i + 1} content`,
      timestamp: time,
    });
  }

  return createMockSession({
    messages,
    ...overrides,
  });
}

/**
 * Mock PRD Project
 */
export interface MockPrdProject {
  name: string;
  path: string;
  hasPrd: boolean;
  hasQuickPrd: boolean;
  hasTasks: boolean;
  hasConfig: boolean;
  created: string;
  taskStats?: {
    total: number;
    completed: number;
    remaining: number;
    percentage: number;
  };
}

export function createMockPrdProject(overrides: Partial<MockPrdProject> = {}): MockPrdProject {
  return {
    name: 'test-project',
    path: '.clavix/outputs/test-project',
    hasPrd: true,
    hasQuickPrd: true,
    hasTasks: false,
    hasConfig: false,
    created: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Create a PRD project with tasks
 */
export function createMockPrdProjectWithTasks(
  overrides: Partial<MockPrdProject> = {}
): MockPrdProject {
  return createMockPrdProject({
    hasTasks: true,
    hasConfig: true,
    taskStats: {
      total: 5,
      completed: 2,
      remaining: 3,
      percentage: 40,
    },
    ...overrides,
  });
}

/**
 * Mock Task
 */
export interface MockTask {
  id: string;
  title: string;
  description: string;
  phase: string;
  completed: boolean;
  completedAt?: string;
}

export function createMockTask(overrides: Partial<MockTask> = {}): MockTask {
  return {
    id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
    title: 'Initialize Project',
    description: 'Set up the project structure and dependencies',
    phase: 'Phase 1: Setup',
    completed: false,
    ...overrides,
  };
}

/**
 * Create a list of mock tasks representing a typical PRD task breakdown
 */
export function createMockTaskList(count: number = 5): MockTask[] {
  const phases = ['Phase 1: Setup', 'Phase 2: Implementation', 'Phase 3: Testing'];
  const tasks: MockTask[] = [];

  for (let i = 0; i < count; i++) {
    tasks.push(
      createMockTask({
        id: `phase-${Math.floor(i / 2) + 1}-task-${(i % 2) + 1}`,
        title: `Task ${i + 1}`,
        description: `Description for task ${i + 1}`,
        phase: phases[Math.floor(i / 2) % phases.length],
        completed: i < 2, // First two tasks completed
      })
    );
  }

  return tasks;
}

/**
 * Mock Config
 */
export interface MockConfig {
  version: string;
  integrations: string[];
  templates: {
    prdQuestions: string;
    fullPrd: string;
    quickPrd: string;
  };
  outputs: {
    path: string;
    format: 'markdown' | 'pdf';
  };
  preferences: {
    autoOpenOutputs: boolean;
    verboseLogging: boolean;
    preserveSessions: boolean;
  };
  experimental?: Record<string, unknown>;
}

export function createMockConfig(overrides: Partial<MockConfig> = {}): MockConfig {
  return {
    version: '3.6.1',
    integrations: ['claude-code'],
    templates: {
      prdQuestions: '',
      fullPrd: '',
      quickPrd: '',
      ...overrides.templates,
    },
    outputs: {
      path: '.clavix/outputs',
      format: 'markdown',
      ...overrides.outputs,
    },
    preferences: {
      autoOpenOutputs: false,
      verboseLogging: false,
      preserveSessions: true,
      ...overrides.preferences,
    },
    ...overrides,
  };
}

/**
 * Create config with multiple integrations
 */
export function createMultiIntegrationConfig(
  integrations: string[] = ['claude-code', 'cursor', 'windsurf']
): MockConfig {
  return createMockConfig({ integrations });
}

/**
 * Mock Prompt
 */
export interface MockPrompt {
  id: string;
  content: string;
  depthLevel: 'standard' | 'deep';
  original: string;
  created: string;
  status: 'new' | 'executed' | 'old' | 'stale';
  executedAt?: string;
}

export function createMockPrompt(overrides: Partial<MockPrompt> = {}): MockPrompt {
  return {
    id: `prompt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    content:
      'Create a secure login page with email and password fields, form validation, and error handling.',
    depthLevel: 'standard',
    original: 'Create a login page',
    created: new Date().toISOString(),
    status: 'new',
    ...overrides,
  };
}

/**
 * Create a list of mock prompts with various statuses
 */
export function createMockPromptList(count: number = 5): MockPrompt[] {
  const statuses: MockPrompt['status'][] = ['new', 'executed', 'old', 'stale'];
  const modes: MockPrompt['mode'][] = ['fast', 'deep'];

  return Array.from({ length: count }, (_, i) =>
    createMockPrompt({
      id: `prompt-${i + 1}`,
      mode: modes[i % 2],
      status: statuses[i % 4],
      created: new Date(Date.now() - i * 86400000).toISOString(), // Each one day older
    })
  );
}

/**
 * Mock PRD Answers (for prd command)
 */
export interface MockPrdAnswers {
  q1: string; // What are you building?
  q2: string; // Core features
  q3: string; // Tech stack
  q4: string; // Constraints
  q5: string; // Success criteria
}

export function createMockPrdAnswers(overrides: Partial<MockPrdAnswers> = {}): MockPrdAnswers {
  return {
    q1: 'Build an e-commerce platform for small businesses to sell products online',
    q2: 'Product catalog, Shopping cart, Payment processing, Order management, User accounts',
    q3: 'React, Node.js, PostgreSQL, Stripe for payments',
    q4: 'Must be mobile-responsive, PCI-DSS compliant for payments, launch within 3 months',
    q5: 'Handle 1000 concurrent users, page load under 2 seconds, 99.9% uptime',
    ...overrides,
  };
}

/**
 * Mock Conversation Analysis Result
 */
export interface MockAnalysisResult {
  keyRequirements: string[];
  technicalConstraints: string[];
  successCriteria: string[];
  miniPrd: string;
  optimizedPrompt: string;
}

export function createMockAnalysisResult(
  overrides: Partial<MockAnalysisResult> = {}
): MockAnalysisResult {
  return {
    keyRequirements: [
      'User authentication with email/password',
      'Product catalog with search and filters',
      'Shopping cart with persistent state',
    ],
    technicalConstraints: [
      'React frontend with TypeScript',
      'RESTful API backend',
      'PostgreSQL database',
    ],
    successCriteria: [
      'Users can browse and purchase products',
      'Checkout process completes in under 5 minutes',
      'Mobile responsive design',
    ],
    miniPrd: 'Build an e-commerce platform with user auth, product catalog, cart, and checkout.',
    optimizedPrompt:
      'Create an e-commerce web application using React/TypeScript frontend and Node.js backend with PostgreSQL. Implement user authentication, product catalog with search, shopping cart, and Stripe checkout integration.',
    ...overrides,
  };
}

/**
 * Mock Archive Entry
 */
export interface MockArchiveEntry {
  name: string;
  archivedAt: string;
  originalPath: string;
  archivePath: string;
  hasBackup: boolean;
}

export function createMockArchiveEntry(
  overrides: Partial<MockArchiveEntry> = {}
): MockArchiveEntry {
  const name = overrides.name ?? 'archived-project';
  return {
    name,
    archivedAt: new Date().toISOString(),
    originalPath: `.clavix/outputs/${name}`,
    archivePath: `.clavix/outputs/archive/${name}`,
    hasBackup: true,
    ...overrides,
  };
}
