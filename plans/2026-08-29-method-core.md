# The method core — implementation plan

> **Goal:** reduce `METHOD.md` from 1,010 lines to the rules an agent needs in *every* session, so that
> slice 4 can inject the whole of it into every session including trivial ones.
> **Spec:** none — this is family-2 tooling. What survives is settled in `ROADMAP.md` under *Slice 3 in
> detail*, which is backlog rather than a Layer 1 document and carries no numbered sections to cite.
> Recorded here because the plan format requires a spec or a stated reason for its absence.
> **Map:** none. This project has no Layer 2 map; building one is on the backlog. Every path below is
> given in full, and every file this plan modifies is quoted at the point of change.
> **Status:** in progress — deleted on completion.
> **Slice:** 3 of 9. The slice list is in `ROADMAP.md` under *The nine slices*.
>
> **Revision 5**, after a fourth GATE 2, which found two wordings that would have turned
> `test/dedupe.js` red during execution and one citation of an identifier that this plan's own deletion
> destroys. Six of the nine citation rewrites are now quoted in full rather than half a sentence, the
> thirty-nine-phrase command is written out here so no artefact has to survive between tasks, and the
> line-endings constraint no longer tells the executor to restore a carriage return into a repository
> that has none.
>
> **Revision 4**, after a third GATE 2. Revision 3's fault was a new one: the tasks that re-point
> citations named rules by hand, and three of the names they used are rules this slice deletes — so
> nine citations would have stopped dangling on a section number and started dangling on a rule, with
> every check green. Citations now resolve to a contract phrase or to the check that owns the rule, and
> Task 15 asserts that they do.

---

## Where this runs, and what it may read

**Repository root:** `C:\Users\RNP Ghost\Projects\Rueda Simulator`. Every path below is relative to it.

**Shell:** Git Bash on Windows. `git`, `grep`, `sed`, `wc` and `node` are on `PATH`; `python` is not.
Every verification command is POSIX and **every pattern is ASCII-only**, because a `grep` pattern
carrying a non-ASCII character is a verification that can fail for the wrong reason. The one search that
hunts a section sign matches it by its UTF-8 bytes under `grep -P`; measured, that form finds all eleven
occurrences. Line ranges are written with the word `to` rather than a dash for the same reason.

**The source text.** `METHOD.md` as it stands before this plan runs is the git object
`7013a33:METHOD.md`. Every line range in this document is against that object, and any of them is read
directly:

```bash
git show 7013a33:METHOD.md | sed -n '100,102p'
```

There is no working copy and no scratch directory. A git object cannot be lost, cannot be reconstructed
wrongly, and needs no path that belongs to one session.

**Nothing else is read.** The obligations table names every rule that must survive, the range that holds
it, and **the phrase that must appear in the finished document**. Every file this plan modifies is
quoted at the point of change, and the two passages of other documents it consumes are quoted in full.
`METHOD.md` itself is not reproduced: the convention this project records is that a deletion quotes its
bounds and gives a check pinning the extent, never its contents.

---

## The nine checks

Named once, so no task has to say *all nine* without saying which. This is the command the inventory
gives, and it is what **run the checks** means anywhere below:

```bash
node test/run.js && node test/xref.js && node test/prompts.js && node test/dedupe.js && node test/markers.js && node test/lineendings.js && node test/skills.js && node test/plan-citations.js && node test/sources.js
```

`test/run.js` must end `ALL GREEN`; the other eight must report no problems. Three of them print a count
this plan asserts on, so their expected lines are given once here: `PLAN CITATIONS  1 plan(s), 17
task(s) examined, 1 plan(s) exempt with a stated reason` throughout, unchanged by every task;
`PROMPTS  4 prompt file(s), 3 referrer(s) checked` throughout; and `DEDUPE   4 documents compared
pairwise, runs of 5+ words` throughout. **`test/visual.js` is not
one of the nine** — measured: `test/run.js` requires only `./golden` and `./invariants` and does not
invoke it. It needs a browser this checkout does not have, and Task 16 names it unrunnable rather than
counting it as passing.

**Run all nine after every task.** Each task lists only the assertions specific to it; the nine are
implied and are not repeated.

**Two terms these checks use, defined once because four tasks assert on them:**

- A **referrer** is a file named in a check's own `REFERRERS` array. `test/prompts.js` and
  `test/skills.js` each print a referrer count, and **that count is of referrer files that exist**, not
  of files that name anything. Measured: it therefore does not move when `METHOD.md` stops naming a
  prompt. `PROMPTS 4 prompt file(s), 3 referrer(s)` is the expected line before and after.
- An **unbuilt-mechanism marker** is the literal string `NOT BUILT`, written in the source object in
  bold and backticks. There are eight. None survives, so the assertion is on the bare string.

---

## What I measured

Checked against the tree rather than reasoned about.

**1. Three ranges in the disposition table were wrong, and two would have done damage.** §7's
anti-pattern table was given as 963–984 and runs 934–952; executing that would have deleted part of §8
*Git*, which holds *never commit or push unless asked* — a rule the same table says must survive. §9's
quick reference was given as 986–1004 and runs 974–1002. §3's *not yet built* table was given as 392–421
and runs to 428. **All three are corrected in `ROADMAP.md`**, along with two harmless ones, and its
provenance sentence now says so. Every range below is independently measured.

**2. De-numbering `METHOD.md` is safe.** `test/xref.js` parses nine sections out of it, `1` through `9`.
Measured: **no section number exists only in `METHOD.md`**; every one also resolves in `CORRIDORS.md` or
`FORMATIONS.md`. The fallback that accepts an unqualified cross-file reference does not depend on
`METHOD.md` having numbered headings, so removing them dangles nothing.

**3. Nine allow-list entries, ten occurrences.** `test/xref.js`'s `UNQUALIFIED_ALLOWED` holds **nine
entries** covering **ten occurrences** — `CORRIDORS.md §2.7` is cited twice, at lines 622 and 5701. All
four `METHOD.md` entries come from one line, `METHOD.md:208`, inside the illustrative `Normative
references` table this slice deletes. Removing them leaves **five entries and six occurrences**. The
array counts entries; the summary line counts occurrences. Task 5 changes both and says which is which.

**A stale allowance is a failure in that check**, so those four entries go in the same task as the
deletion that strands them: removed earlier they are red as unallowed, removed later red as stale.

**4. `test/dedupe.js`'s two expiring allowances behave differently.** That check has no stale-allowance
detection — adding it is on the backlog — so leaving them after the text goes is green and wrong.

**5. Naming a skill that does not exist turns `test/skills.js` red.** Its phantom rule is a backticked
name followed by whitespace and the word `skill`. Measured: `goldfish` is the only skill on disk, and
`AGENTS.md` names it in that form, so the core may name that one and nothing else.

**6. Obligation 7's wording is a duplication trap, and the escape is measured.** `SOURCES.md`'s entry is
headed *One session per unit of work*. A core sentence beginning *"One session per unit of work"* shares
two five-word runs with it and turns `test/dedupe.js` red. The sentence recorded in the obligations
table below was measured at **zero** shared five-word runs against `METHOD.md`, `AGENTS.md` and
`SOURCES.md` as they stand, and its contract phrase `hand off rather than` occurs zero times in all
three today.

**7. Task 4's replacement text is measured too** — zero shared five-word runs against the same three
files. And its assertions have baselines: `not repeated here` occurs **1** time in `SOURCES.md` today,
`argued in` **1**, and `rests on argument alone` **1** — the third at `SOURCES.md:324`, inside *The
lifetime rule*, which this plan does not touch. So the post-edit count for that phrase is **3**, not 2.

