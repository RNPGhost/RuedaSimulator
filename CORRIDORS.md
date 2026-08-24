# Corridors — the path engine and the figure language

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

This document specifies the replacement: **a figure's path shape is authored, and collision avoidance
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
| **figure** | One named thing the dance does, over a fixed number of beats: Dame, Enchufla, Dile Que No. A figure is made of **movements**, one per group of dancers, and it governs some or all of the floor. |
| **movement** | What **one group of dancers** does within a figure — their travel and their turn, over that figure’s beats. A figure is a set of movements; a movement never exists on its own. |
| **call** | A word the **Cantante** shouts. Expands to a sequence of figures. |
| **Cantante** | The caller — the one leader who calls the figures. Their couple is the origin every relative address and every group predicate is measured from (§3.1). |
| **progression** | A movement in which the dancers travel to different slots. This document is about progressions. |
| **scripted movement** | A movement whose shape is prescribed choreography rather than derived from a corridor. In the model, but never reshaped by it — see §3.6 and §13. A figure **all** of whose movements are scripted is a **scripted figure**, which is what the existing codebase means by the term (Enchufla, Adios, Dile Que No). |

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
  motion. Either way the shape is an artefact of the solver rather than a statement of intent.
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
4. **No erratic or high-acceleration motion.** Every turn must be one a person could physically walk.

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

A figure definition states, for each group of dancers, where they start, where they finish, and which
side they pass **fixed features of the formation** on — the places where dancers stand, and the midpoints
of wheels. Those declarations hold for the whole figure and do not depend on what any other dancer does.
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
| S6 | Every figure is reviewed as a rendered diagram and signed off by a human | the corpus defined in §14 |
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

**Structurally:** the goal for this project is that users define formations, figures and calls through a
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
4. **Sampling.** Paths are compared at 40 samples across the figure. Detection is *time-synchronised* —
   the two dancers are compared at the same instant `t`, never as static curves.
5. **Sides.** Where a pair must separate, the direction is resolved by asking the figure: first by
   relation (`partner0`, `vacating`, and similar), then by role, then a default.
6. **Resolution.** Where a pair comes closer than the clearance, a **via point** is placed.

### 2.2 The first attempt: via points

A via is a *displacement* attached to a unit at a particular time. A dancer's drawn position is their base
path plus the sum of their vias, each weighted by a smooth curve that is full at the via's own moment and
falls to zero at the neighbouring vias and at both ends of the figure — so landings stay exact.

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
- Two conflicts within 0.06 of the figure's duration **overwrite each other's answers**, because vias
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

It is false on a Línea Moderna mini-wheel. There a wheel holds only two couples, and a figure that
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
order: the floor first, then how dancers stand on it, then how a figure is described against it.

### 3.1 The wheel: slots, half-slots and phases

Couples stand around a circle. With `n` couples there are `n` **slots** — one per couple — evenly spaced
around the ring.

Two lengths set the size of that circle:

| Symbol | Meaning | Default today |
|---|---|---|
| `s` | partner separation: leader to follower within one couple, centre to centre | 64.04 units |
| `g` | the gap between couples: a follower to the next couple's leader | 95.16 units |

**These are strong defaults, not invariants.** Every formation that exists today uses them, and a figure
may assume them unless told otherwise. But a formation may deliberately want its couples closer or further
apart — for the whole formation, or for one wheel inside it — and nothing here may assume that cannot
happen. `s` and `g` are values **a formation supplies**, with the numbers above as the defaults.

The ring radius `R` for `n` couples is the value that makes `n` couples plus `n` gaps wrap the circle
exactly once:

    n * ( 2*asin(s / 2R) + 2*asin(g / 2R) ) = 2*pi

solved numerically. At the default `s` and `g` this gives `R` ≈ 104.4, 154.0 and 204.2 units at 4, 6 and 8
couples. Two derived quantities are used throughout:

    delta = asin(s / 2R)      the half-angle a couple subtends at the centre
    R_mid = R * cos(delta)    the radius of a couple's midpoint, slightly inside the ring

Because `R` is derived from `s` and `g`, a formation that changes either changes its radius too. That is a
consequence to expect rather than a defect, and it is why no rule in this document may be written in terms
of a radius that is assumed constant across formations.

#### What `s` and `g` fix, and what they do not

`s` and `g` fix **the wheel's radius, and where each slot's midpoint sits**. Those two things are then
settled by the formation, once, at definition. They are **static features of the floor**.

**They do not follow the slot-position.** A slot-position rearranges the two dancers *within* their slot;
it does not move the slot. Two couples resting in the Dile Que No position stand further apart than `g`,
because each pair has gathered onto its own spoke and left the ring — and the wheel does not shrink to
follow them, nor does any midpoint move. `s` and `g` describe **the resting arrangement the formation was
laid out from**, and the geometry they produce outlives whichever slot-position the dancers are in at the
moment.

This is what lets a slot's midpoint be a feature a corridor can be declared against (§3.7) rather than
something that shifts whenever a figure changes position.

**Half-slots.** A slot's angular width is `360/n` degrees. A **half-slot** is half of that, `180/n`
degrees, and it is the unit in which every offset is counted. Half-slots matter because a progression
routinely lands a dancer *between* two of the slots they started among — that is not an irregularity, it
is the ordinary case, and a unit that cannot express it cannot describe a Dame.

**Phases.** The wheel rests in one of two **phases**. Phase 0 puts the slots on one set of spokes; phase 1
rotates them by exactly one half-slot. Both are equally valid resting arrangements. A movement whose
offsets are **odd** lands its dancers in the other phase; one whose offsets are **even** lands them in the
same one.

Positions around the ring are therefore counted in half-slots from a reference spoke, `0 .. 2n-1`, of
which every other one is occupied at any given moment.

**The Cantante.** One leader is the caller — the **Cantante** — and their couple is the origin that every
relative address and every group predicate is measured from. Couples are numbered **clockwise** from them,
and a couple's **distance** from the Cantante is counted in couples, the Cantante's own couple being
distance `0`.

**What is measured from the Cantante moves as the dance proceeds.** Progressions re-order who stands
where, so a dancer who began two couples clockwise of the Cantante does not stay there. A predicate that
depends on the Cantante is therefore resolved **at the moment the figure using it begins** — not when the
call was issued, not at the start of the dance. The Cantante is fixed; every distance measured from them
is not.

### 3.2 Slot-positions and places

A **slot-position** says how the two dancers of a couple stand within their slot. It is a property of the
slot, not of the whole formation.

Each slot-position puts each role in a **slot-place** — one of the standing points a slot offers,
described relative to that slot and to nothing else:

| Slot-place | Where it is |
|---|---|
| `ccw` | on the ring, `delta` anti-clockwise of the slot's spoke |
| `cw` | on the ring, `delta` clockwise of the slot's spoke |
| `outer` | on the slot's spoke, `R_step` further out than the slot's midpoint |
| `inner` | on the slot's spoke, `R_step` further in than the slot's midpoint |

where `R_step = (a + w/2) / 2` — half the distance between the two partners when they gather onto their
spoke. That distance is `a + w/2` (46 units today) because it is set so a leader's facing arrow exactly
bridges the gap: it leaves his edge and its tip meets hers.

**A slot-place is not a place, and the hyphen is doing real work.** A slot-place is a *relative* thing —
`cw` means nothing until a slot is supplied. A **place** is the absolute thing you get once one is: a
slot, a slot-position and a role together (below). Two names because they are two objects, and running
them together is how an address ends up meaning a point and a template at once.

**These four are the slot-places there are today, not the ones there can ever be.** A later formation may
need others — partners gathered on the spoke at `linked` separation, one either side of the slot's
midpoint, is the obvious next one. A slot-place is added by naming it and saying where it sits relative to
the slot. Nothing else in the language changes, and no rule below may assume the list is closed.

The slot-positions:

| Slot-position | Leader | Follower | Notes |
|---|---|---|---|
| **Casino** | `ccw` | `cw` | The resting arrangement. Partners face each other. |
| **Exhibela** | `cw` | `ccw` | The mirror of Casino. |
| **Afuera Casino** | `cw` | `ccw` | Looks like Exhibela, behaves inside-out: every figure danced from it is point-reflected. |
| **Afuera Exhibela** | `ccw` | `cw` | Looks like Casino, behaves inside-out. |
| **Dile Que No** | `outer` | `inner` | Both partners gathered onto the slot's midpoint spoke. |
| **Afuera Dile Que No** | `inner` | `outer` | The same place with the wheel inside-out. |

**A slot-position is always stated against a named wheel.** Every place above is defined relative to the
slot's **spoke**, and a slot belonging to more than one wheel has more than one spoke — so a slot-position
on its own does not identify an arrangement. It is *Casino with respect to the pequeña*, or *Afuera
Exhibela with respect to the grande*. The same physical arrangement carries a different name against each
wheel the slot belongs to, and **both names are correct**: the data states the rotation once and the
engine derives the rest (`FORMATIONS.md §2.5`). Wherever this document names a slot-position it names the
wheel with it, written

```
{ <wheel name>, <slot-position> }
```

Leaving the wheel out was tolerable while every slot belonged to one wheel. It stops being tolerable the
moment a formation turns a slot relative to one of its wheels and not the other, which Two Lines does
throughout (`FORMATIONS.md §3.4`).

**A place is a slot, a slot-position and a role.** Those three identify exactly one point on the floor —
*the follower's place, in `{ grande, Exhibela }`, of the slot one half-slot clockwise of mine* — because
the slot-position says which **slot-place** that role stands in, and the slot says where that slot-place
is. A place exists whether or
not anyone is standing on it. This matters more than it sounds: it is what makes a corridor computable
without knowing where any other dancer currently is, and therefore what makes a corridor independent of
everything else being danced.

*How* such a place is written down is §4.3's business rather than this section's. §3 is the model; §4 is
the language for addressing it.

### 3.3 Formations and formation positions

A **formation** is the floor plan. Two exist today:

- **Rueda** — one wheel of `n` slots, named `grande`.
- **Línea Moderna** — two concentric rings sharing `m = n/2` spokes. The inner ring is a proper `m`-couple
  wheel; each outer couple sits on the same spoke, one wheel further out, so every inner-plus-outer pair
  forms its own mini wheel of two couples.

**`grande` and `pequeña` are not levels of a hierarchy. They are two different ways of dividing the same
couples up.** `grande` divides Línea Moderna into the two concentric wheels, inner and outer. `pequeña`
divides the same couples into the `m` two-couple wheels arranged around the formation. Every couple is in
exactly one wheel of each name, neither division contains the other, and that is precisely why
`FORMATIONS.md §2.2` rejects modelling a formation as a tree.

A **formation position** is a **named assignment of slot-positions to slots**, and it belongs to a
formation. It is written

```
{ <formation>, <position> }
```

