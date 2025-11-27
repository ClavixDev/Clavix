## Saving the {{OUTPUT_TYPE}} (REQUIRED - v5 Agentic-First)

After displaying the {{OUTPUT_DESC}}, you MUST save it using your native tools.

**In v5, you save files directly - no CLI commands involved.**

### Step 1: Create Directory Structure
```bash
mkdir -p .clavix/outputs/prompts
```

### Step 2: Generate Unique {{OUTPUT_TYPE}} ID
Create a unique identifier using this format:
- **Format**: `{{OUTPUT_DIR}}-YYYYMMDD-HHMMSS-<random>`
- **Example**: `{{OUTPUT_DIR}}-20250117-143022-a3f2`
- Use current timestamp + random 4-character suffix

### Step 3: Save {{OUTPUT_TYPE}} File with Frontmatter
Use the Write tool to create the {{OUTPUT_TYPE}} file at:
- **Path**: `.clavix/outputs/prompts/<{{OUTPUT_TYPE}}-id>.md`

**File format:**
```markdown
---
id: <{{OUTPUT_TYPE}}-id>
timestamp: <ISO-8601 timestamp>
executed: false
originalPrompt: "<user's original text>"
---

# {{OUTPUT_TYPE}}

<content here>
```

### Step 4: Verify Saving Succeeded
Confirm:
- File exists at `.clavix/outputs/prompts/<{{OUTPUT_TYPE}}-id>.md`
- File has valid frontmatter with id, timestamp, executed fields
- Display success message: `✓ {{OUTPUT_TYPE}} saved: <{{OUTPUT_TYPE}}-id>.md`
