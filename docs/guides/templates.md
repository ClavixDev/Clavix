# Template customization

Clavix ships with default templates for PRD questions, full PRDs, quick PRDs, and provider-specific slash commands. You can override any of them by placing files under `.clavix/templates/`.

## Template architecture (v2.4.0+)

Starting with v2.4.0, Clavix uses a **canonical template system** with runtime provider-specific formatting:

1. **Canonical Source**: All templates are stored in `src/templates/slash-commands/_canonical/` as Markdown files with YAML frontmatter
2. **Runtime Generation**: Each provider adapter transforms canonical templates into provider-specific format during `clavix update`:
   - **Markdown providers** (Cursor, Windsurf, Claude Code, Cline, Roocode, Kilocode, Droid, CodeBuddy, OpenCode, Augment, Amp): Use content as-is or with minimal formatting
   - **TOML providers** (Gemini CLI, Qwen Code): Convert to TOML format with `prompt = """..."""` wrapper and replace `{{ARGS}}` with `{{args}}`
   - **Special providers** (Crush): Apply custom placeholder transformations (`$PROMPT`)
3. **Single Source of Truth**: Updates to canonical templates automatically apply to all providers, ensuring consistency

This architecture provides:
- **67% package size reduction**: 1.5MB → 830KB unpacked (159KB → 141.5KB compressed)
- **Zero duplication**: 8 canonical files instead of 128 provider-specific files
- **Easier maintenance**: Update once, apply everywhere
- **Consistent content**: All providers receive identical template logic

## PRD templates

| Purpose | Default file | Override location |
| --- | --- | --- |
| Question flow | `src/templates/prd-questions.md` | `.clavix/templates/prd-questions.md` |
| Full PRD | `src/templates/full-prd-template.hbs` | `.clavix/templates/full-prd-template.hbs` |
| Quick PRD | `src/templates/quick-prd-template.hbs` | `.clavix/templates/quick-prd-template.hbs` |

- Templates use [Handlebars](https://handlebarsjs.com/) syntax. Any partials or helpers you add must be self-contained.
- When an override exists, `clavix prd` loads your version automatically and falls back to the bundled default if the override is missing or invalid.

## Slash-command templates

Clavix generates slash commands from canonical templates with automatic provider-specific formatting. You can override templates at two levels:

### Override hierarchy

**Option 1: Canonical Override (Recommended)**
- **Location**: `.clavix/templates/slash-commands/_canonical/<command>.md`
- **Format**: Markdown with YAML frontmatter (same format as source templates)
- **Effect**: Applies to ALL providers automatically
- **Use when**: You want consistent changes across all tools
- **Example**: Override `fast.md` to customize the fast mode prompt for all providers

**Option 2: Provider-Specific Override**
- **Location**: `.clavix/templates/slash-commands/<provider>/<command>.<ext>`
- **Format**: Provider's native format (`.md` for most, `.toml` for Gemini/Qwen)
- **Effect**: Applies only to that specific provider
- **Use when**: You need provider-specific customization that differs from others
- **Example**: Override `.clavix/templates/slash-commands/gemini/fast.toml` to customize only Gemini's fast mode

### Customization steps

1. Create the override directory structure in `.clavix/templates/slash-commands/`
2. Copy the relevant template from `src/templates/slash-commands/_canonical/` (for canonical override) or use provider-specific format
3. Preserve the filename and extension
4. Adjust the content or metadata:
   - **YAML frontmatter** (canonical `.md`): `name: "..."` and `description: "..."`
   - **TOML description** (Gemini/Qwen): `description = "..."`
   - **Argument placeholders**: Use conventions from [Supported providers](../integrations.md)
5. Run `clavix update --commands-only` to regenerate command files with your overrides

### Template format reference

**Canonical template structure** (Markdown with YAML frontmatter):
```markdown
---
name: "Clavix: Fast"
description: CLEAR-guided quick improvements
---

# Clavix Fast Mode

Instructions here...
Use {{ARGS}} for user input placeholder.
```

**TOML template structure** (Gemini/Qwen):
```toml
description = "CLEAR-guided quick improvements"

prompt = """
# Clavix Fast Mode

Instructions here...
Use {{args}} for user input placeholder.
"""
```

Provider adapters enforce the argument placeholder conventions described in [Supported providers](../integrations.md). The canonical `{{ARGS}}` placeholder is automatically transformed to the provider-specific format (e.g., `{{args}}` for TOML providers, `$PROMPT` for Crush).

## Validation and troubleshooting

### Testing template changes

- Use `clavix prd --skip-validation` if you want to test template changes without running CLEAR checks
- When debugging slash-command templates, inspect the generated files in the provider directory (e.g., `.claude/commands/clavix/`)
- Run `clavix update --commands-only` after modifying templates to regenerate all provider command files

### Template loading behavior

Clavix follows this override resolution order:
1. **Provider-specific override**: `.clavix/templates/slash-commands/<provider>/<command>.<ext>`
2. **Canonical override**: `.clavix/templates/slash-commands/_canonical/<command>.md`
3. **Built-in canonical**: `src/templates/slash-commands/_canonical/<command>.md`

If Clavix encounters a template parsing error (invalid YAML frontmatter, malformed TOML), it:
- Reverts to the next available template in the hierarchy
- Reports the issue in the console with details about which template failed
- Continues execution using the fallback template

### Common issues

**Canonical override not applying to all providers**
- Ensure the file is named exactly like the canonical template (e.g., `fast.md`, not `fast-mode.md`)
- Check that YAML frontmatter is properly formatted with `---` delimiters
- Run `clavix update --commands-only` to regenerate commands

**TOML template errors**
- Verify the `prompt = """..."""` triple-quote syntax is correct
- Ensure no unescaped quotes within the prompt content
- Use `{{args}}` (lowercase) not `{{ARGS}}` for TOML templates

**Provider-specific override ignored**
- Confirm the provider name matches exactly (e.g., `claude-code` not `claude_code`)
- Check file extension matches provider format (`.md` or `.toml`)
- Provider-specific overrides take precedence over canonical overrides

## Related documentation

- [Configuration guide](configuration.md)
- [Command reference](../commands/README.md)
