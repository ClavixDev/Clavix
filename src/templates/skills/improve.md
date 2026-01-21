---
name: clavix-improve
description: Analyze and optimize prompts using 6-dimension quality assessment
license: MIT
---

# Clavix Improve Skill

Analyze and optimize prompts with intelligent depth selection based on quality score.

## What This Skill Does

1. **Analyze prompt quality** - 6-dimension assessment (Clarity, Efficiency, Structure, Completeness, Actionability, Specificity)
2. **Select optimal depth** - Auto-choose standard vs comprehensive based on quality score
3. **Apply improvement patterns** - Transform using proven optimization techniques
4. **Generate optimized version** - Enhanced prompt with quality feedback
5. **Save for implementation** - Store in `.clavix/outputs/prompts/` for later use

---

## State Assertion (REQUIRED)

**Before starting analysis, output:**

```
**CLAVIX MODE: Improve**
Mode: planning
Purpose: Optimizing user prompt with pattern-based analysis
Depth: [standard|comprehensive] (auto-detected based on quality score)
Implementation: BLOCKED - I will analyze and improve the prompt, not implement it
```

---

## Self-Correction Protocol

**DETECT**: If you find yourself doing any of these 6 mistake types:

| Type | What It Looks Like |
|------|--------------------|
| 1. Implementation Code | Writing function/class definitions, creating components, generating API endpoints |
| 2. Skipping Quality Assessment | Not scoring all 6 dimensions, jumping to improved prompt without analysis |
| 3. Wrong Depth Selection | Not explaining why standard/comprehensive was chosen |
| 4. Incomplete Pattern Application | Not showing which patterns were applied |
| 5. Missing Depth Features | In comprehensive mode: missing alternatives, edge cases, or validation |
| 6. Capability Hallucination | Claiming features Clavix doesn't have, inventing pattern names |

**STOP**: Immediately halt the incorrect action

**CORRECT**: Output:
"I apologize - I was [describe mistake]. Let me return to prompt optimization."

**RESUME**: Return to the prompt optimization workflow with correct approach.

---

## Smart Depth Selection

Based on quality assessment score:

| Quality Score | Depth Selection | Rationale |
|---------------|-----------------|-----------|
| **≥ 75%** | Comprehensive (auto) | Prompt is good, add polish and enhancements |
| **60-74%** | User choice | Borderline quality, ask user preference |
| **< 60%** | Standard (auto) | Needs basic fixes first |

---

## Quality Dimensions

Evaluate across all 6 dimensions, score each 0-100%:

| Dimension | What It Measures |
|-----------|-----------------|
| **Clarity** | Is the objective clear and unambiguous? |
| **Efficiency** | Is the prompt concise without losing critical information? |
| **Structure** | Is information organized logically? |
| **Completeness** | Are all necessary details provided? |
| **Actionability** | Can AI take immediate action on this prompt? |
| **Specificity** | How concrete and precise? (versions, paths, identifiers) |

Calculate weighted overall score from all dimensions.

---

## Workflow

### Step 1: Intent Detection

Analyze what the user is trying to achieve:

- **code-generation**: Writing new code or functions
- **planning**: Designing architecture or breaking down tasks
- **refinement**: Improving existing code or prompts
- **debugging**: Finding and fixing issues
- **documentation**: Creating docs or explanations
- **prd-generation**: Creating requirements documents
- **testing**: Writing tests, improving test coverage
- **migration**: Version upgrades, porting code between frameworks
- **security-review**: Security audits, vulnerability checks
- **learning**: Conceptual understanding, tutorials, explanations
- **summarization**: Extracting requirements from conversations

### Step 2: Quality Assessment

Evaluate across all 6 dimensions and calculate overall score.

Display scores in table format:
```
| Dimension | Score |
|-----------|-------|
| Clarity | XX% |
| Efficiency | XX% |
| Structure | XX% |
| Completeness | XX% |
| Actionability | XX% |
| Specificity | XX% |
| **Overall** | XX% |
```

### Step 3: Depth Selection

Based on quality score, announce selection:

- **≥ 75%**: "Quality is good (XX%) - using comprehensive depth for polish"
- **60-74%**: Ask user to choose depth
- **< 60%**: "Quality is low (XX%) - using standard depth for basic fixes"

### Step 4: Generate Output

**Standard Depth Output Contract:**
- Intent Analysis (type, confidence)
- Quality Assessment (6 dimensions table)
- Optimized Prompt (with improvements applied)
- Improvements Applied (labeled with quality dimensions)
- Patterns Applied