**8. Eleven citations of a `METHOD.md` section number live outside it**, re-measured after the
`ROADMAP.md` correction: three in `AGENTS.md`, five in `ROADMAP.md`, two in `test/xref.js`, one in
`test/plan-citations.js`. Nothing checks any of them, and all eleven have the document name and the
section sign on the same line, so a line-based sweep does see them.

**Three of those citations point at rules this slice removes from `METHOD.md`** — the normative-
references table, and twice the rule that a cross-document reference names its document. Re-pointing
them at a rule name would replace a dangling section number with a dangling rule. Tasks 14 and 15
therefore cite **the contract phrase** where the core keeps the rule, and **the check or backlog entry
that now owns it** where the core does not.

**`AGENTS.md` contains three occurrences of the string `§3`**, one of which cites `FORMATIONS.md`. No
task may assert that `§3` reaches zero there.

**9. `7013a33` does not appear in `ROADMAP.md`.** Zero occurrences.

**10. Baseline, so a change is distinguishable from no change.** All nine green. `ROADMAP.md` is **609
lines**. `AGENTS.md` is 142. `XREF 1260 references checked — 10 unqualified cross-file`. `MARKERS 286
section(s) examined across 5 document(s)`. `DEDUPE 4 documents compared`. `SOURCES 37 entries — 20
published, 9 measured here, 8 reasoned`. `SKILLS 1 skill(s), 2 referrer(s)`. `PROMPTS 4 prompt file(s),
3 referrer(s)`. `LINE ENDINGS 48 file(s)`.

---

## Four departures from the disposition table, all confirmed

Confirmed by the author. They are settled, and the plan is executable as it stands. The one-word
reversal is kept only so that reversing one later is an instruction rather than an argument.

**a. The core is written, not cut.** Compressing 1,010 lines to 170 moves surviving rules out of the
order and wording they sit in, and an excision that reorders is a rewrite with worse bookkeeping. The
obligations table is what keeps the rewrite honest. **Reverse: *excise*.**

**b. No section numbers and no section references in the core.** Numbering means every external citation
is re-pointed at numbers that move again at slices 6 and 9; de-numbering means they are re-pointed once,
at rule names. Measurement 2 says nothing breaks. **Reverse: *number*.**

**c. No skill named except `goldfish`, and no prompt at all.** All four reviews are run by `goldfish`, so
the *which skill runs it* column is fillable today. Slice 5 adds each further name as it creates the
skill. Measurement 5 says naming one early is a red check. **Reverse: *stub*.**

**d. No unbuilt-mechanism marker survives.** Deleting the section that explains the eight markers
without building any of the mechanisms would leave them pointing at nothing. Each affected rule is
dropped or restated as what happens today — *seams are identified by hand* rather than *seams are
computed, once something computes them*. **Reverse: *keep-markers*.**

**And no new check is written in this slice.** A check that the injected core stays under its bound
belongs with slice 4, which is what makes the size load-bearing. **Reverse: *size-check*.**

---

## Constraints

- **Every rule that survives is one an agent needs in *every* session**, because slice 4 injects the
  whole file into every session including trivial ones. The test is not *is this true* but *would a
  session go wrong without it, and would nobody find out*.
- **The pressure is instruction count, not page count.** Compliance with *all* instructions decays
  roughly exponentially with how many there are, while file length between 25 and 500 lines produced no
  detectable effect in the one study that measured it. 170 lines is a proxy; the target is a small
  number of separable obligations. Do not buy line count by welding two rules into one sentence.
- **`METHOD.md` names nothing belonging to the system this project builds.** It names its own
  furniture — the layers, the reviews, the `goldfish` skill — and no design document, source file or
  command. It should read as though it would apply to a different project unchanged.
- **The pass condition is stated once, for every review**, not four times. So is the rule that a finding
  is never applied unasked.
- **Reword rather than reach for an allow list.** `test/dedupe.js` fails on any run of five or more
  words shared between `METHOD.md`, `AGENTS.md`, `SOURCES.md` and the skills. Every contract phrase is
  at most four words, so no phrase trips the check alone — **but a phrase can steer a sentence into
  one, which is what happened to obligation 7 and is why its sentence is given rather than described.**
- **Every file edited here is LF**, pinned by `.gitattributes` and asserted by `test/lineendings.js`,
  which is one of the nine and so runs after every task. Normalise `\r\n` to `\n` before matching. Measured: **no file in this
  repository contains a carriage return**, so there is nothing to normalise and nothing to restore, and
  writing one back would fail that check.
- **Edit by exact-string replacement with the match counted**, failing before writing if the count is
  not exactly one.
- **Phrase assertions are case-insensitive** — `grep -ci` — so a phrase given here in lower case is
  satisfied by a sentence that begins with it.

---

## The obligations table

**The specification for Tasks 5 to 11, and the verification instrument for all of them.** Thirty-five
obligations and four header claims: **thirty-nine assertions in all**, and all thirty-nine are re-run at
Tasks 11 and 16.

*Where* is a measured range in `7013a33:METHOD.md`. *Phrase* must appear verbatim, case-insensitively,
in the finished `METHOD.md`; it is a contract, not a detection heuristic — the writer knows the list,
and a wording that will not accommodate a phrase is a reason to amend this plan, not to drop the
assertion. **new** marks a phrase not present in the source, which the writer introduces.

A row struck at review is a rule deleted, deliberately and on the record.

### The header — Task 5

Four claims, promoted into the contract so that Task 11's editorial cut cannot take them.

| # | The header must say | Phrase |
|---|---|---|
| H1 | it applies to agents and to people equally | `agents and to people` **new** |
| H2 | it is the procedure every other document here is written under | `every other document` **new** |
| H3 | it names nothing belonging to the system this project builds | `belonging to the system` |
| H4 | it is not a manual for work done inside a subagent | `inside a subagent` **new** |

### The eight imperatives — Tasks 5 and 6

Each is kept because a miss is unrecoverable: you would not find out.

| # | The imperative | Where | Phrase |
|---|---|---|---|
| 1 | No finding from any review is applied without the author saying so, item by item | 25–38 | `item by item` **new** |
| 2 | Argue. Agreement is the defect. Object first, never capitulate to be agreeable | 481–499 | `Agreement is the defect` **new** |
| 3 | One section at a time; stop; findings come back **with** the section, not after it | 537–538, 549–550 | `back with the section` |
| 4 | Settle it against the running system before writing it down, and prove you have the data first | 878–887 | `prove you have data` **new** |
| 5 | Never put an expiring thing inside a durable one | 67–69 | `expiring thing inside` |
| 6 | Which layer is this, and what does the work therefore owe? | 86–91, 436–438 | `what the work owes` **new** |
| 7 | One unit of work per session; hand off rather than run on | none — new rule | `hand off rather than` **new** |
| 8 | End every exchange with what changed, and flag anything nobody asked for | 555–557 | `nobody asked for` |

**Obligation 7 is a new rule and its sentence is given, not described.** Measured: the file contains no
rule about session length, handoff or compaction, though a `PreCompact` hook enforces one. The obvious
phrasing collides with `SOURCES.md`'s heading and turns `test/dedupe.js` red — measurement 6. **This
sentence measured green and is used as it stands:**

```
One unit of work, one session. Hand off rather than run on: obedience to instructions falls as a session
lengthens, and the fall is not visible from inside it.
```

Its evidence, for the author rather than the writer, is `SOURCES.md`'s entry *One session per unit of
work* — 1,650 sessions, about 5.6% lower odds of compliance per function generated; 16,991 trajectories
in which plans lost their grip as the trajectory lengthened. **Do not open that entry and do not quote
it.** The sentence above already carries the rule.

**Obligation 1 is the overriding rule**, and there is one obligation for both, not two. It goes at the
top, before the other seven, set apart as its own passage.

### The six tables — Tasks 7 and 8

The phrase for each is one of the column headings this plan specifies, so the assertion proves the table
has the shape asked for rather than merely mentioning the subject.

