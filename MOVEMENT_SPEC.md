# Adding a movement — the model, the intake questions, and the conformance checklist

**Read this before writing a line of a new movement.** It is written for whoever (person or agent) is
adding one. Its job is threefold:

1. state the model a movement has to fit, in the vocabulary the engine actually uses;
2. give the **questions to ask Sam first** — derived from the model's real degrees of freedom, so the
   spec that comes back is complete rather than discovered halfway through implementation;
3. make a **deviation legible**. If a new movement genuinely does not fit, that is a real new
   requirement and we should extend the model deliberately. The failure mode this document exists to
   prevent is a misunderstanding quietly becoming a bespoke code path — which is exactly how the app
   ended up with four rival collision-avoidance schemes before v109–v113 folded them into one.

Companion docs: **PATHING.md** (how travel is shaped), **ENGINE_MODEL.md** (why the model is this
shape, with the measurements), **CALLING.md** (how movements compose into calls), **test/README.md**.

---



## Pass sides are asked for, never guessed

> "How did you come up with the passing directions? Did you just make them up? … whenever you're creating
> a movement, or updating a movement, if you come across a collision while doing path creation, you should
> ask the user what the passing direction should be, rather than guessing. This will save a lot of
> time." — Sam

`PASSES_RUEDA` is a **default for pairs nobody has thought about yet**, not an answer. It will supply a
side for any encounter, and the figure will run. A wrong side does not fail: it makes the intended paths
cross, and the evasion solver then spends whatever it takes to pull them apart.

**What that costs, measured.** A Dame Grande from the Línea Moderna Dile Que No position shipped with a
follower walking **1210px where her straight line was 116px** — a 10.42x detour — because the inner ring's
leader passed his partner on the left where he should have passed on the right. Every existing check
passed it: grid-exact landing, correct pairing, and a clearance of 33.84px against a 34px floor, which
reads as a rounding error rather than a figure tearing itself apart. The engine had recorded eight
side-faults on it. Nobody was looking, and it was found by watching the animation.

**So:**

1. **Ask before building.** Any figure with an encounter — which is nearly every `travel` — gets the
   question, in the user's vocabulary: *"the leader goes past his current partner; does he pass on her
   left or her right?"*
2. **Ask again per position and per formation, and do not bank the answer.** A side that is right from
   Casino need not be right from the Dile Que No position, where the couple stands *on* the spoke rather
   than either side of it. Sam, explicitly: *"These are not rules, they're heuristics meant to speed up
   the creation time of the specific moves we're working on. Do not save them for future moves, as if
   they end up being wrong, it will waste a lot of tokens and a lot of time."* A side you were given
   belongs to the figure you were given it for.
3. **A collision found mid-implementation is a question, not a puzzle.** Stop. Do not tune the solver,
   do not raise an amplitude, do not add an exception to a convention. It means a pass side has not been
   specified yet, and the person you are building for already knows the answer.
4. **Report both numbers, unprompted, for every figure at every couple count:** minimum clearance, and
   **path length against the straight line**. §44 warns on the second automatically — relative to the
   other figures, because there is no honest absolute threshold — but say it out loud as well.

The last one is the cheap one and it is the one that was skipped. Clearance alone said this figure was
fine. The ratio said it was not, and nobody computed it.


## A grande progression around a ring is shared, and flips the phase

> "All grande moves where a dancer changes a slot around the outer wheel MUST change the phase, in order
> for the outer wheel couples to have a chance to make it in a 4 couple Línea Moderna. The leader does not
> stay in the same slot, they must progress to one slot anti-clockwise, as if they were doing a Dame
> Grande from Exhibela in those 4 beats." — Sam

This is a rule about what fits, not a stylistic preference, and it is why the phase flip and the shared
travel are the same fact stated twice.

A Línea Moderna ring holds *m = N/2* couples, so at four couples a ring is **two**. A figure that sends
one dancer a whole couple round a ring of two sends her the near-antipodal chord — and when her opposite
number makes the same progression, the two of them are travelling the same chord in opposite senses.
There is no side to pass on, because there is no room either side; measured, the planner could not clear
them (12.2px against a 35px corridor).

