# Clavix Roadmap

## Completed Features ✅

### Core CLI
- [x] Global CLI tool installation (`npm install -g clavix`)
- [x] Project initialization (`clavix init`)
- [x] Version and help commands
- [x] Configuration management (`clavix config`)
- [x] Update system for managed blocks (`clavix update`)
- [x] List and show commands for sessions/outputs

### Prompt Improvement
- [x] Fast mode - quick improvements with smart triage
- [x] Deep mode - comprehensive analysis with alternatives, edge cases, examples
- [x] Smart triage (recommends deep mode for complex prompts)
- [x] Gap and ambiguity detection
- [x] Changes summary (educational feedback)

### PRD Generation
- [x] Guided Socratic questioning workflow (`clavix prd`)
- [x] Full PRD generation (comprehensive markdown)
- [x] Quick PRD generation (AI-optimized)
- [x] Custom template system (Handlebars)

### Conversational Mode
- [x] Interactive conversation mode (`clavix start`)
- [x] Session tracking and management
- [x] Conversation analysis (`clavix summarize`)
- [x] Mini-PRD extraction from conversations
- [x] Optimized prompt generation

### Claude Code Integration
- [x] Slash commands generation (`.claude/commands/`)
- [x] Managed documentation blocks (AGENTS.md, CLAUDE.md)
- [x] Auto-injection and update system
- [x] Template-based command generation

### Templates & Customization
- [x] Customizable templates in `.clavix/templates/`
- [x] Template override mechanism
- [x] Handlebars template engine

## Planned Features 🚀

### Agent Integrations
- [ ] Droid CLI integration
- [ ] Generic agent adapter

### Workflow Enhancements
- [ ] Project-specific prompt patterns

---

**Note:** Clavix is a focused CLI tool for local prompt improvement. This roadmap reflects realistic, high-value features that align with our core mission: making developers better at communicating with AI agents.
