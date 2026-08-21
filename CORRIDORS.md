# Corridors — the path engine and the movement language

> **Design document, written before implementation.**
>
> This document is **self-contained by intent**. Every rule, constant, threshold and acceptance test
> needed to build the system described here is stated *in this document*. An implementer with no other
> context should be able to work from it alone. Where it names a file, function or constant in the
> existing codebase, that is to locate work or to identify what is being replaced — never to supply a
> definition the reader is expected to go and look up.
>
> **Constants are named, and every rule is stated in terms of the names.** Where a threshold depends on a
> quantity that could change — a dancer's width, a corridor's width, the anti-collision margin — the rule
> is written as a formula in those names, and today's value is given only as an illustration. A rule
> written as a bare number stops being true the day the number changes, and does so silently.
>
> Companion document: **`SCHEDULING.md`**, covering when a call may be issued and what may run alongside
> what. That work depends on this one and is implemented after it.

---

## 1. Purpose, intent and value

### 1.1 What this document is for

The Rueda Simulator computes where every dancer walks during a figure. It currently computes those paths
in a way that produces visible, unwanted wandering; that ignores instructions the author gave it; and
that nobody can author against with confidence. Two previous attempts to fix it failed in the same way,
for a reason neither attempt identified.

This document specifies the replacement: **a movement's path shape is authored, and collision avoidance
is a small correction applied on top of it** — rather than, as today, collision avoidance being the only
thing that determines shape.

### 1.2 What the system is

*Orientation for a reader with no prior context. Precise definitions follow in §3.*

**Rueda de Casino** is a Cuban partner dance. Couples stand in a wheel. A **caller** shouts a **call**;
every couple performs the same figure simultaneously, and partners are exchanged progressively around the
wheel as the dance proceeds. The simulator draws this from above and animates it.

The application is a single self-contained HTML file (`index.html`) — no build step, no dependencies, no
network access. It contains the dance model, the geometry, the path engine and the renderer.

Vocabulary used from here on:

| Term | Meaning |
|---|---|
| **dancer** | One person. Drawn as a disc of radius `DOT_R = 16` engine units, with a facing arrow reaching 30 units from their centre. |
| **couple** | One leader and one follower. |
| **slot** | A station in the formation — a position around the wheel that one couple occupies. |
| **slot-position** | How the two dancers of a couple stand within their slot (Casino, Exhibela, Dile Que No, and inverted "afuera" forms). |
| **formation** | The floor plan: a single wheel (*Rueda*), or two concentric rings (*Línea Moderna*). |
| **movement** | A physical figure. Produces motion for some or all dancers over a fixed number of beats. |
| **call** | A word the caller shouts. Expands to a sequence of movements. |
| **progression** | A movement in which dancers travel to different slots. This document is about progressions. |
| **scripted figure** | A movement whose motion is prescribed choreography (Enchufla, Adios, Dile Que No). Out of scope — see §13. |

All geometry is in **engine units**, never screen pixels. The engine never reads a screen dimension; the
renderer scales engine units to the display. A dancer's disc is `w` units across, which the codebase
documents as roughly 46cm — about one shoulder width — making one engine unit approximately 1.44cm at
today's values.

The named quantities used throughout. **Every threshold in this document is written in terms of these
names**, never in terms of the values in the right-hand column:

| Symbol | Meaning | Value today |
|---|---|---|
| `w` | a dancer's width — their diameter, twice `DOT_R` | 32 engine units |
| `Δ` | the anti-collision margin held between two dancers over and above their bodies | 1.5 engine units |
| `W` | a corridor's width. For a solo dancer `W = w`; for a couple travelling as one object it is wider — see §3 | 32 engine units (solo) |
| `a` | the arrow reach: how far a dancer's facing arrow extends from their centre | 30 engine units |
| `Δ_len` | the tolerance within which two corridor lengths count as equal, so priority between mirror-image dancers cannot flip on floating-point noise (§4.5) | 0.1 engine units |
| `Δ_side` | the dead band within which two dancers' approach is too near head-on for a passing side to be derived from the geometry, so the author is asked instead (§4.5) | 0.1 engine units |

Where a figure elsewhere in this document is quoted as a plain number — the accelerations in §1.4, the
timings in §2 — it is a *measurement taken at today's values*, not a rule. Rules are formulas.

### 1.3 The problem: nothing has an opinion about a path's shape except collisions

Today a traveller's path is generated as a straight-line or simple-arc **intent**, which is then deformed
until nobody collides. Nothing else contributes to its shape. The consequences are structural, not tuning
errors:

- **A path only has the shape that avoidance left behind.** If a dancer is pushed aside and the pusher
  then leaves, either nothing pulls the path back, or something does and the correction is itself visible
  movement. Either way the shape is an artefact of the solver rather than a statement of intent.
- **A declared passing side is a force among forces.** When the author says "pass on the right", that
  instruction competes with separation pressure from other dancers, and a larger pressure wins. The
  declaration is therefore a preference, not an instruction, and it is routinely disobeyed.
- **The author cannot say what they want.** The only vocabulary available is "which side do you pass this
  dancer on". A dancer does not think that way. They think about *where they are walking* — round the
  outside of the inner couple, between these two slots, past the middle of the wheel on the right — and
  about which other dancers might cross that route while they are on it.

Two implementations have failed here, and both failed the same way. The first pinned paths through **via
points** placed wherever collisions were detected; a via was never re-examined once placed, so a path
kept honouring a collision that the final arrangement had made obsolete. The second replaced that with an
**elastic relaxation** — separation and tension forces iterated to a fixed point. It produced paths that
wandered when nothing required it, and it ignored declared passing sides. Both are described in full
in §2.

Neither ever represented *the path the author wanted*. There was nothing to return to, so there was
nothing to hold the shape steady.

### 1.4 What "natural" means, concretely

"Natural" and "better" are not acceptance criteria. These are:

1. **Straight when unimpeded.** A dancer with a clear route walks in a straight line, because it is
   efficient and because it is what dancers do.
2. **No deviation without a reason.** A dancer travelling roughly straight does not leave that line unless
   something requires it. Every departure must be attributable to a specific obstacle genuinely in the way
   *at the moment the dancer is there*.
3. **Avoidance is smooth and tight.** A dancer avoiding an obstacle does not turn sharply, and does not
   take a wide berth for no reason. They leave their route gradually, aiming for the point at which they
   will begin to pass the obstacle, go round it closely, and rejoin their route gradually.
4. **No erratic or high-acceleration movement.** Every turn must be one a person could physically walk.

