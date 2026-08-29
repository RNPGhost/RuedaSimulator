# Method — how this project is designed, built and maintained

> **Read this before adding a feature, fixing a bug, or writing any document.** It is the procedure
> every other document in this repository is written under, and it applies to agents and to people
> equally.
>
> It is **not** a description of the system this project builds, and it names **no document, file or
> command belonging to that system** — the **inventory** holds those. It is written so that it would
> apply to a different project unchanged.
>
> **It is also not a manual for work done inside a subagent.** How a review is actually dispatched lives
> in the `goldfish` skill, and the reviewer prompts live in `prompts/`. What is here is what the agent
> talking to you needs in *every* session: how to classify a document, how to argue, when to fire a
> review, and what to do with what comes back.

**The one-sentence version.** Intent lives in durable design documents; those documents are validated by
being handed to somebody with no context; the checks that prove them are executable and committed; and
the instructions for making any particular change are written fresh, executed once, and never edited
again.

---

## The rule that overrides everything else in this document

> ## **Never change a document because a reviewer said so.**
>
> Every review in this method produces **findings**, and a finding is a claim for the **author** to
> accept, reject or act on. **Not one of them is ever applied without the author saying so, in that
> instance, out loud.** Not the obvious ones, not the trivial ones, not the ones you are confident about.
>
> **This is not a formality and it is not about correctness.** It is about the author keeping control of
> their own documents and continuing to understand what is in them. A document quietly improved by a
> series of reviewers is a document its author no longer knows, and that is a worse outcome than any
> defect a review could have caught.

**If you are an agent reading this**: a review ends with you presenting findings and waiting. Applying
one you are certain about, because asking felt like friction, is the single most damaging thing you can
do to this method.

---

## 1. Why this document exists

This project's method is that **design documents, not code, are the durable artifact.** A change starts
by changing what we said we wanted, and the code follows. That method works, and it has four known
failure modes — all of them measured by people who tried it before us. This document exists to get the
benefit without them.

| The failure | What it looks like | Evidence |
|---|---|---|
| **Spec drift** | documents and code diverge until they contradict each other and nobody trusts either | reported as *the* number one practical problem in a field study of teams doing this — *"it just keeps drifting and drifting until you have duplication and contradictions across specs"* |
| **Ceremony mismatch** | the full design process applied to a two-line bug fix | universally reported; one team spent **50% of total project time** on specification before scaling it back |
| **Context rot** | so much accumulated documentation that a reader cannot tell live requirements from historical ones, and tries to satisfy both | model reliability degrades measurably as input grows, *even on simple tasks*; the result is self-inflicted instruction drift |
| **Plans kept as living documents** | an implementation guide that is patched forever until it describes no version of anything | teams that treat plans as **temporary scaffolding** report better outcomes than teams that maintain them long-term |

**And one thing separates the teams this works for from the teams it doesn't:** whether their documents
end in **checks a machine runs**. *Specs define the contract; tests enforce the contract.* Documents that
terminate in prose drift. Documents that terminate in assertions do not, because the assertion fails.

That is why checks are treated as a first-class part of the design rather than as an afterthought, and
why **no section of a design document is finished until you can say what would fail if it were wrong.**

---

## 2. The two families, and the four layers

**A document's structure follows its lifetime**, and the single most important rule in this file is:

> **Never put an expiring thing inside a durable one.**

Everything written belongs to one of **two families**, and the first question to ask of any new writing is
which one it is in:

| Family | Answers | Members |
|---|---|---|
| **About the system** | what the software must do, where it lives, how to change it, whether it is true | the **four layers** below |
| **About the work** | how work is done, what exists, where this is going, what is next | the **method**, the **inventory**, **direction**, the **backlog** |

The two are kept apart because they answer to different readers and change for different reasons. A rule
about how to write a document is not a fact about the software, and mixing them is how a design document
starts accumulating process notes.

**The lifetime rule applies inside both families**, which is what stops the second one becoming a bin for
anything that would not fit in the first.

| | Layer | The question it answers | Tense | Lifetime |
|---|---|---|---|---|
| **1** | **Intent** | *What must be true, and why?* | timeless | **durable** — changes when your intent changes |
| **2** | **The map** | *What lives where?* | present | **durable** — always describes the code as it is now |
| **3** | **Plans** | *How do we get from here to there?* | imperative | **expires on execution** |
| **4** | **Checks** | *Is it actually true?* | executable | **durable** — only ever grows |

Conflating layers 1 and 3 is the specific mistake this structure exists to prevent: mixing durable
knowledge with per-change tactics leads a reader to *misapply outdated tactical information to new
contexts*. A plan that has been executed is a historical record. Left inside a document that must stay
true, it becomes a lie with a date on it.

**Four rules follow, and they are worth checking any new writing against:**

- **Layer 1 names no code at all** — no line number, no file path, no function or constant as the code
  spells it. Where a claim depends on something in the code, Layer 1 states the **behaviour** or the
  **derivation**, and the *name* lives in a Layer 4 check.

  This is stricter than it first looks and it is chosen because it rots slowest. Compare:

  | Instead of | Write | Because |
  |---|---|---|
  | "`samplePath` fits a circle through three keyframes" | "the current renderer reconstructs by fitting a circle through sampled points, and drifts 0.116–0.247 units" | the behaviour is still true when the function is renamed; the name is not |
  | "`DOT_R = 16`" | "a dancer's radius is `w`/2, and `w` is 32 units today" | the document already names its own constants, and a second name for one thing is a thing that can disagree |
  | "retire `samplePath`, `_circleArc`, `CORNER_DEG`" | *(nothing — this is a plan task)* | it is an instruction with a completion date |

  **The name is not lost; it moves somewhere that fails loudly.** A symbol named in prose rots in
  silence — the sentence stays readable and stops being true. The same symbol named in a Layer 4 check
  rots with a red test. So "these four symbols no longer exist" belongs in a check, not in a paragraph.

  **A document written before this rule will carry debt against it**, and that debt belongs on the backlog
  rather than in a note here. Expect two kinds: symbols named in prose, and a stated policy that permits
  exactly what this rule now excludes.
- **Layer 2 never explains why.** The moment a map starts justifying a decision, it has become Layer 1
  and will rot, because nobody updates a rationale when they move a function.
