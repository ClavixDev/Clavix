# Clavix Instructions for Octofriend

Clavix workflows optimized for Octofriend's capabilities: model switching, multi-turn thinking, and zero telemetry.

---

## CLAVIX PLANNING MODE

**Know which mode you're in:**

**PLANNING workflows** (requirements & documentation):
- start, summarize, fast, deep, prd, plan
- Your role: Ask questions, create PRDs/prompts, extract requirements
- **DO NOT implement features during these workflows**

**IMPLEMENTATION workflows** (code execution):
- implement, execute, task-complete
- Your role: Write code, execute tasks, implement features
- **DO implement code during these workflows**

See `.clavix/instructions/core/clavix-mode.md` for complete mode documentation.

---

## 📁 Detailed Workflow Instructions

**Complete step-by-step workflows** in `.clavix/instructions/workflows/`:

| Workflow | File | Purpose |
|----------|------|---------|
| Conversational mode | `start.md` | Natural requirements gathering |
| Extract requirements | `summarize.md` | Convert conversation → PRD + prompts |
| Quick improvements | `fast.md` | Prompt optimization with triage |
| Deep analysis | `deep.md` | Comprehensive analysis + alternatives |
| PRD generation | `prd.md` | Strategic planning through questions |

**Core references:**
- `core/clavix-mode.md` - Mode boundaries (planning vs implementation)
- `core/file-operations.md` - Proven file creation patterns
- `core/verification.md` - Checkpoint patterns

**Troubleshooting:**
- `troubleshooting/jumped-to-implementation.md` - If you start implementing
- `troubleshooting/skipped-file-creation.md` - If files aren't created
- `troubleshooting/mode-confusion.md` - Planning vs implementation confusion

**For Octo/Kimi users:** These instruction files have explicit step-by-step guidance that works well with structured processing. Always reference them when executing workflows.

---

## 🔍 Workflow Detection Keywords

| Keywords | Workflow | Mode |
|----------|----------|------|
| prd, product requirements, specification | `prd` | Planning |
| fast, quick, improve prompt | `fast` | Planning |
| deep, comprehensive, analysis | `deep` | Planning |
| start, conversational, discuss | `start` | Planning |
| summarize, extract, requirements | `summarize` | Planning |
| implement, build, execute | `implement` | Implementation |

**When detected:** Reference the corresponding `.clavix/instructions/workflows/{workflow}.md` file.

---

## 🎯 Octofriend-Specific Guidance

### Model Switching Strategy

**Fast models** (Qwen-Max, etc.):
- Quick improvements (`fast` workflow)
- Formatting and structure
- Straightforward questions

**Thinking models** (DeepSeek-R1, etc.):
- Deep analysis (`deep` workflow)
- Architectural decisions
- Complex problem-solving
- PRD generation (`prd` workflow)

**Switch models based on task complexity** - Octofriend makes this seamless.

### Multi-Turn Thinking

Enable multi-turn for:
- Architectural decisions
- Comprehensive analysis
- Strategic planning
- Complex problem decomposition

Multi-turn helps thinking models explore solution space thoroughly.

### Zero Telemetry Advantage

Users can share sensitive requirements safely:
- Proprietary business logic
- Confidential features
- Internal system details
- Competitive information

Octofriend's zero telemetry makes it ideal for planning confidential projects.

### Custom Autofix

Trust Octofriend's autofix for:
- Tool call failures
- Parameter corrections
- Retry logic

Autofix handles edge cases gracefully - let it work.

---

## 📋 CLI Quick Reference

