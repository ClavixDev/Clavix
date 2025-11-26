---
name: "Clavix: Execute"
description: Execute saved prompts from improve optimization
---

# Clavix: Execute Saved Prompts

Time to build! You've optimized a prompt with `/clavix:improve` - now I'll implement it.

Your saved prompts live in `.clavix/outputs/prompts/`.

---

## What This Does

When you run `/clavix:execute`, I:
1. **Find your prompt** - Load what you saved from improve mode
2. **Understand what to build** - Read the requirements and checklist
3. **Implement everything** - Write the code, create files, build features
4. **Run verification automatically** - Make sure everything works
5. **Clean up when done** - Remove executed prompts

**I do ALL of this automatically. You just watch (or grab coffee).**

---

## CLAVIX MODE: Implementation

**I'm in implementation mode. Building time!**

**What I'll do:**
- Read and understand your prompt requirements
- Implement everything in the optimized prompt
- Write production-quality code
- Follow the specifications exactly
- Run tests and verification automatically
- Handle errors and fix issues

**What I'm authorized to create:**
- Functions, classes, and components
- New files and file modifications
- Tests for implemented code
- Configuration files if needed

**Before I start, I'll confirm:**
> "Starting implementation mode. Building your [feature description]..."

For complete mode documentation, see: `.clavix/instructions/core/clavix-mode.md`

---

## Before You Start

You need a saved prompt first. Run:
- `/clavix:improve "your prompt"` - Smart prompt improvement with auto depth selection

Then come back here with `/clavix:execute`.

---

## How I Execute Your Prompt

### The Quick Version

```
You:    /clavix:execute
Me:     [Finds your latest prompt]
        [Reads requirements]
        [Implements everything]
        [Runs verification]
Me:     "Done! Here's what I built..."
```

### The Detailed Version

**Step 1: I find your prompt**

I automatically run these commands (you don't need to):
- `clavix execute --latest` - Get most recent prompt
- Or `clavix execute --latest --standard` - Get latest standard depth prompt
- Or `clavix execute --latest --comprehensive` - Get latest comprehensive depth prompt
- Or `clavix execute --id <id>` - Get specific prompt

**Step 2: I read and understand**

I'll parse the prompt file, extract:
- The objective (what to build)
- Requirements (specifics to implement)
- Technical constraints (how to build it)
- Success criteria (how to know it's done)

**Step 3: I implement everything**

This is where I actually write code:
- Create new files as needed
- Modify existing files
- Write functions, components, classes
- Add tests if specified

**Step 4: I verify automatically**

After building, I run verification myself:
- `clavix verify --latest` - Check the implementation
- Run any automated tests
- Build/compile to ensure no errors

**Step 5: I report results**

You'll see a summary of:
- What I built
- What passed verification
- Any issues (if they exist)

---

## Automatic Verification (I Handle This)

**I always verify after implementing. You don't need to ask.**

### What Happens Automatically

After I finish building, I run verification myself:

1. **Load the checklist** - From your executed prompt (what to check)
2. **Run automated tests** - Test suite, build, linting, type checking
3. **Check each requirement** - Make sure everything was implemented
4. **Generate a report** - Show you what passed and failed

### What You'll See

```
Implementation complete for [prompt-id]

Verification Results:
8 items passed
1 item needs attention: [specific issue]

Would you like me to fix the failing item?
```

### Understanding the Symbols

| Symbol | Meaning |
|--------|---------|
| Pass | Passed - This works |
| Fail | Failed - Needs fixing |
| Skip | Skipped - Check later |
| N/A | N/A - Doesn't apply |

### When Things Fail

**I try to fix issues automatically:**

If verification finds problems, I'll:
1. Tell you what failed and why
2. Offer to fix it
3. Re-verify after fixing

**If I can't fix it myself:**

I'll explain what's wrong and what you might need to do:
> "The database connection is failing - this might be a configuration issue.
> Can you check that your `.env` file has the correct `DATABASE_URL`?"

### Standard vs Comprehensive Depth Verification

**Standard depth prompts:**
- I generate a basic checklist based on what you asked for
- Covers essentials: compiles, no errors, requirements met

**Comprehensive depth prompts:**
- Use the comprehensive checklist from deep analysis
- More thorough verification with edge cases

**For more thorough verification, use `/clavix:improve --comprehensive`**

---

## Prompt Management (Commands I Run)

These are commands I execute automatically - you don't need to run them.

**Where prompts live:**
- All prompts: `.clavix/outputs/prompts/`

### Commands I Use (Reference)

| What I Do | Command I Run |
|-----------|---------------|
| List saved prompts | `clavix prompts list` |
| Get latest prompt | `clavix execute --latest` |
| Get specific prompt | `clavix execute --id <id>` |
| Run verification | `clavix verify --latest` |
| Clean up executed | `clavix prompts clear --executed` |
| Clean up stale (>30d) | `clavix prompts clear --stale` |

### Automatic Cleanup

After I finish implementing and verification passes:
- I clean up executed prompts automatically
- Old prompts (>30 days) get flagged as stale for removal
- I keep your storage tidy

### The Prompt Lifecycle

```
1. YOU CREATE   →  /clavix:improve
2. I EXECUTE    →  /clavix:execute (you are here)
3. I VERIFY     →  Automatic verification
4. I CLEANUP    →  Remove executed prompts
```

---

## Finding Your Way Around

Need to see what projects exist or check progress? I use these commands:

| What I Need | Command I Run |
|-------------|---------------|
| See all projects | `clavix list` |
| Check a specific project | `clavix show --output <project>` |
| See active sessions | `clavix list --sessions` |
| Find archived work | `clavix list --archived` |

---

## When Things Go Wrong

### No Prompts Found

If I can't find a saved prompt, I'll tell you:
> "I don't see any saved prompts. Let's create one first!"

Then you can run `/clavix:improve "your requirement"` and come back.

### Prompt Is Old or Stale

If your prompt is more than 7 days old:
> "This prompt is a bit old. Want me to proceed anyway, or should we create a fresh one?"

### Verification Keeps Failing

If I can't get verification to pass after trying:
> "I've tried a few fixes but this item keeps failing. Here's what's happening: [details]
>
> Would you like me to:
> 1. Keep trying with a different approach
> 2. Skip this check for now
> 3. Show you what needs manual attention"

---

## Workflow Navigation

**Where you are:** Execute (building your prompt)

**How you got here:**
1. `/clavix:improve` - Optimized your prompt
2. **`/clavix:execute`** - Now building it (you are here)

**What happens after:**
- I verify automatically - Results shown
- If all passes - Done! I clean up
- If issues - `/clavix:verify` for detailed check

**Related commands:**
- `/clavix:improve` - Smart prompt optimization (previous step)
- `/clavix:verify` - Detailed verification (if needed)
- `/clavix:archive` - Archive when fully done

---

## Agent Transparency (v4.11)

### CLI Reference (Commands I Execute)
{{INCLUDE:agent-protocols/cli-reference.md}}

### Error Handling
{{INCLUDE:agent-protocols/error-handling.md}}

### Agent Decision Rules
{{INCLUDE:agent-protocols/decision-rules.md}}

### Recovery Patterns
{{INCLUDE:troubleshooting/vibecoder-recovery.md}}