- **Layer 3 never survives execution.** It is deleted, not maintained. See §3.
- **Layer 4 is the only layer that can prove any of the others.** A claim in Layer 1 with no Layer 4
  check behind it is an opinion, however carefully argued.

#### The other family, in full

Four kinds — and unlike the four layers, **a project may hold more than one document of a kind.** The
common case is the method: a general procedure like this one, alongside a narrower procedure for one
recurring task. That is legitimate and often better than one enormous document.

> **Where two documents of one kind both apply, a precedence rule is required and belongs in the
> inventory.** Two procedures with no stated precedence is worse than either alone: a reader who finds
> them both has no way to proceed except to guess, and two readers will guess differently.

| | What it is | Lifetime |
|---|---|---|
| **The method** | this document — how work is done | durable; changes when the *method* changes, which should be rare |
| **The inventory** | the catalogue of what this project is actually made of, and how to run it | durable, and always describes the present, like a map |
| **Direction** | the vision and the decisions that are locked, which constrain every design that will ever be written | durable |
| **The backlog** | what is next, what is in flight, and what was noticed and deliberately deferred | **expires**, entry by entry, as each becomes a plan |

**Direction and the backlog are normally kept in one document, and that is a deliberate exception to the
lifetime rule.** A durable thing and an expiring thing are sharing a file, which §2 otherwise forbids. It
is allowed here for one reason: the backlog has to live somewhere a person will actually look, and the
statement of where the project is going is the only natural neighbour. The exception is recorded rather
than hidden, and it is bounded — the two are separate *sections*, and nothing else joins them.

**This document is in the second family and none of the four layers.** It governs the layers; it is not
one of them.

---

## 3. Working in each layer

§2 says what the layers are. This says how to work in each one.

> **Which documents this project actually has, what each owns, and what state each is in, is the
> inventory's** — not this document's. That inventory changes whenever a document is added, renamed
> or superseded, and a durable document that keeps a changing list has acquired an expiry date nobody
> notices. This file names no project document by way of inventory, and would work unchanged on a
> different project.

### Layer 1 — intent

**One document per subject, and the subject is a question somebody will one day ask.** Documents are split
by the question they answer, never by size — a document split because it got long has been cut somewhere
nobody will remember, and every future reader pays for it.

**A Layer 1 document names no code** (§2), states its own constants and writes its rules in terms of them,
and ends in checks (Stage 3 of §4).

#### What a section is

Used throughout as the unit of review, of change-listing and of dependency scoping, so it needs one
definition: **a heading, and everything beneath it up to the next heading of equal or higher level.**
Nested subsections belong to their parent. That is the whole of it — enough to make "which sections
changed", "review this section" and "what does this section depend on" mean the same thing everywhere.

#### Normative references, and how a document depends on another

Two documents that describe one system will refer to each other. That is not a defect, but an unmanaged
reference is: the cited section changes, the citing document goes on saying what it always said, and
nothing anywhere notices.

**The distinction to make is the one standards bodies make.** A reference is **normative** when the citing
document *would be incompletely specified without it* — the reader must go and read it. It is
**informative** when it is background, an example, or a pointer offered as a courtesy.

> **Every Layer 1 document carries a `Normative references` section listing the sections of other
> documents it depends on, with each one pinned to a hash of that section's text as it stood when this
> document was last reviewed against it.**
>
> **`NOT BUILT`** — see the end of this section. Nothing computes these pins today, so **no document should
> carry this table yet**: a table of hashes nobody generates and nothing checks is worse than none, because
> it looks like an assurance. Write ordinary qualified citations until the generator exists.

The body of the document keeps ordinary clean citations. The pins live in one table, and the table is
generated:

```
## Normative references

Sections of other documents this one would be incompletely specified without. The hash pins each
section as it stood when this document was last reviewed against it.

| Cited by | Depends on | Pinned | Reviewed |
|---|---|---|---|
| §3.2, §5.5, §9.3 | `OTHER.md` §2.5 — one-line statement of what is relied on | `a1b2c3d` | 2026-08-27 |
```

Four things earn their place there:

- **The left column is the blast radius.** When the cited section moves, that row says exactly which
  sections of *this* document have to be re-read. It is derived from the reference graph, so it costs
  nothing and cannot be wrong.
- **The one-line statement says what is relied on**, so a reader knows whether a change to the cited
  section is likely to matter before going to look.
- **The hash makes staleness detectable** rather than remembered. This is the standards convention that
  references to specific elements *"shall always be dated, because these elements are sometimes
  renumbered"*, with the date computed instead of typed.
- **Re-pinning requires a person.** A pin that can be refreshed silently will be, and the check becomes
  decoration. Re-pinning is an explicit act that asserts somebody looked.

**Only cross-document normative references are pinned.** References within one document are not, because a
document is reviewed whole. That is the difference between tens of pins and thousands.

**And a document is not reviewed while any of its normative dependencies is unreviewed.** This is the
standards rule that a document *cannot be published until every document it references normatively is at
that maturity level or higher*, and it is worth adopting exactly: a design resting on an unreviewed
foundation has not been reviewed, it has been read.

#### A document has three states, and the last one is deletion

**A superseded document is deleted, not kept.** Keeping it costs context in every search and every
session, and buys nothing that `git` does not already hold — the history has it forever, and the reason
to keep a document is that somebody will read it, which nobody does to a file headed *superseded*.

**A plan ends the same way, for the same reason.** A plan reaching completion is not supersession — it
is a plan working — but the outcome is identical: once executed it is deleted, because git holds it and
nobody reads a spent instruction list. Layer 3 below says what survives instead.

| State | What it is | What happens to it |
|---|---|---|
| **Current** | describes the system as it is | nothing |
| **Live but scheduled** | describes the system as it is, **while its replacement is being written** — agents genuinely need it to work on the system that exists | headed with what will replace it; deleted when the replacement goes live |
| **Superseded** | its replacement is live | **lessons extracted into the replacement, then deleted** |

**Extraction comes first, and the two halves go in one commit.** The risk is deleting before lifting what
survives, so the rule is: move what is still true into the document that replaced it, delete the original,
and name in the commit message what moved and where it went — so the pairing can be audited later by
somebody who doubts it.

