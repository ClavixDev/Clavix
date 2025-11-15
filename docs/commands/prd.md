# clavix prd

## Description
Generates a Product Requirements Document through a short series of Socratic questions. Produces both a comprehensive PRD for teams and a quick, AI-ready version that is validated with the CLEAR framework by default.

## Syntax
```
clavix prd [options]
```

## Flags
- `-q, --quick` – Use a shorter question flow (fewer prompts to answer).
- `-p, --project <name>` – Explicitly name the project directory inside `.clavix/outputs/`.
- `-t, --template <path>` – Load a custom question flow from the given file.
- `--skip-validation` – Skip CLEAR analysis of the generated quick PRD.

## Inputs
- Interactive answers to the question flow (text, lists, yes/no).
- Optional autodetected tech stack from `package.json`, `requirements.txt`, `Gemfile`, `go.mod`, `Cargo.toml`, or `composer.json`.

## Outputs
- `.clavix/outputs/<project>/full-prd.md` – Detailed PRD for stakeholders.
- `.clavix/outputs/<project>/quick-prd.md` – Condensed, AI-optimized PRD.
- Optional CLEAR assessment printed to the console (unless `--skip-validation` is set).

## Examples
- `clavix prd`
- `clavix prd --project billing-api`
- `clavix prd --quick --skip-validation`

## Common messages
- `This question is required` – You tried to submit an empty answer for a required question; provide content or accept the detected default.
- `✗ Error: <message>` – Execution failed; the message includes the specific issue (e.g. file system permissions).
