# Seam review — `ELEPHANT.md` against `SOURCES.md` (applied)

Documents read: `process/designs/ELEPHANT.md` (whole, 1,829 lines), the applied `SOURCES.md` from the
scratchpad (whole), and `METHOD.md` (whole, as the dependency only). Nothing else was opened.

---

## 1. CONTRADICTIONS

**C1 — Whether `SOURCES.md` uses the word *elephant***
- `ELEPHANT.md` §1, *What the repository calls it today*: "Measured at `cf4e48c` by a case-insensitive
  search of every `.md` and `.js` file, leaving out `ROADMAP.md`, `ELEPHANT.md` and `HANDOFF.md`:" ...
  "`SOURCES.md` contains the word too, but only in the title of the article the pair is named after."
- `SOURCES.md` uses it in entry headings and body text: "### An elephant is optional, and proposing one
  is not"; "### An elephant's working lists are kept on disk"; "### Two skills carry the elephant";
  "### Findings inside an elephant are not recorded past close-out"; and, under *Sections, not the
  whole document at once*, "Rensin's elephant is one long session".
- Why both cannot be true: §1 says the word appears in `SOURCES.md` only in an article title. The
  `SOURCES.md` given here uses it in at least four entry headings and in departure text. §1 dates its
  measurement to a commit. It states the result in the present tense, and this review reads both
  documents as they will be.

**C2 — Whether any review runs again without a person asking**
- `SOURCES.md`, *Where this method departs from its sources* › *A review is not re-run on its own*:
  "**This method does:** runs one, stops, and hands the findings over. Nothing re-runs without a person
  asking, and how many times to ask is the author's call — so the loop is available and never
  automatic."
- `ELEPHANT.md` §5, *The ledger review*: "**It runs again before close-out** over every entry added or
  changed since it last ran, and every entry naming a document edited since it last ran ... This is
  the one exception to the rule that a review reads again what it has already read only when the
  author asks". §3, *What goes back*: "a review that has already run runs again only if the author asks,
  except the ledger review before close-out (step 8), and the retirement review over a successor's
  rewritten sections (§7)." §7, *The retirement review*: "When sections of the successor are written
  again after it has run, it runs again over those sections."
- Why both cannot be true: `SOURCES.md` says nothing runs again unless a person asks, and that the
  loop is "never automatic". `ELEPHANT.md` makes two reviews, the ledger review and the retirement
  review, run again because of an event, with no person asking.

**C3 — Whether an agent ever needs to read `SOURCES.md` to do a piece of work**
- `SOURCES.md`, opening block: "Nothing here is a rule, and no agent needs to read this to do any piece
  of work." and "**Read it when the method itself is under review** — which is rare, and is its own
  exercise rather than part of the everyday loop."
- `ELEPHANT.md` §6, *What it produces*: "an elephant on the process writes the evidence for its rules as
  a diff of `SOURCES.md`, in that document's own entry format, since `SOURCES.md` takes diffs like any
  specification. That diff is one of the documents agreed at step 4, and is reviewed like any other."
  §6, *The sort at close-out*, the row for that diff: "it folds in at the process design's last slice,
  each source indexed back to the rules that use it and to any place the process departs from it".
  §6, *Where reasoning lives*: "Each rule a process design adds to `METHOD.md`, and each other rule it
  backs with evidence, has an entry in `SOURCES.md` declaring its kind."
- Why both cannot be true: `ELEPHANT.md` gives an agent work that cannot be done without reading
  `SOURCES.md`. That work is writing a diff in its entry format, folding the diff in, and indexing
  each source back to its rules, and it happens in every elephant on the process and in that design's
  last slice. `SOURCES.md` says no agent needs to read it for any piece of work.

## 2. DIVERGENT DEFINITIONS

**D1 — What `SOURCES.md` is the evidence for, and what wins over it**
- `SOURCES.md` title and opening: "# Sources — the evidence behind the method"; "`METHOD.md` holds the
  rules and wins wherever the two disagree."
