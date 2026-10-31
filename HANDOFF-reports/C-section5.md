# Goldfish section review — ELEPHANT.md §5: *How every review is run*, *The document review and the seam review*, *What is kept of a review*

Read: the packet, the whole of `process/designs/ELEPHANT.md` (headings run §1–§7; there is no §8, §9 or §10), and the whole of `METHOD.md`. Nothing else.

## 1. BLOCKING

**B1 — *How every review is run*: the scope of "every review" in the model rule is not stated.**
Quoted: "**Every review uses the Opus tier at high reasoning effort**" and "No review is given a cheaper model, a section review included".
The section sits under §5 "The reviews an elephant runs", but the paragraph immediately before it extends a rule explicitly to "every review's findings this way, inside an elephant or not", and this paragraph does not say either way. Whoever changes the `goldfish` skill must know before writing anything whether the model and effort settings go on every dispatch the skill makes (plan reviews, the scheduled full sweep, seam reviews after a direct process change in §6, reviews at fold-in) or only on the six elephant reviews. "Every review" read literally also takes in METHOD's artefact review, which is "a person looking at the artefact itself" and has no model.
What I would have assumed: every review the `goldfish` skill dispatches, inside an elephant or not, guessed from the neighbouring paragraph's "inside an elephant or not" and from the section's title "How every review is run".

**B2 — *The document review and the seam review*: the added prompt question has no place in the report and no case for a document that states no purpose.**
Quoted: "Its prompt asks one question no other review asks: does the design, as specified, fail the purpose the document itself states?"
Missing: (a) which category of the report an answer to this question goes under — a new heading, an existing one, or the closing account — although *How every review is run* fixes the shape as "a heading for each category of finding"; (b) what the reviewer does when the document states no purpose, or states it only by pointing elsewhere (this document's own header points at `ROADMAP.md`'s slice 7.1 entry, which "wins wherever the two disagree"), since "The reviewer is given only the document"; (c) for an applied diff, whether "the purpose the document itself states" is the target's stated purpose or the diff's.
What I would have assumed: a new category heading; report "no purpose stated" as a finding; use the target's statement for an applied diff.

## 2. AMBIGUOUS

