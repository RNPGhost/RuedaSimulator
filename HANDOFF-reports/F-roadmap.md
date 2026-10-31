# Goldfish section review: three `ROADMAP.md` passages on `ELEPHANT.md`

Passages under review: P1, the section table of `ELEPHANT.md` (slice 7.1 entry); P2, the bullet *One check
enumerates the documents*; P3, the backlog entry *Inputs to cutting `ELEPHANT.md`*. They were read against
`process/designs/ELEPHANT.md` (whole, §1–§7, 1,484 lines, with no §8–§10 present) and `METHOD.md` (whole).

## 1. BLOCKING

**B1. P2: the check cannot be built without knowing how a file's "place" and "kind" are determined, or how
another check's list is read.**
Quoted: *"One table says, for every place and kind of Markdown file, which checks cover it or why none does.
A file the table does not account for fails, which catches a specification written where the status check
does not look; so does a check whose own hand-kept list names a file that does not exist, or leaves out one
the table says it covers."*
Missing: (a) what a "place" is: a directory, a glob, or a single path; (b) what a "kind" is, and how a
script tells a file's kind. `ELEPHANT.md` §6 says the root holds specifications (*"the specifications still
at the root until each is moved"*) next to non-specifications, so kind cannot be read from place alone;
(c) how the enumerating check gets at "a check whose own hand-kept list", which means either parsing other
checks' source or having each check export its list. Neither is said. Before writing any code you would
have to choose a table schema, and the passage's main claim (catching a misplaced specification) depends
on that choice. Assumed in the absence of an answer: rows keyed by path glob, with kind as a free-text
label that is never checked, and each check with a list exporting it for the enumerator to import. Under
that assumption a specification written at the root is accounted for by the root row and is **not**
caught.

**B2. P1: whoever writes the next section cannot tell whether a §8 heading is to be written.**
Quoted: *"Ten numbered sections, of which §8 is empty"*, and the §8 row: *"empty: a design states what
must be true, never what has to change to make it true, and the backlog entry Inputs to cutting
`ELEPHANT.md` holds the notes for the cut. The numbers are closed up once §9's form is settled"*.
`ELEPHANT.md` stops at §7, so the next piece of writing is §8 or §9. "Empty" has two readings: an `## 8.`
heading with nothing under it, or with the row's sentence as its only text; or the number reserved with
no heading at all, so the document goes straight from §7 to §9. Nothing says what §8 was for before it was
emptied, who "closes up" the numbers, when, or what the trigger "§9's form is settled" means. Assumed: no
§8 heading is written, the next section is numbered §9, and renumbering is deferred.

## 2. AMBIGUOUS

**A1. P1 §1 row: "the wording destined for `METHOD.md`".** Reading 1: §1 holds all the wording destined for
`METHOD.md`. Reading 2: §1 holds some of it. `ELEPHANT.md` §1 says *"Other sections of this design state
what else `METHOD.md` says"*, and §6 (*"in this line"*, on where reasoning lives) and §7 (the superseded
document exception, *"reads in full"*) both carry `METHOD.md` wording. I would have taken reading 2, but the
definite article supports reading 1.

**A2. P1: "Ten numbered sections" against "The numbers are closed up".** Reading 1: the decided structure
is ten sections and stays ten. Reading 2: it ends as nine, with §9 and §10 renumbered to §8 and §9. Under
reading 2 it is unclear whether the "§9" and "§10" in the table, and the many *"(§9)"* and *"§10"*
citations in `ELEPHANT.md` §1–§7, refer to the numbers before or after the close-up, and whether they are
rewritten. I would have taken reading 2 and left the citations as they are until the close-up.

**A3. P1 §9: "written in the evidence document's own entry format from the start" against "once §9's form
is settled".** Reading 1: the form is already settled (entry format, from the start), and "settled" refers
to something else, perhaps whether §9 stays a section at all. Reading 2: the form is still open. The
passage does not say what about §9's form is unsettled. See also C1.

**A4. P1: "one that survives is a checklist item carrying a disposition".** Survives what: the interview,
the writing, or the sign-off? `ELEPHANT.md` §3 step 4 says *"No checklist item may be open when writing
begins"*. So an open question cannot survive past step 4 as an open item. Reading 1: "one that survives"
means an omitted item with its reason. Reading 2: a question still unresolved, held as an open item. I would
have taken reading 1.

