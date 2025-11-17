# clavix prompts

## Description
Manage saved prompts from fast/deep optimization with list and clear subcommands. View all saved prompts with age warnings, execution status, and storage statistics. Clean up prompts with safety checks and multiple filtering options.

## Subcommands
- `clavix prompts list` – List all saved prompts with metadata
- `clavix prompts clear` – Clear prompts with filtering and safety checks

---

# clavix prompts list

## Description
List all saved prompts with age warnings and storage statistics. Displays prompts grouped by source (fast/deep), shows execution status, age coloring, and provides storage hygiene recommendations.

## Syntax
```
clavix prompts list
```

## Arguments
None

## Flags
None (lists all prompts)

## Inputs
- Saved prompts in `.clavix/outputs/prompts/fast/` and `.clavix/outputs/prompts/deep/`
- Prompt metadata files (`*.json`)

## Outputs
- Prompts grouped by source (Fast Prompts / Deep Prompts)
- Per-prompt information:
  - Execution status (○ NEW / ✓ EXECUTED)
  - Prompt ID
  - Age in days with color coding
  - Age warning labels ([OLD] / [STALE])
  - Original prompt preview (truncated to 50 chars)
- Storage statistics dashboard:
  - Total prompts
  - Breakdown: Fast/Deep count
  - Breakdown: Executed/Pending count
  - Oldest prompt age
- Storage hygiene recommendations:
  - Stale prompt warnings (>30 days)
  - Executed prompt cleanup suggestions (≥10)
  - Total storage warnings (≥20 prompts)

## Status Indicators

### Execution Status
- `○` – **NEW** (not executed yet, pending work)
- `✓` – **EXECUTED** (already used, safe to clean up)

### Age Color Coding
- **Gray** (`Xd`) – Recent prompt (0-7 days old)
- **Yellow** (`Xd`) – Old prompt (8-30 days old)
- **Red** (`Xd`) – Stale prompt (>30 days old)

### Age Warning Labels
- **[OLD]** (yellow) – Prompt is 8-30 days old, consider reviewing relevance
- **[STALE]** (red) – Prompt is >30 days old, likely outdated

## Example Output

```
📋 Saved Prompts (5 total)

Fast Prompts:
  ✓ fast-20250117-143022-a3f2 (2d)
     Create a login page with authentication and val...
  ○ fast-20250115-091530-b8c1 (4d)
     Implement dark mode toggle with system preferen...
  ○ fast-20241220-154500-d2e9 (28d) [OLD]
     Build user profile management feature with imag...

Deep Prompts:
  ✓ deep-20250116-183045-f4a3 (3d)
     Comprehensive user management system with RBAC,...
  ○ deep-20241201-120000-a1b2 (47d) [STALE]
     Refactor authentication module with better erro...

📊 Storage Statistics:

  Total Prompts: 5
  Fast: 3 | Deep: 2
  Executed: 2 | Pending: 3
  Oldest: 47 days

⚠️  1 stale prompts (>30 days old)
   Recommend: clavix prompts clear --stale
```

## Storage Hygiene Recommendations

### Stale Prompts Warning (>30 days)
**Trigger**: Any prompts older than 30 days

**Message**: `⚠️  X stale prompts (>30 days old)`

**Recommended Action**: `clavix prompts clear --stale`

**Why**: Prompts this old are likely no longer relevant to current work.

### Executed Prompts Suggestion (≥10)
**Trigger**: 10 or more executed prompts

**Message**: `💡 X executed prompts`

**Recommended Action**: `clavix prompts clear --executed`

**Why**: Executed prompts are already used and safe to remove.

### Storage Limit Warning (≥20)
**Trigger**: Total prompt count reaches or exceeds 20

**Message**: `⚠️  Storage approaching limit (X/recommended 20)`

**Recommended Action**: `clavix prompts clear`

**Why**: Too many prompts make navigation slow and storage bloated.

## Common Messages
- `📋 Saved Prompts (X total)` – Header with total count
- `No prompts saved yet.` – Empty state message
- `Generate an optimized prompt: /clavix:fast "your requirement"` – Empty state suggestion
- `📊 Storage Statistics:` – Dashboard header
- Storage recommendations (see above)

## Troubleshooting

### Issue: No prompts listed
**Symptoms**: "No prompts saved yet."

**Cause**: Never generated any optimized prompts

**Solution**:
```bash
clavix fast "your requirement"
# or
clavix deep "your requirement"
```

