# Seven skills — implementation plan

> **Goal:** put the parts of the method that are not needed in every session into seven skills, each
> with a *Use when* trigger, so that the material slice 3 cut out of `METHOD.md` is loaded at the moment
> it is needed rather than lost.
> **Spec:** none — this is family-2 tooling. What it delivers is settled in `ROADMAP.md` under *The nine
> slices* (row 5), the settled-list bullet beginning *"Seven skills, split rather than merged"*, and the
> recovery table under *What slice 5 must recover, and from where*. All three are backlog rather than a
> Layer 1 document and carry no numbered sections to cite.
> **Map:** none. This project has no Layer 2 map; building one is on the backlog. Every path below is
> given in full, and every file this plan modifies is quoted at the point of change.
> **Status:** in progress — deleted on completion.
> **Slice:** 5 of 9. The slice list is in `ROADMAP.md` under *The nine slices*.
>
> **Revision 4, after the second plan review.** It found Tasks 0 to 10 executable from the plan alone —
> the blocking defect of revision 2 is gone — and returned 37 findings, of which eight were accepted.
>
> **What changed.** `METHOD.md` becomes **201** lines, not 199: revision 3 miscounted its own quoted
> paragraph, and an executor reading 201 against a plan saying 199 would have been pushed toward the one
> thing this plan forbids. **Every assertion whose pass condition is `0` now has a before-reading**, so it
> is a transition rather than a value a never-matching pattern also produces — and the three that are `0`
> both before and after are labelled *guard* rather than left looking like the others. The preamble's
> claim that every command is ASCII-only is gone; it was false. The blank lines in Tasks 2 and 7 are
> instructed rather than implied. Task 12's close-out names its destination, its audit list, and what it
> does about the commit it cannot make.
>
> **Revision 3, after the first plan review.** It returned 31 findings in seven categories, three of
> them blocking, and eight were accepted. Two of its headline claims were wrong on the facts and are
> recorded as rejected below; one of those, chased down, found a worse defect than the one it alleged.
>
> **What changed.** Tasks 1 to 5 now have an assembly mechanism, stated once under *How each skill file
> is assembled* — revision 2 said "prepend the frontmatter" while forbidding every obvious way to do it,
> which meant the plan could not begin. Every line count is re-measured with `wc -l`, in a probe that
> builds the files by that exact mechanism. Task 11 names who runs it. Two `sed` ranges move by one line
> each, for blank-line reasons stated where they occur. And the closing note about `test/skills.js` is
> rewritten, because it described one of that check's two regexes as though it were both — which is what
> misled the reviewer.
>
> **Revision 2, written after all eight decisions were accepted and a dry run was built.** Revision 1
> asked eight questions and left five tasks conditional on the answers. All eight were accepted, so the
> conditionals are gone, `METHOD.md` gains a task of its own, and the task count went from twelve to
> thirteen.
>
> **The dry run changed more than the decisions did.** Revision 1's collision count came from a probe
> that compared only the five recovered bodies. Building the whole outcome — seven skills with their
> real frontmatter, `METHOD.md` and `AGENTS.md` edited — found **sixteen collisions, not four**, and
> **twelve of them were in text revision 1 wrote itself**: the descriptions, the `handoff` skill, and
> the new `AGENTS.md` rows. Two of revision 1's three predicted fixes did not work, and one of them
> introduced a collision that had not existed. Every number below is now a reading taken from that dry
> run rather than a prediction, and the two that remain predictions say so.

---

## Where this runs, and what it may read

**Repository root:** `C:\Users\RNP Ghost\Projects\Rueda Simulator`. Every path below is relative to it,
and this plan calls it **`ROOT`** rather than assuming the reader has it.

**Shell:** Git Bash on Windows. `git`, `grep`, `sed`, `wc` and `node` are on `PATH`; **`python` is
not.**

**Several commands below carry non-ASCII patterns** — `§`, the em dash `—`, the en dash in `GATE 1–3`.
Measured: they survive this shell. `grep -c '§3'` returns 1 against a file containing it, and
`grep -c 'Layer 4 — checks'` returns 1 against the source object. Copy such a pattern rather than
retyping it. An earlier revision claimed every command here was ASCII-only, which was inherited from a
different plan and was false.

**Run every backticked grep exactly as written — `grep -c '`slice`' METHOD.md` — in single quotes, with
no backslashes.** Wrapping one in a `printf "$(...)"` substitution and escaping the backticks makes the
pattern match nothing and report **0**, which for these patterns is a plausible answer. It produced two
false readings during execution, both at moments when 0 was the value being looked for.

**No assertion in this plan passes on a bare `0`.** Every expect-zero grep is paired with a
before-reading, so it asserts a transition from a known non-zero value — because a pattern that matches
nothing and an edit that never happened both print `0`. The three assertions that are `0` both before
and after are labelled **guard**: they prove a superseded text was not pasted, and they are not evidence
that any edit landed.

**Never put a script inside `node -e`, and do not trust a long heredoc.** Backslashes do not survive the
shell and the failure is silent — five no-op assertions across two sessions were bought that way. Where
this plan needs a script, it says to write it to a file with the Write tool and run the file.

**`grep -c` counts matching lines, not occurrences.** Every count in this plan was taken with `grep -c`
against the tree as it stands, and for each counted string no line of any target file contains it twice.
Where a later task says *occurrences*, it means matching lines.

**The recovered material is not quoted in this plan, and that is deliberate.** It is 179 lines across
five skills, it exists byte-exact in a committed git object, and a plan quoting it would bury its own
instruction. What this plan quotes instead is **every edit to it** — sixteen of them, each as a
before/after pair — so that anything else changing is a defect rather than a judgement call. The command
that produces the unedited body is given in each task.

**The source object is `7013a33:METHOD.md`, and it is 1,010 lines.** Task 0 asserts that length. Every
line range in this plan is measured against it; a different length means a different object and every
range is then wrong.

## How each skill file is assembled

**Stated once here, so Tasks 1 to 5 do not each restate it.** Revision 2 said *"prepend the frontmatter
and title"* after writing the body to the file, which is a prepend with no mechanism — and this plan's
own preamble forbids the heredoc and the `node -e` one-liner that would otherwise do it. The plan review
found that at step 3 of task 1, and it was right: the plan could not begin.

**The header goes first and the body is appended to it.** Nothing is ever prepended.

1. `mkdir -p .claude/skills/<name>`
2. **Write the header with the Write tool** to `.claude/skills/<name>/SKILL.md`: the frontmatter, a blank
   line, the `# ` title, and a blank line. Each task quotes its header in full, ending with that blank
   line — it is what separates the title from the body, and it is inside the quoted block.
3. **Append the recovered body:**
   `git show 7013a33:METHOD.md | sed -n '<range>' >> .claude/skills/<name>/SKILL.md`
   Note `>>`, not `>`. A single `>` truncates the header away and the failure looks like a file that was
   simply never given one.
4. **Take that task's before-readings**, listed in the task under *Before the edits*. They are run
   against the file as step 3 leaves it, and every one is non-zero. This is the only chance to take
   them: Task 0 cannot, because these files do not exist yet.
5. **Apply that task's edits**, each by exact-string replacement, and **each must match exactly once**.
   A substitution that matches zero times changes nothing and says so to nobody; that is the rule this
   project already holds document edits to. The Edit tool enforces uniqueness and is the intended
   instrument; a script is not needed and must not be a heredoc.

**Every file ends with a single newline and no trailing blank line.** Measured on all seven.

**Two `sed` ranges are not the ones `ROADMAP.md`'s recovery table gives, and both differ by one line for
the same reason — where the blank lines fall.** Neither changes a word of content:

| Skill | `ROADMAP.md` says | This plan uses | Why |
|---|---|---|---|
| `slice` | 660 to 726 | `660,725p` | line 726 is blank, and including it leaves the file ending on a blank line. Measured: with 726 the file is 72 lines and ends `"\n\n"`; with 725 it is 71 and ends `".\n"` |
| `bug` | 846 to 850 | `846,851p` | line 851 is the blank line between the paragraph and the table. Without it `sed` joins ranges directly, putting a table header row immediately under a paragraph with no blank line between |

**These two are decisions this plan took that nobody asked for.** To reverse either, use the range
`ROADMAP.md` states and accept the blank-line consequence named above.

## The ten checks

```bash
node test/run.js && node test/xref.js && node test/prompts.js && node test/dedupe.js && node test/markers.js && node test/lineendings.js && node test/skills.js && node test/hooks.js && node test/plan-citations.js && node test/sources.js
```

`test/run.js` must end `✅ ALL GREEN`; the rest must report no problems. `test/visual.js` cannot run on
this checkout — its Chromium path is hard-coded to Linux — and is named as unrunnable rather than
counted as passing.

---

## What I measured before writing this

Six probes, each written to a file and run. The scripts are in this session's scratchpad; the readings
are here because a plan that states a number it did not take is the defect slice 4's Task 0 caught twice.

### Probe one — the size and shape of what is recovered

| Skill | Recovered from `7013a33:METHOD.md` | Lines | Characters |
|---|---|---|---|
| `slice` | 660–726 | 67 | 3,264 |
| `plan` | 727–758 | 32 | 1,379 |
| `execute` | 766–799 | 34 | 2,037 |
| `checks` | 364–390 | 27 | 1,718 |
| `bug` | 846–850, 858–870 | 19 | 1,750 |

