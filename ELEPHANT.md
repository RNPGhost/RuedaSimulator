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
the writing of the document that records it, one section at a time.

**It starts when the author opts in** — usually on a change whose shape is not yet settled enough to
write down.

**In between, in order:** a search for an existing document that already covers the change; the
questioning itself, called the interrogation; a review of that conversation; the author's decisions;
the writing, each section reviewed as it settles; a check that every decision reached the document; a
review of the whole document; and close-out. Steps can repeat; §3 says which, and defines each step. §5
covers the reviews.

**It ends at close-out**, when three things are true: the document is where it will stay, the working
files are deleted, and the author signs the design off. For a specification (a Layer 1 document), it
stays where it was written: the specification itself, edited in place. For a change to the process that
has no single home, it is a file like this one — followed until slices have moved its contents on, and
kept afterwards as reasoning. Signing off is what allows the document to be cut into slices.

**Writing is inside the elephant, not a step after it**, because writing a section is often where a
question nobody asked first shows up. When one does, the agent goes back to questioning the author. If
writing came after the elephant, that question would arrive once the design had already been declared
settled.

**An elephant usually runs across several sessions**, and each session starts with no memory of the
last. What it remembers is kept in its working files on disk (§4), not in the conversation.

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
> time.** It is a conversation in which the agent questions the author until what is wanted is settled,
> and the writing of the document that records it. Writing belongs to it because writing is where a
> question nobody asked tends to surface.
>
> It is optional, but proposing it is not. At the start of any change that would produce new or changed
> intent, a new document about the work, or a change to what one requires, the agent says whether it
> believes the change needs one, and why, and the author rules. The questioning ends when the agent
> proposes that what remains unknown does not matter and the author agrees. The elephant ends at
> close-out: the document is where it will stay, its working files are deleted, and the author signs the
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
when the questioning had gone on long enough, or when the document was ready would save the author a
great deal of time.

**What it does instead:** the author rules on what the design says, on how the document is structured,
and on four points in the process — whether to start, when the questioning stops, what becomes of each
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
