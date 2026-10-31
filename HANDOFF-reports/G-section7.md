# Section review — ELEPHANT.md §7, *From sign-off to deletion* and *What `METHOD.md` says of a replaced document*

Prompt: `prompts/goldfish-section.md`. Read to resolve dependencies: the whole of
`process/designs/ELEPHANT.md` and the whole of `METHOD.md`. Only the two passages are reviewed.

## 1. BLOCKING

**B1. The deleting commit's list leaves out `REVIEWS.md`.** *From sign-off to deletion* lists what
happens "In the same commit, whose message says what replaced what": the successor "is renamed to its
final name and its `Replaces:` line removed", and pending diffs are "renamed to match the successor's
final name where that differs". That is the whole list. But §6 *The review record* keeps rows that name
these files: "A new specification gets its own block" and "A diff specification's reviews go into its
target's block, on a line saying which sections they covered and naming the diff". §6 also says what
becomes of those rows at fold-in ("its document and seam rows replace the target's ... and the diff's
name is removed"). Nothing says the same for a deletion. I would have to ask before building the
deleting slice:
- what happens to the replaced document's block, which names a file that no longer exists;
- what happens to the successor's rows, which were recorded under `CALLS.timing.md`. §6 does not even
  say whether a successor gets "its own block", like a new specification, or goes into its target's
  block, like a diff;
- what happens to the lines naming a re-pointed diff by its old name.

What I would have assumed: in the same commit, the successor's rows move under its final name, the
replaced document's block is deleted, and re-pointed diffs' lines are renamed. I made this up; the text
does not say it.

**B2. When the successor's final name is the replaced document's own name, nothing distinguishes a
citation of the replaced document from a citation of the successor.** The passage says: "Every citation
of the replaced document in another document is found by the agent's search, once at the end of step
5, and raised as new ground", and "The deleting slice searches again before it deletes, and stops on any
citation it finds, raising each with the author." Its example is *"`CALLS.md` §2.5"*, and its own
example successor "becomes `CALLS.md`". Take a citing document whose citation was ruled part of this
design at step 5 and changed through a draft. The text does not say what the corrected citation is to
read:
- if it names `CALLS.md` with the successor's section number, it points at the wrong section of the
  replaced document until the deletion. The deleting slice's search would then find it as a "citation of
  the replaced document" and stop;
- if it names `CALLS.timing.md`, it points at nothing once the rename happens. That is exactly the
  failure the paragraph exists to prevent.

The text also does not say when that citing document's change folds in, relative to the deletion. A
diff folds in when "the last slice of its list closes" (§6), and that is a different list from the
successor's. I cannot write the deleting slice's search-and-stop rule without these answers. What I
would have assumed: corrected citations name the final name, they fold in in the same commit as the
deletion, and the deleting slice ignores citations that were already corrected. None of that is stated.

## 2. AMBIGUOUS

**A1. Where the line goes when there is no status line.** The text says: "directly beneath its status
line, after any `Pending change:` line, or at its top where it has none".
- Reading (a): "none" means no status line, and "at its top" means above the `#` title.
- Reading (b): "at its top" means directly beneath the title, as §6 says for `Pending change:` ("or
  directly beneath its title where it has none").

The two readings collide when a document with no status line already has a `Pending change:` line. That
line sits beneath the title, so "after any `Pending change:` line" and "at its top" pull in different
directions. §6 also says that for `Pending change:` "a status line added later goes above it", but no
such rule is given for `Being replaced by:`. I would have taken (b), with the new line after the
`Pending change:` lines.

**A2. Which name the existence check applies to.** "a `Replaces:` line naming one that does not" [exist].
The `Replaces:` line names two documents: "`CALLS.md`, and becomes `CALLS.md` when it does". When the
final name is a new one, the second name does not exist until the deletion.
- Reading (a): only the first name is checked.
- Reading (b): every name in the line is checked, so the check fails on every successor that has a new
  final name.

I would have taken (a).

**A3. What "match" means.** "a successor whose name does not match the document it replaces". The
naming rule is `<target>.<name>.md`.
- Reading (a): only the `<target>` part has to match the replaced document's file name without its
  extension.
- Reading (b): `<name>` must also be the elephant's name. After close-out the elephant's directory is
  gone, so the check has no way to know that name.

The passage also does not say how the check recognises a file as a successor in the first place. §6
recognises a diff "by its `Amends:` line", and §4 gives a successor no `Amends:` line. I would have taken
(a), with the `Replaces:` line as what marks a successor.

**A4. "Final name": a file name or a path?** "the successor is renamed to its final name" and "The second
name in the `Replaces:` line is the final name agreed at step 4". Elsewhere a successor's ledger lines
name it "by its final path" (§7 *The retirement review*, and §4). Take a replaced document at the root,
which §6 allows ("the specifications still at the root until each is moved"), with a new final name.
- Reading (a): the renamed successor stays in the replaced document's directory.
- Reading (b): it moves to `content/specs/`, where §6 says every new specification goes.

The examples are bare file names, so the `Replaces:` line does not settle it. I would have taken (a).

**A5. What counts as a "citation".** "Every citation of the replaced document in another document".
- Reading (a): §5 *Citations* defines "A citation is a section number written after `§`, outside code."
  On this reading, a bare mention of `CALLS.md` (in the inventory, say) is not a citation. It is never
  raised, and it dangles once a successor with a new final name is renamed.
- Reading (b): any mention of the document's name counts.

The example *"`CALLS.md` §2.5"* fits both. I would have taken (b), but §5's definition argues for (a).

**A6. What happens after the deleting slice stops.** "stops on any citation it finds, raising each with
the author." The text gives no options for the author's ruling and does not say how the stop ends:
- whether the deletion waits until the citing document is changed;
- whether the author may rule that the deletion goes ahead anyway;
- whether a citation sent to the backlog at step 5 ("If it is separate work, it goes to the project's
  backlog", §3 step 5) blocks the deletion forever.

I would have assumed that the deletion waits until the citation is fixed. The text does not say so.

**A7. The re-pointed diff's `Amends:` line, and what the script reads from it.** "its `Amends:` line
naming the successor followed by `re-pointed from` and the replaced document, its recorded commit
unchanged".
- The exact form is not given. §4's form is "`` `CORRIDORS.md`, written against `978ff5a` ``". It is
  not said where `re-pointed from` goes relative to `written against`.
- When the final name equals the replaced name, the line reads `` `CALLS.md` re-pointed from `CALLS.md` ``,
  which tells a reader nothing.
- The text claims that "the check before its first slice (§6) shows where". That check runs the
  script's stops, which compare against "the commit the diff names". It is not said whether the script
  reads, at that commit, the path in the `Amends:` line or the path after `re-pointed from`. When the
  final name is a new one, the former does not exist at that commit.

I would have assumed the script reads the `re-pointed from` path at the recorded commit.

**A8. "As committed when it moved": which text?** "One reworked in place is moved back to its old path,
as committed when it moved".
- Reading (a): the text in the commit that made the move. At that point the document is already marked
  `draft` (§7 table: "it moves into the elephant's directory, marked `draft`"). Restoring that text puts
  a `draft` outside an elephant's directory, which the §6 check fails on. The only exemptions are
  `CORRIDORS.md` and `FORMATIONS.md`, and "each exemption is deleted when that document's design resumes
  in an elephant and the document moves into its directory".
- Reading (b): the text as last committed before the move, with its old status.

The passage also says nothing of a move that was never committed. *The retirement review* covers that
case ("or as last committed before the move where the move has not been committed"); this passage does
not. I would have taken (b).

**A9. Is the move-back part of the clean-up the author may decline?** The passage says the document "is
moved back to its old path ... before the agent offers the clean-up (§3)". On that reading the move-back
is unconditional. §3 says "the agent offers one clean-up: deleting the elephant's directory, drafts
included, after first moving back to its old path any document the elephant moved into it", followed by
"The author may accept it or keep any of its files". That reads as if the move-back is part of the offer.
A document reworked in place *is* the successor's draft, so it is also unclear what the author keeps if
they keep that draft:
- the reworked text, marked `abandoned`, beside the restored original; or
- nothing, because the file was moved back.

I would have taken this passage's reading: restore the original first, and keep the reworked draft only
if the author asks.

**A10. "Only names its successor".** This is the required `METHOD.md` wording: "the commit that deletes
it only names its successor."
- Reading (a): the commit *message* only names the successor, in place of "say in the commit message
  what moved and where".
- Reading (b): the commit does nothing but the naming. That disagrees with the first passage, under
  which the same commit also renames the successor and re-points diffs.

The first passage says the message "says what replaced what", which names both documents, not only the
successor. I would have taken (a).

**A11. When the retirement review runs.** The second passage says "the retirement review carries what is
still true while the successor is written". §7 *The retirement review* says it runs "At the end of step
5, once the successor's last section is written".
- Reading (a): "while" is loose and means during the elephant.
- Reading (b): it is a second, earlier point at which the review runs.

I would have taken (a).

**A12. How far the citation search reaches.** "found by the agent's search" and "in another document".
The text does not say:
- which files are searched. The apply script covers "every other `.md` and `.js` file outside
  `elephant/`", and this search is not tied to that set;
- whether the search is by hand, as step 1's is;
- whether the successor and the elephant's other drafts count as "another document".

I would have searched every `.md` and `.js` file outside `elephant/`.

**A13. Which parts of the two fixed lines vary, and how they may wrap.** §6 says of `Pending change:`:
"The whole sentence is fixed text, one block-quote paragraph however it wraps, and only the name
varies." The two lines in this passage are called "a line of fixed text", but the text does not say:
- that they may wrap;
- that the `Replaces:` line has two varying names.

A check that matches the line literally depends on both answers. I would have applied §6's rule by
analogy.

## 3. UNDEFINED TERMS

**U1. "Replaced side by side", in the wording required of `METHOD.md`.** "The one exception is a document
an elephant replaced side by side". The term is defined only in ELEPHANT §7's table. The required
`METHOD.md` section on the elephant ("When it replaces a document, the new one is that document's
successor, and before sign-off a retirement review lists ...") does not separate side-by-side replacement
from rework in place. A reader of `METHOD.md` alone cannot tell which replacements the exception covers.
In particular, they cannot tell whether a document reworked in place, which is never deleted but
overwritten, is "superseded" under the rule at all.

**U2. "Partner".** "either line without a partner naming it back". This is loosely defined. I took it to
mean a `Being replaced by:` line and a `Replaces:` line that name each other. It is not said whether
both names in the `Replaces:` line must name the replaced document back.

## 4. UNVERIFIABLE CLAIMS

**V1.** "Nothing is lifted from the replaced document at deletion, because the retirement review has
already carried what was still true." The deleting slice runs "often much later". Nothing checks that
the replaced document is unchanged since the retirement review. Under §6 a seam review's accepted
finding may edit either side ("the author decides which side an accepted one changes"), so the replaced
document could change after the review. The retirement review re-runs only "over those sections" of the
successor that are rewritten, never over changes to the replaced document.

**V2.** "What the replaced document says does not change: it only gains the line naming its successor".
None of the four failures the status check gains tests this, and the passage names no other check.
Separately, nothing stops a new diff from being written against the replaced document after close-out:
§6 allows a diff against any `active` specification. That would give the document a `Pending change:`
line too, so "only gains" would not hold.

**V3.** This is the required `METHOD.md` wording: "the retirement review carried what was still true long
before". At deletion nothing can confirm that the review ran. Its report stays in the scratch directory
(§5: "Every other review's report stays in the scratch directory"), and §5 also says "`REVIEWS.md`
records ... nothing for the interview review, the retirement review or the ledger review".

## 5. CONTRADICTIONS

**C1. "Carried what was still true" against claims dropped on purpose.** The second passage says "the
retirement review carries what is still true while the successor is written". The required `METHOD.md`
wording says "the retirement review carried what was still true long before". But §7 *The retirement
review* lets the author drop a claim the review reports: "A claim is *dropped on purpose*, which is
ruling the finding immaterial". §3 defines immaterial as "the finding is right, but it is not acted on".
It also says "Most claims a successor leaves out were left out because they no longer bear on the
design", which allows that some were left out for other reasons. So a claim can be still true, reported,
and deliberately not carried. Then "carried what was still true" is false for that claim. It holds only
if "still true" is read as "what the author chose to keep", and the text does not define it that way.

## 6. NUMBERS WITHOUT PROVENANCE

none

## 7. CONCERNS YOU COULD NOT GROUND

**G1.** A successor placed "beside" a specification still at the root may not be covered by the §6 status
check at all. That check covers `content/specs/`, `process/designs/`, `SOURCES.md`, diffs (recognised by
`Amends:`), and "the specifications still at the root until each is moved, which it names, a list that
only shrinks". A successor is none of these, so the four new failures may never run on it. I could not
find text saying how the check finds successors, so I cannot say it is definitely missed.

**G2.** Order within the deleting commit. §6's check fails "on a diff whose target does not exist or is
not `active`". The re-pointed diffs' target is the successor, which the `execute` skill sets `active`
"when the last slice closes". The passage does not say whether that happens before the commit, or in it.
If it does not, the commit is red.

**G3.** The passage says "In the same commit", but `METHOD.md` says "Never commit or push unless asked",
and §6 says "When to commit is the author's call". It is unclear what the deleting slice does if the
author commits only part of the work. Nothing in the text says it conflicts, so this stays a concern.

**G4.** "This is how a diff is treated when another one folds into its target first." §6 renames and
re-points nothing in that case; it only warns, and checks before the first slice. The comparison may be
meant to cover only the "check before its first slice" part. I cannot tell how much it is meant to
cover.

## 8. WHAT YOU WOULD BUILD

When an elephant replaces an `active` document side by side, close-out puts the successor beside it under
the name `<target>.<elephant>.md`, marked `finalised`. Two fixed pointer lines are added and name each
other: `Being replaced by:` on the old document and `Replaces:` on the new one, the latter also giving
the final name. The status check gains four failures that keep that pair consistent. The old document
stays in force and textually unchanged until the successor's last slice. That slice then does four
things in one commit: deletes the old document, renames the successor to its final name, removes the
successor's `Replaces:` line, and re-points every still-pending diff of the old document at the
successor, keeping its old recorded commit so the pre-build check exposes the collisions. Citations of
the old document elsewhere are searched for by hand at the end of step 5 and raised as new ground. The
deleting slice searches again and stops if any remain. If the elephant is abandoned, a side-by-side
original is untouched, a reworked-in-place original is restored to its old path, and a successor
abandoned after sign-off is deleted as a diff is. `METHOD.md`'s rule "delete and lift in one commit"
gains a single exception for side-by-side replacement, because the lifting was done by the retirement
review long before the deletion.
