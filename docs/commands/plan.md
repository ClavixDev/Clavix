# clavix plan

## Description
Generates an actionable task plan from PRD artifacts or conversation summaries. Produces a markdown checklist grouped into phases and references the source material for each task.

## Syntax
```
clavix plan [options]
```

## Flags
- `-p, --project <name>` – Target a specific directory inside `.clavix/outputs/`.
- `--prd-path <dir>` – Provide an explicit path containing PRD artifacts.
- `--session <id>` – Generate a mini PRD and prompt from the given session before planning.
- `--active-session` – Use the most recent active session instead of specifying an ID.
- `--source <auto|full|quick|mini|prompt>` – Choose which artifact to prioritize. Defaults to `auto`.
- `--max-tasks <number>` – Limit tasks per phase (default `20`).
- `-o, --overwrite` – Replace an existing `tasks.md` file.

## Inputs
- PRD files inside `.clavix/outputs/<project>/` (full, quick, mini, or optimized prompt).
- Session transcripts via `.clavix/sessions/<id>.json` when using `--session` or `--active-session`.

## Outputs
- `.clavix/outputs/<project>/tasks.md` – Checklist grouped by phase with references back to PRD sections.
- Console summary listing the chosen source, number of phases, and number of tasks.

## Examples
- `clavix plan`
- `clavix plan --project billing-api --source quick`
- `clavix plan --session 1234-5678 --max-tasks 10`

## Task Generation Algorithm (v2.8.0+)

The command uses intelligent hierarchical parsing to generate actionable tasks from PRD content, avoiding task explosion and focusing on top-level implementation features.

### Hierarchical Parsing Strategy

**Core Principle**: Extract top-level features, not nested implementation details.

**Parsing Rules**:
1. **Top-level numbered lists** = Features (e.g., "1. User authentication", "2. Dashboard")
2. **Nested bullets/details** = Implementation notes (NOT separate tasks)
3. **Numbered lists under "Technical Stack"** = Dependencies (NOT tasks)
4. **Behavior/Requirements sections** = Grouped into parent feature task

### Example: Before vs After

**PRD Content**:
```markdown
## Core Features

1. User Authentication
   - Email and password login
   - OAuth integration (Google, GitHub)
   - Password reset flow
   - Session management

2. User Dashboard
   - Profile management
   - Activity feed
   - Settings panel

## Technical Stack

1. Frontend: React with TypeScript
2. Backend: Node.js with Express
3. Database: PostgreSQL
```

**Before v2.8.0 (Task Explosion)**:
```
Generated 15 tasks:
- User Authentication
- Email and password login
- OAuth integration (Google, GitHub)
- Password reset flow
- Session management
- User Dashboard
- Profile management
- Activity feed
- Settings panel
- Frontend: React with TypeScript
- Backend: Node.js with Express
- Database: PostgreSQL
... (3 more from other sections)
```

**After v2.8.0 (Intelligent Grouping)**:
```
Generated 2 tasks:
1. Implement User Authentication
   (includes email/password, OAuth, password reset, sessions)
2. Build User Dashboard
   (includes profile, activity feed, settings)
```

**Outcome**: 401 tasks → 25 tasks (real-world example from CHANGELOG)

### Behavior Section Grouping

**PRD Pattern** (numbered feature with Behavior section):
```markdown
1. **Task Management** - Core CRUD operations

   **Behavior:**
   - Create tasks with title, description, due date
   - Update task status (pending, in-progress, complete)
   - Delete tasks with confirmation
   - Filter tasks by status and date
```

**Task Generation**:
```
- Implement Task Management (with CRUD operations)
```

The "Behavior" details are referenced but NOT split into 4 separate tasks.

### Warning Thresholds

The algorithm includes safety checks to prevent runaway task generation:

#### Feature Count Warning (>50)
**Trigger**: PRD contains >50 top-level numbered features

**Output**:
```
⚠️  Warning: Detected 65 top-level features in PRD

This may indicate over-detailed PRD structure. Consider:
  - Grouping related features under phases
  - Using bullet points for implementation details
  - Structuring PRD hierarchically

Recommended max: 50 top-level features for manageable task list
```

**Action**: Review PRD structure, consolidate features

#### Task Count Warning (>50 per phase)
**Trigger**: Generated >50 tasks for a single phase

**Output**:
```
⚠️  Warning: Phase "Core Features" generated 78 tasks

This exceeds recommended limit (50 tasks/phase). Consider:
  - Breaking phase into sub-phases
  - Consolidating related tasks
  - Reviewing PRD hierarchy

Use --max-tasks flag to limit output
```