Criteria 3 and 4 are in tension, and the tension is quantified. Passing an obstacle at exactly the minimum
permitted clearance is the tightest turn available. At the speed a Dame is currently danced — one
couple-spacing in two beats at 150bpm — that turn is **1.42 g to 1.60 g** depending on couple count. A
person walking briskly around a one-metre radius sustains about **0.20 g**. Hugging at minimum clearance
at that speed is not something a human body can do.

This is why this work also changes the Dame family to a uniform four beats (§7). Lateral acceleration
scales with the square of speed, so halving the speed quarters the severity of the turn:

| couples | Dame over 2 beats | Dame over 4 beats |
|---|---|---|
| 4 | 1.42 g | **0.36 g** |
| 6 | 1.55 g | **0.39 g** |
| 8 | 1.60 g | **0.40 g** |

At four beats close passing becomes physically plausible, and criteria 3 and 4 stop fighting.

*Accepted exception:* **Dame Dos** covers two couple-spacings in the same four beats, so it stays at
**0.71–1.36 g** if it hugs. This is deliberate — it is a fast, inherently chaotic figure — and the
consequence is that Dame Dos takes wider berths than the shortest route would give. Recorded here so it is
not later mistaken for a defect.

### 1.5 What we are changing

**The author declares the route. The engine resolves what is left.**

A movement definition states, for each group of dancers, where they start, where they finish, and which
side they pass **fixed features of the formation** on — the places where dancers stand, and the midpoints
of wheels. Those declarations hold for the whole movement and do not depend on what any other dancer does.
From them the engine computes a **corridor**: the shortest route satisfying the declarations, given a
width.

That corridor is a **pure function of the formation and the declarations**. It is the same every time,
independent of collisions, independent of what else is being danced. That single property is what neither
previous attempt had, and it is what makes paths stable, reviewable and explicable.

Collisions between *moving* dancers are then a second, smaller problem. Two corridors overlapping means a
collision is *possible*; whether it is *real* depends on whether both dancers are in the overlap at the
same time. Where it is real, one dancer has priority and holds their route while the other leaves their
corridor by the smallest margin that clears, gradually, and returns. A deviation that cannot be made
without breaking the author's declarations is a **failure the author is told about**, never a licence to
disobey them.

### 1.6 What success looks like

Measurable, and checked by the verification in §14.

| # | Criterion | Threshold |
|---|---|---|
| S1 | No two dancers are ever closer than the required clearance | centre to centre ≥ `w + 2Δ` (35 units today) |
| S2 | Every declared passing side is realised in the output | 100% — a violation is a failure, not a warning |
| S3 | Collision avoidance does not significantly distort the authored route | actual path length ÷ corridor length **< 1.5**, and expected near 1.0 |
| S4 | A deviating dancer never separates from their corridor by more than a dancer's width | `gap < w` — see below |
| S5 | Paths are deterministic | identical inputs produce identical output to the last decimal |
| S6 | Every movement is reviewed as a rendered diagram and signed off by a human | the corpus defined in §14 |
| S7 | The drawn path is the planned path | the renderer evaluates the engine's own curve, not an approximation of it |

**How S4 is measured.** Using `W` and `w` as defined in §1.2:

    definition
      d   = distance from the deviating dancer's centre to the nearest point on their corridor's centreline
      gap = d - W/2 - w/2

    restriction
      gap < w

The corridor is the authored route widened by `W/2` on each side, and the dancer's body reaches `w/2`
from their own centre, so `gap` is the clear space between the dancer and the near edge of their own
corridor. It is zero or negative while the dancer is still touching their corridor — until then they have
not separated from it at all. At today's values the restriction works out at `d < 64` units.

Measuring the centre against the centreline instead, and comparing that to a dancer's width, would have
been too strict by a factor of two.

The rule in plain terms, which is the form to check a diagram against: *it must never be possible to fit
another dancer between a deviating dancer and their corridor without touching one of them.*

S2 and S7 are listed explicitly because both have previously failed silently.

### 1.7 Why this is worth doing

**Immediately:** the paths are visibly wrong and cannot be corrected, because the only control the author
has is one the engine feels free to overrule.

**Structurally:** the goal for this project is that users define formations, movements and calls through a
user interface, without writing code. That is impossible while the only vocabulary for describing a path
is a list of pass-sides against individual dancers — such a description does not survive a change in the
number of couples, and does not match how a dancer thinks. Declaring a route against fixed features of the
formation does survive, because the features are named relatively: "the inner slot of the wheel I started
in", never "slot 3".

**For whoever reads the code next:** a corridor is an authored statement of intent that can be read,
diagrammed and argued with. A deformation produced by a solver is not.

---

## 2. How we got here

Two implementations preceded this one. Both are described here in enough detail to be understood without
reading them, because the reasons they failed are the reasons this design is shaped as it is — and
because a future reader who does not know what was already tried will try it again.

### 2.1 The engine as it stands

All collision avoidance in the application goes through one function, `planCrossings` in `index.html`
(currently 444 lines). Nothing routes around it. That is a property worth preserving: there is exactly
one place that knows how dancers avoid each other.

It works like this:

1. **Intents.** Each travelling dancer is given a *base path* — an arc that follows the ring from where
   they start to where they finish. This is the only statement of where they were going. It is not
   authored; it is generated from the slot arithmetic.
2. **Units.** The free variables are *units*, not dancers. A solo traveller is their own unit; a bonded
   couple is one unit whose two dancers share a single displacement, so the pair deviates as a rigid body
   instead of being pulled apart.
3. **Candidates.** The planner decides for itself which pairs of dancers to compare for collisions — the
   *candidate set*. It is every pair except partners inside one rigid unit, whose spacing the figure fixes
   anyway. A caller never supplies this list; §2.5 explains what happened the last time one did.
4. **Sampling.** Paths are compared at 40 samples across the movement. Detection is *time-synchronised* —
   the two dancers are compared at the same instant `t`, never as static curves.
5. **Sides.** Where a pair must separate, the direction is resolved by asking the movement: first by
   relation (`partner0`, `vacating`, and similar), then by role, then a default.
6. **Resolution.** Where a pair comes closer than the clearance, a **via point** is placed.

### 2.2 The first attempt: via points

A via is a *displacement* attached to a unit at a particular time. A dancer's drawn position is their base
path plus the sum of their vias, each weighted by a smooth curve that is full at the via's own moment and
falls to zero at the neighbouring vias and at both ends of the movement — so landings stay exact.

