# Troubleshooting: Mode Confusion

## Problem Description

Agent is unclear whether they should be in planning mode (gathering requirements, creating PRDs) or implementation mode (writing code, building features).

---

## Symptoms

- Agent asks "Should I implement this or just plan it?"
- Agent alternates between asking questions and generating code
- Agent generates partial implementation then stops uncertainly
- User and agent have misaligned expectations about what's happening
- Agent starts multiple times with different approaches

---

## Why This Happens

**Root causes:**

1. **Ambiguous user request** - User says "build X" which could mean "plan to build X" or "implement X now"
2. **Missing CLAVIX MODE context** - Agent didn't see mode boundary instructions
3. **Implicit mode transitions** - No clear signal when switching between planning and implementation
4. **Conversation drift** - Started in planning mode but gradually shifted toward implementation
5. **Tool ambiguity** - Clavix commands not clearly distinguished from normal conversation

---

## Immediate Fix

If mode is unclear:

### Step 1: Agent Should Ask Explicitly

When uncertain, agent should ALWAYS ask:

```markdown
Just to clarify - which mode should I be in?

**Option 1: Planning Mode (Clavix)**
- Gather requirements and create planning documents
- Generate PRDs and optimized prompts
- Ask clarifying questions
- **No implementation yet**

**Option 2: Implementation Mode**
- Write actual code
- Build the feature
- Create components/functions
- **Start implementing now**

Which would you like me to do?
```

---

### Step 2: User Should Clarify

User should explicitly state:

**For planning:**
```markdown
Just planning for now. Help me create a solid PRD first.
```

**For implementation:**
```markdown
Let's implement this now. Build the feature based on what we've discussed.
```

---

### Step 3: Agent Confirms Mode

Agent should acknowledge:

**Planning mode:**
```markdown
Got it - I'm in planning mode. I'll gather requirements and create documentation, but won't implement yet.

Let's start with some clarifying questions...
```

**Implementation mode:**
```markdown
Understood - I'll implement this now based on our requirements.

Let me start building...
```

---

## Prevention Strategies

### For Template Authors

**1. Clear Mode Declaration**

Every workflow should declare its mode upfront:

```markdown
## CLAVIX MODE: Requirements & Planning Only

You are in PLANNING mode. Do NOT implement.
```

Or for implementation:

```markdown
## IMPLEMENTATION MODE

You are now in implementation mode. Write code based on requirements.
```

---

**2. Mode Transition Markers**

When transitioning between modes, make it explicit:

```markdown
**TRANSITION:** Entering planning mode
**TRANSITION:** Exiting planning mode, starting implementation
```

---

**3. Decision Points Have Clarification Prompts**

When agent might be uncertain:

```markdown
**If uncertain whether to implement:**
Ask user: "Should I implement this now, or continue planning?"
```

---

### For Users

**1. Use Explicit Commands**

**For planning:**
- `/clavix:start` - Start conversational planning
- `/clavix:prd` - Generate PRD
- `/clavix:summarize` - Extract requirements

**For implementation:**
- "Now implement this"
- "Build the feature"
- "Start coding"

---

**2. Set Expectations Early**

At conversation start:

```markdown
Let's plan this out first before implementing. I want a solid PRD.
```

Or:

```markdown
I already have requirements. Let's jump straight to implementation.
```

---

**3. Clarify When Confused**

If agent seems confused:

```markdown
To be clear: we're just planning right now. Don't implement yet.
```

---

## Common Confusion Scenarios

### Scenario 1: Ambiguous "Build" Request

**User says:** "Help me build an authentication system"

**Agent thinks:**
- Option A: Help plan how to build it (planning mode)
- Option B: Implement it now (implementation mode)

**Solution:**

Agent asks:
```markdown
When you say "build an authentication system," do you want me to:

1. **Help plan it**: Gather requirements, create a PRD, document what needs to be built
2. **Implement it now**: Write the actual authentication code and components

Which would you prefer?
```

---

### Scenario 2: Mid-Conversation Shift

**Starts in planning:**
```markdown
User: /clavix:start
User: I want a dashboard
Agent: [Asks questions about dashboard]
User: [Answers 5 questions]
User: Looks good, let's do it!
```

