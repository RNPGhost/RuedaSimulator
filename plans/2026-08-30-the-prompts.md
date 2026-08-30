# The prompts — implementation plan

> **Goal:** split the section review from the document review, give every goldfish prompt forced
> quotation and a place to put an ungrounded concern, make a check hold the shared text so the five
> prompts cannot drift apart in silence, and give review dispositions and review state a durable home.
> **Spec:** none — this slice builds process tooling. Its specification is `ROADMAP.md`'s slice 6 row
> under *The methodology's own remaining work*, and that document has no numbered sections to cite.
> **Map:** none. This repository has no Layer 2 map; `ROADMAP.md`'s backlog records building one, and
> `AGENTS.md` records the same absence. Every file this plan touches is named by exact path below.
> **Status:** in progress — deleted on completion.

---

## The eleven checks

Named once, here, because Tasks 0, 10 and 13 all run "the checks" and a set nobody enumerated cannot be
compared against. Ten exist today; `test/reviews.js` is the eleventh and Task 8 creates it.

```
test/run.js  test/xref.js  test/prompts.js  test/dedupe.js  test/markers.js
test/lineendings.js  test/skills.js  test/hooks.js  test/plan-citations.js  test/sources.js
test/reviews.js   <- created by Task 8
```

`test/run.js` ends `✅ ALL GREEN` and takes about 22 seconds; the rest print a summary line and a `✅`.
`test/visual.js` is not one of them — it needs `playwright` and cannot run on this checkout, and
`.claude/hooks/pre-commit-gate.js` lists it as an exemption rather than counting it.

## The record file

Several tasks take a reading a later task compares against. Those readings go in one file:

```
<scratchpad>/slice6-record.md
```

`<scratchpad>` is the running session's own scratch directory. Created by Task 0, appended to by any
task told to record something, discarded at Task 13. **It is not a repository file** — it expires with
the slice, and `METHOD.md` forbids putting an expiring thing inside a durable one. **Nothing that must
outlive the slice goes in it**; anything durable goes to `ROADMAP.md` or `REVIEWS.md` in the same step.

## Where the conventions live

This plan cites *convention 4* and *convention 5*. Both are in `.claude/skills/plan/SKILL.md`, under
*Five conventions every plan carries*. That file also holds the rule about what a plan quotes.

## What this slice settles

1. **A document names no person.** The rule goes into `METHOD.md` and gets a `SOURCES.md` entry. The
   sweep applying it to the 117 existing occurrences is **not** in this slice; `ROADMAP.md`'s backlog
   holds it, for after the nine slices.
2. **The section review and the document review get one prompt each.**
3. **Forced quotation and a stated concern outlet in all five prompts**, and every prompt after them.
4. **A check holds the shared text.** `test/prompts.js` carries the canonical wording; each prompt stays
   one self-contained file that a reviewer reads start to finish.
5. **`REVIEWS.md`** — one place recording, per document and per plan, which reviews have run and which
   findings were rejected and why.
6. **`test/reviews.js`** — the eleventh check. Among other things it asserts that **every plan in
   `plans/` has a plan review recorded**, which is the check that would have caught the defect Task 11
   fixes.
7. **The routing hole between `plan` and `goldfish` closed.** Task 11.

## What this slice does not settle

- **It renames nothing outside `prompts/`.** The 117 personal-name occurrences stay.
- **It computes no dependency closure.** `REVIEWS.md` records each document's normative dependencies as
  a hand-written declaration.
- **It runs no review of another document.** `CORRIDORS.md`'s outstanding document review and the
  `FORMATIONS.md` seam stay parked until after slice 9 and until the existing documents have been
  brought onto this method.

## Decisions this plan makes that were not separately asked for

| Decision | Reverse it by |
|---|---|
| Task 3 brings `goldfish-plan.md` and `goldfish-seam.md` up to the shared shape they never had — an understood-section, the long report-order form, the full no-fixes closing. | **strike** Task 3, and the entries it feeds in Task 5 |
| The shape assertions extend `test/prompts.js` rather than becoming a check of their own. A new check file would force `ten` → `eleven` in `AGENTS.md` twice plus the hook list and the command block, and Task 10 already pays that once for `test/reviews.js`. | **split** |
| `REVIEWS.md` is a single file, not a `reviews/` directory. `METHOD.md`: *"Never split a document because it got long."* | **explode** |
| `REVIEWS.md` joins `test/dedupe.js`'s document list. | **exempt** |
| The rejected finding about guarding a reused term is **moved** out of `ROADMAP.md`'s settled list into `REVIEWS.md`, not copied, **and keeps its exact original wording.** | **restore** |
| `test/reviews.js` does not join `post-doc-edit.js`'s fast five. | **promote** |
| A `REVIEWS.md` block **survives the plan it describes**, its state becoming `spent`. Deleting the record of a review when the plan goes destroys the thing the record exists for. | **prune** |
| The isolation clause is enforced as a **shape**, not as verbatim text. Measured below: its shared words are bolded and wrapped differently in every prompt, so no exact string exists to hold. | **restore** the verbatim entry |
| Task 11 **does not** re-run a trigger scenario, and records the description change as unmeasured **in `ROADMAP.md`**, because no such test exists on disk. | **measure** |

## Constraints

- **`METHOD.md`, Rules for the work itself:** *"Edit documents with assertion-checked scripts —
  exact-string replacement, count the matches, and fail before writing if the count is not exactly
  one."* Every document edit here is a script written to a file and run with `node`. **Never inline in
  `node -e`, and never through a heredoc**: measured twice in this repository, a quoted heredoc dropped
  one backslash of a `\\b` pair and the resulting anchor silently matched nothing.
- **`METHOD.md`:** *"Every check is shown an input it must fail on, built at the same time as the check
  itself."*
- **`METHOD.md`:** *"A claim with no check behind it is an opinion, however carefully it was argued."*
- **`ROADMAP.md`, settled:** *"New process text is measured against the whole family before it is
  written down. A collision is cleared by moving the text that does not exist yet, never by rewording a
  document already in the repository and never by the allow list."* **Task 7 satisfies this by running
  the real check rather than a copy of it**, and by rewording only the file that did not exist before.
- **`test/dedupe.js`** compares every family-2 document — the ones about how work is done here, rather
  than about what the software must do — pairwise on runs of **five or more** words, after stripping
  fenced blocks, inline code, link targets and punctuation.
- **`test/lineendings.js`**: every `.md` and `.js` file is LF. No script may write `\r`.
- **The negative-case convention**, from `test/lineendings.js`: a check that walks a directory takes
  `run(root = ROOT)` so its broken fixture lives in the OS temp tree and never reaches a commit.
  `test/prompts.js` does not take a root today; Task 5 changes that.

## The five prompt files after this slice

| File | Review it runs | State after this slice |
|---|---|---|
| `prompts/goldfish-section.md` | one section, plus what it depends on | renamed from `goldfish-spec.md`, scope narrowed |
| `prompts/goldfish-document.md` | one whole design document | **new** |
| `prompts/goldfish-plan.md` | a plan | modified |
| `prompts/goldfish-seam.md` | two documents against each other | modified |
| `prompts/goldfish-method.md` | a process document | modified |

