# clavix deep

## Description
Performs a comprehensive CLEAR analysis on a prompt, covering all five components (Concise, Logical, Explicit, Adaptive, Reflective). Outputs the improved prompt plus alternative phrasings, structural variations, temperature guidance, and validation checklists.

## Syntax
```
clavix deep <prompt> [options]
```

## Arguments
- `<prompt>` – The prompt to analyze. Required.

## Flags
- `--clear-only` – Show detailed metrics and suggestions without generating an improved prompt.
- `--framework-info` – Print the CLEAR framework reference and exit.

## Inputs
- Prompt text supplied on the command line.

## Outputs
- Extensive CLEAR metrics (C/L/E/A/R) with suggestions.
- A fully restructured prompt with labeled sections.
- Adaptive variations (alternative phrasings and structures, temperature recommendations).
- Reflective guidance (validation checklist, edge cases, potential issues, fact-checking steps).

## Examples
- `clavix deep "Design a billing microservice"`
- `clavix deep "Plan multi-region deployment" --clear-only`

## Common messages
- `✗ Please provide a prompt to analyze` – Indicates the `<prompt>` argument was omitted.
