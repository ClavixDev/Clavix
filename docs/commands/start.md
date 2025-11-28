# /clavix:start

## Description
Starts conversational mode for iterative requirements gathering. Use this when you're not sure what to build yet and want to explore ideas through natural conversation.

## Syntax
```
/clavix:start
```

## Arguments
- None. This is a slash command that starts a guided conversation.

## What It Does
When you run `/clavix:start`:
1. **Enter exploration mode** - The AI helps you figure out what to build
2. **Ask clarifying questions** - Instead of jumping to implementation
3. **Track conversation topics** - Keeps track of requirements discussed
4. **Guide when ready** - Suggests `/clavix:summarize` when enough is captured

## Mode Boundaries
- ✓ Asking clarifying questions
- ✓ Helping think through ideas
- ✓ Identifying edge cases
- ✓ Tracking requirements
- ✗ Writing code
- ✗ Starting implementation
- ✗ Rushing to solutions

## Examples
```
/clavix:start
```

Then have a natural conversation:
- "I need a dashboard for analytics"
- "What kind of analytics? Business metrics, user behavior?"
- "Business metrics - sales and revenue"
- "Who will use it? Executives, sales team?"
...and so on.

## Next Steps
When the conversation has captured enough requirements:
- `/clavix:summarize` - Extract requirements into structured outputs
- `/clavix:prd` - Switch to guided PRD generation

## Related Commands
- `/clavix:summarize` - Extract and optimize conversation into requirements
- `/clavix:prd` - Structured PRD generation with guided questions
- `/clavix:improve` - Direct prompt optimization (skip conversation)
