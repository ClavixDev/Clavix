# Plan: `/clavix:review` Command

## Executive Summary

This document outlines a comprehensive plan for creating a new Clavix slash command: **`/clavix:review`** (or `/clavix-review` for IDE integrations).

**Purpose:** Enable team leads and reviewers to perform structured, criteria-driven PR reviews without requiring the PR author to have used Clavix.

**Key Differentiation from `/clavix:verify`:**
- **Verify** = checks *your own* implementation against *your own* PRD/tasks
- **Review** = reviews *someone else's* PR against *configurable criteria you define*

---

## 1. Command Overview

### 1.1 What It Does

When you run `/clavix:review`, the agent will:

1. **Ask for PR context** - Which branch/PR to review (target branch for diff)
2. **Ask for review criteria** - What aspects to focus on (security, architecture, coding standards, etc.)
3. **Gather additional context** - Any specific concerns, team conventions, or focus areas
4. **Perform the review** - Analyze the diff against the provided criteria
5. **Generate a structured review report** - Actionable feedback in a consistent format
6. **Save the report** - To `.clavix/outputs/reviews/` for reference

### 1.2 Command Signature

```
/clavix:review [options]
```

**Flags (optional):**
- `-b, --branch <name>` - Target branch to diff against (default: main/master)
- `-c, --criteria <preset>` - Use a predefined criteria preset (security, architecture, standards)
- `-p, --project <name>` - Associate review with a Clavix project
- `--quick` - Shorter question flow with sensible defaults
- `--output <format>` - Output format: `markdown` (default), `github-comments`

### 1.3 Workflow Position

```
[External PR Created]
     ↓
/clavix:review         # Review teammate's PR
     ↓
[Review Report Generated]
     ↓
[Manual PR Review with Report as Guide]
```

---

## 2. File Structure

### 2.1 New Files to Create

```
src/templates/slash-commands/
├── _canonical/
│   └── review.md                    # Main command template (NEW)
│
├── _components/
│   ├── references/
│   │   └── review-criteria.md       # Review dimension definitions (NEW)
│   │
│   └── sections/
│       ├── review-presets.md        # Predefined criteria presets (NEW)
│       └── review-examples.md       # Example review outputs (NEW)
```

### 2.2 Files to Update

```
src/templates/slash-commands/_components/
├── MANIFEST.md                      # Add review command to manifest
├── agent-protocols/
│   └── cli-reference.md             # Add review to command reference

docs/
├── commands.md                      # Add review command documentation
```

---

## 3. Template Structure (Following 10-Section Architecture)

### 3.1 Template Skeleton

```markdown
---
name: "Clavix: Review PR"
description: Perform criteria-driven PR review with structured actionable feedback
---

# Clavix: Review Your Teammate's PR

I'll help you perform a thorough, structured review of a Pull Request...

---

## What This Does
[Explanation of the command's functionality]

---

## CLAVIX MODE: PR Reviewer
[Mode boundaries and capabilities]

---

## Self-Correction Protocol
[6 mistake types with DETECT → STOP → CORRECT → RESUME]

---

## State Assertion (REQUIRED)
[Mode declaration block]

---

## Instructions
[Main workflow instructions]

---

## Agent Transparency (v5.10.3)
[Component includes]

---

## Workflow Navigation
[Related commands and guidance]

---

## Troubleshooting
[Common issues and recovery]
```

---

## 4. Detailed Workflow Design

### 4.1 Phase 1: Context Gathering (Conversational)

**Question 1: PR Identification**
```
What PR would you like me to review?

Options:
- Provide a branch name to diff against main/master
- Provide a PR URL (GitHub, GitLab, etc.)
- Describe the change and I'll help locate it
```

**Question 2: Review Criteria Selection**
```
What aspects should I focus on? (Select or describe)

Presets:
- 🔒 Security Focus - Auth, input validation, secrets, XSS/CSRF
- 🏗️ Architecture Focus - Design patterns, separation of concerns, SOLID
- 📏 Standards Focus - Code style, naming, documentation, testing
- ⚡ Performance Focus - Efficiency, caching, query optimization
- 🔄 All-Around Review - Balanced across all dimensions

Custom:
- Describe specific concerns or focus areas
```

**Question 3: Context & Conventions (Optional)**
```
Any additional context I should know?

Examples:
- "We use Repository pattern for data access"
- "All new endpoints need input validation"
- "Check for proper error handling"
- "We require 80% test coverage for new code"
```