**Action**: Use `--max-tasks 30` or restructure PRD

### PRD Structuring Best Practices

#### Recommended Structure
```markdown
## Phase 1: Foundation

1. **User Authentication System**
   - Login/logout functionality
   - Session management
   - Password security

2. **Database Schema**
   - User table design
   - Indexing strategy
   - Migration setup
```

**Why this works**:
- Top-level numbers = features (tasks)
- Bullets = implementation details (notes)
- Clear phase boundaries
- Manageable task count

#### Anti-Pattern Structure
```markdown
## Phase 1: Foundation

1. Create login page
2. Add email input field
3. Add password input field
4. Add submit button
5. Implement login API endpoint
6. Hash password with bcrypt
7. Store user session in Redis
... (47 more micro-tasks)
```

**Why this fails**:
- Over-detailed task breakdown (should be 1-2 tasks max)
- No logical grouping
- Task explosion
- Hard to track meaningful progress

### Task Reference Mapping

Each generated task includes `prdReference` metadata linking back to source:

**Generated tasks.md**:
```markdown
## Phase 1: Core Features

- [ ] **phase-1-core-1** - Implement User Authentication
  Reference: Full PRD section "Core Features > User Authentication"

- [ ] **phase-1-core-2** - Build User Dashboard
  Reference: Full PRD section "Core Features > User Dashboard"
```

**Benefits**:
- Traceable to PRD requirements
- Easy requirement lookup during implementation
- Audit trail for completeness

### Optimizing PRD for Task Generation

#### Do's
- ✅ Use numbered lists for major features
- ✅ Use bullet points for implementation details
- ✅ Group related functionality under one feature
- ✅ Structure hierarchically (phases > features > details)
- ✅ Limit top-level features to 20-40 per PRD
- ✅ Use Behavior sections for detailed requirements

#### Don'ts
- ❌ Number every single implementation step
- ❌ Mix feature lists with technical stack enumeration
- ❌ Create flat 100-item numbered lists
- ❌ Duplicate information across sections
- ❌ Over-specify UI element tasks (button-level granularity)

### Algorithm Flowchart

```
PRD Content
    ↓
Extract all numbered lists
    ↓
Filter out "Technical Stack" sections
    ↓
Group nested bullets under parent number
    ↓
Merge Behavior sections into parent task
    ↓
Check feature count > 50? → Warning
    ↓
Generate tasks with PRD references
    ↓
Check tasks/phase > 50? → Warning
    ↓
Output tasks.md
```

### Real-World Impact

**Case Study** (from CHANGELOG v2.8.0):
- **PRD**: Comprehensive application spec with detailed technical requirements
- **Before**: 401 generated tasks (unmanageable)
- **After**: 25 focused tasks (phases complete in 1-2 days)
- **Outcome**: Same work scope, 16x better task clarity

### Troubleshooting

#### Too many tasks generated
**Symptom**: tasks.md has 100+ tasks

**Cause**: PRD uses numbered lists for everything

**Solution**:
1. Review PRD structure
2. Convert implementation details to bullets
3. Consolidate micro-tasks under feature headers
4. Use `--max-tasks 20` flag to limit output
5. Regenerate with `clavix plan --overwrite`

#### Too few tasks generated
**Symptom**: tasks.md only has 3 tasks for complex project

**Cause**: PRD uses only bullet points, no numbered features

**Solution**:
1. Structure PRD with numbered top-level features:
   ```markdown
   1. Feature A
   2. Feature B
   3. Feature C
   ```
2. Regenerate with `clavix plan --overwrite`

#### Tasks missing implementation details
**Symptom**: Tasks too vague (e.g., "Feature 1")

**Cause**: PRD numbered features lack descriptive content

**Solution**:
1. Add Behavior or Requirements sections under each numbered feature
2. Include bullets with implementation context
3. Example:
   ```markdown
   1. **User Authentication** - Secure login system
      - Email/password login
      - OAuth (Google, GitHub)
      - Password reset flow
   ```

## Common messages
- `Use either --session or --active-session, not both.` – Flags are mutually exclusive.
- `✗ No PRD artifacts found in this directory.` – The selected project lacks PRD files; run `clavix prd` or `clavix summarize` first.
- `⚠ tasks.md already exists.` – Use `--overwrite` to regenerate the file.
- `⚠️  Warning: Detected X top-level features in PRD` – Feature count exceeds recommended limit (50)
- `⚠️  Warning: Phase "X" generated Y tasks` – Phase task count exceeds limit (50/phase)
