# AGENTS.md — the inventory

Rueda de Casino simulator: a top-down animation of the Cuban partner dance, in which couples stand in a
circle and perform called figures simultaneously, exchanging partners as they go. One self-contained
`index.html` — no build step, no dependencies, no network. All geometry is in engine units, never pixels.

## Read this first

**[`METHOD.md`](METHOD.md) is the procedure for all work here.** Read it first. It says when it applies,
and this file does not repeat any of it.

**This file is the inventory** — what exists, what each thing owns, what state each is in, and the exact
commands. `METHOD.md` holds the rules. The split is enforced by `test/dedupe.js`, which fails on any run of five
or more words shared between the two, bar a short allow list of terms both must be able to name. A rule
restated here is a rule that will one day disagree with itself.

**What it carries, for each thing it lists:** the file, and one line on what it owns; which of the four
layers or which of the four kinds of work-document it belongs to; what state it is in — current, live
but scheduled, or superseded, reviewed or not, built or not yet; the command that proves it works, and
what its output says when it has; and, where two of a kind both apply, which one wins.

**Three habits keep it honest.** It is written in the present tense, with no history and no rationale —
both belong elsewhere and would rot here at the first refactor. It says what is absent, because a
missing row and a thing that does not exist are indistinguishable otherwise, and the second is far more
useful. And it is where an agent starts, so it stays short enough to read in full every time.

## The documents

`METHOD.md` defines four layers — intent, the map, plans, checks. This is what this project has in each.

### About the work

| Document | Owns | State |
|---|---|---|
| `METHOD.md` | how work is done here — the method | **reduced to the core in slice 3**: 195 lines, eight imperatives and six tables, and injected from slice 4 into every session. Every rule in it is sourced in `SOURCES.md` |
| `AGENTS.md` | this inventory | current. Does not yet meet the requirements it states above — exact commands are given for some checks and not others |
| `ROADMAP.md` | the vision and the locked decisions, **and the backlog** | current |
| `SOURCES.md` | the evidence behind each of the method's rules, and where the method knowingly goes against a source it cites | in progress. **Nothing loads it and no workflow points at it**; its audience is whoever is reconsidering the process |

### Layer 1 — intent

| Document | Owns | State |
|---|---|---|
| `CORRIDORS.md` | the corridor model, the figure definition language, the path engine, verification | §1–§14 written; §15–§16 outstanding. Reviewed section by section, but **never reviewed as a whole document**, and its normative dependency below is unreviewed |
| `FORMATIONS.md` | how a formation is structured and addressed; the authoring language | drafted, **unreviewed**. §2.5 and §3.3 are the most load-bearing and the most recently changed |
| `SCHEDULING.md` | call validity, interrupts, what may run alongside what | not started |
| `MOVEMENT_SPEC.md` | the intake questions and conformance checklist for adding one figure | current, and a **second method-layer document**. **Precedence: `METHOD.md` wins wherever the two overlap**; this one covers only the per-figure intake, and reconciling them is on the backlog |
| `CALLING.md`, `PATHING.md`, `PASSING.md`, `ENGINE_MODEL.md`, `DECLARATIVE.md` | the engine **as it stands today** | **live but scheduled** — needed until the corridor engine lands, deletable the day it does |

### Layer 2 — the map

| | Owns | State |
|---|---|---|
| *(none)* | what lives where in the code | **does not exist.** Nothing in this project can currently tell you which file to open |

### Layer 3 — plans

| | | State |
|---|---|---|
| `plans/` | one plan per slice or per fix | **does not exist yet** |
| `CLEANUP_PLAN.md` | de-duplicating Grande/Pequeña, and the UI | a live plan, written before the convention existed |

### Layer 4 — checks

| | |
|---|---|
| `test/run.js` | **the gate.** Characterisation compare plus property checks. Ends `✅ ALL GREEN`. Measured at 22.1 seconds |
| `test/invariants.js` | property checks — 10,659 of them, in numbered sections. Every section carries its own negative case |
| `test/golden.js` | characterisation — 357 movement, 132 engine, 6 interaction cases. `--update` re-baselines |
| `test/xref.js` | every `§X.Y` cited in the design documents resolves |
| `test/prompts.js` | every prompt is referenced by something, and nothing names a prompt that does not exist |
| `test/dedupe.js` | no run of five or more words appears in more than one family-2 document. The skills are discovered on disk, not listed |
| `test/markers.js` | emphasis and backtick markers balance, section by section, across the five documents edited by script |
| `test/lineendings.js` | every `.md` and `.js` file is LF. 37 examined |
| `test/skills.js` | every skill is named somewhere, and nothing names a skill that is absent |
| `test/plan-citations.js` | every task in a plan cites a section of its spec, or the plan states why it has none |
| `test/sources.js` | every rule in `SOURCES.md` declares its kind — published, measured here, or reasoned — and carries a citation only where one fits |
| `test/corpus-size.js`, `test/formation-lines.js`, `test/formation-perpendicular.js` | generators — the numbers and diagrams the documents quote are computed here |
| `test/harness.js` | loads the engine into a Node sandbox. **This is what "measure, don't assert" measures through** |
| `test/visual.js` | Chromium screenshots. Needs `playwright`; its browser path is hard-coded to Linux, so it does not run on this checkout |