## The shared parts, and why only four are verbatim

**Measured across the four prompts as they stand today.** `yes` means the exact string is present.

| Candidate | method | plan | seam | spec |
|---|---|---|---|---|
| `**DO NOT BE HELPFUL.**` | yes | yes | yes | yes |
| `do not search the web` | yes | yes | yes | yes |
| report-order, long form ending `— do not pad it.` | yes | — | — | yes |
| report-order, short form | — | yes | yes | — |
| the no-fixes closing paragraph | yes | — | — | yes |
| a sentence containing `is not optional` | yes | — | — | yes |
| `do not read the codebase` as an exact substring | — | — | — | yes |

Four things follow, and they determine Task 5's design:

1. **Only two passages are identical across all four today.** Task 3 normalises the report-order
   instruction and the closing paragraph into the two prompts that lack them, bringing the verbatim set
   to four once Task 4 adds the forced-quotation paragraph.
2. **The isolation clause cannot be verbatim.** Each prompt names what *it* was given, and the shared
   prohibitions are wrapped and bolded differently in each file — `**Do not read the codebase**` in two,
   plain lowercase in one, split across a line break in the fourth. It is a **shape**, not a string.
3. **The check must normalise before comparing.** Collapse every run of whitespace to a single space and
   strip `**`, on both sides. Without that, line wrapping alone makes a correct prompt fail.
4. **The `is not optional` sentence cannot be verbatim either** — `goldfish-method.md` says *"Section 8
   is not optional and is not a summary of your findings."* and `goldfish-spec.md` says *"Section 7 is
   the most important and is not optional."* Each numbers its own final category. Shape, not string.

## The final two categories, in every prompt, after Task 4

Task 3 and Task 4 both renumber, so the end state is stated once here and each task is checked against
it.

| File | Categories before Task 3 | Concern outlet at | Understood-section at |
|---|---|---|---|
| `goldfish-section.md` | 1–7, understood at 7 | 7 | 8 |
| `goldfish-document.md` | written by Task 2 with both in place | 7 | 8 |
| `goldfish-method.md` | 1–8, understood at 8 | 8 | 9 |
| `goldfish-plan.md` | 1–7, no understood-section | 8 | 9 |
| `goldfish-seam.md` | 1–6, no understood-section | 7 | 8 |

---

## Task 0 — Take every before-value

Convention 4: once an edit lands the original is not recoverable, and a transition nobody took the first
reading of cannot be checked at all. **This task runs with this plan file already on disk**, so every
reading includes it — three readings in the previous slice were wrong for exactly that reason.

**Files:** none modified. Creates `<scratchpad>/slice6-record.md`.

**Steps:**

1. Confirm `plans/2026-08-30-the-prompts.md` exists.
2. Create the record file and write into it:
   - `wc -l` for `METHOD.md`, `AGENTS.md`, `ROADMAP.md`, `SOURCES.md`, `test/prompts.js`,
     `.claude/skills/goldfish/SKILL.md`, `.claude/skills/plan/SKILL.md`. Record `REVIEWS.md` as
     **absent** — an absent file and a file of zero lines must not look alike.
   - byte length and line count of each of the four files in `prompts/`
   - the summary line of each of the **ten** checks that exist today, from the list above
   - `git status --porcelain`, in full
   - the count of `goldfish` in `.claude/skills/plan/SKILL.md` — **expected 0**
   - the word-boundary count of `ten` in `AGENTS.md` — **expected 2**
   - the word-boundary count of `five` in `AGENTS.md` — **expected 6**. Do **not** record their line
     numbers: Task 7 edits `AGENTS.md` and would move them. Task 10 re-reads the lines itself.
   - the entry count `test/sources.js` reports, with its three-way kind breakdown

**Verification:**

```bash
node test/lineendings.js && node test/plan-citations.js
```

`LINE ENDINGS` must report **55** file(s) — **not 56**. It read 55 at the start of the session that wrote
this plan too, and is unchanged because `HANDOFF.md` was deleted in that same session: the two cancel.
That coincidence is why the reading is stated with its arithmetic rather than as a bare number.

`PLAN CITATIONS` must report **1 plan(s), 14 task(s) examined, 1 plan(s) exempt with a stated reason** —
exempt because this plan's `Spec:` line begins `none` and gives a reason after it.

---

## Task 1 — A document names no person

**Files:** `METHOD.md` — modify. `SOURCES.md` — modify.

**Steps:**

1. In `METHOD.md`, under `## Rules that follow from the layers`, insert a bullet immediately after this
   one, which is quoted in full and is the anchor:

   ```
   - **Intent names no code** — no path, no line, no symbol as the code spells it. State the behaviour or
     the derivation instead; the name belongs in a check, where it rots loudly rather than in silence.
   ```

   The text to insert, exactly:

   ```
   - **A document names no person.** Say *the author* or *the user* — whichever the sentence means. A
     process that depends on who is at the keyboard stops working the day somebody else sits down, and
     nothing about the document says so. Attribution of a ruling survives the change: it still separates
     what the person who owns the domain decided from what an agent inferred.
   ```

2. In `SOURCES.md`, insert this entry immediately before the line `### Superseded documents are removed`.
   The field order and punctuation match the reasoned entries already in that file:

   ```
   ### A document names no person

   **Kind:** reasoned
   **Evidence:** none. An argument, not a measurement. What was measured is only the size of the problem
   it describes: 117 occurrences of one personal name across 13 files, and none of them in the documents
   that carry the method itself. That is illustration, not proof.
   **Departs:** no

   ```

   A reasoned entry carries no `**Sources:**` line. `test/sources.js` reads the `**Kind:**` line and
   fails an entry whose declared kind and citation do not fit each other.

3. Run `node test/dedupe.js`. On a collision, reword the **new** text — never text already in the
   repository, never the allow list.

**Verification:**

```bash
node test/dedupe.js && node test/markers.js && node test/sources.js && node test/lineendings.js
```

Then a script asserts, failing the task if any is wrong:

- `METHOD.md` contains `- **A document names no person.**` exactly once
- `METHOD.md` is exactly **4** lines longer than the record file's reading
- `SOURCES.md` contains `### A document names no person` exactly once
- `test/sources.js` reports **one more** entry than the record file's reading, the increase falling
  entirely in the **reasoned** column with the other two unchanged

---

## Task 2 — Split the spec prompt in two, and move every reference at once

> **One task, because it is one change.** Renaming `goldfish-spec.md` breaks three references; creating
> `goldfish-document.md` requires three more to exist before `test/prompts.js` can be green. Split
> across tasks, both intermediate states are red and neither half has a gate that can pass. The
> deliberate red is preserved as step 3's negative case, inside the task, where it costs nothing.

