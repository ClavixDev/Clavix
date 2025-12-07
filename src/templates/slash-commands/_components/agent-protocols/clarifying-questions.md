# Clarifying Questions Protocol

When the user's request requires critical information to proceed correctly, use this protocol to gather necessary details systematically.

## When to Ask Clarifying Questions

Ask clarifying questions when:
- **Critical ambiguity exists** - The request has multiple valid interpretations that lead to substantially different outcomes
- **Missing essential context** - Information necessary to complete the task successfully is absent
- **Technical specifications needed** - Specific versions, paths, identifiers, or constraints are required
- **User choice required** - Multiple valid approaches exist and the user's preference is needed

**Do NOT ask clarifying questions when:**
- The information is trivial or easily inferred from context
- You can make a reasonable default assumption and mention it
- The question would slow down obviously simple tasks
- You're seeking perfection rather than addressing genuine ambiguity

## Question Format

Use this structured format for maximum clarity and efficiency:

### a. Multiple Choice Questions

When presenting options, use clear labels and make selection easy:

**Question:** [Your question here]

**Options:**
- **a.** First option - brief explanation
- **b.** Second option - brief explanation  
- **c.** Third option - brief explanation

**Please respond with your choice (e.g., 'a' or 'option a').**

### b. Custom Input Questions

When you need specific information not in a predefined list:

**Question:** [Your question here]

**Please provide:** [Clear description of what format/content you need]

**Example:** [Show an example of valid input]

## Confidence Threshold

**Ask clarifying questions when confidence < 95%**

If you're 95%+ confident you understand the user's intent and have the necessary information, proceed without asking. If confidence is below 95%, stop and ask.

## Best Practices

1. **Ask questions sequentially** - Don't overwhelm with multiple questions at once unless they're tightly related
2. **Explain why you're asking** - Briefly state what the answer will help you determine
3. **Limit options** - Present 2-4 options maximum for choice questions
4. **Make defaults clear** - If there's a sensible default, state it and ask for confirmation
5. **Batch related questions** - If multiple questions are interdependent, present them together

## Examples

### Good: Clear Multiple Choice
> I need to know where to save the configuration file to proceed correctly.
>
> **Options:**
> - **a.** Project root (recommended for project-specific configs)
> - **b.** Home directory (for user-wide settings)
> - **c.** Custom path (you specify)
>
> **Please respond with your choice (e.g., 'a').**

### Good: Custom Input with Context
> To generate the migration script, I need the database schema version.
>
> **Please provide:** The current schema version number (e.g., "2.1.0" or "v3.4")
>
> If you're unsure, you can check with: `npm run db:version`

### Bad: Unnecessary Question
> ❌ "Do you want me to use good coding practices?"
>
> (This is always implied - just do it)

### Bad: Analysis Paralysis
> ❌ "Should I use const or let for this variable?"
>
> (This is implementation detail - decide yourself based on best practices)

## Recovery Pattern

If you realize you should have asked clarifying questions AFTER starting:

1. **STOP** the current approach
2. **EXPLAIN** what you discovered that requires clarification  
3. **ASK** the necessary questions
4. **RESUME** with the correct approach once answered

**Example:**
> I apologize - I started implementing the auth flow but realized I need to clarify which authentication method you want to use. Are we implementing: (a) JWT tokens, (b) Session-based auth, or (c) OAuth2?
