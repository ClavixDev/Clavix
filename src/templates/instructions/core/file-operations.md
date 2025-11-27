# File Operations: Step-by-Step Patterns

## Overview

This guide provides proven patterns for file creation in Clavix workflows. These patterns ensure files are actually created (not just "suggested") and verified.

---

## The Proven Pattern (Copy This)

### Complete File Creation Workflow

```markdown
**Step 1: Create Directory Structure**

Use mkdir to create the output directory:
```bash
mkdir -p .clavix/outputs/[project-name]
```

**Step 2: Write First File**

Use the Write tool to create `.clavix/outputs/[project-name]/file-name.md` with this content:

[Provide exact content template here]

**Step 3: Write Second File**

Use the Write tool to create `.clavix/outputs/[project-name]/another-file.md` with this content:

[Provide exact content template here]

**Step 4: Verify File Creation**

List the created files to confirm they exist:
```
Created files:
✓ .clavix/outputs/[project-name]/file-name.md
✓ .clavix/outputs/[project-name]/another-file.md
```

**CHECKPOINT:** Files created successfully.
```

---

## Why This Pattern Works

### ✅ Effective Elements

1. **Numbered steps** - Clear sequence prevents skipping steps
2. **Imperative language** - "Use the Write tool" not "You could save"
3. **Explicit tool names** - "Write tool" not vague "create" or "save"
4. **Content templates** - Show exactly what goes in each file
5. **Verification step** - Confirm files exist
6. **Checkpoint marker** - Enables validation

### ❌ What Doesn't Work

1. ~~"Suggest saving to..."~~ - Too passive, agents skip it
2. ~~"If filesystem access available"~~ - Makes it optional
3. ~~"Save outputs:"~~ - Doesn't specify HOW
4. ~~No verification~~ - Can't detect failure
5. ~~Visual markers only~~ - Agents don't process emoji as semantic content

---

## Pattern Variations

### Single File Creation

```markdown
**Create Output File (REQUIRED)**

**Step 1: Create directory**
```bash
mkdir -p .clavix/outputs/[project-name]
```

**Step 2: Write file**
Use the Write tool to create `.clavix/outputs/[project-name]/output.md`:

```markdown
# [Project Name]

[Content here]
```

**Step 3: Verify file exists**
Confirm file created: `.clavix/outputs/[project-name]/output.md` ✓

**CHECKPOINT:** File created successfully.
```

---

### Multiple Files with Templates

```markdown
**Create Output Files (REQUIRED)**

You MUST create three files. This is not optional.

**Step 1: Create directory structure**
```bash
mkdir -p .clavix/outputs/[project-name]
```

**Step 2: Write mini-prd.md**
Use the Write tool to create `.clavix/outputs/[project-name]/mini-prd.md`

Content template:
```markdown
# Requirements: [Project Name]

## Objective
[Clear goal]

## Core Requirements
- [HIGH] Requirement 1
- [MEDIUM] Requirement 2

## Technical Constraints
[Constraints]

## Success Criteria
[Criteria]
```

**Step 3: Write original-prompt.md**
Use the Write tool to create `.clavix/outputs/[project-name]/original-prompt.md`

Content: [Raw extraction in paragraph form]

**Step 4: Write optimized-prompt.md**
Use the Write tool to create `.clavix/outputs/[project-name]/optimized-prompt.md`

Content: [Enhanced version with labeled improvements]

**Step 5: Verify all files exist**
List created files:
```
✓ .clavix/outputs/[project-name]/mini-prd.md
✓ .clavix/outputs/[project-name]/original-prompt.md
✓ .clavix/outputs/[project-name]/optimized-prompt.md
```

**CHECKPOINT:** All files created successfully.
```

---

### Timestamped Prompts

