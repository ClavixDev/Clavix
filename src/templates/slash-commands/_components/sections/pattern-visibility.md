## Patterns Applied

Show which optimization patterns were applied and their effects.

### Compact Output Format

```
Patterns: [N] applied ([MODE] mode)
  [PATTERN1] → [ONE-LINE EFFECT]
  [PATTERN2] → [ONE-LINE EFFECT]
```

### Example Outputs

**Fast mode optimization:**
```
Patterns: 4 applied (fast mode)
  ConcisenessFilter → Removed 3 pleasantries, 2 filler phrases
  ObjectiveClarifier → Added clear objective statement
  StructureOrganizer → Reordered to context→requirements→output
  ActionabilityEnhancer → Replaced 2 vague terms with specifics
```

**Deep mode optimization:**
```
Patterns: 7 applied (deep mode)
  ConcisenessFilter → Removed 5 pleasantries
  ObjectiveClarifier → Added objective section
  StructureOrganizer → Reorganized into 4 sections
  TechnicalContextEnricher → Added React 18, TypeScript context
  CompletenessValidator → Flagged 3 missing requirements
  EdgeCaseIdentifier → Added 4 edge cases (auth, network, state, browser)
  ValidationChecklistCreator → Generated 6-item verification checklist
```

### Pattern Impact Indicators

| Impact | Meaning | Example |
|--------|---------|---------|
| HIGH | Significant structural changes | "Restructured into 5 sections" |
| MEDIUM | Moderate additions/clarifications | "Added 3 technical requirements" |
| LOW | Minor word-level improvements | "Replaced 1 vague term" |

### Available Patterns Reference

**Core Patterns (fast + deep):**
| Pattern | Priority | What It Does |
|---------|----------|--------------|
| ConcisenessFilter | 10 | Removes pleasantries, filler words, redundant phrases |
| ObjectiveClarifier | 9 | Adds clear objective/goal statement if missing |
| StructureOrganizer | 8 | Reorders into logical flow: context→requirements→constraints→output |
| ActionabilityEnhancer | 7 | Converts vague language to specific, actionable terms |
| TechnicalContextEnricher | 8 | Adds missing technical context (frameworks, tools, versions) |
| CompletenessValidator | 6 | Identifies and flags missing required elements |
| StepDecomposer | 7 | Breaks complex prompts into sequential steps |
| ContextPrecisionBooster | 8 | Adds precise context when missing |

**Deep Mode Exclusive Patterns:**
| Pattern | Priority | What It Does |
|---------|----------|--------------|
| AlternativePhrasingGenerator | 5 | Generates 2-3 alternative prompt structures |
| EdgeCaseIdentifier | 4 | Identifies domain-specific edge cases |
| ValidationChecklistCreator | 3 | Creates implementation verification checklist |
| AssumptionExplicitizer | 6 | Makes implicit assumptions explicit |
| ScopeDefiner | 5 | Adds explicit scope boundaries |
| PRDStructureEnforcer | 9 | Ensures PRD completeness (PRD mode only) |
| ErrorToleranceEnhancer | 5 | Adds error handling requirements |
| PrerequisiteIdentifier | 6 | Identifies prerequisites and dependencies |

**v4.1 Agent Transparency Patterns (both modes):**
| Pattern | Priority | What It Does |
|---------|----------|--------------|
| AmbiguityDetector | 9 | Identifies and flags ambiguous terms |
| OutputFormatEnforcer | 7 | Adds explicit output format specifications |
| SuccessCriteriaEnforcer | 6 | Adds measurable success criteria |
| DomainContextEnricher | 5 | Adds domain-specific best practices |

**v4.3.2 PRD Mode Patterns (deep mode):**
| Pattern | Priority | What It Does |
|---------|----------|--------------|
| RequirementPrioritizer | 7 | Separates must-have from nice-to-have requirements |
| UserPersonaEnricher | 6 | Adds missing user context and personas |
| SuccessMetricsEnforcer | 7 | Ensures measurable success criteria exist |
| DependencyIdentifier | 5 | Identifies technical and external dependencies |

**v4.3.2 Conversational Mode Patterns (deep mode):**
| Pattern | Priority | What It Does |
|---------|----------|--------------|
| ConversationSummarizer | 8 | Extracts structured requirements from messages |
| TopicCoherenceAnalyzer | 6 | Detects topic shifts and multi-topic conversations |
| ImplicitRequirementExtractor | 7 | Surfaces requirements mentioned indirectly |

### Pattern Selection Logic

Patterns are selected based on:
1. **Mode**: Fast mode gets core patterns only; deep mode gets all
2. **Intent**: Some patterns are intent-specific (e.g., PRDStructureEnforcer for prd-generation)
3. **Priority**: Higher priority patterns run first (10→1)
4. **Applicability**: Pattern checks if it can improve the prompt

### Why Patterns Were Skipped

In deep mode, show skipped patterns with reasons:

```
Skipped patterns:
  PRDStructureEnforcer - Intent is code-generation, not prd-generation
  StepDecomposer - Prompt already has clear sequential steps
```

### Pattern Categories Summary

```
Core (always available):
  ConcisenessFilter, ObjectiveClarifier, StructureOrganizer,
  ActionabilityEnhancer, TechnicalContextEnricher, CompletenessValidator

Both modes (fast & deep):
  StepDecomposer, ContextPrecisionBooster,
  AmbiguityDetector, OutputFormatEnforcer, SuccessCriteriaEnforcer,
  DomainContextEnricher

Deep mode only:
  AlternativePhrasingGenerator, EdgeCaseIdentifier, ValidationChecklistCreator,
  AssumptionExplicitizer, ScopeDefiner, PRDStructureEnforcer,
  ErrorToleranceEnhancer, PrerequisiteIdentifier

v4.3.2 PRD mode (deep):
  RequirementPrioritizer, UserPersonaEnricher, SuccessMetricsEnforcer,
  DependencyIdentifier

v4.3.2 Conversational mode (deep):
  ConversationSummarizer, TopicCoherenceAnalyzer, ImplicitRequirementExtractor
```

### Pattern Count by Mode

| Mode | Patterns Available | Typical Applied |
|------|-------------------|-----------------|
| Fast | 21 core patterns | 4-7 patterns |
| Deep | 27 total patterns | 8-14 patterns |
| PRD | 15 patterns | 10-15 patterns |
| Conversational | 11 patterns | 6-11 patterns |
