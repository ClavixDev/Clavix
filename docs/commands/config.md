# clavix config

## Description
Views or edits project-level configuration stored in `.clavix/config.json`. Supports interactive editing, key-based reads, and targeted updates.

## Syntax
```
clavix config [action] [key] [value] [options]
```

## Arguments
- `action` – Optional operation: `get`, `set`, `edit`, or `reset`. Defaults to an interactive menu.
- `key` – Configuration key to read or write when using `get` or `set` (dot notation supported).
- `value` – New value for `set`. Parsed as JSON when possible; otherwise stored as a string.

## Flags
- `-g, --global` – Reserved for future use; currently prints a warning and falls back to project config.

## Inputs
- `.clavix/config.json` – Automatically created by `clavix init`.

## Outputs
- Updated configuration file with pretty-printed JSON.
- Console output showing current values or confirmation of changes.

## Examples
- `clavix config` – Open the interactive menu.
- `clavix config get outputs.path`
- `clavix config set preferences.verboseLogging true`
- `clavix config reset`

## Common messages
- `No .clavix directory found.` – Run `clavix init` before accessing configuration.
- `Configuration key "<key>" not found` – The requested path does not exist in the JSON object.
- `Failed to save configuration: <message>` – Indicates a filesystem error (permissions, locked file, etc.).
