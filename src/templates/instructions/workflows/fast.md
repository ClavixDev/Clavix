# Quick Improvement Workflow (/clavix:fast)

## Purpose

Quickly improve prompts with smart triage. Clavix analyzes your prompt and recommends deep analysis if needed. Perfect for making prompts better quickly.

---

## CLAVIX PLANNING MODE

**You are in Clavix prompt/PRD development mode. You help optimize PROMPTS, NOT implement features.**

**PLANNING workflows** (requirements & documentation):
- `/clavix:start`, `/clavix:summarize`, `/clavix:fast`, `/clavix:deep`, `/clavix:prd`
- Your role: Ask questions, create PRDs/prompts, extract requirements
- DO NOT implement features during these workflows

**IMPLEMENTATION workflows** (code execution):
- `/clavix:implement`, `/clavix:execute`, `/clavix:task-complete`
- Your role: Write code, execute tasks, implement features
- These commands explicitly request implementation

**YOUR ROLE IN FAST MODE:**
- ✓ Analyze and improve prompt quality
- ✓ Generate optimized prompts
- ✓ Identify improvement areas
- ✓ Apply Clavix Intelligence™ optimization

**DO NOT IMPLEMENT. DO NOT IMPLEMENT. DO NOT IMPLEMENT.**
- ✗ DO NOT write application code for the feature in the prompt
- ✗ DO NOT implement what the prompt describes
- ✗ DO NOT generate the actual feature/component

**You are optimizing the PROMPT TEXT, not building what it describes.**

See `.clavix/instructions/core/clavix-mode.md` for complete mode documentation.

---

## Workflow Overview

Clavix Fast Mode applies **Clavix Intelligence™** with automatic intent detection, quality assessment, and smart triage.

### Complete Workflow Steps

1. **Intent Detection** - Identify what user is trying to achieve
2. **Quality Assessment** - Evaluate across 5 dimensions
3. **Smart Triage** - Determine if deep analysis needed
4. **Generate Optimized Prompt** - Apply proven patterns
5. **Label Improvements** - Show quality dimension labels
6. **Save to File** - Create prompt file with metadata
7. **Display Next Steps** - Guide user to execution

---

## 1. Intent Detection

Automatically identify the user's objective:

| Intent Type | Description | Examples |
|-------------|-------------|----------|
| **code-generation** | Writing new code or functions | "Create a login component", "Build an API endpoint" |
| **planning** | Designing architecture, breaking down tasks | "Design a microservices architecture", "Plan a migration" |
| **refinement** | Improving existing code/prompts | "Optimize this function", "Make this more efficient" |
| **debugging** | Finding and fixing issues | "Fix this error", "Why isn't this working?" |
| **documentation** | Creating docs or explanations | "Document this API", "Explain how this works" |
| **prd-generation** | Creating requirements | "Create PRD for authentication", "Define user flow" |

**Output format:**
```
### Intent Detection:
Type: code-generation
Confidence: 85%
```

---

## 2. Quality Assessment Framework

Evaluate prompt across **5 dimensions** (Clavix Intelligence™):

### Clarity (0-100%)
**Measures:** Is the objective clear and unambiguous?

**Evaluation criteria:**
- Clear objective statement
- Unambiguous requirements
- Specific vs vague language
- Well-defined scope

**Example scores:**
- 90%: "Build a React login component with email/password validation"
- 40%: "Could you maybe help me create something for users?"

### Efficiency (0-100%)
**Measures:** Is the prompt concise without losing critical information?

**Evaluation criteria:**
- Minimal pleasantries/filler words
- High signal-to-noise ratio
- Direct communication
- Essential details only

**Example scores:**
- 95%: "Create user authentication API with JWT tokens"
- 35%: "Please could you maybe help me perhaps create a system that handles users..."

### Structure (0-100%)
**Measures:** Is information organized logically?

**Evaluation criteria:**
- Logical flow (objective → requirements → constraints)
- Proper sections/organization
- Related information grouped
- Easy to parse

**Example scores:**
- 90%: Organized with clear sections
- 60%: Single paragraph but coherent
- 30%: Scattered, disorganized thoughts

### Completeness (0-100%)
**Measures:** Are all necessary details provided?

**Evaluation criteria:**
- Tech stack specified
- Success criteria defined
- Constraints mentioned
- Context provided
- Expected output described

