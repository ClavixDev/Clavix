# clavix list

## Description
Lists stored sessions and/or output projects managed by Clavix. Use filters to focus on specific projects, limit results, or include archived data.

## Syntax
```
clavix list [options]
```

## Flags
- `-s, --sessions` – Show only sessions.
- `-o, --outputs` – Show only outputs.
- `-a, --archived` – Include archived projects when listing outputs.
- `-p, --project <name>` – Filter sessions or outputs by project substring.
- `-l, --limit <number>` – Limit the number of results (default `20`).

## Inputs
- `.clavix/sessions/` – Session metadata and transcripts.
- `.clavix/outputs/` – Generated PRDs, prompts, tasks, and archived directories.

## Outputs
- Console tables summarizing sessions (ID, status, message count) or outputs (path, files, modified date).

## Examples
- `clavix list` – Show both sessions and outputs (default).
- `clavix list --sessions --project onboarding`
- `clavix list --outputs --archived --limit 5`

## Common messages
- `No .clavix directory found.` – Run `clavix init` before listing resources.
- `No sessions found.` – There are no saved conversations yet; use `clavix start` to create one.
- `No outputs found.` – Generate artifacts with `clavix prd` or `clavix summarize` before listing.
