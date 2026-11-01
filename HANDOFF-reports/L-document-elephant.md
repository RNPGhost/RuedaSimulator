# Document review — `process/designs/ELEPHANT.md`

Prompt: `prompts/goldfish-document.md`. Read in full: `ELEPHANT.md` (1,829 lines), `METHOD.md` (dependency).
No other file was opened. Findings concern `ELEPHANT.md`; where `METHOD.md` is quoted, it is quoted only to
locate a passage of `ELEPHANT.md`.

---

## 1. SELF-CONTRADICTIONS

**C1 — How many reviews re-run without the author asking.** (§5 *The ledger review*; §3 *What goes back*;
§7 *The retirement review*; §5 *The interview review*)

§5, *The ledger review*: "This is the one exception to the rule that a review reads again what it has
already read only when the author asks (§3, *What goes back*)".

§3, *What goes back*, the very rule it cites, names two: "a review that has already run runs again only if
the author asks, except the ledger review before close-out (step 8), and the retirement review over a
successor's rewritten sections (§7)."

§7, *The retirement review*: "When sections of the successor are written again after it has run, it runs
again over those sections." The retirement review is given "the replaced document and every document of the
design", so on that run it reads the replaced document again.

§5, *The interview review*, a third case: "Reversing it means it is treated as carrying conversation: the
extractor is changed to read it, and the review runs again; its report replaces the first under the same
number". That re-reads the same turns, and neither §3's list nor §5's "one exception" includes it.

**C2 — Whether acting on a finding makes a review run again.** (§3 *What goes back*; §7 *The retirement
review*)

§3: "**Acting on a finding does not make a review run again by itself.** When it changes sections already
written, the agent lists each section it changed, and the author decides whether each is reviewed again".

§7, on accepting a retirement finding: "*carried*, which is accepting it: what the successor must say becomes
a ledger line naming the successor by its final path, and the section concerned is written again (§3, *What
goes back*)". §3 *What goes back* says sections written again "are written again at step 5, each with its
section review", and §7 says the retirement review "runs again over those sections". So acting on that
finding does make two reviews run again by itself. This also sits against §5, *The section review*: "**A
section is reviewed again only on a recommendation.**"

**C3 — When a draft first exists.** (§4 *What each file holds*, Drafts; §6 *A diff specification, from
sign-off to fold-in*; §7 *What replacing means*)

§4: "The design is written into drafts, one for each document agreed at step 4 ... Each is created when its
first section is written."

§7 table, for a `draft` or `finalised` document being replaced: "reworked in place: when step 1 ends it moves
into the elephant's directory, marked `draft`". §6: "One that is `finalised` with no slice started, or
`draft` at the root, moves into the new elephant's directory as a `draft` when the author rules to extend or
change it (§3, step 1)". §6, reworking a collided diff: "the diff moves into that elephant's directory as a
draft". In each case a draft exists from step 1, before any document has been agreed at step 4 and before
any section has been written.

**C4 — Whether an elephant's design is ever written into a document that already exists before it is built.**
(§6 opening; §1 *The definition*; §6 *A diff specification, from sign-off to fold-in*; §7 *What replacing
means*)

§6 opening: "**An elephant's output is documents, and none of its design is written into a document that
already exists until it is built.**"

§1: "a change to an existing specification goes beside it as a diff specification, which folds in only once
the change is built (§6)."

§6: a `finalised` or root `draft` specification "moves into the new elephant's directory as a `draft` ... and
is changed there directly". §7: such a document is "reworked in place ... each section of the successor
replaces its old counterpart there as it is written." So the design is written into an existing document,
which leaves at close-out with the design already in it and nothing built.

**C5 — The worked examples apply a diff to a document the design says cannot take one.** (§4 *What each file
holds*; §6 *The status of a specification*; §6 *A diff specification, from sign-off to fold-in*)

§4: "named `<target>.<name>.md` ... for example `CORRIDORS.shared-dancers.md`", together with the status
block "`> **Amends:** \`CORRIDORS.md\`, written against \`978ff5a\``". §6 repeats it: "`> **Pending change:**
\`CORRIDORS.shared-dancers.md\`.`"

§6, *The status of a specification*: "`CORRIDORS.md` and `FORMATIONS.md` are `draft` at the root". §6, *A
diff specification*: "**A diff is written only against an `active` specification** ... A specification that
is not `active` takes no diff."