| Command | Purpose | Output |
|---------|---------|--------|
| `clavix init` | Setup Clavix in project | `.clavix/config.json` |
| `clavix prd` | Generate PRD through questions | `full-prd.md` + `quick-prd.md` |
| `clavix fast "<prompt>"` | Quick prompt improvement (CLI auto-saves prompts; Slash commands require manual saving per template instructions) | Saved to `.clavix/outputs/prompts/fast/` |
| `clavix deep "<prompt>"` | Comprehensive analysis (CLI auto-saves prompts; Slash commands require manual saving per template instructions) | Saved to `.clavix/outputs/prompts/deep/` |
| `clavix execute [--latest]` | Execute prompt (interactive or --latest for most recent) | Implementation |
| `clavix prompts list` | View all saved prompts with status | NEW, EXECUTED, OLD, STALE |
| `clavix prompts clear` | Manage cleanup (--executed, --stale, --fast, --deep, --all) | Cleanup report |
| `clavix start` | Conversational requirements | Session captured |
| `clavix summarize` | Extract from conversation | `mini-prd.md` + prompts |
| `clavix plan` | Generate tasks from PRD | `tasks.md` |
| `clavix implement` | Execute tasks | Implementation + commits |
| `clavix list` | Show sessions/outputs | List view |
| `clavix update` | Refresh documentation | Updates managed files |

---

## 🔄 Prompt Execution Workflow

**When you have a saved prompt to execute prompt:**

1. **List available prompts**: `clavix prompts list` - See all saved prompts with status
2. **execute prompt**: `clavix execute --latest` - implement saved prompt interactively
3. **implement saved prompt**: Agent executes the optimized prompt and implements the feature

**Note:** CLI auto-saves prompts from fast/deep commands. Slash commands require manual saving per template instructions.

---

## 🔄 Standard Workflow

**Complete project flow:**

1. **Planning** (`clavix prd`)
   - Creates PRD (full + quick versions)
   - Saves to `.clavix/outputs/{project}/`

2. **Task Preparation** (`clavix plan`)
   - Transforms PRD → curated tasks.md
   - Phase-based organization

3. **Implementation** (`clavix implement`)
   - Agent executes tasks systematically
   - Uses `clavix task-complete` for progress
   - Optional git commit strategies

4. **Completion** (`clavix archive`)
   - Archives completed project

**Alternative quick paths:**
- **Quick improvement**: `clavix fast` → `clavix execute` → Done
- **Deep analysis**: `clavix deep` → `clavix execute` → Done
- **Conversational**: `clavix start` → `clavix summarize` → `clavix execute` → Done

---

## 💡 Best Practices for Octofriend

1. **Use thinking models for planning** - DeepSeek-R1 excels at strategic thinking
2. **Switch to fast models for execution** - Qwen-Max handles implementation well
3. **Enable multi-turn for complex decisions** - Let the model think thoroughly
4. **Reference instruction files explicitly** - "See `.clavix/instructions/workflows/prd.md`"
5. **Trust file operations** - Octofriend's Write tool is reliable
6. **Leverage zero telemetry** - Share proprietary details safely
7. **Follow the standard workflow** - PRD → Plan → Implement → Archive

---

## ⚠️ Common Mistakes

### ❌ Implementing during planning workflows
**Wrong:** User runs `clavix prd`, you generate PRD then start building features

**Right:** User runs `clavix prd`, you generate PRD, save files, suggest `clavix plan` as next step

### ❌ Skipping file creation
**Wrong:** Display optimized prompt, stop there

**Right:** Display prompt, save to `.clavix/outputs/`, verify, show path

### ❌ Not referencing instruction files
**Wrong:** Trying to remember workflow details from this file

**Right:** "See `.clavix/instructions/workflows/fast.md` for complete workflow"

### ❌ Using wrong model for task
**Wrong:** Using fast model for complex architectural planning

**Right:** Switch to thinking model (DeepSeek-R1) for strategic decisions

---

## 🆘 When in Doubt

1. **Check which command was run** - Determines your mode (planning vs implementation)
2. **Reference instruction files** - They have complete step-by-step guidance
3. **Ask the user** - "Should I implement this (run `clavix implement`), or continue planning?"
4. **Switch models** - Use thinking models for complex planning tasks

---

**For complete workflows:** Always reference `.clavix/instructions/workflows/{workflow}.md`

**For troubleshooting:** Check `.clavix/instructions/troubleshooting/`

**For mode clarification:** See `.clavix/instructions/core/clavix-mode.md`

Octofriend + Clavix = Strategic planning with zero telemetry, perfect for confidential projects.
