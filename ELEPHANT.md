# The elephant — the conversation before a document, and the writing of it

> **This is a design document about how work is done here, not about the system this repository
> builds.** It belongs to the *about the work* family, which has no layers; layers divide the other
> family.
>
> **It is followed until its contents have moved into the process documents, and kept afterwards as the
> record of why.** Once the design is signed off it is cut into slices, and each slice moves part of it
> into `METHOD.md`, two new skills, `PILOT.md` or `SOURCES.md`. Until the last slice has done so, this
> file is what each slice works from. After that nothing is followed from it, and it is kept beside
> `SOURCES.md` as the reasoning behind those changes. Keeping it goes against the rule that a superseded
> document is deleted, and §7 argues the exception.
>
> **`ROADMAP.md`'s slice 7.1 entry records what was decided, and wins wherever the two disagree.** This
> file says how the thing works and what stands behind it. Where that entry says a document is
> *finished* when *"the author saying so"*, it means what this file calls signing off.
>
> **It contains no plan.** The design is signed off, then it is cut into slices, and one plan is written
> per slice when that slice is reached. A plan written now would be planning against a design that has
> not stopped moving.

---

## 1. What the elephant is

### The definition

**The elephant is the work of settling a design with the author and writing it down.** It has two
parts: a conversation in which the agent questions the author until what is wanted is settled, and then
the writing that records it, one section at a time, in one document or several.

**It starts when the author opts in** — usually on a change whose shape is not yet settled enough to
write down.

**In between, in order:** a search for an existing document that already covers the change; the
questioning itself, called the interview; a review of that conversation; the author's decisions;
the writing, each section reviewed as it settles; a check that every decision reached its document; a
review of each whole document; and close-out. Steps can repeat; §3 says which, and defines each step. §5
covers the reviews.

**It ends at close-out**, when three things are true: each document is where it will stay, the working
files are deleted, and the author signs the design off. For a specification (a Layer 1 document), that
is where it was written: the specification itself, edited in place, and a design touching several
subjects is written into one specification for each (§3). For a change to the process that has no
single home, it is a file like this one — followed until slices have moved its contents on, and kept
afterwards as reasoning. Signing off is what allows the design to be cut into slices.

**Writing is inside the elephant, not a step after it**, because writing a section is often where a
question nobody asked first shows up. When one does, the agent puts it to the author as a question in
that section's review, without going back to the interview. If writing came after the elephant, that
question would arrive once the design had already been declared settled.

**An elephant usually runs across several sessions**, and each session starts with no memory of the
last. What it remembers is kept on disk — in its working files (§4) and in the handoff that closes each
session — not in the conversation.

### When it is used, and who decides

**The agent must propose it; the author decides.** At the start of any change that would produce new or
changed intent, a new document about the work, or a change to what one requires — never a typo, a
change to code alone, a plan, a map update or a check — the agent says whether it thinks the change needs an elephant, and why.
The author rules either way, and may call for one the agent did not propose or turn down one it did. No
work on the change begins until they have. Work done inside an elephant already running needs no fresh
proposal.

| It is for | It is not for |
|---|---|
| a new system | a correction |
| a substantial rework | an edge case somebody missed |
| a feature whose shape is not yet known | a clarification |
| a design bug: the specification works exactly as written, and is wrong anyway | a change that conforms to a decision already taken |

**The table is what the agent argues from, not a rule that fires by itself.** A change the author rules
does not need one still owes whatever `METHOD.md`'s table of what a change owes lists, and nothing more.

**The agent must propose because it cannot be trusted to decide.** Models are measured as unable to
reliably tell a well-specified request from an underspecified one (§9). An agent that decided silently
would be making the judgement it is worst at, with nobody checking it.

**It applies to documents about the work as well as to specifications**, and the one cost this has
already caused here is on that side. `PILOT.md`, the guide to driving this process, was written without
one, and the author's only finding on reading it was that it never mentions the design conversation at
all. No check could have caught that, because nothing said the conversation existed.

Documents that already exist are not given one retroactively; a later change to one is proposed like any
other. This document was written before the elephant existed, so the author ran the process by hand,
and `ROADMAP.md`'s slice 7.1 entry is the result.

### What the repository calls it today