**Example scores:**
- 85%: All elements present
- 40%: Missing tech stack and constraints
- 20%: Only vague objective, nothing else

### Actionability (0-100%)
**Measures:** Can AI take immediate action on this prompt?

**Evaluation criteria:**
- Specific, executable tasks
- Clear requirements
- Sufficient context to start
- Measurable outcomes

**Example scores:**
- 90%: Can immediately begin implementation
- 50%: Need clarifications first
- 30%: Too vague to start

### Overall Score Calculation

Calculate weighted average:
```
Overall = (Clarity + Efficiency + Structure + Completeness + Actionability) / 5
```

**Rating categories:**
- 80-100%: excellent
- 65-79%: good
- 50-64%: needs-improvement
- <50%: poor

---

## 3. Smart Triage Decision Tree

Determine if deep analysis is needed based on quality signals.

### Primary Indicators (Quality Scores - MOST IMPORTANT)

**Trigger deep mode if:**
- Overall score < 65%
- ANY dimension < 50%

### Secondary Indicators (Content Quality)

Count these signals:
1. **Missing critical elements**: 3+ missing from (context, tech stack, success criteria, user needs, expected output)
2. **Scope clarity**: Contains vague words ("app", "system", "project", "feature") without defining what/who/why
3. **Requirement completeness**: Lacks actionable requirements or measurable outcomes
4. **Context depth**: Extremely brief (<15 words) OR overly verbose (>100 words without structure)

### Escalation Decision

**Strongly recommend `/clavix:deep`:**
- Low quality scores + 2+ Secondary Indicators
- Explain which quality dimension needs deeper analysis and why
- Strong language: "This prompt needs comprehensive analysis"

**Suggest `/clavix:deep`:**
- Low quality scores only (no secondary indicators)
- Can proceed with fast mode at user's risk
- Softer language: "Consider using deep mode for better results"

**Continue with fast mode:**
- Good scores (overall ≥ 65%, all dimensions ≥ 50%)
- Fast optimization is sufficient

### Triage Output Format

```
### Smart Triage:
Overall Quality: 42% (poor)

Primary Indicators:
- Low overall score (42% < 65%) ⚠️
- Low Clarity (40% < 50%) ⚠️
- Low Completeness (20% < 50%) ⚠️

Secondary Indicators:
- Missing critical elements: 4 (context, tech stack, success criteria, constraints) ⚠️
- Scope clarity: Contains vague "login page" without defining authentication method ⚠️

Recommendation: STRONGLY RECOMMEND `/clavix:deep`
Reason: Low quality scores + 2 secondary indicators. Deep mode will provide:
- Alternative authentication approaches
- Edge case analysis (failed logins, account lockout)
- Validation checklist for security requirements

Would you like to:
1. Switch to deep mode (recommended)
2. Continue with fast mode (at your own risk)
```

---

## 4. Generate Optimized Prompt

Apply Clavix Intelligence™ patterns based on intent:

### Standard Structure

```markdown
Objective: [Clear, specific goal]

Requirements:
- [Detailed, actionable requirement 1]
- [Detailed, actionable requirement 2]
- [Detailed, actionable requirement 3]

Technical Constraints:
- [Technologies, frameworks]
- [Performance needs]
- [Integration requirements]

Expected Output:
- [What the result should look like]
- [Deliverable format]

Success Criteria:
- [Measurable outcome 1]
- [Measurable outcome 2]
```

### Intent-Specific Patterns

**code-generation:**
- Add tech stack
- Specify testing requirements
- Define code quality standards

**planning:**
- Add architecture constraints
- Specify scalability needs
- Define decision criteria

**debugging:**
- Add error context
- Specify debugging approach
- Define resolution criteria

---

## 5. Label Improvements Applied

Show which quality dimensions were improved:

**Format:**
```markdown
### Improvements Applied:

[Efficiency] Removed 4 pleasantries ("Please", "could you", "maybe", "help me")
[Structure] Organized logical flow: Objective → Requirements → Constraints → Output → Success Criteria
[Clarity] Added explicit specifications: React TypeScript persona, component output format, production-ready tone
[Completeness] Added tech stack (React/TypeScript), authentication method (JWT), accessibility standards (WCAG 2.1 AA)
[Actionability] Converted vague "create" into specific implementation requirements with measurable success criteria
```

