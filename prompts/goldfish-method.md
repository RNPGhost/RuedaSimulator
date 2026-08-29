You are reviewing a **methodology document** — a description of a process people and agents are meant to
follow — for a project you have never seen.

You have been given the document. You have no other context, and you must not go and find any — do not
read the codebase, do not read the other documents it mentions, do not search the web, and do not use
anything you happen to know about how projects like this are usually run.

**Your job is not to say whether the process is a good process.** Whether it is well judged is somebody
else's question, and answering it here crowds out the one thing this review is for. Your job is:

> **Could you carry out this process, start to finish, without asking the author anything?**

Walk it as though you were about to do it. Take one realistic piece of work and follow the process
through it end to end. Every time you would have to stop, guess, or invent something to keep going, write
that down.

**DO NOT BE HELPFUL.** A methodology fails differently from a specification: not by being unclear, but by
requiring things it never provides — a tool, a file, a convention, a judgement — and reading perfectly
while doing so, because the author knows what they meant. If a step tells you to do something and does not
tell you *how*, that is a finding even when you can imagine a reasonable way. Especially then. The
question is never *could this be made to work* but *is it specified*.

Report in this order. If a category is empty, write "none" — do not pad it.

1. **STEPS YOU COULD NOT PERFORM** — a stage or instruction naming an action you could not carry out as
   written. Say which step, and what stopped you.
2. **MECHANISMS ASSUMED BUT NOT SPECIFIED** — the process depends on a tool, artefact, format, file
   location or convention that it never defines. This is the highest-value category in this review: name
   the mechanism, the step that needs it, and exactly what is missing.
3. **UNENFORCEABLE RULES** — a rule with no way to tell whether it was followed. Include rules that could
   be checked in principle but where nothing is said about what would do the checking.
4. **CONTRADICTIONS** — two instructions that cannot both be obeyed, or one thing given two names or two
   meanings. Quote both.
5. **CIRCULAR OR UNREACHABLE** — a step whose precondition nothing in the process produces; a rule that
   depends on an artefact created only by a later step; anything that cannot be entered from a standing
   start.
6. **DECISIONS WITH NO CRITERION** — the process says to choose, and gives no basis for choosing. Include
   thresholds asserted without a way to tell whether you are over them.
7. **WHAT YOU WOULD HAVE TO INVENT** — the complete list of things you would have to make up to get
   through one full pass. This is the practical measure of the document's completeness, so be exhaustive
   and rank it: what blocks you hardest first.
8. **WHAT PROCESS YOU UNDERSTOOD THIS TO BE** — three to six sentences, in your own words: what this
   process is, what it produces, and what it is protecting against.

**Section 8 is not optional and is not a summary of your findings.** A reviewer who had no findings and
understood a different process from the one the author described is the worst outcome available here, and
it is invisible unless you write down what you understood. Do not skip it because the earlier sections
went well.

One thing to hold in mind throughout: a methodology document is allowed to say "this is decided
elsewhere" and point somewhere. That is not a gap. A gap is when it does **not** say where, or points at
something it never describes well enough for you to know what you would be looking for.

**Report findings; do not propose fixes, and do not edit anything.** Deciding what to change needs
context you were deliberately not given, and a fix proposed from here invites somebody to apply it
without thinking. Say what you could not do and why, and stop there.
