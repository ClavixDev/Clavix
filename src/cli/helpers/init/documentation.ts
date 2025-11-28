/**
 * Documentation generation and injection for Clavix initialization
 */

import * as path from 'path';
import { fileURLToPath } from 'url';
import { FileSystem } from '../../../utils/file-system.js';
import { DocInjector } from '../../../core/doc-injector.js';
import { CLAVIX_BLOCK_START, CLAVIX_BLOCK_END } from '../../../constants.js';
import type { AgentAdapter } from '../../../types/agent.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Extract the Clavix block content from a full document
 */
export function extractClavixBlock(content: string): string {
  const regex = new RegExp(`${CLAVIX_BLOCK_START}([\\s\\S]*?)${CLAVIX_BLOCK_END}`);
  const match = content.match(regex);
  return match ? match[1].trim() : content;
}

/**
 * Inject documentation blocks for an adapter
 */
export async function injectDocumentation(adapter: AgentAdapter): Promise<void> {
  // Inject AGENTS.md
  const agentsContent = DocInjector.getDefaultAgentsContent();
  await DocInjector.injectBlock('AGENTS.md', extractClavixBlock(agentsContent));

  // Inject CLAUDE.md if Claude Code selected
  if (adapter.name === 'claude-code') {
    const claudeContent = DocInjector.getDefaultClaudeContent();
    await DocInjector.injectBlock('CLAUDE.md', extractClavixBlock(claudeContent));
  }
}

/**
 * Generate the INSTRUCTIONS.md file content
 */
export function getInstructionsContent(): string {
  return `# Clavix Instructions

Welcome to Clavix! This directory contains your local Clavix configuration and data.

## Command Format

**Your command format depends on your AI tool:**

| Tool Type | Format | Example |
|-----------|--------|---------|
| **CLI tools** (Claude Code, Gemini, Qwen) | Colon (\`:\`) | \`/clavix:improve\` |
| **IDE extensions** (Cursor, Windsurf, Cline) | Hyphen (\`-\`) | \`/clavix-improve\` |

**Rule of thumb:** CLI tools use colon, IDE extensions use hyphen.

## Directory Structure

\`\`\`
.clavix/
├── config.json           # Your Clavix configuration
├── INSTRUCTIONS.md       # This file
├── instructions/         # Workflow instruction files for AI agents
├── outputs/
│   ├── <project-name>/  # Per-project outputs
│   │   ├── full-prd.md
│   │   ├── quick-prd.md
│   │   └── tasks.md
│   ├── prompts/         # Saved prompts for re-execution
│   └── archive/         # Archived completed projects
└── templates/           # Custom template overrides (optional)
\`\`\`

## Clavix Commands (v5)

### Setup Commands (CLI)

| Command | Purpose |
|---------|---------|
| \`clavix init\` | Initialize Clavix in a project |
| \`clavix update\` | Update templates after package update |
| \`clavix diagnose\` | Check installation health |
| \`clavix version\` | Show version |

### Workflow Commands (Slash Commands)

All workflows are executed via slash commands that AI agents read and follow:

| Slash Command | Purpose |
|---------------|---------|
| \`/clavix:improve\` | Optimize prompts (auto-selects depth) |
| \`/clavix:prd\` | Generate PRD through guided questions |
| \`/clavix:plan\` | Create task breakdown from PRD |
| \`/clavix:implement\` | Execute tasks or prompts (auto-detects source) |
| \`/clavix:start\` | Begin conversational session |
| \`/clavix:summarize\` | Extract requirements from conversation |
| \`/clavix:verify\` | Verify implementation |
| \`/clavix:archive\` | Archive completed projects |

**Note:** Running \`clavix init\` or \`clavix update\` will regenerate all slash commands from templates. Any manual edits to generated commands will be lost. If you need custom commands, create new command files instead of modifying generated ones.

**Command format varies by integration:**
- Claude Code, Gemini, Qwen: \`/clavix:improve\` (colon format)
- Cursor, Droid, Windsurf, etc.: \`/clavix-improve\` (hyphen format)

## Standard Workflow

**Clavix follows this progression:**

\`\`\`
PRD Creation → Task Planning → Implementation → Archive
\`\`\`

**Detailed steps:**

1. **Planning Phase**
   - Run: \`/clavix:prd\` or \`/clavix:start\` → \`/clavix:summarize\`
   - Output: \`.clavix/outputs/{project}/full-prd.md\` + \`quick-prd.md\`

2. **Task Preparation**
   - Run: \`/clavix:plan\` transforms PRD into curated task list
   - Output: \`.clavix/outputs/{project}/tasks.md\`

3. **Implementation Phase**
   - Run: \`/clavix:implement\`
   - Agent executes tasks systematically
   - Agent edits tasks.md directly to mark progress (\`- [ ]\` → \`- [x]\`)

4. **Completion**
   - Run: \`/clavix:archive\`
   - Archives completed work

**Key principle:** Planning workflows create documents. Implementation workflows write code.

## Prompt Lifecycle

1. **Optimize prompt**: \`/clavix:improve\` - Analyzes and improves your prompt
2. **Review**: Agent lists saved prompts from \`.clavix/outputs/prompts/\`
3. **Execute**: \`/clavix:implement --latest\` - Implement when ready
4. **Cleanup**: Agent deletes old prompt files from \`.clavix/outputs/prompts/\`

## When to Use Which Mode

- **Improve mode** (\`/clavix:improve\`): Smart prompt optimization with auto-depth selection
- **PRD mode** (\`/clavix:prd\`): Strategic planning with architecture and business impact
- **Conversational mode** (\`/clavix:start\` → \`/clavix:summarize\`): Natural discussion → extract structured requirements

## Customization

Create custom templates in \`.clavix/templates/\` to override defaults.

To reconfigure integrations, run \`clavix init\` again.

## Need Help?

- **Documentation**: https://github.com/ClavixDev/Clavix
- **Issues**: https://github.com/ClavixDev/Clavix/issues
- **Version**: Run \`clavix version\` to check your installed version
- **Update managed blocks**: Run \`clavix update\` to refresh documentation
`;
}

/**
 * Generate the INSTRUCTIONS.md file
 */
export async function generateInstructions(): Promise<void> {
  await FileSystem.writeFileAtomic('.clavix/INSTRUCTIONS.md', getInstructionsContent());
}

/**
 * Generate the QUICKSTART.md file
 */
export async function generateQuickstart(): Promise<void> {
  const quickstartPath = path.join(
    __dirname,
    '..',
    '..',
    '..',
    'templates',
    'instructions',
    'QUICKSTART.md'
  );
  try {
    const quickstartContent = await FileSystem.readFile(quickstartPath);
    await FileSystem.writeFileAtomic('.clavix/QUICKSTART.md', quickstartContent);
  } catch {
    // QUICKSTART.md template not found or write failed, skip silently
    // This can happen in test environments or custom installations
  }
}