**What survives is the reasoning, not the artefact.** For example: two failed implementations of a
subsystem leave nothing behind in the tree, and a section of the document that replaced them recording why
each failed and what would justify trying it again. Nobody needs the implementations. Everybody needs the
reasons, and they are only useful where somebody will read them.

**Deletion needs a reference sweep**, because a dead document is often still linked from a live one, and a
link to something deleted is worse than the document was.

### Layer 2 — the map

**A map is written from the code**, once there is code worth mapping, and updated as the last task of
every plan. It is what lets a reader find the right file without reading the codebase, and it is the
reason a session does not have to begin by ingesting the whole of one.

It is deliberately **not** the implementation instructions. See Layer 3 for why those are a different thing
with a different lifetime — that distinction is the one most often got wrong.

What it contains: what each file is for, what each major function or module owns, what is coupled to
what, where the seams are, and where the entry points are. What it does not contain: rationale, history,
or how to make any particular change.

#### Keeping it true

**Every change that moves code updates the map, in the same commit.** That is the whole discipline, and
it is the last task of every plan (Stage 8) rather than a tidying pass afterwards, because a map updated
later is a map updated from memory.

An update means, for whatever moved: the file it is in now, what it owns, and anything newly coupled to
it. Nothing else — no rationale, no history, no account of what it used to be.

**A map is judged by one question: can somebody who has never seen the code find the right file with it?**
If a change you just made would not have been findable from the map as it now stands, the map is not
finished. That is a judgement the person who made the change is well placed to make and nobody else is.

### Layer 3 — plans

`plans/YYYY-MM-DD-<slice-or-fix>.md`. **One per slice or per fix** — never one per feature, and never
one that outlives the change it describes. Dated, executed once, then **deleted** — and never edited
after execution, because a plan being edited is a plan that has become something else.

**How many plans a piece of work produces is Stage 4's question** (§4), not something decided when the
plan is written. A feature that produced exactly one plan was either small or was not sliced.

**If you find yourself wanting to update an executed plan, you want one of two other things:** the map,
if the question is *where does this live now*; or a new plan, if the question is *how do I change it*.
Appending to a spent plan produces a document describing no version of anything; rewriting it to describe
the current system turns it into a map, badly.

**Only plans get a path convention, and the rest do not need one.** A plan is one of many, created and
destroyed constantly, so a naming pattern stops the directory becoming a heap. The method, the inventory,
direction and the backlog are one document each — they are found by name, and the inventory names them. A
slice list lives with the backlog, because that is what it is.

### The inventory

Everything above defers to it, so it needs saying what one is. **The inventory is the single document
that answers "what does this project actually have?"** — and it is the only place in this family that
names files.

It must carry, for each thing the project holds:

| | |
|---|---|
| **What it is** | the file, and one line on what it owns |
| **Which kind** | which of the four layers, or which of the four kinds in this family |
| **What state it is in** | current, live-but-scheduled, superseded; reviewed or not; exists or not yet |
| **The exact commands** | what to run, and what output means it passed |
| **Precedence** | where two documents of one kind both apply, which wins |

Three rules keep it honest:

- **It is present-tense and describes only what is true now.** No history, no plans, no rationale — those
  are Layer 1's and the backlog's. An inventory that starts explaining *why* has become a design document
  and will rot at the first refactor.
- **It states what does not exist.** A missing row and a thing that does not exist are indistinguishable
  otherwise, and the second is far more useful to a reader than silence.
- **It is where an agent starts.** So it is short enough to be read in full every time, and it earns
  every line against that.

**Where there is no inventory yet, the first thing any piece of work produces is one** — otherwise every
rule that defers to it is unusable, and a reader has no way to tell an unbuilt mechanism from a missing
one.

### Direction and the backlog

The four layers describe **the system**. Two things describe **the work**, and both belong in one place
of their own rather than scattered through the documents they concern.

**Direction — durable.** The eventual vision, the entities the system is eventually for, and the
decisions that are locked — the ones that constrain every design that will ever be written and do not
expire when a milestone lands. In kind this is Layer 1, since it is intent; it is kept with the backlog
because it is intent about **where this is going** rather than about what the system must do now.

**The backlog — the queue that feeds Layer 3.** The milestone table: what is next, what is in flight, and
what was noticed and deliberately deferred. Each entry expires when it becomes a plan and that plan is
executed.

**The discipline, and it is the whole reason this section exists:**

> **Something you notice in passing and should not do now goes on the backlog — never into the document
> you happened to be writing when you noticed it.**

A design document that accumulates *remember to look at this later* notes has started keeping two kinds
of thing at once, which is the mistake §2 exists to prevent, arriving one sentence at a time. It is also
how a durable document acquires an expiry date nobody notices.

**A backlog entry is written to the same standard as a plan task: self-contained.** Enough context to act
on it later without the conversation that produced it — what was noticed, why it was deferred, and what
would have to be true to pick it up. An entry that only means something to the person who wrote it is a
note, not a backlog item, and it will be deleted unread.

### Layer 4 — checks

Which checks this project has is the inventory's. What kinds there are, and why the kinds must not be
confused, is this document's.

**Property checks and characterisation checks are not interchangeable, and the distinction is
load-bearing.**

| | Asserts | A failure means |
|---|---|---|
| **Property** | something that must be true of *any* correct implementation | the system is wrong |
| **Characterisation** | the behaviour that exists right now, recorded | the behaviour changed — which may be exactly what you wanted |

**A characterisation diff is a question, not a verdict.** Read it, decide whether it is the improvement you
asked for, and re-baseline in one deliberate commit that does nothing else. A property failure is a
verdict and needs no interpretation. **New rules go in property checks**; new behaviour shows up in
characterisation. Putting a rule in the baseline is how it gets re-baselined away by somebody in a hurry.

**Three more kinds earn their place**, and a project missing them will not notice:

- **Generators.** Any number quoted in a document is computed by a committed script, so the document and
  the thing it describes cannot drift. Where the document has a diagram, the same script draws it.
- **Structural audits.** That every cross-reference resolves; that every normative reference is still
  pinned to what it was reviewed against; that a prompt reproduced in two places is the same prompt.
- **Size-of-the-search assertions.** How much was examined, asserted directly rather than inferred from
  the fact that nothing was found. A check can only find what it looked at, so "nothing was found" is a
  statement about the search and not about the system.

