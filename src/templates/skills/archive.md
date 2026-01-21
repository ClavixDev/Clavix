---
name: clavix-archive
description: Archive completed projects by moving outputs to archive directory
license: Apache-2.0
---

# Clavix Archive Skill

Done with a project? Move it to the archive to keep your workspace tidy. You can always restore it later if needed.

## What This Skill Does

1. **Find your completed projects** - Look for 100% done PRDs
2. **Ask which to archive** - You pick, or archive all completed ones
3. **Move to archive folder** - Out of the way but not deleted
4. **Track everything** - So you can restore later if needed

**Your work is never deleted, just organized.**

---

## State Assertion (REQUIRED)

**Before ANY action, output:**

```
**CLAVIX MODE: Archival**
Mode: management
Purpose: Organizing completed projects
Implementation: BLOCKED (file operations only)
```

---

## Self-Correction Protocol

**DETECT**: If you find yourself doing any of these 6 mistake types:

| Type | What It Looks Like |
|------|--------------------|
| 1. Deleting Without Confirmation | Removing files without explicit user confirmation |
| 2. Archiving Incomplete Projects | Moving projects without warning about unchecked tasks |
| 3. Wrong Directory Operations | Operating on wrong project directory |
| 4. Skipping Safety Checks | Not verifying project exists before operations |
| 5. Silent Failures | Not reporting when operations fail |
| 6. Capability Hallucination | Claiming Clavix can do things it cannot |

**STOP**: Immediately halt the incorrect action

**CORRECT**: Output:
"I apologize - I was [describe mistake]. Let me return to the archive workflow."

**RESUME**: Return to the archive workflow with correct approach.

---

## Archive vs Delete Decision Tree

**CRITICAL: Use this decision tree before any destructive action**

```
Is this a failed experiment with no learning value? → DELETE
Is this a duplicate/test project with no unique info? → DELETE
Might you need to reference this code later? → ARCHIVE
Could this be useful for learning/reference? → ARCHIVE
Are you unsure? → ARCHIVE (safe default)
```

**Remember: Archive is free, disk space is cheap, regret is expensive.**

---

## Phase 1: Completion Detection

### Read Task Status

1. Read `tasks.md` file from the project
2. Count completed vs total tasks
3. Calculate completion percentage

```
📊 Project Status: {project-name}
- Completed: 8/10 tasks
- Percentage: 80%
```

### If Incomplete Tasks Exist

```
⚠️ Project has {N} incomplete tasks:
- [ ] Task 3.2: Add error handling
- [ ] Task 3.3: Write tests

Do you want to:
1. Complete tasks first with `/clavix-implement`
2. Archive anyway (tasks remain incomplete but archived)
3. Cancel archival
```

**Require explicit confirmation for incomplete projects.**

---

## Phase 2: Archive Operations

### Tools Used (Agentic-First)

| Tool | Purpose |
|------|---------|
| **Read** | Read tasks.md and check completion status |
| **Bash/mv** | Move directories |
| **Bash/rm** | Delete directories (only with confirmation) |
| **Glob/List** | List projects and archive contents |

### Operation: Archive Project

1. Verify project exists in `.clavix/outputs/`
2. Check task completion status
3. Move directory:
   ```bash
   mv .clavix/outputs/<project> .clavix/outputs/archive/<project>
   ```
4. Verify move completed

### Operation: Interactive Selection

When multiple projects exist:

```
📦 Projects available:
1. user-authentication (100% complete) ✅
2. payment-integration (75% complete) ⚠️
3. dashboard-redesign (0% complete) ❌

Which project(s) to archive? [Enter number(s)]
```

### Operation: Delete Project (Destructive)

**WARNING: This PERMANENTLY deletes the project. Cannot be restored.**

**Safety Confirmation Required:**

1. Show project details and task status:
   ```
   🗑️ DELETE: {project-name}
   - Tasks: {completed}/{total}
   - Files: {list files to be deleted}
   - Location: .clavix/outputs/{project}/
   
   ⚠️ This action is PERMANENT and cannot be undone.
   ```

