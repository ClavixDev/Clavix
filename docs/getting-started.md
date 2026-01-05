# Getting Started with Clavix

This guide covers installation, first workflow, and configuration.

---

## Installation

### Prerequisites

- Node.js >= 18.0.0
- npm or yarn
- An AI coding tool (Claude Code, Cursor, Gemini CLI, etc.)

### Install

```bash
npm install -g clavix
```

### Initialize in Your Project

```bash
cd your-project
clavix init
```

Select your AI tools from the interactive list. Clavix generates:
- `.clavix/config.json` - Configuration
- `.clavix/INSTRUCTIONS.md` - Quick-start guide
- Slash command templates in your AI tool's directory

### Verify Installation

```bash
clavix diagnose
```

---

## Your First Workflow

### Quick Path: Improve a Prompt

```bash
/clavix:improve "add user authentication with JWT"
```

Clavix analyzes your prompt, applies optimization patterns, and saves the result.

```bash
/clavix:implement --latest
```

The agent reads the optimized prompt and implements it.

### Full Path: PRD to Implementation

**Step 1: Generate PRD**
```bash
/clavix:prd
```
Answer the guided questions. Outputs: `full-prd.md` + `quick-prd.md`

**Step 2: Create Task Plan**
```bash
/clavix:plan
```
Converts PRD into `tasks.md` with phases and checkboxes.

**Step 3: Implement**
```bash
/clavix:implement
```
Executes tasks one by one with optional git commits.

**Step 4: Verify**
```bash
/clavix:verify
```
Checks implementation against requirements.

**Step 5: Archive**
```bash
/clavix:archive
```
Moves completed project to archive.

---

## Choosing the Right Workflow

### Quick Decision Tree

```
Do you have a clear, specific task?
├── YES → Is it a single prompt/request?
│   ├── YES → Use /clavix:improve
│   └── NO (multiple tasks) → Do you have requirements?
│       ├── YES → Use /clavix:plan then /clavix:implement
│       └── NO → Use /clavix:prd first
└── NO (vague idea) → Do you know what you want?
    ├── SOMEWHAT → Use /clavix:prd (guided questions)
    └── NOT REALLY → Use /clavix:start (conversational)
```

### When to Use What

| Situation | Workflow |
|-----------|----------|
| Quick prompt optimization | `/clavix:improve` |
| Building something new | `/clavix:prd` → `/clavix:plan` → `/clavix:implement` |
| Unclear requirements | `/clavix:start` → `/clavix:summarize` |
| Have PRD, need tasks | `/clavix:plan` |
| Tasks ready to execute | `/clavix:implement` |

### Real-World Example: Business Website

**Use Improve for modifications:**
- Add a section to the homepage
- Change content in "About Us"
- Update styling on contact page

**Use PRD for new development:**
- Create an entirely new "Services" subpage
- Build a complete blog section
- Develop a new customer portal

**Rule of thumb:** For most tasks, `/clavix:improve` is enough. Use `/clavix:prd` when building something that doesn't exist yet.

---

## Workflow Chains

### Simple (single prompt)
```
/clavix:improve "..." → /clavix:implement --latest
```

### Standard (feature development)
```
/clavix:prd → /clavix:plan → /clavix:implement → /clavix:verify
```

### Exploratory (unclear requirements)
```
/clavix:start → /clavix:summarize → /clavix:plan → /clavix:implement
```

---

## Configuration

### Config File

`.clavix/config.json` stores your settings:

```json
{
  "version": "5.10.2",
  "integrations": ["claude-code", "cursor"],
  "outputs": {
    "path": ".clavix/outputs",
    "format": "markdown"
  }
}
```

### Key Fields

| Field | Description |
|-------|-------------|
| `integrations` | List of AI tools selected during init |
| `outputs.path` | Where generated documents go |

### Reconfigure

```bash
clavix init      # Re-run to change integrations
clavix update    # Regenerate templates after changes
```

---

## Template Customization

Clavix uses canonical templates that get formatted for each AI tool. You can override them.

### Override Hierarchy

1. **Provider-specific**: `.clavix/templates/slash-commands/<provider>/<command>.<ext>`
2. **Canonical**: `.clavix/templates/slash-commands/_canonical/<command>.md`
3. **Built-in**: Package default

### Customization Steps

1. Create `.clavix/templates/slash-commands/_canonical/`
2. Copy template from package source
3. Modify content
4. Run `clavix update --commands-only`

### Template Format

**Markdown (most tools):**
```markdown
---
name: "Clavix: Fast"
description: Quick improvements
---

Instructions here...
Use {{ARGS}} for user input.
```

**TOML (Gemini/Qwen):**
```toml
description = "Quick improvements"

prompt = """
Instructions here...
Use {{args}} for user input.
"""
```

---

## Git Integration

`/clavix:implement` supports automatic git commits:

| Strategy | Behavior |
|----------|----------|
| `none` (default) | No auto-commits |
| `per-task` | Commit after every task |
| `per-5-tasks` | Commit every 5 tasks |
| `per-phase` | Commit when phase completes |

Set strategy:
```bash
/clavix:implement --commit-strategy per-phase
```

Disable for one session:
```bash
/clavix:implement --no-git
```

---

## Output Files

All outputs go to `.clavix/outputs/`:

```
.clavix/outputs/
├── prompts/           # Saved prompts from /clavix:improve
├── <project>/         # PRD projects
│   ├── full-prd.md
│   ├── quick-prd.md
│   └── tasks.md
├── summarize/         # Outputs from /clavix:summarize
│   ├── mini-prd.md           # Structured requirements (like a mini PRD)
│   ├── original-prompt.md    # Original prompt as received
│   └── optimized-prompt.md   # Improved version of the prompt
└── archive/           # Archived projects
```

### Prompt Lifecycle

1. `/clavix:improve` saves to `prompts/`
2. `/clavix:implement --latest` executes most recent
3. Delete old prompts: `rm .clavix/outputs/prompts/executed-*.md`

### Summarize Outputs

`/clavix:summarize` extracts requirements from conversation and produces:
- **mini-prd.md**: Structured requirements in PRD format
- **original-prompt.md**: The original prompt/requirement
- **optimized-prompt.md**: An improved, clearer version of the prompt

---

## Troubleshooting

### Common Issues

**Commands not found**
- Run `clavix diagnose` to check installation
- Run `clavix update` to regenerate templates

**Wrong command format**
- CLI tools use colon: `/clavix:improve`
- IDE extensions use hyphen: `/clavix-improve`

**Integration not working**
- Check `.clavix/config.json` has your tool listed
- Run `clavix init` to add integrations

### Diagnosis

```bash
clavix diagnose
```

Shows:
- Version check
- Directory structure
- Configuration validity
- Integration status
- Template integrity

---

## Next Steps

- [Commands Reference](commands.md) - All commands in detail
- [Architecture](architecture.md) - How Clavix works
- [Integrations](integrations.md) - Full tool matrix
- [CONTRIBUTING.md](../CONTRIBUTING.md) - Contribute to Clavix
