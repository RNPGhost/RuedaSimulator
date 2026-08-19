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
3. **Candidates.** The planner builds its own candidate set: every pair of dancers except partners inside
   one rigid unit. It does not accept a caller's list, because a caller that supplies its own list will
   eventually omit a pair.
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
| **The planner builds its own candidate set** | A caller supplying its own pair list will eventually omit a pair, and an omitted pair usually clears anyway — so the omission is invisible until the day it isn't. Narrowing the candidate set once left every behavioural check green while leaving two dancers 10.5px apart. |
| **Coverage is part of the contract** | The *size* of the candidate set is asserted directly by a test, not inferred from what the dancers did. A collision test can only find what it looked at. |
| **Units, not dancers, as free variables** | A bonded couple must deviate as one body. When this was per-dancer, a couple travelling to Línea was stretched 32px apart — which is a couple pulled in half, not a couple avoiding someone. |
| **Constraints re-derived every pass** | From attempt two. A constraint may bind only while the geometry it describes is actually violated. Never carry a resolution forward as state. |
| **Innermost-first resolution order** | A collision near the centre pushes its dancers outward and forces the outer pairs to move; resolving from the centre out means each outer pair answers an arrangement that is not about to change underneath it. |
| **Faults are reported, never swallowed** | A solve that cannot hold its corridor records the failure. Returning a silent best-effort is how two dancers end up sharing a spot with nothing in the logs. |
| **The planner and the renderer must agree** | If the renderer reconstructs a curve between sampled points, the drawn path is not the planned path, and the thing verified is not the thing shown. See §11. |
