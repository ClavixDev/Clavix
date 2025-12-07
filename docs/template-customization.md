# Template Customization Guide

Want to customize Clavix commands for your workflow? Simply edit the generated template files directly in your integration's directory.

**The rule is simple:** After running `clavix init`, go to your integration's command directory and edit the template files directly. That's it.

---

## Where to Find Your Templates

After running `clavix init`, templates are generated in these locations:

### IDEs and Editor Extensions

| Integration | Format | Generated Location | Filename Pattern |
|-------------|--------|-------------------|------------------|
| **Cursor** | `-` | `.cursor/rules/` | `clavix-<command>.md` |
| **Windsurf** | `-` | `.windsurf/rules/` | `clavix-<command>.md` |
| **Kilocode** | `-` | `.kilocode/rules/` | `clavix-<command>.md` |
| **Roo-Code** | `-` | `.roo/rules/` | `clavix-<command>.md` |
| **Cline** | `-` | `.clinerules/` | `clavix-<command>.md` |

**Example paths for Cursor:**
```
.cursor/rules/clavix-improve.md
.cursor/rules/clavix-prd.md
.cursor/rules/clavix-plan.md
.cursor/rules/clavix-implement.md
.cursor/rules/clavix-start.md
.cursor/rules/clavix-summarize.md
.cursor/rules/clavix-refine.md
.cursor/rules/clavix-verify.md
.cursor/rules/clavix-archive.md
```

### CLI Agents and Toolchains

| Integration | Format | Generated Location | Filename Pattern |
|-------------|--------|-------------------|------------------|
| **Claude Code** | `:` | `.claude/commands/clavix/` | `<command>.md` |
| **Droid (Factory AI)** | `-` | `.factory/commands/` | `clavix-<command>.md` |
| **CodeBuddy** | `-` | `.codebuddy/rules/` | `clavix-<command>.md` |
| **OpenCode** | `-` | `.opencode/command/` | `clavix-<command>.md` |
| **Gemini CLI** | `:` | `.gemini/commands/clavix/` | `<command>.toml` |
| **Qwen CLI** | `:` | `.qwen/commands/clavix/` | `<command>.toml` |
| **LLXPRT** | `:` | `.llxprt/commands/clavix/` | `<command>.toml` |
| **Amp** | `-` | `.agents/commands/` | `clavix-<command>.md` |
| **Crush** | `-` | `.crush/commands/` | `clavix-<command>.md` |
| **Codex CLI** | `-` | `~/.codex/prompts/` (global) | `clavix-<command>.md` |
| **Augment Code** | `-` | `.augment/rules/` | `clavix-<command>.md` |

**Example paths for Claude Code:**
```
.claude/commands/clavix/improve.md
.claude/commands/clavix/prd.md
.claude/commands/clavix/plan.md
.claude/commands/clavix/implement.md
.claude/commands/clavix/start.md
.claude/commands/clavix/summarize.md
.claude/commands/clavix/refine.md
.claude/commands/clavix/verify.md
.claude/commands/clavix/archive.md
```

**Example paths for Gemini CLI (TOML format):**
```
.gemini/commands/clavix/improve.toml
.gemini/commands/clavix/prd.toml
.gemini/commands/clavix/plan.toml
.gemini/commands/clavix/implement.toml
.gemini/commands/clavix/start.toml
.gemini/commands/clavix/summarize.toml
.gemini/commands/clavix/refine.toml
.gemini/commands/clavix/verify.toml
.gemini/commands/clavix/archive.toml
```

### Universal Adapters

| Integration | Generated Location | Purpose |
|-------------|-------------------|---------|
| **AGENTS.md** | `AGENTS.md` | Universal agent guidance (always enabled) |
| **GitHub Copilot** | `.github/copilot-instructions.md` | Copilot custom instructions |
| **OCTO.md** | `OCTO.md` | Octofriend markdown interface |
| **WARP.md** | `WARP.md` | Warp AI quick-start guidance |

---

## How to Customize

### Step 1: Find Your Template File

Go to your integration's command directory and open the template file you want to customize:

```bash
# For Cursor
code .cursor/rules/clavix-improve.md

# For Claude Code  
code .claude/commands/clavix/improve.md

# For Gemini
code .gemini/commands/clavix/improve.toml
```

### Step 2: Edit the Template

Add your custom instructions directly in the file. Examples:

**Add team-specific context:**
```markdown
## Our Tech Stack
- Framework: Next.js 14 with App Router
- Styling: Tailwind CSS + shadcn/ui
- Database: Prisma + PostgreSQL
- Always use TypeScript strict mode
```

**Add custom rules:**
```markdown
## Project-Specific Rules
- All components must be in src/components/
- Use Zod for all validation schemas
- Write tests alongside implementation files
```

### Step 3: Save and Test

Save the file and test the command in your AI tool. Your changes take effect immediately - no build or regeneration needed.

---

## Common Customizations

### Add Project Context

Edit any command template (e.g., `.cursor/rules/clavix-prd.md`) and add:

```markdown
## Our Project Context

**Tech Stack:** Next.js 14, TypeScript, Tailwind, Prisma
**Deployment:** Vercel  
**Target Audience:** B2B SaaS
**Performance:** < 2s page load, 99.9% uptime
```

### Add Security Requirements

Edit `.cursor/rules/clavix-implement.md` and add:

```markdown
## Security Checklist

Before implementing:
- [ ] Input validation with Zod
- [ ] SQL injection prevention  
- [ ] XSS protection
- [ ] Auth/authorization
```

### Add Team Conventions

Edit `.cursor/rules/clavix-plan.md` and add:

```markdown
## Team Conventions

- All components in src/components/
- Tests alongside implementation
- Use shadcn/ui components
- Zod for validation
```

---

## Important Notes

- **Edits are persistent** - Your changes survive `clavix update` (it won't overwrite your modified templates)
- **Version control recommended** - Commit your edited templates to git
- **No regeneration needed** - Changes take effect immediately when you edit the files
- **Want to modify canonical templates?** - Fork the Clavix repo and work on the source

---

**Questions?** Open an issue at https://github.com/ClavixDev/Clavix/issues
