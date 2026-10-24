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
would undo before undoing any, and says that an edit kept once the working files are deleted becomes
settled text (§6). The author may accept all of it, part of it or none of it; whatever they
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
into, and, in the same step, the seam between each pair of those documents (§5). **It
ends when every finding has been ruled on.**

**8. Close-out.** It runs in this order, and changes nothing about the design:

1. No checklist item is open, and the ledger review has passed: every line it checks was found, or the
   finding that it was not has been ruled on. If any ledger line was added or changed, or any document
   a line names was edited, since the ledger review ran, it runs again over those lines first. Every
   answered item has then landed; the rest were omitted with a reason.
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

**Each document gets its own document review, and each pair of them gets a review of the
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

**The ledger review checks only entries whose document field names a document.** §5 says what
counts as found.

**`interview-1.md`, `interview-2.md` and so on — the interview reviews' reports**, numbered in the
order they ran. Each covers one session's part of the interview, and is the reviewer's report with a
header the dispatching agent adds: the file name of that session's transcript, and the record id of the
last author turn the review covered (§5). That is where the next review's *"since the previous
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

## 5. The reviews an elephant runs

**Five kinds of review run inside an elephant, each by a reviewer that took no part in what it reads, and
every finding goes to the author to rule on.** Two kinds are new: the interview review and the ledger
review. Three are reviews `METHOD.md` already has: the section review, the document review and the seam
review. This section says what each reviewer is given, what it looks for, and what is kept of its
findings. It is read by the agent running an elephant, which dispatches the reviews, and by whoever
writes the two new prompts and the extractor the interview review depends on.

| Review | Step (§3) | The reviewer is given | It looks for | Prompt |
|---|---|---|---|---|
| interview | 3 | the conversation, extracted from the session's transcript | what the questioning missed or got wrong | new: `prompts/goldfish-interview.md` |
| section | 5 | one section, and what it depends on | ambiguity, gaps and undefined terms in that section | `prompts/goldfish-section.md` |
| ledger | 6 | the ledger, and every document its entries name | a ruling that did not reach its document | new: `prompts/goldfish-ledger.md` |
| document | 7 | one whole document | sections that contradict each other, and a design that is wrong | `prompts/goldfish-document.md`, with one question added |
| seam | 7 | two documents | disagreement between them, and one decision stated in both | `prompts/goldfish-seam.md` |

### How every review is run

**Each review is dispatched through the `goldfish` skill**: one fresh reviewer, no part of the
conversation, the files it may read named and every other file forbidden, the prompt followed exactly,
and the report written to a file in the session's scratch directory. The two new prompts take the shape
of the existing ones: a heading for each category of finding, each finding quoting the text it
concerns, *none* under a category with nothing in it, a category for concerns the reviewer could not
ground in the text, and a closing account of what the reviewer understood it was reading.

**Every review uses the Opus tier at high reasoning effort** — the model the harness, the program that
runs the agent, calls `opus`, with its reasoning-effort setting at `high`. No review is given a cheaper
model, a section review included, and none is given a more expensive one; the effort setting is fixed
in the same way. A reviewer's job is to find
faults, and finding faults is measured as rising steeply with model strength. In the closest study to
this work, a check of written requirements, the tier below wrongly flagged nearly twice as many sound
requirements, and every false finding costs the author minutes, against about a dollar for the whole
review (§9). The rule names a tier rather than saying *the most capable model*, because the most
expensive model scored below the Opus tier in the one code-review comparison that measured both (§9),
and a rule that left the choice to whoever read it would be no rule. The alias follows the newest Opus
model, so moving to a newer one is not a change to this rule; moving off the tier is.

**A reviewer from a different family of models is not used, although it would be the better
reviewer.** A reviewer of the same model as the writer shares more of the writer's blind spots than a
reviewer of another family, even with a fresh context, and that independence is measured as worth more
than added strength (§9). The harness dispatches only Claude models, so this gain is out of reach, and
the cost is accepted.

