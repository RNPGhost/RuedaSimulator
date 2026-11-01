# Handoff — `ELEPHANT.md`: §9 is done as the evidence diff; next, §8

> **Do not delete this file when you start.** Everything under *Not yet durable* exists nowhere else.
> **Delete it, and `HANDOFF-reports/` with it, once each of those has a home** — at that point this
> file is spent.

## You already have the imperatives

A `SessionStart` hook injected the overriding rule and the eight imperatives. **It did not give you the
rest of `METHOD.md`** — open it now.

## Read these, in this order

1. **`METHOD.md`**, whole.
2. **`ROADMAP.md`**, *Slice 7.1 in detail*, including its section table, *What it produces* and *Staged,
   never written in place*. It wins wherever `ELEPHANT.md` disagrees with it, until sign-off.
3. **`ROADMAP.md`**, *Deferred*: the folder entry *"Separate the process documents from the content
   documents"*, and the new last entry, *Inputs to cutting `ELEPHANT.md`*.
4. **`process/designs/ELEPHANT.md`**, all of it. §1–§7 are written; §8, *what else was considered?*, is
   the next to write.
5. **`process/designs/SOURCES.elephant.md`**, the design's evidence, a diff of `SOURCES.md`; and
   **`SOURCES.md`** for its entry format.
6. **`REVIEWS.md`**, and **`.claude/skills/goldfish/SKILL.md`** for the order findings are presented in.
7. **`HANDOFF-reports/`** — every report in it is ruled. `I-sources-diff.md` is the diff's section
   review; `J-review-rerun-research.md` is the research behind the re-review rules; `scripts/` holds the
   generator for the diff's sources table and the script that applies the diff to a copy. Read them only
   when you need them.

## Where things stand

- **The design has eight sections, and seven are written.** The old §8 was removed and §9 became a
  diff of the evidence document, `process/designs/SOURCES.elephant.md`, so the old §10 is now §8, *what
  else was considered?*, not yet written. `ROADMAP.md`'s section table says why two questions have no
  section. No "(§9)" citation is left: each names `SOURCES.md` and its entry.
- **`SOURCES.elephant.md`** is `draft`, written against `a93fac3`: 23 added entries, *The three
  dispositions* removed for *The three outcomes*, the departures section held whole with five
  departures, and the sources table held whole at 75 rows with a *Used by* back-index. **The table is
  generated:** after any change to an entry, run `HANDOFF-reports/scripts/sources-table.js <root>
  --write`, then `apply-sources-diff.js <root> <scratch dir>`, which applies the diff to a copy and runs
  `test/sources.js` on it; run `test/dedupe.js` on that copy too. Its intro keeps the stale *"Forty-one"*
  word for word, as the backlog entry on that count says.
- **Its section review ran once and every finding is ruled and applied** (report I). The re-review
  rules were then researched and redrafted in `ELEPHANT.md` §3 and §5, and approved as written. What
  each session ruled is under *Not yet durable*.
- **Uncommitted:** everything since `a93fac3` — this session's edits to `ELEPHANT.md`, `ROADMAP.md`
  and this file, and the new `SOURCES.elephant.md`, `HANDOFF-reports/I-sources-diff.md`,
  `J-review-rerun-research.md` and `scripts/`. `test/visual.js` cannot run here.

## What to do

**The author wants `ELEPHANT.md` finished with as few questions as possible**, and improved later
through a later elephant rather than now. Three instructions follow from that, and hold to sign-off.

**Recommended unit of work: §8, *what else was considered?*** Write it from the record, with no
interview: the ruling waiting for it below; the alternatives `ROADMAP.md`'s slice 7.1 entry records as
rejected, such as *A premortem before the document review*; the rejected sources, Klein's premortem and
InvThink; and every ruling under *Not yet durable* that turned an option down. Put the gathered list to
the author once, as one list they answer in one message, before writing. Do not apply anything unasked. After a ruling, apply by assertion-checked script, carry each
change to every passage that depends on it, record the rulings here, and run the eleven checks. If §8
cites evidence, the entry goes in `SOURCES.elephant.md` and the table is regenerated.

**How findings are put now** is `ELEPHANT.md` §5's sorting paragraph: a finding is put in full only if
the author would reasonably care — it changes the design's substance, bears on a decision already
taken, or changes what the author or a user sees and does. Anything else is one line in a list the
author answers in one message, and a builder's choice is one line recommended as immaterial. Below the
bar is still shown, never dropped. **Whether another review runs** is §5's *Another review is
recommended for a reason, never run to find more*: recommend one only for a finding that would have been
put in full, or a fix that changed a rule's meaning or rewrote a section; the author decides.

The cut after §8: the document review of `ELEPHANT.md` and `SOURCES.elephant.md`; then close-out,
raising open question 2, and sign-off. `HANDOFF-reports/` is spent once this file is.

**In the document review, put a finding in full only if it would block building the design or
contradicts a decision the author has made.** Everything else goes in the one-line list the author
answers with "accept", or, where it is an improvement rather than a defect, to the backlog as later
work. **Recommend no second round unless something material comes back.**

---

## Not yet durable — this is why the file survives

### The author's rulings in round H — home: `ELEPHANT.md` or `ROADMAP.md`, applied; recorded here until reviewed

- **Q1** — this design is cut and built once with the skills as they stand at sign-off, then cut and
  built again from the same design once its slices have improved the skills. Home: the backlog entry.
- **Q2** — a design states what must be true, never what has to change. §8 goes; every *"§8 lists"*
  passage was restated.
- **Q3** — two skills, `elephant` and `close-out`; the seam review after a direct edit to a process
  document is a row of `METHOD.md`'s table of when each review fires, run by `goldfish`.
- **Q4 (partial)** — where `ELEPHANT.md` cites evidence, the citation names `SOURCES.md` by the rule's
  name, never a diff file. Still open: open question 4 below.
- **Q5** — the overriding rule reads *"for the **author** to rule on"*. Measured: the injected text
  becomes 1,674 characters, against a 1,900 limit.
- **A** — leave §8's number empty; close the numbers up once, when §9's form is settled.
- **B** — the notes for the cut, and Q1, live in the backlog entry *Inputs to cutting `ELEPHANT.md`*.
- **C** — the exact wordings destined for `METHOD.md` stay in the design, introduced as what
  `METHOD.md` says.
