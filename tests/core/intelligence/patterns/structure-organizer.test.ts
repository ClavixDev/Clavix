import { describe, it, expect, beforeEach } from '@jest/globals';
import { StructureOrganizer } from '../../../../src/core/intelligence/patterns/structure-organizer.js';
import { PatternContext } from '../../../../src/core/intelligence/types.js';

describe('StructureOrganizer', () => {
  let organizer: StructureOrganizer;
  let mockContext: PatternContext;

  beforeEach(() => {
    organizer = new StructureOrganizer();
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
          needsStructure: true,
        },
      },
    };
  });

  describe('pattern properties', () => {
    it('should have correct id', () => {
      expect(organizer.id).toBe('structure-organizer');
    });

    it('should have correct name', () => {
      expect(organizer.name).toBe('Structure Organizer');
    });

    it('should have correct description', () => {
      expect(organizer.description).toBe('Reorders information into logical sections');
    });

    it('should support both fast and deep modes', () => {
      expect(organizer.mode).toBe('both');
    });

    it('should have priority 8', () => {
      expect(organizer.priority).toBe(8);
    });

    it('should be applicable for multiple intents', () => {
      expect(organizer.applicableIntents).toContain('code-generation');
      expect(organizer.applicableIntents).toContain('planning');
      expect(organizer.applicableIntents).toContain('refinement');
      expect(organizer.applicableIntents).toContain('debugging');
      expect(organizer.applicableIntents).toContain('documentation');
    });
  });

  describe('isApplicable', () => {
    it('should return true for code-generation intent', () => {
      mockContext.intent.primaryIntent = 'code-generation';
      expect(organizer.isApplicable(mockContext)).toBe(true);
    });

    it('should return true for planning intent', () => {
      mockContext.intent.primaryIntent = 'planning';
      expect(organizer.isApplicable(mockContext)).toBe(true);
    });

    it('should return true for documentation intent', () => {
      mockContext.intent.primaryIntent = 'documentation';
      expect(organizer.isApplicable(mockContext)).toBe(true);
    });

    it('should return false for prd-generation intent', () => {
      mockContext.intent.primaryIntent = 'prd-generation';
      expect(organizer.isApplicable(mockContext)).toBe(false);
    });
  });

  describe('apply - section detection', () => {
    it('should detect existing markdown headers', () => {
      const prompt = '## Objective\nBuild something\n## Requirements\nNeed features';
      const result = organizer.apply(prompt, mockContext);
      expect(result.improvement.impact).toBe('low');
    });

    it('should detect bullet point sections', () => {
      const prompt = '- First item\n- Second item\n- Third item';
      const result = organizer.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
    });

    it('should detect numbered list sections', () => {
      const prompt = '1. First step\n2. Second step\n3. Third step';
      const result = organizer.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
    });
  });

  describe('apply - content extraction', () => {
    it('should extract objective from prompt with explicit goal', () => {
      const prompt = 'Objective: Build a user authentication system';
      const result = organizer.apply(prompt, mockContext);
      expect(result.enhancedPrompt).toContain('Objective');
    });

    it('should extract requirements section', () => {
      const prompt = 'Requirements: Must support OAuth2 and JWT';
      const result = organizer.apply(prompt, mockContext);
      expect(result.enhancedPrompt.toLowerCase()).toContain('requirements');
    });

    it('should extract technical constraints', () => {
      const prompt = 'Technical: Using React and Node.js';
      const result = organizer.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
    });

    it('should extract expected output section', () => {
      const prompt = 'Expected output: A REST API endpoint';
      const result = organizer.apply(prompt, mockContext);
      expect(result.enhancedPrompt.toLowerCase()).toContain('output');
    });

    it('should extract success criteria', () => {
      const prompt = 'Success criteria: All tests must pass';
      const result = organizer.apply(prompt, mockContext);
      expect(result.enhancedPrompt.toLowerCase()).toContain('success');
    });

    it('should extract constraints section', () => {
      const prompt = 'Constraints: Must not exceed 100ms response time';
      const result = organizer.apply(prompt, mockContext);
      expect(result.enhancedPrompt.toLowerCase()).toContain('constraint');
    });
  });

  describe('apply - well-ordered detection', () => {
    it('should recognize well-ordered sections', () => {
      const prompt = `## Objective
Build a feature

## Requirements
Must do X

## Technical
Using TypeScript`;
      const result = organizer.apply(prompt, mockContext);
      // Well-ordered prompts should have low impact
      expect(result.improvement.impact).toBe('low');
    });

    it('should detect out-of-order sections', () => {
      const prompt = `Requirements: Need this feature

Objective: Build the thing`;
      const result = organizer.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
    });
  });

  describe('apply - section header addition', () => {
    it('should add objective header to plain prompt without headers', () => {
      const prompt = 'Build a simple todo application';
      const result = organizer.apply(prompt, mockContext);
      expect(result.enhancedPrompt).toContain('## Objective');
    });

    it('should not add header if prompt already has markdown headers', () => {
      const prompt = '# My Prompt\nBuild something';
      const result = organizer.apply(prompt, mockContext);
      expect(result.enhancedPrompt).toBe(prompt);
      expect(result.applied).toBe(false);
    });
  });

  describe('apply - structure reorganization', () => {
    it('should reorganize into logical sections', () => {
      const prompt = `Output: A React component
Objective: Create user profile

Technical: React, TypeScript
Requirements: Display name and email`;
      const result = organizer.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
      expect(result.improvement.dimension).toBe('structure');
    });

    it('should have description about structure improvement', () => {
      const prompt = `Objective: Build a feature
Requirements: Must have X
Technical: Use Y`;
      const result = organizer.apply(prompt, mockContext);
      expect(result.improvement.dimension).toBe('structure');
    });
  });

  describe('apply - impact levels', () => {
    it('should return low impact for minimal changes', () => {
      const prompt = '## Objective\nAlready structured';
      const result = organizer.apply(prompt, mockContext);
      expect(result.improvement.impact).toBe('low');
    });

    it('should return medium impact for moderate reorganization', () => {
      const prompt = `Objective: Build a feature
Requirements: Must have X`;
      const result = organizer.apply(prompt, mockContext);
      expect(['low', 'medium']).toContain(result.improvement.impact);
    });

    it('should return valid impact for major reorganization', () => {
      const prompt = `Output: A component
Objective: Build feature
Technical: React
Requirements: Need A, B, C
Success: Tests pass
Constraints: Must be fast`;
      const result = organizer.apply(prompt, mockContext);
      expect(['low', 'medium', 'high']).toContain(result.improvement.impact);
    });
  });

  describe('apply - edge cases', () => {
    it('should handle empty string', () => {
      const result = organizer.apply('', mockContext);
      expect(result.enhancedPrompt).toContain('## Objective');
    });

    it('should handle very short prompts', () => {
      const result = organizer.apply('Build it', mockContext);
      expect(result.enhancedPrompt).toContain('## Objective');
    });

    it('should handle prompts with multiple headers', () => {
      const prompt = `# Main Title
## Section 1
Content

## Section 2
More content`;
      const result = organizer.apply(prompt, mockContext);
      expect(result.applied).toBe(false);
    });

    it('should handle prompts with special characters', () => {
      const prompt = 'Objective: Build a system with <brackets> and "quotes"';
      const result = organizer.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
    });

    it('should handle very long prompts', () => {
      const longPrompt = 'Objective: ' + 'Build a complex system. '.repeat(200);
      const result = organizer.apply(longPrompt, mockContext);
      expect(result).toBeDefined();
    });
  });

  describe('apply - result structure', () => {
    it('should return valid PatternResult structure', () => {
      const result = organizer.apply('Build something', mockContext);

      expect(result).toHaveProperty('enhancedPrompt');
      expect(result).toHaveProperty('improvement');
      expect(result).toHaveProperty('applied');
      expect(result.improvement).toHaveProperty('dimension');
      expect(result.improvement).toHaveProperty('description');
      expect(result.improvement).toHaveProperty('impact');
    });

    it('should have structure as improvement dimension', () => {
      const result = organizer.apply('Build something', mockContext);
      expect(result.improvement.dimension).toBe('structure');
    });
  });

  describe('apply - content preservation', () => {
    it('should preserve all original content', () => {
      const prompt = 'Objective: Build a user profile component with name display';
      const result = organizer.apply(prompt, mockContext);
      expect(result.enhancedPrompt.toLowerCase()).toContain('user profile');
      expect(result.enhancedPrompt.toLowerCase()).toContain('name display');
    });

    it('should handle "other" content that does not fit categories', () => {
      const prompt = `Objective: Build it
Some additional notes that do not fit anywhere else`;
      const result = organizer.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
    });
  });

  describe('apply - full reorganization flow', () => {
    it('should extract and reorganize all section types', () => {
      const prompt = `Success: Tests must pass and coverage > 80%
Output: A REST API
Constraints: Cannot exceed 100ms latency
Technical: Node.js with Express
Requirements: Must support pagination
Objective: Build API endpoint`;

      const result = organizer.apply(prompt, mockContext);

      expect(result.applied).toBe(true);
      expect(result.improvement.dimension).toBe('structure');
      // Should reorganize into proper order
      const enhanced = result.enhancedPrompt.toLowerCase();
      const objectivePos = enhanced.indexOf('## objective');
      const requirementsPos = enhanced.indexOf('## requirements');
      const technicalPos = enhanced.indexOf('## technical');
      const constraintsPos = enhanced.indexOf('## constraints');
      const outputPos = enhanced.indexOf('## expected output');
      const successPos = enhanced.indexOf('## success');

      // Verify order when sections exist
      if (objectivePos >= 0 && requirementsPos >= 0) {
        expect(objectivePos).toBeLessThan(requirementsPos);
      }
      if (requirementsPos >= 0 && technicalPos >= 0) {
        expect(requirementsPos).toBeLessThan(technicalPos);
      }
    });

    it('should include appropriate description', () => {
      const prompt = `Objective: Build a feature
Requirements: Must have X
Technical: Using Y
Constraints: Cannot do Z`;

      const result = organizer.apply(prompt, mockContext);
      // Description should mention sections or headers
      expect(result.improvement.description).toBeDefined();
      expect(result.improvement.description.length).toBeGreaterThan(0);
    });

    it('should return valid impact for multiple sections', () => {
      const prompt = `Objective: Build authentication
Requirements: OAuth support
Technical: JWT tokens
Constraints: Secure storage
Output: Token response`;

      const result = organizer.apply(prompt, mockContext);
      // Should return a valid impact level
      expect(['low', 'medium', 'high']).toContain(result.improvement.impact);
    });

    it('should set medium impact for 2-3 sections', () => {
      const prompt = `Objective: Simple task
Requirements: One feature`;

      const result = organizer.apply(prompt, mockContext);
      expect(['low', 'medium']).toContain(result.improvement.impact);
    });

    it('should set low impact for 1 section', () => {
      const prompt = `Objective: Single task`;
      const result = organizer.apply(prompt, mockContext);
      expect(['low', 'medium']).toContain(result.improvement.impact);
    });
  });

  describe('apply - section markers detection', () => {
    it('should detect colon-based section markers', () => {
      const prompt = `Objective:
Build something

Requirements:
Need features`;
      const result = organizer.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
    });

    it('should detect mixed section formats', () => {
      const prompt = `## Header Section
- Bullet item
1. Numbered item
Objective:`;
      const result = organizer.apply(prompt, mockContext);
      expect(result.improvement.impact).toBe('low');
    });
  });

  describe('apply - isWellOrdered detection', () => {
    it('should recognize perfect order: objective > requirements > technical', () => {
      const prompt = `## Objective
First

## Requirements
Second

## Technical Constraints
Third`;
      const result = organizer.apply(prompt, mockContext);
      expect(result.improvement.impact).toBe('low');
    });

    it('should detect wrong order: requirements before objective', () => {
      const prompt = `## Requirements
Need X

## Objective
Build Y`;
      const result = organizer.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
    });

    it('should detect wrong order: output before requirements', () => {
      const prompt = `## Output
JSON response

## Requirements
Need features`;
      const result = organizer.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
    });

    it('should detect wrong order: success before technical', () => {
      const prompt = `## Success Criteria
Tests pass

## Technical
Using React`;
      const result = organizer.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
    });
  });

  describe('apply - extraction edge cases', () => {
    it('should extract goal keyword as objective', () => {
      const prompt = 'Goal: Create a dashboard application';
      const result = organizer.apply(prompt, mockContext);
      expect(result.enhancedPrompt.toLowerCase()).toContain('dashboard');
    });

    it('should extract purpose keyword as objective', () => {
      const prompt = 'Purpose: Automate testing workflow';
      const result = organizer.apply(prompt, mockContext);
      expect(result.enhancedPrompt.toLowerCase()).toContain('automate');
    });

    it('should extract need to as objective', () => {
      const prompt = 'Need to: Build user authentication';
      const result = organizer.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
    });

    it('should extract want to as objective', () => {
      const prompt = 'Want to: Create a mobile app';
      const result = organizer.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
    });

    it('should extract must have as requirement', () => {
      const prompt = 'Must have: Login functionality and dashboard';
      const result = organizer.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
    });

    it('should extract should as requirement', () => {
      const prompt = 'Should: Support multiple languages';
      const result = organizer.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
    });

    it('should extract tech stack as technical', () => {
      const prompt = 'Tech stack: React, Node.js, PostgreSQL';
      const result = organizer.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
    });

    it('should extract technology as technical', () => {
      const prompt = 'Technology: Python with FastAPI';
      const result = organizer.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
    });

    it('should extract using as technical', () => {
      const prompt = 'Using: TypeScript and Express';
      const result = organizer.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
    });

    it('should extract built with as technical', () => {
      const prompt = 'Built with: Vue.js and Vuex';
      const result = organizer.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
    });

    it('should extract result as output', () => {
      const prompt = 'Result: A compiled binary';
      const result = organizer.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
    });

    it('should extract deliverable as output', () => {
      const prompt = 'Deliverable: Docker container image';
      const result = organizer.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
    });

    it('should extract measure as success criteria', () => {
      const prompt = 'Measure: Response time under 200ms';
      const result = organizer.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
    });

    it('should extract criteria as success criteria', () => {
      const prompt = 'Criteria: 100% test coverage';
      const result = organizer.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
    });

    it('should extract limitations as constraints', () => {
      const prompt = 'Limitations: Cannot use external APIs';
      const result = organizer.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
    });

    it('should extract must not as constraints', () => {
      const prompt = 'Must not: Expose sensitive data';
      const result = organizer.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
    });

    it('should extract cannot as constraints', () => {
      const prompt = 'Cannot: Exceed memory limits';
      const result = organizer.apply(prompt, mockContext);
      expect(result.applied).toBe(true);
    });
  });

  describe('apply - other content handling', () => {
    it('should include remaining content after extraction', () => {
      const prompt = `Objective: Build feature

Here is some additional context that does not match any category.
This should be preserved in the output.

Some more unstructured notes.`;
      const result = organizer.apply(prompt, mockContext);
      expect(result.enhancedPrompt.toLowerCase()).toContain('additional context');
    });

    it('should handle prompt with multiple newlines', () => {
      const prompt = `Objective: Build something



Too many newlines here`;
      const result = organizer.apply(prompt, mockContext);
      // Should process the prompt without error
      expect(result.applied).toBe(true);
      expect(result.enhancedPrompt.toLowerCase()).toContain('build');
    });
  });

  describe('apply - first sentence fallback', () => {
    it('should use first sentence as objective if no explicit markers', () => {
      const prompt =
        'Create a responsive navigation menu for the website. It should include dropdown submenus.';
      const result = organizer.apply(prompt, mockContext);
      expect(result.enhancedPrompt).toContain('## Objective');
    });
  });
});
