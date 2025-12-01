# Commands Reference

## Command Format by Tool

**Your command format depends on your AI tool:**

| Tool Type | Separator | Example |
|-----------|-----------|---------|
| **CLI agents** (Claude Code, Gemini, Qwen, Crush, LLXPRT, Augment) | Colon (`:`) | `/clavix:improve` |
| **IDE extensions** (Cursor, Windsurf, Cline, Kilocode, Roocode, Droid, etc.) | Hyphen (`-`) | `/clavix-improve` |

**Rule of thumb:** CLI tools use colon, IDE extensions use hyphen.

---

## Command Overview

### CLI Commands (4 total)

These run TypeScript code to set up your environment:

| Command | Purpose |
|---------|---------|
| `clavix init` | Initialize Clavix in a project |
| `clavix update` | Regenerate templates after package update |
| `clavix diagnose` | Check installation health |
| `clavix version` | Show version |

### Slash Commands (9 total)

These are markdown templates that AI agents read and execute:

| Command | Stage | Purpose |
|---------|-------|---------|
| `/clavix:improve` | Optimize | Smart prompt optimization with auto-depth |
| `/clavix:prd` | Document | Guided PRD generation |
| `/clavix:plan` | Plan | Task breakdown from PRD |
| `/clavix:implement` | Implement | Execute tasks or prompts |
| `/clavix:start` | Explore | Conversational requirements gathering |
| `/clavix:summarize` | Document | Extract requirements from conversation |
| `/clavix:refine` | Refine | Update existing PRD or prompt |
| `/clavix:verify` | Verify | Check implementation against checklist |
| `/clavix:archive` | Manage | Archive completed projects |

---

# CLI Commands

## clavix init

Initialize Clavix in the current project.

```bash
clavix init
```

**What it does:**
- Creates `.clavix/` directory with configuration
- Generates provider-specific slash command templates
- Injects documentation blocks into agent files (AGENTS.md, CLAUDE.md, etc.)

**Outputs:**
- `.clavix/config.json` - Selected providers and preferences
- `.clavix/INSTRUCTIONS.md` - Local quick-start guide
- Provider command files (e.g., `.claude/commands/clavix/*.md`)

**Common messages:**
- `Clavix is already initialized. Reinitialize?` - Choose Yes to rebuild
- `You must select at least one provider.` - Select at least one integration

---

## clavix update

Refresh templates and documentation blocks.

```bash
clavix update [options]
```

**Flags:**
- `--docs-only` - Update documentation blocks only
- `--commands-only` - Regenerate command files only
- `-f, --force` - Overwrite even if no changes detected

**Common messages:**
- `No .clavix directory found.` - Run `clavix init` first
- `Unknown provider: <name>, skipping...` - Provider not in adapter registry

---

## clavix diagnose

Check installation health.

```bash
clavix diagnose
```

**Checks performed:**
1. Version check - Package version readable
2. Directory check - `.clavix/` exists with required subdirectories
3. Configuration check - `config.json` valid
4. Integration check - Each configured integration working
5. Template check - Package templates intact

**Sample output:**
```
Results:
  ✓ Version: v5.5.0
  ✓ .clavix directory OK
  ✓ config.json OK (2 integration(s))
  ✓ Claude Code: 8 command(s)
  ✓ AGENTS.md: Generated
  ✓ Package templates OK

Summary: 6 passed, 0 warnings, 0 failed
```

---

## clavix version

Show installed version.

```bash
clavix version
```

**Output:** `Clavix vX.Y.Z`

---

# Slash Commands

## /clavix:improve

Smart prompt optimization with auto-depth selection.

```
/clavix:improve [prompt]
```

**What it does:**
1. Analyzes prompt quality across 6 dimensions (clarity, efficiency, structure, completeness, actionability, specificity)
2. Auto-selects depth: standard for good prompts, comprehensive for complex ones
3. Applies optimization patterns
4. Saves result to `.clavix/outputs/prompts/`

