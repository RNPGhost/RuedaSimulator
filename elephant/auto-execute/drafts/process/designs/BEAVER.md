# The beaver — cutting a signed-off design and writing its plans

> **Status:** draft

## 1. What the beaver is

**The beaver is the agent that turns a signed-off design into slices and plans ready to build,
correcting them through reviews of its own, and bringing the author only what the specification leaves
open or a loop cannot settle, and then stops before each slice is built.** It takes over where the elephant ends, at sign-off (`ELEPHANT.md` §1), and is not the
elephant: the elephant settles a design with the author, and the beaver prepares what builds it. This
section is read by the author, who needs to know what the beaver decides alone and where it stops for
them, and by whoever writes the plans that bring the process documents into line with this design.

### What it does

**It starts on the author's word.** Close-out ends by offering, as its default, to start the beaver in
a fresh session for the design just signed off, and the beaver starts when the author agrees.

**From then until everything the design specifies is built, the beaver does four things:**

- it cuts the design into slices, every slice at once, and writes a plan for each as soon as the cut
  is made (§2);
- it puts the cut and every plan through a loop of fresh reviews, acting by its own judgement on what
  they find, until nothing blocking is left or a cap is reached (§3);
- it brings each plan up to date once the plans before it have settled, and once more against the code
  just before the plan is carried out (§2);
- before each slice is carried out, it pauses for the author (§4).

**It does not carry a plan out.** The `execute` skill does, started on the author's word at the pause
(§4).

**It works the same way on a process design** as on a specification of the system: it cuts it, writes
and reviews its plans, and pauses before each slice.

**Every plan goes through the same loop**, not only the plans of a cut: a plan for a fix, or for a
document written before the elephant existed, is reviewed and corrected the same way, and the exception
below covers it.

### What stays with the author

**The author is shown neither the cut nor any plan, and rules on only two kinds of finding about
either:**

- a finding that the cut or a plan could settle only by deciding something its specification does not
  say. It stops the loop and goes to the author, and the beaver changes a specification only with the
  author, who rules item by item (§5);
- a finding still standing when a loop reaches its cap (§3).

**On every other finding about a cut or a plan, and on the seam review that follows a slice of a
process design (§4), the beaver rules itself**, giving it one of the three
outcomes a finding can have, and records the ones it rejects (§3).

**What the author ruled on before stays theirs.** Every finding of the design's own reviews — the
interview, section, retirement, ledger, document and seam reviews — is still ruled on item by item, as
`ELEPHANT.md` §5 says; those have all ended by sign-off, before the beaver begins, and those that run
again when a specification is amended in place are ruled on the same way (§5). And the author decides
when each slice is built (§4).

**On a process design, the gaps the beaver finds go to the author as questions about what the process
should do, never about wording.**

### The exception in the overriding rule

**The overriding rule states the beaver's exception itself**, so that an agent given only the text the
session-start hook injects knows it. Once this design and `ELEPHANT.md`'s wording of the rule (§3 of
that document) are both built, the rule's section in `METHOD.md` ends with this paragraph, after the
one that begins *"If you are an agent"*:

> **The one exception:** findings on a cut into slices, a plan, or a built slice of a process design
> are acted on without the author, except what the specification leaves open and what is left at the
> loop's cap.

Measured on 2026-11-01 with `ELEPHANT.md`'s wording of the rule in place, the hook's text with this
paragraph added is 1,885 characters, against the 1,900 that `test/hooks.js` allows it.

**The other rules that would contradict the beaver make the same exception.** `METHOD.md`'s rule that
a review runs once and stops excepts the beaver's loops, and so does every process document that tells
an agent to bring every finding to the author — the per-message reminder hook among them — so that nothing a beaver's session is told contradicts what it does.

### This document

**This is a process design, the specification of the beaver** (`ELEPHANT.md` §6). It states what must
be true once it is built; the slices cut from it bring the process documents — `METHOD.md`, the skills,
the reviewer prompts, the hooks and `PILOT.md` — into line with it. Its evidence waits beside
`SOURCES.md` as a diff, shared with `ELEPHANT.md`, until it folds in (`ELEPHANT.md` §6). It is kept
apart from `ELEPHANT.md`, and kept small, so that it can be written and reviewed quickly (§6).

## 2. The cut and the plans

