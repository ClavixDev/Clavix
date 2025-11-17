---
name: "Clavix: Prompts"
description: Manage saved prompts (list, clear, inspect)
---

# Clavix: Prompts Management

Manage your saved fast/deep prompts with lifecycle awareness.

## List All Prompts

```bash
clavix prompts list
```

Shows:
- All saved prompts with age
- Execution status (executed ✓ / pending ○)
- Age warnings (OLD >7d, STALE >30d)
- Storage statistics

## Cleanup Workflows

**After executing prompts (recommended):**
```bash
clavix prompts clear --executed
```

**Remove stale prompts (>30 days):**
```bash
clavix prompts clear --stale
```

**Remove specific type:**
```bash
clavix prompts clear --fast
clavix prompts clear --deep
```

**Interactive cleanup:**
```bash
clavix prompts clear
```

**Remove all (with safety checks):**
```bash
clavix prompts clear --all
```

## Best Practices

**Regular cleanup schedule:**
1. After executing prompts: Clear executed
2. Weekly: Review and clear stale
3. Before archiving PRD: Clear related prompts

**Storage hygiene:**
- Keep <20 active prompts for performance
- Clear executed prompts regularly
- Review prompts >7 days old

**Safety:**
- System warns before deleting unexecuted prompts
- Interactive mode shows what will be deleted
- Prompts are in `.clavix/outputs/prompts/` for manual recovery

## Prompt Lifecycle

```
CREATE   → /clavix:fast or /clavix:deep
REVIEW   → /clavix:prompts (you are here)
EXECUTE  → /clavix:execute
CLEANUP  → /clavix:prompts clear
```

## Common Workflows

**Quick execute (no review):**
```bash
/clavix:fast "task"
/clavix:execute --latest
```

**Review before executing:**
```bash
/clavix:fast "task"
/clavix:prompts              # Review
/clavix:execute              # Select interactively
/clavix:prompts clear --executed
```

**Batch cleanup:**
```bash
/clavix:prompts              # See stats
clavix prompts clear --executed
clavix prompts clear --stale
```