### What is specified here and not yet built

**Some of what this document describes is designed and not implemented.** It is listed here rather than
left to be discovered, because a process that reads as though it is all in place is a process nobody can
follow: a reader hits a step, cannot find the tool it needs, and cannot tell whether they are looking in
the wrong place or at something that does not exist.

**The rule is that every unbuilt mechanism says so where it is described, and says what to do instead.**
An unbuilt mechanism with no interim behaviour is an instruction to stop working.

> **`NOT BUILT`** marks a mechanism this method specifies and this project has not built. Each entry says what
> it blocks and what happens until it exists. When one is built the marker is deleted — and a marker still
> present after the thing exists is itself a defect.

**The marker goes wherever the rule is stated, not only here.** A rule that depends on an unbuilt
mechanism and does not say so is a rule a reader will try to follow and cannot, and they will assume the
fault is theirs. This table is the summary; the markers are the warnings.

**And this table is a deliberate exception to a rule of its own** — §2 says deferred work goes on the
backlog and never into the document you were writing. The *work* of building these does live on the
backlog. What lives here is the **warning**, because the backlog is not where somebody stuck halfway
through a procedure will think to look. The two are not the same entry, and if this table ever starts
describing *how* to build these rather than what they block, it has become the backlog and should move.

| Mechanism | Needed by | Until it exists |
|---|---|---|
| **The reference graph** — a grammar distinguishing a normative citation from an informative one, and something that reads it | the blast-radius column, the seam set, seam ordering, the dependency closure | seams are identified by hand, and reviewed whenever either side of a known pair changes |
| **Section pinning** — a hash algorithm, a definition of where a section starts and ends, a normalisation rule, and a generator | the `Normative references` table | cross-document citations are written as ordinary references; **no pinning is performed, and no document should carry a table implying that it is** |
| **The dependency closure** — what a section transitively depends on | the input to every section review | the reviewer gets the section plus whatever a person judges it needs, and that judgement is stated in the dispatch so it can be argued with |
| **Review report locations** | every goldfish dispatch | the dispatch names a path for the report explicitly, rather than assuming a convention |
| **The disposition record** — where a finding’s adjudication is written down, including the ones rejected as wrong | every review’s pass condition | dispositions live in the conversation that produced them, which is **weak**, and is why this is the one worth building first: an unrecorded rejection is re-found and re-argued every time the document is reviewed again |
| **The review-state record** — where a document’s reviewed / unreviewed status lives | the rule that a document is not reviewed while a normative dependency is unreviewed | the inventory carries it as prose, and it is therefore unverifiable |

**This table is the fastest way to see what the method is currently worth.** The whole of §4 — the
elephant, the four reviews, slicing, plans, the triage — runs today. What is missing is the bookkeeping
that would make it *checkable* rather than *practised*, and the sign-off record is the absence that bites
first.

---

## 4. Adding a feature

Ten stages and four reviews.

**Ceremony is proportional to what the work produces, not to how big it feels.** Each review attaches to
an *artefact*, so a change that does not produce that artefact does not owe that review — and a change
that does owes it however small it looked:

| If the work produces… | it owes |
|---|---|
| new or changed Layer 1 text | section reviews, and GATE 1 when the document settles |
| a change to a section another document cites | a seam review |
| a plan for **new** work | GATE 2 |
| something a person can look at | GATE 3 |
| none of the above | none of them — the checks, and nothing else |

So a one-line capability that changes no intent and needs no plan runs the checks and stops. A one-line
capability that quietly changes what the system promises owes the whole loop, because the promise is the
expensive part. **The size of the diff is not the input to this decision, and using it as one is the
ceremony mismatch §1 warns about.**

*(A defect is §5's route rather than this one — not because it is smaller, but because it starts by asking
a different question.)*

The four reviews ask four different questions, and none substitutes for another:

| Review | Asks | Why it cannot be merged with the others |
|---|---|---|
| **Section** (Stage 1) | is this section **coherent** — clear, complete on its own terms, and not self-contradictory? | fast, local, runs while the ink is wet. It cannot ask whether the *system* is implementable, because that is a property of the whole document |
| **GATE 1 — document** (Stage 2) | is the document as a whole implementable and consistent? | section review **cannot by construction** see a contradiction between two sections |
| **GATE 2 — plan** (Stage 6) | can this be executed by somebody who has never seen the code? | a spec fails by ambiguity; a plan fails by assuming context |
| **GATE 3 — the artefact** (Stage 9) | is this what was actually wanted? | everything above can pass on something nobody asked for |

**And a fifth runs on a different clock:** the **seam** review, which asks whether two documents agree. It
is not in the sequence below because it is not triggered by reaching a stage — see *When each check runs*
at the end of this section.

### Stage 0 — decide which layer you are changing

If this is a defect rather than a new capability, go to §5 instead. If you cannot tell, §5's triage
decides.

### Stage 1 — the elephant

The long, context-rich design conversation that produces or extends a Layer 1 document. The elephant holds
everything: every decision, every micro-argument, the whole history of the feature.

#### Your job as the elephant is to argue, not to agree

**You are trained to be agreeable, and here that is a defect.** Agreement feels like progress and produces
a document that records only what the author already believed — perfectly clear, and clearly wrong. It
will then pass every review, because nothing downstream can detect a design nobody contested.

**A design conversation in which you contested nothing has not been held.** So, while writing:

- **Challenge the premise, not only the detail.** When asked *which of these two*, your first duty is to
  ask whether that is the right question.
- **Push on the edges.** Where does this rule divide by zero, read the sign of nothing, or meet a count of
  one? Ask it every time. A section of edge cases is what those questions produce, and it is never written
  by somebody nobody asked.
- **Say when you disagree, and say it first.** An objection buried under three paragraphs of agreement has
  not been raised.
- **Never capitulate to be agreeable.** Change position when the argument is better, and say which
  argument moved you. Changing position because the author repeated themselves is a failure, and you will
  be tempted to call it collaboration.
- **Give the opinion nobody asked for.** Where a decision looks wrong, say so before it is built.
- **Do not soften a finding to be pleasant.** "This might possibly be slightly unclear" is not a kinder
  version of "this is ambiguous and here is the second reading" — it is a less useful one.

