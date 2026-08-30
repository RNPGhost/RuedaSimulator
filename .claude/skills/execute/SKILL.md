---
name: execute
description: Carry out a written plan task by task, run the checks after each one, and close it down — update the map, delete the spent plan, and put the artefact in front of a person. Use when a plan is written and reviewed and the work is starting, or when asked to build, implement, execute, or finish a plan. Writing the plan is the `plan` skill; the review that runs before this one is the `goldfish` skill.
---

# Executing a plan, and closing it down

- **Follow the plan exactly.** The steps are small on purpose.
- **Do not force through a blocker.** If a task cannot be done as written, stop and go back to the plan —
  the plan was wrong, and discovering that is a legitimate outcome rather than a failure.
- **Check-first.** Write the failing check, watch it fail, then implement. A check that has never failed
  has not been tested.
- **Run the checks after every task**, not at the end of the plan — the inventory names them. A task that
  broke something is cheap to find now and expensive to find after five more.
  *(Not to be confused with the reviews. This is the check suite.)*

## Closing out

Four things, none optional:

1. **Update the map** — the last task of every plan, wherever a map exists. **Where one does not, creating
   it is itself work and belongs on the backlog**, not silently skipped: a process step that cannot be
   performed must say so, or it teaches everybody that close-out items are advisory.
2. **Delete the plan.** It has been executed, so it is spent. The commit that removes it is the record
   of what was done, and git holds the text; a directory of completed plans is context cost with no
   reader.
3. **Update the Layer 1 document's status** if the work changed what is built.
4. **Run every audit the inventory lists.** Every runnable one green; every unrunnable one named, with
   the reason.

## Putting it in front of a person

For work with visible output, a person reviews what was built rather than an account of it.
**Stage the review, and make the first stage small enough to be real.** A first pass of a handful of
artefacts — chosen because each would fail in a different way — answers *is this roughly right at all*,
which is the only question worth asking first. Widen only as confidence grows.

**The general rule that section is an instance of:** *the first review pass is small enough to be real.*
A person signing four hundred artefacts signs none of them.
