# Why Clavix

AI coding agents are eager to help—sometimes too eager. When you say "add auth," most agents immediately start writing code. This is problematic for complex work because requirements aren't clear, architecture decisions haven't been made, and edge cases haven't been considered.

**Clavix injects discipline.** It teaches AI agents to ask questions first, document requirements, break down tasks, and only then implement—with explicit permission.

## The Problem

AI agents tend to:
- Jump straight to implementation without clarifying requirements
- Make assumptions about architecture and technology choices
- Miss edge cases and error handling
- Produce inconsistent results across sessions

This leads to wasted iterations, misaligned implementations, and technical debt.

## How Clavix Helps

**Agent-first architecture**: Clavix generates instruction files that AI agents read and follow. When you run `clavix init`, Clavix injects structured workflows into your agent's context.

**Pattern-based optimization**: Transform vague requests into structured, actionable prompts using deterministic pattern matching. No API calls, no magic—just well-tested heuristics.

**Mode enforcement**: Clear boundaries between planning and implementation. Agents can't skip from exploration to code without going through documentation and explicit permission.

## What It Provides

- **Prompt optimization** – Analyze quality across 6 dimensions, apply improvement patterns, generate structured output
- **PRD generation** – Guided requirements gathering through strategic questions
- **Task planning** – Transform PRDs into phased implementation plans
- **Progress tracking** – Systematic task completion with git integration
- **Verification** – Post-implementation checklists

## Typical Use Cases

- Turning a rough feature idea into a PRD before implementation
- Improving ad-hoc prompts for Claude Code, Cursor, Windsurf, Droid, and 15+ other agents
- Enforcing consistent workflows across team members
- Preventing premature implementation of unclear requirements

## What It Doesn't Do

- **No AI/LLM processing** – Runs locally with deterministic rules
- **No semantic understanding** – Pattern matching cannot evaluate correctness
- **No guaranteed improvements** – Results depend on your input and use case

## Related Documentation

- [How It Works](how-it-works.md) – Technical details of the optimization pipeline
- [Philosophy](philosophy.md) – What Clavix actually is
- [Supported Integrations](integrations.md) – 20+ AI coding environments
- [Choosing a Workflow](guides/choosing-workflow.md) – When to use what
