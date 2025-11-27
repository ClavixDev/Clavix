# clavix start

## Description
Starts an interactive session for capturing requirements through a conversational workflow. Messages are stored locally so you can summarize them later or resume the conversation.

## Syntax
```
clavix start [options]
```

## Flags
- `-p, --project <name>` – Associate the session with a project name.
- `-d, --description <text>` – Add a short description for easier identification.
- `-t, --tags "tag-a,tag-b"` – Attach comma-separated tags to the session metadata.

## Inputs
- User messages entered in response to interactive prompts.

## Outputs
- `.clavix/sessions/<session-id>.json` – Stores conversation history, metadata, and timestamps.
- Console acknowledgements guiding the conversation and explaining how to exit.

## Examples
- `clavix start`
- `clavix start --project onboarding-flow --description "Planning onboarding feature"`
- `clavix start --tags discovery,ux`

## Common messages
- `exit`, `quit`, `bye`, or `done` – Typing any of these commands ends the session gracefully.
- `Ctrl+C` – Interrupts the session; Clavix still saves the transcript and prints session details before terminating.
