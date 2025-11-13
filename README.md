# Clavix

> AI prompt improvement and PRD generation CLI tool for developers

Clavix helps developers create better prompts and structured Product Requirements Documents (PRDs) for AI-assisted development tools like Claude Code. Through Socratic questioning and rule-based analysis, Clavix ensures your requirements are clear, complete, and actionable.

## Why Clavix?

AI-assisted development tools produce better code when given better prompts. However, developers often struggle to write comprehensive, structured prompts that clearly communicate requirements, constraints, and success criteria. Clavix solves this by:

- **Analyzing prompts** to identify gaps, ambiguities, and missing details
- **Generating structured PRDs** through guided Socratic questioning
- **Integrating seamlessly** with your AI development workflow
- **Working offline** - no API calls, fully local operation

## Features

### Phase 1 (MVP) ✅ Complete

- ✅ **Global CLI tool** - Install once, use everywhere
- ✅ **Prompt improvement** - Analyze and enhance prompts directly
- ✅ **Claude Code integration** - Slash commands in your AI agent
- ✅ **Managed documentation** - Auto-inject into AGENTS.md and CLAUDE.md
- ✅ **Template system** - Customizable templates for your workflow

### Phase 2 (Core Workflows) ✅ Complete

- ✅ **PRD generation** - Guided Socratic questioning workflow
- ✅ **Conversational mode** - Iterative prompt development
- ✅ **Session management** - Track and organize conversations
- ✅ **Analysis tools** - Extract optimized prompts from conversations
- ✅ **Additional commands** - list, show, config, update

## Installation

```bash
npm install -g clavix
```

## Quick Start

### 1. Initialize in Your Project

```bash
cd your-project
clavix init
```

This will:
- Create `.clavix/` directory with configuration
- Generate slash commands for your AI agent
- Inject managed blocks into AGENTS.md and CLAUDE.md

### 2. Improve a Prompt

**Fast mode** (quick improvements):
```bash
clavix fast "Create a login page"
```

**Deep mode** (comprehensive analysis):
```bash
clavix deep "Create a login page"
```

Output:
- Analysis of gaps and ambiguities
- Structured prompt with clear sections
- Changes made summary
- Smart triage recommendations (fast mode)
- Alternative phrasings, edge cases, examples (deep mode)

### 3. Use Slash Commands (Claude Code)

After initialization, use these commands in Claude Code:

- `/clavix:fast [prompt]` - Quick prompt improvements
- `/clavix:deep [prompt]` - Comprehensive prompt analysis
- `/clavix:prd` - Generate a PRD
- `/clavix:start` - Start conversational mode
- `/clavix:summarize` - Analyze conversation

## Commands

### `clavix init`

Initialize Clavix in the current project.

```bash
clavix init
```

Interactive prompts guide you through:
- Agent selection (Claude Code, more coming soon)
- Directory structure creation
- Slash command generation
- Documentation injection

### `clavix fast <prompt>`

Quick prompt improvements with smart triage.

```bash
clavix fast "Build an API for user management"
```

**Features:**
- Fast analysis of gaps, ambiguities, strengths
- Smart triage: recommends deep mode for complex prompts
- "Already good" assessment for quality prompts
- Changes made summary (educational)
- Single structured improved prompt

**Smart triage checks:**
- Prompts < 20 characters
- Missing 3+ critical elements
- Vague scope words without context

### `clavix deep <prompt>`

Comprehensive prompt analysis.

```bash
clavix deep "Build an API for user management"
```

**Everything from fast mode PLUS:**
- Alternative phrasings of requirements
- Edge cases in requirements
- Good/bad implementation examples
- Multiple prompt structuring approaches
- "What could go wrong" analysis
- More thorough clarifying questions

**Output:**
- Structured prompt with sections:
  - Objective
  - Requirements
  - Technical Constraints
  - Expected Output
  - Success Criteria
  - Plus all deep mode analysis sections

### `clavix prd`

Generate a comprehensive PRD through guided Socratic questioning.

```bash
clavix prd
```

Creates two files:
- `full-prd.md` - Comprehensive document for team alignment
- `quick-prd.md` - Condensed version for AI consumption

### `clavix start`

Enter conversational mode for iterative requirement gathering.

```bash
clavix start
```

Start a natural conversation to develop requirements. Use `/clavix:summarize` later to extract structured output.

### `clavix summarize [session-id]`

Analyze a conversation and extract requirements.

```bash
# Summarize current session
clavix summarize

# Summarize specific session
clavix summarize abc-123-def
```

Generates:
- `mini-prd.md` - Concise requirements
- `optimized-prompt.md` - AI-ready prompt

### `clavix list`

List all sessions and outputs.

```bash
# List everything
clavix list

# List only sessions
clavix list --sessions

# Filter by project
clavix list --project auth
```

### `clavix show [session-id]`

Show detailed session information.

```bash
# Show most recent session
clavix show

# Show specific session with full history
clavix show abc-123-def --full

# Show output directory
clavix show --output project-name
```

### `clavix config`

Manage configuration.

```bash
# Interactive menu
clavix config

# Get/set values
clavix config get agent
clavix config set preferences.verboseLogging true
```

### `clavix update`

Update managed blocks and slash commands.

```bash
# Update everything
clavix update

# Update specific components
clavix update --docs-only
clavix update --commands-only
```

### `clavix version`

Display the current version of Clavix.

```bash
clavix version
```

### `clavix --help`

Display help information for all commands.

```bash
clavix --help
clavix fast --help
clavix deep --help
```

## Project Structure

After initialization, your project will have:

```
your-project/
├── .clavix/
│   ├── config.json         # Clavix configuration
│   ├── INSTRUCTIONS.md     # Usage guide
│   ├── sessions/           # Conversational mode sessions
│   ├── outputs/            # Generated PRDs and prompts
│   └── templates/          # Custom templates (optional)
├── AGENTS.md               # Updated with Clavix block
├── CLAUDE.md               # Updated with Clavix block (if Claude Code)
└── .claude/commands/       # Generated slash commands (if Claude Code)
    ├── clavix:fast.md
    ├── clavix:deep.md
    ├── clavix:prd.md
    ├── clavix:start.md
    └── clavix:summarize.md
```

## Configuration

Clavix stores configuration in `.clavix/config.json`:

```json5
{
  version: "1.0.0",
  agent: "claude-code",
  templates: {
    prdQuestions: "default",
    fullPrd: "default",
    quickPrd: "default"
  },
  outputs: {
    path: ".clavix/outputs",
    format: "markdown"
  },
  preferences: {
    autoOpenOutputs: false,
    verboseLogging: false,
    preserveSessions: true
  }
}
```

## Customization

### Custom Templates

Override default templates by adding files to `.clavix/templates/`:

- `prd-questions.md` - Custom PRD questions
- `full-prd-template.hbs` - Full PRD format
- `quick-prd-template.hbs` - Quick PRD format

Templates use Handlebars syntax.

## Examples

### Example 1: Minimal to Comprehensive

**Original:**
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

## Roadmap

See [ROADMAP.md](ROADMAP.md) for detailed feature status and planned enhancements.

## Requirements

- Node.js >= 18.0.0
- npm or yarn

## License

MIT

## Links

- [GitHub Repository](https://github.com/Bob5k/Clavix)
- [Issue Tracker](https://github.com/Bob5k/Clavix/issues)
- [Changelog](CHANGELOG.md)

---

**Made for vibecoders, by vibecoders** 🚀
