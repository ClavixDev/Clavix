# clavix diagnose

## Description
Diagnoses the Clavix installation and configuration in the current project. Checks for proper setup, validates configuration, verifies integrations, and reports any issues with actionable recommendations.

## Syntax
```
clavix diagnose
```

## Arguments
- None.

## Flags
- None.

## Checks Performed

The diagnose command runs the following validation checks:

1. **Version Check** - Verifies Clavix package version is readable
2. **Directory Check** - Validates `.clavix/` directory exists with required subdirectories
3. **Configuration Check** - Validates `config.json` exists and contains valid settings
4. **Integration Check** - For each configured integration:
   - Adapters: Checks command directory exists and counts generated commands
   - Doc generators: Checks target file exists (AGENTS.md, OCTO.md, etc.)
5. **Template Check** - Verifies package templates are intact

## Outputs
A diagnostic report with:
- Individual check results (✓ pass, ⚠ warning, ✗ fail)
- Details for any issues found
- Summary counts
- Recommendations when issues exist

## Examples
```bash
# Basic usage - run in any project with Clavix
clavix diagnose
```

Sample output:
```
🔍 Clavix Diagnostic Report

──────────────────────────────────────────────────

Results:

  ✓ Version: v5.5.0
  ✓ .clavix directory OK
  ✓ config.json OK (2 integration(s))
  ✓ Claude Code: 8 command(s)
  ✓ AGENTS.md: Generated
  ✓ Package templates OK

──────────────────────────────────────────────────

Summary: 6 passed, 0 warnings, 0 failed

✨ All checks passed! Clavix is ready to use.
```

## Common Messages

| Status | Message | Meaning |
|--------|---------|---------|
| ✓ | `.clavix directory OK` | Directory structure is valid |
| ✓ | `config.json OK (N integration(s))` | Configuration is valid with N integrations |
| ⚠ | `No integrations configured` | Config exists but no integrations selected |
| ⚠ | `[Integration]: commands not generated` | Integration configured but commands missing |
| ✗ | `.clavix directory not found` | Project not initialized |
| ✗ | `config.json is invalid` | Configuration file has syntax errors |

## Recommendations
- If checks fail: Run `clavix init` to initialize or repair installation
- If warnings appear: Run `clavix update` to sync templates and regenerate commands
