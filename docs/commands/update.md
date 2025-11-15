# clavix update

## Description
Refreshes provider-specific slash commands and managed documentation blocks (e.g. `AGENTS.md`, `CLAUDE.md`) based on the providers listed in `.clavix/config.json`.

## Syntax
```
clavix update [options]
```

## Flags
- `--docs-only` – Update managed documentation blocks without touching command files.
- `--commands-only` – Regenerate command files without updating documentation.
- `-f, --force` – Overwrite files even if Clavix detects no changes.

## Inputs
- `.clavix/config.json` – Determines which providers to refresh.
- Template files under `src/templates/slash-commands/` and any overrides in `.clavix/templates/`.

## Outputs
- Updated command files in each provider directory.
- Refreshed managed blocks inside documentation targets (e.g. `AGENTS.md`, `CLAUDE.md`, `OCTO.md`).
- Console summary of created, updated, or skipped files.

## Examples
- `clavix update`
- `clavix update --commands-only`
- `clavix update --docs-only --force`

## Common messages
- `No .clavix directory found.` – Initialize Clavix before running updates.
- `⚠ Unknown provider: <name>, skipping...` – The configuration references a provider without a registered adapter.
- `⚠ Found <n> deprecated command file(s)` – Accept the prompt to delete legacy filenames after migrating.