- `ELEPHANT.md` §6, *Where reasoning lives*: "Each rule a process design adds to `METHOD.md`, and each
  other rule it backs with evidence, has an entry in `SOURCES.md`". §6, the family table: "Layer 1, read
  by somebody changing it | the process designs, this one among them, and `SOURCES.md`, the evidence
  behind the process". Its "what executes" row lists "the process documents: `METHOD.md`, every skill,
  every reviewer prompt ...", and §6 says process documents are to a process design "what code is to a
  specification".
- The two differ:
  - In `SOURCES.md`, the rules it explains are `METHOD.md`'s, and `METHOD.md` wins.
  - In `ELEPHANT.md`, `SOURCES.md` also holds entries for rules that live outside `METHOD.md`. One
    is *Every review runs on the Opus tier at high effort*, which §5 attaches to "Every review the
    `goldfish` skill dispatches".
  - `ELEPHANT.md` places `SOURCES.md` in Layer 1, beside the designs. It places `METHOD.md` among the
    executing documents, which are brought into line with Layer 1.
  - `SOURCES.md`'s precedence clause names only `METHOD.md`. It does not say what wins between
    `SOURCES.md` and a process design, or a skill, that holds a rule it explains.

**D2 — What counts as *measured***
- `SOURCES.md`, the kinds table: "**measured here** | it was learnt from an incident in this repository,
  at a cost."
- `ELEPHANT.md` §6, *Where reasoning lives*: "Evidence that was published or measured is stated in that
  entry". `ELEPHANT.md` uses *measured* for deliberate readings and counts. In §5, *The ledger review*:
  "Measured against the seam prompt, five of its eight categories do not apply". In §5, *Finding the
  transcript*: "measured on 2026-10-25" and "Measured on 2026-10-18".