Split the progression and the problem dissolves. Each dancer crosses **one odd half-spacing** — she
clockwise, he anti-clockwise — and they meet on the between-spoke. The pairing still advances one whole
couple. Both journeys are half as long, in opposite directions, from opposite ends. Measured: 41.45px
clear at four, six and eight couples alike, every path exactly 1.00× its straight line, no evasion
needed at any size.

The odd half-spacing is also *why* the phase flips: the two `dh` values are each odd, so the wheel lands
on the other config. Nothing declares the flip separately — it is the arithmetic, exactly as it is for a
Dame.

**So: a grande figure in which somebody changes slot around a ring is built as a shared progression.** If
it does not flip the phase, one dancer is doing all the travelling, and it will not fit on a ring of two.
Invariant §24 asserts the mechanism directly — neither role may do less than a third of the total
distance — because an outcome-only check (the right pairing, no collision) passes the version that
cannot path at four couples.

## 1. The model, in one page

### A movement is per-dancer intent, not per-dancer path

Every dancer in a movement is doing exactly one of two things.

**SCRIPTED** — dancing a figure in their own local frame (their couple's midpoint, their own spoke,
their mini-wheel centre). An orbit, a dip out along the Exhibela line and back, a ¾ circle, standing
still. Scripted figures are **collision-unaware by design**: they are choreography, not traffic.

**DYNAMIC** — travelling to another couple's slot. The endpoints are choreography; the *path between
them* is not authored, it is planned.

### The discriminator is exact: does the dancer's couple midpoint move?

Compare the midpoint of the dancer's **ending** couple with the midpoint of their **starting** couple.
Moved ⇒ dynamic. Unmoved ⇒ scripted. No tolerance: measured across every in-formation movement at 4, 6
and 8 couples, scripted is **0.00px** and the smallest real transition is **76.02px**.

Three things that look like the discriminator but are wrong, each with the case that kills it:

| Tempting rule | Why it fails |
|---|---|
| "by role — leaders travel, followers don't" | roles **invert**: Dame Pequeña's follower is scripted and her leader travels; Mujeres Arriba is the exact opposite |
| "did they change partner?" | Dame Pequeña's follower gains a new partner with **0px** of displacement |
| "did they end on a different spoke?" | in Línea Moderna several couple midpoints share one spoke |

**Scope:** the test holds *within a formation*. A formation change replaces the slot set, so everyone
re-slots and the whole ensemble is dynamic. (Enforced by invariants §25, which skips formation changes.)

**Known limit: it compares endpoints, so a full circuit reads as standing still.** A dancer who travels
all the way round and lands back in the slot he started in has an unmoved couple midpoint, and the rule
calls him scripted — i.e. an immutable obstacle who never yields and never needs to. Dame Dos Pequeña
(`CLEANUP_PLAN.md` §2) is exactly that dancer, and it is not a misreading of the figure: Sam specified
the leader crossing the mini-wheel twice and passing the other leader in the middle.

**The fix is to say how far the movement progresses, in couples.** A progression is `k` couples measured
on the wheel the figure is danced on — a Dame Dos is a two-couple progression whether it is danced on a
wheel of eight, where it moves the leader two places, or on a mini-wheel of two, where two couples is a
full circuit and lands him back with his own partner. `k ≠ 0` makes the dancer dynamic regardless of
where he ends up, so the discriminator no longer has to infer a journey from its endpoints. `k` is the
dance-level fact; the `dh` addresses are its arithmetic consequence, and the two must agree —
`k = (F.dh − L.dh) / 2`, which holds for all six travel definitions in the registry.

### Scripted dancers never yield — and never need to

A scripted dancer goes into the planner as an **immutable obstacle**: planned around, never deviated.
If two scripted figures collide, **the figure is wrong** — do not fix it by adding an evasion. (§25
asserts both halves: a scripted path is identical with and without evasion, and scripted dancers clear
each other unaided.)

