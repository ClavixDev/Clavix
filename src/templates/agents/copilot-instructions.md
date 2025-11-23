# Clavix Workflows for GitHub Copilot

These instructions enhance GitHub Copilot's understanding of the Clavix universal prompt intelligence toolkit and workflow commands available in this project.

## About Clavix

Clavix is a universal prompt intelligence toolkit that helps improve prompts, generate PRDs, and manage implementation workflows. It automatically detects intent and applies quality-based optimization patterns without requiring users to learn any specific framework.

## Available Commands

When working with this project, you can use the following Clavix commands:

### Prompt Improvement
- `clavix fast "<prompt>"` - Quick quality assessment (5 dimensions) with improved prompt output. CLI auto-saves; slash commands require manual saving per template instructions.
- `clavix deep "<prompt>"` - Comprehensive analysis with alternatives, edge cases, and validation checklists. CLI auto-saves; slash commands require manual saving per template instructions.

### Strategic Planning
- `clavix prd` - Interactive PRD generation through Socratic questioning
- `clavix plan` - Transform PRDs into phase-based implementation tasks
- `clavix implement [--commit-strategy=<type>]` - Execute tasks with progress tracking (git: per-task, per-5-tasks, per-phase, none [default])
- `clavix task-complete <taskId>` - Mark task as completed with validation and optional git commit

### Conversational Workflows
- `clavix start` - Begin conversational session for requirements gathering
- `clavix summarize [session-id]` - Extract mini-PRD and optimized prompts from sessions

### Project Management
- `clavix list` - List sessions and output projects
- `clavix show [session-id]` - Inspect session or project details
- `clavix archive [project]` - Archive or restore completed projects
- `clavix update` - Refresh Clavix documentation and commands

### Prompt Lifecycle Management (v2.7+)
Clavix now automatically saves optimized prompts from fast/deep commands for later execution:

- `clavix execute [--latest]` - Execute saved prompts from fast/deep optimization
  - Interactive selection from saved prompts
  - `--latest` flag for most recent prompt
  - `--fast` / `--deep` filters with `--latest`
  - `--id <prompt-id>` for specific prompt execution

- `clavix prompts list` - View all saved prompts with lifecycle status
  - Status indicators: NEW, EXECUTED, OLD (>7 days), STALE (>30 days)
  - Storage statistics dashboard
  - Age warnings and hygiene recommendations

- `clavix prompts clear` - Manage prompt cleanup with safety checks
  - `--executed` - Clear executed prompts only (safe cleanup)
  - `--stale` - Clear prompts >30 days old
  - `--fast` - Clear fast mode prompts
  - `--deep` - Clear deep mode prompts
  - `--all` - Clear all prompts (with confirmation)
  - `--force` - Skip confirmation prompts

**Prompt Lifecycle Workflow:**
1. Optimize: `clavix fast/deep "<prompt>"` → CLI auto-saves; slash commands require manual saving
2. Review: `clavix prompts list` → View all saved prompts with status
3. Execute: `clavix execute --latest` → Implement when ready
4. Cleanup: `clavix prompts clear --executed` → Remove completed prompts

## Workflow Patterns

### Quick Prompt Improvement
1. User provides a rough prompt
2. Run `clavix fast "<prompt>"` for quick quality-based improvements
3. Use the optimized prompt for better results

### Comprehensive Prompt Analysis
1. User has a complex requirement
2. Run `clavix deep "<prompt>"` for comprehensive analysis
3. Review alternative variations and validation checklists
4. Select the best approach

### Strategic Project Planning
1. Run `clavix prd` to generate a comprehensive PRD through guided questions
2. Run `clavix plan` to break down the PRD into implementation tasks
3. Run `clavix implement` to execute tasks systematically
4. Archive completed work with `clavix archive`

### Conversational Requirements Gathering
1. Run `clavix start` to begin capturing a conversation
2. Discuss requirements naturally with the user
3. Run `clavix summarize` to extract structured requirements and prompts

## Quality Dimensions

When analyzing or improving prompts, consider these 5 quality dimensions:

- **Clarity**: Is the objective clear and unambiguous?
- **Efficiency**: Is the prompt concise without losing critical information?
- **Structure**: Is information organized logically (context → requirements → constraints → output)?
- **Completeness**: Are all necessary specifications provided (persona, format, tone, success criteria)?
- **Actionability**: Can AI take immediate action on this prompt?

## Output Locations

Clavix stores artifacts in the `.clavix/` directory:
- `.clavix/outputs/<project>/` - PRDs, tasks, and optimized prompts
- `.clavix/sessions/` - Captured conversational sessions
- `.clavix/templates/` - Custom template overrides
- `.clavix/config.json` - Project configuration

## Best Practices

1. **Start with the right mode**: Use fast mode for simple prompts, deep mode for complex requirements, and PRD mode for strategic planning
2. **Focus on quality**: Always consider the 5 quality dimensions (Clarity, Efficiency, Structure, Completeness, Actionability) when crafting prompts
3. **Document requirements**: Use PRD workflow for significant features to ensure clear requirements
4. **Track progress**: Use implement command to maintain structured task execution
5. **Archive completed work**: Keep project organized by archiving finished projects

## Integration with GitHub Copilot

When users ask for help with prompts or requirements:
1. Suggest running the appropriate Clavix command
2. Explain the expected output and benefits
3. Help interpret Clavix-generated outputs
4. Apply quality assessment principles in your responses

This integration makes GitHub Copilot aware of Clavix workflows and can suggest using Clavix commands when appropriate.
