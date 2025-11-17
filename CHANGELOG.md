# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.8.2] - 2025-11-17

### Added

#### Complete Documentation Coverage for v2.7-v2.8 Features

**Background**: Comprehensive documentation audit revealed critical gaps where recent features (v2.7.0 prompt lifecycle, v2.8.0 task generation, v2.8.1 task-complete) lacked user-facing documentation despite having excellent agent template coverage.

**Audit Results**:
- **Before**: 75% documentation coverage (15/17 commands documented)
- **After**: 100% documentation coverage (17/17 commands documented)
- **Gap**: 3 implemented commands with zero or partial user documentation

**New Command Documentation** (docs/commands/):

1. **task-complete.md** - Mark tasks as completed with validation and git auto-commit
   - Command syntax, flags (--no-git, --force, --config)
   - Integration with implement workflow
   - Git auto-commit strategy behavior (none/per-task/per-5-tasks/per-phase)
   - Auto-discovery of config files
   - Next task display after completion
   - Troubleshooting stale in-memory bug (fixed in v2.8.1)
   - Recovery options for common errors

2. **execute.md** - Execute saved prompts from fast/deep optimization
   - Interactive selection mode with status indicators (○ NEW / ✓ EXECUTED)
   - Auto-selection flags (--latest, --fast, --deep, --id)
   - Execution status tracking and prompt reusability
   - Storage cleanup suggestions (≥5 executed prompts)
   - CLI auto-save vs slash command manual save explanation (v2.8.1)
   - Troubleshooting prompt discovery and file errors

3. **prompts.md** - Manage saved prompts lifecycle (list/clear subcommands)
   - **List subcommand**: View prompts with age warnings and storage statistics
     - Status indicators: ○ NEW, ✓ EXECUTED
     - Age color coding: Gray (0-7d), Yellow (8-30d), Red (>30d)
     - Age warning labels: [OLD], [STALE]
     - Storage hygiene recommendations (stale/executed/total limits)
   - **Clear subcommand**: Safe cleanup with multiple filtering options
     - Filter flags: --executed (safe), --stale (>30d), --fast, --deep, --all
     - Safety mechanisms: unexecuted prompt warnings, confirmation prompts
     - Interactive mode with 6 cleanup options
     - Remaining storage statistics after deletion

**Enhanced Documentation** (docs/):

4. **docs/commands/implement.md** - Git Auto-Commit Strategies section (150+ lines)
   - All 4 strategies documented in detail:
     - `none` (default since v2.8.1): Manual git workflow
     - `per-task`: Commit after every task
     - `per-5-tasks`: Commit every 5 tasks
     - `per-phase`: Commit when phase completes
   - When to use each strategy (use cases, project types, team workflows)
   - Commit message formats with examples
   - Strategy override mechanisms (--no-git flag, mid-implementation changes)
   - Git repository detection and validation logic
   - Breaking change note (v2.8.1 default changed from per-task to none)

5. **docs/commands/plan.md** - Task Generation Algorithm section (280+ lines)
   - Hierarchical parsing strategy (top-level features vs nested details)
   - Before/after examples (401 tasks → 25 tasks real-world case study)
   - Behavior section grouping (numbered feature with Behavior = 1 task)
   - Warning thresholds:
     - Feature count warning (>50 top-level features)
     - Task count warning (>50 tasks per phase)
   - PRD structuring best practices (Do's and Don'ts)
   - Algorithm flowchart (PRD → Extract → Filter → Group → Check → Generate)
   - Troubleshooting (too many/too few tasks, missing details)

6. **docs/guides/workflows.md** - Prompt Lifecycle Management section
   - Complete v2.7+ workflow: optimize → review → execute → cleanup
   - Alternative workflow paths (fast/deep/PRD)
   - Review saved prompts (status, age warnings, statistics)
   - Execute when ready (quick/filtered/interactive/specific)
   - Clean up prompts (safe/stale/source/interactive)
   - Best practice: `clavix prompts clear --executed` after execution
   - Git auto-commit strategies in "Execute tasks" section

