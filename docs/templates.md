# Template Authoring Guide

This guide explains how to create and modify Clavix templates. Templates are the core of Clavix's agentic workflow system - they define how AI agents behave when executing slash commands.

## Core Principle: Templates ARE the Product

**CRITICAL**: All agentic workflow logic MUST be in markdown templates, NOT TypeScript.

- TypeScript is **only** for CLI setup and file generation
- Templates contain all instructions, workflows, and agent behavior
- This is non-negotiable and central to Clavix's architecture

## Template Structure

### Directory Layout

```
src/templates/
├── slash-commands/
│   ├── _canonical/           # Master template files (9 templates)
│   │   ├── improve.md
│   │   ├── prd.md
│   │   ├── plan.md
│   │   ├── implement.md
│   │   ├── start.md
│   │   ├── summarize.md
│   │   ├── refine.md
│   │   ├── verify.md
│   │   └── archive.md
│   └── _components/          # Reusable template fragments
│       ├── MANIFEST.md       # Component index
│       ├── agent-protocols/  # Agent behavior protocols
│       ├── sections/         # Reusable content sections
│       ├── references/       # Reference documentation
│       └── troubleshooting/  # Error recovery guides
├── instructions/             # Static reference docs
└── agents/                   # Agent-specific configs
```

### Canonical Templates

The 9 canonical templates in `_canonical/` are the master versions:

| Template | Purpose |
|----------|---------|
| `improve.md` | Prompt optimization with auto-depth |
| `prd.md` | PRD generation workflow |
| `plan.md` | Task breakdown from PRD |
| `implement.md` | Task/prompt execution |
| `start.md` | Conversational session |
| `summarize.md` | Extract requirements from conversation |
| `refine.md` | Refine existing PRD/prompt |
| `verify.md` | Implementation verification |
| `archive.md` | Archive completed projects |

## Component Include System

Templates can include reusable components using the `{{INCLUDE:}}` marker.

### Syntax

```markdown
{{INCLUDE:path/to/component.md}}
```

### Available Components

#### Agent Protocols (`agent-protocols/`)
- `AGENT_MANUAL.md` - Universal agent guidelines
- `cli-reference.md` - CLI command reference
- `self-correction-protocol.md` - Error detection and recovery
- `state-assertion.md` - Mode state assertion pattern
- `state-awareness.md` - Workflow state detection
- `supportive-companion.md` - Companion mode behavior
- `task-blocking.md` - Handling blocked tasks

#### Sections (`sections/`)
- `conversation-examples.md` - Conversation mode examples
- `escalation-factors.md` - When to escalate depth
- `improvement-explanations.md` - How to explain improvements
- `pattern-impact.md` - Pattern impact explanations
- `prd-examples.md` - PRD generation examples

#### References (`references/`)
- `quality-dimensions.md` - Quality dimension definitions

#### Troubleshooting (`troubleshooting/`)
- `vibecoder-recovery.md` - Recovery patterns for vibe-coding

### Include Resolution

1. Paths are relative to `_components/` directory
2. Maximum include depth: 3 levels (prevents circular references)
3. Missing includes generate warnings but don't fail build

### Example Usage

```markdown
## Agent Transparency

### Agent Manual (Universal Protocols)
{{INCLUDE:agent-protocols/AGENT_MANUAL.md}}

### Recovery Patterns
{{INCLUDE:troubleshooting/vibecoder-recovery.md}}
```

## Template Anatomy

Every canonical template should follow this structure:

### 1. Frontmatter (Required)

```yaml
---
name: "Clavix: Command Name"
description: Brief description of what the command does
---
```

### 2. Title and Introduction

```markdown
# Clavix: Human-Friendly Title

Opening paragraph explaining what happens when user runs this command.
```

### 3. What This Does Section

```markdown
## What This Does

When you run `/clavix:command`, I:
1. First action
2. Second action
3. Third action

**Clear boundary statement about what this command does/doesn't do.**
```

### 4. Mode Declaration

```markdown
## CLAVIX MODE: Mode Name

**I'm in [mode] mode. [Brief description].**

**What I'll do:**
- ✓ Action 1
- ✓ Action 2

**What I won't do:**
- ✗ Forbidden action 1
- ✗ Forbidden action 2
```

### 5. Self-Correction Protocol

```markdown
## Self-Correction Protocol

**DETECT**: If you find yourself doing any of these mistake types:

| Type | What It Looks Like |
|------|--------------------|
| 1. Name | Description |

**STOP**: Immediately halt the incorrect action

**CORRECT**: Output apology and correction

**RESUME**: Return to correct workflow
```

### 6. State Assertion (REQUIRED)

```markdown
## State Assertion (REQUIRED)

**Before starting [action], output:**
```
**CLAVIX MODE: Mode Name**
Mode: planning|implementation
Purpose: What this mode does
Implementation: BLOCKED|AUTHORIZED
```
```

### 7. Instructions

The main workflow instructions for the agent.

### 8. Agent Transparency Section

Include relevant components:

```markdown
## Agent Transparency (v5.1)

### Agent Manual
{{INCLUDE:agent-protocols/AGENT_MANUAL.md}}

### Other relevant components...
```

### 9. Troubleshooting

Common issues and recovery patterns.

### 10. Workflow Navigation

Where this command fits in workflows:

```markdown
## Workflow Navigation

**You are here:** Command Name

**Common workflows:**
- Workflow 1: step → step → step
- Workflow 2: step → step → step

**Related commands:**
- `/clavix:related` - Description
```

## Writing Guidelines

### Voice and Tone

- Write as if speaking directly to the agent
- Use "I" for the agent, "you" for the user
- Be clear and specific about boundaries
- Include concrete examples

### Mode Enforcement

Templates must clearly define:
- What mode the agent is in
- What actions are allowed
- What actions are forbidden
- How to detect and correct mistakes

### Quality Patterns

Use quality dimension tags in improvement explanations:
- `[Clarity]` - Making requirements unambiguous
- `[Efficiency]` - Removing verbose language
- `[Structure]` - Organizing information logically
- `[Completeness]` - Adding missing specifications
- `[Actionability]` - Making requirements executable

## Testing Templates

1. Build the project: `npm run build`
2. Initialize in a test project: `clavix init`
3. Test the slash command in your AI tool
4. Verify mode enforcement works correctly
5. Check that includes resolve properly

## Adding New Templates

1. Create new file in `_canonical/`
2. Follow the template anatomy structure
3. Add appropriate component includes
4. Update `integrations.json` if needed
5. Run consistency tests: `npm run test:consistency`

## Forbidden Practices

**NEVER:**
- Put agentic logic in TypeScript code
- Create runtime workflow handlers
- Add "intelligent" TypeScript features for slash commands
- Bypass template-based instruction delivery

The template IS the instruction. TypeScript only copies and delivers it.
