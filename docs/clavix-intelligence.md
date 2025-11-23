# Clavix Intelligence™

Clavix uses **Clavix Intelligence™** to automatically optimize your prompts without requiring you to learn any framework or methodology.

## How It Works

Clavix operates in three intelligent stages:

### 1. Intent Detection

Clavix automatically recognizes what you're trying to accomplish:

- **Code Generation** - Creating new features, components, or functions
- **Planning/Architecture** - Designing systems, planning implementations
- **Refinement/Optimization** - Improving existing code or prompts
- **Debugging/Troubleshooting** - Finding and fixing issues
- **Documentation** - Writing guides, comments, or explanations
- **PRD Generation** - Creating strategic planning documents

The intent detector analyzes your prompt for keywords, patterns, and context to determine the best optimization approach.

### 2. Quality Assessment

Every prompt is evaluated across 5 quality dimensions:

| Dimension | What It Measures | Example Issue |
|-----------|------------------|---------------|
| **Clarity** | Is the objective clear and unambiguous? | "Make it better" (too vague) |
| **Efficiency** | Is the prompt concise without losing information? | "Please could you possibly maybe help me..." (too verbose) |
| **Structure** | Is information organized logically? | Requirements mixed with constraints randomly |
| **Completeness** | Are all necessary details provided? | Missing tech stack, success criteria, or context |
| **Actionability** | Can AI take immediate action? | "Build an app" (needs specifics) |

Each dimension is scored 0-100%, with an overall quality score calculated.

### 3. Pattern Application

Based on intent and quality scores, Clavix applies optimization patterns:

**Available Patterns (6 Total):**
1. **Conciseness Filter** (Priority: 10) - Removes verbosity and pleasantries
2. **Objective Clarifier** (Priority: 9) - Adds specificity and clear goals
3. **Structure Organizer** (Priority: 8) - Reorders information logically (Objective → Requirements → Technical → Constraints → Output → Success)
4. **Actionability Enhancer** (Priority: 7) - Converts vague goals into specific, measurable tasks
5. **Technical Context Enricher** (Priority: 5) - Fills in missing technical details
6. **Completeness Validator** (Priority: 6) - Ensures all requirements are present and adds "Missing Information" prompts

Patterns are selected based on intent compatibility and applied in priority order. Each pattern can run in both fast and deep modes.

## Fast vs Deep Mode

Clavix offers two optimization modes:

### Fast Mode (`clavix fast`)

**When to use:** Quick improvements for simple prompts

**What it does:**
- Runs intent detection
- Performs quality assessment
- Applies high-priority patterns
- Shows improvements with dimension labels

**Output:**
- Optimized prompt ready to use
- Quality scores per dimension
- List of improvements applied
- Recommendation for deep mode if needed

**Triage Logic:**
Fast mode automatically recommends deep mode if:
- Prompt is very short (< 20 characters)
- Missing 3+ critical elements
- Contains vague scope words without context
- Overall quality score < 65%

### Deep Mode (`clavix deep`)

**When to use:** Complex requirements, comprehensive analysis

**What it does:**
- Everything from fast mode, plus:
- Generates alternative phrasings
- Identifies edge cases
- Provides implementation examples
- Suggests alternative structures
- Analyzes potential issues

**Output:**
- Primary optimized prompt
- 3-5 alternative approaches
- Validation checklist
- Edge case analysis
- Implementation guidance

## Quality Scoring

Quality scores guide optimization decisions:

- **80-100%** - Excellent prompt, minimal changes needed
- **60-79%** - Good prompt, targeted improvements applied
- **40-59%** - Needs improvement, comprehensive optimization
- **0-39%** - Poor prompt, deep mode recommended

## Pattern Priority System

Patterns are applied based on priority and relevance:

1. **High Priority** (Always applied)
   - Conciseness filter (removes verbosity)
   - Objective clarifier (adds clarity)

2. **Medium Priority** (Applied based on quality scores)
   - Technical context enricher (adds missing details)
   - Structure organizer (coming soon)

3. **Low Priority** (Applied only in deep mode)
   - Alternative phrasing generator
   - Edge case identifier
   - Implementation example provider

## Extensible Architecture

The pattern library is designed for easy extension:

