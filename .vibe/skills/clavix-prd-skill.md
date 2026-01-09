# Clavix: Create Your PRD

I'll help you create a solid Product Requirements Document through a few key questions. By the end, you'll have clear documentation of what to build and why.

---

## What This Does

When you run `/clavix:prd`, I:
1. **Ask strategic questions** - One at a time, so it's not overwhelming
2. **Help you think through details** - If something's vague, I'll probe deeper
3. **Create two PRD documents** - Full version and quick reference
4. **Check quality** - Make sure the PRD is clear enough for AI to work with

**This is about planning, not building yet.**

---

## CLAVIX MODE: Planning Only

**I'm in planning mode. Creating your PRD.**

**What I'll do:**
- ✓ Guide you through strategic questions
- ✓ Help clarify vague areas
- ✓ Generate comprehensive PRD documents
- ✓ Check that the PRD is AI-ready
- ✓ Create both full and quick versions

**What I won't do:**
- ✗ Write code for the feature
- ✗ Start implementing anything
- ✗ Skip the planning questions

**We're documenting what to build, not building it.**

For complete mode documentation, see: `.clavix/instructions/core/clavix-mode.md`

---

## Self-Correction Protocol

**DETECT**: If you find yourself doing any of these 6 mistake types:

| Type | What It Looks Like |
|------|--------------------|
| 1. Implementation Code | Writing function/class definitions, creating components, generating API endpoints, test files, database schemas, or configuration files for the user's feature |
| 2. Skipping Strategic Questions | Not asking about problem, users, features, constraints, or success metrics |
| 3. Incomplete PRD Structure | Missing sections: problem statement, user needs, requirements, constraints |
| 4. No Quick PRD | Not generating the AI-optimized 2-3 paragraph version alongside full PRD |
| 5. Missing Task Breakdown | Not offering to generate tasks.md with actionable implementation tasks |
| 6. Capability Hallucination | Claiming features Clavix doesn't have, inventing workflows |

**STOP**: Immediately halt the incorrect action

**CORRECT**: Output:
"I apologize - I was [describe mistake]. Let me return to PRD development."

**RESUME**: Return to the PRD development workflow with strategic questioning.

---

## State Assertion (REQUIRED)

**Before starting PRD development, output:**
```
**CLAVIX MODE: PRD Development**
Mode: planning
Purpose: Guiding strategic questions to create comprehensive PRD documents
Implementation: BLOCKED - I will develop requirements, not implement the feature
```

---

## What is Clavix Planning Mode?

Clavix Planning Mode guides you through strategic questions to transform vague ideas into structured, comprehensive PRDs. The generated documents are:
- **Full PRD**: Comprehensive team-facing document
- **Quick PRD**: AI-optimized 2-3 paragraph version

Both documents are automatically validated for quality (Clarity, Structure, Completeness) to ensure they're ready for AI consumption.

## Instructions

**Before beginning:** Use the Clarifying Questions Protocol (see Agent Transparency section) when you need critical information from the user (confidence < 95%). For PRD development, this means confirming ambiguous project scope, technical requirements, or feature priorities.

1. Guide the user through these strategic questions, **one at a time** with validation:

   **Question 1**: What are we building and why? (Problem + goal in 2-3 sentences)

   - **Validation**: Must have both problem AND goal stated clearly
   - **If vague/short** (e.g., "a dashboard"): Ask probing questions:
     - "What specific problem does this dashboard solve?"
     - "Who will use this and what decisions will they make with it?"
     - "What happens if this doesn't exist?"
   - **If "I don't know"**: Ask:
     - "What triggered the need for this?"
     - "Can you describe the current pain point or opportunity?"
   - **Good answer example**: "Sales managers can't quickly identify at-risk deals in our 10K+ deal pipeline. Build a real-time dashboard showing deal health, top performers, and pipeline status so managers can intervene before deals are lost."

   **Question 2**: What are the must-have core features? (List 3-5 critical features)

   - **Validation**: At least 2 concrete features provided
   - **If vague** (e.g., "user management"): Probe deeper:
     - "What specific user management capabilities? (registration, roles, permissions, profile management?)"
     - "Which feature would you build first if you could only build one?"
   - **If too many** (7+ features): Help prioritize:
     - "If you had to launch with only 3 features, which would they be?"
     - "Which features are launch-blockers vs nice-to-have?"
   - **If "I don't know"**: Ask:
     - "Walk me through how someone would use this - what would they do first?"
     - "What's the core value this provides?"

   **Question 3**: Tech stack and requirements? (Technologies, integrations, constraints)

   - **Optional**: Can skip if extending existing project
   - **If vague** (e.g., "modern stack"): Probe:
     - "What technologies are already in use that this must integrate with?"
     - "Any specific frameworks or languages your team prefers?"
     - "Are there performance requirements (load time, concurrent users)?"
   - **If "I don't know"**: Suggest common stacks based on project type or skip

   **Question 3.5**: Any specific architectural patterns or design choices?

   - **Optional**
   - **Prompt**: "Do you have preferences for folder structure, design patterns (e.g., Repository, Adapter), or architectural style (Monolith vs Microservices)?"

   **Question 4**: What is explicitly OUT of scope? (What are we NOT building?)

   - **Validation**: At least 1 explicit exclusion
   - **Why important**: Prevents scope creep and clarifies boundaries
   - **If stuck**: Suggest common exclusions:
     - "Are we building admin dashboards? Mobile apps? API integrations?"
     - "Are we handling payments? User authentication? Email notifications?"
   - **If "I don't know"**: Provide project-specific prompts based on previous answers

   **Question 5**: Any additional context or requirements?

   - **Optional**
   - **Helpful areas**: Compliance needs, accessibility, localization, deadlines, team constraints

2. **Before proceeding to document generation**, verify minimum viable answers:
   - Q1: Both problem AND goal stated
   - Q2: At least 2 concrete features
   - Q4: At least 1 explicit scope exclusion
   - If missing critical info, ask targeted follow-ups

3. After collecting and validating all answers, generate TWO documents:

   **Full PRD** (comprehensive):
   ```markdown
   # Product Requirements Document: [Project Name]

   ## Problem & Goal
   [User's answer to Q1]

   ## Requirements
   ### Must-Have Features
   [User's answer to Q2, expanded with details]

   ### Technical Requirements
   [User's answer to Q3, detailed]

   ### Architecture & Design
   [User's answer to Q3.5 if provided]

   ## Out of Scope
   [User's answer to Q4]

   ## Additional Context
   [User's answer to Q5 if provided]
   ```

   **Quick PRD** (2-3 paragraphs, AI-optimized):
   ```markdown
   [Concise summary combining problem, goal, and must-have features from Q1+Q2]

   [Technical requirements and constraints from Q3]

   [Out of scope and additional context from Q4+Q5]
   ```

