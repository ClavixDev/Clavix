<!-- OPENSPEC:START -->
# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:
- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:
- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

<!-- CLAVIX:START -->
# Clavix Agent Instructions

This file provides universal Clavix workflows for AI assistants that don't support slash commands.

## 🔍 Workflow Detection

Detect user intent from keywords and trigger appropriate workflow:

### PRD Generation Workflow
**Trigger Keywords:** prd, product requirements, specification, strategic planning, requirements document

**When to use:** User wants to create a Product Requirements Document through guided questions

**Process:**
1. Explain that you'll guide them through 7 strategic questions to create a comprehensive PRD
2. Ask questions one at a time (wait for answer before proceeding):
   - **Q1**: What problem are you solving? Who experiences it?
   - **Q2**: Who will use this? Key characteristics and needs?
   - **Q3**: Must-have features (3-5 core features)?
   - **Q4**: How will you measure success? Key metrics?
   - **Q5**: Technical requirements, integrations, performance needs?
   - **Q6**: What's explicitly NOT in scope for this version?
   - **Q7**: Any deadlines or milestones?

3. After collecting all answers, generate TWO documents:
   - **Full PRD** (comprehensive with all sections: Problem Statement, Target Users, Requirements, Success Metrics, Out of Scope, Timeline)
   - **Quick PRD** (2-3 concise paragraphs optimized for AI consumption)

4. Save both to `.clavix/outputs/[project-name]/` if filesystem access available
5. Display file paths and suggest next steps

**Important:** Be conversational, ask follow-up questions if answers are vague, help users think through edge cases.

---

### Fast Prompt Improvement Workflow
**Trigger Keywords:** improve prompt, quick fix, make better, optimize prompt, fast improvement, CLEAR framework

**When to use:** User wants quick improvements to their prompt

**Process:**
1. Analyze the prompt using CLEAR Framework (C, L, E components):
   - **[C] Conciseness**: Identify verbosity, pleasantries, unnecessary words
   - **[L] Logic**: Check sequencing and coherent flow
   - **[E] Explicitness**: Verify persona, format, tone, success criteria

2. Assess if deep analysis is needed:
   - Prompt < 20 characters?
   - Missing 3+ critical elements?
   - Contains vague words ("app", "system") without context?
   - Low CLEAR scores (C<60%, L<60%, E<50%)?

   **If YES:** Recommend deep analysis instead and explain why

3. Generate CLEAR-optimized structured prompt with sections:
   - **Objective**: Clear, specific goal
   - **Requirements**: Detailed, actionable requirements
   - **Technical Constraints**: Technologies, performance, integrations
   - **Expected Output**: What result should look like
   - **Success Criteria**: How to measure completion

4. List **CLEAR Changes Made** with component labels:
   - [C] "Removed 15 unnecessary words"
   - [L] "Restructured: context → requirements → output"
   - [E] "Added explicit persona, format, tone"

5. Present optimized prompt in code block for easy copying

---

### Deep Prompt Analysis Workflow
**Trigger Keywords:** deep analysis, comprehensive review, thorough examination, full CLEAR analysis, deep dive

**When to use:** User wants comprehensive prompt analysis with all CLEAR components

**Process:**
1. Apply **Full CLEAR Framework** (C, L, E, A, R):
   - **[C] Conciseness**: Detailed verbosity analysis
   - **[L] Logic**: Comprehensive flow analysis
   - **[E] Explicitness**: Complete specification check
   - **[A] Adaptive**: Generate 3-5 alternative phrasings and structures
   - **[R] Reflective**: Create validation checklist, identify edge cases

2. Provide **CLEAR Scoring** (0-100% for each component)

3. Generate multiple outputs:
   - **Primary optimized prompt** (all CLEAR components applied)
   - **Alternative variations** (3-5 different approaches with Adaptive component)
   - **Validation checklist** (Reflective component - edge cases, quality criteria)

4. Explain **CLEAR Changes Made** for each component with examples

5. Identify potential issues and mitigation strategies

---

### Conversational Mode Workflow
**Trigger Keywords:** start conversational mode, let's discuss requirements, talk through this, iterative development

**When to use:** User wants natural discussion about requirements before formalizing them

**Process:**
1. Acknowledge entering conversational mode
2. Engage in natural discussion about requirements:
   - Ask clarifying questions as needed
   - Explore implications and alternatives
   - Track key points throughout conversation
3. Remind user they can say "summarize" when ready to extract structured prompt
4. Stay in this mode until user triggers summarization

---

### Summarization Workflow
**Trigger Keywords:** summarize conversation, extract requirements, create prompt from discussion

**When to use:** User wants to extract structured prompt from conversational discussion

**Process:**
1. Analyze the entire conversation thread
2. Extract:
   - Core problem/objective
   - Key requirements and constraints
   - Technical specifications mentioned
   - Success criteria discussed
   - Important context and assumptions

3. Generate two outputs:
   - **Structured prompt** (2-3 well-formed paragraphs ready for AI)
   - **Mini-PRD** (if discussion was substantial - include Problem, Solution, Requirements, Success Metrics)

4. Present in markdown with clear sections

---

## 📝 Workflow Selection Guide

**User mentions PRD, requirements doc, strategic planning:**
→ Use PRD Generation Workflow

**User has a prompt and wants quick improvement:**
→ Use Fast Prompt Improvement (CLEAR C, L, E)

**User wants thorough analysis or mentions alternatives/edge cases:**
→ Use Deep Analysis (Full CLEAR: C, L, E, A, R)

**User wants to discuss/explore before committing:**
→ Use Conversational Mode

**After conversation, user wants to formalize:**
→ Use Summarization Workflow

---

## 💡 Usage Tips

- **Always save outputs** to `.clavix/outputs/` when possible
- **Use markdown formatting** for all outputs
- **Be conversational and supportive** - this is a collaborative process
- **Ask follow-up questions** when requirements are vague or incomplete
- **Apply CLEAR Framework** systematically in prompt improvement workflows
- **Reference CLEAR components** ([C], [L], [E], [A], [R]) when explaining changes

---

## 🎯 Success Criteria

Your goal is to help users:
- Create clear, comprehensive PRDs through guided questioning
- Improve prompts using CLEAR Framework principles
- Think through requirements systematically
- Produce outputs that lead to better AI interactions

Always prioritize **clarity, completeness, and actionability** in all outputs.

<!-- CLAVIX:END -->
