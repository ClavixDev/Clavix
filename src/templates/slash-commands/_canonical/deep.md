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

1. Take the user's prompt: `{{ARGS}}`

2. **Apply Full CLEAR Framework** (C, L, E, A, R):

   - **Conciseness [C]**: Detailed verbosity analysis
   - **Logic [L]**: Comprehensive flow analysis
   - **Explicitness [E]**: Complete specification check
   - **Adaptiveness [A]**: Multiple variations and approaches
   - **Reflectiveness [R]**: Full validation and edge case analysis

3. **Strategic Scope Detection** (before detailed analysis):

   **Check for strategic concerns** by identifying keywords/themes:
   - **Architecture**: system design, microservices, monolith, architecture patterns, scalability patterns
   - **Security**: authentication, authorization, encryption, security, OWASP, vulnerabilities, threat model
   - **Scalability**: load balancing, caching, database scaling, performance optimization, high availability
   - **Infrastructure**: deployment, CI/CD, DevOps, cloud infrastructure, containers, orchestration
   - **Business Impact**: ROI, business metrics, KPIs, stakeholder impact, market analysis

   **If 3+ strategic keywords detected**:
   Ask the user: "I notice this involves strategic decisions around [detected themes]. These topics benefit from PRD-style planning with business context and architectural considerations. Would you like to:
   - Switch to `/clavix:prd` for comprehensive strategic planning (recommended)
   - Continue with deep mode for prompt-level analysis only"

   **If user chooses to continue**, proceed with deep analysis but remind them at the end that `/clavix:prd` is available for strategic planning.

4. **Generate Comprehensive Output**:

   a. **CLEAR Assessment** (all 5 components with scores)

   b. **CLEAR-Optimized Prompt** (applying all components)

   c. **CLEAR Changes Made** (labeled with [C], [L], [E], [A], [R])

   d. **Adaptive Variations [A]**:
      - 2-3 alternative phrasings
      - Alternative structures (user story, job story, structured)
      - Temperature recommendations
      - Explain when each approach is most appropriate

   e. **Reflection Checklist [R]**:
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

**Include (Full CLEAR Framework):**
- **[C, L, E]**: All fast mode analysis (conciseness, logic, explicitness)
- **[A] Adaptive**: Alternative phrasings, structures, flexibility, temperature
- **[R] Reflective**: Validation checklist, edge cases, quality criteria, fact-checking
- **CLEAR Assessment**: All 5 component scores
- **CLEAR-labeled Changes**: Educational feedback showing which component improved what

**Do NOT include (these belong in `/clavix:prd`):**
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
**Good:**
- Prompt specifies authentication method, error handling, and accessibility requirements
- Includes context about existing auth system and integration points
- Defines measurable success criteria (load time, accessibility score)

**Bad:**
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

## Next Steps (v2.7+)

### Saving the Prompt (REQUIRED)

After displaying the CLEAR-optimized prompt, you MUST save it to ensure it's available for the prompt lifecycle workflow.

**If user ran CLI command** (`clavix deep "prompt"`):
- Prompt is automatically saved ✓
- Skip to "Executing the Saved Prompt" section below

**If you are executing this slash command** (`/clavix:deep`):
- You MUST save the prompt manually
- Follow these steps:

#### Step 1: Create Directory Structure
```bash
mkdir -p .clavix/outputs/prompts/deep
```

#### Step 2: Generate Unique Prompt ID
Create a unique identifier using this format:
- **Format**: `deep-YYYYMMDD-HHMMSS-<random>`
- **Example**: `deep-20250117-143022-a3f2`
- Use current timestamp + random 4-character suffix

#### Step 3: Save Prompt File
Use the Write tool to create the prompt file at:
- **Path**: `.clavix/outputs/prompts/deep/<prompt-id>.md`

**File content format**:
```markdown
---
id: <prompt-id>
source: deep
timestamp: <ISO-8601 timestamp>
executed: false
originalPrompt: <user's original prompt text>
---

# Improved Prompt

<Insert the CLEAR-optimized prompt content from your analysis above>

## CLEAR Scores
- **C** (Conciseness): <percentage>%
- **L** (Logic): <percentage>%
- **E** (Explicitness): <percentage>%
- **A** (Adaptiveness): <percentage>%
- **R** (Reflectiveness): <percentage>%
- **Overall**: <percentage>% (<rating>)

## Alternative Variations

<Insert adaptive variations from your analysis>

## Reflection Checklist

<Insert reflective validation from your analysis>

## Original Prompt
```
<user's original prompt text>
```
```