**179 lines.** The `bug` range deliberately skips 851–857: that is the discriminator itself, which
stayed in `METHOD.md` as the routing line *Sort a defect by asking what a check could have caught*.

### Probe two — sixteen stale references, on twelve lines

Five `§` references, seven stage names, four gate names:

| Skill | Line | Carries |
|---|---|---|
| `slice` | 6 | `### Stage 4 — slice` |
| `slice` | 15 | `backlog rather than intent (§3).` |
| `plan` | 6 | `### Stage 5 — write the plan` |
| `execute` | 6 | `### Stage 7 — execute` |
| `execute` | 9 | `…stop and go back to Stage 5 —` |
| `execute` | 15 | `*(Not to be confused with GATE 1–3, which are reviews. This is the check suite.)*` |
| `execute` | 17 | `### Stage 8 — close out` |
| `execute` | 29 | `the reason (§8).` |
| `execute` | 31 | `### Stage 9 — GATE 3: a human looks at the result` |
| `bug` | 9 | `But applying §4's full loop to every defect…` |
| `bug` | 14 | `§4's full loop, scoped to the gap.` |
| `bug` | 15 | `no section review and no GATE 1 … §4's ceremony table … still owes GATE 3, and Stage 8's close-out` |

**`METHOD.md` now has zero numbered section headings.** Measured. So all five `§` references resolve to
nothing, and no check would say so: `test/xref.js` examines `CORRIDORS.md`, `FORMATIONS.md` and
`METHOD.md` only, and never looks at a skill file. `GATE 1` and `GATE 3` were renamed in slice 3 to the
*document review* and the *artefact review*; the nine numbered stages no longer exist.

**So "recover, do not rewrite" cannot mean "copy".** It means copy, then make exactly the sixteen edits
this plan enumerates — twelve for stale references, four for collisions — and nothing else.

### Probe three — the recovered text's markers already balance

`test/markers.js` run with its `DOCS` substituted for the five recovered bodies: **15 sections examined,
markers balance.** Wiring the skills in would go green on the day it is written, which is the condition
`test/dedupe.js`'s own comment sets. This is what made Decision 6 answerable.

### Probe four — the collision count revision 1 got wrong

Revision 1 compared the five recovered bodies against `METHOD.md`, `AGENTS.md`, `SOURCES.md` and
`goldfish`, and found **four** collisions. It did not compare the seven frontmatter descriptions, the
`handoff` skill, the two sections appended to `plan`, or the new rows in `METHOD.md` and `AGENTS.md`,
because none of them existed yet. Probe five built all of it.

### Probe five — the dry run, and what it found

A scratch tree holding the **entire outcome of this slice**: seven `SKILL.md` files with their real
frontmatter and all sixteen edits applied, `METHOD.md` with Decisions 3 and 4, `AGENTS.md` with its new
rows, and `test/markers.js` with Decision 6's change. The **real** `test/dedupe.js`, `test/markers.js`
and `test/skills.js` were run against it, and the **real** `session-start.js` `manifest()` against the
edited `METHOD.md`. Every substitution in the probe is assertion-checked — exact string, count the
matches, throw before writing if the count is not exactly one.

**It reported sixteen collisions. Twelve were in text revision 1 had written.** The four that matter
most, because they are the ones revision 1 was confident about:

- **`"yes and nobody wrote it"` survived its own fix.** Revision 1 reworded the cells of the code-bug
  row and left the row's label — which is itself a five-word run — untouched.
- **`"it goes back to the"` was not cleared as a side effect**, and revision 1's stated fallback named
  the wrong sentence. It comes from the recovered text's closing line *It goes back to the elephant*,
  five of whose words `METHOD.md`'s triage rule also contains. The design-row rewording could never have
  touched it.
- **`"a person can look at"` was created by revision 1's own rewording**, which put *"anything a person
  can look at"* into the code-bug row while `METHOD.md:102` says *"something a person can look at"*.
- **`"have been written from the documents as they stand"`** came from the `bug` skill's *description* —
  revision 1 wrote the discriminator into the trigger line in `METHOD.md`'s exact words.

The remaining eight were four in the `handoff` skill, which revision 1 wrote from imperative Seven and
the review-rejection rule almost verbatim; one in `plan`'s description; one in `checks`'s description;
one between Decision 4's new `METHOD.md` line and `SOURCES.md`'s heading *What is not needed every
session is loaded when it is*; and five between the new `AGENTS.md` rows and the descriptions they
paraphrase.

**All sixteen were resolved by moving text that does not yet exist in this repository.** No sentence of
`METHOD.md`, `AGENTS.md` or `SOURCES.md` as they stand today was reworded to make room, which is
Decision 1's principle applied to twelve more cases than Decision 1 knew about. After the rewordings:

```
DEDUPE   10 documents compared pairwise, runs of 5+ words     ✅ nothing said twice
MARKERS  281 section(s) examined across 12 document(s)        ✅ markers balance
SKILLS   7 skill(s), 2 referrer(s) checked                    ✅ every skill reachable, none phantom
SESSION-START PAYLOAD                                         ✅ derivable, 1691 characters (budget 1900)
```

**The intermediate state was measured separately.** Tasks 1 to 7 create all seven skills while
`METHOD.md` and `AGENTS.md` are still untouched; the edits to those land at Tasks 8 and 9. Every
rewording above was measured against the *edited* pair, so the state this plan actually passes through
is a different one. Measured: **10 documents, nothing said twice**, with the pair unedited. Both states
are green, and neither was assumed to follow from the other.

### Probe six — the assembly, and the seven line counts that were wrong

**Revision 2 asserted seven line counts and all seven were wrong by one.** They came from probe five's
`.split('\n').length`, which counts the empty string after the final newline; `wc -l`, which is what the
plan asserts with, counts newlines. The plan review flagged the counts as unreproducible and offered a
different explanation — a no-op deletion in Task 5 — which was wrong. Checking it found the units error.

So probe six builds the seven files **by the mechanism this plan now specifies** — write the header,
append the `sed` range, apply the edits — and counts newlines. The mechanism itself moves the numbers,
so they could not have been recovered by subtracting one:

| | slice | plan | execute | checks | bug | handoff | goldfish |
|---|---|---|---|---|---|---|---|
| `wc -l` | 71 | 71 | 39 | 32 | 24 | 38 | 82 |

Every file ends `".\n"` — a single newline, no trailing blank line. With `ROADMAP.md`'s range of 660–726
the `slice` file is **72** lines and ends `"\n\n"`, which is the measurement behind the range table under
*How each skill file is assembled*. `test/dedupe.js` against this tree: **10 documents, nothing said
twice.**

### The tree as it stands

Ten checks green. The readings Task 0 re-takes are listed there rather than here, so there is one place
to compare against.

**`ROADMAP.md` is dirty before this slice starts** — three uncommitted lines added under *The core is
injected, not read on request*, describing the four session origins. They are not this slice's, they are
not a mistake, and Task 0 records them so that Task 12's edit is not read as having produced them.

---

## The eight decisions, all accepted

Raised in revision 1, adjudicated, and folded in. Recorded here because the plan is deleted on execution
and the reasons would go with it.

| | Decision | Accepted as | Lands in |
|---|---|---|---|
| **1** | The dedupe collisions: which side moves? | the skill moves, never `METHOD.md`; the allow list is not touched | Tasks 3, 5 |
| **2** | Old lines 791–799 (the artefact-review material) | goes into `execute`; the range stays 766–799 | Task 3 |
| **3** | `METHOD.md` assigns the artefact review to `goldfish` | the cell is corrected — a goldfish cannot be the person looking | Tasks 7, 8 |
| **4** | Does `METHOD.md` name the six new skills? | yes, one line | Task 8 |
| **5** | Does the compact hook name the `handoff` skill? | yes | Task 10 |
| **6** | Do the skills join `test/markers.js`'s document list? | yes, discovered on disk rather than listed | Task 10 |
| **7** | Is GATE 3 a trigger-selection test? | yes | Task 11 |
| **8** | `HANDOFF.md` | read by Task 6, deleted at close-out | Tasks 6, 12 |

**Decision 1 turned out to be the load-bearing one.** It was raised about four collisions and settled a
principle that Probe Five then had to apply to sixteen. Had it gone the other way — `METHOD.md` moves —
this slice would have reworded twelve passages of a reviewed, injected document to make room for text
nobody had read yet.

---

## Constraints

**From `ROADMAP.md`, *Seven skills, split rather than merged*:** seven skills, not fewer. *"Adjacent
pairs get descriptions that name each other."* Every description below does.

**From `ROADMAP.md`, the five conventions the `plan` skill must state once**, so that no individual plan
restates them. Three were raised by a plan review against both of the first two plans, fixed in each, and
came back in the next — which is the signal that they are missing conventions rather than plan defects:

1. `ROOT` is declared, not assumed.
2. A file being modified is quoted at the point of change.
3. A verification asserts the change, not the suite.
4. Every post-edit value has a before-value recorded in the plan's first task. *(Slice 3.)*
5. Every task that edits a hook runs that hook. *(Slice 4.)*

