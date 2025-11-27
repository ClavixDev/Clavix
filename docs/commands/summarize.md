# clavix summarize

## Description
Analyzes a saved conversation session to extract structured requirements. Generates a mini PRD, an optimized prompt, and (optionally) a CLEAR-enhanced variant suitable for AI agents.

## Syntax
```
clavix summarize [session-id] [options]
```

## Arguments
- `session-id` – (Optional) ID of the session to summarize. If omitted, Clavix uses the most recent active session.

## Flags
- `-a, --active` – Force the command to use the most recent active session.
- `-o, --output <dir>` – Write artifacts to a custom directory instead of `.clavix/outputs/<project>/`.
- `--skip-clear` – Skip the CLEAR re-optimization step for the extracted prompt.

## Inputs
- `.clavix/sessions/<session-id>.json` – Conversation data produced by `clavix start`.

## Outputs
- `mini-prd.md` – Concise requirements document derived from the conversation.
- `optimized-prompt.md` – Direct extraction formatted for AI usage.
- `clear-optimized-prompt.md` – CLEAR-enhanced version (omitted when `--skip-clear` is set).
- Console summary of key requirements, technical constraints, and success criteria.

## Examples
- `clavix summarize`
- `clavix summarize 1234-5678`
- `clavix summarize --active --skip-clear`

## Common messages
- `✗ Session not found: <id>` – The provided ID does not exist under `.clavix/sessions/`.
- `✗ No active session found` – Use `clavix start` first or specify a session ID.
- `⚠ Session has no messages to analyze` – Summaries require at least one message; add content and rerun.
