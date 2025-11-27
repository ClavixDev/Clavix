# Clavix v4.x Architecture (Archived)

This document describes the architecture of Clavix v4.x before the v5.0.0 refactoring to a lean agentic-first design.

## Overview

Clavix v4.x was a dual-path system with both CLI commands and markdown slash commands that provided parallel implementations of the same functionality.

## Architecture Components

### CLI Commands (19 total)

```
src/cli/commands/
├── improve.ts        - Prompt optimization with TypeScript pattern engine
├── prd.ts            - PRD generation with Socratic questions
├── plan.ts           - Task breakdown from PRD
├── implement.ts      - Task execution with git integration
├── start.ts          - Conversational session management
├── summarize.ts      - Extract PRD from conversations
├── execute.ts        - Execute saved prompts
├── verify.ts         - Implementation verification
├── archive.ts        - Project archiving
├── analyze.ts        - JSON analysis output
├── task-complete.ts  - Mark tasks complete
├── list.ts           - List sessions/outputs
├── show.ts           - Show project details
├── init.ts           - Project initialization
├── update.ts         - Template refresh
├── config.ts         - Configuration management
├── version.ts        - Version display
└── prompts/
    ├── list.ts       - List saved prompts
    └── clear.ts      - Clear saved prompts
```

### Intelligence Layer (~7,790 lines)

The TypeScript intelligence layer provided pattern-based prompt optimization:

```
src/core/intelligence/
├── universal-optimizer.ts    - Orchestration engine for optimization pipeline
├── quality-assessor.ts       - 6-dimension quality scoring system
├── pattern-library.ts        - Pattern registry and selection logic
├── intent-detector.ts        - Keyword-based intent classification
├── confidence-calculator.ts  - Confidence scoring
├── types.ts                  - Type definitions
└── patterns/                 - 20 optimization patterns
    ├── base-pattern.ts
    ├── conciseness-filter.ts
    ├── objective-clarifier.ts
    ├── technical-context-enricher.ts
    ├── structure-organizer.ts
    ├── completeness-validator.ts
    ├── actionability-enhancer.ts
    ├── prd-structure-enforcer.ts
    ├── step-decomposer.ts
    ├── context-precision.ts
    ├── ambiguity-detector.ts
    ├── output-format-enforcer.ts
    ├── success-criteria-enforcer.ts
    ├── domain-context-enricher.ts
    ├── requirement-prioritizer.ts
    ├── user-persona-enricher.ts
    ├── success-metrics-enforcer.ts
    ├── dependency-identifier.ts
    ├── conversation-summarizer.ts
    ├── topic-coherence-analyzer.ts
    └── implicit-requirement-extractor.ts
```

### Core Managers (~3,500 lines)

State management and service modules:

```
src/core/
├── prompt-manager.ts         - Prompt lifecycle tracking with .index.json
├── session-manager.ts        - Conversational session persistence
├── task-manager.ts           - Task state management
├── archive-manager.ts        - Archive operations
├── git-manager.ts            - Git commit automation
├── prd-generator.ts          - PRD document generation
├── conversation-analyzer.ts  - Conversation parsing
├── verification-manager.ts   - Implementation verification
├── verification-hooks.ts     - CLI hook detection
├── basic-checklist-generator.ts - Checklist generation
├── checklist-parser.ts       - Checklist parsing
└── question-engine.ts        - Socratic question flow
```

### Templates (~10,744 lines)

Markdown templates that instructed AI agents:

```
src/templates/
├── slash-commands/
│   ├── _canonical/           - 9 primary slash command templates
│   └── _components/          - 31 reusable component templates
├── agents/                   - Agent-specific instructions
└── instructions/             - Core workflow guides
```

## Dual-Path Execution

### Path A: CLI Commands

When users ran `clavix improve "prompt"`:

1. CLI command handler loaded
2. UniversalOptimizer instantiated
3. IntentDetector analyzed prompt
4. PatternLibrary selected applicable patterns
5. Patterns applied sequentially
6. QualityAssessor scored result
7. PromptManager saved output

### Path B: Slash Commands

When users ran `/clavix:improve "prompt"` in Claude Code:

1. AI IDE loaded markdown template
2. Agent read instructions
3. Agent performed analysis manually (no TypeScript)
4. Agent saved files using Write tool
5. No TypeScript code executed

## The Problem

99% of Clavix usage was through slash commands (Path B), where the TypeScript intelligence layer never executed. The CLI commands were a parallel implementation that provided the same functionality but was rarely used.

This resulted in:
- ~18,500 lines of TypeScript that rarely executed
- ~15,000 lines of tests for unused code
- Maintenance burden of two parallel implementations
- Confusion about which path to use

## Resolution

Clavix v5.0.0 removed the CLI intelligence layer and transitioned to a pure markdown template delivery system. See the v5 architecture documentation for details.

## Statistics

| Component | Files | Lines |
|-----------|-------|-------|
| CLI Commands | 19 | ~5,800 |
| Intelligence Layer | 28 | ~7,790 |
| Core Managers | 12 | ~3,500 |
| Adapters | 22 | ~1,600 |
| Templates | 55 | ~10,744 |
| Tests | 139 | ~45,000 |

**Total TypeScript:** ~23,858 lines
**Total Markdown:** ~10,744 lines