**Files:**
- `prompts/goldfish-spec.md` → `prompts/goldfish-section.md` — rename, then modify
- `prompts/goldfish-document.md` — create
- `.claude/skills/goldfish/SKILL.md`, `AGENTS.md`, `ROADMAP.md`, `test/prompts.js` — modify

**Steps:**

1. `git mv prompts/goldfish-spec.md prompts/goldfish-section.md`

2. Replace the file's **first five lines**. They currently read, in full — one sentence, a blank line,
   and three wrapped lines:

   ```
   You are reviewing a design document for a project you have never seen.

   You have been given exactly one thing: the document. You have no other context, and you must not go
   and find any — do not read the codebase, do not search the web, do not infer from file names, and do
   not use anything you happen to know about the problem domain.
   ```

   with exactly this, which is six lines:

   ```
   You are reviewing one section of a design document for a project you have never seen.

   You have been given that section, and the sections it depends on. Nothing else. You have no other
   context and you must not go and find any — do not read the rest of the document, do not read the
   codebase, do not search the web, do not infer from file names, and do not use anything you happen to
   know about the problem domain.
   ```

   **The prohibition on the rest of the document is the whole instrument here.** A reviewer who reads the
   surrounding sections cannot tell you whether this one stands up alone.

3. **Take the negative case now, before going further.** Run `node test/prompts.js`. It must report three
   phantom problems of the form `<file> names prompts/goldfish-spec.md, which does not exist`. Copy the
   three lines verbatim into the record file. This is the only free demonstration in the slice that the
   phantom half of that check actually fires, and it exists for exactly two minutes.

4. Change the file's single question, which currently reads:

   ```
   > Could you implement this document, first time, without asking the author anything?
   ```

   to:

   ```
   > Could you implement this section, first time, without asking the author anything?
   ```

   Leave the seven report categories untouched. They are calibrated, and this task is scope, not content.

5. Create `prompts/goldfish-document.md` with exactly this content:

   ```
   You are reviewing a complete design document for a project you have never seen.

   You have been given that document and nothing else. You have no other context and you must not go and
   find any — do not read the codebase, do not read any other document it mentions, do not search the
   web, and do not use anything you happen to know about the problem domain.

   **Your job is not to say whether the design is good.** Somebody else owns that question, and each
   section has already been read on its own. Your job is the question no reader of one section at a time
   can answer:

   > Can this document be implemented as a whole, and does it agree with itself?

   Hold the whole of it at once. The defect this review exists to catch is not present in any single
   section — it is present only in the pair, or in the gap between them, and a careful reader given one
   section at a time will pass both halves of it.

   **DO NOT BE HELPFUL.** Do not reconcile two sections by deciding which one is probably right, and do
   not assume a later section supersedes an earlier one unless the document says so. Where two passages
   disagree, report the disagreement. Deciding which is wrong is the author's job and needs knowledge you
   have deliberately not been given.

   **Every finding quotes the text it is about.** Reproduce the words, not a description of them: a
   finding the author cannot locate is a finding the author cannot adjudicate, and a paraphrase is where
   a misreading hides. If you cannot quote it, it belongs in CONCERNS YOU COULD NOT GROUND.

   Report in this order. If a category is empty, write "none" — do not pad it.

   1. **SELF-CONTRADICTIONS** — two passages that cannot both be true. Quote both, naming the section
      each came from. This is the highest-value category; spend your effort here.
   2. **DIVERGENT DEFINITIONS** — one term, symbol or name used with two meanings in two places, or
      defined twice in wording that does not obviously mean the same thing.
   3. **ORPHANED RULES** — a rule stated in one section that a later section silently overrides, narrows
      or ignores without saying it is doing so.
   4. **GAPS BETWEEN SECTIONS** — a case that falls between two sections so that neither covers it,
      where each reads as complete on its own.
   5. **UNREACHABLE OR UNUSED** — a term, definition or mechanism the document introduces and never
      uses, or that nothing can reach.
   6. **ORDER OF READING** — anything that cannot be understood without having already read a later
      section, where the document does not say so.
   7. **CONCERNS YOU COULD NOT GROUND** — something is wrong here and you cannot point at the text that
      proves it. Say what worries you, and say plainly that you could not ground it. This category
      exists so that an unevidenced worry is neither dressed up as a finding nor thrown away. Both are
      worse than an honest entry here.
   8. **WHAT YOU UNDERSTOOD THIS DOCUMENT TO DESCRIBE** — three to six sentences, in your own words:
      what this thing is, what it does, and what it is for.

   **Section 8 is not optional and is not a summary of your findings.** A reviewer who found no
   contradictions and understood a different system from the one the author described is the worst
   outcome available here, and it is invisible unless you write down what you understood. Do not skip it
   because the earlier sections went well.

   **Report findings; do not propose fixes, and do not edit anything.** Deciding what to change needs
   context you were deliberately not given, and a fix proposed from here invites somebody to apply it
   without thinking. Say what you could not do and why, and stop there.
   ```

   **Do not paraphrase `goldfish-section.md`'s categories into this file.** They ask a different
   question, and `ROADMAP.md`'s settled list records why: running the implementability prompt over a
   whole document is the flat pass measured as the worst-performing option.

6. In `.claude/skills/goldfish/SKILL.md`, these two rows currently read:

   ```
   | **section** | `prompts/goldfish-spec.md` | one section, plus what it depends on |
   | **document** | `prompts/goldfish-spec.md` | one whole design document |
   ```

   Replace with:

   ```
   | **section** | `prompts/goldfish-section.md` | one section, plus what it depends on |
   | **document** | `prompts/goldfish-document.md` | one whole design document |
   ```

7. In `AGENTS.md`, this row currently reads:

   ```
   | `prompts/goldfish-spec.md` | could you implement this document without asking anything? |
   ```

   Replace with these two:

   ```
   | `prompts/goldfish-section.md` | could you implement this section without asking anything? |
   | `prompts/goldfish-document.md` | can the document as a whole be built, and does it agree with itself? |
   ```

   The three rows below it are unchanged.

8. In `ROADMAP.md`, this line currently reads:

   ```
   2. **The whole-document goldfish on `CORRIDORS.md`** — using `prompts/goldfish-spec.md`. §1–§14 were
   ```

   Change `prompts/goldfish-spec.md` to `prompts/goldfish-document.md`. That parked review is a
   whole-document review, and after this slice the document prompt is what runs it.

9. In `test/prompts.js`, this block currently reads:

   ```js
   /* Everywhere a prompt may legitimately be named. A new home for prompts goes here. */
   const REFERRERS = [
     '.claude/skills/goldfish/SKILL.md',
     'METHOD.md',
     'AGENTS.md',
   ];
   ```

   Replace with:

   ```js
   /* Everywhere a prompt may legitimately be named. A new home for prompts goes here.
    *
    * ROADMAP.md WAS MISSING AND IT MATTERED. It names prompts — the parked reviews cite the instrument
    * each will use — and while it was absent from this list a rename could break a reference there with
    * nothing detecting it. METHOD.md names no prompt today and stays anyway: the check tolerates a
    * referrer that refers to nothing, and dropping it would leave a future reference unguarded. */
   const REFERRERS = [
     '.claude/skills/goldfish/SKILL.md',
     'METHOD.md',
     'AGENTS.md',
     'ROADMAP.md',
   ];
   ```

