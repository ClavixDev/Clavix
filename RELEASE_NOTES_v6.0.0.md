# Clavix v6.0.0 - PR Review Command 🎉

This major release introduces **`/clavix:review`** - a new command for criteria-driven PR reviews, expanding Clavix from a personal productivity tool to a team collaboration platform.

---

## ✨ What's New

### `/clavix:review` - Review Your Teammate's PRs

A powerful new command that helps you perform structured, thorough code reviews:

```
/clavix:review
```

**How it works:**
1. **Asks which PR** - Provide a branch name to diff against main/master
2. **Asks for criteria** - Choose from presets or describe custom concerns
3. **Gathers context** - Optional team conventions and specific focus areas
4. **Analyzes the diff** - Reads changed files with surrounding context
5. **Generates report** - Structured findings saved to `.clavix/outputs/reviews/`

### 5 Built-in Review Presets

| Preset | Focus Areas |
|--------|-------------|
| 🔒 **Security** | Auth, validation, secrets, XSS/CSRF, injection |
| 🏗️ **Architecture** | Design patterns, SOLID, separation of concerns |
| 📏 **Standards** | Code style, naming, documentation, testing |
| ⚡ **Performance** | Efficiency, caching, query optimization, N+1 |
| 🔄 **All-Around** | Balanced review across all dimensions |

### Structured Output Format

```markdown
# PR Review Report

**Branch:** `feature/user-auth` → `main`
**Review Criteria:** Security + Architecture

## 📊 Executive Summary
| Dimension | Rating | Key Finding |
|-----------|--------|-------------|
| Security | 🔴 NEEDS WORK | SQL injection in user search |

## 🔍 Detailed Findings

### 🔴 Critical (Must Fix)
| ID | File | Line | Issue |
|:--:|:-----|:----:|:------|
| C1 | `src/api/users.ts` | 45 | SQL injection vulnerability |

### 🟠 Major (Should Fix)
...

## ✅ What's Good
- Clean separation between components
- Good TypeScript types
```

### Custom Criteria Support

Describe specific concerns in natural language:

> "Focus on error handling and input validation - we're integrating Stripe"
> "Check for proper rate limiting on all new endpoints"
> "Make sure all new code follows our Repository pattern"

---

## 🔄 How It Differs from `/clavix:verify`

| Command | Purpose |
|---------|---------|
| `/clavix:verify` | Check **YOUR** implementation against **YOUR** PRD/tasks |
| `/clavix:review` | Review **SOMEONE ELSE's** PR against configurable criteria |

Use **verify** for self-checking. Use **review** for team PR reviews.

---

## 📦 Installation

```bash
# New installation
npm install -g clavix

# Update existing installation
npm update -g clavix

# Regenerate templates in your project
cd your-project
clavix update
```

---

## 🎯 Recommended Workflow

```
[Teammate creates PR]
     ↓
/clavix:review         # Analyze PR with criteria
     ↓
[Review report generated]
     ↓
[Manual PR review with guidance]
```

---

## 📊 Stats

- **New command**: `/clavix:review`
- **New components**: 3 (review-criteria, review-presets, review-examples)
- **New tests**: 32
- **Total slash commands**: 10 (was 9)

---

## 🙏 Why v6.0.0?

This is a **major version bump** because:
1. Introduces a significant new workflow that expands Clavix to team collaboration
2. Changes the command count from 9 to 10
3. Adds new output directory structure (`.clavix/outputs/reviews/`)

---

## Full Changelog

See [CHANGELOG.md](https://github.com/ClavixDev/Clavix/blob/main/CHANGELOG.md) for complete details.

---

**Happy reviewing!** 🚀