**C6 — Which checks walk the whole repository.** (§4 *Where they live*; §6 *The status of a specification*)

§4: "The one check that walks the whole repository, `test/lineendings.js`, requires every Markdown file to use
LF line endings".

§6 requires a second check that "holds one table saying, for every place and every kind of Markdown file in
the repository, which checks cover it ... It fails on any Markdown file the table does not account for". Once
built, that one also walks the whole repository.

**C7 — A process design "stays current once it is built", but §1 has a section about how things stand today.**
(preamble; §1 *What the repository calls it today*; §8 *A section of what has to change*)

Preamble: "**It is the specification of the elephant, and stays current once it is built.**"

§1, *What the repository calls it today*: "**Two names are already in use for it, and neither is defined
anywhere.** Measured at `cf4e48c` ... So one skill uses two names for the same thing without saying so".
Also §1: "the author's only finding on reading it was that it never mentions the elephant at all." Once built,
§1 and §3 require both of these to be untrue (the skill is defined, and `PILOT.md` describes the elephant).

§8, rejecting a list of changes: "a list of changes turns false part by part as the slices land, which puts
something that expires inside a document that lasts (imperative Five)."

**C8 — Which document a citation that names no document refers to.** (§5 *Reading a document as it will be*,
Citations)

Same bullet: "It refers to the nearest document named earlier in the same sentence, and otherwise to the
document it sits in, with one exception: in a diff, and in any other draft of the same elephant, a citation
of the target, or one naming no document, means the target as it was at the commit the diff names."

A new document's draft is "a draft of the same elephant", so by the exception a bare `§2` inside it refers to
a diff's target and not to the new document it sits in. Where the elephant has diffs against two targets,
the exception names no rule for which target "the target" is.

**C9 — When a diff that changes citations of a replaced document folds in.** (§7 *From sign-off to
deletion*; §6 *A diff specification, from sign-off to fold-in*)

§7: "A diff that changes citations of the replaced document folds in in the commit that deletes it, never
earlier".

§6: "**A diff folds in only once the last slice of its list closes**, as that slice's last step."

The replaced document is deleted by "The last slice that builds the successor". The citing diff's own last
slice and the successor's last slice are not the same event, and neither passage gives way to the other.

**C10 — The form in which a finding the agent recommends acting on is put.** (§5 *How every review is run*;
§3 *The four points in the process*)

§5: "Each finding the agent puts to the author can be understood without the report. ... one the agent
recommends acting on is put as a question in the form §3 gives, the ways of acting on it being its options."
§3: "**Every question put to the author, at any step, has one form.** ... offers two or more candidate
answers".

§5, next paragraph: "One that would not, such as an inconsistency in machinery the author never sees, is put
as one line, with the agent's recommended outcome, in a list the author answers in one message". A one-line
finding recommended for acceptance is a finding the agent recommends acting on, and is not put in §3's form.

**C11 — Never split afterwards, but re-cut afterwards.** (§3 *When the design spans several documents*)

"The design is never written as one document and split afterwards" against, in the same subsection: "If the
author re-cuts the documents, sections move to their new home and no copy is left behind". A re-cut after
writing can take sections out of one written document into another.

**C12 — §8 says it names every rejected alternative, and it does not.** (§8 opening; §7 *The retirement
review*; §6 *The review record*; §3 *The four points in the process*)

§8: "An alternative, here, is a choice the design gives a reason against ... so that this section names every
alternative the design rejects."

Choices the design gives a reason against that appear in neither §8's entries nor its table:
- §7: "It reports in that direction only, since what the successor adds is the design itself." (a retirement
  review in both directions)