because the same word means different things in different formations — `Exhibela` in a Rueda and
`Exhibela` in Línea Moderna are different arrangements, and the old spelling `LM Exhibela` said so only by
convention. An assignment is not necessarily uniform:

| Formation position | Assignment |
|---|---|
| `{ Rueda, Casino }` | every slot in `{ grande, Casino }` |
| `{ Rueda, Exhibela }` | every slot in `{ grande, Exhibela }` |
| `{ Rueda, Dile Que No }` | every slot in `{ grande, Dile Que No }` |
| `{ Rueda, Afuera Casino }` | every slot in `{ grande, Afuera Casino }` |
| `{ Línea Moderna, Casino }` | every slot in `{ pequeña, Casino }` |
| `{ Línea Moderna, Exhibela }` | every slot in `{ pequeña, Exhibela }` |
| `{ Línea Moderna, Dile Que No }` | every slot in `{ pequeña, Dile Que No }` |

**Naming the wheel is what turns Línea Moderna's three rows uniform**, and that is not a tidy accident. An
inner slot of Línea Moderna is `{ grande, Afuera Casino }` **and** `{ pequeña, Casino }` — one
arrangement, two true descriptions, because the two wheels' radial directions at that slot point opposite
ways. Stated against the grande the assignment needs two clauses and an `Afuera`; stated against the
pequeña it needs neither, because *the pequeña is the wheel each couple is actually standing on*. When one
choice of wheel makes an assignment uniform and another does not, that is usually the language telling
you which wheel the position belongs to.

Non-uniform assignments are still needed and still supported — an inner ring may genuinely rest in a
different slot-position from an outer one, and against the grande these three do. A formation identified for later — a rueda in which
**every other couple is turned afuera** — is the same construction with the assignment selected by couple
parity rather than by ring. No new machinery is required for it.

Two consequences that matter downstream:

1. A figure declares its **ending formation position**, and every dancer's landing slot-position is
   *derived* from it. Group clauses never restate it. One source of truth.
2. Because a figure may leave some of its groups unbounded, its declared ending position is a statement
   about **the dancers it actually governs**. Whether the formation as a whole is left in a valid state is
   a separate check, specified in `SCHEDULING.md`.

### 3.4 Offsets

A progression states where its dancers end as an **offset in half-slots from each dancer's own starting
slot**, counted around a named wheel.

    positive = clockwise        negative = anti-clockwise

Three rules govern offsets, and the third is the one that is easy to get wrong.

**Offsets are relative, and should be relative wherever they can be.** "Three half-slots anti-clockwise
of my own slot", not "slot 3". An absolute address does not survive a change in the number of couples; a
relative one does. This is not a convenience — it is the reason a figure authored at six couples still
means something at ten, and it is what every figure should be written to by default.

**The exception is real, and it arrived with directional formations.** A formation with a fixed
orientation (`FORMATIONS.md §2.7`) has places that are genuinely distinguishable in absolute terms: Two
Lines’ front line is not interchangeable with its back line, and no relative address makes it so. A
figure written into, out of, or within such a formation may therefore have to name slots by a property
only that formation has, and in the limit by index. Such a figure does not generalise across couple
counts — but neither does the formation, so the cost is already paid. Every other figure uses relative
offsets and named properties, and the engine reports one that does not so the choice is visible rather
than accidental.

**Pairings emerge; they are never declared.** In a Dame the leader moves `-1` and the follower moves
`+1`. Leader `k` lands one half-slot anti-clockwise of slot `k`; the follower who started at slot `k-1`
lands one half-slot clockwise of hers — which is the same spoke. They meet without either being told who
the other is. A figure never names a partner, so nothing has to be re-derived when partners change.

**Offsets are never reduced modulo the wheel.** An offset of `-4` half-slots around a two-couple mini
wheel is a *complete circuit*, not zero. Reducing it would turn the figure into standing still. This is
how whole-turn winding is expressed: the magnitude of the offset carries how far round the dancer goes,
not merely where they end up. Any implementation that normalises an offset into the range `0 .. 2n-1`
destroys information the language depends on.

### 3.5 Groups

A figure's clauses apply to **groups** of dancers, selected by predicate rather than by index — with the
same exception §3.4 records for formations that have a fixed orientation, where a property may exist that
only absolute position can name.

The vocabulary is derived from evidence rather than invented. Clustering every dancer in every existing
figure by "performing an identical path once rotational symmetry is removed" gives:

| Formation | Figures | Distinct behaviours | Distinguished by |
|---|---|---|---|
| Rueda | 48 of 51 cases | **2** | `role` alone |
| Línea Moderna | enchufla, vacilala, adios, leader's enchufla, dame grande, dame pequeña | **4** | `role` × `ring` |
| Rueda → Línea entries | línea moderna, dame línea, adios línea | **4** | `role` × `parity from the Cantante` |

**A dancer is described by named axes, each with named values, and `select` is a map of axis to value.**

```
select: { role: leader, ring: outer }
select: { parity: odd }
select: { role: follower }
```

An omitted axis matches every value of it, so `{ role: follower }` is every follower. A group is the
conjunction of what is written.

**`role` exists in every formation:**

| Axis | Values | Meaning |
|---|---|---|
| `role` | `leader`, `follower` | Every formation has it, and no formation declares it. |

**`parity` exists wherever the formation says how its couples are counted:**

| Axis | Values | Meaning |
|---|---|---|
| `parity` | `odd`, `even` | The parity of a couple's **distance from the Cantante** (§3.1). The Cantante's own couple is at distance `0` and is therefore **even**. |

**How distance is counted, and which formations offer `parity` at all, is specified in
`FORMATIONS.md §2.6`** — one place rather than two that can drift. In summary: distance is the **shortest
slot path**, and **today only the Rueda offers the axis**. A figure naming `parity` in a formation that
does not offer it is refused at definition time.

That is a narrower claim than an earlier draft of this section made, and the narrowing was earned. Parity
is *computable* in any formation whose slots are connected, but computable is not the same as meaningful:
in Línea Moderna the count comes out cleanly and sorts the couples into groups no figure would ever want
(`FORMATIONS.md §3.2` works it through). An axis that is offered wherever it can be evaluated is an axis
that means something different in every formation, which is the opposite of what §3.5 is for.

**Every other axis is declared by the formation** (`FORMATIONS.md §2.6`), which names the axis, lists its
values, and says which slots take which value. Línea Moderna declares `ring`, with values `inner` and
`outer`. A formation with a five-slot sub-wheel declares an axis with five values and nothing in the
engine changes.

**Naming the axis is not ceremony, and the alternative was considered.** `select: { leader, outer }` — bare
values, the axis inferred — is shorter, and it was rejected for three reasons. It requires every value
ever declared by any formation to be globally unique, so one formation's choice of the word `inner` for
one kind of distinction silently forbids another's use of it for a different one. It hides what kind of
distinction is being drawn, so a reader must know the formation to read the figure. And it gives tooling
a set where an axis map would let it diff, validate and complete. The verbosity buys all three back, and
it costs the author nothing, because either form requires the formation to declare its axes in full.

**Primeros and segundos are names, not selectors.** The two groups that enter Línea Moderna are called
the primeros and the segundos here and on any dance floor, and both words stay in use — as **group `id`s**
and in prose. What they are not is anything the engine resolves: there is no `parity: primero`, and no
formation declares them.

There is no formation that could. Línea Moderna does not offer `parity` at all, and a plain Rueda dancing
a Dame has no primeros in it — the split exists in the Rueda *at the moment of entering Línea Moderna*,
which is a figure's business rather than a formation's.

So the two jobs separate, and each is done by the field that suits it:

```
  - id: primeros                    ← what these dancers are called
    select: { parity: even }        ← which dancers they are
```

The selector carries the meaning and is checked. The `id` carries the name and is documentation: §4.2 asks
only that it be unique within its figure, so `priority` and `encounters` can refer to it, and the engine
never looks inside it. Because it has no meaning, **nothing has to declare it, nothing has to keep it
unique across figures, and two figures may use the word differently without colliding** — none of which
would be safe if it were vocabulary.

**Axis names are unique within a formation, and need not be unique across formations.** Two formations may
each declare a `ring` axis with values `inner` and `outer` meaning different things, and nothing collides,
because every use of an axis name resolves against exactly one formation. Which formation is fixed by
where the name appears:

| Where the name appears | Resolved against |
|---|---|
| `select` — which dancers a clause governs | **the formation the figure starts in** |
| a destination address, and any axis it names | **the formation the figure ends in** |
| a `passes` feature address, in a figure that stays in one formation | that formation |
| a `passes` feature address, in a figure that crosses formations | **the formation the figure starts in** |

The last row is a **tie-break, not a derivation**, and it is worth being honest about why it is needed. A
figure that changes formation touches two vocabularies, and during the hop the two genuinely overlap: a
dancer mid-transition is cleanly in neither formation, and an axis name that both formations declare —
two may each declare `ring` — would have two readings with nothing to choose between them. The rule picks
the starting formation because that is the arrangement the author was looking at when they wrote the
clause, and the one that exists when the figure begins.

It is a genuine limitation rather than a neutral choice: a figure that needs to pass a feature named only
by the *ending* formation cannot currently say so. §3.10 records it.

A figure naming an axis the relevant formation has not declared is refused at definition time, naming
both.

The set of axes is **designed to be extended**. A new formation may need a distinction none of these
express, and adding one must not disturb any existing definition — which is exactly what naming the axis
guarantees.

**For a figure that changes formation, group predicates are resolved against the formation it starts
in.** The choice of who does what is made before anybody moves, so the starting arrangement is the one
that has to answer it.

### 3.6 Movements, and whether a dancer is bounded

Each group's clause states **one movement**, and every movement is of one of two kinds:

| `kind` | Meaning |
|---|---|
| `progression` | The dancers travel. They have a corridor, computed as in §3.8, and they take part in collision avoidance. This document is about these. |
| `scripted` | The dancers dance a **scripted movement** — prescribed choreography from the scripted movement library, whose shape is authored as a curve rather than derived from a corridor. **In scope, but never deformed**: see below and §13. |

**There is no third kind for standing still, and there was one until this design had a default for
`bounded`.** A group that does not move is now said one of two ways, and *which* one the author picks is a
real decision rather than a formality:

- **a progression whose destination is the slot it started on** — the dancers hold their place, but they
  are travellers with a zero-length corridor, so they take part in avoidance and will step aside for
  somebody who needs to pass;
- **a scripted movement that stays on the spot** — the dancers hold their place and are immovable, so
  everybody else routes around them.

A `still` kind could only ever have meant one of those, and it never said which. Both are genuinely
wanted, so the choice belongs to the author, in a vocabulary that already exists rather than in a keyword
that hides the question.

