# How Clavix Works

Clavix is a pattern-based prompt optimization system that runs locally and injects structured instructions into AI coding agents. This document explains exactly what happens when you use Clavix.

## The Three-Stage Pipeline

### 1. Intent Detection

Clavix analyzes your prompt using keyword-weighted scoring to determine what you're trying to accomplish:

| Intent Type | Trigger Keywords | Weight |
|-------------|------------------|--------|
| code-generation | create, build, implement, write, add, make | High |
| debugging | fix, debug, error, issue, bug, broken | High |
| planning | design, architect, plan, structure | Medium |
| refinement | improve, refactor, optimize, enhance | Medium |
| documentation | document, explain, describe, readme | Medium |
| testing | test, coverage, spec, unit test | Medium |
| prd-generation | PRD, requirements, specification | Medium |
| migration | migrate, upgrade, port, convert | Low |
| security-review | security, audit, vulnerability, OWASP | Low |
| learning | explain, how does, tutorial, understand | Low |
| summarization | summarize, extract, requirements from | Low |

**How scoring works:**
- Each keyword match adds weight to the corresponding intent
- The intent with the highest score becomes the primary intent
- Confidence = primary score / total scores
- If confidence < 50%, Clavix asks for clarification

**Limitations:**
- Keyword matching cannot understand context or nuance
- "Fix the build system" might trigger "debugging" instead of "code-generation"
- Multi-intent prompts may not be classified accurately

### 2. Quality Assessment

Every prompt is scored across 6 dimensions:

| Dimension | What It Measures | Score Range |
|-----------|------------------|-------------|
| **Clarity** | Is the objective unambiguous? | 0-100% |
| **Efficiency** | Concise without losing information? | 0-100% |
| **Structure** | Information organized logically? | 0-100% |
| **Completeness** | All necessary details provided? | 0-100% |
| **Actionability** | Can action be taken immediately? | 0-100% |
| **Specificity** | Concrete identifiers, versions, paths? | 0-100% |

**Scoring method:**
- Each dimension uses heuristic rules (word counts, keyword presence, structure patterns)
- Weights vary by intent (e.g., completeness matters more for code-generation)
- Overall score is a weighted average

**Scoring thresholds:**
- 85%+: Excellent - minimal optimization needed
- 70-84%: Good - targeted improvements applied
- 60-69%: Needs improvement - standard optimization
- <60%: Poor - comprehensive optimization recommended

**Limitations:**
- Heuristic rules cannot evaluate correctness or feasibility
- A well-structured bad idea will score high
- A brilliant but unconventionally-worded prompt may score low

### 3. Pattern Application

Based on intent and quality scores, Clavix applies optimization patterns:

**Core Patterns (always available):**
| Pattern | Priority | Effect |
|---------|----------|--------|
| ConcisenessFilter | 10 | Removes pleasantries and filler |
| ObjectiveClarifier | 9 | Adds clear goal statement |
| AmbiguityDetector | 9 | Flags vague terms |
| StructureOrganizer | 8 | Reorders into logical flow |
| TechnicalContextEnricher | 8 | Adds missing tech context |
| ContextPrecisionBooster | 8 | Adds precise context |
| ActionabilityEnhancer | 7 | Converts vague to specific |
| StepDecomposer | 7 | Breaks into sequential steps |
| CompletenessValidator | 6 | Flags missing elements |
| SuccessCriteriaEnforcer | 6 | Adds measurable criteria |

**Comprehensive-Only Patterns (require --comprehensive flag or auto-selection):**
| Pattern | Effect |
|---------|--------|
| OutputFormatEnforcer | Adds explicit output format |
| DomainContextEnricher | Adds domain-specific best practices |
| PRDStructureEnforcer | Ensures PRD completeness |

**Pattern selection:**
- Patterns run in priority order (10 → 1)
- Each pattern checks if it applies to the prompt
- Patterns that don't apply are skipped silently

## Depth Auto-Selection

The `clavix improve` command automatically selects depth:

```
IF quality >= 75%:
  → Comprehensive analysis (all patterns)
  → Rationale: High-quality prompts benefit from polish

IF quality 60-74%:
  → Standard optimization (core patterns)
  → Rationale: Fix obvious issues efficiently

IF quality < 60%:
  → Comprehensive analysis (all patterns)
  → Rationale: Low-quality prompts need thorough work
```

**Override with flags:**
- `clavix improve --standard "prompt"` - Force standard depth
- `clavix improve --comprehensive "prompt"` - Force comprehensive depth

## Escalation to PRD Mode

Strategic prompts are detected via keyword presence:

**Strategic keywords:**
- Architecture: system design, microservices, scalability
- Security: authentication, authorization, encryption
- Infrastructure: deployment, CI/CD, containers

**Escalation rule:**
```
IF 3+ strategic keywords detected:
  → Recommend /clavix:prd for comprehensive planning
```

## What Clavix Does NOT Do

### No AI/LLM Processing
Clavix makes no API calls. All analysis runs locally using deterministic rules. The same prompt always produces the same analysis.

### No Semantic Understanding
Pattern matching cannot:
- Understand if your approach is correct
- Evaluate technical feasibility
- Judge creative quality
- Guarantee the optimization actually helps

### No Validation of Claims
Accuracy percentages are not validated against ground truth. "95% intent detection accuracy" would require a labeled dataset we don't have.

## File Locations

**Saved prompts:** `.clavix/outputs/prompts/`
- `improve/` - Unified optimization results
- Each prompt saved as `improve-YYYYMMDD-HHMMSS-xxxx.md`

**Index files:** `.clavix/outputs/prompts/improve/.index.json`
- Tracks prompt metadata, execution status, timestamps

**PRD outputs:** `.clavix/outputs/{project}/`
- `full-prd.md` - Complete PRD document
- `quick-prd.md` - AI-optimized summary
- `tasks.md` - Implementation task breakdown

## Architecture

```
User Prompt
    ↓
Intent Detector (keyword scoring → 11 types)
    ↓
Quality Assessor (heuristic rules → 6 dimensions)
    ↓
Depth Selector (auto: standard vs comprehensive)
    ↓
Pattern Library (priority-ordered application)
    ↓
Output Generator (structured prompt + metadata)
    ↓
File Writer (saves to .clavix/outputs/)
```

## Extending Clavix

Patterns are modular TypeScript classes:

```typescript
import { BasePattern } from './patterns/base-pattern.js';

class CustomPattern extends BasePattern {
  name = 'custom-pattern';
  priority = 5; // 1-10, higher runs first

  canApply(prompt: string, intent: IntentType, quality: QualityMetrics): boolean {
    // Return true if this pattern should apply
    return quality.clarity < 60;
  }

  apply(prompt: string): PatternResult {
    // Transform the prompt
    return {
      improved: transformedPrompt,
      changes: ['Description of what changed'],
    };
  }
}
```

Register in `src/core/intelligence/pattern-library.ts`.

## Related Documentation

- [Philosophy](philosophy.md) - What Clavix actually is
- [Choosing a Workflow](guides/choosing-workflow.md) - When to use what
- [Why Clavix](why-clavix.md) - Problems it solves
