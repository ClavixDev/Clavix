/**
 * Test Fixtures
 *
 * Static test data fixtures for consistent testing across test suites.
 * These fixtures provide known-good and known-bad data for testing edge cases.
 */

// ============================================================================
// Prompt Fixtures
// ============================================================================

export const PROMPTS = {
  // Valid prompts of varying quality
  SIMPLE: 'Create a login page',
  DETAILED:
    'Create a React login component with email and password fields, form validation using Yup, Material-UI styling, error display, and submit button that calls /api/login',
  EXCELLENT:
    'As a senior React developer, create a TypeScript login component with email/password fields, validation using Yup, Material-UI styling, accessible error display with ARIA attributes, submit button with loading state, and unit tests using React Testing Library. Return only the TSX component code.',

  // Problematic prompts that should trigger warnings or comprehensive depth
  VAGUE: 'make thing',
  TOO_SHORT: 'app',
  VERBOSE:
    'Please could you maybe possibly help me if it is not too much trouble to perhaps create a login page for me',
  ILLOGICAL: 'Make it fast. Create a dashboard. Use React. Add features.',
  OPEN_ENDED: 'Build something for users',

  // Edge case prompts
  EMPTY: '',
  WHITESPACE: '   \n  \t  ',
  VERY_LONG: 'a'.repeat(1000) + ' Create a login page',
  SPECIAL_CHARS: 'Create a login page with émojis 🚀 and spëcial çhars',
  MARKDOWN: '# Create a login page\n\n- Email field\n- Password field\n\n**Important**: Use React',
  CODE_SNIPPET: 'Create a login page like this: `<form><input type="email" /></form>`',

  // Intent-specific prompts
  PLANNING: 'Plan out the architecture for a microservices system',
  DEBUGGING: 'Fix the bug in the authentication middleware that causes 401 errors',
  DOCUMENTATION: 'Write API documentation for the user management endpoints',
  REFINEMENT: 'Improve the performance of the database queries',
  PRD_GENERATION: 'Create a PRD for a new mobile banking application',
} as const;

// ============================================================================
// Session Fixtures
// ============================================================================

export const SESSIONS = {
  VALID: {
    id: 'session-test-123',
    projectName: 'test-project',
    description: 'A test session',
    tags: ['test', 'fixture'],
    created: '2024-01-15T10:00:00.000Z',
    updated: '2024-01-15T10:30:00.000Z',
    messages: [
      {
        role: 'user' as const,
        content: 'I want to build a login page',
        timestamp: '2024-01-15T10:00:00.000Z',
      },
      {
        role: 'assistant' as const,
        content: 'I can help with that. What framework are you using?',
        timestamp: '2024-01-15T10:01:00.000Z',
      },
      {
        role: 'user' as const,
        content: 'React with TypeScript',
        timestamp: '2024-01-15T10:02:00.000Z',
      },
    ],
    status: 'active' as const,
  },

  EMPTY_MESSAGES: {
    id: 'session-empty-456',
    projectName: 'empty-project',
    description: 'Session with no messages',
    tags: [],
    created: '2024-01-15T10:00:00.000Z',
    messages: [],
    status: 'active' as const,
  },

  COMPLETED: {
    id: 'session-completed-789',
    projectName: 'completed-project',
    description: 'A completed session',
    tags: ['completed'],
    created: '2024-01-14T09:00:00.000Z',
    updated: '2024-01-14T12:00:00.000Z',
    messages: [
      { role: 'user' as const, content: 'Build an API', timestamp: '2024-01-14T09:00:00.000Z' },
      { role: 'assistant' as const, content: 'Done!', timestamp: '2024-01-14T12:00:00.000Z' },
    ],
    status: 'completed' as const,
  },

  LONG_CONVERSATION: {
    id: 'session-long-abc',
    projectName: 'long-project',
    description: 'Session with many messages',
    tags: ['long'],
    created: '2024-01-10T08:00:00.000Z',
    messages: Array.from({ length: 20 }, (_, i) => ({
      role: (i % 2 === 0 ? 'user' : 'assistant') as 'user' | 'assistant',
      content: `Message ${i + 1} content`,
      timestamp: new Date(Date.parse('2024-01-10T08:00:00.000Z') + i * 60000).toISOString(),
    })),
    status: 'active' as const,
  },
} as const;

// ============================================================================
// Config Fixtures
// ============================================================================