**And the quotation rule**, settled while adjudicating slice 1's plan review and recorded in `ROADMAP.md`
because the plan that produced it is deleted. It goes into the `plan` skill verbatim from there.

**Every skill file is `.claude/skills/<name>/SKILL.md`**, with `name:` in the frontmatter equal to the
directory name — `test/skills.js` fails on any mismatch.

**Every file is LF.** `.gitattributes` pins it, `test/lineendings.js` asserts it, and 13 files were once
CRLF here, where a multi-line exact match against the wrong one matches zero times and says so to nobody.

**No collision is ever cleared by reaching for `dedupe.js`'s `ALLOWED` list.** That list is for terms of
art that cannot be paraphrased away. Every collision this slice meets can be, and Probe Five proved it
by doing so sixteen times.

---

## Task 0 — record the baseline

**Files:** none.

**Steps:** run every command below from `ROOT` and record every number. Twenty-six later assertions
compare against these, and once an edit lands the original is not recoverable.

```bash
ls .claude/skills/
wc -l METHOD.md AGENTS.md ROADMAP.md SOURCES.md .claude/skills/goldfish/SKILL.md
git status --short
git diff --stat ROADMAP.md
git show 7013a33:METHOD.md | wc -l
grep -c '`slice`' AGENTS.md METHOD.md
grep -c '`plan`' AGENTS.md METHOD.md
grep -c '`execute`' AGENTS.md METHOD.md
grep -c '`checks`' AGENTS.md METHOD.md
grep -c '`handoff`' AGENTS.md METHOD.md
grep -c '`bug`' AGENTS.md METHOD.md
grep -c '`goldfish`' AGENTS.md METHOD.md
grep -c 'does not exist yet' AGENTS.md
grep -c 'the look at the artefact' METHOD.md
grep -c 'Seven skills' ROADMAP.md
grep -c 'What slice 5 must recover' ROADMAP.md
grep -c 'handoff skill' .claude/hooks/pre-compact-handoff.js
echo '{"trigger":"auto"}' | node .claude/hooks/pre-compact-handoff.js
node test/run.js && node test/xref.js && node test/prompts.js && node test/dedupe.js && node test/markers.js && node test/lineendings.js && node test/skills.js && node test/hooks.js && node test/plan-citations.js && node test/sources.js
```

**Verification — every reading, and what it must be.**

`.claude/skills/` holds exactly one entry, `goldfish`. Line counts: `METHOD.md` **195**, `AGENTS.md`
**157**, `ROADMAP.md` **662**, `SOURCES.md` **517**, `goldfish/SKILL.md` **79**.

`git status --short` prints exactly **three** lines: `` M ROADMAP.md``, `?? HANDOFF.md`, and
`?? plans/`. `git diff --stat ROADMAP.md` reports **1 file changed, 3 insertions(+)**.

**This is not a clean tree, and only the first two lines are pre-existing.** `ROADMAP.md`'s three lines
were added by the previous session and not committed; `HANDOFF.md` is the handoff Task 6 uses and Task 12
deletes. **`?? plans/` is this plan itself** — the directory did not exist when the repository was last
committed, and creating it is what put the file you are reading on disk.

If `git status` shows anything else, stop — this plan was written against that tree and no assertion
below can be interpreted against a different one.

**Revisions 1 to 4 said "exactly two lines" here and execution found three.** The sentence was written
before `plans/` existed and was never re-taken. It is the third time in this plan that a reading has
excluded the plan's own file — `LINE ENDINGS` was 49 before it counted this file, `PLAN CITATIONS` was
0 plans — and it is the only one no review caught, because no reviewer could run the command.

`git show 7013a33:METHOD.md | wc -l` reports **1010**.

Backtick counts, `AGENTS.md` then `METHOD.md`: `` `slice` `` **0, 0**. `` `plan` `` **0, 0**.
`` `execute` `` **0, 0**. `` `checks` `` **0, 0**. `` `handoff` `` **0, 0**. `` `bug` `` **0, 0**.
`` `goldfish` `` **1, 4**. Phrase counts: `does not exist yet` in `AGENTS.md` **1**;
`the look at the artefact` in `METHOD.md` **1**; `Seven skills` in `ROADMAP.md` **2**;
`What slice 5 must recover` in `ROADMAP.md` **1**; `handoff skill` in the compact hook **0**.

**The compact hook fires and emits its current message.** It must print JSON containing
`Write the handoff and propose a fresh session instead` and exit 0. Task 10 edits this hook, and
convention 5 requires that the task run it — but a hook that was already broken and one this slice broke
are indistinguishable without this reading, and nothing in the check suite starts a hook.

**The ten checks are all green, run in full — not inferred from one of them.** Their summary lines:

```
INVARIANTS OK   — 10659 checks
✅ ALL GREEN
XREF  1229 references checked
PROMPTS  4 prompt file(s), 3 referrer(s) checked
DEDUPE   4 documents compared pairwise, runs of 5+ words
MARKERS  253 section(s) examined across 5 document(s)
LINE ENDINGS  50 file(s) examined (.md, .js)
SKILLS  1 skill(s), 2 referrer(s) checked
HOOKS  5 hook file(s), 5 reference(s) checked, 1 exempt, 1691 of 1900 characters injected
PLAN CITATIONS  1 plan(s), 13 task(s) examined, 1 plan(s) exempt with a stated reason
SOURCES  38 entries — 20 published, 10 measured here, 8 reasoned
```

**`LINE ENDINGS` says 50 and `PLAN CITATIONS` says 1 plan, because this plan is one of the files.**
Revision 1 stated 49 and 12 tasks: both were read before this file existed, and both were wrong by one
in exactly the way convention 4 exists to catch.

**Twenty-six readings.** Every post-edit value this plan asserts is a transition from one of them.

---

## Task 1 — the `slice` skill

**Files:** `.claude/skills/slice/SKILL.md` (create)

**Steps.** Follow *How each skill file is assembled*. The range is `660,725p` — one line short of
`ROADMAP.md`'s 726, for the blank-line reason given there. Then make the three edits below, and no
others.

**The header, in full — this is what step 2 writes.** New text; nothing derives it. The blank line after
the title is part of it:

```markdown
---
name: slice
description: Cut a large piece of finished design into slices before any plan is written — what makes a valid slice, the five axes to cut along, and what a slice entry contains. Use when the design is settled and the work is too big for one session, or when asked to break work down, split it up, phase it, or decide what to build first. The plan for a single slice is the `plan` skill's job, and the plans are not written now.
---

# Cutting work into slices

```

**Before the edits**, run these against the file as step 3 leaves it:

```bash
grep -c 'Stage 4' .claude/skills/slice/SKILL.md
grep -c '§3' .claude/skills/slice/SKILL.md
grep -c '^#### ' .claude/skills/slice/SKILL.md
```

**`Stage 4` is 1, `§3` is 1, `^#### ` is 3.** If any is 0, the append did not land or the range was
wrong — stop, because the three assertions below all pass on 0 and would then be meaningless.

**Edit 1 — the section heading.** Delete `### Stage 4 — slice` and the blank line under it; the title
replaces it.

**Edit 2 — the stale section reference.** Before:
```markdown
backlog rather than intent (§3).
```
After:
```markdown
backlog rather than intent, which is a distinction `METHOD.md` draws.
```

**Edit 3 — promote the subheadings.** The recovered text's three `#### ` headings become `## `, so the
file has one `# ` title and three `## ` sections rather than three headings hanging below a level that
is no longer there.

**Verification.**

```bash
node test/skills.js
node test/dedupe.js
node test/lineendings.js
grep -c 'Stage 4' .claude/skills/slice/SKILL.md
grep -c '§3' .claude/skills/slice/SKILL.md
grep -c '^#### ' .claude/skills/slice/SKILL.md
grep -c '^## ' .claude/skills/slice/SKILL.md
grep -c 'horizontal split in disguise' .claude/skills/slice/SKILL.md
grep -c 'walking skeleton' .claude/skills/slice/SKILL.md
grep -c 'is the field that does the work' .claude/skills/slice/SKILL.md
wc -l .claude/skills/slice/SKILL.md
```

`Stage 4` **1 → 0**, `§3` **1 → 0**, `^#### ` **3 → 0** — all three edits landed, each a transition from
the before-reading above rather than a bare zero. `^## ` **3**.
`horizontal split in disguise` **1**, `walking skeleton` **1**, and the `Out` sentence **1**: the three
load-bearing claims in the recovered text, and a copy that lost one of them went wrong. The file is
**71 lines**.

`test/dedupe.js` reports **5 documents** and **nothing said twice**. `test/lineendings.js` reports
**51 files**.

**`test/skills.js` reports 2 skills and one problem** — `.claude/skills/slice/SKILL.md is named by
nothing`. **That failure is expected here and is not cleared until Task 8**, which names the six new
skills in `METHOD.md`. It is called out because a task claiming "all checks green" would be wrong, and an
executor who saw red and stopped would be right to.

---

## Task 2 — the `plan` skill

**Files:** `.claude/skills/plan/SKILL.md` (create)

The skill with the most added to it: the recovered template, the five conventions, and the quotation
rule. Everything added is quoted here.

**Steps.** Follow *How each skill file is assembled*, range `727,758p`. Then:

- **Before the edit:** `grep -c 'Stage 5' .claude/skills/plan/SKILL.md` is **1**.
- Delete `### Stage 5 — write the plan` and the blank line under it; the title replaces it.
- **Trim the file's trailing blank line.** Range 727–758 ends on line 758, which is blank, so after the
  append the file ends `"\n\n"`. It must end `".\n"` before anything is appended to it.
- Append the two sections below **with exactly one blank line before each of them** — one between the
  recovered text and `## Five conventions every plan carries`, and one between the two appended
  sections. **The blank lines are not inside the quoted blocks and must be added.** Measured: without
  them the file is 69 lines; with them it is 71, which is what this task asserts.

**The header, in full — this is what step 2 writes.** The blank line after the title is part of it:

```markdown
---
name: plan
description: Write the implementation plan for one slice or one fix — a Layer 3 document under plans/ describing a delta from the code as it is now, with the conventions every plan must carry and the rule for what to quote. Use when a slice has been chosen and is about to be built, or when asked to plan, spec out, scope, or write up how something will be done. Cutting work into slices comes first and is the `slice` skill; carrying the plan out is the `execute` skill.
---

# Writing a plan

```

**Append, section one — the five conventions:**

```markdown
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
```

**Append, section two — the quotation rule**, verbatim from `ROADMAP.md`:

```markdown
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
```

**Verification.**

```bash
node test/dedupe.js
grep -c 'Stage 5' .claude/skills/plan/SKILL.md
grep -c 'is declared, not assumed' .claude/skills/plan/SKILL.md
grep -c 'has a before-value in the first task' .claude/skills/plan/SKILL.md
grep -c 'runs that hook' .claude/skills/plan/SKILL.md
grep -c 'an over-quoted plan buries its own instruction' .claude/skills/plan/SKILL.md
grep -c 'No placeholders' .claude/skills/plan/SKILL.md
grep -c 'plans/YYYY-MM-DD' .claude/skills/plan/SKILL.md
grep -c '^## ' .claude/skills/plan/SKILL.md
wc -l .claude/skills/plan/SKILL.md
```

`Stage 5` **1 → 0**. Each of the five convention markers **1**, the quotation rule's first clause **1**, and
from the recovered text `No placeholders` **1** and `plans/YYYY-MM-DD` **1**.

**`^## ` is 4, not 2.** Two of the four are `## Constraints` and `## Task N — <name>` **inside the fenced
plan template** the recovered text carries. `grep` does not know about fences, and this project has the
incident on record: *a document describing a forbidden pattern contains it*. Revisions 1 to 4 all
asserted 2, reasoning from the two headings the task adds; execution read 4. The two real section
headings are at lines 38 and 56.

The file is **71 lines**. **Check the last line is not blank** — `tail -1 … | cat -A` must end `.$`, not
`$`. Appending onto the recovered text's own trailing blank line leaves one behind, and that is worth
one command because it is the difference between 71 and 72.

`test/dedupe.js` reports **6 documents** and **nothing said twice**. **The description here was reworded
once already**: it said *"a delta from the code as it stands"*, which collides with `METHOD.md`'s map
row. It now says *"as it is now"*, which is also the recovered template's own wording.

---

## Task 3 — the `execute` skill

**Files:** `.claude/skills/execute/SKILL.md` (create)

**Steps.** Follow *How each skill file is assembled*, range `766,799p`. Then make the seven edits below,
and no others.

**The range runs to 799 and not to 790** — Decision 2. Lines 791–799 are the artefact-review material,
which slice 3's destination table assigned to nothing and which contains the rule *the first review pass
is small enough to be real*, in no current document.

**The header, in full — this is what step 2 writes.** The blank line after the title is part of it:

```markdown
---
name: execute
description: Carry out a written plan task by task, run the checks after each one, and close it down — update the map, delete the spent plan, and put the artefact in front of a person. Use when a plan is written and reviewed and the work is starting, or when asked to build, implement, execute, or finish a plan. Writing the plan is the `plan` skill; the review that runs before this one is the `goldfish` skill.
---

# Executing a plan, and closing it down

```

**Before the edits**, run these against the file as step 3 leaves it:

```bash
grep -c 'Stage [0-9]' .claude/skills/execute/SKILL.md
grep -c 'GATE' .claude/skills/execute/SKILL.md
grep -c '§8' .claude/skills/execute/SKILL.md
grep -c 'not a description of it' .claude/skills/execute/SKILL.md
```

**`Stage [0-9]` is 4, `GATE` is 2, `§8` is 1, `not a description of it` is 1.** `Stage [0-9]` counts
lines, not names: four lines carry Stage 7, Stage 5, Stage 8 and Stage 9. **If `GATE` is 1 rather than
2**, the range was cut at 790 and Decision 2's material is missing — stop.

**Edit 1 — the heading.** Delete `### Stage 7 — execute` and the blank line under it.

**Edit 2 — the blocker reference.** Before:
```markdown
- **Do not force through a blocker.** If a task cannot be done as written, stop and go back to Stage 5 —
```
After:
```markdown
- **Do not force through a blocker.** If a task cannot be done as written, stop and go back to the plan —
```

**Edit 3 — the parenthetical naming gates that no longer exist.**

**`GATE 1–3` contains an en dash, U+2013, not a hyphen.** Measured: it is the only en dash anywhere in
the 179 recovered lines. Copy the string from this plan or from the file; retyping it as `GATE 1-3`
produces a substitution that matches zero times, and a zero-match replacement changes nothing and
reports nothing.

Before:
```markdown
  *(Not to be confused with GATE 1–3, which are reviews. This is the check suite.)*
```
After:
```markdown
  *(Not to be confused with the reviews. This is the check suite.)*
```

**Edit 4 —** `### Stage 8 — close out` becomes `## Closing out`.

**Edit 5 — the stale section reference.** Before:
```markdown
   the reason (§8).
```
After:
```markdown
   the reason.
```

**Edit 6 —** `### Stage 9 — GATE 3: a human looks at the result` becomes
`## Putting it in front of a person`.

**Edit 7 — the collision.** Before:
```markdown
For work with visible output, a person reviews the artefact itself, not a description of it.
```
After:
```markdown
For work with visible output, a person reviews what was built rather than an account of it.
```

`METHOD.md:102` keeps *"a person looking at the artefact itself, not a description of it"*; the skill
says the same thing in its own words. **This was the one collision revision 1 predicted correctly.**

**Verification.**

```bash
node test/dedupe.js
grep -c 'Stage [0-9]' .claude/skills/execute/SKILL.md
grep -c 'GATE' .claude/skills/execute/SKILL.md
grep -c '§8' .claude/skills/execute/SKILL.md
grep -c 'not a description of it' .claude/skills/execute/SKILL.md
grep -c 'rather than an account of it' .claude/skills/execute/SKILL.md
grep -c 'A check that has never failed' .claude/skills/execute/SKILL.md
grep -c 'small enough to be real' .claude/skills/execute/SKILL.md
grep -c 'signing four hundred artefacts' .claude/skills/execute/SKILL.md
grep -c '^## ' .claude/skills/execute/SKILL.md
wc -l .claude/skills/execute/SKILL.md
```

`Stage [0-9]` **4 → 0**, `GATE` **2 → 0**, `§8` **1 → 0**, `not a description of it` **1 → 0** — the six
stale references and the collision are gone, each as a transition from the before-reading. `rather than an account of it` **1** and `A check that has never failed`
**1**. `small enough to be real` **2** — it appears in the rule and again in the restatement beneath it,
on separate lines; revisions 1 to 4 said 1, and execution read 2. With
`signing four hundred artefacts` **1**, **these two are the proof that Decision 2 was executed**: they exist only in lines 791–799, and a run that cut the range at
790 would report 0 for both. `^## ` **2**. The file is **39 lines**.

`test/dedupe.js` reports **7 documents** and **nothing said twice**.

---

## Task 4 — the `checks` skill

**Files:** `.claude/skills/checks/SKILL.md` (create)

**The only body in this plan that needs no edit.** Probes one and two found no collision and no stale
reference in `364,390p`. The one rewording here is in the frontmatter, which is new text.

**Steps.** Follow *How each skill file is assembled*, range `364,390p`.

**Before the edit:** `grep -c 'Layer 4 — checks' .claude/skills/checks/SKILL.md` is **1**.

Then delete `### Layer 4 — checks` and the blank line under it; the title replaces it. That is the only
edit.

**The header, in full — this is what step 2 writes.** The blank line after the title is part of it:

```markdown
---
name: checks
description: Choose and write the right kind of check — property, characterisation, generator, structural audit, or a size-of-the-search assertion — and prove each by watching it fail before trusting it. Use when adding or changing a check, when a characterisation diff needs deciding on, or when a number a document quotes needs somewhere to come from. Sorting a defect before any check is written is the `bug` skill.
---

# Choosing the kind of check

```

**The description said *"give each one an input it must fail on"* in revision 1**, which is `METHOD.md`'s
own sentence. It now says *"prove each by watching it fail before trusting it"*, which says the same
thing and shares no five-word run with anything.

**Verification.**