- §6: "The question carries no recommendation, because only the author knows the answer" (a recommendation on
  close-out's reading question)
- §3: *"you decide"* is not legal on "the clean-up offered when an elephant is abandoned, which deletes files
  that may never have been committed." The §8 table lists only "*"you decide"* as an answer to a *nothing
  covers this* claim".

**C13 — The order of pointer lines.** (§6 *A diff specification, from sign-off to fold-in*; §7 *From sign-off
to deletion*; §6 *The sort at close-out*)

§6: "Several pointer lines sit one after another, in any order."

§7: the `Being replaced by:` line goes "directly beneath its status line, after any `Pending change:` line".
§6's sort table calls that line a pointer line: "each gains its pointer line (§7)".

---

## 2. DIVERGENT DEFINITIONS

**D1 — *answered*.** (§3 step 2; §3 step 4; §4; §8 *The three outcomes for checklist items*)

Checklist state, §3 step 2: "**answered** once the rulings that settle it are lines in the ledger."
Interview-review outcome, §3 step 4: "**answered** — the finding is right, and the author settles it there and
then ... This is accepting it". §4 writes the second into the report files "in step 4's words: `answered`".
§8 rejects giving checklist items the finding outcomes because "A near-copy of the three outcomes findings get
would be harder to keep apart from them", and yet one word is used for both.

**D2 — *immaterial*.** (§3 *The four points in the process*; §3 step 4)

§3: "**immaterial** — the finding is right, but it is not acted on, for a stated reason". §3 step 4:
"**immaterial** — the finding is right, but it does not matter enough to act on." The second has no stated
reason, and it is the form used for interview-review findings, which are among the findings the first
governs ("from the interview review, each section review, ...").

**D3 — *live document*.** (§1 *The definition*; §1 quoted `METHOD.md` section)

§1: "a live document — one outside every elephant's directory whose status is not `draft` (§6). Other agents
read a live document while the design is under way". The `METHOD.md` text §1 prescribes: "It never writes the
design into a document other agents may be reading". `CORRIDORS.md` and `FORMATIONS.md` are "`draft` at the
root" (§6). By the first definition they are not live, and by the second they are, since other agents read
them.

**D4 — the `draft` status.** (§6 *The status of a specification*)

Status table: "`draft` | being designed, in an elephant's directory". Same section: "`CORRIDORS.md` and
`FORMATIONS.md` are `draft` at the root", and §6 *A diff specification*: "`draft` at the root".

**D5 — *side by side*.** (§7 *What replacing means*; §1)

The supported mode: "replaced side by side: it stays in force, what it says unchanged, until its successor is
built". The unsupported one, in the next paragraph: "**Running the old and the new side by side, switched by a
flag while the system moves from one to the other, is not supported.**"

**D6 — *turn*, and what names one.** (§5 *Where the extract begins and ends*; §5 *What the extractor keeps*)

"A turn is one message: an author turn is one record, and an agent's reply is every record from one author
turn to the next." But: "Each turn is named by its record's id", and the extractor "takes a transcript, the
turn to begin at and the turn to end at". For a handoff review the end is "the agent's reply to the last
author turn", which is many records with many ids. The answer to `AskUserQuestion` is to be "the `Author:`
turn after it", although it arrives as what §5 calls "a `user` record whose content is a list of
`tool_result` blocks", and not as "What the author typed".

**D7 — *designed*, and where `SOURCES.md` falls.** (§3 step 1; §6 *What it produces*; §6 *The status of a
specification*)

§3 step 1: "*not designed* for a document that is neither a specification nor a process design". §6 puts
`SOURCES.md` beside the process designs as Layer 1 and says it "takes diffs like any specification"; §6 *The
status*: "**`SOURCES.md` carries a status line, and so does every specification**". Step 1 would report
`SOURCES.md` *not designed* and offer it no option, although it carries a status and takes diffs.

**D8 — *the map*, and whether a record of what lives where exists.** (§3 step 1; §6 *What it produces*; §8
*A section of what has to change*)

§6 table: "Layer 2, the map | the inventory, `AGENTS.md`". §8: "the map's job, since it says what lives
where". §3 step 1: "this project has no record of what lives where, so the search is done by hand". §6: "until
the map records which design covers which process document".

**D9 — "the code" in fixed text that process designs must carry.** (§6 *The status of a specification*; §6
*A diff specification*; §7 *From sign-off to deletion*)

"Process designs carry one as well: their implementation is the slices that change the process documents."
The fixed sentence they must carry, with any variation failing the check: "Treat it as intent, and check the
code before assuming anything described here exists." Likewise the fixed `Pending change:` text ("parts of the
code may already follow it") and the fixed `Being replaced by:` text, both of which apply to diffs of process
designs and of `SOURCES.md`.

**D10 — a diff's entry in `REVIEWS.md`: a line, or rows.** (§6 *The review record*; §6 *A diff
specification*)

"A diff specification's reviews go into its target's block, on a line saying which sections they covered and
naming the diff". Then, at fold-in: "its document and seam rows replace the target's". When a diff is
abandoned or reworked, only "its line in the target's `REVIEWS.md` block is removed" / "so is the line naming
it". The document and seam rows have no stated fate.