| # | Table | Columns | Where | Phrase |
|---|---|---|---|---|
| 9 | **The two families** | family · what it answers · members | 71–81 | `what it answers` **new** |
| 10 | **The four layers** | layer · the question it answers · tense · lifetime | 83–96 | `the question it answers` **new** |
| 11 | **What a change owes** | if the work produces … · it owes | 440–451 | `the work produces` |
| 12 | **The four reviews** | review · what it asks · why it cannot be merged | 456–467 | `cannot be merged` |
| 13 | **When each review fires** | runs on · what fires · which skill runs it | 803–816 | `which skill runs it` **new** |
| 14 | **The three dispositions** | fixed · accepted · rejected | 586–592 | `accepted with a reason` |

Table 13 gains the *which skill runs it* column, whose only value is `goldfish`. Table 14 may be three
sentences rather than three rows; the phrase must appear either way.

### The twenty-one rules — Tasks 9 and 10

| # | Rule | Where | Phrase |
|---|---|---|---|
| 15 | One document per subject, and the subject is a question somebody will one day ask | 165–167 | `One document per subject` |
| 16 | What a section is — a heading and everything under it to the next of equal or higher level | 174–177 | `of equal or higher` |
| 17 | A superseded document is deleted, not kept; extraction and deletion go in one commit | 234–259 | `superseded document is deleted` |
| 18 | An executed plan is deleted, never edited afterwards | 238–240, 289–299 | `never edited after execution` **new** |
| 19 | Noticed in passing goes on the backlog, never into the document you were writing | 350–362 | `goes on the backlog` |
| 20 | Layer 1 names no code; the name lives in a check, where rot fails loudly | 100–102, 112–114 | `names no code` |
| 21 | Layer 2 never explains why | 119–120 | `never explains why` |
| 22 | A claim with no check behind it is an opinion, however carefully argued | 122–123 | `with no check behind` **new** |
| 23 | The pass condition, stated once for every review: every finding adjudicated | 623–628 | `every finding adjudicated` **new** |
| 24 | A document is not reviewed while a normative dependency is unreviewed | 227–230 | `dependency is unreviewed` |
| 25 | A seam is reviewed when either side changes; re-review, do not only re-pin | 820–824, 930–932 | `either side changes` **new** |
| 26 | A review runs once; nothing re-runs it until a person has acted and asked | 835–842 | `runs once and stops` |
| 27 | The bug discriminator, as one routing line: could a check have caught this? | 854–856 | `have caught this` |
| 28 | Numbers quoted in a document are derived by a generator that runs with the checks | 889–897 | `derived in a generator` **new** |
| 29 | Constants are named, and rules are written in terms of the names | 899–900 | `Constants are named` |
| 30 | Edit documents with assertion-checked scripts: exact match, count it, fail before writing | 902–903 | `fail before writing` **new** |
| 31 | Every check is shown an input it must fail on | 919–920 | `input it must fail` |
| 32 | Never commit or push unless asked | 960–970 | `commit or push unless` |
| 33 | Do not reverse-engineer a specification from code | 936–944 | `reverse-engineer` **new** |
| 34 | Never hand-edit a derived artifact | 936–944 | `derived artifact` |
| 35 | Leaving a case out because the answer is obvious is indistinguishable from forgetting it | 936–944 | `and a case forgotten` |

Rules 33 to 35 are the three rescued from the anti-pattern table. Each is an authoring rule whose
failure is silent, and each is homeless once that table goes.

**Rules 28 and 31 were missing from the disposition table** and were added to it in this pass. Rule 31 is
the arguable one: the table's *to skills* row routes *negative cases* to the checks skill, which may
already cover it. It is kept in the core because a check written in an ordinary session should be shown
a failing input, and the skill will not be loaded in most of them. **Reverse: *checks-skill*.**

**Guard-the-measurement is not a separate row.** It is the second half of obligation 4.

### What does not survive

**These ranges are not a partition, and an earlier revision was wrong to claim they were.** They are
disjoint from every range above **except in one case, stated in its own row**: rows 33 to 35 are three
rows of a table that is otherwise deleted, and no line range separates them from it.

| Material | Where | Goes to |
|---|---|---|
| §1's four failure modes and the checks paragraph | 44–61 | already in `SOURCES.md`; deleted here |
| §2's no-code-names worked comparison | 104–110 | already in `SOURCES.md`; deleted here |
| §2's debt note against the no-code-names rule | 116–118 | expired — the debt is a `ROADMAP.md` entry already |
| §2's *other family, in full*, and the direction/backlog exception | 125–149 | folded into rows 9 and 19 as clauses, not passages |
| §3's normative-reference machinery | 179–226 | `ROADMAP.md` backlog, Task 2. Row 24 is the one line that survives, from 227–230 |
| §3's Layer 2 map guidance | 261–285 | row 21; the rest is the checks skill's, slice 5 |
| §3's *what an inventory must contain* | 306–334 | `AGENTS.md`, Task 12 |
| §3's Layer 4 kinds, corpora, structural audits, size-of-the-search | 364–390 | the checks skill, slice 5 — recorded in Task 1 |
| §3's *what is specified here and not yet built* | 392–428 | `ROADMAP.md` backlog, Task 2 |
| §4's stage structure and Stages 0 to 3 | 432–478, 501–535, 559–584, 594–619, 639–658 | the long-form argument is in `SOURCES.md`; the rules are rows 1–3, 12, 14, 23 |
| §4's Rensin quotation | 506–509 | `PILOT.md`, slice 7 — recorded in Task 1. `SOURCES.md` already records that it is adapted, not quoted |
| §4 Stage 4, slicing and the five cut axes | 660–726 | the slice skill, slice 5 — recorded in Task 1 |
| §4 Stage 5, the plan template | 727–758 | the plan skill, slice 5 — recorded in Task 1 |
| §4 Stages 7, 8 and 9 | 766–799 | the execute skill, slice 5 — recorded in Task 1 |
| §5's triage table and its third row | 846–850, 858–870 | the bug skill, slice 5 — recorded in Task 1. Row 27 keeps the discriminator, from 854–856 |
| §6's line endings, run-the-audits, marker balance, **qualified references**, pinning | 905–918, 922–928 | already enforced by the hooks and checks built in slice 1. **`test/xref.js` is what owns the qualified-references rule after this slice**, which is why Task 15 stops that file citing the method for it |
| §7's rebuild-from-documents diagnostic | 946–952 | already in `SOURCES.md`; deleted here |
| §8's opening | 956–958 | absorbed into row 32 |
| §9's quick reference | 974–1000 | deleted; it summarises a document from inside it |
| §9's *obviously and clearly* line | 1001–1002 | `PILOT.md`, slice 7 — recorded in Task 1 |
| §Sources, the five-line pointer | 1006–1010 | deleted; `AGENTS.md` already lists `SOURCES.md` |

---

## Task 0 — confirm the source object

**Files:** none.

**Steps:**

```bash
git show 7013a33:METHOD.md | wc -l
git show 7013a33:METHOD.md | sed -n '1p;208p'
```

**Verification:** the line count is 1010. Line 1 is `# Method — how this project is designed, built and
maintained`. Line 208 contains `3.2` — the line whose deletion Task 5's allow-list edit depends on. If
either differs, stop: the hash is wrong and every range in this plan is untrustworthy.

---

## Task 1 — record what slice 5 must recover, and from where

**Files:** `ROADMAP.md` (modify)

Roughly 230 lines leave `METHOD.md` in Tasks 5 to 11, for skills slice 5 has not written. Without an
exact pointer, slice 5 rewrites them from memory.

**Steps:** in `ROADMAP.md`, immediately after the blockquote ending with these two lines, verbatim:

```
> Rot is not a consideration: a plan is executed once and deleted, so a quoted copy has no time to
> diverge. Noise is the only cost, and the first clause bounds it.
```