- The two differ: `SOURCES.md`'s kind requires an incident that cost something. `ELEPHANT.md`'s
  *measured* also covers a reading of a prompt and a planned count. `SOURCES.md`'s entry *The ledger
  review has a prompt of its own* is filed as "measured here", but its evidence is a reading ("read
  against the job of checking that each ruling landed"), with no incident. The two documents' rules do
  not say which kind such a measurement gets.

**D3 — When a question that surfaces during writing reaches the author**
- `SOURCES.md`, *Sections, not the whole document at once*: "**This method does:** writes a design
  section by section, putting each section's questions to the author as they surface." and "the
  questions nobody asked surface while a section is being written, so each is put to the author at
  once rather than at the end."
- `ELEPHANT.md` §1, *The definition*: "When one does, the agent puts it to the author as a question in
  that section's review, without going back to the interview." §3 step 5: "**New ground found while
  writing** ... is raised when the agent presents the section it was writing". The one exception is
  narrower: "The agent may also ask a question while drafting, when the answer would change what it
  writes. It asks at once ... This should rarely be needed".
- The two differ: `SOURCES.md` says each question goes to the author "as they surface" and "at once".
  `ELEPHANT.md` holds such a question until the section is presented with its review. It asks at once
  only in a case it calls rare.

## 3. BROKEN EXPECTATIONS

**B1 — `SOURCES.md`'s status line**
- `ELEPHANT.md` §6, *The status of a specification*: "**`SOURCES.md` carries a status line**, and so
  does every specification written before the elephant existed ... Each is `active`". The line is "the
  first non-blank line after the `#` title ... written `> **Status:** ` followed by the value". The
  status check "covers ... `SOURCES.md`" and "fails on a specification, process design or diff with no
  status line".
- `SOURCES.md` (applied): the first non-blank line after "# Sources — the evidence behind the method" is
  "> **This document explains; it does not instruct.** ..." There is no status line.
- `ELEPHANT.md` requires a status line on the document as it will be. The document given as it will be
  does not supply one. `ELEPHANT.md` §5, *Reading a document as it will be*, keeps the target's own
  status line in the applied result, so the lack is the target's.

**B2 — Entries the design is to cite by name, and does not**
- `ELEPHANT.md` §6, *Where reasoning lives*: "Evidence that was published or measured is stated in that
  entry, and the design cites the entry by its rule's name rather than restating it."
- `SOURCES.md` holds these published entries for rules that `ELEPHANT.md` states:
  - "### A question to the author is aimed at what matters and is answerable", the rule in §3 step 2;
  - "### The interview is reviewed by a reader who took no part", the rule in §3 step 3 and §5;
  - "### A design is written section by section", the rule in §1;
  - "### A design is staged, never written into a live document", the rule in §1 and §6;
  - "### Every specification carries a status, and a check keeps it true", the rule in §6.

  `ELEPHANT.md` cites none of these entries anywhere in its text. Its citations of `SOURCES.md` name
  other entries.
- `SOURCES.md` supplies the evidence. `ELEPHANT.md` never makes the link it says the design makes, so
  from the design no reader is led to the evidence for those rules.

**B3 — Evidence stated in the design with no entry in `SOURCES.md`**
- `ELEPHANT.md` §6, as quoted in B2: "Evidence that was published or measured is stated in that entry".
- `ELEPHANT.md` states this evidence itself, and `SOURCES.md` has no entry or sentence holding it:
  - §5, *Finding the transcript*: "The session id is the name of the directory that holds the session's
    scratch directory, which is itself named `scratchpad`; measured on 2026-10-25." and "Measured on
    2026-10-18: exactly one file under `~/.claude/projects/` carried the measuring session's id, and each
    of the twenty transcripts in this project's directory carried exactly one session id, its own name."
    `SOURCES.md`'s *The interview extract is filtered, and stops on what it does not recognise* records
    neither.
  - §8, *An open question about what else to discuss*: "while this design was settled, the question was
    asked open-ended, in a form the author had already rejected, and went unanswered as the step
    closed." This is a local incident behind §3 step 2's rule against an open question.
  - §1, *When it is used, and who decides*: "`PILOT.md` ... was written without one, and the author's
    only finding on reading it was that it never mentions the elephant at all."
  - §8, *A premortem before the document review*, states published findings directly: "measures how
    many explanations people produce, not how many defects they find (Klein, *Project Premortem*)", and
    "The only premortem work for models is about avoiding harm ... (InvThink)". `SOURCES.md` rows 59
    and 60 supply none of the evidence. They point back: "Read, and rejected; `ELEPHANT.md` says why".
- `ELEPHANT.md` puts published and measured evidence in `SOURCES.md` entries. In these places the
  evidence is in `ELEPHANT.md` and nowhere in `SOURCES.md`.

## 4. UNCLAIMED GROUND

**X1 — Evidence that the start and the end of an elephant are asked for in different words**
- `ELEPHANT.md` §3, opening: "They are two, not one, because a skill is loaded when a request matches its
  description, and the start of a change and the end of a design, sessions later, are asked for in words
  that have nothing in common (`SOURCES.md`, *Two skills carry the elephant*)."
- `SOURCES.md`, *Two skills carry the elephant*: "**Kind:** reasoned **Evidence:** none directly; the
  argument is in `ELEPHANT.md`, under *What happens, in what order, and where each part ends*." The
  adjacent support it gives is about skills with no trigger. It is not about whether these two
  requests share words.
- `ELEPHANT.md` cites `SOURCES.md` for the claim, and `SOURCES.md` points back to `ELEPHANT.md`. Neither
  supplies anything for "asked for in words that have nothing in common".

**X2 — Why the effort setting is fixed at *high***
- `SOURCES.md`, *Every review runs on the Opus tier at high effort*: "Why the effort setting is fixed at
  high is argued in `ELEPHANT.md`, under *How every review is run*."
- `ELEPHANT.md` §5, *How every review is run*: "No review is given a cheaper model, a section review
  included, and none is given a more expensive one; the effort setting is fixed in the same way." The
  paragraph argues the tier and cites the same `SOURCES.md` entry for it: "(`SOURCES.md`, *Every review
  runs on the Opus tier at high effort*)". It gives no reason for *high* over any other setting.
- Each document points at the other for the argument for *high*, and neither makes one.

## 5. DUPLICATED OWNERSHIP

**P1 — The ledger review's prompt, measured against the seam prompt**
- `ELEPHANT.md` §5, *The ledger review*: "Measured against the seam prompt, five of its eight categories
  do not apply and one inverts: it would report every ruling that landed as the same decision stated in
  two places".
