# Ledger — auto-execute

- Searched by hand every document AGENTS.md lists, with the hooks and the reviewer prompts, for wording
  on plan reviews, on re-running a review, on rulings made item by item and on a review that stops after
  one; read the ledgers of other running elephants, of which there are none; and looked for diffs
  pending beside each document found. Found process/designs/ELEPHANT.md, a process design, finalised, no
  slice started; SOURCES.md, with no status line, so counting as active, and SOURCES.elephant.md pending
  beside it, finalised, whose change a further diff's reviews would not see; and, not designed,
  METHOD.md, the goldfish, plan, execute and slice skills, prompts/goldfish-plan.md, the remind and
  session-start hooks, PILOT.md, ROADMAP.md, REVIEWS.md, AGENTS.md and test/reviews.js. The search is
  weak: this project has no record of what lives where, so it was done by hand and can miss a document —
  none
- An elephant is wanted, and it designs the process, not the system — none — author
- Change process/designs/ELEPHANT.md — none — author
- Change SOURCES.md through its pending diff: SOURCES.elephant.md follows ELEPHANT.md into this elephant
  as a draft, renamed SOURCES.auto-execute.md, and is changed there; its pointer line in SOURCES.md is
  removed until close-out puts it back, and its lines in the SOURCES.md block of REVIEWS.md follow it
  to the draft's path until close-out names it by its final name — none — author
- Cutting a design into slices, and each slice's plan, are reviewed and corrected with no author in the
  loop, and the author is shown neither the cut nor any plan; the design's own reviews, the section,
  document, seam, interview and ledger reviews, keep the author's rulings — process/designs/BEAVER.md —
  author
- One plan is written per slice; a fresh goldfish reviews it and writes a report; the agent verifies
  each finding by measurement, reads the report sceptically and sorts the findings; the outcomes it
  recommends are applied without the author; then a new, fresh goldfish reviews the plan again —
  process/designs/BEAVER.md — author
- The loop stops when the latest fresh review returns no blocking finding, a blocking finding being one
  where an executor would have to ask, or guess, or would build the wrong thing —
  process/designs/BEAVER.md — author
- The loop has a hard cap of five rounds; at the cap, the blocking findings still standing go to the
  author, each as a plain question about what the author wants, with the beaver's proposed answer first,
  in the same list as the gaps in the specification, and the plan is not carried out until the author
  has ruled — process/designs/BEAVER.md — author
- A finding the plan could fix only by deciding something its specification does not say stops the loop
  and goes to the author, with the clarification or change to the specification that the beaver proposes
  to settle it; the beaver then changes the specification together with the author, who rules item by
  item, and never changes a specification or any other design by itself — process/designs/BEAVER.md —
  author
- The agent that runs the loop is not the elephant, which ends at sign-off, and is called the beaver —
  process/designs/BEAVER.md — author
- The loop is designed in a process design of its own, process/designs/BEAVER.md, separate from
  ELEPHANT.md, and kept small enough to write and review quickly — process/designs/BEAVER.md — author
- A person looks at what each slice of a system design built: the changes to the app, any new move
  diagrams, and the test cases and files made to show intended behaviour — process/designs/BEAVER.md —
  author
- After a slice of a process design the author looks at nothing; the slice's checks, and a fresh seam
  review between the process documents it changed and the design, stand in — process/designs/BEAVER.md —
  author
- A system specification may declare that its first slice tests whether its approach holds, with the
  example outputs that show it; the elephant asks every system specification this, as a fourth standard
  checklist item, and nothing about it is asked at sign-off — process/designs/ELEPHANT.md — author
- When a system specification declares that its first slice tests its approach, the cut follows the
  declaration, and the pause before slice 2 shows the author slice 1's example outputs to check; with no
  declaration the first slice is the usual walking skeleton — process/designs/BEAVER.md — author
- A specification whose test slice is reverted returns to finalised with no slice started, so that an
  elephant may move it in and rework it — process/designs/ELEPHANT.md — author
