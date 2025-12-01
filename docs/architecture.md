# Clavix Architecture

Clavix is an **agentic-first instruction injection system** for AI coding agents. This document explains how it works and why.

---

## Core Principle: Agentic-First

**Clavix slash commands are markdown templates that AI agents read and execute. They are NOT TypeScript code.**

```
User invokes: /clavix:improve "my prompt"
     ↓
AI agent reads: .claude/commands/clavix/improve.md
     ↓
Agent follows markdown instructions using native tools (Write, Edit, Bash)
     ↓
Result: Optimized prompt saved to .clavix/outputs/
     ↓
Zero TypeScript executes during this workflow
```

### Why This Architecture?

1. **Agents are the runtime** - Claude, Cursor, Gemini, etc. execute the workflows
2. **Templates ARE the product** - The markdown instructions are what we ship
3. **No code execution** - Clavix CLI only sets up the environment
4. **Flexibility** - Updating workflows = updating markdown, no recompilation

### What This Means for Contributors

| Can Change | Cannot Change |
|------------|---------------|
| Template instructions | Add TypeScript for slash command logic |
| CLI setup commands | Build session storage (agents handle this) |
| Adapter configurations | Add validation code for agent outputs |
| New slash command templates | Create runtime hooks for slash commands |
| Documentation | Add programmatic guardrails |

For full contribution guidelines, see [CONTRIBUTING.md](../CONTRIBUTING.md).

---

## How Injection Works

When you run `clavix init`:

1. **Detection** - Clavix detects which AI agents you use
2. **Generation** - Creates agent-specific files in locations each agent reads:
   - `.claude/commands/clavix/` for Claude Code
   - `.cursor/commands/` for Cursor
   - `.gemini/commands/clavix/` for Gemini CLI
   - `AGENTS.md` for generic agents
3. **Agent reads files** - And follows embedded instructions
4. **User invokes** - Workflows via slash commands (`/clavix:improve`)
5. **Agent executes** - Following structured workflow, not ad-hoc

The agent doesn't "use" Clavix as a service. The agent **becomes** Clavix-aware through injected instructions.

---

## Template System

### Canonical Templates (9 workflows)

| Template | Purpose | Mode |
|----------|---------|------|
| `/clavix:improve` | Prompt optimization with auto-depth | Planning |
| `/clavix:prd` | PRD generation via Socratic questions | Planning |
| `/clavix:plan` | Task breakdown from PRD | Planning |
| `/clavix:implement` | Execute tasks or prompts | Implementation |
| `/clavix:start` | Conversational requirements | Planning |
| `/clavix:summarize` | Extract requirements from conversation | Planning |
| `/clavix:refine` | Refine existing PRD or prompt | Planning |
| `/clavix:verify` | Check implementation against PRD | Verification |
| `/clavix:archive` | Archive completed projects | Management |

### Component System

Templates use `{{INCLUDE:}}` markers for reusable components:

```
src/templates/slash-commands/
├── _canonical/           # Source templates (improve.md, prd.md, etc.)
└── _components/          # Reusable components
    ├── AGENT_MANUAL.md   # Universal protocols
    ├── cli-reference.md  # Command reference
    ├── state-awareness.md
    └── quality-dimensions.md
```

### Template Assembly Flow

```
Canonical template (improve.md)
    ↓
TemplateAssembler processes {{INCLUDE:}} markers
    ↓
Components loaded and inserted
    ↓
Assembled template delivered to agent
    ↓
Agent follows instructions using native tools
```

---

## CLI Commands (Setup Only)

These are the ONLY TypeScript-executed commands:

| Command | Purpose |
|---------|---------|
| `clavix init` | Initialize project, select integrations |
| `clavix update` | Regenerate templates after package update |
| `clavix diagnose` | Check installation health |
| `clavix version` | Show version information |

**Everything else is agent-executed templates.**

---

## Multi-Tool Support

Clavix supports 20+ AI coding tools through adapters:

| Category | Tools |
|----------|-------|
| **CLI Agents** | Claude Code, Gemini CLI, Qwen CLI, Droid, CodeBuddy, OpenCode, Amp, Crush, Codex, Augment, LLXPRT |
| **IDE Extensions** | Cursor, Windsurf, Kilocode, Roocode, Cline |
| **Universal** | AGENTS.md, GitHub Copilot, OCTO.md, WARP.md |

Each adapter knows:
- Where to store command templates
- File format requirements (markdown, TOML)
- Command naming conventions (colon vs hyphen)
- Documentation injection points

See [Integrations](integrations.md) for full details.

---

## File Structure

```
.clavix/
├── config.json           # Configuration
├── INSTRUCTIONS.md       # Generated workflow guide
└── outputs/
    ├── prompts/          # Saved prompts from /clavix:improve
    ├── {project}/        # PRD projects
    │   ├── full-prd.md
    │   ├── quick-prd.md
    │   └── tasks.md
    └── archive/          # Archived projects

.claude/commands/clavix/  # (or equivalent for other tools)
├── improve.md
├── prd.md
├── plan.md
├── implement.md
├── start.md
├── summarize.md
├── verify.md
└── archive.md
```

---

## Mode Enforcement

Every workflow is tagged as either:

- **Planning Mode**: Agent analyzes, documents, asks questions. No code allowed.
- **Implementation Mode**: Agent writes code. Only after explicit transition.

Agents output mode assertions:
```
**CLAVIX MODE: Improve**
Mode: planning
Purpose: Optimizing user prompt
Implementation: BLOCKED
```

---

## What Clavix Does NOT Do

### No Runtime Business Logic
All workflow logic is in templates. TypeScript only handles file system operations during setup.

### No API Calls
Clavix makes no external API calls. Everything runs locally.

### No Validation Guarantees
Template instructions guide agents, but cannot force compliance. Success depends on the agent following the workflow.

### No Semantic Understanding
Pattern matching cannot evaluate correctness, judge quality, or guarantee improvements.

---

## Philosophy

We believe in transparency:

- **Describe what the tool does**, not what you want to hear
- **Show limitations**, not just capabilities
- **Don't claim accuracy** we haven't validated

Clavix is a utility for injecting structure into AI agent workflows. Think of it as a linter for AI workflows: helpful for catching common issues and enforcing consistency, but not a substitute for understanding what you're building.

---

## Related Documentation

- [CONTRIBUTING.md](../CONTRIBUTING.md) - Full architecture principles and contribution guidelines
- [Getting Started](getting-started.md) - Installation and first workflow
- [Commands Reference](commands.md) - All commands in one place
- [Integrations](integrations.md) - Full integration matrix
