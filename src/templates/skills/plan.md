---
name: clavix-plan
description: Transform PRD documents into actionable task breakdowns with dependencies. Use after creating a PRD to generate implementation tasks.
license: Apache-2.0
---
# Clavix Plan Skill

Transform PRD documents into structured, actionable task lists with proper sequencing.

---

## State Assertion (REQUIRED)

**Before starting task breakdown, output:**

```
**CLAVIX MODE: Technical Planning**
Mode: planning
Purpose: Generating low-level engineering tasks from PRD & Codebase
Implementation: BLOCKED - I will create the plan, not the code
```

---

## Self-Correction Protocol

**DETECT**: If you find yourself doing any of these mistake types:

| Type | What It Looks Like |
|------|--------------------|
| 1. Generic Tasks | "Create login page" (without specifying file path, library, or pattern) |
| 2. Ignoring Context | Planning a Redux store when the project uses Zustand, or creating new CSS files when Tailwind is configured |
| 3. Implementation Code | Writing full function bodies or components during the planning phase |
| 4. Missing Task IDs | Not assigning proper task IDs for tracking |
| 5. Capability Hallucination | Claiming features Clavix doesn't have |

**STOP**: Immediately halt the incorrect action.

**CORRECT**: Output:
> "I apologize - I was [describe mistake]. Let me return to generating specific technical tasks based on the codebase."

**RESUME**: Return to the workflow with correct context-aware approach.

---

## Workflow

### Phase 1: Context Analysis (CRITICAL)

**Before reading the PRD, understand the codebase patterns.**

1. **Scan Directory Structure**:
   - Run `ls -R src` (or relevant folders) to see the file layout
   - Identify folder conventions (features/, components/, services/)

2. **Read Configuration**:
   - Read `package.json` to identify dependencies (React? Vue? Express? Tailwind? Prisma?)
   - Read `tsconfig.json` or similar to understand aliases and strictness
   - Check for `.eslintrc`, `prettier.config`, etc.

3. **Identify Patterns**:
   - Open 1-2 representative files (e.g., a component, a service, a route)
   - **Determine**:
     - How is state managed? (Context, Redux, Zustand?)
     - How is styling done? (CSS Modules, Tailwind, SCSS?)
     - How are API calls made? (fetch, axios, custom hooks?)
     - Where are types defined?

4. **Output Summary**:
   ```
   Detected Stack Summary:
   - Framework: [e.g., Next.js 14 App Router]
   - Styling: [e.g., Tailwind CSS + shadcn/ui]
   - State: [e.g., Zustand (stores in /src/store)]
   - API: [e.g., Server Actions + Prisma]
   - Conventions: [e.g., kebab-case files, Zod for validation]
   ```

### Phase 2: PRD Ingestion

1. **Locate PRD**:
   - Check `.clavix/outputs/<project-name>/` for `full-prd.md`, `quick-prd.md`
   - If missing, check legacy `.clavix/outputs/summarize/`

2. **Read PRD**: Ingest all requirements

3. **Extract Architecture Section**:
   - Look for "Architecture & Design" section
   - Note any specific patterns (Clean Architecture, Feature-Sliced Design)
   - Identify structural decisions from PRD

**If no PRD found:**
> "I don't see a PRD for this project. Please run `/clavix-prd` first to generate requirements, or provide them directly."

### Phase 3: Task Generation

1. **Architecture First Principle**:
   - If the PRD specifies a pattern (e.g., Repository), the first tasks MUST set up that structure
   - **Bad**: "Implement user feature"
   - **Good**: "Create `src/repositories/UserRepository.ts` interface first, then implementation"

2. **Specific File Paths Required**:
   - **Bad**: "Create a user profile component"
   - **Good**: "Create `src/components/user/UserProfile.tsx`. Export as default"

3. **Technical Constraints**:
   - **Bad**: "Add validation"
   - **Good**: "Use `zod` schema in `src/schemas/user.ts`. Integrate with `react-hook-form`"

4. **Respect Existing Architecture**:
   - If project uses `services/` folder for API calls, don't put `fetch` calls in components
   - If project uses `shadcn/ui`, instruct to use those primitives, not raw HTML

5. **Draft Tasks**: Create tasks using the Task Format Reference below

6. **Save to**: `.clavix/outputs/{project-name}/tasks.md`

---

## Task Format Reference

**You must generate `tasks.md` using this exact format:**