- **D** — `PILOT.md` describes the elephant from the author's side (§3).
- **E** — one check, one table, accounting for every Markdown file, which also catches a hand-kept
  list naming a missing file or leaving out a covered one (§6, and `ROADMAP.md`'s bullet).
- **G** — an `active` document is cut again when the author asks (§6).

### Open questions — raise before they are needed

1. **Measure whether resuming a conversation keeps the same transcript file** — §5 relies on it. Needs
   the author to resume a conversation.
2. **What close-out means for `ELEPHANT.md` itself**, which was written by hand, with no ledger and no
   elephant directory: which items of §3 step 8 apply, what stands in for the ledger review, and how
   `ROADMAP.md`'s entry is confirmed to be in `ELEPHANT.md` before it is cut to a pointer (D10). Round H
   A-B1 was accepted as this question. Raise at close-out.
3. **Answered (§9's session):** the evidence is a diff, `SOURCES.elephant.md`, drafted in
   `process/designs/` and moved beside `SOURCES.md` at sign-off; it has no slices of its own and folds
   in at the design's last slice; a reasoned entry names the design's section and does not restate it.
   §9 is gone and §10 is now §8. The background, kept for the document review: the author has ruled that citations name `SOURCES.md`. It was open whether the
   evidence waits in a diff beside `SOURCES.md` until the rules are built, as round G's q1 and §6 say,
   or goes into `SOURCES.md` directly. Its background, from round H (F-C1, D-C2, A-B2, accepted as this
   question): `ROADMAP.md`'s table says §9 is a section in the evidence document's format, §6 says a
   process design's evidence is not a section of it, and the body cites §9 throughout. Under Q1, if the
   evidence is a diff, the new build skill checks it against `SOURCES.md` before the first slice, which
   needs the apply script. Also accepted as this question, from report A: **A2** — the opening block says
   the slices' plans *"add its evidence to `SOURCES.md`"* while §6 has the elephant write it as a diff;
   and a `SOURCES.md` diff has no list of slices of its own, so nothing says which slice folds it in.
   Also accepted as this question, from report D: **U4** — where a rule's evidence ends and the design's
   reasoning begins, since `SOURCES.md`'s kind *reasoned* makes an argument evidence while §6 has the
   design carry its own reasoning; and **G1**, a duplicate of report A's A2. Raise before §9.
4. **Answered:** the planned section review of every passage changed in rounds G and H is cancelled.
   Those passages, and every edit since, are first read at the document review.

### §9's session — rulings, all applied by one script of thirteen edits

- **S1** — the sort runs inside an elephant or not, and its test is the author's aim: bring a finding
  in full only if the author would reasonably care — the design's substance, a decision already
  taken, or what the author or a user sees and does. Plumbing beneath the surface is one line.
- **S2** — a builder's-choice finding is recommended *immaterial*. **S3** — §3's bullet reworded.
  **S4** — immaterial: a list answer is a ruling on each item.
- **Q3a, Q3b, Q3c** — as open question 3 now records.
- **S1's follow-up** — a finding below the bar is still shown, as one line in the list; it is never
  dropped unshown. No edit: §5 already says so.

### §9's work — written, reviewed once, every finding ruled and applied

- **`process/designs/SOURCES.elephant.md` is written**, `draft`, against `a93fac3`: 21 added entries,
  *The three dispositions* removed for *The three outcomes*, the departures section held whole with two
  added, and the sources table held whole — 70 rows and a *Used by* back-index, generated by a script
  (scratch `sources-table.js`; regenerate it after any entry changes). Applied to a copy, it passes
  `test/sources.js` (59 entries: 32 published, 13 measured here, 14 reasoned) and `test/dedupe.js`.
- **13 of the 14 "(§9)" citations rewritten** to name `SOURCES.md` and the entry. The one left, §5's
  *"Separate runs rarely find the same faults (§9)"*, waits for the author: its source, Snyk VulnBench
  (arXiv 2606.15762), says the opposite — real findings recur in nearly every run.
- **Its section review ran once** (Opus tier, high): `HANDOFF-reports/I-sources-diff.md`.
- **Ruled and applied** (23 scripted edits, table regenerated; the applied copy passes `test/sources.js`,
  61 entries, and `test/dedupe.js`): finding 2 — keep the rule, the *Ask or Assume?* result stated as a
  **Note:** on the optional-elephant entry, its conserving-questions finding moved to the question
  entry; and every one-line item — B1 (two reasoned entries added: the interview's end, findings not
  kept past close-out), C3, C2 (the count left word for word, the backlog's numbers updated), A2, U3,
  U4 (Qodo's costs, Lu et al.'s finding, and §5's *"worth more than added strength"* trimmed), U1, U6,
  the dates, A5, A6, A7, A9, the Rensin caution, rows 59–60, Cross-Context dropped, Parnas, the layout,
  and `ROADMAP.md`'s close-out bullet. The rejects and immaterials were taken as recommended: A1, A3, A4,
  A8, A10, A11, U2, U5, U9, U10, the undefined terms, the unstated scales, and the ClaudeFlows concern
  (verified verbatim).
- **Finding 1, ruled and applied:** the rule now reads *"A review is not run twice over the same text to
  find more"*, its reason restated from Snyk VulnBench, and it says a review runs again whenever the
  author asks once the text has changed (§3). The entry is renamed to match, and its *Departs* names
  elephant-goldfish's three reviewers a round. Its origin, for the record: the 2026-10-18 model research
  (Q7, part 3, agreed as *"sounds good"*).
- **Re-reviewing, researched and drafted.** The author's gist: the agent judges whether findings are
  major — design decisions, conflicts, anything changing the document's purpose or outcome — and
  recommends no further review when none is. A deep dive (four researchers and a writer; report in the
  session scratch, `reports/Review rerun and stopping practice.md`, sent to the author) backed it:
  severity is the best-supported trigger, counts are poor, zero findings is unreachable, a decider ends
  every written process, and a re-review must reach what a change could break, not only the change.
  Drafted on the author's *"Draft all three"*, then approved as written (*"Yes, as written"*); no review
  has read them:
  1. §5's *"not run twice over the same text"* rule removed; in its place two paragraphs, *Another review
     is recommended for a reason, never run to find more* (both tests: a finding that would have been put
     in full, or a fix that changed a rule's meaning or rewrote a section) and *A review the agent
     recommends reaches what the change could have broken* (changed sections, the unchanged sections
     citing or restating what changed, the seams; an anchored dispatch).
  2. §3 *What goes back*: the re-review decision is made on the agent's recommendation, per §5.
  3. §5 *The section review*: `METHOD.md`'s *"and again once it settles"* replaced by *"and again when the
     agent recommends it and the author agrees"*, given as the table row.
  The evidence entry is renamed to match and gains Biffl 2001, CriticGPT, Fagan 1976, IEEE 1028 (as
  quoted), Yin 2011, the nine-round audit and ContraDoc; the table is now 75 rows.

### Text no review has read since it changed

- **§9's session, after its section review:** `SOURCES.elephant.md`'s 23 ruled edits and its renamed
  re-review entry; the 13 rewritten "(§9)" citations; §5's two re-review paragraphs, §5 *The section
  review*'s `METHOD.md` row, and §3 *What goes back*'s recommendation clause; §5's trimmed
  *"gaining most"* clause; `ROADMAP.md`'s close-out bullet and its backlog count.
- **§9's session's thirteen edits:** §5's sorting paragraph; §3's *"ruled on separately"* bullet; the
  opening block's evidence clause; §6 *What it produces* (the `SOURCES.md` diff's slices); §6 *Where
  reasoning lives* (the new paragraph on entries); the sort table's `SOURCES.md` row and the evidence
  paragraph after it; the two §10 citations, now §8; `ROADMAP.md`'s section table and its sentence, the
  `goldfish` bullet, and *How it is built*.

- **Round H, all of it.** The 31 edits applying the accepted findings, in: the opening block; §1 *What
  `METHOD.md` says of the elephant* (intro, the `METHOD.md` wording, item 3); §3's two-skills paragraph,
  the abandonment sentence, step 1's four options; §4 the recorded commit; §5 *How every review is
  run* (dispatch sentence, the Opus rule), *The document review and the seam review*, *What is kept of
  a review*; §6 *What it produces* (three places), the direct-edit review, the fenced-block sentence,
  *The status of a specification* (the list, the table check, the exemptions, the pre-elephant
  statuses), *A diff specification, from sign-off to fold-in* (the collision rework, amending, fold-in
  stops, the slice rule), *The review record* (the successor's block); §7 *From sign-off to deletion*
  (the `REVIEWS.md` bullet, the citation fold-in), *What `METHOD.md` says of a replaced document*;
  `ROADMAP.md`'s §8 row.
- **Round G text round H did not cover:** §5 *Reading a document as it will be*; §6 *The sort at
  close-out*; §7 *What replacing means*, *The retirement review*, *Naming the successor*, *What a later
  elephant reads*; §3 the abandonment paragraph's rest, step 1, step 5's end, *What goes back*; §4 the
  ledger's sixth kind and the successor's path; `ROADMAP.md`'s slice 7.1 bullets listed in
  `git show 7c839e1:HANDOFF.md`.
- **Report A's ten edits** (this session): the opening block (the slices' list; *"checked against this
  file"*); §1 *When it is used* (*"never mentions the elephant at all"*); §1 *What the repository calls
  it today* (the sentence after *"The name elephant is kept"*); §1 *What `METHOD.md` says of the
  elephant* (the definition's second paragraph from *"the agent says whether"*, and item 2's *"the
  conversation in which a design is settled"*); §2 *Where these end up*; §3's two-skills paragraph
  (`PILOT.md`'s list); §6 *What it produces* (the pointer replacing only the drafted text) and the sort
  table's matching row.
- **Report B's seven edits** (this session): §3's two-skills paragraph (abandoning during step 8;
  `PILOT.md` and the working files); *No ruling has a default* (other work in another conversation);
  the *"you decide"* paragraph (four kinds, the clean-up added); the abandonment paragraph (moving back,
  as last committed before the move); §5 *How every review is run* (which report items are findings);
  §7 *From sign-off to deletion*, the abandonment paragraph (*"as last committed before the move"*).
- **Report C's eight edits** (this session): §3 step 7 (*"changed or removed, every section of a
  document it replaces counting"*); §5 *How every review is run* (how a finding is put; Sonnet and Fable
  named); *The document review and the seam review* (the same widening); *What is kept of a review* (the
  exception covering immaterial findings); §6 *What it produces* (the `SOURCES.md` diff agreed at step 4
  and reviewed); *The review record* (the outside seam row, widened).
- **Report D's six edits to `ELEPHANT.md`** (a later session): §6 *What it produces* — the families
  table's lead-in (the two families named as `METHOD.md` names them), its last row (the scripts beside
  the checks), the plans' reach (*"but its Layer 1 ones"*), the sweep sentence, the review's own row and
  the row itself in a block quote; *Where reasoning lives* (*"an elephant on the process"*). And
  `ROADMAP.md`'s backlog entry *Nothing schedules `METHOD.md`'s full sweep*.
- **Report E's eleven edits to `ELEPHANT.md`** (a later session): §6 *The status of a specification* —
  where the status line is and where its value ends, `METHOD.md` stating the five statuses, drafts in
  the check's coverage, the fixed-text failure, the abandoned-diff exemption removed; *A diff
  specification* — the pointer's wrapped lines, the rework's `REVIEWS.md` line, the amendment made
  outside any elephant, the abandonment's `REVIEWS.md` line, the re-cut guard; §5 *Reading a document as
  it will be*, the *Citations* bullet's fold-in sentence. And `ROADMAP.md`'s *Inputs to cutting
  `ELEPHANT.md`*, its `METHOD.md` bullet.
- **Reports F and G's edits, and the sorting rule** (the same session): `ROADMAP.md`'s §1 row and
  *Inputs to cutting* (its opening, *How it is built*, the `goldfish` and memory-note bullets);
  `ELEPHANT.md` §6's third warning and the check's coverage list; §7 *From sign-off to deletion* (the
  pointer's place, the `Replaces:` path, the citation search and its wait, the re-pointing bullet) and
  the `METHOD.md` exception's wording; §5's sorting paragraph and §3's *"ruled on separately"*.
- **Two one-sentence deletions** never reviewed: §5 *The interview review* (*"§8 lists building it"*),
  §7 *The retirement review* (*"(§8)"*).

### Rulings waiting for the section that is their home

| Ruling | Home |
|---|---|
| *"Not for new documents only"* is a rejected alternative | §8 |

### Round H rulings on findings — accepted, all applied

Ids are the reports' own, in `HANDOFF-reports/` (A = opening, §1, §2; B = §3; C = §5; D = §6 *What it
produces*; E = §6 status and diffs; F = `ROADMAP.md`; G = §7).

A-C1, A-C2, A-C3, A-C4, A-C5, A-C6; B-B1, B-B2, B-C1, B-C2, B-C3; C-B1, C-B2, C-C1, C-C2, C-C3; D-B1,
D-B2, D-B3, D-C1, D-C3, D-C4, D-C5; E-B1, E-B3, E-C1, E-C2, E-C3, E-C4, E-C5; F-B1 (the root named file
by file), F-B2; G-B1, G-B2, G-C1. Accepted with their change made later: A-B1 (open question 2); F-C1,
D-C2, A-B2 (open question 3). C-B2 re-raised round D's A16, whose reason (*"§8's to specify"*) fell with
§8.

**Report A, ruled this session, applied:** A1, A3, A5, A6, A7, U1 (one rewrite of the `METHOD.md`
wording's second paragraph), A12, A13, U2, A15, G4. A2 accepted as open question 3. A12's reach: the
sort table's row for a process document drafted in a process design.

**Report B, ruled this session, applied:** A2 (its reach: §7's abandonment paragraph), A5, A8, A10, G2,
and G4's first half (the clean-up offer).

**Report C, ruled this session, applied:** A3, A7, A9 (its reach: §3 step 7 and *The review record*'s
outside seam row), A11's second half (immaterial findings), U1, U3.

**Report D, ruled in a later session, applied:** G2 (the extractor and the apply script sit with the
checks), A4, A6 (the row given in the design, as ruling C has it), U1, V2 (with the backlog entry
*Nothing schedules `METHOD.md`'s full sweep*), A13. U4 accepted as open question 3.

**Report E, ruled in a later session, applied:** A1 with A2, A3, A10, A11, A13, A15 (its reach: the
rework after a pre-start collision; round G DF G3's reason, *"the review record is §6's to clean up and
does"*, did not hold for abandonment or rework), A19 (its reach: `ROADMAP.md`'s list of places the
design reaches), V1, G4.

**Report F, ruled in a later session, applied:** A1 with U6 (the §1 row, also rejoined onto one line,
which had broken the table), A10, U5 (its reach: the *Finding triage* note named too), V3. **A9 ruled
the other way:** the second cut waits for the author to ask; the text is unchanged. **A8 not yet
ruled:** put again, then accepted: *"deleted once the second cut is made"* — a one-off for
`ELEPHANT.md`, which changes the skills that cut it, and not a rule for later designs.

**Report G, ruled in the same session, applied:** V1 with V2 ruled the author's way, kept simple — a
fold-in voids the sign-off of every other change pending against that target until it is reviewed
again against the changed document, a successor by its retirement review (§6's third warning); A1, A4
(the final name written as a path), A5 with A12 (mentions by name, every `.md` and `.js` file outside
`elephant/`), A6, A10 and U1 (both in the `METHOD.md` exception's wording), G1, G4. Rejected: A2, A3, A7,
G2 (builder's choice), A8, A9 (resolved by report B), A13 (report E's *"names aside"*), A11 (round G S7
A4), U2 (immaterial), V3 (§2), G3 (the author commits; the gate catches a red tree).

**Carried to further places, as the reach of an accepted finding:** G-C1 to §1 item 3 and §7's
*"already settled what is carried"*; E-C5 to §4's recorded commit (*"updated only when the diff is
reworked, or amended to settle a collision"*) and to D1's citations (*"its own citations of the
target brought to that commit's numbers"*); G-B1 to §6 *The review record* (a successor's own block);
E-B3 to the reworked diff being *"renamed after"* its new elephant.

### Rejected and immaterial findings — carried until close-out (§5's rule)

*Report I, the diff's section review* (§9's session) — **reject:** A3 (a reasoned entry may carry
adjacent sources, as `SOURCES.md` already does); the ClaudeFlows attribution concern (its page has the
quotation word for word). **Immaterial, the builder's choice:** A1, A4, A8, A10 (answered by U4's
costs), A11, U2, U5, U9, U10, the undefined terms, and the unstated scales of numbers taken from the
sources.

**Standing:** a forward reference to an unwritten section is not a defect; a claim resting on a document
the reviewer was denied is not unverifiable, but is checked against it; a session always resumes or hands
off; a dated measurement does not go false; the writing standard and judgement words are the author's to
judge; where the `METHOD.md` wording is placed is §8's; bare numbers in the question rules are chosen.

**Earlier rounds:** as listed in `git show e03e4af:HANDOFF.md` and the handoffs before it.

**Round D, in full** — every finding ruled rejected or immaterial, with its reason, as §5 requires.
Ids are the review reports' own, which do not survive; the quoted reason is what a re-raised finding is
matched against.

*§1* (20)

- **A1** — reject — Standing rejection 2, checked: `METHOD.md` line 33 bolds the whole of *"Two. Argue. Agreement is the defect."*, so the bold opening is unambiguous to anyone holding `METHOD.md`, and the clause goes after "Agreement is the defect."
- **A6** — immaterial — The bolded definition settles that the elephant is the work; the naming paragraph and the counterpart line are figurative, and nothing is built differently on either reading.
- **A7** — immaterial — §1 is a summary pointing at §3, whose step 5 fixes the order exactly (section brought with its review, findings ruled before the next), and the wording mirrors `METHOD.md`'s own "a review of each section as it settles".
- **A9** — reject — The table is stated to be "what the agent argues from, not a rule that fires by itself"; the author rules, so no criterion for choosing between rows is needed.
- **A10** — immaterial — §3 defines every step and its order, and nothing in the design turns on which of the two parts a given step belongs to.
- **"live document"** — reject — Already resolved: §1 now defines it as "one outside every elephant's directory whose status is not `draft` (§6)".
- **"Layer 1 document", "intent", "map update"** — reject — Standing rejection 2, checked: `METHOD.md` *The four layers* defines Layer 1 as intent and Layer 2 as the map.
- **"subject"** — reject — Standing rejection 2, checked: `METHOD.md` *Rules that follow from the layers* defines it ("a question somebody will one day ask"), and §3 restates it.
- **"slices"** — reject — Standing rejection 2, checked: `METHOD.md` and the `slice` skill define cutting settled design into slices.
- **"`METHOD.md`'s table of what a change owes"** — reject — Standing rejection 2, checked: the table exists under `METHOD.md` *What a change owes*.
- **"imperative Two", "its bold opening", "the session-start hook"** — reject — Standing rejection 2, checked: imperative Two is at `METHOD.md` line 33 with its bold opening, and the hook is `.claude/hooks/session-start.js`.
- **"the author"** — reject — `METHOD.md` (*A document names no person*) fixes "the author" as the project-wide term; it is not §1's to define.
- **"No check could have caught that"** — reject — This is the `bug` skill's own test applied to the case: no document defined the conversation, so no check could be written against one; it is reasoned, not a measurement.
- **"nothing downstream will catch"** — reject — The wording has since been narrowed to "an idea nobody challenged", and none of the interview-review findings §3 step 4 lists (an unasked question, an ambiguous answer, a contradiction, an unasked assumption, a leading question) is an idea the agent failed to contest; the clause restates imperative Two's own premise.
- **C3** — immaterial — "Remembers the whole conversation" is the figure behind the name; the operational statements (each session starts with no memory, no record of the conversation is kept) are unambiguous, and no reader builds from the metaphor.
- **"all but one of its reviews to the `goldfish` skill"** — reject — Checked: `METHOD.md` *When each review fires* has six rows, five run by `goldfish` and one ("a slice is finished") handed over by `execute`.
- **"the one cost"** — reject — The author's own account of a past event; standing rejection 4. The antecedent is handled above.
- **The search terms and the `HANDOFF.md` exclusion** — reject — Standing rejection 4: a dated measurement at a stated commit does not go false, and the terms are the three names bulleted beneath it.
- **The scope of the duty to propose is itself a silent judgement** — reject — Already accepted as a cost in §2 *Nothing checks that an elephant ran*: a missed proposal is noticed only by the author.
- **This file is itself a document read while under way** — reject — The rule binds an elephant, and §1 states this document was written before the elephant existed, with the process run by hand; the opening block makes `ROADMAP.md`'s entry win wherever the two disagree.

*§3* (27)

- **A4** — immaterial — the two rules cover different things by definition (a question about what the current section says, against ground no agreed section covers), and in the edge case raising new ground when the section is presented loses nothing, since the section is reviewed and can still move.
- **A5** — reject — the paragraph's opening rule, "Before proposing to end the interview, the agent asks what else", governs every proposal to end, including one after a refusal; the reviewer reached reading 2 from that same sentence.
- **A12** — immaterial — step 4's wording is its own reason ("does not matter enough to act on"), and the agent supplies reasons with its recommended outcome; harmonising the two definitions adds words without changing what anyone does.
- **A13** — reject — §5's *Where the extract begins and ends* already answers it: the extract is every author and agent turn in the chosen range, so unrelated turns inside the range are included.
- **A15** — immaterial — the only reading available, that replace and leave produce a new document and extend and change produce a diff, is the one step 4 ("only its new and changed sections are proposed") and §4's drafts already imply.
- **U2** ("live document") — reject — resolved by §1's definition, "one outside every elephant's directory whose status is not `draft` (§6)": a draft in another elephant's directory is not live, a pending diff beside its target is.
- **U3** ("a question about structure") — immaterial — the plain meaning, a question about how the documents are structured, is the one the *"you decide"* paragraph uses.
- **U4** ("a ruling that changes what the design says") — immaterial — §4 names every other kind of ruling (step 1, agreed sections, abandonment), and the four points are process; what remains is the design's content.
- **U7** ("overlap") — immaterial — the search is declared weak and its result is ruled on by the author, who can name what it missed.
- **U8** ("new topic") — immaterial — the line between a topic and a question within one only affects bookkeeping, and a missed topic is caught by the interview review and step 4's open-items list.
- **U10** ("the project's backlog") — immaterial — `AGENTS.md`, where every agent starts, says `ROADMAP.md` holds it, and naming the file here would go stale if the backlog moves.
- **U12** ("acted on") — reject — §3 says "in the section concerned", which is the document; a ledger line that was itself wrong is rewritten under §4's rule for a reversed ruling.
- **V1** (options and a recommendation cost less) — immaterial — it is the reason for a rule the author settled in the design's own interview (ROADMAP slice 7.1, "How a question and a finding reach the author"); it sets no rule of its own.
- **V2** (every part reviewed once) — reject — standing rejection 3: a session always resumes or hands off.
- **V3** (the writing standard) — reject — standing rejection 5: the writing standard is the author's to judge.
- **V4** ("should rarely be needed") — immaterial — an expectation that sets no rule.
- **V5** (ambiguity marks the author's knowledge) — reject — recorded as decided in ROADMAP slice 7.1, and its evidence is §9's (standing rejection 1).
- **V6** ("meaningfully", "several") — reject — standing rejection 5.
- **C1** — reject — resolved: 8.1 now reads "Every answered item has then landed, unless the author ruled a line's absence immaterial".
- **C2** — reject — resolved: §6 now says "Process designs, and diffs of process documents, carry one too", and the sort table marks a process-document diff `finalised`.
- **C3** — reject — resolved: §3 now "names one of the two questions that carry no recommendation; the other is close-out's question about reading the finished document (§6)".
- **C5** — immaterial — the paragraph directly before it states the step-4 exception, which is enough for a reader of the section.
- **C6** — immaterial — "the interview review (step 3)" names the kind of review and "this is not step 3" names where the elephant is; the reviewer reconciled it unaided.
- **G1** — reject — standing rejection 3.
- **G2** — immaterial — the agent lists every open item at once, so one reopening settles them all, and the review after it covers only the new turns (§5).
- **G3** — immaterial — each re-run covers only lines in documents an accepted finding just edited, and a loop needs the author to keep accepting findings.
- **G4** — reject — §4's ledger example shows step-1 entries naming documents from step 1, so the cross-elephant check sees them before step 4.

*§4* (14)

- **A6** — reject — The text already takes reading 1: §4 says "from any step" and §3 step 2 says "whatever step it is made at", and at steps 4–7 a ruling on a finding is the only kind there is.
- **A11** — immaterial — The header is read by an agent, which can read two named values in any layout; no script parses it.
- **A12** — immaterial — §4 says no script parses these files, so continuation indentation and a title line change nothing an agent reads.
- **A13** — reject — "Proposes" means put to the author for a ruling throughout §3 ("The agent proposes ..., and the author rules"), and "nearest" is a judgement word (standing rejection 5).
- **U1** ("short") — reject — A judgement word, the author's to judge (standing rejection 5).
- **U2** (lowercase words and digits) — immaterial — Every reading yields a valid, unique directory name, which is all the rule is for.
- **U4** ("exchange") — immaterial — Defined where used, and the reviewer notes nothing depends on it.
- **U6** ("the interview begins") — immaterial — Step 2 begins as step 1 ends, the moment the directory is created, and nothing happens between them.
- **V1** (`plans/` checks) — reject — Checked (standing rejection 2): `test/plan-citations.js` and `test/reviews.js` both read every file under `plans/`, as stated.
- **V2** (`test/lineendings.js` the only whole-repository walk) — reject — Checked (standing rejection 2): every other check reads a fixed list of documents or one named directory (`prompts/`, `.claude/skills/`, `.claude/hooks/`, `plans/`); only `test/lineendings.js` walks the tree.
- **V5** ("has not been written down") — reject — It states why the working files may be deleted, not a property to check; its operational form is close-out's instruction to raise anything that has not reached a draft (§6).
- **K2** (per-elephant directory never removed) — reject — Resolved: §4 *When they go* now says "The elephant's directory itself is removed with them."
- **K3** (close-out interrupted partway) — reject — A session always resumes or hands off (standing rejection 3), and the handoff records the step reached, including a sort part-done.
- **K4** (no link from items to entries) — immaterial — The design accepts that no check confirms an elephant's own bookkeeping (§2, *Nothing checks that an elephant ran*); A8's option 2 would add the link if the author wants it.

*§5* (31)

- **A4** — reject — §3 step 4 makes *answered* the author's own ruling, and §3 *What goes back* names
  the author's call as the only other way back, so the reopening turn is always an author turn.
- **A6** — immaterial — the bullet is a fallback for a session that carries on in the same transcript
  after its handoff review; the order of the bullets makes it harmless when it never applies.
- **A7** — reject — resolved by the edit at line 748: the answer is kept "as the `Author:` turn after
  it", so it is an author turn.
- **A8** — immaterial — measured: no record in twenty transcripts carries `isMeta: false`, so the two
  readings select the same records; the builder confirms field names against a live transcript anyway.
- **A10** — reject — §3 step 7 defines "as it will be" as "once the design's changes are applied", and
  the script applies this elephant's diff to the target as it is now; other pending diffs are not part
  of it.
- **A11** — reject — an outside document is not changed by the design, so as it is now is as it will
  be; §4 makes *removed* one of the three kinds of change; and the clause defers to `METHOD.md`, which
  owns how a change's seams are found (its table: "a change to a section another document cites — a
  seam review").
- **A13** — immaterial — the agent names the word in the notice itself, and §3's "no time limit"
  already means it stays available.
- **A16** — reject — standing rejection 1: the prompt change, where the question reports and what it
  does with a document stating no purpose, is §8's to specify ("§8 lists both changes").
- **A17** — immaterial — the agent only shows the earlier ruling and the author rules again, so a
  misjudged match costs nothing.
- **U3** ("one side") — immaterial — the extract holds author turns and agent replies, so "one side" is
  one of those two, and an interview part always has both.
- **U6** ("a match that was stretched") — immaterial — the author who sees one raises it like any other
  concern; no rule is needed for that.
- **U7** ("the measurement for an unknown one") — immaterial — the test is reading the records for
  conversation, which the bullet at line 760 states, and B2 has been ruled.
- **V1** ("costs the author minutes") — immaterial — illustrative, and the rule does not rest on the
  number.
- **V2** ("rising steeply") — reject — standing rejection 1: the paragraph cites §9 for its evidence.
- **V4** ("five of its eight categories") — reject — standing rejection 1: cited to §9; the count of
  eight is verified against `prompts/goldfish-seam.md`.
- **V5** (Opus tier, no record, unavailability) — immaterial — the tier rule is decided, nothing
  depends later on which model ran, and an unavailable tier is a stop the author sees.
- **V6** ("in any wording") — reject — §5 states it is a judgement: "deciding whether a document says a
  ruling is a judgement about meaning" (line 807).
- **C1** (stop condition vs `added`) — reject — already ruled as B1, and resolved by the edit at line
  844: the stop now applies to an added section only when it "follows a heading the target does not
  have".
- **C2** ("never reviewed on its own" vs section review) — reject — resolved by the edit at line 839:
  "never reviewed **as a whole** on its own".
- **C3** (extract "nothing else" vs unknown kinds) — reject — already ruled as B2, and resolved by the
  third list of tool calls kept as conversation (line 700).
- **C4** (one-word reversal vs no default) — reject — the author has ruled that the unknown-type
  decision is made by measurement and is not a default.
- **C5** (interview part ending without handoff) — reject — standing rejection 3; and the second
  begin-point is limited to the same transcript.
- **N1** ("about a dollar") — reject — standing rejection 1: cited to §9.
- **N2** ("nearly twice as many") — reject — standing rejection 1: cited to §9.
- **N3** (twenty, fifteen, fourteen, 105, six) — reject — standing rejection 4: dated measurements.
- **N4** ("nine types when this design began") — immaterial — it only illustrates growth; the dated
  figures beside it carry the point.
- **N5** ("five of its eight categories") — reject — duplicate of V4.
- **G1** (assumptions visible only in reasoning) — immaterial — an assumption that matters shows in
  what the agent says next, and the section review sees the drafts it led to.
- **G2** (how the agent learns record ids) — immaterial — the agent reads its own transcript, and the
  extract labels every turn with its id, so a mis-picked turn is visible in it.
- **G4** (withdrawn rulings left in documents) — reject — a withdrawal is a new decision, and §3 *What
  goes back* has the agent list the sections it affects.
- **G5** (first review halts) — reject — resolved by the edit at line 703: every type found when the
  extractor is built is settled by measurement then, not at the first review.

*§6* (21)

- **A3** — reject — already resolved: line 921 now reads "raises it as §1 requires of any change to what a process document requires; a typo is not one", and §1 makes that the agent's proposal with the author ruling.
- **A10** — reject — already resolved: the paragraph now says the diff "sits beside its target, which names it, until the slices that bring the skills and prompts into line with it are finished, and then folds in", and fold-in is defined just above as the last step of the last slice, by the §5 script.
- **live document** — reject — already resolved: §1 line 43 defines it ("one outside every elephant's directory whose status is not `draft`").
- **specification, as a class of files** — reject — already resolved: the check paragraph now names the specifications directory and the named list at the root.
- **diff specification (narrowed?)** — reject — already resolved: the check recognises a diff by its `Amends:` line, process-document diffs carry a status and a pointer, and the sort table gives both rows the same treatment.
- **process document vs process design** — reject — already resolved: "Process designs, and diffs of process documents, carry one too ... The live process documents themselves carry none."
- **the list of slices** — reject — standing rejection 2, checked: the `slice` skill defines it as "a separate ordered list, one short entry per slice", kept as backlog.
- **close-down of the last slice** — reject — standing rejection 2, checked: the `execute` skill defines closing down; "last" is the last entry of the ordered list.
- **built / implementation complete for a process document** — reject — already resolved: "their implementation is the slices that change the skills and prompts".
- **block, row, state** — reject — standing rejection 2, checked: `REVIEWS.md` defines `State`, `At` and the block layout.
- **SOURCES.md's entry format** — reject — standing rejection 2, checked: `SOURCES.md` shows it (Kind, Evidence, Sources, Departs, keyed by rule).
- **rule** — immaterial — `SOURCES.md` is keyed by the rules `METHOD.md` states, which already fixes what counts as one.
- **the backlog** — reject — standing rejection 2: `AGENTS.md` names `ROADMAP.md` as holding the backlog.
- **pointer (process-document target; moved entry)** — reject for the target (resolved: "or at its top where it has none", and the wording now says "the code or the process"); immaterial for the moved-entry pointer, whose one line needs no fixed format.
- **non-goals are in the specification** — reject — the ledger review confirms at close-out that every ruling reached its document (§5); nothing after close-out needs to re-check it.
- **"only as much reasoning as following them needs"** — reject — standing rejection 5: a judgement for the author, not a check.
- **"Every rule ... gets an entry there"** — immaterial — `test/sources.js` already checks every entry's kind; whether a rule lacks an entry is caught by the document review.
- **the fixed sentence tells an agent what to do** — immaterial — it is the reason for the sentence, not a requirement anything must verify.
- **"nothing permanent depends on one"** — immaterial — a negative claim about a file that is never written needs no check.
- **Where an added section goes at fold-in** — reject — already resolved: §5 says the script "places an added section after the heading its `**After:**` line names"; renumbering is immaterial, since headings are matched ignoring the number.
- **Order of the status check and the status-line slice** — reject — standing rejections 1 and 6: ordering is §8's.

*Round E* (32)

- **§3 — the paragraph on arguing U-work** (four words for the subject (change, work, it, feature)) — immaterial — all name the one change the elephant is about
- **§3 — the paragraph on arguing U-argue** ("argue", "pressing") — rejected — standing rejection 5: judgement words are the author's
- **§3 — the paragraph on arguing V1** (no check could tell an argument about the approach from one about the need) — rejected — §2 accepts that nothing checks the agent's conduct
- **§3 — the paragraph on arguing V2** ("pressing further would test nothing" is unsupported) — rejected — it is the reason the author gave for the ruling (round D)
- **§3 — the paragraph on arguing G2** (the paragraph adds a fifth ruling-like event to a list of four) — immaterial under option 1 — it is an answer to an argument, not a point in the process
- **§6 — *What it produces* A1** ("one draft for each subject" vs "one for each document") — rejected — standing rejection 2, checked: §3 says "one document per subject the design touches"
- **§6 — *What it produces* A4** (where the positive restatement of a non-goal is written) — rejected — standing rejection 2, checked: §2 *Where these end up* states it in the design ("stated positively, in §3")
- **§6 — *What it produces* A5** (is the evidence section mandatory) — immaterial — "It has an evidence section" is unconditional
- **§6 — *What it produces* A6** ("a plan" — any plan, or one cut from a process design) — immaterial — DECIDE 4's wording replaces the sentence
- **§6 — *What it produces* A7** (is a large change by the author's own hand outside the elephant) — immaterial — the author decides whether any change has an elephant (§1)
- **§6 — *What it produces* A10** (changing `CORRIDORS.md` / `FORMATIONS.md` while `draft`) — rejected — the status paragraph says each moves into the elephant's directory when its design resumes
- **§6 — *What it produces* A12** ("Usually, specifications" — other outcomes?) — immaterial — backlog entries are not the design
- **§6 — *What it produces* U-subject, U-step4, U-followed, U-restated, U-evidence** (five terms) — rejected — standing rejection 2: defined in §3, §2, the opening block, and §6's own evidence paragraph
- **§6 — *What it produces* U-decision-taken, U-small, U-typo, U-put-in-place** (four terms) — immaterial — `decision already taken` is §1's and ROADMAP's own phrase; the rest are judgement words (standing rejection 5)
- **§6 — *What it produces* V1** (an author's edit cannot be told from an agent's) — rejected — §2 accepts that nothing checks the agent's conduct
- **§6 — *What it produces* V2** ("never put in place at close-out" uncheckable) — immaterial — the sort table is the whole of what close-out does
- **§6 — *What it produces* V3** (non-goals in the specification uncheckable) — rejected — **re-raised; earlier ruling (round D, §6):** "the ledger review confirms at close-out that every ruling reached its document"
- **§6 — *What it produces* V4** (which non-goals become rules uncheckable) — rejected — standing rejection 5
- **§6 — *What it produces* V5** ("writes far more than the author oversees" unsourced) — rejected — the author's own reason for the round-D ruling
- **§6 — *What it produces* G-hooks** (a hook is code; is it drafted like text?) — immaterial — a hook changes only through a plan, like any process document
- **§6 — *What it produces* G-§2** (§2 not given) — rejected — standing rejection 2
- **§5 — *Reading a document as it will be* B4** (the scratch directory, the output names, and the fold-in mode) — rejected for the directory — standing rejection 2: §5 *The interview review* defines it; immaterial for names and mode — a builder's choice, and §6 says fold-in writes the target
- **§5 — *Reading a document as it will be* A5** ("same text" for a new repeated heading) — immaterial — §4 matches by heading text ignoring the number; the stop wording works either way
- **§5 — *Reading a document as it will be* A7** (does "as it will be" include other pending diffs?) — rejected — **re-raised; earlier ruling (round D, §5 A10):** "the script applies this elephant's diff to the target as it is now; other pending diffs are not part of it"
- **§5 — *Reading a document as it will be* A8** (does step 7 cover a document citing a removed section?) — rejected — **re-raised; earlier ruling (round D, §5 A11):** "§4 makes *removed* one of the three kinds of change". A renumbering alone owes no seam review
- **§5 — *Reading a document as it will be* A9** ("status and pointer lines aside" applies to which sections) — immaterial — DECIDE 9's wording replaces the phrase
- **§5 — *Reading a document as it will be* A11** (the reading copy's layout and order) — immaterial — the author reads it; any layout that keeps old and new apart serves
- **§5 — *Reading a document as it will be* A11a** (may a changed section's heading level change?) — immaterial — the diff holds the section whole, heading included
- **§5 — *Reading a document as it will be* U-collision, U-applied, U-reading, U-removed-mark** (four terms) — immaterial — each is used where it is explained
- **§5 — *Reading a document as it will be* V2** ("the reviewers and the author read those documents as rewritten" depends on the dispatch) — immaterial — the agent does the dispatching, and §5 says what it hands over
- **§5 — *Reading a document as it will be* G-process-fold** (at fold-in, citation rewrites reach process documents in place) — immaterial — fold-in is a slice's step, and a process document changes through a plan
- **§5 — *Reading a document as it will be* G-by-name** (a citation by heading name goes stale on a rename) — immaterial, weakly — a rename is a removal and an addition, so its by-number citers are listed, but a by-name citer is found by nothing, here or anywhere in the repository today. Not measured how many exist. Accept would add "and every citation of its heading by name" to what the script lists

*Round F* (12)

- **A5** (does a rewritten section get a fresh section review?) — rejected — §3 *What goes back* says each is written again "each with its section review"
- **U-beside, U-close-out, U-final-path** (three terms) — rejected — standing rejection 2: ROADMAP's folder entry, §3 step 8, and §4 define them
- **U-alternative** (how a rejected alternative is identified) — immaterial — answered by A12
- **V1** ("most are expected to be dropped") — immaterial — your expectation, setting no rule
- **V2** (the writing agent is the reader least likely to see what it left out) — rejected — your Q3 ruling's own reason
- **V3** ("a plan's lifetime" not in the ROADMAP text given) — rejected — standing rejection 2, checked: ROADMAP gives a process design "Layer 3's lifetime", and Layer 3 is plans
- **V4** ("neither can be rebuilt from the other") — rejected — ROADMAP's own reason, in the folder entry and slice 7.1
- **V6** ("nothing is followed from it") — rejected — the opening block states it
- **G1** (a stretched match under *found* loses content with no ruling) — immaterial — the author sees every *found* match quoted, as with the ledger review
- **G2** (*dropped on purpose* rulings do not outlive the deletion) — immaterial — §5's rule: a finding to be remembered is added to the design by a ruling of its own
- **G3** ("a plan's lifetime" may imply deletion) — rejected — as V3; the next paragraph says what expires
- **G6** (abandonment after close-out) — rejected — the elephant ends at close-out (§1); dropping a signed-off design later is a new decision

*Round G* (58)

*§7 whole (S7)*

- **A4** (when it runs if the successor is not written last) — immaterial — "at the end of step 5" is unambiguous; the first clause only says why
- **A6** ("says so when it finds nothing") — immaterial — either reading tells the author the same thing
- **A9** (order of pointer lines) — immaterial — the check tests that each pointer names an existing document, not order; say "in any order"
- **A11** (no status line counts as `active`) — immaterial — reading 1 is right: it holds until the status-line slice, which §8 orders before the check
- **U2** ("built", of a successor) — immaterial — the successor is built when its last slice closes, the same commit that deletes the replaced document
- **U3** ("rejected alternative") — immaterial — every specification has a section agreed for them (§6 *What it produces*); "what its text rejects" is the fallback and is a judgement
- **U4** ("claim") — reject — standing rejection 5: the unit is a judgement for the reviewer, and the author sees every *found* match
- **U5** ("as it shows a finding raised again") — reject — packet: §5 *What is kept of a review* defines it
- **U6** (process design / process document) — reject — packet: §6 *What it produces* defines both
- **V1** (no baseline for "does not change") — immaterial — the `Being replaced by:` line is the only change, and git holds the rest
- **V2** (the `METHOD.md` sentence cannot be shown true at deletion) — immaterial — it states the process, not a property a check confirms
- **G2** (a stretched *found* match loses content with no ruling) — reject — re-raised; earlier ruling (round F, G1): "the author sees every *found* match quoted, as with the ledger review"

*§6, "What it produces" (PR)*

- **A2** (evidence section "like any other") — immaterial — reading 1 is the only one supported, as the reviewer says
- **A11** (backlog entries) — reject — packet: §3 step 5 sends separate work to the backlog, and §6's sort table keeps them; the backlog is not a design document
- **U2** ("covers") — immaterial — the search is by hand and the author rules on its result, like step 1's
- **U4** ("a moved evidence entry") — reject — packet: the sort table describes it
- **U5** ("evidence section") — reject — packet: §6 *The sort at close-out* gives its format
- **U6**, **U7** — reject — standing rejection 2, checked: §3 defines subject and both steps
- **U9** (does a diff carry non-goals) — immaterial — a diff holds sections, and if a non-goal changes, its section is one of them
- **U12** ("inherently live") — immaterial — the point is that they carry no status; "inherently" can go
- **V1** ("writes far more than the author oversees") — reject — re-raised; earlier ruling (round E, V5): "the author's own reason for the round-D ruling"
- **V2**, **V3**, **V4**, **V5** (no check named) — reject — §2 accepts that nothing checks the agent's conduct
- **G1** (the extractor is a script; does maintaining it clash) — reject — re-raised; §6's opening calls it "upkeep of a tool it uses, not something it produces", a ruling already made
- **G3** (text written by a plan skips design reviews) — immaterial — the author chose that at step 4, knowing it, and the plan review reads it

*§6, "A diff specification" (DF)*

- **A8** (sign-off and close-out) — reject — standing rejection 2: §3 step 8 defines both; sign-off is item 3 of close-out
- **U1** ("close-out") — reject — packet: §3 step 8
- **U3** (the list of slices) — reject — re-raised; earlier ruling (round D, §6): "the `slice` skill defines it"
- **U5** ("elephant") — reject — packet: §1
- **V2** (placement untested) — immaterial — an agent reads it; placement only affects readability
- **V3**, **V4** — reject — §2 accepts that nothing checks the agent's conduct
- **G3** (records naming a deleted diff) — immaterial — the ledger is gone by then; the review record is §6's to clean up and does
- **G4** (a target with no status line) — immaterial — transitional, as S7 A11

*§5, "Reading a document as it will be" (RD)*

- **B2** (inputs, outputs, names) — reject — re-raised; earlier ruling (round E, B4): "a builder's choice"
- **A6** ("already exists") — immaterial — either reading stops on the same cases the duplicate-heading stop catches
- **A12** (the author's reading copy) — immaterial — re-raised; earlier ruling (round E, A11): "any layout that keeps old and new apart serves"
- **A15** ("changed since" at fold-in) — immaterial — the second clause is what is built, as the reviewer says
- **U1** ("the scratch directory") — reject — standing rejection 2: §5 *The interview review* defines it
- **U4** ("collision") — immaterial — the author is shown the stop, and rules on it like any question
- **V1**, **V2** — immaterial — process statements, not properties a check confirms
- **K2** (rewriting a record of what was reviewed) — immaterial — `REVIEWS.md`'s ranges mean the same sections after rewriting, which is what is wanted

*§3's three passages (S3)*

- **B1**, **B2** — reject — packet: §7 *The retirement review* defines it, runs it "at the end of step 5", and "for a document reworked in place too"; an `implementation ongoing` document is not replaced
- **A4** (approach versus need) — reject — standing rejection 5: a judgement word, and the author answers the argument
- **A7** (the imperative Two citation) — immaterial — the parenthesis gives the reason arguing exists; the narrowing is the paragraph's own
- **A11** (what the pending-diff warning is for) — immaterial — it informs the author's ruling on the four options; it asks nothing
- **U1** — reject — packet, as B1
- **V1** — reject — re-raised; earlier ruling (round E, V2): "it is the reason the author gave for the ruling"
- **V2**, **V3** — reject — §2 accepts that nothing checks the agent's conduct
- **G1** (an accepted retirement finding editing the live replaced document) — reject — §7: a carried claim becomes a line naming the successor, and the successor is written again
- **G3** (imperative Two's "never because the author said it twice") — immaterial — the agent stops arguing; it does not change position, and may say so
- **G4** (what the status report is for) — immaterial — it shows the author which rows of §7's and §6's rules will apply

*Opening block, §1 item 3, ROADMAP.md passages (OR)*

- **A7** ("the author saying so") — reject — checked: the entry says it, in *Writing, and finishing*; the packet did not include that bullet
- **U2** ("the ledger review" in ROADMAP) — immaterial — the entry names it in *The reviews*
- **U4**, **U5**, **U7**, **U8**, **U9**, **U10** — reject — standing rejection 2: defined in the same entry or in `ELEPHANT.md`
- **U11** ("the two new skills") — reject — standing rejection 1: §8 names them
- **V1** (nothing checks the seam review ran) — reject — §2 accepts that nothing checks the agent's conduct
- **V3**, **V4** — immaterial — reasons, setting no rule
- **N1** ("Twenty-three markdown files") — immaterial — measured today, 23 at the root, `HANDOFF.md` included; a backlog entry's count, not a design's
- **N2** ("two new skills") — reject — standing rejection 1

*Round H* (4, of the 42 ruled; the other 200 are unruled)

- **A-B3** (where the elephant section goes in `METHOD.md`) — reject — placement does not change what
  `METHOD.md` says; the slice's plan chooses it and the plan review sees it
- **E-B2**, and **F-B1**'s interface part (how the table check reads other checks' lists, and the
  table's format) — reject — a builder's choice, as round E ruled for the apply script's inputs (B4)
- **F-C2** (the backlog entry sets the status by hand; §6 says a skill does) — immaterial — the entry
  records a one-off for a file written before the elephant existed; §6 states the rule for designs made
  through one

*Round H, report A* (17, ruled this session)

- **A4** (the definition omits the search and reviews) — immaterial — §1's own definition has the same
  two parts, with the steps between them
- **A8** (the wording omits abandoning) — immaterial — the `elephant` skill runs abandonment (§3)
- **A9** (the retirement review compares with the successor only) — reject — resolved by C5
- **A10** (where the clause goes; it is a sentence) — reject on placement, re-raised (round D §1 A1);
  immaterial on the word
- **A11** (*superseded* against *replaced*) — immaterial — the successor is in force from the deleting
  commit (§7)
- **A14** (*"handed only that"*) — immaterial — `METHOD.md`'s *When each review fires* says what the
  reviewer is handed
- **A16** (do the structure rulings move to the skill) — immaterial — §3 states them as steps
- **U3** (*working side*) — immaterial — the colon spells it out
- **U4**, **V1** (close-out for this file; how the entry is confirmed) — reject — duplicates of A-B1,
  open question 2
- **V2** (the `ROADMAP.md` entry not given) — reject — checked: *"the author saying so"* is there
- **V3** (the hook sends only bold openings) — reject — checked against the hook
- **V4** (empirical claims) — reject — re-raised (round D §1, *"nothing downstream will catch"*), and
  standing rejection 1
- **G1** (§8–§10 absent) — reject — standing rejection 1
- **G2** (this file has no status line) — reject — re-raised, F-C2
- **G3** (what makes an agent propose before opening `METHOD.md`) — immaterial — the hook sends every
  agent to `METHOD.md` before writing, and investigation before that is allowed
- **G5** (*"contains no plan"* against cutting the entry) — reject — a rule about when the entry stops
  winning; how it is done is open question 2

*Round H, report B* (17, ruled this session)

- **A1** (*"`METHOD.md`'s line naming the skills"*) — immaterial — one sentence there names them, and
  the count follows
- **A3** (does the one form cover every exchange) — immaterial — *"every question"* is every one; the two
  exceptions drop only the recommendation
- **A4** (a stated reason, stated by whom) — immaterial — the agent's recommendation carries one; a
  missing reason only means a re-raised finding is ruled again
- **A6** (who judges what a deferral holds up) — immaterial — the reviewer's readings are the only ones
- **A7** (stops replying, against the session ending) — immaterial — an agent acts only in reply
- **A9** (is the what-else question part of the point) — reject — the text says *"including"*
- **A11** (how a question is put again) — immaterial — either way the agent waits; no ruling has a
  default
- **U1** (*points in the process*) — immaterial — the list of four is closed, and only *"you decide"*
  turns on it
- **U2** (*finished*) — reject — the opening block equates it with signing off; B-B2 removed the word
  from the trigger
- **U3** (*"runs the proposal"*) — reject — resolved by B-B1
- **V1** (the §9 citation) — reject — standing rejection 1
- **V2** (*"costs the author less"*) — reject — re-raised (round D §3 V1)
- **V3** (*"enough background"*) — reject — standing rejection 5
- **V4** (exactly two questions with no recommendation) — reject — checked: §7's question is an
  interview question in the usual form, and a proposal to end is itself a recommendation
- **G1** (an abandoned elephant and `CORRIDORS.md`'s exemption) — reject — resolved: §6 says a document
  moved back keeps it
- **G3** (a forgotten elephant blocks others) — immaterial — step 1 names it, and the author can abandon
  it
- **G4**, second half (*"you decide"* on omitting a checklist item) — immaterial — the reason is on the
  line, and the checklist dies at close-out

*Round H, report C* (29, ruled this session)

- **A1** (*"no part of the conversation"*) — reject — resolved by C-C1
- **A2** (which path a finding names) — immaterial — either lets the author find the text
- **A4** (whom *"not run more than once"* binds) — immaterial — §3 says a review runs again only when the
  author asks
- **A5** (is a re-raised finding ruled again) — reject — re-raised (round D §5 A17)
- **A6** (*found* headings against the prompt shape) — reject — resolved by B-A10
- **A8** (outward citations not in the seam list) — immaterial — the section review is given every
  section a section cites
- **A10** (findings kept when abandoned) — immaterial — no later review raises them again
- **A11**, first half (no exact `METHOD.md` wording for the exception) — immaterial — the content is
  stated, and the plan renaming the outcomes in that sentence writes it
- **U2** (*family of models*) — immaterial — plain meaning
- **U4**, **V8** (*"the literature on this method"*) — reject — checked: the `bug` skill says it
- **U5** (a seam with no citation) — immaterial — the seam prompt asks whether two documents disagree
- **U6**, **N4** (the five states) — reject — checked: `REVIEWS.md`'s opening line
- **U7** (when a finding is raised again) — reject — re-raised (round D §5 A17)
- **U8**, **N3** (*"about a dollar"*) — reject — re-raised (round D N1), standing rejection 1
- **V1**, **V9** (§9 citations) — reject — standing rejection 1
- **V2** (*"rising steeply"*) — reject — re-raised (round D V2)
- **V3** (the alias follows the newest Opus) — immaterial — the rule names the alias
- **V4** (only Claude models) — reject — checked: the agent tool's model choices
- **V5** (effort per dispatch) — reject — checked: the agent tool takes an effort setting
- **V6** (*"most likely where neither cites the other"*) — immaterial — reasoning
- **V7** (the seam prompt's category) — reject — checked: *DUPLICATED OWNERSHIP*
- **N1** (*"nearly twice"*) — reject — re-raised (round D N2)
- **N2** (*"costs the author minutes"*) — reject — re-raised (round D V1)
- **G1** (later reviews re-raise dropped findings) — immaterial — the accepted cost of dropping them
- **G2** (the writer's model) — immaterial — every model the harness offers is Claude
- **G3** (a document review given only the document) — immaterial — seam and section reviews read each
  citation's other side

*Round H, report D* (21, ruled in a later session)

- **A1** (*"`METHOD.md` says"*: fact or requirement) — reject — resolved by the opening block
- **A2** (a section agreed for non-goals) — reject — re-raised (round G U3, U9)
- **A3** (other-side work to the backlog: who decides) — reject — step 5 raises it as one question
- **A5** (a slice editing its own `implementation ongoing` design) — immaterial — the bar is among
  step 1's options; the pointer is the slice's own step, made in the diff while one is pending
- **A7** (*"not yet `active`"* and `abandoned`) — reject — resolved by D-B1
- **A8** (a diff of a process design is a process design) — immaterial — *"as a diff of it"* fixes it
- **A9** (is the `SOURCES.md` diff an agreed document; its sections) — reject — resolved, and checked:
  each of `SOURCES.md`'s 46 entries is a `###` heading
- **A10** (*"the same kinds"*) — immaterial — the table's dash shows it
- **A11** (*"It produces documents"* after *"never produces a process document"*) — immaterial
- **A12** (nested fences; how a drafted document is reviewed) — reject — resolved: a block quote, and
  *"one of the process design's agreed sections"*
- **U2** (*covers*) — reject — re-raised (round G PR U2)
- **U3** (*specification*) — immaterial — the text names process designs and `SOURCES.md` where a rule
  must reach them
- **U5** (the one-line pointer's form) — immaterial — re-raised in part (round D §6 pointer)
- **U6** (`SOURCES.md`'s entry format) — reject — re-raised (round D §6)
- **U7** (*rule*) — immaterial — re-raised (round D §6)
- **U8** (*typo*), **V1** (*"only as much reasoning"*) — reject — re-raised, standing rejection 5
- **V3** (*"never what has to change"*) — reject — the author's Q2 ruling; standing rejection 5
- **G1** (the `SOURCES.md` diff's lifecycle) — reject — duplicate of report A's A2, open question 3
- **G3** (§9, §10 absent) — reject — standing rejection 1
- **G4** (`ROADMAP.md`'s direction as a record) — immaterial — `METHOD.md` puts direction in the *about
  the work* family, and it is written directly

*Round H, report E* (25, ruled in a later session)

- **A4** (`process/designs/` recursive, `.md` only), **U2**, **U3** (*place*, *kind*, which checks keep
  lists) — reject — a builder's choice (round E B4, round H E-B2)
- **A5** (the table's granularity) — immaterial — the root names each file
- **A6** (first and last slice) — immaterial — the list is ordered and carried out in order
- **A7** (a diff set `active`; the fixed sentence on a diff) — immaterial — fold-in deletes it; a diff
  is a specification
- **A8** (the `SOURCES.md` diff's list) — reject — duplicate of report A's A2, open question 3
- **A9** (*"under the same name"*) — immaterial — the only reading; §4 names the draft
- **A12** (cutting a draft on the author's word) — immaterial — deliberate
- **A14** (slices lost on abandonment) — immaterial — a `finalised` document is cut again
- **A16** (no status line) — immaterial — re-raised (round G S7 A11, DF G4); §8's ordering fell, it is
  still transitional
- **A17** (who sets `draft`) — immaterial — each move says *"as a `draft`"*, inside the elephant
- **A18** (an `abandoned` document extended) — immaterial — kept drafts sit only in kept elephant
  directories, outside step 1's search; §7 says a new design is a new document
- **U1** (the list of slices), **U6** (close-down) — reject — re-raised (round D §6)
- **U4** (*untrue*) — immaterial — the `slice` skill's comparison, and the author rules on the cut
- **U5** (*"holding back"*) — immaterial — the author's own choice
- **U7** (*match*) — reject — §4 gives the pattern, §7 renames a re-pointed diff
- **V2** (*"only shrinks"*) — reject — resolved by E-C3
- **V3** (*"knows what to do"*) — immaterial — re-raised (round D §6)
- **V4** (*"cuts only what it finds untrue"*) — reject — §2: nothing checks the agent's conduct
- **V5** (*"discouraged"*) — immaterial — the three warnings are what it means
- **G1** (a re-pointed diff's stops fire) — reject — intended: the check *"shows where"* (§7)
- **G2** (fold-in holds the last slice open) — immaterial — it is the slice's last step
- **G3** (deadlock) — reject — none constructed; every wait ends on the author's ruling

*Round H, report F* (22, ruled in a later session): A2, A4, A6, A7, U1, U2, U4, V1 — immaterial; A3
(open question 3), A5 (builder's choice), A11 (§3 defines each outcome), A12 (E-B1), U3 (E-B2), V2
(`test/dedupe.js` says it), V4, N1, N2 (`test/hooks.js`'s `BUDGET`), N3 (measured: slice 1 to slice
7), G1 (the skill's opening), G2, G3 (open question 2), G4 (only `METHOD.md` uses the old names) —
reject.

### Sources for §9, none yet in `SOURCES.md`

As listed in `git show e03e4af:HANDOFF.md`, and the tables it points to.

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
- On 2026-10-31: `test/corpus-size.js` cites `CORRIDORS.md` §14 and §14.2 in its comments — the reason
  the apply script rewrites `.js` files (D13). References to move each document: `ELEPHANT.md` 13 in 2
  files, no checks; `CORRIDORS.md` 73 in 11 files, 5 checks; `FORMATIONS.md` 94 in 10 files, 4 checks.
- On 2026-10-31: the injected session-start text is 1,691 characters; 1,674 with *"to rule on"*.
  `test/dedupe.js`'s list does not name `process/designs/ELEPHANT.md`, and nothing says whether that is
  deliberate — the case the table check exists for.

### `PILOT.md`'s artefact review, recorded nowhere

The author read `PILOT.md`; one finding: it says nothing about the elephant. §3 now says what it must
say (D), and §5 adds the person-reading row and the `waived` state; this finding is what that row
will hold for `PILOT.md`.

### Unrequested decisions, flagged and not reversed

They stand unless the author uses the word.

- Earlier sessions: as listed in `git show 7c839e1:HANDOFF.md` and the handoffs before it.
- Round H: open questions 1 and 2 judged not to bear on §8 (*raise*); §1 *What the repository calls it
  today* left as reasoning, not restated (*include*); the two identical *What changes in `METHOD.md`*
  headings given distinct names (*rename*); the re-cut paragraph's sentences that a second cut leaves
  earlier additions in place and that a document with a pending change is not re-cut (*trim*); the
  backlog entry's sentence setting this file's status by hand at sign-off (*drop*); every reviewer
  given the whole of `ELEPHANT.md` and `METHOD.md` as dependencies (*repack*); the two one-sentence
  deletions left unreviewed (*review*); the seven reports copied into `HANDOFF-reports/` so they
  outlive the scratch directory (*temp*).
- This session: the 200 findings put one report per round (*all*); A2 treated as part of open question
  3 (*separate*); §1's *"because nothing defined the conversation"*, after *"never mentions the elephant
  at all"*, left unchanged (*reword*); report B's G4 split into two halves ruled apart (*join*);
  report C's A11 split likewise (*join*); U1 and U3's model names taken from `fb25bc5`'s source table,
  not yet in `SOURCES.md` (*defer*); A2's move-back rule placed in §3's abandonment paragraph (*move*).
- Report D's session: the new `METHOD.md` row given with its table's header row, so the block quote
  renders as a table (*bare*); the backlog entry placed before *Inputs to cutting `ELEPHANT.md`*, which
  stays last (*after*); V2's new requirement on the sweep — that it reads each process design against
  the process documents — not added to that entry's list of places the design reaches (*carry*).
  Report E: A19's `METHOD.md` statuses added to that same list (*drop*); V1's fixed-text failure stated
  once in §6, covering §7's two lines, without changing §7's list of four (*restate*). Report F: the
  §1 row rejoined onto one line; U5 naming the *Finding triage* note too (*two*). Report G: V1's rule
  placed in §6's third warning rather than in §7 (*move*); A4 settled by one clause on the `Replaces:`
  line rather than every *final name* becoming *final path* (*rename*). The sorting rule: not extended
  to stop re-reviewing fixes, which would contradict `METHOD.md`'s *"again once it settles"* (*extend*);
  that clause is now replaced by the re-review rules, so this one is moot.
- §9's session: §5's example *"an inconsistency in machinery the author never sees"* (*plain*); *"a
  user of the system"* beside *"the author"* (*author*); Q3c narrowed to rules added to `METHOD.md` and
  rules backed with evidence (*every*); the review run on the Opus tier at high effort (*cheap*); its
  reviewer given `METHOD.md` and `ELEPHANT.md` whole (*trim*); the diff naming the design's sections by
  heading (*number*); the entry renamed *"section by section"* to clear the dedupe check (*rename*);
  *Used by* cells on existing rows too (*new-only*); no row for Chroma (*chroma*); the *Ask or Assume?*
  tension as a **Note:** field (*inline*); the memory note corrected to say re-reviews run at the
  author's call (*revert*); *Departs* naming elephant-goldfish's parallel reviewers (*loops*); §1's
  *"reviewed as it settles"* left (*settles*); the re-review rules applying outside an elephant too
  (*elephant-only*); the two scripts and the research report copied into `HANDOFF-reports/` (*temp*).

---

## What has gone wrong repeatedly

- **Never put a script inside `node -e`, and never use a heredoc for one.** Write it to a file.
- **Every document edit is an assertion-checked script** — exact strings, counted, nothing written
  unless each count is one. Confirm each replacement landed. The tool: an `apply.js` taking a file of
  `@@@ FILE` / `@@@ OLD` / `@@@ NEW` / `@@@ END` blocks, dry run by default, `--write` to write; rebuild
  it if the scratchpad is gone. An empty `NEW` block does not parse: to delete a line, put a neighbouring
  line in both `OLD` and `NEW`.
- **A measurement can be too literal.** Search for the idea, not one word.
- **Each round of fixes produces the next round's findings**, in the newest text. Review only what is new.
- **A rule added in one place must be carried to every place that depends on it**; list each.
- **An author's answer can reach further than the question.** Round H's Q2 answer removed §8 and reached
  fifteen passages of reviewed text.
- **Questions carry their own background; outcomes say what they do.** Round H needed A, B, C and E
  explained twice (*"not sure what this question means"*, four times in one reply): each had named the
  artefact and the fix without saying what the thing was or giving an example. Lead with what it is, in
  plain words, then a concrete case, then the options.
- **Questions name the documents** (author). Never *"both documents"*, never a case without an example.
- **After a pass that edits both, read the new `ROADMAP.md` text against the new `ELEPHANT.md` text.**
- **Cut review packets by heading markers, each asserted unique**, never by line number. A marker that
  is a prefix of another heading matches twice (`# The elephant` inside `## The elephant`).
- **Reviewers read a design's present tense as a claim about today.** The opening block now says the
  design states what must be true once built; a finding that a process document *"does not say"*
  what the design says it says is that, not a contradiction.
- **Do not spend design text on agent pushback against doing the work at all** (author, D11).
- **Reports re-raise earlier rulings often** — in report C, seven of the 29 rejected or immaterial were round D rulings raised again.
  Check the round D–H lists below before calling a finding new.

---

## The message that starts the next session

```
Continue the Rueda Simulator methodology rework on branch engine/pathing_rework. Read HANDOFF.md
first — it is at the repository root and tells you what to read, in what order, and where things
stand. Do NOT delete it when you start; it says when to delete it.

You are continuing slice 7.1: process/designs/ELEPHANT.md, the design for the elephant. §1–§7 are
written, and its evidence is process/designs/SOURCES.elephant.md, a diff of SOURCES.md, written,
reviewed and ruled. Your unit of work this session: §8, "what else was considered?". Write it from
the record, with no interview: gather its alternatives as HANDOFF.md's "What to do" says and put them
to me once, as one list I answer in one message, before writing. Sort every finding as HANDOFF.md's
"How findings are put now" says. Do not start the document review, do not write a plan, and dispatch
no review beyond §8's own section review.

I want ELEPHANT.md finished with as few questions as possible; it can be improved later. Put a finding
to me in full only if it would block building the design or contradicts a decision I have made.
Everything else goes in one list I answer with "accept", or to the backlog as later work. Recommend no
second review round unless something material comes back.

Raise anything HANDOFF.md lists as open that bears on what you are doing, rather than deciding it
for me.

How I work: I review everything and nothing is applied without my say-so, item by item. Present
findings in the order .claude/skills/goldfish/SKILL.md sets out. Every item that needs a decision from
me gets one sentence saying what the issue is and why, then options, with your recommendation first
and clearly marked. Explain from the ground up — what the thing is, a concrete example, and what
breaks without it — and say what each option does rather than naming it. Challenge my thinking rather
than agreeing with me. End each round by listing exactly which sections you changed, marked
rewritten-in-full or changed-in-place, calling out separately anything that touched already-reviewed
text, and flagging any decision I did not ask for with a one-word way to reverse it.

Measure, don't assert — node and python are both on PATH. Write anything that may become a check in
node, since every check here is. Never put a script inside node -e or python -c, and never use a
heredoc for one. Write the script to a file and run it.
```
