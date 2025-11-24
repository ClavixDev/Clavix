# Clavix Testing Guidelines

This document provides guidelines for writing tests in the Clavix codebase.

## Quick Start

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- tests/core/session-manager.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="SessionManager"

# Update snapshots
npm test -- --updateSnapshot
```

## Test Structure

```
tests/
├── cli/                  # CLI command tests
├── core/                 # Core module tests
├── adapters/             # Adapter implementation tests
├── contracts/            # API contract tests
├── critical-paths/       # End-to-end workflow tests
├── integration/          # Integration tests
├── snapshots/            # Snapshot tests for output stability
│   └── __snapshots__/    # Auto-generated snapshot files
├── helpers/              # Test utilities and factories
└── e2e/                  # End-to-end CLI tests
```

## Test Naming Conventions

- Test files: `<module-name>.test.ts`
- Describe blocks: Use the class/function name being tested
- Test names: Use `should <expected behavior>` format

```typescript
describe('SessionManager', () => {
  describe('createSession', () => {
    it('should create a new session with unique ID', async () => {
      // ...
    });
  });
});
```

## ESM Mocking Pattern

Clavix uses ES Modules. Mock dependencies using `jest.unstable_mockModule`:

```typescript
import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// 1. Set up mocks BEFORE importing modules that use them
const mockPrompt = jest.fn();
jest.unstable_mockModule('inquirer', () => ({
  default: {
    prompt: mockPrompt,
    Separator: class Separator {
      type = 'separator';
      line?: string;
      constructor(line?: string) { this.line = line; }
    },
  },
}));

// 2. Import modules AFTER setting up mocks (use dynamic imports)
const { ModuleUnderTest } = await import('../../src/module.js');

describe('ModuleUnderTest', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call inquirer prompt', async () => {
    mockPrompt.mockResolvedValueOnce({ answer: 'yes' });

    await ModuleUnderTest.askQuestion();

    expect(mockPrompt).toHaveBeenCalled();
  });
});
```

## Test Types

### Unit Tests (tests/core/, tests/adapters/)

Test individual functions and classes in isolation:

```typescript
import { describe, it, expect } from '@jest/globals';
import { sanitizeId } from '../../src/utils/helpers.js';

describe('sanitizeId', () => {
  it('should convert spaces to hyphens', () => {
    expect(sanitizeId('hello world')).toBe('hello-world');
  });

  it('should handle empty strings', () => {
    expect(sanitizeId('')).toBe('');
  });
});
```

### CLI Command Tests (tests/cli/)

Test CLI commands with proper mocking:

```typescript
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import fs from 'fs-extra';
import path from 'path';

// Mock dependencies
jest.unstable_mockModule('inquirer', () => ({
  default: { prompt: jest.fn() },
}));

const { default: InitCommand } = await import('../../src/cli/commands/init.js');

describe('Init Command', () => {
  const testDir = path.join(__dirname, '../tmp/init-test');

  beforeEach(async () => {
    await fs.ensureDir(testDir);
    process.chdir(testDir);
  });

  afterEach(async () => {
    process.chdir(__dirname);
    await fs.remove(testDir);
  });

  it('should create .clavix directory', async () => {
    // Test implementation
  });
});
```

### Critical Path Tests (tests/critical-paths/)

Test complete workflows from start to finish:

```typescript
describe('Critical Path: Prompt Optimization Flow', () => {
  it('should complete full optimization pipeline', async () => {
    // 1. Create input
    const input = 'Create a login page';

    // 2. Run through pipeline
    const result = await optimizer.optimize(input, 'fast');

    // 3. Verify complete result
    expect(result).toHaveProperty('original', input);
    expect(result).toHaveProperty('enhanced');
    expect(result).toHaveProperty('quality');
  });
});
```

### Snapshot Tests (tests/snapshots/)

Test output stability across versions:

```typescript
import { prepareObjectSnapshot } from '../helpers/snapshot-utils.js';

describe('CLI Command Metadata Snapshots', () => {
  it('should match snapshot', () => {
    const metadata = extractCommandMetadata(FastCommand);
    expect(prepareObjectSnapshot(metadata)).toMatchSnapshot('fast-command-metadata');
  });
});
```

### Contract Tests (tests/contracts/)

Ensure interfaces remain stable:

```typescript
describe('Adapter Interface Contract', () => {
  it('each adapter should have required properties', () => {
    const adapters = agentManager.getAdapters();

    for (const adapter of adapters) {
      expect(adapter.name).toBeDefined();
      expect(adapter.displayName).toBeDefined();
      expect(typeof adapter.generateCommands).toBe('function');
    }
  });
});
```

## Test Helpers

### Snapshot Utils (tests/helpers/snapshot-utils.ts)

```typescript
import {
  sanitizeTimestamps,    // Replace timestamps with placeholders
  normalizePaths,        // Make paths platform-independent
  sanitizeIds,           // Replace UUIDs with placeholders
  sanitizeForSnapshot,   // Combine all sanitizers
  prepareObjectSnapshot, // Sort keys and sanitize
} from '../helpers/snapshot-utils.js';
```

### Factories (tests/helpers/factories/)

```typescript
import { createConfig } from '../helpers/factories/config-factory.js';

const config = createConfig({
  integrations: ['claude-code', 'cursor'],
});
```

## Best Practices

### DO:

- Clear mocks in `beforeEach` to prevent test pollution
- Use `afterEach` to clean up test directories
- Test error cases and edge cases
- Use meaningful assertion messages
- Keep tests focused and fast
- Use test fixtures for complex data

### DON'T:

- Don't rely on test execution order
- Don't leave temporary files after tests
- Don't test implementation details
- Don't make tests depend on external services
- Don't skip tests without TODO comments

## Coverage Requirements

The project targets **100% coverage**. Run coverage check with:

```bash
npm run test:coverage
```

Coverage thresholds are configured in `jest.config.mjs`:

```javascript
coverageThreshold: {
  global: {
    branches: 100,
    functions: 100,
    lines: 100,
    statements: 100,
  },
}
```

## Running Specific Test Categories

```bash
# Unit tests
npm test -- tests/core/

# CLI tests
npm test -- tests/cli/

# Contract tests
npm test -- tests/contracts/

# Snapshot tests
npm test -- tests/snapshots/

# Critical path tests
npm test -- tests/critical-paths/

# E2E tests (slower)
npm test -- tests/e2e/
```

## Debugging Tests

```bash
# Run with verbose output
npm test -- --verbose

# Run single test
npm test -- -t "should create session"

# Debug with node inspector
node --inspect-brk node_modules/.bin/jest --runInBand tests/core/session-manager.test.ts
```

## Adding New Tests

1. Create test file in appropriate directory
2. Follow naming convention: `<module>.test.ts`
3. Import from `@jest/globals` for TypeScript support
4. Set up any required mocks before importing tested modules
5. Use `describe` blocks to group related tests
6. Write tests following the AAA pattern (Arrange, Act, Assert)
7. Run tests to verify they pass
8. Check coverage to ensure adequate test coverage

## PR Checklist

Before submitting a PR, ensure:

- [ ] All tests pass (`npm test`)
- [ ] Coverage thresholds are met (`npm run test:coverage`)
- [ ] New code has corresponding tests
- [ ] Snapshot tests are updated if output changed
- [ ] No skipped tests without TODO comments
- [ ] Tests are not flaky (run multiple times)
