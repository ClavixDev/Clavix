## Review Output Examples

Reference examples showing the expected format and quality of review reports.

---

### Example 1: Security-Focused Review

```markdown
# PR Review Report

**Branch:** `feature/user-authentication` → `main`
**Files Changed:** 8 (6 source, 2 tests)
**Review Criteria:** Security
**Date:** 2026-01-12

---

## 📊 Executive Summary

| Dimension | Rating | Key Finding |
|-----------|--------|-------------|
| Security | 🔴 NEEDS WORK | SQL injection vulnerability in user search |

**Overall Assessment:** Request Changes

---

## 🔍 Detailed Findings

### 🔴 Critical (Must Fix)

| ID | File | Line | Issue |
|:--:|:-----|:----:|:------|
| C1 | `src/api/users.ts` | 45 | **SQL Injection**: User search uses string concatenation: `WHERE name LIKE '%${query}%'`. Use parameterized queries. |
| C2 | `src/auth/login.ts` | 23 | **Missing Rate Limiting**: Login endpoint has no rate limiting, vulnerable to brute force attacks. |

### 🟠 Major (Should Fix)

| ID | File | Line | Issue |
|:--:|:-----|:----:|:------|
| M1 | `src/auth/login.ts` | 67 | **Error Disclosure**: Login failure returns "User not found" vs "Invalid password" - allows user enumeration. Use generic "Invalid credentials" message. |

### 🟡 Minor (Optional)

| ID | File | Line | Issue |
|:--:|:-----|:----:|:------|
| m1 | `src/utils/auth.ts` | 12 | **Token Expiry**: JWT expiry set to 7 days. Consider shorter expiry with refresh tokens. |

### ⚪ Suggestions (Nice to Have)

- Consider adding account lockout after 5 failed attempts
- Add audit logging for authentication events

---

## ✅ What's Good

- Password hashing uses bcrypt with appropriate cost factor
- HTTPS enforced on all auth endpoints
- Session tokens properly invalidated on logout

---

## 🛠️ Recommended Actions

**Before Merge:**
1. Fix C1: Replace string concatenation with parameterized query
2. Fix C2: Add rate limiting middleware to login endpoint

**Consider for This PR:**
3. Address M1: Use generic error message for login failures

---

*Generated with Clavix Review | 2026-01-12*
```

---

### Example 2: Architecture-Focused Review

```markdown
# PR Review Report

**Branch:** `feature/payment-integration` → `main`
**Files Changed:** 15 (12 source, 3 tests)
**Review Criteria:** Architecture
**Date:** 2026-01-12

---

## 📊 Executive Summary

| Dimension | Rating | Key Finding |
|-----------|--------|-------------|
| Architecture | 🟡 FAIR | Some layer violations, but overall structure is good |

**Overall Assessment:** Approve with Minor Changes

---

## 🔍 Detailed Findings

### 🔴 Critical (Must Fix)

No critical issues found.

### 🟠 Major (Should Fix)

| ID | File | Line | Issue |
|:--:|:-----|:----:|:------|
| M1 | `src/controllers/PaymentController.ts` | 89 | **Layer Violation**: Direct Stripe API call in controller. Should go through PaymentService. |
| M2 | `src/services/OrderService.ts` | 45 | **Circular Dependency**: OrderService imports PaymentService, PaymentService imports OrderService. Extract shared logic to a new service. |

### 🟡 Minor (Optional)

| ID | File | Line | Issue |
|:--:|:-----|:----:|:------|
| m1 | `src/services/PaymentService.ts` | 120 | **Single Responsibility**: `processPayment` method handles payment, receipt generation, and email notification. Consider splitting. |
| m2 | `src/types/payment.ts` | - | **Interface Segregation**: `PaymentProcessor` interface has 12 methods. Consider splitting into smaller interfaces. |

### ⚪ Suggestions (Nice to Have)

- Consider adding a PaymentGateway abstraction to support multiple providers
- Repository pattern could help isolate database logic

---

## ✅ What's Good

- Clean separation between API layer and services
- Good use of dependency injection
- Consistent error handling pattern across services
- Types well-defined in dedicated files

---

## 🛠️ Recommended Actions

**Before Merge:**
(None - no critical issues)

**Consider for This PR:**
1. Move Stripe API call from controller to PaymentService
2. Resolve circular dependency between Order and Payment services

**Future Improvements:**
3. Refactor large processPayment method
4. Consider payment gateway abstraction for multi-provider support

---

*Generated with Clavix Review | 2026-01-12*
```