The idea is sound and worth keeping in mind: at the moment two dancers would collide, they are placed a
half-corridor either side of the point they would have hit. Positions, not offsets — because two dancers
each stepping aside along their *own* path normal only separate by the sum of their steps when their paths
are anti-parallel. At any other crossing angle the two steps partly cancel and the corridor never opens.
Placing both dancers a fixed distance either side of a **shared** point separates them by that distance
doubled at any angle.

The solver iterates up to 60 times. Each pass recomputes the closest approach of every candidate pair,
collects those still short of the clearance, sorts them **innermost first** — a collision near the middle
pushes its dancers outward, which is what forces the couples further out to move — and places a via for
each. A pair still short after placement has its radius grown by a factor of 1.12 per pass, capped at 6×,
after which it is reported as unplaceable rather than thrashed.

**Why it fails.** Every failure traces to one property: **a via is state, and it is never re-examined.**

- Once placed, a via persists for the rest of the solve. Nothing ever asks whether it is still needed. If
  the collision that caused it evaporates because everyone else moved, the displacement remains, and the
  dancer detours around an obstacle that is no longer there.
- A via is pinned at the *time* the conflict was detected. When paths bend, the moment of closest approach
  moves — so the via goes on displacing the dancer at an instant when the other dancer has already
  cleared. The growth ladder is a symptom of this: it exists because the placement stops answering the
  path once the path changes.
- Two conflicts within 0.06 of the movement's duration **overwrite each other's answers**, because vias
  that close together are merged. Whichever was written last survives.
- Cost. Every placement triggers a recomputation of every pair over all 40 samples. Measured on the
  current engine at 8 couples: a plain circle Dame plans in **4ms**, but a cross-wheel progression takes
  **42ms**, Dame Pequeña 40ms and Dame Grande 26ms. The whole test suite pays this thousands of times.

### 2.3 The second attempt: an elastic in space-time

A second implementation replaced the via machinery with a relaxation. Each yielding unit carried a
deviation field sampled at a dozen coarse nodes with the endpoints pinned, and the solve became: repeat
until settled — push apart every pair that is too close, derived **fresh from the current paths on every
pass**; apply tension so that paths pull taut; let the deviation decay wherever no encounter is nearby.
A seeding round placed one decisive displacement per predicted conflict first, to fix which way round
each pair would go before the relaxation began.

This was a genuine improvement in one respect, and it is worth stating precisely what it got right: **a
constraint that is re-derived every pass drops out automatically the moment it stops binding.** There is
no state to go stale. That property is correct and this design keeps it.

**Why it fails.** Three things, reported from use:

- **It wiggles when nothing requires it.** Tension and separation reach equilibrium at a shape that is
  smooth but arbitrary. Nothing in the system prefers a straight line, so a path that ought to be dead
  straight settles into a gentle meander instead.
- **It ignores declared passing sides.** The side was implemented as a steering term — a force that
  pushed toward the declared half-plane. A force can be outvoted by a larger force. Declared sides were
  therefore honoured when convenient and silently abandoned when not.
- **It could not be steered.** Because the output was the equilibrium of competing forces, there was no
  way to correct one figure without perturbing the others.

That implementation is **not part of this codebase** and is not to be resurrected; it exists here only as
evidence.

### 2.4 What both attempts have in common

Neither ever held a representation of **the path the author wanted**.

In both, the only inputs to a path's shape were: an automatically generated straight-or-arc intent, and
whatever collision avoidance did to it. Since the intent is not authored and not meaningful, every visible
feature of a path is a residue of the solver. That has three consequences, and every symptom either
attempt showed is one of them:

- **There is nothing to return to.** A dancer pushed aside has no correct shape to relax back into, so
  either the detour persists (attempt one) or it relaxes to an arbitrary equilibrium (attempt two).
- **A declared side cannot be authoritative.** If the shape is the output of a solver, a side constraint
  is just one more input to that solver, and inputs get traded off.
- **There is nothing to review.** A path cannot be shown to a person and agreed, because there is no
  statement of intent to compare it against — only an outcome.

This is why the design in this document does not begin with a better solver. It begins with **giving the
author a way to state the route**, and only then asks a solver to handle what is left over. A solver that
starts from an authored corridor has something to return to, something a declaration can be checked
against, and something a human can approve.

### 2.5 What survives, and must not be thrown away

A fresh implementer replacing the deformation loop should keep all of the following. Each is load-bearing
and each was learnt the hard way.

| Kept | Why |
|---|---|
| **One planner, no bypasses** | Every traveller goes through a single function. The moment a second code path knows about collisions, the two disagree. |
| **Time-synchronised detection** | Two dancers are compared at the same instant, never as static curves. A pair that shares floor space at different times is not a collision, and this is already correct. |
| **The planner builds its own candidate set** | The list of pairs to compare is built by the planner, never supplied by a caller. Explained below. |
| **Coverage is part of the contract** | How many pairs were compared is itself asserted by a test. Explained below. |
| **Units, not dancers, as free variables** | A bonded couple must deviate as one body. When this was per-dancer, a couple travelling to Línea was stretched 32px apart — which is a couple pulled in half, not a couple avoiding someone. |
| **Constraints re-derived every pass** | From attempt two. A constraint may bind only while the geometry it describes is actually violated. Never carry a resolution forward as state. |
| **Innermost-first resolution order** | A collision near the centre pushes its dancers outward and forces the outer pairs to move; resolving from the centre out means each outer pair answers an arrangement that is not about to change underneath it. |
| **Faults are reported, never swallowed** | A solve that cannot hold its corridor records the failure. Returning a silent best-effort is how two dancers end up sharing a spot with nothing in the logs. |
| **The planner and the renderer must agree** | If the renderer reconstructs a curve between sampled points, the drawn path is not the planned path, and the thing verified is not the thing shown. See §11. |

#### Two of those need more than a line

**What a candidate set is.** Before the planner can hold anyone apart, it must decide **which pairs of
dancers to compare**. That list is the *candidate set*. Every pair on it is measured at every time
sample; every pair not on it is invisible — to the engine, and to every test.

It used to be assembled by each caller, as *every cross-group pair*: one dancer from the first group,
one from the second. Since the groups were the leaders and the followers, **no candidate pair ever
contained two leaders**. On a full wheel that looks obviously safe, because the leaders all progress in
lockstep and never approach one another.

It is false on a Línea Moderna mini-wheel. There a wheel holds only two couples, and a movement that
offsets a leader by two half-slots sends *both* leaders across that small wheel at the same time. During
**Adios Pequeña at 8 couples, two leaders passed 10.5 units apart** — against a requirement of `w + 2Δ`,
with their bodies overlapping by more than 20 units — and **not one test failed**. Nothing failed because
nothing was asked.