### Skills

| | |
|---|---|
| `.claude/skills/goldfish/SKILL.md` | runs a goldfish review — picks the prompt, dispatches a fresh reviewer, brings findings back. The main agent does not need to know how |
| `skills-rueda-movements.md` | adding or changing one figure, call, position or formation. Predates `METHOD.md`; not yet reconciled with it |

### Hooks

Wired in `.claude/settings.json`, each invoked as `node <script>` so one configuration works from every
shell. They exist because a rule the harness enforces cannot be forgotten late in a long session, and a
rule written down can.

| | Fires on | Does |
|---|---|---|
| `.claude/hooks/post-doc-edit.js` | `PostToolUse`, `Edit\|Write` | runs the five fast audits after any `.md` edit — about 220ms. Reports failures; cannot block |
| `.claude/hooks/pre-commit-gate.js` | `PreToolUse`, `Bash\|PowerShell` | on a `git commit` or `git push`, runs all eight and denies if any is red. On green it decides nothing, so the permission prompt still asks |
| `.claude/hooks/pre-compact-handoff.js` | `PreCompact`, `auto` | offers a handoff and a fresh session instead of compacting |
| `.claude/hooks/remind.js` | `UserPromptSubmit` | one line, every turn: findings are never applied unasked, and commits are never started unasked |
| `.claude/hooks/lib.js` | — | shared stdin/stdout plumbing. Never throws: a broken hook must not take the session with it |

`test/visual.js` is the one check the gate cannot run here, and it says so every time rather than
counting it as passing.

### Reviewer prompts

Run by the `goldfish` skill, not read directly.

| | Asks |
|---|---|
| `prompts/goldfish-spec.md` | could you implement this document without asking anything? |
| `prompts/goldfish-method.md` | could you *follow* this process without inventing anything? — **not part of the standing loop**; a bespoke reviewer used while settling `METHOD.md` itself |
| `prompts/goldfish-plan.md` | could you execute this plan without reading anything it did not give you? |
| `prompts/goldfish-seam.md` | do these two documents disagree? |

Three documents in this repository carry a legacy `HISTORICAL — not current guidance` header:
`ARCHITECTURE_REVIEW.md`, `REFACTOR_PLAN.md` and `SMOOTH_PATHS_PLAN.md`. Do not follow them. The
method's rule about superseded documents means those three should have been removed rather than
labelled, so the header is itself out of
date; deleting them is on the backlog. It is not the same marker as an executed plan's, which `METHOD.md`
§4 Stage 8 defines and which stays.

## Commands

```bash
node test/run.js && node test/xref.js && node test/prompts.js && node test/dedupe.js && node test/markers.js && node test/lineendings.js && node test/skills.js && node test/plan-citations.js && node test/sources.js
```

`test/run.js` must end `✅ ALL GREEN`; the rest must report no problems.

**You no longer have to remember to run these.** The five fast ones fire automatically after any `.md`
edit, and the commit gate runs all eight and refuses a red one. What the gate cannot know is whether
the commit was wanted, so it decides nothing on a green tree and leaves the asking to the permission
prompt — starting one is still not yours to do.

## Things that have gone wrong here before

Each is an instance of a rule in `METHOD.md` — the rule is there, the local detail is here.

- **`restDancers()` needs its arguments.** Called without them it hands back an empty array, and every
  subsequent assertion vacuously holds. Check for `2n` dancers first.
- **The ring radius is stale unless the layout path runs.** `captureMovement` sets it. Read positions
  without going through it and you get whatever the previous call left behind — which once made the
  four-couple case match and every other count diverge, and read as confirmation.
- **Captured keyframes begin one animation step after rest.** Travel measured from frame 0 is short by
  that step. Start from the resting place.
- **Every file is LF**, pinned by `.gitattributes` and asserted by `test/lineendings.js`. It was not
  always so — 13 files were CRLF, and a multi-line exact match against the wrong one matches zero times
  and says so to nobody. The measurement that found them examined 37 files; an earlier one had looked
  at five and reported the answer as though it covered the repository.
- **Splicing near a status section has twice produced a truncated sentence here.** Look at the emphasis
  markers afterwards.
