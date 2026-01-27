# Implementer Subagent Prompt Template

Use this template when dispatching an implementer subagent for a specific task.

```
Task tool:

description: "Implement Task N: [task name]"

prompt: |
  You are implementing Task N: [task name]

  ## Task Description

  [FULL TEXT of task from plan - paste it here, don't make subagent read file]

  ## Context

  [Scene-setting: where this fits in the project, dependencies, architectural context]
  [Reference any relevant PRD sections or prior tasks]

  ## Before You Begin

  If you have questions about:
  - The requirements or acceptance criteria
  - The approach or implementation strategy
  - Dependencies or assumptions
  - Anything unclear in the task description

  **Ask them now.** Raise any concerns before starting work.

  ## Your Job

  Once you're clear on requirements:

  1. Implement exactly what the task specifies
  2. Write tests (following TDD if task says to)
  3. Verify implementation works (run tests, check build)
  4. Commit your work
  5. Self-review (see below)
  6. Report back

  Work from: [directory/workspace]

  **While you work:** If you encounter something unexpected or unclear, **ask questions**.
  It's always OK to pause and clarify. Don't guess or make assumptions.

  ## Before Reporting Back: Self-Review

  Review your work with fresh eyes. Ask yourself:

  **Completeness:**
  - Did I fully implement everything in the spec?
  - Did I miss any requirements?
  - Are there edge cases I didn't handle?

  **Quality:**
  - Is this my best work?
  - Are names clear and accurate (match what things do, not how they work)?
  - Is the code clean and maintainable?

  **Discipline:**
  - Did I avoid overbuilding (YAGNI)?
  - Did I only build what was requested?
  - Did I follow existing patterns in the codebase?

  **Testing:**
  - Do tests actually verify behavior (not just mock behavior)?
  - Did I follow TDD if required?
  - Are tests comprehensive?

  **If you find issues during self-review, fix them now before reporting.**

  ## Report Format

  When done, report:

  ```
  ## Implementation Complete

  **Task:** [task name]
  **Status:** Complete / Partial / Blocked

  ### What I Implemented
  - [List of changes made]

  ### Files Changed
  - `path/to/file.ts` - [what changed]

  ### Test Results
  [Paste test output or summary]

  ### Self-Review Findings
  - [Any issues found and fixed during self-review]
  - [Or "No issues found"]

  ### Issues or Concerns
  - [Any remaining concerns or questions]
  - [Or "None"]
  ```
```

---

## When to Use This Template

- Dispatching a subagent to implement a single task from the plan
- Each task gets its own fresh subagent (no context pollution)
- Subagent implements, tests, commits, and self-reviews before reporting

## Key Points

1. **Provide full task text** - Don't make subagent read the plan file
2. **Include context** - Where this fits, what came before
3. **Encourage questions** - Subagent should ask before guessing
4. **Require self-review** - Catches issues before handoff
5. **Structured report** - Clear summary of what was done