**A review is not run more than once to find more.** Separate runs rarely find the same faults, so a
second run would find more, but every run adds findings the author must rule on.

### The interview review

**It reads one session's part of the interview, extracted mechanically from that session's
transcript.** The extract holds the author's turns and the agent's replies, in order, and nothing else.
It is a filter, never a summary: a summary leaves out what its writer did not think mattered, which is
exactly what the elephant failed to notice. The reviewer is given the extract and nothing else, not
the ledger and not the checklist. The extract is written to a file in the session's scratch directory
— the temporary directory the harness gives each session — and is not kept.

**The extractor is a script in the repository.** It takes a transcript, the turn to begin at and the
turn to end at, both included, and writes the extract. It holds two lists of record types, those it
reads and those it ignores, and the same two lists for the kinds of block a record's content is made
of. It starts by reading the types and kinds that carry the conversation (below). Every other type and
kind found when it is built starts on neither list, and is settled by the measurement for an unknown
one. §8 lists building it.

**Finding the transcript.** The harness writes each session's transcript as a file named
`<session-id>.jsonl`, in a directory under `~/.claude/projects/`. The session id is the name of the
session's scratch directory. Other sessions' transcripts sit in the same directory, so the newest file
there is not necessarily this session's; the file named after the session id is. Measured on
2026-10-18: exactly one file under `~/.claude/projects/` carried the measuring session's id, and each of the
twenty transcripts in this project's directory carried exactly one session id, its own name. None of
this is documented by the harness, and it may move.

**Where the extract begins and ends.** The dispatching agent chooses both turns and passes them to the
extractor. The extract begins at the first of these that applies:

- the author turn that reopened the interview, when it was reopened in this session, so that the
  questions asked while writing are left out (§3, step 3);
- the first author turn after the last one the previous interview review covered, when that turn is in
  the same transcript;
- this session's first turn of the interview, so that whatever the session did before it is left out.

It ends at the author's agreement to end the interview or, for a review run as the session is handed
off during the interview, at the last author turn before the author asked for the handoff. A session
handed off with no interview turns of its own dispatches no interview review. Each turn is named by its
record's id, which the harness gives every record; measured on 2026-10-18, in the measuring session,
all 105 `user` and `assistant` records carried an id, and no two the same. The report's header records
the transcript's file name and the id of the last author turn covered (§4).

**What the extractor keeps.** A transcript is a series of records, and each record names its type. A
turn is one message: an author turn is one record, and an agent's reply may span several. What follows
was measured on 2026-10-18 by reading the records of the twenty transcripts in this project's directory,
which held fifteen types between them; the field names are the harness's and undocumented, and
whoever builds the extractor confirms them against a live transcript first.

- Two types carry the conversation: `user` and `assistant`. Most `user` records are tool results, not
  the author (§9).
- What the author typed is a `user` record whose content is plain text — a bare string — and which has
  no `isMeta` field, the mark the harness puts on text it injected. A tool result is a `user` record
  whose content is a list of `tool_result` blocks.
- An `assistant` record's content is a list of blocks of three kinds: `text`, which is what the agent
  wrote, and `thinking` and `tool_use`, its reasoning and its tool calls.

The extractor keeps what the author typed and the agent's `text` blocks. One tool call is the
exception: a question put to the author through the harness's question tool, `AskUserQuestion`, and
the author's answer to it, are conversation, and the extractor keeps both. The tool's name appeared in
six of the twenty transcripts.

**When extraction fails, the review does not run.** The extractor stops when the transcript cannot be
found, when the extract is empty or holds only one side, and when it meets, within the turns it was
given, a record type or a kind of block on neither of its lists. It never drops what it does not
recognise: a renamed type that carried the conversation would halve the extract while the path still
resolved and everything else still passed (§9). One transcript
held nine types when this design began; on 2026-10-18 the most any one transcript held was fourteen, and
the twenty held fifteen between them. An unknown type will recur.

