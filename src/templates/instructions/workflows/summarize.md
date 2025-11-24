# Summarization Workflow (/clavix:summarize)

## Purpose

Analyze the entire conversation, extract requirements, and create structured output documents. This workflow produces PRDs and optimized prompts from natural conversation.

---

## CLAVIX PLANNING MODE

**You are in Clavix prompt/PRD development mode. You help create planning documents, NOT implement features.**

**PLANNING workflows** (requirements & documentation):
- `/clavix:start`, `/clavix:summarize`, `/clavix:fast`, `/clavix:deep`, `/clavix:prd`
- Your role: Ask questions, create PRDs/prompts, extract requirements
- DO NOT implement features during these workflows

**IMPLEMENTATION workflows** (code execution):
- `/clavix:implement`, `/clavix:execute`, `/clavix:task-complete`
- Your role: Write code, execute tasks, implement features
- These commands explicitly request implementation

**YOUR ROLE IN SUMMARIZE MODE:**
- ✓ Analyze conversations and extract requirements
- ✓ Generate mini-PRDs from discussions
- ✓ Create optimized prompts
- ✓ Structure and document requirements

**DO NOT IMPLEMENT. DO NOT IMPLEMENT. DO NOT IMPLEMENT.**
- ✗ DO NOT write application code
- ✗ DO NOT implement the feature being discussed
- ✗ DO NOT generate component/function implementations

**This workflow creates PLANNING DOCUMENTS, not implementations.**

**ONLY implement when user runs:** `/clavix:implement` or `/clavix:execute`

See `.clavix/instructions/core/clavix-mode.md` for complete mode documentation.

---

## Workflow Steps

### Step 1: Pre-Extraction Validation

Before proceeding with extraction, verify the conversation contains minimum viable requirements.

**Required elements:**
- ✓ Clear project objective (what are we building?)
- ✓ At least 3 core requirements or features
- ✓ Some context about technical constraints or preferences (if applicable)

**If ANY are missing:**
1. DO NOT proceed with summarization
2. Ask clarifying questions to gather missing information:
   ```markdown
   Before I summarize, I need a bit more information:

   - What's the main objective of this project?
   - What are the core features that must be included?
   - Any technical constraints or framework preferences?

   This will help me create a more complete and accurate PRD.
   ```
3. Return to conversational mode to gather requirements

**If requirements are present:**
```markdown
**CHECKPOINT:** Pre-extraction validation passed - minimum requirements present

I'll now analyze our conversation and extract structured requirements.
```

---

### Step 2: Extract Requirements from Conversation

Analyze the ENTIRE conversation thread and extract:

**Core Requirements:**
- List all features and functionality discussed
- Mark confidence level for each: [HIGH], [MEDIUM], [LOW]
  - [HIGH] = Explicitly stated and confirmed
  - [MEDIUM] = Mentioned but not detailed
  - [LOW] = Inferred or assumed

**Technical Constraints:**
- Framework/technology preferences
- Performance requirements
- Scale considerations
- Integration requirements

**User Needs & Context:**
- Who will use this?
- What problem does it solve?
- What's the expected user flow?

**Edge Cases & Considerations:**
- Error handling requirements
- Unusual scenarios discussed
- Open questions or uncertainties

**Success Criteria:**
- How do we know when it's complete?
- What defines "working correctly"?
- Any specific metrics or KPIs?

**CHECKPOINT:** Extracted [N] requirements, [M] constraints from conversation

---

### Step 3: CREATE OUTPUT FILES (REQUIRED)

**You MUST create three files. This is not optional.**

#### Step 3.1: Create Directory Structure

```bash
mkdir -p .clavix/outputs/[project-name]
```

Use a meaningful project name based on the conversation (e.g., "todo-app", "auth-system", "dashboard").

---

#### Step 3.2: Write mini-prd.md

Use the Write tool to create `.clavix/outputs/[project-name]/mini-prd.md`

**Content template:**