```bash
node test/dedupe.js
node test/lineendings.js
grep -c 'Layer 4 — checks' .claude/skills/checks/SKILL.md
grep -c 'an input it must fail on' .claude/skills/checks/SKILL.md
grep -c 'A characterisation diff is a question, not a verdict' .claude/skills/checks/SKILL.md
grep -c 'Size-of-the-search assertions' .claude/skills/checks/SKILL.md
grep -c 'Putting a rule in the baseline' .claude/skills/checks/SKILL.md
wc -l .claude/skills/checks/SKILL.md
```

`Layer 4 — checks` **1 → 0**. `an input it must fail on` **0**, and this one is a **guard**, not a
transition: it is 0 before and after, because the phrase only ever appeared in revision 1's description.
It proves that description was not pasted, and it is not evidence that any edit landed. The other three
are **1** each. The file is **32 lines**. `test/dedupe.js` reports **8 documents**, **nothing said twice**.
`test/lineendings.js` reports **54 files**.

---

## Task 5 — the `bug` skill

**Files:** `.claude/skills/bug/SKILL.md` (create)

**Five edits, and revision 1 got two of them wrong.** Read the before/after pairs rather than working
from the shape of the last task.

**Steps.** Follow *How each skill file is assembled*, range `846,851p;858,870p`. Then delete
`## 5. Fixing a bug` and the blank line under it, and make the five edits below.

**The range is `846,851p`, one line longer than `ROADMAP.md`'s 850**, for the blank-line reason given
under *How each skill file is assembled*: line 851 is the blank that separates the paragraph from the
table, and without it `sed` puts a table header row directly under a paragraph.

**Lines 852–857 are deliberately not recovered.** That is the discriminator, which stayed in `METHOD.md`
as the routing line; copying it here would put one rule in two documents.

**The header, in full — this is what step 2 writes.** The blank line after the title is part of it:

```markdown
---
name: bug
description: Triage a defect before fixing it, by asking whether any check, written against the documents that exist today, could have caught it — which sorts it into a silent specification, a check nobody wrote, or a design working exactly as written and wrong anyway. Use when something is broken and it is not yet clear what is at fault, before opening the code. Writing the check that comes out of it is the `checks` skill.
---

# Triaging a defect

```

**The description is not `METHOD.md`'s wording, and that is the point.** Revision 1 wrote *"whether a
check could have been written from the documents as they stand"* — the routing line verbatim. It now
asks the same question in different words.

**Before the edits**, run these against the file as step 3 leaves it:

```bash
grep -c 'Stage [0-9]' .claude/skills/bug/SKILL.md
grep -c 'GATE' .claude/skills/bug/SKILL.md
grep -c '§4' .claude/skills/bug/SKILL.md
grep -c 'Yes, and nobody wrote it' .claude/skills/bug/SKILL.md
grep -c 'It goes back to the elephant' .claude/skills/bug/SKILL.md
grep -c 'Could a check have been written' .claude/skills/bug/SKILL.md
```

**`Stage [0-9]` is 1, `GATE` is 1, `§4` is 3, `Yes, and nobody wrote it` is 1, `It goes back to the
elephant` is 1.** `GATE` is 1 and not 2 because both gate names sit on the same line and `grep -c`
counts lines.

**`Could a check have been written` is 0, and it is a guard** — 0 before and 0 after. It proves the
discriminator at lines 852–857 was not recovered. **If it is 1 here, the wrong range was used** and one
rule is about to exist in two documents; stop.

**Edit 1 — the prose reference.** Before:
```markdown
this project's documents exist. But applying §4's full loop to every defect is the most commonly reported
```
After:
```markdown
this project's documents exist. But applying the full review loop to every defect is the most commonly reported
```

**Edit 2 — the spec-bug row.** Before:
```markdown
| **No** — no check could have been written, because the documents do not say | **Spec bug** | §4's full loop, scoped to the gap. The document is wrong by omission | full ceremony, and it is earned |
```
After:
```markdown
| **No** — no check could have been written, because the documents do not say | **Spec bug** | the full review loop, scoped to the gap. The document is wrong by omission | full ceremony, and it is earned |
```

**Edit 3 — the code-bug row.** Note the label: **`Yes, and` becomes `Yes, but`.** Revision 1 reworded
only the cells and left the label, which is itself a five-word run that `METHOD.md` contains. Before:
```markdown
| **Yes, and nobody wrote it** | **Code bug** | Write the check — watch it fail — fix the code — watch it pass. **No change to intent**, so no section review and no GATE 1 — the intent was captured and only the verification was missing | a plan of one or two tasks. §4's ceremony table decides the rest, so a visible change still owes GATE 3, and Stage 8's close-out always applies |
```
After:
```markdown
| **Yes, but nobody wrote it** | **Code bug** | The check comes first, fails, and only then is the code touched. **No change to intent**, so neither a section nor a document review is owed — the intent was captured and the verification was not | a plan of one or two tasks. What a change owes decides the rest, so a visible result is still shown to somebody, and closing out always applies |
```

**Edit 4 — the design-bug row.** Before:
```markdown
| **Yes, it exists, it passes, and the behaviour is still wrong** | **Design bug** | Back to stage 1. The system does what you specified and what you specified is not what you want | a design conversation, not an edit |
```
After:
```markdown
| **Yes, the check exists and passes while the behaviour remains wrong** | **Design bug** | Reopen the design. The system does what you specified and what you specified is not what you want | a design conversation, not an edit |
```

**Edit 5 — the closing sentence, which revision 1 missed entirely.** Before:
```markdown
failure and it cannot be fixed by patching a paragraph. It goes back to the elephant.
```
After:
```markdown
failure and it cannot be fixed by patching a paragraph. The elephant is where it returns.
```

This is the source of the `"it goes back to the"` collision. Revision 1 claimed edit 4 would clear it as
a side effect and named a fallback that was also wrong; the dry run showed the collision lives here, in a
sentence revision 1 did not touch. **Do not skip this edit because the row above it changed.**

**Verification.**

```bash
node test/dedupe.js
grep -c 'Stage [0-9]' .claude/skills/bug/SKILL.md
grep -c 'GATE' .claude/skills/bug/SKILL.md
grep -c '§4' .claude/skills/bug/SKILL.md
grep -c 'Yes, and nobody wrote it' .claude/skills/bug/SKILL.md
grep -c 'It goes back to the elephant' .claude/skills/bug/SKILL.md
grep -c 'The elephant is where it returns' .claude/skills/bug/SKILL.md
grep -c 'Could a check have been written' .claude/skills/bug/SKILL.md
grep -c 'The third row is the one to be honest about' .claude/skills/bug/SKILL.md
grep -c 'Every spec bug leaves a permanent check behind' .claude/skills/bug/SKILL.md
wc -l .claude/skills/bug/SKILL.md
```

`Stage [0-9]` **1 → 0**, `GATE` **1 → 0**, `§4` **3 → 0**, `Yes, and nobody wrote it` **1 → 0**,
`It goes back to the elephant` **1 → 0** — all five edits landed, each a transition, and the last two are
the ones revision 1 would have left behind. `The elephant is where it returns` **1**.

`Could a check have been written` **0**, still the guard it was before the edits.

`The third row…` **1** and `Every spec bug…` **1**: the two paragraphs carrying the honest case survived.
The file is **24 lines**.

`test/dedupe.js` reports **9 documents** and **nothing said twice**.

---

## Task 6 — the `handoff` skill

**Files:** `.claude/skills/handoff/SKILL.md` (create)

**Nothing is recovered here.** Measured: `git show 7013a33:METHOD.md | grep -i 'handoff\|hand off'`
prints nothing. So this skill is written from four existing sources, and all of it is quoted below:

- `METHOD.md`, imperative Seven.
- `ROADMAP.md`, the settled entry *A handoff carries what was decided and never the reasoning that
  reached it.*
- `.claude/hooks/pre-compact-handoff.js`, whose message already names what a handoff carries.
- `HANDOFF.md` in the repository root — **the only worked example**, and the reason Decision 8 sequences
  its deletion after this task rather than before it.

**Steps.**

1. **Read `HANDOFF.md` before writing.** It is the model, and it is deleted at close-out.
2. `mkdir -p .claude/skills/handoff`
3. Write the file below in full.

**Four passages here were reworded after the dry run.** Revision 1 wrote this skill from imperative Seven
and the review-rejection rule almost in their own words, and `test/dedupe.js` found all four. The text
below is the version that passes; the sentences about session decay, about escaping the old context, and
about unrecorded rejections are deliberately not `METHOD.md`'s sentences.