```markdown
**Step 1: Generate prompt timestamp**
Create timestamp: `YYYYMMDD-HHMMSS` format (e.g., `20251124-143022`)

**Step 2: Create prompt file**
Use the Write tool to create `.clavix/outputs/prompts/std-[timestamp]-[random].md`

---
id: std-[timestamp]-[random]
depthUsed: standard|comprehensive
timestamp: [ISO-8601]
executed: false
---

# Improved Prompt

[Content here]

**Step 3: Verify**
Confirm: `.clavix/outputs/prompts/std-[timestamp]-[random].md` ✓
```

---

## Troubleshooting File Creation

### Problem: Files Not Created

**Symptoms:**
- Agent says "files created" but they don't exist
- Agent provides content in chat instead of creating files
- Agent skips file creation step entirely

**Solution:**
1. Check instructions use **imperative language**: "You MUST create" not "Suggest saving"
2. Verify **step-by-step pattern** is present
3. Ensure **Write tool** is explicitly named
4. Add **verification step** to detect failure
5. Make step ordering clear: Create directory → Write files → Verify

**See:** `.clavix/instructions/troubleshooting/skipped-file-creation.md`

---

### Problem: Wrong File Paths

**Symptoms:**
- Files created in wrong location
- Missing directory structure
- Path format inconsistent

**Solution:**
1. Always use `mkdir -p` to create parent directories
2. Show complete path: `.clavix/outputs/[project]/file.md`
3. Don't use relative paths without context
4. Verify path format matches project standards

---

### Problem: Missing Content

**Symptoms:**
- Files created but empty
- Incomplete content
- Wrong content structure

**Solution:**
1. Provide **complete content template** in instructions
2. Use markdown code blocks to show exact format
3. Include all required sections
4. Don't assume agent knows content structure

---

## Integration Platform Adaptations

### For Agents with Full File Access (Octofriend, agents.md, Warp)

Use standard pattern above. No adaptations needed.

---

### For Agents with Limited File Access (GitHub Copilot)

Add fallback pattern:

```markdown
**Step 2: Write file (with fallback)**

**Primary approach:** Use the Write tool to create `.clavix/outputs/[project]/file.md`

**Fallback if Write tool unavailable:**
If file creation fails, display content and instruct user:

```
⚠️ File creation unavailable. Please save this content manually:

**File path:** `.clavix/outputs/[project]/file.md`

**Content:**
```markdown
[Content here]
```
```

Copy the content above and save to the specified path.
```
```

---

## Examples from Proven Workflows

### From fast.md (WORKS ✓)

```markdown
### Saving the Prompt (REQUIRED)

After displaying the optimized prompt, you MUST save it to the Clavix system for future reference.

#### Step 1: Create Directory Structure
```bash
mkdir -p .clavix/outputs/prompts/fast
```

#### Step 2: Generate Unique Prompt ID
Create a unique identifier: `fast-YYYYMMDD-HHMM`

#### Step 3: Save Prompt File
Use the Write tool to create the prompt file at:
`.clavix/outputs/prompts/fast/[prompt-id].md`

[Content template]

#### Step 5: Verify Saving Succeeded
Confirm the file path and display to user:
```
✓ Prompt saved: .clavix/outputs/prompts/fast/[prompt-id].md
```
```

**Why it works:**
- Header says "REQUIRED"
- "you MUST save" (imperative)
- Numbered steps
- Explicit Write tool instruction
- Verification step

---

### From summarize.md OLD (BROKEN ✗)

```markdown
5. Suggest saving to `.clavix/outputs/[session-name]/`
```

**Why it failed:**
- "Suggest" is passive
- No Write tool instruction
- No step-by-step breakdown
- No verification
- Buried at step 5 (should be step 3-4)

---

## Summary

**Always use this pattern for file creation:**
1. Step 1: mkdir
2. Step 2-N: Write tool for each file
3. Step N+1: Verify files exist
4. Add CHECKPOINT marker

**Never use:**
- "Suggest saving"
- "If available"
- Vague "create" or "save" without tool name
- No verification step

Copy the proven patterns from this document into your workflow instructions.