- When a test slice shows the approach is partly wrong, the specification is amended in place with the
  author, slice 1 is cut again as a correction, and every plan goes through the amendment's loops; when
  it shows the approach is wholly wrong, slice 1 is reverted; no later slice starts in either case —
  process/designs/BEAVER.md — author
- The extract of a reopened interview begins at the agent turn that put the findings that reopened it,
  so that its reviewer sees the questions the author was answering — process/designs/ELEPHANT.md —
  author
- The cut goes through the same loop as a plan, with a reviewer that asks whether every part of the
  specification lands in some slice, and whether each slice can be built from those before it —
  process/designs/BEAVER.md — author
- The overriding rule states the beaver's exception itself: findings on a cut or a plan are the beaver's
  to act on — process/designs/BEAVER.md — author
- REVIEWS.md records one row for each loop, in the plan's block or, for the cut's loop, in the block of
  the design it cut: which pass it was, how many rounds ran, why it stopped (clean, at the cap, or by
  the carve-out), and the beaver's rejected findings, a loop still running reading running;
  test/reviews.js fails on a loop's row that does not record the rounds and the stop reason, the two
  plans spent before the beaver being its only exemptions — process/designs/BEAVER.md — author
- The evidence for both process designs is one diff, SOURCES.auto-execute.md, which folds in as the last
  step of whichever design's last slice closes later — process/designs/ELEPHANT.md — author
- When step 1 moves a whole document into an elephant's directory, its REVIEWS.md block heading follows
  it to the draft's path; close-out renames it back, replaces the section rows for the sections that
  changed, and replaces its document and seam rows — process/designs/ELEPHANT.md — author
- The design records, with its reason, every alternative the author ruled against, and also stopping
  only on a review that finds nothing at all — process/designs/BEAVER.md — author
- Each loop runs in the session that runs it, the first writing of a plan in the session that writes it;
  a handoff partway through a loop records the round count — process/designs/BEAVER.md — author
- A finding the beaver rejected that a later fresh review raises again counts as blocking again, and
  nothing more is added: the cap sends what is left to the author — process/designs/BEAVER.md — author
- The loop's cost has no limit beyond the cap, and every round's reviewer runs at the same tier; the
  author accepts up to three loops for each plan, its first writing, its ripple pass and the pass before
  it is carried out, with the reruns an amendment needs — process/designs/BEAVER.md — author
- The beaver does not carry a plan out; the execute skill does — process/designs/BEAVER.md — author
- Before each slice is carried out, the beaver pauses, so that the author can ask questions, such as
  what will change and how long it will take, choose what is built when, and coordinate slices being
  built at the same time; it offers by default to start the slice with the execute skill, which starts
  on the author's word; this pause is what making the whole build automatic would later remove —
  process/designs/BEAVER.md — author
- Making the whole build automatic, from sign-off until the specification is entirely built, is not part
  of this design; it is left until the author trusts the beaver — process/designs/BEAVER.md — author
- From sign-off on, a specification is amended in place, on the author's ruling, when a plan or a
  slice's acceptance tests show a gap in it, whether or not any slice has been built; the changed
  sections get their section reviews, and the document and seam reviews run again; an amendment in
  place covers a change of any size, and an elephant is the route only for a change the author starts
  — process/designs/ELEPHANT.md — author
- After an amendment in place, the unbuilt slices the amendment reaches are cut again; the cut's loop
  runs again for the slices cut again, and the plan loop for every plan whose slice changed or that draws on a changed
  section, and the ripple pass runs again, in slice order, from the earliest plan the amendment changed
  — process/designs/BEAVER.md — author
- A slice already built whose acceptance tests the author finds wrong is cut again against the amended
  specification, as a correction, and goes through the same loops as any slice cut again; the stop on a
  wrong test fires when the executing agent cannot make a test pass without editing it —
  process/designs/BEAVER.md — author