**Verification:**

```bash
node test/prompts.js && node test/skills.js && node test/markers.js && node test/dedupe.js && node test/lineendings.js
```

`PROMPTS` must report **5 prompt file(s), 4 referrer(s) checked** and `✅ every prompt reachable, none
phantom` — the three failures recorded in step 3 are gone and no new one has replaced them.
`LINE ENDINGS` must report **56** file(s): Task 0's 55 plus one new file, the rename having moved no
count.

Then a script asserts:

- `prompts/goldfish-section.md` exists, `prompts/goldfish-spec.md` does not
- `goldfish-section.md` contains `do not read the rest of the document` exactly once and
  `Could you implement this section` exactly once, and is exactly **1** line longer than the record
  file's reading for `goldfish-spec.md`
- `goldfish-spec` appears **zero** times across the repository **excluding `.git` and excluding
  `plans/`**. The exclusion is not a fudge — this plan quotes the old name while instructing the
  rename, and Task 13 repeats the assertion without it once the plan is deleted.

---

## Task 3 — Bring `goldfish-plan.md` and `goldfish-seam.md` up to the shared shape

> **This is the decision nobody asked for.** Reverse it by striking this task and the two `SHARED`
> entries it feeds in Task 5. Measured: the understood-section, the long report-order form and the full
> no-fixes closing are present in `goldfish-section.md` and `goldfish-method.md` and absent from these
> two. Nobody chose that split — it is drift, and this slice exists partly to stop it recurring.
>
> **This task runs before Task 4** so that all five files have one shape before the two new parts go in.

**Files:** `prompts/goldfish-plan.md`, `prompts/goldfish-seam.md` — modify.

**Steps:**

1. **The report-order instruction.** In both files it currently reads:

   ```
   Report in this order. If a category is empty, write "none".
   ```

   Replace both with the long form the other three carry:

   ```
   Report in this order. If a category is empty, write "none" — do not pad it.
   ```

2. **A final category, and the sentence marking it not optional.** Append to `goldfish-plan.md` after
   its category 7:

   ```
   8. **WHAT YOU UNDERSTOOD THIS PLAN TO BUILD** — three to six sentences, in your own words: what this
      plan produces, and what it changes about the system it is run against.

   **Section 8 is not optional and is not a summary of your findings.** A reviewer who could start every
   task and understood a different piece of work from the one the plan describes is the worst outcome
   available here, and it is invisible unless you write down what you understood.
   ```

   and to `goldfish-seam.md` after its category 6:

   ```
   7. **WHAT YOU UNDERSTOOD EACH DOCUMENT TO OWN** — three to six sentences, in your own words: what
      each of the two is for, and where you understood the boundary between them to fall.

   **Section 7 is not optional and is not a summary of your findings.** A reviewer who found no
   disagreements and understood the boundary to be somewhere the author does not is the worst outcome
   available here, and it is invisible unless you write down what you understood.
   ```

   **These numbers are correct at the end of this task and wrong at the end of Task 4**, which inserts a
   category ahead of each. Task 4 renumbers them, and its verification is what pins that it did. The end
   state for all five files is in the table above.

3. **The closing paragraph.** `goldfish-plan.md` currently ends:

   ```
   Do not attempt any of the work. Do not propose a better plan. Report only what you could not do and why.
   ```

   Keep the first two sentences — they are prompt-specific — drop the third, which the shared paragraph
   says better, and append the shared closing. The result, exactly:

   ```
   Do not attempt any of the work. Do not propose a better plan.

   **Report findings; do not propose fixes, and do not edit anything.** Deciding what to change needs
   context you were deliberately not given, and a fix proposed from here invites somebody to apply it
   without thinking. Say what you could not do and why, and stop there.
   ```

   `goldfish-seam.md` currently ends:

   ```
   For each finding give: the two locations, what each says, and why they cannot both be true. Do not
   propose a fix.
   ```

   Keep the first sentence, drop `Do not propose a fix.`, and append the same shared closing. Because
   step 2 has already appended a category after this paragraph, **move the closing paragraph to the end
   of the file** in both prompts — it is the last thing every other prompt says.

**Verification:**

```bash
node test/prompts.js && node test/markers.js && node test/lineendings.js
```

Then a script asserts across **all five** prompt files, after collapsing whitespace runs to single
spaces: each contains `Report in this order. If a category is empty, write "none" — do not pad it.`
exactly once; each contains `is not optional and is not a summary of your findings.` exactly once; each
contains `**Report findings; do not propose fixes, and do not edit anything.**` exactly once. All three
counts were **two of five** before this task, which the record file holds.

---

## Task 4 — Forced quotation and the concern outlet, in all five

**Files:** all five files in `prompts/` — modify.

**Steps:**

1. Into each of the five, immediately **before** the report-order instruction, insert this paragraph
   exactly. One wording used five times is the intended shape: a reviewer is handed one file and reads
   it whole, so a shared instruction is one instruction delivered five times, not one rule with five
   homes.

   ```
   **Every finding quotes the text it is about.** Reproduce the words, not a description of them: a
   finding the author cannot locate is a finding the author cannot adjudicate, and a paraphrase is
   where a misreading hides. If you cannot quote it, it belongs in CONCERNS YOU COULD NOT GROUND.
   ```

   **It names the category, not a position.** An earlier draft said *"the last category"* and then placed
   the outlet second-to-last, which was a contradiction inside one task. `goldfish-document.md` already
   carries this exact wording from Task 2 — **assert the count is one there; do not insert a second
   copy.**

2. Into each of the five, insert the concern outlet immediately **before** the final
   *what you understood* category, taking the number the table above gives for that file:

   ```
   N. **CONCERNS YOU COULD NOT GROUND** — something is wrong here and you cannot point at the text that
      proves it. Say what worries you, and say plainly that you could not ground it. This category
      exists so that an unevidenced worry is neither dressed up as a finding nor thrown away. Both are
      worse than an honest entry here.
   ```

   `goldfish-document.md` already has it at 7 from Task 2 — **assert, do not insert.**

3. **Renumber the understood-section, and its sentence, in the four files that gain a category.** Both
   the category number and the `Section N` reference in the sentence beneath it must move together;
   changing one and not the other is the failure this step exists to prevent, and Task 5's shape pattern
   matches any `Section \d+` and will not catch it.

   | File | Understood-section moves | Its sentence must read |
   |---|---|---|
   | `goldfish-section.md` | 7 → 8 | `**Section 8 is the most important and is not optional.**` |
   | `goldfish-method.md` | 8 → 9 | `**Section 9 is not optional and is not a summary of your findings.**` |
   | `goldfish-plan.md` | 8 → 9 | `**Section 9 is not optional and is not a summary of your findings.**` |
   | `goldfish-seam.md` | 7 → 8 | `**Section 8 is not optional and is not a summary of your findings.**` |
   | `goldfish-document.md` | unchanged at 8 | unchanged |

