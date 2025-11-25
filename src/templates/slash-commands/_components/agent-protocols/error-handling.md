## Error Classification for Agents

Errors are classified into three categories based on required agent response.

### RECOVERABLE Errors

Agent can fix automatically without user intervention.

| Error | Detection | Recovery Action |
|-------|-----------|-----------------|
| Directory missing | ENOENT on .clavix/ | Create directory, continue |
| Index file missing | ENOENT on .index.json | Initialize empty index, continue |
| Empty prompts directory | No files in prompts/ | Inform user "No prompts saved yet" |
| Stale config | timestamp > 7 days | Warn user, continue normally |
| Missing session | Session ID not found | Create new session |

**Recovery Protocol:**
```
IF error is RECOVERABLE:
  → FIX: Apply recovery action automatically
  → LOG: Note what was fixed
  → CONTINUE: Resume workflow
```

### BLOCKING Errors

Agent must stop and ask user before proceeding.

| Error | Detection | Agent Action |
|-------|-----------|--------------|
| Task not found | task-complete returns "not found" | ASK: "Task [id] not found in tasks.md. Verify the task ID?" |
| Multiple PRDs | >1 project detected | ASK: "Multiple projects found: [list]. Which one?" |
| Ambiguous intent | confidence <50% | ASK: "Unclear intent. Is this: [A] / [B] / [C]?" |
| Missing PRD for plan | No PRD files exist | ASK: "No PRD found. Create one with /clavix:prd first?" |
| Task blocked | External dependency | ASK: "Task blocked by [reason]. Skip or resolve?" |
| Overwrite conflict | File already exists | ASK: "File exists. Overwrite / Rename / Cancel?" |

**Blocking Protocol:**
```
IF error is BLOCKING:
  → STOP: Halt current operation
  → EXPLAIN: Clear description of the issue
  → OPTIONS: Present available choices
  → WAIT: For user response before continuing
```

### UNRECOVERABLE Errors

Agent must stop completely and report to user for manual resolution.

| Error | Detection | Agent Action |
|-------|-----------|--------------|
| Permission denied | EACCES error code | STOP. Report: "Permission denied on [path]. Check file permissions." |
| Corrupt JSON | JSON.parse throws | STOP. Report: "Config file corrupted at [path]. Manual fix required." |
| Git conflict | git command fails with conflict | STOP. Report: "Git conflict detected. Resolve manually before continuing." |
| Disk full | ENOSPC error | STOP. Report: "Disk full. Free up space before continuing." |
| Network timeout | ETIMEDOUT on external | STOP. Report: "Network timeout. Check connection and retry." |
| Invalid task ID format | Regex mismatch | STOP. Report: "Invalid task ID format: [id]. Expected: phase-N-name-M" |

**Unrecoverable Protocol:**
```
IF error is UNRECOVERABLE:
  → STOP: Halt all operations immediately
  → REPORT: Exact error with context
  → GUIDE: Manual steps to resolve
  → NO RETRY: Do not attempt automatic recovery
```

### Error Response Templates

**Recoverable:**
```
[Fixed] Created missing .clavix/ directory. Continuing...
```

**Blocking:**
```
[Blocked] Multiple projects found. Please select:
  1. auth-feature (75% complete)
  2. api-refactor (0% complete)

Which project should I work with?
```

**Unrecoverable:**
```
[Error] Cannot continue - manual intervention required.

Issue: Permission denied writing to /path/to/file
Cause: Insufficient file system permissions

To resolve:
  1. Check ownership: ls -la /path/to/
  2. Fix permissions: chmod 755 /path/to/
  3. Retry the operation

Once resolved, run the command again.
```

### Error Detection Patterns

**File System Errors:**
- `ENOENT` - File/directory not found → Usually RECOVERABLE
- `EACCES` - Permission denied → UNRECOVERABLE
- `EEXIST` - Already exists → BLOCKING (ask overwrite)
- `ENOSPC` - No space left → UNRECOVERABLE

**Git Errors:**
- "CONFLICT" in output → UNRECOVERABLE
- "not a git repository" → BLOCKING (ask to init)
- "nothing to commit" → RECOVERABLE (skip commit)

**JSON Errors:**
- `SyntaxError: Unexpected token` → UNRECOVERABLE
- Empty file → RECOVERABLE (initialize default)

**Task Errors:**
- Task ID not in tasks.md → BLOCKING
- Checkbox already checked → RECOVERABLE (skip)
- Invalid phase number → UNRECOVERABLE
