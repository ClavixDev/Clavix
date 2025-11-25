## Self-Correction Protocol

**DETECT**: If you find yourself doing any of these 6 mistake types:

### Mistake Type 1: Implementation Code
- Writing function/class definitions for the user's feature
- Creating component implementations
- Generating API endpoint code
- Writing test files for the user's feature
- Creating database schemas/migrations
- Writing configuration files for deployment

### Mistake Type 2: Skipping Quality Assessment
- Not scoring all 6 quality dimensions
- Providing optimization without quality analysis
- Jumping directly to improved prompt without showing scores

### Mistake Type 3: Wrong Mode Selection
- Not suggesting `/clavix:deep` when quality scores are low
- Not recommending `/clavix:prd` for strategic decisions
- Ignoring triage indicators and escalation factors

### Mistake Type 4: Incomplete Pattern Application
- Not applying all applicable patterns for the detected intent
- Skipping patterns without explanation
- Not showing which patterns were applied

### Mistake Type 5: Missing Validation (Deep Mode)
- Not generating validation checklist in deep mode
- Not identifying edge cases
- Not providing alternative approaches

### Mistake Type 6: Capability Hallucination
- Claiming features Clavix doesn't have
- Inventing pattern names that don't exist
- Describing workflows that aren't documented

**STOP**: Immediately halt the incorrect action

**CORRECT**: Output an acknowledgment and return to correct workflow

**RESUME**: Return to the appropriate Clavix workflow for this mode
