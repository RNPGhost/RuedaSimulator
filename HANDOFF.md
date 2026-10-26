# Handoff — `ELEPHANT.md`: review rounds E and F's new text, then write §8

> **Do not delete this file when you start.** Everything under *Not yet durable* exists nowhere else.
> **Delete it once each of those has a home** — at that point this file is spent.

## You already have the imperatives

A `SessionStart` hook injected the overriding rule and the eight imperatives. **It did not give you the
rest of `METHOD.md`** — open it now.

## Read these, in this order

1. **`METHOD.md`**, whole.
2. **`ROADMAP.md`**, *Slice 7.1 in detail*, including *What it produces* and *Staged, never written in
   place*. It wins wherever `ELEPHANT.md` disagrees with it.
3. **`ROADMAP.md`**, *Deferred*, the entry *"Separate the process documents from the content
   documents"* — it now gives process designs a folder of their own, `designs/`.
4. **`ELEPHANT.md`** — opening block and §1–§7 are written. Read all of it.
5. **`REVIEWS.md`**, and **`.claude/skills/goldfish/SKILL.md`** for the order findings are presented in.

## Where things stand

- **§1–§7 are written.** This session ran round E, the section reviews of round D's three passages (86
  findings), ruled and applied in 30 scripted edits; then wrote §7, reviewed it once (round F, 43
  findings), and applied the rulings and the reach of two author rulings in 19 more edits.
- **Nothing committed.** All ten fast checks green; `test/run.js` not run (no code changed);
  `test/visual.js` cannot run here.
- **Unreviewed text — what the next review should read:**
  1. **§7, whole** — rewritten in full after its only review.
  2. **§6 *What it produces*** — a process design is the live specification of the process; *A process
     design is kept current in one of two ways*; the closed list of process documents; never both.
  3. **§6 *A diff specification, from sign-off to fold-in*** — diffs only against `active`; an unbuilt one
     reworked in place; two changes pending against one target; abandoning a `finalised` diff.
  4. **§5 *Reading a document as it will be*** — the script's placing, stopping, numbering, citation and
     leaving-out rules.
  5. **§3** — the paragraph on arguing; step 1's not-designed bullet and its status and pending-diff
     report; step 5's end at the retirement review.
  6. **The opening block and §1 item 3**, and in `ROADMAP.md` slice 7.1's opening paragraph, its
     process-design and retirement bullets, two *Staged* bullets, and the folder entry.

  The rest of the change is wording from accepted findings: §4 *Drafts*, §5's table and *What is kept of
  a review*, §6's status check and sort table.

## What to do

**Recommended unit of work:** a section review of the six passages above, brought back together; then
write §8 (what has to change to build this — the list a slicer reads), one section, with its review.
The remaining cut after that: §9–§10, then the document review and close-out.

---

## Not yet durable — this is why the file survives

### The author's rulings in rounds E and F — home: `ELEPHANT.md`, applied; recorded here until reviewed

**Round E:**

- Arguing: the agent argues against making the change in prose and asks nothing; the author's answer
  that the work is wanted, at any step, settles it unless they reopen it; reimagining is the approach.
- The process documents are a closed list — `METHOD.md`, every skill, every reviewer prompt, every hook,
  `PILOT.md`; `SOURCES.md`, process designs, the inventory and the checks are not.
- **An elephant designs the process or the system, never both** (author). The line is what it designs,
  not which files its slices touch: a process elephant may require a status line of every specification.
