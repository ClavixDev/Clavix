# Clavix Workflows (Universal)

Use these instructions when your agent can only read documentation (no slash-command support).

## Quick start
- Install globally: `npm install -g clavix`
- Or run ad hoc: `npx clavix@latest init`
- Verify installation: `clavix version`

## Command reference

| Command | Purpose |
| --- | --- |
| `clavix init` | Interactive setup. Select providers and generate documentation/command files. |
| `clavix fast "<prompt>"` | CLEAR (C/L/E) analysis with improved prompt output. |
| `clavix deep "<prompt>"` | Full CLEAR (C/L/E/A/R) analysis, alternative variations, validation checklists. |
| `clavix prd` | Guided Socratic questions that generate `full-prd.md` and `quick-prd.md`. |
| `clavix plan` | Transform PRDs or sessions into phase-based `tasks.md`. |
| `clavix implement` | Walk through tasks, track progress, optionally set git auto-commit strategy. |
| `clavix start` | Begin conversational capture session for requirements gathering. |
| `clavix summarize [session-id]` | Extract mini PRD and optimized prompts from saved sessions. |
| `clavix list` | List sessions and/or output projects (`--sessions`, `--outputs`, filters). |
| `clavix show [session-id]` | Inspect session details or use `--output <project>` to view outputs. |
| `clavix archive [project]` | Archive completed projects or restore them (`--restore`). |
| `clavix config [get|set|edit|reset]` | Manage `.clavix/config.json` preferences. |
| `clavix update` | Refresh managed docs and slash commands (supports `--docs-only`, `--commands-only`). |
| `clavix version` | Print installed version. |

## Typical workflows
- **Improve prompts quickly:** run `clavix fast` or `clavix deep` depending on complexity.
- **Create strategy:** run `clavix prd` then `clavix plan` for an implementation checklist.
- **Execute tasks:** use `clavix implement`, commit work, repeat until tasks complete.
- **Capture conversations:** record with `clavix start`, extract with `clavix summarize`.
- **Stay organized:** inspect with `clavix list/show`, archive with `clavix archive`, refresh docs via `clavix update`.

Artifacts are stored under `.clavix/`:
- `.clavix/outputs/<project>/` for PRDs, tasks, prompts
- `.clavix/sessions/` for captured conversations
- `.clavix/templates/` for custom overrides