```markdown
---
name: handoff
description: Write the handoff that closes one piece of work, and start a fresh session rather than continuing a long one — what it carries, what it must never carry, and where each part belongs afterwards. Use when context is running low, when compaction is offered, when the current job is finished, or when asked to hand off, wrap up, or write down where things stand.
---

# Writing the handoff

A handoff closes one piece of work. It exists because the longer a session runs the less reliably it
follows what it was told, and nothing inside that session reports the decline — so the remedy is to
start again, not to summarise. Compaction keeps working in a context that has already gone bad.

## What it carries

- **What was decided**, and what is now settled enough not to reopen.
- **What is next**, and what the next session should read, in what order.
- **Which files are in play**, and which are part-edited.
- **Which findings were already rejected, and why.** A rejection nobody wrote down comes back in the
  next review, gets argued a second time, and is finally applied by whoever assumes nobody had looked.
- **What has gone wrong repeatedly**, in enough detail to avoid rather than to understand.

## What it never carries

**The reasoning that reached the decisions.** Importing the argument rebuilds precisely the state that
starting over was meant to leave behind, and it arrives stripped of the evidence that made it
convincing. State the decision; leave the path to it behind.

## Where each part belongs afterwards

A handoff describes one moment. **Anything in it that is still true next month was in the wrong file** —
it belongs in a durable document, and putting it in the handoff instead is the expiring-inside-durable
failure running the other way. Before writing a paragraph, ask whether it survives this transition; if
it does, write it where it belongs and let the handoff point at it.

## Delete it once it has been read

The handoff is spent the moment the next session has started on it, like a plan is spent on execution.
A repository that accumulates handoffs teaches a reader to look for the current one and gives them no
way to tell which that is.
```

**Verification.**

```bash
node test/dedupe.js
node test/markers.js
node test/lineendings.js
grep -c 'name: handoff' .claude/skills/handoff/SKILL.md
grep -c 'was in the wrong file' .claude/skills/handoff/SKILL.md
grep -c 'obedience to instructions' .claude/skills/handoff/SKILL.md
grep -c '^## ' .claude/skills/handoff/SKILL.md
wc -l .claude/skills/handoff/SKILL.md
```

`name: handoff` **1**, `was in the wrong file` **1**, `^## ` **4**. `obedience to instructions` **0** —
that is imperative Seven's phrase and the collision revision 1 wrote; if it is 1, the pre-dry-run text
was pasted.

The file is **38 lines**. `test/lineendings.js` reports **56 files** — the last file this plan creates.

**`test/dedupe.js` reports 10 documents and `✅ nothing said twice`.** This is the first time the full
set is compared, and it is the reading Probe Five predicts. **If it is red here, stop and report it
rather than editing to clear it**: the dry run measured this exact state, so a difference means the text
that went in is not the text that was measured.

---

## Task 7 — update the `goldfish` skill

**Files:** `.claude/skills/goldfish/SKILL.md` (modify)

Two changes, and only two. The skill is otherwise current: slice 3 renamed the reviews and this file
already uses the new names.

**Before the changes:** `grep -c 'before a plan is executed' .claude/skills/goldfish/SKILL.md` is **1**,
and `wc -l` is **79**.

**Change 1 — the description names its adjacent skills.** Quoted at the point of change:

```markdown
description: Run a goldfish review — hand a document, a section, a plan, or two documents to an isolated reviewer that has been given no other context, and bring its findings back. Use when design text is ready to be checked, before a plan is executed, when an edit may have broken agreement between two documents, or whenever the user asks to review, check, or goldfish anything.
```

After:

```markdown
description: Run a goldfish review — hand a document, a section, a plan, or two documents to an isolated reviewer that has been given no other context, and bring its findings back. Use when design text is ready to be checked, when an edit may have broken agreement between two documents, or whenever the user asks to review, check, or goldfish anything. A plan written by the `plan` skill is reviewed here before the `execute` skill carries it out.
```

**Change 2 — the artefact review.** Decision 3. This skill's *Pick the review* table has five rows and
none of them is the artefact review, while `METHOD.md` assigns that review to this skill. The table gains
no row — a goldfish cannot look at what was built — and instead a paragraph is inserted **immediately
before** the existing paragraph that begins *"**`method` is used only for settling a procedure document
itself**"*:

```markdown
**There is no artefact review here.** A goldfish cannot look at what was built; that review is a person,
and the `execute` skill is where a slice hands them the artefact.
```

**Add a blank line after it**, separating it from the paragraph it now precedes. **The blank line is not
inside the quoted block.** Two lines plus that blank is why the file goes 79 → 82 and not 79 → 81.

**Verification.**

```bash
node test/skills.js
node test/dedupe.js
grep -c 'before a plan is executed' .claude/skills/goldfish/SKILL.md
grep -c 'the `execute` skill carries it out' .claude/skills/goldfish/SKILL.md
grep -c 'There is no artefact review here' .claude/skills/goldfish/SKILL.md
wc -l .claude/skills/goldfish/SKILL.md
```

`before a plan is executed` **1 → 0** — the old clause is gone, and that transition is what proves the
description was replaced rather than appended to. `the \`execute\` skill carries it out` **1**.
`There is no artefact review here` **1**. The file is **82 lines**, up from 79.

**`test/skills.js` still reports orphans** — this file is not one of its referrers. It is, however, the
first task to name a skill inside another skill, so if the *phantom* check fires here, its `NAMES`
pattern matches more than its comment claims.

---

## Task 8 — `METHOD.md`

**Files:** `METHOD.md` (modify)

**Decisions 3 and 4, and the first task in this slice to edit reviewed text.** `METHOD.md` is also what
`.claude/hooks/session-start.js` derives its payload from at fire time, so this task is the one that
could break the injection without any check in the suite noticing — except that `test/hooks.js` asserts
derivability and budget, which is why it runs here.

**Change 1 — Decision 3.** `METHOD.md` says in one place that the artefact review is a person and in
another that `goldfish` runs it. Quoted at the point of change, from *When each review fires*:

```markdown
| a document is finished; a slice is finished | the document review, the plan review, the look at the artefact | `goldfish` |
```

After — two rows, because the two halves have different answers in the third column:

```markdown
| a document is finished; a slice is finished | the document review and the plan review | `goldfish` |
| a slice is finished | a person looking at what was built | `execute` hands it over |
```

**Change 2 — Decision 4.** One paragraph naming the six new skills, inserted **immediately before** the
heading `## The three dispositions`:

```markdown
Six more skills hold the rest, loaded at the moment each is wanted: `slice` cuts settled design into
slices, `plan` turns one of them into an executable plan, `execute` carries that out and closes it down,
`checks` picks the kind of check, `bug` triages a defect before anybody opens the code, and `handoff`
shuts the session down cleanly.
```

**This wording is not revision 1's.** Revision 1 opened *"Six more skills carry what is not needed every
session"*, which collides with `SOURCES.md`'s heading *What is not needed every session is loaded when it
is*. The dry run found it.

**Neither change touches the injected region.** The hook cuts from `## The rule that overrides everything
else here` to `## The eight imperatives`, plus the eight bold statements. Both edits land well below the
second of those. Measured in the dry run: the payload is still derivable and still **1,691 characters**.

**Verification.**

```bash
node test/hooks.js
node test/skills.js
node test/dedupe.js
node test/markers.js
node test/xref.js
grep -c 'the look at the artefact' METHOD.md
grep -c 'a person looking at what was built' METHOD.md
grep -c 'Six more skills hold the rest' METHOD.md
grep -c 'what is not needed every session' METHOD.md
grep -c '`slice`' METHOD.md
grep -c '`handoff`' METHOD.md
wc -l METHOD.md
```

`the look at the artefact` **1 → 0**, taken at Task 0. `a person looking at what was built` **1**.
`Six more skills hold the rest` **1**. `what is not needed every session` **0** — a **guard**, 0 before
and after, proving the collided wording is not what went in. `` `slice` `` **0 → 1** and
`` `handoff` `` **0 → 1**.

**`METHOD.md` is 201 lines, up from 195.** Measured by applying both changes to the real file:
**195 → 196** after change 1 (one row becomes two), **→ 201** after change 2 (a **four**-line paragraph
plus the blank line separating it from the heading below). Revision 3 asserted 199 and called the
paragraph three lines; it is four, and the blank was not counted. **If you read 201 and the plan had
said 199, the right move would have been to report it — not to make the file match.**

**`test/hooks.js` must still report `1691 of 1900 characters injected`.** If that number moved, this task
changed text the hook derives from and the edit is in the wrong place. This is the assertion that makes
the task safe, and it is the reason `test/hooks.js` exists.

**`test/skills.js` must now report `✅ every skill reachable, none phantom`, 7 skills, 2 referrers.**
`METHOD.md` naming all six is what clears every orphan finding raised since Task 1.

---

## Task 9 — `AGENTS.md`

**Files:** `AGENTS.md` (modify)

**The skills table as it stands**, quoted at the point of change:

```markdown
### Skills

| | |
|---|---|
| `.claude/skills/goldfish/SKILL.md` | runs a goldfish review — picks the prompt, dispatches a fresh reviewer, brings findings back. The main agent does not need to know how |
| `skills-rueda-movements.md` | adding or changing one figure, call, position or formation. Predates `METHOD.md`; not yet reconciled with it |
```

**After** — six rows added, the existing two unchanged in wording and order:

```markdown
### Skills

Seven of these carry the method. Each states its own *Use when*; this table says what each owns, which
is the inventory's question and not the skill's.

| | |
|---|---|
| `.claude/skills/goldfish/SKILL.md` | runs a goldfish review — picks the prompt, dispatches a fresh reviewer, brings findings back. The main agent does not need to know how |
| `.claude/skills/slice/SKILL.md` | where to cut a settled design, and what each entry in the resulting list holds |
| `.claude/skills/plan/SKILL.md` | turning a chosen slice into something executable, and the conventions each one must carry |
| `.claude/skills/execute/SKILL.md` | carrying a plan out task by task, and closing it down |
| `.claude/skills/checks/SKILL.md` | choosing which kind of check to write, and what each kind's failure means |
| `.claude/skills/bug/SKILL.md` | which of three things a failure actually is — silent specification, missing check, or a design that is simply wrong |
| `.claude/skills/handoff/SKILL.md` | shutting one session down and opening the next without losing what was settled |
| `skills-rueda-movements.md` | adding or changing one figure, call, position or formation. Predates `METHOD.md`; not yet reconciled with it |
```