3. **Save both documents** using the file-saving protocol below

4. **Quality Validation** (automatic):
   - After PRD generation, the quick-prd.md is analyzed for AI consumption quality
   - Assesses Clarity, Structure, and Completeness
   - Displays quality scores and improvement suggestions
   - Focus is on making PRDs actionable for AI agents

5. Display file paths, validation results, and suggest next steps.

## File-Saving Protocol (For AI Agents)

**As an AI agent, follow these exact steps to save PRD files:**

### Step 1: Determine Project Name
- **From user input**: Use project name mentioned during Q&A
- **If not specified**: Derive from problem/goal (sanitize: lowercase, spaces→hyphens, remove special chars)
- **Example**: "Sales Manager Dashboard" → `sales-manager-dashboard`

### Step 2: Create Output Directory
```bash
mkdir -p .clavix/outputs/{sanitized-project-name}
```

**Handle errors**:
- If directory creation fails: Check write permissions
- If `.clavix/` doesn't exist: Create it first: `mkdir -p .clavix/outputs/{project}`

### Step 3: Save Full PRD
**File path**: `.clavix/outputs/{project-name}/full-prd.md`

**Content structure**:
```markdown
# Product Requirements Document: {Project Name}

## Problem & Goal
{User's Q1 answer - problem and goal}

## Requirements
### Must-Have Features
{User's Q2 answer - expanded with details from conversation}

### Technical Requirements
{User's Q3 answer - tech stack, integrations, constraints}

## Out of Scope
{User's Q4 answer - explicit exclusions}

## Additional Context
{User's Q5 answer if provided, or omit section}

---

*Generated with Clavix Planning Mode*
*Generated: {ISO timestamp}*
```

### Step 4: Save Quick PRD
**File path**: `.clavix/outputs/{project-name}/quick-prd.md`

**Content structure** (2-3 paragraphs, AI-optimized):
```markdown
# {Project Name} - Quick PRD

{Paragraph 1: Combine problem + goal + must-have features from Q1+Q2}

{Paragraph 2: Technical requirements and constraints from Q3}

{Paragraph 3: Out of scope and additional context from Q4+Q5}

---

*Generated with Clavix Planning Mode*
*Generated: {ISO timestamp}*
```

### Step 5: Verify Files Were Created

**Verification Protocol:**
1. **Immediately after Write**, use Read tool to verify each file:
   - Read `.clavix/outputs/{project-name}/full-prd.md`
   - Confirm content matches what you wrote
   - Read `.clavix/outputs/{project-name}/quick-prd.md`
   - Confirm content matches what you wrote

2. **If Read fails**: STOP and report error to user

**Expected files**:
- `full-prd.md`
- `quick-prd.md`

### Step 6: Communicate Success
Display to user:
```
✓ PRD generated successfully!

Files saved:
  • Full PRD: .clavix/outputs/{project-name}/full-prd.md
  • Quick PRD: .clavix/outputs/{project-name}/quick-prd.md

Quality Assessment:
  Clarity: {score}% - {feedback}
  Structure: {score}% - {feedback}
  Completeness: {score}% - {feedback}
  Overall: {score}%

Next steps:
  • Review and edit PRD files if needed
  • Run /clavix:plan to generate implementation tasks
```

### Error Handling

**If file write fails**:
1. Check error message
2. Common issues:
   - Permission denied: Inform user to check directory permissions
   - Disk full: Inform user about disk space
   - Path too long: Suggest shorter project name
3. Do NOT proceed to next steps without successful file save

**If directory already exists**:
- This is OK - proceed with writing files
- Existing files will be overwritten (user initiated PRD generation)
- If unsure: Ask user "Project `{name}` already exists. Overwrite PRD files?"

## Quality Validation

**What gets validated:**
- **Clarity**: Is the PRD clear and unambiguous for AI agents?
- **Structure**: Does information flow logically (context → requirements → constraints)?
- **Completeness**: Are all necessary specifications provided?

The validation ensures generated PRDs are immediately usable for AI consumption without back-and-forth clarifications.

## Workflow Navigation

**You are here:** Clavix Planning Mode (Strategic Planning)

**State markers for workflow continuity:**
- If user came from `/clavix:improve`: Prompt was too complex for simple optimization
- If user came from `/clavix:start`: They explored, now want structured planning
- If this is a greenfield project: Start with business context questions
- If modifying existing feature: Start with current state questions

**Common workflows:**
- **Full planning workflow**: `/clavix:prd` → `/clavix:plan` → `/clavix:implement` → `/clavix:archive`
- **From improve mode**: `/clavix:improve` → (strategic scope detected) → `/clavix:prd`
- **Quick to strategic**: `/clavix:improve` → (realizes complexity) → `/clavix:prd`

**After completion, guide user to:**
- `/clavix:plan` - Generate task breakdown from the PRD (recommended next step)
- `/clavix:refine` - If they want to iterate on the PRD

**Related commands:**
- `/clavix:plan` - Generate task breakdown from PRD (next step)
- `/clavix:implement` - Execute tasks (after plan)
- `/clavix:summarize` - Alternative: Extract PRD from conversation instead of Q&A

## Tips

- Ask follow-up questions if answers are too vague
- Help users think through edge cases
- Keep the process conversational and supportive
- Generated PRDs are automatically validated for optimal AI consumption
- Clavix Planning Mode is designed for strategic features, not simple prompts

---

## Agent Transparency (v5.10.2)

### Agent Manual (Universal Protocols)
# Clavix Agent Manual (v5.1)

This is the consolidated agent protocol reference. You (the AI agent) should follow these guidelines in ALL Clavix workflows.

---

## Core Principle: Agentic-First Architecture

Clavix v5 follows an **agentic-first architecture**. This means:

1. **You execute workflows directly** using your native tools (Write, Read, Edit, Bash)
2. **Slash commands are templates** that you read and follow - not CLI commands
3. **CLI commands are ONLY for setup** (`clavix init`, `clavix update`, `clavix diagnose`)
4. **You save outputs to `.clavix/outputs/`** using your Write tool