```markdown
# Requirements: [Project Name]

*Generated from conversation on [date]*

## Objective

[1-2 sentence clear statement of what we're building and why]

## Core Requirements

### Must Have (High Priority)
- [HIGH] Requirement 1 with specific details
- [HIGH] Requirement 2 with specific details
- [HIGH] Requirement 3 with specific details

### Should Have (Medium Priority)
- [MEDIUM] Requirement 4
- [MEDIUM] Requirement 5

### Could Have (Low Priority / Inferred)
- [LOW] Requirement 6
- [LOW] Requirement 7

## Technical Constraints

- **Framework/Stack:** [If specified]
- **Performance:** [Any performance requirements]
- **Scale:** [Expected load/users]
- **Integrations:** [External systems to integrate with]
- **Other:** [Any other technical constraints]

## User Context

**Target Users:** [Who will use this?]

**Primary Use Case:** [Main problem being solved]

**User Flow:** [High-level description of how users interact]

## Edge Cases & Considerations

- [Edge case 1 and how it should be handled]
- [Edge case 2]
- [Open question 1 - needs clarification]

## Success Criteria

How we know this is complete and working:
- ✓ [Specific success criterion 1]
- ✓ [Specific success criterion 2]
- ✓ [Specific success criterion 3]

## Next Steps

1. Review this PRD for accuracy and completeness
2. If anything is missing or unclear, continue the conversation
3. When ready, use the optimized prompt (see optimized-prompt.md) for implementation

---

*This PRD was generated by Clavix from conversational requirements gathering.*
```

**CHECKPOINT:** Created mini-prd.md successfully

---

#### Step 3.3: Write original-prompt.md

Use the Write tool to create `.clavix/outputs/[project-name]/original-prompt.md`

**Content:** Raw extraction in paragraph form (2-4 paragraphs describing what to build)

This is the UNOPTIMIZED version - direct extraction from conversation without enhancements.

**Format:**

```markdown
# Original Prompt (Extracted from Conversation)

[Paragraph 1: Project objective and core functionality]

[Paragraph 2: Key features and requirements]

[Paragraph 3: Technical constraints and context]

[Paragraph 4: Success criteria and additional considerations]

---

*Extracted by Clavix on [date]. See optimized-prompt.md for enhanced version.*
```

**CHECKPOINT:** Created original-prompt.md successfully

---

#### Step 3.4: Write optimized-prompt.md

Use the Write tool to create `.clavix/outputs/[project-name]/optimized-prompt.md`

**Content:** Enhanced version with Clavix Intelligence™ improvements

Apply optimizations and label each improvement:

**Improvement labels:**
- `[ADDED]` - Information added for clarity
- `[CLARIFIED]` - Ambiguous point made more specific
- `[STRUCTURED]` - Reorganized for better flow
- `[EXPANDED]` - Provided more detail on important point
- `[SCOPED]` - Defined boundaries or limitations

**Format:**

```markdown
# Optimized Prompt (Clavix Enhanced)

[Enhanced paragraph 1 with [ADDED] or [CLARIFIED] markers where improvements were made]

[Enhanced paragraph 2...]

[Enhanced paragraph 3...]

[Enhanced paragraph 4...]

---

## Clavix Intelligence™ Improvements Applied

1. **[ADDED]** - [Description of what was added and why]
2. **[CLARIFIED]** - [What was ambiguous and how it was clarified]
3. **[STRUCTURED]** - [How information was reorganized]
4. **[EXPANDED]** - [What detail was added]
5. **[SCOPED]** - [What boundaries were defined]

---

*Optimized by Clavix on [date]. This version is ready for implementation.*
```

**CHECKPOINT:** Created optimized-prompt.md successfully

---

#### Step 3.5: Verify File Creation

List the created files to confirm they exist:

```
Created files in .clavix/outputs/[project-name]/:
✓ mini-prd.md
✓ original-prompt.md
✓ optimized-prompt.md
```

**CHECKPOINT:** All files created and verified successfully

**If any file is missing:**
- Something went wrong with file creation
- Review steps 3.2, 3.3, 3.4
- See troubleshooting: `.clavix/instructions/troubleshooting/skipped-file-creation.md`

---

### Step 4: Apply Clavix Intelligence™ Optimization

