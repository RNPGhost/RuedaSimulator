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

Measure, don't assert — node and python are both on PATH. Write anything that may become a check in
node, since every check here is. Never put a script inside node -e or python -c, and never use a
heredoc for one. Write the script to a file and run it.
```
