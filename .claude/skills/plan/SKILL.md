---
name: plan
description: Write the implementation plan for one slice or one fix — a Layer 3 document under plans/ describing a delta from the code as it is now, with the conventions every plan must carry and the rule for what to quote. Use when a slice has been chosen and is about to be built, or when asked to plan, spec out, scope, or write up how something will be done. Cutting work into slices comes first and is the `slice` skill; the finished plan goes to the `goldfish` skill for review, and only then to the `execute` skill.
---

# Writing a plan

A Layer 3 document: `plans/YYYY-MM-DD-<name>.md`. It describes **a delta from the code as it is now** to
the code as it should be. It is never a description of how to build the system from scratch.

```markdown
# <name> — implementation plan
> **Goal:** one sentence
> **Spec:** which Layer 1 document and which sections
> **Map:** the Layer 2 map, at the commit this was written against — or *none, and why*
> **Status:** in progress — deleted on completion

## Constraints
Exact values from the spec, not restated in the plan's own words.

## Task N — <name>
**Files:** exact paths, marked create / modify / delete
**Interfaces:** signatures consumed and produced
**Steps:** write the failing check → see it fail → implement → see it pass → run the checks
**Verification:** the exact command, and what its output must say
```

Rules, each earning its place:

- **Assume the implementer knows the domain poorly and the codebase not at all.** They are technically
  capable and have never seen this project.
- **No placeholders.** "Handle edge cases", "similar to task 3", "as appropriate", "TBD" are plan
  failures, not shorthand.
- **Bite-sized tasks** — a few minutes each, independently verifiable.
- **Exact signatures across task boundaries**, so task 6 consumes what task 2 actually produced.
- **Every task ends in a check that can fail.**

## Five conventions every plan carries

Stated here once, so no individual plan has to state them. Each was raised against more than one plan
before it was written down, and that repetition is the evidence: a finding that recurs across plans is a
missing convention, not a defect in the plan it was raised against.

1. **`ROOT` is declared, not assumed.** Every check opens with `const ROOT = path.join(__dirname, '..')`.
   A plan that specifies a check says so, rather than using the constant as though it arrived from
   somewhere.
2. **A file being modified is quoted at the point of change**, not merely named.
3. **A verification asserts the change, not the suite.** *"All checks green"* after a document edit is
   equally satisfied by having made no edit at all. The assertion names the text that must now be
   present and the text that must now be gone.
4. **Every post-edit value has a before-value in the first task.** Once an edit lands the original is
   not recoverable, and a transition nobody took the first reading of cannot be checked at all.
5. **Every task that edits a hook runs that hook.** A hook is the one artefact whose failure looks
   exactly like a quiet session, and no check in the suite exercises one by starting it.

## What to quote, and what not to

Quote what the implementer must have in front of them to perform the task and to verify it. Nothing
else — an over-quoted plan buries its own instruction.

- **A change** — quote the lines that change.
- **A deletion** — quote the bounds, and give a check that pins the extent. Not the contents: a plan
  need not reproduce what it is about to destroy, only say how far the destruction goes and how to
  tell it went that far.
- **A value the plan cannot state** — do not quote it; add the step that produces it. Anything created
  is given its name and its location, not left to the implementer to choose.
- **Something an earlier task alters** — quote that earlier task's stated output, not the file as it
  stands today, which by then will be wrong.

Rot is not a consideration: a plan is executed once and deleted, so a quoted copy has no time to
diverge. Noise is the only cost, and the first clause bounds it.

## Then it goes to review

A finished plan is not a started plan. It goes to a plan review first, run by the `goldfish` skill
with `prompts/goldfish-plan.md`, and the findings come back to the author with the plan rather than
after it. How a review is dispatched and what its findings then mean belong to `goldfish` and to
`METHOD.md`; neither is repeated here.
