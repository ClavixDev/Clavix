# Supported providers

Clavix can generate slash commands and documentation snippets for a wide range of IDEs and CLI agents. The tables below summarize where command files are written, whether subdirectories are supported, and which argument placeholders are used.

## Template architecture

Starting with v2.4.0, Clavix uses **canonical templates** that are automatically formatted for each provider at runtime. This architecture ensures:

- **Consistency**: All providers receive identical template content and logic
- **Maintainability**: Single source of truth in `src/templates/slash-commands/_canonical/`
- **Efficiency**: 67% smaller package size (1.5MB → 830KB unpacked)
- **Quality**: Updates and bug fixes apply automatically to all providers

Provider-specific formatting is handled by each adapter's `formatCommand()` method:
- **Markdown providers**: Use canonical content as-is or with minimal formatting
- **TOML providers** (Gemini, Qwen): Convert to TOML with `prompt = """..."""` wrapper
- **Special providers** (Crush): Apply custom placeholder transformations

For detailed information on template customization and override options, see [Template customization guide](guides/templates.md).

## IDEs and editor extensions

| Provider | Command location | Subdirectories | Placeholder |
| --- | --- | --- | --- |
| Cursor | `.cursor/commands/` | No | *(implicit)* |
| Windsurf | `.windsurf/workflows/` | Yes | *(implicit)* |
| Kilocode | `.kilocode/workflows/` | No | *(implicit)* |
| Roocode | `.roo/commands/` | No | *(implicit)* |
| Cline | `.clinerules/workflows/` (falls back to `.cline/`) | No | *(implicit)* |

## CLI agents and toolchains

| Provider | Command location | Subdirectories | Placeholder |
| --- | --- | --- | --- |
| Claude Code | `.claude/commands/clavix/` | Yes | *(implicit — command templates inject arguments directly)* |
| Droid CLI | `.factory/commands/` | No | `$ARGUMENTS` |
| CodeBuddy CLI | `.codebuddy/commands/` (or `~/.codebuddy/commands/`) | No | `$1`, `$2`, … |
| OpenCode | `.opencode/command/` | No | `$ARGUMENTS` |
| Gemini CLI | `.gemini/commands/clavix/` by default (optional `.gemini/commands/`) | Yes | `{{args}}` |
| Qwen Code | `.qwen/commands/clavix/` by default (optional `.qwen/commands/`) | Yes | `{{args}}` |
| LLXPRT | `.llxprt/commands/clavix/` | Yes | `{{args}}` |
| Amp | `.agents/commands/` | No | *(raw prompt — no placeholder)* |
| Crush CLI | `.crush/commands/clavix/` | Yes | `$PROMPT` |
| Codex CLI | `~/.codex/prompts` | No | `$ARGUMENTS` |
| Augment CLI | `.augment/commands/clavix/` (or `~/.augment/commands/clavix/`) | Yes | *(implicit — templates include arguments)* |

## Universal adapters

- **AGENTS.md** – Adds a managed block to `AGENTS.md` for tooling that ingests long-form documentation instead of slash commands.
- **GitHub Copilot** – Generates `.github/copilot-instructions.md` with natural language Clavix workflow instructions per [official GitHub documentation](https://docs.github.com/en/copilot/how-tos/configure-custom-instructions/add-repository-instructions).
- **OCTO.md** – Generates content tailored for Octofriend's markdown interface.
- **WARP.md** – Provides Clavix quick-start guidance optimized for Warp users.

### Multi-select during `clavix init`

`clavix init` uses an interactive checkbox list so you can enable multiple providers at once. Clavix remembers the providers in `.clavix/config.json` and `clavix update` regenerates the corresponding commands on demand.

For a complete walkthrough of the initialization flow, see [clavix init](commands/init.md).
