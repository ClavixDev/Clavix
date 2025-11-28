# Clavix Documentation

## Quick Navigation

| I want to... | Go to |
|--------------|-------|
| Install and get started | [Getting Started](getting-started.md) |
| Understand how Clavix works | [Architecture](architecture.md) |
| See all commands | [Commands Reference](commands.md) |
| Check integration compatibility | [Integrations](integrations.md) |
| Contribute to Clavix | [CONTRIBUTING.md](../CONTRIBUTING.md) |

---

## Command Format Quick Reference

**Your command format depends on your AI tool:**

| Tool Type | Format | Example |
|-----------|--------|---------|
| **CLI tools** (Claude Code, Gemini CLI, Qwen CLI) | Colon (`:`) | `/clavix:improve` |
| **IDE extensions** (Cursor, Windsurf, Cline) | Hyphen (`-`) | `/clavix-improve` |

<details>
<summary>Full tool list</summary>

| Tool | Separator | Example |
|------|-----------|---------|
| Claude Code | `:` | `/clavix:improve` |
| Gemini CLI | `:` | `/clavix:improve` |
| Qwen CLI | `:` | `/clavix:improve` |
| Crush CLI | `:` | `/clavix:improve` |
| LLXPRT | `:` | `/clavix:improve` |
| Augment CLI | `:` | `/clavix:improve` |
| Cursor | `-` | `/clavix-improve` |
| Windsurf | `-` | `/clavix-improve` |
| Cline | `-` | `/clavix-improve` |
| Kilocode | `-` | `/clavix-improve` |
| Roocode | `-` | `/clavix-improve` |
| Droid CLI | `-` | `/clavix-improve` |
| CodeBuddy | `-` | `/clavix-improve` |
| OpenCode | `-` | `/clavix-improve` |
| Amp | `-` | `/clavix-improve` |
| Codex CLI | `-` | `/clavix-improve` |

</details>

---

## What is Clavix?

Clavix is an **agentic-first** tool that injects discipline into AI coding agents. When you run `clavix init`, it generates markdown templates that AI agents read and follow.

**The problem:** AI agents jump straight to implementation without clarifying requirements, making assumptions about architecture, and missing edge cases.

**The solution:** Clavix teaches agents to ask questions first, document requirements, break down tasks, and only then implement—with explicit permission.

### Key Capabilities

| Capability | Command | Description |
|------------|---------|-------------|
| Prompt optimization | `/clavix:improve` | Transform vague requests into structured prompts |
| PRD generation | `/clavix:prd` | Guided requirements gathering |
| Task planning | `/clavix:plan` | Break PRD into implementation tasks |
| Implementation | `/clavix:implement` | Execute tasks with progress tracking |
| Conversation mode | `/clavix:start` | Iterative prompt development |
| Verification | `/clavix:verify` | Post-implementation checklists |

---

## Architecture at a Glance

```
User invokes: /clavix:improve "my prompt"
     ↓
AI agent reads: .claude/commands/clavix/improve.md
     ↓
Agent follows instructions using native tools
     ↓
Result: Optimized output saved to .clavix/outputs/
```

**Key insight:** Slash commands are NOT TypeScript code. They are markdown templates that AI agents read and execute. The CLI (`clavix init`, `clavix update`) only sets up the environment—agents do all the work.

For full architecture details, see [Architecture](architecture.md) or [CONTRIBUTING.md](../CONTRIBUTING.md).

---

## Supported Integrations

Clavix supports 20 AI coding tools:

- **CLI agents:** Claude Code, Gemini CLI, Qwen CLI, Droid, CodeBuddy, OpenCode, Amp, Crush, Codex, Augment, LLXPRT
- **IDE extensions:** Cursor, Windsurf, Cline, Kilocode, Roocode
- **Universal:** AGENTS.md, GitHub Copilot, OCTO.md, WARP.md

See [Integrations](integrations.md) for the full matrix with command paths and placeholders.

---

## Quick Start

```bash
# Install
npm install -g clavix

# Initialize in your project
cd your-project
clavix init

# Start using commands (format depends on your tool)
/clavix:improve "add user authentication"
```

For detailed setup, see [Getting Started](getting-started.md).
