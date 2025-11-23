# clavix prd

## Description
Generates a Product Requirements Document through a short series of Socratic questions. Produces both a comprehensive PRD for teams and a quick, AI-ready version that is validated with the CLEAR framework by default.

## When to Use
Use **PRD mode** for:
- **Developing something completely new** – When you're building a new feature, page, or section from scratch
- **Discovery-to-specs conversation** – Structured requirements gathering through guided questions
- **Complex new features with multiple requirements** – Projects that need clear planning with doable tasks
- **Greenfield development** – Starting fresh work that doesn't yet exist in your codebase

**PRD mode is meant for new development, not modifications.** It guides you through a structured conversation to capture all requirements, constraints, and success criteria before implementation begins.

**Real-world example (business website):**
- **Use Fast/Deep:** Adding a section to an existing page, changing content in a section, updating a subpage
- **Use PRD:** Developing a completely new subpage (more work, more requirements, needs a clear plan)

**When NOT to use PRD mode:**
If you're making changes or improvements to something that already exists, use **fast** or **deep** mode instead. PRD is specifically for net-new development.

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
