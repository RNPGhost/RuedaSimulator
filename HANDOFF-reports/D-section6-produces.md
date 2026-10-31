# Section review — ELEPHANT.md §6, *What it produces* and *Where reasoning lives*

Reviewed: the two passages in `packets/D-section6-produces.md`. Dependencies read to resolve them:
`process/designs/ELEPHANT.md` (whole; note it contains §1–§7 only, although it cites §9 and §10) and
`METHOD.md` (whole, as it stands on disk).

## 1. BLOCKING

**B1 — A seam review owed "once it is" `active` has no trigger and no record.**
Passage: *"the agent dispatches a seam review between that process document and each `active` process
design that covers it; one not yet `active` is reviewed against the change once it is."*
Missing: who dispatches the deferred review, at what event, and where the obligation is held in the
meantime. The design becomes `active` when the `execute` skill closes its last slice (§6, *The status of
a specification*), possibly many sessions later; nothing in the passage or its dependencies records that
a direct change to a process document is waiting to be seam-reviewed against it. Neither the `execute`
skill, the `goldfish` skill, nor the handoff is given the duty. I would have assumed the `execute` skill,
when it sets `active`, asks whether any direct process-document change is pending review — but I would
have had to invent both the record and the step.

**B2 — The process/system classification has no rule for the cases the proposal does not cover.**
Passage: *"The agent's proposal of an elephant says which it is, and the author rules on that with the
proposal (§1). Any part of a change that falls on the other side is separate work, and goes to the
backlog (§3, step 5)."*
Missing: (a) who says which kind it is when the author calls for an elephant the agent did not propose —
§1 allows this (*"may call for one the agent did not propose"*), and then there is no proposal to say
which; (b) what happens if, after the ruling, the interview shows the change was classified wrongly, or
that the whole of it lies on the other side (the passage only covers "any part"). I would have assumed
the agent states the kind at that point and the author rules, and that a wholly misclassified elephant is
abandoned and restarted — both guesses.

