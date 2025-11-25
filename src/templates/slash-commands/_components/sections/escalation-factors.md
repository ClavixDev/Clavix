## Escalation Analysis (Smart Triage)

Smart triage evaluates whether fast mode is sufficient or deep mode is recommended.

### The 8 Escalation Factors

| Factor | Trigger Condition | Points |
|--------|-------------------|--------|
| `intent-type` | Intent is planning or prd-generation | +30 |
| `low-confidence` | Intent confidence <60% | up to +20 |
| `low-quality` | Overall quality <65% | up to +25 |
| `missing-completeness` | Completeness dimension <60% | +15 |
| `low-specificity` | Specificity dimension <60% | +15 |
| `high-ambiguity` | Open-ended AND needs structure | +20 |
| `length-mismatch` | Prompt <50 chars AND completeness <70% | +15 |
| `complex-intent` | Intent is migration or security-review | +20 |

### Escalation Score Interpretation

| Score | Recommendation | Action |
|-------|----------------|--------|
| 75+ | `[STRONGLY RECOMMEND DEEP]` | Show top 3 factors, deep mode value |
| 60-74 | `[RECOMMEND DEEP]` | Show primary factor |
| 45-59 | `[DEEP MODE AVAILABLE]` | Mention as option |
| <45 | No escalation | Fast mode sufficient |

### Output Format

**Show only when score >= 45:**

```
Escalation: [SCORE]/100 [[RECOMMENDATION]]
  Contributing: [Factor1] (+[X]), [Factor2] (+[Y]), [Factor3] (+[Z])

Deep mode value: [what deep mode would add]
```

**Example - High escalation:**
```
Escalation: 78/100 [STRONGLY RECOMMEND DEEP]
  Contributing: low-quality (+25), missing-completeness (+15), low-specificity (+15), intent-type (+23)

Deep mode value: comprehensive requirements extraction, concrete examples, validation checklist, edge case analysis
```

**Example - Medium escalation:**
```
Escalation: 55/100 [DEEP MODE AVAILABLE]
  Contributing: low-confidence (+18), high-ambiguity (+20)

Deep mode value: alternative phrasings, clearer intent identification
```

### Deep Mode Value Propositions

Based on detected factors, show relevant deep mode benefits:

| Primary Factor | Deep Mode Value |
|----------------|-----------------|
| low-quality | Comprehensive requirements extraction, structured output |
| missing-completeness | Fills gaps with specific requirements, concrete examples |
| low-specificity | Adds versions, paths, identifiers, measurable criteria |
| high-ambiguity | Alternative approaches, clearer scope definition |
| low-confidence | Intent clarification, multiple interpretation handling |
| intent-type (planning) | Full planning framework, phased approach |
| complex-intent | Domain-specific considerations, risk assessment |

### Escalation Calculation Details

**Point scaling for continuous factors:**

- `low-confidence`: `(60 - confidence) / 3` points (max 20)
- `low-quality`: `(65 - quality) / 2.6` points (max 25)

**Example calculation:**
```
Prompt: "help me with auth"
  - Intent: code-generation (52% confidence)
  - Quality: 38%
  - Completeness: 25%
  - Specificity: 40%
  - Length: 18 chars

Calculation:
  + 0   intent-type (not planning/prd)
  + 3   low-confidence: (60-52)/3 = 2.67 → 3
  + 10  low-quality: (65-38)/2.6 = 10.4 → 10
  + 15  missing-completeness: 25% < 60%
  + 15  low-specificity: 40% < 60%
  + 20  high-ambiguity: open-ended + needs structure
  + 15  length-mismatch: 18 < 50 chars + incomplete
  + 0   complex-intent (not migration/security)
  ────
  = 78  [STRONGLY RECOMMEND DEEP]
```

### Agent Decision Based on Escalation

```
IF escalation >= 75:
  → Present deep mode as strong recommendation
  → Show: "I strongly recommend using /clavix:deep for this prompt"
  → List top 3 factors and values

IF escalation 60-74:
  → Present deep mode as recommendation
  → Show: "Deep mode recommended. Primary issue: [factor]"

IF escalation 45-59:
  → Mention as option
  → Show: "Deep mode available for more thorough analysis"
  → Continue with fast optimization

IF escalation < 45:
  → No escalation mention
  → Proceed with fast mode optimization
```