---

## 3. ORPHANED RULES

**O1 — How a process design is changed through an elephant.** (§6 *What it produces*)

"Through an elephant, which changes the process design first, as a diff of it like any specification's".
Later in §6 a specification that is `finalised` or `draft` "moves into the new elephant's directory ... and is
changed there directly", and one that is `implementation ongoing` "cannot be changed until it is `active`".
The unconditional "as a diff of it" is narrowed by those rules, and the passage does not say so.

**O2 — The duty to propose an elephant, set aside for an amendment to a diff.** (§1 *When it is used, and who
decides*; §6 *A diff specification*)

§1: "At the start of any change that would produce new or changed intent ... the agent says whether it thinks
the change needs an elephant ... The author rules either way". §6: "**A diff being built may be amended in
place** ... It is made outside any elephant, since parts of the code already follow it". §6 rules out an
elephant for a change to intent without saying it is overriding §1.

**O3 — Who sets each status.** (§6 *The status of a specification*)

"**Each status is set at a fixed event, by the skill that runs that event.** Close-out sets `finalised`. The
`execute` skill sets `implementation ongoing` ... and `active` ... The clean-up of an abandoned elephant sets
`abandoned`". Other passages set a status at events that list does not include: step 1 moves a document in "as
a `draft`" (§6, §7); a collided diff "moves into that elephant's directory as a draft" (§6); abandonment moves
a document back "status included" (§3). Every draft "opens with a status line" (§4), but no skill is named as
setting `draft`.

**O4 — The ban on diffs starting once the retirement review has run is not in the check that starts them.**
(§7 *The retirement review*; §6 *A diff specification*)

§7: "From the review on, no diff pending against the replaced document may start being built". §6 lists what
the `execute` skill checks when a diff's first slice is about to start: it "names every other diff pending
against the target, and refuses without exception to start while one of them is `implementation ongoing`",
and runs the script's stops. Neither covers §7's condition. Until close-out the successor is in the elephant's
directory, so the replaced document carries no `Being replaced by:` line that would show it.

---

## 4. GAPS BETWEEN SECTIONS

**G1 — A checklist item set back to `open` after writing has begun.** (§4 `ledger.md`; §3 steps 2, 4, 5,
8)

§4: "Whenever the agent rewrites or deletes an entry, it reads the checklist again and sets back to `open` any
item the change leaves unsettled." Rulings can be rewritten at any step. §3 settles open items only at step
4 ("either it is answered, by reopening the interview, or it is omitted"); during writing "The agent never
proposes going back to the interview"; and step 8 item 1 requires "No checklist item is open". No step settles
an item reopened at steps 5 to 7, and the `close-out` skill "refuses while an earlier step is unfinished,
naming that step", with no step to name.

**G2 — Where a document reworked in place goes at close-out.** (§6 *The sort at close-out*; §7 *Naming the
successor*; §6 *The status of a specification*)

The sort table has rows for "a new specification's draft | its final path, in `content/specs/`", for a diff,
a process design and a successor, but none for a `draft` or `finalised` specification moved in from the root
and reworked or changed in place. §7: "A document reworked in place keeps its name". Neither says whether it
goes back to the root or into `content/specs/`. §6's check covers "the specifications still at the root until
each is moved", and no passage says when or by what a root specification is moved.

**G3 — The old sections of a document reworked in place that the successor does not replace.** (§7 *What
replacing means*)

"each section of the successor replaces its old counterpart there as it is written." The draft begins as the
whole old document. Nothing says what happens to old sections that have no counterpart: whether they are
removed, kept, or count as part of the design that the reviews read and the author signs off.

**G4 — Abandonment restores a `finalised` document whose slices have been deleted.** (§3 *The four points*,
abandonment; §6 *A diff specification*)

§6: when a `finalised` document moves in, "any slices already cut from it are void — deleted from the list of
slices, with any plan written for them". §3 on abandonment: "moves back to its old path any document the
elephant moved into it, as last committed before the move, status included". The document comes back
`finalised`, but nothing restores or re-cuts the slices.

**G5 — The elephant that reworks a collided diff.** (§6 *A diff specification*; §3 step 1)

