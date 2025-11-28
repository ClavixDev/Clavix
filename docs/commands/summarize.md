# /clavix:summarize

## Description
Extracts structured requirements from the current conversation. Use this after `/clavix:start` to turn exploratory discussion into actionable documentation.

## Syntax
```
/clavix:summarize
```

## Arguments
- None. Analyzes the current conversation context.

## What It Does
When you run `/clavix:summarize`:
1. **Pre-validation** - Checks if enough was discussed (objective, requirements, context)
2. **Extract requirements** - Pulls out features, constraints, success criteria
3. **Create documentation** - Generates mini-PRD and optimized prompt files
4. **Apply optimization** - Enhances clarity, structure, and completeness
5. **Flag unclear areas** - Identifies what needs more discussion

## Output Files
Creates in `.clavix/outputs/[project-name]/`:
- `mini-prd.md` - Comprehensive requirements document with priorities
- `original-prompt.md` - Raw extraction from conversation
- `optimized-prompt.md` - Enhanced version ready for implementation

## Mode Boundaries
- ✓ Analyzing conversation
- ✓ Extracting requirements
- ✓ Creating documentation files
- ✓ Applying optimization patterns
- ✗ Writing code
- ✗ Starting implementation

## Confidence Indicators
Extracted requirements are annotated with confidence levels:
- **[HIGH]** - Explicitly stated multiple times with details
- **[MEDIUM]** - Mentioned once or inferred from context
- **[LOW]** - Assumed based on limited information

## Examples
After a `/clavix:start` conversation:
```
/clavix:summarize
```

Output includes quality improvements:
- **[Efficiency]**: Removed conversational fluff
- **[Structure]**: Organized into context → requirements → constraints
- **[Clarity]**: Added explicit specifications
- **[Completeness]**: Added missing success criteria

## Next Steps
After summarization:
- `/clavix:plan` - Generate task breakdown from the mini-PRD
- `/clavix:implement` - Execute the optimized prompt directly
- Continue conversation if areas flagged as unclear

## Related Commands
- `/clavix:start` - Begin conversational exploration (typical previous step)
- `/clavix:plan` - Generate tasks from extracted requirements
- `/clavix:improve` - Further optimize extracted prompt
