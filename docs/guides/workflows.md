# Workflow Guide

This guide outlines the typical lifecycle for using Clavix on a project. Each phase links to relevant command documentation for deeper detail.

## Choosing the Right Mode

Before starting any workflow, it's important to select the right mode for your task:

### Quick Decision Tree

**Are you modifying or improving something that already exists?**
→ Use `/clavix:improve` - analyzes your prompt and selects the appropriate depth automatically

**Are you developing something completely new?**
→ Use `/clavix:prd` for structured planning

### Mode Details

**Improve Mode** – Prompt optimization with auto-depth selection
- Changing UI elements (e.g., button colors, text, spacing)
- Small to medium modifications to existing features
- Adding/modifying sections within existing pages
- Quick refinement when you know generally what you want
- Complex modifications requiring careful consideration
- Clavix automatically selects standard or comprehensive depth based on prompt quality

**PRD Mode** – New feature development
- Building completely new features, pages, or sections
- Discovery-to-specs conversation with structured requirements
- Greenfield projects with multiple requirements to cover
- When you need a clear plan with defined tasks

### Real-World Example: Business Website

**Existing page modifications** (use Improve):
- Add a new section to the homepage
- Change content in the "About Us" section
- Update styling on the contact page
- Modify navigation menu items

**New development** (use PRD):
- Create an entirely new "Services" subpage
- Build a complete blog section from scratch
- Develop a new customer portal
- Design a new checkout flow

**Rule of thumb:** For the majority of tasks, `/clavix:improve` will be more than enough. Use `/clavix:prd` when you're developing something that doesn't exist yet.

## 1. Gather Requirements

### Option A: Conversational Discovery
1. Run `/clavix:start` to capture a free-form conversation or brainstorming session.
2. Summarize the session with `/clavix:summarize` to produce `mini-prd.md` and `optimized-prompt.md`.

### Option B: Jump Straight to PRD
If you already know what you need, use `/clavix:prd` to answer five focused questions and generate both `full-prd.md` and `quick-prd.md`.

### Option C: Quick Prompt Optimization
For smaller features or quick improvements:
1. Run `/clavix:improve "your prompt"` - Clavix auto-selects the appropriate depth
2. Prompts auto-save to `.clavix/outputs/prompts/`

## 2. Prompt Lifecycle Management

After optimizing prompts with `/clavix:improve`:

### Review Saved Prompts
1. View saved prompts: `ls .clavix/outputs/prompts/`
2. Check prompt frontmatter for execution status (`executed: false`)
3. Review prompt IDs and timestamps

### Execute When Ready
Use the `/clavix:implement` slash command:
1. **Quick execution**: `/clavix:implement --latest` (auto-selects most recent prompt)
2. **Task mode**: `/clavix:implement --tasks` (execute tasks from tasks.md)

The agent reads the optimized prompt and implements it.

### Clean Up Prompts
Delete old prompt files directly:
```bash
rm .clavix/outputs/prompts/executed-*.md
```

**Best practice**: After implementing prompts, delete the executed files to keep storage lean.

## 3. Plan Implementation

1. Run `/clavix:plan` to convert PRD artifacts (full, quick, mini, or prompt) into a structured `tasks.md` file.
2. Review the generated phases and tasks, editing the markdown as needed. Each task references the PRD section it came from.

## 4. Execute Tasks

1. Launch `/clavix:implement` to pick up the first incomplete task.
2. Work on the displayed task implementation.
3. The agent marks tasks complete by editing the checkboxes in `tasks.md`.
4. Repeat until all tasks are complete.

**Git integration** is handled by the agent during implementation as needed.

## 5. Archive or Iterate

- Use `/clavix:archive` to move completed outputs into `.clavix/outputs/archive/`, keeping the workspace clean.
- Update integration commands with `clavix update` whenever you change configuration or add new integrations.

## 6. Maintain Configuration

- Re-run `clavix init` to reconfigure integrations or rebuild the `.clavix` directory structure.
- Use `clavix diagnose` to check installation health and troubleshoot issues.

## Tips

- `/clavix:improve` automatically selects the appropriate depth based on prompt quality (standard vs comprehensive).
- Use `/clavix:prd` when starting completely new features that need structured planning.
- The `/clavix:implement` command auto-detects whether to use tasks.md or saved prompts.

For reference material on individual commands, continue to the [Command reference](../commands/README.md).
