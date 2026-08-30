# Method

> **Read this first.** It is the procedure every other document here is written under, and it applies
> to agents and to people equally. It names nothing belonging to the system this project builds — the
> inventory holds those — and would apply to a different project unchanged. It is not a manual for work
> done inside a subagent either: what is here is what the agent talking to you needs in **every**
> session.

---

## The rule that overrides everything else here

> ### **A finding is acted on only when the author says so, item by item.**
>
> A finding is a claim for the **author** to accept, reject or act on — never an instruction to whoever
> ran the review. Not the obvious ones, not the trivial ones, not the ones you have already checked.
>
> **This is not about correctness.** It is about the author continuing to know what is in their own
> documents. A document quietly improved by a succession of reviewers is one its author no longer knows,
> and that is worse than any defect a review could have caught.

**If you are an agent**, a review ends with you presenting findings and waiting. Applying one you were
sure about, because asking felt like friction, is the most damaging thing you can do here.

---

## The eight imperatives

Each is here because missing it is unrecoverable — nothing downstream would tell you it had happened.

**One. No finding is applied unasked.** The rule above; it is first because the rest assume it.

**Two. Argue. Agreement is the defect.** A design nobody contested records only what the author already
believed, and it passes every later check, because nothing downstream detects a decision no one
questioned. Object before you elaborate; challenge the premise, not only the detail; ask where the rule
meets zero, or nothing, or one. Change position when the argument is better, and say which argument
moved you — never because the author said it twice.

**Three. One section at a time, stop, and bring the findings back with the section.** A section written
before the previous one is agreed rests on assumptions that may not survive, and the author should read
the text and its review together rather than approve something and be told about it afterwards.

**Four. Settle it against the running system before you write it down, and prove you have data first.**
Any claim about behaviour, geometry or timing is measured, not reasoned, and measured *before* it goes
into a document; this has repeatedly overturned reasoning everybody present had agreed to. Then guard
the measurement — check the collections are not empty and the counts are what you expected before
comparing anything. Comparing two empty sets succeeds perfectly and tells you nothing.

**Five. Never put an expiring thing inside a durable one.** The four layers exist to make this
enforceable. A plan pasted into a specification is a lie with a date on it; a note to look at something
later, dropped into whatever you were writing, is the same failure arriving a sentence at a time.

**Six. Ask which layer you are working in, and what the work owes because of it.** Ceremony is
proportional to what a change produces, never to how large it feels. A one-line change that quietly
alters what the system promises owes the whole loop; a large one that alters no promise owes the checks
alone. Sizing it by the diff is the commonest way this method fails.

**Seven. One unit of work, one session.** Hand off rather than run on: obedience to instructions falls
as a session lengthens, and the fall is not visible from inside it. Write down what was decided and
start again, carrying no reasoning across — importing the argument recreates what a fresh session exists
to escape.

**Eight. End every exchange with what changed, and flag anything nobody asked for.** List the sections
you touched, each marked rewritten-in-full or changed-in-place, calling out separately anything that
reached already-reviewed text. Name every unrequested decision, with a one-word way to undo it.

---

## The two families

The first question to ask of any new writing. They are kept apart because they answer to different
readers and change for different reasons.

| Family | What it answers | Members |
|---|---|---|
| **About the system** | what must be true, where it lives, how to change it, whether it holds | the four layers below |
| **About the work** | how the work is done, what exists, where this is heading, what is next | this file, the inventory, direction, the backlog |

## The four layers

A document's shape follows its lifetime. Conflating the first and the third is what this structure
prevents: durable knowledge mixed with per-change tactics leads a reader to apply stale tactical detail
to a situation nobody wrote it for.

| | Layer | The question it answers | Tense | Lifetime |
|---|---|---|---|---|
| **1** | **Intent** | what must be true, and why? | timeless | **durable** — changes when the intent does |
| **2** | **The map** | what lives where? | present | **durable** — always describes the code as it stands |
| **3** | **Plans** | how do we get from here to there? | imperative | **expires on execution** |
| **4** | **Checks** | is it actually true? | executable | **durable**, and only ever grows |

## What a change owes

Each review attaches to an artefact, so work that does not produce that artefact does not owe that
review — and work that does owes it however small it looked.

| If the work produces… | It owes |
|---|---|
| new or changed intent | a review of each section as it settles, and a whole-document review when the document does |
| a change to a section another document cites | a seam review |
| a plan for new work | a plan review |
| something a person can look at | a person looking at the artefact itself, not a description of it |
| none of the above | the checks, and nothing else |

## The four reviews

Four different questions, and none substitutes for another. A fifth, the seam review, runs on its own
clock: it fires when either side of a citation changes.