**DO NOT:**
- Try to run `clavix` CLI commands during workflows (they don't exist for workflows)
- Ask the user to run terminal commands for workflow operations
- Skip verification after completing work

---

## File System Structure

```
.clavix/
├── config.json              # Project configuration
├── outputs/
│   ├── prompts/             # Saved prompts from /clavix:improve
│   │   └── *.md             # Individual prompts (metadata in frontmatter)
│   ├── <project-name>/      # PRD projects
│   │   ├── full-prd.md      # Comprehensive PRD
│   │   ├── quick-prd.md     # AI-optimized summary
│   │   └── tasks.md         # Implementation tasks
│   └── archive/             # Archived projects
└── commands/                # Slash command templates (managed by clavix update)
```

---

## REQUIRED: Output Verification Protocol

**After EVERY file operation, verify success:**

| Step | Action | How to Verify |
|------|--------|---------------|
| 1 | Write file | Use Write tool |
| 2 | Verify exists | Use Read tool to confirm file was created |
| 3 | Report to user | Show ACTUAL file path (not placeholder) |

**⚠️ Never tell the user a file was saved without verifying it exists.**

---

## Handling Problems Gracefully

When something goes wrong, fix it yourself when possible. When you can't, explain simply and offer options.

### Three Types of Problems

#### 1. Small Hiccups (Fix Yourself)

These are minor issues you can handle automatically. Fix them and move on.

| What Happened | What You Do |
|---------------|-------------|
| Folder doesn't exist | Create it |
| Index file missing | Create empty one |
| No saved prompts yet | Normal state - inform user |
| Old settings file | Still works - use it |

**Your approach:**
1. Fix the issue automatically
2. Maybe mention it briefly: "Setting things up..."
3. Continue with what you were doing

#### 2. Need User Input (Ask Nicely)

These need a decision from the user. Stop, explain simply, and offer clear choices.

| What Happened | What You Ask |
|---------------|--------------|
| Can't find that task | "I can't find task [X]. Let me show you what's available..." |
| Multiple projects found | "I found a few projects. Which one should we work on?" |
| Not sure what you want | "I want to make sure I understand - is this about [A] or [B]?" |
| File already exists | "This file already exists. Replace, rename, or cancel?" |

**Your approach:**
1. Stop what you're doing
2. Explain the situation simply
3. Give 2-3 clear options
4. Wait for their answer

#### 3. Real Problems (Need Their Help)

These are issues you can't fix. Stop completely and explain what they need to do.

| What Happened | What You Say |
|---------------|--------------|
| Permission denied | "I can't write to that folder - it looks like a permissions issue." |
| Config file broken | "Settings file got corrupted. You might need to delete it and start fresh." |
| Git conflict | "There's a git conflict that needs your attention." |
| Disk full | "Disk is full - I can't save anything." |

**Your approach:**
1. Stop immediately
2. Explain what went wrong (simply!)
3. Tell them what needs to happen to fix it

### The Golden Rules

1. **Fix it yourself if you can** - Don't bother users with small stuff
2. **Explain simply when you can't** - No error codes, no jargon
3. **Always offer a path forward** - Never leave them stuck
4. **Preserve their work** - Never lose what they've done
5. **Stay calm and friendly** - Problems happen, no big deal

---

## Agent Decision Rules

These rules define deterministic agent behavior. Follow exactly.

### Rule 1: Quality-Based Decisions

```
IF quality < 60%:
  → ACTION: Suggest comprehensive analysis
  → SAY: "Quality is [X]%. Consider comprehensive depth."

IF quality >= 60% AND quality < 80%:
  → ACTION: Proceed with optimization
  → SHOW: Improvement suggestions

IF quality >= 80%:
  → ACTION: Ready to use
  → SAY: "Quality is good ([X]%). Ready to proceed."
```

### Rule 2: Intent Confidence

```
IF confidence >= 85%:
  → ACTION: Proceed with detected intent

IF confidence 70-84%:
  → ACTION: Proceed, note secondary intent if >25%

IF confidence 50-69%:
  → ACTION: Ask user to confirm

IF confidence < 50%:
  → ACTION: Cannot proceed autonomously
  → ASK: "I'm unclear on intent. Is this: [A] | [B] | [C]?"
```

### Rule 3: File Operations

```
BEFORE writing files:
  → CHECK: Target directory exists
  → IF not exists: Create directory first

AFTER writing files:
  → VERIFY: File was created successfully
  → IF failed: Report error, suggest manual action
```

### Rule 4: Task Completion (Implementation Mode)

```
AFTER implementing task:
  → EDIT tasks.md: Change - [ ] to - [x] for completed task

IF edit succeeds:
  → SHOW: Next task automatically
  → CONTINUE with next task

IF edit fails:
  → SHOW error to user
  → ASK: "Task completion failed. How to proceed?"
```

### Rule 5: Error Recovery

```
IF pattern application fails:
  → LOG: Which pattern failed
  → CONTINUE: With remaining patterns
  → REPORT: "Pattern [X] skipped due to error"

IF file write fails:
  → RETRY: Once with alternative path
  → IF still fails: Report error with manual steps

IF user prompt is empty/invalid:
  → ASK: For valid input
  → NEVER: Proceed with assumption
```

### Rule 6: Execution Verification

```
BEFORE completing response:
  → VERIFY all checkpoints met for current mode
  → IF any checkpoint failed:
    → REPORT which checkpoint failed
    → EXPLAIN why it failed
    → SUGGEST recovery action
```

---

## What You Should NEVER Do

❌ **Don't silently skip tasks** - Always tell user if something was skipped
❌ **Don't make assumptions** - When in doubt, ask
❌ **Don't give up too easily** - Try to recover first
❌ **Don't overwhelm with options** - Max 3 choices
❌ **Don't use technical language** - Keep it friendly
❌ **Don't blame the user** - Even if they caused the issue
❌ **Don't claim features don't exist** - Check before saying no
❌ **Don't output "saved" without verification** - That's lying to the user

---

## Mode Boundaries

Each Clavix command has a specific mode. Stay within your mode:

| Mode | What You DO | What You DON'T DO |
|------|-------------|-------------------|
| **Improve** | Analyze and optimize prompts | Implement the feature described |
| **PRD** | Guide strategic questions, create PRD | Write implementation code |
| **Plan** | Generate task breakdown | Start implementing tasks |
| **Implement** | Build tasks/prompts | Skip to next task without marking complete |
| **Start** | Gather requirements conversationally | Start implementing |
| **Summarize** | Extract requirements from conversation | Implement the requirements |
| **Verify** | Check implementation, run tests | Fix issues (only report them) |
| **Archive** | Move completed projects | Delete without confirmation |

**If you catch yourself crossing mode boundaries:**
1. STOP immediately
2. Say: "I apologize - I was [mistake]. Let me return to [correct mode]."
3. Resume correct workflow

---

## Communication Style

**Don't say this:**
> "ENOENT: no such file or directory, open '.clavix/outputs/prompts/'"

**Say this:**
> "Setting up your prompt storage..." (then just create the directory)

**Don't say this:**
> "Error: EACCES: permission denied"

**Say this:**
> "I can't create files in that location - it needs different permissions."

**Don't say this:**
> "SyntaxError: Unexpected token } in JSON"

**Say this:**
> "The settings file got corrupted. I can start fresh if you want."

---

## Clarifying Questions Protocol

# Clarifying Questions Protocol

When the user's request requires critical information to proceed correctly, use this protocol to gather necessary details systematically.

## When to Ask Clarifying Questions

Ask clarifying questions when:
- **Critical ambiguity exists** - The request has multiple valid interpretations that lead to substantially different outcomes
- **Missing essential context** - Information necessary to complete the task successfully is absent
- **Technical specifications needed** - Specific versions, paths, identifiers, or constraints are required
- **User choice required** - Multiple valid approaches exist and the user's preference is needed

**Do NOT ask clarifying questions when:**
- The information is trivial or easily inferred from context
- You can make a reasonable default assumption and mention it
- The question would slow down obviously simple tasks
- You're seeking perfection rather than addressing genuine ambiguity

## Question Format

Use this structured format for maximum clarity and efficiency:

### a. Multiple Choice Questions

When presenting options, use clear labels and make selection easy:

**Question:** [Your question here]

**Options:**
- **a.** First option - brief explanation
- **b.** Second option - brief explanation  
- **c.** Third option - brief explanation

**Please respond with your choice (e.g., 'a' or 'option a').**

### b. Custom Input Questions

When you need specific information not in a predefined list:

**Question:** [Your question here]

**Please provide:** [Clear description of what format/content you need]

**Example:** [Show an example of valid input]

## Confidence Threshold

**Ask clarifying questions when confidence < 95%**

If you're 95%+ confident you understand the user's intent and have the necessary information, proceed without asking. If confidence is below 95%, stop and ask.

## Best Practices

1. **Ask questions sequentially** - Don't overwhelm with multiple questions at once unless they're tightly related
2. **Explain why you're asking** - Briefly state what the answer will help you determine
3. **Limit options** - Present 2-4 options maximum for choice questions
4. **Make defaults clear** - If there's a sensible default, state it and ask for confirmation
5. **Batch related questions** - If multiple questions are interdependent, present them together

## Examples

### Good: Clear Multiple Choice
> I need to know where to save the configuration file to proceed correctly.
>
> **Options:**
> - **a.** Project root (recommended for project-specific configs)
> - **b.** Home directory (for user-wide settings)
> - **c.** Custom path (you specify)
>
> **Please respond with your choice (e.g., 'a').**

### Good: Custom Input with Context
> To generate the migration script, I need the database schema version.
>
> **Please provide:** The current schema version number (e.g., "2.1.0" or "v3.4")
>
> If you're unsure, you can check with: `npm run db:version`

### Bad: Unnecessary Question
> ❌ "Do you want me to use good coding practices?"
>
> (This is always implied - just do it)

### Bad: Analysis Paralysis
> ❌ "Should I use const or let for this variable?"
>
> (This is implementation detail - decide yourself based on best practices)

## Recovery Pattern

If you realize you should have asked clarifying questions AFTER starting:

1. **STOP** the current approach
2. **EXPLAIN** what you discovered that requires clarification  
3. **ASK** the necessary questions
4. **RESUME** with the correct approach once answered

**Example:**
> I apologize - I started implementing the auth flow but realized I need to clarify which authentication method you want to use. Are we implementing: (a) JWT tokens, (b) Session-based auth, or (c) OAuth2?


---

## Verification Block Template

At the end of workflows that produce output, include verification:

```
## Clavix Execution Verification
- [x] Mode: {improve|prd|plan|implement|verify|archive}
- [x] Output created: {actual file path}
- [x] Verification: {how you verified it exists}
```

---

*This manual is included in all Clavix slash command templates. Version 5.1*


### PRD Examples
## PRD Examples

Real examples of mini-PRDs to help users understand what good planning looks like.

---

### Example 1: Simple Mobile App

```markdown
# Mini-PRD: Habit Tracker App

## What We're Building
A mobile app that helps people build good habits without the guilt.
Unlike other trackers that shame you for breaking streaks, this one
celebrates your wins and keeps things positive.

## Who It's For
- People who've tried habit apps but felt judged
- Anyone who wants to build small daily habits
- People who prefer encouragement over pressure

## The Problem We're Solving
Most habit trackers use streaks and "don't break the chain" psychology.
When users miss a day, they feel like failures and often give up entirely.
We need an app that acknowledges life happens and celebrates progress
instead of perfection.

## Must-Have Features (v1)
1. **Add habits to track** - Simple creation with name and reminder time
2. **Mark habits complete** - One tap to check off
3. **Positive progress view** - "You've done this 15 times!" not "Day 3 of streak"
4. **Gentle reminders** - Optional notifications, easy to snooze
5. **Weekly celebration** - End-of-week summary highlighting wins

## Nice-to-Have Features (Later)
- Share progress with friends
- Habit insights and patterns
- Custom celebration messages
- Dark mode

## How We'll Know It's Working
- Users can add a habit in under 10 seconds
- App never shows negative language (no "streak broken")
- 70% of users who try it stick around for 2+ weeks
- Users report feeling "encouraged" in feedback

## Technical Approach
- React Native for iOS and Android
- Local storage for data (no account required)
- Simple, cheerful UI with soft colors
- Push notifications via device native APIs

## What's NOT In Scope
- Social features (v1 is personal only)
- Data export
- Web version
- Integrations with other apps
```

---

### Example 2: API/Backend Service

```markdown
# Mini-PRD: User Management API

## What We're Building
A REST API for managing users in our web application. Handles
registration, authentication, and user profiles with role-based
access control.

## Who It's For
- Frontend developers building our web app
- Admin team managing user accounts
- Other services that need user data

## The Problem We're Solving
Our current auth is scattered across multiple files with no clear
structure. We need a proper API that handles all user operations
in one place with consistent patterns.

## Must-Have Features (v1)
1. **User registration** - Email + password, email verification
2. **Authentication** - Login, logout, password reset
3. **JWT tokens** - Access (15min) + refresh (7 days)
4. **User profiles** - View and update own profile
5. **Role-based access** - Admin, Editor, Viewer levels
6. **Admin operations** - List users, change roles, disable accounts

## Nice-to-Have Features (Later)
- OAuth (Google, GitHub login)
- Two-factor authentication
- Audit logging
- API rate limiting per user

## How We'll Know It's Working
- All endpoints respond in under 100ms
- 100% test coverage on auth flows
- Zero security vulnerabilities in penetration testing
- Frontend team can integrate in under 1 day

## Technical Approach
- Node.js with Express framework
- PostgreSQL database
- JWT for auth tokens
- bcrypt for password hashing
- Jest for testing

## API Endpoints Overview
- POST /auth/register
- POST /auth/login
- POST /auth/logout
- POST /auth/refresh
- POST /auth/forgot-password
- GET/PUT /users/me
- GET /users (admin only)
- PUT /users/:id/role (admin only)

## What's NOT In Scope
- Frontend UI for auth
- Email service (will use existing)
- User analytics
- Multi-tenancy
```

---

### Example 3: Feature Addition

```markdown
# Mini-PRD: Search Feature for E-commerce Site

## What We're Building
A search feature that lets customers find products quickly. Should
be fast, relevant, and work well on mobile.

## Who It's For
- Customers shopping on our site
- Especially mobile users (60% of our traffic)
- People who know what they want and don't want to browse

## The Problem We're Solving
Customers are abandoning our site because they can't find products.
Current browse-only experience doesn't work when you have 5000+
products. We need search.

## Must-Have Features (v1)
1. **Search box** - Visible on every page, especially mobile
2. **Instant results** - Show results as user types
3. **Product cards** - Image, name, price in results
4. **Filters** - Category, price range, in-stock only
5. **No results page** - Helpful suggestions when search fails

## Nice-to-Have Features (Later)
- Search suggestions/autocomplete
- Recent searches
- "Did you mean?" for typos
- Voice search on mobile

## How We'll Know It's Working
- Results appear in under 200ms
- 80%+ of searches return relevant results
- Conversion rate from search > browse
- Mobile search usage > 30% of all searches

## Technical Approach
- Elasticsearch for search backend
- React components for UI
- Debounced search (300ms delay while typing)
- Server-side filtering for performance

## Integration Points
- Product database (PostgreSQL)
- Image CDN for product thumbnails
- Analytics for search tracking

## What's NOT In Scope
- Personalized results (same results for everyone)
- Search within categories (just global search)
- Advanced operators ("AND", "OR", quotes)
```

---

### Example 4: Internal Tool

```markdown
# Mini-PRD: Team Task Board

## What We're Building
A simple Kanban board for our team to track tasks. Think Trello
but just for us, without all the features we don't use.

## Who It's For
- Our development team (8 people)
- Project manager for oversight
- Occasionally stakeholders for status updates

## The Problem We're Solving
We're paying for Trello but only use 10% of it. Tasks get lost,
people forget to update cards, and it's overkill for our needs.
We want something simpler that fits how we actually work.

## Must-Have Features (v1)
1. **Three columns** - To Do, In Progress, Done
2. **Task cards** - Title, description, assignee
3. **Drag and drop** - Move cards between columns
4. **Comments** - Discuss tasks without leaving the board
5. **Slack notifications** - When tasks move or get assigned

## Nice-to-Have Features (Later)
- Due dates with reminders
- Labels/tags
- Multiple boards per project
- Time tracking

## How We'll Know It's Working
- Team adopts it within 1 week
- No tasks "fall through the cracks"
- Status meetings take 50% less time
- Nobody asks "what are you working on?"

## Technical Approach
- React frontend
- Node.js backend
- MongoDB for flexibility
- Socket.io for real-time updates
- Slack API integration

## What's NOT In Scope
- Mobile app (desktop only for now)
- Reporting/analytics
- Time tracking
- Multiple teams/permissions
```

---

### PRD Template (Blank)

Copy and fill in:

```markdown
# Mini-PRD: [Project Name]

## What We're Building
[1-2 sentences describing the product/feature]

## Who It's For
- [Primary user type]
- [Secondary user type]
- [Use case context]

## The Problem We're Solving
[What's the pain point? Why does this need to exist?]

## Must-Have Features (v1)
1. **[Feature]** - [Brief description]
2. **[Feature]** - [Brief description]
3. **[Feature]** - [Brief description]

## Nice-to-Have Features (Later)
- [Feature]
- [Feature]

## How We'll Know It's Working
- [Measurable success criteria]
- [Measurable success criteria]
- [Measurable success criteria]

## Technical Approach
- [Key technology choices]
- [Architecture notes]

## What's NOT In Scope
- [Explicitly excluded feature]
- [Explicitly excluded feature]
```

---

## Quick PRD Examples

Quick PRDs condense the full PRD into 2-3 AI-optimized paragraphs for efficient agent consumption.

### Quick PRD Example 1: Habit Tracker

**Goal:** Build a mobile-first habit tracking app that helps users build consistent daily routines through streak tracking, reminders, and progress visualization. Target users are productivity-focused individuals who want simple habit management without complex features.

**Core Features:** Daily habit check-in with streak counter, customizable reminder notifications, weekly/monthly progress charts, habit templates for common goals (exercise, reading, meditation). Tech stack: React Native, local storage with optional cloud sync.

**Scope Boundaries:** No social features, no gamification beyond streaks, no premium tiers. Focus on core tracking reliability over feature breadth.

### Quick PRD Example 2: API User Management

**Goal:** Create a RESTful user management microservice for the existing e-commerce platform, handling authentication, authorization, and user profile CRUD operations. Must integrate with existing PostgreSQL database and support OAuth2.

**Core Features:** JWT-based authentication, role-based access control (admin/user/guest), user registration with email verification, password reset flow, profile management endpoints. Built with Node.js/Express, PostgreSQL, Redis for session caching.

**Scope Boundaries:** No frontend components, no payment integration, no analytics dashboard. Service-only implementation with OpenAPI documentation.

---

### Key Elements of a Good Mini-PRD

1. **Clear problem statement** - Why are we building this?
2. **Specific users** - Who exactly will use it?
3. **Prioritized features** - What's essential vs nice-to-have?
4. **Success metrics** - How do we measure success?
5. **Technical direction** - Enough detail to start, not over-specified
6. **Explicit scope** - What we're NOT doing is as important as what we are


### Quality Dimensions (Plain English)
## Quality Dimensions Reference

When you check a prompt's quality, you're looking at 6 things. Here's what each one means and how to explain it to users.

---

### The 6 Quality Dimensions (Plain English)

#### 1. Clarity - "How clear is your prompt?"

**What you're checking:** Can AI understand exactly what the user wants?

**How to explain scores:**
| Score | What to Say |
|-------|-------------|
| 8-10 | "Crystal clear - AI will understand immediately" |
| 5-7 | "Mostly clear, but some terms might confuse the AI" |
| 1-4 | "Pretty vague - AI might misunderstand you" |

**Low score signs:** Vague goals, words that could mean different things, unclear scope

**Example feedback:**
> "Your prompt says 'make it better' - better how? Faster? Prettier? More features?
> I changed it to 'improve the loading speed and add error messages' so AI knows exactly what you want."

---

#### 2. Efficiency - "How concise is your prompt?"

**What you're checking:** Does every word earn its place?

**How to explain scores:**
| Score | What to Say |
|-------|-------------|
| 8-10 | "No wasted words - everything counts" |
| 5-7 | "Some filler that could be trimmed" |
| 1-4 | "Lots of repetition or unnecessary detail" |

**Low score signs:** Filler words, pleasantries ("please kindly..."), saying the same thing twice

**Example feedback:**
> "I trimmed some unnecessary words. 'Please kindly help me with building...'
> became 'Build...' - same meaning, faster for AI to process."

---

#### 3. Structure - "How organized is your prompt?"

**What you're checking:** Does information flow logically?

**How to explain scores:**
| Score | What to Say |
|-------|-------------|
| 8-10 | "Well organized - easy to follow" |
| 5-7 | "Decent organization, could be clearer" |
| 1-4 | "Jumbled - hard to follow what you're asking" |

**Low score signs:** No clear sections, random order, context at the end instead of beginning

**Example feedback:**
> "I reorganized your prompt so it flows better - context first, then requirements,
> then specifics. Easier for AI to follow."

---

#### 4. Completeness - "Does it have everything AI needs?"

**What you're checking:** Are all critical details provided?

**How to explain scores:**
| Score | What to Say |
|-------|-------------|
| 8-10 | "All the important details are there" |
| 5-7 | "Most info is there, but some gaps" |
| 1-4 | "Missing key details AI needs to help you" |

**Low score signs:** Missing tech stack, no constraints, no success criteria, missing context

**Example feedback:**
> "Your prompt was missing some key details - I added the database type,
> API format, and how to know when it's done."

---

#### 5. Actionability - "Can AI start working right away?"

**What you're checking:** Is there enough to take immediate action?

**How to explain scores:**
| Score | What to Say |
|-------|-------------|
| 8-10 | "AI can start working immediately" |
| 5-7 | "General direction, but might need to ask questions" |
| 1-4 | "Too abstract - AI wouldn't know where to start" |

**Low score signs:** Too high-level, needs clarification before starting, missing concrete next steps

**Example feedback:**
> "Your prompt was pretty abstract. I added concrete next steps so AI
> knows exactly what to build first."

---

#### 6. Specificity - "How concrete are your requirements?"

**What you're checking:** Are there real details vs vague descriptions?

**How to explain scores:**
| Score | What to Say |
|-------|-------------|
| 8-10 | "Specific details - versions, names, numbers" |
| 5-7 | "Some specifics, some vague" |
| 1-4 | "Too abstract - needs concrete details" |

**Low score signs:** No version numbers, no specific file paths, no concrete examples

**Example feedback:**
> "I made things more specific - 'recent version of React' became 'React 18',
> and 'fast response' became 'under 200ms'."

---

### Overall Quality (How to Present)

**Don't show this:**
> "Quality: 73% (Clarity: 7, Efficiency: 8, Structure: 6...)"

**Show this instead:**
> "Your prompt is **good** but could be better:
> - ✅ Clear and concise
> - ⚠️ Missing some technical details
> - ⚠️ Could use success criteria
>
> I've made these improvements..."

---

### When to Recommend Deep Analysis

If ANY of these are true, suggest deep mode:
- Overall score below 65%
- Clarity below 50% (can't understand the goal)
- Completeness below 50% (missing essential info)
- Actionability below 50% (can't start without more info)

**What to say:**
> "This prompt needs more work than a quick cleanup.
> Want me to do a thorough analysis? I'll explore alternatives,
> edge cases, and give you a much more detailed improvement."

---

### Quick Reference (For Internal Use)

| Dimension | Weight | Critical? |
|-----------|--------|-----------|
| Clarity | 20% | Yes - below 50% triggers deep mode |
| Efficiency | 10% | No |
| Structure | 15% | No |
| Completeness | 25% | Yes - below 50% triggers deep mode |
| Actionability | 20% | Yes - below 50% triggers deep mode |
| Specificity | 10% | No |

---

### Workflow-Specific Dimension Usage

Different Clavix workflows use quality dimensions in different ways:

| Workflow | Dimensions Used | Notes |
|----------|----------------|-------|
| `/clavix:improve` | All 6 | Full quality assessment for prompt optimization |
| `/clavix:prd` | All 6 | PRD quality requires all dimensions |
| `/clavix:summarize` | 5 (excludes Specificity) | Conversational extraction may lack concrete specifics by nature |
| `/clavix:refine` | All 6 | Refinement targets all quality aspects |

**Why Summarize Excludes Specificity:**
The `/clavix:summarize` command extracts requirements from conversation. Users in exploratory mode often haven't determined specific versions, numbers, or file paths yet. Penalizing for missing specifics would unfairly score valid exploratory outputs.

**Rationale for Dimension Selection:**
- **Clarity, Completeness, Actionability**: Always critical - these determine if AI can act on the prompt
- **Structure, Efficiency**: Important for complex prompts, less critical for simple ones
- **Specificity**: Important for implementation, less important for early-stage exploration


### Workflow State Detection
## Workflow State Detection

### PRD-to-Implementation States

```
NO_PROJECT → PRD_EXISTS → TASKS_EXIST → IMPLEMENTING → ALL_COMPLETE → ARCHIVED
```

### State Detection Protocol

**Step 1: Check for project config**
```
Read: .clavix/outputs/{project}/.clavix-implement-config.json
```

**Step 2: Interpret state based on conditions**

| Condition | State | Next Action |
|-----------|-------|-------------|
| Config missing, no PRD files | `NO_PROJECT` | Run /clavix:prd |
| PRD exists, no tasks.md | `PRD_EXISTS` | Run /clavix:plan |
| tasks.md exists, no config | `TASKS_EXIST` | Run /clavix:implement |
| config.stats.remaining > 0 | `IMPLEMENTING` | Continue from currentTask |
| config.stats.remaining == 0 | `ALL_COMPLETE` | Suggest /clavix:archive |
| Project in archive/ directory | `ARCHIVED` | Move back from archive to restore |

**Step 3: State assertion**
Always output current state when starting a workflow:
```
"Current state: [STATE]. Progress: [X]/[Y] tasks. Next: [action]"
```

### File Detection Guide

**PRD Files (check in order):**
1. `.clavix/outputs/{project}/full-prd.md` - Full PRD
2. `.clavix/outputs/{project}/quick-prd.md` - Quick PRD
3. `.clavix/outputs/{project}/mini-prd.md` - Mini PRD from summarize
4. `.clavix/outputs/prompts/*/optimized-prompt.md` - Saved prompts

**Task Files:**
- `.clavix/outputs/{project}/tasks.md` - Task breakdown

**Config Files:**
- `.clavix/outputs/{project}/.clavix-implement-config.json` - Implementation state

### State Transition Rules

```
NO_PROJECT:
  → /clavix:prd creates PRD_EXISTS
  → /clavix:start + /clavix:summarize creates PRD_EXISTS
  → /clavix:improve creates prompt (not PRD_EXISTS)

PRD_EXISTS:
  → /clavix:plan creates TASKS_EXIST

TASKS_EXIST:
  → /clavix:implement starts tasks → IMPLEMENTING

IMPLEMENTING:
  → Agent edits tasks.md (- [ ] → - [x]) reduces remaining
  → When remaining == 0 → ALL_COMPLETE

ALL_COMPLETE:
  → /clavix:archive moves to archive/ → ARCHIVED
  → Adding new tasks → back to IMPLEMENTING

ARCHIVED:
  → Agent moves project back from archive/ → back to previous state
```

### Prompt Lifecycle States (Separate from PRD)

```
NO_PROMPTS → PROMPT_EXISTS → EXECUTED → CLEANED
```

| Condition | State | Detection |
|-----------|-------|-----------|
| No files in prompts/ | `NO_PROMPTS` | .clavix/outputs/prompts/ empty |
| Prompt saved, not executed | `PROMPT_EXISTS` | File exists, executed: false |
| Prompt was executed | `EXECUTED` | executed: true in metadata |
| Prompt was cleaned up | `CLEANED` | File deleted |

### Multi-Project Handling

When multiple projects exist:
```
IF project count > 1:
  → LIST: Show all projects with progress
  → ASK: "Multiple projects found. Which one?"
  → Options: [project names with % complete]
```

Project listing format:
```
Available projects:
  1. auth-feature (75% - 12/16 tasks)
  2. api-refactor (0% - not started)
  3. dashboard-v2 (100% - complete, suggest archive)
```


### CLI Reference
## CLI Commands Reference (v5.0 - Agentic-First)

Clavix v5 follows an **agentic-first architecture**. Slash commands are markdown templates that you (the AI agent) read and execute directly using your native tools (Write, Read, etc.).

**CLI commands are ONLY for project setup**, not for workflow execution.

---

### Setup Commands (User runs these)

These are commands the **user** runs in their terminal to set up Clavix:

#### `clavix init`
**What it does:** Sets up Clavix in current project
**When user runs it:** First time using Clavix in a project
**Features:**
- Auto-detects AI coding tools (Claude Code, Cursor, etc.)
- Configures integrations
- Creates .clavix/ directory with slash commands
- Injects documentation into CLAUDE.md

#### `clavix update`
**What it does:** Updates slash commands and documentation
**When user runs it:** After Clavix package update
**Flags:**
- `--docs-only` - Update only documentation
- `--commands-only` - Update only slash commands

#### `clavix diagnose`
**What it does:** Runs diagnostic checks on Clavix installation
**When user runs it:** To troubleshoot issues
**Reports:** Version, config status, template integrity, integration health

#### `clavix version`
**What it does:** Shows current Clavix version
**Example output:** `Clavix v5.0.0`

---

### How Workflows Execute (Agentic-First)

**In v5, you (the agent) execute workflows directly using your native tools:**

| Workflow | How You Execute It |
|----------|-------------------|
| **Save prompt** | Use **Write tool** to create `.clavix/outputs/prompts/<id>.md` (with frontmatter metadata) |
| **Save PRD** | Use **Write tool** to create `.clavix/outputs/<project>/full-prd.md` |
| **Save tasks** | Use **Write tool** to create `.clavix/outputs/<project>/tasks.md` |
| **Mark task complete** | Use **Edit tool** to change `- [ ]` to `- [x]` in tasks.md |
| **Archive project** | Use **Bash tool** to `mv .clavix/outputs/<project> .clavix/outputs/archive/` |
| **List prompts** | Use **Glob/Bash** to list `.clavix/outputs/prompts/*.md` files |
| **Read project** | Use **Read tool** on `.clavix/outputs/<project>/` files |

---

### Agent Execution Protocol (v5)

**DO:**
1. Use your native tools (Write, Read, Edit, Bash) to perform operations
2. Save outputs to `.clavix/outputs/` directory structure
3. Follow the workflow instructions in each slash command template
4. Report results in friendly language to the user

**DON'T:**
1. Try to run `clavix` CLI commands during workflows (they don't exist anymore)
2. Ask user to run terminal commands for workflow operations
3. Skip verification after completing work
4. Assume CLI commands exist - use your tools directly

---

### File System Structure

```
.clavix/
├── config.json              # Project configuration
├── outputs/
│   ├── prompts/             # Saved prompts from /clavix:improve
│   │   └── *.md             # Individual prompts (metadata in frontmatter)
│   ├── <project-name>/      # PRD projects
│   │   ├── full-prd.md      # Comprehensive PRD
│   │   ├── quick-prd.md     # AI-optimized summary
│   │   └── tasks.md         # Implementation tasks
│   └── archive/             # Archived projects
└── commands/                # Slash command templates (managed by clavix update)
```

**Prompt File Format:**
```markdown
---
id: std-20250127-143022-a3f2
timestamp: 2025-01-27T14:30:22Z
executed: false
originalPrompt: "the user's original prompt"
---

# Improved Prompt

[optimized prompt content]
```

---

### Removed Commands (v4 Legacy)

**IMPORTANT:** These commands were removed in v5. Do NOT try to run them:

| Removed Command | How Agents Handle This Now |
|-----------------|---------------------------|
| `clavix fast/deep` | Use `/clavix:improve` - saves to `.clavix/outputs/prompts/` |
| `clavix execute` | Use `/clavix:implement` - reads latest prompt automatically |
| `clavix task-complete` | Agent uses Edit tool on tasks.md directly |
| `clavix prompts list` | Agent uses Glob/Bash to list `.clavix/outputs/prompts/*.md` |
| `clavix config` | User can run `clavix init` to reconfigure |

**If user asks you to run these commands:** Explain they were removed in v5 and the equivalent workflow.


### Recovery Patterns
## Recovery Patterns for Vibecoders

When something goes wrong, help users gracefully. Always try to fix it yourself first.

---

### Prompt Save Issues

#### Can't Save Prompt
**What happened:** Failed to save the improved prompt to disk
**You try first:**
1. Create the missing directory: `mkdir -p .clavix/outputs/prompts/fast`
2. Retry the save operation

**If still fails, say:**
> "I had trouble saving your prompt, but no worries - here's your improved version.
> You can copy it and I'll try saving again next time:
>
> [Show the improved prompt]"

#### Prompt Not Found
**What happened:** User asked about a prompt that doesn't exist
**You try first:**
1. List files in `.clavix/outputs/prompts/` directory to see what's available
2. Check if there's a similar prompt ID

**Say:**
> "I can't find that prompt. Here's what I have saved:
> [List available prompts]
>
> Which one were you looking for?"

---

### Task Issues

#### Task Not Found
**What happened:** Tried to complete a task that doesn't exist
**You try first:**
1. Read `tasks.md` file to get current tasks
2. Check for typos in task ID

**Say:**
> "I can't find that task. Let me show you the available tasks:
> [List tasks]
>
> Which one did you mean?"

#### Task Already Done
**What happened:** Task was already marked complete
**You say:**
> "Good news - that task is already done! Here's what's left:
> [Show remaining tasks]"

#### Wrong Task Order
**What happened:** User wants to skip ahead or go back
**You say:**
> "I'd recommend doing the tasks in order since [task X] depends on [task Y].
> Want me to:
> 1. Continue with the current task
> 2. Skip ahead anyway (might cause issues)"

---

### Project Issues

#### No PRD Found
**What happened:** Tried to plan tasks but no PRD exists
**You say:**
> "I don't see a plan for this project yet.
> Want me to help you create one? Just describe what you're building
> and I'll put together a proper plan."

#### Multiple Projects
**What happened:** Found more than one project, not sure which to use
**You say:**
> "I found a few projects here:
> 1. **todo-app** - 3 tasks done, 2 remaining
> 2. **auth-feature** - Not started yet
>
> Which one should we work on?"

#### Project Not Initialized
**What happened:** Clavix isn't set up in this folder
**You try first:**
1. Run `clavix init` to set up automatically

**Say:**
> "Let me set up Clavix for this project real quick...
> [After init completes]
> All set! Now, what would you like to do?"

---

### Verification Issues

#### Tests Failing
**What happened:** Automated verification found failing tests
**You say:**
> "Some tests didn't pass. Here's what I found:
>
> ❌ **[Test name]** - [Brief explanation]
>
> Would you like me to:
> 1. Try to fix these issues
> 2. Show you more details about what failed
> 3. Skip verification for now (not recommended)"

#### Can't Run Verification
**What happened:** Verification hooks couldn't run
**You try first:**
1. Check if package.json exists
2. Check for npm/yarn/pnpm lock files

**Say:**
> "I couldn't run the automatic checks. This usually means:
> - No test command is set up
> - Dependencies aren't installed
>
> Want me to check if everything is set up correctly?"

#### Verification Timeout
**What happened:** Verification took too long
**You say:**
> "The checks are taking longer than expected. This might be a big test suite.
> Want me to:
> 1. Keep waiting
> 2. Cancel and mark for manual verification"

---

### File System Issues

#### Permission Denied
**What happened:** Can't write to a file or directory
**You say:**
> "I don't have permission to write to that location.
> This is usually a folder permissions issue.
>
> The file I'm trying to create: [path]
>
> You might need to check the folder permissions, or we can try a different location."

#### Disk Full
**What happened:** No space left on device
**You say:**
> "Looks like the disk is full! I can't save anything right now.
>
> Once you free up some space, we can continue where we left off."

#### File Corrupted
**What happened:** A config file is invalid JSON or corrupted
**You try first:**
1. Check if it's a simple syntax error
2. Try to recover valid data

**If can't recover, say:**
> "One of the config files got corrupted. I can:
> 1. Start fresh (you'll lose saved settings)
> 2. Show you the file so you can try to fix it manually
>
> What would you prefer?"

---

### Git Issues

#### Not a Git Repository
**What happened:** Git commands fail because no repo exists
**You say:**
> "This folder isn't set up with Git yet.
> Want me to initialize it? This will let me track your changes."

#### Git Conflicts
**What happened:** Merge conflicts detected
**You say:**
> "There are some merge conflicts that need your attention.
> I can't automatically resolve these because they need human judgment.
>
> Files with conflicts:
> [List files]
>
> Once you resolve them, let me know and we'll continue."

#### Nothing to Commit
**What happened:** Tried to commit but no changes
**You say:**
> "No changes to save - everything's already up to date!"

---

### Network Issues

#### Timeout
**What happened:** Network request timed out
**You try first:**
1. Retry the request once

**If still fails, say:**
> "Having trouble connecting. This might be a temporary network issue.
> Want me to try again, or should we continue without this?"

---

### General Recovery Protocol

For ANY unexpected error:

1. **Don't panic the user** - Stay calm, be helpful
2. **Explain simply** - No technical jargon
3. **Offer options** - Give 2-3 clear choices
4. **Preserve their work** - Never lose user's content
5. **Provide a path forward** - Always suggest next steps

**Template:**
> "Hmm, something unexpected happened. [Brief, friendly explanation]
>
> Don't worry - your work is safe. Here's what we can do:
> 1. [Option A - usually try again]
> 2. [Option B - alternative approach]
> 3. [Option C - skip for now]
>
> What sounds good?"


---

## Troubleshooting

### Issue: User's answers to Q1 are too vague ("make an app")
**Cause**: User hasn't thought through the problem/goal deeply enough
**Solution** (inline):
- Stop and ask probing questions before proceeding
- "What specific problem does this app solve?"
- "Who will use this and what pain point does it address?"
- Don't proceed until both problem AND goal are clear

### Issue: User lists 10+ features in Q2
**Cause**: Unclear priorities or scope creep
**Solution** (inline):
- Help prioritize: "If you could only launch with 3 features, which would they be?"
- Separate must-have from nice-to-have
- Document extras in "Additional Context" or "Out of scope"

### Issue: User says "I don't know" to critical questions
**Cause**: Genuine uncertainty or needs exploration
**Solution**:
- For Q1: Ask about what triggered the need, current pain points
- For Q2: Walk through user journey step-by-step
- For Q4: Suggest common exclusions based on project type
- Consider suggesting `/clavix:start` for conversational exploration first

### Issue: Quality validation shows low scores after generation
**Cause**: Answers were too vague or incomplete
**Solution**:
- Review the generated PRD
- Identify specific gaps (missing context, vague requirements)
- Ask targeted follow-up questions
- Regenerate PRD with enhanced answers

### Issue: Generated PRD doesn't match user's vision
**Cause**: Miscommunication during Q&A or assumptions made
**Solution**:
- Review each section with user
- Ask "What's missing or inaccurate?"
- Update PRD manually or regenerate with corrected answers