**Scripted movements are a separate class from progressions, deliberately.** A progression's shape is
*derived* — it falls out of a corridor, which falls out of the declarations. A scripted movement's shape is
*authored* — a bow is a drawn curve and there is no corridor that would produce it. Merging the two would
mean giving the declarative language enough power to describe an arbitrary curve, and that power would
then be present in every progression definition, which is where it would do harm: the figures that most
need to be simple to author are the ones the extra vocabulary would complicate. So the two stay distinct,
and share only the header they genuinely have in common — a name, a `from`, a `to`, a beat length, and
groups.

**A scripted movement is never deformed to avoid a collision, and this is a consequence of the model rather
than a rule that has to be enforced.** A scripted movement is expressed **in its unit's own frame** (§4.6).
When the unit deviates, the frame moves and the scripted movement rides on it unchanged — there is no
representation in which it could be bent. What the engine needs from one is only what §13 specifies: its beat
length, and each dancer's position over time within that frame.

**A scripted group never yields.** Contention between a scripted group and a progression is resolved entirely
by the progression, whatever the corridor lengths say — priority does not apply. Contention between two
scripted groups cannot be resolved by anyone, so it is a **fault**, reported with both groups named
(§10). It is never quietly left to overlap.

Independently, each group carries **`bounded`**:

- **bounded** — this figure requires these dancers. No concurrent figure may claim them.
- **unbounded** — this figure's instruction for them is a default that a concurrent figure may
  replace.

**Every group is bounded unless it says so.** There is no kind-dependent default: a scripted group is as
bounded as a progression until the author writes `bounded: false`. Unbounding is a deliberate act, stated
once and visible in the definition — which is what a reader needs, because an unbounded group is the one
place a figure stops being a complete description of what happens.

The author is asked to confirm every `bounded: false`, because a group nobody may claim and a group
anybody may claim look almost identical in the data and read very differently on the floor.

The combination is more useful than it first appears. A group may be a **progression and unbounded** at
once: its dancers have a defined transition that exists only to keep the arrangement consistent, and a
concurrent figure is welcome to move them somewhere else instead. Dame Dos Pequeña's followers are
exactly this — they cross their own slot to the place the arrival position puts them in, which keeps the
arrangement consistent, and nothing about the figure depends on them doing it (§4.7).

How a claim is resolved when two figures want the same dancer is specified in `SCHEDULING.md`.

### 3.7 Features, and how much room they take

A **feature** is something a corridor is declared to pass on one side of. Two kinds:

| Feature | Its own radius `r` |
|---|---|
| **A place** — where a dancer stands (§3.2) | `w/2` |
| **An abstract point** — the midpoint of a named wheel, or the midpoint of a slot; nobody stands on either | `0` |

A **slot's midpoint** is the point a couple straddles — the centre of the two places their slot-position
puts them in. Nobody occupies it in any slot-position, which is why its radius is `0` like a wheel's
centre, and it is a feature a dancer routinely travels around: a follower changing lanes within her own
slot goes round one side of it or the other, and which side is the whole of what the author is saying.

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

**Nothing is a feature until a clause declares it.** A wheel's midpoint that no `passes` clause names
imposes no keep-out and is not an obstacle. It is a coordinate, not a thing — nobody stands on it — and a
corridor may run straight through it. Dame Eñe's inner leaders do exactly that (§4.7): their route from an
inner slot to the outer slot of the same pequeña is a half circuit of a two-slot wheel and therefore
passes through that wheel's centre, and the definition declares no pass because there is nothing there to
pass.

The distinction this rests on is worth stating plainly, because getting it the wrong way round makes every
abstract point look like an obstacle: **keep-out is about declarations; collision is about dancers.** A
place with somebody actually standing on it is a collision concern whether or not anyone declared it
(§6), because there is a body there. An abstract point never is, however central it looks.

**A declared feature is avoided for the whole figure, whether or not it stays occupied.** A place declared as an
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

**A declaration constrains the side; it does not oblige the path to go near the feature.** If the shortest
route already passes a feature on its declared side without touching the inflated radius, the feature
contributes no curvature and the path is exactly what it would have been unconstrained. If the shortest
route would pass on the wrong side, the taut path is instead the shortest route that passes on the
declared side, running tangentially around the inflated radius to get there.

**Whether a feature binds is asked afresh at every couple count, and the answer is never written back into
the definition.** Nothing is ever discarded for failing to bind. Dame Dos declares a side against its
wheel's midpoint: at six couples the route clears the centre comfortably on that side and the declaration
costs nothing, while on a two-couple wheel the same declaration is the only thing saying which way round
the centre the dancer goes. A declaration dropped because it did not bind at the count it was authored at
would take the figure's meaning with it at every other count. So the definition holds every declaration
the author made, and each is evaluated against the geometry actually in front of it.

The engine determines the order in which features are actually met and re-orders the declaration silently
if the author listed them differently; the engine is authoritative about encounter order.

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

    W = max(c_start, c_travel, c_end, c_scripted) + 2w

where `c_scripted` is the greatest partner separation reached by any scripted movement the couple dances on
the way (§4.6), and is absent when they dance none.

**Static-feature keep-out uses this full conservative width, for a couple exactly as for a solo dancer.**
It is not evaluated per dancer. That is what keeps the keep-out **precomputable without any collision
detection at all** — it is a function of the declarations and the formation, and nothing else (§3.9) —
and it is what makes one rule serve both kinds of travelling unit. Collision between *dancers* is a
different question, decided per dancer in §6; keep-out against static features is decided here, once,
conservatively. No figure is presently known for which the conservatism costs anything; if one is found,
this is the decision to revisit, and §3.10 records it as a known bound.

A corridor is a constant-width object by definition, so this is deliberately conservative rather than
tapering the corridor to follow the transition. Tapering would make width a function of time, which every
downstream check — overlap screening, feature keep-out, the S4 deviation test — would then have to
account for, and it would buy a little tightness at two moments of a figure in exchange for complicating
all of them. If a figure is ever found where that tightness matters, this is the decision to revisit.

#### A unit deviates about one point, and its contents ride on it

When a dancer must leave their corridor to clear somebody (§6), what moves is the travelling unit's
**reference point** — for a couple, the couple's midpoint; for a solo dancer, the dancer. Everything the
unit is doing at that moment is expressed relative to that point and is carried unchanged: partners keep
their separation, a couple keeps its orientation, and a scripted movement danced on the way (§4.6) keeps
its shape.
**Nothing inside a unit is ever displaced on its own.**

The solo case is that same rule with one member, not a special case of it. A lone dancer's reference point
is their own position, so "the reference point deviates" and "the dancer deviates" say the same thing, and
an implementation needs one mechanism rather than two.

This is what reconciles the two halves of the collision model:

- **Detection is per dancer**, at each time sample, using each partner's actual position including
  whatever scripted movement they are dancing. A couple is not a disc, and treating one as a disc is how the Adios
  Pequeña overlap in §2.5 stayed invisible.
- **Resolution is per unit.** A couple that avoided somebody by pulling its partners apart would not be a
  couple avoiding somebody; it would be a couple pulled in half, which is the exact defect §2.5 records
  under *units, not dancers*.

**Two corridors overlapping means a collision is *possible*, not that one occurs.** Because a corridor's
half-width is the dancer's own radius, two corridor centrelines closer than `w` means two bodies could
touch — which is exactly the condition worth screening for. Whether they *do* depends on whether both
dancers are in the shared region at the same time, which is decided in §6.

### 3.9 The property everything rests on

> **A corridor is a pure function of the formation, its placement, the couple count, the wheel's phase,
> and the figure's declarations.**

It does not depend on collisions, on what any other dancer is doing, or on what else is being danced
concurrently. Compute it twice and you get the same answer; compute it during someone else's figure and
you get the same answer.

Everything on the left of that sentence is **known before anybody moves and does not change while they
do**. That is the property that does the work — not that the list is short. Placement and phase are on it
because a figure crossing into a formation with a fixed orientation (`FORMATIONS.md §2.7`) has to sweep
the dancers round to meet it, and how far depends on where the wheel was standing and which of its two
phases it was resting in. Neither is affected by anything the engine is trying to solve.

Every benefit claimed in this document follows from that one property:

- a path has a shape to return to after avoiding someone, so avoidance cannot leave residue
- a declared side is a property of the corridor rather than an input to a solver, so it cannot be outvoted
- a corridor can be drawn, reviewed and signed off before any collision is considered
- concurrent figures can each compute their own corridors without reference to one another

Neither previous attempt had it (§2.4). If an implementation choice would make a corridor depend on what
other dancers do, that choice is wrong, whatever else recommends it.

#### One definition, several instances

A figure definition is not one corridor. It is one corridor **per set of starting circumstances**, and
every one of them is generated, verified and reviewed.

This is already true and already accepted for **couple count**: a definition written once produces a
different corridor at four, six and eight couples, and the verification corpus holds all of them (§14).
**Phase is a second axis of that same product, and placement a third.** Nothing about the definition
changes; the number of instances resolved from it does.

The rule:

1. **Resolve one instance per distinguishable starting circumstance** — couple count × starting phase,
   within the formation position the definition is keyed by (§4.1).
2. **Compare them, and collapse the ones that are identical** up to the formation's own symmetry. Almost
   everything collapses, and for a reason worth stating: every address in this language is *relative*, so
   a figure is phase-independent unless something **absolute** enters it. Today exactly one thing does —
   a hop into a fixed-orientation formation. Every other figure in the corpus resolves to one instance
   per couple count, exactly as now.
3. **Assert how many instances survived**, in the suite. A definition that was expected to have one
   behaviour and turns out to have two has either found something real or been written wrongly, and both
   are worth being told about. This is §2.5's argument about candidate-set size in a second place: a
   number that describes the size of what was checked is itself worth checking.
4. **The engine selects the instance at call time by matching the circumstance.** The author never
   selects, and cannot: which phase the wheel is resting in when a call is made depends on the whole
   sequence danced up to that moment, which is not knowable when the figure is written.

**Every instance must resolve.** It would be possible to allow a figure that is danceable from one phase
and not the other — the machinery above would express it without changing — but **no such figure is known
and none is supported**. A definition whose instances do not all resolve is a failure, reported as one
(§10). If a real figure ever turns out to be phase-restricted, this is where it is admitted, deliberately,
with the case in front of us; until then, admitting it in advance would be inventing a rule with nothing
to test it against.

**Overrides (§4.5) belong to the definition, not to an instance**, and apply to every instance that has
the encounter they name. Where an override is needed in one instance and not another, it is qualified by
circumstance — and the engine already warns when a stored override matches in one place and has moved in
another, which is the same machinery §4.5 describes for `nth`.

### 3.10 Known bounds of this language

Stated so they are recognised as deliberate limits rather than discovered later as defects.

