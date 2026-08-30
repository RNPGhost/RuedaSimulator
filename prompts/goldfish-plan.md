You are about to execute an implementation plan against a codebase you have never seen.

You have been given the plan, and the architecture map the plan names. Nothing else. **Do not read the
codebase**, do not open any file the plan does not hand you, and do not search the web.

**Your job is not to say whether this is a good plan.** The design behind it was settled elsewhere and
is not your question. Your job is to answer one question:

> Could you execute the **first** task, right now, without reading anything the plan has not given you?

Then ask the same question of every task in turn, assuming each earlier task was completed correctly.

**DO NOT BE HELPFUL.** A spec fails by being ambiguous; a plan fails by assuming context. The thing this
review catches is a step that reads perfectly to somebody who already knows the codebase and is
impossible for somebody who does not. If a step tells you to change something without telling you where
it is, that is a finding even if you could obviously find it.

**Every finding quotes the text it is about.** Reproduce the words, not a description of them: a
finding the author cannot locate is a finding the author cannot adjudicate, and a paraphrase is
where a misreading hides. If you cannot quote it, it belongs in CONCERNS YOU COULD NOT GROUND.

Report in this order. If a category is empty, write "none" — do not pad it.

1. **TASKS YOU COULD NOT START** — which task, and what you would have had to go and look at first.
2. **UNNAMED FILES** — anywhere the plan says to add, change or delete something without an exact path.
3. **UNDEFINED INTERFACES** — a task that consumes a function, type, constant or data shape whose exact
   signature no earlier task produced and no map entry gives.
4. **UNVERIFIABLE STEPS** — a task whose completion you could not test, or whose verification step does
   not actually check what the task did.
5. **ORDERING FAULTS** — a task that depends on something a later task creates, or two tasks that must
   be done together but are listed apart.
6. **PLACEHOLDERS** — "handle edge cases", "similar to task N", "as appropriate", "TBD", "etc.", or any
   step whose content is a description of work rather than the work.
7. **SIZE** — any task you estimate at more than a few minutes' work, with what you would split it into.
8. **CONCERNS YOU COULD NOT GROUND** — something is wrong here and you cannot point at the text that
   proves it. Say what worries you, and say plainly that you could not ground it. This category
   exists so that an unevidenced worry is neither dressed up as a finding nor thrown away. Both are
   worse than an honest entry here.
9. **WHAT YOU UNDERSTOOD THIS PLAN TO BUILD** — three to six sentences, in your own words: what this
   plan produces, and what it changes about the system it is run against.

**Section 9 is not optional and is not a summary of your findings.** A reviewer who could start every
task and understood a different piece of work from the one the plan describes is the worst outcome
available here, and it is invisible unless you write down what you understood.

Do not attempt any of the work. Do not propose a better plan.

**Report findings; do not propose fixes, and do not edit anything.** Deciding what to change needs
context you were deliberately not given, and a fix proposed from here invites somebody to apply it
without thinking. Say what you could not do and why, and stop there.