**Five of these six rows were reworded after the dry run.** Revision 1 wrote them as near-paraphrases of
the descriptions they name, and `test/dedupe.js` found five collisions between a skill and the row
describing it — plus one between the `bug` row and Decision 4's new `METHOD.md` line. A row that repeats
its skill's own trigger line is not an inventory entry; it is the trigger line, in a second place.

**And one stale line elsewhere in `AGENTS.md`**, in the Layer 3 table:

```markdown
| `plans/` | one plan per slice or per fix | **does not exist yet** |
```

After:

```markdown
| `plans/` | one plan per slice or per fix | current, holding the plan for the slice in progress |
```

**Verification.**

```bash
node test/skills.js
node test/dedupe.js
node test/markers.js
grep -c 'does not exist yet' AGENTS.md
grep -c 'SKILL.md' AGENTS.md
grep -c 'skills/handoff' AGENTS.md
grep -c 'Seven of these carry the method' AGENTS.md
wc -l AGENTS.md
node test/run.js && node test/xref.js && node test/prompts.js && node test/dedupe.js && node test/markers.js && node test/lineendings.js && node test/skills.js && node test/hooks.js && node test/plan-citations.js && node test/sources.js
```

`does not exist yet` **0** — it was **1** at Task 0 and this was its only occurrence. `SKILL.md` **7**.
`skills/handoff` **1**. `Seven of these carry the method` **1**. `AGENTS.md` is **166 lines**, up from
157: six rows and a three-line preamble.

**All ten checks green here**, with `DEDUPE` at **10 documents, nothing said twice** and `SKILLS` at
**7 skills, 2 referrers**. This is the first point in the plan where every check passes at once.

---

## Task 10 — `test/markers.js` and the compact hook

**Files:** `test/markers.js` (modify), `.claude/hooks/pre-compact-handoff.js` (modify)

**Decision 6 — the skills join the marker check.** Quoted at the point of change:

```javascript
const DOCS = ['METHOD.md', 'AGENTS.md', 'ROADMAP.md', 'CORRIDORS.md', 'FORMATIONS.md'];
```

After — discovered on disk rather than listed, matching how `test/dedupe.js` finds them, so that skill
eight does not have to be remembered:

```javascript
const skillFiles = () => {
  const dir = path.join(ROOT, '.claude/skills');
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter(e => e.isDirectory())
    .map(e => `.claude/skills/${e.name}/SKILL.md`);
};

const DOCS = ['METHOD.md', 'AGENTS.md', 'ROADMAP.md', 'CORRIDORS.md', 'FORMATIONS.md', ...skillFiles()];
```

**The three names this closure depends on are all already in that file, and all three were read rather
than assumed:** `fs` at `test/markers.js:23`, `path` at `24`, and **`ROOT` at `26`** —
`const ROOT = path.join(__dirname, '..');`, at module scope, above `run()`. No line is added for any of
them.

**`ROOT` is called out because the plan review said it was missing** and named it the most likely
runtime failure. It is not missing. But revision 2 had made a point of having read the require lines and
said nothing about `ROOT`, in the same slice that writes *"`ROOT` is declared, not assumed"* into the
`plan` skill — so the reviewer had every reason to suspect it, and the asymmetry was the real defect.

**This check must be shown an input it fails on, at the same time as the change.** Exactly:

1. `mkdir -p .claude/skills/zz-negative-case`
2. Write `.claude/skills/zz-negative-case/SKILL.md` containing exactly these five lines:

```markdown
---
name: zz-negative-case
description: Temporary fixture proving test/markers.js sees skill files. Deleted in this same task.
---

# One **unbalanced marker
```

3. `node test/markers.js` — it must fail, naming `.claude/skills/zz-negative-case/SKILL.md`.
4. `rm -rf .claude/skills/zz-negative-case`
5. `node test/markers.js` — green again, back to **281 sections across 12 documents**.

Record the output of steps 3 and 5. An assertion nobody has watched fail may be asserting nothing.

**While that directory exists, three other checks see it too**, and none of this is a defect — it is why
the fixture is deleted inside the same task rather than left for the close-out:

- `test/skills.js` reports **8 skills** and one orphan, `zz-negative-case is named by nothing`.
- `test/dedupe.js` reports **11 documents**; the fixture is short and shares no five-word run, so it
  stays green.
- `test/lineendings.js` reports **57 files**.

**Do not run the full ten-check command between steps 2 and 4**, and do not commit while the directory
exists. The name is prefixed `zz-` so that it sorts last and is obvious in `git status` if step 4 is
somehow missed.

**Decision 5 — the hook names the skill.** Quoted at the point of change:

```javascript
const MESSAGE =
  'Context is about to compact. Write the handoff and propose a fresh session instead: ' +
```

After:

```javascript
const MESSAGE =
  'Context is about to compact. Write the handoff with the handoff skill and propose a fresh session ' +
  'instead: ' +
```

**This task edits a hook, so it runs that hook** — convention 5, and the reason it is a convention:

```bash
echo '{"trigger":"auto"}' | node .claude/hooks/pre-compact-handoff.js
```

It must print JSON containing `Write the handoff with the handoff skill` and exit 0. Task 0 took the
before-reading of this same command, so a hook that was already broken is distinguishable from one this
task broke.

**Verification.**

```bash
node test/markers.js
node test/hooks.js
echo '{"trigger":"auto"}' | node .claude/hooks/pre-compact-handoff.js
grep -c 'handoff skill' .claude/hooks/pre-compact-handoff.js
grep -c 'skillFiles' test/markers.js
node test/run.js && node test/xref.js && node test/prompts.js && node test/dedupe.js && node test/markers.js && node test/lineendings.js && node test/skills.js && node test/hooks.js && node test/plan-citations.js && node test/sources.js
```

`handoff skill` in the hook **1** — it was **0** at Task 0. `skillFiles` in `test/markers.js` **2**.

**`MARKERS` reports 281 sections across 12 documents**, up from 253 across 5. Measured in the dry run,
not derived: revision 1 predicted 268 by adding Probe Three's 15 to the existing 253, and that was wrong
because Probe Three measured the recovered bodies without frontmatter or titles and did not include
`goldfish` or `handoff` at all. **If the reading is not 281, take it and say so — do not adjust a file to
match a number in a plan.**

`test/hooks.js` reports **5 hooks, 5 references, 1 exempt, 1691 of 1900 characters injected**. The
injected budget is the `SessionStart` payload; this task does not touch it, and Task 8 already proved it
survives the only edits that could have moved it.

---

## Task 11 — GATE 3: does the right skill fire?

**Files:** none.

This slice's risk is not in its prose. Seven descriptions now compete for selection, `ROADMAP.md` records
that selection degrades on semantic confusability, and `test/skills.js`'s own comment records that agents
invoke a correct skill in roughly seven of ten tasks where one exists. **No plan review can test that.**
Slice 4's defect was found by starting a session, not by five rounds of reading.

**Who runs this task: Sam, not the executing agent.** An agent carrying out this plan cannot start a
fresh top-level session, and a subagent is the wrong instrument — subagent skill selection is not the
mechanism a real session uses, so a result from one would answer a different question. **The executor
stops here, reports that Tasks 0–10 are complete, and hands over the table below.** Task 12 does not
begin until the results come back.

**Six chats, not one session and not seven.** An earlier revision put all seven scenarios to a single
session, and that would have inflated the result two ways. **The skill files name each other** — once
`slice` fires, its text is in context saying the plan for a slice is the `plan` skill's job, so the next
scenario is answered with a hint rather than by selection. And **the scenarios chain**: 1, 2 and 3 are
deliberately one story, so each primes the next.

**Scenario 5 is the exception and stays with scenario 4.** *"Add something that catches this from now
on"* has no referent alone — *this* is the defect from the message before it — so in a cold chat it tests
nothing. Its result is a soft pass at best, because `bug` has already fired and `bug`'s text names the
`checks` skill.

**Run each chat in a disposable copy of this repository, not in the working tree.** These scenarios ask
an agent to plan, to build and to write a handoff; it will try, and the tree holds uncommitted work. In a
copy the side effects become evidence that a skill fired rather than damage to undo.

| Chat | Put to it | Should fire |
|---|---|---|
| 1 | *"The corridor design is finished. It is too big for one session — how should we break it up?"* | `slice` |
| 2 | *"Slice 2 is next. Write up how we are going to build it."* | `plan` |
| 3 | *"The plan is reviewed. Start building."* | `execute` |
| 4 | *"Dile Que No leaves a 3px gap at four couples and I do not know why."* — then, **in the same chat**, *"Add something that catches this from now on."* | `bug`, then `checks` |
| 5 | *"We are nearly out of context and this is done."* | `handoff` |
| 6 | *"Have a fresh pair of eyes read FORMATIONS.md §2.5."* | `goldfish` |