**Two names are already in use for it, and neither is defined anywhere.** Measured at `cf4e48c` by a
case-insensitive search of every `.md` and `.js` file, leaving out `ROADMAP.md`, `ELEPHANT.md` and
`HANDOFF.md`:

- ***elephant*** — used once, in `.claude/skills/bug/SKILL.md`: *"The elephant is where it returns."*
  `SOURCES.md` contains the word too, but only in the title of the article the pair is named after.
- ***design conversation*** — used in the same skill, and in `METHOD.md`: *"it goes back to the design
  conversation"*. `FORMATIONS.md` uses the phrase twice to describe one particular conversation, not as
  a name.
- ***goldfish***, its counterpart — `METHOD.md` sends all but one of its reviews to the `goldfish` skill,
  and only that skill says what a goldfish is.

So one skill uses two names for the same thing without saying so, and an agent told *the elephant is
where it returns* has nowhere to look it up.

**The name *elephant* is kept.** It already ships in a skill, and the pairing — the elephant remembers
the whole conversation, the goldfish was never part of it — is the method's central idea in two words.
What was considered instead is in §10.

### What changes in `METHOD.md`

**Two edits to text already in `METHOD.md`, and one new section.** §8 lists them with everything else.

**1. A new section defining the elephant.** `METHOD.md` has no entry for it, so it gains one, worded as
follows:

> ## The elephant
>
> **The elephant is the work of settling a design with the author and writing it down, one section at a
> time.** It is the interview, a conversation in which the agent questions the author until what is
> wanted is settled, and the writing that records it. Writing belongs to it because
> writing is where a question nobody asked tends to surface.
>
> It is optional, but proposing it is not. At the start of any change that would produce new or changed
> intent, a new document about the work, or a change to what one requires, the agent says whether it
> believes the change needs one, and why, and the author rules. The interview ends when the agent
> proposes that what remains unknown does not matter and the author agrees. The elephant ends at
> close-out: each document is where it will stay, its working files are deleted, and the author signs the
> design off.
>
> Its counterpart is the goldfish: a reviewer that took no part in what it reviews, and is handed only
> that. Both are named for what they remember.

**2. A pointer from imperative Two.** Imperative Two tells the agent to argue with the author rather than
agree — *"Argue. Agreement is the defect."* It is about the design conversation, but never says so, so
nothing tells a reader that this is where it matters most. One clause is added after its bold opening:

> It binds hardest inside the elephant, where nothing downstream will catch what goes unchallenged.

The clause does not reach a session automatically: the session-start hook sends only the bold opening of
each imperative. It is read by an agent that opens `METHOD.md`, which is where the definition is read
too.

**3. An exception to the rule that a superseded document is deleted.** A process design like this one is
kept as reasoning once its contents have moved on, which that rule forbids today. §7 argues the
exception and gives its wording.

## 2. What the elephant deliberately does not do

**Each of these could reasonably have been a goal, and was decided against.** A non-goal is not the
opposite of a goal. It is something a reader might expect the elephant to do, and might add later,
unless they are told it was considered and turned down, and why.

### It makes none of the author's decisions

**What it could have been:** an agent that decided for itself how the document should be organised,
when the interview had gone on long enough, or when the document was ready would save the author a
great deal of time.

**What it does instead:** the author rules on what the design says, on how the document is structured,
and on four points in the process — whether to start, when the interview ends, what becomes of each
review finding, and signing off. The sections are agreed between the agent and the author before any is
written. The agent then drafts each one, wording and layout included, without asking about every
choice, and argues for the choices it believes are right; the author reviews the draft and may question
any of them. §3 sets out the standard the drafts are written to.

**Why:** the overriding rule exists so that the author goes on knowing what is in their own documents,
which covers the structure, each review finding and signing off. Starting and stopping are the author's
for a different reason: both turn on telling a well-specified request from an underspecified one, which
agents are measured as bad at (§1).

**The cost, accepted:** the author's time is spent at each of these points, on purpose. Leaving the
first draft's wording to the agent keeps that cost to the points that change what the design says.

### Nothing checks that an elephant ran

**What it could have been:** a record on each document of whether an elephant ran for its last change,
and a check on every commit that the record is there. An earlier draft of this design had exactly that.

