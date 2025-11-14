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

5. **List Archived Projects**:
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

✅ **Good times to archive**:
- All implementation tasks are completed (`tasks.md` shows 100%)
- Project has been deployed/shipped to production
- Feature is complete and no more work planned
- User explicitly requests archival
- Old/abandoned projects that won't be continued

❌ **Don't archive when**:
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

## Tips

- Archive keeps your active projects list clean and focused
- Archived projects maintain all their data (nothing is deleted)
- Archive is searchable - you can still `grep` or find files in archive/
- Regular archiving improves `/clavix:plan` and `/clavix:implement` performance
- Use `--list` regularly to know what's been archived
