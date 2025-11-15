# Template customization

Clavix ships with default templates for PRD questions, full PRDs, quick PRDs, and provider-specific slash commands. You can override any of them by placing files under `.clavix/templates/`.

## PRD templates

| Purpose | Default file | Override location |
| --- | --- | --- |
| Question flow | `src/templates/prd-questions.md` | `.clavix/templates/prd-questions.md` |
| Full PRD | `src/templates/full-prd-template.hbs` | `.clavix/templates/full-prd-template.hbs` |
| Quick PRD | `src/templates/quick-prd-template.hbs` | `.clavix/templates/quick-prd-template.hbs` |

- Templates use [Handlebars](https://handlebarsjs.com/) syntax. Any partials or helpers you add must be self-contained.
- When an override exists, `clavix prd` loads your version automatically and falls back to the bundled default if the override is missing or invalid.

## Slash-command templates

The CLI uses provider-specific templates located in `src/templates/slash-commands/<provider>/`. To customize a provider:

1. Copy the relevant template into `.clavix/templates/slash-commands/<provider>/`.
2. Preserve the filename and extension (`.md` or `.toml`).
3. Adjust the content or metadata as needed (YAML frontmatter, TOML description field, argument placeholders, etc.).
4. Run `clavix update --commands-only` to regenerate command files with your overrides.

Provider adapters enforce the argument placeholder conventions described in [Supported providers](../providers.md). Avoid changing placeholders unless the target tool explicitly requires it.

## Validation tips

- Use `clavix prd --skip-validation` if you want to test template changes without running CLEAR checks.
- When debugging slash-command templates, inspect the generated files in the provider directory (e.g., `.claude/commands/clavix/`).
- If Clavix encounters a template parsing error it reverts to the default for that execution and reports the issue in the console.

## Related documentation

- [Configuration guide](configuration.md)
- [Command reference](../commands/README.md)
