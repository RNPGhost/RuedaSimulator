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

## Plans

### `plans/2026-08-30-the-prompts.md`

**Normative dependencies:** none

| Review | State | At | Prompt |
|---|---|---|---|
| plan | reviewed | — | `prompts/goldfish-plan.md` |

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