### Issue: Age warnings on important prompts
**Symptoms**: Old/stale labels on prompts you still need

**Cause**: Prompts are time-based, not usage-based

**Solution**: This is informational, not blocking
- Execute the prompt if still relevant: `clavix execute --id <prompt-id>`
- Regenerate with updated context: `clavix fast "updated requirement"`
- Clear only truly outdated prompts: Manual review during `clavix prompts clear`

---

# clavix prompts clear

## Description
Clear saved prompts with safety checks and multiple filtering options. Supports interactive mode, automatic filtering (executed/stale/old/fast/deep/all), and forced deletion without confirmation.

## Syntax
```
clavix prompts clear [options]
```

## Arguments
None (uses flags for filtering)

## Flags
- `--fast` – Clear all fast prompts
- `--deep` – Clear all deep prompts
- `--executed` – Clear executed prompts only (safe)
- `--stale` – Clear stale prompts (>30 days old)
- `--all` – Clear all prompts (with confirmation)
- `--force` – Skip confirmation prompts

## Inputs
- Saved prompts in `.clavix/outputs/prompts/`
- Prompt metadata for filtering
- User confirmation (unless `--force` used)

## Outputs
- List of prompts to be deleted (preview)
- Deletion confirmation prompt (unless `--force`)
- Unexecuted prompt warning (if applicable)
- Deletion count (`✓ Deleted X prompt(s)`)
- Remaining storage statistics

## Filter Combinations

### Safe Cleanup (Recommended)
```bash
# Clear executed prompts only (completely safe)
clavix prompts clear --executed
```
Removes only prompts already used. No risk of losing pending work.

### Stale Cleanup
```bash
# Clear prompts older than 30 days
clavix prompts clear --stale
```
Prompts this old are likely outdated. Warns if any are unexecuted.

### Source-Specific Cleanup
```bash
# Clear all fast prompts
clavix prompts clear --fast

# Clear all deep prompts
clavix prompts clear --deep
```
Removes prompts by optimization source. Useful when switching strategies.

### Old Prompt Cleanup (Interactive)
```bash
# Clear prompts >7 days old (interactive mode only)
clavix prompts clear
# Select "Old prompts (>7 days old)" from menu
```
Available only in interactive mode.

### Nuclear Option (Dangerous)
```bash
# Clear ALL prompts with confirmation
clavix prompts clear --all

# Clear ALL prompts without confirmation (USE WITH CAUTION)
clavix prompts clear --all --force
```
Removes everything. Cannot be undone.

## Interactive Mode

When run without flags, displays interactive menu:

```
📋 Clear Saved Prompts

What would you like to clear?
  Executed prompts only (safe)
  Stale prompts (>30 days old)
  Old prompts (>7 days old)
  Fast prompts only
  Deep prompts only
  All prompts (dangerous)
  Cancel
```

**Flow**:
1. Select deletion criteria
2. Command shows preview of matching prompts (first 5 + count)
3. Confirms deletion count
4. Deletes and shows remaining stats

## Safety Mechanisms

### Unexecuted Prompt Warning
**Trigger**: Deleting any unexecuted (NEW) prompts without `--force`

**Behavior**:
```
⚠️  Warning: 3 unexecuted prompts will be deleted

Delete unexecuted prompts? (y/N)
```

**Purpose**: Prevent accidental loss of pending work

**Override**: Use `--force` flag to skip

### All Prompts Confirmation
**Trigger**: Using `--all` flag without `--force`

**Behavior**:
```
Delete ALL prompts? This cannot be undone. (y/N)
```

**Purpose**: Extra safety for destructive operation

**Override**: Use `--force` flag to skip

### No Matches Found
**Trigger**: Filter criteria match zero prompts

**Behavior**:
```
⚠️  No prompts match the specified criteria
```

**Purpose**: Prevent confusion when filters return empty results

## Examples

### Safe Executed Cleanup
```bash
clavix prompts clear --executed
```
**Preview**:
```
📋 Prompts to Delete (2):

  ✓ [fast] fast-20250117-143022-a3f2 (2d ago)
     Create a login page with authentication and val...
  ✓ [deep] deep-20250116-183045-f4a3 (3d ago)
     Comprehensive user management system with RBAC,...

✓ Deleted 2 prompt(s)

Remaining prompts: 3
  Fast: 2 | Deep: 1
  Executed: 0 | Pending: 3
```