So the planner builds the set itself: every pair of dancers except partners inside one rigid unit, whose
spacing the figure fixes anyway. A caller may declare what is *held together*; it may never declare what
to compare. The same reasoning retired per-formation planning — Línea's mini-wheels were once solved one
at a time, so two dancers in different mini-wheels were never compared at all. The whole formation is
planned together now. Nothing moved as a result (those pairs clear by 60.2 units); the point is only that
the pair is now looked at.

**Why coverage has to be asserted directly.** Here is the trap that makes this worth a section. Narrow
the candidate set back to cross-group-only today, and *every behavioural check still passes* — because
the pairs nobody looks at happen to clear anyway, at the couple counts and figures that exist right now.

A collision test can only find what it looked at. "No collisions were detected" is therefore not evidence
that none exist; it is a statement about the size of the search. So the suite asserts **the size of the
candidate set itself** — how many dancers were in play, and how many pairs were actually compared —
rather than inferring coverage from the fact that the dancers came out fine.

Any replacement planner must do the same: report what it examined, and have that report checked.

---

## 3. The model

Everything in this document is built from the terms defined here. They are introduced in dependency
order: the floor first, then how dancers stand on it, then how a movement is described against it.

### 3.1 The wheel: slots, half-slots and configurations

Couples stand around a circle. With `n` couples there are `n` **slots** — one per couple — evenly spaced
around the ring.

**Dancer spacing is fixed; the wheel resizes to fit.** Two lengths are constants of the dance, not of the
drawing:

| Symbol | Meaning | Value today |
|---|---|---|
| `s` | partner separation: leader to follower within one couple, centre to centre | 64.04 units |
| `g` | the gap between couples: a follower to the next couple's leader | 95.16 units |

The ring radius `R` for `n` couples is the value that makes `n` couples plus `n` gaps wrap the circle
exactly once:

    n * ( 2*asin(s / 2R) + 2*asin(g / 2R) ) = 2*pi

solved numerically. This gives `R` ≈ 104.4, 154.0 and 204.2 units at 4, 6 and 8 couples. Two derived
quantities are used throughout:

    delta = asin(s / 2R)      the half-angle a couple subtends at the centre
    R_mid = R * cos(delta)    the radius of a couple's midpoint, slightly inside the ring

**Half-slots.** A slot's angular width is `360/n` degrees. A **half-slot** is half of that, `180/n`
degrees, and it is the unit in which all movement offsets are counted. Half-slots matter because a
progression routinely lands a dancer *between* two of the slots they started among — that is not an
irregularity, it is the ordinary case, and a unit that cannot express it cannot describe a Dame.

**Configurations.** The wheel rests in one of two configurations. Configuration 0 puts the slots on one
set of spokes; configuration 1 rotates them by exactly one half-slot. Both are equally valid resting
arrangements. A movement whose offsets are **odd** lands the dancers in the other configuration; one
whose offsets are **even** lands them in the same one.

Positions around the ring are therefore counted in half-slots from a reference spoke, `0 .. 2n-1`, of
which every other one is occupied at any given moment.

**The cantante.** One leader is the caller, and is always couple 1. Couples are numbered **clockwise**
from them. Every relative address and every group predicate in this document is resolved against that
numbering, so it survives the wheel rotating and survives partners being exchanged.

### 3.2 Slot-positions and places

A **slot-position** says how the two dancers of a couple stand within their slot. It is a property of the
slot, not of the whole formation.

Each slot-position assigns each role to a **lane**:

| Lane | Where it is |
|---|---|
| `ccw` | on the ring, `delta` anti-clockwise of the slot's spoke |
| `cw` | on the ring, `delta` clockwise of the slot's spoke |
| `outer` | on the slot's spoke, `R_step` further out than `R_mid` |
| `inner` | on the slot's spoke, `R_step` further in than `R_mid` |

where `R_step = (a + w/2) / 2` — half the distance between the two partners when they gather onto their
spoke. That distance is `a + w/2` (46 units today) because it is set so a leader's facing arrow exactly
bridges the gap: it leaves his edge and its tip meets hers.

The slot-positions:

| Slot-position | Leader | Follower | Notes |
|---|---|---|---|
| **Casino** | `ccw` | `cw` | The resting arrangement. Partners face each other. |
| **Exhibela** | `cw` | `ccw` | The mirror of Casino. |
| **Afuera Casino** | `cw` | `ccw` | Looks like Exhibela, behaves inside-out: every figure danced from it is point-reflected. |
| **Afuera Exhibela** | `ccw` | `cw` | Looks like Casino, behaves inside-out. |
| **Dile Que No** | `outer` | `inner` | Both partners gathered onto the slot's midpoint spoke. |
| **Afuera Dile Que No** | `inner` | `outer` | The same place with the wheel inside-out. |

**A place is a slot, a slot-position and a role.** Those three together identify exactly one point on the
floor — "the follower's place, in the Exhibela slot-position, of the slot one half-slot clockwise of
mine". A place exists whether or not anyone is standing on it. This matters more than it sounds: it is
what makes a corridor computable without knowing where any other dancer currently is, and therefore what
makes a corridor independent of everything else being danced.

### 3.3 Formations and formation positions

A **formation** is the floor plan. Two exist today:

- **Rueda** — one wheel of `n` slots.
- **Línea Moderna** — two concentric rings sharing `m = n/2` spokes. The inner ring is a proper `m`-couple
  wheel; each outer couple sits on the same spoke, one wheel further out, so every inner-plus-outer pair
  forms its own **mini wheel** of two couples. A formation therefore has a hierarchy of wheels: the
  *grande* wheel (the whole formation) and the *pequeña* wheels (each mini wheel).

A **formation position** is a **named assignment of slot-positions to slots**. It is not necessarily
uniform:

