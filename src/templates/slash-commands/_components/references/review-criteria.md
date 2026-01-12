## Review Criteria Reference

This reference defines what to check for each review criterion. Use this guide to ensure consistent, thorough PR reviews.

---

### 🔒 Security

**Purpose:** Identify vulnerabilities that could be exploited in production.

| Check | What to Look For | Severity if Missing |
|-------|------------------|---------------------|
| Authentication | Auth checks on all protected routes | 🔴 Critical |
| Authorization | Role/permission verification before sensitive actions | 🔴 Critical |
| Input Validation | All user inputs validated and sanitized | 🔴 Critical |
| Secrets Exposure | No hardcoded credentials, keys, or tokens | 🔴 Critical |
| XSS Prevention | Proper output encoding, dangerouslySetInnerHTML avoided | 🔴 Critical |
| CSRF Protection | Tokens on state-changing operations | 🟠 Major |
| SQL Injection | Parameterized queries, no string concatenation | 🔴 Critical |
| Path Traversal | User input not used directly in file paths | 🔴 Critical |
| Dependency Security | No known vulnerable dependencies | 🟠 Major |
| Error Disclosure | Errors don't leak sensitive info to users | 🟠 Major |

**Red Flags:**
- `eval()` or `Function()` with user input
- Passwords/keys in source code
- Missing authentication middleware
- Raw SQL queries with concatenation
- `innerHTML` with unsanitized content

---

### 🏗️ Architecture

**Purpose:** Ensure code follows established patterns and maintains system integrity.

| Check | What to Look For | Severity if Violated |
|-------|------------------|----------------------|
| Separation of Concerns | Business logic separate from presentation | 🟠 Major |
| Coupling | Components loosely coupled | 🟠 Major |
| Cohesion | Related functionality grouped together | 🟡 Minor |
| Single Responsibility | Classes/functions do one thing well | 🟡 Minor |
| Open/Closed | Open for extension, closed for modification | 🟡 Minor |
| Dependency Inversion | Depend on abstractions, not concretions | 🟠 Major |
| Layer Violations | No skipping layers (e.g., UI calling DB directly) | 🟠 Major |
| Design Patterns | Consistent use of project's established patterns | 🟡 Minor |
| Interface Segregation | Interfaces focused, not bloated | 🟡 Minor |

**Red Flags:**
- Controller/handler with database queries
- Circular dependencies
- God classes (classes doing too much)
- Hardcoded dependencies instead of injection
- Mixing concerns (e.g., UI logic in data layer)

---

### 📏 Code Standards

**Purpose:** Ensure code is readable, maintainable, and follows team conventions.

| Check | What to Look For | Severity if Violated |
|-------|------------------|----------------------|
| Naming | Descriptive, consistent naming conventions | 🟡 Minor |
| Comments | Meaningful comments where logic is complex | 🟡 Minor |
| Function Length | Functions not too long (< 50 lines ideal) | 🟡 Minor |
| Nesting Depth | Not deeply nested (< 4 levels) | 🟡 Minor |
| DRY | No unnecessary code duplication | 🟠 Major |
| Magic Numbers | Constants instead of hardcoded values | 🟡 Minor |
| Error Messages | Clear, actionable error messages | 🟡 Minor |
| Logging | Appropriate log levels, no sensitive data logged | 🟠 Major |
| Dead Code | No commented-out or unreachable code | 🟡 Minor |
| Console Statements | No console.log/print left in production code | 🟡 Minor |

**Red Flags:**
- Variable names like `x`, `temp`, `data`
- Functions over 100 lines
- Copy-pasted code blocks
- `// TODO: fix later` without issue reference
- `console.log` in committed code

---

### ⚡ Performance

**Purpose:** Identify code that could cause slowdowns or resource issues.

| Check | What to Look For | Severity if Found |
|-------|------------------|-------------------|
| N+1 Queries | Loop with database call inside | 🟠 Major |
| Missing Indexes | Queries on unindexed columns | 🟠 Major |
| Unnecessary Fetching | Loading more data than needed | 🟡 Minor |
| Missing Caching | Repeated expensive operations | 🟡 Minor |
| Memory Leaks | Unclosed connections, unreleased resources | 🟠 Major |
| Synchronous Blocking | Blocking operations on main thread | 🟠 Major |
| Inefficient Algorithms | O(n²) when O(n) is possible | 🟡 Minor |
| Large Payloads | Transferring unnecessary data | 🟡 Minor |
| Missing Pagination | Loading all records at once | 🟠 Major |

**Red Flags:**
- `SELECT *` without limits
- Database queries inside loops
- Missing `finally` blocks for cleanup
- Loading entire collections to filter in-memory
- Synchronous file I/O in request handlers

---

### 🧪 Testing

**Purpose:** Verify new code has adequate test coverage.

| Check | What to Look For | Severity if Missing |
|-------|------------------|---------------------|
| New Code Coverage | New functions/methods have tests | 🟠 Major |
| Happy Path | Tests cover normal operation | 🟠 Major |
| Edge Cases | Tests cover boundary conditions | 🟡 Minor |
| Error Cases | Tests cover failure scenarios | 🟠 Major |
| Integration Tests | Critical paths have integration tests | 🟡 Minor |
| Test Quality | Tests are readable and maintainable | 🟡 Minor |
| Assertions | Tests have meaningful assertions | 🟡 Minor |
| Test Independence | Tests don't depend on each other | 🟡 Minor |
| Mocking | External dependencies properly mocked | 🟡 Minor |

**Red Flags:**
- New endpoints with no tests
- Tests with no assertions
- Tests that always pass
- Flaky tests that sometimes fail
- Testing implementation details instead of behavior

---

### 📚 Documentation

**Purpose:** Ensure code changes are properly documented.

| Check | What to Look For | Severity if Missing |
|-------|------------------|---------------------|
| API Documentation | Public APIs documented | 🟡 Minor |
| README Updates | README updated for new features | 🟡 Minor |
| Inline Comments | Complex logic explained | 🟡 Minor |
| Type Definitions | Types/interfaces documented | 🟡 Minor |
| Migration Guides | Breaking changes documented | 🟠 Major |
| Changelog | Notable changes recorded | 🟡 Minor |

---

### ♿ Accessibility (Web UI)

**Purpose:** Ensure UI changes are accessible to all users.

| Check | What to Look For | Severity if Missing |
|-------|------------------|---------------------|
| Alt Text | Images have alt attributes | 🟠 Major |
| Keyboard Navigation | Interactive elements keyboard accessible | 🟠 Major |
| ARIA Labels | Custom components have ARIA labels | 🟡 Minor |
| Color Contrast | Text has sufficient contrast | 🟡 Minor |
| Focus Indicators | Focus states visible | 🟡 Minor |
| Screen Reader | Content makes sense when read aloud | 🟡 Minor |

---

## How to Use This Reference

1. **Select relevant criteria** based on the type of changes in the PR
2. **Check each item** in the selected categories
3. **Assign severity** based on the guidelines above
4. **Consider context** - existing patterns may justify different approaches
5. **Be specific** - include file names and line numbers in findings

**Remember:** The goal is to help improve code quality, not to block PRs unnecessarily. When in doubt about severity, consider the real-world impact of the issue.