### One movement, one name — across every formation it is danced in

A movement is *a figure plus where it lands*, and the **formation supplies the slots**. So the same
figure danced in Rueda, afuera and Línea Moderna is **one movement entry with one name**, whose `play`
may branch on the position it is called from — exactly as `sets` and `beats` already do. `dame` declares
`requires: ['casino', 'exhibela']` and dances a visibly different figure from each; afuera is one
definition read inside-out through `mirror`. A second entry for the same figure under a decorated name
is the first anti-pattern in the skill: *a second way to do something that already has a way.*

**Grande and Pequeña are slot markers, not figure variants** (Sam):

> "Grande and Pequeña are markers for which slot to progress to, so any movement where none of the
> dancers change slots shouldn't have a Grande or Pequeña version."

So a suffix earns its place only when **both** forms are callable from the same position and land the
dancers somewhere different — the Dame family, and Mujeres Arriba. A figure in which nobody changes
slot has nothing left to vary, and its Grande and Pequeña forms will be byte-identical; five pairs of
them were, undetected, until they were measured. `CLEANUP_PLAN.md` is the working-through.

### `planCrossings` is the only thing in the app that avoids collisions

Nothing routes around it. A movement supplies **intent and geometry**; the planner supplies avoidance.
Its contract:

```
planCrossings({
  ids,                  every dancer in play
  base(id, t),          the dancer's INTENDED path, t∈[0,1] → {x,y}. Scripted dancers included.
  apply(id, t, off),    the same path with a signed offset applied along its pass side.
                        The caller owns the geometry — the planner never touches coordinates.
  pairs,                candidate [a,b] pairs that MAY cross. The planner keeps only the ones that do.
  unit(id),             which FREE VARIABLE this dancer belongs to (default: itself)
  yields(id),           may this dancer be deviated? false ⇒ scripted
  group(id), groups,    the two effort-sharing groups being balanced
  clearance, engage,    corridor to hold; how near two paths must come to count as an engagement
}) -> { at(id, t), share, scale }
```

### Units: collisions are per dancer, free variables are per unit

`unit(id)` is the piece that most often gets missed. **Collisions are always dancer-vs-dancer**, but
the thing that *yields* is a unit:

- a solo traveller is its own unit (the default, and what every ring figure uses);
- a **bonded couple** — partners connected in Casino, travelling together — is **one unit**: both
  dancers share a single offset, so the couple sidesteps as a rigid body instead of being stretched or
  sheared, and partners inside a unit are never a crossing pair to resolve.

A unit needs a wider corridor than a dancer: two couples passing must separate by a **couple width plus
the clearance**, not a dancer width plus the clearance.

### The offset direction

The general rule is **each path's own left normal** — mutual-left separates a head-on crossing and a
perpendicular one alike. The radial offset the ring figures use (leader inward, follower outward) is
that same rule specialised to a circle. `dameLinea` uses the general form because its two halves cross
at right angles.

### Groups

`groups` names the two sides whose effort is balanced, so that neither ends up more frantic than the
other (bisected on the path-naturalness cost). It is **whatever two sets can actually meet** in this
figure — not necessarily role. In use today:

| Movement | groups | unit |
|---|---|---|
| Dame / Dame Dos / Grandes | `L` / `F` | per dancer |
| Dame Pequeña | `L` / `F` (follower scripted) | per dancer |
| Mujeres Arriba | `F` / `L` (leaders scripted) | per dancer |
| Dile Que No y Dame | `L` / `F` (follower scripted) | per dancer |
| Dame Línea | `arc` / `walk` | per dancer |
| Línea entries + exits | `in` / `out` | **per couple** |

### What a traveller's intended path looks like

A **base polar arc**: the angle sweeps start→end and the radius interpolates start→end, so it follows
the ring and never cuts across the wheel. On a clear move a dancer stays exactly on it. Do **not**
hand-build a lane, a bow, or a dip into an intended path — that is the planner's job, and every time it
was done by hand it went wrong (see ENGINE_MODEL §5 phases 2 and 3; the straight-line-plus-bow in
`dileQueNoYDame` was walking leaders within 25px of the wheel centre).