**The beaver cuts the whole design at once and writes every slice's plan straight away, so that the
gaps in the specification come out before anything is built.** Each plan is then reviewed again as the
plans and slices before it settle, and every plan takes one shape, built around the slice's acceptance
tests. This section is read
by the beaver, and by whoever changes the `slice` and `plan` skills to match it.

### The cut

**The cut is made whole: every slice at once, in order.** The list of slices is kept in `ROADMAP.md`,
as a table under the design's entry. The cut goes through the loop of §3, and counts as made once that
loop has stopped with nothing blocking left, or once the author has ruled on what stopped it.

**A system specification may declare that its first slice tests whether its approach holds**, with the
example outputs that show it; the elephant asks every system specification whether it does (`ELEPHANT.md`
§4). The declaration is written in the specification itself, with the example outputs written out, and
the beaver reads it there, never in the elephant's working files. Where it is made, slice 1 is that test, and its example outputs are what the author checks at the
pause before slice 2 (§4). Where it does not, slice 1 is the usual walking skeleton.

### When each plan is written

**One plan is written for each slice, as soon as the cut is made** — even when slice 1 is to prove the
approach first. A gap a plan finds in the specification is cheapest to settle before anything has been
built on it. When an earlier slice then changes the specification, the plans after it are reworked
(§5); that rework is the cost accepted for finding the gaps early.

**Each plan goes through three passes**, each a run of the loop in §3:

1. **Its first writing**, which assumes that every slice before it in the cut's order is built. Where
   an earlier slice changes a file, the plan quotes that earlier plan's stated output, as the `plan`
   skill already has a task quote an earlier task's.
2. **Its ripple pass**, once the plan of every earlier slice has settled: it has had its own ripple
   pass, and so will not change again before it is built except through an amendment (§5) or its own
   last pass. The plan is not rewritten for this pass; it goes through the loop again with every
   earlier plan in front of its reviewer. Slice 1's plan has no earlier plans: it has no ripple pass,
   and counts as settled once the loop of its first writing has stopped.
3. **Its last pass, just before it is carried out**, once every earlier slice is built — that is, once
   the `execute` skill has closed its plan. The plan goes through the loop once more, against the code
   as the earlier slices left it, and then the beaver pauses for the author (§4). From this pass on, the
   plan is a change from the code as it is, as the `plan` skill requires. On a process design, the code
   is the process documents, with the checks, scripts and records the design requires.

**The beaver works in this order:** the cut; every plan's first writing, in the cut's order; every
ripple pass, in the same order; then each slice's last pass as the slices before it are built. Slice
1's last pass and its pause come before the later plans are all written only when every piece of work
left waits on an answer, so that the author can choose to start slice 1 rather than wait (§4).

### What every plan contains

**An acceptance test is a check written from the sections of the specification the slice draws on.** It
fails until the slice delivers what those sections say, and passes once it does. The plan holds each
test's full text: writing the tests is what finds the gaps in the specification, so they cannot wait
for the build. On a process design, the acceptance tests are checks over the process documents.

**Every plan carries these, besides what the `plan` skill already requires:**

- **Its first task writes the slice's acceptance tests, and its check is that they fail.** The `plan`
  skill's shape for a task is changed to allow it. No later task edits a test the first task wrote; a
  test found wrong stops the build and goes to the author (§5). Acceptance tests are written to files
  of their own, and once the first task's check passes, those files are guarded until the
  specification's last slice closes: no agent changes one without the author's word, which the harness
  asks for when the change is attempted, rather than a plan only forbidding it; and a change made by
  any route, a shell command included, is caught before it is committed. The slice that builds the
  guard chooses how it is built and how it is kept out of an agent's reach.
- **Every later task fails its own check and then passes it.**
- **Its last task runs every check, shows the acceptance tests passing with the commands' output, and,
  for a system specification, produces what the author will look at** (§4).
- **Every step the process designs give its slice**, written into the plan as a step before its first
  task or after its last, and carried out by the `execute` skill as `ELEPHANT.md` §6 says: setting
  `implementation ongoing` before the first slice's first task, and setting `active`, or folding in a
  diff, after the last slice's last task.
- **A progress section**, updated while the plan is carried out.
- **For each risky step, how to retry it or undo it.**