insert a paragraph and a table headed **What slice 5 must recover, and from where**.

The paragraph is one sentence and says that slice 5 recovers this material with
`git show 7013a33:METHOD.md`. **Write it in the future tense, from slice 5's point of view** — *slice 5
recovers*, not *slice 3 removed* — because Task 5 has not run when this task does. **The hash appears on
that line and nowhere else in the insertion**, which is what makes the count below exact.

The table follows, one row per destination, exactly these six. **Its heading names no hash** — the
paragraph above it has already named the object:

| Destination | Lines in the source object |
|---|---|
| the slice skill | 660 to 726 |
| the plan skill | 727 to 758 |
| the execute skill | 766 to 799 |
| the checks skill | 364 to 390 |
| the bug skill | 846 to 850, 858 to 870 |
| PILOT.md, slice 7 | 506 to 509, 1001 to 1002 |

Write ranges with the word `to` rather than a dash, so the verification needs no non-ASCII pattern.
Write the skill names as bare words, never as a backticked name followed by the word *skill*:
`ROADMAP.md` is not a referrer for `test/skills.js`, so nothing fails today, but the phrasing gets copied
and the habit is what turns that check red later.

**Verification:**

- `grep -c '7013a33' ROADMAP.md` reports exactly 1 — measurement 9 says it was 0, and the hash is on one
  line of the insertion only.
- `grep -c 'What slice 5 must recover' ROADMAP.md` reports 1.
- `grep -c 'Lines in the source object' ROADMAP.md` reports 1 — the heading carries no hash.
- One assertion per row, so a missing destination fails: `grep -c 'the slice skill' ROADMAP.md`,
  `grep -c 'the plan skill' ROADMAP.md`, `grep -c 'the execute skill' ROADMAP.md`,
  `grep -c 'the checks skill' ROADMAP.md`, `grep -c 'the bug skill' ROADMAP.md` each report at least 1,
  and `grep -c '1001 to 1002' ROADMAP.md` reports 1.

---

## Task 2 — re-home the six unbuilt mechanisms as backlog entries

**Files:** `ROADMAP.md` (modify)

**Record `wc -l ROADMAP.md` before starting.** Task 1 has already grown the file, so this task's
baseline is what Task 1 left, not the 609 lines of measurement 10. **Tasks 1 and 2 are one body of work
split for size** — both insert into `ROADMAP.md`, neither is verifiable without the other's line count,
and they land in the same commit.

The *what is specified here and not yet built* section names six mechanisms. Deleting it deletes the
only record of two. The other four are accounted for and must not be duplicated.

**Steps:** leave each of the six in exactly one state.

1. **The reference graph** — already covered. Add nothing.
2. **Section pinning** — the same entry, which opens with these two lines, verbatim:

```
- **Build the normative-reference machinery, and pin what exists.** `METHOD.md` §3 requires every Layer 1
  document to carry a `Normative references` table listing the sections of other documents it depends on,
```

   That entry disagrees with `METHOD.md` today: it records that the agreed mechanism is *"not hashing: a
   table of (citing document, cited section, date last reviewed)"*, while the source specifies a hash.
   **Append one sentence to the end of that entry**, whose last line is, verbatim:

```
  `FORMATIONS.md`.
```

   The sentence says that slice 3 **ends that contradiction** by removing the hash specification — use that phrase, and write it as something slice 3 does. Its first
   two lines also carry one of the nine citations; that is Task 14's, and this step does not touch them.
3. **The dependency closure** — not on the backlog. Add an entry.
4. **Review report locations** — resolved, not deferred. `.claude/skills/goldfish/SKILL.md` already
   requires the dispatch to name the report path. Add nothing, and do not carry the marker forward.
5. **The disposition record** — slice 6 delivers its format and the slice table already says so. Add
   nothing.
6. **The review-state record** — not on the backlog. Add an entry.

**Where the two new entries go, and what shape they take.** They join the section that opens, verbatim:

```
### Deferred — noticed, parked deliberately
```

Append them at the end of that section. Its last entry closes with these three lines, verbatim; the two
new entries go after them and before the `## How the current work already feeds the vision` heading:

```
  `CALLING.md`, `PATHING.md`, `PASSING.md` and `ENGINE_MODEL.md` are **not** in this set. They describe
  the engine that exists, agents need them until the corridor engine lands, and they become deletable on
  the day it does.
```

This existing entry is the exemplar —
short, complete, and quoted in full so its shape needs no describing. **Task 3 step 6 later edits it;
copy its shape, not its words:**

```
- **Give `test/dedupe.js` stale-allowance detection.** `test/xref.js` fails when an entry in its
  allow list no longer occurs, so the list cannot quietly outlive the debt it records. `dedupe.js` has
  no equivalent, and it now carries two allowances that expire when slice 3 rewrites `METHOD.md` — the
  two claims `SOURCES.md` quotes verbatim in order to correct them. Copy the mechanism across.
```

Bold lead-in naming the thing; what it is; why it is not done; what picking it up needs. Write these two
to that shape:

- **The dependency closure** — what a section transitively depends on. Needed as the input to every
  section review. Until it exists a person chooses what the reviewer is shown and says so in the
  dispatch, which at least makes the choice visible enough to argue with. Picking it up needs the
  reference graph, so it follows that entry.
- **The review-state record** — where a document's reviewed-or-not status lives. Needed by the rule that
  a document is not reviewed while a normative dependency is unreviewed. **Cite that rule by its words,
  never by a number** — obligation numbers live in this plan and this plan is deleted at Task 16, so a
  number written here would point at nothing within the hour. Until it exists the inventory carries the
  status as prose and it is unverifiable. Picking it up
  needs somewhere durable to write a status, which is the same want as the disposition record.

**Verification:** `grep -c 'dependency closure' ROADMAP.md` reports at least 1.
`grep -c 'review-state record' ROADMAP.md` reports at least 1. `grep -c 'ends that contradiction'
ROADMAP.md` reports 1. `wc -l ROADMAP.md` has grown by between 8 and 20 lines against the count Task 1
left.

---

## Task 3 — retire the `ROADMAP.md` entries this slice spends

**Files:** `ROADMAP.md` (modify)

**Before Tasks 14 and 15, deliberately.** One of the eleven section citations lives inside an entry this
task deletes. Doing this first means the sweep in Task 15 has nine to account for and can assert
globally; doing it after means that assertion cannot pass.

**Record `wc -l ROADMAP.md` before starting.** The baseline was 609 before Task 1; Tasks 1 and 2 both
grow the file, so the number to measure against is the one this task starts from, not 609.

**Steps:** six edits. Each deletion is bounded by its first and last line, both quoted.

1. Replace this paragraph, both lines, verbatim:

```
**This is the next agent's task and it comes before everything else here.** `METHOD.md` is 1,030 lines
and works; it is not yet as small or as well-sourced as it should be.
```

   with a paragraph saying the reduction is done, the evidence behind each rule is in `SOURCES.md`, and
   what remains of the methodology work is slices 4 to 9. It must contain the phrase `slices 4 to 9`.

2. Delete the bullet running from, verbatim:

```
- **Reduce it to its smallest correct form.** Every rule that survives should be one an agent needs in
```

   to, verbatim:

```
  document — and is the place to look first.
```

   Four lines. Slices 2 and 3 executed it.

3. Delete the bullet running from, verbatim:

```
- **Make every rule traceable.** Several rules are currently argued rather than sourced. The Sources
```

   to, verbatim:

```
  future reader cannot tell a researched rule from a plausible one.
```

   Three lines. Slice 2 executed it. **The bullet after it, beginning `- **The three open questions are
   answered**`, stays** — it records answers, not work.

4. Delete the entry running from, verbatim:

```
- **Delete `METHOD.md`'s "What is specified here and not yet built" section.** It lists the mechanisms
```

   to, verbatim:

```
  record of its own history.
```

   Eight lines. Task 5 does it and Task 2 re-homed what it held. **This entry holds one of the eleven
   citations**, which is why it is deleted here rather than rewritten later.

5. Replace this entry in full — five lines, quoted from first to last:

```
- **Clear the ten unqualified cross-file references.** `test/xref.js` now fails on any new one, and
  holds these ten in `UNQUALIFIED_ALLOWED` as recorded debt: two in `CORRIDORS.md`, three in
  `FORMATIONS.md`, four in `METHOD.md`. The `METHOD.md` ones sit inside its illustrative
  Normative-references table and disappear when that section does. Clearing one means deleting its
  entry — a stale allowance is itself a failure, so the list cannot quietly outlive the debt.
```

   The replacement keeps the bold lead-in but for the new count: **five entries covering six
   occurrences** — use that phrase — two in `CORRIDORS.md` and three in `FORMATIONS.md`; it records that
   **slice 3 clears** the four `METHOD.md` entries, in the present tense, because Task 5 has not run when
   this task does; and it keeps the closing rule that a stale
   allowance is itself a failure.

6. Replace this entry in full — four lines, quoted from first to last:

```
- **Give `test/dedupe.js` stale-allowance detection.** `test/xref.js` fails when an entry in its
  allow list no longer occurs, so the list cannot quietly outlive the debt it records. `dedupe.js` has
  no equivalent, and it now carries two allowances that expire when slice 3 rewrites `METHOD.md` — the
  two claims `SOURCES.md` quotes verbatim in order to correct them. Copy the mechanism across.
```

   The mechanism is still missing, so the entry stays; only the spent clause about two allowances goes.
   The replacement keeps the lead-in, the comparison with `test/xref.js`, and the closing sentence
   `Copy the mechanism across.`

**Verification:** each step asserted both ways. **Every `reports 0` below has a measured baseline of
exactly 1** — all nine strings were counted in `ROADMAP.md` before this plan was written and each
occurs once — so a zero is evidence of the edit and not of a string that was never there.

- `grep -c '1,030' ROADMAP.md` reports 0, and `grep -c 'slices 4 to 9' ROADMAP.md` reports at least 1.
- `grep -c 'Reduce it to its smallest correct form' ROADMAP.md` reports 0, and
  `grep -c 'is the place to look first' ROADMAP.md` reports 0 — the bullet's closing line, so a partial
  deletion fails.
- `grep -c 'Make every rule traceable' ROADMAP.md` reports 0, and `grep -c 'a plausible one' ROADMAP.md`
  reports 0. `grep -c 'three open questions' ROADMAP.md` reports 1 — the bullet that stays.
- `grep -c 'What is specified here and not yet built' ROADMAP.md` reports 0, and
  `grep -c 'record of its own history' ROADMAP.md` reports 0.
- `grep -c 'ten unqualified' ROADMAP.md` reports 0, and `grep -c 'five entries covering six' ROADMAP.md`
  reports 1.
- `grep -c 'two allowances that expire' ROADMAP.md` reports 0, and `grep -c 'Copy the mechanism across'
  ROADMAP.md` reports 1 — the entry survived its rewrite.
- `wc -l ROADMAP.md` has fallen by between 8 and 22 lines against the number recorded at the start of
  this task. Fifteen lines are deleted outright; steps 1, 5 and 6 rewrite and may add or remove two or
  three, which is what the range allows for.

---

## Task 4 — carry into `SOURCES.md` the two arguments about to be deleted

**Files:** `SOURCES.md` (modify)

Before Task 5 removes the text these entries point at. The lines to change are, verbatim:

```
### The two families

**Kind:** reasoned
**Evidence:** none. The argument for it is in `METHOD.md` and is not repeated here — restating it would
put one rule in two places, which is the thing this document least wants to do.
**Departs:** no

### The four layers

**Kind:** reasoned
**Evidence:** none. As above: argued in `METHOD.md`, not evidenced anywhere.
**Departs:** no
```

**Steps:** replace the two `**Evidence:**` lines, and only those, with the text below. `**Kind:**
reasoned` and `**Departs:** no` are untouched in both entries. This text was measured against the
duplication check before being written here — zero five-word runs shared with `METHOD.md`, `AGENTS.md`
or `SOURCES.md` as they stand — so it is used as given rather than paraphrased.

For **The two families**:

```
**Evidence:** none, and the case for it is argument rather than measurement. Writing about how work is
carried out and writing about what a program has to do serve different readers and are revised for
different reasons; a specification that admits the first begins to collect procedural asides, one at a
time, until nobody can tell which of the two it is. It rests on argument alone.
```

For **The four layers**:

```
**Evidence:** none, and again by argument. Each layer is defined by how long its contents stay true, so
that the prohibition on mixing lifetimes has something to bite on. Without the layers that prohibition
is advice; with them it is a question anybody can answer about any paragraph. It rests on argument
alone.
```

**Verification**, against measured baselines rather than assumed ones — measurement 7:

- `grep -c 'not repeated here' SOURCES.md` reports 0, down from 1.
- `grep -c 'argued in' SOURCES.md` reports 0, down from 1.
- `grep -c 'collect procedural asides' SOURCES.md` reports 1 and `grep -c 'something to bite on'
  SOURCES.md` reports 1 — one per entry, so writing one and not the other fails.
- `grep -c 'rests on argument alone' SOURCES.md` reports **3**, up from a measured baseline of 1. The
  third occurrence is at `SOURCES.md:324` inside *The lifetime rule* and is not touched.
- `node test/sources.js` reports `37 entries — 20 published, 9 measured here, 8 reasoned`, unchanged.

---

## Task 5 — replace `METHOD.md`, and clear the four stale allowances

**Files:** `METHOD.md` (replace), `test/xref.js` (modify)

**These two edits are atomic and cannot be separated.** Measurement 3: the four allowances are red as
unallowed if removed before the replacement and red as stale if removed after. This is the largest task
in the plan and it is as small as it can be made — the new document holds only its header and the first
four obligations, and the `test/xref.js` edits are mechanical.

**Bounds of the deletion.** The whole file, line 1 to line 1010.

**Steps:**

1. Replace `METHOD.md` with: the title; a header of no more than eight lines making the four claims H1
   to H4; **obligation 1**, the overriding rule, set apart as its own passage immediately after the
   header; and **obligations 2, 3 and 4**, with one or two sentences each on why a miss is unrecoverable.
2. No section reference anywhere. No numbered heading. No `NOT BUILT`. No `prompts/` path. No skill name
   except `goldfish`.
3. In `test/xref.js`, the list to change is, verbatim:

```js
const UNQUALIFIED_ALLOWED = [
  { doc: 'CORRIDORS.md',  ref: '2.7' },
  { doc: 'CORRIDORS.md',  ref: '2.6' },
  { doc: 'FORMATIONS.md', ref: '13' },
  { doc: 'FORMATIONS.md', ref: '14' },
  { doc: 'FORMATIONS.md', ref: '9.2' },
  { doc: 'METHOD.md',     ref: '3.2' },
  { doc: 'METHOD.md',     ref: '5.5' },
  { doc: 'METHOD.md',     ref: '9.3' },
  { doc: 'METHOD.md',     ref: '2.5' },
];
```

   Delete the four `METHOD.md` rows. Five entries remain, covering six occurrences.

4. In the same file, the comment above that list reads, verbatim:

