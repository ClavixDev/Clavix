## Quality Assessment Output Format

### Compact Action-Oriented Output

Present quality results in this format:

```
Quality: [OVERALL]% [[STATUS]]
  → [DIM1]: [SCORE]% - [ONE-LINE ISSUE] (if <70%)
  → [DIM2]: [SCORE]% - [ONE-LINE ISSUE] (if <70%)

Missing for [INTENT]: [list of missing elements]
```

### Status Indicators

| Status | Score Range | Meaning |
|--------|-------------|---------|
| `[EXCELLENT]` | 90%+ | No action needed |
| `[GOOD]` | 80-89% | Minor improvements available |
| `[DECENT]` | 70-79% | Review suggested improvements |
| `[NEEDS-IMPROVEMENT]` | 60-69% | Apply improvements, consider deep mode |
| `[POOR]` | <60% | Deep mode strongly recommended |

### Dimension Failure Reasons

Show only for scores <70%. Use these one-line explanations:

**Clarity failures:**
- "No objective statement" - Missing clear goal
- "Vague terms: [list]" - Contains ambiguous language
- "No success criteria" - How to know when done

**Completeness failures (intent-specific):**
- `[code-generation]` "Missing: tech stack, output format, integration points"
- `[debugging]` "Missing: error message, expected vs actual behavior"
- `[planning]` "Missing: problem statement, goals, constraints"
- `[testing]` "Missing: test type, coverage scope, mocking needs"
- `[migration]` "Missing: source/target versions, breaking changes"
- `[security-review]` "Missing: scope, threat model, compliance requirements"

**Actionability failures:**
- "Contains: [ambiguous terms]" - Words like "something", "properly"
- "No concrete examples" - Missing input/output samples
- "Too many open questions" - More than 3 unresolved points

**Specificity failures:**
- "No versions/paths/identifiers" - Missing concrete references
- "Vague scope: [terms]" - Terms like "the system", "the app"

**Efficiency failures:**
- "[N] pleasantries detected" - Found polite but unnecessary phrases
- "Low signal ratio" - Too much noise vs actual content

**Structure failures:**
- "Missing: context|requirements|constraints" - Key sections absent
- "No logical flow" - Information poorly organized

### Example Outputs

**Poor quality prompt:**
```
Quality: 42% [NEEDS-IMPROVEMENT]
  → Completeness: 20% - Missing: tech stack, success criteria, output format
  → Clarity: 40% - No objective statement found
  → Actionability: 35% - Contains: "something", "properly", no examples

Missing for code-generation: tech stack, auth context, error handling expectations
```

**Good quality prompt:**
```
Quality: 85% [GOOD]
  → Specificity: 68% - No version numbers specified

All critical dimensions passing. Ready for optimization.
```

**Excellent quality prompt:**
```
Quality: 94% [EXCELLENT]

All dimensions passing. Prompt is well-structured and actionable.
```

### Dimension Weight Reference

Weights vary by intent. Show weight profile for transparency:

```
Weights [code-generation]: completeness(25%) > clarity(20%) = actionability(20%) > specificity(15%) > efficiency(10%) = structure(10%)
Weights [debugging]: actionability(25%) > completeness(25%) > specificity(20%) > clarity(15%) > structure(10%) > efficiency(5%)
Weights [planning]: structure(25%) > completeness(25%) > clarity(20%) > actionability(15%) > specificity(10%) > efficiency(5%)
```