**Watch yourself for the drift.** It is gradual: you stop asking hard questions, start opening with what
is good about the idea, and begin treating the author's last message as settling things. If you notice
several exchanges in a row where you raised nothing, you have drifted, and the fix is to go back and say
so rather than to be sharper from here on.

**The author can pull you back, and should.** A line worth them keeping to hand:

> *"When you agree with me you are not being helpful. You are most helpful when you challenge my thinking
> and force me to think about the edges of my problem."*

**And it runs both ways.** An elephant argued down every time it objects learns to stop objecting, so an
author who wants a critic has to lose some of the arguments.

#### The section goldfish, and when it runs

**Each section gets a fresh reviewer with no memory of the conversation that produced it**, using the
prompt in Stage 2. **Twice when a section is first written**, and the two runs ask different questions:

| Run | When | The question it is really asking |
|---|---|---|
| **On creation** | the section is first written, **before the author sees it** | is this coherent — unambiguous, complete on its own terms, free of undefined terms and internal contradiction? |
| **On settle** | the author and the agent have finished agreeing changes | **did the back-and-forth break it?** |

**Thereafter, once more each time the section materially changes** — the *on settle* run only, since a
section is created once. A section nobody has touched costs nothing, which keeps the total proportional to
how much is actually being written.

**It does not run during the back-and-forth**, and that restraint is the whole reason the budget is
affordable. A section may be revised five times while a decision is being settled; re-reviewing each
revision spends tokens on churn, and every one of those reviews is about to be invalidated by the next
edit anyway.

**The second run is not a repeat of the first.** Revision is where contradictions get introduced — a
paragraph is fixed and quietly invalidates another two sections down, or an agreed change removes the
sentence that a later rule depended on. The first run tests the draft; the second tests the *edits*.

**Findings come back with the section, not after it.** The agent presents the section and the review
together, so the author reads both at once rather than approving something and then being told about it.

**The `goldfish` skill runs it.** How a reviewer is dispatched — what it may read, where its report
goes, which model — is the skill's, and is not worth carrying in your head for every task. What is worth
carrying is that **the reviewer sees the section and what it depends on, and nothing else.**

**`NOT BUILT`**: nothing computes what a section depends on, so a person chooses — and says so when
dispatching, which at least makes the choice visible enough to be argued with.

#### And the rest of the discipline

- **One section at a time. Stop for review. Never run ahead.** A section written before the previous one
  is agreed is a section written against assumptions that may not survive.
- **Measure before you write** (§6). Any claim about geometry, behaviour or performance is settled
  against the running system *before* it goes into a document, not after.
- **Ask before writing when the decision is genuinely the human's.** Make routine calls yourself and say
  you made them.
- **End every exchange with the list of sections you changed**, marked *rewritten-in-full* or
  *changed-in-place*, and call out separately anything that touched already-reviewed text.
- **Flag decisions nobody asked for**, each with a one-word way to reverse it.

### Stage 2 — GATE 1: the goldfish reads the whole document

A fresh agent, given **only** the document, must be able to implement it. This is the acceptance test for
every Layer 1 document.

**This gate is not waivable on the grounds that every section already passed**, and that is the single
most important sentence in this section. Section review reads one section at a time, and a reviewer
reading one section at a time **cannot by construction** detect a contradiction between two of them: the
defect is not present in either section alone, only in the pair. A document whose sections all passed and
which has never been read whole has not been reviewed for the largest class of defect it can contain.

It uses the same prompt as the section review, on the whole document.

**Prompt:** [`prompts/goldfish-spec.md`](prompts/goldfish-spec.md). The `goldfish` skill runs it.

Run it with the `goldfish` skill.

#### A finding is a claim, not a verdict

**This governs every review in this document** — section, document, plan, seam and map alike. It is
stated here because this is the first gate a reader meets, not because it is GATE 1’s.

**No finding is ever applied automatically.** The report comes back to the author, who adjudicates every
item in it. That is not a formality to be rushed — it is the point at which a review becomes useful, and
skipping it hands the document to a reviewer who was deliberately given less context than anybody else
involved.

**Every finding gets one of three dispositions**, and the third is the one most methods forget to offer:

| | |
|---|---|
| **Fixed** | the finding is right and the document changes |
| **Accepted** | the finding is right and the document stays as it is, for a stated reason |
| **Rejected** | **the finding is wrong** — the reviewer misread, over-reached, or was missing something it was never given |

**Findings arrive already checked** — whoever ran the review verifies the checkable claims before
reporting them, which is the skill's business rather than yours. What is left for you is the judgement,
and it turns on which of two kinds each finding is:

| Kind of finding | How much to defer |
|---|---|
| **Comprehension** — *"I could not tell what this means"*, *"I would have had to ask"* | **Near-total.** A reader cannot be wrong about their own confusion, and arguing them out of it changes nothing about the next reader |
| **Factual** — *"these two statements contradict"*, *"nothing implements this"*, *"this number is wrong"* | **None until checked.** These are ordinary claims and they are ordinarily sometimes wrong |

That is the correct reading of the principle this method is built on:

> If a Goldfish that can't read your mind still reaches the same conclusion, the doc is real. If it
> can't, **the doc is wrong — not the Goldfish.**

It is exactly right about *comprehension* and does not extend to matters of fact. A reviewer who says it
could not follow you has proved something. A reviewer who says two sections contradict has made an
assertion you can go and test.

**Rejections are recorded with their reason, and that is not bureaucracy.** An unrecorded rejection is
re-found by the next review, re-adjudicated, and re-rejected — and the third time somebody will assume
everyone before them was careless and "fix" it. Recording it once ends that loop.

**And the opposite failure is just as real.** Rejecting findings because they are inconvenient, or
because the document took a long time to write, produces a review that costs tokens and changes nothing.
A report being rejected wholesale usually means the review was set up badly, and that is worth fixing
rather than shrugging at.

#### What counts as passing

> **Every finding in sections 1 to 5 has been adjudicated — fixed, accepted with a reason, or rejected
> with a reason.** Sections 6 and 7 are read, and carry no obligation to disposition each line.
>
> **`NOT BUILT`** — there is nowhere durable that a disposition is recorded, so today it lives in the
> conversation that produced it and does not survive the session. Of everything not yet built this is the
> weakest point, because afterwards an unrecorded disposition and an unnoticed finding look identical.

