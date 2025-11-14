---
description: Extract and CLEAR-optimize requirements from conversation
argument-hint: [prompt]
---

---
name: "Clavix: Summarize"
description: Extract and CLEAR-optimize requirements from conversation
---

# Clavix Conversation Summarization - CLEAR Framework Enhanced

You are analyzing the conversation history and extracting optimized requirements. **Extracted prompts are automatically enhanced using the CLEAR Framework** (Concise, Logical, Explicit) for optimal AI consumption.

## Instructions

1. Review the entire conversation and identify:
   - **Problem/Goal**: What is the user trying to build or solve?
   - **Key Requirements**: What features and functionality were discussed?
   - **Technical Constraints**: Any technologies, integrations, or performance needs?
   - **User Needs**: Who are the end users and what do they need?
   - **Success Criteria**: How will success be measured?
   - **Context**: Any important background or constraints?

2. Generate TWO outputs:

   **Mini-PRD** (structured document):
   ```markdown
   # Requirements: [Project Name]

   ## Objective
   [Clear, specific goal extracted from conversation]

   ## Key Requirements
   - [Requirement 1]
   - [Requirement 2]
   - [Requirement 3]

   ## Technical Constraints
   - [Constraint 1]
   - [Constraint 2]

   ## Success Criteria
   - [Criterion 1]
   - [Criterion 2]

   ## Context
   [Important background information]
   ```

   **Optimized Prompt** (AI-ready, 2-3 paragraphs):
   ```
   [Dense paragraph combining objective, key features, and user needs]

   [Technical requirements and constraints]

   [Success criteria and any important context]
   ```

3. **CLEAR Framework Optimization** (automatic):
   - After extracting the optimized prompt, it's analyzed using CLEAR framework
   - Applies Conciseness, Logic, and Explicitness enhancements
   - Displays both raw extraction and CLEAR-enhanced version
   - Shows CLEAR scores and improvements made
   - Saves CLEAR-optimized version as `clear-optimized-prompt.md`

4. Highlight key insights discovered during the conversation.

5. Suggest saving to `.clavix/outputs/[session-name]/`

6. If anything is still unclear or missing, point it out and suggest areas for further discussion.

## CLEAR Enhancement

**What gets optimized:**
- **[C] Concise**: Remove any verbosity from extracted requirements
- **[L] Logical**: Ensure coherent flow (context → requirements → constraints → output)
- **[E] Explicit**: Add missing specifications, formats, success criteria

**Output files:**
- `optimized-prompt.md` - Raw extraction from conversation
- `clear-optimized-prompt.md` - CLEAR-enhanced version (recommended for AI agents)

## Quality Checks

- ✅ Clear objective stated
- ✅ Specific, actionable requirements
- ✅ Technical constraints identified
- ✅ Success criteria defined
- ✅ User needs considered
- ✅ CLEAR framework applied for AI consumption

## Example

From conversation about "analytics dashboard for sales team"...

**Optimized Prompt**:
```
Build a real-time sales analytics dashboard for the sales team showing revenue trends, top performers, pipeline status, and conversion rates. The dashboard should update live as deals progress, support filtering by date range/region/rep, and display key metrics prominently. Users need to quickly identify at-risk deals and celebrate wins.

Technical stack: React + TypeScript frontend, integrate with existing Salesforce API, use Chart.js for visualizations, responsive design for mobile access. Must handle 10K+ deals without performance degradation.

Success: Sales managers can identify issues within 30 seconds of opening, dashboard loads in <2 seconds, 90% of team uses it daily within first month.
```
