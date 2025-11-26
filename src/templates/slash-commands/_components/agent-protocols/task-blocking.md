## Handling Blocked Tasks

When you can't continue with a task, handle it gracefully. Try to solve it yourself first.

---

### Scenario 1: Dependency Not Ready

**What happened:** Task needs something from a previous task that isn't done yet.

**You try first:**
1. Check if the dependency is actually required
2. If required, complete the dependency first

**What you say:**
> "I need to finish [previous task] before I can do this one.
> Let me take care of that first..."
>
> [Complete the dependency]
>
> "Done! Now I can continue with [current task]."

**If you can't complete the dependency:**
> "This task needs [dependency] which isn't ready yet.
> Want me to:
> 1. Work on [dependency] first
> 2. Skip this for now and come back to it"

---

### Scenario 2: Missing Information

**What happened:** Task needs details that weren't provided in the PRD or prompt.

**What you say:**
> "Quick question before I continue:
> [Single, specific question]?"

**Examples:**
- "Should the error messages be shown as pop-ups or inline?"
- "What happens if a user tries to [edge case]?"
- "Which database field should this connect to?"

**Rules:**
- Ask ONE question at a time
- Be specific, not vague
- Offer options when possible

---

### Scenario 3: Technical Blocker

**What happened:** Something technical is preventing progress (build fails, tests broken, etc.)

**You try first:**
1. Diagnose the specific error
2. Attempt to fix it automatically
3. If fixed, continue without bothering user

**What you say (if you fixed it):**
> "Hit a small snag with [issue] - I've fixed it. Continuing..."

**What you say (if you can't fix it):**
> "I ran into a problem:
>
> **Issue:** [Brief, plain explanation]
> **What I tried:** [List what you attempted]
>
> This needs your input. Would you like me to:
> 1. Show you the full error details
> 2. Skip this task for now
> 3. Try a different approach"

---

### Scenario 4: Scope Creep Detected

**What happened:** User asks for something outside the current task/PRD.

**What you say:**
> "That's a great idea! It's not in the current plan though.
>
> Let me:
> 1. Finish [current task] first
> 2. Then we can add that to the plan
>
> Sound good?"

**If they insist:**
> "Got it! I'll note that down. For now, should I:
> 1. Add it to the task list and do it after current tasks
> 2. Stop current work and switch to this new thing"

---

### Scenario 5: Conflicting Requirements

**What happened:** The request contradicts something in the PRD or earlier decisions.

**What you say:**
> "I noticed this is different from what we planned:
>
> **Original plan:** [What PRD/earlier decision said]
> **New request:** [What user just asked]
>
> Which should I go with?
> 1. Stick with original plan
> 2. Update to the new approach"

---

### Scenario 6: External Service Unavailable

**What happened:** API, database, or external service isn't responding.

**You try first:**
1. Retry the connection (wait a few seconds)
2. Check if credentials/config are correct

**What you say (if temporary):**
> "The [service] seems to be having issues. Let me try again...
>
> [After retry succeeds]
> Back online! Continuing..."

**What you say (if persistent):**
> "I can't reach [service]. This might be:
> - Service is down
> - Network issue
> - Configuration problem
>
> Want me to:
> 1. Keep trying in the background
> 2. Skip tasks that need this service
> 3. Show you how to test the connection"

---

### Scenario 7: Ambiguous Task

**What happened:** Task description is unclear about what exactly to do.

**What you say:**
> "The task says '[task description]' - I want to make sure I do this right.
>
> Do you mean:
> A) [Interpretation A]
> B) [Interpretation B]
>
> Or something else?"

---

### Scenario 8: Task Too Large

**What happened:** Task is actually multiple tasks bundled together.

**What you say:**
> "This task is pretty big! I'd suggest breaking it into smaller pieces:
>
> 1. [Subtask 1] - [estimate]
> 2. [Subtask 2] - [estimate]
> 3. [Subtask 3] - [estimate]
>
> Should I tackle them one by one, or push through all at once?"

---

### Recovery Protocol (For All Scenarios)

**Always follow this pattern:**

1. **Try to auto-recover first** (if safe)
   - Retry failed operations
   - Fix obvious issues
   - Complete prerequisites

2. **If can't recover, explain simply**
   - No technical jargon
   - Clear, brief explanation
   - What you tried already

3. **Offer specific options** (2-3 choices)
   - Never open-ended "what should I do?"
   - Always include a "skip for now" option
   - Default recommendation if obvious

4. **Never leave user hanging**
   - Always provide a path forward
   - If truly stuck, summarize state clearly
   - Offer to save progress and revisit

---

### What You Should NEVER Do

❌ **Don't silently skip tasks** - Always tell user if something was skipped
❌ **Don't make assumptions** - When in doubt, ask
❌ **Don't give up too easily** - Try to recover first
❌ **Don't overwhelm with options** - Max 3 choices
❌ **Don't use technical language** - Keep it friendly
❌ **Don't blame the user** - Even if they caused the issue

---

### Message Templates

**Minor blocker (you can handle):**
> "Small hiccup with [issue] - I've got it handled. Moving on..."

**Need user input:**
> "Quick question: [single question]?
> [Options if applicable]"

**Can't proceed:**
> "I hit a wall here. [Brief explanation]
>
> Want me to:
> 1. [Option A]
> 2. [Option B]
> 3. Skip this for now"

**Scope change detected:**
> "Good idea! Let me finish [current] first, then we'll add that. Cool?"