**A plan for a fix carries the same**, its acceptance tests being those that show the defect.

## 3. The review loop

**The cut and every plan are corrected by a loop: a fresh reviewer reads it, the beaver rules on what
comes back and acts on it, and a new fresh reviewer reads the result.** The loop stops when a review
finds nothing blocking, when five rounds have run, or when a finding needs the specification decided.
This section is read by the beaver, which runs the loop, and by whoever writes the reviewer prompts and
the check that keeps the loop's record.

### One round

**Each round is one review and the beaver's answer to it:**

1. **A fresh reviewer reads the cut or the plan whole and writes a report**, dispatched through the
   `goldfish` skill as every review is, on the same tier of model and at the same effort as every other
   review (`ELEPHANT.md` §5). Each round's reviewer is new, has seen no earlier round, and is not told
   what changed since one.
2. **The beaver verifies each finding by measurement**, against whichever of the specification, the
   code and the earlier plans exist, before it believes it. It reads the report sceptically: a reviewer
   asked to find problems finds some whether or not they are there.
3. **It rules on each finding**, giving it one of the three outcomes `ELEPHANT.md` §3 defines —
   *accepted*, *immaterial* or *rejected* — and sorts out which are blocking (below).
4. **It acts on every finding it accepts**, without the author. Only an accepted finding changes the
   text.

**What each reviewer is given, and asks.** Each has a prompt of its own.

- **A plan's reviewer** is given the plan, the sections of the specification the plan draws on, and
  every file the plan names, as each stands when the pass runs; at the ripple pass, every earlier plan
  as well (§2). It is given nothing else. It asks whether it could carry out each task without asking,
  checks every rule a plan must follow — the `plan` skill's and those of §2 — and skips style.
- **The cut's reviewer** is given the cut and the specification. It asks two questions: whether every
  part of the specification lands in some slice, and whether each slice can be built from those before
  it.

### When the loop stops

**A finding is blocking when whoever acts on the text would have to ask, or would guess, or would build
the wrong thing** — for a plan, its executor; for the cut, whoever writes the slices' plans. The loop
stops in one of three ways:

- **clean** — the latest review returns no blocking finding, however the beaver then rules on it. A
  round in which the beaver rejects a blocking finding is followed by another, on the text as it then
  stands. On a clean stop, the findings the beaver accepts are still acted on, and nothing reviews the
  result. The loop does not run on until a review comes back empty (§6);
- **at the cap** — five rounds of this loop have run (`SOURCES.md`, *A plan's review loop stops when
  nothing blocking is left, or at five rounds*). The blocking findings of round 5 that the beaver
  rejected go to the author, each as a plain question about what the author wants, with the beaver's
  proposed answer first (§4). The plan is not carried out until the author has ruled; the beaver goes on
  with the other plans meanwhile;
- **by the carve-out** — a finding that could be settled only by deciding something the specification
  does not say. It goes to the author as §4 says, with the change to the specification the beaver
  proposes (§5). The beaver still rules on and acts on the rest of that round's findings, and once the
  specification has been amended, the loop starts again at round 1.

**A finding the beaver rejected counts as blocking again whenever a later review raises it** — a later
round of the same loop, or any later loop of the same plan — whatever the beaver ruled before. Nothing
more is done about it: if it keeps coming back, the cap sends it to the author.

**The loop has no limit on cost beyond the cap.** The author has accepted three loops for each plan —
its first writing, its ripple pass and its last pass, two for slice 1 (§2) — the cut's own loop, and
the further loops an amendment needs (§5). This is what the author agreed to pay, not a limit the
beaver enforces.

### Where a loop runs, and what is kept of it

**A loop is split across sessions only by a handoff**, and the loop of a plan's first writing runs in
the session that wrote the plan. A handoff partway through a loop records the last round completed and
the findings rejected so far.

**`REVIEWS.md` records one row for each loop:** which pass it was, how many rounds ran, why it stopped —
clean, at the cap, or by the carve-out — and the findings the beaver rejected. A loop still running
reads `running`. A plan's rows go in the plan's block; the cut's loop goes in the block of the design it
cut. `test/reviews.js` fails on a loop's row that does not record the rounds and the reason it stopped.
The two plans spent before the beaver existed are named as its only exemptions.

## 4. What the author sees

