# clavix archive

## Description
Moves completed PRD projects from `.clavix/outputs/` into `.clavix/outputs/archive/`, keeping your workspace tidy. You can also list archived projects or restore them later.

## Syntax
```
clavix archive [project] [options]
```

## Arguments
- `project` – (Optional) Name of the project directory to archive immediately.

## Flags
- `-l, --list` – Display archived projects and their task status.
- `-f, --force` – Archive even if tasks are incomplete or `tasks.md` is missing.
- `-r, --restore <project>` – Move an archived project back to the main outputs directory.

## Inputs
- `.clavix/outputs/<project>/` directories and their `tasks.md` files for completion checks.

## Outputs
- Archived project folders under `.clavix/outputs/archive/<project>/`.
- Console messages summarizing archived, restored, or skipped projects.

## Examples
- `clavix archive` – Interactive selection of projects ready to archive.
- `clavix archive billing-api` – Archive a project directly.
- `clavix archive --list` – View currently archived projects.
- `clavix archive --restore legacy-auth` – Restore a project from the archive.

## Common messages
- `⚠ Project has <n> incomplete task(s)` – Displayed when tasks remain unchecked; confirm to force archive or cancel.
- `⚠ Project has no tasks.md file` – You can still proceed with `--force` if desired.
- `Archive failed: <message>` – Indicates an unexpected error (permissions, missing directories, etc.).
