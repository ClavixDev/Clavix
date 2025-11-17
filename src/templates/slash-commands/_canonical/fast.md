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

3. **CLEAR-Aware Smart Triage**: Use multi-factor content-quality assessment to determine if deep analysis is needed:

   **Primary Indicators** (CLEAR scores - most important):
   - **Low CLEAR scores**: Conciseness < 60%, Logic < 60%, or Explicitness < 50%

   **Secondary Indicators** (content quality):
   - **Missing critical elements**: 3+ missing from (context, tech stack, success criteria, user needs, expected output)
   - **Scope clarity**: Contains vague words ("app", "system", "project", "feature") without defining what/who/why
   - **Requirement completeness**: Lacks actionable requirements or measurable outcomes
   - **Context depth**: Extremely brief (<15 words) OR overly verbose (>100 words without structure)

   **Escalation Decision**:
   - If **Low CLEAR scores** + **2+ Secondary Indicators**: **Strongly recommend `/clavix:deep`**
   - If **Low CLEAR scores** only: **Suggest `/clavix:deep`** but can proceed with fast mode
   - Explain which CLEAR component needs deeper analysis and why

   Ask the user:
   - Switch to deep mode (recommended when strongly recommended)
   - Continue with fast mode (acceptable for suggestion-level, but at their own risk for strong recommendation)

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

**Include (CLEAR C, L, E):**
- **CLEAR Assessment** (Conciseness, Logic, Explicitness scores with issues)
- Single CLEAR-optimized improved prompt
- **CLEAR Changes Made** (labeled with [C], [L], [E] components)
- Recommendation to use deep mode for Adaptive & Reflective components

**Skip (use `/clavix:deep` instead):**
- **[A] Adaptive**: Alternative phrasings, structures, flexibility
- **[R] Reflective**: Validation checklists, edge cases, quality criteria
- Strategic analysis (architecture, security - that's for `/clavix:prd`)

## Example

If user provides: "Please could you maybe help me create a login page?"

Output:
```
## CLEAR Analysis (Fast Mode)

### CLEAR Framework Assessment:

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

Recommendation:
For Adaptive variations (A) and Reflective validation (R), use:
  clavix deep "<your prompt>"

### CLEAR-Optimized Prompt:

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

### CLEAR Changes Made:

[C] Removed 4 pleasantries ("Please", "could you", "maybe", "help me"), reduced from 11 words to core intent
[L] Structured logical flow: Objective → Requirements → Technical Constraints → Expected Output → Success Criteria
[E] Added explicit specifications: React TypeScript persona, component output format, production-ready tone, accessibility criteria
```

## Next Steps (v2.7+)

### Saving the Prompt (REQUIRED)

After displaying the CLEAR-optimized prompt, you MUST save it to ensure it's available for the prompt lifecycle workflow.

**If user ran CLI command** (`clavix fast "prompt"`):
- Prompt is automatically saved ✓
- Skip to "Executing the Saved Prompt" section below

**If you are executing this slash command** (`/clavix:fast`):
- You MUST save the prompt manually
- Follow these steps:

#### Step 1: Create Directory Structure
```bash
mkdir -p .clavix/outputs/prompts/fast
```

#### Step 2: Generate Unique Prompt ID
Create a unique identifier using this format:
- **Format**: `fast-YYYYMMDD-HHMMSS-<random>`
- **Example**: `fast-20250117-143022-a3f2`
- Use current timestamp + random 4-character suffix

#### Step 3: Save Prompt File
Use the Write tool to create the prompt file at:
- **Path**: `.clavix/outputs/prompts/fast/<prompt-id>.md`

**File content format**:
```markdown
---
id: <prompt-id>
source: fast
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
- **Overall**: <percentage>% (<rating>)

## Original Prompt
```
<user's original prompt text>
```
```

#### Step 4: Update Index File
Use the Write tool to update the index at `.clavix/outputs/prompts/fast/.index.json`:

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
  "source": "fast",
  "timestamp": "<ISO-8601 timestamp>",
  "createdAt": "<ISO-8601 timestamp>",
  "path": ".clavix/outputs/prompts/fast/<prompt-id>.md",
  "originalPrompt": "<user's original prompt text>",
  "executed": false,
  "executedAt": null
}
```

**Important**: Read the existing index first, append the new entry to the `prompts` array, then write the updated index back.

#### Step 5: Verify Saving Succeeded
Confirm:
- File exists at `.clavix/outputs/prompts/fast/<prompt-id>.md`
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
clavix prompts clear --fast
```

## Workflow Navigation

**You are here:** Fast Mode (Quick CLEAR Improvement)

**Common workflows:**
- **Quick cleanup**: `/clavix:fast` → `/clavix:execute` → Implement
- **Review first**: `/clavix:fast` → `/clavix:prompts` → `/clavix:execute`
- **Need more depth**: `/clavix:fast` → (suggests) `/clavix:deep` → Comprehensive analysis
- **Strategic planning**: `/clavix:fast` → (suggests) `/clavix:prd` → Plan → Implement → Archive

**Related commands:**
- `/clavix:execute` - Execute saved prompt
- `/clavix:prompts` - Manage saved prompts
- `/clavix:deep` - Full CLEAR analysis (all 5 components: C, L, E, A, R)
- `/clavix:prd` - Generate PRD for strategic planning
- `/clavix:start` - Conversational exploration before prompting

## Tips

- **Apply CLEAR framework** systematically: C, L, E components
- Use **CLEAR-aware triage** to prevent inadequate analysis
- Label all changes with CLEAR components for education
- For comprehensive analysis with [A] and [R], recommend `/clavix:deep`
- For strategic planning, recommend `/clavix:prd`
- Focus on making prompts **CLEAR** quickly

## Troubleshooting

### Issue: Prompt Not Saved

**Error: Cannot create directory**
```bash
mkdir -p .clavix/outputs/prompts/fast
```

**Error: Index file corrupted or invalid JSON**
```bash
echo '{"version":"1.0","prompts":[]}' > .clavix/outputs/prompts/fast/.index.json
```

**Error: Duplicate prompt ID**
- Generate a new ID with a different timestamp or random suffix
- Retry the save operation with the new ID

**Error: File write permission denied**
- Check directory permissions
- Ensure `.clavix/` directory is writable
- Try creating the directory structure again

### Issue: Triage keeps recommending deep mode
**Cause**: Prompt has low CLEAR scores + multiple secondary indicators
**Solution**:
- Accept the recommendation - deep mode will provide better analysis
- OR improve prompt manually before running fast mode again
- Check which CLEAR component is scoring low and address it

### Issue: Can't determine if prompt is complex enough for deep mode
**Cause**: Borderline CLEAR scores or unclear content quality
**Solution**:
- Err on side of fast mode first
- If output feels insufficient, escalate to `/clavix:deep`
- Use triage as guidance, not absolute rule

### Issue: Improved prompt still feels incomplete
**Cause**: Fast mode only applies C, L, E components
**Solution**:
- Use `/clavix:deep` for Adaptive variations and Reflective validation
- OR use `/clavix:prd` if strategic planning is needed
- Fast mode is for quick cleanup, not comprehensive analysis
