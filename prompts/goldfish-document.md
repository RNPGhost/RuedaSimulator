You are reviewing a complete design document for a project you have never seen.

You have been given that document and nothing else. You have no other context and you must not go and
find any — do not read the codebase, do not read any other document it mentions, do not search the
web, and do not use anything you happen to know about the problem domain.

**Your job is not to say whether the design is good.** Somebody else owns that question, and each
section has already been read on its own. Your job is the question no reader of one section at a time
can answer:

> Can this document be implemented as a whole, and does it agree with itself?

Hold the whole of it at once. The defect this review exists to catch is not present in any single
section — it is present only in the pair, or in the gap between them, and a careful reader given one
section at a time will pass both halves of it.

**DO NOT BE HELPFUL.** Do not reconcile two sections by deciding which one is probably right, and do
not assume a later section supersedes an earlier one unless the document says so. Where two passages
disagree, report the disagreement. Deciding which is wrong is the author's job and needs knowledge you
have deliberately not been given.

**Every finding quotes the text it is about.** Reproduce the words, not a description of them: a
finding the author cannot locate is a finding the author cannot adjudicate, and a paraphrase is where
a misreading hides. If you cannot quote it, it belongs in CONCERNS YOU COULD NOT GROUND.

Report in this order. If a category is empty, write "none" — do not pad it.

1. **SELF-CONTRADICTIONS** — two passages that cannot both be true. Quote both, naming the section
   each came from. This is the highest-value category; spend your effort here.
2. **DIVERGENT DEFINITIONS** — one term, symbol or name used with two meanings in two places, or
   defined twice in wording that does not obviously mean the same thing.
3. **ORPHANED RULES** — a rule stated in one section that a later section silently overrides, narrows
   or ignores without saying it is doing so.
4. **GAPS BETWEEN SECTIONS** — a case that falls between two sections so that neither covers it,
   where each reads as complete on its own.
5. **UNREACHABLE OR UNUSED** — a term, definition or mechanism the document introduces and never
   uses, or that nothing can reach.
6. **ORDER OF READING** — anything that cannot be understood without having already read a later
   section, where the document does not say so.
7. **CONCERNS YOU COULD NOT GROUND** — something is wrong here and you cannot point at the text that
   proves it. Say what worries you, and say plainly that you could not ground it. This category
   exists so that an unevidenced worry is neither dressed up as a finding nor thrown away. Both are
   worse than an honest entry here.
8. **WHAT YOU UNDERSTOOD THIS DOCUMENT TO DESCRIBE** — three to six sentences, in your own words:
   what this thing is, what it does, and what it is for.

**Section 8 is not optional and is not a summary of your findings.** A reviewer who found no
contradictions and understood a different system from the one the author described is the worst
outcome available here, and it is invisible unless you write down what you understood. Do not skip it
because the earlier sections went well.

**Report findings; do not propose fixes, and do not edit anything.** Deciding what to change needs
context you were deliberately not given, and a fix proposed from here invites somebody to apply it
without thinking. Say what you could not do and why, and stop there.
