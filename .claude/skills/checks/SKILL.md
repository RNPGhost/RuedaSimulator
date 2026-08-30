---
name: checks
description: Choose and write the right kind of check — property, characterisation, generator, structural audit, or a size-of-the-search assertion — and prove each by watching it fail before trusting it. Use when adding or changing a check, when a characterisation diff needs deciding on, or when a number a document quotes needs somewhere to come from. Sorting a defect before any check is written is the `bug` skill.
---

# Choosing the kind of check

Which checks this project has is the inventory's. What kinds there are, and why the kinds must not be
confused, is this document's.

**Property checks and characterisation checks are not interchangeable, and the distinction is
load-bearing.**

| | Asserts | A failure means |
|---|---|---|
| **Property** | something that must be true of *any* correct implementation | the system is wrong |
| **Characterisation** | the behaviour that exists right now, recorded | the behaviour changed — which may be exactly what you wanted |

**A characterisation diff is a question, not a verdict.** Read it, decide whether it is the improvement you
asked for, and re-baseline in one deliberate commit that does nothing else. A property failure is a
verdict and needs no interpretation. **New rules go in property checks**; new behaviour shows up in
characterisation. Putting a rule in the baseline is how it gets re-baselined away by somebody in a hurry.

**Three more kinds earn their place**, and a project missing them will not notice:

- **Generators.** Any number quoted in a document is computed by a committed script, so the document and
  the thing it describes cannot drift. Where the document has a diagram, the same script draws it.
- **Structural audits.** That every cross-reference resolves; that every normative reference is still
  pinned to what it was reviewed against; that a prompt reproduced in two places is the same prompt.
- **Size-of-the-search assertions.** How much was examined, asserted directly rather than inferred from
  the fact that nothing was found. A check can only find what it looked at, so "nothing was found" is a
  statement about the search and not about the system.