4. **The two additions are one mechanism and neither works alone.** `SOURCES.md`'s entry *A reviewer
   argues, and grounds what it claims* holds the measurement: a critic told simply to be adversarial
   scored worse than the baseline, while the same critic forced into three verdicts — agree, disagree
   with cited evidence, or raise an objection it could not ground — was the best of everything tested.
   Forced quotation without the third bucket suppresses real concerns. No new `SOURCES.md` entry is
   needed; that one covers it.

**Verification:**

```bash
node test/prompts.js && node test/markers.js && node test/lineendings.js
```

Then a script asserts, over all five files with whitespace runs collapsed:

- `**Every finding quotes the text it is about.**` exactly once in each — **five and five**, not four
- `**CONCERNS YOU COULD NOT GROUND**` exactly once in each
- the offset of `CONCERNS YOU COULD NOT GROUND` is **less than** the offset of the `is not optional`
  sentence in every file, which is what pins the ordering
- **the number in each file's `Section N` sentence equals the number on its final category heading.**
  This is the assertion that catches step 3 being half-done, and it is checked per file against the
  table above, not as a pattern.

---

## Task 5 — The check that holds the shared text

**Files:** `test/prompts.js` — modify.

**Interfaces:**

- `run(root = ROOT)` replaces `run()`. Every use of the module-level `ROOT` inside the function body
  becomes `root`. The `const ROOT = path.join(__dirname, '..')` declaration stays: it is the default,
  and every check in this repository opens with it.
- The returned object gains one field: `{ files, sources, problems, shapeChecked }`, where
  `shapeChecked` is the number of prompt files the shape assertions ran against. `main()` prints it on
  the summary line. Nothing in the repository consumes `run()` today, so no other file changes.
- One new helper, used on both sides of every comparison:

  ```js
  /* Line wrapping and bolding are formatting, not content. Without this, a correct prompt fails
   * because its shared paragraph happens to wrap at a different column. */
  const flat = s => s.replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();
  ```

**Steps:**

1. Thread `root` through `run` as above.

2. Add `SHARED` — the passages every prompt must contain **verbatim after `flat()`**. Exactly four, and
   the comment above the array says plainly that **this is the canonical copy**: edit it here, run the
   check, and it names which prompt has drifted.

   ```js
   const SHARED = [
     { name: 'report order',
       text: 'Report in this order. If a category is empty, write "none" — do not pad it.' },
     { name: 'do not be helpful',
       text: 'DO NOT BE HELPFUL.' },
     { name: 'forced quotation',
       text: 'Every finding quotes the text it is about. Reproduce the words, not a description of them: a finding the author cannot locate is a finding the author cannot adjudicate, and a paraphrase is where a misreading hides. If you cannot quote it, it belongs in CONCERNS YOU COULD NOT GROUND.' },
     { name: 'no-fixes closing',
       text: 'Report findings; do not propose fixes, and do not edit anything. Deciding what to change needs context you were deliberately not given, and a fix proposed from here invites somebody to apply it without thinking. Say what you could not do and why, and stop there.' },
   ];
   ```

   **Each entry is already stripped of `**`**, because it is compared against `flat(fileText)`.

3. Add `SHAPE` — the parts each prompt phrases for its own review, so no exact string exists. Matched
   against `flat(fileText)` except where `raw` says otherwise.

   ```js
   const SHAPE = [
     { name: 'isolation: codebase',   pattern: /do not read the codebase/i },
     { name: 'isolation: web',        pattern: /do not search the web/i },
     { name: 'the single question',   pattern: /^> .*\?$/m,  raw: true },
     { name: 'concern outlet',        pattern: /\d+\.\s*CONCERNS YOU COULD NOT GROUND/ },
     { name: 'not-optional sentence', pattern: /Section \d+ is [^.]*is not optional/ },
   ];

   /* Counted, not matched: a prompt with fewer than five categories is not a calibrated instrument. */
   const CATEGORY = /^\d+\. \*\*[A-Z]/gm;
   const MIN_CATEGORIES = 5;
   ```

4. **Report each miss as its own problem**, naming the prompt and the part. A check that says
   *3 problems* without saying which three costs the reader exactly the time it was meant to save.

5. Extend the file's header comment with a third failure mode beside the two already there. Those two
   are written as an indented two-column list under a `Two failure modes` sentence; **read the existing
   two and match their column alignment** rather than guessing it. The wording to add:

   ```
   DRIFTED PROMPT   — a prompt missing a part its siblings have. It reads perfectly on its own and
                      quietly runs a weaker review than the others, and nothing else can see it.
   ```

   The sentence above them says *"Two failure modes, and this catches both"* — it becomes three.

**Verification:**

```bash
node test/prompts.js
```

Must report **5 prompt file(s), 4 referrer(s) checked, 5 shape-checked** and pass. Task 6 proves it can
fail.

---

## Task 6 — The inputs `test/prompts.js` must fail on

**Files:** none in the repository. Fixtures live in `<scratchpad>/fixtures/` and are deleted here.

**Steps:**

1. Build a fixture tree mirroring the repository's own layout, since that is what `run(root)` walks:
   `<fixture>/prompts/` holding copies of all five prompts, and copies of the four referrer files at
   their real relative paths — including `<fixture>/.claude/skills/goldfish/SKILL.md`, which needs the
   nested dot-directory. The referrer copies exist only so the reachability half stays green and the
   shape half is the only thing that can fire.
2. Delete the forced-quotation paragraph from the copy of `goldfish-section.md`. Call
   `require('<repo>/test/prompts.js').run(fixtureRoot)` and confirm `problems` has exactly one entry,
   naming that file and `forced quotation`.
3. Restore it; delete the `CONCERNS YOU COULD NOT GROUND` category instead; confirm one problem naming
   `concern outlet`.
4. Restore it; re-wrap the no-fixes closing in the copy of `goldfish-plan.md` so it breaks lines at
   different columns without changing a word. Confirm **zero** problems. This is the case that proves
   `flat()` works, and it is the one a check like this usually gets wrong.
5. Confirm the real repository root returns zero problems, so the fixture proves the check discriminates
   rather than that it always fires.
6. Delete the fixture tree.

**Verification:** the script prints `expected 1, got 1` twice, then `expected 0, got 0` twice, and exits
non-zero if any differs. **It is run and watched.** A check nobody has seen fail may be asserting
nothing whatever.

---

## Task 7 — Write `REVIEWS.md`, wire it into `dedupe`, and take review state off `AGENTS.md`

> **One task, because the measurement is the gate.** An earlier version drafted the file in a scratch
> directory, measured it with a copy of `test/dedupe.js`'s comparison, then wrote the original text —
> discarding whatever the measurement had cleared. Here the file is written, added to the real check's
> document list, and the real check is run. The settled rule is still obeyed: **only the new file is
> ever reworded.**

**Files:** `REVIEWS.md` — create. `test/dedupe.js`, `AGENTS.md`, `ROADMAP.md` — modify.