**Between sign-off and the end of the build, the author sees four things: the questions only they can
answer, a pause before each slice, what each slice of a system specification built, and any test found
wrong while a slice is built.** None of them is a cut or a plan. This section is read by the author,
who needs to know when the beaver will stop for them and what it will bring, and by whoever changes the
`execute` skill and `PILOT.md` to match it: `PILOT.md` gains the author's side of this section, and the
`execute` skill keeps its own way of staging what a person looks at, while this section says what is
shown.

### Questions

**The beaver collects its questions as it goes, and brings them all at slice 1's pause.** It works
through every plan's first writing and ripple pass (§2) without stopping, and gathers every gap in the
specification that a loop stops on (§3), with the blocking findings of round 5 that it rejected at a
loop's cap. It stops before then only when every piece of work left waits on an answer, and that stop
is slice 1's pause, so that the author can choose to start slice 1 rather than wait. Questions not yet
answered when a session ends are carried in its handoff. After slice 1's pause, questions come at the
next pause, or sooner if every piece of work left waits on an answer.

**Each question is put plainly, as what the author wants, with the beaver's proposed answer first.** For
a gap, the proposed answer is the change to the specification the beaver proposes, and the gap is
settled by changing the specification with the author (§5). For a finding left at the cap, the question
is what the plan should build.

### The pause before each slice

**Before each slice is carried out, the beaver pauses**, after the slice's last pass (§2), and also
before a plan for a fix is carried out. At the pause the author can:

- ask questions, such as what will change and how long it will take;
- choose what is built when, across specifications; within one specification, the cut fixes the order;
- coordinate slices of different specifications being built at the same time.

The beaver offers, as its default, to start the slice with the `execute` skill in a fresh session, which
starts on the author's word. A plan whose loop stopped at the cap still has its pause, but the beaver
offers no start until the author has ruled on what was left. At the pause before slice 2 of a
specification whose slice 1 tests its approach, the beaver also shows what slice 1 produced beside the
example outputs the specification gives; an approach that does not hold is handled as §5 says. This
pause is what making the whole build automatic would later remove (§6).

**Every pause opens with the same short summary:** how many of the specification's plans have not yet
settled (§2), how many of its slices are still to be built, and every slice being built or waiting,
across every specification. Each specification's table of slices in `ROADMAP.md` carries a status
column for this, set by the beaver and by the `execute` skill.

### What a slice built

**After each slice of a system specification, the author looks at what it built**, when the `execute`
skill closes the slice down: the changes to the app, any new move diagrams, and the test cases and files
made to show the intended behaviour, with the slice's acceptance tests. The next slice's pause follows,
and the author may look before giving the word. A test the author finds wrong or short of what is
wanted, or anything else in what was built that is not what they want, is settled by changing the
specification (§5). So is a test found wrong while the slice is being built (§2).

**After a slice of a process design, the author looks at nothing.** The slice's checks stand in, with a
fresh seam review between the process documents the slice changed and the design. The beaver rules on
that review's findings itself, through the loop of §3 and its cap; a finding that needs the design
decided comes to the author as a gap.

## 5. When the specification proves wrong

**When a plan, a test slice or a built slice shows the specification is wrong, the specification is
changed with the author, and the beaver then cuts again and reviews again whatever the change
reaches.** The beaver never changes a specification, or any other design, by itself; on a process
design it edits the process documents, never the design. This section is read by the beaver, by the
author, who rules on every change, and by whoever changes the `execute` skill to stop on a wrong test.

### Four ways it shows

- **A plan finds a gap.** A finding that the cut or a plan could settle only by deciding something the
  specification does not say stops the loop (§3). The beaver proposes the change to the specification
  that would settle it — a clarification is a change, and takes the same route — and puts it to the
  author as §4 says. A gap found by the seam review after a slice of a process design (§4) is handled
  the same way, with a correction (below) where what was built no longer matches.
- **A test slice shows the approach is wrong.** At the pause before slice 2, the author compares what
  slice 1 produced with the example outputs the specification gives (§4), and judges the approach partly
  or wholly wrong.
- **What a slice built is not what the author wants.** The author finds it at the look after the slice
  (§4).
