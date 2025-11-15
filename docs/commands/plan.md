# clavix plan

## Description
Generates an actionable task plan from PRD artifacts or conversation summaries. Produces a markdown checklist grouped into phases and references the source material for each task.

## Syntax
```
clavix plan [options]
```

## Flags
- `-p, --project <name>` – Target a specific directory inside `.clavix/outputs/`.
- `--prd-path <dir>` – Provide an explicit path containing PRD artifacts.
- `--session <id>` – Generate a mini PRD and prompt from the given session before planning.
- `--active-session` – Use the most recent active session instead of specifying an ID.
- `--source <auto|full|quick|mini|prompt>` – Choose which artifact to prioritize. Defaults to `auto`.
- `--max-tasks <number>` – Limit tasks per phase (default `20`).
- `-o, --overwrite` – Replace an existing `tasks.md` file.

## Inputs
- PRD files inside `.clavix/outputs/<project>/` (full, quick, mini, or optimized prompt).
- Session transcripts via `.clavix/sessions/<id>.json` when using `--session` or `--active-session`.

## Outputs
- `.clavix/outputs/<project>/tasks.md` – Checklist grouped by phase with references back to PRD sections.
- Console summary listing the chosen source, number of phases, and number of tasks.

## Examples
- `clavix plan`
- `clavix plan --project billing-api --source quick`
- `clavix plan --session 1234-5678 --max-tasks 10`

## Common messages
- `Use either --session or --active-session, not both.` – Flags are mutually exclusive.
- `✗ No PRD artifacts found in this directory.` – The selected project lacks PRD files; run `clavix prd` or `clavix summarize` first.
- `⚠ tasks.md already exists.` – Use `--overwrite` to regenerate the file.