**Steps:**

1. Create `REVIEWS.md` with exactly this content:

```markdown
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
- **The rename and the referrer updates are two halves of one change listed apart** — raised as a second
  finding alongside one saying the new prompt is named before it exists. Rejected as the same defect
  counted twice; merging the tasks answers both.
- **The draft is built from descriptions rather than text.** Rejected as a consequence of two other
  findings rather than a defect of its own; fixing those removes it.
- **`test/xref.js` would catch the inventory naming a check that does not yet exist.** Rejected on
  measurement: that check resolves section references and never file paths, so it would not fire.
- **Five findings reporting the code-writing tasks as unstartable**, each because the reviewer would
  have had to open a file it was forbidden to open. Rejected as findings against the plan, and recorded
  against the backlog instead: a plan review is handed the plan and the map it names, this repository
  has no map, and so a plan touching code must always report those tasks unstartable.
```

2. **`METHOD.md`'s dependency is `none`, not `SOURCES.md`.** `SOURCES.md` opens *"This document explains;
   it does not instruct. `METHOD.md` holds the rules and wins wherever the two disagree."* The dependency
   runs the other way, and `AGENTS.md` and `SOURCES.md` therefore both declare `METHOD.md`. **The
   consequence is intended:** neither can be marked `reviewed` until `METHOD.md` is, which is the
   method's rule working rather than a deadlock.

3. In `test/dedupe.js`, add to `DOCS`, after the `'SOURCES.md',` line:

   ```js
     'REVIEWS.md',   // the review record: what has been reviewed, and what was rejected
   ```

4. **Run `node test/dedupe.js`.** It must report **11 documents compared pairwise**. On any collision,
   reword `REVIEWS.md` — never `METHOD.md`, `AGENTS.md`, `SOURCES.md`, a skill, or the allow list — and
   re-run until `✅ nothing said twice`. This is the real gate, not a copy of it.

5. In `AGENTS.md`, this paragraph currently reads, in full:

   ```
   **What it carries, for each thing it lists:** the file, and one line on what it owns; which of the four
   layers or which of the four kinds of work-document it belongs to; what state it is in — current, live
   but scheduled, or superseded, reviewed or not, built or not yet; the command that proves it works, and
   what its output says when it has; and, where two of a kind both apply, which one wins.
   ```

   Replace with exactly:

   ```
   **What it carries, for each thing it lists:** the file, and one line on what it owns; which of the four
   layers or which of the four kinds of work-document it belongs to; what state it is in — current, live
   but scheduled, or superseded, built or not yet; the command that proves it works, and what its output
   says when it has; and, where two of a kind both apply, which one wins. **Whether a thing has been
   reviewed is not here**; `REVIEWS.md` holds that, so it can be checked rather than merely written down.
   ```

6. These two rows currently read:

   ```
   | `CORRIDORS.md` | the corridor model, the figure definition language, the path engine, verification | §1–§14 written; §15–§16 outstanding. Reviewed section by section, but **never reviewed as a whole document**, and its normative dependency below is unreviewed |
   | `FORMATIONS.md` | how a formation is structured and addressed; the authoring language | drafted, **unreviewed**. §2.5 and §3.3 are the most load-bearing and the most recently changed |
   ```

   Replace with exactly:

   ```
   | `CORRIDORS.md` | the corridor model, the figure definition language, the path engine, verification | §1–§14 written; §15–§16 outstanding. Review state in `REVIEWS.md` |
   | `FORMATIONS.md` | how a formation is structured and addressed; the authoring language | drafted. §2.5 and §3.3 are the most load-bearing and the most recently changed. Review state in `REVIEWS.md` |
   ```

7. Add a row to the *About the work* table, immediately after the `SOURCES.md` row, which currently
   reads:

   ```
   | `SOURCES.md` | the evidence behind each of the method's rules, and where the method knowingly goes against a source it cites | in progress. **Nothing loads it and no workflow points at it**; its audience is whoever is reconsidering the process |
   ```

   The row to add:

   ```
   | `REVIEWS.md` | which reviews have run against each document and each plan, and which findings were rejected and why | current, and the only place review state lives. `test/reviews.js` checks it |
   ```

8. **Move** this entry out of `ROADMAP.md`'s settled list. It currently reads, in full:

   ```
     - **No check guards a single term against being reused.** Proposed after `GATE` was found meaning two
       things at once — the method's plan review, and `CORRIDORS.md`'s second drawing gate — and declined:
       the same collision could happen to any term this repository defines, so a check watching one of them
       is machinery for the instance rather than the class. Recurrence is the argument for revisiting; one
       occurrence is not.
   ```

   Replace those five lines with exactly:

   ```
     - **A rejected review finding is recorded in `REVIEWS.md`, not here.** The one this list used to
       carry — that no check should guard a single term against reuse — moved there when that file was
       written, keeping its wording exactly.
   ```

   **Its wording in `REVIEWS.md` is byte-identical to the five lines above**, less their indentation.
   A move that rewrites is not a move, and nothing would detect it. *(Reverse: **restore**.)*

9. Re-run `node test/dedupe.js` after steps 5 to 8. Steps 5 and 7 add prose to `AGENTS.md` and can
   collide where step 1 could not; clear any collision in `REVIEWS.md`, which is still the newer file.

**Verification:**

```bash
node test/dedupe.js && node test/markers.js && node test/lineendings.js && node test/xref.js
```

`DEDUPE` must report **11 documents compared pairwise** and `✅ nothing said twice`. The count is the
assertion; `✅` alone would print equally if step 3 had not landed. `LINE ENDINGS` must report **57**
file(s) — Task 2's 56 plus this one.

Then a script asserts:

- `REVIEWS.md` contains six `###` headings, one `## Documents`, one `## Plans`, and a
  `**Normative dependencies:**` line for every `###` heading
- `AGENTS.md` contains `reviewed or not` **zero** times and `REVIEWS.md` exactly **four** times — the
  carries-paragraph, the two Layer 1 rows, and the new row
- `ROADMAP.md` contains `No check guards a single term` **zero** times and
  `A rejected review finding is recorded` exactly once
- the moved finding's five lines appear in `REVIEWS.md`, whitespace-collapsed, exactly as they appeared
  in `ROADMAP.md` before the move — which the record file must hold from Task 0, so **read them into the
  record file before step 8 runs**

---

## Task 8 — `test/reviews.js`

**Files:** `test/reviews.js` — create.

**Interfaces:** `run(root = ROOT)` returning `{ problems, documents, plans, rejections }`, matching the
shape every other check returns. `module.exports = { run }`. Opens with
`const ROOT = path.join(__dirname, '..')`. `main()` runs under `if (require.main === module)`, prints
each problem prefixed `  ❌ `, then a summary line, then a `✅` or `❌` line, and exits `1` on any
problem and `0` otherwise — **read `test/sources.js` and match its `main()` exactly**, since it is the
most recently written check and is the convention.

**Steps:**

Write the check. Over `REVIEWS.md`, it asserts:

1. **Every `###` heading names a file that exists** at that path. `##` headings are groupings and are
   ignored — `## Documents` and `## Plans` are not paths.
2. **Every prompt named in a table cell exists** in `prompts/`.
3. **Every `State` cell holds one of the five declared values**, or a section range.
4. **Every block carries a `**Normative dependencies:**` line**, `none` included.
5. **A block marked `reviewed` has no normative dependency whose own block is not `reviewed`.** This is
   the method's rule made executable. Quote the rule in the file's header comment by its words — *"A
   document is not reviewed while a normative dependency is unreviewed"* — and never by a section
   number, which is the same rule `test/plan-citations.js` states about citations.
6. **Every rejected finding has a reason on the same entry.** A bare rejection fails, for the reason
   `test/plan-citations.js` gives about `Spec: none`: *"there is no reason"* and *"I did not write one"*
   are different states and must not look alike.
7. **Every `.md` file in `plans/` has a block under `## Plans` whose `plan` row is not `not run`.** A
   plan that has not been reviewed must not be executed, and until now nothing could tell the two apart.
   **The assertion is one-directional**: a block whose plan file is gone is *not* a failure — a plan is
   deleted when spent and its state becomes `spent`, while the record of its review is the thing this
   file exists to keep.
8. If `plans/` is empty the assertion in 7 is vacuously true, so `main()` prints the plan count on its
   summary line. A comparison against nothing must be visible as a comparison against nothing.

**Verification:**

```bash
node test/reviews.js
```

Must print a summary line carrying the document count, the plan count and the rejection count, then `✅`.
Task 9 proves it can fail.

---

## Task 9 — The inputs `test/reviews.js` must fail on

**Files:** none in the repository. Fixtures live in `<scratchpad>/fixtures/` and are deleted here.

**A minimally valid fixture root** is: a `REVIEWS.md`; the document files its `###` headings name, which
may be empty files since nothing reads their contents; a `prompts/` directory holding empty files with
the names its table cells use; and a `plans/` directory, empty unless the case needs one. Build that
once, confirm it returns **0** problems, and derive each case below by breaking exactly one thing.
Every case that expects 1 must be one edit away from the clean fixture, or the count means nothing.

**Steps:** build each case, run `run(fixtureRoot)`, and **watch it fail**.

1. A document marked `reviewed` whose declared dependency's block says `not run` → expect exactly 1.
2. A rejected finding with no reason after it → expect exactly 1.
3. A `plans/` holding a plan file with no block under `## Plans` → expect exactly 1.
4. A `###` heading naming a file that does not exist. **Use a document no other block declares as a
   dependency**, or assertion 5 fires as well and the count becomes 2 → expect exactly 1.
5. A block with no `**Normative dependencies:**` line at all → expect exactly 1.
6. A `## Plans` block whose plan file has been deleted, everything else valid → expect **0**. This is
   the one-directional case from Task 8 step 7, and it is the assertion most likely to be written
   backwards.
7. The real repository root → expect 0.

Then delete the fixtures.

**Verification:** the script prints `expected 1, got 1` five times and `expected 0, got 0` three times —
the clean fixture, case 6, and the real root — and exits non-zero if any differs.

---

## Task 10 — Wire the eleventh check

**Files:** `.claude/hooks/pre-commit-gate.js`, `AGENTS.md` — modify.

**Steps:**

1. In `pre-commit-gate.js`, add `'test/reviews.js',` to the list that currently ends `'test/sources.js',`.
   That file's own comment records the count is *"counted from the list, never written out"*, because a
   hard-coded number once survived a check being added. Nothing else in it changes.

2. **`post-doc-edit.js` is not touched.** It names its five checks individually — `xref`, `prompts`,
   `dedupe`, `markers`, `lineendings` — and `test/reviews.js` does not join them. This is not a
   judgement call: every single-purpose check here already sits on the commit gate alone, `skills`,
   `hooks`, `plan-citations` and `sources` all being absent from the fast five. Those five guard against
   damage any markdown edit can do; `test/reviews.js` guards one file. Adding it would also invalidate
   the measured 220ms that hook's comment quotes. *(Reverse: **promote**.)*

3. In `AGENTS.md`, add a row to the Layer 4 table, immediately after the `test/sources.js` row:

   ```
   | `test/reviews.js` | every review recorded in `REVIEWS.md` resolves — the documents, the prompts, the states — and no plan is unreviewed |
   ```

4. Append ` && node test/reviews.js` to the command block in `AGENTS.md`.

5. Change the **two** word-boundary occurrences of `ten` to `eleven`. **Take their line numbers now**,
   not from Task 0 — Task 7 edited `AGENTS.md` and moved them. The count must be 2; if a script finds a
   third, stop and say so rather than adjusting the number to fit.

6. **Do not touch `five`.** It occurs 6 times on word boundaries in `AGENTS.md` and only two of those
   concern the fast audits, which this task does not change. The others mean a run length, a document
   count and a historical reading. Assert the count is still 6 afterwards.

**Verification:**

```bash
echo '{"tool_name":"Bash","tool_input":{"command":"git commit -m x"}}' | node .claude/hooks/pre-commit-gate.js
```

**Run the hook**, per convention 5: a hook is the one artefact whose failure looks exactly like a quiet
session. **Empty stdin is not a test** — measured, the hook exits silently on it and tells you nothing.
With the payload above it prints JSON whose `additionalContext` reads `All 10 audits green.` today and
must read **`All 11 audits green.`** afterwards, still naming `test/visual.js` as the one exemption. That
number is counted from the list rather than written out, so a wrong reading means step 1 did not land.

Then a script asserts on word boundaries: `AGENTS.md` matches `ten` **zero** times, `eleven` exactly
twice, and `five` exactly **6** times; and `test/reviews.js` appears exactly twice — the table row and
the command block.

---

## Task 11 — Close the routing hole between `plan` and `goldfish`

> **Why this task exists.** Found while writing this plan, and it is why this plan first reached the
> author with no review attached. Measured: `goldfish`'s description names `plan` and `execute`;
> `execute`'s names `plan` and `goldfish`; **`plan`'s names `slice` and `execute`, and does not contain
> the word `goldfish` anywhere in the file.** Slice 5 settled that each description names its adjacent
> skills so the one that should have fired is reachable from the one that did. The skill you are inside
> when a plan is finished is the only one of the three that does not name the review that comes next.

**Files:** `.claude/skills/plan/SKILL.md`, `ROADMAP.md` — modify.

**Steps:**

1. The skill file currently ends with this paragraph:

   ```
   Rot is not a consideration: a plan is executed once and deleted, so a quoted copy has no time to
   diverge. Noise is the only cost, and the first clause bounds it.
   ```

   Append after it:

   ```
   ## Then it goes to review

   A finished plan is not a started plan. It goes to a plan review first, run by the `goldfish` skill
   with `prompts/goldfish-plan.md`, and the findings come back to the author with the plan rather than
   after it. How a review is dispatched and what its findings then mean belong to `goldfish` and to
   `METHOD.md`; neither is repeated here.
   ```

   Keep it to that. This file's job is writing plans. `test/dedupe.js` compares it against both
   `goldfish/SKILL.md` and `METHOD.md`, so reword the new text if it collides — never theirs.