2. Ask user to type project name to confirm:
   ```
   Type the project name "{project-name}" to confirm deletion:
   ```

3. Only proceed if exact match

4. Execute:
   ```bash
   rm -rf .clavix/outputs/<project>
   ```

### Operation: Restore from Archive

Move project back from archive:

```bash
mv .clavix/outputs/archive/<project> .clavix/outputs/<project>
```

Handle name conflicts:
- If project already exists in active outputs, ask user:
  1. Archive the active project first, then restore
  2. Keep both (manual rename required)
  3. Cancel restoration

---

## Phase 3: Verification

After every operation:

1. **Confirm success**: Verify the operation completed
2. **Show new location**: For archives, show destination path
3. **List related files**: Note any cleanup needed

```
✅ Archive Complete

Project: user-authentication
From: .clavix/outputs/user-authentication/
To: .clavix/outputs/archive/user-authentication/

Files archived:
- full-prd.md
- quick-prd.md
- tasks.md
- .clavix-implement-config.json
```

---

## Prompts Are Separate

Optimized prompts from `/clavix-improve` are stored in `.clavix/outputs/prompts/`.

**Prompts have independent lifecycle from PRD projects.**

### Prompt Cleanup Options

```
📝 Found {N} saved prompts:
- std-20240110-143022-a3f2.md (executed)
- std-20240111-091534-b7c1.md (executed)
- comp-20240112-154623-d4e5.md (not executed)

Options:
1. Delete executed prompts only
2. Delete prompts older than 30 days
3. Keep all prompts
4. Delete specific prompts
```

Offer prompt cleanup separately from project archival.

---

## Post-Archive Next Steps

After archiving, ask:

```
What would you like to do next?

1. Start a new project with `/clavix-prd`
2. Archive another completed project
3. Review archived projects
4. Return to something else
```

---

## Archive Size Management

**Proactive maintenance to prevent archive bloat:**

### When to Clean Up

- Archive exceeds 50 projects or 100MB
- Projects older than 12 months that haven't been referenced
- Duplicate or superseded projects
- Failed experiments with no learning value

### Size Check

```bash
# Count archived projects
ls .clavix/outputs/archive/ | wc -l

# Check total archive size
du -sh .clavix/outputs/archive/
```

### Retention Recommendations

| Project Type | Keep For | Then |
|--------------|----------|------|
| Completed features | Indefinitely | Archive forever (reference value) |
| Failed experiments | 30 days | Delete if no learning value |
| Superseded versions | 90 days | Delete if newer version exists |
| Test/demo projects | 7 days | Delete unless documenting patterns |

---

## Mode Boundaries

**What I'll do:**
- ✓ Find projects ready for archive
- ✓ Show you what's complete (100% tasks done)
- ✓ Move projects to archive when you confirm
- ✓ Track everything so you can restore later
- ✓ Warn about incomplete tasks
- ✓ Offer cleanup for executed prompts

**What I won't do:**
- ✗ Delete anything without explicit confirmation
- ✗ Archive projects you're still working on (without warning)
- ✗ Make decisions for you - you pick what to archive
- ✗ Remove files outside `.clavix/` directory

---

## Troubleshooting

### Issue: No projects available to archive
**Solution**: Check `.clavix/outputs/archive/` for archived projects, or create new with `/clavix-prd`

### Issue: Name conflict during restore
**Solution**: Archive the active project first, or rename one manually

### Issue: Accidentally deleted project
**Solution**: Check git history or IDE local history. Prevention: Use ARCHIVE by default.

### Issue: Archive directory too large
**Solution**: Review contents, delete obsolete projects, consider external backup.

---

## Workflow Navigation

**You are here:** Archive (Project Cleanup)

**Related commands:**
- `/clavix-implement` - Complete tasks before archiving
- `/clavix-plan` - Review task completion status
- `/clavix-prd` - Start new project after archiving