Sections 1–5 are **findings** — blocking questions, ambiguities, undefined terms, unverifiable claims,
contradictions. Each needs an answer, and *"a person considered it"* is a different state from *"nobody
looked"*. Recording the disposition is what keeps them apart.

Sections 6 and 7 are **signals**. Whether a number's provenance matters is a judgement the reviewer
cannot make and the author can, and the same is true of whether the reviewer's summary is close enough.
They are read, and escalated only when the author decides they matter — but they are read, because
section 7 is the one place a reviewer who had no questions and understood the wrong system shows up.

### Stage 3 — the checks come before the plan

Before anything is built, the document says **what would fail if the design were wrong**: acceptance
criteria, the corpus they run against, and the fixtures for the failures a healthy corpus never produces.
For example: a verification section that enumerates every instance a definition resolves to, turns each
success criterion into a check with a stated tolerance and a named point in the process where it runs,
asserts the *size* of what was
examined rather than inferring it from having found nothing, and supplies a deliberately-broken fixture
for every named failure kind — because a corpus of correct definitions exercises none of them.

**A corpus is the set of cases a check runs against**, and it has a shape worth stating even though its
contents are the project's: one entry per distinguishable starting circumstance, enumerated rather than
sampled, with the *count* asserted so that a corpus which quietly shrinks is caught. Alongside it sits a
**fixture per failure kind** — a deliberately broken input that must produce exactly that failure —
because a corpus made entirely of correct cases exercises none of the failure paths. What the corpus
actually contains, and where it lives, is the inventory's.

**This stage is what makes the method work at all** — it is the single practice separating teams for whom
specifications hold from teams whose specifications drift. Do not defer it to implementation time. At
implementation time you will write the checks that the code you just wrote happens to pass.

### Stage 4 — slice

**A large piece of work is cut into slices before any plan is written, and never before the design is
finished.** The order is not negotiable and the reason is short: *you need the full picture before you can
slice well.* Slicing an unfinished design cuts along boundaries the design is about to move.

**Slicing does not touch the design document.** This is the thing most often got wrong. The spec stays
whole and is not partitioned, chopped, or split into per-slice copies — it remains the reference every
slice draws on. What slicing produces is a **separate ordered list**, one short entry per slice, which is
backlog rather than intent (§3).

**And the plans are not written now.** One plan per slice, each written **when that slice is reached**,
because slice three's plan should be informed by what slice two turned out to be like. A feature that
produced exactly one plan was either small or was not sliced.

#### What makes a valid slice

Three criteria, and one test that kills most bad cuts.

- **Visible.** Somebody can look at the result and judge it. If nothing can be seen after a slice is
  finished, it delivered nothing that can be reviewed.
- **Valuable.** It answers a question worth asking, so that finishing it teaches you something.
- **Cuts through the layers.** A thin thread of function through the whole stack beats a complete layer
  with nothing above or below it.

> **The test: if slice one needs slice two to function, it is a horizontal split in disguise.**

Later slices building on earlier ones is fine — that is just order. *Earlier* needing *later* means the
work was divided by layer and dressed up as slices, and nothing can be reviewed until both are done.

#### How to find the cut

Five axes, and the job is to find the one that yields a thin deliverable slice rather than to apply all
five:

| Axis | Cut it by |
|---|---|
| **Spike** | the investigation first, as its own slice, where the design depends on an unknown |
| **Path** | one route through, the other routes later |
| **Interface** | one surface first |
| **Data** | one case, size, count or format first |
| **Rules** | the simplest rule first, the variations after |

**The first slice is a walking skeleton**: the thinnest end-to-end path that proves the architecture,
touching every seam with the least possible implementation behind each. It is explicitly *not* a usable
feature. Its whole job is to prove that the pieces connect before anything is built on the assumption
that they do.

Useful defaults for thinning a slice: the simplest case first; reading before writing; one input before
many; and deferring validation, error handling, performance and polish until the path exists.

#### What a slice entry contains

Short — a paragraph, not a plan:

```
Slice N — <name>
  Delivers      what can be looked at when this is done
  In            what is included
  Out           what is deliberately deferred, and to which slice
  Draws on      which sections of the spec
  Done when     the check or the diagram that settles it
```

**`Out` is the field that does the work.** A slice defined only by what is in it will grow while nobody
is watching; a slice with an explicit *out* list has a boundary somebody has to argue with.

### Stage 5 — write the plan

A Layer 3 document: `plans/YYYY-MM-DD-<name>.md`. It describes **a delta from the code as it is now** to
the code as it should be. It is never a description of how to build the system from scratch.

```markdown
# <name> — implementation plan
> **Goal:** one sentence
> **Spec:** which Layer 1 document and which sections
> **Map:** the Layer 2 map, at the commit this was written against — or *none, and why*
> **Status:** in progress — deleted on completion

## Constraints
Exact values from the spec, not restated in the plan's own words.

## Task N — <name>
**Files:** exact paths, marked create / modify / delete
**Interfaces:** signatures consumed and produced
**Steps:** write the failing check → see it fail → implement → see it pass → run the checks
**Verification:** the exact command, and what its output must say
```

Rules, each earning its place:

- **Assume the implementer knows the domain poorly and the codebase not at all.** They are technically
  capable and have never seen this project.
- **No placeholders.** "Handle edge cases", "similar to task 3", "as appropriate", "TBD" are plan
  failures, not shorthand.
- **Bite-sized tasks** — a few minutes each, independently verifiable.
- **Exact signatures across task boundaries**, so task 6 consumes what task 2 actually produced.
- **Every task ends in a check that can fail.**

### Stage 6 — GATE 2: the goldfish reads the plan

**A spec fails by being ambiguous; a plan fails by assuming context.** They fail differently, so they are
reviewed differently, and passing gate 1 says nothing about gate 2.

**Prompt:** [`prompts/goldfish-plan.md`](prompts/goldfish-plan.md). The `goldfish` skill runs it.

### Stage 7 — execute

- **Follow the plan exactly.** The steps are small on purpose.
- **Do not force through a blocker.** If a task cannot be done as written, stop and go back to Stage 5 —
  the plan was wrong, and discovering that is a legitimate outcome rather than a failure.