- The beaver works the same way on a process design's cut and plans, and the gaps it finds go to the
  author as questions about substance, never wording — process/designs/BEAVER.md — author
- Every plan's first task writes the slice's acceptance tests from the specification and shows them
  failing; every later task fails and then passes its own check; the last task runs every check, shows
  the acceptance tests passing with the commands' output, and produces what the author will look at; no
  later task edits a test the first task wrote; the tests are written to files of their own, and once
  the first task's check passes they are guarded until the specification's last slice closes: no agent
  changes one without the author's word, which the harness asks for when the change is attempted, and a
  change made by any route is caught before it is committed; one found wrong stops the build and goes
  to the author — process/designs/BEAVER.md — author
- Every plan carries, as tasks, every step the process designs give its slice, such as setting the
  specification's status at its first and last slice and folding in a diff at its last —
  process/designs/BEAVER.md — author
- Every plan keeps a progress section, updated while it is carried out, and says how to retry or undo
  each risky step; the plan reviewer checks every rule a plan must follow and skips style —
  process/designs/BEAVER.md — delegated
- The acceptance tests are shown to the author with what the slice built; a test the author finds wrong
  or short of what is wanted is settled by changing the specification — process/designs/BEAVER.md —
  author
- The cut is made whole, every slice at once, and every slice's plan is written as soon as it is made,
  even when the approach is to be proven first, so that gaps in the specification are found before
  building starts; reworking plans after an earlier slice changes the specification is accepted as the
  cost — process/designs/BEAVER.md — author
- Every plan is first written assuming the slices before it are built; once the plans of every earlier
  slice are finished and have had their own ripple pass, so that they no longer change, it goes through
  the loop again with those plans in front of its reviewer, the ripple pass; and it goes through the
  loop once more just before it is carried out, against the code as the earlier slices left it —
  process/designs/BEAVER.md — author
- The list of slices is kept in ROADMAP.md, as a table under the design's entry —
  process/designs/BEAVER.md — delegated
- Every gap in the specification a plan finds goes to the author once its loop has stopped on it, before
  slice 1 is carried out wherever it can, as a plain question with the beaver's proposed answer first;
  slice 1's pause may come before every plan is written, showing the gaps found so far, so that the
  author can choose whether to start slice 1 or settle the gaps first — process/designs/BEAVER.md —
  author
- Every gap report and every pause carry the same short summary: how many plans are still being written,
  and how many slices are still to be built; each pause also lists every slice being built or waiting,
  across every specification — process/designs/BEAVER.md — author
- Text the author types while the agent is working, an attachment record of kind queued_command, is part
  of the conversation the interview extract keeps — process/designs/ELEPHANT.md — author
- A record type the extractor does not know stops it only if a record of that type holds conversation
  text that the extractor keeps nowhere in the transcript, wherever in the file that text sits; one
  that only repeats text the extractor keeps is ignored — process/designs/ELEPHANT.md — author
- BEAVER.md drafts in full, as a block quote in its section "What the beaver is", the overriding rule's
  new wording with the beaver's exception; every other process document it calls for is left to its
  slice's plan — process/designs/BEAVER.md — author
- Section "What the beaver is" — What does the beaver do, between which two points, and what stays with
  the author? — process/designs/BEAVER.md — 1st — author
- Section "The cut and the plans" — How is a signed-off design cut, when is each plan written and
  written again, and what must every plan contain? — process/designs/BEAVER.md — 2nd — author
- Section "The review loop" — How is a cut or a plan reviewed and corrected without the author, and when
  does the loop stop? — process/designs/BEAVER.md — 3rd — author
- Section "What the author sees" — What reaches the author between sign-off and the end of the build,
  when, and in what form? — process/designs/BEAVER.md — 4th — author
- Section "When the specification proves wrong" — What happens when a plan, a test slice or a built
  slice shows the specification is wrong? — process/designs/BEAVER.md — 5th — author
- Section "What was decided against" — What did the author rule out, and why? —
  process/designs/BEAVER.md — 6th — author
