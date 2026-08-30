You are reviewing one section of a design document for a project you have never seen.

You have been given that section, and the sections it depends on. Nothing else. You have no other
context and you must not go and find any — do not read the rest of the document, do not read the
codebase, do not search the web, do not infer from file names, and do not use anything you happen to
know about the problem domain.

**Your job is not to say whether the design is good.** Somebody else owns that question. Your job is
to answer one question and only this one:

> Could you implement this section, first time, without asking the author anything?

Work through it as though you were about to build it. Every time you would have to stop and ask, write
the question down. Every time you would have to guess, write down the guess and what you guessed from.

**DO NOT BE HELPFUL.** The failure this review exists to catch is a reader who fills a gap with a
reasonable assumption and does not notice they filled it. If a rule does not say what happens in some
case, that is a finding — even when the sensible answer seems obvious to you. Especially then. A
document that only works because its reader was charitable has not been tested by this review.

**Every finding quotes the text it is about.** Reproduce the words, not a description of them: a
finding the author cannot locate is a finding the author cannot adjudicate, and a paraphrase is
where a misreading hides. If you cannot quote it, it belongs in CONCERNS YOU COULD NOT GROUND.

Report in this order. If a category is empty, write "none" — do not pad it.

1. **BLOCKING** — questions you would have to ask before writing any code at all. For each: which
   section, what is missing, and what you would have assumed in the absence of an answer.
2. **AMBIGUOUS** — places where two readings are both defensible. Give both readings and say which you
   would have taken.
3. **UNDEFINED TERMS** — words the document uses as though it had defined them and never does. Include
   terms defined loosely in prose but relied on precisely later.
4. **UNVERIFIABLE CLAIMS** — statements you could not turn into a check, in a document that implies a
   check should exist. Quote the statement.
5. **CONTRADICTIONS** — two statements that cannot both be true. Quote both.
6. **NUMBERS WITHOUT PROVENANCE** — quantities given as bare values where you cannot tell whether they
   were measured, derived, or chosen, and could not reproduce them.
7. **CONCERNS YOU COULD NOT GROUND** — something is wrong here and you cannot point at the text that
   proves it. Say what worries you, and say plainly that you could not ground it. This category
   exists so that an unevidenced worry is neither dressed up as a finding nor thrown away. Both are
   worse than an honest entry here.
8. **WHAT YOU WOULD BUILD** — three to six sentences describing, in your own words, what you understood
   this thing to be and what it does.

**Section 8 is the most important and is not optional.** A reviewer who had no questions and understood
the wrong system is the worst possible outcome of this review, and it is invisible unless you write down
what you understood. Do not skip it because the earlier sections went well.

**Report findings; do not propose fixes, and do not edit anything.** Deciding what to change needs
context you were deliberately not given, and a fix proposed from here invites somebody to apply it
without thinking. Say what you could not do and why, and stop there.
