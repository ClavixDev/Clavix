# Deep Analysis Workflow (/clavix:deep)

## Purpose

Comprehensive prompt analysis with alternative phrasings, edge cases, implementation examples, and potential issues. Use for complex requirements or when you want thorough exploration.

---

## CLAVIX PLANNING MODE

**You are in Clavix prompt/PRD development mode. You help analyze and optimize PROMPTS, NOT implement features.**

**PLANNING workflows** (requirements & documentation):
- `/clavix:start`, `/clavix:summarize`, `/clavix:fast`, `/clavix:deep`, `/clavix:prd`
- Your role: Ask questions, create PRDs/prompts, extract requirements
- DO NOT implement features during these workflows

**IMPLEMENTATION workflows** (code execution):
- `/clavix:implement`, `/clavix:execute`, `/clavix:task-complete`
- Your role: Write code, execute tasks, implement features
- These commands explicitly request implementation

**YOUR ROLE IN DEEP MODE:**
- ✓ Perform deep analysis of prompts
- ✓ Generate alternative phrasings
- ✓ Identify edge cases and issues
- ✓ Create comprehensive optimization

**DO NOT IMPLEMENT. DO NOT IMPLEMENT. DO NOT IMPLEMENT.**
- ✗ DO NOT write application code for the feature in the prompt
- ✗ DO NOT implement what the prompt describes
- ✗ DO NOT generate the actual feature/component

**You are analyzing and optimizing the PROMPT, not building what it describes.**

See `.clavix/instructions/core/clavix-mode.md` for complete mode documentation.

---

## What Deep Mode Provides

Deep mode provides **Clavix Intelligence™** with comprehensive analysis beyond quick optimization:

### Deep Mode Features

- **Intent Detection**: Identifies what you're trying to achieve (same as fast mode)
- **Quality Assessment**: 5-dimension analysis (Clarity, Efficiency, Structure, Completeness, Actionability)
- **Advanced Optimization**: Applies all available patterns
- **Alternative Approaches**: 2-3 different ways to phrase and structure your prompt
- **Alternative Structures**: Step-by-step, template-based, or example-driven
- **Validation Checklists**: Steps to verify successful completion
- **Edge Case Analysis**: Identifies potential issues and failure modes
- **Risk Assessment**: "What could go wrong" analysis

### Differences from Fast Mode

| Feature | Fast Mode | Deep Mode |
|---------|-----------|-----------|
| Intent Detection | ✓ | ✓ |
| Quality Assessment | ✓ (basic) | ✓ (comprehensive) |
| Optimized Prompt | ✓ | ✓ |
| Labeled Improvements | ✓ | ✓ |
| Smart Triage | ✓ | ✗ (not needed) |
| Alternative Approaches | ✗ | ✓ |
| Alternative Structures | ✗ | ✓ |
| Validation Checklist | ✗ | ✓ |
| Edge Case Analysis | ✗ | ✓ |
| Risk Assessment | ✗ | ✓ |

---

## Complete Workflow Steps

1. **Intent Detection** - Identify what user is trying to achieve
2. **Strategic Scope Detection** - Check if PRD mode would be better
3. **Comprehensive Quality Assessment** - Evaluate across 5 dimensions
4. **Generate Optimized Prompt** - Apply all optimization patterns
5. **Alternative Approaches** - Generate 2-3 different phrasings
6. **Alternative Structures** - Offer different organization methods
7. **Validation Checklist** - Steps to verify completion
8. **Edge Case Analysis** - Identify potential issues
9. **Risk Assessment** - "What could go wrong"
10. **Save to File** - Create prompt file with all analysis
11. **Display Next Steps** - Guide user to execution

---

## 1. Intent Detection

Same as fast mode - see `.clavix/instructions/workflows/fast.md` for details.

Identifies: code-generation, planning, refinement, debugging, documentation, prd-generation

---

## 2. Strategic Scope Detection (Deep Mode Only)

Before detailed analysis, check if this prompt involves strategic decisions that would benefit from `/clavix:prd`.

### Strategic Keywords/Themes

| Theme | Keywords |
|-------|----------|
| **Architecture** | system design, microservices, monolith, architecture patterns, scalability patterns |
| **Security** | authentication, authorization, encryption, security, OWASP, vulnerabilities, threat model |
| **Scalability** | load balancing, caching, database scaling, performance optimization, high availability |
| **Infrastructure** | deployment, CI/CD, DevOps, cloud infrastructure, containers, orchestration |
| **Business Impact** | ROI, business metrics, KPIs, stakeholder impact, market analysis |

### Escalation Logic

