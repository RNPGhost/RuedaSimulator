# Pilot — driving this process as a person

> **Written for a person, and it tells no agent anything.** You are here because you want to contribute
> to this codebase, and almost all of the writing will be done by an agent while you decide. This file
> says what the deciding involves, how to notice when it is not happening, and what to say when it is
> not.
>
> **It carries no obligations of its own.** `METHOD.md` is the procedure; where that file and this one
> ever seem to differ, that file is right and this one has a defect. Nothing an agent does is governed
> by anything below.

---

## The loop, from where you sit

Eight steps. Four of them are yours, and no agent can take them for you.

| | What happens | Whose |
|---|---|---|
| 1 | You say what you want built | **yours** |
| 2 | Work too large for one sitting is cut into slices, and you approve the cut | **yours** |
| 3 | One slice becomes a dated file under `plans/`. Nothing is built | agent |
| 4 | That file goes to a reviewer holding it and nothing else | agent |
| 5 | Its findings reach you together with the plan, none of them acted on | agent |
| 6 | You go through them one at a time and say what becomes of each | **yours** |
| 7 | The plan is worked through one task at a time, with the checks after each | agent |
| 8 | You look at the thing that was built, rather than at a report of it | **yours** |

**Step 6 is the whole method compressed into one step.** Each finding gets exactly one of three
outcomes from you: it is right and the text changes; it is right and the text stays anyway, because you
had a reason and the reason gets written down; or it is wrong, and *that* reason gets written down too.
Most people never realise the third is on offer at all, and a rejection nobody recorded arrives again
next time looking like a fresh discovery.

**Nothing between steps 5 and 6 happens on its own.** No review re-runs itself, and no second reviewer
is dispatched while you have not yet spoken. If you want another pass you ask for one.

---

## What an agent actually knows when a session opens

A hook fires as every session begins and delivers a fixed payload: the rule that outranks the rest, plus
its eight imperatives — about 1,691 characters against a ceiling measured at 1,900. **That is the whole
of what arrives unbidden.**

Everything else in `METHOD.md` — the two families, the four layers, the ceremony a piece of work owes,
the four kinds of review, the three outcomes above, and the authoring rules — reaches an agent only if
it opens the file. The skills reach it only when one of them triggers, which is not guaranteed either.

**So when a session behaves oddly, ask first whether it has read anything.** It is one question and it
resolves a whole family of strange behaviour:

> *"Have you opened `METHOD.md`?"*

An agent that can name the layers, or say what a piece of work owes, has opened it. One that keeps
citing the imperatives and nothing besides almost certainly has not, and will go on sounding correct
while missing every rule that was not in the payload.

---

## What should have fired

Seven skills carry the process. Each one triggers on its own description, and roughly one task in three
where a fitting skill exists does not get it — so noticing a miss is genuinely part of your job.

| When you are | This should run | You can tell it did not, because |
|---|---|---|
| looking at design work too big to finish at once | `slice` | you are handed one plan covering the lot |
| starting on one piece of that | `plan` | building begins with no dated file under `plans/` |
| holding a finished plan | `goldfish` | the first thing you are shown is a diff |
| holding design text that has stopped moving | `goldfish` | the next section turns up instead of a review |
| told something is broken | `bug` | somebody is already editing code |
| adding or altering a check | `checks` | a new check appears that nobody watched fail |
| running out of room, or offered compaction | `handoff` | the session simply carries on |

`goldfish` appears three times because one skill runs every kind of review, and which questions get
asked is chosen inside it. `execute` is the seventh, and it runs step 7 above.

**A skill that never triggers and a skill that was never written look exactly alike from inside a
session**, which is why this table is worth having. A check holds every name in it against the skills
actually on disk, so the table cannot come to name something absent.

---

## What to say when it did not

Short lines work better than explanations. Each of these names a thing rather than describing it.

| The situation | What to say |
|---|---|
| it is guessing about behaviour, distance or timing | *"Measure it."* |
| it changed your text off the back of a review | *"Put that back, and give me the findings."* |
| it is treating a reviewer's claim as an instruction | *"That is for me to decide."* |
| it is doing more ceremony than the work deserves, or less | *"Which layer is this in?"* |
| it is reasoning from something it has not opened | *"Open `METHOD.md`."* |
| a stretch of work has ended and you cannot see its edges | *"What changed, and what did I not ask for?"* |
| it has been agreeing with you | the line below |

**You can pull it back, and you should.** One worth keeping to hand — adapted from Rensin, whose exact
wording this project was unable to verify:

> *Agreement from you is not help. You are worth most when you argue against my thinking and push me out
> to the edges of the problem.*

**It works both ways.** Something argued down every single time it objects stops objecting, so wanting a
critic means losing some of the arguments.

---

## What it will refuse, and why that is not a fault

A refusal here is usually the process working. These are the ones you will meet.

- **It will not act on a review finding you have not accepted** — not the small ones, and not the ones
  it is sure about. This is the rule that outranks every other, it arrives in every session, and a hook
  repeats it on every turn you take. It is not there because reviewers are unreliable. It is there so
  that the documents stay yours.
- **It will not commit, and it will not push, until asked.** The same hook says so every turn.
- **It will not get a commit past a failing check.** A second hook runs all eleven first and blocks the
  attempt, naming the one that went red. When they all pass it decides nothing and still asks you.
- **It will not put a number into a document before measuring it.** Being told it must go and measure
  first is not stalling.
- **It will not review its own work.** A review means a separate agent handed one document, one set of
  questions and no history of the conversation; the agent you are talking to has all three and cannot
  be that reader.
- **It will not quietly leave a superseded document in place, or revise a plan that has already been
  carried out.** Both are ways of ending up with two sets of instructions.

---

## Signs it has slipped

Slippage is gradual and does not announce itself. Four things to watch for.

- **A run of exchanges where nothing was contested.** Agreement is the defect, not the goal: a design
  nobody argued with records only what you already thought, and every later check will pass it.
- **Findings arriving after a section rather than alongside it.** By then you have already approved
  something, and the review has become a report.
- **Softened wording.** *"This might be slightly unclear"* is not a gentler way of saying *"there are two
  readings and here is the second"* — it is a less useful one.
- **The words *obviously* and *clearly*.** Reaching for either usually marks a gap that a review would
  have found, and the fix is to state the rule instead.

**Long sessions are where all four appear.** Instruction-following decays with session length, and the
decay is invisible from inside it — which is why the process would rather hand off and start again than
press on.

---

## Where to look next

- `METHOD.md` — the procedure itself. Read it once, whole; it is short on purpose.
- `AGENTS.md` — what this repository contains, what each piece owns, and the commands.
- `REVIEWS.md` — what has been reviewed so far, and which findings were turned down and on what grounds.
- `ROADMAP.md` — where the work is going, what is settled, and everything parked.
- `SOURCES.md` — what stands behind each rule, and where this process knowingly parts company with
  something it cites. Read when you want to argue with the method rather than follow it.
