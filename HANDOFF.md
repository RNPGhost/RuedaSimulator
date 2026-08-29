# Handoff — picking up at slice 3

> **Delete this file once you have read it and started.** It describes one moment, not the project. It
> is Layer 3: made for a single transition, used once, removed. If something in here is still true next
> month, it was in the wrong file and belongs in `ROADMAP.md`.

## Read these, in this order

Nothing is injected yet — `SessionStart` injection is slice 4 and is not built — so this is manual.

1. **`METHOD.md`** — the method as it stands, 1,010 lines. You are about to cut it to roughly 170.
2. **`ROADMAP.md`**, the section *The methodology's own remaining work* — the nine slices, **the full
   disposition table for slice 3**, the three conventions the `plan` skill will carry, and the list of
   what is settled and not to be reopened. This is the important one.
3. **`SOURCES.md`** — the evidence behind each rule. Read at least the kind breakdown at the top of
   `## Rules and the evidence behind them`.
4. **`AGENTS.md`** — what this project has, the commands, and the incidents that produced several rules.

## Where things stand

Slices 1 and 2 of nine are done and committed.

| | |
|---|---|
| **Slice 1** | seven checks and four hooks. The hooks are **live**: a reminder fires every turn, `.md` edits are audited automatically, and the commit gate refuses a red tree |
| **Slice 2** | `SOURCES.md` — 37 entries, **20 published, 9 measured here, 8 reasoned**. `METHOD.md` lost its own source list, 1,030 → 1,010 lines |

Nine checks, all green:
`run` · `xref` · `prompts` · `dedupe` · `markers` · `lineendings` · `skills` · `plan-citations` · `sources`

## What to do first

**Write the plan for slice 3**, then stop and have Sam review it before executing anything. One plan per
slice, written when the slice is reached. It goes in `plans/`, dated, and is deleted in the commit after
the one that completes the work.

Then run GATE 2 on it — the `goldfish` skill, `prompts/goldfish-plan.md`, a fresh reviewer given the
plan and nothing else. Expect findings; both previous plans needed a full rewrite after theirs.

## What not to redo

- **Do not re-derive where each part of `METHOD.md` goes.** It is in `ROADMAP.md`, worked out with the
  evidence in front of it. Argue with it if you disagree — but from that table, not from scratch.
- **Do not reopen the settled list** in the same section without a reason worth stating.
- **Nothing from any review is ever applied without Sam agreeing it, item by item.** Not the obvious
  ones. This is the rule the whole method exists to protect.

## The three things that have gone wrong repeatedly

Each cost real time in slices 1 and 2. `AGENTS.md` has the full list; these are the ones you will hit.

- **Backslashes do not survive the shell into `node -e` here.** Three separate assertions silently
  matched nothing. Write the script to a file in the scratchpad and run it.
- **A document describing a forbidden pattern contains it.** Strip fenced blocks *and inline code*
  before searching for one, or you will get false positives on exactly the documents you are protecting.
  `test/markers.js` already does this; throwaway assertions kept forgetting to.
- **`test/dedupe.js` will fight you while writing about `METHOD.md`'s rules**, because describing a rule
  in the words it is stated in is duplication. That is the check working. Reword; do not reach for the
  allow list.

## A note on Sam's part in this

He reviews everything and applies nothing automatically. The loop is: you write, a fresh reviewer reads,
you present findings **with** the section and in the order `.claude/skills/goldfish/SKILL.md` sets out,
he adjudicates, you apply exactly what he agreed. He decides whether another review is worth running.