### 4.2 Phase 2: Diff Analysis

1. **Retrieve the diff**
   - Run `git diff <target-branch>...<source-branch>`
   - Or fetch from PR URL if provided

2. **Identify changed files**
   - Categorize by type (source code, tests, config, docs)
   - Prioritize based on criteria focus

3. **Read relevant context**
   - Check surrounding code for patterns
   - Look for existing conventions
   - Identify related files that might be affected

### 4.3 Phase 3: Criteria-Based Analysis

**For each criterion, evaluate:**

| Criterion | What to Check |
|-----------|---------------|
| **Security** | Auth checks, input validation, secrets exposure, XSS/CSRF, SQL injection |
| **Architecture** | Design patterns, coupling, cohesion, SOLID principles, layer violations |
| **Code Quality** | Naming, comments, complexity, DRY, readability |
| **Error Handling** | Try/catch, error propagation, user-facing messages |
| **Testing** | Test coverage, edge cases, test quality |
| **Performance** | N+1 queries, caching, unnecessary computation |
| **Documentation** | Code comments, README updates, API docs |
| **Consistency** | Follows existing patterns, naming conventions, style |

### 4.4 Phase 4: Report Generation

**Output Format: Review Report**

```markdown
# PR Review Report

**Branch:** `feature/xyz` → `main`
**Files Changed:** 12 (8 source, 3 tests, 1 config)
**Review Criteria:** Security + Architecture (user-selected)
**Date:** 2026-01-12

---

## 📊 Executive Summary

| Dimension | Rating | Key Finding |
|-----------|--------|-------------|
| Security | 🟢 GOOD | No major vulnerabilities detected |
| Architecture | 🟡 FAIR | Minor coupling concerns in UserService |
| Code Quality | 🟢 GOOD | Clean, readable code |
| Testing | 🔴 NEEDS WORK | Missing edge case tests |

**Overall Assessment:** Approve with Minor Changes

---

## 🔍 Detailed Findings

### 🔴 Critical (Must Fix)

| ID | File | Line | Issue |
|:--:|:-----|:----:|:------|
| C1 | `src/auth/login.ts` | 45 | Missing rate limiting on login endpoint |
| C2 | `src/api/users.ts` | 128 | SQL injection vulnerability in search query |

### 🟠 Major (Should Fix)

| ID | File | Line | Issue |
|:--:|:-----|:----:|:------|
| M1 | `src/services/UserService.ts` | 67 | Direct database call bypasses repository pattern |
| M2 | `tests/auth.test.ts` | - | Missing test for failed login attempts |

### 🟡 Minor (Optional)

| ID | File | Line | Issue |
|:--:|:-----|:----:|:------|
| m1 | `src/utils/helpers.ts` | 23 | Magic number should be constant |
| m2 | `src/components/Form.tsx` | 89 | Console.log left in code |

### ⚪ Suggestions (Nice to Have)

- Consider extracting validation logic to separate utility
- API documentation could be more detailed

---

## ✅ What's Good

- Clean separation between components
- Good use of TypeScript types
- Descriptive variable naming
- Tests cover happy path scenarios

---

## 🛠️ Recommended Actions

**Before Merge:**
1. Fix C1: Add rate limiting middleware
2. Fix C2: Use parameterized query

**Consider for This PR:**
3. Address M1: Use UserRepository instead of direct DB access
4. Address M2: Add negative test cases

**Future Improvements:**
5. Consider extracting form validation

---

## 📁 Files Reviewed

| File | Status | Notes |
|:-----|:------:|:------|
| `src/auth/login.ts` | 🔴 | Critical security issue |
| `src/api/users.ts` | 🔴 | SQL injection |
| `src/services/UserService.ts` | 🟡 | Architecture concern |
| `src/components/Form.tsx` | 🟢 | Minor cleanup only |
| `tests/auth.test.ts` | 🟡 | Missing coverage |

---

*Generated with Clavix Review | 2026-01-12*
```

---

## 5. Review Criteria Reference Component

### 5.1 File: `_components/references/review-criteria.md`

