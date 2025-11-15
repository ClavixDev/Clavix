# clavix show

## Description
Displays detailed information about a session or output directory. You can inspect message history, metadata, and associated files without leaving the terminal.

## Syntax
```
clavix show [session-id] [options]
```

## Arguments
- `session-id` – (Optional) ID of the session to display. If omitted, the most recent session is shown.

## Flags
- `-o, --output <project>` – Show files within `.clavix/outputs/<project>/`.
- `-f, --full` – Print the full conversation history instead of the default preview.
- `-l, --limit <number>` – Number of messages to show when not using `--full` (default `10`).

## Inputs
- `.clavix/sessions/<session-id>.json` – Session metadata and messages.
- `.clavix/outputs/<project>/` – Output directories containing PRDs, prompts, and tasks.

## Outputs
- Console view of session metadata (status, timestamps, tags, message count) and message log.
- Optional listing of output files with size and modified time.

## Examples
- `clavix show` – View the most recent session summary.
- `clavix show abc-123 --full`
- `clavix show --output billing-api`

## Common messages
- `No .clavix directory found.` – Initialize Clavix before running the command.
- `Session "<id>" not found.` – Verify the session ID via `clavix list --sessions`.
- `Output directory "<project>" not found.` – Ensure the project exists under `.clavix/outputs/` or check spelling.
