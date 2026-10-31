# Section review — ELEPHANT.md §6, *The status of a specification* and *A diff specification, from sign-off to fold-in*

Prompt: `prompts/goldfish-section.md`. Read: the packet, `process/designs/ELEPHANT.md`, `METHOD.md`. Nothing else.

## 1. BLOCKING

**B1 — Which root files are specifications, and what status each pre-elephant document takes.**
Passage 1: *"and the specifications still at the root until each is moved, which it names, a list that only shrinks."* and *"`SOURCES.md` carries a status line, and so does every specification written before the elephant existed."*
Missing: the list the check "names" is never given, and nothing here says how to tell whether a root Markdown file is a specification. Only two are named (*"`CORRIDORS.md` and `FORMATIONS.md` are `draft` at the root"*). The value for `SOURCES.md`, and for every other pre-elephant specification, is not stated either. I cannot write the check's list or add the status lines without asking.
What I would have assumed: `SOURCES.md` is `active`, since *"`SOURCES.md` takes diffs like any specification"* (§6) and the check fails *"on a diff whose target does not exist or is not `active`"*. Every other root specification is `active`. Which files count, I would have had to guess.

**B2 — How the second check reads other checks' file lists.**
Passage 1: *"It fails on any Markdown file the table does not account for, and on a check working from its own list of files whose list names a file that does not exist, or leaves out one the table says that check covers, so that neither is skipped in silence."*
Missing: which checks "work from their own list of files"; how the second check gets those lists (imported from a module, read from a fixed file, parsed out of the check's source); and the table's format, plus how a row says "this check covers this". I cannot build this check without an interface to every other check.
What I would have assumed: each such check exports an array of paths, and the second check `require`s it.

**B3 — What the `execute` skill does when the pre-start check collides.**
Passage 2: *"A collision there, such as a section another diff has since folded into, means the diff does not start: it is still `finalised`, so it moves into an elephant's directory and is reworked as a draft, as a `finalised` specification is."*
Missing: which elephant. An existing one? A new one? If new, who proposes it, given that §1 says *"The agent must raise it; the author decides"*? *"As a `finalised` specification is"* refers to a step-1 move on an extend/change ruling. But a diff *"is found beside its target, not as a document of its own"* (§7), so no step-1 ruling ever targets the diff itself. Also missing: whether the target's pointer line stays or goes during the rework (if it stays, the check fails *"on a target that names a diff that does not exist"* beside it); whether the diff is still *pending*; whether it keeps its name, since that name contains the old elephant's name; and whether its `Amends:` commit is refreshed.
What I would have assumed: `execute` stops and reports. The author opts in to a new elephant. The diff moves into that elephant's `drafts/` under its old name, the pointer line is removed, and the commit is refreshed. Every part of that is a guess.

## 2. AMBIGUOUS

**A1 — What "the status line" is, physically.** *"It is the first line other than the `#` title, written `> **Status:** ` followed by the value"*. Reading 1: the first non-blank line after the title. Reading 2: literally the next line, so a blank line in between means no status line. A second, separate question: the `implementation ongoing` form wraps over two `>` lines, and a diff's `> **Amends:**` line follows directly. In Markdown, consecutive `>` lines are one paragraph, so the status line could be that whole paragraph or only its first physical line. I would take: first non-blank line, and the value parsed from that line alone.

**A2 — "Directly beneath" versus "one block-quote paragraph".** *"The target gains a line directly beneath its own status line"* and *"The whole sentence is fixed text, one block-quote paragraph however it wraps"*. If the pointer sits directly under a `>` status line with no blank line between, it is the same block-quote paragraph as the status line, not a paragraph of its own. Reading 1: a blank line (or a bare `>`) separates them. Reading 2: no separator, and "paragraph" is used loosely. I would take reading 2.

**A3 — Does the check walk `elephant/`?** The coverage list (*"It covers every file in `content/specs/` … every file in `process/designs/` … `SOURCES.md`; every diff beside a document it covers; and the specifications still at the root"*) does not include elephant directories. Yet the next part says *"Inside an elephant's directory the check tests only that each draft's status is one of the five."* Reading 1: the check also walks `elephant/*/drafts/`. Reading 2: that sentence only applies to files that are inside an elephant directory and covered for some other reason. Also unclear: does a draft with no status line fail there, and are the working files exempt because they are not "drafts"? I would take reading 1, with working files exempt and a missing status line failing.

**A4 — "every file in `process/designs/`".** Recursive or top level only? Markdown files only, or every file? I would take recursive, `.md` only.

**A5 — Granularity of the second check's table.** *"for every place and every kind of Markdown file in the repository, which checks cover it"*. If a row is a place such as "root, `*.md`", a new specification written at the root is already accounted for, so it is not caught, which defeats *"A specification written anywhere else is caught by a second check"*. If rows are individual files, every new file needs a table edit. I would take per-file rows at the root and per-directory rows elsewhere. That is a guess.

**A6 — "first slice" and "last slice".** *"when it begins carrying out the first slice's plan, and `active` when the last slice closes"*; *"once its first slice starts"*; *"once the last slice of its list closes"*. Reading 1: first and last in list order. Reading 2: the first to start and the last to close in time. These differ if slices run out of order. I would take reading 2.

**A7 — Does `execute`'s "sets `active`" apply to a diff, and does the fixed sentence?** Passage 1: *"The `execute` skill sets … `active` when the last slice closes."* Passage 2: *"The diff carries the status of the change — `finalised`, then `implementation ongoing`"*, after which it folds in and is deleted. Reading 1: a diff is never set `active`, and fold-in replaces that step. Reading 2: it is set `active` momentarily, then folds in. Separately: *"An `implementation ongoing` specification … Its status line carries one fixed sentence"*. Does that apply to an `implementation ongoing` diff? I would take reading 1, with the fixed sentence applying to diffs too.

**A8 — A `SOURCES.md` diff has no slice list of its own.** Passage 2: *"A diff folds in only once the last slice of its list closes"* and *"`implementation ongoing` once its first slice starts"*. The §6 sort table says it *"folds in once the rules it backs are built"*. Reading 1: "its list" means the process design's list, and the `SOURCES.md` diff's status follows that design's slices. Reading 2: it has its own list. I would take reading 1. Then nothing says which slice does the fold-in, or who sets its `implementation ongoing`.

**A9 — "under the same name".** *"At close-out a diff specification moves beside its target, under the same name"*. The same name as its draft in `drafts/`, or the same name as its target (impossible in one directory)? I would take the former.

**A10 — "the rules about pointers" and where an `abandoned` diff could be.** *"the rules about pointers do not apply to an `abandoned` diff"*. Which rules count: only the two pointer-naming rules, or also *"a diff whose target does not exist or is not `active`"*? And this sentence sits under *"Everywhere else"*, outside elephant directories. But a diff abandoned after sign-off *"is deleted"* (passage 2), and `abandoned` means *"a draft kept after its elephant was abandoned"*, which stays in the elephant's directory. So where is an `abandoned` diff that this exemption applies to? Reading 1: an author may move kept drafts out of the elephant's directory. Reading 2: the clause is vacuous. I would take reading 2.

**A11 — "Amended in place".** *"A diff being built may be amended in place, on the author's ruling … the sections the amendment changes get their section reviews, and the diff's remaining slices are cut again."* Several questions:
- Is this elephant work? If yes, it conflicts with §1, *"It never writes the design into a live document"*. If no, which skill runs it?
- Do the amended sections get only section reviews, or also document, seam and ledger reviews, and `REVIEWS.md` rows?
- For an amendment made *"to settle a collision found at fold-in"*: fold-in is *"that slice's last step"*, so what are "the remaining slices"? Is the closing slice reopened?
- For *"it is undone by amending it"*: how is a fully undone diff represented, given a diff *"holds only the sections that change"*?

I would take it as done outside any elephant, by the agent, with section reviews only.

**A12 — Cutting a draft on the author's word.** *"They stop on a `draft` one, say why, and go on only if the author tells them to"*. If they go on, what status does the draft get when `execute` starts its first slice (`implementation ongoing` on a `draft`)? And can this be used on `CORRIDORS.md` at the root, bypassing an elephant? I would take: allowed, with `execute` setting `implementation ongoing`.

**A13 — Re-cut versus a diff that is not yet pending.** *"A document with a diff or a successor pending against it is not cut again until none is"*. *Pending* starts only at close-out. That leaves two cases:
- An `active` target can be re-cut while a diff of it is still a draft in an elephant.
- A target can be cut, and only afterwards gain a pending diff, before its first new slice starts.

In both, the target becomes `implementation ongoing` while a diff is or becomes pending. Then the check fails *"on a diff whose target does not exist or is not `active`"*. Reading 1: the re-cut guard also covers drafts and the gap between cut and start. Reading 2: the check simply goes red. I would take reading 1. The text does not say it.

**A14 — Abandonment after a `finalised` specification was moved in.** *"any slices already cut from it are void — deleted from the list of slices, with any plan written for them"*. If the elephant is then abandoned, §3 moves the document back to its old path, and §7 says *"as committed when it moved"*, so `finalised` again. Are the deleted slices restored, re-cut, or simply lost? I would take: lost, re-cut on request.

**A15 — Abandoned diff and `REVIEWS.md`.** *"The author says so; the diff is deleted, the pointer line naming it is removed, any slices cut from it are void"*. §6 *The review record* put the diff's reviews *"into its target's block, on a line … naming the diff"*. Is that line removed? I would take yes.

**A16 — Can a specification lack a status line?** Passage 1: *"Every specification opens with a status line"*, *"so does every specification written before the elephant existed"*, and the check fails *"on a specification, process design or diff with no status line"*. Passage 2 provides for a target that *"has none"* (*"or directly beneath its title where it has none … a status line added later goes above it"*). §3 step 1 reports *"no status line, counts as `active`"*, and §7 says *"a specification with no status line yet"*. Reading 1: there is a transition period, not stated, during which status lines are absent. Reading 2: these cases are dead text. I would take reading 1.

**A17 — Who sets `draft`, and when.** *"Each status is set at a fixed event, by the skill that runs that event."* The list covers `finalised`, `implementation ongoing`, `active` and `abandoned`, but not `draft`. Passage 2 sets `draft` when a `finalised` specification moves into an elephant, and on a colliding diff. Which skill does this? I would take: the `elephant` skill, at the end of step 1.

**A18 — An `abandoned` specification that is to be extended or changed.** *"A specification that is not `active` takes no diff. One that is `finalised` with no slice started, or `draft` at the root, moves into the new elephant's directory"*. `abandoned` is not covered, and §7 rules only on replacing it. I would take: treated as a new document.

**A19 — "points to where this convention is stated".** *"The inventory, which an agent reads first, points to where this convention is stated rather than restating it."* Which document states it: this process design, `METHOD.md`, a skill? And is "this convention" the fixed sentence or the whole status-line convention? I would take: `METHOD.md`, the whole convention.

## 3. UNDEFINED TERMS

**U1 — "the list of slices" / "its list".** *"the list of slices already says what each delivers"*; *"deleted from the list of slices"*; *"the last slice of its list"*. Where it lives, its format, and whether there is one per specification or one per project are never stated, in this document or in `METHOD.md`.

**U2 — "place" and "kind of Markdown file".** *"for every place and every kind of Markdown file in the repository"*. Neither is defined.

**U3 — "a check working from its own list of files".** Not defined. It is not said which checks qualify (see B2).

**U4 — "untrue" and "what is built".** *"The `slice` skill compares the document with what is built and cuts only what it finds untrue"*. What counts as untrue, and what "what is built" is compared through (the code, the checks, the map, which does not exist), are not defined.

**U5 — "holding back until it was settled".** *"a diff or successor the author was holding back until it was settled may start"*. No mechanism for holding back is defined. Is it the `execute` refusal, or the author's own choice?

**U6 — "close-down of the last slice".** *"marking it `active` stays a step in the close-down of the last slice"*, against *"when the last slice closes"*. "Close-down" is never defined here. `METHOD.md` only says `execute` *"carries that out and closes it down"*.

**U7 — "match" (diff name to target).** *"its name must match its target"*. The pattern is not restated here. §4 gives `<target>.<name>.md`, but whether *match* means prefix equality, and how a re-pointed diff (§7) is treated, are not said.

## 4. UNVERIFIABLE CLAIMS

**V1** — *"Its status line carries one fixed sentence"* and *"The whole sentence is fixed text … and only the name varies."* None of the check's listed failures tests either fixed text. I cannot tell whether a check is meant to.

**V2** — *"a list that only shrinks"*. Nothing enforces it, and abandonment can make the list grow (C3).

**V3** — *"so that an agent that opens it and reads nothing else knows what to do"*. There is no criterion I could check.

**V4** — *"cuts only what it finds untrue"* and *"What an earlier build added that the document does not mention is not untrue, so a second cut leaves it in place."* No check is implied, and I could not write one.

**V5** — *"but it is discouraged"*. Nothing measures or enforces discouragement, beyond the three warnings.

## 5. CONTRADICTIONS

**C1 — The `slice` skill may cut only non-`active` documents, yet it cuts `active` ones.**
*"The `slice` and `plan` skills cut and plan only from a `finalised` or `implementation ongoing` document."*
versus
*"An `active` document is cut again when the author asks, and only then. … The `slice` skill compares the document with what is built and cuts only what it finds untrue; the document becomes `implementation ongoing` when the first new slice starts"*.
At the moment of a re-cut the document is `active`, which the first statement forbids. Separately, *"go on only if the author tells them to"* for a `draft` also breaks the first statement's "only".

**C2 — Step 1 "always" offers four options, yet offers none for an `implementation ongoing` document.**
Passage 2: *"One that is `implementation ongoing` cannot be changed until it is `active`: step 1 reports its status and offers no option for it"*.
versus §3 step 1: *"For each specification or process design found, the author rules on one of four options, always offered, with the agent's recommendation first"*.

**C3 — "A list that only shrinks" against documents moving back to the root.**
Passage 1: *"and the specifications still at the root until each is moved, which it names, a list that only shrinks"* and *"each exemption is deleted when that document's design resumes in an elephant and the document moves into its directory."*
versus §3: *"deleting the elephant's directory, drafts included, after first moving back to its old path any document the elephant moved into it"*, and §7: *"One reworked in place is moved back to its old path, as committed when it moved"*.
A root specification (for example `CORRIDORS.md`, with its `draft` exemption already deleted) that moves into an elephant which is then abandoned returns to the root. The list must grow, or the exemption must come back. Otherwise the check fails on the restored file, as a root specification it does not name, or as an unexempted `draft`.

**C4 — An elephant edits a check at step 1, but an elephant never produces a check.**
Passage 1: *"each exemption is deleted when that document's design resumes in an elephant and the document moves into its directory"*, together with the second check failing *"on a check working from its own list of files whose list names a file that does not exist"*, which forces the status check's root list to be edited at the same moment.
versus §6: *"An elephant never produces a process document or a check. It produces documents, and the plans written from them change the rest."*
The move happens when step 1 ends, inside an elephant, before any plan exists. So either the elephant edits a check, or the checks are red from the move until some plan runs. This holds only if "produces" covers editing an existing check. I read it that way, because the following sentence assigns all other changes to plans.

**C5 — Every fold-in collision is "settled by amending the diff", yet some collisions cannot be settled that way.**
Passage 2: *"The script stops on any of the conditions §5 lists, and the collision goes to the author, who settles it by amending the diff."* (and *"A diff being built may be amended in place … to settle a collision found at fold-in"*).
versus §4: *"the commit holding the target as it was when the diff was begun, which is not updated afterwards"*,
and §5's stop: *"when a section the diff changes or removes … has changed since that commit"*, and *"a level where only some headings do stops the script"*.
If the target's section has changed since the recorded commit, that stop fires again on every run, whatever the amended diff says. The only exception is an amendment that drops the section altogether. The recorded commit cannot be refreshed. A numbering stop is a property of the target, not the diff. Neither collision can be settled by amending the diff alone.

## 6. NUMBERS WITHOUT PROVENANCE

none

## 7. CONCERNS YOU COULD NOT GROUND

**G1** — A diff re-pointed at a successor keeps *"its recorded commit unchanged"* (§7). That commit holds the replaced document, so the pre-start stop *"has changed since that commit"* seems likely to fire on almost every section, sending every re-pointed diff back to a draft (B3). I could not establish whether that is intended, because the normalisation rules in §5 may or may not absorb it.

**G2** — Fold-in is *"that slice's last step"*. But fold-in can require author rulings (whether the document review runs again, §5), amendments with section reviews (A11), and new-ground citations. So the last slice may not be able to close for a long time, and its "close-down" (U6) is undefined while it waits. I could not find text saying the slice stays open, or what its status is meanwhile.

**G3** — *"refuses without exception to start while one of them is `implementation ongoing`"*, combined with §7's rule that the retirement review waits for a diff being built to fold in, and that no further diff may start after it. Together these may produce a waiting chain with no exit if a fold-in collision stays unsettled. I could not construct a definite deadlock from the text.

**G4** — The `execute` skill *"runs the script's stops (§5)"* outside any elephant. But §5 describes the script as applying *"the elephant's diff specifications to their targets, every diff in one run"*, and routes citation findings to *"new ground (§3, step 5)"*, a step that exists only inside an elephant. I could not find what `execute` does with a citation finding.

## 8. WHAT YOU WOULD BUILD

Every specification, process design and diff carries a one-line `> **Status:**` block quote under its title (or as its first line, for a diff). The value is one of `draft`, `finalised`, `implementation ongoing`, `active` or `abandoned`, with a fixed warning sentence on `implementation ongoing`. Skills move the status forward at fixed events:
- close-out sets `finalised`;
- `execute` sets `implementation ongoing` at the first slice and `active` at the last;
- abandonment marks kept drafts `abandoned`.

A status check walks `content/specs/`, `process/designs/`, `SOURCES.md`, diffs beside covered documents, and a named, shrinking list of root specifications. It rejects missing or unknown values, `draft` outside elephant directories (bar two named exemptions), diffs whose target is missing or not `active`, pointer lines and diffs that do not name each other, and two concurrently `implementation ongoing` changes against one target. A second check holds a table accounting for every Markdown file and every check's file list. A change to an `active` specification sits beside it as `<target>.<name>.md`, with a fixed `Pending change:` pointer in the target. It is checked against the target by the apply script before its first slice, may be amended while being built or deleted while still `finalised`, and is folded in by the same script as the last slice's last step. A non-`active` specification is never diffed: it is pulled into the elephant as a `draft` and edited directly, or waited on if `implementation ongoing`. The `slice` and `plan` skills work from `finalised` and `implementation ongoing` documents, and an `active` document is re-cut only on the author's request and only when nothing is pending against it.
