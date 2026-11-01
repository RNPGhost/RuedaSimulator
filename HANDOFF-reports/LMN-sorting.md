# Document review — every finding, sorted

The three reports: `L-document-elephant.md` (document review of `ELEPHANT.md`, 56 findings),
`M-document-sources.md` (document review of `SOURCES.md` as the diff leaves it, 39), `N-seam.md` (the
seam between them, 26). Ids are the reports' own, prefixed L, M or N. Nothing has been applied.

## A. Put in full

- **A1** — reviews that run again without the author asking: L-C1, L-C2, L-N2, N-C2, N-N3.
- **A2** — two passages worded as changes to `METHOD.md`, against ruling Q2: carried from §8's session
  (C5); §5 *The section review* and §6 *What it produces*.

## B. One line each, answered together — recommended accept

| # | From | Where | The change |
|---|---|---|---|
| B1 | L-C3 | §4 *Drafts* | a draft is created when its first section is written, *or when step 1 moves an existing document in* |
| B2 | L-C4 | §6 opening | *"written into a document that already exists"* becomes *"written into a live document"* |
| B3 | L-G2 | §6 sort table | new row: a document reworked or changed in place goes back to the path it came from, or to the path agreed at step 4, marked `finalised` |
| B4 | L-G3 | §7 *What replacing means*, table | an old section with no counterpart in the successor is removed once the last section is written, before the retirement review, which reads the document as it was before the move |
| B5 | L-G1 | §4 `ledger.md` | a checklist item set back to `open` after step 4 is put to the author at once, and answered there or omitted with a reason |
| B6 | L-C8 | §5 *Citations* | the exception narrowed: in a diff, a citation naming no document, and in any draft of the elephant, a citation naming a diff's target, mean that target at the commit its diff names |
| B7 | L-C9 | §7 *From sign-off to deletion* | the fold-in in the deleting commit is named as the one exception to §6's rule that a diff folds in at its own last slice |
| B8 | L-C10 | §5 *How every review is run* | *"one the agent recommends acting on is put as a question"* applies to a finding put in full |
| B9 | L-C12 | §8 closing table | three rows: a retirement review in both directions (§7); a recommendation on close-out's reading question (§6 *The review record*); *"you decide"* on the abandonment clean-up (§3) |
| B10 | L-C13 | §6 *A diff specification* | *"in any order"* gains *"but for §7's `Being replaced by:` line, after any `Pending change:` line"* |
| B11 | L-C6 | §4 *Where they live* | *"The one check that walks the whole repository"* becomes *"`test/lineendings.js`, which walks the whole repository"* |
| B12 | L-G11 | §5 *The ledger review* | a ruling that removes something is found when the document no longer holds it |
| B13 | L-G17 | §6 *What it produces* | the plans from a process design may also add to every specification what the design requires of each, such as its status line |
| B14 | L-D9 | §6 and §7 fixed texts | *"the code"* becomes *"what is built"* in the `implementation ongoing` sentence, the `Pending change:` line and the `Being replaced by:` line, since a process design's build is the process documents |
| B15 | L-D10 | §6 *The review record*, *A diff specification* | a diff's reviews go on lines naming the diff, one per kind; rework and abandonment remove its lines |
| B16 | N-D3 | `SOURCES.elephant.md`, *Sections, not the whole document at once* | *"as they surface"* and *"at once"* become *"with that section"*, as §3 step 5 has it |
| B17 | N-X2, carried | `SOURCES.elephant.md`, *Every review runs on the Opus tier at high effort* | *"Why the effort setting is fixed at high is argued in `ELEPHANT.md`…"* becomes *"That the effort setting is high, rather than another, is not measured."* |
| B18 | N-T2 | §5 *Another review is recommended…* | *"A goldfish never comes back empty"* becomes *"rarely"*, which is what the cited entry supports |
| B19 | N-T4 | `SOURCES.elephant.md`, *Every specification carries a status…* | drop *"Why each status is set at a fixed event is argued in `ELEPHANT.md`…"*: the section gives no argument, and the entry's own evidence is the reason |
| B20 | N-T5 | §5 *What is kept of a review*, and its entry | one clause of reason: no record of a ruling is kept past its elephant, as none is of where an alternative was first rejected (§8, *An archive of rejected alternatives*); the entry names both sections |
| B21 | N-T6 | `SOURCES.elephant.md`, *The interview ends…* | the pointer moves from *The steps* to *It makes none of the author's decisions* (§2), where the argument is |

## C. To the backlog — recommended

