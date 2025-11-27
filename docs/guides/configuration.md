# Configuration guide

Clavix stores project-level settings in `.clavix/config.json`. The file is created by `clavix init` and updated whenever you change preferences or rerun initialization.

## Schema

```json5
{
  "version": "3.5.0",
  "integrations": ["claude-code", "cursor"],
  "templates": {
    "prdQuestions": "default",
    "fullPrd": "default",
    "quickPrd": "default"
  },
  "outputs": {
    "path": ".clavix/outputs",
    "format": "markdown"
  },
  "preferences": {
    "autoOpenOutputs": false,
    "verboseLogging": false,
    "preserveSessions": true
  },
  "intelligence": {
    "defaultMode": "fast",
    "verbosePatternLogs": false,
    "patterns": {
      "disabled": [],
      "priorityOverrides": {},
      "customSettings": {}
    }
  },
  "experimental": {}
}
```

- **version** – Configuration schema version. Clavix migrates legacy configs automatically.
- **integrations** – The adapters selected during initialization. `clavix update` regenerates commands for every integration in this list.
- **templates** – Which template pack to use for PRD questions, full PRD output, and quick PRD output.
- **outputs** – Target directory and format (`markdown` or `pdf`) for generated documents.
- **preferences** – Behavioral toggles used across commands.
- **intelligence** – (v4.4+) Clavix Intelligence™ pattern configuration. See below.
- **experimental** – Reserved for feature previews; safe to omit.

## Intelligence Configuration (v4.4+)

The `intelligence` section lets you customize how Clavix Intelligence™ patterns behave:

```json5
{
  "intelligence": {
    // Default optimization mode: "fast" or "deep"
    "defaultMode": "fast",

    // Enable verbose pattern logging for debugging
    "verbosePatternLogs": false,

    "patterns": {
      // Disable specific patterns by ID
      "disabled": ["conciseness-filter", "alternative-phrasing-generator"],

      // Override pattern priorities (1-10, higher = runs first)
      "priorityOverrides": {
        "technical-context-enricher": 10,
        "step-decomposer": 5
      },

      // Pass custom settings to patterns
      "customSettings": {
        "edge-case-identifier": {
          "maxEdgeCases": 5
        }
      }
    }
  }
}
```

### Available Pattern IDs

**Core Patterns (fast & deep):**
- `conciseness-filter` - Remove verbosity
- `objective-clarifier` - Add clarity
- `technical-context-enricher` - Add technical details
- `structure-organizer` - Reorder logically
- `completeness-validator` - Check missing elements
- `actionability-enhancer` - Vague to specific

**Deep Mode Patterns:**
- `alternative-phrasing-generator` - Generate alternatives
- `edge-case-identifier` - Identify edge cases
- `validation-checklist-creator` - Create checklists
- `assumption-explicitizer` - Make assumptions explicit
- `scope-definer` - Add scope boundaries
- `prd-structure-enforcer` - Ensure PRD completeness

**Both Mode Patterns:**
- `step-decomposer` - Break complex prompts into steps
- `context-precision` - Add precise context
- `ambiguity-detector` - Identify ambiguous terms
- `output-format-enforcer` - Add output format specs
- `success-criteria-enforcer` - Add success criteria
- `error-tolerance-enhancer` - Add error handling
- `prerequisite-identifier` - Identify prerequisites
- `domain-context-enricher` - Add domain best practices

**PRD Patterns:**
- `requirement-prioritizer` - Separate must-have from nice-to-have
- `user-persona-enricher` - Add user context
- `success-metrics-enforcer` - Ensure measurable metrics
- `dependency-identifier` - Identify dependencies

**Conversational Patterns:**
- `conversation-summarizer` - Extract structured requirements
- `topic-coherence-analyzer` - Detect topic shifts
- `implicit-requirement-extractor` - Surface implicit requirements

## Managing configuration

Use `clavix init` to reconfigure your project:

- Run `clavix init` in an existing project to reconfigure integrations
- Choose "Reconfigure integrations" to change which AI tools are supported
- Choose "Update existing" to regenerate all command files

Configuration is stored in `.clavix/config.json` and can be edited manually if needed. After manual edits, run `clavix update` to regenerate commands.

## Legacy migration

Versions prior to 1.4.0 stored a single `agent` string instead of the `providers` array. When Clavix detects the legacy format it upgrades the file automatically, keeping your preferences and template overrides intact.

## Related documentation

- [Command reference](../commands/README.md)
- [Template customization](templates.md)
- [Workflow guide](workflows.md)