**Mode:** Planning (no code allowed)

**When to use:** Any prompt that needs improvement - feature requests, bug reports, refactoring tasks.

---

## /clavix:prd

Generate PRD through guided Socratic questions.

```
/clavix:prd [options]
```

**Flags:**
- `-q, --quick` - Shorter question flow
- `-p, --project <name>` - Name the project directory
- `--skip-validation` - Skip CLEAR analysis

**What it does:**
1. Asks strategic questions about your project
2. Detects tech stack from project files
3. Generates comprehensive PRD (`full-prd.md`)
4. Creates AI-optimized version (`quick-prd.md`)

**Output files:**
- `.clavix/outputs/<project>/full-prd.md` - Detailed PRD
- `.clavix/outputs/<project>/quick-prd.md` - Condensed version

**When to use:**
- Building something completely new
- Complex features with multiple requirements
- Greenfield development

**When NOT to use:** Modifications to existing code - use `/clavix:improve` instead.

---

## /clavix:plan

Generate task breakdown from PRD.

```
/clavix:plan [options]
```

**Flags:**
- `-p, --project <name>` - Target specific project
- `--source <auto|full|quick|mini|prompt>` - Choose artifact to use
- `--max-tasks <number>` - Limit tasks per phase (default: 20)
- `-o, --overwrite` - Replace existing tasks.md

**What it does:**
1. Reads PRD artifacts
2. Extracts top-level features (not nested details)
3. Groups into phases
4. Generates `tasks.md` checklist

**Task generation algorithm:**
- Top-level numbered lists = Features (tasks)
- Nested bullets = Implementation notes (NOT separate tasks)
- "Technical Stack" sections = Dependencies (NOT tasks)

**Output:**
- `.clavix/outputs/<project>/tasks.md` - Phased checklist

---

## /clavix:implement

Execute tasks or prompts.

```
/clavix:implement [options]
```

**Auto-detection:**

Without flags, implement auto-detects the source:
1. If `tasks.md` exists → Task mode (sequential execution)
2. Else if `prompts/*.md` exists → Prompt mode (most recent)
3. Else → Asks user what to build

Use `--tasks` or `--latest` to override auto-detection.

**Task mode flags:**
- `-p, --project <name>` - Select PRD project
- `--tasks` - Force task mode
- `--no-git` - Skip git auto-commits
- `--commit-strategy <per-task|per-5-tasks|per-phase|none>` - Auto-commit strategy

**Prompt mode flags:**
- `--latest` - Execute most recent saved prompt
- `--prompt <id>` - Execute specific prompt by ID

**Git commit strategies:**
| Strategy | Behavior |
|----------|----------|
| `none` (default) | No automatic commits |
| `per-task` | Commit after every task |
| `per-5-tasks` | Commit every 5 completed tasks |
| `per-phase` | Commit when phase completes |

---

## /clavix:start

Start conversational mode for requirements exploration.

```
/clavix:start
```

**What it does:**
- Enters exploration mode
- Asks clarifying questions instead of jumping to implementation
- Tracks conversation topics
- Suggests `/clavix:summarize` when ready

**Mode boundaries:**
- Asking clarifying questions
- Helping think through ideas
- Identifying edge cases
- Tracking requirements
- **NO code writing**

**Next steps:**
- `/clavix:summarize` - Extract requirements
- `/clavix:prd` - Switch to guided PRD

---

## /clavix:summarize

Extract structured requirements from conversation.

```
/clavix:summarize
```

**What it does:**
1. Pre-validates conversation coverage
2. Extracts features, constraints, success criteria
3. Creates documentation files
4. Applies optimization patterns
5. Flags unclear areas

**Output files:**
- `.clavix/outputs/<project>/mini-prd.md` - Comprehensive requirements
- `.clavix/outputs/<project>/original-prompt.md` - Raw extraction
- `.clavix/outputs/<project>/optimized-prompt.md` - Enhanced version