**A1 — "no part of the conversation".**
Quoted: "one fresh reviewer, no part of the conversation".
Reading 1: the reviewer is given none of the conversation. Reading 2: the reviewer took no part in the conversation (as §5's opening says, "a reviewer that took no part in what it reads"). Reading 1 contradicts the interview review (see C1). I would have taken reading 2, because reading 1 makes the interview review impossible.

**A2 — Which document a finding names when the reviewer read an applied or copied document.**
Quoted: "names every document it concerns rather than saying *both documents*".
The ledger, document and seam reviewers read "the applied document", written "to the scratch directory", and citing documents are read as "copies in the scratch directory". A finding's quote then comes from a scratch copy. Reading 1: name the target (the live path). Reading 2: name the diff draft under `elephant/<name>/drafts/`, where the text will actually be changed. Reading 3: name the scratch copy. Nor does it say whether a document is named by path from the repository root, as §4 requires inside the checklist and ledger. I would have taken reading 1 with the root-relative path, guessing from §4's "A ledger entry names the document a ruling will reach — the target's path".

**A3 — Whether a finding put to the author is "a question put to the author".**
Quoted: "**Each finding the agent puts to the author can be understood without the report.** It quotes the text it concerns, names every document it concerns rather than saying *both documents*, and uses no term that only the report defines."
§3 says "Every question put to the author, at any step, has one form" (one-sentence issue and why it matters, background, two or more candidate answers, recommendation first). Reading 1: a finding is such a question, so it also carries all of that form, with the three outcomes as the candidate answers. Reading 2: the three criteria here are the whole requirement for a presented finding. I would have taken reading 1, because §3 also says "The agent recommends an outcome for each". Separately: it is unclear whether the three criteria define "can be understood without the report" exhaustively or are examples of it.

**A4 — Whom "A review is not run more than once to find more" binds.**
Quoted: "**A review is not run more than once to find more.**"
§3 *What goes back*: "a review that has already run runs again only if the author asks". `METHOD.md`: "Nothing re-runs it until a person has acted on the first one and asked for another." Reading 1: it binds only the agent's own initiative; the author may still ask for a second run of unchanged text. Reading 2: it binds everyone, so the author's request for a second run of unchanged text "to find more" is refused, and only re-runs over changed text (or the listed exceptions) are allowed. The passage also does not define what separates a re-run "to find more" from the ledger review's mandated re-run before close-out or the interview review's re-run after an extractor reversal. I would have taken reading 1.

**A5 — What happens to a re-raised finding.**
Quoted: "when a later review in the same elephant raises one again, the agent shows it with its earlier ruling."
Reading 1: it is put to the author again for a fresh ruling, the earlier ruling shown as context or as the recommendation. Reading 2: the earlier ruling stands and the finding is reported as already disposed. Reading 2 risks conflicting with "Each finding is ruled on separately" (§3) and `METHOD.md`'s overriding rule ("item by item"). I would have taken reading 1.

**A6 — "The three new prompts take the shape of the existing ones" against reports with headings that are not findings.**
Quoted: "The three new prompts take the shape of the existing ones: a heading for each category of finding, each finding quoting the text it concerns, *none* under a category with nothing in it".
The ledger review's report has "*found*, each entry with the passage it relied on quoted ... and not ruled on", and the retirement review's has a "*found*" heading likewise. Reading 1: the shape lists minimum features, and extra non-finding headings are allowed. Reading 2: the shape is exhaustive, so *found* must be a category of finding. Also unstated: whether *none* is written under an empty *found*. I would have taken reading 1.

**A7 — Which documents count as "the design's documents" for the document and seam reviews.**
Quoted: "**Each document the design was written into gets its own document review**" and "**Every pair of the design's documents gets a seam review**".
An elephant on the process "writes the evidence for its rules as a diff of `SOURCES.md`" (§6), and a process document may be "drafted in full inside the process design, in a fenced block" (§6). Reading 1: the `SOURCES.md` diff is one of the design's documents, so it gets an applied document review and seams with each other document; a fenced draft is part of its process design only. Reading 2: only the documents agreed at step 4 count, and the `SOURCES.md` diff is reviewed only if agreed there. Neither passage nor step 4 says which. I would have taken reading 1.

**A8 — Whether the seam list is exhaustive.**
Quoted: "**So does each seam between one of the design's documents and another document that cites a section the design changed**, as `METHOD.md` requires of any change."
`METHOD.md` says the seam review "fires when either side of a citation changes". A design document that adds or changes a citation of an unchanged outside document changes one side of that citation, but the outside document does not cite the design. Reading 1: the list is exhaustive, and that seam is not reviewed. Reading 2: METHOD's broader rule still applies and adds it. I would have taken reading 1, because the passage claims to be what METHOD "requires".

**A9 — "a section the design changed" for added, removed and replaced sections.**
Quoted: "another document that cites a section the design changed".
Unstated whether "changed" includes removed sections (citations of which §5 *Citations* raises as new ground, adding "Its seam with the design is reviewed at step 7 either way" — elsewhere, not in this passage), and whether, for a successor, every outside document citing the replaced document counts as citing "a section the design changed". §7 has those citations found and "raised as new ground"; the passage does not say whether a seam review between them and the successor runs. I would have taken: removed counts; for a successor, every outside document citing the replaced document gets a seam review against the successor.

**A10 — "kept only until close-out" when there is no close-out.**
Quoted: "**Rejected and immaterial findings are kept only until close-out.**" and "each later handoff carries them forward".
An abandoned elephant never reaches close-out (§3: "Nothing is signed off"). Unstated whether handoffs drop them on abandonment, or carry them while kept files remain. I would have assumed they are dropped on abandonment.

**A11 — The exception to METHOD's recording rule: wording, and whether it covers immaterial findings.**
Quoted: "`METHOD.md`'s rule that rejections are recorded makes this exception for the reviews inside an elephant."
(a) §1 and §7 of the design give the full wording of every other change to `METHOD.md`; this one gives none. Reading 1: the slice's plan writes the wording. Reading 2: the wording is owed here and missing. (b) The passage drops "Rejected and immaterial findings" at close-out but names an exception only to the rule "that rejections are recorded". `METHOD.md` defines its immaterial-equivalent disposition as "**Accepted with a reason** | the finding is right and the document stays as it is anyway, for a reason that is written down". Reading 1: a reason written in a handoff and later deleted satisfies "written down". Reading 2: the exception must also cover immaterial findings, and as worded does not. I would have taken reading 1 for (a) and reading 2 for (b).

## 3. UNDEFINED TERMS

**U1 — "tier", "the Opus tier", "the tier below", "moving off the tier".**
Quoted: "the model the harness ... calls `opus`", "the tier below wrongly flagged nearly twice as many sound requirements", "moving off the tier is". "Tier" is defined only by example (the alias `opus`). Which model is "the tier below" is never said, so the comparison cannot be identified.

**U2 — "a different family of models", "Claude models".**
Quoted: "**A reviewer from a different family of models is not used**" and "The harness dispatches only Claude models". Neither "family" nor which models are "Claude" is defined; "the same model as the writer" assumes the writer's model is known.

**U3 — "the most expensive model".**
Quoted: "the most expensive model scored below the Opus tier in the one code-review comparison that measured both (§9)". Not named; expensive by what measure is not said.

**U4 — "the literature on this method".**
Quoted: "the case the literature on this method does not handle". Which literature, and which "method", is not said in any given text.

**U5 — "seam", for two documents that do not cite each other.**
Quoted: "**Every pair of the design's documents gets a seam review** ... whether or not the two cite each other." `METHOD.md` defines the seam review by citation ("it fires when either side of a citation changes"). What a "seam" is between two documents with no citation between them is not defined.

**U6 — "the five `REVIEWS.md` defines".**
Quoted: "a sixth state, `waived`, beside the five `REVIEWS.md` defines". The five states are named in none of the given texts; §6 uses *reviewed* and *not run*, and it cannot be told whether these are two of the five.

**U7 — "raises one again".**
Quoted: "when a later review in the same elephant raises one again". No criterion says when a new finding is the same as an earlier one — same quoted text, same issue, same document.

**U8 — "the whole review".**
Quoted: "about a dollar for the whole review (§9)". Which review: a section review, a document review, or every review in an elephant.

## 4. UNVERIFIABLE CLAIMS

**V1 — Every evidential citation in *How every review is run* points at a section that does not exist.**
Quoted: "against about a dollar for the whole review (§9)", "in the one code-review comparison that measured both (§9)", "that independence is measured as worth more than added strength (§9)", "Separate runs rarely find the same faults (§9)". The document as given has headings §1–§7 only. None of these can be checked.

**V2** — Quoted: "finding faults is measured as rising steeply with model strength." No source given at that sentence; "steeply" has no threshold.

**V3** — Quoted: "The alias follows the newest Opus model". A claim about the harness's behaviour. Other harness claims in §5 carry a measurement date ("measured on 2026-10-25"); this one carries none, and `METHOD.md` imperative Four requires behaviour claims to be "measured, not reasoned".

**V4** — Quoted: "The harness dispatches only Claude models". Same: an undated, unmeasured claim about the harness.

**V5** — Quoted: "with its reasoning-effort setting at `high`." The passage does not say how a dispatched reviewer's reasoning effort is set, or that the harness allows setting it per dispatch; no measurement is cited. If it cannot be set, the rule cannot be followed, and no fallback is stated.

**V6** — Quoted: "A decision restated in two documents is most likely where neither cites the other". No source or measurement.

**V7** — Quoted: "the seam prompt's category for one rule stated in full in both documents is what catches it". A claim about a prompt not given to this review.

**V8** — Quoted: "The `bug` skill names a design working as written and wrong anyway as the case the literature on this method does not handle." A claim about a file not given to this review.

**V9** — Quoted: "In the closest study to this work, a check of written requirements". The study is not identified anywhere available (see V1).

## 5. CONTRADICTIONS

**C1 — The interview reviewer is given the conversation; the dispatch rule says no reviewer is.**
Quoted (passage, *How every review is run*): "**Each review is dispatched through the `goldfish` skill**: one fresh reviewer, no part of the conversation".
Quoted (§5 table and *The interview review*): "interview | 3 | the conversation, extracted from the session's transcript" and "The reviewer is given the extract and nothing else".
Under the reading that "no part of the conversation" describes what the reviewer is given, both cannot be true for the interview review, which is one of "each review". (Under the other reading — the reviewer took no part — there is no contradiction; see A1.)

**C2 — Findings ruled on as they arrive, with one exception; elsewhere, other findings are left unruled across sessions.**
Quoted (passage, *What is kept of a review*): "**Each finding is ruled on as it arrives**, except those of an interview review run as a session is handed off, which the next session puts to the author (§3, step 2)."
Quoted (§4 *Where they live*): "The findings of the other reviews are ruled on as they arrive and need no file; any still unruled when a session ends go into its handoff."
Quoted (§3): "the question waits: ... otherwise in the handoff, as any unruled finding does."
If every finding other than the named exception is ruled on as it arrives, no finding of another review can be "still unruled when a session ends". §4 and §3 say some can be. Either the exception list in the passage is incomplete or the §4/§3 provision is empty.

**C3 — The person-reading review "does not run inside" the elephant, yet its *reviewed* state is a reading done before close-out.**
Quoted (passage): "a row for a review that is not one of the elephant's six and does not run inside it: a person reading the finished document itself".
Quoted (§6 *The review record*): "*reviewed*, if they have read the whole document as it will be", answered in "the close-out proposal" (§3 step 8 item 2, before sign-off).
A document "as it will be" exists only as a draft or applied copy inside the elephant until close-out item 4, and the question is asked at item 2. A *reviewed* answer therefore records a reading that ran inside the elephant. Both statements cannot be true when the answer is *reviewed*.

## 6. NUMBERS WITHOUT PROVENANCE

**N1** — Quoted: "the tier below wrongly flagged nearly twice as many sound requirements". Source section absent (V1); cannot reproduce.

**N2** — Quoted: "every false finding costs the author minutes". Not measured, derived or sourced anywhere given.

**N3** — Quoted: "about a dollar for the whole review (§9)". Source absent; which review it prices is undefined (U8).

**N4** — Quoted: "a sixth state, `waived`, beside the five `REVIEWS.md` defines". The count five cannot be checked from the given texts.

## 7. CONCERNS YOU COULD NOT GROUND

**G1** — Reviews that run after close-out on the same text — the document review the author may re-run at fold-in (§5), section reviews of a diff "amended in place" (§6), seam reviews after a direct process change (§6) — are not "inside an elephant", so the exception in A11 does not cover them, yet the rejections that would let them recognise a re-raised finding were dropped at close-out. I cannot point at text that says where such later reviews' rejections are recorded, or that they are meant to re-argue the dropped ones; I could not ground this as a defect of these three passages.

**G2** — The rationale "A reviewer of the same model as the writer shares more of the writer's blind spots" assumes the writing agent runs on the Opus tier too. Nothing in the given texts fixes the writer's model. I could not ground whether that assumption matters to the rule.

**G3** — The document review is "given only the document", while `METHOD.md` says "A document is not reviewed while a normative dependency is unreviewed" and the design's documents cite sections of other documents. I worry that a reviewer given only one document cannot judge whether it can be implemented where it relies on cited text it was not given, but I could not ground a contradiction in these passages.

## 8. WHAT YOU WOULD BUILD

Every review — at least the six an elephant runs — is dispatched through the `goldfish` skill to a fresh reviewer that took no part in the work, is allowed to read only named files, follows its prompt exactly, runs on whatever the harness's `opus` alias resolves to at high reasoning effort, and writes its report to the session's scratch directory; it is run once and not repeated to harvest more findings, and no non-Claude reviewer is used. When the agent brings a finding to the author, it restates it so that it stands without the report: quoting the text, naming each document, and avoiding report-only terms. Each document the design produced gets a whole-document review over its applied form, whose prompt (shared with reviews outside elephants) gains one question — would the design, working as written, still fail its document's stated purpose — and every pair of design documents, plus each outside document that cites a changed section, gets a seam review with the existing prompt. Findings are ruled on as they arrive, except handed-off interview reviews, whose reports (with rulings written in) live in the elephant's directory; other reports stay in scratch. Rejected and immaterial rulings are carried in handoffs so a repeated finding can be shown with its earlier ruling, then dropped at close-out unless the author turns one into a non-goal or rejected alternative via a ledger ruling; `REVIEWS.md` gets rows only for section, document and seam reviews, plus a per-document row for the author's own reading, which may take a new `waived` state with a reason.
