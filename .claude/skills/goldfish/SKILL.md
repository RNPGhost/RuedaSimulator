---
name: goldfish
description: Run a goldfish review — hand a document, a section, a plan, or two documents to an isolated reviewer that has been given no other context, and bring its findings back. Use when design text is ready to be checked, before a plan is executed, when an edit may have broken agreement between two documents, or whenever the user asks to review, check, or goldfish anything.
---

# Running a goldfish review

A goldfish is a reviewer given deliberately less context than anyone else involved: one document, one
prompt, nothing else. **That blindness is the instrument** — it cannot fill a gap from memory of the
conversation, so a gap it hits is real.

This file is the dispatch mechanics. **`METHOD.md` owns everything about what the findings then mean**:
the rule that nothing is applied without the author's say-so, the three dispositions, how much to defer
to which kind of finding, and each review's pass condition. Read it there; it is not repeated here.

## Pick the review

| Kind | Prompt | Hand the reviewer |
|---|---|---|
| **section** | `prompts/goldfish-spec.md` | one section, plus what it depends on |
| **document** | `prompts/goldfish-spec.md` | one whole design document |
| **plan** | `prompts/goldfish-plan.md` | the plan, and the map it names |
| **seam** | `prompts/goldfish-seam.md` | the two documents |
| **method** | `prompts/goldfish-method.md` | a process document |

**`method` is used only for settling a procedure document itself**, which is rare. On a design document
it asks the wrong questions.

## Dispatch it

One fresh subagent per review. Each rule below prevents an observed failure:

- **No inherited context.** No conversation history, no summary of what was decided, no "here is the
  background". A reviewer that sat through the design discussion passes everything.
- **Name every file it may read; forbid the rest explicitly** — the codebase, the web, other documents.
  If the target references something it was not given, whether it survives that absence *is the test*.
- **Hand it the prompt file** and tell it to follow that file exactly. Do not paraphrase the prompt into
  the dispatch: the prompt is calibrated, and paraphrasing recalibrates it.
- **Report to a file**, path named in the dispatch. Ask for a brief summary back — counts per category,
  plus the highest-value categories in full. Anything pasted into the main conversation stays resident
  there for the rest of the session.
- **Name the model.** Cheap for a section review, which is small and local. Strongest available for a
  document review, which must notice one section contradicting another, and for a seam review, which
  holds two documents at once. Unnamed, it inherits the session's — usually the most expensive.
- **One review, then stop.** Never dispatch a second with no human decision in between.

## Report back

**Verify anything checkable before you repeat it.** A claim that two statements contradict, that a file
says something, or that nothing implements a rule takes seconds to test — and a reviewer with limited
context gets these wrong predictably: *"not specified"* often means *"not specified to me"*, and it cannot
tell the difference. Check, then say what you checked.

**Then summarise and stop.** Say what was found, say which findings you would reject and why, and wait
for the author. Do not fix anything, and do not soften or inflate a finding — the author is adjudicating
every item and both distortions cost them time.

**If most of the report is wrong**, the likely cause is the wrong material or the wrong prompt, not a
stupid reviewer. Say so and offer to re-run it differently.
