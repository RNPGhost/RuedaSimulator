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

## The documents

`METHOD.md` defines four layers — intent, the map, plans, checks. This is what this project has in each.

### About the work

| Document | Owns | State |
|---|---|---|
| `METHOD.md` | how work is done here — the method | **written, reviewed five times by isolated reviewers, and not yet reduced.** 1,030 lines; the next task is making it smaller and fully sourced |
| `AGENTS.md` | this inventory | current. Does not yet meet every requirement `METHOD.md` §3 sets for an inventory — exact commands are given for some checks and not others |
| `ROADMAP.md` | the vision and the locked decisions, **and the backlog** | current |

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
| `test/run.js` | **the gate.** Characterisation compare plus property checks. Ends `✅ ALL GREEN`. Takes about 15 seconds |
| `test/invariants.js` | property checks — 10,659 of them, in numbered sections. Every section carries its own negative case |
| `test/golden.js` | characterisation — 357 movement, 132 engine, 6 interaction cases. `--update` re-baselines |
| `test/xref.js` | every `§X.Y` cited in the design documents resolves |
| `test/prompts.js` | every prompt is referenced by something, and nothing names a prompt that does not exist |
| `test/dedupe.js` | no run of five or more words appears in more than one of `METHOD.md`, `AGENTS.md` and the goldfish skill |
| `test/corpus-size.js`, `test/formation-lines.js`, `test/formation-perpendicular.js` | generators — the numbers and diagrams the documents quote are computed here |
| `test/harness.js` | loads the engine into a Node sandbox. **This is what "measure, don't assert" measures through** |
| `test/visual.js` | Chromium screenshots. Needs `playwright`; its browser path is hard-coded to Linux, so it does not run on this checkout |

### Skills

| | |
|---|---|
| `.claude/skills/goldfish/SKILL.md` | runs a goldfish review — picks the prompt, dispatches a fresh reviewer, brings findings back. The main agent does not need to know how |
| `skills-rueda-movements.md` | adding or changing one figure, call, position or formation. Predates `METHOD.md`; not yet reconciled with it |

### Reviewer prompts

Run by the `goldfish` skill, not read directly.

| | Asks |
|---|---|
| `prompts/goldfish-spec.md` | could you implement this document without asking anything? |
| `prompts/goldfish-method.md` | could you *follow* this process without inventing anything? — **not part of the standing loop**; a bespoke reviewer used while settling `METHOD.md` itself |
| `prompts/goldfish-plan.md` | could you execute this plan without reading anything it did not give you? |
| `prompts/goldfish-seam.md` | do these two documents disagree? |

Three documents in this repository carry a legacy `HISTORICAL — not current guidance` header:
`ARCHITECTURE_REVIEW.md`, `REFACTOR_PLAN.md` and `SMOOTH_PATHS_PLAN.md`. Do not follow them. Under
`METHOD.md` §3 those three should have been removed rather than labelled, so the header is itself out of
date; deleting them is on the backlog. It is not the same marker as an executed plan's, which `METHOD.md`
§4 Stage 8 defines and which stays.

## Commands

After any document edit, and before any commit:

```bash
node test/run.js && node test/xref.js && node test/prompts.js && node test/dedupe.js
```

`test/run.js` must end `✅ ALL GREEN`; the rest must report no problems. **All four green before anything
is committed** — and committing is not yours to start, so ask.

## Things that have gone wrong here before

Each is an instance of a rule in `METHOD.md` §6 — the rule is there, the local detail is here.

- **`restDancers()` needs its arguments.** Called without them it hands back an empty array, and every
  subsequent assertion vacuously holds. Check for `2n` dancers first.
- **The ring radius is stale unless the layout path runs.** `captureMovement` sets it. Read positions
  without going through it and you get whatever the previous call left behind — which once made the
  four-couple case match and every other count diverge, and read as confirmation.
- **Captured keyframes begin one animation step after rest.** Travel measured from frame 0 is short by
  that step. Start from the resting place.
- **`ROADMAP.md` is CRLF; every other document is LF.** A multi-line exact match against the wrong one
  matches zero times and says so to nobody.
- **Splicing near a status section has twice produced a truncated sentence here.** Look at the emphasis
  markers afterwards.
