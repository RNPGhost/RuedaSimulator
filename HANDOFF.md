# Handoff — `ELEPHANT.md`: review the round-D mechanism, then write §7

> **Do not delete this file when you start.** Everything under *Not yet durable* exists nowhere else.
> **Delete it once each of those has a home** — at that point this file is spent.

## You already have the imperatives

A `SessionStart` hook injected the overriding rule and the eight imperatives. **It did not give you the
rest of `METHOD.md`** — open it now.

## Read these, in this order

1. **`METHOD.md`**, whole.
2. **`ROADMAP.md`**, *Slice 7.1 in detail*, including the block *Staged, never written in place*. It wins
   wherever `ELEPHANT.md` disagrees with it.
3. **`ROADMAP.md`**, *Deferred*, the entry *"Separate the process documents from the content
   documents"* — it defines where specifications and kept process designs live.
4. **`ELEPHANT.md`** — opening block and §1–§6 are written. Read all of it.
5. **`REVIEWS.md`**, and **`.claude/skills/goldfish/SKILL.md`** for the order findings are presented in.

## Where things stand

- **§1–§6 are written**, and every section has had at least one section review whose findings are all
  ruled and applied. Last session ran one review each of §1, §3, §4, §5 and §6 (188 findings, 14 put to
  the author) and applied the result in one scripted pass, *round D* — 80 edits across `ELEPHANT.md` and
  `ROADMAP.md`.
- **Round D's text has not been reviewed.** Most of it is small wording from accepted findings. Three
  passages add mechanism, and are what the next review should read:
  1. **§6 *What it produces*** — a change to the process is never drafted against a process document;
     it always produces a process design, and a new process document is created by a slice. (Author's
     ruling, below.) It reaches §1's close-out paragraph and `METHOD.md` wording, §4's drafts, and
     `ROADMAP.md`'s *What it produces* and *Staged* blocks.
  2. **§5 *Reading a document as it will be*** — the apply script renumbers the result, rewrites
     citations of moved sections in every citing document, stops on a new repeated heading, and lists
     citations of a removed section, which are raised as a question about structure.
  3. **§3's new paragraph on arguing** — the agent may argue the approach, and against the change, but
     not past the author's ruling that the work is wanted; it never offers abandoning.
- **Nothing committed this session.** All ten fast checks green at the end of it; `test/run.js` was not
  run (no code changed); `test/visual.js` cannot run here.

## What to do

**Recommended unit of work:** a section review of the three passages above, brought back together; then
write §7 (replacing and retiring a document, now staged too), one section, with its review. The remaining
cut after that: §8, then §9–§10, then the document review and close-out.

---

## Not yet durable — this is why the file survives

### The author's rulings in round D — home: `ELEPHANT.md`, applied; recorded here until reviewed

- **A process change through an elephant never writes to a live process file**, not even as a diff that
  folds in later. The elephant's output is a process design, from which plans change `METHOD.md`, the
  skills, the hooks and the prompts. Reason given: an elephant writes far more than the author oversees,
  and writing it into active process files adds risk. A small change the author makes directly is not
  done through an elephant. **Whether a new process document is drafted inside the elephant or written
  by a plan depends on its complexity and on how much control the author wants — "the nuances can be
  agreed later".** That is an open question for whoever next designs a process change.
- **No document should have two sections with the same heading.** Existing pairs are raised as a defect
  (now a backlog entry); new drafts must not create one. A citation of a deleted section is flagged: the
  citing document must change, carefully, and may need its own review.
- **Arguing:** the agent may argue for a completely different way, or for reimagining the feature, but
  once the author says the work is wanted, the author is the authority. Push-back is for testing the
  approach; refusing is blocking.
- **Deferral is expected to be rare or never used**; only the dependent work waits.
- The rest were the agent's recommendations, accepted: the `METHOD.md` wording carries the exclusions,
  the author's right to call for an elephant, and the hold; the review rows merge at fold-in; the
  inventory points to the status convention instead of restating it; matching by heading chain;
  renumbering by the apply script; the checklist re-read after a ledger change; a deferred question
  goes on the checklist; separate work always goes to the backlog; a rerun report replaces the first;
  `ROADMAP.md` amended to drop the explicit defer.

### Open questions — raise before they are needed

1. **`ROADMAP.md` says a diff's fold-in marks the target `active`; `ELEPHANT.md` §6 says the target keeps
   its status.** Usually the same thing, since a target is normally `active`. One must change; `ROADMAP.md`
   wins until then.
2. **Measure whether resuming a conversation keeps the same transcript file** — §5 relies on it. Needs
   the author to resume a conversation.
3. **Still unanswered from earlier sessions:** two hedged interview answers never placed (*"though I
   could be persuaded otherwise"*, question 18; *"is fine, but I still don't really understand"*, a later
   question 2); *"I believe"* that every rejected alternative is captured bears on §7.

### Rulings waiting for the section that is their home

| Ruling | Home |
|---|---|
| Who retires a document, how retirement's mandatory list is produced and in what unit, whether retirement starts at the step-1 *replace* ruling or at sign-off, and what abandoning undoes after a *replace* ruling. **Revisit against the staging model**: a replacement is now staged too | §7 |
| `METHOD.md`'s three outcomes renamed **accepted**, **immaterial**, **rejected**; `METHOD.md:175`'s *"fixed" by somebody* stays | §8 |
| The memory file on how questions are put to the author is kept until the new elephant skill carries the same format, then deleted | §8 |
| *"Not for new documents only"* is a rejected alternative | §10 |