When creating the optimized-prompt.md (step 3.4), apply these enhancements:

**Optimization techniques:**

1. **Add missing context** that makes requirements clearer
   - Example: "user authentication" → "user authentication with secure password hashing and JWT tokens"

2. **Clarify ambiguous points** to remove interpretation gaps
   - Example: "real-time updates" → "real-time updates using WebSocket connections with automatic reconnection"

3. **Structure logically** for better comprehension
   - Group related requirements
   - Order by priority or dependency
   - Use clear sections

4. **Expand critical details** that were mentioned briefly
   - Example: "error handling" → "comprehensive error handling with user-friendly messages, logging for debugging, and graceful degradation"

5. **Define scope boundaries** to prevent feature creep
   - Example: "This initial version will NOT include: admin dashboard, analytics, or third-party integrations"

**Label each improvement** so the user knows what was enhanced.

**CHECKPOINT:** Applied Clavix Intelligence™ optimization - [N] improvements added

---

### Step 5: Highlight Key Insights

Identify and call out important discoveries from the conversation:

```markdown
## Key Insights from Conversation

1. **[Insight category]**: [What was discovered]
   - Implication: [Why this matters for implementation]

2. **[Insight category]**: [What was discovered]
   - Implication: [Why this matters]

3. **[Insight category]**: [What was discovered]
   - Implication: [Why this matters]
```

**Example insights:**
- "The user emphasized real-time collaboration, suggesting WebSockets will be critical"
- "Security is a primary concern - authentication and authorization must be robust"
- "Mobile-first design was mentioned multiple times - responsive design is essential"

---

### Step 6: Point Out Unclear Areas

If anything is still unclear or missing after analysis:

```markdown
## Areas for Further Discussion

The following points could use clarification:

1. **[Topic]**: [What's unclear and why it matters]
   - Suggested question: "[Specific question to ask]"

2. **[Topic]**: [What's unclear]
   - Suggested question: "[Question]"

If you'd like to clarify any of these, let's continue the conversation before implementation.
```

---

### Step 7: Present Summary to User

After all files are created and verified, display to user:

```markdown
## ✅ Requirements Extracted and Documented

I've analyzed our conversation and created structured outputs:

**📄 Files Created:**
- **mini-prd.md** - Comprehensive requirements document with priorities
- **original-prompt.md** - Raw extraction from our conversation
- **optimized-prompt.md** - Enhanced version ready for implementation

**📁 Location:** `.clavix/outputs/[project-name]/`

**🎯 Clavix Intelligence™:**
Applied [N] optimizations:
- [Brief summary of improvements]

**🔍 Key Insights:**
- [Top 2-3 insights in one line each]

**⚠️ Unclear Areas:**
[If any, list briefly, otherwise omit this section]

---

**Next Steps:**
1. Review the mini-PRD for accuracy
2. If anything needs adjustment, let me know and we can refine
3. When ready for implementation, use the optimized prompt as your specification

Would you like me to clarify or expand on anything?
```

**CHECKPOINT:** Summarization workflow complete - all outputs created

---

## Self-Correction Checks

### Check 1: Did I Create All Files?

Before completing workflow, verify:
- ✓ Created .clavix/outputs/[project]/ directory
- ✓ Wrote mini-prd.md
- ✓ Wrote original-prompt.md
- ✓ Wrote optimized-prompt.md
- ✓ Verified all files exist

**If any step was skipped:**
1. Go back and complete missing steps
2. Reference: `.clavix/instructions/core/file-operations.md`
3. DO NOT mark workflow complete until all files verified

---

### Check 2: Did I Actually Extract from Conversation?

Verify you analyzed the ENTIRE conversation, not just the most recent messages:
- ✓ Read all messages from start of conversation
- ✓ Extracted all requirements mentioned (not just recent ones)
- ✓ Captured context from throughout discussion

**If you only analyzed recent messages:**
1. Go back and read entire conversation thread
2. Re-extract to capture all requirements
3. Update output files with complete information

---

### Check 3: Are Improvements Actually Labeled?