- **An unknown type or kind of block** is settled by measurement. The agent checks whether any record
  of that type, or block of that kind, holds the text of an author turn or an agent reply. If none
  does, the agent adds it to those the extractor ignores, runs the extractor again, and tells the
  author, as a decision the author did not ask for, with a one-word way to reverse it. Reversing it
  means it is treated as carrying conversation: the extractor is changed to read it, and the review
  runs again. If some do hold such text, the extractor is changed to read it before the review runs.
- **Any other failure** the agent reports to the author, with what it found, and the review does not
  run until it is settled. At step 3 the elephant waits there, and does not go on without the review.
  When the failure comes in a review run as the session is handed off, the handoff records it, and the
  next session settles it before the interview continues.

**What it looks for** is the five kinds of finding step 4 lists: a question never asked, an answer that
was ambiguous but treated as settled, two answers that contradict each other, an assumption the agent
made without asking, and a leading question. A point may have been settled in a session the reviewer
was not given; it reports the finding anyway, and the author rules it *already settled*.

### The section review

**The section review is the one `METHOD.md` already has, unchanged.** The reviewer is given the section
and what it depends on: the sections of the design it relies on, and the sections of other documents it
cites. The questions the author and the agent ask each other about a section while writing belong to
this review, but are an exchange between them, not something the reviewer is given (§3, step 5).

### The ledger review

**It checks that each ruling reached the document that was to hold it.** The reviewer is given the
ledger and every document its entries name, and checks only the entries that name a document (§4):

- a ruling is found when the document says the same thing, in any wording;
- an agreed section is found when a heading with that title exists in its document, ignoring the
  heading's number and level. What a changed section was to say is checked through the rulings, each an
  entry of its own. A section retitled during writing amends the agreement, so its entry is rewritten
  (§4).

A ruling the document both says and contradicts is not found. For each entry it finds, the reviewer
quotes the passage it relied on; for each it does not, it says so. Quoting the found entries lets the
author see a match that was stretched.

**It works in one direction only.** It does not report what the documents say that the ledger does not.
A document says far more than was ever discussed, and requiring the reverse would make every sentence
need a ruling, so the interview would never end.

**It has a prompt of its own, not the seam prompt and not a script.** Measured against the seam prompt,
five of its eight categories do not apply and one inverts: it would report every ruling that landed as
the same decision stated in two places (§9). It is not a script because deciding whether a document
says a ruling is a judgement about meaning, and no script reads the ledger (§4).

**It runs again before close-out** over every entry added or changed since it ran, and every entry
naming a document edited since it ran (§3, step 8). A finding accepted at step 7 edits a document after
this review has passed, and could remove a ruling's text. This is the one exception to the rule that a
review reads again what it has already read only when the author asks (§3, *What goes back*); an
interview review run after the interview is reopened reads new turns, not old ones. The agent knows which entries those
are from the conversation, or from the handoff, which lists them when the session that ran the review
has ended.

### The document review and the seam review

**Each document the design was written into gets its own document review**, over the whole document.
Its prompt gains one question: does the design, as specified, fail the purpose the document itself
states? That is, would it do exactly what it says and still not achieve what the document says it is
for? The reviewer is given only the document, so it can judge the design against nothing else. No
review asks this today, and the `bug` skill names a design working as written and wrong anyway as the
case the literature on this method does not handle. The prompt is shared, so every document review
asks it, inside an elephant or not, and the prompt's instruction not to judge whether the design is
good gains this one exception; §8 lists both changes.

**Every pair of the design's documents gets a seam review**, with the existing prompt, whether or not
the two cite each other. A decision restated in two documents is most likely where neither cites the
other, and the seam prompt's category for one rule stated in full in both documents is what catches it;
no separate check is added. **So does each seam between one of the design's documents and another
document that cites a section the design changed**, as `METHOD.md` requires of any change.