- **A pass-side selects between exactly two routes**, so it can express up to one turn around a feature.
  Windings of a full circuit or more come from the offset instead (§3.4), unreduced. Neither expresses
  something like one and a half turns around another dancer — and that is deliberately *not* a gap to be
  filled here. A figure of that kind is choreography, not avoidance, and collision resolution is the wrong
  instrument for producing it. It would be modelled as a scripted movement together with a position the
  dancers move into and out of. If such a figure is ever wanted, it is specified then.
- **Scripted figures are in the model but are never reshaped by it.** Their shape is authored, not
  derived; the engine reads it, collides against it, and never bends it (§3.6, §13). Two scripted groups
  that contend cannot be separated by anyone, so that is reported as a fault rather than resolved.
- **A `passes` feature in a formation-crossing figure can only name the starting formation.** §3.5's
  tie-break resolves an ambiguity rather than expressing a preference, and there is currently no way to
  declare a pass against a feature the ending formation names and the starting one does not. Nothing
  written so far needs one.
- **Two formations joined by a hop share a centre.** `align` (§4.3) pins the ending formation's rotation
  about a centre both formations are assumed to have in common. Every formation that exists, and every one
  presently foreseen, is centred on the same point — sub-wheels move about freely, the formation as a whole
  does not. A formation whose centre genuinely differed would give `align` a second thing to pin, and this
  is the assumption to revisit when one appears.
- **Static-feature keep-out is conservative for couples.** It uses the corridor's full width rather than
  each partner's own position (§3.8). Nothing known costs anything for this; it is listed so that a figure
  which does is recognised as the trigger to revisit, not as a defect.
- **A group predicate cannot yet name an arbitrary subset.** Only a conjunction of axis values (§3.5).
  This is a floor derived from evidence, not a ceiling; a new formation declaring a new axis extends it
  without disturbing anything already written.
- **Facing cannot cause a failure.** It is cosmetic: a dancer's footprint is a circle regardless of which
  way they look. Orientation of a *couple* travelling as one object is not cosmetic — it sets the
  footprint — and is declared (§4).

---

## 4. The figure definition language

A figure definition is **data**. It contains no code, no coordinates and no couple counts. Everything is
stated relative to where each dancer starts, so one definition serves every couple count the formation
supports.

The notation below is illustrative — an implementation may serialise it however it likes — but every field
shown is required, and no field not shown exists.

### 4.1 A figure

```
name:        the figure’s name — NOT unique on its own; see `(name, from)` below
from:        { <formation>, <position> }  where the figure starts
to:          { <formation>, <position> }  where it ends
beats:       how long it lasts, a constant for THIS definition
groups:      one or more group clauses, each stating one movement   (§4.2)
priority:    optional  — overrides the derived yielding order   (§4.5)
encounters:  optional  — overrides for individual collisions    (§4.5)
```

`from` and `to` are **formation positions** (§3.3), each naming its formation as well as its position, and
`to` is what derives every dancer's landing slot-position. No group clause ever restates it: one source of
truth, so the two cannot drift apart.

**Naming the formation is what makes a formation change visible in the header.** `Dame Línea` reads

```
from: { Rueda, Casino }        to: { Línea Moderna, Exhibela }
```

and a reader can see at a glance that it crosses formations and therefore hops (§4.3). A figure that stays
put repeats its formation on both sides, which is not noise — it is the statement that it stays put. This
also retires the `LM ` prefix the earlier drafts used: `Exhibela` means one arrangement in a Rueda and a
different one in Línea Moderna, and the pair says which without a naming convention to remember.

**`(name, from)` is the key.** A figure's name together with the formation position it is danced from
**uniquely identifies one definition**. The same name may therefore have several definitions — a Dame from
Casino and a Dame from the Dile Que No position are one word to a caller and different geometry to the
engine — and the pair is the index the engine looks up when dancers standing somewhere are told to dance
something. **No definition set may contain two entries sharing a `(name, from)`.**

**`beats` belongs to the definition, and definitions sharing a name may differ.** Today's Dame lasts two
beats from Casino and four from Exhibela, and nothing requires them to agree. A shorter figure simply
**starts later**: a call's start beat is back-timed from the length of what it schedules
(`SCHEDULING.md`), so a figure of any duration can still be made to finish on the beat it needs to. There
is no rule tying a figure's length to its name, to its formation, or to anything else.

*(This document does move the Dame family to a uniform four beats — §1.4 — but that is a decision about
those particular figures, taken because it quarters the severity of their turns. It is not a constraint the
language imposes.)*

Because a figure may govern only some of the dancers, `to` is a claim about **the slots this figure
touches**. Whether the formation as a whole is left in a valid state, when something else is running
alongside, is checked in `SCHEDULING.md`.

### 4.2 The group clause

```
id:           a name, so other clauses can refer to this group
select:       which dancers                     (§3.5)
unit:         dancer | couple                   default: dancer
kind:         progression | scripted            (§3.6)
bounded:      true | false                      default: true

  — when `kind` is `progression` —
destination:  a slot address, or walk-hop-walk when the formation changes   (§4.3)
passes:       an ordered list of pass declarations   (§4.4)
facing:       a facing rule       optional; default: the direction of travel   (§4.6)
extra turns:  whole extra revolutions, and which way   optional   (§4.6)

  — when unit is `couple` —
separation:   linked | closed | open            default: the separation of the `from` slot-position
repeating:    a scripted movement, or an ordered series of them, danced in the travelling frame  (§4.6)

  — when `kind` is `scripted` —
scripted:     names a scripted movement in the library
```

`select` is a map of **axis to value** (§3.5), and an omitted axis matches every value of it.
`{ role: leader, ring: outer }` is the outer leaders; `{ role: follower }` is every follower. `ring` and
its values are **declared by the formation** (`FORMATIONS.md §2.6`), not keywords of this language — a
formation that draws no such distinction simply does not offer the axis, and a figure naming an axis its
starting formation has not declared is refused at definition time.

**A figure mentions every dancer on the floor.** Not only the ones it moves — every one. A figure whose
clauses do not between them select every dancer is **refused at definition time**, naming the dancers no
clause reached.

That is stricter than it needs to be for the engine and exactly as strict as it needs to be for the
author. A dancer left out on purpose and a dancer left out by accident are *identical in the data*, and
no amount of asking at authoring time survives the figure being edited a year later by somebody else. So
silence is not a way of saying anything. A group the figure does not want to move is written out, with
what it should do if nothing else claims it:

```
  - id: followers
    select:      { role: follower }
    kind:        scripted
    scripted:    hold
    bounded:     false
```

— which says, in one place a reader can find, *these dancers hold still, and any figure running alongside
is welcome to move them instead*. **`bounded: false` is how a figure gives dancers up**, and it is now the
only way, so the set of dancers another figure may claim is readable from the definition rather than
inferred from what is missing.

### 4.3 Addresses

Everything an author can point at is addressed **relative to the dancer's own starting slot** — which is
what lets one definition serve every couple count, and is what every figure should be written to.

The exception is the one §3.4 and §3.5 record. A formation with a fixed orientation has places that are
genuinely distinguishable in absolute terms, and a figure written into, out of, or within such a
formation may have to name them that way. The language does not forbid it; it makes it visible, and
everything that follows is written for the relative case because that is the case that scales.

The structure being addressed is defined in **`FORMATIONS.md`**, which this document depends on. In
summary: a formation is a set of **named wheels**; a **slot** may belong to any number of them; and no slot
belongs to two wheels sharing a name. Names such as `grande`, `pequeña`, `inner` and `outer` are
**declared by the formation**, not by this language.

**A slot address is a walk** — an ordered sequence of **traversals**, each naming a wheel and an offset,
applied from the dancer's own slot:

```
[ (wheel name, offset), (wheel name, offset), ... ]
```

Each traversal **resolves its wheel name against the slot the previous one left you on**. Because no slot
belongs to two wheels of one name, the resolution is always unique — and the same word can denote a
different wheel at a different point in the walk, which is what makes overlapping structures navigable.

Worked example, in Línea Moderna, starting from an outer slot — *the inner slot of the pequeña wheel one
place clockwise*:

```
[ (pequeña, +2), (grande, +2) ]
```

Offsets are counted in half-slots on every wheel, so one whole slot clockwise is `+2` — see below. The
second step resolves `grande` to the **inner** grande wheel, because that is the only wheel of that name
containing the slot the first step landed on.

**Every intermediate step must land on a defined slot.** A point between slots has no wheel membership, so
the next traversal would have nothing to resolve against.

**Offsets are counted in half-slots, on every wheel, always.**

A wheel of `k` slots has `2k` half-slot positions numbered around it, and its slots occupy every other
one. An **even** offset therefore lands on a slot of the phase the dancer set off from; an **odd** offset
lands on a slot of the other phase. One whole slot is `+2`, on
every wheel.

**The unit does not vary with the wheel, and in particular it does not vary with whether the wheel has
phases.** A wheel without phases is not counted in whole slots. It is counted in half-slots like every
other wheel and simply has no valid destination at an odd offset. This is a decision about *reading*: an
author comparing two figures across two wheels must be comparing two numbers in the same unit, and a `-4`
that means a full circuit on one wheel and a half turn on another is a trap no amount of care avoids.

**The engine enforces the consequence; the author is never asked to.** A figure whose offset would land
a dancer in a phase their wheel does not have is **refused when it is defined**, naming the group, the
wheel and the offset. How that check is implemented — testing the parity of the offset, or anything else —
is an implementation matter, and no part of this language exposes it. What the author is owed is three
things, and only these three:

1. They can **name the exact slot they intend**, unambiguously.
2. They can **see which wheels do and do not permit a phase change**.
3. They **cannot write a figure that leaves a couple in an invalid position** without being told, with
   the reason.

`FORMATIONS.md §2.4` states the same rule from the formation's side.

#### Crossing formations: the hop

A walk cannot leave the formation it starts in. The ending formation's wheels are not the starting
formation's wheels — at six couples Línea Moderna's `grande` wheels hold three slots each where the
Rueda's holds six — so a walk written in one does not name a slot in the other. A figure that changes
formation therefore addresses its destination in three parts:

```
destination:
  walk:  <a walk in the starting formation>     optional
  hop:   <the formation pair>                   present only when the formation changes
  walk:  <a walk in the ending formation>       optional
```

A figure that does not change formation writes the first walk alone, which is every address described
above.

**A hop is a correspondence between the slots of two formations.** It is a stored object in its own right
— neither a formation nor a figure — keyed by the ordered pair, declared once, and used by *every*
figure that crosses between those two formations. It knows nothing about dancers, partners, travel,
timing or phase.

```
hop  Rueda → Línea Moderna
  from:   { parity: even }      which slots of the starting formation may be hopped from
  to:     { ring: outer }       which slots of the ending formation they correspond to
  align:  spoke                 how the two formations sit relative to one another
```

