# Component Manifest

This document lists all reusable components in the Clavix template system and their usage across slash commands.

## Component Categories

### Agent Protocols
Core protocols that all AI agents must follow. Shared across most commands.

| Component | Purpose | Used By |
|-----------|---------|---------|
| `AGENT_MANUAL.md` | Universal protocols (transparency, mode identification, communication patterns) | All 9 commands |
| `clarifying-questions.md` | Systematic protocol for asking clarifying questions (95% confidence threshold) | improve, prd, plan, start, summarize |
| `cli-reference.md` | CLI command reference including removed commands table | improve, prd, plan, implement, verify, archive |
| `state-awareness.md` | Workflow state detection (mid-PRD, mid-implementation, etc.) | prd, plan, implement, summarize |
| `state-assertion.md` | Required mode assertion output (MODE, Purpose, Implementation status) | Available for all commands |
| `self-correction-protocol.md` | Mistake detection and correction patterns (supports variables) | Available for all commands |
| `supportive-companion.md` | Conversational guidance for start mode | start |
| `task-blocking.md` | Task execution protocols for implement mode | implement |

### References
Static reference documentation for AI agents.

| Component | Purpose | Used By |
|-----------|---------|---------|
| `quality-dimensions.md` | Quality scoring dimensions (6 dimensions), workflow-specific usage, and why summarize excludes Specificity | improve, prd, summarize, refine |

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
| `/clavix:improve` | AGENT_MANUAL (includes clarifying-questions), cli-reference, improvement-explanations, quality-dimensions, escalation-factors, pattern-impact |
| `/clavix:prd` | AGENT_MANUAL (includes clarifying-questions), prd-examples, quality-dimensions, state-awareness, cli-reference |
| `/clavix:plan` | AGENT_MANUAL (includes clarifying-questions), state-awareness, cli-reference, vibecoder-recovery |
| `/clavix:implement` | AGENT_MANUAL, state-awareness, task-blocking, cli-reference, vibecoder-recovery |
| `/clavix:start` | AGENT_MANUAL (includes clarifying-questions), supportive-companion, conversation-examples, vibecoder-recovery |
| `/clavix:summarize` | AGENT_MANUAL (includes clarifying-questions), improvement-explanations, quality-dimensions, state-awareness, vibecoder-recovery |
| `/clavix:refine` | AGENT_MANUAL, cli-reference, quality-dimensions, state-awareness |
| `/clavix:verify` | AGENT_MANUAL, cli-reference, vibecoder-recovery |
| `/clavix:archive` | AGENT_MANUAL, cli-reference, vibecoder-recovery |

## Include Syntax

Components are included using the `{{INCLUDE:path}}` directive:

```markdown
{{INCLUDE:agent-protocols/AGENT_MANUAL.md}}
{{INCLUDE:sections/escalation-factors.md}}
{{INCLUDE:references/quality-dimensions.md}}
```

### Variable Interpolation

Components can accept variables for customization:

```markdown
{{INCLUDE:agent-protocols/state-assertion.md MODE_NAME="Improve" MODE_TYPE="planning" MODE_PURPOSE="Optimizing prompts" IMPL_STATUS="BLOCKED"}}
```

Variables use mustache-style syntax:
- `{{VAR_NAME}}` - Simple replacement
- `{{#VAR_NAME}}content{{/VAR_NAME}}` - Conditional block (shown if VAR_NAME is set)

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