- `SOURCES.md`, *The ledger review has a prompt of its own*: "five of the seam prompt's eight categories
  did not apply, and one, duplicated ownership, inverted: it would report every ruling that landed as
  the same decision stated in two places."
- The same evidence is stated in full in both. `ELEPHANT.md` §6 says the design cites the entry "rather
  than restating it".

**P2 — The checklist lost on the first elephant**
- `ELEPHANT.md` §4, opening: "on the first elephant run here, the checklist was retyped into each
  exchange — one question and its answer — and silently lost an item within two exchanges".
- `SOURCES.md`, *An elephant's working lists are kept on disk*: "on the first elephant run here, the
  checklist was retyped into each exchange instead of being kept on disk, and silently lost an item
  within two exchanges."
- The same incident is stated in full in both.

**P3 — The transcript measurements**
- `ELEPHANT.md` §5, *Where the extract begins and ends*: "all 105 `user` and `assistant` records carried an
  id, and no two the same". §5, *When extraction fails, the review does not run*: "One transcript held
  nine types when this design began; on 2026-10-18 the most any one transcript held was fourteen, and
  the twenty held fifteen between them." §5, *What the extractor keeps*: "The tool's name appeared in six
  of the twenty transcripts."
- `SOURCES.md`, *The interview extract is filtered, and stops on what it does not recognise*: "all 105
  `user` and `assistant` records of the transcript examined carried an id, no two the same"; "the twenty
  transcripts in this project's directory held fifteen types between them, the most in one fourteen";
  "the question tool's name appeared in six of the twenty"; "The record types grew from nine to fourteen
  within one session".
- The same counts are in both documents. A recount would have to be changed in two places.

**P4 — The evidence for the Opus tier**
- `ELEPHANT.md` §5, *How every review is run*: "the tier below, Sonnet, wrongly flagged nearly twice as
  many sound requirements, and every false finding costs the author minutes, against about a dollar for
  the whole review" and "the most expensive model, Fable, scored below the Opus tier in the one
  code-review comparison that measured both".
- `SOURCES.md`, *Every review runs on the Opus tier at high effort*: "Opus 4.7 wrongly flagged 11% of
  sound requirements against Sonnet 4.6's 20%"; "Opus 5.5 scored F1 56.8% above Fable 5.1's 53.5%, at a
  mean of $1.00 a review"; "triaging one warning takes about 5 to 8 minutes."
- `ELEPHANT.md` restates the entry's findings in summary as well as citing it.

**P5 — Why a reviewer from another family is not used**
- `ELEPHANT.md` §5, *How every review is run*: "The harness dispatches only Claude models, so this gain
  is out of reach, and the cost is accepted."
- `SOURCES.md`, *The reviewer shares the writer's family of models*: "**Why:** the harness dispatches only
  Claude models, so the better reviewer is out of reach. A fresh context buys part of the independence
  ... and the rest is a cost accepted. The argument is in `ELEPHANT.md`, under *How every review is
  run*."
- The rationale is stated in full in both. In the same entry, `SOURCES.md` says the argument lives in
  `ELEPHANT.md`.

**P6 — Why sections are written one at a time**
- `ELEPHANT.md` §1, *The definition*: "**Writing is inside the elephant, not a step after it**, because
  writing a section is often where a question nobody asked first shows up."
- `SOURCES.md`, *Sections, not the whole document at once*: "the questions nobody asked surface while a
  section is being written, so each is put to the author at once rather than at the end. The argument is
  in `ELEPHANT.md`, under *The definition*."
- The argument is stated in both, even as `SOURCES.md` says it lives in `ELEPHANT.md`. The two copies
  already differ on timing (D3).

**P7 — BMAD and unstated requirements**
- `ELEPHANT.md` §2, *It is not a way to produce a specification unattended*: "BMAD ... offers a
  questioning step and lets the user skip straight past it" and "Models guess unstated requirements
  wrongly more often than they guess them right".
- `SOURCES.md`, *Nothing goes past a ruling point without the author*: "BMAD, offers a questioning step and
  lets the user proceed past it at once" and "models inferred unstated requirements correctly 41.1% of
  the time".
