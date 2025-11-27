# How Clavix Works

Clavix is an agentic-first template system that injects structured workflow instructions into AI coding agents. This document explains the v5 architecture.

## The Agentic-First Approach

**Key Insight:** AI agents don't need compiled business logic - they need clear markdown instructions.

Clavix v5 removed ~50,000 lines of TypeScript intelligence code and replaced it with template-driven workflows. The product IS the templates.

### What This Means

1. **No CLI workflow execution** - Slash commands are markdown templates, not CLI tools
2. **Agents read and follow instructions** - Using native tools (Read, Write, Edit, Bash)
3. **Templates contain all logic** - Quality assessment, optimization patterns, workflow steps
4. **Setup-only CLI** - `clavix init`, `clavix update`, `clavix diagnose` handle infrastructure

## Architecture Overview

```
User runs /clavix:improve
    ↓
Agent reads template from .clavix/commands/improve.md
    ↓
Agent follows markdown instructions:
  - Analyze prompt quality
  - Select appropriate depth
  - Generate optimized version
    ↓
Agent uses native tools:
  - Write: Save to .clavix/outputs/prompts/
  - Read: Verify file was created
    ↓
Zero TypeScript executes during this workflow
```

## Template System

### Canonical Templates (8 workflows)

| Template | Purpose | Mode |
|----------|---------|------|
| `/clavix:improve` | Prompt optimization with auto-depth | Planning |
| `/clavix:prd` | PRD generation via Socratic questions | Planning |
| `/clavix:plan` | Task breakdown from PRD | Planning |
| `/clavix:implement` | Execute tasks or prompts | Implementation |
| `/clavix:start` | Conversational requirements | Planning |
| `/clavix:summarize` | Extract requirements from conversation | Planning |
| `/clavix:verify` | Check implementation against PRD | Verification |
| `/clavix:archive` | Archive completed projects | Management |

### Component System

Templates use `{{INCLUDE:}}` markers for reusable components:
- **AGENT_MANUAL.md** - Universal protocols for all agents
- **cli-reference.md** - Command reference table
- **state-awareness.md** - Workflow state detection
- **quality-dimensions.md** - Scoring dimensions

### Template Assembly

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

## Multi-Tool Support

Clavix supports 20+ AI coding tools through adapters:

### IDE Extensions
Cursor, Windsurf, Kilocode, Roocode, Cline, Droid, OpenCode, Crush

### CLI Agents
Claude Code, Gemini CLI, Qwen Code, LLXPRT, Codex, Augment, CodeBuddy, Amp

### Universal Formats
AGENTS.md, OCTO.md, WARP.md, GitHub Copilot Instructions

Each adapter knows:
- Where to store command templates
- File format requirements
- Command naming conventions
- Documentation injection points

## File Structure

```
.clavix/
├── config.json           # Configuration
├── commands/             # Slash command templates
│   └── clavix/
│       ├── improve.md
│       ├── prd.md
│       ├── plan.md
│       └── ...
└── outputs/
    ├── prompts/          # Saved prompts from /clavix:improve
    ├── {project}/        # PRD projects
    │   ├── full-prd.md
    │   ├── quick-prd.md
    │   └── tasks.md
    └── archive/          # Archived projects
```

## What Clavix Does NOT Do

### No Runtime Business Logic
All workflow logic is in templates. TypeScript only handles:
- File system operations during setup
- Adapter selection and configuration
- Template assembly and delivery

### No API Calls
Clavix makes no external API calls. Everything runs locally.

### No Validation Guarantees
Template instructions guide agents, but cannot force compliance. Success depends on the agent following the workflow.

## CLI Commands (Setup Only)

| Command | Purpose |
|---------|---------|
| `clavix init` | Initialize project, select integrations |
| `clavix update` | Regenerate templates and commands |
| `clavix diagnose` | Check installation health |
| `clavix version` | Show version information |

These commands handle infrastructure setup. All actual workflows are executed by agents reading templates.

## Related Documentation

- [Philosophy](philosophy.md) - What Clavix actually is
- [Workflow Guide](guides/workflows.md) - Step-by-step usage
- [Why Clavix](why-clavix.md) - Problems it solves