- The paragraph *"A process document changes only through a plan, or by the author's own hand"* is
  deleted, as restating §1 (author's challenge); replaced by *"never produces a skill, a prompt, a hook or
  a check"*.
- A new process document drafted in a design is chosen at step 4 and replaced by a pointer once built.
- The apply script: numbers the levels the target numbers; a citation is a `§` number belonging to the
  document named before it; the diff cites old numbers, added sections by heading; unchanged means equal
  once numbers, citations, status and pointer lines are set aside; fold-in lists every section changed
  since the recorded commit and the author decides on a re-review; an outside document citing a removed
  section is new ground (reversing round D's *other*).
- **A diff is written only against an `active` specification** (author). A `finalised` one with no slice
  started moves back into the new elephant's directory as a draft; one `implementation ongoing` waits.
- **Two diffs against one target: design allowed, discouraged; never built at once** (author). Warnings at
  step 1, at a diff's first slice (the `execute` skill refuses while another is ongoing), and at fold-in.
  Applied on reading *"accept your suggestions"* as covering the mechanism — reversal word *hold*.
- §7 rulings Q1–Q5 as recommended: the old document stays until the successor is built and the last slice
  deletes it; the list covers every claim and every rejected alternative (the author expects most claims
  to be dropped); a fresh reviewer writes it (the retirement review, a sixth kind); abandoning undoes
  nothing; a kept process design is found at step 1 like any document.

**Round F:**

- **Process documents are like code** (author): the source of truth that executes the agents, as code
  executes the app; inherently live; no status; changed by a plan or by the author's hand.
- **Process designs are the specifications of the process, kept current** (author): a status, diffs, and
  replacement like any specification. A direct edit to a process document owes a seam review against
  each process design covering it — the author accepted the agent's challenge that it is owed, not
  offered. This removed the superseded-document exception, `rationale/` as their home, and *"Layer 3's
  lifetime"*.
- **A replacement is a large diff** (author): it may be designed while a diff is pending, is never built
  at the same time, and both are warned; the block lasts until the other folds in or is abandoned. A
  `finalised` diff may be abandoned; an `implementation ongoing` one cannot simply be deleted.
- **Only an `active` specification is replaced side by side** (author). A `draft` — `CORRIDORS.md` is
  `draft`, not `finalised` — or an unbuilt `finalised` one is reworked in place in the elephant's
  directory, and the retirement review still runs when the ruling is *replace*. A document not designed
  is offered no option; no status line counts as `active`; `implementation ongoing` waits.
- **The successor is `<target>.<name>.md`** until the last slice deletes the old document and renames it
  to its final name, agreed at step 4: the old name, or a new one where the concept has moved (the
  author's idea; the agent's use of the elephant's name accepted). Citations of the replaced document
  are listed and raised as new ground.
- The replaced document's pointer line is not a change to what it says (author). `METHOD.md`'s
  superseded rule gains a sentence for an elephant's replacement. Both the interview and the retirement
  review ask about rejected alternatives. A diff folding into a document being replaced: the author
  decides whether the retirement review runs again. **Running old and new behind a flag is a non-goal**
  (author: one author, no production system).
- Every other round-F finding as the agent recommended.

### Open questions — raise before they are needed

1. **Measure whether resuming a conversation keeps the same transcript file** — §5 relies on it. Needs
   the author to resume a conversation.
2. **Where a process design goes at close-out before the folder entry is carried out.** The sort table
   sends it to the `designs/` folder, which does not exist yet; specifications have the same gap, and
   §6's status check names the ones still at the root. Raise before §8, which lists the move.

### Rulings waiting for the section that is their home

| Ruling | Home |
|---|---|
| `METHOD.md`'s three outcomes renamed **accepted**, **immaterial**, **rejected**; `METHOD.md:175`'s *"fixed" by somebody* stays | §8 |
| The memory file on how questions are put to the author is kept until the new elephant skill carries the same format, then deleted | §8 |
| *"Not for new documents only"* is a rejected alternative | §10 |

### §8's list — gathered so far

- `goldfish/SKILL.md`: drop *"Cheap for a section review"*; every review on the Opus tier at high effort;
  its opening calls a goldfish the least-informed reviewer, which the interview review is not; the
  presenting agent shows a re-raised finding with its earlier ruling.
- `METHOD.md`: the elephant section (§1's wording); imperative Two's clause; *"Record the rejections"*
  changes — nothing is kept past close-out; the line on where reasoning lives (§6); the sentence added to
  the superseded-document rule for an elephant's replacement (§7); *What a change owes* gains the seam
  review owed after a direct edit to a process document (§6).
- `prompts/goldfish-document.md`: the narrowed design-is-wrong question, and line 7's exception.
- `goldfish/SKILL.md` again (author, round F): a finding or question put to the author after a review
  must be understandable without the report, and use no term that needs it — name the documents,
  never *"both documents"*.
- Rounds E and F: a third new prompt, `goldfish-retirement.md`; the `execute` skill's warnings and
  refusal on two changes pending against one target, and a replacement's last-slice steps (delete,
  rename, remove the `Replaces:` line); the status check's new failures (two ongoing; the four pointer
  failures; a successor's name); step 1's report giving each document's status and pending diffs;
  `ROADMAP.md`'s folder entry gains `designs/`.
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
- Rounds E and F: every review on Opus at high effort, following §5 rather than the goldfish skill's
  *"cheap"* (*cheap*); the dependency sections each reviewer was handed (*repack*); the N1 warning
  mechanism applied on reading *"accept your suggestions"* (*hold*); every successor is a design
  document, so nothing goes to `SOURCES.md` (*restore*); no `REVIEWS.md` record for the retirement
  review (*record*); the retirement review at the end of step 5, not a step of its own (*step*); the
  goldfish-skill change recorded in the §8 list (*elephant*); a process design's final path is the
  folder entry's `designs/` (*rationale*); a document reworked in place keeps its name unless renamed
  at step 4 (*rename*); an accepted seam-review finding edits the process design directly, as a
  conforming change (*elephant-only*).

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
- **Questions name the documents** (author). Never *"both documents"*, never a case without an example:
  three of round F's questions came back unanswerable for that reason.
- **A `ROADMAP.md` sentence written in the same pass contradicted the `ELEPHANT.md` sentence beside it**
  (round F, C1). After a pass that edits both, read the new `ROADMAP.md` text against the new
  `ELEPHANT.md` text.
- **Cut review packets by heading markers, each asserted unique**, never by line number: every edit
  moves the lines. The guard caught a wrong end marker this session.

---

## The message that starts the next session

```
Continue the Rueda Simulator methodology rework on branch engine/pathing_rework. Read HANDOFF.md
first — it is at the repository root and tells you what to read, in what order, and where things
stand. Do NOT delete it when you start; it says when to delete it.

You are continuing slice 7.1: ELEPHANT.md, the design for the elephant. §1–§7 are written. Your unit
of work this session: run a section review over the six passages HANDOFF.md names as unreviewed, and
bring them back together; then write §8, one section, brought back with its goldfish section review.
Do not write §9 and do not write a plan.

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

Measure, don't assert — node and python are both on PATH. Write anything that may become a check in
node, since every check here is. Never put a script inside node -e or python -c, and never use a
heredoc for one. Write the script to a file and run it.
```
