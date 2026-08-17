---
name: rueda-movements
description: Add or change a movement, call, position, or formation in the Rueda de Casino simulator (github Rueda Simulator, index.html). Use when the user wants a new dance figure, a new call, a new resting position, a new formation, or wants an existing one changed. Carries the intake questions to ask first, the declarative data model to express it in, the conformance checklist, and the anti-patterns that have historically broken this codebase.
---

# Adding to the Rueda simulator

This codebase went through five engine rebuilds because features were added the obvious way instead of
the right way. The result is a model where **a movement is data**, and everything that could be solved
is solved. Your job when extending it is to keep it that way.

Read `MOVEMENT_SPEC.md` and `DECLARATIVE.md` in the repo before writing anything. This skill is the
working procedure around them.

---

## 1. Ask before you build

Never start from a one-line description. Every question below maps to a slot in the data model, and an
unanswered one becomes a guess that hardens into code. Ask them in the user's own vocabulary — they are
a dancer, not a maintainer.

**The figure**
1. What position does it start from and end in? Is the end position one that exists?
2. How many beats, and what happens on each?
3. Does it change formation?

**Per dancer — this determines the implementation**
4. **For each dancer: does their couple's midpoint move?** Ask it that way, *not* "do they travel".
   This one question decides scripted vs dynamic, and getting it wrong is the single most expensive
   mistake available. Ask about every group, not just the obvious ones.
5. For each **scripted** dancer: describe the figure **in their own frame** — "orbit your couple's
   midpoint", "dip out along your Exhibela line and back", "stand still". *If the description has to
   mention another dancer's position, it is not scripted.* Go back to Q4.