```markdown
# Implementation Plan

**Project**: {project-name}
**Generated**: {ISO timestamp}

## Technical Context & Standards

*Detected Stack & Patterns*
- **Architecture**: {e.g., Feature-Sliced Design, Monolith}
- **Framework**: {e.g., Next.js 14 App Router}
- **Styling**: {e.g., Tailwind CSS + shadcn/ui}
- **State**: {e.g., Zustand (stores in /src/store)}
- **API**: {e.g., Server Actions + Prisma}
- **Conventions**: {e.g., "kebab-case files", "Zod for validation"}

---

## Phase 1: {Phase Name}

- [ ] **{Task Title}** (ref: {PRD Section})
  Task ID: phase-1-{name}-01
  > **Implementation**: Create/Edit `{file/path}`.
  > **Details**: {Technical instruction with specifics}

- [ ] **{Next Task Title}**
  Task ID: phase-1-{name}-02
  > **Implementation**: Modify `{file/path}`.
  > **Details**: {Specific logic requirements}

## Phase 2: {Phase Name}

- [ ] **{Task Title}** (ref: {PRD Section})
  Task ID: phase-2-{name}-01
  > **Implementation**: Create `{file/path}`.
  > **Details**: {Technical instruction}

---

*Generated by Clavix /clavix-plan*
```

### Task ID Format

**Pattern**: `phase-{phase-number}-{sanitized-phase-name}-{task-counter}`

Examples:
- `phase-1-setup-01`
- `phase-2-auth-03`
- `phase-3-testing-02`

### Checklist Rules

- Use `- [ ]` for pending tasks
- Use `- [x]` for completed tasks
- **Implementation Note**: The `> **Implementation**` block is REQUIRED for every task

---

## Granularity Guidelines

| Size | Time Estimate | Example |
|------|---------------|---------|
| Small | 15-30 min | Add form validation to existing component |
| Medium | 30-60 min | Build API endpoint with validation |
| Ideal | 20-40 min | Most tasks should fall here |
| Large | > 1 hr | SPLIT into smaller tasks |

**If task exceeds 40 minutes:** Break into smaller, focused tasks.

**Separation Guidelines:**
- Separate "Backend API" from "Frontend UI" tasks
- Separate "Type Definition" from "Implementation" if complex
- Separate "Create Component" from "Wire Up Routing"

---

## Post-Plan Verification Questions

Before presenting the plan, verify:

1. **Did I detect stack correctly?**
   - Check if referenced libraries exist in package.json
   - Confirm folder structure matches my assumptions

2. **Are file paths correct?**
   - Reference actual existing directories
   - Don't assume directories that don't exist

3. **Is ordering logical?**
   - Database/Schema → API → UI
   - Types → Implementation
   - Core → Features → Polish

---

## After Plan Generation

Present the plan and ask:

> "I've generated a technical implementation plan based on your PRD and existing codebase (detected: {stack}).
>
> **Please Verify**:
> 1. Did I correctly identify the file structure and patterns?
> 2. Are the specific file paths correct?
> 3. Is the order of operations logical (e.g., Database → API → UI)?
>
> Type `/clavix-implement` to start coding, or tell me what to adjust."

**REQUIRED SUB-SKILL**: The generated plan should include this header:

```markdown
> **For Claude:** REQUIRED SUB-SKILL: Use clavix-implement to execute this plan task-by-task.
> After all tasks complete, use clavix-verify to audit implementation against PRD.
```

This ensures the implementation chain is followed completely.

---

## Save Location

Tasks file: `.clavix/outputs/{project}/tasks.md`

---

## Mode Boundaries

**Do:**
- ✓ Analyze existing code structure & patterns
- ✓ Map PRD features to specific technical implementations
- ✓ Define exact file paths and signatures
- ✓ Create "Implementation Notes" for each task
- ✓ Save tasks.md for implementation

**Don't:**
- ✗ Write any implementation code
- ✗ Start implementing features
- ✗ Create actual components
- ✗ Skip codebase analysis
- ✗ Create generic tasks without file paths

---

## Tips for Agents

- **Don't guess**: If you don't see a directory, don't reference it
- **Check imports**: If `src/components/Button` exists, tell the user to reuse it
- **Be pedantic**: Developers prefer "Export interface `User`" over "Create a type"
- **Verify existence**: Don't assume libraries are installed—check package.json

---

## Troubleshooting

### Issue: "I don't know the codebase"
**Cause**: Skipped Phase 1 (Context Analysis)
**Fix**: Run `ls -R` and read `package.json` before generating tasks

### Issue: Tasks are too generic ("Add Auth")
**Cause**: Ignored the "Implementation Note" requirement
**Fix**: Regenerate with: "Refine the plan. Add specific file paths and implementation details to every task"

### Issue: No PRD found
**Fix**: Run `/clavix-prd` first

---

## Next Steps

After task generation, guide user to:

**REQUIRED SUB-SKILL**: Use `clavix-implement` to execute tasks

Do not skip directly to coding. Follow the skill chain:

```
clavix-plan (you are here)
      │
      ▼ REQUIRED
clavix-implement
      │
      ▼ REQUIRED (after all tasks)
clavix-verify
```

- `/clavix-implement` - Start executing tasks
- Review and adjust task priorities as needed
- Manual edit of `.clavix/outputs/{project}/tasks.md` if needed