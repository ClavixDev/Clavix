# Clavix Quick Reference

## Commands at a Glance

| Command | Purpose | Mode |
|---------|---------|------|
| `/clavix:improve` | Optimize a prompt with auto-depth | Planning |
| `/clavix:prd` | Generate PRD via strategic questions | Planning |
| `/clavix:plan` | Create task breakdown from PRD | Planning |
| `/clavix:implement` | Execute tasks or prompts | Implementation |
| `/clavix:start` | Begin conversational exploration | Planning |
| `/clavix:summarize` | Extract requirements from conversation | Planning |
| `/clavix:refine` | Update existing PRD or prompt | Planning |
| `/clavix:verify` | Check implementation against requirements | Verification |
| `/clavix:archive` | Move completed project to archive | Management |

> **Command Format:** Commands shown with colon (`:`) format. Some tools use hyphen (`-`): Claude Code uses `/clavix:improve`, Cursor uses `/clavix-improve`. Your tool autocompletes the correct format.

## Common Workflows

**Quick optimization:**
```
/clavix:improve "your prompt here"
  → /clavix:implement --latest
```

**Full planning cycle:**
```
/clavix:prd
  → /clavix:plan
  → /clavix:implement
  → /clavix:verify
  → /clavix:archive
```

**Exploratory approach:**
```
/clavix:start
  → (conversation)
  → /clavix:summarize
  → /clavix:plan
  → /clavix:implement
```

## Key Directories

- `.clavix/outputs/` — Generated PRDs, tasks, prompts
- `.clavix/outputs/prompts/` — Saved optimized prompts
- `.clavix/outputs/archive/` — Archived completed projects
- `.clavix/instructions/` — Detailed workflow documentation

## Mode Boundaries

- **Planning Mode** (improve, prd, plan, start, summarize, refine): NO code generation
- **Implementation Mode** (implement): Code generation ALLOWED
- **Verification Mode** (verify): Read-only checks
- **Management Mode** (archive): File organization only

## Getting Started

1. Run `clavix init` to set up your project
2. Use `/clavix:improve "your idea"` to optimize a prompt
3. Use `/clavix:implement --latest` to implement it

For detailed documentation, see `.clavix/instructions/` in your project.