§6: "the agent proposes an elephant to rework it (§1). If the author agrees, the diff moves into that
elephant's directory as a draft, renamed after it; the target's pointer line naming it is removed ... and so
is the line naming it in the target's `REVIEWS.md` block". (a) §3 step 1 offers options only for a
specification or process design, and "A diff is found beside its target, not as a document of its own", so
the step-1 ruling for this elephant is not defined. (b) If this elephant is abandoned, §3 moves the diff back
"status included", but nothing restores its pointer line or its `REVIEWS.md` line. §6's check fails "on a diff
its target does not name".

**G6 — Changing a pending `finalised` diff for any reason other than a collision.** (§6 *A diff
specification*; §3 step 1; §7)

The routes the document gives are: rework through an elephant when "A collision there" is found before
building; amendment "to settle a collision found at fold-in or to undo part of it" for a diff being built; and
abandonment while `finalised`. An author who wants to change a signed-off diff that has not started and has no
collision has no route: step 1 does not offer a diff as a document of its own, and "These rules are about a
whole specification".

**G7 — Two process designs' evidence diffs against `SOURCES.md`.** (§6 *What it produces*; §6 *The status of
a specification*; §6 *A diff specification*)

The `SOURCES.md` diff "is never cut into slices of its own: its status follows the process design's". The
check fails "on two changes against one target that are both `implementation ongoing`", and the `execute`
skill's refusal is keyed to "when a diff's first slice is about to start". Two process designs built at the
same time would put two `SOURCES.md` diffs into `implementation ongoing`. Nothing stops a second process
design's first slice, because its `SOURCES.md` diff has no first slice of its own.

**G8 — Interview turns from a session that ends without the `handoff` skill.** (§3 steps 2 and 3; §5
*Where the extract begins and ends*)

§3 step 3: "Each review covers the interview since the previous review, so every part of it is reviewed
once." Only a session that "ends through the `handoff` skill with the interview still under way" dispatches a
review of its own part. In the next session the extract begins at "this session's first turn of the
interview" unless the previous covered turn "is in the same transcript". The interview turns of a session that
ended any other way are reviewed by nobody.

**G9 — Where the extract begins after a step-4 *answered* finding reopens the interview.** (§3 step 4; §5
*Where the extract begins and ends*)

§3 step 4: answering a finding means "the interview stays open: once every finding has been ruled on, the
elephant goes back to step 2". §5: the extract begins at "the author turn that reopened the interview". No
passage says which author turn reopened it in this case: the answer, the last ruling, or the first turn after
the rulings. So no passage says whether the step-4 answers ("here is what I meant") are themselves reviewed.

**G10 — Whether an accepted finding from a section, document or seam review becomes a ledger line.** (§3
step 2; §7 *The retirement review*; §5 *The ledger review*)

§3 step 2: "Any ruling that changes what the design says becomes a line in the ledger, whatever step it is
made at". §7 says it explicitly for retirement findings only: "Either way of carrying it accepts the finding,
and becomes a ledger line." For accepted section, document and seam findings the document does not say, and
the answer changes what step 8 item 1 re-runs ("If any ledger line was added or changed ...").

**G11 — Rulings that remove something, and removed sections, under the ledger review.** (§3 step 4; §4
`ledger.md`; §5 *The ledger review*)

§5: "a ruling is found when the document says the same thing, in any wording; an agreed section is found when
a heading with that title exists in its document". §3 step 4: "only its new and changed sections are
proposed". A ruling to remove a section or a requirement names a document, so it is checked, but the document
cannot "say" an absence. And no passage says whether a section being removed is an agreed section, which would
be reported not found once it is gone.

**G12 — Changing two target sections that share a heading text.** (§4 Drafts)

§4 gives a chain form for targets with duplicate headings: "`**Change:** changed, under "Wheels" > "Shared
dancers"`". It also says: "**No draft gives two of its headings the same text.**" and each changed section
"sits under the target's heading for it". A diff that changes both of the target's "Shared dancers" sections
would have to hold two headings with that text, which the second rule forbids, so the chain form can only
ever reach one of them.

**G13 — A citing document on the process side whose cited section a process design's diff removes.** (§5
*Reading a document as it will be*, Citations; §4 Drafts; §6 *What it produces*)

