# Handoff — `ELEPHANT.md`: the staged-specification rework, then §6 and §7

> **Do not delete this file when you start.** Everything under *Not yet durable* exists nowhere else.
> **Delete it once each of those has a home** — at that point this file is spent.

## You already have the imperatives

A `SessionStart` hook injected the overriding rule and the eight imperatives. **It did not give you the
rest of `METHOD.md`** — open it now.

## Read these, in this order

1. **`METHOD.md`**, whole.
2. **`ROADMAP.md`**, *Slice 7.1 in detail*. It wins wherever `ELEPHANT.md` disagrees with it — **but it
   is now behind the author's rulings below** (it still says specifications are *"written directly"*).
   Amending it is the first task.
3. **`ROADMAP.md`**, *Deferred*, the entry *"Separate the process documents from the content
   documents"* (around line 910) — it defines where specifications and kept process designs live.
4. **`ELEPHANT.md`** — opening block and §1–§6 are written. Read all of it.
5. **`REVIEWS.md`**, and **`.claude/skills/goldfish/SKILL.md`** for the order findings are presented in.

## Where things stand

- **§5 (the reviews)** — written; two section reviews; every finding ruled and the accepted ones applied.
  The text applied after the second review has not been reviewed again.
- **§6 (what comes out)** — written; two section reviews. Round 1's findings all ruled and applied.
  **Round 2's findings are mostly unruled** (below), and **§6 is now largely wrong**: it assumes a
  specification is edited in place, which the author has since ruled out. Rewrite it rather than apply
  round 2.
- **Already-reviewed text changed in place this session:** §3 step 7 and §3's several-documents
  subsection (every pair of the design's documents gets a seam review); §3 step 8 item 1 (the ledger
  rerun also covers lines whose documents were edited); §4's report header (record id, not quoted first
  line) and §4's found-rule (now a pointer to §5); §3's abandonment paragraph (one sentence, *"settled
  text (§6)"* — **now wrong** under the staging model). `ROADMAP.md`: the close-out bullet (three actions;
  evidence moves to `SOURCES.md` in the slice that adds its rule) and the evidence-format bullet.
- **Nothing committed this session.** All eleven checks green at the end of it; `test/visual.js` cannot
  run here.

## What to do

**This session's unit of work:** amend `ROADMAP.md`'s slice 7.1 entry with the staging rulings below;
make the in-place changes they force in §1, §3, §4 and §5, listing each; rewrite §6 in full; section
review each changed section. **Raise the open questions below before drafting.** Then hand off. The
remaining cut after that: §7, then §8, then §9–10, then the document review and close-out.

---

## Not yet durable — this is why the file survives

### The staging model — ruled this session, home: `ROADMAP.md` 7.1, then §1, §3, §4, §5, §6

**A live specification is never edited in place by an elephant.** It reverses §1's and §3's *"edited in
place"* and `ROADMAP.md`'s *"written directly"*.

- **While designing**, everything the elephant writes is a working file in `elephant/<name>/`.
- **A change to an existing specification is a diff specification**: only the sections that change,
  each whole and labelled *added*, *changed* or *removed*, with a header naming the specification it
  amends and the commit it was written against. At copy-in, a section changed in the target since that
  commit is a collision, raised with the author.
- **A brand-new specification** carries no per-section labels; no diff header means a new specification.
- **At sign-off** a finalised diff specification sits alongside the specifications (wherever they live —
  the root today); a new one goes to its final path.
- **Every specification carries a status header**: `draft` (being worked on in an elephant), `finalised`
  (elephant complete, ready for slicing), `implementation ongoing` (first slice started), `active` (all
  work against it complete), `abandoned` (a kept staged file from an abandoned elephant; rare). An
  `implementation ongoing` document does not say which parts are built — the slice list holds that.
- **Transitions are made by the skill at a fixed event**, and a check guards them: close-out sets
  `finalised`; `execute` sets `implementation ongoing` when the first slice's plan starts and `active`
  when the last closes. The check fails on a missing status, a value outside the list, `draft` outside
  `elephant/`, and a diff header whose target does not exist.
- **A diff folds in only once its implementation is complete**, as the last step of implementation: its
  sections are copied into the target, the diff is deleted, the target is marked `active`. **While it is
  pending or being implemented, the target carries a header pointing at the diff**, and the diff carries
  its own status.
- **Reviews of staged text:** one script applies a pending specification to its live one; document and
  seam reviews read that applied document, built in the scratch directory, never the diff alone; the
  ledger review checks the staged file. The same script is what copy-in uses.