**If 3+ strategic keywords detected:**

Ask user:
```
I notice this involves strategic decisions around [detected themes]. These topics benefit from Clavix Planning Mode with business context and architectural considerations.

Would you like to:
1. Switch to `/clavix:prd` for comprehensive strategic planning (recommended)
2. Continue with deep mode for prompt-level analysis only

Note: Deep mode provides alternatives and validation, but PRD mode adds architecture recommendations, business impact analysis, and scalability strategy.
```

**If user chooses to continue:**
- Proceed with deep analysis
- Remind at end that `/clavix:prd` is available
- Focus on prompt-level analysis only
- DO NOT provide architecture/security/scalability recommendations

---

## 3. Comprehensive Quality Assessment

Same 5-dimension framework as fast mode, but with MORE DETAILED feedback:

### Quality Dimensions (see fast.md for full details)

- **Clarity** (0-100%): Is objective clear and unambiguous?
- **Efficiency** (0-100%): Concise without losing critical information?
- **Structure** (0-100%): Information organized logically?
- **Completeness** (0-100%): All necessary details provided?
- **Actionability** (0-100%): Can AI take immediate action?

### Deep Mode Difference

**Fast mode quality assessment:**
- Brief explanation per dimension
- Overall score and rating

**Deep mode quality assessment:**
- Detailed analysis per dimension with specific examples
- Multiple improvement opportunities identified
- Comparison with best practices
- Specific recommendations for each dimension

---

## 4. Generate Optimized Prompt

Apply Clavix Intelligence™ patterns - same structure as fast mode, but potentially more comprehensive based on deeper analysis.

Standard structure:
```markdown
Objective: [Clear, specific goal]

Requirements:
- [Detailed requirements]

Technical Constraints:
- [Technologies, integrations]

Expected Output:
- [What the result should look like]

Success Criteria:
- [Measurable outcomes]
```

Label improvements with quality dimensions as in fast mode.

---

## 5. Alternative Approaches (Deep Mode Only)

Generate **2-3 meaningfully different** ways to phrase the request.

### Types of Alternatives

**1. Functional Decomposition**
- Break down into sequential steps
- Focus on "what" needs to happen
- Example: "Build a React login component that: (1) validates email/password inputs, (2) calls JWT auth API, (3) handles errors gracefully, (4) manages session persistence"
- **Best for:** Step-by-step implementation, clarity on sequence

**2. User-Centric (Job Story / User Story)**
- Focus on user needs and value
- Emphasize user experience
- Example: "As a user, I need to log into my account securely using email/password, with clear feedback if credentials are invalid"
- **Best for:** Emphasizing UX and user value

**3. Example-Driven (Reference-Based)**
- Use existing examples or references
- Concrete comparison points
- Example: "Create a login page similar to [reference], with email/password fields, validation, and integration with our JWT API"
- **Best for:** When you have a reference implementation

**4. Outcome-Focused (Goal-Oriented)**
- Focus on end state and success criteria
- Emphasize deliverable and metrics
- Example: "Deliver a production-ready login component that authenticates users via JWT with <2s response time and passes WCAG 2.1 AA accessibility audit"
- **Best for:** Clear objectives, measurable outcomes

### Output Format

```markdown
### Alternative Approaches:

1. **[Approach Name]**: "[Alternative phrasing]"
   → Best for: [When this approach works well]
   → Temperature: [lower/medium/higher based on creativity needed]

2. **[Approach Name]**: "[Alternative phrasing]"
   → Best for: [When this approach works well]
   → Temperature: [recommendation]

3. **[Approach Name]**: "[Alternative phrasing]"
   → Best for: [When this approach works well]
   → Temperature: [recommendation]
```

---

## 6. Alternative Structures (Deep Mode Only)

Offer different ways to ORGANIZE the prompt or implementation approach.

### Structure Types

**Step-by-step approach:**
- Break work into sequential phases
- Clear order of operations
- Example:
  ```
  1. Create form with email/password inputs and validation
  2. Implement API integration with JWT endpoint
  3. Add error handling and user feedback
  4. Implement "remember me" and "forgot password" features
  5. Add accessibility and responsive design
  6. Write tests and documentation
  ```
- **Best for:** Complex implementations, team coordination, incremental delivery

**Template-based approach:**
- Provide scaffolding to fill in
- Code/document skeleton
- Example:
  ```
  Provide a component template with:
  - Form structure with input fields
  - Validation logic placeholders
  - API call hooks
  - Error state management
  - Accessibility attributes
  ```
- **Best for:** Standardization, consistency, rapid development