- **The build stops on a test.** The `execute` skill stops when it cannot make a test pass without
  editing it, since no later task may edit a test the first task wrote (§2), and reports to the author
  in that session. The beaver works out whether the specification, the test or the code is wrong, and
  proposes which; the author rules. If the specification stands, the plan is corrected through its loop
  and the build goes on, with no amendment. If it is wrong, it is amended (below). Either way the slice
  counts as not yet built, its plan goes through the loop again, and the `execute` skill resumes from
  the plan's progress section. A blocker that is not a test stays with the `execute` skill's own rule,
  and the beaver corrects the plan through its loop without the author.

### Changing the specification

**From sign-off on, a specification is amended in place, with the author, who rules item by item**,
whether or not any slice has been built, and its reviews run again as `ELEPHANT.md` §6 says. The beaver
dispatches them, and the author rules on their findings item by item, before anything is cut again. The
beaver proposes the change; it makes none the author has not ruled. On a process design the questions
are about what the process should do, never about wording (§1). An amendment in place covers a change
of any size; an elephant is the route only for a change the author starts.

**After an amendment, the beaver cuts again and reviews again whatever it reaches.** A changed section
is one whose text changed.

- **The slices not yet built that the amendment reaches are cut again**, and the cut's loop (§3) runs
  over them, its reviewer given the whole cut.
- **A plan whose slice changed is rewritten and goes through the loop**, as does a plan that draws on a
  changed section; its row in `REVIEWS.md` records the pass as `amendment` (§3). A plan whose slice the
  cut removes is void. A slice the cut adds gets a first writing.
- **The ripple pass runs again**, in slice order, for every plan after the earliest one the amendment
  changed (§2); a plan that has already had its last pass has it again.

A slice already being built carries on unless the amendment reaches it. The next slice does not start
until the amendment's loops have stopped.

### Corrections

**A correction is a slice that brings what was built into line with the amended specification.** It is
a new entry in the cut, placed before any slice not yet built: straight after the slice it corrects,
unless slices after that one are already built. It is planned, reviewed and paused like any slice. It
may edit the tests earlier slices wrote, since the specification they were written from has changed.

**A built slice whose acceptance tests, or anything else it built, the author finds wrong** is cut
again against the amended specification, as a correction.

### A test slice that fails

**No later slice starts while the approach is in question**, which it is until the correction is built
and the author has compared its outputs again, at the pause after it.

- **Partly wrong:** the specification is amended in place with the author, slice 1 is cut again as a
  correction, and every plan goes through the loops the amendment needs (above).
- **Wholly wrong:** on the author's word, the beaver reverts slice 1's commits and sets the
  specification back to `finalised` with no slice started (`ELEPHANT.md` §6), so that an elephant may
  move it in and rework it. Every plan, the table of slices, and their rows in `REVIEWS.md` are deleted.
  The beaver offers an elephant as its default, and stops.

## 6. What was decided against

**Every alternative the author ruled against while this design was settled is here, with the reason
against it, and so is what the design deliberately leaves undone.** This section is read by a later
elephant that changes or replaces this design, which asks the author whether each reason still holds
(`ELEPHANT.md` §7, *What a later elephant reads*). Each entry says what the alternative would have been,
what the design does instead, and why not; in the grouped list at the end, the heading names the
section that settles each. The alternatives ruled against on `ELEPHANT.md`'s own rules belong to that
document, not this one.

### What it does not do

**Making the whole build automatic.**

- **What it could have been:** from sign-off until the specification is entirely built, the beaver
  would cut, plan, review and start each slice with no word from the author.
- **What it does instead:** the beaver pauses before each slice, and the slice starts on the author's
  word, with starting it offered as the default (§4).
- **Why:** the author wants to ask what a slice will change and how long it will take, to choose what is
  built when, and to coordinate slices built at the same time, and does not yet trust the beaver to run
  unwatched. Once they do, a later change to this design may remove the pause; nothing is built now to
  make that a switch.
- **The cost, accepted:** one word from the author before each slice.

**Making an elephant lighter.**

- **What it could have been:** an elephant that opens a signed-off document would run fewer steps and
  fewer reviews than one that writes a new document.
- **What it does instead:** nothing here. It is separate work, on the backlog, whose entry names
  amending a specification in place (§5) as where it could start.
- **Why:** it serves a different intent, and would roughly have doubled this design.
- **The cost, accepted:** the next elephant on a signed-off document is the heavy case it would fix.