```markdown
## Review Criteria Dimensions

### 🔒 Security
| Check | What to Look For |
|-------|------------------|
| Authentication | Proper auth checks on all protected routes |
| Authorization | Role/permission verification before sensitive actions |
| Input Validation | All user inputs validated and sanitized |
| Secrets | No hardcoded credentials, keys, or tokens |
| XSS Prevention | Proper output encoding, CSP headers |
| CSRF Protection | Tokens on state-changing operations |
| SQL Injection | Parameterized queries, no string concatenation |
| Dependency Security | No known vulnerable dependencies |

### 🏗️ Architecture
| Check | What to Look For |
|-------|------------------|
| Separation of Concerns | Business logic separate from presentation |
| Coupling | Components loosely coupled |
| Cohesion | Related functionality grouped together |
| SOLID Principles | Single responsibility, open/closed, etc. |
| Design Patterns | Consistent use of established patterns |
| Layer Violations | No skipping layers (e.g., UI calling DB directly) |
| Dependency Direction | Dependencies point toward abstractions |

### 📏 Code Standards
| Check | What to Look For |
|-------|------------------|
| Naming | Descriptive, consistent naming conventions |
| Comments | Meaningful comments where needed |
| Complexity | Functions/methods not too long or nested |
| DRY | No unnecessary duplication |
| Formatting | Consistent code style |
| Error Messages | Clear, actionable error messages |
| Logging | Appropriate log levels, no sensitive data |

### ⚡ Performance
| Check | What to Look For |
|-------|------------------|
| N+1 Queries | Efficient data fetching |
| Caching | Appropriate use of caching |
| Lazy Loading | Load only what's needed |
| Memory Leaks | Proper cleanup of resources |
| Algorithm Efficiency | Appropriate data structures and algorithms |

### 🧪 Testing
| Check | What to Look For |
|-------|------------------|
| Coverage | New code has tests |
| Edge Cases | Tests for boundary conditions |
| Error Cases | Tests for failure scenarios |
| Test Quality | Tests are readable and maintainable |
| Integration | Critical paths have integration tests |
```

---

## 6. Self-Correction Protocol (6 Mistake Types)

| Type | What It Looks Like |
|------|--------------------|
| 1. **Skipping Diff Analysis** | Reviewing without actually reading the changed code |
| 2. **Ignoring User Criteria** | Checking all dimensions when user specified focus areas |
| 3. **Vague Feedback** | "Code could be better" instead of specific, actionable issues |
| 4. **False Positives** | Flagging issues that aren't actually problems |
| 5. **Missing Context** | Not considering existing patterns/conventions |
| 6. **Implementation Mode** | Starting to fix issues instead of just reporting them |

---

## 7. State Assertion Block

```markdown
**CLAVIX MODE: PR Review**
Mode: analysis
Purpose: Criteria-driven code review generating actionable feedback
Implementation: BLOCKED - I will analyze and report, not modify code
```

---

## 8. File-Saving Protocol

### 8.1 Output Location

```
.clavix/outputs/reviews/
├── review-YYYYMMDD-HHMMSS-<branch>.md
└── ...
```

### 8.2 Frontmatter Structure

```yaml
---
id: review-20260112-143022-feature-xyz
branch: feature/xyz
targetBranch: main
criteria: security, architecture
date: 2026-01-12T14:30:22Z
filesReviewed: 12
criticalIssues: 2
majorIssues: 2
minorIssues: 2
---
```

---

## 9. Component Includes

```markdown
## Agent Transparency (v5.10.3)

### Agent Manual (Universal Protocols)
{{INCLUDE:agent-protocols/AGENT_MANUAL.md}}

### Review Criteria Reference
{{INCLUDE:references/review-criteria.md}}

### Review Presets
{{INCLUDE:sections/review-presets.md}}

### Self-Correction Protocol
{{INCLUDE:agent-protocols/self-correction-protocol.md}}

### CLI Reference
{{INCLUDE:agent-protocols/cli-reference.md}}

### Recovery Patterns
{{INCLUDE:troubleshooting/vibecoder-recovery.md}}
```

---

## 10. Manifest Updates

Add to `MANIFEST.md`:

```markdown
| `/clavix:review` | AGENT_MANUAL, review-criteria, review-presets, cli-reference, vibecoder-recovery |
```

---

## 11. Documentation Updates

### 11.1 Add to `docs/commands.md`

