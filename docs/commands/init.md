# clavix init

## Description
Initializes Clavix in the current project. The command creates the `.clavix/` directory, writes configuration files, and generates provider-specific slash commands based on your selections.

## Syntax
```
clavix init
```

## Arguments
- None. All configuration happens interactively.

## Flags
- None. Prompts guide you through provider selection and confirmation steps.

## Inputs
- Checks for existing `.clavix/` directory.
- Detects provider directories (e.g. `.claude`, `.factory`, `.gemini`) when validating selections.

## Outputs
- `.clavix/config.json` – stores selected providers and preferences.
- `.clavix/INSTRUCTIONS.md` – local quick-start guide for the project.
- Provider command files (e.g. `.claude/commands/clavix/*.md`, `.factory/commands/clavix-fast.md`).
- Optional documentation blocks injected into `AGENTS.md`, `CLAUDE.md`, or `OCTO.md` depending on providers.

## Examples
- `clavix init` – run in a project root to bootstrap Clavix.

## Common messages
- `Clavix is already initialized. Reinitialize?` – appears when `.clavix/` already exists; choose **Yes** to rebuild configuration.
- `You must select at least one provider.` – shown if you confirm the provider checklist without any selections.
- `Initialization cancelled` – displayed when you decline to reinitialize or exit provider selection.