**A5. P2: "every place and kind of Markdown file".** Neither P2 nor `ELEPHANT.md` §6 (*"in the
repository"*) says whether this means files tracked by version control or every file on disk under the
repository root, including untracked and ignored files and any dependency directory. I would have taken
tracked files only.

**A6. P2: "a check whose own hand-kept list ... leaves out one the table says it covers".** Reading 1: only
checks with a literal list are tested. Reading 2: checks that find their files by pattern or directory walk
are also tested, against the table. I would have taken reading 1, which leaves pattern-based checks
unverified.

**A7. P2: "one document sat in it unnoticed for six slices".** Reading 1: a file that did not exist stayed
named in the duplication comparison's list, and nobody noticed because absent files are dropped silently.
Reading 2: a document was in the list but was never actually compared. The first sentence supports reading
1, but it does not say so.

**A8. P3: "notes for whoever cuts it into slices, deleted once the cut is made".** P3 also rules that
`ELEPHANT.md` is *"cut and built once ... then ... cut and built again"*. Reading 1: the notes are deleted
after the first cut, so the second cut has none. Reading 2: they are deleted after the second. I would have
taken reading 1.

**A9. P3: "as an `active` document is cut again at the author's request".** Reading 1: this ruling is the
request, so the second cut happens automatically once the first build's slices have improved the skills.
Reading 2: the author must still ask at the time, as `ELEPHANT.md` §6 says (*"An `active` document is cut
again when the author asks, and only then"*). Nothing says who decides that the skills have been "improved"
enough. I would have taken reading 2.

**A10. P3: "Its status line is set by hand at sign-off, since the skills that set it do not exist yet."**
This covers only `finalised`. Under `ELEPHANT.md` §6, `implementation ongoing` is set by `execute` *"when it
begins carrying out the first slice's plan"*, and `active` *"when the last slice closes"*. During the first
build those skills are the unimproved ones. Reading 1: later transitions are also set by hand. Reading 2:
they are skipped until a slice gives `execute` the status rules. Neither is stated. I would have taken
reading 1.

**A11. P3: "the outcomes renamed *accepted*, *immaterial* and *rejected*".** The passage does not give the
mapping. `METHOD.md`'s current names are *Fixed*, *Accepted with a reason* and *Rejected with a reason*.
Reading 1 (by order, which `ELEPHANT.md` §3 supports with *"under these names and in this order"*): Fixed
becomes accepted, and Accepted with a reason becomes immaterial. Reading 2 (by word): Accepted with a reason
becomes accepted. Under reading 1 the word "accepted" changes meaning, from "document stays" to "document
changes". I would have taken reading 1.

**A12. P3: "Status lines on every existing specification and on `SOURCES.md`, with `CORRIDORS.md` and
`FORMATIONS.md` as `draft`".** Only two values are given. The value for every other existing specification
and for `SOURCES.md` is not stated: `active`, or `implementation ongoing` where something is only partly
built. Which files count as an "existing specification" is not stated either. I would have assumed `active`
for all the others.

## 3. UNDEFINED TERMS

**U1. "disposition"** (P1: *"a checklist item carrying a disposition"*). In `ELEPHANT.md` §4 checklist
items carry a **state** (*"`open`, `answered` or `omitted`"*) and, when omitted, a reason. In `METHOD.md`
*disposition* applies to findings, and P3 renames the dispositions to outcomes. What a checklist item's
"disposition" is, is not defined.

**U2. "the duplication comparison"** (P2). It is named nowhere in `ELEPHANT.md` or `METHOD.md`.

**U3. "hand-kept list"** and **"cover"** (P2: *"which checks cover it"*). Whether "cover" means that the
check reads the file, asserts something about it, or is merely run with it present, is not defined.

**U4. "the refusal"** (P3: *"carrying the status rules, the diff rules, the collision check, the refusal,
fold-in"*). Several refusals appear in `ELEPHANT.md` §6: `execute` *"refuses without exception to start
while one of them is `implementation ongoing`"*; `slice` and `plan` *"stop on a `draft` one"*; a
collision means *"the diff does not start"*. Which one is meant is not said.

**U5. "The agent's memory note on how questions are put to the author"** (P3). Where this note lives, and
what "carries the same form" is judged against, are not defined.

**U6. "the home it gives imperative Two"** (P1 §1 row). `ELEPHANT.md` §1 calls it *"A pointer from
imperative Two"*. "Home" suggests something different: that the imperative moves into the elephant's
section.

## 4. UNVERIFIABLE CLAIMS

**V1. P2: "which catches a specification written where the status check does not look".** This holds only
for a specification in a place or kind the table does not account for. A specification written in an
accounted-for place, such as the root or a place with a "why none does" row, is not caught. As stated, the
claim cannot be turned into a check without B1's schema.

**V2. P2: "Measured: the duplication comparison's list drops an absent file in silence".** No date, commit
or method is given, so the measurement cannot be reproduced from the text.

**V3. P3: "A first run done poorly is repaired by the second, which finds only what is still untrue."**
`ELEPHANT.md` §6 limits this: *"What an earlier build added that the document does not mention is not
untrue, so a second cut leaves it in place."* A first run that did poorly by adding unspecified behaviour
is not repaired. Whether a run counts as "repaired" has no stated test.

**V4. P3: "measured at 1,674 characters against the 1,900 limit"**. See N1 and N2.

## 5. CONTRADICTIONS

**C1. P1's §9 against `ELEPHANT.md` §6, on where a process design's evidence lives.**
P1: *"9 | why is it like this? — written in the evidence document's own entry format from the start"*. This
makes the evidence a numbered section of `ELEPHANT.md`, which is a process design, in `SOURCES.md`'s entry
format.
`ELEPHANT.md` §6: *"Its evidence is not a section of it: an elephant on the process writes the evidence
for its rules as a diff of `SOURCES.md`, in that document's own entry format"*. The §6 sort table agrees:
*"a diff of `SOURCES.md` holding a process design's evidence | beside `SOURCES.md`"*.
Both cannot hold for `ELEPHANT.md` unless it is exempt. The only possible exemption is `ELEPHANT.md` §1's
*"This document was written before the elephant existed"*, and §6's rule is worded for *"an elephant on
the process"*. But neither text states that this exempts `ELEPHANT.md` from the evidence rule. P1's
*"once §9's form is settled"* suggests the author may already see the tension, but the text does not say so.

**C2. P3's status line against `ELEPHANT.md` §6, on who sets it.**
P3: *"Its status line is set by hand at sign-off, since the skills that set it do not exist yet."*
`ELEPHANT.md` §6: *"Each status is set at a fixed event, by the skill that runs that event. Close-out sets
`finalised`."*
`ELEPHANT.md` gives no exception for itself. Its preamble (*"`ROADMAP.md`'s slice 7.1 entry ... wins
wherever the two disagree, until this design is signed off"*) settles which wins up to sign-off. But this
act happens at sign-off, the moment that precedence ends, so the precedence rule does not clearly cover it.

## 6. NUMBERS WITHOUT PROVENANCE

**N1. "1,674 characters"** (P3). No date, commit or method is given. It is also unclear whether this is
the injected text as it is now or as it will be after the overriding rule changes. *"changes with the
overriding rule: measured at"* reads either way.

**N2. "the 1,900 limit"** (P3). It is not stated whether this is a documented harness limit, a measured
one, or a chosen budget.

**N3. "six slices"** (P2: *"sat in it unnoticed for six slices"*). There is no record of how it was counted.

*Not counted as findings:* "Ten" (P1) is a decision, though see A2. "nine" skills (P3) can be derived:
`METHOD.md` names `goldfish` plus *"Six more skills"*, which is seven, and adding `elephant` and
`close-out` gives nine.

## 7. CONCERNS YOU COULD NOT GROUND

**G1. P3: "its opening calls a goldfish the least-informed reviewer, which the interview reviewer is
not".** I could not ground why the interview reviewer is not the least-informed. `ELEPHANT.md` §5 gives it
*"the extract and nothing else, not the ledger and not the checklist"*, which looks no better informed than
any other goldfish. The skill text itself was out of scope.

**G2. P1's reason for dropping *Open questions* (*"one that survives is a checklist item"*) assumes a
checklist.** `ELEPHANT.md` itself had no elephant directory and no checklist (§1: *"the author ran the
process by hand, and `ROADMAP.md`'s slice 7.1 entry is the result"*). Where an open question about
`ELEPHANT.md` itself would survive is not grounded in any text I was given.

**G3. P3: "At `ELEPHANT.md`'s close-out".** Close-out in `ELEPHANT.md` §3 step 8 assumes a ledger, a ledger
review, drafts in an elephant directory and a `close-out` skill, and `ELEPHANT.md` has none of these. What
its close-out actually consists of is not stated in the passages. Only the preamble's condition (*"once
everything the entry records has been confirmed to be in this file"*) hints at a step like the ledger
review. P3's version of the step leaves that condition out.

**G4. P3: A11's renaming hazard.** If the rename goes by order, every existing record that says
"accepted" in `METHOD.md`'s current sense would silently flip meaning. I could not check whether such
records exist, because no file holding them was in scope.

## 8. WHAT YOU WOULD BUILD

`ELEPHANT.md` is the process design for "the elephant": the agent's structured interview of the author,
followed by section-by-section writing of the resulting design. It is to have ten numbered sections, §1–§7
as now written. §8 is deliberately empty because a design never says what has to change. §9 holds the
reasoning and evidence in `SOURCES.md`'s entry format, and §10 holds the alternatives. §8 is eventually
closed up so the document ends with nine. I would build a repository check that holds one table mapping
every location and kind of Markdown file to the checks that cover it, or to a reason none does. It fails on
any file the table does not account for, and on any check whose explicit file list names a missing file or
omits one the table assigns to it. Building `ELEPHANT.md` happens twice. It is first cut into slices with
today's skills, its `finalised` status written by hand at sign-off, and its slices change `METHOD.md` (the
elephant's section, the outcome names, the families, nine skills), the session-start hook, `goldfish`, three
new prompts, the new `elephant` and `close-out` skills, the extractor, the apply script, the status check
and the enumeration check, status lines on existing specifications, `REVIEWS.md` and `PILOT.md`. It is then
cut again with the improved skills, to fix only what is still untrue. At its close-out the slice 7.1 entry
shrinks to a one-line pointer.
