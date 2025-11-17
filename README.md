# Clavix
> Transform vague ideas into production-ready prompts. Analyze gaps, generate PRDs, and supercharge your AI coding workflow with the CLEAR framework.

## Table of contents
- [Why Clavix?](#why-clavix)
- [Why CLEAR?](#why-clear)
- [Providers](#providers)
- [Quickstart](#quickstart)
- [Full documentation](#full-documentation)

## Why Clavix?
Better prompts lead to better code. Clavix analyzes gaps, generates PRDs, and integrates with your AI tooling so you can move from idea to implementation quickly. Learn more in [docs/why-clavix.md](docs/why-clavix.md).

## Why CLEAR?
Clavix is built on CLEAR (Concise, Logical, Explicit, Adaptive, Reflective), an academically validated prompt engineering methodology. Read the full overview in [docs/clear-framework.md](docs/clear-framework.md).

## Providers

| Category | Providers |
| --- | --- |
| IDE & editor extensions | Cursor · Windsurf · Kilocode · Roocode · Cline |
| CLI agents | Claude Code · Droid CLI · CodeBuddy CLI · OpenCode · Gemini CLI · Qwen Code · Amp · Crush CLI · Codex CLI · Augment CLI |
| Universal adapters | AGENTS.md · GitHub Copilot · OCTO.md · WARP.md |

Provider paths and argument placeholders are listed in [docs/providers.md](docs/providers.md).

## Quickstart

### For AI Agents (Recommended)

Most Clavix users work through AI coding assistants:

```bash
# 1. Initialize in your project
npm install -g clavix
clavix init

# 2. Use slash commands in your AI agent
/clavix:fast "Create a login page"
/clavix:deep "Build an API for user management"
/clavix:prd  # Full PRD workflow
```

**Supported agents**: Claude Code, Cursor, Windsurf, and [20+ more providers](docs/providers.md)

### Direct CLI Usage (Alternative)

You can also use Clavix directly from the terminal:

```bash
clavix init
clavix fast "Create a login page"
clavix deep "Build an API for user management"
clavix prd
```

**Note**: CLI usage is primarily for initialization and state management. AI agents handle the workflow orchestration via slash commands.

## Full documentation
- Overview & navigation: [docs/index.md](docs/index.md)
- Command reference: [docs/commands/](docs/commands/README.md)
- Providers: [docs/providers.md](docs/providers.md)
- CLEAR Framework: [docs/clear-framework.md](docs/clear-framework.md)
- Guides: [docs/guides/](docs/guides/workflows.md)

## Development
- Requires Node.js ≥ 18
- Run tests: `npm test`
- Lint: `npm run lint`
- Build: `npm run build`

## License
MIT