§5: "changing the citing document is either part of this design, and the document joins the agreed documents
and is changed through a draft like any other, or separate work." If the citing document is a process
document, §4 says "**A process document is never the target of a diff.**" and §6 says "A change to the process
is never drafted against a process document". The first option cannot be carried out, and §3 step 5's "other
side of the line" rule does not apply, because both documents are on the process side.

**G14 — A successor abandoned after sign-off: its `REVIEWS.md` block.** (§7 *If the elephant is abandoned*;
§6 *A diff specification*; §6 *The review record*)

§7: "A successor abandoned after sign-off is abandoned as a diff is (§6)." §6's procedure removes "its line in
the target's `REVIEWS.md` block". §6 *The review record*: "**A successor** gets its own block". Nothing removes
that block.

**G15 — Re-reviewing pending diffs whose sign-off "no longer stands".** (§6 *A diff specification*)

"when a diff folds in ... the sign-off of each no longer stands until it is reviewed again against that
document". No passage says who dispatches that review, at what point, what an accepted finding may change in
a `finalised` diff (G6), what status the diff holds meanwhile, or what re-establishes the sign-off.

**G16 — The status of this document.** (preamble; §6 *The status of a specification*)

§6: "Process designs carry one as well", and the check covers "every file in `process/designs/`". This file
sits in `process/designs/` and has no status line: its first non-blank line after the title is "> **This is a
design document about how work is done here". Only close-out sets `finalised` ("Close-out sets `finalised`"),
and this file was "written before the elephant existed", so it never runs a close-out. §6 gives statuses to
"every specification written before the elephant existed" and to `SOURCES.md`, but not to process designs
written before it, and §3 step 1's "*no status line, counts as `active`*" covers only "a specification without
one".

**G17 — Status lines added to the system's specifications by a process design's plans.** (§6 *What it
produces*; §6 *The status of a specification*)

§6: "the plans written from it may change any document of the process family but its Layer 1 ones". §6 also
requires "every specification written before the elephant existed" to carry a status line, and every new
specification to sit in `content/specs/`. Those are changes to Layer 1 documents of the system family, which
the permission does not cover. §6 says only that a process elephant "may require something of every
specification, such as the status line", which is a requirement and not a route.

**G18 — Abandonment between sign-off and the sort.** (§3 *The four points*; §3 step 8; §6 *A diff
specification*)

§3: "The author may abandon an elephant at any point before sign-off" and "An abandonment asked for during
step 8 is carried out as the `elephant` skill says". Step 8 puts sign-off at item 3 and the sort at item 4. §6
allows abandoning a diff after sign-off "while it is still `finalised`", but between items 3 and 4 the drafts
are signed off, not yet marked `finalised`, and still in the directory. Neither rule covers that interval.

**G19 — Re-pointed diffs and the successor's status at deletion.** (§7 *From sign-off to deletion*; §6 *The
status of a specification*)

§7: the deleting commit re-points every pending diff at the successor. §6's check fails "on a diff whose target
does not exist or is not `active`", and `execute` "sets ... `active` when the last slice closes". The deletion
is "the last slice ... as its last step". No passage orders the two, so a re-pointed diff may for a time target
a successor that is still `implementation ongoing`.

---

## 5. UNREACHABLE OR UNUSED

**U1 — Re-reviewing a successor after a diff folds into the replaced document.** (§6 *A diff
specification*; §7 *The retirement review*)

§6, when a diff folds in: "the sign-off of each no longer stands until it is reviewed again against that
document, a successor by its retirement review (§5, §7)." §7: the retirement review "waits until that diff has
folded in. From the review on, no diff pending against the replaced document may start being built". A
successor reaches sign-off only after its retirement review, and after that review nothing can fold into the
replaced document, so a signed-off successor's sign-off can never be lost in this way.

**U2 — `CHANGELOG.md` and the state `spent`.** (§8 *An archive of rejected alternatives*)

"the review record's block, which outlives the plan with the state `spent`, and the change log,
`CHANGELOG.md`, already record them". Neither is named anywhere else in the document. §5 refers to "the five
`REVIEWS.md` defines" without naming them, so `spent` cannot be placed among them.

---

## 6. ORDER OF READING

**R1 — §2 names the two skills before §3 introduces them.** (§2 *Where these end up*)

"the `elephant` and `close-out` skills each state it for the points they run." Their existence, scope and
names are first given in §3 ("**Two skills carry it**"). §2 gives no forward reference.

