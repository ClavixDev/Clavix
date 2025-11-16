---
name: "Clavix: Archive"
description: Archive completed PRD projects
---

# Clavix Archive - PRD Project Archival

You are helping the user archive completed PRD projects to keep their workspace organized.

## Instructions

1. **Understanding Archive**:
   - Archives move completed PRD projects from `.clavix/outputs/` to `.clavix/outputs/archive/`
   - Archived projects are no longer shown in active project lists
   - Projects can be restored from archive if needed
   - Only projects with all tasks completed should typically be archived

2. **Interactive Archive Mode**:
   ```bash
   clavix archive
   ```

   This will:
   - List all PRD projects with 100% tasks completed
   - Allow user to select which project to archive
   - Confirm before archiving
   - Move the project to archive directory

3. **Archive Specific Project**:
   ```bash
   clavix archive [project-name]
   ```

   This will:
   - Check task completion status
   - Warn if tasks are incomplete
   - Ask for confirmation
   - Archive the specific project

4. **Force Archive (Incomplete Tasks)**:
   ```bash
   clavix archive [project-name] --force
   ```

   Use this when:
   - Project scope changed and some tasks are no longer relevant
   - User wants to archive work-in-progress
   - Tasks are incomplete but project is done

5. **Delete Project (Permanent Removal)**: **DESTRUCTIVE ACTION**
   ```bash
   clavix archive [project-name] --delete
   ```

   **WARNING**: This PERMANENTLY deletes the project. Cannot be restored.

   **When to delete vs archive:**
   - **DELETE**: Failed experiments, duplicate projects, test/demo data, abandoned prototypes with no value
   - **ARCHIVE**: Completed work, incomplete but potentially useful work, anything you might reference later

   **Delete decision tree:**
   ```
   Is this a failed experiment with no learning value? → DELETE
   Is this a duplicate/test project with no unique info? → DELETE
   Might you need to reference this code later? → ARCHIVE
   Could this be useful for learning/reference? → ARCHIVE
   Are you unsure? → ARCHIVE (safe default)
   ```

   **Safety confirmation required:**
   - Shows project details and task status
   - Requires typing project name to confirm
   - Warns about permanent deletion
   - Lists what will be permanently deleted

6. **List Archived Projects**:
   ```bash
   clavix archive --list
   ```

   Shows all projects currently in archive with their task completion status

6. **Restore from Archive**:
   ```bash
   clavix archive --restore [project-name]
   ```

   Moves a project back from archive to active outputs

## When to Archive

**Good times to archive:**
- All implementation tasks are completed (`tasks.md` shows 100%)
- Project has been deployed/shipped to production
- Feature is complete and no more work planned
- User explicitly requests archival
- Old/abandoned projects that won't be continued

**Don't archive when:**
- Tasks are still in progress (unless using --force)
- Project is actively being worked on
- Future enhancements are planned in current tasks

## Archive Behavior

**What gets archived:**
- The entire PRD project folder
- All files: PRD.md, PRD-quick.md, tasks.md, .clavix-implement-config.json
- Complete directory structure preserved

**Where it goes:**
- From: `.clavix/outputs/[project-name]/`
- To: `.clavix/outputs/archive/[project-name]/`

**What changes:**
- Archived projects won't show in `/clavix:plan` searches
- Archived projects won't show in `/clavix:implement` searches
- They're still accessible in archive directory
- Can be restored at any time

## Example Workflows

### Workflow 1: Complete Project
```
User: "I've finished implementing the user authentication feature"
You: "Great! Let me help you archive it."

     Run: clavix archive

User selects: user-authentication-system
System shows: All 15 tasks completed (100%)
User confirms: Yes, archive it

Result: Project moved to .clavix/outputs/archive/user-authentication-system/
```

### Workflow 2: Force Archive WIP
```
User: "We're pivoting, I want to archive the old API design even though tasks aren't done"
You: "I'll archive it with --force"

     Run: clavix archive old-api-design --force

System shows: 8 incomplete tasks
User confirms: Yes, archive anyway

Result: Project archived despite incomplete tasks
```

### Workflow 3: Restore Archived Project
```
User: "Actually, we need to revisit that authentication feature"
You: "I'll restore it from the archive"

     Run: clavix archive --restore user-authentication-system

Result: Project moved back to .clavix/outputs/user-authentication-system/
```

