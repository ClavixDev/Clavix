# Clavix
> Agentic-first prompt workflows. Markdown templates that teach AI agents how to optimize prompts, create PRDs, and manage implementation. Works with Claude Code, Cursor, Windsurf, and 19+ other AI coding tools.

## Table of contents
- [Why Clavix?](#why-clavix)
- [How It Works](#how-it-works)
- [Supported AI Tools](#supported-ai-tools)
- [Quickstart](#quickstart)
- [Full documentation](#full-documentation)

## Release Notes

| Version | Highlights | Details |
| --- | --- | --- |
| **v5.5.0** (Latest) | Architecture cleanup, consolidated adapters, documentation overhaul | [Changelog](CHANGELOG.md) |
| **v5.0.0** | Agentic-first architecture - lean template delivery | [Changelog](CHANGELOG.md#500---2025-01-27) |

**Requirements:** Node.js >= 18.0.0

## Why Clavix?

Better prompts lead to better code. Clavix provides **markdown templates** that teach AI agents how to:
- **Optimize prompts** - Transform rough ideas into structured, AI-ready prompts
- **Create PRDs** - Generate comprehensive requirements documents through guided questions
- **Plan implementations** - Break down PRDs into phased task lists
- **Track progress** - Manage task completion with optional git commits

**No framework to learn.** Just describe what you want, and your AI agent follows the Clavix templates to structure it properly.

Learn more in [docs/why-clavix.md](docs/why-clavix.md).

## How It Works

Clavix v5 follows an **agentic-first architecture**:

1. **You run `clavix init`** - Sets up `.clavix/` directory with slash command templates
2. **You invoke a slash command** - Like `/clavix:improve` in Claude Code or Cursor
3. **Your AI agent reads the template** - The markdown file contains all instructions
4. **The agent follows the instructions** - Using its native tools (Write, Read, Edit, etc.)
5. **Output is saved** - To `.clavix/outputs/` for future reference

**No TypeScript code executes during slash command usage.** The templates are the product - they instruct AI agents on what to do.

## Supported AI Tools

| Category | Tools |
| --- | --- |
| IDE extensions | Cursor, Windsurf, Kilocode, Roocode, Cline |
| CLI agents | Claude Code, Droid CLI, CodeBuddy CLI, OpenCode, Gemini CLI, Qwen Code, LLXPRT, Amp, Crush CLI, Codex CLI, Augment CLI |
| Universal adapters | AGENTS.md, GitHub Copilot, OCTO.md, WARP.md |

### Feature Matrix

| Feature | Claude Code | Cursor/Windsurf | Gemini/Qwen | Generic Agents |
|---------|-------------|-----------------|-------------|----------------|
| Slash commands | ✅ Native | ✅ Native | ✅ TOML | ❌ Read-only |
| Doc injection | ✅ CLAUDE.md | ✅ .cursor/rules | ✅ N/A | ✅ AGENTS.md |
| Namespace dirs | ✅ clavix/ | ✅ clavix/ | ✅ clavix/ | N/A |
| Auto-detection | ✅ Yes | ✅ Yes | ✅ Yes | N/A |

Full list and configuration: [docs/integrations.md](docs/integrations.md)

## Quickstart

### 1. Install and Initialize

```bash
npm install -g clavix
clavix init
```

This creates `.clavix/` with slash command templates and injects documentation into your CLAUDE.md (or equivalent).

### 2. Use Slash Commands

In your AI coding assistant (Claude Code, Cursor, etc.):

```
/clavix:improve "Create a secure login page with JWT"
```

The AI agent reads the improve template and:
- Analyzes your prompt for quality
- Applies optimization patterns
- Saves the improved version to `.clavix/outputs/prompts/`

### 3. Choose Your Workflow

**Core Workflows:**
| Command | When to Use |
|---------|-------------|
| `/clavix:improve` | Optimize a single prompt (auto-selects depth) |
| `/clavix:prd` | Plan something new with guided questions |
| `/clavix:start` | Explore ideas conversationally first |
| `/clavix:plan` | Generate tasks from a PRD |
| `/clavix:implement` | Execute tasks with progress tracking |
| `/clavix:summarize` | Extract requirements from conversation |

**Project Management:**
| Utility | Purpose |
|---------|---------|
| `/clavix:verify` | Check implementation against PRD requirements |
| `/clavix:archive` | Archive completed projects to `.clavix/archive/` |

See [Choosing the Right Workflow](docs/guides/choosing-workflow.md) for detailed guidance.

### 4. Keep Templates Updated

```bash
clavix update   # After npm update clavix
```

## CLI Commands

Clavix v5 has 4 CLI commands (for setup and diagnostics, not workflows):

| Command | Purpose |
|---------|---------|
| `clavix init` | Initialize or reconfigure Clavix in a project |
| `clavix update` | Update templates after package update |
| `clavix diagnose` | Check installation and report issues |
| `clavix version` | Show version |

**All workflows** (`/clavix:improve`, `/clavix:prd`, etc.) are **slash commands** that AI agents execute by reading markdown templates.

## Full documentation
- Overview & navigation: [docs/README.md](docs/README.md)
- Integrations: [docs/integrations.md](docs/integrations.md)
- How it works: [docs/how-it-works.md](docs/how-it-works.md)
- Philosophy: [docs/philosophy.md](docs/philosophy.md)

## Requirements

### For End Users
- **Node.js >= 18.0.0**
- npm or yarn package manager
- An AI coding assistant (Claude Code, Cursor, Windsurf, etc.)

### For Contributors
- **Node.js >= 18.0.0**
- Run tests: `npm test`
- Lint: `npm run lint`
- Build: `npm run build`

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