**`from` is a predicate, in the same vocabulary as everything else.** It may name **axes of the starting
formation** (`{ ring: outer }`, going the other way across this same hop) and it may name **axes of where
the dancers currently stand** (`{ parity: even }`, which is measured from the Cantante and so belongs to
the arrangement rather than to the floor). It may name both at once. That combination is the point:
*which slots may be hopped from* is sometimes a fact about the formation and sometimes a fact about who is
standing in it, and the hop should not have to care which.

What a `from` predicate actually fixes is **how many slots hop and how they are spaced**. `{ parity: even }`
in a Rueda names alternate slots — half of them, two half-slots apart — and that shape is what the checks
below test against.

**The parity written is a representative, not a constraint.** Because a from-set is satisfied by any rigid
rotation of itself (step 3 below), `{ parity: odd }` would denote exactly the same shape, and `Línea
Moderna` in fact hops its segundos, who are at odd distances from the Cantante. Write whichever reads
better; the hop is not choosing sides between them, and the figure is what decides who arrives.

**`to` names its slots by any property of the ending formation** — an axis value, membership of a named
wheel (`{ wheel: grande }`), or a conjunction of those. The language is deliberately incurious about which:
the set of slots a hop lands on — its **spine** — is not made one by being outer, or front, or grande. The
only thing that matters about a `to` set is that it has as many members as the `from` set and maps to it
1-1, and that is checked rather than declared.

**What `to` may not name is a positional property, and `from` may.** That asymmetry is not a restriction
chosen for tidiness; it is forced. `parity` is counted clockwise from the Cantante, and in the ending
formation *which slot the Cantante occupies is exactly what the hop is being used to compute* — so a
positional axis in `to` would be circular. In `from` there is no such problem: the dancers are standing in
the starting formation, and their positions relative to the Cantante are known before anybody moves.

**`align` says how a `from` slot is paired with a `to` slot, and thereby where the ending formation
sits.** Both formations share a centre — a standing assumption, recorded in §3.10 — so the ending
formation's only free parameter is its rotation about that centre.

| `align` | Means |
|---|---|
| `spoke` | A `from` slot corresponds to the `to` slot whose spoke is first met by turning the `from` slot's spoke **clockwise** about the shared centre. |

**The pairing is geometric, and no dancer takes part in it.** It is a relation between two sets of spokes.
Nothing in it refers to the Cantante, to parity, or to who is standing where — which is what makes one hop
serve every figure between the two formations, whoever happens to be dancing it.

**Three separate questions get asked here, and only the middle one belongs to `align`.** They are easy to
run together, so:

| Question | Answered by |
|---|---|
| *Which positions may be hopped from?* | the hop's `from` — a count and a spacing |
| *Which `to` slot does a given hopped-from position become?* | the hop's `align` — a relation between spokes |
| *Which dancers end up on those positions?* | the **figure**, through its `select` and its walk 1 |

The third is the figure's business entirely, and it is why one hop serves several figures. `Línea Moderna`
sends its segundos to the hop-able positions; `Dame Línea` sends four different groups to them. The hop is
unchanged, because it never knew who was coming.

The middle question is the one that must not depend on dancers, and in an earlier draft it did: the
pairing was ordered *"clockwise from the Cantante"*, which gave a correspondence between two floors a
dependence on a person, and would have made the same hop mean different things on different nights.

**The rotation is a single number, shared by every pair, and that is the check.** Because `from` fixes an
evenly-spaced set and `to` is evenly spaced too, one clockwise turn carries the whole of **H** onto the
whole of the `to` set at once. Every pair must agree on it. A figure whose walks are wrong shows up here
as a sweep that lands some pairs and not others.

**How large that turn is depends on whether the ending formation may be rotated:**

- **Free rotation** — the ordinary case, and every formation built only out of wheels. The engine places
  the ending formation so the turn is **zero**, and the two sets of spokes coincide. This is what makes
  "the segundos' spokes become the formation's spokes" true of `Línea Moderna` without anybody declaring
  it, and it is why the reverse transition lands a Rueda on whatever spokes the Línea was standing on.
- **Fixed rotation** — a formation with a declared absolute orientation (`FORMATIONS.md §2.7`), because it
  is danced to an audience and has a right way round. Its spokes are known before the hop is evaluated, so
  the turn is whatever the geometry gives, anywhere in `[0°, one slot)`. The dancers really do sweep
  round by it, and that sweep is part of what the figure has to travel.

`spoke` is the only member of this vocabulary today, and it now covers both cases rather than only the
first. `align` is still **expected to grow**: a formation needing a different relationship gets a new name
here with one sentence saying what it pins. It is never extended by writing geometry into a figure.

**Clockwise, always, and not "whichever is nearer".** The sweep direction is fixed so the answer is
deterministic. Taking the nearer of the two directions would flip the entire correspondence on a tie, and
a tie is exactly what a symmetric formation produces.

**Clockwise is a default inherited from one worked example, not a property of hops.** Two Lines was
worked out from a routine in which the rueda it is entered from happened to be progressing clockwise, so
continuing clockwise was the sweep those dancers were already halfway through making. Nothing says a
formation must be entered that way, and one entered from something travelling the other way would want the
opposite. `align` would then take a second member — an anticlockwise spoke sweep — with no other change to
any of this. Today `align: spoke` means clockwise; that is where the vocabulary has got to, not a
principle it rests on.

**Which rotation of `from` a figure uses is the figure's business, not the hop's.** `from` fixes the
*shape and the count* of the hop-able set; a figure fixes which rotation of that set it uses, and that
choice is the ordinary phase question (§3.1) wearing different clothes. Two real figures make the point:

- `Línea Moderna` hops its segundos from where they stand, so the hop-able positions are the segundos' own
  slots — "the segundos' spokes become the formation's spokes".
- `Dame Línea` crosses the same pair of formations, but its new spokes "sit midway between each primero's
  spoke and the segundo's one couple clockwise". Its hop-able positions are that same set turned by one
  half-slot, and at rest nobody stands on them.

One hop serves both. Forcing a hop to name a phase would need two hops for one pair of formations, and
they would say the same thing twice.

**This holds even when the two phases produce genuinely different corridors**, which they do for a hop
into a fixed-orientation formation: the sweep differs by half a slot, so the dancers travel differently.
That difference is real and must be verified, but it is not a difference in the *correspondence* — the
hop pairs the same spokes by the same rule either way. It is a difference in what the figure resolves
to, and §3.9 handles it as one definition with several instances.

**What the engine checks, in order.** Each failure is named and refused — at definition time where it can
be, otherwise at the couple count that breaks. None is a warning.

1. Take every hopping dancer's position at the end of walk 1, on the starting formation's half-slot grid.
   Call the distinct positions **H**.
2. The size of **H** must equal the number of `to` slots at this couple count. A hop that cannot be 1-1 at
   some couple count makes the figure invalid at that count and leaves the others untouched.
3. **H** must be **one rigid rotation of the `from` set** — the same count at the same spacing, offset by a
   single whole number of half-slots. Every hopping dancer must agree on that offset, or the figure is
   refused naming the ones who disagree.

   *This step is a property of `align: spoke`, not of hops in general.* A rigid rotation is what a
   spoke-to-spoke correspondence needs, because a spoke sweep moves every member of the set by the same
   angle. An `align` that paired slots some other way — sending the even couples to the front line of a
   directional formation, say — would have a different well-formedness condition, and would state it
   where it states what it pins. Steps 1, 2, 4 and 6 hold for any `align`; step 3 and step 5 are
   `spoke`'s.
4. Pair each member of **H** with a `to` slot by `align` — for `spoke`, the `to` slot whose spoke is first
   met turning clockwise. One turn must carry every pair at once; a turn that lands some pairs and not
   others is a refusal, naming the ones it missed.
5. If the ending formation's rotation is free, place it so that turn is zero. If its orientation is fixed
   (`FORMATIONS.md §2.7`), its spokes were already known and the turn is real travel the figure must
   cover.
6. After walk 2, every place of the ending formation position must receive **exactly one dancer**. Per
   place, not per couple: a figure may assemble each arriving couple from two different groups.

Steps 2 to 6 are the whole of "only slots that cleanly map may be hopped from". Nothing there is asserted
by the author, and nothing is taken on trust.

**One hop, used both ways.** The reverse transition swaps `from` and `to`. There is no second object to
write, and therefore no way for the two directions to drift apart.

**A place address** names a point on the floor — where a dancer stands, whether or not one is there:

```
{ role: leader|follower, position: <slot-position>, slot: <slot address> }
```

The **slot-position is always named explicitly** and is never defaulted from the figure's `from` or
`to`. A place is only a point once the arrangement is known — the follower's place in a slot is one point
in Casino and a different point in Exhibela — and there are two plausible defaults, so choosing one
silently is exactly the class of decision that produced the defects in §2.

**An abstract point** names something nobody stands on:

```
{ midpoint: <wheel name>, slot: <slot address> }     the centre of that wheel
{ midpoint: couple,       slot: <slot address> }     the midpoint of that slot — what a couple straddles
```

`slot` is optional in both and defaults to the dancer's own slot. `couple` is a **reserved value** and may
not be used as a wheel name; it selects the slot's own midpoint (§3.7) rather than any wheel's, which is
the point a dancer travels around when they change lanes within a slot without leaving it.

The wheel name is resolved **against the slot named by `slot`**, exactly as a traversal resolves its name
against the slot the previous traversal left it on. With `slot` omitted it resolves against the dancer's
own starting slot, which is the ordinary case: a dancer routing around the middle of a wheel they are
standing in writes `{ midpoint: pequeña }` and nothing more.

**`slot` is required whenever the dancer's own slot is not in a wheel of that name**, and that is not an
exotic case. An outer dancer in Línea Moderna belongs to a `pequeña`, so `pequeña` resolves to their own
and the midpoint of a *neighbouring* pequeña is not addressable from where they stand. The walk supplies
the missing context: `{ midpoint: pequeña, slot: [ (grande, +2) ] }` is the midpoint of the pequeña wheel
one slot clockwise.

A name that resolves to no wheel from the slot given is **an error at definition time**, naming the wheel
and the slot it was resolved from. It is never a silent fallback to some other wheel of that name, because
a fallback would make the same declaration mean different things in different formations.

**An address names a position, not an occupant, and does not depend on which phase the wheel is resting
in.** Because every offset is a half-slot, a walk may land on a position that is *unoccupied right
now* — a position belonging to the other phase — and that position is still named exactly. A wheel
anchored to it exists notionally and is addressable too:

```
{ midpoint: pequeña, slot: [ (grande, +1) ] }
```

is the midpoint of the pequeña wheel belonging to the position **one half-slot** clockwise, which is a
position of the other phase and has nobody standing on it at the moment. It is a perfectly good feature to
route around, and it is the pequeña that will be there the moment the grande wheel changes phase.

