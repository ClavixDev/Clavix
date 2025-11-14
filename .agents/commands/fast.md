---
name: "Clavix: Fast"
description: CLEAR-guided quick improvements (C, L, E components)
---

# Clavix Fast Mode - CLEAR Framework Quick Improvement

You are helping the user improve their prompt using Clavix's fast mode, which applies the CLEAR Framework (Concise, Logical, Explicit components) with smart triage.

## CLEAR Framework (Fast Mode)

**What is CLEAR?**
An academically-validated prompt engineering framework by Dr. Leo Lo (University of New Mexico).

**Fast Mode Uses:**
- **[C] Concise**: Remove verbosity, pleasantries, unnecessary words
- **[L] Logical**: Ensure coherent sequencing (context → requirements → constraints → output)
- **[E] Explicit**: Add persona, format, tone, success criteria

**Deep Mode Adds:** [A] Adaptive variations, [R] Reflective validation (use `/clavix:deep` for these)

## Instructions

1. Take the user's prompt: `{{ARGS}}`

2. **CLEAR Analysis** - Assess the prompt using three components:

   - **Conciseness [C]**: Identify verbose language, pleasantries ("please", "could you"), unnecessary qualifiers
   - **Logic [L]**: Check sequencing and flow - is information presented coherently?
   - **Explicitness [E]**: Verify specifications - persona, output format, tone, success criteria

3. **CLEAR-Aware Smart Triage**: Check if the prompt needs deep analysis:
   - Is it less than 20 characters?
   - Missing 3+ critical elements (context, tech stack, success criteria, user needs, expected output)?
   - Contains vague scope words ("app", "system", "project") without context?
   - **Low CLEAR scores** (Conciseness < 60%, Logic < 60%, Explicitness < 50%)

   If YES to any: **Recommend `/clavix:deep` instead** and explain which CLEAR component needs deeper analysis. Ask the user if they want to:
   - Switch to deep mode (recommended)
   - Continue with fast mode (at their own risk)

4. Generate a **CLEAR-optimized** structured prompt with these sections:
   **Objective**: Clear, specific goal
   **Requirements**: Detailed, actionable requirements
   **Technical Constraints**: Technologies, performance needs, integrations
   **Expected Output**: What the result should look like
   **Success Criteria**: How to measure completion

5. **CLEAR Changes Made**: List improvements with CLEAR component labels:
   - **[C]** "Removed 15 unnecessary words and pleasantries"
   - **[L]** "Restructured: context → requirements → constraints → output"
   - **[E]** "Added explicit persona (senior developer), output format (React component), tone (production-ready)"

6. Present the CLEAR-optimized prompt in a code block for easy copying.

## Fast Mode Features

✅ Include (CLEAR C, L, E):
- **CLEAR Assessment** (Conciseness, Logic, Explicitness scores with issues)
- Single CLEAR-optimized improved prompt
- **CLEAR Changes Made** (labeled with [C], [L], [E] components)
- Recommendation to use deep mode for Adaptive & Reflective components

❌ Skip (use `/clavix:deep` instead):
- **[A] Adaptive**: Alternative phrasings, structures, flexibility
- **[R] Reflective**: Validation checklists, edge cases, quality criteria
- Strategic analysis (architecture, security - that's for `/clavix:prd`)

## Example

If user provides: "Please could you maybe help me create a login page?"

Output:
```
## 🎯 CLEAR Analysis (Fast Mode)

### 📊 CLEAR Framework Assessment:

[C] Conciseness: 45%
    • 4 unnecessary pleasantries detected ("Please", "could you", "maybe", "help me")
    • Low signal-to-noise ratio (core request is only 4 words)

[L] Logic: 85%
    • Single request, coherent but minimal
    • Suggested flow: Context → Requirements → Constraints → Output

[E] Explicitness: 25%
    • Missing: persona, output format, tone, success criteria, technical constraints
    • No authentication context specified

Overall CLEAR Score: 51% (needs-improvement)

💡 Recommendation:
For Adaptive variations (A) and Reflective validation (R), use:
  clavix deep "<your prompt>"

### ✨ CLEAR-Optimized Prompt:

Objective: Build a secure user authentication login page

Requirements:
- Email and password input fields with validation
- "Remember me" checkbox
- "Forgot password" link
- Clear error messages for invalid credentials
- Responsive design for mobile and desktop

Technical Constraints:
- Use React with TypeScript
- Integrate with existing JWT authentication API
- Follow WCAG 2.1 AA accessibility standards

Expected Output:
- Fully functional login component
- Unit tests with >80% coverage

Success Criteria:
- Users can log in successfully
- Invalid credentials show appropriate errors
- Page is accessible via keyboard navigation

### 📝 CLEAR Changes Made:

[C] Removed 4 pleasantries ("Please", "could you", "maybe", "help me"), reduced from 11 words to core intent
[L] Structured logical flow: Objective → Requirements → Technical Constraints → Expected Output → Success Criteria
[E] Added explicit specifications: React TypeScript persona, component output format, production-ready tone, accessibility criteria
```

## Tips

- **Apply CLEAR framework** systematically: C, L, E components
- Use **CLEAR-aware triage** to prevent inadequate analysis
- Label all changes with CLEAR components for education
- For comprehensive analysis with [A] and [R], recommend `/clavix:deep`
- For strategic planning, recommend `/clavix:prd`
- Focus on making prompts **CLEAR** quickly
