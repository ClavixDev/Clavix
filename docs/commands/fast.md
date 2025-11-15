# clavix fast

## Description
Runs a fast CLEAR analysis on a single prompt, focusing on Concise, Logical, and Explicit components. Produces scores, issues, and an improved prompt ready for copy-paste. The command can suggest switching to deep analysis when the prompt needs more work.

## Syntax
```
clavix fast <prompt> [options]
```

## Arguments
- `<prompt>` – The text to analyze and improve. Required.

## Flags
- `--clear-only` – Print scores and diagnostic details without generating an improved prompt.
- `--framework-info` – Display a concise overview of the CLEAR framework and exit.

## Inputs
- The prompt text provided on the command line.

## Outputs
- CLEAR scores for Conciseness, Logic, Explicitness, and overall rating.
- A structured prompt with Objective, Requirements, Technical Constraints, Expected Output, and Success Criteria (unless `--clear-only` is used).
- A list of labeled changes showing how each CLEAR component was improved.
- Optional triage recommendation encouraging `clavix deep` when low scores or other heuristics are detected.

## Examples
- `clavix fast "Create a login page"`
- `clavix fast "Draft a migration plan" --clear-only`
- `clavix fast --framework-info`

## Common messages
- `✗ Please provide a prompt to improve` – You ran the command without supplying `<prompt>`.
- `⚠️  CLEAR Framework Triage Alert` – The analysis recommends switching to deep mode due to low scores or missing elements.
- `Proceeding with fast mode as requested` – Displayed after you choose to stay in fast mode despite the triage warning.
