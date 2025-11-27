# Component Manifest

This document lists all reusable components in the Clavix template system and their usage across slash commands.

## Component Categories

### Agent Protocols
Core protocols that all AI agents must follow. Shared across most commands.

| Component | Purpose | Used By |
|-----------|---------|---------|
| `AGENT_MANUAL.md` | Universal protocols (transparency, mode identification, communication patterns) | All 8 commands |
| `cli-reference.md` | CLI command reference including removed commands table | improve, prd, plan, implement, verify, archive |
| `state-awareness.md` | Workflow state detection (mid-PRD, mid-implementation, etc.) | prd, plan, implement, summarize |
| `supportive-companion.md` | Conversational guidance for start mode | start |
| `task-blocking.md` | Task execution protocols for implement mode | implement |

### References
Static reference documentation for AI agents.

| Component | Purpose | Used By |
|-----------|---------|---------|
| `quality-dimensions.md` | Explanation of quality scoring dimensions (clarity, efficiency, etc.) | improve, prd, summarize |

### Sections
Reusable content sections for specific workflows.

| Component | Purpose | Used By |
|-----------|---------|---------|
| `conversation-examples.md` | Example conversation patterns for exploration | start |
| `escalation-factors.md` | When to recommend PRD mode over improve | improve |
| `improvement-explanations.md` | How to explain quality improvements | improve, summarize |
| `pattern-impact.md` | What patterns had the biggest impact | improve |
| `prd-examples.md` | PRD generation examples | prd |

### Troubleshooting
Recovery patterns for common agent issues.

| Component | Purpose | Used By |
|-----------|---------|---------|
| `vibecoder-recovery.md` | Recovery patterns for "vibe coders" who skip instructions | All 8 commands |

## Usage Matrix

| Command | Components Used |
|---------|----------------|
| `/clavix:improve` | AGENT_MANUAL, cli-reference, improvement-explanations, quality-dimensions, escalation-factors, pattern-impact |
| `/clavix:prd` | AGENT_MANUAL, prd-examples, quality-dimensions, state-awareness, cli-reference |
| `/clavix:plan` | AGENT_MANUAL, state-awareness, cli-reference, vibecoder-recovery |
| `/clavix:implement` | AGENT_MANUAL, state-awareness, task-blocking, cli-reference, vibecoder-recovery |
| `/clavix:start` | AGENT_MANUAL, supportive-companion, conversation-examples, vibecoder-recovery |
| `/clavix:summarize` | AGENT_MANUAL, improvement-explanations, quality-dimensions, state-awareness, vibecoder-recovery |
| `/clavix:verify` | AGENT_MANUAL, cli-reference, vibecoder-recovery |
| `/clavix:archive` | AGENT_MANUAL, cli-reference, vibecoder-recovery |

## Include Syntax

Components are included using the `{{INCLUDE:path}}` directive:

```markdown
{{INCLUDE:agent-protocols/AGENT_MANUAL.md}}
{{INCLUDE:sections/escalation-factors.md}}
{{INCLUDE:references/quality-dimensions.md}}
```

## Guidelines for New Components

1. **Single responsibility**: Each component should have one clear purpose
2. **Reusability**: Create components when content is used by 2+ commands
3. **No orphans**: Delete components when no longer referenced
4. **Update manifest**: Add new components to this manifest

## Maintenance

When adding/removing components:
1. Update this manifest
2. Run `npm run build` to verify template assembly
3. Check that removed components aren't referenced anywhere:
   ```bash
   grep -r "INCLUDE:.*component-name" src/templates/
   ```