- The evidence is restated in `ELEPHANT.md` as well as cited.

## 6. DRIFTED CITATIONS

**T1 — "designs habitually leave out"**
- `ELEPHANT.md` §4, *What each file holds*: "holding three items that designs habitually leave out
  (`SOURCES.md`, *The checklist starts with what designs habitually leave out*)".
- `SOURCES.md`, that entry: "That designs leave these out is not measured; that mature templates name
  them is."
- `ELEPHANT.md` cites the entry for the claim that designs habitually leave these out. The entry says
  that claim is not measured.

**T2 — "A goldfish never comes back empty"**
- `ELEPHANT.md` §5, *How every review is run*: "A goldfish never comes back empty, and a review run again
  over the same text finds mostly what the last found and adds its least stable findings, so a round
  that brings back nothing the author rules material is where reviewing stops (`SOURCES.md`, *Another
  review is recommended for a reason, never run to find more*)."
- `SOURCES.md`, that entry: the nearest finding is "On code already rated flawless, a model's critique
  substantially lowered the rating in 24% of cases, against 6% without one." Nothing in the entry says a
  review never comes back empty.
- The sentence is cited to an entry that does not make its first claim. The entry's 24% figure is far
  from "never".

**T3 — "even with a fresh context"**
- `ELEPHANT.md` §5, *How every review is run*: "A reviewer of the same model as the writer shares more of
  the writer's blind spots than a reviewer of another family, even with a fresh context ... (`SOURCES.md`,
  *A reviewer from another family of models is not used*)."
- `SOURCES.md`, that entry: "checking by the same model gained least and by a different family most; as
  models grew stronger they became worse checkers of their own work and better checkers of another
  family's; and models' errors grew more alike as their capability rose." It does not mention fresh
  context. *The reviewer shares the writer's family of models* says something different: "A fresh
  context buys part of the independence".
- The words "even with a fresh context" are cited to an entry that does not make that claim.

**T4 — Why each status is set at a fixed event**
- `SOURCES.md`, *Every specification carries a status, and a check keeps it true*: "Why each status is set
  at a fixed event is argued in `ELEPHANT.md`, under *The status of a specification*."
- `ELEPHANT.md` §6, *The status of a specification*: "**Each status is set at a fixed event, by the skill
  that runs that event.** Close-out sets `finalised`. The `execute` skill sets `implementation ongoing`
  ... and `active` when the last slice closes. The clean-up of an abandoned elephant sets `abandoned` on
  a draft the author keeps." No reason is given there for fixing each status to an event.
- `SOURCES.md` cites that section for an argument the section does not make.

**T5 — Why findings inside an elephant are not recorded past close-out**
- `SOURCES.md`, *Findings inside an elephant are not recorded past close-out*: "**Kind:** reasoned
  **Evidence:** none; the argument is in `ELEPHANT.md`, under *What is kept of a review*."
- `ELEPHANT.md` §5, *What is kept of a review*: "**Rejected and immaterial findings are kept only until
  close-out.** ... At close-out they are dropped, and none is recorded in `REVIEWS.md`. A finding the
  author wants remembered beyond the elephant is added to the design ... `METHOD.md`'s rules that
  rejections are recorded and that an immaterial finding's reason is written down make this exception
  for the reviews inside an elephant." The section states the rule and that it is an exception. It
  gives no reason for dropping the rejected findings. It does give a reason why the interview, ledger
  and retirement reviews get no `REVIEWS.md` row. §8's table also points here: "rows in `REVIEWS.md` for
  the interview, retirement and ledger reviews, and rejected findings kept past close-out | §5, *What is
  kept of a review*".
- `SOURCES.md` cites the section for an argument the section does not make. `METHOD.md`'s own stated
  reason for recording rejections, that an unrecorded one is "re-found by the next review, re-argued",
  is not answered there.

**T6 — Why the interview ends when the author agrees**
- `SOURCES.md`, *The interview ends when the author agrees nothing that matters is unknown*: "the argument
  is in `ELEPHANT.md`, under *The steps*."