**So there is no question of which phase a feature is evaluated in, and the language never has to
answer one.** A slot address pins a position; a place address names its slot-position explicitly (above);
an abstract point resolves its wheel against a pinned position. The geometry follows from those, and from
nothing else. This is what lets §3.7 say a feature is avoided for the whole figure whether or not it
stays occupied — occupancy was never what made it a feature.

### 4.4 Declaring passes

```
passes:
  - { side: left|right, of: <place address or abstract point> }
```

The list is **ordered by the order the dancer meets each feature**, and authors are asked to write it that
way because it is how they think and it saves the engine work. But the engine determines the true encounter
order itself, and **re-orders silently** where the author got it wrong: the engine is authoritative about
what the dancer actually meets and when.

**`side` names the way the dancer goes to get past the feature; the engine checks the complement.** Two
statements of one fact, and both are needed. An author thinks about which way they step, so that is the
word they write. A test needs something measurable that does not require the feature to be facing
anywhere — a wheel's midpoint has no front — so that is what the engine evaluates.

| the author writes | what the dancer does | what the engine checks |
|---|---|---|
| `side: right` | goes past it on the right | the feature stays on the dancer's **left** for the whole pass |
| `side: left` | goes past it on the left | the feature stays on the dancer's **right** for the whole pass |

The check, at every sample of the pass, with `heading` the dancer's own direction of travel:

    sign( cross( heading, feature − dancer ) )

The engine's frame has **y increasing downward**, which is what makes clockwise — the direction couples
are numbered (§3.1) — the direction of increasing angle. In that frame a **positive** cross means the
feature is on the dancer's **right**. So `side: left` requires a positive cross throughout the pass, and
`side: right` a negative one.

**This is already the engine's convention**, written there as `PASS_SIGN = { left: +1, right: -1 }` — "the
side of the OTHER dancer that you travel along". The corridor language does not give these two words a
second meaning: §4.5's encounter overrides are dancer against dancer and use the same rule, and so does
`PASSING.md`. One vocabulary, one test, everywhere.

The declaration is not an instruction to go *near* the feature. A feature the taut path already clears on
the declared side contributes no curvature (§3.8); the constraint is on which side, not on how close.

**A declaration is never discarded, however little it does at the couple count in front of it.** A side
that binds only at some counts is free everywhere else and load-bearing where it binds, so an author
should declare one wherever the answer would matter at *any* count the formation supports, and the engine
keeps every declaration for the counts at which it does. This is the opposite of an optimisation: pruning
a declaration that does nothing today is how a figure silently changes meaning the first time it is danced
by a different number of couples (§3.8).

**Passes are declared against static features only** — places and abstract points. A pass against another
*moving* dancer is not a pass declaration; it is a collision, and collisions are governed by priority and
by the encounter overrides in §4.5. This distinction is the heart of the design: the static declarations
determine the corridor, and the corridor is a pure function of the formation (§3.9). Allowing a moving
dancer into that list would destroy that property.

### 4.5 Priority and encounter overrides

Both are **overrides**. Both are absent from a definition unless the derived answer is wrong.

**How much of this survives is an open question, and the migration is what answers it.** The whole of §4.5
exists because the derived answers might not always be right. If, once the corpus of §14 is built, the
defaults turn out to resolve every collision the shipped figures produce, then priority and encounter
overrides are machinery nobody uses and should be **removed rather than kept in case**. The migration is
the experiment: every override an author actually has to write is evidence the defaults are incomplete,
and a count of zero is evidence they are not. Whichever way it goes, the count is worth recording rather
than the feature being kept out of caution.

**Priority** decides who yields when two dancers contend. The default is derived: **the dancer with the
longer corridor holds their route, and the shorter one yields**, on the reasoning that the longer path has
more room to absorb a detour. Corridor lengths within `Δ_len` of each other are treated as equal, and equal
corridors yield **50/50** — each moves half as far as it otherwise would.

```
priority: [ <group id>, <group id>, ... ]
```

**A ranking may be partial, and a partial ranking is read narrowly.** It decides a contention only when
**both** contending groups appear in it, and then the higher-listed group holds its route. If either group
is absent, the ranking says nothing about that pair and the derived order applies — longer corridor holds.
Ties are not expressible: a group appears at most once, and any two groups in the list are ordered.

Reading it narrowly is what makes it safe to add a group to a figure later. A ranking that silently
governed pairs it did not mention would change the behaviour of every one of those pairs the moment a new
group were listed, which is the action-at-a-distance this document exists to remove. What the author
writes about `a` versus `b` means that, and nothing else.

Every pair the ranking does not cover still has its derived order recorded (*Derived decisions are
recorded*, below), so which pairs the author actually decided is visible in the stored output rather than
inferred from the ranking's length.

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
silent change to figures a human already approved.

### 4.6 Couples travelling as one object

When `unit: couple`, the group's clauses apply to couples rather than individual dancers: one corridor for
the pair, one destination, and a corridor width from §3.8.

```
separation:   linked | closed | open
extra turns:  { turns: <whole number>, direction: clockwise | anticlockwise }   optional
facing:       travel | partner | { toward: <place address or abstract point> } | { formation: up|down|left|right }
repeating:    [ <scripted movement name>, ... ]   optional; danced in order, then from the start
```

**Orientation is physical.** It sets the couple's footprint, and therefore what they collide with. A couple
broadside to its direction of travel needs far more room than one edge-on.

#### Orientation is derived, and the figure may only add whole turns

**A figure does not state how far the couple turns.** It cannot: the answer depends on the couple count,
and a figure definition is independent of couple count by construction (§4).

Línea Moderna is the case that proves it. Its segundos walk straight out along their own spokes and do not
turn at all. Its primeros must arrive 180° from the segundos, having started one slot clockwise away — so
the turn they need is the arrival orientation less the `360/n` degrees their own starting slot already sat
at, and **`360/n` is a couple count**. Written as a constant the figure would be right at one size and
wrong at every other; and a figure whose correctness depends on the number of dancers is exactly what this
language exists to make impossible.

So the engine derives it:

    orientation  =  ( the arrival slot's orientation  −  the starting slot's orientation )
                    resolved clockwise into [0°, 360°)
                 −  whatever the scripted movements in `repeating` have already turned the couple through
                 +  the figure's declared extra turns

Three parts, each earning its place:

- **The first is the whole answer for most figures**, and it is a subtraction the engine can always do,
  because a slot's orientation is a property of the formation (`FORMATIONS.md §2.5`) and both formations
  are named in the header (§4.1). Resolving it clockwise makes it a single defined number rather than a
  choice.

**Clockwise, and deliberately not "whichever way is shorter".** The shorter turn sounds kinder and is a
trap: the difference between two slot orientations depends on the couple count, so a figure whose turn is
170° at one count and 190° at another would have its dancers **rotating the opposite way** at the two
counts, with nothing in the definition changing and nothing to warn the author. A fixed direction is
always predictable — an author knows what they will get before they run anything — and where it is not
what they want, one `extra turns` in the other direction says so. That is a correction made on purpose,
rather than a default that moves underneath them.
- **The second is why `repeating` had to be accounted for here.** A couple carrying a scripted movement is
  already being turned by it. If the arrival demands 270° and an Enchufla danced on the way supplies 180°,
  the progression itself must supply 90°, not 270° — otherwise the couple arrives a half-turn out and is
  quietly corrected at the end. The engine knows what the carried movements turn through, so it subtracts
  it rather than making the author do the arithmetic.
- **The third is the only part an author writes.** `extra turns` adds whole revolutions — nothing else.

**Whole turns, and nothing finer.** `{ turns: 1, direction: anticlockwise }` sends the couple round one
more time on the way; `{ turns: 1, direction: clockwise }` the other way. Because a whole turn returns the
couple to the same orientation, **no value of this field can land the couple wrong**. That is the point of
restricting it, and it is the operation an authoring interface offers: a stepper, not an angle.

**For a single dancer the field means the same thing, and needs no derivation at all.** The arithmetic
above exists because a *couple* has an orientation that must land correctly, and the derivation is what
makes it land. A lone dancer has no orientation — a disc has no front — so there is nothing to derive:
their `facing` rule already says which way they look at every instant, and `extra turns` adds whole spins
on top of it. A whole spin returns them to the same facing, so the arrival is untouched, exactly as for a
couple.

That is also why **a solo dancer may declare `facing` or `extra turns` and not both**: with no orientation
in play, both fields are answering the one question of which way this dancer is looking, and two answers
is a contradiction rather than a combination. A clause naming both is refused at definition time. For a
**couple** there is no conflict, because the two are answering different questions — `extra turns` turns
the couple as an object and is physical, `facing` says where the partners look and is not.

It is also how a figure chooses the *direction* of a turn it would otherwise take the long way round.
Where the derived clockwise turn is 300°, one anticlockwise turn makes it 60° the other way — the same
arrival, a very different dance. `Adios Línea` differs from `Línea Moderna` in exactly this and in nothing
else.

**A couple can no longer be authored into the wrong arrival orientation, and that is deliberate.** The
earlier draft let a figure declare any rotation and interpolated the couple into the correct orientation
at the end if it did not match. That interpolation was a correction rather than a danced turn, it was
always a mistake when it happened, and nothing in the corpus wanted it. Removing the ability to express it
removes a whole class of figure that looks right in the data and wrong on the floor.

**Facing is cosmetic.** A dancer's footprint is a circle whichever way they look, so facing can never cause
a collision and can never make a figure fail. It is declared because it is visible, not because it
matters to the geometry.

**Facing may be declared for a solo dancer too, and defaults to the direction of travel.** The rule with
no declaration is *face the way you are travelling, interpolating to the arrival facing over the end of
the movement*, which is what almost every progression wants. But there is no reason a lone dancer should
be forbidden from looking somewhere else — at the centre of the wheel, at the place they came from — and
the same `facing` vocabulary serves.


#### A couple may dance a scripted movement while it travels

A travelling couple is not obliged to hold still on the way. `repeating` names a scripted movement, or an
ordered series of them, that the couple dances **for the whole duration of the progression** while the
pair as a whole translates along its corridor and turns by whatever `orientation` declares.

```
repeating:  [ <scripted movement name>, <scripted movement name>, ... ]
```

The names come from the same library `kind: scripted` draws on (§3.6). One name is the common case; a
series is danced in order and then begins again from the first.

**The scripted movement is danced in the travelling frame.** The corridor and the declared rotation
together define a frame that moves and turns; the scripted movement's own motion is expressed relative to
that frame and composed onto it. One that stays on the spot and does not turn when danced alone therefore
still travels and still turns when a progression carries it, because the frame does. The author never
restates the travel inside it, and the same scripted movement can be carried by any progression.

