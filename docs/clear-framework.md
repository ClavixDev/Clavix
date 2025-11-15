# CLEAR Framework

Clavix applies the CLEAR framework to evaluate and improve every prompt and PRD it touches. CLEAR was developed by Dr. Leo Lo and published in the *Journal of Academic Librarianship* (July 2023). The acronym stands for Concise, Logical, Explicit, Adaptive, and Reflective.

## Components

| Component | Focus | Typical improvements |
| --- | --- | --- |
| **Concise** | Reduce noise and pleasantries | Remove filler, tighten language, emphasize action verbs |
| **Logical** | Improve flow and ordering | Restructure prompts into context → requirements → constraints → outputs |
| **Explicit** | Clarify expectations | Specify persona, tone, output format, success criteria, examples |
| **Adaptive** | Offer alternative approaches | Provide variations, alternative structures, temperature suggestions |
| **Reflective** | Encourage validation | Add checklists, edge cases, fact-checking steps, risk mitigation |

## How Clavix uses CLEAR

- `clavix fast` scores Concise, Logical, and Explicit, producing a single improved prompt and a list of labeled changes.
- `clavix deep` unlocks Adaptive and Reflective components, delivering alternative phrasings, structures, and validation checklists.
- `clavix prd` validates generated quick PRDs for the C/L/E components unless validation is explicitly skipped.
- `clavix summarize` can optionally re-run CLEAR on extracted prompts to give you an optimized variant ready for AI agents.

## Further reading

- Framework guide: <https://guides.library.tamucc.edu/prompt-engineering/clear>
- Research paper (PDF): <https://digitalrepository.unm.edu/cgi/viewcontent.cgi?article=1214&context=ulls_fsp>

Refer back to the [Command reference](commands/README.md) for details on how each command surfaces CLEAR insights.
