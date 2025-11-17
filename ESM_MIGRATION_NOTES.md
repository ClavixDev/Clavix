# ESM Migration Notes v2.8.0

## Phase 6: Task Generator Fix - COMPLETED ✓

### Analysis Summary
**Root Cause**: Task generator was creating excessive tasks (401 tasks in 80 phases)
- Every PRD bullet became a separate phase
- Nested bullets treated as independent features
- Fixed 5-task boilerplate applied to all features
- No hierarchical parsing or grouping logic

### Implemented Fixes

#### 1. Hierarchical PRD Parsing ✓
**File**: `src/core/task-manager.ts:extractListItems()`

- Changed from flat regex to line-by-line parsing
- Only extracts top-level bullets (no indentation)
- Ignores nested bullets (sub-details, requirements, constraints)
- Skips code blocks to avoid parsing examples as tasks
- Added filters for:
  - Code/file paths (`.ts`, `import`, `require()`)
  - Implementation details (`must`, `should`, `required`)
  - Short constraints (< 25 chars)
  - Technical specifics (passwords, tokens, sessions)

**Result**: 72 top-level features extracted instead of ~400 bullets

#### 2. Context-Aware Task Templates ✓
**File**: `src/core/task-manager.ts:buildFeatureTaskDescriptions()`

Replaced fixed 5-task boilerplate with intelligent templates:

| Feature Type | Template | Example |
|--------------|----------|---------|
| Configuration | 1 task | Update tsconfig.json for ESM |
| Documentation | 1 task | Update CHANGELOG.md |
| Testing | 2 tasks | Implement + Verify passes |
| Conversion | 2 tasks | Convert + Test works |
| Default | 2 tasks | Implement + Add tests |

**Old behavior**: Every feature → 5 tasks (implement, test, integrate, document, validate)
**New behavior**: Context-aware task count (1-2 tasks typical)

**Result**: ~50% reduction in task count for same features

#### 3. Task Grouping by Category ✓
**File**: `src/core/task-manager.ts:groupFeaturesByCategory()`

Instead of "1 bullet = 1 phase", features are grouped into logical categories:

- **Configuration & Setup**: Config files, dependencies, environment
- **Core Implementation**: Main features and functionality
- **Testing & Validation**: Test suites, QA, verification
- **Documentation**: README, CHANGELOG, guides
- **Integration & Release**: Build, deploy, publish

**Result**: 5 logical phases instead of 80 arbitrary phases

#### 4. Granularity Controls ✓
**File**: `src/core/task-manager.ts:generatePhasesFromCoreFeatures()`

Added warnings and validation:
- Warn if > 50 top-level features in PRD
- Warn if > 50 total tasks generated
- Skip empty phases
- Filter implementation details

**Result**: Better feedback when PRDs are too detailed

### Test Results

#### Validation Test: Authentication PRD
**Before fix**: 31 tasks in 3 phases
**After fix**: 15 tasks in 2 phases (52% reduction)

Improvements:
- Ignored nested constraints ("Password must be 8+ characters")
- Grouped features by category (Core vs QA)
- Applied context-aware templates (config=1 task, features=2 tasks)

#### Full Test Suite
**Status**: ✅ All 1581 tests pass
**No regressions**: Existing functionality preserved

### Impact on ESM Migration

When this fix is applied to the actual ESM Migration PRD:
- **Current (manual)**: ~34 tasks in 8 phases (optimal)
- **Old generator**: 401 tasks in 80 phases (unusable)
- **New generator**: Expected 20-30 tasks in 5-8 phases (usable)

### Files Modified

1. `src/core/task-manager.ts`:
   - Line 263-361: Hierarchical parsing with filters
   - Line 220-323: Feature grouping and category logic
   - Line 415-461: Context-aware task templates
   - Added methods: `looksLikeCodeOrPath()`, `looksLikeImplementationDetail()`, `groupFeaturesByCategory()`

2. No changes to:
   - CLI commands
   - Tests (all pass)
   - Templates
   - Configuration files

### Documentation Updates Needed

1. **Code comments**: ✅ Added inline documentation
2. **Algorithm documentation**: ✅ Documented in this file
3. **User-facing docs**: ⏳ TODO - Update `/clavix:plan` template

### Next Steps (Not in Phase 6 scope)

- Consider adding CLI flag `--granularity` to control task detail level
- Add PRD linting to warn about over-detailed specifications
- Consider supporting custom category definitions via config