**B3 — The SOURCES.md evidence is mandated as a diff, but a diff is only legal against an `active` target.**
Passage: *"an elephant on the process writes the evidence for its rules as a diff of `SOURCES.md`, in
that document's own entry format, since `SOURCES.md` takes diffs like any specification."*
Dependency (§6, *A diff specification, from sign-off to fold-in*): *"A diff is written only against an
`active` specification ... A specification that is not `active` takes no diff."*
Missing: what the process elephant does when `SOURCES.md` is not `active` (its status is nowhere stated
in what I was given; it may be `draft`, `finalised` or `implementation ongoing`, e.g. while another
process design's SOURCES diff is being built). Under the general rule it would have to move into the
elephant's directory as a `draft`, or the elephant would have to wait — neither is said, and a second
process elephant running at the same time would collide over it. I would have assumed the evidence
waits as a diff anyway, which the quoted rule forbids.

## 2. AMBIGUOUS

**A1 — "`METHOD.md` says" — a statement of fact about METHOD.md today, or a requirement on it?**
Passages: *"`METHOD.md` describes the two families as this table does, with the four layers dividing
both."* and *"It also says where the process documents' reasoning lives, in this line: > The process
documents carry only as much reasoning as following them needs..."*
Reading 1: present-tense facts about the current METHOD.md. Reading 2: requirements on what METHOD.md
must say once built (the design's header says it *"states what must be true"*). The same paragraph mixes
both: *"`METHOD.md` says that a map never explains why"* is true of METHOD.md now; the quoted reasoning
line does not appear in METHOD.md as read, and the families description differs (see C4). §1 marks its
METHOD.md wording with *"reads:"*; these passages give no such marker. I would have taken reading 2,
and would have had to check line by line which clauses are already true.

**A2 — "in the sections agreed for them at step 4": a requirement on step 4, or a description?**
Passage: *"So the non-goals and rejected alternatives the author settled are in the specification, in
the sections agreed for them at step 4."*
Reading 1: step 4 must agree a section for non-goals and one for rejected alternatives in every
specification. Reading 2: they go wherever step 4 happened to put them, if anywhere. Not said: what
happens when non-goals were settled but no section was agreed for them, nor where they go in a diff
specification (into the diff's sections, folding into the target?). I would have taken reading 1.

**A3 — Is other-side work sent to the backlog automatically, or by the author's ruling?**
Passage: *"Any part of a change that falls on the other side is separate work, and goes to the backlog
(§3, step 5)."*
Reading 1: no ruling — the agent sends it to the backlog. Reading 2: it is raised as step 5's
*"one question to the author"* and the author's only option is "separate work". Also unstated: who
decides that a part falls on the other side. I would have taken reading 2.

**A4 — "may change any document of the process family" — literally any, or only the process documents?**
Passage: *"the plans written from it may change any document of the process family."*
Reading 1 (literal): the table's process family includes the process designs, `SOURCES.md`, `ROADMAP.md`,
`REVIEWS.md` and `AGENTS.md`, so a plan may edit another process design or `SOURCES.md` directly. This
sits badly with *"A process design is kept current in one of two ways"* (neither of which is a plan) and
with `SOURCES.md` taking diffs. Reading 2: only the process documents (the "what executes" row). I would
have taken reading 2.

**A5 — May a slice edit its own process design while it is `implementation ongoing`?**
Passage: *"Once the slice has made the change, the same slice replaces that section with a one-line
pointer to the process document."*
Dependency (§6): *"One that is `implementation ongoing` cannot be changed until it is `active`."*
Reading 1: that dependency rule is only about elephants changing a document, so the slice's edit is
allowed. Reading 2: it is absolute, and the slice's edit is forbidden. Also unstated: when the drafted
section sits in a diff of a process design, whether the pointer replaces the section in the diff (which
then folds in as a pointer) or in the target. I would have taken reading 1, editing the diff.

**A6 — "This review is a row of `METHOD.md`'s table" — the existing row or a new one?**
Passage: *"This review is a row of `METHOD.md`'s table of when each review fires, and the `goldfish`
skill runs it."*
Reading 1: it is the existing row *"the author says the change is ready | seam reviews on whatever seams
were touched"*. Reading 2: a new, separate row must be added. I would have taken reading 1, but a
process document and a process design that covers it need not cite each other, so it is not clear it is a
"seam ... touched" in METHOD.md's sense.

**A7 — "one not yet `active`" — which statuses?**
Passage: *"one not yet `active` is reviewed against the change once it is."*
Reading 1: `draft`, `finalised` and `implementation ongoing`. Reading 2: also `abandoned`, which never
becomes `active`, so the obligation is silently void. Also: a `draft` design sits inside a running
elephant — does that elephant's own reviews absorb the change? I would have taken reading 1 and ignored
`abandoned`.

**A8 — Does a diff of a process design count as "a process design"?**
Passage: *"So an elephant on the process always produces a process design, however few documents it
touches"* and *"An elephant on the process produces a process design instead."*
Reading 1: a new process design file, always. Reading 2: a new one or a diff of an existing one
(which §4 allows: *"new or as a diff of an existing one"*). Also, it additionally produces a SOURCES.md
diff, which "instead" leaves out. I would have taken reading 2.

**A9 — Is the SOURCES.md diff one of the elephant's agreed documents?**
Passage: *"Its evidence is not a section of it: an elephant on the process writes the evidence for its
rules as a diff of `SOURCES.md`, in that document's own entry format."*
Reading 1: it is a document agreed at step 4, with sections, ledger lines, section reviews, a document
review and seam reviews like any other. Reading 2: an adjunct written alongside, not reviewed as one of
"the documents the design was written into". Further, a diff is made of whole sections with `**Change:**`
lines (§4); "that document's own entry format" may not be section-shaped, and the passage does not say
how an entry that is not a heading is added through a section diff. I would have taken reading 1.

**A10 — "the same kinds".**
Passage: *"The process family's documents fall into the same kinds as the system family's"*, with the
records row reading *"| — |"* for the system family.
Reading 1: both families share one set of kinds, one of which the system family leaves empty. Reading 2:
each kind is populated in both. Reading 2 is false by the table itself. I would have taken reading 1.

**A11 — "It produces documents" — which documents?**
Passage: *"An elephant never produces a process document or a check. It produces documents, and the
plans written from them change the rest."*
Reading 1: Layer 1 documents only (specifications, process designs, SOURCES.md diffs). Reading 2: also
the records it writes directly — backlog entries, `REVIEWS.md` rows, status and pointer lines added to
targets at close-out — which no plan writes, so "the plans written from them change the rest" would not
hold. I would have taken reading 1 and treated close-out's writes as an exception the passage omits.

**A12 — The fenced block for a drafted process document.**
Passage: *"Its text may be drafted in full inside the process design, in a fenced block so that its
headings are not the design's."*
Not stated: how a drafted document that itself contains fenced blocks (as skills and this design do, e.g.
the status-line examples) is enclosed, nor whether the drafted document's own sections are reviewed as
sections or only as one agreed section of the design (*"a document drafted in full is one of the process
design's agreed sections"*). I would have used a longer fence and reviewed it as one section.

**A13 — "owes evidence": always, or only where a rule has evidence?**
Passage: *"So only an elephant that changed the process owes evidence in `SOURCES.md`."*
Reading 1: every process elephant must produce a SOURCES.md diff. Reading 2: only for rules that have
evidence; a process elephant that only removes or reasons out a rule owes none. Also "changed the
process" versus "on the process": a process design not yet built has not changed the process. I would
have taken reading 2.

## 3. UNDEFINED TERMS

**U1 — "process family" / "system family".** *"The process family's documents fall into the same kinds as
the system family's"*. METHOD.md names its families *"About the system"* and *"About the work"*; the
passages never say which is which. The header's *"the *about the work* family"* suggests the mapping, but
the passages rely on it without stating it.

**U2 — "covers".** *"each `active` process design that covers it"*, *"the process design that covers it"*,
*"A process document that no process design covers"*. What makes a design cover a process document — it
mentions it? it was the design whose slices changed it? — is never defined, yet it decides whether a
review is owed.

**U3 — "specification".** Used both as system-only (*"Usually, specifications of the system"*,
*"as a specification does"*) and as including process designs (*"It is the specification of the
process"*) and `SOURCES.md` (*"takes diffs like any specification"*). Rules elsewhere stated of "a
specification" cannot be applied without knowing which.

**U4 — "evidence" versus "reasoning".** *"Its evidence is not a section of it"*, *"A specification's
reasoning is already in the specification"*, *"owes evidence in `SOURCES.md`"*. The non-goals and rejected
alternatives are reasoning and stay in the design; evidence goes to SOURCES.md. Where the line between them
falls is not defined, and decides what goes in which file.

**U5 — "one-line pointer".** *"replaces that section with a one-line pointer to the process document"*.
No wording or form is given (unlike the fixed-text `Pending change:` and `Being replaced by:` lines), and
it is not said whether it is one of the "pointer line[s]" §5's apply script sets aside when deciding that a
section has not changed.

**U6 — "that document's own entry format".** *"in that document's own entry format"*. SOURCES.md's entry
format is not given in anything I was allowed to read.

**U7 — "rule" / "its rules".** *"the evidence for its rules"*, *"a change to what one of them must hold
is a rule"*, *"which of its non-goals become rules in the process documents"*. What counts as a rule of a
process design is not defined.

**U8 — "typo".** *"and a typo owes nothing"*. Not defined, nor who judges it.

## 4. UNVERIFIABLE CLAIMS

**V1** — *"The process documents carry only as much reasoning as following them needs."* No check could
decide how much reasoning following a document needs.

**V2** — *"A change the author makes outside any session is caught by the scheduled full sweep
(`METHOD.md`)"*. METHOD.md gives no schedule (*"a schedule"*), and its sweep is *"every seam, and the
documents against the code"*; nothing shows it includes a process document against the process design
covering it, which may not cite each other.

**V3** — *"states what must be true of it, never what has to change to make it true"*. A judgement about
every sentence of a process design; no check is described.

## 5. CONTRADICTIONS

**C1 — Changes to existing documents are said always to be diffs; a non-`active` target takes none.**
Passage: *"a new specification whole, and a change to an existing one as a diff specification."* and
*"Through an elephant, which changes the process design first, as a diff of it like any
specification's"*.
Dependency (§6): *"A specification that is not `active` takes no diff. One that is `finalised` with no
slice started, or `draft` at the root, moves into the new elephant's directory as a `draft` ... and is
changed there directly"*; and *"One that is `implementation ongoing` cannot be changed until it is
`active`"*. (§4 itself qualifies: *"A change to an `active` specification is a diff specification (§6 says
what becomes of a change to one that is not)"*.) The passages state the diff route without the
qualification, so for a non-`active` target both cannot be true.

**C2 — A process design carries no evidence section; this process design does.**
Passage: *"Its evidence is not a section of it"*, and *"A process design is a file of its own, as this one
is (§1)"*.
This design's header: *"This file says how the thing works and what stands behind it."* and its body cites a
section of itself for measured evidence throughout, e.g. *"Models are measured as unable to reliably tell a
well-specified request from an underspecified one (§9)"* and *"Separate runs rarely find the same faults
(§9)"*. (§9 is not present in the file I was given, so I cannot quote its contents; the citations alone
show the evidence is placed in a section of this design.)

**C3 — Process designs are "read only by somebody changing the process"; this one is read by agents following it.**
Passage (quoted METHOD.md line): *"The rest lives in `SOURCES.md` and in the process designs, which are
read only by somebody changing the process."*
Dependency §3: *"This section is read by the agent running an elephant, which follows it step by step,
and by the author, who needs to know where it will stop for them."* and §6's opening: *"It is read by the
agent proposing the sort at close-out ... and by any agent that opens a specification and needs to know how
far to trust it."*

**C4 — METHOD.md's families are not described as the passage's table does.**
Passage: *"`METHOD.md` describes the two families as this table does, with the four layers dividing
both."*, with the table placing `AGENTS.md` as *"Layer 2, the map | the inventory, `AGENTS.md`, one
document for both"*.
METHOD.md: *"| **About the system** | ... | the four layers below |"* and *"| **About the work** | how the
work is done, what exists, where this is heading, what is next | this file, the inventory, direction, the
backlog |"* — the four layers belong to one family only, and the inventory is a member of "About the work",
not Layer 2 of both. True only if the passage is read as a requirement (A1).

**C5 — "An accepted one changes" a side; in METHOD.md an accepted finding changes nothing.**
Passage: *"The findings are ruled like any other, and the author decides which side an accepted one
changes"* — this review runs outside any elephant (*"since no elephant is running"*), so METHOD.md's
dispositions apply.
METHOD.md: *"| **Accepted with a reason** | the finding is right and the document stays as it is anyway,
for a reason that is written down |"*. Under that vocabulary an accepted finding changes no side; the
passage uses "accepted" in §3's sense (*"accepted — the finding is right, and it is acted on"*), which
METHOD.md calls *"Fixed"*.

## 6. NUMBERS WITHOUT PROVENANCE

none

## 7. CONCERNS YOU COULD NOT GROUND

**G1 — The SOURCES.md diff's lifecycle.** The passage says *"`SOURCES.md` takes diffs like any
specification"*, but a diff in §6 is built by slices of its own list and folds in *"only once the last slice
of its list closes"*. A SOURCES diff has no slices of its own; it is tied to another document's slices. I
could not find text that says how its status moves (`finalised` → `implementation ongoing` → fold-in), so
"like any specification" may not hold. Not grounded in the passages themselves.

**G2 — Scripts the process runs are in none of the table's kinds.** The table's list of process documents
is closed (*"nothing else is one"*), yet the extractor and the apply script (§5) execute as part of the
process. They are not checks either. I could not find where they belong; it may be intended that they are
outside the families entirely.

**G3 — Dependencies are missing.** ELEPHANT.md cites §9 and §10, which do not exist in the file; C2 rests
partly on what §9 is presumed to contain. I could not check it.

**G4 — `ROADMAP.md`'s "direction" as a record.** The table classes `ROADMAP.md`, *"holding the direction
and the backlog"*, as a record *"written directly as the process runs"* with no status and no diffs. The
direction (where the project is heading) sounds like intent rather than a running record; I cannot point
to text that proves it must be treated otherwise.

## 8. WHAT YOU WOULD BUILD

An elephant is classified at proposal as either a system elephant or a process elephant, never both, and
anything it turns up on the other side goes to the backlog. A system elephant produces Layer 1
specifications: a new one whole, or a diff beside an existing `active` one, each carrying its own non-goals
and rejected alternatives in sections agreed at step 4. A process elephant produces a process design — a
file in `process/designs/` that is the specification of the process, with a status, taking diffs, and
staying current once built — plus a diff of `SOURCES.md` holding the evidence for its rules; it never
writes a process document (METHOD.md, skills, prompts, hooks, PILOT.md) or a check itself, but may draft a
process document's full text in a fenced block that the slice building it later replaces with a pointer.
When a process document is changed directly instead, the `goldfish` skill, once the author says the change
is ready, seam-reviews it against each `active` process design that covers it, found by a manual search.
Reasoning lives in the specification for the system; for the process, it lives in the process design and
`SOURCES.md`, while the process documents keep only what following them needs.
