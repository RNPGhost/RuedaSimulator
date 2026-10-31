# Goldfish section review — `process/designs/ELEPHANT.md`: opening block, *What `METHOD.md` says of the elephant*, *Where these end up*

Passages reviewed: P1 = the opening block (lines 3–25), P2 = §1 *What `METHOD.md` says of the elephant*
(lines 122–164), P3 = §2 *Where these end up* (lines 221–227). Dependencies read: the whole of
`ELEPHANT.md` (which, as read, ends at §7 line 1484; no §8, §9 or §10 exists in the file) and the whole of
`METHOD.md`.

## 1. BLOCKING

**B1 — P1: "this file" has no close-out that can be run.** P1: *"At close-out, once everything the entry
records has been confirmed to be in this file, the entry is cut to one line pointing here."* and
*"`ROADMAP.md`'s slice 7.1 entry ... wins wherever the two disagree, until this design is signed off."*
Close-out is defined only as §3 step 8, which presupposes a checklist, a ledger, a ledger review that
"has passed", drafts that "leave the elephant's directory", and working files to delete. §1 says this
document *"was written before the elephant existed, so the author ran the process by hand, and
`ROADMAP.md`'s slice 7.1 entry is the result."* This file is not in an elephant directory and has no
ledger. Missing: which items of step 8 apply to this document, what stands in for the ledger review
(the "confirmed" step), whether close-out sets its status to `finalised` (§6: *"Close-out sets
`finalised`"*), and whether `REVIEWS.md` gets rows for it as step 8 item 4 requires. Assumed: close-out
here means only (a) the author confirming, by reading, that the slice 7.1 entry's content is in this
file, (b) sign-off, (c) cutting the entry to one line, and (d) adding a `finalised` status line — but
that is a guess from nothing in the text.

**B2 — P1: "its evidence" does not exist to be added.** P1: *"whose plans ... add its evidence to
`SOURCES.md`."* The design cites its evidence throughout as §9 (e.g. §1: *"Models are measured as unable
to reliably tell a well-specified request from an underspecified one (§9)"*), but the file contains no
§9. §6 says the evidence is *"not a section of it"* and is written *"as a diff of `SOURCES.md`, in that
document's own entry format"*; no such diff is named for this design. A slice plan told to add this
design's evidence cannot locate it. Assumed: §9, when written, is the evidence, and a slice transcribes
it into `SOURCES.md` entries — which §6 says is exactly the translation it forbids (*"so that nothing is
translated or moved later: translation is where content is lost"*).

**B3 — P2: where the new section goes in `METHOD.md`.** P2 gives the full text of *"## The elephant"*
but not its position among `METHOD.md`'s sections, nor whether it sits inside one of the `---`-separated
blocks. Assumed: immediately after *"## The three dispositions"* and before the `---` preceding *"Rules
that follow from the layers"*, since it is about the work and not a layer rule.

## 2. AMBIGUOUS

**A1 — P1, what the slices change.** *"whose plans bring the process documents — `METHOD.md`, the
skills, the reviewer prompts, the hooks and `PILOT.md` — into line with it ... and add its evidence to
`SOURCES.md`."* Reading (a): an exhaustive list of what the slices touch. Reading (b): illustrative; the
design also requires a status check and a coverage check (§6), the extractor and the apply script (§5),
a `waived` state in `REVIEWS.md` (§5), an inventory pointer (§6), and §6 says *"the plans written from it
may change any document of the process family"*. The list also omits the hooks' *"wiring in the
harness's settings"* that §6's table includes. I would take (b), but reading (a) would leave checks and
scripts unbuilt.

**A2 — P1, who writes the evidence.** *"plans ... add its evidence to `SOURCES.md`."* Reading (a): the
slice plans write the evidence. Reading (b): per §6 the elephant writes a `SOURCES.md` diff, and a slice
only folds it in (*"it folds in once the rules it backs are built"*). I would take (b) by §6, but P1's
wording says (a). Which slice performs the fold-in of a `SOURCES.md` diff, which has no slice list of its
own, is also unstated.

**A3 — P1, "brought back into this file".** *"or is made directly in the process documents and brought
back into this file by a seam review (§6)."* Reading (a): a direct change is always reconciled into this
file. Reading (b): per §6, *"the author decides which side an accepted one changes"*, the review covers
only `active` designs, and *"a design the search misses is never reviewed against the change, and
nothing reports it"* — so the change may be undone on the process-document side, or never reach this
file. I would take (b); P1 states (a).

**A4 — P2 quoted text, scope of the definition.** *"It is the interview, a conversation in which the
agent questions the author until what is wanted is settled, and the writing that records it."* Reading
(a): exhaustive — the elephant is these two things. Reading (b): a summary; per §1 it also contains the
search, four kinds of review and close-out. An agent with only `METHOD.md` gets (a). I would take (b).

**A5 — P2 quoted text, work before the ruling.** *"No work on the change begins until they have ruled."*
§1 has *"No work on the change begins until they have, beyond what the agent needs in order to
propose."* Reading (a): `METHOD.md`'s wording forbids the investigation needed to form a proposal.
Reading (b): "work on the change" excludes that investigation. A `METHOD.md` reader has no way to reach
(b). I would take (b).

**A6 — P2 quoted text, changes inside a running elephant.** *"At the start of any change that would
produce new or changed intent ... the agent says whether it believes the change needs one"*. §1 adds
*"Work done inside an elephant already running needs no fresh proposal."*, which the quoted text omits.
Reading (a): each section written inside an elephant is a change producing new intent and triggers a
proposal. Reading (b): "the change" is the whole design. I would take (b); the quoted text alone gives (a).

**A7 — P2 quoted text, what the proposal says.** The quoted text has the agent say *"whether it believes
the change needs one, and why"*. §1 adds *"and, if it does, whether it changes the process or the system
(§6)"*, and §6 says *"The agent's proposal of an elephant says which it is"*. Reading (a): the `METHOD.md`
statement is the complete rule and the process/system part is the skill's. Reading (b): it is an
omission. I cannot tell which.

**A8 — P2 quoted text, endings.** *"The elephant ends at close-out, when the author signs the design
off."* Reading (a): close-out is the only ending. Reading (b): abandonment (§1: *"The author may instead
abandon it at any point"*) is also an ending, unmentioned. I would take (b).

**A9 — P2 quoted text, what the retirement review compares against.** See C5; the two readings are
"successor only" and "any of the design's documents".

**A10 — P2 item 2, placement and form of the clause.** *"so one clause follows its bold opening"*.
Reading (a): inserted immediately after **"Two. Argue. Agreement is the defect."**, before *"A design
nobody contested..."*. Reading (b): appended at the end of the imperative's paragraph. The text given is
also a full sentence, not a clause. I would take (a), inserted as a sentence.

**A11 — P2 item 3, when a document is "superseded".** *"An exception in the rule that a superseded
document is deleted."* The rule reads *"A superseded document is deleted, not kept."* Reading (a): a
document replaced side by side becomes superseded at sign-off — then *"deleted, not kept"* is violated
throughout its in-force period, and the exception (per §7's wording) only relaxes the commit-message
half. Reading (b): it is superseded only when the successor is built. Nothing defines "superseded"
against "replaced". I would take (b).

**A12 — P2, what becomes of this subsection after the slice.** §6: *"Once the slice has made the change,
the same slice replaces that section with a one-line pointer to the process document"*. Reading (a): the
whole subsection, including the reasoning for items 2 and 3 (*"without a pointer nothing would tell a
reader..."*, *"The clause does not reach a session automatically..."*), is replaced by a pointer.
Reading (b): only the block-quoted wording is. P1's *"stays current once it is built"* suggests (b). I
cannot tell.

**A13 — P2, the existing synonym in `METHOD.md`.** `METHOD.md` line 190: *"it goes back to the design
conversation."* §1 identifies two names for one thing as the problem. P2 says *"two of its other rules
refer to it"* and names neither this one nor what becomes of its wording. Reading (a): it stays as is.
Reading (b): it is renamed to "the elephant". I would take (b), from §1's diagnosis alone.

**A14 — P2 quoted text, "handed only that".** *"a reviewer that took no part in what it reviews, and is
handed only that."* Reading (a): given only the reviewed text. Reading (b): given the reviewed text plus
what it needs — §5's section reviewer is given *"one section, and what it depends on"*. I would take (b).

**A15 — P3, "the skill running the elephant".** *"The first and third each have a working side that the
skill running the elephant needs ... and the `elephant` skill states it too."* §3: *"Two skills carry
it"*; *"The `close-out` skill runs step 8"*, and signing off (one of the four points) is step 8. Reading
(a): only the `elephant` skill states the stopping points. Reading (b): both skills do, each for its own
points. I would take (b); the text names only one.

**A16 — P3, extent of the "working side".** *"which points stop for the author's ruling, and that
nothing goes past one without the author."* The first non-goal also says *"the author rules on what the
design says, on how the document is structured"* and *"The sections are agreed between the agent and the
author before any is written"*. Reading (a): only the four points move to the skill. Reading (b): the
structure and section-agreement rulings do too. I would take (b), uncertainly.

## 3. UNDEFINED TERMS

**U1 — P2 quoted text, terms a `METHOD.md` reader meets undefined.** The wording is to live in
`METHOD.md`, whose reader has only `METHOD.md`. It uses *"close-out"*, *"signs the design off"* /
*"sign-off"*, *"live document"*, *"waits beside it"*, *"folds in"*, *"successor"*, *"retirement review"*
and *"the process documents"*. None is defined in current `METHOD.md`; *"live document"* is defined only
in `ELEPHANT.md` §1 (*"one outside every elephant's directory whose status is not `draft`"*), and
*"retirement review"* appears in none of `METHOD.md`'s review tables (*"The four reviews"*, *"When each
review fires"*). P2 says *"Other sections of this design state what else `METHOD.md` says"* without saying
whether those cover these terms.

**U2 — P2 item 2, "the design conversation".** *"It is about the design conversation"*. §1: *"Two names are
already in use for it, and neither is defined anywhere."* P2 uses the undefined synonym in the passage
that settles the name.

**U3 — P3, "working side".** *"each have a working side that the skill running the elephant needs"*.
Defined only by the example that follows it; its boundary is A16.

**U4 — P1, "close-out" as applied to this file.** Used as though §3 step 8 applied; see B1.

## 4. UNVERIFIABLE CLAIMS

**V1 — P1.** *"once everything the entry records has been confirmed to be in this file"* — no procedure,
no reviewer, no record of the confirmation; nothing says what happens when something is not found.

**V2 — P1.** *"Where that entry says a document is *finished* when *"the author saying so"*"* and
*"`ROADMAP.md`'s slice 7.1 entry records what was decided"* — the entry was not given; neither can be
checked.

**V3 — P2 item 2.** *"the session-start hook sends only the bold opening of each imperative."* — a claim
about a hook not given to me.

**V4 — P2 quoted text and clause.** *"writing is where a question nobody asked tends to surface"* and
*"where nothing downstream will catch an idea nobody challenged"* — empirical claims; the evidence the
design points to (§9) does not exist in the file.

## 5. CONTRADICTIONS

**C1 — P2's count of rules referring to the elephant.**
P2: *"`METHOD.md` defines the elephant in a section of its own, and two of its other rules refer to it."*
§5 (lines 1003–1004): *"`METHOD.md`'s rule that rejections are recorded makes this exception for the
reviews inside an elephant."* — a third rule referring to it. Also §3 (line 239): *"`METHOD.md`'s line
naming the skills names both"* (the `elephant` and `close-out` skills).

**C2 — when the elephant ends.**
P2 quoted text: *"The elephant ends at close-out, when the author signs the design off."*
§1: *"It ends at close-out, when three things are true: what it wrote has left its working directory
..., the working files are deleted, and the author signs the design off."* §3 step 8 puts sign-off at
item 3, before item 4 (the sort is carried out), and: *"It ends when every draft has left the elephant's
directory, the author has signed off, and the working files are deleted."* Under the first, the elephant
has ended while its directory still exists; §4 says *"A directory under `elephant/` means an elephant is
running under that name"*.

**C3 — how a change to a specification is held.**
P2 quoted text: *"a change to a specification waits beside it until it is built, and only then folds
in"*.
§6: *"A specification that is not `active` takes no diff. One that is `finalised` with no slice started,
or `draft` at the root, moves into the new elephant's directory as a `draft` ... and is changed there
directly"*. For those specifications nothing waits beside them.

**C4 — form of process-document text drafted in the design.**
§6: *"Its text may be drafted in full inside the process design, in a fenced block so that its headings
are not the design's"*.
P2 drafts `METHOD.md`'s section, heading included (*"> ## The elephant"*), and the imperative Two clause,
as block quotes, not fenced blocks.

**C5 — what the retirement review lists.**
P2 quoted text: *"a retirement review lists everything the old one says that the successor does not."*
§7: *"It reports each claim the replaced document makes that none of them makes"* — *them* being *"every
document of the design"*. A claim carried into a design document other than the successor is listed
under the first and not under the second.

**C6 — P1's family and layer, against `METHOD.md` as it stands.**
P1: *"It belongs to the *about the work* family, and is one of that family's Layer 1 documents"*.
`METHOD.md`: *"About the system | ... | the four layers below"*; *"About the work | ... | this file, the
inventory, direction, the backlog"*. Today the about-the-work family has no layers. §6 says `METHOD.md`
is to change (*"with the four layers dividing both"*), so this holds only once built; P1 states it in the
present tense.

## 6. NUMBERS WITHOUT PROVENANCE

none (the one count in the passages, *"two of its other rules"*, is taken up as C1; *"slice 7.1"* is an
identifier whose referent was not given, covered by V2).

## 7. CONCERNS YOU COULD NOT GROUND

**G1.** The file read ends at §7; §8, §9 and §10 are cited (*"(§9)"*, *"What was considered instead is in
§10"*) but absent. P1's *"its evidence"* and the empirical claims in P2 rest on them. I can ground the
absence, but not whether it is intended at this stage.

**G2.** §6 requires *"Process designs carry one as well"* (a status line, *"the first line other than the
`#` title"*), and §1 defines a live document as one outside every elephant's directory whose status is not
`draft`. This file sits in `process/designs/` with no status line, while its design is unfinished — which,
read by its own rules, is a design being written into a live document. P1 explains why the process was
run by hand but not this. I could not ground whether the rules are meant to apply to the document that
defines them.

**G3.** P2 says the clause and the definition are read only *"by an agent that opens `METHOD.md`"*. The
proposal rule (*"proposing it is not [optional]"*) must fire at the start of every qualifying change,
before any skill is loaded. Nothing in the passages says what makes an agent that has not opened
`METHOD.md` propose. I could not ground this further than that sentence.

**G4.** P3: *"The second only informs somebody changing the elephant later"*. The second non-goal's cost
says the author notices a missing proposal *"because the work begins without the question having been put
to them, and can then call for an elephant"* — which reads like something the author-facing `PILOT.md`
would need. I could not ground that it must be there.

**G5.** P1: *"It contains no plan"*, yet P1 itself prescribes a dated action (*"the entry is cut to one
line pointing here"*). I am not sure this counts as a plan.

## 8. WHAT YOU WOULD BUILD

This file is the specification of a process step called the elephant: a recorded, author-steered
conversation that settles a design and then writes it down section by section, with fresh-context
reviews and explicit author rulings at fixed points. It is not built directly; once signed off, it is cut
into slices whose plans make the real process documents (`METHOD.md`, skills, prompts, hooks, `PILOT.md`)
and supporting checks and scripts conform to it, and it stays in force afterwards as the reference those
documents are reconciled against. Until sign-off, a `ROADMAP.md` entry overrides it. From these passages I
would build, in `METHOD.md`, a new *The elephant* section with the quoted wording, one added sentence in
imperative Two, and (from §7) an exception to the superseded-document rule; and I would leave §2's three
non-goals in this file, with the "agent stops at the author's ruling points" behaviour stated as positive
rules in the `elephant` skill (and, I assume, the `close-out` skill).
