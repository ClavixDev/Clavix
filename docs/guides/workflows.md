# Workflow guide

This guide outlines the typical lifecycle for using Clavix on a project. Each phase links to relevant command documentation for deeper detail.

## Choosing the Right Mode

Before starting any workflow, it's important to select the right mode for your task:

### Quick Decision Tree

**Are you modifying or improving something that already exists?**
→ Use [`clavix fast`](../commands/fast.md) or [`clavix deep`](../commands/deep.md)

**Are you developing something completely new?**
→ Use [`clavix prd`](../commands/prd.md)

### Mode Details

**Fast Mode** – Quick improvements and clarifications
- Changing UI elements (e.g., button colors, text, spacing)
- Small modifications to existing features
- Adding/modifying sections within existing pages
- Quick refinement when you know generally what you want

**Deep Mode** – Comprehensive analysis with alternatives
- When you want thorough evaluation and multiple approaches
- Learning better prompt engineering techniques
- Complex modifications requiring careful consideration
- Most tasks work well with either fast or deep mode

**PRD Mode** – New feature development
- Building completely new features, pages, or sections
- Discovery-to-specs conversation with structured requirements
- Greenfield projects with multiple requirements to cover
- When you need a clear plan with defined tasks

### Real-World Example: Business Website

**Existing page modifications** (use Fast or Deep):
- Add a new section to the homepage
- Change content in the "About Us" section
- Update styling on the contact page
- Modify navigation menu items

**New development** (use PRD):
- Create an entirely new "Services" subpage
- Build a complete blog section from scratch
- Develop a new customer portal
- Design a new checkout flow

**Rule of thumb:** For the majority of tasks, **fast** or **deep** mode will be more than enough. Use **PRD** when you're developing something that doesn't exist yet.

## 1. Gather requirements

1. Run [`clavix start`](../commands/start.md) to capture a free-form conversation or brainstorming session.
2. Summarize the session with [`clavix summarize`](../commands/summarize.md) to produce `mini-prd.md` and `optimized-prompt.md`. Optionally keep the CLEAR-optimized prompt.

### Alternative: Jump straight to PRD

If you already know what you need, use [`clavix prd`](../commands/prd.md) to answer five focused questions and generate both `full-prd.md` and `quick-prd.md`.

### Alternative: Quick prompt optimization (v2.7+)

For smaller features or quick improvements:

1. Run [`clavix fast`](../commands/fast.md) for CLEAR-optimized prompt (Concise, Logical, Explicit)
2. Or run [`clavix deep`](../commands/deep.md) for comprehensive analysis with alternatives
3. Prompts auto-save to `.clavix/outputs/prompts/`

## 1.5 Prompt Lifecycle Management (v2.7+)

After optimizing prompts with `fast` or `deep`:

### Review saved prompts
1. View saved prompts: `ls .clavix/outputs/prompts/`
2. Check prompt frontmatter for execution status (`executed: false`)
3. Review prompt IDs and timestamps

### Execute when ready
Use the `/clavix:implement` slash command:
1. **Quick execution**: `/clavix:implement --latest` (auto-selects most recent prompt)
2. **Task mode**: `/clavix:implement --tasks` (execute tasks from tasks.md)

The agent reads the optimized prompt and implements it.

### Clean up prompts
Delete old prompt files directly:
```bash
rm .clavix/outputs/prompts/executed-*.md
```

**Best practice**: After implementing prompts, delete the executed files to keep storage lean.

## 2. Plan implementation

1. Run [`clavix plan`](../commands/plan.md) to convert PRD artifacts (full, quick, mini, or prompt) into a structured `tasks.md` file.
2. Review the generated phases and tasks, editing the markdown as needed. Each task references the PRD section it came from.

## 3. Execute tasks

1. Launch [`clavix implement`](../commands/implement.md) to pick up the first incomplete task.
2. Choose an auto-commit strategy or disable git automation entirely.
3. Work on the displayed task implementation.
4. Run [`clavix task-complete <taskId>`](../commands/task-complete.md) to mark the task done.
5. The command automatically displays the next incomplete task.
6. Repeat steps 3-5 until all tasks are complete.

**Git auto-commit strategies:**
- `none` (default): Manual git workflow
- `per-task`: Commit after every task
- `per-5-tasks`: Commit every 5 tasks
- `per-phase`: Commit when phase completes

Use `--no-git` flag with `task-complete` to skip commits for specific tasks.

## 4. Archive or iterate

- Use [`clavix archive`](../commands/archive.md) to move completed outputs into `.clavix/outputs/archive/`, keeping the workspace clean.
- Run [`clavix list`](../commands/list.md) and [`clavix show`](../commands/show.md) at any time to inspect sessions, outputs, or archived projects.
- Update provider commands with [`clavix update`](../commands/update.md) whenever you change configuration or add new adapters.

## 5. Maintain configuration

- Re-run [`clavix init`](../commands/init.md) to reconfigure integrations or rebuild the `.clavix` directory structure.
- Use [`clavix diagnose`](../commands/diagnose.md) to check installation health and troubleshoot issues.

## Tips

- CLEAR validation runs automatically after PRD generation to confirm that the AI-facing copy is concise, logical, and explicit.
- `clavix plan --session <id>` generates PRD artifacts from a conversation on the fly, making it easy to convert discussions into actionable work.
- `clavix summarize --skip-clear` is useful when you only want raw extraction without additional optimization.

For reference material on individual commands, continue to the [Command reference](../commands/README.md).