6. For each **dynamic** dancer: which slot do they land in, **relative to where they started** ("one
   couple anti-clockwise, on the Exhibela leader's side")? And **which side do they pass on** — left or
   right of the dancers they go by?
7. Do any travel **as a couple**, holding hands? Then they are one planner `unit` and need a corridor a
   couple-width wider.

**Composition**
8. Which positions can it be called from? Does it mean something different from each?
9. Any couple-count constraint — and *why*, in geometry?
10. Does it exist in Línea Moderna too (a grande and/or pequeña form)?

**Do not ask** what the paths look like, how wide anyone should swing, or where exactly anyone should
be at beat 3. Those are solved. Asking invites a pixel answer, and a pixel answer is a bug.

### PASS SIDES ARE ALWAYS ASKED. NEVER GUESSED, NEVER DEFAULTED.

> "Please don't just make up passing directions in future … otherwise you spend a long time dealing with
> collision mathematics which could be easily and quickly solved by asking me or the user." — Sam

This is the single highest-yield question in the list, and the easiest one to skip, because
`PASSES_RUEDA` will happily supply an answer and the figure will *run*. It will run badly. A wrong pass
side does not fail — it makes the intended paths cross, and the evasion solver then spends whatever it
takes to pull them apart. Measured on one figure that shipped this way: a follower walked **1210px where
her straight line was 116px**, a 10.42x detour, while every existing check passed it.

**The rule.** If a figure has any encounter between two dancers — and a `travel` almost always does —
ask which side each pass happens on before writing the descriptor. Ask in the user's vocabulary:

> "In this figure the leader goes past his current partner. Does he pass on her **left** or her
> **right**?" (left = you travel along their left-hand side = you go by each other's right shoulders)

**Ask again when the answer might not carry, and do not bank the answer.** A side that was right in one
formation is not automatically right in another. Sam, explicitly: *"These are not rules, they're
heuristics meant to speed up the creation time of the specific moves we're working on. Do not save them
for future moves, as if they end up being wrong, it will waste a lot of tokens and a lot of time."* So a
side you were given for one figure belongs to that figure. It is not a rule to generalise, quote back, or
apply to the next thing that looks similar. Ask again.

**If the collision is discovered mid-implementation, stop and ask.** Do not reach for the solver, do not
tune amplitudes, do not add an exception to a convention. A collision that appears while you are building
a path is the model telling you a pass side has not been specified yet. Thirty seconds of asking beats an
hour of collision mathematics, and the answer is one the user already knows.

### NEVER DEFINE A PROGRESSIVE MOVEMENT IN TERMS OF ANOTHER PROGRESSIVE MOVEMENT

> "I should not have been able to define progressive movements using an existing progressive movement …
> I should not be able to concretely define a movement as if it were static when the movement I've
> referenced has been calculated using the via path engine for avoiding collisions." — Sam

A **static** figure is a fixed shape: nobody leaves their couple's slot, nothing about it depends on who
else is dancing, and it means the same thing wherever it is used. A **progressive** movement is not a
shape at all — it is a pair of slot addresses plus *a path the engine solved against the traffic that
particular figure had*. The arc is an answer to a question about other dancers.

So when a new figure needs a dancer to "do what she does in X":

* **X is static** (an Enchufla, a Vacilala, a ¾ circle) — reference it. It carries no assumptions.
* **X is progressive** (any Dame) — reference its **slots**, never its path. State where that dancer
  starts and where she lands, and let the path be re-planned here, against the traffic *this* figure
  actually has. Then ask for the pass sides of whatever collides.

**This is not a style preference; it imports a wrong answer.** Dame Ene was specified as "three of the
four dancers do exactly what they would do in a Dame Pequeña". Written as `about: 'ownWheel', turn: 180`
— the Dame Pequeña's *path* — the inner leaders inherited the wide arc round the mini-wheel centre that
a Dame Pequeña needs **because the other leader is coming the other way**. In Dame Ene he is not: he has
left for another wheel entirely, and the arc is avoiding a dancer who is not there. Sam: *"the slot
changes are the same, but the pathing should be recalculated based on different movements of other
dancers."* Restating it as the slots alone — `{ dh: 0, ring: 'outer', lane: 'cw' }`, straight line — took
the figure from **2.31x its straight line with an unresolvable collision to 1.00x intent / 1.11x planned,
everyone clear, at 4, 6 and 8 couples**.

The tell is in the user's own words: "they do a Dame Pequeña" describes the *result* — who ends up where.
It is your job to hear that as an address, not as a trajectory.

**Report the numbers, always.** Two measurements, for every figure, at every couple count, unprompted:
minimum clearance *and* **path length against the straight line between the endpoints**. Invariants §44
warns on the second automatically, but say it out loud too — a figure whose ratio stands out against the
others is a figure whose pass sides are probably wrong.

---

## 2. Express it as data

Every movement is a `play` descriptor. **There are no generators — invariants §30 asserts it.** Six
kinds; pick the one that fits:

| kind | when |
|---|---|
| `figure` | everyone stays in their own couple; a named scripted figure |
| `travel` | someone crosses to another couple's slot |
| `phrases` | a sequence — e.g. a scripted opening, then a travel |
| `formation` | the slot set itself changes |
| `compose` | the same figure danced by Línea's sub-wheels |
| `hold` | a 0-beat relabel; nobody moves |

A **travel** states where each role lands and which side it passes on:

```js
dame: { groups: ['L','F'], L: { dh: -1, lane: 'cw', pass: 'in' },
                           F: { dh:  1, lane: 'ccw', pass: 'out' } }
```

`dh` is in **half-couple spacings**, positive = clockwise. Use half-spacings — a Dame moves its leader
an odd number of them, which is *why* it flips the phase. **Never declare a phase flip**: it falls out
of `dh` being odd.

#### A progression is a JOURNEY AROUND A MIDPOINT, not a destination

> "I should also be able to define if the progression goes a certain direction around a particular rueda
> midpoint. This will prevent moves like Dame Dos in a 2 couple wheel from devolving into the dancer just
> staying still because they have already reached their destination slot, forcing them to navigate around
> the midpoint in the correct direction." — Sam

Endpoints are not enough, and two figures can share them and be different dances. A clause therefore
says three things, and you should be able to name all three before writing it:

| | says | example |
|---|---|---|
| `dh`, `ring`, `lane` | **where** they land | `{ dh: -4, ring: 'outer', lane: 'cw' }` |
| `about` | **around what** the journey goes | `'formation'` (default) · `'ownWheel'` · `'targetWheel'` |
| `turn` | **how far round, and which way**, in degrees about that point | `turn: -180` |

**Never reduce `dh` modulo the wheel.** `dame_dos_pequena` is `dh: -4` on a *two-couple* mini-wheel: two
couples is the whole wheel, so the leader crosses twice, passes the other leader both times and lands
back with his own partner. Reduced to `dh: 0` it has the same endpoints and is the figure where he
stands still. The unreduced value is what `directedSweep` uses as the winding the path must satisfy —
that is the mechanism, and shortening the number silently deletes the dance.

**Use `about` when the midpoint is not the wheel the figure is danced on.** A Línea figure whose dancers
turn about their own mini-wheel while another crosses the formation needs both midpoints at once, and
`about` is the only way to say so.

**Declare `turn` for anything diametric.** A half-turn sits exactly on the tie in `directedSweep` — both
directions are equally near a silent declaration — and on the `|sw| >= 180°` threshold that chooses
between a straight chord and an in-round-out loop. The tie is broken deterministically toward the
declaration's sign, so `turn: -180` means clockwise and stays clockwise; say nothing and you get the
engine's default rather than your figure's intent. **§50 fails on any shipped figure that relies on the
tiebreak.** This is not hypothetical — it is how three leaders in one Línea figure wound one way and the
fourth wound the other, from arithmetic that is symmetric on paper.

A **figure** is a chain of beat-level segments in the dancer's own frame — `{to, beats, steps, ease,
face, turn, bow, round, orbit}`. Nothing a segment names may mention another couple; that is what makes
scripted figures collision-unaware by construction.

#### A scripted figure's own frame does NOT scale with the wheel — say so if it should

Everything local is a constant in pixels: `R_MID`, `R_STEP` and the lane offset never change with the
couple count, because `DELTA_DEG` shrinks exactly as the radius grows to hold the arc-length spacing. A
figure built only from local points is therefore *the same figure on every wheel* — which is usually
right, and is wrong the moment the figure has to share room with travellers.

> "The Dile Que No movement of the followers on the inner wheel (the 3/4 circle path) has the same
> radius no matter how big their grande wheel is. This is causing the inner couple followers to travel a
> long way into the centre in order to get back to their slot, which is taking up room that the leaders
> should be using … followers on a smaller grande wheel will not do a full 3/4 of a circle, they'll do
> less, like 1/2 a circle." — Sam

So a scripted figure may scale against the radius of the dancer's **grande wheel** — the rueda she would
change places around on a Dame Grande, which is the whole rueda on a circle, her *ring* in Línea
Moderna, and *not* the mini-wheel she is standing in (that one is 57.4px whatever the formation does,
which is exactly why the ambient `R_RING` cannot be asked). `miniWheelView` states it per dancer as
`grandeR`; everywhere else `R_RING` already is it.

`three_quarter_circle` is the worked example: two named thresholds (`DILE_ARC`), the full arc at or above
the big one, the tightest arc that still joins her two endpoints — the half circle on their chord — at or
below the small one, and a linear interpolation of the **radius** between. When you write one of these:

* **Scale the bulge, never the endpoints.** Where she starts and where she lands are choreography. A
  check on the sweep alone cannot tell a shorter arc from a shorter journey — assert the chord too.
* **Keep the rotational sense fixed.** It is a property of the figure, not of how far she swings.
* **Write the thresholds as plain numbers, and assert what they mean.** They exist to be turned. §53
  asserts `DILE_ARC` is still the two 4-couple Línea rings Sam named it by, so re-tuning the wheel
  geometry cannot move the rule out from under the figure in silence.

Both registries (`FIGURES`, `TRAVELS`) and every `play` descriptor are **pure JSON**. If you are writing
a function inside one, you have taken a wrong turn — see §4.

---

## 3. Prove it

```
node test/run.js       # golden + invariants — must be green
node test/visual.js    # render path
```

- A **golden diff is a question, not a verdict.** Classify each: a real rule you broke (fix the code), or
  a past implementation choice that hardened into a baseline (fix the test, and record the measurement
  that justifies it).
- **Watch the invariant COUNT, not just pass/fail.** A re-baseline is the suite's blind spot, and it is
  widest exactly when a change to the same movement has already been approved. An unexplained drop is a
  hard stop.
- **When you suspect the tests, mutate the code.** Break something deliberately and check the suite
  notices. This has found four rules with nothing behind them and two real bugs. Verify your mutation
  actually changes behaviour — a no-op proves nothing — and check `git diff` afterwards, because a
  crashed run leaves the mutant in the tree.
- **Measure before you look.** Clearances, jolt, turn angles, midpoint shifts. Every design decision here
  settled by measurement stuck; several settled by intuition were wrong.

---

## 4. The five ways people break this codebase

Each of these has actually happened. If you find yourself doing one, stop and raise it with the user
instead — a genuine new requirement is worth extending the model for, deliberately.

**1. A second way to do something that already has a way.**
The app once had four rival collision-avoidance schemes because each new figure grew its own. There is
now exactly one — `planCrossings` — and nothing routes around it. Before adding a mechanism, find the
existing one. Before adding a facing rule, check the vocabulary: `partner`, `partner0`, `partnerEnd`,
`centre`, `outward`, `perpSpoke`, `travel`, `hold`, and the `{from,to,after,dir,ease,freeze}` turn.

**2. Hand-specifying what the engine should solve.**
Never write a lane, a bow width, a dip depth, or a swerve into a path. State the *intent* — where they
land, which side they pass — and let the planner find the corridor. Every hand-shaped path in this
codebase's history was eventually found to be wrong: one was walking leaders within 25px of the wheel
centre. If a value depends on the geometry (how far apart the partners stand), it is a **solver**
(`{solve: 'justMiss'}`), not a constant.

**3. A magic number that is really a rule.**
`R_STEP`, `R_MID()`, `CLEAR_TGT` are derived from the dancer and the wheel so everything scales with the
couple count. A literal pixel value in a figure is a *shape* parameter (how big a dip looks) and is
fine; a literal pixel value that anything depends on for safety or for landing on the grid is a bug
waiting for a different couple count.

**4. Counting in couples instead of half-spacings, or in frames instead of fractions.**
Both lose information. Half-spacings make the phase flip arithmetic. Fractions of a movement survive a
change of frame count — a facing rule written as "start turning at frame 18 of 24" is an artifact of how
someone wrote it, not a dance decision.

**5. Anchoring on an index instead of a structure.**
Say `primeros`, `segundos`, `leaders`, `inner`, `outer` — never "couples 1, 3 and 5". Structural
predicates survive a change of couple count; index lists do not. The cantante is the anchor, and a bug
here hid for a long time because every test happened to run with him on station 0.

---

## 5. Beyond movements

- **A new call** — `CALLS` entry with `from` and `seq`. Do **not** append the trailing Dile Que No; the
  default rule adds it. See `CALLING.md`.
- **A new position** — needs a `POSITIONS` entry (`variant`, `inverted`, `virtual`, `name`), slots in the
  formation, resting lanes in `REST_LANES`, and facings. Build it on the **couple-midpoint radius**, not
  the ring, so a couple gathering onto its own spoke keeps its midpoint.
- **A new formation** — owns its slot geometry, its wheel sizing, and its guide. A formation change
  replaces the slot set, so the scripted/dynamic test does not apply across one: everyone re-slots.
- **A new invariant** — if the movement asserts a rule the suite cannot currently see, write the test.
  "Nobody walks through the middle of the wheel" was invisible to every collision check, because the
  centre of a rueda is empty.


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
