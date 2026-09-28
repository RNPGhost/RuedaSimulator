# The elephant — the conversation before a document, and the writing of it

> **This is a design document about the process, not about the system this repository builds.** It sits
> in the *about the work* family and has no layer: layers belong to the other family, and this file
> answers *how should the work be run?* rather than *what must be true?*
>
> **It is written to be superseded.** What it settles moves into `METHOD.md`, into a skill, into
> `PILOT.md` and into `SOURCES.md`, and this file is then deleted rather than kept — the rule that a
> superseded document does not survive its replacement applies to this one too. Its name and its fate
> are both provisional. What was **decided** is recorded in `ROADMAP.md`'s slice 7.1 entry, which
> outlives it; what is here is how the thing works and what stands behind it.
>
> **It contains no plan.** The design finishes, then it is cut into slices, and one plan is written per
> slice when that slice is reached. A plan written now would be a Layer 3 document inside a durable one,
> and it would be planning against a design that has not stopped moving.

---

## 1. What the elephant is

### The definition

**The elephant is one phase with two halves: the conversation that settles a design, and the writing of
the document that records it.** It opens when somebody says what they want. It closes when a durable
document exists, has been reviewed section by section, and its author says it is finished. Everything
else this method describes — cutting into slices, planning, building, checking — runs downstream of a
document the elephant produced.

**The two halves are one phase because they share one failure and one net.** The failure is a question
nobody asked. One instrument looks for it in the conversation before a word is written, and another
looks for it in the sections that got written instead — two nets, either side of a boundary, aimed at
the same defect. Put a phase boundary between them and the defect belongs to neither.

**It is bounded by what remains unknown, never by the size of the change.** A one-paragraph change to
what a document promises can be finished after a question or two. This is the ceremony rule arriving
from the other side: `METHOD.md` sizes what a change owes by what it produces, and the elephant sizes
itself by what is still not settled.

> **The floor is one exchange, not zero.** A mandatory phase that can end before it starts is a phase
> nobody has to enter. Stopping is a claim the agent makes and the author rules on — *here is what I
> believe is still unknown, and here is why I judge it immaterial* — so even the smallest elephant asks
> once, proposes to stop, and is told.

### What fires it

| The work | Elephant? | Because |
|---|---|---|
| a new durable document, in either family | **yes** | nothing exists to argue against yet, so nothing downstream can catch what was never considered |
| a change to what an existing durable document promises | **yes** | the promise is the thing every later check is written from |
| a defect triaged as a design bug | **yes** | the `bug` skill already routes that row here, by name, and this is where the name gets defined |
| a plan, a check, a map update, a slice list | **no** | each is downstream of a finished document, and each has its own instrument |

**It fires for the *about the work* family too, and this repository is the evidence.** `PILOT.md` is a
process document, written in slice 7 with no interrogation in front of it. Its artefact review returned
one finding: that it says nothing about the phase this document is defining. A whole process was missing
from a document about the process, and no check could have caught it, because nothing said the process
existed. **That is precisely the failure an interrogation exists to prevent, and it happened on a
family-two document.** Exempting the family would exempt the case that has actually cost something here.

The elephant cannot yet be run on the work that is defining it, because it does not exist. Until it
does, the author performs it by hand, and `ROADMAP.md`'s slice 7.1 entry is what that produced.

### The name, and what the repository already calls this

**The word is in use here as settled vocabulary and is defined nowhere.** Measured at `9723548`:

| Where | The words | Defined there? |
|---|---|---|
| `.claude/skills/bug/SKILL.md` | *"The elephant is where it returns."* | no |
| `.claude/skills/bug/SKILL.md` | *"a design conversation, not an edit"* | no |
| `METHOD.md` | *"it goes back to the design conversation"* | no |

**So the phase already has two names, one document uses both without saying they are the same thing,
and no file defines either.** A reader meeting *the elephant is where it returns* has been handed a
destination with no address.

**Its counterpart is defined, and only where an agent trips over it.** `goldfish` is explained inside
its own skill file; `METHOD.md` names that skill in five table rows and never says what a goldfish is.
The half of the pair that *reads* has a home. The half that *writes* has none at all. This document
closes the asymmetry from the other end.

**The name is kept.** The contrast the two words carry — one that forgets nothing, one that forgets
everything — is the method's central mechanism in two words, and it is already load-bearing in a skill
that ships. `SOURCES.md` records what was taken from the article the pair is named after; nothing here
claims more about that article than the entry does. What was considered instead, and why it lost, is in
§7.

### Imperative Two gets a home

`METHOD.md`'s second imperative already describes this phase exactly and never says which phase it is:

> **Two. Argue. Agreement is the defect.** A design nobody contested records only what the author already
> believed, and it passes every later check, because nothing downstream detects a decision no one
> questioned.

*Design*, *later check*, *nothing downstream* — every word of it is about the elephant, and a reader has
to infer that. **One clause fixes it**, inserted after the heading and before the existing sentence:

> It binds hardest inside the elephant, where nothing downstream will catch what goes unchallenged.

That is the whole of §1's change to already-reviewed text: an addition, disturbing no existing sentence.
Where the definition itself lands, and what else moves, is §5's business.

### The definition destined for `METHOD.md`

The words, as they are meant to arrive. Placement — after the two families, since it depends on the word
*family* — is §5's to settle.

> ### The elephant
>
> **Before any durable document exists there is a phase, and it has a name.** The elephant is the
> conversation that settles what is wanted plus the writing of the document that records it — one phase,
> because a question nobody asked stays invisible until somebody tries to write the answer down.
>
> It is required whenever a durable document is created, or what an existing one promises changes, in
> either family. Its length is set by what is still unknown and not by how large the change looks, and
> it never runs to zero questions: stopping is proposed, argued and granted. It ends when the author
> says it has ended.
>
> Its counterpart is the goldfish, which is handed the result and none of the conversation. Both are
> named for what they remember.

### What the elephant is not

- **Not a plan, and it produces none.** Nothing lands under `plans/` while it runs. Slicing waits for a
  finished document and planning waits for a slice.
- **Not the reviews.** Reviews fire inside it and none of them is it — they are goldfish, and the rule
  that no finding is applied without the author saying so governs every one.
- **Not a second document.** It leaves exactly one behind. Its working artefacts are covered in §3 and
  they do not survive it.
- **Not a phase for new documents only.** A change to an existing one enters it too, at whatever length
  its stopping rule allows.
- **Not a licence to write more.** Its output is one document sized to the change, and the phase ending
  early because nothing was unknown is a correct outcome, not a skipped step.

**One claim in this section is not yet sourced**, and §6 is where that is dealt with rather than hidden:
that the *authoring* half belongs inside the same phase, written section by section, is held up by
argument alone today, and it is a departure from the implementation this method is named after.