**Agent thinks:** "Do it" = implement? Or "looks good" = continue planning?

**Solution:**

Agent asks:
```markdown
When you say "let's do it," do you mean:

1. Continue planning and create a PRD/summary?
2. Start implementing the dashboard now?
```

---

### Scenario 3: PRD Then Implementation

**Flow:**
```markdown
User: /clavix:prd
Agent: [Creates PRD]
User: Perfect! Now make it happen.
```

**Agent thinks:** "Make it happen" = implement? Or generate more docs?

**Solution:**

Agent interprets:
```markdown
**TRANSITION:** You've approved the PRD. I understand you want implementation now.

I'll build the features described in the PRD. Starting with [first feature]...
```

But if uncertain:
```markdown
By "make it happen," do you mean:
1. Implement the features in the PRD now?
2. Create additional planning documents?
```

---

## Decision Tree for Agents

```
User request received
    │
    ├─ Is Clavix command? (/clavix:*) ────► Planning Mode
    │
    ├─ User said "implement" / "build now" / "create code"? ────► Implementation Mode
    │
    ├─ User said "plan" / "PRD" / "requirements"? ────► Planning Mode
    │
    ├─ User said "help me build..."? ────► ASK FOR CLARIFICATION
    │
    ├─ Currently in /clavix:* workflow? ────► Stay in Planning Mode
    │
    ├─ User approved PRD and said "do it"? ────► Likely Implementation Mode (confirm if uncertain)
    │
    └─ Unclear? ────► ASK: "Should I plan or implement?"
```

---

## Mode Indicators

### Clear Planning Indicators

- `/clavix:start`
- `/clavix:prd`
- `/clavix:summarize`
- "Let's plan this"
- "Help me create a PRD"
- "I want to document requirements"
- "What should I build?"

---

### Clear Implementation Indicators

- "Now implement this"
- "Build the feature"
- "Write the code"
- "Create the component"
- "Let's start coding"
- "Make it work"
- User has approved PRD + says "go ahead"

---

### Ambiguous Phrases (ASK FOR CLARIFICATION)

- "Help me build X" ← Could be plan OR implement
- "Let's do X" ← Could be plan OR implement
- "Create an X" ← Could be PRD OR implementation
- "I need an X" ← Could be plan OR implement
- "Make it happen" ← Could be continue planning OR start implementing

**When hearing ambiguous phrase → Agent asks for clarification**

---

## Testing for Mode Confusion

### Test: Ambiguous Request Handling

**Input:**
```markdown
User: Help me build a todo app
```

**Expected behavior:**
- Agent asks: "Should I help plan it, or implement it now?"
- Agent does NOT assume one or the other

**Failure indicator:**
- Agent immediately starts planning without asking
- Agent immediately starts implementing without asking

---

### Test: Mid-Workflow Ambiguity

**Input:**
```markdown
User: /clavix:start
[Conversation about requirements]
User: Sounds great, let's go!
```

**Expected behavior:**
- Agent asks: "Should I summarize our requirements, or start implementing?"
- Agent does NOT assume "let's go" means implement

---

## Success Indicators

Mode clarity is working when:
- ✓ Agent knows whether to plan or implement
- ✓ Agent asks when uncertain instead of guessing
- ✓ User and agent expectations are aligned
- ✓ No confusion about what's being produced (PRD vs code)
- ✓ Clear transitions between modes when they occur

---

## Quick Reference

**Agent is confused?**

Agent should ask:
```markdown
Should I:
1. Plan and document (create PRDs, gather requirements)?
2. Implement (write code and build features)?
```

**User wants to clarify?**

User should say:
```markdown
Planning mode: "Just create a PRD / gather requirements for now"
Implementation mode: "Implement this now / start coding"
```

**Template authors preventing confusion?**

Add to templates:
```markdown
## CLAVIX MODE: Requirements & Planning Only

[Clear mode boundary]

**If uncertain whether to implement, ASK the user.**
```

---

## See Also

- `.clavix/instructions/core/clavix-mode.md` - Complete mode boundary explanation
- `.clavix/instructions/troubleshooting/jumped-to-implementation.md` - Agent implementing prematurely
- `.clavix/instructions/workflows/start.md` - Conversational mode workflow
