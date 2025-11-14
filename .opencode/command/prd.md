---
name: "Clavix: PRD"
description: CLEAR-validated PRD generation through Socratic questioning
---

# Clavix PRD Generation - CLEAR Framework Validated

You are helping the user create a Product Requirements Document (PRD) using Clavix's Socratic questioning approach. **Generated PRDs are automatically validated using the CLEAR Framework** (Concise, Logical, Explicit) for AI consumption quality.

## Instructions

1. Guide the user through these strategic questions, one at a time:

   **Question 1**: 🎯 What are we building and why? (Problem + goal in 2-3 sentences)

   **Question 2**: ⚡ What are the must-have core features? (List 3-5 critical features)

   **Question 3**: 🔧 Tech stack and requirements? (Technologies, integrations, constraints - press Enter to skip if extending existing project)

   **Question 4**: 🚫 What is explicitly OUT of scope? (What are we NOT building?)

   **Question 5**: 💡 Any additional context or requirements? (Optional - press Enter to skip)

2. After collecting all answers, generate TWO documents:

   **Full PRD** (comprehensive):
   ```markdown
   # Product Requirements Document: [Project Name]

   ## Problem & Goal
   [User's answer to Q1]

   ## Requirements
   ### Must-Have Features
   [User's answer to Q2, expanded with details]

   ### Technical Requirements
   [User's answer to Q3, detailed]

   ## Out of Scope
   [User's answer to Q4]

   ## Additional Context
   [User's answer to Q5 if provided]
   ```

   **Quick PRD** (2-3 paragraphs, AI-optimized):
   ```markdown
   [Concise summary combining problem, goal, and must-have features from Q1+Q2]

   [Technical requirements and constraints from Q3]

   [Out of scope and additional context from Q4+Q5]
   ```

3. Save both documents to `.clavix/outputs/[project-name]/`

4. **CLEAR Framework Validation** (automatic):
   - After PRD generation, the quick-prd.md is analyzed using CLEAR framework
   - Assesses AI consumption quality (Conciseness, Logic, Explicitness)
   - Displays CLEAR scores and improvement suggestions
   - Only C, L, E components apply (Adaptive & Reflective not applicable to PRDs)

5. Display file paths, CLEAR validation results, and suggest next steps.

## CLEAR Validation

**What gets validated:**
- **[C] Concise**: Is the PRD focused and to-the-point for AI agents?
- **[L] Logical**: Does information flow coherently (context → requirements → constraints)?
- **[E] Explicit**: Are specifications, formats, and success criteria clear?

**Note:** Adaptive (A) and Reflective (R) components are not applicable to PRDs. For prompt-level CLEAR analysis with all 5 components, use `/clavix:deep` instead.

## Tips

- Ask follow-up questions if answers are too vague
- Help users think through edge cases
- Keep the process conversational and supportive
- Generated PRDs are automatically CLEAR-validated for optimal AI consumption
