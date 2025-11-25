---
name: "Clavix: Execute"
description: Execute saved prompts from fast/deep optimization
---

# Clavix: Execute Saved Prompts

Implement optimized prompts from `/clavix:fast` or `/clavix:deep`.

Prompts are automatically saved to `.clavix/outputs/prompts/fast/` or `.clavix/outputs/prompts/deep/`.

---

## CLAVIX MODE: Implementation

**You are in Clavix implementation mode. You ARE authorized to write code and implement features.**

**YOUR ROLE:**
- ✓ Read and understand prompt requirements
- ✓ Implement the optimized prompt
- ✓ Write production-quality code
- ✓ Follow prompt specifications
- ✓ Execute saved prompts from fast/deep modes

**IMPLEMENTATION AUTHORIZED:**
- ✓ Writing functions, classes, and components
- ✓ Creating new files and modifying existing ones
- ✓ Implementing features described in saved prompts
- ✓ Writing tests for implemented code

**MODE ENTRY VALIDATION:**
Before implementing, verify:
1. Source documents exist (prompts in .clavix/outputs/prompts/)
2. Output assertion: "Entering IMPLEMENTATION mode. I will implement the saved prompt."

For complete mode documentation, see: `.clavix/instructions/core/clavix-mode.md`

---

## Prerequisites

Save a prompt first:
```bash
/clavix:fast "your prompt"
# or
/clavix:deep "your prompt"
```

## Usage

**Execute latest prompt (recommended):**
```bash
clavix execute --latest
```

**Execute latest fast/deep:**
```bash
clavix execute --latest --fast
clavix execute --latest --deep
```

**Interactive selection:**
```bash
clavix execute
```

**Execute specific prompt:**
```bash
clavix execute --id <prompt-id>
```

## Agent Workflow

1. Run `clavix execute --latest`
2. Read displayed prompt content
3. Implement requirements
4. Cleanup: `/clavix:prompts clear`

## Prompt Management

**List all saved prompts:**
```bash
clavix prompts list
```

**Clear executed prompts:**
```bash
clavix prompts clear --executed
```

**Clear all fast/deep prompts:**
```bash
clavix prompts clear --fast
clavix prompts clear --deep
```

## Error Recovery

**No prompts found:**
```bash
/clavix:fast "your requirement"
```
Then retry `/clavix:execute`.

**Too many old prompts:**
```bash
clavix prompts clear --executed
```

---

## Agent Transparency (v4.1)

### File Format Reference
{{INCLUDE:agent-protocols/file-formats.md}}

### Error Handling
{{INCLUDE:agent-protocols/error-handling.md}}

### Agent Decision Rules
{{INCLUDE:agent-protocols/decision-rules.md}}