- Section "The elephant: the conversation before a document, and the writing of it" — What is this
  document, who reads it, and how is it built? (the note under the document's title) —
  process/designs/ELEPHANT.md — 7th — author
- Section "The four points in the process" — Where does the elephant stop for the author's ruling, and
  what outcomes can a finding have? — process/designs/ELEPHANT.md — 8th — author
- Section "The steps" — What does each of the elephant's eight steps do, and when does each end? —
  process/designs/ELEPHANT.md — 9th — author
- Section "What each file holds" — What does each working file and draft hold, and in what form? —
  process/designs/ELEPHANT.md — 10th — author
- Section "How every review is run" — How is every review dispatched, how are its findings put and
  sorted, and when is another recommended? — process/designs/ELEPHANT.md — 11th — author
- Section "The interview review" — What does the interview reviewer read, how is it extracted, and what
  happens when extraction fails? — process/designs/ELEPHANT.md — 12th — author
- Section "The ledger review" — How is each ruling checked against the document that was to hold it? —
  process/designs/ELEPHANT.md — 13th — author
- Section "What it produces" — What documents does an elephant produce, and how does a process design's
  evidence travel? — process/designs/ELEPHANT.md — 14th — author
- Section "The status of a specification" — What states can a specification be in, which event sets
  each, and what checks them? — process/designs/ELEPHANT.md — 15th — author
- Section "A diff specification, from sign-off to fold-in" — How is a change to a specification held,
  built, amended and folded in? — process/designs/ELEPHANT.md — 16th — author
- Section "The sort at close-out" — Where does everything the elephant made end up? —
  process/designs/ELEPHANT.md — 17th — author
- Section "The review record" — What does REVIEWS.md record of the design's reviews, and when? —
  process/designs/ELEPHANT.md — 18th — author
- Section "What else was considered" — Which alternatives did the author rule against on ELEPHANT.md's
  own rules, and why? — process/designs/ELEPHANT.md — 19th — author
- Section "Findings on a cut or a plan are the beaver's to act on" — What evidence backs letting the
  beaver act on findings without the author? — SOURCES.md — 20th — author
- Section "A plan's review loop stops when nothing blocking is left, or at five rounds" — What evidence
  backs the loop's stopping rule and its cap? — SOURCES.md — 21st — author
- Section "A plan writes its acceptance tests first, and nothing later edits them" — What evidence backs
  writing the tests first and keeping them out of the executor's reach? — SOURCES.md — 22nd — author
- Section "A plan records its progress, and how to retry or undo each risky step" — What evidence backs
  the progress section and the retry-or-undo steps? — SOURCES.md — 23rd — author
- Section "Finish the design, then cut it into slices" — What backs cutting the whole design first, and
  where does the method now depart from that source? — SOURCES.md — 24th — author
- Section "The checklist starts with what designs habitually leave out" — What backs the standard
  checklist items, the fourth included? — SOURCES.md — 25th — author
- Section "The interview extract is filtered, and stops on what it does not recognise" — What was
  measured of the transcripts that the extractor's rules rest on? — SOURCES.md — 26th — author
- Section "A review is not re-run on its own" — Where does the method depart from the looping
  implementations it cites, now that cuts and plans loop? — SOURCES.md — 27th — author
- Section "That audit's convergence result is not adopted" — Why is the audit's convergence result still
  not adopted for the reviews the author rules on? — SOURCES.md — 28th — author
- Section "Every plan is written as soon as the cut is made" — Why does the method write every plan at
  once, against the practice of planning each slice on arrival? — SOURCES.md — 30th — author
- Section "The sources themselves" — Which sources does the method draw on, and which rules use each? —
  SOURCES.md — 31st — author
- Close-out ends by offering, as its default, to start the beaver in a fresh session for the design
  just signed off; the beaver starts on the author's word — process/designs/BEAVER.md — author
- Every plan goes through the beaver's loop, a plan for a fix and a plan for a document written before
  the elephant existed included, and the overriding rule's exception covers every cut and every plan
  — process/designs/BEAVER.md — author
- An acceptance test is a check written from the sections of the specification the slice draws on,
  failing until the slice delivers what they say and passing once it does; the plan holds each test's
  full text; on a process design the acceptance tests are checks over the process documents
  — process/designs/BEAVER.md — author
- A specification's declaration that its first slice tests its approach is written in the specification
  itself, with the example outputs written out — process/designs/BEAVER.md — author
- The steps the process designs give a slice are written into its plan before the first task or after
  the last, and carried out by the execute skill — process/designs/BEAVER.md — author
- A plan for a fix carries the same contents as a slice's plan, its acceptance tests being those that
  show the defect — process/designs/BEAVER.md — author
- A plan's reviewer is given the plan, the sections of the specification it draws on, and every file
  the plan names as it stands when the pass runs, with every earlier plan at the ripple pass, and
  nothing else; the cut's reviewer is given the cut and the specification — process/designs/BEAVER.md
  — author
- A blocking finding the beaver rejects keeps the loop from stopping clean, and another round runs on
  the text as it then stands — process/designs/BEAVER.md — author
- After a stop by the carve-out, the rest of that round's findings are still ruled on and acted on, and
  once the specification is amended the loop starts again at round 1 — process/designs/BEAVER.md
  — author
- The beaver collects its questions as it goes and brings them all at slice 1's pause, having worked
  through every plan's first writing and ripple pass; it stops before then only when every piece of
  work left waits on an answer, and that stop is slice 1's pause; questions not yet answered are
  carried in the handoff — process/designs/BEAVER.md — author
- The beaver rules on the findings of the seam review that follows a slice of a process design,
  through its loop and cap, a finding that needs the design decided coming to the author as a gap; the
  overriding rule's exception covers a built slice of a process design — process/designs/BEAVER.md
  — author
- Each specification's table of slices in ROADMAP.md carries a status column, set by the beaver and by
  the execute skill — process/designs/BEAVER.md — author
- When the build stops on a test, the beaver proposes whether the specification, the test or the code
  is wrong, and the author rules; if the specification stands, the plan is corrected through its loop
  and the build goes on with no amendment — process/designs/BEAVER.md — author
- A correction is placed before any slice not yet built: straight after the slice it corrects, unless
  slices after that one are already built — process/designs/BEAVER.md — author
- ELEPHANT.md and BEAVER.md are cut and planned by running BEAVER.md by hand, before it is built; the
  author's sign-off of BEAVER.md lets its loops act on the findings on those cuts and plans without the
  author — none — author
- A correction that starts while its specification is already active, because what the last slice
  built was found wrong after it closed, counts as the first slice of a new cut: the specification is
  implementation ongoing again from its start, and active again once the last slice closes; where the
  change was a diff that has already folded in, this is its target; the correction goes first over a
  change pending against the specification that has not started, which does not start until the
  correction is built, and waits itself for a change already implementation ongoing to fold in —
  process/designs/ELEPHANT.md — author
- A collision found when a diff's first slice is about to start is settled by amending the diff in
  place, as one found at fold-in is, not by an elephant — process/designs/ELEPHANT.md — author
- When a specification is amended in place, its rows in REVIEWS.md, or a diff's lines in its target's
  block, are updated once the author has ruled on the findings of the amendment's reviews: the section
  row names every section now reviewed, and the document and seam rows are replaced —
  process/designs/ELEPHANT.md — author
- When a pending diff moves into an elephant, the lines naming it in its target's REVIEWS.md block
  follow it to the draft's path; close-out names it by its final name, replaces its section line's
  entries for the sections that changed, and replaces its document and seam lines —
  process/designs/ELEPHANT.md — author
- Section "The author is shown neither the cut nor any plan" — Where does the method depart from
  elephant-goldfish, which shows the person what its loops are doing, and why? — SOURCES.md — 29th —
  author