#### Step 4: Update Index File
Use the Write tool to update the index at `.clavix/outputs/prompts/deep/.index.json`:

**If index file doesn't exist**, create it with:
```json
{
  "version": "1.0",
  "prompts": []
}
```

**Then add a new metadata entry** to the `prompts` array:
```json
{
  "id": "<prompt-id>",
  "filename": "<prompt-id>.md",
  "source": "deep",
  "timestamp": "<ISO-8601 timestamp>",
  "createdAt": "<ISO-8601 timestamp>",
  "path": ".clavix/outputs/prompts/deep/<prompt-id>.md",
  "originalPrompt": "<user's original prompt text>",
  "executed": false,
  "executedAt": null
}
```

**Important**: Read the existing index first, append the new entry to the `prompts` array, then write the updated index back.

#### Step 5: Verify Saving Succeeded
Confirm:
- File exists at `.clavix/outputs/prompts/deep/<prompt-id>.md`
- Index file updated with new entry
- Display success message: `✓ Prompt saved: <prompt-id>.md`

### Executing the Saved Prompt

After saving completes successfully:

**Execute immediately:**
```bash
/clavix:execute --latest
```

**Review saved prompts first:**
```bash
/clavix:prompts
```

**Cleanup old prompts:**
```bash
clavix prompts clear --deep
```

## Workflow Navigation

**You are here:** Deep Mode (Comprehensive CLEAR Analysis)

**Common workflows:**
- **Quick execute**: `/clavix:deep` → `/clavix:execute` → Implement
- **Review first**: `/clavix:deep` → `/clavix:prompts` → `/clavix:execute`
- **Thorough analysis**: `/clavix:deep` → Use optimized prompt + alternatives
- **Escalate to strategic**: `/clavix:deep` → (detects strategic scope) → `/clavix:prd` → Plan → Implement → Archive
- **From fast mode**: `/clavix:fast` → (suggests) `/clavix:deep` → Full analysis with A & R components

**Related commands:**
- `/clavix:execute` - Execute saved prompt
- `/clavix:prompts` - Manage saved prompts
- `/clavix:fast` - Quick CLEAR improvements (C, L, E only)
- `/clavix:prd` - Strategic PRD generation for architecture/business decisions
- `/clavix:start` - Conversational mode for exploring unclear requirements

## Tips

- **Apply full CLEAR framework** systematically: all 5 components
- Label all changes with CLEAR components for education
- Deep mode focuses on **prompt-level** CLEAR analysis, not strategic architecture
- Use **[A] Adaptive** to explore alternative approaches
- Use **[R] Reflective** to identify edge cases and validation needs
- For architecture, security, and scalability, recommend `/clavix:prd`

## Troubleshooting

### Issue: Prompt Not Saved

**Error: Cannot create directory**
```bash
mkdir -p .clavix/outputs/prompts/deep
```

**Error: Index file corrupted or invalid JSON**
```bash
echo '{"version":"1.0","prompts":[]}' > .clavix/outputs/prompts/deep/.index.json
```

**Error: Duplicate prompt ID**
- Generate a new ID with a different timestamp or random suffix
- Retry the save operation with the new ID

**Error: File write permission denied**
- Check directory permissions
- Ensure `.clavix/` directory is writable
- Try creating the directory structure again

### Issue: Strategic scope detected but user wants to continue with deep mode
**Cause**: User prefers deep analysis over PRD generation
**Solution**:
- Proceed with deep mode as requested
- Remind at end that `/clavix:prd` is available for strategic planning
- Focus on prompt-level CLEAR analysis, exclude architecture recommendations

### Issue: Too many alternative variations making output overwhelming
**Cause**: Adaptive component generating many options
**Solution**:
- Limit to 2-3 most distinct alternatives
- Focus on meaningfully different approaches (not minor wording changes)
- Group similar variations together

### Issue: Reflective validation finding too many edge cases
**Cause**: Complex prompt with many potential failure modes
**Solution**:
- Prioritize most likely or highest-impact edge cases
- Group related edge cases
- Suggest documenting all edge cases in PRD for complex projects

### Issue: Deep analysis still feels insufficient for complex project
**Cause**: Project needs strategic planning, not just prompt analysis
**Solution**:
- Switch to `/clavix:prd` for comprehensive planning
- Deep mode is for prompts, PRD mode is for projects
- Use PRD workflow: PRD → Plan → Implement