### What is kept of a review

**Each finding is ruled on as it arrives**, except those of an interview review run as a session is
handed off, which the next session puts to the author (§3, step 2). An interview review's report is
copied by the agent into the elephant's directory, with the header §4 describes, and each ruling is
written into it there (§4). Every other review's report stays in the scratch directory, outside the
repository.

**Rejected and immaterial findings are kept only until close-out.** The interview reviews' rulings are
in their reports. For every other review, the handoff that closes each session lists them, with their
reasons, and each later handoff carries them forward, so that when a later
review in the same elephant raises one again, the agent shows it with its earlier ruling. At close-out
they are dropped, and none is recorded in `REVIEWS.md`. A finding the author wants remembered beyond
the elephant is added to the design as a non-goal or a rejected alternative, as a change in its own
right. `METHOD.md` says today that rejections are recorded; §8 lists the change.

**`REVIEWS.md` records each document's section, document and seam reviews, and nothing for the
interview review or the ledger review.** Those two review the conversation and the ledger, and neither
outlives the elephant. `REVIEWS.md` also gains a row for a review that is not one of the elephant's
five and does not run inside it: a person reading the finished document itself, and a state beyond the five it defines, `waived`, used only on that row, with its
reason on the same line, for a document its author does not intend to read. A review not yet run and a
review deliberately not going to be run must not look alike. §6 says when the rows are written.

## 6. What comes out of an elephant, and what never does

**An elephant's output is documents, and at close-out everything it made is either put where it will
stay or deleted.** This section says what it produces, where each thing it made ends up, what is
recorded once it has ended, and what it never produces. It is read by the agent proposing the sort at
close-out (§3, step 8), and by whoever later needs to know whether a document is settled — chiefly the
agent cutting a design into slices or writing a plan. The only thing an elephant changes that is not a
document is the extractor the interview review depends on, kept working as §5 requires; that is upkeep
of a tool it uses, not something it produces.

### What it produces

**Usually, specifications.** The design is written straight into the specification that is its home,
section by section, one specification for each subject it touches (§3). A specification carries its own
reasoning: whoever writes a plan against it, and whoever changes it next, both need to know why it says
what it says. So the non-goals and rejected alternatives the interview settled are in the specification,
in the sections agreed for them at step 4.

**A change to the process with a single home is written the same way.** The process documents are
`METHOD.md`, the skills, the prompts and `PILOT.md`, which are read in order to follow the process. A
change to the process that one of them can hold is written straight into it, like a specification, and
its evidence is written into `SOURCES.md`, as one of the design's documents (§3, *When the design spans
several documents*).

**Otherwise, a process design.** A change to the process that has no single document as its home is
written into a file of its own, as this one is (§1). It is followed until slices have moved its contents
into the process documents, and is kept afterwards as the reasoning behind them (§7 argues the exception
this needs). It has an evidence section, agreed at step 4 like any other.

**It never produces a skill or a prompt directly.** Cutting a design into slices, and writing a plan for
each, is what changes a skill or a prompt. A change made to one directly, neither carrying out a plan
nor conforming to a decision already taken, is a change to the process with no single home, so the
agent proposes an elephant for it or not like any other change (§1).

### Where reasoning lives

**The kinds of document an elephant writes either carry their reasoning or say where it is.**
`METHOD.md` says that a map never explains why, and asks of a specification *what must be true, and
why?* It says nothing of the process documents' reasoning. It gains this line (§8 lists it):

> The rules and the skills carry only as much reasoning as following them needs. The rest lives in
> `SOURCES.md`, and in the process designs kept beside it, which are read only by somebody changing the
> process.

So only an elephant that changed the process owes evidence in `SOURCES.md`. A specification's reasoning
is already in the specification.

### The sort at close-out

