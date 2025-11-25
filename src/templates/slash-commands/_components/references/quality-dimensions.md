## Quality Dimensions Reference

Clavix Intelligence™ assesses prompts across 6 quality dimensions. This reference is synchronized with `src/core/intelligence/types.ts`.

### The 6 Quality Dimensions

| Dimension | What It Measures | Low Score Indicators |
|-----------|------------------|---------------------|
| **Clarity** | Is the objective clear and unambiguous? | Vague goals, ambiguous terms, unclear scope |
| **Efficiency** | Is the prompt concise without losing critical info? | Filler words, pleasantries, redundant phrases |
| **Structure** | Is information organized logically? | No clear sections, random order, missing flow |
| **Completeness** | Are all necessary details provided? | Missing context, no constraints, no success criteria |
| **Actionability** | Can AI take immediate action on this prompt? | Too abstract, needs clarification, missing specifics |
| **Specificity** | How concrete and precise is the prompt? | Vague terms, no versions/paths/identifiers |

### Quality Score Thresholds

| Score Range | Rating | Recommendation |
|-------------|--------|----------------|
| 80-100% | excellent | Ready to execute |
| 65-79% | good | Minor improvements suggested |
| 50-64% | needs-improvement | Consider deep mode |
| 0-49% | poor | Deep mode strongly recommended |

### Dimension Weights

For overall quality calculation:

| Dimension | Weight | Rationale |
|-----------|--------|-----------|
| Clarity | 20% | Foundation for understanding |
| Efficiency | 10% | Reduces token usage |
| Structure | 15% | Enables systematic processing |
| Completeness | 25% | Most critical for good output |
| Actionability | 20% | Enables immediate execution |
| Specificity | 10% | Reduces ambiguity |

### Critical Dimensions

If any of these dimensions score below 50%, strongly recommend deep mode:
- **Clarity** (can't understand the goal)
- **Completeness** (missing essential information)
- **Actionability** (can't start without more info)

### Improvement Patterns by Dimension

| Dimension | Primary Patterns |
|-----------|-----------------|
| Clarity | ObjectiveClarifier, AmbiguityDetector |
| Efficiency | ConcisenessFilter |
| Structure | StructureOrganizer, StepDecomposer |
| Completeness | CompletenessValidator, TechnicalContextEnricher |
| Actionability | ActionabilityEnhancer, OutputFormatEnforcer |
| Specificity | ContextPrecisionBooster, DomainContextEnricher |
