# Clavix
> Transform vague ideas into production-ready prompts. Analyze gaps, generate PRDs, and supercharge your AI coding workflow with the CLEAR framework.

## Table of contents
- [Why Clavix?](#why-clavix)
- [Why CLEAR?](#why-clear)
- [Providers](#providers)
- [Quickstart](#quickstart)
- [Full documentation](#full-documentation)

## Why Clavix?
Better prompts lead to better code. Clavix analyzes gaps, generates PRDs, and integrates with your AI tooling so you can move from idea to implementation quickly. Learn more in [docs/why-clavix.md](docs/why-clavix.md).

## Why CLEAR?
Clavix is built on CLEAR (Concise, Logical, Explicit, Adaptive, Reflective), an academically validated prompt engineering methodology. Read the full overview in [docs/clear-framework.md](docs/clear-framework.md).

## Providers

| Category | Providers |
| --- | --- |
| IDE & editor extensions | Cursor · Windsurf · Kilocode · Roocode · Cline |
| CLI agents | Claude Code · Droid CLI · CodeBuddy CLI · OpenCode · Gemini CLI · Qwen Code · Amp · Crush CLI · Codex CLI |
| Universal adapters | AGENTS.md · OCTO.md · WARP.md |

Provider paths and argument placeholders are listed in [docs/providers.md](docs/providers.md).

## Quickstart
```bash
npm install -g clavix
# or without a global install
npx clavix@latest init
```

Common commands:
```bash
clavix init
clavix fast "Create a login page"
clavix deep "Build an API for user management"
clavix prd
```

## Full documentation
- Overview & navigation: [docs/index.md](docs/index.md)
- Command reference: [docs/commands/](docs/commands/README.md)
- Providers: [docs/providers.md](docs/providers.md)
- CLEAR Framework: [docs/clear-framework.md](docs/clear-framework.md)
- Guides: [docs/guides/](docs/guides/workflows.md)

## Development
- Requires Node.js ≥ 18
- Run tests: `npm test`
- Lint: `npm run lint`
- Build: `npm run build`

## License
MIT
```
Create a login page
```

**Improved:**
```markdown
# Objective
Build a secure user authentication login page

# Requirements
- Email and password input fields with validation
- "Remember me" checkbox
- "Forgot password" link
- Show clear error messages for invalid credentials
- Responsive design for mobile and desktop

# Technical Constraints
- Use React with TypeScript
- Integrate with existing JWT authentication API
- Follow WCAG 2.1 AA accessibility standards
- Support password managers

# Expected Output
- Fully functional login component
- Unit tests with >80% coverage
- Integration with auth context

# Success Criteria
- Users can log in successfully
- Invalid credentials show appropriate errors
- Page is accessible via keyboard navigation
- Loads in < 2 seconds
```

### Example 2: Slash Command Usage

In Claude Code:

```
/clavix:fast Create a dashboard for analytics
```

Claude will:
1. Analyze your prompt
2. Check if deep analysis is needed (smart triage)
3. Identify gaps, ambiguities, and strengths
4. Show changes made summary
5. Generate a structured, improved prompt
6. Display it ready for immediate use

For comprehensive analysis:

```
/clavix:deep Create a dashboard for analytics
```

Provides all fast mode features plus alternative phrasings, edge cases, implementation examples, and more.

### Example 3: When to Use Which Mode

**Use Fast Mode when:**
- You have a simple, straightforward prompt
- You need quick cleanup and structure
- Time is a priority

**Use Deep Mode when:**
- Requirements are complex or ambiguous
- You want to explore alternative approaches
- You need to think through edge cases
- You're planning a significant feature

**Use PRD Mode when:**
- You need strategic planning
- Architecture decisions are required
- Business impact and scalability matter

## Requirements

- Node.js >= 18.0.0
- npm or yarn

## Development

```bash
# build dist
npm run build

# run tests
npm test

# lint / format
npm run lint
npm run format:check
```

## License

MIT

## Links

- [GitHub Repository](https://github.com/Bob5k/Clavix)
- [Issue Tracker](https://github.com/Bob5k/Clavix/issues)
- [Changelog](CHANGELOG.md)

---

## Star History

<a href="https://www.star-history.com/#Bob5k/Clavix&type=date&legend=top-left">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=Bob5k/Clavix&type=date&theme=dark&legend=top-left" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=Bob5k/Clavix&type=date&legend=top-left" />
   <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=Bob5k/Clavix&type=date&legend=top-left" />
 </picture>
</a>
