# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [5.0.0] - 2025-11-27

### BREAKING: Agentic-First Architecture

**Clavix v5 is a complete architectural rewrite.** The TypeScript intelligence layer has been removed in favor of a lean, agentic-first design where markdown templates are the product.

#### Why This Change?

Analysis revealed that **99% of Clavix usage was through slash commands** in AI IDEs (Claude Code, Cursor, etc.), where AI agents read markdown templates and execute them using their native tools. The TypeScript intelligence layer (~18,500 lines) only executed via rarely-used CLI commands.

v5 embraces reality: **templates instruct agents directly**, no TypeScript code runs during workflow execution.

#### What's Removed

| Component | Lines Removed |
|-----------|---------------|
| CLI commands (15) | ~5,800 |
| Intelligence layer | ~7,790 |
| Core managers (14) | ~5,200 |
| Tests for removed code | ~31,300 |
| **Total** | **~50,000 lines** |

##### Removed CLI Commands
- `clavix improve`, `clavix prd`, `clavix plan`, `clavix implement`
- `clavix start`, `clavix summarize`, `clavix execute`, `clavix verify`
- `clavix archive`, `clavix analyze`, `clavix task-complete`
- `clavix list`, `clavix show`, `clavix prompts list/clear`

##### Removed Core Modules
- `universal-optimizer.ts`, `quality-assessor.ts`, `pattern-library.ts`
- `intent-detector.ts`, `confidence-calculator.ts`
- 20 pattern files in `intelligence/patterns/`
- `prompt-manager.ts`, `session-manager.ts`, `task-manager.ts`
- `archive-manager.ts`, `git-manager.ts`, `prd-generator.ts`
- `verification-manager.ts`, `question-engine.ts`

#### What Remains

**4 CLI Commands (for setup only):**
| Command | Purpose |
|---------|---------|
| `clavix init` | Initialize Clavix in a project |
| `clavix update` | Update templates after package update |
| `clavix config` | Manage configuration |
| `clavix version` | Show version |

**9 Slash Commands (executed by AI agents):**
- `/clavix:improve` - Prompt optimization
- `/clavix:prd` - PRD generation
- `/clavix:plan` - Task breakdown
- `/clavix:implement` - Task execution
- `/clavix:start` - Conversational exploration
- `/clavix:summarize` - Extract requirements from conversation
- `/clavix:execute` - Execute saved prompts
- `/clavix:verify` - Verify implementation
- `/clavix:archive` - Archive completed projects

**22 Integration Adapters** - All adapters remain for multi-tool support.

#### How It Works Now

1. User runs `/clavix:improve "prompt"` in their AI IDE
2. AI agent reads the markdown template at `.clavix/commands/improve.md`
3. Agent follows instructions using native tools (Write, Read, Edit, etc.)
4. Output saved to `.clavix/outputs/`

No TypeScript code executes. Templates are self-contained instructions.

#### Template Updates

Templates updated for v5 agentic-first approach:
- Removed CLI command references (agents use native tools)
- Removed `.index.json` - prompts use frontmatter metadata
- Added explicit "How I Do It" sections for agent operations
- Updated file format documentation

#### Migration from v4

If you have v4 projects:
1. Run `npm install -g clavix@latest`
2. Run `clavix update` in your project
3. Old outputs in `.clavix/outputs/` are preserved
4. v4 CLI commands no longer exist - use slash commands instead

#### For v4 Documentation

See [docs/archive/v4-architecture.md](docs/archive/v4-architecture.md) for the previous architecture.

---