- **Check-first.** Write the failing check, watch it fail, then implement. A check that has never failed
  has not been tested.
- **Run the checks after every task**, not at the end of the plan — the inventory names them. A task that
  broke something is cheap to find now and expensive to find after five more.
  *(Not to be confused with GATE 1–3, which are reviews. This is the check suite.)*

### Stage 8 — close out

Four things, none optional:

1. **Update the map** — the last task of every plan, wherever a map exists. **Where one does not, creating
   it is itself work and belongs on the backlog**, not silently skipped: a process step that cannot be
   performed must say so, or it teaches everybody that close-out items are advisory.
2. **Delete the plan.** It has been executed, so it is spent. The commit that removes it is the record
   of what was done, and git holds the text; a directory of completed plans is context cost with no
   reader.
3. **Update the Layer 1 document's status** if the work changed what is built.
4. **Run every audit the inventory lists.** Every runnable one green; every unrunnable one named, with
   the reason (§8).

### Stage 9 — GATE 3: a human looks at the result

For work with visible output, a person reviews the artefact itself, not a description of it.
**Stage the review, and make the first stage small enough to be real.** A first pass of a handful of
artefacts — chosen because each would fail in a different way — answers *is this roughly right at all*,
which is the only question worth asking first. Widen only as confidence grows.

**The general rule that section is an instance of:** *the first review pass is small enough to be real.*
A person signing four hundred artefacts signs none of them.

### When each check runs

The stages above say *which* reviews a change owes. This says *when* each fires:

| Runs on | What fires |
|---|---|
| a section is finished, and again when it settles | the section review |
| **the author says the change is ready** | seam reviews on touched seams, the full check suite, the structural audits |
| a document is complete; a slice is finished | GATE 1, GATE 2, GATE 3 |
| a schedule | the full sweep — every seam, and documents against the code |

**Two of those want a word.** *The author says the change is ready* is a decision, not an event — there is
no automatic trigger, and a global question asked of a half-finished edit returns noise about
incompleteness rather than signal about disagreement. And the **calendar** exists because code has a
feedback loop and prose does not: code is continuously exercised by tests and CI, so its drift surfaces
quickly, while a document can be wrong for a year in silence.

#### The seam review

**A seam exists wherever one document normatively references another** (§3). **`NOT BUILT`** — nothing
computes that set today, so seams are identified by hand and the known pairs are recorded in the
inventory. Once the graph exists the set is *computed, never remembered*; until then the practice is that
a change to either side of a known pair triggers the review. A change to a section that is cited by another
document has touched a seam, and that seam is reviewed before the change goes in.

**Prompt:** [`prompts/goldfish-seam.md`](prompts/goldfish-seam.md). The `goldfish` skill runs it.

**Order seams by citation count.** The most-cited section across a seam is where a contradiction does the
most damage, so that is where to start — the difference between reviewing the seam and reviewing all of
it. **`NOT BUILT`**: the count comes from the reference graph, so until that exists the ordering is a
judgement. A rough one is still much better than none.

#### One review, then a person

**A review runs once and stops.** It surfaces findings, the findings go to the author, and the author
decides. There is no second automatic pass, and **nothing re-runs a review until a person has acted on
the first one and asked for another.**

Running reviews back to back with nothing in between is the failure this rule exists to prevent. It burns
tokens re-finding what has already been found, and it only makes sense if something is applying the
findings automatically — which nothing here ever does. **Two consecutive reviews with no human decision
between them is a sign the loop has escaped, not a sign of thoroughness.**

---

## 5. Fixing a bug

**A defect usually means a requirement nobody pinned down** — that instinct is right and it is the reason
this project's documents exist. But applying §4's full loop to every defect is the most commonly reported
way this method fails, so a bug is triaged first.

### The discriminator

> **Could a check have been written, from the documents as they stand, that would have caught this?**

That one question sorts every defect, and it works because §3's Layer 4 is where the answer lives.

| Answer | Kind | What you do | Cost |
|---|---|---|---|
| **No** — no check could have been written, because the documents do not say | **Spec bug** | §4's full loop, scoped to the gap. The document is wrong by omission | full ceremony, and it is earned |
| **Yes, and nobody wrote it** | **Code bug** | Write the check — watch it fail — fix the code — watch it pass. **No change to intent**, so no section review and no GATE 1 — the intent was captured and only the verification was missing | a plan of one or two tasks. §4's ceremony table decides the rest, so a visible change still owes GATE 3, and Stage 8's close-out always applies |
| **Yes, it exists, it passes, and the behaviour is still wrong** | **Design bug** | Back to stage 1. The system does what you specified and what you specified is not what you want | a design conversation, not an edit |

**The third row is the one to be honest about.** It is the case the literature on this method quietly does
not handle: specifications assume they can be corrected and the code regenerated, and say very little
about a specification that is working exactly as intended and is simply wrong. It is not a documentation
failure and it cannot be fixed by patching a paragraph. It goes back to the elephant.

**Every spec bug leaves a permanent check behind.** That is the point of the loop: the documents get
better at exactly the rate the failures teach you something, and the same defect cannot recur silently.

---

## 6. The rules that keep this from rotting

Each of these was learnt here, the hard way, and each has cost real time.

**Measure, don't assert.** Settle any claim about the system's behaviour with a throwaway script against
the running system **before** writing it down, never after. This has repeatedly overturned confident
reasoning, including reasoning that had already been written down and agreed to by everybody present.
*Which harness to measure through is the inventory's.*

**Guard the measurement.** A measurement that measures nothing reports success. Assert that you have the
data *before* you compare it — that the arrays are non-empty, that the counts are what you expected, that
the accessor returned what you think it did. A comparison of two empty sets is exact, and a stale global
can make part of a result agree and the rest disagree while looking like corroboration. The inventory
lists the specific ways this has happened here.

**Numbers quoted in a document are derived in a committed generator**, so the document and the thing it
describes cannot drift. The generator computes what the document quotes, and where a diagram is involved
it draws the diagram from the same construction, so the picture and the words cannot disagree either.