### Stale Cleanup with Warning
```bash
clavix prompts clear --stale
```
**Preview with unexecuted**:
```
📋 Prompts to Delete (1):

  ○ [deep] deep-20241201-120000-a1b2 (47d ago)
     Refactor authentication module with better erro...

⚠️  Warning: 1 unexecuted prompts will be deleted

Delete unexecuted prompts? (y/N)
```

### Force Deletion (No Confirmation)
```bash
clavix prompts clear --executed --force
```
Deletes immediately without prompts.

### Interactive Full Workflow
```bash
clavix prompts clear
```
**Menu** → Select "Stale prompts (>30 days old)" → **Preview** → **Confirm** → **Deleted**

## Common Messages

### Success Messages
- `✓ Deleted X prompt(s)` – Deletion successful
- `Remaining prompts: X` – Shows what's left after cleanup
- Remaining stats breakdown (Fast/Deep, Executed/Pending)

### Warning Messages
- `⚠️  Warning: X unexecuted prompts will be deleted` – Safety check
- `⚠️  No prompts match the specified criteria` – Empty filter result
- `Delete ALL prompts? This cannot be undone.` – All-deletion warning

### Info Messages
- `Cancelled. No prompts were deleted.` – User cancelled operation
- `All prompts cleared.` – Complete wipe confirmation

## Troubleshooting

### Issue: No prompts match criteria
**Symptoms**: `⚠️  No prompts match the specified criteria`

**Cause**: Filter too restrictive or already cleaned

**Solution**:
1. Check current prompts: `clavix prompts list`
2. Verify filter flags match prompt types
3. Already cleaned? No action needed.

### Issue: Can't delete unexecuted prompts
**Symptoms**: Confirmation prompt blocks deletion

**Cause**: Safety mechanism preventing work loss

**Solution** (choose one):
1. **Recommended**: Review prompts, execute important ones first
   ```bash
   clavix prompts list
   clavix execute --id <important-prompt-id>
   clavix prompts clear --executed
   ```
2. **Force deletion** (loses unexecuted work):
   ```bash
   clavix prompts clear --stale --force
   ```

### Issue: Accidentally deleted prompts
**Symptoms**: Needed prompt is gone

**Cause**: Irreversible deletion

**Solution**: No recovery mechanism exists
- Regenerate prompt:
  ```bash
  clavix fast "recreate requirement"
  clavix deep "recreate requirement"
  ```
- Prevention: Review preview before confirming deletion
- Use `--executed` flag for safer cleanup

### Issue: Interactive mode not showing option
**Symptoms**: "Old prompts (>7 days old)" not in CLI flags

**Cause**: Option exists only in interactive mode

**Solution**:
1. Run without flags: `clavix prompts clear`
2. Select "Old prompts (>7 days old)" from menu
3. OR use `--stale` for >30 days programmatically

## Storage Statistics After Cleanup

After deletion, command shows remaining storage:

```
Remaining prompts: 3
  Fast: 2 | Deep: 1
  Executed: 0 | Pending: 3
```

**Fields**:
- **Remaining prompts**: Total count after deletion
- **Fast / Deep**: Breakdown by source
- **Executed / Pending**: Breakdown by status

**All cleared**:
```
All prompts cleared.
```

## Best Practices

### Regular Cleanup Schedule
```bash
# After completing implementation
clavix prompts clear --executed

# Monthly maintenance
clavix prompts clear --stale

# Check storage health
clavix prompts list
```

### Safe Cleanup Workflow
1. List prompts: `clavix prompts list`
2. Execute needed prompts: `clavix execute --id <id>`
3. Clear executed: `clavix prompts clear --executed`
4. Review stale: Decide which to regenerate vs delete
5. Clear stale: `clavix prompts clear --stale`

### Pre-Cleanup Checklist
- [ ] Reviewed prompt list
- [ ] Executed all needed prompts
- [ ] Verified no pending work will be lost
- [ ] Using appropriate filter (not `--all`)
- [ ] Ready to confirm deletion

## Related Commands
- `clavix prompts list` – View prompts before clearing
- `clavix execute` – Execute prompts before deletion
- `clavix fast` / `clavix deep` – Regenerate prompts after cleanup

## Next Steps
After cleaning prompts:
1. Generate fresh prompts for current work: `clavix fast "new requirement"`
2. Keep storage lean with periodic `--executed` cleanup
3. Review `clavix prompts list` regularly for hygiene
