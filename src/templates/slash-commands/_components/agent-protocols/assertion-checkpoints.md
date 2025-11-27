## Assertion Checkpoints (v4.6)

At key workflow stages, verify your execution matches expected state. These checkpoints help ensure correct template execution.

### Fast/Deep Mode Checkpoints

**CHECKPOINT 1: After Intent Detection**
```
✓ Intent type identified (one of 11 types)
✓ Confidence percentage calculated
✓ If confidence < 70%: Secondary intent noted
```

**CHECKPOINT 2: After Quality Assessment**
```
✓ All 6 dimensions scored:
  - Clarity (0-100%)
  - Efficiency (0-100%)
  - Structure (0-100%)
  - Completeness (0-100%)
  - Actionability (0-100%)
  - Specificity (0-100%)
✓ Overall quality calculated
✓ Strengths identified (any dimension >= 85%)
```

**CHECKPOINT 3: After Optimization**
```
✓ Enhanced prompt generated
✓ Improvements listed with dimension labels
✓ Patterns applied documented
```

**CHECKPOINT 4: After Saving**
```
✓ Prompt saved to .clavix/outputs/prompts/{mode}/
✓ Index file updated
✓ Success message displayed
```

### PRD Mode Checkpoints

**CHECKPOINT 1: Before Questions**
```
✓ State assertion displayed
✓ Implementation blocked message shown
```

**CHECKPOINT 2: After Each Question**
```
✓ Answer validated for completeness
✓ Follow-up asked if answer is vague
✓ Minimum requirements met before proceeding
```

**CHECKPOINT 3: After Document Generation**
```
✓ Full PRD generated with all sections
✓ Quick PRD generated (2-3 paragraphs)
✓ Quality validation scores displayed
```

**CHECKPOINT 4: After Saving**
```
✓ Files saved to .clavix/outputs/{project-name}/
✓ full-prd.md exists
✓ quick-prd.md exists
✓ Next steps displayed
```

### Implementation Mode Checkpoints

**CHECKPOINT 1: Before Starting**
```
✓ Config file checked (.clavix-implement-config.json)
✓ Resume state detected if exists
✓ Tasks loaded from tasks.md
```

**CHECKPOINT 2: After Each Task**
```
✓ Task completed successfully
✓ tasks.md edited: - [ ] changed to - [x] for completed task
✓ Next task displayed automatically
```

**CHECKPOINT 3: After All Tasks**
```
✓ All tasks marked complete
✓ Archive suggestion displayed
✓ Git commit created if configured
```

### Verification Block Format

At the end of your response, include this verification block:

```
## Clavix Execution Verification
- [x] Intent detected: {type} ({confidence}%)
- [x] Quality assessed: {overall}%
- [x] {N} patterns applied
- [x] Prompt saved: {filename}
- [x] Mode: {fast|deep|prd|plan}
```

This allows users and developers to verify correct template execution and helps identify any deviations from expected behavior.

### Self-Verification Protocol

If a checkpoint fails:
1. **STOP**: Do not proceed past the failed checkpoint
2. **IDENTIFY**: Which checkpoint failed and why
3. **REPORT**: Inform user of the issue
4. **RECOVER**: Take corrective action or ask for guidance

Example recovery:
```
⚠️ Checkpoint 2 failed: Quality assessment incomplete
Issue: Specificity dimension not scored
Action: Rerunning quality assessment with all 6 dimensions
```
