# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [5.3.0] - 2025-11-27

### BREAKING CHANGES

- **Session persistence removed** - The `.clavix/sessions/` directory is no longer created or used. Session-based workflows are now handled entirely by AI agent context.

### Added

- **Adapter registry infrastructure** - New config-driven adapter system (`adapter-registry.ts`, `universal-adapter.ts`) enables consistent adapter behavior through configuration rather than code duplication.

- **Init reconfiguration menu** - When running `clavix init` in an already-initialized project, a menu offers three options:
  - "Reconfigure integrations" - Change selected integrations
  - "Update existing" - Regenerate commands for current integrations
  - "Cancel" - Exit without changes

- **Removed commands consistency test** - New test suite (`removed-commands.test.ts`) verifies deprecated commands are properly removed from CLI, manifest, and documentation.

- **Template component manifest** - New `MANIFEST.md` documents all reusable components in the template system.

### Changed

- **Config command eliminated** - `clavix config` functionality has been merged into `clavix init`:
  - Use `clavix init` → "Reconfigure integrations" to change integrations
  - Use `clavix init` → "Update existing" to regenerate commands

- **Legacy cleanup utility deprecated** - `legacy-command-cleanup.ts` is now marked for removal in v6.0.0 as the transition period for old naming patterns completes.

### Removed

- **`clavix config` command** - Use `clavix init` instead (see Changed section)

- **Orphaned template components** - Removed unused `decision-rules.md` and `error-handling.md` from `_components/`

- **Session references in templates** - Removed session-related content from `agents.md`, `copilot-instructions.md`, `warp.md`, `plan.md`, and `file-operations.md`

### Fixed

- **Test suite improvements** - Added comprehensive tests for:
  - Update command flag behavior (docs-only, commands-only, force)
  - Init reconfiguration menu flows
  - v5.3 removed features (sessions directory, config command)

---

## [5.2.1] - 2025-11-27

### Fixed

- **Diagnose command false warnings** - Fixed 3 bugs where `clavix diagnose` showed incorrect warnings after successful `clavix init`:
  - No longer expects `.clavix/commands/` directory (commands go to adapter-specific directories)
  - Recognizes doc generator integrations (agents-md, octo-md, warp-md, copilot-instructions) as valid
  - Removed misleading "No slash commands installed" check

---

## [5.2.0] - 2025-11-27

### Added

- **New `clavix diagnose` command** - Full diagnostic report for troubleshooting installations
  - Version check
  - Directory structure validation
  - Config integrity verification
  - Integration status with command counts
  - Template integrity check
  - Summary with recommendations

- **Slash commands in `--help`** - Help output now shows available slash commands alongside CLI commands

- **Feature matrix in README** - Clear comparison of capabilities across integrations (Claude Code, Cursor, Gemini, etc.)

### Changed

- **DRY adapter architecture** - Created `TomlFormattingAdapter` base class eliminating ~140 lines of duplication across Gemini, Qwen, and LLXPRT adapters

- **DRY documentation generators** - Refactored `AgentsMdGenerator`, `OctoMdGenerator`, `WarpMdGenerator`, and `CopilotInstructionsGenerator` to use `DocInjector` utility

- **Verify/Archive reorganized** - Now clearly documented as "Agentic Utilities" separate from core workflow commands

### Removed

- **Global config flag** - Removed unimplemented `-g/--global` flag from `clavix config` command

- **Vestigial v4 config types** - Removed ~90 lines of unused `IntelligenceConfig`, `EscalationThresholdsConfig`, `QualityWeightsConfig`, and `PatternSettingsConfig` interfaces

### Fixed

- **Consistent documentation** - All agent templates (CLAUDE.md, AGENTS.md, OCTO.md, WARP.md, copilot-instructions.md) now have consistent verify/archive categorization

---

## [5.1.1] - 2025-11-27

### Changed

- Consolidated `execute` into `implement` command
- Removed standalone `prompts` command (now part of implement workflow)

---

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

**8 Slash Commands (executed by AI agents):**
- `/clavix:improve` - Prompt optimization
- `/clavix:prd` - PRD generation
- `/clavix:plan` - Task breakdown
- `/clavix:implement` - Task/prompt execution (auto-detects source)
- `/clavix:start` - Conversational exploration
- `/clavix:summarize` - Extract requirements from conversation
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