- `ELEPHANT.md` §3, *The steps*, step 2, *Proposing to end it*: it describes the procedure ("the agent
  states what it believes is still unknown, why it judges that none of it would change the design, and
  its evidence ... **It ends when the author agrees.**"). The reason the author, and not the agent,
  decides when the interview stops is in §2, *It makes none of the author's decisions*: "Starting and
  stopping are the author's for a different reason: both turn on telling a well-specified request from
  an underspecified one, which agents are measured as bad at (§1)."
- `SOURCES.md` points to *The steps*. As far as this reviewer can find, the argument is in §2.

## 7. CONCERNS YOU COULD NOT GROUND

- **N1.** `SOURCES.md`, *A process document changed directly is reviewed against its design*, says "the
  argument is in `ELEPHANT.md`, under *What it produces*." That section describes how the review runs
  and which row of the table it adds. The sentence that would argue for the review was not found. The
  nearest is "since the row for seams covers only those a citation makes", which justifies a new row,
  not the review itself. This reviewer could not confirm that no argument is there, only that none was
  found, so it is not filed under T.
- **N2.** `ELEPHANT.md` §5 says "against about a dollar for the whole review". `SOURCES.md`'s figure is "a
  mean of $1.00 a review" in "a vendor's code-review benchmark". This reviewer could not tell whether
  "the whole review" means a review in this process, for which `SOURCES.md` measures no cost, or the
  benchmark's review.
- **N3.** `SOURCES.md`, *A review is not re-run on its own*, gives as its reason: "the cited loops all pair
  with something that applies findings. Nothing here does." In `ELEPHANT.md` the agent acts on findings
  once they are accepted: "every accepted one acted on" (§3 step 5), "One accepted at steps 6 or 7 is
  acted on in the section concerned" (§3, *What goes back*). If "applies" means *acts on after a ruling*,
  the two disagree. If it means *applies automatically*, they do not. The text does not settle which.
- **N4.** On what records a spent plan, the two lists differ. `SOURCES.md`, *Plans are thrown away, not
  kept*: "The audit trail the source wants is exactly what the deleting commit is." `ELEPHANT.md` §8, *An
  archive of rejected alternatives*: "the deleting commit, the review record's block, which outlives the
  plan with the state `spent`, and the change log, `CHANGELOG.md`, already record them". They may not be
  incompatible. They are two differing accounts of one fact, and the citation at the end of the
  `ELEPHANT.md` sentence points only to *Plans are deleted after execution*.
- **N5.** `ELEPHANT.md` §6 says a *reasoned* entry "names, by its heading, the section of the design that
  holds the argument, and does not restate it". Several reasoned entries in `SOURCES.md` restate their
  argument in the entry, among them *The two families* and *The four layers*, and `ELEPHANT.md` §6
  says what `METHOD.md` says of the two families. Whether §6's rule reaches entries for rules that
  existed before any process design could not be settled from the text: "Each rule a process design adds
  to `METHOD.md`" suggests not.

## 8. WHAT YOU UNDERSTOOD EACH DOCUMENT TO OWN

`ELEPHANT.md` is the specification of one process: settling a design with the author through an
interview and writing it section by section. It owns the eight steps, the working files, the six kinds
of review, the status lines and diffs for specifications, and replacement. It also owns the rule for
where reasoning lives: each rule backed by evidence has a `SOURCES.md` entry, and the design cites that
entry by name instead of restating it. `SOURCES.md` is understood as the Layer 1 evidence document of
the process family. It is keyed by rule name, gives each rule a kind (published, measured here,
reasoned), records departures from sources, and indexes the sources. For a reasoned rule it is meant to
point back to the `ELEPHANT.md` section that holds the argument. The boundary as understood here:
evidence (measurements, studies, figures) belongs to `SOURCES.md`, and the rules and their arguments
belong to `ELEPHANT.md`. Each side points at the other by name, entry heading or section heading.
Most findings above are places where that boundary is crossed: evidence restated in the design,
arguments restated in departures, or a pointer that lands on a section without the argument. Two
findings are about `SOURCES.md`'s own self-description. Its opening block still describes it as the
evidence for `METHOD.md` alone, read rarely and by no agent at work. `ELEPHANT.md` gives it a broader and
more active role.
