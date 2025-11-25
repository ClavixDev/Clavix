## Intent Types Reference

Clavix Intelligence™ detects 10 primary intent types. This reference is synchronized with `src/core/intelligence/types.ts`.

### Intent Categories

| Intent | Description | Key Indicators |
|--------|-------------|----------------|
| **code-generation** | Writing new code or functions | "create", "build", "implement", "write" |
| **planning** | Designing architecture or breaking down tasks | "design", "architect", "plan", "structure" |
| **refinement** | Improving existing code or prompts | "improve", "refactor", "optimize", "enhance" |
| **debugging** | Finding and fixing issues | "fix", "debug", "error", "issue", "bug" |
| **documentation** | Creating docs or explanations | "document", "explain", "describe", "readme" |
| **prd-generation** | Creating requirements documents | "PRD", "requirements", "specification", "feature spec" |
| **testing** | Writing tests, improving test coverage | "test", "coverage", "spec", "unit test", "integration" |
| **migration** | Version upgrades, porting code | "migrate", "upgrade", "port", "convert", "transition" |
| **security-review** | Security audits, vulnerability checks | "security", "audit", "vulnerability", "OWASP", "CVE" |
| **learning** | Conceptual understanding, tutorials | "explain", "how does", "tutorial", "understand" |

### Intent Detection Confidence Levels

| Confidence | Meaning | Agent Behavior |
|------------|---------|----------------|
| 85%+ | High confidence | Proceed with detected intent |
| 70-84% | Moderate | Show primary + secondary intent |
| 50-69% | Low | Ask user to confirm |
| <50% | Uncertain | Present options, ask for clarification |

### Intent-Specific Patterns

Different intents enable different optimization patterns:

- **code-generation**: All core patterns + ErrorToleranceEnhancer
- **planning**: StructureOrganizer, ScopeDefiner, PrerequisiteIdentifier
- **debugging**: ErrorToleranceEnhancer, EdgeCaseIdentifier
- **testing**: ValidationChecklistCreator, EdgeCaseIdentifier
- **prd-generation**: PRDStructureEnforcer, CompletenessValidator