2. The description's adjacency sentence currently reads, in full:

   ```
   Cutting work into slices comes first and is the `slice` skill; carrying the plan out is the `execute` skill.
   ```

   Replace with:

   ```
   Cutting work into slices comes first and is the `slice` skill; the finished plan is reviewed by the `goldfish` skill before the `execute` skill carries it out.
   ```

3. **No trigger scenario is re-run, because there is nothing to run.** `ROADMAP.md`'s backlog says
   *"Whoever changes it should re-run the trigger scenario afterwards"*, and **measured, that test does
   not exist on disk**: nothing in `test/`, `.claude/` or anywhere else in the repository holds a skill
   selection scenario. Slice 5's measurement was an ad-hoc exercise in a session, with no artefact. Do
   not invent one here — a scenario written now measures this description against itself.

   The *Deferred* section currently ends with this paragraph, which is the anchor:

   ```
     A check can hold the rule afterwards, and that check will be the one file here containing the name it
     forbids — which is correct, since a check names things as they are spelled, and is worth knowing
     before somebody reports it as a defect.
   ```

   Append after it:

   ```
   - **The skill-selection measurement has no artefact, and two descriptions have now changed without
     it.** Slice 5 measured that all seven skills fired on their triggers, and on a case where none
     should; that exercise left nothing behind, so *"re-run the trigger scenario"* names a procedure
     nobody can perform. **Slice 6 changed the `plan` skill's description — adding the `goldfish` skill
     to its adjacency sentence — and that change went out unmeasured**, recorded here rather than
     blessed by a scenario invented to bless it. Building the scenarios — seven that must fire, and at
     least one that must not — is what would make the instruction real.
   ```

   **This goes in `ROADMAP.md` and not in the record file.** The record file expires with the slice, and
   an unmeasured change is exactly the kind of state that must outlive it.

**Verification:**

```bash
node test/skills.js && node test/dedupe.js && node test/markers.js && node test/lineendings.js && node test/xref.js
```

`SKILLS` must still report **7 skill(s), 2 referrer(s) checked**. Then a script asserts
`.claude/skills/plan/SKILL.md` contains `goldfish` **at least twice** — the description and the new
section — against the record file's baseline of **0**, and contains `prompts/goldfish-plan.md` exactly
once; and `ROADMAP.md` contains `that change went out unmeasured` exactly once.

**Do not add the skill file to `test/prompts.js`'s `REFERRERS`.** Task 2 fixed that list for the file
that needed it; a prompt named in one more place needs no new guard, and adding one would change the
referrer count every later verification quotes.

---

## Task 12 — Record what this slice settled

**Files:** `ROADMAP.md` — modify.

**Steps:**

1. The settled list under *The methodology's own remaining work* currently ends with this entry, which
   is the anchor:

   ```
     - **Slice 5's close-out could not update the map, because there is none.** Building one is on the
       backlog; this is recorded rather than skipped, because a process step that silently cannot be
       performed teaches everybody that close-out items are advisory.
   ```

   Append after it:

   ```
     - **A prompt is one self-contained file, and its shared text is duplicated into it on purpose.** A
       reviewer is handed one file and reads it whole, so text common to several prompts is one
       instruction delivered several times rather than one rule with several homes. `test/prompts.js`
       holds the canonical copy and names which prompt has drifted; it collapses whitespace and strips
       emphasis before comparing, because measured, the shared passages wrap and bold differently in
       every file and an exact comparison fails on formatting alone.
     - **Forced quotation and the concern outlet are one mechanism, and neither ships alone.** Requiring
       every finding to quote its text, with nowhere to put a worry that cannot be quoted, suppresses
       real concerns rather than grounding them.
     - **The section review and the document review have separate prompts.** They ask different
       questions, and running the implementability prompt over a whole document is the flat pass
       measured as the worst-performing option.
     - **Review state and rejected findings live in `REVIEWS.md`.** Not in the inventory, which cannot
       be checked, and not in a handoff, which expires.
   ```

2. Delete the backlog entry that currently reads, in full — five lines and the blank line after it:

   ```
   - **Find somewhere for the review-state record — whether a document is reviewed or not.** The method
     holds that a document is not reviewed while a normative dependency is unreviewed; cite that rule by its
     words, never by a number. Nothing records the status, so this inventory carries it as prose and it
     cannot be checked. Picking it up needs a durable place to write a status, which is the same want as the
     disposition record slice 6 delivers, and the two should be settled together.
   ```

   Delete it outright — the want is met. Say in the commit message that it went to `REVIEWS.md`, per the
   method's rule that a superseded thing is removed rather than annotated.

3. Leave the slice table's row 6 alone. It describes what was built and is still true.

**Verification:**

```bash
node test/markers.js && node test/xref.js && node test/lineendings.js && node test/dedupe.js
```

Then a script asserts `ROADMAP.md` contains `Find somewhere for the review-state record` **zero** times
and `A prompt is one self-contained file` exactly once, and that its line count is exactly **17** greater
than the record file's Task 0 reading plus whatever Tasks 2, 7 and 11 added — **so take a fresh
`wc -l` immediately before this task rather than deriving it**, and record both readings.

---

## Task 13 — Close down

**Files:** `plans/2026-08-30-the-prompts.md` — delete, once the author has seen the artefact.

**Steps:**

1. Run all **eleven** checks from the list at the top of this plan and paste the eleven summary lines.
2. **Put the artefact in front of the author** — the five prompt files and `REVIEWS.md` themselves, not
   an account of them. A prompt is judged by reading it.
3. There is **no Layer 2 map to update**. Say so rather than skipping the step: `ROADMAP.md` records
   that building one is backlog, and a close-out item that silently cannot be performed teaches
   everybody that close-out items are advisory. **Add to that backlog entry what this slice measured
   about its absence:** five findings in the plan's third review reported code-writing tasks as
   unstartable, purely because a plan reviewer is handed the plan and the map it names and there is no
   map. Until one exists, no plan touching code can pass a plan review cleanly.
4. In `REVIEWS.md`, change this plan's block's `plan` row from `reviewed` to `spent`. The block stays.
   *(Reverse: **prune**.)*
5. Ask whether to commit, and say what would be in it. Do not start one.
6. Delete this plan file, and the record file in the scratchpad. Both are spent.
7. Re-run the assertion Task 2 had to weaken: `goldfish-spec` now appears **zero** times across the
   repository excluding `.git`, with no exclusion for `plans/`, because the file that quoted it is gone.

**Verification:**

```bash
node test/plan-citations.js && node test/reviews.js
```

`PLAN CITATIONS` must report **0 plan(s), 0 task(s) examined** — the reading Task 0 took before this file
existed, which is what proves the deletion landed. `REVIEWS.md` must still pass with the block present
and the plan file gone, which is the one-directional case Task 9 step 6 proved.
