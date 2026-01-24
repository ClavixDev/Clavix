# Clavix

> Agentic prompt workflows as skills. Works with any [agentskills.io](https://agentskills.io) compatible AI tool.

## Install

```bash
npm install -g clavix
clavix init
```

Select **Agent Skills** during setup. Choose global (`~/.config/agents/skills/`) or project (`.skills/`) scope.

## Skills

| Skill | Purpose |
|-------|---------|
| `clavix-improve` | Optimize prompts with 6-dimension quality assessment |
| `clavix-prd` | Generate PRD through strategic questions |
| `clavix-plan` | Create task breakdown from PRD |
| `clavix-implement` | Execute tasks with progress tracking |
| `clavix-start` | Begin conversational exploration |
| `clavix-summarize` | Extract requirements from conversation |
| `clavix-refine` | Update existing PRD or prompt |
| `clavix-verify` | Verify implementation against requirements |
| `clavix-review` | Review PRs with criteria presets |
| `clavix-archive` | Archive completed projects |

## Workflows

```
Quick:      clavix-improve → clavix-implement
Full:       clavix-prd → clavix-plan → clavix-implement → clavix-verify
Exploratory: clavix-start → clavix-summarize → clavix-plan
```

## How It Works

1. **You run `clavix init`** – Skills are installed as directories with `SKILL.md` files
2. **You invoke a skill** – Your AI tool loads the skill instructions
3. **The agent follows the workflow** – Using its native tools
4. **Outputs saved locally** – Under `.clavix/outputs/`

No code executes during skill invocation. The markdown templates ARE the product.

## Other Integrations

Clavix also supports tool-specific integrations for tools that don't yet support Agent Skills:

| Category | Tools |
|----------|-------|
| IDEs | Cursor, Windsurf, Kilocode, Roocode, Cline, GitHub Copilot |
| CLI agents | Claude Code, Gemini CLI, Qwen, Droid, CodeBuddy, OpenCode, LLXPRT, Amp, Crush, Codex, Augment, Vibe |
| Universal | AGENTS.md, OCTO.md, WARP.md |

Run `clavix init` and select your tools. Command format varies by tool:
- **CLI tools** (Claude Code, Gemini): `/clavix:improve`
- **IDE extensions** (Cursor, Copilot): `/clavix-improve`

## CLI Commands

| Command | Purpose |
|---------|---------|
| `clavix init` | Initialize or reconfigure integrations |
| `clavix update` | Regenerate templates |
| `clavix diagnose` | Check installation health |
| `clavix version` | Show version |

## Docs

- [Commands Reference](docs/commands.md)
- [Integrations](docs/integrations.md)
- [Architecture](docs/architecture.md)
- [Getting Started](docs/getting-started.md)

## Requirements

- Node.js >= 18.0.0
- An AI coding tool

## License

Apache-2.0

## Star History

<a href="https://www.star-history.com/#ClavixDev/Clavix&type=date&legend=top-left">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=ClavixDev/Clavix&type=date&theme=dark&legend=top-left" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=ClavixDev/Clavix&type=date&legend=top-left" />
   <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=ClavixDev/Clavix&type=date&legend=top-left" />
 </picture>
</a>