**Where these end up.** Neither moves into the process documents as a non-goal, and both stay here as
reasoning. The first also has a working side, the pause, which §4 states positively and the slices
carry into the process documents.

### The beaver designed inside `ELEPHANT.md`

**What it would have been:** the loop as a new section of `ELEPHANT.md`, beside its rules about
building — one document fewer.

**Instead:** it has a process design of its own, this one, kept small so that it can be written and
reviewed quickly (§1, *This document*). `ELEPHANT.md` changes only where its own rules collide with the
beaver's.

**Why not:** the loop governs every plan, including a plan for a fix that no elephant produced, and
somebody asking how a plan is reviewed would not open the design of the conversation that settles a
document. `ELEPHANT.md`'s subject would widen from the elephant to building, and its title and opening
with it.

### A loop that runs until a review comes back empty

**What it would have been:** the loop would stop only when a fresh review found nothing at all. A
related form, in the request that began this design, stopped when the beaver believed an executor
could carry the plan out exactly, first time, with nothing more to go on.

**Instead:** the loop stops when the latest review finds nothing blocking, at five rounds, or on a gap
in the specification (§3).

**Why not:** a reviewer asked to find problems finds some whether or not they are there (`SOURCES.md`,
*A plan's review loop stops when nothing blocking is left, or at five rounds*), so minor findings never
run out; this project's own rounds of review went 20, 11, 8 and 8 findings on the category that
mattered (`SOURCES.md`, *A review is not re-run on its own*). The beaver's belief is the confidence of
the agent that has just applied the fixes, whose blind spots the fresh reviewer is there to counter, so
a loop stopped by it either never stops or stops on a feeling.

### What else was ruled against

Grouped by the section that settles each.

**What the beaver is (§1)**

- **Every finding on a cut or a plan ruled on by the author, item by item, as the overriding rule has
  it for the design's own reviews.** Instead, the beaver rules on them itself, bringing the author only
  a gap in the specification and the blocking findings it rejected that still stand at a loop's cap
  (§1, §3). Why not: the author reads neither the cut nor any plan, and cares that what is built
  matches the specification, not how it is sliced or planned. The overriding rule exists so that the
  author keeps knowing what is in their own documents, and the document they do read, the
  specification, the beaver never changes without them (§5).
- **The agent called the elephant, or the plan keeper.** Instead, the beaver. Why not: the elephant
  ends at sign-off, and `ELEPHANT.md`'s rules turn on whether work is inside an elephant, so the name
  would put the beaver's rules in the wrong place. *The plan keeper* is plainer, but the beaver pairs
  with the elephant and the goldfish, and finding a leak, patching it and checking until the dam holds
  is the loop's shape.
- **Every finding on a plan acted on by the beaver, with no carve-out.** Instead, a finding that needs
  the specification decided goes to the author (§3, §5). Why not: a plan that settles a gap by deciding
  what the specification does not say decides the author's intent, and the code then follows a decision
  the author never made, which is what the overriding rule exists to prevent.
- **The exception stated in `METHOD.md`'s body, not in the rule.** Instead, in the rule itself. Why
  not: the session-start hook injects the rule and not the body, so a beaver in the middle of a loop
  would be told *never* and would stop.
- **The exception covering only the plans of a cut.** Instead, every plan, a plan for a fix included.
  Why not: the author reads no plan, a fix's no more than a cut's, and wording that covered only some
  plans would need a way to tell a beaver from any other agent writing a plan.
- **The beaver starting by itself at sign-off, or only when the author asks for a cut.** Instead,
  close-out offers it as the default, and it starts on the author's word. Why not: started by itself, it
  would begin work the author had not given the word for, where every slice waits for one; started only
  when asked, it could be forgotten, which an offered default prevents.
- **The plan reviewer's prompt drafted here in full as well, or nothing drafted in full.** Instead, only
  the overriding rule's new wording. Why not: the rule is the one text whose length has to be measured
  against the hook's limit before this design can promise it; the prompt would restate rules §2 and §3
  already state, and is written by its slice.

**The cut and the plans (§2)**

- **The author approving the cut, or the cut not reviewed at all.** Instead, the cut is the beaver's,
  with a loop of its own (§3). Why not: the author does not care how a design is sliced, only that what
  is built matches the specification; and a part the cut drops is the one failure no plan review
  catches, since each plan's reviewer sees its own slice.
- **Each plan written only when its slice is reached, or the later plans held back while slice 1 tests
  the approach.** Instead, every plan as soon as the cut is made. Why not: a gap a plan finds is
  cheapest to settle before anything is built on it, and writing every plan finds the gaps together
  rather than one at a time. Rework costs machine time; a gap found during the build costs the author's
  attention. `SOURCES.md` records where this departs from the `slice` skill's rule that a later slice's
  plan learns from what the earlier slices turned out to be (*Every plan is written as soon as the cut
  is made*).
- **A plan carried out as first written.** Instead, a ripple pass and a last pass. Why not: a first
  writing assumes that the slices before it are built as their plans say, so plans that disagree on a
  name, a file or an order of work, and drift between what earlier plans said and what was built, would
  both reach the executor.
- **A test slice for every specification, or one decided by a yes or no at sign-off, or by a rule the
  cut applies.** Instead, a system specification declares it, and the elephant asks every one. Why not:
  a standing rule costs a small specification a test slice and a wait for nothing; whether the approach
  is trusted is the author's judgement, not a rule's; and the specification is what the author reads and
  approves, so the declaration and its example outputs belong there, which left the question at sign-off
  nothing to decide. A test slice by default, with a way to opt out, would never apply, since every
  system specification is asked.
- **The usual walking skeleton standing in for the test slice.** Instead, a declared test slice shows
  the approach's output against the example outputs the specification gives, and slice 1 is the walking
  skeleton only where nothing is declared. Why not: a walking skeleton proves that the pieces connect,
  not that the approach gives the right output.
- **Later tasks free to edit the acceptance tests, or kept from them only by the plan's rule.**
  Instead, every test a plan's first task wrote is guarded, and changes only on the author's word,
  asked for when the change is attempted; a test found wrong stops the build. Why not: agents edit
  tests to make them pass, even when told not to, and tests they cannot edit help (`SOURCES.md`, *A
  plan writes its acceptance tests first, and nothing later edits them*); and a rule that must always
  hold is enforced, not written down (`SOURCES.md`, *A rule that must always hold is enforced, not
  written down*).
- **A guard that refuses every change to a test until a recorded ruling lifts it.** Instead, the guard
  asks the author when a change is attempted. Why not: a guard lifted by a recorded ruling needs a
  route for every way a test can come to change — a test ruled wrong, a correction, an amendment that
  reaches a slice part-built — and a way for the harness to learn of each ruling; asking the author
  makes their word, given when the change is attempted, the ruling. The cost, accepted: a session that
  meets a guarded test while the author is away waits for them.
- **The list of slices in a file beside the specification.** Instead, a table in `ROADMAP.md`. Why not:
  the list is backlog, as the `slice` skill says, and `ROADMAP.md` is where the backlog and the method's
  own slices already are.

**The review loop (§3)**

- **A cap of four rounds.** Instead, five. Why not: the evidence for four — this project's rounds,
  whose findings had stopped falling by the fourth — is weak, since those were reviews of a design, with
  a person applying the fixes. Five is ClaudeFlows' cap (`SOURCES.md`, *A plan's review loop stops when
  nothing blocking is left, or at five rounds*).