7. **README.md** - Prompt Saving Modes clarification
   - CLI Usage (Auto-Save): Direct file system access, automatic saving
   - Slash Command Usage (Agent Manual Save): Requires Write tool execution
   - Why the difference explained (Node.js vs agent tool architecture)
   - Added task-complete to quickstart workflow (#4)

**Agent Template Coverage**:

8. **src/templates/slash-commands/_canonical/task-complete.md** - New canonical template
   - Prerequisites (implement config, tasks.md)
   - Task ID verification workflow
   - Git auto-commit behavior by strategy
   - Command output handling (success/already-complete/all-done)
   - Error recovery for task not found, config missing, file errors
   - Best practices (never manual edit, verify completion, use --no-git for experiments)

9. **Provider Template Updates** - All 4 provider templates updated:
   - `agents.md` - Added task-complete to command reference table
   - `octo.md` - Added to CLI reference cheat sheet
   - `warp.md` - Added to common commands list
   - `copilot-instructions.md` - Added to Strategic Planning section

**Documentation Index Updates**:
- `docs/commands/README.md` - Added 3 new command entries (task-complete, execute, prompts)

**Impact**:
- Users can now discover and use task-complete command (previously hidden despite critical workflow role)
- Prompt lifecycle workflow fully documented end-to-end
- Git auto-commit strategies explained for informed decision-making
- Task generation algorithm documented for PRD optimization
- All 17 CLI commands have comprehensive user-facing documentation
- Agent templates maintain command parity across all 4 providers

**Files Created**: 4 new documentation files
**Files Updated**: 9 existing documentation files
**Lines Added**: ~1,500 lines of comprehensive documentation

## [2.8.1] - 2025-11-17

### Fixed

#### Prompt Saving in Agent Execution Context

**Problem**: Templates for `/clavix:fast` and `/clavix:deep` slash commands did not instruct AI agents to save prompts when executed directly. Only the CLI commands (`clavix fast` / `clavix deep`) automatically saved prompts, breaking the prompt lifecycle workflow for agent-driven workflows.

**Root Cause**: Templates violated the AI-Agent-First Design Philosophy by assuming automatic saving without providing explicit agent instructions, creating a gap between CLI behavior and slash command behavior.

**Solution**: Implemented Dual Mode (Hybrid) approach with explicit saving instructions:

**Template Updates:**

1. **Canonical Templates** (`fast.md`, `deep.md`):
   - Added comprehensive "Saving the Prompt (REQUIRED)" section with conditional logic
   - **Step 1**: Directory creation (`mkdir -p .clavix/outputs/prompts/{fast|deep}`)
   - **Step 2**: Prompt ID generation (`{fast|deep}-YYYYMMDD-HHMMSS-<random>`)
   - **Step 3**: File creation with frontmatter (Write tool instructions)
   - **Step 4**: Index update (`.index.json` management)
   - **Step 5**: Verification confirmation
   - Added troubleshooting section for saving errors

2. **Provider Templates** (agents.md, octo.md, warp.md, copilot-instructions.md):
   - Updated command reference tables to clarify: "CLI auto-saves; slash commands require manual saving per template instructions"
   - Updated workflow documentation to reflect dual saving modes

**File Format Specification:**
```markdown
---
id: <prompt-id>
source: {fast|deep}
timestamp: <ISO-8601>
executed: false
originalPrompt: <original text>
---

# Improved Prompt
<CLEAR-optimized content>

## CLEAR Scores
- C, L, E (fast) or C, L, E, A, R (deep)

## Original Prompt
<original text>
```

**Testing:**
- Added comprehensive template coverage tests (v2.8.1) validating:
  - Presence of saving instructions in canonical templates
  - Step-by-step format verification
  - File format specification completeness
  - Troubleshooting section coverage
  - Provider template clarification language

**Files Modified:**
- `src/templates/slash-commands/_canonical/fast.md` - Added 100+ lines of saving instructions
- `src/templates/slash-commands/_canonical/deep.md` - Added 100+ lines of saving instructions (with A/R components)
- `src/templates/agents/agents.md` - Updated command table descriptions
- `src/templates/agents/octo.md` - Updated CLI reference
- `src/templates/agents/warp.md` - Updated common commands list
- `src/templates/agents/copilot-instructions.md` - Updated prompt improvement and lifecycle workflow sections
- `tests/integration/template-coverage.test.ts` - Added 10 new test cases

**Impact:**
- ✅ Prompts now save consistently in both CLI and agent execution contexts
- ✅ Agents receive explicit, actionable instructions (not passive documentation)
- ✅ Prompt lifecycle workflow (optimize → review → execute → cleanup) now works end-to-end
- ✅ Compliance with AI-Agent-First Design Philosophy and Template Quality Checklist

**Example Agent Workflow:**
```bash
# User runs /clavix:fast "create login page"
# Agent executes template → performs CLEAR analysis → follows saving steps:

1. mkdir -p .clavix/outputs/prompts/fast
2. Generate ID: fast-20250117-143022-a3f2
3. Write file with frontmatter and content
4. Update .index.json with metadata
5. Verify and confirm: ✓ Prompt saved: fast-20250117-143022-a3f2.md
6. Continue to /clavix:execute --latest
```

## [2.8.0] - 2025-11-17

### ⚠️ BREAKING CHANGES - ESM Migration

**Node.js 16+ Required**: Clavix is now a pure ESM package using TypeScript NodeNext module system.

#### Why This Migration?

**Future-Proofing & Modern Standards:**
- ESM is the JavaScript standard (CommonJS is legacy)
- Required for modern dependencies (chalk v5+, ora v8+, inquirer v10+)
- Better tree-shaking and bundle optimization
- Native TypeScript support with proper module resolution

**Immediate Benefits:**
- ✅ Unlocked chalk v5.4.1 (from v4.1.2) - Better color support and performance
- ✅ Modern dependency ecosystem access
- ✅ Faster startup times with native ES modules
- ✅ Improved type safety with NodeNext resolution

#### Migration Requirements

**For End Users:**
```bash
# Minimum Node.js version
node --version  # Must be v16.0.0 or higher

# Upgrade Clavix
npm install -g clavix@2.8.0

# No code changes needed - CLI usage unchanged
clavix init
clavix prd
clavix plan
```

**For Developers/Contributors:**
```bash
# Install dependencies
npm install

# Build (now uses ES2020 modules)
npm run build

# Run tests (with ESM experimental flag)
npm test  # Uses --experimental-vm-modules for Jest
```

#### What Changed Internally

**Package Configuration (`package.json`):**
- Added `"type": "module"` for pure ESM
- Updated exports to ESM syntax
- All dependencies now use ESM-compatible versions
- Chalk upgraded: v4.1.2 → v5.4.1

**TypeScript Configuration (`tsconfig.json`):**
- `module`: `"CommonJS"` → `"ES2020"`
- `moduleResolution`: `"node"` → `"NodeNext"`
- `target`: `"ES2020"` → `"ES2021"`
- Added `"lib": ["ES2021"]` for modern JS features

**Source Code (139 files modified):**
- Import syntax: `require()` → `import` statements
- Export syntax: `module.exports` → `export` declarations
- File extensions: Added `.js` to all relative imports
- `__dirname` replacement: Custom utility for ESM compatibility
- Dynamic imports: `await import()` for runtime loading

**Build & Testing:**
- Jest configuration: Added `--experimental-vm-modules` flag
- Jest config: Converted `jest.config.js` → `jest.config.mjs`
- All test imports: Updated to use `import` from `@jest/globals`
- Template loading: Updated for ESM module resolution
- Binary shebang: Maintained `#!/usr/bin/env node` compatibility

#### Files Modified Summary

**Core Infrastructure (10 files):**
- `package.json` - ESM type, exports, dependencies
- `tsconfig.json` - NodeNext module system
- `jest.config.mjs` - ESM-compatible Jest config
- `bin/clavix.js` - ESM entry point
- `src/index.ts` - ESM exports
- Build scripts and utilities

**Source Code (129 files):**
- All CLI commands (15 files in `src/cli/commands/`)
- All core modules (15 files in `src/core/`)
- All adapters (16 files in `src/core/adapters/`)
- All utilities (5 files in `src/utils/`)
- All tests (78 files in `tests/`)

#### Validation & Testing

✅ **All 1581 tests passing** with ESM configuration
✅ **Zero regressions** - All functionality preserved
✅ **Build succeeds** - TypeScript compilation error-free
✅ **Runtime verified** - All CLI commands working
✅ **Coverage maintained** - 90%+ test coverage preserved

#### Rollback Plan (If Needed)

If you encounter issues with v2.8.0:

```bash
# Downgrade to v2.8.1 (pre-ESM)
npm install -g clavix@2.8.1

# Or use npx for isolated execution
npx clavix@2.8.1 init
```

**Known compatibility:**
- Works on: Node.js 16.x, 18.x, 20.x, 21.x, 22.x
- Does NOT work on: Node.js 14.x or earlier (ESM support incomplete)

---

### 🎉 NEW FEATURE - Intelligent Task Generator

#### Problem Solved

**Before v2.8.0:** The `clavix plan` command generated excessive, unusable task breakdowns:
- 401 tasks in 80 phases for ESM migration PRD (should be ~30 tasks)
- Every nested bullet treated as separate feature
- Fixed 5-task boilerplate for all features (implement, test, integrate, document, validate)
- No hierarchical understanding of PRD structure

**After v2.8.0:** Smart, context-aware task generation:
- 15-30 tasks in 5-8 logical phases for same PRD
- Only top-level features extracted (nested bullets = implementation details)
- Context-aware templates (1-2 tasks per feature, not fixed 5)
- Intelligent phase grouping by category

#### What Changed

**1. Hierarchical PRD Parsing** (`src/core/task-manager.ts:extractListItems()`)
- Line-by-line parsing instead of flat regex matching
- Only extracts bullets with ZERO indentation (top-level features)
- Skips nested bullets (constraints, requirements, sub-details)
- Filters out code examples and file paths
- Detects implementation details ("must", "should", "required")

**Example:**
```markdown
Before: Treated as 3 separate tasks ❌
- User authentication
  - Password must be 8+ characters
  - Email validation required

After: 1 feature with 2 implementation details ✅
- User authentication (→ 2 tasks: implement + test)
```

**2. Context-Aware Task Templates** (`src/core/task-manager.ts:buildFeatureTaskDescriptions()`)

| Feature Type | Old | New | Example |
|--------------|-----|-----|---------|
| Configuration | 5 tasks | **1 task** | "Update tsconfig.json for ESM" |
| Documentation | 5 tasks | **1 task** | "Update CHANGELOG.md" |
| Testing | 5 tasks | **2 tasks** | Implement + Verify passes |
| Conversion | 5 tasks | **2 tasks** | Convert + Test works |
| Default | 5 tasks | **2 tasks** | Implement + Add tests |

**Result:** ~50% reduction in task count for same features

**3. Task Grouping by Category** (`src/core/task-manager.ts:groupFeaturesByCategory()`)

Instead of "1 bullet = 1 phase", features are intelligently grouped:
- **Configuration & Setup** - Config files, dependencies, environment
- **Core Implementation** - Main features and functionality
- **Testing & Validation** - Test suites, QA, verification
- **Documentation** - README, CHANGELOG, guides
- **Integration & Release** - Build, deploy, publish

**Result:** 5 logical phases instead of 80 arbitrary phases

**4. Granularity Controls** (`src/core/task-manager.ts:generatePhasesFromCoreFeatures()`)
- Warning if >50 top-level features detected in PRD
- Warning if >50 total tasks generated
- Automatic skipping of empty phases
- Suggestion to simplify over-detailed PRDs

#### Real-World Impact

**Test Case: Authentication Feature PRD**
- **Before:** 31 tasks in 3 phases (every constraint = separate task)
- **After:** 15 tasks in 2 phases (52% reduction)
- **Quality:** All essential work captured, no boilerplate bloat

**ESM Migration PRD (This Release):**
- **Old generator:** 401 tasks in 80 phases (unusable)
- **Manual planning:** 34 tasks in 8 phases (optimal)
- **New generator:** Expected 20-30 tasks in 5-8 phases (usable)

#### Code Changes

**Modified Files (1):**
- `src/core/task-manager.ts` - 260+ lines changed
  - Lines 263-413: Hierarchical parsing logic
  - Lines 220-323: Category grouping logic
  - Lines 415-461: Context-aware templates
  - New methods: `looksLikeCodeOrPath()`, `looksLikeImplementationDetail()`, `groupFeaturesByCategory()`

**Documentation:**
- `ESM_MIGRATION_NOTES.md` - Complete analysis and algorithm documentation

**Testing:**
- ✅ All 1581 tests passing
- ✅ New validation test with authentication PRD
- ✅ Zero regressions in existing workflows

#### User Experience

**Before v2.8.0:**
```bash
clavix plan
# Generated tasks.md with 401 tasks
# 80 phases to manage
# Unusable for actual implementation
```

**After v2.8.0:**
```bash
clavix plan
# Generated tasks.md with 25 tasks
# 5 logical phases
# Actually implementable workflow

# Smart warnings when PRD is too detailed:
⚠️  Warning: PRD contains 72 top-level features. Consider grouping related items.
⚠️  Warning: Generated 58 tasks. Consider merging related tasks or simplifying PRD.
```

#### Future Enhancements (Not in 2.8.0)

Potential improvements for future versions:
- `--granularity` CLI flag to control task detail level
- PRD linting to warn about over-detailed specifications
- Custom category definitions via `.clavixrc`

---

### 📚 Documentation

**Updated Files:**
- `ESM_MIGRATION_NOTES.md` - Complete ESM migration and task generator analysis
- `README.md` - Node.js 16+ requirement (coming in this commit)
- `CHANGELOG.md` - This comprehensive entry

---

### 🎯 Upgrade Checklist

**For End Users:**
- [ ] Verify Node.js version: `node --version` (must be ≥16.0.0)
- [ ] Upgrade Clavix: `npm install -g clavix@2.8.0`
- [ ] Test workflow: `clavix init` in a test project
- [ ] Verify slash commands work in your IDE

**For Contributors:**
- [ ] Pull latest: `git pull origin main`
- [ ] Clean install: `rm -rf node_modules package-lock.json && npm install`
- [ ] Build: `npm run build`
- [ ] Test: `npm test` (should show 1581 passing tests)
- [ ] Verify ESM imports work: Check any custom integrations

---

### 🔗 Related Issues

- ESM Migration enables chalk v5+ (better color support)
- Task generator fix makes `clavix plan` actually usable
- Zero breaking changes for CLI users (only internal module system)

---

### 📦 Package Details

**Version:** 2.8.0
**Release Date:** 2025-11-17
**Commit:** `dc02eea` (ESM migration) + `0658c3a` (task generator fix)
**Total Changes:** 139 files modified, 1581 tests passing

---

## [2.8.1] - 2025-11-17

### ⚠️ Breaking Changes

- **`clavix implement`**: Now defaults to `--commit-strategy=none` (manual git workflow) instead of showing interactive prompt
  - **Migration**: To enable auto-commits, explicitly specify: `clavix implement --commit-strategy=<type>`
  - **Options**: `per-task`, `per-5-tasks`, `per-phase`, `none`
  - **Rationale**: Enables AI agents to execute implementation workflows without blocking on interactive prompts

### ✨ New Features - Agent-Friendly Execution

Transform Clavix into a fully non-blocking tool for AI agent automation.

**Agent-First Commands:**
- **`clavix implement --commit-strategy=<type>`**: Explicit git strategy selection (no interactive prompt)
  - Defaults to `'none'` (manual git workflow) if flag not provided
  - Agents can optionally ask users for git preference when tasks.md has >3 phases
  - Maintains all existing git automation capabilities

- **`clavix archive --yes` / `-y`**: Skip all confirmation prompts
  - Archive projects without user interaction: `clavix archive my-project --yes`
  - Restore projects without confirmation: `clavix archive --restore project-1 --yes`

- **`clavix update --force`**: Skip legacy cleanup confirmation (fixed)
  - Previously `--force` didn't skip all prompts
  - Now fully non-interactive: `clavix update --force`

### 🤖 Agent Template Updates

Updated all agent integration templates with git strategy workflow guidance:
- `src/templates/slash-commands/_canonical/implement.md` - Added git strategy selection workflow
- `src/templates/agents/agents.md` - Added "Implementation with Git Strategy" section
- `src/templates/agents/octo.md` - Added git auto-commit strategy guidance
- `src/templates/agents/warp.md` - Updated command list with flags
- `src/templates/agents/copilot-instructions.md` - Updated strategic planning section

### 🔧 Bug Fixes & Improvements

- **`task-complete.ts`**: Fixed stale in-memory bug preventing task advancement
  - Root cause: `phases` object not refreshed after marking task complete in file
  - Fix: Re-read tasks.md after successful completion to sync in-memory state
  - Impact: `clavix task-complete` now correctly shows NEXT task instead of same task

- **`prompts/clear.ts`**: `--force` flag already correctly skips all prompts ✅
- **`archive.ts`**: Added comprehensive `--yes` flag support across all confirmation prompts

### 📚 Modified Files (12 total)

**CLI Commands (6)**:
- `src/cli/commands/implement.ts` - Removed git prompt, default to 'none'
- `src/cli/commands/task-complete.ts` - Fixed stale phases bug
- `src/cli/commands/archive.ts` - Added --yes flag
- `src/cli/commands/update.ts` - Fixed --force to skip legacy cleanup
- `src/cli/commands/prompts/clear.ts` - Verified --force works correctly

**Templates (5)**:
- `src/templates/slash-commands/_canonical/implement.md`
- `src/templates/agents/agents.md`
- `src/templates/agents/octo.md`
- `src/templates/agents/warp.md`
- `src/templates/agents/copilot-instructions.md`

### 🎯 Why This Matters

**Before v2.8.1:**
```bash
# Agent executes /clavix:implement
clavix implement
# ❌ BLOCKS on interactive git strategy prompt
# Agent workflow cannot continue
```

**After v2.8.1:**
```bash
# Agent executes with default
clavix implement
# ✅ Proceeds immediately (default: manual git)

# Or agent asks user, then specifies:
clavix implement --commit-strategy=per-phase
# ✅ No prompts, full automation
```

**Example Agent Workflow (Now Possible):**
```bash
# Full automation without blocking
clavix prd                                  # Human-guided PRD
clavix plan                                 # Generate tasks
clavix implement --commit-strategy=none     # Agent implements (no prompts)
clavix task-complete phase-1-setup-1        # Mark complete
clavix archive my-project --yes             # Archive (no confirmation)
```

### 📖 Documentation

Agent integration patterns documented in all provider templates. After running `clavix init`, see:
- `.claude/commands/clavix/implement.md` - Implementation workflow with git strategy
- `docs/agents.md` - Universal agent instructions
- Provider-specific templates (Octofriend, Warp, Copilot)

## [2.7.1] - 2025-11-17

### 🔧 Updates

#### Branding & Documentation
- Updated package metadata to reflect ClavixDev organization
- Updated homepage to https://clavix.dev/
- Updated repository references to ClavixDev/Clavix
- Enhanced Star History chart with theme support (dark/light mode)

**Migration notes:**
- Package name remains `clavix` (unchanged)
- All GitHub references now point to ClavixDev organization
- Homepage now redirects to official website

## [2.7.0] - 2025-11-17

### 🎉 New Features - Prompt Lifecycle Management

#### Prompt Persistence & Execution System
Transform vague ideas into executable prompts with full lifecycle tracking.

**Core Features:**
- **Automatic Prompt Saving**: Optimized prompts from `/clavix:fast` and `/clavix:deep` auto-saved to `.clavix/outputs/prompts/`
  - Fast prompts: `.clavix/outputs/prompts/fast/`
  - Deep prompts: `.clavix/outputs/prompts/deep/`
  - Each saved prompt includes:
    - Original user input
    - CLEAR-optimized version
    - CLEAR Framework scores (C, L, E for fast; full C, L, E, A, R for deep)
    - Metadata (timestamp, source, execution status)
    - Unique ID for tracking (`{source}-YYYYMMDD-HHMMSS-{hash}`)

- **`clavix execute` - Prompt Execution Command**
  ```bash
  clavix execute               # Interactive selection
  clavix execute --latest      # Execute most recent prompt
  clavix execute --latest --fast   # Latest fast mode prompt
  clavix execute --latest --deep   # Latest deep mode prompt
  clavix execute --id <prompt-id>  # Execute specific prompt by ID
  ```
  - Interactive prompt selection with details
  - Auto-marks prompts as EXECUTED after display
  - Storage cleanup suggestions post-execution
  - Agent-friendly with `--latest` flag

- **`clavix prompts list` - Lifecycle Visibility**
  ```bash
  clavix prompts list          # View all saved prompts
  ```
  - Status indicators: ✓ EXECUTED, ○ NEW
  - Age warnings: >7 days = OLD (yellow), >30 days = STALE (red)
  - Grouped by source (fast/deep)
  - Storage statistics dashboard:
    - Total prompts count
    - Fast vs deep breakdown
    - Executed vs pending counts
    - Oldest prompt age
  - Hygiene recommendations (stale prompts, executed cleanup, storage limits)

- **`clavix prompts clear` - Storage Hygiene Management**
  ```bash
  clavix prompts clear                 # Interactive cleanup
  clavix prompts clear --executed      # Clear executed prompts (safe)
  clavix prompts clear --stale         # Clear prompts >30 days old
  clavix prompts clear --fast          # Clear fast mode prompts
  clavix prompts clear --deep          # Clear deep mode prompts
  clavix prompts clear --all           # Clear all (with confirmation)
  clavix prompts clear --all --force   # Skip confirmations
  ```
  - Safety confirmations before deletion
  - Preview before cleanup
  - Unexecuted prompt warnings
  - Filter composition (combine flags)

#### Slash Commands - AI Agent Integration

- **`/clavix:execute` - Execute Saved Prompts**
  - Full integration with agent workflows
  - Supports interactive selection or `--latest` flag
  - Template includes agent recovery instructions
  - Cross-references to prompt management commands

- **`/clavix:prompts` - Manage Prompt Lifecycle**
  - Complete workflow documentation for agents
  - List, cleanup, and hygiene workflows
  - Best practices for lifecycle management
  - Storage health monitoring

### 🏗️ Technical Implementation

**New Core Module:**
- `src/core/prompt-manager.ts` - PromptManager class
  - `savePrompt()` - Save with metadata and frontmatter
  - `loadPrompt()` - Retrieve by ID
  - `listPrompts()` - Filter by source/executed/age
  - `deletePrompts()` - Remove with safety filters
  - `markExecuted()` - Update execution status
  - `getPromptAge()` - Calculate days since creation
  - `getStorageStats()` - Real-time statistics
  - Index management via `.index.json`
  - Age-based stale detection (>30 days)

**New CLI Commands:**
- `src/cli/commands/execute.ts` - Execution command with flags
- `src/cli/commands/prompts/list.ts` - Listing with statistics
- `src/cli/commands/prompts/clear.ts` - Cleanup with safety

**New Canonical Templates:**
- `src/templates/slash-commands/_canonical/execute.md` - Agent execution workflow
- `src/templates/slash-commands/_canonical/prompts.md` - Agent lifecycle management

**Updated Canonical Templates:**
- `src/templates/slash-commands/_canonical/fast.md` - Auto-save notification + next steps
- `src/templates/slash-commands/_canonical/deep.md` - Auto-save notification + next steps
- `src/templates/slash-commands/_canonical/archive.md` - Prompts exclusion documentation

**Updated Commands:**
- `src/cli/commands/fast.ts` - Integrated PromptManager, auto-saves after optimization
- `src/cli/commands/deep.ts` - Integrated PromptManager, auto-saves after optimization

### 📊 Workflow Improvements

**Before v2.7.0:**
```bash
clavix fast "create a login page"
→ See optimized prompt in terminal
→ Copy-paste manually
→ Implement
→ Prompt lost after session
```

**After v2.7.0:**
```bash
clavix fast "create a login page"
→ Auto-saved to .clavix/outputs/prompts/fast/fast-20251117-143022-a3f8.md
→ ✅ Prompt saved!

clavix prompts list
→ Review all saved prompts with status

clavix execute --latest
→ Select and implement when ready

clavix prompts clear --executed
→ Clean up after completion
```

### 🎯 Benefits

- **No Lost Prompts**: All CLEAR-optimized prompts automatically persisted
- **Review Before Execution**: See all saved prompts, choose when to implement
- **Lifecycle Awareness**: Age tracking prevents stale prompt accumulation
- **Storage Hygiene**: Easy cleanup of executed/old prompts with safety checks
- **Agent-Friendly**: Full slash command integration for AI coding assistants
- **Robustness**: Safety confirmations, preview before deletion, unexecuted warnings
- **Statistics Dashboard**: Real-time visibility into prompt storage health

### 📚 Documentation Updates

**Updated Files:**
- `CLAUDE.md` - Complete v2.7 workflow documentation
- `fast.md` / `deep.md` templates - Next steps with execute/prompts commands
- `archive.md` template - Prompts separation from PRD lifecycle
- New `execute.md` and `prompts.md` templates for agent workflows

### ⚡ Migration Notes

**Existing Users:**
- ✅ No breaking changes
- ✅ Old workflow still works (manual copy-paste)
- ✅ New workflow is opt-in (use `/clavix:execute`)
- ✅ Prompts saved automatically after upgrade

**Best Practices:**
1. Review prompts weekly: `clavix prompts list`
2. Clear after execution: `clavix prompts clear --executed`
3. Remove stale prompts: `clavix prompts clear --stale`
4. Keep storage lean (<20 active prompts recommended)

**Complete Lifecycle:**
```
CREATE     → clavix fast/deep "requirement"
REVIEW     → clavix prompts list
EXECUTE    → clavix execute --latest
CLEANUP    → clavix prompts clear --executed
```

### 🔗 Related Commands

**Prompt Optimization:**
- `clavix fast` - Quick CLEAR improvements (C, L, E)
- `clavix deep` - Full CLEAR analysis (C, L, E, A, R)

**Prompt Management:**
- `clavix execute` - Execute saved prompts
- `clavix prompts list` - View all prompts
- `clavix prompts clear` - Cleanup prompts

**Slash Commands:**
- `/clavix:fast` - Quick optimization (auto-save)
- `/clavix:deep` - Deep optimization (auto-save)
- `/clavix:execute` - Execute saved prompts
- `/clavix:prompts` - Manage lifecycle

---

## [2.4.0] - 2025-11-16

### 🎯 Major Improvements

#### Template Architecture Overhaul
- **67% package size reduction**: 1.5MB → 830KB unpacked (159KB → 141.5KB compressed)
- **Single source of truth**: All templates now loaded from `_canonical/` directory
- **Zero duplication**: Eliminated 120 duplicate template files across 16 providers
- **TOML generation validated**: Gemini/Qwen .toml templates generated correctly from canonical .md source

#### Technical Changes
- Templates now stored in `src/templates/slash-commands/_canonical/`
- Runtime template generation per provider (TOML vs Markdown)
- Adapters handle format transformation via `formatCommand()`
- All 1462 tests passing with updated assertions

#### Architecture Benefits
- Single template maintenance point (8 files vs 128 files)
- Consistent content across all providers
- Easier updates and bug fixes

### 🔧 Breaking Changes

**None** - User-facing behavior is identical. Templates are generated at runtime instead of being pre-shipped.

### 📊 Impact

**Before:**
- 128 template files (16 providers × 8 templates)
- 1.2MB of duplicated content
- Manual synchronization needed across providers

**After:**
- 8 canonical templates
- 63KB total template size
- Automatic generation per provider

### ✅ Validation

- All 60 test suites passing
- 1462 tests passing
- TOML generation verified for Gemini/Qwen
- Markdown generation verified for all other providers
- Package size confirmed: 830.6KB unpacked

---

## [2.3.1] - 2025-11-16

### 🐛 Fixed
- **Consistent Provider Naming**: Updated AGENTS.md provider display name in `clavix init` to follow the same pattern as other universal adapters
  - Changed from: `'agents.md (Universal - for tools without slash commands)'`
  - Changed to: `'Agents (AGENTS.md - Universal - for tools without slash commands)'`
  - Now consistent with GitHub Copilot, Warp, and Octofriend naming patterns

---

## [2.3.0] - 2025-11-16

### ⚠️ Breaking Changes
- **GitHub Copilot Integration Migration**: Moved from non-working slash commands (`.github/agents/`) to official repository instructions (`.github/copilot-instructions.md`)
  - Old `.github/agents/clavix-*.agent.md` files no longer generated
  - Copilot now uses natural language instructions per [GitHub documentation](https://docs.github.com/en/copilot/how-tos/configure-custom-instructions/add-repository-instructions)
  - Copilot moved from "CLI Tools" to "Universal Adapters" section in `clavix init`

### ✨ Features
- **GitHub Copilot Instructions Generator**: New adapter for `.github/copilot-instructions.md`
  - Generates natural language Clavix workflow instructions for GitHub Copilot
  - Uses managed blocks (`<!-- CLAVIX:START -->` / `<!-- CLAVIX:END -->`) for easy updates via `clavix update`
  - Includes command reference, CLEAR Framework principles, and workflow patterns
  - Automatically creates `.github/` directory if needed

### 🗑️ Removed
- `CopilotAdapter` class (replaced with `CopilotInstructionsGenerator`)
- Copilot slash command templates (8 files: `archive.agent.md`, `deep.agent.md`, `fast.agent.md`, etc.)
- Agent type `'copilot'` (replaced with `'copilot-instructions'`)

### 🔧 Technical Changes
- **New Files**:
  - `src/templates/agents/copilot-instructions.md` - Copilot workflow instructions template
  - `src/core/adapters/copilot-instructions-generator.ts` - Generator class for `.github/copilot-instructions.md`
- **Modified Files**:
  - `src/cli/commands/init.ts` - Updated provider selection UI
  - `src/core/agent-manager.ts` - Removed CopilotAdapter registration
  - `src/types/agent.ts` - Updated AgentType union
- **Deleted Files**:
  - `src/core/adapters/copilot-adapter.ts`
  - `src/templates/slash-commands/copilot/*.agent.md` (8 files)

### 📚 Documentation
- Updated README.md: Copilot now listed under "Universal adapters"
- Updated docs/providers.md: Changed Copilot entry to GitHub Copilot with `.github/copilot-instructions.md` path
- CHANGELOG.md: This entry

### 🎯 Migration Guide
**For existing Copilot users:**
1. Run `clavix init` and select "GitHub Copilot (.github/copilot-instructions.md)"
2. Old `.github/agents/clavix-*.agent.md` files can be safely deleted
3. GitHub Copilot will now read instructions from `.github/copilot-instructions.md`
4. Use `clavix update` to refresh instructions in future versions

**Why this change?**
- GitHub Copilot doesn't support custom slash commands via `.github/agents/`
- Official documentation specifies `.github/copilot-instructions.md` for repository-wide instructions
- Natural language instructions provide better integration with Copilot's AI

---

## [1.9.0] - 2025-11-15

### ⚠️ Breaking Changes / Migrations
- Standardized flat-provider command filenames to `clavix-<command>` and relocated Cline workflows to `.clinerules/workflows/`; legacy filenames are auto-detected with an opt-out cleanup prompt during `clavix init` and `clavix update`.

### ✨ Enhancements
- Added adapter filename overrides and shared template loader so all providers respect the new naming scheme while keeping namespaced folders (e.g., `.claude/commands/clavix/`).
- Implemented legacy command cleanup utilities reused by init/update flows, preserving provider-specific formatting and supporting Gemini/Qwen namespace opt-outs.

### 🧪 Testing
- `NODE_OPTIONS="--localstorage-file=.jest-localstorage" npm test`

## [1.8.3] - 2025-11-15

### 🐛 Fixes
- Hardened Gemini CLI and Qwen Code CLI TOML parsing so only the inner prompt body is injected, preventing duplicated headers and keeping custom commands discoverable.

### 🧪 Testing
- `npm run lint`
- `npx tsc --noEmit`
- `NODE_OPTIONS="--localstorage-file=.jest-localstorage" npm test`
- `npm run build:prod`

## [1.8.2] - 2025-11-15

### ✨ Features
- Added Augment CLI and Copilot CLI providers with template support and detection during `clavix init`.
- Alphabetized IDE and CLI tool selections in the initialization wizard for easier navigation.

### 🐛 Fixes
- Fixed Gemini CLI and Qwen Code CLI template handling to avoid nested `prompt = """` blocks and ensured their commands remain discoverable.
- Restored the default namespaced layout (`.gemini/commands/clavix` and `.qwen/commands/clavix`) while offering an opt-out during initialization for flat command naming.

### 🧪 Testing
- `npm run lint`
- `npx tsc --noEmit`
- `NODE_OPTIONS="--localstorage-file=.jest-localstorage" npm test`

## [1.8.1] - 2025-11-15

### 🐛 Fixes
- Flattened Gemini CLI and Qwen Code CLI command directories to `.gemini/commands` and `.qwen/commands` so commands surface without namespacing.
- Updated templates, CLI prompts, and tests to align with the new locations.

### 🧪 Testing
- `NODE_OPTIONS="--localstorage-file=.jest-localstorage" npm test`
- `npm run build:prod`

## [1.8.0] - 2025-11-15

### 🎉 New Features
- **Added** adapters for CodeBuddy CLI, Gemini CLI, Qwen Code CLI, and Codex CLI
  - Project-level and global detection (Codex/CodeBuddy support `~` home directories)
  - Provider-specific formatting (`$1`, `{{args}}`, `$ARGUMENTS`) applied automatically during command generation
- **Enhanced** `clavix init` & `clavix update` to respect provider file extensions (Markdown/TOML)
- **Added** confirmation prompt when generating Codex commands (writes to `~/.codex/prompts`)

### 🛠️ Technical Implementation
- New adapters: `codebuddy-adapter.ts`, `gemini-adapter.ts`, `qwen-adapter.ts`, `codex-adapter.ts`
- Template packs: `slash-commands/codebuddy`, `slash-commands/gemini` (`.toml`), `slash-commands/qwen` (`.toml`), `slash-commands/codex`
- Updated `AgentManager`, `init.ts`, and `update.ts` for dynamic extensions and provider registration
- Extended `extractDescription` to parse both YAML (`description:`) and TOML (`description = ""`) metadata

### 🧪 Testing
- Added adapter test suites covering detection, formatting, and command generation for each new provider
- Updated CLI init tests to assert availability of new providers

### 📚 Documentation
- README: expanded CLI tools table, added placeholder reference, updated init walkthrough
- CHANGELOG: this entry

---

## [1.6.0] - 2025-11-14

### 🎉 New Features

#### Crush CLI Support
- **Added**: Full Crush CLI adapter with slash command support
  - **Reference**: [Crush CLI COMMANDS.md](https://github.com/charmbracelet/crush/blob/main/COMMANDS.md)
  - **Directory**: `.crush/commands/clavix/` (subdirectory support)
  - **Placeholder**: `$PROMPT` (Crush-specific syntax automatically converted from `{{ARGS}}`)
  - **Command Access**: Via Ctrl+P or `/` in Crush terminal
  - **Command IDs**: `project:clavix:fast`, `project:clavix:deep`, `project:clavix:prd`, etc.

### 📊 Supported Providers
**Now 6 adapters**: claude-code, cursor, droid, opencode, amp, **crush**

### 🛠️ Technical Implementation

#### New Files
- `src/core/adapters/crush-adapter.ts` - Crush CLI adapter implementation
- `src/templates/slash-commands/crush/` - Command templates (8 files)
- `tests/adapters/crush-adapter.test.ts` - Comprehensive test suite (34 tests)

#### Updated Files
- `src/core/agent-manager.ts` - Registered CrushAdapter
- `src/cli/commands/init.ts` - Added Crush to provider selection
- `tests/integration/multi-provider-workflow.test.ts` - Added Crush to integration tests

#### Key Features
- **Subdirectory Support**: Commands in `.crush/commands/clavix/` (like Claude Code)
- **Automatic Placeholder Conversion**: `{{ARGS}}` → `$PROMPT` via `formatCommand()`
- **No Frontmatter**: Uses simple markdown format
- **Project Detection**: Checks for `.crush` directory

### 🧪 Testing

#### Test Coverage
- **Unit Tests**: 34 tests in `crush-adapter.test.ts`
  - Adapter properties validation
  - Project detection (`.crush` directory)
  - Command generation in subdirectory structure
  - `$PROMPT` placeholder replacement (single & multiple occurrences)
  - `formatCommand()` method testing
  - Edge cases (unicode, code blocks, long content, empty content)
  - Validation flow
  - BaseAdapter integration

- **Integration Tests**: Updated `multi-provider-workflow.test.ts`
  - Adapter registration (5→6 adapters)
  - Multi-provider detection
  - Adapter choices for UI

#### Test Results
- **Total**: 1,273 tests (1,239 existing + 34 new)
- **Status**: All passing
- **Coverage**: 100% for CrushAdapter
- **Regression**: Zero impact on existing 5 adapters

### 📚 Documentation
- **README.md**: Added Crush to supported tools table with $PROMPT note
- **CHANGELOG.md**: This entry

### 🎯 Usage

#### Initialization
```bash
clavix init
# Select "Crush CLI (.crush/commands/clavix/)"
```

#### Generated Structure
```
.crush/
  └── commands/
      └── clavix/
          ├── fast.md          ($PROMPT syntax)
          ├── deep.md          ($PROMPT syntax)
          ├── prd.md           ($PROMPT syntax)
          ├── start.md         ($PROMPT syntax)
          ├── summarize.md     ($PROMPT syntax)
          ├── plan.md          ($PROMPT syntax)
          ├── implement.md     ($PROMPT syntax)
          └── archive.md       ($PROMPT syntax)
```

#### In Crush Terminal
- Press `/` or `Ctrl+P` to access command palette
- Select commands: `project:clavix:fast`, `project:clavix:deep`, etc.
- Crush will prompt for `$PROMPT` input when command is invoked

### ⚡ Migration Notes
**Existing Users**: No action required. This is a purely additive feature.

**New Crush Users**:
1. Ensure Crush CLI is installed
2. Run `clavix init` in your project
3. Select "Crush CLI" from provider list
4. Access commands via Ctrl+P in Crush

---

## [1.5.2] - 2025-11-14

### 🐛 Critical Fixes

#### Multi-Provider Support in Update Command
- **Fixed**: `clavix update` now properly updates all installed providers instead of only claude-code
  - **Root Cause**: `update.ts` was reading non-existent `config.agent` field instead of `config.providers` array
  - **Impact**: Users with OpenCode, Cursor, Droid, or Amp were not getting command updates
  - **Solution**: Refactored to iterate over all providers in `config.providers`
  - **Technical Changes**: `src/cli/commands/update.ts:52-103`

#### IDE Slash Commands Updated to v1.5.0
- **Fixed**: All provider slash command templates synchronized with v1.5.0 (7→5 questions)
  - **Affected Files**:
    - `src/templates/slash-commands/claude-code/prd.md`
    - `src/templates/slash-commands/opencode/prd.md`
    - `src/templates/slash-commands/cursor/prd.md`
    - `src/templates/slash-commands/amp/prd.md`
    - `src/templates/slash-commands/droid/prd.md`
  - **Issue**: v1.5.0 updated CLI flow (7→5 questions) but forgot to update IDE slash commands
  - **Result**: `/clavix:prd` in all IDEs now uses streamlined 5-question flow

#### Hardcoded Template Paths Fixed
- **Fixed**: Dynamic template path resolution based on provider name
  - **Before**: `path.join(__dirname, 'templates/slash-commands/claude-code')` (hardcoded)
  - **After**: `path.join(__dirname, 'templates/slash-commands', adapter.name)` (dynamic)
  - **Impact**: Enables true multi-provider template management
  - **Files Updated**:
    - `src/cli/commands/update.ts:140`
    - `src/cli/commands/init.ts:274`

#### Added Special Handling for Universal Formats
- **Added**: Dedicated update methods for `agents-md` and `octo-md` providers
  - These are not standard adapters and require special handling
  - New methods: `updateAgentsMd()` and `updateOctoMd()`

### 📊 What This Fixes

**Before 1.5.2:**
```bash
clavix update --commands-only
# Only updated .claude/commands/clavix/
# OpenCode, Cursor, etc. were ignored
# Still showed 7 questions instead of 5
```

**After 1.5.2:**
```bash
clavix update --commands-only
# Updates ALL providers: claude-code, opencode, cursor, droid, amp
# All commands now use 5-question flow
# ✅ 32 files updated (4 providers × 8 commands)
```

### 🎯 Verification

All providers confirmed working with 5-question PRD flow:
- ✅ Claude Code (`/clavix:prd`)
- ✅ OpenCode (`/clavix:prd`)
- ✅ Cursor (`/clavix:prd`)
- ✅ Droid CLI
- ✅ Amp

## [1.5.1] - 2025-11-14

### 🐛 Fixed

#### Archive Detection Improvements
- **Enhanced PRD File Detection**: Extended support for multiple naming conventions in archive detection
  - Now recognizes: `FULL_PRD.md`, `QUICK_PRD.md`, `FULL-PRD.md` (uppercase and hyphenated variants)
  - Previously only detected: `PRD.md`, `full-prd.md`, `prd.md`, `Full-PRD.md`
- **Resolved Issue**: Manually archived projects with non-standard PRD filenames now appear in `clavix archive --list`
- **Technical Changes**:
  - Updated `possibleFiles` array in `src/core/archive-manager.ts:328`
  - Updated `possibleFiles` array in `src/core/task-manager.ts:611`
  - Both detection methods now consistently support all naming variants

**Impact**: Projects archived manually (e.g., via `clavix archive project-name`) that use uppercase or alternative naming conventions are now properly detected and listed.

## [1.5.0] - 2025-11-14

### 🚀 Major Features

#### Vibecoding-Optimized PRD Generation
- **Streamlined Questions**: Reduced from 8 questions to 5 focused questions for faster workflow
- **Smart Tech Detection**: Auto-detects tech stack from project files (package.json, requirements.txt, Gemfile, go.mod, Cargo.toml, composer.json)
- **CLEAR Framework Integration**: Questions designed with CLEAR principles (Concise, Logical, Explicit)
- **Maintained Quality**: All essential information captured without ceremony

### 🎯 New PRD Question Structure

**5 Focused Questions:**
1. 🎯 **Problem & Goal** (Required) - What are we building and why?
2. ⚡ **Core Features** (Required) - Must-have functionality (3-5 features)
3. 🔧 **Tech Stack** (Smart/Optional) - Auto-detected or manual input
4. 🚫 **Out of Scope** (Required) - Explicit boundaries
5. 💡 **Additional Context** (Optional) - Bonus information

**Removed Questions:**
- ❌ Target users - Unnecessary for personal projects and vibecoding
- ❌ Success metrics - Too "corporate" for fast iteration
- ❌ Deadlines/milestones - Not applicable for AI-driven development

### ✨ Smart Tech Stack Detection

**Automatic Detection:**
- Scans common config files in project root
- Detects frameworks from package.json dependencies (React, Vue, Next.js, Astro, etc.)
- Supports Python (Django, Flask, FastAPI), Ruby (Rails), Go, Rust, PHP (Laravel, Symfony)
- Shows detected stack with option to press Enter to accept or type to override
- Gracefully skips if extending existing project

**User Experience:**
```
🔧 Tech stack and requirements?
  Detected: TypeScript, Astro, Tailwind CSS (press Enter to use, or type to override)
```

### 🔧 Technical Improvements

**PRD Generator:**
- Added `detectProjectTechStack()` method in `prd.ts` for intelligent stack detection
- Updated question mapping: q1 → problem, q2 → features, q3 → technical, q4 → outOfScope, q5 → additional
- Enhanced question flow with conditional smart detection for Q3
- Auto-populates Q3 with detected stack if user presses Enter

**Templates:**
- Updated `prd-questions.md` with 5 streamlined questions and emoji indicators
- Simplified `full-prd-template.hbs` - removed users, success, timeline sections
- Optimized `quick-prd-template.hbs` for vibecoding workflow
- Updated acceptance criteria to reflect new structure

**Documentation:**
- Updated `.claude/commands/clavix/prd.md` slash command description
- Enhanced `CLAUDE.md` with vibecoding-optimized workflow details
- Updated `README.md` features and command descriptions

### 📊 Impact

**Time Savings:**
- ~40% reduction in question count (8 → 5 questions)
- Smart defaults for tech stack reduce manual input
- Optional questions can be skipped entirely

**Quality Maintained:**
- CLEAR validation still applies (C, L, E components)
- All essential project context captured
- Out-of-scope boundaries remain required for clarity

### 🎨 UX Enhancements

- Emoji indicators for each question type
- Clear "(Required)" vs "(Optional)" labels
- Helpful inline hints (e.g., "press Enter to skip if extending existing project")
- Color-coded detected tech stack display

### 📝 Migration Notes

**No Breaking Changes:**
- Existing PRD templates continue to work
- Custom templates in `.clavix/templates/` still supported
- CLEAR validation unchanged (C, L, E only for PRDs)

**New Behavior:**
- Q3 (tech stack) now auto-detects from project files
- Users can press Enter to skip optional questions
- Generated PRDs have simpler section structure

---

## [1.4.1] - 2025-11-14

### 🐛 Bug Fixes

#### Missing Commands in New Providers
- **Fixed**: Added missing `plan.md` and `implement.md` commands to all providers
- **Affected**: Cursor, Droid CLI, OpenCode, Amp providers
- **Root cause**: Commands were added to deployed location instead of source templates in v1.3.0
- **Impact**: Users selecting new providers (cursor, droid, opencode, amp) now receive complete command set including `/clavix:plan` and `/clavix:implement`

### 📝 What Was Fixed
- Added `plan.md` to all 5 provider template directories
- Added `implement.md` to all 5 provider template directories
- Verified frontmatter compatibility with Droid and OpenCode YAML requirements
- All providers now have feature parity with Claude Code

### ✅ Complete Command List (All Providers)
- `/clavix:fast` - Quick prompt improvements
- `/clavix:deep` - Comprehensive analysis
- `/clavix:prd` - PRD generation
- `/clavix:plan` - Task breakdown ✨ NEW for cursor/droid/opencode/amp
- `/clavix:implement` - Task execution ✨ NEW for cursor/droid/opencode/amp
- `/clavix:start` - Conversational mode
- `/clavix:summarize` - Extract requirements

---

## [1.4.0] - 2025-11-14

### 🎉 Major Features

#### Multi-Provider Support
- **Breaking Change**: Config now uses `providers: string[]` instead of `agent: string`
- Interactive multi-select checkbox UI during `clavix init`
- Select multiple AI development tools simultaneously
- Automatic config migration from v1.3.0 → v1.4.0

#### New Provider Support
- ✨ **Cursor** - `.cursor/commands/` (flat structure, no frontmatter)
- ✨ **Droid CLI** - `.factory/commands/` (YAML frontmatter, `$ARGUMENTS` placeholder)
- ✨ **OpenCode** - `.opencode/command/` (frontmatter with description, `$ARGUMENTS`)
- ✨ **Amp** - `.agents/commands/` (simple markdown, experimental executable support)
- ✨ **Universal agents.md** - Workflow instructions for tools without slash command support

### 🏗️ Architecture Improvements
- Introduced `BaseAdapter` abstract class for shared adapter logic
- Plugin-based provider system ensures backward compatibility
- Per-provider validation before command generation
- Template system with `{{ARGS}}` placeholder replaced by adapter-specific formats
- Isolated provider modules - adding new providers doesn't affect existing ones

### 🔧 Enhancements
- Enhanced `AgentAdapter` interface with `directory`, `fileExtension`, `features` properties
- Added `ProviderFeatures` interface for provider-specific capabilities
- Added `ValidationResult` interface for adapter validation
- Config migration utilities: `migrateConfig()`, `isLegacyConfig()`
- `AgentManager` now registers all 5 provider adapters
- Per-provider validation with error/warning reporting
- Improved init command UX with provider descriptions and checkbox validation

### 📝 Templates
- Created provider-specific template directories for all 5 providers
- Universal `agents.md` template with workflow detection and CLEAR framework integration
- Standardized `{{ARGS}}` placeholder across all base templates
- Provider adapters transform placeholders to tool-specific formats

### 🧪 Testing & Quality
- TypeScript compilation successful across all new code
- Backward compatibility maintained for v1.3.0 configurations
- BaseAdapter inheritance tested across all provider adapters

### 📚 Documentation
- Updated README with supported tools table
- Multi-provider selection example in Quick Start
- Updated "AI Agent Integration" section
- Comprehensive PRD and implementation plan in `.clavix/outputs/`
- Migration guide for v1.3.0 users

### ⚠️ Breaking Changes
- Config field `agent: string` replaced with `providers: string[]`
- Old configs automatically migrated on next `clavix init`
- No manual migration required - fully automated

### 📦 Migration Guide
If upgrading from v1.3.0:
1. Run `clavix init` in your project
2. Select desired providers (old provider pre-selected)
3. Config automatically migrated to v1.4.0 format
4. Slash commands regenerated for all selected providers

---

## [1.3.0] - 2025-11-14

### Added

- **PRD-to-Implementation Workflow** - Seamless transition from PRD to coded features
  - `clavix plan` command - Generates implementation task breakdown from PRD
  - `clavix implement` command - Executes tasks with AI assistance and session resume
  - Tasks organized into logical phases with CLEAR-optimized atomic descriptions
  - Markdown checkbox format (`- [ ]` / `- [x]`) for stateful progress tracking
  - Task references to PRD sections for context and traceability

- **Git Auto-Commit Integration** - Optional automatic commits during implementation
  - Four commit strategies: per-task, per-5-tasks, per-phase, or none
  - Interactive CLI prompt for commit preference selection
  - Descriptive commit messages with task lists and project context
  - `CommitScheduler` class for tracking commit timing
  - `GitManager` class for git operations and validation

- **Session Resume Capability** - Pick up where you left off
  - Stateful task tracking via markdown checkboxes
  - Automatic detection of first incomplete task
  - Progress statistics (completed/total/percentage)
  - Configuration file (`.clavix-implement-config.json`) for AI agent coordination

- **Core Classes**:
  - `TaskManager` - PRD parsing, task generation, file I/O, progress tracking
  - `GitManager` - Git operations, commit creation, repository validation
  - `CommitScheduler` - Strategy-based commit timing logic

- **Slash Commands**:
  - `/clavix:plan` - Generate task breakdown from PRD
  - `/clavix:implement` - Execute tasks with AI assistance

### Changed

- **Command Structure**: Updated slash command file organization
  - Commands now in `.claude/commands/clavix/` subdirectory
  - README.md updated with plan and implement command documentation
  - CLAUDE.md updated with new workflow commands

### Documentation

- **README.md**: New "PRD-to-Implementation Workflow" feature section
- **Slash Commands**: Detailed implementation guides for AI agents
- **Examples**: Git commit format and task tracking examples

## [1.2.0] - 2025-01-13

### Added

- **CLEAR Framework Integration** - Academically-validated prompt engineering methodology
  - Integrated Dr. Leo Lo's CLEAR Framework (Concise, Logical, Explicit, Adaptive, Reflective)
  - Fast mode now applies C, L, E components with enhanced triage
  - Deep mode now applies full CLEAR framework (C, L, E, A, R)
  - PRD mode now validates generated PRDs using CLEAR framework (C, L, E)
  - Summarize mode now optimizes extracted prompts using CLEAR framework (C, L, E)
  - Added `--framework-info` flag to all commands for CLEAR education
  - Added `--clear-only` flag to fast/deep modes for score-only display
  - Added `--skip-validation` flag to PRD mode
  - Added `--skip-clear` flag to summarize mode
  - Academic citation included: Lo, L. S. (2023). "The CLEAR Path: A Framework for Enhancing Information Literacy through Prompt Engineering"

### Changed

- **Core Engine**: `PromptOptimizer` now uses CLEAR framework methods
  - `applyCLEARFramework(prompt, mode)` orchestrator for all modes
  - Individual component analyzers: `analyzeConciseness()`, `analyzeLogic()`, `analyzeExplicitness()`, `analyzeAdaptiveness()`, `analyzeReflectiveness()`
  - `calculateCLEARScore()` for comprehensive scoring
  - Backward compatibility preserved via `mapCLEARToLegacy()` helper

- **Documentation**: Comprehensive CLEAR framework documentation
  - README.md now prominently features CLEAR Framework with academic citation
  - CLAUDE.md updated with CLEAR-aware slash command descriptions
  - All slash command templates updated to reference CLEAR components
  - Added "Why CLEAR?" section explaining the framework benefits

- **Output Format**: Enhanced user-facing output
  - Color-coded CLEAR scores (green ≥80, yellow ≥60, red <60)
  - Component-labeled improvements ([C], [L], [E], [A], [R])
  - Educational "Changes Made" section references CLEAR components
  - PRD validation shows AI consumption quality scores
  - Summarize generates both raw and CLEAR-optimized versions

### Fixed

- Lint errors: Removed unused error variables in catch blocks

## [1.1.2] - 2025-11-13

### Fixed

- **Template Path Resolution**
  - Fix template path resolution in globally installed package
  - Add copyfiles to build process for template distribution
  - Update template paths from `src/templates/` to `dist/templates/` for production
  - Ensure templates are included in npm package
  - Fix `clavix init` and `clavix update` failures when installed via `npm install -g`

## [1.1.1] - 2025-11-13

### Fixed

- **Command Structure**
  - Adopt OpenSpec directory structure for Claude commands (`.claude/commands/clavix/*.md`)
  - Remove colons from command filenames for cross-platform compatibility
  - Fix `clavix update` to dynamically scan template directory (no hardcoded lists)
  - Fix JSON5 config parsing in update command
  - Add automatic migration from old command structure
  - Commands now properly update during re-initialization

### Changed

- **Command Organization**
  - Move commands to `.claude/commands/clavix/` subdirectory
  - Update template filenames (removed colons)
  - Add `name:` field to command frontmatter

- **Documentation**
  - Update command references from `clavix:improve` to `clavix:fast` and `clavix:deep`
  - Add usage guidance for fast vs deep vs PRD modes
  - Update AGENTS.md and CLAUDE.md with new command paths

## [1.1.0] - 2025-11-13

### Added

- **Dual-Mode Prompt Improvement System**
  - `clavix fast` command for quick prompt improvements with smart triage
  - `clavix deep` command for comprehensive prompt analysis
  - Smart triage system that detects when prompts need deep analysis based on:
    - Prompt length < 20 characters
    - Missing 3+ critical elements (context, tech stack, success criteria, user needs, expected output)
    - Vague scope words without sufficient context
  - Quality assessment feature that identifies already-good prompts (meeting 3/4 quality criteria)
  - "Changes Made" educational summary in both modes
  - Deep mode exclusive features:
    - Alternative phrasings of requirements
    - Edge case identification for requirements
    - Good/bad implementation examples
    - Alternative prompt structures
    - "What could go wrong" analysis

- **Colon Notation for Slash Commands**
  - Migrated all slash commands from dash to colon notation
  - `/clavix:fast` - Quick prompt improvements
  - `/clavix:deep` - Comprehensive analysis
  - `/clavix:prd` - PRD generation (renamed from `/clavix-prd`)
  - `/clavix:start` - Conversational mode (renamed from `/clavix-start`)
  - `/clavix:summarize` - Conversation analysis (renamed from `/clavix-summarize`)

### Changed

- Enhanced `PromptOptimizer` class with dual-mode support
- Updated all documentation to reflect new command structure
- Updated managed documentation blocks (AGENTS.md, CLAUDE.md)
- Improved initialization workflow to generate colon-based slash commands

### Removed

- `clavix improve` command (replaced by `fast` and `deep` commands)
- `/clavix:improve` slash command (replaced by `/clavix:fast` and `/clavix:deep`)

### Fixed

- Test suite updated to reflect new command structure (153/153 tests passing)

## [1.0.0] - 2025-11-13

### Added

- Initial release
- Global CLI tool for prompt improvement and PRD generation
- Claude Code integration with slash commands
- Prompt improvement with gap and ambiguity analysis
- PRD generation through guided Socratic questioning
- Conversational mode for iterative requirement gathering
- Session management for tracking conversations
- Managed documentation injection (AGENTS.md, CLAUDE.md)
- Template system for customization
- Configuration management (`clavix config`)
- List and show commands for session inspection
- Update command for managed blocks

---

**Made for vibecoders, by vibecoders** 🚀
