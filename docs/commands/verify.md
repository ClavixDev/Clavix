# /clavix:verify

Verify your implementation against validation checklists from improve mode.

## Overview

After building something with `/clavix:implement`, run `/clavix:verify` to check that everything works correctly. This is a quality check before calling the work done.

## Usage

```
/clavix:verify
```

## What It Does

1. **Finds your work** - Locates the prompt you implemented
2. **Checks against the checklist** - Verifies all requirements were met
3. **Runs automated tests** - If tests exist, runs them automatically
4. **Reports results** - Clear breakdown of what passed and failed
5. **Identifies issues** - Shows what needs fixing

## What It Does NOT Do

- Write new code
- Fix issues found
- Change your implementation
- Skip checks without asking

## Workflow

```
You:    /clavix:verify
Agent:  "Let me check your implementation..."
        [Runs tests automatically]
        [Goes through checklist]
Agent:  "Here's what I found:
        ✅ 8 items passed
        ❌ 2 items need attention

        Want me to explain what needs fixing?"
```

## Check Types

### Automated Checks

Things verified automatically:
- Test suite execution (`npm test`, `pytest`, etc.)
- Build/compile verification
- Linter checks
- Type checking (TypeScript, etc.)

### Manual Checks

For items that can't be automated, the agent will:
- Show you what needs verification
- Ask if it's working
- Record your answer

## Report Format

The verification report shows:

```
## Verification Report

### ✅ Passed (8/10)
- [x] Tests pass
- [x] Build succeeds
- [x] TypeScript types valid
...

### ❌ Failed (2/10)
- [ ] Error handling for edge case
- [ ] Mobile responsive design

### Recommendations
1. Add try/catch for network failures
2. Test on smaller viewports
```

## When to Use

- After completing `/clavix:implement`
- Before marking a feature as done
- When you want a quality check
- Before creating a pull request

## Related Commands

- [/clavix:implement](implement.md) - Execute tasks (run before verify)
- [/clavix:archive](archive.md) - Archive after verification passes