- **C1, a new entry, *Rare paths `ELEPHANT.md` leaves open*:** L-G4 (abandoning restores a `finalised`
  document whose slices were voided), L-G5 (the elephant reworking a collided diff: its step-1 ruling,
  and what abandoning it restores), L-G6 (changing a signed-off diff with no collision), L-G7 (two
  process designs' `SOURCES.md` diffs built at once), L-G12 (a diff changing both of two repeated
  headings), L-G13 (a process document citing a section a process design's diff removes), L-G14 (an
  abandoned successor's `REVIEWS.md` block), L-G15 (who re-reviews a diff whose sign-off no longer
  stands), L-G18 (abandoning between sign-off and the sort), L-G19 (a diff re-pointed at a successor not
  yet `active`), L-U1 (the successor case of the voided sign-off cannot arise), L-O4 (`execute` does not
  check that a target's retirement review has run), and, from N-C3, that a diff cannot change a
  document's opening text without holding the whole document.
- **C2, a new entry, *`SOURCES.md` defects outside the elephant's diff*:** M-C2, M-C3, M-C4 (its three
  existing entries), M-C5 (*A vacuous check*), M-C6 (the two existing departures), M-C7, M-D2, M-D4,
  M-D6, M-O1, M-G1, M-G3, M-U1, M-U2, M-U4, M-R3, M-N1, M-N2, M-N4, M-N5, M-N6, M-N7, and N-C3 (its
  opening says no agent reads it for work, and a process design's elephant writes diffs of it).
- **C3, a bullet in *Inputs to cutting `ELEPHANT.md`*:** from L-N1 — renaming the outcomes changes what
  *accepted* means: `METHOD.md`'s *Accepted with a reason* is today not acted on, and the design's
  *accepted* is, so every use of the word must be found, not only the table.

## D. Recommended reject

| Finding | Why |
|---|---|
| L-C7, N-C1 (§1's account of today's names goes false once built) | a dated measurement does not go false (standing 4); §1 kept as reasoning (round H, *include*) |
| L-D2 (step 4's *immaterial* has no stated reason) | round D §3 A12 |
| L-O2 (amending a diff outside an elephant overrides §1) | the author's ruling (report E) |
| L-O3 (no skill named as setting `draft`) | round H E-A17 |
| L-G8 (a session ending without the `handoff` skill) | standing 3 |
| L-G9 (where the extract begins after a step-4 answer) | round D §5 A4: the reopening turn is the author's answer |
| L-G10 (does an accepted section or document finding become a ledger line) | §3 step 2: *"Any ruling that changes what the design says becomes a line in the ledger, whatever step it is made at"* |
| L-G16 (this file's own status line) | the backlog entry sets it by hand; open question 2 |
| L-U2 (`spent`, `CHANGELOG.md` named nowhere else) | report K: `REVIEWS.md` defines `spent` |
| L-N3 (a list answer as delegation) | ruling S4: a list answer rules each item |
| L-N5 (fold-in rewriting process documents' citations) | round E G-process-fold |
| L-N6 (the five states) | round H C-U6, checked |
| M-C1 (*Forty-one*) | kept word for word on purpose (report I C2); the backlog holds the count |
| M-C4, its new entry (*A reviewer from another family*, published yet departing) | the *Departs* field exists for exactly this |
| M-C6, the new entry's part | it uses the audit's other finding, as the departure itself says |
| M-D1 (*The three outcomes* against `METHOD.md`'s dispositions) | the design renames them once built |
| M-D3 (ClaudeFlows against elephant-goldfish) | two implementations; verified verbatim (report I) |
| M-G2 (published or reasoned entries carrying the other's support) | report I A3 |
| M-R1 (*elephant* used before defined) | `METHOD.md` defines it once built (§1) |
| M-R2 (terms that need `ELEPHANT.md`) | ruling Q3c: a reasoned entry names the design's section |
| M-N3 (pointers into `ELEPHANT.md` may dangle) | the design stays current once built (its opening) |
| N-B1 (`SOURCES.md` has no status line as it will be) | the status lines are a slice's work, not the diff's, and the apply script sets them aside |
| N-B3, the open-question and `PILOT.md` incidents, Klein and InvThink | the author's own accounts (report K); ruling F |
| N-N5 (reasoned entries that restate) | §6's rule reaches entries a process design writes |

## E. Recommended immaterial

| Finding | Why |
|---|---|
| L-C5 (the diff examples name `CORRIDORS.md`, which is `draft`) | illustration; it will be `active` |
| L-C11, M-D5 (never split, but re-cut) | a re-cut leaves no copy, which is what splitting does |
| L-D1 (*answered* for a checklist item and an interview finding) | different files, and both mean the author settled it |
| L-D3, L-D4 (`draft` at the root, *live*) | the exemption is stated where `draft` is defined |
| L-D5 (*side by side*, twice) | the flag clause says which |
| L-D6 (a turn spans records; the question tool's answer) | the builder's choice; §5 says the extractor keeps both |
| L-D7 (`SOURCES.md` reported *not designed* at step 1) | its diff is agreed at step 4 regardless |
| L-D8 (the map exists and does not) | step 1 means no record of which document covers what |
| L-O1 (*"as a diff of it"* narrowed later) | *"like any specification's"* brings the narrowing |
| L-R1, L-R2 (names before their sections) | §1 introduces each in passing |
| L-N4 (two elephants both in step 1) | one author, who is in both |
| M-C5, N-D2 (*The ledger review has a prompt of its own* as *measured here*) | the nearest of the three kinds; no rule turns on it |
| M-O2 (rows 59–60 under *"entered the method"*) | the preamble is kept word for word with its count |
| M-U3 (entries for rules not in `METHOD.md`) | §6 gives an entry to each rule a process design backs, wherever it lives |
| N-D1 (`METHOD.md` wins, but entries explain other rules) | as M-U3 |
| N-B2 (five entries the design never cites) | a citation is owed where evidence is used; the back-index reaches them |
| N-B3, the transcript measurements | dated facts the builder works from |
| N-X1 (two skills: *"words that have nothing in common"*) | a reasoned entry |
| N-P1 to N-P7 (evidence summarised in the design as well as the entry) | the design carries its own reasoning (§6); the figures are in the entries |
| N-T1 (*"designs habitually leave out"*) | the entry says honestly what is measured |
| N-T3 (*"even with a fresh context"*) | the departure says the same thing in the same file |
| N-N1, N-N2, N-N4 | no rule turns on any |
