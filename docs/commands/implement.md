# clavix implement

## Description
Guides you through executing tasks from `tasks.md`, tracks progress, and optionally creates automatic git commits. The command always shows the next incomplete task and writes a configuration file for downstream automation.

## Syntax
```
clavix implement [options]
```

## Flags
- `-p, --project <name>` – Select a PRD project under `.clavix/outputs/`.
- `--tasks-path <file>` – Provide a custom path to a `tasks.md` file.
- `--no-git` – Skip git detection and disable auto-commit prompts.
- `--commit-strategy <per-task|per-5-tasks|per-phase|none>` – Preselect an auto-commit strategy (defaults to interactive prompt).

## Inputs
- `.clavix/outputs/<project>/tasks.md` – Markdown checklist with phases and tasks.
- Git repository metadata (optional) to offer commit automation.

## Outputs
- Progress summary (completed vs remaining tasks) printed to the console.
- `.clavix/outputs/<project>/.clavix-implement-config.json` – Stores the selected commit strategy, active task, and stats for AI agents.

## Examples
- `clavix implement`
- `clavix implement --project billing-api --commit-strategy per-phase`
- `clavix implement --tasks-path ./docs/tasks.md --no-git`

## Common messages
- `✗ No tasks.md found!` – Generate a plan first with `clavix plan`.
- `⚠ No PRD projects found in .clavix/outputs` – Occurs when the outputs directory is empty; run `clavix prd` or `clavix summarize`.
- `Project "<name>" has no tasks generated yet.` – Use the interactive prompt to run `clavix plan` immediately.