**How many repetitions are danced is derived, not declared.** The progression's `beats` decides it. There
is no repeat count in the language, because a count and a duration can disagree and then something has to
lose.

**The progression must end exactly when one of them ends.** Writing `b1 .. bm` for the beat lengths of the
scripted movements in the series and `B = b1 + ... + bm` for one full cycle, the progression's `beats` must
satisfy

    beats = k*B + (b1 + ... + bj)        for some integer k >= 0 and some 0 <= j <= m

— `beats` must land on a cumulative boundary of the series. A definition that does not is **refused when
it is defined**, naming the progression's length, the series and its cycle length, and the nearest lengths
that would be accepted.

The restriction exists so that **the couple's slot-position on arrival is well defined**. A progression
stopping halfway through a scripted movement would land its dancers in a posture that is not a
slot-position at all,
and the arrangement the figure's `to` promises would be a fiction. Refusing is the honest answer; the
two alternatives — truncating the last figure, or compressing the series to fit — both silently dance
something other than what was authored.

**A carried figure widens the corridor.** The figure moves the partners relative to their midpoint, so
the pair's footprint while dancing it is not the footprint of the travelling separation alone. The width
rule of §3.8 takes the widest separation the couple ever holds, and a carried figure's greatest partner
separation is one of the values that maximum is taken over:

    W = max(c_start, c_travel, c_end, c_scripted) + 2w

where `c_scripted` is the greatest distance between the partners at any moment of any scripted movement in
the series.
The corridor stays a constant-width object that genuinely contains the couple, for the reason §3.8
declines to taper.

### 4.7 Worked examples

Seven figures, chosen because between them they exercise every field.

**Dame** — the most common progression. Leader and follower move half a slot toward each other and meet on
the spoke between, which is why the phase flips.

```
name:  Dame
from:  { Rueda, Casino }       to: { Rueda, Exhibela }      beats: 4
groups:
  - id: leaders
    select:      { role: leader }
    kind:        progression
    destination: [ (grande, -1) ]
    passes:      [ { side: right, of: { midpoint: grande } } ]
  - id: followers
    select:      { role: follower }
    kind:        progression
    destination: [ (grande, +1) ]
    passes:      [ { side: left,  of: { midpoint: grande } } ]
```

Note that nobody names a partner. Leader `k` lands one half-slot anti-clockwise; the follower who began one
slot anti-clockwise lands one half-slot clockwise; those are the same spoke. **The pairing emerges from the
offsets.**

**The two groups declare opposite sides because they travel opposite ways round the centre.** A leader's
`-1` takes him anti-clockwise, which puts the midpoint on his left, which is `side: right` (§4.4). A
follower's `+1` takes her clockwise, the midpoint on her right, which is `side: left`. Each declaration
agrees with the direction that dancer's own offset already implies, so at every ordinary couple count the
pass costs nothing.

Where it earns its place is a one-couple wheel. There are only two half-slot positions, so `+1` and `-1`
land on the *same* one and the offset can no longer say which way round the centre anybody goes. The
sides say it, and they send the two dancers round opposite ways — which is what keeps them apart rather
than sending them head-on through the middle. This is §3.10's rule at its smallest: the offset carries
where you land and how far you wind, the side chooses between the two routes that satisfy it.

**Dame Dos** — the same figure progressing two couples instead of one.

```
name:  Dame Dos
from:  { Rueda, Casino }       to: { Rueda, Exhibela }      beats: 4
groups:
  - id: leaders
    select:      { role: leader }
    kind:        progression
    destination: [ (grande, -3) ]
    passes:      [ { side: right, of: { midpoint: grande } } ]
  - id: followers
    select:      { role: follower }
    kind:        progression
    destination: [ (grande, +1) ]
    passes:      [ { side: left,  of: { midpoint: grande } } ]
```

Twice the distance in the same four beats, so this is the figure that cannot pass anything closely
(§1.4). Nothing in the definition says so — it falls out of the geometry, and the diagram review is where
it is seen. The leader's `-3` is what makes the midpoint pass bind at two couples, where three half-slots
anti-clockwise is most of the way round the wheel (§3.8).

**Dame Dos Pequeña** — the figure that proves offsets must not be reduced.

```
name:  Dame Dos Pequeña
from:  { Línea Moderna, Casino }   to: { Línea Moderna, Exhibela }   beats: 4
groups:
  - id: leaders
    select:      { role: leader }
    kind:        progression
    destination: [ (pequeña, -4) ]
    passes:      [ { side: right, of: { midpoint: pequeña } } ]
  - id: followers
    select:      { role: follower }
    kind:        progression
    destination: [ ]     (the slot they started on, in the arrival slot-position)
    bounded:     false
```

`[ (pequeña, -4) ]` on a two-couple wheel is a **complete circuit**. Every dancer ends on the slot they
started on, and that is not the same as nothing happening: reduce `-4` to `0` and the definition says
"stand still", which is a different movement.

**The two leaders of a mini wheel are in contention for almost the whole figure, and it is one contention
rather than two.** They set off across a wheel that holds only them, meet near the middle a little to one
another's right, and go round the midpoint on opposite sides — and they are still near each other when
they come out of it, because a full circuit brings each of them back past where the other started. Reading
it as "they cross twice, so there are two encounters" describes a wheel with more room in it than this one
has.

**No encounter override is written, and none is expected to be needed.** The derived side (§4.5) is
whichever way the two already favour on their undeviated corridors, and on a symmetric pair that is a
clean answer. If it turns out not to be, this is a figure that will say so loudly during the migration —
which is the evidence §4.5 wants.

**The followers are the example §3.6 promised of a group that is a progression *and* unbounded.** They
stay on their own slot, but the arrival position is not the one they set off from, so the follower's place
moves to the other side of her slot's midpoint and she walks straight across to it. Her journey exists to
leave the arrangement consistent and nothing more, so she is `bounded: false` and a concurrent figure is
welcome to claim her instead. She is **not** scripted: her shape comes from a corridor like any other
progression, and there is nothing prescribed about it.

**The same figure from the Dile Que No position needs one more thing, and it is why `(name, from)` is
the key (§4.1).** `Dame Dos Pequeña` danced from `{ Línea Moderna, Dile Que No }` is a second definition.
There the follower starts gathered on her slot's own spoke and must come round to the Exhibela place, so
she genuinely travels *around* her slot's midpoint rather than straight past it, and which way round is a
real choice the author has to make:

```
  - id: followers
    select:      { role: follower }
    kind:        progression
    destination: [ ]
    passes:      [ { side: right, of: { midpoint: couple } } ]
    bounded:     false
```

Same name, same followers, same destination, different `from` — and the extra declaration exists only
because the geometry she starts in is different.

**Dame Eñe** — a cross-wheel progression, and the figure the previous engine could not resolve.

```
name:  Dame Eñe
from:  { Línea Moderna, Exhibela }   to: { Línea Moderna, Exhibela }   beats: 4
groups:
  - id: outer-leaders
    select:      { role: leader, ring: outer }
    kind:        progression
    destination: [ (pequeña, +2), (grande, +2) ]
    passes:
      - side: left
        of:   { role: leader, position: { pequeña, Casino }, slot: [ (pequeña, +2) ] }
  - id: inner-leaders
    select:      { role: leader, ring: inner }
    kind:        progression
    destination: [ (pequeña, -2) ]
  - id: followers
    select:      { role: follower }
    kind:        scripted
    scripted:    hold
    bounded:     false
```

**The inner leaders declare no pass, and walk straight through the middle of their pequeña.** Their route
is a half circuit of a two-slot wheel, so it runs through that wheel's centre — and a wheel's centre that
nobody has declared is not an obstacle (§3.7). Nobody stands there. Declaring a side would be inventing a
detour, not preventing a collision.

Every offset here is a whole slot, which is `±2` half-slots (§4.3). The inner leaders travel
**anti-clockwise** to their own outer slot; on a two-couple wheel `-2` and `+2` arrive at the same place,
and the sign is written truthfully anyway, because the direction is what the figure means and the wheel it
is danced on is not the only wheel this definition will ever meet.

Every leader place is filled exactly once: each mini wheel's inner leader takes its own outer slot, and its
inner slot is taken by the outer leader of the mini wheel one place anti-clockwise.

**A place has several equally true descriptions, and the author should write the simplest one.** The
dancer the outer leaders route around stands in an inner slot of `{ Línea Moderna, Exhibela }`. Written
the long way that is *the follower's place in `{ grande, Afuera Exhibela }`*. Three rewrites are always
available, and none of them moves anything:

| Rewrite | Why it holds |
|---|---|
| **Drop `Afuera` by swapping the role.** `{ W, Afuera X }` for one role is `{ W, X }` for the other. | The two slot-positions put the same pair of slot-places to the two roles, exchanged (§3.2). |
| **Turn `Exhibela` into `Casino` by swapping the role.** `{ W, Exhibela }` for one role is `{ W, Casino }` for the other. | Same reason — Exhibela is Casino's mirror. |
| **Name a different wheel.** Where a slot belongs to two wheels whose radials point opposite ways, `{ grande, Afuera X }` is `{ pequeña, X }` for the *same* role. | §3.2, and `FORMATIONS.md §2.5`. |

Applying them: `follower, { grande, Afuera Exhibela }` → `follower, { pequeña, Exhibela }` → **`leader,
{ pequeña, Casino }`**, which is what the definition above writes, and which is the same point on the
floor as where it started.

**Prefer Casino, and let the role fall out.** `Afuera` inverts the wheel and `Exhibela` mirrors it; a
reader working out where a place actually is has to hold one transformation in their head for each, and
both at once is worse than twice as hard. Casino is the arrangement every dancer pictures without effort.
So wherever the choice is free — and by the table above it nearly always is — **write the Casino form**.
The engine treats all four descriptions as one place, so nothing about the figure changes; the difference
is entirely in how long a person takes to read it, which is the only thing this notation is for.

**The engine says so, rather than leaving it to the author to remember.** Every place address is
normalised and checked: where an address names `Afuera` or `Exhibela` and a simpler equivalent exists,
the engine **reports the address and offers the simpler form**. It is a suggestion and never a rewrite —
the two descriptions are the same point, so nothing is wrong and nothing is corrected — but leaving the
harder-to-read form in place silently is how a definition becomes something nobody wants to open. The
authoring skill (§4.8) puts the same suggestion in front of the author as they write.

**The followers hold, and holding is now something they say rather than something a keyword says for
them.** `kind: scripted` with a scripted movement that stays on the spot makes them immovable — which is
what this figure needs, because their places are the static features the outer leaders route around, and a
follower who stepped aside to be helpful would move the very thing the corridor was declared against. They
are `bounded: false` because nothing about Dame Eñe requires *these* dancers to be the ones holding, so a
concurrent figure may claim them (§3.6).