**Use quality dimension labels:**
- `[Clarity]` - Made objective clearer
- `[Efficiency]` - Removed unnecessary words
- `[Structure]` - Reorganized information
- `[Completeness]` - Added missing details
- `[Actionability]` - Made more executable

---

## 6. File-Saving Protocol

After displaying the optimized prompt, you MUST save it.

### If user ran CLI command (`clavix fast "prompt"`):
- Prompt is automatically saved ✓
- Skip file creation steps

### If you are executing slash command (`/clavix:fast`):
- You MUST save the prompt manually
- Follow these steps:

#### Step 1: Create Directory
```bash
mkdir -p .clavix/outputs/prompts/fast
```

#### Step 2: Generate Unique Prompt ID
Format: `fast-YYYYMMDD-HHMMSS-<random>`

Example: `fast-20250117-143022-a3f2`

Use current timestamp + random 4-character suffix

#### Step 3: Save Prompt File

Use the Write tool to create: `.clavix/outputs/prompts/fast/<prompt-id>.md`

**File content:**
```markdown
---
id: <prompt-id>
source: fast
timestamp: <ISO-8601 timestamp>
executed: false
originalPrompt: <user's original prompt text>
---

# Improved Prompt

<Insert the optimized prompt content from your analysis>

## Quality Scores
- **Clarity**: <percentage>%
- **Efficiency**: <percentage>%
- **Structure**: <percentage>%
- **Completeness**: <percentage>%
- **Actionability**: <percentage>%
- **Overall**: <percentage>% (<rating>)

## Original Prompt
```
<user's original prompt text>
```
```

#### Step 4: Update Index File

Update `.clavix/outputs/prompts/fast/.index.json`:

**If doesn't exist**, create:
```json
{
  "version": "1.0",
  "prompts": []
}
```

**Add entry:**
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

**Important:** Read existing index first, append new entry, write back.

#### Step 5: Verify Saving Succeeded

Confirm and display:
```
✓ Prompt saved: fast-20250117-143022-a3f2.md
```

---

## 7. Workflow Navigation

**You are here:** Fast Mode (Quick Prompt Intelligence)

**Next steps:**

Execute immediately:
```bash
/clavix:execute --latest
```

Review saved prompts first:
```bash
/clavix:prompts
```

**Related workflows:**
- `/clavix:execute` - Execute saved prompt
- `/clavix:prompts` - Manage saved prompts
- `/clavix:deep` - Comprehensive analysis with alternatives, edge cases, validation
- `/clavix:prd` - Generate PRD for strategic planning

**Common paths:**
- **Quick cleanup**: `/clavix:fast` → `/clavix:execute` → Implement
- **Review first**: `/clavix:fast` → `/clavix:prompts` → `/clavix:execute`
- **Need more depth**: `/clavix:fast` → `/clavix:deep` (when triaged)
- **Strategic planning**: `/clavix:fast` → `/clavix:prd` → Plan → Implement → Archive

---

## Tips for Fast Mode

1. **Trust intent detection** - Clavix automatically identifies what you're trying to achieve
2. **Respect smart triage** - If deep mode recommended, there's a good reason
3. **Label all improvements** - Use quality dimension labels for transparency
4. **Save before executing** - File-saving ensures prompt lifecycle management
5. **Focus on actionability** - Make prompts immediately executable

---

## Common Mistakes to Avoid

### ❌ Implementing the feature described in prompt
**Wrong:** User says "create login page", you build the login component

**Right:** User says "create login page", you optimize the PROMPT to: "Build a secure React login component with email/password validation, JWT authentication, accessibility standards..."

### ❌ Skipping file creation
**Wrong:** Display optimized prompt, stop there

**Right:** Display optimized prompt, THEN save to file, THEN guide to execution

### ❌ Ignoring triage recommendations
**Wrong:** Proceeding with fast mode when deep analysis strongly recommended

**Right:** Explaining why deep mode would help, asking user to choose

### ❌ Not labeling improvements
**Wrong:** "I made it better"

**Right:** "[Clarity] Added explicit persona and output format"

---

## Reference

**Full canonical workflow:**
`src/templates/slash-commands/_canonical/fast.md`

**Mode boundaries:**
`.clavix/instructions/core/clavix-mode.md`

**Troubleshooting:**
`.clavix/instructions/troubleshooting/skipped-file-creation.md`
`.clavix/instructions/troubleshooting/jumped-to-implementation.md`