**The agent proposes where everything the elephant made ends up, and the author's sign-off approves the
proposal** (§3, step 8). Before proposing that the working files be deleted, the agent reads them for
anything that should outlive the elephant and has not yet reached a document, and proposes where it
goes. The table says where each thing ends up; what moves out of a process design is moved later, by the
slices cut from it, not at close-out.

| What the elephant made | Where it ends up |
|---|---|
| sections of a specification, or of a process document | where they were written |
| a process design | where it was written, beside `SOURCES.md`, which is where it stays |
| a process design's evidence | `SOURCES.md`. Each entry moves, in the slice that adds the rule it backs, with each source indexed back to the rules that use it and to any place the process departs from it. The design's entry is replaced by a one-line pointer to it |
| a process design's non-goals | the process documents, restated positively as the rule each implies, only where following the process needs it; otherwise they stay in the process design as reasoning (§2 does this for its own). The agent proposes which in the sort |
| a process design's rejected alternatives | the process design, where a later elephant reads them (§7) |
| entries the elephant added to the backlog | the backlog, unchanged |
| the checklist, the ledger and the interview reports | deleted |
| review reports in the scratch directory | gone with the scratch directory |
| the handoffs that closed its sessions | spent, and deleted as the `handoff` skill says |
| rejected and immaterial findings | dropped, and carried by no further handoff (§5) |
| the review record | rows in `REVIEWS.md`, below |

**A process design's evidence is written in `SOURCES.md`'s own entry format from the start**, so that
the slice that moves an entry moves it rather than translating it. Translation is where content is lost.
Moving it, rather than copying it, leaves each entry one home. It moves with its rule because
`SOURCES.md` is keyed by rule, and the rule does not exist in `METHOD.md` until a slice adds it.

**`REVIEWS.md` gains its rows at close-out, in one pass, in its own format.** Each document the design
was written into has one row for each kind of review that ran on it — section, document, and each seam
— and an existing row for the same kind is updated in place rather than added to. A section row's state
is the range of sections reviewed. Each row records the commit that held the text as it was reviewed, or
`—` where there was none. A seam row goes in the block of the document that cites the other, as
`REVIEWS.md` already does.

**The row for a person reading the finished document** is set from the author's answer to one question
for each document, put in the close-out proposal and separate from the sign-off ruling: *reviewed*, if
they have read the whole document as it now stands; *not run*, if they have not yet; or *waived*, with a
reason, if they do not intend to. A *not run* row is changed later by the author, when they have read
it.

**The close-out is committed on its own**, when the author chooses, and its message says that the design
was signed off.

### Knowing whether a document is settled

**A document is settled when no running elephant names it**, and only a settled document is cut into
slices or planned against. A directory under `elephant/` holding a ledger without the abandoned entry is
a running elephant (§4). It names a document when a ledger entry's document field is that document, or
when a step-1 ruling replaces, extends or changes it; a document ruled *leave it and build beside it* is
not named. Between two sessions, a named document may hold new sections beside old ones the design is
about to change, and anything that read it then would take half-settled design as settled.

**The `slice` and `plan` skills stop on a document a running elephant names**, say which elephant, and
go on only if the author tells them to. Nothing is written into the document itself to warn a reader: a
warning inside a durable document expires when the elephant ends, and one left behind is false for as
long as nobody notices. §8 lists the change to both skills.

**Nothing records the sign-off apart from the close-out commit.** A state that can be detected from what
is on disk needs no record of its own to keep true. An elephant abandoned with its edits kept and its
working files deleted also leaves its documents settled, without a sign-off; the clean-up offer says so
before the author rules on it (§3).

### What never comes out

- **No working file stays in the working tree.** Git history keeps the commits that held them, and that
  is not a record anything reads.
- **No record of the conversation is kept.** The harness writes the transcript; the elephant keeps no
  copy, and nothing permanent depends on one.
- **No record that an elephant ran** apart from the close-out commit (§2 says why nothing checks that an
  elephant ran).