Record, for each: which skill fired, whether it fired **unprompted** — the scenario never names it — and
whether anything else fired alongside.

**The grading key, written here rather than improvised**, because a criterion invented after seeing the
answer grades nothing:

- **Pass** — the named skill fires, unprompted, and no other method skill fires with it.
- **Confusable** — a different method skill fires, or two do. Record which pair; the finding is in the
  two descriptions, not in the scenario.
- **Silent** — no skill fires. Record it. Decision 4 put a naming line into `METHOD.md` precisely for
  this case, so a silent result now also tests whether that line is doing anything.

**Verification.** Seven results across six chats, each Pass, Confusable or Silent, with the pair named
for every Confusable. Scenario 5's is marked as the soft one.

**A result of seven passes is a suspicious result** and must be reported as such rather than as success.
The scenarios were written by the same session that wrote the descriptions, which is the shape of a test
that agrees with itself. If Sam wants scenarios written by somebody who has not seen the descriptions,
that is a better test and this one should not stand in for it.

**Anything reaching outside the repository is a finding, not a step to approve.** None of these six
scenarios should make an agent fetch a page, send anything, or push. If one does, the defect is in the
skill's wording and it goes in the results.

---

## Task 12 — `ROADMAP.md`, and close out

**Files:** `ROADMAP.md` (modify), `HANDOFF.md` (delete), `plans/2026-08-29-seven-skills.md` (delete, in
its own commit)

**`ROADMAP.md` — the recovery table has been spent.** Quoted at the point of change:

```markdown
#### What slice 5 must recover, and from where

Slice 3 leaves this material out of the method core, and slice 5 recovers it with `git show 7013a33:METHOD.md`.

| Destination | Lines in the source object |
|---|---|
| the slice skill | 660 to 726 |
| the plan skill | 727 to 758 |
| the execute skill | 766 to 799 |
| the checks skill | 364 to 390 |
| the bug skill | 846 to 850, 858 to 870 |
| PILOT.md, slice 7 | 506 to 509, 1001 to 1002 |
```

**After** — five rows retire, the sixth does not, because slice 7 has not run:

```markdown
#### What slice 7 must recover, and from where

Slice 3 left this material out of the method core. Slice 5 recovered five of the six destinations with
`git show 7013a33:METHOD.md`; the last is still outstanding.

| Destination | Lines in the source object | State |
|---|---|---|
| PILOT.md, slice 7 | 506 to 509, 1001 to 1002 | outstanding |

**Recovering is not copying, and slice 5 measured how far from copying it is.** The five recovered
ranges carried sixteen references to a document `METHOD.md` no longer is — five `§` references into a
file with no numbered sections, seven stage names, four gate names — and four passages `test/dedupe.js`
reports as said twice. Slice 7 should expect the same of its two ranges, and should build the whole
outcome in a scratch tree before writing its plan: slice 5's first probe compared only the recovered
bodies and found four collisions, while the full dry run found sixteen, twelve of them in text the plan
had written itself.
```

**And the settled list gains what this slice settled.** The list is a two-space-indented `- ` bullet list
inside the *What is deliberately settled* block. Its **last** entry is the one to insert after, quoted
here at the point of change so the insertion point is unambiguous — the new bullets go immediately below
the line ending `GATE 1 gets a prompt of its own.` and immediately above the blank line preceding
`#### The nine slices`:

```markdown
  - **`TreeReview`'s machinery is not adopted, only its diagnosis.** Measured at ~23× document size per
    pass — about 2.1M tokens for `CORRIDORS.md`. What was taken from it: that running the
    implementability prompt over a whole document is the flat pass it measures as worst, which is why
    GATE 1 gets a prompt of its own.
```

**Match its indentation exactly: two spaces before the `- `, four before continuation lines.** The two
new bullets:

```markdown
  - **The seven skills carry their own routing, and `METHOD.md` names them.** Each description names its
    adjacent skills, so the one that should have fired is reachable from the one that did; and the core
    names all seven in a line, because a skill that never triggers and a skill that does not exist look
    identical from inside a session.
  - **New process text is measured against the whole family before it is written down.** A collision is
    cleared by moving the text that does not exist yet, never by rewording a document already in the
    repository and never by the allow list.
```

**Close-out — four things, none optional.**

1. **Update the map — not performed, and recorded as such in `ROADMAP.md`.** There is no Layer 2 map in
   this project and creating one is already on the backlog, so there is nothing to update. Append this
   line to the same settled-list block the two bullets above go into, so the record sits with the rest
   of what this slice settled:

   ```markdown
  - **Slice 5's close-out could not update the map, because there is none.** Building one is on the
    backlog; this is recorded rather than skipped, because a process step that silently cannot be
    performed teaches everybody that close-out items are advisory.
   ```

   A step that cannot be performed must leave a trace, or the next executor cannot tell it from one
   that was forgotten.
2. **Delete `HANDOFF.md`** — Decision 8, after **Task 6** has used it as its model. Task 2 does not read
   it: the two conventions it contributed are quoted in full in Task 2, so nothing there depends on the
   file still existing. Revision 2 said "Tasks 2 and 6" here and "Task 6" in the decision table; the
   decision table was right.
3. **Delete this plan once it has been executed.** It is spent.

   **No task in this plan makes a commit, and none may.** Starting one is not the executor's to do —
   it is asked for. So the executor's last act is to report that the slice is complete and the tree is
   green, and to say that two commits are wanted and what each should contain: **one** carrying the
   slice, and **a second, separate one** deleting this file. Revision 3 said "delete this plan, in its
   own commit" as though a first commit had already happened; it had not, and no step created it.

4. **Run the ten checks** — the command at the head of this plan, which is the list `AGENTS.md` carries.
   Every runnable one green; `test/visual.js` named as unrunnable with the reason, and not counted as
   passing. It is named here rather than by reference so that this step does not depend on a document
   the executor may not have opened.

**Verification.**

```bash
grep -c 'What slice 5 must recover' ROADMAP.md
grep -c 'What slice 7 must recover' ROADMAP.md
grep -c 'the slice skill | 660 to 726' ROADMAP.md
grep -c 'carry their own routing' ROADMAP.md
ls HANDOFF.md
node test/run.js && node test/xref.js && node test/prompts.js && node test/dedupe.js && node test/markers.js && node test/lineendings.js && node test/skills.js && node test/hooks.js && node test/plan-citations.js && node test/sources.js
```

`What slice 5 must recover` **0** — it was **1** at Task 0. `What slice 7 must recover` **1**.
`the slice skill | 660 to 726` **0** — the spent rows are gone. `carry their own routing` **1**.
`ls HANDOFF.md` reports no such file.

**All ten checks green**, with `SKILLS` at **7 skills, 2 referrers**, `DEDUPE` at **10 documents, nothing
said twice**, `MARKERS` at **281 across 12**, `HOOKS` at **1691 of 1900**, and `PLAN CITATIONS` at
**1 plan, 13 tasks, 1 exempt** — then **0 plans** after step 3, which is the last reading this plan takes
and the one that proves it is gone.

---

## What this plan cannot prove before it runs

**Whether the seven descriptions are distinguishable.** Task 11 is the only thing that answers it, it
answers it in a session rather than in a file, and it cannot run until all seven exist. If it returns
Confusable pairs, the fix is a second pass over two descriptions — not a redesign of the slice — and that
pass is new work with a plan of its own if it is more than a sentence.

**Whether anything else in this repository names a skill in a form `test/skills.js` does not match.**

**That check uses two different patterns, and revision 2 described one of them as though it were both.**
The distinction decides whether Task 8 does what it claims, so it is stated here rather than left to be
inferred:

- **The orphan check** — does anything point at this skill? — tests `` `<name>` `` alone, a bare
  backticked name. Decision 4's paragraph in Task 8 backticks all six, so **it clears every orphan**,
  which is what Task 8 asserts.
- **The phantom check** — does this document name a skill that is absent? — tests `NAMES`, the backticked
  name **followed by the word *skill***, and **it scans only three files**: `METHOD.md`, `AGENTS.md` and
  `PILOT.md`. **Skill files are never scanned for phantoms.**

That last clause is the one that matters here. Tasks 1, 2 and 4 write descriptions naming skills that
later tasks create — `slice` names the `` `plan` `` skill, `plan` names the `` `execute` `` skill,
`checks` names the `` `bug` `` skill — and **none of those forward references is visible to the phantom
check**, because a `SKILL.md` is not one of the three files it reads. Task 1's assertion of *two skills
and one problem* holds.

So the residual risk is only this: a document that says *"use the slice one"* names a skill in a form the
phantom check cannot see. Nothing in this plan depends on that, and no assertion here would catch it.

**Two consecutive plan reviews read earlier versions of this paragraph and both concluded Task 8 could
not clear the orphans.** It can. But a paragraph that produces the same wrong reading twice is a defect
in the paragraph, and the missing sentence both times was *which files the check actually opens*.

**What a plan review will find.** Revision 1 was reviewed by nobody and had sixteen collisions where it
claimed four, two failed fixes, and a wrong fallback for the third. That was found by building the thing
in a scratch tree, not by reading — which is an argument for the dry run, and not an argument that the
plan review has nothing left to find.
