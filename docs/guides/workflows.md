# Workflow guide

This guide outlines the typical lifecycle for using Clavix on a project. Each phase links to relevant command documentation for deeper detail.

## 1. Gather requirements

1. Run [`clavix start`](../commands/start.md) to capture a free-form conversation or brainstorming session.
2. Summarize the session with [`clavix summarize`](../commands/summarize.md) to produce `mini-prd.md` and `optimized-prompt.md`. Optionally keep the CLEAR-optimized prompt.

### Alternative: Jump straight to PRD

If you already know what you need, use [`clavix prd`](../commands/prd.md) to answer five focused questions and generate both `full-prd.md` and `quick-prd.md`.

## 2. Plan implementation

1. Run [`clavix plan`](../commands/plan.md) to convert PRD artifacts (full, quick, mini, or prompt) into a structured `tasks.md` file.
2. Review the generated phases and tasks, editing the markdown as needed. Each task references the PRD section it came from.

## 3. Execute tasks

1. Launch [`clavix implement`](../commands/implement.md) to pick up the first incomplete task.
2. Choose an auto-commit strategy or disable git automation entirely.
3. Follow the on-screen instructions to work through tasks, marking checkboxes and committing progress.

## 4. Archive or iterate

- Use [`clavix archive`](../commands/archive.md) to move completed outputs into `.clavix/outputs/archive/`, keeping the workspace clean.
- Run [`clavix list`](../commands/list.md) and [`clavix show`](../commands/show.md) at any time to inspect sessions, outputs, or archived projects.
- Update provider commands with [`clavix update`](../commands/update.md) whenever you change configuration or add new adapters.

## 5. Maintain configuration

- Manage project preferences with [`clavix config`](../commands/config.md).
- Re-run [`clavix init`](../commands/init.md) if you add providers or need to rebuild the `.clavix` directory structure.

## Tips

- CLEAR validation runs automatically after PRD generation to confirm that the AI-facing copy is concise, logical, and explicit.
- `clavix plan --session <id>` generates PRD artifacts from a conversation on the fly, making it easy to convert discussions into actionable work.
- `clavix summarize --skip-clear` is useful when you only want raw extraction without additional optimization.

For reference material on individual commands, continue to the [Command reference](../commands/README.md).