---

## 2. Intake questions — ask these before writing code

Each maps to a slot in the model above. If an answer is "it depends", that is usually a sign the
movement is two movements, or that a real new requirement is hiding (see §4).

**The figure itself**

1. What position does it start from, and what position does it end in? Is the end position one we
   already have, or a new one? (New position ⇒ it needs slots, facings, and a `POSITIONS` entry.)
2. How many beats, and what happens on each one?
3. Does it change the **phase** (the spoke config)? If yes, the new midpoint spokes must bisect the old
   ones exactly — that is enforced by invariants §22, not a stylistic choice.
4. Does it change **formation**?

**Per dancer — this is the part that determines the implementation**

5. For each dancer: **does their couple's midpoint move?** Ask it that way, not "do they travel". Get
   the answer for every group of dancers, not just the obvious ones.
6. For each **scripted** dancer: describe the figure in their **own frame** — "orbit your couple's
   midpoint 180° clockwise", "dip out along your Exhibela line and back", "stand still". If the
   description needs to mention another dancer's position, it is not scripted; go back to Q5.
7. For each **dynamic** dancer: what slot do they land in, expressed relative to where they started
   ("one couple anti-clockwise", "the inner ring of the spoke one clockwise")? And **which side do they
   pass on** — left or right of each dancer they go by?
8. Do any dancers travel **as a couple** (holding hands / holding their spacing)? If yes they are one
   **unit** and need the couple-width corridor. If no, each is its own unit.

**Composition**

9. Which positions may this be called from? Does the same call mean something different from each?
10. Does it need a couple-count constraint (even only, ≥6, …)? Several do — say why, in geometry.
11. What is the resting state afterwards, and does the default trailing Dile Que No apply?
12. Does it exist in Línea Moderna too? Those compose through `runOnWheel` on sub-wheels and usually
    fall out for free — but the *naming* is decided by the rule below, not by whether it works.

**Ask about anything that would need a new invariant.** If the movement asserts a rule the suite cannot
currently see — the way "nobody walks through the middle of the wheel" was invisible until §26 — that
rule needs writing down and testing, because a collision check will not catch it.

---

## 3. Conformance checklist

A new movement is not done until all of these hold. Each is already enforced; the section number is
where it lives in `test/invariants.js`.

| # | Must hold | Where |
|---|---|---|
| §1–2 | No two dancers closer than the collision floor, at any frame; no NaN; one leader and one follower per station at the end | all movements × all positions × 4/6/8 couples × both phases |
| §3–4 | After the call, everyone is grid-exact on their slot and partners face each other | live-call runs |
| §7 | `segBeats` sum to the declared beat count | |
| §9 | No overtaking — synchronised leaders keep their cyclic order and equal angular progress | progressing figures |
| §18e | Evasion is calm (`NAT_MAX`) and opens as a smooth swell, not a lane-hop — **shape-normalised**, so a solo yielder taking a whole corridor is not penalised for the amplitude clearance forces | all movements |
| §22 | Orientation is **inherited, never reset**: the resting spoke grid either holds exactly or rotates by exactly half a spacing when the phase flips — from whatever orientation the wheel is already on | all movements, both formations |
| §25 | Scripted dancers never yield, and never need to (they clear each other unaided) | all in-formation movements |
| §26 | Nobody cuts the wheel — the deepest anyone goes is 1.5 passing corridors inside the ring | all in-formation movements |
| §27 | The planner's rigid-unit contract, driven directly on forced crossings | unit test |
| golden | Everything else is byte-identical unless you *intended* to change it | `test/golden.js` |

Then: `node test/run.js` (golden + invariants) and `node test/visual.js` (render path). Re-baseline the
golden **only** when the change was deliberate, and say in the commit which cases moved and why.

**Mutation runs leave mutants behind if they crash or time out.** Check `git diff` before you commit
after one — a `newPartner` mutation once survived a timed-out run, got captured as the "original" by the
next run, and was only caught because the golden failed on the way to committing.

