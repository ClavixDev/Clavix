## CLI Commands Reference (v5.0 - Agentic-First)

Clavix v5 follows an **agentic-first architecture**. Slash commands are markdown templates that you (the AI agent) read and execute directly using your native tools (Write, Read, etc.).

**CLI commands are ONLY for project setup**, not for workflow execution.

---

### Setup Commands (User runs these)

These are commands the **user** runs in their terminal to set up Clavix:

#### `clavix init`
**What it does:** Sets up Clavix in current project
**When user runs it:** First time using Clavix in a project
**Features:**
- Auto-detects AI coding tools (Claude Code, Cursor, etc.)
- Configures integrations
- Creates .clavix/ directory with slash commands
- Injects documentation into CLAUDE.md

#### `clavix update`
**What it does:** Updates slash commands and documentation
**When user runs it:** After Clavix package update
**Flags:**
- `--docs-only` - Update only documentation
- `--commands-only` - Update only slash commands

#### `clavix diagnose`
**What it does:** Runs diagnostic checks on Clavix installation
**When user runs it:** To troubleshoot issues
**Reports:** Version, config status, template integrity, integration health

#### `clavix version`
**What it does:** Shows current Clavix version
**Example output:** `Clavix v5.0.0`

---

### How Workflows Execute (Agentic-First)

**In v5, you (the agent) execute workflows directly using your native tools:**

| Workflow | How You Execute It |
|----------|-------------------|
| **Save prompt** | Use **Write tool** to create `.clavix/outputs/prompts/<id>.md` (with frontmatter metadata) |
| **Save PRD** | Use **Write tool** to create `.clavix/outputs/<project>/full-prd.md` |
| **Save tasks** | Use **Write tool** to create `.clavix/outputs/<project>/tasks.md` |
| **Mark task complete** | Use **Edit tool** to change `- [ ]` to `- [x]` in tasks.md |
| **Archive project** | Use **Bash tool** to `mv .clavix/outputs/<project> .clavix/outputs/archive/` |
| **List prompts** | Use **Glob/Bash** to list `.clavix/outputs/prompts/*.md` files |
| **Read project** | Use **Read tool** on `.clavix/outputs/<project>/` files |

---

### Agent Execution Protocol (v5)

**DO:**
1. Use your native tools (Write, Read, Edit, Bash) to perform operations
2. Save outputs to `.clavix/outputs/` directory structure
3. Follow the workflow instructions in each slash command template
4. Report results in friendly language to the user

**DON'T:**
1. Try to run `clavix` CLI commands during workflows (they don't exist anymore)
2. Ask user to run terminal commands for workflow operations
3. Skip verification after completing work
4. Assume CLI commands exist - use your tools directly

---

### File System Structure

```
.clavix/
├── config.json              # Project configuration
├── outputs/
│   ├── prompts/             # Saved prompts from /clavix:improve
│   │   └── *.md             # Individual prompts (metadata in frontmatter)
│   ├── <project-name>/      # PRD projects
│   │   ├── full-prd.md      # Comprehensive PRD
│   │   ├── quick-prd.md     # AI-optimized summary
│   │   └── tasks.md         # Implementation tasks
│   └── archive/             # Archived projects
└── commands/                # Slash command templates (managed by clavix update)
```

**Prompt File Format:**
```markdown
---
id: std-20250127-143022-a3f2
timestamp: 2025-01-27T14:30:22Z
executed: false
originalPrompt: "the user's original prompt"
---

# Improved Prompt

[optimized prompt content]
```

---

### Removed Commands (v4 Legacy)

**IMPORTANT:** These commands were removed in v5. Do NOT try to run them:

| Removed Command | How Agents Handle This Now |
|-----------------|---------------------------|
| `clavix fast/deep` | Use `/clavix:improve` - saves to `.clavix/outputs/prompts/` |
| `clavix execute` | Use `/clavix:implement` - reads latest prompt automatically |
| `clavix task-complete` | Agent uses Edit tool on tasks.md directly |
| `clavix prompts list` | Agent uses Glob/Bash to list `.clavix/outputs/prompts/*.md` |
| `clavix config` | User can run `clavix init` to reconfigure |

**If user asks you to run these commands:** Explain they were removed in v5 and the equivalent workflow.