**What it does instead:** neither the record nor the check exists; both were withdrawn together, along
with the list of documents that triggered the check and its exemptions. A check can see what a change
touched, not what it means. Whether new or changed intent came out of a change is a judgement, so a
check standing in for that judgement had to be keyed to which documents were touched, and needed
exemptions bolted on.

**The cost, accepted:** a proposal the agent never made is noticed only by the author. The author
notices because the work begins without the question having been put to them, and can then call for an
elephant, as §1 allows.

### It is not a way to produce a specification unattended

**What it could have been:** an agent turning a short request into a complete specification by itself.
Spec-driven frameworks lean that way: BMAD, one of those surveyed (§9), offers a questioning step and
lets the user skip straight past it.

**What it does instead:** the agent writes, and the author answers at each point where a ruling is
owed; between them the agent may draft and run reviews, but nothing goes past one without the author. The elephant exists because the author holds knowledge the request does
not state, and an agent writing alone fills those gaps by guessing. Models guess unstated requirements
wrongly more often than they guess them right (§9).

**The cost, accepted:** the work waits at each ruling point until the author is there.

### Where these end up

**None of these moves into the process documents as a non-goal.** The first and third each have a
working side that the skill running the elephant needs: which points stop for the author's ruling, and
that nothing goes past one without the author. That side is stated positively, in §3, and §8 carries
it. The second only informs somebody changing the elephant later, so it stays here.

## 3. What happens, in what order, and where each part ends

**An elephant runs eight steps in a fixed order. The agent does the work, and the author rules on every
question it puts to them.** The agent searches, asks, drafts and runs reviews. It does no work that
depends on a ruling until the author has made it, and four of those rulings are points in the process,
listed below. Steps 2 to 4 repeat when the interview is reopened, and any step repeats when the author
sends the work back; the last part of this section says what happens then. A session, here, is one
conversation with the agent. This section is read by the agent running an elephant, which follows it
step by step, and by the author, who needs to know where it will stop for them.

### The four points in the process

- **Starting.** The agent proposes an elephant or not, and the author rules. This comes before the
  elephant begins (§1), and is listed here so that all four are in one place.
- **Ending the interview**, including the question of what else the author wants to discuss (step 2).
  The agent proposes ending it, and the author agrees or refuses.
- **Each review finding** — from the interview review, each section review, the ledger review, and the
  document reviews and seam reviews. Each finding is ruled on separately, and gets one of three
  outcomes, each the author's decision about it:
  - **accepted** — the finding is right, and it is acted on;
  - **immaterial** — the finding is right, but it is not acted on, for a stated reason;
  - **rejected** — the finding is wrong, for a stated reason.

  These are the three outcomes `METHOD.md` gives every finding, which it names fixed, accepted with a
  reason and rejected with a reason. The agent recommends an outcome for each, and acts on a finding
  only once the author has accepted it. Interview-review findings are put in words of their own (step
  4). §5 says where rejections are recorded.
- **Signing off.** The author declares the design finished, which allows it to be cut into slices.

**Every question put to the author, at any step, has one form.** It says in one sentence what the issue
is and why it matters, carries enough background to be understood by somebody who has not seen the
earlier questions, and offers two or more candidate answers, with the one the agent recommends first and
marked as such. A question that arrives with its options and a recommendation costs the author less to
answer than one that does not. An answer takes one of two forms: choosing an option, or answering in
prose. Deferring is not offered as an option. Step 2 adds two rules for questions in the interview, and
names the one question that carries no recommendation.

**No ruling has a default or a time limit.** If the author stops replying, the elephant stays exactly
where it is and nothing happens to it; a deferral the author volunteers outside the interview is treated
the same way, and the question waits. The agent need not handle a change of topic in that conversation:
the author works elsewhere, and returns to the elephant in the same conversation or through a handoff
when they are ready. The conversation, or the handoff that closed it, and the elephant's working files
(§4) hold its place in the meantime.

***"You decide"* is a legal answer to any question except two kinds**, where the question is put again:
a ruling at any of the four points, and a ruling on a *nothing covers this* claim (step 1). It is legal
on how the documents are structured. Delegating the claim would let a search nobody made look like a
search that found nothing, which is what the ruling exists to prevent. Where a delegated ruling goes
into the ledger, the ledger records it as the agent's recommendation, adopted on delegation, so it stays
distinguishable from a decision the author made.