This definition declares **no priority and no encounter overrides**. That is not because none are needed —
it is because the engine has not yet been asked. Running it will surface whatever contention exists
between the outer and inner leaders, and the author answers then (§4.8). A definition is complete when it
is *syntactically* total, not when it is collision-free.

**Línea Moderna** — a formation change, and the plainest use of a hop.

```
name:  Línea Moderna
from:  { Rueda, Casino }       to: { Línea Moderna, Casino }     beats: 8
groups:
  - id: primeros
    select:      { parity: even }
    unit:        couple
    kind:        progression
    extra turns: { turns: 1, direction: anticlockwise }
    destination: { walk: [ (grande, +2) ], hop: Rueda → Línea Moderna, walk: [ (pequeña, +2) ] }
  - id: segundos
    select:      { parity: odd }
    unit:        couple
    kind:        progression
    destination: { walk: [ ],              hop: Rueda → Línea Moderna, walk: [ ] }
```

The segundos hop from where they stand. Each primero walks one couple clockwise in the Rueda — `+2`
half-slots — to the segundo it will share a mini wheel with, hops onto that outer slot, and steps to the
inner slot of its pequeña.

**The primeros are `parity: even` because the Cantante is one of them.** Parity is the parity of a
couple's distance from the Cantante (§3.5), the Cantante's own couple is at distance `0`, and the Cantante
leads the primeros in. The segundos are the couples between them, at odd distances.

**Neither group declares how far it turns, and neither could.** The primeros do turn, into the inner ring,
while the segundos walk straight out along their own spokes without turning at all — but *how far* the
primeros turn depends on the couple count. A primero starts one slot clockwise of where it will land,
which is `360/n` degrees of head start, and **`n` is not something a figure definition is allowed to
know**. Written as a constant the figure would be right at one couple count and wrong at every other, and
a figure whose correctness depends on the number of dancers is exactly what this language exists to make
impossible.

So the engine derives it from the two slot orientations (§4.6). What the figure says is only **which way
round**, and it says it in the one way it can: a whole turn.

The derived turn is resolved **clockwise** (§4.6), and the primeros' tight turn is anti-clockwise — at
four couples they turn 90° anti-clockwise, which is the derived 270° clockwise less one whole revolution.
So `Línea Moderna` is the figure that declares `extra turns`, and `Adios Línea` below — the one that
sweeps the long way round — is the figure that declares nothing at all. That is the right way round even
though it reads backwards: the Adios *is* the plain clockwise sweep, and the tight anti-clockwise turn is
the deliberate deviation from it.

**Dame Línea** — the same formation change, with a partner exchange.

```
name:  Dame Línea
from:  { Rueda, Casino }       to: { Línea Moderna, Exhibela }   beats: 4
groups:
  - id: primero-leaders
    select:      { role: leader,   parity: even }
    kind:        progression
    destination: { walk: [ (grande, +1) ], hop: Rueda → Línea Moderna, walk: [ (pequeña, +2) ] }
  - id: segundo-followers
    select:      { role: follower, parity: odd }
    kind:        progression
    destination: { walk: [ (grande, -1) ], hop: Rueda → Línea Moderna, walk: [ (pequeña, +2) ] }
  - id: segundo-leaders
    select:      { role: leader,   parity: odd }
    kind:        progression
    destination: { walk: [ (grande, -1) ], hop: Rueda → Línea Moderna, walk: [ ] }
  - id: primero-followers
    select:      { role: follower, parity: even }
    kind:        progression
    destination: { walk: [ (grande, +1) ], hop: Rueda → Línea Moderna, walk: [ ] }
```

This is the figure that shows what a hop deliberately does not know. A segundo leader at half-slot
position `2p+2` dances his ordinary Dame of `-1` and arrives at `2p+1`; the primero follower at `2p` walks
`+1` and arrives at the same place. **They hop together, and are the new outer couple.** The primero leader
and the segundo follower do the same and are the new inner couple.

**The partner exchange required nothing of the hop.** It fell out of two groups landing on one slot, which
is the reason a hop maps slots and not dancers: who is standing where is not its business, and it never
has to be told.

Note also that all four groups hop from positions of the *other* phase — `2p+1`, which at rest nobody
stands on — while `Línea Moderna` above hops from the segundos' own slots. One hop, two rotations of its
`from` set, exactly as *Which rotation of `from`* in §4.3 requires. Four figures, two directions of
travel, and one two-line object between the two formations.

**Four beats, like the rest of the Dame family.** The existing engine dances this in two and back-times
the call to suit; the change to four is §1.4's, taken for the same reason as the others, and it moves the
figure's start beat rather than anything about the figure.

**Adios Línea** — `Línea Moderna` without its turn, which is the whole difference between them.

```
name:  Adios Línea
from:  { Rueda, Casino }       to: { Línea Moderna, Casino }     beats: 8
groups:
  - id: primeros
    select:      { parity: even }
    unit:        couple
    kind:        progression
    destination: { walk: [ (grande, +2) ], hop: Rueda → Línea Moderna, walk: [ (pequeña, +2) ] }
  - id: segundos
    select:      { parity: odd }
    unit:        couple
    kind:        progression
    destination: { walk: [ ],              hop: Rueda → Línea Moderna, walk: [ ] }
```

**Every line is `Línea Moderna`'s except one**, and that is the whole point of the field. The primeros'
turn is derived either way; `Línea Moderna` spends a whole anti-clockwise turn to take the tight route,
and this figure spends nothing and sweeps the long way clockwise into **exactly the same place, facing
exactly the same direction**. `extra turns` cannot change where anybody ends up or how they are oriented
when they get there, so a reader holding the two definitions side by side can see the entire difference
between the two dances on one line.

The segundos are written out unchanged rather than left off, because a figure mentions every dancer
(§4.2). Side by side, that repetition is what makes the single differing line visible.

**A test case, stated here because it is the only concrete number in this part of the document.** §4.6
derives the turn by subtracting the starting slot's orientation from the arrival slot's and resolving the
result clockwise. **At four couples that subtraction must come out at 270°** — because the primeros' tight
turn is 90° anti-clockwise, and 270° clockwise is the same arrival one whole revolution the other way.

It is worth writing down because it can fail in a way that looks like success. If an implementation
derives some other angle, both figures above still *run*: the primeros still arrive in the right slot
facing the right way, because `extra turns` cannot make them arrive wrong. They simply spin the wrong
amount getting there, and `Línea Moderna` and `Adios Línea` become the same dance, or swap. §14 carries
this as a verification case rather than leaving it to be noticed on a diagram.

### 4.8 What the author states, and what the engine works out

| The author states | The engine derives |
|---|---|
| The groups, and each one's kind of movement | Which dancers each group selects, at each couple count |
| The walks either side of a hop | The slot correspondence itself, and where the ending formation sits |
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

**That loop runs in an agentic chat before it runs in a user interface.** The interface described in
`ROADMAP.md` is later work and nothing here waits for it. Until it exists an author defines a figure by
talking to an agent, and that conversation is guided by **a skill shipped as part of this work** — it is an
item in the implementation plan (§15), not a document to be written afterwards.

What the skill owes the author:

- **An order that is easy to think in.** Groups, then destinations, then static passes, then the questions
  the engine could not answer for itself. That is the order to present, because it is the order the
  decisions actually depend on each other in.
- **No step that locks.** The order is a guide and never a gate. At any point the author may go back and
  change an earlier answer — restate a destination, add a static point, remove one, reorder a priority,
  flip a side — and the definition is recomputed from the changed answer. Nothing becomes immutable
  because the conversation moved past it.
- **The consequence of every change, shown.** After an edit the agent recomputes the corridors and reports
  what moved: which contentions appeared, which disappeared, which of the author's existing answers are
  now unused, and which new questions the edit created.
- **The definition legible as data at any moment.** The author can ask what the definition currently says
  and get it in the form of §4.1 — not a transcript of how it was arrived at.
- **The simpler way of saying the same thing, offered.** Where a place address names `Afuera` or
  `Exhibela` and an equivalent Casino form exists (§4.7), the agent shows it and asks whether to use it.
  Never silently: the two are the same point, so this is about how the definition reads a year from now,
  and that is the author's call rather than the tool's.
- **Silence about anything it can decide.** The agent asks only where the engine cannot answer honestly
  (§4.5's dead band, near-equal corridors, a collision it could not resolve), and never asks twice.

An answer that a later edit makes unused is **kept and marked unused**, not deleted — for the same reason
§3.8 keeps declarations that do not bind. The edit may be undone, or another couple count may bring the
contention back, and an answer the author already gave should not have to be given again.

---

## Status and handover

**Written and reviewed:** §1 Purpose · §2 How we got here · §3 The model · §4 The figure definition
language. Every section to the end of §4 has been read and revised, and the text above is the state those
revisions left it in.

This document carried a *review status* section while that was happening, listing which sections had been
read and which had been edited afterwards. It has been removed rather than allowed to go stale: with §1–§4
read in full it would say only that, and a section whose sole content is "everything above is current" is
a thing to maintain rather than a thing to use. §5 onwards is unwritten, which is the only status
distinction still worth drawing, and this section draws it.

**Outstanding, in order:** §5 Geometry and constants · §6 From corridor to path · §7 Timing · §8 Declared
versus derived · §9 Edge cases · §10 Failure · §11 The renderer contract · §12 Alternatives considered and
rejected · §13 Scripted movements, and what the engine reads from one · §14 Verification · §15
Implementation plan — including the authoring skill of §4.8, the `MOVEMENTS` → `FIGURES` rename, and
carrying that same rename into what the interface shows a user · §16 Open questions.

Then `SCHEDULING.md` in full.

**Read first:** `FORMATIONS.md`, which this document depends on for how a formation is structured and
addressed, and `ROADMAP.md` for where this work sits in the larger picture.

**Still open, and needing an answer before the sections that use them:**

- How a wheel's placement is stated in general (`FORMATIONS.md §6`).
- Whether the corridor work lands on top of the module split that exists on two unmerged branches, which
  would change every file path in §15 but nothing in the design.
- The verification corpus: how many diagrams constitute the first review pass, against the full corpus of
  roughly 357 figure cases.
- **Whether §4.5 survives at all.** Priority and encounter overrides exist because the derived answers
  might not always be right. The migration is the experiment that settles it, and §4.5 says what evidence
  would retire them.
- **Winding about a named point.** §3.4 carries winding in the magnitude of an offset, which works because
  the offset is counted on a wheel. `ROADMAP.md` records the agreed requirement that a figure be able to
  **name** the point it goes round rather than inherit it from the wheel it is danced on, for formations
  that have no wheel there. Nothing in §4 expresses it yet. Not blocking §5, but §5's account of how a
  taut path realises winding should be written so that it takes a named point without changing shape.