| Review | What it asks | Why it cannot be merged with the others |
|---|---|---|
| **Section** | is this section coherent — unambiguous, complete on its own terms, free of undefined terms? | fast and local, run while the ink is wet; it cannot ask whether the whole thing can be built |
| **Document** | can the document as a whole be implemented, and does it agree with itself? | a reader given one section at a time cannot, by construction, see two sections contradict |
| **Plan** | could somebody who has never seen the code carry this out? | a specification fails by being ambiguous, a plan by assuming context |
| **Artefact** | is this what was actually wanted? | everything above can pass on something nobody wanted |

## When each review fires

The reviewer is a fresh reader, given the text and no other context. Knowing none of the conversation is
what makes the review worth running, so whatever it needs must be put in front of it on purpose.

| Runs on | What fires | Which skill runs it |
|---|---|---|
| a section is finished, and again once it settles | the section review | `goldfish` |
| the author says the change is ready | seam reviews on whatever seams were touched, and the checks | `goldfish` |
| a document is finished; a slice is finished | the document review, the plan review, the look at the artefact | `goldfish` |
| a schedule | the full sweep — every seam, and the documents against the code | `goldfish` |

## The three dispositions

Every finding gets one, and the third is the one most processes forget to offer.

| | |
|---|---|
| **Fixed** | the finding is right and the document changes |
| **Accepted with a reason** | the finding is right and the document stays as it is anyway, for a reason that is written down |
| **Rejected with a reason** | the finding is wrong — the reader misread, over-reached, or was missing something never given to them |

---

## Rules that follow from the layers

- **One document per subject**, and the subject is a question somebody will one day ask. Never split a
  document because it got long: the cut lands somewhere nobody will remember.
- **A section is a heading and everything beneath it, up to the next heading of equal or higher level.**
  Nested subsections belong to their parent. One definition, so that reviewing a section, listing what
  changed and scoping a dependency all cut the text in the same place.
- **A superseded document is deleted, not kept.** Lift what is still true into whatever replaced it,
  delete the original, and say in the commit message what moved and where — both halves in one commit.
- **A plan is spent once executed**: deleted, and **never edited after execution**. Wanting to update one
  means wanting either the map or a new plan.
- **Something you notice in passing and should not do now goes on the backlog**, never into the document
  you happened to be writing when you noticed it.
- **Intent names no code** — no path, no line, no symbol as the code spells it. State the behaviour or
  the derivation instead; the name belongs in a check, where it rots loudly rather than in silence.
- **A map never explains why.** The moment it justifies a decision it has become intent, and nobody
  updates a rationale while moving a function.
- **A claim with no check behind it is an opinion**, however carefully it was argued.

## What a review is worth

- **A review passes with every finding adjudicated** — fixed, accepted with a reason, or rejected with a
  reason. That is the pass condition for all of them, stated once. Record the rejections: an unrecorded
  one is re-found by the next review, re-argued, and eventually "fixed" by somebody who assumes everyone
  before them was careless.
- **A document is not reviewed while a normative dependency is unreviewed.** It has been read, not
  reviewed: a design resting on an unreviewed foundation inherits whatever is wrong underneath it.
- **A seam is reviewed when either side changes**, and re-reviewed rather than merely re-marked. Marking
  a citation as current without reading it converts an unknown into a false assurance.
- **A review runs once and stops.** Nothing re-runs it until a person has acted on the first one and
  asked for another. Two consecutive reviews with no decision between them mean the loop has escaped.

## Rules for the work itself

- **Sort a defect by asking what a check could have caught.** Could a check have been written, from the
  documents as they stand, that would **have caught this**? No — the documents are wrong by omission and
  it earns the whole loop. Yes and nobody wrote it — write the check, watch it fail, fix, watch it pass.
  Yes, it exists, it passes, and the behaviour is still wrong — then the specification is working as
  written and is not what anyone wants, and it goes back to the design conversation.
- **Every number a document quotes is derived in a generator that runs with the checks.** A generator
  nobody runs proves nothing, so it is part of the suite and not a script somebody remembers.
- **Constants are named**, and rules are written in terms of the names. A rule written as a bare number
  stops being true the day the number changes, and does so silently.
- **Edit documents with assertion-checked scripts** — exact-string replacement, count the matches, and
  **fail before writing** if the count is not exactly one.
- **Every check is shown an input it must fail on**, built at the same time as the check itself. An
  assertion nobody has watched fail may be asserting nothing whatever.
- **Never commit or push unless asked.** Ask, and say what would be in it.
- **Never reverse-engineer a specification from code.** It produces a document describing the bugs as
  faithfully as the features, and it reads like intent. Specify the change you are about to make.
- **Never hand-edit a derived artifact** — a generated diagram, a stored baseline, a computed table. The
  correction survives until the next regeneration and then vanishes. Fix whatever derived it.
- **Never leave a case out because the answer is obvious.** In the result, a case left out on purpose
  **and a case forgotten are identical**, and no care taken while writing survives the document being
  edited a year later by somebody who was not there.