**The author may abandon an elephant at any point** by saying so — for instance when the interview
concludes that the change should not be made. The agent then offers a full clean-up: deleting the
elephant's working files and undoing every edit it made to any document, and it lists the edits it
would undo before undoing any. The author may accept all of it, part of it or none of it; whatever they
decline stays as it is, and the elephant is abandoned either way. Nothing is signed off, and nothing
is recorded outside the working files: if the author keeps any of them, the ledger is kept with them,
and the agent adds a line to it saying the elephant was abandoned (§4). An elephant the author has stopped replying to has
not been abandoned.

### The steps

**1. Search for an existing document.** Before asking anything, the agent looks through the documents
the inventory lists for any that overlap the change, as the author described it when opting in, and
reports what it searched and what it found. Its report says each time that the search is weak: this
project has no record of what lives where, so the search is done by hand over the documents and can miss
one. It also reads the ledgers of any other running elephant (§4), so that two working on the same
document are noticed.

- **If it finds nothing**, *nothing covers this* is a claim the author rules on, so that a search nobody
  made and a search that found nothing cannot look alike. If the author rejects the claim, they name
  what was missed or ask for a further search. Any document found that way is ruled on as below; a
  further search that again finds nothing makes a fresh *nothing covers this* claim.
- **For each document found**, the author rules on one of four options, always offered, with the
  agent's recommendation first: replace it, extend it (add to what it says), change it (alter what it
  says; a change that both adds and alters is a change), or leave it and build beside it. Replacing a
  document also starts its retirement, which §7 describes.
- **If the author judges the change already covered**, they may abandon the elephant here. Abandoning is
  the author's call, not a fifth option the agent offers.

**It ends when the author has ruled.** Each ruling is a line in the decisions ledger (§4), following the
search report it rests on.

**2. The interview.** The agent asks the author questions until it believes that further answers would
not meaningfully change the design. Besides the form every question takes, each question in the
interview:

- is aimed at something ambiguous, because an ambiguity marks knowledge the author holds and has not yet
  passed on;
- is one the author can realistically answer. Where only a measurement could answer it, the agent
  measures and brings the result back instead of asking.

There is no minimum number of questions, and a small change may need only one or two. The one question
always asked is what else the author wants to discuss, below.

**What the answers do.** Any ruling that changes what the design says becomes a line in the ledger,
whatever step it is made at, naming the document that will hold it, or *undecided* until the documents
are agreed at step 4. Each new topic the design must
cover becomes an item on the checklist (§4); items are added only while the interview is running, and
during writing new ground is handled as step 5 says. Each item is open, answered or omitted:

- **answered** once the rulings that settle it are lines in the ledger. It has **landed** once the
  ledger review has found those lines in the documents.
- **omitted** with a reason, which stays on the checklist and is not a ledger line. An item settled
  without changing the design is omitted, with that as its reason.
- **open** otherwise. A question the author volunteers to defer stays open, and is settled before
  writing begins (step 4).

**When a session is handed off during the interview** — that is, it ends through the `handoff` skill
with the interview still under way — the ending session dispatches the interview review (step 3) over
its own part of the interview before it closes. That review counts as the previous review for the next
one. Its report is kept in the elephant's directory (§4), and the next session opens by putting its
findings to the author, who rules on each as step 4 describes. The interview then continues whatever
the rulings; this is not step 3 or step 4, which follow only once it ends.

**Proposing to end it.** Before proposing to end the interview, the agent asks what else the author
wants to discuss. It offers a list of named areas, drawn from the checklist and from its own judgement,
together with *nothing else*, and makes no recommendation among them, because a recommendation would
steer the author away from whatever they would have raised themselves. It is never put as an open
question. If the author picks an area, the interview resumes on it, and the question is asked again
before the next proposal to end. Once the author answers *nothing else*, the agent states what it
believes is still unknown, why it judges that none of it would change the design, and its evidence —
usually that the last several answers changed nothing. It lists any deferred question separately, as
one to settle at step 4. **It ends when the author agrees.** If the author refuses, the interview
continues.

**3. The interview review.** Once the author has agreed to end the interview, the agent runs a review of
it by a reviewer that took no part in it. It runs every time the interview ends, however the interview
came to be reopened. Each review covers the interview since the previous review, so every part of it is
reviewed once. Questions asked while writing are not part of the interview, and no interview review sees
them; the section review is what catches what they miss. §5 covers what the reviewer reads and what it
does when it cannot find the conversation.