| Formation position | Assignment |
|---|---|
| Casino | every slot in Casino |
| Exhibela | every slot in Exhibela |
| Dile Que No | every slot in Dile Que No |
| Afuera Casino | every slot in Afuera Casino |
| **LM Casino** | inner-ring slots in **Afuera Casino**; outer-ring slots in **Casino** |
| **LM Exhibela** | inner-ring slots in Afuera Exhibela; outer-ring slots in Exhibela |
| **LM Dile Que No** | every slot in Dile Que No (the mini wheel's geometry supplies the inversion) |

Línea Moderna is the proof that non-uniform assignments are needed already: its inner ring genuinely
rests in a different slot-position from its outer ring. A formation that has been identified for later — a
rueda in which **every other couple is turned afuera** — is the same construction with the assignment
selected by couple parity rather than by ring. No new machinery is required for it.

Two consequences that matter downstream:

1. A movement declares its **ending formation position**, and every dancer's landing slot-position is
   *derived* from it. Group clauses never restate it. One source of truth.
2. Because a movement may govern only some of the dancers, its declared ending position is a statement
   about **its own slots**. Whether the formation as a whole is left in a valid state is a separate check,
   specified in `SCHEDULING.md`.

### 3.4 Offsets

A progression states where its dancers end as an **offset in half-slots from each dancer's own starting
slot**, counted around a named wheel.

    positive = clockwise        negative = anti-clockwise

Three rules govern offsets, and the third is the one that is easy to get wrong.

**Offsets are relative, never absolute.** "Three half-slots anti-clockwise of my own slot", never "slot
3". An absolute address does not survive a change in the number of couples; a relative one does. This is
not a convenience — it is the reason a movement authored at six couples still means something at ten.

**Pairings emerge; they are never declared.** In a Dame the leader moves `-1` and the follower moves
`+1`. Leader `k` lands one half-slot anti-clockwise of slot `k`; the follower who started at slot `k-1`
lands one half-slot clockwise of hers — which is the same spoke. They meet without either being told who
the other is. A movement never names a partner, so nothing has to be re-derived when partners change.

**Offsets are never reduced modulo the wheel.** An offset of `-4` half-slots around a two-couple mini
wheel is a *complete circuit*, not zero. Reducing it would turn the figure into standing still. This is
how whole-turn winding is expressed: the magnitude of the offset carries how far round the dancer goes,
not merely where they end up. Any implementation that normalises an offset into the range `0 .. 2n-1`
destroys information the language depends on.

### 3.5 Groups

A movement's clauses apply to **groups** of dancers, selected by predicate, never by index.

The vocabulary is derived from evidence rather than invented. Clustering every dancer in every existing
movement by "performing an identical path once rotational symmetry is removed" gives:

| Formation | Movements | Distinct behaviours | Distinguished by |
|---|---|---|---|
| Rueda | 48 of 51 cases | **2** | `role` alone |
| Línea Moderna | enchufla, vacilala, adios, leader's enchufla, dame grande, dame pequeña | **4** | `role` × `ring` |
| Rueda → Línea entries | línea moderna, dame línea, adios línea | — | `role` × `parity from the cantante` |

So the minimum vocabulary the existing corpus demands is three properties:

| Selector | Values | Meaning |
|---|---|---|
| `role` | leader, follower | |
| `ring` | inner, outer | Which ring of a multi-ring formation. Meaningless in a single-wheel formation. |
| `parity` | primeros, segundos | Couple parity counted clockwise from the cantante. Names the alternating halves. |

A group is any conjunction of these — "the outer leaders", "the primero followers", "all followers". The
set is **designed to be extended**: a new formation may need a predicate none of these express, and adding
one must not disturb existing definitions.

*Caveat recorded honestly:* the clustering does not fully collapse for the movements that **change**
formation, and the reason is structural rather than a gap in the vocabulary. A formation change has no
single symmetry: the Rueda entries begin with `n`-fold symmetry and end with `n/2`-fold, so "rotate by
one slot and compare" is not well-defined across them. Group predicates for an entry are resolved against
the **starting** formation's symmetry. This should be confirmed against real output before the vocabulary
is treated as final.

### 3.6 Motion, and whether a dancer is bounded

Each group's clause states **one motion type**:

| Motion | Meaning |
|---|---|
| `progression` | The dancers travel. They have a corridor, computed as in §3.8. This document is about these. |
| `scripted` | The dancers perform prescribed choreography from the existing figure library. To the collision engine they are **immutable obstacles that never yield**. Out of scope — see §13. |
| `still` | The dancers do not move. They are static obstacles. |

Independently, each group carries **`bounded`**:

- **bounded** — this movement requires these dancers. No concurrent movement may claim them.
- **unbounded** — this movement's instruction for them is a default that a concurrent movement may
  replace.

Defaults: a `progression` is bounded, a `still` group is unbounded. Both are overridable, and the author
is always asked to confirm which they meant — a dancer omitted by accident and a dancer deliberately left
free look identical in the data, so the confirmation is the only thing that distinguishes them.

The combination is more useful than it first appears. A group may be a **progression and unbounded** at
once: its dancers have a defined transition that exists only to keep the arrangement consistent, and a
concurrent movement is welcome to move them somewhere else instead. Dame Dos Pequeña's followers are
exactly this — their transition exists to preserve the configuration and meet the leader, and nothing
about the figure depends on them doing it.

How a claim is resolved when two movements want the same dancer is specified in `SCHEDULING.md`.

### 3.7 Features, and how much room they take

A **feature** is something a corridor is declared to pass on one side of. Two kinds:

| Feature | Its own radius `r` |
|---|---|
| **A place** — where a dancer stands (§3.2) | `w/2` |
| **An abstract point** — the midpoint of a named wheel; nobody stands there | `0` |

A corridor must not overlap a feature. Since a corridor extends `W/2` either side of its centreline, and
a feature occupies `r`, the centreline must stay clear by:

    keep-out = r + W/2 + 2*delta_margin

`delta_margin` is the per-body anti-collision margin (`Δ` in §1.2, 1.5 units today), applied once for the
feature and once for the corridor edge.

This single rule specialises correctly, which is the check that it is the right rule:

| Case | Keep-out | Sanity |
|---|---|---|
| A place, solo corridor (`W = w`) | **35.00 units** | Exactly the clearance the engine already holds between two dancers — as it must be, since a corridor edge touching a place means a body touching a body |
| An abstract point, solo corridor | **19.00 units** | The dancer's body never covers the point |
| A place, couple corridor at `open` separation | **83.02 units** | Varies with the couple’s travelling separation — see §3.8 |

**A feature is avoided for the whole movement, whether or not it stays occupied.** A place declared as an
obstacle remains one even if its dancer has left. This is deliberate: it is what keeps a corridor a
function of the formation alone, and it is what allows corridors to be computed while other dancers are
mid-flight.

### 3.8 Corridors and the taut path

A **corridor** is:

- a **centreline** — the shortest route from the group's starting place to its ending place that passes
  every declared feature on the declared side, with each feature inflated to its keep-out radius; and
- a **width** `W`.

The centreline is called the **taut path**, because it is what a string pulled tight between the two ends
would lie along while still going round the correct side of every peg. Its shape follows from that
definition and is not separately specified: straight runs, joined by arcs that run tangentially onto and
off the inflated features it actually touches. It leaves a straight run at a tangent and rejoins one at a
tangent, so the direction of travel is continuous — there is no corner.

**Declared features that do not bind are dropped.** If the taut path does not touch a feature's inflated
radius, that feature imposes nothing and the path is as if it were never declared. An author may
therefore declare a side for a feature that only matters at some couple counts — Dame declares a side
against the wheel's midpoint, which binds only on a one-couple wheel — and it costs nothing everywhere
else. The engine determines the order in which features are actually met and re-orders the declaration
silently if the author listed them differently; the engine is authoritative about encounter order.

**Corridor width:**

| Travelling unit | `W` |
|---|---|
| A single dancer | `w` |
| A couple travelling as one rigid object | `c + 2w`, where `c` is the couple's **travelling separation** |

The couple case is derived, not chosen: each partner sits `c/2` from the couple's midpoint, their body
reaches `c/2 + w/2`, and another dancer's centre must stay a further `w/2` clear — giving a half-width of
`c/2 + w`, which is `(c + 2w)/2`.

**The travelling separation is a named value, not a free number.** How far apart partners hold each other
while travelling is a property of the *hold*, and different holds are genuinely different distances — a
couple with elbows hooked walks far closer than a couple at arm's length. The available values are the
separations the formation already defines, so each one has a derivation rather than being a measurement
somebody liked:

| Name | `c` | Value today | The hold it describes | Corridor width |
|---|---|---|---|---|
| `linked` | `w` | 32.00 | Shoulder to shoulder, elbows hooked — bodies touching | 96.00 |
| `closed` | `a + w/2` | 46.00 | The Dile Que No separation: partners gathered on one spoke, close enough that the leader's facing arrow exactly bridges the gap | 110.00 |
| `open` | `s` | 64.04 | The Casino separation: partners at arm's length as they stand on the ring | 128.04 |

**The default is the separation belonging to the slot-position the couple sets off from** — a couple
leaving Casino travels at `open`, a couple leaving the Dile Que No position travels at `closed`. An author
names a value only when the hold differs from the position they came from, which is what `linked` is for.

The list extends the same way the group vocabulary does (§3.5): a new hold gets a name and a derivation,
never a bare number.

**Arriving at a different separation.** A couple's arrival slot-position has a separation of its own, and
it need not match the one they travelled at. Where they differ, the couple **interpolates between them
over the end of the movement** — the same treatment facing receives (§4). Because the travelling
separation *defaults* to the separation of the slot-position they set off from, a couple that takes the
default only ever has to change separation on arrival; one whose author named a different hold changes
twice, opening or closing after departure and again before arrival.

**The corridor takes the widest separation the couple ever holds:**

    W = max(c_start, c_travel, c_end) + 2w

A corridor is a constant-width object by definition, so this is deliberately conservative rather than
tapering the corridor to follow the transition. Tapering would make width a function of time, which every
downstream check — overlap screening, feature keep-out, the S4 deviation test — would then have to
account for, and it would buy a little tightness at two moments of a movement in exchange for complicating
all of them. If a figure is ever found where that tightness matters, this is the decision to revisit.

**Two corridors overlapping means a collision is *possible*, not that one occurs.** Because a corridor's
half-width is the dancer's own radius, two corridor centrelines closer than `w` means two bodies could
touch — which is exactly the condition worth screening for. Whether they *do* depends on whether both
dancers are in the shared region at the same time, which is decided in §6.

### 3.9 The property everything rests on

> **A corridor is a pure function of the formation, the couple count, and the movement's declarations.**

It does not depend on collisions, on what any other dancer is doing, or on what else is being danced
concurrently. Compute it twice and you get the same answer; compute it during someone else's movement and
you get the same answer.

Every benefit claimed in this document follows from that one property:

- a path has a shape to return to after avoiding someone, so avoidance cannot leave residue
- a declared side is a property of the corridor rather than an input to a solver, so it cannot be outvoted
- a corridor can be drawn, reviewed and signed off before any collision is considered
- concurrent movements can each compute their own corridors without reference to one another

Neither previous attempt had it (§2.4). If an implementation choice would make a corridor depend on what
other dancers do, that choice is wrong, whatever else recommends it.

### 3.10 Known bounds of this language

Stated so they are recognised as deliberate limits rather than discovered later as defects.

- **A pass-side selects between exactly two routes**, so it can express up to one turn around a feature.
  Windings of a full circuit or more come from the offset instead (§3.4), unreduced. Neither expresses
  something like one and a half turns around another dancer — and that is deliberately *not* a gap to be
  filled here. A figure of that kind is choreography, not avoidance, and collision resolution is the wrong
  instrument for producing it. It would be modelled as a scripted movement together with a position the
  dancers move into and out of. If such a figure is ever wanted, it is specified then.
- **Scripted figures are outside the model.** They are prescribed choreography and must clear each other
  unaided (§13).
- **A group predicate cannot yet name an arbitrary subset.** Only conjunctions of `role`, `ring` and
  `parity`. This is a floor derived from evidence, not a ceiling; extending it is expected.
- **Facing cannot cause a failure.** It is cosmetic: a dancer's footprint is a circle regardless of which
  way they look. Orientation of a *couple* travelling as one object is not cosmetic — it sets the
  footprint — and is declared (§4).

---

## 4. The movement definition language

A movement definition is **data**. It contains no code, no coordinates and no couple counts. Everything is
stated relative to where each dancer starts, so one definition serves every couple count the formation
supports.

The notation below is illustrative — an implementation may serialise it however it likes — but every field
shown is required, and no field not shown exists.

### 4.1 A movement

```
name:        a unique name
from:        the formation position the movement starts in
to:          the formation position it ends in
beats:       how long it lasts, a constant for the movement
groups:      one or more group clauses          (§4.2)
priority:    optional  — overrides the derived yielding order   (§4.5)
encounters:  optional  — overrides for individual collisions    (§4.5)
```

`from` and `to` are **formation positions** (§3.3), and `to` is what derives every dancer's landing
slot-position. No group clause ever restates it: one source of truth, so the two cannot drift apart.

**`(name, from)` is the key.** A movement's name together with the formation position it is danced from
**uniquely identifies one definition**. The same name may therefore have several definitions — a Dame from
Casino and a Dame from the Dile Que No position are one word to a caller and different geometry to the
engine — and the pair is the index the engine looks up when dancers standing somewhere are told to dance
something. **No definition set may contain two entries sharing a `(name, from)`.**

**`beats` belongs to the definition, and definitions sharing a name may differ.** Today's Dame lasts two
beats from Casino and four from Exhibela, and nothing requires them to agree. A shorter movement simply
**starts later**: a call's start beat is back-timed from the length of what it schedules
(`SCHEDULING.md`), so a figure of any duration can still be made to finish on the beat it needs to. There
is no rule tying a movement's length to its name, to its formation, or to anything else.

*(This document does move the Dame family to a uniform four beats — §1.4 — but that is a decision about
those particular figures, taken because it quarters the severity of their turns. It is not a constraint the
language imposes.)*

Because a movement may govern only some of the dancers, `to` is a claim about **the slots this movement
touches**. Whether the formation as a whole is left in a valid state, when something else is running
alongside, is checked in `SCHEDULING.md`.

### 4.2 The group clause

```
id:           a name, so other clauses can refer to this group
select:       which dancers                     (§3.5)
unit:         dancer | couple                   default: dancer
motion:       progression | scripted | still    (§3.6)
bounded:      true | false                      default: progression true, still false

  — when motion is `progression` —
destination:  a slot address                    (§4.3)
passes:       an ordered list of pass declarations   (§4.4)

  — when unit is `couple` —
separation:   linked | closed | open            default: the separation of the `from` slot-position
orientation:  a rotation over the movement      (§4.6)
facing:       a facing rule                     (§4.6)

  — when motion is `scripted` —
figure:       names a figure in the existing library
```

`select` is a conjunction of the selectors in §3.5 — `role`, `ring`, `parity` — and an omitted selector
matches everything. `{ role: leader, ring: outer }` is the outer leaders; `{ role: follower }` is every
follower.

**A movement mentions only the dancers it governs.** Dancers matched by no clause are not part of the
movement at all; they are free, and free to be claimed by something running concurrently. A group declared
`motion: still` is asserted *deliberately* still, which is a different statement from silence and is
recorded as such. An author is always asked which they meant, because a dancer left out on purpose and a
dancer left out by accident look identical in the data.

### 4.3 Addresses

Everything an author can point at is addressed **relative to the dancer's own starting slot**. There are
no absolute indices anywhere in the language.

**A wheel address** names which wheel a thing belongs to:

```
own                     the dancer's own wheel — the single wheel in a Rueda,
                        or the dancer's own mini wheel in Línea Moderna
grande                  the whole formation's wheel
{ wheel: +k }           k wheels clockwise of the dancer's own, around the parent
```

**A slot address** names one slot, in one of two forms:

```
{ offset: k, around: <wheel address> }     k HALF-SLOTS, signed: + clockwise, - anti-clockwise
{ wheel: <wheel address>, ring: inner|outer }    a slot in a multi-ring formation
```

Both forms address the same thing and either may be used where a slot address is expected. They differ in
what they can express:

- The **offset form carries winding**, because it is not reduced (§3.4). `{ offset: -4, around: own }` on a
  two-couple mini wheel is a complete circuit, not zero. Use this form whenever how far round matters.
- The **ring form is clearer where a formation has named rings** and no winding is involved.

**A place address** names a point on the floor — where a dancer stands, whether or not one is there:

```
{ role: leader|follower, position: <slot-position>, slot: <slot address> }
```

The **slot-position must be named explicitly**. It is not defaulted from the movement's `from`, because
"which arrangement is this place in" has two plausible answers and picking one silently is exactly the
class of decision that produced the defects in §2.

**An abstract point** names something nobody stands on:

```
{ midpoint: <wheel address> }
```

*This is the part of the language most likely to need extending.* A new formation may need a way to point
at something none of these forms reach. Extending it must not disturb existing definitions — which is why
every address is relative, and why none of them mention a couple count.

### 4.4 Declaring passes

```
passes:
  - { side: left|right, of: <place address or abstract point> }
```

The list is **ordered by the order the dancer meets each feature**, and authors are asked to write it that
way because it is how they think and it saves the engine work. But the engine determines the true encounter
order itself, and **re-orders silently** where the author got it wrong: the engine is authoritative about
what the dancer actually meets and when.

`side` says which side of the feature the dancer travels along. A feature the corridor does not actually
touch imposes nothing and is dropped (§3.8), so declaring a side that only binds at some couple counts is
harmless everywhere else.

**Passes are declared against static features only** — places and abstract points. A pass against another
*moving* dancer is not a pass declaration; it is a collision, and collisions are governed by priority and
by the encounter overrides in §4.5. This distinction is the heart of the design: the static declarations
determine the corridor, and the corridor is a pure function of the formation (§3.9). Allowing a moving
dancer into that list would destroy that property.

### 4.5 Priority and encounter overrides

Both are **overrides**. Both are absent from a definition unless the derived answer is wrong.

**Priority** decides who yields when two dancers contend. The default is derived: **the dancer with the
longer corridor holds their route, and the shorter one yields**, on the reasoning that the longer path has
more room to absorb a detour. Corridor lengths within `Δ_len` of each other are treated as equal, and equal
corridors yield **50/50** — each moves half as far as it otherwise would.

```
priority: [ <group id>, <group id>, ... ]
```

When present it is a **complete ranking** of the groups that collide, first meaning highest priority,
with no ties. A partial ranking is not accepted: if the author disagrees with the derived order, they state
the whole order, so there is never a mixture of declared and derived precedence to reason about.

**Encounter overrides** name a side for one particular collision:

```
encounters:
  - between: [ <group id>, <group id> ]     may name the same group twice
    nth:     k                              optional; which encounter between this pair
    side:    left | right
```

The default side is derived from the geometry: **whichever side the two dancers already favour** on their
undeviated corridors. If their approach is close to head-on, that preference is unstable — a fraction of a
unit decides it — so a **dead band of `Δ_side`** applies, and inside it there is no honest default and the
author is asked.

`between` may name the same group twice, which is how a collision between two dancers of one group is
declared — "when two outer leaders meet, they pass on each other's right". There is no priority within a
group, so such a pair always yields 50/50.

**`nth` is a fragile identifier and is treated as such.** If a corridor is edited so that an earlier
encounter appears or disappears, `nth: 2` silently refers to a different event. The engine therefore
records, alongside every override, the time and location of the encounter it resolved, and **warns when an
override still matches by ordinal but its geometry has moved**.

**Derived decisions are recorded, not just applied.** Every priority and every side the engine derives is
written into the stored output as *derived*. Stored overrides remain the only hand-authored data, but the
derived values are kept so that a change to a default shows up as a diff to be reviewed rather than as a
silent change to movements a human already approved.

### 4.6 Couples travelling as one object

When `unit: couple`, the group's clauses apply to couples rather than individual dancers: one corridor for
the pair, one destination, and a corridor width from §3.8.

```
separation:   linked | closed | open
orientation:  { turn: <degrees>, direction: clockwise | anticlockwise }
facing:       travel | partner | { toward: <place address or abstract point> } | { formation: up|down|left|right }
```

**Orientation is stated as a rotation over the movement**, not as a start and an end angle. A rotation can
express more than a half turn and says which way round; a pair of angles cannot do either.

**Orientation is physical.** It sets the couple's footprint, and therefore what they collide with. A couple
broadside to its direction of travel needs far more room than one edge-on.

**Facing is cosmetic.** A dancer's footprint is a circle whichever way they look, so facing can never cause
a collision and can never make a movement fail. It is declared because it is visible, not because it
matters to the geometry.

For a **progression by a single dancer**, facing is not declared at all: the rule is always *face the way
you are travelling, interpolating to the arrival facing over the end of the movement*. Only couples declare
facing, because only a couple can sensibly look at something other than where it is going — partners
looking at each other while they travel, or both looking along the direction of travel with arms linked.

### 4.7 Worked examples

Four movements, chosen because between them they exercise every field.

**Dame** — the commonest progression. Leader and follower move half a slot toward each other and meet on
the spoke between, which is why the configuration flips.

```
name:  Dame
from:  Casino          to: Exhibela          beats: 4
groups:
  - id: leaders
    select:      { role: leader }
    motion:      progression
    destination: { offset: -1, around: own }
    passes:      [ { side: right, of: { midpoint: own } } ]
  - id: followers
    select:      { role: follower }
    motion:      progression
    destination: { offset: +1, around: own }
    passes:      [ { side: right, of: { midpoint: own } } ]
```

Note that nobody names a partner. Leader `k` lands one half-slot anti-clockwise; the follower who began one
slot anti-clockwise lands one half-slot clockwise; those are the same spoke. **The pairing emerges from the
offsets.** The declared side against the wheel's midpoint binds only on a one-couple wheel, and is simply
dropped everywhere else.

**Dame Dos** — the same figure progressing two couples instead of one.

```
name:  Dame Dos
from:  Casino          to: Exhibela          beats: 4
groups:
  - id: leaders
    select:      { role: leader }
    motion:      progression
    destination: { offset: -3, around: own }
    passes:      [ { side: right, of: { midpoint: own } } ]
  - id: followers
    select:      { role: follower }
    motion:      progression
    destination: { offset: +1, around: own }
    passes:      [ { side: right, of: { midpoint: own } } ]
```

Twice the distance in the same four beats, so this is the figure that cannot pass anything closely
(§1.4). Nothing in the definition says so — it falls out of the geometry, and the diagram review is where
it is seen.

**Dame Dos Pequeña** — the figure that proves offsets must not be reduced.

```
name:  Dame Dos Pequeña
from:  LM Exhibela     to: LM Exhibela       beats: 4
groups:
  - id: leaders
    select:      { role: leader }
    motion:      progression
    destination: { offset: -4, around: own }
    passes:      [ { side: right, of: { midpoint: grande } } ]
  - id: followers
    select:      { role: follower }
    motion:      progression
    destination: { offset: 0, around: own }
    bounded:     false
encounters:
  - between: [ leaders, leaders ]
    side:    right
```

`{ offset: -4, around: own }` on a two-couple mini wheel is a **complete circuit**. Reduced to zero it
would be standing still. The leaders cross their own mini wheel twice and meet each other twice, which is
why the encounter override names a side for two dancers of the same group — there is no priority within a
group, so they yield equally.

The followers move zero half-slots but change slot-position, which is a lane swap across their own slot.
They are `bounded: false` because their transition exists only to keep the arrangement consistent; nothing
about the figure depends on them making it, so a concurrent movement is welcome to move them instead.

**Dame Eñe** — a cross-wheel progression, and the figure the previous engine could not resolve.

```
name:  Dame Eñe
from:  LM Exhibela     to: LM Exhibela       beats: 4
groups:
  - id: outer-leaders
    select:      { role: leader, ring: outer }
    motion:      progression
    destination: { wheel: +1, ring: inner }
    passes:
      - side: left
        of:   { role: follower, position: LM Exhibela, slot: { wheel: own, ring: inner } }
  - id: inner-leaders
    select:      { role: leader, ring: inner }
    motion:      progression
    destination: { wheel: own, ring: outer }
    passes:
      - side: right
        of:   { midpoint: own }
  - id: followers
    select:      { role: follower }
    motion:      still
```

Every leader place is filled exactly once: each mini wheel's inner leader takes its own outer slot, and its
inner slot is taken by the outer leader of the mini wheel one place anti-clockwise. The followers hold, so
their places are the static features the outer leaders route around.

This definition declares **no priority and no encounter overrides**. That is not because none are needed —
it is because the engine has not yet been asked. Running it will surface whatever contention exists
between the outer and inner leaders, and the author answers then (§4.8). A definition is complete when it
is *syntactically* total, not when it is collision-free.

### 4.8 What the author states, and what the engine works out

| The author states | The engine derives |
|---|---|
| The groups, and each one's motion type | Which dancers each group selects, at each couple count |
| Where each group ends, as a relative address | Every landing slot-position, from `to` |
| Which side of which static features | The corridor: the taut path and its width |
| — | Which declared features actually bind, and in what order they are met |
| — | Who is paired with whom, from the offsets meeting |
| — | Which pairs of dancers can possibly collide, and which actually do |
| — | Who yields, from the corridor lengths |
| — | Which side a colliding pair passes on, from the geometry they already favour |
| `bounded`, where it differs from the default | — |
| A priority ranking, only where the derived order is wrong | — |
| An encounter side, only where the derived side is wrong or ambiguous | — |

**The authoring loop.** An author does not write a complete definition in one pass, and is not expected
to. They state the groups, the destinations and the static passes — the part they can know without
computing anything. The engine then computes the corridors, finds the contention, and **asks about
whatever it cannot decide honestly**: a pair whose corridors contend with no declared side and no stable
geometric preference, a priority it had to guess between near-equal corridors, a collision it could not
resolve at all.

The author answers, and the answers are stored as overrides. Nothing is guessed silently, and nothing that
was obvious is put to the author twice.
