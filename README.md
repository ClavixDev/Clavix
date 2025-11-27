# Clavix
> Prompt optimization for AI coding. Transform rough ideas into structured, actionable prompts using pattern-based analysis—no framework to learn.

## Table of contents
- [Why Clavix?](#why-clavix)
- [How It Works](#how-it-works)
- [Providers](#providers)
- [Quickstart](#quickstart)
- [Full documentation](#full-documentation)

## Release Notes

| Version | Highlights | Details |
| --- | --- | --- |
| **v3.6.1** (Latest) | Documentation hierarchy & verbosity reduction | [Changelog](CHANGELOG.md#361---2025-11-24) |
| **v3.6.0** | Enhanced generic connector instructions | [Changelog](CHANGELOG.md#360---2025-11-24) |
| **v3.5.0** | "Providers" → "Integrations" terminology | [Changelog](CHANGELOG.md#350---2025-01-24) |
| **v3.4.0** | Provider categorization fixes | [Changelog](CHANGELOG.md#340---2025-11-24) |

**Requirements:** Node.js ≥ 16.0.0 (ESM support required)

## Why Clavix?
Better prompts lead to better code. Clavix analyzes what you're trying to do and applies structured optimization patterns—no framework to learn, no methodology to master. Just describe what you want, and Clavix structures it for AI consumption.

**What Clavix provides:**
- **Pattern-based intent detection** - Weighted keyword scoring across 11 intent categories
- **20 optimization patterns** - Automatically applied based on intent and quality assessment
- **Workflow management** - PRD generation, task breakdown, and implementation tracking
- **Universal integration** - Supports 20+ AI coding assistants with native slash commands

Learn more in [docs/why-clavix.md](docs/why-clavix.md).

## How It Works
Clavix uses pattern-based analysis to:
- **Detect intent** - Keyword scoring and phrase detection across 11 intent categories
- **Assess quality** - Heuristic scoring across 6 dimensions: Clarity, Efficiency, Structure, Completeness, Actionability, Specificity
- **Apply patterns** - 20 optimization patterns automatically selected based on intent and quality
- **Generate output** - Structured prompts optimized for AI coding assistants

Optimization applies automatically—no frameworks to learn, no manual analysis required. Just describe what you want in plain language, and Clavix structures it into an AI-ready prompt.

See [docs/philosophy.md](docs/philosophy.md) for an honest look at what Clavix is and isn't.

## Providers

| Category | Providers |
| --- | --- |
| IDE & editor extensions | Cursor · Windsurf · Kilocode · Roocode · Cline |
| CLI agents | Claude Code · Droid CLI · CodeBuddy CLI · OpenCode · Gemini CLI · Qwen Code · LLXPRT · Amp · Crush CLI · Codex CLI · Augment CLI |
| Universal adapters | AGENTS.md · GitHub Copilot · OCTO.md · WARP.md |

Provider paths and argument placeholders are listed in [docs/integrations.md](docs/integrations.md).

## Quickstart

### For AI Agents (Recommended)

Most Clavix users work through AI coding assistants:

> **💡 Choosing Your Workflow:**
> - **Improve** – Optimize a single prompt (auto-selects depth)
> - **PRD** – Plan something new with guided questions
> - **Start** – Explore ideas conversationally
>
> See [Choosing the Right Workflow](docs/guides/choosing-workflow.md) for detailed guidance.

```bash
# 1. Initialize in your project
npm install -g clavix
clavix init

# 2. Use slash commands in your AI agent
/clavix:improve "Create a login page"     # Optimize a prompt
/clavix:prd                                # Full PRD workflow
/clavix:start                              # Conversational exploration

# 3. Manage saved prompts
/clavix:execute  # Execute saved prompts
/clavix:verify   # Verify implementation against checklist

# 4. Implement with task tracking
/clavix:plan              # Generate tasks from PRD
/clavix:implement         # Start implementation workflow
clavix task-complete <taskId>  # Mark tasks done with auto-commit
```

**Supported agents**: Claude Code, Cursor, Windsurf, and [17+ more providers](docs/integrations.md)

Learn more: [Workflow guide](docs/guides/choosing-workflow.md)

### Direct CLI Usage (Alternative)

You can also use Clavix directly from the terminal:

```bash
clavix init
clavix improve "Create a login page"           # Auto-selects depth
clavix improve --comprehensive "Complex API"   # Force comprehensive
clavix prd
```

## Full documentation
- Overview & navigation: [docs/README.md](docs/README.md)
- Command reference: [docs/commands/](docs/commands/README.md)
- Providers: [docs/integrations.md](docs/integrations.md)
- How it works: [docs/how-it-works.md](docs/how-it-works.md)
- Philosophy: [docs/philosophy.md](docs/philosophy.md)
- Guides: [docs/guides/](docs/guides/workflows.md)

## Requirements

### For End Users
- **Node.js ≥ 16.0.0** (ESM support required)
- npm or yarn package manager

### For Contributors
- **Node.js ≥ 16.0.0**
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