- **A rejected finding that comes back sent straight to the author.** Instead, it counts as blocking
  again, and the cap sends what is left. Why not: it would bring the author findings about plan text,
  which they do not read, before the loop had run its rounds; the cap already sends on a finding that
  keeps coming back.
- **A cheaper model for the later rounds.** Instead, every round on the same tier and effort as every
  review. Why not: Sonnet, the tier below Opus, wrongly flagged nearly twice as many sound requirements
  (`SOURCES.md`, *Every review runs on the Opus tier at high effort*), and each false finding here is a
  round the beaver spends alone.
- **A session for each round.** Instead, a loop runs whole in one session unless a handoff splits it.
  Why not: each round's reviewer is already new and has seen no earlier round, so a session per round
  would add a handoff per round and nothing else.
- **The plan reviewer kept from the code, with findings caused by the missing map never blocking; or no
  loop on a plan that changes code until a map of what lives where in the code exists.** Instead, the
  reviewer is given every file the plan names. Why not: the first leaves plans unreviewed against the
  code they change, and the second waits on a map that nothing is building. Kept from the code as things
  stand, nearly every plan that changes code would reach the cap.
- **Nothing recorded of a loop, or a line for each plan put in front of the author.** Instead, a row in
  `REVIEWS.md` for each loop, which `test/reviews.js` checks. Why not: with nothing recorded, nothing
  shows whether a loop ran; and the author has said they will not read a line put in front of them,
  where a check reads the row on every commit.

