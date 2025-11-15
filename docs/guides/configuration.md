# Configuration guide

Clavix stores project-level settings in `.clavix/config.json`. The file is created by `clavix init` and updated whenever you change preferences or rerun initialization.

## Schema

```json5
{
  "version": "1.4.0",
  "providers": ["claude-code", "cursor"],
  "templates": {
    "prdQuestions": "default",
    "fullPrd": "default",
    "quickPrd": "default"
  },
  "outputs": {
    "path": ".clavix/outputs",
    "format": "markdown"
  },
  "preferences": {
    "autoOpenOutputs": false,
    "verboseLogging": false,
    "preserveSessions": true
  },
  "experimental": {}
}
```

- **version** – Configuration schema version. Clavix migrates legacy configs automatically.
- **providers** – The adapters selected during initialization. `clavix update` regenerates commands for every provider in this list.
- **templates** – Which template pack to use for PRD questions, full PRD output, and quick PRD output.
- **outputs** – Target directory and format (`markdown` or `pdf`) for generated documents.
- **preferences** – Behavioral toggles used across commands.
- **experimental** – Reserved for feature previews; safe to omit.

## Managing configuration

Use `clavix config` to interact with the file:

- `clavix config` – Launch an interactive menu to view or update preferences.
- `clavix config get outputs.path` – Read a specific key using dot notation.
- `clavix config set outputs.format pdf` – Write a value. Strings that parse as JSON are supported.
- `clavix config edit` – Shortcut to the interactive preference editor.
- `clavix config reset` – Restore defaults while preserving the provider list.

> **Note:** The `-g, --global` flag is reserved for future use. At present, configuration is always project-scoped.

## Legacy migration

Versions prior to 1.4.0 stored a single `agent` string instead of the `providers` array. When Clavix detects the legacy format it upgrades the file automatically, keeping your preferences and template overrides intact.

## Related documentation

- [Command reference](../commands/README.md)
- [Template customization](templates.md)
- [Workflow guide](workflows.md)
