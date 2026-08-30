# Reviews — what has been reviewed, and what was rejected

`State` is one of exactly five values: `reviewed`, `not run`, `superseded`, `spent`, or a section range
such as `§1–§14`. `At` is the short commit the review ran against, or `—` where none was recorded.

**Normative dependencies are declared, not derived.** Nothing in this repository computes them. A
declared `none` and a missing line are different states, so every block carries the line.

## Documents

### `CORRIDORS.md`

**Normative dependencies:** `FORMATIONS.md`

| Review | State | At | Prompt |
|---|---|---|---|
| section | §1–§14 | — | `prompts/goldfish-section.md` |
| document | not run | — | `prompts/goldfish-document.md` |
| seam vs `FORMATIONS.md` | not run | — | `prompts/goldfish-seam.md` |

#### Rejected findings

*(none)*

### `FORMATIONS.md`

**Normative dependencies:** none

| Review | State | At | Prompt |
|---|---|---|---|
| section | not run | — | `prompts/goldfish-section.md` |
| document | not run | — | `prompts/goldfish-document.md` |

#### Rejected findings

*(none)*

### `METHOD.md`

**Normative dependencies:** none

| Review | State | At | Prompt |
|---|---|---|---|
| document | not run | — | `prompts/goldfish-method.md` |

#### Rejected findings

- **No check guards a single term against being reused.** Proposed after `GATE` was found meaning two
  things at once — the method's plan review, and `CORRIDORS.md`'s second drawing gate — and declined:
  the same collision could happen to any term this repository defines, so a check watching one of them
  is machinery for the instance rather than the class. Recurrence is the argument for revisiting; one
  occurrence is not.

### `AGENTS.md`

**Normative dependencies:** `METHOD.md`

| Review | State | At | Prompt |
|---|---|---|---|
| document | not run | — | `prompts/goldfish-document.md` |

#### Rejected findings

*(none)*

### `SOURCES.md`

**Normative dependencies:** `METHOD.md`

| Review | State | At | Prompt |
|---|---|---|---|
| document | not run | — | `prompts/goldfish-document.md` |

#### Rejected findings

*(none)*

### `PILOT.md`

**Normative dependencies:** `METHOD.md`

| Review | State | At | Prompt |
|---|---|---|---|
| document | not run | — | `prompts/goldfish-method.md` |

#### Rejected findings

*(none)*

## Plans

### `plans/2026-08-30-the-prompts.md`

**Normative dependencies:** none

| Review | State | At | Prompt |
|---|---|---|---|
| plan | spent | — | `prompts/goldfish-plan.md` |

#### Rejected findings

- **The routing fix is ordered after the tasks that assume it.** Rejected: it serves later plans, not
  this one. Nothing here is gated on it, and the reviewer that raised it conceded nothing breaks
  mechanically.
- **The rename and the referrer updates are two halves of one change listed apart** — raised alongside a
  second finding saying the new prompt is named before it exists. Rejected as one defect counted twice;
  merging the tasks answers both.
- **The draft is built from descriptions rather than text.** Rejected as a consequence of two other
  findings rather than a defect of its own; fixing those removes it.
- **`test/xref.js` would catch the inventory naming a check that does not yet exist.** Rejected on
  measurement: that check resolves section references and never file paths, so it would not fire.
- **Five findings reporting the code-writing tasks as unstartable**, each because the reviewer would
  have had to open a file it was forbidden to open. Rejected as findings against the plan, and recorded
  against the backlog instead: a plan reviewer is given only the plan plus whatever architecture map it
  cites, this repository has none, and so a plan touching code must always report those tasks
  unstartable.

### `plans/2026-08-30-pilot.md`

**Normative dependencies:** none

| Review | State | At | Prompt |
|---|---|---|---|
| plan | reviewed | `8ccbb03` | `prompts/goldfish-plan.md` |

#### Rejected findings

- **`test/run.js` cannot be green while another check is red.** Rejected on measurement: it loads the
  characterisation baseline and the property checks only, aggregates nothing, and ended `✅ ALL GREEN`
  in the very tree that had `test/reviews.js` red. The plan's wording invited the inference and gained
  a paragraph correcting it.
- **`test/dedupe.js` may hold a fixed document list, putting the plan's expected count out of reach.**
  It does hold one, and it has named `PILOT.md` since slice 1, dropping the name silently while the
  file is absent. No task was needed; the plan gained the list of what is compared.
- **`prompts/goldfish-method.md` is consumed and nothing shows it exists.** Rejected: this very check
  opens every prompt a block names and reports one that is missing, so a green run is what shows it.
  The five prompt names went into the plan regardless.
- **The `PILOT.md` text may have been altered when it was pasted into the plan.** Rejected on
  measurement: pulled out of the fenced block and compared byte for byte against the draft the
  collision readings came from — identical, 157 lines and 8,597 bytes.
- **`plans/` might sit inside `test/dedupe.js`'s set, comparing a document against its own quotation.**
  Rejected: that set holds the method, the pilot, the inventory, the evidence, this file and the seven
  skills, and nothing under `plans/` is in it.
- **Adding a referrer to `test/prompts.js` makes a row of the inventory wrong.** Rejected: neither
  that check's row nor `test/skills.js`'s quotes a referrer count. Both say what the check asks.
- **The task recording this review cannot be finished from the plan alone.** Rejected as a defect of
  the plan: no plan can carry a ruling nobody has made yet, and the convention for something a plan
  cannot state is a step that produces it. That step names where the ruling comes from and says to
  halt and ask when the session does not have it.
- **Four findings asking for tasks to be broken up** — the transcription into four, the two
  check-running tasks into run-then-compare halves, and this one away from its outside input. Rejected
  together: the transcription is a single write whose verifications already are that split, eleven
  commands is waiting rather than work, and breaking this one up strands an empty section across a
  boundary.
- **The handover step cannot be verified.** Rejected, and that is the intent: the artefact review is a
  person reading the file, and a step a check could confirm would be a different step altogether. It
  gained a mechanism, not a test.