**4. The author's decisions.** The agent puts each of the interview review's findings to the author. A
finding may be a question never asked, an answer that was ambiguous but treated as settled, two answers
that contradict each other, an assumption the agent made without asking, or a leading question. The
author rules on each in one of three ways:

- **answered** — the finding is right, and the author settles it there and then: *"you're right, here
  is what I meant"*. This is accepting it, and the interview stays open: the elephant goes back to step
  2, where the answer may lead to further questions.
- **already settled** — the finding is wrong, because the point was settled, and the author says where.
  This is rejecting it. The agent checks that the ruling is a line in the ledger, and adds it if not;
  the reviewer may simply not have seen the session in which it was made.
- **immaterial** — the finding is right, but it does not matter enough to act on.

If every finding is already settled or immaterial, the elephant goes on.

**No checklist item may be open when writing begins.** The agent lists every item still open, deferred
questions included, and the author settles each: either it is answered, by reopening the interview, or
it is omitted with a reason.

The agent then proposes the documents the design will be written into, the sections each will hold,
each with the question it answers, the order they will be written in, and which document each ruling in
the ledger goes to; the author agrees them. Where
an existing document is extended or changed, only its new and changed sections are proposed. **It ends
when every finding has been ruled on, no checklist item is open, and the documents and sections are
agreed.**

**5. Writing.** The agent writes one section at a time, in the agreed order. It brings each to the
author together with its section review (§5), and does not start the next until every finding on it has
been ruled on and every accepted one acted on. It drafts wording and layout without asking about every choice, and
argues for the choices it believes are right; the author may question any of them. Each section is
written to one standard:

- it has one clear point, stated once and not repeated in other words;
- it says who it is written for;
- it uses no emotive language;
- it uses plain words in place of a term defined elsewhere, in this document or another, wherever a few
  extra words make the meaning clear.

**Questions during writing belong to the section review, not to the interview.** The author's questions
about a section, the agent's answers, and the agent's follow-up questions about what the author meant
are a normal part of reviewing it. The author's questions are answered, not ruled on; a question the
agent asks holds up whatever depends on its answer. The agent may also ask a question while drafting,
when the answer would change what it writes. It asks at once, and the question counts as part of the
coming section's review. This should rarely be needed, because the earlier steps should have settled
every question about a section before it is written. The agent never proposes going back to the
interview.

**New ground found while writing** — something no agreed section covers, or a section or document that
turns out to be missing or in the wrong place — is raised when the agent presents the section it was
writing, as one question to the author: is it part of this design, or separate work? The agent's
recommendation turns on whether it serves the same intent as the design. If it is part of this design,
the agreed documents and sections are amended and the new sections are written like any other; this
amends the agreement made at step 4, and is not going back. If it is separate work, it goes, as the
author chooses, to the project's backlog or to a later elephant.

**It ends when every section is written, every finding on it has been ruled on, and every accepted one
acted on.**

**6. The ledger review.** A reviewer checks that every line in the ledger that names a document can be
found in that document (§5). Lines that name none, such as a ruling that nothing covers the change, are
not checked. **It ends when every finding has been ruled on.**

**7. The document reviews and seam reviews.** A reviewer reads each document the design was written
into, and, in the same step, the seam between each pair of documents that cite each other (§5). **It
ends when every finding has been ruled on.**

**8. Close-out.** It runs in this order, and changes nothing about the design:

1. No checklist item is open, and the ledger review has passed: every line it checks was found, or the
   finding that it was not has been ruled on. If any ledger line was added or changed since the ledger
   review ran, it runs again over those lines first. Every answered item has then landed; the rest were
   omitted with a reason.
2. The agent proposes how everything the elephant produced is sorted into what belongs somewhere
   permanent and what should stop existing; §6 says where each part goes.
3. The author signs off, which also approves the sort.
4. The sort is carried out, and the working files are deleted.

**It ends when every document is where it will stay, the author has signed off, and the working files
are deleted.**

### When the design spans several documents

**An elephant writes into one document per subject the design touches**, and that may be more than one.
A subject is meant in `METHOD.md`'s sense: a question somebody will one day ask. The elephant's unit is
the design; a document's unit is its subject.

