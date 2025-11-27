# Choosing the Right Workflow

Clavix offers multiple workflows for different situations. This guide helps you pick the right one.

## Quick Decision Tree

```
Do you have a clear, specific task?
├── YES → Is it a single prompt/request?
│   ├── YES → Use /clavix:improve
│   └── NO (multiple tasks) → Do you have requirements documented?
│       ├── YES → Use /clavix:plan then /clavix:implement
│       └── NO → Use /clavix:prd first
└── NO (vague idea) → Do you know what you want?
    ├── SOMEWHAT → Use /clavix:prd (guided questions)
    └── NOT REALLY → Use /clavix:start (conversational)
```

## Workflow Comparison

| Workflow | Best For | Input | Output |
|----------|----------|-------|--------|
| `/clavix:improve` | Single prompts needing optimization | Raw prompt text | Optimized prompt (saved) |
| `/clavix:prd` | Feature planning | Answers to guided questions | full-prd.md + quick-prd.md |
| `/clavix:plan` | Task breakdown | PRD document | tasks.md with phases |
| `/clavix:implement` | Executing task plans | tasks.md | Code changes + git commits |
| `/clavix:execute` | Running saved prompts | Saved prompt ID | Executed prompt |
| `/clavix:start` | Exploration | Conversation | Session history |
| `/clavix:summarize` | Extract requirements | Session | mini-prd.md + prompt |

## Detailed Workflows

### Improve Workflow (Ad-hoc Optimization)

**Use when**: You have a specific prompt that needs improvement.

```
/clavix:improve "Create a React component that displays user profile data"
```

**Flow**:
1. Clavix analyzes intent and quality
2. Applies relevant optimization patterns
3. Saves optimized prompt to `.clavix/outputs/prompts/`
4. You can later run it with `/clavix:execute`

**Depth selection**:
- Auto-selects based on quality score
- Force comprehensive: `/clavix:improve --comprehensive "..."`
- Force standard: `/clavix:improve --standard "..."`

### PRD Workflow (Feature Planning)

**Use when**: Planning a new feature or significant change.

```
/clavix:prd
```

**Flow**:
1. Clavix asks strategic questions about your feature
2. You answer (can use `--quick` for fewer questions)
3. Generates `full-prd.md` (comprehensive) and `quick-prd.md` (AI-optimized)
4. Continue with `/clavix:plan` to create tasks

### Plan + Implement Workflow (Structured Development)

**Use when**: You have requirements and want systematic execution.

```
/clavix:plan           # Creates tasks.md from your PRD
/clavix:implement      # Executes tasks one by one
```

**Implement options**:
- `--commit-strategy per-task` - Git commit after each task
- `--commit-strategy per-phase` - Git commit after each phase
- `--commit-strategy none` - No auto-commits

**Task completion**:
```
clavix task-complete <taskId>  # Mark task done, auto-commit if configured
```

### Execute Workflow (Running Saved Prompts)

**Use when**: You've saved prompts from `/clavix:improve` and want to execute them.

```
/clavix:execute          # Interactive selection
/clavix:execute --latest # Run most recent prompt
```

**Key difference from implement**:
- Execute = single saved prompt
- Implement = multi-task plan from PRD

### Conversational Workflow (Exploration)

**Use when**: You're not sure what you want yet.

```
/clavix:start                    # Begin session
[... have conversation ...]
/clavix:summarize               # Extract requirements
```

**Flow**:
1. Start a session
2. Discuss ideas, constraints, options with the AI
3. Summarize extracts a mini-PRD and optimized prompt
4. Continue with `/clavix:plan` if needed

## Execute vs Implement

This is a common point of confusion:

### Execute

- **Source**: Saved prompts from `/clavix:improve`
- **Purpose**: Run a single optimized prompt
- **Model**: One-shot execution
- **Git**: No automatic commits
- **Use case**: Ad-hoc prompt optimization workflow

### Implement

- **Source**: Task plan from `/clavix:plan` (which comes from PRD)
- **Purpose**: Execute a multi-task implementation plan
- **Model**: Sequential task execution with progress tracking
- **Git**: Optional automatic commits (per-task, per-phase, etc.)
- **Use case**: Structured feature development workflow

### When to Use Which

| Situation | Use |
|-----------|-----|
| "I have a prompt I want to improve and run" | improve → execute |
| "I'm building a new feature from scratch" | prd → plan → implement |
| "I have requirements, need to implement" | plan → implement |
| "I optimized a prompt earlier, want to run it" | execute |
| "I'm in the middle of a task plan" | implement |

## Workflow Chaining

Common workflow chains:

### Simple (single prompt)
```
/clavix:improve "..." → /clavix:execute --latest
```

### Standard (feature development)
```
/clavix:prd → /clavix:plan → /clavix:implement
```

### Exploratory (unclear requirements)
```
/clavix:start → /clavix:summarize → /clavix:plan → /clavix:implement
```

### Verification (post-implementation)
```
/clavix:implement → /clavix:verify
```

## Tips

1. **Start simple**: Use `/clavix:improve` for quick wins
2. **Use PRD for complexity**: If you're building something substantial, invest in `/clavix:prd`
3. **Don't skip planning**: `/clavix:plan` creates trackable tasks
4. **Commit strategy matters**: Choose based on how granular you want git history
5. **Verify at the end**: `/clavix:verify` ensures you didn't miss checklist items