- **Abandoning:** clean-up deletes the staged change; nothing in a live specification needs undoing. A
  staged file the author keeps gets status `abandoned`, and `slice` and `plan` never read it.
- **Every existing specification gets a status header**, in a slice of its own; the check then requires
  it everywhere. **`CORRIDORS.md` and `FORMATIONS.md` are both `draft`** — still being designed, paused
  until this process is agreed.
- **The status header is the only home for a specification's status.** `AGENTS.md`'s *State* column keeps
  only what the header cannot say (e.g. "deletable when the corridor engine lands"); `REVIEWS.md` keeps
  review state.
- **A design's home** is a document the design itself can be written into: a specification,
  `METHOD.md`, `PILOT.md`, `SOURCES.md`, or one new document of that kind. **Skills and prompts are never
  a home**; a change to one goes through a process design, slices and plans. (§6 round-2 B1.)

**Superseded this session, do not reinstate:** sections moving into the live specification slice by
slice (the author's S2 ruling replaced it); the *settled* state and the `slice`/`plan` refusal keyed on a
running elephant's ledger; the *released* name (rejected: it implies implemented); an *abandoned* label
plus inventory list for kept edits in live documents (staging makes it unnecessary).

### Open questions — raise before drafting

1. **How the author reads a staged change.** Recommended: the whole document as it will be, each changed
   section visibly marked, the text it replaces folded beneath, written to the scratch directory by the
   apply script. Alternatives: old and new side by side per section; the finished document unmarked.
2. **`CORRIDORS.md` and `FORMATIONS.md` are `draft` at the root, but the check forbids `draft` outside
   `elephant/`.** Needs a rule: an exemption for documents that predate the elephant, or move them into
   an elephant when their design resumes, or relax the check.
3. **The target's pointer header while a diff is being implemented** — the code may already follow parts
   of the diff while the target still says the old thing. Recommended: the pointer says so in one fixed
   sentence.
4. **Naming and placing a diff specification beside its target** — not yet discussed.
5. **The fixed sentence for `implementation ongoing`.** The author was happy either way; the agent chose
   to put one sentence in the header itself (*"Not all of this is built. Treat it as intent, and check
   the code before assuming anything described here exists."*) as well as stating the convention in
   `AGENTS.md`. Reversal: *inventory* (status word only).
6. **Still unanswered from earlier sessions:** `ROADMAP.md`'s reason for keeping the checklist and ledger
   apart is stale (offered four times); two hedged interview answers never placed (*"though I could be
   persuaded otherwise"*, question 18; *"is fine, but I still don't really understand"*, a later question
   2); *"I believe"* that every rejected alternative is captured bears on §7.
7. **Measure whether resuming a conversation keeps the same transcript file** — §5 relies on it; nothing
   measured shows either way. Needs the author to resume a conversation.

### Rulings waiting for the section that is their home

| Ruling | Home |
|---|---|
| Who retires a document, how retirement's mandatory list is produced and in what unit, whether retirement starts at the step-1 *replace* ruling or at sign-off, and what abandoning undoes after a *replace* ruling. **Revisit against the staging model**: a replacement is now staged too | §7 |
| `METHOD.md`'s three outcomes renamed **accepted**, **immaterial**, **rejected**; `METHOD.md:175`'s *"fixed" by somebody* stays | §8 |
| The memory file on how questions are put to the author is kept until the new elephant skill carries the same format, then deleted | §8 |
| *"Not for new documents only"* is a rejected alternative | §10 |

### §8's list — gathered this session

- `goldfish/SKILL.md`: drop *"Cheap for a section review"*; every review on the Opus tier at high effort;
  its opening calls a goldfish the least-informed reviewer, which the interview review is not; the
  presenting agent shows a re-raised finding with its earlier ruling.
- `METHOD.md`: *"Record the rejections"* changes — nothing is kept past close-out; this also settles the
  *no chain of custody* contradiction. The line on where reasoning lives (§6).
- `prompts/goldfish-document.md`: the narrowed design-is-wrong question, and line 7's exception.
- Two new prompts (`goldfish-interview.md`, `goldfish-ledger.md`) and the extractor script.
- `slice` and `plan` skills: stop on a document a running elephant or a pending diff names — **rework
  for the status header**. `execute`: the status transitions and the fold-in step.
- The status check; the apply script; `REVIEWS.md`'s person-reading row and `waived` state.

### Rejected and immaterial findings — carried until close-out (§5's rule)

**Standing:** a forward reference to an unwritten section is not a defect; a claim resting on a document
the reviewer was denied is not unverifiable; a session always resumes or hands off; a dated measurement
does not go false; the writing standard is the author's to judge, not a check.

**From §1–§4** (earlier sessions): where the `METHOD.md` definition is placed; the for/not-for table
overlaps; exact insertion wording is plan content; `METHOD.md`'s "whole loop"; *"a claim with no check"*
applied to the proposal rule; a dated measurement in a kept file; the question rules cannot be checks;
bare numbers chosen, not measured; changing topic mid-elephant; an author who never rules; a section
review describing text later changed; *"you decide"* looping; the unsourced reasons for the question
form; no transcript kept; deleted files survive in git; the empty `elephant/` parent; the claims about
which checks read `plans/`.

**From §5:** findings cited to §9's figures; *five of eight* (measured, denied document); the harness
moving (the extractor failing is the check); the ignore-list decision against §2 (maintaining a tool is
not a design decision); the interview report format (§4 states it); *"raises one again"* (immaterial);
*family*, *record and type*, *cite* (immaterial); the one-word reversal, the five states, *seam*, the
`bug` skill claim (denied documents); injected text inside the author's record (measured: separate
records); edits from outside the elephant (immaterial); how citations are found (`METHOD.md`'s seam
rule); *the first turn of the interview* (the agent chooses it).

**From §6 round 1:** the kinds of evidence, the five states, the `METHOD.md` claim (denied documents);
the place for kept designs (ruled); readers other than `slice`/`plan` (immaterial); an abandonment
leaving no trace (by design); rejected findings kept by adding them to the design happens at ruling time.

**§6 round 2 — unruled.** Report: re-run the review against the rewritten §6 instead. The agent's
recommended rejections were: denied-document claims; *translation loses content* (reasoned); A3 and
the backlog's location (immaterial); abandoned elephants leaving no review rows (by design); pointers
going stale (immaterial); only `slice`/`plan` gated (immaterial).

### Sources for §9, none yet in `SOURCES.md`

The table in the previous handoff stands — recover it with `git show HEAD:HANDOFF.md`. Added this session:

| Source | What it measured |
|---|---|
| [Shefa et al., arXiv 2609.03230](https://arxiv.org/pdf/2609.03230) | requirements checking, ten models, 100 runs each: Opus 4.7 wrongly flagged 11% of sound requirements against Sonnet 4.6's 20%; precision 0.48 against 0.32. Abstract and body disagree on the headline figure — use the body |
| [ProcessBench](https://arxiv.org/pdf/2412.06559) | first-error finding: 7–8B models 5–33, GPT-4o 61.9, o1-mini 87.9; weak models flag everything or nothing |
| [CriticGPT](https://arxiv.org/html/2407.00215v1) | larger critics miss fewer bugs; critics nitpick and invent bugs more than humans |
| [Lu et al.](https://huggingface.co/papers/2512.02304.md) · [Goel et al.](https://arxiv.org/html/2502.04313v2) | same-model checking gains least, a different family most; model errors grow more alike with capability |
| [Qodo](https://www.qodo.ai/blog/which-llm-should-review-your-code/) | vendor code-review benchmark: Opus 5.5 F1 56.8% above Fable 5.1's 53.5%; about $1.00 a review |
| [Tricorder](https://research.google.com/pubs/archive/43322.pdf) · [Penix, FMCAD 2009](https://www.cs.utexas.edu/~hunt/FMCAD/FMCAD09/slides/penix.pdf) | effective false positives under 10% or an analyzer is pulled; about 5–8 minutes to triage one warning |
| [Macke & Doyle](https://arxiv.org/abs/2404.03114v1) · [CodeCrash](https://arxiv.org/abs/2504.14119) · [ClashEval](https://arxiv.org/abs/2404.10198v3) | incorrect documentation hurts LLMs, missing documentation does not; misleading comments −23.2%; false context adopted over a correct prior >60% |
| [OpenSpec](https://github.com/Fission-AI/OpenSpec/blob/main/docs/concepts.md) · [TC39](https://tc39.es/process-document/) · [W3C Process](https://www.w3.org/policies/process/) · [PEP 1](https://peps.python.org/pep-0001/) | staged changes: delta files merged after implementation; proposals merged at Stage 4; candidate amendments marked inline until agreed; a resolved PEP is a historical document |
| [Maldonado et al.](https://ieeexplore.ieee.org/document/8094425/metrics) | TODO-style markers removed 40.5–90.6% of the time; survivors last a median of 82–613 days |

### Measurements §9 needs

- A conversation-only filter yields 7.3% of a transcript — 204,226 of 2.8M characters.
- The checklist lost an item within two exchanges when held in the conversation.
- On 2026-10-18: twenty transcripts, fifteen record types between them, the most in one fourteen; every
  conversation record carried a unique `uuid`; the question tool's name appeared in six of twenty.

### `PILOT.md`'s artefact review, recorded nowhere

The author read `PILOT.md`; one finding: it says nothing about the elephant. §5 now adds the
person-reading row and the `waived` state, and this finding is what it holds.

### Unrequested decisions, flagged and not reversed

They stand unless the author uses the word.

- Earlier sessions: as listed in `git show HEAD:HANDOFF.md`, *Unrequested decisions*.
- §5: prompt names `goldfish-interview.md` / `goldfish-ledger.md` (*rename*); the interview reviewer gets
  the extract only (*context*); other reports stay outside the repository (*keep*); seams with outside
  documents that cite a changed section (*inside*); the opening table of reviews (*prose*); the prompt
  shape sits in *How every review is run* (*move*); the narrowed design-is-wrong wording (*reword*); the
  extractor starts with every type unlisted (*seed*); §4's found-rule replaced by a pointer (*restore*).
- §6: the sort as a table (*prose*); the `METHOD.md` line's wording (*reword*); *What never comes out*
  partly repeats §6 (*drop*); the commit rule for `REVIEWS.md` rows (*simplify*).
- Research notes and the two reports kept in the session scratchpad, not the repository (*repo*). The
  scratchpad does not survive; the sources table above is what was kept.

---

## What has gone wrong repeatedly

- **Never put a script inside `node -e`, and never use a heredoc for one.** Write it to a file.
- **Every document edit is an assertion-checked script** — exact strings, counted, nothing written
  unless each count is one. For a section rewritten whole, assert the current text equals the version
  last applied before replacing it.
- **Confirm the new text landed after every scripted replace.** Grep for a phrase from the new text.
- **A measurement can be too literal.** Grepping `ROADMAP.md` for *folder* missed the entry that defines
  the folder — it says *directory*. Search for the idea, not one word.
- **Each round of fixes produced the next round's findings**, in the newest text: §5 went 4 → 2 blocking
  over two rounds, §6 2 → 1, and the author's rulings then reshaped §6 again. Weigh that before
  recommending another round.
- **A rule added in one place must be carried to every place that depends on it** — the staging model
  touches §1, §3, §4, §5 and §6 and `ROADMAP.md`; list each.
- **Questions carry their own background; outcomes say what they do.** Never offer *fixed*; the author's
  words are *accepted*, *immaterial*, *rejected*, and for interview findings *answered*, *already
  settled*, *immaterial*.

---

## The message that starts the next session

```
Continue the Rueda Simulator methodology rework on branch engine/pathing_rework. Read HANDOFF.md
first — it is at the repository root and tells you what to read, in what order, and where things
stand. Do NOT delete it when you start; it says when to delete it.

You are continuing slice 7.1: ELEPHANT.md, the design for the elephant. The author has ruled that a
live specification is never edited in place: changes are staged, diff specifications fold in only once
implemented, and every specification carries a status header. Your unit of work this session: amend
ROADMAP.md's slice 7.1 entry with those rulings, make the in-place changes they force in §1, §3, §4
and §5, and rewrite §6 in full — one section at a time, each brought back with its goldfish section
review. Do not write §7 and do not write a plan.

Raise the open questions HANDOFF.md lists before you draft, rather than deciding them for me.

How I work: I review everything and nothing is applied without my say-so, item by item. Present
findings with the section, in the order .claude/skills/goldfish/SKILL.md sets out. Every item that
needs a decision from me gets one sentence saying what the issue is and why, then options, with your
recommendation first and clearly marked. Explain from the ground up — what the thing is and what
breaks without it — and say what each option does rather than naming it. Challenge my thinking
rather than agreeing with me. End each round by listing exactly which sections you changed, marked
rewritten-in-full or changed-in-place, calling out separately anything that touched
already-reviewed text, and flagging any decision I did not ask for with a one-word way to reverse it.

Measure, don't assert — node is on PATH, python is not. Never put a script inside node -e and never
use a heredoc for one. Write the script to a file and run it.
```