**When you suspect the tests, mutate the code.** Break something deliberately and see whether the suite
notices — it is the only way to find a test that passes for the wrong reason. A round of this found four
rules with nothing behind them: `lane` authority (disabling `snapRestLanes` entirely passed everything),
the `REST_LANES` table (swapping its Dile Que No entry passed), the group predicates (`primeros`
returning true for everyone passed), and the cantante anchoring — where every test entered Línea from a
fresh rest, in which the cantante happens to stand on station 0, so anchoring the split at station 0
instead of at *him* was invisible. All four are now §31. When you add a test for a subtle rule, check it
fails against the bug it is meant to catch.

**Watch the invariant COUNT, not just the pass/fail.** A re-baseline is the suite's blind spot, and it
is widest exactly when you have legitimately approved a change to the same movement — the diff you meant
to accept hides the one you didn't. Treat an unexplained drop in the check count as a hard stop. This is
not hypothetical: migrating Mujeres Arriba silently dropped its explicit `segBeats`, which was
behaviourally identical (the player spreads beats uniformly over the same frames) and so would have been
absorbed by a re-baseline that had already been approved for an unrelated facing change. Nothing failed;
§7 simply stopped counting, and 2445 checks became 2444.

**On the golden and "perceived requirements".** A golden diff is a question, not a verdict. When one
appears, classify it: a genuine rule of rueda, dance or physics that you broke — fix the code; or an
artifact of a past implementation choice that hardened into a baseline — fix the test, and write down
the measurement that justifies it. §18e is the worked example: it looked like a smoothness rule and was
actually measuring amplitude, calibrated on an assumption (every evasion is split two ways) that Phase 2
existed to break.

---

## 4. When a movement doesn't fit — deviation protocol

These are the model's load-bearing assumptions. Each one *could* be wrong for a movement we haven't
built yet. If you hit one, **stop and confirm with Sam** — do not special-case around it, and do not
assume it is a misunderstanding either. Name the assumption, give the observable, and ask.

| Assumption | The observable that would mean a real new requirement | What it would cost |
|---|---|---|
| A dancer is scripted **or** dynamic for the whole movement | a dancer whose couple midpoint moves and then returns *within* one movement | intents would need to be per-phrase, not per-movement. **This has bitten twice.** Dile Que No y Dame was the first and was additive — `playPhrases`, DECLARATIVE §8. Dame Dos Pequeña is the second, and is answered instead by declaring `k` (§1 above), which is cheaper than per-phrase intents and fixes the row below at the same time |
| A slot address determines the whole journey | a dancer who travels a full circuit and lands where he began — `dh` reduced modulo the span cannot tell him from a dancer standing still | the progression count `k` carries what the reduction throws away (DECLARATIVE §2). Note the shape of the escape: the missing information was **not** a new kind of address, it was the movement's own meaning, which nobody had asked it to state |
| Scripted figures never need to yield | two scripted figures that genuinely cannot both be danced without touching | ENGINE_MODEL decision (2) — "the figure is wrong" — would need revisiting, and validation would have to become deformation |
| Exactly **two** effort-sharing groups | three sets of dancers that can all meet each other, with no sensible pairing | the naturalness bisection generalises to an n-way balance; not hard, but it is a real change |
| A unit is a dancer or a bonded **couple** | three or more dancers moving as one rigid body (a line, a bridge) | `unit` already supports it; the corridor sizing and the rigid reconstruction in `apply` would need generalising |
| Every traveller's intended path follows the ring | a figure that is *supposed* to cross the middle of the wheel | invariants §26 would need a per-movement exemption, declared and justified |
| One `clearance` for the whole movement | dancers who must pass closer than a dancer diameter (a genuine hand-hold or a lift) | `clearance` becomes per-pair; the planner already solves one amplitude against all pairs, so this is mostly plumbing |
| Everyone dances the same movement at once | different couples doing different things simultaneously | this is the roadmap's concurrency work — the `fixed`/`movers` split is designed for it, but the beat timeline is not built |