export const CONFIGS = {
  DEFAULT: {
    version: '3.6.1',
    integrations: ['claude-code'],
    templates: {
      prdQuestions: '',
      fullPrd: '',
      quickPrd: '',
    },
    outputs: {
      path: '.clavix/outputs',
      format: 'markdown' as const,
    },
    preferences: {
      autoOpenOutputs: false,
      verboseLogging: false,
      preserveSessions: true,
    },
  },

  MULTI_INTEGRATION: {
    version: '3.6.1',
    integrations: ['claude-code', 'cursor', 'windsurf', 'gemini'],
    templates: {
      prdQuestions: '',
      fullPrd: '',
      quickPrd: '',
    },
    outputs: {
      path: '.clavix/outputs',
      format: 'markdown' as const,
    },
    preferences: {
      autoOpenOutputs: true,
      verboseLogging: true,
      preserveSessions: true,
    },
  },

  CUSTOM_TEMPLATES: {
    version: '3.6.1',
    integrations: ['claude-code'],
    templates: {
      prdQuestions: '.clavix/templates/custom-questions.txt',
      fullPrd: '.clavix/templates/custom-prd.txt',
      quickPrd: '.clavix/templates/custom-quick.txt',
    },
    outputs: {
      path: '.clavix/custom-outputs',
      format: 'markdown' as const,
    },
    preferences: {
      autoOpenOutputs: false,
      verboseLogging: false,
      preserveSessions: false,
    },
  },

  LEGACY_V2: {
    version: '2.0.0',
    provider: 'claude-code',
    outputDir: '.clavix/outputs',
  },
} as const;

// ============================================================================
// PRD Fixtures
// ============================================================================

export const PRD_CONTENT = {
  FULL_PRD: `# Product Requirements Document

## Project: E-Commerce Platform

### Overview
Build an e-commerce platform for small businesses.

### Features
1. Product Catalog
2. Shopping Cart
3. Checkout Flow
4. User Accounts

### Technical Requirements
- React frontend
- Node.js backend
- PostgreSQL database

### Success Criteria
- Handle 1000 concurrent users
- Page load under 2 seconds
`,

  QUICK_PRD: `# E-Commerce Platform - Quick Reference

Build an e-commerce platform with product catalog, shopping cart, checkout, and user accounts.

Tech: React, Node.js, PostgreSQL
Target: 1000 users, <2s load time
`,

  TASKS_MD: `# Implementation Tasks: E-Commerce Platform

## Phase 1: Setup

### Task 1.1: Initialize Project Structure
- [ ] Create React app with TypeScript
- [ ] Set up Node.js backend
- [ ] Configure PostgreSQL database
- **ID**: phase-1-setup-1

### Task 1.2: Configure CI/CD
- [ ] Set up GitHub Actions
- [ ] Configure deployment pipeline
- **ID**: phase-1-setup-2

## Phase 2: Core Features

### Task 2.1: Implement Product Catalog
- [ ] Create product model
- [ ] Build product listing page
- [ ] Add search and filters
- **ID**: phase-2-features-1

### Task 2.2: Build Shopping Cart
- [ ] Implement cart state management
- [ ] Create cart UI components
- [ ] Add persistence
- **ID**: phase-2-features-2

## Phase 3: Checkout

### Task 3.1: Payment Integration
- [ ] Set up Stripe
- [ ] Create checkout flow
- [ ] Handle payment webhooks
- **ID**: phase-3-checkout-1
`,
} as const;

// ============================================================================
// PRD Answers Fixtures
// ============================================================================

export const PRD_ANSWERS = {
  COMPLETE: {
    q1: 'Build an e-commerce platform for small businesses to sell products online',
    q2: 'Product catalog, Shopping cart, Payment processing, Order management, User accounts',
    q3: 'React, Node.js, PostgreSQL, Stripe for payments',
    q4: 'Must be mobile-responsive, PCI-DSS compliant for payments, launch within 3 months',
    q5: 'Handle 1000 concurrent users, page load under 2 seconds, 99.9% uptime',
  },

  MINIMAL: {
    q1: 'Build a simple todo app',
    q2: 'Add tasks, mark complete, delete tasks',
    q3: 'React',
    q4: 'None',
    q5: 'Works correctly',
  },

  COMPLEX: {
    q1: 'Build a comprehensive project management suite with real-time collaboration, Gantt charts, resource allocation, time tracking, and reporting dashboards',
    q2: 'Project creation, Task management, Team collaboration, Resource planning, Time tracking, Gantt charts, Kanban boards, Calendar views, Reporting, Integrations',
    q3: 'Next.js, GraphQL, PostgreSQL, Redis, WebSockets, AWS infrastructure, Docker, Kubernetes',
    q4: 'SOC 2 compliance, GDPR compliance, multi-tenant architecture, offline support, enterprise SSO',
    q5: '10,000 concurrent users, <100ms API response, 99.99% uptime, real-time sync under 500ms',
  },
} as const;

// ============================================================================
// Task Fixtures
// ============================================================================

export const TASKS = {
  PENDING: {
    id: 'phase-1-setup-1',
    title: 'Initialize Project Structure',
    description:
      'Create React app with TypeScript, set up Node.js backend, configure PostgreSQL database',
    phase: 'Phase 1: Setup',
    completed: false,
  },

  COMPLETED: {
    id: 'phase-1-setup-2',
    title: 'Configure CI/CD',
    description: 'Set up GitHub Actions, configure deployment pipeline',
    phase: 'Phase 1: Setup',
    completed: true,
    completedAt: '2024-01-15T12:00:00.000Z',
  },

  IN_PROGRESS: {
    id: 'phase-2-features-1',
    title: 'Implement Product Catalog',
    description: 'Create product model, build product listing page, add search and filters',
    phase: 'Phase 2: Core Features',
    completed: false,
  },
} as const;

