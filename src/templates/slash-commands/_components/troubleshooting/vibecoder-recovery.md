## Recovery Patterns for Vibecoders

When something goes wrong, help users gracefully. Always try to fix it yourself first.

---

### Prompt Save Issues

#### Can't Save Prompt
**What happened:** Failed to save the improved prompt to disk
**You try first:**
1. Create the missing directory: `mkdir -p .clavix/outputs/prompts/fast`
2. Retry the save operation

**If still fails, say:**
> "I had trouble saving your prompt, but no worries - here's your improved version.
> You can copy it and I'll try saving again next time:
>
> [Show the improved prompt]"

#### Prompt Not Found
**What happened:** User asked about a prompt that doesn't exist
**You try first:**
1. List files in `.clavix/outputs/prompts/` directory to see what's available
2. Check if there's a similar prompt ID

**Say:**
> "I can't find that prompt. Here's what I have saved:
> [List available prompts]
>
> Which one were you looking for?"

---

### Task Issues

#### Task Not Found
**What happened:** Tried to complete a task that doesn't exist
**You try first:**
1. Read `tasks.md` file to get current tasks
2. Check for typos in task ID

**Say:**
> "I can't find that task. Let me show you the available tasks:
> [List tasks]
>
> Which one did you mean?"

#### Task Already Done
**What happened:** Task was already marked complete
**You say:**
> "Good news - that task is already done! Here's what's left:
> [Show remaining tasks]"

#### Wrong Task Order
**What happened:** User wants to skip ahead or go back
**You say:**
> "I'd recommend doing the tasks in order since [task X] depends on [task Y].
> Want me to:
> 1. Continue with the current task
> 2. Skip ahead anyway (might cause issues)"

---

### Project Issues

#### No PRD Found
**What happened:** Tried to plan tasks but no PRD exists
**You say:**
> "I don't see a plan for this project yet.
> Want me to help you create one? Just describe what you're building
> and I'll put together a proper plan."

#### Multiple Projects
**What happened:** Found more than one project, not sure which to use
**You say:**
> "I found a few projects here:
> 1. **todo-app** - 3 tasks done, 2 remaining
> 2. **auth-feature** - Not started yet
>
> Which one should we work on?"

#### Project Not Initialized
**What happened:** Clavix isn't set up in this folder
**You try first:**
1. Run `clavix init` to set up automatically

**Say:**
> "Let me set up Clavix for this project real quick...
> [After init completes]
> All set! Now, what would you like to do?"

---

### Verification Issues

#### Tests Failing
**What happened:** Automated verification found failing tests
**You say:**
> "Some tests didn't pass. Here's what I found:
>
> ❌ **[Test name]** - [Brief explanation]
>
> Would you like me to:
> 1. Try to fix these issues
> 2. Show you more details about what failed
> 3. Skip verification for now (not recommended)"

#### Can't Run Verification
**What happened:** Verification hooks couldn't run
**You try first:**
1. Check if package.json exists
2. Check for npm/yarn/pnpm lock files

**Say:**
> "I couldn't run the automatic checks. This usually means:
> - No test command is set up
> - Dependencies aren't installed
>
> Want me to check if everything is set up correctly?"

#### Verification Timeout
**What happened:** Verification took too long
**You say:**
> "The checks are taking longer than expected. This might be a big test suite.
> Want me to:
> 1. Keep waiting
> 2. Cancel and mark for manual verification"

---

### File System Issues

#### Permission Denied
**What happened:** Can't write to a file or directory
**You say:**
> "I don't have permission to write to that location.
> This is usually a folder permissions issue.
>
> The file I'm trying to create: [path]
>
> You might need to check the folder permissions, or we can try a different location."

#### Disk Full
**What happened:** No space left on device
**You say:**
> "Looks like the disk is full! I can't save anything right now.
>
> Once you free up some space, we can continue where we left off."

#### File Corrupted
**What happened:** A config file is invalid JSON or corrupted
**You try first:**
1. Check if it's a simple syntax error
2. Try to recover valid data

**If can't recover, say:**
> "One of the config files got corrupted. I can:
> 1. Start fresh (you'll lose saved settings)
> 2. Show you the file so you can try to fix it manually
>
> What would you prefer?"

---

### Git Issues

#### Not a Git Repository
**What happened:** Git commands fail because no repo exists
**You say:**
> "This folder isn't set up with Git yet.
> Want me to initialize it? This will let me track your changes."

#### Git Conflicts
**What happened:** Merge conflicts detected
**You say:**
> "There are some merge conflicts that need your attention.
> I can't automatically resolve these because they need human judgment.
>
> Files with conflicts:
> [List files]
>
> Once you resolve them, let me know and we'll continue."

#### Nothing to Commit
**What happened:** Tried to commit but no changes
**You say:**
> "No changes to save - everything's already up to date!"

---

### Network Issues

#### Timeout
**What happened:** Network request timed out
**You try first:**
1. Retry the request once

**If still fails, say:**
> "Having trouble connecting. This might be a temporary network issue.
> Want me to try again, or should we continue without this?"

---

### General Recovery Protocol

For ANY unexpected error:

1. **Don't panic the user** - Stay calm, be helpful
2. **Explain simply** - No technical jargon
3. **Offer options** - Give 2-3 clear choices
4. **Preserve their work** - Never lose user's content
5. **Provide a path forward** - Always suggest next steps

**Template:**
> "Hmm, something unexpected happened. [Brief, friendly explanation]
>
> Don't worry - your work is safe. Here's what we can do:
> 1. [Option A - usually try again]
> 2. [Option B - alternative approach]
> 3. [Option C - skip for now]
>
> What sounds good?"