```
 * METHOD.md §6 requires every cross-document reference to name its document: a bare §ref cannot be
 * attributed to a file by any tool, so a reference nobody can attribute is a reference nobody can
 * check. These ten predate the rule being enforced and are cleared by the family-1 alignment task.
 * They are DEBT, not an exemption on principle — nothing new may join this list.
 *
 * KEYED ON DOCUMENT AND SECTION, NOT LINE. Line numbers move the moment anything above them is
 * edited, and a list that fails whenever a document is touched is a list somebody deletes. The four
 * in METHOD.md sit inside its illustrative Normative-references table, which is scheduled for removal.
```

   Change `These ten predate the rule` to say that **five entries covering six occurrences** predate it,
   spelling out that the array counts entries and the summary line counts occurrences — that ambiguity
   is what made an earlier revision of this plan get the number wrong. Replace the final sentence with
   one recording that the four `METHOD.md` entries were **cleared in slice 3** when that table was
   removed; use that phrase. **The block's first line carries one of the nine citations and is Task
   15's. Leave it exactly as it is.**

**Verification:**

- `wc -l METHOD.md` — under 60 at this task.
- The four header phrases, `grep -ci` each reporting at least 1: `agents and to people`,
  `every other document`, `belonging to the system`, `inside a subagent`.
- The four contract phrases for obligations 1 to 4, `grep -ci` each reporting at least 1:
  `item by item`, `Agreement is the defect`, `back with the section`, `prove you have data`.
- The five absence assertions, each reporting 0: `grep -c 'NOT BUILT' METHOD.md`,
  `grep -c 'prompts/' METHOD.md`, `grep -c 'Normative references' METHOD.md`,
  `grep -cE '^## [0-9]' METHOD.md`, and `LC_ALL=C grep -cP '\xc2\xa7[0-9]' METHOD.md`.
- `grep -c "doc: 'METHOD.md'" test/xref.js` reports 0, and `grep -cE "^  \{ doc: '" test/xref.js`
  reports 5 — anchored to the array's own indentation.
- `grep -c 'These ten predate' test/xref.js` reports 0. `grep -c 'scheduled for removal' test/xref.js`
  reports 0. `grep -c 'cleared in slice 3' test/xref.js` reports 1. `grep -c 'five entries covering six'
  test/xref.js` reports 1.
- `node test/xref.js` green, and its summary reports **6** unqualified cross-file references where the
  baseline reported 10, all six allowed. A summary still saying 10 means step 1 did not land.
- `node test/markers.js` green. Its count was 286 at measurement 10 and Tasks 1 to 3 have moved it by a
  few sections since, so record what Task 3 left and assert the fall against **that**: this task removes
  roughly forty sections, so the drop is unmistakable in either direction. `node test/skills.js` green.
  `node test/prompts.js` green, still `4 prompt file(s), 3 referrer(s)`. `node test/dedupe.js` green,
  still 4 documents compared.

---

## Task 6 — obligations 5 to 8

**Files:** `METHOD.md` (modify)

**Steps:** append obligations 5 to 8, each with one or two sentences on why a miss is unrecoverable.
**Obligation 7's sentence is given in the obligations table and is used verbatim**; the surrounding
sentences are yours, and must not quote `SOURCES.md`.

**Verification:** the four contract phrases, `grep -ci` each reporting at least 1:
`expiring thing inside`, `what the work owes`, `hand off rather than`, `nobody asked for`. The eight from
Task 5 still report at least 1. The five absence assertions still report 0. `wc -l METHOD.md` under 90.
`node test/dedupe.js` green — obligation 7 is the one sentence in this plan that has turned it red
before.

---

## Task 7 — tables 9, 10 and 11

**Files:** `METHOD.md` (modify)

**Steps:** append the three tables, in that order, each under its own heading with no more than two
sentences of introduction. Use the columns the obligations table specifies. Every table is a
compression, not a copy: the source rows carry explanatory clauses that belong to `SOURCES.md` and must
not travel.

**Verification:** `grep -ci` reports at least 1 for `what it answers`, `the question it answers` and
`the work produces`, **and each of those three matches a line whose first character is a pipe** — they
are column headings, so a match anywhere else does not count. The five absence assertions still report
0. `wc -l METHOD.md` under 125. `node test/dedupe.js` green: this and Task 8 are the tasks most likely
to turn it red, because a compressed table row sits close to the sentence it came from.
- **Every phrase asserted by an earlier task still reports at least 1.** Run the accumulated list, not
  only this task's: appending to a file cannot remove a phrase, but a rewrite of a nearby paragraph can,
  and this is the cheapest place to notice.

---

## Task 8 — tables 12, 13 and 14

**Files:** `METHOD.md` (modify)

**Steps:** append the three remaining tables. Table 13 gains a *which skill runs it* column whose only
value is `goldfish`. Table 14 may be three sentences rather than three rows.

**Verification:** `grep -ci` reports at least 1 for `cannot be merged`, `which skill runs it` and
`accepted with a reason`, and `which skill runs it` matches a line whose first character is a pipe.
`grep -ci 'goldfish' METHOD.md` reports at least 1 and `node test/skills.js` is green. The five absence
assertions still report 0. `wc -l METHOD.md` under 150. `node test/dedupe.js` green.
- **Every phrase asserted by an earlier task still reports at least 1.** Run the accumulated list, not
  only this task's: appending to a file cannot remove a phrase, but a rewrite of a nearby paragraph can,
  and this is the cheapest place to notice.

---

## Task 9 — rules 15 to 24

**Files:** `METHOD.md` (modify)

**Steps:** append obligations 15 to 24, each one or two lines, under one or two headings of your
choosing. Grouping is a readability judgement and is deliberately unspecified; the obligations are the
contract and the headings are not.

**Verification:** `grep -ci` reports at least 1 for each of `One document per subject`,
`of equal or higher`, `superseded document is deleted`, `never edited after execution`,
`goes on the backlog`, `names no code`, `never explains why`, `with no check behind`,
`every finding adjudicated`, `dependency is unreviewed`. The five absence assertions still report 0.
`wc -l METHOD.md` under 180. `node test/dedupe.js` green.
- **Every phrase asserted by an earlier task still reports at least 1.** Run the accumulated list, not
  only this task's: appending to a file cannot remove a phrase, but a rewrite of a nearby paragraph can,
  and this is the cheapest place to notice.

---

## Task 10 — rules 25 to 35

**Files:** `METHOD.md` (modify)

**Steps:** append obligations 25 to 35, each one or two lines.

**Verification:** `grep -ci` reports at least 1 for each of `either side changes`, `runs once and stops`,
`have caught this`, `derived in a generator`, `Constants are named`, `fail before writing`,
`input it must fail`, `commit or push unless`, `reverse-engineer`, `derived artifact`,
`and a case forgotten`. The five absence assertions still report 0. `wc -l METHOD.md` under 210 — the
file is over its target here and Task 11 is what brings it under. `node test/dedupe.js` green.
- **Every phrase asserted by an earlier task still reports at least 1.** Run the accumulated list, not
  only this task's: appending to a file cannot remove a phrase, but a rewrite of a nearby paragraph can,
  and this is the cheapest place to notice.

---

## Task 11 — the editorial pass

**Files:** `METHOD.md` (modify)

**Steps:** read the whole file once as a fresh reader would, and cut connective prose that would not
change what an agent does. **The cut may not remove any of the thirty-nine contract phrases, and may not
change a heading.** If an obligation looks unnecessary, that is a finding to raise, not an edit to make:
striking a row is the author's call and is recorded.

**Verification:**