**Confidence indicators:**
- **[HIGH]** - Explicitly stated multiple times
- **[MEDIUM]** - Mentioned once or inferred
- **[LOW]** - Assumed based on limited info

---

## /clavix:refine

Refine existing PRD or prompt through continued discussion.

```
/clavix:refine
```

**What it does:**
1. Detects available PRDs and saved prompts
2. Asks what you want to refine (PRD or prompt)
3. Loads and displays current content
4. Enters conversational refinement mode
5. Updates files with tracked changes

**Refinement targets:**
- PRD projects in `.clavix/outputs/<project>/`
- Saved prompts in `.clavix/outputs/prompts/`

**Change tracking:**
- `[ADDED]` - New requirement or feature
- `[MODIFIED]` - Changed from original
- `[REMOVED]` - Explicitly removed
- `[UNCHANGED]` - Kept as-is

**PRD refinement options:**
- Add new features
- Modify existing features
- Change technical constraints
- Adjust scope (add/remove items)
- Update success criteria

**Prompt refinement options:**
- Clarify the objective
- Add more context or constraints
- Make it more specific
- Change the approach

**After refinement:**
- PRDs: Run `/clavix:plan` to regenerate tasks
- Prompts: Run `/clavix:implement --latest` to execute

---

## /clavix:verify

Perform a spec-driven technical audit of the implementation.

```
/clavix:verify
```

**What it does:**
1. **Loads the Spec:** Reads `tasks.md` (Technical Plan) and `full-prd.md` (Requirements).
2. **Reads the Code:** Inspects actual source files associated with completed tasks.
3. **Performs Gap Analysis:** Compares implementation against the plan and requirements.
4. **Generates Review:** Outputs a structured "Review Board" with categorized issues.

**Review Output Categories:**
- 🔴 **CRITICAL**: Architectural violations, broken features, or missing core requirements.
- 🟠 **MAJOR**: Logic errors, missing edge case handling, or deviation from PRD.
- 🟡 **MINOR**: Code style, naming, comments, or optimizations.
- ⚪ **OUTDATED**: The code is correct, but the plan/PRD was wrong.

**Example Output:**
```markdown
# Verification Report

## 🔍 Review Comments
| ID | Severity | Location | Issue |
|:--:|:--------:|:---------|:------|
| #1 | 🔴 CRIT | src/auth.ts | Used fetch instead of configured ApiClient |
| #2 | 🟠 MAJOR | src/login.tsx | Missing "Forgot Password" link (Req 3.1) |

Recommended: "Fix #1 and #2"
```

**Note:** This is a **code audit**, not just a test runner. It verifies *design compliance*.

---

## /clavix:archive

Archive completed projects.

```
/clavix:archive [project] [options]
```

**Flags:**
- `-l, --list` - Display archived projects
- `-f, --force` - Archive even if tasks incomplete
- `-r, --restore <project>` - Restore from archive

**What it does:**
- Moves project from `.clavix/outputs/` to `.clavix/outputs/archive/`
- Checks task completion status
- Supports restore for later reference

---

## Recommended Workflow

```
/clavix:start          # Explore requirements
     ↓
/clavix:summarize      # Extract documentation
     ↓
/clavix:prd            # (Alternative) Guided PRD
     ↓
/clavix:refine         # (Optional) Update requirements
     ↓
/clavix:plan           # Generate task breakdown
     ↓
/clavix:implement      # Execute tasks
     ↓
/clavix:verify         # Check implementation
     ↓
/clavix:archive        # Archive when complete
```

For quick improvements:
```
/clavix:improve "add user authentication"
     ↓
/clavix:implement --latest
     ↓
/clavix:verify
```

For iterative refinement:
```
/clavix:refine         # Update existing PRD/prompt
     ↓
/clavix:plan           # Regenerate tasks (if PRD)
     ↓
/clavix:implement      # Execute updates
```