**Comprehensive Depth Output Contract (includes all standard plus):**
- Alternative Approaches (2-3 different ways to phrase the request)
- Validation Checklist (steps to verify implementation)
- Edge Cases to Consider
- Risk Assessment ("What could go wrong" analysis)

### Step 5: Label Improvements

All improvements must be labeled with quality dimension tags:

```
- [Clarity] Made objective explicit and unambiguous
- [Efficiency] Removed 15 unnecessary phrases
- [Structure] Reorganized into logical sections
- [Completeness] Added missing technical constraints
- [Actionability] Added specific success criteria
- [Specificity] Added version numbers and file paths
```

---

## File-Saving Protocol

### Step 1: Generate ID

Format: `{depth}-YYYYMMDD-HHMMSS-{random4}`
- `std-20240115-143022-a7x2` for standard depth
- `comp-20240115-143022-b9k4` for comprehensive depth

### Step 2: Create Directory

```bash
mkdir -p .clavix/outputs/prompts
```

### Step 3: Save File

Path: `.clavix/outputs/prompts/{id}.md`

Content structure:
```yaml
---
id: {generated-id}
depthUsed: standard|comprehensive
timestamp: {ISO-8601 timestamp}
executed: false
originalPrompt: |
  {original user prompt text}
---

# Optimized Prompt

{The improved prompt content}

## Analysis Summary

Intent: {detected intent}
Quality: {before}% → {after}%
Patterns Applied: {list of patterns}
```

### Step 4: Verify After Write

**CRITICAL**: Use Read to confirm file exists and has valid content.

If verification fails:
- Retry save once
- If still fails, display prompt content for manual copy

---

## Example - Standard Depth

Input: "Please could you maybe help me create a login page?"

```
## Clavix Improve Analysis

### Depth Selection
Quality Score: 42% - Using standard depth for basic optimization

### Intent Detection
Type: code-generation
Confidence: 85%

### Quality Assessment

| Dimension | Score |
|-----------|-------|
| Clarity | 40% |
| Efficiency | 35% |
| Structure | 85% |
| Completeness | 20% |
| Actionability | 30% |
| Specificity | 25% |
| **Overall** | 42% |

### Optimized Prompt

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

### Improvements Applied

- [Clarity] Added specific objective statement
- [Completeness] Added missing requirements (remember me, forgot password)
- [Specificity] Added technical constraints (React, TypeScript, JWT)
- [Actionability] Added success criteria and expected output
- [Efficiency] Removed hedging language ("please could you maybe")

### Patterns Applied
- ObjectiveClarifier
- CompletenessValidator
- TechnicalContextEnricher
- SuccessCriteriaEnforcer
- ConcisenessFilter
```

---

## Example - Comprehensive Depth

For prompts scoring ≥75%, comprehensive output adds:

- **Alternative Approaches**: 2-3 different ways to achieve the goal
- **Validation Checklist**: Testable criteria for implementation
- **Edge Cases**: Unusual scenarios to handle
- **Risk Assessment**: What could go wrong and mitigations

---

## Mode Boundaries

**This mode DOES:**
- Analyze prompts for quality
- Apply improvement patterns
- Generate improved versions
- Provide quality assessments
- Save the optimized prompt
- **STOP** after improvement

**This mode does NOT:**
- Write application code for the feature
- Implement what the prompt describes
- Generate actual components/functions
- Modify files outside `.clavix/`
- Continue after showing the improved prompt

---

## Next Steps

After improvement is complete, guide user to:

| If... | Recommend |
|-------|-----------|
| Ready to implement | `/clavix-implement --latest` |
| Task is larger than expected | `/clavix-prd` for strategic planning |
| Want to iterate on prompt | `/clavix-refine` |

---

## Troubleshooting

### Prompt Not Saved

**Error: Cannot create directory**
```bash
mkdir -p .clavix/outputs/prompts
```

**Error: Invalid frontmatter**
- Re-save with valid YAML frontmatter
- Ensure id, timestamp, executed fields are present

### Wrong Depth Auto-Selected

**Cause**: Borderline quality score
**Solution**: User can override with explicit depth choice, or re-run

### Improved Prompt Still Feels Incomplete

**Cause**: Standard depth was used but comprehensive needed
**Solution**: Re-run with comprehensive depth or use `/clavix-prd` for strategic planning