- **All thirty-nine phrases present** — the four header claims and the thirty-five obligations. **The
  command is given here in full, so nothing has to survive between this task and Task 16**: it is read
  out of this plan both times, and no file is created that a clean tree would then have to explain.

  ```bash
  miss=0
  while IFS= read -r p; do
    ln=$(grep -in -m1 -- "$p" METHOD.md | cut -d: -f1)
    if [ -z "$ln" ]; then miss=$((miss+1)); ln=MISSING; fi
    printf '%-32s %s
' "$p" "$ln"
  done <<'PHRASES'
  agents and to people
  every other document
  belonging to the system
  inside a subagent
  item by item
  Agreement is the defect
  back with the section
  prove you have data
  expiring thing inside
  what the work owes
  hand off rather than
  nobody asked for
  what it answers
  the question it answers
  the work produces
  cannot be merged
  which skill runs it
  accepted with a reason
  One document per subject
  of equal or higher
  superseded document is deleted
  never edited after execution
  goes on the backlog
  names no code
  never explains why
  with no check behind
  every finding adjudicated
  dependency is unreviewed
  either side changes
  runs once and stops
  have caught this
  derived in a generator
  Constants are named
  fail before writing
  input it must fail
  commit or push unless
  reverse-engineer
  derived artifact
  and a case forgotten
  PHRASES
  echo "missing: $miss"
  ```

  It must print thirty-nine lines and `missing: 0`. This is the verification that matters.
- `wc -l METHOD.md` — record it before and after. It must fall, which is what distinguishes this task
  from doing nothing, and the fall must be at most 40 lines: more than that means an obligation went
  with the prose, and the phrase assertions will say which.
- Final size: the target is roughly 170 lines and the hard bound is 200. Under 140 with all thirty-nine
  phrases present is a good outcome, not a failure.
- The five absence assertions still report 0.

---

## Task 12 — `AGENTS.md` receives what an inventory must contain

**Files:** `AGENTS.md` (modify)

The inventory requirements leave `METHOD.md` in Task 5 and have nowhere to be until this task. Both
halves belong in one commit, and Task 16 makes that one commit.

The header to extend is, verbatim, lines 1 to 16 of `AGENTS.md`:

```
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
```

**Steps:**

1. Extend the paragraph beginning **This file is the inventory** so that it states, **as the inventory's
   own account of itself rather than as a rule quoted from elsewhere**, the five things it carries for
   each thing the project holds and the three rules that keep it honest. The eight phrases below are the
   contract; each was measured at zero occurrences in `AGENTS.md`, `METHOD.md` and `SOURCES.md` today,
   so each is evidence of this edit and of nothing else.

   | What it must state | Phrase |
   |---|---|
   | it carries these things for every entry | `for each thing it lists` |
   | which layer or kind each is | `which of the four` |
   | current, live-but-scheduled, superseded | `what state it is in` |
   | the command, and what output means it passed | `the command that proves` |
   | precedence between two documents of one kind | `where two of a kind` |
   | present tense only | `no history and no rationale` |
   | it says what does not exist | `what is absent` |
   | it is where an agent starts | `short enough to read` |

2. The row to change is, verbatim:

```
| `METHOD.md` | how work is done here — the method | **written, reviewed five times by isolated reviewers, and not yet reduced.** 1,030 lines; the next task is making it smaller and fully sourced |
```

   It is wrong twice: the file was 1,010 lines before this slice, not 1,030, and reducing it is no longer
   the next task. Replace the state column with the count produced by `wc -l METHOD.md` at Task 11 and a
   statement that this is the core, injected from slice 4.

3. The row below it reads, verbatim:

```
| `AGENTS.md` | this inventory | current. Does not yet meet every requirement `METHOD.md` §3 sets for an inventory — exact commands are given for some checks and not others |
```

   **Step 1 of this task** moves the inventory requirements into this file, so after it the row is wrong
   in two ways: the citation has no section to point at, and the requirements are no longer
   `METHOD.md`'s to set. Rewrite it to say the file does not yet meet **the requirements it states
   above** — use the phrase `the requirements it states above` — and keep the clause naming what is
   still unmet, which does not change: exact commands are given for some checks and not others. This is
   one of the eleven citations; Task 14 assumes it is discharged here.

**Verification:** the eight phrases from step 1, `grep -ci` each reporting at least 1.
`grep -c '1,030' AGENTS.md` reports 0, down from a measured baseline of 1, and
`grep -c 'injected from slice 4' AGENTS.md` reports 1 — use that phrase in the new state column, so
step 2 is asserted positively and not only by the absence of the old number.
`grep -c 'sets for an inventory' AGENTS.md` reports 0 and
`grep -c 'the requirements it states above' AGENTS.md` reports 1 — step 3 landed, and the old attribution
is gone rather than merely re-punctuated. **Do not assert on the count of `§3` in `AGENTS.md`:**
measured, there are three occurrences, one citing `FORMATIONS.md` and one that Task 14 clears.
`node test/dedupe.js` green — the moved text must not read as `METHOD.md`'s did.

---

## Task 13 — remove `test/dedupe.js`'s two expired allowances

**Files:** `test/dedupe.js` (modify)

Both quote claims that left `METHOD.md` in Task 5. The check has no stale-allowance detection, so neither
turns red on its own; leaving them is silent debt.

**Steps:** the lines to change are, verbatim:

```js
   * BOTH EXPIRE. Slice 3 rewrites METHOD.md and removes the erroneous claims; these allowances should
   * go in the same change. Nothing here detects a stale allowance, which test/xref.js's equivalent
   * list does detect — adding that is on the backlog. */
  'measurably as input grows even on simple tasks',
  'when you agree with me you are not being helpful',
];
```

Delete both string entries. Replace the `BOTH EXPIRE` sentence with one recording that the two
allowances were **removed in slice 3** when the claims left `METHOD.md` — use that phrase — keeping the
note that stale detection is absent and on the backlog. The four terms-of-art entries above are
untouched.

**Verification:** `grep -c 'measurably as input grows' test/dedupe.js` reports 0. `grep -c 'when you
agree with me' test/dedupe.js` reports 0. `grep -c 'BOTH EXPIRE' test/dedupe.js` reports 0.
`grep -c 'removed in slice 3' test/dedupe.js` reports 1. `grep -cE "^  '" test/dedupe.js` reports 4 —
the terms-of-art entries, anchored to their indentation, so deleting one of those fails.
`node test/dedupe.js` green, still 4 documents compared.

---

## Task 14 — re-point the citations in `AGENTS.md` and `ROADMAP.md`

**Files:** `AGENTS.md`, `ROADMAP.md` (modify)

Eleven were measured. Task 3 deleted one with the entry holding it, Task 12 discharged one, leaving
**nine** — six here and three in Task 15.

**Each citation goes to one of two places, and which one depends on whether the core still has the
rule.** Re-pointing a citation at a rule the core no longer states would replace a dangling section
number with a dangling rule, which is worse, because nothing would catch it.

- **Where the core keeps the rule**, cite it by its **contract phrase**, so Task 15 can assert that the
  citing text and the core agree.
- **Where the core does not**, cite what owns the rule now — the backlog entry, or the check.

**Every one of the six is a wrapped sentence**, so each is given as the full run of lines it occupies.
Replace all the lines of a row together and re-wrap to the same width; a substitution that changes
length and is written back into one line of a paragraph is the splice `test/markers.js` exists to catch.

**Row a — `AGENTS.md`.** Two lines, verbatim:

```
`ARCHITECTURE_REVIEW.md`, `REFACTOR_PLAN.md` and `SMOOTH_PATHS_PLAN.md`. Do not follow them. Under
`METHOD.md` §3 those three should have been removed rather than labelled, so the header is itself out of
```

**Its replacement is given, not described**, because `AGENTS.md` is one of the four documents
`test/dedupe.js` compares and the obvious wording collides with the core. Measured: a sentence carrying
*a superseded document is deleted* shares that five-word run with obligation 17 and turns the check red.
This wording measured green and is used as it stands — note it deliberately does **not** use the
contract phrase, and that is why row a is absent from Task 15's phrase-resolution assertion:

```
`ARCHITECTURE_REVIEW.md`, `REFACTOR_PLAN.md` and `SMOOTH_PATHS_PLAN.md`. Do not follow them. The
method's rule about superseded documents means those three should have been removed rather than
labelled, so the header is itself out of
```