**R2 — §3's list of review findings names reviews defined later, without a citation.** (§3 *The four points
in the process*)

"from the interview review, each section review, the retirement review, the ledger review, and the document
reviews and seam reviews". The retirement review is defined in §7 and first cited at the end of step 5; the
ledger, used in the same subsection ("Where a delegated ruling goes into the ledger, the ledger records it"),
is defined in §4 and first cited at step 1.

---

## 7. CONCERNS YOU COULD NOT GROUND

**N1 — `ELEPHANT.md`'s account of `METHOD.md` differs from the `METHOD.md` I was given, at points the document
does not mark as changes.** §3: "These are the three outcomes `METHOD.md` gives every finding, under these
names and in this order, and its overriding rule names none of them: *"A finding is a claim for the
**author** to rule on — never an instruction to whoever ran the review."*" The `METHOD.md` I was given reads
"to accept, reject or act on" and lists "Fixed / Accepted with a reason / Rejected with a reason". There, *Accepted with a
reason* means not acted on, while `ELEPHANT.md`'s *accepted* means acted on. The preamble says statements
about process documents describe them "once it is built", so this may be intended. Unlike the section-review
row, the new review row, the superseded-document rule and the reasoning line, though, no new wording is given
for the overriding rule or the dispositions table, so I cannot tell whether the quotation is a prescription
or a misquotation.

**N2 — `METHOD.md`'s "A review runs once and stops" against the automatic re-runs.** `METHOD.md`: "Nothing
re-runs it until a person has acted on the first one and asked for another." `ELEPHANT.md` re-runs the ledger
review, the retirement review and (on a reversal) the interview review without being asked (C1). For
rejections and immaterial reasons it says "`METHOD.md`'s rules ... make this exception". For the re-run rule
it says nothing about `METHOD.md`, only about its own §3. I cannot show this is a defect, because the
prescribed `METHOD.md` wording is not given.

**N3 — Whether a one-message list answer works as a delegated ruling.** §3 forbids *"you decide"* on "a
ruling at any of the four points", which include every review finding. §5 lets the author answer a list of
one-line findings, each carrying the agent's recommendation, in one message that "rules every item on the
list". In practice an answer of *yes* to such a list adopts every recommendation, which is close to
delegation. I could not find text that settles whether it counts as delegation.

**N4 — Two elephants both in step 1.** Step 1 notices overlap by reading "the ledgers of any other running
elephant", but an elephant has no directory or ledger until step 1 ends (§4). Two elephants in step 1 at once
cannot see each other. I could not find text saying this is accepted.

**N5 — Fold-in rewrites files that the design otherwise lets change only through particular routes.** §5: the
apply script "rewrites the result and every other `.md` and `.js` file outside `elephant/`" at fold-in. That
includes process documents, other process designs and `SOURCES.md`, and the fold-in may be a system
specification's slice. §6 says "a process design and `SOURCES.md` change only as this section says". The
mechanical rewriting of citations may be meant to fall outside that rule, but no passage says so.

**N6 — The five `REVIEWS.md` states.** §5 adds "a sixth state, `waived`, beside the five `REVIEWS.md`
defines", and §6 uses *reviewed* and *not run*. I was not given `REVIEWS.md`, so I cannot tell whether
*reviewed* and *not run* are among the five, or whether `waived` collides with one.

---

## 8. WHAT YOU UNDERSTOOD THIS DOCUMENT TO DESCRIBE

This is a specification of a step in a document-driven development process, called the elephant. It is the
structured conversation in which an AI agent questions a human author until a design is settled, and then
writes that design down one section at a time. Every point of decision stays with the author: starting, ending
the interview, each review finding, and sign-off. The agent proposes and argues; it does not decide. The
design is kept out of any document other agents rely on while work is under way: it lives in a per-elephant
working directory, with a checklist of topics and a ledger of rulings, and it leaves as a new specification, a
diff beside an existing built one, or a successor that will replace one. Context-free reviewer agents check it
at fixed points: the interview transcript, each section, a successor against the document it replaces, the
ledger against the documents, and each whole document and its seams. The document also defines the machinery
that follows: status lines, how and when diffs and successors fold in once built, a script that applies diffs
for review and fold-in, and the records kept or dropped at close-out. It is itself a process design, which
plans will carry into the live process documents (`METHOD.md`, skills, prompts, hooks), and it stays in force
as the specification of the process afterwards.