**"Cannot drift" is a claim, and it needs a mechanism to be true.** A generator nobody runs proves
nothing, so a generator is part of the check suite and runs with it — not a script somebody remembers.
Where the number in the prose is typed rather than produced, the generator prints it and a check compares
the two; where that is not worth the machinery, the document says the number came from a generator and
names it, so a reader can re-run it in one command.

**Constants are named, and rules are written in terms of the names.** A rule written as a bare number
stops being true the day the number changes, and does so silently.

**Edit documents with assertion-checked scripts.** Exact-string replace; count the matches; fail loudly
and exit **before writing** if the count is not exactly 1.

**Line endings can differ between documents in one repository, and a mismatch fails silently** — an exact
match against a CRLF file from an LF assumption finds nothing and reports nothing, so the edit is a no-op
that looks like a success. Normalise `\r\n` → `\n` before matching and restore the original on write.
Which documents use which is the inventory's business, not this document's.

**After any document edit, run the project's audits.** *Which audits those are, and the exact command, is
the inventory's* — this document deliberately does not name them, because a command duplicated in two
places is a command that will disagree with itself, and that is not a hypothetical: it happened here, in
two documents written the same afternoon.

**After splicing a section, check the markers balance** — emphasis pairs and code quotes. A splice landing
mid-emphasis produces a document that still renders and no longer says what it said before, which is the
worst kind of edit: invisible in the output and wrong in the source.

**Every check is shown an input it must fail on.** A check that has never failed is a check nobody has
tested. Build the negative case at the same time as the check, not later.

**Qualify every cross-document reference.** Write the document name next to the section — a bare section
number cannot be attributed to a document by any tool, and a reference nobody can attribute is a
reference nobody can check. This part is in force today.

**Pinning the normative ones is **`NOT BUILT`**** (§3). When it exists, a normative reference will additionally
carry a hash in the citing document's `Normative references` table, so that a change to the cited section surfaces
as a stale pin rather than as nothing at all.

**When a cited section changes, the citing document is re-reviewed, not just re-pinned.** Re-pinning is
the act of asserting that somebody looked. A pin refreshed without a reading is worse than no pin, because
it converts an unknown into a false assurance.

## 7. Anti-patterns, and the evidence against them

| Anti-pattern | What it looks like here | Why not |
|---|---|---|
| **Merging the design documents** | one file covering what two or three documents cover now | reliability degrades as input grows, so a merged document makes every future goldfish test worse — and it destroys the ability to say that one document is reviewed and another is not |
| **Full ceremony on a small defect** | a design conversation about a typo | the most commonly reported failure of this method. §5's triage exists to prevent it |
| **Reverse-engineering a spec from code** | asking an agent to read the source and write down what it does | it produces a document that describes the bugs as faithfully as the features, and reads as intent. Specify the change you are about to make; do not transcribe the system you have |
| **Routinely regenerating the codebase from documents** | delete and rebuild on every change | unproven in practice, and it loses the reasoning that only ever existed in code. Use it as a **diagnostic**, rarely and deliberately — see below |
| **Editing a derived artifact by hand** | correcting a stored resolution, a golden baseline, or a generated diagram | the fix survives until the next regeneration and then vanishes, taking the correction with it. Fix the definition or the rule that derived it |
| **A check with no negative case** | an assertion that has passed since the day it was written | it may be asserting nothing. Show it an input it must fail on |
| **Silence as a way of saying something** | leaving a case out because the answer is obvious | a case left out on purpose and a case forgotten are identical in the data, and no amount of care at authoring time survives the document being edited a year later |

**On rebuilding from documents.** The strong form of this method — code as a generated artifact, rebuilt
from the specification on demand — is the least evidenced version of it and is not what this project does.
But the *test* is worth running occasionally: point a fresh agent at the documents alone, have it rebuild
a bounded part of the system, and see whether the checks pass. A project is well suited to it when the
build is simple, the dependencies few, and the checks numerous enough to grade the result honestly — and
the fewer of those three that hold, the less the test tells you. Run it deliberately at a slice boundary,
as a measurement of whether the documents are complete. Do not adopt it as the routine path.

---

## 8. Git

Deliberately light. What matters is what must be true, not which branch it happens on.

- **Every audit green before any commit** — all of them, not the ones you remember. The inventory lists
  which audits this project has and the command that runs them.
- **An audit that cannot run in this environment is not green, and not a failure either.** It is
  *unrunnable*, the inventory says so and why, and a commit made without it says which ones were skipped.
  Silently counting an unrunnable check as passing is how a suite quietly shrinks to whatever happens to
  work on one machine.
- **Never commit or push unless asked.** Ask, and say what would be in the commit.
- **One commit per completed slice or per completed fix**, with the plan committed alongside the change
  it describes, so the record and the work arrive together.
- **A characterisation re-baseline is its own commit**, never folded into a behaviour change, because the
  diff is the only evidence anybody has that the change was the one intended.

---

## 9. Quick reference

**I want to add a capability** → §4. Elephant with a section review per section, whole-document goldfish,
checks, **slice**, one plan per slice, plan goldfish, execute, close out, human review.

**I found a bug** → §5. Ask whether a check could have caught it, and let the answer choose the route.

**I want to know when a check runs** → §4, *When each check runs*. Section review on the authoring clock,
seam reviews and the audits pre-commit, gates at milestones, the sweep on the calendar.

**The work is too big for one plan** → §4 Stage 4. Finish the design first, then slice; the spec is never
cut up, and each slice gets its own plan when it is reached.

**I am changing a section another document cites** → that is a seam. Review it before the change goes in.
(Re-pinning comes with the pin mechanism, which is **`NOT BUILT`**.)

**I want to know where something lives** → the map (Layer 2), not a plan and not a spec.

**I want to know why something is the way it is** → the Layer 1 document that owns it. If the answer is
not there, that is a gap in the document rather than a reason to go digging in git.

**I have edited a document** → run every audit the inventory lists, then list which sections changed and
how.

**I am about to write a number into a document** → measure it first, and derive it in a generator under
the check suite.

**I am about to write "obviously" or "clearly"** → that is usually a gap the goldfish will find. Write the
rule instead.

---

## Sources

What stands behind each rule here — what was measured, by whom, and the places this document
deliberately parts company with something it cites — lives in `SOURCES.md`. Nothing above depends on
reading it.