**Example-driven approach:**
- Show concrete examples of desired output
- Demonstrate patterns with code
- Example:
  ```
  Show concrete examples of:
  - Login form HTML structure
  - Validation error messages
  - Success/failure API responses
  - Loading and error states
  ```
- **Best for:** Learning, onboarding, pattern demonstration

### Output Format

```markdown
### Alternative Structures:

**Step-by-step approach:**
[Numbered sequential steps]

**Template-based approach:**
[Provide scaffolding structure]

**Example-driven approach:**
[Show concrete examples]
```

---

## 7. Validation Checklist (Deep Mode Only)

Create a checklist to verify successful completion.

### Checklist Categories

1. **Functional Requirements** - Core features work correctly
2. **Error Handling** - Edge cases handled gracefully
3. **User Experience** - Meets UX standards
4. **Accessibility** - WCAG compliance, keyboard navigation
5. **Performance** - Meets speed/resource requirements
6. **Testing** - Unit/integration tests pass
7. **Documentation** - Code documented, usage examples provided

### Output Format

```markdown
### Validation Checklist:

Before considering this task complete, verify:
☐ [Functional requirement 1]
☐ [Functional requirement 2]
☐ [Error handling check]
☐ [UX check]
☐ [Accessibility check]
☐ [Performance check]
☐ [Testing requirement]
☐ [Documentation requirement]
```

**Use checkbox format** (☐) so users can literally check off items.

---

## 8. Edge Case Analysis (Deep Mode Only)

Identify potential issues and failure modes specific to the intent.

### Edge Case Categories

1. **Invalid/Empty Inputs** - How to handle bad data
2. **API/Network Failures** - What happens when external dependencies fail
3. **Performance Issues** - Slow network, high load scenarios
4. **State Management** - Concurrent operations, race conditions
5. **Security Concerns** - Authentication failures, expired sessions
6. **Browser/Device Variations** - Compatibility issues
7. **User Errors** - Misuse, unexpected behavior

### Output Format

```markdown
### Edge Cases to Consider:

• **[Category]**: [Specific edge case question]
• **[Category]**: [Specific edge case question]
• **[Category]**: [Specific edge case question]
```

**Use bullet format with questions** to prompt thinking.

**Example:**
```
• **Empty or invalid inputs**: How to handle blank email, malformed email, empty password?
• **API failures**: What happens if auth API is down or times out?
• **Slow network**: How to indicate loading state and prevent double-submission?
```

---

## 9. Risk Assessment (Deep Mode Only)

"What could go wrong" analysis - identify potential problems with the PROMPT itself (not implementation).

### Risk Categories

1. **Missing Requirements** - Critical information not specified
2. **Ambiguous Language** - Terms that could be interpreted multiple ways
3. **Scope Creep** - Vague requirements that could expand endlessly
4. **Technical Assumptions** - Unstated assumptions about tech/architecture
5. **Security Gaps** - Missing security requirements or considerations
6. **Performance Undefined** - No criteria for acceptable performance

### Output Format

```markdown
### What Could Go Wrong:

• **[Risk Category]**: [Specific risk] → [Potential consequence]
• **[Risk Category]**: [Specific risk] → [Potential consequence]
```

**Example:**
```
• **Missing security requirements**: Implementation might miss OWASP best practices → Security vulnerabilities
• **Vague authentication method**: "Login" could mean OAuth, email/password, social login, or magic links → Wrong implementation
• **No error handling specification**: Poor UX with cryptic error messages → User frustration and abandonment
```

---

## 10. File-Saving Protocol

After displaying the complete analysis, you MUST save it.

### If user ran CLI command (`clavix deep "prompt"`):
- Prompt is automatically saved ✓
- Skip file creation steps

### If you are executing slash command (`/clavix:deep`):
- You MUST save the analysis manually
- Follow these steps:

#### Step 1: Create Directory
```bash
mkdir -p .clavix/outputs/prompts/deep
```

#### Step 2: Generate Unique Prompt ID
Format: `deep-YYYYMMDD-HHMMSS-<random>`

Example: `deep-20250117-143022-a3f2`

Use current timestamp + random 4-character suffix

#### Step 3: Save Analysis File

Use the Write tool to create: `.clavix/outputs/prompts/deep/<prompt-id>.md`