**Row b — `AGENTS.md`.** One line, verbatim. Drop the `§6` and cite `METHOD.md` alone:

```
Each is an instance of a rule in `METHOD.md` §6 — the rule is there, the local detail is here.
```

**Row c — `ROADMAP.md`.** Two lines, verbatim. **Cite not the method:** the core drops this
requirement, so the entry itself is now what states it. Rewrite the opening so the entry says what it
needs built, citing nothing:

```
- **Build the normative-reference machinery, and pin what exists.** `METHOD.md` §3 requires every Layer 1
  document to carry a `Normative references` table listing the sections of other documents it depends on,
```

**Row d — `ROADMAP.md`.** Three lines, verbatim. Cite the contract phrase `cannot be merged`:

```
     reviewed section by section as they were written, so cross-section contradictions have never been
     looked for. `METHOD.md` §4 is explicit that this gate is not waivable on the grounds that every
     section passed.
```

**Row e — `ROADMAP.md`.** Two lines, verbatim. Cite the contract phrase `names no code`:

```
- **Bring the Layer 1 documents into line with the no-code-names rule.** `METHOD.md` §2 settles that a
  Layer 1 document names no file, symbol or line — it states the behaviour or the derivation, and the
```

**Row f — `ROADMAP.md`.** Two lines, verbatim. Cite the contract phrase `superseded document is
deleted`. `ROADMAP.md` is **not** one of the documents `test/dedupe.js` compares, so the five-word run
that row a must avoid is safe here:

```
- **Delete the superseded documents, after extracting what survives.** `METHOD.md` §3 settles that a
  superseded document is deleted rather than kept with a *historical* header — git holds it, and a marked
```

**Verification:** `LC_ALL=C grep -cP 'METHOD\.md.{0,14}\xc2\xa7[0-9]' AGENTS.md ROADMAP.md` reports 0
for both files. One assertion per row that cites a phrase, so a row skipped fails:
`grep -c 'superseded document is deleted' ROADMAP.md` reports 1, `grep -c 'cannot be merged' ROADMAP.md`
reports 1, `grep -c 'names no code' ROADMAP.md` reports 1. **Row a is deliberately not among them** —
its replacement avoids the contract phrase, for the reason given above — so assert instead that
`grep -c "method's rule about superseded documents" AGENTS.md` reports 1 and
`grep -c 'superseded document is deleted' AGENTS.md` reports **0**.

**`node test/dedupe.js` green.** This is the only task that writes new prose into `AGENTS.md` about a
rule the core also states, so it is the one place outside Tasks 6 to 12 where the duplication check can
go red. If it does, the fix is here, not in the core, which Task 11 has already settled.

`node test/markers.js` green: every row's substitution spans a line break, which is exactly what that
check exists for.

---

## Task 15 — re-point the citations in the two check files, and sweep

**Files:** `test/xref.js`, `test/plan-citations.js` (modify)

All three sit inside comment blocks and wrap, so each is given as the full run of lines it occupies.

**Row g — `test/xref.js`.** Three lines, verbatim. **Cite not the method:** the core drops this rule and
**this file is what enforces it**, so rewrite the comment to state the rule as the check's own reason
for existing:

```
/* An unqualified §ref that does not resolve in its own document but does resolve in another is accepted
 * as a cross-file reference. METHOD.md asks its authors to qualify every one anyway (METHOD.md §6),
 * because adjacency is what attributes them and an unqualified ref is only accepted by luck. */
```

**Row h — `test/xref.js`.** The first line of the block Task 5 step 4 quotes in full, verbatim, and left
untouched there for this task. Same treatment as row g:

```
 * METHOD.md §6 requires every cross-document reference to name its document: a bare §ref cannot be
 * attributed to a file by any tool, so a reference nobody can attribute is a reference nobody can
 * check.
```

Only the first of those three lines carries the citation; the two after it are given so the sentence can
be re-wrapped without going to look.

**Row i — `test/plan-citations.js`.** Three lines, verbatim. Replace the **example**, not the rule: use
`CORRIDORS.md §4.3`, which resolves today and is the form this check meets in the wild:

```
 * A CITATION NAMES ITS DOCUMENT. `METHOD.md §6`, never a bare `§6`: adjacency is what attributes a
 * reference, and one nobody can attribute is one nobody can check. That is the same rule test/xref.js
 * holds the design documents to, applied to plans.
```

**Then two assertions, which together are the pass condition for Tasks 3, 12, 14 and 15.**

*One — nothing still cites a section of the method:*

```bash
LC_ALL=C grep -rnP 'METHOD\.md.{0,14}\xc2\xa7[0-9]' --include=*.md --include=*.js . | grep -v '^./plans/'
```

returns nothing. The `grep -v` excludes this plan, which quotes the strings it is removing and would
otherwise match itself. Measured before execution: all eleven occurrences have the document name and the
section sign on the same line, so this line-based sweep sees every one; a citation wrapping between the
two would not be caught, and none does.

*Two — every rule cited by name still exists in the core.* Three contract phrases are used as citations
by Task 14 — `superseded document is deleted`, `cannot be merged`, `names no code`. Assert each of the
three occurs at least once in `METHOD.md`. **This is the assertion an earlier revision lacked, and its
absence is why nine citations could have been re-pointed at rules the slice had just deleted.** Rows c,
g and h cite no phrase by design, because the core no longer holds those rules; that is recorded in the
*what does not survive* table and is not an omission.

**And a positive assertion for each of the three rows**, because the sweep only proves what is gone:
`grep -c 'CORRIDORS' test/plan-citations.js` reports at least 1, up from a measured baseline of **0** —
row i landed. `grep -c 'METHOD.md' test/xref.js` reports 0, down from a measured baseline of 4 — rows g
and h landed and took the file's last mention of the method with them.

**Verification:** all of the assertions above. `node test/xref.js` and `node test/plan-citations.js` green,
with `plan-citations` still reporting one plan — this one — exempt with a stated reason, which it
already is: its header line reads `> **Spec:** none —` followed by the reason, and the check requires at
least twelve further characters on that line.

---

## Task 16 — close out

**Files:** none changed.

`plans/2026-08-29-method-core.md` is this plan's path, needed by step 6.

**Where these records go.** There is nowhere durable — a place to record a disposition is what slice 6
builds. **Every record below is reported to the author in the conversation, and nowhere else.** That is
weak and is stated so rather than hidden.

**Steps:**

1. Run the nine checks and quote each summary line.
2. There is no Layer 2 map to update. Creating one is on the backlog, where it stays.
3. Re-run Task 11's thirty-nine-phrase command, unchanged, and quote the count.
4. Report the sections changed, marked *rewritten-in-full* or *changed-in-place*, calling out separately
   anything that touched already-reviewed text — `SOURCES.md`'s two entries in Task 4 are that case.
5. Report what this slice deliberately did not do: it did not run a whole-document review of the new
   `METHOD.md`, because slice 9 is that review; and it did not create the six skills whose material it
   removed, because slice 5 does, from the pointer Task 1 wrote.
6. **Ask before committing.** One commit for the slice, with this plan alongside the change it
   describes. **Then, in the same session and on the author's say-so, a second commit deleting this
   plan.** Both are the executor's to make and neither is made unasked; a slice that ends with the plan
   still in the tree is unfinished.
7. **If a check is red here, the fix is a return to the task that broke it, not a patch at close-out.**
   Tasks 5 and 11 are the likely sources.

**Verification:** the nine summary lines, quoted. `node test/run.js` ends `ALL GREEN`. Thirty-nine of
thirty-nine phrases present. `test/visual.js` named as unrunnable in this environment, with the reason,
and not counted as passing. After the second commit, `git status` shows a clean tree and
`ls plans/` is empty.