### §8's list — gathered so far

- `goldfish/SKILL.md`: drop *"Cheap for a section review"*; every review on the Opus tier at high effort;
  its opening calls a goldfish the least-informed reviewer, which the interview review is not; the
  presenting agent shows a re-raised finding with its earlier ruling.
- `METHOD.md`: the elephant section (§1's wording); imperative Two's clause; *"Record the rejections"*
  changes — nothing is kept past close-out; the line on where reasoning lives (§6); the superseded-document
  exception (§7).
- `prompts/goldfish-document.md`: the narrowed design-is-wrong question, and line 7's exception.
- Two new prompts (`goldfish-interview.md`, `goldfish-ledger.md`), the extractor script, the apply script
  (renumbering and citation rewriting included).
- `slice` and `plan`: read only `finalised` or `implementation ongoing`. `execute`: the status
  transitions and the fold-in step.
- The status check and the enumeration check; every existing specification gains a status line;
  `REVIEWS.md`'s person-reading row and `waived` state.

### Rejected and immaterial findings — carried until close-out (§5's rule)

**Standing:** a forward reference to an unwritten section is not a defect; a claim resting on a document
the reviewer was denied is not unverifiable, but is checked against it; a session always resumes or hands
off; a dated measurement does not go false; the writing standard and judgement words are the author's to
judge; where the `METHOD.md` wording is placed is §8's; bare numbers in the question rules are chosen.

**Earlier rounds:** as listed in `git show HEAD:HANDOFF.md`, which this file replaced.

**Round D, by kind** (73 rejected, 41 immaterial): already resolved by an earlier edit; one of the
standing kinds above; a judgement left to the author; restating what another section already settles;
illustrative figures cited to §9. The ones a later review is most likely to raise again: the for/not-for
table needs no tie-break (the author rules); *"remembers the whole conversation"* is the figure behind the
name; other pending diffs are not part of *as it will be*; an outside document is already as it will be;
`isMeta: false` never occurs (measured); a misjudged repeat-finding match costs nothing, since the author
rules again; no link from checklist items to ledger entries (the agent re-reads instead).

### Sources for §9, none yet in `SOURCES.md`

As listed in `git show HEAD:HANDOFF.md` — that table and the one in the handoff before it.

### Measurements §9 needs

- A conversation-only filter yields 7.3% of a transcript — 204,226 of 2.8M characters.
- The checklist lost an item within two exchanges when held in the conversation.
- On 2026-10-18: twenty transcripts, fifteen record types between them, the most in one fourteen; every
  conversation record carried a unique `uuid`; the question tool's name appeared in six of twenty.
- On 2026-10-25: background-task notices are bare-string `user` records with no `isMeta`, told apart only
  by `origin.kind` `task-notification` (5 of 460 across twenty transcripts at one point; 9 against 24
  `human` in one session later the same day). The session id is the scratch directory's parent.
- On 2026-10-25: `CORRIDORS.md` repeats *The frame* and *Timing*; `FORMATIONS.md` repeats *Its resting
  position*.

### `PILOT.md`'s artefact review, recorded nowhere

The author read `PILOT.md`; one finding: it says nothing about the elephant. §5 adds the person-reading
row and the `waived` state, and this finding is what it holds.

### Unrequested decisions, flagged and not reversed

They stand unless the author uses the word.

- Earlier sessions: as listed in `git show HEAD:HANDOFF.md`.
- Round D: hooks named among the process documents (*drop*); the pending-change sentence back to *"the
  code"* only, since process diffs no longer exist (*restore*); no *Rejected:* field added to `SOURCES.md`,
  since the case it served is gone (*add*); the apply script stops on a newly repeated heading (*warn*);
  the heading-chain example's format (*reword*); a citation of a removed section raised as a question
  about structure, its seam reviewed at step 7 (*other*); the measurement in §5 worded without counts,
  since they moved during the day (*counts*); a backlog entry for the repeated headings (*drop*); a
  deferral outside the interview carried by the handoff (*checklist*).

---

## What has gone wrong repeatedly

- **Never put a script inside `node -e`, and never use a heredoc for one.** Write it to a file.
- **Every document edit is an assertion-checked script** — exact strings, counted, nothing written
  unless each count is one. Confirm each replacement landed.
- **A measurement can be too literal.** Search for the idea, not one word.
- **Each round of fixes produces the next round's findings**, in the newest text. Review only what is new.
- **A rule added in one place must be carried to every place that depends on it**; list each.
- **An author's answer can reach further than the question.** Round D's item 2 was asked about one case
  and ruled on all process changes; carry the ruling, and say what else it moved.
- **Questions carry their own background; outcomes say what they do.** Never offer *fixed*; never let a
  section or step number stand in for what it means.

---

## The message that starts the next session

```
Continue the Rueda Simulator methodology rework on branch engine/pathing_rework. Read HANDOFF.md
first — it is at the repository root and tells you what to read, in what order, and where things
stand. Do NOT delete it when you start; it says when to delete it.

You are continuing slice 7.1: ELEPHANT.md, the design for the elephant. §1–§6 are written. Your unit
of work this session: run a section review over the three passages HANDOFF.md names as new mechanism,
and bring them back together; then write §7, one section, brought back with its goldfish section
review. Do not write §8 and do not write a plan.

Raise anything HANDOFF.md lists as open that bears on a section before you draft it, rather than
deciding it for me.

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
