## Review Presets

Pre-configured review criteria combinations for common review scenarios.

---

### 🔒 Security Focus

**Best for:** Auth changes, API endpoints, data handling, third-party integrations

**Criteria included:**
- Authentication & Authorization
- Input Validation
- Secrets Exposure
- Injection Prevention (SQL, XSS, CSRF)
- Error Disclosure
- Dependency Security

**What to emphasize:**
- Any user input handling
- Database queries
- External service calls
- Session/token management
- File operations

**Typical findings:**
- Missing auth middleware
- Unsanitized user input
- Hardcoded credentials
- SQL string concatenation
- Missing CSRF tokens

---

### 🏗️ Architecture Focus

**Best for:** New features, refactoring, structural changes, service additions

**Criteria included:**
- Separation of Concerns
- Coupling & Cohesion
- SOLID Principles
- Layer Violations
- Design Pattern Consistency
- Dependency Direction

**What to emphasize:**
- New class/module structure
- Import patterns
- Service boundaries
- Data flow direction
- Interface design

**Typical findings:**
- Business logic in controllers
- Circular dependencies
- Bypassing service layers
- Inconsistent patterns
- Tight coupling

---

### 📏 Standards Focus

**Best for:** Code style reviews, onboarding new team members, consistency checks

**Criteria included:**
- Naming Conventions
- Code Comments
- Function Length & Complexity
- DRY Violations
- Error Handling
- Logging Practices
- Dead Code

**What to emphasize:**
- Variable/function naming
- Code organization
- Duplicate code
- Console statements
- TODO comments

**Typical findings:**
- Poor naming choices
- Functions too long
- Copy-pasted code
- Missing error handling
- Console.log left in

---

### ⚡ Performance Focus

**Best for:** Database changes, API optimization, high-traffic features

**Criteria included:**
- N+1 Query Detection
- Missing Indexes
- Caching Opportunities
- Memory Management
- Algorithm Efficiency
- Payload Size
- Pagination

**What to emphasize:**
- Database queries
- Loop structures
- Resource cleanup
- Data loading patterns
- Response sizes

**Typical findings:**
- Queries inside loops
- SELECT * without limits
- Missing pagination
- Unclosed connections
- Loading unnecessary data

---

### 🔄 All-Around Review

**Best for:** General code review, when unsure what to focus on, comprehensive checks

**Criteria included:**
- Security (high priority)
- Architecture (high priority)
- Code Standards (medium priority)
- Testing (medium priority)
- Performance (as applicable)
- Documentation (low priority)

**Weighting:**
1. 🔴 Security issues always critical/major
2. 🟠 Architecture violations usually major
3. 🟡 Standards issues usually minor
4. Balance thoroughness with pragmatism

**What to emphasize:**
- Start with security checks
- Move to structural concerns
- Then code quality
- Finally nice-to-haves

---

### 🧪 Testing Focus

**Best for:** Test-related PRs, feature completeness verification

**Criteria included:**
- Test Coverage for New Code
- Happy Path Tests
- Edge Case Tests
- Error Case Tests
- Test Quality
- Test Independence
- Mocking Practices

**What to emphasize:**
- Missing test files
- Untested code paths
- Assertion quality
- Test organization
- Mock appropriateness

**Typical findings:**
- New code without tests
- Missing error case tests
- Tests with no assertions
- Flaky test patterns
- Over-mocking

---

## Choosing a Preset

| Scenario | Recommended Preset |
|----------|-------------------|
| Auth/login changes | 🔒 Security |
| New API endpoint | 🔒 Security + 🏗️ Architecture |
| Large refactoring | 🏗️ Architecture |
| UI component changes | 📏 Standards |
| Database migration | ⚡ Performance |
| New feature | 🔄 All-Around |
| Bug fix | 📏 Standards + 🧪 Testing |
| Not sure | 🔄 All-Around |

---

## Custom Criteria

When presets don't fit, describe specific concerns:

**Examples:**
- "Focus on error handling and logging"
- "Check if we're following our new API response format"
- "Make sure all new endpoints have rate limiting"
- "Verify the caching strategy is correct"
- "Check for proper TypeScript types, no `any`"

The agent will translate these into specific checks during the review.
