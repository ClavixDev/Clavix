---
description: Full CLEAR framework analysis (C, L, E, A, R components)
---

---
name: "Clavix: Deep"
description: Full CLEAR framework analysis (C, L, E, A, R components)
---

# Clavix Deep Mode - Full CLEAR Framework Analysis

You are helping the user perform a comprehensive deep analysis using the full CLEAR Framework (all 5 components: Concise, Logical, Explicit, Adaptive, Reflective).

## CLEAR Framework (Deep Mode)

**What is CLEAR?**
An academically-validated prompt engineering framework by Dr. Leo Lo (University of New Mexico).

**Deep Mode Uses ALL Components:**
- **[C] Concise**: Remove verbosity, pleasantries, unnecessary words
- **[L] Logical**: Ensure coherent sequencing (context → requirements → constraints → output)
- **[E] Explicit**: Add persona, format, tone, success criteria
- **[A] Adaptive**: Generate alternative phrasings, structures, flexibility
- **[R] Reflective**: Create validation checklists, edge cases, quality criteria

## Instructions

1. Take the user's prompt: `$ARGUMENTS`

2. **Apply Full CLEAR Framework** (C, L, E, A, R):

   - **Conciseness [C]**: Detailed verbosity analysis
   - **Logic [L]**: Comprehensive flow analysis
   - **Explicitness [E]**: Complete specification check
   - **Adaptiveness [A]**: Multiple variations and approaches
   - **Reflectiveness [R]**: Full validation and edge case analysis

3. **Generate Comprehensive Output**:

   a. **📊 CLEAR Assessment** (all 5 components with scores)

   b. **✨ CLEAR-Optimized Prompt** (applying all components)

   c. **📝 CLEAR Changes Made** (labeled with [C], [L], [E], [A], [R])

   d. **🔄 Adaptive Variations [A]**:
      - 2-3 alternative phrasings
      - Alternative structures (user story, job story, structured)
      - Temperature recommendations
      - Explain when each approach is most appropriate

   e. **🤔 Reflection Checklist [R]**:
      - Validation steps for accuracy
      - Edge cases to consider
      - "What could go wrong" analysis
      - Fact-checking steps
      - Quality criteria

4. **CLEAR-labeled educational feedback**:
   - Label all changes with CLEAR component tags
   - Example: "[C] Removed 15 unnecessary pleasantries"
   - Example: "[A] See Alternative Structures for 3 different approaches"
   - Example: "[R] See Reflection Checklist for 5 validation steps"

5. Present everything in comprehensive, CLEAR-organized format.

## Deep Mode Features

✅ Include (Full CLEAR Framework):
- **[C, L, E]**: All fast mode analysis (conciseness, logic, explicitness)
- **[A] Adaptive**: Alternative phrasings, structures, flexibility, temperature
- **[R] Reflective**: Validation checklist, edge cases, quality criteria, fact-checking
- **CLEAR Assessment**: All 5 component scores
- **CLEAR-labeled Changes**: Educational feedback showing which component improved what

❌ Do NOT include (these belong in `/clavix:prd`):
- System architecture recommendations
- Security best practices
- Scalability strategy
- Business impact analysis

## Example

If user provides: "Create a login page"

Output:
```
## Analysis
[All fast mode analysis: gaps, ambiguities, strengths, suggestions]

## Changes Made
- Added authentication context and user needs
- Specified technical stack and constraints
- Defined success criteria and expected output

## Alternative Phrasings
1. "Implement a user authentication interface that enables secure access to the platform"
2. "Design and build a login system that validates user credentials and manages sessions"
3. "Create an authentication flow that allows registered users to access their accounts"

## Edge Cases to Consider
- What happens when a user enters incorrect credentials 3+ times?
- How to handle users who've forgotten both email and password?
- What about users trying to log in from a new device?
- How to handle session expiration during active use?

## Implementation Examples
✅ Good:
- Prompt specifies authentication method, error handling, and accessibility requirements
- Includes context about existing auth system and integration points
- Defines measurable success criteria (load time, accessibility score)

❌ Bad:
- "Make a login page" - no context, constraints, or success criteria
- Missing technical stack and integration requirements
- No consideration of security or user experience

## Alternative Prompt Structures
1. **User Story**: "As a registered user, I want to log into my account so that I can access my personalized dashboard"
   → Focuses on user value and benefits

2. **Job Story**: "When I visit the app, I want to authenticate securely, so I can access my saved data"
   → Emphasizes context and motivation

3. **Structured Sections**: Objective, Requirements, Constraints, Success Criteria
   → Provides comprehensive organization

## What Could Go Wrong
- Without security requirements, implementation might miss OWASP best practices
- Vague "login page" could be interpreted as OAuth, email/password, or social login
- Missing error handling specification could lead to poor UX
- No accessibility requirements might exclude users with disabilities

## Improved Prompt
[Structured prompt with all sections]
```

## When to Use Deep vs Fast vs PRD

- **Fast mode** (`/clavix:fast`): C, L, E components - quick CLEAR cleanup
- **Deep mode** (`/clavix:deep`): Full CLEAR (C, L, E, A, R) - comprehensive analysis with alternatives and validation
- **PRD mode** (`/clavix:prd`): CLEAR-validated PRD generation - strategic planning with architecture decisions

## Tips

- **Apply full CLEAR framework** systematically: all 5 components
- Label all changes with CLEAR components for education
- Deep mode focuses on **prompt-level** CLEAR analysis, not strategic architecture
- Use **[A] Adaptive** to explore alternative approaches
- Use **[R] Reflective** to identify edge cases and validation needs
- For architecture, security, and scalability, recommend `/clavix:prd`
