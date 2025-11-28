# Contributing to Clavix

Thank you for your interest in contributing to Clavix! Before you start, please read this guide carefully - especially the architecture principles section.

## Critical Architecture Principle: Agentic-First

**Clavix is an agentic-first tool. This is non-negotiable.**

### What This Means

Slash commands (`/clavix:improve`, `/clavix:prd`, etc.) are **markdown templates** that AI agents read and execute. They are NOT TypeScript code that runs when invoked.

```
User invokes: /clavix:improve "my prompt"
     ↓
AI agent reads: .claude/commands/clavix/improve.md
     ↓
Agent follows instructions using native tools (Write, Edit, Bash)
     ↓
Result: Optimized prompt saved to .clavix/outputs/
```

### Why This Architecture?

1. **Agents are the runtime** - Claude, Cursor, Gemini, etc. execute the workflows
2. **Templates are the product** - The markdown instructions ARE what we ship
3. **No code execution** - Clavix CLI only sets up the environment (init, update)
4. **Flexibility** - Updating workflows = updating markdown, no recompilation

### What You CANNOT Do

| Don't Do This | Why It Won't Work |
|---------------|-------------------|
| Add TypeScript to "improve" quality scoring | Agents read markdown, not compiled JS |
| Build session storage for conversations | Agents handle their own context |
| Add validation code for agent outputs | Agents execute; we can't intercept |
| Create runtime hooks for slash commands | Slash commands aren't executed by CLI |
| Add programmatic guardrails | Agents follow instructions, not code |

### What You CAN Do

| Do This | Why It Works |
|---------|--------------|
| Improve template instructions | Agents read better instructions |
| Add new slash command templates | Agents can use new commands |
| Enhance CLI setup commands | init/update/diagnose run via CLI |
| Improve adapter configurations | Affects how templates are generated |
| Update documentation | Helps users and contributors |
| Add new adapter integrations | More tools can use Clavix templates |

### The Four CLI Commands

These are the ONLY TypeScript-executed commands:

| Command | Purpose | Runs TypeScript? |
|---------|---------|------------------|
| `clavix init` | Setup environment, generate templates | Yes |
| `clavix update` | Regenerate templates after updates | Yes |
| `clavix diagnose` | Check installation health | Yes |
| `clavix version` | Show version | Yes |

Everything else (`/clavix:improve`, `/clavix:prd`, `/clavix:plan`, etc.) = **agent-executed templates**.

### Before Proposing Changes

Ask yourself:
- "Will this change affect what agents READ?" → Template change
- "Will this change affect CLI setup?" → TypeScript change
- "Am I trying to add runtime logic to slash commands?" → **STOP** - this won't work

---

## Contributing Guidelines

### Where to Make Changes

| Change Type | Location |
|-------------|----------|
| Template changes | `src/templates/slash-commands/_canonical/` |
| Component changes | `src/templates/slash-commands/_components/` |
| CLI changes | `src/cli/commands/` |
| Adapter changes | `src/core/adapter-registry.ts` or `src/core/adapters/` |
| Documentation | `docs/` |
| Type definitions | `src/types/` |

### Project Structure

```
src/
├── cli/commands/     # CLI commands (init, update, diagnose, version)
├── core/
│   ├── adapters/    # Adapter implementations
│   ├── adapter-registry.ts  # Config-driven adapter registry
│   ├── agent-manager.ts     # Adapter factory
│   ├── template-assembler.ts # Template {{INCLUDE:}} processing
│   ├── command-transformer.ts # /clavix:cmd → /clavix-cmd
│   └── doc-injector.ts      # Managed block injection
├── templates/        # Slash command templates (THE PRODUCT)
│   ├── slash-commands/
│   │   ├── _canonical/     # Source templates (improve.md, prd.md, etc.)
│   │   └── _components/    # Reusable template components
│   ├── instructions/       # Workflow instruction guides
│   └── agents/             # Universal agent documentation
├── types/            # TypeScript type definitions
└── utils/            # Utility functions
```

---

## Development Setup

### Prerequisites

- Node.js >= 18.0.0
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/clavix.git
cd clavix

# Install dependencies
npm install

# Build the project
npm run build

# Link for local testing
npm link
```

### Local Development

```bash
# Watch mode (rebuild on changes)
npm run build -- --watch

# Test your changes
cd /path/to/test/project
clavix init
```

---

## Testing

### Running Tests

```bash
npm test                      # Run all tests
npm test -- --coverage        # With coverage report
npm run test:changed          # Only changed files
npm run validate:consistency  # Template consistency checks
```

### Test Categories

| Directory | Purpose |
|-----------|---------|
| `tests/core/` | Core functionality (adapters, template assembly) |
| `tests/adapters/` | Adapter implementations |
| `tests/cli/` | CLI commands |
| `tests/consistency/` | Template/CLI parity |
| `tests/integration/` | Multi-component workflows |
| `tests/edge-cases/` | Error handling and boundaries |

### Coverage Requirements

- Lines: 70%+
- Statements: 70%+
- Functions: 70%+
- Branches: 60%+ (lower due to CLI interactivity)

---

## Code Style

### Linting & Formatting

```bash
npm run lint          # Check for issues
npm run lint -- --fix # Auto-fix issues
npm run format        # Format with Prettier
```

### TypeScript Guidelines

- **No `any` types** - Use `unknown` with type guards
- **Strict mode enabled** - All strict checks active
- **Explicit return types** - For public functions
- **Use custom error types** - `ClavixError`, `PermissionError`, etc.

---

## Pull Request Process

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Make** changes following the architecture principles above
4. **Test** your changes (`npm test`)
5. **Lint** your code (`npm run lint`)
6. **Commit** with a descriptive message
7. **Push** and open a PR

### PR Checklist

- [ ] Tests pass (`npm test`)
- [ ] Linting passes (`npm run lint`)
- [ ] Changes follow agentic-first principles
- [ ] Documentation updated if needed
- [ ] CHANGELOG.md updated for user-facing changes
- [ ] No TypeScript added for slash command "logic"

### Commit Message Format

```
type(scope): brief description

- Detail 1
- Detail 2

Fixes #123
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

---

## Adding New Adapters

To add support for a new AI tool:

### Simple Adapter (Config-Driven)

Add to `ADAPTER_CONFIGS` in `src/core/adapter-registry.ts`:

```typescript
{
  name: 'newtool',
  displayName: 'New Tool',
  directory: '.newtool/rules',
  fileExtension: '.md',
  filenamePattern: 'clavix-{name}',
  features: { ...DEFAULT_MD_FEATURES },
  detection: { type: 'directory', path: '.newtool' },
}
```

### Special Adapter (Custom Logic)

If the tool needs special handling (TOML format, doc injection, etc.):

1. Create `src/core/adapters/newtool-adapter.ts`
2. Extend `BaseAdapter` or `TomlFormattingAdapter`
3. Register in `AgentManager` constructor
4. Add tests in `tests/adapters/`

---

## Questions?

- Open an issue for questions
- Check existing issues before creating new ones
- For major changes, open a discussion first

---

## License

By contributing, you agree that your contributions will be licensed under the Apache-2.0 License.