// ============================================================================
// Implement Config Fixtures
// ============================================================================

export const IMPLEMENT_CONFIGS = {
  NEW_PROJECT: {
    commitStrategy: 'per-task',
    tasksPath: '.clavix/outputs/test-project/tasks.md',
    currentTask: {
      id: 'phase-1-setup-1',
      description: 'Initialize Project Structure',
      phase: 'Phase 1: Setup',
      completed: false,
    },
    stats: {
      total: 5,
      completed: 0,
      remaining: 5,
      percentage: 0,
    },
    timestamp: '2024-01-15T10:00:00.000Z',
    completedTaskIds: [],
    completionTimestamps: {},
    blockedTasks: [],
  },

  PARTIAL_PROGRESS: {
    commitStrategy: 'per-5-tasks',
    tasksPath: '.clavix/outputs/test-project/tasks.md',
    currentTask: {
      id: 'phase-2-features-1',
      description: 'Implement Product Catalog',
      phase: 'Phase 2: Core Features',
      completed: false,
    },
    stats: {
      total: 5,
      completed: 2,
      remaining: 3,
      percentage: 40,
    },
    timestamp: '2024-01-15T14:00:00.000Z',
    completedTaskIds: ['phase-1-setup-1', 'phase-1-setup-2'],
    completionTimestamps: {
      'phase-1-setup-1': '2024-01-15T11:00:00.000Z',
      'phase-1-setup-2': '2024-01-15T13:00:00.000Z',
    },
    blockedTasks: [],
  },

  ALL_COMPLETE: {
    commitStrategy: 'per-task',
    tasksPath: '.clavix/outputs/test-project/tasks.md',
    currentTask: null,
    stats: {
      total: 5,
      completed: 5,
      remaining: 0,
      percentage: 100,
    },
    timestamp: '2024-01-16T18:00:00.000Z',
    completedTaskIds: [
      'phase-1-setup-1',
      'phase-1-setup-2',
      'phase-2-features-1',
      'phase-2-features-2',
      'phase-3-checkout-1',
    ],
    completionTimestamps: {
      'phase-1-setup-1': '2024-01-15T11:00:00.000Z',
      'phase-1-setup-2': '2024-01-15T13:00:00.000Z',
      'phase-2-features-1': '2024-01-16T10:00:00.000Z',
      'phase-2-features-2': '2024-01-16T14:00:00.000Z',
      'phase-3-checkout-1': '2024-01-16T18:00:00.000Z',
    },
    blockedTasks: [],
  },
} as const;

// ============================================================================
// Error Fixtures (for testing error handling)
// ============================================================================

export const INVALID_DATA = {
  CORRUPTED_JSON: '{ "invalid": json content }',
  EMPTY_FILE: '',
  WRONG_FORMAT: 'This is not JSON at all',
  MISSING_REQUIRED_FIELDS: '{ "version": "1.0.0" }',
  INVALID_VERSION: '{ "version": "invalid", "integrations": [] }',
} as const;

// ============================================================================
// CLI Output Expectations (for snapshot-like assertions)
// ============================================================================

export const EXPECTED_OUTPUT = {
  FAST_SUCCESS_CONTAINS: [
    'Analyzing and optimizing',
    'Intent Analysis',
    'Quality Assessment',
    'Enhanced Prompt',
    'Processed in',
  ],

  DEEP_SUCCESS_CONTAINS: [
    'Deep Analysis Complete',
    'Intent Analysis',
    'Quality Metrics',
    'Improvements Applied',
    'Enhanced Prompt',
    'Patterns Applied',
  ],

  ERROR_EMPTY_PROMPT: ['Please provide a prompt'],

  DEEP_RECOMMENDATION: ['Smart Triage Alert', 'Deep analysis is recommended'],
} as const;

// ============================================================================
// Tech Stack Detection Fixtures
// ============================================================================

export const TECH_STACK_FILES = {
  REACT: {
    'package.json': JSON.stringify({
      name: 'react-app',
      dependencies: {
        react: '^18.2.0',
        'react-dom': '^18.2.0',
      },
    }),
  },

  NEXTJS: {
    'package.json': JSON.stringify({
      name: 'next-app',
      dependencies: {
        next: '^14.0.0',
        react: '^18.2.0',
      },
    }),
  },

  VUE: {
    'package.json': JSON.stringify({
      name: 'vue-app',
      dependencies: {
        vue: '^3.3.0',
      },
    }),
  },

  PYTHON_DJANGO: {
    'requirements.txt': 'Django>=4.2\ndjango-rest-framework>=3.14\n',
  },

  PYTHON_FLASK: {
    'requirements.txt': 'Flask>=2.0\nflask-restful>=0.3\n',
  },

  RUST: {
    'Cargo.toml': '[package]\nname = "my-rust-app"\nversion = "0.1.0"\n',
  },

  GO: {
    'go.mod': 'module example.com/myapp\n\ngo 1.21\n',
  },

  RUBY_RAILS: {
    Gemfile: "source 'https://rubygems.org'\ngem 'rails', '~> 7.0'\n",
  },
} as const;