```typescript
// Adding a new pattern
import { BasePattern } from './patterns/base-pattern.js';

class CustomPattern extends BasePattern {
  name = 'custom-pattern';
  priority = 'medium';

  canApply(prompt: string, intent: IntentType, quality: QualityMetrics): boolean {
    // Determine if pattern should apply
    return quality.clarity < 60;
  }

  apply(prompt: string): string {
    // Apply optimization
    return optimizedPrompt;
  }
}

// Register pattern
patternLibrary.registerPattern(new CustomPattern());
```

## Benefits

**For Users:**
- ✅ No framework to learn
- ✅ Automatic optimization
- ✅ Intent-aware improvements
- ✅ Clear, actionable output

**For Developers:**
- ✅ Modular pattern system
- ✅ Easy to extend
- ✅ Type-safe architecture
- ✅ Well-tested components

## Architecture Overview

```
User Prompt
    ↓
Intent Detection (6 types)
    ↓
Quality Assessment (5 dimensions)
    ↓
Pattern Selection (priority-based)
    ↓
Pattern Application (sequential)
    ↓
Optimized Prompt
```

## Examples

### Code Generation Intent

**Input:**
```
"add auth"
```

**Detected Intent:** code-generation
**Quality Scores:** Clarity: 20%, Efficiency: 80%, Structure: 30%, Completeness: 10%, Actionability: 15%

**Optimized Output:**
```
Implement user authentication system with the following requirements:

**Objective:** Add secure user authentication to the application

**Requirements:**
- User registration with email/password
- Login/logout functionality
- Password hashing (bcrypt recommended)
- Session management
- Protected routes/endpoints

**Technical Constraints:**
- [Specify your tech stack: React, Node.js, etc.]
- [Database: PostgreSQL, MongoDB, etc.]
- [Auth library preference: Passport.js, JWT, etc.]

**Expected Output:**
- Complete authentication system implementation
- User registration and login endpoints
- Frontend authentication forms
- Session/token management
- Protected route middleware

**Success Criteria:**
- Users can register with email/password
- Passwords are securely hashed
- Users can log in and log out
- Protected routes require authentication
```

### Planning Intent

**Input:**
```
"how should I structure my app"
```

**Detected Intent:** planning
**Quality Scores:** Clarity: 30%, Efficiency: 70%, Structure: 40%, Completeness: 20%, Actionability: 25%

**Optimized Output:**
```
Design application architecture and folder structure:

**Objective:** Create scalable, maintainable application structure

**Requirements:**
1. Recommend folder structure for [specify: web app, mobile app, API, etc.]
2. Component/module organization strategy
3. Separation of concerns (UI, business logic, data)
4. Configuration management approach
5. Testing structure

**Technical Context:**
- Tech stack: [React, Vue, Angular, Node.js, etc.]
- Application type: [SPA, SSR, API, full-stack, etc.]
- Scale: [small project, medium app, enterprise system]
- Team size: [solo, small team, large team]

**Expected Output:**
- Recommended folder structure with explanation
- File naming conventions
- Module organization patterns
- Best practices for your specific stack
- Scalability considerations

**Success Criteria:**
- Clear separation of concerns
- Easy to navigate and understand
- Scalable for future growth
- Follows industry best practices for chosen stack
```

## Migration from v2.x

If you're upgrading from Clavix v2.x (CLEAR Framework):

**What Changed:**
- Terminology only—functionality is identical
- "CLEAR scores" → "Quality metrics"
- "CLEAR components (C/L/E/A/R)" → "Quality dimensions"
- File naming simplified (no "clear-" prefix)

**What Stayed the Same:**
- All commands work identically
- Same optimization quality
- Same output format (just clearer labels)
- Backward compatible with old prompts

**No Action Required:**
- Old saved prompts continue to work
- No migration scripts needed
- Run `clavix update` to refresh templates

## Learn More

- **Command Reference**: [docs/commands/README.md](commands/README.md)
- **Fast Command**: [docs/commands/fast.md](commands/fast.md)
- **Deep Command**: [docs/commands/deep.md](commands/deep.md)
- **Workflows**: [docs/guides/workflows.md](guides/workflows.md)
- **Why Clavix**: [docs/why-clavix.md](why-clavix.md)

---

**Made for vibecoders, by vibecoders** 🚀