### Workflow 4: Delete Failed Experiment
```
User: "I have a test project 'api-experiment-1' that I don't need anymore"
You: "Is this something you might reference later, or can it be permanently deleted?"

User: "It was just a quick test, no value. Delete it."
You: "This will permanently delete the project. I'll run the delete command."

     Run: clavix archive api-experiment-1 --delete

System shows:
  Project: api-experiment-1
  Tasks: 3/5 completed
  Files: full-prd.md, quick-prd.md, tasks.md

  WARNING: This action is PERMANENT and CANNOT be undone.
  Type the project name to confirm deletion: _

User types: api-experiment-1

Result: Project permanently deleted from .clavix/outputs/api-experiment-1/
```

## AI Agent Guidelines

When user mentions archiving or cleaning up projects:

1. **Check completion status first**:
   - Run `clavix archive` to see archivable projects
   - Review task completion percentages
   - Suggest archiving only completed projects

2. **Confirm before archiving**:
   - Always confirm which project to archive
   - Mention the archive location
   - Explain that it can be restored

3. **Use --force cautiously**:
   - Only when user explicitly wants to archive incomplete work
   - Explain which tasks will remain incomplete
   - Confirm they won't lose data (just moving location)

4. **Suggest restoration**:
   - If user mentions old work, check archive
   - Use `clavix archive --list` to show what's archived
   - Offer to restore if needed

5. **Handle delete requests carefully**:
   - Always ask if they want to delete or archive
   - Explain that delete is permanent and irreversible
   - Suggest archive as the safer default
   - Use decision tree to help user decide
   - Only proceed with `--delete` after clear confirmation
   - Double-check it's truly no-value content (failed experiments, duplicates)

## Workflow Navigation

**You are here:** Archive (Project Cleanup)

**Common workflows:**
- **Complete workflow**: `/clavix:implement` → [all tasks done] → `/clavix:archive` → Clean workspace
- **Review and archive**: `/clavix:archive` → [select completed project] → Archive
- **Restore old work**: `/clavix:archive --list` → `/clavix:archive --restore [project]` → Resume

**Related commands:**
- `/clavix:implement` - Complete remaining tasks before archiving
- `/clavix:plan` - Review task completion status
- `/clavix:prd` - Start new project after archiving old one

## Tips

- Archive keeps your active projects list clean and focused
- Archived projects maintain all their data (nothing is deleted)
- Archive is searchable - you can still `grep` or find files in archive/
- Regular archiving improves `/clavix:plan` and `/clavix:implement` performance
- Use `--list` regularly to know what's been archived

## Troubleshooting

### Issue: No projects available to archive
**Cause**: No projects in `.clavix/outputs/` OR all already archived
**Solution**:
- Run `clavix archive --list` to see archived projects
- Check `.clavix/outputs/` for active projects
- If none exist, no action needed

### Issue: Trying to archive project with incomplete tasks
**Cause**: User wants to archive but tasks aren't 100% done
**Solution** (inline):
- Warn: "Project has X incomplete tasks. Archive anyway?"
- Show which tasks are incomplete
- Suggest `--force` flag if user confirms
- Recommend completing tasks first if they're actually unfinished (not scope-changed)

### Issue: Cannot restore archived project (name conflict)
**Cause**: Project with same name already exists in active outputs
**Solution**:
- Error: "Project '[name]' already exists in active outputs"
- Suggest renaming one of them
- Or archive the active one first, then restore
- Or restore to different name (if CLI supports it)

### Issue: Unsure whether to delete or archive
**Cause**: User wants to clean up but uncertain about permanence
**Solution**:
- Use the decision tree in template
- Default recommendation: ARCHIVE (safer)
- Only suggest delete for: duplicates, failed experiments, test data
- Remind: Archive is free, disk space is cheap, regret is expensive

### Issue: Accidentally deleted project (used --delete instead of archive)
**Cause**: User error or misunderstanding of --delete flag
**Solution**:
- Cannot be recovered from Clavix
- Check if git history exists (if code was committed)
- Check if user has backups
- Learn: Use archive by default, delete only when absolutely certain

### Issue: Archive directory getting too large
**Cause**: Many archived projects accumulating
**Solution**:
- Archive is meant to grow - this is normal
- Projects in archive don't affect performance
- If truly concerned: Review archive, delete ancient/irrelevant projects
- Or move very old archives to external backup storage

### Issue: Archived project but forgot what it was about
**Cause**: No naming convention or time passed
**Solution**:
- Read PRD in archived project: `.clavix/outputs/archive/[project]/full-prd.md`
- PRD contains problem, goal, and features
- Consider better naming conventions: date-feature format (e.g., "2024-01-user-auth")