```markdown
## /clavix:review

Perform criteria-driven PR review with structured feedback.

```
/clavix:review [options]
```

**What it does:**
1. **Asks for PR context** - Branch or PR URL to review
2. **Gathers review criteria** - Security, architecture, standards, or custom
3. **Analyzes the diff** - Reads changed files and surrounding context
4. **Generates review report** - Structured findings with severity levels
5. **Saves report** - To `.clavix/outputs/reviews/`

**Flags:**
- `-b, --branch <name>` - Target branch to diff against
- `-c, --criteria <preset>` - Use predefined criteria (security, architecture, standards, performance, all)
- `--quick` - Skip questions, use sensible defaults
- `--output <format>` - Output format (markdown, github-comments)

**Output Categories:**
- 🔴 **CRITICAL**: Security vulnerabilities, broken functionality
- 🟠 **MAJOR**: Architecture violations, missing tests
- 🟡 **MINOR**: Code style, naming, minor improvements
- ⚪ **SUGGESTION**: Nice-to-have improvements

**When to use:**
- Reviewing a teammate's PR
- Ensuring PR meets team standards before manual review
- Getting a second opinion on code changes

**When NOT to use:**
- Checking your own implementation (use `/clavix:verify`)
- Code is not yet in a branch/PR
```

---

## 12. Implementation Checklist

### Phase 1: Core Template
- [ ] Create `review.md` canonical template
- [ ] Follow 10-section architecture
- [ ] Include all required sections

### Phase 2: Components
- [ ] Create `references/review-criteria.md`
- [ ] Create `sections/review-presets.md`
- [ ] Create `sections/review-examples.md`

### Phase 3: Documentation
- [ ] Update `MANIFEST.md`
- [ ] Update `cli-reference.md`
- [ ] Update `docs/commands.md`

### Phase 4: Testing
- [ ] Test with real PR diffs
- [ ] Verify all includes resolve
- [ ] Run consistency validation
- [ ] Test with multiple AI providers

### Phase 5: Polish
- [ ] Add troubleshooting scenarios
- [ ] Refine output format based on testing
- [ ] Update workflow navigation in related commands

---

## 13. Example Flows

### 13.1 Quick Review

```
User: /clavix:review

Agent: **CLAVIX MODE: PR Review**
       Mode: analysis
       Purpose: Criteria-driven code review
       Implementation: BLOCKED

       What branch would you like me to review? (I'll diff against main)

User: feature/user-auth

Agent: What aspects should I focus on?
       - 🔒 Security Focus
       - 🏗️ Architecture Focus  
       - 📏 Standards Focus
       - ⚡ Performance Focus
       - 🔄 All-Around Review
       
User: Security

Agent: Any additional context? (Press Enter to skip)

User: We require input validation on all endpoints

Agent: [Runs git diff, analyzes changes, generates report]

       ✅ Review saved to: `.clavix/outputs/reviews/review-20260112-143022-feature-user-auth.md`
       
       ## Executive Summary
       ...
```

### 13.2 Detailed Review with Custom Criteria

```
User: /clavix:review --branch feature/payment-integration

Agent: **CLAVIX MODE: PR Review**
       ...
       
       I'll review `feature/payment-integration` against `main`.
       
       What aspects should I focus on?

User: Security and error handling - we're integrating Stripe

Agent: Got it - Security + Error Handling for payment integration.
       
       Any team conventions or specific concerns?

User: All Stripe API keys must use env vars, all payment operations 
      must be idempotent, and we need proper error recovery for 
      failed transactions

Agent: [Comprehensive review with those specific criteria]
```

---

## 14. Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| Large diffs overwhelming context | Prioritize files based on criteria; summarize less critical files |
| False positives frustrating users | Include confidence levels; explain reasoning |
| Missing project conventions | Ask about conventions upfront; learn from existing code |
| Git access issues | Provide clear error messages; suggest alternatives |
| Review taking too long | Implement streaming output; show progress |

---

## 15. Future Enhancements

1. **GitHub/GitLab Integration** - Post comments directly to PR
2. **Learning Mode** - Remember team conventions across reviews
3. **Preset Customization** - Allow teams to define custom presets
4. **Review History** - Track patterns across multiple reviews
5. **Auto-Assignment** - Suggest relevant reviewers based on code

---

## Approval

- [ ] Architecture review complete
- [ ] Aligns with existing Clavix patterns
- [ ] No conflicts with other commands
- [ ] Ready for implementation

---

*Plan created: 2026-01-12*
*Status: Ready for Review*
