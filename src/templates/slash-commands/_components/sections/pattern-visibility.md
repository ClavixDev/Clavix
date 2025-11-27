## Patterns Applied

Show which optimization patterns were applied and their effects.

### Compact Output Format

```
Patterns: [N] applied ([DEPTH] depth)
  [PATTERN1] → [ONE-LINE EFFECT]
  [PATTERN2] → [ONE-LINE EFFECT]
```

### Example Outputs

**Standard depth optimization:**
```
Patterns: 4 applied (standard depth)
  ConcisenessFilter → Removed 3 pleasantries, 2 filler phrases
  ObjectiveClarifier → Added clear objective statement
  StructureOrganizer → Reordered to context→requirements→output
  ActionabilityEnhancer → Replaced 2 vague terms with specifics
```

**Comprehensive depth optimization:**
```
Patterns: 7 applied (comprehensive depth)
  ConcisenessFilter → Removed 5 pleasantries
  ObjectiveClarifier → Added objective section
  StructureOrganizer → Reorganized into 4 sections
  TechnicalContextEnricher → Added React 18, TypeScript context
  CompletenessValidator → Flagged 3 missing requirements
  DomainContextEnricher → Added best practices for React components
  SuccessCriteriaEnforcer → Added measurable acceptance criteria
```

### Pattern Impact Indicators

| Impact | Meaning | Example |
|--------|---------|---------|
| HIGH | Significant structural changes | "Restructured into 5 sections" |
| MEDIUM | Moderate additions/clarifications | "Added 3 technical requirements" |
| LOW | Minor word-level improvements | "Replaced 1 vague term" |

### Available Patterns Reference

**v4.12: Core Patterns (standard + comprehensive, scope='both'):**
| Pattern | Priority | What It Does |
|---------|----------|--------------|
| ObjectiveClarifier | 9 | Adds clear objective/goal statement if missing |
| AmbiguityDetector | 9 | Identifies and flags ambiguous terms |
| StructureOrganizer | 8 | Reorders into logical flow: context→requirements→constraints→output |
| OutputFormatEnforcer | 7 | Adds explicit output format specifications |
| SuccessCriteriaEnforcer | 7 | Adds measurable success criteria |
| ContextPrecisionBooster | 6 | Adds precise context when missing |
| CompletenessValidator | 6 | Identifies and flags missing required elements |
| TechnicalContextEnricher | 5 | Adds missing technical context (frameworks, tools, versions) |
| StepDecomposer | 5 | Breaks complex prompts into sequential steps |
| DomainContextEnricher | 5 | Adds domain-specific best practices |
| ConcisenessFilter | 4 | Removes pleasantries, filler words, redundant phrases |
| ActionabilityEnhancer | 4 | Converts vague language to specific, actionable terms |

**v4.12 PRD Mode Patterns (comprehensive only):**
| Pattern | Priority | What It Does |
|---------|----------|--------------|
| PRDStructureEnforcer | 9 | Ensures PRD completeness (PRD mode only) |
| RequirementPrioritizer | 7 | Separates must-have from nice-to-have requirements |
| SuccessMetricsEnforcer | 7 | Ensures measurable success criteria exist |
| UserPersonaEnricher | 6 | Adds missing user context and personas |
| DependencyIdentifier | 5 | Identifies technical and external dependencies |

**v4.12 Conversational Mode Patterns (comprehensive only):**
| Pattern | Priority | What It Does |
|---------|----------|--------------|
| ConversationSummarizer | 8 | Extracts structured requirements from messages |
| TopicCoherenceAnalyzer | 6 | Detects topic shifts and multi-topic conversations |
| ImplicitRequirementExtractor | 5 | Surfaces requirements mentioned indirectly |

### Pattern Selection Logic

Patterns are selected based on:
1. **Depth**: Standard gets core patterns; comprehensive gets all
2. **Intent**: Some patterns are intent-specific (e.g., PRDStructureEnforcer for prd-generation)
3. **Priority**: Higher priority patterns run first (10→1)
4. **Applicability**: Pattern checks if it can improve the prompt

### Why Patterns Were Skipped

In comprehensive depth, show skipped patterns with reasons:

```
Skipped patterns:
  PRDStructureEnforcer - Intent is code-generation, not prd-generation
  StepDecomposer - Prompt already has clear sequential steps
```

### Pattern Categories Summary

```
v4.12: Core patterns (standard + comprehensive, 12 patterns):
  ObjectiveClarifier, AmbiguityDetector, StructureOrganizer,
  OutputFormatEnforcer, SuccessCriteriaEnforcer, ContextPrecisionBooster,
  CompletenessValidator, TechnicalContextEnricher, StepDecomposer,
  DomainContextEnricher, ConcisenessFilter, ActionabilityEnhancer

PRD mode (comprehensive only, 5 patterns):
  PRDStructureEnforcer, RequirementPrioritizer, SuccessMetricsEnforcer,
  UserPersonaEnricher, DependencyIdentifier

Conversational mode (comprehensive only, 3 patterns):
  ConversationSummarizer, TopicCoherenceAnalyzer, ImplicitRequirementExtractor
```

### Pattern Count by Depth

| Depth | Patterns Available | Typical Applied |
|------|-------------------|-----------------|
| Standard | 12 patterns | 4-8 patterns |
| Comprehensive | 20 patterns | 8-15 patterns |
| PRD mode | 17 patterns | 8-12 patterns |
| Conversational | 15 patterns | 6-10 patterns |

**Note:** v4.12 has 20 total patterns after removing 7 boilerplate patterns that generated static output. Pattern selection varies by intent - some patterns only apply to specific intents (e.g., PRDStructureEnforcer only for prd-generation). Standard depth gets 12 core patterns; comprehensive adds mode-specific patterns.
