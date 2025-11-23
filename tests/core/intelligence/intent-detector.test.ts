import { IntentDetector } from '../../../src/core/intelligence/intent-detector.js';
import { describe, it, expect } from '@jest/globals';

describe('IntentDetector', () => {
  const detector = new IntentDetector();

  describe('analyze', () => {
    describe('code-generation', () => {
      it('should detect create/build/implement keywords', () => {
        expect(detector.analyze('Create a login component').primaryIntent).toBe('code-generation');
        expect(detector.analyze('Build an API endpoint').primaryIntent).toBe('code-generation');
        expect(detector.analyze('Implement user authentication').primaryIntent).toBe('code-generation');
        expect(detector.analyze('Add password reset feature').primaryIntent).toBe('code-generation');
        expect(detector.analyze('Write a function to validate emails').primaryIntent).toBe('code-generation');
      });

      it('should detect component/function/class mentions', () => {
        expect(detector.analyze('Create a React component').primaryIntent).toBe('code-generation');
        expect(detector.analyze('Build a function for sorting').primaryIntent).toBe('code-generation');
        expect(detector.analyze('Implement a class for user management').primaryIntent).toBe('code-generation');
      });
    });

    describe('planning', () => {
      it('should detect architecture/design keywords', () => {
        expect(detector.analyze('How should I structure my app?').primaryIntent).toBe('planning');
        expect(detector.analyze('Design the database schema').primaryIntent).toBe('planning');
        expect(detector.analyze('Plan the microservices architecture').primaryIntent).toBe('planning');
        expect(detector.analyze('What is the best way to organize my code?').primaryIntent).toBe('planning');
      });

      it('should detect planning questions', () => {
        expect(detector.analyze('How do I approach building a real-time chat?').primaryIntent).toBe('planning');
        expect(detector.analyze('What architecture should I use?').primaryIntent).toBe('planning');
      });
    });

    describe('refinement', () => {
      it('should detect improvement/optimization keywords', () => {
        expect(detector.analyze('Improve the performance of my query').primaryIntent).toBe('refinement');
        expect(detector.analyze('Optimize the database queries').primaryIntent).toBe('refinement');
        expect(detector.analyze('Refactor this code to be cleaner').primaryIntent).toBe('refinement');
        expect(detector.analyze('Make this component more reusable').primaryIntent).toBe('refinement');
      });

      it('should detect enhancement requests', () => {
        expect(detector.analyze('Enhance the user experience').primaryIntent).toBe('refinement');
        expect(detector.analyze('Update the styling to be more modern').primaryIntent).toBe('refinement');
      });
    });

    describe('debugging', () => {
      it('should detect error/bug keywords', () => {
        expect(detector.analyze('Fix the authentication error').primaryIntent).toBe('debugging');
        expect(detector.analyze('Debug the payment flow issue').primaryIntent).toBe('debugging');
        expect(detector.analyze('Resolve the memory leak').primaryIntent).toBe('debugging');
        expect(detector.analyze('Why is my component not rendering?').primaryIntent).toBe('debugging');
      });

      it('should detect troubleshooting questions', () => {
        expect(detector.analyze('What is causing this bug?').primaryIntent).toBe('debugging');
        expect(detector.analyze('How do I fix this error?').primaryIntent).toBe('debugging');
      });
    });

    describe('documentation', () => {
      it('should detect documentation keywords', () => {
        expect(detector.analyze('Write documentation for the API').primaryIntent).toBe('documentation');
        expect(detector.analyze('Document the authentication flow').primaryIntent).toBe('documentation');
        expect(detector.analyze('Create API documentation').primaryIntent).toBe('documentation');
        expect(detector.analyze('Add comments to this function').primaryIntent).toBe('documentation');
      });

      it('should detect explanation requests', () => {
        expect(detector.analyze('Explain how the auth system works').primaryIntent).toBe('documentation');
        expect(detector.analyze('Describe the payment processing flow').primaryIntent).toBe('documentation');
      });
    });

    describe('prd-generation', () => {
      it('should detect PRD/requirements keywords', () => {
        // Note: PRD is typically explicit command, not inferred
        const prd1 = detector.analyze('Create a PRD for user management').primaryIntent;
        const prd2 = detector.analyze('Generate requirements document').primaryIntent;
        // These may be classified as code-generation or planning, which is acceptable
        expect(['code-generation', 'planning', 'prd-generation']).toContain(prd1);
        expect(['code-generation', 'planning', 'prd-generation']).toContain(prd2);
      });
    });

    describe('edge cases', () => {
      it('should default to code-generation for ambiguous prompts', () => {
        expect(detector.analyze('user login').primaryIntent).toBe('code-generation');
        expect(detector.analyze('dashboard').primaryIntent).toBe('code-generation');
      });

      it('should handle empty prompt', () => {
        const result = detector.analyze('');
        expect(['code-generation', 'planning', 'refinement', 'debugging', 'documentation', 'prd-generation'])
          .toContain(result.primaryIntent);
      });

      it('should handle mixed intent prompts', () => {
        // When multiple intents detected, highest score wins
        const result = detector.analyze('Create and document the API');
        expect(['code-generation', 'documentation']).toContain(result.primaryIntent);
      });

      it('should be case-insensitive', () => {
        expect(detector.analyze('CREATE a login page').primaryIntent).toBe('code-generation');
        expect(detector.analyze('FIX THE BUG').primaryIntent).toBe('debugging');
        expect(detector.analyze('Write DOCUMENTATION').primaryIntent).toBe('documentation');
      });
    });

    describe('enhanced detection - weighted scoring', () => {
      it('should prioritize strong code keywords', () => {
        expect(detector.analyze('create function for validation').primaryIntent).toBe('code-generation');
        expect(detector.analyze('build component for user profile').primaryIntent).toBe('code-generation');
        expect(detector.analyze('implement feature for notifications').primaryIntent).toBe('code-generation');
      });

      it('should prioritize strong planning keywords', () => {
        expect(detector.analyze('what\'s the best way to structure auth?').primaryIntent).toBe('planning');
        expect(detector.analyze('pros and cons of microservices').primaryIntent).toBe('planning');
        expect(detector.analyze('help me choose between SQL and NoSQL').primaryIntent).toBe('planning');
      });

      it('should prioritize strong debugging keywords', () => {
        expect(detector.analyze('fix error in login flow').primaryIntent).toBe('debugging');
        expect(detector.analyze('debug issue with database connection').primaryIntent).toBe('debugging');
        expect(detector.analyze('component doesn\'t work properly').primaryIntent).toBe('debugging');
      });

      it('should prioritize strong refinement keywords', () => {
        expect(detector.analyze('optimize performance of API calls').primaryIntent).toBe('refinement');
        expect(detector.analyze('make it faster for large datasets').primaryIntent).toBe('refinement');
        expect(detector.analyze('refactor this code for better maintainability').primaryIntent).toBe('refinement');
      });

      it('should prioritize strong documentation keywords', () => {
        expect(detector.analyze('explain how the caching works').primaryIntent).toBe('documentation');
        expect(detector.analyze('walk me through the deployment process').primaryIntent).toBe('documentation');
        expect(detector.analyze('show me how the payment flow works').primaryIntent).toBe('documentation');
      });
    });

    describe('enhanced detection - phrase matching', () => {
      it('should detect multi-word phrases for code generation', () => {
        expect(detector.analyze('create function to parse JSON').primaryIntent).toBe('code-generation');
        expect(detector.analyze('add endpoint for user registration').primaryIntent).toBe('code-generation');
        expect(detector.analyze('write class for data validation').primaryIntent).toBe('code-generation');
      });

      it('should detect multi-word phrases for refinement', () => {
        expect(detector.analyze('make this component more maintainable').primaryIntent).toBe('refinement');
        expect(detector.analyze('update the styling to be responsive').primaryIntent).toBe('refinement');
      });

      it('should detect multi-word phrases for debugging', () => {
        expect(detector.analyze('resolve the connection timeout').primaryIntent).toBe('debugging');
        expect(detector.analyze('why is my API returning 500').primaryIntent).toBe('debugging');
      });
    });

    describe('enhanced detection - context analysis', () => {
      it('should use context bonuses for debugging with code', () => {
        const withCode = 'Fix this: `const x = undefined.toString()`';
        expect(detector.analyze(withCode).primaryIntent).toBe('debugging');
      });

      it('should use question marks for planning', () => {
        expect(detector.analyze('How should I handle file uploads?').primaryIntent).toBe('planning');
        expect(detector.analyze('What architecture is best for this?').primaryIntent).toBe('planning');
      });

      it('should detect performance terms for refinement', () => {
        expect(detector.analyze('improve the response time of queries').primaryIntent).toBe('refinement');
        expect(detector.analyze('reduce memory usage in the app').primaryIntent).toBe('refinement');
      });
    });

    describe('enhanced detection - confidence scores', () => {
      it('should return high confidence for clear intents', () => {
        const result = detector.analyze('create function to validate emails');
        expect(result.confidence).toBeGreaterThan(70);
      });

      it('should return lower confidence for very ambiguous prompts', () => {
        const result = detector.analyze('something nice');
        expect(result.confidence).toBeLessThan(75);
      });

      it('should identify characteristics correctly', () => {
        const withCode = detector.analyze('Fix: `function test() { return null.value; }`');
        expect(withCode.characteristics.hasCodeContext).toBe(true);

        const withQuestion = detector.analyze('How should I structure my database?');
        expect(withQuestion.characteristics.isOpenEnded).toBe(true);
      });
    });

    describe('enhanced detection - mode suggestions', () => {
      it('should suggest deep mode for low confidence', () => {
        const ambiguous = detector.analyze('make better');
        expect(ambiguous.suggestedMode).toBe('deep');
      });

      it('should suggest deep mode for planning', () => {
        const planning = detector.analyze('how should I architect this system?');
        expect(planning.suggestedMode).toBe('deep');
      });

      it('should suggest fast mode for high-confidence non-planning prompts', () => {
        const clear = detector.analyze('Create a login component with email and password fields');
        expect(clear.suggestedMode).toBe('fast');
      });
    });
  });
});