**The question to ask Sam, in each case, is the same shape:** *"This movement seems to need X, which the
engine currently assumes never happens because <reason>. Is X genuinely part of how this is danced, or
have I misread the figure?"* Getting a straight answer to that is worth more than any amount of
guessing, and a "yes, X is real" is a legitimate reason to extend the model — that is how the `unit`
concept and the couple-midpoint discriminator both arrived.

---

## 5. Mechanics

1. **Write a `play` descriptor, not a generator.** Every movement in the app is data (DECLARATIVE.md
   §11); there are no generators left and invariants §30 asserts it. Pick the kind that fits — `figure`,
   `travel`, `phrases`, `formation`, `compose`, `hold` — and add the figure or travel it names to
   `FIGURES` / `TRAVELS` if it is new. Those registries are **pure JSON**: if you find yourself writing a
   function inside one, stop and read §4.
2. Add a `MOVEMENTS` entry: `label`, `desc`, `requires`, `sets`, `play`, `beats`, optional `anim`.
3. Add a `CALLS` entry if it is callable (see CALLING.md — do **not** append the trailing Dile Que No;
   the default rule does that).
4. Measure before you look: clearances, jolt, turn angles, midpoint shifts. Every design decision in
   this codebase that was settled by measurement stuck; several that were settled by intuition — the
   path-length weighting for the Dame split, `RISE`, the solved bow — turned out to be wrong.
5. Update PATHING.md (the figure), CALLING.md (the call), CHANGELOG.md (what changed and what moved in
   the golden), and this file if the model itself grew.


### A declared side shapes the DEPARTURE, not just the pass

> "That makes sense that it shapes his departure. Please remember this, because most other progressive
> moves involving Dile Que No position will likely involve leaders leaving to the right, even when they
> eventually have to end up travelling to a slot that is clockwise of their starting slot, so this is
> going to become a common thing." — Sam

This is the case the planner cannot handle on its own, and it is about to be common.

From the Dile Que No position the partners stand **on the same spoke**, a step apart, rather than either
side of it. The traveller leaves *past* the one he is standing with — and his destination may be the
other way round the wheel from the side he must leave on. So the straight line from his start to his
landing runs **through where she is standing**.

Measured on a Dame Grande from there: the two close to **4.5px at t=0.10** — a tenth of the way in, while
he is still beside his fixed start. She is scripted and cannot yield, so the planner has to carry him a
whole corridor sideways at a moment when he has barely moved. A via is a smooth bump peaking at one
instant; demanding the entire corridor that early distorts everything after it. The result was a
follower walking **10.42× her straight line** while the figure still failed to reach the declared side.

**So a declared side for a pair that starts adjacent is a statement about the ROUTE, and has to shape the
intended path.** Repairing it afterwards is too late: by then the straight line has already been drawn
through the other dancer, and every correction is fighting it.

Two attempts at building this are recorded in CHANGELOG v141 with their measurements — both improved the
detour and cost clearance. The lesson from them: the deviation has to be part of the path the figure
asks for, generated with it, not blended onto a straight line afterwards and then re-planned on top.

### Before building a figure, check whether it already exists

A movement is keyed by what a caller shouts. Its identity is its arithmetic — which slots, which lanes,
who is scripted, does the phase flip. Those are different things, and the registry only knows the first.

"Mujeres Arriba Grande" was specified, built, corrected across four versions and measured clean, and it
was the **Dame**: `L dh -1 / F dh +1`, character for character `TRAVELS.dame`, which had been there the
whole time. Two more duplicate pairs exist in the registry today and were found the same way.

So when you write a new travel, look at what you have just written and compare it against the existing
ones **as arithmetic, not as names**. §46 does this automatically and warns, but read the warning — it is
asking "have you just re-derived something?", and that question is cheap before the figure is built and
expensive afterwards.

Two figures may legitimately share slots and differ elsewhere (the sides they pass on, the script the
scripted role dances). That is a real answer to the question. "They have different names" is not.