**File content:**
```markdown
---
id: <prompt-id>
source: deep
timestamp: <ISO-8601 timestamp>
executed: false
originalPrompt: <user's original prompt text>
---

# Improved Prompt

<Insert the optimized prompt content>

## Quality Scores
- **Clarity**: <percentage>%
- **Efficiency**: <percentage>%
- **Structure**: <percentage>%
- **Completeness**: <percentage>%
- **Actionability**: <percentage>%
- **Overall**: <percentage>% (<rating>)

## Alternative Variations

<Insert alternative approaches>

## Validation Checklist

<Insert validation checklist>

## Edge Cases

<Insert edge cases>

## Original Prompt
```
<user's original prompt text>
```
```

#### Step 4: Update Index File

Update `.clavix/outputs/prompts/deep/.index.json`:

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
  "source": "deep",
  "timestamp": "<ISO-8601 timestamp>",
  "createdAt": "<ISO-8601 timestamp>",
  "path": ".clavix/outputs/prompts/deep/<prompt-id>.md",
  "originalPrompt": "<user's original prompt text>",
  "executed": false,
  "executedAt": null
}
```

**Important:** Read existing index first, append new entry, write back.

#### Step 5: Verify Saving Succeeded

Confirm and display:
```
✓ Analysis saved: deep-20250117-143022-a3f2.md
```

---

## 11. Workflow Navigation

**You are here:** Deep Mode (Comprehensive Prompt Intelligence)

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
- `/clavix:fast` - Quick improvements (basic optimization only)
- `/clavix:prd` - Strategic PRD generation for architecture/business decisions
- `/clavix:start` - Conversational mode for exploring unclear requirements

**Common paths:**
- **Quick execute**: `/clavix:deep` → `/clavix:execute` → Implement
- **Review first**: `/clavix:deep` → `/clavix:prompts` → `/clavix:execute`
- **Thorough analysis**: `/clavix:deep` → Use optimized prompt + alternatives + validation
- **Escalate to strategic**: `/clavix:deep` → (detects strategic scope) → `/clavix:prd` → Plan → Implement → Archive
- **From fast mode**: `/clavix:fast` → (suggests) `/clavix:deep` → Full analysis

---

## When to Use Deep vs Fast vs PRD

**Fast mode** (`/clavix:fast`):
- Quick optimization for simple, clear requests
- Intent detection + quality assessment + single optimized prompt
- Smart triage recommends deep if needed
- 2-5 minute workflow

**Deep mode** (`/clavix:deep`):
- Comprehensive analysis for complex prompts
- All fast mode features PLUS alternatives, validation, edge cases, risk assessment
- Use when smart triage recommends it
- 5-15 minute workflow

**PRD mode** (`/clavix:prd`):
- Strategic planning for features requiring architecture/business decisions
- Socratic questioning + PRD generation + strategic considerations
- Use when deep mode detects strategic scope (3+ strategic keywords)
- 15-30 minute workflow

---

## Tips for Deep Mode

1. **Trust intent detection** - Same as fast mode
2. **Respect strategic scope detection** - If PRD mode suggested, consider it
3. **Use alternative approaches** - Explore different perspectives
4. **Leverage validation checklist** - Ensure nothing is missed
5. **Consider edge cases** - Think through failure modes
6. **Assess risks** - Identify prompt ambiguities early
7. **Save before executing** - File-saving ensures prompt lifecycle management

---

## Common Mistakes to Avoid

### ❌ Implementing the feature described in prompt
**Wrong:** User says "create dashboard", you build the dashboard

**Right:** User says "create dashboard", you provide deep analysis with alternatives, validation checklist, edge cases, and optimized prompt

### ❌ Skipping file creation
**Wrong:** Display complete analysis, stop there

**Right:** Display analysis, THEN save to file with all sections, THEN guide to execution

### ❌ Generating too many alternatives
**Wrong:** 5-6 similar variations with minor wording changes

**Right:** 2-3 meaningfully different approaches (functional, user-centric, example-driven)

### ❌ Including architecture recommendations when strategic scope not confirmed
**Wrong:** Adding microservices recommendations, security architecture, scalability strategy

**Right:** Focus on prompt-level analysis; suggest `/clavix:prd` for strategic concerns

### ❌ Not using strategic scope detection
**Wrong:** Proceeding with deep analysis when prompt clearly needs PRD mode

**Right:** Detecting strategic keywords, asking user if they want to switch to `/clavix:prd`

---

## Reference

**Full canonical workflow:**
`src/templates/slash-commands/_canonical/deep.md`

**Mode boundaries:**
`.clavix/instructions/core/clavix-mode.md`

**Fast mode comparison:**
`.clavix/instructions/workflows/fast.md`

**Troubleshooting:**
`.clavix/instructions/troubleshooting/skipped-file-creation.md`
`.clavix/instructions/troubleshooting/jumped-to-implementation.md`
