/**
 * Intelligence Engine Test Helpers
 * 
 * Utilities for testing prompt intelligence, optimization, and scoring.
 */

/**
 * Standard prompt fixtures for testing
 */
export const PromptFixtures = {
  short: {
    content: 'make a website',
    expectedIntent: 'scaffold',
    qualityScore: 'low'
  },
  
  medium: {
    content: 'create a react app with typescript and tailwind for a todo list',
    expectedIntent: 'scaffold',
    qualityScore: 'medium'
  },
  
  longUnstructured: {
    content: `
      I need to build a system that handles user authentication.
      It should verify emails and support oauth.
      Users should be able to reset passwords.
      Also add admin roles.
      The database should be postgres.
      Use prisma for orm.
      Make sure it's secure.
    `,
    expectedIntent: 'feature',
    qualityScore: 'medium' // Good content but unstructured
  },
  
  structured: {
    content: `
      # User Authentication System
      
      ## Requirements
      - Email/password login
      - OAuth support (Google, GitHub)
      - Password reset flow
      - Role-based access control (Admin, User)
      
      ## Tech Stack
      - Node.js / Express
      - PostgreSQL
      - Prisma ORM
      
      ## Security
      - JWT tokens
      - BCrypt hashing
    `,
    expectedIntent: 'feature',
    qualityScore: 'high'
  }
};

/**
 * Mock intelligence analysis result
 */
export function createMockAnalysis(override: any = {}) {
  return {
    intent: 'feature',
    confidence: 0.85,
    topics: ['authentication', 'database', 'api'],
    quality: {
      score: 80,
      clarity: 85,
      specificity: 75,
      context: 80
    },
    suggestions: [
      'Specify error handling requirements',
      'Define API response format'
    ],
    ...override
  };
}

/**
 * Mock optimization result
 */
export function createMockOptimization(originalPrompt: string, override: any = {}) {
  return {
    original: originalPrompt,
    optimized: `# Optimized Prompt\n\n${originalPrompt}\n\n## Added Context\n- improved structure\n- added missing details`,
    changes: [
      { type: 'structure', description: 'Added headers' },
      { type: 'content', description: 'Expanded requirements' }
    ],
    ...override
  };
}
