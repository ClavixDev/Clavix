# clavix deep

## Description
Performs a comprehensive CLEAR analysis on a prompt, covering all five components (Concise, Logical, Explicit, Adaptive, Reflective). Outputs the improved prompt plus alternative phrasings, structural variations, temperature guidance, and validation checklists.

## When to Use
Use **deep mode** for:
- **Comprehensive prompt analysis** – When you want thorough evaluation with multiple alternatives and structural variations
- **Learning better prompt engineering** – Understanding how to craft more effective prompts for AI agents
- **Complex modifications to existing features** – When changes require careful consideration and multiple approaches
- **Most tasks alongside fast mode** – Deep mode is suitable for the majority of your work, whether small or medium-sized changes

**Deep mode provides richer output** – including alternative phrasings, temperature recommendations, validation checklists, and edge case considerations. Use it when you want to explore different approaches or need comprehensive guidance.

**Choosing between Fast and Deep:**
- For most tasks, either **fast** or **deep** mode will be more than enough
- Fast mode is quicker; deep mode is more thorough
- Both work well for modifications and improvements to existing code

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