---

### Example 3: All-Around Review (Clean PR)

```markdown
# PR Review Report

**Branch:** `feature/user-profile-settings` → `main`
**Files Changed:** 6 (4 source, 2 tests)
**Review Criteria:** All-Around
**Date:** 2026-01-12

---

## 📊 Executive Summary

| Dimension | Rating | Key Finding |
|-----------|--------|-------------|
| Security | 🟢 GOOD | Input validation present, no sensitive data exposure |
| Architecture | 🟢 GOOD | Follows existing patterns consistently |
| Code Quality | 🟢 GOOD | Clean, readable code |
| Testing | 🟢 GOOD | Good coverage including edge cases |

**Overall Assessment:** Approve

---

## 🔍 Detailed Findings

### 🔴 Critical (Must Fix)

No critical issues found.

### 🟠 Major (Should Fix)

No major issues found.

### 🟡 Minor (Optional)

| ID | File | Line | Issue |
|:--:|:-----|:----:|:------|
| m1 | `src/components/ProfileForm.tsx` | 67 | **Magic String**: Error message "Email is required" could be moved to constants file for consistency with other forms. |
| m2 | `src/services/UserService.ts` | 34 | **Logging**: Consider adding debug log for profile update operations. |

### ⚪ Suggestions (Nice to Have)

- Could add optimistic UI update for better perceived performance
- Consider debouncing the email validation API call

---

## ✅ What's Good

- Excellent input validation on all form fields
- Proper error handling with user-friendly messages
- Tests cover both success and failure scenarios
- Consistent with existing component patterns
- TypeScript types properly defined
- Accessibility attributes present on form elements

---

## 🛠️ Recommended Actions

**Before Merge:**
(None - ready to merge)

**Optional Improvements:**
1. Move error strings to constants
2. Add debug logging

This is a well-crafted PR. The minor suggestions are optional and shouldn't block merge.

---

*Generated with Clavix Review | 2026-01-12*
```

---

### Example 4: Custom Criteria (Error Handling Focus)

```markdown
# PR Review Report

**Branch:** `feature/api-error-handling` → `main`
**Files Changed:** 10 (8 source, 2 tests)
**Review Criteria:** Custom (Error Handling)
**Date:** 2026-01-12

---

## 📊 Executive Summary

| Dimension | Rating | Key Finding |
|-----------|--------|-------------|
| Error Handling | 🟡 FAIR | Good structure, some edge cases missing |

**Overall Assessment:** Approve with Minor Changes

---

## 🔍 Detailed Findings

### 🔴 Critical (Must Fix)

No critical issues found.

### 🟠 Major (Should Fix)

| ID | File | Line | Issue |
|:--:|:-----|:----:|:------|
| M1 | `src/api/products.ts` | 78 | **Unhandled Promise Rejection**: Async operation not wrapped in try/catch. Will crash if database is unavailable. |
| M2 | `src/services/PaymentService.ts` | 145 | **Silent Failure**: Catch block logs error but returns `null` without indicating failure to caller. |

### 🟡 Minor (Optional)

| ID | File | Line | Issue |
|:--:|:-----|:----:|:------|
| m1 | `src/middleware/errorHandler.ts` | 23 | **Error Types**: Consider using custom error classes (NotFoundError, ValidationError) for better error differentiation. |
| m2 | `src/api/users.ts` | 56 | **Error Message**: "Something went wrong" is too generic. Include error code for support reference. |

### ⚪ Suggestions (Nice to Have)

- Consider adding error boundary component for React
- Sentry or similar error tracking would help monitor production issues
- Could add retry logic for transient failures

---

## ✅ What's Good

- Centralized error handling middleware
- Consistent error response format across API
- Errors properly logged with context
- User-facing errors don't expose stack traces
- HTTP status codes used correctly

---

*Generated with Clavix Review | 2026-01-12*
```

---

## Key Principles Demonstrated

1. **Specificity**: Every issue includes file name and line number
2. **Actionability**: Issues explain what's wrong AND how to fix it
3. **Balance**: Reports highlight positives, not just problems
4. **Severity Accuracy**: Critical = production risk, Minor = style preference
5. **Context Awareness**: Acknowledges when code follows existing patterns
6. **Pragmatism**: Clean PRs get short reports with "ready to merge"