In optimized-prompt.md, verify:
- ✓ Improvements are marked with [ADDED], [CLARIFIED], etc.
- ✓ Each label has corresponding explanation in "Improvements Applied" section
- ✓ User can see what was enhanced and why

---

## Common Mistakes

### ❌ Mistake 1: Skipping File Creation

**Wrong:**
```markdown
Here's the summary of our conversation:

[Displays content in chat but doesn't create files]
```

**Right:**
```markdown
**Step 1: Creating directory**
[Uses mkdir]

**Step 2: Writing mini-prd.md**
[Uses Write tool with complete content]

**Step 3: Writing original-prompt.md**
[Uses Write tool]

**Step 4: Writing optimized-prompt.md**
[Uses Write tool]

**Step 5: Verifying files**
✓ All files created successfully
```

---

### ❌ Mistake 2: Only Analyzing Recent Messages

**Wrong:**
```markdown
Based on your last message about authentication...
[Extracts only from recent context]
```

**Right:**
```markdown
Analyzing our entire conversation from the start...

You initially mentioned wanting a todo app (message 1), then we discussed:
- User authentication requirements (messages 3-5)
- Real-time sync (messages 7-9)
- Offline support (messages 11-13)

Extracting all of these into the PRD...
```

---

### ❌ Mistake 3: No Optimization Applied

**Wrong:**
```markdown
[original-prompt.md and optimized-prompt.md contain identical content]
```

**Right:**
```markdown
original-prompt.md: "Build a todo app with user authentication"

optimized-prompt.md: "Build a todo app with secure user authentication [CLARIFIED] using bcrypt password hashing and JWT tokens [ADDED] for session management. Include email/password login and logout functionality [EXPANDED]."
```

---

## Troubleshooting

### Problem: Files Not Created

**Symptoms:**
- Agent says files created but they don't exist
- Agent provides content in chat instead
- Agent skips to presenting summary without file operations

**Solution:**
- Reference `.clavix/instructions/troubleshooting/skipped-file-creation.md`
- Review file creation pattern: `.clavix/instructions/core/file-operations.md`
- Ensure each file has explicit Write tool step
- Add verification step to detect missing files

---

### Problem: Incomplete Extraction

**Symptoms:**
- Output only covers recent messages
- Missing requirements from earlier in conversation
- PRD feels thin or incomplete

**Solution:**
- Go back and read ENTIRE conversation thread
- Extract from all messages, not just recent ones
- Cross-reference extracted requirements with conversation history
- Ask user: "Did I miss anything from our discussion?"

---

### Problem: No Optimization Visible

**Symptoms:**
- Original and optimized prompts are identical
- No [ADDED] or [CLARIFIED] labels
- Missing "Improvements Applied" section

**Solution:**
- Review Clavix Intelligence™ optimization techniques (Step 4)
- Add context, clarify ambiguity, expand details
- Label each improvement
- Explain in "Improvements Applied" section why each change was made

---

## Integration with Other Workflows

### From /clavix:start (Conversational Mode)

Summarization is typically triggered from conversational mode:
1. User has been discussing requirements
2. User triggers `/clavix:summarize`
3. Transition from gathering to extraction
4. Execute this workflow

---

### To Implementation

After summarization completes:
1. User reviews outputs
2. If refinements needed, return to `/clavix:start` to continue discussion
3. When satisfied, user can request implementation
4. Use optimized-prompt.md as implementation specification

---

## Summary

**Summarization workflow creates:**
- mini-prd.md (structured requirements document)
- original-prompt.md (raw extraction)
- optimized-prompt.md (enhanced with improvements)

**Critical steps:**
1. Validate minimum requirements present
2. Extract from ENTIRE conversation
3. **CREATE ALL THREE FILES** (not optional)
4. Verify files exist
5. Apply and label optimizations
6. Present summary to user

**Remember:** This workflow creates PLANNING DOCUMENTS, not implementations. Stay in CLAVIX MODE throughout.

**See also:**
- `.clavix/instructions/core/file-operations.md` - File creation patterns
- `.clavix/instructions/core/clavix-mode.md` - Mode boundaries
- `.clavix/instructions/troubleshooting/skipped-file-creation.md` - If files not created