**Which documents, and which sections each holds, is agreed at step 4.** The design is never written as
one document and split afterwards: once the original and the pieces both exist, a change to one does not
reach the other (§9). A document found to be missing during writing is new ground, raised as step 5
says. If the author re-cuts the documents, sections move to their new home and no copy is left behind,
and the ledger lines that named the old documents are reassigned with them.

**A decision that belongs to more than one document has one home.** The document that owns the subject
holds it, and the others cite it by section rather than restating it. When no document owns it, the
agent raises it as a question about structure: the author makes one document its owner, or adds a
document that several share. Because each ledger line names the document that holds it, the ledger
review checks the right document.

**Each document gets its own document review, and documents that cite each other get a review of the
seam between them**, both at step 7 (§5).

### What goes back

**The author may send the work back to any earlier step, at any time.** The steps then run forward again
in order from there. Work already done stands, except sections the agent lists as affected by a new
decision and the author agrees are; a review that has already run runs again only if the author asks,
except the ledger review before close-out (step 8).
Any return to step 2, whether from a finding answered at step 4 or because the author called for it,
reopens the interview.

**The agent never proposes going back.** A finding answered at step 4 returns to the interview by
itself; everywhere else the agent moves forward and leaves going back to the author, so that it spends
no effort deciding whether to.

**An accepted finding is acted on where it is.** One accepted at steps 6 or 7 is acted on in the section
concerned, and does not send the work back to step 5. Where there is no section for it to go in — a
section is missing, say — it is raised as a question about structure, and the new section is written and
given its section review then. A refused sign-off goes back to writing: the author says what is missing,
and the sections it affects are written again; a missing section is raised as a question about
structure.

**Acting on a finding does not make a review run again by itself.** When it changes sections already
written, the agent lists each section it changed, and the author decides whether each is reviewed again and whether
any review at a later step that has already run is run again.

## 4. The files an elephant creates

**An elephant keeps its rulings and its open items in working files on disk, not in the conversation.**
Each session starts with no memory of the last, and a list held only in the conversation loses items: on
the first elephant run here, the checklist was retyped into each exchange — one question and its answer —
and silently lost an item within two exchanges (§9). Where the elephant has got to, and any review
findings still unruled, are recorded in the handoff that closes each session, as for any piece of work.
This section is read by the agent running an elephant, and by whatever later needs to find one and see
where it stands — chiefly the `handoff` skill.

### Where they live

**Each elephant has a directory of its own, `elephant/<name>/`, at the root of the repository.** Its
working files are everything in that directory, and nothing else is kept there. The findings of the
other reviews are ruled on as they arrive and need no file; any still unruled when a session ends go
into its handoff. `elephant/` itself is created with the first elephant and removed once it is empty.
Several elephants may run at once, each in its own directory.

**The name is settled, and the directory created, when step 1 reports** (§3). The agent gives the search
report and the author makes the step-1 rulings in the conversation; then the agent asks for the name as
a question in the usual form; then it creates the directory and the ledger, and writes the report and
the rulings into it. The name is a short one for the design, in lowercase words and digits joined by
hyphens, and must not be the name of another directory under `elephant/`. If the author answers in prose
with a name that does not fit, the agent proposes the nearest one that does. The name is not a ledger
line, and *"you decide"* is a legal answer.

**An elephant is running from the moment the author opts in.** Before step 1 reports, the conversation is
its only record; from then on, its directory is.

**They do not live under `plans/`**, although a working file expires as a plan does. Two of the
repository's checks read every file in `plans/` as a plan — `test/plan-citations.js` requires each to
cite its specification, and `test/reviews.js` requires each to have a review record — and both would
fail on these. The one check that walks the whole repository, `test/lineendings.js`, requires every
Markdown file to use LF line endings, so the working files do too.

**They are under version control like any other file**, because between sessions they are the only
record of the elephant's rulings and open items. When to commit them is the author's call, as with any
change.

### What each file holds

The checklist and the ledger are Markdown lists, read by an agent; no script parses them. Each entry is
one bullet, which may wrap onto further lines. Its **fields** are the parts of the entry, in the fixed
order given below for each kind of entry, separated by a spaced em dash ( — ), which no field's own text
uses. A state is written as the literal word. A document is written as its path from the root of the
repository; one that does not exist yet is written as the path agreed for it at step 4.

