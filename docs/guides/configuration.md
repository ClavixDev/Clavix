# Configuration Guide

Clavix stores project-level settings in `.clavix/config.json`. The file is created by `clavix init` and updated when you reconfigure integrations.

## Schema

```json
{
  "version": "5.5.0",
  "integrations": ["claude-code", "cursor"],
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
    "verboseLogging": false
  }
}
```

### Fields

| Field | Description |
|-------|-------------|
| `version` | Configuration schema version. Clavix migrates legacy configs automatically. |
| `integrations` | List of adapters selected during initialization. `clavix update` regenerates commands for each integration. |
| `templates` | Template pack names for PRD questions, full PRD, and quick PRD output. |
| `outputs.path` | Target directory for generated documents. |
| `outputs.format` | Output format (`markdown`). |
| `preferences.autoOpenOutputs` | Open generated files automatically. |
| `preferences.verboseLogging` | Enable verbose logging for debugging. |

## Integrations

Available integrations include:

**IDE Extensions:**
- `cursor` - Cursor AI
- `windsurf` - Windsurf
- `kilocode` - Kilocode
- `roocode` - Roo Code
- `cline` - Cline

**CLI Agents:**
- `claude-code` - Claude Code
- `droid` - Droid CLI
- `codebuddy` - CodeBuddy CLI
- `opencode` - OpenCode
- `gemini-cli` - Gemini CLI
- `qwen-code` - Qwen Code
- `llxprt` - LLXPRT
- `amp` - Amp
- `crush` - Crush CLI
- `codex` - Codex CLI
- `augment` - Augment CLI

**Doc Generators:**
- `agents-md` - AGENTS.md
- `octo-md` - OCTO.md
- `warp-md` - WARP.md
- `copilot-instructions` - GitHub Copilot

## Managing Configuration

### Reconfigure Integrations

```bash
clavix init
```

Select "Reconfigure integrations" to change which AI tools are supported.

### Regenerate Commands

```bash
clavix update
```

Regenerates all slash command files for configured integrations.

### Manual Editing

You can edit `.clavix/config.json` directly. After manual edits, run `clavix update` to regenerate commands.

## Legacy Migration

Clavix automatically migrates older config formats:
- Pre-v1.4.0: Single `agent` field → `integrations` array
- v1.4.0-v3.4.x: `providers` array → `integrations` array

## Related Documentation

- [Command Reference](../commands/README.md)
- [Integrations](../integrations.md)
- [Choosing the Right Workflow](choosing-workflow.md)