**What the author sees (§4)**

- **A plan left at the cap carried out anyway, with its findings recorded.** Instead, it is not
  carried out until the author has ruled. Why not: a finding still blocking is one on which the executor
  would ask, guess or build the wrong thing.
- **One pause once every plan is ready, after which the build runs to the end; or every slice waiting
  for the author's look at the one before.** Instead, a pause before each slice, at which the author may
  look first. Why not: one pause takes away the control the author wants over what is built when, and the
  chance to coordinate slices built at the same time; waiting on the look would make the author the
  bottleneck, when the pause already lets them look first if they choose.
- **The gaps outside slice 1 held back until slice 1's result.** Instead, the beaver collects its
  questions and brings them all at slice 1's pause, before slice 1 is built. Why not: the author wants
  every gap before slice 1 is built, so as to choose between starting it and settling the gaps first.
- **Slice 1's pause as soon as its plan is ready, with the gaps found so far, and later questions at
  later stops.** Instead, the beaver works through every plan's first writing and ripple pass before
  that pause. Why not: it stops for the author earlier and more often.
- **Slice 1's pause only once every plan is written, with no exception.** Instead, it comes sooner when
  every piece of work left waits on an answer. Why not: the beaver would then stall, with nothing it
  could do and nobody asked.
- **The summary counting only the plans still being written, and only with the gaps.** Instead, every
  gap report and every pause count both the plans and the slices still to be built. Why not: choosing
  whether to start slice 1, and coordinating slices, both turn on how much is left to build as well as
  to plan.
- **The acceptance tests shown before anything is built.** Instead, with what the slice built. Why
  not: the author looks at each slice once, after it is built, and reads its tests there, beside what
  they test; where a specification declares a test slice, that catches the risky cases first.
- **No look at what any slice built.** Instead, the author looks at what each slice of a system
  specification built. Why not: this project's simulator is an animation, and seeing what was built is
  the only way to tell whether it is what was wanted; what a slice built and the tests that show it are,
  with the specifications, what the author reads.
- **After a slice of a process design, a summary for the author, or the author ruling on its seam
  review.** Instead, the author looks at nothing, and the beaver rules on the seam review. Why not: the
  author cares that the process documents carry the research and their preferences and stay
  consistent, not about their wording, and either would have them reading process text after all.

**When the specification proves wrong (§5)**

- **A gap found after sign-off settled by taking the specification back through an elephant, stopping
  the build; or a change made during the build by a diff elephant.** Instead, the specification is
  amended in place with the author, whatever the change's size, short of an approach a test slice shows
  wholly wrong (below). Why not: taking it back through an elephant voids every slice and plan cut from
  it, and stops the build meanwhile; and a diff folded into a document whose slices are still being
  built collides with them. An amendment keeps the section, document and seam reviews and leaves out the
  interview and the ledger, since it starts from a gap the author rules on as each change is made.
- **Only the document and seam reviews run again after an amendment.** Instead, the cut's loop and the
  plan loops the amendment reaches run again as well. Why not: a plan written against the old
  specification would be carried out unreviewed.
- **Every test the build stops on settled by changing the specification.** Instead, the beaver proposes
  whether the specification, the test or the code is wrong, and the author rules. Why not: the test or
  the code can be wrong while the specification is right, and amending it then would change what the
  author wanted to fit a mistake.
- **A failed test slice always amended in place, however badly it failed.** Instead, an approach wholly
  wrong is reverted and goes back to an elephant. Why not: a wholly wrong approach needs the design
  reworked, which is an elephant's work, not an amendment's.
- **A built slice found wrong left standing, with its fix a new slice at the end.** Instead, a
  correction before any slice not yet built. Why not: every slice still to be built before the fix
  would be built on what is wrong.