**`checklist.md` — what the design must cover.** It is created when the interview begins, holding three
items that designs habitually leave out (§9), each starting `open`:

```
- What the design deliberately does not do — open
- The alternatives considered and rejected — open
- The concerns that cut across its sections — open
```

It grows while the interview runs (§3, step 2). An entry's fields are the topic, its state — `open`,
`answered` or `omitted` — and, for an omitted item, the reason:

```
- Behaviour with a single couple — omitted — outside this design; the backlog holds it
```

An answered item is never marked as landed. It has landed once the ledger review has found the lines
that settle it, and close-out infers that for every answered item at once from the ledger review having
passed (§3, step 8).

**`ledger.md` — the rulings.** Its entries are in order of first arrival, and there are five kinds:

- **the search report** from step 1 — what was searched, what was found, and the warning that the
  search is weak. Fields: the report, *none*. A further search adds a further report.
- **a step-1 ruling** on a document found, or on the claim that nothing covers the change, including a
  ruling that rejects that claim. Fields: the ruling, *none*, and who made it — `author`, or `delegated`
  where the author answered *"you decide"*.
- **a ruling that changes what the design says**, from any step. Fields: the ruling, the document that
  will hold it, and who made it. Made before step 4, the document is `undecided`; the documents agreed at
  step 4 include which document each such ruling goes to, so no entry is left `undecided` after step 4,
  and a ruling made later names its document when it is made.
- **an agreed section**, one for each section agreed at step 4. Fields: the section's title, the
  question it answers, its document, its place in a single writing order across every document, and who
  agreed it. When the agreement is amended, the order is rewritten to match.
- **the abandoned entry**, `- Abandoned by the author`, with no other field. If the author abandons the
  elephant and keeps any working file, the ledger is kept too, and the agent adds this entry.

```
- Searched every document AGENTS.md lists for "pathing"; found CORRIDORS.md; the search is weak — none
- Extend CORRIDORS.md — none — author
- A dancer belongs to every wheel it stands on — CORRIDORS.md — author
- Section "Shared dancers" — how do overlapping wheels share a dancer? — CORRIDORS.md — 2nd — delegated
```

It holds no reasoning; the reasoning belongs in the documents. When a later ruling reverses or amends an
earlier one, the earlier entry is rewritten in place as the ruling now stands, recording who made the new
ruling; a ruling that is withdrawn altogether has its entry deleted. The ledger records what is decided
now, and the ledger review would otherwise look for both.

**The ledger review checks only entries whose document field names a document.** A ruling is found when
the document says it. A new section is found when a section with that title exists in its document; a
changed section is found when the rulings it carries are found.

**`interview-1.md`, `interview-2.md` and so on — the interview reviews' reports**, numbered in the
order they ran. Each covers one session's part of the interview, and is the reviewer's report with a
header the dispatching agent adds: the name of that session's transcript, and the first line of the last
author turn the review covered, quoted exactly. That is where the next review's *"since the previous
review"* begins; §5 says how the transcript is found. Once the author has ruled on a finding, the agent
adds the ruling to the finding's heading, in step 4's words: `answered`, `already settled` or
`immaterial`. A report is kept so that a later session can put its unruled findings to the author (§3,
step 4).

### Why the checklist and the ledger are separate

**Both end at close-out, but the ledger review needs a file holding only what should be in the
documents.** The ledger begins at step 1, the checklist when the interview begins. A checklist item
omitted with a reason is, by definition, not in any of the design's documents, so a combined file would
hand the ledger review entries it must flag every time.

### What they tell a later session

**A directory under `elephant/` means an elephant is running under that name**, unless its ledger holds
the abandoned entry. A directory the author kept after abandoning stays until the author removes it. The
`handoff` skill finds elephants by looking for these directories, not by being told about them. The
files show what is still open in the interview — the checklist's open items, and the interview reports'
unruled findings. The step the elephant has reached comes from the handoff that closed the last session.

### When they go

**The working files are deleted at close-out, after the author signs off** (§3, step 8), or when an
elephant is abandoned and the author accepts that part of the clean-up. Nothing in them is meant to
outlive the elephant: whatever should is moved somewhere permanent during close-out, and §6 says where.
A design that needs its working files to be understood afterwards has not been written down.
