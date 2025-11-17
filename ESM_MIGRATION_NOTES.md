# ESM Migration Known Issues

## Jest ESM Mock Hoisting Limitations

**Status**: 9 test files failing (120 tests out of 1,516)
**Pass Rate**: 92% (1396/1516 tests passing)

### Root Cause
Jest's `jest.mock()` hoisting doesn't work reliably with ESM modules. When using `preset: 'ts-jest/presets/default-esm'`, module-level `jest.mock()` calls execute after imports are resolved, causing mocks to not be applied.

### Affected Test Files
1. `tests/core/prompt-manager.test.ts` - Uses mocked `uuid.v4()`
2. `tests/core/git-manager.test.ts`
3. `tests/core/agent-manager.test.ts`
4. `tests/cli/prd.test.ts` - Uses mocked `inquirer` and `chalk`
5. `tests/cli/list-filter.test.ts`
6. `tests/cli/show-session.test.ts`
7. `tests/cli/start-session.test.ts`
8. `tests/core/doc-injector-extended.test.ts`
9. `tests/types/errors-extended.test.ts`

### Solutions (Post-v2.8.0)
1. **Refactor tests** to not rely on mocked dependencies
2. **Use vitest** instead of Jest (native ESM support with better mocking)
3. **Use manual mocks** via `__mocks__` directory
4. **Use dependency injection** in source code to avoid needing mocks

### Current Workaround
These tests are marked as TODO and documented here. Core ESM functionality works correctly - the issue is purely with test mocking.

### Reference
- Jest ESM Support: https://jestjs.io/docs/ecmascript-modules
- Known limitation: https://github.com/jestjs/jest/issues/10025
